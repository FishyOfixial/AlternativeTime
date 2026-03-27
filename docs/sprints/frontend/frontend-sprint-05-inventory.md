# Sprint Frontend 5

## Resumen

Este sprint implementa el modulo de inventario en el frontend. El objetivo es
dejar la gestion de productos o existencias operable desde la UI y reutilizar
el patron CRUD construido para clientes.

## Objetivo del sprint

- implementar la interfaz de inventario
- integrar el frontend con el recurso `inventory`
- consolidar componentes reutilizables de tabla, detalle y formulario

## Resultado esperado

Al cerrar este sprint, el frontend debe:

- listar items de inventario
- mostrar detalle de producto
- permitir crear y editar inventario
- reflejar validaciones de backend en la UI

## Alcance

### Incluye

- vista de listado
- vista de detalle
- formulario de alta
- formulario de edicion
- servicios de inventario
- feedback visual de guardado y error

### Excluye

- filtros avanzados de catalogo
- movimientos complejos de stock
- carga masiva
- permisos por rol

## Interfaces publicas del sprint

- `GET /api/inventory/`
- `POST /api/inventory/`
- `GET /api/inventory/{id}/`
- `PATCH /api/inventory/{id}/`
- `DELETE /api/inventory/{id}/`
- rutas `/inventory`, `/inventory/new` y `/inventory/:id`

## Contrato esperado de UI e integracion

- el modulo debe reflejar validaciones basicas ya existentes, como restricciones
  de `sku`, precio y stock
- los formularios deben traducir errores de API a mensajes comprensibles para el
  usuario

## Plan de trabajo por pasos

### Paso 1. Crear el servicio de inventario

- centralizar operaciones CRUD del modulo
- mantener las llamadas HTTP alineadas al contrato del backend

**Entregable**

Servicio de inventario reutilizable en paginas y formularios.

### Paso 2. Implementar listado de inventario

- mostrar items en tabla o vista base consistente con el sistema
- exponer acceso a detalle y alta de nuevo item

**Entregable**

Pantalla principal de inventario operativa.

### Paso 3. Implementar detalle del item

- mostrar datos principales del producto o existencia
- dejar acciones de edicion visibles

**Entregable**

Vista de detalle de inventario integrada al flujo del modulo.

### Paso 4. Implementar formularios

- crear alta y edicion
- manejar validaciones visuales y errores devueltos por la API
- confirmar guardado exitoso

**Entregable**

Modulo CRUD base de inventario usable desde frontend.

## Criterios de aceptacion

- el listado de inventario se consume desde el backend real
- existe detalle por item
- la UI permite crear y editar inventario
- los errores de validacion del backend son visibles en frontend
- el modulo reutiliza componentes y convenciones compartidas

## Dependencias del sprint

- Sprint Frontend 4 implementado
- endpoints de `inventory` disponibles en backend
- shell autenticada ya estable

## Riesgos y notas

- no introducir reglas complejas de inventario que el backend aun no soporte
- mantener el foco en CRUD base del MVP
- cualquier vista alternativa tipo tarjetas debe alinearse al mockup sin
  duplicar toda la logica

## Suposiciones y defaults elegidos

- el backend de inventario ya expone CRUD autenticado
- el frontend reutilizara el patron del modulo de clientes
- operaciones avanzadas de stock quedan fuera de este sprint
