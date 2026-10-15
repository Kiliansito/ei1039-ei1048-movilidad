# Vía · EI1039 / EI1048

Aplicación de movilidad del proyecto conjunto de la Universitat Jaume I.

- Ruben Andres Szasz Szasz
- Kilian Escudero Vizcaino
- Ismael Ferrando Paulo

## Entrega 1

La entrega está organizada en [`entrega1/`](entrega1/README.md).

- [Memoria en PDF](entrega1/01_Memoria/Informe_Entrega1_Via.pdf) y [fuente LaTeX editable](entrega1/01_Memoria/Informe_Entrega1_Via.tex).
- [Spike tecnológico](entrega1/02_Spike/README.md), con nueve pantallas y las integraciones del proyecto.
- [Mockups editables](entrega1/03_Mockups/), [escenarios de aceptación](entrega1/04_Pruebas/aceptacion.feature) y [trazabilidad](entrega1/04_Pruebas/trazabilidad.md).
- [Material docente](entrega1/05_Material_docente/) y [resultados de comprobación](entrega1/06_Comprobaciones/).

## Ejecutar

Requiere Node.js 24.16 o superior. Desde la raíz.

```sh
npm ci --prefix entrega1/02_Spike
npm run spike
```

Abrir http://localhost:4173. La búsqueda de topónimos y el cálculo de rutas requieren una clave de OpenRouteService. La configuración se explica en el [README del spike](entrega1/02_Spike/README.md).

## Compilar la memoria

```sh
cd entrega1/01_Memoria
pdflatex -interaction=nonstopmode -halt-on-error Informe_Entrega1_Via.tex
pdflatex -interaction=nonstopmode -halt-on-error Informe_Entrega1_Via.tex
```

También se puede usar `tectonic Informe_Entrega1_Via.tex`. GitHub Actions compila el PDF cuando cambian las fuentes o los mockups.

## Documentación

Los [apartados de la memoria](docs/entrega1/00-portada.md) también se pueden leer en Markdown. La fuente de referencia es el archivo LaTeX con sus cinco apartados incluidos. Ejecutar `python3 scripts/exportar_documentacion.py` para actualizar las copias después de editarlo.

La [revisión completa de la Entrega 1](entrega1/06_Comprobaciones/revision-entrega1.md) recoge las correcciones, las comprobaciones y las cuestiones que debe cerrar el equipo.

Los apartados 1 a 5 incorporan la aportación del documento de Drive y los [diez mockups de Figma](https://www.figma.com/design/0X0JpvayI4WsF0QyywWWbs), revisados junto con los escenarios. Las fuentes están en `entrega1/01_Memoria/apartados/` desde la raíz del repositorio.
