'use client';
import { useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  upload: { en: 'Upload Image', it: 'Carica Immagine', es: 'Subir Imagen', fr: 'Télécharger Image', de: 'Bild Hochladen', pt: 'Enviar Imagem' },
  quality: { en: 'Quality', it: 'Qualità', es: 'Calidad', fr: 'Qualité', de: 'Qualität', pt: 'Qualidade' },
  download: { en: 'Download Compressed', it: 'Scarica Compressa', es: 'Descargar Comprimida', fr: 'Télécharger Compressée', de: 'Komprimiert Herunterladen', pt: 'Baixar Comprimida' },
  original: { en: 'Original', it: 'Originale', es: 'Original', fr: 'Original', de: 'Original', pt: 'Original' },
  compressed: { en: 'Compressed', it: 'Compressa', es: 'Comprimida', fr: 'Compressée', de: 'Komprimiert', pt: 'Comprimida' },
  size: { en: 'Size', it: 'Dimensione', es: 'Tamaño', fr: 'Taille', de: 'Größe', pt: 'Tamanho' },
  reduction: { en: 'Reduction', it: 'Riduzione', es: 'Reducción', fr: 'Réduction', de: 'Reduktion', pt: 'Redução' },
  dragDrop: { en: 'Drag & drop or click to upload', it: 'Trascina o clicca per caricare', es: 'Arrastra o haz clic para subir', fr: 'Glissez ou cliquez pour télécharger', de: 'Ziehen oder klicken zum Hochladen', pt: 'Arraste ou clique para enviar' },
  format: { en: 'Output Format', it: 'Formato Output', es: 'Formato de Salida', fr: 'Format de Sortie', de: 'Ausgabeformat', pt: 'Formato de Saída' },
  copyStats: { en: 'Copy Stats', it: 'Copia Statistiche', es: 'Copiar Estadísticas', fr: 'Copier Statistiques', de: 'Statistiken Kopieren', pt: 'Copiar Estatísticas' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  reset: { en: 'Reset', it: 'Reimposta', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  errorUnsupported: { en: 'Unsupported file type. Please upload JPEG, PNG, WebP, GIF, BMP, or SVG.', it: 'Tipo di file non supportato. Carica JPEG, PNG, WebP, GIF, BMP o SVG.', es: 'Tipo de archivo no soportado. Sube JPEG, PNG, WebP, GIF, BMP o SVG.', fr: 'Type de fichier non pris en charge. Téléchargez JPEG, PNG, WebP, GIF, BMP ou SVG.', de: 'Nicht unterstützter Dateityp. Bitte JPEG, PNG, WebP, GIF, BMP oder SVG hochladen.', pt: 'Tipo de arquivo não suportado. Envie JPEG, PNG, WebP, GIF, BMP ou SVG.' },
  errorTooLarge: { en: 'File too large. Maximum size is 10 MB.', it: 'File troppo grande. La dimensione massima è 10 MB.', es: 'Archivo demasiado grande. El tamaño máximo es 10 MB.', fr: 'Fichier trop volumineux. La taille maximale est de 10 Mo.', de: 'Datei zu groß. Maximale Größe ist 10 MB.', pt: 'Arquivo muito grande. O tamanho máximo é 10 MB.' },
  history: { en: 'Recent Compressions', it: 'Compressioni Recenti', es: 'Compresiones Recientes', fr: 'Compressions Récentes', de: 'Letzte Kompressionen', pt: 'Compressões Recentes' },
  savings: { en: 'Savings', it: 'Risparmio', es: 'Ahorro', fr: 'Économie', de: 'Ersparnis', pt: 'Economia' },
  beforeAfter: { en: 'Before / After', it: 'Prima / Dopo', es: 'Antes / Después', fr: 'Avant / Après', de: 'Vorher / Nachher', pt: 'Antes / Depois' },
  noHistory: { en: 'No compressions yet', it: 'Nessuna compressione ancora', es: 'Sin compresiones aún', fr: 'Aucune compression encore', de: 'Noch keine Kompressionen', pt: 'Nenhuma compressão ainda' },
};

interface HistoryItem {
  filename: string;
  originalSize: number;
  compressedSize: number;
  reduction: number;
  format: string;
  timestamp: number;
}

const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/svg+xml'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function ImageCompressor() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['image-compressor'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [quality, setQuality] = useState(70);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressedUrl, setCompressedUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [format, setFormat] = useState('image/jpeg');
  const [error, setError] = useState('');
  const [copiedStats, setCopiedStats] = useState(false);
  const [fileName, setFileName] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const compress = useCallback((img: HTMLImageElement, q: number, fmt: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCompressedSize(blob.size);
          const url = URL.createObjectURL(blob);
          setCompressedUrl(url);
        }
      },
      fmt,
      q / 100
    );
  }, []);

  const validateFile = (file: File): boolean => {
    setError('');
    if (!SUPPORTED_TYPES.includes(file.type)) {
      setError(t('errorUnsupported'));
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(t('errorTooLarge'));
      return false;
    }
    return true;
  };

  const handleFile = (file: File) => {
    if (!validateFile(file)) return;
    setFileName(file.name);
    setOriginalSize(file.size);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      compress(img, quality, format);
    };
    img.src = url;
  };

  const handleQualityChange = (q: number) => {
    setQuality(q);
    if (imgRef.current) compress(imgRef.current, q, format);
  };

  const handleFormatChange = (fmt: string) => {
    setFormat(fmt);
    if (imgRef.current) compress(imgRef.current, quality, fmt);
  };

  const handleReset = () => {
    // Save to history before resetting if we have a result
    if (originalSize > 0 && compressedSize > 0) {
      const newEntry: HistoryItem = {
        filename: fileName || 'image',
        originalSize,
        compressedSize,
        reduction,
        format,
        timestamp: Date.now(),
      };
      setHistory(prev => [newEntry, ...prev].slice(0, 5));
    }
    setOriginalSize(0);
    setCompressedSize(0);
    setCompressedUrl('');
    setPreviewUrl('');
    setFileName('');
    setError('');
    setQuality(70);
    setFormat('image/jpeg');
    imgRef.current = null;
    if (fileRef.current) fileRef.current.value = '';
  };

  const reduction = originalSize > 0 ? Math.round((1 - compressedSize / originalSize) * 100) : 0;

  const copyStats = () => {
    const stats = `${fileName || 'image'}: ${formatBytes(originalSize)} -> ${formatBytes(compressedSize)} (${reduction}% ${t('reduction').toLowerCase()})`;
    navigator.clipboard.writeText(stats).then(() => {
      setCopiedStats(true);
      setTimeout(() => setCopiedStats(false), 2000);
    });
  };

  const addToHistory = () => {
    if (originalSize > 0 && compressedSize > 0) {
      const newEntry: HistoryItem = {
        filename: fileName || 'image',
        originalSize,
        compressedSize,
        reduction,
        format,
        timestamp: Date.now(),
      };
      setHistory(prev => [newEntry, ...prev].slice(0, 5));
    }
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Image Compressor: Reduce File Size Without Losing Quality',
      paragraphs: [
        'Large image files slow down websites, consume storage space, and take longer to upload or share. Image compression reduces the file size by removing redundant data while preserving visual quality. Our browser-based image compressor processes your images entirely on your device — nothing is uploaded to any server, ensuring complete privacy.',
        'The tool supports three output formats: JPEG, WebP, and PNG. JPEG is the most widely supported format and offers excellent compression for photographs. WebP, developed by Google, typically achieves 25-35% smaller file sizes than JPEG at equivalent quality, making it ideal for web use. PNG is lossless and best for graphics with transparency or sharp edges.',
        'The quality slider lets you find the perfect balance between file size and visual fidelity. At 70-80% quality, most photographs look indistinguishable from the original while being significantly smaller. Below 50%, compression artifacts become noticeable. The real-time preview shows the original size, compressed size, and percentage reduction so you can make informed decisions.',
        'This tool is especially valuable for website owners looking to improve page load speed (a key Google ranking factor), email marketers who need to stay under attachment size limits, and social media managers preparing image assets. Simply drag and drop your image, adjust the quality, choose your format, and download the optimized file.'
      ],
      faq: [
        { q: 'Is my image uploaded to a server when I use this tool?', a: 'No. All compression happens locally in your browser using the HTML5 Canvas API. Your image never leaves your device, making this tool completely private and secure.' },
        { q: 'Which format should I choose: JPEG, WebP, or PNG?', a: 'Use JPEG for photographs and images without transparency — it offers the best compression for photos. Use WebP for web-optimized images (25-35% smaller than JPEG). Use PNG only when you need transparency or lossless quality for graphics and logos.' },
        { q: 'What quality setting should I use for website images?', a: 'For most website images, 70-80% quality provides an excellent balance between visual quality and file size. You typically get 60-80% file size reduction with minimal visible difference. Below 50% you may notice artifacts.' },
        { q: 'Can I compress multiple images at once?', a: 'This tool processes one image at a time to give you full control over quality settings for each image. Upload a new image after downloading the compressed version of the previous one.' },
        { q: 'Why is my PNG file larger after compression?', a: 'PNG is a lossless format, so the quality slider has limited effect. If the original was already a PNG, the compressed version may be the same size or even slightly larger. For significant size reduction from PNG, switch to JPEG or WebP format.' }
      ]
    },
    it: {
      title: 'Compressore di Immagini: Riduci le Dimensioni del File Senza Perdere Qualità',
      paragraphs: [
        'File immagine grandi rallentano i siti web, consumano spazio di archiviazione e richiedono più tempo per essere caricati o condivisi. La compressione delle immagini riduce le dimensioni del file rimuovendo dati ridondanti mantenendo la qualità visiva. Il nostro compressore basato su browser elabora le immagini interamente sul tuo dispositivo — nulla viene caricato su alcun server.',
        'Lo strumento supporta tre formati di output: JPEG, WebP e PNG. JPEG è il formato più supportato e offre eccellente compressione per fotografie. WebP, sviluppato da Google, raggiunge tipicamente dimensioni 25-35% inferiori rispetto a JPEG a qualità equivalente. PNG è senza perdita ed è ideale per grafiche con trasparenza.',
        'Il cursore della qualità permette di trovare il bilanciamento perfetto tra dimensione del file e fedeltà visiva. Al 70-80% di qualità, la maggior parte delle fotografie è indistinguibile dall\'originale. Sotto il 50%, gli artefatti di compressione diventano visibili. L\'anteprima in tempo reale mostra dimensione originale, compressa e percentuale di riduzione.',
        'Questo strumento è particolarmente utile per proprietari di siti web che vogliono migliorare la velocità di caricamento delle pagine (un fattore di ranking Google), email marketer e social media manager. Trascina l\'immagine, regola la qualità, scegli il formato e scarica il file ottimizzato.'
      ],
      faq: [
        { q: 'La mia immagine viene caricata su un server?', a: 'No. Tutta la compressione avviene localmente nel browser usando l\'API Canvas HTML5. La tua immagine non lascia mai il tuo dispositivo, rendendo lo strumento completamente privato e sicuro.' },
        { q: 'Quale formato scegliere: JPEG, WebP o PNG?', a: 'Usa JPEG per fotografie senza trasparenza — offre la migliore compressione. Usa WebP per immagini ottimizzate per il web (25-35% più piccole di JPEG). Usa PNG solo per trasparenza o qualità senza perdita per grafiche e loghi.' },
        { q: 'Quale impostazione di qualità usare per le immagini del sito web?', a: 'Per la maggior parte delle immagini web, 70-80% offre un eccellente bilanciamento. Si ottiene tipicamente una riduzione del 60-80% con differenze visive minime.' },
        { q: 'Posso comprimere più immagini contemporaneamente?', a: 'Questo strumento elabora un\'immagine alla volta per darti pieno controllo sulle impostazioni di qualità per ciascuna immagine.' },
        { q: 'Perché il mio file PNG è più grande dopo la compressione?', a: 'PNG è un formato senza perdita, quindi il cursore della qualità ha effetto limitato. Per una riduzione significativa da PNG, passa al formato JPEG o WebP.' }
      ]
    },
    es: {
      title: 'Compresor de Imágenes: Reduce el Tamaño del Archivo Sin Perder Calidad',
      paragraphs: [
        'Los archivos de imagen grandes ralentizan los sitios web, consumen espacio de almacenamiento y tardan más en subirse o compartirse. La compresión de imágenes reduce el tamaño del archivo eliminando datos redundantes mientras preserva la calidad visual. Nuestro compresor basado en navegador procesa tus imágenes completamente en tu dispositivo — nada se sube a ningún servidor.',
        'La herramienta soporta tres formatos: JPEG, WebP y PNG. JPEG es el formato más soportado y ofrece excelente compresión para fotografías. WebP logra típicamente tamaños 25-35% menores que JPEG. PNG es sin pérdida e ideal para gráficos con transparencia.',
        'El control de calidad permite encontrar el equilibrio perfecto entre tamaño y fidelidad visual. Al 70-80%, la mayoría de las fotografías son indistinguibles del original. La vista previa en tiempo real muestra tamaño original, comprimido y porcentaje de reducción.',
        'Esta herramienta es especialmente valiosa para propietarios de sitios web que buscan mejorar la velocidad de carga (factor clave de ranking en Google), marketers de email y gestores de redes sociales. Arrastra tu imagen, ajusta la calidad, elige el formato y descarga el archivo optimizado.'
      ],
      faq: [
        { q: '¿Mi imagen se sube a algún servidor?', a: 'No. Toda la compresión ocurre localmente en tu navegador usando la API Canvas de HTML5. Tu imagen nunca sale de tu dispositivo.' },
        { q: '¿Qué formato elegir: JPEG, WebP o PNG?', a: 'Usa JPEG para fotografías sin transparencia. Usa WebP para imágenes optimizadas para web (25-35% más pequeñas que JPEG). Usa PNG solo para transparencia o calidad sin pérdida.' },
        { q: '¿Qué ajuste de calidad usar para imágenes web?', a: 'Para la mayoría de imágenes web, 70-80% ofrece un excelente equilibrio. Típicamente se obtiene una reducción del 60-80% con diferencias visuales mínimas.' },
        { q: '¿Puedo comprimir varias imágenes a la vez?', a: 'Esta herramienta procesa una imagen a la vez para darte control total sobre los ajustes de calidad de cada imagen.' },
        { q: '¿Por qué mi archivo PNG es más grande después de la compresión?', a: 'PNG es un formato sin pérdida, por lo que el control de calidad tiene efecto limitado. Para una reducción significativa desde PNG, cambia a formato JPEG o WebP.' }
      ]
    },
    fr: {
      title: 'Compresseur d\'Images : Réduisez la Taille du Fichier Sans Perdre en Qualité',
      paragraphs: [
        'Les fichiers image volumineux ralentissent les sites web, consomment de l\'espace de stockage et prennent plus de temps à télécharger. La compression d\'image réduit la taille du fichier en supprimant les données redondantes tout en préservant la qualité visuelle. Notre compresseur basé sur navigateur traite vos images entièrement sur votre appareil — rien n\'est envoyé à un serveur.',
        'L\'outil supporte trois formats : JPEG, WebP et PNG. JPEG est le format le plus répandu avec une excellente compression pour les photos. WebP atteint typiquement des tailles 25-35% inférieures à JPEG. PNG est sans perte et idéal pour les graphiques avec transparence.',
        'Le curseur de qualité permet de trouver l\'équilibre parfait entre taille et fidélité visuelle. À 70-80%, la plupart des photos sont indiscernables de l\'original. L\'aperçu en temps réel montre la taille originale, compressée et le pourcentage de réduction.',
        'Cet outil est particulièrement précieux pour les propriétaires de sites web cherchant à améliorer la vitesse de chargement (facteur clé de classement Google), les marketeurs par email et les gestionnaires de réseaux sociaux. Glissez votre image, ajustez la qualité, choisissez le format et téléchargez le fichier optimisé.'
      ],
      faq: [
        { q: 'Mon image est-elle envoyée à un serveur ?', a: 'Non. Toute la compression se fait localement dans votre navigateur via l\'API Canvas HTML5. Votre image ne quitte jamais votre appareil.' },
        { q: 'Quel format choisir : JPEG, WebP ou PNG ?', a: 'Utilisez JPEG pour les photos sans transparence. WebP pour les images web (25-35% plus petit que JPEG). PNG uniquement pour la transparence ou la qualité sans perte.' },
        { q: 'Quel réglage de qualité utiliser pour les images web ?', a: 'Pour la plupart des images web, 70-80% offre un excellent équilibre. On obtient typiquement 60-80% de réduction avec des différences visuelles minimales.' },
        { q: 'Puis-je compresser plusieurs images à la fois ?', a: 'Cet outil traite une image à la fois pour vous donner un contrôle total sur les réglages de qualité de chaque image.' },
        { q: 'Pourquoi mon fichier PNG est-il plus gros après compression ?', a: 'PNG est un format sans perte, donc le curseur de qualité a un effet limité. Pour une réduction significative depuis PNG, passez au format JPEG ou WebP.' }
      ]
    },
    de: {
      title: 'Bildkompressor: Dateigröße Reduzieren Ohne Qualitätsverlust',
      paragraphs: [
        'Große Bilddateien verlangsamen Websites, verbrauchen Speicherplatz und brauchen länger zum Hochladen. Bildkompression reduziert die Dateigröße durch Entfernen redundanter Daten bei Beibehaltung der visuellen Qualität. Unser browserbasierter Kompressor verarbeitet Ihre Bilder vollständig auf Ihrem Gerät — nichts wird auf einen Server hochgeladen.',
        'Das Tool unterstützt drei Ausgabeformate: JPEG, WebP und PNG. JPEG ist das am weitesten verbreitete Format mit hervorragender Kompression für Fotos. WebP erreicht typischerweise 25-35% kleinere Dateien als JPEG. PNG ist verlustfrei und ideal für Grafiken mit Transparenz.',
        'Der Qualitätsregler ermöglicht die perfekte Balance zwischen Dateigröße und visueller Treue. Bei 70-80% Qualität sind die meisten Fotos vom Original nicht zu unterscheiden. Die Echtzeitvorschau zeigt Originalgröße, komprimierte Größe und prozentuale Reduktion.',
        'Dieses Tool ist besonders wertvoll für Website-Betreiber (Ladegeschwindigkeit ist ein wichtiger Google-Ranking-Faktor), E-Mail-Marketer und Social-Media-Manager. Ziehen Sie Ihr Bild hinein, passen Sie die Qualität an, wählen Sie das Format und laden Sie die optimierte Datei herunter.'
      ],
      faq: [
        { q: 'Wird mein Bild auf einen Server hochgeladen?', a: 'Nein. Die gesamte Kompression erfolgt lokal in Ihrem Browser über die HTML5 Canvas API. Ihr Bild verlässt niemals Ihr Gerät.' },
        { q: 'Welches Format wählen: JPEG, WebP oder PNG?', a: 'Verwenden Sie JPEG für Fotos ohne Transparenz. WebP für web-optimierte Bilder (25-35% kleiner als JPEG). PNG nur für Transparenz oder verlustfreie Qualität.' },
        { q: 'Welche Qualitätseinstellung für Website-Bilder?', a: 'Für die meisten Website-Bilder bietet 70-80% eine hervorragende Balance. Man erreicht typischerweise 60-80% Größenreduktion bei minimalen sichtbaren Unterschieden.' },
        { q: 'Kann ich mehrere Bilder gleichzeitig komprimieren?', a: 'Dieses Tool verarbeitet ein Bild nach dem anderen, um Ihnen volle Kontrolle über die Qualitätseinstellungen jedes Bildes zu geben.' },
        { q: 'Warum ist meine PNG-Datei nach der Kompression größer?', a: 'PNG ist ein verlustfreies Format, daher hat der Qualitätsregler begrenzten Einfluss. Für signifikante Größenreduktion von PNG wechseln Sie zu JPEG oder WebP.' }
      ]
    },
    pt: {
      title: 'Compressor de Imagens: Reduza o Tamanho do Arquivo Sem Perder Qualidade',
      paragraphs: [
        'Arquivos de imagem grandes desaceleram sites, consomem espaço de armazenamento e demoram mais para enviar ou compartilhar. A compressão de imagem reduz o tamanho do arquivo removendo dados redundantes enquanto preserva a qualidade visual. Nosso compressor baseado em navegador processa suas imagens inteiramente no seu dispositivo — nada é enviado a nenhum servidor.',
        'A ferramenta suporta três formatos: JPEG, WebP e PNG. JPEG é o formato mais suportado com excelente compressão para fotografias. WebP alcança tipicamente tamanhos 25-35% menores que JPEG. PNG é sem perda e ideal para gráficos com transparência.',
        'O controle de qualidade permite encontrar o equilíbrio perfeito entre tamanho e fidelidade visual. Em 70-80%, a maioria das fotografias é indistinguível do original. A visualização em tempo real mostra tamanho original, comprimido e porcentagem de redução.',
        'Esta ferramenta é especialmente valiosa para proprietários de sites que buscam melhorar a velocidade de carregamento (fator chave de ranking do Google), profissionais de email marketing e gerentes de mídias sociais. Arraste sua imagem, ajuste a qualidade, escolha o formato e baixe o arquivo otimizado.'
      ],
      faq: [
        { q: 'Minha imagem é enviada para algum servidor?', a: 'Não. Toda a compressão acontece localmente no seu navegador usando a API Canvas do HTML5. Sua imagem nunca sai do seu dispositivo.' },
        { q: 'Qual formato escolher: JPEG, WebP ou PNG?', a: 'Use JPEG para fotografias sem transparência. WebP para imagens otimizadas para web (25-35% menores que JPEG). PNG apenas para transparência ou qualidade sem perda.' },
        { q: 'Qual configuração de qualidade usar para imagens web?', a: 'Para a maioria das imagens web, 70-80% oferece um excelente equilíbrio. Tipicamente se obtém 60-80% de redução com diferenças visuais mínimas.' },
        { q: 'Posso comprimir várias imagens de uma vez?', a: 'Esta ferramenta processa uma imagem por vez para dar controle total sobre as configurações de qualidade de cada imagem.' },
        { q: 'Por que meu arquivo PNG ficou maior após a compressão?', a: 'PNG é um formato sem perda, então o controle de qualidade tem efeito limitado. Para redução significativa de PNG, mude para formato JPEG ou WebP.' }
      ]
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="image-compressor" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
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
            <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP, GIF, BMP, SVG &middot; max 10 MB</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
          </div>

          {previewUrl && (
            <>
              {/* Controls row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('quality')}: {quality}%</label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={quality}
                    onChange={(e) => handleQualityChange(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('format')}</label>
                  <select
                    value={format}
                    onChange={(e) => handleFormatChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="image/jpeg">JPEG</option>
                    <option value="image/webp">WebP</option>
                    <option value="image/png">PNG</option>
                  </select>
                </div>
              </div>

              {/* Before / After comparison cards */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">{t('beforeAfter')}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-xs text-red-500 font-medium uppercase tracking-wide">{t('original')}</p>
                    <p className="text-2xl font-bold text-red-700 mt-1">{formatBytes(originalSize)}</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-xs text-green-500 font-medium uppercase tracking-wide">{t('compressed')}</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">{formatBytes(compressedSize)}</p>
                  </div>
                </div>
              </div>

              {/* Savings progress bar */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{t('savings')}</span>
                  <span className="text-sm font-bold text-blue-600">{reduction}% {t('reduction').toLowerCase()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.max(0, Math.min(100, reduction))}%`,
                      backgroundColor: reduction > 50 ? '#16a34a' : reduction > 25 ? '#2563eb' : '#f59e0b',
                    }}
                  />
                </div>
              </div>

              {/* Preview image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Preview" className="w-full rounded-lg max-h-64 object-contain" />

              {/* Action buttons */}
              <div className="flex gap-3">
                {compressedUrl && (
                  <a
                    href={compressedUrl}
                    download={`compressed.${format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png'}`}
                    onClick={addToHistory}
                    className="flex-1 text-center bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    {t('download')}
                  </a>
                )}
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
        </div>
        <canvas ref={canvasRef} className="hidden" />

        {/* Compression history */}
        {history.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('history')}</h3>
            <div className="space-y-2">
              {history.map((item, i) => (
                <div key={item.timestamp} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-4 py-2">
                  <span className="text-gray-700 truncate max-w-[180px]" title={item.filename}>{item.filename}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">{formatBytes(item.originalSize)} &rarr; {formatBytes(item.compressedSize)}</span>
                    <span className={`font-semibold ${item.reduction > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {item.reduction > 0 ? '-' : '+'}{Math.abs(item.reduction)}%
                    </span>
                  </div>
                </div>
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
