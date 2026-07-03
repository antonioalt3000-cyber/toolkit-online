import { describe, it, expect } from 'vitest';
// ESM monitor script: named-import the pure decision helpers. The scan
// side-effects (network, file writes, process.exit) run only under the CLI
// main-guard, so importing the module here never triggers a live scan.
import * as ouroboros from './ouroboros.mjs';

type Reason = { type: string; was?: number; now?: number; delta?: number; findings?: string[] };
type Norm = {
  score: number | null;
  grade: string | null;
  findings: string[];
  size?: number | null;
};
type Entry = { score: number | null; ok?: boolean; findings?: string[] };

const { regressionFor, NORMALIZE, numOrNull } = ouroboros as unknown as {
  regressionFor: (cur: Entry, base: Entry | undefined, kind: string) => Reason[] | null;
  NORMALIZE: Record<string, (j: unknown) => Norm>;
  numOrNull: (v: unknown) => number | null;
};

// Default score-drop threshold is 5 (OUROBOROS_SCORE_DROP unset under vitest).
describe('regressionFor — the wake-me-up decision', () => {
  it('first run (no baseline) never alerts', () => {
    expect(regressionFor({ score: 40, findings: [] }, undefined, 'headers')).toBeNull();
  });

  it('score drop >= threshold is a regression', () => {
    const r = regressionFor({ score: 70, findings: [] }, { score: 90, findings: [] }, 'seo');
    expect(r).not.toBeNull();
    expect(r![0]).toMatchObject({ type: 'score-drop', was: 90, now: 70, delta: -20 });
  });

  it('score drop below threshold is not a regression', () => {
    expect(
      regressionFor({ score: 87, findings: [] }, { score: 90, findings: [] }, 'seo')
    ).toBeNull();
  });

  it('a score improvement never alerts', () => {
    expect(
      regressionFor({ score: 95, findings: [] }, { score: 80, findings: [] }, 'headers')
    ).toBeNull();
  });

  it('a new security-header finding is a regression', () => {
    const r = regressionFor(
      { score: 90, findings: ['hdr:CSP', 'hdr:HSTS'] },
      { score: 90, findings: ['hdr:CSP'] },
      'headers'
    );
    expect(r![0]).toMatchObject({ type: 'new-findings', findings: ['hdr:HSTS'] });
  });

  it('a snapshot that starts failing is a regression (folded into new-findings)', () => {
    const r = regressionFor(
      { score: null, findings: ['snapshot:failed'] },
      { score: null, findings: [] },
      'snapshot'
    );
    expect(r![0]).toMatchObject({ type: 'new-findings', findings: ['snapshot:failed'] });
  });

  it('SEO finding churn is NOT alerted (only its score matters)', () => {
    const r = regressionFor(
      { score: 90, findings: ['seo:title', 'seo:h1'] },
      { score: 90, findings: ['seo:title'] },
      'seo'
    );
    expect(r).toBeNull();
  });

  it('a stable state (same score, same findings) is nominal', () => {
    expect(
      regressionFor(
        { score: 73, findings: ['hdr:CSP'] },
        { score: 73, findings: ['hdr:CSP'] },
        'headers'
      )
    ).toBeNull();
  });
});

describe('NORMALIZE — SaaS payload → {score, grade, findings}', () => {
  it('headers: keeps score+grade, drops "positive" findings', () => {
    const n = NORMALIZE.headers({
      score: 88,
      grade: 'A',
      findings: [
        { id: 'CSP', severity: 'high' },
        { id: 'X-Frame', severity: 'positive' },
      ],
    });
    expect(n.score).toBe(88);
    expect(n.grade).toBe('A');
    expect(n.findings).toEqual(['hdr:CSP']);
  });

  it('seo: score + only failing checks', () => {
    const n = NORMALIZE.seo({
      score: 81,
      checks: [
        { id: 'title', status: 'pass' },
        { id: 'meta-description', status: 'fail' },
      ],
    });
    expect(n.score).toBe(81);
    expect(n.findings).toEqual(['seo:meta-description']);
  });

  it('gdpr: overallScore + only critical issues', () => {
    const n = NORMALIZE.gdpr({
      overallScore: 72,
      issues: [
        { title: 'No cookie consent', severity: 'critical' },
        { title: 'No DPO', severity: 'warning' },
      ],
    });
    expect(n.score).toBe(72);
    expect(n.findings).toEqual(['gdpr:No cookie consent']);
  });

  it('snapshot: success→no findings, failure→snapshot:failed', () => {
    expect(NORMALIZE.snapshot({ success: true, data: { size: 1024 } }).findings).toEqual([]);
    expect(NORMALIZE.snapshot({ success: false }).findings).toEqual(['snapshot:failed']);
  });

  it('defensive: missing fields degrade to null/[] (never throws)', () => {
    const n = NORMALIZE.headers({});
    expect(n.score).toBeNull();
    expect(n.findings).toEqual([]);
  });
});

describe('numOrNull', () => {
  it('passes finite numbers, nulls everything else', () => {
    expect(numOrNull(87)).toBe(87);
    expect(numOrNull(0)).toBe(0);
    expect(numOrNull('87')).toBeNull();
    expect(numOrNull(Number.NaN)).toBeNull();
    expect(numOrNull(undefined)).toBeNull();
  });
});
