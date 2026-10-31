# -*- coding: utf-8 -*-
import io, sys
NL = chr(10)
p = 'C:/Users/ftass/business-fast2-accessiscan/src/app/vpat/page.tsx'
grezzo = io.open(p, 'rb').read().decode('utf-8')
crlf = '\r\n' in grezzo
s = grezzo.replace('\r\n', NL)

COPPIE = [
("""import { useState, useCallback, useEffect } from "react";""",
 """import { useState, useCallback, useEffect, useRef } from "react";"""),

("""  const [wcagVersion, setWcagVersion] = useState<WcagVersion>(DEFAULT_WCAG_VERSION);""",
 """  const [wcagVersion, setWcagVersion] = useState<WcagVersion>(DEFAULT_WCAG_VERSION);
  /**
   * Every answer the author has given, held by criterion rather than by row.
   *
   * The visible table only carries the criteria of the CURRENT version, so
   * without this a round trip 2.2 -> 2.1 -> 2.2 would quietly discard the work
   * done on the nine criteria 2.1 does not contain. A ref, not state: it never
   * drives a render - the table does.
   */
  const answers = useRef<Map<string, { conformance: ConformanceLevel; remarks: string }>>(new Map());"""),

("""  const updateConformance = useCallback((index: number, value: ConformanceLevel) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], conformance: value };
      return updated;
    });
  }, []);""",
 """  const updateConformance = useCallback((index: number, value: ConformanceLevel) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], conformance: value };
      answers.current.set(updated[index].criterion, {
        conformance: value,
        remarks: updated[index].remarks,
      });
      return updated;
    });
  }, []);"""),

("""  const updateRemarks = useCallback((index: number, value: string) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], remarks: value };
      return updated;
    });
  }, []);""",
 """  const updateRemarks = useCallback((index: number, value: string) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], remarks: value };
      answers.current.set(updated[index].criterion, {
        conformance: updated[index].conformance,
        remarks: value,
      });
      return updated;
    });
  }, []);"""),

("""  const changeWcagVersion = useCallback((version: WcagVersion) => {
    setWcagVersion(version);
    setRows((prev) => {
      const answered = new Map(prev.map((row) => [row.criterion, row]));
      return buildInitialRows(version).map((row) => {
        const kept = answered.get(row.criterion);
        return kept ? { ...row, conformance: kept.conformance, remarks: kept.remarks } : row;
      });
    });
  }, []);""",
 """  const changeWcagVersion = useCallback((version: WcagVersion) => {
    setWcagVersion(version);
    setRows(
      buildInitialRows(version).map((row) => {
        const kept = answers.current.get(row.criterion);
        return kept ? { ...row, conformance: kept.conformance, remarks: kept.remarks } : row;
      }),
    );
  }, []);"""),

("""    setWcagVersion(DEFAULT_WCAG_VERSION);
    setRows(buildInitialRows(DEFAULT_WCAG_VERSION));""",
 """    setWcagVersion(DEFAULT_WCAG_VERSION);
    answers.current.clear();
    setRows(buildInitialRows(DEFAULT_WCAG_VERSION));"""),

("""   * Switching version rebuilds the table, so it must carry the author's answers
   * across: the two versions share 78 criteria, and silently discarding a
   * half-finished evaluation because the version changed is data loss.""",
 """   * Switching version rebuilds the table from the answer store above, so no
   * answer is lost - not even for criteria the newly selected version does not
   * contain, which is what makes a round trip between versions safe."""),
]

for vecchio, nuovo in COPPIE:
    if s.count(vecchio) != 1:
        sys.exit("ancoraggio non unico (%d): %r" % (s.count(vecchio), vecchio[:60]))
    s = s.replace(vecchio, nuovo, 1)

io.open(p, 'wb').write((s.replace(NL, '\r\n') if crlf else s).encode('utf-8'))
print("applicate %d sostituzioni" % len(COPPIE))
