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
