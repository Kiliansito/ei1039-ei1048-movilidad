# 4. Historias, escenarios y aceptación

## HU-01. Registrar una cuenta

Requisito: R1

Historia: Como persona no registrada quiero crear una cuenta para utilizar los servicios de movilidad.

### Reglas de dominio aplicables

- RD-01: El correo electrónico debe estar normalizado.

- RD-02: El correo electrónico debe ser único.

- RD-03: El correo electrónico puede tener como máximo 254 caracteres.

- RD-04: El nombre debe tener entre 1 y 70 caracteres.

- RD-05: La contraseña debe tener entre 10 y 128 caracteres.

- RD-06: Una operación inválida no debe modificar el estado confirmado.

### Análisis de escenarios

| Escenario | Servidor disponible | Nombre válido | Correo válido | Contraseña válida | Correo no existente | Alta |
| --- | --- | --- | --- | --- | --- | --- |
| E-01-V | Sí | Sí | Sí | Sí | Sí | Sí |
| E-01-I1 | Sí | Sí | Sí | Sí | No | No |
| E-01-I2 | Sí | Sí | Sí | No | Sí | No |
| E-01-I3 | Sí | Sí | No | Sí | Sí | No |
| E-01-I4 | Sí | No | Sí | Sí | Sí | No |
| E-01-I5 | No | -- | -- | -- | -- | No |

Se seleccionan E-01-V como escenario válido y E-01-I1 como escenario inválido para las pruebas de aceptación.

### E-01-V — Escenario válido · Prueba PA-01-V

Justificación: acredita el alta de una cuenta utilizando datos que cumplen las reglas de dominio.

Given: hay conexión con el servidor, el almacenamiento está disponible y no existe la cuenta con correo ana@example.com.

When: una persona no registrada intenta crear una cuenta con nombre Ana, correo ana@example.com y contraseña RutaSegura2026.

Then: se crea una única cuenta para Ana, se devuelve su identificador y la contraseña no aparece en la respuesta. El correo ana@example.com queda registrado y no se modifica ninguna otra cuenta.

### E-01-I1 — Escenario inválido · Prueba PA-01-I

Justificación: comprueba que no se permite crear una segunda cuenta con un correo ya registrado.

Given: hay conexión con el servidor y ya existe una cuenta con correo ana@example.com.

When: una persona intenta crear una nueva cuenta con nombre Ana2, correo ana@example.com y contraseña OtraClave2026.

Then: se rechaza la operación por correo duplicado y el estado de las cuentas no se modifica.

## HU-02. Iniciar sesión

Requisito: R1

Historia: Como persona registrada quiero iniciar sesión para acceder a mis datos.

### Reglas de dominio aplicables

- RD-07: El acceso requiere una cuenta existente y credenciales correctas.

- RD-08: Una sesión solo permite recuperar los datos de su titular.

- RD-09: El correo inexistente y la contraseña incorrecta deben producir el mismo mensaje de error.

- RD-10: Los campos vacíos no permiten iniciar sesión.

- RD-06: Una operación inválida no debe modificar el estado confirmado.

### Análisis de escenarios

| Escenario | Servidor disponible | Cuenta existente | Contraseña correcta | Campos completos | Acceso |
| --- | --- | --- | --- | --- | --- |
| E-02-V | Sí | Sí | Sí | Sí | Sí |
| E-02-I1 | Sí | Sí | No | Sí | No |
| E-02-I2 | Sí | No | -- | Sí | No |
| E-02-I3 | Sí | -- | -- | No | No |
| E-02-I4 | No | -- | -- | -- | No |

Se seleccionan E-02-V como escenario válido y E-02-I1 como escenario inválido para las pruebas de aceptación.

### E-02-V — Escenario válido · Prueba PA-02-V

Justificación: comprueba la correspondencia entre identidad y sesión.

Given: existe Ana con ana@example.com y RutaSegura2026.

When: inicia sesión con esas credenciales.

Then: se crea una sesión vinculada a Ana y se recuperan únicamente sus datos.

### E-02-I1 — Escenario inválido · Prueba PA-02-I

Justificación: una contraseña errónea no debe conceder acceso ni revelar datos.

Given: existe Ana con la contraseña RutaSegura2026.

When: intenta acceder con OtraClave2026.

Then: se informa de credenciales incorrectas y no se crea una sesión.

## HU-03. Cerrar sesión

Requisito: R1

Historia: Como usuario autenticado quiero cerrar mi sesión para impedir el acceso posterior desde ella.

### Reglas de dominio aplicables

- RD-11: Cerrar una sesión debe revocar su capacidad de autenticar peticiones posteriores.

- RD-12: El cierre de sesión conserva los contenidos del usuario.

- RD-13: Cerrar un token inexistente o volver a cerrar uno revocado no concede acceso ni altera otras sesiones.

- RD-14: La revocación debe comprobarse mediante una petición posterior, además del cambio de pantalla.

### Análisis de escenarios

| Escenario | Servidor disponible | Sesión de partida | Cierre solicitado | Acceso posterior | Otras sesiones intactas |
| --- | --- | --- | --- | --- | --- |
| E-03-V | Sí | Activa | Sí | No | Sí |
| E-03-I1 | Sí | Inexistente | Sí | No | Sí |
| E-03-I2 | Sí | Revocada | Sí | No | Sí |
| E-03-I3 | No | Activa | Sí | No verificable | Sí |

Se seleccionan E-03-V como escenario válido y E-03-I1 como escenario inválido para las pruebas de aceptación.

### E-03-V — Escenario válido · Prueba PA-03-V

Justificación: demuestra revocación efectiva, además del cambio de pantalla.

Given: Ana tiene una sesión activa S1.

When: cierra S1 y vuelve a solicitar sus datos con ese token.

Then: S1 deja de autenticar y se solicita iniciar sesión; los contenidos de Ana se conservan.

### E-03-I1 — Escenario inválido · Prueba PA-03-I

Justificación: la credencial de partida no es válida; el cierre es idempotente y no autentica.

Given: el token S0 no corresponde a ninguna sesión.

When: se solicita cerrar S0 y consultar datos con S0.

Then: no se concede acceso ni se modifican otras sesiones.

## HU-04. Eliminar la cuenta

Requisito: R1

Historia: Como usuario quiero eliminar mi cuenta para borrar sus datos asociados.

### Reglas de dominio aplicables

- RD-15: La eliminación de la cuenta requiere confirmar la contraseña correcta.

- RD-16: El borrado debe ser atómico e incluir cuenta, sesiones, lugares, vehículos, rutas y preferencias asociados.

- RD-17: La eliminación no debe afectar a los datos de otras cuentas.

- RD-18: Cancelar el diálogo no elimina datos.

