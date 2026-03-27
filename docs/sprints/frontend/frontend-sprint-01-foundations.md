# Sprint Frontend 1

## Resumen

Este sprint transforma el frontend actual, que hoy solo valida el endpoint de
salud, en una base de aplicacion lista para crecer. El foco esta en
arquitectura, enrutamiento, layouts, servicios compartidos y setup inicial de
pruebas, sin entrar todavia en modulos funcionales completos.

## Objetivo del sprint

- consolidar la base tecnica del frontend
- definir la estructura oficial de la aplicacion React
- preparar el terreno para login, dashboard y modulos de negocio

## Resultado esperado

Al cerrar este sprint, el frontend debe:

- tener router y layouts base funcionando
- usar una estructura de carpetas pensada para crecer por modulo
- contar con una capa `services` para llamadas HTTP
- incorporar componentes base para estados de carga, error y vacio
- tener setup inicial de pruebas para la UI

## Alcance

### Incluye

- instalacion y configuracion del router
- reorganizacion de `src/`
- layout publico y layout autenticado base
- capa `services`
- componentes base reutilizables
- setup inicial de pruebas frontend
- actualizacion de documentacion si cambia la convencion del frontend

### Excluye

- login funcional
- dashboard real
- clientes
- inventario
- ventas
- finanzas
- reportes
- permisos por rol

## Interfaces publicas del sprint

- rutas placeholder para `/login`, `/dashboard`, `/clients`, `/inventory`,
  `/sales`, `/finance`, `/reports` y `/users`
- layout publico para pantallas no autenticadas
- layout autenticado para modulos internos

## Contrato esperado de UI e integracion

- `App.jsx` deja de ser una pantalla unica y pasa a ser punto de entrada de
  rutas
- la capa `services` centraliza `fetch` hacia `/api/*`
- el flujo de `GET /api/health/` se mantiene como ejemplo minimo de integracion

## Plan de trabajo por pasos

### Paso 1. Reorganizar la estructura del frontend

- pasar de una estructura minima a una estructura por responsabilidades
- introducir carpetas para `pages`, `components`, `layouts`, `services`,
  `features` y `styles`

**Entregable**

Base de carpetas lista para crecer sin sobrecargar `App.jsx`.

### Paso 2. Incorporar el router

- instalar y configurar el router oficial
- definir rutas placeholder para modulos presentes en el roadmap
- dejar resuelta la navegacion minima entre pantallas

**Entregable**

Aplicacion con navegacion real y rutas separadas.

### Paso 3. Crear layouts base

- layout publico para login y futuras pantallas abiertas
- layout autenticado con espacio para sidebar, topbar y contenido principal

**Entregable**

Shell visual base para las siguientes etapas.

### Paso 4. Centralizar servicios HTTP

- crear un cliente base para llamadas HTTP
- evitar llamadas `fetch` dispersas por componentes de presentacion

**Entregable**

Capa `services` reutilizable para integraciones futuras.

### Paso 5. Crear componentes de estado compartidos

- componente de carga
- componente de error
- componente de vacio

**Entregable**

Base consistente para representar estados de datos en toda la app.

### Paso 6. Preparar pruebas iniciales

- definir herramienta de pruebas para componentes y pantallas
- dejar listo el setup para pruebas unitarias y de integracion de UI

**Entregable**

Frontend preparado para introducir pruebas desde los siguientes sprints.

## Criterios de aceptacion

- la app navega entre rutas reales sin romper el build
- existe un layout publico y uno autenticado base
- las llamadas HTTP pasan por una capa `services`
- la estructura del frontend deja de depender de un solo archivo principal
- existe setup inicial de pruebas documentado o implementado

## Dependencias del sprint

- frontend actual con React, Vite y Tailwind CSS
- proxy local de Vite hacia `/api`
- documentacion tecnica vigente del repositorio

## Riesgos y notas

- no convertir este sprint en implementacion parcial de modulos de negocio
- evitar introducir una gestion global de estado compleja sin necesidad real
- priorizar una base clara y mantenible por encima de detalles visuales finos

## Suposiciones y defaults elegidos

- el router oficial sera `react-router-dom`
- la capa HTTP se mantendra simple sobre `fetch`
- este sprint construye fundaciones, no funcionalidades completas de producto
