'use client';
import { useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  formatText: { en: 'Format Text', it: 'Formatta testo', es: 'Formatear texto', fr: 'Formater le texte', de: 'Text formatieren', pt: 'Formatar texto' },
  bold: { en: 'Bold', it: 'Grassetto', es: 'Negrita', fr: 'Gras', de: 'Fett', pt: 'Negrito' },
  italic: { en: 'Italic', it: 'Corsivo', es: 'Cursiva', fr: 'Italique', de: 'Kursiv', pt: 'Itálico' },
  underline: { en: 'Underline', it: 'Sottolineato', es: 'Subrayado', fr: 'Souligné', de: 'Unterstrichen', pt: 'Sublinhado' },
  heading1: { en: 'H1', it: 'H1', es: 'H1', fr: 'H1', de: 'H1', pt: 'H1' },
  heading2: { en: 'H2', it: 'H2', es: 'H2', fr: 'H2', de: 'H2', pt: 'H2' },
  heading3: { en: 'H3', it: 'H3', es: 'H3', fr: 'H3', de: 'H3', pt: 'H3' },
  orderedList: { en: 'Ordered List', it: 'Lista numerata', es: 'Lista ordenada', fr: 'Liste ordonnée', de: 'Nummerierte Liste', pt: 'Lista ordenada' },
  unorderedList: { en: 'Unordered List', it: 'Lista puntata', es: 'Lista desordenada', fr: 'Liste à puces', de: 'Aufzählung', pt: 'Lista não ordenada' },
  alignLeft: { en: 'Left', it: 'Sinistra', es: 'Izquierda', fr: 'Gauche', de: 'Links', pt: 'Esquerda' },
  alignCenter: { en: 'Center', it: 'Centro', es: 'Centro', fr: 'Centre', de: 'Zentriert', pt: 'Centro' },
  alignRight: { en: 'Right', it: 'Destra', es: 'Derecha', fr: 'Droite', de: 'Rechts', pt: 'Direita' },
  pageSize: { en: 'Page Size', it: 'Formato pagina', es: 'Tamaño de página', fr: 'Taille de page', de: 'Seitengröße', pt: 'Tamanho da página' },
  orientation: { en: 'Orientation', it: 'Orientamento', es: 'Orientación', fr: 'Orientation', de: 'Ausrichtung', pt: 'Orientação' },
  portrait: { en: 'Portrait', it: 'Verticale', es: 'Vertical', fr: 'Portrait', de: 'Hochformat', pt: 'Retrato' },
  landscape: { en: 'Landscape', it: 'Orizzontale', es: 'Horizontal', fr: 'Paysage', de: 'Querformat', pt: 'Paisagem' },
  margins: { en: 'Margins', it: 'Margini', es: 'Márgenes', fr: 'Marges', de: 'Ränder', pt: 'Margens' },
  normal: { en: 'Normal', it: 'Normali', es: 'Normales', fr: 'Normales', de: 'Normal', pt: 'Normais' },
  narrow: { en: 'Narrow', it: 'Stretti', es: 'Estrechos', fr: 'Étroites', de: 'Schmal', pt: 'Estreitas' },
  wide: { en: 'Wide', it: 'Ampi', es: 'Amplios', fr: 'Larges', de: 'Breit', pt: 'Largas' },
  fontSize: { en: 'Font Size', it: 'Dimensione font', es: 'Tamaño de fuente', fr: 'Taille de police', de: 'Schriftgröße', pt: 'Tamanho da fonte' },
  fontFamily: { en: 'Font', it: 'Font', es: 'Fuente', fr: 'Police', de: 'Schriftart', pt: 'Fonte' },
  downloadPdf: { en: 'Download PDF', it: 'Scarica PDF', es: 'Descargar PDF', fr: 'Télécharger PDF', de: 'PDF herunterladen', pt: 'Baixar PDF' },
  printPreview: { en: 'Print Preview', it: 'Anteprima stampa', es: 'Vista previa', fr: 'Aperçu', de: 'Druckvorschau', pt: 'Pré-visualização' },
  words: { en: 'Words', it: 'Parole', es: 'Palabras', fr: 'Mots', de: 'Wörter', pt: 'Palavras' },
  characters: { en: 'Characters', it: 'Caratteri', es: 'Caracteres', fr: 'Caractères', de: 'Zeichen', pt: 'Caracteres' },
  estPages: { en: 'Est. Pages', it: 'Pagine stimate', es: 'Págs. estimadas', fr: 'Pages est.', de: 'Gesch. Seiten', pt: 'Págs. estimadas' },
  settings: { en: 'PDF Settings', it: 'Impostazioni PDF', es: 'Configuración PDF', fr: 'Paramètres PDF', de: 'PDF-Einstellungen', pt: 'Configurações PDF' },
  placeholder: { en: 'Start typing or paste your text here...', it: 'Inizia a digitare o incolla il testo qui...', es: 'Comienza a escribir o pega tu texto aquí...', fr: 'Commencez à taper ou collez votre texte ici...', de: 'Beginnen Sie zu tippen oder fügen Sie Text hier ein...', pt: 'Comece a digitar ou cole seu texto aqui...' },
  generating: { en: 'Generating...', it: 'Generazione...', es: 'Generando...', fr: 'Génération...', de: 'Wird generiert...', pt: 'Gerando...' },
  emptyError: { en: 'Please enter some text first', it: 'Inserisci prima del testo', es: 'Por favor ingresa texto primero', fr: 'Veuillez d\'abord saisir du texte', de: 'Bitte geben Sie zuerst Text ein', pt: 'Por favor, insira algum texto primeiro' },
  reset: { en: 'Clear', it: 'Cancella', es: 'Limpiar', fr: 'Effacer', de: 'Löschen', pt: 'Limpar' },
};

