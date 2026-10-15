# Iteración 0

El spike integra React y TypeScript en la interfaz, Vite para la compilación, Node.js 24.16 o superior en el servidor, SQLite para el almacenamiento y Leaflet con OpenStreetMap para el mapa. El objetivo es comprobar que estas piezas pueden comunicarse y que los datos guardados se recuperan al volver a abrir la aplicación.

La interfaz se suscribe a un modelo de vista observable. Las peticiones HTTP llegan a MobilityService, que coordina los casos de uso. RepositoryPort separa el almacenamiento y RoutingPort, GeocodingPort y PricePort aíslan los servicios externos. Esta separación permite cambiar un proveedor por un doble de prueba sin modificar las pantallas.

| **Servicio** | **Uso en el spike** |
| --- | --- |
| **OpenRouteService** | Geocodificación y rutas en coche, bicicleta y a pie. Clave solo en el servidor. |
| **OpenStreetMap** | Mapa y selección visual con Leaflet. Se mantiene la atribución. |
| **MITECO** | Precios de gasolina y diésel como media de las estaciones con datos. |
| **REE** | Precio eléctrico de referencia. Conversión de €/MWh a €/kWh. |


## Cálculos y decisiones

El coste se calcula multiplicando distancia en km / 100 por el consumo medio y por el precio de la energía. El consumo se expresa en l/100 km o kWh/100 km, y el precio en €/l o €/kWh. Para caminar o ir en bicicleta se estiman kcal con MET × 3,5 × peso en kg / 200 × duración en minutos. Se usan MET de 3,5 y 6,8, respectivamente.

MET es un factor de actividad fijado para esta estimación. Estas cifras son orientativas y no miden el esfuerzo real de cada persona. El criterio económico compara las alternativas recibidas del proveedor. Los criterios de rapidez y distancia pueden devolver la misma opción. Con un mismo vehículo y un precio positivo, la ruta más corta también tiene el menor coste estimado. A pie y en bicicleta el coste monetario es cero, por lo que el criterio económico desempata por distancia. Si falta un precio, se muestra el coste como no disponible y no se afirma que la ruta sea la más económica. Las rutas guardadas conservan el trazado, las métricas y la fuente del cálculo original. En el spike se recuperan los datos confirmados, los favoritos, las preferencias y la selección del último trayecto.


## Ejecución y resultados

Desde 02_Spike se ejecutan npm ci, npm run build y npm run spike. La aplicación se abre en http://localhost:4173. OpenRouteService necesita una clave propia en ORS_API_KEY dentro de .env. El resto de proveedores no necesita clave. El README del spike detalla la instalación y los comandos de prueba.

En esta revisión pasan 36 pruebas locales de validación, adaptadores, separación de cuentas y persistencia, además de cuatro recorridos de navegador en Chrome de escritorio y móvil emulado. Los recorridos comprueban altas, edición, favoritos, cálculo, guardado, recarga, preferencias, cancelación y errores. Utilizan SQLite en memoria y proveedores de prueba.

Las pruebas de persistencia comprueban la reapertura de SQLite, la recuperación de una escritura confirmada y el descarte de una escritura sin confirmar después de terminar el proceso con SIGKILL. El ensayo reproduce la caída del proceso, sin simular daños físicos en el almacenamiento.

La consulta real de precios ha superado su comprobación de obtener al menos un precio público. También se ha superado la prueba real de ORS con búsqueda de lugares y rutas en coche, bicicleta y a pie. Se utilizó una clave local existente sin incorporarla al repositorio. El catálogo contiene 52 especificaciones de aceptación para el proyecto. Las comprobaciones del spike no demuestran que todas las historias estén implementadas.

Las instrucciones completas están en [el README del spike](../../entrega1/02_Spike/README.md). Los resultados están en [Comprobaciones](../../entrega1/06_Comprobaciones/).
