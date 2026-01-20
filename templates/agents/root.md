# {{PROJECT_NAME}}

{{DESCRIPTION}}

## Estructura del Proyecto
{{STRUCTURE}}

## Stack Tecnológico
{{STACK}}

## Convenciones

### Commits
Formato: `tipo(scope): descripción`
- `feat`: nueva funcionalidad
- `fix`: corrección de bug
- `docs`: documentación
- `refactor`: refactorización

### Archivos
- Nombres en kebab-case para archivos
- PascalCase para componentes

## Skills Disponibles

{{SKILLS_LIST}}

### Auto-invocación de Skills
Cuando trabajes en este proyecto:
- **Commits**: Usa la skill `commits` para formatear mensajes
- **Pull Requests**: Usa la skill `pr` para crear PRs consistentes
- **Documentación**: Usa la skill `docs` para mantener docs actualizados

## Contexto para el Agente

Nivel del usuario: {{LEVEL}}

{{#if LEVEL_BEGINNER}}
El usuario es principiante. Explica cada paso, sugiere buenas prácticas, y pregunta antes de hacer cambios grandes.
{{/if}}

{{#if LEVEL_INTERMEDIATE}}
El usuario conoce lo básico. Puedes ser más directo pero explica decisiones arquitectónicas.
{{/if}}

{{#if LEVEL_ADVANCED}}
El usuario es experimentado. Sé conciso, ve al grano, solo código y comandos.
{{/if}}
