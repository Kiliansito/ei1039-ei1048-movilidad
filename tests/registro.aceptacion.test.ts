import { deepEqual as comprobarIgualdad, throws as comprobarError } from "node:assert/strict";
import { DatabaseSync as BaseDeDatos } from "node:sqlite";
import { beforeEach as antesDeCadaPrueba, test as prueba } from "node:test";
import { ServicioCuentas } from "../src/ServicioCuentas.ts";

const datosDeAna = {
  nombre: "Ana",
  correo: "ana@example.com",
  contrasena: "RutaSegura2026",
};

let baseDeDatos: BaseDeDatos;

antesDeCadaPrueba((contexto) => {
  baseDeDatos = new BaseDeDatos(":memory:");
  contexto.after(() => baseDeDatos.close());
  baseDeDatos.exec(`
    CREATE TABLE cuentas (
      identificador TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      correo TEXT NOT NULL UNIQUE,
      hash_contrasena TEXT NOT NULL
    )
  `);
});

prueba("PA-01-V: un correo nuevo permite registrar una cuenta", () => {
  const servicio = new ServicioCuentas(baseDeDatos);

  const resultado = servicio.registrar(datosDeAna);

  const cuentas = baseDeDatos.prepare("SELECT identificador, correo FROM cuentas").all();
  comprobarIgualdad(cuentas.length, 1);
  comprobarIgualdad(cuentas[0]?.correo, datosDeAna.correo);
  comprobarIgualdad(resultado, { identificador: cuentas[0]?.identificador });
});

prueba("PA-01-I: un correo duplicado se rechaza sin crear otra cuenta", () => {
  baseDeDatos.prepare("INSERT INTO cuentas VALUES (?, ?, ?, ?)").run(
    "cuenta-ana",
    datosDeAna.nombre,
    datosDeAna.correo,
    "hash-de-prueba",
  );
  const servicio = new ServicioCuentas(baseDeDatos);

  comprobarError(() => servicio.registrar(datosDeAna), /correo duplicado/i);

  const cuentas = baseDeDatos.prepare("SELECT identificador FROM cuentas").all();
  comprobarIgualdad(cuentas.length, 1);
  comprobarIgualdad(cuentas[0]?.identificador, "cuenta-ana");
});
