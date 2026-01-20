---
name: pr
description: Crear Pull Requests con formato consistente. Usa cuando prepares un PR.
scope: root
tools: [bash, read]
---

# Pull Requests

## Formato del Título
```
tipo(scope): descripción breve
```
Mismo formato que commits.

## Template de Descripción
```markdown
## Qué cambia
- Cambio 1
- Cambio 2

## Por qué
Explicación breve del motivo.

## Cómo probar
1. Paso 1
2. Paso 2

## Screenshots (si aplica)
[imágenes aquí]
```

## Checklist antes de crear PR
- [ ] Tests pasan
- [ ] Sin errores de lint
- [ ] Commits limpios y descriptivos
- [ ] Branch actualizada con main/master

## Comandos útiles
```bash
# Ver cambios
git diff main

# Crear PR con gh cli
gh pr create --title "feat(x): descripción" --body "..."
```
