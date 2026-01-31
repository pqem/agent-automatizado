#!/usr/bin/env node

import { Command } from 'commander';
import { render } from 'ink';
import React from 'react';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const program = new Command();

program
  .name('agent-auto')
  .description('Sistema automatizado para generar entornos de trabajo con agentes IA, skills y MCP')
  .version('1.0.0');

// Comando: new - Wizard interactivo para crear proyecto desde cero
program
  .command('new')
  .description('Crear un nuevo proyecto con wizard interactivo')
  .option('-n, --name <name>', 'Nombre del proyecto')
  .action(async (options) => {
    const { default: Wizard } = await import('./components/Wizard.js');
    render(React.createElement(Wizard, { projectName: options.name }));
  });

// Comando: init - Detectar proyecto existente y generar config
program
  .command('init')
  .description('Inicializar entorno de agentes en proyecto existente')
  .action(async () => {
    const { detectProject } = await import('../lib/detector.js');
    const { generateEnvironment } = await import('../lib/generator.js');
    
    console.log('🔍 Analizando proyecto...\n');
    const projectInfo = await detectProject(process.cwd());
    
    console.log(`📦 Detectado: ${projectInfo.type}`);
    console.log(`   Frameworks: ${projectInfo.frameworks.join(', ') || 'ninguno'}`);
    console.log(`   Lenguaje: ${projectInfo.language}\n`);
    
    await generateEnvironment(process.cwd(), projectInfo);
    console.log('✅ Entorno de agentes generado exitosamente!');
  });

// Comando: detect - Solo mostrar información del proyecto
program
  .command('detect')
  .description('Detectar tipo de proyecto sin generar archivos')
  .action(async () => {
    const { detectProject } = await import('../lib/detector.js');
    
    console.log('🔍 Analizando proyecto...\n');
    const projectInfo = await detectProject(process.cwd());
    
    console.log('📊 Información del proyecto:');
    console.log(`   Tipo: ${projectInfo.type}`);
    console.log(`   Lenguaje: ${projectInfo.language}`);
    console.log(`   Frameworks: ${projectInfo.frameworks.join(', ') || 'ninguno'}`);
    console.log(`   Estructura: ${projectInfo.structure}`);
    console.log(`   Tests: ${projectInfo.hasTests ? 'Sí' : 'No'}`);
    console.log(`   CI/CD: ${projectInfo.hasCI ? 'Sí' : 'No'}`);
  });

// Comando: sync - Sincronizar skills a todos los IDEs
program
  .command('sync')
  .description('Sincronizar configuración a todos los IDEs soportados')
  .option('-s, --symlinks', 'Usar symlinks en vez de copiar')
  .option('-o, --only <ides>', 'Solo sincronizar a estos IDEs (claude,copilot,codex,gemini,cursor,warp)')
  .action(async (options) => {
    const { syncToAllIDEs } = await import('../lib/syncer.js');
    
    console.log('🔄 Sincronizando a IDEs...\n');
    await syncToAllIDEs(process.cwd(), {
      useSymlinks: options.symlinks,
      only: options.only ? options.only.split(',') : null,
    });
    console.log('\n✅ Sincronización completada!');
  });

// Comando: sync-ide - Sincronizar PROJECT.md a todos los IDEs
program
  .command('sync-ide')
  .description('Sincronizar PROJECT.md a archivos de configuración de IDEs')
  .option('-o, --only <ides>', 'Solo sincronizar a estos IDEs (cursor,claude,copilot,opencode,zed,warp)')
  .option('-c, --check', 'Solo verificar si están sincronizados')
  .option('-d, --dry-run', 'Mostrar qué haría sin escribir archivos')
  .option('-v, --verbose', 'Mostrar detalles de cada archivo')
  .option('-l, --list', 'Listar IDEs soportados')
  .action(async (options) => {
    const { syncIDERules, getSupportedIDEs } = await import('../lib/ide-syncer.js');

    if (options.list) {
      console.log('🖥️  IDEs soportados:\n');
      getSupportedIDEs().forEach(ide => {
        console.log(`   • ${ide.name.padEnd(10)} → ${ide.file}`);
      });
      return;
    }

    console.log('🔄 Sincronizando reglas de IDE...\n');

    const results = await syncIDERules(process.cwd(), {
      only: options.only ? options.only.split(',') : null,
      dryRun: options.dryRun,
      check: options.check,
      verbose: options.verbose
    });

    if (results.projectCreated) {
      return;
    }

    if (options.check) {
      if (results.outOfSync.length === 0) {
        console.log('✅ Todos los archivos están sincronizados.');
      } else {
        console.log('⚠️  Archivos desincronizados:\n');
        results.outOfSync.forEach(r => console.log(`   • ${r.file}`));
        console.log('\nEjecuta "node src/cli.js sync-ide" para sincronizar.');
        process.exit(1);
      }
      return;
    }

    if (options.dryRun) {
      console.log('\n📋 Dry run completado (no se escribieron archivos)');
      return;
    }

    // Resumen
    console.log('✅ Sincronización completada!\n');

    if (results.synced.length > 0) {
      console.log('Archivos actualizados:');
      results.synced.forEach(r => console.log(`   ✓ ${r.file}`));
    }

    if (results.skipped.length > 0 && options.verbose) {
      console.log('\nYa sincronizados:');
      results.skipped.forEach(r => console.log(`   ⏭️  ${r.file}`));
    }

    if (results.errors.length > 0) {
      console.log('\nErrores:');
      results.errors.forEach(r => console.log(`   ✗ ${r.file}: ${r.error}`));
    }

    console.log('\n💡 Tip: Edita PROJECT.md y vuelve a ejecutar para actualizar todos.');
  });

