# Historias, escenarios y aceptación

## HU-01. Registrar una cuenta

**Requisito** R1

**Historia** Como persona no registrada quiero crear una cuenta para utilizar los servicios de movilidad.


### Reglas de dominio aplicables

**RD-01** El correo electrónico debe estar normalizado.

**RD-02** El correo electrónico debe ser único.

**RD-03** El correo electrónico puede tener como máximo 254 caracteres.

**RD-04** El nombre debe tener entre 1 y 70 caracteres.

**RD-05** La contraseña debe tener entre 10 y 128 caracteres.

**RD-06** Una operación inválida no debe modificar el estado confirmado.


### Análisis de escenarios

| **Escenario** | **Servidor disponible** | **Nombre válido** | **Correo válido** | **Contraseña válida** | **Correo no existente** | **Alta** |
| --- | --- | --- | --- | --- | --- | --- |
| E-01-V | Sí | Sí | Sí | Sí | Sí | Sí |
| E-01-I1 | Sí | Sí | Sí | Sí | No | No |
| E-01-I2 | Sí | Sí | Sí | No | Sí | No |
| E-01-I3 | Sí | Sí | No | Sí | Sí | No |
| E-01-I4 | Sí | No | Sí | Sí | Sí | No |
| E-01-I5 | No | No aplica | No aplica | No aplica | No aplica | No |

Se seleccionan E-01-V como escenario válido y E-01-I1 como escenario inválido para las pruebas de aceptación.

| **E-01-V** | **Escenario válido · Prueba PA-01-V** |
| --- | --- |
| **Justificación** | comprueba el alta con datos válidos y su guardado en la base de datos. |
| **Análisis** | Probar los tamaños mínimos y máximos de los campos. |
| **Given** | no existe ana@example.com y el almacenamiento está disponible |
| **When** | se registra Ana con ana@example.com y la contraseña RutaSegura2026 |
| **Then** | se crea una única cuenta y se devuelve su identificador, sin devolver la contraseña |

| **E-01-I1** | **Escenario inválido · Prueba PA-01-I** |
| --- | --- |
| **Justificación** | un correo ya registrado impide crear otra cuenta con la misma identidad. |
| **Análisis** | Probar el mismo correo con mayúsculas y espacios exteriores. |
| **Given** | existe ana@example.com |
| **When** | se intenta registrar de nuevo ese correo con RutaSegura2026 |
| **Then** | se rechaza por correo duplicado y el número de cuentas no cambia |


## HU-02. Iniciar sesión

**Requisito** R1

**Historia** Como persona registrada quiero iniciar sesión para acceder a mis datos.


### Reglas de dominio aplicables

**RD-07** El acceso requiere una cuenta existente y credenciales correctas.

**RD-08** Una sesión solo permite recuperar los datos de su titular.

**RD-09** El correo inexistente y la contraseña incorrecta deben producir el mismo mensaje de error.

**RD-10** Los campos vacíos no permiten iniciar sesión.

**RD-06** Una operación inválida no debe modificar el estado confirmado.


### Análisis de escenarios

| **Escenario** | **Servidor disponible** | **Cuenta existente** | **Contraseña correcta** | **Campos completos** | **Acceso** |
| --- | --- | --- | --- | --- | --- |
| E-02-V | Sí | Sí | Sí | Sí | Sí |
| E-02-I1 | Sí | Sí | No | Sí | No |
| E-02-I2 | Sí | No | No aplica | Sí | No |
| E-02-I3 | Sí | No aplica | No aplica | No | No |
| E-02-I4 | No | No aplica | No aplica | No aplica | No |

Se seleccionan E-02-V como escenario válido y E-02-I1 como escenario inválido para las pruebas de aceptación.

| **E-02-V** | **Escenario válido · Prueba PA-02-V** |
| --- | --- |
| **Justificación** | comprueba que el acceso corresponde a la cuenta indicada. |
| **Análisis** | Comprobar que otras cuentas no aparecen en la sesión. |
| **Given** | existe Ana con ana@example.com y RutaSegura2026 |
| **When** | inicia sesión con esas credenciales |
| **Then** | se crea una sesión vinculada a Ana y se recuperan únicamente sus datos |

| **E-02-I1** | **Escenario inválido · Prueba PA-02-I** |
| --- | --- |
| **Justificación** | una contraseña errónea no debe conceder acceso ni revelar datos. |
| **Análisis** | Repetir con correo inexistente y campos vacíos. |
| **Given** | existe la cuenta ana@example.com con contraseña RutaSegura2026 |
| **When** | se inicia sesión con ana@example.com y OtraClave2026 |
| **Then** | se informa de credenciales incorrectas y no se crea una sesión |


## HU-03. Cerrar sesión

**Requisito** R1

**Historia** Como usuario autenticado quiero cerrar mi sesión para impedir el acceso posterior desde ella.


### Reglas de dominio aplicables

**RD-11** Una sesión cerrada debe dejar de dar acceso a los datos.

**RD-12** El cierre de sesión conserva los contenidos del usuario.

**RD-13** Un código de sesión inexistente o ya cerrado no permite consultar datos ni altera otras sesiones.

**RD-14** El cierre debe comprobarse con una consulta posterior que no dé acceso.


### Análisis de escenarios

| **Escenario** | **Servidor disponible** | **Sesión de partida** | **Cierre solicitado** | **Acceso posterior** | **Otras sesiones intactas** |
| --- | --- | --- | --- | --- | --- |
| E-03-V | Sí | Activa | Sí | No | Sí |
| E-03-I1 | Sí | Inexistente | Sí | No | Sí |
| E-03-I2 | Sí | Cerrada | Sí | No | Sí |
| E-03-I3 | No | Activa | Sí | No verificable | Sí |

Se seleccionan E-03-V como escenario válido y E-03-I1 como escenario inválido para las pruebas de aceptación.

| **E-03-V** | **Escenario válido · Prueba PA-03-V** |
| --- | --- |
| **Justificación** | comprueba que la sesión cerrada deja de dar acceso a los datos. |
| **Análisis** | Comprobar otra sesión abierta de la misma cuenta. |
| **Given** | Ana tiene una sesión activa S1 |
| **When** | cierra S1 y vuelve a solicitar sus datos con ese código de sesión |
| **Then** | S1 deja de dar acceso y los datos de Ana se conservan |

| **E-03-I1** | **Escenario inválido · Prueba PA-03-I** |
| --- | --- |
| **Justificación** | el código de sesión no corresponde a una sesión activa y no debe dar acceso. |
| **Análisis** | Repetir el cierre con un código ya cerrado. |
| **Given** | el código de sesión S0 no corresponde a ninguna sesión activa |
| **When** | se solicita cerrar S0 y consultar datos utilizando ese código de sesión |
| **Then** | se rechazan ambas peticiones y las sesiones de otros usuarios se conservan |


## HU-04. Eliminar la cuenta

**Requisito** R1

**Historia** Como usuario quiero eliminar mi cuenta para borrar sus datos asociados.


### Reglas de dominio aplicables

**RD-15** La eliminación de la cuenta requiere confirmar la contraseña correcta.

**RD-16** El borrado debe completarse para la cuenta y todos los datos asociados, incluidos cuenta, sesiones, lugares, vehículos, rutas y preferencias asociados.

**RD-17** La eliminación no debe afectar a los datos de otras cuentas.

**RD-18** Cancelar el diálogo no elimina datos.

**RD-06** Una operación inválida no debe modificar el estado confirmado.


### Análisis de escenarios

| **Escenario** | **Servidor disponible** | **Sesión válida** | **Contraseña correcta** | **Confirmación** | **Borrado** |
| --- | --- | --- | --- | --- | --- |
| E-04-V | Sí | Sí | Sí | Sí | Sí |
| E-04-I1 | Sí | Sí | No | Sí | No |
| E-04-I2 | Sí | No | No aplica | Sí | No |
| E-04-I3 | Sí | Sí | Sí | No | No |
| E-04-I4 | No | No aplica | No aplica | No aplica | No |

