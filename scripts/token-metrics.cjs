#!/usr/bin/env node

/**
 * Token Metrics - Usage Tracking & Cost Analysis
 * 
 * Trackea uso de tokens, calcula costos y sugiere optimizaciones.
 * Ayuda a ser estratégico con recursos que no son infinitos.
 * 
 * Uso:
 *   node scripts/token-metrics.cjs track "operacion" input output [model]
 *   node scripts/token-metrics.cjs report
 *   npm run tokens:report
 */

const { readFileSync, writeFileSync, existsSync } = require('fs')
const { join } = require('path')

const METRICS_FILE = '.token-metrics.json'

// Precios por 1K tokens (USD) - Actualizados 2026-01
const TOKEN_COST = {
  'claude-sonnet-4': { input: 0.003, output: 0.015 },
  'claude-sonnet-3.5': { input: 0.003, output: 0.015 },
  'claude-opus-4': { input: 0.015, output: 0.075 },
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  'gemini-pro': { input: 0.0005, output: 0.0015 },
  'gemini-ultra': { input: 0.0125, output: 0.0375 }
}

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

/**
 * Estimar tokens de texto
 * 1 token ≈ 0.75 palabras en español
 * 1 token ≈ 4 caracteres en promedio
 */
function estimateTokens(text) {
  if (!text || typeof text !== 'string') return 0
  
  const words = text.split(/\s+/).filter(w => w.length > 0).length
  const chars = text.length
  
  // Usar promedio de ambos métodos
  const byWords = Math.ceil(words / 0.75)
  const byChars = Math.ceil(chars / 4)
  
  return Math.round((byWords + byChars) / 2)
}

/**
 * Cargar métricas existentes
 */
function loadMetrics() {
  if (!existsSync(METRICS_FILE)) {
    return {
      version: '1.0.0',
      created: new Date().toISOString(),
      budget: {
        monthly: 50.00,  // USD
        warning: 40.00   // Warning threshold
      },
      totals: {
        tokens: 0,
        cost: 0,
        operations: 0
      },
      operations: []
    }
  }
  
  try {
    return JSON.parse(readFileSync(METRICS_FILE, 'utf8'))
  } catch (error) {
    log(`⚠️  Error leyendo métricas: ${error.message}`, 'yellow')
    return loadMetrics() // Return fresh metrics
  }
}

/**
 * Guardar métricas
 */
function saveMetrics(metrics) {
  try {
    writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2), 'utf8')
  } catch (error) {
    log(`❌ Error guardando métricas: ${error.message}`, 'red')
  }
}

/**
 * Trackear una operación
 */
function trackUsage(operation, input, output, model = 'claude-sonnet-4') {
  const metrics = loadMetrics()
  
  const inputTokens = estimateTokens(input)
  const outputTokens = estimateTokens(output)
  const totalTokens = inputTokens + outputTokens
  
  // Calcular costo
  const costs = TOKEN_COST[model] || TOKEN_COST['claude-sonnet-4']
  const cost = (
    (inputTokens / 1000) * costs.input +
    (outputTokens / 1000) * costs.output
  )
  
  // Agregar operación
  metrics.operations.push({
    timestamp: Date.now(),
    date: new Date().toISOString(),
    operation,
    inputTokens,
    outputTokens,
    totalTokens,
    cost,
    model
  })
  
  // Actualizar totales
  metrics.totals.tokens += totalTokens
  metrics.totals.cost += cost
  metrics.totals.operations += 1
  
  saveMetrics(metrics)
  
  // Warning si excede presupuesto
  if (metrics.totals.cost > metrics.budget.warning) {
    log(`\n⚠️  Has usado $${metrics.totals.cost.toFixed(2)} de tu presupuesto mensual ($${metrics.budget.monthly})`, 'yellow')
  }
  
  return { inputTokens, outputTokens, totalTokens, cost }
}

/**
 * Obtener top operaciones por costo
 */
function getTopOperations(metrics, limit = 5) {
  return metrics.operations
    .sort((a, b) => b.cost - a.cost)
    .slice(0, limit)
    .map((op, i) => {
      const costStr = op.cost.toFixed(2)
      const tokensK = (op.totalTokens / 1000).toFixed(1)
      return `${i + 1}. ${op.operation} ($${costStr}, ${tokensK}K tokens) - ${op.model}`
    })
    .join('\n')
}

