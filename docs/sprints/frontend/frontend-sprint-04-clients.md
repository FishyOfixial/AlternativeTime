# Sprint Frontend 4

## Resumen

Este sprint implementa el modulo de clientes en el frontend. El objetivo es
dejar una experiencia CRUD basica para consulta, alta y edicion, reutilizando
la arquitectura construida en los sprints previos.

## Objetivo del sprint

- implementar la interfaz de clientes
- integrar el frontend con el recurso `clients`
- establecer un patron reutilizable para modulos CRUD administrativos

## Resultado esperado

Al cerrar este sprint, el frontend debe:

- listar clientes
- mostrar detalle de cliente
- permitir crear y editar clientes
- representar errores y estados vacios del modulo

## Alcance

### Incluye

- vista de listado
- vista de detalle
- formulario de alta
- formulario de edicion
- servicios de clientes
- componentes reutilizables de tabla y formulario

### Excluye

- busqueda avanzada
- paginacion compleja
- filtros avanzados
- historial comercial del cliente
- permisos por rol

## Interfaces publicas del sprint

- `GET /api/clients/`
- `POST /api/clients/`
- `GET /api/clients/{id}/`
- `PATCH /api/clients/{id}/`
- `DELETE /api/clients/{id}/`
- rutas `/clients` y `/clients/:id`

## Contrato esperado de UI e integracion

- la tabla consume el listado autenticado de clientes
- el formulario reutiliza la capa `services` y el manejo comun de errores
- la eliminacion solo se implementa si el flujo de UI ya esta claro; en caso
  contrario puede documentarse como siguiente paso del modulo

## Plan de trabajo por pasos

### Paso 1. Crear el servicio de clientes

- centralizar llamadas CRUD del modulo
- mapear el contrato actual del backend sin dispersar llamadas HTTP

**Entregable**

Servicio de clientes listo para reutilizarse en paginas y componentes.

### Paso 2. Implementar listado de clientes

- construir tabla base
- mostrar estados de carga, error y vacio
- enlazar cada registro con su detalle

**Entregable**

Vista principal del modulo de clientes.

### Paso 3. Implementar detalle de cliente

- mostrar informacion relevante del recurso
- dejar accesos claros para editar

**Entregable**

Vista de detalle navegable desde el listado.

### Paso 4. Implementar formularios de alta y edicion

- crear formulario reutilizable
- integrar validaciones basicas de frontend
- enviar datos al backend con feedback visual

**Entregable**

CRUD base de clientes listo desde la UI.

## Criterios de aceptacion

- el listado de clientes carga desde el backend real
- existe una vista de detalle por cliente
- la UI permite crear y editar clientes
- los estados de carga, error y vacio son consistentes
- el modulo reutiliza la arquitectura definida en sprints anteriores

## Dependencias del sprint

- Sprint Frontend 3 implementado
- endpoints de `clients` disponibles en backend
- autenticacion ya operativa en frontend

## Riesgos y notas

- no sobredisenar filtros o paginacion antes de necesitarlos
- la eliminacion debe alinearse al comportamiento real del backend
- mantener el modulo lo bastante generico para servir de referencia a
  inventario

## Suposiciones y defaults elegidos

- el backend de clientes ya expone CRUD autenticado
- este sprint prioriza listado, detalle y formularios base
- funcionalidades avanzadas de consulta quedan para una etapa posterior
