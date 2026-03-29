'use client';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface HistoryEntry {
  preview: string;
  total: number;
  words: number;
  timestamp: number;
}

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
  copyResults: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier les Résultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
  copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  reset: { en: 'Reset', it: 'Resetta', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  emptyText: { en: 'Please enter some text first', it: 'Inserisci prima del testo', es: 'Por favor ingresa texto primero', fr: 'Veuillez entrer du texte d\'abord', de: 'Bitte geben Sie zuerst einen Text ein', pt: 'Por favor, digite algum texto primeiro' },
  history: { en: 'Recent Analyses', it: 'Analisi Recenti', es: 'Análisis Recientes', fr: 'Analyses Récentes', de: 'Letzte Analysen', pt: 'Análises Recentes' },
  charLimit: { en: 'Character Limit', it: 'Limite Caratteri', es: 'Límite de Caracteres', fr: 'Limite de Caractères', de: 'Zeichenlimit', pt: 'Limite de Caracteres' },
  presets: { en: 'Quick Presets', it: 'Preset Rapidi', es: 'Preajustes Rápidos', fr: 'Préréglages Rapides', de: 'Schnellvorlagen', pt: 'Predefinições Rápidas' },
  charsOf: { en: 'chars of', it: 'caratteri di', es: 'caracteres de', fr: 'caractères sur', de: 'Zeichen von', pt: 'caracteres de' },
  noHistory: { en: 'No analyses yet', it: 'Nessuna analisi ancora', es: 'Sin análisis aún', fr: 'Aucune analyse encore', de: 'Noch keine Analysen', pt: 'Nenhuma análise ainda' },
  chars: { en: 'chars', it: 'car.', es: 'car.', fr: 'car.', de: 'Zch.', pt: 'car.' },
  wordsShort: { en: 'words', it: 'parole', es: 'palabras', fr: 'mots', de: 'Wörter', pt: 'palavras' },
};

const CHAR_PRESETS = [
  { name: 'Twitter', limit: 280 },
  { name: 'SMS', limit: 160 },
  { name: 'Meta Description', limit: 160 },
  { name: 'Title Tag', limit: 60 },
];

