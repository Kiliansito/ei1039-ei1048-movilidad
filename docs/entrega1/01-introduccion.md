# Objetivo y alcance

Vía permite guardar lugares y vehículos, calcular rutas y consultar su distancia, duración y coste. Esta entrega recoge las historias del proyecto, dos escenarios por historia y el diseño de las pantallas. El spike sirve para probar la conexión entre la interfaz, el servidor, la base de datos y los servicios externos.

La iteración 0 utiliza una pantalla por función, con formularios y listas sencillos. Permite comprobar la viabilidad de las tecnologías elegidas. El catálogo de historias describe el comportamiento previsto del proyecto y orienta las pruebas de las siguientes iteraciones.

Repositorio del spike en <https://github.com/Kiliansito/ei1039-ei1048-movilidad>


## Elección y tamaño de las historias

El documento de requisitos [1] propone 24 historias. Se mantienen todas y se añaden dos separaciones. HU-09 recoge la selección en el mapa, que el objetivo del proyecto exige expresamente. HU-16 trata el coste eléctrico por separado porque utiliza otras unidades y otra fuente de precios. Por eso el catálogo contiene 26 historias. Estas dos decisiones se presentan al profesorado para su revisión.

Las operaciones de alta, consulta, modificación y borrado se mantienen separadas porque tienen un resultado propio que se puede comprobar. HU-22 reúne los favoritos de lugares, vehículos y rutas porque en los tres casos se aplica la misma regla. HU-25 y HU-26 se conservan separadas para distinguir el cierre normal de una interrupción, como hace el enunciado. No se añaden funciones ajenas a los seis requisitos.

Cada historia expresa una necesidad del usuario y contiene datos, resultados y límites que permiten estimar y comprobar su desarrollo. Hay dependencias de datos entre ellas, como disponer de lugares antes de calcular una ruta. Cada prueba prepara esos datos sin ejecutar antes otras pruebas. Esto permite trabajar sobre las historias por separado. La estimación del esfuerzo y el reparto en iteraciones corresponden a la Entrega 2.

En las próximas iteraciones se seguirá ATDD y se conservarán las pruebas y los cambios en Git. El proyecto final deberá justificar al menos cinco patrones de diseño y un patrón para la interfaz. El spike no acredita por sí solo el seguimiento de ATDD en todo el proyecto.
