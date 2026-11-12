import {
  deepEqual as comprobarIgualdad,
  rejects as comprobarRechazo,
  throws as comprobarError,
} from "node:assert/strict";
import { test as prueba } from "node:test";
import { ClienteLugares } from "../src/ClienteLugares.ts";
import { ServicioLugares } from "../src/ServicioLugares.ts";
import { centro, prepararBaseDeLugares, tokenDeAna, uji } from "./datos-lugares.ts";
import { prepararServidorNoDisponible } from "./servidor-no-disponible.ts";

// PA-07-V (E-07-V).
prueba("consultarLugares_sesionDeAna_devuelveSoloSusLugares", (contexto) => {
  // Dados Centro y UJI de Ana y Estacion de Luis.
  const base = prepararBaseDeLugares();
  contexto.after(() => base.close());
  base.exec("INSERT INTO cuentas VALUES ('cuenta-luis', 'Luis', 'luis@example.com', 'hash-de-prueba')");
  const insertar = base.prepare("INSERT INTO lugares VALUES (?, ?, ?, ?, ?)");
  insertar.run("centro", "cuenta-ana", centro.nombre, centro.latitud, centro.longitud);
  insertar.run("uji", "cuenta-ana", uji.nombre, uji.latitud, uji.longitud);
  insertar.run("estacion", "cuenta-luis", "Estación", 39.9886, -0.0541);
  const servicio = new ServicioLugares(base);

  // Cuando Ana consulta sus lugares.
  const lugares = servicio.consultarLugares(tokenDeAna);

  // Entonces solo recibe Centro y UJI.
  comprobarIgualdad(lugares.map((lugar) => lugar.nombre).sort(), ["Centro", "UJI"]);
});

// PA-07-I (E-07-I1).
prueba("consultarLugares_sesionInvalida_deniegaAcceso", (contexto) => {
  // Dado Centro de Ana y un token invalido.
  const base = prepararBaseDeLugares();
  contexto.after(() => base.close());
  base.prepare("INSERT INTO lugares VALUES (?, ?, ?, ?, ?)")
    .run("centro", "cuenta-ana", centro.nombre, centro.latitud, centro.longitud);
  const servicio = new ServicioLugares(base);

  // Cuando se consulta con ese token, se deniega el acceso.
  comprobarError(() => servicio.consultarLugares("token-invalido"), /sesión no válida/i);
});

// E-07-V2.
prueba("consultarLugares_cuentaSinLugares_devuelveListaVacia", (contexto) => {
  // Dada Ana sin lugares y Luis con Estacion.
  const base = prepararBaseDeLugares();
  contexto.after(() => base.close());
  base.exec("INSERT INTO cuentas VALUES ('cuenta-luis', 'Luis', 'luis@example.com', 'hash-de-prueba')");
  base.prepare("INSERT INTO lugares VALUES (?, ?, ?, ?, ?)")
    .run("estacion", "cuenta-luis", "Estación", 39.9886, -0.0541);
  const servicio = new ServicioLugares(base);

  // Cuando Ana consulta sus lugares.
  const lugares = servicio.consultarLugares(tokenDeAna);

  // Entonces recibe una lista vacia.
  comprobarIgualdad(lugares, []);
});

// E-07-I2.
prueba("consultarLugares_servidorNoDisponible_informaDelFalloDeConexion", async (contexto) => {
  // Dado un servidor que corta la conexion.
  const servidor = await prepararServidorNoDisponible(contexto);
  const cliente = new ClienteLugares(servidor.url);

  // Cuando Ana consulta, se informa del fallo en lugar de dar una lista vacia.
  await comprobarRechazo(() => cliente.consultarLugares(tokenDeAna), /no se puede conectar con el servidor/i);

  // Entonces se confirma el intento de conexion.
  comprobarIgualdad(servidor.contarIntentos(), 1);
});
