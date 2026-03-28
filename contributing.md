# Contributing

## Convenciones del workspace

- `backend/` contiene Django REST API.
- `frontend/` contiene React + Vite + Tailwind.
- `docs/` esta organizado por dominios (`product`, `architecture`, `engineering`,
  `planning`, `specification`, `sprints`, `assets`, `reference`).
- `.env` vive en la raiz del proyecto y no debe subirse al repositorio.
- `.env.example` si se versiona para documentar la configuracion esperada.

## Convenciones de documentacion

- Usa `kebab-case` para nombres de archivos y carpetas.
- En sprints, usa prefijo de capa + numero + tema:
  - `backend-sprint-XX-...`
  - `frontend-sprint-XX-...`
- Si mueves o renombras docs, actualiza enlaces en `README.md` y `docs/README.md`.

## Flujo recomendado

1. Crea o activa `.venv`.
2. Instala dependencias del backend desde `backend/requirements.txt`.
3. Instala dependencias del frontend desde `frontend/package.json`.
4. Ejecuta backend y frontend en paralelo.

## Base de datos

- En desarrollo se usa `SQLite`.
- En produccion se debe cambiar a `PostgreSQL` mediante `DB_ENGINE=postgres`.

## Verificacion rapida

- Backend: `.\.venv\Scripts\python.exe backend\manage.py check`
- Migraciones: `.\.venv\Scripts\python.exe backend\manage.py migrate`
- Frontend: `npm.cmd run build --prefix frontend`
