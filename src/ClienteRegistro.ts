export class ClienteRegistro {
  constructor(_urlBase: string) {}

  // Solicita el alta al servidor.
  async registrar(_datos: {
    nombre: string;
    correo: string;
    contrasena: string;
  }): Promise<{ identificador: string }> {
    throw new Error("Cliente de registro sin implementar");
  }
}
