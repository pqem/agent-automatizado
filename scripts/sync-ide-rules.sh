#!/bin/bash

# sync-ide-rules.sh
# Genera archivos de configuración para múltiples IDEs desde PROJECT.md
#
# Uso:
#   ./scripts/sync-ide-rules.sh [directorio]
#
# Si no se especifica directorio, usa el directorio actual.

set -e

TARGET_DIR="${1:-.}"
PROJECT_FILE="$TARGET_DIR/PROJECT.md"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔄 Sincronizando reglas de IDE..."
echo ""

# Verificar que existe PROJECT.md o crearlo
if [ ! -f "$PROJECT_FILE" ]; then
    echo -e "${YELLOW}⚠️  No existe PROJECT.md, creando template...${NC}"
    cat > "$PROJECT_FILE" << 'TEMPLATE'
# Nombre del Proyecto

## Stack
- Tecnología 1
- Tecnología 2

## Reglas
1. Regla importante 1
2. Regla importante 2
3. Regla importante 3

## Estructura
```
src/    - Código fuente
lib/    - Librerías
tests/  - Tests
```

## Comandos
```bash
npm install   # Instalar dependencias
npm start     # Iniciar proyecto
npm test      # Ejecutar tests
```

## Notas
- Nota importante para el LLM
TEMPLATE
    echo -e "${GREEN}✅ PROJECT.md creado. Editalo y vuelve a ejecutar.${NC}"
    exit 0
fi

# Leer PROJECT.md
PROJECT_CONTENT=$(cat "$PROJECT_FILE")

# Extraer nombre del proyecto (primera línea después de #)
PROJECT_NAME=$(grep -m1 "^# " "$PROJECT_FILE" | sed 's/^# //')

# Generar .cursorrules
echo "📝 Generando .cursorrules..."
cat > "$TARGET_DIR/.cursorrules" << EOF
# Reglas para Cursor AI

$PROJECT_CONTENT

## Instrucciones adicionales
- Código limpio y conciso
- Commits en formato convencional
- No crear archivos innecesarios
EOF
echo -e "${GREEN}   ✓ .cursorrules${NC}"

# Generar CLAUDE.md
echo "📝 Generando CLAUDE.md..."
cat > "$TARGET_DIR/CLAUDE.md" << EOF
# Instrucciones para Claude

$PROJECT_CONTENT

## Convenciones
- Seguir el estilo existente del código
- Commits descriptivos en español
- No agregar comentarios obvios
EOF
echo -e "${GREEN}   ✓ CLAUDE.md${NC}"

# Generar .github/copilot-instructions.md
echo "📝 Generando .github/copilot-instructions.md..."
mkdir -p "$TARGET_DIR/.github"
cat > "$TARGET_DIR/.github/copilot-instructions.md" << EOF
# GitHub Copilot Instructions

$PROJECT_CONTENT

## Code Style
- Follow existing code patterns
- Use conventional commits
- Keep code clean and focused
EOF
echo -e "${GREEN}   ✓ .github/copilot-instructions.md${NC}"

# Generar OPENCODE.md
echo "📝 Generando OPENCODE.md..."
cat > "$TARGET_DIR/OPENCODE.md" << EOF
# Instrucciones para OpenCode

$PROJECT_CONTENT
EOF
echo -e "${GREEN}   ✓ OPENCODE.md${NC}"

echo ""
echo -e "${GREEN}✅ Sincronización completada!${NC}"
echo ""
echo "Archivos generados:"
echo "  - .cursorrules (Cursor)"
echo "  - CLAUDE.md (Claude Desktop/Code)"
echo "  - .github/copilot-instructions.md (VS Code + Copilot)"
echo "  - OPENCODE.md (OpenCode)"
echo ""
echo "💡 Tip: Edita PROJECT.md y vuelve a ejecutar para actualizar todos."
