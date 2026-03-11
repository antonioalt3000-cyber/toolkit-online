'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { common, tools, type Locale } from '@/lib/translations';

const popularToolSlugs = [
  'vat-calculator',
  'percentage-calculator',
  'word-counter',
  'password-generator',
  'json-formatter',
  'bmi-calculator',
];

export default function Footer() {
  const params = useParams();
  const lang = (params?.lang as Locale) || 'en';
  const t = common[lang];

  const popularTools = popularToolSlugs.map((slug) => ({
    slug,
    name: tools[slug]?.[lang]?.name ?? slug,
  }));

  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Logo + description */}
          <div>
            <Link href={`/${lang}`} className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
              ToolKit Online
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              {t.footerDescription}
            </p>
          </div>

          {/* Column 2: Popular Tools */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t.footerPopularTools}</h3>
            <ul className="space-y-2 text-sm">
              {popularTools.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/${lang}/tools/${tool.slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
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

          {/* Column 4: Resources */}
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
          </div>
        </div>
      </div>
    </footer>
  );
}
