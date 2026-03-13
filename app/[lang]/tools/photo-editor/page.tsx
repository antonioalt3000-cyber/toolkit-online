'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  upload: { en: 'Upload Image', it: 'Carica Immagine', es: 'Subir Imagen', fr: 'T\u00e9l\u00e9charger Image', de: 'Bild Hochladen', pt: 'Enviar Imagem' },
  dragDrop: { en: 'Drag & drop or click to upload', it: 'Trascina o clicca per caricare', es: 'Arrastra o haz clic para subir', fr: 'Glissez ou cliquez pour t\u00e9l\u00e9charger', de: 'Ziehen oder klicken zum Hochladen', pt: 'Arraste ou clique para enviar' },
  brightness: { en: 'Brightness', it: 'Luminosit\u00e0', es: 'Brillo', fr: 'Luminosit\u00e9', de: 'Helligkeit', pt: 'Brilho' },
  contrast: { en: 'Contrast', it: 'Contrasto', es: 'Contraste', fr: 'Contraste', de: 'Kontrast', pt: 'Contraste' },
  saturation: { en: 'Saturation', it: 'Saturazione', es: 'Saturaci\u00f3n', fr: 'Saturation', de: 'S\u00e4ttigung', pt: 'Satura\u00e7\u00e3o' },
  blur: { en: 'Blur', it: 'Sfocatura', es: 'Desenfoque', fr: 'Flou', de: 'Unsch\u00e4rfe', pt: 'Desfoque' },
  grayscale: { en: 'Grayscale', it: 'Scala di grigi', es: 'Escala de grises', fr: 'Niveaux de gris', de: 'Graustufen', pt: 'Escala de cinza' },
  sepia: { en: 'Sepia', it: 'Seppia', es: 'Sepia', fr: 'S\u00e9pia', de: 'Sepia', pt: 'S\u00e9pia' },
  invert: { en: 'Invert Colors', it: 'Inverti colori', es: 'Invertir colores', fr: 'Inverser les couleurs', de: 'Farben invertieren', pt: 'Inverter cores' },
  rotateLeft: { en: 'Rotate Left', it: 'Ruota a sinistra', es: 'Rotar izquierda', fr: 'Rotation gauche', de: 'Links drehen', pt: 'Girar esquerda' },
  rotateRight: { en: 'Rotate Right', it: 'Ruota a destra', es: 'Rotar derecha', fr: 'Rotation droite', de: 'Rechts drehen', pt: 'Girar direita' },
  flipH: { en: 'Flip Horizontal', it: 'Specchia orizzontale', es: 'Voltear horizontal', fr: 'Miroir horizontal', de: 'Horizontal spiegeln', pt: 'Espelhar horizontal' },
  flipV: { en: 'Flip Vertical', it: 'Specchia verticale', es: 'Voltear vertical', fr: 'Miroir vertical', de: 'Vertikal spiegeln', pt: 'Espelhar vertical' },
  reset: { en: 'Reset All', it: 'Reimposta tutto', es: 'Reiniciar todo', fr: 'Tout r\u00e9initialiser', de: 'Alles zur\u00fccksetzen', pt: 'Redefinir tudo' },
  download: { en: 'Download Image', it: 'Scarica immagine', es: 'Descargar imagen', fr: 'T\u00e9l\u00e9charger image', de: 'Bild herunterladen', pt: 'Baixar imagem' },
  format: { en: 'Output Format', it: 'Formato output', es: 'Formato de salida', fr: 'Format de sortie', de: 'Ausgabeformat', pt: 'Formato de sa\u00edda' },
  quality: { en: 'Quality', it: 'Qualit\u00e0', es: 'Calidad', fr: 'Qualit\u00e9', de: 'Qualit\u00e4t', pt: 'Qualidade' },
  dimensions: { en: 'Dimensions', it: 'Dimensioni', es: 'Dimensiones', fr: 'Dimensions', de: 'Abmessungen', pt: 'Dimens\u00f5es' },
  adjustments: { en: 'Adjustments', it: 'Regolazioni', es: 'Ajustes', fr: 'Ajustements', de: 'Anpassungen', pt: 'Ajustes' },
  transforms: { en: 'Transforms', it: 'Trasformazioni', es: 'Transformaciones', fr: 'Transformations', de: 'Transformationen', pt: 'Transforma\u00e7\u00f5es' },
  effects: { en: 'Effects', it: 'Effetti', es: 'Efectos', fr: 'Effets', de: 'Effekte', pt: 'Efeitos' },
  export: { en: 'Export', it: 'Esporta', es: 'Exportar', fr: 'Exporter', de: 'Exportieren', pt: 'Exportar' },
  preview: { en: 'Preview', it: 'Anteprima', es: 'Vista previa', fr: 'Aper\u00e7u', de: 'Vorschau', pt: 'Pr\u00e9-visualiza\u00e7\u00e3o' },
  original: { en: 'Original', it: 'Originale', es: 'Original', fr: 'Original', de: 'Original', pt: 'Original' },
  edited: { en: 'Edited', it: 'Modificata', es: 'Editada', fr: '\u00c9dit\u00e9e', de: 'Bearbeitet', pt: 'Editada' },
  errorUnsupported: { en: 'Unsupported file type. Please upload JPEG, PNG, WebP, GIF, or BMP.', it: 'Tipo di file non supportato. Carica JPEG, PNG, WebP, GIF o BMP.', es: 'Tipo de archivo no soportado. Sube JPEG, PNG, WebP, GIF o BMP.', fr: 'Type de fichier non pris en charge. T\u00e9l\u00e9chargez JPEG, PNG, WebP, GIF ou BMP.', de: 'Nicht unterst\u00fctzter Dateityp. Bitte JPEG, PNG, WebP, GIF oder BMP hochladen.', pt: 'Tipo de arquivo n\u00e3o suportado. Envie JPEG, PNG, WebP, GIF ou BMP.' },
  errorTooLarge: { en: 'File too large. Maximum size is 20 MB.', it: 'File troppo grande. La dimensione massima \u00e8 20 MB.', es: 'Archivo demasiado grande. El tama\u00f1o m\u00e1ximo es 20 MB.', fr: 'Fichier trop volumineux. La taille maximale est de 20 Mo.', de: 'Datei zu gro\u00df. Maximale Gr\u00f6\u00dfe ist 20 MB.', pt: 'Arquivo muito grande. O tamanho m\u00e1ximo \u00e9 20 MB.' },
  compareView: { en: 'Before / After', it: 'Prima / Dopo', es: 'Antes / Despu\u00e9s', fr: 'Avant / Apr\u00e8s', de: 'Vorher / Nachher', pt: 'Antes / Depois' },
  undo: { en: 'Undo', it: 'Annulla', es: 'Deshacer', fr: 'Annuler', de: 'R\u00fcckg\u00e4ngig', pt: 'Desfazer' },
};

