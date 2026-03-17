'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { common, tools, getToolsByCategory, type Locale } from '@/lib/translations';

const cookieSettingsLabels: Record<string, string> = {
  en: 'Cookie Settings',
  it: 'Impostazioni Cookie',
  es: 'Configuracion de Cookies',
  fr: 'Parametres des Cookies',
  de: 'Cookie-Einstellungen',
  pt: 'Configuracoes de Cookies',
};

const allToolsLabels: Record<string, string> = {
  en: 'All Tools by Category',
  it: 'Tutti gli strumenti per categoria',
  es: 'Todas las herramientas por categoria',
  fr: 'Tous les outils par categorie',
  de: 'Alle Tools nach Kategorie',
  pt: 'Todas as ferramentas por categoria',
};

// Popular tools per category (3-4 most important ones for the footer)
const popularToolsByCategory: Record<string, string[]> = {
  finance: ['vat-calculator', 'percentage-calculator', 'loan-calculator', 'currency-converter'],
  text: ['word-counter', 'lorem-ipsum-generator', 'text-case-converter'],
  health: ['bmi-calculator', 'calorie-calculator', 'body-fat-calculator'],
  dev: ['json-formatter', 'password-generator', 'qr-code-generator', 'color-picker'],
  math: ['age-calculator', 'date-calculator', 'random-number-generator', 'scientific-calculator'],
  conversion: ['unit-converter', 'base64-converter', 'time-zone-converter'],
  images: ['image-compressor', 'pixel-ruler'],
};

export default function Footer() {
  const params = useParams();
  const lang = (params?.lang as Locale) || 'en';
  const t = common[lang];
  const categories = getToolsByCategory();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      {/* Social Proof Banner */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center">
          <p className="text-sm font-semibold text-white tracking-wide">
            {t.footerSocialProof}
          </p>
        </div>
      </div>

      {/* Popular Tools by Category */}
      <div className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-gray-100 font-bold text-lg mb-6">
            {t.footerPopularTools}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6">
            {Object.entries(popularToolsByCategory).map(([catKey, slugs]) => (
              <div key={catKey}>
                <h3 className="text-gray-100 font-semibold text-xs mb-2 uppercase tracking-wider">
                  {t.categories[catKey] || catKey}
                </h3>
                <ul className="space-y-1">
                  {slugs.map((slug) => {
                    const toolData = tools[slug]?.[lang];
                    if (!toolData) return null;
                    return (
                      <li key={slug}>
                        <Link
                          href={`/${lang}/tools/${slug}`}
                          className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
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

      {/* All Tools Expandable Section */}
      <div className="border-b border-gray-800">
        <details className="max-w-6xl mx-auto px-4 py-6">
          <summary className="text-gray-100 font-bold text-sm cursor-pointer hover:text-white transition-colors">
            {allToolsLabels[lang] || allToolsLabels.en}
          </summary>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-6">
            {Object.entries(categories).map(([catKey, slugs]) => (
              <div key={catKey}>
                <h3 className="text-gray-100 font-semibold text-xs mb-3 uppercase tracking-wider">
                  {t.categories[catKey] || catKey}
                </h3>
                <ul className="space-y-1 text-xs">
                  {slugs.map((slug) => {
                    const toolData = tools[slug]?.[lang];
                    if (!toolData) return null;
                    return (
                      <li key={slug}>
                        <Link
                          href={`/${lang}/tools/${slug}`}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
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

      {/* Main Footer: About + Quick Links + Company + Resources */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: About */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href={`/${lang}`} className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
              ToolKit Online
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-gray-400">
              {t.footerAboutText}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-gray-100 font-semibold text-sm mb-4">{t.footerQuickLinks}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${lang}`} className="text-gray-400 hover:text-white transition-colors">
                  {t.footerAllTools}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/blog`} className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <a href="/sitemap.xml" className="text-gray-400 hover:text-white transition-colors">
                  {t.footerSitemap}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="text-gray-100 font-semibold text-sm mb-4">{t.footerCompany}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${lang}/about`} className="text-gray-400 hover:text-white transition-colors">
                  {t.footerAbout}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/contact`} className="text-gray-400 hover:text-white transition-colors">
                  {t.footerContact}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/faq`} className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="text-gray-100 font-semibold text-sm mb-4">{t.footerResources}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${lang}/privacy`} className="text-gray-400 hover:text-white transition-colors">
                  {t.footerPrivacy}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/terms`} className="text-gray-400 hover:text-white transition-colors">
                  {t.footerTerms}
                </Link>
              </li>
              <li>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-settings'))}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer text-left"
                >
                  {cookieSettingsLabels[lang] || cookieSettingsLabels.en}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar: Copyright */}
      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; {t.footerCopyright}</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <Link href={`/${lang}/privacy`} className="hover:text-gray-300 transition-colors">
              {t.footerPrivacy}
            </Link>
            <Link href={`/${lang}/terms`} className="hover:text-gray-300 transition-colors">
              {t.footerTerms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
