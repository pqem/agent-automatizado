# Comando add-skill

Crea una nueva skill de forma interactiva o con flags.

## Modo interactivo (recomendado)

```bash
node src/cli.js add-skill
```

### Prompts

1. **Nombre** (lowercase, sin espacios)
   - Ejemplo: `my-skill`
   - Validación: debe ser lowercase y sin espacios

2. **Descripción** (mínimo 20 caracteres)
   - Ejemplo: "Estrategias para optimización de performance"
   
3. **Scope**
   - `root` (disponible en todo el proyecto) ⭐ recomendado
   - `global` (alias de root)
   - `custom` (para monorepo: api, ui, etc.)

4. **Triggers auto-invoke** (separados por coma)
   - Ejemplo: `performance, optimization, cache`
   - Puede dejarse vacío y agregarse después

5. **Herramientas permitidas** (checkbox)
   - read ✓
   - write ✓
   - exec
   - browser
   - memory_search

6. **Título del documento** (opcional)
   - Default: nombre capitalizado
   - Ejemplo: "My Skill" (generado de my-skill)

7. **Lenguaje principal** para ejemplos
   - javascript, typescript, python, bash, yaml, markdown

### Resultado

```
✅ Skill creada: skills/my-skill/SKILL.md

Próximos pasos:
  1. Editá el contenido de la skill
  2. Ejecutá: node src/cli.js skill-sync
  3. La skill aparecerá en AGENTS.md automáticamente
```

## Modo no interactivo

Para scripting o CI/CD:

```bash
node src/cli.js add-skill <name> [options]
```

### Opciones

- `-d, --description <desc>` - Descripción de la skill
- `-s, --scope <scope>` - Scope (root, global, custom) [default: root]
- `-t, --tools <tools>` - Herramientas (comma-separated) [default: read,write]
- `-f, --force` - Sobrescribir si existe

### Ejemplos

**Mínimo:**
```bash
node src/cli.js add-skill security -d "Security best practices and OWASP guidelines"
```

**Completo:**
```bash
node src/cli.js add-skill deployment \
  -d "CI/CD, Docker, and cloud deployment strategies" \
  -s root \
  -t "read,write,exec,browser" \
  --force
```

**Custom scope (monorepo):**
```bash
node src/cli.js add-skill api-testing \
  -d "API testing strategies" \
  -s api \
  -t "read,write,exec"
```

## Template generado

La skill creada incluye:

```markdown
---
name: skill-name
description: Descripción ingresada
scope: root
metadata:
  auto_invoke:
    - "trigger 1"
    - "trigger 2"
allowed_tools: ["read", "write"]
---

# Skill Name

## Introducción

[Contenido placeholder]

## Ejemplos

\`\`\`javascript
// Ejemplo
[Código placeholder]
\`\`\`

## Best Practices

### ✅ Hacer

- Item 1
- Item 2

### ❌ Evitar

- Anti-pattern 1
- Anti-pattern 2

---

**Filosofía:** [Por completar]
```

## Workflow recomendado

1. **Crear skill**
   ```bash
   node src/cli.js add-skill
   ```

2. **Editar contenido**
   ```bash
   vim skills/my-skill/SKILL.md
   # o usar tu editor favorito
   ```

3. **Validar**
   ```bash
   npm run validate:skills
   ```

4. **Sincronizar**
   ```bash
   node src/cli.js skill-sync
   ```

5. **Verificar**
   ```bash
   cat AGENTS.md | grep my-skill
   # Debería aparecer en Skills Reference y Auto-invoke
   ```

6. **Commit**
   ```bash
   git add skills/my-skill AGENTS.md
   git commit -m "feat(skills): agregar skill my-skill"
   ```

## Customización del template

El template está en `lib/skill-creator.js`:

```javascript
const SKILL_TEMPLATE = `---
name: {{NAME}}
description: {{DESCRIPTION}}
...
---

# {{TITLE}}

...
`;
```

Podés editarlo para ajustar:
- Secciones incluidas por default
- Estructura de ejemplos
- Placeholders
- Filosofía default

## Validación automática

Después de crear, validar con:

```bash
npm run validate:skills
```

Verifica:
- ✅ Frontmatter YAML válido
- ✅ Campos obligatorios presentes
- ✅ Nombre único (no duplicado)
- ⚠️ Warnings sobre campos recomendados

## Troubleshooting

### "Skill ya existe"

Si ejecutás el comando sin `--force` y la skill existe:

```bash
⚠️  La skill "my-skill" ya existe en skills/my-skill
¿Sobrescribir? (y/N)
```

- `y` → sobrescribe
- `n` → cancela

En modo no interactivo, usá `--force`.

### Nombre inválido

```
El nombre es obligatorio
No puede contener espacios
Debe estar en lowercase
```

Corregir el nombre según las validaciones.

### Triggers no aparecen en AGENTS.md

1. Verificar que están en frontmatter:
   ```yaml
   metadata:
     auto_invoke:
       - "mi trigger"
   ```

2. Ejecutar skill-sync:
   ```bash
   node src/cli.js skill-sync
   ```

3. Verificar AGENTS.md:
   ```bash
   grep "mi trigger" AGENTS.md
   ```

## Ejemplos reales

### Skill de security

```bash
node src/cli.js add-skill security \
  -d "Security best practices, OWASP guidelines, and common vulnerabilities" \
  -t "read,write,browser"
```

Triggers sugeridos: `security, vulnerabilities, OWASP, auth, secrets`

### Skill de performance

```bash
node src/cli.js add-skill performance \
  -d "Performance optimization, profiling, and monitoring strategies" \
  -t "read,write,exec,browser"
```

Triggers sugeridos: `performance, optimization, cache, profiling, monitoring`

### Skill de deployment

```bash
node src/cli.js add-skill deployment \
  -d "CI/CD pipelines, Docker, Kubernetes, and cloud deployment" \
  -t "read,write,exec"
```

Triggers sugeridos: `deployment, CI/CD, Docker, Kubernetes, deploy`
