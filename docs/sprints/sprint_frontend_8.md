# Sprint Frontend 8

## Resumen

Este sprint prepara el frontend para convivir con control de acceso mas fino y,
si el backend ya lo permite, para gestionar usuarios. El foco esta en una capa
de capacidades en UI, visibilidad condicional y experiencia de acceso
restringido.

## Objetivo del sprint

- preparar la UI para permisos y control de acceso
- implementar el modulo de usuarios si backend ya lo soporta
- desacoplar navegacion visible de futuras reglas de rol

## Resultado esperado

Al cerrar este sprint, el frontend debe:

- ocultar o mostrar modulos segun capacidades del usuario
- manejar acceso denegado en rutas o acciones
- tener base para integrar permisos por rol sin rehacer la app
- exponer un modulo de usuarios si el backend ya provee el recurso

## Alcance

### Incluye

- capa de capacidades o permisos en frontend
- navegacion condicional
- pantalla de acceso denegado o comportamiento equivalente
- modulo de usuarios si el backend ya lo permite

### Excluye

- definicion final de roles del negocio
- autorizacion granular compleja no soportada por backend
- rediseño de autenticacion base

## Interfaces publicas del sprint

- rutas condicionadas por capacidad o estado del usuario
- posible ruta `/users` si existe soporte backend
- consumo de `GET /api/auth/me/` como base de capacidades visibles

## Contrato esperado de UI e integracion

- el frontend no debe inventar permisos finales si el backend aun no los define
- la capa de capacidades debe ser adaptable a futuras reglas de rol
- el modulo de usuarios solo se vuelve funcional si la API correspondiente
  existe realmente

## Plan de trabajo por pasos

### Paso 1. Definir la capa de capacidades en frontend

- derivar visibilidad de navegacion y acceso desde datos del usuario
- evitar acoplar componentes a reglas fijas repartidas por toda la app

**Entregable**

Base de control de acceso adaptable para la UI.

### Paso 2. Implementar acceso denegado y proteccion visible

- manejar rutas no permitidas
- mostrar mensajes o pantallas consistentes cuando el usuario no pueda entrar

**Entregable**

Experiencia clara para escenarios de acceso restringido.

### Paso 3. Integrar modulo de usuarios si aplica

- construir listado o gestion basica solo si backend ya expone el recurso
- si no existe aun, dejar la navegacion y el espacio documental preparados

**Entregable**

Modulo de usuarios funcional o preparado sin contradecir el estado real de la
API.

## Criterios de aceptacion

- la navegacion visible puede condicionarse por capacidades o estado del usuario
- existe comportamiento claro para rutas no permitidas
- la app queda lista para crecer hacia permisos por rol
- el modulo de usuarios no se documenta como funcional si la API aun no existe

## Dependencias del sprint

- Sprint Frontend 7 implementado
- datos del usuario autenticado disponibles desde `auth/me`
- futuras decisiones backend sobre roles o usuarios si el modulo se activa

## Riesgos y notas

- este sprint depende en parte de decisiones de backend aun abiertas
- no prometer control de acceso final si la definicion de roles no esta cerrada
- mantener separada la visibilidad de UI de la autorizacion real del backend

## Suposiciones y defaults elegidos

- la UI puede introducir una capa de capacidades antes de tener roles finales
- `users` puede quedar condicionado a backend y no bloquear el resto del plan
- este sprint prepara adaptabilidad, no un sistema final de permisos
