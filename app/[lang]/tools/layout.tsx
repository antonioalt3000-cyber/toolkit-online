import type { Metadata } from 'next';
import { locales, type Locale } from '@/lib/translations';
import { BASE_URL } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = (lang as Locale) || 'en';

  return {
    openGraph: {
      type: 'website',
      locale: locale,
      siteName: 'ToolKit Online',
    },
    twitter: {
      card: 'summary',
    },
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, `${BASE_URL}/${l}/tools`])
      ),
    },
  };
}

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
