# agent-automatizado

Sistema CLI para generar y sincronizar contratos de agentes (AGENTS.md) y skills en proyectos individuales y monorepos. V1 introduce `skill-sync` para mantener bloques regenerables con markers, auto-invocación explícita y control de herramientas permitidas.

## Instalación y uso

```bash
npm install
node src/cli.js init
node src/cli.js skill-sync
```

## Comandos principales

- `init`: detecta el proyecto y genera AGENTS.md + skills iniciales.
- `skill-sync`: regenera los bloques de Skills Reference y Auto-invoke Skills.

## Qué hace skill-sync

- Regenera bloques marcados con `<!-- SKILL-SYNC:START -->` y `<!-- SKILL-SYNC:END -->`.
- Es idempotente: dos corridas seguidas no deberían generar diffs.
- Soporta monorepo detectando `apps/*`, `packages/*`, `services/*` con `package.json`.
- Cada componente incluye skills `global/root` + skills cuyo `scope` coincide con el nombre de la carpeta.

## Ejemplos

### Repo simple

```bash
node src/cli.js init
node src/cli.js skill-sync
```

### Monorepo minimo

```bash
mkdir -p apps/web packages/ui services/api
printf '{"name":"web","private":true}' > apps/web/package.json
printf '{"name":"ui","private":true}' > packages/ui/package.json
printf '{"name":"api","private":true}' > services/api/package.json
node src/cli.js skill-sync
```

## Troubleshooting

- No determinismo: verificar orden de archivos y que no haya cambios fuera de los markers.
- Markers faltan: agregar `<!-- SKILL-SYNC:START -->` y `<!-- SKILL-SYNC:END -->` manualmente.
- Scopes raros: revisar `scope` en frontmatter y el nombre de la carpeta del componente.

## Licencia

License: TBD