export default function CharacterCounter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['character-counter'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [emptyError, setEmptyError] = useState(false);
  const [charLimit, setCharLimit] = useState(280);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const copiedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (copiedTimeout.current) clearTimeout(copiedTimeout.current);
      if (errorTimeout.current) clearTimeout(errorTimeout.current);
    };
  }, []);

  const handleCopyResults = useCallback(() => {
    if (!text.trim()) {
      setEmptyError(true);
      if (errorTimeout.current) clearTimeout(errorTimeout.current);
      errorTimeout.current = setTimeout(() => setEmptyError(false), 2000);
      return;
    }
    const resultText = stats.map(({ key, value }) => `${t(key)}: ${value}`).join('\n');
    navigator.clipboard.writeText(resultText).then(() => {
      setCopied(true);
      if (copiedTimeout.current) clearTimeout(copiedTimeout.current);
      copiedTimeout.current = setTimeout(() => setCopied(false), 2000);

      // Save to history
      setHistory(prev => {
        const entry: HistoryEntry = {
          preview: text.slice(0, 30) + (text.length > 30 ? '...' : ''),
          total: analysis.total,
          words: analysis.words,
          timestamp: Date.now(),
        };
        const updated = [entry, ...prev];
        return updated.slice(0, 5);
      });
    });
  }, [text, stats, analysis]);

  const handleReset = useCallback(() => {
    setText('');
    setCopied(false);
    setEmptyError(false);
  }, []);

  // Progress bar calculations
  const progressPercent = Math.min((analysis.total / charLimit) * 100, 100);
  const overLimit = analysis.total > charLimit;
  const progressColor = overLimit
    ? 'bg-red-500'
    : progressPercent > 80
      ? 'bg-yellow-500'
      : 'bg-green-500';

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Character Counter Online — Count Characters, Letters & Spaces Instantly',
      paragraphs: [
        'Need to count characters in your text quickly and accurately? Our free online character counter provides a complete character count in real time as you type or paste your content. Whether you are checking a tweet against the 280-character limit, writing a meta description under 160 characters, or ensuring your essay meets a minimum character requirement, this character counter tool gives you the exact numbers you need — instantly and for free.',
        'Unlike a basic character count tool, our character counter goes much deeper. It breaks your text down into total characters, characters without spaces, words, sentences, vowels, consonants, digits, special characters, and the most frequently used letter. This detailed text analysis is essential for writers, bloggers, students, SEO professionals, social media managers, and anyone who works with text on a daily basis. You can also use the built-in character limit presets for Twitter (280), SMS (160), meta descriptions (160), and title tags (60) to see at a glance whether your text fits within platform requirements.',
        'For SEO professionals, accurate character counting is critical when optimizing title tags, meta descriptions, URLs, and alt text. Google typically displays 50 to 60 characters for page titles and around 155 to 160 characters for meta descriptions. Writing within these limits ensures your content appears correctly in search results without being truncated. Social media managers also rely on character counters daily: Twitter/X allows 280 characters per post, Instagram bios are limited to 150 characters, LinkedIn headlines to 120 characters, and Pinterest pin descriptions to 500 characters.',
        'The letter frequency analysis feature is another powerful capability of this character counter. By showing which letters appear most often in your text, it helps linguists study language patterns, students complete phonetics assignments, and writers diversify their vocabulary. In standard English text, the letter "E" is the most frequent, followed by "T", "A", "O", and "I". If your text deviates significantly from these patterns, it may indicate unusual word choices or repetitive phrasing.',
        'Our character counter is completely free, requires no registration, and runs entirely in your browser — your text is never sent to any server. The analysis updates in real time as you type, so there is no need to click a button or wait for results. You can copy the full analysis with one click and keep track of recent analyses in the built-in history panel. For related text analysis, try our <a href="/${lang}/tools/word-counter">word counter</a> for detailed word statistics, <a href="/${lang}/tools/word-frequency-counter">word frequency counter</a> to find repeated words, or <a href="/${lang}/tools/text-case-converter">text case converter</a> to transform your text between uppercase, lowercase, and title case.',
      ],
      faq: [
        { q: 'What is a character counter and how does it work?', a: 'A character counter is an online tool that counts every individual character in your text, including letters, numbers, spaces, punctuation, and special symbols. Our character counter works in real time — simply type or paste your text and the count updates instantly. It also provides a detailed breakdown showing characters without spaces, word count, sentence count, vowels, consonants, digits, and letter frequency.' },
        { q: 'What is the difference between a character counter and a word counter?', a: 'A character counter counts every single character in your text (letters, numbers, spaces, punctuation), while a word counter counts groups of characters separated by spaces. For example, the phrase "Hello World" has 11 characters (including the space) but only 2 words. This tool provides both character count and word count, plus additional metrics like vowel count, consonant count, and most frequent letter analysis.' },
        { q: 'Do spaces count as characters in a character count?', a: 'Yes, spaces are counted as characters in the total character count. That is why this tool displays both "Total Characters" (including spaces) and "Characters (no spaces)". Different platforms treat spaces differently — Twitter and most social media platforms include spaces in their character limits, while some academic systems and databases may exclude them.' },
        { q: 'What are the character limits for social media platforms?', a: 'Common character limits include: Twitter/X posts (280 characters), Instagram bios (150 characters), Facebook posts (63,206 characters), LinkedIn headlines (120 characters), LinkedIn posts (3,000 characters), Pinterest pin descriptions (500 characters), YouTube video titles (100 characters), and TikTok captions (2,200 characters). Use our character limit presets to quickly check your text against these limits.' },
        { q: 'How does the letter frequency analysis work?', a: 'The letter frequency feature counts how many times each letter (A through Z) appears in your text, regardless of case. It then displays the most frequently used letter along with its count. This is useful for linguistic analysis, cryptography exercises, and writing improvement. In typical English text, the most common letters are E, T, A, O, I, N, S, H, and R.' },
        { q: 'Is this character counter free and private?', a: 'Yes, this character counter is 100% free with no registration required. All text analysis happens directly in your browser — your text is never uploaded to any server. This means your content remains completely private and the tool works even without an internet connection after the page has loaded.' },
      ],
    },
    it: {
      title: 'Contatore di Caratteri Online Gratuito – Analisi Dettagliata del Testo',
      paragraphs: [
        'Conoscere il conteggio esatto dei caratteri del tuo testo è fondamentale in molte situazioni: scrivere tweet entro il limite di 280 caratteri, creare meta description sotto i 160 caratteri o rispettare i requisiti dei saggi. Il nostro contatore di caratteri gratuito va ben oltre il semplice conteggio.',
        'Questo strumento analizza il tuo testo in tempo reale e mostra caratteri totali, caratteri senza spazi, parole, frasi, vocali, consonanti, cifre, caratteri speciali e persino la lettera più usata. Questo livello di dettaglio è prezioso per linguisti, studenti, creatori di contenuti e sviluppatori.',
        'Per i professionisti SEO, il conteggio dei caratteri è importante per ottimizzare i tag title (consigliati sotto i 60 caratteri), le meta description (sotto i 160 caratteri) e gli URL. I social media manager ne hanno bisogno per i limiti specifici delle piattaforme.',
        'La funzione di analisi della frequenza aiuta gli scrittori a identificare lettere o pattern sovra-utilizzati nel testo, utile per esercizi di crittografia, ricerca linguistica o semplicemente per migliorare la varietà della scrittura. Tutta l\'analisi avviene localmente nel browser.',
      ],
      faq: [
        { q: 'Qual è la differenza tra un contatore di caratteri e un contatore di parole?', a: 'Un contatore di caratteri conta ogni singolo carattere incluse lettere, numeri, spazi e punteggiatura. Un contatore di parole conta gruppi di caratteri separati da spazi. Questo strumento fornisce entrambi, più metriche aggiuntive come vocali, consonanti e frequenza delle lettere.' },
        { q: 'Gli spazi contano come caratteri?', a: 'Sì, gli spazi sono caratteri. Per questo lo strumento mostra sia "Caratteri Totali" (inclusi spazi) che "Caratteri (senza spazi)". Diverse piattaforme contano i caratteri in modo diverso.' },
        { q: 'Come vengono contate le frasi?', a: 'Le frasi vengono contate rilevando i segni di punteggiatura di fine frase: punti (.), punti esclamativi (!) e punti interrogativi (?). Se il testo non ha punteggiatura ma contiene contenuto, viene contato come una frase.' },
        { q: 'Cosa conta come carattere speciale?', a: 'I caratteri speciali sono tutti i caratteri che non sono vocali, consonanti, cifre o spazi. Questo include segni di punteggiatura, parentesi, trattini, underscore e simboli Unicode come emoji.' },
        { q: 'Come viene determinata la lettera più frequente?', a: 'Lo strumento conta le occorrenze di ogni lettera (a-z, senza distinzione maiuscole/minuscole) nel testo e mostra quella con il conteggio più alto. Nel testo italiano, la lettera "A" è tipicamente la più frequente.' },
      ],
    },
    es: {
      title: 'Contador de Caracteres Online Gratis – Análisis Detallado de Texto',
      paragraphs: [
        'Conocer el conteo exacto de caracteres de tu texto es crucial en muchas situaciones: escribir tweets dentro del límite de 280 caracteres, crear meta descripciones de menos de 160 caracteres o cumplir requisitos de ensayos. Nuestro contador de caracteres gratuito va mucho más allá del simple conteo.',
        'Esta herramienta analiza tu texto en tiempo real y muestra caracteres totales, caracteres sin espacios, palabras, oraciones, vocales, consonantes, dígitos, caracteres especiales e incluso la letra más frecuente. Este nivel de detalle es invaluable para lingüistas, estudiantes y creadores de contenido.',
        'Para profesionales de SEO, el conteo de caracteres importa al optimizar etiquetas de título (recomendado menos de 60 caracteres), meta descripciones (menos de 160 caracteres) y URLs. Los community managers lo necesitan para los límites de cada plataforma.',
        'La función de análisis de frecuencia ayuda a identificar letras o patrones sobreutilizados, útil para criptografía, investigación lingüística o mejorar la variedad de escritura. Todo el análisis se ejecuta localmente en tu navegador.',
      ],
      faq: [
        { q: '¿Cuál es la diferencia entre un contador de caracteres y uno de palabras?', a: 'Un contador de caracteres cuenta cada carácter individual incluyendo letras, números, espacios y puntuación. Un contador de palabras cuenta grupos de caracteres separados por espacios. Esta herramienta proporciona ambos.' },
        { q: '¿Los espacios cuentan como caracteres?', a: 'Sí, los espacios son caracteres. Por eso la herramienta muestra tanto "Caracteres Totales" como "Caracteres (sin espacios)". Diferentes plataformas cuentan caracteres de manera diferente.' },
        { q: '¿Cómo se cuentan las oraciones?', a: 'Las oraciones se cuentan detectando signos de puntuación finales: puntos (.), signos de exclamación (!) y signos de interrogación (?). Si tu texto no tiene puntuación pero contiene contenido, se cuenta como una oración.' },
        { q: '¿Qué cuenta como carácter especial?', a: 'Los caracteres especiales son cualquier carácter que no sea vocal, consonante, dígito o espacio. Esto incluye signos de puntuación, paréntesis, guiones y símbolos Unicode como emojis.' },
        { q: '¿Cómo se determina la letra más frecuente?', a: 'La herramienta cuenta las ocurrencias de cada letra (a-z, sin distinción de mayúsculas) y muestra la que tiene el conteo más alto. En español, la letra "A" suele ser la más frecuente.' },
      ],
    },
    fr: {
      title: 'Compteur de Caractères en Ligne Gratuit – Analyse Détaillée du Texte',
      paragraphs: [
        'Connaître le nombre exact de caractères de votre texte est crucial dans de nombreuses situations : écrire des tweets dans la limite de 280 caractères, rédiger des méta-descriptions de moins de 160 caractères ou respecter les exigences de dissertations. Notre compteur de caractères gratuit va bien au-delà du simple comptage.',
        'Cet outil analyse votre texte en temps réel et affiche les caractères totaux, caractères sans espaces, mots, phrases, voyelles, consonnes, chiffres, caractères spéciaux et même la lettre la plus fréquente. Ce niveau de détail est précieux pour les linguistes, étudiants et créateurs de contenu.',
        'Pour les professionnels du SEO, le comptage de caractères est important pour optimiser les balises titre (recommandé sous 60 caractères), les méta-descriptions (sous 160 caractères) et les URL. Les community managers en ont besoin pour les limites spécifiques de chaque plateforme.',
        'La fonction d\'analyse de fréquence aide à identifier les lettres ou patterns surutilisés, utile pour la cryptographie, la recherche linguistique ou l\'amélioration de la variété rédactionnelle. Toute l\'analyse s\'exécute localement dans votre navigateur.',
      ],
      faq: [
        { q: 'Quelle est la différence entre un compteur de caractères et un compteur de mots ?', a: 'Un compteur de caractères compte chaque caractère individuel incluant lettres, chiffres, espaces et ponctuation. Un compteur de mots compte les groupes de caractères séparés par des espaces. Cet outil fournit les deux.' },
        { q: 'Les espaces comptent-ils comme des caractères ?', a: 'Oui, les espaces sont des caractères. C\'est pourquoi l\'outil affiche à la fois « Caractères Totaux » et « Caractères (sans espaces) ». Différentes plateformes comptent les caractères différemment.' },
        { q: 'Comment les phrases sont-elles comptées ?', a: 'Les phrases sont comptées en détectant les signes de ponctuation de fin de phrase : points (.), points d\'exclamation (!) et points d\'interrogation (?). Si votre texte n\'a pas de ponctuation mais contient du contenu, il est compté comme une phrase.' },
        { q: 'Qu\'est-ce qui compte comme caractère spécial ?', a: 'Les caractères spéciaux sont tous les caractères qui ne sont pas des voyelles, consonnes, chiffres ou espaces. Cela inclut les signes de ponctuation, parenthèses, tirets et symboles Unicode comme les émojis.' },
        { q: 'Comment la lettre la plus fréquente est-elle déterminée ?', a: 'L\'outil compte les occurrences de chaque lettre (a-z, insensible à la casse) et affiche celle avec le compte le plus élevé. En français, la lettre « E » est typiquement la plus fréquente.' },
      ],
    },
    de: {
      title: 'Kostenloser Online-Zeichenzähler – Detaillierte Textanalyse',
      paragraphs: [
        'Die genaue Zeichenanzahl Ihres Textes zu kennen ist in vielen Situationen entscheidend: Tweets innerhalb des 280-Zeichen-Limits schreiben, Meta-Beschreibungen unter 160 Zeichen erstellen oder Aufsatzanforderungen erfüllen. Unser kostenloser Zeichenzähler geht weit über das einfache Zählen hinaus.',
        'Dieses Tool analysiert Ihren Text in Echtzeit und zeigt Gesamtzeichen, Zeichen ohne Leerzeichen, Wörter, Sätze, Vokale, Konsonanten, Ziffern, Sonderzeichen und sogar den häufigsten Buchstaben. Dieses Detailniveau ist wertvoll für Linguisten, Studenten und Content-Ersteller.',
        'Für SEO-Profis ist die Zeichenanzahl wichtig bei der Optimierung von Title-Tags (empfohlen unter 60 Zeichen), Meta-Beschreibungen (unter 160 Zeichen) und URLs. Social-Media-Manager benötigen es für plattformspezifische Limits.',
        'Die Häufigkeitsanalyse hilft, überverwendete Buchstaben oder Muster zu identifizieren, nützlich für Kryptografie, linguistische Forschung oder die Verbesserung der Schreibvielfalt. Die gesamte Analyse läuft lokal in Ihrem Browser.',
      ],
      faq: [
        { q: 'Was ist der Unterschied zwischen einem Zeichenzähler und einem Wortzähler?', a: 'Ein Zeichenzähler zählt jedes einzelne Zeichen einschließlich Buchstaben, Zahlen, Leerzeichen und Satzzeichen. Ein Wortzähler zählt Gruppen von Zeichen, die durch Leerzeichen getrennt sind. Dieses Tool bietet beides.' },
        { q: 'Zählen Leerzeichen als Zeichen?', a: 'Ja, Leerzeichen sind Zeichen. Deshalb zeigt das Tool sowohl „Zeichen Gesamt" als auch „Zeichen (ohne Leerzeichen)" an. Verschiedene Plattformen zählen Zeichen unterschiedlich.' },
        { q: 'Wie werden Sätze gezählt?', a: 'Sätze werden durch Erkennung von Satzende-Zeichen gezählt: Punkte (.), Ausrufezeichen (!) und Fragezeichen (?). Wenn Ihr Text keine Satzzeichen hat aber Inhalt enthält, wird er als ein Satz gezählt.' },
        { q: 'Was zählt als Sonderzeichen?', a: 'Sonderzeichen sind alle Zeichen, die keine Vokale, Konsonanten, Ziffern oder Leerzeichen sind. Dazu gehören Satzzeichen, Klammern, Bindestriche und Unicode-Symbole wie Emojis.' },
        { q: 'Wie wird der häufigste Buchstabe bestimmt?', a: 'Das Tool zählt das Vorkommen jedes Buchstabens (a-z, ohne Unterscheidung von Groß-/Kleinschreibung) und zeigt den mit der höchsten Anzahl an. Im Deutschen ist „E" typischerweise der häufigste Buchstabe.' },
      ],
    },
    pt: {
      title: 'Contador de Caracteres Online Grátis – Análise Detalhada de Texto',
      paragraphs: [
        'Saber a contagem exata de caracteres do seu texto é crucial em muitas situações: escrever tweets dentro do limite de 280 caracteres, criar meta descriptions com menos de 160 caracteres ou cumprir requisitos de redações. Nosso contador de caracteres gratuito vai muito além da simples contagem.',
        'Esta ferramenta analisa seu texto em tempo real e mostra caracteres totais, caracteres sem espaços, palavras, frases, vogais, consoantes, dígitos, caracteres especiais e até a letra mais frequente. Esse nível de detalhe é valioso para linguistas, estudantes e criadores de conteúdo.',
        'Para profissionais de SEO, a contagem de caracteres importa ao otimizar tags de título (recomendado menos de 60 caracteres), meta descriptions (menos de 160 caracteres) e URLs. Gerentes de redes sociais precisam para os limites de cada plataforma.',
        'A função de análise de frequência ajuda a identificar letras ou padrões sobreutilizados, útil para criptografia, pesquisa linguística ou melhorar a variedade da escrita. Toda a análise roda localmente no seu navegador.',
      ],
      faq: [
        { q: 'Qual a diferença entre um contador de caracteres e um contador de palavras?', a: 'Um contador de caracteres conta cada caractere individual incluindo letras, números, espaços e pontuação. Um contador de palavras conta grupos de caracteres separados por espaços. Esta ferramenta fornece ambos.' },
        { q: 'Espaços contam como caracteres?', a: 'Sim, espaços são caracteres. Por isso a ferramenta mostra tanto "Caracteres Totais" quanto "Caracteres (sem espaços)". Diferentes plataformas contam caracteres de formas diferentes.' },
        { q: 'Como as frases são contadas?', a: 'As frases são contadas detectando sinais de pontuação finais: pontos (.), pontos de exclamação (!) e pontos de interrogação (?). Se seu texto não tem pontuação mas contém conteúdo, é contado como uma frase.' },
        { q: 'O que conta como caractere especial?', a: 'Caracteres especiais são quaisquer caracteres que não sejam vogais, consoantes, dígitos ou espaços. Isso inclui sinais de pontuação, parênteses, hifens e símbolos Unicode como emojis.' },
        { q: 'Como a letra mais frequente é determinada?', a: 'A ferramenta conta as ocorrências de cada letra (a-z, sem distinção de maiúsculas) e mostra a que tem a contagem mais alta. Em português, a letra "A" é tipicamente a mais frequente.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="character-counter" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('inputText')}</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5}
              placeholder="Type or paste your text here..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
          </div>

          {/* Character limit progress bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{t('charLimit')}</span>
              <span className={`text-sm font-semibold ${overLimit ? 'text-red-600' : 'text-gray-600'}`}>
                {analysis.total} {t('charsOf')} {charLimit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${progressColor}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Preset buttons */}
            <div className="mt-2">
              <span className="text-xs text-gray-500 mr-2">{t('presets')}:</span>
              <div className="inline-flex flex-wrap gap-1.5 mt-1">
                {CHAR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setCharLimit(preset.limit)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      charLimit === preset.limit
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    {preset.name} ({preset.limit})
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ key, value }) => (
              <div key={key} className="p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-gray-500">{t(key)}</div>
                <div className="text-lg font-bold text-gray-900">{value}</div>
              </div>
            ))}
          </div>

          {/* Action buttons + validation message */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyResults}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copied ? t('copied') : t('copyResults')}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            >
              {t('reset')}
            </button>
            {emptyError && (
              <span className="text-sm text-red-500 animate-pulse">{t('emptyText')}</span>
            )}
          </div>
        </div>

        {/* History */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('history')}</h3>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400">{t('noHistory')}</p>
          ) : (
            <ul className="space-y-2">
              {history.map((entry, i) => (
                <li key={entry.timestamp} className="flex items-center justify-between text-sm p-2 rounded-lg bg-gray-50">
                  <span className="text-gray-700 truncate max-w-[60%] font-medium">&ldquo;{entry.preview}&rdquo;</span>
                  <span className="text-gray-500 text-xs whitespace-nowrap ml-2">{entry.total} {t('chars')} &middot; {entry.words} {t('wordsShort')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* SEO Article */}
        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: p.replace(/\$\{lang\}/g, lang) }} />)}
        </article>

        {/* FAQ Accordion */}
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
