# Historias, escenarios y aceptación

Las 52 pruebas se especifican para el proyecto. El archivo `.feature` contiene el catálogo y todavía no tiene definiciones ejecutables de pasos. Las comprobaciones del spike tienen otro alcance, explicado en su README.


## HU-01 Registrar una cuenta

R1 · M01

Como persona no registrada quiero crear una cuenta para utilizar los servicios de movilidad.

### E-01-V · Escenario válido · PA-01-V

**Justificación** comprueba el alta con datos válidos y su guardado en la base de datos.

**Análisis** Probar los tamaños mínimos y máximos de los campos.

**Given** no existe ana@example.com y el almacenamiento está disponible

**When** se registra Ana con ana@example.com y la contraseña RutaSegura2026

**Then** se crea una única cuenta y se devuelve su identificador, sin devolver la contraseña

### E-01-I · Escenario inválido · PA-01-I

**Justificación** un correo ya registrado impide crear otra cuenta con la misma identidad.

**Análisis** Probar el mismo correo con mayúsculas y espacios exteriores.

**Given** existe ana@example.com

**When** se intenta registrar de nuevo ese correo con RutaSegura2026

**Then** se rechaza por correo duplicado y el número de cuentas no cambia

**Límites y variantes** Nombre de 1 a 70 caracteres. Correo de hasta 254. Contraseña de 10 a 128. Probar 9/10 y 128/129 caracteres y normalización del correo.


## HU-02 Iniciar sesión

R1 · M02

Como persona registrada quiero iniciar sesión para acceder a mis datos.

### E-02-V · Escenario válido · PA-02-V

**Justificación** comprueba que el acceso corresponde a la cuenta indicada.

**Análisis** Comprobar que otras cuentas no aparecen en la sesión.

**Given** existe Ana con ana@example.com y RutaSegura2026

**When** inicia sesión con esas credenciales

**Then** se crea una sesión vinculada a Ana y se recuperan únicamente sus datos

### E-02-I · Escenario inválido · PA-02-I

**Justificación** una contraseña errónea no debe conceder acceso ni revelar datos.

**Análisis** Repetir con correo inexistente y campos vacíos.

**Given** existe la cuenta ana@example.com con contraseña RutaSegura2026

**When** se inicia sesión con ana@example.com y OtraClave2026

**Then** se informa de credenciales incorrectas y no se crea una sesión

**Límites y variantes** Correo inexistente con el mismo mensaje de error. Sesión caducada. Campos vacíos. Acceso de dos usuarios con listas distintas.


## HU-03 Cerrar sesión

R1 · M03

Como usuario autenticado quiero cerrar mi sesión para impedir el acceso posterior desde ella.

### E-03-V · Escenario válido · PA-03-V

**Justificación** comprueba que la sesión cerrada deja de dar acceso a los datos.

**Análisis** Comprobar otra sesión abierta de la misma cuenta.

**Given** Ana tiene una sesión activa S1

**When** cierra S1 y vuelve a solicitar sus datos con ese código de sesión

**Then** S1 deja de dar acceso y los datos de Ana se conservan

### E-03-I · Escenario inválido · PA-03-I

**Justificación** el código de sesión no corresponde a una sesión activa y no debe dar acceso.

**Análisis** Repetir el cierre con un código ya cerrado.

**Given** el código de sesión S0 no corresponde a ninguna sesión activa

**When** se solicita cerrar S0 y consultar datos utilizando ese código de sesión

**Then** se rechazan ambas peticiones y las sesiones de otros usuarios se conservan

**Límites y variantes** Dos sesiones independientes y cierre repetido. Comprobar que el código de sesión cerrado deja de dar acceso.


## HU-04 Eliminar la cuenta

R1 · M03

Como usuario quiero eliminar mi cuenta para borrar sus datos asociados.

### E-04-V · Escenario válido · PA-04-V

**Justificación** comprueba que se eliminan la cuenta y todos sus datos asociados.

