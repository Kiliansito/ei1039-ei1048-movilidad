import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { SqliteRepository } from "./repository.ts";
import { MobilityService } from "./services.ts";
import {
  OrsAdapter,
  PublicPrices,
  CachedPrices,
  CachedRouting,
} from "./adapters/providers.ts";
import { createApi } from "./http.ts";
const production =
  process.argv.includes("--production") ||
  process.env.NODE_ENV === "production";
const repo = new SqliteRepository(
  process.env.DATABASE_PATH ?? "data/via.sqlite",
);
const ors = process.env.ORS_API_KEY
  ? new OrsAdapter(process.env.ORS_API_KEY)
  : undefined;
const app = new MobilityService({
  repo,
  routing: ors ? new CachedRouting(ors) : undefined,
  geocoder: ors,
  prices: new CachedPrices(new PublicPrices()),
});
const api = createApi(app, !!ors);
const vite = production
  ? null
  : await (
      await import("vite")
    ).createServer({ server: { middlewareMode: true }, appType: "spa" });
const types: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json",
  ".json": "application/json",
  ".woff2": "font/woff2",
};
const server = createServer(async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (req.url?.startsWith("/api/")) return api(req, res);
  if (vite) return vite.middlewares(req, res);
  try {
    const root = resolve("dist");
    let path = resolve(
      root,
      "." +
        decodeURIComponent(
          new URL(req.url ?? "/", "http://localhost").pathname,
        ),
    );
    if (!path.startsWith(root + sep) && path !== root) {
      res.writeHead(403);
      return res.end();
    }
    try {
      if (!(await stat(path)).isFile()) path = resolve(root, "index.html");
    } catch {
      if (extname(path)) {
        res.writeHead(404);
        return res.end("Not found");
      }
      path = resolve(root, "index.html");
    }
    const data = await readFile(path);
    res.setHeader(
      "Content-Type",
      types[extname(path)] ?? "application/octet-stream",
    );
    res.setHeader(
      "Cache-Control",
      path.includes("/assets/")
        ? "public, max-age=31536000, immutable"
        : "no-cache",
    );
    res.end(data);
  } catch {
    res.writeHead(500);
    res.end("Primero ejecuta npm run build.");
  }
});
server.listen(
  Number(process.env.PORT ?? 4173),
  process.env.HOST ?? "127.0.0.1",
  () =>
    console.log(
      `Vía disponible en http://localhost:${process.env.PORT ?? 4173} (${production ? "producción" : "desarrollo"})`,
    ),
);
async function shutdown() {
  server.close();
  await vite?.close();
  repo.close();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
