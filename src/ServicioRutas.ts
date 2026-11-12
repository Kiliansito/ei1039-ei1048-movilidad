import type { DatabaseSync as BaseDeDatos } from "node:sqlite";
import type { RoutingPort as ProveedorRutas } from "../entrega1/02_Spike/src/domain/types.ts";
import type { Coordenadas } from "./ServicioLugares.ts";

type ExtremoRuta = string | Coordenadas;

type RutaCalculada = {
  geometria: Coordenadas[];
  distanciaMetros: number;
  duracionSegundos: number;
};

export class ServicioRutas {
  constructor(_baseDeDatos: BaseDeDatos, _proveedor: ProveedorRutas) {}

  // Admite lugares guardados y puntos temporales.
  async calcularRuta(
    _token: string,
    _datos: { origen: ExtremoRuta; destino: ExtremoRuta; modo: "aPie" | "bicicleta" | "coche" },
  ): Promise<RutaCalculada> {
    throw new Error("Calculo de ruta sin implementar");
  }
}
