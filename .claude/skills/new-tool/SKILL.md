---
name: new-tool
description: Create a new tool with full translations, SEO content, and FAQ
user-invocable: true
argument-hint: "[tool-slug] [category]"
---

Create a new tool for ToolKit Online. The tool slug is $ARGUMENTS[0] and the category is $ARGUMENTS[1].

## Steps:

1. **Create the tool page** at `app/[lang]/tools/$0/page.tsx`:
   - Use 'use client' with useState and useParams
   - Import ToolPageWrapper from @/components/ToolPageWrapper
   - Build a functional, interactive tool UI
   - Add SEO article (300-400 words) in 6 languages (en, it, es, fr, de, pt)
   - Add FAQ accordion (4-5 questions) targeting long-tail keywords
   - Wrap everything in `<ToolPageWrapper toolSlug="$0">`
   - Use max-w-2xl layout

2. **Add translations** to `lib/translations.ts`:
   - Add entry to the `tools` object with name, description, metaTitle, metaDescription for all 6 locales
   - Add the slug to the correct category array in `getToolsByCategory()`

3. **Verify build**: Run `npx next build` to ensure no errors

4. **Report**: Show the new tool's URLs for all 6 languages

## Important:
- Follow the exact same patterns as existing tools (read one first for reference)
- SEO content must be genuinely useful, not filler
- All translations must be real, not machine placeholders
- The tool must be fully functional and interactive
