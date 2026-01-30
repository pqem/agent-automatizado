#!/usr/bin/env node

/**
 * Update CONTEXT-RECOVERY.md with current workspace state
 * 
 * Usage:
 *   node scripts/update-context-recovery.js [workspace-path]
 * 
 * If no path provided, uses parent directory of script location.
 */

const { execSync } = require('child_process')
const { existsSync, readFileSync, writeFileSync } = require('fs')
const { join, basename } = require('path')

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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

function getGitStatus(workspaceDir) {
  const status = {}
  
  // Current branch
  status.branch = exec('git rev-parse --abbrev-ref HEAD', { cwd: workspaceDir })
  
  // Commits ahead/behind
  const aheadBehind = exec('git rev-list --left-right --count origin/master...HEAD 2>/dev/null', { cwd: workspaceDir })
  if (aheadBehind) {
    const [behind, ahead] = aheadBehind.split('\t')
    status.commitsAhead = parseInt(ahead) || 0
    status.commitsBehind = parseInt(behind) || 0
  } else {
    status.commitsAhead = 0
    status.commitsBehind = 0
  }
  
  // Last commit
  status.lastCommit = exec('git log -1 --oneline', { cwd: workspaceDir })
  status.lastCommitHash = exec('git log -1 --format=%h', { cwd: workspaceDir })
  status.lastCommitDate = exec('git log -1 --format=%ci', { cwd: workspaceDir })
  
  // Working tree status
  const workingTreeStatus = exec('git status --porcelain', { cwd: workspaceDir })
  status.workingTreeClean = !workingTreeStatus || workingTreeStatus.length === 0
  status.modifiedFiles = workingTreeStatus ? workingTreeStatus.split('\n').length : 0
  
  return status
}

function getProjectInfo(workspaceDir) {
  const info = {}
  
  // Project name from directory
  info.name = basename(workspaceDir)
  
  // Try to get description from package.json
  const packageJsonPath = join(workspaceDir, 'package.json')
  if (existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
      info.description = pkg.description || 'No description available'
    } catch (err) {
      info.description = 'No description available'
    }
  }
  
  // Try to get description from README.md (first line after title)
  const readmePath = join(workspaceDir, 'README.md')
  if (existsSync(readmePath)) {
    try {
      const readme = readFileSync(readmePath, 'utf8')
      const lines = readme.split('\n').filter(l => l.trim())
      // Skip title (# ...) and find first non-empty, non-badge line
      for (const line of lines.slice(1)) {
        if (!line.startsWith('#') && 
            !line.startsWith('[!') && 
            !line.startsWith('[![') &&
            line.length > 20) {
          info.description = line.replace(/^\*\*/, '').replace(/\*\*$/, '')
          break
        }
      }
    } catch (err) {
      // Ignore
    }
  }
  
  return info
}

function detectNextStep(workspaceDir, gitStatus) {
  // Heuristics for next step
  
  if (gitStatus.commitsAhead > 0) {
    return `git push origin ${gitStatus.branch} (${gitStatus.commitsAhead} commits pendientes)`
  }
  
  if (!gitStatus.workingTreeClean) {
    return `Commitear cambios (${gitStatus.modifiedFiles} archivos modificados)`
  }
  
  // Check ROADMAP.md or TODO.md
  const roadmapPath = join(workspaceDir, 'docs', 'ROADMAP.md')
  if (existsSync(roadmapPath)) {
    try {
      const roadmap = readFileSync(roadmapPath, 'utf8')
      const uncheckedTask = roadmap.match(/- \[ \] (.+)/m)
      if (uncheckedTask) {
        return `Próxima tarea: ${uncheckedTask[1]}`
      }
    } catch (err) {
      // Ignore
    }
  }
  
  return 'Workspace limpio. Ver ROADMAP.md para próximas tareas.'
}

function generateContextRecovery(workspaceDir) {
  const now = new Date()
  const timestamp = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
  const dateOnly = now.toISOString().split('T')[0]
  
  const project = getProjectInfo(workspaceDir)
  const git = getGitStatus(workspaceDir)
  const nextStep = detectNextStep(workspaceDir, git)
  
  const content = `# Context Recovery - Estado Actual del Workspace

**Última actualización:** ${timestamp}

## 🎯 Proyecto Activo

**Nombre:** ${project.name}
**Ubicación:** ${workspaceDir}
**Descripción:** ${project.description || 'No description available'}

## 📦 Estado del Repositorio

**Branch:** ${git.branch || 'unknown'}
**Commits pendientes:** ${git.commitsAhead > 0 ? `${git.commitsAhead} commits ahead of origin/${git.branch}` : 'ninguno'}
**Working tree:** ${git.workingTreeClean ? 'clean' : `${git.modifiedFiles} archivos modificados`}

**Último commit:**
\`\`\`
${git.lastCommit || 'No commits yet'}
\`\`\`
*${git.lastCommitDate || 'N/A'}*

## 🔜 Próximo Paso

${nextStep}

## 📝 Decisiones Recientes

Ver \`memory/${dateOnly}.md\` para decisiones del día.

## 🐛 Issues Conocidos

Ninguno actualmente. Ver GitHub Issues para tracking completo.

## 💡 Notas Importantes

- Este archivo se actualiza automáticamente
- Para contexto detallado ver: \`memory/\${dateOnly}.md\`
- Para historial completo ver: \`MEMORY.md\`

---

*Generado automáticamente por \`scripts/update-context-recovery.js\`*
*Si perdés contexto, leé este archivo primero.*
`

  return content
}

function main() {
  const args = process.argv.slice(2)
  let workspaceDir = args[0]
  
  // If no workspace provided, use parent of script directory
  if (!workspaceDir) {
    workspaceDir = join(__dirname, '..')
  }
  
  // Validate workspace
  if (!existsSync(workspaceDir)) {
    log(`❌ Error: Workspace no existe: ${workspaceDir}`, 'red')
    process.exit(1)
  }
  
  // Check if git repo
  const gitDir = join(workspaceDir, '.git')
  if (!existsSync(gitDir)) {
    log(`⚠️  Warning: No es un repositorio git: ${workspaceDir}`, 'yellow')
  }
  
  log('🔄 Actualizando CONTEXT-RECOVERY.md...', 'blue')
  
  try {
    const content = generateContextRecovery(workspaceDir)
    const outputPath = join(workspaceDir, 'CONTEXT-RECOVERY.md')
    
    writeFileSync(outputPath, content, 'utf8')
    
    log(`✅ CONTEXT-RECOVERY.md actualizado: ${outputPath}`, 'green')
    
    // Show summary
    const lines = content.split('\n')
    const projectLine = lines.find(l => l.startsWith('**Nombre:**'))
    const commitLine = lines.find(l => l.startsWith('**Commits pendientes:**'))
    const nextStepIndex = lines.findIndex(l => l.startsWith('## 🔜'))
    const nextStep = nextStepIndex >= 0 ? lines[nextStepIndex + 2] : 'N/A'
    
    log('\n📊 Resumen:', 'blue')
    log(`   ${projectLine}`, 'reset')
    log(`   ${commitLine}`, 'reset')
    log(`   Próximo: ${nextStep}`, 'reset')
    
  } catch (error) {
    log(`❌ Error al generar CONTEXT-RECOVERY.md: ${error.message}`, 'red')
    process.exit(1)
  }
}

main()
