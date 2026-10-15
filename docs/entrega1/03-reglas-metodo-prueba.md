# 3. Reglas y método de prueba

| Objeto | Reglas propuestas |
| --- | --- |
| Cuenta | Correo normalizado, único y de hasta 254 caracteres; nombre de 1 a 70; contraseña de 10 a 128. No se muestran contraseñas en respuestas. |
| Lugar | Nombre de 1 a 120 caracteres; latitud entre -90 y 90 y longitud entre -180 y 180; valores finitos. El usuario confirma el resultado del topónimo. |
| Vehículo | Gasolina, diésel o eléctrico; consumo entre 0.1 y 100 en su unidad; nombre de 1 a 70 caracteres. |
| Cálculo | Distancia en km, duración en minutos para las fórmulas; €/l o €/kWh; precio manual entre 0.001 y 20; peso entre 20 y 300 kg. |
| Propiedad | Cada usuario solo consulta o modifica sus elementos. Una operación inválida no altera el estado confirmado. |
| Persistencia | Escrituras atómicas; favoritos, preferencias y contenidos confirmados recuperables. Rutas guardadas como instantáneas históricas. |
