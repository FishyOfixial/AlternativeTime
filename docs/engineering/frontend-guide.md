# Frontend

## Estado actual

El frontend ya opera como sistema funcional para:

- autenticacion
- dashboard
- clientes
- inventario
- ventas
- finanzas
- reportes

Tambien se realizo una etapa de modularizacion en componentes para reducir
paginas monoliticas y mejorar mantenibilidad.

## Estructura actual (resumen)

```text
frontend/
|- src/
|  |- app/
|  |- components/
|  |- constants/
|  |- contexts/
|  |- layouts/
|  |- pages/
|  |- services/
|  `- utils/
`- package.json
```

## Modulos actualmente visibles en UI

- `/dashboard`
- `/clients`
- `/inventory`
- `/sales`
- `/finance`
- `/reports`

## Modulos ocultos temporalmente

- `/users` se mantiene en codigo pero oculto por feature flag.
- No se muestra control por roles en frontend en esta etapa.

## Integracion actual con backend

El frontend consume endpoints reales de:

- `auth`
- `clients`
- `inventory`
- `sales`
- `finance`
- `reports`

Las llamadas se concentran en `src/services/` y la UI usa patrones comunes de:

- estado de carga (`LoadingState`)
- estado de error (`ErrorState`)
- estado vacio (`EmptyState`)

## Estado de sprints frontend

- Sprint 1 a 7: implementados
- Sprint 8: pendiente (apartados, abonos, alertas)
- Sprint 9: pendiente (hardening, pruebas, release)

## Convenciones vigentes

- componentes reutilizables por modulo de negocio
- constantes y utilidades separadas por dominio
- formularios con validacion de backend mostrada en UI
- textos y labels en espanol para operacion diaria

## Pendientes frontend mas importantes

- implementar flujo de apartados y pagos parciales
- unificar criterios de UX en formularios largos restantes
- ampliar pruebas para regresion de modulos criticos
- cerrar checklist de release con documentacion final
