import json, io, os, collections
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'scans')
SLUGS = ['f1','f2','f3','f4','b7','cfg','eg','hsh','hkl','seo']
agg = collections.defaultdict(lambda: {'repos': set(), 'ids': {}, 'sev': ''})
for s in SLUGS:
    try: d = json.load(io.open(os.path.join(D, f'osv-{s}.json'), encoding='utf-8'))
    except Exception: continue
    for res in d.get('results', []):
        for pk in res.get('packages', []):
            nm, ver = pk['package']['name'], pk['package']['version']
            key = nm
            for v in pk.get('vulnerabilities', []):
                fixed = set()
                for a in v.get('affected', []):
                    if a.get('package', {}).get('name') != nm: continue
                    for r in a.get('ranges', []):
                        for e in r.get('events', []):
                            if 'fixed' in e: fixed.add(e['fixed'])
                agg[key]['ids'][v['id']] = sorted(fixed)
            agg[key]['repos'].add(f'{s}@{ver}')
            mx = max((g.get('max_severity','0') for g in pk.get('groups', [])), default='0')
            try:
                if float(mx) > float(agg[key]['sev'] or 0): agg[key]['sev'] = mx
            except ValueError: pass

for nm, info in sorted(agg.items(), key=lambda x: -float(x[1]['sev'] or 0)):
    vers = sorted({r.split('@')[1] for r in info['repos']})
    reps = sorted({r.split('@')[0] for r in info['repos']})
    allfix = sorted({f for fs in info['ids'].values() for f in fs})
    print(f"{nm:26} sev={info['sev']:5} in {len(reps)}/10 ({','.join(reps)})")
    print(f"{'':26} installato: {','.join(vers)}  |  corretto in: {','.join(allfix) or 'nessuna fix pubblicata'}")
