'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const FONTS = [
  { name: 'Arial', family: 'Arial, sans-serif', type: 'web-safe' },
  { name: 'Helvetica', family: 'Helvetica, Arial, sans-serif', type: 'web-safe' },
  { name: 'Georgia', family: 'Georgia, serif', type: 'web-safe' },
  { name: 'Times New Roman', family: '"Times New Roman", Times, serif', type: 'web-safe' },
  { name: 'Courier New', family: '"Courier New", Courier, monospace', type: 'web-safe' },
  { name: 'Verdana', family: 'Verdana, sans-serif', type: 'web-safe' },
  { name: 'Impact', family: 'Impact, sans-serif', type: 'web-safe' },
  { name: 'Comic Sans MS', family: '"Comic Sans MS", cursive', type: 'web-safe' },
  { name: 'Trebuchet MS', family: '"Trebuchet MS", sans-serif', type: 'web-safe' },
  { name: 'Palatino', family: '"Palatino Linotype", "Book Antiqua", Palatino, serif', type: 'web-safe' },
  { name: 'Garamond', family: 'Garamond, serif', type: 'web-safe' },
  { name: 'system-ui', family: 'system-ui', type: 'generic' },
  { name: 'monospace', family: 'monospace', type: 'generic' },
  { name: 'cursive', family: 'cursive', type: 'generic' },
  { name: 'fantasy', family: 'fantasy', type: 'generic' },
  { name: 'serif', family: 'serif', type: 'generic' },
  { name: 'sans-serif', family: 'sans-serif', type: 'generic' },
  { name: 'Roboto', family: '"Roboto", sans-serif', type: 'google' },
  { name: 'Open Sans', family: '"Open Sans", sans-serif', type: 'google' },
  { name: 'Lato', family: '"Lato", sans-serif', type: 'google' },
  { name: 'Montserrat', family: '"Montserrat", sans-serif', type: 'google' },
  { name: 'Poppins', family: '"Poppins", sans-serif', type: 'google' },
  { name: 'Inter', family: '"Inter", sans-serif', type: 'google' },
  { name: 'Playfair Display', family: '"Playfair Display", serif', type: 'google' },
  { name: 'Merriweather', family: '"Merriweather", serif', type: 'google' },
  { name: 'Raleway', family: '"Raleway", sans-serif', type: 'google' },
  { name: 'Nunito', family: '"Nunito", sans-serif', type: 'google' },
  { name: 'Ubuntu', family: '"Ubuntu", sans-serif', type: 'google' },
  { name: 'Oswald', family: '"Oswald", sans-serif', type: 'google' },
  { name: 'Source Code Pro', family: '"Source Code Pro", monospace', type: 'google' },
  { name: 'Fira Code', family: '"Fira Code", monospace', type: 'google' },
  { name: 'Dancing Script', family: '"Dancing Script", cursive', type: 'google' },
  { name: 'Pacifico', family: '"Pacifico", cursive', type: 'google' },
];

const GOOGLE_FONTS = FONTS.filter(f => f.type === 'google').map(f => f.name);

