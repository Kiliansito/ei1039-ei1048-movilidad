# Proyecto conjunto EI1039 / EI1048

Repositorio privado de trabajo del equipo. La Entrega 1 está **vacía y pendiente de revisión**: todavía no se ha aprobado ninguna historia, escenario, pantalla o decisión técnica.

## Documento fuente

El texto editable vive en `docs/entrega1/`. Cada archivo corresponde a un apartado; se pueden revisar y atribuir sus cambios por separado. El ODT se **genera** a partir de esos Markdown. No se edita el ODT como fuente.

| Archivo | Apartado |
| --- | --- |
| `00-portada.md` | Portada |
| `01-requisitos.md` | Requisitos e historias de usuario |
| `02-escenarios.md` | Escenarios y pruebas de aceptación |
| `03-mockups.md` | Propuesta de interfaz |
| `04-spike.md` | Iteración 0 |
| `05-ia.md` | Uso de IA generativa |

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
pandoc docs/entrega1/00-portada.md docs/entrega1/01-requisitos.md docs/entrega1/02-escenarios.md docs/entrega1/03-mockups.md docs/entrega1/04-spike.md docs/entrega1/05-ia.md --standalone -o Entrega1.odt
```

Los PDF docentes permanecen en el Aula Virtual y en las carpetas personales de consulta. No se incluyen aquí. El repositorio del miniproyecto de spike se enlazará cuando el equipo lo haya preparado y validado.
