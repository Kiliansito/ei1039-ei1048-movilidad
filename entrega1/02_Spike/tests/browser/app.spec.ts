import { test, expect, type Page, type TestInfo } from "@playwright/test";
import { mkdirSync } from "node:fs";
const password = "RutaSegura2026";
const emailFor = (info: TestInfo) =>
  `ana-${info.testId.replace(/[^a-z0-9]/gi, "").slice(-20)}-${info.project.name}@example.com`;
test.beforeEach(async ({ page }, info) => {
  await page.setExtraHTTPHeaders({
    "X-Via-Test-Scope": info.testId + info.project.name,
  });
});
test.afterEach(async ({ page }) => {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
async function shot(page: Page, code: string, info: TestInfo) {
  mkdirSync("../06_Comprobaciones/capturas", { recursive: true });
  await page.screenshot({
    path: `../06_Comprobaciones/capturas/${code}-${info.project.name}.png`,
    fullPage: true,
  });
}
async function register(page: Page, info: TestInfo) {
  await page.goto("/");
  const form = page.getByRole("form", {
    name: "Crear una cuenta",
    exact: true,
  });
  await form.getByLabel("Nombre", { exact: true }).fill("Ana");
  await form.getByLabel("Correo electrónico").fill(emailFor(info));
  await form.getByLabel("Contraseña", { exact: true }).fill(password);
  await form.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Nuevo lugar de interés", exact: true }),
  ).toBeVisible();
}
async function addPlace(page: Page, name: string, lat: string, lon: string) {
  await page.getByRole("link", { name: "Lugares", exact: true }).click();
  await page.getByRole("link", { name: "Añadir lugar", exact: true }).click();
  await page.getByRole("tab", { name: "Coordenadas", exact: true }).click();
  await page.getByLabel("Nombre del lugar").fill(name);
  await page.getByLabel("Latitud", { exact: true }).fill(lat);
  await page.getByLabel("Longitud", { exact: true }).fill(lon);
  await page
    .getByRole("button", { name: "Guardar lugar", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Lugar guardado." }),
  ).toBeVisible();
}
async function endpoints(page: Page) {
  await addPlace(page, "Centro", "39.9864", "-0.0513");
  await addPlace(page, "UJI", "39.9946", "-0.0684");
}
async function vehicle(page: Page) {
  await page.getByRole("link", { name: "Vehículos", exact: true }).click();
  const form = page.getByRole("form", { name: "Añadir o editar vehículo" });
  await form.getByLabel("Nombre", { exact: true }).fill("Compacto");
  await form.getByLabel("Consumo (l/100 km)").fill("6");
  await form
    .getByRole("button", { name: "Guardar vehículo", exact: true })
    .click();
  await expect(page.getByRole("listitem")).toContainText("Compacto");
}
async function plan(page: Page, mode = "foot") {
  await page.getByRole("link", { name: "Explorar", exact: true }).click();
  await page
    .getByLabel("Origen guardado", { exact: true })
    .selectOption({ label: "Centro" });
  await page
    .getByLabel("Destino guardado", { exact: true })
    .selectOption({ label: "UJI" });
  await page
    .getByLabel("Modo de transporte", { exact: true })
    .selectOption(mode);
  if (mode === "car")
    await page
      .getByLabel("Vehículo opcional", { exact: true })
      .selectOption({ label: "Compacto · Gasolina · 6 l/100 km" });
  await page
    .getByRole("button", { name: "Calcular ruta", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Resultado del trayecto", exact: true }),
  ).toBeVisible();
}
async function save(page: Page) {
  await page.getByLabel("Nombre para guardar la ruta").fill("Camino a clase");
  await page.getByRole("button", { name: "Guardar ruta", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Ruta guardada", exact: true }),
  ).toBeDisabled();
}

test("M01 registro y acceso comparten la pantalla y un correo duplicado conserva los campos", async ({
  page,
}, info) => {
  await page.goto("/");
  await expect(
    page.getByRole("form", { name: "Crear una cuenta", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("form", { name: "Iniciar sesión", exact: true }),
  ).toBeVisible();
  await shot(page, "M01", info);
  await register(page, info);
  await page.getByRole("link", { name: "Mi cuenta", exact: true }).click();
  await page
    .getByRole("button", { name: "Cerrar sesión", exact: true })
    .click();
  const form = page.getByRole("form", {
    name: "Crear una cuenta",
    exact: true,
  });
  await form.getByLabel("Nombre", { exact: true }).fill("Ana");
  await form.getByLabel("Correo electrónico").fill(emailFor(info));
  await form.getByLabel("Contraseña").fill(password);
  await form.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "correo ya está registrado",
  );
  await expect(form.getByLabel("Correo electrónico")).toHaveValue(
    emailFor(info),
  );
});
test("M02 una contraseña incorrecta no borra la cuenta y permite cancelar", async ({
  page,
}, info) => {
  await register(page, info);
  await page.getByRole("link", { name: "Mi cuenta", exact: true }).click();
  await page
    .getByRole("button", { name: "Eliminar mi cuenta", exact: true })
    .click();
  await page.getByLabel("Confirma tu contraseña").fill("OtraClave2026");
  await page
    .getByRole("button", {
      name: "Confirmar eliminación de cuenta",
      exact: true,
    })
    .click();
  await expect(page.getByRole("alert")).toHaveText("Contraseña incorrecta.");
  await shot(page, "M02", info);
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Mi cuenta", exact: true }),
  ).toBeVisible();
});
test("M03 guarda coordenadas, exige seleccionar un resultado y permite elegir en el mapa", async ({
  page,
}, info) => {
  await register(page, info);
  await page.getByRole("tab", { name: "Topónimo", exact: true }).click();
  await page.getByLabel("Buscar un topónimo").fill("Castellón");
  await page.getByRole("button", { name: "Buscar", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Seleccionar Estación de Castellón",
      exact: true,
    })
    .click();
  await expect(page.getByLabel("Latitud", { exact: true })).toHaveValue(
    "39.988",
  );
  await page.getByLabel("Nombre del lugar").fill("Estación");
  await shot(page, "M03", info);
  await page
    .getByRole("button", { name: "Guardar lugar", exact: true })
    .click();
  await page.getByRole("tab", { name: "Mapa", exact: true }).click();
  await page.locator(".map").click({ position: { x: 100, y: 100 } });
  await page.getByLabel("Nombre del lugar").fill("Punto del mapa");
  await expect(page.getByLabel("Latitud", { exact: true })).not.toHaveValue("");
  await page
    .getByRole("button", { name: "Guardar lugar", exact: true })
    .click();
  await page.getByRole("link", { name: "Lugares", exact: true }).click();
  await expect(page.getByRole("listitem")).toHaveCount(2);
});
test("M04 busca, ordena favoritos, cancela el borrado y selecciona un origen", async ({
  page,
}, info) => {
  await register(page, info);
  await endpoints(page);
  await page.getByRole("link", { name: "Lugares", exact: true }).click();
  await page
    .getByRole("button", { name: "Marcar como favoritos UJI", exact: true })
    .click();
  await expect(page.getByRole("listitem").first()).toContainText("UJI");
  await page.getByLabel("Buscar en mis lugares").fill("Centro");
  await expect(page.getByRole("listitem")).toHaveCount(1);
  await page.getByLabel("Buscar en mis lugares").fill("");
  const centro = page.getByRole("listitem").filter({ hasText: "Centro" });
  await centro.getByRole("button", { name: "Eliminar", exact: true }).click();
  await shot(page, "M04", info);
  await centro.getByRole("button", { name: "Cancelar", exact: true }).click();
  await centro
    .getByRole("button", { name: "Usar como origen", exact: true })
    .click();
  await expect(page.getByLabel("Origen guardado")).toHaveValue(/.+/);
});
test("M05 edita el consumo y cambia las unidades al elegir un eléctrico", async ({
  page,
}, info) => {
  await register(page, info);
  await vehicle(page);
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  await page.getByLabel("Consumo (l/100 km)").fill("5.5");
  await page
    .getByRole("button", { name: "Guardar cambios", exact: true })
    .click();
  await expect(page.getByRole("listitem")).toContainText("5,5 l/100 km");
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  await page.getByLabel("Tipo", { exact: true }).selectOption("electric");
  await expect(page.getByLabel("Consumo (kWh/100 km)")).toBeVisible();
  await shot(page, "M05", info);
  await page
    .getByRole("button", { name: "Cancelar edición", exact: true })
    .click();
});
test("M06 y M07 calculan con el vehículo elegido y guardan el resultado", async ({
  page,
}, info) => {
  await register(page, info);
  await endpoints(page);
  await vehicle(page);
  await page.getByRole("link", { name: "Explorar", exact: true }).click();
  await shot(page, "M06", info);
  await plan(page, "car");
  await expect(page.locator(".summary")).toContainText("0,96 €");
  await expect(page.locator(".map .leaflet-overlay-pane path")).toBeVisible();
  await shot(page, "M07", info);
  await save(page);
});
test("un fallo de rutas conserva los campos y no cambia el último trayecto guardado", async ({
  page,
}, info) => {
  await register(page, info);
  await endpoints(page);
  await page.getByRole("link", { name: "Explorar", exact: true }).click();
  await page.getByLabel("Origen guardado").selectOption({ label: "Centro" });
  await page.getByLabel("Destino guardado").selectOption({ label: "UJI" });
  await page.getByLabel("Modo de transporte").selectOption("foot");
  const before = await page.request.get("/api/state").then((r) => r.json());
  await page.route("**/api/plan", (r) =>
    r.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Proveedor no disponible." }),
    }),
  );
  await page
    .getByRole("button", { name: "Calcular ruta", exact: true })
    .click();
  await expect(page.getByRole("alert")).toHaveText("Proveedor no disponible.");
  const after = await page.request.get("/api/state").then((r) => r.json());
  expect(after.preferences).toEqual(before.preferences);
  await expect(page.getByLabel("Destino guardado")).not.toHaveValue("");
});
test("un origen y destino iguales no alteran las preferencias", async ({
  page,
}, info) => {
  await register(page, info);
  await endpoints(page);
  await page.getByRole("link", { name: "Explorar", exact: true }).click();
  await page.getByLabel("Origen guardado").selectOption({ label: "Centro" });
  await page.getByLabel("Destino guardado").selectOption({ label: "Centro" });
  await page.getByLabel("Modo de transporte").selectOption("foot");
  const before = await page.request.get("/api/state").then((r) => r.json());
  await page
    .getByRole("button", { name: "Calcular ruta", exact: true })
    .click();
  await expect(page.getByRole("alert")).toHaveText(
    "Elige dos lugares diferentes.",
  );
  const after = await page.request.get("/api/state").then((r) => r.json());
  expect(after.preferences).toEqual(before.preferences);
});
test("M08 recupera la copia histórica y permite buscar y cancelar su eliminación", async ({
  page,
}, info) => {
  await register(page, info);
  await endpoints(page);
  await plan(page);
  await save(page);
  await page.getByRole("link", { name: "Rutas", exact: true }).click();
  await page.getByLabel("Buscar en mis rutas").fill("clase");
  await expect(page.getByRole("listitem")).toHaveCount(1);
  await page.getByRole("button", { name: "Ver detalle", exact: true }).click();
  await expect(
    page.getByText("Cálculo histórico", { exact: true }),
  ).toBeVisible();
  await shot(page, "M08", info);
  await page.getByRole("button", { name: "Eliminar", exact: true }).click();
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("listitem")).toContainText("Camino a clase");
});
test("M09 guarda valores predeterminados y cancela una edición sin guardarla", async ({
  page,
}, info) => {
  await register(page, info);
  await page.getByRole("link", { name: "Preferencias", exact: true }).click();
  await page.getByLabel("Transporte predeterminado").selectOption("bike");
  await page.getByLabel("Criterio predeterminado").selectOption("shortest");
  await page
    .getByRole("button", { name: "Guardar preferencias", exact: true })
    .click();
  await shot(page, "M09", info);
  await page.getByLabel("Peso para estimar calorías (kg)").fill("80");
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(page.getByLabel("Peso para estimar calorías (kg)")).toHaveValue(
    "70",
  );
  await page.getByRole("link", { name: "Explorar", exact: true }).click();
  await expect(page.getByLabel("Modo de transporte")).toHaveValue("bike");
  await expect(page.getByLabel("Criterio", { exact: true })).toHaveValue(
    "shortest",
  );
});
test("M10 muestra los datos recuperados después de iniciar sesión", async ({
  page,
}, info) => {
  await register(page, info);
  await endpoints(page);
  await page.getByRole("link", { name: "Mi cuenta", exact: true }).click();
  await page
    .getByRole("button", { name: "Cerrar sesión", exact: true })
    .click();
  const form = page.getByRole("form", { name: "Iniciar sesión", exact: true });
  await form.getByLabel("Correo electrónico").fill(emailFor(info));
  await form.getByLabel("Contraseña").fill(password);
  await form.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Tu estado recuperado", exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId("recovered-places")).toContainText("Centro");
  await expect(page.getByTestId("recovered-places")).toContainText("UJI");
  await shot(page, "M10", info);
  await page
    .getByRole("link", { name: "Continuar planificación", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "¿Adónde vamos?", exact: true }),
  ).toBeVisible();
});
test("un fallo de carga muestra un error recuperable y no una colección vacía", async ({
  page,
}) => {
  await page.route("**/api/health", (r) =>
    r.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        error: "No se pueden recuperar los datos guardados.",
      }),
    }),
  );
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Reintentar", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Todavía no hay lugares guardados.", { exact: true }),
  ).not.toBeVisible();
  await page.unroute("**/api/health");
  await page.getByRole("button", { name: "Reintentar", exact: true }).click();
  await expect(
    page.getByRole("form", { name: "Crear una cuenta", exact: true }),
  ).toBeVisible();
});

