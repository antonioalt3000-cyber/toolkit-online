import { describe, it, expect } from 'vitest';
import { generateToolMetadata, generateToolJsonLd, BASE_URL } from '@/lib/seo';
import { toolList, locales } from '@/lib/translations';

// Use a real, existing tool slug so the tests track the actual data set.
const sampleSlug = toolList[0];

describe('generateToolMetadata', () => {
  it('emits a canonical URL and hreflang alternates for every locale', () => {
    const meta = generateToolMetadata(sampleSlug, 'en');
    expect(meta.alternates?.canonical).toBe(`${BASE_URL}/en/tools/${sampleSlug}`);

    const langs = (meta.alternates?.languages ?? {}) as Record<string, string>;
    for (const l of locales) {
      expect(langs[l]).toBe(`${BASE_URL}/${l}/tools/${sampleSlug}`);
    }
    expect(langs['x-default']).toBe(`${BASE_URL}/en/tools/${sampleSlug}`);
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
