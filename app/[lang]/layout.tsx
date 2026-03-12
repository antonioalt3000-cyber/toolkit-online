import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import CookieConsent from '@/components/CookieConsent';
import ConsentManager from '@/components/ConsentManager';
import { locales, common, type Locale } from '@/lib/translations';
import { BASE_URL } from '@/lib/seo';

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = (lang as Locale) || 'en';
  const t = common[locale];
  return {
    title: { default: t.siteMetaTitle, template: `%s | ${t.siteTitle}` },
    description: t.siteDescription,
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: Object.fromEntries(locales.map((l) => [l, `${BASE_URL}/${l}`])),
    },
    openGraph: {
      type: 'website',
      siteName: 'ToolKit Online',
      title: t.siteMetaTitle,
      description: t.siteDescription,
      url: `${BASE_URL}/${locale}`,
      locale: locale,
    },
    twitter: {
      card: 'summary',
      title: t.siteMetaTitle,
      description: t.siteDescription,
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
      <BackToTop />
      <ConsentManager />
      <CookieConsent />
    </div>
  );
}
