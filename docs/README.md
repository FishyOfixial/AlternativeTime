# Documentacion del Proyecto

Esta carpeta concentra la documentacion funcional y tecnica de Alternative Time.
El objetivo es que un desarrollador nuevo pueda entender rapidamente que problema
resuelve el sistema, como esta organizado el repositorio, que decisiones ya se
tomaron y cual es el orden recomendado para continuar la implementacion.

## Mapa de documentos

- [product-overview.md](product-overview.md): vision funcional del producto,
  modulos principales y flujo general del negocio.
- [architecture.md](architecture.md): arquitectura tecnica actual,
  responsabilidades por capa y decisiones de stack.
- [backend.md](backend.md): organizacion del backend Django REST API y
  convenciones sugeridas para crecer.
- [frontend.md](frontend.md): organizacion del frontend React + Vite + Tailwind
  y patron recomendado para la integracion con la API.
- [roadmap.md](roadmap.md): fases de implementacion propuestas para construir el
  producto de forma incremental.
- [backlog.md](backlog.md): tareas tecnicas iniciales listas para ejecutar.
- [decisions.md](decisions.md): registro de decisiones tecnicas aceptadas.

## Artefactos fuente existentes

- `SRS_AlternativeTime_v1.0.pdf`
- `SRS_AlternativeTime_v1.0.docx`
- `design/`

Los archivos del SRS y los mockups visuales en `design/` se consideran insumos
de referencia. La documentacion Markdown de esta carpeta los resume y los conecta
con la implementacion real del repositorio.

## Orden recomendado de lectura

1. [product-overview.md](product-overview.md)
2. [architecture.md](architecture.md)
3. [backend.md](backend.md)
4. [frontend.md](frontend.md)
5. [roadmap.md](roadmap.md)
6. [backlog.md](backlog.md)
7. [decisions.md](decisions.md)

## Uso esperado de `docs/`

- Fuente principal de verdad tecnica del proyecto.
- Lugar para registrar decisiones estables del sistema.
- Punto de entrada para onboarding del equipo.
- Espacio para mantener trazabilidad entre vision funcional y ejecucion tecnica.
