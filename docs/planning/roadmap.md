# Roadmap Inicial

## Fase 1: base tecnica y autenticacion

**Objetivo**

Consolidar la base del proyecto y el acceso al sistema.

**Estado**

Completada.

**Entregables logrados**

- estructura estable de backend y frontend
- autenticacion JWT integrada en frontend y backend
- rutas protegidas y sesion persistente
- layout base autenticado

## Fase 2: clientes e inventario

**Objetivo**

Implementar modulos operativos de catalogo y relacion comercial.

**Estado**

Completada.

**Entregables logrados**

- CRUD de clientes
- CRUD de inventario
- pantallas de listado, detalle y formulario
- filtros y estados base de operacion

## Fase 3: ventas

**Objetivo**

Habilitar flujo principal de venta con integracion de cliente e inventario.

**Estado**

Completada.

**Entregables logrados**

- historial de ventas con filtros
- registro de venta con validaciones
- reflejo de costo snapshot, ganancia y margen

## Fase 4: finanzas y reportes

**Objetivo**

Construir capa de consolidacion financiera y exportacion operativa.

**Estado**

Parcialmente completada.

**Entregables logrados**

- frontend de finanzas y reportes conectado a backend
- exportaciones CSV/XLSX en reportes
- CRUD manual de movimientos financieros en backend

**Pendiente principal**

- completar flujo de apartados/abonos y alertas operativas para cerrar spec comercial

## Fase 5: cierre funcional pendiente (apartados)

**Objetivo**

Agregar flujo de apartados y pagos parciales, con su seguimiento en UI.

**Desglose operativo frontend**

- Sprint Frontend 8: apartados, abonos y alertas operativas

## Fase 6: hardening y release

**Objetivo**

Asegurar estabilidad, pruebas y documentacion para salida controlada.

**Desglose operativo frontend**

- Sprint Frontend 9: calidad, hardening y release

## Nota de alcance

El modulo de usuarios y control por roles en frontend queda fuera del alcance actual.
Se mantiene en codigo como capacidad futura, pero oculto en la UI hasta nueva decision de producto.
