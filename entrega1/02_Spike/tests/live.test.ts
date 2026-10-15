import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import {
  FetchHttp,
  OrsAdapter,
  PublicPrices,
} from "../src/adapters/providers.ts";
import type { HttpPort, Place, GeocodedPlace } from "../src/domain/types.ts";

// Observe real responses without recording credentials or replacing the provider.
class ObservedHttp implements HttpPort {
  responses = new Map<string, any>();
  constructor(private report: (message: string) => void) {}
  async json(url: string, init: RequestInit = {}) {
    const endpoint = new URL(url);
    const label = `${init.method ?? "GET"} ${endpoint.host}${endpoint.pathname}`;
    const started = performance.now();
    try {
      const data = await new FetchHttp().json(url, init);
      this.responses.set(endpoint.host + endpoint.pathname, data);
      this.report(
        `${label} · respuesta JSON recibida · ${Math.round(performance.now() - started)} ms`,
      );
      return data;
    } catch (error) {
      this.report(`${label} · consulta fallida`);
      throw error;
    }
  }
}
const from: Place = {
  id: "centro",
  name: "Centro",
  lat: 39.9864,
  lon: -0.0513,
  favorite: false,
};
const to: Place = {
  id: "uji",
  name: "UJI",
  lat: 39.9946,
  lon: -0.0684,
  favorite: false,
};
function ors(t: TestContext) {
  assert.ok(
    process.env.ORS_API_KEY,
    "Configura ORS_API_KEY en .env para comprobar OpenRouteService.",
  );
  const http = new ObservedHttp((message) => t.diagnostic(message));
  return { adapter: new OrsAdapter(process.env.ORS_API_KEY, http), http };
}
function geographic(point: { lat: number; lon: number }) {
  assert.ok(Number.isFinite(point.lat) && Math.abs(point.lat) <= 90);
  assert.ok(Number.isFinite(point.lon) && Math.abs(point.lon) <= 180);
}

test(
  "API-01 ORS busca un topónimo y devuelve nombres y coordenadas",
  { timeout: 45000 },
  async (t) => {
    const { adapter } = ors(t);
    const places: GeocodedPlace[] = await adapter.search(
      "Universitat Jaume I, Castellón",
    );
    assert.ok(places.length > 0);
    for (const place of places) {
      geographic(place);
      assert.ok(place.name.trim());
    }
    assert.ok(
      places.some(
        (p) => Math.abs(p.lat - to.lat) < 0.2 && Math.abs(p.lon - to.lon) < 0.2,
      ),
    );
    t.diagnostic(
      `${places.length} candidatos · primer resultado ${places[0].name}`,
    );
  },
);

test(
  "API-02 ORS identifica un lugar a partir de coordenadas",
  { timeout: 45000 },
  async (t) => {
    const { adapter, http } = ors(t);
    const place = await adapter.reverse(from.lat, from.lon);
    const raw = http.responses.get("api.openrouteservice.org/geocode/reverse");
    assert.ok(
      raw?.features?.length > 0,
      "Debe responder el servicio inverso, sin recurrir al nombre de reserva.",
    );
    geographic(place);
    assert.ok(place.name.trim());
    assert.ok(
      Math.abs(place.lat - from.lat) < 0.05 &&
        Math.abs(place.lon - from.lon) < 0.05,
    );
    t.diagnostic(`Lugar recibido ${place.name}`);
  },
);

for (const [index, mode, label] of [
  ["03", "car", "coche"],
  ["04", "bike", "bicicleta"],
  ["05", "foot", "a pie"],
] as const) {
  test(
    `API-${index} ORS devuelve una ruta para el modo ${label} con trazado, distancia y duración`,
    { timeout: 90000 },
    async (t) => {
      const { adapter } = ors(t);
      const routes = await adapter.routes(from, to, mode);
      assert.ok(routes.length > 0);
      for (const route of routes) {
        assert.ok(Number.isFinite(route.distance) && route.distance > 0);
        assert.ok(Number.isFinite(route.duration) && route.duration > 0);
        assert.ok(Array.isArray(route.geometry) && route.geometry.length >= 2);
        for (const [lon, lat] of route.geometry) geographic({ lat, lon });
        const first = route.geometry[0],
          last = route.geometry.at(-1)!;
        assert.ok(
          Math.abs(first[0] - from.lon) < 0.02 &&
            Math.abs(first[1] - from.lat) < 0.02,
        );
        assert.ok(
          Math.abs(last[0] - to.lon) < 0.02 &&
            Math.abs(last[1] - to.lat) < 0.02,
        );
        assert.ok(
          route.steps.length > 0 && route.steps.every((step) => step.trim()),
        );
      }
      t.diagnostic(
        `${routes.length} alternativas · ${routes[0].distance} m · ${routes[0].duration} s`,
      );
    },
  );
}

