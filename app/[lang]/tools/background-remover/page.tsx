'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  upload: { en: 'Upload Image', it: 'Carica Immagine', es: 'Subir Imagen', fr: 'Charger Image', de: 'Bild Hochladen', pt: 'Carregar Imagem' },
  dragDrop: { en: 'Drag & drop or click to upload', it: 'Trascina o clicca per caricare', es: 'Arrastra o haz clic para subir', fr: 'Glissez ou cliquez pour charger', de: 'Ziehen oder klicken zum Hochladen', pt: 'Arraste ou clique para carregar' },
  tolerance: { en: 'Color Tolerance', it: 'Tolleranza Colore', es: 'Tolerancia de Color', fr: 'Tolérance de Couleur', de: 'Farbtoleranz', pt: 'Tolerância de Cor' },
  clickToRemove: { en: 'Click on the background color to remove it', it: 'Clicca sul colore di sfondo da rimuovere', es: 'Haz clic en el color de fondo a eliminar', fr: 'Cliquez sur la couleur de fond à supprimer', de: 'Klicken Sie auf die Hintergrundfarbe zum Entfernen', pt: 'Clique na cor de fundo para remover' },
  download: { en: 'Download PNG', it: 'Scarica PNG', es: 'Descargar PNG', fr: 'Télécharger PNG', de: 'PNG Herunterladen', pt: 'Baixar PNG' },
  reset: { en: 'Reset', it: 'Ripristina', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  undo: { en: 'Undo', it: 'Annulla', es: 'Deshacer', fr: 'Annuler', de: 'Rückgängig', pt: 'Desfazer' },
  original: { en: 'Original', it: 'Originale', es: 'Original', fr: 'Original', de: 'Original', pt: 'Original' },
  result: { en: 'Result', it: 'Risultato', es: 'Resultado', fr: 'Résultat', de: 'Ergebnis', pt: 'Resultado' },
  processing: { en: 'Processing...', it: 'Elaborazione...', es: 'Procesando...', fr: 'Traitement...', de: 'Verarbeitung...', pt: 'Processando...' },
  formats: { en: 'Supports JPG, PNG, WebP', it: 'Supporta JPG, PNG, WebP', es: 'Soporta JPG, PNG, WebP', fr: 'Supporte JPG, PNG, WebP', de: 'Unterstützt JPG, PNG, WebP', pt: 'Suporta JPG, PNG, WebP' },
};

function floodFill(
  imageData: ImageData,
  startX: number,
  startY: number,
  tolerance: number
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(new Uint8ClampedArray(data), width, height);
  const od = output.data;
  const visited = new Uint8Array(width * height);

  const idx = (startY * width + startX) * 4;
  const targetR = data[idx];
  const targetG = data[idx + 1];
  const targetB = data[idx + 2];

  const tolSq = tolerance * tolerance;

  const stack: number[] = [startX, startY];

  while (stack.length > 0) {
    const y = stack.pop()!;
    const x = stack.pop()!;

    if (x < 0 || x >= width || y < 0 || y >= height) continue;

    const pos = y * width + x;
    if (visited[pos]) continue;
    visited[pos] = 1;

    const i = pos * 4;
    const dr = od[i] - targetR;
    const dg = od[i + 1] - targetG;
    const db = od[i + 2] - targetB;
    const distSq = dr * dr + dg * dg + db * db;

    if (distSq <= tolSq) {
      od[i + 3] = 0; // set alpha to 0
      stack.push(x + 1, y);
      stack.push(x - 1, y);
      stack.push(x, y + 1);
      stack.push(x, y - 1);
    }
  }

  return output;
}

