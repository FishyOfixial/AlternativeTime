# Alternative Time

Workspace base preparado para trabajar con:

- Django REST API
- React + Vite + Tailwind CSS
- SQLite en desarrollo
- PostgreSQL en produccion
- variables de entorno centralizadas en `.env`

## Estructura

```text
AlternativeTime/
|- .env
|- backend/
|  |- api/
|  |- clients/
|  |- config/
|  |- finance/
|  |- inventory/
|  |- reports/
|  |- sales/
|  |- users/
|  |- manage.py
|  `- requirements.txt
|- frontend/
|  |- src/
|  |- package.json
|  |- tailwind.config.js
|  `- vite.config.js
`- docs/
```

## Backend

Crear y activar el entorno virtual:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Instalar dependencias:

```powershell
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

Aplicar migraciones y correr el servidor:

```powershell
.\.venv\Scripts\python.exe backend\manage.py migrate
.\.venv\Scripts\python.exe backend\manage.py runserver
```

Validaciones recomendadas del backend:

```powershell
cd backend
..\.venv\Scripts\python.exe manage.py check
..\.venv\Scripts\python.exe manage.py test users api clients inventory sales layaways finance reports
```

## Valores por defecto para desarrollo

Si quieres dejar la base local con un usuario inicial para probar login del
backend, puedes crearlo de dos formas.

### Opcion recomendada: crear el usuario con Django

```powershell
cd backend
..\.venv\Scripts\python.exe manage.py shell -c "from django.contrib.auth import get_user_model; User=get_user_model(); u, created = User.objects.get_or_create(username='devadmin', defaults={'email':'devadmin@example.com','first_name':'Dev','last_name':'Admin','is_staff':True,'is_superuser':True}); u.set_password('DevAdmin123!'); u.save(); print('created' if created else 'updated', u.username)"
```

Credenciales de desarrollo:

- usuario: `devadmin`
- password: `DevAdmin123!`

### Opcion SQL directa para SQLite

Tambien puedes usar el query guardado en:

- `docs/reference/db/seed/insert_devadmin_sqlite.sql`

Ese archivo inserta el mismo usuario de desarrollo directamente en la tabla
`auth_user` de SQLite.

### Login de prueba contra la API

Una vez levantado el backend, puedes iniciar sesion contra:

```text
POST http://127.0.0.1:8000/api/auth/login/
```

Payload:

```json
{
  "username": "devadmin",
  "password": "DevAdmin123!"
}
```

API de prueba:

```text
http://127.0.0.1:8000/api/health/
```

Endpoints backend disponibles:

```text
POST /api/auth/login/
POST /api/auth/refresh/
GET  /api/auth/me/
GET|POST /api/clients/
GET|POST /api/inventory/
GET|POST /api/sales/
GET|POST /api/layaways/
GET /api/layaways/{id}/
POST /api/layaways/{id}/payments/
GET /api/notifications/
GET /api/finance/summary/
GET /api/finance/balances/
GET|POST /api/finance/entries/
PUT|PATCH|DELETE /api/finance/entries/{id}/
GET /api/reports/sales-summary/
GET /api/reports/inventory-summary/
GET /api/reports/dashboard-summary/
GET /api/reports/{type}/export/?format=csv|xlsx
```

## Frontend

Instalar dependencias:

```powershell
npm.cmd install --prefix frontend
```

Levantar Vite:

```powershell
npm.cmd run dev --prefix frontend
```

Frontend local:

```text
http://localhost:5173
```

Variables opcionales del frontend:

- `frontend/.env.example`
- `VITE_API_BASE_URL`: URL completa del backend, por ejemplo `https://api.example.com`
- `VITE_API_HOST`: host del backend sin protocolo, por ejemplo `api.example.com`

Nota de planeacion:

- Existe un roadmap documentado para evolucionar el frontend a PWA con soporte
  offline-first, pensado especificamente para ecosistema Apple multi-device
  (`iPhone`, `iPad`, `Mac`), sin implementacion activa todavia.
- Referencia: `docs/planning/offline-sync-action-plan.md`

Validaciones recomendadas del frontend:

```powershell
npm.cmd run test:run --prefix frontend
npm.cmd run build --prefix frontend
```

Plan operativo del frontend:

- `docs/sprints/frontend/frontend-sprint-01-foundations.md` a `docs/sprints/frontend/frontend-sprint-09-hardening-release.md`

## Variables de entorno

El archivo `.env` en la raiz controla el backend.

Desarrollo con SQLite:

```env
DB_ENGINE=sqlite
SQLITE_NAME=db.sqlite3
```

Produccion con PostgreSQL:

```env
APP_ENV=production
DJANGO_DEBUG=False
DB_ENGINE=postgres
POSTGRES_DB=alternative_time
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_CONN_MAX_AGE=60
DJANGO_SECURE_SSL_REDIRECT=True
DJANGO_SESSION_COOKIE_SECURE=True
DJANGO_CSRF_COOKIE_SECURE=True
DJANGO_SECURE_HSTS_SECONDS=3600
DJANGO_SECURE_HSTS_INCLUDE_SUBDOMAINS=True
DJANGO_SECURE_HSTS_PRELOAD=True
DJANGO_LOG_LEVEL=INFO
```

Usa `.env.example` como plantilla.

## Deploy en Render

El repo ya incluye un Blueprint en:

- `render.yaml`

Arquitectura preparada para Render:

- `alternative-time-api`: web service Python para Django
- `alternative-time-web`: static site para Vite
- `alternative-time-db`: Postgres administrado por Render

Qué hace esta configuracion:

- instala el backend y corre `collectstatic`
- ejecuta migraciones antes de cada deploy
- levanta Django con `gunicorn`
- publica el frontend como static site
- reescribe `/*` a `index.html` para que `react-router-dom` funcione en produccion
- conecta el frontend al backend usando variables de Render entre servicios

Pasos en Render:

1. Crea un nuevo Blueprint desde tu repositorio.
2. Deja `render.yaml` como archivo de configuracion.
3. Revisa los nombres de servicios y los planes antes de confirmar.
4. Espera a que Render cree `alternative-time-db`, `alternative-time-api` y `alternative-time-web`.
5. Crea un superusuario si lo necesitas:

```powershell
python backend\manage.py createsuperuser
```

Variables clave para produccion en Render:

- `APP_ENV=production`
- `DJANGO_DEBUG=False`
- `DATABASE_URL` desde la base Postgres de Render
- `FRONTEND_HOST` desde el static site de Render
- `VITE_API_HOST` desde el web service del backend

Notas de produccion:

- Django ahora acepta `DATABASE_URL` para integrarse mejor con Render.
- El backend sirve estaticos con WhiteNoise, util para admin y browsable API.
- Si luego agregas dominio propio, conviene actualizar `DJANGO_ALLOWED_HOSTS`, `DJANGO_CORS_ALLOWED_ORIGINS` y `DJANGO_CSRF_TRUSTED_ORIGINS` con tu dominio final.

