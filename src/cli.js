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

// Comando: add-skill - Agregar skill al proyecto
program
  .command('add-skill <name>')
  .description('Agregar una skill al proyecto')
  .action(async (name) => {
    const { addSkill } = await import('../lib/generator.js');
    
    console.log(`📥 Agregando skill: ${name}...\n`);
    await addSkill(process.cwd(), name);
    console.log(`✅ Skill "${name}" agregada!`);
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

program.parse();
