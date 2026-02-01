import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, relative, basename, dirname } from 'path';
import yaml from 'js-yaml';
import { logger } from './logger.js';

const SKILL_FILENAME = 'SKILL.md';
const SKILL_SYNC_START = '<!-- SKILL-SYNC:START -->';
const SKILL_SYNC_END = '<!-- SKILL-SYNC:END -->';

export async function syncSkills(projectPath, options = {}) {
  const { check = false, dryRun = false, verbose = false } = options;
  const skillsDir = join(projectPath, 'skills');
  const rootAgentsPath = join(projectPath, 'AGENTS.md');

  const results = {
    synced: [],
    skipped: [],
    outOfSync: [],
    errors: []
  };

  if (!existsSync(skillsDir)) {
    logger.warn('No se encontró /skills. No hay skills para sincronizar.');
    return results;
  }

  const skills = loadSkills(skillsDir);
  if (skills.length === 0) {
    logger.warn('No se encontraron SKILL.md válidos.');
    return results;
  }

  // Sync root AGENTS.md
  if (!check && !dryRun) {
    ensureAgentsFile(rootAgentsPath, basename(projectPath));
  }
  const rootResult = syncAgentsFile(rootAgentsPath, skills, skillsDir, null, { check, dryRun, verbose });
  mergeResults(results, rootResult, 'root');

  // Sync component AGENTS.md files
  const components = detectComponents(projectPath);
  for (const component of components) {
    if (!check && !dryRun) {
      ensureAgentsFile(component.agentsPath, component.name);
    }
    const compResult = syncAgentsFile(component.agentsPath, skills, skillsDir, component.scope, { check, dryRun, verbose });
    mergeResults(results, compResult, component.name);
  }

  // Report results
  if (check) {
    if (results.outOfSync.length === 0) {
      logger.success('Todos los AGENTS.md están sincronizados.');
    } else {
      logger.error('AGENTS.md desincronizados:\n');
      results.outOfSync.forEach(item => logger.plain(`   • ${item}`));
      logger.plain('\nEjecuta: node src/cli.js skill-sync');
    }
  } else if (dryRun) {
    logger.log('📋', 'Dry run completado (no se escribieron archivos)');
    if (results.synced.length > 0) {
      logger.plain('\nSe actualizarían:');
      results.synced.forEach(item => logger.plain(`   • ${item}`));
    }
  } else {
    const total = components.length === 0 ? 'single repo' : `${components.length} componentes`;
    logger.success(`skill-sync completado (${total}).`);
  }

  return results;
}

function mergeResults(results, itemResult, name) {
  if (itemResult.status === 'synced') {
    results.synced.push(name);
  } else if (itemResult.status === 'skipped') {
    results.skipped.push(name);
  } else if (itemResult.status === 'outOfSync') {
    results.outOfSync.push(name);
  }
}

function detectComponents(projectPath) {
  const roots = ['apps', 'packages', 'services'];
  const components = [];
  const seen = new Set();

  for (const root of roots) {
    const rootPath = join(projectPath, root);
    if (!existsSync(rootPath)) continue;

    const entries = readdirSync(rootPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const componentPath = join(rootPath, entry.name);
      if (!existsSync(join(componentPath, 'package.json'))) continue;
      if (seen.has(componentPath)) continue;
      seen.add(componentPath);

      components.push({
        name: entry.name,
        scope: entry.name,
        path: componentPath,
        agentsPath: join(componentPath, 'AGENTS.md'),
      });
    }
  }

  return components;
}

function ensureAgentsFile(agentsPath, title) {
  if (existsSync(agentsPath)) return;
  const content = `# ${title}\n\nContrato de agente para ${title}.\n`;
  writeFileSync(agentsPath, content);
}

function syncAgentsFile(agentsPath, skills, skillsDir, scope, options = {}) {
  const { check = false, dryRun = false, verbose = false } = options;

  // If file doesn't exist and we're in check mode, it's out of sync
  if (!existsSync(agentsPath)) {
    return { status: 'outOfSync' };
  }

  const content = readFileSync(agentsPath, 'utf8');
  const filteredSkills = filterSkillsForScope(skills, scope);
  const relativeSkillsDir = toPosixPath(relative(dirname(agentsPath), skillsDir));
  const block = buildSkillSyncBlock(filteredSkills, relativeSkillsDir, scope);
  const updated = upsertBlock(content, block);

  // Check if content changed
  if (content === updated) {
    if (verbose) {
      logger.debug(`${agentsPath}: ya sincronizado`);
    }
    return { status: 'skipped' };
  }

  // Check mode: report out of sync
  if (check) {
    return { status: 'outOfSync' };
  }

  // Dry run: report what would change
  if (dryRun) {
    if (verbose) {
      logger.log('📝', `${agentsPath}: se actualizaría`);
    }
    return { status: 'synced' };
  }

  // Actually write the file
  writeFileSync(agentsPath, updated);
  if (verbose) {
    logger.success(`${agentsPath}: actualizado`);
  }
  return { status: 'synced' };
}

