'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, common, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function UrlEncoder() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['url-encoder'][lang];
  const t = common[lang];

  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encodeComponent' | 'encodeURI'>('encodeComponent');
  const [direction, setDirection] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);

  let output = '';
  let error = '';
  try {
    if (input) {
      if (direction === 'encode') {
        output = mode === 'encodeComponent' ? encodeURIComponent(input) : encodeURI(input);
      } else {
        output = mode === 'encodeComponent' ? decodeURIComponent(input) : decodeURI(input);
      }
    }
  } catch (e) {
    error = (e as Error).message;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const labels = {
    encode: { en: 'Encode', it: 'Codifica', es: 'Codificar', fr: 'Encoder', de: 'Kodieren', pt: 'Codificar' },
    decode: { en: 'Decode', it: 'Decodifica', es: 'Decodificar', fr: 'Décoder', de: 'Dekodieren', pt: 'Decodificar' },
    input: { en: 'Input Text', it: 'Testo di input', es: 'Texto de entrada', fr: 'Texte d\'entrée', de: 'Eingabetext', pt: 'Texto de entrada' },
    output: { en: 'Output', it: 'Risultato', es: 'Resultado', fr: 'Résultat', de: 'Ergebnis', pt: 'Resultado' },
    mode: { en: 'Mode', it: 'Modalità', es: 'Modo', fr: 'Mode', de: 'Modus', pt: 'Modo' },
    componentDesc: { en: 'encodeURIComponent — encodes all special characters', it: 'encodeURIComponent — codifica tutti i caratteri speciali', es: 'encodeURIComponent — codifica todos los caracteres especiales', fr: 'encodeURIComponent — encode tous les caractères spéciaux', de: 'encodeURIComponent — kodiert alle Sonderzeichen', pt: 'encodeURIComponent — codifica todos os caracteres especiais' },
    uriDesc: { en: 'encodeURI — preserves URL structure (:, /, ?, #, etc.)', it: 'encodeURI — preserva la struttura URL (:, /, ?, #, ecc.)', es: 'encodeURI — preserva la estructura URL (:, /, ?, #, etc.)', fr: 'encodeURI — préserve la structure URL (:, /, ?, #, etc.)', de: 'encodeURI — erhält die URL-Struktur (:, /, ?, #, usw.)', pt: 'encodeURI — preserva a estrutura URL (:, /, ?, #, etc.)' },
    swap: { en: 'Swap', it: 'Inverti', es: 'Invertir', fr: 'Inverser', de: 'Tauschen', pt: 'Inverter' },
    error: { en: 'Error', it: 'Errore', es: 'Error', fr: 'Erreur', de: 'Fehler', pt: 'Erro' },
  } as Record<string, Record<Locale, string>>;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free URL Encoder/Decoder – Encode and Decode URLs Online',
      paragraphs: [
        'URL encoding, also known as percent-encoding, is a mechanism for converting characters into a format that can be safely transmitted within a URL. Since URLs can only contain certain characters from the ASCII set, any special characters, spaces, or non-ASCII characters must be encoded using a percent sign (%) followed by two hexadecimal digits.',
        'Our URL encoder/decoder supports two standard JavaScript encoding modes. The encodeURIComponent function encodes all special characters, making it ideal for encoding individual query parameters or form values. The encodeURI function preserves the URL structure characters like colons, slashes, question marks, and hash symbols, making it suitable for encoding complete URLs.',
        'Understanding the difference between these two modes is crucial for web developers. Using encodeURIComponent on a full URL would break it by encoding the protocol separators and path delimiters. Conversely, using encodeURI on a query parameter value would fail to encode characters like ampersands and equals signs that have special meaning in query strings.',
        'Common use cases for URL encoding include building API request URLs with dynamic parameters, encoding form data for submission, handling internationalized URLs with non-Latin characters, and debugging encoded URLs by decoding them back to readable text. Our tool provides instant bidirectional encoding and decoding with a clean, simple interface.',
      ],
      faq: [
        { q: 'What is URL encoding?', a: 'URL encoding (percent-encoding) converts characters into a format safe for URLs. Special characters, spaces, and non-ASCII characters are replaced with a percent sign followed by two hex digits. For example, a space becomes %20, and an ampersand becomes %26.' },
        { q: 'What is the difference between encodeURIComponent and encodeURI?', a: 'encodeURIComponent encodes ALL special characters including :, /, ?, #, &, and =. It is used for encoding individual values like query parameters. encodeURI preserves URL structure characters and only encodes characters that are not valid anywhere in a URL. Use encodeURI for complete URLs and encodeURIComponent for parameter values.' },
        { q: 'When should I URL-encode text?', a: 'You should URL-encode text when including it in a URL as a query parameter, path segment, or fragment. This is especially important for text containing spaces, special characters (& = ? #), or non-Latin characters. Most web frameworks handle encoding automatically, but manual encoding is needed when building URLs programmatically.' },
        { q: 'Why does my URL have %20 instead of spaces?', a: '%20 is the URL-encoded representation of a space character. URLs cannot contain literal spaces, so they must be encoded. In HTML forms using GET method, spaces may also appear as + signs. Both %20 and + represent spaces, but %20 is the standard percent-encoding.' },
        { q: 'Can URL encoding handle Unicode and emoji?', a: 'Yes, URL encoding handles Unicode characters by first converting them to UTF-8 bytes, then percent-encoding each byte. For example, the euro sign becomes %E2%82%AC (three UTF-8 bytes). Emoji and other multi-byte characters work the same way, resulting in longer encoded sequences.' },
      ],
    },
    it: {
      title: 'Codificatore/Decodificatore URL Gratuito – Codifica e Decodifica URL Online',
      paragraphs: [
        'La codifica URL, nota anche come percent-encoding, è un meccanismo per convertire i caratteri in un formato che può essere trasmesso in sicurezza all\'interno di un URL. Poiché gli URL possono contenere solo determinati caratteri ASCII, i caratteri speciali, gli spazi o i caratteri non-ASCII devono essere codificati.',
        'Il nostro strumento supporta due modalità standard di codifica JavaScript. La funzione encodeURIComponent codifica tutti i caratteri speciali, ideale per codificare singoli parametri di query. La funzione encodeURI preserva i caratteri strutturali dell\'URL come due punti, barre, punti interrogativi e cancelletti.',
        'Comprendere la differenza tra queste due modalità è fondamentale per gli sviluppatori web. Usare encodeURIComponent su un URL completo lo romperebbe codificando i separatori di protocollo. Al contrario, usare encodeURI su un valore di parametro non codificherebbe caratteri con significato speciale nelle query string.',
        'I casi d\'uso comuni includono la costruzione di URL per richieste API, la codifica di dati di form, la gestione di URL internazionalizzati e il debug di URL codificati. Il nostro strumento offre codifica e decodifica bidirezionale istantanea.',
      ],
      faq: [
        { q: 'Cos\'è la codifica URL?', a: 'La codifica URL converte i caratteri in un formato sicuro per gli URL. I caratteri speciali vengono sostituiti con un segno percentuale seguito da due cifre esadecimali. Ad esempio, uno spazio diventa %20.' },
        { q: 'Qual è la differenza tra encodeURIComponent e encodeURI?', a: 'encodeURIComponent codifica TUTTI i caratteri speciali inclusi :, /, ?, #. Si usa per singoli valori. encodeURI preserva la struttura URL e si usa per URL completi.' },
        { q: 'Quando devo codificare il testo in URL?', a: 'Quando lo includi in un URL come parametro di query, segmento di percorso o frammento. È particolarmente importante per testi con spazi, caratteri speciali o caratteri non latini.' },
        { q: 'Perché il mio URL ha %20 invece degli spazi?', a: '%20 è la rappresentazione codificata di uno spazio. Gli URL non possono contenere spazi letterali, quindi devono essere codificati.' },
      ],
    },
    es: {
      title: 'Codificador/Decodificador de URL Gratis – Codifica y Decodifica URLs Online',
      paragraphs: [
        'La codificación de URL, también conocida como codificación porcentual, es un mecanismo para convertir caracteres en un formato que puede transmitirse de forma segura dentro de una URL. Los caracteres especiales, espacios y caracteres no ASCII deben codificarse.',
        'Nuestra herramienta soporta dos modos estándar de codificación JavaScript. encodeURIComponent codifica todos los caracteres especiales, ideal para parámetros de consulta individuales. encodeURI preserva los caracteres de estructura de URL como dos puntos, barras y signos de interrogación.',
        'Entender la diferencia entre estos dos modos es crucial para desarrolladores web. Usar encodeURIComponent en una URL completa la rompería. Por el contrario, usar encodeURI en un valor de parámetro no codificaría caracteres con significado especial.',
        'Los casos de uso comunes incluyen la construcción de URLs para APIs, la codificación de datos de formularios, el manejo de URLs internacionalizadas y la depuración de URLs codificadas.',
      ],
      faq: [
        { q: '¿Qué es la codificación de URL?', a: 'La codificación de URL convierte caracteres en un formato seguro para URLs. Los caracteres especiales se reemplazan con un signo de porcentaje seguido de dos dígitos hexadecimales.' },
        { q: '¿Cuál es la diferencia entre encodeURIComponent y encodeURI?', a: 'encodeURIComponent codifica TODOS los caracteres especiales. Se usa para valores individuales. encodeURI preserva la estructura de la URL y se usa para URLs completas.' },
        { q: '¿Cuándo debo codificar texto en URL?', a: 'Cuando lo incluyes en una URL como parámetro de consulta o segmento de ruta. Es especialmente importante para texto con espacios o caracteres especiales.' },
        { q: '¿Por qué mi URL tiene %20 en lugar de espacios?', a: '%20 es la representación codificada de un espacio. Las URLs no pueden contener espacios literales.' },
      ],
    },
    fr: {
      title: 'Encodeur/Décodeur d\'URL Gratuit – Encodez et Décodez des URLs en Ligne',
      paragraphs: [
        'L\'encodage d\'URL, également connu sous le nom de percent-encoding, est un mécanisme pour convertir les caractères dans un format pouvant être transmis en toute sécurité dans une URL. Les caractères spéciaux, espaces et caractères non-ASCII doivent être encodés.',
        'Notre outil supporte deux modes standard d\'encodage JavaScript. encodeURIComponent encode tous les caractères spéciaux, idéal pour les paramètres de requête individuels. encodeURI préserve les caractères de structure d\'URL comme les deux-points, barres et points d\'interrogation.',
        'Comprendre la différence entre ces deux modes est crucial pour les développeurs web. Utiliser encodeURIComponent sur une URL complète la casserait. Inversement, utiliser encodeURI sur une valeur de paramètre n\'encoderait pas les caractères ayant une signification spéciale.',
        'Les cas d\'utilisation courants incluent la construction d\'URLs d\'API, l\'encodage de données de formulaires, la gestion d\'URLs internationalisées et le débogage d\'URLs encodées.',
      ],
      faq: [
        { q: 'Qu\'est-ce que l\'encodage d\'URL ?', a: 'L\'encodage d\'URL convertit les caractères en format sûr pour les URLs. Les caractères spéciaux sont remplacés par un signe pourcentage suivi de deux chiffres hexadécimaux.' },
        { q: 'Quelle est la différence entre encodeURIComponent et encodeURI ?', a: 'encodeURIComponent encode TOUS les caractères spéciaux. Il s\'utilise pour les valeurs individuelles. encodeURI préserve la structure de l\'URL pour les URLs complètes.' },
        { q: 'Quand dois-je encoder du texte en URL ?', a: 'Quand vous l\'incluez dans une URL comme paramètre de requête ou segment de chemin. C\'est particulièrement important pour le texte contenant des espaces ou caractères spéciaux.' },
        { q: 'Pourquoi mon URL contient %20 au lieu d\'espaces ?', a: '%20 est la représentation encodée d\'un espace. Les URLs ne peuvent pas contenir d\'espaces littéraux.' },
      ],
    },
    de: {
      title: 'Kostenloser URL-Encoder/Decoder – URLs Online Kodieren und Dekodieren',
      paragraphs: [
        'URL-Kodierung, auch Prozent-Kodierung genannt, ist ein Mechanismus zur Umwandlung von Zeichen in ein Format, das sicher in einer URL übertragen werden kann. Sonderzeichen, Leerzeichen und Nicht-ASCII-Zeichen müssen kodiert werden.',
        'Unser Tool unterstützt zwei Standard-JavaScript-Kodierungsmodi. encodeURIComponent kodiert alle Sonderzeichen, ideal für einzelne Query-Parameter. encodeURI bewahrt URL-Strukturzeichen wie Doppelpunkte, Schrägstriche und Fragezeichen.',
        'Das Verständnis des Unterschieds zwischen diesen Modi ist für Webentwickler entscheidend. encodeURIComponent auf eine vollständige URL angewendet würde sie durch Kodierung der Protokolltrenner zerstören.',
        'Häufige Anwendungsfälle umfassen den Aufbau von API-URLs, die Kodierung von Formulardaten, den Umgang mit internationalisierten URLs und das Debugging kodierter URLs.',
      ],
      faq: [
        { q: 'Was ist URL-Kodierung?', a: 'URL-Kodierung wandelt Zeichen in ein URL-sicheres Format um. Sonderzeichen werden durch ein Prozentzeichen gefolgt von zwei Hexadezimalziffern ersetzt.' },
        { q: 'Was ist der Unterschied zwischen encodeURIComponent und encodeURI?', a: 'encodeURIComponent kodiert ALLE Sonderzeichen. Es wird für einzelne Werte verwendet. encodeURI bewahrt die URL-Struktur für vollständige URLs.' },
        { q: 'Wann sollte ich Text URL-kodieren?', a: 'Wenn Sie ihn in eine URL als Query-Parameter oder Pfadsegment einfügen. Besonders wichtig bei Text mit Leerzeichen oder Sonderzeichen.' },
        { q: 'Warum hat meine URL %20 statt Leerzeichen?', a: '%20 ist die kodierte Darstellung eines Leerzeichens. URLs können keine wörtlichen Leerzeichen enthalten.' },
      ],
    },
    pt: {
      title: 'Codificador/Decodificador de URL Grátis – Codifique e Decodifique URLs Online',
      paragraphs: [
        'A codificação de URL, também conhecida como codificação percentual, é um mecanismo para converter caracteres em um formato que pode ser transmitido com segurança dentro de uma URL. Caracteres especiais, espaços e caracteres não-ASCII devem ser codificados.',
        'Nossa ferramenta suporta dois modos padrão de codificação JavaScript. encodeURIComponent codifica todos os caracteres especiais, ideal para parâmetros de consulta individuais. encodeURI preserva os caracteres de estrutura da URL como dois-pontos, barras e interrogações.',
        'Entender a diferença entre esses dois modos é crucial para desenvolvedores web. Usar encodeURIComponent em uma URL completa a quebraria. Por outro lado, usar encodeURI em um valor de parâmetro não codificaria caracteres com significado especial.',
        'Casos de uso comuns incluem a construção de URLs de API, codificação de dados de formulários, tratamento de URLs internacionalizadas e depuração de URLs codificadas.',
      ],
      faq: [
        { q: 'O que é codificação de URL?', a: 'A codificação de URL converte caracteres em um formato seguro para URLs. Caracteres especiais são substituídos por um sinal de porcentagem seguido de dois dígitos hexadecimais.' },
        { q: 'Qual a diferença entre encodeURIComponent e encodeURI?', a: 'encodeURIComponent codifica TODOS os caracteres especiais. É usado para valores individuais. encodeURI preserva a estrutura da URL para URLs completas.' },
        { q: 'Quando devo codificar texto em URL?', a: 'Quando o inclui em uma URL como parâmetro de consulta ou segmento de caminho. É especialmente importante para texto com espaços ou caracteres especiais.' },
        { q: 'Por que minha URL tem %20 em vez de espaços?', a: '%20 é a representação codificada de um espaço. URLs não podem conter espaços literais.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="url-encoder" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex gap-3">
            <button onClick={() => setDirection('encode')} className={`flex-1 py-2 rounded-lg border text-sm font-medium ${direction === 'encode' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>{labels.encode[lang]}</button>
            <button onClick={() => setDirection('decode')} className={`flex-1 py-2 rounded-lg border text-sm font-medium ${direction === 'decode' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>{labels.decode[lang]}</button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.mode[lang]}</label>
            <select value={mode} onChange={(e) => setMode(e.target.value as 'encodeComponent' | 'encodeURI')} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500">
              <option value="encodeComponent">{labels.componentDesc[lang]}</option>
              <option value="encodeURI">{labels.uriDesc[lang]}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.input[lang]}</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={4} placeholder={direction === 'encode' ? 'https://example.com/path?q=hello world&lang=en' : 'https%3A%2F%2Fexample.com'} className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500" />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm">
              {labels.error[lang]}: {error}
            </div>
          )}

          {output && !error && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">{labels.output[lang]}</label>
                <button onClick={handleCopy} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md">{copied ? t.copied : t.copy}</button>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-sm break-all select-all">{output}</div>
            </div>
          )}

          <button onClick={() => { setInput(output); setDirection(direction === 'encode' ? 'decode' : 'encode'); }} disabled={!output} className="w-full py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40">
            {labels.swap[lang]}
          </button>
        </div>

        {/* SEO Article */}
        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-4">{p}</p>)}
        </article>

        {/* FAQ Accordion */}
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
