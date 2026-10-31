# -*- coding: utf-8 -*-
import io, sys
NL = chr(10)
p = 'C:/Users/ftass/business-fast2-accessiscan/src/app/vpat/page.tsx'
grezzo = io.open(p, 'rb').read().decode('utf-8')
crlf = '\r\n' in grezzo
s = grezzo.replace('\r\n', NL)

COPPIE = [
("import { WCAG_CRITERIA } from \"@/lib/constants\";",
 "import { wcagCriteriaFor, type WcagVersion } from \"@/lib/constants\";"),

("""function buildInitialRows(): VpatRow[] {
  return Object.entries(WCAG_CRITERIA).map(([criterion, info]) => ({""",
 """/**
 * WCAG 2.1 is what EN 301 549 and Section 508 currently reference, so it stays
 * the default; 2.2 is offered because it is what this product markets itself
 * against and what newer procurement asks for.
 */
const DEFAULT_WCAG_VERSION: WcagVersion = "2.1";

function buildInitialRows(version: WcagVersion): VpatRow[] {
  return wcagCriteriaFor(version).map(([criterion, info]) => ({"""),

("""  companyName: string,
  rows: VpatRow[]
): string {""",
 """  companyName: string,
  rows: VpatRow[],
  wcagVersion: WcagVersion
): string {"""),

("<h2>WCAG 2.1 Conformance Report</h2>",
 "<h2>WCAG ${wcagVersion} Conformance Report</h2>"),

("<p><strong>Standard:</strong> WCAG 2.1 Level AA</p>",
 "<p><strong>Standard:</strong> WCAG ${wcagVersion} Level AA</p>"),

("<p>This document follows the ITI VPAT&reg; 2.5 format for WCAG 2.1.</p>",
 "<p>This document follows the ITI VPAT&reg; 2.5 format for WCAG ${wcagVersion}.</p>"),

("  const [rows, setRows] = useState<VpatRow[]>(buildInitialRows);",
 """  const [wcagVersion, setWcagVersion] = useState<WcagVersion>(DEFAULT_WCAG_VERSION);
  const [rows, setRows] = useState<VpatRow[]>(() => buildInitialRows(DEFAULT_WCAG_VERSION));"""),

("""  const updateConformance = useCallback((index: number, value: ConformanceLevel) => {""",
 """  /**
   * Switching version rebuilds the table, so it must carry the author's answers
   * across: the two versions share 78 criteria, and silently discarding a
   * half-finished evaluation because the version changed is data loss.
   */
  const changeWcagVersion = useCallback((version: WcagVersion) => {
    setWcagVersion(version);
    setRows((prev) => {
      const answered = new Map(prev.map((row) => [row.criterion, row]));
      return buildInitialRows(version).map((row) => {
        const kept = answered.get(row.criterion);
        return kept ? { ...row, conformance: kept.conformance, remarks: kept.remarks } : row;
      });
    });
  }, []);

  const updateConformance = useCallback((index: number, value: ConformanceLevel) => {"""),

("    const html = generateVpatHtml(productName, productVersion, reportDate, companyName, rows);",
 "    const html = generateVpatHtml(productName, productVersion, reportDate, companyName, rows, wcagVersion);"),

("""    setCompanyName("");
    setRows(buildInitialRows());""",
 """    setCompanyName("");
    setWcagVersion(DEFAULT_WCAG_VERSION);
    setRows(buildInitialRows(DEFAULT_WCAG_VERSION));"""),

("{generateVpatHtml(productName, productVersion, reportDate, companyName, rows).slice(0, 2000)}",
 "{generateVpatHtml(productName, productVersion, reportDate, companyName, rows, wcagVersion).slice(0, 2000)}"),

("<h2 className=\"text-xl font-bold text-gray-900 mb-6\">WCAG 2.1 Conformance</h2>",
 "<h2 className=\"text-xl font-bold text-gray-900 mb-6\">WCAG {wcagVersion} Conformance</h2>"),

("""                  placeholder="e.g., Acme Corp"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>""",
 """                  placeholder="e.g., Acme Corp"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label htmlFor="wcag-version" className="block text-sm font-medium text-gray-700 mb-1">
                  WCAG Version
                </label>
                <select
                  id="wcag-version"
                  value={wcagVersion}
                  onChange={(e) => changeWcagVersion(e.target.value as WcagVersion)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="2.1">WCAG 2.1 &mdash; 78 criteria (EN 301 549, Section 508)</option>
                  <option value="2.2">WCAG 2.2 &mdash; 86 criteria (adds 9, drops 4.1.1 Parsing)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Sets which success criteria the report covers. Answers you have already entered are kept.
                </p>
              </div>"""),
]

for vecchio, nuovo in COPPIE:
    if s.count(vecchio) != 1:
        sys.exit("ancoraggio non unico (%d occorrenze): %r" % (s.count(vecchio), vecchio[:70]))
    s = s.replace(vecchio, nuovo, 1)

uscita = s.replace(NL, '\r\n') if crlf else s
io.open(p, 'wb').write(uscita.encode('utf-8'))
print("applicate %d sostituzioni | CRLF: %s | %d -> %d byte" % (len(COPPIE), crlf, len(grezzo), len(uscita)))
