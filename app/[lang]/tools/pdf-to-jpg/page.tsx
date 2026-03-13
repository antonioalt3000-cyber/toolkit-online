'use client';
import { useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  uploadTitle: { en: 'Upload Images', it: 'Carica Immagini', es: 'Subir Imágenes', fr: 'Télécharger des Images', de: 'Bilder Hochladen', pt: 'Carregar Imagens' },
  dropzone: { en: 'Drag & drop images here or click to browse', it: 'Trascina le immagini qui o clicca per sfogliare', es: 'Arrastra imágenes aquí o haz clic para explorar', fr: 'Glissez-déposez les images ici ou cliquez pour parcourir', de: 'Bilder hierher ziehen oder klicken zum Durchsuchen', pt: 'Arraste imagens aqui ou clique para navegar' },
  supported: { en: 'Supports PNG, WebP, BMP, GIF, SVG, TIFF, AVIF', it: 'Supporta PNG, WebP, BMP, GIF, SVG, TIFF, AVIF', es: 'Soporta PNG, WebP, BMP, GIF, SVG, TIFF, AVIF', fr: 'Prend en charge PNG, WebP, BMP, GIF, SVG, TIFF, AVIF', de: 'Unterstützt PNG, WebP, BMP, GIF, SVG, TIFF, AVIF', pt: 'Suporta PNG, WebP, BMP, GIF, SVG, TIFF, AVIF' },
  quality: { en: 'JPG Quality', it: 'Qualità JPG', es: 'Calidad JPG', fr: 'Qualité JPG', de: 'JPG-Qualität', pt: 'Qualidade JPG' },
  low: { en: 'Low', it: 'Bassa', es: 'Baja', fr: 'Basse', de: 'Niedrig', pt: 'Baixa' },
  medium: { en: 'Medium', it: 'Media', es: 'Media', fr: 'Moyenne', de: 'Mittel', pt: 'Média' },
  high: { en: 'High', it: 'Alta', es: 'Alta', fr: 'Haute', de: 'Hoch', pt: 'Alta' },
  maximum: { en: 'Maximum', it: 'Massima', es: 'Máxima', fr: 'Maximale', de: 'Maximum', pt: 'Máxima' },
  convert: { en: 'Convert to JPG', it: 'Converti in JPG', es: 'Convertir a JPG', fr: 'Convertir en JPG', de: 'In JPG umwandeln', pt: 'Converter para JPG' },
  convertAll: { en: 'Convert All to JPG', it: 'Converti Tutto in JPG', es: 'Convertir Todo a JPG', fr: 'Tout Convertir en JPG', de: 'Alle in JPG umwandeln', pt: 'Converter Tudo para JPG' },
  download: { en: 'Download JPG', it: 'Scarica JPG', es: 'Descargar JPG', fr: 'Télécharger JPG', de: 'JPG herunterladen', pt: 'Baixar JPG' },
  downloadAll: { en: 'Download All', it: 'Scarica Tutto', es: 'Descargar Todo', fr: 'Tout Télécharger', de: 'Alle herunterladen', pt: 'Baixar Tudo' },
  remove: { en: 'Remove', it: 'Rimuovi', es: 'Eliminar', fr: 'Supprimer', de: 'Entfernen', pt: 'Remover' },
  clear: { en: 'Clear All', it: 'Cancella Tutto', es: 'Borrar Todo', fr: 'Tout Effacer', de: 'Alle Löschen', pt: 'Limpar Tudo' },
  original: { en: 'Original', it: 'Originale', es: 'Original', fr: 'Original', de: 'Original', pt: 'Original' },
  converted: { en: 'Converted', it: 'Convertito', es: 'Convertido', fr: 'Converti', de: 'Konvertiert', pt: 'Convertido' },
  size: { en: 'Size', it: 'Dimensione', es: 'Tamaño', fr: 'Taille', de: 'Größe', pt: 'Tamanho' },
  savings: { en: 'Savings', it: 'Risparmio', es: 'Ahorro', fr: 'Économie', de: 'Ersparnis', pt: 'Economia' },
  converting: { en: 'Converting...', it: 'Conversione...', es: 'Convirtiendo...', fr: 'Conversion...', de: 'Konvertierung...', pt: 'Convertendo...' },
  noImages: { en: 'No images uploaded yet', it: 'Nessuna immagine caricata', es: 'No hay imágenes cargadas', fr: 'Aucune image téléchargée', de: 'Noch keine Bilder hochgeladen', pt: 'Nenhuma imagem carregada' },
  pdfNote: { en: 'For PDF files, use a desktop tool like Adobe Acrobat or an online service. This tool converts image formats (PNG, WebP, BMP, GIF, SVG, TIFF) to JPG directly in your browser.', it: 'Per i file PDF, usa uno strumento desktop come Adobe Acrobat o un servizio online. Questo strumento converte formati immagine (PNG, WebP, BMP, GIF, SVG, TIFF) in JPG direttamente nel browser.', es: 'Para archivos PDF, usa una herramienta de escritorio como Adobe Acrobat o un servicio en línea. Esta herramienta convierte formatos de imagen (PNG, WebP, BMP, GIF, SVG, TIFF) a JPG directamente en tu navegador.', fr: 'Pour les fichiers PDF, utilisez un outil de bureau comme Adobe Acrobat ou un service en ligne. Cet outil convertit les formats d\'image (PNG, WebP, BMP, GIF, SVG, TIFF) en JPG directement dans votre navigateur.', de: 'Für PDF-Dateien verwenden Sie ein Desktop-Tool wie Adobe Acrobat oder einen Online-Dienst. Dieses Tool konvertiert Bildformate (PNG, WebP, BMP, GIF, SVG, TIFF) direkt im Browser in JPG.', pt: 'Para arquivos PDF, use uma ferramenta de desktop como Adobe Acrobat ou um serviço online. Esta ferramenta converte formatos de imagem (PNG, WebP, BMP, GIF, SVG, TIFF) para JPG diretamente no seu navegador.' },
  images: { en: 'images', it: 'immagini', es: 'imágenes', fr: 'images', de: 'Bilder', pt: 'imagens' },
};

