# Instrucciones para Claude

## Proyecto
**agent-automatizado** - Framework CLI para generar contratos de agentes IA (AGENTS.md) y skills modulares.

## Stack
- Node.js 18+ con ES Modules
- Commander.js para CLI
- Ink + React para UI interactiva
- js-yaml para parsing YAML

## Estructura
```
src/cli.js           → Entrada principal CLI
lib/                 → Lógica de negocio
  ├── detector.js    → Detecta tipo de proyecto
  ├── generator.js   → Genera AGENTS.md y skills
  ├── skill-syncer.js → Sincroniza bloques en AGENTS.md
  └── skill-creator.js → Crea nuevas skills
scripts/             → Scripts auxiliares (.cjs)
templates/           → Templates de AGENTS.md
skills/              → Skills activas (context-recovery, resonant-coding)
```

## Convenciones

### Código
- ES Modules (`import/export`)
- Async/await
- Funciones pequeñas y enfocadas
- Sin dependencias innecesarias

### Commits
Formato convencional en español:
```
feat(cli): agregar comando X
fix(detector): corregir detección de Y
refactor(lib): simplificar función Z
docs: actualizar README
```

### Prohibido
- Crear archivos de documentación no solicitados
- Agregar comentarios obvios
- Modificar package.json sin razón
- Usar require() (proyecto usa ES Modules)

## Skills del proyecto
1. **context-recovery** - Recuperación de contexto post-compactación
2. **resonant-coding** - Metodología de trabajo con LLMs

## Comandos principales
```bash
node src/cli.js init        # Inicializar en proyecto existente
node src/cli.js skill-sync  # Regenerar bloques de skills
node src/cli.js add-skill   # Crear skill interactivamente
node src/cli.js detect      # Ver tipo de proyecto detectado
```

## Notas
- El proyecto usa dog-fooding (se usa a sí mismo)
- Las skills están en `/skills/` con formato SKILL.md y frontmatter YAML
- El CLI detecta automáticamente: Next.js, API, Python, AI Agent, Generic
