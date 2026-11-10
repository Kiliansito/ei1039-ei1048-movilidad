import { deepEqual as comprobarIgualdad, throws as comprobarError } from "node:assert/strict";
import { test as prueba } from "node:test";
import { ServicioLugares } from "../src/ServicioLugares.ts";
import { centro, prepararBaseDeLugares, tokenDeAna } from "./datos-lugares.ts";

// PA-05-V (E-05-V).
prueba("guardarPorCoordenadas_coordenadasValidas_guardaLugarDeAna", (contexto) => {
  // Dada Ana sin lugares.
  const base = prepararBaseDeLugares();
  contexto.after(() => base.close());
  const servicio = new ServicioLugares(base);

  // Cuando guarda Centro.
  servicio.guardarPorCoordenadas(tokenDeAna, centro);

  // Entonces se guarda Centro para Ana.
  const lugares = base.prepare("SELECT identificador_cuenta, nombre, latitud, longitud FROM lugares").all();
  comprobarIgualdad(lugares.map((lugar) => ({ ...lugar })), [
    { identificador_cuenta: "cuenta-ana", ...centro },
  ]);
});

// PA-05-I (E-05-I1).
prueba("guardarPorCoordenadas_latitudFueraDeRango_rechazaAltaSinGuardarLugar", (contexto) => {
  // Dada Ana sin lugares.
  const base = prepararBaseDeLugares();
  contexto.after(() => base.close());
  const servicio = new ServicioLugares(base);

  // Cuando usa latitud 91, se rechaza el alta.
  comprobarError(() => servicio.guardarPorCoordenadas(tokenDeAna, { ...centro, latitud: 91 }), /latitud/i);

  // Entonces la lista sigue vacia.
  comprobarIgualdad(base.prepare("SELECT identificador FROM lugares").all(), []);
});

const altasInvalidas = [
  {
    escenario: "E-05-I2",
    nombre: "guardarPorCoordenadas_longitudFueraDeRango_rechazaAltaSinGuardarLugar",
    token: tokenDeAna,
    datos: { ...centro, longitud: 181 },
    error: /longitud/i,
  },
  {
    escenario: "E-05-I3",
    nombre: "guardarPorCoordenadas_nombreVacio_rechazaAltaSinGuardarLugar",
    token: tokenDeAna,
    datos: { ...centro, nombre: "" },
    error: /nombre/i,
  },
  {
    escenario: "E-05-I4",
    nombre: "guardarPorCoordenadas_sesionInvalida_deniegaAltaSinGuardarLugar",
    token: "token-invalido",
    datos: centro,
    error: /sesión no válida/i,
  },
];

for (const { escenario, nombre, token, datos, error } of altasInvalidas) {
  prueba(nombre, (contexto) => {
    // Dada Ana sin lugares.
    const base = prepararBaseDeLugares();
    contexto.after(() => base.close());
    const servicio = new ServicioLugares(base);

    // Cuando intenta el alta, se rechaza por el motivo del escenario.
    comprobarError(() => servicio.guardarPorCoordenadas(token, datos), error, escenario);

    // Entonces la lista sigue vacia.
    comprobarIgualdad(base.prepare("SELECT identificador FROM lugares").all(), []);
  });
}
