# Backlog Tecnico Actualizado

## Backend

- Definir permisos por rol sobre la base JWT ya implementada.
- Reforzar validaciones y cobertura de regresion en ventas.
- Revisar si conviene separar settings por archivo por entorno.
- Refinar contratos de `finance` y `reports` para consumo real del dashboard.
- Preparar validacion completa del backend usando PostgreSQL.
- Estandarizar mejor respuestas de error y logging por modulo.

## Frontend

- Incorporar un router para pantallas reales.
- Crear layout principal con sidebar y encabezado.
- Separar `App.jsx` en paginas y componentes reutilizables.
- Crear una capa `services` para centralizar llamadas HTTP.
- Implementar la pantalla de login real.
- Implementar pantallas base para dashboard, clientes, inventario y ventas.
- Crear componentes reutilizables para tablas, formularios y tarjetas.

## Integracion

- Integrar login real del frontend con JWT del backend.
- Integrar clientes, inventario y ventas desde el frontend.
- Estandarizar consumo de errores de API en frontend.
- Definir estrategia de carga, vacio y error para pantallas de datos.
- Alinear nombres de modulos backend con pantallas frontend.
- Documentar contratos de endpoints conforme se creen.

## Infraestructura

- Validar ejecucion real del backend con PostgreSQL.
- Definir estrategia de despliegue del backend y frontend.
- Decidir manejo de secretos por entorno fuera del repo.
- Establecer pipeline minimo de validacion o CI.
- Incorporar chequeos automaticos de calidad y pruebas.

## Documentacion

- Mantener `docs/` como fuente de verdad tecnica.
- Agregar ADRs nuevas en `docs/decisions.md` cuando se tomen decisiones
  relevantes.
- Actualizar roadmap y sprints al cerrar cada etapa importante.
- Documentar endpoints y modelos reales conforme se ajusten.
- Vincular cambios importantes del repo con la documentacion correspondiente.
