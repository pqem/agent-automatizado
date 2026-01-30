---
name: context-recovery
description: Recuperación de contexto después de compactación de memoria del LLM
scope: root
metadata:
  auto_invoke:
    - "perdió memoria"
    - "compactación"
    - "summary unavailable"
    - "contexto perdido"
    - "qué estaba haciendo"
allowed_tools: [read, write, memory_search]
---

# Context Recovery - Recuperación Post-Compactación

## Problema

Cuando el LLM compacta su historia de conversación, pierde contexto crítico:
- ❌ Proyecto en el que estábamos trabajando
- ❌ Última tarea completada
- ❌ Próximo paso pendiente
- ❌ Decisiones importantes tomadas
- ❌ Estado del repositorio (commits pendientes, branches)

**Síntoma:** Mensaje del sistema que dice "Summary unavailable due to context limits"

## Solución: CONTEXT-RECOVERY.md

Archivo en la raíz del workspace que se actualiza automáticamente al final de cada sesión significativa.

### Ubicación
```
/home/bot/clawd/CONTEXT-RECOVERY.md
```

### Estructura

```markdown
# Context Recovery - Estado Actual del Workspace

**Última actualización:** 2026-01-30 04:11 UTC
**Última sesión:** 01:18-04:11 UTC (2h 53m)

## 🎯 Proyecto Activo

**Nombre:** agent-automatizado
**Ubicación:** /home/bot/clawd/agent-automatizado
**Descripción:** Framework CLI para generar y sincronizar contratos de agentes IA

## 📦 Estado del Repositorio

**Branch:** master
**Commits pendientes:** 11 commits ahead of origin/master
**Working tree:** clean (después de último commit)

**Último commit:**
```
a06d7e6 docs: documentación completa del proyecto (Tarea G)
```

## ✅ Última Tarea Completada

**Tarea G: Documentación completa**

Archivos modificados/creados:
- README.md (102 → 403 líneas) - Intro, features, CLI reference, troubleshooting
- CHANGELOG.md (nuevo, 5KB) - Historial v0.0.1 → v1.0.0
- CONTRIBUTING.md (nuevo, 9KB) - Guía completa de contribución

Total: 25+ KB de documentación profesional

## 🔜 Próximo Paso

**git push origin master**
- Publicar 11 commits pendientes a GitHub
- Proyecto listo para release v1.0.0

## 📝 Decisiones Recientes

**2026-01-30:**
- ✅ Estructura de documentación: README + CHANGELOG + CONTRIBUTING
- ✅ Formato CHANGELOG: Keep a Changelog standard
- ✅ Badges en README: License MIT + Node.js >=16

## 🐛 Issues Conocidos

Ninguno actualmente.

## 💡 Notas Importantes

- Dog-fooding completo: proyecto se usa a sí mismo
- 14 skills implementadas
- 6 templates disponibles
- Multi-IDE sync funcional (6 IDEs)
```

## Workflow de Recovery

### 1. Detección de Compactación

Al inicio de sesión, si detectás:
- "Summary unavailable"
- Usuario pregunta "qué estábamos haciendo?"
- Contexto claramente perdido

### 2. Lectura Automática

```javascript
// Paso 1: Leer CONTEXT-RECOVERY.md primero
const recovery = await read('CONTEXT-RECOVERY.md')

// Paso 2: Leer daily log de hoy
const today = new Date().toISOString().split('T')[0]
const dailyLog = await read(`memory/${today}.md`)

// Paso 3: Buscar en memoria si hay info adicional
const projectInfo = await memory_search('proyecto activo nombre')
```

### 3. Resumen al Usuario

```
Detecté compactación de contexto. Recuperando...

📦 Proyecto: agent-automatizado
✅ Última tarea: Documentación completa (Tarea G)
🔜 Próximo: git push (11 commits pendientes)

¿Continuamos con el push o hay algo más?
```

## Actualización de CONTEXT-RECOVERY.md

### Cuándo actualizar

Actualizar al final de:
- ✅ Tarea completada significativa
- ✅ Commits importantes
- ✅ Decisiones arquitectónicas
- ✅ Cambio de proyecto activo
- ✅ Antes de sesión larga (>30min)

