# =============================================================================
# SETUP WINDOWS TASK SCHEDULER — Agente Autonomo DevToolsmith
# =============================================================================
# Esegui come Amministratore:
#   powershell -ExecutionPolicy Bypass -File setup-windows-scheduler.ps1
#
# Questo script crea i task in Windows Task Scheduler che lanciano
# l'agente autonomo Claude Code a orari prestabiliti.
# =============================================================================

$AgentScript = "C:\Users\ftass\toolkit-online\scripts\autonomous-agent.sh"
$BashPath = "C:\Program Files\Git\bin\bash.exe"
$TaskFolder = "DevToolsmith"

# Verifica che bash esista
if (-not (Test-Path $BashPath)) {
    $BashPath = "C:\Program Files\Git\usr\bin\bash.exe"
    if (-not (Test-Path $BashPath)) {
        Write-Error "Git Bash non trovato. Installa Git for Windows."
        exit 1
    }
}

Write-Host "=== Setup Agente Autonomo DevToolsmith ===" -ForegroundColor Cyan
Write-Host "Bash: $BashPath"
Write-Host "Script: $AgentScript"
Write-Host ""

# Definisci i task
$tasks = @(
    @{ Name="morning-routine";   Time="09:03"; Days="Monday,Tuesday,Wednesday,Thursday,Friday,Saturday" },
    @{ Name="content-creation";  Time="10:33"; Days="Monday,Tuesday,Wednesday,Thursday,Friday,Saturday" },
    @{ Name="build-security";    Time="11:03"; Days="Monday,Tuesday,Wednesday,Thursday,Friday,Saturday" },
    @{ Name="midday-outreach";   Time="12:03"; Days="Monday,Tuesday,Wednesday,Thursday,Friday,Saturday" },
    @{ Name="afternoon-check";   Time="16:03"; Days="Monday,Tuesday,Wednesday,Thursday,Friday,Saturday" },
    @{ Name="evening-report";    Time="19:03"; Days="Monday,Tuesday,Wednesday,Thursday,Friday,Saturday" },
    @{ Name="pinterest";         Time="20:03"; Days="Monday,Tuesday,Wednesday,Thursday,Friday,Saturday" },
    @{ Name="supervisor";        Time="21:03"; Days="Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday" },
    @{ Name="weekly-upgrade";    Time="15:03"; Days="Saturday" },
    @{ Name="weekly-blog";       Time="10:03"; Days="Sunday" }
)

foreach ($task in $tasks) {
    $taskName = "$TaskFolder\agent-$($task.Name)"

    # Rimuovi task esistente se presente
    $existing = Get-ScheduledTask -TaskName "agent-$($task.Name)" -TaskPath "\$TaskFolder\" -ErrorAction SilentlyContinue
    if ($existing) {
        Unregister-ScheduledTask -TaskName "agent-$($task.Name)" -TaskPath "\$TaskFolder\" -Confirm:$false
        Write-Host "  Rimosso task esistente: $taskName" -ForegroundColor Yellow
    }

    # Crea trigger
    $timeParts = $task.Time.Split(":")
    $hour = [int]$timeParts[0]
    $minute = [int]$timeParts[1]

    $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek ($task.Days.Split(",")) -At "$($task.Time):00"

    # Crea azione
    $action = New-ScheduledTaskAction `
        -Execute $BashPath `
        -Argument "-c '$AgentScript $($task.Name)'" `
        -WorkingDirectory "C:\Users\ftass\toolkit-online"

    # Impostazioni
    $settings = New-ScheduledTaskSettingsSet `
        -AllowStartIfOnBatteries `
        -DontStopIfGoingOnBatteries `
        -StartWhenAvailable `
        -ExecutionTimeLimit (New-TimeSpan -Minutes 30) `
        -RestartCount 1 `
        -RestartInterval (New-TimeSpan -Minutes 5)

    # Registra task
    Register-ScheduledTask `
        -TaskName "agent-$($task.Name)" `
        -TaskPath "\$TaskFolder\" `
        -Trigger $trigger `
        -Action $action `
        -Settings $settings `
        -Description "DevToolsmith autonomous agent: $($task.Name)" `
        -RunLevel Limited

    Write-Host "  Creato: $taskName @ $($task.Time) [$($task.Days)]" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== FATTO! $($tasks.Count) task creati ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Per vedere i task: Task Scheduler > DevToolsmith" -ForegroundColor White
Write-Host "Per i log: C:\Users\ftass\toolkit-online\scripts\agent-logs\" -ForegroundColor White
Write-Host "Per lo stato: C:\Users\ftass\toolkit-online\scripts\agent-state\" -ForegroundColor White
Write-Host ""
Write-Host "NOTA: I task richiedono che il PC sia acceso e l'utente loggato." -ForegroundColor Yellow
Write-Host "Se il PC e spento all'ora del task, verra eseguito al prossimo avvio" -ForegroundColor Yellow
Write-Host "(grazie a StartWhenAvailable)." -ForegroundColor Yellow
