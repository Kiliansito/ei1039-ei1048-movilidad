import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SqliteRepository } from "../src/repository.ts";
import { MobilityService } from "../src/services.ts";
test("R6 Given durable state When repository reopens Then account, records and preferences survive", () => {
  const dir = mkdtempSync(join(tmpdir(), "via-test-"));
  const path = join(dir, "db.sqlite");
  try {
    let repo = new SqliteRepository(path);
    let app = new MobilityService({ repo });
    const user = app.register({
      name: "Ana",
      email: "ana@example.com",
      password: "password123",
    });
    app.addPlace(user.id, { name: "Casa", lat: 39.9, lon: -0.1 });
    app.preferences(user.id, { theme: "dark", mode: "bike" });
    const { token } = app.login({ email: user.email, password: "password123" });
    repo.close();
    repo = new SqliteRepository(path);
    app = new MobilityService({ repo });
    assert.equal(app.state(user.id).places[0].name, "Casa");
    assert.equal(app.state(user.id).preferences.theme, "dark");
    assert.equal(app.session(token)?.id, user.id);
    repo.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("Given selected endpoints When preferences are restored Then last journey survives and foreign endpoints are rejected", () => {
  const repo = new SqliteRepository(":memory:");
  const app = new MobilityService({ repo });
  const user = app.register({
    name: "Ana",
    email: "journey@example.com",
    password: "password123",
  });
  const a = app.addPlace(user.id, { name: "A", lat: 39, lon: 0 });
  const b = app.addPlace(user.id, { name: "B", lat: 40, lon: 1 });
  app.preferences(user.id, {
    lastJourney: {
      fromId: a.id,
      toId: b.id,
      mode: "bike",
      preference: "shortest",
      vehicleId: "",
    },
  });
  assert.equal(app.state(user.id).preferences.lastJourney?.fromId, a.id);
  assert.throws(() =>
    app.preferences(user.id, {
      lastJourney: {
        fromId: "foreign",
        toId: b.id,
        mode: "bike",
        preference: "shortest",
        vehicleId: "",
      },
    }),
  );
  app.remove(user.id, "places", a.id);
  assert.equal(app.state(user.id).preferences.lastJourney?.fromId, "");
  repo.close();
});

test("Given a committed place When the process is killed without closing SQLite Then WAL recovers it", async () => {
  const { spawnSync } = await import("node:child_process");
  const dir = mkdtempSync(join(tmpdir(), "via-crash-"));
  const path = join(dir, "db.sqlite");
  try {
    const child = spawnSync(
      process.execPath,
      [
        "--import",
        "tsx",
        "--input-type=module",
        "-e",
        `import {SqliteRepository} from './src/repository.ts';import {MobilityService} from './src/services.ts';const repo=new SqliteRepository(process.argv[1]);const app=new MobilityService({repo});const user=app.register({name:'Crash test',email:'crash@example.com',password:'password123'});app.addPlace(user.id,{name:'Durable',lat:39,lon:0});process.kill(process.pid,'SIGKILL');`,
        path,
      ],
      { cwd: process.cwd() },
    );
    assert.equal(child.signal, "SIGKILL");
    const repo = new SqliteRepository(path);
    const user = repo.findUser("crash@example.com");
    assert.equal(repo.list(String(user.id), "places")[0].name, "Durable");
    repo.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