Se seleccionan E-04-V como escenario válido y E-04-I1 como escenario inválido para las pruebas de aceptación.

| **E-04-V** | **Escenario válido · Prueba PA-04-V** |
| --- | --- |
| **Justificación** | comprueba que se eliminan la cuenta y todos sus datos asociados. |
| **Análisis** | Repetir con cuenta vacía y con favoritos guardados. |
| **Given** | Ana tiene la contraseña RutaSegura2026, dos lugares, un vehículo y una ruta guardada |
| **When** | confirma la eliminación con RutaSegura2026 |
| **Then** | se eliminan cuenta, sesiones, lugares, vehículo, ruta y preferencias de Ana, sin afectar a otras cuentas |

| **E-04-I1** | **Escenario inválido · Prueba PA-04-I** |
| --- | --- |
| **Justificación** | impide un borrado irreversible sin comprobar la contraseña. |
| **Análisis** | Cancelar y comprobar también que la sesión sigue activa. |
| **Given** | Ana tiene la contraseña RutaSegura2026, dos lugares, un vehículo y una ruta guardada |
| **When** | confirma la eliminación con OtraClave2026 |
| **Then** | se rechaza la operación y permanecen la cuenta y todos sus datos |


## HU-05. Guardar por coordenadas

**Requisito** R2

**Historia** Como usuario quiero dar de alta un lugar mediante coordenadas para usarlo en una ruta.


### Reglas de dominio aplicables

**RD-19** El nombre del lugar debe tener entre 1 y 120 caracteres.

**RD-20** La latitud debe ser finita y estar entre -90 y 90. La longitud debe ser finita y estar entre -180 y 180.

**RD-21** El lugar guardado pertenece al usuario que realiza el alta.

**RD-22** Las coordenadas válidas no garantizan cobertura del proveedor de rutas.

**RD-06** Una operación inválida no debe modificar el estado confirmado.


### Análisis de escenarios

| **Escenario** | **Sesión válida** | **Nombre válido** | **Latitud válida** | **Longitud válida** | **Alta** |
| --- | --- | --- | --- | --- | --- |
| E-05-V | Sí | Sí | Sí | Sí | Sí |
| E-05-I1 | Sí | Sí | No (91) | Sí | No |
| E-05-I2 | Sí | Sí | Sí | No | No |
| E-05-I3 | Sí | No | Sí | Sí | No |
| E-05-I4 | No | Sí | Sí | Sí | No |

Se seleccionan E-05-V como escenario válido y E-05-I1 como escenario inválido para las pruebas de aceptación.

| **E-05-V** | **Escenario válido · Prueba PA-05-V** |
| --- | --- |
| **Justificación** | comprueba el alta directa mediante coordenadas. |
| **Análisis** | Incluir los extremos de latitud y longitud admitidos. |
| **Given** | Ana tiene cero lugares |
| **When** | guarda Centro con latitud 39.9864 y longitud -0.0513 |
| **Then** | aparece un lugar de Ana con ese nombre y esas coordenadas |

| **E-05-I1** | **Escenario inválido · Prueba PA-05-I** |
| --- | --- |
| **Justificación** | evita guardar coordenadas fuera de los límites admitidos. |
| **Análisis** | Probar longitud 181 y valores que no sean números. |
| **Given** | Ana tiene cero lugares |
| **When** | guarda Centro con latitud 91 y longitud -0.0513 |
| **Then** | se rechaza la latitud y la lista sigue vacía |


## HU-06. Guardar por topónimo

**Requisito** R2

**Historia** Como usuario quiero buscar un topónimo y guardar un resultado para identificar un lugar sin conocer sus coordenadas.


### Reglas de dominio aplicables

**RD-23** El topónimo no puede quedar vacío al eliminar espacios. La entrada vacía se rechaza antes de consultar el servicio.

**RD-24** El límite propuesto del topónimo es de 200 caracteres, pendiente de validación.

**RD-25** El usuario debe seleccionar y confirmar un candidato. Nunca se guarda automáticamente el primero.

**RD-26** Solo se guarda el candidato seleccionado con coordenadas válidas.

**RD-19** El nombre del lugar debe tener entre 1 y 120 caracteres.

**RD-06** Una operación inválida no debe modificar el estado confirmado.


### Análisis de escenarios

| **Escenario** | **Sesión válida** | **Topónimo válido** | **Servicio disponible** | **Candidato confirmado** | **Alta** |
| --- | --- | --- | --- | --- | --- |
| E-06-V | Sí | Sí | Sí | Sí | Sí |
| E-06-I1 | Sí | No (espacios) | No aplica | No | No |
| E-06-I2 | Sí | Sí | No | No | No |
| E-06-I3 | Sí | Sí | Sí | No | No |
| E-06-I4 | Sí | No (201 caracteres) | No aplica | No | No |
| E-06-I5 | No | Sí | No aplica | No aplica | No |

Se seleccionan E-06-V como escenario válido y E-06-I1 como escenario inválido para las pruebas de aceptación.

| **E-06-V** | **Escenario válido · Prueba PA-06-V** |
| --- | --- |
| **Justificación** | comprueba la búsqueda y el guardado del candidato elegido, aunque el servicio cambie el orden de resultados. |
| **Análisis** | Elegir entre varios resultados y comprobar sus coordenadas. |
| **Given** | Ana está autenticada y el servicio real de búsqueda de lugares está disponible |
| **When** | busca Universitat Jaume I, Castellón, selecciona un resultado y lo guarda como UJI |
| **Then** | se obtiene al menos un candidato con coordenadas válidas y se guarda el nombre UJI con las coordenadas del resultado seleccionado |

| **E-06-I1** | **Escenario inválido · Prueba PA-06-I** |
| --- | --- |
| **Justificación** | una entrada vacía carece de significado y no debe consumir peticiones. |
| **Análisis** | Repetir con búsqueda vacía, sin resultados y de 201 caracteres. |
| **Given** | Ana tiene cero lugares |
| **When** | solicita buscar un topónimo formado por tres espacios |
| **Then** | se rechaza la búsqueda vacía antes de consultar el servicio y no se guarda ningún lugar |


## HU-07. Consultar lugares

**Requisito** R2

**Historia** Como usuario quiero consultar mis lugares para elegir los que utilizaré.


### Reglas de dominio aplicables

**RD-27** La consulta de lugares requiere una sesión válida.

**RD-28** Cada usuario solo consulta sus propios lugares.

**RD-29** Una lista vacía es un resultado válido y debe mostrar una invitación al alta.

**RD-30** Los nombres repetidos y las búsquedas sin coincidencias no deben confundirse con un error de acceso.


### Análisis de escenarios

| **Escenario** | **Servidor disponible** | **Sesión válida** | **Lugares propios** | **Lugares ajenos** | **Resultado** |
| --- | --- | --- | --- | --- | --- |
| E-07-V | Sí | Sí | Centro y UJI | Estación | Solo Centro y UJI |
| E-07-I1 | Sí | No | Centro y UJI | No aplica | Acceso denegado |
| E-07-V2 | Sí | Sí | Ninguno | Estación | Colección vacía |
| E-07-I2 | No | Sí | No aplica | No aplica | Consulta no disponible |

Se seleccionan E-07-V como escenario válido y E-07-I1 como escenario inválido para las pruebas de aceptación.

| **E-07-V** | **Escenario válido · Prueba PA-07-V** |
| --- | --- |
| **Justificación** | comprueba que cada persona recibe únicamente sus lugares. |
| **Análisis** | Repetir con lista vacía y con lugares favoritos. |
| **Given** | Ana tiene Centro y UJI y Luis tiene Estación |
| **When** | Ana consulta su lista |
| **Then** | se devuelven Centro y UJI y no se devuelve Estación |

