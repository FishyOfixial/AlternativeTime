# Sprint Frontend 8`r`n`r`n## Estado`r`n`r`nEn ejecucion.`r`n`r`n## Resumen

Este sprint cubre los requerimientos pendientes de operacion comercial que hoy no
estan visibles en la app: apartados, abonos y alertas internas de seguimiento.
El objetivo es cerrar el flujo entre inventario, clientes, ventas y finanzas sin
abrir el modulo de usuarios.

## Objetivo del sprint

- implementar frontend operativo de apartados y abonos
- reflejar estados y transiciones `available -> reserved -> sold`
- mostrar alertas operativas en dashboard y vistas de trabajo

## Resultado esperado

Al cerrar este sprint, el frontend debe:

- registrar un apartado para un reloj disponible
- listar apartados por estado (`active`, `completed`, `cancelled`)
- capturar abonos parciales y actualizar saldo pendiente en UI
- mostrar alertas de apartados vencidos e inventario envejecido

## Alcance

### Incluye

- ruta `/layaways` y detalle `/layaways/:id`
- formulario de alta de apartado con cliente y reloj
- formulario de abono con metodo/cuenta/monto
- resumen financiero de apartado (precio acordado, abonado, saldo)
- indicadores visuales de atraso y vencimiento

### Excluye

- notificaciones por correo, WhatsApp o push
- conciliacion bancaria avanzada
- modulo de usuarios o permisos por rol en frontend

## Interfaces publicas del sprint

- `GET /api/layaways/`
- `POST /api/layaways/`
- `GET /api/layaways/{id}/`
- `POST /api/layaways/{id}/payments/`
- `GET /api/notifications/` (si backend lo expone)

## Contrato esperado de UI e integracion

- solo productos `available` pueden iniciar apartado
- un apartado debe mostrar siempre `agreed_price`, `amount_paid`, `balance_due`
- si `balance_due <= 0`, el estado se refleja como completado y producto vendido
- la UI no inventa calculos que backend no soporte; usa datos persistidos

## Plan de trabajo por pasos

### Paso 1. Base de rutas y listados

- crear navegacion de apartados
- listado con filtros por estado, cliente y rango de fecha

**Entregable**

Listado de apartados con estados y KPIs basicos.

### Paso 2. Alta de apartado

- seleccionar reloj disponible
- seleccionar cliente existente o crear cliente desde el flujo
- capturar precio acordado y fecha limite opcional

**Entregable**

Apartado creado y visible de extremo a extremo.

### Paso 3. Registro de abonos

- capturar monto, metodo, cuenta y notas
- actualizar resumen del apartado al confirmar

**Entregable**

Flujo de pagos parciales funcional.

### Paso 4. Alertas operativas

- mostrar apartados vencidos
- mostrar inventario > 60 dias con prioridad visual

**Entregable**

Panel de seguimiento operativo integrado.

## Criterios de aceptacion

- se puede crear apartado y registrar al menos un abono
- la UI actualiza saldo pendiente y estado sin refresco manual complejo
- los estados del reloj se reflejan en inventario y ventas
- alertas visibles y accionables en contexto operativo

## Dependencias del sprint

- backend con modulo `layaways` y `layaway_payments`
- consistencia de integracion con `sales` y `finance`
- Sprint Frontend 7 estable

## Riesgos y notas

- este sprint depende de backend aun no implementado en la rama principal
- evitar duplicar reglas de negocio entre frontend y backend
- cuidar conflictos entre venta directa y cierre de apartado

## Suposiciones y defaults elegidos

- apartados no reemplazan venta directa, son flujo paralelo
- fecha limite es opcional pero recomendable para alertas
- notificaciones internas pueden iniciar como feed simple en UI