- RD-06: Una operación inválida no debe modificar el estado confirmado.

### Análisis de escenarios

| Escenario | Servidor disponible | Sesión válida | Contraseña correcta | Confirmación | Borrado |
| --- | --- | --- | --- | --- | --- |
| E-04-V | Sí | Sí | Sí | Sí | Sí |
| E-04-I1 | Sí | Sí | No | Sí | No |
| E-04-I2 | Sí | No | -- | Sí | No |
| E-04-I3 | Sí | Sí | Sí | No | No |
| E-04-I4 | No | -- | -- | -- | No |

Se seleccionan E-04-V como escenario válido y E-04-I1 como escenario inválido para las pruebas de aceptación.

### E-04-V — Escenario válido · Prueba PA-04-V

Justificación: verifica el alcance del borrado en cascada.

Given: Ana tiene dos lugares, un vehículo y una ruta guardada.

When: confirma la eliminación con RutaSegura2026.

Then: se eliminan cuenta, sesiones, lugares, vehículo, ruta y preferencias de Ana, sin afectar a otras cuentas.

### E-04-I1 — Escenario inválido · Prueba PA-04-I

Justificación: impide un borrado irreversible sin comprobar la contraseña.

Given: Ana conserva esos datos.

When: confirma la eliminación con OtraClave2026.

Then: se rechaza la operación y permanecen la cuenta y todos sus datos.

## HU-05. Guardar por coordenadas

Requisito: R2

Historia: Como usuario quiero dar de alta un lugar mediante coordenadas para usarlo en una ruta.

### Reglas de dominio aplicables

- RD-19: El nombre del lugar debe tener entre 1 y 120 caracteres.

- RD-20: La latitud debe ser finita y estar entre -90 y 90; la longitud debe ser finita y estar entre -180 y 180.

- RD-21: El lugar guardado pertenece al usuario que realiza el alta.

- RD-22: Las coordenadas válidas no garantizan cobertura del proveedor de rutas.

- RD-06: Una operación inválida no debe modificar el estado confirmado.

### Análisis de escenarios

| Escenario | Sesión válida | Nombre válido | Latitud válida | Longitud válida | Alta |
| --- | --- | --- | --- | --- | --- |
| E-05-V | Sí | Sí | Sí | Sí | Sí |
| E-05-I1 | Sí | Sí | No (91) | Sí | No |
| E-05-I2 | Sí | Sí | Sí | No | No |
| E-05-I3 | Sí | No | Sí | Sí | No |
| E-05-I4 | No | Sí | Sí | Sí | No |

Se seleccionan E-05-V como escenario válido y E-05-I1 como escenario inválido para las pruebas de aceptación.

### E-05-V — Escenario válido · Prueba PA-05-V

Justificación: permite guardar sin depender del geocodificador.

Given: Ana tiene cero lugares.

When: guarda Centro con latitud 39.9864 y longitud -0.0513.

Then: aparece un lugar de Ana con ese nombre y esas coordenadas.

### E-05-I1 — Escenario inválido · Prueba PA-05-I

Justificación: evita posiciones fuera del dominio geográfico.

Given: Ana tiene cero lugares.

When: guarda Centro con latitud 91 y longitud -0.0513.

Then: se rechaza la latitud y la colección sigue vacía.

## HU-06. Guardar por topónimo

Requisito: R2

Historia: Como usuario quiero buscar un topónimo y guardar un resultado para identificar un lugar sin conocer sus coordenadas.

### Reglas de dominio aplicables

- RD-23: El topónimo no puede quedar vacío al eliminar espacios; la entrada vacía se rechaza antes de consultar el servicio.

- RD-24: El límite propuesto del topónimo es de 200 caracteres, pendiente de validación.

- RD-25: El usuario debe seleccionar y confirmar un candidato; nunca se guarda automáticamente el primero.

- RD-26: Solo se guarda el candidato seleccionado con coordenadas válidas.

- RD-19: El nombre del lugar debe tener entre 1 y 120 caracteres.

- RD-06: Una operación inválida no debe modificar el estado confirmado.

### Análisis de escenarios

| Escenario | Sesión válida | Topónimo válido | Servicio disponible | Candidato confirmado | Alta |
| --- | --- | --- | --- | --- | --- |
| E-06-V | Sí | Sí | Sí | Sí | Sí |
| E-06-I1 | Sí | No (espacios) | -- | No | No |
| E-06-I2 | Sí | Sí | No | No | No |
| E-06-I3 | Sí | Sí | Sí | No | No |
| E-06-I4 | Sí | No (201 caracteres) | -- | No | No |
| E-06-I5 | No | Sí | -- | -- | No |

Se seleccionan E-06-V como escenario válido y E-06-I1 como escenario inválido para las pruebas de aceptación.

### E-06-V — Escenario válido · Prueba PA-06-V

Justificación: incluye elección explícita ante nombres ambiguos; no fija coordenadas de un proveedor cambiante.

Given: Ana está autenticada y el geocodificador real está disponible.

When: busca Universitat Jaume I, Castellón, selecciona un resultado y lo guarda como UJI.

Then: se obtiene al menos un candidato con coordenadas válidas y se persiste exactamente el candidato seleccionado.

### E-06-I1 — Escenario inválido · Prueba PA-06-I

Justificación: una entrada vacía carece de significado y no debe consumir peticiones.

Given: Ana tiene cero lugares.

When: solicita buscar un topónimo formado por tres espacios.

Then: se rechaza la búsqueda vacía antes de consultar el servicio y no se guarda ningún lugar.

## HU-07. Consultar lugares

Requisito: R2

Historia: Como usuario quiero consultar mis lugares para elegir los que utilizaré.

### Reglas de dominio aplicables

- RD-27: La consulta de lugares requiere una sesión válida.

- RD-28: Cada usuario solo consulta sus propios lugares.

- RD-29: Una colección vacía es un resultado válido y debe mostrar una invitación al alta.

- RD-30: Los nombres repetidos y las búsquedas sin coincidencias no deben confundirse con un error de acceso.

### Análisis de escenarios

| Escenario | Servidor disponible | Sesión válida | Lugares propios | Lugares ajenos | Resultado |
| --- | --- | --- | --- | --- | --- |
| E-07-V | Sí | Sí | Centro y UJI | Estación | Solo Centro y UJI |
| E-07-I1 | Sí | No | Centro y UJI | -- | Acceso denegado |
| E-07-V2 | Sí | Sí | Ninguno | Estación | Colección vacía |
| E-07-I2 | No | Sí | -- | -- | Consulta no disponible |

Se seleccionan E-07-V como escenario válido y E-07-I1 como escenario inválido para las pruebas de aceptación.

### E-07-V — Escenario válido · Prueba PA-07-V

