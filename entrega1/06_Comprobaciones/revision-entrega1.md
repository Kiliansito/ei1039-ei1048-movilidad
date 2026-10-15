# Revisión de la Entrega 1

15 de octubre de 2026

## Resultado

Las 26 historias tienen un tamaño razonable para el alcance básico del proyecto. Se han mantenido los seis requisitos y las 24 historias propuestas por el enunciado. Las dos separaciones adicionales permiten comprobar la selección en el mapa y el coste eléctrico. Reducir el catálogo sin revisar esa cobertura podría eliminar operaciones que el profesorado pide expresamente.

Se han revisado los cuatro PDF docentes completos, la memoria, los ocho documentos Markdown, los 52 escenarios, la tabla de trazabilidad, los nueve mockups y las instrucciones y comprobaciones del spike. Se ha contrastado la descripción de la arquitectura y los cálculos con el código correspondiente.

## Correspondencia con el material docente

| Material | Qué se ha comprobado | Resultado de la revisión |
| --- | --- | --- |
| Descripción y requisitos, 8 páginas | Seis requisitos, mapa obligatorio, vehículos eléctricos, favoritos y persistencia | El catálogo mantiene la cobertura del enunciado. Se explica por qué contiene 26 historias |
| Metodología y criterios, 12 páginas | INVEST, dos escenarios por historia, análisis por escenario y pruebas sobre la lógica de negocio | Se añade el análisis de los 52 escenarios y se separan las comprobaciones de interfaz |
| Instrucciones de la Entrega 1, 17 diapositivas | Datos concretos, reglas de dominio, consistencia de interfaces, spike y GAIDeT | Se completan los datos comunes, las reglas y los ejemplos de uso de IA. Se utiliza el generador GAIDeT |
| Presentación del proyecto, 31 diapositivas | Alcance básico, finalidad de la iteración 0 y diferencias entre las pruebas | Se aclara que las especificaciones del proyecto y las comprobaciones del spike tienen distinto alcance |

Los originales están en `05_Material_docente`. La entrega consiste en el PDF que se presenta en Aula Virtual, junto con el acceso al repositorio del spike. La documentación docente fija el 16 de octubre de 2026 a las 23.59 para la Entrega 1.

## Valoración de las historias

| Historias | Valoración |
| --- | --- |
| HU-01 a HU-04 | Registro, acceso, cierre y eliminación tienen objetivos y efectos distintos. Se mantienen separadas |
| HU-05 a HU-09 | Las dos formas de alta están en el enunciado. Consultar y borrar son operaciones propias. La selección en el mapa se justifica por su carácter obligatorio |
| HU-10 a HU-13 | Mantienen las cuatro operaciones de vehículos. Se amplía la redacción de la modificación para incluir nombre, tipo y consumo |
| HU-14 a HU-18 | Separan el trayecto, los costes, las calorías y el criterio. Combustible y electricidad tienen unidades y fuentes distintas. El criterio económico se limita a las alternativas recibidas |
| HU-19 a HU-21 | Guardar, recuperar y borrar rutas tienen resultados distintos. Consultar el historial no debe recalcularlo |
| HU-22 | Agrupar los favoritos de las tres listas evita repetir tres historias casi iguales. El análisis contempla cada tipo de elemento por separado |
| HU-23 y HU-24 | Distinguen transporte y criterio predeterminados. Se aclara su relación con la recuperación del último trayecto |
| HU-25 y HU-26 | El enunciado distingue cierre normal e interrupción. La respuesta correcta a una escritura sin confirmar es conservar lo anterior sin añadir datos parciales |

Las historias expresan una necesidad, incluyen resultados observables y tienen límites definidos. Comparten datos del dominio, pero sus pruebas preparan esos datos de forma independiente. La posibilidad de estimarlas no sustituye la estimación real de horas y el reparto del trabajo que corresponden a la Entrega 2.

## Correcciones realizadas

- Se completan los ocho documentos Markdown que solo tenían un título.
- Se añade un análisis de variantes a cada escenario y se conservan 26 escenarios válidos y 26 inválidos.
- Se concretan usuarios, lugares, vehículos, precios y condiciones de los resultados guardados.
- Se retira la comprobación de dibujar el mapa de la prueba de aceptación de la lógica de negocio. Su verificación corresponde al navegador.
- Se explica cómo comprobar resultados de API reales que cambian y cómo distinguir una prueba de integración con un doble.
- Se corrigen las relaciones entre historias y pantallas. Preferencias también interviene en precios manuales y peso.
- Se simplifican las frases y se eliminan los dos puntos, el punto y coma y las rayas largas de la prosa revisada. Se conservan la sintaxis del código, las direcciones y el texto original del generador GAIDeT.
- Se añaden fragmentos reales de esta revisión, resúmenes de respuestas y una valoración crítica del uso de IA.
- Se corrige el acceso con contraseñas que contienen espacios exteriores. La prueba reproduce el fallo antes del cambio y lo supera después.
- Se añade una prueba que interrumpe una escritura antes de confirmar la transacción y comprueba que solo se conserva el dato anterior.
- Se actualiza la dependencia indirecta source-map-js de 1.2.1 a 1.2.2. La revisión de dependencias ya no informa de vulnerabilidades conocidas.
- Se añade un comando para mantener los documentos Markdown, el catálogo de aceptación y la trazabilidad alineados con la fuente LaTeX.

## Comprobaciones

| Comprobación | Resultado |
| --- | --- |
| Pruebas locales | 36 superadas |
| Navegador | Cuatro recorridos superados, dos de escritorio y dos con tamaño móvil emulado |
| Servicios reales | Dos pruebas superadas, precios públicos y búsqueda y rutas con ORS en los tres modos |
| Compilación TypeScript y Vite | Correcta |
| Dependencias | Sin vulnerabilidades conocidas según npm audit en esta revisión |
| Memoria | 22 páginas compiladas y revisadas visualmente |
| Documentos y catálogo | 26 historias, 52 escenarios con sus cinco campos completos y nueve pantallas |

Los archivos de esta carpeta conservan las salidas de las ejecuciones. Las pruebas locales y de navegador no representan 52 pruebas de aceptación ya terminadas.

## Cuestiones que debe cerrar el equipo

El profesorado debe revisar las dos separaciones de historias y las decisiones de dominio, como los límites de los campos y la interpretación de los datos que se recuperan tras cerrar. Esta revisión no acredita su aprobación.

El repositorio es privado. El equipo debe comprobar que el profesor de prácticas tiene acceso antes de presentar el PDF. No se han cambiado sus permisos ni se han añadido colaboradores.

La planificación de iteraciones, la estimación de horas, el reparto de historias y la justificación detallada de patrones corresponden a la siguiente entrega. El desarrollo del proyecto tendrá que conservar pruebas del proceso ATDD y seguir la revisión de ramas que indica la metodología. Un spike funcional no sustituye ese trabajo.
