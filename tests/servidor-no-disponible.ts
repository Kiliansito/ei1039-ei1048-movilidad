import { once as esperarEvento } from "node:events";
import { createServer as crearServidor } from "node:http";
import type { TestContext as ContextoPrueba } from "node:test";

export async function prepararServidorNoDisponible(contexto: ContextoPrueba) {
  let intentos = 0;
  // Corta la conexion antes de tramitar la peticion.
  const servidor = crearServidor((_peticion, respuesta) => {
    intentos++;
    respuesta.destroy();
  });
  servidor.listen(0, "127.0.0.1");
  await esperarEvento(servidor, "listening");
  contexto.after(() => { servidor.close(); });

  const direccion = servidor.address();
  if (!direccion || typeof direccion === "string") {
    throw new Error("No se pudo preparar el servidor de prueba");
  }

  return {
    url: `http://127.0.0.1:${direccion.port}`,
    contarIntentos: () => intentos,
  };
}