Justificación: comprueba la consulta completa y el aislamiento por propietario.

Given: Ana tiene Centro y UJI; Luis tiene Estación.

When: Ana consulta su colección.

Then: se devuelven Centro y UJI y no se devuelve Estación.

### E-07-I1 — Escenario inválido · Prueba PA-07-I

Justificación: evita revelar ubicaciones sin autenticación.

Given: no hay sesión válida.

When: se solicita la colección de Ana.

Then: se deniega el acceso y no se muestran lugares.

## HU-08. Eliminar un lugar

Requisito: R2

Historia: Como usuario quiero eliminar un lugar propio para mantener actualizada mi colección.

### Reglas de dominio aplicables

- RD-31: Solo se puede eliminar un lugar propio y tras confirmar la operación.

- RD-32: Eliminar un lugar no elimina los restantes lugares del usuario.

- RD-33: El lugar eliminado deja de poder seleccionarse en nuevas rutas; si era un extremo reciente se limpia esa selección.

- RD-34: Las rutas guardadas conservan su instantánea histórica; esta política está pendiente de confirmar con el profesorado.

- RD-06: Una operación inválida no debe modificar el estado confirmado.

### Análisis de escenarios

| Escenario | Sesión válida | Lugar existente | Lugar propio | Confirmación | Borrado |
| --- | --- | --- | --- | --- | --- |
| E-08-V | Sí | Sí | Sí | Sí | Sí |
| E-08-I1 | Sí | Sí | No | Sí | No |
| E-08-I2 | Sí | No | -- | Sí | No |
| E-08-I3 | Sí | Sí | Sí | No | No |
| E-08-I4 | No | Sí | Sí | Sí | No |

Se seleccionan E-08-V como escenario válido y E-08-I1 como escenario inválido para las pruebas de aceptación.

### E-08-V — Escenario válido · Prueba PA-08-V

Justificación: comprueba que la eliminación afecta solo al registro elegido.

Given: Ana tiene Centro y UJI.

When: confirma eliminar Centro.

Then: solo queda UJI y Centro deja de poder elegirse en nuevas rutas.

### E-08-I1 — Escenario inválido · Prueba PA-08-I

Justificación: prueba la autorización sobre el objeto, no solo sobre la sesión.

Given: Estación pertenece a Luis.

When: Ana intenta eliminar Estación.

Then: se rechaza como elemento no disponible y Estación permanece intacta.

## HU-09. Elegir lugares en el mapa

Requisito: R2

Historia: Como usuario quiero seleccionar un punto en el mapa y guardarlo para fijar visualmente un origen o un destino.

### Reglas de dominio aplicables

- RD-35: El alta por mapa requiere seleccionar un punto y confirmar el guardado.

- RD-19: El nombre del lugar debe tener entre 1 y 120 caracteres.

- RD-20: La latitud debe ser finita y estar entre -90 y 90; la longitud debe ser finita y estar entre -180 y 180.

- RD-36: Se guarda la posición finalmente seleccionada, aunque el marcador se haya movido.

- RD-37: Cancelar no crea un lugar; el formulario por coordenadas debe ofrecer una alternativa de teclado.

- RD-06: Una operación inválida no debe modificar el estado confirmado.

### Análisis de escenarios

| Escenario | Sesión válida | Punto seleccionado | Nombre válido | Confirmación | Alta |
| --- | --- | --- | --- | --- | --- |
| E-09-V | Sí | Sí | Sí | Sí | Sí |
| E-09-I1 | Sí | No | Sí | Sí | No |
| E-09-I2 | Sí | Sí | No | Sí | No |
| E-09-I3 | Sí | Sí | Sí | No | No |
| E-09-I4 | No | Sí | Sí | Sí | No |

Se seleccionan E-09-V como escenario válido y E-09-I1 como escenario inválido para las pruebas de aceptación.

### E-09-V — Escenario válido · Prueba PA-09-V

Justificación: concreta la selección cartográfica obligatoria del enunciado.

Given: Ana visualiza el mapa y tiene cero lugares.

When: selecciona el punto (39.9864,-0.0513), le da el nombre Centro y confirma el alta.

Then: se guarda Centro en esas coordenadas y puede seleccionarse como extremo.

### E-09-I1 — Escenario inválido · Prueba PA-09-I

Justificación: evita altas con coordenadas implícitas o residuales.

Given: Ana está en el formulario de alta por mapa sin punto seleccionado.

When: intenta confirmar el alta.

Then: se solicita seleccionar un punto y no se añade ningún lugar.

## HU-10. Dar de alta un vehículo

Requisito: R3

Historia: Como usuario quiero registrar un vehículo para calcular rutas con su consumo.

### Reglas de dominio aplicables

- RD-38: El tipo de vehículo debe ser gasolina, diésel o eléctrico.

- RD-39: El nombre del vehículo debe tener entre 1 y 70 caracteres.

- RD-40: El consumo propuesto debe estar entre 0.1 y 100, pendiente de validación.

- RD-41: El consumo se expresa en l/100 km para gasolina o diésel y en kWh/100 km para eléctrico.

- RD-42: El vehículo guardado pertenece al usuario que realiza el alta.

- RD-06: Una operación inválida no debe modificar el estado confirmado.

### Análisis de escenarios

| Escenario | Sesión válida | Nombre válido | Tipo admitido | Consumo válido | Alta |
| --- | --- | --- | --- | --- | --- |
| E-10-V | Sí | Sí | Sí | Sí (6.0) | Sí |
| E-10-I1 | Sí | Sí | Sí | No (-1) | No |
| E-10-I2 | Sí | Sí | No | Sí | No |
| E-10-I3 | Sí | No | Sí | Sí | No |
| E-10-I4 | No | Sí | Sí | Sí | No |

Se seleccionan E-10-V como escenario válido y E-10-I1 como escenario inválido para las pruebas de aceptación.

### E-10-V — Escenario válido · Prueba PA-10-V

Justificación: identifica las unidades necesarias para el coste.

Given: Ana no tiene vehículos.

When: registra Compacto, gasolina, consumo 6.0 l/100 km.

Then: se guarda un vehículo propio con esos valores y queda disponible en el planificador.

### E-10-I1 — Escenario inválido · Prueba PA-10-I

Justificación: un consumo negativo produciría estimaciones sin sentido.

Given: Ana no tiene vehículos.

When: registra Compacto, gasolina, consumo -1 l/100 km.

Then: se rechaza el consumo y la colección permanece vacía.

## HU-11. Consultar vehículos

Requisito: R3

Historia: Como usuario quiero consultar mis vehículos para seleccionar el apropiado.

### Reglas de dominio aplicables

- RD-43: La consulta de vehículos requiere una sesión válida.

