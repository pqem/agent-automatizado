---
name: commits
description: Formato de commits convencionales. Usa cuando hagas commits o prepares cambios para commit.
scope: root
tools: [bash]
---

# Commits Convencionales

## Formato
```
tipo(scope): descripción corta

[cuerpo opcional]

[footer opcional]
```

## Tipos
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Solo documentación
- `style`: Formato (no afecta lógica)
- `refactor`: Cambio de código sin fix/feat
- `test`: Agregar/corregir tests
- `chore`: Mantenimiento, deps, config

## Ejemplos
```
feat(auth): agregar login con Google
fix(api): corregir timeout en llamadas
docs(readme): actualizar instrucciones de instalación
refactor(utils): simplificar función de validación
```

## Reglas
1. Primera línea < 72 caracteres
2. Verbo en infinitivo (agregar, corregir, no agregado/corregí)
3. Sin punto final
4. Scope opcional pero recomendado
