'use client';
import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type ErrorType = 'spelling' | 'grammar' | 'style';

interface GrammarError {
  index: number;
  length: number;
  type: ErrorType;
  message: string;
  suggestion: string;
  original: string;
}

interface HistoryEntry {
  preview: string;
  errors: number;
  words: number;
  timestamp: number;
}

const MISSPELLINGS: Record<string, string> = {
  teh: 'the', recieve: 'receive', definately: 'definitely', occured: 'occurred',
  seperate: 'separate', occurence: 'occurrence', accomodate: 'accommodate',
  apparantly: 'apparently', begining: 'beginning', beleive: 'believe',
  calender: 'calendar', catagory: 'category', collegue: 'colleague',
  concious: 'conscious', definatly: 'definitely', dissapoint: 'disappoint',
  enviroment: 'environment', existance: 'existence', foriegn: 'foreign',
  fourty: 'forty', goverment: 'government', grammer: 'grammar',
  happend: 'happened', immediatly: 'immediately', independant: 'independent',
  knowlege: 'knowledge', liason: 'liaison', manouvre: 'manoeuvre',
  neccessary: 'necessary', noticable: 'noticeable', occassion: 'occasion',
  paralel: 'parallel', persue: 'pursue', posession: 'possession',
  prefered: 'preferred', privlege: 'privilege', profesional: 'professional',
  pronounciation: 'pronunciation', realy: 'really', refered: 'referred',
  relevent: 'relevant', rember: 'remember', rythm: 'rhythm',
  shedule: 'schedule', succesful: 'successful', suprise: 'surprise',
  tommorow: 'tomorrow', untill: 'until', wierd: 'weird', writting: 'writing',
  wich: 'which', thier: 'their', freind: 'friend', acheive: 'achieve',
  adress: 'address', agressive: 'aggressive', alot: 'a lot',
};

const APOSTROPHE_FIXES: Record<string, string> = {
  dont: "don't", cant: "can't", wont: "won't", isnt: "isn't", arent: "aren't",
  wasnt: "wasn't", werent: "weren't", hasnt: "hasn't", havent: "haven't",
  hadnt: "hadn't", doesnt: "doesn't", didnt: "didn't", wouldnt: "wouldn't",
  couldnt: "couldn't", shouldnt: "shouldn't", mustnt: "mustn't", lets: "let's",
  ive: "I've", youve: "you've", weve: "we've", theyve: "they've",
  im: "I'm", youre: "you're", were: "we're", theyre: "they're",
  hes: "he's", shes: "she's", its: "it's", whos: "who's", thats: "that's",
  whats: "what's", wheres: "where's", heres: "here's", theres: "there's",
  id: "I'd", youd: "you'd", hed: "he'd", shed: "she'd", wed: "we'd",
  theyd: "they'd", ill: "I'll", youll: "you'll", hell: "he'll",
  shell: "she'll", well: "we'll", theyll: "they'll",
};

// Words that look like apostrophe contractions but are valid on their own
const APOSTROPHE_EXCEPTIONS = new Set([
  'were', 'well', 'shell', 'id', 'ill', 'wed', 'hell', 'its', 'lets',
]);

