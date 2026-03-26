# Sprint Backend 1

## Resumen

Este sprint convierte la base minima actual del backend en una base lista para
crecer. El foco esta en estructura modular, autenticacion JWT y contrato inicial
de acceso para el frontend React, sin entrar todavia a clientes, inventario,
ventas, finanzas o reportes.

## Objetivo del sprint

- consolidar la base tecnica del backend
- definir e implementar autenticacion JWT para el frontend React
- dejar el proyecto listo para que el siguiente sprint construya modulos de
  negocio

## Resultado esperado

Al cerrar este sprint, el backend debe:

- mantener funcionando `GET /api/health/`
- exponer endpoints de autenticacion listos para consumo desde frontend
- tener estructura de apps preparada para crecer por dominio
- proteger recursos privados con autenticacion
- contar con pruebas minimas de salud y auth

## Alcance

### Incluye

- hardening de settings DRF
- integracion de JWT
- app o modulo de autenticacion y usuarios
- endpoints `login`, `refresh` y `me`
- permisos base autenticados
- pruebas iniciales
- actualizacion de documentacion tecnica si cambia el contrato backend

### Excluye

- roles granulares
- clientes
- inventario
- ventas
- finanzas
- reportes
- modelo de dominio final del negocio

## Interfaces publicas del sprint

- `GET /api/health/`
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET /api/auth/me/`

## Contrato esperado de respuestas

- `login` devuelve tokens de acceso y refresh
- `refresh` devuelve un nuevo token de acceso
- `me` devuelve datos basicos del usuario autenticado
- `health` devuelve estado del servicio y motor de base de datos activo

## Plan de trabajo por pasos

### Paso 1. Reorganizar la base del backend

- mantener `config/` como nucleo del proyecto
- preparar una estructura orientada a apps de dominio
- conservar `api/` solo para funciones transversales o de sistema si sigue
  existiendo
- crear una ubicacion clara para autenticacion, recomendada: app `users`

**Entregable**

Estructura de backend lista para crecer sin seguir sobrecargando `api/`.

### Paso 2. Definir la estrategia de autenticacion

- adoptar JWT con DRF como decision oficial del sprint
- usar el usuario estandar de Django en esta etapa
- no introducir custom user model salvo necesidad concreta detectada antes de
  implementar

**Entregable**

Decision tecnica cerrada para auth del MVP backend.

### Paso 3. Configurar DRF para auth

- instalar y configurar soporte JWT en settings
- definir autenticacion por defecto para endpoints protegidos
- mantener `/api/health/` como endpoint publico
- dejar permisos por defecto seguros para que nuevos endpoints no queden
  publicos por accidente

**Entregable**

Backend con DRF configurado para autenticacion JWT y permisos base consistentes.

### Paso 4. Implementar endpoints de autenticacion

- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET /api/auth/me/`
- no implementar logout de servidor en este sprint salvo que se adopte
  blacklist explicita; por defecto, el logout queda del lado cliente

**Entregable**

Contrato inicial de autenticacion disponible para el frontend.

### Paso 5. Integrar URLs y contrato backend

- registrar las rutas de auth bajo `/api/auth/`
- mantener el contrato actual de `/api/health/`
- asegurar que el frontend pueda consumir auth y health por el proxy de Vite
  sin cambios de dominio

**Entregable**

Backend accesible desde frontend con rutas publicas y privadas claras.

### Paso 6. Proteger el acceso

- requerir token valido para `me` y cualquier endpoint privado nuevo
- mantener solo `health` como publico
- documentar que roles y permisos detallados pasan al sprint siguiente o a una
  fase posterior

**Entregable**

Base de seguridad funcional para el siguiente sprint.

### Paso 7. Pruebas del sprint

- prueba de `GET /api/health/` con 200
- prueba de login exitoso
- prueba de login invalido
- prueba de refresh valido
- prueba de `me` autenticado
- prueba de `me` sin token
- prueba de permisos para confirmar que un endpoint privado no queda abierto

**Entregable**

Cobertura minima sobre salud, autenticacion y proteccion de acceso.

### Paso 8. Cierre del sprint

- actualizar `docs/backend.md` si cambian las convenciones backend
- registrar la decision de JWT en `docs/decisions.md` si aun no aparece
- dejar listo el terreno para Sprint Backend 2: `clients` e `inventory`

**Entregable**

Sprint cerrado con documentacion y decisiones alineadas al estado real del repo.

## Criterios de aceptacion

- el backend arranca sin romper la configuracion actual por `.env`
- el endpoint de salud sigue funcionando
- el frontend puede autenticar contra el backend usando JWT
- los endpoints privados requieren autenticacion
- existe cobertura minima de pruebas para salud y auth
- la estructura del backend queda preparada para que el siguiente sprint
  implemente modulos de negocio sin rehacer auth

## Dependencias del sprint

- setup actual del backend con Django REST Framework
- configuracion de entorno por `.env`
- proxy local de Vite ya funcional en frontend

## Riesgos y notas

- cambiar a JWT introduce dependencias nuevas y ajustes en settings
- si se detecta necesidad de custom user model, debe pausarse el sprint antes de
  migrar auth para evitar deuda tecnica fuerte
- roles y permisos detallados no deben colarse en este sprint

## Suposiciones y defaults elegidos

- ruta del documento: `docs/sprints/sprint_backend_1.md`
- convencion futura: un archivo Markdown por sprint dentro de `docs/sprints/`
- estrategia de auth: JWT con DRF
- alcance: base tecnica y autenticacion, sin modulos de negocio todavia
- usuario base: `django.contrib.auth.models.User`
