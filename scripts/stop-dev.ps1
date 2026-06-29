$ports = @(3000, 3001)
foreach ($port in $ports) {
  Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object {
      Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
    }
}

$lockFile = Join-Path $PSScriptRoot ".." ".next" "dev" "lock"
if (Test-Path $lockFile) {
  Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
}

Write-Host "Dev server stopped."
