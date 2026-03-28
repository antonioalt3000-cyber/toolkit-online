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

const skipLabels: Record<string, string> = {
  en: 'Skip to content',
  it: 'Vai al contenuto',
  es: 'Ir al contenido',
  fr: 'Aller au contenu',
  de: 'Zum Inhalt springen',
  pt: 'Ir para o conteudo',
};

export default function Header() {
  const params = useParams();
  const pathname = usePathname();
  const lang = (params?.lang as Locale) || 'en';
  const t = common[lang];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const switchLangPath = (targetLang: string) => {
    const segments = pathname.split('/');
    segments[1] = targetLang;
    return segments.join('/');
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-blue-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none"
      >
        {skipLabels[lang] || skipLabels.en}
      </a>
      <header className="bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/60 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${lang}`} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-shadow">
              <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              {t.siteTitle}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {Object.entries(navLabels).map(([key, labels]) => (
              <Link
                key={key}
                href={key === 'home' ? `/${lang}` : `/${lang}/${key === 'tools' ? 'tools' : key}`}
                className="text-sm font-medium text-zinc-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-zinc-800/50 transition-all"
              >
                {labels[lang]}
              </Link>
            ))}
          </nav>

          {/* Right side: Lang + Mobile */}
          <div className="flex items-center gap-2">
            {/* Language Selector - Dropdown */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-zinc-800/50 transition-all"
                aria-label="Language"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
                <span className="uppercase text-xs font-semibold tracking-wider">{lang}</span>
                <svg className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-1 z-50 min-w-[140px]">
                    {locales.map((l) => (
                      <Link
                        key={l}
                        href={switchLangPath(l)}
                        onClick={() => setLangOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                          l === lang
                            ? 'text-blue-400 bg-blue-500/10'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                        }`}
                      >
                        <span className="uppercase text-xs font-semibold tracking-wider w-5">{l}</span>
                        <span>{localeNames[l]}</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all"
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
          <div className="md:hidden border-t border-zinc-800/60 bg-zinc-950 px-4 py-3 space-y-1">
            {Object.entries(navLabels).map(([key, labels]) => (
              <Link
                key={key}
                href={key === 'home' ? `/${lang}` : `/${lang}/${key === 'tools' ? 'tools' : key}`}
                className="block py-2.5 px-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-md transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                {labels[lang]}
              </Link>
            ))}
            <div className="flex items-center gap-1 pt-3 mt-2 border-t border-zinc-800/60">
              {locales.map((l) => (
                <Link
                  key={l}
                  href={switchLangPath(l)}
                  className={`text-xs px-2.5 py-1.5 rounded-md font-semibold uppercase tracking-wider transition-all ${
                    l === lang
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {l}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
