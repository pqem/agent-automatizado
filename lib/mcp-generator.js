import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar templates de MCP
function loadMCPTemplates() {
  const templatesPath = join(__dirname, '..', 'config', 'mcp-templates.json');
  return JSON.parse(readFileSync(templatesPath, 'utf8'));
}

/**
 * Genera configuración MCP para VS Code
 */
export function generateVSCodeMCP(projectPath, serverNames = []) {
  const templates = loadMCPTemplates();
  const vscodeDir = join(projectPath, '.vscode');
  const mcpPath = join(vscodeDir, 'mcp.json');
  
  // Crear directorio .vscode si no existe
  if (!existsSync(vscodeDir)) {
    mkdirSync(vscodeDir, { recursive: true });
  }
  
  // Construir configuración
  const mcpConfig = {
    mcpServers: {}
  };
  
  for (const name of serverNames) {
    const server = templates.servers[name];
    if (!server) continue;
    
    const config = {
      command: server.command,
      args: server.args,
    };
    
    if (server.env) {
      config.env = server.env;
    }
    
    mcpConfig.mcpServers[name] = config;
  }
  
  writeFileSync(mcpPath, JSON.stringify(mcpConfig, null, 2));
  return mcpPath;
}

/**
 * Genera configuración MCP para Claude Desktop
 */
export function generateClaudeMCP(projectPath, serverNames = []) {
  const templates = loadMCPTemplates();
  const claudeDir = join(projectPath, '.claude');
  const mcpPath = join(claudeDir, 'mcp.json');
  
  if (!existsSync(claudeDir)) {
    mkdirSync(claudeDir, { recursive: true });
  }
  
  const mcpConfig = {
    mcpServers: {}
  };
  
  for (const name of serverNames) {
    const server = templates.servers[name];
    if (!server) continue;
    
    mcpConfig.mcpServers[name] = {
      command: server.command,
      args: server.args,
      ...(server.env && { env: server.env }),
    };
  }
  
  writeFileSync(mcpPath, JSON.stringify(mcpConfig, null, 2));
  return mcpPath;
}

/**
 * Auto-detecta servidores MCP recomendados según el proyecto
 */
export function detectRecommendedMCP(projectInfo, wizardSelections = null) {
  const templates = loadMCPTemplates();
  const recommended = [];
  
  // Siempre agregar los core recomendados
  Object.entries(templates.servers).forEach(([name, server]) => {
    if (server.recommended) {
      recommended.push(name);
    }
  });
  
  // Según tipo de proyecto detectado
  if (projectInfo) {
    // Frameworks JavaScript/TypeScript -> context7
    if (projectInfo.frameworks?.some(f => ['react', 'nextjs', 'vue', 'svelte'].includes(f))) {
      if (!recommended.includes('context7')) {
        recommended.push('context7');
      }
    }
    
    // Si tiene tests con Playwright
    if (projectInfo.frameworks?.includes('playwright')) {
      recommended.push('playwright');
    }
    
    // Si hay CI/CD -> GitHub
    if (projectInfo.hasCI) {
      recommended.push('github');
    }
  }
  
  // Según selecciones del wizard
  if (wizardSelections) {
    // Base de datos
    switch (wizardSelections.datos) {
      case 'cloud':
        recommended.push('supabase');
        break;
      case 'sql':
        recommended.push('postgres');
        break;
      case 'local':
        recommended.push('sqlite');
        break;
    }
    
    // Testing para web
    if (wizardSelections.tipo === 'web') {
      recommended.push('puppeteer');
    }
  }
  
  // Eliminar duplicados
  return [...new Set(recommended)];
}

/**
 * Lista todos los servidores MCP disponibles
 */
export function listAvailableMCP() {
  const templates = loadMCPTemplates();
  return Object.entries(templates.servers).map(([name, config]) => ({
    name,
    description: config.description,
    category: config.category,
    recommended: config.recommended || false,
    requiresEnv: !!config.env,
  }));
}

/**
 * Lista presets disponibles
 */
export function listPresets() {
  const templates = loadMCPTemplates();
  return Object.entries(templates.presets).map(([name, config]) => ({
    name,
    description: config.description,
    servers: config.servers,
  }));
}

/**
 * Obtiene servidores de un preset
 */
export function getPresetServers(presetName) {
  const templates = loadMCPTemplates();
  return templates.presets[presetName]?.servers || [];
}

/**
 * Genera configuración MCP completa para un proyecto
 */
export function setupMCP(projectPath, options = {}) {
  const { servers = [], preset = null, forVSCode = true, forClaude = true } = options;
  
  let serverList = [...servers];
  
  // Si hay preset, agregar sus servidores
  if (preset) {
    const presetServers = getPresetServers(preset);
    serverList = [...new Set([...serverList, ...presetServers])];
  }
  
  // Si no hay servidores especificados, usar minimal
  if (serverList.length === 0) {
    serverList = getPresetServers('minimal');
  }
  
  const created = [];
  
  if (forVSCode) {
    const path = generateVSCodeMCP(projectPath, serverList);
    created.push(path);
  }
  
  if (forClaude) {
    const path = generateClaudeMCP(projectPath, serverList);
    created.push(path);
  }
  
  return {
    servers: serverList,
    files: created,
  };
}
