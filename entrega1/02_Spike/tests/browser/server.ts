// Test-only server. Production never imports or enables these fixture providers.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { createApi } from "../../src/http.ts";
import { MobilityService } from "../../src/services.ts";
import { SqliteRepository } from "../../src/repository.ts";
const repo = new SqliteRepository(":memory:");
const app = new MobilityService({
  repo,
  geocoder: {
    search: async () => [
      { name: "Estación de Castellón", lat: 39.988, lon: -0.052 },
    ],
    reverse: async (lat, lon) => ({ name: "Punto de prueba", lat, lon }),
  },
  routing: {
    routes: async (a, b, mode) => [
      {
        distance: 10000,
        duration: mode === "car" ? 600 : mode === "bike" ? 1200 : 4200,
        geometry: [
          [a.lon, a.lat],
          [-0.058, 39.99],
          [b.lon, b.lat],
        ],
        steps: ["Continúa hasta el destino."],
      },
      {
        distance: 8000,
        duration: mode === "car" ? 900 : mode === "bike" ? 1500 : 4800,
        geometry: [
          [a.lon, a.lat],
          [-0.054, 39.99],
          [b.lon, b.lat],
        ],
        steps: ["Gira a la derecha."],
      },
    ],
  },
  prices: {
    current: async () => ({
      petrol: 1.6,
      diesel: 1.5,
      electric: 0.2,
      source: "Fixture de prueba",
      estimated: true,
    }),
  },
});
const api = createApi(app, true);
// Each browser scenario has its own API limiter/plan cache, preserving the real
// limits without unrelated tests sharing a single loopback IP's auth budget.
const testApis = new Map<string, ReturnType<typeof createApi>>();
createServer(async (req, res) => {
  if (req.url?.startsWith("/api/")) {
    const scope = req.headers["x-via-test-scope"];
    if (typeof scope !== "string") return api(req, res);
    if (!testApis.has(scope)) testApis.set(scope, createApi(app, true));
    return testApis.get(scope)!(req, res);
  }
  try {
    const path = new URL(req.url ?? "/", "http://localhost").pathname;
    const file = resolve("dist", "." + (path === "/" ? "/index.html" : path));
    const data = await readFile(file);
    res.setHeader(
      "Content-Type",
      (
        {
          ".js": "application/javascript",
          ".css": "text/css",
          ".html": "text/html",
          ".webmanifest": "application/manifest+json",
          ".svg": "image/svg+xml",
          ".png": "image/png",
        } as any
      )[extname(file)] ?? "application/octet-stream",
    );
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end();
  }
}).listen(Number(process.env.VIA_TEST_PORT ?? 4180), "127.0.0.1");