interface ImageFile {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  previewUrl: string;
  convertedUrl?: string;
  convertedSize?: number;
  converting?: boolean;
}

const qualityPresets = { low: 0.3, medium: 0.6, high: 0.85, maximum: 0.98 };

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: {
    title: 'PDF to JPG & Image to JPG Converter: Transform Your Files Instantly',
    paragraphs: [
      'Converting images to JPG format is one of the most common tasks for web designers, photographers, bloggers, and everyday users. JPG (also known as JPEG) is the most widely supported image format on the web, offering an excellent balance between image quality and file size through lossy compression.',
      'This free online image-to-JPG converter supports a wide range of input formats including PNG, WebP, BMP, GIF, SVG, TIFF, and AVIF. The conversion happens entirely in your browser using the HTML5 Canvas API, which means your images are never uploaded to any server. Your files remain private and secure on your device.',
      'The quality slider lets you fine-tune the compression level from low (smaller files, more artifacts) to maximum (larger files, near-lossless quality). For web use, medium quality (60%) typically provides the best balance. For print or archival purposes, high or maximum quality is recommended. You can preview both the original and converted images side by side.',
      'Common use cases include converting PNG screenshots to smaller JPG files for email, transforming WebP images downloaded from websites into the more universally compatible JPG format, batch processing multiple images for a blog post, and reducing file sizes for faster website loading. The before-and-after size comparison helps you understand exactly how much space you are saving with each conversion.',
    ],
    faq: [
      { q: 'Can this tool convert PDF files to JPG?', a: 'This browser-based tool specializes in converting image formats (PNG, WebP, BMP, GIF, SVG, TIFF) to JPG. For PDF to JPG conversion, you would need a tool with PDF rendering capabilities like Adobe Acrobat, or you can take screenshots of PDF pages and convert them here.' },
      { q: 'Is there a file size limit for images?', a: 'There is no hard file size limit since everything is processed in your browser. However, very large images (above 50 MB) may cause slower performance depending on your device memory. Most images convert within seconds.' },
      { q: 'Will converting to JPG reduce my image quality?', a: 'JPG uses lossy compression, so there is always some quality reduction. At high quality (85%) the difference is usually imperceptible. Use the quality slider to find the right balance between file size and visual quality for your needs.' },
      { q: 'Are my images uploaded to a server?', a: 'No. All conversion happens locally in your browser using the Canvas API. Your images never leave your device, ensuring complete privacy and security. No data is sent to any external server.' },
      { q: 'What is the difference between JPG and JPEG?', a: 'JPG and JPEG are the same format. The only difference is the file extension length. Older Windows systems limited extensions to 3 characters (.jpg), while other systems used 4 characters (.jpeg). Both are fully interchangeable.' },
    ],
  },
  it: {
    title: 'Convertitore PDF in JPG e Immagini in JPG: Trasforma i Tuoi File Istantaneamente',
    paragraphs: [
      'La conversione di immagini in formato JPG è una delle attività più comuni per web designer, fotografi, blogger e utenti quotidiani. JPG (noto anche come JPEG) è il formato immagine più supportato sul web, offrendo un eccellente equilibrio tra qualità dell\'immagine e dimensione del file attraverso la compressione lossy.',
      'Questo convertitore gratuito di immagini in JPG supporta un\'ampia gamma di formati di input tra cui PNG, WebP, BMP, GIF, SVG, TIFF e AVIF. La conversione avviene interamente nel tuo browser utilizzando l\'API Canvas di HTML5, il che significa che le tue immagini non vengono mai caricate su alcun server.',
      'Il cursore della qualità ti permette di regolare il livello di compressione da basso (file più piccoli, più artefatti) a massimo (file più grandi, qualità quasi lossless). Per l\'uso web, la qualità media (60%) offre tipicamente il miglior equilibrio. Per la stampa o l\'archiviazione, si consiglia una qualità alta o massima.',
      'I casi d\'uso comuni includono la conversione di screenshot PNG in file JPG più piccoli per le email, la trasformazione di immagini WebP in formato JPG più universalmente compatibile, l\'elaborazione batch di più immagini per un post del blog e la riduzione delle dimensioni dei file per un caricamento più veloce del sito web.',
    ],
    faq: [
      { q: 'Questo strumento può convertire file PDF in JPG?', a: 'Questo strumento basato su browser è specializzato nella conversione di formati immagine (PNG, WebP, BMP, GIF, SVG, TIFF) in JPG. Per la conversione da PDF a JPG, servono strumenti con capacità di rendering PDF come Adobe Acrobat, oppure puoi fare screenshot delle pagine PDF e convertirli qui.' },
      { q: 'C\'è un limite di dimensione per le immagini?', a: 'Non c\'è un limite rigido poiché tutto viene elaborato nel browser. Tuttavia, immagini molto grandi (oltre 50 MB) potrebbero causare prestazioni più lente a seconda della memoria del dispositivo.' },
      { q: 'La conversione in JPG ridurrà la qualità della mia immagine?', a: 'JPG utilizza la compressione lossy, quindi c\'è sempre una riduzione della qualità. Con qualità alta (85%) la differenza è solitamente impercettibile. Usa il cursore per trovare il giusto equilibrio.' },
      { q: 'Le mie immagini vengono caricate su un server?', a: 'No. Tutta la conversione avviene localmente nel tuo browser utilizzando l\'API Canvas. Le tue immagini non lasciano mai il tuo dispositivo, garantendo privacy e sicurezza complete.' },
      { q: 'Qual è la differenza tra JPG e JPEG?', a: 'JPG e JPEG sono lo stesso formato. L\'unica differenza è la lunghezza dell\'estensione del file. I vecchi sistemi Windows limitavano le estensioni a 3 caratteri (.jpg), mentre altri sistemi usavano 4 caratteri (.jpeg). Sono completamente intercambiabili.' },
    ],
  },
  es: {
    title: 'Convertidor PDF a JPG e Imagen a JPG: Transforma tus Archivos al Instante',
    paragraphs: [
      'Convertir imágenes a formato JPG es una de las tareas más comunes para diseñadores web, fotógrafos, bloggers y usuarios cotidianos. JPG (también conocido como JPEG) es el formato de imagen más ampliamente soportado en la web, ofreciendo un excelente equilibrio entre calidad de imagen y tamaño de archivo.',
      'Este convertidor gratuito de imágenes a JPG soporta una amplia gama de formatos de entrada incluyendo PNG, WebP, BMP, GIF, SVG, TIFF y AVIF. La conversión ocurre completamente en tu navegador usando la API Canvas de HTML5, lo que significa que tus imágenes nunca se suben a ningún servidor.',
      'El control de calidad te permite ajustar el nivel de compresión desde bajo (archivos más pequeños, más artefactos) hasta máximo (archivos más grandes, calidad casi sin pérdida). Para uso web, la calidad media (60%) típicamente ofrece el mejor equilibrio.',
      'Los casos de uso comunes incluyen convertir capturas PNG a archivos JPG más pequeños para email, transformar imágenes WebP a formato JPG más universalmente compatible, procesamiento por lotes de múltiples imágenes y reducción de tamaños de archivo para carga más rápida del sitio web.',
    ],
    faq: [
      { q: '¿Puede esta herramienta convertir archivos PDF a JPG?', a: 'Esta herramienta basada en navegador se especializa en convertir formatos de imagen (PNG, WebP, BMP, GIF, SVG, TIFF) a JPG. Para conversión de PDF a JPG, necesitarás herramientas con capacidades de renderizado PDF como Adobe Acrobat.' },
      { q: '¿Hay un límite de tamaño para las imágenes?', a: 'No hay un límite estricto ya que todo se procesa en tu navegador. Sin embargo, imágenes muy grandes (más de 50 MB) pueden causar un rendimiento más lento dependiendo de la memoria de tu dispositivo.' },
      { q: '¿Convertir a JPG reducirá la calidad de mi imagen?', a: 'JPG usa compresión con pérdida, por lo que siempre hay alguna reducción de calidad. Con calidad alta (85%) la diferencia es generalmente imperceptible. Usa el control deslizante para encontrar el equilibrio adecuado.' },
      { q: '¿Se suben mis imágenes a un servidor?', a: 'No. Toda la conversión ocurre localmente en tu navegador usando la API Canvas. Tus imágenes nunca salen de tu dispositivo, garantizando privacidad y seguridad completas.' },
      { q: '¿Cuál es la diferencia entre JPG y JPEG?', a: 'JPG y JPEG son el mismo formato. La única diferencia es la longitud de la extensión del archivo. Los antiguos sistemas Windows limitaban las extensiones a 3 caracteres (.jpg), mientras que otros sistemas usaban 4 caracteres (.jpeg).' },
    ],
  },
  fr: {
    title: 'Convertisseur PDF en JPG et Image en JPG : Transformez vos Fichiers Instantanément',
    paragraphs: [
      'La conversion d\'images au format JPG est l\'une des tâches les plus courantes pour les concepteurs web, les photographes, les blogueurs et les utilisateurs quotidiens. JPG (également connu sous le nom de JPEG) est le format d\'image le plus largement pris en charge sur le web, offrant un excellent équilibre entre qualité d\'image et taille de fichier.',
      'Ce convertisseur gratuit d\'images en JPG prend en charge une large gamme de formats d\'entrée, notamment PNG, WebP, BMP, GIF, SVG, TIFF et AVIF. La conversion se fait entièrement dans votre navigateur en utilisant l\'API Canvas HTML5, ce qui signifie que vos images ne sont jamais téléchargées sur un serveur.',
      'Le curseur de qualité vous permet d\'ajuster le niveau de compression de bas (fichiers plus petits, plus d\'artefacts) à maximum (fichiers plus grands, qualité quasi sans perte). Pour une utilisation web, la qualité moyenne (60%) offre généralement le meilleur équilibre.',
      'Les cas d\'utilisation courants incluent la conversion de captures PNG en fichiers JPG plus petits pour les emails, la transformation d\'images WebP en format JPG plus universellement compatible, le traitement par lots de plusieurs images et la réduction de la taille des fichiers pour un chargement plus rapide.',
    ],
    faq: [
      { q: 'Cet outil peut-il convertir des fichiers PDF en JPG ?', a: 'Cet outil basé sur le navigateur se spécialise dans la conversion de formats d\'image (PNG, WebP, BMP, GIF, SVG, TIFF) en JPG. Pour la conversion PDF en JPG, vous aurez besoin d\'un outil avec des capacités de rendu PDF comme Adobe Acrobat.' },
      { q: 'Y a-t-il une limite de taille pour les images ?', a: 'Il n\'y a pas de limite stricte car tout est traité dans votre navigateur. Cependant, les très grandes images (plus de 50 Mo) peuvent ralentir les performances selon la mémoire de votre appareil.' },
      { q: 'La conversion en JPG réduira-t-elle la qualité de mon image ?', a: 'JPG utilise la compression avec perte, il y a donc toujours une certaine réduction de qualité. À haute qualité (85%), la différence est généralement imperceptible. Utilisez le curseur pour trouver le bon équilibre.' },
      { q: 'Mes images sont-elles téléchargées sur un serveur ?', a: 'Non. Toute la conversion se fait localement dans votre navigateur en utilisant l\'API Canvas. Vos images ne quittent jamais votre appareil, garantissant une confidentialité et une sécurité complètes.' },
      { q: 'Quelle est la différence entre JPG et JPEG ?', a: 'JPG et JPEG sont le même format. La seule différence est la longueur de l\'extension du fichier. Les anciens systèmes Windows limitaient les extensions à 3 caractères (.jpg), tandis que d\'autres systèmes utilisaient 4 caractères (.jpeg).' },
    ],
  },
  de: {
    title: 'PDF zu JPG & Bild zu JPG Konverter: Dateien Sofort Umwandeln',
    paragraphs: [
      'Das Konvertieren von Bildern in das JPG-Format ist eine der häufigsten Aufgaben für Webdesigner, Fotografen, Blogger und alltägliche Nutzer. JPG (auch bekannt als JPEG) ist das am weitesten unterstützte Bildformat im Web und bietet ein hervorragendes Gleichgewicht zwischen Bildqualität und Dateigröße durch verlustbehaftete Kompression.',
      'Dieser kostenlose Online-Bild-zu-JPG-Konverter unterstützt eine breite Palette von Eingabeformaten, darunter PNG, WebP, BMP, GIF, SVG, TIFF und AVIF. Die Konvertierung erfolgt vollständig in Ihrem Browser mit der HTML5 Canvas API, was bedeutet, dass Ihre Bilder nie auf einen Server hochgeladen werden.',
      'Der Qualitätsregler ermöglicht es Ihnen, das Kompressionsniveau von niedrig (kleinere Dateien, mehr Artefakte) bis maximal (größere Dateien, nahezu verlustfreie Qualität) einzustellen. Für die Webnutzung bietet mittlere Qualität (60%) typischerweise das beste Gleichgewicht.',
      'Häufige Anwendungsfälle umfassen die Konvertierung von PNG-Screenshots in kleinere JPG-Dateien für E-Mails, die Umwandlung von WebP-Bildern in das universeller kompatible JPG-Format, die Stapelverarbeitung mehrerer Bilder und die Reduzierung der Dateigrößen für schnelleres Laden von Webseiten.',
    ],
    faq: [
      { q: 'Kann dieses Tool PDF-Dateien in JPG konvertieren?', a: 'Dieses browserbasierte Tool ist auf die Konvertierung von Bildformaten (PNG, WebP, BMP, GIF, SVG, TIFF) in JPG spezialisiert. Für die PDF-zu-JPG-Konvertierung benötigen Sie ein Tool mit PDF-Rendering-Fähigkeiten wie Adobe Acrobat.' },
      { q: 'Gibt es ein Dateigrößenlimit für Bilder?', a: 'Es gibt kein striktes Dateigrößenlimit, da alles in Ihrem Browser verarbeitet wird. Sehr große Bilder (über 50 MB) können jedoch je nach Gerätespeicher zu langsamerer Leistung führen.' },
      { q: 'Wird die Konvertierung in JPG meine Bildqualität verringern?', a: 'JPG verwendet verlustbehaftete Kompression, daher gibt es immer eine gewisse Qualitätsminderung. Bei hoher Qualität (85%) ist der Unterschied normalerweise nicht wahrnehmbar. Verwenden Sie den Regler, um das richtige Gleichgewicht zu finden.' },
      { q: 'Werden meine Bilder auf einen Server hochgeladen?', a: 'Nein. Die gesamte Konvertierung erfolgt lokal in Ihrem Browser mit der Canvas API. Ihre Bilder verlassen nie Ihr Gerät, was vollständige Privatsphäre und Sicherheit gewährleistet.' },
      { q: 'Was ist der Unterschied zwischen JPG und JPEG?', a: 'JPG und JPEG sind dasselbe Format. Der einzige Unterschied ist die Länge der Dateierweiterung. Ältere Windows-Systeme beschränkten Erweiterungen auf 3 Zeichen (.jpg), während andere Systeme 4 Zeichen (.jpeg) verwendeten.' },
    ],
  },
  pt: {
    title: 'Conversor PDF para JPG e Imagem para JPG: Transforme seus Arquivos Instantaneamente',
    paragraphs: [
      'Converter imagens para o formato JPG é uma das tarefas mais comuns para web designers, fotógrafos, blogueiros e usuários do dia a dia. JPG (também conhecido como JPEG) é o formato de imagem mais amplamente suportado na web, oferecendo um excelente equilíbrio entre qualidade de imagem e tamanho de arquivo.',
      'Este conversor gratuito de imagens para JPG suporta uma ampla gama de formatos de entrada incluindo PNG, WebP, BMP, GIF, SVG, TIFF e AVIF. A conversão acontece inteiramente no seu navegador usando a API Canvas do HTML5, o que significa que suas imagens nunca são enviadas para nenhum servidor.',
      'O controle de qualidade permite ajustar o nível de compressão de baixo (arquivos menores, mais artefatos) a máximo (arquivos maiores, qualidade quase sem perdas). Para uso na web, qualidade média (60%) tipicamente oferece o melhor equilíbrio.',
      'Casos de uso comuns incluem converter capturas de tela PNG em arquivos JPG menores para email, transformar imagens WebP em formato JPG mais universalmente compatível, processamento em lote de múltiplas imagens e redução de tamanhos de arquivo para carregamento mais rápido do site.',
    ],
    faq: [
      { q: 'Esta ferramenta pode converter arquivos PDF para JPG?', a: 'Esta ferramenta baseada em navegador é especializada em converter formatos de imagem (PNG, WebP, BMP, GIF, SVG, TIFF) para JPG. Para conversão de PDF para JPG, você precisará de uma ferramenta com capacidades de renderização PDF como Adobe Acrobat.' },
      { q: 'Há um limite de tamanho para as imagens?', a: 'Não há um limite rígido pois tudo é processado no seu navegador. No entanto, imagens muito grandes (acima de 50 MB) podem causar desempenho mais lento dependendo da memória do seu dispositivo.' },
      { q: 'Converter para JPG vai reduzir a qualidade da minha imagem?', a: 'JPG usa compressão com perdas, então sempre há alguma redução de qualidade. Com qualidade alta (85%) a diferença é geralmente imperceptível. Use o controle deslizante para encontrar o equilíbrio certo.' },
      { q: 'Minhas imagens são enviadas para um servidor?', a: 'Não. Toda a conversão acontece localmente no seu navegador usando a API Canvas. Suas imagens nunca saem do seu dispositivo, garantindo privacidade e segurança completas.' },
      { q: 'Qual é a diferença entre JPG e JPEG?', a: 'JPG e JPEG são o mesmo formato. A única diferença é o comprimento da extensão do arquivo. Sistemas Windows antigos limitavam extensões a 3 caracteres (.jpg), enquanto outros sistemas usavam 4 caracteres (.jpeg).' },
    ],
  },
};

