# Reglas y método de prueba

## Reglas comunes

**RD-01. Cuenta y sesión.** El registro requiere un correo válido y único y una contraseña válida. Consultar o gestionar datos requiere una sesión activa. Cerrar sesión conserva los datos. Eliminar la cuenta exige confirmar la contraseña y elimina sus datos asociados.

**RD-02. Guardado y errores.** Solo se informa de éxito cuando la operación se confirma. Una entrada inválida o un fallo no debe dejar cambios parciales. Un fallo de carga se muestra como error, sin presentarlo como una lista vacía.

**RD-03. Lugares.** Se guardan un nombre y coordenadas válidas. La búsqueda por topónimo exige elegir un resultado y el alta por mapa exige seleccionar un punto. Una búsqueda sin coincidencias o una lista sin lugares son resultados válidos.

**RD-04. Vehículos.** Se indican nombre, tipo y consumo. Gasolina y diésel usan l/100 km y los eléctricos kWh/100 km. Modificar conserva el identificador. Eliminar el vehículo predeterminado limpia su referencia.

**RD-05. Rutas.** Los extremos deben ser válidos y distintos. Se admiten puntos de Explorar sin guardarlos y lugares guardados. Los modos son coche, bicicleta y a pie. Sin respuesta válida del proveedor no se presenta una ruta nueva como calculada.

**RD-06. Estimaciones.** El coste es distancia en km/100 por consumo por precio, con unidades coherentes. Puede usarse un vehículo o una referencia editable. Sin precio disponible puede consultarse el trayecto sin coste. Las calorías se estiman como MET por 3,5 por peso/200 por minutos, con MET propuestos de 3,5 a pie y 6,8 en bicicleta. Se redondea al presentar.

**RD-07. Criterio.** Se compara duración, distancia o coste entre las alternativas recibidas. Una sola alternativa es válida. Sin datos de coste se avisa y se usa la distancia como referencia. El precio indica su origen y fecha cuando procede. El precio eléctrico mayorista se distingue de una tarifa final.

**RD-08. Rutas guardadas.** Guardar requiere un resultado calculado y un nombre. Se conservan su geometría, métricas y datos del cálculo como copia histórica, sin recalcularlos al consultar o modificar lugares y vehículos.

**RD-09. Preferencias.** Los favoritos aparecen primero y su marca se conserva. El modo, el vehículo opcional y el criterio predeterminados se aplican a una planificación nueva. Una elección puntual no cambia esos valores.

**RD-10. Persistencia.** Se recuperan los datos confirmados, favoritos, tema y último trayecto tras un cierre normal o una interrupción. Una escritura interrumpida queda completa o no se aplica. El alcance de borradores y resultados sin guardar queda pendiente de confirmar con el profesorado.


## Validaciones de entrada

Los nombres y el correo se guardan sin espacios exteriores. El correo se compara en minúsculas y la contraseña se comprueba tal como se escribió.

| **Dato** | **Valores admitidos** |
| --- | --- |
| Nombre de cuenta o vehículo | De 1 a 70 caracteres. |
| Correo y contraseña | Correo con formato válido y hasta 254 caracteres. Contraseña de 10 a 128. |
| Lugar, ruta y topónimo | Nombre de lugar o ruta de 1 a 120 caracteres. Topónimo de 1 a 200. |
| Coordenadas | Latitud de -90 a 90 y longitud de -180 a 180, con números finitos. |
| Consumo, precio y peso | Consumo de 0,1 a 100. Precio manual de 0,001 a 20 euros/l o euros/kWh. Peso de 20 a 300 kg. |

Los límites de campos, consumos, precios, peso y los MET son propuestas pendientes de validación con el profesorado. Las pruebas de frontera consideran el valor admitido y el inmediatamente exterior.


## Datos y criterio de prueba

Cada escenario prepara sus datos de forma independiente. Salvo indicación contraria, Ana tiene una sesión activa, con ana@example.com y RutaSegura2026. Centro está en (39.9864, -0.0513) y UJI en (39.9946, -0.0684). Compacto es de gasolina, con 6 l/100 km, y Eléctrico consume 15 kWh/100 km. Camino a clase va de Centro a UJI y Paseo hace el recorrido inverso. Cada elemento tiene un identificador propio.

Se seleccionan dos escenarios por historia, uno válido y otro inválido, y se conserva una variante relevante en la tabla. Cada prueba seleccionada incluye justificación, análisis breve de casos extremos y Given-When-Then con datos concretos. Si un caso no está definido, se consulta al profesorado.

Según la metodología docente [2], aceptación comprueba la lógica de negocio con las dependencias reales necesarias. Integración sustituye al menos una dependencia por un doble. Los formularios, mapas y mensajes se comprueban en el navegador. Para persistencia se reabre la misma base de datos en disco desde otro proceso. Los fallos se provocan de forma controlada y se distinguen de una entrada incorrecta.
