import { existsSync, cpSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * Sincroniza configuración a todos los IDEs soportados
 */
export async function syncToAllIDEs(projectPath) {
  const skillsDir = join(projectPath, 'skills');
  const agentsMd = join(projectPath, 'AGENTS.md');
  
  if (!existsSync(agentsMd)) {
    console.log('⚠️  No se encontró AGENTS.md. Ejecuta `agent-auto init` primero.');
    return;
  }

  // Sincronizar a Claude Code
  await syncToClaude(projectPath, skillsDir, agentsMd);
  
  // Sincronizar a GitHub Copilot
  await syncToCopilot(projectPath, skillsDir, agentsMd);
  
  // Sincronizar a Codex
  await syncToCodex(projectPath, skillsDir, agentsMd);
  
  // Sincronizar a Gemini
  await syncToGemini(projectPath, agentsMd);
  
  // Sincronizar a Cursor
  await syncToCursor(projectPath, agentsMd);
}

async function syncToClaude(projectPath, skillsDir, agentsMd) {
  console.log('  → Claude Code...');
  
  const claudeDir = join(projectPath, '.claude');
  ensureDir(claudeDir);
  
  // Copiar AGENTS.md como CLAUDE.md (raíz) y dentro de .claude/
  cpSync(agentsMd, join(projectPath, 'CLAUDE.md'));
  
  // Copiar skills a .claude/skills/
  if (existsSync(skillsDir)) {
    const claudeSkills = join(claudeDir, 'skills');
    ensureDir(claudeSkills);
    cpSync(skillsDir, claudeSkills, { recursive: true });
  }
  
  console.log('    ✓ .claude/ y CLAUDE.md');
}

async function syncToCopilot(projectPath, skillsDir, agentsMd) {
  console.log('  → GitHub Copilot...');
  
  const githubDir = join(projectPath, '.github');
  ensureDir(githubDir);
  
  // Copiar como copilot-instructions.md
  cpSync(agentsMd, join(githubDir, 'copilot-instructions.md'));
  
  // Copiar skills a .github/skills/
  if (existsSync(skillsDir)) {
    const copilotSkills = join(githubDir, 'skills');
    ensureDir(copilotSkills);
    cpSync(skillsDir, copilotSkills, { recursive: true });
  }
  
  console.log('    ✓ .github/copilot-instructions.md y skills/');
}

async function syncToCodex(projectPath, skillsDir, agentsMd) {
  console.log('  → OpenAI Codex...');
  
  const codexDir = join(projectPath, '.codex');
  ensureDir(codexDir);
  
  // Codex usa AGENTS.md directamente, pero también soporta .codex/
  cpSync(agentsMd, join(codexDir, 'AGENTS.md'));
  
  // Copiar skills
  if (existsSync(skillsDir)) {
    const codexSkills = join(codexDir, 'skills');
    ensureDir(codexSkills);
    cpSync(skillsDir, codexSkills, { recursive: true });
  }
  
  console.log('    ✓ .codex/');
}

async function syncToGemini(projectPath, agentsMd) {
  console.log('  → Google Gemini...');
  
  // Gemini usa GEMINI.md
  cpSync(agentsMd, join(projectPath, 'GEMINI.md'));
  
  console.log('    ✓ GEMINI.md');
}

async function syncToCursor(projectPath, agentsMd) {
  console.log('  → Cursor...');
  
  const cursorDir = join(projectPath, '.cursor');
  ensureDir(cursorDir);
  
  // Cursor usa .cursorrules o .cursor/rules
  cpSync(agentsMd, join(cursorDir, 'rules.md'));
  
  console.log('    ✓ .cursor/rules.md');
}

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}
