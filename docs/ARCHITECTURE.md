# Arquitectura

## Objetivo

Mantener una unica fuente de verdad para skills y contratos de agentes. AGENTS.md es un artefacto regenerable y se usa como contrato operativo para cada CLI.

## Estructura recomendada

- `templates/skills/**/SKILL.md`
- `AGENTS.md` en raiz
- `apps/*/AGENTS.md`
- `packages/*/AGENTS.md`
- `services/*/AGENTS.md`

## Contrato de frontmatter

- `metadata.auto_invoke`: lista de triggers explicitos para invocar una skill.
- `allowed_tools`: lista de herramientas permitidas para la skill.

## Consumo por CLI (conceptual)

- Claude Code: lee `AGENTS.md` y el bloque de skills para decidir invocaciones.
- OpenCode: consulta `AGENTS.md` antes de operar en la codebase.
- Codex: usa `AGENTS.md` como contrato de instrucciones.
- Gemini CLI: consume `AGENTS.md` como reglas y referencia de skills.

## Sincronizacion de skills entre CLIs

- Symlinks: rapido y sin duplicar, requiere permisos en algunos sistemas.
- Copia generada: portable, pero requiere re-sync cada vez que cambian skills.

## Seguridad y control

- `allowed_tools` funciona como guardrail de herramientas permitidas.
- `metadata.auto_invoke` reduce ambiguedad en disparadores de skills.
