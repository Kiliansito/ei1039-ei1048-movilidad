# Historias, escenarios y aceptación

## HU-01. Registrar una cuenta

**Requisito** R1

**Historia** Como persona no registrada quiero crear una cuenta para utilizar los servicios de movilidad.

| **Escenario** | **Entrada o condición** | **Resultado** |
| --- | --- | --- |
| E-01-V | Datos válidos, correo nuevo | Cuenta creada |
| E-01-I1 | Correo ya registrado | Alta rechazada |
| E-01-I2 | Contraseña de 9 caracteres | Alta rechazada |

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

| **Escenario** | **Entrada o condición** | **Resultado** |
| --- | --- | --- |
| E-02-V | Credenciales correctas | Sesión iniciada |
| E-02-I1 | Contraseña incorrecta | Acceso rechazado |
| E-02-I2 | Campos vacíos | Acceso rechazado |

| **E-02-V** | **Escenario válido · Prueba PA-02-V** |
| --- | --- |
| **Justificación** | comprueba que el acceso corresponde a la cuenta indicada. |
| **Análisis** | Comprobar correo y contraseña correctos e incorrectos. |
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

| **Escenario** | **Entrada o condición** | **Resultado** |
| --- | --- | --- |
| E-03-V | Sesión activa | Sesión cerrada, datos conservados |
| E-03-I1 | Sesión ya cerrada | Cierre rechazado |
| E-03-V2 | Volver a acceder con credenciales correctas | Nueva sesión |

| **E-03-V** | **Escenario válido · Prueba PA-03-V** |
| --- | --- |
| **Justificación** | comprueba que la sesión cerrada deja de dar acceso a los datos. |
| **Análisis** | Comprobar otra sesión abierta de la misma cuenta. |
| **Given** | Ana tiene una sesión activa S1 |
| **When** | cierra S1 y vuelve a solicitar sus datos con ese código de sesión |
| **Then** | S1 deja de dar acceso y los datos de Ana se conservan |

| **E-03-I1** | **Escenario inválido · Prueba PA-03-I** |
| --- | --- |
| **Justificación** | no se puede cerrar una sesión que ya está cerrada. |
| **Análisis** | Comprobar que los datos guardados se conservan. |
| **Given** | Ana ha cerrado su sesión S1 |
| **When** | intenta cerrar S1 de nuevo |
| **Then** | se informa de que la sesión no está activa y sus datos se conservan |


## HU-04. Eliminar la cuenta

**Requisito** R1

**Historia** Como usuario quiero eliminar mi cuenta para borrar sus datos asociados.

| **Escenario** | **Entrada o condición** | **Resultado** |
| --- | --- | --- |
| E-04-V | Contraseña y confirmación correctas | Cuenta y datos eliminados |
| E-04-I1 | Contraseña incorrecta | Datos conservados |
| E-04-V2 | Cancelar la eliminación | Datos conservados |

| **E-04-V** | **Escenario válido · Prueba PA-04-V** |
| --- | --- |
| **Justificación** | comprueba que se eliminan la cuenta y todos sus datos asociados. |
| **Análisis** | Repetir con cuenta vacía y con favoritos guardados. |
| **Given** | Ana tiene la contraseña RutaSegura2026, dos lugares, un vehículo y una ruta guardada |
| **When** | confirma la eliminación con RutaSegura2026 |
| **Then** | se eliminan cuenta, sesiones, lugares, vehículo, ruta y preferencias de Ana |

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

| **Escenario** | **Entrada o condición** | **Resultado** |
| --- | --- | --- |
| E-05-V | Nombre y coordenadas válidos | Lugar guardado |
| E-05-I1 | Latitud 91 | Lugar no guardado |
| E-05-I2 | Longitud 181 | Lugar no guardado |

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

| **Escenario** | **Entrada o condición** | **Resultado** |
| --- | --- | --- |
| E-06-V | Búsqueda con candidato seleccionado | Candidato guardado |
| E-06-I1 | Topónimo de tres espacios | Búsqueda rechazada |
| E-06-V2 | Búsqueda sin coincidencias | Lista vacía, sin alta |

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

| **Escenario** | **Entrada o condición** | **Resultado** |
| --- | --- | --- |
| E-07-V | Sesión activa, Centro y UJI guardados | Lista de lugares |
| E-07-I1 | Sin sesión válida | Solicitar acceso |
| E-07-V2 | Ningún lugar guardado | Lista vacía |

