# Release Guide

## Como cortar release

1. Validar estado limpio:
   ```bash
   git status -sb
   ```
2. Ejecutar checks basicos:
   ```bash
   node src/cli.js init
   node src/cli.js skill-sync
   git diff
   ```
3. Actualizar changelog y docs.
4. Crear tag anotado:
   ```bash
   git tag -a vX.Y.Z -m "vX.Y.Z: resumen"
   ```

## Como validar release

- Determinismo:
  ```bash
  node src/cli.js skill-sync
  node src/cli.js skill-sync
  git diff
  ```
- Monorepo:
  ```bash
  mkdir -p apps/web packages/ui services/api
  printf '{"name":"web","private":true}' > apps/web/package.json
  printf '{"name":"ui","private":true}' > packages/ui/package.json
  printf '{"name":"api","private":true}' > services/api/package.json
  node src/cli.js skill-sync
  ```

## Politica de versionado

- Semver simple: MAJOR para cambios incompatibles, MINOR para features, PATCH para fixes y docs.
