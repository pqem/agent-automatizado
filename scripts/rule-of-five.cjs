#!/usr/bin/env node

/**
 * Rule of Five - Interactive Review Script
 * 
 * Aplica los 5 filtros de Resonant Coding a un archivo o directorio:
 * 1. Borrador - ¿Está todo?
 * 2. Corrección - ¿Es correcto?
 * 3. Claridad - ¿Se entiende?
 * 4. Casos Límite - ¿Qué podría fallar?
 * 5. Excelencia - ¿Es lo mejor posible?
 * 
 * Uso:
 *   node scripts/rule-of-five.cjs [archivo]
 *   npm run review:five [archivo]
 */

const { readFileSync, existsSync, writeFileSync } = require('fs')
const { basename } = require('path')
const readline = require('readline')

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Interfaz de readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${prompt}${colors.reset} `, resolve)
  })
}

// Análisis básico de archivo
function analyzeFile(filePath) {
  const content = readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  const words = content.split(/\s+/).filter(w => w.length > 0)
  
  // Detectar tipo
  let type = 'text'
  if (filePath.endsWith('.md')) type = 'markdown'
  else if (filePath.endsWith('.js') || filePath.endsWith('.cjs')) type = 'javascript'
  else if (filePath.endsWith('.json')) type = 'json'
  else if (filePath.endsWith('.py')) type = 'python'
  
  // Análisis básico
  const analysis = {
    lines: lines.length,
    words: words.length,
    chars: content.length,
    type,
    hasComments: /\/\/|\/\*|\#/.test(content),
    hasTests: /test|describe|it\(/.test(content),
    hasTODO: /TODO|FIXME|XXX/.test(content),
    emptyLines: lines.filter(l => l.trim() === '').length
  }
  
  return { content, ...analysis }
}

// Los 5 filtros
const filters = [
  {
    name: 'Borrador',
    emoji: '📝',
    color: 'blue',
    questions: [
      '¿Está COMPLETO? (incluye toda la funcionalidad necesaria)',
      '¿Cubre AMPLITUD sobre profundidad?',
      '¿Hay partes omitidas que deberían estar?'
    ],
    checks: (file) => {
      const issues = []
      if (file.type === 'javascript' && !file.hasTests) {
        issues.push('⚠️  No detectados tests')
      }
      if (file.hasTODO) {
        issues.push('⚠️  Contiene TODOs pendientes')
      }
      if (file.lines < 10) {
        issues.push('ℹ️  Archivo muy corto - ¿está completo?')
      }
      return issues
    }
  },
  {
    name: 'Corrección',
    emoji: '🔍',
    color: 'green',
    questions: [
      '¿Es CORRECTO? (sin errores lógicos)',
      '¿Los datos/hechos son precisos?',
      '¿Hay contradicciones?'
    ],
    checks: (file) => {
      const issues = []
      // Detectar problemas comunes
      if (file.type === 'javascript') {
        if (/console\.log/.test(file.content)) {
          issues.push('⚠️  console.log detectado (debugging?)')
        }
        if (/var /.test(file.content)) {
          issues.push('⚠️  "var" detectado (usar const/let)')
        }
      }
      if (file.type === 'markdown') {
        // Links rotos (muy básico)
        const brokenLinks = (file.content.match(/\]\(\)/g) || []).length
        if (brokenLinks > 0) {
          issues.push(`⚠️  ${brokenLinks} links vacíos detectados`)
        }
      }
      return issues
    }
  },
  {
    name: 'Claridad',
    emoji: '💡',
    color: 'cyan',
    questions: [
      '¿Se entiende a la PRIMERA?',
      '¿Hay jerga innecesaria?',
      '¿La estructura es lógica?'
    ],
    checks: (file) => {
      const issues = []
      // Líneas muy largas
      const longLines = file.content.split('\n').filter(l => l.length > 120).length
      if (longLines > 5) {
        issues.push(`⚠️  ${longLines} líneas > 120 caracteres (dificulta lectura)`)
      }
      // Sin comentarios en archivos grandes
      if (file.type === 'javascript' && file.lines > 100 && !file.hasComments) {
        issues.push('⚠️  Archivo grande sin comentarios')
      }
      // Ratio palabras/líneas muy bajo = líneas muy densas
      const wordsPerLine = file.words / (file.lines - file.emptyLines)
      if (wordsPerLine > 15) {
        issues.push('ℹ️  Líneas muy densas (considerar dividir)')
      }
      return issues
    }
  },
  {
    name: 'Casos Límite',
    emoji: '⚠️',
    color: 'yellow',
    questions: [
      '¿Qué podría SALIR MAL?',
      '¿Inputs inválidos manejados?',
      '¿Edge cases considerados?'
    ],
    checks: (file) => {
      const issues = []
      if (file.type === 'javascript') {
        // Sin manejo de errores
        const hasTryCatch = /try\s*\{/.test(file.content)
        const hasAsyncAwait = /async\s+/.test(file.content)
        if (hasAsyncAwait && !hasTryCatch) {
          issues.push('⚠️  Código async sin try-catch')
        }
        // Sin validación de inputs
        if (!/if\s*\(/.test(file.content)) {
          issues.push('ℹ️  No se detectan validaciones (if statements)')
        }
      }
      return issues
    }
  },
  {
    name: 'Excelencia',
    emoji: '✨',
    color: 'bright',
    questions: [
      '¿Es lo MEJOR que puede ser?',
      '¿Está optimizado?',
      '¿Documentado adecuadamente?'
    ],
    checks: (file) => {
      const issues = []
      // Documentación
      if (file.type === 'javascript' && !file.content.includes('/**')) {
        issues.push('⚠️  Sin JSDoc comments')
      }
      if (file.type === 'markdown') {
        const hasTOC = /table of contents|toc/i.test(file.content)
        if (file.lines > 200 && !hasTOC) {
          issues.push('ℹ️  Documento largo sin tabla de contenidos')
        }
      }
      // Tests
      if (file.type === 'javascript' && !file.hasTests && file.lines > 50) {
        issues.push('⚠️  Código significativo sin tests')
      }
      return issues
    }
  }
]

async function runFilter(filter, fileData, index) {
  log(`\n${'='.repeat(60)}`, 'reset')
  log(`[${index + 1}/5] ${filter.emoji} ${filter.name}`, filter.color)
  log('='.repeat(60), 'reset')
  
  // Checks automáticos
  const autoIssues = filter.checks(fileData)
  if (autoIssues.length > 0) {
    log('\n🔎 Análisis automático:', 'yellow')
    autoIssues.forEach(issue => log(`   ${issue}`, 'reset'))
  } else {
    log('✅ Sin issues detectados automáticamente', 'green')
  }
  
  // Preguntas manuales
  log('\n📋 Review manual:', 'cyan')
  const answers = []
  
  for (const q of filter.questions) {
    const answer = await question(`   ${q} (s/n/?) `)
    answers.push({ question: q, answer })
    
    if (answer.toLowerCase() === 'n') {
      const detail = await question('      ¿Qué falta/problema? ')
      answers[answers.length - 1].detail = detail
    }
  }
  
  return { filter: filter.name, autoIssues, answers }
}

async function main() {
  const filePath = process.argv[2]
  
  log('\n📏 Regla de los 5 - Interactive Review', 'bright')
  log('=' .repeat(60), 'reset')
  
  if (!filePath) {
    log('\n❌ Uso: node scripts/rule-of-five.cjs [archivo]', 'red')
    log('   Ejemplo: node scripts/rule-of-five.cjs src/index.js\n', 'reset')
    rl.close()
    process.exit(1)
  }
  
  if (!existsSync(filePath)) {
    log(`\n❌ Archivo no encontrado: ${filePath}\n`, 'red')
    rl.close()
    process.exit(1)
  }
  
  log(`\n📄 Archivo: ${filePath}`, 'cyan')
  
  // Análisis del archivo
  const fileData = analyzeFile(filePath)
  log(`   Tipo: ${fileData.type}`, 'reset')
  log(`   Líneas: ${fileData.lines}`, 'reset')
  log(`   Palabras: ${fileData.words}`, 'reset')
  log(`   Caracteres: ${fileData.chars}`, 'reset')
  
  const proceed = await question('\n¿Continuar con review? (s/n) ')
  if (proceed.toLowerCase() !== 's') {
    log('\nReview cancelado.', 'yellow')
    rl.close()
    return
  }
  
  // Ejecutar los 5 filtros
  const results = []
  for (let i = 0; i < filters.length; i++) {
    const result = await runFilter(filters[i], fileData, i)
    results.push(result)
  }
  
  // Resumen final
  log(`\n${'='.repeat(60)}`, 'reset')
  log('📊 Resumen Final', 'bright')
  log('='.repeat(60), 'reset')
  
  let totalIssues = 0
  let passedFilters = 0
  
  results.forEach((result, i) => {
    const issues = result.autoIssues.length
    const fails = result.answers.filter(a => a.answer.toLowerCase() === 'n').length
    
    totalIssues += issues + fails
    
    if (issues === 0 && fails === 0) {
      log(`✅ [${i + 1}/5] ${result.filter}: Pasó`, 'green')
      passedFilters++
    } else {
      log(`⚠️  [${i + 1}/5] ${result.filter}: ${issues + fails} issues`, 'yellow')
    }
  })
  
  log('', 'reset')
  
  if (passedFilters === 5) {
    log('🎉 ¡Excelente! Pasó todos los filtros.', 'green')
  } else if (passedFilters >= 3) {
    log(`⚠️  Pasó ${passedFilters}/5 filtros. Revisar issues antes de continuar.`, 'yellow')
  } else {
    log(`❌ Solo pasó ${passedFilters}/5 filtros. Requiere trabajo significativo.`, 'red')
  }
  
  log(`\n📈 Issues totales detectados: ${totalIssues}`, 'reset')
  
  // Guardar reporte
  const saveReport = await question('\n¿Guardar reporte detallado? (s/n) ')
  if (saveReport.toLowerCase() === 's') {
    const reportPath = `${filePath}.review.md`
    const report = generateReport(filePath, fileData, results, passedFilters, totalIssues)
    writeFileSync(reportPath, report, 'utf8')
    log(`\n✅ Reporte guardado: ${reportPath}`, 'green')
  }
  
  log('', 'reset')
  rl.close()
}

function generateReport(filePath, fileData, results, passed, issues) {
  const date = new Date().toISOString().split('T')[0]
  
  let report = `# Rule of Five Review Report