| **E-07-V** | **Escenario válido · Prueba PA-07-V** |
| --- | --- |
| **Justificación** | comprueba que se recuperan los lugares guardados. |
| **Análisis** | Repetir con lista vacía y con lugares favoritos. |
| **Given** | Ana tiene Centro y UJI |
| **When** | Ana consulta su lista |
| **Then** | se devuelven Centro y UJI con sus coordenadas |

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

| **Escenario** | **Entrada o condición** | **Resultado** |
| --- | --- | --- |
| E-08-V | Centro y UJI, confirmar borrar Centro | Solo queda UJI |
| E-08-I1 | Centro eliminado antes de confirmar | Aviso, UJI conservado |
| E-08-V2 | Cancelar el borrado | Lugar conservado |

| **E-08-V** | **Escenario válido · Prueba PA-08-V** |
| --- | --- |
| **Justificación** | comprueba que la eliminación afecta solo al registro elegido. |
| **Análisis** | Comprobar la cancelación y las rutas históricas del lugar. |
| **Given** | Ana tiene Centro y UJI |
| **When** | confirma eliminar Centro |
| **Then** | solo queda UJI y Centro deja de poder elegirse en nuevas rutas |

| **E-08-I1** | **Escenario inválido · Prueba PA-08-I** |
| --- | --- |
| **Justificación** | el lugar puede dejar de estar disponible antes de confirmar. |
| **Análisis** | Comprobar que los demás lugares se conservan. |
| **Given** | Ana tenía Centro y UJI, pero Centro se ha eliminado desde otra sesión mientras el diálogo seguía abierto |
| **When** | confirma eliminar Centro desde el diálogo anterior |
| **Then** | se informa de que Centro ya no está disponible y UJI permanece |


## HU-09. Elegir lugares en el mapa

**Requisito** R2

**Historia** Como usuario quiero seleccionar un punto en el mapa y guardarlo para fijar visualmente un origen o un destino.

| **Escenario** | **Entrada o condición** | **Resultado** |
| --- | --- | --- |
| E-09-V | Punto seleccionado y nombre válido | Lugar guardado |
| E-09-I1 | Sin punto seleccionado | Lugar no guardado |
| E-09-V2 | Mover el marcador antes de guardar | Se guarda la última posición |

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

| **Escenario** | **Entrada o condición** | **Resultado** |
| --- | --- | --- |
| E-10-V | Gasolina, consumo 6 l/100 km | Vehículo guardado |
| E-10-I1 | Consumo -1 | Alta rechazada |
| E-10-V2 | Eléctrico, consumo 15 kWh/100 km | Vehículo guardado |

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

| **Escenario** | **Entrada o condición** | **Resultado** |
| --- | --- | --- |
| E-11-V | Sesión activa y vehículos guardados | Lista de vehículos |
| E-11-I1 | Sesión caducada | Solicitar acceso |
| E-11-V2 | Ningún vehículo guardado | Lista vacía |

| **E-11-V** | **Escenario válido · Prueba PA-11-V** |
| --- | --- |
| **Justificación** | presenta los datos que permiten distinguir las opciones. |
| **Análisis** | Comprobar nombre, tipo y consumo de cada vehículo. |
| **Given** | Ana tiene Compacto y Eléctrico |
| **When** | Ana consulta sus vehículos |
| **Then** | se devuelven los dos vehículos con sus tipos y consumos |

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

| **Escenario** | **Entrada o condición** | **Resultado** |
| --- | --- | --- |
| E-12-V | Eliminar Compacto predeterminado | Vehículo y referencia eliminados |
| E-12-I1 | Compacto eliminado antes de confirmar | Aviso, resto conservado |
| E-12-V2 | Cancelar el borrado | Vehículo conservado |

| **E-12-V** | **Escenario válido · Prueba PA-12-V** |
| --- | --- |
| **Justificación** | comprueba también la integridad de las preferencias. |
| **Análisis** | Repetir con un vehículo favorito y uno sin uso. |
| **Given** | Compacto es el vehículo predeterminado de Ana |
| **When** | Ana confirma eliminar Compacto |
| **Then** | se borra el vehículo y la referencia predeterminada queda vacía |

| **E-12-I1** | **Escenario inválido · Prueba PA-12-I** |
| --- | --- |
| **Justificación** | un vehículo ya eliminado no puede borrarse de nuevo. |
| **Análisis** | Comprobar que el resto de vehículos y preferencias se conserva. |
| **Given** | Ana tenía Compacto y Eléctrico, pero Compacto se ha eliminado desde otra sesión |
| **When** | confirma eliminar Compacto desde la lista anterior |
| **Then** | se informa de que Compacto ya no está disponible y Eléctrico permanece |


