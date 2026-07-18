import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tools, toolList, locales, getToolsByCategory } from '@/lib/translations';

// These tests guard the most common bug class in this project:
// missing translations and orphaned tool slugs.

describe('translations data integrity', () => {
  it('every tool exposes all 6 locales with non-empty meta', () => {
    const problems: string[] = [];
    for (const slug of toolList) {
      for (const l of locales) {
        const t = tools[slug]?.[l];
        if (!t) {
          problems.push(`${slug}: missing locale ${l}`);
          continue;
        }
        if (!t.metaTitle) problems.push(`${slug}/${l}: empty metaTitle`);
        if (!t.metaDescription) problems.push(`${slug}/${l}: empty metaDescription`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('toolList equals the keys of the tools map', () => {
    expect(toolList).toEqual(Object.keys(tools));
  });
});

describe('getToolsByCategory', () => {
  const categories = getToolsByCategory();
  const categorized = Object.values(categories).flat();

  it('every categorized slug exists in the tools map', () => {
    const known = new Set(toolList);
    const orphans = categorized.filter((s) => !known.has(s));
    expect(orphans).toEqual([]);
  });

  it('every categorized slug has a built page directory (no phantom 404s)', () => {
    const toolsDir = join(process.cwd(), 'app', '[lang]', 'tools');
    const phantom = categorized.filter((s) => !existsSync(join(toolsDir, s)));
    expect(phantom).toEqual([]);
  });

  it('every tool ships BOTH page.tsx and layout.tsx (layout carries SEO metadata)', () => {
    // Guards the 2026-07-18 regression: 11 tools shipped page.tsx without the
    // sibling layout.tsx, so they fell back to the root layout's generic title
    // (duplicate <title>, no canonical, wrong hreflang, no JSON-LD).
    const toolsDir = join(process.cwd(), 'app', '[lang]', 'tools');
    const missingPage = categorized.filter((s) => !existsSync(join(toolsDir, s, 'page.tsx')));
    const missingLayout = categorized.filter((s) => !existsSync(join(toolsDir, s, 'layout.tsx')));
    expect({ missingPage, missingLayout }).toEqual({
      missingPage: [],
      missingLayout: [],
    });
  });

  it('lists no slug in more than one category', () => {
    const seen = new Set<string>();
    const dups: string[] = [];
    for (const s of categorized) {
      if (seen.has(s)) dups.push(s);
      seen.add(s);
    }
    expect(dups).toEqual([]);
  });
});

describe('metaTitle hygiene', () => {
  it('no metaTitle embeds the brand suffix (the title template adds it once)', () => {
    // Guards the 2026-07-18 double-suffix regression: 325 metaTitles already
    // ended with "| ToolKit Online" while the root layout template appends
    // "%s | ToolKit Online", rendering "... | ToolKit Online | ToolKit Online".
    const offenders: string[] = [];
    for (const slug of toolList) {
      for (const l of locales) {
        const t = tools[slug]?.[l];
        if (t?.metaTitle && /\|\s*ToolKit Online\s*$/i.test(t.metaTitle)) {
          offenders.push(`${slug}/${l}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
