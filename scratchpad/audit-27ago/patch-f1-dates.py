# -*- coding: utf-8 -*-
import io, sys
NL = chr(10)
p = 'C:/Users/ftass/business-fast1-complipilot/src/app/risk-assessment/page.tsx'
grezzo = io.open(p, 'rb').read().decode('utf-8')
crlf = '\r\n' in grezzo
s = grezzo.replace('\r\n', NL)

COPPIE = [
('''import { useState, useCallback } from "react";
import Link from "next/link";''',
 '''import { useState, useCallback } from "react";
import Link from "next/link";
import { formatLegalDate } from "@/lib/legal-dates";'''),

('''      deadline: "Already in effect (February 2025)",''',
 '''      deadline: `Already in force since ${formatLegalDate("aiActProhibitions")}`,'''),

('''      deadline: "2 December 2027 (postponed from 2 August 2026 by Reg. (EU) 2026/1744)",''',
 '''      deadline: `${formatLegalDate("aiActAnnexIIIHighRisk")} (postponed by Reg. (EU) 2026/1744)`,'''),

('''      deadline: "August 2, 2025 (transparency rules)",''',
 '''      // This verdict IS Article 50 - the obligations listed above are its
      // transparency duties and the link below is to Article 50 itself. It read
      // "August 2, 2025", a year before Article 50 applied, telling every
      // limited-risk answer it was already a year overdue while the product's
      // own Article 50 page stated the correct date. Dates come from the single
      // source of truth now, as that file's first rule requires.
      deadline: `${formatLegalDate("aiActArt50Transparency")} - already applies; ${formatLegalDate("aiActArt50MarkingLegacy")} for systems already on the market`,'''),
]

for vecchio, nuovo in COPPIE:
    if s.count(vecchio) != 1:
        sys.exit("ancoraggio non unico (%d): %r" % (s.count(vecchio), vecchio[:60]))
    s = s.replace(vecchio, nuovo, 1)

io.open(p, 'wb').write((s.replace(NL, '\r\n') if crlf else s).encode('utf-8'))
print("applicate %d sostituzioni su risk-assessment" % len(COPPIE))
