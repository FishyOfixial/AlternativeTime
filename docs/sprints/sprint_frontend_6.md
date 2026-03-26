# Sprint Frontend 6

## Resumen

Este sprint implementa el modulo de ventas sobre el dominio final definido en
`docs/spec.md`: un reloj por venta, costo snapshot congelado, ganancias reales,
metodo de pago, canal de venta y captura desde una vista operativa completa.

## Objetivo del sprint

- implementar la vista completa de ventas con el contrato final del backend
- unificar el flujo de venta principal con clientes e inventario
- mostrar el impacto financiero y operativo de la venta sin abandonar el mockup

## Resultado esperado

Al cerrar este sprint, el frontend debe:

- listar ventas reales con filtros base
- registrar una venta desde una vista dedicada y no solo desde cliente
- permitir venta con cliente existente o datos libres
- mostrar snapshot de costo, ganancia bruta y porcentaje de ganancia
- reflejar cambios de estado del reloj de forma inmediata en inventario y
  cliente

## Alcance

### Incluye

- ruta `/sales`
- ruta `/sales/new`
- listado de ventas con filtros por fecha, cliente, metodo, canal y marca
- formulario de venta final
- integracion con clientes e inventario
- feedback claro de validaciones de negocio

### Excluye

- devoluciones
- cancelaciones de venta posteriores
- edicion tardia de ventas
- apartados y abonos

## Interfaces publicas del sprint

- `GET /api/sales/`
- `POST /api/sales/`
- `GET /api/sales/{id}/`
- consumo auxiliar de `GET /api/clients/` y `GET /api/inventory/`

## Contrato esperado de UI e integracion

- el formulario debe enviar:
  - `product`
  - `customer` opcional
  - `customer_name` opcional
  - `customer_contact` opcional
  - `sale_date`
  - `payment_method`
  - `sales_channel`
  - `amount_paid`
  - `extras`
  - `sale_shipping_cost`
  - `notes`
- la UI no debe pedir cantidad ni multiples items
- la UI debe tratar cada reloj como pieza individual
- si el backend rechaza una venta por reloj vendido o fecha invalida, el error
  debe verse dentro del formulario

## Plan de trabajo por pasos

### Paso 1. Construir servicio y estado del modulo de ventas

- centralizar consultas, filtros y creacion de ventas
- normalizar el contrato final del backend en frontend

**Entregable**

Base del modulo de ventas conectada a la API final.

### Paso 2. Implementar listado operativo

- mostrar ventas recientes y filtros utiles
- representar reloj, cliente, canal, metodo, monto y ganancia

**Entregable**

Pantalla de ventas util para operacion diaria.

### Paso 3. Implementar formulario de captura final

- seleccionar reloj disponible
- seleccionar cliente o capturar venta libre
- mostrar resumen economico antes de guardar

**Entregable**

Flujo completo de venta alineado al negocio real.

### Paso 4. Conectar el modulo con clientes e inventario

- refrescar pantallas relacionadas despues de vender
- asegurar consistencia visual del estado `vendido`

**Entregable**

Experiencia integrada entre ventas, clientes e inventario.

## Criterios de aceptacion

- el usuario puede registrar una venta real contra el backend final
- la venta siempre corresponde a un solo reloj
- el formulario muestra datos economicos coherentes con costo snapshot y
  ganancia
- el listado de ventas usa datos reales y filtros base

## Dependencias del sprint

- Sprint Frontend 5 implementado
- alineacion pre-Sprint 6 aplicada en backend
- clientes e inventario ya accesibles desde frontend

## Riesgos y notas

- no reintroducir cantidad o multi-item en la UI
- mantener el mockup consistente con la operacion real del negocio
- evitar duplicar logica de calculo que ya existe en backend

## Suposiciones y defaults elegidos

- la venta principal del negocio sigue siendo un reloj por transaccion
- el backend ya expone el contrato final de ventas
- el detalle de cliente puede seguir ofreciendo alta de venta rapida, pero la
  vista oficial del modulo nace en este sprint
