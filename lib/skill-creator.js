import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import inquirer from 'inquirer';

const SKILL_TEMPLATE = `---
name: {{NAME}}
description: {{DESCRIPTION}}
scope: {{SCOPE}}
metadata:
  auto_invoke:
{{AUTO_INVOKE}}
allowed_tools: {{ALLOWED_TOOLS}}
---

# {{TITLE}}

## {{SECTION_1}}

{{CONTENT_PLACEHOLDER}}

## Ejemplos

\`\`\`{{LANGUAGE}}
// Ejemplo
{{EXAMPLE_PLACEHOLDER}}
\`\`\`

## Best Practices

### ✅ Hacer

- Item 1
- Item 2

### ❌ Evitar

- Anti-pattern 1
- Anti-pattern 2

---

**Filosofía:** {{PHILOSOPHY}}
`;

export async function createSkillInteractive(projectPath) {
  console.log('\n📝 Crear nueva skill\n');
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Nombre de la skill (lowercase, sin espacios):',
      validate: (input) => {
        if (!input) return 'El nombre es obligatorio';
        if (/\s/.test(input)) return 'No puede contener espacios';
        if (input !== input.toLowerCase()) return 'Debe estar en lowercase';
        return true;
      },
    },
    {
      type: 'input',
      name: 'description',
      message: 'Descripción corta:',
      validate: (input) => {
        if (!input) return 'La descripción es obligatoria';
        if (input.length < 20) return 'Mínimo 20 caracteres';
        return true;
      },
    },
    {
      type: 'list',
      name: 'scope',
      message: 'Scope:',
      choices: [
        { name: 'root (disponible en todo el proyecto)', value: 'root' },
        { name: 'global (alias de root)', value: 'global' },
        { name: 'Custom (para monorepo)', value: 'custom' },
      ],
      default: 'root',
    },
    {
      type: 'input',
      name: 'customScope',
      message: 'Scope custom (ej: api, ui):',
      when: (answers) => answers.scope === 'custom',
      validate: (input) => input ? true : 'Ingresá el scope',
    },
    {
      type: 'input',
      name: 'triggers',
      message: 'Triggers auto-invoke (separados por coma):',
      default: '',
      filter: (input) => input.split(',').map(t => t.trim()).filter(Boolean),
    },
    {
      type: 'checkbox',
      name: 'tools',
      message: 'Herramientas permitidas:',
      choices: [
        { name: 'read', checked: true },
        { name: 'write', checked: true },
        { name: 'exec', checked: false },
        { name: 'browser', checked: false },
        { name: 'memory_search', checked: false },
      ],
    },
    {
      type: 'input',
      name: 'title',
      message: 'Título del documento (opcional):',
      default: (answers) => answers.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    },
    {
      type: 'list',
      name: 'language',
      message: 'Lenguaje principal para ejemplos:',
      choices: ['javascript', 'typescript', 'python', 'bash', 'yaml', 'markdown'],
      default: 'javascript',
    },
  ]);
  
  // Construir scope final
  const scope = answers.scope === 'custom' ? answers.customScope : answers.scope;
  
  // Generar triggers YAML
  const triggersYaml = answers.triggers.length > 0
    ? answers.triggers.map(t => `    - "${t}"`).join('\n')
    : '    # - "trigger 1"\n    # - "trigger 2"';
  
  // Generar contenido
  let content = SKILL_TEMPLATE
    .replace(/{{NAME}}/g, answers.name)
    .replace(/{{DESCRIPTION}}/g, answers.description)
    .replace(/{{SCOPE}}/g, scope)
    .replace(/{{AUTO_INVOKE}}/g, triggersYaml)
    .replace(/{{ALLOWED_TOOLS}}/g, JSON.stringify(answers.tools))
    .replace(/{{TITLE}}/g, answers.title)
    .replace(/{{SECTION_1}}/g, 'Introducción')
    .replace(/{{CONTENT_PLACEHOLDER}}/g, 'Descripción detallada de la skill.\n\n- Punto clave 1\n- Punto clave 2')
    .replace(/{{LANGUAGE}}/g, answers.language)
    .replace(/{{EXAMPLE_PLACEHOLDER}}/g, 'Código de ejemplo')
    .replace(/{{PHILOSOPHY}}/g, 'Principio guía de esta skill.');
  
  // Crear directorio
  const skillDir = join(projectPath, 'skills', answers.name);
  
  if (existsSync(skillDir)) {
    console.log(`\n⚠️  La skill "${answers.name}" ya existe en ${skillDir}`);
    
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: '¿Sobrescribir?',
        default: false,
      },
    ]);
    
    if (!overwrite) {
      console.log('Cancelado.');
      return;
    }
  } else {
    mkdirSync(skillDir, { recursive: true });
  }
  
  // Escribir archivo
  const skillPath = join(skillDir, 'SKILL.md');
  writeFileSync(skillPath, content);
  
  console.log(`\n✅ Skill creada: ${skillPath}`);
  console.log('\nPróximos pasos:');
  console.log('  1. Editá el contenido de la skill');
  console.log('  2. Ejecutá: node src/cli.js skill-sync');
  console.log('  3. La skill aparecerá en AGENTS.md automáticamente\n');
  
  return skillPath;
}

export async function createSkillNonInteractive(projectPath, name, options = {}) {
  const skillDir = join(projectPath, 'skills', name);
  
  if (existsSync(skillDir) && !options.force) {
    throw new Error(`Skill "${name}" ya existe. Usá --force para sobrescribir.`);
  }
  
  mkdirSync(skillDir, { recursive: true });
  
  const content = SKILL_TEMPLATE
    .replace(/{{NAME}}/g, name)
    .replace(/{{DESCRIPTION}}/g, options.description || 'Nueva skill')
    .replace(/{{SCOPE}}/g, options.scope || 'root')
    .replace(/{{AUTO_INVOKE}}/g, '    # - "trigger 1"')
    .replace(/{{ALLOWED_TOOLS}}/g, JSON.stringify(options.tools || ['read', 'write']))
    .replace(/{{TITLE}}/g, name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
    .replace(/{{SECTION_1}}/g, 'Introducción')
    .replace(/{{CONTENT_PLACEHOLDER}}/g, 'Contenido por completar.')
    .replace(/{{LANGUAGE}}/g, 'javascript')
    .replace(/{{EXAMPLE_PLACEHOLDER}}/g, '// TODO')
    .replace(/{{PHILOSOPHY}}/g, 'Filosofía por definir.');
  
  const skillPath = join(skillDir, 'SKILL.md');
  writeFileSync(skillPath, content);
  
  return skillPath;
}
