Feature: Movilidad de Vía
  # Catálogo de especificaciones sin definiciones ejecutables de pasos.
  # Datos y condiciones comunes en docs/entrega1/03-reglas-metodo-prueba.md.

  Scenario: PA-01-V Registrar una cuenta, escenario válido
    Given no existe ana@example.com y el almacenamiento está disponible
    When se registra Ana con ana@example.com y la contraseña RutaSegura2026
    Then se crea una única cuenta y se devuelve su identificador, sin devolver la contraseña

  Scenario: PA-01-I Registrar una cuenta, escenario inválido
    Given existe ana@example.com
    When se intenta registrar de nuevo ese correo con RutaSegura2026
    Then se rechaza por correo duplicado y el número de cuentas no cambia

  Scenario: PA-02-V Iniciar sesión, escenario válido
    Given existe Ana con ana@example.com y RutaSegura2026
    When inicia sesión con esas credenciales
    Then se crea una sesión vinculada a Ana y se recuperan únicamente sus datos

  Scenario: PA-02-I Iniciar sesión, escenario inválido
    Given existe la cuenta ana@example.com con contraseña RutaSegura2026
    When se inicia sesión con ana@example.com y OtraClave2026
    Then se informa de credenciales incorrectas y no se crea una sesión

  Scenario: PA-03-V Cerrar sesión, escenario válido
    Given Ana tiene una sesión activa S1
    When cierra S1 y vuelve a solicitar sus datos con ese código de sesión
    Then S1 deja de dar acceso y los datos de Ana se conservan

  Scenario: PA-03-I Cerrar sesión, escenario inválido
    Given el código de sesión S0 no corresponde a ninguna sesión activa
    When se solicita cerrar S0 y consultar datos utilizando ese código de sesión
    Then se rechazan ambas peticiones y las sesiones de otros usuarios se conservan

  Scenario: PA-04-V Eliminar la cuenta, escenario válido
    Given Ana tiene la contraseña RutaSegura2026, dos lugares, un vehículo y una ruta guardada
    When confirma la eliminación con RutaSegura2026
    Then se eliminan cuenta, sesiones, lugares, vehículo, ruta y preferencias de Ana, sin afectar a otras cuentas

  Scenario: PA-04-I Eliminar la cuenta, escenario inválido
    Given Ana tiene la contraseña RutaSegura2026, dos lugares, un vehículo y una ruta guardada
    When confirma la eliminación con OtraClave2026
    Then se rechaza la operación y permanecen la cuenta y todos sus datos

  Scenario: PA-05-V Guardar por coordenadas, escenario válido
    Given Ana tiene cero lugares
    When guarda Centro con latitud 39.9864 y longitud -0.0513
    Then aparece un lugar de Ana con ese nombre y esas coordenadas

  Scenario: PA-05-I Guardar por coordenadas, escenario inválido
    Given Ana tiene cero lugares
    When guarda Centro con latitud 91 y longitud -0.0513
    Then se rechaza la latitud y la lista sigue vacía

  Scenario: PA-06-V Guardar por topónimo, escenario válido
    Given Ana está autenticada y el servicio real de búsqueda de lugares está disponible
    When busca Universitat Jaume I, Castellón, selecciona un resultado y lo guarda como UJI
    Then se obtiene al menos un candidato con coordenadas válidas y se guarda el nombre UJI con las coordenadas del resultado seleccionado

  Scenario: PA-06-I Guardar por topónimo, escenario inválido
    Given Ana tiene cero lugares
    When solicita buscar un topónimo formado por tres espacios
    Then se rechaza la búsqueda vacía antes de consultar el servicio y no se guarda ningún lugar

  Scenario: PA-07-V Consultar lugares, escenario válido
    Given Ana tiene Centro y UJI y Luis tiene Estación
    When Ana consulta su lista
    Then se devuelven Centro y UJI y no se devuelve Estación

  Scenario: PA-07-I Consultar lugares, escenario inválido
    Given no hay sesión válida
    When se solicita la lista de Ana
    Then se deniega el acceso y no se muestran lugares

  Scenario: PA-08-V Eliminar un lugar, escenario válido
    Given Ana tiene Centro y UJI
    When confirma eliminar Centro
    Then solo queda UJI y Centro deja de poder elegirse en nuevas rutas

  Scenario: PA-08-I Eliminar un lugar, escenario inválido
    Given Estación pertenece a Luis
    When Ana intenta eliminar Estación
    Then se rechaza como elemento no disponible y Estación permanece intacta

  Scenario: PA-09-V Elegir lugares en el mapa, escenario válido
    Given Ana visualiza el mapa y tiene cero lugares
    When selecciona el punto (39.9864,-0.0513), le da el nombre Centro y confirma el alta
    Then se guarda Centro en esas coordenadas y puede seleccionarse como extremo

  Scenario: PA-09-I Elegir lugares en el mapa, escenario inválido
    Given Ana abre el alta con nombre Centro y sin coordenadas ni punto seleccionado
    When intenta guardar el lugar
    Then se solicita completar las coordenadas y no se crea ningún lugar

  Scenario: PA-10-V Dar de alta un vehículo, escenario válido
    Given Ana no tiene vehículos
    When registra Compacto, gasolina, consumo 6,0 l/100 km
    Then se guarda un vehículo propio con esos valores y queda disponible en el planificador

  Scenario: PA-10-I Dar de alta un vehículo, escenario inválido
    Given Ana no tiene vehículos
    When registra Compacto, gasolina, consumo -1 l/100 km
    Then se rechaza el consumo y la lista permanece vacía

  Scenario: PA-11-V Consultar vehículos, escenario válido
    Given Ana tiene Compacto y Eléctrico. Luis tiene Furgoneta
    When Ana consulta sus vehículos
    Then recibe Compacto y Eléctrico con tipo y consumo. No recibe Furgoneta

  Scenario: PA-11-I Consultar vehículos, escenario inválido
    Given la sesión de Ana ha caducado
    When consulta los vehículos
    Then se solicita iniciar sesión y no se devuelve la lista

  Scenario: PA-12-V Eliminar un vehículo, escenario válido
    Given Compacto es el vehículo predeterminado de Ana
    When Ana confirma eliminar Compacto
    Then se borra el vehículo y la referencia predeterminada queda vacía

  Scenario: PA-12-I Eliminar un vehículo, escenario inválido
    Given Furgoneta pertenece a Luis
    When Ana intenta eliminar Furgoneta
    Then se rechaza la operación y no cambian ni Furgoneta ni las preferencias de Ana

  Scenario: PA-13-V Modificar un vehículo, escenario válido
    Given Compacto pertenece a Ana y consume 6,0 l/100 km
    When Ana cambia el consumo a 5,5 y guarda
    Then se mantiene el identificador y se registra 5,5 para los cálculos posteriores

  Scenario: PA-13-I Modificar un vehículo, escenario inválido
    Given Compacto pertenece a Ana y tiene un consumo de 6,0 l/100 km
    When Ana intenta guardar un consumo de 0 l/100 km
    Then se rechaza la edición y el consumo de Compacto permanece en 6,0 l/100 km

  Scenario: PA-14-V Calcular y visualizar una ruta, escenario válido
    Given Ana tiene Centro (39.9864,-0.0513) y UJI (39.9946,-0.0684), y el servicio real está disponible
    When calcula la ruta a pie entre Centro y UJI
    Then se devuelve una geometría con al menos dos puntos válidos, distancia positiva menor de 100 km y duración positiva

  Scenario: PA-14-I Calcular y visualizar una ruta, escenario inválido
    Given Ana tiene Centro
    When solicita una ruta de Centro a Centro
    Then se rechaza por extremos coincidentes y no se devuelve ni guarda una ruta nueva

  Scenario: PA-15-V Estimar coste de combustible, escenario válido
    Given Ana tiene Centro y UJI, Compacto con consumo de 6 l/100 km y precio manual de gasolina de 1,60 €/l
    When calcula una ruta en coche entre Centro y UJI con el servicio de rutas disponible
    Then el coste devuelto es (distancia en km / 100 × 6 × 1,60) € redondeado a céntimos, con el origen manual del precio

  Scenario: PA-15-I Estimar coste de combustible, escenario inválido
    Given Ana tiene Centro, UJI y Compacto, el servicio real de rutas funciona y el acceso al precio automático de gasolina está interrumpido
    When calcula la ruta en coche entre esos lugares
    Then se devuelve el trayecto con su distancia y duración, y el coste queda sin valor

  Scenario: PA-16-V Estimar coste eléctrico, escenario válido
    Given Ana tiene Centro y UJI, Eléctrico con consumo de 15 kWh/100 km y precio manual de 0,20 €/kWh
    When calcula una ruta con Eléctrico entre Centro y UJI y el servicio de rutas está disponible
    Then el coste devuelto es (distancia en km / 100 × 15 × 0,20) € redondeado a céntimos, con el origen manual del precio

  Scenario: PA-16-I Estimar coste eléctrico, escenario inválido
    Given Ana tiene Centro, UJI y Eléctrico, el servicio real de rutas funciona y el acceso al precio automático de electricidad está interrumpido
    When calcula la ruta con Eléctrico entre esos lugares
    Then se devuelve el trayecto y el coste queda sin valor al no disponer de precio eléctrico

  Scenario: PA-17-V Estimar calorías, escenario válido
    Given Ana tiene Centro y UJI guardados, pesa 70 kg y el servicio de rutas está disponible
    When calcula una ruta a pie entre Centro y UJI
    Then se devuelven kcal estimadas con 3,5 × 3,5 × 70 / 200 × duración en minutos, redondeadas al entero más próximo

  Scenario: PA-17-I Estimar calorías, escenario inválido
    Given Ana tiene Centro y UJI guardados, peso configurado de 70 kg y el servicio de rutas disponible
    When intenta guardar un peso de 0 kg para calcular las calorías del trayecto
    Then se rechaza el valor y permanece el peso de 70 kg

  Scenario: PA-18-V Elegir el criterio de ruta, escenario válido
    Given Ana tiene Centro, UJI y Compacto con consumo de 6 l/100 km, usa gasolina manual a 1,60 €/l y ORS está disponible
    When solicita una ruta en coche entre Centro y UJI con el criterio más económico
    Then la primera opción tiene coste menor o igual que cada alternativa obtenida y se muestra el origen del precio

  Scenario: PA-18-I Elegir el criterio de ruta, escenario inválido
    Given Ana tiene Centro y UJI
    When solicita el criterio desconocido panorámica
    Then se rechaza el criterio sin consultar rutas ni cambiar preferencias

  Scenario: PA-19-V Guardar una ruta, escenario válido
    Given Ana tiene un resultado real entre Centro y UJI calculado para su cuenta hace menos de una hora
    When lo guarda con el nombre Camino a clase
    Then se crea una ruta propia con ese nombre, geometría, métricas y fecha de cálculo, recuperable en su listado

  Scenario: PA-19-I Guardar una ruta, escenario inválido
    Given Ana no tiene un resultado calculado con identificador X99 para su cuenta
    When intenta guardar el resultado X99 como Camino a clase
    Then se rechaza el guardado y la lista de rutas no cambia

  Scenario: PA-20-V Consultar rutas guardadas, escenario válido
    Given Ana tiene Camino a clase guardada con su geometría y sus métricas
    When abre su lista y selecciona Camino a clase
    Then recupera la misma geometría y las mismas métricas, identificadas como cálculo histórico

  Scenario: PA-20-I Consultar rutas guardadas, escenario inválido
    Given no hay sesión válida
    When se solicita el listado de rutas guardadas
    Then se deniega el acceso sin revelar nombres ni trayectos

  Scenario: PA-21-V Eliminar una ruta guardada, escenario válido
    Given Ana tiene Camino a clase y Paseo
    When confirma eliminar Camino a clase
    Then solo permanece Paseo y no se alteran sus lugares ni vehículos

  Scenario: PA-21-I Eliminar una ruta guardada, escenario inválido
    Given Camino al trabajo pertenece a Luis
    When Ana intenta eliminar esa ruta
    Then se rechaza la operación y la ruta de Luis permanece

  Scenario: PA-22-V Gestionar favoritos, escenario válido
    Given Ana tiene sin marcar Centro y UJI, Compacto y Eléctrico, y Camino a clase y Paseo
    When marca UJI, Eléctrico y Paseo como favoritos y vuelve a consultar las tres listas
    Then cada elemento marcado conserva su estado y aparece antes que el no favorito de su lista

  Scenario: PA-22-I Gestionar favoritos, escenario inválido
    Given Estación, Furgoneta y Camino al trabajo pertenecen a Luis
    When Ana intenta cambiar el favorito de cada uno
    Then cada operación se rechaza y todas las marcas de Luis permanecen intactas

  Scenario: PA-23-V Fijar transporte predeterminado, escenario válido
    Given Compacto pertenece a Ana
    When guarda coche y Compacto como valores predeterminados y abre una planificación nueva
    Then se seleccionan coche y Compacto, permitiendo cambiarlos para esa consulta

  Scenario: PA-23-I Fijar transporte predeterminado, escenario inválido
    Given Furgoneta pertenece a Luis y Compacto es el vehículo predeterminado de Ana
    When Ana intenta establecer Furgoneta como predeterminada
    Then se rechaza la referencia y permanece Compacto

  Scenario: PA-24-V Fijar criterio predeterminado, escenario válido
    Given Ana tiene más rápida como criterio predeterminado
    When guarda más corta y abre una planificación nueva
    Then aparece más corta como criterio inicial y la preferencia se conserva

  Scenario: PA-24-I Fijar criterio predeterminado, escenario inválido
    Given Ana tiene más corta como criterio predeterminado
    When intenta guardar panorámica como criterio
    Then se rechaza el valor y se conserva más corta

  Scenario: PA-25-V Recuperar estado tras un cierre, escenario válido
    Given Ana ha guardado Centro, UJI, Compacto y Camino a clase, ha marcado UJI como favorito y usa tema oscuro y el último trayecto Centro-UJI a pie con criterio más corta
    When cierra la aplicación y vuelve a abrirla sobre la misma base de datos, iniciando sesión si es necesario
    Then recupera los mismos registros, favoritos, tema y selección del último trayecto

  Scenario: PA-25-I Recuperar estado tras un cierre, escenario inválido
    Given Ana tiene Centro, Compacto y Camino a clase guardados, pero el almacenamiento no se puede abrir
    When intenta iniciar la aplicación
    Then se informa del fallo de almacenamiento y no se presenta una lista vacía como si fuera su estado real

  Scenario: PA-26-V Recuperar estado tras interrupción, escenario válido
    Given el servidor ha confirmado el alta de Centro en una base de datos en disco
    When se fuerza el cierre del proceso con SIGKILL y se abre otro sobre la misma base
    Then Centro permanece íntegro y se puede consultar sin duplicados

  Scenario: PA-26-I Recuperar estado tras interrupción, escenario inválido
    Given Centro está confirmado y una transacción ha escrito UJI, pero aún no ha ejecutado COMMIT
    When el proceso se interrumpe antes del COMMIT y después se abre la misma base de datos
    Then Centro se conserva y UJI no aparece como alta confirmada. No hay datos parciales