// Comando: skill-sync - Regenerar Skills Reference y Auto-invoke
program
  .command('skill-sync')
  .description('Regenerar bloques de skills en AGENTS.md')
  .action(async () => {
    const { syncSkills } = await import('../lib/skill-syncer.js');

    console.log('🧩 Regenerando skills en AGENTS.md...\n');
    await syncSkills(process.cwd());
  });

// Comando: add-skill - Agregar skill al proyecto
program
  .command('add-skill [name]')
  .description('Agregar una skill al proyecto (interactivo si no se pasa nombre)')
  .option('-d, --description <desc>', 'Descripción de la skill')
  .option('-s, --scope <scope>', 'Scope (root, global, o custom)', 'root')
  .option('-t, --tools <tools>', 'Herramientas permitidas (comma-separated)', 'read,write')
  .option('-f, --force', 'Sobrescribir si existe')
  .action(async (name, options) => {
    const { createSkillInteractive, createSkillNonInteractive } = await import('../lib/skill-creator.js');
    
    try {
      let skillPath;
      
      if (!name) {
        // Modo interactivo
        skillPath = await createSkillInteractive(process.cwd());
      } else {
        // Modo no interactivo
        const toolsArray = options.tools.split(',').map(t => t.trim());
        skillPath = await createSkillNonInteractive(process.cwd(), name, {
          description: options.description,
          scope: options.scope,
          tools: toolsArray,
          force: options.force,
        });
        console.log(`✅ Skill creada: ${skillPath}`);
        console.log('\nEjecutá "node src/cli.js skill-sync" para actualizar AGENTS.md');
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

// Comando: config - Ver/editar configuración
program
  .command('config')
  .description('Ver o editar configuración')
  .option('-l, --list', 'Listar configuración actual')
  .option('-s, --set <key=value>', 'Establecer valor de configuración')
  .option('--ides', 'Listar IDEs soportados')
  .action(async (options) => {
    const { readFileSync, writeFileSync, existsSync } = await import('fs');
    const { join } = await import('path');
    const { homedir } = await import('os');
    
    const configPath = join(homedir(), '.agent-auto', 'config', 'settings.json');
    const defaultConfig = join(process.cwd(), 'config', 'settings.json');
    
    // Usar config de usuario si existe, sino la por defecto
    const configFile = existsSync(configPath) ? configPath : defaultConfig;
    
    if (options.ides) {
      const { getSupportedIDEs } = await import('../lib/syncer.js');
      console.log('🖥️  IDEs soportados:');
      getSupportedIDEs().forEach(ide => console.log(`   • ${ide}`));
      return;
    }
    
    if (!existsSync(configFile)) {
      console.log('⚠️  No se encontró archivo de configuración.');
      return;
    }
    
    const config = JSON.parse(readFileSync(configFile, 'utf8'));
    
    if (options.set) {
      const [key, value] = options.set.split('=');
      if (!key || value === undefined) {
        console.log('⚠️  Formato: --set key=value');
        return;
      }
      config[key] = value;
      writeFileSync(configFile, JSON.stringify(config, null, 2));
      console.log(`✅ ${key} = ${value}`);
      return;
    }
    
    // Por defecto: listar config
    console.log('⚙️  Configuración actual:\n');
    for (const [key, value] of Object.entries(config)) {
      console.log(`   ${key}: ${JSON.stringify(value)}`);
    }
  });

// Comando: list-skills - Listar skills disponibles
program
  .command('list-skills')
  .description('Listar skills disponibles')
  .action(async () => {
    const { readdirSync, existsSync } = await import('fs');
    const { join, dirname } = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const templatesDir = join(__dirname, '..', 'templates', 'skills');
    
    console.log('📚 Skills disponibles:\n');
    
    // Genéricos
    const genericDir = join(templatesDir, 'generic');
    if (existsSync(genericDir)) {
      console.log('  Genéricos:');
      readdirSync(genericDir).forEach(skill => {
        console.log(`    • ${skill}`);
      });
    }
    
    // Tech
    const techDir = join(templatesDir, 'tech');
    if (existsSync(techDir)) {
      console.log('\n  Tecnologías:');
      readdirSync(techDir).forEach(skill => {
        console.log(`    • ${skill}`);
      });
    }
  });

// Comando: mcp - Gestionar MCP servers
const mcpCommand = program
  .command('mcp')
  .description('Gestionar servidores MCP');

mcpCommand
  .command('list')
  .description('Listar servidores MCP disponibles')
  .option('-c, --category <cat>', 'Filtrar por categoría (core, database, browser, vcs, docs)')
  .action(async (options) => {
    const { listAvailableMCP } = await import('../lib/mcp-generator.js');
    const servers = listAvailableMCP();
    
    console.log('🔌 Servidores MCP disponibles:\n');
    
    const filtered = options.category 
      ? servers.filter(s => s.category === options.category)
      : servers;
    
    // Agrupar por categoría
    const byCategory = {};
    filtered.forEach(s => {
      if (!byCategory[s.category]) byCategory[s.category] = [];
      byCategory[s.category].push(s);
    });
    
    for (const [cat, list] of Object.entries(byCategory)) {
      console.log(`  ${cat.toUpperCase()}:`);
      list.forEach(s => {
        const rec = s.recommended ? ' ★' : '';
        const env = s.requiresEnv ? ' (requiere env)' : '';
        console.log(`    • ${s.name}${rec}${env}`);
        console.log(`      ${s.description}`);
      });
      console.log();
    }
  });

mcpCommand
  .command('presets')
  .description('Listar presets de MCP disponibles')
  .action(async () => {
    const { listPresets } = await import('../lib/mcp-generator.js');
    const presets = listPresets();
    
    console.log('📦 Presets MCP disponibles:\n');
    presets.forEach(p => {
      console.log(`  ${p.name}:`);
      console.log(`    ${p.description}`);
      console.log(`    Servers: ${p.servers.join(', ')}\n`);
    });
  });

mcpCommand
  .command('setup')
  .description('Configurar MCP servers para el proyecto')
  .option('-p, --preset <name>', 'Usar un preset (minimal, web-dev, fullstack, python)')
  .option('-s, --servers <list>', 'Servidores a instalar (separados por coma)')
  .option('--auto', 'Auto-detectar servidores recomendados')
  .action(async (options) => {
    const { setupMCP, detectRecommendedMCP } = await import('../lib/mcp-generator.js');
    const { detectProject } = await import('../lib/detector.js');
    
    let servers = options.servers ? options.servers.split(',') : [];
    
    if (options.auto) {
      console.log('🔍 Auto-detectando MCP recomendados...\n');
      const projectInfo = await detectProject(process.cwd());
      servers = detectRecommendedMCP(projectInfo);
    }
    
    console.log('🔧 Configurando MCP servers...\n');
    
    const result = setupMCP(process.cwd(), {
      servers,
      preset: options.preset,
    });
    
    console.log(`✅ MCP configurado!\n`);
    console.log('Servidores instalados:');
    result.servers.forEach(s => console.log(`  • ${s}`));
    console.log('\nArchivos creados:');
    result.files.forEach(f => console.log(`  • ${f}`));
  });

mcpCommand
  .command('add <server>')
  .description('Agregar un servidor MCP al proyecto')
  .action(async (server) => {
    const { existsSync, readFileSync, writeFileSync } = await import('fs');
    const { join } = await import('path');
    const { listAvailableMCP } = await import('../lib/mcp-generator.js');
    
    // Verificar que el servidor existe
    const available = listAvailableMCP();
    const serverInfo = available.find(s => s.name === server);
    
    if (!serverInfo) {
      console.log(`⚠️  Servidor "${server}" no encontrado.`);
      console.log('Usa "agent-auto mcp list" para ver disponibles.');
      return;
    }
    
    // Leer config existente o crear nueva
    const mcpPath = join(process.cwd(), '.vscode', 'mcp.json');
    let config = { mcpServers: {} };
    
    if (existsSync(mcpPath)) {
      config = JSON.parse(readFileSync(mcpPath, 'utf8'));
    }
    
    // Agregar servidor
    const templates = JSON.parse(readFileSync(
      join(process.cwd(), 'config', 'mcp-templates.json'), 'utf8'
    ));
    const serverTemplate = templates.servers[server];
    
    config.mcpServers[server] = {
      command: serverTemplate.command,
      args: serverTemplate.args,
      ...(serverTemplate.env && { env: serverTemplate.env }),
    };
    
    writeFileSync(mcpPath, JSON.stringify(config, null, 2));
    console.log(`✅ Servidor "${server}" agregado a .vscode/mcp.json`);
    
    if (serverInfo.requiresEnv) {
      console.log(`\n⚠️  Este servidor requiere variables de entorno.`);
      console.log('Edita .vscode/mcp.json y reemplaza los placeholders {{VAR}}.');
    }
  });

program.parse();
