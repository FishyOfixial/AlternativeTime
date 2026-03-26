# Sprint Frontend 9

## Resumen

Este sprint cierra la alineación del frontend con la spec en la capa
administrativa y de release: usuarios, roles, auditoría visible, endurecimiento
de calidad, accesibilidad, responsive y checklist final de entrega.

## Objetivo del sprint

- implementar control de acceso real en la UI
- exponer el modulo de usuarios y auditoria si backend ya lo soporta
- dejar el frontend listo para release controlado

## Resultado esperado

Al cerrar este sprint, el frontend debe:

- mostrar u ocultar módulos según rol o capacidades reales
- ofrecer pantalla administrativa de usuarios si la API existe
- representar auditoría o trazabilidad básica donde aplique
- cerrar con pruebas, responsive y documentación actualizada

## Alcance

### Incluye

- navegación condicionada por rol/capacidades
- estados de acceso denegado
- módulo `/users` si backend lo habilita
- visibilidad básica de auditoría para ventas, productos o finanzas si existe
- endurecimiento final de la app

### Excluye

- rediseño completo del producto
- observabilidad avanzada fuera del alcance de frontend
- CI/CD completo si no se define en paralelo

## Interfaces publicas del sprint

- `GET /api/auth/me/`
- posibles endpoints `/api/users/`
- posibles endpoints `/api/audit/`
- rutas protegidas por rol en frontend

## Contrato esperado de UI e integracion

- la UI debe obedecer capacidades reales del backend, no banderas ficticias
- la capa de roles debe afectar navegación, acciones visibles y accesos
- si auditoría existe, debe mostrarse como información de trazabilidad, no como
  editor

## Plan de trabajo por pasos

### Paso 1. Implementar capa real de roles y capacidades

- derivar permisos visibles desde el usuario autenticado
- proteger navegación y acciones sensibles

**Entregable**

UI condicionada por rol de forma consistente.

### Paso 2. Integrar usuarios y auditoría si backend existe

- construir vistas administrativas mínimas
- exponer trazabilidad de cambios relevantes cuando aplique

**Entregable**

Capa administrativa alineada a la spec.

### Paso 3. Endurecer experiencia y calidad

- ampliar pruebas de frontend
- reforzar errores de red, validaciones y estados intermedios
- ajustar responsive y accesibilidad

**Entregable**

Base confiable para uso real y mantenimiento.

### Paso 4. Cerrar documentación y release

- actualizar documentación de frontend
- dejar checklist técnico y visual de salida

**Entregable**

Frontend listo para release controlado.

## Criterios de aceptacion

- la navegación responde a roles o capacidades reales
- la app maneja acceso denegado de forma clara
- existen pruebas para flujos críticos y el build sigue estable
- la documentación refleja el estado real del frontend al cierre

## Dependencias del sprint

- Sprint Frontend 8 implementado o estabilizado en lo aplicable
- backend con roles, `users` y auditoría si esas piezas se activan
- criterio técnico de release acordado por el equipo

## Riesgos y notas

- no prometer módulo de usuarios o auditoría sin backend real
- el endurecimiento no debe esconder gaps pendientes del backend
- cualquier limitación de permisos debe quedar documentada, no implícita

## Suposiciones y defaults elegidos

- este sprint combina cierre administrativo y hardening para no abrir una fase
  adicional solo de release
- la spec de usuarios y auditoría podrá implementarse parcialmente si backend
  aún está madurando
- la prioridad es terminar con una UI consistente y desplegable, no solo con
  pantallas nuevas
