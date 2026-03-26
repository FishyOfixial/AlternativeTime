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
|  |- config/
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

- `docs/db/query/insert_devadmin_sqlite.sql`

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

## Variables de entorno

El archivo `.env` en la raiz controla el backend.

Desarrollo con SQLite:

```env
DB_ENGINE=sqlite
SQLITE_NAME=db.sqlite3
```

Produccion con PostgreSQL:

```env
DB_ENGINE=postgres
POSTGRES_DB=alternative_time
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

Usa `.env.example` como plantilla.