const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
const MAX_FILE_SIZE = 20 * 1024 * 1024;

interface Filters {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: boolean;
  sepia: boolean;
  invert: boolean;
}

interface TransformState {
  rotation: number;
  flipH: boolean;
  flipV: boolean;
}

const defaultFilters: Filters = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
  grayscale: false,
  sepia: false,
  invert: false,
};

const defaultTransform: TransformState = {
  rotation: 0,
  flipH: false,
  flipV: false,
};

export default function PhotoEditor() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['photo-editor']?.[lang] || tools['photo-editor']?.en;
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [filters, setFilters] = useState<Filters>({ ...defaultFilters });
  const [transform, setTransform] = useState<TransformState>({ ...defaultTransform });
  const [imgSrc, setImgSrc] = useState('');
  const [originalSrc, setOriginalSrc] = useState('');
  const [imgWidth, setImgWidth] = useState(0);
  const [imgHeight, setImgHeight] = useState(0);
  const [format, setFormat] = useState('image/jpeg');
  const [quality, setQuality] = useState(92);
  const [error, setError] = useState('');
  const [showCompare, setShowCompare] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [history, setHistory] = useState<{ filters: Filters; transform: TransformState }[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const pushHistory = useCallback(() => {
    setHistory(prev => [...prev, { filters: { ...filters }, transform: { ...transform } }]);
  }, [filters, transform]);

  const handleFile = useCallback((file: File) => {
    setError('');
    if (!SUPPORTED_TYPES.includes(file.type)) {
      setError(t('errorUnsupported'));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(t('errorTooLarge'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImgSrc(src);
      setOriginalSrc(src);
      setFilters({ ...defaultFilters });
      setTransform({ ...defaultTransform });
      setHistory([]);
      setShowCompare(false);

      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        setImgWidth(img.naturalWidth);
        setImgHeight(img.naturalHeight);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const buildFilterString = useCallback(() => {
    const parts: string[] = [];
    parts.push(`brightness(${(100 + filters.brightness) / 100})`);
    parts.push(`contrast(${(100 + filters.contrast) / 100})`);
    parts.push(`saturate(${(100 + filters.saturation) / 100})`);
    if (filters.blur > 0) parts.push(`blur(${filters.blur}px)`);
    if (filters.grayscale) parts.push('grayscale(1)');
    if (filters.sepia) parts.push('sepia(1)');
    if (filters.invert) parts.push('invert(1)');
    return parts.join(' ');
  }, [filters]);

  const renderCanvas = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const isRotated = transform.rotation % 180 !== 0;
    const w = isRotated ? img.naturalHeight : img.naturalWidth;
    const h = isRotated ? img.naturalWidth : img.naturalHeight;

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate((transform.rotation * Math.PI) / 180);
    ctx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1);
    ctx.filter = buildFilterString();
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();
  }, [transform, buildFilterString]);

  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const preview = previewCanvasRef.current;
    if (!canvas || !preview || canvas.width === 0) return;

    const maxPreview = 500;
    const scale = Math.min(1, maxPreview / Math.max(canvas.width, canvas.height));
    preview.width = Math.round(canvas.width * scale);
    preview.height = Math.round(canvas.height * scale);

    const ctx = preview.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(canvas, 0, 0, preview.width, preview.height);
  }, []);

  useEffect(() => {
    if (imgRef.current) {
      renderCanvas();
      // Small delay to ensure canvas is rendered before preview reads it
      requestAnimationFrame(() => renderPreview());
    }
  }, [filters, transform, renderCanvas, renderPreview]);

  const updateFilter = (key: keyof Filters, value: number | boolean) => {
    pushHistory();
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const rotateLeft = () => {
    pushHistory();
    setTransform(prev => ({ ...prev, rotation: (prev.rotation - 90 + 360) % 360 }));
  };

  const rotateRight = () => {
    pushHistory();
    setTransform(prev => ({ ...prev, rotation: (prev.rotation + 90) % 360 }));
  };

  const toggleFlipH = () => {
    pushHistory();
    setTransform(prev => ({ ...prev, flipH: !prev.flipH }));
  };

  const toggleFlipV = () => {
    pushHistory();
    setTransform(prev => ({ ...prev, flipV: !prev.flipV }));
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setFilters(prev.filters);
    setTransform(prev.transform);
  };

  const resetAll = () => {
    pushHistory();
    setFilters({ ...defaultFilters });
    setTransform({ ...defaultTransform });
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
    const q = format === 'image/png' ? undefined : quality / 100;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edited-photo.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    }, format, q);
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Online Photo Editor: Edit Images Directly in Your Browser',
      paragraphs: [
        'Editing photos no longer requires expensive software or complex desktop applications. Our free online photo editor runs entirely in your browser, letting you adjust brightness, contrast, saturation, and apply creative effects with just a few clicks. No installation, no signup, and no image uploads to external servers -- your photos stay completely private on your device.',
        'The tool offers a comprehensive set of adjustments that cover the most common photo editing needs. Use the brightness slider to lighten underexposed shots or darken overexposed ones. The contrast control helps make your images pop by increasing the difference between light and dark areas. Saturation adjustments let you create vibrant, colorful images or subtle, muted tones depending on your creative vision.',
        'Beyond basic adjustments, the editor includes blur effects for creating soft backgrounds or dreamy looks, grayscale conversion for classic black-and-white photography, sepia toning for a vintage aesthetic, and color inversion for artistic effects. You can also rotate images in 90-degree increments and flip them horizontally or vertically -- perfect for correcting orientation or creating mirror effects.',
        'When you are satisfied with your edits, export your image in JPEG, PNG, or WebP format with adjustable quality settings. The before-and-after comparison view lets you see exactly how your edits have transformed the original image. Whether you are preparing photos for social media, a website, or personal use, this photo editor provides all the essential tools you need without any cost or complexity.'
      ],
      faq: [
        { q: 'Is my photo uploaded to a server when I use this editor?', a: 'No. All editing happens locally in your browser using the HTML5 Canvas API. Your photos never leave your device, ensuring complete privacy and security. No data is sent to any external server.' },
        { q: 'What image formats can I edit and export?', a: 'You can upload JPEG, PNG, WebP, GIF, and BMP images for editing. For export, you can choose between JPEG (best for photos), PNG (lossless with transparency support), and WebP (modern format with excellent compression).' },
        { q: 'Can I undo my changes?', a: 'Yes. Every adjustment you make is tracked in the undo history. Click the Undo button to step back through your changes one at a time. You can also use the Reset All button to return to the original image instantly.' },
        { q: 'What is the maximum file size I can edit?', a: 'The editor supports images up to 20 MB in size. Very large images may take a moment to process depending on your device performance, but all processing happens locally.' },
        { q: 'How does the quality slider affect my exported image?', a: 'The quality slider controls the compression level of the exported file. Higher quality (90-100%) preserves more detail but creates larger files. For web use, 80-90% offers an excellent balance between quality and file size. The quality setting only affects JPEG and WebP exports; PNG is always lossless.' }
      ]
    },
    it: {
      title: 'Editor di Foto Online Gratuito: Modifica Immagini Direttamente nel Browser',
      paragraphs: [
        'Modificare le foto non richiede pi\u00f9 software costosi o applicazioni desktop complesse. Il nostro editor di foto online gratuito funziona interamente nel browser, permettendoti di regolare luminosit\u00e0, contrasto, saturazione e applicare effetti creativi con pochi clic. Nessuna installazione, nessuna registrazione e nessun caricamento su server esterni -- le tue foto restano completamente private sul tuo dispositivo.',
        'Lo strumento offre un set completo di regolazioni che coprono le esigenze di fotoritocco pi\u00f9 comuni. Usa il cursore della luminosit\u00e0 per schiarire scatti sottoesposti o scurire quelli sovraesposti. Il controllo del contrasto aiuta a far risaltare le immagini aumentando la differenza tra aree chiare e scure. Le regolazioni della saturazione permettono di creare immagini vivaci e colorate o toni sottili e attenuati.',
        'Oltre alle regolazioni di base, l\'editor include effetti di sfocatura per creare sfondi morbidi, conversione in scala di grigi per la fotografia classica in bianco e nero, tonalit\u00e0 seppia per un\'estetica vintage e inversione dei colori per effetti artistici. Puoi anche ruotare le immagini con incrementi di 90 gradi e specchiarle orizzontalmente o verticalmente.',
        'Quando sei soddisfatto delle modifiche, esporta la tua immagine in formato JPEG, PNG o WebP con impostazioni di qualit\u00e0 regolabili. La vista di confronto prima-dopo ti permette di vedere esattamente come le modifiche hanno trasformato l\'immagine originale. Che tu stia preparando foto per social media, un sito web o uso personale, questo editor fornisce tutti gli strumenti essenziali.'
      ],
      faq: [
        { q: 'La mia foto viene caricata su un server?', a: 'No. Tutte le modifiche avvengono localmente nel browser usando l\'API Canvas HTML5. Le tue foto non lasciano mai il dispositivo, garantendo completa privacy e sicurezza.' },
        { q: 'Quali formati di immagine posso modificare ed esportare?', a: 'Puoi caricare immagini JPEG, PNG, WebP, GIF e BMP per la modifica. Per l\'esportazione puoi scegliere tra JPEG (migliore per foto), PNG (senza perdita con supporto trasparenza) e WebP (formato moderno con eccellente compressione).' },
        { q: 'Posso annullare le mie modifiche?', a: 'S\u00ec. Ogni regolazione viene tracciata nella cronologia. Clicca Annulla per tornare indietro passo per passo. Puoi anche usare Reimposta tutto per tornare all\'immagine originale.' },
        { q: 'Qual \u00e8 la dimensione massima del file che posso modificare?', a: 'L\'editor supporta immagini fino a 20 MB. Immagini molto grandi potrebbero richiedere un momento per l\'elaborazione, ma tutto avviene localmente.' },
        { q: 'Come influisce il cursore della qualit\u00e0 sull\'immagine esportata?', a: 'Il cursore della qualit\u00e0 controlla il livello di compressione del file esportato. Qualit\u00e0 pi\u00f9 alta (90-100%) preserva pi\u00f9 dettagli ma crea file pi\u00f9 grandi. Per il web, 80-90% offre un eccellente bilanciamento.' }
      ]
    },
    es: {
      title: 'Editor de Fotos Online Gratuito: Edita Im\u00e1genes Directamente en tu Navegador',
      paragraphs: [
        'Editar fotos ya no requiere software costoso ni aplicaciones de escritorio complejas. Nuestro editor de fotos online gratuito funciona completamente en tu navegador, permiti\u00e9ndote ajustar brillo, contraste, saturaci\u00f3n y aplicar efectos creativos con solo unos clics. Sin instalaci\u00f3n, sin registro y sin subir im\u00e1genes a servidores externos -- tus fotos permanecen completamente privadas en tu dispositivo.',
        'La herramienta ofrece un conjunto completo de ajustes que cubren las necesidades de edici\u00f3n fotogr\u00e1fica m\u00e1s comunes. Usa el control de brillo para aclarar tomas subexpuestas u oscurecer las sobreexpuestas. El control de contraste ayuda a que tus im\u00e1genes destaquen aumentando la diferencia entre \u00e1reas claras y oscuras. Los ajustes de saturaci\u00f3n permiten crear im\u00e1genes vibrantes y coloridas o tonos sutiles y apagados.',
        'M\u00e1s all\u00e1 de los ajustes b\u00e1sicos, el editor incluye efectos de desenfoque para crear fondos suaves, conversi\u00f3n a escala de grises para fotograf\u00eda cl\u00e1sica en blanco y negro, tonos sepia para una est\u00e9tica vintage e inversi\u00f3n de colores para efectos art\u00edsticos. Tambi\u00e9n puedes rotar im\u00e1genes en incrementos de 90 grados y voltearlas horizontal o verticalmente.',
        'Cuando est\u00e9s satisfecho con tus ediciones, exporta tu imagen en formato JPEG, PNG o WebP con ajustes de calidad configurables. La vista de comparaci\u00f3n antes-despu\u00e9s te permite ver exactamente c\u00f3mo tus ediciones han transformado la imagen original. Ya sea que prepares fotos para redes sociales, un sitio web o uso personal, este editor proporciona todas las herramientas esenciales.'
      ],
      faq: [
        { q: '\u00bfMi foto se sube a alg\u00fan servidor?', a: 'No. Toda la edici\u00f3n ocurre localmente en tu navegador usando la API Canvas de HTML5. Tus fotos nunca salen de tu dispositivo, garantizando completa privacidad y seguridad.' },
        { q: '\u00bfQu\u00e9 formatos de imagen puedo editar y exportar?', a: 'Puedes subir im\u00e1genes JPEG, PNG, WebP, GIF y BMP para editar. Para exportar puedes elegir entre JPEG (mejor para fotos), PNG (sin p\u00e9rdida con soporte de transparencia) y WebP (formato moderno con excelente compresi\u00f3n).' },
        { q: '\u00bfPuedo deshacer mis cambios?', a: 'S\u00ed. Cada ajuste se rastrea en el historial. Haz clic en Deshacer para retroceder paso a paso. Tambi\u00e9n puedes usar Reiniciar todo para volver a la imagen original.' },
        { q: '\u00bfCu\u00e1l es el tama\u00f1o m\u00e1ximo de archivo que puedo editar?', a: 'El editor soporta im\u00e1genes de hasta 20 MB. Im\u00e1genes muy grandes pueden tardar un momento en procesarse, pero todo ocurre localmente.' },
        { q: '\u00bfC\u00f3mo afecta el control de calidad a mi imagen exportada?', a: 'El control de calidad determina el nivel de compresi\u00f3n del archivo exportado. Mayor calidad (90-100%) preserva m\u00e1s detalles pero crea archivos m\u00e1s grandes. Para web, 80-90% ofrece un excelente equilibrio.' }
      ]
    },
    fr: {
      title: '\u00c9diteur de Photos en Ligne Gratuit : Modifiez vos Images Directement dans le Navigateur',
      paragraphs: [
        'Modifier des photos ne n\u00e9cessite plus de logiciels co\u00fbteux ni d\'applications de bureau complexes. Notre \u00e9diteur de photos en ligne gratuit fonctionne enti\u00e8rement dans votre navigateur, vous permettant d\'ajuster la luminosit\u00e9, le contraste, la saturation et d\'appliquer des effets cr\u00e9atifs en quelques clics. Aucune installation, aucune inscription et aucun envoi d\'images vers des serveurs externes -- vos photos restent enti\u00e8rement priv\u00e9es sur votre appareil.',
        'L\'outil offre un ensemble complet d\'ajustements couvrant les besoins de retouche photo les plus courants. Utilisez le curseur de luminosit\u00e9 pour \u00e9claircir les prises de vue sous-expos\u00e9es ou assombrir celles surexpos\u00e9es. Le contr\u00f4le du contraste aide \u00e0 faire ressortir vos images en augmentant la diff\u00e9rence entre les zones claires et sombres. Les ajustements de saturation permettent de cr\u00e9er des images vibrantes et color\u00e9es ou des tons subtils et att\u00e9nu\u00e9s.',
        'Au-del\u00e0 des ajustements de base, l\'\u00e9diteur inclut des effets de flou pour cr\u00e9er des arri\u00e8re-plans doux, une conversion en niveaux de gris pour la photographie classique en noir et blanc, des tons s\u00e9pia pour une esth\u00e9tique vintage et une inversion des couleurs pour des effets artistiques. Vous pouvez \u00e9galement faire pivoter les images par incr\u00e9ments de 90 degr\u00e9s et les retourner horizontalement ou verticalement.',
        'Lorsque vous \u00eates satisfait de vos modifications, exportez votre image au format JPEG, PNG ou WebP avec des r\u00e9glages de qualit\u00e9 ajustables. La vue de comparaison avant-apr\u00e8s vous permet de voir exactement comment vos modifications ont transform\u00e9 l\'image originale. Que vous pr\u00e9pariez des photos pour les r\u00e9seaux sociaux, un site web ou un usage personnel, cet \u00e9diteur fournit tous les outils essentiels.'
      ],
      faq: [
        { q: 'Ma photo est-elle envoy\u00e9e \u00e0 un serveur ?', a: 'Non. Toute la modification se fait localement dans votre navigateur via l\'API Canvas HTML5. Vos photos ne quittent jamais votre appareil, garantissant une confidentialit\u00e9 et une s\u00e9curit\u00e9 totales.' },
        { q: 'Quels formats d\'image puis-je modifier et exporter ?', a: 'Vous pouvez t\u00e9l\u00e9charger des images JPEG, PNG, WebP, GIF et BMP pour les modifier. Pour l\'export, choisissez entre JPEG (meilleur pour les photos), PNG (sans perte avec transparence) et WebP (format moderne avec excellente compression).' },
        { q: 'Puis-je annuler mes modifications ?', a: 'Oui. Chaque ajustement est suivi dans l\'historique. Cliquez sur Annuler pour revenir en arri\u00e8re \u00e9tape par \u00e9tape. Vous pouvez aussi utiliser Tout r\u00e9initialiser pour revenir \u00e0 l\'image originale.' },
        { q: 'Quelle est la taille maximale de fichier que je peux modifier ?', a: 'L\'\u00e9diteur prend en charge les images jusqu\'\u00e0 20 Mo. Les tr\u00e8s grandes images peuvent n\u00e9cessiter un moment de traitement, mais tout se fait localement.' },
        { q: 'Comment le curseur de qualit\u00e9 affecte-t-il mon image export\u00e9e ?', a: 'Le curseur de qualit\u00e9 contr\u00f4le le niveau de compression du fichier export\u00e9. Une qualit\u00e9 plus \u00e9lev\u00e9e (90-100%) pr\u00e9serve plus de d\u00e9tails mais cr\u00e9e des fichiers plus volumineux. Pour le web, 80-90% offre un excellent \u00e9quilibre.' }
      ]
    },
    de: {
      title: 'Kostenloser Online-Fotoeditor: Bilder Direkt im Browser Bearbeiten',
      paragraphs: [
        'Fotos zu bearbeiten erfordert keine teure Software oder komplexe Desktop-Anwendungen mehr. Unser kostenloser Online-Fotoeditor l\u00e4uft vollst\u00e4ndig in Ihrem Browser und erm\u00f6glicht es Ihnen, Helligkeit, Kontrast, S\u00e4ttigung anzupassen und kreative Effekte mit wenigen Klicks anzuwenden. Keine Installation, keine Anmeldung und kein Upload auf externe Server -- Ihre Fotos bleiben vollst\u00e4ndig privat auf Ihrem Ger\u00e4t.',
        'Das Tool bietet einen umfassenden Satz von Anpassungen, die die h\u00e4ufigsten Fotobearbeitungsbed\u00fcrfnisse abdecken. Verwenden Sie den Helligkeitsregler, um unterbelichtete Aufnahmen aufzuhellen oder \u00fcberbelichtete abzudunkeln. Die Kontraststeuerung hilft, Ihre Bilder durch Erh\u00f6hung des Unterschieds zwischen hellen und dunklen Bereichen hervorzuheben. S\u00e4ttigungsanpassungen erm\u00f6glichen lebendige, farbenfrohe Bilder oder subtile, ged\u00e4mpfte T\u00f6ne.',
        '\u00dcber die grundlegenden Anpassungen hinaus enth\u00e4lt der Editor Unsch\u00e4rfeeffekte f\u00fcr weiche Hintergr\u00fcnde, Graustufenkonvertierung f\u00fcr klassische Schwarzwei\u00dffotografie, Sepiat\u00f6nung f\u00fcr eine Vintage-\u00c4sthetik und Farbumkehr f\u00fcr k\u00fcnstlerische Effekte. Sie k\u00f6nnen Bilder auch in 90-Grad-Schritten drehen und horizontal oder vertikal spiegeln.',
        'Wenn Sie mit Ihren Bearbeitungen zufrieden sind, exportieren Sie Ihr Bild im JPEG-, PNG- oder WebP-Format mit einstellbaren Qualit\u00e4tseinstellungen. Die Vorher-Nachher-Vergleichsansicht zeigt Ihnen genau, wie Ihre Bearbeitungen das Originalbild ver\u00e4ndert haben. Ob Sie Fotos f\u00fcr soziale Medien, eine Website oder den pers\u00f6nlichen Gebrauch vorbereiten -- dieser Fotoeditor bietet alle wesentlichen Werkzeuge.'
      ],
      faq: [
        { q: 'Wird mein Foto auf einen Server hochgeladen?', a: 'Nein. Die gesamte Bearbeitung erfolgt lokal in Ihrem Browser \u00fcber die HTML5 Canvas API. Ihre Fotos verlassen niemals Ihr Ger\u00e4t, was vollst\u00e4ndige Privatsph\u00e4re und Sicherheit gew\u00e4hrleistet.' },
        { q: 'Welche Bildformate kann ich bearbeiten und exportieren?', a: 'Sie k\u00f6nnen JPEG-, PNG-, WebP-, GIF- und BMP-Bilder zur Bearbeitung hochladen. F\u00fcr den Export w\u00e4hlen Sie zwischen JPEG (am besten f\u00fcr Fotos), PNG (verlustfrei mit Transparenzunterst\u00fctzung) und WebP (modernes Format mit hervorragender Kompression).' },
        { q: 'Kann ich meine \u00c4nderungen r\u00fcckg\u00e4ngig machen?', a: 'Ja. Jede Anpassung wird in der Historie verfolgt. Klicken Sie auf R\u00fcckg\u00e4ngig, um Schritt f\u00fcr Schritt zur\u00fcckzugehen. Sie k\u00f6nnen auch Alles zur\u00fccksetzen verwenden, um zum Originalbild zur\u00fcckzukehren.' },
        { q: 'Wie gro\u00df darf die Datei maximal sein?', a: 'Der Editor unterst\u00fctzt Bilder bis zu 20 MB. Sehr gro\u00dfe Bilder ben\u00f6tigen m\u00f6glicherweise einen Moment zur Verarbeitung, aber alles geschieht lokal.' },
        { q: 'Wie wirkt sich der Qualit\u00e4tsregler auf mein exportiertes Bild aus?', a: 'Der Qualit\u00e4tsregler steuert die Komprimierungsstufe der exportierten Datei. H\u00f6here Qualit\u00e4t (90-100%) bewahrt mehr Details, erzeugt aber gr\u00f6\u00dfere Dateien. F\u00fcr Webnutzung bieten 80-90% eine hervorragende Balance.' }
      ]
    },
    pt: {
      title: 'Editor de Fotos Online Gratuito: Edite Imagens Diretamente no Navegador',
      paragraphs: [
        'Editar fotos n\u00e3o requer mais softwares caros ou aplica\u00e7\u00f5es desktop complexas. Nosso editor de fotos online gratuito funciona inteiramente no navegador, permitindo ajustar brilho, contraste, satura\u00e7\u00e3o e aplicar efeitos criativos com apenas alguns cliques. Sem instala\u00e7\u00e3o, sem cadastro e sem envio de imagens para servidores externos -- suas fotos permanecem completamente privadas no seu dispositivo.',
        'A ferramenta oferece um conjunto completo de ajustes que cobrem as necessidades de edi\u00e7\u00e3o fotogr\u00e1fica mais comuns. Use o controle de brilho para clarear fotos subexpostas ou escurecer as superexpostas. O controle de contraste ajuda a destacar suas imagens aumentando a diferen\u00e7a entre \u00e1reas claras e escuras. Os ajustes de satura\u00e7\u00e3o permitem criar imagens vibrantes e coloridas ou tons sutis e suaves.',
        'Al\u00e9m dos ajustes b\u00e1sicos, o editor inclui efeitos de desfoque para criar fundos suaves, convers\u00e3o para escala de cinza para fotografia cl\u00e1ssica em preto e branco, tonalidade s\u00e9pia para uma est\u00e9tica vintage e invers\u00e3o de cores para efeitos art\u00edsticos. Voc\u00ea tamb\u00e9m pode girar imagens em incrementos de 90 graus e espelh\u00e1-las horizontal ou verticalmente.',
        'Quando estiver satisfeito com suas edi\u00e7\u00f5es, exporte sua imagem em formato JPEG, PNG ou WebP com configura\u00e7\u00f5es de qualidade ajust\u00e1veis. A vista de compara\u00e7\u00e3o antes-depois permite ver exatamente como suas edi\u00e7\u00f5es transformaram a imagem original. Seja preparando fotos para redes sociais, um site ou uso pessoal, este editor fornece todas as ferramentas essenciais.'
      ],
      faq: [
        { q: 'Minha foto \u00e9 enviada para algum servidor?', a: 'N\u00e3o. Toda a edi\u00e7\u00e3o acontece localmente no seu navegador usando a API Canvas do HTML5. Suas fotos nunca saem do seu dispositivo, garantindo completa privacidade e seguran\u00e7a.' },
        { q: 'Quais formatos de imagem posso editar e exportar?', a: 'Voc\u00ea pode enviar imagens JPEG, PNG, WebP, GIF e BMP para edi\u00e7\u00e3o. Para exporta\u00e7\u00e3o, escolha entre JPEG (melhor para fotos), PNG (sem perda com suporte a transpar\u00eancia) e WebP (formato moderno com excelente compress\u00e3o).' },
        { q: 'Posso desfazer minhas altera\u00e7\u00f5es?', a: 'Sim. Cada ajuste \u00e9 rastreado no hist\u00f3rico. Clique em Desfazer para voltar passo a passo. Voc\u00ea tamb\u00e9m pode usar Redefinir tudo para voltar \u00e0 imagem original.' },
        { q: 'Qual \u00e9 o tamanho m\u00e1ximo de arquivo que posso editar?', a: 'O editor suporta imagens de at\u00e9 20 MB. Imagens muito grandes podem levar um momento para processar, mas tudo acontece localmente.' },
        { q: 'Como o controle de qualidade afeta minha imagem exportada?', a: 'O controle de qualidade determina o n\u00edvel de compress\u00e3o do arquivo exportado. Qualidade mais alta (90-100%) preserva mais detalhes mas cria arquivos maiores. Para web, 80-90% oferece um excelente equil\u00edbrio.' }
      ]
    },
  };

  const seo = seoContent[lang] || seoContent.en;
  const faqItems = seo.faq;

  return (
    <ToolPageWrapper toolSlug="photo-editor" faqItems={faqItems}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT?.name || 'Photo Editor'}</h1>
        <p className="text-gray-600 mb-6">{toolT?.description || ''}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
          >
            <p className="text-gray-500">{t('dragDrop')}</p>
            <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP, GIF, BMP &middot; max 20 MB</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
          </div>

          {imgSrc && (
            <>
              {/* Dimensions */}
              <div className="text-sm text-gray-500 text-center">
                {t('dimensions')}: {imgWidth} &times; {imgHeight}px
              </div>

              {/* Preview canvas */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('preview')}</h3>
                <div className="bg-gray-50 rounded-lg p-3 flex justify-center">
                  <canvas ref={previewCanvasRef} className="max-w-full max-h-64 rounded" />
                </div>
              </div>

              {/* Before/After comparison */}
              <div>
                <button
                  onClick={() => setShowCompare(!showCompare)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium mb-2"
                >
                  {t('compareView')} {showCompare ? '\u25b2' : '\u25bc'}
                </button>
                {showCompare && originalSrc && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{t('original')}</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={originalSrc} alt="Original" className="w-full rounded-lg max-h-48 object-contain bg-gray-50" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{t('edited')}</p>
                      <canvas ref={(el) => {
                        if (el && canvasRef.current && canvasRef.current.width > 0) {
                          const maxW = 300;
                          const scale = Math.min(1, maxW / Math.max(canvasRef.current.width, 1));
                          el.width = Math.round(canvasRef.current.width * scale);
                          el.height = Math.round(canvasRef.current.height * scale);
                          const ctx = el.getContext('2d');
                          if (ctx) ctx.drawImage(canvasRef.current, 0, 0, el.width, el.height);
                        }
                      }} className="w-full rounded-lg max-h-48 object-contain bg-gray-50" />
                    </div>
                  </div>
                )}
              </div>

              {/* Adjustments */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('adjustments')}</h3>
                <div className="space-y-3">
                  {/* Brightness */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{t('brightness')}</span>
                      <span>{filters.brightness > 0 ? '+' : ''}{filters.brightness}</span>
                    </div>
                    <input type="range" min="-100" max="100" value={filters.brightness} onChange={(e) => updateFilter('brightness', parseInt(e.target.value))} className="w-full" />
                  </div>
                  {/* Contrast */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{t('contrast')}</span>
                      <span>{filters.contrast > 0 ? '+' : ''}{filters.contrast}</span>
                    </div>
                    <input type="range" min="-100" max="100" value={filters.contrast} onChange={(e) => updateFilter('contrast', parseInt(e.target.value))} className="w-full" />
                  </div>
                  {/* Saturation */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{t('saturation')}</span>
                      <span>{filters.saturation > 0 ? '+' : ''}{filters.saturation}</span>
                    </div>
                    <input type="range" min="-100" max="100" value={filters.saturation} onChange={(e) => updateFilter('saturation', parseInt(e.target.value))} className="w-full" />
                  </div>
                  {/* Blur */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{t('blur')}</span>
                      <span>{filters.blur}px</span>
                    </div>
                    <input type="range" min="0" max="20" value={filters.blur} onChange={(e) => updateFilter('blur', parseInt(e.target.value))} className="w-full" />
                  </div>
                </div>
              </div>

              {/* Effects toggles */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('effects')}</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => updateFilter('grayscale', !filters.grayscale)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filters.grayscale ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {t('grayscale')}
                  </button>
                  <button
                    onClick={() => updateFilter('sepia', !filters.sepia)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filters.sepia ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {t('sepia')}
                  </button>
                  <button
                    onClick={() => updateFilter('invert', !filters.invert)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filters.invert ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {t('invert')}
                  </button>
                </div>
              </div>

              {/* Transform buttons */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('transforms')}</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={rotateLeft}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                  >
                    &#x21b6; {t('rotateLeft')}
                  </button>
                  <button
                    onClick={rotateRight}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                  >
                    &#x21b7; {t('rotateRight')}
                  </button>
                  <button
                    onClick={toggleFlipH}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${transform.flipH ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    &#x2194; {t('flipH')}
                  </button>
                  <button
                    onClick={toggleFlipV}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${transform.flipV ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    &#x2195; {t('flipV')}
                  </button>
                </div>
              </div>

              {/* Export options */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('export')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">{t('format')}</label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="image/jpeg">JPEG</option>
                      <option value="image/png">PNG</option>
                      <option value="image/webp">WebP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">{t('quality')}: {quality}%</label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(parseInt(e.target.value))}
                      className="w-full mt-2"
                      disabled={format === 'image/png'}
                    />
                    {format === 'image/png' && (
                      <p className="text-xs text-gray-400 mt-1">PNG is always lossless</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={downloadImage}
                  className="flex-1 min-w-[140px] text-center bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {t('download')}
                </button>
                <button
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t('undo')} ({history.length})
                </button>
                <button
                  onClick={resetAll}
                  className="px-4 py-3 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors text-sm"
                >
                  {t('reset')}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Hidden full-size canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />

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
