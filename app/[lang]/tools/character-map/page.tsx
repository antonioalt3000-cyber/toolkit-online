'use client';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const CATEGORIES = [
  {
    id: 'arrows',
    chars: ['\u2190', '\u2191', '\u2192', '\u2193', '\u2194', '\u2195', '\u2196', '\u2197', '\u2198', '\u2199', '\u21A9', '\u21AA', '\u27A1', '\u2B05', '\u2B06', '\u2B07', '\u21D0', '\u21D1', '\u21D2', '\u21D3', '\u21D4', '\u21D5', '\u27F5', '\u27F6'],
  },
  {
    id: 'math',
    chars: ['\u00B1', '\u00D7', '\u00F7', '\u2260', '\u2264', '\u2265', '\u221E', '\u2211', '\u220F', '\u221A', '\u222B', '\u2202', '\u2207', '\u2248', '\u2261', '\u2282', '\u2283', '\u2286', '\u2287', '\u2208', '\u2209', '\u2205', '\u2229', '\u222A', '\u00B2', '\u00B3', '\u2070', '\u00BC', '\u00BD', '\u00BE'],
  },
  {
    id: 'currency',
    chars: ['$', '\u20AC', '\u00A3', '\u00A5', '\u20A3', '\u20B9', '\u20A9', '\u20BD', '\u20B1', '\u20AB', '\u20BA', '\u20B4', '\u20BF', '\u00A2', '\u20A0', '\u20A1', '\u20A2', '\u20A4', '\u20A6', '\u20A7', '\u20A8'],
  },
  {
    id: 'punctuation',
    chars: ['\u2022', '\u2023', '\u25E6', '\u2043', '\u2219', '\u00B7', '\u2013', '\u2014', '\u2026', '\u00AB', '\u00BB', '\u2018', '\u2019', '\u201C', '\u201D', '\u2039', '\u203A', '\u00A7', '\u00B6', '\u2020', '\u2021', '\u203B', '\u2042'],
  },
  {
    id: 'shapes',
    chars: ['\u25A0', '\u25A1', '\u25AA', '\u25AB', '\u25B2', '\u25B3', '\u25BC', '\u25BD', '\u25C6', '\u25C7', '\u25CB', '\u25CF', '\u25D0', '\u25D1', '\u2605', '\u2606', '\u2660', '\u2663', '\u2665', '\u2666', '\u2764', '\u2716', '\u2714', '\u2718'],
  },
  {
    id: 'greek',
    chars: ['\u0391', '\u0392', '\u0393', '\u0394', '\u0395', '\u0396', '\u0397', '\u0398', '\u0399', '\u039A', '\u039B', '\u039C', '\u039D', '\u039E', '\u039F', '\u03A0', '\u03A1', '\u03A3', '\u03A4', '\u03A5', '\u03A6', '\u03A7', '\u03A8', '\u03A9', '\u03B1', '\u03B2', '\u03B3', '\u03B4', '\u03B5', '\u03B6', '\u03B7', '\u03B8', '\u03B9', '\u03BA', '\u03BB', '\u03BC', '\u03BD', '\u03BE', '\u03BF', '\u03C0', '\u03C1', '\u03C3', '\u03C4', '\u03C5', '\u03C6', '\u03C7', '\u03C8', '\u03C9'],
  },
  {
    id: 'emoji',
    chars: ['\u{1F600}', '\u{1F601}', '\u{1F602}', '\u{1F603}', '\u{1F604}', '\u{1F605}', '\u{1F606}', '\u{1F609}', '\u{1F60A}', '\u{1F60D}', '\u{1F618}', '\u{1F60E}', '\u{1F914}', '\u{1F923}', '\u{1F62D}', '\u{1F621}', '\u{1F44D}', '\u{1F44E}', '\u{1F44F}', '\u{1F64F}', '\u{1F525}', '\u{2728}', '\u{1F4A1}', '\u{1F680}', '\u{2705}', '\u{274C}', '\u{26A0}', '\u{1F4E7}', '\u{1F3AF}', '\u{1F4BB}'],
  },
  {
    id: 'misc',
    chars: ['\u00A9', '\u00AE', '\u2122', '\u00B0', '\u2103', '\u2109', '\u00B5', '\u2126', '\u212B', '\u266A', '\u266B', '\u266C', '\u266D', '\u266E', '\u266F', '\u2602', '\u2603', '\u2604', '\u2615', '\u231A', '\u231B', '\u23F0', '\u2328', '\u2709'],
  },
];

