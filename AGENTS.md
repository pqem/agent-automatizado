# agent-automatizado

Contrato de agente para agent-automatizado.

<!-- SKILL-SYNC:START -->
## Skills Reference
- [context-recovery](skills/context-recovery/SKILL.md) - Recuperación de contexto después de compactación de memoria del LLM (tools: read, write, memory_search) (scope: root)

## Auto-invoke Skills
| Acción | Skill |
|--------|-------|
| compactación | `context-recovery` |
| contexto perdido | `context-recovery` |
| perdió memoria | `context-recovery` |
| qué estaba haciendo | `context-recovery` |
| summary unavailable | `context-recovery` |
<!-- SKILL-SYNC:END -->
