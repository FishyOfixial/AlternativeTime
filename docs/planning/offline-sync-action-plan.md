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
- El cliente principal opera en ecosistema Apple, por lo que iPhone/iPad son
  plataforma prioritaria para el diseno PWA.
- El contexto real de uso es multi-device dentro del ecosistema Apple:
  iPhone, iPad y Mac.

# Consideraciones Especificas para iOS / Apple

- Debe asumirse uso cruzado entre iPhone, iPad y Mac sobre la misma cuenta y
  mismos datos operativos; no se debe disenar como experiencia monodispositivo.
- La instalacion depende de "Agregar a pantalla de inicio"; debe existir guia
  de instalacion y soporte UX para usuarios no tecnicos.
- En iOS/iPadOS, un sitio agregado puede quedar como web app o como bookmark;
  no debe asumirse modo app nativo siempre.
- El `Web App Manifest` sigue siendo obligatorio para identidad consistente:
  nombre, iconos, `display`, `scope` y branding.
- El `Service Worker` debe resolver shell offline, cache y control de red, pero
  no debe asumirse sincronizacion silenciosa prolongada en segundo plano como en
  una app nativa.
- `Web Push` solo debe considerarse para web apps instaladas y tras permiso
  explicito del usuario; queda fuera del MVP.
- `Badging API` puede evaluarse para pendientes/conflictos, pero no debe ser
  requisito critico del flujo inicial.
- El almacenamiento local en iOS es suficiente para una PWA seria, pero puede
  sufrir cuota y eviccion; no debe tratarse como replica completa del backend.
- Debe existir manejo explicito de errores de almacenamiento, limpieza de cache
  y politica de retencion local.
- La lectura offline entra antes; la escritura offline debe entrar por etapas.
- Inventario transaccional, ventas, apartados y finanzas permanecen fuera del
  offline inicial hasta tener idempotencia, versionado y conflictos resueltos.
- La UX debe exponer conectividad, ultima sincronizacion, pendientes, errores y
  conflictos.
- La UX tambien debe dejar claro cuando un cambio local aun no se ha propagado
  a otros dispositivos del ecosistema Apple.
- Debe definirse estrategia clara de actualizacion de `Service Worker`,
  versionado e invalidacion de cache.

# Estados de Sincronizacion

- `Local (no sincronizado)`: cambio creado solo en el dispositivo actual.
- `Pendiente de envio`: operacion en cola esperando oportunidad de sync.
- `Sincronizando`: operacion actualmente en proceso de envio o reconciliacion.
- `Sincronizado`: cambio confirmado por backend y ya elegible para verse en los
  otros dispositivos.
- `Error`: fallo recuperable o no recuperable que impide completar sync.
- `Conflicto`: el backend rechazo o cuestiono la operacion por diferencia de
  version, estado o concurrencia.

# Decisiones Clave

- No depender de `background sync` en iOS como pieza central del sistema.
- No replicar completamente la base de datos en cliente.
- No permitir offline en modulos criticos en el MVP.
- Disparar sincronizacion por eventos visibles y confiables:
  apertura de app, reconexion y acciones del usuario.

# Clasificacion de Modulos por Riesgo

## Bajo riesgo

- Dashboard (lectura)
- Reportes de consulta (lectura)
- Listados no transaccionales

## Medio riesgo

- Clientes (alta/edicion con sync diferido)
- Inventario en modo lectura offline
- Uso multi-device de clientes/listados con riesgo de drift temporal entre Mac,
  iPhone e iPad

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
- Guia UX de instalacion para iPhone/iPad ("Agregar a pantalla de inicio").
- Consideraciones de instalacion/uso tambien para Safari en Mac.

### No incluye

- Cache de respuestas API.
- Escritura offline.
- Cola de sincronizacion.
- Resolucion de conflictos.
- Asumir background sync silencioso prolongado en iOS.

### Frontend

- Integracion PWA en Vite.
- UI de conectividad global.
- Manejo de actualizacion de service worker.
- Deteccion y copy especifico para instalacion manual en Safari iOS.
- Definicion de copy para distinguir "guardado local", "sincronizado" y
  "visible en otros dispositivos".
- Base visual para estados de sincronizacion definidos en este documento.

### Backend

- Sin endpoints nuevos.
- Revisar headers y CORS si hiciera falta para cache segura.

### Riesgos

- Cache stale tras despliegues.
- Confusion de usuarios (instalable != operacion completa offline).
- Usuarios iOS pueden agregar el sitio como bookmark y no como web app.
- Usuarios pueden asumir que iPhone/iPad/Mac comparten estado en tiempo real
  aun cuando un dispositivo siga offline.

### Dependencias

- Definir estrategia de versionado/invalidez del SW.
- Checklist de release para cache busting.
- Definir soporte UX/documental para instalacion en Apple.

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
- Politica de retencion y limpieza local para evitar problemas de cuota/eviccion
  en iOS.