- RD-44: Cada usuario solo consulta sus propios vehículos, con su tipo y consumo.

- RD-45: Una colección vacía es un resultado válido.

- RD-46: Los vehículos favoritos deben aparecer antes que el resto; los nombres coincidentes no identifican por sí solos un vehículo.

### Análisis de escenarios

| Escenario | Servidor disponible | Sesión válida | Vehículos propios | Vehículos ajenos | Resultado |
| --- | --- | --- | --- | --- | --- |
| E-11-V | Sí | Sí | Compacto y Eléctrico | Furgoneta | Solo los propios |
| E-11-I1 | Sí | Caducada | Compacto y Eléctrico | -- | Acceso denegado |
| E-11-V2 | Sí | Sí | Ninguno | Furgoneta | Colección vacía |
| E-11-I2 | No | Sí | -- | -- | Consulta no disponible |

Se seleccionan E-11-V como escenario válido y E-11-I1 como escenario inválido para las pruebas de aceptación.

### E-11-V — Escenario válido · Prueba PA-11-V

Justificación: presenta los datos que permiten distinguir las opciones.

Given: Ana tiene Compacto y Eléctrico; Luis tiene Furgoneta.

When: Ana consulta sus vehículos.

Then: recibe Compacto y Eléctrico con tipo y consumo; no recibe Furgoneta.

### E-11-I1 — Escenario inválido · Prueba PA-11-I

Justificación: no expone información desde una sesión caducada.

Given: la sesión de Ana ha caducado.

When: consulta los vehículos.

Then: se solicita iniciar sesión y no se devuelve la colección.

## HU-12. Eliminar un vehículo

Requisito: R3

Historia: Como usuario quiero eliminar un vehículo que ya no utilizo para evitar seleccionarlo.

### Reglas de dominio aplicables

- RD-47: Solo se puede eliminar un vehículo propio y tras confirmar la operación.

- RD-48: Si se elimina el vehículo predeterminado, su referencia debe quedar vacía y la nueva selección debe explicitarse.

- RD-49: Las rutas guardadas conservan su instantánea histórica.

- RD-18: Cancelar el diálogo no elimina datos.

- RD-06: Una operación inválida no debe modificar el estado confirmado.

### Análisis de escenarios

| Escenario | Sesión válida | Vehículo propio | Confirmación | Predeterminado | Borrado |
| --- | --- | --- | --- | --- | --- |
| E-12-V | Sí | Sí | Sí | Sí | Sí; referencia vacía |
| E-12-I1 | Sí | No | Sí | -- | No |
| E-12-I2 | Sí | Sí | No | Sí | No |
| E-12-I3 | No | Sí | Sí | Sí | No |
| E-12-V2 | Sí | Sí | Sí | No | Sí |

Se seleccionan E-12-V como escenario válido y E-12-I1 como escenario inválido para las pruebas de aceptación.

### E-12-V — Escenario válido · Prueba PA-12-V

Justificación: comprueba también la integridad de las preferencias.

Given: Compacto es el vehículo predeterminado de Ana.

When: Ana confirma eliminar Compacto.

Then: se borra el vehículo y la referencia predeterminada queda vacía.

### E-12-I1 — Escenario inválido · Prueba PA-12-I

Justificación: protege vehículos de otros usuarios.

Given: Furgoneta pertenece a Luis.

When: Ana intenta eliminar Furgoneta.

Then: se rechaza la operación y no cambian ni Furgoneta ni las preferencias de Ana.

## HU-13. Modificar un vehículo

Requisito: R3

Historia: Como usuario quiero actualizar el consumo de mi vehículo para mejorar las estimaciones futuras.

### Reglas de dominio aplicables

- RD-50: Solo se puede modificar un vehículo propio.

- RD-51: La modificación conserva el identificador del vehículo.

- RD-40: El consumo propuesto debe estar entre 0.1 y 100, pendiente de validación.

- RD-52: Cambiar el tipo de vehículo debe actualizar la unidad del consumo.

- RD-53: Las rutas históricas no se recalculan silenciosamente al modificar un vehículo.

- RD-06: Una operación inválida no debe modificar el estado confirmado.

### Análisis de escenarios

| Escenario | Sesión válida | Vehículo propio | Tipo admitido | Consumo válido | Modificación |
| --- | --- | --- | --- | --- | --- |
| E-13-V | Sí | Sí | Sí | Sí (5.5) | Sí |
| E-13-I1 | Sí | Sí | Sí | No (0) | No |
| E-13-I2 | Sí | No | Sí | Sí | No |
| E-13-I3 | Sí | Sí | No | Sí | No |
| E-13-I4 | No | Sí | Sí | Sí | No |

Se seleccionan E-13-V como escenario válido y E-13-I1 como escenario inválido para las pruebas de aceptación.

### E-13-V — Escenario válido · Prueba PA-13-V

Justificación: conserva la identidad del vehículo al editar.

Given: Compacto pertenece a Ana y consume 6.0 l/100 km.

When: Ana cambia el consumo a 5.5 y guarda.

Then: se mantiene el identificador y se registra 5.5 para los cálculos posteriores.

### E-13-I1 — Escenario inválido · Prueba PA-13-I

Justificación: verifica que la validación precede a la escritura.

Given: Compacto consume 6.0 l/100 km.

When: Ana intenta guardar consumo 0.

Then: se rechaza la edición y permanece el consumo 6.0.

## HU-14. Calcular y visualizar una ruta

Requisito: R4

Historia: Como usuario quiero obtener una ruta entre dos lugares guardados para conocer su trayecto, distancia y duración.

### Reglas de dominio aplicables

- RD-54: Los extremos de la ruta deben ser lugares guardados del usuario y tener coordenadas distintas.

- RD-55: Los modos previstos son a pie, bicicleta y coche.

- RD-56: El cálculo válido devuelve geometría con al menos dos puntos válidos, distancia y duración positivas, y el trayecto se dibuja en el mapa.

- RD-57: Un fallo, demora o falta de cobertura del proveedor debe comunicarse sin presentar una ruta nueva como calculada.

- RD-06: Una operación inválida no debe modificar el estado confirmado.

### Análisis de escenarios

| Escenario | Sesión válida | Extremos propios guardados | Coordenadas distintas | Proveedor disponible | Ruta |
| --- | --- | --- | --- | --- | --- |
| E-14-V | Sí | Sí | Sí | Sí | Sí |
| E-14-I1 | Sí | Sí | No | -- | No |
| E-14-I2 | Sí | No | Sí | -- | No |
| E-14-I3 | Sí | Sí | Sí | No | No |
| E-14-I4 | No | Sí | Sí | -- | No |

Se seleccionan E-14-V como escenario válido y E-14-I1 como escenario inválido para las pruebas de aceptación.

