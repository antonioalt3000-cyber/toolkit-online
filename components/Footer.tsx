'use client';
import { useParams } from 'next/navigation';
import { common, type Locale } from '@/lib/translations';

export default function Footer() {
  const params = useParams();
  const lang = (params?.lang as Locale) || 'en';
  const t = common[lang];

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
        <p>{t.footer}</p>
        <p className="mt-1">© {new Date().getFullYear()} ToolKit Online</p>
      </div>
    </footer>
  );
}
