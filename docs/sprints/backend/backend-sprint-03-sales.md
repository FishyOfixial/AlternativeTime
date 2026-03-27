# Sprint Backend 3

## Resumen

Este sprint implementa el modulo de ventas del backend sobre la base ya creada
por `clients` e `inventory`. El foco esta en registrar ventas de forma
transaccional, calcular totales desde backend y descontar stock sin dejar datos
inconsistentes.

## Objetivo del sprint

- implementar el modulo `sales`
- registrar ventas con uno o varios items
- relacionar ventas con clientes e inventario
- garantizar consistencia de stock y total desde backend

## Resultado esperado

Al cerrar este sprint, el backend debe:

- exponer endpoints de ventas autenticados
- crear ventas con items asociados
- calcular subtotales y total en backend
- rechazar ventas con stock insuficiente
- descontar inventario solo cuando toda la venta sea valida

## Alcance

### Incluye

- app `sales`
- modelo `Sale`
- modelo `SaleItem`
- endpoint para crear ventas
- endpoint para listar y consultar ventas
- logica transaccional para descuento de stock
- pruebas de stock, total y atomicidad

### Excluye

- anulaciones y devoluciones
- descuentos avanzados
- impuestos complejos
- finanzas agregadas
- reportes
- permisos por rol

## Interfaces publicas del sprint

- `GET /api/sales/`
- `POST /api/sales/`
- `GET /api/sales/{id}/`

## Contrato esperado de recursos

### Sale

Campos iniciales:

- `id`
- `client`
- `created_by`
- `total`
- `created_at`
- `updated_at`

### Sale item

Campos iniciales:

- `id`
- `sale`
- `inventory_item`
- `quantity`
- `unit_price`
- `subtotal`

## Reglas de negocio del sprint

- una venta puede tener uno o varios items
- cada item referencia un producto existente en inventario
- `unit_price` y `subtotal` se calculan desde backend al momento de la venta
- `total` se calcula como suma de subtotales
- si cualquier item no tiene stock suficiente, la venta completa falla
- si la venta falla, no debe persistirse parcialmente ni modificar stock

## Plan de trabajo por pasos

### Paso 1. Crear la app `sales`

- crear y registrar la app
- definir `Sale` y `SaleItem`
- relacionar `Sale` con cliente opcional y usuario creador
- relacionar `SaleItem` con inventario

**Entregable**

Persistencia base del modulo de ventas.

### Paso 2. Definir serializers de venta

- serializer de lectura para venta e items
- serializer de escritura para crear una venta con multiples items
- validaciones de cantidad y referencias requeridas

**Entregable**

Contrato de entrada y salida de ventas listo para API.

### Paso 3. Implementar logica transaccional

- usar una transaccion atomica para la creacion de la venta
- validar stock antes de descontar
- calcular `unit_price`, `subtotal` y `total` en backend
- descontar stock solo cuando toda la venta sea valida

**Entregable**

Creacion de ventas consistente y segura.

### Paso 4. Exponer endpoints

- registrar rutas bajo `/api/sales/`
- permitir listado y detalle
- permitir creacion autenticada

**Entregable**

Modulo `sales` accesible desde frontend.

### Paso 5. Agregar pruebas

- crear venta con un item
- crear venta con varios items
- rechazar venta por stock insuficiente
- verificar descuento correcto de stock
- verificar calculo correcto de total
- verificar atomicidad cuando un item invalida toda la venta

**Entregable**

Cobertura minima para la logica critica de ventas.

### Paso 6. Cierre del sprint

- actualizar documentacion tecnica si cambia alguna convencion
- dejar base lista para Sprint Backend 4: `finance` y `reports`

**Entregable**

Backend preparado para consolidacion y reportes sobre ventas reales.

## Criterios de aceptacion

- existe app `sales` separada
- las ventas se crean bajo `/api/sales/`
- el backend calcula el total final
- no se permite vender inventario inexistente o sin stock
- el stock se actualiza correctamente
- una venta fallida no deja datos parciales
- existen pruebas de la logica transaccional

## Dependencias del sprint

- Sprint Backend 1 implementado
- Sprint Backend 2 implementado
- auth JWT funcional
- clientes e inventario ya disponibles

## Riesgos y notas

- este sprint introduce la primera logica de negocio realmente transaccional
- no se debe dejar el calculo de precios o totales al frontend
- no mezclar en esta etapa cancelaciones o devoluciones

## Suposiciones y defaults elegidos

- `client` en la venta puede ser opcional para no bloquear ventas rapidas
- el precio final de venta se toma desde inventario al momento de crear la venta
- no se implementan impuestos ni descuentos complejos en esta etapa
- todos los endpoints de ventas siguen autenticados por defecto
