import { test } from "node:test";
import assert from "node:assert/strict";
import {
  OrsAdapter,
  PublicPrices,
  CachedPrices,
} from "../src/adapters/providers.ts";
test("Given ORS GeoJSON When planning Then coordinates and instructions normalized", async () => {
  const calls: any[] = [];
  const http = {
    json: async (url: string, init: any) => {
      assert.equal(init.headers.Accept, "application/geo+json");
      calls.push(JSON.parse(init.body));
      return {
        features: [
          {
            geometry: {
              coordinates: [
                [0, 39],
                [1, 40],
              ],
            },
            properties: {
              summary: { distance: 120, duration: 30 },
              segments: [{ steps: [{ instruction: "Sigue recto" }] }],
            },
          },
        ],
      };
    },
  };
  const ors = new OrsAdapter("fake", http);
  const routes = await ors.routes(
    { lat: 39, lon: 0 } as any,
    { lat: 40, lon: 1 } as any,
    "bike",
  );
  assert.equal(routes[0].distance, 120);
  assert.deepEqual(routes[0].steps, ["Sigue recto"]);
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[0].coordinates, [
    [0, 39],
    [1, 40],
  ]);
});
test("Given external malformed data When routing Then reject instead of inventing geometry", async () => {
  const ors = new OrsAdapter("fake", { json: async () => ({}) });
  await assert.rejects(() =>
    ors.routes({ lat: 39, lon: 0 } as any, { lat: 40, lon: 1 } as any, "car"),
  );
});
test("Given government prices When converting Then electricity changes MWh to kWh", async () => {
  const p = new PublicPrices({
    json: async (url: string) =>
      url.includes("Carburantes")
        ? {
            Fecha: "23/09/2026",
            ListaEESSPrecio: [
              { "Precio Gasolina 95 E5": "1,600", "Precio Gasoleo A": "1,500" },
            ],
          }
        : {
            included: [
              {
                type: "Precio mercado spot",
                attributes: {
                  values: [{ value: 200, datetime: "2026-09-23" }],
                },
              },
            ],
          },
  });
  const v = await p.current();
  assert.equal(v.petrol, 1.6);
  assert.equal(v.diesel, 1.5);
  assert.equal(v.electric, 0.2);
});
test("Given provider outage When fetching prices Then missing values remain null", async () => {
  const p = new PublicPrices({
    json: async () => {
      throw new Error("offline");
    },
  });
  assert.equal((await p.current()).petrol, null);
});
test("Given cache When requesting twice Then only one underlying call", async () => {
  let count = 0;
  const p = new CachedPrices({
    current: async () => {
      count++;
      return {
        petrol: 1.6,
        diesel: 1.5,
        electric: 0.2,
        source: "fixture",
        estimated: true,
      };
    },
  });
  await Promise.all([p.current(), p.current()]);
  await p.current();
  assert.equal(count, 1);
});
test("Given transient provider failure When retry succeeds Then return real response", async () => {
  const { FetchHttp } = await import("../src/adapters/providers.ts");
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () =>
    ++calls === 1
      ? new Response("{}", { status: 503 })
      : Response.json({ features: [] });
  try {
    assert.deepEqual(await new FetchHttp().json("https://example.test"), {
      features: [],
    });
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = original;
  }
});
test("Given unreachable routing point When provider rejects Then show actionable message without retry", async () => {
  const { FetchHttp } = await import("../src/adapters/providers.ts");
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return Response.json({ error: { code: 2010 } }, { status: 404 });
  };
  try {
    await assert.rejects(
      () => new FetchHttp().json("https://example.test"),
      /vía cercana/,
    );
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = original;
  }
});
test("Given provider quota exceeded as HTTP 403 When requesting a route Then report quota rather than an invalid key", async () => {
  const { FetchHttp } = await import("../src/adapters/providers.ts");
  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    Response.json({ error: "Quota exceeded" }, { status: 403 });
  try {
    await assert.rejects(
      () => new FetchHttp().json("https://example.test"),
      /límite de consultas/,
    );
  } finally {
    globalThis.fetch = original;
  }
});
test("Given identical routes requested concurrently When cached Then coalesce requests, isolate returned values, and expire", async () => {
  const { CachedRouting } = await import("../src/adapters/providers.ts");
  let calls = 0,
    now = 0;
  const routing = new CachedRouting(
    {
      routes: async () => {
        calls++;
        return [
          {
            distance: 10,
            duration: 20,
            geometry: [
              [0, 39],
              [0.1, 39.1],
            ],
            steps: ["Continúa"],
          },
        ];
      },
    },
    1000,
    () => now,
  );
  const from = { id: "a", name: "A", lat: 39, lon: 0, favorite: false };
  const to = { ...from, id: "b", lat: 39.1 };
  const [a, b] = await Promise.all([
    routing.routes(from, to, "car"),
    routing.routes(from, to, "car"),
  ]);
  assert.equal(calls, 1);
  a[0].geometry[0][0] = 9;
  assert.equal(b[0].geometry[0][0], 0);
  assert.equal((await routing.routes(from, to, "car"))[0].geometry[0][0], 0);
  assert.equal(calls, 1);
  await routing.routes(from, to, "bike");
  assert.equal(calls, 2);
  now = 1001;
  await routing.routes(from, to, "car");
  assert.equal(calls, 3);
});
test("Given a failed route query When trying again Then errors are not cached", async () => {
  const { CachedRouting } = await import("../src/adapters/providers.ts");
  let calls = 0;
  const routing = new CachedRouting({
    routes: async () => {
      if (++calls === 1) throw new Error("offline");
      return [];
    },
  });
  const place = { id: "a", name: "A", lat: 39, lon: 0, favorite: false };
  await assert.rejects(() => routing.routes(place, place, "car"));
  assert.deepEqual(await routing.routes(place, place, "car"), []);
  assert.equal(calls, 2);
});
