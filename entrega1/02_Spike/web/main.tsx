import React, {
  useEffect,
  useState,
  useRef,
  type FormEvent,
  type ReactNode,
} from "react";
import { createRoot } from "react-dom/client";
import { api, vm, useApp } from "./model";
import { MapView } from "./Map";
import type {
  Collection,
  GeocodedPlace,
  Place,
  Prices,
  Preferences,
  Route,
  State,
  Vehicle,
} from "../src/domain/types";
import "@fontsource-variable/inter";
import "./style.css";

const pages = [
  "calcular",
  "lugares",
  "vehiculos",
  "rutas",
  "preferencias",
  "cuenta",
  "alta-lugar",
  "resultado",
  "recuperacion",
] as const;
type Page = (typeof pages)[number];
const titles: Record<Page, string> = {
  calcular: "¿Adónde vamos?",
  lugares: "Mis lugares",
  vehiculos: "Mis vehículos",
  rutas: "Mis rutas",
  preferencias: "Tus valores predeterminados",
  cuenta: "Mi cuenta",
  "alta-lugar": "Nuevo lugar de interés",
  resultado: "Resultado del trayecto",
  recuperacion: "Tu estado recuperado",
};
const navigation = [
  ["calcular", "Explorar"],
  ["lugares", "Lugares"],
  ["vehiculos", "Vehículos"],
  ["rutas", "Rutas"],
  ["preferencias", "Preferencias"],
  ["cuenta", "Mi cuenta"],
] as const;
const modes = { car: "Coche", bike: "Bicicleta", foot: "A pie" };
const types = { petrol: "Gasolina", diesel: "Diésel", electric: "Eléctrico" };
const criteria = {
  fastest: "Más rápida",
  shortest: "Más corta",
  cheapest: "Más económica",
};
const number = (value: number, digits = 2) =>
  value.toLocaleString("es-ES", { maximumFractionDigits: digits });
