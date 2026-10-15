# Vía · Entrega 1

- Ruben Andres Szasz Szasz
- Kilian Escudero Vizcaino
- Ismael Ferrando Paulo

EI1039 y EI1048 · Universitat Jaume I · Curso 2026-2027

Repositorio: [Kiliansito/ei1039-ei1048-movilidad](https://github.com/Kiliansito/ei1039-ei1048-movilidad).

## Contenido

- **01_Memoria**: informe en PDF compilado con LaTeX y fuente `.tex` editable.
- **02_Spike**: código de la iteración 0 e instrucciones de ejecución.
- **03_Mockups**: nueve pantallas en SVG editable y PNG; `index.html` permite verlas juntas.
- **04_Pruebas**: escenarios Given-When-Then y matriz de trazabilidad.
- **05_Material_docente**: cuatro PDF originales de clase, con nombres descriptivos.
- **06_Comprobaciones**: resultados de las pruebas locales, del navegador y de la compilación.

## Ejecutar el spike

Requiere Node.js 24.16 o superior. Desde esta carpeta:

```sh
npm ci --prefix 02_Spike
npm run spike
```

Abrir http://localhost:4173. Para buscar topónimos y calcular rutas, configurar una clave de OpenRouteService en `.env`. El README del código detalla la instalación, las pruebas y los servicios utilizados.

`04_Pruebas/aceptacion.feature` es el catálogo de especificaciones del proyecto. Las comprobaciones ejecutables del spike se lanzan con `npm test` y `npm run test:e2e` desde `02_Spike`.

## Compilar la memoria

Desde `01_Memoria`, con una distribución LaTeX:

```sh
pdflatex -interaction=nonstopmode -halt-on-error Informe_Entrega1_Via.tex
pdflatex -interaction=nonstopmode -halt-on-error Informe_Entrega1_Via.tex
```

También se puede compilar con Tectonic:

```sh
tectonic Informe_Entrega1_Via.tex
```

Los esquemas se cargan desde `03_Mockups`, por lo que ambas carpetas deben conservar su posición.
