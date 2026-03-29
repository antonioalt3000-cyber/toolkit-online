'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  upload: { en: 'Upload Image', it: 'Carica Immagine', es: 'Subir Imagen', fr: 'T\u00e9l\u00e9charger Image', de: 'Bild Hochladen', pt: 'Enviar Imagem' },
  dragDrop: { en: 'Drag & drop or click to upload', it: 'Trascina o clicca per caricare', es: 'Arrastra o haz clic para subir', fr: 'Glissez ou cliquez pour t\u00e9l\u00e9charger', de: 'Ziehen oder klicken zum Hochladen', pt: 'Arraste ou clique para enviar' },
  width: { en: 'Width (px)', it: 'Larghezza (px)', es: 'Ancho (px)', fr: 'Largeur (px)', de: 'Breite (px)', pt: 'Largura (px)' },
  height: { en: 'Height (px)', it: 'Altezza (px)', es: 'Alto (px)', fr: 'Hauteur (px)', de: 'H\u00f6he (px)', pt: 'Altura (px)' },
  lockAspect: { en: 'Lock Aspect Ratio', it: 'Blocca Proporzioni', es: 'Bloquear Proporci\u00f3n', fr: 'Verrouiller Proportions', de: 'Seitenverh\u00e4ltnis Sperren', pt: 'Bloquear Propor\u00e7\u00e3o' },
  presets: { en: 'Preset Sizes', it: 'Dimensioni Predefinite', es: 'Tama\u00f1os Predefinidos', fr: 'Tailles Pr\u00e9d\u00e9finies', de: 'Voreingestellte Gr\u00f6\u00dfen', pt: 'Tamanhos Predefinidos' },
  quality: { en: 'Quality', it: 'Qualit\u00e0', es: 'Calidad', fr: 'Qualit\u00e9', de: 'Qualit\u00e4t', pt: 'Qualidade' },
  format: { en: 'Output Format', it: 'Formato Output', es: 'Formato de Salida', fr: 'Format de Sortie', de: 'Ausgabeformat', pt: 'Formato de Sa\u00edda' },
  resize: { en: 'Resize Image', it: 'Ridimensiona Immagine', es: 'Redimensionar Imagen', fr: 'Redimensionner Image', de: 'Bild Skalieren', pt: 'Redimensionar Imagem' },
  download: { en: 'Download Resized Image', it: 'Scarica Immagine Ridimensionata', es: 'Descargar Imagen Redimensionada', fr: 'T\u00e9l\u00e9charger Image Redimensionn\u00e9e', de: 'Skaliertes Bild Herunterladen', pt: 'Baixar Imagem Redimensionada' },
  original: { en: 'Original', it: 'Originale', es: 'Original', fr: 'Original', de: 'Original', pt: 'Original' },
  resized: { en: 'Resized', it: 'Ridimensionata', es: 'Redimensionada', fr: 'Redimensionn\u00e9e', de: 'Skaliert', pt: 'Redimensionada' },
  dimensions: { en: 'Dimensions', it: 'Dimensioni', es: 'Dimensiones', fr: 'Dimensions', de: 'Abmessungen', pt: 'Dimens\u00f5es' },
  reset: { en: 'Reset', it: 'Reimposta', es: 'Reiniciar', fr: 'R\u00e9initialiser', de: 'Zur\u00fccksetzen', pt: 'Redefinir' },
  history: { en: 'Recent Resizes', it: 'Ridimensionamenti Recenti', es: 'Redimensionamientos Recientes', fr: 'Redimensionnements R\u00e9cents', de: 'Letzte Skalierungen', pt: 'Redimensionamentos Recentes' },
  noHistory: { en: 'No resizes yet', it: 'Nessun ridimensionamento ancora', es: 'Sin redimensionamientos a\u00fan', fr: 'Aucun redimensionnement encore', de: 'Noch keine Skalierungen', pt: 'Nenhum redimensionamento ainda' },
  errorUnsupported: { en: 'Unsupported file type. Please upload JPEG, PNG, WebP, GIF, BMP, or SVG.', it: 'Tipo di file non supportato. Carica JPEG, PNG, WebP, GIF, BMP o SVG.', es: 'Tipo de archivo no soportado. Sube JPEG, PNG, WebP, GIF, BMP o SVG.', fr: 'Type de fichier non pris en charge. T\u00e9l\u00e9chargez JPEG, PNG, WebP, GIF, BMP ou SVG.', de: 'Nicht unterst\u00fctzter Dateityp. Bitte JPEG, PNG, WebP, GIF, BMP oder SVG hochladen.', pt: 'Tipo de arquivo n\u00e3o suportado. Envie JPEG, PNG, WebP, GIF, BMP ou SVG.' },
  errorTooLarge: { en: 'File too large. Maximum size is 10 MB.', it: 'File troppo grande. La dimensione massima \u00e8 10 MB.', es: 'Archivo demasiado grande. El tama\u00f1o m\u00e1ximo es 10 MB.', fr: 'Fichier trop volumineux. La taille maximale est de 10 Mo.', de: 'Datei zu gro\u00df. Maximale Gr\u00f6\u00dfe ist 10 MB.', pt: 'Arquivo muito grande. O tamanho m\u00e1ximo \u00e9 10 MB.' },
  preview: { en: 'Preview', it: 'Anteprima', es: 'Vista previa', fr: 'Aper\u00e7u', de: 'Vorschau', pt: 'Pr\u00e9-visualiza\u00e7\u00e3o' },
};

