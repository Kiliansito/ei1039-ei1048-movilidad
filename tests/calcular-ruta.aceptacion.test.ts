import { deepEqual as comprobarIgualdad, ok as comprobar, rejects as comprobarRechazo } from "node:assert/strict";
import { test as prueba } from "node:test";
import { OrsAdapter as AdaptadorORS } from "../entrega1/02_Spike/src/adapters/providers.ts";
import { ServicioRutas } from "../src/ServicioRutas.ts";
import { centro, prepararBaseDeLugares, tokenDeAna, uji } from "./datos-lugares.ts";

// PA-14-V (E-14-V).
prueba("calcularRuta_extremosDistintos_devuelveTrayectoDistanciaYDuracion", async (contexto) => {
  // Dados Centro y UJI de Ana y el proveedor real.
  const base = prepararBaseDeLugares();
  contexto.after(() => base.close());
  const insertar = base.prepare("INSERT INTO lugares VALUES (?, ?, ?, ?, ?)");
  insertar.run("centro", "cuenta-ana", centro.nombre, centro.latitud, centro.longitud);
  insertar.run("uji", "cuenta-ana", uji.nombre, uji.latitud, uji.longitud);
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
