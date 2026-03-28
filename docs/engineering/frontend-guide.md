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

## Convenciones vigentes

- estados `loading/error/empty/success` reutilizables
- labels y copy operativos en espanol
- componentes por dominio de negocio
- constantes y utilidades separadas por modulo
