import type { DatabaseSync as BaseDeDatos } from "node:sqlite";

export class ServicioCuentas {
  // Recibe la base de datos de cuentas.
  constructor(_baseDeDatos: BaseDeDatos) {}

  // El alta devolverá solo el identificador.
  registrar(_datos: { nombre: string; correo: string; contrasena: string }): { identificador: string } {
    // Fallo esperado en la fase roja de ATDD.
    throw new Error("Registro sin implementar");
  }
}
