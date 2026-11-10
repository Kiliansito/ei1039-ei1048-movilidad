import { deepEqual as comprobarIgualdad, throws as comprobarError } from "node:assert/strict";
import { test as prueba } from "node:test";
import { ServicioLugares } from "../src/ServicioLugares.ts";
import { centro, prepararBaseDeLugares, tokenDeAna, uji } from "./datos-lugares.ts";

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
