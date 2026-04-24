#!/bin/bash
# =============================================================================
# SEND NOTIFICATION — Invia email di notifica via Brevo API
# =============================================================================
# Uso: ./send-notification.sh "Soggetto" "Contenuto HTML"
# Oppure: echo "contenuto" | ./send-notification.sh "Soggetto"
#
# Invia a: antonio.alt3000@gmail.com
# Da: hello@fixmyweb.dev (DevToolsmith Agent)
# Via: Brevo API (gratuito, 300/giorno)
# =============================================================================

BREVO_API_KEY="REDACTED_LOAD_FROM_ENV"
TO_EMAIL="antonio.alt3000@gmail.com"
TO_NAME="Antonio"
FROM_EMAIL="hello@fixmyweb.dev"
FROM_NAME="DevToolsmith Agent"

SUBJECT="${1:-[Agent] Notifica}"

# Leggi body da argomento o stdin
if [ -n "$2" ]; then
    BODY="$2"
elif [ ! -t 0 ]; then
    BODY=$(cat)
else
    BODY="Nessun contenuto."
fi

# Escape JSON (semplice: escape quotes e newlines)
BODY_ESCAPED=$(echo "$BODY" | sed 's/\\/\\\\/g; s/"/\\"/g' | tr '\n' ' ' | sed 's/  / <br>/g')

# Invia via Brevo API
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "https://api.brevo.com/v3/smtp/email" \
    -H "api-key: $BREVO_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
        \"sender\": {\"name\": \"$FROM_NAME\", \"email\": \"$FROM_EMAIL\"},
        \"to\": [{\"email\": \"$TO_EMAIL\", \"name\": \"$TO_NAME\"}],
        \"subject\": \"$SUBJECT\",
        \"htmlContent\": \"<html><body style='font-family: monospace; font-size: 14px; line-height: 1.6; color: #333; max-width: 600px;'><pre style='white-space: pre-wrap;'>$BODY_ESCAPED</pre><hr><small>DevToolsmith Autonomous Agent — $(date '+%Y-%m-%d %H:%M')</small></body></html>\"
    }")

if [ "$HTTP_CODE" = "201" ]; then
    echo "OK: email inviata ($SUBJECT)"
else
    echo "ERRORE: Brevo returned HTTP $HTTP_CODE"
fi