**Análisis** Repetir con cuenta vacía y con favoritos guardados.

**Given** Ana tiene la contraseña RutaSegura2026, dos lugares, un vehículo y una ruta guardada

**When** confirma la eliminación con RutaSegura2026

**Then** se eliminan cuenta, sesiones, lugares, vehículo, ruta y preferencias de Ana, sin afectar a otras cuentas

### E-04-I · Escenario inválido · PA-04-I

**Justificación** impide un borrado irreversible sin comprobar la contraseña.

**Análisis** Cancelar y comprobar también que la sesión sigue activa.

**Given** Ana tiene la contraseña RutaSegura2026, dos lugares, un vehículo y una ruta guardada

**When** confirma la eliminación con OtraClave2026

**Then** se rechaza la operación y permanecen la cuenta y todos sus datos

**Límites y variantes** Cancelar conserva los datos. Comprobar también una cuenta vacía y el rechazo de la sesión eliminada.


## HU-05 Guardar por coordenadas

R2 · M04

Como usuario quiero dar de alta un lugar mediante coordenadas para usarlo en una ruta.

### E-05-V · Escenario válido · PA-05-V

**Justificación** comprueba el alta directa mediante coordenadas.

**Análisis** Incluir los extremos de latitud y longitud admitidos.

**Given** Ana tiene cero lugares

**When** guarda Centro con latitud 39.9864 y longitud -0.0513

**Then** aparece un lugar de Ana con ese nombre y esas coordenadas

### E-05-I · Escenario inválido · PA-05-I

**Justificación** evita guardar coordenadas fuera de los límites admitidos.

**Análisis** Probar longitud 181 y valores que no sean números.

**Given** Ana tiene cero lugares

**When** guarda Centro con latitud 91 y longitud -0.0513

**Then** se rechaza la latitud y la lista sigue vacía

**Límites y variantes** Latitud entre -90 y 90 y longitud entre -180 y 180, incluidos los extremos. Solo números finitos. El nombre admite de 1 a 120 caracteres.


## HU-06 Guardar por topónimo

R2 · M04

Como usuario quiero buscar un topónimo y guardar un resultado para identificar un lugar sin conocer sus coordenadas.

### E-06-V · Escenario válido · PA-06-V

**Justificación** comprueba la búsqueda y el guardado del candidato elegido, aunque el servicio cambie el orden de resultados.

**Análisis** Elegir entre varios resultados y comprobar sus coordenadas.

**Given** Ana está autenticada y el servicio real de búsqueda de lugares está disponible

**When** busca Universitat Jaume I, Castellón, selecciona un resultado y lo guarda como UJI

**Then** se obtiene al menos un candidato con coordenadas válidas y se guarda el nombre UJI con las coordenadas del resultado seleccionado

### E-06-I · Escenario inválido · PA-06-I

**Justificación** una entrada vacía carece de significado y no debe consumir peticiones.

**Análisis** Repetir con búsqueda vacía, sin resultados y de 201 caracteres.

**Given** Ana tiene cero lugares

**When** solicita buscar un topónimo formado por tres espacios

**Then** se rechaza la búsqueda vacía antes de consultar el servicio y no se guarda ningún lugar

**Límites y variantes** Varios candidatos, ningún resultado, consulta de 200 y 201 caracteres y fallo de conexión. Un resultado solo se guarda tras seleccionarlo.


## HU-07 Consultar lugares

R2 · M05

Como usuario quiero consultar mis lugares para elegir los que utilizaré.

### E-07-V · Escenario válido · PA-07-V

**Justificación** comprueba que cada persona recibe únicamente sus lugares.

**Análisis** Repetir con lista vacía y con lugares favoritos.

**Given** Ana tiene Centro y UJI y Luis tiene Estación

**When** Ana consulta su lista

**Then** se devuelven Centro y UJI y no se devuelve Estación

### E-07-I · Escenario inválido · PA-07-I

