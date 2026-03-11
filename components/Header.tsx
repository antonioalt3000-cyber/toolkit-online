'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { locales, localeNames, common, type Locale } from '@/lib/translations';

export default function Header() {
  const params = useParams();
  const lang = (params?.lang as Locale) || 'en';
  const t = common[lang];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href={`/${lang}`} className="text-xl font-bold text-blue-600 hover:text-blue-700">
          🛠 {t.siteTitle}
        </Link>
        <div className="flex items-center gap-2">
          {locales.map((l) => (
            <Link
              key={l}
              href={`/${l}`}
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