export default function PdfToJpg() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['pdf-to-jpg'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [images, setImages] = useState<ImageFile[]>([]);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high' | 'maximum'>('high');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = ['image/png', 'image/webp', 'image/bmp', 'image/gif', 'image/svg+xml', 'image/tiff', 'image/avif', 'image/jpeg'];

  const addFiles = useCallback((files: FileList | File[]) => {
    const newImages: ImageFile[] = [];
    Array.from(files).forEach((file) => {
      if (!acceptedTypes.includes(file.type) && !file.name.match(/\.(png|webp|bmp|gif|svg|tiff?|avif|jpe?g)$/i)) return;
      const id = Math.random().toString(36).slice(2, 10) + Date.now();
      newImages.push({
        id,
        file,
        name: file.name,
        originalSize: file.size,
        previewUrl: URL.createObjectURL(file),
      });
    });
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const convertImage = useCallback(async (img: ImageFile): Promise<ImageFile> => {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(img); return; }
        // White background for transparency
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(img); return; }
            const convertedUrl = URL.createObjectURL(blob);
            resolve({ ...img, convertedUrl, convertedSize: blob.size, converting: false });
          },
          'image/jpeg',
          qualityPresets[quality]
        );
      };
      image.onerror = () => resolve(img);
      image.src = img.previewUrl;
    });
  }, [quality]);

  const convertSingle = useCallback(async (id: string) => {
    setImages((prev) => prev.map((img) => img.id === id ? { ...img, converting: true } : img));
    const target = images.find((img) => img.id === id);
    if (!target) return;
    const converted = await convertImage(target);
    setImages((prev) => prev.map((img) => img.id === id ? converted : img));
  }, [images, convertImage]);

  const convertAll = useCallback(async () => {
    setImages((prev) => prev.map((img) => ({ ...img, converting: !img.convertedUrl })));
    const results = await Promise.all(images.map((img) => img.convertedUrl ? Promise.resolve(img) : convertImage(img)));
    setImages(results);
  }, [images, convertImage]);

  const downloadImage = useCallback((img: ImageFile) => {
    if (!img.convertedUrl) return;
    const a = document.createElement('a');
    a.href = img.convertedUrl;
    const baseName = img.name.replace(/\.[^.]+$/, '');
    a.download = baseName + '.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const downloadAll = useCallback(() => {
    images.forEach((img) => {
      if (img.convertedUrl) downloadImage(img);
    });
  }, [images, downloadImage]);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) {
        URL.revokeObjectURL(img.previewUrl);
        if (img.convertedUrl) URL.revokeObjectURL(img.convertedUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    images.forEach((img) => {
      URL.revokeObjectURL(img.previewUrl);
      if (img.convertedUrl) URL.revokeObjectURL(img.convertedUrl);
    });
    setImages([]);
  }, [images]);

  const hasConverted = images.some((img) => img.convertedUrl);
  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="pdf-to-jpg" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
          >
            <div className="text-4xl mb-3">🖼️</div>
            <p className="text-gray-700 font-medium">{t('dropzone')}</p>
            <p className="text-gray-400 text-sm mt-1">{t('supported')}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
            />
          </div>

          {/* PDF note */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <strong>PDF:</strong> {t('pdfNote')}
          </div>

          {/* Quality selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('quality')}</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high', 'maximum'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${quality === q ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t(q)} ({Math.round(qualityPresets[q] * 100)}%)
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          {images.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button onClick={convertAll} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                {t('convertAll')}
              </button>
              {hasConverted && (
                <button onClick={downloadAll} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm">
                  {t('downloadAll')}
                </button>
              )}
              <button onClick={clearAll} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm ml-auto">
                {t('clear')}
              </button>
            </div>
          )}

          {/* Image list */}
          {images.length === 0 ? (
            <p className="text-gray-400 text-center py-6">{t('noImages')}</p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">{images.length} {t('images')}</p>
              {images.map((img) => (
                <div key={img.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{img.name}</p>
                      <p className="text-xs text-gray-500">{t('original')}: {formatSize(img.originalSize)}</p>
                    </div>
                    <button onClick={() => removeImage(img.id)} className="text-gray-400 hover:text-red-500 text-sm ml-2">
                      {t('remove')}
                    </button>
                  </div>

                  {/* Preview */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t('original')}</p>
                      <div className="bg-gray-50 rounded-lg p-2 flex items-center justify-center" style={{ minHeight: '120px' }}>
                        <img src={img.previewUrl} alt="Original" className="max-h-32 max-w-full object-contain rounded" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t('converted')}</p>
                      <div className="bg-gray-50 rounded-lg p-2 flex items-center justify-center" style={{ minHeight: '120px' }}>
                        {img.converting ? (
                          <div className="text-sm text-gray-400 animate-pulse">{t('converting')}</div>
                        ) : img.convertedUrl ? (
                          <img src={img.convertedUrl} alt="Converted" className="max-h-32 max-w-full object-contain rounded" />
                        ) : (
                          <div className="text-sm text-gray-300">JPG</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats & actions */}
                  {img.convertedUrl && img.convertedSize !== undefined && (
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <div className="text-xs text-gray-600 space-x-3">
                        <span>{t('converted')}: <strong>{formatSize(img.convertedSize)}</strong></span>
                        <span className={img.convertedSize < img.originalSize ? 'text-green-600' : 'text-orange-600'}>
                          {t('savings')}: {img.convertedSize < img.originalSize
                            ? '-' + Math.round((1 - img.convertedSize / img.originalSize) * 100) + '%'
                            : '+' + Math.round((img.convertedSize / img.originalSize - 1) * 100) + '%'
                          }
                        </span>
                      </div>
                      <button onClick={() => downloadImage(img)} className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors">
                        {t('download')}
                      </button>
                    </div>
                  )}

                  {!img.convertedUrl && !img.converting && (
                    <button onClick={() => convertSingle(img.id)} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      {t('convert')}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEO Article */}
        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-4">{p}</p>)}
        </article>

        {/* FAQ */}
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
