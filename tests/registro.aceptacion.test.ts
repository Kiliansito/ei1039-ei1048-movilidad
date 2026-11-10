import { deepEqual as comprobarIgualdad, throws as comprobarError } from "node:assert/strict";
import { DatabaseSync as BaseDeDatos } from "node:sqlite";
import { beforeEach as antesDeCadaPrueba, test as prueba } from "node:test";
import { ServicioCuentas } from "../src/ServicioCuentas.ts";

// Datos ficticios para los dos escenarios.
const datosDeAna = {
  nombre: "Ana",
  correo: "ana@example.com",
  contrasena: "RutaSegura2026",
};

let baseDeDatos: BaseDeDatos;

// Cada prueba empieza con una base vacia.
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

prueba("H01_E01-V (PA-01-V): un correo nuevo permite registrar una cuenta", () => {
  // Dado un correo sin registrar.
  const servicio = new ServicioCuentas(baseDeDatos);

  // Cuando Ana se registra.
  const resultado = servicio.registrar(datosDeAna);

  // Entonces se guarda una cuenta y se devuelve su identificador.
  const cuentas = baseDeDatos.prepare("SELECT identificador, correo FROM cuentas").all();
  comprobarIgualdad(cuentas.length, 1);
  comprobarIgualdad(cuentas[0]?.correo, datosDeAna.correo);
  comprobarIgualdad(resultado, { identificador: cuentas[0]?.identificador });
});

prueba("H01_E01-I1 (PA-01-I): un correo duplicado se rechaza sin crear otra cuenta", () => {
  // Dado que Ana ya tiene una cuenta.
  baseDeDatos.prepare("INSERT INTO cuentas VALUES (?, ?, ?, ?)").run(
    "cuenta-ana",
    datosDeAna.nombre,
    datosDeAna.correo,
    "hash-de-prueba",
  );
  const servicio = new ServicioCuentas(baseDeDatos);

  // Cuando repite el alta, se rechaza por correo duplicado.
  comprobarError(() => servicio.registrar(datosDeAna), /correo duplicado/i);

  // Entonces sigue existiendo solo la cuenta original.
  const cuentas = baseDeDatos.prepare("SELECT identificador FROM cuentas").all();
  comprobarIgualdad(cuentas.length, 1);
  comprobarIgualdad(cuentas[0]?.identificador, "cuenta-ana");
});
