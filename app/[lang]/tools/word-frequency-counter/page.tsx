'use client';
import { useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface FreqEntry {
  word: string;
  count: number;
  percentage: number;
}

const STOP_WORDS: Record<string, Set<string>> = {
  en: new Set(['the','be','to','of','and','a','in','that','have','i','it','for','not','on','with','he','as','you','do','at','this','but','his','by','from','they','we','her','she','or','an','will','my','one','all','would','there','their','what','so','up','out','if','about','who','get','which','go','me','when','make','can','like','time','no','just','him','know','take','people','into','year','your','good','some','could','them','see','other','than','then','now','look','only','come','its','over','think','also','back','after','use','two','how','our','work','first','well','way','even','new','want','because','any','these','give','day','most','us']),
  it: new Set(['il','lo','la','i','gli','le','un','uno','una','di','a','da','in','con','su','per','tra','fra','e','o','ma','che','non','si','mi','ti','ci','vi','ne','lo','li','le','me','te','se','lui','lei','noi','voi','loro','questo','quello','quale','chi','come','dove','quando','perché','più','molto','anche','solo','già','ancora','sempre','mai','tutto','ogni','altro','stesso','proprio','suo','mio','tuo','nostro','vostro','essere','avere','fare','dire','andare','potere','volere','dovere','sapere','vedere','dare','stare','venire']),
  es: new Set(['el','la','los','las','un','una','unos','unas','de','del','a','al','en','con','por','para','sin','sobre','entre','y','o','pero','que','no','se','me','te','le','nos','les','lo','su','mi','tu','este','ese','aquel','como','donde','cuando','más','muy','también','solo','ya','aún','siempre','nunca','todo','cada','otro','mismo','ser','estar','haber','tener','hacer','ir','poder','querer','deber','saber','ver','dar','decir','venir']),
  fr: new Set(['le','la','les','un','une','des','de','du','au','aux','en','dans','avec','pour','par','sur','sans','sous','entre','et','ou','mais','que','ne','pas','se','me','te','nous','vous','lui','leur','ce','cette','ces','son','sa','ses','mon','ma','mes','ton','ta','tes','qui','comme','où','quand','plus','très','aussi','seulement','déjà','encore','toujours','jamais','tout','chaque','autre','même','être','avoir','faire','dire','aller','pouvoir','vouloir','devoir','savoir','voir','donner','venir']),
  de: new Set(['der','die','das','ein','eine','und','oder','aber','dass','nicht','sich','mich','dich','uns','euch','ihm','ihr','sein','sein','ihr','mein','dein','unser','euer','dieser','jener','welcher','wie','wo','wann','mehr','sehr','auch','nur','schon','noch','immer','nie','alles','jeder','anderer','gleicher','sein','haben','machen','sagen','gehen','können','wollen','müssen','wissen','sehen','geben','kommen','werden','mit','von','zu','in','an','auf','für','über','nach','bei','aus','um','durch']),
  pt: new Set(['o','a','os','as','um','uma','uns','umas','de','do','da','dos','das','em','no','na','nos','nas','com','por','para','sem','sobre','entre','e','ou','mas','que','não','se','me','te','lhe','nos','vos','lhes','seu','sua','meu','minha','teu','tua','nosso','vosso','este','esse','aquele','como','onde','quando','mais','muito','também','só','já','ainda','sempre','nunca','tudo','cada','outro','mesmo','ser','estar','ter','fazer','ir','poder','querer','dever','saber','ver','dar','dizer','vir']),
};

const BAR_COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500',
  'bg-cyan-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-pink-500',
];

