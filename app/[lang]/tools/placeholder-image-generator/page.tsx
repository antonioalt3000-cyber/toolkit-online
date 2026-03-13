'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface Preset {
  label: Record<Locale, string>;
  w: number;
  h: number;
}

const presets: Preset[] = [
  { label: { en: 'Facebook Cover', it: 'Copertina Facebook', es: 'Portada Facebook', fr: 'Couverture Facebook', de: 'Facebook Cover', pt: 'Capa Facebook' }, w: 820, h: 312 },
  { label: { en: 'Instagram Post', it: 'Post Instagram', es: 'Post Instagram', fr: 'Post Instagram', de: 'Instagram Post', pt: 'Post Instagram' }, w: 1080, h: 1080 },
  { label: { en: 'Twitter Header', it: 'Header Twitter', es: 'Encabezado Twitter', fr: 'En-tête Twitter', de: 'Twitter Header', pt: 'Cabeçalho Twitter' }, w: 1500, h: 500 },
  { label: { en: 'YouTube Thumbnail', it: 'Miniatura YouTube', es: 'Miniatura YouTube', fr: 'Miniature YouTube', de: 'YouTube Thumbnail', pt: 'Miniatura YouTube' }, w: 1280, h: 720 },
  { label: { en: 'HD (1920x1080)', it: 'HD (1920x1080)', es: 'HD (1920x1080)', fr: 'HD (1920x1080)', de: 'HD (1920x1080)', pt: 'HD (1920x1080)' }, w: 1920, h: 1080 },
  { label: { en: 'Mobile (375x812)', it: 'Mobile (375x812)', es: 'Móvil (375x812)', fr: 'Mobile (375x812)', de: 'Mobil (375x812)', pt: 'Mobile (375x812)' }, w: 375, h: 812 },
];