type PageSizeKey = 'a4' | 'letter' | 'legal';
type OrientationKey = 'portrait' | 'landscape';
type MarginKey = 'normal' | 'narrow' | 'wide';

const pageSizes: Record<PageSizeKey, { w: number; h: number; label: string }> = {
  a4: { w: 210, h: 297, label: 'A4' },
  letter: { w: 215.9, h: 279.4, label: 'Letter' },
  legal: { w: 215.9, h: 355.6, label: 'Legal' },
};

const marginValues: Record<MarginKey, number> = {
  normal: 25.4,
  narrow: 12.7,
  wide: 38.1,
};

const fontFamilies = [
  { value: 'helvetica', label: 'Helvetica' },
  { value: 'times', label: 'Times New Roman' },
  { value: 'courier', label: 'Courier' },
];

export default function WordToPdf() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['word-to-pdf'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const editorRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState<PageSizeKey>('a4');
  const [orientationKey, setOrientationKey] = useState<OrientationKey>('portrait');
  const [marginKey, setMarginKey] = useState<MarginKey>('normal');
  const [fontSizePt, setFontSizePt] = useState(12);
  const [fontFamily, setFontFamily] = useState('helvetica');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const updateCounts = useCallback(() => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setCharCount(chars);
    setWordCount(words);
  }, []);

  const execCmd = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateCounts();
  };

  const getPlainText = (): string => {
    if (!editorRef.current) return '';
    return editorRef.current.innerText || '';
  };

  const getEstPages = (): number => {
    const ps = pageSizes[pageSize];
    const w = orientationKey === 'portrait' ? ps.w : ps.h;
    const h = orientationKey === 'portrait' ? ps.h : ps.w;
    const margin = marginValues[marginKey];
    const usableH = h - 2 * margin;
    const lineHeight = fontSizePt * 0.3528 * 1.5;
    const linesPerPage = Math.floor(usableH / lineHeight);
    const usableW = w - 2 * margin;
    const avgCharWidth = fontSizePt * 0.3528 * 0.5;
    const charsPerLine = Math.floor(usableW / avgCharWidth);
    const text = getPlainText();
    if (!text.trim()) return 0;
    const lines = text.split('\n');
    let totalLines = 0;
    for (const line of lines) {
      totalLines += Math.max(1, Math.ceil(line.length / charsPerLine));
    }
    return Math.max(1, Math.ceil(totalLines / linesPerPage));
  };

  const generatePdf = useCallback(async () => {
    const text = getPlainText();
    if (!text.trim()) {
      setError(t('emptyError'));
      return;
    }
    setError('');
    setGenerating(true);

    try {
      const { default: jsPDF } = await import('jspdf');
      const ps = pageSizes[pageSize];
      const w = orientationKey === 'portrait' ? ps.w : ps.h;
      const h = orientationKey === 'portrait' ? ps.h : ps.w;
      const margin = marginValues[marginKey];
      const orientation = orientationKey === 'portrait' ? 'p' : 'l';

      const doc = new jsPDF({
        orientation,
        unit: 'mm',
        format: [w, h],
      });

      doc.setFont(fontFamily, 'normal');
      doc.setFontSize(fontSizePt);

      const usableW = w - 2 * margin;
      const lineHeight = fontSizePt * 0.3528 * 1.5;
      const maxY = h - margin;

      // Parse the editor content to extract styled text
      const editorEl = editorRef.current;
      if (!editorEl) return;

      // Walk through the editor HTML to handle formatting
      const processNode = (node: Node, x: number, y: number): number => {
        if (node.nodeType === Node.TEXT_NODE) {
          const textContent = node.textContent || '';
          if (!textContent.trim() && !textContent.includes('\n')) return y;
          const lines = doc.splitTextToSize(textContent, usableW);
          for (const line of lines) {
            if (y > maxY) {
              doc.addPage();
              y = margin;
            }
            doc.text(line, x, y);
            y += lineHeight;
          }
          return y;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          const tag = el.tagName.toLowerCase();
          const style = window.getComputedStyle(el);

          // Handle headings
          const oldSize = fontSizePt;
          let setStyle: 'normal' | 'bold' | 'italic' | 'bolditalic' = 'normal';

          if (tag === 'h1') { doc.setFontSize(fontSizePt * 2); setStyle = 'bold'; }
          else if (tag === 'h2') { doc.setFontSize(fontSizePt * 1.5); setStyle = 'bold'; }
          else if (tag === 'h3') { doc.setFontSize(fontSizePt * 1.17); setStyle = 'bold'; }
          else if (tag === 'b' || tag === 'strong') { setStyle = 'bold'; }
          else if (tag === 'i' || tag === 'em') { setStyle = 'italic'; }
          else if (tag === 'u') { /* underline handled below */ }

          try { doc.setFont(fontFamily, setStyle); } catch { doc.setFont(fontFamily, 'normal'); }

          // Handle text alignment
          let alignX = margin;
          if (style.textAlign === 'center') alignX = w / 2;
          else if (style.textAlign === 'right') alignX = w - margin;

          // Process children
          for (let i = 0; i < node.childNodes.length; i++) {
            y = processNode(node.childNodes[i], tag === 'li' ? margin + 5 : alignX, y);
          }

          // Add spacing after block elements
          if (['h1', 'h2', 'h3', 'p', 'div', 'li', 'br'].includes(tag)) {
            if (tag === 'br') {
              y += lineHeight;
            } else if (['h1', 'h2', 'h3'].includes(tag)) {
              y += lineHeight * 0.5;
            }
          }

          // Restore font
          doc.setFontSize(oldSize);
          try { doc.setFont(fontFamily, 'normal'); } catch { /* ignore */ }

          return y;
        }

        return y;
      };

      let currentY = margin;
      for (let i = 0; i < editorEl.childNodes.length; i++) {
        currentY = processNode(editorEl.childNodes[i], margin, currentY);
      }

      // If no structured content was written, fall back to plain text
      if (currentY <= margin + lineHeight * 0.5) {
        doc.setFont(fontFamily, 'normal');
        doc.setFontSize(fontSizePt);
        const allLines = doc.splitTextToSize(text, usableW);
        let yPos = margin;
        for (const line of allLines) {
          if (yPos > maxY) {
            doc.addPage();
            yPos = margin;
          }
          doc.text(line, margin, yPos);
          yPos += lineHeight;
        }
      }

      doc.save('document.pdf');
    } catch (err) {
      console.error(err);
      setError('PDF generation failed');
    } finally {
      setGenerating(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, orientationKey, marginKey, fontSizePt, fontFamily]);

  const handlePrint = () => {
    if (!editorRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const fontMap: Record<string, string> = {
      helvetica: 'Helvetica, Arial, sans-serif',
      times: '"Times New Roman", Times, serif',
      courier: '"Courier New", Courier, monospace',
    };
    printWindow.document.write(`
      <html><head><title>Print Preview</title>
      <style>
        body { font-family: ${fontMap[fontFamily] || 'sans-serif'}; font-size: ${fontSizePt}pt; margin: ${marginValues[marginKey]}mm; line-height: 1.5; }
        @page { size: ${pageSizes[pageSize].label} ${orientationKey}; margin: ${marginValues[marginKey]}mm; }
      </style></head><body>${editorRef.current.innerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleClear = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
    setWordCount(0);
    setCharCount(0);
    setError('');
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Word to PDF Converter: Create PDF Documents Online for Free',
      paragraphs: [
        'Converting documents to PDF format is one of the most common tasks in today\'s digital workflow. Whether you need to share a report, submit an assignment, or archive important text, PDF (Portable Document Format) ensures your content looks the same on every device and platform. Our free online Word to PDF converter lets you create professional PDF documents directly in your browser.',
        'This tool provides a rich text editor where you can type or paste your content, apply formatting like bold, italic, underline, and headings, and then export everything as a properly formatted PDF file. Unlike other converters that require you to upload files to a server, this tool processes everything locally in your browser, ensuring complete privacy for your documents.',
        'You can customize every aspect of your PDF output: choose between A4, Letter, or Legal page sizes, switch between portrait and landscape orientation, adjust margins from narrow to wide, and select your preferred font family and size. The real-time word and character counter helps you track document length, while the estimated page count lets you know how long your PDF will be before generating it.',
        'Professional users rely on this tool for quick document creation, converting meeting notes to shareable PDFs, generating simple reports, and creating printable documents from web content. The print preview feature lets you see exactly how your document will look before downloading, saving time and ensuring perfect results every time.',
      ],
      faq: [
        { q: 'How do I convert my text to PDF format?', a: 'Simply type or paste your text into the editor, apply any desired formatting (bold, italic, headings, etc.), configure your page settings (size, orientation, margins), and click "Download PDF". The PDF file will be generated and downloaded automatically.' },
        { q: 'Is my document data safe when using this tool?', a: 'Yes, absolutely. All processing happens directly in your browser using JavaScript. Your text is never uploaded to any server. The PDF is generated locally on your device, ensuring complete privacy and security for your documents.' },
        { q: 'What page sizes and formats are supported?', a: 'The converter supports A4 (210x297mm), US Letter (8.5x11 inches), and Legal (8.5x14 inches) page sizes. You can choose portrait or landscape orientation and select from normal, narrow, or wide margins.' },
        { q: 'Can I use custom fonts in the PDF?', a: 'The tool offers three reliable font families: Helvetica (sans-serif), Times New Roman (serif), and Courier (monospace). These fonts are built into the PDF standard and will display correctly on any device without requiring font embedding.' },
        { q: 'What formatting options are available?', a: 'You can apply bold, italic, and underline text styles, create headings (H1, H2, H3), add ordered and unordered lists, and align text left, center, or right. The font size can be adjusted from 8pt to 36pt.' },
      ],
    },
    it: {
      title: 'Convertitore Word in PDF: Crea Documenti PDF Online Gratis',
      paragraphs: [
        'Convertire documenti in formato PDF è una delle operazioni più comuni nel flusso di lavoro digitale di oggi. Che tu debba condividere un report, consegnare un compito o archiviare testi importanti, il PDF (Portable Document Format) garantisce che il contenuto appaia identico su ogni dispositivo e piattaforma. Il nostro convertitore gratuito online Word in PDF ti permette di creare documenti PDF professionali direttamente nel browser.',
        'Questo strumento offre un editor di testo ricco dove puoi digitare o incollare il contenuto, applicare formattazione come grassetto, corsivo, sottolineato e intestazioni, e poi esportare tutto come file PDF formattato. A differenza di altri convertitori che richiedono l\'upload su un server, questo strumento elabora tutto localmente nel browser, garantendo la completa privacy dei tuoi documenti.',
        'Puoi personalizzare ogni aspetto del PDF: scegli tra formati A4, Letter o Legal, passa tra orientamento verticale e orizzontale, regola i margini da stretti ad ampi e seleziona il font e la dimensione preferiti. Il contatore di parole e caratteri in tempo reale ti aiuta a monitorare la lunghezza del documento.',
        'I professionisti usano questo strumento per la creazione rapida di documenti, convertire appunti di riunioni in PDF condivisibili, generare report semplici e creare documenti stampabili da contenuti web. L\'anteprima di stampa ti permette di vedere esattamente come apparirà il documento prima del download.',
      ],
      faq: [
        { q: 'Come converto il mio testo in formato PDF?', a: 'Digita o incolla il testo nell\'editor, applica la formattazione desiderata (grassetto, corsivo, intestazioni ecc.), configura le impostazioni della pagina (formato, orientamento, margini) e clicca "Scarica PDF". Il file PDF verrà generato e scaricato automaticamente.' },
        { q: 'I miei dati sono al sicuro usando questo strumento?', a: 'Sì, assolutamente. Tutta l\'elaborazione avviene direttamente nel browser tramite JavaScript. Il testo non viene mai caricato su alcun server. Il PDF viene generato localmente sul dispositivo, garantendo privacy e sicurezza complete.' },
        { q: 'Quali formati di pagina sono supportati?', a: 'Il convertitore supporta A4 (210x297mm), US Letter (8.5x11 pollici) e Legal (8.5x14 pollici). Puoi scegliere orientamento verticale o orizzontale e margini normali, stretti o ampi.' },
        { q: 'Posso usare font personalizzati nel PDF?', a: 'Lo strumento offre tre famiglie di font affidabili: Helvetica (sans-serif), Times New Roman (serif) e Courier (monospace). Questi font sono integrati nello standard PDF e si visualizzano correttamente su qualsiasi dispositivo.' },
        { q: 'Quali opzioni di formattazione sono disponibili?', a: 'Puoi applicare grassetto, corsivo e sottolineato, creare intestazioni (H1, H2, H3), aggiungere elenchi numerati e puntati e allineare il testo a sinistra, al centro o a destra. La dimensione del font è regolabile da 8pt a 36pt.' },
      ],
    },
    es: {
      title: 'Convertidor Word a PDF: Crea Documentos PDF Online Gratis',
      paragraphs: [
        'Convertir documentos a formato PDF es una de las tareas más comunes en el flujo de trabajo digital actual. Ya sea que necesites compartir un informe, entregar una tarea o archivar textos importantes, PDF garantiza que tu contenido se vea igual en cualquier dispositivo y plataforma. Nuestro convertidor gratuito Word a PDF te permite crear documentos PDF profesionales directamente en tu navegador.',
        'Esta herramienta ofrece un editor de texto enriquecido donde puedes escribir o pegar tu contenido, aplicar formato como negrita, cursiva, subrayado y encabezados, y exportar todo como un archivo PDF formateado. A diferencia de otros conversores que requieren subir archivos a un servidor, esta herramienta procesa todo localmente en tu navegador, garantizando la privacidad completa de tus documentos.',
        'Puedes personalizar cada aspecto de tu PDF: elige entre tamaños A4, Letter o Legal, alterna entre orientación vertical y horizontal, ajusta los márgenes de estrechos a amplios y selecciona tu fuente y tamaño preferidos. El contador de palabras y caracteres en tiempo real te ayuda a rastrear la longitud del documento.',
        'Los profesionales usan esta herramienta para la creación rápida de documentos, convertir notas de reuniones en PDFs compartibles, generar informes simples y crear documentos imprimibles desde contenido web. La vista previa de impresión te permite ver exactamente cómo se verá tu documento antes de descargarlo.',
      ],
      faq: [
        { q: '¿Cómo convierto mi texto a formato PDF?', a: 'Escribe o pega tu texto en el editor, aplica el formato deseado (negrita, cursiva, encabezados, etc.), configura los ajustes de página (tamaño, orientación, márgenes) y haz clic en "Descargar PDF". El archivo se generará y descargará automáticamente.' },
        { q: '¿Mis datos están seguros al usar esta herramienta?', a: 'Sí, absolutamente. Todo el procesamiento ocurre directamente en tu navegador usando JavaScript. Tu texto nunca se sube a ningún servidor. El PDF se genera localmente en tu dispositivo.' },
        { q: '¿Qué tamaños de página se soportan?', a: 'El convertidor soporta A4 (210x297mm), US Letter (8.5x11 pulgadas) y Legal (8.5x14 pulgadas). Puedes elegir orientación vertical u horizontal y márgenes normales, estrechos o amplios.' },
        { q: '¿Puedo usar fuentes personalizadas en el PDF?', a: 'La herramienta ofrece tres familias de fuentes: Helvetica (sans-serif), Times New Roman (serif) y Courier (monospace). Estas fuentes están integradas en el estándar PDF y se muestran correctamente en cualquier dispositivo.' },
        { q: '¿Qué opciones de formato están disponibles?', a: 'Puedes aplicar negrita, cursiva y subrayado, crear encabezados (H1, H2, H3), agregar listas ordenadas y desordenadas, y alinear texto a la izquierda, centro o derecha. El tamaño de fuente se puede ajustar de 8pt a 36pt.' },
      ],
    },
    fr: {
      title: 'Convertisseur Word en PDF : Créez des Documents PDF en Ligne Gratuitement',
      paragraphs: [
        'Convertir des documents au format PDF est l\'une des tâches les plus courantes dans le flux de travail numérique actuel. Que vous ayez besoin de partager un rapport, soumettre un devoir ou archiver des textes importants, le PDF garantit que votre contenu apparaît identique sur chaque appareil et plateforme. Notre convertisseur gratuit Word en PDF vous permet de créer des documents PDF professionnels directement dans votre navigateur.',
        'Cet outil propose un éditeur de texte riche où vous pouvez taper ou coller votre contenu, appliquer une mise en forme comme le gras, l\'italique, le souligné et les titres, puis exporter le tout en fichier PDF formaté. Contrairement à d\'autres convertisseurs qui nécessitent le téléchargement de fichiers sur un serveur, cet outil traite tout localement dans votre navigateur.',
        'Vous pouvez personnaliser chaque aspect de votre PDF : choisissez entre les formats A4, Letter ou Legal, alternez entre orientation portrait et paysage, ajustez les marges de étroites à larges et sélectionnez votre police et taille préférées. Le compteur de mots et de caractères en temps réel vous aide à suivre la longueur du document.',
        'Les professionnels utilisent cet outil pour la création rapide de documents, convertir des notes de réunion en PDF partageables, générer des rapports simples et créer des documents imprimables à partir de contenu web. L\'aperçu avant impression vous permet de voir exactement à quoi ressemblera votre document.',
      ],
      faq: [
        { q: 'Comment convertir mon texte au format PDF ?', a: 'Tapez ou collez votre texte dans l\'éditeur, appliquez la mise en forme souhaitée (gras, italique, titres, etc.), configurez les paramètres de page (taille, orientation, marges) et cliquez sur "Télécharger PDF". Le fichier sera généré et téléchargé automatiquement.' },
        { q: 'Mes données sont-elles en sécurité avec cet outil ?', a: 'Oui, absolument. Tout le traitement se fait directement dans votre navigateur en JavaScript. Votre texte n\'est jamais envoyé sur aucun serveur. Le PDF est généré localement sur votre appareil.' },
        { q: 'Quelles tailles de page sont prises en charge ?', a: 'Le convertisseur prend en charge A4 (210x297mm), US Letter (8.5x11 pouces) et Legal (8.5x14 pouces). Vous pouvez choisir l\'orientation portrait ou paysage et des marges normales, étroites ou larges.' },
        { q: 'Puis-je utiliser des polices personnalisées dans le PDF ?', a: 'L\'outil propose trois familles de polices : Helvetica (sans-serif), Times New Roman (serif) et Courier (monospace). Ces polices sont intégrées au standard PDF et s\'affichent correctement sur tout appareil.' },
        { q: 'Quelles options de mise en forme sont disponibles ?', a: 'Vous pouvez appliquer le gras, l\'italique et le souligné, créer des titres (H1, H2, H3), ajouter des listes ordonnées et non ordonnées, et aligner le texte à gauche, au centre ou à droite. La taille de police est ajustable de 8pt à 36pt.' },
      ],
    },
    de: {
      title: 'Word zu PDF Konverter: PDF-Dokumente Online Kostenlos Erstellen',
      paragraphs: [
        'Das Konvertieren von Dokumenten ins PDF-Format ist eine der häufigsten Aufgaben im heutigen digitalen Arbeitsablauf. Ob Sie einen Bericht teilen, eine Aufgabe einreichen oder wichtige Texte archivieren müssen, PDF (Portable Document Format) stellt sicher, dass Ihr Inhalt auf jedem Gerät und jeder Plattform gleich aussieht. Unser kostenloser Online-Konverter Word zu PDF ermöglicht es Ihnen, professionelle PDF-Dokumente direkt im Browser zu erstellen.',
        'Dieses Tool bietet einen Rich-Text-Editor, in dem Sie Ihren Inhalt eingeben oder einfügen, Formatierung wie Fett, Kursiv, Unterstrichen und Überschriften anwenden und alles als formatierte PDF-Datei exportieren können. Anders als andere Konverter, die das Hochladen auf einen Server erfordern, verarbeitet dieses Tool alles lokal in Ihrem Browser und gewährleistet vollständige Privatsphäre.',
        'Sie können jeden Aspekt Ihres PDFs anpassen: Wählen Sie zwischen A4, Letter oder Legal, wechseln Sie zwischen Hoch- und Querformat, passen Sie die Ränder von schmal bis breit an und wählen Sie Ihre bevorzugte Schriftart und -größe. Der Echtzeit-Wort- und Zeichenzähler hilft Ihnen, die Dokumentlänge zu verfolgen.',
        'Profis nutzen dieses Tool für die schnelle Dokumenterstellung, zum Konvertieren von Besprechungsnotizen in teilbare PDFs, zum Generieren einfacher Berichte und zum Erstellen druckbarer Dokumente aus Webinhalten. Die Druckvorschau zeigt Ihnen genau, wie Ihr Dokument aussehen wird.',
      ],
      faq: [
        { q: 'Wie konvertiere ich meinen Text ins PDF-Format?', a: 'Geben Sie Ihren Text in den Editor ein oder fügen Sie ihn ein, wenden Sie die gewünschte Formatierung an (Fett, Kursiv, Überschriften usw.), konfigurieren Sie die Seiteneinstellungen (Größe, Ausrichtung, Ränder) und klicken Sie auf "PDF herunterladen". Die Datei wird automatisch generiert und heruntergeladen.' },
        { q: 'Sind meine Daten bei der Nutzung dieses Tools sicher?', a: 'Ja, absolut. Die gesamte Verarbeitung erfolgt direkt in Ihrem Browser mit JavaScript. Ihr Text wird niemals auf einen Server hochgeladen. Das PDF wird lokal auf Ihrem Gerät generiert.' },
        { q: 'Welche Seitengrößen werden unterstützt?', a: 'Der Konverter unterstützt A4 (210x297mm), US Letter (8,5x11 Zoll) und Legal (8,5x14 Zoll). Sie können zwischen Hoch- und Querformat wählen und normale, schmale oder breite Ränder einstellen.' },
        { q: 'Kann ich benutzerdefinierte Schriftarten im PDF verwenden?', a: 'Das Tool bietet drei Schriftfamilien: Helvetica (serifenlos), Times New Roman (Serifen) und Courier (Festbreite). Diese Schriftarten sind im PDF-Standard integriert und werden auf jedem Gerät korrekt angezeigt.' },
        { q: 'Welche Formatierungsoptionen sind verfügbar?', a: 'Sie können Fett, Kursiv und Unterstrichen anwenden, Überschriften erstellen (H1, H2, H3), geordnete und ungeordnete Listen hinzufügen und Text links, zentriert oder rechts ausrichten. Die Schriftgröße ist von 8pt bis 36pt einstellbar.' },
      ],
    },
    pt: {
      title: 'Conversor Word para PDF: Crie Documentos PDF Online Grátis',
      paragraphs: [
        'Converter documentos para o formato PDF é uma das tarefas mais comuns no fluxo de trabalho digital atual. Seja para compartilhar um relatório, entregar um trabalho ou arquivar textos importantes, o PDF (Portable Document Format) garante que seu conteúdo apareça igual em qualquer dispositivo e plataforma. Nosso conversor gratuito Word para PDF permite criar documentos PDF profissionais diretamente no navegador.',
        'Esta ferramenta oferece um editor de texto rico onde você pode digitar ou colar seu conteúdo, aplicar formatação como negrito, itálico, sublinhado e cabeçalhos, e exportar tudo como um arquivo PDF formatado. Diferente de outros conversores que exigem upload para um servidor, esta ferramenta processa tudo localmente no seu navegador, garantindo privacidade completa.',
        'Você pode personalizar cada aspecto do seu PDF: escolha entre tamanhos A4, Letter ou Legal, alterne entre orientação retrato e paisagem, ajuste as margens de estreitas a largas e selecione sua fonte e tamanho preferidos. O contador de palavras e caracteres em tempo real ajuda a acompanhar o comprimento do documento.',
        'Profissionais usam esta ferramenta para criação rápida de documentos, converter notas de reuniões em PDFs compartilháveis, gerar relatórios simples e criar documentos imprimíveis a partir de conteúdo web. A pré-visualização de impressão permite ver exatamente como seu documento ficará antes de baixá-lo.',
      ],
      faq: [
        { q: 'Como converto meu texto para formato PDF?', a: 'Digite ou cole seu texto no editor, aplique a formatação desejada (negrito, itálico, cabeçalhos, etc.), configure as definições de página (tamanho, orientação, margens) e clique em "Baixar PDF". O arquivo será gerado e baixado automaticamente.' },
        { q: 'Meus dados estão seguros ao usar esta ferramenta?', a: 'Sim, absolutamente. Todo o processamento acontece diretamente no seu navegador usando JavaScript. Seu texto nunca é enviado para nenhum servidor. O PDF é gerado localmente no seu dispositivo.' },
        { q: 'Quais tamanhos de página são suportados?', a: 'O conversor suporta A4 (210x297mm), US Letter (8.5x11 polegadas) e Legal (8.5x14 polegadas). Você pode escolher orientação retrato ou paisagem e margens normais, estreitas ou largas.' },
        { q: 'Posso usar fontes personalizadas no PDF?', a: 'A ferramenta oferece três famílias de fontes: Helvetica (sem serifa), Times New Roman (serifa) e Courier (monoespaçada). Essas fontes são integradas ao padrão PDF e são exibidas corretamente em qualquer dispositivo.' },
        { q: 'Quais opções de formatação estão disponíveis?', a: 'Você pode aplicar negrito, itálico e sublinhado, criar cabeçalhos (H1, H2, H3), adicionar listas ordenadas e não ordenadas, e alinhar texto à esquerda, centro ou direita. O tamanho da fonte é ajustável de 8pt a 36pt.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqItems = seo.faq;

  return (
    <ToolPageWrapper toolSlug="word-to-pdf" faqItems={faqItems}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Formatting Toolbar */}
          <div className="flex flex-wrap gap-1 border border-gray-200 rounded-lg p-2 bg-gray-50">
            <button onClick={() => execCmd('bold')} className="px-2 py-1 rounded hover:bg-gray-200 font-bold text-sm" title={t('bold')}>B</button>
            <button onClick={() => execCmd('italic')} className="px-2 py-1 rounded hover:bg-gray-200 italic text-sm" title={t('italic')}>I</button>
            <button onClick={() => execCmd('underline')} className="px-2 py-1 rounded hover:bg-gray-200 underline text-sm" title={t('underline')}>U</button>
            <span className="w-px bg-gray-300 mx-1" />
            <button onClick={() => execCmd('formatBlock', 'h1')} className="px-2 py-1 rounded hover:bg-gray-200 text-xs font-bold" title={t('heading1')}>H1</button>
            <button onClick={() => execCmd('formatBlock', 'h2')} className="px-2 py-1 rounded hover:bg-gray-200 text-xs font-bold" title={t('heading2')}>H2</button>
            <button onClick={() => execCmd('formatBlock', 'h3')} className="px-2 py-1 rounded hover:bg-gray-200 text-xs font-bold" title={t('heading3')}>H3</button>
            <span className="w-px bg-gray-300 mx-1" />
            <button onClick={() => execCmd('insertOrderedList')} className="px-2 py-1 rounded hover:bg-gray-200 text-sm" title={t('orderedList')}>1.</button>
            <button onClick={() => execCmd('insertUnorderedList')} className="px-2 py-1 rounded hover:bg-gray-200 text-sm" title={t('unorderedList')}>&#8226;</button>
            <span className="w-px bg-gray-300 mx-1" />
            <button onClick={() => execCmd('justifyLeft')} className="px-2 py-1 rounded hover:bg-gray-200 text-sm" title={t('alignLeft')}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M3 6h18M3 12h12M3 18h16" /></svg>
            </button>
            <button onClick={() => execCmd('justifyCenter')} className="px-2 py-1 rounded hover:bg-gray-200 text-sm" title={t('alignCenter')}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M3 6h18M6 12h12M4 18h16" /></svg>
            </button>
            <button onClick={() => execCmd('justifyRight')} className="px-2 py-1 rounded hover:bg-gray-200 text-sm" title={t('alignRight')}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M3 6h18M9 12h12M5 18h16" /></svg>
            </button>
          </div>

          {/* Rich Text Editor */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={updateCounts}
            onPaste={updateCounts}
            data-placeholder={t('placeholder')}
            className="min-h-[300px] w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
            style={{ fontFamily: fontFamily === 'times' ? '"Times New Roman", serif' : fontFamily === 'courier' ? '"Courier New", monospace' : 'Helvetica, Arial, sans-serif', fontSize: `${fontSizePt}pt` }}
          />

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-blue-700">{wordCount}</p>
              <p className="text-xs text-blue-600">{t('words')}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-green-700">{charCount}</p>
              <p className="text-xs text-green-600">{t('characters')}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-purple-700">{getEstPages()}</p>
              <p className="text-xs text-purple-600">{t('estPages')}</p>
            </div>
          </div>

          {/* PDF Settings */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold text-gray-700">{t('settings')}</p>
            <div className="grid grid-cols-2 gap-3">
              {/* Page Size */}
              <div>
                <label className="text-xs text-gray-600 block mb-1">{t('pageSize')}</label>
                <select value={pageSize} onChange={(e) => setPageSize(e.target.value as PageSizeKey)} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="a4">A4</option>
                  <option value="letter">Letter</option>
                  <option value="legal">Legal</option>
                </select>
              </div>
              {/* Orientation */}
              <div>
                <label className="text-xs text-gray-600 block mb-1">{t('orientation')}</label>
                <select value={orientationKey} onChange={(e) => setOrientationKey(e.target.value as OrientationKey)} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="portrait">{t('portrait')}</option>
                  <option value="landscape">{t('landscape')}</option>
                </select>
              </div>
              {/* Margins */}
              <div>
                <label className="text-xs text-gray-600 block mb-1">{t('margins')}</label>
                <select value={marginKey} onChange={(e) => setMarginKey(e.target.value as MarginKey)} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="normal">{t('normal')}</option>
                  <option value="narrow">{t('narrow')}</option>
                  <option value="wide">{t('wide')}</option>
                </select>
              </div>
              {/* Font Family */}
              <div>
                <label className="text-xs text-gray-600 block mb-1">{t('fontFamily')}</label>
                <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  {fontFamilies.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              {/* Font Size */}
              <div className="col-span-2">
                <label className="text-xs text-gray-600 block mb-1">{t('fontSize')}: {fontSizePt}pt</label>
                <input type="range" min={8} max={36} value={fontSizePt} onChange={(e) => setFontSizePt(Number(e.target.value))} className="w-full accent-blue-600" />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={generatePdf}
              disabled={generating}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? t('generating') : t('downloadPdf')}
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              {t('printPreview')}
            </button>
            <button
              onClick={handleClear}
              className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              {t('reset')}
            </button>
          </div>
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
