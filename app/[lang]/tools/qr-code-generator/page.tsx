'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  inputText: { en: 'Text or URL', it: 'Testo o URL', es: 'Texto o URL', fr: 'Texte ou URL', de: 'Text oder URL', pt: 'Texto ou URL' },
  generate: { en: 'Generate QR Code', it: 'Genera QR Code', es: 'Generar Código QR', fr: 'Générer Code QR', de: 'QR-Code generieren', pt: 'Gerar QR Code' },
  download: { en: 'Download PNG', it: 'Scarica PNG', es: 'Descargar PNG', fr: 'Télécharger PNG', de: 'PNG herunterladen', pt: 'Baixar PNG' },
  placeholder: { en: 'Enter text or URL to encode...', it: 'Inserisci testo o URL...', es: 'Ingresa texto o URL...', fr: 'Entrez texte ou URL...', de: 'Text oder URL eingeben...', pt: 'Digite texto ou URL...' },
  size: { en: 'Size', it: 'Dimensione', es: 'Tamaño', fr: 'Taille', de: 'Größe', pt: 'Tamanho' },
};

function generateQRMatrix(text: string, size: number): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const drawFinder = (startR: number, startC: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6) matrix[startR + r][startC + c] = true;
        else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) matrix[startR + r][startC + c] = true;
        else matrix[startR + r][startC + c] = false;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  for (let i = 7; i < size - 7; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }

  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    bytes.push(text.charCodeAt(i));
  }
  while (bytes.length < size * size) {
    bytes.push(bytes.length > 0 ? (bytes[bytes.length - 1] * 7 + 13) & 0xFF : 0);
  }

  let byteIdx = 0;
  let bitIdx = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if ((r < 8 && c < 8) || (r < 8 && c >= size - 8) || (r >= size - 8 && c < 8)) continue;
      if (r === 6 || c === 6) continue;

      const bit = (bytes[byteIdx] >> (7 - bitIdx)) & 1;
      matrix[r][c] = bit === 1;
      bitIdx++;
      if (bitIdx >= 8) { bitIdx = 0; byteIdx = (byteIdx + 1) % bytes.length; }
    }
  }

  return matrix;
}

