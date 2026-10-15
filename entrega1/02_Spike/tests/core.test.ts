import { test } from "node:test";
import assert from "node:assert/strict";
import { MobilityService } from "../src/services.ts";
import { SqliteRepository } from "../src/repository.ts";
const fixture = () => {
  const repo = new SqliteRepository(":memory:");
  const routing = {
    routes: async () => [
      {
        distance: 10000,
        duration: 600,
        geometry: [
          [0, 39],
          [0.1, 39.1],
        ],
        steps: [],
      },
      {
        distance: 8000,
        duration: 900,
        geometry: [
          [0, 39],
          [0.1, 39.1],
        ],
        steps: [],
      },
    ],
  };
  const geocoder = {
    search: async () => [{ name: "Castellón", lat: 39.98, lon: -0.04 }],
    reverse: async () => ({ name: "Castellón", lat: 39.98, lon: -0.04 }),
  };
  const prices = {
    current: async () => ({
      petrol: 1.6,
      diesel: 1.5,
      electric: 0.2,
      source: "fixture",
      estimated: true,
    }),
  };
  const app = new MobilityService({ repo, routing, geocoder, prices });
  const user = app.register({
    name: "Ana",
    email: "ana@example.com",
    password: "password123",
  });
  return { repo, app, user };
};
test("Given new email When registering Then account is created; duplicate rejected", () => {
  const { app, user } = fixture();
  assert.equal(user.name, "Ana");
  assert.throws(
    () =>
      app.register({
        name: "Ana",
        email: "ana@example.com",
        password: "password123",
      }),
    /registrado/,
  );
});
test("invalid email and weak password rejected", () => {
  const { app } = fixture();
  assert.throws(() => app.register({ name: "A", email: "bad", password: "x" }));
});
test("Given account When login Then authenticated; wrong password rejected", () => {
  const { app } = fixture();
  assert.ok(
    app.login({ email: "ana@example.com", password: "password123" }).token,
  );
  assert.throws(
    () => app.login({ email: "ana@example.com", password: "incorrect" }),
    /credenciales/i,
  );
});
test("Given session When logout Then token invalidated", () => {
  const { app } = fixture();
  const { token } = app.login({
    email: "ana@example.com",
    password: "password123",
  });
  assert.ok(app.session(token));
  app.logout(token);
  assert.equal(app.session(token), null);
});
test("Given owned records When deleting account Then cascade removes all data", () => {
  const { app, user, repo } = fixture();
  app.addPlace(user.id, { name: "Casa", lat: 39, lon: 0 });
  app.deleteAccount(user.id, "password123");
  assert.equal(repo.getUser(user.id), null);
  assert.deepEqual(repo.list(user.id, "places"), []);
});
test("Given coordinates When saving place Then persisted; invalid coordinates rejected", async () => {
  const { app, user } = fixture();
  const p = app.addPlace(user.id, { name: "Casa", lat: 39, lon: 0 });
  assert.equal(app.state(user.id).places[0].id, p.id);
  assert.throws(() => app.addPlace(user.id, { name: "No", lat: 100, lon: 0 }));
});
test("Given a toponym When searching Then geocoder result can become registered place", async () => {
  const { app, user } = fixture();
  const [p] = await app.searchPlaces("Castellón");
  app.addPlace(user.id, p);
  assert.equal(app.state(user.id).places[0].name, "Castellón");
  await assert.rejects(() => app.searchPlaces(""));
});
test("Given a place When deleting Then absent; unknown record rejected", () => {
  const { app, user } = fixture();
  const p = app.addPlace(user.id, { name: "Casa", lat: 39, lon: 0 });
  app.remove(user.id, "places", p.id);
  assert.equal(app.state(user.id).places.length, 0);
  assert.throws(() => app.remove(user.id, "places", p.id));
});
test("Given vehicle When updating and deleting Then lifecycle persists", () => {
  const { app, user } = fixture();
  const v = app.saveVehicle(user.id, {
    name: "Mi coche",
    type: "petrol",
    consumption: 6,
  });
  assert.equal(app.state(user.id).vehicles.length, 1);
  app.saveVehicle(user.id, { ...v, consumption: 7 });
  assert.equal(app.state(user.id).vehicles[0].consumption, 7);
  assert.throws(() =>
    app.saveVehicle(user.id, { name: "No", type: "petrol", consumption: -1 }),
  );
  app.remove(user.id, "vehicles", v.id);
  assert.equal(app.state(user.id).vehicles.length, 0);
});
test("Given registered endpoints When calculating Then fastest and shortest differ", async () => {
  const { app, user } = fixture();
  const v = app.saveVehicle(user.id, {
    name: "Compacto",
    type: "petrol",
    consumption: 6,
  });
  app.preferences(user.id, { vehicleId: v.id });
  const a = app.addPlace(user.id, { name: "A", lat: 39, lon: 0 }),
    b = app.addPlace(user.id, { name: "B", lat: 39.1, lon: 0.1 });
  const result = await app.plan(user.id, {
    from: a.id,
    to: b.id,
    mode: "car",
    preference: "fastest",
  });
  assert.equal(result.routes[0].distance, 10000);
  assert.equal(result.routes[0].cost, 0.96);
  const short = await app.plan(user.id, {
    from: a.id,
    to: b.id,
    mode: "car",
    preference: "shortest",
  });
  assert.equal(short.routes[0].distance, 8000);
  await assert.rejects(() =>
    app.plan(user.id, {
      from: a.id,
      to: a.id,
      mode: "car",
      preference: "fastest",
    }),
  );
  await assert.rejects(() =>
    app.plan(user.id, {
      from: a.id,
      to: "missing",
      mode: "car",
      preference: "fastest",
    }),
  );
});
test("Given bicycle or walk When planning Then kcal estimated", async () => {
  const { app, user } = fixture();
  const a = app.addPlace(user.id, { name: "A", lat: 39, lon: 0 }),
    b = app.addPlace(user.id, { name: "B", lat: 39.1, lon: 0.1 });
  for (const mode of ["bike", "foot"]) {
    const r = await app.plan(user.id, {
      from: a.id,
      to: b.id,
      mode,
      preference: "fastest",
    });
    assert.ok(r.routes[0].calories > 0);
    assert.equal(r.routes[0].cost, 0);
  }
});
test("Given calculated route When saving Then reloadable and deletable", async () => {
  const { app, user } = fixture();
  const v = app.saveVehicle(user.id, {
    name: "Compacto",
    type: "petrol",
    consumption: 6,
  });
  app.preferences(user.id, { vehicleId: v.id });
  const a = app.addPlace(user.id, { name: "A", lat: 39, lon: 0 }),
    b = app.addPlace(user.id, { name: "B", lat: 39.1, lon: 0.1 });
  const r = await app.plan(user.id, {
    from: a.id,
    to: b.id,
    mode: "car",
    preference: "fastest",
  });
  const saved = app.saveRoute(user.id, {
    planId: r.planId,
    index: 0,
    name: "Mi ruta",
  });
  assert.equal(app.state(user.id).routes.length, 1);
  app.remove(user.id, "routes", saved.id);
  assert.equal(app.state(user.id).routes.length, 0);
  assert.throws(() => app.saveRoute(user.id, { name: "invalid" }));
});
test("Given favorite When listing Then appears first; cross-account access denied", () => {
  const { app, user } = fixture();
  app.addPlace(user.id, { name: "A", lat: 39, lon: 0 });
  const b = app.addPlace(user.id, { name: "B", lat: 39, lon: 1 });
  app.favorite(user.id, "places", b.id);
  assert.equal(app.state(user.id).places[0].id, b.id);
  const other = app.register({
    name: "Otra",
    email: "other@example.com",
    password: "password123",
  });
  assert.throws(() => app.favorite(other.id, "places", b.id));
  assert.deepEqual(app.state(other.id).places, []);
});
test("Given preferences When reopening Then defaults preserved; invalid enum rejected", () => {
  const { app, user } = fixture();
  app.preferences(user.id, {
    mode: "bike",
    preference: "shortest",
    theme: "dark",
    weight: 75,
  });
  assert.equal(app.state(user.id).preferences.mode, "bike");
  assert.throws(() => app.preferences(user.id, { mode: "plane" }));
});
test("Provider failure propagates honestly without invented routes", async () => {
  const { app, user } = fixture();
  const v = app.saveVehicle(user.id, {
    name: "Compacto",
    type: "petrol",
    consumption: 6,
  });
  app.preferences(user.id, { vehicleId: v.id });
  app.routing = {
    routes: async () => {
      throw new Error("Servicio no disponible");
    },
  };
  const a = app.addPlace(user.id, { name: "A", lat: 39, lon: 0 }),
    b = app.addPlace(user.id, { name: "B", lat: 40, lon: 1 });
  await assert.rejects(
    () =>
      app.plan(user.id, {
        from: a.id,
        to: b.id,
        mode: "car",
        preference: "fastest",
      }),
    /no disponible/,
  );
});

