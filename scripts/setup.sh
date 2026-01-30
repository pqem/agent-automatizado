#!/bin/bash
# Setup script para sincronizar skills a múltiples IDEs
# Soporta: Claude, Copilot, Cursor, Gemini, Codex, Warp
#
# Uso:
#   ./scripts/setup.sh              # Interactivo
#   ./scripts/setup.sh --all        # Todos los IDEs
#   ./scripts/setup.sh --claude --copilot  # Solo algunos

set -e

# Detectar workspace: usa directorio actual, no ubicación del script
REPO_ROOT="$(pwd)"
SKILLS_SOURCE="$REPO_ROOT/skills"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Flags
SETUP_CLAUDE=false
SETUP_COPILOT=false
SETUP_CURSOR=false
SETUP_GEMINI=false
SETUP_CODEX=false
SETUP_WARP=false

# =============================================================================
# HELPERS
# =============================================================================

show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Sincroniza skills a IDEs y editores compatibles con agent skills."
    echo ""
    echo "Options:"
    echo "  --all       Configurar todos los IDEs"
    echo "  --claude    Claude (Desktop / Code)"
    echo "  --copilot   GitHub Copilot"
    echo "  --cursor    Cursor Editor"
    echo "  --gemini    Gemini CLI"
    echo "  --codex     Codex (OpenAI)"
    echo "  --warp      Warp Terminal"
    echo "  --help      Mostrar ayuda"
    echo ""
    echo "Si no se pasan opciones, ejecuta en modo interactivo."
    echo ""
    echo "Ejemplos:"
    echo "  $0                      # Menú interactivo"
    echo "  $0 --all                # Todos"
    echo "  $0 --claude --cursor    # Solo Claude y Cursor"
}

show_menu() {
    echo -e "${BOLD}¿Qué IDEs/editores usás?${NC}"
    echo -e "${CYAN}(Usá números para seleccionar, Enter para confirmar)${NC}"
    echo ""

    local options=("Claude" "GitHub Copilot" "Cursor" "Gemini CLI" "Codex" "Warp Terminal")
    local selected=(true false false false false false)  # Claude por defecto

    while true; do
        clear
        echo -e "${BOLD}Setup - Agent Skills Sync${NC}"
        echo ""
        for i in "${!options[@]}"; do
            if [ "${selected[$i]}" = true ]; then
                echo -e "  ${GREEN}[✓]${NC} $((i+1)). ${options[$i]}"
            else
                echo -e "  [ ] $((i+1)). ${options[$i]}"
            fi
        done
        echo ""
        echo -e "  ${YELLOW}a${NC}. Seleccionar todos"
        echo -e "  ${YELLOW}n${NC}. Ninguno"
        echo -e "  ${YELLOW}q${NC}. Salir"
        echo ""
        echo -n "Opción (1-6, a/n/q) o Enter para continuar: "

        read -r choice

        case $choice in
            1) selected[0]=$([ "${selected[0]}" = true ] && echo false || echo true) ;;
            2) selected[1]=$([ "${selected[1]}" = true ] && echo false || echo true) ;;
            3) selected[2]=$([ "${selected[2]}" = true ] && echo false || echo true) ;;
            4) selected[3]=$([ "${selected[3]}" = true ] && echo false || echo true) ;;
            5) selected[4]=$([ "${selected[4]}" = true ] && echo false || echo true) ;;
            6) selected[5]=$([ "${selected[5]}" = true ] && echo false || echo true) ;;
            a|A) selected=(true true true true true true) ;;
            n|N) selected=(false false false false false false) ;;
            q|Q) echo "Cancelado."; exit 0 ;;
            "") break ;;
            *) ;;
        esac
    done

    SETUP_CLAUDE=${selected[0]}
    SETUP_COPILOT=${selected[1]}
    SETUP_CURSOR=${selected[2]}
    SETUP_GEMINI=${selected[3]}
    SETUP_CODEX=${selected[4]}
    SETUP_WARP=${selected[5]}
}