**NO actualizar por:**
- ❌ Consultas triviales
- ❌ Conversaciones sin cambios en proyecto
- ❌ Cada mensaje (solo al cerrar sesión importante)

### Script de actualización

```bash
# Ubicación: scripts/update-context-recovery.cjs
node scripts/update-context-recovery.cjs
```

El script extrae automáticamente:
- Estado de git (branch, commits ahead, último commit)
- Archivos modificados desde último commit
- Próximo paso obvio (desde TODO, ROADMAP, o heurística)

### Llamada manual

```javascript
// Al completar tarea importante
await exec('node scripts/update-context-recovery.cjs')
```

## Integración con Moltbot

### En prompt del sistema

```markdown
## Context Recovery

Si detectás compactación (mensaje "Summary unavailable"), 
ejecutar INMEDIATAMENTE antes de responder:

1. read('CONTEXT-RECOVERY.md')
2. read('memory/' + today + '.md')
3. memory_search('proyecto activo')
4. Resumir estado al usuario
```

### Hook de inicio de sesión

Agregar a `.moltbot-hook.js` o equivalente:

```javascript
// Detectar compactación
if (systemMessages.some(m => m.includes('Summary unavailable'))) {
  // Auto-trigger context recovery
  return {
    action: 'auto-invoke',
    skill: 'context-recovery',
    reason: 'Compactación detectada'
  }
}
```

## Ejemplo Real: Nuestra Situación

### Lo que pasó hoy

```
04:12 UTC - Usuario: "Recuerdame como configurar desde la consola de aws"
04:13 UTC - Usuario: "Sigue con el g"
04:21 UTC - Usuario: "Perdiste la memoria? Era el último paso"
```

**Causa:** Compactación removió contexto de Tarea G (documentación)

### Lo que habría pasado con Recovery

```
04:12 UTC - Usuario: "Recuerdame como configurar desde la consola de aws"
[Respuesta sobre AWS CLI]

04:13 UTC - Usuario: "Sigue con el g"
[Auto-detección: leer CONTEXT-RECOVERY.md]

Agente: "Detecté que estábamos en Tarea G (Documentación) 
del proyecto agent-automatizado. Ya completamos:
- README mejorado
- CHANGELOG.md
- CONTRIBUTING.md

Si 'el g' se refiere a git push, tengo 11 commits 
pendientes. ¿Los publico?"
```

## Mantenimiento

### Limpieza

- Mantener solo último estado (no historial)
- Historial va en `memory/YYYY-MM-DD.md`
- CONTEXT-RECOVERY.md = snapshot actual

### Validación

Revisar periódicamente que:
- ✅ Fecha de actualización no sea muy antigua (>24h = stale)
- ✅ Proyecto activo coincida con realidad
- ✅ Próximo paso sea relevante

## Checklist de Implementación

Para agregar esta feature al proyecto:

- [x] Crear skill `context-recovery`
- [x] Crear script `scripts/update-context-recovery.cjs`
- [x] Crear template `templates/CONTEXT-RECOVERY.template.md`
- [x] Agregar sección en AGENTS.md (vía skill-sync)
- [x] Generar primer CONTEXT-RECOVERY.md
- [ ] Actualizar `.moltbot-integration.md` con hook de compactación
- [ ] Documentar en README (sección Recovery)
- [ ] Testear con compactación simulada

## Anti-patterns

### ❌ Actualizar en cada mensaje
```javascript
// Malo: overhead innecesario
onMessage(() => updateContextRecovery())
```

### ❌ Demasiada información
```markdown
# Malo: verboso
Hoy hablamos de AWS, luego de git, luego el usuario 
preguntó sobre X y respondí Y, después...

# Bueno: conciso
Proyecto: agent-automatizado
Última tarea: Documentación completa
Próximo: git push 11 commits
```

### ❌ Información sensible
```markdown
# ❌ Nunca
API_KEY=abc123
Password=secret

# ✅ Referencias
API keys en: ~/.env (ver README)
```

---

**Meta:** Este archivo es tu lifeline cuando perdés memoria. Mantenerlo actualizado = recovery en segundos.
