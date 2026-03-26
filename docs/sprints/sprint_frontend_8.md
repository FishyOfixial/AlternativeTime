# Sprint Frontend 8

## Resumen

Este sprint cubre lo que faltaba del flujo comercial de la spec: apartados,
abonos, alertas visuales y seguimiento operativo. La meta es que el frontend
represente productos `apartado`, pagos parciales y vencimientos sin romper la
base actual de inventario y ventas.

## Objetivo del sprint

- implementar apartados y abonos en frontend
- conectar alertas operativas con inventario y clientes
- completar la transicion del flujo comercial antes de la capa administrativa

## Resultado esperado

Al cerrar este sprint, el frontend debe:

- registrar un apartado sobre un reloj disponible
- listar apartados activos, completados y cancelados
- permitir registrar abonos y mostrar saldo pendiente
- visualizar alertas de apartados vencidos e inventario viejo

## Alcance

### Incluye

- rutas de apartados y detalle operativo
- formularios de alta de apartado y abono
- estados visuales `disponible`, `apartado`, `vendido`
- panel o componente de alertas internas

### Excluye

- notificaciones push o correo
- automatizaciones de mensajeria externa
- conciliacion financiera avanzada

## Interfaces publicas del sprint

- `GET /api/layaways/`
- `POST /api/layaways/`
- `GET /api/layaways/{id}/`
- `POST /api/layaways/{id}/payments/`
- consumo de notificaciones o alertas si backend las expone

## Contrato esperado de UI e integracion

- solo un reloj disponible puede apartarse
- la UI debe mostrar precio acordado, total abonado y saldo pendiente
- al completar el apartado, el flujo debe reflejar que se generó una venta final
- las alertas deben ser visibles pero no invasivas y quedar integradas a la
  shell actual

## Plan de trabajo por pasos

### Paso 1. Implementar listado y detalle de apartados

- mostrar estados, cliente y fechas clave
- separar activos, completados y cancelados

**Entregable**

Modulo base de apartados navegable.

### Paso 2. Implementar formulario de alta de apartado

- seleccionar reloj y cliente
- capturar precio acordado, fechas y condiciones

**Entregable**

Alta de apartado de extremo a extremo.

### Paso 3. Implementar registro de abonos

- capturar monto, metodo y cuenta destino
- recalcular saldo pendiente visible en UI

**Entregable**

Flujo operativo de pagos parciales.

### Paso 4. Integrar alertas y estados visuales

- mostrar apartados vencidos
- mostrar inventario envejecido y su etiqueta automatica

**Entregable**

Experiencia operativa completa para seguimiento comercial.

## Criterios de aceptacion

- el frontend permite registrar y consultar apartados reales
- los abonos actualizan saldo pendiente y estado visible
- el reloj cambia de estado coherentemente en la UI
- existen alertas visibles para apartados vencidos o inventario viejo

## Dependencias del sprint

- Sprint Frontend 7 implementado
- backend con modelos y endpoints de `Layaway`, `LayawayPayment` y alertas
- inventario y clientes ya estables sobre la spec

## Riesgos y notas

- este sprint depende de backend adicional que hoy no está implementado
- no se debe mezclar venta directa y apartado en el mismo formulario principal
- el mockup final debe conservar claridad visual aunque agregue más estados

## Suposiciones y defaults elegidos

- apartados son una evolución posterior al flujo de venta directa
- las alertas iniciales serán internas dentro de la app
- si notificaciones backend llegan parciales, la UI debe activar solo la parte
  realmente soportada
