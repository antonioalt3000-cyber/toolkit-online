#!/bin/bash
# =============================================================================
# VERIFY EMAIL — Controlla se un dominio accetta email + valida formato
# =============================================================================
# Uso: ./verify-email.sh email@example.com
#      echo "email1@ex.com\nemail2@ex.com" | ./verify-email.sh
#
# Metodo: MX lookup via nslookup (Windows compatible)
# Nota: SMTP RCPT TO check non affidabile (molti server accettano tutto)
#       Il check MX + formato e' il metodo piu sicuro senza servizi a pagamento
# =============================================================================

verify_single() {
  local email="$1"
  local domain="${email#*@}"

  # Validate format
  if ! echo "$email" | grep -qE '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'; then
    echo "FAIL $email — invalid format"
    return 1
  fi

  # MX lookup via nslookup
  local mx=$(nslookup -type=mx "$domain" 2>/dev/null | grep "mail exchanger" | head -1 | awk '{print $NF}')

  if [ -z "$mx" ]; then
    # Try A record as fallback
    local a_record=$(nslookup "$domain" 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}')
    if [ -n "$a_record" ] && [ "$a_record" != "#53" ]; then
      echo "MAYBE $email — no MX but A record exists ($a_record)"
      return 0
    else
      echo "FAIL $email — domain has no MX or A record"
      return 1
    fi
  fi

  # Check for known catch-all / risky patterns
  local local_part="${email%@*}"
  case "$local_part" in
    info|hello|contact|support|sales|admin|team|hi|hey)
      echo "OK_GENERIC $email — MX: $mx (generic address, higher bounce risk)"
      return 0
      ;;
    *)
      echo "OK $email — MX: $mx"
      return 0
      ;;
  esac
}

# Main
if [ -n "$1" ]; then
  verify_single "$1"
else
  TOTAL=0; OK=0; GENERIC=0; FAIL=0; MAYBE=0
  while IFS= read -r email; do
    [ -z "$email" ] && continue
    result=$(verify_single "$email")
    echo "$result"
    TOTAL=$((TOTAL+1))
    case "$result" in
      OK_GENERIC*) GENERIC=$((GENERIC+1)) ;;
      OK*) OK=$((OK+1)) ;;
      FAIL*) FAIL=$((FAIL+1)) ;;
      MAYBE*) MAYBE=$((MAYBE+1)) ;;
    esac
  done
  echo ""
  echo "=== SUMMARY ==="
  echo "Total: $TOTAL"
  echo "OK (verified): $OK"
  echo "OK_GENERIC (MX ok, but generic address — higher bounce risk): $GENERIC"
  echo "MAYBE (no MX, has A record): $MAYBE"
  echo "FAIL (invalid): $FAIL"
  echo ""
  echo "RECOMMENDATION: Send only to OK and OK_GENERIC. Skip FAIL and MAYBE."
  echo "To reduce bounce further: replace generic addresses (info@, hello@) with named contacts from LinkedIn."
fi
