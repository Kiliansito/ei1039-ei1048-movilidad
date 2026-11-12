import {
  deepEqual as comprobarIgualdad,
  rejects as comprobarRechazo,
  throws as comprobarError,
} from "node:assert/strict";
import { DatabaseSync as BaseDeDatos } from "node:sqlite";
import { beforeEach as antesDeCadaPrueba, test as prueba } from "node:test";
import { ServicioCuentas } from "../src/ServicioCuentas.ts";
import { ClienteCuentas } from "../src/ClienteCuentas.ts";
import { prepararServidorNoDisponible } from "./servidor-no-disponible.ts";

// Datos ficticios de registro.
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

// PA-01-V (E-01-V).
prueba("registrar_correoNuevo_creaCuentaYDevuelveIdentificador", () => {
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

// PA-01-I (E-01-I1).
prueba("registrar_correoDuplicado_rechazaAltaSinCrearCuenta", () => {
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

// E-01-I2.
prueba("registrar_contrasenaCorta_rechazaAltaSinCrearCuenta", () => {
  // Dada una base sin cuentas.
  const servicio = new ServicioCuentas(baseDeDatos);

  // Cuando la contrasena es corta, se rechaza el alta.
  comprobarError(() => servicio.registrar({ ...datosDeAna, contrasena: "Corta123" }), /contraseña/i);

  // Entonces la base sigue vacia.
  comprobarIgualdad(baseDeDatos.prepare("SELECT identificador FROM cuentas").all(), []);
});

// E-01-I3.
prueba("registrar_correoInvalido_rechazaAltaSinCrearCuenta", () => {
  // Dada una base sin cuentas.
  const servicio = new ServicioCuentas(baseDeDatos);

  // Cuando el correo no tiene arroba, se rechaza el alta.
  comprobarError(() => servicio.registrar({ ...datosDeAna, correo: "ana.example.com" }), /correo/i);

  // Entonces la base sigue vacia.
  comprobarIgualdad(baseDeDatos.prepare("SELECT identificador FROM cuentas").all(), []);
});

// E-01-I4.
prueba("registrar_nombreVacio_rechazaAltaSinCrearCuenta", () => {
  // Dada una base sin cuentas.
  const servicio = new ServicioCuentas(baseDeDatos);

  // Cuando el nombre esta vacio, se rechaza el alta.
  comprobarError(() => servicio.registrar({ ...datosDeAna, nombre: "" }), /nombre/i);

  // Entonces la base sigue vacia.
  comprobarIgualdad(baseDeDatos.prepare("SELECT identificador FROM cuentas").all(), []);
});

// E-01-I5.
prueba("registrar_servidorNoDisponible_informaDelFalloDeConexion", async (contexto) => {
  // Dado un servidor que corta la conexion sin tramitar el alta.
  const servidor = await prepararServidorNoDisponible(contexto);
  const cliente = new ClienteCuentas(servidor.url);

  // Cuando se solicita el alta, se informa del fallo de conexion.
  await comprobarRechazo(() => cliente.registrar(datosDeAna), /no se puede conectar con el servidor/i);

  // Entonces se confirma que la solicitud llego al servidor de prueba.
  comprobarIgualdad(servidor.contarIntentos(), 1);
});