## HU-13. Modificar un vehículo

**Requisito** R3

**Historia** Como usuario quiero modificar el nombre, el tipo o el consumo de mi vehículo para mantener sus datos actualizados.

| **Escenario** | **Entrada o condición** | **Resultado** |
| --- | --- | --- |
| E-13-V | Cambiar consumo a 5,5 l/100 km | Mismo vehículo actualizado |
| E-13-I1 | Cambiar consumo a 0 | Consumo anterior conservado |
| E-13-V2 | Cambiar de gasolina a eléctrico | Unidad kWh/100 km |

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

**Historia** Como usuario quiero obtener una ruta entre dos puntos elegidos en Explorar o lugares guardados para conocer su trayecto, distancia y duración.

| **Escenario** | **Entrada o condición** | **Resultado** |
| --- | --- | --- |
| E-14-V | Extremos distintos y proveedor disponible | Trayecto y métricas |
| E-14-I1 | Origen y destino coincidentes | Cálculo rechazado |
| E-14-I2 | Proveedor no disponible | Error, sin ruta nueva |

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
| **Análisis** | Probar coordenadas iguales aunque los nombres sean distintos. |
| **Given** | Ana tiene Centro |
| **When** | solicita una ruta de Centro a Centro |
| **Then** | se rechaza por extremos coincidentes y no se devuelve ni guarda una ruta nueva |


## HU-15. Estimar coste de combustible

**Requisito** R4

**Historia** Como usuario quiero conocer el coste de combustible para comparar el gasto de mi desplazamiento.

| **Escenario** | **Entrada o condición** | **Resultado** |
| --- | --- | --- |
| E-15-V | Gasolina, consumo y precio válidos | Coste según distancia |
| E-15-I1 | Precio manual -1 euros/l | Precio rechazado |
| E-15-V2 | Precio público no disponible | Ruta consultable sin coste |

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

| **Escenario** | **Entrada o condición** | **Resultado** |
| --- | --- | --- |
| E-16-V | Eléctrico, consumo y precio válidos | Coste según distancia |
| E-16-I1 | Precio manual 0 euros/kWh | Precio rechazado |
| E-16-V2 | Precio público no disponible | Ruta consultable sin coste |

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

| **Escenario** | **Entrada o condición** | **Resultado** |
| --- | --- | --- |
| E-17-V | A pie, peso 70 kg | Calorías estimadas |
| E-17-I1 | Peso 0 kg | Peso rechazado |
| E-17-V2 | Bicicleta, peso válido | Estimación con MET de bicicleta |

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

| **Escenario** | **Entrada o condición** | **Resultado** |
| --- | --- | --- |
| E-18-V | Más económica, alternativas y precio | Menor coste recibido primero |
| E-18-I1 | Destino sin seleccionar | Cálculo rechazado |
| E-18-V2 | Una sola alternativa disponible | Se muestra esa alternativa |

| **E-18-V** | **Escenario válido · Prueba PA-18-V** |
| --- | --- |
| **Justificación** | compara los costes de las alternativas recibidas, sin suponer un recorrido fijo. |
| **Análisis** | Repetir con rapidez, distancia y alternativas empatadas. |
| **Given** | Ana tiene Centro, UJI y Compacto con consumo de 6 l/100 km, usa gasolina manual a 1,60 €/l y ORS está disponible |
| **When** | solicita una ruta en coche entre Centro y UJI con el criterio más económico |
| **Then** | la primera opción tiene coste menor o igual que cada alternativa obtenida y se muestra el origen del precio |

| **E-18-I1** | **Escenario inválido · Prueba PA-18-I** |
| --- | --- |
| **Justificación** | sin destino no se puede comparar ninguna ruta. |
| **Análisis** | Comprobar también la ausencia de origen. |
| **Given** | Ana ha seleccionado Centro como origen y más económica como criterio, pero no ha seleccionado destino |
| **When** | solicita calcular la ruta |
| **Then** | se solicita seleccionar un destino y no se calcula una ruta nueva |


## HU-19. Guardar una ruta

**Requisito** R4

**Historia** Como usuario quiero guardar una ruta calculada para consultarla posteriormente.