**Justificación** evita revelar ubicaciones sin autenticación.

**Análisis** Repetir con sesión cerrada y con sesión caducada.

**Given** no hay sesión válida

**When** se solicita la lista de Ana

**Then** se deniega el acceso y no se muestran lugares

**Límites y variantes** Colección vacía y nombres repetidos. Una lista vacía no se considera un error.


## HU-08 Eliminar un lugar

R2 · M05

Como usuario quiero eliminar un lugar propio para mantener actualizada mi lista.

### E-08-V · Escenario válido · PA-08-V

**Justificación** comprueba que la eliminación afecta solo al registro elegido.

**Análisis** Comprobar la cancelación y las rutas históricas del lugar.

**Given** Ana tiene Centro y UJI

**When** confirma eliminar Centro

**Then** solo queda UJI y Centro deja de poder elegirse en nuevas rutas

### E-08-I · Escenario inválido · PA-08-I

**Justificación** impide eliminar un lugar de otra cuenta.

**Análisis** Repetir con un identificador que no exista.

**Given** Estación pertenece a Luis

**When** Ana intenta eliminar Estación

**Then** se rechaza como elemento no disponible y Estación permanece intacta

**Límites y variantes** La cancelación mantiene el lugar. Si se elimina un extremo del último trayecto, se limpia esa selección. Las rutas guardadas conservan sus datos históricos.


## HU-09 Elegir lugares en el mapa

R2 · M04, M07

Como usuario quiero seleccionar un punto en el mapa y guardarlo para fijar visualmente un origen o un destino.

### E-09-V · Escenario válido · PA-09-V

**Justificación** comprueba la selección de un punto en el mapa exigida en el enunciado.

**Análisis** Cambiar el punto antes de confirmar el alta.

**Given** Ana visualiza el mapa y tiene cero lugares

**When** selecciona el punto (39.9864,-0.0513), le da el nombre Centro y confirma el alta

**Then** se guarda Centro en esas coordenadas y puede seleccionarse como extremo

### E-09-I · Escenario inválido · PA-09-I

**Justificación** impide guardar un lugar sin haber elegido sus coordenadas.

**Análisis** Repetir cuando falta solo una de las coordenadas.

**Given** Ana abre el alta con nombre Centro y sin coordenadas ni punto seleccionado

**When** intenta guardar el lugar

**Then** se solicita completar las coordenadas y no se crea ningún lugar

**Límites y variantes** Cambiar el punto antes de guardar. Se admiten coordenadas por teclado como alternativa al mapa.


## HU-10 Dar de alta un vehículo

R3 · M06

Como usuario quiero registrar un vehículo para calcular rutas con su consumo.

### E-10-V · Escenario válido · PA-10-V

**Justificación** identifica las unidades necesarias para el coste.

**Análisis** Repetir con diésel y electricidad, comprobando sus unidades.

**Given** Ana no tiene vehículos

**When** registra Compacto, gasolina, consumo 6,0 l/100 km

**Then** se guarda un vehículo propio con esos valores y queda disponible en el planificador

### E-10-I · Escenario inválido · PA-10-I

**Justificación** un consumo negativo produciría estimaciones sin sentido.

**Análisis** Probar consumos de 0, de 0,09 y de 100,01.

**Given** Ana no tiene vehículos

**When** registra Compacto, gasolina, consumo -1 l/100 km

**Then** se rechaza el consumo y la lista permanece vacía

**Límites y variantes** Gasolina y diésel usan l/100 km. Electricidad usa kWh/100 km. El consumo admite valores entre 0,1 y 100, y el nombre entre 1 y 70 caracteres.


## HU-11 Consultar vehículos

R3 · M06

Como usuario quiero consultar mis vehículos para seleccionar el apropiado.

### E-11-V · Escenario válido · PA-11-V

**Justificación** presenta los datos que permiten distinguir las opciones.

**Análisis** Comprobar nombre, tipo y consumo de cada vehículo.