### E-14-V — Escenario válido · Prueba PA-14-V

Justificación: la prueba de lógica verifica geometría y métricas; una comprobación de interfaz añade el dibujo.

Given: Ana tiene Centro (39.9864,-0.0513) y UJI (39.9946,-0.0684), y el servicio real está disponible.

When: calcula la ruta a pie entre Centro y UJI.

Then: se devuelve una geometría con al menos dos puntos válidos, distancia positiva menor de 100 km y duración positiva; el mapa dibuja el trayecto.

### E-14-I1 — Escenario inválido · Prueba PA-14-I

Justificación: detecta una combinación de entradas incompatible con el trayecto definido.

Given: Ana tiene Centro.

When: solicita una ruta de Centro a Centro.

Then: se rechaza por extremos coincidentes y no se guarda ni presenta una ruta nueva.

## HU-15. Estimar coste de combustible

Requisito: R4

Historia: Como usuario quiero conocer el coste de combustible para comparar el gasto de mi desplazamiento.

### Reglas de dominio aplicables

- RD-58: El coste de combustible se calcula como distancia/100 × consumo × precio, con km, l/100 km y €/l.

- RD-59: La estimación se aplica a gasolina o diésel, con una ruta y un vehículo adecuados.

- RD-60: El intervalo propuesto para el precio manual es de 0.001 a 20 €/l, pendiente de validación.

- RD-61: Debe indicarse el origen manual del precio o la fuente y fecha del precio público.

- RD-62: Sin precio fiable se muestra el coste como no disponible; se conserva la precisión y se redondea al presentar.

- RD-06: Una operación inválida no debe modificar el estado confirmado.

### Análisis de escenarios

| Escenario | Ruta disponible | Vehículo de combustible | Precio válido | Fuente identificada | Resultado |
| --- | --- | --- | --- | --- | --- |
| E-15-V | Sí (100 km) | Sí (6 l/100 km) | Sí (1.60 €/l) | Sí | 9.60 € |
| E-15-I1 | -- | Sí | No (-1 €/l) | Manual | Rechazo; precio anterior |
| E-15-I2 | No | Sí | Sí | Sí | Sin estimación |
| E-15-I3 | Sí | No | Sí | Sí | No aplicable |
| E-15-I4 | Sí | Sí | No disponible | No | Coste no disponible |

Se seleccionan E-15-V como escenario válido y E-15-I1 como escenario inválido para las pruebas de aceptación.

### E-15-V — Escenario válido · Prueba PA-15-V

Justificación: el dato manual hace reproducible la comprobación aritmética sin sustituir un proveedor por un mock.

Given: hay una ruta persistida de 100 km y Compacto consume 6 l/100 km; se activa precio manual de gasolina 1.60 €/l.

When: se estima su coste de combustible.

Then: se obtiene 9.60 € y se indica que el precio es manual.

### E-15-I1 — Escenario inválido · Prueba PA-15-I

Justificación: evita un coste negativo por configuración errónea.

Given: Compacto consume 6 l/100 km y el precio manual vigente es 1.60 €/l.

When: se intenta fijar un precio de -1 €/l.

Then: se rechaza el precio y el vigente sigue siendo 1.60 €/l.

## HU-16. Estimar coste eléctrico

Requisito: R4

Historia: Como usuario de un vehículo eléctrico quiero conocer el coste energético de una ruta para prever el gasto.

### Reglas de dominio aplicables

- RD-63: El coste eléctrico se calcula como distancia/100 × consumo × precio, con km, kWh/100 km y €/kWh.

- RD-64: La estimación requiere una ruta y un vehículo eléctrico.

- RD-65: El intervalo propuesto para el precio manual es de 0.001 a 20 €/kWh, pendiente de validación; admitir tarifa gratuita es una decisión pendiente del cliente.

- RD-66: Un precio recibido en €/MWh debe dividirse entre 1000 para expresarlo en €/kWh.

- RD-67: Debe mostrarse el origen del precio y su unidad; el precio mayorista no equivale a la factura final.

- RD-06: Una operación inválida no debe modificar el estado confirmado.

### Análisis de escenarios

| Escenario | Ruta disponible | Vehículo eléctrico | Precio válido | Unidad normalizada | Resultado |
| --- | --- | --- | --- | --- | --- |
| E-16-V | Sí (100 km) | Sí (15 kWh/100 km) | Sí (0.20 €/kWh) | Sí | 3.00 € |
| E-16-I1 | -- | -- | No (0 €/kWh) | Sí | Rechazo; precio anterior |
| E-16-V2 | Sí (100 km) | Sí (15 kWh/100 km) | Sí (200 €/MWh) | Convertir a €/kWh | 3.00 € |
| E-16-I2 | No | Sí | Sí | Sí | Sin estimación |
| E-16-I3 | Sí | No | Sí | Sí | No aplicable |

Se seleccionan E-16-V como escenario válido y E-16-I1 como escenario inválido para las pruebas de aceptación.

### E-16-V — Escenario válido · Prueba PA-16-V

Justificación: separa electricidad y combustible para evitar confusiones de unidades.

Given: hay una ruta de 100 km y Eléctrico consume 15 kWh/100 km; precio manual 0.20 €/kWh.

When: se estima el coste eléctrico.

Then: se obtienen 3.00 € y se muestran unidad y origen manual del precio.

### E-16-I1 — Escenario inválido · Prueba PA-16-I

Justificación: verifica el mínimo positivo propuesto para la tarifa configurada.

Given: el precio eléctrico manual vigente es 0.20 €/kWh.

When: se intenta guardar 0 €/kWh.

Then: se rechaza el valor y permanece 0.20 €/kWh.

## HU-17. Estimar calorías

Requisito: R4

Historia: Como usuario quiero estimar las calorías de una ruta a pie o en bicicleta para valorar el esfuerzo.

### Reglas de dominio aplicables

- RD-68: Las calorías se estiman como MET × 3.5 × peso/200 × minutos.

- RD-69: Los MET propuestos son 3.5 a pie y 6.8 en bicicleta, pendientes de validación.

- RD-70: El peso propuesto debe estar entre 20 y 300 kg, pendiente de validación.

- RD-71: La duración se expresa en minutos; se conserva la precisión y se redondea al presentar.

- RD-72: El resultado se identifica como estimación, no como medición fisiológica individual.

- RD-06: Una operación inválida no debe modificar el estado confirmado.

### Análisis de escenarios

| Escenario | Ruta disponible | Modo | Peso válido | Duración válida | Resultado |
| --- | --- | --- | --- | --- | --- |
| E-17-V | Sí | A pie | Sí (70 kg) | Sí (30 min) | 128.625 kcal |
| E-17-I1 | -- | -- | No (0 kg) | -- | Rechazo; peso anterior |
| E-17-V2 | Sí | Bicicleta | Sí (70 kg) | Sí (30 min) | 249.9 kcal |
| E-17-I2 | No | A pie | Sí | -- | Sin estimación |
| E-17-I3 | Sí | Coche | Sí | Sí | No aplicable |

