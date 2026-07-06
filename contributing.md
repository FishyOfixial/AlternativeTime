# Contributing

## Convenciones del workspace

- `backend/` contiene Django REST API.
- `frontend/` contiene React + Vite + Tailwind.
- `docs/` esta organizado por dominios (`product`, `architecture`, `engineering`,
  `planning`, `specification`, `sprints`, `assets`, `reference`).
- `.env` vive en la raiz del proyecto y no debe subirse al repositorio.
- `.env.example` si se versiona para documentar la configuracion esperada.
- Nunca incluyas credenciales reales de Cloudinary, base de datos, correo o JWT
  en archivos versionados.

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
5. Para probar subidas reales a Cloudinary, configura `CLOUDINARY_URL` en
   `.env`; sin ella, las imagenes se guardan localmente en `backend/media`.

## Base de datos

- En desarrollo se usa `SQLite`.
- En produccion se debe cambiar a `PostgreSQL` mediante `DB_ENGINE=postgres`.

## Verificacion rapida

- Backend: `.\.venv\Scripts\python.exe backend\manage.py check`
- Migraciones: `.\.venv\Scripts\python.exe backend\manage.py migrate`
- Frontend: `npm.cmd run build --prefix frontend`
- Tests backend: `.\.venv\Scripts\python.exe backend\manage.py test`
- Tests frontend: `npm.cmd run test:run --prefix frontend`

## Catalogo publico

- `/catalog` y `/catalog/:id` son rutas publicas.
- `/api/catalog/` es de solo lectura y no requiere JWT.
- `/api/inventory/` y la subida de fotografias permanecen autenticados.
- Una pieza solo aparece si `is_published=True`, esta activa y no esta vendida.
- No agregues costos, proveedor, notas internas o auditoria al serializer publico.
