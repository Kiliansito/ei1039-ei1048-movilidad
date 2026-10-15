# Proceso de pruebas de esta revisión

El código recibido ya implementaba parte del comportamiento y tenía 34 comprobaciones locales. No se dispone de pruebas del orden de desarrollo de todo ese código. Por tanto, esta revisión no afirma que el spike original se construyera por completo mediante ATDD.

## Pruebas antes de la implementación

Se escriben 52 pruebas de aceptación a partir de los escenarios seleccionados de la memoria. La primera ejecución utiliza SQLite en disco y los proveedores reales necesarios. Pasa 37 pruebas y falla 15. Las pruebas positivas detectan que falta una entrada de consulta por sesión y que el guardado de resultados está ligado a la capa HTTP. Se conservan las salidas en esta carpeta.

También se preparan 14 pruebas de integración para las historias que usan búsqueda, rutas y cálculos. Sustituyen los proveedores externos por dobles con respuestas conocidas. La primera ejecución falla en el guardado de una ruta calculada.

Antes de adaptar la interfaz se escribe el recorrido de registro y acceso de la pantalla M01. Su ejecución falla porque la pantalla recibida no presenta ambos formularios como el diseño propuesto.

## Alcance de la comprobación

Las pruebas de aceptación actúan sobre la lógica de negocio. Las de navegador comprueban el diseño y los recorridos de uso. Son comprobaciones complementarias y no se cuentan como si fueran el mismo tipo de prueba.

Los cambios siguientes deben superar las pruebas nuevas y conservar las anteriores. El historial mantiene el commit de definición de pruebas antes del commit de implementación. Esto acredita el proceso de esta revisión, no el desarrollo previo del proyecto.
