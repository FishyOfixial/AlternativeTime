# Alternative Time - Plataforma Empresarial de Operacion Comercial para Relojeria

Software empresarial para administracion operativa, comercial y financiera de una relojeria, diseñado para centralizar inventario, clientes, ventas, apartados y reportes en una sola plataforma web.

## Vision del Sistema

La plataforma integra en un mismo entorno:

- Control de inventario de relojes, costos, estado y antigüedad.
- Gestión de clientes con historial comercial y contexto operativo.
- Registro de ventas con trazabilidad financiera.
- Administración de apartados, pagos parciales y seguimiento.
- Resumen financiero y reportes de negocio.
- Autenticación y protección de acceso para operación interna.

El objetivo principal es mantener control integral del ciclo comercial de cada pieza, desde su incorporación a inventario hasta su venta, apartado o seguimiento financiero posterior.

## Propuesta de Valor

Alternative Time está orientado a empresas que requieren:

- visibilidad centralizada del inventario y su rotación
- continuidad operativa en procesos comerciales
- trazabilidad de clientes, ventas y movimientos financieros
- capacidad de supervisión desde una interfaz única
- soporte para operación diaria y análisis de gestión

La solución busca reducir dispersión operativa, mejorar consistencia de datos y fortalecer el seguimiento comercial del negocio.

## Alcance Funcional

La plataforma cubre de forma integrada:

- inventario de productos
- base de clientes
- flujo de ventas
- apartados y pagos parciales
- finanzas operativas
- reportes ejecutivos
- healthcheck y monitoreo básico del sistema

## Arquitectura de Alto Nivel

La solución está construida con una separación clara entre backend y frontend, siguiendo una organización modular por dominios de negocio.

### Backend Django

Backend empresarial sobre Django REST Framework, organizado por capacidades funcionales:

- `users`: autenticación, sesión y datos del usuario autenticado.
- `clients`: clientes, datos de contacto, notas e historial comercial.
- `inventory`: catálogo de relojes, costos, estado y antigüedad.
- `sales`: ventas, rentabilidad y relación con cliente y producto.
- `layaways`: apartados, pagos parciales y saldo pendiente.
- `finance`: movimientos, balances y resumen financiero.
- `reports`: indicadores, dashboard y exportación de información.
- `api`: utilidades transversales, healthcheck y endpoints base.

### Frontend React

Frontend SPA construido con React + Vite:

- login protegido con JWT
- shell autenticado con navegación lateral
- módulos por dominio de negocio
- healthcheck público para validación rápida del sistema
- consumo de API configurable por entorno

## Modulos del Producto

### Clients

Gestión de clientes y contexto comercial:

- datos de contacto
- notas
- historial de compra
- relación con ventas y apartados

### Inventory

Gestión del inventario operativo:

- alta y edición de productos
- costos y precio de venta
- antigüedad y estado del reloj
- importación de inventario por CSV

### Sales

Registro comercial de ventas:

- captura de venta
- relación con cliente y producto
- métodos de pago
- utilidad y margen

### Layaways

Control de apartados:

- alta de apartado
- pagos parciales
- saldo pendiente
- consulta de detalle por apartado

### Finance

Seguimiento financiero:

- resumen financiero
- balances por cuenta
- movimientos manuales
- exportación de flujo y consultas

### Reports

Indicadores y exportación:

- dashboard summary
- sales summary
- inventory summary
- exportación CSV/XLSX

## Componentes Funcionales Clave

- Control de acceso: autenticación JWT y separación entre rutas públicas y protegidas.
- Inventario como fuente operativa: cada reloj mantiene estado, costo, antigüedad y trazabilidad comercial.
- Ventas y apartados: soporte para venta directa y esquemas de pago parcial.
- Finanzas consolidadas: balances, movimientos y resumen financiero del negocio.
- Reportería operativa: indicadores para dashboard, inventario y ventas.
- Importación legacy: command para migrar datos históricos desde SQL legacy hacia el modelo actual.

## Integraciones y Continuidad Operativa

La solución está preparada para operar con infraestructura cloud administrada y un modelo de despliegue productivo basado en servicios separados para:

- backend
- frontend
- base de datos

Por seguridad y gobierno de datos, este documento no publica credenciales reales, endpoints privados ni información sensible de infraestructura.

## Seguridad y Gobierno de Plataforma

La configuración actual contempla:

- separación entre configuración local y producción
- variables sensibles por entorno
- autenticación basada en JWT
- control de hosts permitidos
- políticas de CORS y CSRF para frontend productivo
- despliegue con configuración segura para cookies y HTTPS

## Entorno Tecnologico