**Given** Ana tiene Compacto y Eléctrico. Luis tiene Furgoneta

**When** Ana consulta sus vehículos

**Then** recibe Compacto y Eléctrico con tipo y consumo. No recibe Furgoneta

### E-11-I · Escenario inválido · PA-11-I

**Justificación** no expone información desde una sesión caducada.

**Análisis** Repetir con una cuenta que ya haya cerrado sesión.

**Given** la sesión de Ana ha caducado

**When** consulta los vehículos

**Then** se solicita iniciar sesión y no se devuelve la lista

**Límites y variantes** Colección vacía válida. Consumo decimal. Nombres coincidentes. Favoritos antes que el resto.


## HU-12 Eliminar un vehículo

R3 · M06

Como usuario quiero eliminar un vehículo que ya no utilizo para evitar seleccionarlo.

### E-12-V · Escenario válido · PA-12-V

**Justificación** comprueba también la integridad de las preferencias.

**Análisis** Repetir con un vehículo favorito y uno sin uso.

**Given** Compacto es el vehículo predeterminado de Ana

**When** Ana confirma eliminar Compacto

**Then** se borra el vehículo y la referencia predeterminada queda vacía

### E-12-I · Escenario inválido · PA-12-I

**Justificación** protege vehículos de otros usuarios.

**Análisis** Comprobar que no cambian las preferencias de otras cuentas.

**Given** Furgoneta pertenece a Luis

**When** Ana intenta eliminar Furgoneta

**Then** se rechaza la operación y no cambian ni Furgoneta ni las preferencias de Ana

**Límites y variantes** La cancelación conserva el vehículo. Al eliminar el predeterminado se deberá elegir otro para una nueva ruta en coche. El historial no se modifica.


## HU-13 Modificar un vehículo

R3 · M06

Como usuario quiero modificar el nombre, el tipo o el consumo de mi vehículo para mantener sus datos actualizados.

### E-13-V · Escenario válido · PA-13-V

**Justificación** conserva la identidad del vehículo al editar.

**Análisis** Repetir cambiando el nombre y el tipo de vehículo.

**Given** Compacto pertenece a Ana y consume 6,0 l/100 km

**When** Ana cambia el consumo a 5,5 y guarda

**Then** se mantiene el identificador y se registra 5,5 para los cálculos posteriores

### E-13-I · Escenario inválido · PA-13-I

**Justificación** comprueba que un consumo inválido no modifica el vehículo.

**Análisis** Repetir con consumo superior a 100 y nombre vacío.

**Given** Compacto pertenece a Ana y tiene un consumo de 6,0 l/100 km

**When** Ana intenta guardar un consumo de 0 l/100 km

**Then** se rechaza la edición y el consumo de Compacto permanece en 6,0 l/100 km

**Límites y variantes** Edición de nombre, tipo y consumo. Valores límite de 0,1 y 100. Cambiar de tipo cambia la unidad mostrada, sin recalcular las rutas históricas.


## HU-14 Calcular y visualizar una ruta

R4 · M07

Como usuario quiero obtener una ruta entre dos lugares guardados para conocer su trayecto, distancia y duración.

### E-14-V · Escenario válido · PA-14-V

**Justificación** comprueba que el servicio devuelve un trayecto y unas medidas coherentes.

**Análisis** Repetir en coche y bicicleta, con lugares guardados.

**Given** Ana tiene Centro (39.9864,-0.0513) y UJI (39.9946,-0.0684), y el servicio real está disponible

**When** calcula la ruta a pie entre Centro y UJI

**Then** se devuelve una geometría con al menos dos puntos válidos, distancia positiva menor de 100 km y duración positiva

### E-14-I · Escenario inválido · PA-14-I

**Justificación** detecta una combinación de entradas incompatible con el trayecto definido.

**Análisis** Repetir con lugares no guardados o con coordenadas iguales.

**Given** Ana tiene Centro

**When** solicita una ruta de Centro a Centro

