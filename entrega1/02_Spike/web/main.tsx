import React, {
  useEffect,
  useState,
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
  Preferences,
  Route,
  State,
  Vehicle,
} from "../src/domain/types";
import "./style.css";
const pages = [
  "alta-lugar",
  "lugares",
  "vehiculos",
  "calcular",
  "rutas",
  "preferencias",
  "cuenta",
] as const;
type Page = (typeof pages)[number];
const titles: Record<Page, string> = {
  "alta-lugar": "Alta de lugar",
  lugares: "Lugares",
  vehiculos: "Vehículos",
  calcular: "Calcular ruta",
  rutas: "Rutas guardadas",
  preferencias: "Preferencias",
  cuenta: "Cuenta",
};
const modeNames = { car: "Coche", bike: "Bicicleta", foot: "A pie" };
const typeNames = {
  petrol: "Gasolina",
  diesel: "Diésel",
  electric: "Eléctrico",
};
const number = (v: number, digits = 2) =>
  v.toLocaleString("es-ES", { maximumFractionDigits: digits });
function navigate(page: Page) {
  location.hash = page;
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
function submit(event: FormEvent, action: () => Promise<void>) {
  event.preventDefault();
  void vm.run(action);
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
      onClick={() => void vm.run(() => vm.favorite(kind, item.id))}
      aria-label={`${item.favorite ? "Quitar de" : "Marcar como"} favoritos ${item.name}`}
    >
      {item.favorite ? "★ Favorito" : "☆ Favorito"}
    </button>
  );
}
function Delete({
  kind,
  id,
  name,
}: {
  kind: Collection;
  id: string;
  name?: string;
}) {
  const [confirm, setConfirm] = useState(false);
  return confirm ? (
    <span className="confirmation">
      ¿Eliminar {name}?{" "}
      <button
        className="danger"
        onClick={() => void vm.run(() => vm.remove(kind, id))}
      >
        Confirmar eliminación
      </button>
      <button className="secondary" onClick={() => setConfirm(false)}>
        Cancelar
      </button>
    </span>
  ) : (
    <button className="secondary" onClick={() => setConfirm(true)}>
      Eliminar
    </button>
  );
}
function Auth() {
  const [register, setRegister] = useState(location.hash === "#alta-usuario");
  return (
    <section className="auth">
      <h1>{register ? "Alta de usuario" : "Iniciar sesión"}</h1>
      <p>Accede para guardar tus lugares, vehículos y rutas.</p>
      <form
        onSubmit={(e) =>
          submit(e, async () => {
            const f = new FormData(e.currentTarget);
            await vm.auth(register, Object.fromEntries(f));
            navigate("alta-lugar");
          })
        }
      >
        {register && (
          <Field label="Nombre">
            <input name="name" required maxLength={70} autoComplete="name" />
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
        {register && <small>Entre 10 y 128 caracteres.</small>}
        <button type="submit">{register ? "Crear cuenta" : "Entrar"}</button>
      </form>
      <button
        className="text-button"
        onClick={() => {
          setRegister(!register);
          vm.set({ error: "", notice: "" });
          location.hash = register ? "acceso" : "alta-usuario";
        }}
      >
        {register ? "Ya tengo cuenta" : "Crear una cuenta"}
      </button>
    </section>
  );
}
function NewPlace({ state }: { state: State }) {
  const [name, setName] = useState(""),
    [lat, setLat] = useState(""),
    [lon, setLon] = useState("");
  const [query, setQuery] = useState(""),
    [results, setResults] = useState<GeocodedPlace[] | null>(null);
  const [point, setPoint] = useState<{ lat: number; lon: number }>();
  function choose(p: GeocodedPlace) {
    setName(p.name);
    setLat(String(p.lat));
    setLon(String(p.lon));
    setPoint({ lat: p.lat, lon: p.lon });
  }
  return (
    <>
      <p>
        Busca un topónimo, introduce coordenadas o selecciona un punto en el
        mapa.
      </p>
      <div className="columns">
        <div>
          <form
            className="search"
            onSubmit={(e) =>
              submit(e, async () => {
                setResults(null);
                setResults(await api("/search?q=" + encodeURIComponent(query)));
              })
            }
          >
            <Field label="Topónimo">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                required
                maxLength={200}
                placeholder="Ejemplo: Universitat Jaume I"
              />
            </Field>
            <button type="submit" className="secondary">
              Buscar
            </button>
          </form>
          {results !== null && (
            <div className="results">
              {results.length ? (
                results.map((p, i) => (
                  <button
                    className="secondary"
                    key={i}
                    onClick={() => choose(p)}
                  >
                    {p.name}
                  </button>
                ))
              ) : (
                <p>No se han encontrado lugares.</p>
              )}
            </div>
          )}
          <form
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
            <button type="submit">Guardar lugar</button>
          </form>
        </div>
        <div>
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
            El punto seleccionado rellena las coordenadas. Añade un nombre antes
            de guardarlo.
          </small>
        </div>
      </div>
    </>
  );
}
function Places({ state }: { state: State }) {
  return (
    <>
      <div className="page-actions">
        <p>
          Lugares disponibles para calcular rutas. Los favoritos aparecen
          primero.
        </p>
        <button onClick={() => navigate("alta-lugar")}>Añadir lugar</button>
      </div>
      {!state.places.length && (
        <p className="empty">Todavía no hay lugares guardados.</p>
      )}
      <ul className="items">
        {state.places.map((p) => (
          <li key={p.id}>
            <div>
              <strong>{p.name}</strong>
              <small>
                {number(p.lat, 6)}, {number(p.lon, 6)}
              </small>
            </div>
            <div className="actions">
              <Favorite kind="places" item={p} />
              <Delete kind="places" id={p.id} name={p.name} />
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
      <p>Introduce el consumo medio para estimar el coste del trayecto.</p>
      <form
        key={editing?.id ?? "new"}
        className="vehicle-form"
        onSubmit={(e) =>
          submit(e, async () => {
            const form = e.currentTarget;
            const f = new FormData(form);
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
        <h2>{editing ? "Editar vehículo" : "Alta de vehículo"}</h2>
        <div className="three">
          <Field label="Nombre">
            <input
              name="name"
              required
              maxLength={70}
              defaultValue={editing?.name ?? ""}
            />
          </Field>
          <Field label="Tipo">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Vehicle["type"])}
            >
              {Object.entries(typeNames).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
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
          <button type="submit">
            {editing ? "Guardar cambios" : "Guardar vehículo"}
          </button>
          {editing && (
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setEditing(null);
                setType("petrol");
              }}
            >
              Cancelar edición
            </button>
          )}
        </div>
      </form>
      <h2>Mis vehículos</h2>
      {!state.vehicles.length && (
        <p className="empty">Todavía no hay vehículos guardados.</p>
      )}
      <ul className="items">
        {state.vehicles.map((v) => (
          <li key={v.id}>
            <div>
              <strong>{v.name}</strong>
              <small>
                {typeNames[v.type]} · {number(v.consumption)}{" "}
                {v.type === "electric" ? "kWh" : "l"}/100 km
              </small>
            </div>
            <div className="actions">
              <button
                className="secondary"
                onClick={() => {
                  setEditing(v);
                  setType(v.type);
                }}
              >
                Editar
              </button>
              <Favorite kind="vehicles" item={v} />
              <Delete kind="vehicles" id={v.id} name={v.name} />
            </div>
          </li>
        ))}
      </ul>
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
          ? "Precio no disponible"
          : number(route.cost) + " € estimados"
        : number(route.calories, 0) + " kcal estimadas"}
    </p>
  );
}
function Calculator({ state }: { state: State }) {
  const app = useApp(),
    p = state.preferences,
    j = p.lastJourney;
  const [from, setFrom] = useState(j?.fromId ?? ""),
    [to, setTo] = useState(j?.toId ?? "");
  const [mode, setMode] = useState(j?.mode ?? p.mode),
    [preference, setPreference] = useState(j?.preference ?? p.preference);
  const [vehicleId, setVehicle] = useState(j?.vehicleId || p.vehicleId || ""),
    [selected, setSelected] = useState(0),
    [saved, setSaved] = useState<number[]>([]);
  const [pick, setPick] = useState<"from" | "to">("from");
  const [name, setName] = useState("");
  const route = app.plan?.routes[selected];
  function change(action: () => void) {
    action();
    vm.set({ plan: null, notice: "", error: "" });
    setSelected(0);
    setSaved([]);
  }
  const selectPlace = (place: Place) =>
    change(() => (pick === "from" ? setFrom(place.id) : setTo(place.id)));
  return (
    <>
      <p>Selecciona dos lugares dados de alta y un medio de transporte.</p>
      {!app.configured && (
        <p className="hint">
          La búsqueda y el cálculo de rutas necesitan una clave de
          OpenRouteService en el servidor.
        </p>
      )}
      <div className="columns">
        <div>
          <form
            onSubmit={(e) =>
              submit(e, async () => {
                setSelected(0);
                setSaved([]);
                await vm.plan({
                  from,
                  to,
                  mode,
                  preference,
                  vehicleId: mode === "car" ? vehicleId : undefined,
                });
              })
            }
          >
            <Field label="Origen">
              <select
                required
                value={from}
                onChange={(e) => change(() => setFrom(e.target.value))}
              >
                <option value="">Selecciona un lugar</option>
                {state.places.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Destino">
              <select
                required
                value={to}
                onChange={(e) => change(() => setTo(e.target.value))}
              >
                <option value="">Selecciona un lugar</option>
                {state.places.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Transporte">
              <select
                value={mode}
                onChange={(e) =>
                  change(() => setMode(e.target.value as Preferences["mode"]))
                }
              >
                {Object.entries(modeNames).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            {mode === "car" && (
              <Field label="Vehículo">
                <select
                  value={vehicleId}
                  required
                  onChange={(e) => change(() => setVehicle(e.target.value))}
                >
                  <option value="">Selecciona un vehículo</option>
                  {state.vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Criterio">
              <select
                value={preference}
                onChange={(e) =>
                  change(() =>
                    setPreference(e.target.value as Preferences["preference"]),
                  )
                }
              >
                <option value="fastest">Más rápida</option>
                <option value="shortest">Más corta</option>
                <option value="cheapest">Más económica</option>
              </select>
            </Field>
            <button type="submit">Calcular ruta</button>
          </form>
        </div>
        <div>
          <Field label="Al seleccionar un lugar en el mapa">
            <select
              value={pick}
              onChange={(e) => setPick(e.target.value as "from" | "to")}
            >
              <option value="from">Usar como origen</option>
              <option value="to">Usar como destino</option>
            </select>
          </Field>
          <MapView places={state.places} route={route} onPlace={selectPlace} />
          <small>
            Pulsa un marcador guardado para elegirlo. Para un punto nuevo
            utiliza Alta de lugar.
          </small>
        </div>
      </div>
      {app.plan && (
        <section className="route-result">
          <h2>Resultado</h2>
          <div className="actions">
            {app.plan.routes.map((r, i) => (
              <button
                key={i}
                className="secondary"
                aria-pressed={selected === i}
                onClick={() => {
                  setSelected(i);
                  setName("");
                }}
              >
                Opción {i + 1} · {number(r.distance / 1000)} km
              </button>
            ))}
          </div>
          {route && (
            <>
              <h3>
                {route.from?.name} a {route.to?.name}
              </h3>
              <RouteSummary route={route} />
              {route.mode === "car" && (
                <small>
                  {route.priceSource}
                  {route.priceDate ? " · " + route.priceDate : ""}
                </small>
              )}
              <p>
                Se compara entre las opciones obtenidas. La duración no incluye
                tráfico en tiempo real.
              </p>
              <form
                onSubmit={(e) =>
                  submit(e, async () => {
                    await vm.saveRoute(selected, name);
                    setSaved([...saved, selected]);
                  })
                }
              >
                <Field label="Nombre de la ruta">
                  <input
                    required
                    maxLength={120}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ejemplo: Camino a clase"
                  />
                </Field>
                <button disabled={saved.includes(selected)}>
                  {saved.includes(selected) ? "Ruta guardada" : "Guardar ruta"}
                </button>
              </form>
            </>
          )}
        </section>
      )}
    </>
  );
}
function SavedRoutes({ state }: { state: State }) {
  const [selected, setSelected] = useState<string>();
  const route = state.routes.find((r) => r.id === selected);
  return (
    <>
      <p>
        Consulta el trazado que guardaste. El precio corresponde al momento del
        cálculo.
      </p>
      {!state.routes.length && (
        <p className="empty">Todavía no hay rutas guardadas.</p>
      )}
      <ul className="items">
        {state.routes.map((r) => (
          <li key={r.id}>
            <div>
              <strong>{r.name}</strong>
              <RouteSummary route={r} />
            </div>
            <div className="actions">
              <button className="secondary" onClick={() => setSelected(r.id)}>
                Ver mapa
              </button>
              <Favorite kind="routes" item={{ ...r, id: r.id! }} />
              <Delete kind="routes" id={r.id!} name={r.name} />
            </div>
          </li>
        ))}
      </ul>
      {route && (
        <section>
          <h2>{route.name}</h2>
          <MapView route={route} />
          {route.mode === "car" && (
            <small>
              {route.priceSource} {route.priceDate}
            </small>
          )}
        </section>
      )}
    </>
  );
}
function Settings({ state }: { state: State }) {
  const p = state.preferences;
  const [mode, setMode] = useState(p.mode),
    [manual, setManual] = useState(p.useManualPrices);
  return (
    <form
      className="settings"
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
      <p>
        Estos valores se usarán como predeterminados en las nuevas consultas.
      </p>
      <div className="pair">
        <Field label="Transporte predeterminado">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Preferences["mode"])}
          >
            {Object.entries(modeNames).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
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
        <Field label="Criterio predeterminado">
          <select name="preference" defaultValue={p.preference}>
            <option value="fastest">Más rápida</option>
            <option value="shortest">Más corta</option>
            <option value="cheapest">Más económica</option>
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
            defaultValue={p.weight}
            required
          />
        </Field>
      </div>
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
            label={`${typeNames[k]} (${k === "electric" ? "€/kWh" : "€/l"})`}
          >
            <input
              name={k}
              type="number"
              min={0.001}
              max={20}
              step="any"
              defaultValue={p.manualPrices[k]}
              required
            />
          </Field>
        ))}
      </div>
      <small>
        Con precios automáticos se consultan MITECO y REE. La electricidad es
        una referencia mayorista, no la tarifa final de tu vivienda.
      </small>
      <button type="submit">Guardar preferencias</button>
    </form>
  );
}
function Account({ state }: { state: State }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <section className="settings">
      <p>
        <strong>{state.user.name}</strong>
        <br />
        {state.user.email}
      </p>
      <button onClick={() => void vm.run(() => vm.logout())}>
        Cerrar sesión
      </button>
      <section className="account-delete">
        <h2>Eliminar cuenta</h2>
        <p>
          Se borrarán la cuenta y todos sus lugares, vehículos, rutas y
          preferencias.
        </p>
        {!confirm ? (
          <button className="danger" onClick={() => setConfirm(true)}>
            Eliminar mi cuenta
          </button>
        ) : (
          <form
            onSubmit={(e) =>
              submit(e, async () => {
                const f = new FormData(e.currentTarget);
                await vm.account(String(f.get("password")));
              })
            }
          >
            <Field label="Confirma tu contraseña">
              <input
                type="password"
                name="password"
                required
                maxLength={128}
                autoComplete="current-password"
              />
            </Field>
            <div className="actions">
              <button className="danger">
                Confirmar eliminación de cuenta
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => setConfirm(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </section>
    </section>
  );
}
function App() {
  const app = useApp();
  const currentPage = () =>
    pages.includes(location.hash.slice(1) as Page)
      ? (location.hash.slice(1) as Page)
      : "alta-lugar";
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
    const t = app.state?.preferences.theme ?? "light";
    document.documentElement.dataset.theme = t;
  }, [app.state?.preferences.theme]);
  useEffect(() => {
    document.getElementById("page-title")?.focus();
  }, [page]);
  const state = app.state;
  return (
    <>
      <a className="skip" href="#content">
        Ir al contenido
      </a>
      <header>
        <div className="brand">
          Vía <span>Spike · EI1039 / EI1048</span>
        </div>
        {state && <span>{state.user.name}</span>}
      </header>
      {state && (
        <nav aria-label="Navegación principal">
          {pages.map((p) => (
            <a
              key={p}
              href={`#${p}`}
              aria-current={page === p ? "page" : undefined}
            >
              {titles[p]}
            </a>
          ))}
        </nav>
      )}
      <main id="content">
        <div aria-live="polite">
          {app.busy && <p className="notice">Procesando…</p>}
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
          <p>Cargando…</p>
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
                  ) : page === "rutas" ? (
                    <SavedRoutes state={state} />
                  ) : page === "preferencias" ? (
                    <Settings state={state} />
                  ) : (
                    <Account state={state} />
                  )}
                </div>
              </>
            )}
          </fieldset>
        )}
      </main>
      <footer>Iteración 0 · Prototipo de movilidad</footer>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
