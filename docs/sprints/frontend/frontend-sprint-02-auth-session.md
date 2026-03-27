# Sprint Frontend 2

## Resumen

Este sprint implementa el acceso real al sistema desde frontend. El foco esta
en login, manejo de sesion JWT, proteccion de rutas y consumo de los endpoints
de autenticacion ya expuestos por backend.

## Objetivo del sprint

- implementar el flujo real de login
- integrar la sesion frontend con JWT del backend
- proteger navegacion y pantallas autenticadas

## Resultado esperado

Al cerrar este sprint, el frontend debe:

- permitir iniciar sesion desde una pantalla real
- recuperar datos del usuario autenticado
- refrescar sesion cuando corresponda
- cerrar sesion desde la UI
- bloquear acceso a rutas privadas sin autenticacion

## Alcance

### Incluye

- pantalla de login
- contexto o capa de auth para sesion
- integracion con `login`, `refresh` y `me`
- guards de ruta
- logout
- manejo de errores de autenticacion

### Excluye

- permisos por rol granulares
- gestion de usuarios
- dashboard funcional completo
- modulos de clientes, inventario, ventas, finanzas y reportes

## Interfaces publicas del sprint

- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET /api/auth/me/`
- ruta `/login`
- rutas privadas protegidas para el resto de modulos

## Contrato esperado de UI e integracion

- login envia credenciales y recibe tokens
- refresh recupera un token de acceso nuevo
- `me` devuelve los datos del usuario autenticado para poblar la sesion
- logout se resuelve del lado cliente salvo decision distinta del backend

## Plan de trabajo por pasos

### Paso 1. Implementar la pantalla de login

- construir formulario visual alineado al mockup disponible
- capturar usuario y password
- mostrar errores de autenticacion de forma clara

**Entregable**

Pantalla de login lista para integrarse al backend.

### Paso 2. Crear la capa de sesion

- definir un contexto o proveedor de autenticacion
- persistir el estado de sesion del usuario
- exponer acciones de login, logout y refresh

**Entregable**

Mecanismo centralizado de sesion para toda la app.

### Paso 3. Integrar auth con backend

- conectar login con `/api/auth/login/`
- conectar refresh con `/api/auth/refresh/`
- conectar perfil con `/api/auth/me/`

**Entregable**

Frontend autenticado contra la API real.

### Paso 4. Proteger rutas privadas

- agregar guards para impedir acceso sin sesion valida
- redirigir al login cuando una ruta requiera autenticacion

**Entregable**

Navegacion segura para pantallas internas.

### Paso 5. Implementar logout y manejo de expiracion

- limpiar sesion del lado cliente
- manejar expiracion de token sin romper la experiencia

**Entregable**

Sesion controlada de forma consistente desde la UI.

## Criterios de aceptacion

- un usuario puede iniciar sesion desde frontend contra el backend real
- las rutas privadas no son accesibles sin autenticacion
- el frontend recupera datos basicos del usuario autenticado
- existe manejo visible de credenciales invalidas o sesion vencida
- el logout devuelve a la pantalla de login y limpia la sesion local

## Dependencias del sprint

- Sprint Frontend 1 implementado
- endpoints JWT del backend disponibles
- usuario de desarrollo funcional en la base de datos

## Riesgos y notas

- la persistencia de tokens debe mantenerse simple y documentada
- no adelantar permisos por rol en este sprint
- cualquier decision distinta sobre logout backend debe documentarse si aparece

## Suposiciones y defaults elegidos

- la sesion se basa en JWT ya implementado en backend
- el frontend consumira auth por el proxy local de Vite
- permisos granulares quedan fuera de este sprint
