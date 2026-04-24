#!/bin/bash
# =============================================================================
# AGENTE AUTONOMO v2 — DevToolsmith Portfolio
# =============================================================================
# Lancia Claude Code in modalita autonoma + invia notifica email.
# Chiamato da Windows Task Scheduler a orari prestabiliti.
#
# Uso: ./autonomous-agent.sh <task-name>
# =============================================================================

set -e

# --- Assicura che claude sia nel PATH (Task Scheduler potrebbe non avere il PATH completo) ---
export PATH="$HOME/.local/bin:$PATH"

# --- Carica API key Anthropic per auth autonoma (evita problemi OAuth token scaduto) ---
ENV_AGENT="C:/Users/ftass/toolkit-online/scripts/.env.agent"
if [ -f "$ENV_AGENT" ]; then
    set -a  # auto-export tutte le variabili
    source "$ENV_AGENT"
    set +a
fi
# Verifica che la key sia caricata
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "$(date): ERRORE — ANTHROPIC_API_KEY non trovata in $ENV_AGENT" >> "${LOG_DIR:-/tmp}/${1:-agent}_error.log"
fi

TASK_NAME="${1:-supervisor}"
WORK_DIR="C:/Users/ftass/toolkit-online"
STATE_DIR="C:/Users/ftass/toolkit-online/scripts/agent-state"
LOG_DIR="C:/Users/ftass/toolkit-online/scripts/agent-logs"
NOTIFY_SCRIPT="C:/Users/ftass/toolkit-online/scripts/send-notification.sh"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M)

mkdir -p "$STATE_DIR" "$LOG_DIR"

LOG_FILE="$LOG_DIR/${TASK_NAME}_${TIMESTAMP}.log"

# --- Lock anti-duplicazione ---
LOCK_FILE="$STATE_DIR/agent.lock"
if [ -f "$LOCK_FILE" ]; then
    LOCK_AGE=$(($(date +%s) - $(date -r "$LOCK_FILE" +%s 2>/dev/null || echo 0)))
    if [ "$LOCK_AGE" -lt 1800 ]; then
        echo "$(date): Altra istanza in esecuzione (lock age: ${LOCK_AGE}s). Skip." >> "$LOG_FILE"
        exit 0
    fi
    rm -f "$LOCK_FILE"
fi
echo "$$" > "$LOCK_FILE"
trap "rm -f '$LOCK_FILE'" EXIT

echo "$(date): === AVVIO TASK '$TASK_NAME' ===" >> "$LOG_FILE"

# --- Carica prompt ---
PROMPT_FILE="$WORK_DIR/scripts/agent-prompts/${TASK_NAME}.md"
if [ ! -f "$PROMPT_FILE" ]; then
    echo "$(date): ERRORE — prompt non trovato: $PROMPT_FILE" >> "$LOG_FILE"
    bash "$NOTIFY_SCRIPT" "[ERRORE] Agent: prompt $TASK_NAME non trovato" "Il file $PROMPT_FILE non esiste. L'agente non puo eseguire questo task."
    exit 1
fi

PROMPT=$(cat "$PROMPT_FILE")
CURRENT_DATE=$(date +%Y-%m-%d)
CURRENT_TIME=$(date +%H:%M)
DAY_OF_WEEK=$(date +%A)

# --- Costruisci prompt completo con istruzioni email ---
FULL_PROMPT="Data: $CURRENT_DATE | Ora: $CURRENT_TIME ($DAY_OF_WEEK)
Task: $TASK_NAME

$PROMPT

## ISTRUZIONI NOTIFICA (OBBLIGATORIE)
Alla fine del task DEVI fare 2 cose:

1. Scrivi il report completo in: $STATE_DIR/last-run-${TASK_NAME}.md

2. Invia email di notifica eseguendo questo comando bash:
bash $NOTIFY_SCRIPT \"[Agent] $TASK_NAME completato — $CURRENT_DATE $CURRENT_TIME\" \"REPORT_QUI\"

Sostituisci REPORT_QUI con il report completo del task.
Includi SEMPRE nel report:
- Cosa hai fatto (lista puntata)
- Problemi trovati (se nessuno, scrivi 'Nessun problema')
- Azioni prese
- Metriche (GSC, Stripe, email, etc. se applicabili)
- Se serve azione dall'utente → scrivi CHIARAMENTE 'AZIONE RICHIESTA: ...'

Se trovi un PROBLEMA GRAVE (sito down, errore build, cliente nuovo, risposta email importante):
bash $NOTIFY_SCRIPT \"[URGENTE] Problema trovato — $TASK_NAME\" \"DESCRIZIONE_PROBLEMA\"

Se trovi un NUOVO CLIENTE o PAGAMENTO:
bash $NOTIFY_SCRIPT \"[VENDITA] Nuovo cliente!!!\" \"DETTAGLI_CLIENTE\""

# --- Salva prompt in file temporaneo (evita problemi pipe su Windows) ---
PROMPT_TMP="$STATE_DIR/tmp-prompt-${TASK_NAME}.txt"
echo "$FULL_PROMPT" > "$PROMPT_TMP"

# --- Esegui Claude Code ---
cd "$WORK_DIR"
START_TIME=$(date +%s)

CLAUDE_OUTPUT=$(claude --dangerously-skip-permissions -p "$(cat "$PROMPT_TMP")" --output-format text < /dev/null 2>&1) || {
    EXIT_CODE=$?
    echo "$(date): Claude Code exit con errore: $EXIT_CODE" >> "$LOG_FILE"
    echo "$CLAUDE_OUTPUT" >> "$LOG_FILE"
    # Notifica errore
    bash "$NOTIFY_SCRIPT" "[ERRORE] Agent task '$TASK_NAME' fallito (exit $EXIT_CODE)" \
        "Il task $TASK_NAME e fallito con exit code $EXIT_CODE alle $CURRENT_TIME.

Ultimi 500 char output:
$(echo "$CLAUDE_OUTPUT" | tail -c 500)"
    exit 1
}

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "$CLAUDE_OUTPUT" >> "$LOG_FILE"
echo "$(date): Task '$TASK_NAME' completato in ${DURATION}s" >> "$LOG_FILE"

# --- Fallback: se Claude non ha inviato email, invia report generico ---
# Controlla se l'output contiene "OK: email inviata" (dal send-notification.sh)
if ! echo "$CLAUDE_OUTPUT" | grep -q "OK: email inviata"; then
    # Claude non ha inviato notifica, inviamo noi il fallback
    REPORT_SUMMARY=$(echo "$CLAUDE_OUTPUT" | tail -c 1500)
    bash "$NOTIFY_SCRIPT" "[Agent] $TASK_NAME completato — $CURRENT_DATE (${DURATION}s)" \
        "Task: $TASK_NAME
Durata: ${DURATION}s
Data: $CURRENT_DATE $CURRENT_TIME

--- OUTPUT (ultimi 1500 char) ---
$REPORT_SUMMARY"
fi

# --- Cleanup: mantieni solo ultimi 30 log per task ---
ls -t "$LOG_DIR/${TASK_NAME}_"*.log 2>/dev/null | tail -n +31 | xargs rm -f 2>/dev/null || true
