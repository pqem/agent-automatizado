# Validador de Skills

Script para validar estructura, frontmatter y consistencia de skills.

## Uso

```bash
# Validar skills en ./skills
node scripts/validate-skills.js

# Custom path
node scripts/validate-skills.js ../my-project/skills

# Como npm script
npm run validate:skills
```

## Qué valida

### Estructura de archivo
- ✅ Frontmatter YAML presente (entre `---`)
- ✅ YAML sintácticamente válido
- ✅ Contenido markdown después del frontmatter

### Frontmatter obligatorio
- ✅ `name` (presente, lowercase, sin espacios)
- ✅ `description` (presente, > 20 caracteres)

### Frontmatter recomendado
- ⚠️ `metadata.auto_invoke` (array con triggers)
- ⚠️ `allowed_tools` (array con herramientas)
- ⚠️ `scope` (root, global, o nombre componente)

### Contenido
- ⚠️ Body > 100 caracteres
- ⚠️ Al menos un heading markdown (`#`)

### Cross-skills
- ✅ Nombres únicos (no duplicados)
- ⚠️ Triggers duplicados entre skills

## Output

### Éxito
```
============================================================
Validador de Skills
============================================================

📂 Directorio: skills

🔍 Encontradas 11 skills

============================================================
Resultado
============================================================

✅ Todas las skills son válidas!
   11 skills verificadas sin problemas
```

Exit code: `0`

### Con warnings
```
⚠️  Warnings: 2
   • commits/SKILL.md: Sin triggers auto_invoke definidos
   • docs/SKILL.md: Contenido muy corto (85 chars)

Validación exitosa con warnings menores.
```

Exit code: `0` (warnings no bloquean)

### Con errores
```
❌ Errores: 3
   • test/SKILL.md: Campo obligatorio faltante: 'name'
   • test/SKILL.md: YAML inválido - unexpected end of stream
   • Nombre duplicado: 'commits' aparece múltiples veces

Validación fallida. Corregí los errores antes de continuar.
```

Exit code: `1` (bloquea CI/CD)

## Integración

### Pre-commit hook
```bash
# .git/hooks/pre-commit
#!/bin/bash
node scripts/validate-skills.js
if [ $? -ne 0 ]; then
  echo "Skills inválidas. Commit cancelado."
  exit 1
fi
```

### GitHub Actions
```yaml
name: Validate Skills
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run validate:skills
```

### NPM script
Agregado a `package.json`:
```json
{
  "scripts": {
    "validate:skills": "node scripts/validate-skills.js"
  }
}
```

## Testing

Probar con skill inválida:
```bash
# Crear skill de prueba
mkdir -p test-skills/broken
cat > test-skills/broken/SKILL.md <<EOF
---
description: Sin campo name
---
# Test
EOF

# Validar
node scripts/validate-skills.js test-skills
# → Error: Campo obligatorio faltante: 'name'

# Limpiar
rm -rf test-skills
```

## Ejemplos de errores comunes

### Frontmatter sin cerrar
```yaml
---
name: test
description: Test skill
# Falta el --- de cierre
```
Error: `Sin frontmatter YAML`

### YAML inválido
```yaml
---
name: test
auto_invoke:
  - trigger 1  # Falta indent
- trigger 2
---
```
Error: `YAML inválido - bad indentation`

### Campo name con espacios
```yaml
---
name: my skill  # ❌
description: Test
---
```
Error: `'name' no puede contener espacios`

### Nombre duplicado
Dos skills con `name: commits` en frontmatter.
Error: `Nombre duplicado: 'commits' aparece múltiples veces`

## Filosofía

**Errores = bloqueantes** (exit 1)
- Frontmatter faltante/inválido
- Campos obligatorios ausentes
- Nombres duplicados
- Sintaxis YAML incorrecta

**Warnings = informativos** (exit 0)
- Triggers duplicados (puede ser intencional)
- Contenido corto (skill minimalista válida)
- Campos recomendados faltantes
- Scope inusual

Si una skill es funcional pero tiene warnings, el validador pasa.
