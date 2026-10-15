import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type {
  Collection,
  Preferences,
  RepositoryPort,
} from "./domain/types.ts";
export class SqliteRepository implements RepositoryPort {
  private db: DatabaseSync;
  constructor(path = "data/via.sqlite") {
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db
      .exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=5000;
   CREATE TABLE IF NOT EXISTS migrations(version INTEGER PRIMARY KEY);
   CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE,password TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS records(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,kind TEXT NOT NULL,data TEXT NOT NULL);
   CREATE INDEX IF NOT EXISTS records_owner ON records(user_id,kind);
   CREATE TABLE IF NOT EXISTS preferences(user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,data TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,expires INTEGER NOT NULL);
   INSERT OR IGNORE INTO migrations VALUES(1);`);
  }
  getUser(id: string) {
    return this.db.prepare("SELECT * FROM users WHERE id=?").get(id) ?? null;
  }
  findUser(email: string) {
    return (
      this.db.prepare("SELECT * FROM users WHERE email=?").get(email) ?? null
    );
  }
  createUser(u: any) {
    this.db
      .prepare("INSERT INTO users VALUES(?,?,?,?)")
      .run(u.id, u.name, u.email, u.password);
  }
  deleteUser(id: string) {
    this.db.prepare("DELETE FROM users WHERE id=?").run(id);
  }
  list(userId: string, kind: Collection) {
    return this.db
      .prepare(
        "SELECT data FROM records WHERE user_id=? AND kind=? ORDER BY rowid",
      )
      .all(userId, kind)
      .map((r) => JSON.parse(String(r.data)))
      .sort((a, b) => Number(!!b.favorite) - Number(!!a.favorite));
  }
  get(userId: string, kind: Collection, id: string) {
    const row = this.db
      .prepare("SELECT data FROM records WHERE user_id=? AND kind=? AND id=?")
      .get(userId, kind, id);
    return row ? JSON.parse(String(row.data)) : null;
  }
  put(userId: string, kind: Collection, value: any) {
    this.db
      .prepare(
        "INSERT INTO records VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data WHERE records.user_id=excluded.user_id AND records.kind=excluded.kind",
      )
      .run(value.id, userId, kind, JSON.stringify(value));
  }
  remove(userId: string, kind: Collection, id: string) {
    return (
      this.db
        .prepare("DELETE FROM records WHERE user_id=? AND kind=? AND id=?")
        .run(userId, kind, id).changes > 0
    );
  }
  getPreferences(id: string) {
    const r = this.db
      .prepare("SELECT data FROM preferences WHERE user_id=?")
      .get(id);
    return r ? JSON.parse(String(r.data)) : {};
  }
  setPreferences(id: string, value: Preferences) {
    this.db
      .prepare(
        "INSERT INTO preferences VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data",
      )
      .run(id, JSON.stringify(value));
  }
  createSession(token: string, userId: string, expires: number) {
    this.db.prepare("DELETE FROM sessions WHERE expires<=?").run(Date.now());
    this.db
      .prepare("INSERT INTO sessions VALUES(?,?,?)")
      .run(token, userId, expires);
  }
  session(token: string) {
    return (
      this.db
        .prepare(
          "SELECT users.* FROM sessions JOIN users ON users.id=sessions.user_id WHERE token=? AND expires>?",
        )
        .get(token, Date.now()) ?? null
    );
  }
  deleteSession(token: string) {
    this.db.prepare("DELETE FROM sessions WHERE token=?").run(token);
  }
  close() {
    this.db.close();
  }
}
