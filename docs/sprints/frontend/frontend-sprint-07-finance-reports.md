# Sprint Frontend 7

## Resumen

Este sprint implementa finanzas y reportes sobre la nueva base de dominio:
`PurchaseCost`, `Sale`, `FinanceEntry` y dashboard agregado. El objetivo es
pasar de resúmenes básicos a vistas administrativas alineadas a la spec.

## Objetivo del sprint

- construir las pantallas de finanzas y reportes del sistema
- conectar dashboard, finanzas y reportes con datos reales del backend
- preparar el frontend para exportaciones y análisis por periodo

## Resultado esperado

Al cerrar este sprint, el frontend debe:

- mostrar resumen financiero ligado a ingresos y egresos reales
- mostrar reportes operativos de ventas, inventario y rentabilidad
- ofrecer filtros temporales consistentes con dashboard
- dejar lista la superficie de UI para exportar cuando backend lo complete

## Alcance

### Incluye

- pantalla `/finance`
- pantalla `/reports`
- integración con `finance/summary`
- integración con reportes agregados actuales
- componentes reutilizables para tablas, filtros y KPIs

### Excluye

- editor de movimientos financieros manuales
- exportaciones funcionales si backend aún no las expone
- BI avanzada o reportes personalizados de usuario

## Interfaces publicas del sprint

- `GET /api/finance/summary/`
- `GET /api/reports/dashboard-summary/`
- `GET /api/reports/sales-summary/`
- `GET /api/reports/inventory-summary/`
- futuros `GET /api/reports/{type}/export/?format=xlsx|csv`

## Contrato esperado de UI e integracion

- finanzas debe distinguir ingresos por venta y egresos por compra
- reportes debe consumir agregados ya calculados por backend, no recalcularlos
  de forma paralela en frontend
- los filtros de tiempo deben ser coherentes con `month`, `quarter`, `half`,
  `year` y `lifetime`
- si los endpoints de exportacion no existen aun, la UI debe dejar botones o
  affordances inactivos y documentados, no falsas promesas

## Plan de trabajo por pasos

### Paso 1. Consolidar servicios de finanzas y reportes

- normalizar respuestas y filtros
- compartir transformaciones minimas entre dashboard y modulos analiticos

**Entregable**

Servicios estables para consumo analitico.

### Paso 2. Implementar pantalla de finanzas

- mostrar ingresos, egresos, balance y cuentas
- reflejar impacto de compras y ventas sobre el flujo base

**Entregable**

Vista de finanzas alineada al nuevo backend.

### Paso 3. Implementar pantalla de reportes

- mostrar ventas por periodo, inventario actual, marcas y rentabilidad
- reutilizar tablas y KPIs del dashboard sin duplicar diseño

**Entregable**

Vista de reportes administrativa conectada a datos reales.

### Paso 4. Preparar exportaciones y navegación cruzada

- ubicar acciones de exportar donde la spec las exige
- enlazar dashboard, finanzas y reportes como una sola experiencia

**Entregable**

Superficie analitica consistente y escalable.

## Criterios de aceptacion

- finanzas consume datos reales del backend alineados a compras y ventas
- reportes muestra agregados reales y coherentes con dashboard
- los filtros temporales son consistentes entre vistas
- la UI queda preparada para exportes sin inventar contratos no existentes

## Dependencias del sprint

- Sprint Frontend 6 implementado
- backend con `FinanceEntry`, `AccountBalance` y reportes agregados
- dashboard base ya conectado al dominio nuevo

## Riesgos y notas

- no volver a calcular costos de ventas a partir del costo vivo del reloj
- mantener la coherencia visual con el dashboard actual
- evitar acoplar la UI a exportes no disponibles todavía

## Suposiciones y defaults elegidos

- finanzas seguirá siendo una vista de consulta en esta fase
- reportes crecen desde el dashboard actual, no como modulo separado del resto
- la exportacion completa puede materializarse en backend en una iteracion
  posterior del mismo bloque funcional
