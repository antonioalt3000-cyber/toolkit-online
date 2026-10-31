#!/bin/bash
LOG=/c/Users/ftass/toolkit-online/scratchpad/audit-27ago/deleted93.log
: > "$LOG"
for r in complipilot accessiscan churnguard documint capture-api emailguard seoscope headershield hooklab cardforge; do
  MSYS_NO_PATHCONV=1 gh api "repos/antonioalt3000-cyber/$r/branches?per_page=100" --jq '.[] | select(.name != "master") | .name' 2>/dev/null | while read -r b; do
    [ -z "$b" ] && continue
    [ "$b" = "master" ] && { echo "SKIP $r $b" >> "$LOG"; continue; }
    if MSYS_NO_PATHCONV=1 gh api -X DELETE "repos/antonioalt3000-cyber/$r/git/refs/heads/$b" >/dev/null 2>&1; then
      echo "OK $r $b" >> "$LOG"
    else
      echo "FAIL $r $b" >> "$LOG"
    fi
  done
done
echo FINE >> "$LOG"