const CATEGORY_LABELS: Record<string, Record<Locale, string>> = {
  arrows: { en: 'Arrows', it: 'Frecce', es: 'Flechas', fr: 'Flèches', de: 'Pfeile', pt: 'Setas' },
  math: { en: 'Math', it: 'Matematica', es: 'Matemáticas', fr: 'Math', de: 'Mathe', pt: 'Matemática' },
  currency: { en: 'Currency', it: 'Valute', es: 'Monedas', fr: 'Devises', de: 'Währung', pt: 'Moedas' },
  punctuation: { en: 'Punctuation', it: 'Punteggiatura', es: 'Puntuación', fr: 'Ponctuation', de: 'Zeichensetzung', pt: 'Pontuação' },
  shapes: { en: 'Shapes', it: 'Forme', es: 'Formas', fr: 'Formes', de: 'Formen', pt: 'Formas' },
  greek: { en: 'Greek', it: 'Greco', es: 'Griego', fr: 'Grec', de: 'Griechisch', pt: 'Grego' },
  emoji: { en: 'Emoji', it: 'Emoji', es: 'Emoji', fr: 'Emoji', de: 'Emoji', pt: 'Emoji' },
  misc: { en: 'Miscellaneous', it: 'Varie', es: 'Varios', fr: 'Divers', de: 'Verschiedenes', pt: 'Diversos' },
};

