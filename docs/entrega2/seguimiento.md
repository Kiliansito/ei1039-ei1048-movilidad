# Seguimiento de la Entrega 2

Lista de Isma contrastada con la actividad, la presentación y la rúbrica. Un solo miembro del equipo sube el PDF antes del **viernes 13 de noviembre a las 23:59**.

## 1. Planificación inicial

- [x] Recuperar las 26 historias de la [Entrega 1](../entrega1/04-historias-escenarios-aceptacion.md).
- [ ] Confirmar con el equipo las estimaciones de cada HU mediante Planning Poker y justificar los puntos.
- [ ] Validar el reparto en 4–6 iteraciones de carga similar. La IT1 propuesta contiene HU-01, HU-02, HU-05, HU-07 y HU-14.
- [ ] Fijar las fechas de inicio y fin y asignar un responsable a cada HU.
- [ ] Revisar que ninguna iteración necesite una funcionalidad prevista para más adelante.

## 2. Pruebas de aceptación y SUT de la IT1

- [x] Programar una prueba válida y una inválida por cada HU de la IT1, con datos concretos y sin componentes de interfaz.
- [x] Definir las clases, los métodos y las dependencias mínimas. Se verificó que las diez pruebas fallan por falta de implementación.
- [ ] Incluir ejemplos de código en el PDF y enlazar el resto de las pruebas en GitHub.
- [ ] Para aspirar al nivel más alto de la rúbrica, automatizar los 15 escenarios adicionales identificados en la Entrega 1.

Para repetir la ejecución desde la raíz del repositorio con PowerShell:

```powershell
$pruebas = Get-ChildItem tests -Filter '*.aceptacion.test.ts' | Select-Object -ExpandProperty FullName
node --experimental-transform-types --env-file-if-exists=entrega1/02_Spike/.env --test $pruebas
```

## 3. UML del SUT

- [x] Preparar el [diagrama de clases](uml-sut-it01.md) con los métodos y las dependencias del código actual.
- [ ] Incorporar el diagrama al informe como figura legible o enlazarlo desde el PDF.

## 4. Patrón de interfaz

- [ ] Elegir y justificar el patrón de UI para React. Explicar sus responsabilidades, dónde se aplicará y los motivos para preferirlo frente a otra opción.

## 5. Patrones de diseño

- [ ] Seleccionar al menos cinco patrones, aparte del de interfaz.
- [ ] Por cada patrón, explicar qué problema resuelve en Vía y preparar un UML genérico y otro aplicado al proyecto.
- [ ] Justificar la elección y valorar ventajas, inconvenientes y alternativas.

## 6. Repositorio y versión de entrega

- [x] Subir las diez pruebas y el SUT mínimo al [repositorio del proyecto](https://github.com/Kiliansito/ei1039-ei1048-movilidad). La rama [h-14](https://github.com/Kiliansito/ei1039-ei1048-movilidad/tree/h-14) reúne las cinco HU y el UML.
- [ ] Identificar el último commit correspondiente a la versión que se entregue e incluir su enlace y la URL del repositorio en el PDF.
- [ ] Si el repositorio es privado, comprobar el acceso del profesorado según la actividad del Aula.

## 7. Aspectos adicionales no funcionales

- [ ] Revisar las opciones del documento de requisitos y declarar cuáles se harán, si se elige alguna. Indicar cómo se comprobarán y con qué herramientas. Si se propone otra, acordarla con el profesor de prácticas.

## 8. Uso de IA generativa

- [ ] Generar la declaración inicial con [GAIDeT](https://aulavirtual.uji.es/mod/url/view.php?id=6000422).
- [ ] Indicar las herramientas realmente utilizadas y las tareas en las que intervinieron. Documentar interacciones reales y analizar los beneficios, los errores y las limitaciones.

## 9. Informe y entrega

- [ ] Revisar que el PDF refleje las decisiones del equipo y el código de la versión enlazada. Comprobar figuras, ejemplos de pruebas y enlaces.
- [ ] Subir un único PDF y comprobar el estado de la entrega.

Fuentes del Aula Virtual: [actividad de Entrega 2](https://aulavirtual.uji.es/mod/assign/view.php?id=5928442), [presentación](https://aulavirtual.uji.es/mod/resource/view.php?id=5928441) y [rúbrica](https://aulavirtual.uji.es/mod/resource/view.php?id=5928434).
