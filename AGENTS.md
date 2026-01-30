# agent-automatizado

Contrato de agente para agent-automatizado.

<!-- SKILL-SYNC:START -->
## Skills Reference
- [context-recovery](skills/context-recovery/SKILL.md) - Recuperación de contexto después de compactación de memoria del LLM (tools: read, write, memory_search) (scope: root)
- [resonant-coding](skills/resonant-coding/SKILL.md) - Metodología completa de Resonant Coding - Regla de los 5, baldes limpios, tres expertos (tools: read, write, memory_search, exec) (scope: root)

## Auto-invoke Skills
| Acción | Skill |
|--------|-------|
| baldes limpios | `resonant-coding` |
| compactación | `context-recovery` |
| contexto perdido | `context-recovery` |
| mejorar calidad | `resonant-coding` |
| perdió memoria | `context-recovery` |
| qué estaba haciendo | `context-recovery` |
| refinar | `resonant-coding` |
| regla de los 5 | `resonant-coding` |
| resonant | `resonant-coding` |
| review completo | `resonant-coding` |
| revisar | `resonant-coding` |
| rule of five | `resonant-coding` |
| summary unavailable | `context-recovery` |
<!-- SKILL-SYNC:END -->
