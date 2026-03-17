'use client';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { locales, localeNames, common, type Locale } from '@/lib/translations';

export default function Header() {
  const params = useParams();
  const pathname = usePathname();
  const lang = (params?.lang as Locale) || 'en';
  const t = common[lang];

  // Replace the lang segment in the current path to preserve navigation context
  const switchLangPath = (targetLang: string) => {
    // pathname is like /en/tools/bmi-calculator or /en
    // Replace the first segment (the lang) with the target lang
    const segments = pathname.split('/');
    segments[1] = targetLang;
    return segments.join('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href={`/${lang}`} className="text-xl font-bold text-blue-600 hover:text-blue-700">
          🛠 {t.siteTitle}
        </Link>
        <nav className="hidden sm:flex items-center gap-4 ml-6">
          <Link href={`/${lang}/tools`} className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium">
            {t.footerAllTools}
          </Link>
          <Link href={`/${lang}/blog`} className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium">
            Blog
          </Link>
          <Link href={`/${lang}/faq`} className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium">
            FAQ
          </Link>
          <Link href={`/${lang}/about`} className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium">
            {t.footerAbout}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {locales.map((l) => (
            <Link
              key={l}
              href={switchLangPath(l)}
              className={`text-xs px-2 py-1 rounded ${
                l === lang ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {localeNames[l]}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