const pricesHttp = new ObservedHttp((message) => console.log(message));
let priceRequest: ReturnType<PublicPrices["current"]> | undefined;
const prices = () => (priceRequest ??= new PublicPrices(pricesHttp).current());

test(
  "API-06 MITECO devuelve gasolina y diésel con fecha y precios en euros por litro",
  { timeout: 45000 },
  async (t) => {
    const result = await prices();
    const raw = pricesHttp.responses.get(
      "sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/",
    );
    assert.ok(
      raw?.ListaEESSPrecio?.length > 0,
      "MITECO debe responder por separado.",
    );
    assert.ok(typeof raw.Fecha === "string" && raw.Fecha.trim());
    assert.ok(
      typeof result.petrol === "number" &&
        Number.isFinite(result.petrol) &&
        result.petrol > 0,
    );
    assert.ok(
      typeof result.diesel === "number" &&
        Number.isFinite(result.diesel) &&
        result.diesel > 0,
    );
    assert.ok(result.source.includes("MITECO"));
    t.diagnostic(
      `${raw.ListaEESSPrecio.length} estaciones · fecha ${raw.Fecha} · gasolina ${result.petrol} €/l · diésel ${result.diesel} €/l`,
    );
  },
);

test(
  "API-07 REE devuelve precios con fecha y convierte euros por MWh a euros por kWh",
  { timeout: 45000 },
  async (t) => {
    const result = await prices();
    const raw = pricesHttp.responses.get(
      "apidatos.ree.es/es/datos/mercados/precios-mercados-tiempo-real",
    );
    assert.ok(
      raw?.data && Array.isArray(raw.included),
      "REE debe responder por separado.",
    );
    const series =
      raw.included.find((s: any) => /tiempo real/i.test(s.type)) ??
      raw.included.find((s: any) => /spot/i.test(s.type));
    assert.ok(
      series?.attributes?.values?.length > 0,
      "La respuesta debe incluir la serie de precios.",
    );
    const values = series.attributes.values;
    assert.ok(
      values.every(
        (v: any) =>
          Number.isFinite(v.value) && Number.isFinite(Date.parse(v.datetime)),
      ),
    );
    const mean =
      values.reduce((sum: number, v: any) => sum + v.value, 0) / values.length;
    assert.ok(
      typeof result.electric === "number" && Number.isFinite(result.electric),
    );
    assert.ok(Math.abs(result.electric - mean / 1000) < 1e-10);
    assert.ok(result.source.includes("REE"));
    t.diagnostic(
      `${values.length} valores con fecha · primer dato ${values[0].datetime} · media ${mean} €/MWh · ${result.electric} €/kWh`,
    );
  },
);

test(
  "API-08 OpenStreetMap entrega una imagen PNG para el mapa de Leaflet",
  { timeout: 30000 },
  async (t) => {
    const zoom = 12,
      scale = 2 ** zoom;
    const x = Math.floor(((from.lon + 180) / 360) * scale);
    const radians = (from.lat * Math.PI) / 180;
    const y = Math.floor(
      ((1 - Math.asinh(Math.tan(radians)) / Math.PI) / 2) * scale,
    );
    const url = `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Via-EI1039-EI1048-Spike/0.1 (+https://github.com/Kiliansito/ei1039-ei1048-movilidad)",
      },
      signal: AbortSignal.timeout(18000),
    });
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /image\/png/);
    const data = Buffer.from(await response.arrayBuffer());
    assert.deepEqual(
      data.subarray(0, 8),
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    );
    assert.equal(data.readUInt32BE(16), 256);
    assert.equal(data.readUInt32BE(20), 256);
    t.diagnostic(
      `GET ${url} · HTTP ${response.status} · PNG de 256 por 256 píxeles · ${data.length} bytes`,
    );
  },
);