| **E-07-I1** | **Escenario inválido · Prueba PA-07-I** |
| --- | --- |
| **Justificación** | evita revelar ubicaciones sin autenticación. |
| **Análisis** | Repetir con sesión cerrada y con sesión caducada. |
| **Given** | no hay sesión válida |
| **When** | se solicita la lista de Ana |
| **Then** | se deniega el acceso y no se muestran lugares |


## HU-08. Eliminar un lugar

**Requisito** R2

**Historia** Como usuario quiero eliminar un lugar propio para mantener actualizada mi lista.


### Reglas de dominio aplicables

**RD-31** Solo se puede eliminar un lugar propio y tras confirmar la operación.

**RD-32** Eliminar un lugar no elimina los restantes lugares del usuario.

**RD-33** El lugar eliminado deja de poder seleccionarse en nuevas rutas. Si era un extremo reciente se limpia esa selección.

**RD-34** Las rutas guardadas conservan su copia histórica. Esta política está pendiente de confirmar con el profesorado.

**RD-06** Una operación inválida no debe modificar el estado confirmado.


### Análisis de escenarios

| **Escenario** | **Sesión válida** | **Lugar existente** | **Lugar propio** | **Confirmación** | **Borrado** |
| --- | --- | --- | --- | --- | --- |
| E-08-V | Sí | Sí | Sí | Sí | Sí |
| E-08-I1 | Sí | Sí | No | Sí | No |
| E-08-I2 | Sí | No | No aplica | Sí | No |
| E-08-I3 | Sí | Sí | Sí | No | No |
| E-08-I4 | No | Sí | Sí | Sí | No |

Se seleccionan E-08-V como escenario válido y E-08-I1 como escenario inválido para las pruebas de aceptación.

| **E-08-V** | **Escenario válido · Prueba PA-08-V** |
| --- | --- |
| **Justificación** | comprueba que la eliminación afecta solo al registro elegido. |
| **Análisis** | Comprobar la cancelación y las rutas históricas del lugar. |
| **Given** | Ana tiene Centro y UJI |
| **When** | confirma eliminar Centro |
| **Then** | solo queda UJI y Centro deja de poder elegirse en nuevas rutas |

| **E-08-I1** | **Escenario inválido · Prueba PA-08-I** |
| --- | --- |
| **Justificación** | impide eliminar un lugar de otra cuenta. |
| **Análisis** | Repetir con un identificador que no exista. |
| **Given** | Estación pertenece a Luis |
| **When** | Ana intenta eliminar Estación |
| **Then** | se rechaza como elemento no disponible y Estación permanece intacta |


## HU-09. Elegir lugares en el mapa

**Requisito** R2

**Historia** Como usuario quiero seleccionar un punto en el mapa y guardarlo para fijar visualmente un origen o un destino.


### Reglas de dominio aplicables

**RD-35** El alta por mapa requiere seleccionar un punto y confirmar el guardado.

**RD-19** El nombre del lugar debe tener entre 1 y 120 caracteres.

**RD-20** La latitud debe ser finita y estar entre -90 y 90. La longitud debe ser finita y estar entre -180 y 180.

**RD-36** Se guarda la posición finalmente seleccionada, aunque el marcador se haya movido.

**RD-37** Cancelar no crea un lugar. El formulario por coordenadas debe ofrecer una alternativa de teclado.

**RD-06** Una operación inválida no debe modificar el estado confirmado.


### Análisis de escenarios

| **Escenario** | **Sesión válida** | **Punto seleccionado** | **Nombre válido** | **Confirmación** | **Alta** |
| --- | --- | --- | --- | --- | --- |
| E-09-V | Sí | Sí | Sí | Sí | Sí |
| E-09-I1 | Sí | No | Sí | Sí | No |
| E-09-I2 | Sí | Sí | No | Sí | No |
| E-09-I3 | Sí | Sí | Sí | No | No |
| E-09-I4 | No | Sí | Sí | Sí | No |

Se seleccionan E-09-V como escenario válido y E-09-I1 como escenario inválido para las pruebas de aceptación.

| **E-09-V** | **Escenario válido · Prueba PA-09-V** |
| --- | --- |
| **Justificación** | comprueba la selección de un punto en el mapa exigida en el enunciado. |
| **Análisis** | Cambiar el punto antes de confirmar el alta. |
| **Given** | Ana visualiza el mapa y tiene cero lugares |
| **When** | selecciona el punto (39.9864,-0.0513), le da el nombre Centro y confirma el alta |
| **Then** | se guarda Centro en esas coordenadas y puede seleccionarse como extremo |

| **E-09-I1** | **Escenario inválido · Prueba PA-09-I** |
| --- | --- |
| **Justificación** | impide guardar un lugar sin haber elegido sus coordenadas. |
| **Análisis** | Repetir cuando falta solo una de las coordenadas. |
| **Given** | Ana abre el alta con nombre Centro y sin coordenadas ni punto seleccionado |
| **When** | intenta guardar el lugar |
| **Then** | se solicita completar las coordenadas y no se crea ningún lugar |


## HU-10. Dar de alta un vehículo

**Requisito** R3

**Historia** Como usuario quiero registrar un vehículo para calcular rutas con su consumo.


### Reglas de dominio aplicables

**RD-38** El tipo de vehículo debe ser gasolina, diésel o eléctrico.

**RD-39** El nombre del vehículo debe tener entre 1 y 70 caracteres.

**RD-40** El consumo propuesto debe estar entre 0,1 y 100, pendiente de validación.

**RD-41** El consumo se expresa en l/100 km para gasolina o diésel y en kWh/100 km para eléctrico.

**RD-42** El vehículo guardado pertenece al usuario que realiza el alta.

**RD-06** Una operación inválida no debe modificar el estado confirmado.


### Análisis de escenarios

| **Escenario** | **Sesión válida** | **Nombre válido** | **Tipo admitido** | **Consumo válido** | **Alta** |
| --- | --- | --- | --- | --- | --- |
| E-10-V | Sí | Sí | Sí | Sí (6,0) | Sí |
| E-10-I1 | Sí | Sí | Sí | No (-1) | No |
| E-10-I2 | Sí | Sí | No | Sí | No |
| E-10-I3 | Sí | No | Sí | Sí | No |
| E-10-I4 | No | Sí | Sí | Sí | No |

Se seleccionan E-10-V como escenario válido y E-10-I1 como escenario inválido para las pruebas de aceptación.

| **E-10-V** | **Escenario válido · Prueba PA-10-V** |
| --- | --- |
| **Justificación** | identifica las unidades necesarias para el coste. |
| **Análisis** | Repetir con diésel y electricidad, comprobando sus unidades. |
| **Given** | Ana no tiene vehículos |
| **When** | registra Compacto, gasolina, consumo 6,0 l/100 km |
| **Then** | se guarda un vehículo propio con esos valores y queda disponible en el planificador |

| **E-10-I1** | **Escenario inválido · Prueba PA-10-I** |
| --- | --- |
| **Justificación** | un consumo negativo produciría estimaciones sin sentido. |
| **Análisis** | Probar consumos de 0, de 0,09 y de 100,01. |
| **Given** | Ana no tiene vehículos |
| **When** | registra Compacto, gasolina, consumo -1 l/100 km |
| **Then** | se rechaza el consumo y la lista permanece vacía |


## HU-11. Consultar vehículos

**Requisito** R3

**Historia** Como usuario quiero consultar mis vehículos para seleccionar el apropiado.


### Reglas de dominio aplicables

**RD-43** La consulta de vehículos requiere una sesión válida.

**RD-44** Cada usuario solo consulta sus propios vehículos, con su tipo y consumo.

**RD-45** Una lista vacía es un resultado válido.

**RD-46** Los vehículos favoritos deben aparecer antes que el resto. Los nombres coincidentes no identifican por sí solos un vehículo.


### Análisis de escenarios