**Then** se rechaza por extremos coincidentes y no se devuelve ni guarda una ruta nueva

**Límites y variantes** Coordenadas iguales aunque los identificadores sean distintos, lugares no registrados y los tres transportes. Un fallo del proveedor no debe producir una ruta ficticia. El dibujo de la geometría en M07 se comprueba por separado en el navegador.


## HU-15 Estimar coste de combustible

R4 · M07, M09

Como usuario quiero conocer el coste de combustible para comparar el gasto de mi desplazamiento.

### E-15-V · Escenario válido · PA-15-V

**Justificación** usa la distancia real obtenida y un precio configurado para verificar el cálculo sin exigir una ruta de longitud fija.

**Análisis** Repetir con diésel y revisar el redondeo final.

**Given** Ana tiene Centro y UJI, Compacto con consumo de 6 l/100 km y precio manual de gasolina de 1,60 €/l

**When** calcula una ruta en coche entre Centro y UJI con el servicio de rutas disponible

**Then** el coste devuelto es (distancia en km / 100 × 6 × 1,60) € redondeado a céntimos, con el origen manual del precio

### E-15-I · Escenario inválido · PA-15-I

**Justificación** sin precio no se puede obtener un importe, aunque la ruta esté disponible.

**Análisis** Comprobar que se conserva el trayecto sin inventar un precio.

**Given** Ana tiene Centro, UJI y Compacto, el servicio real de rutas funciona y el acceso al precio automático de gasolina está interrumpido

**When** calcula la ruta en coche entre esos lugares

**Then** se devuelve el trayecto con su distancia y duración, y el coste queda sin valor

**Límites y variantes** Comprobar gasolina y diésel, decimales y redondeo final. Como comprobación aritmética, 100 km con 6 l/100 km a 1,60 €/l cuestan 9,60 €.


## HU-16 Estimar coste eléctrico

R4 · M07, M09

Como usuario de un vehículo eléctrico quiero conocer el coste energético de una ruta para prever el gasto.

### E-16-V · Escenario válido · PA-16-V

**Justificación** comprueba el cálculo en kWh y evita confundir las unidades del consumo y del precio.

**Análisis** Revisar la conversión de euros por MWh a euros por kWh.

**Given** Ana tiene Centro y UJI, Eléctrico con consumo de 15 kWh/100 km y precio manual de 0,20 €/kWh

**When** calcula una ruta con Eléctrico entre Centro y UJI y el servicio de rutas está disponible

**Then** el coste devuelto es (distancia en km / 100 × 15 × 0,20) € redondeado a céntimos, con el origen manual del precio

### E-16-I · Escenario inválido · PA-16-I

**Justificación** la ausencia del precio eléctrico impide completar la estimación.

**Análisis** Comprobar que no se sustituye el precio ausente por cero.

**Given** Ana tiene Centro, UJI y Eléctrico, el servicio real de rutas funciona y el acceso al precio automático de electricidad está interrumpido

**When** calcula la ruta con Eléctrico entre esos lugares

**Then** se devuelve el trayecto y el coste queda sin valor al no disponer de precio eléctrico

**Límites y variantes** Convertir 200 €/MWh a 0,20 €/kWh. A ese precio, 100 km con consumo de 15 kWh/100 km cuestan 3,00 €. La referencia mayorista no es la tarifa doméstica final.


## HU-17 Estimar calorías

R4 · M07, M09

Como usuario quiero estimar las calorías de una ruta a pie o en bicicleta para valorar el esfuerzo.

### E-17-V · Escenario válido · PA-17-V

**Justificación** comprueba las calorías a partir de la duración real obtenida y del peso configurado.

**Análisis** Repetir en bicicleta y con los pesos extremos admitidos.

**Given** Ana tiene Centro y UJI guardados, pesa 70 kg y el servicio de rutas está disponible

**When** calcula una ruta a pie entre Centro y UJI

