'use client';

import CategoryHubPage from '@/components/CategoryHubPage';
import { getToolsByCategory } from '@/lib/translations';

const toolSlugs = getToolsByCategory().images;

const translations: Record<string, { title: string; metaTitle: string; description: string; article: string; toolsHeading: string; exploreOther: string }> = {
  en: {
    title: 'Free Image Tools & Editors',
    metaTitle: 'Free Image Tools & Editors | ToolKit Online',
    description: 'Compress, resize, convert, and edit images online for free.',
    toolsHeading: 'All Image Tools',
    exploreOther: 'Explore Other Categories',
    article: `<h2>Professional Image Editing in Your Browser</h2>
<p>Working with images is an essential part of modern digital life, whether you are a web developer optimizing assets for faster page loads, a social media manager preparing visual content, a photographer adjusting compositions, or simply someone who needs to quickly resize a photo for an email attachment. ToolKit Online provides a comprehensive collection of free browser-based image tools that handle every common task without requiring software installation or account creation.</p>

<h3>Image Compression and Optimization</h3>
<p>Large image files slow down websites and consume unnecessary bandwidth. Our image compressor uses advanced algorithms to reduce file sizes by up to 80% while maintaining visual quality that is virtually indistinguishable from the original. This is particularly valuable for web developers who need to meet Core Web Vitals performance targets and for anyone who wants to save storage space without sacrificing image clarity. The tool supports JPEG, PNG, and WebP formats with adjustable quality settings.</p>

<h3>Resize and Transform</h3>
<p>Whether you need to prepare images for specific social media dimensions, create thumbnails for your website, or scale photos for printing, our image resizer handles it all. Set exact pixel dimensions or use percentage-based scaling while maintaining aspect ratio. The tool preserves image quality during the resize process and supports batch operations for handling multiple files efficiently.</p>

<h3>Format Conversion</h3>
<p>Different platforms and use cases require different image formats. Our conversion tools let you transform between JPG, PNG, SVG, WebP, and PDF formats instantly. The SVG to PNG converter is especially popular among developers who need rasterized versions of vector graphics, while the JPG to PDF tool helps anyone who needs to create document-ready versions of photographs.</p>

<h3>Creative Tools</h3>
<p>Beyond basic editing, we offer creative tools that bring your visual ideas to life. The meme generator lets you create shareable content with custom text overlays. The pixel art maker provides a canvas for creating retro-style artwork pixel by pixel. The photo editor offers essential adjustments including brightness, contrast, saturation, and cropping. For designers, the background remover uses AI-powered segmentation to isolate subjects from their backgrounds cleanly and accurately.</p>

<h3>Measurement and Analysis</h3>
<p>The pixel ruler tool helps designers and developers measure elements on screen with precision, which is invaluable for ensuring consistent spacing and alignment in web layouts. Combined with our color picker from the developer tools section, you have everything needed for pixel-perfect design work.</p>

<p>Every image tool processes files entirely within your browser using client-side JavaScript. Your images are never uploaded to our servers, ensuring complete privacy. The tools work on desktop and mobile devices, handle files of any reasonable size, and produce results instantly. Bookmark this page for quick access whenever you need to work with images.</p>`,
  },
  it: {
    title: 'Strumenti Immagine Gratuiti',
    metaTitle: 'Strumenti Immagine Gratuiti | ToolKit Online',
    description: 'Comprimi, ridimensiona, converti e modifica immagini online gratuitamente.',
    toolsHeading: 'Tutti gli Strumenti Immagine',
    exploreOther: 'Esplora Altre Categorie',
    article: `<h2>Editing Professionale di Immagini nel Tuo Browser</h2>
<p>Lavorare con le immagini e una parte essenziale della vita digitale moderna. Che tu sia uno sviluppatore web che ottimizza le risorse per caricamenti piu veloci, un social media manager che prepara contenuti visivi, un fotografo che regola composizioni, o semplicemente qualcuno che ha bisogno di ridimensionare rapidamente una foto. ToolKit Online fornisce una collezione completa di strumenti immagine gratuiti basati su browser.</p>

<h3>Compressione e Ottimizzazione</h3>
<p>File immagine troppo grandi rallentano i siti web e consumano banda inutile. Il nostro compressore di immagini utilizza algoritmi avanzati per ridurre le dimensioni dei file fino all80% mantenendo una qualita visiva praticamente indistinguibile dalloriginale. Supporta formati JPEG, PNG e WebP con impostazioni di qualita regolabili.</p>

<h3>Ridimensionamento e Trasformazione</h3>
<p>Che tu debba preparare immagini per dimensioni specifiche dei social media, creare miniature per il tuo sito web o scalare foto per la stampa, il nostro ridimensionatore di immagini gestisce tutto. Imposta dimensioni esatte in pixel o usa il ridimensionamento percentuale mantenendo le proporzioni.</p>

<h3>Conversione Formati</h3>
<p>Piattaforme diverse richiedono formati immagine diversi. I nostri strumenti di conversione ti permettono di trasformare tra JPG, PNG, SVG, WebP e PDF istantaneamente. Il convertitore SVG a PNG e particolarmente popolare tra gli sviluppatori.</p>

<h3>Strumenti Creativi</h3>
<p>Oltre allediting di base, offriamo strumenti creativi. Il generatore di meme ti permette di creare contenuti condivisibili. Il pixel art maker fornisce una tela per creare opere in stile retro. Leditor fotografico offre regolazioni essenziali. Il rimuovi sfondo usa la segmentazione AI per isolare i soggetti.</p>

<p>Ogni strumento elabora i file interamente nel tuo browser. Le tue immagini non vengono mai caricate sui nostri server, garantendo completa privacy.</p>`,
  },
  es: {
    title: 'Herramientas de Imagen Gratuitas',
    metaTitle: 'Herramientas de Imagen Gratuitas | ToolKit Online',
    description: 'Comprime, redimensiona, convierte y edita imagenes en linea gratis.',
    toolsHeading: 'Todas las Herramientas de Imagen',
    exploreOther: 'Explorar Otras Categorias',
    article: `<h2>Edicion Profesional de Imagenes en Tu Navegador</h2>
<p>Trabajar con imagenes es esencial en la vida digital moderna. ToolKit Online ofrece una coleccion completa de herramientas de imagen gratuitas basadas en navegador que manejan cada tarea comun sin instalacion ni registro.</p>

<h3>Compresion y Optimizacion</h3>
<p>Nuestro compresor de imagenes reduce el tamano de los archivos hasta un 80% manteniendo la calidad visual. Soporta JPEG, PNG y WebP con ajustes de calidad configurables.</p>

<h3>Redimensionar y Transformar</h3>
<p>Prepara imagenes para redes sociales, crea miniaturas o escala fotos para impresion. Establece dimensiones exactas en pixeles o usa escalado porcentual manteniendo la proporcion.</p>

<h3>Herramientas Creativas</h3>
<p>Generador de memes, pixel art maker, editor de fotos y removedor de fondo con IA. Todo procesado en tu navegador con total privacidad.</p>`,
  },
  fr: {
    title: 'Outils Image Gratuits',
    metaTitle: 'Outils Image Gratuits | ToolKit Online',
    description: 'Compressez, redimensionnez, convertissez et editez des images en ligne gratuitement.',
    toolsHeading: 'Tous les Outils Image',
    exploreOther: 'Explorer Autres Categories',
    article: `<h2>Edition Professionnelle dans Votre Navigateur</h2>
<p>ToolKit Online propose une collection complete d outils image gratuits bases sur navigateur. Compression, redimensionnement, conversion et edition sans installation ni inscription.</p>

<h3>Compression et Optimisation</h3>
<p>Notre compresseur reduit la taille des fichiers jusqu a 80% tout en maintenant la qualite visuelle. Supporte JPEG, PNG et WebP.</p>

<h3>Outils Creatifs</h3>
<p>Generateur de memes, pixel art, editeur photo et suppression d arriere-plan par IA. Tout est traite dans votre navigateur pour une confidentialite totale.</p>`,
  },
  de: {
    title: 'Kostenlose Bild-Tools',
    metaTitle: 'Kostenlose Bild-Tools | ToolKit Online',
    description: 'Komprimieren, skalieren, konvertieren und bearbeiten Sie Bilder kostenlos online.',
    toolsHeading: 'Alle Bild-Tools',
    exploreOther: 'Andere Kategorien Erkunden',
    article: `<h2>Professionelle Bildbearbeitung im Browser</h2>
<p>ToolKit Online bietet eine umfassende Sammlung kostenloser browserbasierter Bildtools. Komprimierung, Skalierung, Konvertierung und Bearbeitung ohne Installation oder Registrierung.</p>

<h3>Komprimierung und Optimierung</h3>
<p>Unser Bildkompressor reduziert Dateigrossen um bis zu 80% bei Beibehaltung der visuellen Qualitat. Unterstutzt JPEG, PNG und WebP.</p>

<h3>Kreative Tools</h3>
<p>Meme-Generator, Pixel Art Maker, Foto-Editor und KI-gestutzte Hintergrundentfernung. Alles wird in Ihrem Browser verarbeitet.</p>`,
  },
  pt: {
    title: 'Ferramentas de Imagem Gratuitas',
    metaTitle: 'Ferramentas de Imagem Gratuitas | ToolKit Online',
    description: 'Comprima, redimensione, converta e edite imagens online gratuitamente.',
    toolsHeading: 'Todas as Ferramentas de Imagem',
    exploreOther: 'Explorar Outras Categorias',
    article: `<h2>Edicao Profissional de Imagens no Navegador</h2>
<p>ToolKit Online oferece uma colecao completa de ferramentas de imagem gratuitas baseadas em navegador. Compressao, redimensionamento, conversao e edicao sem instalacao ou registro.</p>

<h3>Compressao e Otimizacao</h3>
<p>Nosso compressor de imagens reduz o tamanho dos arquivos em ate 80% mantendo a qualidade visual. Suporta JPEG, PNG e WebP.</p>

<h3>Ferramentas Criativas</h3>
<p>Gerador de memes, pixel art maker, editor de fotos e removedor de fundo com IA. Tudo processado no seu navegador com total privacidade.</p>`,
  },
};

export default function ImageToolsPage() {
  return (
    <CategoryHubPage
      config={{
        categoryKey: 'images',
        slug: 'image-tools',
        toolSlugs: toolSlugs,
        otherCategories: [
          { key: 'finance', slug: 'finance-tools' },
          { key: 'text', slug: 'text-tools' },
          { key: 'health', slug: 'health-tools' },
          { key: 'conversion', slug: 'conversion-tools' },
          { key: 'dev', slug: 'developer-tools' },
          { key: 'math', slug: 'math-tools' },
        ],
        translations,
      }}
    />
  );
}