Se seleccionan E-17-V como escenario válido y E-17-I1 como escenario inválido para las pruebas de aceptación.

### E-17-V — Escenario válido · Prueba PA-17-V

Justificación: fija los parámetros de un cálculo reproducible.

Given: Ana pesa 70 kg y existe una ruta a pie de 30 minutos.

When: se calcula la estimación con MET igual a 3.5.

Then: se obtienen 128.625 kcal antes de redondear y se muestran como estimación.

### E-17-I1 — Escenario inválido · Prueba PA-17-I

Justificación: un peso nulo anula indebidamente el esfuerzo.

Given: Ana tiene peso configurado de 70 kg.

When: intenta cambiarlo a 0 kg.

Then: se rechaza el valor y permanece el peso de 70 kg.

## HU-18. Elegir el criterio de ruta

Requisito: R4

Historia: Como usuario quiero priorizar duración, distancia o coste para escoger una alternativa adecuada.

### Reglas de dominio aplicables

- RD-73: Los criterios admitidos son más rápida, más corta y más económica.

- RD-74: El criterio se aplica a las alternativas realmente recibidas, sin afirmar una optimización global.

- RD-75: Más económica requiere precios disponibles y selecciona un coste menor o igual al de las otras alternativas obtenidas.

- RD-76: Los empates deben resolverse con un orden estable; con una sola alternativa se evalúa esa opción.

- RD-77: Un criterio desconocido se rechaza antes de consultar rutas y sin cambiar preferencias.

- RD-06: Una operación inválida no debe modificar el estado confirmado.

### Análisis de escenarios

| Escenario | Extremos válidos | Criterio admitido | Alternativas disponibles | Precio para coste | Resultado |
| --- | --- | --- | --- | --- | --- |
| E-18-V | Sí | Más económica | Sí | Sí | Menor coste recibido |
| E-18-I1 | Sí | No (panorámica) | -- | -- | Rechazo sin consulta |
| E-18-I2 | Sí | Más económica | Sí | No | Coste no disponible |
| E-18-I3 | Sí | Sí | No | -- | Sin alternativa |
| E-18-V2 | Sí | Más rápida | Una | No necesario | Única alternativa |

Se seleccionan E-18-V como escenario válido y E-18-I1 como escenario inválido para las pruebas de aceptación.

### E-18-V — Escenario válido · Prueba PA-18-V

Justificación: el oráculo compara el conjunto realmente obtenido, sin exigir una ruta fija.

Given: Ana tiene Centro y UJI y el proveedor real devuelve al menos una alternativa de coche con precio disponible.

When: solicita el criterio más económico.

Then: la opción seleccionada tiene coste menor o igual que cada alternativa obtenida, con fuente de precio visible.

### E-18-I1 — Escenario inválido · Prueba PA-18-I

Justificación: impide interpretar arbitrariamente un criterio no soportado.

Given: Ana tiene Centro y UJI.

When: solicita el criterio desconocido panorámica.

Then: se rechaza el criterio sin consultar rutas ni cambiar preferencias.

## HU-19. Guardar una ruta

Requisito: R4

Historia: Como usuario quiero guardar una ruta calculada para consultarla posteriormente.

### Reglas de dominio aplicables

- RD-78: Solo se puede guardar un resultado calculado asociado a la sesión del usuario.

- RD-79: El nombre de una ruta no puede estar vacío.

- RD-80: El guardado conserva nombre, geometría, métricas y datos del cálculo, incluida la fecha y la fuente del precio cuando exista.

- RD-81: Una ruta guardada es una instantánea histórica; no se afirma persistencia de resultados que no se hayan guardado.

- RD-06: Una operación inválida no debe modificar el estado confirmado.

### Análisis de escenarios

| Escenario | Sesión válida | Resultado calculado | Resultado propio | Nombre válido | Guardado |
| --- | --- | --- | --- | --- | --- |
| E-19-V | Sí | Sí | Sí | Sí | Sí |
| E-19-I1 | Sí | No (X99 inventado) | -- | Sí | No |
| E-19-I2 | Sí | Sí | No | Sí | No |
| E-19-I3 | Sí | Sí | Sí | No | No |
| E-19-I4 | No | Sí | Sí | Sí | No |

Se seleccionan E-19-V como escenario válido y E-19-I1 como escenario inválido para las pruebas de aceptación.

### E-19-V — Escenario válido · Prueba PA-19-V

Justificación: transforma un resultado temporal en contenido duradero.

Given: Ana dispone de un resultado calculado en su sesión entre Centro y UJI.

When: lo guarda con el nombre Camino a clase.

Then: se crea una ruta propia con nombre, geometría, métricas y datos de cálculo recuperables.

### E-19-I1 — Escenario inválido · Prueba PA-19-I

Justificación: evita almacenar resultados ajenos o manipulados.

Given: Ana no tiene un resultado calculado asociado a su sesión.

When: intenta guardar un identificador de resultado inventado X99.

Then: se rechaza el guardado y la colección no cambia.

## HU-20. Consultar rutas guardadas

Requisito: R4

Historia: Como usuario quiero consultar mis rutas guardadas para recuperar un trayecto sin volver a calcularlo.

### Reglas de dominio aplicables

- RD-82: La consulta de rutas guardadas requiere una sesión válida y solo muestra rutas propias.

- RD-83: Consultar recupera la misma geometría y métricas históricas, sin recalcularlas.

- RD-45: Una colección vacía es un resultado válido.

- RD-84: La indisponibilidad del proveedor de rutas no debe impedir leer una instantánea almacenada localmente.

- RD-85: El precio histórico debe identificarse como tal aunque esté desactualizado.

### Análisis de escenarios

| Escenario | Sesión válida | Ruta propia guardada | Almacenamiento disponible | Proveedor de rutas disponible | Resultado |
| --- | --- | --- | --- | --- | --- |
| E-20-V | Sí | Sí | Sí | Sí | Instantánea histórica |
| E-20-I1 | No | Sí | Sí | -- | Acceso denegado |
| E-20-I2 | Sí | No; es ajena | Sí | -- | Ruta no disponible |
| E-20-V2 | Sí | Sí | Sí | No | Instantánea histórica |
| E-20-V3 | Sí | Colección vacía | Sí | -- | Lista vacía |
| E-20-I3 | Sí | Sí | No | -- | Fallo de almacenamiento |

Se seleccionan E-20-V como escenario válido y E-20-I1 como escenario inválido para las pruebas de aceptación.

