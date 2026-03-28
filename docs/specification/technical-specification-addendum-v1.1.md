# Anexo de Spec v1.1 (Marzo 2026)

Este anexo complementa `docs/specification/technical-specification.md` con decisiones de alcance vigentes del
proyecto. En caso de conflicto, este anexo prevalece para planificacion de
sprints actuales.

## 1. Alcance activo del producto

Modulos activos y visibles en frontend:

- Dashboard
- Clientes
- Inventario
- Ventas
- Finanzas
- Reportes

## 2. Alcance diferido temporalmente

El modulo de Usuarios y la capa de roles en frontend quedan diferidos.

- No se muestran rutas ni navegacion de `/users`.
- No se aplica control de permisos por rol en UI en esta fase.
- Backend de autenticacion y usuarios se mantiene sin eliminar.

Referencia: `docs/planning/decisions-log.md` -> DEC-008.

## 3. Requerimientos faltantes prioritarios

La brecha funcional principal para cierre de spec comercial es:

- Apartados (`Layaway`)
- Abonos (`LayawayPayment`)
- Alertas operativas (apartados vencidos e inventario viejo)

Esto se cubre en `docs/sprints/frontend/frontend-sprint-08-layaways-payments-alerts.md` y backlog actualizado.

## 4. Criterio de cierre funcional (antes de release)

Se considera cierre funcional cuando exista:

- venta directa completa (ya implementada)
- finanzas/reportes operativos (parcialmente implementado, en estabilizacion)
- flujo de apartados y abonos integrado con inventario/ventas/finanzas

## 5. Criterio de cierre tecnico (release)

Se considera cierre tecnico cuando exista:

- build estable de frontend
- pruebas minimas de regresion en modulos criticos
- documentacion alineada al alcance real
- checklist de salida ejecutable

Cobertura planificada en `docs/sprints/frontend/frontend-sprint-09-hardening-release.md`.