**Then** se devuelven kcal estimadas con 3,5 × 3,5 × 70 / 200 × duración en minutos, redondeadas al entero más próximo

### E-17-I · Escenario inválido · PA-17-I

**Justificación** un peso de cero no permite una estimación válida.

**Análisis** Probar 19,99 y 300,01 kg y conservar el peso anterior.

**Given** Ana tiene Centro y UJI guardados, peso configurado de 70 kg y el servicio de rutas disponible

**When** intenta guardar un peso de 0 kg para calcular las calorías del trayecto

**Then** se rechaza el valor y permanece el peso de 70 kg

**Límites y variantes** Peso de 20 a 300 kg y bicicleta con MET 6,8. Como referencia, 30 minutos con 70 kg dan 129 kcal a pie y 250 kcal en bicicleta, tras redondear.


## HU-18 Elegir el criterio de ruta

R4 · M07

Como usuario quiero priorizar duración, distancia o coste para escoger una alternativa adecuada.

### E-18-V · Escenario válido · PA-18-V

**Justificación** compara los costes de las alternativas recibidas, sin suponer un recorrido fijo.

**Análisis** Repetir con rapidez, distancia y alternativas empatadas.

**Given** Ana tiene Centro, UJI y Compacto con consumo de 6 l/100 km, usa gasolina manual a 1,60 €/l y ORS está disponible

**When** solicita una ruta en coche entre Centro y UJI con el criterio más económico

**Then** la primera opción tiene coste menor o igual que cada alternativa obtenida y se muestra el origen del precio

### E-18-I · Escenario inválido · PA-18-I

**Justificación** impide calcular una ruta con un criterio que no está admitido.

**Análisis** Repetir con criterio vacío y comprobar que no se consulta ORS.

**Given** Ana tiene Centro y UJI

**When** solicita el criterio desconocido panorámica

**Then** se rechaza el criterio sin consultar rutas ni cambiar preferencias

**Límites y variantes** Con más rápida se minimiza la duración y con más corta la distancia. Una sola opción y los empates son válidos. El criterio económico compara solo las alternativas recibidas.


## HU-19 Guardar una ruta

R4 · M07

Como usuario quiero guardar una ruta calculada para consultarla posteriormente.

### E-19-V · Escenario válido · PA-19-V

**Justificación** comprueba que una ruta calculada puede guardarse para otro momento.

**Análisis** Recuperar y comparar el trazado, las medidas y la fecha.

**Given** Ana tiene un resultado real entre Centro y UJI calculado para su cuenta hace menos de una hora

**When** lo guarda con el nombre Camino a clase

**Then** se crea una ruta propia con ese nombre, geometría, métricas y fecha de cálculo, recuperable en su listado

### E-19-I · Escenario inválido · PA-19-I

**Justificación** impide guardar un resultado que no se ha calculado para esa cuenta.

**Análisis** Repetir con resultado caducado y de otra cuenta.

**Given** Ana no tiene un resultado calculado con identificador X99 para su cuenta

**When** intenta guardar el resultado X99 como Camino a clase

**Then** se rechaza el guardado y la lista de rutas no cambia

**Límites y variantes** Nombre vacío, resultado de más de una hora y doble pulsación. La ruta guardada conserva las métricas originales, la fecha del cálculo y la fuente del precio.


## HU-20 Consultar rutas guardadas

R4 · M08

Como usuario quiero consultar mis rutas guardadas para recuperar un trayecto sin volver a calcularlo.

### E-20-V · Escenario válido · PA-20-V

**Justificación** diferencia recuperar de recalcular con datos nuevos.

**Análisis** Repetir sin conexión con el servicio de rutas.

**Given** Ana tiene Camino a clase guardada con su geometría y sus métricas

**When** abre su lista y selecciona Camino a clase

**Then** recupera la misma geometría y las mismas métricas, identificadas como cálculo histórico

### E-20-I · Escenario inválido · PA-20-I

**Justificación** protege el historial de desplazamientos.