interface HistoryItem {
  filename: string;
  originalWidth: number;
  originalHeight: number;
  newWidth: number;
  newHeight: number;
  format: string;
  timestamp: number;
}

interface Preset {
  name: string;
  width: number;
  height: number;
}

const PRESETS: Preset[] = [
  { name: 'Instagram Post', width: 1080, height: 1080 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'Facebook Cover', width: 820, height: 312 },
  { name: 'YouTube Thumbnail', width: 1280, height: 720 },
  { name: 'Twitter Header', width: 1500, height: 500 },
  { name: 'LinkedIn Banner', width: 1584, height: 396 },
  { name: 'Passport Photo', width: 600, height: 600 },
  { name: 'HD', width: 1920, height: 1080 },
  { name: '4K', width: 3840, height: 2160 },
];

const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/svg+xml'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const HISTORY_KEY = 'image-resizer-history';

export default function ImageResizer() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['image-resizer'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [newWidth, setNewWidth] = useState(0);
  const [newHeight, setNewHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [quality, setQuality] = useState(90);
  const [format, setFormat] = useState('image/jpeg');
  const [previewUrl, setPreviewUrl] = useState('');
  const [resizedUrl, setResizedUrl] = useState('');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const aspectRatioRef = useRef(1);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const saveHistory = useCallback((items: HistoryItem[]) => {
    setHistory(items);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, []);

  const validateFile = (file: File): boolean => {
    setError('');
    if (!SUPPORTED_TYPES.includes(file.type)) { setError(t('errorUnsupported')); return false; }
    if (file.size > MAX_FILE_SIZE) { setError(t('errorTooLarge')); return false; }
    return true;
  };

  const handleFile = (file: File) => {
    if (!validateFile(file)) return;
    setFileName(file.name);
    setResizedUrl('');
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setOriginalWidth(img.naturalWidth);
      setOriginalHeight(img.naturalHeight);
      setNewWidth(img.naturalWidth);
      setNewHeight(img.naturalHeight);
      aspectRatioRef.current = img.naturalWidth / img.naturalHeight;
    };
    img.src = url;
  };

  const handleWidthChange = (w: number) => {
    setNewWidth(w);
    if (lockAspect && w > 0) setNewHeight(Math.round(w / aspectRatioRef.current));
  };

  const handleHeightChange = (h: number) => {
    setNewHeight(h);
    if (lockAspect && h > 0) setNewWidth(Math.round(h * aspectRatioRef.current));
  };

  const applyPreset = (preset: Preset) => {
    setNewWidth(preset.width);
    setNewHeight(preset.height);
    setLockAspect(false);
  };

  const resizeImage = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || newWidth <= 0 || newHeight <= 0) return;
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, newWidth, newHeight);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          if (resizedUrl) URL.revokeObjectURL(resizedUrl);
          setResizedUrl(URL.createObjectURL(blob));
        }
      },
      format,
      quality / 100
    );
  }, [newWidth, newHeight, format, quality, resizedUrl]);

  const handleDownload = () => {
    if (!resizedUrl) return;
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
    const baseName = fileName ? fileName.replace(/\.[^.]+$/, '') : 'image';
    const link = document.createElement('a');
    link.href = resizedUrl;
    link.download = `${baseName}-${newWidth}x${newHeight}.${ext}`;
    link.click();
    const newEntry: HistoryItem = { filename: fileName || 'image', originalWidth, originalHeight, newWidth, newHeight, format, timestamp: Date.now() };
    saveHistory([newEntry, ...history].slice(0, 10));
  };

  const handleReset = () => {
    setOriginalWidth(0);
    setOriginalHeight(0);
    setNewWidth(0);
    setNewHeight(0);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resizedUrl) URL.revokeObjectURL(resizedUrl);
    setPreviewUrl('');
    setResizedUrl('');
    setFileName('');
    setError('');
    setQuality(90);
    setFormat('image/jpeg');
    setLockAspect(true);
    imgRef.current = null;
    if (fileRef.current) fileRef.current.value = '';
  };

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Image Resizer: Change Image Dimensions Instantly',
      paragraphs: [
        'Resizing images is one of the most common tasks in digital media workflows. Whether you are preparing photos for social media, creating thumbnails for a blog, or meeting specific dimension requirements for a platform, having a reliable image resizer is essential. Our free browser-based image resizer processes everything locally on your device, ensuring complete privacy since no data is uploaded to any server.',
        'The tool offers preset dimensions for the most popular platforms: Instagram Post (1080x1080), Instagram Story (1080x1920), Facebook Cover (820x312), YouTube Thumbnail (1280x720), Twitter Header (1500x500), LinkedIn Banner (1584x396), and standard resolutions like HD (1920x1080) and 4K (3840x2160). Simply select a preset or enter custom dimensions to resize any image instantly.',
        'The aspect ratio lock feature, enabled by default, ensures your images maintain their original proportions when you adjust width or height. This prevents distortion and stretching, which is critical for professional-looking results. When you need specific dimensions that differ from the original ratio, simply toggle off the lock to enter exact values.',
        'You can export resized images in JPEG, PNG, or WebP formats with an adjustable quality slider ranging from 10% to 100%. JPEG is ideal for photographs with excellent compression. PNG preserves transparency and sharp edges for graphics. WebP offers modern compression that is typically 25-30% smaller than JPEG at equivalent quality, making it perfect for web optimization.'
      ],
      faq: [
        { q: 'Is my image uploaded to a server when I resize it?', a: 'No. All resizing is performed locally in your browser using the HTML5 Canvas API. Your image never leaves your device, ensuring complete privacy and security.' },
        { q: 'Will resizing reduce image quality?', a: 'Enlarging an image beyond its original dimensions can reduce quality as the browser must interpolate new pixels. Downscaling generally preserves quality well. Use the quality slider to control the output file quality.' },
        { q: 'What is the aspect ratio lock and when should I use it?', a: 'The aspect ratio lock maintains the original width-to-height proportion of your image. Keep it on to prevent distortion. Turn it off when you need exact dimensions, such as platform-specific sizes that differ from your original ratio.' },
        { q: 'Which output format should I choose?', a: 'Use JPEG for photographs without transparency. Use PNG when you need transparency or lossless quality for graphics. Use WebP for the best compression-to-quality ratio, ideal for web use.' },
        { q: 'Can I resize images to 4K resolution?', a: 'Yes. You can resize to any dimension including 4K (3840x2160). However, upscaling a small image to 4K will result in quality loss. For best results, start with a high-resolution source image.' }
      ]
    },
    it: {
      title: 'Ridimensionatore di Immagini: Cambia le Dimensioni Istantaneamente',
      paragraphs: [
        'Il ridimensionamento delle immagini \u00e8 una delle operazioni pi\u00f9 comuni nei flussi di lavoro multimediali digitali. Che tu stia preparando foto per i social media, creando miniature per un blog o rispettando requisiti dimensionali specifici per una piattaforma, avere un ridimensionatore affidabile \u00e8 essenziale. Il nostro strumento gratuito basato su browser elabora tutto localmente sul tuo dispositivo, garantendo la completa privacy.',
        'Lo strumento offre dimensioni predefinite per le piattaforme pi\u00f9 popolari: Post Instagram (1080x1080), Storia Instagram (1080x1920), Copertina Facebook (820x312), Miniatura YouTube (1280x720), Intestazione Twitter (1500x500), Banner LinkedIn (1584x396) e risoluzioni standard come HD (1920x1080) e 4K (3840x2160). Seleziona un preset o inserisci dimensioni personalizzate.',
        'La funzione di blocco delle proporzioni, attiva per impostazione predefinita, assicura che le immagini mantengano le proporzioni originali quando modifichi larghezza o altezza. Questo previene distorsioni e allungamenti, fondamentale per risultati professionali. Quando servono dimensioni specifiche diverse dal rapporto originale, disattiva semplicemente il blocco.',
        'Puoi esportare le immagini ridimensionate in formato JPEG, PNG o WebP con un cursore di qualit\u00e0 regolabile dal 10% al 100%. JPEG \u00e8 ideale per fotografie con eccellente compressione. PNG preserva trasparenza e bordi netti per grafiche. WebP offre compressione moderna, tipicamente 25-30% pi\u00f9 piccola di JPEG a qualit\u00e0 equivalente.'
      ],
      faq: [
        { q: 'La mia immagine viene caricata su un server?', a: 'No. Tutto il ridimensionamento avviene localmente nel browser usando l\'API Canvas HTML5. La tua immagine non lascia mai il tuo dispositivo, garantendo completa privacy e sicurezza.' },
        { q: 'Il ridimensionamento riduce la qualit\u00e0 dell\'immagine?', a: 'Ingrandire un\'immagine oltre le dimensioni originali pu\u00f2 ridurre la qualit\u00e0. Il ridimensionamento verso il basso generalmente mantiene bene la qualit\u00e0. Usa il cursore per controllare la qualit\u00e0 del file di output.' },
        { q: 'Cos\'\u00e8 il blocco delle proporzioni e quando usarlo?', a: 'Il blocco delle proporzioni mantiene il rapporto larghezza-altezza originale. Tienilo attivo per evitare distorsioni. Disattivalo quando servono dimensioni esatte diverse dal rapporto originale.' },
        { q: 'Quale formato di output scegliere?', a: 'Usa JPEG per fotografie senza trasparenza. PNG quando serve trasparenza o qualit\u00e0 senza perdita. WebP per il miglior rapporto compressione-qualit\u00e0, ideale per il web.' },
        { q: 'Posso ridimensionare immagini in risoluzione 4K?', a: 'S\u00ec. Puoi ridimensionare a qualsiasi dimensione incluso 4K (3840x2160). Tuttavia, ingrandire una piccola immagine a 4K comporta perdita di qualit\u00e0. Per i migliori risultati, parti da un\'immagine sorgente ad alta risoluzione.' }
      ]
    },
    es: {
      title: 'Redimensionar Im\u00e1genes Online Gratis: Cambia Tama\u00f1o al Instante sin Perder Calidad',
      paragraphs: [
        '<h2 class="text-xl font-bold text-gray-900 mt-6 mb-3">\u00bfPor qu\u00e9 necesitas un redimensionador de im\u00e1genes online en 2026?</h2><p>Redimensionar im\u00e1genes es una de las tareas m\u00e1s frecuentes en cualquier flujo de trabajo digital. Ya sea que est\u00e9s preparando fotos para Instagram, creando miniaturas para tu blog en WordPress, optimizando banners para una campa\u00f1a de email marketing o cumpliendo los requisitos de dimensiones de una tienda online como Shopify o WooCommerce, contar con un redimensionador r\u00e1pido y fiable es imprescindible. Nuestra herramienta gratuita procesa todo directamente en tu navegador usando la API Canvas de HTML5, lo que significa que tus im\u00e1genes <strong>nunca salen de tu dispositivo</strong>. Esto la convierte en una soluci\u00f3n ideal para profesionales en Espa\u00f1a y Latinoam\u00e9rica que manejan contenido visual sensible o confidencial y necesitan cumplir con el RGPD europeo.</p>',
        '<h2 class="text-xl font-bold text-gray-900 mt-6 mb-3">Dimensiones predefinidas para redes sociales y plataformas</h2><p>La herramienta incluye presets optimizados para las plataformas m\u00e1s populares: <strong>Post de Instagram</strong> (1080\u00d71080), <strong>Historia/Reel de Instagram</strong> (1080\u00d71920), <strong>Portada de Facebook</strong> (820\u00d7312), <strong>Miniatura de YouTube</strong> (1280\u00d7720), <strong>Encabezado de Twitter/X</strong> (1500\u00d7500), <strong>Banner de LinkedIn</strong> (1584\u00d7396) y resoluciones est\u00e1ndar como HD (1920\u00d71080) y 4K (3840\u00d72160). Tambi\u00e9n puedes introducir dimensiones personalizadas exactas en p\u00edxeles. Estas medidas se actualizan seg\u00fan las especificaciones oficiales de cada plataforma en 2026, evit\u00e1ndote tener que buscar los tama\u00f1os correctos manualmente. Si trabajas con m\u00faltiples formatos a la vez, consulta tambi\u00e9n nuestro <a href="/es/tools/image-compressor" class="text-blue-600 hover:underline">compresor de im\u00e1genes</a> para reducir el peso del archivo despu\u00e9s de redimensionar.</p>',
        '<h3 class="text-lg font-semibold text-gray-800 mt-5 mb-2">Bloqueo de proporci\u00f3n y control de calidad</h3><p>La funci\u00f3n de <strong>bloqueo de proporci\u00f3n</strong> (aspect ratio lock), activada por defecto, asegura que tus im\u00e1genes mantengan su relaci\u00f3n ancho-alto original cuando ajustas una de las dos dimensiones. Esto previene la distorsi\u00f3n y el estiramiento, algo cr\u00edtico para resultados profesionales en dise\u00f1o gr\u00e1fico y fotograf\u00eda. Cuando necesites dimensiones espec\u00edficas que no coincidan con la proporci\u00f3n original \u2014 por ejemplo, adaptar una foto horizontal a un formato cuadrado para Instagram \u2014 simplemente desactiva el bloqueo. Adem\u00e1s, el control deslizante de calidad (10% a 100%) te permite encontrar el equilibrio perfecto entre tama\u00f1o de archivo y nitidez visual. Para calcular la proporci\u00f3n exacta de tus im\u00e1genes antes de redimensionar, utiliza nuestra <a href="/es/tools/aspect-ratio-calculator" class="text-blue-600 hover:underline">calculadora de proporci\u00f3n</a>.</p>',
        '<h2 class="text-xl font-bold text-gray-900 mt-6 mb-3">Formatos de exportaci\u00f3n: JPEG, PNG y WebP</h2><p>Puedes exportar tus im\u00e1genes redimensionadas en tres formatos profesionales. <strong>JPEG</strong> es ideal para fotograf\u00edas y contenido visual con muchos colores, ofreciendo excelente compresi\u00f3n con p\u00e9rdida controlada. <strong>PNG</strong> preserva la transparencia y los bordes n\u00edtidos, perfecto para logos, iconos, capturas de pantalla y gr\u00e1ficos con texto. <strong>WebP</strong>, desarrollado por Google, ofrece compresi\u00f3n moderna que produce archivos t\u00edpicamente un 25-35% m\u00e1s peque\u00f1os que JPEG a calidad visual equivalente, ideal para optimizar la velocidad de carga de tu p\u00e1gina web. Si tu proyecto requiere generar capturas de pantalla programm\u00e1ticamente o a gran escala, <a href="https://captureapi.dev" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">CaptureAPI</a> te permite automatizar la captura y redimensionamiento de im\u00e1genes v\u00eda API REST.</p>',
        '<h3 class="text-lg font-semibold text-gray-800 mt-5 mb-2">Casos de uso profesionales en Espa\u00f1a y Latinoam\u00e9rica</h3><p>Los <strong>community managers</strong> y social media managers usan esta herramienta a diario para adaptar creatividades a las dimensiones exactas de cada red social sin abrir Photoshop ni Canva. Los <strong>dise\u00f1adores web freelance</strong> la emplean para preparar im\u00e1genes hero, thumbnails y banners optimizados para Core Web Vitals (LCP). Los <strong>fot\u00f3grafos</strong> la utilizan para crear versiones reducidas de sus portfolios online manteniendo la calidad original. Los <strong>profesores y estudiantes</strong> de universidades espa\u00f1olas y latinoamericanas la aprovechan para preparar im\u00e1genes para presentaciones, informes acad\u00e9micos y trabajos de fin de grado. Los <strong>e-commerce managers</strong> de tiendas en Amazon, Mercado Libre y Etsy necesitan dimensiones exactas para sus listados de productos.</p>',
        '<h2 class="text-xl font-bold text-gray-900 mt-6 mb-3">Ventajas frente a otros redimensionadores online</h2><p>A diferencia de herramientas como Canva, Photopea o iLoveIMG, nuestro redimensionador no requiere registro, no a\u00f1ade marcas de agua y no tiene l\u00edmites de uso diario. Todo se procesa en el navegador \u2014 no en servidores remotos \u2014 lo que significa <strong>velocidad instant\u00e1nea</strong> independientemente de tu conexi\u00f3n a internet y <strong>privacidad total</strong> para im\u00e1genes confidenciales. Funciona en cualquier navegador moderno (Chrome, Firefox, Safari, Edge) y en cualquier dispositivo: ordenador de escritorio, port\u00e1til, tablet o m\u00f3vil. Al ser una aplicaci\u00f3n web progresiva (PWA), puedes a\u00f1adirla a tu pantalla de inicio y usarla incluso sin conexi\u00f3n. Para ediciones m\u00e1s avanzadas como recorte, filtros y ajustes de brillo, prueba nuestro <a href="/es/tools/photo-editor" class="text-blue-600 hover:underline">editor de fotos online</a>.</p>',
      ],
      faq: [
        { q: '\u00bfMis im\u00e1genes se suben a alg\u00fan servidor al redimensionar?', a: 'No, en absoluto. Todo el procesamiento se realiza localmente en tu navegador mediante la API Canvas de HTML5 y JavaScript. Tus im\u00e1genes nunca abandonan tu dispositivo, lo que garantiza privacidad y seguridad total. Esto es especialmente importante para profesionales que manejan contenido visual confidencial \u2014 contratos, documentos m\u00e9dicos, fotograf\u00edas de productos antes del lanzamiento \u2014 y necesitan cumplir con la normativa RGPD europea de protecci\u00f3n de datos.' },
        { q: '\u00bfRedimensionar una imagen reduce su calidad?', a: 'Depende de la operaci\u00f3n. Reducir el tama\u00f1o de una imagen (downscaling) generalmente mantiene una calidad excelente, ya que el navegador descarta p\u00edxeles sobrantes de forma inteligente. Agrandar una imagen (upscaling) m\u00e1s all\u00e1 de sus dimensiones originales puede producir borrosidad, ya que el software debe interpolar p\u00edxeles nuevos. Para minimizar la p\u00e9rdida de calidad al agrandar, usa el control de calidad al 100% y exporta en formato PNG. Si partes de una imagen de alta resoluci\u00f3n (4K o superior), tendr\u00e1s m\u00e1s margen para redimensionar sin p\u00e9rdida visible.' },
        { q: '\u00bfQu\u00e9 es el bloqueo de proporci\u00f3n (aspect ratio) y cu\u00e1ndo debo desactivarlo?', a: 'El bloqueo de proporci\u00f3n mantiene autom\u00e1ticamente la relaci\u00f3n entre el ancho y el alto de tu imagen. Si cambias el ancho, el alto se ajusta proporcionalmente, y viceversa. Mant\u00e9nlo activado siempre que quieras evitar distorsi\u00f3n \u2014 por ejemplo, al redimensionar fotos de retrato, paisajes o productos. Desact\u00edvalo cuando necesites dimensiones exactas no proporcionales, como adaptar una foto horizontal (16:9) a un formato cuadrado (1:1) para Instagram, o crear un banner alargado para LinkedIn.' },
        { q: '\u00bfQu\u00e9 formato de exportaci\u00f3n debo elegir: JPEG, PNG o WebP?', a: 'Usa <strong>JPEG</strong> para fotograf\u00edas y contenido visual rico en colores donde no necesites transparencia \u2014 es el formato m\u00e1s compatible y ofrece excelente compresi\u00f3n. Elige <strong>PNG</strong> cuando necesites transparencia (logos, iconos), bordes n\u00edtidos (capturas de pantalla, gr\u00e1ficos con texto) o calidad sin p\u00e9rdida. Opta por <strong>WebP</strong> si la imagen es para web y quieres la mejor relaci\u00f3n tama\u00f1o-calidad posible \u2014 WebP produce archivos un 25-35% m\u00e1s peque\u00f1os que JPEG a calidad visual equivalente, lo que mejora la velocidad de carga y el SEO de tu sitio.' },
        { q: '\u00bfPuedo redimensionar im\u00e1genes a resoluci\u00f3n 4K o superior?', a: 'S\u00ed. Puedes introducir cualquier dimensi\u00f3n personalizada, incluyendo 4K (3840\u00d72160), 5K (5120\u00d72880) o resoluciones a\u00fan mayores. Sin embargo, ten en cuenta que agrandar una imagen peque\u00f1a (por ejemplo, 800\u00d7600) a 4K producir\u00e1 borrosidad y artefactos visibles, ya que el navegador debe inventar p\u00edxeles que no exist\u00edan en la imagen original. Para obtener los mejores resultados al redimensionar a 4K, parte siempre de una imagen de alta resoluci\u00f3n original.' },
      ]
    },
    fr: {
      title: 'Redimensionneur d\'Images : Changez les Dimensions Instantan\u00e9ment',
      paragraphs: [
        'Redimensionner des images est l\'une des t\u00e2ches les plus courantes dans les flux de travail multim\u00e9dia num\u00e9riques. Que vous pr\u00e9pariez des photos pour les r\u00e9seaux sociaux, cr\u00e9iez des miniatures pour un blog ou respectiez des exigences dimensionnelles sp\u00e9cifiques, disposer d\'un redimensionneur fiable est essentiel. Notre outil gratuit bas\u00e9 sur navigateur traite tout localement sur votre appareil, garantissant une confidentialit\u00e9 totale.',
        'L\'outil propose des dimensions pr\u00e9d\u00e9finies pour les plateformes les plus populaires : Post Instagram (1080x1080), Story Instagram (1080x1920), Couverture Facebook (820x312), Miniature YouTube (1280x720), En-t\u00eate Twitter (1500x500), Banni\u00e8re LinkedIn (1584x396) et des r\u00e9solutions standard comme HD (1920x1080) et 4K (3840x2160).',
        'La fonction de verrouillage des proportions, activ\u00e9e par d\u00e9faut, garantit que vos images conservent leurs proportions originales lorsque vous ajustez la largeur ou la hauteur. Cela emp\u00eache la distorsion et l\'\u00e9tirement, essentiel pour des r\u00e9sultats professionnels. Lorsque vous avez besoin de dimensions sp\u00e9cifiques diff\u00e9rentes du ratio original, d\u00e9sactivez simplement le verrouillage.',
        'Vous pouvez exporter les images redimensionn\u00e9es en format JPEG, PNG ou WebP avec un curseur de qualit\u00e9 ajustable de 10% \u00e0 100%. JPEG est id\u00e9al pour les photographies avec une excellente compression. PNG pr\u00e9serve la transparence et les bords nets. WebP offre une compression moderne, typiquement 25-30% plus petite que JPEG \u00e0 qualit\u00e9 \u00e9quivalente.'
      ],
      faq: [
        { q: 'Mon image est-elle envoy\u00e9e \u00e0 un serveur ?', a: 'Non. Tout le redimensionnement se fait localement dans votre navigateur via l\'API Canvas HTML5. Votre image ne quitte jamais votre appareil, garantissant confidentialit\u00e9 et s\u00e9curit\u00e9 compl\u00e8tes.' },
        { q: 'Le redimensionnement r\u00e9duit-il la qualit\u00e9 de l\'image ?', a: 'Agrandir une image au-del\u00e0 de ses dimensions originales peut r\u00e9duire la qualit\u00e9. La r\u00e9duction conserve g\u00e9n\u00e9ralement bien la qualit\u00e9. Utilisez le curseur pour contr\u00f4ler la qualit\u00e9 du fichier de sortie.' },
        { q: 'Qu\'est-ce que le verrouillage des proportions ?', a: 'Le verrouillage des proportions maintient le rapport largeur-hauteur original. Gardez-le activ\u00e9 pour \u00e9viter la distorsion. D\u00e9sactivez-le pour des dimensions exactes diff\u00e9rentes du ratio original.' },
        { q: 'Quel format de sortie choisir ?', a: 'Utilisez JPEG pour les photos sans transparence. PNG quand vous avez besoin de transparence ou de qualit\u00e9 sans perte. WebP pour le meilleur rapport compression-qualit\u00e9, id\u00e9al pour le web.' },
        { q: 'Puis-je redimensionner des images en r\u00e9solution 4K ?', a: 'Oui. Vous pouvez redimensionner \u00e0 n\'importe quelle dimension y compris 4K (3840x2160). Cependant, agrandir une petite image en 4K entra\u00eenera une perte de qualit\u00e9.' }
      ]
    },
    de: {
      title: 'Bildgr\u00f6\u00dfe \u00c4ndern: Bildabmessungen Sofort Anpassen',
      paragraphs: [
        'Das \u00c4ndern der Bildgr\u00f6\u00dfe ist eine der h\u00e4ufigsten Aufgaben in digitalen Medien-Workflows. Ob Sie Fotos f\u00fcr soziale Medien vorbereiten, Thumbnails f\u00fcr einen Blog erstellen oder spezifische Dimensionsanforderungen einer Plattform erf\u00fcllen \u2014 ein zuverl\u00e4ssiger Bild-Skalierer ist unverzichtbar. Unser kostenloses browserbasiertes Tool verarbeitet alles lokal auf Ihrem Ger\u00e4t und gew\u00e4hrleistet vollst\u00e4ndige Privatsph\u00e4re.',
        'Das Tool bietet voreingestellte Dimensionen f\u00fcr die beliebtesten Plattformen: Instagram-Post (1080x1080), Instagram-Story (1080x1920), Facebook-Cover (820x312), YouTube-Thumbnail (1280x720), Twitter-Header (1500x500), LinkedIn-Banner (1584x396) und Standardaufl\u00f6sungen wie HD (1920x1080) und 4K (3840x2160).',
        'Die Seitenverh\u00e4ltnis-Sperre, standardm\u00e4\u00dfig aktiviert, stellt sicher, dass Ihre Bilder ihre urspr\u00fcnglichen Proportionen beibehalten wenn Sie Breite oder H\u00f6he anpassen. Dies verhindert Verzerrung und Streckung, was f\u00fcr professionelle Ergebnisse entscheidend ist. Wenn Sie spezifische Dimensionen ben\u00f6tigen, deaktivieren Sie einfach die Sperre.',
        'Sie k\u00f6nnen skalierte Bilder im JPEG-, PNG- oder WebP-Format mit einem einstellbaren Qualit\u00e4tsregler von 10% bis 100% exportieren. JPEG ist ideal f\u00fcr Fotografien mit hervorragender Kompression. PNG bewahrt Transparenz und scharfe Kanten. WebP bietet moderne Kompression, typischerweise 25-30% kleiner als JPEG bei gleichwertiger Qualit\u00e4t.'
      ],
      faq: [
        { q: 'Wird mein Bild auf einen Server hochgeladen?', a: 'Nein. Die gesamte Skalierung erfolgt lokal in Ihrem Browser \u00fcber die HTML5 Canvas API. Ihr Bild verl\u00e4sst niemals Ihr Ger\u00e4t und gew\u00e4hrleistet vollst\u00e4ndige Privatsph\u00e4re und Sicherheit.' },
        { q: 'Reduziert das Skalieren die Bildqualit\u00e4t?', a: 'Das Vergr\u00f6\u00dfern eines Bildes \u00fcber seine Originalabmessungen kann die Qualit\u00e4t reduzieren. Das Verkleinern erh\u00e4lt die Qualit\u00e4t generell gut. Verwenden Sie den Regler zur Steuerung der Ausgabequalit\u00e4t.' },
        { q: 'Was ist die Seitenverh\u00e4ltnis-Sperre?', a: 'Die Seitenverh\u00e4ltnis-Sperre beh\u00e4lt das originale Breite-zu-H\u00f6he-Verh\u00e4ltnis bei. Lassen Sie sie aktiviert, um Verzerrung zu vermeiden. Deaktivieren Sie sie f\u00fcr exakte Dimensionen, die vom Originalverh\u00e4ltnis abweichen.' },
        { q: 'Welches Ausgabeformat w\u00e4hlen?', a: 'Verwenden Sie JPEG f\u00fcr Fotos ohne Transparenz. PNG wenn Sie Transparenz oder verlustfreie Qualit\u00e4t ben\u00f6tigen. WebP f\u00fcr das beste Kompression-zu-Qualit\u00e4t-Verh\u00e4ltnis, ideal f\u00fcr Web.' },
        { q: 'Kann ich Bilder auf 4K-Aufl\u00f6sung skalieren?', a: 'Ja. Sie k\u00f6nnen auf jede Dimension skalieren, einschlie\u00dflich 4K (3840x2160). Das Hochskalieren eines kleinen Bildes auf 4K f\u00fchrt jedoch zu Qualit\u00e4tsverlust.' }
      ]
    },
    pt: {
      title: 'Redimensionador de Imagens: Altere as Dimens\u00f5es Instantaneamente',
      paragraphs: [
        'Redimensionar imagens \u00e9 uma das tarefas mais comuns em fluxos de trabalho de m\u00eddia digital. Seja preparando fotos para redes sociais, criando miniaturas para um blog ou atendendo requisitos de dimens\u00f5es espec\u00edficos de uma plataforma, ter um redimensionador confi\u00e1vel \u00e9 essencial. Nossa ferramenta gratuita baseada em navegador processa tudo localmente no seu dispositivo, garantindo total privacidade.',
        'A ferramenta oferece dimens\u00f5es predefinidas para as plataformas mais populares: Post do Instagram (1080x1080), Story do Instagram (1080x1920), Capa do Facebook (820x312), Miniatura do YouTube (1280x720), Cabe\u00e7alho do Twitter (1500x500), Banner do LinkedIn (1584x396) e resolu\u00e7\u00f5es padr\u00e3o como HD (1920x1080) e 4K (3840x2160).',
        'A fun\u00e7\u00e3o de bloqueio de propor\u00e7\u00e3o, ativada por padr\u00e3o, garante que suas imagens mantenham suas propor\u00e7\u00f5es originais ao ajustar largura ou altura. Isso previne distor\u00e7\u00e3o e esticamento, cr\u00edtico para resultados profissionais. Quando precisar de dimens\u00f5es espec\u00edficas diferentes da propor\u00e7\u00e3o original, simplesmente desative o bloqueio.',
        'Voc\u00ea pode exportar imagens redimensionadas em formato JPEG, PNG ou WebP com um controle de qualidade ajust\u00e1vel de 10% a 100%. JPEG \u00e9 ideal para fotografias com excelente compress\u00e3o. PNG preserva transpar\u00eancia e bordas n\u00edtidas. WebP oferece compress\u00e3o moderna, tipicamente 25-30% menor que JPEG em qualidade equivalente.'
      ],
      faq: [
        { q: 'Minha imagem \u00e9 enviada para algum servidor?', a: 'N\u00e3o. Todo o redimensionamento acontece localmente no seu navegador usando a API Canvas do HTML5. Sua imagem nunca sai do seu dispositivo, garantindo completa privacidade e seguran\u00e7a.' },
        { q: 'Redimensionar reduz a qualidade da imagem?', a: 'Ampliar uma imagem al\u00e9m de suas dimens\u00f5es originais pode reduzir a qualidade. Reduzir geralmente preserva bem a qualidade. Use o controle para ajustar a qualidade do arquivo de sa\u00edda.' },
        { q: 'O que \u00e9 o bloqueio de propor\u00e7\u00e3o?', a: 'O bloqueio de propor\u00e7\u00e3o mant\u00e9m a rela\u00e7\u00e3o largura-altura original. Mantenha ativado para evitar distor\u00e7\u00e3o. Desative quando precisar de dimens\u00f5es exatas diferentes da propor\u00e7\u00e3o original.' },
        { q: 'Qual formato de sa\u00edda escolher?', a: 'Use JPEG para fotografias sem transpar\u00eancia. PNG quando precisar de transpar\u00eancia ou qualidade sem perda. WebP para a melhor rela\u00e7\u00e3o compress\u00e3o-qualidade, ideal para web.' },
        { q: 'Posso redimensionar imagens para resolu\u00e7\u00e3o 4K?', a: 'Sim. Voc\u00ea pode redimensionar para qualquer dimens\u00e3o incluindo 4K (3840x2160). Por\u00e9m, ampliar uma imagem pequena para 4K resultar\u00e1 em perda de qualidade.' }
      ]
    },
  };

  const seo = seoContent[lang];
  const faqItems = seo.faq;

  return (
    <ToolPageWrapper toolSlug="image-resizer" faqItems={faqItems}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
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
            <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP, GIF, BMP, SVG &middot; max 10 MB</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
          </div>

          {previewUrl && (
            <>
              {/* Preview image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt={t('preview')} className="w-full rounded-lg max-h-64 object-contain" />

              {/* Original dimensions */}
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                <span className="font-medium">{t('original')} {t('dimensions')}:</span> {originalWidth} x {originalHeight} px
              </div>

              {/* Width and Height inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('width')}</label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={newWidth || ''}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('height')}</label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={newHeight || ''}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Lock Aspect Ratio */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lockAspect}
                  onChange={(e) => setLockAspect(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{t('lockAspect')}</span>
              </label>

              {/* Preset sizes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('presets')}</label>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors border ${
                        newWidth === preset.width && newHeight === preset.height
                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                          : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                    >
                      {preset.name} ({preset.width}x{preset.height})
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality slider and format */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('quality')}: {quality}%</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('format')}</label>
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
              </div>

              {/* New dimensions preview */}
              {newWidth > 0 && newHeight > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-medium">{t('resized')} {t('dimensions')}:</span>
                    <span className="text-blue-900 font-bold">{newWidth} x {newHeight} px</span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={resizeImage}
                  disabled={newWidth <= 0 || newHeight <= 0}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('resize')}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-3 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors text-sm"
                >
                  {t('reset')}
                </button>
              </div>

              {/* Download button */}
              {resizedUrl && (
                <button
                  onClick={handleDownload}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  {t('download')}
                </button>
              )}
            </>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />

        {/* Resize history */}
        {history.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('history')}</h3>
            <div className="space-y-2">
              {history.map((item) => (
                <div key={item.timestamp} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-4 py-2">
                  <span className="text-gray-700 truncate max-w-[180px]" title={item.filename}>{item.filename}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">{item.originalWidth}x{item.originalHeight}</span>
                    <span className="text-gray-400">&rarr;</span>
                    <span className="font-semibold text-blue-600">{item.newWidth}x{item.newHeight}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <div key={i} className="text-gray-700 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: p }} />)}
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
