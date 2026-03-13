'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  upload: { en: 'Upload Image', it: 'Carica Immagine', es: 'Subir Imagen', fr: 'Télécharger Image', de: 'Bild Hochladen', pt: 'Enviar Imagem' },
  dragDrop: { en: 'Drag & drop or click to upload', it: 'Trascina o clicca per caricare', es: 'Arrastra o haz clic para subir', fr: 'Glissez ou cliquez pour télécharger', de: 'Ziehen oder klicken zum Hochladen', pt: 'Arraste ou clique para enviar' },
  topText: { en: 'Top Text', it: 'Testo Superiore', es: 'Texto Superior', fr: 'Texte en Haut', de: 'Oberer Text', pt: 'Texto Superior' },
  bottomText: { en: 'Bottom Text', it: 'Testo Inferiore', es: 'Texto Inferior', fr: 'Texte en Bas', de: 'Unterer Text', pt: 'Texto Inferior' },
  fontSize: { en: 'Font Size', it: 'Dimensione Font', es: 'Tamaño de Fuente', fr: 'Taille de Police', de: 'Schriftgröße', pt: 'Tamanho da Fonte' },
  textColor: { en: 'Text Color', it: 'Colore Testo', es: 'Color de Texto', fr: 'Couleur du Texte', de: 'Textfarbe', pt: 'Cor do Texto' },
  strokeColor: { en: 'Stroke Color', it: 'Colore Contorno', es: 'Color de Contorno', fr: 'Couleur du Contour', de: 'Konturfarbe', pt: 'Cor do Contorno' },
  bold: { en: 'Bold', it: 'Grassetto', es: 'Negrita', fr: 'Gras', de: 'Fett', pt: 'Negrito' },
  alignment: { en: 'Text Alignment', it: 'Allineamento Testo', es: 'Alineación del Texto', fr: 'Alignement du Texte', de: 'Textausrichtung', pt: 'Alinhamento do Texto' },
  left: { en: 'Left', it: 'Sinistra', es: 'Izquierda', fr: 'Gauche', de: 'Links', pt: 'Esquerda' },
  center: { en: 'Center', it: 'Centro', es: 'Centro', fr: 'Centre', de: 'Mitte', pt: 'Centro' },
  right: { en: 'Right', it: 'Destra', es: 'Derecha', fr: 'Droite', de: 'Rechts', pt: 'Direita' },
  download: { en: 'Download as PNG', it: 'Scarica come PNG', es: 'Descargar como PNG', fr: 'Télécharger en PNG', de: 'Als PNG Herunterladen', pt: 'Baixar como PNG' },
  reset: { en: 'Reset', it: 'Reimposta', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  template: { en: 'Template', it: 'Modello', es: 'Plantilla', fr: 'Modèle', de: 'Vorlage', pt: 'Modelo' },
  orChooseTemplate: { en: 'Or choose a template', it: 'O scegli un modello', es: 'O elige una plantilla', fr: 'Ou choisissez un modèle', de: 'Oder wählen Sie eine Vorlage', pt: 'Ou escolha um modelo' },
  white: { en: 'White', it: 'Bianco', es: 'Blanco', fr: 'Blanc', de: 'Weiß', pt: 'Branco' },
  black: { en: 'Black', it: 'Nero', es: 'Negro', fr: 'Noir', de: 'Schwarz', pt: 'Preto' },
  blue: { en: 'Blue', it: 'Blu', es: 'Azul', fr: 'Bleu', de: 'Blau', pt: 'Azul' },
  preview: { en: 'Preview', it: 'Anteprima', es: 'Vista Previa', fr: 'Aperçu', de: 'Vorschau', pt: 'Pré-visualização' },
  textControls: { en: 'Text Controls', it: 'Controlli Testo', es: 'Controles de Texto', fr: 'Contrôles de Texte', de: 'Textsteuerung', pt: 'Controles de Texto' },
};

type TextAlign = 'left' | 'center' | 'right';

const TEMPLATES = [
  { name: 'white', color: '#ffffff' },
  { name: 'black', color: '#000000' },
  { name: 'blue', color: '#2563eb' },
];

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;