/**
 * Detectar operaciones repetitivas
 */
function detectRepetitive(operations) {
  const counts = {}
  
  operations.forEach(op => {
    const key = op.operation.toLowerCase()
    counts[key] = (counts[key] || 0) + 1
  })
  
  return Object.entries(counts)
    .filter(([_, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .map(([op, count]) => `${op} (${count}x)`)
}

/**
 * Generar recomendaciones
 */
function getRecommendations(metrics) {
  const recs = []
  
  // Detectar conversaciones largas (> 10K tokens input)
  const longConvs = metrics.operations.filter(op => op.inputTokens > 10000)
  if (longConvs.length > 0) {
    recs.push({
      type: 'optimization',
      priority: 'high',
      message: `${longConvs.length} operaciones con > 10K tokens de input`,
      action: 'Usar conversaciones limpias (npm run clean:context)',
      savings: `~${(longConvs.length * 0.03).toFixed(2)} USD potencial`
    })
  }
  
  // Detectar operaciones repetitivas
  const repetitive = detectRepetitive(metrics.operations)
  if (repetitive.length > 0) {
    recs.push({
      type: 'skill',
      priority: 'medium',
      message: `Operaciones repetitivas detectadas: ${repetitive.slice(0, 3).join(', ')}`,
      action: 'Crear skills para reducir contexto repetido',
      savings: '~30% en operaciones futuras'
    })
  }
  
  // Detectar uso de modelos caros
  const expensiveOps = metrics.operations.filter(op => 
    (op.model.includes('opus') || op.model === 'gpt-4') && op.cost > 0.1
  )
  if (expensiveOps.length > 0) {
    const totalExpensive = expensiveOps.reduce((sum, op) => sum + op.cost, 0)
    const withCheaper = totalExpensive * 0.1 // Sonnet es ~10x más barato
    recs.push({
      type: 'model',
      priority: 'high',
      message: `${expensiveOps.length} operaciones con modelos caros (Opus/GPT-4)`,
      action: 'Considerar claude-sonnet-4 (10x más barato)',
      savings: `~${(totalExpensive - withCheaper).toFixed(2)} USD`
    })
  }
  
  // Check presupuesto
  const usage = (metrics.totals.cost / metrics.budget.monthly) * 100
  if (usage > 80) {
    recs.push({
      type: 'budget',
      priority: 'critical',
      message: `Uso: ${usage.toFixed(1)}% del presupuesto mensual`,
      action: 'Reducir uso o aumentar presupuesto',
      savings: 'Evitar quedarse sin tokens'
    })
  }
  
  return recs
}

/**
 * Generar reporte
 */
function generateReport() {
  const metrics = loadMetrics()
  
  if (metrics.operations.length === 0) {
    log('\n📊 No hay operaciones registradas aún.', 'yellow')
    log('   Usa: node scripts/token-metrics.cjs track "operacion" input output\n', 'cyan')
    return
  }
  
  const usage = (metrics.totals.cost / metrics.budget.monthly) * 100
  
  log('\n📊 Token Usage Report', 'bright')
  log('='.repeat(60), 'reset')
  
  log(`\n💰 Costo total: $${metrics.totals.cost.toFixed(2)}`, 'cyan')
  log(`🎯 Presupuesto mensual: $${metrics.budget.monthly.toFixed(2)}`, 'reset')
  
  const usageColor = usage > 80 ? 'red' : usage > 60 ? 'yellow' : 'green'
  log(`📈 Uso: ${usage.toFixed(1)}%`, usageColor)
  
  log(`\n🔢 Tokens totales: ${(metrics.totals.tokens / 1000).toFixed(1)}K`, 'reset')
  log(`📋 Operaciones: ${metrics.totals.operations}`, 'reset')
  log(`💵 Costo promedio: $${(metrics.totals.cost / metrics.totals.operations).toFixed(3)}/op`, 'reset')
  
  // Top operaciones
  if (metrics.operations.length > 0) {
    log('\n🔝 Top operaciones por costo:', 'blue')
    log(getTopOperations(metrics, 5), 'reset')
  }
  
  // Recomendaciones
  const recommendations = getRecommendations(metrics)
  if (recommendations.length > 0) {
    log('\n💡 Recomendaciones:', 'yellow')
    recommendations.forEach(rec => {
      const priorityColor = rec.priority === 'critical' ? 'red' : 
                           rec.priority === 'high' ? 'yellow' : 'cyan'
      log(`\n[${rec.priority.toUpperCase()}] ${rec.message}`, priorityColor)
      log(`   → ${rec.action}`, 'reset')
      log(`   💰 Ahorro: ${rec.savings}`, 'green')
    })
  } else {
    log('\n✅ Todo óptimo! No hay recomendaciones.', 'green')
  }
  
  // Proyección
  const daysInMonth = 30
  const daysElapsed = new Date().getDate()
  const projected = (metrics.totals.cost / daysElapsed) * daysInMonth
  
  if (projected > metrics.budget.monthly) {
    log(`\n⚠️  Proyección fin de mes: $${projected.toFixed(2)} (excede presupuesto)`, 'red')
  } else {
    log(`\n📊 Proyección fin de mes: $${projected.toFixed(2)}`, 'cyan')
  }
  
  log('', 'reset')
}

/**
 * Reset métricas (nuevo mes)
 */
function resetMetrics() {
  const metrics = loadMetrics()
  const oldFile = `.token-metrics-${new Date().toISOString().slice(0, 7)}.json`
  
  // Backup del mes anterior
  if (metrics.operations.length > 0) {
    writeFileSync(oldFile, JSON.stringify(metrics, null, 2), 'utf8')
    log(`✅ Backup guardado: ${oldFile}`, 'green')
  }
  
  // Reset
  const fresh = {
    version: '1.0.0',
    created: new Date().toISOString(),
    budget: metrics.budget, // Mantener presupuesto
    totals: {
      tokens: 0,
      cost: 0,
      operations: 0
    },
    operations: []
  }
  
  saveMetrics(fresh)
  log('✅ Métricas reseteadas para nuevo mes', 'green')
}

/**
 * Configurar presupuesto
 */
function setBudget(monthly, warning) {
  const metrics = loadMetrics()
  metrics.budget.monthly = parseFloat(monthly)
  metrics.budget.warning = parseFloat(warning || monthly * 0.8)
  saveMetrics(metrics)
  log(`✅ Presupuesto actualizado: $${monthly}/mes (warning: $${metrics.budget.warning})`, 'green')
}

/**
 * Main
 */
function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  if (!command) {
    log('\n📊 Token Metrics - Usage Tracking', 'bright')
    log('='.repeat(60), 'reset')
    log('\nComandos:', 'cyan')
    log('  report              Ver reporte de uso', 'reset')
    log('  track OP IN OUT     Trackear operación', 'reset')
    log('  reset               Reset métricas (nuevo mes)', 'reset')
    log('  budget AMOUNT       Configurar presupuesto mensual', 'reset')
    log('\nEjemplos:', 'yellow')
    log('  npm run tokens:report', 'reset')
    log('  node scripts/token-metrics.cjs track "investigación" "$(cat input.txt)" "$(cat output.txt)"', 'reset')
    log('  node scripts/token-metrics.cjs budget 100\n', 'reset')
    return
  }
  
  switch (command) {
    case 'report':
      generateReport()
      break
      
    case 'track':
      if (args.length < 4) {
        log('❌ Uso: token-metrics.cjs track "operacion" input output [model]', 'red')
        return
      }
      const [, operation, input, output, model] = args
      const result = trackUsage(operation, input, output, model)
      log(`✅ Operación trackeada: ${result.totalTokens} tokens, $${result.cost.toFixed(4)}`, 'green')
      break
      
    case 'reset':
      resetMetrics()
      break
      
    case 'budget':
      if (args.length < 2) {
        log('❌ Uso: token-metrics.cjs budget AMOUNT [WARNING]', 'red')
        return
      }
      setBudget(args[1], args[2])
      break
      
    default:
      log(`❌ Comando desconocido: ${command}`, 'red')
      log('   Usa: report | track | reset | budget', 'reset')
  }
}

// Run
main()
