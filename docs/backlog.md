# Backlog Tecnico Actualizado

## Backend

- Definir permisos por rol sobre la base JWT ya implementada.
- Reforzar validaciones y cobertura de regresion en ventas.
- Revisar si conviene separar settings por archivo por entorno.
- Refinar contratos de `finance` y `reports` para consumo real del dashboard.
- Preparar validacion completa del backend usando PostgreSQL.
- Estandarizar mejor respuestas de error y logging por modulo.

## Frontend

- Ejecutar Sprint Frontend 1 para establecer router, layouts y capa
  `services`.
- Ejecutar Sprint Frontend 2 para integrar login real, JWT y rutas protegidas.
- Ejecutar Sprint Frontend 3 para construir shell autenticada y dashboard base.
- Ejecutar Sprints Frontend 4 a 6 para cerrar clientes, inventario y ventas.
- Ejecutar Sprints Frontend 7 a 9 para consolidar finanzas, reportes, control
  de acceso en UI y calidad final.

## Integracion

- Integrar login real del frontend con JWT del backend.
- Integrar clientes, inventario, ventas, finanzas y reportes desde el frontend.
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
- Mantener alineados `roadmap.md`, `frontend.md` y `sprints/` conforme avance la
  implementacion frontend.
- Documentar endpoints y modelos reales conforme se ajusten.
- Vincular cambios importantes del repo con la documentacion correspondiente.
