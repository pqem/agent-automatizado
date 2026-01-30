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

## Caso de uso real: Dog-fooding

Este proyecto se usa a sí mismo para su propio desarrollo:

```bash
# En el workspace de desarrollo
node src/cli.js init         # Genera AGENTS.md
node src/cli.js skill-sync   # Regenera bloques de skills
```

**Resultado:** El agente que desarrolla el proyecto lee su propio `AGENTS.md` y sigue las skills definidas (commits, PR, docs, architecture) automáticamente.

### Ejemplo: Mejora implementada con dog-fooding

**Commit:** `d5934a5 feat(skill-sync): generar tabla auto-invoke en formato Prowler`

1. Agente detectó necesidad de mejorar formato de tabla auto-invoke
2. Leyó skill de commits antes de commitear
3. Aplicó formato convencional: `tipo(scope): descripción`
4. Agregó cuerpo con bullets descriptivos
5. Commit siguió exactamente el formato definido en la skill

**Meta-beneficio:** Cada mejora al sistema hace que el sistema mejore su propio proceso.

## Licencia

MIT
