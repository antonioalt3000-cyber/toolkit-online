# -*- coding: utf-8 -*-
import io, sys
NL = chr(10)
p = 'C:/Users/ftass/business-fast2-accessiscan/src/app/bulk/page.tsx'
g = io.open(p, 'rb').read().decode('utf-8'); crlf = '\r\n' in g
s = g.replace('\r\n', NL)

COPPIE = [
('import { useState, useCallback } from "react";',
 'import { useState, useCallback, useMemo } from "react";'),

('import type { ScanResult, Severity } from "@/lib/constants";',
 'import type { ScanResult, Severity } from "@/lib/constants";\nimport { parseBulkUrls, BULK_URL_LIMIT } from "@/lib/bulk-urls";'),

('  const urlCount = parseUrls().length;',
 '  const urlCount = parsed.urls.length;'),

('''            <span className="text-xs text-zinc-500">
              {urlCount} URL{urlCount !== 1 ? "s" : ""} detected
            </span>''',
 '''            <span className="text-xs text-zinc-500">
              {urlCount} URL{urlCount !== 1 ? "s" : ""} detected
              {parsed.duplicates > 0 && ` (${parsed.duplicates} duplicate${parsed.duplicates !== 1 ? "s" : ""} removed)`}
            </span>'''),

('''          <div className="mt-4 flex flex-wrap gap-3">
            <button''',
 '''          {parsed.dropped > 0 && (
            <p
              className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200"
              role="status"
            >
              <strong>
                {parsed.dropped} URL{parsed.dropped !== 1 ? "s" : ""} will not be scanned.
              </strong>{" "}
              A single run covers {BULK_URL_LIMIT} URLs, so only the first {BULK_URL_LIMIT} of your list
              appear here &mdash; in the results and in the exported CSV. Scan the rest in another run.
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button'''),
]

for vecchio, nuovo in COPPIE:
    if s.count(vecchio) != 1:
        sys.exit("ancoraggio non unico (%d): %r" % (s.count(vecchio), vecchio[:70]))
    s = s.replace(vecchio, nuovo, 1)

# La funzione locale non serve piu': ora vive in lib/bulk-urls.ts
i = s.find('function normalizeUrl(raw: string): string {')
if i == -1: sys.exit("normalizeUrl locale non trovata")
j = s.find(NL + '}' + NL, i)
if j == -1: sys.exit("chiusura di normalizeUrl non trovata")
s = s[:i] + s[j + 3:]
if 'function normalizeUrl' in s: sys.exit("normalizeUrl ancora presente")

io.open(p, 'wb').write((s.replace(NL, '\r\n') if crlf else s).encode('utf-8'))
print("pagina bulk aggiornata: %d sostituzioni + rimozione della normalizeUrl locale" % len(COPPIE))