| **Escenario** | **Servidor disponible** | **Sesión válida** | **Vehículos propios** | **Vehículos ajenos** | **Resultado** |
| --- | --- | --- | --- | --- | --- |
| E-11-V | Sí | Sí | Compacto y Eléctrico | Furgoneta | Solo los propios |
| E-11-I1 | Sí | Caducada | Compacto y Eléctrico | No aplica | Acceso denegado |
| E-11-V2 | Sí | Sí | Ninguno | Furgoneta | Colección vacía |
| E-11-I2 | No | Sí | No aplica | No aplica | Consulta no disponible |

Se seleccionan E-11-V como escenario válido y E-11-I1 como escenario inválido para las pruebas de aceptación.

| **E-11-V** | **Escenario válido · Prueba PA-11-V** |
| --- | --- |
| **Justificación** | presenta los datos que permiten distinguir las opciones. |
| **Análisis** | Comprobar nombre, tipo y consumo de cada vehículo. |
| **Given** | Ana tiene Compacto y Eléctrico. Luis tiene Furgoneta |
| **When** | Ana consulta sus vehículos |
| **Then** | recibe Compacto y Eléctrico con tipo y consumo. No recibe Furgoneta |

| **E-11-I1** | **Escenario inválido · Prueba PA-11-I** |
| --- | --- |
| **Justificación** | no expone información desde una sesión caducada. |
| **Análisis** | Repetir con una cuenta que ya haya cerrado sesión. |
| **Given** | la sesión de Ana ha caducado |
| **When** | consulta los vehículos |
| **Then** | se solicita iniciar sesión y no se devuelve la lista |


## HU-12. Eliminar un vehículo

**Requisito** R3

**Historia** Como usuario quiero eliminar un vehículo que ya no utilizo para evitar seleccionarlo.


### Reglas de dominio aplicables

**RD-47** Solo se puede eliminar un vehículo propio y tras confirmar la operación.

**RD-48** Si se elimina el vehículo predeterminado, su referencia debe quedar vacía y la nueva selección debe indicarse.

**RD-49** Las rutas guardadas conservan su copia histórica.

**RD-18** Cancelar el diálogo no elimina datos.

**RD-06** Una operación inválida no debe modificar el estado confirmado.


### Análisis de escenarios

| **Escenario** | **Sesión válida** | **Vehículo propio** | **Confirmación** | **Predeterminado** | **Borrado** |
| --- | --- | --- | --- | --- | --- |
| E-12-V | Sí | Sí | Sí | Sí | Sí. Referencia vacía |
| E-12-I1 | Sí | No | Sí | No aplica | No |
| E-12-I2 | Sí | Sí | No | Sí | No |
| E-12-I3 | No | Sí | Sí | Sí | No |
| E-12-V2 | Sí | Sí | Sí | No | Sí |

Se seleccionan E-12-V como escenario válido y E-12-I1 como escenario inválido para las pruebas de aceptación.

| **E-12-V** | **Escenario válido · Prueba PA-12-V** |
| --- | --- |
| **Justificación** | comprueba también la integridad de las preferencias. |
| **Análisis** | Repetir con un vehículo favorito y uno sin uso. |
| **Given** | Compacto es el vehículo predeterminado de Ana |
| **When** | Ana confirma eliminar Compacto |
| **Then** | se borra el vehículo y la referencia predeterminada queda vacía |

| **E-12-I1** | **Escenario inválido · Prueba PA-12-I** |
| --- | --- |
| **Justificación** | protege vehículos de otros usuarios. |
| **Análisis** | Comprobar que no cambian las preferencias de otras cuentas. |
| **Given** | Furgoneta pertenece a Luis |
| **When** | Ana intenta eliminar Furgoneta |
| **Then** | se rechaza la operación y no cambian ni Furgoneta ni las preferencias de Ana |


## HU-13. Modificar un vehículo

**Requisito** R3

**Historia** Como usuario quiero modificar el nombre, el tipo o el consumo de mi vehículo para mantener sus datos actualizados.


### Reglas de dominio aplicables

**RD-50** Solo se puede modificar un vehículo propio.

**RD-51** La modificación conserva el identificador del vehículo.

**RD-40** El consumo propuesto debe estar entre 0,1 y 100, pendiente de validación.

**RD-52** Cambiar el tipo de vehículo debe actualizar la unidad del consumo.

**RD-53** Las rutas históricas no se recalculan silenciosamente al modificar un vehículo.

**RD-06** Una operación inválida no debe modificar el estado confirmado.


### Análisis de escenarios

| **Escenario** | **Sesión válida** | **Vehículo propio** | **Tipo admitido** | **Consumo válido** | **Modificación** |
| --- | --- | --- | --- | --- | --- |
| E-13-V | Sí | Sí | Sí | Sí (5,5) | Sí |
| E-13-I1 | Sí | Sí | Sí | No (0) | No |
| E-13-I2 | Sí | No | Sí | Sí | No |
| E-13-I3 | Sí | Sí | No | Sí | No |
| E-13-I4 | No | Sí | Sí | Sí | No |

Se seleccionan E-13-V como escenario válido y E-13-I1 como escenario inválido para las pruebas de aceptación.

| **E-13-V** | **Escenario válido · Prueba PA-13-V** |
| --- | --- |
| **Justificación** | conserva la identidad del vehículo al editar. |
| **Análisis** | Repetir cambiando el nombre y el tipo de vehículo. |
| **Given** | Compacto pertenece a Ana y consume 6,0 l/100 km |
| **When** | Ana cambia el consumo a 5,5 y guarda |
| **Then** | se mantiene el identificador y se registra 5,5 para los cálculos posteriores |

| **E-13-I1** | **Escenario inválido · Prueba PA-13-I** |
| --- | --- |
| **Justificación** | comprueba que un consumo inválido no modifica el vehículo. |
| **Análisis** | Repetir con consumo superior a 100 y nombre vacío. |
| **Given** | Compacto pertenece a Ana y tiene un consumo de 6,0 l/100 km |
| **When** | Ana intenta guardar un consumo de 0 l/100 km |
| **Then** | se rechaza la edición y el consumo de Compacto permanece en 6,0 l/100 km |


## HU-14. Calcular y visualizar una ruta

**Requisito** R4

**Historia** Como usuario quiero obtener una ruta entre dos lugares guardados para conocer su trayecto, distancia y duración.


### Reglas de dominio aplicables

**RD-54** Los extremos deben tener coordenadas válidas y distintas. Se admiten lugares propios guardados y puntos elegidos desde Explorar sin guardarlos.

**RD-55** Los modos previstos son a pie, bicicleta y coche. Se puede consultar solo la ruta o estimar su coste con un vehículo propio o una referencia editable.

**RD-56** El cálculo válido devuelve geometría con al menos dos puntos válidos, distancia y duración positivas. El dibujo del trayecto se comprueba por separado en la interfaz.

**RD-57** Un fallo, demora o falta de cobertura del proveedor debe comunicarse sin presentar una ruta nueva como calculada.

**RD-06** Una operación inválida no debe modificar el estado confirmado.


### Análisis de escenarios

| **Escenario** | **Sesión válida** | **Extremos válidos** | **Coordenadas distintas** | **Proveedor disponible** | **Ruta** |
| --- | --- | --- | --- | --- | --- |
| E-14-V | Sí | Sí | Sí | Sí | Sí |
| E-14-I1 | Sí | Sí | No | No aplica | No |
| E-14-I2 | Sí | No | Sí | No aplica | No |
| E-14-I3 | Sí | Sí | Sí | No | No |
| E-14-I4 | No | Sí | Sí | No aplica | No |

Se seleccionan E-14-V como escenario válido y E-14-I1 como escenario inválido para las pruebas de aceptación.

| **E-14-V** | **Escenario válido · Prueba PA-14-V** |
| --- | --- |
| **Justificación** | comprueba que el servicio devuelve un trayecto y unas medidas coherentes. |
| **Análisis** | Repetir en coche y bicicleta, con lugares guardados y puntos directos. |
| **Given** | Ana tiene Centro (39.9864,-0.0513) y UJI (39.9946,-0.0684), y el servicio real está disponible |
| **When** | calcula la ruta a pie entre Centro y UJI |
| **Then** | se devuelve una geometría con al menos dos puntos válidos, distancia positiva menor de 100 km y duración positiva |

