# Sprint Frontend 6

## Resumen

Este sprint implementa el flujo operativo principal del frontend: ventas. El
foco esta en captura de transacciones, seleccion de cliente e items, resumen de
venta y manejo de errores de negocio devueltos por backend.

## Objetivo del sprint

- implementar la interfaz de ventas
- registrar ventas de extremo a extremo desde la UI
- conectar ventas con clientes e inventario ya visibles en frontend

## Resultado esperado

Al cerrar este sprint, el frontend debe:

- listar ventas
- ofrecer un formulario de captura de venta
- permitir seleccionar cliente e items
- mostrar subtotales y resumen antes de enviar
- manejar errores de negocio del backend sin romper la experiencia

## Alcance

### Incluye

- vista de listado de ventas
- formulario de nueva venta
- resumen de venta previo a confirmacion
- integracion con clientes e inventario para seleccion de datos
- feedback de exito o error

### Excluye

- devoluciones
- cancelaciones complejas
- descuentos avanzados
- reglas de caja o cierres diarios
- permisos por rol

## Interfaces publicas del sprint

- `GET /api/sales/`
- `POST /api/sales/`
- `GET /api/sales/{id}/` si el backend ya lo expone o se requiere para detalle
- rutas `/sales` y `/sales/new`

## Contrato esperado de UI e integracion

- el formulario de ventas debe apoyarse en clientes e inventario ya existentes
- la UI debe representar errores de stock, validacion o negocio emitidos por el
  backend
- el detalle de una venta puede ser basico si el contrato backend aun es simple

## Plan de trabajo por pasos

### Paso 1. Crear el servicio de ventas

- centralizar operaciones del modulo
- alinear frontend con el contrato real de la API de ventas

**Entregable**

Servicio de ventas listo para captura y consulta.

### Paso 2. Implementar listado de ventas

- mostrar ventas registradas
- enlazar a nueva venta o detalle si aplica

**Entregable**

Vista principal del modulo de ventas.

### Paso 3. Implementar formulario de captura

- seleccionar cliente
- agregar items de inventario
- calcular resumen o subtotales del lado UI cuando sea util

**Entregable**

Flujo de captura de venta completo en frontend.

### Paso 4. Integrar envio y respuesta del backend

- enviar la venta a la API
- mostrar confirmacion de exito
- manejar errores de negocio de manera visible y comprensible

**Entregable**

Registro de venta de extremo a extremo desde la UI.

## Criterios de aceptacion

- el frontend permite registrar una venta real contra el backend
- la venta relaciona cliente e items de inventario
- el usuario recibe confirmacion o error claro segun el resultado
- existe una vista de listado para consultar ventas registradas

## Dependencias del sprint

- Sprint Frontend 5 implementado
- endpoints de `sales` disponibles en backend
- clientes e inventario ya accesibles desde frontend

## Riesgos y notas

- el contrato exacto de items debe seguir lo que backend ya exponga
- no inventar reglas de negocio no confirmadas
- si aparecen validaciones complejas, deben tratarse como dependencia del
  backend y no forzarse en frontend

## Suposiciones y defaults elegidos

- el backend de ventas ya soporta el flujo base del MVP
- este sprint prioriza captura y consulta basica, no operacion avanzada
- la UI consumira solo contratos reales ya disponibles
