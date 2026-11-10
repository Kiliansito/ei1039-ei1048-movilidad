import type { DatabaseSync as BaseDeDatos } from "node:sqlite";
import type { RoutingPort as ProveedorRutas } from "../entrega1/02_Spike/src/domain/types.ts";
import type { Coordenadas } from "./ServicioLugares.ts";

type RutaCalculada = {
  geometria: Coordenadas[];
  distanciaMetros: number;
  duracionSegundos: number;
};

export class ServicioRutas {
  constructor(_baseDeDatos: BaseDeDatos, _proveedor: ProveedorRutas) {}

  // Calcula la ruta entre dos lugares de la cuenta activa.
  async calcularRuta(
    _token: string,
    _datos: { origen: string; destino: string; modo: "aPie" | "bicicleta" | "coche" },
  ): Promise<RutaCalculada> {
    throw new Error("Calculo de ruta sin implementar");
  }
}
