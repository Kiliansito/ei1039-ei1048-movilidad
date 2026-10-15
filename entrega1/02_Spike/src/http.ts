import type { IncomingMessage, ServerResponse } from "node:http";
import { AppError, type Collection } from "./domain/types.ts";
import type { MobilityService } from "./services.ts";
export function createApi(app: MobilityService, configured: boolean) {
  const limits = new Map<string, { count: number; expires: number }>();
  function rate(key: string, max: number) {
    const now = Date.now();
    for (const [k, v] of limits) if (v.expires < now) limits.delete(k);
    const entry = limits.get(key) ?? { count: 0, expires: now + 60000 };
    entry.count++;
    limits.set(key, entry);
    if (entry.count > max)
      throw new AppError(
        "Demasiadas consultas. Espera un minuto y vuelve a intentarlo.",
        429,
      );
  }
  const token = (req: IncomingMessage) =>
    req.headers.cookie
      ?.split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith("via_session="))
      ?.slice(12) ?? "";
  const reply = (res: ServerResponse, status: number, data: any) => {
    res.writeHead(status, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end(JSON.stringify(data));
  };
  const cookie = (res: ServerResponse, value: string, age = 604800) =>
    res.setHeader(
      "Set-Cookie",
      `via_session=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${process.env.COOKIE_SECURE === "true" ? "; Secure" : ""}`,
    );
  async function body(req: IncomingMessage) {
    let size = 0;
    const chunks = [];
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 65536)
        throw new AppError("La petición es demasiado grande.", 413);
      chunks.push(chunk);
    }
    try {
      const result = JSON.parse(Buffer.concat(chunks).toString() || "{}");
      if (!result || typeof result !== "object" || Array.isArray(result))
        throw new Error();
      return result;
    } catch {
      throw new AppError("Formato de petición no válido.");
    }
  }
  return async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const url = new URL(req.url ?? "/", `http://${req.headers.host}`),
        path = url.pathname,
        method = req.method ?? "GET";
      if (!["GET", "POST", "PATCH", "DELETE"].includes(method))
        throw new AppError("Método no permitido.", 405);
      if (method !== "GET") {
        if (req.headers["x-via-client"] !== "web")
          throw new AppError("Petición no autorizada.", 403);
        if (req.headers.origin) {
          const allowed =
            process.env.PUBLIC_ORIGIN ?? `http://${req.headers.host}`;
          if (req.headers.origin !== allowed)
            throw new AppError("Origen no autorizado.", 403);
        }
        if (!req.headers["content-type"]?.startsWith("application/json"))
          throw new AppError("Se requiere JSON.", 415);
      }
      if (path === "/api/health")
        return reply(res, 200, { ok: true, routingConfigured: configured });
      if (path === "/api/auth/register" && method === "POST") {
        rate("auth:" + req.socket.remoteAddress, 12);
        const input = await body(req);
        app.register(input);
        const session = app.login(input);
        cookie(res, session.token);
        return reply(res, 201, { user: session.user });
      }
      if (path === "/api/auth/login" && method === "POST") {
        rate("auth:" + req.socket.remoteAddress, 12);
        const session = app.login(await body(req));
        cookie(res, session.token);
        return reply(res, 200, { user: session.user });
      }
      const current = app.session(token(req));
      if (!current) throw new AppError("Inicia sesión para continuar.", 401);
      const id = current.id;
      if (path === "/api/auth/logout" && method === "POST") {
        app.logout(token(req));
        cookie(res, "", 0);
        return reply(res, 200, { ok: true });
      }
      if (path === "/api/account" && method === "DELETE") {
        const input = await body(req);
        app.deleteAccount(id, input.password);
        cookie(res, "", 0);
        return reply(res, 200, { ok: true });
      }
      if (path === "/api/state" && method === "GET")
        return reply(res, 200, app.stateForSession(token(req)));
      if (path === "/api/prices" && method === "GET") {
        rate("prices:" + id, 30);
        return reply(res, 200, await app.energyPrices(id));
      }
      if (path === "/api/search" && method === "GET") {
        rate("search:" + id, 30);
        return reply(
          res,
          200,
          await app.searchPlaces(url.searchParams.get("q") ?? ""),
        );
      }
      if (path === "/api/reverse" && method === "GET") {
        rate("search:" + id, 30);
        return reply(
          res,
          200,
          await app.reverse(
            Number(url.searchParams.get("lat")),
            Number(url.searchParams.get("lon")),
          ),
        );
      }
      if (path === "/api/places" && method === "POST")
        return reply(res, 201, app.addPlace(id, await body(req)));
      if (path === "/api/vehicles" && method === "POST")
        return reply(res, 201, app.saveVehicle(id, await body(req)));
      if (path === "/api/preferences" && method === "PATCH")
        return reply(res, 200, app.preferences(id, await body(req)));
      if (path === "/api/plan" && method === "POST") {
        rate("plan:" + id, 10);
        const input = await body(req);
        return reply(res, 200, await app.plan(id, input));
      }
      if (path === "/api/routes" && method === "POST") {
        return reply(res, 201, app.saveRoute(id, await body(req)));
      }
      const match = path.match(
        /^\/api\/(places|vehicles|routes)\/([^/]+)(\/favorite)?$/,
      );
      if (match) {
        const [, kind, itemId, favorite] = match;
        if (favorite && method === "PATCH")
          return reply(res, 200, app.favorite(id, kind as Collection, itemId));
        if (!favorite && method === "DELETE") {
          app.remove(id, kind as Collection, itemId);
          return reply(res, 200, { ok: true });
        }
      }
      throw new AppError("No se encuentra este recurso.", 404);
    } catch (error) {
      const e =
        error instanceof AppError
          ? error
          : new AppError(
              "No se ha podido completar la operación. Inténtalo de nuevo.",
              500,
            );
      if (e.status === 500) console.error(error);
      reply(res, e.status, { error: e.message });
    }
  };
}
