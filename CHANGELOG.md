# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- ✨ **Context Recovery System** - Recuperación automática post-compactación
  - Skill `context-recovery` con guía completa
  - Script `update-context-recovery.cjs` que genera snapshot del workspace
  - `CONTEXT-RECOVERY.md` con estado actual del proyecto
  - Template de referencia
  - 5+ triggers: "perdió memoria", "contexto perdido", "summary unavailable"
- Documentación completa del proyecto (README mejorado, CHANGELOG)

## [1.0.0] - 2026-01-30

Primera versión estable con todas las features V1 completas.

### Added

#### Core Features
- ✨ CLI completo con comandos `init`, `skill-sync`, `add-skill`
- 🔍 Detección automática de tipo de proyecto (Next.js, API, Python, AI Agent, Generic)
- 📦 6 templates específicos según stack detectado
- 🎯 2 skills completas + 13 templates de skills
- 🔄 Sincronización idempotente con markers (`<!-- SKILL-SYNC:START -->`)
- 🌳 Soporte completo de monorepos (apps/*, packages/*, services/*)

#### Skills Completas
- **context-recovery** - Recuperación post-compactación
- **resonant-coding** - Metodología Resonant Coding

#### Templates de Skills
- commits, docs, pr, testing, security, performance, deployment
- nextjs, react, python, typescript, tailwind, skill-creator

#### Templates
- `root.md` - Proyecto genérico (default)
- `web.md` - Frontend React/Vue
- `nextjs.md` - Next.js App Router
- `api.md` - APIs y backend
- `python.md` - Proyectos Python
- `ai-agent.md` - Agentes IA

#### Developer Tools
- 🎨 CLI interactivo para crear skills (`add-skill`)
- ✅ Validador automático de skills (`validate-skills.js`)
- 🔗 Setup multi-IDE (Claude, Cursor, Copilot, Gemini, Warp, Codex)
- 🧪 Tests automatizados para setup script

#### Documentation
- `docs/ADD-SKILL.md` - Guía completa del comando add-skill
- `docs/TEMPLATES.md` - Sistema de templates
- `docs/ARCHITECTURE.md` - Arquitectura interna
- `docs/ROADMAP.md` - Roadmap V2
- `docs/RELEASE.md` - Guía de releases
- `scripts/README.md` - Documentación de setup multi-IDE

### Changed
- 🔧 Parser YAML mejorado con `js-yaml` (soporta objetos anidados)
- 📊 Tabla auto-invoke en formato Prowler (mejor legibilidad)
- 🎯 Detector reconoce proyectos de agentes IA (SOUL.md + IDENTITY.md)
- 📋 Orden estable en skill-sync (mismos inputs → mismo output)

### Fixed
- 🐛 Tabla auto-invoke ahora genera formato correcto tipo Prowler
- 🔒 Validación de inputs en add-skill (previene nombres inválidos)
- 🔗 Symlinks en setup.sh funcionan correctamente en todos los IDEs

## [0.4.0] - 2026-01-30

### Added
- feat(skills): skills de security, performance y deployment (#c7f4e5b)
- feat(templates): templates mejorados específicos por tipo de proyecto (#b0c9c71)
- feat(cli): comando add-skill interactivo (#1edc1a4)
- feat(validation): validador automático de skills (#e93f8b6)
- test(scripts): test automatizado para setup.sh (#7b703a7)

## [0.3.0] - 2026-01-30

### Added
- feat(skills): skill de testing completa (#ad774ab)
- feat(scripts): setup.sh para sincronizar skills a múltiples IDEs (#cb31947)
- feat(parser): soportar YAML anidado con js-yaml (#2fe6aa9)

## [0.2.0] - 2026-01-30

### Added
- feat(detector): detectar proyectos de agentes IA (#730aae7)
- feat(skill-sync): generar tabla auto-invoke en formato Prowler (#d5934a5)

### Fixed
- chore: sync package-lock para instalaciones reproducibles (#c8116ba)

## [0.1.0] - 2026-01-29

### Added
- docs: v1 release notes, roadmap v2, architecture (#eca7ea6)
- feat(skills): skill-sync idempotente + frontmatter auto_invoke + monorepo (#15c9c44)
- feat(mcp): integración completa de MCP servers - Fase 4 (#6bfce20)
- feat(sync): mejorar sincronización multi-IDE - Fase 3 (#fb5bc2d)
- feat(skills): skills de tecnología - Fase 2 (#6545434)
- feat: MVP completo - CLI, wizard interactivo, templates y generador (#6e9b93e)

## [0.0.1] - 2026-01-29

### Added
- Initial commit
- Estructura básica del proyecto
- Scaffolding inicial

---

## Legend

- ✨ Features
- 🔧 Changes
- 🐛 Fixes
- 📚 Documentation
- 🧪 Tests
- 🔒 Security
- ⚡ Performance
- 🌳 Monorepo
- 🔗 Integrations

[Unreleased]: https://github.com/tu-usuario/agent-automatizado/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/tu-usuario/agent-automatizado/compare/v0.4.0...v1.0.0
[0.4.0]: https://github.com/tu-usuario/agent-automatizado/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/tu-usuario/agent-automatizado/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/tu-usuario/agent-automatizado/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/tu-usuario/agent-automatizado/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/tu-usuario/agent-automatizado/releases/tag/v0.0.1
