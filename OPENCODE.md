# Instrucciones para OpenCode

## Proyecto
**agent-automatizado** - Framework CLI para generar contratos de agentes IA y skills modulares.

## Stack
- Node.js 18+ (ES Modules)
- Commander.js, Ink, React, js-yaml

## Estructura principal
- `src/cli.js` → CLI principal
- `lib/` → Lógica (detector, generator, skill-syncer)
- `scripts/` → Scripts auxiliares
- `skills/` → Skills activas

## Reglas
1. Usar ES Modules (`import/export`)
2. Commits en español, formato convencional
3. No agregar archivos innecesarios
4. No modificar package.json sin razón

## Comandos
```bash
node src/cli.js init        # Inicializar
node src/cli.js skill-sync  # Sincronizar
node src/cli.js add-skill   # Nueva skill
node src/cli.js detect      # Detectar proyecto
```

## Skills disponibles
- context-recovery
- resonant-coding
