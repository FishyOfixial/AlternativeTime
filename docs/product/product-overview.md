# Product Overview

## Vision breve

Alternative Time es un sistema tipo punto de venta y gestion operativa con foco
en centralizar informacion clave del negocio en una sola plataforma web. La
vision actual combina operacion diaria, administracion y analitica basica en un
flujo de trabajo accesible desde navegador.

## Tipo de sistema y contexto de uso

El producto se comporta como una aplicacion interna de negocio con modulos
conectados entre si. A partir del SRS y de los mockups disponibles, el contexto
de uso esperado es:

- usuarios del negocio operando ventas e inventario
- personal administrativo consultando clientes, finanzas y reportes
- responsables del sistema gestionando usuarios y acceso

La interfaz sugiere una experiencia centrada en paneles administrativos,
formularios y vistas de consulta.

## Modulos funcionales identificados

Los siguientes modulos se infieren directamente del SRS y de los mockups en
`docs/assets/ui-mockups/`:

- Login
- Dashboard
- Usuarios
- Clientes
- Inventario
- Ventas
- Finanzas
- Reportes

## Rol de cada modulo

### Login

Punto de entrada al sistema. Controla acceso a la aplicacion y eventualmente
debera integrarse con autenticacion y autorizacion por roles.

### Dashboard

Vista de resumen para observar indicadores, accesos rapidos y situacion general
del negocio.

### Usuarios

Modulo administrativo para gestionar cuentas internas del sistema, su estado y
futuras capacidades de permisos.

### Clientes

Gestiona listado de clientes y su detalle. Sirve como base para relacionar
ventas, historial y posiblemente informacion de contacto o seguimiento.

### Inventario

Administra productos o existencias disponibles. Incluye vistas tipo listado,
tarjetas y formularios, lo que indica operaciones de alta, edicion y consulta.

### Ventas

Representa la operacion comercial principal. Los mockups muestran tanto una
vista general como formularios de captura, por lo que el flujo incluye registro
de transacciones.

### Finanzas

Concentra informacion economica relevante del sistema. Probablemente depende de
las ventas registradas y puede coexistir con indicadores de ingresos, egresos o
resumenes financieros.

### Reportes

Presenta informacion consolidada para consulta analitica. Depende de los
modulos operativos y se alimenta de ventas, inventario, clientes y finanzas.

## Relaciones entre modulos

- Login habilita el acceso a todos los modulos internos.
- Dashboard resume informacion producida por el resto del sistema.
- Usuarios controla quien puede acceder y operar.
- Clientes se relaciona con ventas y reportes.
- Inventario impacta ventas y reportes.
- Ventas alimenta finanzas y reportes.
- Finanzas resume o transforma informacion de ventas.
- Reportes consolida informacion transversal de multiples modulos.

## Flujo funcional de alto nivel

1. Un usuario inicia sesion.
2. Ingresa al dashboard y revisa el estado general del negocio.
3. Consulta o actualiza clientes e inventario segun la operacion diaria.
4. Registra ventas.
5. El sistema refleja el impacto en finanzas y reportes.
6. Los responsables revisan informacion consolidada para seguimiento y decision.

## Pendientes funcionales abiertos

Aunque ya existe una vision general del producto, todavia no estan definidas en
el repositorio las reglas concretas para:

- permisos por rol sobre la autenticacion JWT ya implementada
- modelo de dominio detallado
- reglas de negocio especificas por modulo
- reportes finales y sus indicadores exactos

Estos puntos deben tratarse como pendientes de especificacion, no como hechos ya
resueltos.