test("los precios se muestran sin vehículos y el coche puede calcularse y guardarse sin estimar coste", async ({
  page,
}, info) => {
  await register(page, info);
  await endpoints(page);
  await page.getByRole("link", { name: "Explorar", exact: true }).click();
  const prices = page.getByRole("region", { name: "Precios de la energía" });
  await expect(prices.getByText("1,6 €/l", { exact: true })).toBeVisible();
  await expect(prices.getByText("1,5 €/l", { exact: true })).toBeVisible();
  await expect(prices.getByText("0,2 €/kWh", { exact: true })).toBeVisible();
  await page.getByLabel("Origen guardado").selectOption({ label: "Centro" });
  await page.getByLabel("Destino guardado").selectOption({ label: "UJI" });
  await page.getByLabel("Modo de transporte").selectOption("car");
  await expect(page.getByLabel("Vehículo opcional")).toHaveValue("");
  await page.getByLabel("Criterio", { exact: true }).selectOption("cheapest");
  await page
    .getByRole("button", { name: "Calcular ruta", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Resultado del trayecto", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".summary")).toContainText("Coste no disponible");
  await expect(
    page.getByText(
      "No se puede comparar el coste sin un vehículo y un precio disponible. Las alternativas se ordenan por distancia.",
    ),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Selecciona un vehículo para estimar el coste con su consumo.",
    ),
  ).toBeVisible();
  await save(page);
  await page.getByRole("link", { name: "Rutas", exact: true }).click();
  await expect(page.getByRole("listitem")).toContainText("Coste no disponible");
  const state = await page.request.get("/api/state").then((r) => r.json());
  expect(state.vehicles).toHaveLength(0);
  expect(state.routes[0].cost).toBeNull();
  await shot(page, "Vehiculo-opcional", info);
});

test("un fallo al consultar los precios permite seguir calculando sin vehículo", async ({
  page,
}, info) => {
  await register(page, info);
  await endpoints(page);
  await page.route("**/api/prices", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Precios no disponibles." }),
    }),
  );
  await page.getByRole("link", { name: "Explorar", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Precios de la energía" }),
  ).toContainText("Precios no disponibles.");
  await page.getByLabel("Origen guardado").selectOption({ label: "Centro" });
  await page.getByLabel("Destino guardado").selectOption({ label: "UJI" });
  await page
    .getByRole("button", { name: "Calcular ruta", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Resultado del trayecto", exact: true }),
  ).toBeVisible();
});
