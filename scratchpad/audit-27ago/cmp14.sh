#!/bin/bash
OUT=/c/Users/ftass/toolkit-online/scratchpad/audit-27ago/cmp14.txt
: > "$OUT"
while IFS=$'\t' read -r r b; do
  [ -z "$b" ] && continue
  files=$(MSYS_NO_PATHCONV=1 gh api "repos/antonioalt3000-cyber/$r/compare/master...$b" --jq '.files[].filename' 2>/dev/null)
  nf=$(echo "$files" | grep -c .)
  same=0; diff=0; missing=0; detail=""
  for f in $files; do
    sb=$(MSYS_NO_PATHCONV=1 gh api "repos/antonioalt3000-cyber/$r/contents/$f?ref=$b" --jq '.sha' 2>/dev/null)
    sm=$(MSYS_NO_PATHCONV=1 gh api "repos/antonioalt3000-cyber/$r/contents/$f?ref=master" --jq '.sha' 2>/dev/null)
    if [ -z "$sm" ]; then missing=$((missing+1)); detail="$detail [ASSENTE-IN-MASTER:$f]"
    elif [ "$sb" = "$sm" ]; then same=$((same+1))
    else diff=$((diff+1)); detail="$detail [DIVERSO:$f]"; fi
  done
  printf "%s\t%s\t%s\t%s\t%s\t%s\t%s\n" "$r" "$b" "$nf" "$same" "$diff" "$missing" "$detail" >> "$OUT"
done < <(awk -F'\t' '$3!="MERGED" && $1!="FINE" && $2!="wt/n4-cert" {print $1"\t"$2}' /c/Users/ftass/toolkit-online/scratchpad/audit-27ago/residui.tsv)
echo FINE >> "$OUT"
