# Roadmap

## V2 Goals

- [ ] `skill-sync --check` falla si hay drift en bloques regenerables.
- [ ] `skill-sync --dry-run` muestra cambios sin escribir archivos.
- [ ] Orden estable garantizado por path y nombre de skill.
- [ ] Validacion de frontmatter con schema + warnings claros.
- [ ] Logging mejorado con `--verbose` y niveles.
- [ ] Soporte de ignore/include por componente.

## Non-goals

- No agregar heuristicas de auto-scope.
- No modificar el contrato de AGENTS.md.
- No integrar push automatico a remotos.

## Acceptance tests

- `--check`:
  ```bash
  node src/cli.js skill-sync
  node src/cli.js skill-sync --check
  ```
- `--dry-run`:
  ```bash
  node src/cli.js skill-sync --dry-run
  ```
- Orden estable:
  ```bash
  node src/cli.js skill-sync
  node src/cli.js skill-sync
  git diff
  ```
- Validacion frontmatter:
  ```bash
  node src/cli.js skill-sync --check
  ```
- Verbose:
  ```bash
  node src/cli.js skill-sync --verbose
  ```
- Ignore/include por componente:
  ```bash
  node src/cli.js skill-sync --include apps/web
  node src/cli.js skill-sync --ignore services/api
  ```
