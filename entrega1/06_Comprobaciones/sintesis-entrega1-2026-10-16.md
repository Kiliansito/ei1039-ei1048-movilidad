# Síntesis de la Entrega 1, 16 de octubre de 2026

Se conservan las 26 historias y sus 52 pruebas seleccionadas, una válida y otra inválida por historia, según la metodología docente. Las tablas pasan de 128 filas de escenarios a 78, con una variante relevante por historia además de las dos seleccionadas. Se mantienen las condiciones de entrada, los resultados y el análisis breve de casos extremos.

Las 108 reglas numeradas se agrupan en diez reglas comunes y una tabla de validaciones. Se elimina su repetición en cada historia y el apartado adicional de límites y variantes, que repetía el análisis. Los límites propuestos y las decisiones que requieren validación del profesorado conservan ese carácter.

Se sustituyen los inválidos centrados en datos de otras cuentas por operaciones sobre elementos ya eliminados. HU-18 comprueba un destino sin seleccionar, HU-19 un nombre vacío y HU-24 un fallo al guardar la preferencia. HU-03 comprueba una sesión ya cerrada. HU-14 permite tanto puntos elegidos directamente como lugares guardados. Se actualizan el texto de los mockups, el catálogo Gherkin y las nueve pruebas ejecutables afectadas. Se conservan los diez diseños y se corrige también el mensaje de error de M09 en Figma y en su captura. La aplicación mantiene sus comprobaciones de acceso.

## Validación de esta revisión

- TypeScript de aplicación y pruebas, correcto.
- 18 pruebas de integración superadas con proveedores controlados.
- Nueve escenarios modificados superados con SQLite en disco y proveedores controlados. Esta ejecución comprueba la coherencia de los cambios y no acredita aceptación con APIs reales.
- La aceptación real no se ha repetido porque esta copia no dispone de ORS_API_KEY. Las salidas de revisiones anteriores se conservan como evidencia histórica y no se atribuyen a esta versión.
- La compilación y la comprobación de documentos generados se realizan con el workflow `Compilar memoria LaTeX`. La instalación local de MiKTeX no dispone del idioma español de Babel.

El PDF compilado se revisa visualmente antes de incorporar la copia final al repositorio. Las pruebas locales, de integración, compilación de código y navegador también se ejecutan mediante el workflow existente `Pruebas del spike`.
