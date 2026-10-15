# Proyecto conjunto EI1039 / EI1048

Repositorio privado de trabajo del equipo. Los apartados de la Entrega 1 están preparados para incorporar progresivamente el contenido revisado en Google Docs.

## Nota sobre la trazabilidad del trabajo

Debido a problemas de acceso al repositorio de GitHub, algunas aportaciones se incorporaron después de haber sido elaboradas y revisadas fuera del repositorio. Por ello, las fechas de los commits indican cuándo se registraron los cambios en GitHub y no necesariamente cuándo se realizó el trabajo correspondiente.

## Documento fuente

El texto editable vive en `docs/entrega1/`. Cada archivo corresponde a un apartado; se pueden revisar y atribuir sus cambios por separado. El ODT se **genera** a partir de esos Markdown. No se edita el ODT como fuente.

| Archivo | Apartado |
| --- | --- |
| `00-portada.md` | Portada |
| `01-introduccion.md` | 1. Introducción |
| `02-requisitos.md` | 2. Requisitos |
| `03-reglas-metodo-prueba.md` | 3. Reglas y método de prueba |
| `04-historias-escenarios-aceptacion.md` | 4. Historias, escenarios y aceptación |
| `05-mockups.md` | 5. Del escenario a la pantalla |
| `06-spike.md` | 6. Iteración 0 (spike) |
| `07-ia.md` | 7. Uso de IA generativa |

Los puntos 1–5 siguen los títulos y el orden de la segunda pestaña del documento de Drive. Se reservan a continuación los apartados de spike e IA. La portada se mantiene fuera de la numeración.

Para la primera aportación de Ismael, los puntos 1, 2 y 3 se incorporan a `01-introduccion.md`, `02-requisitos.md` y `03-reglas-metodo-prueba.md`, respectivamente.

## Cómo colaborar

1. Cada integrante usa **su propia cuenta** y crea una rama desde la versión reciente de `main`, por ejemplo `kilian/entrega1` o `<usuario>/historias-r2`.
2. Realiza commits pequeños con mensajes que expliquen el cambio.
3. Abre una pull request hacia `main`. Otro integrante revisa el texto y su relación con los requisitos docentes antes de incorporarlo.
4. Los apartados aceptados entran en `main`; las propuestas sin revisar permanecen en la rama o en la discusión de la pull request.

Cuando comience la implementación se seguirá el flujo de la guía: `main` estable, ramas `it-nn` por iteración y ramas `h-xx` por historia, con revisión mediante pull requests. Los nombres concretos pueden adaptarse sin perder la trazabilidad.

## Generar el ODT

Cada pull request y cada cambio en `main` que afecte al documento ejecuta la acción **Generar Entrega 1**. El ODT se descarga desde los artefactos de esa ejecución; no se guarda como archivo fuente del repositorio.

Si tienes Pandoc instalado, puedes generarlo localmente desde la raíz del repositorio:

```sh
pandoc docs/entrega1/00-portada.md docs/entrega1/01-introduccion.md docs/entrega1/02-requisitos.md docs/entrega1/03-reglas-metodo-prueba.md docs/entrega1/04-historias-escenarios-aceptacion.md docs/entrega1/05-mockups.md docs/entrega1/06-spike.md docs/entrega1/07-ia.md --standalone -o Entrega1.odt
```

Los PDF docentes permanecen en el Aula Virtual y en las carpetas personales de consulta. No se incluyen aquí. El repositorio del miniproyecto de spike se enlazará cuando el equipo lo haya preparado y validado.
