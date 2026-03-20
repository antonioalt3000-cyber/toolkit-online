'use client';
import { useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type Layout = '2x1' | '1x2' | '2x2' | '3x1' | '1x3' | '2x3';

interface CollageImage {
  src: string;
  file: File;
}

const LAYOUTS: { id: Layout; label: string; cols: number; rows: number; cells: number }[] = [
  { id: '2x1', label: '2 Horizontal', cols: 2, rows: 1, cells: 2 },
  { id: '1x2', label: '2 Vertical', cols: 1, rows: 2, cells: 2 },
  { id: '2x2', label: '2x2 Grid', cols: 2, rows: 2, cells: 4 },
  { id: '3x1', label: '3 Horizontal', cols: 3, rows: 1, cells: 3 },
  { id: '1x3', label: '3 Vertical', cols: 1, rows: 3, cells: 3 },
  { id: '2x3', label: '2x3 Grid', cols: 2, rows: 3, cells: 6 },
];

const labels: Record<string, Record<Locale, string>> = {
  layout: { en: 'Layout', it: 'Layout', es: 'Diseño', fr: 'Mise en page', de: 'Layout', pt: 'Layout' },
  addPhotos: { en: 'Add Photos', it: 'Aggiungi Foto', es: 'Agregar Fotos', fr: 'Ajouter Photos', de: 'Fotos hinzufügen', pt: 'Adicionar Fotos' },
  download: { en: 'Download Collage', it: 'Scarica Collage', es: 'Descargar Collage', fr: 'Télécharger Collage', de: 'Collage herunterladen', pt: 'Baixar Collagem' },
  clear: { en: 'Clear All', it: 'Cancella Tutto', es: 'Borrar Todo', fr: 'Tout Effacer', de: 'Alles löschen', pt: 'Limpar Tudo' },
  gap: { en: 'Gap', it: 'Spazio', es: 'Espacio', fr: 'Espace', de: 'Abstand', pt: 'Espaço' },
  bgColor: { en: 'Background', it: 'Sfondo', es: 'Fondo', fr: 'Arrière-plan', de: 'Hintergrund', pt: 'Fundo' },
  dropHere: { en: 'Click or drop image', it: 'Clicca o trascina immagine', es: 'Haz clic o arrastra imagen', fr: 'Cliquez ou déposez image', de: 'Klicken oder Bild ablegen', pt: 'Clique ou arraste imagem' },
  remove: { en: 'Remove', it: 'Rimuovi', es: 'Eliminar', fr: 'Supprimer', de: 'Entfernen', pt: 'Remover' },
};

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: {
    title: 'How to Create Photo Collages Online',
    paragraphs: [
      'Photo collages are a creative way to combine multiple images into a single composition. Whether you are making a social media post, a birthday card, or a portfolio showcase, a well-designed collage tells a visual story that individual photos cannot. Our free photo collage maker lets you create stunning collages directly in your browser without installing any software.',
      'Choose from six different layout options including horizontal strips, vertical strips, and grid arrangements. Upload your photos by clicking on each cell or dragging and dropping images. Adjust the gap between photos and pick a background color that complements your images. When your collage looks perfect, download it as a high-quality PNG file ready to share.',
      'This tool works entirely in your browser — your photos are never uploaded to any server, ensuring complete privacy. The collage is rendered on an HTML5 canvas element for crisp, high-resolution output suitable for printing or digital sharing on platforms like Instagram, Facebook, and Pinterest.',
    ],
    faq: [
      { q: 'What image formats can I use?', a: 'You can use JPG, PNG, GIF, WebP, and BMP images. The tool accepts any image format supported by your browser. The output collage is always saved as a PNG file for maximum quality.' },
      { q: 'Is there a limit to image file size?', a: 'There is no strict file size limit, but very large images (over 20 MB each) may slow down your browser. For best performance, use images under 5 MB each. The tool processes everything locally in your browser.' },
      { q: 'Can I rearrange photos after adding them?', a: 'To rearrange photos, simply click the remove button on a cell and add the image to a different cell. You can also change the layout at any time — your images will be preserved when switching between layouts of the same size.' },
      { q: 'What resolution is the output collage?', a: 'The output collage is rendered at 1200 pixels wide (or tall, depending on layout). This provides excellent quality for both screen display and printing up to approximately 10x15 cm at 300 DPI.' },
      { q: 'Are my photos stored on your servers?', a: 'No. All processing happens entirely in your browser using HTML5 Canvas. Your photos never leave your device and are not uploaded to any server. This ensures complete privacy and security for your images.' },
    ],
  },
  it: {
    title: 'Come Creare Collage di Foto Online',
    paragraphs: [
      'I collage fotografici sono un modo creativo per combinare piu immagini in una singola composizione. Che tu stia creando un post per i social media, un biglietto di auguri o una vetrina del portfolio, un collage ben progettato racconta una storia visiva che le singole foto non possono raccontare. Il nostro creatore di collage foto gratuito ti permette di creare collage direttamente nel browser senza installare alcun software.',
      'Scegli tra sei diverse opzioni di layout tra cui strisce orizzontali, verticali e griglie. Carica le tue foto cliccando su ogni cella o trascinando le immagini. Regola lo spazio tra le foto e scegli un colore di sfondo che completi le tue immagini. Quando il collage e perfetto, scaricalo come file PNG ad alta qualita pronto da condividere.',
      'Questo strumento funziona interamente nel tuo browser — le tue foto non vengono mai caricate su alcun server, garantendo privacy completa. Il collage viene renderizzato su un elemento canvas HTML5 per un output nitido e ad alta risoluzione, adatto alla stampa o alla condivisione digitale su piattaforme come Instagram, Facebook e Pinterest. Se hai bisogno di <a href="/it/tools/image-resizer">ridimensionare le immagini</a> prima di creare il collage, o di <a href="/it/tools/image-compressor">comprimere le foto</a> per ridurne il peso, trovi tutto su ToolKit Online.',
    ],
    faq: [
      { q: 'Quali formati di immagine posso usare?', a: 'Puoi usare immagini JPG, PNG, GIF, WebP e BMP. Lo strumento accetta qualsiasi formato supportato dal tuo browser. Il collage viene sempre salvato come file PNG per la massima qualita.' },
      { q: 'C\'e un limite alla dimensione dei file?', a: 'Non c\'e un limite rigido, ma immagini molto grandi (oltre 20 MB ciascuna) possono rallentare il browser. Per le migliori prestazioni, usa immagini sotto i 5 MB. Tutto viene elaborato localmente nel tuo browser.' },
      { q: 'Posso riordinare le foto dopo averle aggiunte?', a: 'Per riordinare le foto, clicca il pulsante rimuovi su una cella e aggiungi l\'immagine in una cella diversa. Puoi anche cambiare il layout in qualsiasi momento.' },
      { q: 'Quale risoluzione ha il collage?', a: 'Il collage viene renderizzato a 1200 pixel di larghezza. Questa qualita e eccellente sia per la visualizzazione a schermo che per la stampa fino a circa 10x15 cm a 300 DPI.' },
      { q: 'Le mie foto vengono salvate sui vostri server?', a: 'No. Tutto il processo avviene nel tuo browser usando HTML5 Canvas. Le tue foto non lasciano mai il tuo dispositivo e non vengono caricate su nessun server.' },
    ],
  },
  es: {
    title: 'Como Crear Collages de Fotos Online',
    paragraphs: [
      'Los collages de fotos son una forma creativa de combinar multiples imagenes en una sola composicion. Ya sea que estes creando una publicacion para redes sociales, una tarjeta de cumpleanos o una muestra de portafolio, un collage bien disenado cuenta una historia visual. Nuestro creador de collages gratuito te permite crear collages directamente en tu navegador.',
      'Elige entre seis opciones de diseno, incluyendo tiras horizontales, verticales y cuadriculas. Sube tus fotos haciendo clic en cada celda o arrastrando imagenes. Ajusta el espacio entre fotos y elige un color de fondo. Cuando tu collage sea perfecto, descargalo como archivo PNG de alta calidad.',
      'Esta herramienta funciona completamente en tu navegador — tus fotos nunca se suben a ningun servidor, garantizando privacidad completa.',
    ],
    faq: [
      { q: 'Que formatos de imagen puedo usar?', a: 'Puedes usar imagenes JPG, PNG, GIF, WebP y BMP. La herramienta acepta cualquier formato soportado por tu navegador.' },
      { q: 'Hay un limite de tamano de archivo?', a: 'No hay un limite estricto, pero imagenes muy grandes pueden ralentizar el navegador. Para mejor rendimiento, usa imagenes de menos de 5 MB.' },
      { q: 'Puedo reordenar las fotos despues de agregarlas?', a: 'Para reordenar fotos, haz clic en eliminar y agrega la imagen en otra celda. Puedes cambiar el diseno en cualquier momento.' },
      { q: 'Que resolucion tiene el collage?', a: 'El collage se renderiza a 1200 pixeles de ancho, excelente para pantalla e impresion.' },
    ],
  },
  fr: {
    title: 'Comment Creer des Collages Photo en Ligne',
    paragraphs: [
      'Les collages photo sont un moyen creatif de combiner plusieurs images en une seule composition. Que vous prepariez une publication pour les reseaux sociaux, une carte d\'anniversaire ou une vitrine de portfolio, un collage bien concu raconte une histoire visuelle. Notre createur de collages gratuit vous permet de creer des collages directement dans votre navigateur.',
      'Choisissez parmi six options de mise en page, y compris des bandes horizontales, verticales et des grilles. Telechargez vos photos en cliquant sur chaque cellule ou en faisant glisser des images. Ajustez l\'espace entre les photos et choisissez une couleur de fond. Telechargez votre collage en PNG haute qualite.',
      'Cet outil fonctionne entierement dans votre navigateur — vos photos ne sont jamais telechargees sur un serveur, garantissant une confidentialite complete.',
    ],
    faq: [
      { q: 'Quels formats d\'image puis-je utiliser?', a: 'Vous pouvez utiliser des images JPG, PNG, GIF, WebP et BMP. L\'outil accepte tout format supporte par votre navigateur.' },
      { q: 'Y a-t-il une limite de taille de fichier?', a: 'Il n\'y a pas de limite stricte, mais les images tres grandes peuvent ralentir votre navigateur. Pour de meilleures performances, utilisez des images de moins de 5 Mo.' },
      { q: 'Puis-je reorganiser les photos?', a: 'Pour reorganiser les photos, cliquez sur supprimer et ajoutez l\'image dans une autre cellule. Vous pouvez changer la mise en page a tout moment.' },
      { q: 'Quelle est la resolution du collage?', a: 'Le collage est rendu a 1200 pixels de large, excellent pour l\'affichage et l\'impression.' },
    ],
  },
  de: {
    title: 'Wie man Foto-Collagen Online erstellt',
    paragraphs: [
      'Foto-Collagen sind eine kreative Moglichkeit, mehrere Bilder zu einer einzigen Komposition zu kombinieren. Ob Sie einen Social-Media-Post, eine Geburtstagskarte oder eine Portfolio-Prasentation erstellen — eine gut gestaltete Collage erzahlt eine visuelle Geschichte. Unser kostenloser Collage-Ersteller ermoglicht es Ihnen, Collagen direkt im Browser zu erstellen.',
      'Wahlen Sie aus sechs verschiedenen Layout-Optionen, darunter horizontale und vertikale Streifen sowie Raster. Laden Sie Fotos hoch, indem Sie auf jede Zelle klicken oder Bilder hineinziehen. Passen Sie den Abstand an und wahlen Sie eine Hintergrundfarbe. Laden Sie Ihre Collage als hochwertige PNG-Datei herunter.',
      'Dieses Tool funktioniert vollstandig in Ihrem Browser — Ihre Fotos werden nie auf einen Server hochgeladen, was vollstandige Privatsphare garantiert.',
    ],
    faq: [
      { q: 'Welche Bildformate kann ich verwenden?', a: 'Sie konnen JPG, PNG, GIF, WebP und BMP Bilder verwenden. Das Tool akzeptiert jedes von Ihrem Browser unterstutzte Format.' },
      { q: 'Gibt es eine Dateigroszenlimitierung?', a: 'Es gibt kein striktes Limit, aber sehr grosze Bilder konnen den Browser verlangsamen. Fur beste Leistung verwenden Sie Bilder unter 5 MB.' },
      { q: 'Kann ich Fotos nach dem Hinzufugen neu anordnen?', a: 'Um Fotos neu anzuordnen, klicken Sie auf Entfernen und fugen Sie das Bild in einer anderen Zelle hinzu. Sie konnen das Layout jederzeit andern.' },
      { q: 'Welche Auflosung hat die Collage?', a: 'Die Collage wird mit 1200 Pixeln Breite gerendert, hervorragend fur Bildschirmanzeige und Druck.' },
    ],
  },
  pt: {
    title: 'Como Criar Colagens de Fotos Online',
    paragraphs: [
      'As colagens de fotos sao uma forma criativa de combinar varias imagens numa unica composicao. Quer esteja a criar uma publicacao para redes sociais, um cartao de aniversario ou uma vitrine de portfolio, uma colagem bem desenhada conta uma historia visual. O nosso criador de colagens gratuito permite criar colagens diretamente no navegador.',
      'Escolha entre seis opcoes de layout, incluindo faixas horizontais, verticais e grelhas. Carregue as suas fotos clicando em cada celula ou arrastando imagens. Ajuste o espaco entre as fotos e escolha uma cor de fundo. Descarregue a sua colagem como ficheiro PNG de alta qualidade.',
      'Esta ferramenta funciona inteiramente no seu navegador — as suas fotos nunca sao carregadas para nenhum servidor, garantindo privacidade completa.',
    ],
    faq: [
      { q: 'Que formatos de imagem posso usar?', a: 'Pode usar imagens JPG, PNG, GIF, WebP e BMP. A ferramenta aceita qualquer formato suportado pelo seu navegador.' },
      { q: 'Ha um limite de tamanho de ficheiro?', a: 'Nao ha um limite rigoroso, mas imagens muito grandes podem tornar o navegador mais lento. Para melhor desempenho, use imagens com menos de 5 MB.' },
      { q: 'Posso reordenar as fotos depois de as adicionar?', a: 'Para reordenar fotos, clique em remover e adicione a imagem noutra celula. Pode alterar o layout a qualquer momento.' },
      { q: 'Qual e a resolucao da colagem?', a: 'A colagem e renderizada com 1200 pixeis de largura, excelente para visualizacao em ecra e impressao.' },
    ],
  },
};