export default function BackgroundRemover() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['background-remover'][lang];
  const t = useCallback((key: string) => labels[key]?.[lang] ?? labels[key]?.en ?? key, [lang]);

  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [tolerance, setTolerance] = useState(32);
  const [processing, setProcessing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const drawCheckerboard = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const size = 10;
    for (let y = 0; y < h; y += size) {
      for (let x = 0; x < w; x += size) {
        ctx.fillStyle = ((x / size + y / size) % 2 === 0) ? '#e5e7eb' : '#ffffff';
        ctx.fillRect(x, y, size, size);
      }
    }
  }, []);

  const updatePreview = useCallback((canvas: HTMLCanvasElement) => {
    const preview = previewRef.current;
    if (!preview) return;
    const pCtx = preview.getContext('2d')!;
    preview.width = canvas.width;
    preview.height = canvas.height;
    drawCheckerboard(pCtx, canvas.width, canvas.height);
    pCtx.drawImage(canvas, 0, 0);
  }, [drawCheckerboard]);

  const handleUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setHistory([]);
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, img.width, img.height);
        ctx.drawImage(img, 0, 0);
        updatePreview(canvas);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [updatePreview]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || processing) return;
    setProcessing(true);

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext('2d')!;
    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Save to history for undo
    setHistory(prev => [...prev, currentData]);

    requestAnimationFrame(() => {
      const result = floodFill(currentData, x, y, tolerance);
      ctx.putImageData(result, 0, 0);
      updatePreview(canvas);
      setProcessing(false);
    });
  }, [processing, tolerance, updatePreview]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const prev = history[history.length - 1];
    ctx.putImageData(prev, 0, 0);
    setHistory(h => h.slice(0, -1));
    updatePreview(canvas);
  }, [history, updatePreview]);

  const handleReset = useCallback(() => {
    if (!originalImage) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.clearRect(0, 0, originalImage.width, originalImage.height);
    ctx.drawImage(originalImage, 0, 0);
    setHistory([]);
    updatePreview(canvas);
  }, [originalImage, updatePreview]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'background-removed.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleUpload(file);
  }, [handleUpload]);

  // Initialize preview when canvas is ready
  useEffect(() => {
    if (originalImage && canvasRef.current) {
      updatePreview(canvasRef.current);
    }
  }, [originalImage, updatePreview]);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Background Remover: Remove Image Backgrounds Instantly Online',
      paragraphs: [
        'Removing backgrounds from images is one of the most common tasks in photo editing and graphic design. Our free online background remover uses advanced canvas-based flood fill technology to make any background transparent with a single click. No software installation needed -- everything runs directly in your browser for maximum privacy and speed.',
        'The tool works by analyzing the color you click on and removing all connected pixels with a similar color. The color tolerance slider lets you fine-tune how aggressively the tool removes colors. A low tolerance removes only exact color matches, while a higher tolerance captures subtle color variations in gradients and shadows, giving you clean edges around your subject.',
        'Unlike AI-based background removers that require uploading your images to a server, this tool processes everything locally in your browser using the HTML5 Canvas API. Your images never leave your device, ensuring complete privacy. The flood fill algorithm efficiently traverses connected pixels, making transparent areas where the background color is detected within your specified tolerance range.',
        'The undo feature lets you reverse any removal step, and the reset button restores the original image. Once satisfied with the result, download your image as a PNG file with full transparency support. This is perfect for creating product photos for e-commerce, profile pictures, stickers, logos, and any design project requiring a transparent background.',
      ],
      faq: [
        { q: 'How does the background remover work?', a: 'The tool uses a flood fill algorithm on the HTML5 Canvas. When you click a pixel, it identifies the color and removes all connected pixels with similar colors (within the tolerance you set) by making them transparent.' },
        { q: 'Is my image uploaded to any server?', a: 'No. All processing happens entirely in your browser using the Canvas API. Your image never leaves your device, ensuring complete privacy and security.' },
        { q: 'What is the color tolerance slider?', a: 'The tolerance controls how similar a pixel must be to the clicked color to be removed. Low tolerance (e.g., 10) removes only nearly identical colors. High tolerance (e.g., 80) removes a wider range of similar colors, useful for gradients.' },
        { q: 'What image formats are supported?', a: 'You can upload JPG, PNG, and WebP images. The output is always a PNG file, which supports transparency for the removed background areas.' },
        { q: 'Can I remove multiple background colors?', a: 'Yes! Click on different areas of the background to remove multiple colors. Each click removes connected pixels of that color. Use the undo button if you accidentally remove part of your subject.' },
      ],
    },
    it: {
      title: 'Rimuovi Sfondo: Rimuovi lo Sfondo dalle Immagini Online Gratis',
      paragraphs: [
        'Rimuovere lo sfondo dalle immagini e una delle attivita piu comuni nell\'editing fotografico e nel design grafico. Il nostro strumento gratuito online per la rimozione dello sfondo utilizza la tecnologia avanzata di flood fill basata su canvas per rendere qualsiasi sfondo trasparente con un solo clic. Non serve installare software: tutto funziona direttamente nel tuo browser per massima privacy e velocita.',
        'Lo strumento funziona analizzando il colore su cui fai clic e rimuovendo tutti i pixel collegati con un colore simile. Il cursore di tolleranza del colore ti permette di regolare con precisione quanto aggressivamente lo strumento rimuove i colori. Una tolleranza bassa rimuove solo corrispondenze esatte, mentre una tolleranza piu alta cattura variazioni sottili nei gradienti e nelle ombre.',
        'A differenza dei tool basati su IA che richiedono il caricamento delle immagini su un server, questo strumento elabora tutto localmente nel tuo browser usando l\'API Canvas HTML5. Le tue immagini non lasciano mai il tuo dispositivo, garantendo privacy completa. L\'algoritmo di flood fill attraversa efficientemente i pixel collegati, creando aree trasparenti dove viene rilevato il colore dello sfondo.',
        'La funzione annulla ti permette di invertire qualsiasi passaggio e il pulsante reset ripristina l\'immagine originale. Una volta soddisfatto, scarica l\'immagine come file PNG con supporto completo alla trasparenza. Perfetto per foto prodotto e-commerce, immagini profilo, adesivi, loghi e qualsiasi progetto di design.',
      ],
      faq: [
        { q: 'Come funziona la rimozione dello sfondo?', a: 'Lo strumento usa un algoritmo di flood fill sul Canvas HTML5. Quando clicchi su un pixel, identifica il colore e rimuove tutti i pixel collegati con colori simili rendendoli trasparenti.' },
        { q: 'La mia immagine viene caricata su un server?', a: 'No. Tutta l\'elaborazione avviene interamente nel tuo browser usando l\'API Canvas. La tua immagine non lascia mai il dispositivo.' },
        { q: 'Cos\'e il cursore di tolleranza colore?', a: 'La tolleranza controlla quanto un pixel deve essere simile al colore cliccato per essere rimosso. Bassa tolleranza rimuove solo colori quasi identici, alta tolleranza rimuove una gamma piu ampia.' },
        { q: 'Quali formati immagine sono supportati?', a: 'Puoi caricare immagini JPG, PNG e WebP. L\'output e sempre un file PNG con supporto alla trasparenza.' },
        { q: 'Posso rimuovere piu colori di sfondo?', a: 'Si! Clicca su diverse aree dello sfondo per rimuovere piu colori. Ogni clic rimuove i pixel collegati di quel colore. Usa il pulsante annulla se rimuovi accidentalmente parte del soggetto.' },
      ],
    },
    es: {
      title: 'Eliminador de Fondo: Elimina Fondos de Imagenes Online Gratis',
      paragraphs: [
        'Eliminar fondos de imagenes es una de las tareas mas comunes en la edicion de fotos y el diseno grafico. Nuestro eliminador de fondos online gratuito utiliza tecnologia avanzada de relleno por inundacion basada en canvas para hacer cualquier fondo transparente con un solo clic. No necesitas instalar software: todo funciona directamente en tu navegador.',
        'La herramienta funciona analizando el color en el que haces clic y eliminando todos los pixeles conectados con un color similar. El control de tolerancia de color te permite ajustar con precision la agresividad de la eliminacion. Una tolerancia baja elimina solo coincidencias exactas, mientras que una tolerancia alta captura variaciones sutiles en gradientes y sombras.',
        'A diferencia de los eliminadores basados en IA que requieren subir imagenes a un servidor, esta herramienta procesa todo localmente en tu navegador usando la API Canvas de HTML5. Tus imagenes nunca salen de tu dispositivo, garantizando privacidad completa.',
        'La funcion de deshacer te permite revertir cualquier paso y el boton de restablecer restaura la imagen original. Descarga tu imagen como archivo PNG con soporte completo de transparencia. Perfecto para fotos de productos, imagenes de perfil, stickers, logos y cualquier proyecto de diseno.',
      ],
      faq: [
        { q: 'Como funciona el eliminador de fondo?', a: 'La herramienta usa un algoritmo de relleno por inundacion en el Canvas HTML5. Al hacer clic en un pixel, identifica el color y elimina todos los pixeles conectados con colores similares haciendolos transparentes.' },
        { q: 'Mi imagen se sube a algun servidor?', a: 'No. Todo el procesamiento ocurre completamente en tu navegador usando la API Canvas. Tu imagen nunca sale de tu dispositivo.' },
        { q: 'Que es el control de tolerancia de color?', a: 'La tolerancia controla cuan similar debe ser un pixel al color seleccionado para ser eliminado. Baja tolerancia elimina solo colores casi identicos, alta tolerancia elimina un rango mas amplio.' },
        { q: 'Que formatos de imagen son compatibles?', a: 'Puedes subir imagenes JPG, PNG y WebP. La salida siempre es un archivo PNG con soporte de transparencia.' },
        { q: 'Puedo eliminar multiples colores de fondo?', a: 'Si! Haz clic en diferentes areas del fondo para eliminar multiples colores. Usa el boton deshacer si eliminas accidentalmente parte del sujeto.' },
      ],
    },
    fr: {
      title: 'Suppresseur de Fond : Supprimez les Arriere-plans en Ligne Gratuitement',
      paragraphs: [
        'Supprimer les arriere-plans des images est l\'une des taches les plus courantes en retouche photo et design graphique. Notre outil gratuit en ligne utilise la technologie avancee de remplissage par diffusion basee sur le canvas pour rendre n\'importe quel fond transparent en un seul clic. Aucune installation necessaire : tout fonctionne directement dans votre navigateur.',
        'L\'outil fonctionne en analysant la couleur sur laquelle vous cliquez et en supprimant tous les pixels connectes ayant une couleur similaire. Le curseur de tolerance vous permet de regler la precision de la suppression. Une faible tolerance supprime uniquement les correspondances exactes, tandis qu\'une tolerance elevee capture les variations subtiles dans les degradees.',
        'Contrairement aux outils bases sur l\'IA qui necessitent le telechargement de vos images sur un serveur, cet outil traite tout localement dans votre navigateur en utilisant l\'API Canvas HTML5. Vos images ne quittent jamais votre appareil, garantissant une confidentialite totale.',
        'La fonction d\'annulation vous permet d\'inverser chaque etape et le bouton de reinitialisation restaure l\'image originale. Telechargez votre image en PNG avec support complet de la transparence. Parfait pour les photos de produits, les images de profil, les autocollants et tout projet de design.',
      ],
      faq: [
        { q: 'Comment fonctionne le suppresseur de fond ?', a: 'L\'outil utilise un algorithme de remplissage par diffusion sur le Canvas HTML5. Lorsque vous cliquez sur un pixel, il identifie la couleur et supprime tous les pixels connectes ayant des couleurs similaires.' },
        { q: 'Mon image est-elle envoyee sur un serveur ?', a: 'Non. Tout le traitement se fait entierement dans votre navigateur en utilisant l\'API Canvas. Votre image ne quitte jamais votre appareil.' },
        { q: 'Qu\'est-ce que le curseur de tolerance de couleur ?', a: 'La tolerance controle a quel point un pixel doit etre similaire a la couleur cliquee pour etre supprime. Une faible tolerance supprime seulement les couleurs presque identiques.' },
        { q: 'Quels formats d\'image sont pris en charge ?', a: 'Vous pouvez charger des images JPG, PNG et WebP. La sortie est toujours un fichier PNG avec support de la transparence.' },
        { q: 'Puis-je supprimer plusieurs couleurs de fond ?', a: 'Oui ! Cliquez sur differentes zones du fond pour supprimer plusieurs couleurs. Utilisez le bouton annuler si vous supprimez accidentellement une partie du sujet.' },
      ],
    },
    de: {
      title: 'Hintergrund Entfernen: Bildhintergrunde Online Kostenlos Entfernen',
      paragraphs: [
        'Das Entfernen von Hintergrunden aus Bildern ist eine der haufigsten Aufgaben in der Fotobearbeitung und im Grafikdesign. Unser kostenloses Online-Tool nutzt fortschrittliche Canvas-basierte Flood-Fill-Technologie, um jeden Hintergrund mit einem einzigen Klick transparent zu machen. Keine Software-Installation notig: alles lauft direkt in Ihrem Browser.',
        'Das Tool analysiert die Farbe, auf die Sie klicken, und entfernt alle verbundenen Pixel mit ahnlicher Farbe. Der Farbtoleranz-Regler ermoglicht eine prazise Einstellung der Entfernungsaggressivitat. Niedrige Toleranz entfernt nur exakte Farbubereinstimmungen, wahrend hohe Toleranz subtile Variationen in Verlaufen und Schatten erfasst.',
        'Im Gegensatz zu KI-basierten Tools, die das Hochladen Ihrer Bilder auf einen Server erfordern, verarbeitet dieses Tool alles lokal in Ihrem Browser mit der HTML5 Canvas API. Ihre Bilder verlassen nie Ihr Gerat, was vollstandige Privatsphare gewahrleistet.',
        'Die Ruckgangig-Funktion ermoglicht es, jeden Schritt ruckgangig zu machen, und die Zurucksetzen-Taste stellt das Originalbild wieder her. Laden Sie Ihr Bild als PNG-Datei mit voller Transparenzunterstutzung herunter. Perfekt fur Produktfotos, Profilbilder, Sticker, Logos und jedes Designprojekt.',
      ],
      faq: [
        { q: 'Wie funktioniert die Hintergrundentfernung?', a: 'Das Tool verwendet einen Flood-Fill-Algorithmus auf dem HTML5 Canvas. Wenn Sie auf einen Pixel klicken, identifiziert es die Farbe und entfernt alle verbundenen Pixel mit ahnlichen Farben durch Transparenz.' },
        { q: 'Wird mein Bild auf einen Server hochgeladen?', a: 'Nein. Die gesamte Verarbeitung erfolgt vollstandig in Ihrem Browser mit der Canvas API. Ihr Bild verlasst nie Ihr Gerat.' },
        { q: 'Was ist der Farbtoleranz-Regler?', a: 'Die Toleranz steuert, wie ahnlich ein Pixel der angeklickten Farbe sein muss, um entfernt zu werden. Niedrige Toleranz entfernt nur fast identische Farben, hohe Toleranz einen breiteren Bereich.' },
        { q: 'Welche Bildformate werden unterstutzt?', a: 'Sie konnen JPG, PNG und WebP Bilder hochladen. Die Ausgabe ist immer eine PNG-Datei mit Transparenzunterstutzung.' },
        { q: 'Kann ich mehrere Hintergrundfarben entfernen?', a: 'Ja! Klicken Sie auf verschiedene Bereiche des Hintergrunds, um mehrere Farben zu entfernen. Verwenden Sie die Ruckgangig-Taste, wenn Sie versehentlich einen Teil des Motivs entfernen.' },
      ],
    },
    pt: {
      title: 'Removedor de Fundo: Remova Fundos de Imagens Online Gratis',
      paragraphs: [
        'Remover fundos de imagens e uma das tarefas mais comuns na edicao de fotos e design grafico. Nosso removedor de fundos online gratuito usa tecnologia avancada de preenchimento por inundacao baseada em canvas para tornar qualquer fundo transparente com um unico clique. Sem necessidade de instalacao: tudo funciona diretamente no seu navegador.',
        'A ferramenta funciona analisando a cor em que voce clica e removendo todos os pixels conectados com cor similar. O controle de tolerancia de cor permite ajustar com precisao a agressividade da remocao. Baixa tolerancia remove apenas correspondencias exatas, enquanto alta tolerancia captura variacoes sutis em gradientes e sombras.',
        'Diferente dos removedores baseados em IA que exigem upload para um servidor, esta ferramenta processa tudo localmente no seu navegador usando a API Canvas HTML5. Suas imagens nunca saem do seu dispositivo, garantindo privacidade completa.',
        'A funcao desfazer permite reverter qualquer passo e o botao redefinir restaura a imagem original. Baixe sua imagem como arquivo PNG com suporte completo a transparencia. Perfeito para fotos de produtos, imagens de perfil, adesivos, logos e qualquer projeto de design.',
      ],
      faq: [
        { q: 'Como funciona o removedor de fundo?', a: 'A ferramenta usa um algoritmo de preenchimento por inundacao no Canvas HTML5. Ao clicar em um pixel, identifica a cor e remove todos os pixels conectados com cores similares tornando-os transparentes.' },
        { q: 'Minha imagem e enviada para algum servidor?', a: 'Nao. Todo o processamento acontece completamente no seu navegador usando a API Canvas. Sua imagem nunca sai do seu dispositivo.' },
        { q: 'O que e o controle de tolerancia de cor?', a: 'A tolerancia controla quao similar um pixel deve ser a cor clicada para ser removido. Baixa tolerancia remove apenas cores quase identicas, alta tolerancia remove uma gama mais ampla.' },
        { q: 'Quais formatos de imagem sao suportados?', a: 'Voce pode carregar imagens JPG, PNG e WebP. A saida e sempre um arquivo PNG com suporte a transparencia.' },
        { q: 'Posso remover multiplas cores de fundo?', a: 'Sim! Clique em diferentes areas do fundo para remover multiplas cores. Use o botao desfazer se remover acidentalmente parte do sujeito.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="background-remover" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Upload area */}
          {!originalImage && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => document.getElementById('bg-file-input')?.click()}
            >
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600 font-medium">{t('dragDrop')}</p>
              <p className="text-gray-400 text-sm mt-1">{t('formats')}</p>
              <input
                id="bg-file-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                }}
              />
            </div>
          )}

          {/* Controls */}
          {originalImage && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('tolerance')}: {tolerance}
                </label>
                <input
                  type="range"
                  min="1"
                  max="150"
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1</span>
                  <span>150</span>
                </div>
              </div>

              <p className="text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                {processing ? t('processing') : t('clickToRemove')}
              </p>

              {/* Canvas area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{t('result')}</p>
                  <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ background: 'repeating-conic-gradient(#e5e7eb 0% 25%, #fff 0% 50%) 0 0 / 20px 20px' }}>
                    <canvas
                      ref={canvasRef}
                      onClick={handleCanvasClick}
                      className="w-full cursor-crosshair"
                      style={{ display: originalImage ? 'block' : 'none' }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{t('original')}</p>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <canvas ref={previewRef} className="w-full" style={{ display: originalImage ? 'block' : 'none' }} />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t('undo')}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t('reset')}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('download')}
                </button>
                <button
                  onClick={() => {
                    setOriginalImage(null);
                    setHistory([]);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors ml-auto"
                >
                  {t('upload')}
                </button>
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
