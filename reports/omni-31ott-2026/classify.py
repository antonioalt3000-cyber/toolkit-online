import json, os, re, io, subprocess, collections
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'scans')
REPO = {'f1':'business-fast1-complipilot','f2':'business-fast2-accessiscan','f3':'business-fast3-churnguard',
        'f4':'business-fast4-documint','b7':'business-7-capture-api','cfg':'business-new-cardforge',
        'eg':'business-new-emailguard','hsh':'business-new-headershield','hkl':'business-new-hooklab',
        'seo':'business-new-seoscope'}

PLACEHOLDER = re.compile(r'YOUR_|xxx|XXX|\.\.\.|<[a-z_]+>|example|placeholder|REPLACE|dummy|fake|test_key|sk_test_|'
                         r'\$\{\{\s*secrets\.|process\.env\.|\bYOUR\b', re.I)
REAL = [('brevo/sendinblue', re.compile(r'xkeysib-[A-Za-z0-9]{20,}')),
        ('stripe live secret', re.compile(r'sk_live_[A-Za-z0-9]{20,}')),
        ('stripe restricted', re.compile(r'rk_live_[A-Za-z0-9]{20,}')),
        ('stripe webhook', re.compile(r'whsec_[A-Za-z0-9]{20,}')),
        ('google api', re.compile(r'AIza[0-9A-Za-z_\-]{30,}')),
        ('github pat', re.compile(r'gh[pousr]_[A-Za-z0-9]{30,}')),
        ('anthropic', re.compile(r'sk-ant-[A-Za-z0-9\-_]{20,}'))]

def line_at(repo, commit, path, n):
    try:
        blob = subprocess.run(['git','-C',f'C:/Users/ftass/{repo}','show',f'{commit}:{path}'],
                              capture_output=True, text=True, errors='replace', timeout=30).stdout
        return blob.split('\n')[n-1]
    except Exception:
        return ''

real, fp = [], collections.Counter()
for slug, repo in REPO.items():
    p = os.path.join(D, f'leaks-{slug}.json')
    try: rows = json.load(io.open(p, encoding='utf-8'))
    except Exception: continue
    for r in rows:
        ln = line_at(repo, r['Commit'], r['File'], r['StartLine'])
        kind = None
        for name, rx in REAL:
            if rx.search(ln): kind = name; break
        if kind:
            real.append((slug, r['File'], r['StartLine'], r['Commit'][:8], r.get('Date','')[:10], kind))
        else:
            fp[(slug, 'placeholder/doc' if PLACEHOLDER.search(ln) else 'da guardare a mano')] += 1

print('### SEGRETI REALI (forma di credenziale vera)')
if real:
    for x in real: print('  🔴', ' | '.join(map(str, x)))
else:
    print('  nessuno: nessun finding ha la forma di una credenziale vera')
print()
print('### RESTO, per repo e motivo')
for (slug, why), n in sorted(fp.items()):
    print(f'  {slug:4} {n:3} {why}')
