# Registro de Decisiones Tecnicas

## DEC-001 Monorepo con `backend/` y `frontend/`

**Decision**

Usar un monorepo con separacion clara entre backend y frontend.

**Contexto**

El proyecto necesita avanzar de forma coordinada entre API, interfaz y
documentacion, manteniendo una sola fuente de version.

**Impacto**

Facilita onboarding, consistencia documental y evolucion conjunta del sistema.

**Estado**

Aprobada.

## DEC-002 Django REST como backend principal

**Decision**

Usar Django + Django REST Framework como base del backend.

**Contexto**

El proyecto necesita una base madura para administrar modelos, endpoints y
configuracion de una aplicacion administrativa.

**Impacto**

Permite arrancar rapido, mantener una estructura clara y crecer por modulos.

**Estado**

Aprobada.

## DEC-003 React + Vite + Tailwind como frontend

**Decision**

Usar React con Vite y Tailwind CSS en el frontend.

**Contexto**

Se busca una base moderna, veloz en desarrollo y adecuada para construir una
interfaz administrativa por componentes.

**Impacto**

Mejora la velocidad de iteracion y deja una ruta clara para evolucionar la UI.

**Estado**

Aprobada.

## DEC-004 SQLite en desarrollo y PostgreSQL en produccion

**Decision**

Usar SQLite para desarrollo local y PostgreSQL para produccion.

**Contexto**

Se necesita una experiencia simple para arrancar localmente y una opcion apta
para persistencia real en despliegue.

**Impacto**

Reduce friccion en desarrollo y conserva una estrategia valida para produccion.

**Estado**

Aprobada.

## DEC-005 Archivo `.env` en la raiz del proyecto

**Decision**

Centralizar la configuracion del backend en un `.env` ubicado en la raiz del
repositorio.

**Contexto**

El proyecto actual tiene una sola aplicacion backend y necesita una ruta simple
de configuracion por entorno.

**Impacto**

Hace mas directo el setup local y mantiene visible el contrato de variables.

**Estado**

Aprobada.

## DEC-006 Documentacion tecnica centrada en `docs/`

**Decision**

Usar `docs/` como fuente principal de documentacion funcional y tecnica.

**Contexto**

El repositorio ya cuenta con SRS y mockups, pero faltaba una capa de
documentacion operativa y de arquitectura conectada con la implementacion real.

**Impacto**

Mejora onboarding, trazabilidad y claridad sobre decisiones ya tomadas y
pendientes abiertos.

**Estado**

Aprobada.
