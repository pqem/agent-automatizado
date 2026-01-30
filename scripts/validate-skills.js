#!/usr/bin/env node
/**
 * Validador de skills - verifica estructura, frontmatter, y duplicados
 * 
 * Uso:
 *   node scripts/validate-skills.js [skillsDir]
 *   node scripts/validate-skills.js              # usa ./skills
 *   node scripts/validate-skills.js ../skills    # custom path
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import yaml from 'js-yaml';

const SKILL_FILENAME = 'SKILL.md';

// Colores para output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

const errors = [];
const warnings = [];

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function findSkillFiles(dir) {
  const results = [];
  
  if (!existsSync(dir)) {
    return results;
  }
  
  const entries = readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      results.push(...findSkillFiles(fullPath));
    } else if (entry.isFile() && entry.name === SKILL_FILENAME) {
      results.push(fullPath);
    }
  }
  
  return results;
}

function parseFrontmatter(content, filePath) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  
  if (!match) {
    errors.push(`${filePath}: Sin frontmatter YAML (debe empezar con ---)`);
    return null;
  }
  
  try {
    const data = yaml.load(match[1]);
    return { data, body: content.slice(match[0].length) };
  } catch (e) {
    errors.push(`${filePath}: YAML inválido - ${e.message}`);
    return null;
  }
}

function validateFrontmatter(data, filePath) {
  // Campos obligatorios
  const required = ['name', 'description'];
  
  for (const field of required) {
    if (!data[field]) {
      errors.push(`${filePath}: Campo obligatorio faltante: '${field}'`);
    }
  }
  
  // Validar name (lowercase, sin espacios)
  if (data.name) {
    if (data.name !== data.name.toLowerCase()) {
      warnings.push(`${filePath}: 'name' debería estar en lowercase: '${data.name}'`);
    }
    if (/\s/.test(data.name)) {
      errors.push(`${filePath}: 'name' no puede contener espacios: '${data.name}'`);
    }
  }
  
  // Validar scope
  if (data.scope) {
    const validScopes = ['root', 'global'];
    const scope = Array.isArray(data.scope) ? data.scope : [data.scope];
    
    for (const s of scope) {
      if (!validScopes.includes(s) && !/^[a-z-]+$/.test(s)) {
        warnings.push(`${filePath}: scope inusual: '${s}' (esperado: root, global, o nombre de componente)`);
      }
    }
  }
  
  // Validar auto_invoke
  const autoInvoke = data['metadata.auto_invoke'] || data.metadata?.auto_invoke;
  
  if (autoInvoke) {
    if (!Array.isArray(autoInvoke)) {
      errors.push(`${filePath}: metadata.auto_invoke debe ser array, recibido: ${typeof autoInvoke}`);
    } else if (autoInvoke.length === 0) {
      warnings.push(`${filePath}: metadata.auto_invoke está vacío`);
    }
  } else {
    warnings.push(`${filePath}: Sin triggers auto_invoke definidos`);
  }
  
  // Validar allowed_tools
  const allowedTools = data.allowed_tools || data.tools;
  
  if (allowedTools) {
    if (!Array.isArray(allowedTools)) {
      errors.push(`${filePath}: allowed_tools debe ser array`);
    }
  } else {
    warnings.push(`${filePath}: Sin allowed_tools definido`);
  }
  
  // Validar description no muy corta
  if (data.description && data.description.length < 20) {
    warnings.push(`${filePath}: description muy corta (${data.description.length} chars)`);
  }
}

function validateBody(body, filePath) {
  if (body.trim().length < 100) {
    warnings.push(`${filePath}: Contenido muy corto (${body.trim().length} chars)`);
  }
  
  // Verificar que tenga al menos un heading
  if (!/^#+ /m.test(body)) {
    warnings.push(`${filePath}: Sin headings markdown en el contenido`);
  }
}

function validateSkillFile(filePath, skillsDir) {
  const relPath = relative(skillsDir, filePath);
  
  // Leer archivo
  let content;
  try {
    content = readFileSync(filePath, 'utf8');
  } catch (e) {
    errors.push(`${relPath}: No se pudo leer - ${e.message}`);
    return null;
  }
  
  // Parsear frontmatter
  const parsed = parseFrontmatter(content, relPath);
  if (!parsed) return null;
  
  const { data, body } = parsed;
  
  // Validar frontmatter
  validateFrontmatter(data, relPath);
  
  // Validar body
  validateBody(body, relPath);
  
  // Extraer datos para validación cross-skill
  const autoInvokeRaw = data['metadata.auto_invoke'] || data.metadata?.auto_invoke;
  const autoInvoke = Array.isArray(autoInvokeRaw) ? autoInvokeRaw : [];
  
  return {
    path: relPath,
    name: data.name,
    autoInvoke,
  };
}

function validateCrossSkills(skills) {
  const namesSeen = new Set();
  const triggerMap = new Map(); // trigger -> [skills que lo usan]
  
  for (const skill of skills) {
    if (!skill) continue;
    
    // Duplicar nombres
    if (namesSeen.has(skill.name)) {
      errors.push(`Nombre duplicado: '${skill.name}' aparece múltiples veces`);
    }
    namesSeen.add(skill.name);
    
    // Triggers duplicados
    for (const trigger of skill.autoInvoke) {
      if (!triggerMap.has(trigger)) {
        triggerMap.set(trigger, []);
      }
      triggerMap.get(trigger).push(skill.name);
    }
  }
  
  // Reportar triggers duplicados
  for (const [trigger, skillNames] of triggerMap.entries()) {
    if (skillNames.length > 1) {
      warnings.push(`Trigger duplicado: '${trigger}' en skills: ${skillNames.join(', ')}`);
    }
  }
}

function validateSkillsDir(skillsDir) {
  if (!existsSync(skillsDir)) {
    log(`✗ Directorio no encontrado: ${skillsDir}`, 'red');
    process.exit(1);
  }
  
  if (!statSync(skillsDir).isDirectory()) {
    log(`✗ No es un directorio: ${skillsDir}`, 'red');
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  const skillsDir = args[0] || 'skills';
  
  log(`\n${'='.repeat(60)}`, 'blue');
  log('Validador de Skills', 'bold');
  log(`${'='.repeat(60)}\n`, 'blue');
  
  log(`📂 Directorio: ${skillsDir}\n`);
  
  validateSkillsDir(skillsDir);
  
  // Buscar skills
  const skillFiles = findSkillFiles(skillsDir);
  
  if (skillFiles.length === 0) {
    log(`⚠️  No se encontraron archivos ${SKILL_FILENAME}`, 'yellow');
    process.exit(0);
  }
  
  log(`🔍 Encontradas ${skillFiles.length} skills\n`);
  
  // Validar cada skill
  const skills = skillFiles.map(file => validateSkillFile(file, skillsDir));
  
  // Validación cross-skills
  validateCrossSkills(skills.filter(Boolean));
  
  // Reporte
  log(`\n${'='.repeat(60)}`, 'blue');
  log('Resultado', 'bold');
  log(`${'='.repeat(60)}\n`, 'blue');
  
  if (errors.length === 0 && warnings.length === 0) {
    log('✅ Todas las skills son válidas!', 'green');
    log(`   ${skillFiles.length} skills verificadas sin problemas\n`);
    process.exit(0);
  }
  
  if (errors.length > 0) {
    log(`❌ Errores: ${errors.length}`, 'red');
    for (const error of errors) {
      log(`   • ${error}`, 'red');
    }
    log('');
  }
  
  if (warnings.length > 0) {
    log(`⚠️  Warnings: ${warnings.length}`, 'yellow');
    for (const warning of warnings) {
      log(`   • ${warning}`, 'yellow');
    }
    log('');
  }
  
  // Exit code
  if (errors.length > 0) {
    log('Validación fallida. Corregí los errores antes de continuar.\n', 'red');
    process.exit(1);
  } else {
    log('Validación exitosa con warnings menores.\n', 'green');
    process.exit(0);
  }
}

main();