- Base para mostrar freshness por dispositivo, no solo por sesion.

### No incluye

- Escritura offline.
- Sync de mutaciones.
- Resolucion de conflictos.

### Frontend

- Capa de repositorio local para lectura offline.
- Fallback a ultimo snapshot disponible.
- UI de datos stale.
- Manejo explicito de errores de almacenamiento local.
- Base para mostrar `Sincronizado` / `Error` a nivel de snapshots cacheados si
  aplica en la UX final.

### Backend

- Recomendado: consistencia en `updated_at` y orden estable de listados.
- Recomendado: timestamps confiables por entidad para facilitar reconciliacion
  entre dispositivos Apple.

### Riesgos

- Toma de decisiones con datos desactualizados.
- Complejidad de invalidacion por endpoint.
- Eviccion de almacenamiento local en dispositivos Apple con poca cuota.
- Diferencias temporales entre el estado visto en Mac, iPhone e iPad.

### Dependencias

- Definir politica de expiracion por modulo.
- Alinear copy UX de offline/stale.
- Definir tamano maximo de cache local por modulo.

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
- Sincronizacion disparada al abrir la app o recuperar conectividad, sin
  depender de background sync prolongado.
- Señalizacion clara de que un cambio local aun puede no estar disponible en
  los otros dispositivos del usuario.

### No incluye

- Ventas offline.
- Apartados offline.
- Finanzas offline.
- Cambios transaccionales criticos de inventario.

### Frontend

- Motor de cola de escrituras.
- UI de pendientes y errores de sincronizacion.
- Reconciliacion de IDs temporales.
- UX concreta para `Local`, `Pendiente de envio`, `Sincronizando`,
  `Sincronizado`, `Error` y `Conflicto`.

### Backend

- Idempotencia para create/update de clientes.
- Mensajes de error consistentes para remapeo.
- Preparacion para reconciliar escrituras originadas desde varios dispositivos
  del mismo usuario.

### Riesgos

- Duplicados por reintento.
- Conflictos de edicion concurrente.
- Expectativa incorrecta de que iOS sincronizara solo "en segundo plano".
- Ediciones del mismo cliente desde Mac y iPhone antes de sincronizar.

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
- Base para reconciliar estado entre iPhone, iPad y Mac sin asumir tiempo real.
- Contrato backend suficiente para mapear estados de sync de frontend.

### No incluye

- Habilitacion masiva de escrituras offline criticas.
- Auto-merge complejo.

### Frontend

- Sync engine con push/pull incremental.
- Gestion de estado `conflict`.
- Reconciliacion de cambios locales vs servidor.
- UX para mostrar si un cambio ya fue propagado al servidor y por ende puede
  ser visto desde otros dispositivos.
- Disparadores de sincronizacion por eventos: apertura, reconexion y acciones
  del usuario.

### Backend

- Contratos delta por entidad priorizada.
- Idempotencia homologada.
- Validaciones transaccionales mas estrictas.
- Estrategia de cursores/versionado pensada para clientes Apple con sesiones
  cortas y reaperturas frecuentes de app.
- Modelo apto para escenarios multi-device del mismo usuario.
- Respuestas backend suficientes para mapear `Error` vs `Conflicto`.

### Riesgos

- Alta complejidad tecnica.
- Drift de cursores si no se valida bien.
- Conflictos frecuentes por uso paralelo entre Mac, iPad e iPhone.

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
- Guardrails para bloquear operaciones criticas cuando el contexto offline no
  sea suficientemente confiable.

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
- Dependencia de Web Push o background tasks como pieza central del sync.

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
- UX de instalacion guiada para iPhone/iPad.
- Politica de cache local acotada y segura para iOS.
- Semantica clara de sincronizacion multi-device dentro del ecosistema Apple.
- Estados de sincronizacion visibles al menos para el flujo offline soportado.

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
- Badging y Web Push como mejoras posteriores, no como dependencia de fase 1.

# Riesgos Globales

- Subestimar complejidad de conflictos en modulos criticos.
- Duplicados financieros por idempotencia incompleta.
- Confusion UX entre "guardado local" y "sincronizado en servidor".
- Deuda tecnica si no se centraliza la capa de sync.
- QA insuficiente para reconexiones largas/intermitentes.
- Tratar iOS como si ofreciera background behavior equivalente a una app nativa.
- Confiar demasiado en almacenamiento local sin contemplar eviccion.
- Subestimar el costo de consistencia entre iPhone, iPad y Mac del mismo
  usuario.

# Recomendacion Final

Implementar offline en ATC POS por iteraciones cortas y controladas:

1. Valor rapido (instalable + lectura offline).
2. Escritura offline solo de bajo riesgo.
3. Sincronizacion robusta antes de modulos criticos.
4. Inventario/ventas/apartados/finanzas en etapas posteriores con guardrails.
5. Disenar cada fase validando primero comportamiento real en Safari iPhone/iPad.

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
