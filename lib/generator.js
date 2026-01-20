import { existsSync, readFileSync, writeFileSync, mkdirSync, cpSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEMPLATES_DIR = join(__dirname, '..', 'templates');

/**
 * Genera entorno desde el wizard interactivo
 */
export async function generateFromWizard(targetPath, selections) {
  const { tipo, plataforma, datos, nivel, descripcion } = selections;
  
  // Determinar template y stack basado en selecciones
  const config = determineStack(tipo, plataforma, datos, nivel);
  
  // Generar AGENTS.md
  await generateAgentsMd(targetPath, {
    projectName: getProjectName(targetPath),
    description: descripcion,
    level: nivel,
    ...config,
  });
  
  // Copiar skills genéricos
  await copyGenericSkills(targetPath);
  
  // Copiar skills específicos según el tipo
  await copyTechSkills(targetPath, config.techSkills);
  
  // Generar configs para IDEs
  await generateIDEConfigs(targetPath);
  
  return config;
}

/**
 * Genera entorno para proyecto existente (detectado)
 */
export async function generateEnvironment(targetPath, projectInfo) {
  const config = {
    projectName: getProjectName(targetPath),
    description: `Proyecto ${projectInfo.type}`,
    level: 'intermediate',
    stack: projectInfo.frameworks.join(', ') || projectInfo.language,
    techSkills: projectInfo.frameworks,
  };
  
  await generateAgentsMd(targetPath, {
    ...config,
    ...projectInfo,
  });
  
  await copyGenericSkills(targetPath);
  await copyTechSkills(targetPath, projectInfo.frameworks);
  await generateIDEConfigs(targetPath);
}

/**
 * Determina stack recomendado según selecciones del wizard
 */
function determineStack(tipo, plataforma, datos, nivel) {
  const config = {
    stack: '',
    database: '',
    techSkills: [],
    template: 'root',
  };

  // Stack según tipo de proyecto
  switch (tipo) {
    case 'web':
      config.stack = nivel === 'beginner' ? 'React + Vite' : 'Next.js';
      config.techSkills = ['react', 'typescript'];
      config.template = 'web';
      break;
    case 'mobile':
      config.stack = 'React Native / Expo';
      config.techSkills = ['react', 'typescript'];
      config.template = 'web';
      break;
    case 'api':
      config.stack = nivel === 'beginner' ? 'Express.js' : 'Fastify / Hono';
      config.techSkills = ['typescript'];
      config.template = 'root';
      break;
    case 'cli':
      config.stack = 'Node.js';
      config.techSkills = ['typescript'];
      config.template = 'root';
      break;
    case 'desktop':
      config.stack = 'Electron / Tauri';
      config.techSkills = ['react', 'typescript'];
      config.template = 'web';
      break;
    default:
      config.stack = 'Por definir';
      config.template = 'root';
  }

  // Base de datos según selección
  switch (datos) {
    case 'cloud':
      config.database = 'Supabase';
      break;
    case 'local':
      config.database = 'SQLite';
      break;
    case 'sql':
      config.database = 'PostgreSQL';
      break;
    case 'nosql':
      config.database = 'MongoDB';
      break;
    default:
      config.database = 'Ninguna';
  }

  return config;
}

/**
 * Genera AGENTS.md desde template
 */
async function generateAgentsMd(targetPath, config) {
  const templatePath = join(TEMPLATES_DIR, 'agents', `${config.template || 'root'}.md`);
  let content = readFileSync(templatePath, 'utf8');
  
  // Reemplazar placeholders
  const replacements = {
    '{{PROJECT_NAME}}': config.projectName || 'Mi Proyecto',
    '{{DESCRIPTION}}': config.description || '',
    '{{STACK}}': config.stack || '',
    '{{DATABASE}}': config.database || 'Ninguna',
    '{{LEVEL}}': getLevelLabel(config.level),
    '{{STRUCTURE}}': config.structure || 'single',
    '{{SKILLS_LIST}}': generateSkillsList(config.techSkills),
    '{{FRONTEND_FRAMEWORK}}': config.stack || 'React',
    '{{STYLING}}': 'Tailwind CSS',
    '{{STATE_MANAGEMENT}}': 'Zustand / useState',
    '{{FRAMEWORK}}': config.stack || 'FastAPI',
  };

  for (const [key, value] of Object.entries(replacements)) {
    content = content.replace(new RegExp(key, 'g'), value);
  }

  // Procesar condicionales de nivel
  content = processLevelConditionals(content, config.level);

  writeFileSync(join(targetPath, 'AGENTS.md'), content);
}

function processLevelConditionals(content, level) {
  // Remover bloques condicionales que no aplican
  const levels = ['beginner', 'intermediate', 'advanced'];
  
  for (const l of levels) {
    const regex = new RegExp(`\\{\\{#if LEVEL_${l.toUpperCase()}\\}\\}([\\s\\S]*?)\\{\\{\\/if\\}\\}`, 'g');
    if (level === l) {
      content = content.replace(regex, '$1');
    } else {
      content = content.replace(regex, '');
    }
  }
  
  // Limpiar placeholder de instrucciones de nivel
  const levelInstructions = {
    beginner: 'El usuario es principiante. Explica cada paso, sugiere buenas prácticas, y pregunta antes de hacer cambios grandes.',
    intermediate: 'El usuario conoce lo básico. Puedes ser más directo pero explica decisiones arquitectónicas.',
    advanced: 'El usuario es experimentado. Sé conciso, ve al grano, solo código y comandos.',
  };
  
  content = content.replace('{{LEVEL_INSTRUCTIONS}}', levelInstructions[level] || '');
  
  return content;
}

function getLevelLabel(level) {
  const labels = {
    beginner: '🌱 Novato',
    intermediate: '🌿 Intermedio',
    advanced: '🌳 Avanzado',
  };
  return labels[level] || level;
}

function generateSkillsList(techSkills = []) {
  const allSkills = ['commits', 'pr', 'docs', ...techSkills];
  return allSkills.map(s => `- \`${s}\``).join('\n');
}

/**
 * Copia skills genéricos al proyecto
 */
async function copyGenericSkills(targetPath) {
  const skillsDir = join(targetPath, 'skills');
  const genericSrc = join(TEMPLATES_DIR, 'skills', 'generic');
  
  if (!existsSync(skillsDir)) {
    mkdirSync(skillsDir, { recursive: true });
  }
  
  // Copiar cada skill genérico
  for (const skill of ['commits', 'pr', 'docs']) {
    const src = join(genericSrc, skill);
    const dest = join(skillsDir, skill);
    if (existsSync(src)) {
      cpSync(src, dest, { recursive: true });
    }
  }
}

/**
 * Copia skills de tecnología específica
 */
async function copyTechSkills(targetPath, techSkills = []) {
  const skillsDir = join(targetPath, 'skills');
  const techSrc = join(TEMPLATES_DIR, 'skills', 'tech');
  
  for (const skill of techSkills) {
    const src = join(techSrc, skill);
    const dest = join(skillsDir, skill);
    if (existsSync(src)) {
      cpSync(src, dest, { recursive: true });
    }
  }
}

/**
 * Genera configuraciones para diferentes IDEs
 */
async function generateIDEConfigs(targetPath) {
  // .claude/
  const claudeDir = join(targetPath, '.claude');
  if (!existsSync(claudeDir)) {
    mkdirSync(claudeDir, { recursive: true });
  }
  
  // Copiar AGENTS.md como CLAUDE.md para Claude Code
  const agentsMd = join(targetPath, 'AGENTS.md');
  if (existsSync(agentsMd)) {
    cpSync(agentsMd, join(targetPath, 'CLAUDE.md'));
  }
  
  // .github/ para Copilot
  const githubDir = join(targetPath, '.github');
  if (!existsSync(githubDir)) {
    mkdirSync(githubDir, { recursive: true });
  }
  
  // Crear copilot-instructions.md
  if (existsSync(agentsMd)) {
    cpSync(agentsMd, join(githubDir, 'copilot-instructions.md'));
  }
  
  // .codex/ para OpenAI Codex
  const codexDir = join(targetPath, '.codex');
  if (!existsSync(codexDir)) {
    mkdirSync(codexDir, { recursive: true });
  }
}

/**
 * Agrega una skill al proyecto
 */
export async function addSkill(targetPath, skillName) {
  const skillsDir = join(targetPath, 'skills');
  const techSrc = join(TEMPLATES_DIR, 'skills', 'tech', skillName);
  const genericSrc = join(TEMPLATES_DIR, 'skills', 'generic', skillName);
  
  const src = existsSync(techSrc) ? techSrc : existsSync(genericSrc) ? genericSrc : null;
  
  if (!src) {
    console.log(`❌ Skill "${skillName}" no encontrado en templates`);
    return false;
  }
  
  const dest = join(skillsDir, skillName);
  cpSync(src, dest, { recursive: true });
  return true;
}

function getProjectName(projectPath) {
  try {
    const pkgPath = join(projectPath, 'package.json');
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      return pkg.name || projectPath.split(/[/\\]/).pop();
    }
  } catch (e) {}
  return projectPath.split(/[/\\]/).pop();
}