test("Editing a place preserves identity and favorites, validates coordinates and isolates owners", () => {
  const { app, user, repo } = fixture();
  const place = app.addPlace(user.id, { name: "Casa", lat: 39, lon: 0 });
  app.favorite(user.id, "places", place.id);
  const edited = app.addPlace(user.id, {
    id: place.id,
    name: "Casa nueva",
    lat: 40,
    lon: -1,
  });
  assert.equal(edited.id, place.id);
  assert.equal(edited.favorite, true);
  assert.equal(app.state(user.id).places.length, 1);
  assert.equal(app.state(user.id).places[0].name, "Casa nueva");
  assert.throws(
    () => app.addPlace(user.id, { ...edited, lat: 91 }),
    /coordenadas/,
  );
  const stranger = app.register({
    name: "Otra",
    email: "other-edit@example.com",
    password: "TestingEdit123",
  });
  assert.throws(
    () => app.addPlace(stranger.id, { ...edited, name: "Ajena" }),
    /No se encuentra/,
  );
  assert.equal(app.state(user.id).places[0].name, "Casa nueva");
  repo.close();
});

test("Sin vehículo se calcula y guarda una ruta en coche sin inventar el coste", async () => {
  const { app, user, repo } = fixture();
  try {
    const a = app.addPlace(user.id, { name: "Centro", lat: 39, lon: 0 });
    const b = app.addPlace(user.id, { name: "UJI", lat: 39.1, lon: 0.1 });
    const result = await app.plan(user.id, {
      from: a.id,
      to: b.id,
      mode: "car",
      vehicleId: "",
    });
    assert.ok(result.routes.length > 0);
    assert.equal(result.routes[0].cost, null);
    assert.equal(result.routes[0].vehicle, undefined);
    assert.equal(result.routes[0].price, undefined);
    assert.equal(result.price.petrol, 1.6);
    assert.equal(result.price.diesel, 1.5);
    assert.equal(result.price.electric, 0.2);
    const saved = app.saveRoute(user.id, {
      planId: result.planId,
      index: 0,
      name: "Trayecto sin vehículo",
    });
    assert.equal(saved.cost, null);
    assert.equal(app.state(user.id).routes[0].cost, null);
    assert.deepEqual(app.state(user.id).vehicles, []);
  } finally {
    repo.close();
  }
});

