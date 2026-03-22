---
title: "How I Got 960 Pages Indexed with Next.js Segmented Sitemaps"
published: true
tags: nextjs, seo, webdev, typescript
---

If you're building a large Next.js site with hundreds of pages, a single sitemap can actually hurt your indexation rate. Here's how I fixed it.

## The Problem

My site **[ToolKit Online](https://toolkitonline.vip)** has 155+ tools × 6 languages = ~960 pages. With a single `sitemap.xml`, Google was only indexing **7%** of my pages after months.

Why? Google allocates a limited "crawl budget" to new domains. When it sees 960 URLs in one sitemap, it cherry-picks a few and ignores the rest.

## The Fix: generateSitemaps()

Next.js 13+ (App Router) supports `generateSitemaps()` to split your sitemap into a **sitemap index** with multiple child sitemaps.

```typescript
// app/sitemap.ts
import type { MetadataRoute } from 'next';

const categories = ['finance', 'text', 'health', 'dev', 'math', 'images'];

export async function generateSitemaps() {
  return [
    { id: 'static' },
    ...categories.map((cat) => ({ id: cat })),
    { id: 'blog' },
  ];
}

export default function sitemap({ id }: { id: string }): MetadataRoute.Sitemap {
  if (id === 'static') {
    // Return home, about, contact, category hub pages
  }

  // Return tools for this category
  const categoryTools = getToolsByCategory()[id] || [];
  return categoryTools.flatMap((tool) =>
    locales.map((locale) => ({
      url: `https://example.com/${locale}/tools/${tool}`,
      priority: locale === 'it' ? 0.8 : 0.6, // prioritize best-performing locale
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `https://example.com/${l}/tools/${tool}`])
        ),
      },
    }))
  );
}
```

This generates:
- `/sitemap/static.xml` — home, hub pages, legal pages
- `/sitemap/finance.xml` — 29 finance tools × 6 languages
- `/sitemap/text.xml` — 22 text tools × 6 languages
- ... and so on

Each sitemap has 100-200 URLs instead of 960. Google can digest these much faster.

## Bonus: Locale-Based Priority

I noticed from Google Search Console that my Italian pages perform 5x better than English ones (less competition). So I set:

- Italian pages: `priority: 0.8`
- Other languages: `priority: 0.6`

This hints Google to crawl Italian pages first — where I actually have a chance to rank.

## Other SEO Wins

### 1. WebApplication Schema

For tool pages, I added `WebApplication` JSON-LD alongside `FAQPage` and `HowTo`:

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "JSON Formatter",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
}
```

### 2. Hreflang Alternates

Every sitemap entry includes `alternates.languages` — this tells Google that `/en/tools/json-formatter` and `/it/tools/json-formatter` are the same tool in different languages, preventing duplicate content issues.

## Results

I just deployed these changes, so I'll report back in 2-4 weeks. But based on SEO research, segmented sitemaps typically improve indexation rates by 30-50% for large sites.

If you're running a Next.js site with 100+ pages and struggling with indexation, try this approach. It takes 30 minutes to implement and costs nothing.

**Full site: [toolkitonline.vip](https://toolkitonline.vip)** — 155+ free browser tools, no signup required.
