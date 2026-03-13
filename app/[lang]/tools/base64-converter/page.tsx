'use client';
import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface HistoryEntry {
  mode: 'encode' | 'decode';
  input: string;
  output: string;
  inputSize: number;
  outputSize: number;
  timestamp: number;
}

export default function Base64Converter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['base64-converter'][lang];

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [inputSize, setInputSize] = useState(0);
  const [outputSize, setOutputSize] = useState(0);

  const labels = {
    encode: { en: 'Encode', it: 'Codifica', es: 'Codificar', fr: 'Encoder', de: 'Kodieren', pt: 'Codificar' },
    decode: { en: 'Decode', it: 'Decodifica', es: 'Decodificar', fr: 'Décoder', de: 'Dekodieren', pt: 'Decodificar' },
    inputPh: { en: 'Enter text to encode/decode...', it: 'Inserisci il testo da codificare/decodificare...', es: 'Ingresa texto para codificar/decodificar...', fr: 'Entrez le texte à encoder/décoder...', de: 'Text zum Kodieren/Dekodieren eingeben...', pt: 'Digite o texto para codificar/decodificar...' },
    copyResult: { en: 'Copy Result', it: 'Copia Risultato', es: 'Copiar Resultado', fr: 'Copier le Résultat', de: 'Ergebnis Kopieren', pt: 'Copiar Resultado' },
    copiedLabel: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
    reset: { en: 'Reset', it: 'Ripristina', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
    inputSizeLabel: { en: 'Input Size', it: 'Dim. Input', es: 'Tamaño Entrada', fr: 'Taille Entrée', de: 'Eingabegröße', pt: 'Tamanho Entrada' },
    outputSizeLabel: { en: 'Output Size', it: 'Dim. Output', es: 'Tamaño Salida', fr: 'Taille Sortie', de: 'Ausgabegröße', pt: 'Tamanho Saída' },
    sizeRatio: { en: 'Size Ratio', it: 'Rapporto Dimensione', es: 'Proporción', fr: 'Ratio de Taille', de: 'Größenverhältnis', pt: 'Proporção' },
    history: { en: 'History', it: 'Cronologia', es: 'Historial', fr: 'Historique', de: 'Verlauf', pt: 'Histórico' },
    clearHistory: { en: 'Clear', it: 'Cancella', es: 'Borrar', fr: 'Effacer', de: 'Löschen', pt: 'Limpar' },
    noHistory: { en: 'No operations yet', it: 'Nessuna operazione', es: 'Sin operaciones', fr: 'Aucune opération', de: 'Keine Operationen', pt: 'Sem operações' },
    invalidBase64: { en: 'Invalid Base64 string. Please check the input and try again.', it: 'Stringa Base64 non valida. Controlla l\'input e riprova.', es: 'Cadena Base64 no válida. Verifica la entrada e inténtalo de nuevo.', fr: 'Chaîne Base64 invalide. Vérifiez l\'entrée et réessayez.', de: 'Ungültiger Base64-String. Bitte überprüfen Sie die Eingabe.', pt: 'String Base64 inválida. Verifique a entrada e tente novamente.' },
    bytes: { en: 'bytes', it: 'byte', es: 'bytes', fr: 'octets', de: 'Bytes', pt: 'bytes' },
  } as Record<string, Record<Locale, string>>;

  const getByteSize = (str: string): number => new Blob([str]).size;

  const convert = useCallback(() => {
    setError('');
    if (!input.trim()) return;

    try {
      let result: string;
      if (mode === 'encode') {
        result = btoa(unescape(encodeURIComponent(input)));
      } else {
        // Validate base64 before decoding
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        const trimmed = input.trim();
        if (!base64Regex.test(trimmed) || trimmed.length % 4 !== 0) {
          setError(labels.invalidBase64[lang]);
          setOutput('');
          setInputSize(0);
          setOutputSize(0);
          return;
        }
        result = decodeURIComponent(escape(atob(trimmed)));
      }

      const inSize = getByteSize(input);
      const outSize = getByteSize(result);
      setOutput(result);
      setInputSize(inSize);
      setOutputSize(outSize);

      const entry: HistoryEntry = {
        mode,
        input: input.length > 60 ? input.slice(0, 60) + '...' : input,
        output: result.length > 60 ? result.slice(0, 60) + '...' : result,
        inputSize: inSize,
        outputSize: outSize,
        timestamp: Date.now(),
      };
      setHistory(prev => [entry, ...prev].slice(0, 5));
    } catch {
      if (mode === 'decode') {
        setError(labels.invalidBase64[lang]);
        setOutput('');
        setInputSize(0);
        setOutputSize(0);
      } else {
        setOutput('Error: invalid input');
      }
    }
  }, [input, mode, lang, labels.invalidBase64]);

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setInput('');
    setOutput('');
    setError('');
    setInputSize(0);
    setOutputSize(0);
    setCopied(false);
  };

  const sizeRatio = inputSize > 0 && outputSize > 0
    ? (outputSize / inputSize).toFixed(2)
    : null;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Base64 Encoder & Decoder: Convert Text and Data Online',
      paragraphs: [
        'Base64 encoding is a method of converting binary data into ASCII text format. It is widely used in web development, email systems, and data transmission protocols where binary data needs to be represented as text. Our free online Base64 converter lets you encode and decode strings instantly in your browser.',
        'The Base64 encoding scheme uses 64 characters (A-Z, a-z, 0-9, +, /) to represent binary data. Each Base64 digit represents 6 bits of data, meaning that three bytes of input produce four characters of Base64 output. This makes Base64-encoded data approximately 33% larger than the original, but ensures safe transmission across text-only channels.',
        'Common use cases for Base64 encoding include embedding images directly in HTML or CSS (data URIs), encoding email attachments via MIME, transmitting binary data in JSON or XML APIs, and storing complex data in cookies or URL parameters. Developers frequently use Base64 when working with JWT tokens, API authentication, and data serialization.',
        'This tool handles Unicode text correctly using UTF-8 encoding, so you can encode text in any language including characters with accents, Asian scripts, and emoji. The decoder will detect and properly handle invalid Base64 input, showing a clear error message if the encoded string is malformed.',
      ],
      faq: [
        { q: 'What is Base64 encoding used for?', a: 'Base64 is used to encode binary data as ASCII text. Common uses include embedding images in HTML/CSS, encoding email attachments, transmitting data in APIs, and encoding JWT tokens for authentication.' },
        { q: 'Is Base64 encoding the same as encryption?', a: 'No, Base64 is not encryption. It is an encoding scheme that converts data to a different format but does not provide any security. Anyone can decode Base64 data. For security, use proper encryption algorithms like AES or RSA.' },
        { q: 'Why does Base64 make data larger?', a: 'Base64 represents 3 bytes of binary data as 4 ASCII characters, resulting in approximately 33% size increase. This tradeoff exists because Base64 ensures data can be safely transmitted through text-only channels.' },
        { q: 'Can I encode images or files with this Base64 tool?', a: 'This tool encodes text strings to Base64. For encoding binary files like images, you would need to read the file as binary data first. However, you can paste a Base64-encoded image string here to decode it.' },
        { q: 'Does Base64 encoding support Unicode and special characters?', a: 'Yes, our tool uses UTF-8 encoding to handle Unicode text correctly. You can encode text in any language, including accented characters, CJK scripts, Arabic, and emoji.' },
      ],
    },
    it: {
      title: 'Codificatore e Decodificatore Base64: Converti Testo e Dati Online',
      paragraphs: [
        'La codifica Base64 è un metodo per convertire dati binari in formato testo ASCII. È ampiamente utilizzata nello sviluppo web, nei sistemi email e nei protocolli di trasmissione dati dove i dati binari devono essere rappresentati come testo. Il nostro convertitore Base64 online gratuito ti permette di codificare e decodificare stringhe istantaneamente nel tuo browser.',
        'Lo schema di codifica Base64 utilizza 64 caratteri (A-Z, a-z, 0-9, +, /) per rappresentare dati binari. Ogni cifra Base64 rappresenta 6 bit di dati, il che significa che tre byte di input producono quattro caratteri di output Base64. Questo rende i dati codificati in Base64 circa il 33% più grandi dell\'originale, ma garantisce una trasmissione sicura attraverso canali solo testo.',
        'I casi d\'uso comuni per la codifica Base64 includono l\'incorporamento di immagini direttamente in HTML o CSS (data URI), la codifica di allegati email tramite MIME, la trasmissione di dati binari in API JSON o XML e l\'archiviazione di dati complessi in cookie o parametri URL. Gli sviluppatori usano frequentemente Base64 quando lavorano con token JWT, autenticazione API e serializzazione dei dati.',
        'Questo strumento gestisce correttamente il testo Unicode utilizzando la codifica UTF-8, quindi puoi codificare testo in qualsiasi lingua inclusi caratteri accentati, script asiatici ed emoji. Il decodificatore rileverà e gestirà correttamente input Base64 non validi, mostrando un chiaro messaggio di errore.',
      ],
      faq: [
        { q: 'A cosa serve la codifica Base64?', a: 'Base64 serve a codificare dati binari come testo ASCII. Gli usi comuni includono l\'incorporamento di immagini in HTML/CSS, la codifica di allegati email, la trasmissione di dati nelle API e la codifica di token JWT per l\'autenticazione.' },
        { q: 'La codifica Base64 è uguale alla crittografia?', a: 'No, Base64 non è crittografia. È uno schema di codifica che converte i dati in un formato diverso ma non fornisce alcuna sicurezza. Chiunque può decodificare dati Base64. Per la sicurezza, usa algoritmi di crittografia come AES o RSA.' },
        { q: 'Perché Base64 rende i dati più grandi?', a: 'Base64 rappresenta 3 byte di dati binari come 4 caratteri ASCII, con un aumento di dimensione di circa il 33%. Questo compromesso esiste perché Base64 garantisce che i dati possano essere trasmessi attraverso canali solo testo.' },
        { q: 'Posso codificare immagini o file con questo strumento?', a: 'Questo strumento codifica stringhe di testo in Base64. Per codificare file binari come immagini, dovresti prima leggere il file come dati binari. Tuttavia, puoi incollare qui una stringa Base64 di un\'immagine per decodificarla.' },
        { q: 'La codifica Base64 supporta Unicode e caratteri speciali?', a: 'Sì, il nostro strumento utilizza la codifica UTF-8 per gestire correttamente il testo Unicode. Puoi codificare testo in qualsiasi lingua, inclusi caratteri accentati, script CJK, arabo ed emoji.' },
      ],
    },
    es: {
      title: 'Codificador y Decodificador Base64: Convierte Texto y Datos Online',
      paragraphs: [
        'La codificación Base64 es un método para convertir datos binarios en formato de texto ASCII. Se usa ampliamente en desarrollo web, sistemas de correo electrónico y protocolos de transmisión de datos donde los datos binarios necesitan representarse como texto. Nuestro convertidor Base64 online gratuito te permite codificar y decodificar cadenas al instante en tu navegador.',
        'El esquema de codificación Base64 usa 64 caracteres (A-Z, a-z, 0-9, +, /) para representar datos binarios. Cada dígito Base64 representa 6 bits de datos, lo que significa que tres bytes de entrada producen cuatro caracteres de salida Base64. Esto hace que los datos codificados en Base64 sean aproximadamente un 33% más grandes que el original.',
        'Los casos de uso comunes incluyen incrustar imágenes directamente en HTML o CSS (data URIs), codificar archivos adjuntos de correo electrónico vía MIME, transmitir datos binarios en APIs JSON o XML, y almacenar datos complejos en cookies o parámetros URL. Los desarrolladores usan Base64 frecuentemente al trabajar con tokens JWT y autenticación de API.',
        'Esta herramienta maneja correctamente texto Unicode usando codificación UTF-8, así que puedes codificar texto en cualquier idioma incluyendo caracteres acentuados, escrituras asiáticas y emojis.',
      ],
      faq: [
        { q: '¿Para qué se usa la codificación Base64?', a: 'Base64 se usa para codificar datos binarios como texto ASCII. Los usos comunes incluyen incrustar imágenes en HTML/CSS, codificar archivos adjuntos de correo, transmitir datos en APIs y codificar tokens JWT.' },
        { q: '¿La codificación Base64 es lo mismo que encriptación?', a: 'No, Base64 no es encriptación. Es un esquema de codificación que convierte datos a otro formato pero no proporciona seguridad. Cualquiera puede decodificar datos Base64. Para seguridad, usa algoritmos como AES o RSA.' },
        { q: '¿Por qué Base64 hace los datos más grandes?', a: 'Base64 representa 3 bytes de datos binarios como 4 caracteres ASCII, resultando en un aumento de tamaño de aproximadamente el 33%.' },
        { q: '¿Puedo codificar imágenes con esta herramienta Base64?', a: 'Esta herramienta codifica cadenas de texto a Base64. Para codificar archivos binarios como imágenes, necesitarías leer el archivo como datos binarios primero.' },
        { q: '¿Base64 soporta Unicode y caracteres especiales?', a: 'Sí, nuestra herramienta usa codificación UTF-8 para manejar texto Unicode correctamente. Puedes codificar texto en cualquier idioma, incluyendo caracteres acentuados y emojis.' },
      ],
    },
    fr: {
      title: 'Encodeur et Décodeur Base64 : Convertir Texte et Données en Ligne',
      paragraphs: [
        'L\'encodage Base64 est une méthode de conversion de données binaires en format texte ASCII. Il est largement utilisé dans le développement web, les systèmes de messagerie et les protocoles de transmission de données. Notre convertisseur Base64 en ligne gratuit vous permet d\'encoder et décoder des chaînes instantanément dans votre navigateur.',
        'Le schéma d\'encodage Base64 utilise 64 caractères (A-Z, a-z, 0-9, +, /) pour représenter des données binaires. Chaque chiffre Base64 représente 6 bits de données, ce qui signifie que trois octets d\'entrée produisent quatre caractères de sortie Base64. Les données encodées en Base64 sont environ 33% plus grandes que l\'original.',
        'Les cas d\'utilisation courants incluent l\'intégration d\'images dans HTML ou CSS (data URIs), l\'encodage de pièces jointes par MIME, la transmission de données binaires dans les APIs JSON ou XML, et le stockage de données complexes dans les cookies. Les développeurs utilisent fréquemment Base64 pour les tokens JWT et l\'authentification API.',
        'Cet outil gère correctement le texte Unicode en utilisant l\'encodage UTF-8, vous pouvez donc encoder du texte dans n\'importe quelle langue, y compris les caractères accentués, les scripts asiatiques et les emojis.',
      ],
      faq: [
        { q: 'À quoi sert l\'encodage Base64 ?', a: 'Base64 sert à encoder des données binaires en texte ASCII. Les utilisations courantes incluent l\'intégration d\'images en HTML/CSS, l\'encodage de pièces jointes, la transmission de données dans les APIs et l\'encodage de tokens JWT.' },
        { q: 'L\'encodage Base64 est-il identique au chiffrement ?', a: 'Non, Base64 n\'est pas du chiffrement. C\'est un schéma d\'encodage qui ne fournit aucune sécurité. N\'importe qui peut décoder des données Base64. Pour la sécurité, utilisez des algorithmes comme AES ou RSA.' },
        { q: 'Pourquoi Base64 augmente-t-il la taille des données ?', a: 'Base64 représente 3 octets de données binaires comme 4 caractères ASCII, soit une augmentation d\'environ 33%.' },
        { q: 'Puis-je encoder des images avec cet outil Base64 ?', a: 'Cet outil encode des chaînes de texte en Base64. Pour encoder des fichiers binaires comme des images, il faudrait d\'abord lire le fichier comme données binaires.' },
        { q: 'Base64 prend-il en charge Unicode et les caractères spéciaux ?', a: 'Oui, notre outil utilise l\'encodage UTF-8 pour gérer correctement le texte Unicode. Vous pouvez encoder du texte dans n\'importe quelle langue.' },
      ],
    },
    de: {
      title: 'Base64 Encoder & Decoder: Text und Daten Online Konvertieren',
      paragraphs: [
        'Base64-Kodierung ist eine Methode zur Umwandlung von Binärdaten in ASCII-Textformat. Sie wird häufig in der Webentwicklung, E-Mail-Systemen und Datenübertragungsprotokollen verwendet. Unser kostenloser Online-Base64-Konverter ermöglicht es Ihnen, Zeichenketten sofort in Ihrem Browser zu kodieren und dekodieren.',
        'Das Base64-Kodierungsschema verwendet 64 Zeichen (A-Z, a-z, 0-9, +, /) zur Darstellung von Binärdaten. Jede Base64-Ziffer repräsentiert 6 Bit Daten, was bedeutet, dass drei Bytes Eingabe vier Zeichen Base64-Ausgabe erzeugen. Dadurch sind Base64-kodierte Daten etwa 33% größer als das Original.',
        'Häufige Anwendungsfälle sind das Einbetten von Bildern in HTML oder CSS (Data-URIs), das Kodieren von E-Mail-Anhängen über MIME, die Übertragung binärer Daten in JSON- oder XML-APIs und die Speicherung komplexer Daten in Cookies oder URL-Parametern. Entwickler verwenden Base64 häufig bei JWT-Tokens und API-Authentifizierung.',
        'Dieses Tool verarbeitet Unicode-Text korrekt mit UTF-8-Kodierung, sodass Sie Text in jeder Sprache kodieren können, einschließlich Zeichen mit Akzenten, asiatischen Schriften und Emojis.',
      ],
      faq: [
        { q: 'Wofür wird Base64-Kodierung verwendet?', a: 'Base64 wird verwendet, um Binärdaten als ASCII-Text zu kodieren. Häufige Verwendungen sind das Einbetten von Bildern in HTML/CSS, E-Mail-Anhänge, Datenübertragung in APIs und JWT-Token-Kodierung.' },
        { q: 'Ist Base64-Kodierung dasselbe wie Verschlüsselung?', a: 'Nein, Base64 ist keine Verschlüsselung. Es ist ein Kodierungsschema, das keine Sicherheit bietet. Jeder kann Base64-Daten dekodieren. Für Sicherheit verwenden Sie Verschlüsselungsalgorithmen wie AES oder RSA.' },
        { q: 'Warum macht Base64 Daten größer?', a: 'Base64 stellt 3 Bytes Binärdaten als 4 ASCII-Zeichen dar, was zu einer Größenzunahme von etwa 33% führt.' },
        { q: 'Kann ich Bilder mit diesem Base64-Tool kodieren?', a: 'Dieses Tool kodiert Textzeichenketten in Base64. Für binäre Dateien wie Bilder müssten Sie die Datei zuerst als Binärdaten lesen.' },
        { q: 'Unterstützt Base64 Unicode und Sonderzeichen?', a: 'Ja, unser Tool verwendet UTF-8-Kodierung zur korrekten Verarbeitung von Unicode-Text. Sie können Text in jeder Sprache kodieren.' },
      ],
    },
    pt: {
      title: 'Codificador e Decodificador Base64: Converta Texto e Dados Online',
      paragraphs: [
        'A codificação Base64 é um método de converter dados binários em formato de texto ASCII. É amplamente utilizada no desenvolvimento web, sistemas de email e protocolos de transmissão de dados. Nosso conversor Base64 online gratuito permite codificar e decodificar strings instantaneamente no seu navegador.',
        'O esquema de codificação Base64 usa 64 caracteres (A-Z, a-z, 0-9, +, /) para representar dados binários. Cada dígito Base64 representa 6 bits de dados, significando que três bytes de entrada produzem quatro caracteres de saída Base64. Isso torna os dados codificados em Base64 aproximadamente 33% maiores que o original.',
        'Casos de uso comuns incluem incorporar imagens diretamente em HTML ou CSS (data URIs), codificar anexos de email via MIME, transmitir dados binários em APIs JSON ou XML, e armazenar dados complexos em cookies ou parâmetros URL. Desenvolvedores usam Base64 frequentemente ao trabalhar com tokens JWT e autenticação de API.',
        'Esta ferramenta lida corretamente com texto Unicode usando codificação UTF-8, então você pode codificar texto em qualquer idioma, incluindo caracteres acentuados, scripts asiáticos e emojis.',
      ],
      faq: [
        { q: 'Para que serve a codificação Base64?', a: 'Base64 serve para codificar dados binários como texto ASCII. Usos comuns incluem incorporar imagens em HTML/CSS, codificar anexos de email, transmitir dados em APIs e codificar tokens JWT.' },
        { q: 'A codificação Base64 é o mesmo que criptografia?', a: 'Não, Base64 não é criptografia. É um esquema de codificação que não fornece segurança. Qualquer pessoa pode decodificar dados Base64. Para segurança, use algoritmos como AES ou RSA.' },
        { q: 'Por que Base64 torna os dados maiores?', a: 'Base64 representa 3 bytes de dados binários como 4 caracteres ASCII, resultando em um aumento de tamanho de aproximadamente 33%.' },
        { q: 'Posso codificar imagens com esta ferramenta Base64?', a: 'Esta ferramenta codifica strings de texto em Base64. Para codificar arquivos binários como imagens, você precisaria ler o arquivo como dados binários primeiro.' },
        { q: 'Base64 suporta Unicode e caracteres especiais?', a: 'Sim, nossa ferramenta usa codificação UTF-8 para lidar corretamente com texto Unicode. Você pode codificar texto em qualquer idioma.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="base64-converter" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setMode('encode')} className={`flex-1 py-2 rounded-lg font-medium transition-colors ${mode === 'encode' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {labels.encode[lang]}
            </button>
            <button onClick={() => setMode('decode')} className={`flex-1 py-2 rounded-lg font-medium transition-colors ${mode === 'decode' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {labels.decode[lang]}
            </button>
          </div>

          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(''); }}
            placeholder={labels.inputPh[lang]}
            className="w-full h-32 border border-gray-300 rounded-lg px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-blue-500"
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={convert} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              {mode === 'encode' ? labels.encode[lang] : labels.decode[lang]}
            </button>
            <button onClick={reset} className="px-5 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
              {labels.reset[lang]}
            </button>
          </div>

          {output && !error && (
            <>
              {/* Size info cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-blue-600 font-medium">{labels.inputSizeLabel[lang]}</div>
                  <div className="text-lg font-bold text-blue-800">{inputSize} <span className="text-xs font-normal">{labels.bytes[lang]}</span></div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-green-600 font-medium">{labels.outputSizeLabel[lang]}</div>
                  <div className="text-lg font-bold text-green-800">{outputSize} <span className="text-xs font-normal">{labels.bytes[lang]}</span></div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-purple-600 font-medium">{labels.sizeRatio[lang]}</div>
                  <div className="text-lg font-bold text-purple-800">{sizeRatio}x</div>
                </div>
              </div>

              {/* Output with copy button */}
              <div className="relative">
                <button
                  onClick={copy}
                  className="absolute top-2 right-2 px-3 py-1.5 bg-gray-700 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                >
                  {copied ? labels.copiedLabel[lang] : labels.copyResult[lang]}
                </button>
                <pre className="bg-gray-900 text-green-400 p-4 pt-10 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap break-all">{output}</pre>
              </div>
            </>
          )}
        </div>

        {/* History section */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">{labels.history[lang]}</h3>
            {history.length > 0 && (
              <button onClick={() => setHistory([])} className="text-xs text-red-500 hover:text-red-700 transition-colors">
                {labels.clearHistory[lang]}
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400 italic">{labels.noHistory[lang]}</p>
          ) : (
            <div className="space-y-2">
              {history.map((entry, i) => (
                <div
                  key={entry.timestamp}
                  className="flex items-center gap-3 text-sm border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setMode(entry.mode);
                    setInput(entry.input.endsWith('...') ? input : entry.input);
                    setOutput(entry.output.endsWith('...') ? output : entry.output);
                  }}
                >
                  <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${entry.mode === 'encode' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                    {labels[entry.mode][lang]}
                  </span>
                  <span className="text-gray-600 truncate flex-1 font-mono text-xs">{entry.input}</span>
                  <span className="shrink-0 text-gray-400 text-xs">{entry.inputSize} → {entry.outputSize} {labels.bytes[lang]}</span>
                </div>
              ))}
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
