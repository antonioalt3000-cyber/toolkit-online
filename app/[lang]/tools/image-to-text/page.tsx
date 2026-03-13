'use client';
import { useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  uploadImage: { en: 'Upload Image', it: 'Carica Immagine', es: 'Subir Imagen', fr: 'Charger une Image', de: 'Bild Hochladen', pt: 'Carregar Imagem' },
  dragDrop: { en: 'Drag & drop an image here or click to browse', it: 'Trascina un\'immagine qui o clicca per sfogliare', es: 'Arrastra una imagen aqui o haz clic para explorar', fr: 'Glissez une image ici ou cliquez pour parcourir', de: 'Bild hierher ziehen oder klicken zum Durchsuchen', pt: 'Arraste uma imagem aqui ou clique para navegar' },
  imagePreview: { en: 'Image Preview', it: 'Anteprima Immagine', es: 'Vista Previa', fr: 'Apercu de l\'Image', de: 'Bildvorschau', pt: 'Pre-visualizacao' },
  imageInfo: { en: 'Image Information', it: 'Informazioni Immagine', es: 'Informacion de Imagen', fr: 'Informations sur l\'Image', de: 'Bildinformationen', pt: 'Informacoes da Imagem' },
  dimensions: { en: 'Dimensions', it: 'Dimensioni', es: 'Dimensiones', fr: 'Dimensions', de: 'Abmessungen', pt: 'Dimensoes' },
  fileSize: { en: 'File Size', it: 'Dimensione File', es: 'Tamano de Archivo', fr: 'Taille du Fichier', de: 'Dateigrose', pt: 'Tamanho do Arquivo' },
  fileType: { en: 'File Type', it: 'Tipo File', es: 'Tipo de Archivo', fr: 'Type de Fichier', de: 'Dateityp', pt: 'Tipo de Arquivo' },
  fileName: { en: 'File Name', it: 'Nome File', es: 'Nombre de Archivo', fr: 'Nom du Fichier', de: 'Dateiname', pt: 'Nome do Arquivo' },
  colorPalette: { en: 'Dominant Colors', it: 'Colori Dominanti', es: 'Colores Dominantes', fr: 'Couleurs Dominantes', de: 'Dominante Farben', pt: 'Cores Dominantes' },
  aspectRatio: { en: 'Aspect Ratio', it: 'Rapporto d\'Aspetto', es: 'Relacion de Aspecto', fr: 'Rapport d\'Aspect', de: 'Seitenverhaltnis', pt: 'Proporcao' },
  copyColor: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copie!', de: 'Kopiert!', pt: 'Copiado!' },
  clickToCopy: { en: 'Click to copy', it: 'Clicca per copiare', es: 'Clic para copiar', fr: 'Cliquez pour copier', de: 'Klicken zum Kopieren', pt: 'Clique para copiar' },
  removeImage: { en: 'Remove Image', it: 'Rimuovi Immagine', es: 'Eliminar Imagen', fr: 'Supprimer l\'Image', de: 'Bild Entfernen', pt: 'Remover Imagem' },
  analyzing: { en: 'Analyzing...', it: 'Analizzando...', es: 'Analizando...', fr: 'Analyse en cours...', de: 'Analysiere...', pt: 'Analisando...' },
  pixels: { en: 'pixels', it: 'pixel', es: 'pixeles', fr: 'pixels', de: 'Pixel', pt: 'pixels' },
  megapixels: { en: 'Megapixels', it: 'Megapixel', es: 'Megapixeles', fr: 'Megapixels', de: 'Megapixel', pt: 'Megapixels' },
  colorDepth: { en: 'Color Depth', it: 'Profondita Colore', es: 'Profundidad de Color', fr: 'Profondeur de Couleur', de: 'Farbtiefe', pt: 'Profundidade de Cor' },
};

interface ColorInfo {
  hex: string;
  rgb: string;
  percentage: number;
}

