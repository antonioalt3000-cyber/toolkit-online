#!/bin/bash
TSV=/c/Users/ftass/toolkit-online/scratchpad/audit-27ago/branches.tsv
LOG=/c/Users/ftass/toolkit-online/scratchpad/audit-27ago/deleted.log
: > "$LOG"
awk -F'\t' '$3=="0" && $1!="FINE" {print $1"\t"$2}' "$TSV" | while IFS=$'\t' read -r r b; do
  # cintura di sicurezza: mai master, mai un nome vuoto
  if [ -z "$b" ] || [ "$b" = "master" ]; then echo "SKIP $r $b" >> "$LOG"; continue; fi
  if MSYS_NO_PATHCONV=1 gh api -X DELETE "repos/antonioalt3000-cyber/$r/git/refs/heads/$b" >/dev/null 2>&1; then
    echo "OK $r $b" >> "$LOG"
  else
    echo "FAIL $r $b" >> "$LOG"
  fi
done
echo FINE >> "$LOG"