### E-20-V — Escenario válido · Prueba PA-20-V

Justificación: diferencia recuperar de recalcular con datos nuevos.

Given: Ana tiene Camino a clase guardada con su geometría y sus métricas.

When: abre su colección y selecciona Camino a clase.

Then: recupera la misma geometría y las mismas métricas, identificadas como cálculo histórico.

### E-20-I1 — Escenario inválido · Prueba PA-20-I

Justificación: protege el historial de desplazamientos.

Given: no hay sesión válida.

When: se solicita el listado de rutas guardadas.

Then: se deniega el acceso sin revelar nombres ni trayectos.

## HU-21. Eliminar una ruta guardada

Requisito: R4

Historia: Como usuario quiero eliminar una ruta que no necesito para ordenar mi historial.

### Reglas de dominio aplicables

- RD-86: Solo se puede eliminar una ruta guardada propia y tras confirmar la operación.

- RD-87: Eliminar una ruta no modifica los lugares ni vehículos utilizados para calcularla.

- RD-88: Cancelar conserva la ruta; la lista debe actualizarse tras confirmar el borrado.

- RD-06: Una operación inválida no debe modificar el estado confirmado.

### Análisis de escenarios

| Escenario | Sesión válida | Ruta existente | Ruta propia | Confirmación | Borrado |
| --- | --- | --- | --- | --- | --- |
| E-21-V | Sí | Sí | Sí | Sí | Sí |
| E-21-I1 | Sí | Sí | No | Sí | No |
| E-21-I2 | Sí | No | -- | Sí | No |
| E-21-I3 | Sí | Sí | Sí | No | No |
| E-21-I4 | No | Sí | Sí | Sí | No |

Se seleccionan E-21-V como escenario válido y E-21-I1 como escenario inválido para las pruebas de aceptación.

### E-21-V — Escenario válido · Prueba PA-21-V

Justificación: delimita el efecto de la eliminación al historial.

Given: Ana tiene Camino a clase y Paseo.

When: confirma eliminar Camino a clase.

Then: solo permanece Paseo y no se alteran sus lugares ni vehículos.

### E-21-I1 — Escenario inválido · Prueba PA-21-I

Justificación: impide borrar datos de otra cuenta.

Given: Camino al trabajo pertenece a Luis.

When: Ana intenta eliminar esa ruta.

Then: se rechaza la operación y la ruta de Luis permanece.

## HU-22. Gestionar favoritos

Requisito: R5

Historia: Como usuario quiero marcar y desmarcar favoritos para encontrar primero los elementos que uso con frecuencia.

### Reglas de dominio aplicables

- RD-89: Se pueden marcar y desmarcar favoritos en las colecciones de lugares, vehículos y rutas.

- RD-90: Solo se pueden modificar las marcas de elementos propios.

- RD-91: Los favoritos aparecen antes que los no favoritos y mantienen un orden secundario estable.

- RD-92: Las marcas deben conservarse al recargar; todos o ninguno de los elementos pueden ser favoritos.

- RD-93: La estrella debe tener etiqueta accesible y un estado perceptible sin depender del color.

- RD-06: Una operación inválida no debe modificar el estado confirmado.

### Análisis de escenarios

| Escenario | Sesión válida | Elemento existente | Elemento propio | Acción | Resultado |
| --- | --- | --- | --- | --- | --- |
| E-22-V | Sí | Sí | Sí | Marcar en las tres colecciones | Favoritos primero; persisten |
| E-22-I1 | Sí | Sí | No | Cambiar marca | Rechazo; marca intacta |
| E-22-V2 | Sí | Sí | Sí | Desmarcar | Pierde prioridad de favorito |
| E-22-I2 | Sí | No | -- | Cambiar marca | Sin modificación |
| E-22-I3 | No | Sí | Sí | Cambiar marca | Acceso denegado |

Se seleccionan E-22-V como escenario válido y E-22-I1 como escenario inválido para las pruebas de aceptación.

### E-22-V — Escenario válido · Prueba PA-22-V

Justificación: una prueba parametrizada cubre lugares, vehículos y rutas con el mismo contrato.

Given: Ana tiene dos elementos no favoritos en cada colección: Centro/UJI, Compacto/Eléctrico y Camino a clase/Paseo.

When: marca UJI, Eléctrico y Paseo como favoritos y vuelve a consultar las tres listas.

Then: cada elemento marcado aparece antes que el no marcado en su colección y la marca se conserva al recargar.

### E-22-I1 — Escenario inválido · Prueba PA-22-I

Justificación: comprueba autorización en las tres variantes del requisito.

Given: Estación, Furgoneta y Camino al trabajo pertenecen a Luis.

When: Ana intenta cambiar el favorito de cada uno.

Then: cada operación se rechaza y todas las marcas de Luis permanecen intactas.

## HU-23. Fijar transporte predeterminado

Requisito: R5

Historia: Como usuario quiero fijar un modo y, si procede, un vehículo por defecto para preparar rutas con menos pasos.

### Reglas de dominio aplicables

- RD-55: Los modos previstos son a pie, bicicleta y coche.

- RD-94: El modo coche requiere un vehículo propio para establecerlo como predeterminado.

- RD-95: Los modos a pie y bicicleta no requieren vehículo.

- RD-96: Los valores predeterminados se aplican a una planificación nueva, permitiendo una selección puntual distinta.

- RD-97: Eliminar el vehículo predeterminado limpia su referencia; el valor por defecto se distingue de restaurar el último trayecto.

- RD-06: Una operación inválida no debe modificar el estado confirmado.

### Análisis de escenarios

| Escenario | Sesión válida | Modo admitido | Vehículo propio si procede | Guardado | Resultado |
| --- | --- | --- | --- | --- | --- |
| E-23-V | Sí | Coche | Sí (Compacto) | Sí | Coche y Compacto por defecto |
| E-23-I1 | Sí | Coche | No (Furgoneta ajena) | No | Conserva Compacto |
| E-23-V2 | Sí | A pie | No necesario | Sí | A pie sin vehículo |
| E-23-I2 | Sí | No | -- | No | Conserva preferencia |
| E-23-I3 | No | Coche | Sí | No | Acceso denegado |

Se seleccionan E-23-V como escenario válido y E-23-I1 como escenario inválido para las pruebas de aceptación.

### E-23-V — Escenario válido · Prueba PA-23-V

Justificación: reduce trabajo repetitivo sin bloquear la elección puntual.

Given: Compacto pertenece a Ana.

When: guarda coche y Compacto como valores predeterminados y abre una planificación nueva.

Then: se seleccionan coche y Compacto, permitiendo cambiarlos para esa consulta.

### E-23-I1 — Escenario inválido · Prueba PA-23-I