interface ImageData {
  width: number;
  height: number;
  fileSize: number;
  fileType: string;
  fileName: string;
  colors: ColorInfo[];
  aspectRatio: string;
  megapixels: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function getAspectRatio(w: number, h: number): string {
  const d = gcd(w, h);
  return `${w / d}:${h / d}`;
}

function extractDominantColors(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, sampleSize: number = 10): ColorInfo[] {
  const w = canvas.width;
  const h = canvas.height;
  const data = ctx.getImageData(0, 0, w, h).data;
  const colorMap: Record<string, number> = {};
  const step = Math.max(1, Math.floor(data.length / 4 / (sampleSize * sampleSize * 100)));

  for (let i = 0; i < data.length; i += step * 4) {
    const r = Math.round(data[i] / 16) * 16;
    const g = Math.round(data[i + 1] / 16) * 16;
    const b = Math.round(data[i + 2] / 16) * 16;
    const a = data[i + 3];
    if (a < 128) continue;
    const key = `${Math.min(r, 255)},${Math.min(g, 255)},${Math.min(b, 255)}`;
    colorMap[key] = (colorMap[key] || 0) + 1;
  }

  const total = Object.values(colorMap).reduce((s, c) => s + c, 0);
  const sorted = Object.entries(colorMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return sorted.map(([key, count]) => {
    const [r, g, b] = key.split(',').map(Number);
    const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    return {
      hex: hex.toUpperCase(),
      rgb: `rgb(${r}, ${g}, ${b})`,
      percentage: Math.round((count / total) * 100),
    };
  });
}

export default function ImageToText() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['image-to-text'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const analyzeImage = useCallback((file: File) => {
    setAnalyzing(true);
    const url = URL.createObjectURL(file);
    setImageUrl(url);

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);

      const colors = extractDominantColors(canvas, ctx);
      const mp = ((img.width * img.height) / 1_000_000).toFixed(2);

      setImageData({
        width: img.width,
        height: img.height,
        fileSize: file.size,
        fileType: file.type || 'unknown',
        fileName: file.name,
        colors,
        aspectRatio: getAspectRatio(img.width, img.height),
        megapixels: mp,
      });
      setAnalyzing(false);
    };
    img.onerror = () => setAnalyzing(false);
    img.src = url;
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    analyzeImage(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    setImageData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Image Analyzer: Extract Colors, Dimensions & Metadata Online',
      paragraphs: [
        'Our free online image analyzer lets you extract detailed information from any image directly in your browser. Upload a photo, screenshot, or graphic to instantly discover its dimensions, file size, format, aspect ratio, and dominant color palette. Everything runs locally on your device with zero uploads to external servers.',
        'The dominant color extraction feature uses Canvas API pixel sampling to identify the top 5 most prominent colors in your image. Each color is displayed with its hex code, RGB value, and approximate percentage. Click any color swatch to copy the hex code to your clipboard, making it easy to use in your design workflow.',
        'Beyond color analysis, the tool provides comprehensive image metadata including exact pixel dimensions, megapixel count, file size in human-readable format, MIME type, and calculated aspect ratio. This information is essential for web developers optimizing images, designers checking specifications, and content creators ensuring their visuals meet platform requirements.',
        'Whether you are a graphic designer extracting a color palette from an inspiration image, a web developer checking image dimensions for responsive layouts, or a photographer reviewing file metadata, this tool provides instant, accurate results without any software installation or account signup.',
      ],
      faq: [
        { q: 'What image formats are supported?', a: 'All formats supported by your browser are accepted, including JPEG, PNG, GIF, WebP, BMP, SVG, and AVIF. The tool uses the native HTML5 Image element, so any format your browser can render will work.' },
        { q: 'How does the color extraction work?', a: 'The tool draws your image onto an HTML5 Canvas, then samples the pixel data using getImageData(). Colors are quantized to reduce similar shades, then sorted by frequency. The top 5 most common colors are displayed with their hex codes, RGB values, and percentage distribution.' },
        { q: 'Is my image uploaded to a server?', a: 'No. All processing happens entirely in your browser using JavaScript and the Canvas API. Your image never leaves your device. The file is read using a local blob URL and analyzed in memory.' },
        { q: 'Can I copy the extracted color codes?', a: 'Yes. Click on any color swatch or hex code to instantly copy it to your clipboard. A brief confirmation message will appear. You can use these codes directly in CSS, design tools like Figma, or any application that accepts hex color values.' },
        { q: 'Why are the extracted colors slightly different from what I see?', a: 'The color extraction uses quantization (rounding to nearest values) to group similar colors together and produce a cleaner palette. This means exact pixel-level colors may be slightly adjusted. The result represents the dominant color families rather than every unique pixel color in the image.' },
      ],
    },
    it: {
      title: 'Analizzatore di Immagini Gratuito: Estrai Colori, Dimensioni e Metadati Online',
      paragraphs: [
        'Il nostro analizzatore di immagini online gratuito ti permette di estrarre informazioni dettagliate da qualsiasi immagine direttamente nel browser. Carica una foto, uno screenshot o una grafica per scoprire istantaneamente dimensioni, peso del file, formato, rapporto d\'aspetto e palette di colori dominanti. Tutto funziona localmente sul tuo dispositivo senza upload su server esterni.',
        'La funzione di estrazione dei colori dominanti utilizza il campionamento pixel dell\'API Canvas per identificare i 5 colori piu prominenti nella tua immagine. Ogni colore viene mostrato con codice hex, valore RGB e percentuale approssimativa. Clicca su qualsiasi campione di colore per copiare il codice hex negli appunti.',
        'Oltre all\'analisi dei colori, lo strumento fornisce metadati completi dell\'immagine inclusi dimensioni esatte in pixel, conteggio megapixel, dimensione file in formato leggibile, tipo MIME e rapporto d\'aspetto calcolato. Queste informazioni sono essenziali per sviluppatori web, designer e creatori di contenuti.',
        'Che tu sia un graphic designer che estrae una palette colori da un\'immagine di ispirazione, uno sviluppatore web che controlla le dimensioni per layout responsive, o un fotografo che verifica i metadati, questo strumento fornisce risultati istantanei e accurati senza installazione di software.',
      ],
      faq: [
        { q: 'Quali formati di immagine sono supportati?', a: 'Tutti i formati supportati dal tuo browser sono accettati, inclusi JPEG, PNG, GIF, WebP, BMP, SVG e AVIF. Lo strumento usa l\'elemento Image HTML5 nativo.' },
        { q: 'Come funziona l\'estrazione dei colori?', a: 'Lo strumento disegna l\'immagine su un Canvas HTML5, poi campiona i dati pixel usando getImageData(). I colori vengono quantizzati per ridurre le tonalita simili, poi ordinati per frequenza. I 5 colori piu comuni vengono mostrati con codici hex, valori RGB e distribuzione percentuale.' },
        { q: 'La mia immagine viene caricata su un server?', a: 'No. Tutta l\'elaborazione avviene interamente nel tuo browser usando JavaScript e l\'API Canvas. La tua immagine non lascia mai il tuo dispositivo.' },
        { q: 'Posso copiare i codici colore estratti?', a: 'Si. Clicca su qualsiasi campione di colore o codice hex per copiarlo istantaneamente negli appunti. Puoi usare questi codici direttamente in CSS, strumenti di design come Figma o qualsiasi applicazione che accetti valori hex.' },
        { q: 'Perche i colori estratti sono leggermente diversi da quelli che vedo?', a: 'L\'estrazione dei colori usa la quantizzazione per raggruppare colori simili e produrre una palette piu pulita. Il risultato rappresenta le famiglie di colori dominanti piuttosto che ogni singolo colore pixel nell\'immagine.' },
      ],
    },
    es: {
      title: 'Analizador de Imagenes Gratuito: Extrae Colores, Dimensiones y Metadatos Online',
      paragraphs: [
        'Nuestro analizador de imagenes online gratuito te permite extraer informacion detallada de cualquier imagen directamente en tu navegador. Sube una foto, captura de pantalla o grafico para descubrir al instante sus dimensiones, tamano de archivo, formato, relacion de aspecto y paleta de colores dominantes. Todo se ejecuta localmente en tu dispositivo.',
        'La funcion de extraccion de colores dominantes utiliza el muestreo de pixeles del API Canvas para identificar los 5 colores mas prominentes en tu imagen. Cada color se muestra con su codigo hex, valor RGB y porcentaje aproximado. Haz clic en cualquier muestra de color para copiar el codigo hex al portapapeles.',
        'Ademas del analisis de colores, la herramienta proporciona metadatos completos de la imagen incluyendo dimensiones exactas en pixeles, conteo de megapixeles, tamano de archivo en formato legible, tipo MIME y relacion de aspecto calculada. Esta informacion es esencial para desarrolladores web, disenadores y creadores de contenido.',
        'Ya seas un disenador grafico extrayendo una paleta de colores, un desarrollador web verificando dimensiones para disenos responsive, o un fotografo revisando metadatos, esta herramienta proporciona resultados instantaneos y precisos sin instalacion de software.',
      ],
      faq: [
        { q: 'Que formatos de imagen son compatibles?', a: 'Todos los formatos compatibles con tu navegador, incluyendo JPEG, PNG, GIF, WebP, BMP, SVG y AVIF. La herramienta usa el elemento Image nativo de HTML5.' },
        { q: 'Como funciona la extraccion de colores?', a: 'La herramienta dibuja tu imagen en un Canvas HTML5, luego muestrea los datos de pixeles usando getImageData(). Los colores se cuantifican para reducir tonos similares y se ordenan por frecuencia.' },
        { q: 'Mi imagen se sube a algun servidor?', a: 'No. Todo el procesamiento ocurre enteramente en tu navegador usando JavaScript y la API Canvas. Tu imagen nunca sale de tu dispositivo.' },
        { q: 'Puedo copiar los codigos de color extraidos?', a: 'Si. Haz clic en cualquier muestra de color o codigo hex para copiarlo instantaneamente al portapapeles.' },
        { q: 'Por que los colores extraidos son ligeramente diferentes a los que veo?', a: 'La extraccion de colores usa cuantificacion para agrupar colores similares y producir una paleta mas limpia. El resultado representa las familias de colores dominantes.' },
      ],
    },
    fr: {
      title: 'Analyseur d\'Images Gratuit : Extraire les Couleurs, Dimensions et Metadonnees en Ligne',
      paragraphs: [
        'Notre analyseur d\'images en ligne gratuit vous permet d\'extraire des informations detaillees de n\'importe quelle image directement dans votre navigateur. Chargez une photo, une capture d\'ecran ou un graphique pour decouvrir instantanement ses dimensions, la taille du fichier, le format, le rapport d\'aspect et la palette de couleurs dominantes. Tout fonctionne localement sur votre appareil.',
        'La fonction d\'extraction des couleurs dominantes utilise l\'echantillonnage de pixels de l\'API Canvas pour identifier les 5 couleurs les plus prominentes dans votre image. Chaque couleur est affichee avec son code hex, sa valeur RGB et son pourcentage approximatif. Cliquez sur n\'importe quel echantillon pour copier le code hex.',
        'Au-dela de l\'analyse des couleurs, l\'outil fournit des metadonnees completes incluant les dimensions exactes en pixels, le nombre de megapixels, la taille du fichier en format lisible, le type MIME et le rapport d\'aspect calcule. Ces informations sont essentielles pour les developpeurs web, designers et createurs de contenu.',
        'Que vous soyez un graphiste extrayant une palette de couleurs, un developpeur web verifiant les dimensions pour des mises en page responsives, ou un photographe examinant les metadonnees, cet outil fournit des resultats instantanes et precis sans installation de logiciel.',
      ],
      faq: [
        { q: 'Quels formats d\'image sont pris en charge ?', a: 'Tous les formats pris en charge par votre navigateur, y compris JPEG, PNG, GIF, WebP, BMP, SVG et AVIF. L\'outil utilise l\'element Image HTML5 natif.' },
        { q: 'Comment fonctionne l\'extraction des couleurs ?', a: 'L\'outil dessine votre image sur un Canvas HTML5, puis echantillonne les donnees de pixels avec getImageData(). Les couleurs sont quantifiees pour reduire les teintes similaires et triees par frequence.' },
        { q: 'Mon image est-elle telechargee sur un serveur ?', a: 'Non. Tout le traitement se fait entierement dans votre navigateur en utilisant JavaScript et l\'API Canvas. Votre image ne quitte jamais votre appareil.' },
        { q: 'Puis-je copier les codes couleur extraits ?', a: 'Oui. Cliquez sur n\'importe quel echantillon de couleur ou code hex pour le copier instantanement dans le presse-papiers.' },
        { q: 'Pourquoi les couleurs extraites sont-elles legerement differentes ?', a: 'L\'extraction utilise la quantification pour regrouper les couleurs similaires et produire une palette plus propre. Le resultat represente les familles de couleurs dominantes.' },
      ],
    },
    de: {
      title: 'Kostenloser Bildanalysator: Farben, Abmessungen und Metadaten Online Extrahieren',
      paragraphs: [
        'Unser kostenloser Online-Bildanalysator ermoglicht es Ihnen, detaillierte Informationen aus jedem Bild direkt im Browser zu extrahieren. Laden Sie ein Foto, einen Screenshot oder eine Grafik hoch, um sofort Abmessungen, Dateigrosse, Format, Seitenverhaltnis und dominante Farbpalette zu erfahren. Alles lauft lokal auf Ihrem Gerat.',
        'Die Funktion zur Extraktion dominanter Farben verwendet Canvas-API-Pixelabtastung, um die 5 prominentesten Farben in Ihrem Bild zu identifizieren. Jede Farbe wird mit Hex-Code, RGB-Wert und approximativem Prozentsatz angezeigt. Klicken Sie auf ein Farbmuster, um den Hex-Code in die Zwischenablage zu kopieren.',
        'Neben der Farbanalyse liefert das Tool umfassende Bildmetadaten einschliesslich exakter Pixelabmessungen, Megapixelanzahl, Dateigrosse in lesbarem Format, MIME-Typ und berechnetem Seitenverhaltnis. Diese Informationen sind unerlasslich fur Webentwickler, Designer und Content-Ersteller.',
        'Ob Sie ein Grafikdesigner sind, der eine Farbpalette extrahiert, ein Webentwickler, der Bildabmessungen fur responsive Layouts pruft, oder ein Fotograf, der Dateimetadaten uberpruft - dieses Tool liefert sofortige, genaue Ergebnisse ohne Softwareinstallation.',
      ],
      faq: [
        { q: 'Welche Bildformate werden unterstutzt?', a: 'Alle von Ihrem Browser unterstutzten Formate werden akzeptiert, einschliesslich JPEG, PNG, GIF, WebP, BMP, SVG und AVIF.' },
        { q: 'Wie funktioniert die Farbextraktion?', a: 'Das Tool zeichnet Ihr Bild auf ein HTML5-Canvas und tastet die Pixeldaten mit getImageData() ab. Farben werden quantisiert, um ahnliche Tone zu reduzieren, und nach Haufigkeit sortiert.' },
        { q: 'Wird mein Bild auf einen Server hochgeladen?', a: 'Nein. Die gesamte Verarbeitung erfolgt vollstandig in Ihrem Browser mit JavaScript und der Canvas-API. Ihr Bild verlasst nie Ihr Gerat.' },
        { q: 'Kann ich die extrahierten Farbcodes kopieren?', a: 'Ja. Klicken Sie auf ein Farbmuster oder einen Hex-Code, um ihn sofort in die Zwischenablage zu kopieren.' },
        { q: 'Warum weichen die extrahierten Farben leicht von dem ab, was ich sehe?', a: 'Die Farbextraktion verwendet Quantisierung, um ahnliche Farben zu gruppieren und eine sauberere Palette zu erzeugen. Das Ergebnis reprasentiert die dominanten Farbfamilien.' },
      ],
    },
    pt: {
      title: 'Analisador de Imagens Gratuito: Extraia Cores, Dimensoes e Metadados Online',
      paragraphs: [
        'Nosso analisador de imagens online gratuito permite extrair informacoes detalhadas de qualquer imagem diretamente no seu navegador. Carregue uma foto, captura de tela ou grafico para descobrir instantaneamente suas dimensoes, tamanho do arquivo, formato, proporcao e paleta de cores dominantes. Tudo funciona localmente no seu dispositivo.',
        'A funcao de extracao de cores dominantes usa amostragem de pixels da API Canvas para identificar as 5 cores mais proeminentes na sua imagem. Cada cor e exibida com seu codigo hex, valor RGB e porcentagem aproximada. Clique em qualquer amostra de cor para copiar o codigo hex para a area de transferencia.',
        'Alem da analise de cores, a ferramenta fornece metadados completos da imagem incluindo dimensoes exatas em pixels, contagem de megapixels, tamanho do arquivo em formato legivel, tipo MIME e proporcao calculada. Estas informacoes sao essenciais para desenvolvedores web, designers e criadores de conteudo.',
        'Seja voce um designer grafico extraindo uma paleta de cores, um desenvolvedor web verificando dimensoes para layouts responsivos, ou um fotografo revisando metadados, esta ferramenta fornece resultados instantaneos e precisos sem instalacao de software.',
      ],
      faq: [
        { q: 'Quais formatos de imagem sao suportados?', a: 'Todos os formatos suportados pelo seu navegador, incluindo JPEG, PNG, GIF, WebP, BMP, SVG e AVIF. A ferramenta usa o elemento Image nativo do HTML5.' },
        { q: 'Como funciona a extracao de cores?', a: 'A ferramenta desenha sua imagem em um Canvas HTML5, depois amostra os dados de pixels usando getImageData(). As cores sao quantizadas para reduzir tons similares e ordenadas por frequencia.' },
        { q: 'Minha imagem e enviada para um servidor?', a: 'Nao. Todo o processamento acontece inteiramente no seu navegador usando JavaScript e a API Canvas. Sua imagem nunca sai do seu dispositivo.' },
        { q: 'Posso copiar os codigos de cor extraidos?', a: 'Sim. Clique em qualquer amostra de cor ou codigo hex para copia-lo instantaneamente para a area de transferencia.' },
        { q: 'Por que as cores extraidas sao ligeiramente diferentes do que eu vejo?', a: 'A extracao de cores usa quantizacao para agrupar cores similares e produzir uma paleta mais limpa. O resultado representa as familias de cores dominantes.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="image-to-text" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Hidden canvas for pixel analysis */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Upload Area */}
        {!imageUrl && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-600 font-medium">{t('dragDrop')}</p>
            <p className="text-xs text-gray-400 mt-2">JPEG, PNG, GIF, WebP, BMP, SVG</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />

        {/* Analyzing Spinner */}
        {analyzing && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-gray-600">{t('analyzing')}</span>
          </div>
        )}

        {/* Image Preview */}
        {imageUrl && !analyzing && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">{t('imagePreview')}</h3>
              <button onClick={handleRemove} className="text-sm text-red-600 hover:text-red-700 font-medium">
                {t('removeImage')}
              </button>
            </div>
            <div className="bg-gray-100 flex items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Preview" className="max-h-80 object-contain rounded" />
            </div>
          </div>
        )}

        {/* Image Information */}
        {imageData && !analyzing && (
          <>
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">{t('imageInfo')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{t('dimensions')}</p>
                  <p className="text-sm font-semibold text-gray-900">{imageData.width} x {imageData.height} {t('pixels')}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{t('fileSize')}</p>
                  <p className="text-sm font-semibold text-gray-900">{formatFileSize(imageData.fileSize)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{t('fileType')}</p>
                  <p className="text-sm font-semibold text-gray-900">{imageData.fileType}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{t('aspectRatio')}</p>
                  <p className="text-sm font-semibold text-gray-900">{imageData.aspectRatio}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{t('megapixels')}</p>
                  <p className="text-sm font-semibold text-gray-900">{imageData.megapixels} MP</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{t('fileName')}</p>
                  <p className="text-sm font-semibold text-gray-900 truncate" title={imageData.fileName}>{imageData.fileName}</p>
                </div>
              </div>
            </div>

            {/* Color Palette */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">{t('colorPalette')}</h3>
              <div className="space-y-3">
                {imageData.colors.map((color, i) => (
                  <div
                    key={i}
                    onClick={() => copyColor(color.hex)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                    title={t('clickToCopy')}
                  >
                    <div
                      className="w-10 h-10 rounded-lg border border-gray-200 flex-shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-gray-900">
                          {copiedColor === color.hex ? t('copyColor') : color.hex}
                        </span>
                        <span className="text-xs text-gray-400">{color.rgb}</span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{ width: `${color.percentage}%`, backgroundColor: color.hex }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-500 flex-shrink-0">{color.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </>
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
