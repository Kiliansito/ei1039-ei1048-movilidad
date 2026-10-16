import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  mkdtempSync,
  rmSync,
  renameSync,
  mkdirSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { MobilityService } from "../../src/services.ts";
import { SqliteRepository } from "../../src/repository.ts";
import {
  OrsAdapter,
  CachedRouting,
  PublicPrices,
} from "../../src/adapters/providers.ts";
import { AppError } from "../../src/domain/types.ts";
import type {
  User,
  VehicleType,
  RoutingPort,
  GeocodingPort,
  PricePort,
} from "../../src/domain/types.ts";

export type Dependencies = {
  routing: RoutingPort;
  geocoder: GeocodingPort;
  prices: PricePort;
};
export const realDependencies = (): Dependencies => {
  const ors = new OrsAdapter(process.env.ORS_API_KEY ?? "");
  return {
    routing: new CachedRouting(ors),
    geocoder: ors,
    prices: new PublicPrices(),
  };
};
export const controlledDependencies = (): Dependencies => ({
  routing: {
    routes: async (a, b) => [
      {
        distance: 4200,
        duration: 1800,
        geometry: [
          [a.lon, a.lat],
          [-0.06, 39.99],
          [b.lon, b.lat],
        ],
        steps: [],
      },
      {
        distance: 5000,
        duration: 1200,
        geometry: [
          [a.lon, a.lat],
          [-0.07, 39.99],
          [b.lon, b.lat],
        ],
        steps: [],
      },
    ],
  },
  geocoder: {
    search: async () => [
      { name: "Universitat Jaume I", lat: 39.9946, lon: -0.0684 },
    ],
    reverse: async (lat, lon) => ({ name: "Universitat Jaume I", lat, lon }),
  },
  prices: {
    current: async () => ({
      petrol: 1.6,
      diesel: 1.5,
      electric: 0.2,
      source: "Doble de prueba",
      estimated: true,
    }),
  },
});

class Fixture {
  dir = mkdtempSync(join(tmpdir(), "via-acceptance-"));
  path = join(this.dir, "via.sqlite");
  repo = new SqliteRepository(this.path);
  app: MobilityService;
  user?: User;
  token = "";
  open = true;
  constructor(
    public dependencies: Dependencies,
    register = true,
  ) {
    this.app = new MobilityService({ repo: this.repo, ...dependencies });
    if (register) {
      this.user = this.app.register({
        name: "Ana",
        email: "ana@example.com",
        password: "RutaSegura2026",
      });
      this.token = this.app.login({
        email: "ana@example.com",
        password: "RutaSegura2026",
      }).token;
    }
  }
  get u() {
    assert.ok(this.user);
    return this.user;
  }
  state() {
    return this.app.state(this.u.id);
  }
  close() {
    if (this.open) {
      this.repo.close();
      this.open = false;
    }
  }
  reopen() {
    this.close();
    this.repo = new SqliteRepository(this.path);
    this.open = true;
    this.app = new MobilityService({ repo: this.repo, ...this.dependencies });
  }
  dispose() {
    this.close();
    rmSync(this.dir, { recursive: true, force: true });
  }
  places() {
    const saved = this.state().places;
    const a = saved.find((p) => p.name === "Centro"),
      b = saved.find((p) => p.name === "UJI");
    if (a && b) return [a, b];
    return [
      this.app.addPlace(this.u.id, {
        name: "Centro",
        lat: 39.9864,
        lon: -0.0513,
      }),
      this.app.addPlace(this.u.id, { name: "UJI", lat: 39.9946, lon: -0.0684 }),
    ];
  }
  vehicle(type: VehicleType = "petrol") {
    return this.app.saveVehicle(this.u.id, {
      name: type === "electric" ? "Eléctrico" : "Compacto",
      type,
      consumption: type === "electric" ? 15 : 6,
    });
  }
  other() {
    return this.app.register({
      name: "Luis",
      email: "luis@example.com",
      password: "OtraRuta2026",
    });
  }
  async plan(
    mode: "car" | "foot" | "bike" = "foot",
    type: VehicleType = "petrol",
    preference = "fastest",
    reverse = false,
  ) {
    const [a, b] = this.places();
    const v = mode === "car" ? this.vehicle(type) : undefined;
    this.app.preferences(this.u.id, { useManualPrices: true });
    return this.app.plan(this.u.id, {
      from: reverse ? b.id : a.id,
      to: reverse ? a.id : b.id,
      mode,
      vehicleId: v?.id,
      preference,
    });
  }
  async saved(name = "Camino a clase") {
    const p = await this.plan("foot", "petrol", "fastest", name === "Paseo");
    return persisted(
      this.app.saveRoute(this.u.id, { planId: p.planId, index: 0, name }),
    );
  }
}

