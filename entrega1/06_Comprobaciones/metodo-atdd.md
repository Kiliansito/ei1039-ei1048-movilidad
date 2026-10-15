# Proceso de pruebas de esta revisión

El código recibido ya implementaba parte del comportamiento y tenía 34 comprobaciones locales. No se dispone de pruebas del orden de desarrollo de todo ese código. Por tanto, esta revisión no afirma que el spike original se construyera por completo mediante ATDD.

## Pruebas antes de la implementación

Se escriben 52 pruebas de aceptación a partir de los escenarios seleccionados de la memoria. La primera ejecución utiliza SQLite en disco y los proveedores reales necesarios. Pasa 37 pruebas y falla 15. Las pruebas positivas detectan que falta una entrada de consulta por sesión y que el guardado de resultados está ligado a la capa HTTP. Se conservan las salidas en esta carpeta.

También se preparan 14 pruebas de integración para las historias que usan búsqueda, rutas y cálculos. Sustituyen los proveedores externos por dobles con respuestas conocidas. La primera ejecución falla en el guardado de una ruta calculada.

Antes de adaptar la interfaz se escribe el recorrido de registro y acceso de la pantalla M01. Su ejecución falla porque la pantalla recibida no presenta ambos formularios como el diseño propuesto.

## Alcance de la comprobación

Las pruebas de aceptación actúan sobre la lógica de negocio. Las de navegador comprueban el diseño y los recorridos de uso. Son comprobaciones complementarias y no se cuentan como si fueran el mismo tipo de prueba.

Los cambios siguientes deben superar las pruebas nuevas y conservar las anteriores. El historial mantiene el commit de definición de pruebas antes del commit de implementación. Esto acredita el proceso de esta revisión, no el desarrollo previo del proyecto.

## Resultado final

El commit 831f1d1 conserva las pruebas y sus ejecuciones con fallos antes de los cambios de implementación. Se han corregido la consulta de estado por sesión, el guardado desde la lógica de negocio y los problemas detectados en los recorridos de uso. Después se han ampliado las pruebas de integración con cuatro casos de preferencias.

La ejecución final supera las 52 pruebas de aceptación, las 18 de integración, las 36 locales y los 24 recorridos de navegador. No se omite ninguna de las 52 seleccionadas. Las salidas están en todas-las-pruebas.txt, integracion.txt, pruebas-locales.txt y navegador.txt. Las capturas muestran las diez pantallas en escritorio y móvil.

El archivo aceptacion.feature es el catálogo de lectura. Las pruebas ejecutables están en tests/acceptance.test.ts y tests/support/scenarios.ts. El registro comprueba que los identificadores coinciden y que no falta ninguno. Las otras variantes de las tablas de análisis no se presentan como pruebas ejecutadas.
