---
name: seo-check
description: Analyze SEO quality of a tool page and suggest improvements
user-invocable: true
argument-hint: "[tool-slug]"
---

Analyze the SEO quality of the tool page for `$0`.

## Checks to perform:

1. **Read the page file** at `app/[lang]/tools/$0/page.tsx`
2. **Check translations** in `lib/translations.ts` — verify metaTitle and metaDescription exist for all 6 locales
3. **Check content quality**:
   - Does it have a ToolPageWrapper (breadcrumbs + related tools)?
   - Is there an SEO article section with 300+ words?
   - Is there a FAQ section with 4+ questions?
   - Are all 6 languages present?
4. **Check keyword optimization**:
   - Are metaTitle and metaDescription keyword-rich?
   - Do FAQ questions target long-tail searches?
5. **Fetch the live page** at https://toolkitonline.vip/en/tools/$0 and verify it loads correctly
6. **Check sitemap** inclusion at https://toolkitonline.vip/sitemap.xml

## Report:
- SEO score (0-100)
- Issues found
- Specific improvements with suggested text
- Missing translations or content
