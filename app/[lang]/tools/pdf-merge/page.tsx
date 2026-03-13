'use client';
import { useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface ImageFile {
  id: string;
  file: File;
  name: string;
  preview: string;
  size: number;
}

const labels: Record<string, Record<Locale, string>> = {
  upload: { en: 'Add Images', it: 'Aggiungi Immagini', es: 'Agregar Imagenes', fr: 'Ajouter des Images', de: 'Bilder Hinzufugen', pt: 'Adicionar Imagens' },
  dragDrop: { en: 'Drag & drop images or click to upload', it: 'Trascina immagini o clicca per caricare', es: 'Arrastra imagenes o haz clic para subir', fr: 'Glissez des images ou cliquez pour charger', de: 'Bilder ziehen oder klicken zum Hochladen', pt: 'Arraste imagens ou clique para carregar' },
  formats: { en: 'Supports JPG, PNG, WebP', it: 'Supporta JPG, PNG, WebP', es: 'Soporta JPG, PNG, WebP', fr: 'Supporte JPG, PNG, WebP', de: 'Unterstutzt JPG, PNG, WebP', pt: 'Suporta JPG, PNG, WebP' },
  merge: { en: 'Merge to PDF', it: 'Unisci in PDF', es: 'Unir en PDF', fr: 'Fusionner en PDF', de: 'Zu PDF Zusammenfugen', pt: 'Unir em PDF' },
  merging: { en: 'Merging...', it: 'Unendo...', es: 'Uniendo...', fr: 'Fusion...', de: 'Zusammenfugen...', pt: 'Unindo...' },
  remove: { en: 'Remove', it: 'Rimuovi', es: 'Eliminar', fr: 'Supprimer', de: 'Entfernen', pt: 'Remover' },
  moveUp: { en: 'Move Up', it: 'Sposta Su', es: 'Mover Arriba', fr: 'Monter', de: 'Nach Oben', pt: 'Mover Acima' },
  moveDown: { en: 'Move Down', it: 'Sposta Giu', es: 'Mover Abajo', fr: 'Descendre', de: 'Nach Unten', pt: 'Mover Abaixo' },
  clearAll: { en: 'Clear All', it: 'Cancella Tutto', es: 'Borrar Todo', fr: 'Tout Effacer', de: 'Alles Loschen', pt: 'Limpar Tudo' },
  images: { en: 'images', it: 'immagini', es: 'imagenes', fr: 'images', de: 'Bilder', pt: 'imagens' },
  page: { en: 'Page', it: 'Pagina', es: 'Pagina', fr: 'Page', de: 'Seite', pt: 'Pagina' },
  orientation: { en: 'Page Orientation', it: 'Orientamento Pagina', es: 'Orientacion', fr: 'Orientation', de: 'Ausrichtung', pt: 'Orientacao' },
  auto: { en: 'Auto (fit image)', it: 'Auto (adatta immagine)', es: 'Auto (ajustar imagen)', fr: 'Auto (ajuster image)', de: 'Auto (Bild anpassen)', pt: 'Auto (ajustar imagem)' },
  portrait: { en: 'Portrait', it: 'Verticale', es: 'Vertical', fr: 'Portrait', de: 'Hochformat', pt: 'Retrato' },
  landscape: { en: 'Landscape', it: 'Orizzontale', es: 'Horizontal', fr: 'Paysage', de: 'Querformat', pt: 'Paisagem' },
  addMore: { en: 'Add More', it: 'Aggiungi Altre', es: 'Agregar Mas', fr: 'Ajouter Plus', de: 'Mehr Hinzufugen', pt: 'Adicionar Mais' },
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function PdfMerge() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['pdf-merge'][lang];
  const t = useCallback((key: string) => labels[key]?.[lang] ?? labels[key]?.en ?? key, [lang]);

  const [images, setImages] = useState<ImageFile[]>([]);
  const [orientation, setOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto');
  const [merging, setMerging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImages = useCallback((files: FileList | File[]) => {
    const newImages: ImageFile[] = [];
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const id = Math.random().toString(36).substring(2, 9);
      const preview = URL.createObjectURL(file);
      newImages.push({ id, file, name: file.name, preview, size: file.size });
    });
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const moveImage = useCallback((index: number, direction: 'up' | 'down') => {
    setImages((prev) => {
      const arr = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= arr.length) return arr;
      [arr[index], arr[targetIndex]] = [arr[targetIndex], arr[index]];
      return arr;
    });
  }, []);

  const handleMerge = useCallback(async () => {
    if (images.length === 0) return;
    setMerging(true);

    try {
      const { jsPDF } = await import('jspdf');

      // Load all images first
      const loadedImages: { img: HTMLImageElement; width: number; height: number }[] = [];
      for (const imageFile of images) {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const i = new Image();
          i.onload = () => resolve(i);
          i.onerror = reject;
          i.src = imageFile.preview;
        });
        loadedImages.push({ img, width: img.naturalWidth, height: img.naturalHeight });
      }

      // Create PDF with first image dimensions
      const first = loadedImages[0];
      const getOrientation = (w: number, h: number): 'p' | 'l' => {
        if (orientation === 'portrait') return 'p';
        if (orientation === 'landscape') return 'l';
        return w > h ? 'l' : 'p';
      };

      const firstOrientation = getOrientation(first.width, first.height);
      const pdf = new jsPDF({
        orientation: firstOrientation,
        unit: 'px',
        format: [first.width, first.height],
      });

      // Helper to draw image on canvas and get data URL
      const getImageDataUrl = (img: HTMLImageElement): string => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.92);
      };

      for (let i = 0; i < loadedImages.length; i++) {
        const { img, width, height } = loadedImages[i];
        const orient = getOrientation(width, height);

        if (i > 0) {
          pdf.addPage([width, height], orient);
        }

        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();

        // Scale image to fit page
        const scaleX = pageW / width;
        const scaleY = pageH / height;
        const scale = Math.min(scaleX, scaleY);
        const drawW = width * scale;
        const drawH = height * scale;
        const offsetX = (pageW - drawW) / 2;
        const offsetY = (pageH - drawH) / 2;

        const dataUrl = getImageDataUrl(img);
        pdf.addImage(dataUrl, 'JPEG', offsetX, offsetY, drawW, drawH);
      }

      pdf.save('merged-images.pdf');
    } catch (err) {
      console.error('PDF merge error:', err);
    } finally {
      setMerging(false);
    }
  }, [images, orientation]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    addImages(e.dataTransfer.files);
  }, [addImages]);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Images to PDF Merger: Combine Multiple Images into One PDF',
      paragraphs: [
        'Converting multiple images into a single PDF document is essential for creating presentations, portfolios, reports, and organized document packages. Our free online Images to PDF Merger lets you upload multiple JPG, PNG, or WebP images and combine them into one professional PDF file with each image on its own page.',
        'The tool provides an intuitive drag-and-drop interface where you can easily reorder your images before merging. Move images up or down in the list to arrange pages exactly how you want them. The auto orientation feature automatically detects whether each image is portrait or landscape and adjusts the PDF page accordingly, ensuring your images are displayed at their best quality.',
        'All processing happens entirely in your browser using the jsPDF library. Your images are never uploaded to any server, giving you complete privacy and security. The tool handles images of different sizes and orientations seamlessly, creating a well-formatted PDF where each page matches its corresponding image dimensions.',
        'Whether you need to compile scanned documents, create a photo album PDF, prepare presentation slides, or package multiple screenshots into a single file, this tool handles it efficiently. The resulting PDF maintains high image quality while keeping file sizes reasonable for sharing via email or messaging apps.',
      ],
      faq: [
        { q: 'What image formats can I use?', a: 'The tool supports JPG/JPEG, PNG, and WebP image formats. All common image types from cameras, screenshots, and design tools are supported.' },
        { q: 'Is there a limit on the number of images?', a: 'There is no hard limit. You can add as many images as your browser memory allows. For best performance, we recommend keeping it under 50 images per batch.' },
        { q: 'Are my images uploaded to a server?', a: 'No. All processing happens locally in your browser using the jsPDF library. Your images never leave your device, ensuring complete privacy.' },
        { q: 'Can I change the page order?', a: 'Yes! Use the Move Up and Move Down buttons to reorder images before merging. Each image becomes one page in the final PDF, in the order shown.' },
        { q: 'What does the Auto orientation option do?', a: 'Auto orientation automatically sets each PDF page to portrait or landscape based on the image dimensions. Wide images get landscape pages, tall images get portrait pages. You can also force all pages to portrait or landscape.' },
      ],
    },
    it: {
      title: 'Unisci Immagini in PDF: Combina Piu Immagini in un Unico PDF',
      paragraphs: [
        'Convertire piu immagini in un singolo documento PDF e essenziale per creare presentazioni, portfolio, report e pacchetti di documenti organizzati. Il nostro strumento gratuito online per unire immagini in PDF ti permette di caricare piu immagini JPG, PNG o WebP e combinarle in un unico file PDF professionale con ogni immagine sulla propria pagina.',
        'Lo strumento offre un\'interfaccia intuitiva drag-and-drop dove puoi facilmente riordinare le immagini prima dell\'unione. Sposta le immagini su o giu nella lista per disporre le pagine esattamente come le desideri. La funzione di orientamento automatico rileva se ogni immagine e verticale o orizzontale e regola la pagina PDF di conseguenza.',
        'Tutta l\'elaborazione avviene interamente nel tuo browser usando la libreria jsPDF. Le tue immagini non vengono mai caricate su alcun server, garantendo privacy e sicurezza complete. Lo strumento gestisce immagini di diverse dimensioni e orientamenti in modo fluido.',
        'Che tu debba compilare documenti scansionati, creare un album fotografico PDF, preparare slide per presentazioni o raccogliere screenshot multipli in un unico file, questo strumento lo gestisce in modo efficiente. Il PDF risultante mantiene alta qualita delle immagini con dimensioni file ragionevoli.',
      ],
      faq: [
        { q: 'Quali formati immagine posso usare?', a: 'Lo strumento supporta formati JPG/JPEG, PNG e WebP. Tutti i tipi di immagine comuni da fotocamere, screenshot e strumenti di design sono supportati.' },
        { q: 'C\'e un limite al numero di immagini?', a: 'Non c\'e un limite rigido. Puoi aggiungere quante immagini la memoria del browser consente. Per prestazioni ottimali, raccomandiamo un massimo di 50 immagini per volta.' },
        { q: 'Le mie immagini vengono caricate su un server?', a: 'No. Tutta l\'elaborazione avviene localmente nel tuo browser usando la libreria jsPDF. Le tue immagini non lasciano mai il dispositivo.' },
        { q: 'Posso cambiare l\'ordine delle pagine?', a: 'Si! Usa i pulsanti Sposta Su e Sposta Giu per riordinare le immagini prima dell\'unione. Ogni immagine diventa una pagina nel PDF finale.' },
        { q: 'Cosa fa l\'opzione orientamento automatico?', a: 'L\'orientamento automatico imposta ogni pagina PDF in verticale o orizzontale in base alle dimensioni dell\'immagine. Immagini larghe ottengono pagine orizzontali, immagini alte ottengono pagine verticali.' },
      ],
    },
    es: {
      title: 'Unir Imagenes en PDF: Combina Multiples Imagenes en un Solo PDF',
      paragraphs: [
        'Convertir multiples imagenes en un unico documento PDF es esencial para crear presentaciones, portfolios, informes y paquetes de documentos organizados. Nuestra herramienta gratuita online para unir imagenes en PDF te permite subir multiples imagenes JPG, PNG o WebP y combinarlas en un archivo PDF profesional con cada imagen en su propia pagina.',
        'La herramienta ofrece una interfaz intuitiva de arrastrar y soltar donde puedes reordenar facilmente las imagenes antes de la fusion. Mueve las imagenes arriba o abajo en la lista para ordenar las paginas exactamente como las deseas. La funcion de orientacion automatica detecta si cada imagen es vertical u horizontal.',
        'Todo el procesamiento ocurre completamente en tu navegador usando la libreria jsPDF. Tus imagenes nunca se suben a ningun servidor, garantizando privacidad y seguridad completas. La herramienta maneja imagenes de diferentes tamanos y orientaciones sin problemas.',
        'Ya sea que necesites compilar documentos escaneados, crear un album de fotos PDF, preparar diapositivas de presentacion o empaquetar multiples capturas de pantalla en un solo archivo, esta herramienta lo maneja eficientemente.',
      ],
      faq: [
        { q: 'Que formatos de imagen puedo usar?', a: 'La herramienta soporta formatos JPG/JPEG, PNG y WebP. Todos los tipos de imagen comunes son compatibles.' },
        { q: 'Hay un limite en el numero de imagenes?', a: 'No hay un limite estricto. Puedes agregar tantas imagenes como la memoria del navegador permita. Recomendamos un maximo de 50 imagenes por lote.' },
        { q: 'Mis imagenes se suben a un servidor?', a: 'No. Todo el procesamiento ocurre localmente en tu navegador. Tus imagenes nunca salen de tu dispositivo.' },
        { q: 'Puedo cambiar el orden de las paginas?', a: 'Si! Usa los botones Mover Arriba y Mover Abajo para reordenar las imagenes antes de la fusion.' },
        { q: 'Que hace la opcion de orientacion automatica?', a: 'La orientacion automatica establece cada pagina PDF en vertical u horizontal segun las dimensiones de la imagen.' },
      ],
    },
    fr: {
      title: 'Fusionneur d\'Images en PDF : Combinez Plusieurs Images en un Seul PDF',
      paragraphs: [
        'Convertir plusieurs images en un seul document PDF est essentiel pour creer des presentations, des portfolios, des rapports et des packages de documents organises. Notre outil gratuit en ligne pour fusionner des images en PDF vous permet de charger plusieurs images JPG, PNG ou WebP et de les combiner en un fichier PDF professionnel avec chaque image sur sa propre page.',
        'L\'outil offre une interface intuitive de glisser-deposer ou vous pouvez facilement reordonner vos images avant la fusion. Deplacez les images vers le haut ou le bas dans la liste pour organiser les pages exactement comme vous le souhaitez. La fonction d\'orientation automatique detecte si chaque image est en portrait ou paysage.',
        'Tout le traitement se fait entierement dans votre navigateur en utilisant la librairie jsPDF. Vos images ne sont jamais envoyees sur un serveur, garantissant une confidentialite et une securite completes. L\'outil gere des images de differentes tailles et orientations de maniere fluide.',
        'Que vous ayez besoin de compiler des documents scannes, de creer un album photo PDF, de preparer des diapositives de presentation ou de regrouper plusieurs captures d\'ecran en un seul fichier, cet outil le gere efficacement.',
      ],
      faq: [
        { q: 'Quels formats d\'image puis-je utiliser ?', a: 'L\'outil supporte les formats JPG/JPEG, PNG et WebP. Tous les types d\'image courants sont pris en charge.' },
        { q: 'Y a-t-il une limite au nombre d\'images ?', a: 'Il n\'y a pas de limite stricte. Vous pouvez ajouter autant d\'images que la memoire du navigateur le permet. Nous recommandons un maximum de 50 images par lot.' },
        { q: 'Mes images sont-elles envoyees sur un serveur ?', a: 'Non. Tout le traitement se fait localement dans votre navigateur. Vos images ne quittent jamais votre appareil.' },
        { q: 'Puis-je changer l\'ordre des pages ?', a: 'Oui ! Utilisez les boutons Monter et Descendre pour reordonner les images avant la fusion.' },
        { q: 'Que fait l\'option d\'orientation automatique ?', a: 'L\'orientation automatique definit chaque page PDF en portrait ou paysage selon les dimensions de l\'image.' },
      ],
    },
    de: {
      title: 'Bilder zu PDF Zusammenfugen: Mehrere Bilder in ein PDF Kombinieren',
      paragraphs: [
        'Das Konvertieren mehrerer Bilder in ein einzelnes PDF-Dokument ist unerlasslich fur die Erstellung von Prasentationen, Portfolios, Berichten und organisierten Dokumentenpaketen. Unser kostenloses Online-Tool zum Zusammenfugen von Bildern zu PDF ermoglicht es Ihnen, mehrere JPG-, PNG- oder WebP-Bilder hochzuladen und sie in eine professionelle PDF-Datei mit jedem Bild auf einer eigenen Seite zu kombinieren.',
        'Das Tool bietet eine intuitive Drag-and-Drop-Oberflache, in der Sie Ihre Bilder vor dem Zusammenfugen einfach neu anordnen konnen. Verschieben Sie Bilder in der Liste nach oben oder unten, um die Seiten genau nach Ihren Wunschen anzuordnen. Die automatische Ausrichtungsfunktion erkennt, ob jedes Bild im Hoch- oder Querformat vorliegt.',
        'Die gesamte Verarbeitung erfolgt vollstandig in Ihrem Browser mit der jsPDF-Bibliothek. Ihre Bilder werden nie auf einen Server hochgeladen, was vollstandige Privatsphare und Sicherheit gewahrleistet. Das Tool verarbeitet Bilder verschiedener Grossen und Ausrichtungen nahtlos.',
        'Ob Sie gescannte Dokumente zusammenstellen, ein Fotoalbum-PDF erstellen, Prasentationsfolien vorbereiten oder mehrere Screenshots in einer einzigen Datei bundeln mochten, dieses Tool erledigt es effizient.',
      ],
      faq: [
        { q: 'Welche Bildformate kann ich verwenden?', a: 'Das Tool unterstutzt JPG/JPEG, PNG und WebP Formate. Alle gangigen Bildtypen werden unterstutzt.' },
        { q: 'Gibt es eine Begrenzung fur die Anzahl der Bilder?', a: 'Es gibt keine feste Grenze. Sie konnen so viele Bilder hinzufugen, wie der Browserspeicher erlaubt. Wir empfehlen maximal 50 Bilder pro Vorgang.' },
        { q: 'Werden meine Bilder auf einen Server hochgeladen?', a: 'Nein. Die gesamte Verarbeitung erfolgt lokal in Ihrem Browser. Ihre Bilder verlassen nie Ihr Gerat.' },
        { q: 'Kann ich die Seitenreihenfolge andern?', a: 'Ja! Verwenden Sie die Buttons Nach Oben und Nach Unten, um die Bilder vor dem Zusammenfugen neu anzuordnen.' },
        { q: 'Was macht die automatische Ausrichtungsoption?', a: 'Die automatische Ausrichtung stellt jede PDF-Seite basierend auf den Bildabmessungen auf Hoch- oder Querformat ein.' },
      ],
    },
    pt: {
      title: 'Unir Imagens em PDF: Combine Multiplas Imagens em um Unico PDF',
      paragraphs: [
        'Converter multiplas imagens em um unico documento PDF e essencial para criar apresentacoes, portfolios, relatorios e pacotes de documentos organizados. Nossa ferramenta gratuita online para unir imagens em PDF permite carregar multiplas imagens JPG, PNG ou WebP e combina-las em um arquivo PDF profissional com cada imagem em sua propria pagina.',
        'A ferramenta oferece uma interface intuitiva de arrastar e soltar onde voce pode facilmente reordenar suas imagens antes da fusao. Mova as imagens para cima ou para baixo na lista para organizar as paginas exatamente como deseja. A funcao de orientacao automatica detecta se cada imagem e retrato ou paisagem.',
        'Todo o processamento acontece completamente no seu navegador usando a biblioteca jsPDF. Suas imagens nunca sao enviadas para nenhum servidor, garantindo privacidade e seguranca completas. A ferramenta lida com imagens de diferentes tamanhos e orientacoes de forma fluida.',
        'Seja para compilar documentos digitalizados, criar um album de fotos PDF, preparar slides de apresentacao ou empacotar multiplas capturas de tela em um unico arquivo, esta ferramenta lida de forma eficiente.',
      ],
      faq: [
        { q: 'Quais formatos de imagem posso usar?', a: 'A ferramenta suporta formatos JPG/JPEG, PNG e WebP. Todos os tipos de imagem comuns sao compatíveis.' },
        { q: 'Ha um limite no numero de imagens?', a: 'Nao ha um limite rígido. Voce pode adicionar quantas imagens a memoria do navegador permitir. Recomendamos no maximo 50 imagens por vez.' },
        { q: 'Minhas imagens sao enviadas para um servidor?', a: 'Nao. Todo o processamento acontece localmente no seu navegador. Suas imagens nunca saem do seu dispositivo.' },
        { q: 'Posso mudar a ordem das paginas?', a: 'Sim! Use os botoes Mover Acima e Mover Abaixo para reordenar as imagens antes da fusao.' },
        { q: 'O que faz a opcao de orientacao automatica?', a: 'A orientacao automatica define cada pagina PDF em retrato ou paisagem com base nas dimensoes da imagem.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="pdf-merge" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Upload area */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
          >
            <svg className="mx-auto h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-600 font-medium">{t('dragDrop')}</p>
            <p className="text-gray-400 text-sm mt-1">{t('formats')}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addImages(e.target.files);
                e.target.value = '';
              }}
            />
          </div>

          {/* Orientation selector */}
          {images.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('orientation')}</label>
              <div className="flex gap-2">
                {(['auto', 'portrait', 'landscape'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setOrientation(opt)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      orientation === opt
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t(opt)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Image list */}
          {images.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  {images.length} {t('images')}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + {t('addMore')}
                  </button>
                  <button
                    onClick={() => {
                      images.forEach((i) => URL.revokeObjectURL(i.preview));
                      setImages([]);
                    }}
                    className="text-sm text-red-500 hover:text-red-600 font-medium"
                  >
                    {t('clearAll')}
                  </button>
                </div>
              </div>

              {images.map((img, index) => (
                <div key={img.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <img
                    src={img.preview}
                    alt={img.name}
                    className="w-16 h-16 object-cover rounded border border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{img.name}</p>
                    <p className="text-xs text-gray-500">{t('page')} {index + 1} &middot; {formatSize(img.size)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => moveImage(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      title={t('moveUp')}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button
                      onClick={() => moveImage(index, 'down')}
                      disabled={index === images.length - 1}
                      className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      title={t('moveDown')}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <button
                      onClick={() => removeImage(img.id)}
                      className="p-1.5 text-red-400 hover:text-red-600"
                      title={t('remove')}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Merge button */}
          {images.length > 0 && (
            <button
              onClick={handleMerge}
              disabled={merging}
              className="w-full py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {merging ? t('merging') : t('merge')}
            </button>
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
