# Comprobación básica de tecnologías y APIs

El spike sirve para comprobar que podemos utilizar las tecnologías elegidas y recibir respuestas útiles de las APIs. Las consultas usan lugares de Castellón y los servicios previstos para la aplicación. Las pruebas de aceptación completas se conservan como trabajo adicional.

## Ejecutar

Se necesita Node.js 24.16 o superior, conexión a internet y una clave propia de OpenRouteService. Desde esta carpeta se instala el proyecto con `npm ci`, se copia `.env.example` a `.env` y se introduce la clave en `ORS_API_KEY`.

```sh
npm run spike:apis
```

El comando realiza las ocho comprobaciones siguientes. Si una falla, muestra el fallo y termina con un código de error. No se da por comprobada una API solo porque otra funcione. Tampoco se omiten pruebas al faltar la clave. `npm run test:live` ejecuta el mismo comando.

| Prueba | Consulta real | Qué se comprueba |
| --- | --- | --- |
| API-01 | Búsqueda de Universitat Jaume I, Castellón | Hay candidatos con nombres y coordenadas válidas y al menos uno próximo a la UJI |
| API-02 | Búsqueda inversa del punto de Centro | El servicio devuelve un lugar cercano con nombre. No basta el texto de reserva del adaptador |
| API-03 | Ruta de Centro a UJI en coche | Trazado con extremos próximos a los pedidos, metros, segundos e indicaciones |
| API-04 | El mismo trayecto en bicicleta | La respuesta del perfil de bicicleta tiene esos campos |
| API-05 | El mismo trayecto a pie | La respuesta del perfil a pie tiene esos campos |
| API-06 | Estaciones terrestres de MITECO | Fecha, lista de estaciones y medias de gasolina y diésel en euros por litro |
| API-07 | Precios eléctricos de REE para la fecha actual | Serie de valores con fecha y conversión de euros por MWh a euros por kWh |
| API-08 | Una imagen de OpenStreetMap sobre Castellón | HTTP 200 y un PNG de 256 por 256 píxeles |

Se han superado las ocho comprobaciones el 15 de octubre de 2026. La salida se conserva en [spike-apis.txt](../06_Comprobaciones/spike-apis.txt). Es una comprobación de esa ejecución. No garantiza que los servicios estén siempre disponibles.

## Peticiones y respuestas

| Servicio y dirección | Datos de entrada | Respuesta utilizada |
| --- | --- | --- |
| GET `api.openrouteservice.org/geocode/search` | `api_key`, `text`, `size` y `lang` | GeoJSON con candidatos en `features`, sus nombres y `geometry.coordinates` |
| GET `api.openrouteservice.org/geocode/reverse` | `api_key`, `point.lat`, `point.lon`, `size` y `lang` | GeoJSON con lugares cercanos al punto |
| POST `api.openrouteservice.org/v2/directions/{profile}/geojson` | Clave en `Authorization` y JSON con `coordinates`, `preference`, `instructions` y `language` | GeoJSON con trazado, `summary.distance`, `summary.duration` e indicaciones |
| GET `sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/` | Sin clave | JSON con `Fecha`, `ListaEESSPrecio` y precios como texto con coma decimal |
| GET `apidatos.ree.es/es/datos/mercados/precios-mercados-tiempo-real` | `start_date`, `end_date` y `time_trunc` | JSON con las series de `included`, sus valores y fechas |
| GET `tile.openstreetmap.org/{z}/{x}/{y}.png` | Nivel de zoom y posición de la imagen | Imagen PNG para mostrar en Leaflet |

Los perfiles de rutas son `driving-car`, `cycling-regular` y `foot-walking`. El adaptador solicita las opciones rápida o recomendada y corta. Si ambas tienen el mismo trazado, conserva una sola. Los resultados siguen el orden longitud y latitud. Antes de dibujarlos en Leaflet se invierte ese orden.

MITECO proporciona precios de estaciones concretas. El adaptador convierte la coma decimal y obtiene la media de las estaciones con un valor válido. REE proporciona una referencia mayorista. El adaptador obtiene la media de la serie recibida y divide entre 1000 para pasar de euros por MWh a euros por kWh. Esa cifra no equivale al precio final de una tarifa doméstica. El número de valores y sus fechas se comprueban en la respuesta y no se fijan de antemano.

OpenStreetMap proporciona las imágenes del mapa. La comprobación descarga una sola imagen y utiliza una identificación propia. La aplicación mantiene la atribución visible. Esta consulta no se confunde con la búsqueda de topónimos, que utiliza ORS.

La clave se guarda únicamente en el archivo local `.env`. Las evidencias muestran la operación y la dirección sin los parámetros que contienen la clave. Si ORS rechaza la clave, se agota la cuota o no responde un servicio, el fallo se informa y no se sustituye por una respuesta inventada.

## Precios y vehículo opcional

El planificador consulta los precios mediante la API local autenticada `GET /api/prices`. El servidor utiliza MITECO y REE y conserva una caché de 30 minutos. La clave de ORS no interviene en la consulta de precios. Si se activan precios manuales en Preferencias, se muestran y utilizan esos valores en su lugar.

Se pueden ver los tres precios sin registrar un vehículo. Para una ruta en coche, el vehículo es opcional. Si se elige uno, su tipo determina si se aplica gasolina, diésel o electricidad. El coste se obtiene con la distancia en kilómetros dividida entre 100, multiplicada por el consumo y el precio. Si no hay vehículo o falta su precio, el coste figura como no disponible y la ruta sigue siendo consultable y guardable.

## Demostración de las tecnologías

Se ejecuta `npm run spike` y se abre la dirección local que muestra el servidor.

1. Crear una cuenta de prueba para acceder a la demostración de React y Node.js.
2. Buscar Universitat Jaume I, Castellón y seleccionar un candidato. Elegir también un punto en el mapa y comprobar sus coordenadas.
3. Guardar Centro y UJI. Pedir un trayecto sin seleccionar vehículo y comprobar que Leaflet dibuja la geometría recibida. Consultar los tres precios y elegir un vehículo solo si se quiere estimar el coste. El comando de APIs comprueba también coche y bicicleta.
4. Guardar un dato, reiniciar el servidor y acceder de nuevo. La recuperación comprueba el uso básico de SQLite.
5. Ejecutar `npm run build` para comprobar TypeScript y la compilación con Vite.

Para la demostración de Node.js y SQLite se usan los formularios que ya tiene la aplicación. Completar todos los recorridos del proyecto no forma parte de este objetivo básico.

## Referencias de los proveedores

- [Geocodificación de OpenRouteService](https://giscience.github.io/openrouteservice/api-reference/endpoints/geocoder/)
- [Rutas de OpenRouteService](https://giscience.github.io/openrouteservice/api-reference/endpoints/directions/)
- [Operaciones del servicio de carburantes](https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/help)
- [Documentación de REData](https://www.ree.es/es/datos/apidatos)
- [Uso de las imágenes de OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/)
