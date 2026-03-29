# Resumen Ejecutivo

ATC POS puede evolucionar a PWA offline-first de forma segura si se implementa
por etapas: primero instalable + lectura offline, despues escritura offline
solo en flujos de bajo riesgo, y finalmente modulos transaccionales criticos.
El servidor debe mantenerse como fuente de verdad en todas las fases.

La ruta recomendada es:

1. PWA instalable.
2. Offline de lectura.
3. Escritura offline en modulo de bajo riesgo.
4. Sincronizacion robusta.
5. Resolucion de conflictos para modulos criticos.
6. Hardening + QA + release.

# Supuestos del Proyecto

- Proyecto: ATC POS con backend Django REST y frontend React + Vite + Tailwind.
- Sistema ya funcional en operacion.
- Uso pequeno/controlado (no multiempresa masiva).
- Prioridad: reducir riesgo y evitar sobrecomplicar primera iteracion.
- El backend sigue siendo fuente de verdad.
- Se permite evolucionar contratos backend sin romper compatibilidad principal.

# Clasificacion de Modulos por Riesgo

## Bajo riesgo

- Dashboard (lectura)
- Reportes de consulta (lectura)
- Listados no transaccionales

## Medio riesgo

- Clientes (alta/edicion con sync diferido)
- Inventario en modo lectura offline

## Alto riesgo

- Inventario transaccional (`available/reserved/sold`)
- Ventas
- Apartados / abonos
- Finanzas y balances

## Fase sugerida por riesgo

- Bajo riesgo: Fase 1 y Fase 2
- Medio riesgo: Fase 3 y Fase 4
- Alto riesgo: Fase 5 y Fase 6

# Roadmap por Fases

## Fase 1

### Objetivo

Habilitar ATC POS como PWA instalable sin cambios de logica de negocio.

### Alcance

Infraestructura PWA basica y UX de conectividad.

### Incluye

- Manifest + iconos + metadatos de instalacion.
- Service Worker con cache de assets estaticos.
- Offline fallback de app shell.
- Indicador visual de estado de red (online/offline).

### No incluye

- Cache de respuestas API.
- Escritura offline.
- Cola de sincronizacion.
- Resolucion de conflictos.

### Frontend

- Integracion PWA en Vite.
- UI de conectividad global.
- Manejo de actualizacion de service worker.

### Backend

- Sin endpoints nuevos.
- Revisar headers y CORS si hiciera falta para cache segura.

### Riesgos

- Cache stale tras despliegues.
- Confusion de usuarios (instalable != operacion completa offline).

### Dependencias

- Definir estrategia de versionado/invalidez del SW.
- Checklist de release para cache busting.

### Definicion de terminado

- App instalable en mobile/tablet.
- App abre sin red y muestra shell/fallback.
- Flujo online actual sin regresiones.

## Fase 2

### Objetivo

Habilitar offline de lectura para modulos de bajo riesgo.

### Alcance

Lectura local cacheada con marca de antiguedad de datos.

### Incluye

- Persistencia local (IndexedDB) de lecturas.
- Cache de GET para dashboard, clientes e inventario (solo consulta).
- TTL simple + refresh al reconectar.
- Indicador de "ultima sincronizacion".

### No incluye

- Escritura offline.
- Sync de mutaciones.
- Resolucion de conflictos.

### Frontend

- Capa de repositorio local para lectura offline.
- Fallback a ultimo snapshot disponible.
- UI de datos stale.

### Backend

- Recomendado: consistencia en `updated_at` y orden estable de listados.

### Riesgos

- Toma de decisiones con datos desactualizados.
- Complejidad de invalidacion por endpoint.

### Dependencias

- Definir politica de expiracion por modulo.
- Alinear copy UX de offline/stale.

### Definicion de terminado

- Sin red se pueden consultar dashboard/clientes/inventario con ultimo estado.
- Al reconectar, datos se refrescan de forma automatica.

## Fase 3

### Objetivo

Introducir escritura offline solo en un flujo de bajo riesgo.

### Alcance

Mutaciones diferidas para clientes.

### Incluye

- Cola local de operaciones (`pending/syncing/synced/failed`).
- Crear/editar cliente offline.
- Reintentos con backoff al reconectar.
- Estado visible por operacion.

### No incluye

- Ventas offline.
- Apartados offline.
- Finanzas offline.
- Cambios transaccionales criticos de inventario.

### Frontend

- Motor de cola de escrituras.
- UI de pendientes y errores de sincronizacion.
- Reconciliacion de IDs temporales.

### Backend

- Idempotencia para create/update de clientes.
- Mensajes de error consistentes para remapeo.

### Riesgos

- Duplicados por reintento.
- Conflictos de edicion concurrente.

### Dependencias

- Definir `operation_id` o `idempotency key`.
- Contrato de errores uniforme.

### Definicion de terminado

- Se pueden crear/editar clientes sin red.
- Reconexion sincroniza sin duplicados.
- Errores quedan visibles y recuperables.

## Fase 4

### Objetivo

Construir base robusta de sincronizacion para escalar a modulos criticos.

### Alcance

