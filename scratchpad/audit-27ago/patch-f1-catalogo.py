# -*- coding: utf-8 -*-
import io, sys
NL = chr(10)
BASE = 'C:/Users/ftass/business-fast1-complipilot/'

def patch(rel, coppie):
    p = BASE + rel
    grezzo = io.open(p, 'rb').read().decode('utf-8')
    crlf = '\r\n' in grezzo
    s = grezzo.replace('\r\n', NL)
    for vecchio, nuovo in coppie:
        if s.count(vecchio) != 1:
            sys.exit("%s: ancoraggio non unico (%d): %r" % (rel, s.count(vecchio), vecchio[:60]))
        s = s.replace(vecchio, nuovo, 1)
    io.open(p, 'wb').write((s.replace(NL, '\r\n') if crlf else s).encode('utf-8'))
    print("  %-52s %d sostituzioni" % (rel, len(coppie)))

patch('src/app/api/document-generator/route.ts', [
 ('import { rateLimit } from "@/lib/rate-limit";',
  'import { rateLimit } from "@/lib/rate-limit";\nimport { API_DOC_TYPES, type ApiDocType } from "@/lib/document-catalogue";'),
 ('type DocType = "dpia" | "ai_risk_assessment" | "conformity_declaration" | "compliance_summary";',
  '/** The catalogue owns this list: /document-generator advertises from the same source. */\ntype DocType = ApiDocType;'),
 ('const DOC_TYPES: DocType[] = ["dpia", "ai_risk_assessment", "conformity_declaration", "compliance_summary"];',
  'const DOC_TYPES: readonly DocType[] = API_DOC_TYPES;'),
])

patch('src/app/generate/page.tsx', [
 ('const TEMPLATES: DocumentTemplate[] = [',
  '/** Exported so document-catalogue.test.ts can check the advertised list against it. */\nexport const TEMPLATES: DocumentTemplate[] = ['),
])

patch('src/app/audit-questionnaire/page.tsx', [
 ('const QUESTIONS: Question[] = [',
  '/** Exported so the copy elsewhere cannot claim a question count that disagrees. */\nexport const QUESTIONS: Question[] = ['),
])

patch('src/app/help/page.tsx', [
 ('{ name: "Document Generator", desc: "Generates technical documentation per Annex IV requirements.", path: "/document-generator", api: "POST /api/document-generator" },',
  '{ name: "Document Generator", desc: "DPIA, Article 9 risk management, Annex V declaration of conformity and a compliance summary, in five languages.", path: "/document-generator", api: "POST /api/document-generator" },'),
 ('Use the 12-question wizard at /audit-questionnaire',
  'Use the wizard at /audit-questionnaire'),
])
print("fatto")
