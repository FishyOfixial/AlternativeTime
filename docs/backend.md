# Backend

## Estado actual

El backend esta construido con Django y Django REST Framework. En este momento
ya existe una base funcional del MVP backend con autenticacion, modulos
operativos iniciales y primeros endpoints de consolidacion.

## Estructura base actual

```text
backend/
|- manage.py
|- requirements.txt
|- config/
|  |- settings.py
|  |- urls.py
|  |- asgi.py
|  `- wsgi.py
`- api/
   |- apps.py
   |- urls.py
   |- views.py
   `- migrations/
```

Apps de dominio ya incorporadas:

- `users`
- `clients`
- `inventory`
- `sales`
- `finance`
- `reports`

## Rol de `config/`

`config/` concentra la configuracion global del proyecto Django:

- carga de entorno
- settings del proyecto
- ruteo raiz
- entrada WSGI y ASGI

Es el punto correcto para mantener configuracion transversal, no logica de
negocio por modulo.

## Rol de `api/`

`api/` funciona actualmente como app inicial minima para validar el backend.
Contiene el endpoint de salud y sirve como punto de partida para el contrato
backend/frontend.

Conforme el proyecto crezca, no deberia convertirse en un contenedor de toda la
logica del sistema. Lo recomendable es dividir el dominio en apps Django por
responsabilidad.

## Patron recomendado para futuras apps Django

Cuando el dominio empiece a crecer, crear apps separadas por modulo funcional,
por ejemplo:

- `users`
- `clients`
- `inventory`
- `sales`
- `finance`
- `reports`

Cada app deberia encapsular:

- modelos
- serializers
- views o viewsets
- urls internas
- pruebas
- logica de dominio propia

## Convencion recomendada para endpoints REST

Usar prefijo comun bajo `/api/` y organizar endpoints por recurso.

Ejemplos de convencion:

- `/api/health/`
- `/api/clients/`
- `/api/inventory/`
- `/api/sales/`

Reglas recomendadas:

- nombres de recursos en plural
- respuestas JSON como interfaz principal
- contratos estables y documentables
- logica de autorizacion desacoplada de la capa HTTP cuando se implemente

## Configuracion de base de datos por entorno

El backend ya soporta dos modos:

### Desarrollo

- motor: SQLite
- controlado por `DB_ENGINE=sqlite`
- archivo de base local definido por `SQLITE_NAME`

### Produccion

- motor: PostgreSQL
- controlado por `DB_ENGINE=postgres`
- configuracion a traves de `POSTGRES_DB`, `POSTGRES_USER`,
  `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT` y
  `POSTGRES_CONN_MAX_AGE`

## Hardening y operacion

El backend ya contempla una primera capa de endurecimiento para produccion:

- `APP_ENV=production` para separar defaults de desarrollo
- cookies seguras configurables por entorno
- redireccion SSL configurable
- HSTS configurable
- logging basico a consola
- handler de excepciones DRF con `status_code` consistente en errores API

## CORS y configuracion de integracion

El backend ya contempla:

- `DJANGO_CORS_ALLOWED_ORIGINS`
- `DJANGO_CSRF_TRUSTED_ORIGINS`

Esto permite la integracion local con el frontend servido por Vite.

## Autenticacion

La autenticacion ya tiene una direccion de trabajo definida para el siguiente
sprint del backend.

Decision de trabajo actual:

- JWT con DRF como estrategia objetivo para el MVP backend
- uso del usuario estandar de Django en la primera iteracion

Pendientes aun abiertos:

- no hay estrategia de permisos por rol implementada
- no hay definicion final de roles y autorizacion granular
- no debe asumirse todavia un modelo final de usuarios mas alla del `User`
  estandar de Django

La implementacion debe quedar alineada con las pantallas de login y usuarios que
ya aparecen en los artefactos de diseno y esta planificada en
`docs/sprints/sprint_backend_1.md`.

## Endpoint actual de referencia

El backend expone:

- `GET /api/health/`

Y ya cuenta con endpoints iniciales de negocio y consolidacion:

- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET /api/auth/me/`
- `/api/clients/`
- `/api/inventory/`
- `/api/sales/`
- `GET /api/finance/summary/`
- `GET /api/reports/sales-summary/`
- `GET /api/reports/inventory-summary/`

Este endpoint sirve para:

- comprobar que Django esta corriendo
- validar configuracion basica
- confirmar la integracion con el frontend
- devolver el modo de base de datos activo (`sqlite` o `postgres`)

## Pendientes backend mas importantes

- definir permisos por rol
- reforzar calidad y cobertura en flujos criticos
- profundizar endurecimiento para produccion
- ampliar observabilidad y manejo de errores
- preparar despliegue con PostgreSQL

## Siguientes pasos operativos

Los siguientes sprints de backend quedan orientados a:

- `clients` e `inventory` en `docs/sprints/sprint_backend_2.md`
- `sales` en `docs/sprints/sprint_backend_3.md`
- `finance` y `reports` en `docs/sprints/sprint_backend_4.md`
- endurecimiento, despliegue y calidad en `docs/sprints/sprint_backend_5.md`
