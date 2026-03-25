# Backend

## Estado actual

El backend esta construido con Django y Django REST Framework. En este momento
existe una base minima funcional orientada a validar configuracion, estructura e
integracion con el frontend.

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
  `POSTGRES_PASSWORD`, `POSTGRES_HOST` y `POSTGRES_PORT`

## CORS y configuracion de integracion

El backend ya contempla:

- `DJANGO_CORS_ALLOWED_ORIGINS`
- `DJANGO_CSRF_TRUSTED_ORIGINS`

Esto permite la integracion local con el frontend servido por Vite.

## Autenticacion

La autenticacion es un pendiente abierto definido, pero todavia no resuelto.

Por ahora:

- no hay modelo de autenticacion final decidido
- no hay estrategia de permisos por rol implementada
- no debe asumirse aun si se usaran sesiones, JWT u otra variante

Cuando se implemente, debe quedar alineada con las pantallas de login y usuarios
que ya aparecen en los artefactos de diseno.

## Endpoint actual de referencia

El backend expone:

- `GET /api/health/`

Este endpoint sirve para:

- comprobar que Django esta corriendo
- validar configuracion basica
- confirmar la integracion con el frontend
- devolver el modo de base de datos activo (`sqlite` o `postgres`)

## Pendientes backend mas importantes

- definir apps de dominio reales
- disenar modelos del negocio
- definir autenticacion y permisos
- estandarizar estructura de serializers y vistas
- agregar pruebas de API por modulo
