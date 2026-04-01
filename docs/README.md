# Documentation Index

Esta carpeta concentra la documentacion funcional, tecnica y operativa de Alternative Time.
Su objetivo es servir como referencia formal para onboarding, mantenimiento, evolucion del producto y trazabilidad de decisiones.

## Alcance de la Documentacion

La documentacion de este repositorio cubre:

- contexto funcional del producto
- arquitectura del sistema
- guias de implementacion por capa
- roadmap y backlog
- decisiones tecnicas
- planes de sprint historicos
- anexos de especificacion y referencias de soporte

## Estructura

- `product/`: vision funcional y alcance del producto.
- `architecture/`: arquitectura del sistema y decisiones estructurales.
- `engineering/`: guias de implementacion para backend y frontend.
- `planning/`: roadmap, backlog y decisiones de evolucion.
- `specification/`: especificacion tecnica oficial y anexos.
- `sprints/backend/`: planes y registro historico de ejecucion backend.
- `sprints/frontend/`: planes y registro historico de ejecucion frontend.
- `assets/ui-mockups/`: referencias visuales y mockups.
- `reference/srs/`: documentos SRS originales.
- `reference/db/seed/`: scripts de apoyo para escenarios de desarrollo.

## Mapa de Lectura Recomendado

1. [User Manual](product/user-manual.md)
2. [Product Overview](product/product-overview.md)
3. [System Architecture](architecture/system-architecture.md)
4. [Backend Guide](engineering/backend-guide.md)
5. [Frontend Guide](engineering/frontend-guide.md)
6. [Roadmap](planning/roadmap.md)
7. [Backlog](planning/backlog.md)
8. [Decisions Log](planning/decisions-log.md)
9. [Offline Sync Action Plan](planning/offline-sync-action-plan.md)
10. [Technical Specification](specification/technical-specification.md)
11. [Technical Specification Addendum v1.1](specification/technical-specification-addendum-v1.1.md)

## Criterio de Uso

- Los archivos en `reference/` y `assets/` funcionan como material de apoyo.
- La documentacion activa para desarrollo vive en los `.md` organizados por dominio.
- Las decisiones vigentes deben consolidarse en `planning/` y `specification/`.

## Nota de Planeacion

La ruta PWA / offline-first se encuentra documentada como trabajo futuro y contempla el entorno operativo real del cliente en ecosistema Apple multi-device (`iPhone`, `iPad`, `Mac`).

## Convencion de Nombres

- Carpetas: `kebab-case` por dominio.
- Archivos markdown: nombre descriptivo en ingles y `kebab-case`.
- Sprints: prefijo de capa + numero + tema.

Ejemplos:

- `backend-sprint-04-finance-reports.md`
- `frontend-sprint-08-layaways-payments-alerts.md`
