'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

export default function WordCounter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['word-counter'][lang];
  const [text, setText] = useState('');

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const sentences = text.trim() ? text.split(/[.!?]+/).filter((s) => s.trim()).length : 0;
  const paragraphs = text.trim() ? text.split(/\n\n+/).filter((s) => s.trim()).length : 0;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  const labels: Record<string, Record<Locale, string>> = {
    words: { en: 'Words', it: 'Parole', es: 'Palabras', fr: 'Mots', de: 'Wörter', pt: 'Palavras' },
    chars: { en: 'Characters', it: 'Caratteri', es: 'Caracteres', fr: 'Caractères', de: 'Zeichen', pt: 'Caracteres' },
    charsNs: { en: 'No spaces', it: 'Senza spazi', es: 'Sin espacios', fr: 'Sans espaces', de: 'Ohne Leerzeichen', pt: 'Sem espaços' },
    sentences: { en: 'Sentences', it: 'Frasi', es: 'Oraciones', fr: 'Phrases', de: 'Sätze', pt: 'Frases' },
    paragraphs: { en: 'Paragraphs', it: 'Paragrafi', es: 'Párrafos', fr: 'Paragraphes', de: 'Absätze', pt: 'Parágrafos' },
    reading: { en: 'min read', it: 'min lettura', es: 'min lectura', fr: 'min lecture', de: 'Min. Lesezeit', pt: 'min leitura' },
    placeholder: { en: 'Type or paste your text here...', it: 'Scrivi o incolla il tuo testo qui...', es: 'Escribe o pega tu texto aquí...', fr: 'Tapez ou collez votre texte ici...', de: 'Geben Sie Ihren Text hier ein...', pt: 'Digite ou cole seu texto aqui...' },
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
        {[
          { label: labels.words[lang], value: words },
          { label: labels.chars[lang], value: chars },
          { label: labels.charsNs[lang], value: charsNoSpaces },
          { label: labels.sentences[lang], value: sentences },
          { label: labels.paragraphs[lang], value: paragraphs },
          { label: labels.reading[lang], value: readingTime },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={labels.placeholder[lang]}
        className="w-full h-64 border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
      />
    </div>
  );
}