Justificación: impide referencias a vehículos ajenos.

Given: Furgoneta pertenece a Luis y Ana usa Compacto.

When: Ana intenta establecer Furgoneta como predeterminada.

Then: se rechaza la referencia y permanece Compacto.

## HU-24. Fijar criterio predeterminado

Requisito: R5

Historia: Como usuario quiero guardar un criterio de ruta por defecto para no repetir mi preferencia.

### Reglas de dominio aplicables

- RD-73: Los criterios admitidos son más rápida, más corta y más económica.

- RD-98: El criterio guardado debe aparecer como valor inicial al abrir una planificación nueva.

- RD-99: Una selección puntual no sobrescribe el criterio predeterminado.

- RD-06: Una operación inválida no debe modificar el estado confirmado.

### Análisis de escenarios

| Escenario | Servidor disponible | Sesión válida | Criterio admitido | Guardar preferencia | Resultado |
| --- | --- | --- | --- | --- | --- |
| E-24-V | Sí | Sí | Más corta | Sí | Más corta por defecto |
| E-24-I1 | Sí | Sí | No (panorámica) | Sí | Conserva más corta |
| E-24-V2 | Sí | Sí | Más económica | Sí | Más económica por defecto |
| E-24-I2 | Sí | No | Sí | Sí | Acceso denegado |
| E-24-I3 | No | Sí | Sí | Sí | Sin guardado confirmado |

Se seleccionan E-24-V como escenario válido y E-24-I1 como escenario inválido para las pruebas de aceptación.

### E-24-V — Escenario válido · Prueba PA-24-V

Justificación: comprueba el efecto posterior de guardar, además de la notificación.

Given: Ana usa el criterio más rápido.

When: guarda más corta y abre una planificación nueva.

Then: aparece más corta como criterio inicial y la preferencia persiste.

### E-24-I1 — Escenario inválido · Prueba PA-24-I

Justificación: preserva un estado admitido ante valores desconocidos.

Given: Ana usa más corta.

When: intenta guardar panorámica como criterio.

Then: se rechaza el valor y se conserva más corta.

## HU-25. Recuperar estado tras un cierre

Requisito: R6

Historia: Como usuario quiero recuperar contenidos y aspecto al volver a abrir la aplicación para evitar reconfigurarla.

### Reglas de dominio aplicables

- RD-100: Tras un cierre normal deben recuperarse los contenidos confirmados con sus identificadores, favoritos, tema y selección del último trayecto.

- RD-101: La comprobación de persistencia utiliza almacenamiento en disco y un nuevo proceso.

- RD-102: Una sesión caducada requiere volver a iniciar sesión.

- RD-103: Un fallo de almacenamiento debe mostrarse como error, sin sustituir los datos por una colección vacía.

- RD-104: La recuperación de borradores y resultados no guardados está pendiente de aclarar con el profesorado y no se acredita con el prototipo.

### Análisis de escenarios

| Escenario | Datos confirmados | Cierre normal | Almacenamiento disponible | Sesión válida al consultar | Resultado |
| --- | --- | --- | --- | --- | --- |
| E-25-V | Sí | Sí | Sí | Sí; tras iniciar sesión | Estado recuperado |
| E-25-I1 | Sí | Sí | No | -- | Error; no lista vacía ficticia |
| E-25-I2 | Sí | Sí | Sí | No; caducada | Solicitar acceso |
| E-25-V2 | Colecciones vacías guardadas | Sí | Sí | Sí | Estado vacío real |

Se seleccionan E-25-V como escenario válido y E-25-I1 como escenario inválido para las pruebas de aceptación.

### E-25-V — Escenario válido · Prueba PA-25-V

Justificación: usa una base de datos en disco y un nuevo proceso, no solo una recarga visual.

Given: Ana ha guardado Centro, Compacto, Camino a clase, tema oscuro y el último trayecto Centro-UJI.

When: cierra de forma normal, reinicia el servidor y vuelve a iniciar sesión.

Then: recupera los registros con sus identificadores, favoritos, tema y selección del último trayecto.

### E-25-I1 — Escenario inválido · Prueba PA-25-I

Justificación: una indisponibilidad no debe confundirse con pérdida de contenidos.

Given: Ana conserva esos datos y el almacenamiento no se puede abrir.

When: intenta iniciar la aplicación.

Then: se informa del fallo de almacenamiento y no se presenta una colección vacía como si fuera su estado real.

## HU-26. Recuperar estado tras interrupción

Requisito: R6

Historia: Como usuario quiero conservar los datos confirmados tras un cierre involuntario para no perder el trabajo guardado.

### Reglas de dominio aplicables

- RD-105: Tras una interrupción de proceso deben conservarse íntegros los datos cuya escritura ya se haya confirmado.

- RD-106: Las escrituras son atómicas: una transacción interrumpida antes del COMMIT no debe producir un alta parcial.

- RD-107: La recuperación se comprueba reabriendo la misma base de datos en disco desde otro proceso.

- RD-108: La caída de proceso no acredita recuperación ante corte eléctrico o daño físico del disco.

- RD-109: La prueba con transacción abierta antes del COMMIT está definida para una iteración posterior y no se declara ya superada.

### Análisis de escenarios

| Escenario | Centro confirmado | Alta de UJI | Momento de interrupción | Base reabierta | Resultado |
| --- | --- | --- | --- | --- | --- |
| E-26-V | Sí | No iniciada | Después del COMMIT de Centro | Sí | Centro íntegro, sin duplicados |
| E-26-I1 | Sí | Sin COMMIT | Antes del COMMIT de UJI | Sí | Centro sí; UJI no |
| E-26-V2 | Sí | Confirmada | Después del COMMIT de UJI | Sí | Centro y UJI íntegros |
| E-26-I2 | Sí | -- | Caída de proceso | No disponible | Error; recuperación no comprobable |

Se seleccionan E-26-V como escenario válido y E-26-I1 como escenario inválido para las pruebas de aceptación.

### E-26-V — Escenario válido · Prueba PA-26-V

Justificación: reproduce una interrupción de proceso posterior a una escritura confirmada.

Given: el servidor ha confirmado el alta de Centro en una base de datos en disco.

When: se termina abruptamente el proceso con SIGKILL y se abre otro sobre la misma base.

Then: Centro permanece íntegro y se puede consultar sin duplicados.

### E-26-I1 — Escenario inválido · Prueba PA-26-I

Justificación: el guardado interrumpido no es una operación completada; comprueba atomicidad.

Given: Centro está confirmado y una transacción añade UJI pero aún no ha confirmado.

When: se termina el proceso antes del COMMIT y se reabre la base.

Then: Centro permanece y UJI no aparece como alta confirmada; no hay escritura parcial.
