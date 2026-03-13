'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  inputText: { en: 'Barcode Content', it: 'Contenuto Barcode', es: 'Contenido del Código', fr: 'Contenu du Code-barres', de: 'Barcode-Inhalt', pt: 'Conteúdo do Código' },
  placeholder: { en: 'Enter text to encode...', it: 'Inserisci testo da codificare...', es: 'Ingresa texto a codificar...', fr: 'Entrez le texte à encoder...', de: 'Text zum Kodieren eingeben...', pt: 'Digite o texto para codificar...' },
  generate: { en: 'Generate Barcode', it: 'Genera Barcode', es: 'Generar Código de Barras', fr: 'Générer Code-barres', de: 'Barcode generieren', pt: 'Gerar Código de Barras' },
  download: { en: 'Download PNG', it: 'Scarica PNG', es: 'Descargar PNG', fr: 'Télécharger PNG', de: 'PNG herunterladen', pt: 'Baixar PNG' },
  copyClipboard: { en: 'Copy to Clipboard', it: 'Copia negli Appunti', es: 'Copiar al Portapapeles', fr: 'Copier dans le Presse-papiers', de: 'In Zwischenablage kopieren', pt: 'Copiar para a Área de Transferência' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  reset: { en: 'Reset', it: 'Ripristina', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  width: { en: 'Bar Width', it: 'Larghezza Barre', es: 'Ancho de Barras', fr: 'Largeur des Barres', de: 'Balkenbreite', pt: 'Largura das Barras' },
  height: { en: 'Barcode Height', it: 'Altezza Barcode', es: 'Altura del Código', fr: 'Hauteur du Code-barres', de: 'Barcode-Höhe', pt: 'Altura do Código' },
  showText: { en: 'Show Text Below', it: 'Mostra Testo Sotto', es: 'Mostrar Texto Debajo', fr: 'Afficher le Texte en Dessous', de: 'Text darunter anzeigen', pt: 'Mostrar Texto Abaixo' },
  barColor: { en: 'Bar Color', it: 'Colore Barre', es: 'Color de Barras', fr: 'Couleur des Barres', de: 'Balkenfarbe', pt: 'Cor das Barras' },
  bgColor: { en: 'Background', it: 'Sfondo', es: 'Fondo', fr: 'Arrière-plan', de: 'Hintergrund', pt: 'Fundo' },
  customization: { en: 'Customization', it: 'Personalizzazione', es: 'Personalización', fr: 'Personnalisation', de: 'Anpassung', pt: 'Personalização' },
  result: { en: 'Barcode Result', it: 'Risultato Barcode', es: 'Resultado del Código', fr: 'Résultat du Code-barres', de: 'Barcode-Ergebnis', pt: 'Resultado do Código' },
  history: { en: 'Recent', it: 'Recenti', es: 'Recientes', fr: 'Récents', de: 'Verlauf', pt: 'Recentes' },
  clearHistory: { en: 'Clear', it: 'Cancella', es: 'Borrar', fr: 'Effacer', de: 'Löschen', pt: 'Limpar' },
  errorEmpty: { en: 'Please enter text to encode', it: 'Inserisci testo da codificare', es: 'Ingresa texto a codificar', fr: 'Veuillez entrer du texte à encoder', de: 'Bitte Text zum Kodieren eingeben', pt: 'Por favor, digite texto para codificar' },
  errorInvalid: { en: 'Text contains characters not supported by Code 128 (ASCII 32-127)', it: 'Il testo contiene caratteri non supportati da Code 128 (ASCII 32-127)', es: 'El texto contiene caracteres no compatibles con Code 128 (ASCII 32-127)', fr: 'Le texte contient des caractères non pris en charge par Code 128 (ASCII 32-127)', de: 'Der Text enthält Zeichen, die von Code 128 nicht unterstützt werden (ASCII 32-127)', pt: 'O texto contém caracteres não suportados pelo Code 128 (ASCII 32-127)' },
  format: { en: 'Format: Code 128', it: 'Formato: Code 128', es: 'Formato: Code 128', fr: 'Format : Code 128', de: 'Format: Code 128', pt: 'Formato: Code 128' },
  charCount: { en: 'Characters', it: 'Caratteri', es: 'Caracteres', fr: 'Caractères', de: 'Zeichen', pt: 'Caracteres' },
};

// Code 128B encoding tables
// Each pattern is 6 alternating bar/space widths (bars at even indices, spaces at odd)
const CODE128B_PATTERNS: number[][] = [
  [2,1,2,2,2,2],[2,2,2,1,2,2],[2,2,2,2,2,1],[1,2,1,2,2,3],[1,2,1,3,2,2],
  [1,3,1,2,2,2],[1,2,2,2,1,3],[1,2,2,3,1,2],[1,3,2,2,1,2],[2,2,1,2,1,3],
  [2,2,1,3,1,2],[2,3,1,2,1,2],[1,1,2,2,3,2],[1,2,2,1,3,2],[1,2,2,2,3,1],
  [1,1,3,2,2,2],[1,2,3,1,2,2],[1,2,3,2,2,1],[2,2,3,2,1,1],[2,2,1,1,3,2],
  [2,2,1,2,3,1],[2,1,3,2,1,2],[2,2,3,1,1,2],[3,1,2,1,3,1],[3,1,1,2,2,2],
  [3,2,1,1,2,2],[3,2,1,2,2,1],[3,1,2,2,1,2],[3,2,2,1,1,2],[3,2,2,2,1,1],
  [2,1,2,1,2,3],[2,1,2,3,2,1],[2,3,2,1,2,1],[1,1,1,3,2,3],[1,3,1,1,2,3],
  [1,3,1,3,2,1],[1,1,2,3,1,3],[1,3,2,1,1,3],[1,3,2,3,1,1],[2,1,1,3,1,3],
  [2,3,1,1,1,3],[2,3,1,3,1,1],[1,1,2,1,3,3],[1,1,2,3,3,1],[1,3,2,1,3,1],
  [1,1,3,1,2,3],[1,1,3,3,2,1],[1,3,3,1,2,1],[3,1,3,1,2,1],[2,1,1,3,3,1],
  [2,3,1,1,3,1],[2,1,3,1,1,3],[2,1,3,3,1,1],[2,1,3,1,3,1],[3,1,1,1,2,3],
  [3,1,1,3,2,1],[3,3,1,1,2,1],[3,1,2,1,1,3],[3,1,2,3,1,1],[3,3,2,1,1,1],
  [3,1,4,1,1,1],[2,2,1,4,1,1],[4,3,1,1,1,1],[1,1,1,2,2,4],[1,1,1,4,2,2],
  [1,2,1,1,2,4],[1,2,1,4,2,1],[1,4,1,1,2,2],[1,4,1,2,2,1],[1,1,2,2,1,4],
  [1,1,2,4,1,2],[1,2,2,1,1,4],[1,2,2,4,1,1],[1,4,2,1,1,2],[1,4,2,2,1,1],
  [2,4,1,2,1,1],[2,2,1,1,1,4],[4,1,3,1,1,1],[2,4,1,1,1,2],[1,3,4,1,1,1],
  [1,1,1,2,4,2],[1,2,1,1,4,2],[1,2,1,2,4,1],[1,1,4,2,1,2],[1,2,4,1,1,2],
  [1,2,4,2,1,1],[4,1,1,2,1,2],[4,2,1,1,1,2],[4,2,1,2,1,1],[2,1,2,1,4,1],
  [2,1,4,1,2,1],[4,1,2,1,2,1],[1,1,1,1,4,3],[1,1,1,3,4,1],[1,3,1,1,4,1],
  [1,1,4,1,1,3],[1,1,4,3,1,1],[4,1,1,1,1,3],[4,1,1,3,1,1],[1,1,3,1,4,1],
  [1,1,4,1,3,1],[3,1,1,1,4,1],[4,1,1,1,3,1],[2,1,1,4,1,2],[2,1,1,2,1,4],
  [2,1,1,2,3,2],[2,3,3,1,1,1,2],
];

// Start code B = 104, Stop = 106
const START_B = 104;
const STOP = 106;

// Stop pattern: 2,3,3,1,1,1,2 (7 elements)
const STOP_PATTERN = [2,3,3,1,1,1,2];
const START_B_PATTERN = CODE128B_PATTERNS[START_B];

function encodeCode128B(text: string): { patterns: number[][]; valid: boolean } {
  // Validate all characters are ASCII 32-127
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code < 32 || code > 127) {
      return { patterns: [], valid: false };
    }
  }

  const values: number[] = [];
  // Start code B value
  values.push(START_B);

  // Each character: value = ASCII code - 32
  for (let i = 0; i < text.length; i++) {
    values.push(text.charCodeAt(i) - 32);
  }

  // Calculate checksum
  let checksum = values[0]; // start code value
  for (let i = 1; i < values.length; i++) {
    checksum += values[i] * i;
  }
  checksum = checksum % 103;
  values.push(checksum);
  values.push(STOP);

  // Convert values to patterns
  const patterns: number[][] = [];
  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    if (val === STOP) {
      patterns.push(STOP_PATTERN);
    } else {
      patterns.push(CODE128B_PATTERNS[val]);
    }
  }

  return { patterns, valid: true };
}

