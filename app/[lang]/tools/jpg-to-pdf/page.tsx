'use client';
import { useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  dragDrop: { en: 'Drag & drop images or click to upload', it: 'Trascina immagini o clicca per caricare', es: 'Arrastra imágenes o haz clic para subir', fr: 'Glissez des images ou cliquez pour télécharger', de: 'Bilder hierher ziehen oder klicken zum Hochladen', pt: 'Arraste imagens ou clique para enviar' },
  generate: { en: 'Generate PDF', it: 'Genera PDF', es: 'Generar PDF', fr: 'Générer PDF', de: 'PDF Erstellen', pt: 'Gerar PDF' },
  download: { en: 'Download PDF', it: 'Scarica PDF', es: 'Descargar PDF', fr: 'Télécharger PDF', de: 'PDF Herunterladen', pt: 'Baixar PDF' },
  reset: { en: 'Reset', it: 'Reimposta', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  pageSize: { en: 'Page Size', it: 'Dimensione Pagina', es: 'Tamaño de Página', fr: 'Taille de Page', de: 'Seitengröße', pt: 'Tamanho da Página' },
  orientation: { en: 'Orientation', it: 'Orientamento', es: 'Orientación', fr: 'Orientation', de: 'Ausrichtung', pt: 'Orientação' },
  portrait: { en: 'Portrait', it: 'Verticale', es: 'Vertical', fr: 'Portrait', de: 'Hochformat', pt: 'Retrato' },
  landscape: { en: 'Landscape', it: 'Orizzontale', es: 'Horizontal', fr: 'Paysage', de: 'Querformat', pt: 'Paisagem' },
  margin: { en: 'Margin', it: 'Margine', es: 'Margen', fr: 'Marge', de: 'Rand', pt: 'Margem' },
  imageFit: { en: 'Image Fitting', it: 'Adattamento Immagine', es: 'Ajuste de Imagen', fr: 'Ajustement Image', de: 'Bildanpassung', pt: 'Ajuste de Imagem' },
  fitToPage: { en: 'Fit to Page', it: 'Adatta alla Pagina', es: 'Ajustar a Página', fr: 'Ajuster à la Page', de: 'An Seite Anpassen', pt: 'Ajustar à Página' },
  stretch: { en: 'Stretch to Fill', it: 'Estendi per Riempire', es: 'Estirar para Llenar', fr: 'Étirer pour Remplir', de: 'Strecken zum Füllen', pt: 'Esticar para Preencher' },
  originalSize: { en: 'Original Size', it: 'Dimensione Originale', es: 'Tamaño Original', fr: 'Taille Originale', de: 'Originalgröße', pt: 'Tamanho Original' },
  images: { en: 'Images', it: 'Immagini', es: 'Imágenes', fr: 'Images', de: 'Bilder', pt: 'Imagens' },
  pages: { en: 'Pages', it: 'Pagine', es: 'Páginas', fr: 'Pages', de: 'Seiten', pt: 'Páginas' },
  totalSize: { en: 'Total Size', it: 'Dimensione Totale', es: 'Tamaño Total', fr: 'Taille Totale', de: 'Gesamtgröße', pt: 'Tamanho Total' },
  pdfSize: { en: 'PDF Size', it: 'Dimensione PDF', es: 'Tamaño PDF', fr: 'Taille PDF', de: 'PDF-Größe', pt: 'Tamanho PDF' },
  remove: { en: 'Remove', it: 'Rimuovi', es: 'Eliminar', fr: 'Supprimer', de: 'Entfernen', pt: 'Remover' },
  moveUp: { en: 'Move Up', it: 'Sposta Su', es: 'Mover Arriba', fr: 'Monter', de: 'Nach Oben', pt: 'Mover Acima' },
  moveDown: { en: 'Move Down', it: 'Sposta Giù', es: 'Mover Abajo', fr: 'Descendre', de: 'Nach Unten', pt: 'Mover Abaixo' },
  errorType: { en: 'Unsupported file type. Please upload JPG, PNG, or WebP images.', it: 'Tipo di file non supportato. Carica immagini JPG, PNG o WebP.', es: 'Tipo de archivo no soportado. Sube imágenes JPG, PNG o WebP.', fr: 'Type de fichier non pris en charge. Téléchargez des images JPG, PNG ou WebP.', de: 'Nicht unterstützter Dateityp. Bitte JPG, PNG oder WebP hochladen.', pt: 'Tipo de arquivo não suportado. Envie imagens JPG, PNG ou WebP.' },
  errorSize: { en: 'Total size exceeds 50 MB limit.', it: 'La dimensione totale supera il limite di 50 MB.', es: 'El tamaño total supera el límite de 50 MB.', fr: 'La taille totale dépasse la limite de 50 Mo.', de: 'Gesamtgröße überschreitet 50 MB Limit.', pt: 'O tamanho total excede o limite de 50 MB.' },
  errorMax: { en: 'Maximum 50 images allowed.', it: 'Massimo 50 immagini consentite.', es: 'Máximo 50 imágenes permitidas.', fr: 'Maximum 50 images autorisées.', de: 'Maximal 50 Bilder erlaubt.', pt: 'Máximo de 50 imagens permitidas.' },
  generating: { en: 'Generating PDF...', it: 'Generazione PDF...', es: 'Generando PDF...', fr: 'Génération du PDF...', de: 'PDF wird erstellt...', pt: 'Gerando PDF...' },
  history: { en: 'Recent Conversions', it: 'Conversioni Recenti', es: 'Conversiones Recientes', fr: 'Conversions Récentes', de: 'Letzte Konvertierungen', pt: 'Conversões Recentes' },
};

interface ImageItem {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
  width: number;
  height: number;
}

interface HistoryItem {
  imageCount: number;
  totalSize: number;
  pdfSize: number;
  timestamp: number;
}

type PageSizeKey = 'a4' | 'letter' | 'legal' | 'a3';
type FitMode = 'fit' | 'stretch' | 'original';

const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_TOTAL_SIZE = 50 * 1024 * 1024;
const MAX_IMAGES = 50;

const PAGE_DIMS: Record<PageSizeKey, [number, number]> = {
  a4: [210, 297],
  letter: [215.9, 279.4],
  legal: [215.9, 355.6],
  a3: [297, 420],
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function JpgToPdf() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['jpg-to-pdf'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<PageSizeKey>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState(10);
  const [fitMode, setFitMode] = useState<FitMode>('fit');
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfBlobSize, setPdfBlobSize] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const totalSize = images.reduce((sum, img) => sum + img.size, 0);

  const addImages = useCallback((files: FileList | File[]) => {
    setError('');
    const fileArr = Array.from(files);

    for (const f of fileArr) {
      if (!SUPPORTED_TYPES.includes(f.type)) {
        setError(t('errorType'));
        return;
      }
    }

    setImages(prev => {
      const combined = [...prev];
      let currentSize = prev.reduce((s, img) => s + img.size, 0);

      for (const f of fileArr) {
        if (combined.length >= MAX_IMAGES) {
          setError(t('errorMax'));
          break;
        }
        if (currentSize + f.size > MAX_TOTAL_SIZE) {
          setError(t('errorSize'));
          break;
        }
        const id = Math.random().toString(36).slice(2);
        const url = URL.createObjectURL(f);
        combined.push({ id, file: f, url, name: f.name, size: f.size, width: 0, height: 0 });
        currentSize += f.size;
      }

      // Load dimensions for new images
      combined.forEach((item) => {
        if (item.width === 0) {
          const img = new Image();
          img.onload = () => {
            setImages(curr => curr.map(i => i.id === item.id ? { ...i, width: img.naturalWidth, height: img.naturalHeight } : i));
          };
          img.src = item.url;
        }
      });

      return combined;
    });

    setPdfUrl('');
    setPdfBlobSize(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeImage = (id: string) => {
    setImages(prev => {
      const item = prev.find(i => i.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter(i => i.id !== id);
    });
    setPdfUrl('');
    setPdfBlobSize(0);
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    setImages(prev => {
      const newArr = [...prev];
      const target = index + direction;
      if (target < 0 || target >= newArr.length) return prev;
      [newArr[index], newArr[target]] = [newArr[target], newArr[index]];
      return newArr;
    });
    setPdfUrl('');
    setPdfBlobSize(0);
  };

  const handleReset = () => {
    images.forEach(img => URL.revokeObjectURL(img.url));
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setImages([]);
    setPdfUrl('');
    setPdfBlobSize(0);
    setError('');
    setProgress(0);
    setGenerating(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const generatePdf = async () => {
    if (images.length === 0) return;
    setGenerating(true);
    setProgress(0);
    setPdfUrl('');
    setPdfBlobSize(0);

    try {
      const { jsPDF } = await import('jspdf');

      const [baseW, baseH] = PAGE_DIMS[pageSize];
      const isLandscape = orientation === 'landscape';
      const pageW = isLandscape ? baseH : baseW;
      const pageH = isLandscape ? baseW : baseH;
      const marginMm = margin;

      let doc: InstanceType<typeof jsPDF> | null = null;

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        setProgress(Math.round((i / images.length) * 100));

        // Load image to canvas to get data URL
        const loadedImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = reject;
          el.src = img.url;
        });

        const imgW = loadedImg.naturalWidth;
        const imgH = loadedImg.naturalHeight;

        // Convert image to data URL via canvas
        const canvas = document.createElement('canvas');
        canvas.width = imgW;
        canvas.height = imgH;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        ctx.drawImage(loadedImg, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

        const pageOrientation = isLandscape ? 'l' : 'p';
        const formatArg = pageSize === 'letter' ? 'letter' : pageSize === 'legal' ? 'legal' : pageSize;

        if (i === 0) {
          doc = new jsPDF({
            orientation: pageOrientation as 'p' | 'l',
            unit: 'mm',
            format: formatArg,
          });
        } else {
          doc!.addPage(formatArg, pageOrientation);
        }

        // Calculate image placement within page
        const availW = pageW - marginMm * 2;
        const availH = pageH - marginMm * 2;

        // Image dimensions in mm (96 DPI)
        const pxToMm = 25.4 / 96;
        const imgWmm = imgW * pxToMm;
        const imgHmm = imgH * pxToMm;

        let drawW: number, drawH: number, drawX: number, drawY: number;

        if (fitMode === 'stretch') {
          // Stretch to fill entire available area
          drawW = availW;
          drawH = availH;
          drawX = marginMm;
          drawY = marginMm;
        } else if (fitMode === 'original') {
          // Original size, capped to available area, centered
          drawW = Math.min(imgWmm, availW);
          drawH = Math.min(imgHmm, availH);
          drawX = marginMm + (availW - drawW) / 2;
          drawY = marginMm + (availH - drawH) / 2;
        } else {
          // Fit to page: scale proportionally to fit
          const imgAspect = imgW / imgH;
          const areaAspect = availW / availH;
          if (imgAspect > areaAspect) {
            drawW = availW;
            drawH = availW / imgAspect;
          } else {
            drawH = availH;
            drawW = availH * imgAspect;
          }
          drawX = marginMm + (availW - drawW) / 2;
          drawY = marginMm + (availH - drawH) / 2;
        }

        doc!.addImage(dataUrl, 'JPEG', drawX, drawY, drawW, drawH);
      }

      if (doc) {
        const pdfBlob = doc.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
        setPdfBlobSize(pdfBlob.size);

        const entry: HistoryItem = {
          imageCount: images.length,
          totalSize,
          pdfSize: pdfBlob.size,
          timestamp: Date.now(),
        };
        setHistory(prev => [entry, ...prev].slice(0, 5));
      }

      setProgress(100);
    } catch {
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'JPG to PDF Converter: Combine Images into a Professional PDF Document',
      paragraphs: [
        'Converting images to PDF is one of the most common document tasks, whether you need to compile scanned documents, create photo portfolios, or prepare image-based reports. Our browser-based JPG to PDF converter lets you combine multiple images into a single, well-formatted PDF document without uploading anything to a server. All processing happens locally in your browser, ensuring your files remain completely private.',
        'The tool supports JPG, PNG, and WebP image formats and allows you to upload up to 50 images at once. You can easily reorder images using up/down buttons, remove unwanted images, and preview thumbnails before generating the PDF. This gives you complete control over the final document layout.',
        'Four page size options are available: A4 (the international standard), US Letter, US Legal, and A3 for larger prints. Choose between Portrait and Landscape orientation, and adjust margins with a precise millimeter slider from 0 to 40 mm. Three image fitting modes let you maintain aspect ratio (Fit to Page), stretch images to fill the entire page, or keep the original size centered on the page.',
        'The converter uses the jsPDF library to generate high-quality PDF files directly in your browser. Each image is placed on its own page according to your settings. The result is a professional-looking PDF ready for printing, emailing, or archiving. Simply upload your images, configure your settings, and click Generate PDF to create your document in seconds.',
      ],
      faq: [
        { q: 'Are my images uploaded to a server during conversion?', a: 'No. All image processing and PDF generation happens entirely in your browser using JavaScript. Your images never leave your device, ensuring complete privacy and security. No internet connection is needed after the page loads.' },
        { q: 'What image formats can I convert to PDF?', a: 'The tool supports three formats: JPEG/JPG (photographs and scanned documents), PNG (graphics with transparency), and WebP (modern web format). All formats are converted to JPEG within the PDF for optimal file size.' },
        { q: 'Can I reorder images before creating the PDF?', a: 'Yes. After uploading images, you can reorder them using the up/down arrow buttons next to each thumbnail. You can also remove individual images. The PDF pages will follow the order shown in the preview.' },
        { q: 'What page sizes and orientations are supported?', a: 'Four page sizes are available: A4 (210x297mm), Letter (8.5x11in), Legal (8.5x14in), and A3 (297x420mm). Each can be set to Portrait or Landscape orientation, with adjustable margins from 0 to 40mm.' },
        { q: 'What do the image fitting options do?', a: 'Fit to Page scales the image proportionally to fill the available space without distortion. Stretch to Fill stretches the image to cover the entire page area (may distort). Original Size places the image at its native size, centered on the page.' },
      ],
    },
    it: {
      title: 'Convertitore JPG in PDF: Combina Immagini in un Documento PDF Professionale',
      paragraphs: [
        'Convertire immagini in PDF \u00e8 una delle operazioni documentali pi\u00f9 comuni, che si tratti di compilare documenti scansionati, creare portfolio fotografici o preparare report basati su immagini. Il nostro convertitore JPG in PDF basato su browser permette di combinare pi\u00f9 immagini in un unico documento PDF ben formattato senza caricare nulla su un server. Tutta l\'elaborazione avviene localmente nel browser, garantendo la completa privacy dei file.',
        'Lo strumento supporta i formati JPG, PNG e WebP e consente di caricare fino a 50 immagini contemporaneamente. Puoi riordinare facilmente le immagini usando i controlli su/gi\u00f9, rimuovere le immagini indesiderate e visualizzare le anteprime prima di generare il PDF.',
        'Sono disponibili quattro opzioni di dimensione pagina: A4 (standard internazionale), US Letter, US Legal e A3 per stampe pi\u00f9 grandi. Scegli tra orientamento Verticale e Orizzontale, e regola i margini con un cursore preciso in millimetri da 0 a 40 mm. Tre modalit\u00e0 di adattamento immagine consentono di mantenere le proporzioni, estendere per riempire la pagina o mantenere la dimensione originale.',
        'Il convertitore utilizza la libreria jsPDF per generare file PDF di alta qualit\u00e0 direttamente nel browser. Ogni immagine viene posizionata sulla propria pagina secondo le impostazioni scelte. Il risultato \u00e8 un PDF dall\'aspetto professionale pronto per la stampa, l\'invio via email o l\'archiviazione.',
      ],
      faq: [
        { q: 'Le mie immagini vengono caricate su un server durante la conversione?', a: 'No. Tutta l\'elaborazione e la generazione del PDF avvengono interamente nel browser usando JavaScript. Le immagini non lasciano mai il dispositivo, garantendo privacy e sicurezza complete.' },
        { q: 'Quali formati immagine posso convertire in PDF?', a: 'Lo strumento supporta tre formati: JPEG/JPG (fotografie e documenti scansionati), PNG (grafiche con trasparenza) e WebP (formato web moderno). Tutti i formati vengono convertiti in JPEG nel PDF per dimensioni ottimali.' },
        { q: 'Posso riordinare le immagini prima di creare il PDF?', a: 'S\u00ec. Dopo il caricamento, puoi riordinare le immagini usando i pulsanti freccia su/gi\u00f9 accanto a ogni anteprima. Puoi anche rimuovere immagini singole.' },
        { q: 'Quali formati pagina e orientamenti sono supportati?', a: 'Quattro formati pagina: A4 (210x297mm), Letter (8.5x11in), Legal (8.5x14in) e A3 (297x420mm). Ciascuno pu\u00f2 essere impostato in orientamento Verticale o Orizzontale, con margini regolabili da 0 a 40mm.' },
        { q: 'Cosa fanno le opzioni di adattamento immagine?', a: 'Adatta alla Pagina ridimensiona l\'immagine proporzionalmente. Estendi per Riempire estende l\'immagine per coprire l\'intera area. Dimensione Originale posiziona l\'immagine alla dimensione nativa, centrata.' },
      ],
    },
    es: {
      title: 'Convertidor JPG a PDF: Combina Im\u00e1genes en un Documento PDF Profesional',
      paragraphs: [
        'Convertir im\u00e1genes a PDF es una de las tareas documentales m\u00e1s comunes, ya sea para compilar documentos escaneados, crear portafolios fotogr\u00e1ficos o preparar informes basados en im\u00e1genes. Nuestro convertidor JPG a PDF basado en navegador te permite combinar m\u00faltiples im\u00e1genes en un \u00fanico documento PDF bien formateado sin subir nada a un servidor.',
        'La herramienta soporta formatos JPG, PNG y WebP y permite subir hasta 50 im\u00e1genes a la vez. Puedes reordenar f\u00e1cilmente las im\u00e1genes usando los controles arriba/abajo, eliminar im\u00e1genes no deseadas y previsualizar miniaturas antes de generar el PDF.',
        'Hay cuatro opciones de tama\u00f1o de p\u00e1gina: A4 (est\u00e1ndar internacional), Carta US, Legal US y A3 para impresiones m\u00e1s grandes. Elige entre orientaci\u00f3n Vertical y Horizontal, y ajusta los m\u00e1rgenes con un control deslizante preciso en mil\u00edmetros de 0 a 40 mm. Tres modos de ajuste de imagen permiten mantener proporciones, estirar para llenar o mantener el tama\u00f1o original.',
        'El convertidor utiliza la biblioteca jsPDF para generar archivos PDF de alta calidad directamente en tu navegador. Cada imagen se coloca en su propia p\u00e1gina seg\u00fan tus configuraciones. El resultado es un PDF de aspecto profesional listo para imprimir, enviar por email o archivar.',
      ],
      faq: [
        { q: '\u00bfMis im\u00e1genes se suben a alg\u00fan servidor durante la conversi\u00f3n?', a: 'No. Todo el procesamiento y la generaci\u00f3n del PDF ocurren completamente en tu navegador usando JavaScript. Tus im\u00e1genes nunca salen de tu dispositivo.' },
        { q: '\u00bfQu\u00e9 formatos de imagen puedo convertir a PDF?', a: 'La herramienta soporta tres formatos: JPEG/JPG (fotograf\u00edas y documentos escaneados), PNG (gr\u00e1ficos con transparencia) y WebP (formato web moderno).' },
        { q: '\u00bfPuedo reordenar las im\u00e1genes antes de crear el PDF?', a: 'S\u00ed. Despu\u00e9s de subir las im\u00e1genes, puedes reordenarlas usando los botones de flecha arriba/abajo junto a cada miniatura.' },
        { q: '\u00bfQu\u00e9 tama\u00f1os de p\u00e1gina y orientaciones est\u00e1n disponibles?', a: 'Cuatro tama\u00f1os: A4 (210x297mm), Carta (8.5x11in), Legal (8.5x14in) y A3 (297x420mm). Cada uno en orientaci\u00f3n Vertical u Horizontal, con m\u00e1rgenes ajustables de 0 a 40mm.' },
        { q: '\u00bfQu\u00e9 hacen las opciones de ajuste de imagen?', a: 'Ajustar a P\u00e1gina escala la imagen proporcionalmente. Estirar para Llenar estira la imagen para cubrir toda el \u00e1rea. Tama\u00f1o Original coloca la imagen en su tama\u00f1o nativo, centrada.' },
      ],
    },
    fr: {
      title: 'Convertisseur JPG en PDF : Combinez des Images en un Document PDF Professionnel',
      paragraphs: [
        'Convertir des images en PDF est l\'une des t\u00e2ches documentaires les plus courantes, que ce soit pour compiler des documents num\u00e9ris\u00e9s, cr\u00e9er des portfolios photo ou pr\u00e9parer des rapports bas\u00e9s sur des images. Notre convertisseur JPG en PDF bas\u00e9 sur navigateur vous permet de combiner plusieurs images en un seul document PDF bien format\u00e9 sans rien envoyer \u00e0 un serveur.',
        'L\'outil supporte les formats JPG, PNG et WebP et permet de t\u00e9l\u00e9charger jusqu\'\u00e0 50 images \u00e0 la fois. Vous pouvez facilement r\u00e9organiser les images \u00e0 l\'aide des contr\u00f4les haut/bas, supprimer les images ind\u00e9sirables et pr\u00e9visualiser les miniatures avant de g\u00e9n\u00e9rer le PDF.',
        'Quatre options de taille de page sont disponibles : A4 (standard international), Letter US, Legal US et A3 pour les grandes impressions. Choisissez entre Portrait et Paysage, et ajustez les marges avec un curseur pr\u00e9cis en millim\u00e8tres de 0 \u00e0 40 mm. Trois modes d\'ajustement d\'image permettent de maintenir les proportions, \u00e9tirer pour remplir ou garder la taille originale.',
        'Le convertisseur utilise la biblioth\u00e8que jsPDF pour g\u00e9n\u00e9rer des fichiers PDF de haute qualit\u00e9 directement dans votre navigateur. Chaque image est plac\u00e9e sur sa propre page selon vos param\u00e8tres. Le r\u00e9sultat est un PDF d\'aspect professionnel pr\u00eat pour l\'impression, l\'envoi par email ou l\'archivage.',
      ],
      faq: [
        { q: 'Mes images sont-elles envoy\u00e9es \u00e0 un serveur pendant la conversion ?', a: 'Non. Tout le traitement et la g\u00e9n\u00e9ration du PDF se font enti\u00e8rement dans votre navigateur en JavaScript. Vos images ne quittent jamais votre appareil.' },
        { q: 'Quels formats d\'image puis-je convertir en PDF ?', a: 'L\'outil supporte trois formats : JPEG/JPG (photographies et documents num\u00e9ris\u00e9s), PNG (graphiques avec transparence) et WebP (format web moderne).' },
        { q: 'Puis-je r\u00e9organiser les images avant de cr\u00e9er le PDF ?', a: 'Oui. Apr\u00e8s le t\u00e9l\u00e9chargement, vous pouvez r\u00e9organiser les images \u00e0 l\'aide des boutons fl\u00e9ch\u00e9s haut/bas \u00e0 c\u00f4t\u00e9 de chaque miniature.' },
        { q: 'Quelles tailles de page et orientations sont disponibles ?', a: 'Quatre tailles : A4 (210x297mm), Letter (8.5x11in), Legal (8.5x14in) et A3 (297x420mm). Chacune en Portrait ou Paysage, avec marges ajustables de 0 \u00e0 40mm.' },
        { q: 'Que font les options d\'ajustement d\'image ?', a: 'Ajuster \u00e0 la Page met \u00e0 l\'\u00e9chelle proportionnellement. \u00c9tirer pour Remplir \u00e9tire l\'image pour couvrir toute la zone. Taille Originale place l\'image \u00e0 sa taille native, centr\u00e9e.' },
      ],
    },
    de: {
      title: 'JPG zu PDF Konverter: Bilder zu einem Professionellen PDF-Dokument Kombinieren',
      paragraphs: [
        'Das Konvertieren von Bildern in PDF ist eine der h\u00e4ufigsten Dokumentenaufgaben, sei es zum Zusammenstellen gescannter Dokumente, Erstellen von Foto-Portfolios oder Vorbereiten bildbasierter Berichte. Unser browserbasierter JPG-zu-PDF-Konverter erm\u00f6glicht es Ihnen, mehrere Bilder zu einem einzigen, gut formatierten PDF-Dokument zu kombinieren, ohne etwas auf einen Server hochzuladen.',
        'Das Tool unterst\u00fctzt JPG-, PNG- und WebP-Bildformate und erm\u00f6glicht das Hochladen von bis zu 50 Bildern gleichzeitig. Sie k\u00f6nnen Bilder einfach mit den Auf/Ab-Steuerelementen neu anordnen, unerw\u00fcnschte Bilder entfernen und Vorschaubilder vor der PDF-Erstellung anzeigen.',
        'Vier Seitengr\u00f6\u00dfen-Optionen stehen zur Verf\u00fcgung: A4 (internationaler Standard), US Letter, US Legal und A3 f\u00fcr gr\u00f6\u00dfere Drucke. W\u00e4hlen Sie zwischen Hochformat und Querformat, und passen Sie die R\u00e4nder mit einem pr\u00e4zisen Millimeter-Schieberegler von 0 bis 40 mm an. Drei Bildanpassungsmodi erm\u00f6glichen proportionale Skalierung, Strecken zum F\u00fcllen oder Originalgr\u00f6\u00dfe.',
        'Der Konverter verwendet die jsPDF-Bibliothek zur Erzeugung hochwertiger PDF-Dateien direkt in Ihrem Browser. Jedes Bild wird auf einer eigenen Seite platziert. Das Ergebnis ist ein professionell aussehendes PDF, bereit zum Drucken, Versenden oder Archivieren.',
      ],
      faq: [
        { q: 'Werden meine Bilder w\u00e4hrend der Konvertierung auf einen Server hochgeladen?', a: 'Nein. Die gesamte Bildverarbeitung und PDF-Erstellung erfolgt vollst\u00e4ndig in Ihrem Browser mit JavaScript. Ihre Bilder verlassen niemals Ihr Ger\u00e4t.' },
        { q: 'Welche Bildformate kann ich in PDF konvertieren?', a: 'Das Tool unterst\u00fctzt drei Formate: JPEG/JPG (Fotografien und gescannte Dokumente), PNG (Grafiken mit Transparenz) und WebP (modernes Web-Format).' },
        { q: 'Kann ich die Bilder vor der PDF-Erstellung neu anordnen?', a: 'Ja. Nach dem Hochladen k\u00f6nnen Sie die Bilder mit den Auf/Ab-Pfeilschaltfl\u00e4chen neben jeder Vorschau neu anordnen.' },
        { q: 'Welche Seitengr\u00f6\u00dfen und Ausrichtungen werden unterst\u00fctzt?', a: 'Vier Gr\u00f6\u00dfen: A4 (210x297mm), Letter (8.5x11in), Legal (8.5x14in) und A3 (297x420mm). Jeweils in Hoch- oder Querformat, mit R\u00e4ndern von 0 bis 40mm.' },
        { q: 'Was machen die Bildanpassungsoptionen?', a: 'An Seite Anpassen skaliert proportional. Strecken zum F\u00fcllen streckt das Bild \u00fcber die gesamte Fl\u00e4che. Originalgr\u00f6\u00dfe platziert das Bild in seiner nativen Gr\u00f6\u00dfe, zentriert.' },
      ],
    },
    pt: {
      title: 'Conversor JPG para PDF: Combine Imagens em um Documento PDF Profissional',
      paragraphs: [
        'Converter imagens em PDF \u00e9 uma das tarefas documentais mais comuns, seja para compilar documentos digitalizados, criar portf\u00f3lios fotogr\u00e1ficos ou preparar relat\u00f3rios baseados em imagens. Nosso conversor JPG para PDF baseado em navegador permite combinar m\u00faltiplas imagens em um \u00fanico documento PDF bem formatado sem enviar nada para um servidor.',
        'A ferramenta suporta formatos JPG, PNG e WebP e permite enviar at\u00e9 50 imagens de uma vez. Voc\u00ea pode facilmente reordenar imagens usando os controles acima/abaixo, remover imagens indesejadas e visualizar miniaturas antes de gerar o PDF.',
        'Quatro op\u00e7\u00f5es de tamanho de p\u00e1gina est\u00e3o dispon\u00edveis: A4 (padr\u00e3o internacional), Carta US, Legal US e A3 para impress\u00f5es maiores. Escolha entre Retrato e Paisagem, e ajuste as margens com um controle deslizante preciso em mil\u00edmetros de 0 a 40 mm. Tr\u00eas modos de ajuste de imagem permitem manter propor\u00e7\u00f5es, esticar para preencher ou manter o tamanho original.',
        'O conversor utiliza a biblioteca jsPDF para gerar arquivos PDF de alta qualidade diretamente no seu navegador. Cada imagem \u00e9 colocada em sua pr\u00f3pria p\u00e1gina conforme suas configura\u00e7\u00f5es. O resultado \u00e9 um PDF de apar\u00eancia profissional pronto para impress\u00e3o, envio por email ou arquivamento.',
      ],
      faq: [
        { q: 'Minhas imagens s\u00e3o enviadas para algum servidor durante a convers\u00e3o?', a: 'N\u00e3o. Todo o processamento e gera\u00e7\u00e3o do PDF acontecem inteiramente no seu navegador usando JavaScript. Suas imagens nunca saem do seu dispositivo.' },
        { q: 'Quais formatos de imagem posso converter para PDF?', a: 'A ferramenta suporta tr\u00eas formatos: JPEG/JPG (fotografias e documentos digitalizados), PNG (gr\u00e1ficos com transpar\u00eancia) e WebP (formato web moderno).' },
        { q: 'Posso reordenar as imagens antes de criar o PDF?', a: 'Sim. Ap\u00f3s o envio, voc\u00ea pode reordenar as imagens usando os bot\u00f5es de seta acima/abaixo ao lado de cada miniatura.' },
        { q: 'Quais tamanhos de p\u00e1gina e orienta\u00e7\u00f5es s\u00e3o suportados?', a: 'Quatro tamanhos: A4 (210x297mm), Carta (8.5x11in), Legal (8.5x14in) e A3 (297x420mm). Cada um em Retrato ou Paisagem, com margens de 0 a 40mm.' },
        { q: 'O que fazem as op\u00e7\u00f5es de ajuste de imagem?', a: 'Ajustar \u00e0 P\u00e1gina escala proporcionalmente. Esticar para Preencher estica a imagem para cobrir toda a \u00e1rea. Tamanho Original coloca a imagem em seu tamanho nativo, centralizada.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="jpg-to-pdf" faqItems={seo.faq}>
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
            onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files.length) addImages(e.dataTransfer.files); }}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-gray-50 transition-colors"
          >
            <p className="text-gray-500 font-medium">{t('dragDrop')}</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP &middot; max {MAX_IMAGES} {t('images').toLowerCase()}, {MAX_TOTAL_SIZE / (1024 * 1024)} MB</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => { if (e.target.files?.length) addImages(e.target.files); e.target.value = ''; }}
            />
          </div>

          {/* Settings */}
          {images.length > 0 && (
            <>
              {/* Stats cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">{t('images')}</p>
                  <p className="text-2xl font-bold text-blue-700 mt-1">{images.length}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{t('totalSize')}</p>
                  <p className="text-2xl font-bold text-gray-700 mt-1">{formatBytes(totalSize)}</p>
                </div>
                {pdfBlobSize > 0 ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <p className="text-xs text-green-500 font-medium uppercase tracking-wide">{t('pdfSize')}</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">{formatBytes(pdfBlobSize)}</p>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <p className="text-xs text-green-500 font-medium uppercase tracking-wide">{t('pages')}</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">{images.length}</p>
                  </div>
                )}
              </div>

              {/* Options grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('pageSize')}</label>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(e.target.value as PageSizeKey); setPdfUrl(''); setPdfBlobSize(0); }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="a4">A4 (210 x 297 mm)</option>
                    <option value="letter">Letter (8.5 x 11 in)</option>
                    <option value="legal">Legal (8.5 x 14 in)</option>
                    <option value="a3">A3 (297 x 420 mm)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('orientation')}</label>
                  <select
                    value={orientation}
                    onChange={(e) => { setOrientation(e.target.value as 'portrait' | 'landscape'); setPdfUrl(''); setPdfBlobSize(0); }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="portrait">{t('portrait')}</option>
                    <option value="landscape">{t('landscape')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('margin')}: {margin} mm</label>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={margin}
                    onChange={(e) => { setMargin(Number(e.target.value)); setPdfUrl(''); setPdfBlobSize(0); }}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('imageFit')}</label>
                  <select
                    value={fitMode}
                    onChange={(e) => { setFitMode(e.target.value as FitMode); setPdfUrl(''); setPdfBlobSize(0); }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="fit">{t('fitToPage')}</option>
                    <option value="stretch">{t('stretch')}</option>
                    <option value="original">{t('originalSize')}</option>
                  </select>
                </div>
              </div>

              {/* Image thumbnails */}
              <div className="space-y-2">
                {images.map((img, i) => (
                  <div key={img.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.name} className="w-12 h-12 object-cover rounded border border-gray-200" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate" title={img.name}>{img.name}</p>
                      <p className="text-xs text-gray-400">{formatBytes(img.size)}{img.width > 0 && ` \u00b7 ${img.width}\u00d7${img.height}`}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveImage(i, -1)}
                        disabled={i === 0}
                        className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"
                        title={t('moveUp')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                      </button>
                      <button
                        onClick={() => moveImage(i, 1)}
                        disabled={i === images.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"
                        title={t('moveDown')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      <button
                        onClick={() => removeImage(img.id)}
                        className="p-1 text-red-400 hover:text-red-600 transition-colors"
                        title={t('remove')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              {generating && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{t('generating')}</span>
                    <span className="text-sm font-bold text-blue-600">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 rounded-full bg-blue-500 transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                {!pdfUrl ? (
                  <button
                    onClick={generatePdf}
                    disabled={generating || images.length === 0}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating ? t('generating') : t('generate')}
                  </button>
                ) : (
                  <a
                    href={pdfUrl}
                    download="images.pdf"
                    className="flex-1 text-center bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    {t('download')}
                  </a>
                )}
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

        {/* Conversion history */}
        {history.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('history')}</h3>
            <div className="space-y-2">
              {history.map((item) => (
                <div key={item.timestamp} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-4 py-2">
                  <span className="text-gray-700">{item.imageCount} {t('images').toLowerCase()}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">{formatBytes(item.totalSize)} &rarr; {formatBytes(item.pdfSize)}</span>
                    <span className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleTimeString()}</span>
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
