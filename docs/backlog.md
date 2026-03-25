# Backlog Tecnico Inicial

## Backend

- Crear apps Django separadas para `users`, `clients`, `inventory`, `sales`,
  `finance` y `reports`.
- Definir serializers y convenciones de respuesta para la API.
- Diseñar modelos iniciales de clientes, productos e inventario.
- Diseñar el modelo inicial de ventas y sus relaciones.
- Definir la estrategia de autenticacion y permisos.
- Agregar pruebas de endpoints para el modulo de salud y futuros recursos.
- Separar settings por entorno si la configuracion empieza a crecer.

## Frontend

- Incorporar un router para pantallas reales.
- Crear layout principal con sidebar y encabezado.
- Separar `App.jsx` en paginas y componentes reutilizables.
- Crear una capa `services` para centralizar llamadas HTTP.
- Implementar la pantalla de login real.
- Implementar pantallas base para dashboard, clientes e inventario.
- Crear componentes reutilizables para tablas, formularios y tarjetas.

## Integracion

- Definir contrato de autenticacion entre frontend y backend.
- Estandarizar manejo de errores de API.
- Definir estrategia de carga, vacio y error para pantallas de datos.
- Alinear nombres de modulos backend con pantallas frontend.
- Documentar contratos de endpoints conforme se creen.

## Infraestructura

- Preparar configuracion de produccion con PostgreSQL.
- Definir estrategia de despliegue del backend y frontend.
- Decidir manejo de secretos por entorno fuera del repo.
- Establecer pipeline minimo de validacion o CI cuando el proyecto avance.
- Incorporar chequeos automaticos de calidad y pruebas.

## Documentacion

- Mantener `docs/` como fuente de verdad tecnica.
- Agregar ADRs nuevas en `docs/decisions.md` cuando se tomen decisiones
  relevantes.
- Actualizar el roadmap al cerrar cada fase.
- Documentar endpoints y modelos reales conforme se implementen.
- Vincular cambios importantes del repo con la documentacion correspondiente.
