import json, os, re, io, subprocess
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'scans')
REPO = {'f1':'business-fast1-complipilot','f2':'business-fast2-accessiscan'}
WANT = re.compile(r'(BREVO_KEY|INTERNAL_KEY|SENDINBLUE)', re.I)
for slug, repo in REPO.items():
    rows = json.load(io.open(os.path.join(D, f'leaks-{slug}.json'), encoding='utf-8'))
    for r in rows:
        out = subprocess.run(['git','-C',f'C:/Users/ftass/{repo}','show',f"{r['Commit']}:{r['File']}"],
                             capture_output=True, text=True, errors='replace', timeout=60).stdout.split('\n')
        ln = out[r['StartLine']-1] if r['StartLine']-1 < len(out) else ''
        if not WANT.search(ln): continue
        m = re.search(r"['\"]([A-Za-z0-9_\-]{16,})['\"]", ln)
        val = m.group(1) if m else ''
        shape = ('xkeysib (Brevo REALE)' if val.startswith('xkeysib-')
                 else 'sk_live (Stripe REALE)' if val.startswith('sk_live_')
                 else f'opaco, {len(val)} char, entropia {r["Entropy"]:.1f}')
        print(f"{slug} | {r['File']}:{r['StartLine']} | commit {r['Commit'][:8]} {r.get('Date','')[:10]} | "
              f"{ln.strip()[:28]}… | prefisso={val[:8]}… | {shape}")
        # e' ancora nel codice attuale?
        cur = subprocess.run(['git','-C',f'C:/Users/ftass/{repo}','show',f"master:{r['File']}"],
                             capture_output=True, text=True, errors='replace', timeout=60).stdout
        print(f"     su master oggi: {'ANCORA PRESENTE' if val and val in cur else 'rimosso dal codice, resta nella storia'}")
