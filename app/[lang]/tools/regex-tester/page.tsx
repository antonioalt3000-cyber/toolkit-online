'use client';
import { useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

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
  copyResult: { en: 'Copy Matches', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier Résultats', de: 'Treffer Kopieren', pt: 'Copiar Resultados' },
  copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  reset: { en: 'Reset', it: 'Reset', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  history: { en: 'History', it: 'Cronologia', es: 'Historial', fr: 'Historique', de: 'Verlauf', pt: 'Histórico' },
  commonPatterns: { en: 'Common Patterns', it: 'Pattern Comuni', es: 'Patrones Comunes', fr: 'Motifs Courants', de: 'Häufige Muster', pt: 'Padrões Comuns' },
  matchCountCard: { en: 'Matches', it: 'Corrispondenze', es: 'Coincidencias', fr: 'Correspondances', de: 'Treffer', pt: 'Correspondências' },
  groupCountCard: { en: 'Groups', it: 'Gruppi', es: 'Grupos', fr: 'Groupes', de: 'Gruppen', pt: 'Grupos' },
  syntaxError: { en: 'Syntax Error', it: 'Errore di Sintassi', es: 'Error de Sintaxis', fr: 'Erreur de Syntaxe', de: 'Syntaxfehler', pt: 'Erro de Sintaxe' },
  flagGlobal: { en: 'Global', it: 'Globale', es: 'Global', fr: 'Global', de: 'Global', pt: 'Global' },
  flagCaseInsensitive: { en: 'Case Insensitive', it: 'Ignora Maiuscole', es: 'Sin Mayúsculas', fr: 'Insensible Casse', de: 'Groß-/Klein', pt: 'Sem Maiúsculas' },
  flagMultiline: { en: 'Multiline', it: 'Multilinea', es: 'Multilínea', fr: 'Multiligne', de: 'Mehrzeilig', pt: 'Multilinha' },
  flagDotAll: { en: 'DotAll', it: 'DotAll', es: 'DotAll', fr: 'DotAll', de: 'DotAll', pt: 'DotAll' },
  noHistory: { en: 'No history yet', it: 'Nessuna cronologia', es: 'Sin historial', fr: 'Pas d\'historique', de: 'Kein Verlauf', pt: 'Sem histórico' },
};

interface HistoryItem {
  pattern: string;
  flags: string;
  testPreview: string;
}

const commonPatterns = [
  { label: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
  { label: 'URL', pattern: 'https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+[\\w\\-.,@?^=%&:/~+#]*' },
  { label: 'Phone', pattern: '\\+?\\d{1,4}[\\s.-]?\\(?\\d{1,4}\\)?[\\s.-]?\\d{1,9}' },
  { label: 'IP', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b' },
  { label: 'Date', pattern: '\\d{4}[-/]\\d{2}[-/]\\d{2}' },
];

export default function RegexTester() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['regex-tester'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const toggleFlag = (flag: string) => {
    setFlags(prev => prev.includes(flag) ? prev.replace(flag, '') : prev + flag);
  };

  const result = useMemo(() => {
    if (!pattern || !testString) return { matches: [], error: '', errorDetail: '', highlighted: testString };
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

      let highlighted = '';
      let lastIndex = 0;
      for (const m of matches) {
        highlighted += testString.slice(lastIndex, m.index);
        highlighted += `<mark class="bg-yellow-200 rounded px-0.5">${testString.slice(m.index, m.index + m.match.length)}</mark>`;
        lastIndex = m.index + m.match.length;
      }
      highlighted += testString.slice(lastIndex);

      return { matches, error: '', errorDetail: '', highlighted };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      return { matches: [], error: t('invalidRegex'), errorDetail: msg, highlighted: testString };
    }
  }, [pattern, flags, testString]);

  const totalGroups = useMemo(() => {
    return result.matches.reduce((acc, m) => acc + m.groups.length, 0);
  }, [result.matches]);

  const addToHistory = useCallback(() => {
    if (!pattern) return;
    setHistory(prev => {
      const newItem: HistoryItem = {
        pattern,
        flags,
        testPreview: testString.slice(0, 40) + (testString.length > 40 ? '...' : ''),
      };
      const filtered = prev.filter(h => h.pattern !== pattern || h.flags !== flags);
      return [newItem, ...filtered].slice(0, 5);
    });
  }, [pattern, flags, testString]);

  const handlePatternBlur = () => {
    if (pattern) addToHistory();
  };

  const copyMatches = async () => {
    const text = result.matches.map(m => m.match).join('\n');
    await navigator.clipboard.writeText(text);
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 1500);
  };

  const handleReset = () => {
    setPattern('');
    setFlags('g');
    setTestString('');
  };

  const loadFromHistory = (item: HistoryItem) => {
    setPattern(item.pattern);
    setFlags(item.flags);
  };

  const insertCommonPattern = (p: string) => {
    setPattern(p);
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Regex Tester: Test and Debug Regular Expressions Online',
      paragraphs: [
        'Regular expressions (regex) are one of the most powerful tools in a developer\'s toolkit for pattern matching and text manipulation. Our free online regex tester lets you write, test, and debug regular expressions in real time, with instant visual highlighting of matches and detailed information about captured groups.',
        'The tool shows matches highlighted directly in your test string, making it easy to see exactly which parts of the text are matched by your pattern. Each match is listed with its index position and any captured groups, which is invaluable for understanding and refining complex patterns with parenthetical groups.',
        'You can control the regex behavior using flags: "g" for global matching (find all matches), "i" for case-insensitive matching, "m" for multiline mode where ^ and $ match line boundaries, "s" for dotAll mode where . matches newlines, and "u" for Unicode support. Combining flags lets you fine-tune exactly how your regex operates.',
        'Common regex use cases include validating email addresses, phone numbers, and URLs, extracting data from structured text, search-and-replace operations in code editors, parsing log files, and data cleaning. Master regex and you gain a skill that transfers across virtually every programming language and text editor.',
      ],
      faq: [
        { q: 'What are the most common regex flags?', a: '"g" (global) finds all matches instead of stopping at the first one. "i" makes the pattern case-insensitive. "m" (multiline) makes ^ and $ match start/end of each line. "s" (dotAll) makes . match newline characters. "u" enables full Unicode matching.' },
        { q: 'How do I match an email address with regex?', a: 'A common pattern is /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/ which matches most email formats. However, the official RFC 5322 email specification is extremely complex, so for production use, consider using a dedicated email validation library.' },
        { q: 'What is a capturing group in regex?', a: 'Capturing groups are created with parentheses () and capture the matched text for later reference. For example, /(\\d{4})-(\\d{2})-(\\d{2})/ matches a date and captures year, month, and day in separate groups. Non-capturing groups (?:...) group without capturing.' },
        { q: 'How do I escape special characters in regex?', a: 'Special regex characters (.^$*+?{}[]\\|()) must be escaped with a backslash to match literally. For example, \\. matches a literal period, \\( matches a literal parenthesis, and \\\\ matches a literal backslash.' },
        { q: 'What is the difference between greedy and lazy matching?', a: 'Greedy quantifiers (*, +, ?) match as much as possible, while lazy quantifiers (*?, +?, ??) match as little as possible. For example, on "<b>bold</b>", /<.*>/ (greedy) matches the entire string, while /<.*?>/ (lazy) matches only "<b>".' },
      ],
    },
    it: {
      title: 'Tester Regex: Testa e Debug le Espressioni Regolari Online',
      paragraphs: [
        'Le espressioni regolari (regex) sono uno degli strumenti più potenti per il pattern matching e la manipolazione del testo. Il nostro tester regex online gratuito ti permette di scrivere, testare e debuggare espressioni regolari in tempo reale, con evidenziazione visiva istantanea delle corrispondenze.',
        'Lo strumento mostra le corrispondenze evidenziate direttamente nella stringa di test, rendendo facile vedere esattamente quali parti del testo vengono abbinate dal tuo pattern. Ogni corrispondenza è elencata con la posizione dell\'indice e i gruppi catturati.',
        'Puoi controllare il comportamento regex usando i flag: "g" per la corrispondenza globale, "i" per la corrispondenza senza distinzione tra maiuscole e minuscole, "m" per la modalità multilinea, "s" per dotAll e "u" per il supporto Unicode.',
        'I casi d\'uso comuni includono la validazione di email, numeri di telefono e URL, l\'estrazione di dati da testo strutturato, operazioni di ricerca e sostituzione e l\'analisi di file di log.',
      ],
      faq: [
        { q: 'Quali sono i flag regex più comuni?', a: '"g" (globale) trova tutte le corrispondenze. "i" rende il pattern insensibile alle maiuscole. "m" (multilinea) fa corrispondere ^ e $ all\'inizio/fine di ogni riga. "s" (dotAll) fa corrispondere . ai caratteri di nuova riga.' },
        { q: 'Come abbino un indirizzo email con regex?', a: 'Un pattern comune è /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/ che abbina la maggior parte dei formati email.' },
        { q: 'Cos\'è un gruppo di cattura in regex?', a: 'I gruppi di cattura sono creati con le parentesi () e catturano il testo abbinato per riferimento successivo. I gruppi non catturanti (?:...) raggruppano senza catturare.' },
        { q: 'Come si escapano i caratteri speciali in regex?', a: 'I caratteri speciali regex (.^$*+?{}[]\\|()) devono essere escapati con un backslash per la corrispondenza letterale.' },
        { q: 'Qual è la differenza tra matching greedy e lazy?', a: 'I quantificatori greedy (*, +, ?) abbinano il più possibile, mentre i lazy (*?, +?, ??) abbinano il meno possibile.' },
      ],
    },
    es: {
      title: 'Probador de Regex: Prueba y Depura Expresiones Regulares Online',
      paragraphs: [
        'Las expresiones regulares (regex) son una de las herramientas más poderosas para la coincidencia de patrones y manipulación de texto. Nuestro probador regex online gratuito te permite escribir, probar y depurar expresiones regulares en tiempo real.',
        'La herramienta muestra coincidencias resaltadas directamente en tu cadena de prueba. Cada coincidencia se lista con su posición y grupos capturados.',
        'Puedes controlar el comportamiento con flags: "g" para coincidencia global, "i" para insensibilidad a mayúsculas, "m" para modo multilínea, "s" para dotAll y "u" para soporte Unicode.',
        'Casos comunes incluyen validar emails, números de teléfono y URLs, extraer datos de texto estructurado y operaciones de búsqueda y reemplazo.',
      ],
      faq: [
        { q: '¿Cuáles son los flags regex más comunes?', a: '"g" encuentra todas las coincidencias. "i" hace el patrón insensible a mayúsculas. "m" hace que ^ y $ coincidan con inicio/fin de cada línea. "s" hace que . coincida con saltos de línea.' },
        { q: '¿Cómo valido un email con regex?', a: 'Un patrón común es /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/' },
        { q: '¿Qué es un grupo de captura en regex?', a: 'Los grupos de captura se crean con paréntesis () y capturan el texto coincidente. Los grupos no capturantes (?:...) agrupan sin capturar.' },
        { q: '¿Cómo escapo caracteres especiales en regex?', a: 'Los caracteres especiales deben escaparse con una barra invertida para coincidencia literal.' },
        { q: '¿Cuál es la diferencia entre matching greedy y lazy?', a: 'Los cuantificadores greedy coinciden lo máximo posible, mientras los lazy coinciden lo mínimo posible.' },
      ],
    },
    fr: {
      title: 'Testeur Regex : Testez et Déboguez les Expressions Régulières en Ligne',
      paragraphs: [
        'Les expressions régulières (regex) sont l\'un des outils les plus puissants pour la correspondance de motifs et la manipulation de texte. Notre testeur regex en ligne gratuit vous permet d\'écrire, tester et déboguer des expressions régulières en temps réel.',
        'L\'outil affiche les correspondances surlignées directement dans votre chaîne de test. Chaque correspondance est listée avec sa position et ses groupes capturés.',
        'Vous pouvez contrôler le comportement avec des drapeaux : "g" pour la correspondance globale, "i" pour l\'insensibilité à la casse, "m" pour le mode multiligne, "s" pour dotAll et "u" pour le support Unicode.',
        'Les cas d\'usage courants incluent la validation d\'emails, numéros de téléphone et URLs, l\'extraction de données et les opérations de recherche/remplacement.',
      ],
      faq: [
        { q: 'Quels sont les drapeaux regex les plus courants ?', a: '"g" trouve toutes les correspondances. "i" rend le motif insensible à la casse. "m" fait correspondre ^ et $ au début/fin de chaque ligne. "s" fait correspondre . aux retours à la ligne.' },
        { q: 'Comment valider un email avec regex ?', a: 'Un motif courant est /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/' },
        { q: 'Qu\'est-ce qu\'un groupe de capture en regex ?', a: 'Les groupes de capture créés avec des parenthèses () capturent le texte correspondant. Les groupes non capturants (?:...) regroupent sans capturer.' },
        { q: 'Comment échapper les caractères spéciaux en regex ?', a: 'Les caractères spéciaux doivent être échappés avec un antislash pour une correspondance littérale.' },
        { q: 'Quelle est la différence entre matching greedy et lazy ?', a: 'Les quantificateurs greedy correspondent au maximum possible, tandis que les lazy correspondent au minimum possible.' },
      ],
    },
    de: {
      title: 'Regex-Tester: Reguläre Ausdrücke Online Testen und Debuggen',
      paragraphs: [
        'Reguläre Ausdrücke (Regex) sind eines der mächtigsten Werkzeuge für Musterabgleich und Textmanipulation. Unser kostenloser Online-Regex-Tester ermöglicht es Ihnen, reguläre Ausdrücke in Echtzeit zu schreiben, testen und debuggen.',
        'Das Tool zeigt Treffer direkt im Teststring hervorgehoben an. Jeder Treffer wird mit seiner Indexposition und erfassten Gruppen aufgelistet.',
        'Sie können das Verhalten mit Flags steuern: "g" für globalen Abgleich, "i" für Groß-/Kleinschreibung, "m" für Mehrzeilenmodus, "s" für dotAll und "u" für Unicode-Unterstützung.',
        'Häufige Anwendungsfälle sind die Validierung von E-Mails, Telefonnummern und URLs, Datenextraktion und Such-und-Ersetz-Operationen.',
      ],
      faq: [
        { q: 'Was sind die häufigsten Regex-Flags?', a: '"g" findet alle Treffer. "i" macht den Ausdruck groß-/kleinschreibungsunabhängig. "m" lässt ^ und $ den Anfang/Ende jeder Zeile abgleichen. "s" lässt . Zeilenumbrüche abgleichen.' },
        { q: 'Wie validiere ich eine E-Mail-Adresse mit Regex?', a: 'Ein gängiges Muster ist /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/' },
        { q: 'Was ist eine Erfassungsgruppe in Regex?', a: 'Erfassungsgruppen werden mit Klammern () erstellt und erfassen den abgeglichenen Text. Nicht-erfassende Gruppen (?:...) gruppieren ohne zu erfassen.' },
        { q: 'Wie escape ich Sonderzeichen in Regex?', a: 'Sonderzeichen müssen mit einem Backslash escaped werden, um wörtlich abgeglichen zu werden.' },
        { q: 'Was ist der Unterschied zwischen gierigem und faulem Abgleich?', a: 'Gierige Quantifizierer gleichen so viel wie möglich ab, während faule so wenig wie möglich abgleichen.' },
      ],
    },
    pt: {
      title: 'Testador de Regex: Teste e Depure Expressões Regulares Online',
      paragraphs: [
        'Expressões regulares (regex) são uma das ferramentas mais poderosas para correspondência de padrões e manipulação de texto. Nosso testador regex online gratuito permite escrever, testar e depurar expressões regulares em tempo real.',
        'A ferramenta mostra correspondências destacadas diretamente na sua string de teste. Cada correspondência é listada com sua posição e grupos capturados.',
        'Você pode controlar o comportamento com flags: "g" para correspondência global, "i" para insensibilidade a maiúsculas, "m" para modo multilinha, "s" para dotAll e "u" para suporte Unicode.',
        'Casos de uso comuns incluem validação de emails, números de telefone e URLs, extração de dados e operações de busca e substituição.',
      ],
      faq: [
        { q: 'Quais são as flags regex mais comuns?', a: '"g" encontra todas as correspondências. "i" torna o padrão insensível a maiúsculas. "m" faz ^ e $ corresponderem ao início/fim de cada linha. "s" faz . corresponder a quebras de linha.' },
        { q: 'Como valido um email com regex?', a: 'Um padrão comum é /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/' },
        { q: 'O que é um grupo de captura em regex?', a: 'Grupos de captura são criados com parênteses () e capturam o texto correspondente. Grupos não capturantes (?:...) agrupam sem capturar.' },
        { q: 'Como escapo caracteres especiais em regex?', a: 'Caracteres especiais devem ser escapados com uma barra invertida para correspondência literal.' },
        { q: 'Qual é a diferença entre matching greedy e lazy?', a: 'Quantificadores greedy correspondem ao máximo possível, enquanto lazy correspondem ao mínimo possível.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const flagToggles: { flag: string; labelKey: string }[] = [
    { flag: 'g', labelKey: 'flagGlobal' },
    { flag: 'i', labelKey: 'flagCaseInsensitive' },
    { flag: 'm', labelKey: 'flagMultiline' },
    { flag: 's', labelKey: 'flagDotAll' },
  ];

  return (
    <ToolPageWrapper toolSlug="regex-tester" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Pattern input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('pattern')}</label>
            <div className={`flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 ${result.error ? 'border-red-400' : 'border-gray-300'}`}>
              <span className="px-2 text-gray-400 font-mono">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                onBlur={handlePatternBlur}
                className="flex-1 px-1 py-2 font-mono focus:outline-none"
                placeholder="[a-z]+"
              />
              <span className="px-2 text-gray-400 font-mono">/</span>
            </div>
          </div>

          {/* Validation error */}
          {result.error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-red-700 text-sm font-medium">{t('syntaxError')}: {result.error}</p>
                {result.errorDetail && <p className="text-red-500 text-xs mt-0.5 font-mono">{result.errorDetail}</p>}
              </div>
            </div>
          )}

          {/* Flag toggles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('flags')}</label>
            <div className="flex flex-wrap gap-2">
              {flagToggles.map(({ flag, labelKey }) => (
                <button
                  key={flag}
                  onClick={() => toggleFlag(flag)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    flags.includes(flag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="font-mono mr-1">{flag}</span>
                  <span className="text-xs">{t(labelKey)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Common patterns */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('commonPatterns')}</label>
            <div className="flex flex-wrap gap-2">
              {commonPatterns.map((cp) => (
                <button
                  key={cp.label}
                  onClick={() => insertCommonPattern(cp.pattern)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {cp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Test string */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('testString')}</label>
            <textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {result.matches.length > 0 && (
              <button
                onClick={copyMatches}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                {copiedFeedback ? t('copied') : t('copyResult')}
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              {t('reset')}
            </button>
          </div>

          {/* Result cards */}
          {testString && pattern && !result.error && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-700">{result.matches.length}</div>
                  <div className="text-sm text-blue-600">{t('matchCountCard')}</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-700">{totalGroups}</div>
                  <div className="text-sm text-green-600">{t('groupCountCard')}</div>
                </div>
              </div>

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

        {/* History section */}
        {history.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">{t('history')}</h3>
            <div className="space-y-2">
              {history.map((item, i) => (
                <button
                  key={i}
                  onClick={() => loadFromHistory(item)}
                  className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="font-mono text-sm text-blue-700 truncate">/{item.pattern}/{item.flags}</div>
                  {item.testPreview && (
                    <div className="text-xs text-gray-500 mt-0.5 truncate">{item.testPreview}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-4">{p}</p>)}
        </article>

        <section className="mt-10 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">FAQ</h2>
          <div className="space-y-2">
            {seo.faq.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-lg">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left px-4 py-3 font-medium text-gray-900 flex justify-between items-center">
                  {item.q}
                  <span className="text-gray-400">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <div className="px-4 pb-3 text-gray-600">{item.a}</div>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </ToolPageWrapper>
  );
}
