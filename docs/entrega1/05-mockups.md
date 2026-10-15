# 5. Del escenario a la pantalla

Los mockups proponen la interfaz de Vía a partir de las historias y escenarios del apartado 4. Se han elaborado en Figma y se organizan en diez pantallas, M01–M10, que cubren las 26 historias de usuario.

[Abrir mockups editables en Figma](https://www.figma.com/design/0X0JpvayI4WsF0QyywWWbs)

Las imágenes siguientes muestran la propuesta actual. Los mapas son esquemáticos y los valores de las estimaciones son datos de prueba. Los estados alternativos reunidos en una figura no tienen por qué aparecer simultáneamente en el producto. Los límites y decisiones pendientes de validar mantienen ese carácter.

## M01. Registro e inicio de sesión

Historias relacionadas: HU-01, HU-02.

Permite crear una cuenta o acceder con una cuenta existente.

![M01](../../entrega1/03_Mockups/figma/M01.png)

*Figura 5.1. Registro e inicio de sesión.*

Escenario válido: El registro crea una sola cuenta; el acceso recupera únicamente los datos de su titular.

Escenario inválido: Correo duplicado o credenciales incorrectas: se informa del error sin crear una cuenta o sesión adicional.

[Abrir M01 en Figma](https://www.figma.com/design/0X0JpvayI4WsF0QyywWWbs?node-id=4-344)

## M02. Mi cuenta y cierre de sesión

Historias relacionadas: HU-03, HU-04.

Reúne los datos de la cuenta, el cierre de sesión y la confirmación de su eliminación.

![M02](../../entrega1/03_Mockups/figma/M02.png)

*Figura 5.2. Mi cuenta y cierre de sesión.*

Escenario válido: Cerrar sesión revoca el acceso; eliminar la cuenta con la contraseña correcta borra sus datos asociados.

Escenario inválido: Un token inexistente no permite acceder; una contraseña incorrecta impide eliminar la cuenta.

[Abrir M02 en Figma](https://www.figma.com/design/0X0JpvayI4WsF0QyywWWbs?node-id=4-437)

## M03. Añadir un lugar

Historias relacionadas: HU-05, HU-06, HU-09.

Ofrece alta por coordenadas, búsqueda de topónimo con confirmación y selección de un punto en el mapa.

![M03](../../entrega1/03_Mockups/figma/M03.png)

*Figura 5.3. Añadir un lugar.*

Escenario válido: Se guarda el lugar con las coordenadas introducidas, el candidato confirmado o el punto elegido.

Escenario inválido: Latitud 91, topónimo vacío o ausencia de punto seleccionado: no se crea ningún lugar.

[Abrir M03 en Figma](https://www.figma.com/design/0X0JpvayI4WsF0QyywWWbs?node-id=4-514)

## M04. Mis lugares

Historias relacionadas: HU-07, HU-08, HU-22.

Muestra los lugares propios, su selección para rutas, los favoritos y la confirmación de borrado.

![M04](../../entrega1/03_Mockups/figma/M04.png)

*Figura 5.4. Mis lugares.*

Escenario válido: Ana consulta Centro y UJI; borrar Centro conserva UJI. Los favoritos aparecen primero.

Escenario inválido: Sin sesión no se muestran lugares; los elementos ajenos no se pueden eliminar ni marcar como favoritos.

[Abrir M04 en Figma](https://www.figma.com/design/0X0JpvayI4WsF0QyywWWbs?node-id=4-620)

## M05. Mis vehículos

Historias relacionadas: HU-10, HU-11, HU-12, HU-13, HU-22.

Incluye consulta, alta, edición, favoritos y eliminación de vehículos, con las unidades del consumo.

![M05](../../entrega1/03_Mockups/figma/M05.png)

*Figura 5.5. Mis vehículos.*

Escenario válido: Se registra Compacto; editar su consumo conserva el identificador. Borrarlo limpia la referencia predeterminada.

Escenario inválido: Consumo inválido, sesión caducada o vehículo ajeno: la operación se rechaza y se conserva el estado anterior.

[Abrir M05 en Figma](https://www.figma.com/design/0X0JpvayI4WsF0QyywWWbs?node-id=5-179)

## M06. Planificar un trayecto

Historias relacionadas: HU-14, HU-18.

Permite elegir origen y destino guardados, modo, vehículo y criterio, y visualizar el trayecto.

![M06](../../entrega1/03_Mockups/figma/M06.png)

*Figura 5.6. Planificar un trayecto.*

Escenario válido: Centro → UJI devuelve geometría y métricas positivas; el criterio económico compara las alternativas recibidas.

Escenario inválido: Extremos coincidentes o criterio no admitido: se rechaza la solicitud. Los fallos del proveedor permiten reintentar.

[Abrir M06 en Figma](https://www.figma.com/design/0X0JpvayI4WsF0QyywWWbs?node-id=5-325)

## M07. Resultado y estimaciones

Historias relacionadas: HU-15, HU-16, HU-17, HU-19.

Reúne estados alternativos de coste de combustible, electricidad y calorías, y la acción de guardar una ruta.

![M07](../../entrega1/03_Mockups/figma/M07.png)

*Figura 5.7. Resultado y estimaciones.*

Escenario válido: Los ejemplos de aceptación producen 9.60 €, 3.00 € y 128.625 kcal antes de redondear; un resultado propio puede guardarse.

Escenario inválido: Precio o peso inválido conserva el valor anterior; un resultado inventado no se guarda. Cada estimación corresponde a un modo distinto.

[Abrir M07 en Figma](https://www.figma.com/design/0X0JpvayI4WsF0QyywWWbs?node-id=5-445)

## M08. Rutas guardadas

Historias relacionadas: HU-20, HU-21, HU-22.

Permite consultar instantáneas históricas, gestionar favoritos y confirmar la eliminación de una ruta.

![M08](../../entrega1/03_Mockups/figma/M08.png)

*Figura 5.8. Rutas guardadas.*

Escenario válido: Consultar conserva geometría y métricas históricas; borrar Camino a clase mantiene Paseo, lugares y vehículos.

Escenario inválido: Sin sesión no se revela el historial; una ruta ajena no se elimina ni se cambia de favorito.

[Abrir M08 en Figma](https://www.figma.com/design/0X0JpvayI4WsF0QyywWWbs?node-id=5-517)

## M09. Preferencias

Historias relacionadas: HU-23, HU-24; configuración de HU-15, HU-16 y HU-17.

Presenta modo, vehículo y criterio predeterminados, peso y precios manuales con sus unidades.

![M09](../../entrega1/03_Mockups/figma/M09.png)

*Figura 5.9. Preferencias.*

Escenario válido: Una nueva planificación usa coche, Compacto y más corta, permitiendo cambios puntuales.

Escenario inválido: Un vehículo ajeno o un criterio desconocido se rechaza sin sustituir la preferencia guardada; se validan también precios y peso.

[Abrir M09 en Figma](https://www.figma.com/design/0X0JpvayI4WsF0QyywWWbs?node-id=5-627)

## M10. Volver a la aplicación

Historias relacionadas: HU-25, HU-26.

Representa recuperación tras cierre normal o interrupción, y el fallo al abrir el almacenamiento.

![M10](../../entrega1/03_Mockups/figma/M10.png)

*Figura 5.10. Volver a la aplicación.*

Escenario válido: Se recuperan contenidos confirmados, identificadores, favoritos, tema y último trayecto.

Escenario inválido: Un fallo de carga no se presenta como colección vacía; una transacción sin COMMIT no debe aparecer como alta confirmada.

[Abrir M10 en Figma](https://www.figma.com/design/0X0JpvayI4WsF0QyywWWbs?node-id=5-743)

La relación con las historias permite revisar cada pantalla junto con sus pruebas de aceptación. Los mockups describen el comportamiento previsto de la interfaz; su representación no acredita que las funcionalidades o las pruebas ya estén implementadas o superadas.
