#!/bin/bash
OUT=/c/Users/ftass/toolkit-online/scratchpad/audit-27ago/inspect14.txt
: > "$OUT"
while IFS=$'\t' read -r r b; do
  [ -z "$b" ] && continue
  cmp=$(MSYS_NO_PATHCONV=1 gh api "repos/antonioalt3000-cyber/$r/compare/master...$b" 2>/dev/null)
  echo "$cmp" | python -c "
import json,sys,subprocess,os
try: d=json.load(sys.stdin)
except: print('  (compare non disponibile)'); raise SystemExit
r=os.environ['R']; b=os.environ['B']
commits=d.get('commits',[])
files=[f['filename'] for f in d.get('files',[])]
print('REPO\t'+r)
print('BRANCH\t'+b)
print('AHEAD\t'+str(d.get('ahead_by')))
for c in commits:
    m=c['commit']['message'].split(chr(10))[0][:70]
    print('COMMIT\t'+c['commit']['committer']['date'][:10]+'\t'+m)
print('NFILES\t'+str(len(files)))
for f in files[:40]: print('FILE\t'+f)
" 2>/dev/null >> "$OUT"
  echo "---" >> "$OUT"
done < <(awk -F'\t' '$3!="MERGED" && $1!="FINE" {print $1"\t"$2}' /c/Users/ftass/toolkit-online/scratchpad/audit-27ago/residui.tsv)
echo FINE >> "$OUT"
