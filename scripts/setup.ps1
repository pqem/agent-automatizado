# setup.ps1 - Instala agent-auto globalmente
# Ejecutar como: .\scripts\setup.ps1

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 Instalando agent-auto...`n" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir
$BinDir = Join-Path $env:USERPROFILE ".agent-auto\bin"
$ConfigDir = Join-Path $env:USERPROFILE ".agent-auto\config"

# Crear directorios
Write-Host "📁 Creando directorios..."
New-Item -ItemType Directory -Path $BinDir -Force | Out-Null
New-Item -ItemType Directory -Path $ConfigDir -Force | Out-Null

# Crear wrapper script
$WrapperContent = @"
#!/usr/bin/env pwsh
node "$ProjectDir\src\cli.js" `$args
"@

$WrapperPath = Join-Path $BinDir "agent-auto.ps1"
Set-Content -Path $WrapperPath -Value $WrapperContent -Force

# Crear batch wrapper para cmd.exe
$BatchContent = @"
@echo off
node "$ProjectDir\src\cli.js" %*
"@

$BatchPath = Join-Path $BinDir "agent-auto.cmd"
Set-Content -Path $BatchPath -Value $BatchContent -Force

Write-Host "  ✓ Scripts creados" -ForegroundColor Green

# Agregar al PATH si no está
$CurrentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($CurrentPath -notlike "*$BinDir*") {
    Write-Host "📍 Agregando al PATH..."
    [Environment]::SetEnvironmentVariable("PATH", "$CurrentPath;$BinDir", "User")
    $env:PATH = "$env:PATH;$BinDir"
    Write-Host "  ✓ PATH actualizado" -ForegroundColor Green
} else {
    Write-Host "  ✓ Ya está en PATH" -ForegroundColor Green
}

# Copiar config por defecto
$DefaultConfig = Join-Path $ProjectDir "config\settings.json"
$UserConfig = Join-Path $ConfigDir "settings.json"
if (-not (Test-Path $UserConfig)) {
    Copy-Item $DefaultConfig $UserConfig
    Write-Host "  ✓ Configuración copiada" -ForegroundColor Green
}

# Instalar dependencias si no existen
$NodeModules = Join-Path $ProjectDir "node_modules"
if (-not (Test-Path $NodeModules)) {
    Write-Host "📦 Instalando dependencias..."
    Push-Location $ProjectDir
    npm install --silent
    Pop-Location
    Write-Host "  ✓ Dependencias instaladas" -ForegroundColor Green
}

Write-Host "`n✅ Instalación completada!`n" -ForegroundColor Green
Write-Host "Uso:" -ForegroundColor Yellow
Write-Host "  agent-auto new     # Crear proyecto con wizard"
Write-Host "  agent-auto init    # Inicializar proyecto existente"
Write-Host "  agent-auto sync    # Sincronizar a IDEs"
Write-Host "  agent-auto detect  # Ver info del proyecto"
Write-Host ""
Write-Host "⚠ Reinicia tu terminal para usar 'agent-auto'" -ForegroundColor Yellow
Write-Host ""