**Archivo:** ${filePath}
**Fecha:** ${date}
**Resultado:** ${passed}/5 filtros pasados
**Issues detectados:** ${issues}

## Análisis del Archivo

- **Tipo:** ${fileData.type}
- **Líneas:** ${fileData.lines}
- **Palabras:** ${fileData.words}
- **Caracteres:** ${fileData.chars}

---

`
  
  results.forEach((result, i) => {
    report += `## [${i + 1}/5] ${result.filter}\n\n`
    
    if (result.autoIssues.length > 0) {
      report += '### Análisis Automático\n\n'
      result.autoIssues.forEach(issue => {
        report += `- ${issue}\n`
      })
      report += '\n'
    }
    
    if (result.answers.length > 0) {
      report += '### Review Manual\n\n'
      result.answers.forEach(a => {
        const status = a.answer.toLowerCase() === 's' ? '✅' : 
                      a.answer.toLowerCase() === 'n' ? '❌' : '❓'
        report += `${status} ${a.question}\n`
        if (a.detail) {
          report += `   → ${a.detail}\n`
        }
      })
      report += '\n'
    }
    
    report += '---\n\n'
  })
  
  report += `## Recomendaciones\n\n`
  
  if (passed === 5) {
    report += `✅ El archivo está en excelente estado. No requiere cambios inmediatos.\n`
  } else if (passed >= 3) {
    report += `⚠️  El archivo está mayormente bien, pero requiere atención en los filtros que fallaron.\n\n`
    report += `Prioridad:\n`
    results.forEach((r, i) => {
      const fails = r.answers.filter(a => a.answer.toLowerCase() === 'n').length
      const autoIssues = r.autoIssues.length
      if (fails > 0 || autoIssues > 0) {
        report += `- **${r.filter}:** ${fails + autoIssues} issues\n`
      }
    })
  } else {
    report += `❌ El archivo requiere trabajo significativo antes de estar listo.\n\n`
    report += `Recomendaciones:\n`
    report += `1. Revisar cada filtro que falló\n`
    report += `2. Aplicar correcciones\n`
    report += `3. Re-ejecutar este review\n`
  }
  
  report += `\n---\n\n*Generado por rule-of-five.cjs*\n`
  
  return report
}

// Run
main().catch(err => {
  log(`\n❌ Error: ${err.message}`, 'red')
  rl.close()
  process.exit(1)
})