export default function MemeGenerator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['meme-generator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [fontSize, setFontSize] = useState(40);
  const [textColor, setTextColor] = useState('#ffffff');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [bold, setBold] = useState(true);
  const [textAlign, setTextAlign] = useState<TextAlign>('center');
  const [imageLoaded, setImageLoaded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const drawMeme = useCallback((canvas: HTMLCanvasElement, forExport = false) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    // Draw image or background
    if (imgRef.current) {
      ctx.drawImage(imgRef.current, 0, 0, w, h);
    }

    // Text settings
    const fontWeight = bold ? 'bold' : 'normal';
    const scaledFontSize = forExport ? fontSize : Math.round(fontSize * (canvas.width / CANVAS_WIDTH));
    ctx.font = `${fontWeight} ${scaledFontSize}px Impact, Arial Black, sans-serif`;
    ctx.fillStyle = textColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = forExport ? Math.max(2, fontSize / 10) : Math.max(2, scaledFontSize / 10);
    ctx.lineJoin = 'round';

    let alignX: number;
    if (textAlign === 'left') {
      ctx.textAlign = 'left';
      alignX = 20;
    } else if (textAlign === 'right') {
      ctx.textAlign = 'right';
      alignX = w - 20;
    } else {
      ctx.textAlign = 'center';
      alignX = w / 2;
    }

    // Draw top text
    if (topText) {
      ctx.textBaseline = 'top';
      const lines = wrapText(ctx, topText, w - 40);
      lines.forEach((line, i) => {
        const y = 20 + i * (scaledFontSize + 4);
        ctx.strokeText(line, alignX, y);
        ctx.fillText(line, alignX, y);
      });
    }

    // Draw bottom text
    if (bottomText) {
      ctx.textBaseline = 'bottom';
      const lines = wrapText(ctx, bottomText, w - 40);
      const totalHeight = lines.length * (scaledFontSize + 4);
      lines.forEach((line, i) => {
        const y = h - 20 - totalHeight + (i + 1) * (scaledFontSize + 4);
        ctx.strokeText(line, alignX, y);
        ctx.fillText(line, alignX, y);
      });
    }
  }, [topText, bottomText, fontSize, textColor, strokeColor, bold, textAlign]);

  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines.length > 0 ? lines : [''];
  }

  // Redraw preview whenever settings change
  useEffect(() => {
    if (!imageLoaded) return;
    const preview = previewCanvasRef.current;
    if (preview) {
      drawMeme(preview);
    }
  }, [drawMeme, imageLoaded, topText, bottomText, fontSize, textColor, strokeColor, bold, textAlign]);

  const loadImage = (src: string, w: number, h: number) => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      // Set export canvas size to actual image
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = img.naturalWidth || w;
        canvas.height = img.naturalHeight || h;
      }
      // Set preview canvas
      const preview = previewCanvasRef.current;
      if (preview) {
        const aspect = img.naturalWidth / img.naturalHeight;
        preview.width = CANVAS_WIDTH;
        preview.height = Math.round(CANVAS_WIDTH / aspect);
        drawMeme(preview);
      }
      setImageLoaded(true);
    };
    img.src = src;
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    loadImage(url, CANVAS_WIDTH, CANVAS_HEIGHT);
  };

  const handleTemplate = (color: string) => {
    // Create a solid-color image via a temp canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = CANVAS_WIDTH;
    tempCanvas.height = CANVAS_HEIGHT;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const dataUrl = tempCanvas.toDataURL('image/png');
    loadImage(dataUrl, CANVAS_WIDTH, CANVAS_HEIGHT);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current) return;
    // Draw on export canvas at full resolution
    canvas.width = imgRef.current.naturalWidth || CANVAS_WIDTH;
    canvas.height = imgRef.current.naturalHeight || CANVAS_HEIGHT;
    drawMeme(canvas, true);
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleReset = () => {
    setTopText('');
    setBottomText('');
    setFontSize(40);
    setTextColor('#ffffff');
    setStrokeColor('#000000');
    setBold(true);
    setTextAlign('center');
    setImageLoaded(false);
    imgRef.current = null;
    if (fileRef.current) fileRef.current.value = '';
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Meme Generator: Create Custom Memes Instantly in Your Browser',
      paragraphs: [
        'Memes are the universal language of the internet. Whether you want to share a laugh with friends, create social media content, or build engagement on your website, a good meme generator is an essential tool. Our free, browser-based meme generator lets you create custom memes in seconds — no software installation, no account, and no watermarks.',
        'Upload any image from your device or choose from preset solid-color templates (white, black, or blue) to get started. Then add your top and bottom text with full control over font size, text color, stroke (outline) color, bold styling, and text alignment. The real-time canvas preview shows exactly how your meme will look before downloading.',
        'All processing happens locally in your browser using the HTML5 Canvas API. Your images are never uploaded to any server, ensuring complete privacy. The text rendering uses Impact font by default (the classic meme font) with a bold stroke outline for maximum readability on any background.',
        'When you are satisfied with your creation, download it as a high-quality PNG file ready to share on social media, messaging apps, forums, or anywhere else. The exported image maintains the original resolution of your uploaded photo, so your memes always look crisp and professional.'
      ],
      faq: [
        { q: 'Is my image uploaded to a server when I create a meme?', a: 'No. All image processing and text rendering happens locally in your browser using the HTML5 Canvas API. Your image never leaves your device, making this tool completely private.' },
        { q: 'What image formats can I upload?', a: 'You can upload any standard image format supported by your browser, including JPEG, PNG, WebP, GIF, and BMP. The output is always downloaded as a PNG file for best quality.' },
        { q: 'Can I change the font used for meme text?', a: 'The tool uses Impact font by default, which is the classic meme font recognized worldwide. It falls back to Arial Black if Impact is not available on your system. The bold toggle, font size, text color, and stroke color give you extensive customization options.' },
        { q: 'What are the preset templates for?', a: 'The preset templates (white, black, blue) provide solid-color backgrounds so you can create memes without uploading an image. They are useful for text-focused memes, quotes, or when you want a clean background.' },
        { q: 'What resolution is the downloaded meme?', a: 'The downloaded PNG maintains the same resolution as your uploaded image. If you use a preset template, the default resolution is 600x600 pixels. For best results on social media, upload images that are at least 800x800 pixels.' }
      ]
    },
    it: {
      title: 'Generatore di Meme: Crea Meme Personalizzati Istantaneamente nel Browser',
      paragraphs: [
        'I meme sono il linguaggio universale di internet. Che tu voglia condividere una risata con gli amici, creare contenuti per i social media o aumentare l\'engagement sul tuo sito, un buon generatore di meme è uno strumento essenziale. Il nostro generatore di meme gratuito e basato su browser ti permette di creare meme personalizzati in pochi secondi — nessuna installazione, nessun account e nessun watermark.',
        'Carica qualsiasi immagine dal tuo dispositivo o scegli tra modelli preimpostati a colore solido (bianco, nero o blu) per iniziare. Aggiungi il testo superiore e inferiore con pieno controllo su dimensione del font, colore del testo, colore del contorno, stile grassetto e allineamento. L\'anteprima canvas in tempo reale mostra esattamente come apparirà il tuo meme.',
        'Tutta l\'elaborazione avviene localmente nel tuo browser usando l\'API Canvas HTML5. Le tue immagini non vengono mai caricate su alcun server, garantendo completa privacy. Il rendering del testo usa il font Impact di default (il classico font dei meme) con contorno grassetto per massima leggibilità.',
        'Quando sei soddisfatto della tua creazione, scaricala come file PNG ad alta qualità pronto per la condivisione su social media, app di messaggistica, forum o ovunque. L\'immagine esportata mantiene la risoluzione originale della tua foto.'
      ],
      faq: [
        { q: 'La mia immagine viene caricata su un server quando creo un meme?', a: 'No. Tutta l\'elaborazione delle immagini e il rendering del testo avvengono localmente nel browser usando l\'API Canvas HTML5. La tua immagine non lascia mai il tuo dispositivo.' },
        { q: 'Quali formati di immagine posso caricare?', a: 'Puoi caricare qualsiasi formato immagine standard supportato dal browser, inclusi JPEG, PNG, WebP, GIF e BMP. L\'output viene sempre scaricato come file PNG per la migliore qualità.' },
        { q: 'Posso cambiare il font usato per il testo del meme?', a: 'Lo strumento usa il font Impact di default, il classico font dei meme riconosciuto in tutto il mondo. Il toggle grassetto, la dimensione del font, il colore del testo e del contorno offrono ampie opzioni di personalizzazione.' },
        { q: 'A cosa servono i modelli preimpostati?', a: 'I modelli preimpostati (bianco, nero, blu) forniscono sfondi a colore solido per creare meme senza caricare un\'immagine. Sono utili per meme focalizzati sul testo, citazioni o quando vuoi uno sfondo pulito.' },
        { q: 'Qual è la risoluzione del meme scaricato?', a: 'Il PNG scaricato mantiene la stessa risoluzione dell\'immagine caricata. Se usi un modello preimpostato, la risoluzione predefinita è 600x600 pixel. Per risultati ottimali sui social media, carica immagini di almeno 800x800 pixel.' }
      ]
    },
    es: {
      title: 'Generador de Memes: Crea Memes Personalizados Instantáneamente en el Navegador',
      paragraphs: [
        'Los memes son el lenguaje universal de internet. Ya sea que quieras compartir una risa con amigos, crear contenido para redes sociales o aumentar el engagement en tu sitio web, un buen generador de memes es una herramienta esencial. Nuestro generador de memes gratuito y basado en navegador te permite crear memes personalizados en segundos — sin instalación, sin cuenta y sin marcas de agua.',
        'Sube cualquier imagen desde tu dispositivo o elige entre plantillas preestablecidas de color sólido (blanco, negro o azul) para comenzar. Luego agrega tu texto superior e inferior con control total sobre tamaño de fuente, color de texto, color de contorno, estilo negrita y alineación del texto. La vista previa en canvas en tiempo real muestra exactamente cómo se verá tu meme.',
        'Todo el procesamiento ocurre localmente en tu navegador usando la API Canvas de HTML5. Tus imágenes nunca se suben a ningún servidor, garantizando completa privacidad. El renderizado de texto usa la fuente Impact por defecto (la fuente clásica de memes) con contorno grueso para máxima legibilidad.',
        'Cuando estés satisfecho con tu creación, descárgala como archivo PNG de alta calidad listo para compartir en redes sociales, apps de mensajería, foros o cualquier lugar. La imagen exportada mantiene la resolución original de tu foto.'
      ],
      faq: [
        { q: '¿Mi imagen se sube a un servidor cuando creo un meme?', a: 'No. Todo el procesamiento de imágenes y renderizado de texto ocurre localmente en tu navegador usando la API Canvas de HTML5. Tu imagen nunca sale de tu dispositivo.' },
        { q: '¿Qué formatos de imagen puedo subir?', a: 'Puedes subir cualquier formato de imagen estándar soportado por tu navegador, incluyendo JPEG, PNG, WebP, GIF y BMP. La salida siempre se descarga como archivo PNG para mejor calidad.' },
        { q: '¿Puedo cambiar la fuente del texto del meme?', a: 'La herramienta usa la fuente Impact por defecto, la fuente clásica de memes reconocida mundialmente. El botón de negrita, tamaño de fuente, color de texto y color de contorno ofrecen amplias opciones de personalización.' },
        { q: '¿Para qué son las plantillas preestablecidas?', a: 'Las plantillas preestablecidas (blanco, negro, azul) proporcionan fondos de color sólido para crear memes sin subir una imagen. Son útiles para memes enfocados en texto, citas o cuando quieres un fondo limpio.' },
        { q: '¿Cuál es la resolución del meme descargado?', a: 'El PNG descargado mantiene la misma resolución de tu imagen subida. Si usas una plantilla preestablecida, la resolución predeterminada es 600x600 píxeles. Para mejores resultados en redes sociales, sube imágenes de al menos 800x800 píxeles.' }
      ]
    },
    fr: {
      title: 'Générateur de Mèmes : Créez des Mèmes Personnalisés Instantanément dans le Navigateur',
      paragraphs: [
        'Les mèmes sont le langage universel d\'internet. Que vous souhaitiez partager un rire avec des amis, créer du contenu pour les réseaux sociaux ou stimuler l\'engagement sur votre site, un bon générateur de mèmes est un outil essentiel. Notre générateur de mèmes gratuit et basé sur navigateur vous permet de créer des mèmes personnalisés en quelques secondes — sans installation, sans compte et sans filigrane.',
        'Téléchargez n\'importe quelle image depuis votre appareil ou choisissez parmi des modèles prédéfinis de couleur unie (blanc, noir ou bleu) pour commencer. Ajoutez ensuite votre texte en haut et en bas avec un contrôle total sur la taille de police, la couleur du texte, la couleur du contour, le style gras et l\'alignement. L\'aperçu canvas en temps réel montre exactement à quoi ressemblera votre mème.',
        'Tout le traitement se fait localement dans votre navigateur via l\'API Canvas HTML5. Vos images ne sont jamais envoyées à un serveur, garantissant une confidentialité totale. Le rendu du texte utilise la police Impact par défaut (la police classique des mèmes) avec un contour gras pour une lisibilité maximale.',
        'Lorsque vous êtes satisfait de votre création, téléchargez-la sous forme de fichier PNG haute qualité prêt à partager sur les réseaux sociaux, les applications de messagerie, les forums ou partout ailleurs. L\'image exportée conserve la résolution originale de votre photo.'
      ],
      faq: [
        { q: 'Mon image est-elle envoyée à un serveur lorsque je crée un mème ?', a: 'Non. Tout le traitement d\'image et le rendu de texte se font localement dans votre navigateur via l\'API Canvas HTML5. Votre image ne quitte jamais votre appareil.' },
        { q: 'Quels formats d\'image puis-je télécharger ?', a: 'Vous pouvez télécharger n\'importe quel format d\'image standard pris en charge par votre navigateur, y compris JPEG, PNG, WebP, GIF et BMP. La sortie est toujours téléchargée au format PNG pour une meilleure qualité.' },
        { q: 'Puis-je changer la police utilisée pour le texte du mème ?', a: 'L\'outil utilise la police Impact par défaut, la police classique des mèmes reconnue dans le monde entier. Le bouton gras, la taille de police, la couleur du texte et la couleur du contour offrent de nombreuses options de personnalisation.' },
        { q: 'À quoi servent les modèles prédéfinis ?', a: 'Les modèles prédéfinis (blanc, noir, bleu) fournissent des arrière-plans de couleur unie pour créer des mèmes sans télécharger d\'image. Ils sont utiles pour les mèmes axés sur le texte, les citations ou lorsque vous voulez un fond propre.' },
        { q: 'Quelle est la résolution du mème téléchargé ?', a: 'Le PNG téléchargé conserve la même résolution que votre image téléchargée. Si vous utilisez un modèle prédéfini, la résolution par défaut est de 600x600 pixels. Pour de meilleurs résultats sur les réseaux sociaux, téléchargez des images d\'au moins 800x800 pixels.' }
      ]
    },
    de: {
      title: 'Meme-Generator: Erstellen Sie Benutzerdefinierte Memes Sofort im Browser',
      paragraphs: [
        'Memes sind die universelle Sprache des Internets. Ob Sie einen Lacher mit Freunden teilen, Social-Media-Inhalte erstellen oder das Engagement auf Ihrer Website steigern möchten — ein guter Meme-Generator ist ein unverzichtbares Werkzeug. Unser kostenloser, browserbasierter Meme-Generator ermöglicht es Ihnen, benutzerdefinierte Memes in Sekunden zu erstellen — keine Installation, kein Konto und keine Wasserzeichen.',
        'Laden Sie ein beliebiges Bild von Ihrem Gerät hoch oder wählen Sie aus voreingestellten einfarbigen Vorlagen (weiß, schwarz oder blau). Fügen Sie dann Ihren oberen und unteren Text mit voller Kontrolle über Schriftgröße, Textfarbe, Konturfarbe, Fettschrift und Textausrichtung hinzu. Die Echtzeit-Canvas-Vorschau zeigt genau, wie Ihr Meme aussehen wird.',
        'Die gesamte Verarbeitung erfolgt lokal in Ihrem Browser über die HTML5 Canvas API. Ihre Bilder werden niemals auf einen Server hochgeladen, was vollständige Privatsphäre gewährleistet. Das Text-Rendering verwendet standardmäßig die Impact-Schriftart (die klassische Meme-Schrift) mit fettem Umriss für maximale Lesbarkeit.',
        'Wenn Sie mit Ihrer Kreation zufrieden sind, laden Sie sie als hochwertige PNG-Datei herunter, bereit zum Teilen in sozialen Medien, Messaging-Apps, Foren oder überall sonst. Das exportierte Bild behält die Originalauflösung Ihres Fotos bei.'
      ],
      faq: [
        { q: 'Wird mein Bild auf einen Server hochgeladen, wenn ich ein Meme erstelle?', a: 'Nein. Die gesamte Bildverarbeitung und das Text-Rendering erfolgen lokal in Ihrem Browser über die HTML5 Canvas API. Ihr Bild verlässt niemals Ihr Gerät.' },
        { q: 'Welche Bildformate kann ich hochladen?', a: 'Sie können jedes Standard-Bildformat hochladen, das von Ihrem Browser unterstützt wird, einschließlich JPEG, PNG, WebP, GIF und BMP. Die Ausgabe wird immer als PNG-Datei für beste Qualität heruntergeladen.' },
        { q: 'Kann ich die Schriftart für den Meme-Text ändern?', a: 'Das Tool verwendet standardmäßig die Impact-Schriftart, die klassische Meme-Schrift. Der Fett-Schalter, die Schriftgröße, die Textfarbe und die Konturfarbe bieten umfangreiche Anpassungsmöglichkeiten.' },
        { q: 'Wofür sind die voreingestellten Vorlagen?', a: 'Die voreingestellten Vorlagen (weiß, schwarz, blau) bieten einfarbige Hintergründe zum Erstellen von Memes ohne Bildupload. Sie sind nützlich für textfokussierte Memes, Zitate oder wenn Sie einen sauberen Hintergrund möchten.' },
        { q: 'Welche Auflösung hat das heruntergeladene Meme?', a: 'Das heruntergeladene PNG behält die gleiche Auflösung wie Ihr hochgeladenes Bild. Bei Verwendung einer Vorlage beträgt die Standardauflösung 600x600 Pixel. Für beste Ergebnisse in sozialen Medien laden Sie Bilder mit mindestens 800x800 Pixeln hoch.' }
      ]
    },
    pt: {
      title: 'Gerador de Memes: Crie Memes Personalizados Instantaneamente no Navegador',
      paragraphs: [
        'Memes são a linguagem universal da internet. Seja para compartilhar uma risada com amigos, criar conteúdo para mídias sociais ou aumentar o engajamento no seu site, um bom gerador de memes é uma ferramenta essencial. Nosso gerador de memes gratuito e baseado em navegador permite criar memes personalizados em segundos — sem instalação, sem conta e sem marca d\'água.',
        'Envie qualquer imagem do seu dispositivo ou escolha entre modelos predefinidos de cor sólida (branco, preto ou azul) para começar. Adicione seu texto superior e inferior com controle total sobre tamanho da fonte, cor do texto, cor do contorno, estilo negrito e alinhamento. A pré-visualização em canvas em tempo real mostra exatamente como seu meme ficará.',
        'Todo o processamento acontece localmente no seu navegador usando a API Canvas do HTML5. Suas imagens nunca são enviadas a nenhum servidor, garantindo completa privacidade. A renderização de texto usa a fonte Impact por padrão (a fonte clássica de memes) com contorno grosso para máxima legibilidade.',
        'Quando estiver satisfeito com sua criação, baixe-a como arquivo PNG de alta qualidade pronto para compartilhar em mídias sociais, apps de mensagens, fóruns ou qualquer lugar. A imagem exportada mantém a resolução original da sua foto.'
      ],
      faq: [
        { q: 'Minha imagem é enviada para um servidor quando crio um meme?', a: 'Não. Todo o processamento de imagem e renderização de texto acontece localmente no seu navegador usando a API Canvas do HTML5. Sua imagem nunca sai do seu dispositivo.' },
        { q: 'Quais formatos de imagem posso enviar?', a: 'Você pode enviar qualquer formato de imagem padrão suportado pelo seu navegador, incluindo JPEG, PNG, WebP, GIF e BMP. A saída é sempre baixada como arquivo PNG para melhor qualidade.' },
        { q: 'Posso mudar a fonte usada no texto do meme?', a: 'A ferramenta usa a fonte Impact por padrão, a fonte clássica de memes reconhecida mundialmente. O botão de negrito, tamanho da fonte, cor do texto e cor do contorno oferecem amplas opções de personalização.' },
        { q: 'Para que servem os modelos predefinidos?', a: 'Os modelos predefinidos (branco, preto, azul) fornecem fundos de cor sólida para criar memes sem enviar uma imagem. São úteis para memes focados em texto, citações ou quando você quer um fundo limpo.' },
        { q: 'Qual é a resolução do meme baixado?', a: 'O PNG baixado mantém a mesma resolução da imagem enviada. Se usar um modelo predefinido, a resolução padrão é 600x600 pixels. Para melhores resultados em mídias sociais, envie imagens de pelo menos 800x800 pixels.' }
      ]
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="meme-generator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Upload zone */}
          {!imageLoaded && (
            <>
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
              >
                <p className="text-gray-500">{t('dragDrop')}</p>
                <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP, GIF, BMP</p>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
              </div>

              {/* Template buttons */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">{t('orChooseTemplate')}</p>
                <div className="flex gap-3">
                  {TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.name}
                      onClick={() => handleTemplate(tmpl.color)}
                      className="flex-1 py-3 rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors font-medium text-sm"
                      style={{ backgroundColor: tmpl.color, color: tmpl.name === 'black' ? '#fff' : tmpl.name === 'blue' ? '#fff' : '#333' }}
                    >
                      {t(tmpl.name)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Editor */}
          {imageLoaded && (
            <>
              {/* Text inputs */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('topText')}</label>
                  <input
                    type="text"
                    value={topText}
                    onChange={(e) => setTopText(e.target.value.toUpperCase())}
                    placeholder={t('topText')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('bottomText')}</label>
                  <input
                    type="text"
                    value={bottomText}
                    onChange={(e) => setBottomText(e.target.value.toUpperCase())}
                    placeholder={t('bottomText')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Text Controls */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">{t('textControls')}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('fontSize')}: {fontSize}px</label>
                    <input
                      type="range"
                      min="16"
                      max="80"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-end gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t('textColor')}</label>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t('strokeColor')}</label>
                      <input
                        type="color"
                        value={strokeColor}
                        onChange={(e) => setStrokeColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                      />
                    </div>
                    <button
                      onClick={() => setBold(!bold)}
                      className={`px-4 py-2 rounded-lg border text-sm font-bold transition-colors ${bold ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    >
                      B
                    </button>
                  </div>
                </div>
              </div>

              {/* Text alignment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('alignment')}</label>
                <div className="flex gap-2">
                  {(['left', 'center', 'right'] as TextAlign[]).map((align) => (
                    <button
                      key={align}
                      onClick={() => setTextAlign(align)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${textAlign === align ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    >
                      {t(align)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">{t('preview')}</p>
                <div className="bg-gray-100 rounded-lg p-2 flex justify-center">
                  <canvas ref={previewCanvasRef} className="max-w-full rounded" style={{ maxHeight: '400px' }} />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 text-center bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {t('download')}
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

        {/* Hidden export canvas */}
        <canvas ref={canvasRef} className="hidden" />

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
