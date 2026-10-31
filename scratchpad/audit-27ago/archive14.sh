#!/bin/bash
LOG=/c/Users/ftass/toolkit-online/scratchpad/audit-27ago/tags.log
: > "$LOG"
awk -F'\t' '$3!="MERGED" && $1!="FINE" {print $1"\t"$2}' /c/Users/ftass/toolkit-online/scratchpad/audit-27ago/residui.tsv | while IFS=$'\t' read -r r b; do
  [ -z "$b" ] && continue
  sha=$(MSYS_NO_PATHCONV=1 gh api "repos/antonioalt3000-cyber/$r/git/ref/heads/$b" --jq '.object.sha' 2>/dev/null)
  [ -z "$sha" ] && { echo "NOSHA $r $b" >> "$LOG"; continue; }
  tag="archive/$(echo "$b" | tr '/' '-')"
  if MSYS_NO_PATHCONV=1 gh api -X POST "repos/antonioalt3000-cyber/$r/git/refs" -f ref="refs/tags/$tag" -f sha="$sha" >/dev/null 2>&1; then
    echo "TAG $r $tag $sha" >> "$LOG"
  else
    echo "FAILTAG $r $tag $sha" >> "$LOG"
  fi
done
echo FINE >> "$LOG"
