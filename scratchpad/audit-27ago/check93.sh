#!/bin/bash
TSV=/c/Users/ftass/toolkit-online/scratchpad/audit-27ago/branches.tsv
OUT=/c/Users/ftass/toolkit-online/scratchpad/audit-27ago/residui.tsv
: > "$OUT"
awk -F'\t' '$3!="0" && $3!="ERR" && $1!="FINE" {print $1"\t"$2}' "$TSV" | while IFS=$'\t' read -r r b; do
  st=$(MSYS_NO_PATHCONV=1 gh pr list --repo "antonioalt3000-cyber/$r" --head "$b" --state all --json state --jq '.[0].state' 2>/dev/null)
  printf "%s\t%s\t%s\n" "$r" "$b" "${st:-NESSUNA_PR}" >> "$OUT"
done
echo FINE >> "$OUT"
