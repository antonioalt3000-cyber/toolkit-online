import { NextResponse } from 'next/server';
import { tools, getToolsByCategory } from '@/lib/translations';

// llms.txt — machine-readable site index for AI assistants/search engines
// (llmstxt.org convention). Generated from the tool registry so it never
// drifts from the sitemap: every registered tool appears with its EN name
// and description.

export const dynamic = 'force-static';

const BASE_URL = 'https://toolkitonline.vip';

const CATEGORY_TITLES: Record<string, string> = {
  finance: 'Finance & insurance calculators',
  text: 'Text & writing tools',
  health: 'Health & fitness calculators',
  conversion: 'Converters & file tools',
  dev: 'Developer & web tools',
  math: 'Math & time tools',
  images: 'Image tools',
  energy: 'Energy & sustainability calculators',
};

export function GET() {
  const byCategory = getToolsByCategory();

  const lines: string[] = [
    '# ToolKit Online',
    '',
    '> Free online tools and calculators — no sign-up, no installation. Available in 6 languages (English, Italian, Spanish, French, German, Portuguese): replace /en/ in any URL with it, es, fr, de or pt.',
    '',
    `All tools run in the browser. Every tool page includes a how-to article and an FAQ section.`,
    '',
  ];

  for (const [category, slugs] of Object.entries(byCategory)) {
    lines.push(`## ${CATEGORY_TITLES[category] ?? category}`);
    lines.push('');
    for (const slug of slugs) {
      const en = tools[slug]?.en;
      if (!en) continue;
      lines.push(`- [${en.name}](${BASE_URL}/en/tools/${slug}): ${en.description}`);
    }
    lines.push('');
  }

  lines.push('## Optional');
  lines.push('');
  lines.push(`- [Blog](${BASE_URL}/en/blog): guides and how-to articles`);
  lines.push('');

  return new NextResponse(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
