# Frontend

## Estado actual

El frontend ya opera de punta a punta para:

- autenticacion y sesion
- dashboard y alertas operativas
- clientes
- inventario
- ventas directas
- apartados y abonos
- finanzas y reportes

## Estructura

```text
frontend/
|- src/
|  |- app/
|  |- components/
|  |- constants/
|  |- contexts/
|  |- layouts/
|  |- pages/
|  |- services/
|  |- test/
|  `- utils/
`- package.json
```

## Modulos visibles en UI

- `/dashboard`
- `/clients`
- `/inventory`
- `/sales`
- `/layaways`
- `/finance`
- `/reports`

## Modulos ocultos temporalmente

- `/users` se mantiene en codigo, oculto por `USERS_MODULE_ENABLED=false`.
- No hay control por roles activo en UI.

## Integracion backend

El frontend consume endpoints reales de:

- `auth`
- `clients`
- `inventory`
- `sales`
- `layaways`
- `finance`
- `reports`
- `notifications`

## Pruebas y validacion

Comandos recomendados:

```powershell
npm.cmd run test:run --prefix frontend
npm.cmd run build --prefix frontend
```

La suite cubre rutas protegidas principales y manejo de errores de servicios.

## Estado de sprints frontend

- Sprint 1 a 8: implementados
- Sprint 9: hardening y cierre de release en ejecucion

## Roadmap PWA / offline-first

La implementacion PWA offline-first ya arranco con una Fase 1 controlada. La
referencia principal vive en:

- `docs/planning/offline-sync-action-plan.md`

Lineamientos aprobados:

- el backend se mantiene como fuente de verdad
- el MVP offline prioriza lectura sobre escritura
- no se habilitan en la primera iteracion `sales`, `layaways`, `finance` ni
  cambios transaccionales criticos de `inventory`
- la sincronizacion no debe depender de `background sync` prolongado en iOS
- el entorno objetivo real es Apple multi-device: `iPhone`, `iPad`, `Mac`

Capacidades activas de Fase 1:

- `Web App Manifest` con branding instalable
- `Service Worker` para app shell y assets estaticos
- banner global de conectividad, instalacion y actualizacion
- fallback de shell offline para rutas SPA
- guia manual de instalacion para Safari en `iPhone`, `iPad` y `Mac`

Limites actuales de Fase 1:

- no hay cache de `/api/*`
- no hay `IndexedDB`
- no hay lectura offline real de datos de negocio
- no hay escritura offline ni cola de sincronizacion
- las vistas que dependen de API muestran un estado offline explicito cuando no
  hay red

Estado actual de Fase 2:

- `dashboard`, `clientes` e `inventario` ya pueden usar snapshots locales de
  lectura
- la persistencia de snapshots vive en `IndexedDB`
- el shell muestra freshness global y cada vista soportada muestra su ultimo
  sync
- `sales`, `layaways`, `finance`, formularios, detalles y exportaciones siguen
  fuera del offline de lectura oficial

Estados de sincronizacion previstos para UX:

- `Local (no sincronizado)`
- `Pendiente de envio`
- `Sincronizando`
- `Sincronizado`
- `Error`
- `Conflicto`

## Convenciones vigentes

- estados `loading/error/empty/success` reutilizables
- labels y copy operativos en espanol
- componentes por dominio de negocio
- constantes y utilidades separadas por modulo
