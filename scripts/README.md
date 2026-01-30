# Setup Scripts

## setup.sh

Sincroniza skills y AGENTS.md a múltiples IDEs y editores.

### IDEs soportados

- **Claude** (Desktop / Code) → `.claude/`
- **GitHub Copilot** → `.github/copilot-instructions.md`
- **Cursor** → `.cursor/`
- **Gemini CLI** → `.gemini/`
- **Codex** (OpenAI) → `.codex/`
- **Warp Terminal** → `.warp/`

### Uso

**Configurar todos los IDEs:**
```bash
./scripts/setup.sh --all
```

**Configurar IDEs específicos:**
```bash
./scripts/setup.sh --claude --cursor
./scripts/setup.sh --copilot
```

**Modo interactivo:**
```bash
./scripts/setup.sh
# Menú con checkboxes (requiere terminal interactivo)
```

**Ver ayuda:**
```bash
./scripts/setup.sh --help
```

### Qué hace

Para cada IDE seleccionado:

1. **Crea symlink** `.<ide>/skills` → `skills/`
   - Todas las skills se comparten (single source of truth)
   - Cambios en `skills/` se reflejan en todos los IDEs

2. **Copia AGENTS.md** a archivo específico del IDE
   - Claude: `CLAUDE.md`
   - Cursor: `CURSOR.md`
   - Gemini: `GEMINI.md`
   - Copilot: `.github/copilot-instructions.md`
   - Warp: `WARP.md`
   - Codex: usa `AGENTS.md` nativo

### Workflow recomendado

1. **Editar skills en `skills/`**
   ```bash
   vim skills/commits/SKILL.md
   ```

2. **Regenerar bloques en AGENTS.md**
   ```bash
   node src/cli.js skill-sync
   ```

3. **Re-sincronizar a IDEs**
   ```bash
   ./scripts/setup.sh --all
   ```

4. **Reiniciar IDE** para cargar cambios

### Ejemplo completo

```bash
# Proyecto nuevo
cd mi-proyecto
node /path/to/agent-automatizado/src/cli.js init

# Sincronizar a Claude y Cursor
/path/to/agent-automatizado/scripts/setup.sh --claude --cursor

# Ver que se creó
ls -la .claude/ .cursor/

# Resultado:
# .claude/skills → skills/
# .claude/CLAUDE.md
# .cursor/skills → skills/
# .cursor/CURSOR.md
```

### Troubleshooting

**Error: "No se encontró carpeta skills/"**
- Ejecutá `node src/cli.js init` primero
- O verificá que estés en el directorio correcto

**Symlink no funciona**
- Algunos sistemas (Windows sin WSL) no soportan symlinks
- Solución: copiar en vez de symlink (modificar script)

**Skills no se actualizan en el IDE**
- Reiniciar IDE/editor
- Verificar que symlink apunta a la ubicación correcta: `readlink .claude/skills`

**Copilot no detecta las instrucciones**
- Verificar `.github/copilot-instructions.md` existe
- Puede requerir reload de ventana en VSCode

### Customización

El script puede editarse para:
- Cambiar ubicaciones de destino
- Agregar más IDEs
- Usar copias en vez de symlinks
- Agregar validaciones pre-sync

Ver código en `scripts/setup.sh` para detalles.
