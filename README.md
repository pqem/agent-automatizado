# agent-automatizado

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16-brightgreen)](https://nodejs.org)

**Framework CLI para generar y sincronizar contratos de agentes IA (AGENTS.md) y skills modulares en proyectos individuales y monorepos.**

## 🎯 ¿Qué problema resuelve?

Los agentes IA necesitan:
- ✅ **Contexto del proyecto** (stack, convenciones, herramientas)
- ✅ **Skills modulares** (cómo hacer commits, testing, arquitectura)
- ✅ **Auto-invocación inteligente** (detectar cuándo usar cada skill)
- ✅ **Sincronización con IDEs** (Claude, Cursor, Copilot, etc.)

**agent-automatizado** automatiza todo esto detectando tu proyecto y generando:
- `AGENTS.md` → Contrato operativo del agente
- `skills/` → Conocimiento modular on-demand
- Auto-invoke table → Triggers para detectar cuándo leer cada skill
- Sync scripts → Integración con 6+ IDEs

## ✨ Features

- 🔍 **Detección automática** de tipo de proyecto (Next.js, API, Python, AI Agent, etc.)
- 📦 **Templates específicos** según stack detectado (6 templates disponibles)
- 🎯 **2 skills completas + 13 templates** (resonant-coding, context-recovery + templates para commits, testing, security, etc.)
- 🔄 **Sincronización idempotente** (skill-sync no genera diffs innecesarios)
- 🎨 **CLI interactivo** para crear nuevas skills
- ✅ **Validación automática** de frontmatter y estructura
- 🔗 **Multi-IDE sync** (Claude, Cursor, Copilot, Gemini, Warp, Codex)
- 🌳 **Monorepo support** (apps/*, packages/*, services/*)
- 🐕 **Dog-fooding completo** (se usa a sí mismo para su desarrollo)

## 📚 Table of Contents

- [Instalación](#-instalación)
- [Quick Start](#-quick-start)
- [Comandos CLI](#-comandos-cli)
- [Sincronización Multi-IDE](#-sincronización-multi-ide)
- [Skills Disponibles](#-skills-disponibles)
- [Templates](#-templates)
- [Monorepo Support](#-monorepo-support)
- [Context Recovery](#-context-recovery)
- [Resonant Coding Tools](#-resonant-coding-tools)
- [Dog-fooding](#-dog-fooding)
- [Documentación](#-documentación)
- [Troubleshooting](#-troubleshooting)

## 🚀 Instalación

```bash
# Clonar repo
git clone https://github.com/tu-usuario/agent-automatizado.git
cd agent-automatizado

# Instalar dependencias
npm install
```

## ⚡ Quick Start

### Proyecto nuevo

```bash
# 1. Inicializar en tu proyecto
cd /path/to/tu-proyecto
node /path/to/agent-automatizado/src/cli.js init

# 2. Sincronizar a tus IDEs
/path/to/agent-automatizado/scripts/setup.sh --all

# 3. (Opcional) Agregar skill custom
node /path/to/agent-automatizado/src/cli.js add-skill
```

**Resultado:**
```
tu-proyecto/
├── AGENTS.md          # ✅ Generado con info del proyecto
├── skills/            # ✅ 4-14 skills según tipo detectado
│   ├── commits/
│   ├── testing/
│   └── ...
└── .claude/           # ✅ Synced (si usás --claude)
    └── AGENTS.md
```

### Proyecto existente

```bash
# Si ya tenés AGENTS.md con markers
node src/cli.js skill-sync

# Regenera bloques entre markers:
# <!-- SKILL-SYNC:START --> ... <!-- SKILL-SYNC:END -->
```

## 🛠️ Comandos CLI

### `init` - Inicializar proyecto

Detecta tipo de proyecto y genera `AGENTS.md` + skills iniciales.

```bash
node src/cli.js init [directorio]
```

**Detección automática:**
- Next.js → `nextjs.md` template + skills web
- API (Express/Fastify) → `api.md` template + skills backend
- Python → `python.md` template + skills Python
- AI Agent (SOUL.md + IDENTITY.md) → `ai-agent.md` template + skills de agentes
- Generic → `root.md` template + skills básicas

### `skill-sync` - Sincronizar bloques regenerables

Regenera bloques marcados con `<!-- SKILL-SYNC:START -->` y `<!-- SKILL-SYNC:END -->`.

```bash
node src/cli.js skill-sync [opciones]

Opciones:
  --check        Falla si hay drift (útil en CI) [pendiente V2]
  --dry-run      Muestra cambios sin escribir [pendiente V2]
  --verbose      Logging detallado [pendiente V2]
```

**Qué sincroniza:**
- Skills Reference table (nombre, descripción, tools, scope)
- Auto-invoke table (triggers → skill mapping)

**Características:**
- ✅ Idempotente (2 corridas seguidas = sin cambios)
- ✅ Soporta monorepos (detecta apps/*, packages/*, services/*)
- ✅ Orden estable (mismo input → mismo output)

### `add-skill` - Crear nueva skill

Crea una skill de forma interactiva o con flags.

```bash
# Modo interactivo (recomendado)
node src/cli.js add-skill

# Modo no-interactivo
node src/cli.js add-skill <nombre> [opciones]

Opciones:
  -d, --description <text>    Descripción de la skill (min 20 chars)
  -s, --scope <scope>         Scope: root|global|<custom> (default: root)
  -t, --triggers <list>       Triggers comma-separated (ej: "test,testing")
  -f, --tools <list>          Tools comma-separated (ej: "read,write,exec")
  --force                     Sobrescribir si existe
```

**Ejemplo:**
```bash
node src/cli.js add-skill security \
  -d "Security best practices and OWASP guidelines" \
  -t "security,vulnerabilities,OWASP" \
  -f "read,write,browser"
```

Ver documentación completa: [`docs/ADD-SKILL.md`](docs/ADD-SKILL.md)

### `validate-skills` - Validar skills

Valida frontmatter, estructura y detecta errores.

```bash
npm run validate:skills

# O directamente:
node scripts/validate-skills.js
```

**Validaciones:**
- ✅ Frontmatter YAML válido
- ✅ Campos obligatorios (name, description)
- ✅ Sin nombres duplicados
- ⚠️ Warnings en triggers duplicados
- ✅ Contenido mínimo presente

Exit codes: `0` = OK, `1` = errores encontrados (útil en CI/CD)

## 🔗 Sincronización Multi-IDE

Genera archivos de configuración para múltiples IDEs desde un único `PROJECT.md`.

```bash
# Generar configs para todos los IDEs
./scripts/sync-ide-rules.sh /path/to/tu-proyecto

# Si no existe PROJECT.md, crea un template automáticamente
```

**Archivos generados:**

| Archivo | IDE |
|---------|-----|
| `.cursorrules` | Cursor |
| `CLAUDE.md` | Claude Desktop/Code |
| `.github/copilot-instructions.md` | VS Code + GitHub Copilot |
| `OPENCODE.md` | OpenCode |

**Flujo de trabajo:**
```
PROJECT.md (fuente única)
     │
     └──→ sync-ide-rules.sh
              │
              ├──→ .cursorrules
              ├──→ CLAUDE.md
              ├──→ .github/copilot-instructions.md
              └──→ OPENCODE.md
```

**Ventaja:** Editas un solo archivo, todos los IDEs se actualizan.

## 📦 Skills Disponibles

### Skills Completas (2)

| Skill | Descripción | Triggers (ejemplos) |
|-------|-------------|---------------------|
| **context-recovery** | Recuperación post-compactación | perdió memoria, contexto perdido, summary unavailable |
| **resonant-coding** | Metodología completa Resonant Coding | resonant, regla de los 5, baldes limpios, revisar |

### Templates de Skills (13)

Templates listos para copiar y personalizar en tu proyecto:

| Template | Descripción |
|----------|-------------|
| **commits** | Formato convencional commits |
| **docs** | Documentación README/comments |
| **pr** | Pull requests consistentes |
| **testing** | Unit/E2E/TDD strategies |
| **security** | OWASP + auth + secrets |
| **performance** | Optimization + profiling |
| **deployment** | CI/CD + Docker + K8s |
| **nextjs** | Next.js App Router patterns |
| **react** | React hooks y componentes |
| **python** | Python best practices |
| **typescript** | TypeScript patterns |
| **tailwind** | Tailwind CSS utilities |
| **skill-creator** | Cómo crear nuevas skills |

**Total:** 20+ triggers automáticos en skills activas

## 📄 Templates

6 templates específicos según tipo de proyecto:

| Template | Cuándo se usa | Contenido principal |
|----------|---------------|---------------------|
| **root.md** | Default/genérico | Skills básicas, estructura general |
| **web.md** | Frontend React/Vue | Componentes, hooks, state management |
| **nextjs.md** | Next.js App Router | Server Components, Server Actions, SEO |
| **api.md** | APIs/Backend | REST, capas, auth, validación, DB |
| **python.md** | Proyectos Python | Virtual envs, pip, type hints, testing |
| **ai-agent.md** | Agentes IA | SOUL/IDENTITY, skills modulares, dog-fooding |

Ver documentación completa: [`docs/TEMPLATES.md`](docs/TEMPLATES.md)

## 🌳 Monorepo Support

Detecta automáticamente estructuras monorepo:

```
monorepo/
├── apps/
│   ├── web/package.json      # ✅ Detectado
│   └── mobile/package.json   # ✅ Detectado
├── packages/
│   └── ui/package.json       # ✅ Detectado
└── services/
    └── api/package.json      # ✅ Detectado
```

**Comportamiento:**
- Cada componente recibe skills `root/global` + skills con `scope` coincidente
- `skill-sync` regenera `AGENTS.md` en cada componente
- Orden estable garantizado

**Ejemplo:**
```bash
# Generar AGENTS.md en cada componente
node src/cli.js skill-sync

# Resultado:
# apps/web/AGENTS.md
# apps/mobile/AGENTS.md
# packages/ui/AGENTS.md
# services/api/AGENTS.md
```

## 🔄 Context Recovery

**Problema:** Cuando el LLM compacta su historial, pierde contexto sobre qué estabas trabajando.

**Solución:** `CONTEXT-RECOVERY.md` — snapshot actualizado automáticamente del estado del workspace.

### Qué contiene

- 🎯 Proyecto activo actual
- 📦 Estado del repositorio (branch, commits pendientes, último commit)
- ✅ Última tarea completada
- 🔜 Próximo paso sugerido
- 📝 Decisiones recientes
- 🐛 Issues conocidos

### Uso

**Generar/actualizar snapshot:**
```bash
node scripts/update-context-recovery.cjs
```

**Al detectar compactación:**
```
Usuario: "qué estábamos haciendo?"
Agente: [Lee CONTEXT-RECOVERY.md automáticamente]
        
📦 Proyecto: agent-automatizado
✅ Última tarea: Documentación completa
🔜 Próximo: git push (11 commits pendientes)
```

### Cuándo actualizar

- ✅ Al completar tarea importante
- ✅ Después de commits significativos
- ✅ Al final de sesión larga
- ❌ No en cada mensaje (overhead innecesario)

Ver skill completa: [`skills/context-recovery/SKILL.md`](skills/context-recovery/SKILL.md)

## 🎨 Resonant Coding Tools

Herramientas para trabajar efectivamente con LLMs siguiendo metodología Resonant Coding.

### 1. Skill de Resonant Coding

**Qué es:** Metodología completa para evitar el caos al trabajar con IA.

**Conceptos clave:**
- 📏 **Regla de los 5:** 5 filtros de revisión (Borrador → Corrección → Claridad → Casos Límite → Excelencia)
- 🪣 **Baldes limpios:** Conversaciones enfocadas, contexto relevante
- 👥 **Tres expertos:** Investigación → Planificación → Ejecución

```bash
# Auto-invocada con triggers:
# "resonant", "regla de los 5", "revisar", "refinar", "mejorar calidad"
```

Ver: [`skills/resonant-coding/SKILL.md`](skills/resonant-coding/SKILL.md)

---

### 2. Script "Regla de los 5"

**Qué es:** Review interactivo con 5 filtros de calidad.

```bash
npm run review:five archivo.js

# Output interactivo:
[1/5] 📝 Borrador - ¿Está todo?
[2/5] 🔍 Corrección - ¿Es correcto?
[3/5] 💡 Claridad - ¿Se entiende?
[4/5] ⚠️  Casos Límite - ¿Qué podría fallar?
[5/5] ✨ Excelencia - ¿Es lo mejor posible?

📊 Resultado: 4/5 filtros pasados
📈 Issues: 3 detectados
💡 Recomendaciones: ...
```

**Features:**
- Análisis automático (console.log, links rotos, líneas largas, etc.)
- Prompts interactivos por filtro
- Reporte detallado en Markdown
- Score final con sugerencias

---

### 3. Templates de "Tres Expertos"

**Qué es:** Templates para dividir proyectos en 3 conversaciones limpias.

```bash
templates/workflows/
├── 01-investigacion.md   # El Investigador
├── 02-planificacion.md   # La Estratega
└── 03-ejecucion.md       # El Ejecutor
```

**Workflow:**
```
Proyecto: Sistema de Notificaciones

Conversación 1 (Investigación):
- Evaluar opciones (Firebase vs OneSignal vs Pusher)
- Recomendación justificada
- Riesgos identificados

Conversación 2 (Planificación):
- 6 tareas pequeñas (< 4h cada una)
- Dependencias claras
- Estimaciones con buffer

Conversaciones 3-8 (Ejecución):
- Una conversación por tarea
- Contexto mínimo
- Implementar → Validar → Commit
```

Ver: [`templates/workflows/README.md`](templates/workflows/README.md)

---

### 4. Generador de Contexto Limpio

**Qué es:** Genera snapshot mínimo para nueva conversación (balde limpio).

```bash
npm run clean:context "implementar cache con Redis"

# Output: conversation-123456.md
# Contenido:
# - Contexto relevante SOLO para cache
# - Archivos detectados automáticamente
# - Estado git actual
# - Instrucciones claras para IA
```

**Cuándo usar:**
- Antes de cada tarea nueva
- Al detectar conversación larga (> 20 mensajes)
- Cuando el IA "se pierde"

**Beneficio:** Reduce tokens ~30-50% vs conversación larga

---

### 5. Métricas de Tokens

**Qué es:** Tracking de uso y optimización de costos.

```bash
npm run tokens:report

# Output:
📊 Token Usage Report
💰 Costo total: $2.15
🎯 Presupuesto: $50.00
📈 Uso: 4.3%

🔝 Top operaciones:
1. Investigación arquitectura ($0.89, 15K tokens)
2. Code review ($0.67, 11K tokens)

💡 Recomendaciones:
- Usar conversaciones limpias (ahorro: ~$0.50)
- Crear skill para code review (ahorro: ~30%)
```

**Features:**
- Tracking manual o automático
- 8 modelos soportados con precios
- Detección de patrones ineficientes:
  * Conversaciones muy largas
  * Operaciones repetitivas
  * Uso de modelos caros
- Proyección fin de mes
- Warnings automáticos

Ver: [`docs/TOKEN-METRICS.md`](docs/TOKEN-METRICS.md)

---

### Filosofía

Estas herramientas implementan **Resonant Coding:**

| Problema | Solución | Herramienta |
|----------|----------|-------------|
| Código de baja calidad | 5 filtros de revisión | `review:five` |
| Conversaciones largas y sucias | Baldes limpios | `clean:context` |
| Proyectos complejos caóticos | Tres expertos | Templates workflow |
| Gasto descontrolado de tokens | Tracking y optimización | `tokens:report` |
| Falta de metodología | Guía completa | Skill resonant-coding |

**Resultado:** Trabajo con IA que es realmente más rápido Y de mejor calidad.

## 🐕 Dog-fooding

**Este proyecto se usa a sí mismo para su desarrollo.**

```bash
# En agent-automatizado/
node src/cli.js init         # Genera AGENTS.md con skills de commits, PR, docs, etc.
node src/cli.js skill-sync   # Sincroniza bloques regenerables

# Resultado: El agente que desarrolla el proyecto:
# ✅ Lee skill de commits antes de commitear
# ✅ Sigue formato convencional automáticamente
# ✅ Lee skill de PR antes de crear pull requests
# ✅ Actualiza documentación según skill de docs
```

### Ejemplo real: Commit mejorado

**Antes de dog-fooding:**
```bash
git commit -m "fix table"
```

**Después (con skill de commits):**
```bash
# Agente lee skills/commits/SKILL.md automáticamente
git commit -m "feat(skill-sync): generar tabla auto-invoke en formato Prowler

- Implementar buildAutoInvokeTable() con formato tipo Prowler
- Ordenar triggers alfabéticamente
- Alinear columnas correctamente
- Mantener idempotencia"
```

**Meta-beneficio:** Cada mejora al sistema → sistema mejora su propio proceso → más mejoras.

## 📚 Documentación

- [`docs/ADD-SKILL.md`](docs/ADD-SKILL.md) - Comando add-skill completo
- [`docs/TEMPLATES.md`](docs/TEMPLATES.md) - Sistema de templates
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - Arquitectura interna
- [`docs/ROADMAP.md`](docs/ROADMAP.md) - V2 goals
- [`docs/RELEASE.md`](docs/RELEASE.md) - Release guide
- [`scripts/README.md`](scripts/README.md) - Setup multi-IDE

## 🔧 Troubleshooting

### skill-sync genera cambios inesperados

**Causa:** Contenido fuera de markers o formato inconsistente.

**Solución:**
```bash
# Verificar que todo esté dentro de markers
grep -n "SKILL-SYNC:" AGENTS.md

# Re-run debería ser no-op
node src/cli.js skill-sync
git diff  # No debería mostrar cambios
```

### Markers no encontrados

**Causa:** AGENTS.md sin markers `<!-- SKILL-SYNC:START -->`.

**Solución:**
```markdown
# En AGENTS.md, agregar markers manualmente:

## Skills Reference
<!-- SKILL-SYNC:START -->
<!-- SKILL-SYNC:END -->

## Auto-invoke Skills
<!-- SKILL-SYNC:AUTO-INVOKE:START -->
<!-- SKILL-SYNC:AUTO-INVOKE:END -->
```

### Scopes incorrectos en monorepo

**Causa:** `scope` en frontmatter no coincide con nombre de carpeta.

**Solución:**
```yaml
# En skills/my-skill/SKILL.md
---
name: my-skill
description: ...
scope: web      # ✅ Debe coincidir con apps/web/ o packages/web/
---
```

### Skills no detectadas en IDE

**Causa:** Setup no ejecutado o symlinks rotos.

**Solución:**
```bash
# Re-run setup
./scripts/setup.sh --all

# Verificar symlinks
ls -la ~/.claude/skills/
```

## 📝 Changelog

Ver [`CHANGELOG.md`](CHANGELOG.md).

## 📜 Licencia

MIT © 2026

---

**¿Preguntas?** Abre un issue o contacta al maintainer.
