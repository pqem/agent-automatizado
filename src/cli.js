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
  .action(async () => {
    const { syncToAllIDEs } = await import('../lib/syncer.js');
    
    console.log('🔄 Sincronizando a IDEs...\n');
    await syncToAllIDEs(process.cwd());
    console.log('✅ Sincronización completada!');
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

program.parse();