**Análisis** Repetir con sesión caducada sin revelar ningún trayecto.

**Given** no hay sesión válida

**When** se solicita el listado de rutas guardadas

**Then** se deniega el acceso sin revelar nombres ni trayectos

**Límites y variantes** Colección vacía. Precio histórico desactualizado. Fallo del proveedor de rutas no debe impedir leer la copia histórica local.


## HU-21 Eliminar una ruta guardada

R4 · M08

Como usuario quiero eliminar una ruta que no necesito para ordenar mi historial.

### E-21-V · Escenario válido · PA-21-V

**Justificación** delimita el efecto de la eliminación al historial.

**Análisis** Repetir con ruta favorita y con cancelación del borrado.

**Given** Ana tiene Camino a clase y Paseo

**When** confirma eliminar Camino a clase

**Then** solo permanece Paseo y no se alteran sus lugares ni vehículos

### E-21-I · Escenario inválido · PA-21-I

**Justificación** impide borrar datos de otra cuenta.

**Análisis** Repetir con una ruta inexistente y conservar las demás.

**Given** Camino al trabajo pertenece a Luis

**When** Ana intenta eliminar esa ruta

**Then** se rechaza la operación y la ruta de Luis permanece

**Límites y variantes** Cancelar conserva el registro. Identificador ya eliminado. Ruta favorita. Actualización de la lista tras confirmar.


## HU-22 Gestionar favoritos

R5 · M05, M06, M08

Como usuario quiero marcar y desmarcar favoritos para encontrar primero los elementos que uso con frecuencia.

### E-22-V · Escenario válido · PA-22-V

**Justificación** comprueba la misma regla de favoritos en lugares, vehículos y rutas.

**Análisis** Desmarcar cada favorito y volver a consultar las listas.

**Given** Ana tiene sin marcar Centro y UJI, Compacto y Eléctrico, y Camino a clase y Paseo

**When** marca UJI, Eléctrico y Paseo como favoritos y vuelve a consultar las tres listas

**Then** cada elemento marcado conserva su estado y aparece antes que el no favorito de su lista

### E-22-I · Escenario inválido · PA-22-I

**Justificación** impide cambiar los favoritos de otra cuenta en las tres listas.

**Análisis** Repetir por separado para lugar, vehículo y ruta.

**Given** Estación, Furgoneta y Camino al trabajo pertenecen a Luis

**When** Ana intenta cambiar el favorito de cada uno

**Then** cada operación se rechaza y todas las marcas de Luis permanecen intactas

**Límites y variantes** Marcar y desmarcar, todas las entradas favoritas y ninguna favorita. La marca se conserva al recargar. En la interfaz tiene una etiqueta de texto, además del símbolo.


## HU-23 Fijar transporte predeterminado

R5 · M09

Como usuario quiero fijar un modo y, si procede, un vehículo por defecto para preparar rutas con menos pasos.

### E-23-V · Escenario válido · PA-23-V

**Justificación** reduce trabajo repetitivo sin bloquear la elección puntual.

**Análisis** Repetir con bicicleta y a pie, sin vehículo asociado.

**Given** Compacto pertenece a Ana

**When** guarda coche y Compacto como valores predeterminados y abre una planificación nueva

**Then** se seleccionan coche y Compacto, permitiendo cambiarlos para esa consulta

### E-23-I · Escenario inválido · PA-23-I

**Justificación** impide referencias a vehículos ajenos.

**Análisis** Repetir con un vehículo eliminado.

**Given** Furgoneta pertenece a Luis y Compacto es el vehículo predeterminado de Ana

**When** Ana intenta establecer Furgoneta como predeterminada

**Then** se rechaza la referencia y permanece Compacto

**Límites y variantes** Bicicleta o a pie sin vehículo. En una consulta nueva se usan los valores predeterminados. Al reabrir se restaura el último trayecto. En el spike, guardar preferencias inicia una consulta nueva y limpia la selección anterior.


