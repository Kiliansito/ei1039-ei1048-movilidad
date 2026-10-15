# Vía · Spike de movilidad

La iteración 0 comprueba el uso básico de las tecnologías y las APIs elegidas para EI1039 y EI1048. La interfaz sigue manualmente las capturas de las diez pantallas del diseño. Permite gestionar la cuenta, lugares, vehículos, rutas y preferencias. Utiliza React, TypeScript, Vite, Node.js, SQLite y Leaflet, junto con OpenRouteService, OpenStreetMap, MITECO y REE.

## Ejecutar

Requiere Node.js **24.16 o superior** y npm. Desde esta carpeta se ejecutan los siguientes comandos.

```sh
npm ci
cp .env.example .env
npm run spike
```

En PowerShell, usar `Copy-Item .env.example .env` en lugar de `cp`. Abrir [la aplicación local](http://localhost:4173) y crear una cuenta. La base de datos se crea en `data/via.sqlite`. No se incluyen cuentas, bases de datos ni claves en el paquete.

Para buscar topónimos y calcular rutas reales, introducir una clave propia en `.env`.

```dotenv
ORS_API_KEY=tu_clave
```

Reiniciar el servidor tras cambiar la clave. La cuenta, los lugares por coordenadas, los vehículos y las preferencias funcionan sin ella. Los mapas necesitan conexión. La clave no se envía al navegador.

## Rutas y precios

El vehículo es opcional al consultar una ruta en coche. Sin él se muestran el trazado, la distancia y la duración, y el coste queda como no disponible. La ruta también se puede guardar así. Elegir un vehículo permite usar su consumo y el precio de su tipo de energía para estimar el coste.

El planificador muestra gasolina, diésel y electricidad aunque no haya vehículos registrados. Por defecto consulta los servicios públicos. Si se activan los precios manuales en Preferencias, muestra y utiliza esos valores. El resultado indica el consumo y el precio aplicado. Si no se puede comparar el coste, se avisa y se ordenan las alternativas por distancia.

## Comprobación básica de las APIs

Después de configurar la clave ORS se ejecuta el siguiente comando.

```sh
npm run spike:apis
```

Hace ocho comprobaciones reales de búsqueda, búsqueda inversa, rutas en tres modos, carburantes, electricidad y una imagen del mapa. Cada operación tiene su propio resultado. No omite pruebas si falta la clave o un servicio falla. `npm run test:live` ejecuta la misma comprobación.

La [guía del spike](SPIKE_APIS.md) recoge las peticiones, los parámetros, las respuestas y una demostración breve. El objetivo es conocer el uso básico de las tecnologías. No requiere implementar todas las historias de usuario.

## Pruebas adicionales del código

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

`npm test` ejecuta 40 pruebas locales, 18 de integración y las 52 de aceptación seleccionadas en la memoria. Las de aceptación necesitan la clave ORS y conexión a los servicios reales. Si falta la clave o falla un servicio necesario, el comando falla. No omite esas pruebas.

Las pruebas se pueden lanzar por separado con `npm run test:local`, `npm run test:integration` y `npm run test:acceptance`. El [catálogo Gherkin](../04_Pruebas/aceptacion.feature) recoge los escenarios en texto. Su código está en [acceptance.test.ts](tests/acceptance.test.ts) y [support/scenarios.ts](tests/support/scenarios.ts). Se comprueba que los 52 identificadores del catálogo coinciden con los de las pruebas.

Las pruebas de aceptación actúan sobre la lógica de negocio con una base SQLite temporal en disco. Usan los proveedores reales cuando el escenario los necesita. Las de integración sustituyen esos proveedores por dobles con respuestas conocidas para comprobar cálculos y decisiones. Las pruebas locales cubren validaciones, adaptadores, cuentas y persistencia.

Las 28 pruebas de navegador comprueban 14 recorridos en escritorio y móvil. Ejecutan un servidor aislado con SQLite en memoria y proveedores de prueba. No usan la clave ORS ni los datos de trabajo. Guardan capturas de las diez pantallas en `../06_Comprobaciones/capturas` y comprueban que no haya desbordamiento horizontal.

Si se utiliza Chrome instalado, ejecutar `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e` en macOS o Linux. En PowerShell se puede establecer `PLAYWRIGHT_CHANNEL` como variable de entorno antes de ejecutar el mismo comando.

La compilación comprueba los tipos del código, de las pruebas y de la configuración del navegador. GitHub ejecuta las pruebas locales, de integración y de navegador y la compilación. Las 52 de aceptación con servicios reales se han ejecutado localmente. No se ha subido una clave a GitHub.

El [registro del proceso ATDD](../06_Comprobaciones/metodo-atdd.md) conserva la ejecución con fallos anterior a la implementación y los resultados finales. La evidencia corresponde a esta revisión. No acredita el orden de desarrollo del código que ya existía.

Para servir la compilación se ejecutan `npm run build` y `npm start`.

## Organización

| Archivo | Función |
| --- | --- |
| `web/main.tsx` | Pantallas y formularios |
| `web/model.ts` | Estado observable y comunicación con la API local |
| `web/Map.tsx` | Leaflet y selección geográfica |
| `src/services.ts` | Casos de uso de movilidad |
| `src/domain/` | Contratos y estimación de costes |
| `src/adapters/providers.ts` | Adaptadores HTTP, ORS y precios públicos |
| `src/repository.ts` | SQLite |
| `src/http.ts` y `src/server.ts` | API local y servidor |

Las pantallas consultan un modelo de vista que se comunica por HTTP con el servicio. Este utiliza los contratos de almacenamiento y de servicios externos. Se mantienen Facade en el servicio, Strategy en los costes, Adapter en los proveedores, Decorator en las cachés y Observer en el modelo de vista. La justificación detallada de patrones y la planificación se desarrollarán en la siguiente entrega.

## Límites

- El cálculo más económico ordena las alternativas recibidas del proveedor.
- El coste es orientativo. El precio REE es mayorista y no incluye el importe final de una tarifa doméstica.
- Las calorías se estiman por duración, peso y MET. No son una medición personal.
- Las rutas guardadas conservan geometría y métricas históricas. Borrar un lugar o cambiar el consumo no recalcula el historial.
- Se recuperan datos confirmados, preferencias y último trayecto. Al guardar preferencias se vacía la selección del trayecto y se usan los nuevos valores predeterminados. Los formularios y resultados sin guardar se descartan al cerrar.
- Las pruebas de caída usan SIGKILL. No simulan una avería física del disco.
