# Documentation Index

Esta carpeta es la fuente de verdad funcional y tecnica de Alternative Time.
La documentacion esta organizada por dominio para facilitar onboarding,
mantenimiento y trazabilidad.

## Estructura

- `product/`: vision funcional del producto.
- `architecture/`: arquitectura del sistema.
- `engineering/`: guias de implementacion por capa (backend/frontend).
- `planning/`: roadmap, backlog y decisiones tecnicas.
- `specification/`: especificacion tecnica oficial y anexos.
- `sprints/backend/`: planes historicos y operativos de backend.
- `sprints/frontend/`: planes historicos y operativos de frontend.
- `assets/ui-mockups/`: mockups y referencias visuales.
- `reference/srs/`: documentos SRS originales.
- `reference/db/seed/`: scripts de apoyo para datos de desarrollo.

## Mapa de lectura recomendado

1. [Product Overview](product/product-overview.md)
2. [System Architecture](architecture/system-architecture.md)
3. [Backend Guide](engineering/backend-guide.md)
4. [Frontend Guide](engineering/frontend-guide.md)
5. [Roadmap](planning/roadmap.md)
6. [Backlog](planning/backlog.md)
7. [Decisions Log](planning/decisions-log.md)
8. [Offline Sync Action Plan](planning/offline-sync-action-plan.md)
9. [Technical Specification](specification/technical-specification.md)
10. [Technical Specification Addendum v1.1](specification/technical-specification-addendum-v1.1.md)

## Nota de planeacion actual

La ruta PWA / offline-first esta documentada como trabajo futuro y considera
explicitamente el entorno real del cliente en ecosistema Apple multi-device
(`iPhone`, `iPad`, `Mac`).

## Convencion de nombres

- Carpetas: `kebab-case` por dominio (`system-architecture`, `ui-mockups`).
- Archivos markdown: nombre descriptivo en ingles y `kebab-case`.
- Sprints: prefijo de capa + numero + tema.
  - Ejemplo backend: `backend-sprint-04-finance-reports.md`
  - Ejemplo frontend: `frontend-sprint-08-layaways-payments-alerts.md`

## Nota

Los artefactos en `reference/` y `assets/` son insumos de apoyo.
La documentacion activa para desarrollo vive en los `.md` organizados por dominio.
