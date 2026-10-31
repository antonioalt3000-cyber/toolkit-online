#!/bin/bash
export PATH="/c/Users/ftass/bin:$PATH"
cd /c/Users/ftass
OUT=/c/Users/ftass/toolkit-online/reports/omni-31ott-2026/scans
set -- "f1 business-fast1-complipilot" "f2 business-fast2-accessiscan" "f3 business-fast3-churnguard" "f4 business-fast4-documint" "b7 business-7-capture-api" "cfg business-new-cardforge" "eg business-new-emailguard" "hsh business-new-headershield" "hkl business-new-hooklab" "seo business-new-seoscope"
for pair in "$@"; do
  slug=${pair%% *}; dir=${pair##* }
  echo "===== $slug ($dir)"
  osv-scanner scan source --lockfile "/c/Users/ftass/$dir/package-lock.json" --format json > "$OUT/osv-$slug.json" 2> "$OUT/osv-$slug.err"
  echo "  osv: exit=$? bytes=$(wc -c <"$OUT/osv-$slug.json")"
  gitleaks git "/c/Users/ftass/$dir" --report-format json --report-path "$OUT/leaks-$slug.json" --no-banner --redact --exit-code 0 > "$OUT/leaks-$slug.log" 2>&1
  echo "  gitleaks: $(python -c "import json;print(len(json.load(open(r'$OUT/leaks-$slug.json'))),'finding')" 2>/dev/null || echo 'errore')"
done
echo "SCANSIONI COMPLETATE"
