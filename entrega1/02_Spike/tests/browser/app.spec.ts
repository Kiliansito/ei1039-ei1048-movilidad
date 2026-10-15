import { test, expect, type Page } from "@playwright/test";
async function register(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Crear una cuenta", exact: true })
    .click();
  await page.getByLabel("Nombre", { exact: true }).fill("Ana");
  await page
    .getByLabel("Correo electrónico")
    .fill(`ana-${Date.now()}-${Math.random()}@example.com`);
  await page.getByLabel("Contraseña", { exact: true }).fill("RutaSegura2026");
  await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Alta de lugar", exact: true }),
  ).toBeVisible();
}
async function addPlace(page: Page, name: string, lat: string, lon: string) {
  await page.getByRole("link", { name: "Alta de lugar", exact: true }).click();
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
test("alta, vehículos, cálculo, favoritos y recuperación al recargar", async ({
  page,
}, info) => {
  await register(page);
  await addPlace(page, "Centro", "39.9864", "-0.0513");
  await addPlace(page, "UJI", "39.9946", "-0.0688");
  await page.getByRole("link", { name: "Lugares", exact: true }).click();
  await expect(page.locator("li")).toHaveCount(2);
  await page
    .getByRole("button", { name: "Marcar como favoritos UJI", exact: true })
    .click();
  await expect(page.locator("li").first()).toContainText("UJI");
  await page.getByRole("link", { name: "Vehículos", exact: true }).click();
  await page.getByLabel("Nombre", { exact: true }).fill("Mi coche");
  await page.getByLabel("Consumo (l/100 km)").fill("6");
  await page
    .getByRole("button", { name: "Guardar vehículo", exact: true })
    .click();
  await expect(page.locator("li")).toContainText("Mi coche");
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  await page.getByLabel("Consumo (l/100 km)").fill("7");
  await page
    .getByRole("button", { name: "Guardar cambios", exact: true })
    .click();
  await expect(page.locator("li")).toContainText("7 l/100 km");
  await page.getByRole("link", { name: "Calcular ruta", exact: true }).click();
  await page
    .getByLabel("Origen", { exact: true })
    .selectOption({ label: "Centro" });
  await page
    .getByLabel("Destino", { exact: true })
    .selectOption({ label: "UJI" });
  await page
    .getByLabel("Vehículo", { exact: true })
    .selectOption({ label: "Mi coche" });
  await page
    .getByRole("button", { name: "Calcular ruta", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Resultado", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".summary")).toContainText("1,12 €");
  await page.getByLabel("Nombre de la ruta").fill("Camino a clase");
  await page.getByRole("button", { name: "Guardar ruta", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Ruta guardada", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("link", { name: "Rutas guardadas", exact: true })
    .click();
  await page.getByRole("button", { name: "Ver mapa", exact: true }).click();
  await expect(page.locator(".map")).toBeVisible();
  await page.reload();
  await expect(page.locator("li")).toContainText("Camino a clase");
  await page.getByRole("link", { name: "Preferencias", exact: true }).click();
  await page.getByLabel("Criterio predeterminado").selectOption("shortest");
  await page.getByLabel("Transporte predeterminado").selectOption("bike");
  await page
    .getByRole("button", { name: "Guardar preferencias", exact: true })
    .click();
  await page.getByRole("link", { name: "Calcular ruta", exact: true }).click();
  await expect(page.getByLabel("Criterio", { exact: true })).toHaveValue(
    "shortest",
  );
  await expect(page.getByLabel("Transporte", { exact: true })).toHaveValue(
    "bike",
  );
  await page.getByRole("link", { name: "Cuenta", exact: true }).click();
  await page
    .getByRole("button", { name: "Cerrar sesión", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Iniciar sesión", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("el error del proveedor conserva los campos y el borrado se puede cancelar", async ({
  page,
}) => {
  await register(page);
  await addPlace(page, "Casa", "39.98", "-0.05");
  await page.getByRole("link", { name: "Lugares", exact: true }).click();
  await page.getByRole("button", { name: "Eliminar", exact: true }).click();
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(page.locator("li")).toContainText("Casa");
  await page.getByRole("link", { name: "Alta de lugar", exact: true }).click();
  await page.route("**/api/search?*", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Proveedor no disponible." }),
    }),
  );
  await page.getByLabel("Topónimo", { exact: true }).fill("Castellón");
  await page.getByRole("button", { name: "Buscar", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText("Proveedor no disponible.");
  await expect(page.getByLabel("Topónimo", { exact: true })).toHaveValue(
    "Castellón",
  );
});
