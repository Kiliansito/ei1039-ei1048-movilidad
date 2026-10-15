# Introducción

Vía es una propuesta de aplicación de movilidad desarrollada en el marco del proyecto conjunto de las asignaturas EI1039, Diseño de Software, y EI1048, Paradigmas de Software, del Grado en Ingeniería Informática de la Universitat Jaume I. Su objetivo es facilitar la planificación de desplazamientos a partir de lugares de interés guardados por el usuario y de distintos modos de transporte.

La aplicación prevista permitirá gestionar cuentas, lugares, vehículos y rutas. A partir de un origen y un destino, el usuario podrá visualizar el trayecto y consultar su distancia y duración, así como estimaciones del coste de combustible, del coste eléctrico o de las calorías, según el modo de transporte seleccionado. También se contempla la gestión de favoritos y preferencias, junto con la recuperación de los datos confirmados tras el cierre de la aplicación.

Este documento recoge el análisis de requisitos y la propuesta inicial de interfaz correspondientes a la Entrega 1. Los requisitos se descomponen en 26 historias de usuario. Para cada historia se identifican las reglas de dominio aplicables, se analizan distintos escenarios y se detallan dos pruebas de aceptación, una para un escenario válido y otra para uno inválido, mediante la estructura Given-When-Then. Estas especificaciones sirven como base para orientar el desarrollo mediante ATDD.

Los diez mockups elaborados en Figma relacionan las historias con las pantallas y muestran las acciones, los resultados y los estados de error previstos. El conjunto proporciona una base para revisar la coherencia entre requisitos, escenarios e interfaz antes de avanzar en la implementación. La especificación de un comportamiento o su representación en un mockup no implica que ya esté implementado o que su prueba de aceptación se haya superado.


## Elección y tamaño de las historias

El documento de requisitos [1] propone 24 historias. Se mantienen todas y se añaden dos separaciones. HU-09 recoge la selección en el mapa, que el objetivo del proyecto exige expresamente. HU-16 trata el coste eléctrico por separado porque utiliza otras unidades y otra fuente de precios. Por eso el catálogo contiene 26 historias. Estas dos decisiones se presentan al profesorado para su revisión.

Las operaciones de alta, consulta, modificación y borrado se mantienen separadas porque tienen un resultado propio que se puede comprobar. HU-22 reúne los favoritos de lugares, vehículos y rutas porque en los tres casos se aplica la misma regla. HU-25 y HU-26 se conservan separadas para distinguir el cierre normal de una interrupción, como hace el enunciado. No se añaden funciones ajenas a los seis requisitos.

Cada historia expresa una necesidad del usuario y contiene datos, resultados y límites que permiten estimar y comprobar su desarrollo. Hay dependencias de datos entre ellas, como disponer de lugares antes de calcular una ruta. Cada prueba prepara esos datos sin ejecutar antes otras pruebas. Esto permite trabajar sobre las historias por separado. La estimación del esfuerzo y el reparto en iteraciones corresponden a la Entrega 2.

En las próximas iteraciones se seguirá ATDD y se conservarán las pruebas y los cambios en Git. El proyecto final deberá justificar al menos cinco patrones de diseño y un patrón para la interfaz. El spike no acredita por sí solo el seguimiento de ATDD en todo el proyecto.

% Contenido de la segunda pestaña del documento de Drive.
