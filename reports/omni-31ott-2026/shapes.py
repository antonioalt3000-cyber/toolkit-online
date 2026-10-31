import json, os, re, io, subprocess, collections
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'scans')
REPO = {'f1':'business-fast1-complipilot','f2':'business-fast2-accessiscan','f3':'business-fast3-churnguard',
        'f4':'business-fast4-documint','b7':'business-7-capture-api','cfg':'business-new-cardforge',
        'eg':'business-new-emailguard','hsh':'business-new-headershield','hkl':'business-new-hooklab',
        'seo':'business-new-seoscope'}
cache = {}
def blob(repo, commit, path):
    k = (repo, commit, path)
    if k not in cache:
        cache[k] = subprocess.run(['git','-C',f'C:/Users/ftass/{repo}','show',f'{commit}:{path}'],
                                  capture_output=True, text=True, errors='replace', timeout=60).stdout.split('\n')
    return cache[k]

def mask(s):
    s = re.sub(r'[A-Za-z0-9_\-]{20,}', '«TOKEN»', s)
    return re.sub(r'\s+', ' ', s).strip()[:100]

groups = collections.Counter()
detail = collections.defaultdict(list)
for slug, repo in REPO.items():
    p = os.path.join(D, f'leaks-{slug}.json')
    try: rows = json.load(io.open(p, encoding='utf-8'))
    except Exception: continue
    for r in rows:
        lines = blob(repo, r['Commit'], r['File'])
        ln = lines[r['StartLine']-1] if r['StartLine']-1 < len(lines) else '(riga non trovata)'
        g = (r['RuleID'], mask(ln))
        groups[g] += 1
        detail[g].append(f"{slug}:{r['File']}")

print(f"{sum(groups.values())} finding in {len(groups)} forme distinte\n")
for (rule, shape), n in groups.most_common():
    repos = sorted({d.split(':')[0] for d in detail[(rule, shape)]})
    print(f"[{n:3}] {rule:24} {','.join(repos)}")
    print(f"      {shape}")