const labels: Record<string, Record<Locale, string>> = {
  reset: { en: 'Reset', it: 'Ripristina', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  width: { en: 'Width (px)', it: 'Larghezza (px)', es: 'Ancho (px)', fr: 'Largeur (px)', de: 'Breite (px)', pt: 'Largura (px)' },
  height: { en: 'Height (px)', it: 'Altezza (px)', es: 'Alto (px)', fr: 'Hauteur (px)', de: 'Höhe (px)', pt: 'Altura (px)' },
  bgColor: { en: 'Background Color', it: 'Colore Sfondo', es: 'Color de Fondo', fr: 'Couleur de Fond', de: 'Hintergrundfarbe', pt: 'Cor de Fundo' },
  textColor: { en: 'Text Color', it: 'Colore Testo', es: 'Color de Texto', fr: 'Couleur du Texte', de: 'Textfarbe', pt: 'Cor do Texto' },
  customText: { en: 'Custom Text', it: 'Testo Personalizzato', es: 'Texto Personalizado', fr: 'Texte Personnalisé', de: 'Benutzerdefinierter Text', pt: 'Texto Personalizado' },
  customTextPlaceholder: { en: 'Leave empty for WxH', it: 'Lascia vuoto per LxA', es: 'Dejar vacío para AxA', fr: 'Laisser vide pour LxH', de: 'Leer lassen für BxH', pt: 'Deixar vazio para LxA' },
  fontSize: { en: 'Font Size', it: 'Dimensione Font', es: 'Tamaño de Fuente', fr: 'Taille de Police', de: 'Schriftgröße', pt: 'Tamanho da Fonte' },
  auto: { en: 'Auto', it: 'Auto', es: 'Auto', fr: 'Auto', de: 'Auto', pt: 'Auto' },
  manual: { en: 'Manual', it: 'Manuale', es: 'Manual', fr: 'Manuel', de: 'Manuell', pt: 'Manual' },
  format: { en: 'Format', it: 'Formato', es: 'Formato', fr: 'Format', de: 'Format', pt: 'Formato' },
  presets: { en: 'Presets', it: 'Predefiniti', es: 'Predefinidos', fr: 'Préréglages', de: 'Voreinstellungen', pt: 'Predefinições' },
  generate: { en: 'Generate Image', it: 'Genera Immagine', es: 'Generar Imagen', fr: 'Générer l\'Image', de: 'Bild Generieren', pt: 'Gerar Imagem' },
  download: { en: 'Download', it: 'Scarica', es: 'Descargar', fr: 'Télécharger', de: 'Herunterladen', pt: 'Baixar' },
  copyBase64: { en: 'Copy as Base64 Data URL', it: 'Copia come URL Dati Base64', es: 'Copiar como URL de Datos Base64', fr: 'Copier en URL de Données Base64', de: 'Als Base64 Data URL Kopieren', pt: 'Copiar como URL de Dados Base64' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  preview: { en: 'Live Preview', it: 'Anteprima Live', es: 'Vista Previa en Vivo', fr: 'Aperçu en Direct', de: 'Live-Vorschau', pt: 'Pré-visualização ao Vivo' },
  fontSizePx: { en: 'px', it: 'px', es: 'px', fr: 'px', de: 'px', pt: 'px' },
};

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 400;
const DEFAULT_BG = '#cccccc';
const DEFAULT_TEXT_COLOR = '#333333';

export default function PlaceholderImageGenerator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['placeholder-image-generator'][lang];
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [bgColor, setBgColor] = useState(DEFAULT_BG);
  const [textColor, setTextColor] = useState(DEFAULT_TEXT_COLOR);
  const [customText, setCustomText] = useState('');
  const [fontSizeMode, setFontSizeMode] = useState<'auto' | 'manual'>('auto');
  const [manualFontSize, setManualFontSize] = useState(48);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const t = useCallback((key: string) => labels[key]?.[lang] ?? labels[key]?.en ?? key, [lang]);

  const displayText = customText || `${width}x${height}`;

  const computeFontSize = useCallback(() => {
    if (fontSizeMode === 'manual') return manualFontSize;
    const minDim = Math.min(width, height);
    const textLen = displayText.length;
    let size = Math.floor(minDim / 4);
    if (textLen > 10) size = Math.floor(size * (10 / textLen));
    return Math.max(12, Math.min(size, 200));
  }, [fontSizeMode, manualFontSize, width, height, displayText]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Cross lines
    ctx.strokeStyle = textColor;
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, height);
    ctx.moveTo(width, 0);
    ctx.lineTo(0, height);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Text
    const fontSize = computeFontSize();
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayText, width / 2, height / 2);
  }, [width, height, bgColor, textColor, displayText, computeFontSize]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const dataUrl = canvas.toDataURL(mimeType, 0.92);
    const link = document.createElement('a');
    link.download = `placeholder-${width}x${height}.${format}`;
    link.href = dataUrl;
    link.click();
  };

  const handleCopyBase64 = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const dataUrl = canvas.toDataURL(mimeType, 0.92);
    try {
      await navigator.clipboard.writeText(dataUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement('textarea');
      textarea.value = dataUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePreset = (w: number, h: number) => {
    setWidth(w);
    setHeight(h);
  };

  const handleReset = () => {
    setWidth(DEFAULT_WIDTH);
    setHeight(DEFAULT_HEIGHT);
    setBgColor(DEFAULT_BG);
    setTextColor(DEFAULT_TEXT_COLOR);
    setCustomText('');
    setFontSizeMode('auto');
    setManualFontSize(48);
    setFormat('png');
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Placeholder Image Generator: Create Custom Dummy Images Online',
      paragraphs: [
        'Placeholder images are essential in web development and design workflows. Whether you are building a website prototype, creating a mockup for a client presentation, or testing a responsive layout, you need images of specific dimensions to fill the gaps before final assets are ready. Our free placeholder image generator lets you create custom dummy images instantly, right in your browser.',
        'This tool generates images using the HTML5 Canvas API, which means everything happens client-side with zero server interaction. Your images are never uploaded or stored anywhere. Simply set the width and height in pixels, choose your background and text colors, add optional custom text, and download the resulting image in PNG or JPEG format.',
        'The generator includes popular preset sizes for social media platforms like Facebook Cover (820x312), Instagram Post (1080x1080), Twitter Header (1500x500), and YouTube Thumbnail (1280x720). These presets save you time by instantly filling in the correct dimensions used by major platforms, ensuring your designs will fit perfectly when you swap in final images.',
        'For developers, the copy-as-base64 feature is particularly useful. Instead of downloading a file, you can copy the entire image as a data URL and paste it directly into your HTML, CSS, or JavaScript code. This is perfect for quick prototyping, email templates, or any situation where you need an inline image without an external file reference.',
        'The font size can be set to auto mode, which intelligently calculates the optimal text size based on the image dimensions and text length, or you can manually specify an exact pixel size. The default text shows the image dimensions (e.g., "800x400"), making it easy to identify placeholder images in your layouts at a glance.',
        'Whether you are a frontend developer, UI/UX designer, project manager, or content creator, this placeholder image generator streamlines your workflow by eliminating the need for external placeholder image services. Everything runs locally in your browser, ensuring privacy and instant results with no rate limits or API dependencies.',
      ],
      faq: [
        { q: 'What is a placeholder image and why do I need one?', a: 'A placeholder image is a temporary dummy image used during the design or development process before final images are ready. It typically shows the dimensions and fills the space where a real image will eventually go, helping maintain proper layout structure.' },
        { q: 'Can I use these placeholder images commercially?', a: 'Yes, the images generated by this tool are completely free to use for any purpose, including commercial projects. Since you create them yourself with custom colors and text, there are no copyright or licensing concerns.' },
        { q: 'What is a base64 data URL and when should I use it?', a: 'A base64 data URL encodes the entire image as a text string that can be embedded directly in HTML or CSS. Use it when you want to avoid external file requests, such as in email templates, single-file prototypes, or inline image placeholders.' },
        { q: 'Why does the tool run in the browser instead of a server?', a: 'Client-side processing using the Canvas API means your images are generated instantly without uploading anything to a server. This provides better privacy, faster results, and no dependency on external services or API limits.' },
        { q: 'Can I generate transparent background placeholder images?', a: 'The tool currently supports solid background colors. For transparency, generate a PNG image and use the closest matching background color to your design. PNG format preserves quality better than JPEG for images with text and sharp edges.' },
      ],
    },
    it: {
      title: 'Generatore Immagini Placeholder: Crea Immagini Segnaposto Personalizzate Online',
      paragraphs: [
        'Le immagini placeholder sono essenziali nei flussi di lavoro di sviluppo web e design. Che tu stia costruendo un prototipo di sito web, creando un mockup per una presentazione al cliente o testando un layout responsive, hai bisogno di immagini di dimensioni specifiche per riempire gli spazi prima che le risorse finali siano pronte. Il nostro generatore gratuito di immagini placeholder ti permette di creare immagini segnaposto personalizzate istantaneamente, direttamente nel browser.',
        'Questo strumento genera immagini utilizzando l\'API Canvas HTML5, il che significa che tutto avviene lato client senza alcuna interazione con il server. Le tue immagini non vengono mai caricate o archiviate da nessuna parte. Imposta semplicemente larghezza e altezza in pixel, scegli i colori di sfondo e testo, aggiungi un testo personalizzato opzionale e scarica l\'immagine risultante in formato PNG o JPEG.',
        'Il generatore include dimensioni predefinite popolari per piattaforme social come Copertina Facebook (820x312), Post Instagram (1080x1080), Header Twitter (1500x500) e Miniatura YouTube (1280x720). Questi predefiniti ti fanno risparmiare tempo inserendo istantaneamente le dimensioni corrette utilizzate dalle principali piattaforme.',
        'Per gli sviluppatori, la funzione copia-come-base64 è particolarmente utile. Invece di scaricare un file, puoi copiare l\'intera immagine come URL dati e incollarla direttamente nel tuo codice HTML, CSS o JavaScript. Perfetto per prototipazione rapida, template email o qualsiasi situazione in cui serve un\'immagine inline.',
        'La dimensione del font può essere impostata in modalità automatica, che calcola intelligentemente la dimensione ottimale del testo in base alle dimensioni dell\'immagine e alla lunghezza del testo, oppure puoi specificare manualmente una dimensione esatta in pixel. Il testo predefinito mostra le dimensioni dell\'immagine, rendendo facile identificare le immagini placeholder nei tuoi layout.',
        'Che tu sia uno sviluppatore frontend, designer UI/UX, project manager o creatore di contenuti, questo generatore di immagini placeholder semplifica il tuo flusso di lavoro eliminando la necessità di servizi esterni. Tutto funziona localmente nel tuo browser, garantendo privacy e risultati istantanei senza limiti o dipendenze API.',
      ],
      faq: [
        { q: 'Cos\'è un\'immagine placeholder e perché ne ho bisogno?', a: 'Un\'immagine placeholder è un\'immagine segnaposto temporanea utilizzata durante il processo di design o sviluppo prima che le immagini finali siano pronte. Tipicamente mostra le dimensioni e riempie lo spazio dove andrà l\'immagine reale.' },
        { q: 'Posso usare queste immagini placeholder commercialmente?', a: 'Sì, le immagini generate da questo strumento sono completamente gratuite per qualsiasi uso, inclusi progetti commerciali. Poiché le crei tu stesso con colori e testo personalizzati, non ci sono problemi di copyright.' },
        { q: 'Cos\'è un URL dati base64 e quando dovrei usarlo?', a: 'Un URL dati base64 codifica l\'intera immagine come stringa di testo incorporabile direttamente in HTML o CSS. Usalo quando vuoi evitare richieste di file esterni, come nei template email o prototipi a file singolo.' },
        { q: 'Perché lo strumento funziona nel browser invece che su un server?', a: 'L\'elaborazione lato client tramite l\'API Canvas significa che le immagini vengono generate istantaneamente senza caricare nulla su un server. Questo offre maggiore privacy, risultati più veloci e nessuna dipendenza da servizi esterni.' },
        { q: 'Posso generare immagini placeholder con sfondo trasparente?', a: 'Lo strumento attualmente supporta colori di sfondo solidi. Per la trasparenza, genera un\'immagine PNG e usa il colore di sfondo più simile al tuo design. Il formato PNG preserva meglio la qualità per immagini con testo e bordi netti.' },
      ],
    },
    es: {
      title: 'Generador de Imágenes Placeholder: Crea Imágenes de Marcador de Posición Online',
      paragraphs: [
        'Las imágenes placeholder son esenciales en los flujos de trabajo de desarrollo web y diseño. Ya sea que estés construyendo un prototipo de sitio web, creando un mockup para una presentación o probando un diseño responsive, necesitas imágenes de dimensiones específicas para llenar los espacios antes de que los recursos finales estén listos. Nuestro generador gratuito te permite crear imágenes de marcador de posición personalizadas al instante.',
        'Esta herramienta genera imágenes usando la API Canvas de HTML5, lo que significa que todo sucede del lado del cliente sin interacción con el servidor. Tus imágenes nunca se suben ni almacenan. Simplemente establece el ancho y alto en píxeles, elige los colores de fondo y texto, agrega texto personalizado opcional y descarga la imagen en formato PNG o JPEG.',
        'El generador incluye tamaños predefinidos populares para plataformas de redes sociales como Portada de Facebook (820x312), Post de Instagram (1080x1080), Encabezado de Twitter (1500x500) y Miniatura de YouTube (1280x720). Estos predefinidos ahorran tiempo al insertar instantáneamente las dimensiones correctas.',
        'Para desarrolladores, la función de copiar como base64 es particularmente útil. En lugar de descargar un archivo, puedes copiar toda la imagen como URL de datos y pegarla directamente en tu código HTML, CSS o JavaScript. Perfecto para prototipado rápido y plantillas de correo.',
        'El tamaño de fuente puede configurarse en modo automático, que calcula inteligentemente el tamaño óptimo basado en las dimensiones de la imagen y la longitud del texto, o puedes especificar manualmente un tamaño exacto en píxeles. El texto predeterminado muestra las dimensiones de la imagen, facilitando identificar las imágenes placeholder en tus diseños.',
        'Ya seas desarrollador frontend, diseñador UI/UX, gerente de proyecto o creador de contenido, este generador simplifica tu flujo de trabajo eliminando la necesidad de servicios externos de imágenes placeholder. Todo funciona localmente en tu navegador, garantizando privacidad y resultados instantáneos.',
      ],
      faq: [
        { q: '¿Qué es una imagen placeholder y por qué la necesito?', a: 'Una imagen placeholder es una imagen temporal de marcador de posición utilizada durante el proceso de diseño o desarrollo. Muestra las dimensiones y llena el espacio donde irá la imagen real, manteniendo la estructura del diseño.' },
        { q: '¿Puedo usar estas imágenes placeholder comercialmente?', a: 'Sí, las imágenes generadas por esta herramienta son completamente gratuitas para cualquier uso, incluidos proyectos comerciales. No hay problemas de derechos de autor.' },
        { q: '¿Qué es una URL de datos base64 y cuándo debo usarla?', a: 'Una URL de datos base64 codifica toda la imagen como texto que puede incrustarse directamente en HTML o CSS. Úsala cuando quieras evitar solicitudes de archivos externos, como en plantillas de correo electrónico.' },
        { q: '¿Por qué la herramienta funciona en el navegador?', a: 'El procesamiento del lado del cliente usando la API Canvas genera imágenes instantáneamente sin subir nada a un servidor. Esto proporciona mejor privacidad y resultados más rápidos.' },
        { q: '¿Puedo generar imágenes con fondo transparente?', a: 'La herramienta actualmente soporta colores de fondo sólidos. Para transparencia, genera una imagen PNG y usa un color de fondo cercano a tu diseño.' },
      ],
    },
    fr: {
      title: 'Générateur d\'Images Placeholder : Créez des Images Factices Personnalisées en Ligne',
      paragraphs: [
        'Les images placeholder sont essentielles dans les flux de travail de développement web et de design. Que vous construisiez un prototype de site web, créiez une maquette pour une présentation client ou testiez un layout responsive, vous avez besoin d\'images de dimensions spécifiques. Notre générateur gratuit vous permet de créer des images factices personnalisées instantanément dans votre navigateur.',
        'Cet outil génère des images en utilisant l\'API Canvas HTML5, ce qui signifie que tout se passe côté client sans aucune interaction serveur. Vos images ne sont jamais téléchargées ni stockées. Définissez la largeur et la hauteur en pixels, choisissez les couleurs de fond et de texte, ajoutez un texte personnalisé optionnel et téléchargez l\'image en format PNG ou JPEG.',
        'Le générateur inclut des tailles prédéfinies populaires pour les plateformes de médias sociaux comme Couverture Facebook (820x312), Post Instagram (1080x1080), En-tête Twitter (1500x500) et Miniature YouTube (1280x720). Ces préréglages vous font gagner du temps en insérant instantanément les bonnes dimensions.',
        'Pour les développeurs, la fonctionnalité copier en base64 est particulièrement utile. Au lieu de télécharger un fichier, vous pouvez copier l\'image entière en URL de données et la coller directement dans votre code HTML, CSS ou JavaScript. Parfait pour le prototypage rapide et les modèles d\'email.',
        'La taille de police peut être réglée en mode automatique, qui calcule intelligemment la taille optimale en fonction des dimensions de l\'image et de la longueur du texte, ou vous pouvez spécifier manuellement une taille exacte en pixels. Le texte par défaut affiche les dimensions de l\'image, facilitant l\'identification des images placeholder dans vos mises en page.',
        'Que vous soyez développeur frontend, designer UI/UX, chef de projet ou créateur de contenu, ce générateur simplifie votre flux de travail en éliminant le besoin de services externes. Tout fonctionne localement dans votre navigateur, garantissant confidentialité et résultats instantanés.',
      ],
      faq: [
        { q: 'Qu\'est-ce qu\'une image placeholder et pourquoi en ai-je besoin ?', a: 'Une image placeholder est une image temporaire factice utilisée pendant le processus de design ou développement. Elle montre les dimensions et remplit l\'espace où l\'image finale sera placée.' },
        { q: 'Puis-je utiliser ces images placeholder commercialement ?', a: 'Oui, les images générées par cet outil sont entièrement gratuites pour tout usage, y compris les projets commerciaux. Aucun problème de droits d\'auteur.' },
        { q: 'Qu\'est-ce qu\'une URL de données base64 et quand l\'utiliser ?', a: 'Une URL de données base64 encode l\'image entière en texte incorporable directement dans HTML ou CSS. Utilisez-la pour éviter les requêtes de fichiers externes, comme dans les modèles d\'email.' },
        { q: 'Pourquoi l\'outil fonctionne-t-il dans le navigateur ?', a: 'Le traitement côté client via l\'API Canvas génère les images instantanément sans rien télécharger vers un serveur. Cela offre une meilleure confidentialité et des résultats plus rapides.' },
        { q: 'Puis-je générer des images avec un fond transparent ?', a: 'L\'outil supporte actuellement les couleurs de fond solides. Pour la transparence, générez une image PNG et utilisez une couleur de fond proche de votre design.' },
      ],
    },
    de: {
      title: 'Platzhalter-Bild-Generator: Erstellen Sie Benutzerdefinierte Dummy-Bilder Online',
      paragraphs: [
        'Platzhalterbilder sind in Webentwicklungs- und Design-Workflows unverzichtbar. Ob Sie einen Website-Prototyp erstellen, ein Mockup für eine Kundenpräsentation anfertigen oder ein responsives Layout testen — Sie benötigen Bilder bestimmter Dimensionen. Unser kostenloser Generator ermöglicht es Ihnen, benutzerdefinierte Platzhalterbilder sofort in Ihrem Browser zu erstellen.',
        'Dieses Tool generiert Bilder mit der HTML5 Canvas API, was bedeutet, dass alles clientseitig ohne Serverinteraktion geschieht. Ihre Bilder werden niemals hochgeladen oder gespeichert. Stellen Sie einfach Breite und Höhe in Pixeln ein, wählen Sie Hintergrund- und Textfarben, fügen Sie optionalen benutzerdefinierten Text hinzu und laden Sie das Bild im PNG- oder JPEG-Format herunter.',
        'Der Generator enthält beliebte Voreinstellungen für Social-Media-Plattformen wie Facebook Cover (820x312), Instagram Post (1080x1080), Twitter Header (1500x500) und YouTube Thumbnail (1280x720). Diese Voreinstellungen sparen Zeit, indem sie sofort die korrekten Dimensionen einfügen.',
        'Für Entwickler ist die Base64-Kopierfunktion besonders nützlich. Anstatt eine Datei herunterzuladen, können Sie das gesamte Bild als Daten-URL kopieren und direkt in Ihren HTML-, CSS- oder JavaScript-Code einfügen. Perfekt für schnelles Prototyping und E-Mail-Vorlagen.',
        'Die Schriftgröße kann im Auto-Modus eingestellt werden, der intelligent die optimale Textgröße basierend auf den Bildabmessungen und der Textlänge berechnet, oder Sie können manuell eine genaue Pixelgröße angeben. Der Standardtext zeigt die Bildabmessungen an, wodurch Platzhalterbilder in Ihren Layouts leicht zu identifizieren sind.',
        'Ob Sie Frontend-Entwickler, UI/UX-Designer, Projektmanager oder Content-Creator sind — dieser Generator optimiert Ihren Workflow, indem er externe Platzhalter-Dienste überflüssig macht. Alles läuft lokal in Ihrem Browser, was Datenschutz und sofortige Ergebnisse garantiert.',
      ],
      faq: [
        { q: 'Was ist ein Platzhalterbild und warum brauche ich eines?', a: 'Ein Platzhalterbild ist ein temporäres Dummy-Bild, das während des Design- oder Entwicklungsprozesses verwendet wird. Es zeigt die Abmessungen und füllt den Platz, wo das endgültige Bild eingefügt wird.' },
        { q: 'Kann ich diese Platzhalterbilder kommerziell nutzen?', a: 'Ja, die von diesem Tool generierten Bilder sind völlig kostenlos für jeden Zweck, einschließlich kommerzieller Projekte. Es gibt keine Urheberrechts- oder Lizenzprobleme.' },
        { q: 'Was ist eine Base64-Daten-URL und wann sollte ich sie verwenden?', a: 'Eine Base64-Daten-URL kodiert das gesamte Bild als Text, der direkt in HTML oder CSS eingebettet werden kann. Verwenden Sie sie, um externe Dateianfragen zu vermeiden, z.B. in E-Mail-Vorlagen.' },
        { q: 'Warum läuft das Tool im Browser statt auf einem Server?', a: 'Die clientseitige Verarbeitung über die Canvas API generiert Bilder sofort, ohne etwas auf einen Server hochzuladen. Das bietet besseren Datenschutz und schnellere Ergebnisse.' },
        { q: 'Kann ich Bilder mit transparentem Hintergrund generieren?', a: 'Das Tool unterstützt derzeit feste Hintergrundfarben. Für Transparenz generieren Sie ein PNG-Bild und verwenden Sie eine ähnliche Hintergrundfarbe wie Ihr Design.' },
      ],
    },
    pt: {
      title: 'Gerador de Imagens Placeholder: Crie Imagens de Espaço Reservado Personalizadas Online',
      paragraphs: [
        'Imagens placeholder são essenciais nos fluxos de trabalho de desenvolvimento web e design. Seja construindo um protótipo de site, criando um mockup para apresentação ao cliente ou testando um layout responsivo, você precisa de imagens de dimensões específicas. Nosso gerador gratuito permite criar imagens de espaço reservado personalizadas instantaneamente no seu navegador.',
        'Esta ferramenta gera imagens usando a API Canvas do HTML5, o que significa que tudo acontece no lado do cliente sem interação com servidor. Suas imagens nunca são enviadas ou armazenadas. Defina largura e altura em pixels, escolha as cores de fundo e texto, adicione texto personalizado opcional e baixe a imagem em formato PNG ou JPEG.',
        'O gerador inclui tamanhos predefinidos populares para plataformas de mídia social como Capa do Facebook (820x312), Post do Instagram (1080x1080), Cabeçalho do Twitter (1500x500) e Miniatura do YouTube (1280x720). Essas predefinições economizam tempo ao inserir instantaneamente as dimensões corretas.',
        'Para desenvolvedores, o recurso de copiar como base64 é particularmente útil. Em vez de baixar um arquivo, você pode copiar a imagem inteira como URL de dados e colá-la diretamente no seu código HTML, CSS ou JavaScript. Perfeito para prototipagem rápida e templates de email.',
        'O tamanho da fonte pode ser configurado no modo automático, que calcula inteligentemente o tamanho ideal baseado nas dimensões da imagem e comprimento do texto, ou você pode especificar manualmente um tamanho exato em pixels. O texto padrão mostra as dimensões da imagem, facilitando identificar imagens placeholder nos seus layouts.',
        'Seja você desenvolvedor frontend, designer UI/UX, gerente de projeto ou criador de conteúdo, este gerador simplifica seu fluxo de trabalho eliminando a necessidade de serviços externos. Tudo funciona localmente no seu navegador, garantindo privacidade e resultados instantâneos.',
      ],
      faq: [
        { q: 'O que é uma imagem placeholder e por que preciso de uma?', a: 'Uma imagem placeholder é uma imagem temporária usada durante o processo de design ou desenvolvimento. Ela mostra as dimensões e preenche o espaço onde a imagem final será colocada.' },
        { q: 'Posso usar essas imagens placeholder comercialmente?', a: 'Sim, as imagens geradas por esta ferramenta são completamente gratuitas para qualquer uso, incluindo projetos comerciais. Não há problemas de direitos autorais.' },
        { q: 'O que é uma URL de dados base64 e quando devo usá-la?', a: 'Uma URL de dados base64 codifica a imagem inteira como texto que pode ser incorporado diretamente em HTML ou CSS. Use quando quiser evitar requisições de arquivos externos, como em templates de email.' },
        { q: 'Por que a ferramenta funciona no navegador?', a: 'O processamento no lado do cliente via API Canvas gera imagens instantaneamente sem enviar nada a um servidor. Isso oferece melhor privacidade e resultados mais rápidos.' },
        { q: 'Posso gerar imagens com fundo transparente?', a: 'A ferramenta atualmente suporta cores de fundo sólidas. Para transparência, gere uma imagem PNG e use uma cor de fundo próxima ao seu design.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="placeholder-image-generator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('presets')}</label>
            <div className="flex flex-wrap gap-2">
              {presets.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handlePreset(p.w, p.h)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    width === p.w && height === p.h
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {p.label[lang]} ({p.w}x{p.h})
                </button>
              ))}
            </div>
          </div>

          {/* Width & Height */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('width')}</label>
              <input
                type="number"
                min={1}
                max={4096}
                value={width}
                onChange={(e) => setWidth(Math.max(1, Math.min(4096, parseInt(e.target.value) || 1)))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('height')}</label>
              <input
                type="number"
                min={1}
                max={4096}
                value={height}
                onChange={(e) => setHeight(Math.max(1, Math.min(4096, parseInt(e.target.value) || 1)))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-sm"
              />
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('bgColor')}</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setBgColor(v);
                  }}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('textColor')}</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setTextColor(v);
                  }}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Custom Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('customText')}</label>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={t('customTextPlaceholder')}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('fontSize')}</label>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setFontSizeMode('auto')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  fontSizeMode === 'auto' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {t('auto')}
              </button>
              <button
                onClick={() => setFontSizeMode('manual')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  fontSizeMode === 'manual' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {t('manual')}
              </button>
              {fontSizeMode === 'manual' && (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={8}
                    max={500}
                    value={manualFontSize}
                    onChange={(e) => setManualFontSize(Math.max(8, Math.min(500, parseInt(e.target.value) || 8)))}
                    className="w-20 px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-sm"
                  />
                  <span className="text-xs text-gray-500">{t('fontSizePx')}</span>
                </div>
              )}
              {fontSizeMode === 'auto' && (
                <span className="text-xs text-gray-500">{computeFontSize()}px</span>
              )}
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('format')}</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFormat('png')}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  format === 'png' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                PNG
              </button>
              <button
                onClick={() => setFormat('jpeg')}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  format === 'jpeg' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                JPEG
              </button>
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {t('reset')}
          </button>
        </div>

        {/* Live Preview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{t('preview')}</h2>
          <div className="overflow-auto rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center p-4" style={{ maxHeight: '500px' }}>
            <canvas
              ref={canvasRef}
              style={{
                maxWidth: '100%',
                maxHeight: '460px',
                objectFit: 'contain',
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">{width} x {height} px</p>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={handleDownload}
              className="flex-1 min-w-[140px] px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('download')} (.{format})
            </button>
            <button
              onClick={handleCopyBase64}
              className="flex-1 min-w-[140px] px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {copied ? t('copied') : t('copyBase64')}
            </button>
          </div>
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
