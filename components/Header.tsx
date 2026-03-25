'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { locales, localeNames, common, type Locale } from '@/lib/translations';

const navLabels: Record<string, Record<string, string>> = {
  home: { en: 'Home', it: 'Home', es: 'Inicio', fr: 'Accueil', de: 'Start', pt: 'Inicio' },
  tools: { en: 'All Tools', it: 'Tutti i Tool', es: 'Herramientas', fr: 'Outils', de: 'Alle Tools', pt: 'Ferramentas' },
  blog: { en: 'Blog', it: 'Blog', es: 'Blog', fr: 'Blog', de: 'Blog', pt: 'Blog' },
  faq: { en: 'FAQ', it: 'FAQ', es: 'FAQ', fr: 'FAQ', de: 'FAQ', pt: 'FAQ' },
  about: { en: 'About', it: 'Chi siamo', es: 'Acerca de', fr: 'A propos', de: 'Uber uns', pt: 'Sobre' },
};

export default function Header() {
  const params = useParams();
  const pathname = usePathname();
  const lang = (params?.lang as Locale) || 'en';
  const t = common[lang];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const switchLangPath = (targetLang: string) => {
    const segments = pathname.split('/');
    segments[1] = targetLang;
    return segments.join('/');
  };

  return (
    <>
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none"
    >
      {lang === 'it' ? 'Vai al contenuto' :
       lang === 'es' ? 'Ir al contenido' :
       lang === 'fr' ? 'Aller au contenu' :
       lang === 'de' ? 'Zum Inhalt springen' :
       lang === 'pt' ? 'Ir para o conteudo' :
       'Skip to content'}
    </a>
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${lang}`} className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t.siteTitle}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-5" aria-label="Main navigation">
          <Link href={`/${lang}`} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            {navLabels.home[lang]}
          </Link>
          <Link href={`/${lang}/tools`} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            {navLabels.tools[lang]}
          </Link>
          <Link href={`/${lang}/blog`} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            {navLabels.blog[lang]}
          </Link>
          <Link href={`/${lang}/faq`} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            {navLabels.faq[lang]}
          </Link>
          <Link href={`/${lang}/about`} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            {navLabels.about[lang]}
          </Link>
        </nav>

        {/* Language Switcher + Mobile Menu */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {locales.map((l) => (
              <Link
                key={l}
                href={switchLangPath(l)}
                className={`text-xs px-2.5 py-1.5 rounded-md font-medium transition-all ${
                  l === lang
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {localeNames[l]}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          <Link href={`/${lang}`} className="block py-2 text-sm font-medium text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
            {navLabels.home[lang]}
          </Link>
          <Link href={`/${lang}/tools`} className="block py-2 text-sm font-medium text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
            {navLabels.tools[lang]}
          </Link>
          <Link href={`/${lang}/blog`} className="block py-2 text-sm font-medium text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
            {navLabels.blog[lang]}
          </Link>
          <Link href={`/${lang}/faq`} className="block py-2 text-sm font-medium text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
            {navLabels.faq[lang]}
          </Link>
          <Link href={`/${lang}/about`} className="block py-2 text-sm font-medium text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
            {navLabels.about[lang]}
          </Link>
          <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
            {locales.map((l) => (
              <Link
                key={l}
                href={switchLangPath(l)}
                className={`text-xs px-2.5 py-1.5 rounded-md font-medium ${
                  l === lang ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {localeNames[l]}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
    </>
  );
}
