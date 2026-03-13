'use client';
import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface AnalysisResult {
  overallScore: number;
  verdict: 'human' | 'mixed' | 'ai';
  metrics: {
    sentenceUniformity: number;
    vocabularyDiversity: number;
    transitionWordFreq: number;
    passiveVoice: number;
    avgWordLength: number;
    paragraphConsistency: number;
    repetitiveStarters: number;
    hedgingLanguage: number;
    burstiness: number;
    perplexity: number;
  };
}

interface HistoryEntry {
  preview: string;
  score: number;
  verdict: string;
  date: string;
}

export default function AiTextDetector() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['ai-text-detector'][lang];
  const [text, setText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai-text-detector-history');
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  const labels: Record<string, Record<Locale, string>> = {
    placeholder: {
      en: 'Paste or type your text here (minimum 50 words recommended for accurate results)...',
      it: 'Incolla o digita il tuo testo qui (minimo 50 parole consigliato per risultati accurati)...',
      es: 'Pega o escribe tu texto aquí (mínimo 50 palabras recomendado para resultados precisos)...',
      fr: 'Collez ou tapez votre texte ici (minimum 50 mots recommandé pour des résultats précis)...',
      de: 'Fügen Sie Ihren Text hier ein (mindestens 50 Wörter empfohlen für genaue Ergebnisse)...',
      pt: 'Cole ou digite seu texto aqui (mínimo 50 palavras recomendado para resultados precisos)...',
    },
    analyze: {
      en: 'Analyze Text', it: 'Analizza Testo', es: 'Analizar Texto',
      fr: 'Analyser le Texte', de: 'Text Analysieren', pt: 'Analisar Texto',
    },
    analyzing: {
      en: 'Analyzing...', it: 'Analisi in corso...', es: 'Analizando...',
      fr: 'Analyse en cours...', de: 'Analyse läuft...', pt: 'Analisando...',
    },
    reset: {
      en: 'Reset', it: 'Cancella', es: 'Borrar',
      fr: 'Effacer', de: 'Zurücksetzen', pt: 'Limpar',
    },
    copyResults: {
      en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados',
      fr: 'Copier Résultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados',
    },
    copiedMsg: {
      en: 'Copied!', it: 'Copiato!', es: '¡Copiado!',
      fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!',
    },
    likelyHuman: {
      en: 'Likely Human-Written', it: 'Probabilmente Scritto da Umano', es: 'Probablemente Escrito por Humano',
      fr: 'Probablement Écrit par un Humain', de: 'Wahrscheinlich von Mensch Geschrieben', pt: 'Provavelmente Escrito por Humano',
    },
    mixed: {
      en: 'Mixed / Uncertain', it: 'Misto / Incerto', es: 'Mixto / Incierto',
      fr: 'Mixte / Incertain', de: 'Gemischt / Unsicher', pt: 'Misto / Incerto',
    },
    likelyAI: {
      en: 'Likely AI-Generated', it: 'Probabilmente Generato da IA', es: 'Probablemente Generado por IA',
      fr: 'Probablement Généré par IA', de: 'Wahrscheinlich KI-Generiert', pt: 'Provavelmente Gerado por IA',
    },
    detailedBreakdown: {
      en: 'Detailed Breakdown', it: 'Analisi Dettagliata', es: 'Desglose Detallado',
      fr: 'Analyse Détaillée', de: 'Detaillierte Aufschlüsselung', pt: 'Análise Detalhada',
    },
    sentenceUniformity: {
      en: 'Sentence Length Uniformity', it: 'Uniformità Lunghezza Frasi', es: 'Uniformidad de Longitud de Oraciones',
      fr: 'Uniformité de Longueur des Phrases', de: 'Satzlängen-Gleichförmigkeit', pt: 'Uniformidade de Comprimento de Frases',
    },
    sentenceUniformityDesc: {
      en: 'AI tends to write sentences of similar length. High uniformity suggests AI.', it: 'L\'IA tende a scrivere frasi di lunghezza simile. Alta uniformità suggerisce IA.', es: 'La IA tiende a escribir oraciones de longitud similar. Alta uniformidad sugiere IA.',
      fr: 'L\'IA tend à écrire des phrases de longueur similaire. Une haute uniformité suggère l\'IA.', de: 'KI neigt dazu, Sätze ähnlicher Länge zu schreiben. Hohe Gleichförmigkeit deutet auf KI hin.', pt: 'A IA tende a escrever frases de comprimento similar. Alta uniformidade sugere IA.',
    },
    vocabularyDiversity: {
      en: 'Vocabulary Diversity', it: 'Diversità Vocabolario', es: 'Diversidad de Vocabulario',
      fr: 'Diversité du Vocabulaire', de: 'Wortschatz-Vielfalt', pt: 'Diversidade de Vocabulário',
    },
    vocabularyDiversityDesc: {
      en: 'Type-token ratio measures unique word usage. Lower diversity may suggest AI.', it: 'Il rapporto tipo-token misura l\'uso di parole uniche. Bassa diversità può suggerire IA.', es: 'La proporción tipo-token mide el uso de palabras únicas. Menor diversidad puede sugerir IA.',
      fr: 'Le ratio type-token mesure l\'utilisation de mots uniques. Faible diversité peut suggérer l\'IA.', de: 'Das Typ-Token-Verhältnis misst die Verwendung einzigartiger Wörter. Geringe Vielfalt kann auf KI hindeuten.', pt: 'A proporção tipo-token mede o uso de palavras únicas. Menor diversidade pode sugerir IA.',
    },
    transitionWordFreq: {
      en: 'Transition Word Frequency', it: 'Frequenza Parole di Transizione', es: 'Frecuencia de Palabras de Transición',
      fr: 'Fréquence des Mots de Transition', de: 'Übergangswort-Häufigkeit', pt: 'Frequência de Palavras de Transição',
    },
    transitionWordFreqDesc: {
      en: 'AI overuses words like "however", "moreover", "furthermore", "additionally".', it: 'L\'IA usa eccessivamente parole come "tuttavia", "inoltre", "di conseguenza".', es: 'La IA sobreusa palabras como "sin embargo", "además", "por lo tanto".',
      fr: 'L\'IA utilise excessivement des mots comme "cependant", "de plus", "en outre".', de: 'KI verwendet Wörter wie "jedoch", "darüber hinaus", "außerdem" übermäßig.', pt: 'A IA usa excessivamente palavras como "no entanto", "além disso", "consequentemente".',
    },
    passiveVoice: {
      en: 'Passive Voice Usage', it: 'Uso della Voce Passiva', es: 'Uso de Voz Pasiva',
      fr: 'Utilisation de la Voix Passive', de: 'Passiv-Nutzung', pt: 'Uso de Voz Passiva',
    },
    passiveVoiceDesc: {
      en: 'AI often uses more passive constructions than natural human writing.', it: 'L\'IA usa spesso più costruzioni passive della scrittura umana naturale.', es: 'La IA a menudo usa más construcciones pasivas que la escritura humana natural.',
      fr: 'L\'IA utilise souvent plus de constructions passives que l\'écriture humaine naturelle.', de: 'KI verwendet oft mehr passive Konstruktionen als natürliches menschliches Schreiben.', pt: 'A IA frequentemente usa mais construções passivas que a escrita humana natural.',
    },
    avgWordLength: {
      en: 'Average Word Length', it: 'Lunghezza Media Parole', es: 'Longitud Media de Palabras',
      fr: 'Longueur Moyenne des Mots', de: 'Durchschnittliche Wortlänge', pt: 'Comprimento Médio de Palavras',
    },
    avgWordLengthDesc: {
      en: 'AI tends to use more consistently medium-length words.', it: 'L\'IA tende a usare parole di lunghezza media più costante.', es: 'La IA tiende a usar palabras de longitud media más consistente.',
      fr: 'L\'IA tend à utiliser des mots de longueur moyenne plus constante.', de: 'KI neigt dazu, konsistenter mittellange Wörter zu verwenden.', pt: 'A IA tende a usar palavras de comprimento médio mais consistente.',
    },
    paragraphConsistency: {
      en: 'Paragraph Structure Consistency', it: 'Consistenza Struttura Paragrafi', es: 'Consistencia de Estructura de Párrafos',
      fr: 'Cohérence de Structure des Paragraphes', de: 'Absatz-Struktur-Konsistenz', pt: 'Consistência de Estrutura de Parágrafos',
    },
    paragraphConsistencyDesc: {
      en: 'AI produces paragraphs of very similar length and structure.', it: 'L\'IA produce paragrafi di lunghezza e struttura molto simili.', es: 'La IA produce párrafos de longitud y estructura muy similares.',
      fr: 'L\'IA produit des paragraphes de longueur et structure très similaires.', de: 'KI produziert Absätze sehr ähnlicher Länge und Struktur.', pt: 'A IA produz parágrafos de comprimento e estrutura muito semelhantes.',
    },
    repetitiveStarters: {
      en: 'Repetitive Sentence Starters', it: 'Inizi Frasi Ripetitivi', es: 'Inicios de Oraciones Repetitivos',
      fr: 'Débuts de Phrases Répétitifs', de: 'Wiederholende Satzanfänge', pt: 'Inícios de Frases Repetitivos',
    },
    repetitiveStartersDesc: {
      en: 'AI often starts sentences with the same patterns repeatedly.', it: 'L\'IA spesso inizia le frasi con gli stessi schemi ripetutamente.', es: 'La IA a menudo comienza oraciones con los mismos patrones repetidamente.',
      fr: 'L\'IA commence souvent les phrases avec les mêmes schémas de manière répétée.', de: 'KI beginnt Sätze oft wiederholt mit denselben Mustern.', pt: 'A IA frequentemente começa frases com os mesmos padrões repetidamente.',
    },
    hedgingLanguage: {
      en: 'Hedging Language', it: 'Linguaggio Attenuante', es: 'Lenguaje Atenuante',
      fr: 'Langage de Prudence', de: 'Abschwächende Sprache', pt: 'Linguagem Atenuante',
    },
    hedgingLanguageDesc: {
      en: 'AI uses phrases like "it is important to note" and "it\'s worth mentioning" frequently.', it: 'L\'IA usa spesso frasi come "è importante notare" e "vale la pena menzionare".', es: 'La IA usa frases como "es importante señalar" y "vale la pena mencionar" con frecuencia.',
      fr: 'L\'IA utilise fréquemment des phrases comme "il est important de noter" et "il convient de mentionner".', de: 'KI verwendet häufig Phrasen wie "es ist wichtig zu beachten" und "es ist erwähnenswert".', pt: 'A IA usa frases como "é importante notar" e "vale a pena mencionar" com frequência.',
    },
    burstiness: {
      en: 'Burstiness Score', it: 'Punteggio di Burstiness', es: 'Puntuación de Burstiness',
      fr: 'Score de Variabilité', de: 'Burstiness-Bewertung', pt: 'Pontuação de Burstiness',
    },
    burstinessDesc: {
      en: 'Measures variation in sentence complexity. Humans write with more bursts of complexity.', it: 'Misura la variazione nella complessità delle frasi. Gli umani scrivono con più variazioni.', es: 'Mide la variación en la complejidad de oraciones. Los humanos escriben con más variación.',
      fr: 'Mesure la variation de la complexité des phrases. Les humains écrivent avec plus de variations.', de: 'Misst die Variation der Satzkomplexität. Menschen schreiben mit mehr Komplexitätsschwankungen.', pt: 'Mede a variação na complexidade das frases. Humanos escrevem com mais variação.',
    },
    perplexity: {
      en: 'Perplexity Estimate', it: 'Stima di Perplessità', es: 'Estimación de Perplejidad',
      fr: 'Estimation de Perplexité', de: 'Perplexitäts-Schätzung', pt: 'Estimativa de Perplexidade',
    },
    perplexityDesc: {
      en: 'Estimates word predictability. AI text tends to have lower perplexity (more predictable).', it: 'Stima la prevedibilità delle parole. Il testo IA tende ad avere bassa perplessità (più prevedibile).', es: 'Estima la previsibilidad de palabras. El texto IA tiende a tener menor perplejidad (más predecible).',
      fr: 'Estime la prévisibilité des mots. Le texte IA tend à avoir une faible perplexité (plus prévisible).', de: 'Schätzt die Wortvorhersagbarkeit. KI-Text hat tendenziell eine niedrigere Perplexität (vorhersagbarer).', pt: 'Estima a previsibilidade de palavras. O texto IA tende a ter menor perplexidade (mais previsível).',
    },
    wordCount: {
      en: 'Words', it: 'Parole', es: 'Palabras',
      fr: 'Mots', de: 'Wörter', pt: 'Palavras',
    },
    minWordsWarning: {
      en: 'Please enter at least 50 words for a meaningful analysis.', it: 'Inserisci almeno 50 parole per un\'analisi significativa.', es: 'Ingresa al menos 50 palabras para un análisis significativo.',
      fr: 'Veuillez saisir au moins 50 mots pour une analyse significative.', de: 'Bitte geben Sie mindestens 50 Wörter für eine aussagekräftige Analyse ein.', pt: 'Insira pelo menos 50 palavras para uma análise significativa.',
    },
    emptyError: {
      en: 'Please enter some text first.', it: 'Inserisci prima del testo.', es: 'Por favor, ingresa texto primero.',
      fr: 'Veuillez d\'abord saisir du texte.', de: 'Bitte geben Sie zuerst einen Text ein.', pt: 'Por favor, insira algum texto primeiro.',
    },
    disclaimer: {
      en: 'Disclaimer: This tool uses heuristic analysis, not a real AI model. Results are approximate and should not be considered 100% accurate. Use as a general indicator only.',
      it: 'Avvertenza: Questo strumento usa analisi euristica, non un vero modello IA. I risultati sono approssimativi e non devono essere considerati accurati al 100%. Usare solo come indicatore generale.',
      es: 'Aviso: Esta herramienta usa análisis heurístico, no un modelo IA real. Los resultados son aproximados y no deben considerarse 100% precisos. Úselo solo como indicador general.',
      fr: 'Avertissement : Cet outil utilise une analyse heuristique, pas un vrai modèle IA. Les résultats sont approximatifs et ne doivent pas être considérés comme 100% précis. À utiliser comme indicateur général uniquement.',
      de: 'Haftungsausschluss: Dieses Tool verwendet heuristische Analyse, kein echtes KI-Modell. Die Ergebnisse sind Näherungswerte und sollten nicht als 100% genau betrachtet werden. Nur als allgemeiner Indikator verwenden.',
      pt: 'Aviso: Esta ferramenta usa análise heurística, não um modelo IA real. Os resultados são aproximados e não devem ser considerados 100% precisos. Use apenas como indicador geral.',
    },
    history: {
      en: 'Recent Analyses', it: 'Analisi Recenti', es: 'Análisis Recientes',
      fr: 'Analyses Récentes', de: 'Letzte Analysen', pt: 'Análises Recentes',
    },
    noHistory: {
      en: 'No saved analyses yet.', it: 'Nessuna analisi salvata.', es: 'Sin análisis guardados.',
      fr: 'Aucune analyse sauvegardée.', de: 'Noch keine gespeicherten Analysen.', pt: 'Nenhuma análise salva ainda.',
    },
    aiScore: {
      en: 'AI Probability', it: 'Probabilità IA', es: 'Probabilidad IA',
      fr: 'Probabilité IA', de: 'KI-Wahrscheinlichkeit', pt: 'Probabilidade IA',
    },
  };

  const getSentences = (t: string): string[] => {
    return t.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  };

  const getWords = (t: string): string[] => {
    return t.trim().split(/\s+/).filter(w => w.length > 0);
  };

  const analyzeText = useCallback(() => {
    if (!text.trim()) {
      setError(labels.emptyError[lang]);
      setTimeout(() => setError(''), 3000);
      return;
    }

    const words = getWords(text);
    if (words.length < 50) {
      setError(labels.minWordsWarning[lang]);
      setTimeout(() => setError(''), 3000);
      return;
    }

    setAnalyzing(true);
    setError('');

    // Simulate brief processing time
    setTimeout(() => {
      const sentences = getSentences(text);
      const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

      // 1. Sentence Length Uniformity (AI = high uniformity = high score)
      const sentLengths = sentences.map(s => s.split(/\s+/).length);
      const avgSentLen = sentLengths.reduce((a, b) => a + b, 0) / sentLengths.length;
      const sentStdDev = Math.sqrt(sentLengths.reduce((sum, l) => sum + Math.pow(l - avgSentLen, 2), 0) / sentLengths.length);
      const coeffOfVariation = avgSentLen > 0 ? sentStdDev / avgSentLen : 0;
      // Low CV = uniform = more AI-like. CV < 0.2 is very uniform, > 0.5 is very varied
      const sentenceUniformity = Math.min(100, Math.max(0, (1 - coeffOfVariation) * 100));

      // 2. Vocabulary Diversity (TTR) - Lower TTR = less diverse = more AI-like
      const cleanWords = words.map(w => w.toLowerCase().replace(/[^a-zA-ZÀ-ÿ]/g, '')).filter(w => w.length > 0);
      const uniqueWords = new Set(cleanWords).size;
      const ttr = cleanWords.length > 0 ? uniqueWords / cleanWords.length : 1;
      // Adjust for text length (TTR naturally decreases with length)
      const adjustedTTR = ttr * Math.pow(cleanWords.length / 100, 0.15);
      const vocabularyDiversity = Math.min(100, Math.max(0, (1 - Math.min(1, adjustedTTR)) * 100));

      // 3. Transition Word Frequency
      const transitionWords = [
        'however', 'moreover', 'furthermore', 'additionally', 'consequently',
        'nevertheless', 'therefore', 'thus', 'hence', 'accordingly',
        'specifically', 'essentially', 'ultimately', 'notably', 'importantly',
        'significantly', 'particularly', 'indeed', 'certainly', 'clearly',
        'overall', 'in conclusion', 'in summary', 'as a result', 'on the other hand',
        'in addition', 'for instance', 'for example', 'in fact', 'as such',
      ];
      const lowerText = text.toLowerCase();
      let transitionCount = 0;
      transitionWords.forEach(tw => {
        const regex = new RegExp('\\b' + tw.replace(/\s+/g, '\\s+') + '\\b', 'gi');
        const matches = lowerText.match(regex);
        if (matches) transitionCount += matches.length;
      });
      const transitionRatio = sentences.length > 0 ? transitionCount / sentences.length : 0;
      // AI typically has transition ratio > 0.3 per sentence
      const transitionWordFreq = Math.min(100, Math.max(0, transitionRatio * 200));

      // 4. Passive Voice Percentage
      const passivePatterns = [
        /\b(?:is|are|was|were|been|being|be)\s+\w+ed\b/gi,
        /\b(?:is|are|was|were|been|being|be)\s+\w+en\b/gi,
        /\b(?:is|are|was|were|been|being|be)\s+(?:made|done|taken|given|shown|known|found|said|told|seen|left|held|brought|set|run|kept|put)\b/gi,
      ];
      let passiveCount = 0;
      passivePatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) passiveCount += matches.length;
      });
      const passiveRatio = sentences.length > 0 ? passiveCount / sentences.length : 0;
      const passiveVoice = Math.min(100, Math.max(0, passiveRatio * 250));

      // 5. Average Word Length consistency
      const wordLengths = cleanWords.map(w => w.length);
      const avgWL = wordLengths.reduce((a, b) => a + b, 0) / wordLengths.length;
      const wlStdDev = Math.sqrt(wordLengths.reduce((sum, l) => sum + Math.pow(l - avgWL, 2), 0) / wordLengths.length);
      // AI text tends to have lower word-length variation (std dev around 2.0-2.5 vs human 2.5-3.5)
      const avgWordLengthScore = Math.min(100, Math.max(0, (1 - (wlStdDev - 1.5) / 3) * 70));

      // 6. Paragraph Structure Consistency
      let paragraphConsistency = 50;
      if (paragraphs.length >= 2) {
        const paraLengths = paragraphs.map(p => p.split(/\s+/).length);
        const avgParaLen = paraLengths.reduce((a, b) => a + b, 0) / paraLengths.length;
        const paraStdDev = Math.sqrt(paraLengths.reduce((sum, l) => sum + Math.pow(l - avgParaLen, 2), 0) / paraLengths.length);
        const paraCV = avgParaLen > 0 ? paraStdDev / avgParaLen : 0;
        paragraphConsistency = Math.min(100, Math.max(0, (1 - paraCV) * 100));
      }

      // 7. Repetitive Sentence Starters
      const starters = sentences.map(s => {
        const w = s.trim().split(/\s+/);
        return w.slice(0, Math.min(2, w.length)).join(' ').toLowerCase();
      });
      const starterFreq: Record<string, number> = {};
      starters.forEach(s => { starterFreq[s] = (starterFreq[s] || 0) + 1; });
      const repeatedStarters = Object.values(starterFreq).filter(c => c > 1).reduce((a, b) => a + b, 0);
      const repetitiveStarters = Math.min(100, Math.max(0, (repeatedStarters / Math.max(1, sentences.length)) * 200));

      // 8. Hedging Language
      const hedgingPhrases = [
        'it is important to note', 'it\'s important to note', 'it is worth mentioning',
        'it\'s worth mentioning', 'it should be noted', 'it is worth noting',
        'it\'s worth noting', 'one might argue', 'it can be said',
        'it is essential to', 'it\'s essential to', 'it is crucial to',
        'it\'s crucial to', 'it goes without saying', 'needless to say',
        'in today\'s world', 'in the modern world', 'in this day and age',
        'when it comes to', 'at the end of the day', 'in the realm of',
        'it is also important', 'plays a crucial role', 'plays a vital role',
        'plays an important role', 'serves as a', 'it is widely known',
      ];
      let hedgingCount = 0;
      hedgingPhrases.forEach(hp => {
        const regex = new RegExp(hp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = lowerText.match(regex);
        if (matches) hedgingCount += matches.length;
      });
      const hedgingRatio = sentences.length > 0 ? hedgingCount / sentences.length : 0;
      const hedgingLanguage = Math.min(100, Math.max(0, hedgingRatio * 500));

      // 9. Burstiness Score (variation in sentence complexity)
      // Complexity = (word count * avg word length) per sentence
      const sentComplexities = sentences.map(s => {
        const sw = s.split(/\s+/).filter(w => w.length > 0);
        const swAvgLen = sw.length > 0 ? sw.reduce((a, b) => a + b.length, 0) / sw.length : 0;
        return sw.length * swAvgLen;
      });
      const avgComplexity = sentComplexities.reduce((a, b) => a + b, 0) / Math.max(1, sentComplexities.length);
      const complexityStdDev = Math.sqrt(sentComplexities.reduce((sum, c) => sum + Math.pow(c - avgComplexity, 2), 0) / Math.max(1, sentComplexities.length));
      const complexityCV = avgComplexity > 0 ? complexityStdDev / avgComplexity : 0;
      // Low burstiness (low CV) = more AI-like
      const burstiness = Math.min(100, Math.max(0, (1 - Math.min(1, complexityCV)) * 100));

      // 10. Perplexity Estimate (word predictability based on common patterns)
      // Use bigram repetition as a proxy for predictability
      const bigrams: string[] = [];
      for (let i = 0; i < cleanWords.length - 1; i++) {
        bigrams.push(cleanWords[i] + ' ' + cleanWords[i + 1]);
      }
      const uniqueBigrams = new Set(bigrams).size;
      const bigramRatio = bigrams.length > 0 ? uniqueBigrams / bigrams.length : 1;
      // Low bigram ratio = more predictable = more AI-like
      const perplexity = Math.min(100, Math.max(0, (1 - bigramRatio) * 150));

      const metrics = {
        sentenceUniformity: Math.round(sentenceUniformity),
        vocabularyDiversity: Math.round(vocabularyDiversity),
        transitionWordFreq: Math.round(transitionWordFreq),
        passiveVoice: Math.round(passiveVoice),
        avgWordLength: Math.round(avgWordLengthScore),
        paragraphConsistency: Math.round(paragraphConsistency),
        repetitiveStarters: Math.round(repetitiveStarters),
        hedgingLanguage: Math.round(hedgingLanguage),
        burstiness: Math.round(burstiness),
        perplexity: Math.round(perplexity),
      };

      // Weighted overall score
      const weights = {
        sentenceUniformity: 0.12,
        vocabularyDiversity: 0.08,
        transitionWordFreq: 0.15,
        passiveVoice: 0.08,
        avgWordLength: 0.05,
        paragraphConsistency: 0.10,
        repetitiveStarters: 0.10,
        hedgingLanguage: 0.15,
        burstiness: 0.10,
        perplexity: 0.07,
      };

      const overallScore = Math.round(
        Object.entries(weights).reduce((sum, [key, weight]) => {
          return sum + metrics[key as keyof typeof metrics] * weight;
        }, 0)
      );

      const clampedScore = Math.min(100, Math.max(0, overallScore));
      const verdict: 'human' | 'mixed' | 'ai' = clampedScore < 35 ? 'human' : clampedScore < 65 ? 'mixed' : 'ai';

      const analysisResult: AnalysisResult = { overallScore: clampedScore, verdict, metrics };
      setResult(analysisResult);

      // Save to history
      const newEntry: HistoryEntry = {
        preview: text.substring(0, 60) + (text.length > 60 ? '...' : ''),
        score: clampedScore,
        verdict,
        date: new Date().toLocaleDateString(),
      };
      const newHistory = [newEntry, ...history].slice(0, 10);
      setHistory(newHistory);
      try {
        localStorage.setItem('ai-text-detector-history', JSON.stringify(newHistory));
      } catch {}

      setAnalyzing(false);
    }, 800);
  }, [text, lang, history, labels]);

  const handleCopy = async () => {
    if (!result) return;
    const verdictLabel = result.verdict === 'human' ? labels.likelyHuman[lang] :
      result.verdict === 'mixed' ? labels.mixed[lang] : labels.likelyAI[lang];

    const metricsText = [
      `${labels.sentenceUniformity[lang]}: ${result.metrics.sentenceUniformity}%`,
      `${labels.vocabularyDiversity[lang]}: ${result.metrics.vocabularyDiversity}%`,
      `${labels.transitionWordFreq[lang]}: ${result.metrics.transitionWordFreq}%`,
      `${labels.passiveVoice[lang]}: ${result.metrics.passiveVoice}%`,
      `${labels.avgWordLength[lang]}: ${result.metrics.avgWordLength}%`,
      `${labels.paragraphConsistency[lang]}: ${result.metrics.paragraphConsistency}%`,
      `${labels.repetitiveStarters[lang]}: ${result.metrics.repetitiveStarters}%`,
      `${labels.hedgingLanguage[lang]}: ${result.metrics.hedgingLanguage}%`,
      `${labels.burstiness[lang]}: ${result.metrics.burstiness}%`,
      `${labels.perplexity[lang]}: ${result.metrics.perplexity}%`,
    ].join('\n');

    const output = `AI Text Detector Results\n${verdictLabel}: ${result.overallScore}%\n\n${metricsText}`;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setText('');
    setResult(null);
    setError('');
  };

  const wordCount = getWords(text).length;

  const getVerdictColor = (verdict: string) => {
    if (verdict === 'human') return { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', ring: 'stroke-green-500', fill: 'text-green-500' };
    if (verdict === 'mixed') return { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700', ring: 'stroke-yellow-500', fill: 'text-yellow-500' };
    return { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', ring: 'stroke-red-500', fill: 'text-red-500' };
  };

  const getMetricColor = (score: number) => {
    if (score < 35) return 'bg-green-500';
    if (score < 65) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMetricBg = (score: number) => {
    if (score < 35) return 'bg-green-50 border-green-200';
    if (score < 65) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  // Circular gauge SVG
  const renderGauge = (score: number, verdict: string) => {
    const colors = getVerdictColor(verdict);
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
          <circle cx="90" cy="90" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="12" />
          <circle
            cx="90" cy="90" r={radius} fill="none"
            className={colors.ring}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center" style={{ marginTop: '40px' }}>
          <span className={`text-4xl font-bold ${colors.fill}`}>{score}%</span>
          <span className={`text-sm font-medium ${colors.text} mt-1`}>{labels.aiScore[lang]}</span>
        </div>
      </div>
    );
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free AI Text Detector — Analyze Text for AI-Generated Patterns',
      paragraphs: [
        'As AI-generated content becomes more prevalent, the ability to distinguish between human and machine-written text is increasingly important. Our free AI Text Detector uses advanced heuristic analysis to evaluate writing patterns and provide an estimate of whether a given text was likely written by a human or generated by an AI language model such as ChatGPT, Claude, or Gemini.',
        'The tool examines ten distinct linguistic features: sentence length uniformity, vocabulary diversity (type-token ratio), transition word frequency, passive voice usage, average word length consistency, paragraph structure consistency, repetitive sentence starters, hedging language patterns, burstiness (variation in sentence complexity), and a perplexity estimate based on word predictability. Each metric is scored independently and combined into a weighted overall probability score.',
        'AI-generated text tends to exhibit certain telltale patterns: sentences of remarkably uniform length, overuse of transition words like "however" and "moreover," formulaic phrases such as "it is important to note," and consistent paragraph structures. Human writing, by contrast, naturally varies in sentence length, uses more diverse vocabulary, and displays greater "burstiness" — alternating between simple and complex sentences.',
        'This tool runs entirely in your browser with no data sent to any server, ensuring complete privacy. While heuristic analysis cannot match the accuracy of deep learning models trained on millions of examples, it provides a useful first-pass indicator. Use it to screen content, flag potentially AI-generated submissions, or simply explore how your own writing compares to typical AI output patterns.',
      ],
      faq: [
        { q: 'How accurate is this AI text detector?', a: 'This tool uses heuristic analysis (pattern matching) rather than a trained AI model, so it is a general indicator, not a definitive classifier. It works best on English text of 100+ words and can identify common AI writing patterns, but it may produce false positives or negatives. Use it as one of several signals, not as the sole determinant.' },
        { q: 'What languages does this tool support?', a: 'The heuristic patterns (transition words, passive voice detection, hedging phrases) are primarily calibrated for English text. While sentence uniformity, vocabulary diversity, and burstiness metrics work across languages, the results are most accurate for English content.' },
        { q: 'Is my text stored or sent to a server?', a: 'No. All processing happens entirely in your browser using JavaScript. Your text never leaves your device, ensuring complete privacy. Analysis history is stored only in your browser\'s localStorage.' },
        { q: 'What is the minimum text length recommended?', a: 'We recommend at least 50 words for the tool to function, but 100-300+ words will yield more reliable results. Very short texts do not provide enough statistical data for meaningful pattern analysis.' },
        { q: 'Can AI-written text be edited to fool this detector?', a: 'Yes. If someone edits AI-generated text to add variety in sentence length, reduce transition words, and introduce more natural language patterns, the detector may classify it as human-written. This tool detects patterns, not origin.' },
      ],
    },
    it: {
      title: 'Rilevatore di Testo IA Gratuito — Analizza il Testo per Modelli Generati da IA',
      paragraphs: [
        'Con la crescente diffusione dei contenuti generati dall\'IA, la capacità di distinguere tra testo scritto da umani e da macchine è sempre più importante. Il nostro Rilevatore di Testo IA gratuito utilizza un\'analisi euristica avanzata per valutare i modelli di scrittura e fornire una stima se un dato testo è stato probabilmente scritto da un umano o generato da un modello linguistico IA come ChatGPT, Claude o Gemini.',
        'Lo strumento esamina dieci caratteristiche linguistiche distinte: uniformità della lunghezza delle frasi, diversità del vocabolario (rapporto tipo-token), frequenza delle parole di transizione, uso della voce passiva, consistenza della lunghezza media delle parole, consistenza della struttura dei paragrafi, inizi di frasi ripetitivi, pattern di linguaggio attenuante, burstiness (variazione nella complessità delle frasi) e una stima della perplessità basata sulla prevedibilità delle parole.',
        'Il testo generato dall\'IA tende a esibire certi modelli rivelatori: frasi di lunghezza notevolmente uniforme, uso eccessivo di parole di transizione, frasi formulaiche e strutture di paragrafi consistenti. La scrittura umana, al contrario, varia naturalmente nella lunghezza delle frasi, usa un vocabolario più diversificato e mostra una maggiore "burstiness".',
        'Questo strumento funziona interamente nel tuo browser senza inviare dati a nessun server, garantendo completa privacy. Sebbene l\'analisi euristica non possa eguagliare la precisione dei modelli di deep learning, fornisce un utile indicatore di primo livello per analizzare contenuti potenzialmente generati da IA.',
      ],
      faq: [
        { q: 'Quanto è accurato questo rilevatore di testo IA?', a: 'Questo strumento usa analisi euristica (corrispondenza di pattern) piuttosto che un modello IA addestrato, quindi è un indicatore generale, non un classificatore definitivo. Funziona meglio su testi inglesi di oltre 100 parole. Usalo come uno dei vari segnali, non come unico determinante.' },
        { q: 'Quali lingue supporta questo strumento?', a: 'I pattern euristici sono principalmente calibrati per il testo inglese. Mentre le metriche di uniformità delle frasi, diversità del vocabolario e burstiness funzionano in diverse lingue, i risultati sono più accurati per i contenuti in inglese.' },
        { q: 'Il mio testo viene salvato o inviato a un server?', a: 'No. Tutta l\'elaborazione avviene interamente nel tuo browser tramite JavaScript. Il tuo testo non lascia mai il tuo dispositivo, garantendo completa privacy.' },
        { q: 'Qual è la lunghezza minima del testo consigliata?', a: 'Raccomandiamo almeno 50 parole per il funzionamento, ma 100-300+ parole forniranno risultati più affidabili.' },
        { q: 'Il testo scritto da IA può essere modificato per ingannare questo rilevatore?', a: 'Sì. Se qualcuno modifica il testo generato dall\'IA per aggiungere varietà nella lunghezza delle frasi e ridurre le parole di transizione, il rilevatore potrebbe classificarlo come scritto da umano.' },
      ],
    },
    es: {
      title: 'Detector de Texto IA Gratuito — Analiza Texto en Busca de Patrones de IA',
      paragraphs: [
        'A medida que el contenido generado por IA se vuelve más común, la capacidad de distinguir entre texto escrito por humanos y máquinas es cada vez más importante. Nuestro Detector de Texto IA gratuito utiliza análisis heurístico avanzado para evaluar patrones de escritura y proporcionar una estimación de si un texto fue probablemente escrito por un humano o generado por un modelo de lenguaje IA como ChatGPT, Claude o Gemini.',
        'La herramienta examina diez características lingüísticas distintas: uniformidad en la longitud de oraciones, diversidad de vocabulario (proporción tipo-token), frecuencia de palabras de transición, uso de voz pasiva, consistencia en la longitud media de palabras, consistencia en la estructura de párrafos, inicios de oraciones repetitivos, patrones de lenguaje atenuante, burstiness (variación en la complejidad de oraciones) y una estimación de perplejidad basada en la previsibilidad de palabras.',
        'El texto generado por IA tiende a exhibir ciertos patrones reveladores: oraciones de longitud notablemente uniforme, uso excesivo de palabras de transición, frases formulaicas y estructuras de párrafos consistentes. La escritura humana, por el contrario, varía naturalmente en la longitud de las oraciones y muestra mayor variabilidad.',
        'Esta herramienta funciona completamente en tu navegador sin enviar datos a ningún servidor, garantizando privacidad total. Aunque el análisis heurístico no puede igualar la precisión de los modelos de deep learning, proporciona un indicador útil de primer nivel.',
      ],
      faq: [
        { q: '¿Qué tan preciso es este detector de texto IA?', a: 'Esta herramienta usa análisis heurístico (coincidencia de patrones) en lugar de un modelo IA entrenado, por lo que es un indicador general, no un clasificador definitivo. Funciona mejor con textos en inglés de más de 100 palabras.' },
        { q: '¿Qué idiomas soporta esta herramienta?', a: 'Los patrones heurísticos están calibrados principalmente para texto en inglés. Las métricas de uniformidad de oraciones y diversidad de vocabulario funcionan en varios idiomas, pero los resultados son más precisos para contenido en inglés.' },
        { q: '¿Mi texto se almacena o se envía a un servidor?', a: 'No. Todo el procesamiento ocurre completamente en tu navegador usando JavaScript. Tu texto nunca sale de tu dispositivo.' },
        { q: '¿Cuál es la longitud mínima de texto recomendada?', a: 'Recomendamos al menos 50 palabras para que funcione, pero 100-300+ palabras darán resultados más confiables.' },
        { q: '¿Puede el texto escrito por IA ser editado para engañar al detector?', a: 'Sí. Si alguien edita el texto generado por IA para agregar variedad en la longitud de oraciones y reducir palabras de transición, el detector podría clasificarlo como escrito por humano.' },
      ],
    },
    fr: {
      title: 'Détecteur de Texte IA Gratuit — Analysez le Texte pour des Modèles Générés par IA',
      paragraphs: [
        'Alors que le contenu généré par l\'IA devient de plus en plus répandu, la capacité de distinguer entre un texte écrit par un humain et une machine est de plus en plus importante. Notre Détecteur de Texte IA gratuit utilise une analyse heuristique avancée pour évaluer les modèles d\'écriture et fournir une estimation indiquant si un texte donné a probablement été écrit par un humain ou généré par un modèle de langage IA comme ChatGPT, Claude ou Gemini.',
        'L\'outil examine dix caractéristiques linguistiques distinctes : l\'uniformité de la longueur des phrases, la diversité du vocabulaire (ratio type-token), la fréquence des mots de transition, l\'utilisation de la voix passive, la cohérence de la longueur moyenne des mots, la cohérence de la structure des paragraphes, les débuts de phrases répétitifs, les modèles de langage de prudence, la variabilité et une estimation de la perplexité.',
        'Le texte généré par l\'IA tend à présenter certains modèles révélateurs : des phrases de longueur remarquablement uniforme, une utilisation excessive de mots de transition, des phrases formulaïques et des structures de paragraphes cohérentes. L\'écriture humaine, en revanche, varie naturellement dans la longueur des phrases et affiche une plus grande variabilité.',
        'Cet outil fonctionne entièrement dans votre navigateur sans envoyer de données à aucun serveur, garantissant une confidentialité totale. Bien que l\'analyse heuristique ne puisse égaler la précision des modèles de deep learning, elle fournit un indicateur utile de premier niveau.',
      ],
      faq: [
        { q: 'Quelle est la précision de ce détecteur de texte IA ?', a: 'Cet outil utilise une analyse heuristique (correspondance de motifs) plutôt qu\'un modèle IA entraîné, c\'est donc un indicateur général, pas un classificateur définitif. Il fonctionne mieux sur les textes anglais de plus de 100 mots.' },
        { q: 'Quelles langues cet outil prend-il en charge ?', a: 'Les modèles heuristiques sont principalement calibrés pour le texte anglais. Les métriques d\'uniformité des phrases et de diversité du vocabulaire fonctionnent dans plusieurs langues, mais les résultats sont plus précis pour le contenu anglais.' },
        { q: 'Mon texte est-il stocké ou envoyé à un serveur ?', a: 'Non. Tout le traitement se fait entièrement dans votre navigateur via JavaScript. Votre texte ne quitte jamais votre appareil.' },
        { q: 'Quelle est la longueur minimale de texte recommandée ?', a: 'Nous recommandons au moins 50 mots pour le fonctionnement, mais 100-300+ mots donneront des résultats plus fiables.' },
        { q: 'Le texte écrit par l\'IA peut-il être modifié pour tromper ce détecteur ?', a: 'Oui. Si quelqu\'un modifie le texte généré par l\'IA pour ajouter de la variété dans la longueur des phrases et réduire les mots de transition, le détecteur pourrait le classer comme écrit par un humain.' },
      ],
    },
    de: {
      title: 'Kostenloser KI-Textdetektor — Text auf KI-generierte Muster Analysieren',
      paragraphs: [
        'Da KI-generierte Inhalte immer häufiger werden, ist die Fähigkeit, zwischen von Menschen und Maschinen geschriebenem Text zu unterscheiden, zunehmend wichtig. Unser kostenloser KI-Textdetektor verwendet fortgeschrittene heuristische Analyse, um Schreibmuster zu bewerten und eine Einschätzung zu geben, ob ein gegebener Text wahrscheinlich von einem Menschen geschrieben oder von einem KI-Sprachmodell wie ChatGPT, Claude oder Gemini generiert wurde.',
        'Das Tool untersucht zehn verschiedene sprachliche Merkmale: Satzlängen-Gleichförmigkeit, Wortschatz-Vielfalt (Typ-Token-Verhältnis), Häufigkeit von Übergangswörtern, Passiv-Nutzung, Konsistenz der durchschnittlichen Wortlänge, Absatz-Struktur-Konsistenz, wiederholende Satzanfänge, abschwächende Sprachmuster, Burstiness (Variation der Satzkomplexität) und eine Perplexitäts-Schätzung basierend auf Wortvorhersagbarkeit.',
        'KI-generierter Text neigt dazu, bestimmte verräterische Muster aufzuweisen: Sätze von bemerkenswert einheitlicher Länge, übermäßige Verwendung von Übergangswörtern, formelhafte Phrasen und konsistente Absatzstrukturen. Menschliches Schreiben variiert dagegen natürlich in der Satzlänge und zeigt größere Variabilität.',
        'Dieses Tool läuft vollständig in Ihrem Browser, ohne Daten an einen Server zu senden, und gewährleistet so vollständige Privatsphäre. Obwohl die heuristische Analyse nicht die Genauigkeit von Deep-Learning-Modellen erreichen kann, bietet sie einen nützlichen Erstindikator.',
      ],
      faq: [
        { q: 'Wie genau ist dieser KI-Textdetektor?', a: 'Dieses Tool verwendet heuristische Analyse (Mustererkennung) statt eines trainierten KI-Modells, daher ist es ein allgemeiner Indikator, kein definitiver Klassifikator. Es funktioniert am besten mit englischen Texten von über 100 Wörtern.' },
        { q: 'Welche Sprachen unterstützt dieses Tool?', a: 'Die heuristischen Muster sind hauptsächlich für englischen Text kalibriert. Die Metriken für Satzuniformität und Wortschatzvielfalt funktionieren sprachübergreifend, aber die Ergebnisse sind für englische Inhalte am genauesten.' },
        { q: 'Wird mein Text gespeichert oder an einen Server gesendet?', a: 'Nein. Die gesamte Verarbeitung erfolgt vollständig in Ihrem Browser mittels JavaScript. Ihr Text verlässt niemals Ihr Gerät.' },
        { q: 'Welche Mindest-Textlänge wird empfohlen?', a: 'Wir empfehlen mindestens 50 Wörter für die Funktion, aber 100-300+ Wörter liefern zuverlässigere Ergebnisse.' },
        { q: 'Kann KI-geschriebener Text bearbeitet werden, um diesen Detektor zu täuschen?', a: 'Ja. Wenn jemand KI-generierten Text bearbeitet, um Vielfalt in der Satzlänge hinzuzufügen und Übergangswörter zu reduzieren, könnte der Detektor ihn als von Menschen geschrieben klassifizieren.' },
      ],
    },
    pt: {
      title: 'Detector de Texto IA Gratuito — Analise Texto em Busca de Padrões de IA',
      paragraphs: [
        'À medida que o conteúdo gerado por IA se torna mais comum, a capacidade de distinguir entre texto escrito por humanos e máquinas é cada vez mais importante. Nosso Detector de Texto IA gratuito utiliza análise heurística avançada para avaliar padrões de escrita e fornecer uma estimativa se um determinado texto foi provavelmente escrito por um humano ou gerado por um modelo de linguagem IA como ChatGPT, Claude ou Gemini.',
        'A ferramenta examina dez características linguísticas distintas: uniformidade no comprimento de frases, diversidade de vocabulário (proporção tipo-token), frequência de palavras de transição, uso de voz passiva, consistência no comprimento médio de palavras, consistência na estrutura de parágrafos, inícios de frases repetitivos, padrões de linguagem atenuante, burstiness (variação na complexidade das frases) e uma estimativa de perplexidade baseada na previsibilidade de palavras.',
        'O texto gerado por IA tende a exibir certos padrões reveladores: frases de comprimento notavelmente uniforme, uso excessivo de palavras de transição, frases formulaicas e estruturas de parágrafos consistentes. A escrita humana, por contraste, varia naturalmente no comprimento das frases e apresenta maior variabilidade.',
        'Esta ferramenta funciona inteiramente no seu navegador sem enviar dados a nenhum servidor, garantindo privacidade total. Embora a análise heurística não possa igualar a precisão dos modelos de deep learning, fornece um indicador útil de primeiro nível.',
      ],
      faq: [
        { q: 'Quão preciso é este detector de texto IA?', a: 'Esta ferramenta usa análise heurística (correspondência de padrões) em vez de um modelo IA treinado, portanto é um indicador geral, não um classificador definitivo. Funciona melhor com textos em inglês de mais de 100 palavras.' },
        { q: 'Quais idiomas esta ferramenta suporta?', a: 'Os padrões heurísticos são calibrados principalmente para texto em inglês. As métricas de uniformidade de frases e diversidade de vocabulário funcionam em vários idiomas, mas os resultados são mais precisos para conteúdo em inglês.' },
        { q: 'Meu texto é armazenado ou enviado para um servidor?', a: 'Não. Todo o processamento acontece inteiramente no seu navegador usando JavaScript. Seu texto nunca sai do seu dispositivo.' },
        { q: 'Qual é o comprimento mínimo de texto recomendado?', a: 'Recomendamos pelo menos 50 palavras para o funcionamento, mas 100-300+ palavras fornecerão resultados mais confiáveis.' },
        { q: 'O texto escrito por IA pode ser editado para enganar o detector?', a: 'Sim. Se alguém editar o texto gerado por IA para adicionar variedade no comprimento das frases e reduzir palavras de transição, o detector pode classificá-lo como escrito por humano.' },
      ],
    },
  };

  const seo = seoContent[lang];

  const faqItems = seo.faq;

  const metricsConfig = [
    { key: 'sentenceUniformity' as const, label: 'sentenceUniformity', desc: 'sentenceUniformityDesc' },
    { key: 'vocabularyDiversity' as const, label: 'vocabularyDiversity', desc: 'vocabularyDiversityDesc' },
    { key: 'transitionWordFreq' as const, label: 'transitionWordFreq', desc: 'transitionWordFreqDesc' },
    { key: 'passiveVoice' as const, label: 'passiveVoice', desc: 'passiveVoiceDesc' },
    { key: 'avgWordLength' as const, label: 'avgWordLength', desc: 'avgWordLengthDesc' },
    { key: 'paragraphConsistency' as const, label: 'paragraphConsistency', desc: 'paragraphConsistencyDesc' },
    { key: 'repetitiveStarters' as const, label: 'repetitiveStarters', desc: 'repetitiveStartersDesc' },
    { key: 'hedgingLanguage' as const, label: 'hedgingLanguage', desc: 'hedgingLanguageDesc' },
    { key: 'burstiness' as const, label: 'burstiness', desc: 'burstinessDesc' },
    { key: 'perplexity' as const, label: 'perplexity', desc: 'perplexityDesc' },
  ];

  return (
    <ToolPageWrapper toolSlug="ai-text-detector" faqItems={faqItems}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Disclaimer */}
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          {labels.disclaimer[lang]}
        </div>

        {/* Word Count Badge */}
        <div className="flex justify-end mb-2">
          <span className={`text-sm px-3 py-1 rounded-full ${wordCount >= 50 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {wordCount} {labels.wordCount[lang]}
          </span>
        </div>

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setError(''); }}
          placeholder={labels.placeholder[lang]}
          className="w-full h-64 border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
        />

        {/* Error message */}
        {error && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={analyzeText}
            disabled={analyzing}
            className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {analyzing ? labels.analyzing[lang] : labels.analyze[lang]}
          </button>
          {result && (
            <button
              onClick={handleCopy}
              className="bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              {copied ? labels.copiedMsg[lang] : labels.copyResults[lang]}
            </button>
          )}
          <button
            onClick={handleReset}
            className="bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            {labels.reset[lang]}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8 space-y-6">
            {/* Overall Score with Circular Gauge */}
            <div className={`${getVerdictColor(result.verdict).bg} border ${getVerdictColor(result.verdict).border} rounded-xl p-6`}>
              <div className="flex flex-col items-center relative">
                {renderGauge(result.overallScore, result.verdict)}
                <div className={`mt-4 text-xl font-bold ${getVerdictColor(result.verdict).text}`}>
                  {result.verdict === 'human' ? labels.likelyHuman[lang] :
                    result.verdict === 'mixed' ? labels.mixed[lang] : labels.likelyAI[lang]}
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{labels.detailedBreakdown[lang]}</h2>
              <div className="space-y-3">
                {metricsConfig.map(({ key, label, desc }) => (
                  <div key={key} className={`border rounded-lg p-4 ${getMetricBg(result.metrics[key])}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900 text-sm">{labels[label][lang]}</span>
                      <span className="font-bold text-gray-900">{result.metrics[key]}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`${getMetricColor(result.metrics[key])} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${result.metrics[key]}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600">{labels[desc][lang]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* History */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 mb-3">{labels.history[lang]}</div>
          {history.length > 0 ? (
            <div className="space-y-2">
              {history.map((entry, i) => {
                const vColors = getVerdictColor(entry.verdict);
                return (
                  <div key={i} className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex justify-between items-center text-sm">
                    <span className="text-gray-600 truncate mr-3">&ldquo;{entry.preview}&rdquo;</span>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${vColors.bg} ${vColors.text}`}>
                        {entry.score}%
                      </span>
                      <span className="text-gray-400 text-xs">{entry.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-400">{labels.noHistory[lang]}</div>
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
