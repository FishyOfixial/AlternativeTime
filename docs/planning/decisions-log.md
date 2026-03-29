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

## DEC-007 JWT con DRF como estrategia inicial de autenticacion backend

**Decision**

Usar JWT con Django REST Framework como estrategia inicial de autenticacion para
el backend.

**Contexto**

El frontend consume la API desde una aplicacion React separada y el backend
necesita una forma clara y moderna de autenticacion para el MVP.

**Impacto**

Deja un contrato de acceso consistente para frontend, simplifica la integracion
API-first y prepara el terreno para permisos por rol en iteraciones futuras.

**Estado**

Aprobada.

## DEC-008 Modulo de usuarios oculto temporalmente en frontend

**Decision**

Mantener el modulo de usuarios y la UI de roles fuera de navegacion y rutas
visibles, usando feature flag, sin eliminar codigo ni contratos backend.

**Contexto**

La prioridad actual del producto es operacion comercial (inventario, ventas,
finanzas, reportes, apartados). El sistema se usara en modo administrativo
unificado durante esta fase.

**Impacto**

Reduce alcance y riesgo de release en frontend. Conserva opcion de reactivar
usuarios/roles en una fase futura sin reescritura mayor.

**Estado**

Aprobada.

## DEC-009 Sprint 9 enfocado en hardening sin features nuevas

**Decision**

Ejecutar Sprint 9 como cierre de calidad y release sin agregar nuevas
funcionalidades de negocio ni endpoints.

**Contexto**

Con Sprint 8 ya implementado (apartados, abonos y alertas), el principal riesgo
para salida es regresion cruzada entre modulos y deuda tecnica en frontend.

**Impacto**

Prioriza estabilidad, cobertura de pruebas, consistencia UX y documentacion de
release. Reduce riesgo operativo antes de habilitar nuevas capacidades.

**Estado**

Aprobada.

## DEC-010 Estrategia offline-first por fases (sin implementacion inmediata)

**Decision**

Adoptar una estrategia offline-first en fases, iniciando por planeacion tecnica
y PWA base antes de habilitar escrituras offline en flujos criticos.

**Contexto**

Existe interes de negocio por operacion con conectividad limitada, pero los
modulos actuales (ventas, apartados, finanzas, inventario) tienen reglas
transaccionales sensibles y alto riesgo de conflicto/duplicados.
El contexto real del cliente es multi-device dentro del ecosistema Apple
(`iPhone`, `iPad`, `Mac`), con restricciones reales de Safari/PWA en iOS.

**Impacto**

Permite avanzar con riesgo controlado: primero base PWA + lectura cacheada, y
despues sincronizacion de escrituras con idempotencia y resolucion de
conflictos.
Tambien obliga a no depender de `background sync` como si fuera app nativa, a
usar sincronizacion por eventos visibles y a modelar estados de sync en la UX.

**Estado**

Aprobada.
