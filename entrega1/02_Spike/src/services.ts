import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import {
  AppError,
  defaults,
  type RepositoryPort,
  type RoutingPort,
  type GeocodingPort,
  type PricePort,
  type Collection,
  type Preferences,
  type Route,
  type Vehicle,
  type Mode,
  type Preference,
} from "./domain/types.ts";
import { estimate } from "./domain/cost.ts";
const text = (v: unknown, max = 120) =>
  typeof v === "string" && v.trim().length > 0 && v.trim().length <= max
    ? v.trim()
    : (() => {
        throw new AppError("Revisa los campos obligatorios.");
      })();
const finite = (v: unknown, min: number, max: number) =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
const pickUser = (u: any) => ({ id: u.id, name: u.name, email: u.email });
const digest = (s: string) => createHash("sha256").update(s).digest("hex");
const passwordHash = (password: string) => {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
};
const verify = (password: string, hash: string) => {
  const [salt, key] = hash.split(":");
  return timingSafeEqual(
    scryptSync(password, salt, 64),
    Buffer.from(key, "hex"),
  );
};
export class MobilityService {
  repo: RepositoryPort;
  routing?: RoutingPort;
  geocoder?: GeocodingPort;
  prices?: PricePort;
  constructor({
    repo,
    routing,
    geocoder,
    prices,
  }: {
    repo: RepositoryPort;
    routing?: RoutingPort;
    geocoder?: GeocodingPort;
    prices?: PricePort;
  }) {
    this.repo = repo;
    this.routing = routing;
    this.geocoder = geocoder;
    this.prices = prices;
  }
  register(input: any) {
    const name = text(input.name, 70),
      email = text(input.email, 254).toLowerCase();
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof input.password !== "string" ||
      input.password.length < 10 ||
      input.password.length > 128
    )
      throw new AppError(
        "Usa un correo válido y una contraseña de 10 a 128 caracteres.",
      );
    if (this.repo.findUser(email))
      throw new AppError("Este correo ya está registrado.", 409);
    const u = {
      id: randomUUID(),
      name,
      email,
      password: passwordHash(input.password),
    };
    this.repo.createUser(u);
    return pickUser(u);
  }
  login(input: any) {
    const email = text(input.email, 254).toLowerCase();
    const password = text(input.password, 128);
    const u = this.repo.findUser(email);
    if (!u || !verify(password, u.password))
      throw new AppError("Credenciales incorrectas.", 401);
    const token = randomBytes(32).toString("hex");
    this.repo.createSession(digest(token), u.id, Date.now() + 7 * 86400000);
    return { user: pickUser(u), token };
  }
  session(token: string) {
    if (!token) return null;
    const u = this.repo.session(digest(token));
    return u ? pickUser(u) : null;
  }
  logout(token: string) {
    this.repo.deleteSession(digest(token));
  }
  deleteAccount(id: string, password: string) {
    const u = this.repo.getUser(id);
    if (
      !u ||
      typeof password !== "string" ||
      password.length > 128 ||
      !verify(password, u.password)
    )
      throw new AppError("Contraseña incorrecta.", 401);
    this.repo.deleteUser(id);
  }
  private user(id: string) {
    const u = this.repo.getUser(id);
    if (!u) throw new AppError("Inicia sesión para continuar.", 401);
    return u;
  }
  private prefs(id: string): Preferences {
    return { ...defaults, ...this.repo.getPreferences(id) };
  }
  state(id: string) {
    const u = this.user(id);
    return {
      user: pickUser(u),
      places: this.repo.list(id, "places"),
      vehicles: this.repo.list(id, "vehicles"),
      routes: this.repo.list(id, "routes"),
      preferences: this.prefs(id),
    };
  }
  addPlace(id: string, input: any) {
    this.user(id);
    if (!finite(input.lat, -90, 90) || !finite(input.lon, -180, 180))
      throw new AppError("Las coordenadas no son válidas.");
    const previous = input.id ? this.owned(id, "places", input.id) : null;
    const p = {
      id: previous?.id ?? randomUUID(),
      name: text(input.name),
      lat: input.lat,
      lon: input.lon,
      favorite: previous?.favorite ?? false,
    };
    this.repo.put(id, "places", p);
    return p;
  }
  async searchPlaces(query: string) {
    text(query, 200);
    if (!this.geocoder)
      throw new AppError(
        "Configura la clave de OpenRouteService para buscar lugares.",
        503,
      );
    return this.geocoder.search(query.trim());
  }
  async reverse(lat: number, lon: number) {
    if (!finite(lat, -90, 90) || !finite(lon, -180, 180))
      throw new AppError("Coordenadas no válidas.");
    if (!this.geocoder)
      return { name: `${lat.toFixed(5)}, ${lon.toFixed(5)}`, lat, lon };
    return this.geocoder.reverse(lat, lon);
  }
  saveVehicle(id: string, input: any) {
    this.user(id);
    if (
      !["petrol", "diesel", "electric"].includes(input.type) ||
      !finite(input.consumption, 0.1, 100)
    )
      throw new AppError("Revisa el tipo de vehículo y su consumo (0,1–100).");
    const previous = input.id ? this.owned(id, "vehicles", input.id) : null;
    const v = {
      id: previous?.id ?? randomUUID(),
      name: text(input.name, 70),
      type: input.type,
      consumption: input.consumption,
      favorite: previous?.favorite ?? false,
    };
    this.repo.put(id, "vehicles", v);
    return v;
  }
  private owned(id: string, kind: Collection, itemId: string) {
    this.user(id);
    const item = this.repo.get(id, kind, itemId);
    if (!item) throw new AppError("No se encuentra este elemento.", 404);
    return item;
  }
  remove(id: string, kind: Collection, itemId: string) {
    this.owned(id, kind, itemId);
    this.repo.remove(id, kind, itemId);
    const stored = this.prefs(id);
    const last = stored.lastJourney;
    if (last) {
      for (const field of (kind === "places"
        ? ["fromId", "toId"]
        : kind === "vehicles"
          ? ["vehicleId"]
          : []) as ("fromId" | "toId" | "vehicleId")[]) {
        if (last[field] === itemId) last[field] = "";
      }
      this.repo.setPreferences(id, { ...stored, lastJourney: last });
    }
    if (kind === "vehicles" && this.prefs(id).vehicleId === itemId)
      this.preferences(id, { vehicleId: null });
  }
  favorite(id: string, kind: Collection, itemId: string) {
    const item = this.owned(id, kind, itemId);
    item.favorite = !item.favorite;
    this.repo.put(id, kind, item);
    return item;
  }
  preferences(id: string, input: any) {
    this.user(id);
    const allowed = [
      "mode",
      "preference",
      "theme",
      "weight",
      "vehicleId",
      "manualPrices",
      "useManualPrices",
      "lastJourney",
    ];
    if (Object.keys(input).some((k) => !allowed.includes(k)))
      throw new AppError("Preferencia desconocida.");
    const p = { ...this.prefs(id), ...input };
    if (
      !["car", "bike", "foot"].includes(p.mode) ||
      !["fastest", "shortest", "cheapest"].includes(p.preference) ||
      !["light", "dark", "system"].includes(p.theme) ||
      !finite(p.weight, 20, 300) ||
      typeof p.useManualPrices !== "boolean"
    )
      throw new AppError("Preferencias no válidas.");
    if (p.vehicleId !== null) this.owned(id, "vehicles", p.vehicleId);
    if (p.lastJourney) {
      const j = p.lastJourney;
      if (
        !["car", "bike", "foot"].includes(j.mode) ||
        !["fastest", "shortest", "cheapest"].includes(j.preference) ||
        !["fromId", "toId", "vehicleId"].every((k) => typeof j[k] === "string")
      )
        throw new AppError("Trayecto reciente no válido.");
      if (j.fromId) this.owned(id, "places", j.fromId);
      if (j.toId) this.owned(id, "places", j.toId);
      if (j.vehicleId) this.owned(id, "vehicles", j.vehicleId);
    }
    if (
      !p.manualPrices ||
      !["petrol", "diesel", "electric"].every((k) =>
        finite(p.manualPrices[k], 0.001, 20),
      )
    )
      throw new AppError("Los precios manuales deben estar entre 0,001 y 20.");
    this.repo.setPreferences(id, p);
    return p;
  }
  async plan(id: string, input: any) {
    this.user(id);
    const p = this.prefs(id);
    const mode: Mode = input.mode ?? p.mode,
      preference: Preference = input.preference ?? p.preference;
    if (
      !["car", "bike", "foot"].includes(mode) ||
      !["fastest", "shortest", "cheapest"].includes(preference)
    )
      throw new AppError("Modo o criterio no válido.");
    const from = this.owned(id, "places", input.from),
      to = this.owned(id, "places", input.to);
    if (from.id === to.id || (from.lat === to.lat && from.lon === to.lon))
      throw new AppError("Elige dos lugares diferentes.");
    const vid = input.vehicleId ?? p.vehicleId;
    const vehicle: Vehicle = vid
      ? this.owned(id, "vehicles", vid)
      : {
          id: "reference",
          name: "Coche de referencia",
          type: "petrol",
          consumption: 6,
          favorite: false,
        };
    if (!this.routing)
      throw new AppError(
        "Añade ORS_API_KEY en .env y reinicia Vía para calcular rutas reales.",
        503,
      );
    let price = {
      petrol: null,
      diesel: null,
      electric: null,
      source: "Precio no disponible",
      estimated: true,
    } as import("./domain/types.ts").Prices;
    if (mode === "car")
      price = p.useManualPrices
        ? {
            ...p.manualPrices,
            source: "Precio manual",
            date: new Date().toISOString(),
            estimated: true,
          }
        : ((await this.prices?.current().catch(() => price)) ?? price);
    const raw = await this.routing.routes(from, to, mode);
    if (!raw.length)
      throw new AppError(
        "No se ha encontrado una ruta entre estos lugares.",
        422,
      );
    const routes: Route[] = raw.map((r) => {
      if (
        !finite(r.distance, 0, 100000000) ||
        !finite(r.duration, 0, 100000000) ||
        !Array.isArray(r.geometry) ||
        r.geometry.length < 2 ||
        !r.geometry.every(
          (c) =>
            Array.isArray(c) &&
            finite(c[0], -180, 180) &&
            finite(c[1], -90, 90),
        )
      )
        throw new AppError("El proveedor ha devuelto una ruta no válida.", 502);
      return {
        ...r,
        ...estimate(mode, r.distance, r.duration, p.weight, vehicle, price),
        mode,
        from,
        to,
        vehicle: mode === "car" ? vehicle : undefined,
        price: mode === "car" ? (price[vehicle.type] ?? undefined) : undefined,
        priceSource: price.source,
        priceDate: price.date,
        estimated: true,
        calculatedAt: new Date().toISOString(),
      };
    });
    const score = (r: Route) =>
      preference === "fastest"
        ? r.duration
        : preference === "shortest"
          ? r.distance
          : (r.cost ?? Infinity);
    routes.sort((a, b) => score(a) - score(b) || a.distance - b.distance);
    return { routes, preference, price };
  }
  saveRoute(id: string, input: any) {
    this.user(id);
    if (
      !finite(input.distance, 0, 100000000) ||
      !finite(input.duration, 0, 100000000) ||
      !Array.isArray(input.geometry) ||
      input.geometry.length < 2 ||
      !["car", "bike", "foot"].includes(input.mode)
    )
      throw new AppError("Primero calcula una ruta válida.");
    const r = {
      ...input,
      id: randomUUID(),
      name: text(
        input.name ??
          `${input.from?.name ?? "Origen"} → ${input.to?.name ?? "Destino"}`,
      ),
      favorite: false,
    };
    this.repo.put(id, "routes", r);
    return r;
  }
}
