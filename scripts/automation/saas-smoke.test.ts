import { describe, it, expect } from 'vitest';
import smoke from './saas-smoke.js';

const { summarizeSmoke, smokeSubject, buildHtml } = smoke as {
  summarizeSmoke: (r: Array<{ tool: string; ok: boolean }>) => {
    allGreen: boolean;
    failingTools: string[];
  };
  smokeSubject: (allGreen: boolean, failing: string[], date: string) => string;
  buildHtml: (r: unknown[], allGreen: boolean, date: string) => string;
};

const res = (tool: string, ok: boolean) => ({
  name: tool,
  tool,
  ok,
  checks: [{ name: 'core', ok, detail: ok ? '200' : '500' }],
});

describe('summarizeSmoke — daily functional monitor aggregation', () => {
  it('all green', () => {
    const s = summarizeSmoke([res('F1', true), res('F4', true), res('B7', true)]);
    expect(s.allGreen).toBe(true);
    expect(s.failingTools).toEqual([]);
  });

  it('reports the exact failing tools', () => {
    const s = summarizeSmoke([res('F1', true), res('F3', false), res('B7', false)]);
    expect(s.allGreen).toBe(false);
    expect(s.failingTools).toEqual(['F3', 'B7']);
  });
});

describe('smokeSubject — green vs red subject line', () => {
  it('green subject when all operational', () => {
    expect(smokeSubject(true, [], '12/06/2026 UTC')).toMatch(/✅.*tutti operativi/);
  });
  it('red subject lists failing tools', () => {
    expect(smokeSubject(false, ['F3'], '12/06/2026 UTC')).toMatch(/🔴.*F3/);
  });
});

describe('buildHtml — digest body markers', () => {
  it('green headline when all ok', () => {
    const html = buildHtml([res('F1', true)], true, '12/06/2026 UTC');
    expect(html).toMatch(/Tutti e \d+ i SaaS sono operativi/);
    expect(html).toContain('🟢 F1');
  });
  it('red headline + red row when a SaaS fails', () => {
    const html = buildHtml([res('F3', false)], false, '12/06/2026 UTC');
    expect(html).toContain('SaaS con problemi');
    expect(html).toContain('🔴 F3');
  });
});
