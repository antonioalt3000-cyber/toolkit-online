'use client';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<Locale, string>> = {
  pattern: { en: 'Regex Pattern', it: 'Pattern Regex', es: 'Patrón Regex', fr: 'Motif Regex', de: 'Regex-Muster', pt: 'Padrão Regex' },
  flags: { en: 'Flags', it: 'Flag', es: 'Flags', fr: 'Drapeaux', de: 'Flags', pt: 'Flags' },
  testString: { en: 'Test String', it: 'Stringa di Test', es: 'Cadena de Prueba', fr: 'Chaîne de Test', de: 'Testzeichenkette', pt: 'String de Teste' },
  matches: { en: 'Matches', it: 'Corrispondenze', es: 'Coincidencias', fr: 'Correspondances', de: 'Treffer', pt: 'Correspondências' },
  groups: { en: 'Groups', it: 'Gruppi', es: 'Grupos', fr: 'Groupes', de: 'Gruppen', pt: 'Grupos' },
  noMatches: { en: 'No matches found', it: 'Nessuna corrispondenza', es: 'Sin coincidencias', fr: 'Aucune correspondance', de: 'Keine Treffer', pt: 'Sem correspondências' },
  invalidRegex: { en: 'Invalid regex', it: 'Regex non valida', es: 'Regex inválida', fr: 'Regex invalide', de: 'Ungültiger Regex', pt: 'Regex inválido' },
  matchCount: { en: 'match(es)', it: 'corrispondenza/e', es: 'coincidencia(s)', fr: 'correspondance(s)', de: 'Treffer', pt: 'correspondência(s)' },
  fullMatch: { en: 'Full Match', it: 'Match Completo', es: 'Coincidencia Completa', fr: 'Correspondance Complète', de: 'Vollständiger Treffer', pt: 'Correspondência Completa' },
};

export default function RegexTester() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['regex-tester'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');

  const result = useMemo(() => {
    if (!pattern || !testString) return { matches: [], error: '', highlighted: testString };
    try {
      const regex = new RegExp(pattern, flags);
      const matches: { match: string; index: number; groups: string[] }[] = [];

      if (flags.includes('g')) {
        let m;
        while ((m = regex.exec(testString)) !== null) {
          matches.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1),
          });
          if (m[0].length === 0) regex.lastIndex++;
        }
      } else {
        const m = regex.exec(testString);
        if (m) {
          matches.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1),
          });
        }
      }

      // Build highlighted string
      let highlighted = '';
      let lastIndex = 0;
      for (const m of matches) {
        highlighted += testString.slice(lastIndex, m.index);
        highlighted += `<mark class="bg-yellow-200 rounded px-0.5">${testString.slice(m.index, m.index + m.match.length)}</mark>`;
        lastIndex = m.index + m.match.length;
      }
      highlighted += testString.slice(lastIndex);

      return { matches, error: '', highlighted };
    } catch {
      return { matches: [], error: t('invalidRegex'), highlighted: testString };
    }
  }, [pattern, flags, testString, t]);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('pattern')}</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <span className="px-2 text-gray-400 font-mono">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="flex-1 px-1 py-2 font-mono focus:outline-none"
                placeholder="[a-z]+"
              />
              <span className="px-2 text-gray-400 font-mono">/</span>
            </div>
          </div>
          <div className="w-24">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('flags')}</label>
            <input
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="gi"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('testString')}</label>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {result.error && <p className="text-red-500 text-sm">{result.error}</p>}

        {testString && pattern && !result.error && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('matches')} ({result.matches.length} {t('matchCount')})
              </label>
              <div
                className="p-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm whitespace-pre-wrap break-all"
                dangerouslySetInnerHTML={{ __html: result.highlighted }}
              />
            </div>

            {result.matches.length > 0 && (
              <div className="space-y-2">
                {result.matches.map((m, i) => (
                  <div key={i} className="p-3 bg-blue-50 rounded-lg text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('fullMatch')} #{i + 1}</span>
                      <span className="font-mono font-semibold">&quot;{m.match}&quot;</span>
                    </div>
                    <div className="text-xs text-gray-500">Index: {m.index}</div>
                    {m.groups.length > 0 && (
                      <div className="mt-1 text-xs">
                        <span className="text-gray-600">{t('groups')}: </span>
                        {m.groups.map((g, gi) => (
                          <span key={gi} className="font-mono bg-white px-1 rounded mr-1">
                            ${gi + 1}: &quot;{g}&quot;
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {result.matches.length === 0 && (
              <p className="text-gray-500 text-sm text-center">{t('noMatches')}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
