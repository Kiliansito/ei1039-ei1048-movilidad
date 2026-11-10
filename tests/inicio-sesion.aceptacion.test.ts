import {
  deepEqual as comprobarIgualdad,
  ok as comprobar,
  throws as comprobarError,
} from "node:assert/strict";
import { createHash as crearHash, scryptSync } from "node:crypto";
import { DatabaseSync as BaseDeDatos } from "node:sqlite";
import { beforeEach as antesDeCadaPrueba, test as prueba } from "node:test";
import { ServicioCuentas } from "../src/ServicioCuentas.ts";

const cuentaDeAna = { identificador: "cuenta-ana", nombre: "Ana", correo: "ana@example.com" };
const credencialesDeAna = { correo: cuentaDeAna.correo, contrasena: "RutaSegura2026" };

let baseDeDatos: BaseDeDatos;

// Prepara las cuentas sin depender de la prueba de registro.
antesDeCadaPrueba((contexto) => {
  baseDeDatos = new BaseDeDatos(":memory:");
  contexto.after(() => baseDeDatos.close());
  baseDeDatos.exec(`
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
  `);

  // La sal se combina con la contrasena al calcular el hash.
  // Aqui es fija para la prueba. En el spike se genera al azar por cuenta.
  const sal = "sal-de-prueba";
  const clave = scryptSync(credencialesDeAna.contrasena, sal, 64).toString("hex");
  const insertarCuenta = baseDeDatos.prepare("INSERT INTO cuentas VALUES (?, ?, ?, ?)");
  insertarCuenta.run(cuentaDeAna.identificador, cuentaDeAna.nombre, cuentaDeAna.correo, `${sal}:${clave}`);
  insertarCuenta.run("cuenta-luis", "Luis", "luis@example.com", `${sal}:${clave}`);
});

prueba("H02_E02-V (PA-02-V): las credenciales correctas crean una sesión para Ana", () => {
  // Dadas las cuentas de Ana y Luis.
  const servicio = new ServicioCuentas(baseDeDatos);

  // Cuando Ana inicia sesion.
  const resultado = servicio.iniciarSesion(credencialesDeAna);

  // Entonces recibe solo sus datos y un token vinculado a su cuenta.
  comprobarIgualdad(resultado.cuenta, cuentaDeAna);
  comprobar(resultado.token.length > 0);
  const hashToken = crearHash("sha256").update(resultado.token).digest("hex");
  const sesiones = baseDeDatos.prepare("SELECT hash_token, identificador_cuenta FROM sesiones").all();
  comprobarIgualdad(sesiones.length, 1);
  comprobarIgualdad(sesiones[0]?.hash_token, hashToken);
  comprobarIgualdad(sesiones[0]?.identificador_cuenta, cuentaDeAna.identificador);
});

prueba("H02_E02-I1 (PA-02-I): una contraseña incorrecta no crea una sesión", () => {
  // Dada la cuenta de Ana.
  const servicio = new ServicioCuentas(baseDeDatos);

  // Cuando usa otra contrasena, se rechaza el acceso.
  comprobarError(
    () => servicio.iniciarSesion({ correo: cuentaDeAna.correo, contrasena: "OtraClave2026" }),
    /credenciales incorrectas/i,
  );

  // Entonces no queda ninguna sesion guardada.
  const sesiones = baseDeDatos.prepare("SELECT hash_token FROM sesiones").all();
  comprobarIgualdad(sesiones.length, 0);
});
