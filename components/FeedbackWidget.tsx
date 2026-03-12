'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { Locale } from '@/lib/translations';

const labels: Record<string, { question: string; thankYou: string; yes: string; no: string }> = {
  en: { question: 'Did you find this tool useful?', thankYou: 'Thanks for your feedback!', yes: 'Yes', no: 'No' },
  it: { question: 'Hai trovato utile questo strumento?', thankYou: 'Grazie per il tuo feedback!', yes: 'Sì', no: 'No' },
  es: { question: 'Te resultó útil esta herramienta?', thankYou: 'Gracias por tu opinión!', yes: 'Sí', no: 'No' },
  fr: { question: 'Avez-vous trouvé cet outil utile?', thankYou: 'Merci pour votre avis!', yes: 'Oui', no: 'Non' },
  de: { question: 'War dieses Tool hilfreich?', thankYou: 'Danke für dein Feedback!', yes: 'Ja', no: 'Nein' },
  pt: { question: 'Você achou esta ferramenta útil?', thankYou: 'Obrigado pelo seu feedback!', yes: 'Sim', no: 'Não' },
};

export default function FeedbackWidget({ toolSlug }: { toolSlug: string }) {
  const params = useParams();
  const lang = (params?.lang as string) || 'en';
  const t = labels[lang] || labels.en;

  const storageKey = `feedback-${toolSlug}`;
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === 'up' || saved === 'down') setVote(saved);
    } catch {}
    setLoaded(true);
  }, [storageKey]);

  function handleVote(v: 'up' | 'down') {
    setVote(v);
    try {
      localStorage.setItem(storageKey, v);
    } catch {}
  }

  if (!loaded) return null;

  return (
    <div className="mt-10 pt-6 border-t border-gray-200">
      <div className="flex flex-col items-center gap-3 py-6 px-4 bg-gray-50 rounded-xl">
        {vote ? (
          <div className="flex items-center gap-2 text-gray-700">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{t.thankYou}</span>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-700">{t.question}</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleVote('up')}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg border border-gray-200 bg-white hover:border-green-400 hover:bg-green-50 text-gray-700 hover:text-green-700 transition-all duration-200 text-sm font-medium"
                aria-label={t.yes}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
                </svg>
                {t.yes}
              </button>
              <button
                onClick={() => handleVote('down')}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg border border-gray-200 bg-white hover:border-red-400 hover:bg-red-50 text-gray-700 hover:text-red-700 transition-all duration-200 text-sm font-medium"
                aria-label={t.no}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 2h3a2 2 0 012 2v7a2 2 0 01-2 2h-3" />
                </svg>
                {t.no}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