| **E-14-I1** | **Escenario inválido · Prueba PA-14-I** |
| --- | --- |
| **Justificación** | detecta una combinación de entradas incompatible con el trayecto definido. |
| **Análisis** | Repetir con lugares no guardados o con coordenadas iguales. |
| **Given** | Ana tiene Centro |
| **When** | solicita una ruta de Centro a Centro |
| **Then** | se rechaza por extremos coincidentes y no se devuelve ni guarda una ruta nueva |


## HU-15. Estimar coste de combustible

**Requisito** R4

**Historia** Como usuario quiero conocer el coste de combustible para comparar el gasto de mi desplazamiento.


### Reglas de dominio aplicables

**RD-58** El coste de combustible se calcula como distancia/100 \(\times\) consumo \(\times\) precio, con km, l/100 km y €/l.

**RD-59** La estimación se aplica a gasolina o diésel, con una ruta y un vehículo adecuados.

**RD-60** El intervalo propuesto para el precio manual es de 0,001 a 20 €/l, pendiente de validación.

**RD-61** Debe indicarse el origen manual del precio o la fuente y fecha del precio público.

**RD-62** Sin precio fiable se muestra el coste como no disponible. Se conserva la precisión y se redondea al presentar.

**RD-06** Una operación inválida no debe modificar el estado confirmado.


### Análisis de escenarios

| **Escenario** | **Ruta disponible** | **Vehículo de combustible** | **Precio válido** | **Fuente identificada** | **Resultado** |
| --- | --- | --- | --- | --- | --- |
| E-15-V | Sí, distancia d | Sí, 6 l/100 km | Sí, 1,60 €/l | Sí | d/100 por 6 por 1,60 |
| E-15-I1 | No aplica | Sí | No (-1 €/l) | Manual | Rechazo. Precio anterior |
| E-15-I2 | No | Sí | Sí | Sí | Sin estimación |
| E-15-I3 | Sí | No | Sí | Sí | No aplica |
| E-15-I4 | Sí | Sí | No disponible | No | Coste no disponible |

Se seleccionan E-15-V como escenario válido y E-15-I1 como escenario inválido para las pruebas de aceptación.

| **E-15-V** | **Escenario válido · Prueba PA-15-V** |
| --- | --- |
| **Justificación** | usa la distancia real obtenida y un precio configurado para verificar el cálculo sin exigir una ruta de longitud fija. |
| **Análisis** | Repetir con diésel y revisar el redondeo final. |
| **Given** | Ana tiene Centro y UJI, Compacto con consumo de 6 l/100 km y precio manual de gasolina de 1,60 €/l |
| **When** | calcula una ruta en coche entre Centro y UJI con el servicio de rutas disponible |
| **Then** | el coste devuelto es (distancia en km / 100 × 6 × 1,60) € redondeado a céntimos, con el origen manual del precio |

| **E-15-I1** | **Escenario inválido · Prueba PA-15-I** |
| --- | --- |
| **Justificación** | evita guardar un precio negativo. |
| **Análisis** | Probar también los límites de 0,001 y 20 euros por litro. |
| **Given** | Ana tiene Compacto con consumo de 6 l/100 km y precio manual de gasolina de 1,60 euros por litro |
| **When** | intenta fijar un precio de -1 euro por litro |
| **Then** | se rechaza el precio y el valor guardado permanece en 1,60 euros por litro |


## HU-16. Estimar coste eléctrico

**Requisito** R4

**Historia** Como usuario de un vehículo eléctrico quiero conocer el coste energético de una ruta para prever el gasto.


### Reglas de dominio aplicables

**RD-63** El coste eléctrico se calcula como distancia/100 \(\times\) consumo \(\times\) precio, con km, kWh/100 km y €/kWh.

**RD-64** La estimación requiere una ruta y un vehículo eléctrico.

**RD-65** El intervalo propuesto para el precio manual es de 0,001 a 20 €/kWh, pendiente de validación. Admitir tarifa gratuita es una decisión pendiente del cliente.

**RD-66** Un precio recibido en €/MWh debe dividirse entre 1000 para expresarlo en €/kWh.

**RD-67** Debe mostrarse el origen del precio y su unidad. El precio mayorista no equivale a la factura final.

**RD-06** Una operación inválida no debe modificar el estado confirmado.


### Análisis de escenarios

| **Escenario** | **Ruta disponible** | **Vehículo eléctrico** | **Precio válido** | **Unidad normalizada** | **Resultado** |
| --- | --- | --- | --- | --- | --- |
| E-16-V | Sí, distancia d | Sí, 15 kWh/100 km | Sí, 0,20 €/kWh | Sí | d/100 por 15 por 0,20 |
| E-16-I1 | No aplica | No aplica | No (0 €/kWh) | Sí | Rechazo. Precio anterior |
| E-16-V2 | Sí (100 km) | Sí (15 kWh/100 km) | Sí (200 €/MWh) | Convertir a €/kWh | 3,00 € |
| E-16-I2 | No | Sí | Sí | Sí | Sin estimación |
| E-16-I3 | Sí | No | Sí | Sí | No aplica |

Se seleccionan E-16-V como escenario válido y E-16-I1 como escenario inválido para las pruebas de aceptación.

| **E-16-V** | **Escenario válido · Prueba PA-16-V** |
| --- | --- |
| **Justificación** | comprueba el cálculo en kWh y evita confundir las unidades del consumo y del precio. |
| **Análisis** | Revisar la conversión de euros por MWh a euros por kWh. |
| **Given** | Ana tiene Centro y UJI, Eléctrico con consumo de 15 kWh/100 km y precio manual de 0,20 €/kWh |
| **When** | calcula una ruta con Eléctrico entre Centro y UJI y el servicio de rutas está disponible |
| **Then** | el coste devuelto es (distancia en km / 100 × 15 × 0,20) € redondeado a céntimos, con el origen manual del precio |

| **E-16-I1** | **Escenario inválido · Prueba PA-16-I** |
| --- | --- |
| **Justificación** | comprueba el mínimo positivo propuesto para el precio manual. |
| **Análisis** | Probar también un precio negativo y uno superior a 20 euros por kWh. |
| **Given** | Ana tiene Eléctrico y un precio manual de 0,20 euros por kWh |
| **When** | intenta guardar un precio de 0 euros por kWh |
| **Then** | se rechaza el precio y se conserva el valor de 0,20 euros por kWh |


## HU-17. Estimar calorías

**Requisito** R4

**Historia** Como usuario quiero estimar las calorías de una ruta a pie o en bicicleta para valorar el esfuerzo.


### Reglas de dominio aplicables

**RD-68** Las calorías se estiman como MET \(\times\) 3.5 \(\times\) peso/200 \(\times\) minutos.

**RD-69** Los MET propuestos son 3,5 a pie y 6,8 en bicicleta, pendientes de validación.

**RD-70** El peso propuesto debe estar entre 20 y 300 kg, pendiente de validación.

**RD-71** La duración se expresa en minutos. Se conserva la precisión y se redondea al presentar.

**RD-72** El resultado se identifica como estimación, no como medición fisiológica individual.

**RD-06** Una operación inválida no debe modificar el estado confirmado.


### Análisis de escenarios

| **Escenario** | **Ruta disponible** | **Modo** | **Peso válido** | **Duración válida** | **Resultado** |
| --- | --- | --- | --- | --- | --- |
| E-17-V | Sí | A pie | Sí, 70 kg | Sí, duración t | 3,5 por 3,5 por 70/200 por t |
| E-17-I1 | No aplica | No aplica | No (0 kg) | No aplica | Rechazo. Peso anterior |
| E-17-V2 | Sí | Bicicleta | Sí (70 kg) | Sí (30 min) | 249,9 kcal |
| E-17-I2 | No | A pie | Sí | No aplica | Sin estimación |
| E-17-I3 | Sí | Coche | Sí | Sí | No aplica |

