# Changelog

## v1.0.0 - 2026-01-21

### Added
- CLI `skill-sync` para regenerar bloques de skills.
- AGENTS.md jerarquicos en monorepos.
- Markers para Skills Reference y Auto-invoke Skills.

### Changed
- Frontmatter de skills con `metadata.auto_invoke` y `allowed_tools`.

### Notes
- Idempotencia garantizada en corridas consecutivas de `skill-sync`.
