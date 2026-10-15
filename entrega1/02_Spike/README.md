# Vía · Spike de movilidad

Iteración 0 de EI1039 y EI1048. Nueve pantallas sencillas. alta de usuario, acceso, cuenta, alta de lugar, lugares, vehículos, cálculo de ruta, rutas guardadas y preferencias. Se conservan React, TypeScript, Vite, Node.js, SQLite y Leaflet, junto con OpenRouteService, OpenStreetMap, MITECO y REE.

## Ejecutar

Requiere Node.js **24.16 o superior** y npm. Desde esta carpeta:

```sh
npm ci
cp .env.example .env
npm run spike
```

En PowerShell, usar `Copy-Item .env.example .env` en lugar de `cp`. Abrir [http://localhost:4173](http://localhost:4173) y crear una cuenta. La base de datos se crea en `data/via.sqlite`. No se incluyen cuentas, bases de datos ni claves en el paquete.

Para geocodificación y cálculo real de rutas, introducir una clave propia en `.env`:

```dotenv
ORS_API_KEY=tu_clave
```

Reiniciar el servidor tras cambiar la clave. Las cuentas, los lugares por coordenadas, los vehículos y las preferencias funcionan sin ella. Los mapas necesitan conexión. La clave no se envía al navegador.

## Comprobar

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Si se utiliza Chrome instalado, ejecutar `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e` en macOS/Linux. En PowerShell, `$env:PLAYWRIGHT_CHANNEL='chrome'; npm run test:e2e`.

Las pruebas de navegador ejecutan un servidor aislado con SQLite en memoria y proveedores de prueba. No usan la clave ORS ni la base de datos de trabajo. Las pruebas locales incluyen integración con dobles, validaciones, adaptadores y persistencia. El catálogo de aceptación define el comportamiento previsto del proyecto.

Para los ensayos opcionales con servicios reales:

```sh
LIVE_APIS=1 npm run test:live
```

En PowerShell, `$env:LIVE_APIS='1'; npm run test:live`. ORS también necesita su clave. Sin estas variables las pruebas aparecen omitidas. En la revisión del 15 de octubre han pasado la consulta pública de precios y la prueba con ORS, utilizando una configuración local existente. La clave no se incluye en el repositorio.

Para servir la compilación:

```sh
npm run build
npm start
```

## Organización

- `web/main.tsx`: pantallas y formularios.
- `web/model.ts`: estado observable y comunicación con la API local.
- `web/Map.tsx`: Leaflet y selección geográfica.
- `src/services.ts`: casos de uso de movilidad.
- `src/domain/`: contratos y estimación de costes.
- `src/adapters/providers.ts`: adaptadores HTTP, ORS y precios públicos.
- `src/repository.ts`: SQLite.
- `src/http.ts` y `src/server.ts`: API local y servidor.

Las pantallas consultan un modelo de vista que se comunica por HTTP con el servicio. Este utiliza los contratos de almacenamiento y de servicios externos.

El spike conserva las separaciones de arquitectura del proyecto. Facade en el servicio, Strategy en los costes, Adapter en los proveedores, Decorator en las cachés y Observer en el modelo de vista. La justificación detallada de patrones y la planificación se desarrollarán en la siguiente entrega.

## Límites

- El cálculo más económico ordena las alternativas recibidas, no todas las carreteras posibles.
- El coste es orientativo. El precio REE es mayorista y no incluye el importe final de una tarifa doméstica.
- Las calorías se estiman por duración, peso y MET. No son una medición personal.
- Las rutas guardadas conservan geometría y métricas históricas. Borrar un lugar o cambiar el consumo no recalcula el historial.
- Se recuperan datos confirmados, preferencias y último trayecto. Al guardar preferencias se vacía la selección del trayecto y se usan los nuevos valores predeterminados. Los formularios sin guardar y los resultados sin guardar se descartan al cerrar.
- Las pruebas de caída usan SIGKILL. No simulan una avería física del disco.
- El spike se centra en los seis requisitos del enunciado.