interface HistoryItem {
  text: string;
  timestamp: number;
}

export default function BarcodeGenerator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['barcode-generator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [text, setText] = useState('');
  const [barWidth, setBarWidth] = useState(2);
  const [barcodeHeight, setBarcodeHeight] = useState(100);
  const [showText, setShowText] = useState(true);
  const [barColor, setBarColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generated, setGenerated] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const [showError, setShowError] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('barcode-history');
      if (saved) setHistory(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const saveToHistory = useCallback((value: string) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.text !== value);
      const updated = [{ text: value, timestamp: Date.now() }, ...filtered].slice(0, 10);
      try { localStorage.setItem('barcode-history', JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, []);

  const drawBarcode = useCallback(() => {
    if (!text.trim() || !canvasRef.current) return;

    const { patterns, valid } = encodeCode128B(text);
    if (!valid) {
      setShowError('errorInvalid');
      setGenerated(false);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate total width
    let totalUnits = 0;
    for (const pattern of patterns) {
      for (const w of pattern) {
        totalUnits += w;
      }
    }
    // Add quiet zones (10 units each side)
    const quietZone = 10 * barWidth;
    const canvasWidth = totalUnits * barWidth + quietZone * 2;
    const textHeight = showText ? 20 : 0;
    const canvasHeight = barcodeHeight + 20 + textHeight; // 20 for top/bottom padding

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw bars
    let x = quietZone;
    const yStart = 10;
    ctx.fillStyle = barColor;

    for (const pattern of patterns) {
      for (let j = 0; j < pattern.length; j++) {
        const w = pattern[j] * barWidth;
        // Even indices are bars, odd indices are spaces
        if (j % 2 === 0) {
          ctx.fillRect(x, yStart, w, barcodeHeight);
        }
        x += w;
      }
    }

    // Draw text below barcode
    if (showText) {
      ctx.fillStyle = barColor;
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(text, canvasWidth / 2, yStart + barcodeHeight + 4);
    }

    setGenerated(true);
    setShowError('');
  }, [text, barWidth, barcodeHeight, showText, barColor, bgColor]);

  useEffect(() => {
    if (text.trim()) {
      drawBarcode();
    } else {
      setGenerated(false);
    }
  }, [text, barWidth, barcodeHeight, showText, barColor, bgColor, drawBarcode]);

  const handleGenerate = () => {
    if (!text.trim()) {
      setShowError('errorEmpty');
      return;
    }
    drawBarcode();
    if (generated) saveToHistory(text);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'barcode.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    saveToHistory(text);
  };

  const handleCopy = async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvasRef.current!.toBlob(resolve, 'image/png')
      );
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopiedFeedback(true);
        saveToHistory(text);
        setTimeout(() => setCopiedFeedback(false), 2000);
      }
    } catch {
      // Fallback: copy text
      try {
        await navigator.clipboard.writeText(text);
        setCopiedFeedback(true);
        setTimeout(() => setCopiedFeedback(false), 2000);
      } catch { /* ignore */ }
    }
  };

  const handleReset = () => {
    setText('');
    setBarWidth(2);
    setBarcodeHeight(100);
    setShowText(true);
    setBarColor('#000000');
    setBgColor('#ffffff');
    setGenerated(false);
    setShowError('');
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Barcode Generator: Create Code 128 Barcodes for Free',
      paragraphs: [
        'Barcodes remain one of the most widely used identification systems in the world. From retail products and shipping labels to warehouse inventory and access control, barcodes enable fast and accurate data capture. Our free barcode generator creates high-quality Code 128 barcodes instantly, right in your browser with no server upload required.',
        'Code 128 is one of the most versatile and compact barcode symbologies available. It supports the full ASCII character set (characters 32 through 127), making it suitable for encoding product codes, serial numbers, tracking identifiers, and virtually any alphanumeric string. Code 128 is widely used in logistics, supply chain management, and industrial applications.',
        'Using this tool is straightforward: enter the text you want to encode, customize the bar width, height, and colors, then download the barcode as a PNG image or copy it directly to your clipboard. You can also toggle whether the human-readable text is displayed below the barcode. The generated barcodes are fully scannable by standard barcode readers and scanner apps.',
        'Whether you need barcodes for product labeling, asset tracking, document management, or personal projects, this tool delivers professional-quality results. All processing happens locally in your browser, ensuring your data stays private. Generate unlimited barcodes with no registration, no watermarks, and no restrictions.',
      ],
      faq: [
        { q: 'What is Code 128 and why should I use it?', a: 'Code 128 is a high-density barcode symbology that supports all 128 ASCII characters. It is one of the most commonly used barcodes in shipping, packaging, and industrial applications because it produces compact, highly reliable codes that are easy to scan.' },
        { q: 'What characters can I encode in a Code 128 barcode?', a: 'Code 128B (used in this tool) supports all standard ASCII characters from space (32) to DEL (127), including uppercase and lowercase letters, numbers, punctuation, and special symbols.' },
        { q: 'Can barcode scanners read the generated barcodes?', a: 'Yes. The barcodes generated by this tool follow the official Code 128 specification with proper start codes, checksums, and stop patterns. They are fully compatible with standard barcode scanners and mobile scanner apps.' },
        { q: 'What is the maximum length of text I can encode?', a: 'There is no strict character limit for Code 128 barcodes, but longer text produces wider barcodes that may be harder to print and scan. For best results, keep your content under 80 characters.' },
        { q: 'Can I customize the barcode appearance?', a: 'Yes. You can adjust the bar width (affecting overall size), barcode height, bar color, background color, and toggle the human-readable text display. The barcode can be downloaded as a PNG image or copied to your clipboard.' },
      ],
    },
    it: {
      title: 'Generatore di Barcode: Crea Codici a Barre Code 128 Gratuitamente',
      paragraphs: [
        'I codici a barre rimangono uno dei sistemi di identificazione piu utilizzati al mondo. Dai prodotti al dettaglio alle etichette di spedizione, dall\'inventario di magazzino al controllo accessi, i codici a barre consentono una raccolta dati rapida e precisa. Il nostro generatore gratuito crea codici a barre Code 128 di alta qualita direttamente nel browser.',
        'Il Code 128 e una delle simbologie piu versatili e compatte disponibili. Supporta l\'intero set di caratteri ASCII (da 32 a 127), rendendolo adatto per codificare codici prodotto, numeri di serie, identificatori di tracciamento e qualsiasi stringa alfanumerica. E ampiamente utilizzato nella logistica e nella gestione della catena di approvvigionamento.',
        'Utilizzare questo strumento e semplice: inserisci il testo, personalizza larghezza, altezza e colori delle barre, poi scarica il barcode come immagine PNG o copialo negli appunti. Puoi anche scegliere se mostrare il testo leggibile sotto il codice a barre. I codici generati sono completamente scansionabili da lettori standard.',
        'Che tu abbia bisogno di codici a barre per etichettatura prodotti, tracciamento risorse o progetti personali, questo strumento offre risultati professionali. L\'elaborazione avviene localmente nel browser, garantendo la privacy dei tuoi dati.',
      ],
      faq: [
        { q: 'Cos\'e il Code 128 e perche usarlo?', a: 'Il Code 128 e una simbologia ad alta densita che supporta tutti i 128 caratteri ASCII. E uno dei codici a barre piu utilizzati nella spedizione e nell\'industria per la sua compattezza e affidabilita.' },
        { q: 'Quali caratteri posso codificare?', a: 'Il Code 128B supporta tutti i caratteri ASCII standard dallo spazio (32) a DEL (127), incluse lettere maiuscole e minuscole, numeri, punteggiatura e simboli speciali.' },
        { q: 'I lettori di codici a barre possono leggere i barcode generati?', a: 'Si. I codici generati seguono le specifiche ufficiali Code 128 con codici di avvio, checksum e pattern di stop corretti. Sono compatibili con scanner standard e app scanner mobili.' },
        { q: 'Qual e la lunghezza massima del testo?', a: 'Non c\'e un limite rigido, ma testi piu lunghi producono codici a barre piu larghi. Per risultati ottimali, mantieni il contenuto sotto gli 80 caratteri.' },
        { q: 'Posso personalizzare l\'aspetto del barcode?', a: 'Si. Puoi regolare larghezza e altezza delle barre, colore delle barre, colore di sfondo e mostrare/nascondere il testo. Il barcode puo essere scaricato come PNG o copiato negli appunti.' },
      ],
    },
    es: {
      title: 'Generador de Codigos de Barras: Crea Codigos Code 128 Gratis',
      paragraphs: [
        'Los codigos de barras siguen siendo uno de los sistemas de identificacion mas utilizados en el mundo. Desde productos minoristas hasta etiquetas de envio, nuestro generador gratuito crea codigos de barras Code 128 de alta calidad directamente en tu navegador.',
        'El Code 128 es una de las simbologias mas versatiles y compactas disponibles. Soporta el conjunto completo de caracteres ASCII (32 a 127), siendo ideal para codificar codigos de producto, numeros de serie e identificadores de seguimiento.',
        'Usar esta herramienta es sencillo: ingresa el texto, personaliza el ancho, altura y colores de las barras, luego descarga el codigo como imagen PNG o copialo al portapapeles. Los codigos generados son completamente escaneables por lectores estandar.',
        'Ya sea que necesites codigos de barras para etiquetado de productos, seguimiento de activos o proyectos personales, esta herramienta ofrece resultados profesionales sin registro ni marcas de agua.',
      ],
      faq: [
        { q: 'Que es el Code 128 y por que usarlo?', a: 'El Code 128 es una simbologia de alta densidad que soporta los 128 caracteres ASCII. Es uno de los codigos de barras mas usados en envios e industria por su compacidad y fiabilidad.' },
        { q: 'Que caracteres puedo codificar?', a: 'El Code 128B soporta todos los caracteres ASCII estandar del espacio (32) a DEL (127), incluyendo letras, numeros, puntuacion y simbolos especiales.' },
        { q: 'Los escáneres pueden leer los codigos generados?', a: 'Si. Los codigos siguen la especificacion oficial Code 128 con checksums y patrones correctos. Son compatibles con escaneres estandar y apps moviles.' },
        { q: 'Cual es la longitud maxima del texto?', a: 'No hay limite estricto, pero textos mas largos producen codigos mas anchos. Para mejores resultados, mantén el contenido bajo 80 caracteres.' },
        { q: 'Puedo personalizar la apariencia?', a: 'Si. Puedes ajustar ancho y altura de barras, colores y mostrar/ocultar el texto. El codigo puede descargarse como PNG o copiarse al portapapeles.' },
      ],
    },
    fr: {
      title: 'Generateur de Codes-barres : Creez des Codes-barres Code 128 Gratuitement',
      paragraphs: [
        'Les codes-barres restent l\'un des systemes d\'identification les plus utilises au monde. Des produits de detail aux etiquettes d\'expedition, notre generateur gratuit cree des codes-barres Code 128 de haute qualite directement dans votre navigateur.',
        'Le Code 128 est l\'une des symbologies les plus polyvalentes et compactes. Il prend en charge l\'ensemble complet des caracteres ASCII (32 a 127), ce qui le rend ideal pour encoder des codes produits, numeros de serie et identifiants de suivi.',
        'L\'utilisation est simple : entrez le texte, personnalisez la largeur, la hauteur et les couleurs des barres, puis telechargez le code-barres en PNG ou copiez-le dans le presse-papiers. Les codes generes sont entierement scannables par les lecteurs standard.',
        'Que vous ayez besoin de codes-barres pour l\'etiquetage, le suivi des actifs ou des projets personnels, cet outil fournit des resultats professionnels sans inscription ni filigrane.',
      ],
      faq: [
        { q: 'Qu\'est-ce que le Code 128 et pourquoi l\'utiliser ?', a: 'Le Code 128 est une symbologie haute densite prenant en charge les 128 caracteres ASCII. C\'est l\'un des codes-barres les plus utilises dans l\'expedition et l\'industrie.' },
        { q: 'Quels caracteres puis-je encoder ?', a: 'Le Code 128B prend en charge tous les caracteres ASCII standard de l\'espace (32) a DEL (127), y compris les lettres, chiffres, ponctuation et symboles speciaux.' },
        { q: 'Les scanners peuvent-ils lire les codes generes ?', a: 'Oui. Les codes suivent la specification officielle Code 128 avec checksums et motifs corrects. Ils sont compatibles avec les scanners standard et les apps mobiles.' },
        { q: 'Quelle est la longueur maximale du texte ?', a: 'Il n\'y a pas de limite stricte, mais les textes plus longs produisent des codes plus larges. Pour de meilleurs resultats, gardez le contenu sous 80 caracteres.' },
        { q: 'Puis-je personnaliser l\'apparence ?', a: 'Oui. Vous pouvez ajuster la largeur et la hauteur des barres, les couleurs et afficher/masquer le texte. Le code peut etre telecharge en PNG ou copie dans le presse-papiers.' },
      ],
    },
    de: {
      title: 'Barcode-Generator: Erstellen Sie Kostenlose Code 128 Barcodes',
      paragraphs: [
        'Barcodes gehoren zu den am weitesten verbreiteten Identifikationssystemen der Welt. Von Einzelhandelsprodukten bis zu Versandetiketten erstellt unser kostenloser Generator hochwertige Code 128 Barcodes direkt in Ihrem Browser.',
        'Code 128 ist eine der vielseitigsten und kompaktesten Barcode-Symbologien. Er unterstutzt den vollstandigen ASCII-Zeichensatz (32 bis 127) und eignet sich ideal fur Produktcodes, Seriennummern und Tracking-Kennungen.',
        'Die Nutzung ist einfach: Geben Sie den Text ein, passen Sie Breite, Hohe und Farben an, dann laden Sie den Barcode als PNG herunter oder kopieren Sie ihn in die Zwischenablage. Die generierten Codes sind vollstandig von Standardlesern scannbar.',
        'Ob Sie Barcodes fur Produktetikettierung, Bestandsverfolgung oder personliche Projekte benotigen, dieses Tool liefert professionelle Ergebnisse ohne Registrierung oder Wasserzeichen.',
      ],
      faq: [
        { q: 'Was ist Code 128 und warum sollte ich ihn verwenden?', a: 'Code 128 ist eine hochdichte Symbologie, die alle 128 ASCII-Zeichen unterstutzt. Er ist einer der am haufigsten verwendeten Barcodes im Versand und in der Industrie.' },
        { q: 'Welche Zeichen kann ich kodieren?', a: 'Code 128B unterstutzt alle Standard-ASCII-Zeichen von Leerzeichen (32) bis DEL (127), einschliesslich Buchstaben, Zahlen, Satzzeichen und Sonderzeichen.' },
        { q: 'Konnen Barcodescanner die generierten Codes lesen?', a: 'Ja. Die Codes folgen der offiziellen Code 128 Spezifikation mit korrekten Prufsummen und Stoppmustern. Sie sind mit Standardscannern und mobilen Scanner-Apps kompatibel.' },
        { q: 'Was ist die maximale Textlange?', a: 'Es gibt kein striktes Limit, aber langere Texte erzeugen breitere Codes. Fur beste Ergebnisse halten Sie den Inhalt unter 80 Zeichen.' },
        { q: 'Kann ich das Aussehen anpassen?', a: 'Ja. Sie konnen Balkenbreite und -hohe, Farben anpassen und den Text ein-/ausblenden. Der Barcode kann als PNG heruntergeladen oder in die Zwischenablage kopiert werden.' },
      ],
    },
    pt: {
      title: 'Gerador de Codigo de Barras: Crie Codigos Code 128 Gratuitamente',
      paragraphs: [
        'Os codigos de barras continuam sendo um dos sistemas de identificacao mais utilizados no mundo. De produtos de varejo a etiquetas de envio, nosso gerador gratuito cria codigos de barras Code 128 de alta qualidade diretamente no seu navegador.',
        'O Code 128 e uma das simbologias mais versateis e compactas disponiveis. Suporta o conjunto completo de caracteres ASCII (32 a 127), sendo ideal para codificar codigos de produto, numeros de serie e identificadores de rastreamento.',
        'Usar esta ferramenta e simples: insira o texto, personalize a largura, altura e cores das barras, depois baixe o codigo como imagem PNG ou copie para a area de transferencia. Os codigos gerados sao totalmente escaneáveis por leitores padrao.',
        'Se voce precisa de codigos de barras para etiquetagem, rastreamento de ativos ou projetos pessoais, esta ferramenta oferece resultados profissionais sem registro ou marcas d\'agua.',
      ],
      faq: [
        { q: 'O que e o Code 128 e por que usa-lo?', a: 'O Code 128 e uma simbologia de alta densidade que suporta todos os 128 caracteres ASCII. E um dos codigos de barras mais usados em envios e industria pela sua compacidade e confiabilidade.' },
        { q: 'Quais caracteres posso codificar?', a: 'O Code 128B suporta todos os caracteres ASCII padrao do espaco (32) ao DEL (127), incluindo letras, numeros, pontuacao e simbolos especiais.' },
        { q: 'Os scanners podem ler os codigos gerados?', a: 'Sim. Os codigos seguem a especificacao oficial Code 128 com checksums e padroes corretos. Sao compativeis com scanners padrao e apps moveis.' },
        { q: 'Qual e o comprimento maximo do texto?', a: 'Nao ha limite estrito, mas textos mais longos produzem codigos mais largos. Para melhores resultados, mantenha o conteudo abaixo de 80 caracteres.' },
        { q: 'Posso personalizar a aparencia?', a: 'Sim. Voce pode ajustar largura e altura das barras, cores e mostrar/ocultar o texto. O codigo pode ser baixado como PNG ou copiado para a area de transferencia.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="barcode-generator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('inputText')}</label>
            <input
              type="text"
              value={text}
              onChange={(e) => { setText(e.target.value); setShowError(''); }}
              placeholder={t('placeholder')}
              className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${showError ? 'border-red-400' : 'border-gray-300'}`}
            />
            {showError && (
              <p className="text-red-500 text-sm mt-1">{t(showError)}</p>
            )}
          </div>

          {/* Info badges */}
          {text.trim() && (
            <div className="flex gap-3">
              <div className="flex-1 rounded-lg border bg-blue-50 text-blue-800 border-blue-200 px-3 py-2">
                <div className="text-xs font-medium opacity-70">{t('format')}</div>
                <div className="text-sm font-semibold">Code 128B</div>
              </div>
              <div className="flex-1 rounded-lg border bg-indigo-50 text-indigo-800 border-indigo-200 px-3 py-2">
                <div className="text-xs font-medium opacity-70">{t('charCount')}</div>
                <div className="text-sm font-semibold">{text.length}</div>
              </div>
            </div>
          )}

          {/* Customization Section */}
          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <label className="block text-sm font-medium text-gray-700">{t('customization')}</label>

            {/* Bar Width */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('width')}: {barWidth}px</label>
              <input type="range" min="1" max="5" step="1" value={barWidth} onChange={(e) => setBarWidth(parseInt(e.target.value))}
                className="w-full" />
            </div>

            {/* Height */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('height')}: {barcodeHeight}px</label>
              <input type="range" min="40" max="200" step="10" value={barcodeHeight} onChange={(e) => setBarcodeHeight(parseInt(e.target.value))}
                className="w-full" />
            </div>

            {/* Show Text Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showText"
                checked={showText}
                onChange={(e) => setShowText(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="showText" className="text-sm text-gray-700">{t('showText')}</label>
            </div>

            {/* Color Pickers */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">{t('barColor')}</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={barColor} onChange={(e) => setBarColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border border-gray-300" />
                  <span className="text-sm text-gray-600 font-mono">{barColor}</span>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">{t('bgColor')}</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border border-gray-300" />
                  <span className="text-sm text-gray-600 font-mono">{bgColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button onClick={handleGenerate}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              {t('generate')}
            </button>
            <button onClick={handleReset}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 border border-gray-300 transition-colors">
              {t('reset')}
            </button>
          </div>

          {/* Barcode Display */}
          {text.trim() && (
            <div className="flex flex-col items-center gap-4 pt-2">
              <div className="text-sm font-medium text-gray-500">{t('result')}</div>
              <canvas ref={canvasRef} className="border border-gray-200 rounded-lg max-w-full" />
              {generated && (
                <div className="flex gap-2 w-full">
                  <button onClick={handleDownload}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    {t('download')}
                  </button>
                  <button onClick={handleCopy}
                    className={`flex-1 py-2 rounded-lg font-medium border transition-colors ${
                      copiedFeedback
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}>
                    {copiedFeedback ? t('copied') : t('copyClipboard')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">{t('history')}</label>
              <button
                onClick={() => { setHistory([]); try { localStorage.removeItem('barcode-history'); } catch { /* ignore */ } }}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                {t('clearHistory')}
              </button>
            </div>
            <div className="space-y-1">
              {history.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setText(item.text)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors truncate"
                >
                  {item.text.length > 50 ? item.text.slice(0, 50) + '...' : item.text}
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
