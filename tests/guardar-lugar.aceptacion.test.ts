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

// E-05-I2.
prueba("guardarPorCoordenadas_longitudFueraDeRango_rechazaAltaSinGuardarLugar", (contexto) => {
  // Dada Ana sin lugares.
  const base = prepararBaseDeLugares();
  contexto.after(() => base.close());
  const servicio = new ServicioLugares(base);

  // Cuando usa longitud 181, se rechaza el alta.
  comprobarError(() => servicio.guardarPorCoordenadas(tokenDeAna, { ...centro, longitud: 181 }), /longitud/i);

  // Entonces la lista sigue vacia.
  comprobarIgualdad(base.prepare("SELECT identificador FROM lugares").all(), []);
});

// E-05-I3.
prueba("guardarPorCoordenadas_nombreVacio_rechazaAltaSinGuardarLugar", (contexto) => {
  // Dada Ana sin lugares.
  const base = prepararBaseDeLugares();
  contexto.after(() => base.close());
  const servicio = new ServicioLugares(base);

  // Cuando deja el nombre vacio, se rechaza el alta.
  comprobarError(() => servicio.guardarPorCoordenadas(tokenDeAna, { ...centro, nombre: "" }), /nombre/i);

  // Entonces la lista sigue vacia.
  comprobarIgualdad(base.prepare("SELECT identificador FROM lugares").all(), []);
});

// E-05-I4.
prueba("guardarPorCoordenadas_sesionInvalida_deniegaAltaSinGuardarLugar", (contexto) => {
  // Dada Ana sin lugares.
  const base = prepararBaseDeLugares();
  contexto.after(() => base.close());
  const servicio = new ServicioLugares(base);

  // Cuando usa un token invalido, se rechaza el alta.
  comprobarError(() => servicio.guardarPorCoordenadas("token-invalido", centro), /sesión no válida/i);

  // Entonces la lista sigue vacia.
  comprobarIgualdad(base.prepare("SELECT identificador FROM lugares").all(), []);
});