test("Se pueden consultar los tres precios sin tener vehículos y elegir precios manuales", async () => {
  const { app, user, repo } = fixture();
  try {
    const before = app.state(user.id);
    const live = await app.energyPrices(user.id);
    assert.equal(live.petrol, 1.6);
    assert.equal(live.diesel, 1.5);
    assert.equal(live.electric, 0.2);
    assert.deepEqual(app.state(user.id), before);
    app.preferences(user.id, {
      useManualPrices: true,
      manualPrices: { petrol: 1.9, diesel: 1.8, electric: 0.25 },
    });
    const manual = await app.energyPrices(user.id);
    assert.equal(manual.source, "Precio manual");
    assert.equal(manual.petrol, 1.9);
    assert.equal(manual.diesel, 1.8);
    assert.equal(manual.electric, 0.25);
    await assert.rejects(() => app.energyPrices("unknown"));
  } finally {
    repo.close();
  }
});

test("Sin proveedor de precios no se inventan importes ni se bloquea una ruta sin vehículo", async () => {
  const { app, user, repo } = fixture();
  try {
    app.prices = {
      current: async () => {
        throw new Error("Sin conexión");
      },
    };
    const prices = await app.energyPrices(user.id);
    assert.equal(prices.petrol, null);
    assert.equal(prices.diesel, null);
    assert.equal(prices.electric, null);
    const a = app.addPlace(user.id, { name: "Centro", lat: 39, lon: 0 });
    const b = app.addPlace(user.id, { name: "UJI", lat: 39.1, lon: 0.1 });
    const result = await app.plan(user.id, {
      from: a.id,
      to: b.id,
      mode: "car",
      preference: "cheapest",
      vehicleId: "",
    });
    assert.equal(result.routes[0].distance, 8000);
    assert.ok(result.routes.every((r) => r.cost === null));
  } finally {
    repo.close();
  }
});

