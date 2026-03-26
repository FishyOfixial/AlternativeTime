# Arquitectura Tecnica

## Stack oficial

El stack actual del proyecto es:

- Backend: Django REST API
- Frontend: React con Vite
- Estilos frontend: Tailwind CSS
- Base de datos en desarrollo: SQLite
- Base de datos en produccion: PostgreSQL
- Configuracion de entorno: archivo `.env` en la raiz del repositorio

## Objetivo de la arquitectura actual

La arquitectura busca separar claramente la capa de negocio y datos del backend
de la capa de experiencia de usuario del frontend, manteniendo un setup simple
para desarrollo local y preparado para crecer hacia produccion.

## Separacion de responsabilidades

### Backend

Responsable de:

- exponer endpoints HTTP bajo `/api/*`
- centralizar reglas de negocio
- gestionar acceso a datos
- integrar autenticacion, permisos y validaciones de negocio
- servir como fuente de verdad del sistema

### Frontend

Responsable de:

- renderizar la interfaz de usuario
- manejar navegacion y estado de la experiencia cliente
- consumir la API del backend
- presentar datos operativos y administrativos

## Flujo de comunicacion actual

El flujo actual es:

`frontend -> /api/* -> proxy de Vite -> Django REST API`

En desarrollo, Vite redirige las solicitudes `/api` al backend local en
`http://127.0.0.1:8000`.

## Estrategia de entornos

### Desarrollo

- `DB_ENGINE=sqlite`
- base de datos local simple
- menor friccion para arrancar el proyecto

### Produccion

- `DB_ENGINE=postgres`
- configuracion mediante `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`,
  `POSTGRES_HOST` y `POSTGRES_PORT`
- opcion mas adecuada para persistencia real y escalabilidad basica

## Configuracion centralizada con `.env`

El proyecto usa el archivo `.env` en la raiz como fuente principal de
configuracion para Django. Actualmente se contemplan variables como:

- `APP_ENV`
- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS`
- `DJANGO_CORS_ALLOWED_ORIGINS`
- `DJANGO_CSRF_TRUSTED_ORIGINS`
- `DB_ENGINE`
- `SQLITE_NAME`
- `POSTGRES_*`

El archivo `.env.example` documenta el contrato de configuracion sin exponer
secretos reales.

## Estado real actual del backend

Actualmente el backend ya esta organizado en apps funcionales:

- `api`: endpoints transversales o de sistema, como salud
- `users`: autenticacion JWT y datos del usuario autenticado
- `clients`: CRUD base de clientes
- `inventory`: CRUD base de inventario y productos
- `sales`: ventas y sus items con logica transaccional
- `finance`: resumen financiero inicial
- `reports`: reportes operativos agregados

Esta base ya permite trabajar sobre autenticacion, clientes, inventario,
ventas y primeras metricas sin rehacer la estructura principal del proyecto.

## Decisiones tecnicas iniciales y motivo

### Django REST API como backend principal

Se eligio por su madurez, velocidad de arranque, herramientas integradas y buen
encaje para aplicaciones administrativas con crecimiento incremental.

### React + Vite + Tailwind en frontend

Se eligio para tener una base moderna, rapida de desarrollar y facil de escalar
en una interfaz administrativa basada en componentes.

### SQLite en desarrollo / PostgreSQL en produccion

Esta combinacion reduce friccion local sin perder una ruta clara hacia un motor
de base de datos apto para produccion.

### Monorepo con `backend/` y `frontend/`

Se eligio para mantener el sistema coordinado en un solo repositorio y facilitar
el onboarding, la version compartida y la documentacion unificada.

## Estructura esperada del repositorio

- `backend/`: aplicacion Django REST API
- `frontend/`: aplicacion React + Vite + Tailwind
- `docs/`: documentacion funcional y tecnica del proyecto
- `docs/design/`: referencias visuales del producto

## Interfaces publicas actuales

Actualmente el sistema expone y consume estas interfaces concretas:

- `GET /api/health/` desde el backend
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET /api/auth/me/`
- `/api/clients/`
- `/api/inventory/`
- `/api/sales/`
- `GET /api/finance/summary/`
- `GET /api/reports/sales-summary/`
- `GET /api/reports/inventory-summary/`
- consumo desde el frontend de `/api/health/` mediante proxy de Vite
- configuracion del backend mediante variables `DJANGO_*`, `DB_ENGINE`,
  `SQLITE_NAME` y `POSTGRES_*`

## Limites actuales de la arquitectura

Todavia no se han cerrado por completo:

- permisos por rol
- reglas de negocio completas del dominio
- decisiones finales de despliegue y operacion para produccion
- router de frontend por pantallas reales

Estos puntos deben evolucionar sobre esta base, sin asumir todavia una solucion
cerrada.
