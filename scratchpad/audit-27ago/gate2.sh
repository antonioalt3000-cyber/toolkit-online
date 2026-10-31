#!/bin/bash
OUT=/c/Users/ftass/toolkit-online/scratchpad/audit-27ago/final
mkdir -p "$OUT"; : > "$OUT/summary.txt"
for p in business-fast4-documint business-7-capture-api business-new-emailguard business-new-seoscope business-new-headershield business-new-hooklab business-new-cardforge; do
  d=/c/Users/ftass/$p; log="$OUT/$p.log"; : > "$log"
  ( cd "$d" && npx tsc --noEmit ) >> "$log" 2>&1; tsc=$?
  ( cd "$d" && npm run lint --silent ) >> "$log" 2>&1; lint=$?
  ( cd "$d" && npm test --silent ) >> "$log" 2>&1; tst=$?
  n=$(sed -e 's/\x1b\[[0-9;]*m//g' "$log" | grep -oE 'Tests +[0-9]+ passed' | tail -1 | grep -oE '[0-9]+')
  f=$(sed -e 's/\x1b\[[0-9;]*m//g' "$log" | grep -oE 'Tests +[0-9]+ failed' | tail -1 | grep -oE '[0-9]+')
  echo "$p tsc=$tsc lint=$lint test=$tst passed=${n:-0} failed=${f:-0}" >> "$OUT/summary.txt"
done
echo DONE >> "$OUT/summary.txt"
