#!/usr/bin/env node

/**
 * New Conversation - Clean Context Generator
 * 
 * Genera snapshot de contexto limpio para iniciar nueva conversación con IA.
 * Extrae solo información relevante para la tarea específica.
 * 
 * Uso:
 *   node scripts/new-conversation.cjs "descripción de la tarea"
 *   npm run clean:context "implementar feature X"
 */

const { execSync } = require('child_process')
const { readFileSync, writeFileSync, existsSync } = require('fs')
const { join } = require('path')

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function exec(cmd, options = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', ...options }).trim()
  } catch (error) {
    return null
  }
}

/**
 * Detectar archivos relevantes para una tarea basándose en keywords
 */
function detectRelevantFiles(taskDescription) {
  const keywords = taskDescription.toLowerCase().split(/\s+/)
  const files = []
  
  try {
    // Buscar en git tracked files
    const gitFiles = exec('git ls-files').split('\n')
    
    for (const file of gitFiles) {
      const fileName = file.toLowerCase()
      
      // Match directo con keywords
      if (keywords.some(kw => fileName.includes(kw))) {
        files.push(file)
      }
      
      // Patterns comunes
      if (taskDescription.toLowerCase().includes('test') && /test|spec/.test(fileName)) {
        files.push(file)
      }
      if (taskDescription.toLowerCase().includes('doc') && /readme|doc/.test(fileName)) {
        files.push(file)
      }
      if (taskDescription.toLowerCase().includes('config') && /config|\.env/.test(fileName)) {
        files.push(file)
      }
    }
    
    // Limitar a top 10 más relevantes
    return [...new Set(files)].slice(0, 10)
  } catch (error) {
    return []
  }
}

/**
 * Extraer info relevante de CONTEXT-RECOVERY.md
 */
function extractRelevantContext(recoveryContent, taskDescription) {
  const lines = recoveryContent.split('\n')
  const relevant = []
  
  let inRelevantSection = false
  let sectionBuffer = []
  
  const relevantSections = [
    '## 🎯 Proyecto Activo',
    '## 📦 Estado del Repositorio',
    '## 🔜 Próximo Paso'
  ]
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Detectar inicio de sección relevante
    if (relevantSections.some(s => line.startsWith(s))) {
      inRelevantSection = true
      sectionBuffer = [line]
      continue
    }
    
    // Detectar fin de sección (nueva sección ##)
    if (line.startsWith('##') && inRelevantSection) {
      relevant.push(sectionBuffer.join('\n'))
      sectionBuffer = []
      inRelevantSection = false
    }
    
    // Agregar líneas si estamos en sección relevante
    if (inRelevantSection) {
      sectionBuffer.push(line)
    }
  }
  
  // Agregar última sección si quedó algo
  if (sectionBuffer.length > 0) {
    relevant.push(sectionBuffer.join('\n'))
  }
  
  return relevant.join('\n\n')
}

/**
 * Generar contexto limpio
 */
function generateCleanContext(taskDescription, workspaceDir = process.cwd()) {
  log('\n🧹 Generando contexto limpio...', 'blue')
  
  const timestamp = new Date().toISOString()
  const date = timestamp.split('T')[0]
  const time = timestamp.split('T')[1].split('.')[0]
  
  // 1. Estado de git básico
  const gitStatus = exec('git status --short') || 'No git repo'
  const lastCommit = exec('git log -1 --oneline') || 'No commits'
  const currentBranch = exec('git rev-parse --abbrev-ref HEAD') || 'unknown'
  
  // 2. Leer CONTEXT-RECOVERY.md si existe
  let contextRecovery = ''
  const recoveryPath = join(workspaceDir, 'CONTEXT-RECOVERY.md')
  if (existsSync(recoveryPath)) {
    const fullRecovery = readFileSync(recoveryPath, 'utf8')
    contextRecovery = extractRelevantContext(fullRecovery, taskDescription)
  } else {
    contextRecovery = 'CONTEXT-RECOVERY.md no encontrado'
  }
  
  // 3. Detectar archivos relevantes
  const relevantFiles = detectRelevantFiles(taskDescription)
  
  // 4. Generar snapshot limpio
  const cleanContext = `# Contexto Limpio para: ${taskDescription}

**Generado:** ${date} ${time} UTC
**Branch:** ${currentBranch}

---

## 🎯 Tarea

${taskDescription}

## 📋 Contexto del Proyecto

${contextRecovery}

## 📂 Archivos Relevantes

${relevantFiles.length > 0 ? relevantFiles.map(f => `- \`${f}\``).join('\n') : 'No se detectaron archivos específicos'}