test("Se puede omitir un vehículo predeterminado y se utiliza el precio de cada tipo de energía", async () => {
  const { app, user, repo } = fixture();
  try {
    const a = app.addPlace(user.id, { name: "Centro", lat: 39, lon: 0 });
    const b = app.addPlace(user.id, { name: "UJI", lat: 39.1, lon: 0.1 });
    for (const [type, consumption, price, cost] of [
      ["petrol", 6, 1.6, 0.96],
      ["diesel", 5, 1.5, 0.75],
      ["electric", 15, 0.2, 0.3],
    ] as const) {
      const vehicle = app.saveVehicle(user.id, {
        name: type,
        type,
        consumption,
      });
      app.preferences(user.id, { mode: "car", vehicleId: vehicle.id });
      const result = await app.plan(user.id, { from: a.id, to: b.id });
      assert.equal(result.routes[0].price, price);
      assert.equal(result.routes[0].cost, cost);
      const without = await app.plan(user.id, {
        from: a.id,
        to: b.id,
        vehicleId: "",
      });
      assert.equal(without.routes[0].vehicle, undefined);
      assert.equal(without.routes[0].cost, null);
      assert.equal(app.state(user.id).preferences.vehicleId, vehicle.id);
    }
    const foreign = app.register({
      name: "Luis",
      email: "other-price@example.com",
      password: "TestingPrice123",
    });
    const v = app.saveVehicle(foreign.id, {
      name: "Ajeno",
      type: "petrol",
      consumption: 6,
    });
    await assert.rejects(() =>
      app.plan(user.id, { from: a.id, to: b.id, vehicleId: v.id }),
    );
  } finally {
    repo.close();
  }
});

