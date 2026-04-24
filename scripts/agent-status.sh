#!/bin/bash
# =============================================================================
# AGENT STATUS — Mostra lo stato dell'agente autonomo
# =============================================================================
# Uso: ./agent-status.sh
# =============================================================================

STATE_DIR="C:/Users/ftass/toolkit-online/scripts/agent-state"
LOG_DIR="C:/Users/ftass/toolkit-online/scripts/agent-logs"

echo "=========================================="
echo "  AGENTE AUTONOMO — STATUS"
echo "  $(date '+%Y-%m-%d %H:%M')"
echo "=========================================="
echo ""

# Controlla lock
if [ -f "$STATE_DIR/agent.lock" ]; then
    echo "🔒 AGENTE IN ESECUZIONE (PID: $(cat "$STATE_DIR/agent.lock"))"
else
    echo "💤 Agente idle"
fi
echo ""

# Mostra ultimo run per ogni task
echo "--- ULTIMO RUN PER TASK ---"
TASKS="morning-routine content-creation build-security midday-outreach afternoon-check evening-report pinterest supervisor weekly-upgrade weekly-blog"

for task in $TASKS; do
    FILE="$STATE_DIR/last-run-${task}.md"
    if [ -f "$FILE" ]; then
        MOD_TIME=$(date -r "$FILE" '+%Y-%m-%d %H:%M' 2>/dev/null || stat -c '%y' "$FILE" 2>/dev/null | cut -c1-16)
        echo "  $task: ultimo run $MOD_TIME"
    else
        echo "  $task: MAI ESEGUITO"
    fi
done
echo ""

# Controlla se serve azione utente
if [ -f "$STATE_DIR/needs-user-action.md" ]; then
    echo "⚠️  AZIONE UTENTE RICHIESTA:"
    cat "$STATE_DIR/needs-user-action.md"
    echo ""
fi

# Mostra ultimi errori dai log
echo "--- ULTIMI ERRORI (se presenti) ---"
grep -l "ERRORE\|ERROR\|ALLARME" "$LOG_DIR"/*.log 2>/dev/null | tail -5 | while read f; do
    echo "  $(basename "$f"):"
    grep "ERRORE\|ERROR\|ALLARME" "$f" | tail -2 | sed 's/^/    /'
done
echo ""

echo "Log dir: $LOG_DIR"
echo "State dir: $STATE_DIR"
