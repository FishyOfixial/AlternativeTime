# Sprint Frontend 9

## Resumen

Este sprint cierra la etapa de producto con hardening de calidad, consistencia
visual, accesibilidad y checklist de salida. Tambien formaliza que el modulo de
usuarios y roles queda oculto hasta una decision futura.

## Objetivo del sprint

- fortalecer experiencia, estabilidad y mantenibilidad del frontend
- cerrar deuda tecnica visible en formularios y estados de error
- dejar documentacion de release y operacion actualizada

## Resultado esperado

Al cerrar este sprint, el frontend debe:

- mantener build estable en cambios frecuentes
- tener pruebas de regresion para flujos criticos
- mejorar UX de errores, cargas y vacios en todas las pantallas
- operar sin mostrar modulo de usuarios ni control por roles en UI

## Alcance

### Incluye

- bateria minima de pruebas unitarias/integracion en frontend
- auditoria de estados `loading/error/empty/success`
- mejoras de responsive y accesibilidad (teclado, labels, contraste)
- limpieza de deuda tecnica y modularizacion pendiente
- documentacion final de alcance real del producto

### Excluye

- habilitar `/users` o UI de roles
- nuevas funcionalidades de negocio fuera de pagos/apartados
- rediseno total del sistema visual

## Interfaces publicas del sprint

- sin endpoints nuevos obligatorios
- consolidacion de contratos existentes (`auth`, `clients`, `inventory`, `sales`, `finance`, `reports`, `layaways`)

## Contrato esperado de UI e integracion

- toda pantalla debe manejar errores de API con mensaje claro
- acciones largas deben mostrar estado de progreso y deshabilitar botones
- la navegacion no debe exponer opciones fuera de alcance del sistema actual
- exportaciones y movimientos deben responder a defaults claros de filtros

## Plan de trabajo por pasos

### Paso 1. Cobertura de pruebas

- pruebas para clientes, inventario, ventas, finanzas y reportes
- pruebas de servicios para manejo de errores de backend

**Entregable**

Suite base de pruebas para regresion rapida.

### Paso 2. Consistencia UX

- homologar banners de exito/error
- estandarizar mensajes y labels en espanol
- revisar formularios extensos y separar secciones faltantes

**Entregable**

Experiencia coherente entre modulos.

### Paso 3. Hardening tecnico

- continuar modularizacion de paginas largas
- reducir duplicacion de utilidades y constantes
- limpiar texto corrupto o inconsistencias de encoding

**Entregable**

Codigo frontend mas mantenible y estable.

### Paso 4. Cierre documental y release

- actualizar roadmap, backlog, frontend.md y README
- checklist de release manual (build, smoke, auth, endpoints criticos)

**Entregable**

Paquete listo para release controlado.

## Criterios de aceptacion

- `npm run build --prefix frontend` estable
- pruebas minimas corren sin regresiones criticas
- no aparece modulo de usuarios en la UI
- documentacion refleja alcance real del sistema

## Dependencias del sprint

- Sprint Frontend 8 completado o en estado estable
- contratos backend estables para modulos activos

## Riesgos y notas

- agregar features nuevas en este sprint rompe foco de hardening
- sin pruebas base, cualquier ajuste visual puede causar regresiones ocultas
- activar usuarios/roles sin backend y decision de producto reabre alcance

## Suposiciones y defaults elegidos

- la app se opera como sistema de un solo perfil administrativo
- usuarios/roles quedan como capacidad futura apagada por feature flag
- prioridad final: estabilidad operativa sobre expansion funcional
