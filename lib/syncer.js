import { existsSync, cpSync, mkdirSync, symlinkSync, unlinkSync, lstatSync, rmSync } from 'fs';
import { join, relative } from 'path';

const isWindows = process.platform === 'win32';

/**
 * Sincroniza configuración a todos los IDEs soportados
 * @param {string} projectPath - Ruta del proyecto
 * @param {object} options - Opciones
 * @param {boolean} options.useSymlinks - Usar symlinks (default: false en Windows)
 * @param {string[]} options.only - Solo estos IDEs
 */
export async function syncToAllIDEs(projectPath, options = {}) {
  const skillsDir = join(projectPath, 'skills');
  const agentsMd = join(projectPath, 'AGENTS.md');
  
  const useSymlinks = options.useSymlinks ?? !isWindows;
  const onlyIDEs = options.only || null;
  
  if (!existsSync(agentsMd)) {
    console.log('⚠️  No se encontró AGENTS.md. Ejecuta `agent-auto init` primero.');
    return;
  }

  console.log(`📋 Modo: ${useSymlinks ? 'symlinks' : 'copia'}\n`);

  const ides = [
    { name: 'claude', fn: () => syncToClaude(projectPath, skillsDir, agentsMd, useSymlinks) },
    { name: 'copilot', fn: () => syncToCopilot(projectPath, skillsDir, agentsMd, useSymlinks) },
    { name: 'codex', fn: () => syncToCodex(projectPath, skillsDir, agentsMd, useSymlinks) },
    { name: 'gemini', fn: () => syncToGemini(projectPath, agentsMd, useSymlinks) },
    { name: 'cursor', fn: () => syncToCursor(projectPath, agentsMd, useSymlinks) },
    { name: 'warp', fn: () => syncToWarp(projectPath, agentsMd, useSymlinks) },
  ];

  for (const ide of ides) {
    if (onlyIDEs && !onlyIDEs.includes(ide.name)) continue;
    try {
      await ide.fn();
    } catch (err) {
      console.log(`    ⚠️ Error: ${err.message}`);
    }
  }
}

// ============ Funciones de sincronización por IDE ============

async function syncToClaude(projectPath, skillsDir, agentsMd, useSymlinks) {
  console.log('  → Claude Code...');
  
  const claudeDir = join(projectPath, '.claude');
  ensureDir(claudeDir);
  
  // CLAUDE.md en raíz
  syncFile(agentsMd, join(projectPath, 'CLAUDE.md'), useSymlinks);
  
  // Skills en .claude/skills/
  if (existsSync(skillsDir)) {
    syncDir(skillsDir, join(claudeDir, 'skills'), useSymlinks);
  }
  
  console.log('    ✓ .claude/ y CLAUDE.md');
}

async function syncToCopilot(projectPath, skillsDir, agentsMd, useSymlinks) {
  console.log('  → GitHub Copilot...');
  
  const githubDir = join(projectPath, '.github');
  ensureDir(githubDir);
  
  // copilot-instructions.md
  syncFile(agentsMd, join(githubDir, 'copilot-instructions.md'), useSymlinks);
  
  // Skills en .github/skills/
  if (existsSync(skillsDir)) {
    syncDir(skillsDir, join(githubDir, 'skills'), useSymlinks);
  }
  
  console.log('    ✓ .github/copilot-instructions.md y skills/');
}

async function syncToCodex(projectPath, skillsDir, agentsMd, useSymlinks) {
  console.log('  → OpenAI Codex...');
  
  const codexDir = join(projectPath, '.codex');
  ensureDir(codexDir);
  
  // AGENTS.md en .codex/
  syncFile(agentsMd, join(codexDir, 'AGENTS.md'), useSymlinks);
  
  // Skills
  if (existsSync(skillsDir)) {
    syncDir(skillsDir, join(codexDir, 'skills'), useSymlinks);
  }
  
  console.log('    ✓ .codex/');
}

async function syncToGemini(projectPath, agentsMd, useSymlinks) {
  console.log('  → Google Gemini...');
  
  // GEMINI.md en raíz
  syncFile(agentsMd, join(projectPath, 'GEMINI.md'), useSymlinks);
  
  console.log('    ✓ GEMINI.md');
}

async function syncToCursor(projectPath, agentsMd, useSymlinks) {
  console.log('  → Cursor...');
  
  const cursorDir = join(projectPath, '.cursor');
  ensureDir(cursorDir);
  
  // .cursorrules en raíz (formato preferido por Cursor)
  syncFile(agentsMd, join(projectPath, '.cursorrules'), useSymlinks);
  
  // También rules.md en .cursor/
  syncFile(agentsMd, join(cursorDir, 'rules.md'), useSymlinks);
  
  console.log('    ✓ .cursorrules y .cursor/rules.md');
}

async function syncToWarp(projectPath, agentsMd, useSymlinks) {
  console.log('  → Warp AI...');
  
  const warpDir = join(projectPath, '.warp');
  ensureDir(warpDir);
  
  // Warp usa .warp/rules.md
  syncFile(agentsMd, join(warpDir, 'rules.md'), useSymlinks);
  
  console.log('    ✓ .warp/rules.md');
}

// ============ Funciones utilitarias ============

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function removeIfExists(path) {
  if (existsSync(path)) {
    try {
      const stat = lstatSync(path);
      if (stat.isSymbolicLink() || stat.isFile()) {
        unlinkSync(path);
      } else if (stat.isDirectory()) {
        rmSync(path, { recursive: true, force: true });
      }
    } catch (e) {
      // Ignorar errores de permisos
    }
  }
}

function syncFile(source, dest, useSymlinks) {
  removeIfExists(dest);
  
  if (useSymlinks) {
    try {
      symlinkSync(source, dest);
    } catch (err) {
      // Fallback a copia si symlink falla (ej: Windows sin admin)
      cpSync(source, dest);
    }
  } else {
    cpSync(source, dest);
  }
}

function syncDir(source, dest, useSymlinks) {
  removeIfExists(dest);
  
  if (useSymlinks) {
    try {
      symlinkSync(source, dest, 'junction'); // junction funciona sin admin en Windows
    } catch (err) {
      // Fallback a copia
      ensureDir(dest);
      cpSync(source, dest, { recursive: true });
    }
  } else {
    ensureDir(dest);
    cpSync(source, dest, { recursive: true });
  }
}

/**
 * Lista IDEs soportados
 */
export function getSupportedIDEs() {
  return ['claude', 'copilot', 'codex', 'gemini', 'cursor', 'warp'];
}