test("Explorar calcula con lugares sin guardar y una referencia de gasolina de 6 l sin crear registros", async () => {
  const { app, user, repo } = fixture();
  try {
    const input = { from: { name: "Centro", lat: 39, lon: 0 }, to: { name: "UJI", lat: 39.1, lon: 0.1 }, mode: "car", vehicleId: "", referenceVehicle: { type: "petrol", consumption: 6 } };
    const plan = await app.plan(user.id, input);
    assert.equal(plan.routes[0].cost, 0.96);
    assert.equal(plan.routes[0].vehicle?.reference, true);
    assert.equal(plan.routes[0].from?.name, "Centro");
    assert.equal(plan.routes[0].to?.name, "UJI");
    assert.deepEqual(app.state(user.id).places, []);
    assert.deepEqual(app.state(user.id).vehicles, []);
    assert.deepEqual(app.state(user.id).preferences.lastJourney?.fromPoint, input.from);
    assert.deepEqual(app.state(user.id).preferences.lastJourney?.referenceVehicle, input.referenceVehicle);
    input.from.name = "Cambiado";
    input.referenceVehicle.consumption = 99;
    const saved = app.saveRoute(user.id, { planId: plan.planId, index: 0, name: "Consulta directa" });
    assert.equal(saved.from?.name, "Centro");
    assert.equal(saved.vehicle?.consumption, 6);
    assert.equal(app.state(user.id).routes[0].cost, 0.96);
  } finally { repo.close(); }
});

test("Los puntos directos y el consumo de referencia se validan antes de consultar proveedores", async () => {
  const { app, user, repo } = fixture();
  try {
    let calls = 0;
    app.routing = { routes: async () => { calls++; return []; } };
    const input = { from: { name: "Centro", lat: 39, lon: 0 }, to: { name: "UJI", lat: 39.1, lon: 0.1 }, mode: "car", vehicleId: "", referenceVehicle: { type: "petrol", consumption: 6 } };
    const before = app.state(user.id);
    for (const changes of [
      { from: { name: "Centro", lat: 91, lon: 0 } },
      { from: { name: "", lat: 39, lon: 0 } },
      { to: { name: "Centro también", lat: 39, lon: 0 } },
      { referenceVehicle: { type: "petrol", consumption: 0 } },
      { referenceVehicle: { type: "unknown", consumption: 6 } },
    ]) await assert.rejects(() => app.plan(user.id, { ...input, ...changes }));
    assert.equal(calls, 0);
    assert.deepEqual(app.state(user.id), before);
  } finally { repo.close(); }
});

test("La referencia admite diésel y electricidad y no sustituye un vehículo propio sin indicarlo", async () => {
  const { app, user, repo } = fixture();
  try {
    const input = { from: { name: "Centro", lat: 39, lon: 0 }, to: { name: "UJI", lat: 39.1, lon: 0.1 }, mode: "car", vehicleId: "" };
    for (const [type, consumption, cost] of [["diesel", 5, 0.75], ["electric", 15, 0.3]] as const) {
      const result = await app.plan(user.id, { ...input, referenceVehicle: { type, consumption } });
      assert.equal(result.routes[0].cost, cost);
      assert.equal(result.routes[0].vehicle?.type, type);
    }
    const v = app.saveVehicle(user.id, { name: "Propio", type: "petrol", consumption: 8 });
    app.preferences(user.id, { vehicleId: v.id });
    const own = await app.plan(user.id, { ...input, vehicleId: v.id });
    assert.equal(own.routes[0].cost, 1.28);
    await assert.rejects(() => app.plan(user.id, { ...input, vehicleId: v.id, referenceVehicle: { type: "petrol", consumption: 6 } }));
    const reference = await app.plan(user.id, { ...input, referenceVehicle: { type: "petrol", consumption: 6 } });
    assert.equal(reference.routes[0].cost, 0.96);
    assert.equal(app.state(user.id).preferences.vehicleId, v.id);
  } finally { repo.close(); }
});

test("Los lugares guardados conservan la comprobación de propiedad al combinarse con puntos directos", async () => {
  const { app, user, repo } = fixture();
  try {
    const other = app.register({ name: "Luis", email: "direct-other@example.com", password: "TestingDirect123" });
    const foreign = app.addPlace(other.id, { name: "Privado", lat: 40, lon: 1 });
    await assert.rejects(() => app.plan(user.id, { from: { name: "Centro", lat: 39, lon: 0 }, to: foreign.id, mode: "foot" }));
    assert.deepEqual(app.state(user.id).places, []);
  } finally { repo.close(); }
});