- Django 6
- Django REST Framework
- Simple JWT
- React 19
- Vite
- Tailwind CSS
- PostgreSQL en producción
- SQLite en desarrollo
- Gunicorn para despliegue WSGI
- WhiteNoise para manejo de estáticos
- Render como infraestructura objetivo de despliegue

## Estructura del Repositorio

```text
AlternativeTime/
|- backend/
|  |- api/
|  |- clients/
|  |- config/
|  |- finance/
|  |- inventory/
|  |- layaways/
|  |- reports/
|  |- sales/
|  |- users/
|  |- manage.py
|  `- requirements.txt
|- frontend/
|  |- src/
|  |- package.json
|  `- vite.config.js
|- docs/
|- render.yaml
|- .env.example
`- README.md
```

## Ejecucion Local

### Backend

Crear y activar entorno virtual:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Instalar dependencias:

```powershell
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

Aplicar migraciones y levantar backend:

```powershell
.\.venv\Scripts\python.exe backend\manage.py migrate
.\.venv\Scripts\python.exe backend\manage.py runserver
```

Validaciones recomendadas:

```powershell
cd backend
..\.venv\Scripts\python.exe manage.py check
..\.venv\Scripts\python.exe manage.py test users api clients inventory sales layaways finance reports
```

Healthcheck local:

```text
http://127.0.0.1:8000/api/health/
```

### Frontend

Instalar dependencias:

```powershell
npm.cmd install --prefix frontend
```

Levantar frontend:

```powershell
npm.cmd run dev --prefix frontend
```

Frontend local:

```text
http://localhost:5173
```

Validaciones recomendadas:

```powershell
npm.cmd run test:run --prefix frontend
npm.cmd run build --prefix frontend
```

## Variables de Entorno

La configuración principal del backend se controla desde `.env` en la raíz del proyecto.

Archivos de referencia:

- [.env.example](./.env.example)
- [frontend/.env.example](./frontend/.env.example)

Variables importantes de backend:

- `APP_ENV`
- `DJANGO_DEBUG`
- `DJANGO_SECRET_KEY`
- `DATABASE_URL`
- `DJANGO_ALLOWED_HOSTS`
- `DJANGO_CORS_ALLOWED_ORIGINS`
- `DJANGO_CSRF_TRUSTED_ORIGINS`
- `FRONTEND_HOST`

Variables importantes de frontend:

- `VITE_API_BASE_URL`
- `VITE_API_HOST`

## Deploy en Render

El repositorio ya incluye blueprint listo para Render en:

- [render.yaml](./render.yaml)

Servicios definidos:

- `alternative-time-api`: backend Django
- `alternative-time-web`: static site de frontend
- `alternative-time-db`: PostgreSQL administrado

Capacidades de la configuración actual:

- instalación automática del backend
- `collectstatic`
- migraciones al arranque del servicio
- frontend publicado como sitio estático
- rewrite SPA para `react-router-dom`
- conexión automática entre frontend, backend y base de datos

## Operacion y Mantenimiento

Management commands relevantes:

- [import_legacy_data.py](./backend/api/management/commands/import_legacy_data.py)
- [update_inventory_age.py](./backend/inventory/management/commands/update_inventory_age.py)

Uso típico:

```powershell
.\.venv\Scripts\python.exe backend\manage.py update_inventory_age
```

```powershell
.\.venv\Scripts\python.exe backend\manage.py import_legacy_data --sql-path "C:\ruta\archivo.sql" --username admin --password <password>
```

## Documentacion Complementaria

La documentación funcional y técnica vive en `docs/`.

Rutas recomendadas:

- `docs/product/`
- `docs/architecture/`
- `docs/engineering/`
- `docs/planning/`
- `docs/specification/`
- `docs/sprints/`

Especialmente útiles:

- [docs/architecture/system-architecture.md](./docs/architecture/system-architecture.md)
- [docs/engineering/backend-guide.md](./docs/engineering/backend-guide.md)
- [docs/engineering/frontend-guide.md](./docs/engineering/frontend-guide.md)
- [docs/planning/roadmap.md](./docs/planning/roadmap.md)
- [docs/planning/offline-sync-action-plan.md](./docs/planning/offline-sync-action-plan.md)

## Estado del Producto

Producto activo en evolución continua, con enfoque en control operativo, visibilidad comercial y estabilidad del flujo de trabajo para una operación empresarial de relojería.

## Autor

Ivan Ramos de la Torre  
Ingeniería de Software y Minería de Datos  
Universidad Autónoma de Guadalajara

## Licencia

Este repositorio no publica una licencia abierta por defecto. El uso, distribución o explotación del software debe sujetarse a la autorización correspondiente del propietario del proyecto.
