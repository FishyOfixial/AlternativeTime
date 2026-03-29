# Backlog Tecnico Actualizado

## Backend

- [x] Implementar modulo de apartados (`Layaway`) y abonos (`LayawayPayment`).
- [x] Integrar cierre automatico de apartado con creacion de venta final.
- [x] Exponer endpoint de alertas operativas (apartados vencidos, inventario viejo).
- [x] Completar exportaciones CSV/XLSX del catalogo de reportes.
- [~] Fortalecer pruebas de integracion entre `inventory`, `sales`, `finance`, `reports` y `layaways`.
- [~] Estandarizar mensajes de validacion para mapeo por campo en frontend.

## Frontend

- [x] Ejecutar Sprint Frontend 8 para apartados y abonos.
- [~] Ejecutar Sprint Frontend 9 para hardening, pruebas y cierre de release.
- [~] Continuar modularizacion de paginas extensas para reducir deuda tecnica.
- [~] Homologar UX de estados `loading/error/empty/success` en todos los modulos.
- [x] Mantener `Usuarios` oculto en navegacion y rutas hasta nueva definicion funcional.

## Integracion

- [x] Alinear flujo comercial entre venta directa y apartado.
- [~] Endurecer regresion cruzada frontend/backend en finanzas y reportes.
- [~] Completar smoke checklist para release controlado.

## Infraestructura y calidad

- [x] Mantener build frontend estable en cambios grandes.
- [~] Ampliar cobertura de pruebas automatizadas.
- [ ] Definir pipeline minimo de CI para lint, tests y build.
- [ ] Validar corrida completa sobre PostgreSQL antes de release.
- [ ] Evaluar y preparar arquitectura `offline-first` (PWA + sincronizacion) segun `docs/planning/offline-sync-action-plan.md`.

## Documentacion

- [~] Mantener `docs/sprints/` sincronizado con alcance real.
- [~] Actualizar `README.md` cuando se amplien contratos y comandos.
- [~] Registrar decisiones de alcance en `docs/planning/decisions-log.md`.
- [~] Mantener `docs/planning/roadmap.md` y `docs/engineering/frontend-guide.md` alineados con el estado real.
