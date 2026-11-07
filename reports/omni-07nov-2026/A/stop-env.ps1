# Usage: powershell -NoProfile -File stop-env.ps1 <repo-dir-name> <upstash-port> <brevo-port> <stripe-port> <run-dev-slug>
# Kills only the node processes of ONE local QA environment (dev/prod server + its three mocks), matched by command line.
param([string]$Repo, [int]$Up, [int]$Br, [int]$St, [string]$Slug)
$pat = "business-.*$Repo|mock-server\.cjs ($Up|$Br|$St) |run-dev\.cjs $Slug |run-prod\.cjs $Slug "
$me = $PID
Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
  Where-Object { $_.CommandLine -match $pat -and $_.CommandLine -match "(\$Repo\|mock-server|run-dev|run-prod)" } |
  ForEach-Object { Write-Output ("kill {0}" -f $_.ProcessId); Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
