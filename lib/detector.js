import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Detecta el tipo de proyecto analizando archivos del directorio
 */
export async function detectProject(projectPath) {
  const info = {
    type: 'unknown',
    language: 'unknown',
    frameworks: [],
    structure: 'single',
    hasTests: false,
    hasCI: false,
    hasDocs: false,
  };

  // Detectar proyectos de agentes IA (Moltbot, Claude, etc)
  if (existsSync(join(projectPath, 'SOUL.md')) && 
      existsSync(join(projectPath, 'IDENTITY.md'))) {
    info.type = 'ai-agent';
    info.language = 'agent-config';
    info.hasDocs = true;
    
    // Detectar framework específico
    if (existsSync(join(projectPath, 'HEARTBEAT.md'))) {
      info.frameworks.push('moltbot');
    }
    if (existsSync(join(projectPath, '.claude'))) {
      info.frameworks.push('claude');
    }
    if (existsSync(join(projectPath, 'skills'))) {
      info.frameworks.push('agent-skills');
    }
    
    return info;
  }

  // Detectar por archivos de configuración
  const files = {
    'package.json': () => detectNode(projectPath, info),
    'requirements.txt': () => detectPython(projectPath, info, 'requirements'),
    'pyproject.toml': () => detectPython(projectPath, info, 'pyproject'),
    'Pipfile': () => detectPython(projectPath, info, 'pipfile'),
    'go.mod': () => { info.language = 'go'; info.type = 'go'; },
    'Cargo.toml': () => { info.language = 'rust'; info.type = 'rust'; },
    'pom.xml': () => { info.language = 'java'; info.type = 'java-maven'; },
    'build.gradle': () => { info.language = 'java'; info.type = 'java-gradle'; },
  };

  for (const [file, detector] of Object.entries(files)) {
    if (existsSync(join(projectPath, file))) {
      await detector();
      break;
    }
  }

  // Detectar estructura monorepo
  if (existsSync(join(projectPath, 'packages')) || 
      existsSync(join(projectPath, 'apps')) ||
      existsSync(join(projectPath, 'lerna.json')) ||
      existsSync(join(projectPath, 'pnpm-workspace.yaml'))) {
    info.structure = 'monorepo';
  }

  // Detectar tests
  info.hasTests = existsSync(join(projectPath, 'tests')) ||
                  existsSync(join(projectPath, 'test')) ||
                  existsSync(join(projectPath, '__tests__')) ||
                  existsSync(join(projectPath, 'spec'));

  // Detectar CI/CD
  info.hasCI = existsSync(join(projectPath, '.github', 'workflows')) ||
               existsSync(join(projectPath, '.gitlab-ci.yml')) ||
               existsSync(join(projectPath, 'Jenkinsfile'));

  // Detectar docs
  info.hasDocs = existsSync(join(projectPath, 'docs')) ||
                 existsSync(join(projectPath, 'README.md'));

  return info;
}

function detectNode(projectPath, info) {
  info.language = 'javascript';
  info.type = 'node';

  try {
    const pkg = JSON.parse(readFileSync(join(projectPath, 'package.json'), 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    // Detectar TypeScript
    if (deps.typescript || existsSync(join(projectPath, 'tsconfig.json'))) {
      info.language = 'typescript';
    }

    // Detectar frameworks frontend
    if (deps.react) {
      info.frameworks.push('react');
      info.type = 'web';
    }
    if (deps.vue) {
      info.frameworks.push('vue');
      info.type = 'web';
    }
    if (deps.svelte) {
      info.frameworks.push('svelte');
      info.type = 'web';
    }
    if (deps.next) {
      info.frameworks.push('nextjs');
      info.type = 'web';
    }
    if (deps.nuxt) {
      info.frameworks.push('nuxt');
      info.type = 'web';
    }

    // Detectar frameworks backend
    if (deps.express) info.frameworks.push('express');
    if (deps.fastify) info.frameworks.push('fastify');
    if (deps.nestjs || deps['@nestjs/core']) info.frameworks.push('nestjs');
    if (deps.hono) info.frameworks.push('hono');

    // Detectar herramientas de estilo
    if (deps.tailwindcss) info.frameworks.push('tailwind');

    // Detectar testing
    if (deps.jest || deps.vitest || deps.mocha) info.hasTests = true;

  } catch (e) {
    // package.json mal formado o no legible
  }
}

function detectPython(projectPath, info, configType) {
  info.language = 'python';
  info.type = 'python';

  try {
    let content = '';
    
    if (configType === 'requirements') {
      content = readFileSync(join(projectPath, 'requirements.txt'), 'utf8').toLowerCase();
    } else if (configType === 'pyproject') {
      content = readFileSync(join(projectPath, 'pyproject.toml'), 'utf8').toLowerCase();
    }

    // Detectar frameworks
    if (content.includes('django')) {
      info.frameworks.push('django');
      info.type = 'web';
    }
    if (content.includes('fastapi')) {
      info.frameworks.push('fastapi');
      info.type = 'api';
    }
    if (content.includes('flask')) {
      info.frameworks.push('flask');
      info.type = 'web';
    }
    if (content.includes('pytest')) {
      info.hasTests = true;
    }

  } catch (e) {
    // Archivo no legible
  }
}
