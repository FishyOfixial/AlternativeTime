# Sprint Frontend 7

## Resumen

Este sprint implementa las pantallas de finanzas y reportes en frontend. El
objetivo es llevar a la interfaz los endpoints agregados ya disponibles y
conectar estos modulos con el dashboard y la navegacion principal.

## Objetivo del sprint

- implementar finanzas y reportes en frontend
- exponer informacion consolidada en pantallas administrativas
- reutilizar componentes KPI y tablas agregadas

## Resultado esperado

Al cerrar este sprint, el frontend debe:

- mostrar un resumen financiero inicial
- mostrar reportes agregados de ventas e inventario
- navegar desde dashboard hacia finanzas y reportes
- representar estados sin datos de forma clara

## Alcance

### Incluye

- pantalla de finanzas
- pantalla de reportes
- integracion con endpoints agregados existentes
- reutilizacion de tarjetas, paneles y tablas resumidas

### Excluye

- motor avanzado de filtros
- exportaciones complejas
- construccion de reportes personalizados
- analitica avanzada no soportada por backend

## Interfaces publicas del sprint

- `GET /api/finance/summary/`
- `GET /api/reports/sales-summary/`
- `GET /api/reports/inventory-summary/`
- rutas `/finance` y `/reports`

## Contrato esperado de UI e integracion

- el frontend consume los endpoints agregados existentes sin asumir nuevas
  estructuras
- si el backend agrega filtros por periodo, la UI puede incorporarlos; si no,
  las pantallas deben mantenerse funcionales con el contrato actual

## Plan de trabajo por pasos

### Paso 1. Crear servicios de finanzas y reportes

- centralizar el consumo de endpoints agregados
- estandarizar manejo de errores y transformaciones minimas de datos

**Entregable**

Servicios listos para alimentar dashboard y pantallas analiticas.

### Paso 2. Implementar pantalla de finanzas

- mostrar resumen financiero inicial
- presentar indicadores de manera administrativa y legible

**Entregable**

Vista de finanzas util para consulta operacional.

### Paso 3. Implementar pantalla de reportes

- mostrar reportes de ventas e inventario
- reutilizar tablas o tarjetas para la informacion consolidada

**Entregable**

Vista de reportes conectada a datos reales.

### Paso 4. Conectar con dashboard y navegacion

- agregar enlaces profundos desde el dashboard
- asegurar coherencia de navegacion entre modulos

**Entregable**

Experiencia integrada entre analitica y operacion.

## Criterios de aceptacion

- finanzas muestra datos reales desde la API
- reportes muestra agregados reales desde la API
- el dashboard enlaza a estas vistas
- las pantallas manejan estados de vacio y error de forma consistente

## Dependencias del sprint

- Sprint Frontend 6 implementado
- endpoints agregados del backend ya disponibles
- dashboard base ya implementado

## Riesgos y notas

- no inventar filtros si el backend aun no los soporta
- mantener expectativas de UI alineadas al estado real de `finance` y `reports`
- evitar convertir este sprint en rediseño completo del dashboard

## Suposiciones y defaults elegidos

- el backend ya expone un resumen financiero y dos reportes agregados
- la primera version de finanzas y reportes sera de consulta, no de edicion
- cualquier filtro avanzado queda como evolucion posterior
