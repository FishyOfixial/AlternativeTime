# Manual de Usuario

## Objetivo

Este manual explica el uso operativo de Alternative Time para personal interno de la relojería.
Su propósito es ayudar a registrar, consultar y dar seguimiento a inventario, clientes, ventas, apartados, finanzas y reportes desde una sola plataforma.

## Alcance

Este documento cubre:

- acceso al sistema
- navegación principal
- uso del dashboard
- administración de clientes
- administración de inventario
- registro de ventas
- seguimiento de apartados y abonos
- uso del módulo de finanzas
- consulta y exportación de reportes
- recomendaciones operativas

## Requisitos de Uso

Para operar el sistema se recomienda:

- contar con usuario y contraseña válidos
- usar navegador actualizado
- mantener conexión estable para registrar cambios
- verificar permisos de acceso según el rol asignado

## Acceso al Sistema

### Inicio de sesión

1. Abrir la URL del sistema.
2. Ingresar usuario y contraseña.
3. Seleccionar `Iniciar sesión`.

Si las credenciales son correctas, el sistema redirige al dashboard principal.

### Cierre de sesión

1. Abrir el menú lateral.
2. Seleccionar `Cerrar sesión`.

## Navegación General

El menú lateral concentra los módulos principales:

- `Dashboard`
- `Clientes`
- `Inventario`
- `Ventas`
- `Apartados`
- `Finanzas`
- `Reportes`

Cada módulo conserva una estructura similar:

- encabezado con contexto de la vista
- filtros o acciones principales
- tabla o tarjetas de resultados
- formularios o modales para alta y edición

## Dashboard

El dashboard ofrece un resumen ejecutivo del negocio.

Permite consultar:

- ventas totales
- ganancia total
- capital en inventario
- días promedio de rotación
- desglose mensual
- marcas con mejor desempeño
- alertas operativas

### Acciones recomendadas

- revisar ventas y utilidad del periodo
- detectar inventario lento
- monitorear apartados vencidos
- validar si el comportamiento del negocio coincide con el periodo seleccionado

## Clientes

El módulo de clientes permite administrar la base comercial.

### Funciones principales

- buscar clientes por nombre, teléfono o identificadores visibles
- filtrar clientes activos o recurrentes
- crear nuevos clientes
- consultar historial comercial

### Alta de cliente

1. Entrar a `Clientes`.
2. Seleccionar `Nuevo cliente`.
3. Capturar datos disponibles.
4. Guardar.

### Buenas prácticas

- registrar nombre y contacto lo más completos posible
- evitar duplicados
- usar notas solo cuando aporten contexto comercial útil

## Inventario

El módulo de inventario concentra la operación del catálogo de relojes.

### Funciones principales

- alta de relojes
- edición de información comercial y operativa
- consulta por tabla o tarjetas
- filtros por marca, estado, rango y antigüedad
- importación por CSV

### Información relevante del reloj

Cada registro puede incluir:

- marca
- modelo
- identificador
- precio de venta
- fecha de compra
- costos asociados
- estado del reloj
- antigüedad en inventario

### Alta de reloj

1. Entrar a `Inventario`.
2. Seleccionar agregar nuevo reloj.
3. Capturar datos del producto.
4. Registrar costos de compra cuando aplique.
5. Guardar.

### Edición de reloj

1. Buscar el reloj en la tabla o cards.
2. Abrir el formulario de edición.
3. Ajustar datos.
4. Guardar cambios.

### Importación CSV

1. Entrar a `Inventario`.
2. Seleccionar `Importar CSV`.
3. Elegir archivo válido.
4. Revisar resultados del proceso.

## Ventas

El módulo de ventas registra ventas cerradas.

### Funciones principales

- registrar venta de un reloj
- asociar cliente o capturar nombre libre
- indicar método de pago
- calcular utilidad y margen

### Registro de venta

1. Entrar a `Ventas`.
2. Seleccionar `Nueva venta`.
3. Elegir reloj disponible.
4. Capturar cliente o nombre comercial.
5. Registrar método de pago, monto y notas.
6. Guardar.

### Resultado esperado

Al guardar una venta:

- el reloj cambia a vendido
- se genera el movimiento financiero relacionado
- el dashboard y reportes reflejan el cambio

## Apartados

El módulo de apartados permite separar relojes y registrar abonos.

### Funciones principales