Delta sync + versionado + contrato de conflicto.

### Incluye

- Endpoints de sincronizacion incremental (`since=cursor/timestamp`).
- Control de version por recurso (`version` o `updated_at` estricto).
- Respuesta de conflicto estandar (`409` + metadata).
- Trazabilidad de operaciones sincronizadas.

### No incluye

- Habilitacion masiva de escrituras offline criticas.
- Auto-merge complejo.

### Frontend

- Sync engine con push/pull incremental.
- Gestion de estado `conflict`.
- Reconciliacion de cambios locales vs servidor.

### Backend

- Contratos delta por entidad priorizada.
- Idempotencia homologada.
- Validaciones transaccionales mas estrictas.

### Riesgos

- Alta complejidad tecnica.
- Drift de cursores si no se valida bien.

### Dependencias

- Exito en Fase 3.
- Cobertura de pruebas de reconexion prolongada.

### Definicion de terminado

- Sync incremental estable en staging.
- Conflictos detectados explicitamente y auditables.

## Fase 5

### Objetivo

Extender escritura offline de forma controlada a modulos criticos.

### Alcance

Habilitacion gradual (feature flags) de inventario, ventas, apartados y
finanzas.

### Incluye

- Politicas de seguridad por modulo (no simultaneo).
- Reglas anti-duplicado para operaciones contables.
- Resolucion asistida de conflictos en UI.

### No incluye

- "Todo offline" de una sola vez.
- Resolucion automatica de todos los conflictos.

### Frontend

- Flujos de conflicto por modulo critico.
- Estados bloqueantes cuando operacion no sea segura offline.
- Historial de sync por entidad sensible.

### Backend

- Endurecimiento transaccional en ventas/apartados/finanzas.
- Idempotencia completa en operaciones de alto impacto.
- Reglas de consistencia de inventario.

### Riesgos

- Doble venta.
- Doble contabilizacion.
- Casos borde de reconciliacion.

### Dependencias

- Fase 4 estable.
- Suite e2e para modulos criticos.

### Definicion de terminado

- Modulos criticos habilitados gradualmente sin incidentes de integridad.
- Conflictos resolubles sin corromper datos.

## Fase 6

### Objetivo

Hardening final, QA integral y release controlado.

### Alcance

Calidad operativa y monitoreo del sistema offline-sync.

### Incluye

- Matriz de pruebas offline/reconexion/conflicto.
- Telemetria de sync (latencia, tasa de fallo, conflictos).
- Playbook operativo y runbooks de soporte.
- Checklist de salida a release.

### No incluye

- Features nuevas de negocio.
- Push realtime multi-dispositivo.

### Frontend

- Instrumentacion de eventos de sync.
- UX final para error/reintento/conflicto.

### Backend

- Logs y metricas por operacion idempotente/conflictiva.
- Alertas internas para desviaciones de consistencia.

### Riesgos

- Costo de QA elevado.
- Fallos intermitentes de red dificiles de reproducir.

### Dependencias

- Fases previas cerradas.
- Ambiente staging representativo.

### Definicion de terminado

- KPI de sincronizacion en rango aceptable.
- Cero duplicados criticos en pruebas de regresion.
- Procedimientos de soporte documentados y validados.

# MVP Recomendado

Primera entrega sugerida (realista y segura):

- PWA instalable.
- Offline de lectura para dashboard, clientes e inventario.
- Estado visual de conectividad + ultima sincronizacion.
- Opcional: escritura offline solo para clientes.

Expresamente fuera del MVP:

- Ventas offline.
- Apartados offline.
- Finanzas offline.
- Cambios transaccionales criticos de inventario offline.

# Funcionalidad a Postergar

- Escritura offline de ventas.
- Escritura offline de apartados y abonos.
- Escritura offline de finanzas.
- Resolucion automatica avanzada de conflictos.
- Push notifications y realtime multi-dispositivo.

# Riesgos Globales

- Subestimar complejidad de conflictos en modulos criticos.
- Duplicados financieros por idempotencia incompleta.
- Confusion UX entre "guardado local" y "sincronizado en servidor".
- Deuda tecnica si no se centraliza la capa de sync.
- QA insuficiente para reconexiones largas/intermitentes.

# Recomendacion Final

Implementar offline en ATC POS por iteraciones cortas y controladas:

1. Valor rapido (instalable + lectura offline).
2. Escritura offline solo de bajo riesgo.
3. Sincronizacion robusta antes de modulos criticos.
4. Inventario/ventas/apartados/finanzas en etapas posteriores con guardrails.

Decision clave para primera etapa:

- Evitar escritura offline en modulos criticos hasta tener idempotencia,
  versionado y conflictos resueltos de extremo a extremo.

## Que puede hacerse sin red por fase

- Fase 1: abrir app shell.
- Fase 2: consultar dashboard/clientes/inventario cacheados.
- Fase 3: crear/editar clientes (pendiente sync).
- Fase 4: mismo alcance funcional, pero con sync y conflictos robustos.
- Fase 5: operaciones criticas offline graduales segun feature flag.
- Fase 6: igual que Fase 5, con calidad y soporte listos para release.