export default function GrammarChecker() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['grammar-checker']?.[lang] || tools['grammar-checker']?.en;
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<GrammarError[]>([]);
  const [selectedError, setSelectedError] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('grammar-checker-history');
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('grammar-checker-history', JSON.stringify(history));
    } catch {}
  }, [history]);

  const labels: Record<string, Record<Locale, string>> = {
    placeholder: {
      en: 'Type or paste your text here to check for grammar and spelling errors...',
      it: 'Digita o incolla il tuo testo qui per controllare errori grammaticali e ortografici...',
      es: 'Escribe o pega tu texto aquí para verificar errores gramaticales y ortográficos...',
      fr: 'Tapez ou collez votre texte ici pour vérifier les erreurs de grammaire et d\'orthographe...',
      de: 'Geben Sie Ihren Text hier ein, um Grammatik- und Rechtschreibfehler zu prüfen...',
      pt: 'Digite ou cole seu texto aqui para verificar erros gramaticais e ortográficos...',
    },
    checkBtn: {
      en: 'Check Grammar', it: 'Controlla Grammatica', es: 'Verificar Gramática',
      fr: 'Vérifier la Grammaire', de: 'Grammatik Prüfen', pt: 'Verificar Gramática',
    },
    fixAll: {
      en: 'Fix All', it: 'Correggi Tutto', es: 'Corregir Todo',
      fr: 'Tout Corriger', de: 'Alles Korrigieren', pt: 'Corrigir Tudo',
    },
    copyText: {
      en: 'Copy Text', it: 'Copia Testo', es: 'Copiar Texto',
      fr: 'Copier le Texte', de: 'Text Kopieren', pt: 'Copiar Texto',
    },
    copiedMsg: {
      en: 'Copied!', it: 'Copiato!', es: '¡Copiado!',
      fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!',
    },
    reset: {
      en: 'Clear', it: 'Cancella', es: 'Borrar',
      fr: 'Effacer', de: 'Zurücksetzen', pt: 'Limpar',
    },
    noErrors: {
      en: 'No errors found! Your text looks great.',
      it: 'Nessun errore trovato! Il tuo testo è perfetto.',
      es: '¡No se encontraron errores! Tu texto se ve genial.',
      fr: 'Aucune erreur trouvée ! Votre texte est parfait.',
      de: 'Keine Fehler gefunden! Ihr Text sieht großartig aus.',
      pt: 'Nenhum erro encontrado! Seu texto está ótimo.',
    },
    errorsFound: {
      en: 'errors found', it: 'errori trovati', es: 'errores encontrados',
      fr: 'erreurs trouvées', de: 'Fehler gefunden', pt: 'erros encontrados',
    },
    spelling: {
      en: 'Spelling', it: 'Ortografia', es: 'Ortografía',
      fr: 'Orthographe', de: 'Rechtschreibung', pt: 'Ortografia',
    },
    grammar: {
      en: 'Grammar', it: 'Grammatica', es: 'Gramática',
      fr: 'Grammaire', de: 'Grammatik', pt: 'Gramática',
    },
    style: {
      en: 'Style', it: 'Stile', es: 'Estilo',
      fr: 'Style', de: 'Stil', pt: 'Estilo',
    },
    words: {
      en: 'Words', it: 'Parole', es: 'Palabras',
      fr: 'Mots', de: 'Wörter', pt: 'Palavras',
    },
    sentences: {
      en: 'Sentences', it: 'Frasi', es: 'Oraciones',
      fr: 'Phrases', de: 'Sätze', pt: 'Frases',
    },
    paragraphs: {
      en: 'Paragraphs', it: 'Paragrafi', es: 'Párrafos',
      fr: 'Paragraphes', de: 'Absätze', pt: 'Parágrafos',
    },
    readingLevel: {
      en: 'Reading Level', it: 'Livello di Lettura', es: 'Nivel de Lectura',
      fr: 'Niveau de Lecture', de: 'Lesestufe', pt: 'Nível de Leitura',
    },
    characters: {
      en: 'Characters', it: 'Caratteri', es: 'Caracteres',
      fr: 'Caractères', de: 'Zeichen', pt: 'Caracteres',
    },
    suggestion: {
      en: 'Suggestion', it: 'Suggerimento', es: 'Sugerencia',
      fr: 'Suggestion', de: 'Vorschlag', pt: 'Sugestão',
    },
    applyFix: {
      en: 'Apply Fix', it: 'Applica Correzione', es: 'Aplicar Corrección',
      fr: 'Appliquer la Correction', de: 'Korrektur Anwenden', pt: 'Aplicar Correção',
    },
    history: {
      en: 'Recent Checks', it: 'Controlli Recenti', es: 'Verificaciones Recientes',
      fr: 'Vérifications Récentes', de: 'Letzte Prüfungen', pt: 'Verificações Recentes',
    },
    noHistory: {
      en: 'No saved checks yet.', it: 'Nessun controllo salvato.', es: 'Sin verificaciones guardadas.',
      fr: 'Aucune vérification sauvegardée.', de: 'Noch keine gespeicherten Prüfungen.', pt: 'Nenhuma verificação salva ainda.',
    },
    doubleWord: {
      en: 'Repeated word', it: 'Parola ripetuta', es: 'Palabra repetida',
      fr: 'Mot répété', de: 'Wiederholtes Wort', pt: 'Palavra repetida',
    },
    missingCap: {
      en: 'Missing capitalization after sentence-ending punctuation',
      it: 'Maiuscola mancante dopo punteggiatura di fine frase',
      es: 'Falta mayúscula después de puntuación final',
      fr: 'Majuscule manquante après la ponctuation de fin de phrase',
      de: 'Fehlende Großschreibung nach Satzzeichen',
      pt: 'Maiúscula faltando após pontuação final',
    },
    extraSpaces: {
      en: 'Extra spaces detected', it: 'Spazi extra rilevati', es: 'Espacios extra detectados',
      fr: 'Espaces supplémentaires détectés', de: 'Zusätzliche Leerzeichen erkannt', pt: 'Espaços extras detectados',
    },
    misspelling: {
      en: 'Possible misspelling', it: 'Possibile errore ortografico', es: 'Posible error ortográfico',
      fr: 'Faute d\'orthographe possible', de: 'Möglicher Rechtschreibfehler', pt: 'Possível erro ortográfico',
    },
    missingApostrophe: {
      en: 'Missing apostrophe', it: 'Apostrofo mancante', es: 'Apóstrofo faltante',
      fr: 'Apostrophe manquante', de: 'Fehlendes Apostroph', pt: 'Apóstrofo faltando',
    },
    missingPunctuation: {
      en: 'Sentence may be missing ending punctuation',
      it: 'La frase potrebbe mancare della punteggiatura finale',
      es: 'La oración puede carecer de puntuación final',
      fr: 'La phrase pourrait manquer de ponctuation finale',
      de: 'Dem Satz fehlt möglicherweise die Satzzeichensetzung am Ende',
      pt: 'A frase pode estar sem pontuação final',
    },
    stats: {
      en: 'Text Statistics', it: 'Statistiche Testo', es: 'Estadísticas de Texto',
      fr: 'Statistiques du Texte', de: 'Textstatistiken', pt: 'Estatísticas do Texto',
    },
    enterText: {
      en: 'Enter some text and click "Check Grammar" to find errors.',
      it: 'Inserisci del testo e clicca "Controlla Grammatica" per trovare errori.',
      es: 'Ingresa texto y haz clic en "Verificar Gramática" para encontrar errores.',
      fr: 'Saisissez du texte et cliquez sur "Vérifier la Grammaire" pour trouver des erreurs.',
      de: 'Geben Sie Text ein und klicken Sie auf "Grammatik Prüfen", um Fehler zu finden.',
      pt: 'Insira um texto e clique em "Verificar Gramática" para encontrar erros.',
    },
    removeWord: {
      en: 'Remove duplicate', it: 'Rimuovi duplicato', es: 'Eliminar duplicado',
      fr: 'Supprimer le doublon', de: 'Duplikat entfernen', pt: 'Remover duplicado',
    },
  };

  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const sentenceCount = text.trim() ? text.split(/[.!?]+/).filter((s) => s.trim()).length : 0;
  const paragraphCount = text.trim() ? text.split(/\n\n+/).filter((s) => s.trim()).length : 0;

  const getReadingLevel = useCallback((): string => {
    if (wordCount === 0) return '-';
    const wordsArr = text.trim().split(/\s+/);
    const avgLen = wordsArr.reduce((sum, w) => sum + w.replace(/[^a-zA-Z]/g, '').length, 0) / wordsArr.length;
    const avgSentLen = sentenceCount > 0 ? wordCount / sentenceCount : wordCount;
    const score = 206.835 - 1.015 * avgSentLen - 84.6 * (avgLen / 4.7);
    if (score >= 90) return 'Easy';
    if (score >= 70) return 'Moderate';
    if (score >= 50) return 'Advanced';
    return 'Complex';
  }, [text, wordCount, sentenceCount]);

  const checkGrammar = useCallback(() => {
    const found: GrammarError[] = [];

    // 1. Double words
    const doubleWordRegex = /\b(\w+)\s+\1\b/gi;
    let match;
    while ((match = doubleWordRegex.exec(text)) !== null) {
      found.push({
        index: match.index,
        length: match[0].length,
        type: 'grammar',
        message: t('doubleWord') + `: "${match[1]}"`,
        suggestion: match[1],
        original: match[0],
      });
    }

    // 2. Missing capitalization after period/exclamation/question
    const capRegex = /([.!?])\s+([a-z])/g;
    while ((match = capRegex.exec(text)) !== null) {
      found.push({
        index: match.index,
        length: match[0].length,
        type: 'grammar',
        message: t('missingCap'),
        suggestion: match[1] + ' ' + match[2].toUpperCase(),
        original: match[0],
      });
    }

    // 3. Extra spaces
    const spaceRegex = /(?<! ) {2,}(?! )/g;
    const multiSpaceRegex = / {2,}/g;
    while ((match = multiSpaceRegex.exec(text)) !== null) {
      // Skip if at start of line (indentation)
      const beforeIdx = match.index - 1;
      if (beforeIdx < 0 || text[beforeIdx] === '\n') continue;
      found.push({
        index: match.index,
        length: match[0].length,
        type: 'style',
        message: t('extraSpaces'),
        suggestion: ' ',
        original: match[0],
      });
    }

    // 4. Common misspellings
    const wordRegex = /\b[a-zA-Z]+\b/g;
    while ((match = wordRegex.exec(text)) !== null) {
      const lower = match[0].toLowerCase();
      if (MISSPELLINGS[lower]) {
        let corrected = MISSPELLINGS[lower];
        // Preserve original capitalization
        if (match[0][0] === match[0][0].toUpperCase()) {
          corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
        }
        found.push({
          index: match.index,
          length: match[0].length,
          type: 'spelling',
          message: t('misspelling') + `: "${match[0]}" → "${corrected}"`,
          suggestion: corrected,
          original: match[0],
        });
      }

      // 5. Missing apostrophes (only for words NOT in exceptions or where context makes it clear)
      if (APOSTROPHE_FIXES[lower] && !APOSTROPHE_EXCEPTIONS.has(lower)) {
        let corrected = APOSTROPHE_FIXES[lower];
        if (match[0][0] === match[0][0].toUpperCase()) {
          corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
        }
        found.push({
          index: match.index,
          length: match[0].length,
          type: 'spelling',
          message: t('missingApostrophe') + `: "${match[0]}" → "${corrected}"`,
          suggestion: corrected,
          original: match[0],
        });
      }
    }

    // 6. Missing sentence-ending punctuation (last non-empty line)
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    if (lines.length > 0) {
      const lastLine = lines[lines.length - 1].trim();
      if (lastLine.length > 10 && !/[.!?:;]$/.test(lastLine)) {
        const lastLineStart = text.lastIndexOf(lastLine);
        found.push({
          index: lastLineStart + lastLine.length - 1,
          length: 1,
          type: 'style',
          message: t('missingPunctuation'),
          suggestion: lastLine.charAt(lastLine.length - 1) + '.',
          original: lastLine.charAt(lastLine.length - 1),
        });
      }
    }

    // Sort by position
    found.sort((a, b) => a.index - b.index);
    setErrors(found);
    setHasChecked(true);
    setSelectedError(null);

    // Save to history
    const entry: HistoryEntry = {
      preview: text.slice(0, 40) + (text.length > 40 ? '...' : ''),
      errors: found.length,
      words: wordCount,
      timestamp: Date.now(),
    };
    setHistory((prev) => [entry, ...prev].slice(0, 10));
  }, [text, wordCount, lang]);

  const applyFix = useCallback((errorIdx: number) => {
    const err = errors[errorIdx];
    if (!err) return;
    const newText = text.slice(0, err.index) + err.suggestion + text.slice(err.index + err.length);
    setText(newText);
    // Recalculate offset for remaining errors
    const diff = err.suggestion.length - err.length;
    const newErrors = errors
      .filter((_, i) => i !== errorIdx)
      .map((e) => ({
        ...e,
        index: e.index > err.index ? e.index + diff : e.index,
      }));
    setErrors(newErrors);
    setSelectedError(null);
  }, [text, errors]);

  const fixAll = useCallback(() => {
    let newText = text;
    // Apply fixes from end to start to preserve indices
    const sorted = [...errors].sort((a, b) => b.index - a.index);
    for (const err of sorted) {
      newText = newText.slice(0, err.index) + err.suggestion + newText.slice(err.index + err.length);
    }
    setText(newText);
    setErrors([]);
    setSelectedError(null);
  }, [text, errors]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setText('');
    setErrors([]);
    setSelectedError(null);
    setHasChecked(false);
  };

  const spellingCount = errors.filter(e => e.type === 'spelling').length;
  const grammarCount = errors.filter(e => e.type === 'grammar').length;
  const styleCount = errors.filter(e => e.type === 'style').length;

  // Build highlighted text
  const renderHighlightedText = () => {
    if (errors.length === 0) return null;
    const parts: React.ReactElement[] = [];
    let lastIdx = 0;

    const sorted = [...errors].sort((a, b) => a.index - b.index);
    sorted.forEach((err, i) => {
      if (err.index > lastIdx) {
        parts.push(<span key={`t-${i}`}>{text.slice(lastIdx, err.index)}</span>);
      }
      const colorClass =
        err.type === 'spelling' ? 'bg-red-100 border-b-2 border-red-500 cursor-pointer' :
        err.type === 'grammar' ? 'bg-blue-100 border-b-2 border-blue-500 cursor-pointer' :
        'bg-yellow-100 border-b-2 border-yellow-500 cursor-pointer';
      const actualIdx = errors.indexOf(err);
      parts.push(
        <span
          key={`e-${i}`}
          className={`${colorClass} rounded px-0.5 ${selectedError === actualIdx ? 'ring-2 ring-offset-1 ring-gray-800' : ''}`}
          onClick={() => setSelectedError(selectedError === actualIdx ? null : actualIdx)}
          title={err.message}
        >
          {text.slice(err.index, err.index + err.length)}
        </span>
      );
      lastIdx = err.index + err.length;
    });
    if (lastIdx < text.length) {
      parts.push(<span key="tail">{text.slice(lastIdx)}</span>);
    }
    return parts;
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Online Grammar Checker — Fix Spelling, Grammar & Style Errors',
      paragraphs: [
        'Good writing starts with correct grammar. Whether you are drafting an email, writing a blog post, completing an academic paper, or preparing a business proposal, grammatical errors can undermine your credibility and confuse your readers. Our free online grammar checker helps you catch mistakes before they reach your audience.',
        'This tool performs a comprehensive client-side analysis of your text, detecting common spelling mistakes, repeated words, missing capitalization, extra spaces, and missing punctuation. It highlights each issue with color-coded underlines — red for spelling errors, blue for grammar mistakes, and yellow for style suggestions — making it easy to identify and fix problems at a glance.',
        'Unlike many grammar checkers that require you to create an account or pay a subscription, our tool is completely free and processes everything in your browser. Your text never leaves your device, ensuring total privacy. Simply paste your text, click "Check Grammar," and review the highlighted suggestions. You can fix errors one by one or use the "Fix All" button to apply every correction at once.',
        'The tool also provides useful text statistics including word count, sentence count, paragraph count, and an estimated reading level. These metrics help you gauge the complexity of your writing and ensure it is appropriate for your target audience. Professional writers, students, and non-native speakers all benefit from this quick, accessible grammar review.',
      ],
      faq: [
        { q: 'How does this grammar checker work?', a: 'The tool uses pattern-matching rules running entirely in your browser. It checks for common misspellings, repeated words, capitalization errors, extra spaces, missing apostrophes, and punctuation issues. No data is sent to any server.' },
        { q: 'Is this grammar checker free to use?', a: 'Yes, it is 100% free with no registration, no account creation, and no usage limits. You can check as many texts as you want.' },
        { q: 'Does the tool support languages other than English?', a: 'The grammar checking rules are currently optimized for English text. The interface is available in 6 languages (English, Italian, Spanish, French, German, Portuguese), but the spell-check dictionary targets English words.' },
        { q: 'Is my text private and secure?', a: 'Absolutely. All processing happens locally in your browser using JavaScript. Your text is never transmitted to any external server, ensuring complete privacy and data security.' },
        { q: 'What types of errors does the checker detect?', a: 'The checker detects spelling mistakes (50+ common misspellings), missing apostrophes in contractions, repeated/double words, missing capitalization after periods, extra spaces between words, and missing sentence-ending punctuation.' },
      ],
    },
    it: {
      title: 'Correttore Grammaticale Online Gratuito — Correggi Errori di Ortografia, Grammatica e Stile',
      paragraphs: [
        'Una buona scrittura inizia con una grammatica corretta. Che tu stia redigendo un\'email, scrivendo un post per il blog, completando un elaborato accademico o preparando una proposta commerciale, gli errori grammaticali possono minare la tua credibilità e confondere i tuoi lettori. Il nostro correttore grammaticale online gratuito ti aiuta a individuare gli errori prima che raggiungano il tuo pubblico.',
        'Questo strumento esegue un\'analisi completa del testo lato client, rilevando errori ortografici comuni, parole ripetute, maiuscole mancanti, spazi extra e punteggiatura mancante. Evidenzia ogni problema con sottolineature colorate — rosso per errori ortografici, blu per errori grammaticali e giallo per suggerimenti di stile — rendendo facile identificare e correggere i problemi a colpo d\'occhio.',
        'A differenza di molti correttori grammaticali che richiedono la creazione di un account o un abbonamento a pagamento, il nostro strumento è completamente gratuito e elabora tutto nel tuo browser. Il tuo testo non lascia mai il tuo dispositivo, garantendo totale privacy. Basta incollare il testo, cliccare "Controlla Grammatica" e rivedere i suggerimenti evidenziati.',
        'Lo strumento fornisce anche statistiche utili sul testo tra cui conteggio parole, frasi, paragrafi e un livello di lettura stimato. Queste metriche ti aiutano a valutare la complessità della tua scrittura. Scrittori professionisti, studenti e non madrelingua beneficiano tutti di questa revisione grammaticale rapida e accessibile.',
      ],
      faq: [
        { q: 'Come funziona questo correttore grammaticale?', a: 'Lo strumento utilizza regole di pattern-matching che funzionano interamente nel tuo browser. Controlla errori ortografici comuni, parole ripetute, errori di maiuscole, spazi extra, apostrofi mancanti e problemi di punteggiatura. Nessun dato viene inviato a server esterni.' },
        { q: 'Il correttore grammaticale è gratuito?', a: 'Sì, è gratuito al 100% senza registrazione, senza creazione di account e senza limiti di utilizzo. Puoi controllare tutti i testi che vuoi.' },
        { q: 'Lo strumento supporta lingue diverse dall\'inglese?', a: 'Le regole di controllo grammaticale sono attualmente ottimizzate per il testo in inglese. L\'interfaccia è disponibile in 6 lingue, ma il dizionario ortografico è incentrato sulle parole inglesi.' },
        { q: 'Il mio testo è privato e sicuro?', a: 'Assolutamente. Tutta l\'elaborazione avviene localmente nel tuo browser usando JavaScript. Il tuo testo non viene mai trasmesso a server esterni, garantendo completa privacy e sicurezza dei dati.' },
        { q: 'Quali tipi di errori rileva il correttore?', a: 'Il correttore rileva errori ortografici (50+ errori comuni), apostrofi mancanti nelle contrazioni, parole doppie/ripetute, maiuscole mancanti dopo i punti, spazi extra tra le parole e punteggiatura mancante alla fine delle frasi.' },
      ],
    },
    es: {
      title: 'Corrector Gramatical Online Gratis — Corrige Errores de Ortografía, Gramática y Estilo',
      paragraphs: [
        'Una buena escritura comienza con una gramática correcta. Ya sea que estés redactando un correo electrónico, escribiendo una publicación de blog, completando un trabajo académico o preparando una propuesta de negocios, los errores gramaticales pueden socavar tu credibilidad y confundir a tus lectores. Nuestro corrector gramatical online gratuito te ayuda a detectar errores antes de que lleguen a tu audiencia.',
        'Esta herramienta realiza un análisis completo del texto del lado del cliente, detectando errores ortográficos comunes, palabras repetidas, mayúsculas faltantes, espacios extra y puntuación faltante. Resalta cada problema con subrayados codificados por colores — rojo para errores ortográficos, azul para errores gramaticales y amarillo para sugerencias de estilo.',
        'A diferencia de muchos correctores gramaticales que requieren crear una cuenta o pagar una suscripción, nuestra herramienta es completamente gratuita y procesa todo en tu navegador. Tu texto nunca sale de tu dispositivo, asegurando total privacidad. Simplemente pega tu texto, haz clic en "Verificar Gramática" y revisa las sugerencias resaltadas.',
        'La herramienta también proporciona estadísticas útiles del texto incluyendo conteo de palabras, oraciones, párrafos y un nivel de lectura estimado. Estas métricas te ayudan a evaluar la complejidad de tu escritura y asegurar que sea apropiada para tu audiencia objetivo.',
      ],
      faq: [
        { q: '¿Cómo funciona este corrector gramatical?', a: 'La herramienta usa reglas de coincidencia de patrones que se ejecutan completamente en tu navegador. Verifica errores ortográficos comunes, palabras repetidas, errores de mayúsculas, espacios extra, apóstrofos faltantes y problemas de puntuación.' },
        { q: '¿El corrector gramatical es gratuito?', a: 'Sí, es 100% gratuito sin registro, sin creación de cuenta y sin límites de uso. Puedes verificar tantos textos como quieras.' },
        { q: '¿La herramienta soporta otros idiomas además del inglés?', a: 'Las reglas de corrección gramatical están actualmente optimizadas para texto en inglés. La interfaz está disponible en 6 idiomas, pero el diccionario ortográfico se centra en palabras en inglés.' },
        { q: '¿Mi texto es privado y seguro?', a: 'Absolutamente. Todo el procesamiento ocurre localmente en tu navegador usando JavaScript. Tu texto nunca se transmite a ningún servidor externo.' },
        { q: '¿Qué tipos de errores detecta el corrector?', a: 'El corrector detecta errores ortográficos (más de 50 errores comunes), apóstrofos faltantes en contracciones, palabras dobles/repetidas, mayúsculas faltantes después de puntos, espacios extra y puntuación faltante al final de las oraciones.' },
      ],
    },
    fr: {
      title: 'Correcteur Grammatical en Ligne Gratuit — Corrigez les Erreurs d\'Orthographe, Grammaire et Style',
      paragraphs: [
        'Une bonne écriture commence par une grammaire correcte. Que vous rédigiez un e-mail, écriviez un article de blog, complétiez un travail académique ou prépariez une proposition commerciale, les erreurs grammaticales peuvent nuire à votre crédibilité et confondre vos lecteurs. Notre correcteur grammatical en ligne gratuit vous aide à détecter les erreurs avant qu\'elles n\'atteignent votre public.',
        'Cet outil effectue une analyse complète du texte côté client, détectant les fautes d\'orthographe courantes, les mots répétés, les majuscules manquantes, les espaces supplémentaires et la ponctuation manquante. Il surligne chaque problème avec des soulignements colorés — rouge pour les fautes d\'orthographe, bleu pour les erreurs grammaticales et jaune pour les suggestions de style.',
        'Contrairement à de nombreux correcteurs grammaticaux qui nécessitent la création d\'un compte ou un abonnement payant, notre outil est entièrement gratuit et traite tout dans votre navigateur. Votre texte ne quitte jamais votre appareil, garantissant une confidentialité totale. Collez simplement votre texte, cliquez sur "Vérifier la Grammaire" et passez en revue les suggestions surlignées.',
        'L\'outil fournit également des statistiques utiles sur le texte, notamment le nombre de mots, de phrases, de paragraphes et un niveau de lecture estimé. Ces métriques vous aident à évaluer la complexité de votre écriture et à vous assurer qu\'elle est appropriée pour votre public cible.',
      ],
      faq: [
        { q: 'Comment fonctionne ce correcteur grammatical ?', a: 'L\'outil utilise des règles de correspondance de motifs qui s\'exécutent entièrement dans votre navigateur. Il vérifie les fautes d\'orthographe courantes, les mots répétés, les erreurs de majuscules, les espaces supplémentaires, les apostrophes manquantes et les problèmes de ponctuation.' },
        { q: 'Le correcteur grammatical est-il gratuit ?', a: 'Oui, il est 100% gratuit sans inscription, sans création de compte et sans limite d\'utilisation. Vous pouvez vérifier autant de textes que vous le souhaitez.' },
        { q: 'L\'outil prend-il en charge d\'autres langues que l\'anglais ?', a: 'Les règles de correction grammaticale sont actuellement optimisées pour le texte en anglais. L\'interface est disponible en 6 langues, mais le dictionnaire orthographique cible les mots anglais.' },
        { q: 'Mon texte est-il privé et sécurisé ?', a: 'Absolument. Tout le traitement se fait localement dans votre navigateur via JavaScript. Votre texte n\'est jamais transmis à un serveur externe.' },
        { q: 'Quels types d\'erreurs le correcteur détecte-t-il ?', a: 'Le correcteur détecte les fautes d\'orthographe (50+ erreurs courantes), les apostrophes manquantes dans les contractions, les mots doublés/répétés, les majuscules manquantes après les points, les espaces supplémentaires et la ponctuation manquante en fin de phrase.' },
      ],
    },
    de: {
      title: 'Kostenloser Online-Grammatikprüfer — Rechtschreib-, Grammatik- und Stilfehler Korrigieren',
      paragraphs: [
        'Gutes Schreiben beginnt mit korrekter Grammatik. Ob Sie eine E-Mail verfassen, einen Blogbeitrag schreiben, eine wissenschaftliche Arbeit fertigstellen oder ein Geschäftsangebot vorbereiten — Grammatikfehler können Ihre Glaubwürdigkeit untergraben und Ihre Leser verwirren. Unser kostenloser Online-Grammatikprüfer hilft Ihnen, Fehler zu erkennen, bevor sie Ihr Publikum erreichen.',
        'Dieses Tool führt eine umfassende clientseitige Textanalyse durch und erkennt häufige Rechtschreibfehler, wiederholte Wörter, fehlende Großschreibung, zusätzliche Leerzeichen und fehlende Interpunktion. Jedes Problem wird mit farbcodierten Unterstreichungen hervorgehoben — rot für Rechtschreibfehler, blau für Grammatikfehler und gelb für Stilvorschläge.',
        'Im Gegensatz zu vielen Grammatikprüfern, die eine Kontoeröffnung oder ein kostenpflichtiges Abonnement erfordern, ist unser Tool völlig kostenlos und verarbeitet alles in Ihrem Browser. Ihr Text verlässt niemals Ihr Gerät, was vollständige Privatsphäre gewährleistet. Fügen Sie einfach Ihren Text ein, klicken Sie auf "Grammatik Prüfen" und überprüfen Sie die hervorgehobenen Vorschläge.',
        'Das Tool liefert auch nützliche Textstatistiken wie Wörteranzahl, Satzanzahl, Absatzanzahl und ein geschätztes Leseniveau. Diese Metriken helfen Ihnen, die Komplexität Ihres Schreibens einzuschätzen und sicherzustellen, dass es für Ihre Zielgruppe angemessen ist.',
      ],
      faq: [
        { q: 'Wie funktioniert dieser Grammatikprüfer?', a: 'Das Tool verwendet Mustererkennungsregeln, die vollständig in Ihrem Browser ausgeführt werden. Es prüft häufige Rechtschreibfehler, wiederholte Wörter, Großschreibungsfehler, zusätzliche Leerzeichen, fehlende Apostrophe und Interpunktionsprobleme.' },
        { q: 'Ist der Grammatikprüfer kostenlos?', a: 'Ja, er ist 100% kostenlos ohne Registrierung, ohne Kontoerstellung und ohne Nutzungsbeschränkungen. Sie können so viele Texte überprüfen, wie Sie möchten.' },
        { q: 'Unterstützt das Tool andere Sprachen als Englisch?', a: 'Die Grammatikprüfungsregeln sind derzeit für englische Texte optimiert. Die Oberfläche ist in 6 Sprachen verfügbar, aber das Rechtschreibwörterbuch zielt auf englische Wörter ab.' },
        { q: 'Ist mein Text privat und sicher?', a: 'Absolut. Die gesamte Verarbeitung erfolgt lokal in Ihrem Browser mittels JavaScript. Ihr Text wird niemals an einen externen Server übertragen.' },
        { q: 'Welche Arten von Fehlern erkennt der Prüfer?', a: 'Der Prüfer erkennt Rechtschreibfehler (50+ häufige Fehler), fehlende Apostrophe in Kontraktionen, doppelte/wiederholte Wörter, fehlende Großschreibung nach Punkten, zusätzliche Leerzeichen und fehlende Satzzeichen am Satzende.' },
      ],
    },
    pt: {
      title: 'Corretor Gramatical Online Grátis — Corrija Erros de Ortografia, Gramática e Estilo',
      paragraphs: [
        'Uma boa escrita começa com gramática correta. Seja redigindo um e-mail, escrevendo um post de blog, completando um trabalho acadêmico ou preparando uma proposta comercial, erros gramaticais podem minar sua credibilidade e confundir seus leitores. Nosso corretor gramatical online gratuito ajuda você a detectar erros antes que cheguem ao seu público.',
        'Esta ferramenta realiza uma análise abrangente do texto no lado do cliente, detectando erros ortográficos comuns, palavras repetidas, maiúsculas faltando, espaços extras e pontuação faltando. Destaca cada problema com sublinhados coloridos — vermelho para erros ortográficos, azul para erros gramaticais e amarelo para sugestões de estilo.',
        'Ao contrário de muitos corretores gramaticais que exigem criar uma conta ou pagar uma assinatura, nossa ferramenta é completamente gratuita e processa tudo no seu navegador. Seu texto nunca sai do seu dispositivo, garantindo total privacidade. Basta colar seu texto, clicar em "Verificar Gramática" e revisar as sugestões destacadas.',
        'A ferramenta também fornece estatísticas úteis do texto, incluindo contagem de palavras, frases, parágrafos e um nível de leitura estimado. Essas métricas ajudam você a avaliar a complexidade da sua escrita e garantir que seja apropriada para seu público-alvo.',
      ],
      faq: [
        { q: 'Como funciona este corretor gramatical?', a: 'A ferramenta usa regras de correspondência de padrões que funcionam inteiramente no seu navegador. Verifica erros ortográficos comuns, palavras repetidas, erros de maiúsculas, espaços extras, apóstrofos faltando e problemas de pontuação.' },
        { q: 'O corretor gramatical é gratuito?', a: 'Sim, é 100% gratuito sem registro, sem criação de conta e sem limites de uso. Você pode verificar quantos textos quiser.' },
        { q: 'A ferramenta suporta outros idiomas além do inglês?', a: 'As regras de correção gramatical estão atualmente otimizadas para texto em inglês. A interface está disponível em 6 idiomas, mas o dicionário ortográfico é focado em palavras em inglês.' },
        { q: 'Meu texto é privado e seguro?', a: 'Absolutamente. Todo o processamento acontece localmente no seu navegador usando JavaScript. Seu texto nunca é transmitido para nenhum servidor externo.' },
        { q: 'Que tipos de erros o corretor detecta?', a: 'O corretor detecta erros ortográficos (mais de 50 erros comuns), apóstrofos faltando em contrações, palavras duplas/repetidas, maiúsculas faltando após pontos, espaços extras e pontuação faltando no final das frases.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const faqItems = seo.faq;
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="grammar-checker" faqItems={faqItems}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT?.name || 'Grammar Checker'}</h1>
        <p className="text-gray-600 mb-6">{toolT?.description || ''}</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          {[
            { label: t('characters'), value: charCount, bg: 'bg-green-50', tc: 'text-green-700', border: 'border-green-200' },
            { label: t('words'), value: wordCount, bg: 'bg-blue-50', tc: 'text-blue-700', border: 'border-blue-200' },
            { label: t('sentences'), value: sentenceCount, bg: 'bg-amber-50', tc: 'text-amber-700', border: 'border-amber-200' },
            { label: t('paragraphs'), value: paragraphCount, bg: 'bg-rose-50', tc: 'text-rose-700', border: 'border-rose-200' },
            { label: t('readingLevel'), value: getReadingLevel(), bg: 'bg-purple-50', tc: 'text-purple-700', border: 'border-purple-200' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-lg p-3 text-center`}>
              <div className={`text-xl font-bold ${stat.tc}`}>{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setHasChecked(false); setErrors([]); setSelectedError(null); }}
          placeholder={t('placeholder')}
          className="w-full h-48 border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono"
        />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={checkGrammar}
            disabled={!text.trim()}
            className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('checkBtn')}
          </button>
          {errors.length > 0 && (
            <button
              onClick={fixAll}
              className="bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              {t('fixAll')}
            </button>
          )}
          <button
            onClick={handleCopy}
            disabled={!text.trim()}
            className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? t('copiedMsg') : t('copyText')}
          </button>
          <button
            onClick={handleReset}
            className="bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            {t('reset')}
          </button>
        </div>

        {/* Error Summary */}
        {hasChecked && (
          <div className="mt-6">
            {errors.length === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 font-medium text-center">
                {t('noErrors')}
              </div>
            ) : (
              <>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">{errors.length} {t('errorsFound')}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {spellingCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-full px-3 py-1 text-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span className="text-red-700 font-medium">{spellingCount} {t('spelling')}</span>
                      </span>
                    )}
                    {grammarCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span className="text-blue-700 font-medium">{grammarCount} {t('grammar')}</span>
                      </span>
                    )}
                    {styleCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1 text-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                        <span className="text-yellow-700 font-medium">{styleCount} {t('style')}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Highlighted Text Preview */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 whitespace-pre-wrap font-mono text-sm leading-relaxed max-h-64 overflow-y-auto">
                  {renderHighlightedText()}
                </div>

                {/* Selected Error Detail */}
                {selectedError !== null && errors[selectedError] && (
                  <div className={`border rounded-lg p-4 mb-4 ${
                    errors[selectedError].type === 'spelling' ? 'bg-red-50 border-red-200' :
                    errors[selectedError].type === 'grammar' ? 'bg-blue-50 border-blue-200' :
                    'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="text-sm font-medium text-gray-900 mb-1">{errors[selectedError].message}</div>
                    <div className="text-sm text-gray-600 mb-3">
                      {t('suggestion')}: <span className="font-semibold text-green-700">&ldquo;{errors[selectedError].suggestion}&rdquo;</span>
                    </div>
                    <button
                      onClick={() => applyFix(selectedError)}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      {t('applyFix')}
                    </button>
                  </div>
                )}

                {/* Error List */}
                <div className="space-y-2">
                  {errors.map((err, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedError(selectedError === i ? null : i)}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        selectedError === i ? 'ring-2 ring-gray-800' : ''
                      } ${
                        err.type === 'spelling' ? 'bg-red-50 border-red-200 hover:bg-red-100' :
                        err.type === 'grammar' ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' :
                        'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-800">{err.message}</div>
                        <button
                          onClick={(e) => { e.stopPropagation(); applyFix(i); }}
                          className="text-xs bg-white border border-gray-300 rounded px-2 py-1 hover:bg-gray-50 transition-colors ml-2 whitespace-nowrap"
                        >
                          {t('applyFix')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Prompt when no check has been done */}
        {!hasChecked && text.trim() && (
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-500 text-center text-sm">
            {t('enterText')}
          </div>
        )}

        {/* History */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 mb-3">{t('history')}</div>
          {history.length > 0 ? (
            <div className="space-y-2">
              {history.map((entry, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex justify-between items-center text-sm">
                  <span className="text-gray-600 truncate mr-3">&ldquo;{entry.preview}&rdquo;</span>
                  <span className="text-gray-500 whitespace-nowrap">
                    {entry.words} {t('words').toLowerCase()} &middot; {entry.errors} {t('errorsFound')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400">{t('noHistory')}</div>
          )}
        </div>

        {/* SEO Article */}
        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-4">{p}</p>)}
        </article>

        {/* FAQ Accordion */}
        <section className="mt-10 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">FAQ</h2>
          <div className="space-y-2">
            {seo.faq.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-lg">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left px-4 py-3 font-medium text-gray-900 flex justify-between items-center">
                  {item.q}
                  <span className="text-gray-400">{openFaq === i ? '\u2212' : '+'}</span>
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