const persisted = <T>(value: T): T => JSON.parse(JSON.stringify(value));

type Case = {
  id: string;
  run: (f: Fixture, t: TestContext) => void | Promise<void>;
  fresh?: boolean;
};
const cases: Case[] = [];
const scenario = (id: string, run: Case["run"], fresh = false) =>
  cases.push({ id, run, fresh });
const unchanged = (f: Fixture, action: () => unknown) => {
  const before = f.state();
  assert.throws(action);
  assert.deepEqual(f.state(), before);
};
const validRoute = (r: any) => {
  assert.ok(r.distance > 0 && r.distance < 100000);
  assert.ok(r.duration > 0);
  assert.ok(r.geometry.length >= 2);
  for (const [lon, lat] of r.geometry) {
    assert.ok(Number.isFinite(lat) && Math.abs(lat) <= 90);
    assert.ok(Number.isFinite(lon) && Math.abs(lon) <= 180);
  }
};

scenario(
  "01-V",
  (f) => {
    assert.equal(f.repo.findUser("ana@example.com"), null);
    const u = f.app.register({
      name: "Ana",
      email: "ana@example.com",
      password: "RutaSegura2026",
    });
    assert.ok(u.id);
    assert.equal(u.name, "Ana");
    assert.equal("password" in u, false);
    const stored = f.repo.findUser(u.email);
    assert.ok(stored);
    assert.equal(stored.id, u.id);
    const db = new DatabaseSync(f.path, { readOnly: true });
    try {
      assert.equal(db.prepare("SELECT COUNT(*) AS n FROM users").get()!.n, 1);
    } finally {
      db.close();
    }
  },
  true,
);
scenario("01-I", (f) => {
  const before = f.repo.findUser(f.u.email);
  assert.throws(() =>
    f.app.register({
      name: "Ana2",
      email: f.u.email,
      password: "OtraClave2026",
    }),
  );
  assert.deepEqual(f.repo.findUser(f.u.email), before);
});
scenario("02-V", (f) => {
  const l = f.other();
  f.app.addPlace(l.id, { name: "Estación", lat: 39.9885, lon: -0.051 });
  const s = f.app.login({ email: f.u.email, password: "RutaSegura2026" });
  const state = f.app.stateForSession(s.token);
  assert.equal(state.user.id, f.u.id);
  assert.deepEqual(state.places, []);
});
scenario("02-I", (f) => {
  const before = f.state();
  assert.throws(
    () => f.app.login({ email: f.u.email, password: "OtraClave2026" }),
    /Credenciales/,
  );
  assert.deepEqual(f.state(), before);
  assert.ok(f.app.session(f.token));
});
scenario("03-V", (f) => {
  f.places();
  const before = f.state();
  f.app.logout(f.token);
  assert.equal(f.app.session(f.token), null);
  assert.throws(
    () => f.app.stateForSession(f.token),
    (e) => e instanceof AppError && e.status === 401,
  );
  assert.deepEqual(f.state(), before);
});
scenario("03-I", (f) => {
  const before = f.state();
  assert.throws(() => f.app.logout("S0"));
  assert.throws(
    () => f.app.stateForSession("S0"),
    (e) => e instanceof AppError && e.status === 401,
  );
  assert.ok(f.app.session(f.token));
  assert.deepEqual(f.state(), before);
});
scenario("04-V", async (f) => {
  await f.saved();
  f.vehicle();
  const l = f.other();
  const other = f.app.state(l.id);
  f.app.deleteAccount(f.u.id, "RutaSegura2026");
  assert.equal(f.repo.getUser(f.u.id), null);
  assert.equal(f.app.session(f.token), null);
  for (const kind of ["places", "vehicles", "routes"] as const)
    assert.deepEqual(f.repo.list(f.u.id, kind), []);
  assert.deepEqual(f.repo.getPreferences(f.u.id), {});
  assert.deepEqual(f.app.state(l.id), other);
});
scenario("04-I", async (f) => {
  await f.saved();
  f.vehicle();
  unchanged(f, () => f.app.deleteAccount(f.u.id, "OtraClave2026"));
  assert.ok(f.app.session(f.token));
});
scenario("05-V", (f) => {
  const p = f.app.addPlace(f.u.id, {
    name: "Centro",
    lat: 39.9864,
    lon: -0.0513,
  });
  assert.deepEqual(f.state().places, [p]);
  assert.equal(p.lat, 39.9864);
  assert.equal(p.lon, -0.0513);
});
scenario("05-I", (f) =>
  unchanged(f, () =>
    f.app.addPlace(f.u.id, { name: "Centro", lat: 91, lon: -0.0513 }),
  ),
);
scenario("06-V", async (f) => {
  const results = await f.app.searchPlaces("Universitat Jaume I, Castellón");
  assert.ok(results.length);
  const selected = results[0];
  const p = f.app.addPlace(f.u.id, { ...selected, name: "UJI" });
  assert.equal(p.lat, selected.lat);
  assert.equal(p.lon, selected.lon);
  assert.equal(p.name, "UJI");
  assert.deepEqual(f.state().places, [p]);
});
scenario("06-I", async (f) => {
  const before = f.state();
  await assert.rejects(() => f.app.searchPlaces("   "));
  assert.deepEqual(f.state(), before);
});
scenario("07-V", (f) => {
  const places = f.places();
  const l = f.other();
  f.app.addPlace(l.id, { name: "Estación", lat: 39.9885, lon: -0.051 });
  assert.deepEqual(f.app.stateForSession(f.token).places, places);
});
scenario("07-I", (f) => {
  f.places();
  assert.throws(
    () => f.app.stateForSession("S0"),
    (e) => e instanceof AppError && e.status === 401,
  );
});
scenario("08-V", (f) => {
  const [a, b] = f.places();
  f.app.remove(f.u.id, "places", a.id);
  assert.deepEqual(f.state().places, [b]);
  assert.equal(f.repo.get(f.u.id, "places", a.id), null);
});
scenario("08-I", (f) => {
  const l = f.other();
  const p = f.app.addPlace(l.id, {
    name: "Estación",
    lat: 39.9885,
    lon: -0.051,
  });
  unchanged(f, () => f.app.remove(f.u.id, "places", p.id));
  assert.deepEqual(f.app.state(l.id).places, [p]);
});
scenario("09-V", (f) => {
  const p = f.app.addPlace(f.u.id, {
    name: "Centro",
    lat: 39.9864,
    lon: -0.0513,
  });
  assert.ok(f.state().places.some((x) => x.id === p.id));
  assert.equal(p.lat, 39.9864);
  assert.equal(p.lon, -0.0513);
});
scenario("09-I", (f) =>
  unchanged(f, () => f.app.addPlace(f.u.id, { name: "Centro" })),
);
scenario("10-V", (f) => {
  const v = f.vehicle();
  assert.deepEqual(f.state().vehicles, [v]);
  assert.equal(v.type, "petrol");
  assert.equal(v.consumption, 6);
});
scenario("10-I", (f) =>
  unchanged(f, () =>
    f.app.saveVehicle(f.u.id, {
      name: "Compacto",
      type: "petrol",
      consumption: -1,
    }),
  ),
);
scenario("11-V", (f) => {
  const a = f.vehicle(),
    b = f.vehicle("electric"),
    l = f.other();
  f.app.saveVehicle(l.id, {
    name: "Furgoneta",
    type: "diesel",
    consumption: 8,
  });
  assert.deepEqual(f.app.stateForSession(f.token).vehicles, [a, b]);
});
scenario("11-I", (f) => {
  f.vehicle();
  const expired = "expired-session";
  f.repo.createSession(
    createHash("sha256").update(expired).digest("hex"),
    f.u.id,
    Date.now() - 1000,
  );
  assert.throws(
    () => f.app.stateForSession(expired),
    (e) => e instanceof AppError && e.status === 401,
  );
});
scenario("12-V", (f) => {
  const v = f.vehicle();
  f.app.preferences(f.u.id, { vehicleId: v.id });
  f.app.remove(f.u.id, "vehicles", v.id);
  assert.deepEqual(f.state().vehicles, []);
  assert.equal(f.state().preferences.vehicleId, null);
});
scenario("12-I", (f) => {
  const l = f.other(),
    v = f.app.saveVehicle(l.id, {
      name: "Furgoneta",
      type: "diesel",
      consumption: 8,
    });
  unchanged(f, () => f.app.remove(f.u.id, "vehicles", v.id));
  assert.deepEqual(f.app.state(l.id).vehicles, [v]);
});
scenario("13-V", (f) => {
  const v = f.vehicle();
  const changed = f.app.saveVehicle(f.u.id, { ...v, consumption: 5.5 });
  assert.equal(changed.id, v.id);
  assert.equal(changed.consumption, 5.5);
  assert.deepEqual(f.state().vehicles, [changed]);
});
scenario("13-I", (f) => {
  const v = f.vehicle();
  unchanged(f, () => f.app.saveVehicle(f.u.id, { ...v, consumption: 0 }));
});
scenario("14-V", async (f) => {
  const p = await f.plan();
  validRoute(p.routes[0]);
});
scenario("14-I", async (f) => {
  const a = f.app.addPlace(f.u.id, {
    name: "Centro",
    lat: 39.9864,
    lon: -0.0513,
  });
  const before = f.state();
  await assert.rejects(() =>
    f.app.plan(f.u.id, { from: a.id, to: a.id, mode: "foot" }),
  );
  assert.deepEqual(f.state(), before);
});
scenario("15-V", async (f) => {
  const p = await f.plan("car");
  for (const r of p.routes) {
    validRoute(r);
    assert.equal(
      r.cost,
      Math.round((r.distance / 1000 / 100) * 6 * 1.6 * 100) / 100,
    );
    assert.equal(r.priceSource, "Precio manual");
  }
});
scenario("15-I", (f) => {
  f.vehicle();
  f.app.preferences(f.u.id, { useManualPrices: true });
  unchanged(f, () =>
    f.app.preferences(f.u.id, {
      manualPrices: { petrol: -1, diesel: 1.5, electric: 0.2 },
    }),
  );
});
scenario("16-V", async (f) => {
  const p = await f.plan("car", "electric");
  for (const r of p.routes) {
    validRoute(r);
    assert.equal(
      r.cost,
      Math.round((r.distance / 1000 / 100) * 15 * 0.2 * 100) / 100,
    );
    assert.equal(r.priceSource, "Precio manual");
  }
});
scenario("16-I", (f) => {
  f.vehicle("electric");
  f.app.preferences(f.u.id, { useManualPrices: true });
  unchanged(f, () =>
    f.app.preferences(f.u.id, {
      manualPrices: { petrol: 1.6, diesel: 1.5, electric: 0 },
    }),
  );
});
scenario("17-V", async (f) => {
  const p = await f.plan();
  const r = p.routes[0];
  assert.equal(
    r.calories,
    Math.round(((3.5 * 3.5 * 70) / 200) * (r.duration / 60)),
  );
});
scenario("17-I", (f) => {
  f.places();
  unchanged(f, () => f.app.preferences(f.u.id, { weight: 0 }));
});
scenario("18-V", async (f) => {
  const p = await f.plan("car", "petrol", "cheapest");
  assert.ok(p.routes.length);
  for (const r of p.routes) assert.ok(p.routes[0].cost! <= r.cost!);
  assert.equal(p.routes[0].priceSource, "Precio manual");
});
scenario("18-I", async (f) => {
  const [a, b] = f.places(),
    before = f.state();
  await assert.rejects(() =>
    f.app.plan(f.u.id, {
      from: a.id,
      to: b.id,
      mode: "foot",
      preference: "panorámica",
    }),
  );
  assert.deepEqual(f.state(), before);
});
scenario("19-V", async (f) => {
  const p = await f.plan();
  const saved = f.app.saveRoute(f.u.id, {
    planId: p.planId,
    index: 0,
    name: "Camino a clase",
  });
  assert.equal(saved.name, "Camino a clase");
  assert.deepEqual(saved.geometry, p.routes[0].geometry);
  assert.equal(saved.distance, p.routes[0].distance);
  assert.equal(saved.calculatedAt, p.routes[0].calculatedAt);
  assert.deepEqual(f.state().routes, [persisted(saved)]);
});
scenario("19-I", (f) =>
  unchanged(f, () =>
    f.app.saveRoute(f.u.id, {
      planId: "X99",
      index: 0,
      name: "Camino a clase",
    }),
  ),
);
scenario("20-V", async (f) => {
  const saved = await f.saved();
  f.reopen();
  assert.deepEqual(f.app.stateForSession(f.token).routes, [saved]);
});
scenario("20-I", async (f) => {
  await f.saved();
  assert.throws(
    () => f.app.stateForSession("S0"),
    (e) => e instanceof AppError && e.status === 401,
  );
});
scenario("21-V", async (f) => {
  const a = await f.saved(),
    b = await f.saved("Paseo");
  const before = f.state();
  f.app.remove(f.u.id, "routes", a.id);
  assert.deepEqual(f.state().routes, [b]);
  assert.deepEqual(f.state().places, before.places);
  assert.deepEqual(f.state().vehicles, before.vehicles);
});
scenario("21-I", async (f) => {
  const l = f.other();
  const p = await f.plan();
  const otherPlan = await f.app.plan(l.id, {
    from: f.app.addPlace(l.id, { name: "Centro", lat: 39.9864, lon: -0.0513 })
      .id,
    to: f.app.addPlace(l.id, { name: "UJI", lat: 39.9946, lon: -0.0684 }).id,
    mode: "foot",
  });
  const foreign = f.app.saveRoute(l.id, {
    planId: otherPlan.planId,
    index: 0,
    name: "Camino al trabajo",
  });
  unchanged(f, () => f.app.remove(f.u.id, "routes", foreign.id));
  assert.deepEqual(f.app.state(l.id).routes, [persisted(foreign)]);
});
scenario("22-V", async (f) => {
  const places = f.places(),
    vehicles = [f.vehicle(), f.vehicle("electric")],
    routes = [await f.saved(), await f.saved("Paseo")];
  for (const [kind, list] of [
    ["places", places],
    ["vehicles", vehicles],
    ["routes", routes],
  ] as const) {
    f.app.favorite(f.u.id, kind, list[1].id!);
    const actual = f.repo.list(f.u.id, kind);
    assert.equal(actual[0].id, list[1].id);
    assert.equal(actual[0].favorite, true);
    assert.equal(actual.find((x) => x.id === list[0].id).favorite, false);
  }
  f.reopen();
  assert.equal(f.state().places[0].favorite, true);
  assert.equal(f.state().vehicles[0].favorite, true);
  assert.equal(f.state().routes[0].favorite, true);
});
scenario("22-I", async (f) => {
  const l = f.other();
  const place = f.app.addPlace(l.id, {
      name: "Estación",
      lat: 39.9885,
      lon: -0.051,
    }),
    vehicle = f.app.saveVehicle(l.id, {
      name: "Furgoneta",
      type: "diesel",
      consumption: 8,
    });
  const p = await f.plan();
  const otherPlan = await f.app.plan(l.id, {
    from: place.id,
    to: f.app.addPlace(l.id, { name: "UJI", lat: 39.9946, lon: -0.0684 }).id,
    mode: "foot",
  });
  const route = f.app.saveRoute(l.id, {
    planId: otherPlan.planId,
    index: 0,
    name: "Camino al trabajo",
  });
  const before = f.app.state(l.id);
  for (const [kind, x] of [
    ["places", place],
    ["vehicles", vehicle],
    ["routes", route],
  ] as const)
    assert.throws(() => f.app.favorite(f.u.id, kind, x.id!));
  assert.deepEqual(f.app.state(l.id), before);
});
scenario("23-V", async (f) => {
  const vehicle = f.vehicle();
  const [a, b] = f.places();
  f.app.preferences(f.u.id, {
    mode: "car",
    vehicleId: vehicle.id,
    useManualPrices: true,
  });
  const initial = await f.app.plan(f.u.id, { from: a.id, to: b.id });
  assert.equal(initial.routes[0].mode, "car");
  assert.equal(initial.routes[0].vehicle?.id, vehicle.id);
  const override = await f.app.plan(f.u.id, {
    from: a.id,
    to: b.id,
    mode: "foot",
  });
  assert.equal(override.routes[0].mode, "foot");
  assert.equal(f.state().preferences.mode, "car");
  f.reopen();
  assert.equal(f.state().preferences.vehicleId, vehicle.id);
});
scenario("23-I", (f) => {
  const v = f.vehicle();
  f.app.preferences(f.u.id, { vehicleId: v.id });
  const l = f.other(),
    foreign = f.app.saveVehicle(l.id, {
      name: "Furgoneta",
      type: "diesel",
      consumption: 8,
    });
  unchanged(f, () => f.app.preferences(f.u.id, { vehicleId: foreign.id }));
});
scenario("24-V", async (f) => {
  const vehicle = f.vehicle();
  const [a, b] = f.places();
  f.app.preferences(f.u.id, { vehicleId: vehicle.id, useManualPrices: true });
  assert.equal(f.state().preferences.preference, "fastest");
  f.app.preferences(f.u.id, { preference: "shortest" });
  f.reopen();
  const initial = await f.app.plan(f.u.id, { from: a.id, to: b.id });
  assert.equal(initial.preference, "shortest");
  assert.equal(
    initial.routes[0].distance,
    Math.min(...initial.routes.map((r) => r.distance)),
  );
  await f.app.plan(f.u.id, { from: a.id, to: b.id, preference: "fastest" });
  assert.equal(f.state().preferences.preference, "shortest");
});
scenario("24-I", (f) => {
  f.app.preferences(f.u.id, { preference: "shortest" });
  unchanged(f, () => f.app.preferences(f.u.id, { preference: "panorámica" }));
});
async function fullState(f: Fixture) {
  const [a, b] = f.places();
  f.vehicle();
  f.app.preferences(f.u.id, { useManualPrices: true, theme: "dark" });
  f.app.favorite(f.u.id, "places", b.id);
  const p = await f.app.plan(f.u.id, {
    from: a.id,
    to: b.id,
    mode: "foot",
    preference: "shortest",
  });
  f.app.saveRoute(f.u.id, {
    planId: p.planId,
    index: 0,
    name: "Camino a clase",
  });
  f.app.preferences(f.u.id, {
    lastJourney: {
      fromId: a.id,
      toId: b.id,
      mode: "foot",
      preference: "shortest",
      vehicleId: "",
    },
  });
  return f.state();
}
scenario("25-V", async (f) => {
  const before = await fullState(f);
  f.close();
  const child = spawnSync(
    process.execPath,
    [
      "--import",
      "tsx",
      "--input-type=module",
      "-e",
      `import{SqliteRepository}from'./src/repository.ts';import{MobilityService}from'./src/services.ts';const repo=new SqliteRepository(process.argv[1]);const app=new MobilityService({repo});const session=app.login({email:'ana@example.com',password:'RutaSegura2026'});console.log(JSON.stringify(app.state(session.user.id)));repo.close();`,
      f.path,
    ],
    { cwd: process.cwd(), encoding: "utf8" },
  );
  assert.equal(child.status, 0, child.stderr);
  assert.deepEqual(JSON.parse(child.stdout), before);
});
scenario("25-I", async (f) => {
  const before = await fullState(f);
  f.close();
  renameSync(f.path, f.path + ".saved");
  mkdirSync(f.path);
  assert.throws(() => new SqliteRepository(f.path));
  const readable = new SqliteRepository(f.path + ".saved");
  try {
    const app = new MobilityService({ repo: readable });
    assert.deepEqual(app.state(f.u.id), before);
  } finally {
    readable.close();
  }
});
scenario("26-V", (f) => {
  f.close();
  const child = spawnSync(
    process.execPath,
    [
      "--import",
      "tsx",
      "--input-type=module",
      "-e",
      `import{SqliteRepository}from'./src/repository.ts';import{MobilityService}from'./src/services.ts';const repo=new SqliteRepository(process.argv[1]);const app=new MobilityService({repo});app.addPlace(process.argv[2],{name:'Centro',lat:39.9864,lon:-0.0513});process.kill(process.pid,'SIGKILL');`,
      f.path,
      f.u.id,
    ],
    { cwd: process.cwd(), encoding: "utf8" },
  );
  assert.equal(child.signal, "SIGKILL", child.stderr);
  f.reopen();
  assert.equal(f.state().places.length, 1);
  assert.equal(f.state().places[0].name, "Centro");
});
scenario("26-I", (f) => {
  const place = f.app.addPlace(f.u.id, {
    name: "Centro",
    lat: 39.9864,
    lon: -0.0513,
  });
  f.close();
  const child = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `import{DatabaseSync}from'node:sqlite';const db=new DatabaseSync(process.argv[1]);db.exec('BEGIN IMMEDIATE');db.prepare('INSERT INTO records VALUES(?,?,?,?)').run('pending-uji',process.argv[2],'places',JSON.stringify({id:'pending-uji',name:'UJI',lat:39.9946,lon:-0.0684,favorite:false}));process.stdout.write('written');process.kill(process.pid,'SIGKILL');`,
      f.path,
      f.u.id,
    ],
    { encoding: "utf8" },
  );
  assert.equal(child.signal, "SIGKILL", child.stderr);
  assert.equal(child.stdout, "written");
  f.reopen();
  assert.deepEqual(f.state().places, [place]);
});

assert.equal(cases.length, 52);
assert.equal(new Set(cases.map((c) => c.id)).size, 52);
export function registerScenarios(
  kind: "aceptacion" | "integracion",
  dependencies: Dependencies,
) {
  const titles = new Map(
    [
      ...readFileSync(
        new URL("../../../04_Pruebas/aceptacion.feature", import.meta.url),
        "utf8",
      ).matchAll(/Scenario: PA-(\d\d-[VI]) (.*)/g),
    ].map((m) => [m[1], m[2]]),
  );
  assert.equal(titles.size, 52);
  for (const c of cases)
    assert.ok(titles.has(c.id), `No existe la especificación PA-${c.id}`);
  const external = new Set([
    "06",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "23",
    "24",
  ]);
  for (const c of cases) {
    if (kind === "integracion" && !external.has(c.id.slice(0, 2))) continue;
    test(
      `${kind === "aceptacion" ? "PA" : "PI"}-${c.id} ${titles.get(c.id)}`,
      { timeout: 120000 },
      async (t) => {
        const f = new Fixture(dependencies, !c.fresh);
        t.after(() => f.dispose());
        await c.run(f, t);
      },
    );
  }
}
