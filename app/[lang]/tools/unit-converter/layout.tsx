import type { Metadata } from 'next';
import { generateToolMetadata, generateToolJsonLd } from '@/lib/seo';

const TOOL_SLUG = 'unit-converter';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return generateToolMetadata(TOOL_SLUG, lang);
}

export default async function ToolLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const jsonLd = generateToolJsonLd(TOOL_SLUG, lang);

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
