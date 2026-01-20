---
name: docs
description: Crear y mantener documentación. Usa cuando escribas README, docs, o comentarios.
scope: root
tools: [read, write]
---

# Documentación

## README mínimo
```markdown
# Nombre del Proyecto

Descripción en una línea.

## Instalación
\`\`\`bash
comandos aquí
\`\`\`

## Uso
\`\`\`bash
ejemplo de uso
\`\`\`

## Desarrollo
Instrucciones para contribuir.
```

## Comentarios en código
- Solo cuando el "por qué" no es obvio
- Evitar comentarios que repiten el código
- Usar JSDoc/docstrings para funciones públicas

## Buenas prácticas
1. Mantener docs junto al código que documentan
2. Actualizar docs cuando cambia funcionalidad
3. Ejemplos > explicaciones largas
4. Asumir que el lector es inteligente pero no conoce el contexto
