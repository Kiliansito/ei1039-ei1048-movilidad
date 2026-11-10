import type { ServicioCuentas } from "./ServicioCuentas.ts";

export class ClienteCuentas {
  constructor(_urlBase: string) {}

  // Solicita el alta al servidor.
  async registrar(_datos: {
    nombre: string;
    correo: string;
    contrasena: string;
  }): Promise<{ identificador: string }> {
    throw new Error("Cliente de registro sin implementar");
  }

  // Solicita el inicio de sesion al servidor.
  async iniciarSesion(_credenciales: Parameters<ServicioCuentas["iniciarSesion"]>[0]):
    Promise<ReturnType<ServicioCuentas["iniciarSesion"]>> {
    throw new Error("Cliente de inicio de sesión sin implementar");
  }
}
