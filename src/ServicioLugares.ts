import type { DatabaseSync as BaseDeDatos } from "node:sqlite";

export type Coordenadas = { latitud: number; longitud: number };
export type Lugar = Coordenadas & { identificador: string; nombre: string };

export class ServicioLugares {
  constructor(_baseDeDatos: BaseDeDatos) {}

  // Guarda el lugar en la cuenta de la sesion.
  guardarPorCoordenadas(_token: string, _datos: Coordenadas & { nombre: string }): Lugar {
    throw new Error("Alta de lugar sin implementar");
  }

  // Devuelve solo los lugares de la cuenta activa.
  consultarLugares(_token: string): Lugar[] {
    throw new Error("Consulta de lugares sin implementar");
  }
}
