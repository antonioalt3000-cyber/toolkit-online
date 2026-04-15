'use client';
import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface HistoryEntry {
  preview: string;
  words: number;
  chars: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
}

export default function WordCounter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['word-counter'][lang];
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const wordsArray = text.trim() ? text.trim().split(/\s+/) : [];
  const words = wordsArray.length;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const sentences = text.trim() ? text.split(/[.!?]+/).filter((s) => s.trim()).length : 0;
  const paragraphs = text.trim() ? text.split(/\n\n+/).filter((s) => s.trim()).length : 0;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  // Additional stats
  const avgWordLength = words > 0 ? (wordsArray.reduce((sum, w) => sum + w.replace(/[^a-zA-ZÀ-ÿ]/g, '').length, 0) / words).toFixed(1) : '0';
  const longestWord = words > 0 ? wordsArray.reduce((a, b) => a.length >= b.length ? a : b, '').replace(/[^a-zA-ZÀ-ÿ'-]/g, '') : '-';

  const getTopWords = useCallback((): { word: string; count: number }[] => {
    if (words === 0) return [];
    const freq: Record<string, number> = {};
    wordsArray.forEach((w) => {
      const clean = w.toLowerCase().replace(/[^a-zA-ZÀ-ÿ'-]/g, '');
      if (clean.length > 0) freq[clean] = (freq[clean] || 0) + 1;
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => ({ word, count }));
  }, [words, wordsArray]);

  const topWords = getTopWords();

  const labels: Record<string, Record<Locale, string>> = {
    words: { en: 'Words', it: 'Parole', es: 'Palabras', fr: 'Mots', de: 'Wörter', pt: 'Palavras' },
    chars: { en: 'Characters', it: 'Caratteri', es: 'Caracteres', fr: 'Caractères', de: 'Zeichen', pt: 'Caracteres' },
    charsNs: { en: 'No spaces', it: 'Senza spazi', es: 'Sin espacios', fr: 'Sans espaces', de: 'Ohne Leerzeichen', pt: 'Sem espaços' },
    sentences: { en: 'Sentences', it: 'Frasi', es: 'Oraciones', fr: 'Phrases', de: 'Sätze', pt: 'Frases' },
    paragraphs: { en: 'Paragraphs', it: 'Paragrafi', es: 'Párrafos', fr: 'Paragraphes', de: 'Absätze', pt: 'Parágrafos' },
    reading: { en: 'min read', it: 'min lettura', es: 'min lectura', fr: 'min lecture', de: 'Min. Lesezeit', pt: 'min leitura' },
    placeholder: { en: 'Type or paste your text here...', it: 'Scrivi o incolla il tuo testo qui...', es: 'Escribe o pega tu texto aquí...', fr: 'Tapez ou collez votre texte ici...', de: 'Geben Sie Ihren Text hier ein...', pt: 'Digite ou cole seu texto aqui...' },
    copyResults: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier Résultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
    copiedMsg: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
    reset: { en: 'Reset', it: 'Cancella', es: 'Borrar', fr: 'Effacer', de: 'Zurücksetzen', pt: 'Limpar' },
    emptyError: { en: 'Please enter some text first.', it: 'Inserisci prima del testo.', es: 'Por favor, ingresa texto primero.', fr: 'Veuillez d\'abord saisir du texte.', de: 'Bitte geben Sie zuerst einen Text ein.', pt: 'Por favor, insira algum texto primeiro.' },
    avgWordLen: { en: 'Avg. Word Length', it: 'Lungh. Media Parola', es: 'Long. Media Palabra', fr: 'Long. Moy. Mot', de: 'Durchschn. Wortlänge', pt: 'Comp. Médio Palavra' },
    longestWord: { en: 'Longest Word', it: 'Parola Più Lunga', es: 'Palabra Más Larga', fr: 'Mot le Plus Long', de: 'Längstes Wort', pt: 'Palavra Mais Longa' },
    topWords: { en: 'Top 5 Words', it: 'Top 5 Parole', es: 'Top 5 Palabras', fr: 'Top 5 Mots', de: 'Top 5 Wörter', pt: 'Top 5 Palavras' },
    readingProgress: { en: 'Reading Time', it: 'Tempo di Lettura', es: 'Tiempo de Lectura', fr: 'Temps de Lecture', de: 'Lesezeit', pt: 'Tempo de Leitura' },
    history: { en: 'Recent Analyses', it: 'Analisi Recenti', es: 'Análisis Recientes', fr: 'Analyses Récentes', de: 'Letzte Analysen', pt: 'Análises Recentes' },
    saveAnalysis: { en: 'Save Analysis', it: 'Salva Analisi', es: 'Guardar Análisis', fr: 'Sauvegarder', de: 'Analyse Speichern', pt: 'Salvar Análise' },
    times: { en: 'times', it: 'volte', es: 'veces', fr: 'fois', de: 'mal', pt: 'vezes' },
    noHistory: { en: 'No saved analyses yet.', it: 'Nessuna analisi salvata.', es: 'Sin análisis guardados.', fr: 'Aucune analyse sauvegardée.', de: 'Noch keine gespeicherten Analysen.', pt: 'Nenhuma análise salva ainda.' },
  };

  const handleCopy = async () => {
    if (!text.trim()) {
      setError(labels.emptyError[lang]);
      setTimeout(() => setError(''), 3000);
      return;
    }
    setError('');
    const stats = [
      `${labels.words[lang]}: ${words}`,
      `${labels.chars[lang]}: ${chars}`,
      `${labels.charsNs[lang]}: ${charsNoSpaces}`,
      `${labels.sentences[lang]}: ${sentences}`,
      `${labels.paragraphs[lang]}: ${paragraphs}`,
      `${labels.readingProgress[lang]}: ${readingTime} ${labels.reading[lang]}`,
      `${labels.avgWordLen[lang]}: ${avgWordLength}`,
      `${labels.longestWord[lang]}: ${longestWord}`,
    ].join('\n');
    await navigator.clipboard.writeText(stats);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setText('');
    setError('');
    setCopied(false);
  };

  const handleSaveAnalysis = () => {
    if (!text.trim()) {
      setError(labels.emptyError[lang]);
      setTimeout(() => setError(''), 3000);
      return;
    }
    setError('');
    const entry: HistoryEntry = {
      preview: text.slice(0, 30) + (text.length > 30 ? '...' : ''),
      words,
      chars,
      sentences,
      paragraphs,
      readingTime,
    };
    setHistory((prev) => [entry, ...prev].slice(0, 5));
  };

  const readingTimeMax = 10;
  const readingProgress = Math.min((readingTime / readingTimeMax) * 100, 100);

  const cardData = [
    { label: labels.words[lang], value: words, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    { label: labels.chars[lang], value: chars, bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    { label: labels.charsNs[lang], value: charsNoSpaces, bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    { label: labels.sentences[lang], value: sentences, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    { label: labels.paragraphs[lang], value: paragraphs, bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    { label: labels.reading[lang], value: readingTime, bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  ];

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Online Word Counter Tool – Count Words, Characters & More',
      paragraphs: [
        'Whether you are a student finishing an essay, a blogger crafting a post, or a copywriter meeting a strict brief, knowing the exact word count of your text is essential. Our free online word counter gives you instant, accurate statistics the moment you type or paste your content.',
        'Beyond simple word counting, this tool breaks your text down into characters (with and without spaces), sentences, paragraphs, and estimated reading time. These metrics matter for SEO, social-media copy limits, academic assignments, and professional writing where precision is non-negotiable.',
        'Search engines like Google look at content length as one of many ranking factors. Articles between 1,500 and 2,500 words tend to rank higher for competitive keywords. Use this word counter to ensure your articles meet the optimal length before publishing.',
        'The reading-time estimate is based on the average adult reading speed of 200 words per minute. This is the same formula used by platforms like Medium to display estimated read times, helping readers decide whether to commit to an article. Explore also our <a href="/en/tools/character-counter" class="text-blue-600 underline">Character Counter</a> and <a href="/en/tools/text-case-converter" class="text-blue-600 underline">Text Case Converter</a> for more text analysis tools.',
      ],
      faq: [
        { q: 'How does the word counter calculate words?', a: 'The tool splits your text by whitespace characters (spaces, tabs, newlines) and counts each resulting segment. This is the same method used by most word processors like Microsoft Word and Google Docs.' },
        { q: 'Does the word counter work with languages other than English?', a: 'Yes. The counter works with any language that separates words with spaces, including Spanish, French, German, Italian, and Portuguese. For languages like Chinese or Japanese that do not use spaces between words, the count reflects space-separated segments.' },
        { q: 'How is reading time estimated?', a: 'Reading time is calculated by dividing the total word count by 200 (the average adult reading speed in words per minute). The result is rounded up to the nearest minute, with a minimum of 1 minute.' },
        { q: 'Can I use this tool to check character limits for social media?', a: 'Absolutely. Twitter/X has a 280-character limit, Instagram captions allow 2,200 characters, and LinkedIn posts cap at 3,000 characters. Use the character count (with or without spaces) to stay within these limits.' },
        { q: 'Is my text stored or sent to a server?', a: 'No. All processing happens entirely in your browser using JavaScript. Your text never leaves your device, ensuring complete privacy.' },
      ],
    },
    it: {
      title: 'Contatore di Parole Online Gratuito – Conta Parole, Caratteri e Altro',
      paragraphs: [
        'Che tu sia uno studente che sta completando un saggio, un blogger che scrive un articolo o un copywriter con limiti precisi, conoscere il conteggio esatto delle parole è fondamentale. Il nostro contatore di parole online gratuito ti fornisce statistiche istantanee e precise nel momento in cui digiti o incolli il testo.',
        'Oltre al semplice conteggio delle parole, questo strumento analizza il testo in caratteri (con e senza spazi), frasi, paragrafi e tempo di lettura stimato. Queste metriche sono importanti per la SEO, i limiti dei social media, i compiti accademici e la scrittura professionale.',
        'I motori di ricerca come Google considerano la lunghezza del contenuto come uno dei fattori di ranking. Gli articoli tra 1.500 e 2.500 parole tendono a posizionarsi meglio per le keyword competitive. Usa questo contatore per assicurarti che i tuoi articoli raggiungano la lunghezza ottimale.',
        'La stima del tempo di lettura si basa sulla velocità media di lettura di un adulto di 200 parole al minuto. È la stessa formula usata da piattaforme come Medium per mostrare i tempi di lettura stimati. Scopri anche il nostro <a href="/it/tools/character-counter" class="text-blue-600 underline">Contatore di Caratteri</a> e il <a href="/it/tools/text-case-converter" class="text-blue-600 underline">Convertitore di Maiuscole/Minuscole</a> per altri strumenti di analisi testo.',
      ],
      faq: [
        { q: 'Come calcola le parole il contatore?', a: 'Lo strumento divide il testo per spazi bianchi (spazi, tabulazioni, a capo) e conta ogni segmento risultante. È lo stesso metodo usato dalla maggior parte dei word processor come Microsoft Word e Google Docs.' },
        { q: 'Il contatore funziona con lingue diverse dall\'italiano?', a: 'Sì. Il contatore funziona con qualsiasi lingua che separa le parole con spazi, incluso inglese, spagnolo, francese, tedesco e portoghese.' },
        { q: 'Come viene stimato il tempo di lettura?', a: 'Il tempo di lettura viene calcolato dividendo il numero totale di parole per 200 (la velocità media di lettura di un adulto in parole al minuto). Il risultato viene arrotondato per eccesso, con un minimo di 1 minuto.' },
        { q: 'Posso usare questo strumento per controllare i limiti di caratteri dei social media?', a: 'Certamente. Twitter/X ha un limite di 280 caratteri, le didascalie di Instagram consentono 2.200 caratteri e i post di LinkedIn arrivano a 3.000 caratteri.' },
        { q: 'Il mio testo viene salvato o inviato a un server?', a: 'No. Tutta l\'elaborazione avviene interamente nel tuo browser tramite JavaScript. Il tuo testo non lascia mai il tuo dispositivo, garantendo completa privacy.' },
      ],
    },
    es: {
      title: 'Contador de Palabras Online Gratis — Contar Palabras, Caracteres y Más',
      paragraphs: [
        '<strong>¿Necesitas un contador de palabras rápido y fiable?</strong> Ya seas estudiante, blogger, redactor publicitario o traductor profesional, contar palabras con precisión es imprescindible para entregar trabajos de calidad. Nuestro contador de palabras online te permite pegar o escribir cualquier texto y obtener al instante el número exacto de palabras, caracteres, oraciones, párrafos y tiempo de lectura estimado, todo sin registro ni descargas.',
        '<h2 class="text-xl font-semibold text-gray-800 mt-4 mb-2">¿Cómo funciona este contador de palabras online?</h2>Simplemente escribe o pega tu texto en el área de entrada y el conteo de palabras se actualiza en tiempo real. La herramienta analiza tu contenido desglosándolo en múltiples métricas: palabras totales, caracteres con y sin espacios, oraciones, párrafos, longitud promedio de palabra, la palabra más larga y las cinco palabras más frecuentes. Toda esta información te ayuda a optimizar tus textos para SEO, redes sociales o requisitos académicos.',
        '<h2 class="text-xl font-semibold text-gray-800 mt-4 mb-2">¿Por qué contar palabras es importante para tu contenido?</h2>Los motores de búsqueda como Google consideran la extensión del contenido como uno de los factores de posicionamiento. Los artículos entre 1.500 y 2.500 palabras suelen clasificarse mejor para palabras clave competitivas. Con nuestro contador palabras puedes verificar si tu artículo, entrada de blog o página de producto alcanza la extensión recomendada antes de publicar. Además, muchas plataformas educativas y concursos literarios exigen un conteo de palabras específico que puedes comprobar aquí al instante.',
        '<h2 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Contador de caracteres online y tiempo de lectura</h2>Además de contar palabras, esta herramienta funciona como un completo <a href="/es/tools/character-counter" class="text-blue-600 underline">contador de caracteres online</a>. Conocer el número exacto de caracteres es esencial para respetar los límites de Twitter/X (280), Instagram (2.200) o LinkedIn (3.000). La estimación de tiempo de lectura se basa en 200 palabras por minuto, el estándar utilizado por plataformas como Medium y WordPress.',
        '<h2 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Herramientas complementarias para analizar texto</h2>Si necesitas un análisis más profundo, explora nuestro <a href="/es/tools/line-counter" class="text-blue-600 underline">Contador de Líneas</a> para contar líneas de código o texto estructurado, o el <a href="/es/tools/text-case-converter" class="text-blue-600 underline">Convertidor de Mayúsculas/Minúsculas</a> para uniformar el formato de títulos y encabezados. También puedes analizar la frecuencia de palabras con nuestro <a href="/es/tools/word-frequency-counter" class="text-blue-600 underline">Contador de Frecuencia de Palabras</a>.',
        '<h2 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Contador de palabras para estudiantes y académicos</h2>En el ámbito académico, cumplir con el número exacto de palabras es obligatorio. Los ensayos universitarios, las tesis de grado, los trabajos de fin de máster y las oposiciones exigen conteos precisos. Muchos profesores penalizan los textos que superan o no alcanzan el límite establecido. Con nuestro contador de palabras online puedes verificar al instante si tu redacción, resumen o artículo cumple con los requisitos antes de entregarlo. También es útil para preparar resúmenes de investigación (abstracts), que suelen tener límites de 150 a 300 palabras según la revista científica.',
        '<h2 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Privacidad total: tu texto no sale de tu dispositivo</h2>Nuestro contador de palabras online funciona completamente en tu navegador mediante JavaScript. No enviamos tu texto a ningún servidor ni lo almacenamos en bases de datos. Puedes usarlo en cualquier dispositivo — ordenador, tablet o móvil — con total tranquilidad. Es la herramienta ideal para estudiantes, periodistas, traductores, community managers y cualquier profesional que necesite contar palabras de forma rápida, precisa y privada.',
      ],
      faq: [
        { q: '¿Cómo funciona este contador de palabras para contar palabras en un texto?', a: 'Nuestro contador de palabras divide tu texto por espacios en blanco (espacios, tabulaciones y saltos de línea) y cuenta cada segmento resultante. Es el mismo método que usan Microsoft Word, Google Docs y LibreOffice Writer. Los signos de puntuación pegados a una palabra no generan conteos adicionales, por lo que el resultado es preciso y consistente con otros procesadores de texto.' },
        { q: '¿Puedo usar este contador de palabras online con textos en otros idiomas?', a: 'Sí. Nuestro contador de palabras online funciona con cualquier idioma que separe palabras mediante espacios, incluyendo español, inglés, francés, alemán, italiano y portugués. Para idiomas como el chino o el japonés, que no usan espacios entre palabras, el conteo reflejará los segmentos separados por espacios que existan en el texto.' },
        { q: '¿Cómo se calcula el conteo de palabras y el tiempo de lectura?', a: 'El conteo de palabras se realiza dividiendo el texto por espacios y contando cada segmento. El tiempo de lectura se calcula dividiendo el total de palabras entre 200, que es la velocidad promedio de lectura de un adulto según estudios de comprensión lectora. El resultado se redondea hacia arriba con un mínimo de 1 minuto. Para textos técnicos o académicos, la velocidad real suele ser menor (150-180 palabras por minuto).' },
        { q: '¿Este contador de palabras online también cuenta caracteres?', a: 'Sí. Además de contar palabras, nuestra herramienta muestra el número total de caracteres con espacios y sin espacios. Esto es especialmente útil para verificar límites en redes sociales: Twitter/X (280 caracteres), Instagram (2.200), LinkedIn (3.000) y YouTube (100 en títulos). Si necesitas un análisis de caracteres más detallado, prueba nuestro Contador de Caracteres dedicado.' },
        { q: '¿Mi texto se almacena o se envía a algún servidor al usar este contador?', a: 'No. Todo el procesamiento de nuestro contador de palabras ocurre completamente en tu navegador usando JavaScript. Tu texto nunca sale de tu dispositivo y no se almacena en ninguna base de datos externa. Esto garantiza privacidad total, algo especialmente importante si trabajas con documentos confidenciales, contratos, tesis o información personal sensible.' },
      ],
    },
    fr: {
      title: 'Compteur de Mots en Ligne Gratuit – Comptez Mots, Caractères et Plus',
      paragraphs: [
        'Que vous soyez un étudiant terminant une dissertation, un blogueur rédigeant un article ou un rédacteur respectant un cahier des charges strict, connaître le nombre exact de mots de votre texte est essentiel. Notre compteur de mots en ligne gratuit vous donne des statistiques instantanées et précises dès que vous tapez ou collez votre contenu.',
        'Au-delà du simple comptage de mots, cet outil décompose votre texte en caractères (avec et sans espaces), phrases, paragraphes et temps de lecture estimé. Ces métriques sont importantes pour le SEO, les limites des réseaux sociaux, les devoirs académiques et la rédaction professionnelle.',
        'Les moteurs de recherche comme Google considèrent la longueur du contenu comme l\'un des facteurs de classement. Les articles entre 1 500 et 2 500 mots ont tendance à mieux se classer pour les mots-clés compétitifs. Utilisez ce compteur pour vous assurer que vos articles atteignent la longueur optimale.',
        'L\'estimation du temps de lecture est basée sur la vitesse moyenne de lecture d\'un adulte de 200 mots par minute. C\'est la même formule utilisée par des plateformes comme Medium pour afficher les temps de lecture estimés. Découvrez aussi notre <a href="/fr/tools/character-counter" class="text-blue-600 underline">Compteur de Caractères</a> et le <a href="/fr/tools/text-case-converter" class="text-blue-600 underline">Convertisseur de Casse</a> pour d\'autres outils d\'analyse de texte.',
      ],
      faq: [
        { q: 'Comment le compteur calcule-t-il les mots ?', a: 'L\'outil divise votre texte par les espaces blancs (espaces, tabulations, retours à la ligne) et compte chaque segment résultant. C\'est la même méthode utilisée par la plupart des traitements de texte comme Microsoft Word et Google Docs.' },
        { q: 'Le compteur fonctionne-t-il avec d\'autres langues que le français ?', a: 'Oui. Le compteur fonctionne avec toute langue qui sépare les mots par des espaces, y compris l\'anglais, l\'espagnol, l\'allemand, l\'italien et le portugais.' },
        { q: 'Comment le temps de lecture est-il estimé ?', a: 'Le temps de lecture est calculé en divisant le nombre total de mots par 200 (la vitesse moyenne de lecture d\'un adulte en mots par minute). Le résultat est arrondi au-dessus, avec un minimum d\'1 minute.' },
        { q: 'Puis-je utiliser cet outil pour vérifier les limites de caractères des réseaux sociaux ?', a: 'Absolument. Twitter/X a une limite de 280 caractères, les légendes Instagram autorisent 2 200 caractères et les publications LinkedIn plafonnent à 3 000 caractères.' },
        { q: 'Mon texte est-il stocké ou envoyé à un serveur ?', a: 'Non. Tout le traitement se fait entièrement dans votre navigateur via JavaScript. Votre texte ne quitte jamais votre appareil, garantissant une confidentialité totale.' },
      ],
    },
    de: {
      title: 'Kostenloser Online-Wortzähler – Wörter, Zeichen und Mehr Zählen',
      paragraphs: [
        'Ob Sie ein Student sind, der einen Aufsatz fertigstellt, ein Blogger, der einen Beitrag verfasst, oder ein Texter, der strenge Vorgaben einhalten muss – die genaue Wortzahl Ihres Textes zu kennen ist unerlässlich. Unser kostenloser Online-Wortzähler liefert Ihnen sofort präzise Statistiken, sobald Sie Ihren Text eingeben oder einfügen.',
        'Über die einfache Wortzählung hinaus zerlegt dieses Tool Ihren Text in Zeichen (mit und ohne Leerzeichen), Sätze, Absätze und geschätzte Lesezeit. Diese Metriken sind wichtig für SEO, Social-Media-Zeichenlimits, akademische Arbeiten und professionelles Schreiben.',
        'Suchmaschinen wie Google betrachten die Inhaltslänge als einen von vielen Ranking-Faktoren. Artikel zwischen 1.500 und 2.500 Wörtern ranken tendenziell besser für wettbewerbsintensive Keywords. Nutzen Sie diesen Wortzähler, um sicherzustellen, dass Ihre Artikel die optimale Länge erreichen.',
        'Die Lesezeit-Schätzung basiert auf der durchschnittlichen Lesegeschwindigkeit eines Erwachsenen von 200 Wörtern pro Minute. Dies ist dieselbe Formel, die Plattformen wie Medium verwenden, um geschätzte Lesezeiten anzuzeigen. Entdecken Sie auch unseren <a href="/de/tools/character-counter" class="text-blue-600 underline">Zeichenzähler</a> und den <a href="/de/tools/text-case-converter" class="text-blue-600 underline">Groß-/Kleinschreibung-Konverter</a> für weitere Textanalyse-Tools.',
      ],
      faq: [
        { q: 'Wie zählt der Wortzähler die Wörter?', a: 'Das Tool teilt Ihren Text an Leerzeichen (Spaces, Tabs, Zeilenumbrüche) und zählt jedes resultierende Segment. Dies ist dieselbe Methode, die von den meisten Textverarbeitungsprogrammen wie Microsoft Word und Google Docs verwendet wird.' },
        { q: 'Funktioniert der Wortzähler auch mit anderen Sprachen als Deutsch?', a: 'Ja. Der Zähler funktioniert mit jeder Sprache, die Wörter durch Leerzeichen trennt, einschließlich Englisch, Spanisch, Französisch, Italienisch und Portugiesisch.' },
        { q: 'Wie wird die Lesezeit geschätzt?', a: 'Die Lesezeit wird berechnet, indem die Gesamtwortzahl durch 200 (die durchschnittliche Lesegeschwindigkeit eines Erwachsenen in Wörtern pro Minute) geteilt wird. Das Ergebnis wird aufgerundet, mit einem Minimum von 1 Minute.' },
        { q: 'Kann ich dieses Tool nutzen, um Zeichenlimits für Social Media zu prüfen?', a: 'Auf jeden Fall. Twitter/X hat ein Limit von 280 Zeichen, Instagram-Beschriftungen erlauben 2.200 Zeichen und LinkedIn-Beiträge haben ein Maximum von 3.000 Zeichen.' },
        { q: 'Wird mein Text gespeichert oder an einen Server gesendet?', a: 'Nein. Die gesamte Verarbeitung erfolgt vollständig in Ihrem Browser mittels JavaScript. Ihr Text verlässt niemals Ihr Gerät, was vollständige Privatsphäre gewährleistet.' },
      ],
    },
    pt: {
      title: 'Contador de Palavras Online Grátis – Conte Palavras, Caracteres e Mais',
      paragraphs: [
        'Seja você um estudante finalizando uma redação, um blogueiro escrevendo um post ou um redator cumprindo um briefing rigoroso, saber a contagem exata de palavras do seu texto é essencial. Nosso contador de palavras online gratuito fornece estatísticas instantâneas e precisas no momento em que você digita ou cola seu conteúdo.',
        'Além da simples contagem de palavras, esta ferramenta decompõe seu texto em caracteres (com e sem espaços), frases, parágrafos e tempo de leitura estimado. Essas métricas são importantes para SEO, limites de redes sociais, trabalhos acadêmicos e redação profissional.',
        'Mecanismos de busca como o Google consideram o comprimento do conteúdo como um dos fatores de ranqueamento. Artigos entre 1.500 e 2.500 palavras tendem a se posicionar melhor para palavras-chave competitivas. Use este contador para garantir que seus artigos atinjam o comprimento ideal.',
        'A estimativa de tempo de leitura é baseada na velocidade média de leitura de um adulto de 200 palavras por minuto. É a mesma fórmula usada por plataformas como o Medium para exibir tempos de leitura estimados. Explore também nosso <a href="/pt/tools/character-counter" class="text-blue-600 underline">Contador de Caracteres</a> e o <a href="/pt/tools/text-case-converter" class="text-blue-600 underline">Conversor de Maiúsculas/Minúsculas</a> para mais ferramentas de análise de texto.',
      ],
      faq: [
        { q: 'Como o contador calcula as palavras?', a: 'A ferramenta divide seu texto por espaços em branco (espaços, tabulações, quebras de linha) e conta cada segmento resultante. É o mesmo método usado pela maioria dos processadores de texto como Microsoft Word e Google Docs.' },
        { q: 'O contador funciona com outros idiomas além do português?', a: 'Sim. O contador funciona com qualquer idioma que separe palavras com espaços, incluindo inglês, espanhol, francês, alemão e italiano.' },
        { q: 'Como o tempo de leitura é estimado?', a: 'O tempo de leitura é calculado dividindo o total de palavras por 200 (a velocidade média de leitura de um adulto em palavras por minuto). O resultado é arredondado para cima, com um mínimo de 1 minuto.' },
        { q: 'Posso usar esta ferramenta para verificar limites de caracteres em redes sociais?', a: 'Com certeza. O Twitter/X tem um limite de 280 caracteres, as legendas do Instagram permitem 2.200 caracteres e as publicações do LinkedIn têm um máximo de 3.000 caracteres.' },
        { q: 'Meu texto é armazenado ou enviado para um servidor?', a: 'Não. Todo o processamento acontece inteiramente no seu navegador usando JavaScript. Seu texto nunca sai do seu dispositivo, garantindo privacidade total.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="word-counter" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Result Cards */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
          {cardData.map((stat) => (
            <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-lg p-3 text-center`}>
              <div className={`text-2xl font-bold ${stat.text}`}>{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Reading Time Progress Bar */}
        <div className="mb-4 bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">{labels.readingProgress[lang]}</span>
            <span className="text-sm font-semibold text-cyan-700">{readingTime} {labels.reading[lang]}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
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
            onClick={handleCopy}
            className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {copied ? labels.copiedMsg[lang] : labels.copyResults[lang]}
          </button>
          <button
            onClick={handleSaveAnalysis}
            className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            {labels.saveAnalysis[lang]}
          </button>
          <button
            onClick={handleReset}
            className="bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            {labels.reset[lang]}
          </button>
        </div>

        {/* Additional Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">{labels.avgWordLen[lang]}</div>
            <div className="text-xl font-bold text-indigo-700">{avgWordLength}</div>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">{labels.longestWord[lang]}</div>
            <div className="text-xl font-bold text-teal-700 truncate">{longestWord || '-'}</div>
          </div>
        </div>

        {/* Top 5 Words */}
        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 mb-3">{labels.topWords[lang]}</div>
          {topWords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {topWords.map((tw, i) => (
                <span
                  key={i}
                  className="inline-flex items-center bg-white border border-orange-300 rounded-full px-3 py-1 text-sm"
                >
                  <span className="font-semibold text-orange-700">{tw.word}</span>
                  <span className="ml-1.5 text-xs text-gray-500">({tw.count}x)</span>
                </span>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400">-</div>
          )}
        </div>

        {/* History */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 mb-3">{labels.history[lang]}</div>
          {history.length > 0 ? (
            <div className="space-y-2">
              {history.map((entry, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex justify-between items-center text-sm">
                  <span className="text-gray-600 truncate mr-3">&ldquo;{entry.preview}&rdquo;</span>
                  <span className="text-gray-500 whitespace-nowrap">
                    {entry.words} {labels.words[lang].toLowerCase()} &middot; {entry.readingTime} {labels.reading[lang]}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400">{labels.noHistory[lang]}</div>
          )}
        </div>

        {/* SEO Article */}
        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: p }} />)}
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