# Sprint Backend 2

## Resumen

Este sprint implementa los primeros modulos de negocio del backend: `clients` e
`inventory`. El objetivo es dejar una API autenticada y usable para operaciones
CRUD basicas, con validaciones iniciales, pruebas y una estructura coherente con
la base definida en Sprint Backend 1.

## Objetivo del sprint

- implementar el modulo de clientes
- implementar el modulo de inventario
- dejar ambos recursos listos para ser consumidos por el frontend
- establecer convenciones reutilizables para los siguientes modulos del backend

## Resultado esperado

Al cerrar este sprint, el backend debe:

- exponer CRUD autenticado para clientes
- exponer CRUD autenticado para inventario
- validar unicidad de SKU en inventario
- validar reglas basicas de precio y stock
- contar con pruebas minimas por recurso

## Alcance

### Incluye

- app `clients`
- app `inventory`
- modelos iniciales
- serializers
- endpoints CRUD
- registro en admin
- pruebas basicas de API
- integracion de rutas bajo `/api/clients/` y `/api/inventory/`

### Excluye

- ventas
- finanzas
- reportes
- filtros avanzados
- paginacion avanzada
- busqueda avanzada
- permisos por rol

## Interfaces publicas del sprint

- `GET /api/clients/`
- `POST /api/clients/`
- `GET /api/clients/{id}/`
- `PATCH /api/clients/{id}/`
- `DELETE /api/clients/{id}/`
- `GET /api/inventory/`
- `POST /api/inventory/`
- `GET /api/inventory/{id}/`
- `PATCH /api/inventory/{id}/`
- `DELETE /api/inventory/{id}/`

## Contrato esperado de recursos

### Client

Campos iniciales:

- `id`
- `name`
- `phone`
- `email`
- `address`
- `is_active`
- `created_at`
- `updated_at`

### Inventory item

Campos iniciales:

- `id`
- `name`
- `sku`
- `description`
- `price`
- `stock`
- `is_active`
- `created_at`
- `updated_at`

## Plan de trabajo por pasos

### Paso 1. Crear la app `clients`

- crear la app y registrarla en settings
- definir el modelo inicial de cliente
- agregar admin basico

**Entregable**

Modulo `clients` registrado y con persistencia lista.

### Paso 2. Exponer API de clientes

- crear serializer de cliente
- crear viewset CRUD
- registrar rutas bajo `/api/clients/`
- dejar los endpoints protegidos por autenticacion JWT

**Entregable**

CRUD de clientes accesible desde la API.

### Paso 3. Crear la app `inventory`

- crear la app y registrarla en settings
- definir el modelo inicial de inventario
- asegurar unicidad de `sku`
- agregar admin basico

**Entregable**

Modulo `inventory` registrado y con persistencia lista.

### Paso 4. Exponer API de inventario

- crear serializer de inventario
- crear viewset CRUD
- registrar rutas bajo `/api/inventory/`
- validar precio y stock no negativos

**Entregable**

CRUD de inventario accesible desde la API.

### Paso 5. Agregar pruebas

- pruebas CRUD para clientes
- pruebas CRUD para inventario
- prueba de proteccion por autenticacion
- prueba de unicidad de `sku`
- prueba de validacion de precio y stock

**Entregable**

Cobertura minima para los dos primeros modulos de negocio.

### Paso 6. Cierre del sprint

- actualizar documentacion tecnica si cambia alguna convencion
- dejar la base lista para Sprint Backend 3: `sales`

**Entregable**

Backend preparado para que ventas se apoye sobre clientes e inventario ya
estables.

## Criterios de aceptacion

- clientes e inventario existen como apps separadas
- los endpoints estan bajo `/api/clients/` y `/api/inventory/`
- todos los endpoints de negocio requieren autenticacion
- el inventario no permite `sku` duplicado
- el inventario no permite precio o stock invalidos
- existen pruebas basicas por cada modulo

## Dependencias del sprint

- Sprint Backend 1 implementado
- autenticacion JWT ya funcional
- estructura modular del backend ya establecida

## Riesgos y notas

- no mezclar reglas futuras de ventas dentro de este sprint
- no adelantar permisos por rol en clientes o inventario
- mantener el modelo lo bastante simple para no bloquear Sprint 3

## Suposiciones y defaults elegidos

- `clients` e `inventory` se implementan como apps Django independientes
- se usaran endpoints CRUD con DRF para acelerar el MVP
- los recursos se mantendran autenticados por defecto
- no se agrega custom user model ni permisos granulares en este sprint
