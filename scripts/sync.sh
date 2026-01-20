#!/bin/bash
# sync.sh - Sincroniza AGENTS.md y skills a todos los IDEs
# Uso: ./sync.sh [--symlinks] [--only=claude,copilot]

set -e

# Colores
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

USE_SYMLINKS=false
ONLY=""

# Parsear argumentos
for arg in "$@"; do
    case $arg in
        --symlinks)
            USE_SYMLINKS=true
            ;;
        --only=*)
            ONLY="${arg#*=}"
            ;;
    esac
done

PROJECT_PATH=$(pwd)
AGENTS_MD="$PROJECT_PATH/AGENTS.md"
SKILLS_DIR="$PROJECT_PATH/skills"

if [ ! -f "$AGENTS_MD" ]; then
    echo -e "${YELLOW}⚠ No se encontró AGENTS.md. Ejecuta 'agent-auto init' primero.${NC}"
    exit 1
fi

echo -e "\n${CYAN}🔄 Sincronizando a IDEs...${NC}\n"
echo -e "📋 Modo: $([ "$USE_SYMLINKS" = true ] && echo 'symlinks' || echo 'copia')\n"

sync_file() {
    local src=$1
    local dest=$2
    
    rm -f "$dest" 2>/dev/null || true
    
    if [ "$USE_SYMLINKS" = true ]; then
        ln -s "$src" "$dest"
    else
        cp "$src" "$dest"
    fi
}

sync_dir() {
    local src=$1
    local dest=$2
    
    rm -rf "$dest" 2>/dev/null || true
    
    if [ "$USE_SYMLINKS" = true ]; then
        ln -s "$src" "$dest"
    else
        cp -r "$src" "$dest"
    fi
}

should_sync() {
    local ide=$1
    if [ -z "$ONLY" ]; then
        return 0
    fi
    echo "$ONLY" | grep -q "$ide"
}

# Claude
if should_sync "claude"; then
    echo -e "  → Claude Code..."
    mkdir -p "$PROJECT_PATH/.claude"
    sync_file "$AGENTS_MD" "$PROJECT_PATH/CLAUDE.md"
    [ -d "$SKILLS_DIR" ] && sync_dir "$SKILLS_DIR" "$PROJECT_PATH/.claude/skills"
    echo -e "  ${GREEN}✓ .claude/ y CLAUDE.md${NC}"
fi

# Copilot
if should_sync "copilot"; then
    echo -e "  → GitHub Copilot..."
    mkdir -p "$PROJECT_PATH/.github"
    sync_file "$AGENTS_MD" "$PROJECT_PATH/.github/copilot-instructions.md"
    [ -d "$SKILLS_DIR" ] && sync_dir "$SKILLS_DIR" "$PROJECT_PATH/.github/skills"
    echo -e "  ${GREEN}✓ .github/copilot-instructions.md${NC}"
fi

# Codex
if should_sync "codex"; then
    echo -e "  → OpenAI Codex..."
    mkdir -p "$PROJECT_PATH/.codex"
    sync_file "$AGENTS_MD" "$PROJECT_PATH/.codex/AGENTS.md"
    [ -d "$SKILLS_DIR" ] && sync_dir "$SKILLS_DIR" "$PROJECT_PATH/.codex/skills"
    echo -e "  ${GREEN}✓ .codex/${NC}"
fi

# Gemini
if should_sync "gemini"; then
    echo -e "  → Google Gemini..."
    sync_file "$AGENTS_MD" "$PROJECT_PATH/GEMINI.md"
    echo -e "  ${GREEN}✓ GEMINI.md${NC}"
fi

# Cursor
if should_sync "cursor"; then
    echo -e "  → Cursor..."
    mkdir -p "$PROJECT_PATH/.cursor"
    sync_file "$AGENTS_MD" "$PROJECT_PATH/.cursorrules"
    sync_file "$AGENTS_MD" "$PROJECT_PATH/.cursor/rules.md"
    echo -e "  ${GREEN}✓ .cursorrules${NC}"
fi

# Warp
if should_sync "warp"; then
    echo -e "  → Warp AI..."
    mkdir -p "$PROJECT_PATH/.warp"
    sync_file "$AGENTS_MD" "$PROJECT_PATH/.warp/rules.md"
    echo -e "  ${GREEN}✓ .warp/rules.md${NC}"
fi

echo -e "\n${GREEN}✅ Sincronización completada!${NC}\n"
