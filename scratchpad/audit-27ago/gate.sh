#!/bin/bash
OUT=/c/Users/ftass/toolkit-online/scratchpad/audit-27ago
: > "$OUT/gate-summary.txt"
for p in business-fast1-complipilot business-fast2-accessiscan business-fast3-churnguard business-fast4-documint business-7-capture-api business-new-emailguard business-new-seoscope business-new-headershield business-new-hooklab business-new-cardforge; do
  d=/c/Users/ftass/$p
  log="$OUT/$p.log"
  : > "$log"
  ( cd "$d" && npx tsc --noEmit ) >> "$log" 2>&1; tsc=$?
  ( cd "$d" && npm run lint --silent ) >> "$log" 2>&1; lint=$?
  ( cd "$d" && npm test --silent ) >> "$log" 2>&1; test=$?
  count=$(grep -oE 'Tests +[0-9]+ passed' "$log" | tail -1 | grep -oE '[0-9]+')
  failed=$(grep -oE 'Tests +[0-9]+ failed' "$log" | tail -1 | grep -oE '[0-9]+')
  echo "$p tsc=$tsc lint=$lint test=$test passed=${count:-?} failed=${failed:-0}" >> "$OUT/gate-summary.txt"
done
echo "DONE" >> "$OUT/gate-summary.txt"
