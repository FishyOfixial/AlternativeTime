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
- `layaways`
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
- `/api/layaways/`
- `/api/catalog/`

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

## Autenticacion y superficie publica

El backend usa JWT de Simple JWT con el usuario estandar de Django. La politica
global de DRF exige autenticacion; cada excepcion publica debe declararse de
forma explicita.

Actualmente son publicos:

- `GET /api/health/`
- `GET /api/catalog/`
- `GET /api/catalog/:id/`

`PublicCatalogViewSet` usa `AllowAny`, no habilita autenticadores y hereda de
`ReadOnlyModelViewSet`. El CRUD de inventario, costos y fotografias conserva la
proteccion JWT. Los permisos granulares por rol siguen pendientes.

## Imagenes y Cloudinary

`InventoryItem.primary_image` utiliza el storage por defecto de Django:

- si existe `CLOUDINARY_URL`, usa
  `inventory.storage.CloudinaryImageStorage`
- sin la variable, usa `FileSystemStorage` y `backend/media`

La subida autenticada se realiza con:

```text
POST /api/inventory/:id/primary-image/
Content-Type: multipart/form-data
campo: primary_image
```

Se aceptan JPG, PNG y WebP de hasta 8 MB. Al reemplazar una fotografia, el
endpoint elimina el asset anterior. No imprimas ni registres `CLOUDINARY_URL`,
porque incluye API key y secret.

## Endpoint actual de referencia

El backend expone:

- `GET /api/health/`

Y ya cuenta con endpoints iniciales de negocio y consolidacion:

- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET /api/auth/me/`
- `/api/clients/`
- `/api/inventory/`
- `GET /api/catalog/`
- `GET /api/catalog/:id/`
- `POST /api/inventory/:id/primary-image/`
- `/api/sales/`
- `/api/layaways/`
- `/api/notifications/`
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

- `clients` e `inventory` en `docs/sprints/backend/backend-sprint-02-clients-inventory.md`
- `sales` en `docs/sprints/backend/backend-sprint-03-sales.md`
- `finance` y `reports` en `docs/sprints/backend/backend-sprint-04-finance-reports.md`
- endurecimiento, despliegue y calidad en `docs/sprints/backend/backend-sprint-05-hardening-release.md`