export default function CharacterMap() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['character-map'][lang];

  const [selectedCategory, setSelectedCategory] = useState('arrows');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const [selectedChar, setSelectedChar] = useState<string | null>(null);

  const labels = {
    search: { en: 'Search by character or code...', it: 'Cerca per carattere o codice...', es: 'Buscar por carácter o código...', fr: 'Rechercher par caractère ou code...', de: 'Nach Zeichen oder Code suchen...', pt: 'Buscar por caractere ou código...' },
    clickToCopy: { en: 'Click any character to copy', it: 'Clicca un carattere per copiarlo', es: 'Haz clic en un carácter para copiarlo', fr: 'Cliquez sur un caractère pour le copier', de: 'Klicken Sie auf ein Zeichen zum Kopieren', pt: 'Clique em um caractere para copiar' },
    copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
    recentlyUsed: { en: 'Recently Used', it: 'Usati di Recente', es: 'Usados Recientemente', fr: 'Utilisés Récemment', de: 'Kürzlich Verwendet', pt: 'Usados Recentemente' },
    charInfo: { en: 'Character Info', it: 'Info Carattere', es: 'Info Carácter', fr: 'Info Caractère', de: 'Zeicheninfo', pt: 'Info Caractere' },
    unicode: { en: 'Unicode', it: 'Unicode', es: 'Unicode', fr: 'Unicode', de: 'Unicode', pt: 'Unicode' },
    htmlEntity: { en: 'HTML Entity', it: 'Entità HTML', es: 'Entidad HTML', fr: 'Entité HTML', de: 'HTML-Entität', pt: 'Entidade HTML' },
    cssCode: { en: 'CSS Code', it: 'Codice CSS', es: 'Código CSS', fr: 'Code CSS', de: 'CSS-Code', pt: 'Código CSS' },
    copyChar: { en: 'Copy Character', it: 'Copia Carattere', es: 'Copiar Carácter', fr: 'Copier Caractère', de: 'Zeichen Kopieren', pt: 'Copiar Caractere' },
    copyCode: { en: 'Copy Code', it: 'Copia Codice', es: 'Copiar Código', fr: 'Copier Code', de: 'Code Kopieren', pt: 'Copiar Código' },
  } as Record<string, Record<Locale, string>>;

  const allChars = useMemo(() => CATEGORIES.flatMap(c => c.chars.map(ch => ({ char: ch, category: c.id }))), []);

  const filteredChars = useMemo(() => {
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      return allChars.filter(({ char }) => {
        const code = char.codePointAt(0) || 0;
        const hex = code.toString(16).toUpperCase();
        return char.includes(s) || `U+${hex}`.toLowerCase().includes(s) || `&#${code};`.includes(s);
      });
    }
    const cat = CATEGORIES.find(c => c.id === selectedCategory);
    return cat ? cat.chars.map(ch => ({ char: ch, category: cat.id })) : [];
  }, [search, selectedCategory, allChars]);

  const copyToClipboard = (char: string) => {
    navigator.clipboard.writeText(char);
    setCopied(char);
    setSelectedChar(char);
    setRecentlyUsed(prev => {
      const updated = [char, ...prev.filter(c => c !== char)].slice(0, 20);
      return updated;
    });
    setTimeout(() => setCopied(null), 1500);
  };

  const getCharInfo = (char: string) => {
    const code = char.codePointAt(0) || 0;
    const hex = code.toString(16).toUpperCase().padStart(4, '0');
    return {
      unicode: `U+${hex}`,
      html: `&#${code};`,
      htmlHex: `&#x${hex};`,
      css: `\\${hex}`,
    };
  };

  const charInfo = selectedChar ? getCharInfo(selectedChar) : null;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Character Map — Browse & Copy Unicode Characters, Symbols & Emojis',
      paragraphs: [
        'Finding the right special character, symbol, or emoji can be frustrating when you need it for a document, website, or social media post. Our online character map provides a comprehensive, organized collection of Unicode characters that you can browse by category and copy with a single click. No more searching through obscure menus or memorizing keyboard shortcuts.',
        'The character map is organized into intuitive categories: arrows, mathematical symbols, currency signs, punctuation marks, geometric shapes, Greek letters, emojis, and miscellaneous symbols. Each category contains commonly used characters that are hard to find on a standard keyboard. You can also search by character or Unicode code point to find exactly what you need.',
        'When you select a character, the tool displays detailed technical information including the Unicode code point (e.g., U+2764), HTML entity for web pages (e.g., &#10084;), and CSS code for stylesheets. This makes the tool invaluable not just for content writers but also for web developers who need to include special characters in their code.',
        'The recently used section keeps track of your frequently copied characters, making it easy to access them again without browsing through categories. Whether you need mathematical operators for a scientific paper, arrows for a flowchart, currency symbols for a financial document, or emojis for social media, this character map has you covered.',
      ],
      faq: [
        { q: 'How do I copy a Unicode character?', a: 'Simply click on any character in the grid to copy it to your clipboard. You can then paste it (Ctrl+V or Cmd+V) into any application — word processors, web browsers, social media, email, or code editors. The tool also shows the HTML entity and CSS code if you need to use the character in web development.' },
        { q: 'What is Unicode?', a: 'Unicode is a universal character encoding standard that assigns a unique number (code point) to every character in every writing system, plus symbols and emojis. It currently defines over 149,000 characters covering 161 scripts. Unicode ensures that characters display correctly across different devices and platforms.' },
        { q: 'How do I use special characters in HTML?', a: 'You can use HTML entities like &#9829; (shows a heart) or named entities like &amp;copy; (shows copyright symbol). For the hex form, use &#x2764; format. The character map shows both decimal and hex HTML entities for every character.' },
        { q: 'Can I search for a character by code point?', a: 'Yes, you can type a Unicode code point like U+2764 or an HTML entity like &#10084; in the search box to find the corresponding character. You can also type the character itself if you can produce it.' },
        { q: 'Why do some characters not display on my device?', a: 'Characters may not display if your device does not have a font that includes that character. This is common with newer emojis or rare Unicode symbols. Most modern devices support the basic Unicode characters shown in this tool. If a character shows as a box or question mark, your system lacks the required font.' },
      ],
    },
    it: {
      title: 'Mappa Caratteri Gratuita — Sfoglia e Copia Caratteri Unicode, Simboli ed Emoji',
      paragraphs: [
        'Trovare il carattere speciale, simbolo o emoji giusto può essere frustrante quando ne hai bisogno per un documento, sito web o post sui social. La nostra mappa caratteri online fornisce una collezione completa e organizzata di caratteri Unicode che puoi sfogliare per categoria e copiare con un clic.',
        'La mappa è organizzata in categorie intuitive: frecce, simboli matematici, valute, punteggiatura, forme geometriche, lettere greche, emoji e simboli vari. Ogni categoria contiene caratteri comunemente usati ma difficili da trovare su una tastiera standard. Puoi anche cercare per carattere o codice Unicode.',
        'Quando selezioni un carattere, lo strumento mostra informazioni tecniche dettagliate tra cui il code point Unicode, l\'entità HTML e il codice CSS. Questo rende lo strumento prezioso sia per scrittori che per sviluppatori web.',
        'La sezione "Usati di recente" tiene traccia dei caratteri copiati frequentemente, facilitando l\'accesso ripetuto senza sfogliare le categorie.',
      ],
      faq: [
        { q: 'Come copio un carattere Unicode?', a: 'Clicca su qualsiasi carattere nella griglia per copiarlo negli appunti. Poi incollalo (Ctrl+V) in qualsiasi applicazione. Lo strumento mostra anche l\'entità HTML e il codice CSS.' },
        { q: 'Cos\'è Unicode?', a: 'Unicode è uno standard di codifica universale che assegna un numero unico a ogni carattere in ogni sistema di scrittura, più simboli ed emoji. Attualmente definisce oltre 149.000 caratteri.' },
        { q: 'Come uso i caratteri speciali in HTML?', a: 'Puoi usare entità HTML come &#9829; o entità con nome come &copy;. La mappa caratteri mostra sia le entità decimali che esadecimali.' },
        { q: 'Posso cercare un carattere per code point?', a: 'Sì, digita un code point Unicode come U+2764 o un\'entità HTML come &#10084; nella casella di ricerca per trovare il carattere corrispondente.' },
      ],
    },
    es: {
      title: 'Mapa de Caracteres Gratis — Busca y Copia Caracteres Unicode, Símbolos y Emojis',
      paragraphs: [
        'Encontrar el carácter especial, símbolo o emoji correcto puede ser frustrante. Nuestro mapa de caracteres online proporciona una colección completa y organizada de caracteres Unicode que puedes explorar por categoría y copiar con un clic.',
        'El mapa está organizado en categorías intuitivas: flechas, símbolos matemáticos, monedas, puntuación, formas geométricas, letras griegas, emojis y símbolos variados. También puedes buscar por carácter o código Unicode.',
        'Al seleccionar un carácter, la herramienta muestra información técnica detallada incluyendo el code point Unicode, la entidad HTML y el código CSS. Esto lo hace invaluable tanto para escritores como para desarrolladores web.',
        'La sección de usados recientemente rastrea tus caracteres copiados frecuentemente, facilitando el acceso repetido.',
      ],
      faq: [
        { q: '¿Cómo copio un carácter Unicode?', a: 'Haz clic en cualquier carácter de la cuadrícula para copiarlo. Luego pégalo (Ctrl+V) en cualquier aplicación. La herramienta también muestra la entidad HTML y el código CSS.' },
        { q: '¿Qué es Unicode?', a: 'Unicode es un estándar de codificación universal que asigna un número único a cada carácter en cada sistema de escritura, más símbolos y emojis. Define más de 149,000 caracteres.' },
        { q: '¿Cómo uso caracteres especiales en HTML?', a: 'Puedes usar entidades HTML como &#9829; o entidades con nombre como &copy;. El mapa muestra entidades decimales y hexadecimales.' },
        { q: '¿Puedo buscar por code point?', a: 'Sí, escribe un code point Unicode como U+2764 o una entidad HTML en la caja de búsqueda para encontrar el carácter correspondiente.' },
      ],
    },
    fr: {
      title: 'Table de Caractères Gratuite — Parcourez et Copiez des Caractères Unicode et Emojis',
      paragraphs: [
        'Trouver le bon caractère spécial, symbole ou emoji peut être frustrant. Notre table de caractères en ligne fournit une collection complète et organisée de caractères Unicode que vous pouvez parcourir par catégorie et copier en un clic.',
        'La table est organisée en catégories intuitives : flèches, symboles mathématiques, devises, ponctuation, formes géométriques, lettres grecques, emojis et symboles divers. Vous pouvez aussi rechercher par caractère ou code Unicode.',
        'Quand vous sélectionnez un caractère, l\'outil affiche des informations techniques détaillées incluant le code point Unicode, l\'entité HTML et le code CSS. Cela en fait un outil précieux pour les rédacteurs et développeurs web.',
        'La section des caractères récemment utilisés garde trace de vos copies fréquentes, facilitant l\'accès répété.',
      ],
      faq: [
        { q: 'Comment copier un caractère Unicode ?', a: 'Cliquez sur n\'importe quel caractère de la grille pour le copier. Collez-le ensuite (Ctrl+V) dans n\'importe quelle application. L\'outil affiche aussi l\'entité HTML et le code CSS.' },
        { q: 'Qu\'est-ce que Unicode ?', a: 'Unicode est un standard d\'encodage universel qui attribue un numéro unique à chaque caractère de chaque système d\'écriture, plus les symboles et emojis. Il définit plus de 149 000 caractères.' },
        { q: 'Comment utiliser les caractères spéciaux en HTML ?', a: 'Utilisez des entités HTML comme &#9829; ou des entités nommées comme &copy;. La table affiche les entités décimales et hexadécimales.' },
        { q: 'Puis-je chercher par code point ?', a: 'Oui, tapez un code point Unicode comme U+2764 ou une entité HTML dans la barre de recherche pour trouver le caractère correspondant.' },
      ],
    },
    de: {
      title: 'Kostenlose Zeichentabelle — Unicode-Zeichen, Symbole & Emojis Durchsuchen und Kopieren',
      paragraphs: [
        'Das richtige Sonderzeichen, Symbol oder Emoji zu finden kann frustrierend sein. Unsere Online-Zeichentabelle bietet eine umfassende, organisierte Sammlung von Unicode-Zeichen, die Sie nach Kategorie durchsuchen und mit einem Klick kopieren können.',
        'Die Tabelle ist in intuitive Kategorien organisiert: Pfeile, mathematische Symbole, Währungen, Satzzeichen, geometrische Formen, griechische Buchstaben, Emojis und verschiedene Symbole. Sie können auch nach Zeichen oder Unicode-Code suchen.',
        'Wenn Sie ein Zeichen auswählen, zeigt das Tool detaillierte technische Informationen an, darunter den Unicode-Codepunkt, die HTML-Entität und den CSS-Code. Das macht es wertvoll für Autoren und Webentwickler.',
        'Der Bereich der kürzlich verwendeten Zeichen merkt sich Ihre häufig kopierten Zeichen für schnellen Zugriff.',
      ],
      faq: [
        { q: 'Wie kopiere ich ein Unicode-Zeichen?', a: 'Klicken Sie auf ein beliebiges Zeichen im Raster, um es zu kopieren. Fügen Sie es dann (Strg+V) in eine beliebige Anwendung ein. Das Tool zeigt auch die HTML-Entität und den CSS-Code an.' },
        { q: 'Was ist Unicode?', a: 'Unicode ist ein universeller Kodierungsstandard, der jedem Zeichen in jedem Schriftsystem eine eindeutige Nummer zuweist, plus Symbole und Emojis. Er definiert über 149.000 Zeichen.' },
        { q: 'Wie verwende ich Sonderzeichen in HTML?', a: 'Verwenden Sie HTML-Entitäten wie &#9829; oder benannte Entitäten wie &copy;. Die Zeichentabelle zeigt sowohl dezimale als auch hexadezimale Entitäten.' },
        { q: 'Kann ich nach Codepunkt suchen?', a: 'Ja, geben Sie einen Unicode-Codepunkt wie U+2764 oder eine HTML-Entität in das Suchfeld ein, um das entsprechende Zeichen zu finden.' },
      ],
    },
    pt: {
      title: 'Mapa de Caracteres Grátis — Busque e Copie Caracteres Unicode, Símbolos e Emojis',
      paragraphs: [
        'Encontrar o caractere especial, símbolo ou emoji certo pode ser frustrante. Nosso mapa de caracteres online fornece uma coleção completa e organizada de caracteres Unicode que você pode navegar por categoria e copiar com um clique.',
        'O mapa é organizado em categorias intuitivas: setas, símbolos matemáticos, moedas, pontuação, formas geométricas, letras gregas, emojis e símbolos diversos. Você também pode buscar por caractere ou código Unicode.',
        'Ao selecionar um caractere, a ferramenta exibe informações técnicas detalhadas incluindo o code point Unicode, a entidade HTML e o código CSS. Isso a torna valiosa tanto para escritores quanto para desenvolvedores web.',
        'A seção de usados recentemente rastreia seus caracteres copiados frequentemente, facilitando o acesso repetido.',
      ],
      faq: [
        { q: 'Como copio um caractere Unicode?', a: 'Clique em qualquer caractere na grade para copiá-lo. Cole-o (Ctrl+V) em qualquer aplicação. A ferramenta também mostra a entidade HTML e o código CSS.' },
        { q: 'O que é Unicode?', a: 'Unicode é um padrão de codificação universal que atribui um número único a cada caractere em cada sistema de escrita, mais símbolos e emojis. Define mais de 149.000 caracteres.' },
        { q: 'Como uso caracteres especiais em HTML?', a: 'Use entidades HTML como &#9829; ou entidades nomeadas como &copy;. O mapa mostra entidades decimais e hexadecimais.' },
        { q: 'Posso buscar por code point?', a: 'Sim, digite um code point Unicode como U+2764 ou uma entidade HTML na caixa de busca para encontrar o caractere correspondente.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="character-map" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={labels.search[lang]}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />

          {/* Category tabs */}
          {!search && (
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {CATEGORY_LABELS[cat.id][lang]}
                </button>
              ))}
            </div>
          )}

          {/* Recently used */}
          {recentlyUsed.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">{labels.recentlyUsed[lang]}</div>
              <div className="flex flex-wrap gap-1">
                {recentlyUsed.map((char, i) => (
                  <button
                    key={i}
                    onClick={() => copyToClipboard(char)}
                    className="w-9 h-9 flex items-center justify-center text-lg border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    {char}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Character grid */}
          <div className="text-xs text-gray-400 mb-1">{labels.clickToCopy[lang]}</div>
          <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 max-h-64 overflow-y-auto">
            {filteredChars.map(({ char }, i) => (
              <button
                key={i}
                onClick={() => copyToClipboard(char)}
                className={`w-full aspect-square flex items-center justify-center text-xl border rounded transition-all hover:bg-blue-50 hover:border-blue-300 hover:scale-110 ${copied === char ? 'bg-green-100 border-green-400' : selectedChar === char ? 'bg-blue-50 border-blue-400' : 'border-gray-200'}`}
                title={getCharInfo(char).unicode}
              >
                {char}
              </button>
            ))}
          </div>

          {copied && (
            <div className="text-center text-sm text-green-600 font-medium">{labels.copied[lang]}</div>
          )}

          {/* Character info panel */}
          {selectedChar && charInfo && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">{labels.charInfo[lang]}</div>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-5xl">{selectedChar}</span>
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-500">{labels.unicode[lang]}:</span> <code className="bg-white px-2 py-0.5 rounded text-gray-800">{charInfo.unicode}</code></div>
                  <div><span className="text-gray-500">{labels.htmlEntity[lang]}:</span> <code className="bg-white px-2 py-0.5 rounded text-gray-800">{charInfo.html}</code></div>
                  <div><span className="text-gray-500">{labels.cssCode[lang]}:</span> <code className="bg-white px-2 py-0.5 rounded text-gray-800">{charInfo.css}</code></div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => copyToClipboard(selectedChar)} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
                  {labels.copyChar[lang]}
                </button>
                <button onClick={() => { navigator.clipboard.writeText(charInfo.html); setCopied(selectedChar); setTimeout(() => setCopied(null), 1500); }} className="text-xs bg-gray-600 text-white px-3 py-1.5 rounded hover:bg-gray-700">
                  {labels.copyCode[lang]} (HTML)
                </button>
              </div>
            </div>
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
