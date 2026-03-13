'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function HtmlLang() {
  const { lang } = useParams() as { lang: string };

  useEffect(() => {
    if (lang) {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  return null;
}
