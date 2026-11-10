import type { DatabaseSync as BaseDeDatos } from "node:sqlite";

export class ServicioCuentas {
  constructor(_baseDeDatos: BaseDeDatos) {}

  registrar(_datos: { nombre: string; correo: string; contrasena: string }): { identificador: string } {
    throw new Error("Registro sin implementar");
  }
}
