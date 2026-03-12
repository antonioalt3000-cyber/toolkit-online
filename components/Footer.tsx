'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { common, tools, getToolsByCategory, type Locale } from '@/lib/translations';

const cookieSettingsLabels: Record<string, string> = {
  en: 'Cookie Settings',
  it: 'Impostazioni Cookie',
  es: 'Configuración de Cookies',
  fr: 'Paramètres des Cookies',
  de: 'Cookie-Einstellungen',
  pt: 'Configurações de Cookies',
};

const allToolsLabels: Record<string, string> = {
  en: 'All Tools by Category',
  it: 'Tutti gli strumenti per categoria',
  es: 'Todas las herramientas por categoría',
  fr: 'Tous les outils par catégorie',
  de: 'Alle Tools nach Kategorie',
  pt: 'Todas as ferramentas por categoria',
};

export default function Footer() {
  const params = useParams();
  const lang = (params?.lang as Locale) || 'en';
  const t = common[lang];
  const categories = getToolsByCategory();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      {/* Tool Navigation - All Categories */}
      <div className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-white font-bold text-lg mb-6">
            {allToolsLabels[lang] || allToolsLabels.en}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Object.entries(categories).map(([catKey, slugs]) => (
              <div key={catKey}>
                <h3 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">
                  {t.categories[catKey] || catKey}
                </h3>
                <ul className="space-y-1.5 text-sm">
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
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Column 1: Logo + description */}
          <div>
            <Link href={`/${lang}`} className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
              ToolKit Online
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              {t.footerDescription}
            </p>
          </div>

          {/* Column 2: Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t.footerCompany}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${lang}/about`} className="hover:text-white transition-colors">
                  {t.footerAbout}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/contact`} className="hover:text-white transition-colors">
                  {t.footerContact}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/privacy`} className="hover:text-white transition-colors">
                  {t.footerPrivacy}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/terms`} className="hover:text-white transition-colors">
                  {t.footerTerms}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t.footerResources}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${lang}`} className="hover:text-white transition-colors">
                  {t.footerAllTools}
                </Link>
              </li>
              <li>
                <a href="/sitemap.xml" className="hover:text-white transition-colors">
                  {t.footerSitemap}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} ToolKit Online. All rights reserved.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <Link href={`/${lang}/privacy`} className="hover:text-gray-300 transition-colors">
              {t.footerPrivacy}
            </Link>
            <Link href={`/${lang}/terms`} className="hover:text-gray-300 transition-colors">
              {t.footerTerms}
            </Link>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-settings'))}
              className="hover:text-gray-300 transition-colors cursor-pointer"
            >
              {cookieSettingsLabels[lang] || cookieSettingsLabels.en}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
