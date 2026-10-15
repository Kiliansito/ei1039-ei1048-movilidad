import { test } from "node:test";
import assert from "node:assert/strict";
import { OrsAdapter, PublicPrices } from "../src/adapters/providers.ts";
import { SqliteRepository } from "../src/repository.ts";
import { MobilityService } from "../src/services.ts";
const enabled = process.env.LIVE_APIS === "1";
const key = process.env.ORS_API_KEY;
test(
  "Acceptance: real public fuel and electricity providers return at least one current price",
  {
    skip: !enabled ? "Set LIVE_APIS=1 to enable live external requests" : false,
  },
  async () => {
    const p = await new PublicPrices().current();
    assert.ok(
      [p.petrol, p.diesel, p.electric].some(
        (v) => typeof v === "number" && Number.isFinite(v),
      ),
    );
    assert.ok(p.date);
  },
);
test(
  "Acceptance: search, persist endpoints and route through real ORS",
  { skip: !enabled || !key ? "Requires LIVE_APIS=1 and ORS_API_KEY" : false },
  async () => {
    const repo = new SqliteRepository(":memory:");
    try {
      const ors = new OrsAdapter(key!);
      const app = new MobilityService({
        repo,
        geocoder: ors,
        routing: ors,
        prices: new PublicPrices(),
      });
      const u = app.register({
        name: "Live test",
        email: "live@example.com",
        password: "AcceptanceTest123",
      });
      const results = await app.searchPlaces("Universitat Jaume I, Castellón");
      assert.ok(results.length);
      const a = app.addPlace(u.id, {
          name: "Centro",
          lat: 39.9864,
          lon: -0.0513,
        }),
        b = app.addPlace(u.id, results[0]);
      const vehicle = app.saveVehicle(u.id, {
        name: "Compacto",
        type: "petrol",
        consumption: 6,
      });
      for (const mode of ["car", "bike", "foot"]) {
        const result = await app.plan(u.id, {
          from: a.id,
          to: b.id,
          mode,
          vehicleId: mode === "car" ? vehicle.id : undefined,
        });
        assert.ok(result.routes[0].distance > 0);
        assert.ok(result.routes[0].geometry.length >= 2);
      }
    } finally {
      repo.close();
    }
  },
);
