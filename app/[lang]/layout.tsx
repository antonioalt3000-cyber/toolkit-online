import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { locales, common, type Locale } from '@/lib/translations';

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = (lang as Locale) || 'en';
  const t = common[locale];
  return {
    title: { default: t.siteTitle, template: `%s | ${t.siteTitle}` },
    description: t.siteDescription,
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <div lang={lang}>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}