Se seleccionan E-17-V como escenario válido y E-17-I1 como escenario inválido para las pruebas de aceptación.

| **E-17-V** | **Escenario válido · Prueba PA-17-V** |
| --- | --- |
| **Justificación** | comprueba las calorías a partir de la duración real obtenida y del peso configurado. |
| **Análisis** | Repetir en bicicleta y con los pesos extremos admitidos. |
| **Given** | Ana tiene Centro y UJI guardados, pesa 70 kg y el servicio de rutas está disponible |
| **When** | calcula una ruta a pie entre Centro y UJI |
| **Then** | se devuelven kcal estimadas con 3,5 × 3,5 × 70 / 200 × duración en minutos, redondeadas al entero más próximo |

| **E-17-I1** | **Escenario inválido · Prueba PA-17-I** |
| --- | --- |
| **Justificación** | un peso de cero no permite una estimación válida. |
| **Análisis** | Probar 19,99 y 300,01 kg y conservar el peso anterior. |
| **Given** | Ana tiene Centro y UJI guardados, peso configurado de 70 kg y el servicio de rutas disponible |
| **When** | intenta guardar un peso de 0 kg para calcular las calorías del trayecto |
| **Then** | se rechaza el valor y permanece el peso de 70 kg |


## HU-18. Elegir el criterio de ruta

**Requisito** R4

**Historia** Como usuario quiero priorizar duración, distancia o coste para escoger una alternativa adecuada.


### Reglas de dominio aplicables

**RD-73** Los criterios admitidos son más rápida, más corta y más económica.

**RD-74** El criterio se aplica a las alternativas realmente recibidas, sin afirmar una optimización global.

**RD-75** En coche, más económica requiere vehículo y precio. Si faltan, se avisa y se ordena por distancia sin afirmar un coste menor. A pie y en bicicleta el coste monetario es cero.

**RD-76** Los empates deben resolverse con un orden estable. Con una sola alternativa se evalúa esa opción.

**RD-77** Un criterio desconocido se rechaza antes de consultar rutas y sin cambiar preferencias.

**RD-06** Una operación inválida no debe modificar el estado confirmado.


### Análisis de escenarios

| **Escenario** | **Extremos válidos** | **Criterio admitido** | **Alternativas disponibles** | **Precio para coste** | **Resultado** |
| --- | --- | --- | --- | --- | --- |
| E-18-V | Sí | Más económica | Sí | Sí | Menor coste recibido |
| E-18-I1 | Sí | No (panorámica) | No aplica | No aplica | Rechazo sin consulta |
| E-18-I2 | Sí | Más económica | Sí | No | Coste no disponible |
| E-18-I3 | Sí | Sí | No | No aplica | Sin alternativa |
| E-18-V2 | Sí | Más rápida | Una | No necesario | Única alternativa |

Se seleccionan E-18-V como escenario válido y E-18-I1 como escenario inválido para las pruebas de aceptación.

| **E-18-V** | **Escenario válido · Prueba PA-18-V** |
| --- | --- |
| **Justificación** | compara los costes de las alternativas recibidas, sin suponer un recorrido fijo. |
| **Análisis** | Repetir con rapidez, distancia y alternativas empatadas. |
| **Given** | Ana tiene Centro, UJI y Compacto con consumo de 6 l/100 km, usa gasolina manual a 1,60 €/l y ORS está disponible |
| **When** | solicita una ruta en coche entre Centro y UJI con el criterio más económico |
| **Then** | la primera opción tiene coste menor o igual que cada alternativa obtenida y se muestra el origen del precio |

| **E-18-I1** | **Escenario inválido · Prueba PA-18-I** |
| --- | --- |
| **Justificación** | impide calcular una ruta con un criterio que no está admitido. |
| **Análisis** | Repetir con criterio vacío y comprobar que no se consulta ORS. |
| **Given** | Ana tiene Centro y UJI |
| **When** | solicita el criterio desconocido panorámica |
| **Then** | se rechaza el criterio sin consultar rutas ni cambiar preferencias |


## HU-19. Guardar una ruta

**Requisito** R4

**Historia** Como usuario quiero guardar una ruta calculada para consultarla posteriormente.


### Reglas de dominio aplicables

**RD-78** Solo se puede guardar un resultado calculado asociado a la sesión del usuario.

**RD-79** El nombre de una ruta admite de 1 a 120 caracteres y no puede estar vacío.

**RD-80** El guardado conserva nombre, geometría, distancia, duración y datos del cálculo, incluida la fecha y la fuente del precio cuando exista.

**RD-81** Una ruta guardada es una copia histórica. No se afirma persistencia de resultados que no se hayan guardado.

**RD-06** Una operación inválida no debe modificar el estado confirmado.


### Análisis de escenarios

| **Escenario** | **Sesión válida** | **Resultado calculado** | **Resultado propio** | **Nombre válido** | **Guardado** |
| --- | --- | --- | --- | --- | --- |
| E-19-V | Sí | Sí | Sí | Sí | Sí |
| E-19-I1 | Sí | No (X99 inventado) | No aplica | Sí | No |
| E-19-I2 | Sí | Sí | No | Sí | No |
| E-19-I3 | Sí | Sí | Sí | No | No |
| E-19-I4 | No | Sí | Sí | Sí | No |

Se seleccionan E-19-V como escenario válido y E-19-I1 como escenario inválido para las pruebas de aceptación.

| **E-19-V** | **Escenario válido · Prueba PA-19-V** |
| --- | --- |
| **Justificación** | comprueba que una ruta calculada puede guardarse para otro momento. |
| **Análisis** | Recuperar y comparar el trazado, las medidas y la fecha. |
| **Given** | Ana tiene un resultado real entre Centro y UJI calculado para su cuenta hace menos de una hora |
| **When** | lo guarda con el nombre Camino a clase |
| **Then** | se crea una ruta propia con ese nombre, geometría, métricas y fecha de cálculo, recuperable en su listado |

| **E-19-I1** | **Escenario inválido · Prueba PA-19-I** |
| --- | --- |
| **Justificación** | impide guardar un resultado que no se ha calculado para esa cuenta. |
| **Análisis** | Repetir con resultado caducado y de otra cuenta. |
| **Given** | Ana no tiene un resultado calculado con identificador X99 para su cuenta |
| **When** | intenta guardar el resultado X99 como Camino a clase |
| **Then** | se rechaza el guardado y la lista de rutas no cambia |


## HU-20. Consultar rutas guardadas

**Requisito** R4

**Historia** Como usuario quiero consultar mis rutas guardadas para recuperar un trayecto sin volver a calcularlo.


### Reglas de dominio aplicables

**RD-82** La consulta de rutas guardadas requiere una sesión válida y solo muestra rutas propias.

**RD-83** Consultar recupera la misma geometría y métricas históricas, sin recalcularlas.

**RD-45** Una lista vacía es un resultado válido.

**RD-84** La indisponibilidad del proveedor de rutas no debe impedir leer una copia almacenada localmente.

**RD-85** El precio histórico debe identificarse como tal aunque esté desactualizado.


### Análisis de escenarios

| **Escenario** | **Sesión válida** | **Ruta propia guardada** | **Almacenamiento disponible** | **Proveedor de rutas disponible** | **Resultado** |
| --- | --- | --- | --- | --- | --- |
| E-20-V | Sí | Sí | Sí | Sí | Instantánea histórica |
| E-20-I1 | No | Sí | Sí | No aplica | Acceso denegado |
| E-20-I2 | Sí | No. Es ajena | Sí | No aplica | Ruta no disponible |
| E-20-V2 | Sí | Sí | Sí | No | Instantánea histórica |
| E-20-V3 | Sí | Colección vacía | Sí | No aplica | Lista vacía |
| E-20-I3 | Sí | Sí | No | No aplica | Fallo de almacenamiento |

Se seleccionan E-20-V como escenario válido y E-20-I1 como escenario inválido para las pruebas de aceptación.