## 🔄 Estado Actual de Git

**Branch:** ${currentBranch}

**Último commit:**
\`\`\`
${lastCommit}
\`\`\`

**Archivos modificados:**
\`\`\`
${gitStatus || '(ninguno)'}
\`\`\`

---

## 💡 Instrucciones para el IA

1. **Enfoque:** ${taskDescription}
2. **Contexto:** Solo usar la información de arriba (balde limpio)
3. **Archivos:** Revisar los archivos relevantes listados
4. **Objetivo:** Completar la tarea sin desviarse

## ✅ Criterios de Éxito

Esta tarea estará completa cuando:
- [ ] [DEFINIR CRITERIO 1]
- [ ] [DEFINIR CRITERIO 2]
- [ ] [DEFINIR CRITERIO 3]

---

*Contexto limpio generado por agent-automatizado*
*Pega este bloque completo al inicio de tu nueva conversación*
*No incluyas info adicional - mantén el balde limpio*
`

  return cleanContext
}

/**
 * Main
 */
function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    log('\n❌ Uso: node scripts/new-conversation.cjs "descripción de la tarea"', 'red')
    log('   Ejemplo: node scripts/new-conversation.cjs "implementar cache con Redis"\n', 'reset')
    process.exit(1)
  }
  
  const taskDescription = args.join(' ')
  const workspaceDir = process.cwd()
  
  log(`\n🎯 Tarea: "${taskDescription}"`, 'cyan')
  log(`📁 Workspace: ${workspaceDir}`, 'reset')
  
  // Generar contexto limpio
  const cleanContext = generateCleanContext(taskDescription, workspaceDir)
  
  // Guardar en archivo
  const timestamp = Date.now()
  const filename = `conversation-${timestamp}.md`
  const outputPath = join(workspaceDir, filename)
  
  writeFileSync(outputPath, cleanContext, 'utf8')
  
  log(`\n✅ Contexto limpio generado: ${filename}`, 'green')
  
  // Mostrar resumen
  const lines = cleanContext.split('\n')
  const contextLines = lines.filter(l => l.trim().startsWith('**')).slice(0, 5)
  
  log('\n📊 Resumen:', 'blue')
  contextLines.forEach(line => log(`   ${line}`, 'reset'))
  
  // Mostrar archivos detectados
  const relevantFiles = detectRelevantFiles(taskDescription)
  if (relevantFiles.length > 0) {
    log(`\n📂 Archivos relevantes detectados: ${relevantFiles.length}`, 'yellow')
    relevantFiles.slice(0, 5).forEach(file => log(`   - ${file}`, 'reset'))
    if (relevantFiles.length > 5) {
      log(`   ... y ${relevantFiles.length - 5} más`, 'reset')
    }
  }
  
  // Instrucciones
  log('\n📋 Próximos pasos:', 'bright')
  log('   1. Abre una NUEVA conversación con tu IA', 'cyan')
  log(`   2. Pega el contenido de: ${filename}`, 'cyan')
  log('   3. Comienza a trabajar con contexto limpio', 'cyan')
  
  log('\n💡 Tip: No agregues más contexto - mantén el balde limpio!', 'yellow')
  log('', 'reset')
}

// Run
main()
