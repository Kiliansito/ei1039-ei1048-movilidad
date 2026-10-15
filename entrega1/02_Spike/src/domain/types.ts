export type Mode = "car" | "bike" | "foot";
export type Preference = "fastest" | "shortest" | "cheapest";
export type VehicleType = "petrol" | "diesel" | "electric";
export type Collection = "places" | "vehicles" | "routes";
export interface User {
  id: string;
  name: string;
  email: string;
}
export interface Place {
  id: string;
  name: string;
  lat: number;
  lon: number;
  favorite: boolean;
}
export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  consumption: number;
  favorite: boolean;
}
export interface Route {
  id?: string;
  name?: string;
  favorite?: boolean;
  distance: number;
  duration: number;
  geometry: number[][];
  steps: string[];
  cost: number | null;
  calories: number;
  mode: Mode;
  from?: Place;
  to?: Place;
  vehicle?: Vehicle;
  price?: number;
  priceSource?: string;
  priceDate?: string;
  estimated?: boolean;
  calculatedAt?: string;
  label?: string;
}
export interface Preferences {
  lastJourney?: {
    fromId: string;
    toId: string;
    mode: Mode;
    preference: Preference;
    vehicleId: string;
  };
  mode: Mode;
  preference: Preference;
  theme: "light" | "dark" | "system";
  weight: number;
  vehicleId: string | null;
  manualPrices: { petrol: number; diesel: number; electric: number };
  useManualPrices: boolean;
}
export interface State {
  user: User;
  places: Place[];
  vehicles: Vehicle[];
  routes: Route[];
  preferences: Preferences;
}
export interface GeocodedPlace {
  name: string;
  lat: number;
  lon: number;
}
export interface RawRoute {
  distance: number;
  duration: number;
  geometry: number[][];
  steps: string[];
}
export interface RoutingPort {
  routes(from: Place, to: Place, mode: Mode): Promise<RawRoute[]>;
}
export interface GeocodingPort {
  search(query: string): Promise<GeocodedPlace[]>;
  reverse(lat: number, lon: number): Promise<GeocodedPlace>;
}
export interface Prices {
  petrol: number | null;
  diesel: number | null;
  electric: number | null;
  source: string;
  date?: string;
  estimated: boolean;
}
export interface PricePort {
  current(): Promise<Prices>;
}
export interface HttpPort {
  json(url: string, init?: RequestInit): Promise<any>;
}
export interface RepositoryPort {
  getUser(id: string): any;
  findUser(email: string): any;
  createUser(user: any): void;
  deleteUser(id: string): void;
  list(userId: string, kind: Collection): any[];
  get(userId: string, kind: Collection, id: string): any;
  put(userId: string, kind: Collection, value: any): void;
  remove(userId: string, kind: Collection, id: string): boolean;
  getPreferences(id: string): Partial<Preferences>;
  setPreferences(id: string, value: Preferences): void;
  createSession(token: string, userId: string, expires: number): void;
  session(token: string): any;
  deleteSession(token: string): void;
}
export class AppError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export const defaults: Preferences = {
  mode: "car",
  preference: "fastest",
  theme: "light",
  weight: 70,
  vehicleId: null,
  manualPrices: { petrol: 1.6, diesel: 1.5, electric: 0.2 },
  useManualPrices: false,
};
