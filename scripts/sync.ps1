# sync.ps1 - Sincroniza AGENTS.md y skills a todos los IDEs
# Uso: .\sync.ps1 [-Symlinks] [-Only claude,copilot]

param(
    [switch]$Symlinks,
    [string]$Only = ""
)

$ErrorActionPreference = "Stop"

# Colores
function Write-Success { Write-Host "  ✓ $args" -ForegroundColor Green }
function Write-Info { Write-Host "  → $args" -ForegroundColor Cyan }
function Write-Warn { Write-Host "  ⚠ $args" -ForegroundColor Yellow }

$ProjectPath = Get-Location
$AgentsMd = Join-Path $ProjectPath "AGENTS.md"
$SkillsDir = Join-Path $ProjectPath "skills"

if (-not (Test-Path $AgentsMd)) {
    Write-Warn "No se encontró AGENTS.md. Ejecuta 'agent-auto init' primero."
    exit 1
}

Write-Host "`n🔄 Sincronizando a IDEs...`n" -ForegroundColor Cyan
Write-Host "📋 Modo: $(if ($Symlinks) { 'symlinks' } else { 'copia' })`n"

$IDEs = @{
    "claude" = @{
        "dir" = ".claude"
        "file" = "CLAUDE.md"
        "skills" = ".claude\skills"
    }
    "copilot" = @{
        "dir" = ".github"
        "file" = ".github\copilot-instructions.md"
        "skills" = ".github\skills"
    }
    "codex" = @{
        "dir" = ".codex"
        "file" = ".codex\AGENTS.md"
        "skills" = ".codex\skills"
    }
    "gemini" = @{
        "file" = "GEMINI.md"
    }
    "cursor" = @{
        "dir" = ".cursor"
        "file" = ".cursorrules"
        "file2" = ".cursor\rules.md"
    }
    "warp" = @{
        "dir" = ".warp"
        "file" = ".warp\rules.md"
    }
}

$OnlyList = if ($Only) { $Only -split "," } else { $IDEs.Keys }

foreach ($ide in $IDEs.Keys) {
    if ($ide -notin $OnlyList) { continue }
    
    $config = $IDEs[$ide]
    Write-Info "$ide..."
    
    try {
        # Crear directorio si existe
        if ($config.dir) {
            $dir = Join-Path $ProjectPath $config.dir
            if (-not (Test-Path $dir)) {
                New-Item -ItemType Directory -Path $dir -Force | Out-Null
            }
        }
        
        # Copiar/enlazar archivo principal
        $dest = Join-Path $ProjectPath $config.file
        if (Test-Path $dest) { Remove-Item $dest -Force }
        
        if ($Symlinks) {
            New-Item -ItemType SymbolicLink -Path $dest -Target $AgentsMd -Force | Out-Null
        } else {
            Copy-Item $AgentsMd $dest -Force
        }
        
        # Archivo secundario (cursor tiene dos)
        if ($config.file2) {
            $dest2 = Join-Path $ProjectPath $config.file2
            if (Test-Path $dest2) { Remove-Item $dest2 -Force }
            if ($Symlinks) {
                New-Item -ItemType SymbolicLink -Path $dest2 -Target $AgentsMd -Force | Out-Null
            } else {
                Copy-Item $AgentsMd $dest2 -Force
            }
        }
        
        # Skills
        if ($config.skills -and (Test-Path $SkillsDir)) {
            $skillsDest = Join-Path $ProjectPath $config.skills
            if (Test-Path $skillsDest) { Remove-Item $skillsDest -Recurse -Force }
            
            if ($Symlinks) {
                # Junction funciona sin admin en Windows
                cmd /c mklink /J "$skillsDest" "$SkillsDir" 2>$null | Out-Null
            } else {
                Copy-Item $SkillsDir $skillsDest -Recurse -Force
            }
        }
        
        Write-Success $ide
    } catch {
        Write-Warn "$ide - Error: $_"
    }
}

Write-Host "`n✅ Sincronización completada!`n" -ForegroundColor Green
