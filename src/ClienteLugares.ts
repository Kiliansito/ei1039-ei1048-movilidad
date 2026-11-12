import type { Lugar } from "./ServicioLugares.ts";

export class ClienteLugares {
  constructor(_urlBase: string) {}

  // Solicita los lugares de la sesion al servidor.
  async consultarLugares(_token: string): Promise<Lugar[]> {
    throw new Error("Cliente de lugares sin implementar");
  }
}