export default function FontIdentifier() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['font-identifier'][lang];

  const [sampleText, setSampleText] = useState('The quick brown fox jumps over the lazy dog');
  const [fontSize, setFontSize] = useState(24);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [color, setColor] = useState('#1f2937');
  const [compareMode, setCompareMode] = useState(false);
  const [compareA, setCompareA] = useState('Roboto');
  const [compareB, setCompareB] = useState('Playfair Display');
  const [copied, setCopied] = useState('');
  const [filter, setFilter] = useState<'all' | 'web-safe' | 'google' | 'generic'>('all');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const families = GOOGLE_FONTS.map(f => f.replace(/ /g, '+')).join('&family=');
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const labels: Record<string, Record<Locale, string>> = {
    sampleText: { en: 'Sample Text', it: 'Testo di Esempio', es: 'Texto de Ejemplo', fr: 'Texte d\'Exemple', de: 'Beispieltext', pt: 'Texto de Exemplo' },
    fontSize: { en: 'Font Size', it: 'Dimensione Font', es: 'Tamaño de Fuente', fr: 'Taille de Police', de: 'Schriftgröße', pt: 'Tamanho da Fonte' },
    lineHeight: { en: 'Line Height', it: 'Interlinea', es: 'Altura de Línea', fr: 'Hauteur de Ligne', de: 'Zeilenhöhe', pt: 'Altura da Linha' },
    letterSpacing: { en: 'Letter Spacing', it: 'Spaziatura Lettere', es: 'Espaciado de Letras', fr: 'Espacement des Lettres', de: 'Buchstabenabstand', pt: 'Espaçamento de Letras' },
    color: { en: 'Color', it: 'Colore', es: 'Color', fr: 'Couleur', de: 'Farbe', pt: 'Cor' },
    compare: { en: 'Compare Mode', it: 'Modalità Confronto', es: 'Modo Comparar', fr: 'Mode Comparaison', de: 'Vergleichsmodus', pt: 'Modo Comparação' },
    browse: { en: 'Browse Fonts', it: 'Sfoglia Font', es: 'Explorar Fuentes', fr: 'Parcourir les Polices', de: 'Schriften Durchsuchen', pt: 'Explorar Fontes' },
    all: { en: 'All', it: 'Tutti', es: 'Todos', fr: 'Tous', de: 'Alle', pt: 'Todos' },
    webSafe: { en: 'Web Safe', it: 'Web Safe', es: 'Web Safe', fr: 'Web Safe', de: 'Web Safe', pt: 'Web Safe' },
    google: { en: 'Google', it: 'Google', es: 'Google', fr: 'Google', de: 'Google', pt: 'Google' },
    generic: { en: 'Generic', it: 'Generici', es: 'Genéricos', fr: 'Génériques', de: 'Generisch', pt: 'Genéricos' },
    copyCSS: { en: 'Copy CSS', it: 'Copia CSS', es: 'Copiar CSS', fr: 'Copier CSS', de: 'CSS Kopieren', pt: 'Copiar CSS' },
    copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié!', de: 'Kopiert!', pt: 'Copiado!' },
    fontA: { en: 'Font A', it: 'Font A', es: 'Fuente A', fr: 'Police A', de: 'Schrift A', pt: 'Fonte A' },
    fontB: { en: 'Font B', it: 'Font B', es: 'Fuente B', fr: 'Police B', de: 'Schrift B', pt: 'Fonte B' },
    vs: { en: 'vs', it: 'vs', es: 'vs', fr: 'vs', de: 'vs', pt: 'vs' },
    px: { en: 'px', it: 'px', es: 'px', fr: 'px', de: 'px', pt: 'px' },
  };

  const filteredFonts = filter === 'all' ? FONTS : FONTS.filter(f => f.type === filter);

  const getCSSString = (fontName: string) => {
    const font = FONTS.find(f => f.name === fontName);
    return `font-family: ${font?.family || fontName};\nfont-size: ${fontSize}px;\nline-height: ${lineHeight};\nletter-spacing: ${letterSpacing}px;\ncolor: ${color};`;
  };

  const handleCopyCSS = (fontName: string) => {
    navigator.clipboard.writeText(getCSSString(fontName));
    setCopied(fontName);
    setTimeout(() => setCopied(''), 2000);
  };

  const getFontFamily = (name: string) => FONTS.find(f => f.name === name)?.family || name;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Font Preview and Comparison Tool: Find the Perfect Typeface',
      paragraphs: [
        'Choosing the right font is one of the most impactful design decisions you can make. Typography affects readability, brand perception, user experience, and even conversion rates. A font preview tool lets you visualize how different typefaces look with your actual content before committing to a choice.',
        'This tool includes over 30 popular fonts spanning web-safe fonts like Arial, Georgia, and Verdana, generic CSS families like serif and monospace, and popular Google Fonts like Roboto, Montserrat, and Playfair Display. Each font renders your custom sample text in real time with adjustable size, line height, letter spacing, and color.',
        'The side-by-side comparison mode is particularly useful for narrowing down your final candidates. Select two fonts and see them rendered identically, making it easy to spot differences in weight, width, x-height, and overall character. You can also copy the CSS for any font with one click.',
        'For web projects, consider font loading performance. Web-safe fonts load instantly because they are pre-installed on most devices. Google Fonts require an HTTP request but offer far more variety. The generic families (serif, sans-serif, monospace) serve as reliable fallbacks in your font stack.'
      ],
      faq: [
        { q: 'What are web-safe fonts?', a: 'Web-safe fonts are typefaces pre-installed on virtually all operating systems and devices, such as Arial, Georgia, Times New Roman, and Verdana. They load instantly without any external requests, making them the fastest option for web typography.' },
        { q: 'How do I add Google Fonts to my website?', a: 'Add a link tag in your HTML head pointing to fonts.googleapis.com with the desired font families, then reference the font-family in your CSS. Alternatively, download the font files and self-host them for better performance and privacy.' },
        { q: 'What is the difference between serif and sans-serif?', a: 'Serif fonts have small decorative strokes at the end of letterforms (like Times New Roman), while sans-serif fonts do not (like Arial). Serifs are traditionally used for print body text; sans-serifs are preferred for screen readability.' },
        { q: 'How many fonts should I use on a website?', a: 'Best practice is to use 2-3 fonts maximum: one for headings, one for body text, and optionally one for accents or code. Too many fonts create visual clutter and slow page loading.' },
        { q: 'Does this tool upload my text anywhere?', a: 'No. All font rendering happens in your browser. Your sample text is never sent to any server. Google Fonts are loaded via the standard Google Fonts CDN stylesheet.' }
      ]
    },
    it: {
      title: 'Anteprima e Confronto Font: Trova il Carattere Perfetto',
      paragraphs: [
        'Scegliere il font giusto è una delle decisioni di design più importanti. La tipografia influenza leggibilità, percezione del brand, esperienza utente e persino i tassi di conversione. Uno strumento di anteprima font ti permette di visualizzare come appaiono diversi caratteri con il tuo contenuto reale.',
        'Questo strumento include oltre 30 font popolari tra web-safe come Arial, Georgia e Verdana, famiglie CSS generiche come serif e monospace, e popolari Google Fonts come Roboto, Montserrat e Playfair Display. Ogni font renderizza il tuo testo personalizzato in tempo reale.',
        'La modalità confronto fianco a fianco è particolarmente utile per restringere i candidati finali. Seleziona due font e visualizzali renderizzati identicamente, facilitando il confronto di peso, larghezza e carattere generale. Puoi anche copiare il CSS con un clic.',
        'Per progetti web, considera le prestazioni di caricamento. I font web-safe si caricano istantaneamente. I Google Fonts richiedono una richiesta HTTP ma offrono più varietà. Le famiglie generiche servono come fallback affidabili.'
      ],
      faq: [
        { q: 'Cosa sono i font web-safe?', a: 'Sono font preinstallati su praticamente tutti i sistemi operativi, come Arial, Georgia e Verdana. Si caricano istantaneamente senza richieste esterne.' },
        { q: 'Come aggiungo Google Fonts al mio sito?', a: 'Aggiungi un tag link nell\'head HTML che punta a fonts.googleapis.com, poi usa font-family nel CSS. In alternativa, scarica i file e ospitali localmente.' },
        { q: 'Qual è la differenza tra serif e sans-serif?', a: 'I font serif hanno piccoli tratti decorativi alle estremità (come Times New Roman), i sans-serif no (come Arial). I serif sono tradizionali per la stampa, i sans-serif preferiti per lo schermo.' },
        { q: 'Quanti font dovrei usare in un sito?', a: 'La pratica migliore è 2-3 font massimo: uno per i titoli, uno per il corpo del testo, e opzionalmente uno per accenti o codice.' },
        { q: 'Il mio testo viene caricato da qualche parte?', a: 'No. Tutto il rendering avviene nel browser. Il testo non viene mai inviato a server. I Google Fonts sono caricati tramite il CDN standard di Google Fonts.' }
      ]
    },
    es: {
      title: 'Herramienta de Vista Previa y Comparación de Fuentes',
      paragraphs: [
        'Elegir la fuente correcta es una de las decisiones de diseño más impactantes. La tipografía afecta la legibilidad, la percepción de marca, la experiencia del usuario y las tasas de conversión. Esta herramienta te permite visualizar cómo se ven diferentes fuentes con tu contenido real.',
        'Incluye más de 30 fuentes populares: web-safe como Arial, Georgia y Verdana, familias CSS genéricas como serif y monospace, y populares Google Fonts como Roboto, Montserrat y Playfair Display. Cada fuente renderiza tu texto en tiempo real.',
        'El modo de comparación lado a lado es útil para reducir candidatos finales. Selecciona dos fuentes y vélas renderizadas idénticamente. También puedes copiar el CSS con un clic.',
        'Para proyectos web, considera el rendimiento de carga. Las fuentes web-safe se cargan al instante. Las Google Fonts requieren una solicitud HTTP pero ofrecen más variedad. Las familias genéricas sirven como fallbacks confiables.'
      ],
      faq: [
        { q: '¿Qué son las fuentes web-safe?', a: 'Son fuentes preinstaladas en casi todos los sistemas operativos, como Arial, Georgia y Verdana. Se cargan al instante sin solicitudes externas.' },
        { q: '¿Cómo agrego Google Fonts a mi sitio?', a: 'Agrega un tag link en el head HTML apuntando a fonts.googleapis.com, luego usa font-family en tu CSS.' },
        { q: '¿Cuál es la diferencia entre serif y sans-serif?', a: 'Las fuentes serif tienen trazos decorativos (como Times New Roman), las sans-serif no (como Arial). Las serif son tradicionales para impresión, las sans-serif preferidas para pantallas.' },
        { q: '¿Cuántas fuentes debo usar en un sitio web?', a: 'La mejor práctica es 2-3 fuentes máximo: una para títulos, una para texto y opcionalmente una para acentos o código.' },
        { q: '¿Mi texto se sube a algún lugar?', a: 'No. Todo el renderizado ocurre en tu navegador. El texto nunca se envía a servidores.' }
      ]
    },
    fr: {
      title: 'Outil d\'Aperçu et de Comparaison de Polices',
      paragraphs: [
        'Choisir la bonne police est l\'une des décisions de design les plus importantes. La typographie affecte la lisibilité, la perception de marque, l\'expérience utilisateur et les taux de conversion. Cet outil vous permet de visualiser différentes polices avec votre contenu réel.',
        'Il comprend plus de 30 polices populaires : web-safe comme Arial, Georgia et Verdana, familles CSS génériques comme serif et monospace, et des Google Fonts populaires comme Roboto, Montserrat et Playfair Display.',
        'Le mode de comparaison côte à côte est particulièrement utile pour affiner vos choix. Sélectionnez deux polices et visualisez-les rendues de façon identique. Vous pouvez aussi copier le CSS en un clic.',
        'Pour les projets web, considérez les performances de chargement. Les polices web-safe se chargent instantanément. Les Google Fonts nécessitent une requête HTTP mais offrent plus de variété.'
      ],
      faq: [
        { q: 'Que sont les polices web-safe ?', a: 'Ce sont des polices préinstallées sur presque tous les systèmes, comme Arial, Georgia et Verdana. Elles se chargent instantanément.' },
        { q: 'Comment ajouter Google Fonts à mon site ?', a: 'Ajoutez un tag link dans le head HTML pointant vers fonts.googleapis.com, puis utilisez font-family dans votre CSS.' },
        { q: 'Quelle est la différence entre serif et sans-serif ?', a: 'Les polices serif ont des traits décoratifs (comme Times New Roman), les sans-serif non (comme Arial). Les serifs sont traditionnelles pour l\'impression.' },
        { q: 'Combien de polices dois-je utiliser ?', a: 'La meilleure pratique est 2-3 polices maximum : une pour les titres, une pour le texte, et optionnellement une pour les accents.' },
        { q: 'Mon texte est-il envoyé quelque part ?', a: 'Non. Tout le rendu se fait dans votre navigateur. Le texte n\'est jamais envoyé à un serveur.' }
      ]
    },
    de: {
      title: 'Schriftarten-Vorschau und Vergleichswerkzeug',
      paragraphs: [
        'Die richtige Schriftart zu wählen ist eine der wirkungsvollsten Designentscheidungen. Typografie beeinflusst Lesbarkeit, Markenwahrnehmung, Benutzererfahrung und Konversionsraten. Dieses Tool ermöglicht es, verschiedene Schriftarten mit Ihrem echten Inhalt zu visualisieren.',
        'Es enthält über 30 beliebte Schriften: Web-Safe wie Arial, Georgia und Verdana, generische CSS-Familien wie serif und monospace, sowie beliebte Google Fonts wie Roboto, Montserrat und Playfair Display.',
        'Der Seite-an-Seite-Vergleichsmodus ist besonders nützlich, um die endgültigen Kandidaten einzugrenzen. Wählen Sie zwei Schriften und sehen Sie sie identisch gerendert. Sie können auch das CSS mit einem Klick kopieren.',
        'Für Webprojekte beachten Sie die Ladeleistung. Web-Safe-Schriften laden sofort. Google Fonts erfordern eine HTTP-Anfrage, bieten aber mehr Vielfalt.'
      ],
      faq: [
        { q: 'Was sind Web-Safe-Schriften?', a: 'Schriften, die auf fast allen Betriebssystemen vorinstalliert sind, wie Arial, Georgia und Verdana. Sie laden sofort ohne externe Anfragen.' },
        { q: 'Wie füge ich Google Fonts zu meiner Website hinzu?', a: 'Fügen Sie ein Link-Tag im HTML-Head hinzu, das auf fonts.googleapis.com zeigt, dann verwenden Sie font-family in Ihrem CSS.' },
        { q: 'Was ist der Unterschied zwischen Serif und Sans-Serif?', a: 'Serif-Schriften haben dekorative Striche (wie Times New Roman), Sans-Serif nicht (wie Arial). Serifs sind traditionell für Druck, Sans-Serifs für Bildschirme bevorzugt.' },
        { q: 'Wie viele Schriften sollte ich verwenden?', a: 'Best Practice sind maximal 2-3 Schriften: eine für Überschriften, eine für Fließtext und optional eine für Akzente oder Code.' },
        { q: 'Wird mein Text irgendwohin gesendet?', a: 'Nein. Das gesamte Rendering erfolgt in Ihrem Browser. Text wird nie an Server gesendet.' }
      ]
    },
    pt: {
      title: 'Ferramenta de Pré-visualização e Comparação de Fontes',
      paragraphs: [
        'Escolher a fonte certa é uma das decisões de design mais impactantes. A tipografia afeta legibilidade, percepção de marca, experiência do usuário e taxas de conversão. Esta ferramenta permite visualizar como diferentes fontes ficam com seu conteúdo real.',
        'Inclui mais de 30 fontes populares: web-safe como Arial, Georgia e Verdana, famílias CSS genéricas como serif e monospace, e populares Google Fonts como Roboto, Montserrat e Playfair Display.',
        'O modo de comparação lado a lado é útil para reduzir candidatos finais. Selecione duas fontes e veja-as renderizadas de forma idêntica. Você também pode copiar o CSS com um clique.',
        'Para projetos web, considere o desempenho de carregamento. Fontes web-safe carregam instantaneamente. Google Fonts requerem uma requisição HTTP mas oferecem mais variedade.'
      ],
      faq: [
        { q: 'O que são fontes web-safe?', a: 'São fontes pré-instaladas em praticamente todos os sistemas operacionais, como Arial, Georgia e Verdana. Carregam instantaneamente sem requisições externas.' },
        { q: 'Como adiciono Google Fonts ao meu site?', a: 'Adicione uma tag link no head HTML apontando para fonts.googleapis.com, depois use font-family no seu CSS.' },
        { q: 'Qual a diferença entre serif e sans-serif?', a: 'Fontes serif têm traços decorativos (como Times New Roman), sans-serif não (como Arial). Serifs são tradicionais para impressão, sans-serifs preferidas para telas.' },
        { q: 'Quantas fontes devo usar em um site?', a: 'A melhor prática é 2-3 fontes no máximo: uma para títulos, uma para texto e opcionalmente uma para acentos ou código.' },
        { q: 'Meu texto é enviado para algum lugar?', a: 'Não. Todo o renderizado acontece no seu navegador. O texto nunca é enviado a servidores.' }
      ]
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="font-identifier" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          {/* Sample text input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.sampleText[lang]}</label>
            <textarea
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
            />
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{labels.fontSize[lang]}</label>
              <div className="flex items-center gap-2">
                <input type="range" min="10" max="72" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="flex-1" />
                <span className="text-xs text-gray-500 w-10">{fontSize}{labels.px[lang]}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{labels.lineHeight[lang]}</label>
              <div className="flex items-center gap-2">
                <input type="range" min="0.8" max="3" step="0.1" value={lineHeight} onChange={(e) => setLineHeight(Number(e.target.value))} className="flex-1" />
                <span className="text-xs text-gray-500 w-8">{lineHeight}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{labels.letterSpacing[lang]}</label>
              <div className="flex items-center gap-2">
                <input type="range" min="-3" max="10" step="0.5" value={letterSpacing} onChange={(e) => setLetterSpacing(Number(e.target.value))} className="flex-1" />
                <span className="text-xs text-gray-500 w-10">{letterSpacing}{labels.px[lang]}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{labels.color[lang]}</label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-8 rounded cursor-pointer border border-gray-300" />
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setCompareMode(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!compareMode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {labels.browse[lang]}
            </button>
            <button
              onClick={() => setCompareMode(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${compareMode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {labels.compare[lang]}
            </button>
          </div>

          {/* Compare Mode */}
          {compareMode ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{labels.fontA[lang]}</label>
                  <select value={compareA} onChange={(e) => setCompareA(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                    {FONTS.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{labels.fontB[lang]}</label>
                  <select value={compareB} onChange={(e) => setCompareB(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                    {FONTS.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[{ name: compareA, label: labels.fontA[lang] }, { name: compareB, label: labels.fontB[lang] }].map((item) => (
                  <div key={item.name + item.label} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-blue-600">{item.name}</span>
                      <button
                        onClick={() => handleCopyCSS(item.name)}
                        className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        {copied === item.name ? labels.copied[lang] : labels.copyCSS[lang]}
                      </button>
                    </div>
                    <div
                      style={{
                        fontFamily: getFontFamily(item.name),
                        fontSize: `${fontSize}px`,
                        lineHeight,
                        letterSpacing: `${letterSpacing}px`,
                        color,
                      }}
                      className="break-words"
                    >
                      {sampleText}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Filter tabs */}
              <div className="flex gap-2 flex-wrap">
                {(['all', 'web-safe', 'google', 'generic'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === f ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {f === 'all' ? labels.all[lang] : f === 'web-safe' ? labels.webSafe[lang] : f === 'google' ? labels.google[lang] : labels.generic[lang]}
                    <span className="ml-1 text-gray-400">({f === 'all' ? FONTS.length : FONTS.filter(x => x.type === f).length})</span>
                  </button>
                ))}
              </div>

              {/* Font grid */}
              <div className="space-y-3">
                {filteredFonts.map((font) => (
                  <div key={font.name} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{font.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${font.type === 'google' ? 'bg-blue-50 text-blue-600' : font.type === 'web-safe' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                          {font.type}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyCSS(font.name)}
                        className="text-xs text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1"
                      >
                        {copied === font.name ? (
                          <><svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{labels.copied[lang]}</>
                        ) : (
                          <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>{labels.copyCSS[lang]}</>
                        )}
                      </button>
                    </div>
                    <div
                      style={{
                        fontFamily: font.family,
                        fontSize: `${fontSize}px`,
                        lineHeight,
                        letterSpacing: `${letterSpacing}px`,
                        color,
                      }}
                      className="break-words"
                    >
                      {sampleText}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

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
