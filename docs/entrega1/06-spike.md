# Iteración 0

El spike integra React y TypeScript en la interfaz, Vite para la compilación, Node.js 24.16 o superior en el servidor, SQLite para el almacenamiento y Leaflet con OpenStreetMap para el mapa. Se comprueban la comunicación entre estas piezas y la recuperación de datos guardados.

La interfaz usa un modelo de vista observable. MobilityService coordina los casos de uso. RepositoryPort separa el almacenamiento y RoutingPort, GeocodingPort y PricePort aíslan los servicios externos. Estos contratos permiten usar dobles de prueba.

| **Servicio** | **Uso en el spike** |
| --- | --- |
| **OpenRouteService** | Geocodificación y rutas en coche, bicicleta y a pie. Clave solo en el servidor. |
| **OpenStreetMap** | Mapa y selección visual con Leaflet. Se mantiene la atribución. |
| **MITECO** | Precios de gasolina y diésel como media de las estaciones con datos. |
| **REE** | Precio eléctrico de referencia. Conversión de €/MWh a €/kWh. |


## Cálculos y decisiones

El coste se calcula multiplicando distancia en km / 100 por el consumo medio y por el precio de la energía. El consumo se expresa en l/100 km o kWh/100 km, y el precio en €/l o €/kWh. Para caminar o ir en bicicleta se estiman kcal con MET × 3,5 × peso en kg / 200 × duración en minutos. Se usan MET de 3,5 y 6,8, respectivamente.

MET es un factor de actividad y las calorías son orientativas. El criterio económico compara las alternativas del proveedor. Rapidez y distancia pueden dar la misma opción. Con el mismo vehículo y precio positivo, la ruta más corta también cuesta menos. A pie y en bicicleta el coste monetario es cero y se desempata por distancia. Si falta un precio, el coste figura como no disponible. Las rutas guardadas conservan trazado, métricas y fuente del cálculo. Se recuperan datos confirmados, favoritos, preferencias y último trayecto.


## Ejecución y resultados

Desde 02_Spike se ejecutan npm ci, npm run build y npm run spike. La aplicación se abre en http://localhost:4173. OpenRouteService necesita una clave propia en ORS_API_KEY dentro de .env. El resto de proveedores no necesita clave. El README del spike detalla la instalación y los comandos de prueba.

La interfaz sigue manualmente las capturas de las diez pantallas. Rutas, precios y mapas se obtienen al usar la aplicación. Las cifras de los mockups son ejemplos.

Pasan las 52 pruebas de aceptación seleccionadas, una válida y una inválida por historia. Actúan sobre la lógica de negocio con SQLite en disco y los servicios reales necesarios, sin omisiones. npm test las incluye junto con 36 pruebas locales y 18 de integración con dobles. La clave se conserva solo en .env.

Pasan 24 recorridos de navegador, 12 de escritorio y 12 de móvil emulado. Comprueban formularios, mapa, cálculos, favoritos, historial, preferencias y errores con datos y proveedores de prueba. La compilación comprueba los tipos del código y de las pruebas.

La persistencia se comprueba al reabrir SQLite y tras terminar el proceso con SIGKILL, antes y después de confirmar una escritura. No se simulan daños físicos del disco. Pasan también dos comprobaciones de conexión con precios, búsqueda y rutas reales.

Las pruebas se definen antes de corregir la implementación. La primera ejecución pasa 37 y falla 15. El historial y las salidas conservan ese resultado y las 52 superadas después. Esto acredita ATDD en esta revisión, sin atribuirlo al código anterior. Las variantes adicionales de las tablas no se cuentan como pruebas automatizadas.

Las instrucciones están en [el README del spike](../../entrega1/02_Spike/README.md). Los resultados están en [Comprobaciones](../../entrega1/06_Comprobaciones/).
