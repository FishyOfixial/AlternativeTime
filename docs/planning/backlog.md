# Backlog Tecnico Actualizado

## Backend

- [x] Implementar modulo de apartados (`Layaway`) y abonos (`LayawayPayment`).
- [x] Integrar cierre automatico de apartado con creacion de venta final.
- [x] Exponer endpoint de alertas operativas (apartados vencidos, inventario viejo).
- Fortalecer pruebas de integracion entre `inventory`, `sales`, `finance` y `reports`.
- Validar contratos de exportacion y filtros por reporte contra `docs/specification/technical-specification.md`.

## Frontend

- [~] Ejecutar Sprint Frontend 8 para apartados y abonos.
- Ejecutar Sprint Frontend 9 para hardening, pruebas y cierre de release.
- Continuar modularizacion de paginas extensas para reducir deuda tecnica.
- Homologar UX de estados `loading/error/empty/success` en todos los modulos.
- Mantener `Usuarios` oculto en navegacion y rutas hasta nueva definicion funcional.

## Integracion

- Definir contrato final frontend/backend para apartados y pagos.
- Alinear alertas operativas entre dashboard, inventario y apartados.
- Asegurar consistencia de estados del producto entre venta directa y apartado.
- Estandarizar errores de validacion para mostrar mensajes por campo en frontend.

## Infraestructura y calidad

- Mantener build frontend estable en cada cambio grande.
- Ampliar cobertura de pruebas automatizadas.
- Definir pipeline minimo de CI para lint, tests y build.
- Validar corrida completa sobre PostgreSQL antes de release.

## Documentacion

- Mantener `docs/sprints/` sincronizado con alcance real.
- Actualizar `README.md` cuando se amplien endpoints publicos.
- Registrar decisiones de alcance en `docs/planning/decisions-log.md`.
- Mantener `roadmap.md` y `frontend.md` alineados con el estado actual del repo.

