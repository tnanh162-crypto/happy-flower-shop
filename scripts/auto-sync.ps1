$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$git = "D:\Git\Git\cmd\git.exe"
if (-not (Test-Path $git)) { $git = "git" }
Set-Location $projectRoot

Write-Host "Auto-sync dang chay. Moi thay doi se commit va push sau 3 giay." -ForegroundColor Cyan
Write-Host "Nhan Ctrl+C de dung." -ForegroundColor DarkGray

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $projectRoot
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]::FileName -bor [System.IO.NotifyFilters]::LastWrite -bor [System.IO.NotifyFilters]::DirectoryName

$ignored = @("\.git(\\|$)", "\\node_modules(\\|$)", "\\.next[^\\]*\\", "\\data\\.*\.db", "\\.env\.local$")
$pending = $false
$lastChange = Get-Date

$action = {
  if ($Event.SourceEventArgs.FullPath -notmatch ($ignored -join "|")) {
    $script:pending = $true
    $script:lastChange = Get-Date
  }
}

Register-ObjectEvent $watcher Created -Action $action | Out-Null
Register-ObjectEvent $watcher Changed -Action $action | Out-Null
Register-ObjectEvent $watcher Deleted -Action $action | Out-Null
Register-ObjectEvent $watcher Renamed -Action $action | Out-Null

try {
  while ($true) {
    Wait-Event -Timeout 1 | Out-Null
    if (-not $pending -or ((Get-Date) - $lastChange).TotalSeconds -lt 3) { continue }
    $pending = $false
    & $git add -A
    $status = (& $git status --porcelain)
    if (-not $status) { continue }
    $message = "Auto-sync " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    & $git commit -m $message
    if ($LASTEXITCODE -eq 0) {
      & $git push origin main
      if ($LASTEXITCODE -eq 0) { Write-Host "Da push GitHub; Vercel se tu dong deploy." -ForegroundColor Green }
      else { Write-Host "Commit xong nhung push that bai; kiem tra dang nhap GitHub." -ForegroundColor Yellow }
    }
  }
}
finally {
  $watcher.Dispose()
  Get-EventSubscriber | Unregister-Event
}
