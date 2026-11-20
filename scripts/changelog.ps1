# Генерация CHANGELOG.md из conventional commits (git log).
# Запуск: pwsh scripts/changelog.ps1 [-Version "0.2.0"] [-SinceTag "v0.1.0"]
param(
    [string]$Version = "",
    [string]$SinceTag = ""
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
Set-Location (Split-Path -Parent $PSScriptRoot)

# Определяем базовый тег
if (-not $SinceTag) {
    try { $SinceTag = (git describe --tags --abbrev=0 2>$null) } catch { $SinceTag = "" }
}
if ($SinceTag) { $range = "$SinceTag..HEAD" } else { $range = "HEAD" }

# Получаем коммиты
$log = git -c i18n.logOutputEncoding=utf-8 log $range --pretty=format:"%s" 2>$null
if (-not $log) {
    Write-Host "Нет коммитов для changelog."
    exit 0
}

# Группировка по типам conventional commits
$groups = [ordered]@{
    "Added"   = @()
    "Fixed"   = @()
    "Changed" = @()
    "Docs"    = @()
    "Chore"   = @()
    "Other"   = @()
}

foreach ($line in ($log -split "`n")) {
    $line = $line.Trim()
    if (-not $line) { continue }
    $type = ""
    $msg = $line
    if ($line -match "^(\w+)(\(.+\))?!?:\s*(.+)$") {
        $type = $Matches[1].ToLower()
        $msg = $Matches[3]
    }
    $entry = "- $msg"
    switch ($type) {
        "feat"     { $groups["Added"] += $entry }
        "fix"      { $groups["Fixed"] += $entry }
        "refactor" { $groups["Changed"] += $entry }
        "perf"     { $groups["Changed"] += $entry }
        "docs"     { $groups["Docs"] += $entry }
        "chore"    { $groups["Chore"] += $entry }
        "ci"       { $groups["Chore"] += $entry }
        "build"    { $groups["Chore"] += $entry }
        "test"     { $groups["Chore"] += $entry }
        "style"    { $groups["Changed"] += $entry }
        default    { $groups["Other"] += $entry }
    }
}

# Собираем markdown
$sb = New-Object System.Text.StringBuilder
$sections = @("Added","Fixed","Changed","Docs","Chore","Other")
foreach ($sec in $sections) {
    if ($groups[$sec].Count -gt 0) {
        [void]$sb.AppendLine("### $sec")
        foreach ($e in $groups[$sec]) { [void]$sb.AppendLine($e) }
        [void]$sb.AppendLine()
    }
}
$generated = $sb.ToString().TrimEnd()

# Читаем текущий CHANGELOG
$path = "CHANGELOG.md"
if (Test-Path $path) { $content = Get-Content $path -Raw -Encoding UTF8 } else { $content = "# Changelog`n`n" }

# Формируем заголовок версии
$today = Get-Date -Format "yyyy-MM-dd"
if ($Version) {
    $header = "## [$Version] - $today"
} else {
    $header = "## [Unreleased]"
}

# Заменяем секцию Unreleased (или добавляем)
if ($content -match "(?s)## \[Unreleased\].*?(?=\n## |\z)") {
    $newSection = "$header`n`n$generated`n`n"
    $content = [regex]::Replace($content, "(?s)## \[Unreleased\].*?(?=\n## |\z)", $newSection.TrimEnd(), 1)
} else {
    # вставляем после заголовка
    $content = $content -replace "(# Changelog[^\n]*\n)", "`$1`n$header`n`n$generated`n`n"
}

# Если указана версия — добавляем новый пустой Unreleased сверху
if ($Version) {
    $content = $content -replace "(# Changelog[^\n]*\n)", "`$1`n## [Unreleased]`n`n"
}

Set-Content -Path $path -Value $content -Encoding UTF8
Write-Host "CHANGELOG.md обновлён ($header)."
Write-Host $generated