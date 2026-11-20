# Настройка GitHub-репозитория OGMOP: ветка main, защита, Pages.
# Запуск: pwsh scripts/setup-github.ps1
param(
  [string]$Repo = "Em-pechenki/OGMOP",
  [string]$DefaultBranch = "main"
)

$ErrorActionPreference = "Stop"

function Require-Gh {
  if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "GitHub CLI (gh) не установлен. Установите: https://cli.github.com/"
  }
}

Require-Gh

Write-Host "Проверка аутентификации gh..."
gh auth status | Out-Null

Write-Host "Установка ветки по умолчанию: $DefaultBranch"
gh repo edit $Repo --default-branch $DefaultBranch

Write-Host "Включение GitHub Pages (source: GitHub Actions)..."
gh api -X PUT "repos/$Repo/pages" -f "build_type=workflow" 2>$null | Out-Null

Write-Host "Готово. Pages URL: https://Em-pechenki.github.io/OGMOP/"
Write-Host "CI/CD: .github/workflows/ci.yml и deploy.yml"