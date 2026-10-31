import json, os, collections, io
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'scans')
SLUGS = ['f1','f2','f3','f4','b7','cfg','eg','hsh','hkl','seo']

print("=" * 78)
print("GITLEAKS — segreti nella storia git (valori redatti)")
print("=" * 78)
leak_tot = collections.Counter()
for s in SLUGS:
    p = os.path.join(D, f'leaks-{s}.json')
    try:
        rows = json.load(io.open(p, encoding='utf-8'))
    except Exception as e:
        print(f'{s}: non leggibile ({e})'); continue
    if not rows:
        print(f'{s:4} 0 finding'); continue
    by = collections.Counter(r['RuleID'] for r in rows)
    print(f'{s:4} {len(rows):3} finding: ' + ', '.join(f'{k}×{v}' for k, v in by.most_common()))
    for r in rows:
        leak_tot[r['RuleID']] += 1
        print(f'       {r["File"]}:{r["StartLine"]}  commit {r["Commit"][:8]}  {r.get("Date","")[:10]}  autore={r.get("Author","")}')
print('\nTOTALE per regola:', dict(leak_tot))

print()
print("=" * 78)
print("OSV-SCANNER — vulnerabilita' dal lockfile")
print("=" * 78)
for s in SLUGS:
    p = os.path.join(D, f'osv-{s}.json')
    try:
        d = json.load(io.open(p, encoding='utf-8'))
    except Exception as e:
        print(f'{s}: non leggibile ({e})'); continue
    pkgs = collections.OrderedDict()
    for res in d.get('results', []):
        for pk in res.get('packages', []):
            name = pk['package']['name']; ver = pk['package']['version']
            ids = []
            for v in pk.get('vulnerabilities', []):
                sev = ''
                for sv in v.get('severity', []) or []:
                    sev = sv.get('score', '')
                ids.append(v['id'])
            groups = pk.get('groups', [])
            maxsev = max((g.get('max_severity','') for g in groups), default='')
            if ids:
                pkgs[f'{name}@{ver}'] = (ids, maxsev)
    if not pkgs:
        print(f'{s:4} 0 vulnerabilita\''); continue
    print(f'{s:4} {len(pkgs)} pacchetti vulnerabili:')
    for k, (ids, sev) in pkgs.items():
        print(f'       {k:38} sev={sev or "n/d":5} {",".join(ids[:4])}')
