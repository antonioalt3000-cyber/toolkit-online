#!/bin/bash
# =============================================================================
# DAILY ROUTINE — Eseguito automaticamente da /boss ad ogni sessione
# =============================================================================
# Controlla la data, vede cosa c'e' in coda, pubblica/invia tutto.
# Non importa a che ora viene lanciato — fa tutto quello del giorno.
# =============================================================================

set +e  # Non uscire su errore — ogni sezione gestisce i propri errori

QUEUE_DIR="C:/Users/ftass/toolkit-online/scripts/queue"
SENT_DIR="$QUEUE_DIR/sent"
LOG_FILE="$QUEUE_DIR/daily-log-$(date +%Y-%m-%d).txt"
TODAY=$(date +%Y-%m-%d)
DOW=$(date +%A)  # Monday, Tuesday, etc.

# Credenziali
HASHNODE_KEY="4df35ca0-83d0-48c0-88fc-6be573f848dd"
HASHNODE_PUB="69c5558810e664c5daf05d9f"
DEVTO_KEY="kwXCwx9a9tu5on2RtWWJy1gh"
BLUESKY_USER="devtoolsmith.bsky.social"
BLUESKY_PW="DevToolsmith2026!"

# Brevo
source "C:/Users/ftass/toolkit-online/scripts/.env.agent" 2>/dev/null || true
BREVO_KEY="REDACTED_LOAD_FROM_ENV"

mkdir -p "$SENT_DIR"

echo "=== DAILY ROUTINE $TODAY ($DOW) ===" | tee -a "$LOG_FILE"

