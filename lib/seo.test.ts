import { describe, it, expect } from 'vitest';
import {
  generateToolMetadata,
  generateToolJsonLd,
  robotsFor,
  BASE_URL,
  INDEXABLE_LOCALES,
} from '@/lib/seo';
import { toolList, locales } from '@/lib/translations';

// Use a real, existing tool slug so the tests track the actual data set.
const sampleSlug = toolList[0];

describe('generateToolMetadata', () => {
  it('emits a canonical URL and hreflang alternates only for indexable locales', () => {
    const meta = generateToolMetadata(sampleSlug, 'en');
    expect(meta.alternates?.canonical).toBe(`${BASE_URL}/en/tools/${sampleSlug}`);

    const langs = (meta.alternates?.languages ?? {}) as Record<string, string>;
    for (const l of INDEXABLE_LOCALES) {
      expect(langs[l]).toBe(`${BASE_URL}/${l}/tools/${sampleSlug}`);
    }
    // Non-indexable locales must NOT appear in hreflang clusters.
    for (const l of locales.filter((x) => !INDEXABLE_LOCALES.includes(x))) {
      expect(langs[l]).toBeUndefined();
    }
    expect(langs['x-default']).toBe(`${BASE_URL}/en/tools/${sampleSlug}`);
  });

  it('marks indexable locales index and others noindex (follow always on)', () => {
    for (const l of locales) {
      const r = robotsFor(l) as { index: boolean; follow: boolean };
      expect(r.index).toBe(INDEXABLE_LOCALES.includes(l));
      expect(r.follow).toBe(true);
    }
  });

  it('falls back to English data for an unknown locale', () => {
    const meta = generateToolMetadata(sampleSlug, 'xx');
    expect(meta.title).toBeTruthy();
    expect(meta.description).toBeTruthy();
  });

  it('returns empty metadata for an unknown tool slug', () => {
    expect(generateToolMetadata('__does_not_exist__', 'en')).toEqual({});
  });
});

describe('generateToolJsonLd', () => {
  it('produces a free WebApplication schema for a known tool', () => {
    const jsonLd = generateToolJsonLd(sampleSlug, 'en');
    expect(jsonLd).not.toBeNull();
    expect(jsonLd!['@type']).toBe('WebApplication');
    expect(jsonLd!.offers.price).toBe('0');
    expect(jsonLd!.url).toBe(`${BASE_URL}/en/tools/${sampleSlug}`);
  });

  it('returns null for an unknown tool slug', () => {
    expect(generateToolJsonLd('__does_not_exist__', 'en')).toBeNull();
  });
});
