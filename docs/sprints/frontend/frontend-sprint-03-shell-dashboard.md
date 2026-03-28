# Sprint Frontend 3

## Resumen

Este sprint convierte la navegacion autenticada en una experiencia operativa
real. El foco esta en la shell principal de la aplicacion y en un dashboard
inicial que sirva como punto de entrada despues del login.

## Objetivo del sprint

- construir la shell autenticada principal
- implementar dashboard inicial
- definir patron de pagina protegida reutilizable

## Resultado esperado

Al cerrar este sprint, el frontend debe:

- mostrar sidebar y topbar funcionales
- navegar entre modulos desde la shell autenticada
- aterrizar al usuario en un dashboard inicial despues del login
- representar estados de carga, error y vacio en pantallas protegidas

## Alcance

### Incluye

- sidebar
- topbar
- cabeceras de pagina
- dashboard inicial
- accesos rapidos a modulos
- componentes de tarjeta o KPI reutilizables

### Excluye

- clientes funcionales
- inventario funcional
- ventas funcionales
- reportes completos
- permisos por rol finales

## Interfaces publicas del sprint

- ruta `/dashboard`
- navegacion visible hacia `/clients`, `/inventory`, `/sales`, `/finance`,
  `/reports` y `/users`
- consumo inicial de `GET /api/finance/summary/` y reportes agregados si se
  usan para poblar el dashboard

## Contrato esperado de UI e integracion

- el dashboard debe poder consumir informacion agregada ya disponible sin
  asumir endpoints nuevos
- la shell autenticada debe envolver las pantallas privadas del producto

## Plan de trabajo por pasos

### Paso 1. Construir la shell autenticada

- implementar sidebar con modulos del sistema
- implementar topbar con datos del usuario o acciones globales
- definir zona de contenido principal

**Entregable**

Base visual estable para la navegacion interna.

### Paso 2. Crear componentes reutilizables del dashboard

- tarjetas de indicadores
- encabezados de pagina
- contenedores de paneles o widgets

**Entregable**

Biblioteca minima para componer dashboard y vistas futuras.

### Paso 3. Implementar dashboard inicial

- mostrar resumen general del sistema
- agregar accesos rapidos a los modulos principales
- usar datos reales del backend si ya encajan con el dashboard

**Entregable**

Pantalla inicial posterior al login con valor operativo.

### Paso 4. Estandarizar paginas protegidas

- aplicar layout comun a dashboard y futuras pantallas
- reutilizar componentes de carga, error y vacio

**Entregable**

Patron de pagina protegida listo para clientes e inventario.

## Criterios de aceptacion

- despues del login, el usuario entra a `/dashboard`
- la shell autenticada permite navegar entre modulos
- el dashboard muestra una vista inicial coherente con el producto
- los estados de datos se representan de forma consistente

## Dependencias del sprint

- Sprint Frontend 2 implementado
- integracion de sesion ya funcionando
- endpoints agregados del backend disponibles cuando se usen

## Riesgos y notas

- no convertir el dashboard en un reporte avanzado prematuro
- mantener la shell lo bastante flexible para futuros permisos por rol
- cualquier widget debe depender de datos ya existentes, no de contratos
  inventados

## Suposiciones y defaults elegidos

- el dashboard es la pantalla inicial tras autenticar
- la shell autenticada se reutilizara en el resto de modulos
- el valor principal del sprint es navegacion y estructura, no analitica fina