check_skills_exist() {
    if [ ! -d "$SKILLS_SOURCE" ]; then
        echo -e "${RED}Error: No se encontró carpeta skills/ en $REPO_ROOT${NC}"
        echo "Ejecutá 'node src/cli.js init' primero."
        exit 1
    fi
}

# =============================================================================
# SETUP FUNCTIONS
# =============================================================================

setup_claude() {
    echo -e "${BLUE}Configurando Claude...${NC}"
    local target="$REPO_ROOT/.claude"

    mkdir -p "$target"

    # Symlink a skills
    if [ -L "$target/skills" ]; then
        rm "$target/skills"
    elif [ -d "$target/skills" ]; then
        mv "$target/skills" "$target/skills.backup.$(date +%s)"
    fi

    ln -s "$SKILLS_SOURCE" "$target/skills"
    echo -e "${GREEN}  ✓ .claude/skills → skills/${NC}"

    # Copiar AGENTS.md a CLAUDE.md
    if [ -f "$REPO_ROOT/AGENTS.md" ]; then
        cp "$REPO_ROOT/AGENTS.md" "$target/CLAUDE.md"
        echo -e "${GREEN}  ✓ CLAUDE.md actualizado${NC}"
    fi
}

setup_copilot() {
    echo -e "${BLUE}Configurando GitHub Copilot...${NC}"
    local target="$REPO_ROOT/.github"

    mkdir -p "$target"

    # Copilot usa .github/copilot-instructions.md
    if [ -f "$REPO_ROOT/AGENTS.md" ]; then
        cp "$REPO_ROOT/AGENTS.md" "$target/copilot-instructions.md"
        echo -e "${GREEN}  ✓ .github/copilot-instructions.md actualizado${NC}"
    fi

    # Symlink a skills (opcional, no todos los setups lo usan)
    if [ ! -d "$target/skills" ]; then
        ln -s "$SKILLS_SOURCE" "$target/skills" 2>/dev/null || true
    fi
}

setup_cursor() {
    echo -e "${BLUE}Configurando Cursor...${NC}"
    local target="$REPO_ROOT/.cursor"

    mkdir -p "$target"

    # Symlink a skills
    if [ -L "$target/skills" ]; then
        rm "$target/skills"
    elif [ -d "$target/skills" ]; then
        mv "$target/skills" "$target/skills.backup.$(date +%s)"
    fi

    ln -s "$SKILLS_SOURCE" "$target/skills"
    echo -e "${GREEN}  ✓ .cursor/skills → skills/${NC}"

    # Copiar AGENTS.md a CURSOR.md
    if [ -f "$REPO_ROOT/AGENTS.md" ]; then
        cp "$REPO_ROOT/AGENTS.md" "$target/CURSOR.md"
        echo -e "${GREEN}  ✓ CURSOR.md actualizado${NC}"
    fi
}

setup_gemini() {
    echo -e "${BLUE}Configurando Gemini CLI...${NC}"
    local target="$REPO_ROOT/.gemini"

    mkdir -p "$target"

    # Symlink a skills
    if [ -L "$target/skills" ]; then
        rm "$target/skills"
    elif [ -d "$target/skills" ]; then
        mv "$target/skills" "$target/skills.backup.$(date +%s)"
    fi

    ln -s "$SKILLS_SOURCE" "$target/skills"
    echo -e "${GREEN}  ✓ .gemini/skills → skills/${NC}"

    # Copiar AGENTS.md a GEMINI.md
    if [ -f "$REPO_ROOT/AGENTS.md" ]; then
        cp "$REPO_ROOT/AGENTS.md" "$target/GEMINI.md"
        echo -e "${GREEN}  ✓ GEMINI.md actualizado${NC}"
    fi
}

