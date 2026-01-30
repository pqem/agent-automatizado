#!/bin/bash
# Test básico para setup.sh

set -e

echo "=== Test setup.sh ==="
echo ""

# Crear directorio temporal de prueba
TEST_DIR=$(mktemp -d)
echo "Test dir: $TEST_DIR"

# Copiar estructura mínima
mkdir -p "$TEST_DIR/skills/test-skill"
cat > "$TEST_DIR/skills/test-skill/SKILL.md" <<EOF
---
name: test
description: Test skill
---
# Test
EOF

cat > "$TEST_DIR/AGENTS.md" <<EOF
# Test Project
Test agents file
EOF

# Ejecutar setup
cd "$TEST_DIR"
bash "$(dirname "$0")/setup.sh" --claude --cursor --copilot

# Verificar resultados
echo ""
echo "=== Verificación ==="

# Claude
if [ -L ".claude/skills" ]; then
    echo "✓ .claude/skills symlink creado"
else
    echo "✗ .claude/skills falta"
    exit 1
fi

if [ -f ".claude/CLAUDE.md" ]; then
    echo "✓ CLAUDE.md creado"
else
    echo "✗ CLAUDE.md falta"
    exit 1
fi

# Cursor
if [ -L ".cursor/skills" ]; then
    echo "✓ .cursor/skills symlink creado"
else
    echo "✗ .cursor/skills falta"
    exit 1
fi

if [ -f ".cursor/CURSOR.md" ]; then
    echo "✓ CURSOR.md creado"
else
    echo "✗ CURSOR.md falta"
    exit 1
fi

# Copilot
if [ -f ".github/copilot-instructions.md" ]; then
    echo "✓ copilot-instructions.md creado"
else
    echo "✗ copilot-instructions.md falta"
    exit 1
fi

# Limpiar
cd /
rm -rf "$TEST_DIR"

echo ""
echo "=== ✅ Todos los tests pasaron ==="
