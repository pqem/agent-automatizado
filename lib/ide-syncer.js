/**
 * IDE Rules Syncer
 * Sincroniza configuración de reglas desde PROJECT.md a múltiples IDEs
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { logger } from './logger.js';

// Configuración de IDEs soportados
const IDE_CONFIGS = {
  cursor: {
    file: '.cursorrules',
    header: '# Reglas para Cursor AI',
    footer: `
## Instrucciones adicionales
- Código limpio y conciso
- Commits en formato convencional
- No crear archivos innecesarios`
  },
  claude: {
    file: 'CLAUDE.md',
    header: '# Instrucciones para Claude',
    footer: `
## Convenciones
- Seguir el estilo existente del código
- Commits descriptivos en español
- No agregar comentarios obvios`
  },
  copilot: {
    file: '.github/copilot-instructions.md',
    header: '# GitHub Copilot Instructions',
    footer: `
## Code Style
- Follow existing code patterns
- Use conventional commits
- Keep code clean and focused`
  },
  opencode: {
    file: 'OPENCODE.md',
    header: '# Instrucciones para OpenCode',
    footer: ''
  },
  zed: {
    file: '.zed/instructions.md',
    header: '# Zed AI Instructions',
    footer: `
## Guidelines
- Follow existing patterns
- Use conventional commits
- Keep changes focused`
  },
  warp: {
    file: '.warp/rules.md',
    header: '# Warp AI Rules',
    footer: `
## Terminal Rules
- Prefer existing patterns
- Clear commit messages
- No unnecessary files`
  }
};

// Template por defecto para PROJECT.md
const PROJECT_TEMPLATE = `# Nombre del Proyecto

## Stack
- Tecnología 1
- Tecnología 2

## Reglas
1. Regla importante 1
2. Regla importante 2
3. Regla importante 3

## Estructura
\`\`\`
src/    - Código fuente
lib/    - Librerías
tests/  - Tests
\`\`\`

## Comandos
\`\`\`bash
npm install   # Instalar dependencias
npm start     # Iniciar proyecto
npm test      # Ejecutar tests
\`\`\`

## Notas
- Nota importante para el LLM
`;

/**
 * Lee PROJECT.md o crea template si no existe
 */
function ensureProjectFile(projectPath) {
  const projectFile = join(projectPath, 'PROJECT.md');

  if (!existsSync(projectFile)) {
    writeFileSync(projectFile, PROJECT_TEMPLATE);
    return { created: true, content: PROJECT_TEMPLATE };
  }

  return { created: false, content: readFileSync(projectFile, 'utf8') };
}

/**
 * Genera contenido para un IDE específico
 */
function generateIDEContent(projectContent, ideConfig) {
  return `${ideConfig.header}

${projectContent}${ideConfig.footer}
`;
}

/**
 * Sincroniza a todos los IDEs
 */
export async function syncIDERules(projectPath, options = {}) {
  const {
    only = null,        // Array de IDEs específicos o null para todos
    dryRun = false,     // Solo mostrar qué haría
    check = false,      // Solo verificar si están sincronizados
    verbose = false     // Mostrar más detalles
  } = options;

  const results = {
    projectCreated: false,
    synced: [],
    skipped: [],
    outOfSync: [],
    errors: []
  };

  // Asegurar que existe PROJECT.md
  const { created, content: projectContent } = ensureProjectFile(projectPath);
  results.projectCreated = created;

  if (created && !dryRun) {
    logger.warn('PROJECT.md no existía, se creó template.');
    logger.plain('   Edítalo y vuelve a ejecutar.\n');
    return results;
  }

  // Determinar qué IDEs procesar
  const idesToSync = only
    ? only.filter(ide => IDE_CONFIGS[ide])
    : Object.keys(IDE_CONFIGS);

  // Procesar cada IDE
  for (const ideName of idesToSync) {
    const ideConfig = IDE_CONFIGS[ideName];
    const targetPath = join(projectPath, ideConfig.file);
    const expectedContent = generateIDEContent(projectContent, ideConfig);

    try {
      // Verificar si el archivo existe y comparar contenido
      if (existsSync(targetPath)) {
        const currentContent = readFileSync(targetPath, 'utf8');

        if (currentContent === expectedContent) {
          results.skipped.push({ ide: ideName, file: ideConfig.file, reason: 'up-to-date' });
          if (verbose) {
            logger.debug(`${ideName}: ya sincronizado`);
          }
          continue;
        } else if (check) {
          results.outOfSync.push({ ide: ideName, file: ideConfig.file });
          continue;
        }
      }

      // Si es check mode, marcar como out of sync
      if (check) {
        results.outOfSync.push({ ide: ideName, file: ideConfig.file });
        continue;
      }

      // Si es dry run, solo reportar
      if (dryRun) {
        logger.log('📝', `${ideName}: escribiría ${ideConfig.file}`);
        results.synced.push({ ide: ideName, file: ideConfig.file, dryRun: true });
        continue;
      }

      // Crear directorio si no existe
      const dir = dirname(targetPath);
      if (dir !== projectPath && !existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      // Escribir archivo
      writeFileSync(targetPath, expectedContent);
      results.synced.push({ ide: ideName, file: ideConfig.file });

      if (verbose) {
        logger.success(`${ideName}: ${ideConfig.file}`);
      }

    } catch (error) {
      results.errors.push({ ide: ideName, file: ideConfig.file, error: error.message });
    }
  }

  return results;
}

/**
 * Obtiene lista de IDEs soportados
 */
export function getSupportedIDEs() {
  return Object.keys(IDE_CONFIGS).map(name => ({
    name,
    file: IDE_CONFIGS[name].file
  }));
}

/**
 * Verifica si los archivos están sincronizados
 */
export async function checkIDESync(projectPath) {
  return syncIDERules(projectPath, { check: true });
}
