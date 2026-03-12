#!/usr/bin/env node
/**
 * Generate layout.tsx files for all tool directories that lack them.
 * Each layout provides per-tool SEO metadata (canonical, OG, hreflang, twitter).
 * Run: node scripts/generate-tool-layouts.js
 */
const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, '..', 'app', '[lang]', 'tools');

const layoutTemplate = (slug) => `import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/seo';

const TOOL_SLUG = '${slug}';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return generateToolMetadata(TOOL_SLUG, lang);
}

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
`;

const dirs = fs.readdirSync(toolsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

let created = 0;
let skipped = 0;

for (const dir of dirs) {
  const layoutPath = path.join(toolsDir, dir, 'layout.tsx');
  const pagePath = path.join(toolsDir, dir, 'page.tsx');

  // Only create layout if page.tsx exists and layout.tsx does not
  if (fs.existsSync(pagePath) && !fs.existsSync(layoutPath)) {
    fs.writeFileSync(layoutPath, layoutTemplate(dir));
    console.log(`Created: ${dir}/layout.tsx`);
    created++;
  } else if (fs.existsSync(layoutPath)) {
    skipped++;
  }
}

console.log(`\nDone! Created ${created} layouts, skipped ${skipped} (already existed).`);
