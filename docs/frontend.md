# Frontend

## Estado actual

El frontend esta construido con React, Vite y Tailwind CSS. Actualmente cumple
una funcion de base tecnica: comprobar que la aplicacion puede iniciar, renderar
una interfaz inicial y consumir el endpoint de salud del backend.

## Estructura base actual

```text
frontend/
|- index.html
|- package.json
|- vite.config.js
|- postcss.config.js
|- tailwind.config.js
`- src/
   |- main.jsx
   |- App.jsx
   `- index.css
```

## Rol de cada pieza principal

### Vite

- levanta el entorno de desarrollo
- resuelve el build de frontend
- expone un proxy local hacia Django

### React

- controla la capa de interfaz
- organiza la aplicacion en componentes
- maneja el consumo de datos y el estado del cliente

### Tailwind CSS

- provee utilidades de estilos rapidas
- permite iterar interfaces administrativas con bajo costo inicial
- facilita coherencia visual si se establecen convenciones de diseno

## Proxy local a Django

El archivo `vite.config.js` redirige las solicitudes `/api` hacia:

- `http://127.0.0.1:8000`

Esto permite que el frontend use rutas relativas como `/api/health/` durante el
desarrollo, sin hardcodear URLs distintas por componente.

## Integracion actual con backend

La integracion vigente usa:

- `fetch("/api/health/")`

Este flujo actua como referencia minima para futuras llamadas a la API.

## Patron recomendado para crecer el frontend

Cuando la aplicacion crezca, se recomienda pasar de una estructura minima a una
organizacion por responsabilidades, por ejemplo:

- `src/pages/`: paginas o vistas principales
- `src/components/`: componentes reutilizables
- `src/layouts/`: shells o layouts compartidos
- `src/services/`: cliente HTTP y acceso a API
- `src/features/`: agrupaciones por modulo de negocio
- `src/styles/`: tokens, capas globales o estilos compartidos

## Convenciones recomendadas

- centralizar llamadas HTTP en una capa `services`
- evitar mezclar logica de dominio con presentacion
- mantener componentes pequenos y reutilizables
- usar rutas relativas hacia `/api/*` mientras el proxy local sea suficiente
- reservar `App.jsx` como punto de entrada temporal, no como contenedor final de
  toda la aplicacion

## Estado del enrutamiento

Todavia no existe router de navegacion real ni paginas separadas por modulo.
Eso significa que login, dashboard, clientes, inventario, ventas, finanzas,
reportes y usuarios siguen siendo parte del roadmap, no del estado actual del
codigo.

## Uso del endpoint de salud como ejemplo

La consulta a `/api/health/` demuestra el flujo base esperado:

1. el frontend dispara una solicitud HTTP
2. Vite la redirige al backend local
3. Django responde JSON
4. React actualiza el estado y representa el resultado

Este patron debe reutilizarse cuando se creen las futuras capas de datos del
producto.

## Pendientes frontend mas importantes

- definir estructura por pantallas reales
- agregar router
- decidir estrategia de estado compartido si llega a ser necesaria
- crear componentes base para dashboard, formularios, tablas y modales
- alinear la implementacion con los mockups de `docs/design/`
