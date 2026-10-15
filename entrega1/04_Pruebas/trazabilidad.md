# Trazabilidad de requisitos, historias y pantallas

Los 52 códigos PA corresponden a las pruebas ejecutables de [aceptación](../02_Spike/tests/acceptance.test.ts), definidas por identificador en [scenarios.ts](../02_Spike/tests/support/scenarios.ts). Los escenarios elegidos son E-xx-V y E-xx-I1. El archivo Gherkin es el catálogo de lectura. Las otras filas de las tablas amplían el análisis sin añadir pruebas seleccionadas.

| Requisito | Historia | Escenarios y pruebas | Pantallas de Figma |
| --- | --- | --- | --- |
| R1 | HU-01 Registrar una cuenta | E-01-V / PA-01-V y E-01-I1 / PA-01-I | M01 |
| R1 | HU-02 Iniciar sesión | E-02-V / PA-02-V y E-02-I1 / PA-02-I | M01 |
| R1 | HU-03 Cerrar sesión | E-03-V / PA-03-V y E-03-I1 / PA-03-I | M02 |
| R1 | HU-04 Eliminar la cuenta | E-04-V / PA-04-V y E-04-I1 / PA-04-I | M02 |
| R2 | HU-05 Guardar por coordenadas | E-05-V / PA-05-V y E-05-I1 / PA-05-I | M03 |
| R2 | HU-06 Guardar por topónimo | E-06-V / PA-06-V y E-06-I1 / PA-06-I | M03 |
| R2 | HU-07 Consultar lugares | E-07-V / PA-07-V y E-07-I1 / PA-07-I | M04 |
| R2 | HU-08 Eliminar un lugar | E-08-V / PA-08-V y E-08-I1 / PA-08-I | M04 |
| R2 | HU-09 Elegir lugares en el mapa | E-09-V / PA-09-V y E-09-I1 / PA-09-I | M03 |
| R3 | HU-10 Dar de alta un vehículo | E-10-V / PA-10-V y E-10-I1 / PA-10-I | M05 |
| R3 | HU-11 Consultar vehículos | E-11-V / PA-11-V y E-11-I1 / PA-11-I | M05 |
| R3 | HU-12 Eliminar un vehículo | E-12-V / PA-12-V y E-12-I1 / PA-12-I | M05 |
| R3 | HU-13 Modificar un vehículo | E-13-V / PA-13-V y E-13-I1 / PA-13-I | M05 |
| R4 | HU-14 Calcular y visualizar una ruta | E-14-V / PA-14-V y E-14-I1 / PA-14-I | M06 |
| R4 | HU-15 Estimar coste de combustible | E-15-V / PA-15-V y E-15-I1 / PA-15-I | M07, M09 |
| R4 | HU-16 Estimar coste eléctrico | E-16-V / PA-16-V y E-16-I1 / PA-16-I | M07, M09 |
| R4 | HU-17 Estimar calorías | E-17-V / PA-17-V y E-17-I1 / PA-17-I | M07, M09 |
| R4 | HU-18 Elegir el criterio de ruta | E-18-V / PA-18-V y E-18-I1 / PA-18-I | M06 |
| R4 | HU-19 Guardar una ruta | E-19-V / PA-19-V y E-19-I1 / PA-19-I | M07 |
| R4 | HU-20 Consultar rutas guardadas | E-20-V / PA-20-V y E-20-I1 / PA-20-I | M08 |
| R4 | HU-21 Eliminar una ruta guardada | E-21-V / PA-21-V y E-21-I1 / PA-21-I | M08 |
| R5 | HU-22 Gestionar favoritos | E-22-V / PA-22-V y E-22-I1 / PA-22-I | M04, M05, M08 |
| R5 | HU-23 Fijar transporte predeterminado | E-23-V / PA-23-V y E-23-I1 / PA-23-I | M09 |
| R5 | HU-24 Fijar criterio predeterminado | E-24-V / PA-24-V y E-24-I1 / PA-24-I | M09 |
| R6 | HU-25 Recuperar estado tras un cierre | E-25-V / PA-25-V y E-25-I1 / PA-25-I | M10 |
| R6 | HU-26 Recuperar estado tras interrupción | E-26-V / PA-26-V y E-26-I1 / PA-26-I | M10 |
