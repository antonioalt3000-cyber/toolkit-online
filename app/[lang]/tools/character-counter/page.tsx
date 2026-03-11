'use client';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<string, string>> = {
  inputText: { en: 'Enter your text', it: 'Inserisci il testo', es: 'Ingresa tu texto', fr: 'Entrez votre texte', de: 'Text eingeben', pt: 'Digite seu texto' },
  totalChars: { en: 'Total Characters', it: 'Caratteri Totali', es: 'Caracteres Totales', fr: 'Caractères Totaux', de: 'Zeichen Gesamt', pt: 'Caracteres Totais' },
  vowels: { en: 'Vowels', it: 'Vocali', es: 'Vocales', fr: 'Voyelles', de: 'Vokale', pt: 'Vogais' },
  consonants: { en: 'Consonants', it: 'Consonanti', es: 'Consonantes', fr: 'Consonnes', de: 'Konsonanten', pt: 'Consoantes' },
  digits: { en: 'Digits', it: 'Cifre', es: 'Dígitos', fr: 'Chiffres', de: 'Ziffern', pt: 'Dígitos' },
  spaces: { en: 'Spaces', it: 'Spazi', es: 'Espacios', fr: 'Espaces', de: 'Leerzeichen', pt: 'Espaços' },
  specialChars: { en: 'Special Characters', it: 'Caratteri Speciali', es: 'Caracteres Especiales', fr: 'Caractères Spéciaux', de: 'Sonderzeichen', pt: 'Caracteres Especiais' },
  words: { en: 'Words', it: 'Parole', es: 'Palabras', fr: 'Mots', de: 'Wörter', pt: 'Palavras' },
  sentences: { en: 'Sentences', it: 'Frasi', es: 'Oraciones', fr: 'Phrases', de: 'Sätze', pt: 'Frases' },
  mostFrequent: { en: 'Most Frequent Letter', it: 'Lettera Più Frequente', es: 'Letra Más Frecuente', fr: 'Lettre la Plus Fréquente', de: 'Häufigster Buchstabe', pt: 'Letra Mais Frequente' },
  charWithout: { en: 'Characters (no spaces)', it: 'Caratteri (senza spazi)', es: 'Caracteres (sin espacios)', fr: 'Caractères (sans espaces)', de: 'Zeichen (ohne Leerzeichen)', pt: 'Caracteres (sem espaços)' },
};

export default function CharacterCounter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['character-counter'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [text, setText] = useState('');

  const analysis = useMemo(() => {
    const vowels = (text.match(/[aeiouAEIOU]/g) || []).length;
    const consonants = (text.match(/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/g) || []).length;
    const digits = (text.match(/\d/g) || []).length;
    const spaces = (text.match(/ /g) || []).length;
    const specialChars = text.length - vowels - consonants - digits - spaces;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.trim() ? (text.match(/[.!?]+/g) || []).length || (text.trim().length > 0 ? 1 : 0) : 0;

    const freq: Record<string, number> = {};
    for (const ch of text.toLowerCase()) {
      if (/[a-z]/.test(ch)) {
        freq[ch] = (freq[ch] || 0) + 1;
      }
    }
    let mostFrequent = '—';
    let maxCount = 0;
    for (const [letter, count] of Object.entries(freq)) {
      if (count > maxCount) { maxCount = count; mostFrequent = `${letter.toUpperCase()} (${count})`; }
    }

    return { total: text.length, noSpaces: text.length - spaces, vowels, consonants, digits, spaces, specialChars, words, sentences, mostFrequent };
  }, [text]);

  const stats = [
    { key: 'totalChars', value: analysis.total },
    { key: 'charWithout', value: analysis.noSpaces },
    { key: 'words', value: analysis.words },
    { key: 'sentences', value: analysis.sentences },
    { key: 'vowels', value: analysis.vowels },
    { key: 'consonants', value: analysis.consonants },
    { key: 'digits', value: analysis.digits },
    { key: 'spaces', value: analysis.spaces },
    { key: 'specialChars', value: analysis.specialChars },
    { key: 'mostFrequent', value: analysis.mostFrequent },
  ];

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('inputText')}</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5}
            placeholder="Type or paste your text here..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ key, value }) => (
            <div key={key} className="p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-gray-500">{t(key)}</div>
              <div className="text-lg font-bold text-gray-900">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
