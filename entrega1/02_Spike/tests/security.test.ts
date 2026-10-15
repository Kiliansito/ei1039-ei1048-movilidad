import { test } from "node:test";
import assert from "node:assert/strict";
import { SqliteRepository } from "../src/repository.ts";
import { MobilityService } from "../src/services.ts";
const setup = () => {
  const repo = new SqliteRepository(":memory:");
  const app = new MobilityService({ repo });
  const a = app.register({
    name: "A",
    email: "a@example.com",
    password: "longpassword",
  });
  const b = app.register({
    name: "B",
    email: "b@example.com",
    password: "longpassword",
  });
  return { repo, app, a, b };
};
test("Given another account When editing or deleting its records Then access denied", () => {
  const { repo, app, a, b } = setup();
  const v = app.saveVehicle(a.id, {
    name: "Car",
    type: "electric",
    consumption: 15,
  });
  assert.throws(() => app.saveVehicle(b.id, { ...v, name: "stolen" }));
  assert.throws(() => app.remove(b.id, "vehicles", v.id));
  assert.throws(() => app.preferences(b.id, { vehicleId: v.id }));
  assert.equal(app.state(a.id).vehicles[0].name, "Car");
  repo.close();
});
test("Given deleted account When using old session Then invalid; wrong password does not delete", () => {
  const { repo, app, a } = setup();
  const { token } = app.login({ email: a.email, password: "longpassword" });
  assert.throws(() => app.deleteAccount(a.id, "wrong"));
  assert.ok(app.session(token));
  app.deleteAccount(a.id, "longpassword");
  assert.equal(app.session(token), null);
  repo.close();
});
test("Given persisted password When inspected Then salted hash and no secret in state", () => {
  const { repo, app, a, b } = setup();
  assert.notEqual(repo.getUser(a.id).password, "longpassword");
  assert.notEqual(repo.getUser(a.id).password, repo.getUser(b.id).password);
  assert.equal("password" in app.state(a.id).user, false);
  repo.close();
});
test("Given numeric strings, NaN or unknown preference When submitted Then validation rejects", () => {
  const { repo, app, a } = setup();
  assert.throws(() => app.addPlace(a.id, { name: "x", lat: "39", lon: 0 }));
  assert.throws(() => app.preferences(a.id, { weight: NaN }));
  assert.throws(() => app.preferences(a.id, { admin: true }));
  repo.close();
});
test("Given vehicle selected as default When deleted Then default is cleared", () => {
  const { repo, app, a } = setup();
  const v = app.saveVehicle(a.id, {
    name: "Car",
    type: "petrol",
    consumption: 6,
  });
  app.preferences(a.id, { vehicleId: v.id });
  app.remove(a.id, "vehicles", v.id);
  assert.equal(app.state(a.id).preferences.vehicleId, null);
  repo.close();
});
