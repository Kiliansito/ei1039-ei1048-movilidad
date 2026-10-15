# Revisión de la Entrega 1

15 de octubre de 2026

## Resultado

Las 26 historias tienen un tamaño razonable para el alcance básico del proyecto. Se han mantenido los seis requisitos y las 24 historias propuestas por el enunciado. Las dos separaciones adicionales permiten comprobar la selección en el mapa y el coste eléctrico. Reducir el catálogo sin revisar esa cobertura podría eliminar operaciones que el profesorado pide expresamente.

Se han revisado los cuatro PDF docentes completos, la memoria, los ocho documentos Markdown, los 52 escenarios, la tabla de trazabilidad, los diez mockups de Figma y las instrucciones y comprobaciones del spike. Se ha contrastado la descripción de la arquitectura y los cálculos con el código correspondiente.

## Correspondencia con el material docente

| Material | Qué se ha comprobado | Resultado de la revisión |
| --- | --- | --- |
| Descripción y requisitos, 8 páginas | Seis requisitos, mapa obligatorio, vehículos eléctricos, favoritos y persistencia | El catálogo mantiene la cobertura del enunciado. Se explica por qué contiene 26 historias |
| Metodología y criterios, 12 páginas | INVEST, dos escenarios por historia, análisis por escenario y pruebas sobre la lógica de negocio | Se añade el análisis de los 52 escenarios y se separan las comprobaciones de interfaz |
| Instrucciones de la Entrega 1, 17 diapositivas | Datos concretos, reglas de dominio, consistencia de interfaces, spike y GAIDeT | Se completan los datos comunes, las reglas y la declaración de uso de IA. Se utiliza el generador GAIDeT |
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

- Se combinan los cinco apartados incorporados desde Drive con la revisión de las historias y las reglas. Los ocho documentos de lectura quedan completos.
- Se añade un análisis de variantes a cada escenario y se conservan 26 escenarios válidos y 26 inválidos seleccionados.
- Se concretan usuarios, lugares, vehículos, precios y condiciones de los resultados guardados.
- Se retira la comprobación de dibujar el mapa de la prueba de aceptación de la lógica de negocio. Su verificación corresponde al navegador.
- Se explica cómo comprobar resultados de API reales que cambian y cómo distinguir una prueba de integración con un doble.
- Se corrigen las relaciones entre historias y pantallas. Preferencias también interviene en precios manuales y peso.
- Se simplifican las frases y se eliminan los dos puntos, el punto y coma y las rayas largas de la prosa revisada. Se conservan la sintaxis del código, las direcciones y el texto original del generador GAIDeT.
- Se conserva la reflexión sobre el uso de IA y se completa la declaración GAIDeT.
- Se corrige el acceso con contraseñas que contienen espacios exteriores. La prueba reproduce el fallo antes del cambio y lo supera después.
- Se añade una prueba que interrumpe una escritura antes de confirmar la transacción y comprueba que solo se conserva el dato anterior.
- Se actualiza la dependencia indirecta source-map-js de 1.2.1 a 1.2.2. La revisión de dependencias ya no informa de vulnerabilidades conocidas.
- Se añade un comando para mantener los documentos Markdown, el catálogo de aceptación y la trazabilidad alineados con las fuentes LaTeX y sus apartados.

## Comprobaciones

| Comprobación | Resultado |
| --- | --- |
| Pruebas locales | 40 superadas |
| Aceptación | 52 superadas con SQLite en disco y servicios reales, sin omisiones |
| Integración | 18 superadas con proveedores de prueba |
| Navegador | 28 recorridos superados, 14 de escritorio y 14 con tamaño móvil emulado |
| APIs del spike | Ocho comprobaciones superadas, ORS, MITECO, REE y OpenStreetMap, sin omisiones |
| Compilación TypeScript y Vite | Correcta |
| Dependencias | Sin vulnerabilidades conocidas según npm audit en esta revisión |
| Memoria | 43 páginas compiladas y revisadas visualmente |
| Documentos y catálogo | 26 historias, 52 escenarios con sus cinco campos completos y diez pantallas de Figma |

Los archivos de esta carpeta conservan las salidas de las ejecuciones. Las 52 pruebas seleccionadas están automatizadas. Las variantes adicionales de las tablas siguen siendo análisis y no se cuentan como pruebas superadas. El registro metodo-atdd.md explica el alcance de la evidencia del proceso.

## Cuestiones que debe cerrar el equipo

El profesorado debe revisar las dos separaciones de historias y las decisiones de dominio, como los límites de los campos y la interpretación de los datos que se recuperan tras cerrar. Esta revisión no acredita su aprobación.

El repositorio es privado. El equipo debe comprobar que el profesor de prácticas tiene acceso antes de presentar el PDF. No se han cambiado sus permisos ni se han añadido colaboradores.

La planificación de iteraciones, la estimación de horas, el reparto de historias y la justificación detallada de patrones corresponden a la siguiente entrega. El desarrollo posterior tendrá que seguir conservando pruebas del proceso ATDD y la revisión de ramas que indica la metodología. Un spike funcional no sustituye ese trabajo.

## Integración de las aportaciones del equipo

Se conservan la estructura de siete apartados, las reglas de dominio, las tablas de análisis de escenarios y los diez diseños de Figma del commit 601182d. Se aplican las correcciones de redacción y de aceptación, y se mantiene una explicación general del uso de IA. Se elimina el apartado de ejemplos de la revisión.

Se corrigen tres diferencias entre las versiones. Los cálculos seleccionados usan las medidas devueltas por el servicio real, las cifras fijas de los mockups se presentan como ejemplos aritméticos y la escritura interrumpida antes de confirmar ya cuenta con una comprobación local. La tabla distingue las variantes analizadas de las 52 pruebas seleccionadas.

La interfaz del spike se adapta manualmente a las capturas de los diez diseños. Se añade validación del vehículo utilizado, se guarda un resultado calculado mediante un identificador propio de la cuenta y se conserva el último trayecto cuando un cálculo falla. Se comprueban también los valores predeterminados y su sustitución al planificar.

## Alcance del spike tecnológico

El objetivo básico consiste en probar el uso de las tecnologías y comprobar las respuestas de las APIs. Se añade un comando específico con ocho consultas comprobadas por separado. La memoria centra el apartado del spike en esas operaciones. La implementación y las pruebas de aceptación disponibles se mantienen como trabajo adicional, sin presentarlas como requisito de la iteración 0.

Las APIs coinciden con las del proyecto anterior. Se revisan las llamadas de ORS para búsqueda, búsqueda inversa y rutas en tres modos, los precios de MITECO y REE y una imagen de OpenStreetMap. Las ocho comprobaciones pasan. La guía de uso está en 02_Spike/SPIKE_APIS.md y la salida en spike-apis.txt.

## Consulta de precios y vehículo opcional

Se permite consultar y guardar una ruta en coche sin registrar ni seleccionar vehículo. El coste queda como no disponible. Se muestran los precios de gasolina, diésel y electricidad de forma independiente y el vehículo se utiliza solo para aportar el tipo y el consumo. El resultado muestra el precio aplicado. La selección explícita sin vehículo también prevalece sobre un vehículo predeterminado, sin borrarlo de las preferencias.

El commit 688b43b conserva cuatro pruebas nuevas antes de la implementación, con sus fallos. Después pasan esas cuatro y los recorridos de navegador de precios y ruta sin vehículo, tanto en escritorio como en móvil. Los fallos de precios no impiden consultar el trayecto.