setup_codex() {
    echo -e "${BLUE}Configurando Codex (OpenAI)...${NC}"
    local target="$REPO_ROOT/.codex"

    mkdir -p "$target"

    # Symlink a skills
    if [ -L "$target/skills" ]; then
        rm "$target/skills"
    elif [ -d "$target/skills" ]; then
        mv "$target/skills" "$target/skills.backup.$(date +%s)"
    fi

    ln -s "$SKILLS_SOURCE" "$target/skills"
    echo -e "${GREEN}  ✓ .codex/skills → skills/${NC}"

    # Codex usa AGENTS.md nativo (no necesita copia)
    echo -e "${GREEN}  ✓ Codex usa AGENTS.md nativo${NC}"
}

setup_warp() {
    echo -e "${BLUE}Configurando Warp Terminal...${NC}"
    local target="$REPO_ROOT/.warp"

    mkdir -p "$target"

    # Symlink a skills
    if [ -L "$target/skills" ]; then
        rm "$target/skills"
    elif [ -d "$target/skills" ]; then
        mv "$target/skills" "$target/skills.backup.$(date +%s)"
    fi

    ln -s "$SKILLS_SOURCE" "$target/skills"
    echo -e "${GREEN}  ✓ .warp/skills → skills/${NC}"

    # Copiar AGENTS.md a WARP.md
    if [ -f "$REPO_ROOT/AGENTS.md" ]; then
        cp "$REPO_ROOT/AGENTS.md" "$target/WARP.md"
        echo -e "${GREEN}  ✓ WARP.md actualizado${NC}"
    fi
}

# =============================================================================
# MAIN
# =============================================================================

main() {
    echo -e "${BOLD}${CYAN}Agent Skills - Setup Sync${NC}"
    echo ""

    check_skills_exist

    # Parse args
    if [ $# -eq 0 ]; then
        show_menu
    else
        for arg in "$@"; do
            case $arg in
                --all)
                    SETUP_CLAUDE=true
                    SETUP_COPILOT=true
                    SETUP_CURSOR=true
                    SETUP_GEMINI=true
                    SETUP_CODEX=true
                    SETUP_WARP=true
                    ;;
                --claude) SETUP_CLAUDE=true ;;
                --copilot) SETUP_COPILOT=true ;;
                --cursor) SETUP_CURSOR=true ;;
                --gemini) SETUP_GEMINI=true ;;
                --codex) SETUP_CODEX=true ;;
                --warp) SETUP_WARP=true ;;
                --help) show_help; exit 0 ;;
                *) echo -e "${RED}Opción desconocida: $arg${NC}"; show_help; exit 1 ;;
            esac
        done
    fi

    # Verificar que al menos uno esté seleccionado
    if [ "$SETUP_CLAUDE" = false ] && \
       [ "$SETUP_COPILOT" = false ] && \
       [ "$SETUP_CURSOR" = false ] && \
       [ "$SETUP_GEMINI" = false ] && \
       [ "$SETUP_CODEX" = false ] && \
       [ "$SETUP_WARP" = false ]; then
        echo -e "${YELLOW}No se seleccionó ningún IDE. Saliendo.${NC}"
        exit 0
    fi

    echo ""
    echo -e "${BOLD}Configurando IDEs...${NC}"
    echo ""

    [ "$SETUP_CLAUDE" = true ] && setup_claude
    [ "$SETUP_COPILOT" = true ] && setup_copilot
    [ "$SETUP_CURSOR" = true ] && setup_cursor
    [ "$SETUP_GEMINI" = true ] && setup_gemini
    [ "$SETUP_CODEX" = true ] && setup_codex
    [ "$SETUP_WARP" = true ] && setup_warp

    echo ""
    echo -e "${GREEN}${BOLD}✅ Setup completado!${NC}"
    echo ""
    echo -e "${CYAN}Próximos pasos:${NC}"
    echo "  1. Reiniciar tu IDE/editor"
    echo "  2. Las skills deberían estar disponibles automáticamente"
    echo "  3. Ejecutá 'node src/cli.js skill-sync' para regenerar bloques"
    echo ""
}

main "$@"