- crear apartados
- consultar saldo pendiente
- registrar abonos
- identificar apartados activos, vencidos o completados

### Crear apartado

1. Entrar a `Apartados`.
2. Seleccionar el reloj disponible.
3. Capturar cliente o nombre libre.
4. Definir precio acordado y fechas.
5. Guardar.

### Registrar abono

1. Abrir el detalle del apartado.
2. Seleccionar acción para registrar pago.
3. Capturar fecha, monto, cuenta y notas.
4. Guardar.

### Comportamiento del sistema

Cuando se registra un abono:

- se actualiza el total pagado
- se recalcula el saldo pendiente
- se genera el movimiento financiero correspondiente
- si el apartado se liquida, puede completarse automáticamente

## Finanzas

El módulo de finanzas consolida movimientos del negocio.

### Qué muestra

- resumen financiero
- balances por cuenta
- historial de movimientos
- filtros por periodo, tipo y cuenta

### Tipos de movimientos

El historial puede mostrar:

- movimientos manuales
- ventas
- compras
- cobros de apartados
- otros eventos operativos reflejados en finanzas

### Crear movimiento manual

1. Entrar a `Finanzas`.
2. Seleccionar `Nuevo movimiento`.
3. Capturar fecha, tipo, concepto, monto, cuenta y notas.
4. Guardar.

### Editar movimiento

1. Ubicar el movimiento en la tabla o tarjeta.
2. Seleccionar `Editar`.
3. Ajustar la información permitida.
4. Guardar cambios.

### Reglas importantes

- los movimientos manuales pueden editarse
- ventas y cobros de apartados pueden editarse desde finanzas y sincronizan su origen
- las compras de relojes pueden editarse, pero no eliminarse

### Eliminar movimiento

1. Abrir el movimiento desde la tabla o el modal.
2. Seleccionar `Eliminar`.
3. Confirmar la acción.

### Efectos del borrado

Según el tipo de movimiento, el sistema también puede:

- revertir una venta
- eliminar un abono de apartado
- recalcular saldos y balances relacionados

Las compras de relojes no se eliminan desde finanzas.

## Reportes

El módulo de reportes permite consultar información agregada y exportable.

### Usos frecuentes

- validar ventas por periodo
- revisar inventario consolidado
- consultar resúmenes financieros
- exportar información para análisis externo

### Recomendaciones

- aplicar filtros antes de exportar
- validar el periodo correcto
- confirmar que el módulo consultado tenga datos actualizados

## Healthcheck

La página de `Healthcheck` sirve para confirmar que la aplicación y la API estén disponibles.

Se recomienda usarla cuando:

- el sistema parezca lento o sin respuesta
- el usuario dude si el problema es de red o de la aplicación
- se esté validando un despliegue reciente

## Operación con PWA

Si la instalación PWA está habilitada en el entorno:

- la app puede instalarse
- algunas vistas pueden abrir con soporte offline según la fase implementada
- los cambios críticos deben seguir registrándose con conexión

## Recomendaciones Operativas

- revisar siempre el estado del reloj antes de registrar venta o apartado
- validar montos antes de guardar movimientos financieros
- evitar capturar datos duplicados de clientes
- revisar balances después de editar o eliminar movimientos
- usar reportes y dashboard como apoyo de supervisión, no como sustituto de validación operativa

## Manejo de Incidencias

Si el sistema no responde como se espera:

1. revisar conexión a internet
2. cerrar sesión e ingresar nuevamente
3. consultar `Healthcheck`
4. reportar el incidente con evidencia clara:
   - módulo afectado
   - acción realizada
   - mensaje mostrado
   - fecha y hora aproximadas

## Glosario Básico

- `Reloj disponible`: pieza lista para venta o apartado
- `Reloj reservado`: pieza comprometida en apartado
- `Reloj vendido`: pieza cerrada comercialmente
- `Apartado`: separación temporal de una pieza con pagos parciales
- `Abono`: pago parcial aplicado a un apartado
- `Movimiento manual`: registro financiero capturado directamente por usuario
- `Movimiento automático`: registro generado por eventos del sistema

## Perfil Recomendado de Lectura

Para capacitación operativa inicial se recomienda este orden:

1. acceso al sistema
2. navegación general
3. clientes
4. inventario
5. ventas
6. apartados
7. finanzas
8. reportes