| **E-20-V** | **Escenario válido · Prueba PA-20-V** |
| --- | --- |
| **Justificación** | diferencia recuperar de recalcular con datos nuevos. |
| **Análisis** | Repetir sin conexión con el servicio de rutas. |
| **Given** | Ana tiene Camino a clase guardada con su geometría y sus métricas |
| **When** | abre su lista y selecciona Camino a clase |
| **Then** | recupera la misma geometría y las mismas métricas, identificadas como cálculo histórico |

| **E-20-I1** | **Escenario inválido · Prueba PA-20-I** |
| --- | --- |
| **Justificación** | protege el historial de desplazamientos. |
| **Análisis** | Repetir con sesión caducada sin revelar ningún trayecto. |
| **Given** | no hay sesión válida |
| **When** | se solicita el listado de rutas guardadas |
| **Then** | se deniega el acceso sin revelar nombres ni trayectos |


## HU-21. Eliminar una ruta guardada

**Requisito** R4

**Historia** Como usuario quiero eliminar una ruta que no necesito para ordenar mi historial.


### Reglas de dominio aplicables

**RD-86** Solo se puede eliminar una ruta guardada propia y tras confirmar la operación.

**RD-87** Eliminar una ruta no modifica los lugares ni vehículos utilizados para calcularla.

**RD-88** Cancelar conserva la ruta. La lista debe actualizarse tras confirmar el borrado.

**RD-06** Una operación inválida no debe modificar el estado confirmado.


### Análisis de escenarios

| **Escenario** | **Sesión válida** | **Ruta existente** | **Ruta propia** | **Confirmación** | **Borrado** |
| --- | --- | --- | --- | --- | --- |
| E-21-V | Sí | Sí | Sí | Sí | Sí |
| E-21-I1 | Sí | Sí | No | Sí | No |
| E-21-I2 | Sí | No | No aplica | Sí | No |
| E-21-I3 | Sí | Sí | Sí | No | No |
| E-21-I4 | No | Sí | Sí | Sí | No |

Se seleccionan E-21-V como escenario válido y E-21-I1 como escenario inválido para las pruebas de aceptación.

| **E-21-V** | **Escenario válido · Prueba PA-21-V** |
| --- | --- |
| **Justificación** | delimita el efecto de la eliminación al historial. |
| **Análisis** | Repetir con ruta favorita y con cancelación del borrado. |
| **Given** | Ana tiene Camino a clase y Paseo |
| **When** | confirma eliminar Camino a clase |
| **Then** | solo permanece Paseo y no se alteran sus lugares ni vehículos |

| **E-21-I1** | **Escenario inválido · Prueba PA-21-I** |
| --- | --- |
| **Justificación** | impide borrar datos de otra cuenta. |
| **Análisis** | Repetir con una ruta inexistente y conservar las demás. |
| **Given** | Camino al trabajo pertenece a Luis |
| **When** | Ana intenta eliminar esa ruta |
| **Then** | se rechaza la operación y la ruta de Luis permanece |


## HU-22. Gestionar favoritos

**Requisito** R5

**Historia** Como usuario quiero marcar y desmarcar favoritos para encontrar primero los elementos que uso con frecuencia.


### Reglas de dominio aplicables

**RD-89** Se pueden marcar y desmarcar favoritos en las listas de lugares, vehículos y rutas.

**RD-90** Solo se pueden modificar las marcas de elementos propios.

**RD-91** Los favoritos aparecen antes que los no favoritos y mantienen un orden secundario estable.

**RD-92** Las marcas deben conservarse al recargar. Todos o ninguno de los elementos pueden ser favoritos.

**RD-93** La estrella debe tener etiqueta accesible y un estado perceptible sin depender del color.

**RD-06** Una operación inválida no debe modificar el estado confirmado.


### Análisis de escenarios

| **Escenario** | **Sesión válida** | **Elemento existente** | **Elemento propio** | **Acción** | **Resultado** |
| --- | --- | --- | --- | --- | --- |
| E-22-V | Sí | Sí | Sí | Marcar en las tres listas | Favoritos primero. Persisten |
| E-22-I1 | Sí | Sí | No | Cambiar marca | Rechazo. Marca intacta |
| E-22-V2 | Sí | Sí | Sí | Desmarcar | Pierde prioridad de favorito |
| E-22-I2 | Sí | No | No aplica | Cambiar marca | Sin modificación |
| E-22-I3 | No | Sí | Sí | Cambiar marca | Acceso denegado |

Se seleccionan E-22-V como escenario válido y E-22-I1 como escenario inválido para las pruebas de aceptación.

| **E-22-V** | **Escenario válido · Prueba PA-22-V** |
| --- | --- |
| **Justificación** | comprueba la misma regla de favoritos en lugares, vehículos y rutas. |
| **Análisis** | Desmarcar cada favorito y volver a consultar las listas. |
| **Given** | Ana tiene sin marcar Centro y UJI, Compacto y Eléctrico, y Camino a clase y Paseo |
| **When** | marca UJI, Eléctrico y Paseo como favoritos y vuelve a consultar las tres listas |
| **Then** | cada elemento marcado conserva su estado y aparece antes que el no favorito de su lista |

| **E-22-I1** | **Escenario inválido · Prueba PA-22-I** |
| --- | --- |
| **Justificación** | impide cambiar los favoritos de otra cuenta en las tres listas. |
| **Análisis** | Repetir por separado para lugar, vehículo y ruta. |
| **Given** | Estación, Furgoneta y Camino al trabajo pertenecen a Luis |
| **When** | Ana intenta cambiar el favorito de cada uno |
| **Then** | cada operación se rechaza y todas las marcas de Luis permanecen intactas |


## HU-23. Fijar transporte predeterminado

**Requisito** R5

**Historia** Como usuario quiero fijar un modo y, si procede, un vehículo por defecto para preparar rutas con menos pasos.


### Reglas de dominio aplicables

**RD-55** Los modos previstos son a pie, bicicleta y coche. Se puede consultar solo la ruta o estimar su coste con un vehículo propio o una referencia editable.

**RD-94** Si se fija un vehículo predeterminado para el modo coche, debe pertenecer al usuario.

**RD-95** Los modos a pie y bicicleta no requieren vehículo.

**RD-96** Los valores predeterminados se aplican a una planificación nueva, permitiendo una selección puntual distinta.

**RD-97** Eliminar el vehículo predeterminado limpia su referencia. El valor por defecto se distingue de restaurar el último trayecto.

**RD-06** Una operación inválida no debe modificar el estado confirmado.


### Análisis de escenarios

| **Escenario** | **Sesión válida** | **Modo admitido** | **Vehículo propio si procede** | **Guardado** | **Resultado** |
| --- | --- | --- | --- | --- | --- |
| E-23-V | Sí | Coche | Sí (Compacto) | Sí | Coche y Compacto por defecto |
| E-23-I1 | Sí | Coche | No (Furgoneta ajena) | No | Conserva Compacto |
| E-23-V2 | Sí | A pie | No necesario | Sí | A pie sin vehículo |
| E-23-I2 | Sí | No | No aplica | No | Conserva preferencia |
| E-23-I3 | No | Coche | Sí | No | Acceso denegado |

Se seleccionan E-23-V como escenario válido y E-23-I1 como escenario inválido para las pruebas de aceptación.

| **E-23-V** | **Escenario válido · Prueba PA-23-V** |
| --- | --- |
| **Justificación** | reduce trabajo repetitivo sin bloquear la elección puntual. |
| **Análisis** | Repetir con bicicleta y a pie, sin vehículo asociado. |
| **Given** | Compacto pertenece a Ana |
| **When** | guarda coche y Compacto como valores predeterminados y abre una planificación nueva |
| **Then** | se seleccionan coche y Compacto, permitiendo cambiarlos para esa consulta |

