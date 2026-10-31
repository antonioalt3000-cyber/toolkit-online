import os, re, sys
def audit(root):
    app = os.path.join(root, "src", "app") if os.path.isdir(os.path.join(root, "src", "app")) else os.path.join(root, "app")
    out = []
    for d, _, files in os.walk(app):
        if "page.tsx" not in files or "/api" in d.replace("\\", "/"): continue
        rel = os.path.relpath(d, app).replace("\\", "/")
        route = "/" if rel == "." else "/" + rel
        src = open(os.path.join(d, "page.tsx"), encoding="utf-8").read()
        has_meta = bool(re.search(r"export\s+(const\s+metadata|async\s+function\s+generateMetadata|function\s+generateMetadata)", src))
        is_client = src.lstrip().startswith(("'use client'", '"use client"'))
        redirect_only = "redirect(" in src and len(src) < 1500
        # nearest layout with metadata between page dir and app root (excluding root layout)
        lay = False; cur = d
        while os.path.abspath(cur) != os.path.abspath(app):
            lp = os.path.join(cur, "layout.tsx")
            if os.path.exists(lp) and re.search(r"export\s+(const\s+metadata|async\s+function\s+generateMetadata|function\s+generateMetadata)", open(lp, encoding="utf-8").read()):
                lay = True; break
            cur = os.path.dirname(cur)
        if route != "/" and not has_meta and not lay and not redirect_only:
            out.append((route, "client" if is_client else "server"))
    return sorted(out)
for r in sys.argv[1:]:
    res = audit(r)
    print(f"== {os.path.basename(r)}: {len(res)} pages inheriting root metadata")
    for route, kind in res: print(f"   {route} ({kind})")