export default function PhotoCollageMaker() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['photo-collage-maker'][lang];
  const t = useCallback((key: string) => labels[key]?.[lang] ?? labels[key]?.en ?? key, [lang]);
  const seo = seoContent[lang] || seoContent.en;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [layout, setLayout] = useState<Layout>('2x2');
  const [images, setImages] = useState<(CollageImage | null)[]>(Array(4).fill(null));
  const [gap, setGap] = useState(8);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const currentLayout = LAYOUTS.find((l) => l.id === layout)!;

  const handleLayoutChange = (newLayout: Layout) => {
    const newCells = LAYOUTS.find((l) => l.id === newLayout)!.cells;
    setLayout(newLayout);
    setImages((prev) => {
      const next = Array(newCells).fill(null);
      for (let i = 0; i < Math.min(prev.length, newCells); i++) {
        next[i] = prev[i];
      }
      return next;
    });
  };

  const handleAddImage = (index: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => {
          const next = [...prev];
          next[index] = { src: reader.result as string, file };
          return next;
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleDrop = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImages((prev) => {
        const next = [...prev];
        next[index] = { src: reader.result as string, file };
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (index: number) => {
    setImages((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const SIZE = 1200;
    const totalGap = gap * (currentLayout.cols + 1);
    const totalGapV = gap * (currentLayout.rows + 1);
    const cellW = (SIZE - totalGap) / currentLayout.cols;
    const cellH = ((SIZE * currentLayout.rows) / currentLayout.cols - totalGapV) / currentLayout.rows;
    const canvasW = SIZE;
    const canvasH = Math.round(cellH * currentLayout.rows + totalGapV);

    canvas.width = canvasW;
    canvas.height = canvasH;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasW, canvasH);

    const loadPromises = images.map((img) => {
      if (!img) return Promise.resolve(null);
      return new Promise<HTMLImageElement>((resolve) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.src = img.src;
      });
    });

    Promise.all(loadPromises).then((loadedImages) => {
      loadedImages.forEach((img, i) => {
        if (!img) return;
        const col = i % currentLayout.cols;
        const row = Math.floor(i / currentLayout.cols);
        const x = gap + col * (cellW + gap);
        const y = gap + row * (cellH + gap);

        // Cover fit
        const scale = Math.max(cellW / img.width, cellH / img.height);
        const sw = cellW / scale;
        const sh = cellH / scale;
        const sx = (img.width - sw) / 2;
        const sy = (img.height - sh) / 2;

        ctx.drawImage(img, sx, sy, sw, sh, x, y, cellW, cellH);
      });

      const link = document.createElement('a');
      link.download = 'collage.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  const hasAnyImage = images.some((img) => img !== null);

  return (
    <ToolPageWrapper toolSlug="photo-collage-maker" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Layout selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('layout')}</label>
          <div className="flex flex-wrap gap-2">
            {LAYOUTS.map((l) => (
              <button
                key={l.id}
                onClick={() => handleLayoutChange(l.id)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  layout === l.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">{t('gap')}</label>
            <input
              type="range"
              min={0}
              max={20}
              value={gap}
              onChange={(e) => setGap(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-gray-500">{gap}px</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">{t('bgColor')}</label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Collage grid */}
        <div
          className="rounded-lg overflow-hidden border border-gray-200 mb-4"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${currentLayout.cols}, 1fr)`,
            gridTemplateRows: `repeat(${currentLayout.rows}, 150px)`,
            gap: `${gap}px`,
            padding: `${gap}px`,
            backgroundColor: bgColor,
          }}
        >
          {images.map((img, i) => (
            <div
              key={i}
              className="relative rounded overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer group"
              onClick={() => !img && handleAddImage(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(i, e)}
            >
              {img ? (
                <>
                  <img
                    src={img.src}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(i);
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {t('remove')}
                  </button>
                </>
              ) : (
                <div className="text-center p-4">
                  <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                  <p className="text-xs text-gray-400">{t('dropHere')}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleDownload}
            disabled={!hasAnyImage}
            className="flex-1 px-4 py-3 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('download')}
          </button>
          <button
            onClick={() => setImages(Array(currentLayout.cells).fill(null))}
            className="px-4 py-3 text-sm font-semibold rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            {t('clear')}
          </button>
        </div>

        {/* Hidden canvas for export */}
        <canvas ref={canvasRef} className="hidden" />

        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => (
            <p key={i} className="text-gray-700 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: p }} />
          ))}
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