const navigate = (page: Page) => {
  location.hash = page;
};
function submit(event: FormEvent, action: () => Promise<void>) {
  event.preventDefault();
  void vm.run(action);
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  const id = React.useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {React.cloneElement(children as React.ReactElement<{ id: string }>, {
        id,
      })}
    </div>
  );
}
function Favorite({
  kind,
  item,
}: {
  kind: Collection;
  item: { id: string; name?: string; favorite?: boolean };
}) {
  return (
    <button
      className="secondary"
      aria-pressed={!!item.favorite}
      aria-label={`${item.favorite ? "Quitar de" : "Marcar como"} favoritos ${item.name}`}
      onClick={() => void vm.run(() => vm.favorite(kind, item.id))}
    >
      {item.favorite ? "Desmarcar favorito" : "Marcar favorito"}
    </button>
  );
}
function Delete({
  kind,
  item,
}: {
  kind: Collection;
  item: { id: string; name?: string };
}) {
  const [confirm, setConfirm] = useState(false);
  return confirm ? (
    <div className="confirm-panel">
      <strong>¿Eliminar {item.name}?</strong>
      <p>Se eliminará este elemento. Los demás datos se conservarán.</p>
      <div className="actions">
        <button className="secondary" onClick={() => setConfirm(false)}>
          Cancelar
        </button>
        <button
          className="danger"
          onClick={() => void vm.run(() => vm.remove(kind, item.id))}
        >
          Confirmar eliminación
        </button>
      </div>
    </div>
  ) : (
    <button className="danger" onClick={() => setConfirm(true)}>
      Eliminar
    </button>
  );
}
function Auth() {
  return (
    <div className="auth-grid">
      {[true, false].map((register) => (
        <section key={String(register)}>
          <h1>{register ? "Crear una cuenta" : "Iniciar sesión"}</h1>
          <form
            aria-label={register ? "Crear una cuenta" : "Iniciar sesión"}
            onSubmit={(e) =>
              submit(e, async () => {
                const data = Object.fromEntries(new FormData(e.currentTarget));
                await vm.auth(register, data);
                navigate(register ? "alta-lugar" : "recuperacion");
              })
            }
          >
            {register && (
              <Field label="Nombre">
                <input
                  name="name"
                  required
                  maxLength={70}
                  autoComplete="name"
                />
              </Field>
            )}
            <Field label="Correo electrónico">
              <input
                name="email"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
              />
            </Field>
            <Field label="Contraseña">
              <input
                name="password"
                type="password"
                required
                minLength={register ? 10 : 1}
                maxLength={128}
                autoComplete={register ? "new-password" : "current-password"}
              />
            </Field>
            {register && (
              <small>La contraseña debe tener entre 10 y 128 caracteres.</small>
            )}
            <button>{register ? "Crear cuenta" : "Entrar"}</button>
          </form>
        </section>
      ))}
    </div>
  );
}
function NewPlace({ state }: { state: State }) {
  const [method, setMethod] = useState("coordinates"),
    [name, setName] = useState(""),
    [lat, setLat] = useState(""),
    [lon, setLon] = useState(""),
    [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodedPlace[] | null>(null),
    [point, setPoint] = useState<{ lat: number; lon: number }>();
  function choose(place: GeocodedPlace) {
    setName(place.name);
    setLat(String(place.lat));
    setLon(String(place.lon));
    setPoint({ lat: place.lat, lon: place.lon });
  }
  return (
    <section className="place-editor">
      <div
        className="tabs"
        role="tablist"
        aria-label="Forma de añadir un lugar"
      >
        {[
          ["coordinates", "Coordenadas"],
          ["toponym", "Topónimo"],
          ["map", "Mapa"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={method === key}
            aria-controls="place-fields"
            onClick={() => setMethod(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {method === "toponym" && (
        <form
          className="search"
          aria-label="Búsqueda de lugares por nombre"
          onSubmit={(e) =>
            submit(e, async () => {
              setResults(null);
              setResults(await api("/search?q=" + encodeURIComponent(query)));
            })
          }
        >
          <Field label="Buscar un topónimo">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
              maxLength={200}
            />
          </Field>
          <button>Buscar</button>
        </form>
      )}
      {results !== null && method === "toponym" && (
        <section
          className="search-results"
          aria-label="Resultados de la búsqueda"
        >
          {results.length ? (
            results.map((p, i) => (
              <button
                key={i}
                className="secondary"
                aria-label={`Seleccionar ${p.name}`}
                onClick={() => choose(p)}
              >
                {p.name}
              </button>
            ))
          ) : (
            <p>No se han encontrado lugares. Prueba con otro nombre.</p>
          )}
        </section>
      )}
      <form
        id="place-fields"
        aria-label="Guardar un lugar"
        onSubmit={(e) =>
          submit(e, async () => {
            await vm.save(
              "/places",
              { name, lat: Number(lat), lon: Number(lon) },
              "Lugar guardado.",
            );
            setName("");
            setLat("");
            setLon("");
            setPoint(undefined);
            setResults(null);
          })
        }
      >
        <Field label="Nombre del lugar">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={120}
          />
        </Field>
        <div className="pair">
          <Field label="Latitud">
            <input
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              type="number"
              min={-90}
              max={90}
              step="any"
              required
            />
          </Field>
          <Field label="Longitud">
            <input
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              type="number"
              min={-180}
              max={180}
              step="any"
              required
            />
          </Field>
        </div>
        <MapView
          places={state.places}
          point={point}
          onPick={(a, b) => {
            setLat(a.toFixed(6));
            setLon(b.toFixed(6));
            setPoint({ lat: a, lon: b });
          }}
          onPlace={choose}
        />
        <small>
          Selecciona un punto en el mapa o escribe sus coordenadas. El lugar se
          añade cuando confirmas el guardado.
        </small>
        <div className="actions">
          <a className="button secondary" href="#lugares">
            Cancelar
          </a>
          <button>Guardar lugar</button>
        </div>
      </form>
    </section>
  );
}
function Places({ state }: { state: State }) {
  const [query, setQuery] = useState("");
  const places = state.places.filter((p) =>
    p.name.toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es")),
  );
  async function use(place: Place, as: "fromId" | "toId") {
    const p = state.preferences,
      j = p.lastJourney;
    await vm.preferences({
      lastJourney: {
        fromId: j?.fromId ?? "",
        toId: j?.toId ?? "",
        mode: j?.mode ?? p.mode,
        preference: j?.preference ?? p.preference,
        vehicleId: j?.vehicleId ?? p.vehicleId ?? "",
        [as]: place.id,
      },
    });
    navigate("calcular");
  }
  return (
    <>
      <a className="button" href="#alta-lugar">
        Añadir lugar
      </a>
      <Field label="Buscar en mis lugares">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Centro o UJI"
          type="search"
        />
      </Field>
      {!state.places.length && (
        <p className="empty">Todavía no hay lugares guardados.</p>
      )}
      {state.places.length > 0 && !places.length && (
        <p>No hay lugares con ese nombre.</p>
      )}
      <ul className="items">
        {places.map((p) => (
          <li key={p.id}>
            <div className="record">
              <strong>
                {p.name}
                {p.favorite ? " · Favorito" : ""}
              </strong>
              <small>
                {number(p.lat, 6)}, {number(p.lon, 6)}
              </small>
            </div>
            <div className="actions">
              <button onClick={() => void vm.run(() => use(p, "fromId"))}>
                Usar como origen
              </button>
              <button onClick={() => void vm.run(() => use(p, "toId"))}>
                Usar como destino
              </button>
              <Favorite kind="places" item={p} />
              <Delete kind="places" item={p} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
function Vehicles({ state }: { state: State }) {
  const [editing, setEditing] = useState<Vehicle | null>(null),
    [type, setType] = useState<Vehicle["type"]>("petrol");
  return (
    <>
      <ul className="items">
        {state.vehicles.map((v) => (
          <li key={v.id}>
            <div className="record">
              <strong>
                {v.name}
                {v.favorite ? " · Favorito" : ""}
              </strong>
              <small>
                {types[v.type]} · {number(v.consumption)}{" "}
                {v.type === "electric" ? "kWh" : "l"}/100 km
                {state.preferences.vehicleId === v.id
                  ? " · Predeterminado"
                  : ""}
              </small>
            </div>
            <div className="actions">
              <button
                onClick={() => {
                  setEditing(v);
                  setType(v.type);
                }}
              >
                Editar
              </button>
              <Favorite kind="vehicles" item={v} />
              <Delete kind="vehicles" item={v} />
            </div>
          </li>
        ))}
      </ul>
      {!state.vehicles.length && (
        <p className="empty">
          Todavía no hay vehículos guardados. Añade uno para calcular rutas en
          coche.
        </p>
      )}
      <form
        key={editing?.id ?? "new"}
        aria-label="Añadir o editar vehículo"
        className="vehicle-form"
        onSubmit={(e) =>
          submit(e, async () => {
            const form = e.currentTarget,
              f = new FormData(form);
            await vm.save(
              "/vehicles",
              {
                id: editing?.id,
                name: f.get("name"),
                type,
                consumption: Number(f.get("consumption")),
              },
              "Vehículo guardado.",
            );
            setEditing(null);
            setType("petrol");
            form.reset();
          })
        }
      >
        <h2>Añadir o editar vehículo</h2>
        <Field label="Nombre">
          <input
            name="name"
            required
            maxLength={70}
            defaultValue={editing?.name ?? ""}
          />
        </Field>
        <div className="pair">
          <Field label="Tipo">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Vehicle["type"])}
            >
              {Object.entries(types).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label={`Consumo (${type === "electric" ? "kWh" : "l"}/100 km)`}
          >
            <input
              name="consumption"
              type="number"
              min={0.1}
              max={100}
              step="any"
              required
              defaultValue={editing?.consumption ?? ""}
            />
          </Field>
        </div>
        <div className="actions">
          {editing && (
            <button
              className="secondary"
              type="button"
              onClick={() => {
                setEditing(null);
                setType("petrol");
              }}
            >
              Cancelar edición
            </button>
          )}
          <button>{editing ? "Guardar cambios" : "Guardar vehículo"}</button>
        </div>
      </form>
    </>
  );
}
function RouteSummary({ route }: { route: Route }) {
  return (
    <p className="summary">
      {number(route.distance / 1000)} km · {number(route.duration / 60, 0)} min
      ·{" "}
      {route.mode === "car"
        ? route.cost === null
          ? "Coste no disponible"
          : `${number(route.cost)} € estimados`
        : `${number(route.calories, 0)} kcal estimadas`}
    </p>
  );
}
function PriceDetails({ prices }: { prices: Prices }) {
  return (
    <>
      <div className="three energy-prices">
        {(
          [
            ["petrol", "Gasolina", "€/l"],
            ["diesel", "Diésel", "€/l"],
            ["electric", "Electricidad", "€/kWh"],
          ] as const
        ).map(([key, label, unit]) => (
          <div className="record" key={key}>
            <h3>{label}</h3>
            <p>
              {prices[key] == null
                ? "No disponible"
                : `${number(prices[key]!, 4)} ${unit}`}
            </p>
          </div>
        ))}
      </div>
      <p>{prices.source}</p>
      {prices.date && <small>{prices.date}</small>}
      <small>
        {prices.source === "Precio manual"
          ? "Usas los precios que has introducido en Preferencias."
          : "Los carburantes son medias de estaciones. La electricidad es una referencia mayorista, sin impuestos ni peajes. Puedes usar tus propios precios en Preferencias."}{" "}
        El vehículo aporta el consumo y determina qué precio se aplica al coste.
      </small>
    </>
  );
}
function EnergyPrices() {
  const [prices, setPrices] = useState<Prices | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void api<Prices>("/prices")
      .then((value) => {
        if (active) setPrices(value);
      })
      .catch((error: unknown) => {
        if (active) {
          setPrices(null);
          setError(
            error instanceof Error ? error.message : "Precios no disponibles.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  return (
    <section aria-label="Precios de la energía" className="energy-panel">
      <h2>Precios de la energía</h2>
      {loading ? (
        <p role="status">Consultando los precios de referencia.</p>
      ) : prices ? (
        <PriceDetails prices={prices} />
      ) : (
        <p>{error}</p>
      )}
      {!loading &&
        (error ||
          prices?.petrol == null ||
          prices?.diesel == null ||
          prices?.electric == null) && (
          <button type="button" onClick={() => setAttempt(attempt + 1)}>
            Reintentar consulta de precios
          </button>
        )}
    </section>
  );
}
type Endpoint = string | GeocodedPlace;
function ExploreEndpoint({
  kind,
  value,
  places,
  onChange,
}: {
  kind: "origen" | "destino";
  value: Endpoint;
  places: Place[];
  onChange: (value: Endpoint) => void;
}) {
  const [query, setQuery] = useState(
    typeof value === "object" ? value.name : "",
  );
  const [results, setResults] = useState<GeocodedPlace[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const sequence = useRef(0);
  useEffect(() => {
    if (typeof value === "object") setQuery(value.name);
  }, [value]);
  useEffect(
    () => () => {
      sequence.current++;
    },
    [],
  );
  async function search() {
    const current = ++sequence.current;
    setError("");
    setResults([]);
    if (!query.trim()) {
      setError("Escribe un lugar para buscar.");
      return;
    }
    setLoading(true);
    try {
      const found = await api<GeocodedPlace[]>(
        "/search?q=" + encodeURIComponent(query.trim()),
      );
      if (current === sequence.current) {
        setResults(found);
        if (!found.length)
          setError("No se han encontrado lugares. Prueba con otro nombre.");
      }
    } catch (e) {
      if (current === sequence.current)
        setError(
          e instanceof Error ? e.message : "No se pudo completar la búsqueda.",
        );
    } finally {
      if (current === sequence.current) setLoading(false);
    }
  }
  return (
    <section
      className="explore-endpoint"
      aria-label={
        kind === "origen" ? "Origen del trayecto" : "Destino del trayecto"
      }
    >
      <div className="search">
        <Field label={`Buscar ${kind}`}>
          <input
            value={query}
            maxLength={200}
            placeholder="Lugar, dirección o ciudad"
            onChange={(e) => {
              sequence.current++;
              setQuery(e.target.value);
              setResults([]);
              setError("");
              setLoading(false);
              onChange("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void search();
              }
            }}
          />
        </Field>
        <button
          type="button"
          onClick={() => void search()}
          disabled={loading}
          aria-label={`Buscar ${kind}`}
        >
          {loading ? "Buscando" : "Buscar"}
        </button>
      </div>
      {error && <p role="status">{error}</p>}
      {!!results.length && (
        <div className="search-results" aria-label={`Resultados de ${kind}`}>
          {results.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                sequence.current++;
                onChange(p);
                setQuery(p.name);
                setResults([]);
                setError("");
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
      {typeof value === "object" && (
        <small>Lugar seleccionado {value.name}</small>
      )}
      {!!places.length && (
        <Field
          label={kind === "origen" ? "Origen guardado" : "Destino guardado"}
        >
          <select
            value={typeof value === "string" ? value : ""}
            onChange={(e) => {
              sequence.current++;
              onChange(e.target.value);
              setQuery("");
              setResults([]);
              setError("");
              setLoading(false);
            }}
          >
            <option value="">O elige un lugar guardado</option>
            {places.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
      )}
    </section>
  );
}
function Calculator({ state }: { state: State }) {
  const app = useApp(),
    p = state.preferences,
    j = p.lastJourney;
  const [from, setFrom] = useState<Endpoint>(j?.fromPoint ?? j?.fromId ?? ""),
    [to, setTo] = useState<Endpoint>(j?.toPoint ?? j?.toId ?? "");
  const [mode, setMode] = useState(j?.mode ?? p.mode),
    [criterion, setCriterion] = useState(j?.preference ?? p.preference),
    [vehicleId, setVehicle] = useState(
      j?.referenceVehicle
        ? "reference"
        : j?.vehicleId ||
            (j?.mode === "car" && j.referenceVehicle === null
              ? ""
              : p.vehicleId || "reference"),
    );
  const [referenceType, setReferenceType] = useState<Vehicle["type"]>(
    j?.referenceVehicle?.type ?? "petrol",
  );
  const [consumption, setConsumption] = useState(
    j?.referenceVehicle?.consumption ?? 6,
  );
  const [pick, setPick] = useState<"from" | "to">("from");
  function changed(action: () => void) {
    action();
    vm.set({ plan: null, error: "", notice: "" });
  }
  return (
    <>
      <form
        aria-label="Planificar un trayecto"
        onSubmit={(e) =>
          submit(e, async () => {
            if (!from || !to)
              throw new Error(
                "Selecciona un origen y un destino de la búsqueda o del mapa.",
              );
            await vm.plan({
              from,
              to,
              mode,
              preference: criterion,
              vehicleId:
                mode === "car"
                  ? vehicleId === "reference"
                    ? ""
                    : vehicleId
                  : undefined,
              ...(mode === "car" && vehicleId === "reference"
                ? { referenceVehicle: { type: referenceType, consumption } }
                : {}),
            });
            navigate("resultado");
          })
        }
      >
        <div className="pair">
          <ExploreEndpoint
            kind="origen"
            value={from}
            places={state.places}
            onChange={(value) =>
              changed(() => {
                setFrom(value);
                setPick("from");
              })
            }
          />
          <ExploreEndpoint
            kind="destino"
            value={to}
            places={state.places}
            onChange={(value) =>
              changed(() => {
                setTo(value);
                setPick("to");
              })
            }
          />
        </div>
        <div className="pair">
          <Field label="Modo de transporte">
            <select
              value={mode}
              onChange={(e) =>
                changed(() => setMode(e.target.value as Preferences["mode"]))
              }
            >
              {Object.entries(modes).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Criterio">
            <select
              value={criterion}
              onChange={(e) =>
                changed(() =>
                  setCriterion(e.target.value as Preferences["preference"]),
                )
              }
            >
              {Object.entries(criteria).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {mode === "car" && (
          <Field label="Vehículo opcional">
            <select
              value={vehicleId}
              onChange={(e) => changed(() => setVehicle(e.target.value))}
            >
              <option value="reference">
                Coche de referencia, consumo editable
              </option>
              <option value="">Sin vehículo, solo la ruta</option>
              {state.vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} · {types[v.type]} · {number(v.consumption)}{" "}
                  {v.type === "electric" ? "kWh" : "l"}/100 km
                </option>
              ))}
            </select>
          </Field>
        )}
        {mode === "car" && vehicleId === "reference" && (
          <>
            <div className="pair">
              <Field label="Energía de referencia">
                <select
                  value={referenceType}
                  onChange={(e) =>
                    changed(() => {
                      const next = e.target.value as Vehicle["type"];
                      setReferenceType(next);
                      setConsumption(
                        next === "electric" ? 15 : next === "diesel" ? 5 : 6,
                      );
                    })
                  }
                >
                  {Object.entries(types).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label={`Consumo de referencia (${referenceType === "electric" ? "kWh" : "l"}/100 km)`}
              >
                <input
                  type="number"
                  min={0.1}
                  max={100}
                  step="any"
                  required
                  value={consumption}
                  onChange={(e) =>
                    changed(() => setConsumption(e.target.valueAsNumber))
                  }
                />
              </Field>
            </div>
            <small>
              Referencia orientativa, no corresponde a un vehículo real. Puedes
              editar el consumo o elegir uno de tus vehículos. No se añade nada
              a Mis vehículos.
            </small>
          </>
        )}
        <button>Calcular ruta</button>
      </form>
      <EnergyPrices />
      <section className="planner-map">
        <Field label="Al seleccionar un lugar en el mapa">
          <select
            value={pick}
            onChange={(e) => setPick(e.target.value as "from" | "to")}
          >
            <option value="from">Usar como origen</option>
            <option value="to">Usar como destino</option>
          </select>
        </Field>
        <MapView
          places={[
            ...state.places,
            ...[from, to]
              .filter((p): p is GeocodedPlace => typeof p === "object")
              .map((p, i) => ({ ...p, id: `search-${i}`, favorite: false })),
          ]}
          point={
            typeof (pick === "from" ? from : to) === "object"
              ? ((pick === "from" ? from : to) as GeocodedPlace)
              : undefined
          }
          onPick={(lat, lon) =>
            changed(() => {
              const point = {
                name: `Punto del mapa (${number(lat, 4)}, ${number(lon, 4)})`,
                lat,
                lon,
              };
              pick === "from" ? setFrom(point) : setTo(point);
            })
          }
          onPlace={(place) =>
            changed(() => {
              const value = place.id.startsWith("search-")
                ? { name: place.name, lat: place.lat, lon: place.lon }
                : place.id;
              pick === "from" ? setFrom(value) : setTo(value);
            })
          }
        />
        <small>
          Pulsa en el mapa o en un marcador para elegir el origen o el destino.
          No hace falta guardar el lugar.
        </small>
      </section>
      {!app.configured && (
        <p className="hint">
          El servicio de rutas no está configurado. Puedes seguir gestionando
          tus lugares y vehículos.
        </p>
      )}
    </>
  );
}
function Result() {
  const app = useApp(),
    [selected, setSelected] = useState(0),
    [name, setName] = useState(""),
    [saved, setSaved] = useState<number[]>([]);
  const route = app.plan?.routes[selected];
  if (!route)
    return (
      <div className="record">
        <h2>No hay un trayecto calculado</h2>
        <p>Selecciona dos lugares y calcula la ruta antes de guardarla.</p>
        <a className="button" href="#calcular">
          Volver al planificador
        </a>
      </div>
    );
  return (
    <>
      <h2 className="journey-title">
        {route.from?.name} a {route.to?.name}
      </h2>
      <MapView route={route} />
      {app.plan!.routes.length > 1 && (
        <div className="actions alternatives" aria-label="Alternativas de ruta">
          {app.plan!.routes.map((r, i) => (
            <button
              key={i}
              className="secondary"
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
            >
              Opción {i + 1} · {number(r.distance / 1000)} km
            </button>
          ))}
        </div>
      )}
      <section className="record">
        <h2>
          {route.mode === "car"
            ? route.vehicle
              ? `${types[route.vehicle.type]}${route.vehicle.reference ? " de referencia" : ""}`
              : "Coche sin vehículo seleccionado"
            : modes[route.mode]}
        </h2>
        <RouteSummary route={route} />
        {route.vehicle?.reference && (
          <p>
            Referencia orientativa. Puedes cambiar el consumo desde Explorar.
          </p>
        )}
        <p>
          {route.mode === "car"
            ? route.priceSource
            : "Estimación orientativa según la duración y el peso configurado."}
        </p>
        {route.mode === "car" && route.priceDate && (
          <small>{route.priceDate}</small>
        )}
        {route.mode === "car" && route.vehicle && (
          <p>
            Consumo del vehículo {number(route.vehicle.consumption)}{" "}
            {route.vehicle.type === "electric" ? "kWh" : "l"}/100 km.
          </p>
        )}
        {route.mode === "car" && route.price != null && (
          <p>
            Precio aplicado {number(route.price, 4)}{" "}
            {route.vehicle?.type === "electric" ? "€/kWh" : "€/l"}.
          </p>
        )}
        {route.mode === "car" && route.cost === null && (
          <p>
            {route.vehicle
              ? "No hay un precio disponible para estimar el coste de este trayecto."
              : "Selecciona un vehículo para estimar el coste con su consumo."}
          </p>
        )}
        {route.mode === "car" &&
          route.cost === null &&
          app.plan?.preference === "cheapest" && (
            <p>
              No se puede comparar el coste sin un vehículo y un precio
              disponible. Las alternativas se ordenan por distancia.
            </p>
          )}
      </section>
      {route.mode === "car" && app.plan?.price && (
        <section aria-label="Precios utilizados en la consulta">
          <h2>Precios consultados</h2>
          <PriceDetails prices={app.plan.price} />
        </section>
      )}
      <form
        className="save-route"
        onSubmit={(e) =>
          submit(e, async () => {
            await vm.saveRoute(selected, name);
            setSaved([...saved, selected]);
          })
        }
      >
        <Field label="Nombre para guardar la ruta">
          <input
            required
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <div className="actions">
          <a className="button secondary" href="#calcular">
            Volver al planificador
          </a>
          <button disabled={saved.includes(selected)}>
            {saved.includes(selected) ? "Ruta guardada" : "Guardar ruta"}
          </button>
          <a className="button secondary" href="#rutas">
            Mis rutas
          </a>
        </div>
      </form>
    </>
  );
}
function SavedRoutes({ state }: { state: State }) {
  const [selected, setSelected] = useState<string>(),
    [query, setQuery] = useState("");
  const route = state.routes.find((r) => r.id === selected),
    filtered = state.routes.filter((r) =>
      (r.name ?? "")
        .toLocaleLowerCase("es")
        .includes(query.toLocaleLowerCase("es")),
    );
  return (
    <>
      <Field label="Buscar en mis rutas">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Camino a clase"
        />
      </Field>
      {!state.routes.length && (
        <p className="empty">
          Todavía no hay rutas guardadas.{" "}
          <a href="#calcular">Planificar un trayecto</a>
        </p>
      )}
      {state.routes.length > 0 && !filtered.length && (
        <p>No hay rutas con ese nombre.</p>
      )}
      <ul className="items">
        {filtered.map((r) => (
          <li key={r.id}>
            <div className="record">
              <strong>
                {r.name}
                {r.favorite ? " · Favorito" : ""}
              </strong>
              <RouteSummary route={r} />
            </div>
            <div className="actions">
              <button onClick={() => setSelected(r.id)}>Ver detalle</button>
              <Favorite kind="routes" item={{ ...r, id: r.id! }} />
              <Delete kind="routes" item={{ id: r.id!, name: r.name }} />
            </div>
          </li>
        ))}
      </ul>
      {route && (
        <section className="historical-route">
          <h2>Detalle de {route.name}</h2>
          <MapView route={route} />
          <div className="record">
            <h3>Cálculo histórico</h3>
            <p>
              Se muestran el trazado y las medidas que guardaste. Consultar esta
              ruta no vuelve a calcularla.
            </p>
            {route.mode === "car" && (
              <small>
                {route.priceSource} {route.priceDate}
              </small>
            )}
          </div>
        </section>
      )}
    </>
  );
}
function Settings({ state }: { state: State }) {
  const p = state.preferences,
    [mode, setMode] = useState(p.mode),
    [manual, setManual] = useState(p.useManualPrices);
  return (
    <form
      key={JSON.stringify(p)}
      className="settings"
      aria-label="Preferencias de movilidad"
      onReset={() => {
        setMode(p.mode);
        setManual(p.useManualPrices);
      }}
      onSubmit={(e) =>
        submit(e, async () => {
          const f = new FormData(e.currentTarget);
          await vm.preferences({
            mode,
            vehicleId: String(f.get("vehicleId") || "") || null,
            preference: f.get("preference") as Preferences["preference"],
            theme: f.get("theme") as Preferences["theme"],
            weight: Number(f.get("weight")),
            lastJourney: {
              fromId: "",
              toId: "",
              mode,
              preference: f.get("preference") as Preferences["preference"],
              vehicleId: String(f.get("vehicleId") || ""),
            },
            useManualPrices: manual,
            manualPrices: {
              petrol: Number(f.get("petrol")),
              diesel: Number(f.get("diesel")),
              electric: Number(f.get("electric")),
            },
          });
        })
      }
    >
      <div className="pair">
        <Field label="Transporte predeterminado">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Preferences["mode"])}
          >
            {Object.entries(modes).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Vehículo predeterminado">
          <select name="vehicleId" defaultValue={p.vehicleId ?? ""}>
            <option value="">Sin predeterminado</option>
            {state.vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Criterio predeterminado">
        <select name="preference" defaultValue={p.preference}>
          {Object.entries(criteria).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Aspecto">
        <select name="theme" defaultValue={p.theme}>
          <option value="light">Claro</option>
          <option value="dark">Oscuro</option>
          <option value="system">Según el sistema</option>
        </select>
      </Field>
      <Field label="Peso para estimar calorías (kg)">
        <input
          name="weight"
          type="number"
          min={20}
          max={300}
          step="any"
          required
          defaultValue={p.weight}
        />
      </Field>
      <h2>Precios manuales</h2>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={manual}
          onChange={(e) => setManual(e.target.checked)}
        />
        Usar precios manuales
      </label>
      <div className="three">
        {(["petrol", "diesel", "electric"] as const).map((k) => (
          <Field
            key={k}
            label={`${types[k]} (${k === "electric" ? "€/kWh" : "€/l"})`}
          >
            <input
              name={k}
              type="number"
              min={0.001}
              max={20}
              step="any"
              required
              defaultValue={p.manualPrices[k]}
            />
          </Field>
        ))}
      </div>
      <small>
        Los precios automáticos son referencias públicas de MITECO y REE. El
        precio eléctrico mayorista no equivale a una tarifa doméstica final.
      </small>
      <div className="actions">
        <button type="reset" className="secondary">
          Cancelar
        </button>
        <button>Guardar preferencias</button>
      </div>
    </form>
  );
}
function Account({ state }: { state: State }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <section className="account">
      <Field label="Nombre">
        <input value={state.user.name} readOnly />
      </Field>
      <Field label="Correo electrónico">
        <input value={state.user.email} readOnly />
      </Field>
      <button onClick={() => void vm.run(() => vm.logout())}>
        Cerrar sesión
      </button>
      <section className="account-delete">
        <div className="record">
          <h2>Eliminar mi cuenta</h2>
          <p>
            Se eliminarán tu cuenta, sesiones, lugares, vehículos, rutas y
            preferencias. Esta acción requiere confirmación.
          </p>
        </div>
        {!confirm ? (
          <button className="danger" onClick={() => setConfirm(true)}>
            Eliminar mi cuenta
          </button>
        ) : (
          <form
            onSubmit={(e) =>
              submit(e, async () => {
                await vm.account(
                  String(new FormData(e.currentTarget).get("password")),
                );
              })
            }
          >
            <Field label="Confirma tu contraseña">
              <input
                name="password"
                type="password"
                required
                maxLength={128}
                autoComplete="current-password"
              />
            </Field>
            <div className="actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setConfirm(false)}
              >
                Cancelar
              </button>
              <button className="danger">
                Confirmar eliminación de cuenta
              </button>
            </div>
          </form>
        )}
      </section>
    </section>
  );
}
function Recovery({ state }: { state: State }) {
  const p = state.preferences,
    j = p.lastJourney;
  return (
    <section className="recovery">
      <div className="record">
        <h2>Bienvenido de nuevo, {state.user.name}</h2>
        <p>Los contenidos confirmados de tu cuenta están disponibles.</p>
      </div>
      <div className="record">
        <h2>Estado guardado</h2>
        <p data-testid="recovered-places">
          {state.places.map((x) => x.name).join(" · ") ||
            "No hay lugares guardados"}
        </p>
        <p>
          {state.vehicles.map((x) => x.name).join(" · ") ||
            "No hay vehículos guardados"}
        </p>
        <p>
          {state.routes.map((x) => x.name).join(" · ") ||
            "No hay rutas guardadas"}
        </p>
        <small>
          {modes[p.mode]} · {criteria[p.preference]} ·{" "}
          {p.theme === "dark"
            ? "Tema oscuro"
            : p.theme === "system"
              ? "Aspecto del sistema"
              : "Tema claro"}
        </small>
        {j?.fromId && (
          <small>
            Último trayecto de{" "}
            {state.places.find((x) => x.id === j.fromId)?.name ??
              "lugar eliminado"}{" "}
            a{" "}
            {state.places.find((x) => x.id === j.toId)?.name ??
              "destino pendiente"}
          </small>
        )}
      </div>
      <a className="button" href="#calcular">
        Continuar planificación
      </a>
    </section>
  );
}
function App() {
  const app = useApp();
  const currentPage = (): Page =>
    pages.includes(location.hash.slice(1) as Page)
      ? (location.hash.slice(1) as Page)
      : "recuperacion";
  const [page, setPage] = useState<Page>(currentPage);
  useEffect(() => {
    void vm.init();
    const listener = () => {
      setPage(currentPage());
      vm.set({ error: "", notice: "" });
    };
    addEventListener("hashchange", listener);
    return () => removeEventListener("hashchange", listener);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme =
      app.state?.preferences.theme ?? "light";
  }, [app.state?.preferences.theme]);
  useEffect(() => {
    document.getElementById("page-title")?.focus();
  }, [page, app.state?.user.id]);
  const state = app.state;
  const active =
    page === "alta-lugar"
      ? "lugares"
      : page === "resultado"
        ? "calcular"
        : page === "recuperacion"
          ? "cuenta"
          : page;
  return (
    <>
      <a className="skip" href="#content">
        Ir al contenido
      </a>
      <header>
        <a
          className="brand"
          href={state ? "#calcular" : "#acceso"}
          aria-label="Vía, inicio"
        >
          VÍA
        </a>
        <nav aria-label="Navegación principal">
          {navigation.map(([key, label]) => (
            <a
              key={key}
              href={state ? `#${key}` : "#acceso"}
              aria-current={
                (state ? active === key : key === "cuenta") ? "page" : undefined
              }
            >
              {label}
            </a>
          ))}
        </nav>
      </header>
      <main id="content">
        <div aria-live="polite">
          {app.busy && <p className="notice">Procesando...</p>}
          {app.notice && (
            <p role="status" className="notice">
              {app.notice}
            </p>
          )}
        </div>
        {app.error && (
          <p role="alert" className="error">
            {app.error}
          </p>
        )}
        {!app.ready ? (
          <p>Cargando...</p>
        ) : !state && app.loadFailed ? (
          <section className="recovery">
            <h1>No se pueden recuperar los datos</h1>
            <p>
              No se ha cargado el estado de la aplicación. Vuelve a intentarlo
              para continuar.
            </p>
            <button
              onClick={() =>
                void vm.run(async () => {
                  await vm.init();
                })
              }
            >
              Reintentar
            </button>
            <button
              className="text-button"
              onClick={() => vm.set({ error: "", loadFailed: false })}
            >
              Ir al acceso
            </button>
          </section>
        ) : (
          <fieldset className="app-fields" disabled={app.busy}>
            {!state ? (
              <Auth />
            ) : (
              <>
                <h1 id="page-title" tabIndex={-1}>
                  {titles[page]}
                </h1>
                <div key={state.user.id + page}>
                  {page === "alta-lugar" ? (
                    <NewPlace state={state} />
                  ) : page === "lugares" ? (
                    <Places state={state} />
                  ) : page === "vehiculos" ? (
                    <Vehicles state={state} />
                  ) : page === "calcular" ? (
                    <Calculator state={state} />
                  ) : page === "resultado" ? (
                    <Result />
                  ) : page === "rutas" ? (
                    <SavedRoutes state={state} />
                  ) : page === "preferencias" ? (
                    <Settings state={state} />
                  ) : page === "recuperacion" ? (
                    <Recovery state={state} />
                  ) : (
                    <Account state={state} />
                  )}
                </div>
              </>
            )}
          </fieldset>
        )}
      </main>
      <footer>Vía · Proyecto de movilidad · EI1039 y EI1048</footer>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
