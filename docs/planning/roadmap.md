# Roadmap Inicial

## Fase 1: base tecnica y autenticacion

**Estado**: Completada.

- estructura base backend/frontend
- autenticacion JWT
- rutas protegidas y sesion persistente

## Fase 2: clientes e inventario

**Estado**: Completada.

- CRUD clientes
- CRUD inventario
- vistas de listado, detalle y formulario

## Fase 3: ventas

**Estado**: Completada.

- historial de ventas
- captura de venta con validaciones
- costo snapshot, ganancia y margen

## Fase 4: finanzas y reportes

**Estado**: Completada.

- frontend finanzas y reportes conectado
- exportaciones CSV/XLSX
- CRUD manual de movimientos financieros

## Fase 5: apartados y abonos

**Estado**: Completada.

- modulo de apartados
- registro de abonos y cierre automatico a venta
- alertas operativas en dashboard

## Fase 6: hardening y release

**Estado**: En ejecucion.

- pruebas de regresion frontend/backend
- estandarizacion UX de estados y mensajes
- reduccion de deuda tecnica y modularizacion
- checklist de release y validacion final

## Fase 7: offline-first y PWA (planeacion)

**Estado**: Planeada (no iniciada).

- PWA base instalable y cache de shell
- persistencia local para lectura
- cola de sincronizacion y estrategia de conflictos
- hardening transaccional para evitar duplicados y drift de datos

Ver detalle en `docs/planning/offline-sync-action-plan.md`.

### Estimacion tentativa (planeacion)

> Estimacion para equipo pequeno, alcance controlado y entregas secuenciales.
> Se revisa al cierre de cada fase (no es compromiso fijo).

| Subfase offline-first | Alcance resumido | Duracion estimada | Riesgo |
| --- | --- | --- | --- |
| Fase 7.1 - PWA base | Instalable + app shell offline + conectividad | 1 semana | Bajo |
| Fase 7.2 - Lectura offline | Cache local de dashboard/clientes/inventario | 2 semanas | Medio |
| Fase 7.3 - Escritura offline baja | Cola offline para clientes + reintentos | 2 semanas | Medio |
| Fase 7.4 - Sync robusto | Delta sync + versionado + 409 conflictos | 3 semanas | Medio/Alto |
| Fase 7.5 - Modulos criticos | Inventario/ventas/apartados/finanzas graduales | 3-5 semanas | Alto |
| Fase 7.6 - Hardening final | QA offline, telemetria y playbooks | 2 semanas | Medio |

### Criterio de avance entre subfases

- No iniciar subfase siguiente sin cerrar criterios de terminado de la actual.
- Mantener `sales`, `layaways` y `finance` offline deshabilitados hasta completar 7.4.
- Liberar por feature flags y smoke tests en entorno controlado.

## Nota de alcance

`Usuarios` y control por roles permanecen ocultos en UI hasta nueva definicion de producto.