## HU-24 Fijar criterio predeterminado

R5 · M09

Como usuario quiero guardar un criterio de ruta por defecto para no repetir mi preferencia.

### E-24-V · Escenario válido · PA-24-V

**Justificación** comprueba el efecto posterior de guardar, además de la notificación.

**Análisis** Repetir con las tres opciones de criterio admitidas.

**Given** Ana tiene más rápida como criterio predeterminado

**When** guarda más corta y abre una planificación nueva

**Then** aparece más corta como criterio inicial y la preferencia se conserva

### E-24-I · Escenario inválido · PA-24-I

**Justificación** comprueba que un criterio desconocido no cambia la preferencia guardada.

**Análisis** Comprobar que las demás preferencias tampoco cambian.

**Given** Ana tiene más corta como criterio predeterminado

**When** intenta guardar panorámica como criterio

**Then** se rechaza el valor y se conserva más corta

**Límites y variantes** Las tres opciones más rápida, más corta y más económica. Modificación puntual sin sobrescribir el valor por defecto.


## HU-25 Recuperar estado tras un cierre

R6 · M03-M09

Como usuario quiero recuperar contenidos y aspecto al volver a abrir la aplicación para evitar reconfigurarla.

### E-25-V · Escenario válido · PA-25-V

**Justificación** comprueba la conservación del estado confirmado al cerrar y volver a abrir la aplicación.

**Análisis** Comparar las tres listas y todas las preferencias guardadas.

**Given** Ana ha guardado Centro, UJI, Compacto y Camino a clase, ha marcado UJI como favorito y usa tema oscuro y el último trayecto Centro-UJI a pie con criterio más corta

**When** cierra la aplicación y vuelve a abrirla sobre la misma base de datos, iniciando sesión si es necesario

**Then** recupera los mismos registros, favoritos, tema y selección del último trayecto

### E-25-I · Escenario inválido · PA-25-I

**Justificación** un fallo de almacenamiento debe comunicarse sin mostrar datos vacíos como si fueran reales.

**Análisis** Repetir con base inaccesible al arrancar el servidor.

**Given** Ana tiene Centro, Compacto y Camino a clase guardados, pero el almacenamiento no se puede abrir

**When** intenta iniciar la aplicación

**Then** se informa del fallo de almacenamiento y no se presenta una lista vacía como si fuera su estado real

**Límites y variantes** Repetir con sesión caducada y cierre del servidor. El estado confirmado incluye datos, favoritos, preferencias y el último trayecto. Los borradores y resultados sin guardar no se recuperan. Esta interpretación del estado deberá revisarse con el profesorado.


## HU-26 Recuperar estado tras interrupción

R6 · M03-M09

Como usuario quiero conservar los datos confirmados tras un cierre involuntario para no perder el trabajo guardado.

### E-26-V · Escenario válido · PA-26-V

**Justificación** comprueba que una interrupción no borra un dato ya guardado.

**Análisis** Reabrir la base en otro proceso y comprobar duplicados.

**Given** el servidor ha confirmado el alta de Centro en una base de datos en disco

**When** se fuerza el cierre del proceso con SIGKILL y se abre otro sobre la misma base

**Then** Centro permanece íntegro y se puede consultar sin duplicados

### E-26-I · Escenario inválido · PA-26-I

**Justificación** el guardado interrumpido no puede considerarse terminado ni dejar datos parciales.

**Análisis** Interrumpir antes de confirmar y comprobar los datos anteriores.

**Given** Centro está confirmado y una transacción ha escrito UJI, pero aún no ha ejecutado COMMIT

**When** el proceso se interrumpe antes del COMMIT y después se abre la misma base de datos

**Then** Centro se conserva y UJI no aparece como alta confirmada. No hay datos parciales

**Límites y variantes** Interrumpir antes y después del COMMIT para distinguir una operación pendiente de una confirmada. La terminación del proceso no equivale a un fallo físico del disco.