# ---- 1. PUBBLICA CONTENUTI HASHNODE ----
published_hashnode=0
for f in "$QUEUE_DIR/content/"*_hashnode_*.json; do
  [ -f "$f" ] || continue
  # Controlla data nel filename: YYYY-MM-DD_hashnode_slug.json
  file_date=$(basename "$f" | grep -o '^[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}')
  if [ "$file_date" \> "$TODAY" ]; then
    continue  # Non ancora il momento
  fi

  echo "Publishing Hashnode: $(basename $f)" | tee -a "$LOG_FILE"

  TITLE=$(node -e "const d=require('$f');console.log(d.title)")
  CONTENT=$(node -e "const d=require('$f');console.log(d.content)")
  TAGS=$(node -e "const d=require('$f');console.log(JSON.stringify(d.tags))")

  RESULT=$(node -e "
    async function pub() {
      const q = \`mutation PublishPost(\\\$input: PublishPostInput!) { publishPost(input: \\\$input) { post { url } } }\`;
      const d = require('$f');
      const r = await fetch('https://gql.hashnode.com', {
        method: 'POST',
        headers: {'Content-Type':'application/json','Authorization':'$HASHNODE_KEY'},
        body: JSON.stringify({query:q,variables:{input:{title:d.title,contentMarkdown:d.content,publicationId:'$HASHNODE_PUB',tags:d.tags}}})
      });
      const j = await r.json();
      console.log(j.data ? j.data.publishPost.post.url : 'ERROR:'+JSON.stringify(j.errors));
    }
    pub();
  " 2>&1)

  echo "  Result: $RESULT" | tee -a "$LOG_FILE"
  mv "$f" "$SENT_DIR/"
  published_hashnode=$((published_hashnode + 1))
done

# ---- 2. PUBBLICA CONTENUTI DEV.TO ----
published_devto=0
for f in "$QUEUE_DIR/content/"*_devto_*.json; do
  [ -f "$f" ] || continue
  file_date=$(basename "$f" | grep -o '^[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}')
  if [ "$file_date" \> "$TODAY" ]; then
    continue
  fi

  echo "Publishing Dev.to: $(basename $f)" | tee -a "$LOG_FILE"

  RESULT=$(node -e "
    async function pub() {
      const d = require('$f');
      const r = await fetch('https://dev.to/api/articles', {
        method: 'POST',
        headers: {'api-key':'$DEVTO_KEY','Content-Type':'application/json'},
        body: JSON.stringify({article:{title:d.title,published:true,tags:d.tags,body_markdown:d.content}})
      });
      const j = await r.json();
      console.log(j.url || 'ERROR:'+JSON.stringify(j));
    }
    pub();
  " 2>&1)

  echo "  Result: $RESULT" | tee -a "$LOG_FILE"
  mv "$f" "$SENT_DIR/"
  published_devto=$((published_devto + 1))
done

# ---- 3. PUBBLICA BLUESKY ----
published_bluesky=0
for f in "$QUEUE_DIR/bluesky/"*_bluesky_*.txt; do
  [ -f "$f" ] || continue
  file_date=$(basename "$f" | grep -o '^[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}')
  if [ "$file_date" \> "$TODAY" ]; then
    continue
  fi

  echo "Publishing Bluesky: $(basename $f)" | tee -a "$LOG_FILE"

  TEXT=$(cat "$f")

  # Login
  SESSION=$(curl -s -X POST "https://bsky.social/xrpc/com.atproto.server.createSession" \
    -H "Content-Type: application/json" \
    -d "{\"identifier\":\"$BLUESKY_USER\",\"password\":\"$BLUESKY_PW\"}")
  DID=$(echo "$SESSION" | grep -o '"did":"[^"]*"' | head -1 | cut -d'"' -f4)
  TOKEN=$(echo "$SESSION" | grep -o '"accessJwt":"[^"]*"' | head -1 | cut -d'"' -f4)

  if [ -n "$DID" ] && [ -n "$TOKEN" ]; then
    NOW=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
    RESULT=$(curl -s -X POST "https://bsky.social/xrpc/com.atproto.repo.createRecord" \
      -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
      -d "{\"repo\":\"$DID\",\"collection\":\"app.bsky.feed.post\",\"record\":{\"text\":$(echo "$TEXT" | node -e "process.stdout.write(JSON.stringify(require('fs').readFileSync(0,'utf8')))"),\"createdAt\":\"$NOW\",\"\$type\":\"app.bsky.feed.post\"}}" 2>&1 | grep -o '"uri":"[^"]*"')
    echo "  Result: $RESULT" | tee -a "$LOG_FILE"
  else
    echo "  ERROR: Bluesky login failed" | tee -a "$LOG_FILE"
  fi

  mv "$f" "$SENT_DIR/"
  published_bluesky=$((published_bluesky + 1))
done

# ---- 4. INVIA EMAIL ----
sent_emails=0
MAX_EMAILS_PER_DAY=50  # 10 per dominio x 5 domini

for f in "$QUEUE_DIR/email/"*_email_*.json; do
  [ -f "$f" ] || continue
  [ $sent_emails -ge $MAX_EMAILS_PER_DAY ] && break

  file_date=$(basename "$f" | grep -o '^[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}')
  if [ "$file_date" \> "$TODAY" ]; then
    continue
  fi

  echo "Sending email: $(basename $f)" | tee -a "$LOG_FILE"

  RESULT=$(node -e "
    async function send() {
      const d = require('$f');
      const r = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {'api-key':'$BREVO_KEY','Content-Type':'application/json'},
        body: JSON.stringify({
          sender: {name: d.sender_name, email: d.sender_email},
          to: [{email: d.to_email, name: d.to_name}],
          subject: d.subject,
          htmlContent: d.html_body
        })
      });
      const j = await r.json();
      console.log(j.messageId ? 'SENT:'+j.messageId : 'ERROR:'+JSON.stringify(j));
    }
    send();
  " 2>&1)

  echo "  Result: $RESULT" | tee -a "$LOG_FILE"
  mv "$f" "$SENT_DIR/"
  sent_emails=$((sent_emails + 1))
done

# ---- SUMMARY ----
SUMMARY="Daily routine $TODAY: Hashnode=$published_hashnode, Dev.to=$published_devto, Bluesky=$published_bluesky, Email=$sent_emails"
echo "$SUMMARY" | tee -a "$LOG_FILE"

# Conta cosa resta in coda
REMAINING_CONTENT=$(ls "$QUEUE_DIR/content/"*.json 2>/dev/null | wc -l)
REMAINING_BLUESKY=$(ls "$QUEUE_DIR/bluesky/"*.txt 2>/dev/null | wc -l)
REMAINING_EMAIL=$(ls "$QUEUE_DIR/email/"*.json 2>/dev/null | wc -l)
echo "Queue remaining: content=$REMAINING_CONTENT, bluesky=$REMAINING_BLUESKY, email=$REMAINING_EMAIL" | tee -a "$LOG_FILE"

echo "$SUMMARY"

# === MONITOR RESPONSES ===
echo ""
echo "=== MONITOR ===" | tee -a "$LOG_FILE"
node C:/Users/ftass/toolkit-online/scripts/monitor-responses.js 2>&1 | tee -a "$LOG_FILE"