| **Escenario** | **Entrada o condición** | **Resultado** |
| --- | --- | --- |
| E-19-V | Resultado calculado y nombre válido | Ruta guardada |
| E-19-I1 | Nombre de tres espacios | Ruta no guardada |
| E-19-I2 | Sin resultado calculado | Guardado no disponible |

| **E-19-V** | **Escenario válido · Prueba PA-19-V** |
| --- | --- |
| **Justificación** | comprueba que una ruta calculada puede guardarse para otro momento. |
| **Análisis** | Recuperar y comparar el trazado, las medidas y la fecha. |
| **Given** | Ana tiene un resultado real entre Centro y UJI calculado para su cuenta |
| **When** | lo guarda con el nombre Camino a clase |
| **Then** | se crea una ruta propia con ese nombre, geometría, métricas y fecha de cálculo, recuperable en su listado |

| **E-19-I1** | **Escenario inválido · Prueba PA-19-I** |
| --- | --- |
| **Justificación** | una ruta guardada necesita un nombre no vacío. |
| **Análisis** | Probar nombre vacío y los límites de longitud. |
| **Given** | Ana tiene un resultado calculado entre Centro y UJI y ninguna ruta guardada |
| **When** | intenta guardarlo con un nombre de tres espacios |
| **Then** | se rechaza el nombre y la lista de rutas sigue vacía |


## HU-20. Consultar rutas guardadas

**Requisito** R4

**Historia** Como usuario quiero consultar mis rutas guardadas para recuperar un trayecto sin volver a calcularlo.

| **Escenario** | **Entrada o condición** | **Resultado** |
| --- | --- | --- |
| E-20-V | Ruta guardada y sesión activa | Mismo trazado y métricas |
| E-20-I1 | Sin sesión válida | Solicitar acceso |
| E-20-V2 | Ninguna ruta guardada | Lista vacía |

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

| **Escenario** | **Entrada o condición** | **Resultado** |
| --- | --- | --- |
| E-21-V | Confirmar borrar Camino a clase | Solo queda Paseo |
| E-21-I1 | Ruta eliminada antes de confirmar | Aviso, Paseo conservado |
| E-21-V2 | Cancelar el borrado | Ruta conservada |

| **E-21-V** | **Escenario válido · Prueba PA-21-V** |
| --- | --- |
| **Justificación** | delimita el efecto de la eliminación al historial. |
| **Análisis** | Repetir con ruta favorita y con cancelación del borrado. |
| **Given** | Ana tiene Camino a clase y Paseo |
| **When** | confirma eliminar Camino a clase |
| **Then** | solo permanece Paseo y no se alteran sus lugares ni vehículos |

| **E-21-I1** | **Escenario inválido · Prueba PA-21-I** |
| --- | --- |
| **Justificación** | una ruta ya eliminada no puede borrarse de nuevo. |
| **Análisis** | Comprobar que las demás rutas se conservan. |
| **Given** | Ana tenía Camino a clase y Paseo, pero Camino a clase se ha eliminado desde otra sesión |
| **When** | confirma eliminar Camino a clase desde la lista anterior |
| **Then** | se informa de que ya no está disponible y Paseo permanece |


## HU-22. Gestionar favoritos

**Requisito** R5

**Historia** Como usuario quiero marcar y desmarcar favoritos para encontrar primero los elementos que uso con frecuencia.

| **Escenario** | **Entrada o condición** | **Resultado** |
| --- | --- | --- |
| E-22-V | Marcar un elemento de cada lista | Favoritos primero, marcas guardadas |
| E-22-I1 | Elemento eliminado antes de marcar | Aviso, resto conservado |
| E-22-V2 | Desmarcar un favorito | Pierde su prioridad |

| **E-22-V** | **Escenario válido · Prueba PA-22-V** |
| --- | --- |
| **Justificación** | comprueba la misma regla de favoritos en lugares, vehículos y rutas. |
| **Análisis** | Desmarcar cada favorito y volver a consultar las listas. |
| **Given** | Ana tiene sin marcar Centro y UJI, Compacto y Eléctrico, y Camino a clase y Paseo |
| **When** | marca UJI, Eléctrico y Paseo como favoritos y vuelve a consultar las tres listas |
| **Then** | cada elemento marcado conserva su estado y aparece antes que el no favorito de su lista |

| **E-22-I1** | **Escenario inválido · Prueba PA-22-I** |
| --- | --- |
| **Justificación** | solo puede marcarse un elemento que todavía exista. |
| **Análisis** | Aplicar el mismo caso a vehículos y rutas. |
| **Given** | Ana tenía Centro y UJI, pero Centro se ha eliminado desde otra sesión |
| **When** | intenta marcar Centro como favorito desde la lista anterior |
| **Then** | se informa de que Centro ya no está disponible y UJI conserva su marca |


