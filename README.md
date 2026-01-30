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
- 🎯 **14 skills pre-built** (commits, testing, security, performance, deployment, etc.)
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
- AI Agent (SOUL.md) → `ai-agent.md` template + skills de agentes
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

Sincroniza automáticamente tus skills a **6 IDEs diferentes**.

```bash
# Sincronizar a todos
./scripts/setup.sh --all

# Solo algunos
./scripts/setup.sh --claude --cursor --copilot

# Interactivo (menú)
./scripts/setup.sh
```

**IDEs soportados:**
- 🤖 Claude (Desktop/Code) → `~/.claude/skills/`
- ✨ GitHub Copilot → `~/.github-copilot/skills/`
- 🔷 Cursor → `~/.cursor/skills/`
- 🟣 Gemini CLI → `~/.gemini/skills/`
- 📘 Codex (OpenAI) → `~/.codex/skills/`
- 🌊 Warp Terminal → `~/.warp/skills/`

**Cómo funciona:**
1. **Symlinks** a `skills/` (single source of truth)
2. **Copia** `AGENTS.md` a archivo específico del IDE
3. Cada IDE lee skills desde su ubicación esperada

Ver documentación completa: [`scripts/README.md`](scripts/README.md)

## 📦 Skills Disponibles

14 skills pre-built listas para usar:

| Skill | Descripción | Triggers (ejemplos) |
|-------|-------------|---------------------|
| **commits** | Formato convencional commits | commitear, git push, mensaje commit |
| **docs** | Documentación README/comments | README, documentación, docs |
| **pr** | Pull requests consistentes | PR, pull request, gh pr create |
| **memory** | Cuándo actualizar MEMORY.md | recordar, anotar, guardar memoria |
| **architecture** | System design + patterns | arquitectura, escalabilidad, DB design |
| **debugging** | Troubleshooting sistemático | bug, error, no funciona, crash |
| **planning** | Task breakdown + estimación | planificar, roadmap, sprint, backlog |
| **testing** | Unit/E2E/TDD strategies | tests, testing, TDD, jest, pytest |
| **security** | OWASP + auth + secrets | security, OWASP, auth, XSS, injection |
| **performance** | Optimization + profiling | performance, cache, slow, profiling |
| **deployment** | CI/CD + Docker + K8s | deployment, CI/CD, Docker, pipeline |
| **design** | UI/UX + component architecture | diseño UI/UX, componentes, layout |
| **git-workflow** | Git/GitHub diario | git, branch, merge, rebase, conflicto |
| **agent-skills** | Workflow agent-automatizado | skills, skill-sync, auto-invoke |

**Total:** 57+ triggers automáticos

## 📄 Templates

6 templates específicos según tipo de proyecto:

| Template | Cuándo se usa | Contenido principal |
|----------|---------------|---------------------|
| **root.md** | Default/genérico | Skills básicas, estructura general |
| **web.md** | Frontend React/Vue | Componentes, hooks, state management |
| **nextjs.md** | Next.js App Router | Server Components, Server Actions, SEO |
| **api.md** | APIs/Backend | REST, capas, auth, validación, DB |
| **python.md** | Proyectos Python | Virtual envs, pip, type hints, testing |
| **ai-agent.md** | Agentes IA (Moltbot) | SOUL/IDENTITY, skills modulares, dog-fooding |

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

## 🤝 Contribuir

Contribuciones bienvenidas! Ver [`CONTRIBUTING.md`](CONTRIBUTING.md) *(pendiente)*.

## 📝 Changelog

Ver [`CHANGELOG.md`](CHANGELOG.md) *(pendiente)*.

## 📜 Licencia

MIT © 2026

---

**¿Preguntas?** Abre un issue o contacta al maintainer.
