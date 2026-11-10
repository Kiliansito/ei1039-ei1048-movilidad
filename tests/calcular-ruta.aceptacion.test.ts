import { deepEqual as comprobarIgualdad, ok as comprobar, rejects as comprobarRechazo } from "node:assert/strict";
import { test as prueba, type TestContext as ContextoPrueba } from "node:test";
import { FetchHttp as ClienteHttp, OrsAdapter as AdaptadorORS } from "../entrega1/02_Spike/src/adapters/providers.ts";
import { ServicioRutas } from "../src/ServicioRutas.ts";
import { centro, prepararBaseDeLugares, tokenDeAna, uji } from "./datos-lugares.ts";
import { prepararServidorNoDisponible } from "./servidor-no-disponible.ts";

function prepararCentroYUji(contexto: ContextoPrueba) {
  const base = prepararBaseDeLugares();
  contexto.after(() => base.close());
  const insertar = base.prepare("INSERT INTO lugares VALUES (?, ?, ?, ?, ?)");
  insertar.run("centro", "cuenta-ana", centro.nombre, centro.latitud, centro.longitud);
  insertar.run("uji", "cuenta-ana", uji.nombre, uji.latitud, uji.longitud);
  return base;
}

// PA-14-V (E-14-V).
prueba("calcularRuta_extremosDistintos_devuelveTrayectoDistanciaYDuracion", async (contexto) => {
  // Dados Centro y UJI de Ana y el proveedor real.
  const base = prepararCentroYUji(contexto);
  const servicio = new ServicioRutas(base, new AdaptadorORS(process.env.ORS_API_KEY ?? ""));

  // Cuando Ana pide una ruta a pie.
  const ruta = await servicio.calcularRuta(tokenDeAna, { origen: "centro", destino: "uji", modo: "aPie" });

  // Entonces devuelve un trazado valido y medidas positivas.
  comprobar(ruta.geometria.length >= 2);
  for (const punto of ruta.geometria) {
    comprobar(Number.isFinite(punto.latitud) && Math.abs(punto.latitud) <= 90);
    comprobar(Number.isFinite(punto.longitud) && Math.abs(punto.longitud) <= 180);
  }
  comprobar(ruta.distanciaMetros > 0 && ruta.distanciaMetros < 100_000);
  comprobar(Number.isFinite(ruta.duracionSegundos) && ruta.duracionSegundos > 0);
});

// PA-14-I (E-14-I1).
prueba("calcularRuta_extremosCoincidentes_rechazaRutaSinGuardarCambios", async (contexto) => {
  // Dado el lugar Centro de Ana.
  const base = prepararBaseDeLugares();
  contexto.after(() => base.close());
  base.prepare("INSERT INTO lugares VALUES (?, ?, ?, ?, ?)")
    .run("centro", "cuenta-ana", centro.nombre, centro.latitud, centro.longitud);
  const servicio = new ServicioRutas(base, new AdaptadorORS(process.env.ORS_API_KEY ?? ""));
  const consultarCambios = base.prepare("SELECT total_changes() AS cambios");
  const cambiosAntes = consultarCambios.get();

  // Cuando pide ir de Centro a Centro, se rechaza el trayecto.
  await comprobarRechazo(
    () => servicio.calcularRuta(tokenDeAna, { origen: "centro", destino: "centro", modo: "aPie" }),
    /extremos coincidentes/i,
  );

  // Entonces no se guarda ningun cambio.
  comprobarIgualdad(consultarCambios.get(), cambiosAntes);
});

// E-14-I2.
prueba("calcularRuta_destinoInexistente_rechazaRutaSinGuardarCambios", async (contexto) => {
  // Dados Centro y UJI de Ana, pero ningun lugar llamado Puerto.
  const base = prepararCentroYUji(contexto);
  const servicio = new ServicioRutas(base, new AdaptadorORS(process.env.ORS_API_KEY ?? ""));
  const consultarCambios = base.prepare("SELECT total_changes() AS cambios");
  const cambiosAntes = consultarCambios.get();

  // Cuando pide ir a Puerto, se rechaza el destino.
  await comprobarRechazo(
    () => servicio.calcularRuta(tokenDeAna, { origen: "centro", destino: "puerto", modo: "aPie" }),
    /(?:destino|extremos?|lugar).*(?:no (?:existe|encontrad)|inválid|no válid)/i,
  );

  // Entonces no se guarda ningun cambio.
  comprobarIgualdad(consultarCambios.get(), cambiosAntes);
});

// E-14-I3.
prueba("calcularRuta_proveedorNoDisponible_informaDelFalloSinGuardarCambios", async (contexto) => {
  // Dados dos lugares validos y un proveedor que corta la conexion.
  const base = prepararCentroYUji(contexto);
  const servidor = await prepararServidorNoDisponible(contexto);
  const http = new ClienteHttp();
  // Envia la peticion HTTP al servidor de prueba con una clave ficticia.
  const proveedor = new AdaptadorORS("clave-de-prueba", {
    json: (_url, opciones) => http.json(servidor.url, opciones),
  });
  const servicio = new ServicioRutas(base, proveedor);
  const consultarCambios = base.prepare("SELECT total_changes() AS cambios");
  const cambiosAntes = consultarCambios.get();

  // Cuando pide la ruta, se informa del fallo del proveedor.
  await comprobarRechazo(
    () => servicio.calcularRuta(tokenDeAna, { origen: "centro", destino: "uji", modo: "aPie" }),
    /no se puede conectar con el servicio|proveedor.*no .*disponible/i,
  );

  // Entonces hubo un intento de conexion y no se guardaron cambios.
  comprobar(servidor.contarIntentos() > 0);
  comprobarIgualdad(consultarCambios.get(), cambiosAntes);
});

// E-14-I4.
prueba("calcularRuta_sesionInvalida_deniegaAccesoSinGuardarCambios", async (contexto) => {
  // Dados dos lugares validos y un token invalido.
  const base = prepararCentroYUji(contexto);
  const servicio = new ServicioRutas(base, new AdaptadorORS(process.env.ORS_API_KEY ?? ""));
  const consultarCambios = base.prepare("SELECT total_changes() AS cambios");
  const cambiosAntes = consultarCambios.get();

  // Cuando se pide la ruta con ese token, se deniega el acceso.
  await comprobarRechazo(
    () => servicio.calcularRuta("token-invalido", { origen: "centro", destino: "uji", modo: "aPie" }),
    /sesión no válida/i,
  );

  // Entonces no se guarda ningun cambio.
  comprobarIgualdad(consultarCambios.get(), cambiosAntes);
});
