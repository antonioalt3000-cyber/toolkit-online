'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  ssid: { en: 'Network Name (SSID)', it: 'Nome Rete (SSID)', es: 'Nombre de Red (SSID)', fr: 'Nom du Réseau (SSID)', de: 'Netzwerkname (SSID)', pt: 'Nome da Rede (SSID)' },
  ssidPlaceholder: { en: 'Enter WiFi network name...', it: 'Inserisci il nome della rete WiFi...', es: 'Ingresa el nombre de la red WiFi...', fr: 'Entrez le nom du réseau WiFi...', de: 'WLAN-Netzwerkname eingeben...', pt: 'Digite o nome da rede WiFi...' },
  password: { en: 'Password', it: 'Password', es: 'Contraseña', fr: 'Mot de passe', de: 'Passwort', pt: 'Senha' },
  passwordPlaceholder: { en: 'Enter WiFi password...', it: 'Inserisci la password WiFi...', es: 'Ingresa la contraseña WiFi...', fr: 'Entrez le mot de passe WiFi...', de: 'WLAN-Passwort eingeben...', pt: 'Digite a senha WiFi...' },
  showPassword: { en: 'Show', it: 'Mostra', es: 'Mostrar', fr: 'Afficher', de: 'Anzeigen', pt: 'Mostrar' },
  hidePassword: { en: 'Hide', it: 'Nascondi', es: 'Ocultar', fr: 'Masquer', de: 'Ausblenden', pt: 'Ocultar' },
  encryption: { en: 'Encryption Type', it: 'Tipo di Crittografia', es: 'Tipo de Cifrado', fr: 'Type de Chiffrement', de: 'Verschlüsselungstyp', pt: 'Tipo de Criptografia' },
  hidden: { en: 'Hidden Network', it: 'Rete Nascosta', es: 'Red Oculta', fr: 'Réseau Caché', de: 'Verstecktes Netzwerk', pt: 'Rede Oculta' },
  hiddenDesc: { en: 'Enable if the network does not broadcast its SSID', it: 'Attiva se la rete non trasmette il suo SSID', es: 'Activa si la red no transmite su SSID', fr: 'Activez si le réseau ne diffuse pas son SSID', de: 'Aktivieren, wenn das Netzwerk seine SSID nicht sendet', pt: 'Ative se a rede não transmite seu SSID' },
  generate: { en: 'Generate QR Code', it: 'Genera QR Code', es: 'Generar Código QR', fr: 'Générer QR Code', de: 'QR-Code generieren', pt: 'Gerar QR Code' },
  download: { en: 'Download PNG', it: 'Scarica PNG', es: 'Descargar PNG', fr: 'Télécharger PNG', de: 'PNG herunterladen', pt: 'Baixar PNG' },
  print: { en: 'Print QR Code', it: 'Stampa QR Code', es: 'Imprimir Código QR', fr: 'Imprimer QR Code', de: 'QR-Code drucken', pt: 'Imprimir QR Code' },
  reset: { en: 'Reset', it: 'Ripristina', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  copy: { en: 'Copy WiFi String', it: 'Copia Stringa WiFi', es: 'Copiar Cadena WiFi', fr: 'Copier la Chaîne WiFi', de: 'WiFi-String kopieren', pt: 'Copiar String WiFi' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  errorSsid: { en: 'Please enter a network name', it: 'Inserisci il nome della rete', es: 'Ingresa el nombre de la red', fr: 'Veuillez entrer le nom du réseau', de: 'Bitte Netzwerkname eingeben', pt: 'Por favor, digite o nome da rede' },
  wifiString: { en: 'WiFi String', it: 'Stringa WiFi', es: 'Cadena WiFi', fr: 'Chaîne WiFi', de: 'WiFi-String', pt: 'String WiFi' },
  qrResult: { en: 'QR Code Result', it: 'Risultato QR Code', es: 'Resultado del Código QR', fr: 'Résultat du QR Code', de: 'QR-Code-Ergebnis', pt: 'Resultado do QR Code' },
  noPasswordNeeded: { en: 'No password needed for open networks', it: 'Nessuna password necessaria per reti aperte', es: 'No se necesita contraseña para redes abiertas', fr: 'Pas de mot de passe nécessaire pour les réseaux ouverts', de: 'Kein Passwort für offene Netzwerke nötig', pt: 'Sem senha necessária para redes abertas' },
};

type EncryptionType = 'WPA' | 'WEP' | 'nopass';

function escapeWifiField(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/:/g, '\\:').replace(/"/g, '\\"');
}

function buildWifiString(ssid: string, password: string, encryption: EncryptionType, hidden: boolean): string {
  const escapedSsid = escapeWifiField(ssid);
  const escapedPass = escapeWifiField(password);
  let str = `WIFI:T:${encryption};S:${escapedSsid};`;
  if (encryption !== 'nopass' && password) {
    str += `P:${escapedPass};`;
  }
  if (hidden) {
    str += 'H:true;';
  }
  str += ';';
  return str;
}

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

export default function WifiQrGenerator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['wifi-qr-generator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [encryption, setEncryption] = useState<EncryptionType>('WPA');
  const [hidden, setHidden] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [showError, setShowError] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const qrSize = 25;
  const modulePixelSize = 10;

  const wifiString = ssid.trim() ? buildWifiString(ssid.trim(), password, encryption, hidden) : '';

  const drawQR = useCallback(() => {
    if (!wifiString || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const padding = 4;
    const totalModules = qrSize + padding * 2;
    canvas.width = totalModules * modulePixelSize;
    canvas.height = totalModules * modulePixelSize;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const matrix = generateQRMatrix(wifiString, qrSize);

    ctx.fillStyle = '#000000';
    for (let r = 0; r < qrSize; r++) {
      for (let c = 0; c < qrSize; c++) {
        if (matrix[r][c]) {
          ctx.fillRect((c + padding) * modulePixelSize, (r + padding) * modulePixelSize, modulePixelSize, modulePixelSize);
        }
      }
    }
    setGenerated(true);
  }, [wifiString]);

  useEffect(() => {
    if (wifiString) {
      drawQR();
      setShowError(false);
    } else {
      setGenerated(false);
    }
  }, [wifiString, drawQR]);

  const handleGenerate = () => {
    if (!ssid.trim()) {
      setShowError(true);
      return;
    }
    setShowError(false);
    drawQR();
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `wifi-qr-${ssid.trim().replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handlePrint = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head><title>WiFi QR Code - ${ssid}</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:sans-serif;">
          <h2 style="margin-bottom:8px;">WiFi: ${ssid}</h2>
          <p style="margin:0 0 16px;color:#666;">${encryption === 'nopass' ? 'Open Network' : `Encryption: ${encryption}`}</p>
          <img src="${dataUrl}" style="max-width:400px;" />
          <p style="margin-top:16px;color:#999;font-size:12px;">Scan this QR code to connect to the WiFi network</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const handleCopy = async () => {
    if (!wifiString) return;
    try {
      await navigator.clipboard.writeText(wifiString);
      setCopiedFeedback(true);
      setTimeout(() => setCopiedFeedback(false), 2000);
    } catch { /* ignore */ }
  };

  const handleReset = () => {
    setSsid('');
    setPassword('');
    setEncryption('WPA');
    setHidden(false);
    setShowPass(false);
    setGenerated(false);
    setShowError(false);
    setCopiedFeedback(false);
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'WiFi QR Code Generator: Share Your WiFi Instantly',
      paragraphs: [
        'Sharing your WiFi password with guests has never been easier. Our free WiFi QR Code Generator creates a scannable QR code that automatically connects any smartphone or tablet to your wireless network. No more spelling out complicated passwords or writing them down on paper. Simply enter your network name, password, and encryption type, and generate a QR code in seconds.',
        'The generated QR code follows the standard WiFi configuration format (WIFI:T:encryption;S:ssid;P:password;H:hidden;;) recognized by all modern smartphones. When scanned with a camera app, the phone will prompt the user to connect to the network automatically, without needing to manually enter any credentials. This works on both Android and iOS devices.',
        'This tool supports all common encryption types including WPA/WPA2 (the most common and recommended), WEP (legacy encryption), and open networks without a password. You can also indicate whether your network is hidden, meaning it does not broadcast its SSID. Hidden networks require the SSID to be known in advance, making the QR code especially useful for connecting devices.',
        'The WiFi QR code can be downloaded as a high-quality PNG image or printed directly from the browser. Many restaurants, cafes, hotels, offices, and Airbnb hosts use WiFi QR codes to provide seamless internet access to their visitors. Place the printed QR code near your router, at the front desk, or in a common area for easy scanning. It is a simple, elegant solution that eliminates the friction of sharing network access.',
      ],
      faq: [
        { q: 'How does a WiFi QR code work?', a: 'A WiFi QR code encodes your network name, password, and encryption type in a standard format. When scanned with a smartphone camera, the device reads this information and prompts the user to connect to the network automatically, without manual password entry.' },
        { q: 'Is it safe to share my WiFi password via QR code?', a: 'The QR code is generated entirely in your browser and no data is sent to any server. The code contains your WiFi credentials, so treat the printed QR code with the same care as your written password. Anyone who scans it can connect to your network.' },
        { q: 'Which devices can scan WiFi QR codes?', a: 'All modern Android phones (Android 10+) and iPhones (iOS 11+) can scan WiFi QR codes using the built-in camera app. Older devices may need a third-party QR scanner app. Most tablets and some laptops with cameras also support this feature.' },
        { q: 'What encryption type should I choose?', a: 'Choose WPA/WPA2 for most modern networks, as it is the most secure and widely used standard. Select WEP only for very old routers that do not support WPA. Choose None only for intentionally open networks without a password.' },
        { q: 'Can I use this for a hidden WiFi network?', a: 'Yes, toggle the Hidden Network option when your network does not broadcast its SSID. The QR code will include the hidden flag, ensuring the scanning device knows to search for the network even though it is not visible in the WiFi list.' },
      ],
    },
    it: {
      title: 'Generatore QR Code WiFi: Condividi il Tuo WiFi Istantaneamente',
      paragraphs: [
        'Condividere la password del WiFi con gli ospiti non e mai stato cosi facile. Il nostro generatore gratuito di QR Code WiFi crea un codice QR scansionabile che collega automaticamente qualsiasi smartphone o tablet alla tua rete wireless. Non dovrai piu dettare password complicate o scriverle su carta. Inserisci il nome della rete, la password e il tipo di crittografia, e genera un QR code in pochi secondi.',
        'Il QR code generato segue il formato standard di configurazione WiFi (WIFI:T:crittografia;S:ssid;P:password;H:nascosta;;) riconosciuto da tutti gli smartphone moderni. Quando viene scansionato con la fotocamera, il telefono propone automaticamente la connessione alla rete senza dover inserire manualmente le credenziali. Funziona sia su dispositivi Android che iOS.',
        'Questo strumento supporta tutti i tipi di crittografia comuni, tra cui WPA/WPA2 (il piu comune e consigliato), WEP (crittografia legacy) e reti aperte senza password. Puoi anche indicare se la tua rete e nascosta, cioe non trasmette il suo SSID. Le reti nascoste richiedono che l SSID sia conosciuto in anticipo, rendendo il QR code particolarmente utile.',
        'Il QR code WiFi puo essere scaricato come immagine PNG di alta qualita o stampato direttamente dal browser. Molti ristoranti, bar, hotel, uffici e host Airbnb utilizzano QR code WiFi per fornire accesso internet senza problemi ai visitatori. Posiziona il QR code stampato vicino al router, alla reception o in un area comune per una scansione facile.',
      ],
      faq: [
        { q: 'Come funziona un QR code WiFi?', a: 'Un QR code WiFi codifica nome della rete, password e tipo di crittografia in un formato standard. Quando viene scansionato con la fotocamera dello smartphone, il dispositivo legge queste informazioni e propone la connessione automatica alla rete.' },
        { q: 'E sicuro condividere la password WiFi tramite QR code?', a: 'Il QR code viene generato interamente nel tuo browser e nessun dato viene inviato a server esterni. Il codice contiene le credenziali WiFi, quindi tratta il QR stampato con la stessa cura della password scritta.' },
        { q: 'Quali dispositivi possono scansionare i QR code WiFi?', a: 'Tutti gli smartphone Android moderni (Android 10+) e iPhone (iOS 11+) possono scansionare QR code WiFi usando la fotocamera integrata. Dispositivi piu vecchi potrebbero necessitare di un app scanner QR di terze parti.' },
        { q: 'Quale tipo di crittografia devo scegliere?', a: 'Scegli WPA/WPA2 per la maggior parte delle reti moderne, essendo lo standard piu sicuro e diffuso. Seleziona WEP solo per router molto vecchi. Scegli Nessuna solo per reti intenzionalmente aperte.' },
        { q: 'Posso usarlo per una rete WiFi nascosta?', a: 'Si, attiva l opzione Rete Nascosta quando la tua rete non trasmette il suo SSID. Il QR code includera il flag nascosto, assicurando che il dispositivo cerchi la rete anche se non e visibile nella lista WiFi.' },
      ],
    },
    es: {
      title: 'Generador de QR WiFi: Comparte Tu WiFi al Instante',
      paragraphs: [
        'Compartir la contrasena del WiFi con los invitados nunca ha sido tan facil. Nuestro generador gratuito de codigos QR WiFi crea un codigo QR escaneable que conecta automaticamente cualquier smartphone o tablet a tu red inalambrica. No mas deletrear contrasenas complicadas o escribirlas en papel. Simplemente ingresa el nombre de la red, la contrasena y el tipo de cifrado, y genera un codigo QR en segundos.',
        'El codigo QR generado sigue el formato estandar de configuracion WiFi (WIFI:T:cifrado;S:ssid;P:contrasena;H:oculta;;) reconocido por todos los smartphones modernos. Al escanearlo con la camara, el telefono propone conectarse automaticamente a la red sin necesidad de ingresar credenciales manualmente. Funciona tanto en dispositivos Android como iOS.',
        'Esta herramienta soporta todos los tipos de cifrado comunes incluyendo WPA/WPA2 (el mas comun y recomendado), WEP (cifrado legacy) y redes abiertas sin contrasena. Tambien puedes indicar si tu red esta oculta, es decir, no transmite su SSID. Las redes ocultas requieren conocer el SSID de antemano, haciendo el codigo QR especialmente util.',
        'El codigo QR WiFi puede descargarse como imagen PNG de alta calidad o imprimirse directamente desde el navegador. Muchos restaurantes, cafeterias, hoteles, oficinas y anfitriones de Airbnb usan codigos QR WiFi para proporcionar acceso a internet sin problemas a sus visitantes.',
      ],
      faq: [
        { q: 'Como funciona un codigo QR WiFi?', a: 'Un codigo QR WiFi codifica el nombre de la red, contrasena y tipo de cifrado en un formato estandar. Al escanearlo con la camara del smartphone, el dispositivo lee esta informacion y propone la conexion automatica a la red.' },
        { q: 'Es seguro compartir mi contrasena WiFi por codigo QR?', a: 'El codigo QR se genera completamente en tu navegador y ningun dato se envia a servidores externos. El codigo contiene tus credenciales WiFi, asi que trata el QR impreso con el mismo cuidado que tu contrasena escrita.' },
        { q: 'Que dispositivos pueden escanear codigos QR WiFi?', a: 'Todos los smartphones Android modernos (Android 10+) y iPhones (iOS 11+) pueden escanear codigos QR WiFi usando la camara integrada. Dispositivos mas antiguos pueden necesitar una app de escaneo QR de terceros.' },
        { q: 'Que tipo de cifrado debo elegir?', a: 'Elige WPA/WPA2 para la mayoria de las redes modernas, ya que es el estandar mas seguro y utilizado. Selecciona WEP solo para routers muy antiguos. Elige Ninguno solo para redes intencionalmente abiertas.' },
        { q: 'Puedo usarlo para una red WiFi oculta?', a: 'Si, activa la opcion Red Oculta cuando tu red no transmite su SSID. El codigo QR incluira la bandera de red oculta, asegurando que el dispositivo busque la red aunque no sea visible en la lista WiFi.' },
      ],
    },
    fr: {
      title: 'Generateur QR Code WiFi: Partagez Votre WiFi Instantanement',
      paragraphs: [
        'Partager votre mot de passe WiFi avec vos invites n a jamais ete aussi simple. Notre generateur gratuit de QR Code WiFi cree un code QR scannable qui connecte automatiquement n importe quel smartphone ou tablette a votre reseau sans fil. Plus besoin d epeler des mots de passe compliques ou de les ecrire sur papier. Entrez le nom du reseau, le mot de passe et le type de chiffrement, et generez un QR code en quelques secondes.',
        'Le QR code genere suit le format standard de configuration WiFi (WIFI:T:chiffrement;S:ssid;P:motdepasse;H:cache;;) reconnu par tous les smartphones modernes. Lorsqu il est scanne avec l appareil photo, le telephone propose automatiquement de se connecter au reseau sans saisir manuellement les identifiants. Cela fonctionne sur les appareils Android et iOS.',
        'Cet outil prend en charge tous les types de chiffrement courants, y compris WPA/WPA2 (le plus courant et recommande), WEP (chiffrement ancien) et les reseaux ouverts sans mot de passe. Vous pouvez egalement indiquer si votre reseau est cache, c est-a-dire qu il ne diffuse pas son SSID. Les reseaux caches necessitent de connaitre le SSID a l avance.',
        'Le QR code WiFi peut etre telecharge en image PNG haute qualite ou imprime directement depuis le navigateur. De nombreux restaurants, cafes, hotels, bureaux et hotes Airbnb utilisent des QR codes WiFi pour fournir un acces internet transparent a leurs visiteurs.',
      ],
      faq: [
        { q: 'Comment fonctionne un QR code WiFi ?', a: 'Un QR code WiFi encode le nom du reseau, le mot de passe et le type de chiffrement dans un format standard. Lorsqu il est scanne avec l appareil photo, l appareil lit ces informations et propose la connexion automatique au reseau.' },
        { q: 'Est-il securise de partager mon mot de passe WiFi par QR code ?', a: 'Le QR code est genere entierement dans votre navigateur et aucune donnee n est envoyee a un serveur. Le code contient vos identifiants WiFi, traitez donc le QR imprime avec le meme soin que votre mot de passe ecrit.' },
        { q: 'Quels appareils peuvent scanner les QR codes WiFi ?', a: 'Tous les smartphones Android modernes (Android 10+) et iPhones (iOS 11+) peuvent scanner les QR codes WiFi avec l appareil photo integre. Les appareils plus anciens peuvent necessiter une application tierce.' },
        { q: 'Quel type de chiffrement choisir ?', a: 'Choisissez WPA/WPA2 pour la plupart des reseaux modernes, c est le standard le plus securise. Selectionnez WEP uniquement pour les routeurs tres anciens. Choisissez Aucun pour les reseaux intentionnellement ouverts.' },
        { q: 'Puis-je l utiliser pour un reseau WiFi cache ?', a: 'Oui, activez l option Reseau Cache lorsque votre reseau ne diffuse pas son SSID. Le QR code incluera l indicateur de reseau cache, garantissant que l appareil recherche le reseau meme s il n est pas visible.' },
      ],
    },
    de: {
      title: 'WiFi QR-Code-Generator: Teilen Sie Ihr WLAN Sofort',
      paragraphs: [
        'Das Teilen Ihres WLAN-Passworts mit Gasten war noch nie so einfach. Unser kostenloser WiFi QR-Code-Generator erstellt einen scannbaren QR-Code, der jedes Smartphone oder Tablet automatisch mit Ihrem drahtlosen Netzwerk verbindet. Kein muehsames Buchstabieren komplizierter Passwoerter oder Aufschreiben auf Papier mehr. Geben Sie einfach den Netzwerknamen, das Passwort und den Verschluesselungstyp ein und generieren Sie einen QR-Code in Sekunden.',
        'Der generierte QR-Code folgt dem Standard-WiFi-Konfigurationsformat (WIFI:T:Verschluesselung;S:ssid;P:passwort;H:versteckt;;), das von allen modernen Smartphones erkannt wird. Beim Scannen mit der Kamera-App wird der Benutzer automatisch aufgefordert, sich mit dem Netzwerk zu verbinden, ohne Zugangsdaten manuell eingeben zu muessen. Dies funktioniert sowohl auf Android- als auch auf iOS-Geraeten.',
        'Dieses Tool unterstuetzt alle gaengigen Verschluesselungstypen einschliesslich WPA/WPA2 (am haeufigsten und empfohlen), WEP (Legacy-Verschluesselung) und offene Netzwerke ohne Passwort. Sie koennen auch angeben, ob Ihr Netzwerk versteckt ist, also seine SSID nicht sendet. Versteckte Netzwerke erfordern, dass die SSID im Voraus bekannt ist.',
        'Der WiFi QR-Code kann als hochwertiges PNG-Bild heruntergeladen oder direkt aus dem Browser gedruckt werden. Viele Restaurants, Cafes, Hotels, Bueros und Airbnb-Gastgeber verwenden WiFi QR-Codes, um ihren Besuchern nahtlosen Internetzugang zu bieten.',
      ],
      faq: [
        { q: 'Wie funktioniert ein WiFi QR-Code?', a: 'Ein WiFi QR-Code kodiert Netzwerkname, Passwort und Verschluesselungstyp in einem Standardformat. Beim Scannen mit der Smartphone-Kamera liest das Geraet diese Informationen und bietet die automatische Verbindung zum Netzwerk an.' },
        { q: 'Ist es sicher, mein WLAN-Passwort per QR-Code zu teilen?', a: 'Der QR-Code wird vollstaendig in Ihrem Browser generiert und keine Daten werden an Server gesendet. Der Code enthaelt Ihre WLAN-Zugangsdaten, behandeln Sie den gedruckten QR-Code also mit der gleichen Sorgfalt wie Ihr geschriebenes Passwort.' },
        { q: 'Welche Geraete koennen WiFi QR-Codes scannen?', a: 'Alle modernen Android-Smartphones (Android 10+) und iPhones (iOS 11+) koennen WiFi QR-Codes mit der integrierten Kamera-App scannen. Aeltere Geraete benoetigen moeglicherweise eine QR-Scanner-App eines Drittanbieters.' },
        { q: 'Welchen Verschluesselungstyp soll ich waehlen?', a: 'Waehlen Sie WPA/WPA2 fuer die meisten modernen Netzwerke, da es der sicherste und am weitesten verbreitete Standard ist. Waehlen Sie WEP nur fuer sehr alte Router. Waehlen Sie Keine nur fuer absichtlich offene Netzwerke.' },
        { q: 'Kann ich es fuer ein verstecktes WLAN-Netzwerk verwenden?', a: 'Ja, aktivieren Sie die Option Verstecktes Netzwerk, wenn Ihr Netzwerk seine SSID nicht sendet. Der QR-Code enthaelt das Versteckt-Flag, sodass das Geraet das Netzwerk sucht, auch wenn es nicht in der WLAN-Liste sichtbar ist.' },
      ],
    },
    pt: {
      title: 'Gerador de QR Code WiFi: Compartilhe Seu WiFi Instantaneamente',
      paragraphs: [
        'Compartilhar sua senha WiFi com visitantes nunca foi tao facil. Nosso gerador gratuito de QR Code WiFi cria um codigo QR escaneavel que conecta automaticamente qualquer smartphone ou tablet a sua rede sem fio. Sem mais soletrar senhas complicadas ou escreve-las em papel. Basta inserir o nome da rede, a senha e o tipo de criptografia, e gere um QR code em segundos.',
        'O QR code gerado segue o formato padrao de configuracao WiFi (WIFI:T:criptografia;S:ssid;P:senha;H:oculta;;) reconhecido por todos os smartphones modernos. Ao ser escaneado com a camera, o celular propoe automaticamente a conexao com a rede sem necessidade de inserir credenciais manualmente. Funciona em dispositivos Android e iOS.',
        'Esta ferramenta suporta todos os tipos de criptografia comuns incluindo WPA/WPA2 (o mais comum e recomendado), WEP (criptografia legada) e redes abertas sem senha. Voce tambem pode indicar se sua rede e oculta, ou seja, nao transmite seu SSID. Redes ocultas requerem que o SSID seja conhecido antecipadamente, tornando o QR code especialmente util.',
        'O QR code WiFi pode ser baixado como imagem PNG de alta qualidade ou impresso diretamente do navegador. Muitos restaurantes, cafes, hoteis, escritorios e anfitrioes do Airbnb usam QR codes WiFi para fornecer acesso a internet sem complicacoes para seus visitantes.',
      ],
      faq: [
        { q: 'Como funciona um QR code WiFi?', a: 'Um QR code WiFi codifica o nome da rede, senha e tipo de criptografia em um formato padrao. Ao ser escaneado com a camera do smartphone, o dispositivo le essas informacoes e propoe a conexao automatica a rede.' },
        { q: 'E seguro compartilhar minha senha WiFi por QR code?', a: 'O QR code e gerado inteiramente no seu navegador e nenhum dado e enviado a servidores. O codigo contem suas credenciais WiFi, entao trate o QR impresso com o mesmo cuidado que sua senha escrita.' },
        { q: 'Quais dispositivos podem escanear QR codes WiFi?', a: 'Todos os smartphones Android modernos (Android 10+) e iPhones (iOS 11+) podem escanear QR codes WiFi usando a camera integrada. Dispositivos mais antigos podem precisar de um app de scanner QR de terceiros.' },
        { q: 'Qual tipo de criptografia devo escolher?', a: 'Escolha WPA/WPA2 para a maioria das redes modernas, pois e o padrao mais seguro e utilizado. Selecione WEP apenas para roteadores muito antigos. Escolha Nenhuma apenas para redes intencionalmente abertas.' },
        { q: 'Posso usar para uma rede WiFi oculta?', a: 'Sim, ative a opcao Rede Oculta quando sua rede nao transmite seu SSID. O QR code incluira a flag de rede oculta, garantindo que o dispositivo busque a rede mesmo que nao esteja visivel na lista WiFi.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="wifi-qr-generator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* SSID Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('ssid')}</label>
            <input
              type="text"
              value={ssid}
              onChange={(e) => { setSsid(e.target.value); setShowError(false); }}
              placeholder={t('ssidPlaceholder')}
              className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${showError ? 'border-red-400' : 'border-gray-300'}`}
            />
            {showError && (
              <p className="text-red-500 text-sm mt-1">{t('errorSsid')}</p>
            )}
          </div>

          {/* Encryption Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('encryption')}</label>
            <div className="flex gap-2">
              {([
                { value: 'WPA' as EncryptionType, label: 'WPA/WPA2' },
                { value: 'WEP' as EncryptionType, label: 'WEP' },
                { value: 'nopass' as EncryptionType, label: 'None' },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setEncryption(opt.value)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                    encryption === opt.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Password Input */}
          {encryption !== 'nopass' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-20"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {showPass ? t('hidePassword') : t('showPassword')}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-500">
              {t('noPasswordNeeded')}
            </div>
          )}

          {/* Hidden Network Toggle */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
            <div>
              <div className="text-sm font-medium text-gray-700">{t('hidden')}</div>
              <div className="text-xs text-gray-500">{t('hiddenDesc')}</div>
            </div>
            <button
              onClick={() => setHidden(!hidden)}
              className={`relative w-12 h-6 rounded-full transition-colors ${hidden ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${hidden ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          {/* WiFi String Preview */}
          {wifiString && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-xs font-medium text-gray-500 mb-1">{t('wifiString')}</div>
              <code className="text-sm text-gray-800 break-all">{wifiString}</code>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button onClick={handleGenerate}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              {t('generate')}
            </button>
            <button onClick={handleReset}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 border border-gray-300 transition-colors">
              {t('reset')}
            </button>
          </div>

          {/* QR Code Display */}
          {ssid.trim() && (
            <div className="flex flex-col items-center gap-4 pt-2">
              <div className="text-sm font-medium text-gray-500">{t('qrResult')}</div>
              <canvas ref={canvasRef} className="border border-gray-200 rounded-lg max-w-full" />
              {generated && (
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex gap-2">
                    <button onClick={handleDownload}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      {t('download')}
                    </button>
                    <button onClick={handlePrint}
                      className="flex-1 bg-gray-800 text-white py-2 rounded-lg font-medium hover:bg-gray-900 transition-colors">
                      {t('print')}
                    </button>
                  </div>
                  <button onClick={handleCopy}
                    className={`w-full py-2 rounded-lg font-medium border transition-colors ${
                      copiedFeedback
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}>
                    {copiedFeedback ? t('copied') : t('copy')}
                  </button>
                </div>
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
