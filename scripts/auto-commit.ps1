# Автоматический коммит и пуш изменений (запускать периодически)
param([string]$Message = "chore: auto-update")

$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)

git add -A
$status = git status --porcelain
if (-not $status) { Write-Host "No changes to commit."; exit 0 }

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "$Message ($timestamp)"
git push origin main
Write-Host "Committed and pushed."
