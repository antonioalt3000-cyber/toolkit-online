'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { common, tools, getToolsByCategory, type Locale } from '@/lib/translations';

const labels: Record<string, Record<string, string>> = {
  cookieSettings: { en: 'Cookie Settings', it: 'Impostazioni Cookie', es: 'Configuracion de Cookies', fr: 'Parametres des Cookies', de: 'Cookie-Einstellungen', pt: 'Configuracoes de Cookies' },
  disclaimer:     { en: 'Disclaimer', it: 'Disclaimer', es: 'Aviso Legal', fr: 'Avertissement', de: 'Haftungsausschluss', pt: 'Aviso Legal' },
  accessibility:  { en: 'Accessibility', it: 'Accessibilita', es: 'Accesibilidad', fr: 'Accessibilite', de: 'Barrierefreiheit', pt: 'Acessibilidade' },
  allTools:       { en: 'All Tools by Category', it: 'Tutti gli strumenti', es: 'Todas las herramientas', fr: 'Tous les outils', de: 'Alle Tools', pt: 'Todas as ferramentas' },
};

const popularToolsByCategory: Record<string, string[]> = {
  finance: ['vat-calculator', 'percentage-calculator', 'loan-calculator', 'currency-converter'],
  text:    ['word-counter', 'lorem-ipsum-generator', 'text-case-converter'],
  health:  ['bmi-calculator', 'calorie-calculator', 'body-fat-calculator'],
  dev:     ['json-formatter', 'password-generator', 'qr-code-generator', 'color-picker'],
  math:    ['age-calculator', 'date-calculator', 'random-number-generator', 'scientific-calculator'],
  conversion: ['unit-converter', 'base64-converter', 'time-zone-converter'],
  images:  ['image-compressor', 'pixel-ruler'],
};

export default function Footer() {
  const params = useParams();
  const lang = (params?.lang as Locale) || 'en';
  const t = common[lang];
  const categories = getToolsByCategory();

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800/60 mt-12">
      {/* Social Proof Banner */}
      <div className="border-b border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-4 py-3 text-center">
          <p className="text-sm font-medium text-zinc-400">{t.footerSocialProof}</p>
        </div>
      </div>

      {/* Popular Tools by Category */}
      <div className="border-b border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-zinc-200 font-bold text-sm mb-6 uppercase tracking-wider">
            {t.footerPopularTools}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6">
            {Object.entries(popularToolsByCategory).map(([catKey, slugs]) => (
              <div key={catKey}>
                <h3 className="text-zinc-500 font-semibold text-xs mb-3 uppercase tracking-wider">
                  {t.categories[catKey] || catKey}
                </h3>
                <ul className="space-y-1.5">
                  {slugs.map((slug) => {
                    const toolData = tools[slug]?.[lang];
                    if (!toolData) return null;
                    return (
                      <li key={slug}>
                        <Link href={`/${lang}/tools/${slug}`} className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors">
                          {toolData.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Tools Expandable */}
      <div className="border-b border-zinc-800/60">
        <details className="max-w-6xl mx-auto px-4 py-5">
          <summary className="text-zinc-500 font-semibold text-xs cursor-pointer hover:text-zinc-300 transition-colors uppercase tracking-wider">
            {labels.allTools[lang] || labels.allTools.en}
          </summary>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-6">
            {Object.entries(categories).map(([catKey, slugs]) => (
              <div key={catKey}>
                <h3 className="text-zinc-400 font-semibold text-xs mb-3 uppercase tracking-wider">
                  {t.categories[catKey] || catKey}
                </h3>
                <ul className="space-y-1.5 text-xs">
                  {slugs.map((slug) => {
                    const toolData = tools[slug]?.[lang];
                    if (!toolData) return null;
                    return (
                      <li key={slug}>
                        <Link href={`/${lang}/tools/${slug}`} className="text-zinc-600 hover:text-zinc-300 transition-colors">
                          {toolData.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </details>
      </div>

      {/* Main Footer Columns */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href={`/${lang}`} className="text-lg font-bold text-white hover:text-blue-400 transition-colors">
              ToolKit Online
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-zinc-500">{t.footerAboutText}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-zinc-300 font-semibold text-xs mb-4 uppercase tracking-wider">{t.footerQuickLinks}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${lang}`} className="text-zinc-500 hover:text-zinc-200 transition-colors">{t.footerAllTools}</Link></li>
              <li><Link href={`/${lang}/blog`} className="text-zinc-500 hover:text-zinc-200 transition-colors">Blog</Link></li>
              <li><a href="/sitemap.xml" className="text-zinc-500 hover:text-zinc-200 transition-colors">{t.footerSitemap}</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-zinc-300 font-semibold text-xs mb-4 uppercase tracking-wider">{t.footerCompany}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${lang}/about`} className="text-zinc-500 hover:text-zinc-200 transition-colors">{t.footerAbout}</Link></li>
              <li><Link href={`/${lang}/contact`} className="text-zinc-500 hover:text-zinc-200 transition-colors">{t.footerContact}</Link></li>
              <li><Link href={`/${lang}/faq`} className="text-zinc-500 hover:text-zinc-200 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-zinc-300 font-semibold text-xs mb-4 uppercase tracking-wider">{t.footerResources}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${lang}/privacy`} className="text-zinc-500 hover:text-zinc-200 transition-colors">{t.footerPrivacy}</Link></li>
              <li><Link href={`/${lang}/terms`} className="text-zinc-500 hover:text-zinc-200 transition-colors">{t.footerTerms}</Link></li>
              <li><Link href={`/${lang}/disclaimer`} className="text-zinc-500 hover:text-zinc-200 transition-colors">{labels.disclaimer[lang]}</Link></li>
              <li><Link href={`/${lang}/about#accessibility`} className="text-zinc-500 hover:text-zinc-200 transition-colors">{labels.accessibility[lang]}</Link></li>
              <li>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-settings'))}
                  className="text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer text-left text-sm"
                >
                  {labels.cookieSettings[lang]}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-600">
          <p>&copy; {t.footerCopyright}</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <Link href={`/${lang}/privacy`} className="hover:text-zinc-400 transition-colors">{t.footerPrivacy}</Link>
            <Link href={`/${lang}/terms`} className="hover:text-zinc-400 transition-colors">{t.footerTerms}</Link>
            <Link href={`/${lang}/disclaimer`} className="hover:text-zinc-400 transition-colors">{labels.disclaimer[lang]}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
