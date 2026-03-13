'use client';
import { useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  upload: { en: 'Upload SVG', it: 'Carica SVG', es: 'Subir SVG', fr: 'Télécharger SVG', de: 'SVG Hochladen', pt: 'Enviar SVG' },
  dragDrop: { en: 'Drag & drop SVG or click to upload', it: 'Trascina SVG o clicca per caricare', es: 'Arrastra SVG o haz clic para subir', fr: 'Glissez SVG ou cliquez pour télécharger', de: 'SVG ziehen oder klicken zum Hochladen', pt: 'Arraste SVG ou clique para enviar' },
  orPaste: { en: 'Or paste SVG code below', it: 'Oppure incolla il codice SVG sotto', es: 'O pega el código SVG abajo', fr: 'Ou collez le code SVG ci-dessous', de: 'Oder SVG-Code unten einfügen', pt: 'Ou cole o código SVG abaixo' },
  pastePlaceholder: { en: 'Paste SVG code here...', it: 'Incolla il codice SVG qui...', es: 'Pega el código SVG aquí...', fr: 'Collez le code SVG ici...', de: 'SVG-Code hier einfügen...', pt: 'Cole o código SVG aqui...' },
  loadSvg: { en: 'Load SVG', it: 'Carica SVG', es: 'Cargar SVG', fr: 'Charger SVG', de: 'SVG Laden', pt: 'Carregar SVG' },
  scale: { en: 'Scale', it: 'Scala', es: 'Escala', fr: 'Échelle', de: 'Skalierung', pt: 'Escala' },
  customSize: { en: 'Custom Size', it: 'Dimensione Personalizzata', es: 'Tamaño Personalizado', fr: 'Taille Personnalisée', de: 'Benutzerdefinierte Größe', pt: 'Tamanho Personalizado' },
  width: { en: 'Width', it: 'Larghezza', es: 'Ancho', fr: 'Largeur', de: 'Breite', pt: 'Largura' },
  height: { en: 'Height', it: 'Altezza', es: 'Alto', fr: 'Hauteur', de: 'Höhe', pt: 'Altura' },
  backgroundColor: { en: 'Background', it: 'Sfondo', es: 'Fondo', fr: 'Arrière-plan', de: 'Hintergrund', pt: 'Fundo' },
  transparent: { en: 'Transparent', it: 'Trasparente', es: 'Transparente', fr: 'Transparent', de: 'Transparent', pt: 'Transparente' },
  custom: { en: 'Custom Color', it: 'Colore Personalizzato', es: 'Color Personalizado', fr: 'Couleur Personnalisée', de: 'Benutzerdefinierte Farbe', pt: 'Cor Personalizada' },
  preview: { en: 'SVG Preview', it: 'Anteprima SVG', es: 'Vista Previa SVG', fr: 'Aperçu SVG', de: 'SVG Vorschau', pt: 'Pré-visualização SVG' },
  convert: { en: 'Convert to PNG', it: 'Converti in PNG', es: 'Convertir a PNG', fr: 'Convertir en PNG', de: 'In PNG Konvertieren', pt: 'Converter para PNG' },
  download: { en: 'Download PNG', it: 'Scarica PNG', es: 'Descargar PNG', fr: 'Télécharger PNG', de: 'PNG Herunterladen', pt: 'Baixar PNG' },
  reset: { en: 'Reset', it: 'Reimposta', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  copyStats: { en: 'Copy Stats', it: 'Copia Statistiche', es: 'Copiar Estadísticas', fr: 'Copier Statistiques', de: 'Statistiken Kopieren', pt: 'Copiar Estatísticas' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  svgSize: { en: 'SVG Size', it: 'Dimensione SVG', es: 'Tamaño SVG', fr: 'Taille SVG', de: 'SVG-Größe', pt: 'Tamanho SVG' },
  pngSize: { en: 'PNG Size', it: 'Dimensione PNG', es: 'Tamaño PNG', fr: 'Taille PNG', de: 'PNG-Größe', pt: 'Tamanho PNG' },
  dimensions: { en: 'Dimensions', it: 'Dimensioni', es: 'Dimensiones', fr: 'Dimensions', de: 'Abmessungen', pt: 'Dimensões' },
  outputDimensions: { en: 'Output Dimensions', it: 'Dimensioni Output', es: 'Dimensiones de Salida', fr: 'Dimensions de Sortie', de: 'Ausgabe-Abmessungen', pt: 'Dimensões de Saída' },
  errorInvalid: { en: 'Invalid SVG file. Please upload a valid .svg file.', it: 'File SVG non valido. Carica un file .svg valido.', es: 'Archivo SVG no válido. Sube un archivo .svg válido.', fr: 'Fichier SVG invalide. Veuillez télécharger un fichier .svg valide.', de: 'Ungültige SVG-Datei. Bitte laden Sie eine gültige .svg-Datei hoch.', pt: 'Arquivo SVG inválido. Envie um arquivo .svg válido.' },
  errorTooLarge: { en: 'File too large. Maximum size is 5 MB.', it: 'File troppo grande. Dimensione massima 5 MB.', es: 'Archivo demasiado grande. Tamaño máximo 5 MB.', fr: 'Fichier trop volumineux. Taille maximale 5 Mo.', de: 'Datei zu groß. Maximale Größe 5 MB.', pt: 'Arquivo muito grande. Tamanho máximo 5 MB.' },
  errorParse: { en: 'Could not parse SVG code. Please check the code and try again.', it: 'Impossibile analizzare il codice SVG. Controlla il codice e riprova.', es: 'No se pudo analizar el código SVG. Verifica el código e intenta de nuevo.', fr: 'Impossible d\'analyser le code SVG. Vérifiez le code et réessayez.', de: 'SVG-Code konnte nicht analysiert werden. Überprüfen Sie den Code und versuchen Sie es erneut.', pt: 'Não foi possível analisar o código SVG. Verifique o código e tente novamente.' },
  lockAspect: { en: 'Lock aspect ratio', it: 'Blocca proporzioni', es: 'Bloquear proporción', fr: 'Verrouiller les proportions', de: 'Seitenverhältnis sperren', pt: 'Bloquear proporção' },
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function SvgToPng() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['svg-to-png']?.[lang] || tools['svg-to-png']?.en;
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [svgCode, setSvgCode] = useState('');
  const [svgDataUrl, setSvgDataUrl] = useState('');
  const [svgNaturalWidth, setSvgNaturalWidth] = useState(0);
  const [svgNaturalHeight, setSvgNaturalHeight] = useState(0);
  const [scale, setScale] = useState(1);
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [useCustomSize, setUseCustomSize] = useState(false);
  const [bgMode, setBgMode] = useState<'transparent' | 'custom'>('transparent');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [pngUrl, setPngUrl] = useState('');
  const [pngSize, setPngSize] = useState(0);
  const [svgFileSize, setSvgFileSize] = useState(0);
  const [error, setError] = useState('');
  const [copiedStats, setCopiedStats] = useState(false);
  const [lockAspect, setLockAspect] = useState(true);
  const [fileName, setFileName] = useState('');
  const [pasteCode, setPasteCode] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const parseSvgDimensions = (svgText: string): { w: number; h: number } => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    if (!svgEl) return { w: 300, h: 150 };

    let w = parseFloat(svgEl.getAttribute('width') || '0');
    let h = parseFloat(svgEl.getAttribute('height') || '0');

    if ((!w || !h) && svgEl.getAttribute('viewBox')) {
      const vb = svgEl.getAttribute('viewBox')!.split(/[\s,]+/).map(Number);
      if (vb.length === 4) {
        w = w || vb[2];
        h = h || vb[3];
      }
    }

    return { w: w || 300, h: h || 150 };
  };

  const loadSvgFromText = useCallback((text: string, fileSize?: number) => {
    setError('');
    setPngUrl('');
    setPngSize(0);

    if (!text.trim().includes('<svg')) {
      setError(t('errorParse'));
      return;
    }

    const dims = parseSvgDimensions(text);
    setSvgNaturalWidth(dims.w);
    setSvgNaturalHeight(dims.h);
    setSvgCode(text);
    setSvgFileSize(fileSize || new Blob([text]).size);

    const blob = new Blob([text], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    setSvgDataUrl(url);

    setCustomWidth(String(Math.round(dims.w)));
    setCustomHeight(String(Math.round(dims.h)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const handleFile = (file: File) => {
    setError('');
    if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
      setError(t('errorInvalid'));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(t('errorTooLarge'));
      return;
    }
    setFileName(file.name.replace(/\.svg$/i, ''));
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      loadSvgFromText(text, file.size);
    };
    reader.readAsText(file);
  };

  const handlePasteLoad = () => {
    if (!pasteCode.trim()) return;
    setFileName('pasted-svg');
    loadSvgFromText(pasteCode.trim());
  };

  const getOutputWidth = (): number => {
    if (useCustomSize && customWidth) return parseInt(customWidth) || svgNaturalWidth;
    return Math.round(svgNaturalWidth * scale);
  };

  const getOutputHeight = (): number => {
    if (useCustomSize && customHeight) return parseInt(customHeight) || svgNaturalHeight;
    return Math.round(svgNaturalHeight * scale);
  };

  const handleWidthChange = (val: string) => {
    setCustomWidth(val);
    if (lockAspect && svgNaturalWidth > 0 && val) {
      const ratio = svgNaturalHeight / svgNaturalWidth;
      setCustomHeight(String(Math.round(parseInt(val) * ratio)));
    }
  };

  const handleHeightChange = (val: string) => {
    setCustomHeight(val);
    if (lockAspect && svgNaturalHeight > 0 && val) {
      const ratio = svgNaturalWidth / svgNaturalHeight;
      setCustomWidth(String(Math.round(parseInt(val) * ratio)));
    }
  };

  const convertToPng = () => {
    if (!svgCode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const outW = getOutputWidth();
    const outH = getOutputHeight();
    canvas.width = outW;
    canvas.height = outH;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (bgMode === 'custom') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, outW, outH);
    } else {
      ctx.clearRect(0, 0, outW, outH);
    }

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, outW, outH);
      canvas.toBlob((blob) => {
        if (blob) {
          setPngSize(blob.size);
          const url = URL.createObjectURL(blob);
          setPngUrl(url);
        }
      }, 'image/png');
    };
    img.onerror = () => {
      setError(t('errorParse'));
    };

    const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
    img.src = URL.createObjectURL(blob);
  };

  const handleReset = () => {
    setSvgCode('');
    setSvgDataUrl('');
    setSvgNaturalWidth(0);
    setSvgNaturalHeight(0);
    setScale(1);
    setCustomWidth('');
    setCustomHeight('');
    setUseCustomSize(false);
    setBgMode('transparent');
    setBgColor('#ffffff');
    setPngUrl('');
    setPngSize(0);
    setSvgFileSize(0);
    setError('');
    setFileName('');
    setPasteCode('');
    setCopiedStats(false);
    setLockAspect(true);
    if (fileRef.current) fileRef.current.value = '';
  };

  const copyStats = () => {
    const stats = `${fileName || 'svg'}: SVG ${formatBytes(svgFileSize)} -> PNG ${formatBytes(pngSize)} (${getOutputWidth()}x${getOutputHeight()}px, ${scale}x)`;
    navigator.clipboard.writeText(stats).then(() => {
      setCopiedStats(true);
      setTimeout(() => setCopiedStats(false), 2000);
    });
  };

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'SVG to PNG Converter: Transform Vector Graphics to Raster Images',
      paragraphs: [
        'SVG (Scalable Vector Graphics) is a powerful format for web graphics, icons, and illustrations. However, many platforms, email clients, and older applications do not support SVG files directly. Converting SVG to PNG gives you a universally compatible raster image that works everywhere while maintaining the visual quality of your original design.',
        'Our browser-based SVG to PNG converter processes everything locally on your device. No files are uploaded to any server, ensuring complete privacy and security. You can upload an SVG file via drag and drop or paste raw SVG code directly into the text area for quick conversion.',
        'The tool offers flexible output options. Choose from preset scale factors (1x, 2x, 3x, 4x) for quick high-resolution exports, or enter custom width and height values for precise control. The aspect ratio lock ensures your image does not get distorted during resizing. You can also set a transparent or custom background color.',
        'SVG to PNG conversion is essential for graphic designers preparing assets for social media, developers exporting icons for mobile apps, and anyone who needs pixel-perfect raster images from vector sources. The real-time preview shows your SVG before conversion, and file size comparison helps you understand the output. Simply upload, configure your settings, convert, and download your PNG file instantly.'
      ],
      faq: [
        { q: 'Is my SVG file uploaded to a server?', a: 'No. All conversion happens locally in your browser using the HTML5 Canvas API. Your SVG file never leaves your device, making this tool completely private and secure.' },
        { q: 'What scale factor should I use?', a: 'Use 1x for standard resolution, 2x for Retina/HiDPI displays, and 3x or 4x for print or very high-resolution needs. Higher scales produce larger file sizes but sharper images when viewed at large sizes.' },
        { q: 'Can I set a transparent background?', a: 'Yes. By default the background is transparent (PNG supports transparency). You can also choose a custom background color if you need a solid color behind your SVG content.' },
        { q: 'Why does my PNG look blurry?', a: 'If your SVG has no explicit width/height or viewBox, the converter defaults to 300x150 pixels. Try increasing the scale factor or entering custom dimensions for a sharper result.' },
        { q: 'Can I paste SVG code instead of uploading a file?', a: 'Yes. You can paste raw SVG markup into the text area and click Load SVG. This is useful when you have inline SVG code from a website or code editor and want to quickly convert it to PNG.' }
      ]
    },
    it: {
      title: 'Convertitore SVG in PNG: Trasforma Grafica Vettoriale in Immagini Raster',
      paragraphs: [
        'SVG (Scalable Vector Graphics) è un formato potente per grafica web, icone e illustrazioni. Tuttavia, molte piattaforme, client email e applicazioni più datate non supportano direttamente i file SVG. Convertire SVG in PNG ti offre un\'immagine raster universalmente compatibile che funziona ovunque mantenendo la qualità visiva del design originale.',
        'Il nostro convertitore SVG in PNG basato su browser elabora tutto localmente sul tuo dispositivo. Nessun file viene caricato su alcun server, garantendo privacy e sicurezza complete. Puoi caricare un file SVG tramite trascinamento o incollare il codice SVG direttamente nell\'area di testo per una conversione rapida.',
        'Lo strumento offre opzioni di output flessibili. Scegli tra fattori di scala preimpostati (1x, 2x, 3x, 4x) per esportazioni rapide ad alta risoluzione, oppure inserisci valori personalizzati di larghezza e altezza per un controllo preciso. Il blocco delle proporzioni assicura che l\'immagine non venga distorta durante il ridimensionamento. Puoi anche impostare uno sfondo trasparente o con colore personalizzato.',
        'La conversione da SVG a PNG è essenziale per graphic designer che preparano risorse per social media, sviluppatori che esportano icone per app mobile e chiunque necessiti di immagini raster perfette da sorgenti vettoriali. L\'anteprima in tempo reale mostra il tuo SVG prima della conversione e il confronto delle dimensioni dei file ti aiuta a comprendere l\'output. Carica, configura, converti e scarica il tuo file PNG istantaneamente.'
      ],
      faq: [
        { q: 'Il mio file SVG viene caricato su un server?', a: 'No. Tutta la conversione avviene localmente nel tuo browser usando l\'API Canvas HTML5. Il tuo file SVG non lascia mai il tuo dispositivo, rendendo lo strumento completamente privato e sicuro.' },
        { q: 'Quale fattore di scala dovrei usare?', a: 'Usa 1x per risoluzione standard, 2x per display Retina/HiDPI, e 3x o 4x per stampa o esigenze ad altissima risoluzione. Scale più alte producono file più grandi ma immagini più nitide.' },
        { q: 'Posso impostare uno sfondo trasparente?', a: 'Sì. Per impostazione predefinita lo sfondo è trasparente (PNG supporta la trasparenza). Puoi anche scegliere un colore di sfondo personalizzato se hai bisogno di un colore solido dietro il contenuto SVG.' },
        { q: 'Perché il mio PNG appare sfocato?', a: 'Se il tuo SVG non ha larghezza/altezza esplicite o viewBox, il convertitore usa come default 300x150 pixel. Prova ad aumentare il fattore di scala o inserire dimensioni personalizzate per un risultato più nitido.' },
        { q: 'Posso incollare codice SVG invece di caricare un file?', a: 'Sì. Puoi incollare markup SVG nell\'area di testo e cliccare Carica SVG. Questo è utile quando hai codice SVG inline da un sito web o editor di codice.' }
      ]
    },
    es: {
      title: 'Convertidor SVG a PNG: Transforma Gráficos Vectoriales en Imágenes Raster',
      paragraphs: [
        'SVG (Scalable Vector Graphics) es un formato potente para gráficos web, iconos e ilustraciones. Sin embargo, muchas plataformas, clientes de correo y aplicaciones antiguas no soportan archivos SVG directamente. Convertir SVG a PNG te da una imagen raster universalmente compatible que funciona en todas partes manteniendo la calidad visual de tu diseño original.',
        'Nuestro convertidor SVG a PNG basado en navegador procesa todo localmente en tu dispositivo. Ningún archivo se sube a ningún servidor, garantizando privacidad y seguridad completas. Puedes subir un archivo SVG arrastrándolo o pegar código SVG directamente en el área de texto para una conversión rápida.',
        'La herramienta ofrece opciones de salida flexibles. Elige entre factores de escala preestablecidos (1x, 2x, 3x, 4x) para exportaciones rápidas en alta resolución, o ingresa valores personalizados de ancho y alto para un control preciso. El bloqueo de proporción asegura que tu imagen no se distorsione. También puedes establecer un fondo transparente o con color personalizado.',
        'La conversión de SVG a PNG es esencial para diseñadores gráficos preparando recursos para redes sociales, desarrolladores exportando iconos para apps móviles y cualquiera que necesite imágenes raster perfectas desde fuentes vectoriales. La vista previa en tiempo real muestra tu SVG antes de la conversión y la comparación de tamaños te ayuda a entender el resultado. Sube, configura, convierte y descarga tu PNG al instante.'
      ],
      faq: [
        { q: '¿Mi archivo SVG se sube a algún servidor?', a: 'No. Toda la conversión ocurre localmente en tu navegador usando la API Canvas de HTML5. Tu archivo SVG nunca sale de tu dispositivo, haciendo esta herramienta completamente privada y segura.' },
        { q: '¿Qué factor de escala debería usar?', a: 'Usa 1x para resolución estándar, 2x para pantallas Retina/HiDPI, y 3x o 4x para impresión o necesidades de muy alta resolución. Escalas más altas producen archivos más grandes pero imágenes más nítidas.' },
        { q: '¿Puedo establecer un fondo transparente?', a: 'Sí. Por defecto el fondo es transparente (PNG soporta transparencia). También puedes elegir un color de fondo personalizado si necesitas un color sólido detrás de tu contenido SVG.' },
        { q: '¿Por qué mi PNG se ve borroso?', a: 'Si tu SVG no tiene ancho/alto explícitos o viewBox, el convertidor usa por defecto 300x150 píxeles. Intenta aumentar el factor de escala o ingresar dimensiones personalizadas para un resultado más nítido.' },
        { q: '¿Puedo pegar código SVG en vez de subir un archivo?', a: 'Sí. Puedes pegar markup SVG en el área de texto y hacer clic en Cargar SVG. Esto es útil cuando tienes código SVG inline de un sitio web o editor de código.' }
      ]
    },
    fr: {
      title: 'Convertisseur SVG en PNG : Transformez les Graphiques Vectoriels en Images Raster',
      paragraphs: [
        'SVG (Scalable Vector Graphics) est un format puissant pour les graphiques web, icônes et illustrations. Cependant, de nombreuses plateformes, clients email et applications plus anciennes ne supportent pas directement les fichiers SVG. Convertir SVG en PNG vous donne une image raster universellement compatible qui fonctionne partout tout en maintenant la qualité visuelle de votre design original.',
        'Notre convertisseur SVG en PNG basé sur navigateur traite tout localement sur votre appareil. Aucun fichier n\'est envoyé à un serveur, garantissant confidentialité et sécurité complètes. Vous pouvez télécharger un fichier SVG par glisser-déposer ou coller du code SVG directement dans la zone de texte pour une conversion rapide.',
        'L\'outil offre des options de sortie flexibles. Choisissez parmi des facteurs d\'échelle prédéfinis (1x, 2x, 3x, 4x) pour des exports rapides en haute résolution, ou entrez des valeurs personnalisées de largeur et hauteur pour un contrôle précis. Le verrouillage des proportions assure que votre image ne soit pas déformée. Vous pouvez également définir un arrière-plan transparent ou avec couleur personnalisée.',
        'La conversion SVG en PNG est essentielle pour les graphistes préparant des ressources pour les réseaux sociaux, les développeurs exportant des icônes pour applications mobiles et quiconque a besoin d\'images raster parfaites depuis des sources vectorielles. L\'aperçu en temps réel montre votre SVG avant conversion et la comparaison des tailles vous aide à comprendre le résultat. Téléchargez, configurez, convertissez et téléchargez votre PNG instantanément.'
      ],
      faq: [
        { q: 'Mon fichier SVG est-il envoyé à un serveur ?', a: 'Non. Toute la conversion se fait localement dans votre navigateur via l\'API Canvas HTML5. Votre fichier SVG ne quitte jamais votre appareil, rendant cet outil complètement privé et sécurisé.' },
        { q: 'Quel facteur d\'échelle devrais-je utiliser ?', a: 'Utilisez 1x pour la résolution standard, 2x pour les écrans Retina/HiDPI, et 3x ou 4x pour l\'impression ou les besoins en très haute résolution. Des échelles plus élevées produisent des fichiers plus volumineux mais des images plus nettes.' },
        { q: 'Puis-je définir un arrière-plan transparent ?', a: 'Oui. Par défaut l\'arrière-plan est transparent (PNG supporte la transparence). Vous pouvez aussi choisir une couleur d\'arrière-plan personnalisée si vous avez besoin d\'une couleur solide derrière votre contenu SVG.' },
        { q: 'Pourquoi mon PNG est-il flou ?', a: 'Si votre SVG n\'a pas de largeur/hauteur explicites ou de viewBox, le convertisseur utilise par défaut 300x150 pixels. Essayez d\'augmenter le facteur d\'échelle ou d\'entrer des dimensions personnalisées pour un résultat plus net.' },
        { q: 'Puis-je coller du code SVG au lieu de télécharger un fichier ?', a: 'Oui. Vous pouvez coller du markup SVG dans la zone de texte et cliquer sur Charger SVG. C\'est utile quand vous avez du code SVG inline depuis un site web ou éditeur de code.' }
      ]
    },
    de: {
      title: 'SVG zu PNG Konverter: Vektorgrafiken in Rasterbilder Umwandeln',
      paragraphs: [
        'SVG (Scalable Vector Graphics) ist ein leistungsstarkes Format für Webgrafiken, Icons und Illustrationen. Viele Plattformen, E-Mail-Clients und ältere Anwendungen unterstützen SVG-Dateien jedoch nicht direkt. Die Konvertierung von SVG zu PNG gibt Ihnen ein universell kompatibles Rasterbild, das überall funktioniert und die visuelle Qualität Ihres Originaldesigns beibehält.',
        'Unser browserbasierter SVG-zu-PNG-Konverter verarbeitet alles lokal auf Ihrem Gerät. Keine Dateien werden auf einen Server hochgeladen, was vollständige Privatsphäre und Sicherheit gewährleistet. Sie können eine SVG-Datei per Drag-and-Drop hochladen oder rohen SVG-Code direkt in das Textfeld einfügen.',
        'Das Tool bietet flexible Ausgabeoptionen. Wählen Sie aus voreingestellten Skalierungsfaktoren (1x, 2x, 3x, 4x) für schnelle hochauflösende Exporte oder geben Sie benutzerdefinierte Breiten- und Höhenwerte für präzise Kontrolle ein. Die Seitenverhältnissperre stellt sicher, dass Ihr Bild beim Skalieren nicht verzerrt wird. Sie können auch einen transparenten oder benutzerdefinierten Hintergrund festlegen.',
        'Die SVG-zu-PNG-Konvertierung ist unverzichtbar für Grafikdesigner, die Assets für Social Media vorbereiten, Entwickler, die Icons für mobile Apps exportieren, und alle, die pixelgenaue Rasterbilder aus Vektorquellen benötigen. Die Echtzeitvorschau zeigt Ihr SVG vor der Konvertierung, und der Dateigrößenvergleich hilft beim Verständnis der Ausgabe. Laden Sie hoch, konfigurieren Sie, konvertieren Sie und laden Sie Ihre PNG-Datei sofort herunter.'
      ],
      faq: [
        { q: 'Wird meine SVG-Datei auf einen Server hochgeladen?', a: 'Nein. Die gesamte Konvertierung erfolgt lokal in Ihrem Browser über die HTML5 Canvas API. Ihre SVG-Datei verlässt niemals Ihr Gerät, was dieses Tool vollständig privat und sicher macht.' },
        { q: 'Welchen Skalierungsfaktor sollte ich verwenden?', a: 'Verwenden Sie 1x für Standardauflösung, 2x für Retina/HiDPI-Displays und 3x oder 4x für Druck oder sehr hochauflösende Anforderungen. Höhere Skalierungen erzeugen größere Dateien, aber schärfere Bilder.' },
        { q: 'Kann ich einen transparenten Hintergrund einstellen?', a: 'Ja. Standardmäßig ist der Hintergrund transparent (PNG unterstützt Transparenz). Sie können auch eine benutzerdefinierte Hintergrundfarbe wählen, wenn Sie eine Volltonfarbe hinter Ihrem SVG-Inhalt benötigen.' },
        { q: 'Warum sieht mein PNG unscharf aus?', a: 'Wenn Ihr SVG keine explizite Breite/Höhe oder ViewBox hat, verwendet der Konverter standardmäßig 300x150 Pixel. Versuchen Sie, den Skalierungsfaktor zu erhöhen oder benutzerdefinierte Abmessungen einzugeben.' },
        { q: 'Kann ich SVG-Code einfügen statt eine Datei hochzuladen?', a: 'Ja. Sie können SVG-Markup in das Textfeld einfügen und auf SVG Laden klicken. Dies ist nützlich, wenn Sie Inline-SVG-Code von einer Website oder einem Code-Editor haben.' }
      ]
    },
    pt: {
      title: 'Conversor SVG para PNG: Transforme Gráficos Vetoriais em Imagens Raster',
      paragraphs: [
        'SVG (Scalable Vector Graphics) é um formato poderoso para gráficos web, ícones e ilustrações. No entanto, muitas plataformas, clientes de email e aplicações mais antigas não suportam arquivos SVG diretamente. Converter SVG para PNG te dá uma imagem raster universalmente compatível que funciona em todos os lugares mantendo a qualidade visual do seu design original.',
        'Nosso conversor SVG para PNG baseado em navegador processa tudo localmente no seu dispositivo. Nenhum arquivo é enviado para qualquer servidor, garantindo privacidade e segurança completas. Você pode enviar um arquivo SVG arrastando e soltando ou colar código SVG diretamente na área de texto para conversão rápida.',
        'A ferramenta oferece opções de saída flexíveis. Escolha entre fatores de escala predefinidos (1x, 2x, 3x, 4x) para exportações rápidas em alta resolução, ou insira valores personalizados de largura e altura para controle preciso. O bloqueio de proporção garante que sua imagem não seja distorcida. Você também pode definir um fundo transparente ou com cor personalizada.',
        'A conversão de SVG para PNG é essencial para designers gráficos preparando recursos para redes sociais, desenvolvedores exportando ícones para apps móveis e qualquer pessoa que precise de imagens raster perfeitas de fontes vetoriais. A pré-visualização em tempo real mostra seu SVG antes da conversão e a comparação de tamanhos ajuda a entender o resultado. Envie, configure, converta e baixe seu PNG instantaneamente.'
      ],
      faq: [
        { q: 'Meu arquivo SVG é enviado para algum servidor?', a: 'Não. Toda a conversão acontece localmente no seu navegador usando a API Canvas do HTML5. Seu arquivo SVG nunca sai do seu dispositivo, tornando esta ferramenta completamente privada e segura.' },
        { q: 'Qual fator de escala devo usar?', a: 'Use 1x para resolução padrão, 2x para telas Retina/HiDPI, e 3x ou 4x para impressão ou necessidades de altíssima resolução. Escalas mais altas produzem arquivos maiores mas imagens mais nítidas.' },
        { q: 'Posso definir um fundo transparente?', a: 'Sim. Por padrão o fundo é transparente (PNG suporta transparência). Você também pode escolher uma cor de fundo personalizada se precisar de uma cor sólida atrás do seu conteúdo SVG.' },
        { q: 'Por que meu PNG está borrado?', a: 'Se seu SVG não tem largura/altura explícitas ou viewBox, o conversor usa como padrão 300x150 pixels. Tente aumentar o fator de escala ou inserir dimensões personalizadas para um resultado mais nítido.' },
        { q: 'Posso colar código SVG em vez de enviar um arquivo?', a: 'Sim. Você pode colar markup SVG na área de texto e clicar em Carregar SVG. Isso é útil quando você tem código SVG inline de um site ou editor de código.' }
      ]
    },
  };

  const seo = seoContent[lang] || seoContent.en;

  return (
    <ToolPageWrapper toolSlug="svg-to-png" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT?.name || 'SVG to PNG'}</h1>
        <p className="text-gray-600 mb-6">{toolT?.description || ''}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* File upload drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
          >
            <p className="text-gray-500">{t('dragDrop')}</p>
            <p className="text-xs text-gray-400 mt-1">.svg &middot; max 5 MB</p>
            <input ref={fileRef} type="file" accept=".svg,image/svg+xml" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
          </div>

          {/* Paste SVG code */}
          {!svgCode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('orPaste')}</label>
              <textarea
                value={pasteCode}
                onChange={(e) => setPasteCode(e.target.value)}
                placeholder={t('pastePlaceholder')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-32 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              />
              <button
                onClick={handlePasteLoad}
                disabled={!pasteCode.trim()}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {t('loadSvg')}
              </button>
            </div>
          )}

          {/* SVG loaded - show options and preview */}
          {svgCode && (
            <>
              {/* SVG Preview */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">{t('preview')}</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center overflow-hidden" style={{ backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={svgDataUrl} alt="SVG Preview" className="max-w-full max-h-64 object-contain" />
                </div>
                <p className="text-xs text-gray-400 mt-1">{t('dimensions')}: {svgNaturalWidth} x {svgNaturalHeight}px</p>
              </div>

              {/* Scale options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('scale')}</label>
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4].map((s) => (
                    <button
                      key={s}
                      onClick={() => { setScale(s); setUseCustomSize(false); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!useCustomSize && scale === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {s}x
                    </button>
                  ))}
                  <button
                    onClick={() => setUseCustomSize(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${useCustomSize ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {t('customSize')}
                  </button>
                </div>
              </div>

              {/* Custom size inputs */}
              {useCustomSize && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{t('width')} (px)</label>
                      <input
                        type="number"
                        value={customWidth}
                        onChange={(e) => handleWidthChange(e.target.value)}
                        min="1"
                        max="8192"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{t('height')} (px)</label>
                      <input
                        type="number"
                        value={customHeight}
                        onChange={(e) => handleHeightChange(e.target.value)}
                        min="1"
                        max="8192"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lockAspect}
                      onChange={(e) => setLockAspect(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    {t('lockAspect')}
                  </label>
                </div>
              )}

              {/* Background color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('backgroundColor')}</label>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setBgMode('transparent')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${bgMode === 'transparent' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {t('transparent')}
                  </button>
                  <button
                    onClick={() => setBgMode('custom')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${bgMode === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {t('custom')}
                  </button>
                  {bgMode === 'custom' && (
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                  )}
                </div>
              </div>

              {/* Output dimensions info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">
                  {t('outputDimensions')}: <span className="font-semibold text-gray-900">{getOutputWidth()} x {getOutputHeight()}px</span>
                </p>
              </div>

              {/* Convert button */}
              <button
                onClick={convertToPng}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {t('convert')}
              </button>

              {/* Results */}
              {pngUrl && (
                <>
                  {/* Size comparison */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                      <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">{t('svgSize')}</p>
                      <p className="text-2xl font-bold text-blue-700 mt-1">{formatBytes(svgFileSize)}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <p className="text-xs text-green-500 font-medium uppercase tracking-wide">{t('pngSize')}</p>
                      <p className="text-2xl font-bold text-green-700 mt-1">{formatBytes(pngSize)}</p>
                    </div>
                  </div>

                  {/* PNG preview */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center" style={{ backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={pngUrl} alt="PNG Preview" className="max-w-full max-h-64 object-contain" />
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <a
                      href={pngUrl}
                      download={`${fileName || 'converted'}.png`}
                      className="flex-1 text-center bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      {t('download')}
                    </a>
                    <button
                      onClick={copyStats}
                      className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                    >
                      {copiedStats ? t('copied') : t('copyStats')}
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-4 py-3 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors text-sm"
                    >
                      {t('reset')}
                    </button>
                  </div>
                </>
              )}

              {/* Reset button when no PNG yet */}
              {!pngUrl && (
                <button
                  onClick={handleReset}
                  className="w-full py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors text-sm"
                >
                  {t('reset')}
                </button>
              )}
            </>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

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
