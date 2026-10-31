#!/bin/bash
OUT=/c/Users/ftass/toolkit-online/scratchpad/audit-27ago/branches.tsv
: > "$OUT"
for r in complipilot accessiscan churnguard documint capture-api emailguard seoscope headershield hooklab cardforge; do
  MSYS_NO_PATHCONV=1 gh api "repos/antonioalt3000-cyber/$r/branches?per_page=100" --jq '.[] | select(.name != "master") | .name' 2>/dev/null | while read -r b; do
    a=$(MSYS_NO_PATHCONV=1 gh api "repos/antonioalt3000-cyber/$r/compare/master...$b" --jq '.ahead_by' 2>/dev/null)
    printf "%s\t%s\t%s\n" "$r" "$b" "${a:-ERR}" >> "$OUT"
  done
done
echo FINE >> "$OUT"
