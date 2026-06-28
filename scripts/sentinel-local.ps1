# Perpetual Sentinel — LOCAL mirror (optional second layer).
# The GitHub Actions cron is the always-on engine (runs even with this PC off).
# This wrapper lets Windows Task Scheduler write the heartbeat to ./logs locally
# whenever the machine IS on, so you can open the green file without a git pull.
#
# Register once (runs daily at 05:10 local; offset from the cloud cron):
#   schtasks /Create /SC DAILY /ST 05:10 /TN "PerpetualSentinel" ^
#     /TR "powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\ftass\toolkit-online\scripts\sentinel-local.ps1"
#
# It just runs the same zero-dep sentinel.mjs, which writes
# logs/daily_sentinel_heartbeat.json. Open that file and read "status".

$ErrorActionPreference = "Stop"
$repo = "C:\Users\ftass\toolkit-online"
Set-Location $repo
# Optional: load secrets for self-heal/alert from a gitignored env file if present.
$envFile = Join-Path $repo ".env.sentinel"
if (Test-Path $envFile) {
  Get-Content $envFile | Where-Object { $_ -match "^\s*[^#].*=" } | ForEach-Object {
    $kv = $_ -split "=", 2
    [System.Environment]::SetEnvironmentVariable($kv[0].Trim(), $kv[1].Trim(), "Process")
  }
}
node "$repo\scripts\sentinel.mjs"
$hb = Join-Path $repo "logs\daily_sentinel_heartbeat.json"
if (Test-Path $hb) {
  $status = (Get-Content $hb -Raw | ConvertFrom-Json).status
  Write-Host "Heartbeat written: $hb -> $status"
}