function filterSkillsForScope(skills, scope) {
  if (!scope) return skills;
  return skills.filter(skill => isGlobalScope(skill.scope) || skill.scope === scope);
}

function isGlobalScope(scope) {
  return !scope || scope === 'global' || scope === 'root';
}

function loadSkills(skillsDir) {
  const skillFiles = findSkillFiles(skillsDir);
  return skillFiles
    .map(filePath => parseSkillFile(filePath))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function findSkillFiles(dir) {
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findSkillFiles(entryPath));
    } else if (entry.isFile() && entry.name === SKILL_FILENAME) {
      results.push(entryPath);
    }
  }

  return results;
}

function parseSkillFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const frontmatter = parseFrontmatter(content);

  if (!frontmatter.data.name) return null;

  // Soportar scope como string o array
  let scope = frontmatter.data.scope || 'global';
  if (Array.isArray(scope)) {
    scope = scope.length === 1 ? scope[0] : 'root';
  }

  // Soportar allowed_tools o tools
  const allowedTools = normalizeArray(frontmatter.data.allowed_tools || frontmatter.data.tools);
  
  // Soportar metadata.auto_invoke como dot notation o anidado
  let autoInvokeRaw = frontmatter.data['metadata.auto_invoke'];
  if (!autoInvokeRaw && frontmatter.data.metadata?.auto_invoke) {
    autoInvokeRaw = frontmatter.data.metadata.auto_invoke;
  }
  const autoInvoke = normalizeArray(autoInvokeRaw);

  return {
    name: frontmatter.data.name,
    description: frontmatter.data.description || '',
    scope,
    allowedTools,
    autoInvoke,
    filePath,
  };
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) {
    return { data: {}, body: content };
  }

  try {
    const data = yaml.load(match[1]) || {};
    return { data, body: content.slice(match[0].length) };
  } catch (e) {
    logger.warn(`YAML parse error: ${e.message}`);
    return { data: {}, body: content };
  }
}

function normalizeArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === true) return ['(auto)'];
  return [String(value)];
}

function buildSkillSyncBlock(skills, relativeSkillsDir, scope) {
  const skillsReference = buildSkillsReference(skills, relativeSkillsDir, scope);
  const autoInvoke = buildAutoInvoke(skills);

  return [
    SKILL_SYNC_START,
    '## Skills Reference',
    ...skillsReference,
    '',
    '## Auto-invoke Skills',
    ...autoInvoke,
    SKILL_SYNC_END,
  ].join('\n');
}

function buildSkillsReference(skills, relativeSkillsDir, scope) {
  if (skills.length === 0) {
    return ['- (Sin skills para este scope)'];
  }

  return skills.map(skill => {
    const link = `${relativeSkillsDir}/${skill.name}/${SKILL_FILENAME}`.replace(/\\/g, '/');
    const tools = skill.allowedTools.length ? ` (tools: ${skill.allowedTools.join(', ')})` : '';
    const description = skill.description ? ` - ${skill.description}` : '';
    const scopeLabel = scope ? '' : ` (scope: ${skill.scope || 'global'})`;
    return `- [${skill.name}](${link})${description}${tools}${scopeLabel}`;
  });
}

function buildAutoInvoke(skills) {
  const autoSkills = skills.filter(skill => skill.autoInvoke.length > 0);
  if (autoSkills.length === 0) {
    return ['(Sin skills auto-invocadas)'];
  }

  // Expandir: cada trigger es una fila
  const rows = [];
  for (const skill of autoSkills) {
    for (const trigger of skill.autoInvoke) {
      rows.push({ action: trigger, skill: skill.name });
    }
  }

  // Ordenar alfabéticamente por acción
  rows.sort((a, b) => a.action.localeCompare(b.action));

  // Generar tabla markdown
  const table = [
    '| Acción | Skill |',
    '|--------|-------|',
    ...rows.map(row => `| ${row.action} | \`${row.skill}\` |`)
  ];

  return table;
}

function upsertBlock(content, block) {
  const blockRegex = new RegExp(`${escapeRegExp(SKILL_SYNC_START)}[\\s\\S]*?${escapeRegExp(SKILL_SYNC_END)}\n?`, 'm');
  if (blockRegex.test(content)) {
    return content.replace(blockRegex, `${block}\n`);
  }

  const insertIndex = findInsertIndex(content);
  const before = content.slice(0, insertIndex).trimEnd();
  const after = content.slice(insertIndex).trimStart();
  const pieces = [];
  if (before) pieces.push(before);
  pieces.push(block);
  if (after) pieces.push(after);
  return `${pieces.join('\n\n')}\n`;
}

function findInsertIndex(content) {
  if (!content.trim()) return 0;
  const lines = content.split(/\r?\n/);
  let index = 0;

  if (lines[0].startsWith('#')) {
    index = 1;
    while (index < lines.length && lines[index].trim() === '') {
      index += 1;
    }
    while (index < lines.length && lines[index].trim() !== '') {
      index += 1;
    }
  }

  return lines.slice(0, index).join('\n').length;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toPosixPath(value) {
  return value.replace(/\\/g, '/');
}
