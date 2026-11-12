# Seguimiento de la Entrega 2

Un solo miembro del equipo entrega el [PDF definitivo de 17 páginas](../../output/pdf/Entrega2_Via.pdf) antes del **viernes 13 de noviembre a las 23:59**.

## 1. Planificación inicial · páginas 3–6

- [x] Recuperar las 26 historias de la [Entrega 1](../entrega1/04-historias-escenarios-aceptacion.md).
- [x] Incluir los puntos acordados por el equipo mediante Planning Poker y justificar la estimación de cada historia. El total es de 154 SP.
- [x] Repartir las historias en cinco iteraciones de 28 a 34 SP y justificar el reparto.
- [x] Indicar fechas de inicio y fin y explicar las dependencias entre historias. La HU-14 admite puntos temporales desde la IT1 y la HU-09 permite guardarlos más adelante.
- [ ] Confirmar la disponibilidad y detallar el responsable de cada historia en las iteraciones 4 y 5, que figuran con responsabilidad compartida.
- [ ] Confirmar con el profesorado la regla RD-34 sobre las copias históricas. La planificación aplica el criterio de conservarlas.

## 2. Pruebas de aceptación y SUT de la IT1 · páginas 7–8

- [x] Elegir HU-01, HU-02, HU-05, HU-07 y HU-14 y recuperar sus escenarios de la Entrega 1.
- [x] Programar los 25 escenarios originales con datos concretos y añadir la variante de HU-14 entre dos puntos temporales. Los casos de caída usan fallos controlados, según se explica en el PDF.
- [x] Preparar las clases, métodos y dependencias mínimos del SUT. Las 26 pruebas se ejecutaron y quedaron en rojo por falta de implementación.
- [x] Guardar la [evidencia de ejecución](evidencias/pruebas-it01-rojo.txt) e incluir en el PDF dos ejemplos de código y enlaces a las pruebas completas.

Para repetir la ejecución desde la raíz del repositorio en PowerShell:

```powershell
$pruebas = Get-ChildItem tests -Filter '*.aceptacion.test.ts' | Select-Object -ExpandProperty FullName
node --experimental-transform-types --env-file-if-exists=entrega1/02_Spike/.env --test $pruebas
```

## 3. UML del SUT · página 9

- [x] Identificar las clases y representar los métodos y dependencias del SUT.
- [x] Actualizar la descripción de la firma de `calcularRuta` para admitir lugares guardados o coordenadas temporales.
- [x] Incluir el [UML del SUT](uml-sut-it01.md) en el PDF.

## 4. Justificación del patrón de interfaz · página 15

- [x] Elegir MVVM para React.
- [x] Explicar las responsabilidades del modelo, la vista y el ViewModel.
- [x] Mostrar dónde se aplica con el recorrido de «Calcular ruta».
- [x] Explicar sus ventajas y los límites del prototipo.
- [x] Compararlo con MVC y justificar la elección.
- [x] Indicar que MVVM se aplicará de forma uniforme en la interfaz de Vía. Observer complementa el patrón al avisar de los cambios de estado.

## 5. Patrones de diseño · páginas 10–14

- [x] Seleccionar cinco patrones aparte del de interfaz. Son Adapter, Strategy, Facade, Observer y Decorator.
- [x] Explicar el problema que resuelve cada patrón y cómo colaboran las clases de Vía.
- [x] Incluir un UML genérico y otro aplicado por patrón.
- [x] Justificar su encaje con las tecnologías y las historias y valorar ventajas, inconvenientes y alternativas.

## 6. Repositorio y versión de entrega

- [x] Elegir el [repositorio de Vía](https://github.com/Kiliansito/ei1039-ei1048-movilidad).
- [x] Publicar las pruebas, el SUT mínimo, la evidencia y el PDF actualizado en la rama [h-14](https://github.com/Kiliansito/ei1039-ei1048-movilidad/tree/h-14).
- [x] Incluir instrucciones para repetir las pruebas. La ejecución guardada identifica el commit de código `690589d`.
- [x] Verificar que el repositorio es público. La invitación individual al profesorado no aplica.
- [x] Incluir la URL del repositorio, la rama de la entrega y la evidencia de ejecución en la página 7.

## 7. Aspectos adicionales no funcionales · página 16

- [x] Elegir los aspectos de la sección 3.3. Se incluyen integración continua, documentación del repositorio e identidad visual.
- [x] Indicar las herramientas y cómo se comprobará cada aspecto.

## 8. Uso de IA generativa · página 17

- [x] Incluir la declaración GAIDeT, la herramienta declarada y las tareas en las que intervino.
- [x] Analizar los beneficios, las limitaciones y las correcciones realizadas.
- [ ] Recoger una recomendación de uso para el resto del proyecto, como propone la lista de Isma.

## 9. Revisión y entrega

- [x] Reunir y numerar las 17 páginas. La portada identifica al equipo y el índice enlaza con los siete apartados.
- [x] Revisar el recuento de pruebas y la firma de HU-14 en el informe. La descripción de la IT1 ya coincide con la planificación incluida.
- [x] Revisar la legibilidad de las 17 páginas, los destinos del índice y los enlaces del PDF.
- [ ] Subir un único PDF y confirmar la entrega. El 12 de noviembre, el Aula muestra el estado del grupo como nuevo.

Fuentes del Aula Virtual. [Actividad de Entrega 2](https://aulavirtual.uji.es/mod/assign/view.php?id=5928442) · [Presentación](https://aulavirtual.uji.es/mod/resource/view.php?id=5928441) · [Rúbrica](https://aulavirtual.uji.es/mod/resource/view.php?id=5928434).
