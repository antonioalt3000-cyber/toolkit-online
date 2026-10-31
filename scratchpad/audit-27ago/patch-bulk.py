# -*- coding: utf-8 -*-
import io, sys
NL = chr(10)
p = 'C:/Users/ftass/business-fast2-accessiscan/src/app/bulk/page.tsx'
g = io.open(p, 'rb').read().decode('utf-8'); crlf = '\r\n' in g
s = g.replace('\r\n', NL)

COPPIE = [
('import type { ScanResult, Severity } from "@/lib/constants";',
 'import type { ScanResult, Severity } from "@/lib/constants";\nimport { parseBulkUrls, BULK_URL_LIMIT } from "@/lib/bulk-urls";'),

('''function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return "https://" + trimmed;
  }
  return trimmed;
}

''', ''),

('''  const parseUrls = useCallback((): string[] => {
    const lines = urlsText
      .split("\n")
      .map((line) => normalizeUrl(line))
      .filter((line) => line.length > 0);

    const unique = Array.from(new Set(lines));
    return unique.slice(0, 10);
  }, [urlsText]);''',
 '''  // Counts, not just a list: the previous version capped the input silently, so
  // pasting 25 sites produced a 10-row report and a 10-row CSV with nothing
  // saying the rest were never scanned.
  const parsed = useMemo(() => parseBulkUrls(urlsText), [urlsText]);
  const parseUrls = useCallback(() => parsed.urls, [parsed]);'''),

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
              <strong>{parsed.dropped} URL{parsed.dropped !== 1 ? "s" : ""} will not be scanned.</strong>{" "}
              A single run covers {BULK_URL_LIMIT} URLs, so only the first {BULK_URL_LIMIT} of your list are
              included here &mdash; in the results and in the exported CSV. Scan the rest in another run.
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button'''),
]

for vecchio, nuovo in COPPIE:
    if s.count(vecchio) != 1:
        sys.exit("ancoraggio non unico (%d): %r" % (s.count(vecchio), vecchio[:70]))
    s = s.replace(vecchio, nuovo, 1)

if 'useMemo' not in s.split('from "react"')[0]:
    vecchio = 'import { useState, useCallback } from "react";'
    if s.count(vecchio) != 1: sys.exit("import react non trovato")
    s = s.replace(vecchio, 'import { useState, useCallback, useMemo } from "react";', 1)

io.open(p, 'wb').write((s.replace(NL, '\r\n') if crlf else s).encode('utf-8'))
print("pagina bulk: %d sostituzioni applicate" % len(COPPIE))
