# Iteración 0

El objetivo de la iteración 0 es comprobar el uso básico de las tecnologías elegidas, especialmente de las APIs del proyecto. Se preparan consultas pequeñas para conocer los datos que necesitan y comprobar que responden con información que podamos utilizar. Esta comprobación técnica no exige completar todas las historias de usuario.


## Tecnologías utilizadas

React muestra los formularios y los resultados. TypeScript comprueba los tipos y Vite compila la interfaz. Node.js 24.16 o superior recibe las peticiones y consulta las APIs. SQLite permite guardar y recuperar un dato de prueba. Leaflet muestra el mapa, permite elegir un punto y dibuja un trazado recibido.

La interfaz sigue manualmente las capturas de los diez diseños. Las claves de los servicios se mantienen en el servidor. Los adaptadores separan las llamadas externas para poder comprobarlas por separado.


## APIs del proyecto

Se utilizan OpenRouteService, MITECO, REE y OpenStreetMap. La tabla recoge la consulta básica y la respuesta que se comprueba.

| **Servicio** | **Consulta y comprobación** |
| --- | --- |
| **ORS, búsqueda** | GET con un topónimo. Devuelve candidatos con nombre y coordenadas. También se consulta un lugar a partir de su latitud y longitud. |
| **ORS, rutas** | POST con origen, destino y perfil de coche, bicicleta o a pie. Se reciben trazado, distancia en metros, duración en segundos e indicaciones. |
| **MITECO** | GET de estaciones terrestres. Se comprueban la fecha y los precios de gasolina y diésel en €/l. |
| **REE** | GET de precios eléctricos con un intervalo de fechas. Se comprueban la serie recibida y la conversión de €/MWh a €/kWh. Es una referencia mayorista. |
| **OpenStreetMap** | GET de una imagen del mapa. Se comprueba que responde con una imagen PNG de 256 por 256 píxeles. Leaflet la muestra con la atribución correspondiente. |

Las coordenadas de ORS se envían como longitud y latitud. Leaflet utiliza latitud y longitud. Los adaptadores realizan ese cambio al mostrar el trazado. Los precios y las rutas pueden variar, por lo que se comprueban sus campos y unidades sin exigir cifras fijas.


## Ejecución y resultado

Desde 02_Spike se ejecuta npm ci y se configura ORS_API_KEY en .env. El comando npm run spike:apis realiza ocho comprobaciones con los servicios reales. Pasan las ocho, sin omisiones. MITECO y REE se comprueban por separado para que el fallo de uno no quede oculto por la respuesta del otro. La salida conserva la operación, los datos básicos y el resultado, sin mostrar claves.

Para abrir la demostración se ejecuta npm run spike y se accede a http://localhost:4173. Se puede buscar un lugar, pedir una ruta sin vehículo y consultar los tres precios. El vehículo aporta el consumo para estimar el coste. La guía 02_Spike/SPIKE_APIS.md explica las llamadas y los pasos.

Las pruebas de aceptación de las historias y sus evidencias ATDD se conservan como comprobaciones adicionales del código disponible. Se describen en 06_Comprobaciones y no se presentan como una condición para dar por válido el spike tecnológico.

Las instrucciones están en [el README del spike](../../entrega1/02_Spike/README.md). Los resultados están en [Comprobaciones](../../entrega1/06_Comprobaciones/).