## HU-23. Fijar transporte predeterminado

**Requisito** R5

**Historia** Como usuario quiero fijar un modo y, si procede, un vehículo por defecto para preparar rutas con menos pasos.

| **Escenario** | **Entrada o condición** | **Resultado** |
| --- | --- | --- |
| E-23-V | Coche y Compacto disponible | Predeterminados guardados |
| E-23-I1 | Compacto eliminado antes de guardar | Referencia rechazada |
| E-23-V2 | A pie o bicicleta | Sin vehículo asociado |

| **E-23-V** | **Escenario válido · Prueba PA-23-V** |
| --- | --- |
| **Justificación** | reduce trabajo repetitivo sin bloquear la elección puntual. |
| **Análisis** | Repetir con bicicleta y a pie, sin vehículo asociado. |
| **Given** | Compacto pertenece a Ana |
| **When** | guarda coche y Compacto como valores predeterminados y abre una planificación nueva |
| **Then** | se seleccionan coche y Compacto, permitiendo cambiarlos para esa consulta |

| **E-23-I1** | **Escenario inválido · Prueba PA-23-I** |
| --- | --- |
| **Justificación** | no se puede guardar una referencia a un vehículo eliminado. |
| **Análisis** | Comprobar que el modo anterior se conserva. |
| **Given** | Ana usa a pie por defecto y tiene Compacto seleccionado en la configuración, pero el vehículo se elimina desde otra sesión antes de guardar |
| **When** | intenta guardar coche y Compacto como predeterminados |
| **Then** | se informa de que Compacto ya no está disponible y se conserva a pie como modo predeterminado |


## HU-24. Fijar criterio predeterminado

**Requisito** R5

**Historia** Como usuario quiero guardar un criterio de ruta por defecto para no repetir mi preferencia.

| **Escenario** | **Entrada o condición** | **Resultado** |
| --- | --- | --- |
| E-24-V | Guardar más corta | Criterio inicial más corta |
| E-24-I1 | Almacenamiento no disponible | Error, preferencia conservada |
| E-24-V2 | Cambiar criterio solo para una consulta | Predeterminado conservado |

| **E-24-V** | **Escenario válido · Prueba PA-24-V** |
| --- | --- |
| **Justificación** | comprueba el efecto posterior de guardar, además de la notificación. |
| **Análisis** | Repetir con las tres opciones de criterio admitidas. |
| **Given** | Ana tiene más rápida como criterio predeterminado |
| **When** | guarda más corta y abre una planificación nueva |
| **Then** | aparece más corta como criterio inicial y la preferencia se conserva |

| **E-24-I1** | **Escenario inválido · Prueba PA-24-I** |
| --- | --- |
| **Justificación** | el fallo de guardado no debe mostrarse como un cambio confirmado. |
| **Análisis** | Volver a abrir y comprobar la preferencia anterior. |
| **Given** | Ana tiene más corta como criterio predeterminado y el almacenamiento deja de estar disponible |
| **When** | intenta guardar más rápida |
| **Then** | se informa del fallo de guardado y al recuperar el almacenamiento sigue guardado más corta |


## HU-25. Recuperar estado tras un cierre

**Requisito** R6

**Historia** Como usuario quiero recuperar contenidos y aspecto al volver a abrir la aplicación para evitar reconfigurarla.

| **Escenario** | **Entrada o condición** | **Resultado** |
| --- | --- | --- |
| E-25-V | Cierre normal con datos guardados | Estado recuperado |
| E-25-I1 | Almacenamiento inaccesible | Error de carga |
| E-25-V2 | Listas vacías guardadas | Estado vacío recuperado |

| **E-25-V** | **Escenario válido · Prueba PA-25-V** |
| --- | --- |
| **Justificación** | comprueba la conservación del estado confirmado al cerrar y volver a abrir la aplicación. |
| **Análisis** | Comparar datos, favoritos y preferencias guardados. |
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

| **Escenario** | **Entrada o condición** | **Resultado** |
| --- | --- | --- |
| E-26-V | Interrupción tras confirmar Centro | Centro conservado |
| E-26-I1 | Interrupción antes de confirmar UJI | Centro conservado, UJI ausente |
| E-26-V2 | Interrupción tras confirmar ambos | Ambos conservados |

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
