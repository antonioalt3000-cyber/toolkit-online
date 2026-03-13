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
  originalSize: number;
  compressedSize: number | null;
}

const labels: Record<string, Record<Locale, string>> = {
  upload: { en: 'Upload Images', it: 'Carica Immagini', es: 'Subir Imagenes', fr: 'Charger des Images', de: 'Bilder Hochladen', pt: 'Carregar Imagens' },
  dragDrop: { en: 'Drag & drop images or click to upload', it: 'Trascina immagini o clicca per caricare', es: 'Arrastra imagenes o haz clic para subir', fr: 'Glissez des images ou cliquez pour charger', de: 'Bilder ziehen oder klicken zum Hochladen', pt: 'Arraste imagens ou clique para carregar' },
  formats: { en: 'Supports JPG, PNG, WebP', it: 'Supporta JPG, PNG, WebP', es: 'Soporta JPG, PNG, WebP', fr: 'Supporte JPG, PNG, WebP', de: 'Unterstutzt JPG, PNG, WebP', pt: 'Suporta JPG, PNG, WebP' },
  quality: { en: 'Compression Quality', it: 'Qualita Compressione', es: 'Calidad de Compresion', fr: 'Qualite de Compression', de: 'Komprimierungsqualitat', pt: 'Qualidade de Compressao' },
  low: { en: 'Low (smaller file)', it: 'Bassa (file piu piccolo)', es: 'Baja (archivo menor)', fr: 'Basse (fichier plus petit)', de: 'Niedrig (kleinere Datei)', pt: 'Baixa (arquivo menor)' },
  high: { en: 'High (better quality)', it: 'Alta (migliore qualita)', es: 'Alta (mejor calidad)', fr: 'Haute (meilleure qualite)', de: 'Hoch (bessere Qualitat)', pt: 'Alta (melhor qualidade)' },
  compress: { en: 'Compress & Download PDF', it: 'Comprimi e Scarica PDF', es: 'Comprimir y Descargar PDF', fr: 'Compresser et Telecharger PDF', de: 'Komprimieren und PDF Herunterladen', pt: 'Comprimir e Baixar PDF' },
  compressing: { en: 'Compressing...', it: 'Comprimendo...', es: 'Comprimiendo...', fr: 'Compression...', de: 'Komprimierung...', pt: 'Comprimindo...' },
  remove: { en: 'Remove', it: 'Rimuovi', es: 'Eliminar', fr: 'Supprimer', de: 'Entfernen', pt: 'Remover' },
  clearAll: { en: 'Clear All', it: 'Cancella Tutto', es: 'Borrar Todo', fr: 'Tout Effacer', de: 'Alles Loschen', pt: 'Limpar Tudo' },
  images: { en: 'images', it: 'immagini', es: 'imagenes', fr: 'images', de: 'Bilder', pt: 'imagens' },
  original: { en: 'Original', it: 'Originale', es: 'Original', fr: 'Original', de: 'Original', pt: 'Original' },
  compressed: { en: 'Compressed', it: 'Compresso', es: 'Comprimido', fr: 'Compresse', de: 'Komprimiert', pt: 'Comprimido' },
  totalOriginal: { en: 'Total Original Size', it: 'Dimensione Originale Totale', es: 'Tamano Original Total', fr: 'Taille Originale Totale', de: 'Originalgrosse Gesamt', pt: 'Tamanho Original Total' },
  pdfSize: { en: 'PDF Output Size', it: 'Dimensione PDF', es: 'Tamano del PDF', fr: 'Taille du PDF', de: 'PDF Grosse', pt: 'Tamanho do PDF' },
  savings: { en: 'Savings', it: 'Risparmio', es: 'Ahorro', fr: 'Economie', de: 'Ersparnis', pt: 'Economia' },
  addMore: { en: 'Add More', it: 'Aggiungi Altre', es: 'Agregar Mas', fr: 'Ajouter Plus', de: 'Mehr Hinzufugen', pt: 'Adicionar Mais' },
  done: { en: 'Done! PDF downloaded.', it: 'Fatto! PDF scaricato.', es: 'Listo! PDF descargado.', fr: 'Termine ! PDF telecharge.', de: 'Fertig! PDF heruntergeladen.', pt: 'Pronto! PDF baixado.' },
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function PdfCompress() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['pdf-compress'][lang];
  const t = useCallback((key: string) => labels[key]?.[lang] ?? labels[key]?.en ?? key, [lang]);

  const [images, setImages] = useState<ImageFile[]>([]);
  const [quality, setQuality] = useState(0.5);
  const [compressing, setCompressing] = useState(false);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImages = useCallback((files: FileList | File[]) => {
    const newImages: ImageFile[] = [];
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const id = Math.random().toString(36).substring(2, 9);
      const preview = URL.createObjectURL(file);
      newImages.push({ id, file, name: file.name, preview, originalSize: file.size, compressedSize: null });
    });
    setImages((prev) => [...prev, ...newImages]);
    setDone(false);
    setResultSize(null);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
    setDone(false);
    setResultSize(null);
  }, []);

  const handleCompress = useCallback(async () => {
    if (images.length === 0) return;
    setCompressing(true);
    setDone(false);

    try {
      const { jsPDF } = await import('jspdf');

      // Compress each image via canvas and collect data
      const compressedImages: { dataUrl: string; width: number; height: number; compressedSize: number }[] = [];

      for (const imageFile of images) {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const i = new Image();
          i.onload = () => resolve(i);
          i.onerror = reject;
          i.src = imageFile.preview;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        // Estimate compressed size from base64
        const base64Length = dataUrl.split(',')[1]?.length || 0;
        const compressedSize = Math.round((base64Length * 3) / 4);

        compressedImages.push({
          dataUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
          compressedSize,
        });
      }

      // Update images with compressed sizes
      setImages((prev) =>
        prev.map((img, idx) => ({
          ...img,
          compressedSize: compressedImages[idx]?.compressedSize ?? null,
        }))
      );

      // Create PDF
      const first = compressedImages[0];
      const getOrientation = (w: number, h: number): 'p' | 'l' => (w > h ? 'l' : 'p');

      const pdf = new jsPDF({
        orientation: getOrientation(first.width, first.height),
        unit: 'px',
        format: [first.width, first.height],
        compress: true,
      });

      for (let i = 0; i < compressedImages.length; i++) {
        const { dataUrl, width, height } = compressedImages[i];

        if (i > 0) {
          pdf.addPage([width, height], getOrientation(width, height));
        }

        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const scaleX = pageW / width;
        const scaleY = pageH / height;
        const scale = Math.min(scaleX, scaleY);
        const drawW = width * scale;
        const drawH = height * scale;
        const offsetX = (pageW - drawW) / 2;
        const offsetY = (pageH - drawH) / 2;

        pdf.addImage(dataUrl, 'JPEG', offsetX, offsetY, drawW, drawH);
      }

      const pdfBlob = pdf.output('blob');
      setResultSize(pdfBlob.size);

      // Download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'compressed-images.pdf';
      link.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      console.error('PDF compress error:', err);
    } finally {
      setCompressing(false);
    }
  }, [images, quality]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    addImages(e.dataTransfer.files);
  }, [addImages]);

  const totalOriginal = images.reduce((sum, img) => sum + img.originalSize, 0);
  const savingsPercent = resultSize && totalOriginal > 0
    ? Math.round(((totalOriginal - resultSize) / totalOriginal) * 100)
    : null;

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Image Compressor to PDF: Compress Images and Export as Compact PDF',
      paragraphs: [
        'Large image files can be challenging to share and store, especially when dealing with multiple photos or scanned documents. Our free online Image Compressor to PDF tool lets you upload multiple images, adjust the compression quality, and export them as a single compact PDF file. This is perfect for reducing file sizes while maintaining a professional document format.',
        'The compression works by re-encoding your images through the HTML5 Canvas API at your chosen quality level. The quality slider ranges from 0.1 (maximum compression, smallest file) to 1.0 (minimal compression, best quality). For most use cases, a quality setting between 0.4 and 0.6 offers an excellent balance between file size reduction and visual quality.',
        'The tool shows you detailed size information for each image: the original file size and the compressed size after processing. After generating the PDF, you can see the total original size versus the PDF output size, along with the percentage of space saved. This transparency helps you find the optimal quality setting for your specific needs.',
        'All processing happens entirely in your browser using the Canvas API and jsPDF library. Your images are never uploaded to any server, ensuring complete privacy. The tool is ideal for compressing scanned documents, reducing photo collection sizes for email attachments, creating lightweight PDF reports with embedded images, and archiving photos in a space-efficient format.',
      ],
      faq: [
        { q: 'How does the image compression work?', a: 'Images are re-encoded through the HTML5 Canvas API as JPEG at your chosen quality level. Lower quality means more compression and smaller files, while higher quality preserves more detail. The compressed images are then combined into a PDF using jsPDF.' },
        { q: 'What quality setting should I use?', a: 'For general documents and photos, 0.4-0.6 offers a good balance. For text-heavy scanned documents, 0.3-0.5 works well. For photos where quality is important, use 0.7-0.9. Preview the results and adjust as needed.' },
        { q: 'Are my images uploaded to a server?', a: 'No. All compression and PDF generation happens locally in your browser. Your images never leave your device, ensuring complete privacy and security.' },
        { q: 'What is the maximum file size I can compress?', a: 'There is no server-side limit since processing happens in your browser. The practical limit depends on your device memory. Most modern devices can handle dozens of high-resolution images without issues.' },
        { q: 'Can I compress already compressed images further?', a: 'Yes, but with diminishing returns. Re-compressing an already compressed JPEG will reduce file size further but may introduce visible artifacts. For best results, start with the original uncompressed images when possible.' },
      ],
    },
    it: {
      title: 'Compressore Immagini in PDF: Comprimi Immagini ed Esporta come PDF Compatto',
      paragraphs: [
        'File immagine di grandi dimensioni possono essere difficili da condividere e archiviare, specialmente quando si lavora con molteplici foto o documenti scansionati. Il nostro strumento gratuito online Compressore Immagini in PDF ti permette di caricare piu immagini, regolare la qualita di compressione ed esportarle come un singolo file PDF compatto.',
        'La compressione funziona ri-codificando le immagini attraverso l\'API Canvas HTML5 al livello di qualita scelto. Il cursore qualita va da 0.1 (compressione massima, file piu piccolo) a 1.0 (compressione minima, migliore qualita). Per la maggior parte degli usi, un\'impostazione tra 0.4 e 0.6 offre un eccellente equilibrio tra riduzione dimensioni e qualita visiva.',
        'Lo strumento mostra informazioni dettagliate sulle dimensioni per ogni immagine: la dimensione originale e quella compressa dopo l\'elaborazione. Dopo aver generato il PDF, puoi vedere la dimensione totale originale rispetto alla dimensione del PDF, insieme alla percentuale di spazio risparmiato.',
        'Tutta l\'elaborazione avviene interamente nel tuo browser usando l\'API Canvas e la libreria jsPDF. Le tue immagini non vengono mai caricate su alcun server. Lo strumento e ideale per comprimere documenti scansionati, ridurre le dimensioni di collezioni foto per allegati email e creare report PDF leggeri.',
      ],
      faq: [
        { q: 'Come funziona la compressione delle immagini?', a: 'Le immagini vengono ri-codificate attraverso l\'API Canvas HTML5 come JPEG al livello di qualita scelto. Qualita inferiore significa piu compressione e file piu piccoli, mentre qualita superiore preserva piu dettagli.' },
        { q: 'Quale impostazione di qualita dovrei usare?', a: 'Per documenti e foto generali, 0.4-0.6 offre un buon equilibrio. Per documenti scansionati con molto testo, 0.3-0.5 funziona bene. Per foto dove la qualita e importante, usa 0.7-0.9.' },
        { q: 'Le mie immagini vengono caricate su un server?', a: 'No. Tutta la compressione e generazione PDF avviene localmente nel tuo browser. Le tue immagini non lasciano mai il dispositivo.' },
        { q: 'Qual e la dimensione massima del file che posso comprimere?', a: 'Non c\'e un limite lato server poiche l\'elaborazione avviene nel browser. Il limite pratico dipende dalla memoria del tuo dispositivo.' },
        { q: 'Posso comprimere ulteriormente immagini gia compresse?', a: 'Si, ma con risultati decrescenti. Ri-comprimere un JPEG gia compresso ridurra ulteriormente le dimensioni ma potrebbe introdurre artefatti visibili.' },
      ],
    },
    es: {
      title: 'Compresor de Imagenes a PDF: Comprime Imagenes y Exporta como PDF Compacto',
      paragraphs: [
        'Archivos de imagen grandes pueden ser dificiles de compartir y almacenar, especialmente al trabajar con multiples fotos o documentos escaneados. Nuestra herramienta gratuita online Compresor de Imagenes a PDF te permite subir multiples imagenes, ajustar la calidad de compresion y exportarlas como un unico archivo PDF compacto.',
        'La compresion funciona re-codificando tus imagenes a traves de la API Canvas HTML5 al nivel de calidad elegido. El control de calidad va desde 0.1 (compresion maxima, archivo mas pequeno) hasta 1.0 (compresion minima, mejor calidad). Para la mayoria de los usos, una configuracion entre 0.4 y 0.6 ofrece un excelente equilibrio.',
        'La herramienta muestra informacion detallada de tamano para cada imagen: el tamano original y el tamano comprimido despues del procesamiento. Despues de generar el PDF, puedes ver el tamano total original versus el tamano del PDF, junto con el porcentaje de espacio ahorrado.',
        'Todo el procesamiento ocurre completamente en tu navegador usando la API Canvas y la libreria jsPDF. Tus imagenes nunca se suben a ningun servidor. La herramienta es ideal para comprimir documentos escaneados, reducir tamanos de colecciones de fotos y crear reportes PDF ligeros.',
      ],
      faq: [
        { q: 'Como funciona la compresion de imagenes?', a: 'Las imagenes se re-codifican a traves de la API Canvas HTML5 como JPEG al nivel de calidad elegido. Menor calidad significa mas compresion y archivos mas pequenos.' },
        { q: 'Que configuracion de calidad debo usar?', a: 'Para documentos y fotos generales, 0.4-0.6 ofrece un buen equilibrio. Para documentos escaneados con mucho texto, 0.3-0.5 funciona bien. Para fotos importantes, usa 0.7-0.9.' },
        { q: 'Mis imagenes se suben a un servidor?', a: 'No. Toda la compresion y generacion de PDF ocurre localmente en tu navegador. Tus imagenes nunca salen de tu dispositivo.' },
        { q: 'Cual es el tamano maximo de archivo que puedo comprimir?', a: 'No hay limite del lado del servidor ya que el procesamiento ocurre en tu navegador. El limite practico depende de la memoria de tu dispositivo.' },
        { q: 'Puedo comprimir mas imagenes ya comprimidas?', a: 'Si, pero con resultados decrecientes. Re-comprimir un JPEG ya comprimido reducira el tamano pero podria introducir artefactos visibles.' },
      ],
    },
    fr: {
      title: 'Compresseur d\'Images en PDF : Compressez et Exportez en PDF Compact',
      paragraphs: [
        'Les fichiers image volumineux peuvent etre difficiles a partager et a stocker, surtout lorsqu\'on travaille avec de multiples photos ou documents numerises. Notre outil gratuit en ligne Compresseur d\'Images en PDF vous permet de charger plusieurs images, d\'ajuster la qualite de compression et de les exporter en un seul fichier PDF compact.',
        'La compression fonctionne en re-encodant vos images via l\'API Canvas HTML5 au niveau de qualite choisi. Le curseur de qualite va de 0.1 (compression maximale, fichier le plus petit) a 1.0 (compression minimale, meilleure qualite). Pour la plupart des usages, un reglage entre 0.4 et 0.6 offre un excellent equilibre.',
        'L\'outil affiche des informations detaillees sur la taille de chaque image : la taille originale et la taille compressee apres traitement. Apres avoir genere le PDF, vous pouvez voir la taille totale originale par rapport a la taille du PDF, avec le pourcentage d\'espace economise.',
        'Tout le traitement se fait entierement dans votre navigateur en utilisant l\'API Canvas et la librairie jsPDF. Vos images ne sont jamais envoyees sur un serveur. L\'outil est ideal pour compresser des documents numerises et creer des rapports PDF legers.',
      ],
      faq: [
        { q: 'Comment fonctionne la compression d\'images ?', a: 'Les images sont re-encodees via l\'API Canvas HTML5 en JPEG au niveau de qualite choisi. Une qualite inferieure signifie plus de compression et des fichiers plus petits.' },
        { q: 'Quel reglage de qualite dois-je utiliser ?', a: 'Pour les documents et photos generaux, 0.4-0.6 offre un bon equilibre. Pour les documents numerises avec beaucoup de texte, 0.3-0.5 fonctionne bien. Pour les photos importantes, utilisez 0.7-0.9.' },
        { q: 'Mes images sont-elles envoyees sur un serveur ?', a: 'Non. Toute la compression et la generation de PDF se fait localement dans votre navigateur. Vos images ne quittent jamais votre appareil.' },
        { q: 'Quelle est la taille maximale de fichier que je peux compresser ?', a: 'Il n\'y a pas de limite cote serveur car le traitement se fait dans votre navigateur. La limite pratique depend de la memoire de votre appareil.' },
        { q: 'Puis-je compresser davantage des images deja compressees ?', a: 'Oui, mais avec des resultats decroissants. Re-compresser un JPEG deja compresse reduira la taille mais pourrait introduire des artefacts visibles.' },
      ],
    },
    de: {
      title: 'Bildkompressor zu PDF: Bilder Komprimieren und als Kompaktes PDF Exportieren',
      paragraphs: [
        'Grosse Bilddateien konnen schwierig zu teilen und zu speichern sein, besonders bei mehreren Fotos oder gescannten Dokumenten. Unser kostenloses Online-Tool Bildkompressor zu PDF ermoglicht es Ihnen, mehrere Bilder hochzuladen, die Komprimierungsqualitat anzupassen und sie als einzelne kompakte PDF-Datei zu exportieren.',
        'Die Komprimierung funktioniert durch Neucodierung Ihrer Bilder uber die HTML5 Canvas API auf dem gewahlten Qualitatsniveau. Der Qualitatsregler reicht von 0.1 (maximale Komprimierung, kleinste Datei) bis 1.0 (minimale Komprimierung, beste Qualitat). Fur die meisten Anwendungsfalle bietet eine Einstellung zwischen 0.4 und 0.6 eine ausgezeichnete Balance.',
        'Das Tool zeigt detaillierte Grosseninformationen fur jedes Bild: die Originalgrosse und die komprimierte Grosse nach der Verarbeitung. Nach der PDF-Erstellung sehen Sie die gesamte Originalgrosse im Vergleich zur PDF-Ausgabegrosse sowie den Prozentsatz des eingesparten Speicherplatzes.',
        'Die gesamte Verarbeitung erfolgt vollstandig in Ihrem Browser mit der Canvas API und der jsPDF-Bibliothek. Ihre Bilder werden nie auf einen Server hochgeladen. Das Tool ist ideal fur die Komprimierung gescannter Dokumente und die Erstellung leichtgewichtiger PDF-Berichte.',
      ],
      faq: [
        { q: 'Wie funktioniert die Bildkomprimierung?', a: 'Bilder werden uber die HTML5 Canvas API als JPEG auf dem gewahlten Qualitatsniveau neu codiert. Niedrigere Qualitat bedeutet mehr Komprimierung und kleinere Dateien.' },
        { q: 'Welche Qualitatseinstellung sollte ich verwenden?', a: 'Fur allgemeine Dokumente und Fotos bietet 0.4-0.6 eine gute Balance. Fur gescannte Textdokumente funktioniert 0.3-0.5 gut. Fur wichtige Fotos verwenden Sie 0.7-0.9.' },
        { q: 'Werden meine Bilder auf einen Server hochgeladen?', a: 'Nein. Die gesamte Komprimierung und PDF-Erstellung erfolgt lokal in Ihrem Browser. Ihre Bilder verlassen nie Ihr Gerat.' },
        { q: 'Was ist die maximale Dateigrosse, die ich komprimieren kann?', a: 'Es gibt keine serverseitige Begrenzung, da die Verarbeitung in Ihrem Browser erfolgt. Die praktische Grenze hangt vom Gerat-Speicher ab.' },
        { q: 'Kann ich bereits komprimierte Bilder weiter komprimieren?', a: 'Ja, aber mit abnehmenden Ergebnissen. Die erneute Komprimierung eines bereits komprimierten JPEG reduziert die Grosse, kann aber sichtbare Artefakte einfuhren.' },
      ],
    },
    pt: {
      title: 'Compressor de Imagens para PDF: Comprima Imagens e Exporte como PDF Compacto',
      paragraphs: [
        'Arquivos de imagem grandes podem ser dificeis de compartilhar e armazenar, especialmente ao trabalhar com multiplas fotos ou documentos digitalizados. Nossa ferramenta gratuita online Compressor de Imagens para PDF permite carregar multiplas imagens, ajustar a qualidade de compressao e exporta-las como um unico arquivo PDF compacto.',
        'A compressao funciona re-codificando suas imagens atraves da API Canvas HTML5 no nivel de qualidade escolhido. O controle de qualidade vai de 0.1 (compressao maxima, arquivo menor) a 1.0 (compressao minima, melhor qualidade). Para a maioria dos usos, uma configuracao entre 0.4 e 0.6 oferece um excelente equilibrio.',
        'A ferramenta mostra informacoes detalhadas de tamanho para cada imagem: o tamanho original e o tamanho comprimido apos o processamento. Apos gerar o PDF, voce pode ver o tamanho total original versus o tamanho do PDF, junto com a porcentagem de espaco economizado.',
        'Todo o processamento acontece completamente no seu navegador usando a API Canvas e a biblioteca jsPDF. Suas imagens nunca sao enviadas para nenhum servidor. A ferramenta e ideal para comprimir documentos digitalizados e criar relatorios PDF leves.',
      ],
      faq: [
        { q: 'Como funciona a compressao de imagens?', a: 'As imagens sao re-codificadas atraves da API Canvas HTML5 como JPEG no nivel de qualidade escolhido. Menor qualidade significa mais compressao e arquivos menores.' },
        { q: 'Qual configuracao de qualidade devo usar?', a: 'Para documentos e fotos gerais, 0.4-0.6 oferece um bom equilibrio. Para documentos digitalizados com muito texto, 0.3-0.5 funciona bem. Para fotos importantes, use 0.7-0.9.' },
        { q: 'Minhas imagens sao enviadas para um servidor?', a: 'Nao. Toda a compressao e geracao de PDF acontece localmente no seu navegador. Suas imagens nunca saem do seu dispositivo.' },
        { q: 'Qual e o tamanho maximo de arquivo que posso comprimir?', a: 'Nao ha limite do lado do servidor pois o processamento acontece no navegador. O limite pratico depende da memoria do seu dispositivo.' },
        { q: 'Posso comprimir mais imagens ja comprimidas?', a: 'Sim, mas com resultados decrescentes. Re-comprimir um JPEG ja comprimido reduzira o tamanho mas pode introduzir artefatos visiveis.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="pdf-compress" faqItems={seo.faq}>
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

          {/* Quality slider */}
          {images.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('quality')}: {quality.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={quality}
                onChange={(e) => {
                  setQuality(Number(e.target.value));
                  setDone(false);
                  setResultSize(null);
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{t('low')}</span>
                <span>{t('high')}</span>
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
                      setResultSize(null);
                      setDone(false);
                    }}
                    className="text-sm text-red-500 hover:text-red-600 font-medium"
                  >
                    {t('clearAll')}
                  </button>
                </div>
              </div>

              {images.map((img) => (
                <div key={img.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <img
                    src={img.preview}
                    alt={img.name}
                    className="w-14 h-14 object-cover rounded border border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{img.name}</p>
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>{t('original')}: {formatSize(img.originalSize)}</span>
                      {img.compressedSize !== null && (
                        <span className="text-green-600 font-medium">{t('compressed')}: {formatSize(img.compressedSize)}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeImage(img.id)}
                    className="p-1.5 text-red-400 hover:text-red-600"
                    title={t('remove')}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Size summary */}
          {images.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('totalOriginal')}</span>
                <span className="font-medium text-gray-900">{formatSize(totalOriginal)}</span>
              </div>
              {resultSize !== null && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('pdfSize')}</span>
                    <span className="font-medium text-gray-900">{formatSize(resultSize)}</span>
                  </div>
                  {savingsPercent !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('savings')}</span>
                      <span className={`font-semibold ${savingsPercent > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                        {savingsPercent > 0 ? `${savingsPercent}%` : `+${Math.abs(savingsPercent)}%`}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Compress button */}
          {images.length > 0 && (
            <>
              <button
                onClick={handleCompress}
                disabled={compressing}
                className="w-full py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {compressing ? t('compressing') : t('compress')}
              </button>
              {done && (
                <p className="text-sm text-green-600 text-center font-medium">{t('done')}</p>
              )}
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
