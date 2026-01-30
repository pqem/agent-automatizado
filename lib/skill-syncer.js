import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, relative, basename, dirname } from 'path';

const SKILL_FILENAME = 'SKILL.md';
const SKILL_SYNC_START = '<!-- SKILL-SYNC:START -->';
const SKILL_SYNC_END = '<!-- SKILL-SYNC:END -->';

export async function syncSkills(projectPath) {
  const skillsDir = join(projectPath, 'skills');
  const rootAgentsPath = join(projectPath, 'AGENTS.md');

  if (!existsSync(skillsDir)) {
    console.log('⚠️  No se encontró /skills. No hay skills para sincronizar.');
    return;
  }

  const skills = loadSkills(skillsDir);
  if (skills.length === 0) {
    console.log('⚠️  No se encontraron SKILL.md válidos.');
    return;
  }

  ensureAgentsFile(rootAgentsPath, basename(projectPath));
  syncAgentsFile(rootAgentsPath, skills, skillsDir, null);

  const components = detectComponents(projectPath);
  if (components.length === 0) {
    console.log('✅ skill-sync completado (single repo).');
    return;
  }

  for (const component of components) {
    ensureAgentsFile(component.agentsPath, component.name);
    syncAgentsFile(component.agentsPath, skills, skillsDir, component.scope);
  }

  console.log(`✅ skill-sync completado (${components.length} componentes).`);
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

function syncAgentsFile(agentsPath, skills, skillsDir, scope) {
  const content = readFileSync(agentsPath, 'utf8');
  const filteredSkills = filterSkillsForScope(skills, scope);
  const relativeSkillsDir = toPosixPath(relative(dirname(agentsPath), skillsDir));
  const block = buildSkillSyncBlock(filteredSkills, relativeSkillsDir, scope);
  const updated = upsertBlock(content, block);
  writeFileSync(agentsPath, updated);
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

  const scope = frontmatter.data.scope || 'global';
  const allowedTools = normalizeArray(frontmatter.data.allowed_tools || frontmatter.data.tools);
  const autoInvokeRaw = frontmatter.data['metadata.auto_invoke'] ?? frontmatter.data?.metadata?.auto_invoke;
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

  const data = parseKeyValues(match[1]);
  return { data, body: content.slice(match[0].length) };
}

function parseKeyValues(raw) {
  const data = {};
  const lines = raw.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = line.match(/^\s*([\w.-]+)\s*:\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    const value = parseValue(match[2]);
    setNestedValue(data, key, value);
  }

  return data;
}

function parseValue(value) {
  if (value === '') return '';
  const trimmed = value.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .map(item => stripQuotes(item.trim()))
      .filter(Boolean);
  }
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  return stripQuotes(trimmed);
}

function stripQuotes(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function setNestedValue(target, key, value) {
  const parts = key.split('.');
  let current = target;
  parts.forEach((part, index) => {
    if (index === parts.length - 1) {
      current[part] = value;
      return;
    }
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  });
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
