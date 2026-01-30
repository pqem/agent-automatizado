# Contributing to agent-automatizado

¡Gracias por tu interés en contribuir! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Adding New Skills](#adding-new-skills)
- [Adding New Templates](#adding-new-templates)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

Este proyecto se adhiere al código de conducta estándar open source:
- Sé respetuoso y constructivo
- Acepta críticas constructivas
- Enfócate en lo mejor para la comunidad
- Muestra empatía hacia otros miembros

## Getting Started

### 1. Fork y clonar

```bash
# Fork en GitHub
# Luego clonar tu fork
git clone https://github.com/TU-USUARIO/agent-automatizado.git
cd agent-automatizado
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar remotes

```bash
git remote add upstream https://github.com/REPO-ORIGINAL/agent-automatizado.git
```

### 4. Crear branch

```bash
git checkout -b feature/nueva-funcionalidad
# o
git checkout -b fix/arreglo-bug
```

## Development Workflow

### 1. Mantener tu fork actualizado

```bash
git fetch upstream
git rebase upstream/master
```

### 2. Hacer cambios

```bash
# Editar archivos
# Validar que todo funciona
npm run validate:skills
node src/cli.js skill-sync --check  # Cuando esté disponible
```

### 3. Probar localmente

```bash
# Probar comando init
mkdir test-project && cd test-project
node ../src/cli.js init

# Probar skill-sync
node ../src/cli.js skill-sync

# Probar add-skill
node ../src/cli.js add-skill test-skill \
  -d "Descripción de prueba skill" \
  -t "trigger1,trigger2"
```

### 4. Commit

```bash
git add .
git commit -m "feat(scope): descripción clara"
```

### 5. Push y crear PR

```bash
git push origin feature/nueva-funcionalidad
# Luego crear PR en GitHub
```

## Code Style

### General

- **Indentación:** 2 espacios
- **Quotes:** Single quotes (`'`) preferidas
- **Semicolons:** Consistente (preferiblemente sin semicolons en código moderno)
- **Line length:** Máximo 100 caracteres

### JavaScript

```javascript
// ✅ Bueno
function buildSkillReference(skills) {
  const sorted = skills.sort((a, b) => a.name.localeCompare(b.name))
  return sorted.map(skill => formatSkillRow(skill))
}

// ❌ Malo
function buildSkillReference(skills){
    let sorted=skills.sort(function(a,b){return a.name.localeCompare(b.name)});
    return sorted.map(function(skill){return formatSkillRow(skill)});
}
```

### File naming

- **Scripts:** `kebab-case.js` (ej: `skill-creator.js`)
- **Templates:** `kebab-case.md` (ej: `ai-agent.md`)
- **Skills:** carpetas en `kebab-case` (ej: `skills/my-skill/`)

### Comments

```javascript
// Comentarios simples para líneas individuales

/**
 * Comentarios multi-línea para funciones/bloques complejos
 * con descripción detallada de parámetros y retorno.
 */
function complexFunction(param) {
  // ...
}
```

## Commit Guidelines

Seguimos **Conventional Commits** ([spec](https://www.conventionalcommits.org/)):

### Formato

```
tipo(scope): descripción corta

[cuerpo opcional con detalles]

[footer opcional con breaking changes o issues]
```

### Tipos permitidos

- `feat` - Nueva funcionalidad
- `fix` - Corrección de bug
- `docs` - Cambios en documentación
- `style` - Formateo, espacios (no afecta lógica)
- `refactor` - Refactorización sin cambiar funcionalidad
- `test` - Agregar o modificar tests
- `chore` - Tareas de mantenimiento (deps, config)
- `perf` - Mejoras de performance

### Scopes comunes

- `cli` - Comandos CLI (init, skill-sync, add-skill)
- `skills` - Skills (agregar, modificar, eliminar)
- `templates` - Templates de AGENTS.md
- `detector` - Detección de tipo de proyecto
- `parser` - Parser YAML/Markdown
- `scripts` - Scripts de setup/validación
- `validation` - Validador de skills
- `docs` - Documentación

### Ejemplos

```bash
# Feature nueva
git commit -m "feat(cli): agregar comando export-skills"

# Bug fix
git commit -m "fix(parser): corregir parsing de frontmatter con comillas"

# Breaking change
git commit -m "feat(cli)!: cambiar formato de output skill-sync

BREAKING CHANGE: skill-sync ahora retorna JSON en lugar de tabla"

# Con issue reference
git commit -m "fix(detector): detectar monorepos sin package.json root

Fixes #42"
```

## Pull Request Process

### 1. Checklist pre-PR

- [ ] Código sigue el style guide
- [ ] Tests pasando (si aplica)
- [ ] Documentación actualizada
- [ ] Commits siguen convenciones
- [ ] Branch actualizado con upstream/master
- [ ] `npm run validate:skills` pasa sin errores

### 2. Crear PR

**Título:** Mismo formato que commits

```
feat(cli): agregar comando export-skills
```

**Descripción:** Usar template

```markdown
## Descripción
[Descripción clara de los cambios]

## Motivación
[Por qué es necesario este cambio]

## Tipo de cambio
- [ ] Bug fix (cambio no breaking que corrige un issue)
- [ ] Nueva feature (cambio no breaking que agrega funcionalidad)
- [ ] Breaking change (fix o feature que causa que funcionalidad existente no funcione como antes)
- [ ] Documentación

## Testing
- [ ] Tests agregados/actualizados
- [ ] Tests existentes pasando
- [ ] Manual testing completado

## Screenshots (si aplica)
[Agregar screenshots si hay cambios visuales]

## Checklist
- [ ] Código sigue style guide
- [ ] Documentación actualizada
- [ ] Commits siguen convenciones
```

### 3. Review process

- Mantenedores revisarán tu PR
- Pueden solicitar cambios
- Discusión constructiva bienvenida
- Una vez aprobado, será merged

### 4. Post-merge

```bash
# Actualizar tu fork
git checkout master
git pull upstream master
git push origin master

# Limpiar branch
git branch -d feature/nueva-funcionalidad
```

## Adding New Skills

### 1. Usar CLI

```bash
node src/cli.js add-skill mi-skill \
  -d "Descripción clara de la skill (mínimo 20 chars)" \
  -t "trigger1,trigger2,trigger3" \
  -f "read,write,exec"
```

### 2. Estructura requerida

```
skills/mi-skill/
├── SKILL.md       # Contenido de la skill
└── assets/        # (opcional) Imágenes, ejemplos
```

### 3. Frontmatter completo

```yaml
---
name: mi-skill
description: Descripción breve que aparecerá en AGENTS.md
scope: root        # root|global|<custom>
metadata:
  auto_invoke:
    - trigger1
    - trigger2
allowed_tools:
  - read
  - write
---
```

### 4. Validar

```bash
npm run validate:skills
node src/cli.js skill-sync  # Verificar que se agrega correctamente
```

### 5. Documentar

Agregar entrada en `docs/TEMPLATES.md` si es skill importante.

## Adding New Templates

### 1. Crear template

```bash
# Ubicación
templates/agents/mi-tipo.md
```

### 2. Estructura recomendada

```markdown
# Proyecto [Tipo]

Sistema de [descripción corta].

## Estructura del Proyecto
- Workspace: `{workspace}`
- [Otros paths importantes]

## Stack Tecnológico
- [Stack principal]
- [Herramientas clave]

## Convenciones
### [Convención 1]
[Detalles]

## Skills Disponibles
<!-- SKILL-SYNC:START -->
<!-- SKILL-SYNC:END -->

## Auto-invoke Skills
<!-- SKILL-SYNC:AUTO-INVOKE:START -->
<!-- SKILL-SYNC:AUTO-INVOKE:END -->
```

### 3. Actualizar detector

En `lib/detector.js`:

```javascript
function detectProjectType(rootDir) {
  // Agregar lógica de detección
  if (existsSync(join(rootDir, 'mi-archivo-distintivo.json'))) {
    return 'mi-tipo'
  }
  // ...
}
```

### 4. Documentar

Actualizar `docs/TEMPLATES.md` con:
- Cuándo se usa el template
- Qué detecta automáticamente
- Ejemplo de uso

## Testing

### Manual testing

```bash
# Crear directorio temporal
mkdir /tmp/test-agent-automatizado
cd /tmp/test-agent-automatizado

# Probar init
node /path/to/agent-automatizado/src/cli.js init

# Verificar output
cat AGENTS.md
ls -la skills/

# Probar skill-sync
node /path/to/agent-automatizado/src/cli.js skill-sync
git diff  # No debería haber cambios

# Probar add-skill
node /path/to/agent-automatizado/src/cli.js add-skill test \
  -d "Test skill para validación"
```

### Automated testing

```bash
# Validar skills
npm run validate:skills

# Test setup script
bash scripts/test-setup.sh
```

### CI/CD

Pull requests ejecutan automáticamente:
- `npm install`
- `npm run validate:skills`
- Tests de setup script

## Documentation

### Actualizar docs

Cuando agregues features, actualiza:

1. **README.md** - Si es feature principal
2. **CHANGELOG.md** - Agregar entrada en [Unreleased]
3. **docs/*.md** - Documentación específica si aplica
4. **Comentarios en código** - Para lógica compleja

### Escribir buena documentación

```markdown
# ✅ Bueno - Claro y con ejemplos
## Comando add-skill

Crea una nueva skill interactivamente.

### Uso básico
\`\`\`bash
node src/cli.js add-skill
\`\`\`

### Con flags
\`\`\`bash
node src/cli.js add-skill security -d "Security best practices"
\`\`\`

# ❌ Malo - Vago sin ejemplos
## add-skill
Crea skills
```

---

## ❓ Questions?

- Abre un issue con label `question`
- Contacta a mantenedores
- Revisa issues existentes por si ya fue respondido

## 🙏 Gracias

Tu contribución hace que este proyecto sea mejor para todos. ¡Gracias por tu tiempo y esfuerzo!
