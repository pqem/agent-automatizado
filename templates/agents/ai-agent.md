# {{PROJECT_NAME}}

{{DESCRIPTION}}

## Estructura del Proyecto
{{STRUCTURE}}

## Stack Tecnológico
{{STACK}}

## Arquitectura de Agente IA

### Archivos de configuración

**SOUL.md** - Personalidad del agente
- Tono y estilo de comunicación
- Valores y principios
- Boundaries y límites

**IDENTITY.md** - Identidad del agente
- Nombre y emoji
- Especialidades
- Avatar

**USER.md** - Información del usuario
- Nombre y preferencias
- Timezone
- Contexto del humano

**MEMORY.md** - Memoria a largo plazo
- Decisiones arquitectónicas
- Preferencias del usuario
- Proyectos activos

### Sistema de Skills

**Estructura:**
```
skills/
├── commits/
│   └── SKILL.md
├── debugging/
│   └── SKILL.md
└── architecture/
    ├── SKILL.md
    └── references/
        └── patterns.md
```

**Frontmatter de skill:**
```yaml
---
name: skill-name
description: Descripción corta
scope: root
metadata:
  auto_invoke:
    - "trigger 1"
    - "trigger 2"
allowed_tools: [read, write, exec]
---
```

### AGENTS.md

Contrato operativo del agente:
- Skills disponibles
- Triggers auto-invoke
- Convenciones del proyecto
- Nivel del usuario

**Auto-sincronización:**
```bash
node agent-automatizado/src/cli.js skill-sync
```

### Workflow de memoria

**Daily logs:** `memory/YYYY-MM-DD.md`
- Sesiones del día
- Decisiones tomadas
- Bugs resueltos

**Long-term:** `MEMORY.md`
- Info persistente
- Preferencias
- Contactos importantes

**Cuándo guardar:**
- ✅ Decisiones arquitectónicas
- ✅ Bugs complejos resueltos
- ✅ Preferencias del usuario
- ❌ Conversaciones triviales

## Herramientas disponibles

### Core tools
- `read` - Leer archivos
- `write` - Escribir archivos
- `exec` - Ejecutar comandos
- `browser` - Control de navegador
- `memory_search` - Buscar en memoria

### Agent tools
- `sessions_spawn` - Crear subagentes
- `sessions_send` - Mensajes a otras sesiones
- `message` - Enviar mensajes externos (WhatsApp, etc.)

## Testing de skills

**Validación:**
```bash
npm run validate:skills
```

Verifica:
- Frontmatter YAML válido
- Campos obligatorios
- Triggers únicos

**Auto-invoke:**
Las skills se invocan automáticamente basándose en los triggers definidos en su frontmatter.

## Convenciones

### Commits
- `feat(skills)`: nueva skill
- `fix(memory)`: corrección memoria
- `docs(soul)`: actualización personalidad

### Skills
- Nombres en `kebab-case`
- Descripción > 20 caracteres
- Triggers descriptivos

## Skills Disponibles

{{SKILLS_LIST}}

## Contexto para el Agente

Nivel del usuario: {{LEVEL}}

Este es un proyecto de agente IA. El objetivo es automatizar flujos de trabajo, mantener memoria persistente, y asistir al usuario con skills especializadas.

**Filosofía:**
- Skills como conocimiento modular
- Memoria para persistencia entre sesiones
- Auto-invocación para trabajar inteligentemente
- Dog-fooding: el agente se mejora a sí mismo