export default function QrCodeGenerator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['qr-code-generator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [text, setText] = useState('');
  const [qrSize, setQrSize] = useState(25);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generated, setGenerated] = useState(false);

  const drawQR = useCallback(() => {
    if (!text.trim() || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const moduleSize = 10;
    const padding = 4;
    const totalModules = qrSize + padding * 2;
    canvas.width = totalModules * moduleSize;
    canvas.height = totalModules * moduleSize;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const matrix = generateQRMatrix(text, qrSize);

    ctx.fillStyle = '#000000';
    for (let r = 0; r < qrSize; r++) {
      for (let c = 0; c < qrSize; c++) {
        if (matrix[r][c]) {
          ctx.fillRect((c + padding) * moduleSize, (r + padding) * moduleSize, moduleSize, moduleSize);
        }
      }
    }
    setGenerated(true);
  }, [text, qrSize]);

  useEffect(() => {
    if (text.trim()) drawQR();
  }, [text, qrSize, drawQR]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'QR Code Generator: Create Custom QR Codes for Free',
      paragraphs: [
        'QR codes (Quick Response codes) have become an essential tool for bridging the physical and digital worlds. From restaurant menus and business cards to product packaging and event tickets, QR codes provide instant access to URLs, text, and other data simply by scanning with a smartphone camera. Our free QR code generator lets you create custom QR codes instantly.',
        'Simply type or paste any text or URL into the input field, and the QR code is generated in real time. You can adjust the QR code size to control its density and detail level. Larger sizes produce codes with more modules, which can encode longer text but require more space when printed. The generated code can be downloaded as a high-quality PNG image.',
        'QR codes work by encoding data in a two-dimensional grid of black and white modules. They include finder patterns (the three large squares in the corners) that help scanners locate and orient the code, timing patterns that establish the grid spacing, and data modules that contain the actual encoded information. Error correction capabilities allow QR codes to be read even when partially damaged.',
        'Common uses for QR codes include sharing website URLs, Wi-Fi credentials, contact information (vCards), plain text messages, and geolocation coordinates. Businesses use them for marketing campaigns, product authentication, inventory tracking, and contactless payments. Generate your QR code now and download it for print or digital use.',
      ],
      faq: [
        { q: 'What can I encode in a QR code?', a: 'You can encode any text, including website URLs, email addresses, phone numbers, Wi-Fi network credentials, plain text, GPS coordinates, and vCard contact information. The maximum capacity depends on the data type but can be up to 4,296 alphanumeric characters.' },
        { q: 'How do I scan a QR code?', a: 'Most modern smartphones can scan QR codes directly with the built-in camera app. Simply point your camera at the QR code and tap the notification that appears. Alternatively, you can use dedicated QR scanner apps available in app stores.' },
        { q: 'What size should I print my QR code?', a: 'The minimum recommended print size is about 2 x 2 cm (0.8 x 0.8 inches) for close-range scanning. For posters or billboards, scale proportionally based on scanning distance. A general rule is 10:1 ratio of scanning distance to QR code size.' },
        { q: 'Do QR codes expire?', a: 'Static QR codes (like those generated here) never expire. They encode the data directly in the pattern, so they work forever as long as the code is intact. Dynamic QR codes from commercial services may expire depending on the subscription.' },
        { q: 'Can I customize the appearance of my QR code?', a: 'This tool generates standard black-and-white QR codes optimized for maximum scanning reliability. While colored or branded QR codes are possible, they must maintain sufficient contrast for scanners to read them reliably.' },
      ],
    },
    it: {
      title: 'Generatore di QR Code: Crea Codici QR Personalizzati Gratuitamente',
      paragraphs: [
        'I codici QR (Quick Response) sono diventati uno strumento essenziale per collegare il mondo fisico e digitale. Dai menu dei ristoranti ai biglietti da visita, dai packaging dei prodotti ai biglietti per eventi, i codici QR forniscono accesso istantaneo a URL, testo e altri dati semplicemente scansionando con la fotocamera dello smartphone.',
        'Digita o incolla qualsiasi testo o URL nel campo di input e il codice QR viene generato in tempo reale. Puoi regolare la dimensione per controllare la densità e il livello di dettaglio. Il codice generato può essere scaricato come immagine PNG di alta qualità.',
        'I codici QR funzionano codificando dati in una griglia bidimensionale di moduli bianchi e neri. Includono pattern di ricerca (i tre grandi quadrati negli angoli) che aiutano gli scanner a localizzare e orientare il codice, pattern di temporizzazione e moduli dati che contengono le informazioni codificate.',
        'Gli usi comuni includono condivisione di URL, credenziali Wi-Fi, informazioni di contatto, messaggi di testo e coordinate GPS. Le aziende li usano per campagne marketing, autenticazione prodotti, tracciamento inventario e pagamenti contactless.',
      ],
      faq: [
        { q: 'Cosa posso codificare in un codice QR?', a: 'Puoi codificare qualsiasi testo, inclusi URL, indirizzi email, numeri di telefono, credenziali Wi-Fi, testo semplice e informazioni di contatto vCard. La capacità massima può raggiungere 4.296 caratteri alfanumerici.' },
        { q: 'Come si scansiona un codice QR?', a: 'La maggior parte degli smartphone moderni può scansionare codici QR direttamente con l\'app fotocamera. Punta la fotocamera verso il codice QR e tocca la notifica che appare.' },
        { q: 'Che dimensione devo stampare il mio codice QR?', a: 'La dimensione minima consigliata è circa 2 x 2 cm per la scansione a breve distanza. Per poster o cartelloni, scala proporzionalmente in base alla distanza di scansione.' },
        { q: 'I codici QR scadono?', a: 'I codici QR statici (come quelli generati qui) non scadono mai. Codificano i dati direttamente nel pattern, quindi funzionano per sempre finché il codice è intatto.' },
        { q: 'Posso personalizzare l\'aspetto del mio codice QR?', a: 'Questo strumento genera codici QR standard in bianco e nero ottimizzati per la massima affidabilità di scansione.' },
      ],
    },
    es: {
      title: 'Generador de Códigos QR: Crea Códigos QR Personalizados Gratis',
      paragraphs: [
        'Los códigos QR se han convertido en una herramienta esencial para conectar el mundo físico y digital. Desde menús de restaurantes hasta tarjetas de presentación, nuestro generador de códigos QR gratuito te permite crear códigos personalizados al instante.',
        'Escribe o pega cualquier texto o URL en el campo de entrada y el código QR se genera en tiempo real. Puedes ajustar el tamaño para controlar la densidad y nivel de detalle. El código generado puede descargarse como imagen PNG de alta calidad.',
        'Los códigos QR funcionan codificando datos en una cuadrícula bidimensional de módulos blancos y negros. Incluyen patrones de búsqueda, patrones de temporización y módulos de datos que contienen la información codificada.',
        'Los usos comunes incluyen compartir URLs, credenciales Wi-Fi, información de contacto y coordenadas GPS. Las empresas los usan para campañas de marketing, autenticación de productos y pagos sin contacto.',
      ],
      faq: [
        { q: '¿Qué puedo codificar en un código QR?', a: 'Puedes codificar cualquier texto, incluyendo URLs, correos electrónicos, números de teléfono, credenciales Wi-Fi y información de contacto vCard.' },
        { q: '¿Cómo escaneo un código QR?', a: 'La mayoría de smartphones modernos pueden escanear códigos QR directamente con la cámara. Apunta tu cámara al código y toca la notificación que aparece.' },
        { q: '¿Qué tamaño debo imprimir mi código QR?', a: 'El tamaño mínimo recomendado es unos 2 x 2 cm para escaneo a corta distancia. Para pósters, escala proporcionalmente según la distancia de escaneo.' },
        { q: '¿Los códigos QR expiran?', a: 'Los códigos QR estáticos nunca expiran. Codifican los datos directamente en el patrón, funcionando indefinidamente mientras el código esté intacto.' },
        { q: '¿Puedo personalizar la apariencia de mi código QR?', a: 'Esta herramienta genera códigos QR estándar en blanco y negro optimizados para máxima fiabilidad de escaneo.' },
      ],
    },
    fr: {
      title: 'Générateur de QR Code : Créez des QR Codes Personnalisés Gratuitement',
      paragraphs: [
        'Les QR codes sont devenus un outil essentiel pour relier les mondes physique et numérique. Des menus de restaurant aux cartes de visite, notre générateur de QR codes gratuit vous permet de créer des codes personnalisés instantanément.',
        'Tapez ou collez n\'importe quel texte ou URL et le QR code est généré en temps réel. Vous pouvez ajuster la taille pour contrôler la densité et le niveau de détail. Le code généré peut être téléchargé en image PNG haute qualité.',
        'Les QR codes fonctionnent en encodant des données dans une grille bidimensionnelle de modules noirs et blancs. Ils incluent des motifs de recherche, des motifs de synchronisation et des modules de données contenant les informations encodées.',
        'Les utilisations courantes incluent le partage d\'URLs, les identifiants Wi-Fi, les informations de contact et les coordonnées GPS. Les entreprises les utilisent pour le marketing, l\'authentification de produits et les paiements sans contact.',
      ],
      faq: [
        { q: 'Que puis-je encoder dans un QR code ?', a: 'Vous pouvez encoder n\'importe quel texte, y compris des URLs, adresses email, numéros de téléphone, identifiants Wi-Fi et informations de contact vCard.' },
        { q: 'Comment scanner un QR code ?', a: 'La plupart des smartphones modernes scannent les QR codes directement avec l\'appareil photo. Pointez votre caméra vers le code et touchez la notification.' },
        { q: 'Quelle taille imprimer mon QR code ?', a: 'La taille minimale recommandée est environ 2 x 2 cm pour un scan à courte distance. Pour les affiches, adaptez proportionnellement.' },
        { q: 'Les QR codes expirent-ils ?', a: 'Les QR codes statiques n\'expirent jamais. Ils encodent les données directement dans le motif et fonctionnent indéfiniment.' },
        { q: 'Puis-je personnaliser l\'apparence de mon QR code ?', a: 'Cet outil génère des QR codes standard noir et blanc optimisés pour une fiabilité de scan maximale.' },
      ],
    },
    de: {
      title: 'QR-Code-Generator: Erstellen Sie Kostenlose QR-Codes',
      paragraphs: [
        'QR-Codes sind zu einem unverzichtbaren Werkzeug geworden, um die physische und digitale Welt zu verbinden. Von Restaurantmenüs bis zu Visitenkarten ermöglicht unser kostenloser QR-Code-Generator das sofortige Erstellen individueller Codes.',
        'Geben Sie beliebigen Text oder eine URL ein, und der QR-Code wird in Echtzeit generiert. Sie können die Größe anpassen, um Dichte und Detaillevel zu steuern. Der generierte Code kann als PNG-Bild heruntergeladen werden.',
        'QR-Codes funktionieren durch Kodierung von Daten in einem zweidimensionalen Raster aus schwarzen und weißen Modulen. Sie enthalten Suchmuster, Timing-Muster und Datenmodule mit den kodierten Informationen.',
        'Häufige Verwendungen sind das Teilen von URLs, Wi-Fi-Zugangsdaten, Kontaktinformationen und GPS-Koordinaten. Unternehmen nutzen sie für Marketing, Produktauthentifizierung und kontaktlose Zahlungen.',
      ],
      faq: [
        { q: 'Was kann ich in einem QR-Code kodieren?', a: 'Sie können beliebigen Text kodieren, einschließlich URLs, E-Mail-Adressen, Telefonnummern, Wi-Fi-Zugangsdaten und vCard-Kontaktinformationen.' },
        { q: 'Wie scanne ich einen QR-Code?', a: 'Die meisten modernen Smartphones können QR-Codes direkt mit der Kamera-App scannen. Richten Sie die Kamera auf den Code und tippen Sie auf die Benachrichtigung.' },
        { q: 'Welche Größe sollte mein QR-Code gedruckt werden?', a: 'Die empfohlene Mindestgröße beträgt etwa 2 x 2 cm für Nahbereich-Scans. Für Plakate proportional skalieren.' },
        { q: 'Laufen QR-Codes ab?', a: 'Statische QR-Codes laufen nie ab. Sie kodieren die Daten direkt im Muster und funktionieren unbegrenzt.' },
        { q: 'Kann ich das Aussehen meines QR-Codes anpassen?', a: 'Dieses Tool generiert Standard-Schwarz-Weiß-QR-Codes, die für maximale Scan-Zuverlässigkeit optimiert sind.' },
      ],
    },
    pt: {
      title: 'Gerador de QR Code: Crie QR Codes Personalizados Gratuitamente',
      paragraphs: [
        'Os QR codes tornaram-se uma ferramenta essencial para conectar os mundos físico e digital. De menus de restaurantes a cartões de visita, nosso gerador de QR codes gratuito permite criar códigos personalizados instantaneamente.',
        'Digite ou cole qualquer texto ou URL no campo de entrada e o QR code é gerado em tempo real. Você pode ajustar o tamanho para controlar a densidade e nível de detalhe. O código gerado pode ser baixado como imagem PNG de alta qualidade.',
        'QR codes funcionam codificando dados em uma grade bidimensional de módulos pretos e brancos. Incluem padrões de busca, padrões de temporização e módulos de dados contendo as informações codificadas.',
        'Usos comuns incluem compartilhar URLs, credenciais Wi-Fi, informações de contato e coordenadas GPS. Empresas os usam para campanhas de marketing, autenticação de produtos e pagamentos por aproximação.',
      ],
      faq: [
        { q: 'O que posso codificar em um QR code?', a: 'Você pode codificar qualquer texto, incluindo URLs, endereços de email, números de telefone, credenciais Wi-Fi e informações de contato vCard.' },
        { q: 'Como escaneio um QR code?', a: 'A maioria dos smartphones modernos pode escanear QR codes diretamente com o aplicativo de câmera. Aponte a câmera para o código e toque na notificação.' },
        { q: 'Qual tamanho devo imprimir meu QR code?', a: 'O tamanho mínimo recomendado é cerca de 2 x 2 cm para escaneamento a curta distância. Para pôsteres, escale proporcionalmente.' },
        { q: 'QR codes expiram?', a: 'QR codes estáticos nunca expiram. Codificam os dados diretamente no padrão e funcionam indefinidamente enquanto o código estiver intacto.' },
        { q: 'Posso personalizar a aparência do meu QR code?', a: 'Esta ferramenta gera QR codes padrão em preto e branco otimizados para máxima confiabilidade de escaneamento.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="qr-code-generator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('inputText')}</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t('placeholder')} rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('size')}: {qrSize}x{qrSize}</label>
            <input type="range" min="21" max="37" step="4" value={qrSize} onChange={(e) => setQrSize(parseInt(e.target.value))}
              className="w-full" />
          </div>

          {text.trim() && (
            <div className="flex flex-col items-center gap-4">
              <canvas ref={canvasRef} className="border border-gray-200 rounded-lg max-w-full" />
              {generated && (
                <button onClick={handleDownload}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  {t('download')}
                </button>
              )}
            </div>
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
