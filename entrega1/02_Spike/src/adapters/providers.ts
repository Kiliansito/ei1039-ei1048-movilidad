import {
  AppError,
  type HttpPort,
  type GeocodingPort,
  type RoutingPort,
  type PricePort,
  type Prices,
  type Place,
  type Mode,
  type RawRoute,
} from "../domain/types.ts";
export class FetchHttp implements HttpPort {
  async json(url: string, init: RequestInit = {}) {
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        const r = await fetch(url, {
          ...init,
          signal: AbortSignal.timeout(18000),
          headers: { Accept: "application/json", ...init.headers },
        });
        if (r.ok) return await r.json();
        const error = await r.json().catch(() => null);
        if (r.status >= 500 && attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 400));
          continue;
        }
        if (
          r.status === 429 ||
          (r.status === 403 &&
            /quota exceeded/i.test(
              String(error?.error?.message ?? error?.error ?? ""),
            ))
        )
          throw new AppError(
            "El servicio ha alcanzado su límite de consultas. Prueba más tarde.",
            503,
          );
        if (r.status === 401 || r.status === 403)
          throw new AppError(
            "El proveedor ha rechazado la clave. Revisa ORS_API_KEY.",
            503,
          );
        if (error?.error?.code === 2010)
          throw new AppError(
            "No se encuentra una vía cercana al origen o al destino para este medio de transporte. Elige otro punto.",
            422,
          );
        if (error?.error?.code === 2009)
          throw new AppError(
            "No se ha encontrado una ruta entre estos puntos para el medio de transporte elegido.",
            422,
          );
        if (r.status >= 500)
          throw new AppError(
            "El proveedor de rutas no está disponible temporalmente. Vuelve a intentarlo en unos instantes.",
            503,
          );
        throw new AppError(
          "El servicio externo no ha podido completar la consulta.",
          502,
        );
      }
    } catch (e) {
      if (e instanceof AppError) throw e;
      throw new AppError(
        "No se puede conectar con el servicio. Comprueba tu conexión y vuelve a intentarlo.",
        503,
      );
    }
  }
}
// Cache only raw provider geometry, never user records or financial estimates.
// Identical requests share one in-flight query. Failures are always retryable.
export class CachedRouting implements RoutingPort {
  private cache = new Map<string, { expires: number; routes: RawRoute[] }>();
  private pending = new Map<string, Promise<RawRoute[]>>();
  constructor(
    private source: RoutingPort,
    private ttl = 180000,
    private now = Date.now,
  ) {}
  async routes(from: Place, to: Place, mode: Mode): Promise<RawRoute[]> {
    const key = JSON.stringify([from.lon, from.lat, to.lon, to.lat, mode]);
    const cached = this.cache.get(key);
    if (cached && cached.expires > this.now())
      return structuredClone(cached.routes);
    this.cache.delete(key);
    let request = this.pending.get(key);
    if (!request) {
      request = this.source
        .routes(from, to, mode)
        .then((routes) => {
          if (routes.length) {
            if (this.cache.size >= 100)
              this.cache.delete(this.cache.keys().next().value!);
            this.cache.set(key, {
              expires: this.now() + this.ttl,
              routes: structuredClone(routes),
            });
          }
          return routes;
        })
        .finally(() => this.pending.delete(key));
      this.pending.set(key, request);
    }
    return structuredClone(await request);
  }
}
export class OrsAdapter implements RoutingPort, GeocodingPort {
  constructor(
    private key: string,
    private http: HttpPort = new FetchHttp(),
  ) {}
  private requireKey() {
    if (!this.key)
      throw new AppError(
        "Configura ORS_API_KEY en .env para buscar lugares y calcular rutas reales.",
        503,
      );
  }
  async search(query: string) {
    this.requireKey();
    const data = await this.http.json(
      `https://api.openrouteservice.org/geocode/search?api_key=${encodeURIComponent(this.key)}&text=${encodeURIComponent(query)}&size=5&lang=es`,
    );
    return this.places(data);
  }
  async reverse(lat: number, lon: number) {
    this.requireKey();
    const data = await this.http.json(
      `https://api.openrouteservice.org/geocode/reverse?api_key=${encodeURIComponent(this.key)}&point.lon=${lon}&point.lat=${lat}&size=1&lang=es`,
    );
    return (
      this.places(data)[0] ?? {
        name: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
        lat,
        lon,
      }
    );
  }
  private places(data: any) {
    if (!Array.isArray(data.features))
      throw new AppError("Respuesta geográfica no válida.", 502);
    return data.features
      .filter(
        (f: any) =>
          Array.isArray(f.geometry?.coordinates) &&
          Number.isFinite(f.geometry.coordinates[0]) &&
          Number.isFinite(f.geometry.coordinates[1]),
      )
      .map((f: any) => ({
        name: String(f.properties?.label ?? f.properties?.name ?? "Lugar"),
        lon: f.geometry.coordinates[0],
        lat: f.geometry.coordinates[1],
      }));
  }
  async routes(from: Place, to: Place, mode: Mode): Promise<RawRoute[]> {
    this.requireKey();
    const profile = {
      car: "driving-car",
      bike: "cycling-regular",
      foot: "foot-walking",
    }[mode];
    const request = async (preference: string) => {
      const data = await this.http.json(
        `https://api.openrouteservice.org/v2/directions/${profile}/geojson`,
        {
          method: "POST",
          headers: {
            Authorization: this.key,
            Accept: "application/geo+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            coordinates: [
              [from.lon, from.lat],
              [to.lon, to.lat],
            ],
            preference,
            instructions: true,
            language: "es",
          }),
        },
      );
      if (!Array.isArray(data.features) || !data.features.length)
        throw new AppError("No se ha encontrado un trayecto válido.", 422);
      return data.features.map((f: any) => ({
        distance: f.properties?.summary?.distance,
        duration: f.properties?.summary?.duration,
        geometry: f.geometry?.coordinates,
        steps: (f.properties?.segments ?? []).flatMap((s: any) =>
          (s.steps ?? []).map((step: any) => String(step.instruction)),
        ),
      }));
    };
    const first = await request(mode === "car" ? "fastest" : "recommended");
    const second = await request("shortest");
    const unique = new Map<string, RawRoute>();
    for (const r of [...first, ...second])
      unique.set(JSON.stringify(r.geometry), r);
    return [...unique.values()];
  }
}
export class PublicPrices implements PricePort {
  constructor(private http: HttpPort = new FetchHttp()) {}
  async current(): Promise<Prices> {
    const date = new Date().toISOString().slice(0, 10);
    const [fuel, power] = await Promise.allSettled([
      this.http.json(
        "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/",
      ),
      this.http.json(
        `https://apidatos.ree.es/es/datos/mercados/precios-mercados-tiempo-real?start_date=${date}T00:00&end_date=${date}T23:59&time_trunc=hour`,
      ),
    ]);
    const f = fuel.status === "fulfilled" ? fuel.value : null;
    const e = power.status === "fulfilled" ? power.value : null;
    const mean = (xs: number[]) =>
      xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
    const fuelMean = (key: string) =>
      mean(
        (f?.ListaEESSPrecio ?? [])
          .map((s: any) => Number(String(s[key] ?? "").replace(",", ".")))
          .filter((n: number) => Number.isFinite(n) && n > 0),
      );
    const series =
      e?.included?.find((s: any) =>
        String(s.type).toLowerCase().includes("tiempo real"),
      ) ??
      e?.included?.find((s: any) =>
        String(s.type).toLowerCase().includes("spot"),
      );
    const values = (series?.attributes?.values ?? [])
      .map((v: any) => v.value)
      .filter((v: any) => typeof v === "number" && Number.isFinite(v));
    const electric = mean(values);
    return {
      petrol: fuelMean("Precio Gasolina 95 E5"),
      diesel: fuelMean("Precio Gasoleo A"),
      electric: electric == null ? null : electric / 1000,
      source: [
        f
          ? "MITECO · media nacional de estaciones"
          : "Carburantes no disponibles",
        series
          ? "REE · media diaria mayorista, sin impuestos ni peajes"
          : "Electricidad no disponible",
      ].join(" / "),
      date: f?.Fecha ?? date,
      estimated: true,
    };
  }
}
// Decorator: coalesces concurrent requests and keeps provider data for 30 minutes.
export class CachedPrices implements PricePort {
  private cached?: { value: Prices; expires: number };
  private pending?: Promise<Prices>;
  constructor(
    private provider: PricePort,
    private ttl = 30 * 60 * 1000,
  ) {}
  async current() {
    if (this.cached && this.cached.expires > Date.now())
      return this.cached.value;
    if (this.pending) return this.pending;
    this.pending = this.provider
      .current()
      .then((value) => {
        this.cached = { value, expires: Date.now() + this.ttl };
        return value;
      })
      .finally(() => {
        this.pending = undefined;
      });
    return this.pending;
  }
}
