import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/seo';

const TOOL_SLUG = 'lorem-ipsum-generator';

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