export default function WordFrequencyCounter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['word-frequency-counter'][lang];
  const [text, setText] = useState('');
  const [minFreq, setMinFreq] = useState(1);
  const [excludeStopWords, setExcludeStopWords] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedCsv, setCopiedCsv] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const labels: Record<string, Record<Locale, string>> = {
    placeholder: { en: 'Type or paste your text here...', it: 'Scrivi o incolla il tuo testo qui...', es: 'Escribe o pega tu texto aquí...', fr: 'Tapez ou collez votre texte ici...', de: 'Geben Sie Ihren Text hier ein...', pt: 'Digite ou cole seu texto aqui...' },
    analyze: { en: 'Analyze', it: 'Analizza', es: 'Analizar', fr: 'Analyser', de: 'Analysieren', pt: 'Analisar' },
    reset: { en: 'Reset', it: 'Cancella', es: 'Borrar', fr: 'Effacer', de: 'Zurücksetzen', pt: 'Limpar' },
    minFrequency: { en: 'Min frequency', it: 'Frequenza min.', es: 'Frecuencia mín.', fr: 'Fréquence min.', de: 'Min. Häufigkeit', pt: 'Frequência mín.' },
    excludeStop: { en: 'Exclude common words', it: 'Escludi parole comuni', es: 'Excluir palabras comunes', fr: 'Exclure mots courants', de: 'Häufige Wörter ausschließen', pt: 'Excluir palavras comuns' },
    caseSensitive: { en: 'Case-sensitive', it: 'Maiuscole/minuscole', es: 'Distinguir mayúsculas', fr: 'Sensible à la casse', de: 'Groß-/Kleinschreibung', pt: 'Diferenciar maiúsculas' },
    searchResults: { en: 'Search results...', it: 'Cerca nei risultati...', es: 'Buscar en resultados...', fr: 'Rechercher dans les résultats...', de: 'In Ergebnissen suchen...', pt: 'Buscar nos resultados...' },
    word: { en: 'Word', it: 'Parola', es: 'Palabra', fr: 'Mot', de: 'Wort', pt: 'Palavra' },
    count: { en: 'Count', it: 'Conteggio', es: 'Conteo', fr: 'Nombre', de: 'Anzahl', pt: 'Contagem' },
    percentage: { en: '%', it: '%', es: '%', fr: '%', de: '%', pt: '%' },
    copyCsv: { en: 'Copy as CSV', it: 'Copia come CSV', es: 'Copiar como CSV', fr: 'Copier en CSV', de: 'Als CSV kopieren', pt: 'Copiar como CSV' },
    copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
    topWords: { en: 'Top 10 Words', it: 'Top 10 Parole', es: 'Top 10 Palabras', fr: 'Top 10 Mots', de: 'Top 10 Wörter', pt: 'Top 10 Palavras' },
    totalWords: { en: 'Total Words', it: 'Parole Totali', es: 'Palabras Totales', fr: 'Mots Totaux', de: 'Gesamtwörter', pt: 'Total de Palavras' },
    uniqueWords: { en: 'Unique Words', it: 'Parole Uniche', es: 'Palabras Únicas', fr: 'Mots Uniques', de: 'Einzigartige Wörter', pt: 'Palavras Únicas' },
    avgWordLen: { en: 'Avg. Word Length', it: 'Lungh. Media', es: 'Long. Promedio', fr: 'Long. Moyenne', de: 'Durchschn. Länge', pt: 'Comp. Médio' },
    noResults: { en: 'No results found.', it: 'Nessun risultato trovato.', es: 'No se encontraron resultados.', fr: 'Aucun résultat trouvé.', de: 'Keine Ergebnisse gefunden.', pt: 'Nenhum resultado encontrado.' },
    enterText: { en: 'Enter text and click Analyze to see word frequencies.', it: 'Inserisci il testo e clicca Analizza per vedere le frequenze.', es: 'Ingresa texto y haz clic en Analizar para ver las frecuencias.', fr: 'Saisissez du texte et cliquez sur Analyser pour voir les fréquences.', de: 'Geben Sie Text ein und klicken Sie auf Analysieren.', pt: 'Insira o texto e clique em Analisar para ver as frequências.' },
    frequencyTable: { en: 'Frequency Table', it: 'Tabella Frequenze', es: 'Tabla de Frecuencias', fr: 'Tableau de Fréquences', de: 'Häufigkeitstabelle', pt: 'Tabela de Frequências' },
    stats: { en: 'Statistics', it: 'Statistiche', es: 'Estadísticas', fr: 'Statistiques', de: 'Statistiken', pt: 'Estatísticas' },
    filters: { en: 'Filters', it: 'Filtri', es: 'Filtros', fr: 'Filtres', de: 'Filter', pt: 'Filtros' },
  };

  const computeFrequencies = useCallback((): FreqEntry[] => {
    if (!text.trim()) return [];
    const words = text.trim().split(/\s+/);
    const freq: Record<string, number> = {};
    let total = 0;
    const stopSet = STOP_WORDS[lang] || STOP_WORDS.en;

    words.forEach((w) => {
      let clean = w.replace(/[^a-zA-ZÀ-ÿ'-]/g, '');
      if (!clean) return;
      if (!caseSensitive) clean = clean.toLowerCase();
      if (excludeStopWords && stopSet.has(clean.toLowerCase())) return;
      freq[clean] = (freq[clean] || 0) + 1;
      total++;
    });

    return Object.entries(freq)
      .filter(([, count]) => count >= minFreq)
      .sort((a, b) => b[1] - a[1])
      .map(([word, count]) => ({
        word,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }));
  }, [text, caseSensitive, excludeStopWords, minFreq, lang]);

  const [frequencies, setFrequencies] = useState<FreqEntry[]>([]);

  const handleAnalyze = () => {
    setFrequencies(computeFrequencies());
    setAnalyzed(true);
  };

  const handleReset = () => {
    setText('');
    setFrequencies([]);
    setAnalyzed(false);
    setSearchFilter('');
    setCopiedCsv(false);
  };

  const filteredFrequencies = useMemo(() => {
    if (!searchFilter.trim()) return frequencies;
    const q = searchFilter.toLowerCase();
    return frequencies.filter((f) => f.word.toLowerCase().includes(q));
  }, [frequencies, searchFilter]);

  const top10 = useMemo(() => frequencies.slice(0, 10), [frequencies]);

  const totalWords = useMemo(() => {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).filter((w) => w.replace(/[^a-zA-ZÀ-ÿ'-]/g, '')).length;
  }, [text]);

  const uniqueWords = frequencies.length;

  const avgWordLength = useMemo(() => {
    if (frequencies.length === 0) return '0';
    const totalLen = frequencies.reduce((sum, f) => sum + f.word.length * f.count, 0);
    const totalCount = frequencies.reduce((sum, f) => sum + f.count, 0);
    return totalCount > 0 ? (totalLen / totalCount).toFixed(1) : '0';
  }, [frequencies]);

  const handleCopyCsv = async () => {
    const header = `${labels.word[lang]},${labels.count[lang]},${labels.percentage[lang]}`;
    const rows = filteredFrequencies.map((f) => `${f.word},${f.count},${f.percentage.toFixed(2)}%`);
    await navigator.clipboard.writeText([header, ...rows].join('\n'));
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2000);
  };

  const maxCount = top10.length > 0 ? top10[0].count : 1;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Online Word Frequency Counter – Analyze Text Word Distribution',
      paragraphs: [
        'Understanding which words appear most often in a text is a cornerstone of content analysis, SEO optimization, and linguistic research. Our free word frequency counter scans your text instantly and produces a ranked table of every word alongside its count and percentage share.',
        'Writers use word frequency analysis to spot overused terms that weaken their prose. By identifying repetition, you can diversify vocabulary and improve readability scores. Editors and proofreaders rely on the same data to tighten manuscripts before publication.',
        'In the SEO world, keyword density still matters. Search engines penalize keyword stuffing while rewarding natural language. This tool lets you verify that your target keywords appear at a healthy 1-3% density without crossing into spam territory.',
        'Researchers and students benefit from frequency analysis when studying text corpora, comparing authorship styles, or building word clouds. The stop-word filter removes noise words like "the" and "and" so you can focus on meaningful content words.',
        'The built-in bar chart visualizes the top 10 words at a glance, making it easy to present findings in reports or presentations. Export your results as CSV for further analysis in spreadsheets or data-science tools.',
      ],
      faq: [
        { q: 'How does the word frequency counter work?', a: 'The tool splits your text by whitespace, cleans punctuation, and counts each unique word. Results are sorted by frequency and displayed with count and percentage. All processing happens in your browser — nothing is sent to any server.' },
        { q: 'What are stop words and should I exclude them?', a: 'Stop words are common function words like "the", "is", "at", and "which" that carry little meaning on their own. Excluding them helps you focus on the content-bearing words that matter for SEO and text analysis.' },
        { q: 'Can I use this for SEO keyword density analysis?', a: 'Yes. Paste your article, enable the stop-word filter, and check where your target keyword ranks. A healthy keyword density is typically between 1% and 3%. The percentage column shows you the exact density of each word.' },
        { q: 'Does the case-sensitive option affect results?', a: 'When case-sensitive mode is off (default), "Apple" and "apple" are counted as the same word. When enabled, they are treated as separate entries, which is useful for analyzing proper nouns or code.' },
        { q: 'Is my text stored or sent to a server?', a: 'No. All processing happens entirely in your browser using JavaScript. Your text never leaves your device, ensuring complete privacy and data security.' },
      ],
    },
    it: {
      title: 'Contatore Frequenza Parole Online Gratuito – Analizza la Distribuzione delle Parole',
      paragraphs: [
        'Capire quali parole appaiono più frequentemente in un testo è fondamentale per l\'analisi dei contenuti, l\'ottimizzazione SEO e la ricerca linguistica. Il nostro contatore di frequenza delle parole gratuito analizza il testo istantaneamente e produce una tabella ordinata con conteggio e percentuale di ogni parola.',
        'Gli scrittori usano l\'analisi delle frequenze per individuare termini usati troppo spesso che indeboliscono la prosa. Identificando le ripetizioni, puoi diversificare il vocabolario e migliorare la leggibilità. Editor e correttori si affidano agli stessi dati per perfezionare i manoscritti.',
        'Nel mondo SEO, la densità delle keyword conta ancora. I motori di ricerca penalizzano il keyword stuffing premiando il linguaggio naturale. Questo strumento ti permette di verificare che le tue keyword obiettivo appaiano con una densità sana dell\'1-3%.',
        'Ricercatori e studenti traggono vantaggio dall\'analisi delle frequenze per studiare corpora testuali, confrontare stili autoriali o creare word cloud. Il filtro delle stop word rimuove parole rumore come "il" e "e" per concentrarsi sulle parole significative.',
        'Il grafico a barre integrato visualizza le prime 10 parole a colpo d\'occhio, facilitando la presentazione dei risultati in report o presentazioni. Esporta i risultati come CSV per ulteriori analisi in fogli di calcolo.',
      ],
      faq: [
        { q: 'Come funziona il contatore di frequenza delle parole?', a: 'Lo strumento divide il testo per spazi, pulisce la punteggiatura e conta ogni parola unica. I risultati sono ordinati per frequenza e mostrati con conteggio e percentuale. Tutto il processo avviene nel browser — nulla viene inviato a un server.' },
        { q: 'Cosa sono le stop word e dovrei escluderle?', a: 'Le stop word sono parole funzionali comuni come "il", "è", "a" che portano poco significato da sole. Escluderle ti aiuta a concentrarti sulle parole di contenuto importanti per SEO e analisi testuale.' },
        { q: 'Posso usarlo per l\'analisi della densità delle keyword SEO?', a: 'Sì. Incolla il tuo articolo, attiva il filtro stop word e controlla dove si posiziona la tua keyword. Una densità sana è tipicamente tra l\'1% e il 3%. La colonna percentuale mostra la densità esatta di ogni parola.' },
        { q: 'L\'opzione maiuscole/minuscole influisce sui risultati?', a: 'Quando la modalità è disattivata (predefinita), "Mela" e "mela" vengono contate come la stessa parola. Quando attivata, sono trattate come voci separate, utile per analizzare nomi propri o codice.' },
        { q: 'Il mio testo viene salvato o inviato a un server?', a: 'No. Tutta l\'elaborazione avviene interamente nel browser tramite JavaScript. Il tuo testo non lascia mai il dispositivo, garantendo privacy e sicurezza dei dati.' },
      ],
    },
    es: {
      title: 'Contador de Frecuencia de Palabras Online Gratis – Analiza la Distribución de Palabras',
      paragraphs: [
        'Comprender qué palabras aparecen con mayor frecuencia en un texto es fundamental para el análisis de contenido, la optimización SEO y la investigación lingüística. Nuestro contador de frecuencia de palabras gratuito escanea tu texto al instante y produce una tabla clasificada con el conteo y porcentaje de cada palabra.',
        'Los escritores usan el análisis de frecuencia para detectar términos sobreutilizados que debilitan su prosa. Al identificar repeticiones, puedes diversificar el vocabulario y mejorar los puntajes de legibilidad. Editores y correctores confían en los mismos datos para pulir manuscritos.',
        'En el mundo del SEO, la densidad de palabras clave sigue importando. Los motores de búsqueda penalizan el exceso mientras premian el lenguaje natural. Esta herramienta te permite verificar que tus palabras clave objetivo aparezcan con una densidad saludable del 1-3%.',
        'Investigadores y estudiantes se benefician del análisis de frecuencia al estudiar corpus textuales, comparar estilos de autoría o crear nubes de palabras. El filtro de palabras vacías elimina ruido para concentrarse en las palabras significativas.',
        'El gráfico de barras integrado visualiza las 10 palabras principales de un vistazo. Exporta tus resultados como CSV para análisis adicional en hojas de cálculo o herramientas de ciencia de datos.',
      ],
      faq: [
        { q: '¿Cómo funciona el contador de frecuencia de palabras?', a: 'La herramienta divide tu texto por espacios, limpia la puntuación y cuenta cada palabra única. Los resultados se ordenan por frecuencia y se muestran con conteo y porcentaje. Todo el procesamiento ocurre en tu navegador — nada se envía a un servidor.' },
        { q: '¿Qué son las palabras vacías y debería excluirlas?', a: 'Las palabras vacías son palabras funcionales comunes como "el", "es", "a" que tienen poco significado por sí solas. Excluirlas te ayuda a enfocarte en las palabras de contenido importantes para SEO y análisis textual.' },
        { q: '¿Puedo usarlo para análisis de densidad de palabras clave SEO?', a: 'Sí. Pega tu artículo, activa el filtro de palabras vacías y verifica dónde se posiciona tu palabra clave. Una densidad saludable es típicamente entre 1% y 3%.' },
        { q: '¿La opción de distinguir mayúsculas afecta los resultados?', a: 'Cuando está desactivada (predeterminado), "Manzana" y "manzana" se cuentan como la misma palabra. Cuando está activada, se tratan como entradas separadas, útil para analizar nombres propios.' },
        { q: '¿Mi texto se almacena o se envía a un servidor?', a: 'No. Todo el procesamiento ocurre completamente en tu navegador usando JavaScript. Tu texto nunca sale de tu dispositivo, garantizando privacidad total.' },
      ],
    },
    fr: {
      title: 'Compteur de Fréquence des Mots Gratuit – Analysez la Distribution des Mots',
      paragraphs: [
        'Comprendre quels mots apparaissent le plus souvent dans un texte est essentiel pour l\'analyse de contenu, l\'optimisation SEO et la recherche linguistique. Notre compteur de fréquence des mots gratuit analyse votre texte instantanément et produit un tableau classé avec le nombre et le pourcentage de chaque mot.',
        'Les écrivains utilisent l\'analyse de fréquence pour repérer les termes surutilisés qui affaiblissent leur prose. En identifiant les répétitions, vous pouvez diversifier le vocabulaire et améliorer les scores de lisibilité. Les éditeurs s\'appuient sur les mêmes données pour peaufiner les manuscrits.',
        'Dans le monde du SEO, la densité des mots-clés compte toujours. Les moteurs de recherche pénalisent le bourrage tout en récompensant le langage naturel. Cet outil vous permet de vérifier que vos mots-clés cibles apparaissent à une densité saine de 1 à 3%.',
        'Les chercheurs et étudiants bénéficient de l\'analyse de fréquence pour étudier des corpus textuels, comparer des styles d\'écriture ou créer des nuages de mots. Le filtre des mots vides élimine le bruit pour se concentrer sur les mots significatifs.',
        'Le graphique à barres intégré visualise les 10 premiers mots d\'un coup d\'œil. Exportez vos résultats en CSV pour une analyse approfondie dans des tableurs ou des outils de data science.',
      ],
      faq: [
        { q: 'Comment fonctionne le compteur de fréquence des mots ?', a: 'L\'outil divise votre texte par les espaces, nettoie la ponctuation et compte chaque mot unique. Les résultats sont triés par fréquence avec nombre et pourcentage. Tout le traitement se fait dans votre navigateur — rien n\'est envoyé à un serveur.' },
        { q: 'Que sont les mots vides et dois-je les exclure ?', a: 'Les mots vides sont des mots fonctionnels courants comme "le", "est", "à" qui portent peu de sens seuls. Les exclure vous aide à vous concentrer sur les mots de contenu importants pour le SEO et l\'analyse textuelle.' },
        { q: 'Puis-je l\'utiliser pour l\'analyse de densité de mots-clés SEO ?', a: 'Oui. Collez votre article, activez le filtre des mots vides et vérifiez où se situe votre mot-clé cible. Une densité saine est généralement entre 1% et 3%.' },
        { q: 'L\'option sensible à la casse affecte-t-elle les résultats ?', a: 'Lorsque désactivée (par défaut), "Pomme" et "pomme" sont comptés comme le même mot. Lorsque activée, ils sont traités séparément, utile pour les noms propres ou le code.' },
        { q: 'Mon texte est-il stocké ou envoyé à un serveur ?', a: 'Non. Tout le traitement se fait entièrement dans votre navigateur via JavaScript. Votre texte ne quitte jamais votre appareil, garantissant une confidentialité totale.' },
      ],
    },
    de: {
      title: 'Kostenloser Online-Worthäufigkeitszähler – Textverteilung Analysieren',
      paragraphs: [
        'Zu verstehen, welche Wörter in einem Text am häufigsten vorkommen, ist ein Grundpfeiler der Inhaltsanalyse, SEO-Optimierung und Sprachforschung. Unser kostenloser Worthäufigkeitszähler analysiert Ihren Text sofort und erstellt eine sortierte Tabelle jedes Wortes mit Anzahl und Prozentanteil.',
        'Autoren nutzen die Häufigkeitsanalyse, um überverwendete Begriffe zu erkennen, die ihre Prosa schwächen. Durch das Erkennen von Wiederholungen können Sie den Wortschatz diversifizieren und die Lesbarkeit verbessern. Redakteure verlassen sich auf dieselben Daten, um Manuskripte zu verfeinern.',
        'In der SEO-Welt zählt die Keyword-Dichte nach wie vor. Suchmaschinen bestrafen Keyword-Stuffing und belohnen natürliche Sprache. Dieses Tool ermöglicht es Ihnen zu überprüfen, ob Ihre Ziel-Keywords mit einer gesunden Dichte von 1-3% erscheinen.',
        'Forscher und Studenten profitieren von der Häufigkeitsanalyse beim Studium von Textkorpora, dem Vergleich von Autorenstilen oder der Erstellung von Wortwolken. Der Stoppwort-Filter entfernt Rauschwörter, um sich auf bedeutungsvolle Wörter zu konzentrieren.',
        'Das integrierte Balkendiagramm visualisiert die Top-10-Wörter auf einen Blick. Exportieren Sie Ihre Ergebnisse als CSV für weitere Analysen in Tabellenkalkulationen oder Data-Science-Tools.',
      ],
      faq: [
        { q: 'Wie funktioniert der Worthäufigkeitszähler?', a: 'Das Tool teilt Ihren Text an Leerzeichen, bereinigt Satzzeichen und zählt jedes einzigartige Wort. Die Ergebnisse werden nach Häufigkeit sortiert mit Anzahl und Prozent angezeigt. Alles geschieht in Ihrem Browser — nichts wird an einen Server gesendet.' },
        { q: 'Was sind Stoppwörter und sollte ich sie ausschließen?', a: 'Stoppwörter sind häufige Funktionswörter wie "der", "ist", "an", die allein wenig Bedeutung tragen. Sie auszuschließen hilft Ihnen, sich auf die inhaltlich wichtigen Wörter für SEO und Textanalyse zu konzentrieren.' },
        { q: 'Kann ich dies für die SEO-Keyword-Dichte-Analyse verwenden?', a: 'Ja. Fügen Sie Ihren Artikel ein, aktivieren Sie den Stoppwort-Filter und prüfen Sie, wo Ihr Ziel-Keyword rangiert. Eine gesunde Keyword-Dichte liegt typischerweise zwischen 1% und 3%.' },
        { q: 'Beeinflusst die Groß-/Kleinschreibungs-Option die Ergebnisse?', a: 'Bei deaktiviertem Modus (Standard) werden "Apfel" und "apfel" als dasselbe Wort gezählt. Bei aktiviertem Modus werden sie als separate Einträge behandelt, nützlich für Eigennamen oder Code.' },
        { q: 'Wird mein Text gespeichert oder an einen Server gesendet?', a: 'Nein. Die gesamte Verarbeitung erfolgt vollständig in Ihrem Browser mittels JavaScript. Ihr Text verlässt niemals Ihr Gerät, was vollständige Privatsphäre gewährleistet.' },
      ],
    },
    pt: {
      title: 'Contador de Frequência de Palavras Online Grátis – Analise a Distribuição de Palavras',
      paragraphs: [
        'Entender quais palavras aparecem com mais frequência em um texto é fundamental para análise de conteúdo, otimização SEO e pesquisa linguística. Nosso contador de frequência de palavras gratuito analisa seu texto instantaneamente e produz uma tabela classificada com contagem e porcentagem de cada palavra.',
        'Escritores usam a análise de frequência para detectar termos usados em excesso que enfraquecem sua prosa. Ao identificar repetições, você pode diversificar o vocabulário e melhorar os índices de legibilidade. Editores confiam nos mesmos dados para refinar manuscritos.',
        'No mundo do SEO, a densidade de palavras-chave ainda importa. Os mecanismos de busca penalizam o excesso enquanto recompensam a linguagem natural. Esta ferramenta permite verificar se suas palavras-chave alvo aparecem com uma densidade saudável de 1-3%.',
        'Pesquisadores e estudantes se beneficiam da análise de frequência ao estudar corpora textuais, comparar estilos de autoria ou criar nuvens de palavras. O filtro de stop words remove ruído para focar nas palavras significativas.',
        'O gráfico de barras integrado visualiza as 10 principais palavras de relance. Exporte seus resultados como CSV para análise adicional em planilhas ou ferramentas de ciência de dados.',
      ],
      faq: [
        { q: 'Como funciona o contador de frequência de palavras?', a: 'A ferramenta divide seu texto por espaços, limpa a pontuação e conta cada palavra única. Os resultados são ordenados por frequência com contagem e porcentagem. Todo o processamento acontece no navegador — nada é enviado a um servidor.' },
        { q: 'O que são stop words e devo excluí-las?', a: 'Stop words são palavras funcionais comuns como "o", "é", "a" que carregam pouco significado sozinhas. Excluí-las ajuda a focar nas palavras de conteúdo importantes para SEO e análise textual.' },
        { q: 'Posso usar para análise de densidade de palavras-chave SEO?', a: 'Sim. Cole seu artigo, ative o filtro de stop words e verifique onde sua palavra-chave se posiciona. Uma densidade saudável é tipicamente entre 1% e 3%.' },
        { q: 'A opção de diferenciar maiúsculas afeta os resultados?', a: 'Quando desativada (padrão), "Maçã" e "maçã" são contadas como a mesma palavra. Quando ativada, são tratadas como entradas separadas, útil para nomes próprios ou código.' },
        { q: 'Meu texto é armazenado ou enviado para um servidor?', a: 'Não. Todo o processamento acontece inteiramente no seu navegador usando JavaScript. Seu texto nunca sai do seu dispositivo, garantindo privacidade total.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="word-frequency-counter" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={labels.placeholder[lang]}
          className="w-full h-48 border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
        />

        {/* Filters */}
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 mb-3">{labels.filters[lang]}</div>
          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              {labels.minFrequency[lang]}
              <input
                type="number"
                min={1}
                max={999}
                value={minFreq}
                onChange={(e) => setMinFreq(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={excludeStopWords}
                onChange={(e) => setExcludeStopWords(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {labels.excludeStop[lang]}
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {labels.caseSensitive[lang]}
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleAnalyze}
            className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {labels.analyze[lang]}
          </button>
          <button
            onClick={handleReset}
            className="bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            {labels.reset[lang]}
          </button>
        </div>

        {analyzed && frequencies.length > 0 && (
          <>
            {/* Stats Cards */}
            <div className="mt-6">
              <div className="text-sm font-medium text-gray-700 mb-3">{labels.stats[lang]}</div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-700">{totalWords}</div>
                  <div className="text-xs text-gray-500">{labels.totalWords[lang]}</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-700">{uniqueWords}</div>
                  <div className="text-xs text-gray-500">{labels.uniqueWords[lang]}</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-700">{avgWordLength}</div>
                  <div className="text-xs text-gray-500">{labels.avgWordLen[lang]}</div>
                </div>
              </div>
            </div>

            {/* Top 10 Bar Chart */}
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700 mb-4">{labels.topWords[lang]}</div>
              <div className="space-y-2">
                {top10.map((entry, i) => (
                  <div key={entry.word} className="flex items-center gap-3">
                    <span className="w-24 text-sm text-gray-700 font-medium truncate text-right">{entry.word}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div
                        className={`${BAR_COLORS[i % BAR_COLORS.length]} h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                        style={{ width: `${Math.max((entry.count / maxCount) * 100, 8)}%` }}
                      >
                        <span className="text-xs text-white font-semibold">{entry.count}</span>
                      </div>
                    </div>
                    <span className="w-14 text-xs text-gray-500 text-right">{entry.percentage.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Search + Copy CSV */}
            <div className="mt-6 flex gap-3">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={labels.searchResults[lang]}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleCopyCsv}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                {copiedCsv ? labels.copied[lang] : labels.copyCsv[lang]}
              </button>
            </div>

            {/* Frequency Table */}
            <div className="mt-4 bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">{labels.frequencyTable[lang]}</span>
                <span className="text-xs text-gray-400 ml-2">({filteredFrequencies.length})</span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-2 text-gray-600 font-medium">#</th>
                      <th className="text-left px-4 py-2 text-gray-600 font-medium">{labels.word[lang]}</th>
                      <th className="text-right px-4 py-2 text-gray-600 font-medium">{labels.count[lang]}</th>
                      <th className="text-right px-4 py-2 text-gray-600 font-medium">{labels.percentage[lang]}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFrequencies.length > 0 ? (
                      filteredFrequencies.slice(0, 100).map((entry, i) => (
                        <tr key={entry.word} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                          <td className="px-4 py-2 text-gray-900 font-medium">{entry.word}</td>
                          <td className="px-4 py-2 text-gray-700 text-right">{entry.count}</td>
                          <td className="px-4 py-2 text-gray-500 text-right">{entry.percentage.toFixed(2)}%</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-gray-400">{labels.noResults[lang]}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {analyzed && frequencies.length === 0 && (
          <div className="mt-6 text-center text-gray-400 py-8 bg-gray-50 border border-gray-200 rounded-lg">
            {labels.noResults[lang]}
          </div>
        )}

        {!analyzed && (
          <div className="mt-6 text-center text-gray-400 py-8 bg-gray-50 border border-gray-200 rounded-lg">
            {labels.enterText[lang]}
          </div>
        )}

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