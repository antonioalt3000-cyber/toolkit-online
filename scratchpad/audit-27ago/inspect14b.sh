#!/bin/bash
OUT=/c/Users/ftass/toolkit-online/scratchpad/audit-27ago/inspect14.txt
: > "$OUT"
while IFS=$'\t' read -r r b; do
  [ -z "$b" ] && continue
  export R="$r" B="$b"
  MSYS_NO_PATHCONV=1 gh api "repos/antonioalt3000-cyber/$r/compare/master...$b" 2>/dev/null | python -c "
import json,sys,os
try: d=json.load(sys.stdin)
except: sys.exit()
print('=== %s / %s  (+%s commit)' % (os.environ['R'], os.environ['B'], d.get('ahead_by')))
for c in d.get('commits',[]):
    print('   %s  %s' % (c['commit']['committer']['date'][:10], c['commit']['message'].split(chr(10))[0][:68]))
fs=d.get('files',[])
print('   file toccati: %d -> %s' % (len(fs), ', '.join(f['filename'] for f in fs[:6]) + (' ...' if len(fs)>6 else '')))
" >> "$OUT"
done < <(awk -F'\t' '$3!="MERGED" && $1!="FINE" {print $1"\t"$2}' /c/Users/ftass/toolkit-online/scratchpad/audit-27ago/residui.tsv)
echo FINE >> "$OUT"
