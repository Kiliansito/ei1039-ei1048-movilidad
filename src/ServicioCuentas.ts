import type { DatabaseSync as BaseDeDatos } from "node:sqlite";

export class ServicioCuentas {
  // Recibe la base de datos de cuentas.
  constructor(_baseDeDatos: BaseDeDatos) {}

  // El alta devuelve solo el identificador.
  registrar(_datos: { nombre: string; correo: string; contrasena: string }): { identificador: string } {
    // Fallo esperado en la fase roja de ATDD.
    throw new Error("Registro sin implementar");
  }

  // La sesion devuelve un token y los datos publicos de la cuenta.
  iniciarSesion(_credenciales: { correo: string; contrasena: string }): {
    token: string;
    cuenta: { identificador: string; nombre: string; correo: string };
  } {
    throw new Error("Inicio de sesión sin implementar");
  }
}