| **E-23-I1** | **Escenario inválido · Prueba PA-23-I** |
| --- | --- |
| **Justificación** | impide referencias a vehículos ajenos. |
| **Análisis** | Repetir con un vehículo eliminado. |
| **Given** | Furgoneta pertenece a Luis y Compacto es el vehículo predeterminado de Ana |
| **When** | Ana intenta establecer Furgoneta como predeterminada |
| **Then** | se rechaza la referencia y permanece Compacto |


## HU-24. Fijar criterio predeterminado

**Requisito** R5

**Historia** Como usuario quiero guardar un criterio de ruta por defecto para no repetir mi preferencia.


### Reglas de dominio aplicables

**RD-73** Los criterios admitidos son más rápida, más corta y más económica.

**RD-98** El criterio guardado debe aparecer como valor inicial al abrir una planificación nueva.

**RD-99** Una selección puntual no sobrescribe el criterio predeterminado.

**RD-06** Una operación inválida no debe modificar el estado confirmado.


### Análisis de escenarios

| **Escenario** | **Servidor disponible** | **Sesión válida** | **Criterio admitido** | **Guardar preferencia** | **Resultado** |
| --- | --- | --- | --- | --- | --- |
| E-24-V | Sí | Sí | Más corta | Sí | Más corta por defecto |
| E-24-I1 | Sí | Sí | No (panorámica) | Sí | Conserva más corta |
| E-24-V2 | Sí | Sí | Más económica | Sí | Más económica por defecto |
| E-24-I2 | Sí | No | Sí | Sí | Acceso denegado |
| E-24-I3 | No | Sí | Sí | Sí | Sin guardado confirmado |

Se seleccionan E-24-V como escenario válido y E-24-I1 como escenario inválido para las pruebas de aceptación.

| **E-24-V** | **Escenario válido · Prueba PA-24-V** |
| --- | --- |
| **Justificación** | comprueba el efecto posterior de guardar, además de la notificación. |
| **Análisis** | Repetir con las tres opciones de criterio admitidas. |
| **Given** | Ana tiene más rápida como criterio predeterminado |
| **When** | guarda más corta y abre una planificación nueva |
| **Then** | aparece más corta como criterio inicial y la preferencia se conserva |

| **E-24-I1** | **Escenario inválido · Prueba PA-24-I** |
| --- | --- |
| **Justificación** | comprueba que un criterio desconocido no cambia la preferencia guardada. |
| **Análisis** | Comprobar que las demás preferencias tampoco cambian. |
| **Given** | Ana tiene más corta como criterio predeterminado |
| **When** | intenta guardar panorámica como criterio |
| **Then** | se rechaza el valor y se conserva más corta |


## HU-25. Recuperar estado tras un cierre

**Requisito** R6

**Historia** Como usuario quiero recuperar contenidos y aspecto al volver a abrir la aplicación para evitar reconfigurarla.


### Reglas de dominio aplicables

**RD-100** Tras un cierre normal deben recuperarse los contenidos confirmados con sus identificadores, favoritos, tema y selección del último trayecto.

**RD-101** La comprobación de persistencia utiliza almacenamiento en disco y un nuevo proceso.

**RD-102** Una sesión caducada requiere volver a iniciar sesión.

**RD-103** Un fallo de almacenamiento debe mostrarse como error, sin sustituir los datos por una lista vacía.

**RD-104** La recuperación de borradores y resultados no guardados está pendiente de aclarar con el profesorado y no se acredita con el prototipo.


### Análisis de escenarios

| **Escenario** | **Datos confirmados** | **Cierre normal** | **Almacenamiento disponible** | **Sesión válida al consultar** | **Resultado** |
| --- | --- | --- | --- | --- | --- |
| E-25-V | Sí | Sí | Sí | Sí. Tras iniciar sesión | Estado recuperado |
| E-25-I1 | Sí | Sí | No | No aplica | Error. No lista vacía ficticia |
| E-25-I2 | Sí | Sí | Sí | No. Caducada | Solicitar acceso |
| E-25-V2 | Listas vacías guardadas | Sí | Sí | Sí | Estado vacío real |

Se seleccionan E-25-V como escenario válido y E-25-I1 como escenario inválido para las pruebas de aceptación.

| **E-25-V** | **Escenario válido · Prueba PA-25-V** |
| --- | --- |
| **Justificación** | comprueba la conservación del estado confirmado al cerrar y volver a abrir la aplicación. |
| **Análisis** | Comparar las tres listas y todas las preferencias guardadas. |
| **Given** | Ana ha guardado Centro, UJI, Compacto y Camino a clase, ha marcado UJI como favorito y usa tema oscuro y el último trayecto Centro-UJI a pie con criterio más corta |
| **When** | cierra la aplicación y vuelve a abrirla sobre la misma base de datos, iniciando sesión si es necesario |
| **Then** | recupera los mismos registros, favoritos, tema y selección del último trayecto |

| **E-25-I1** | **Escenario inválido · Prueba PA-25-I** |
| --- | --- |
| **Justificación** | un fallo de almacenamiento debe comunicarse sin mostrar datos vacíos como si fueran reales. |
| **Análisis** | Repetir con base inaccesible al arrancar el servidor. |
| **Given** | Ana tiene Centro, Compacto y Camino a clase guardados, pero el almacenamiento no se puede abrir |
| **When** | intenta iniciar la aplicación |
| **Then** | se informa del fallo de almacenamiento y no se presenta una lista vacía como si fuera su estado real |


## HU-26. Recuperar estado tras interrupción

**Requisito** R6

**Historia** Como usuario quiero conservar los datos confirmados tras un cierre involuntario para no perder el trabajo guardado.


### Reglas de dominio aplicables

**RD-105** Tras una interrupción de proceso deben conservarse íntegros los datos cuya escritura ya se haya confirmado.

**RD-106** Las escrituras se aplican completas o no se aplican. Una transacción interrumpida antes del COMMIT no debe producir un alta parcial.

**RD-107** La recuperación se comprueba reabriendo la misma base de datos en disco desde otro proceso.

**RD-108** La caída de proceso no acredita recuperación ante corte eléctrico o daño físico del disco.


### Análisis de escenarios

| **Escenario** | **Centro confirmado** | **Alta de UJI** | **Momento de interrupción** | **Base reabierta** | **Resultado** |
| --- | --- | --- | --- | --- | --- |
| E-26-V | Sí | No iniciada | Después del COMMIT de Centro | Sí | Centro íntegro, sin duplicados |
| E-26-I1 | Sí | Sin COMMIT | Antes del COMMIT de UJI | Sí | Centro sí. UJI no |
| E-26-V2 | Sí | Confirmada | Después del COMMIT de UJI | Sí | Centro y UJI íntegros |
| E-26-I2 | Sí | No aplica | Caída de proceso | No disponible | Error. Recuperación no comprobable |

Se seleccionan E-26-V como escenario válido y E-26-I1 como escenario inválido para las pruebas de aceptación.

| **E-26-V** | **Escenario válido · Prueba PA-26-V** |
| --- | --- |
| **Justificación** | comprueba que una interrupción no borra un dato ya guardado. |
| **Análisis** | Reabrir la base en otro proceso y comprobar duplicados. |
| **Given** | el servidor ha confirmado el alta de Centro en una base de datos en disco |
| **When** | se fuerza el cierre del proceso con SIGKILL y se abre otro sobre la misma base |
| **Then** | Centro permanece íntegro y se puede consultar sin duplicados |

| **E-26-I1** | **Escenario inválido · Prueba PA-26-I** |
| --- | --- |
| **Justificación** | el guardado interrumpido no puede considerarse terminado ni dejar datos parciales. |
| **Análisis** | Interrumpir antes de confirmar y comprobar los datos anteriores. |
| **Given** | Centro está confirmado y una transacción ha escrito UJI, pero aún no ha ejecutado COMMIT |
| **When** | el proceso se interrumpe antes del COMMIT y después se abre la misma base de datos |
| **Then** | Centro se conserva y UJI no aparece como alta confirmada. No hay datos parciales |

% Contenido de la segunda pestaña del documento de Drive.
