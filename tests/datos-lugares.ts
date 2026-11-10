import { createHash as crearHash } from "node:crypto";
import { DatabaseSync as BaseDeDatos } from "node:sqlite";

export const tokenDeAna = "token-de-ana";
export const centro = { nombre: "Centro", latitud: 39.9864, longitud: -0.0513 };

export function prepararBaseDeLugares() {
  const base = new BaseDeDatos(":memory:");
  // Crea el esquema y una sesion valida para Ana.
  base.exec(`
    CREATE TABLE cuentas (
      identificador TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      correo TEXT NOT NULL UNIQUE,
      hash_contrasena TEXT NOT NULL
    );
    CREATE TABLE sesiones (
      hash_token TEXT PRIMARY KEY,
      identificador_cuenta TEXT NOT NULL REFERENCES cuentas(identificador),
      caducidad INTEGER NOT NULL
    );
    CREATE TABLE lugares (
      identificador TEXT PRIMARY KEY,
      identificador_cuenta TEXT NOT NULL REFERENCES cuentas(identificador),
      nombre TEXT NOT NULL,
      latitud REAL NOT NULL,
      longitud REAL NOT NULL
    );
    INSERT INTO cuentas VALUES ('cuenta-ana', 'Ana', 'ana@example.com', 'hash-de-prueba');
  `);
  const hashToken = crearHash("sha256").update(tokenDeAna).digest("hex");
  base.prepare("INSERT INTO sesiones VALUES (?, ?, ?)").run(hashToken, "cuenta-ana", Date.now() + 60_000);
  return base;
}
