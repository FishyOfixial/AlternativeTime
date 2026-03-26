# Sprint Backend 4

## Resumen

Este sprint construye la primera capa de consolidacion del backend sobre las
ventas ya registradas. El objetivo es exponer resumenes financieros y endpoints
de reportes iniciales para consumo del dashboard y de vistas administrativas.

## Objetivo del sprint

- implementar una primera capa `finance`
- implementar una primera capa `reports`
- exponer metricas basadas en ventas ya persistidas
- entregar endpoints utiles para consulta administrativa

## Resultado esperado

Al cerrar este sprint, el backend debe:

- exponer resumen financiero basico
- exponer reportes iniciales construidos sobre ventas
- calcular metricas desde datos reales del sistema
- dejar una base extensible para dashboard y analitica posterior

## Alcance

### Incluye

- app `finance`
- app `reports`
- endpoints de resumen financiero
- endpoints de reportes basicos
- agregaciones basadas en ventas
- pruebas de consistencia para metricas iniciales

### Excluye

- contabilidad formal
- impuestos complejos
- exportaciones avanzadas
- graficas o visualizacion frontend
- permisos granulares por rol

## Interfaces publicas del sprint

- `GET /api/finance/summary/`
- `GET /api/reports/sales-summary/`
- `GET /api/reports/inventory-summary/`

## Contrato esperado de respuestas

### Finance summary

Debe devolver al menos:

- `total_sales_count`
- `gross_revenue`
- `items_sold`

### Sales summary report

Debe devolver al menos:

- total de ventas
- total monetario acumulado
- total de items vendidos

### Inventory summary report

Debe devolver al menos:

- total de productos activos
- total de stock disponible
- productos con stock bajo o cero si se define un umbral fijo

## Reglas de negocio del sprint

- las metricas deben salir del backend, no del frontend
- los reportes deben construirse sobre ventas e inventario persistidos
- los endpoints deben ser solo de lectura
- el sprint no debe alterar el flujo de ventas existente

## Plan de trabajo por pasos

### Paso 1. Crear apps `finance` y `reports`

- crear y registrar ambas apps
- separar claramente resumen financiero de reportes generales

**Entregable**

Base modular para consolidacion y analitica.

### Paso 2. Implementar resumen financiero inicial

- calcular total de ventas
- calcular ingresos brutos
- calcular cantidad total de items vendidos

**Entregable**

Endpoint `/api/finance/summary/` funcional.

### Paso 3. Implementar reportes iniciales

- crear reporte resumen de ventas
- crear reporte resumen de inventario
- estructurar respuestas para consumo directo desde frontend

**Entregable**

Endpoints de reportes iniciales disponibles.

### Paso 4. Proteger acceso y mantener consistencia

- mantener endpoints autenticados
- asegurar que no muten datos
- documentar claramente que son endpoints de lectura agregada

**Entregable**

Capa segura de consulta administrativa.

### Paso 5. Agregar pruebas

- probar resumen financiero con datos existentes
- probar reporte de ventas
- probar reporte de inventario
- probar acceso autenticado

**Entregable**

Cobertura minima para la primera capa de analitica backend.

### Paso 6. Cierre del sprint

- actualizar documentacion tecnica si cambia alguna convencion
- dejar base lista para Sprint Backend 5: endurecimiento, despliegue y calidad

**Entregable**

Backend preparado para una etapa de estabilizacion y refinamiento.

## Criterios de aceptacion

- existen apps `finance` y `reports`
- los endpoints son de solo lectura
- las metricas salen de datos reales de ventas e inventario
- los endpoints siguen autenticados
- existen pruebas minimas para los resumenes iniciales

## Dependencias del sprint

- Sprint Backend 1 implementado
- Sprint Backend 2 implementado
- Sprint Backend 3 implementado
- ventas ya disponibles y estables

## Riesgos y notas

- no mezclar contabilidad compleja con este sprint
- evitar agregar demasiada logica de filtros desde la primera iteracion
- mantener respuestas compactas y entendibles para el dashboard

## Suposiciones y defaults elegidos

- `finance` y `reports` se implementan como apps separadas
- los endpoints del sprint son de lectura agregada
- no se agregan filtros avanzados en la primera version
- el dashboard consumira estas respuestas como base inicial
