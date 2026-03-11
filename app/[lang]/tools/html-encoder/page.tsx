'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  encode: { en: 'Encode', it: 'Codifica', es: 'Codificar', fr: 'Encoder', de: 'Kodieren', pt: 'Codificar' },
  decode: { en: 'Decode', it: 'Decodifica', es: 'Decodificar', fr: 'Décoder', de: 'Dekodieren', pt: 'Decodificar' },
  input: { en: 'Input', it: 'Input', es: 'Entrada', fr: 'Entrée', de: 'Eingabe', pt: 'Entrada' },
  output: { en: 'Output', it: 'Output', es: 'Salida', fr: 'Sortie', de: 'Ausgabe', pt: 'Saída' },
  copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  encodePlaceholder: { en: 'Enter HTML to encode...', it: 'Inserisci HTML da codificare...', es: 'Ingresa HTML para codificar...', fr: 'Entrez du HTML à encoder...', de: 'HTML zum Kodieren eingeben...', pt: 'Digite HTML para codificar...' },
  decodePlaceholder: { en: 'Enter encoded HTML to decode...', it: 'Inserisci HTML codificato da decodificare...', es: 'Ingresa HTML codificado para decodificar...', fr: 'Entrez du HTML encodé à décoder...', de: 'Kodierten HTML zum Dekodieren eingeben...', pt: 'Digite HTML codificado para decodificar...' },
};

function encodeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function decodeHTML(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

export default function HtmlEncoder() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['html-encoder'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const output = input ? (mode === 'encode' ? encodeHTML(input) : decodeHTML(input)) : '';

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free HTML Encoder/Decoder – Escape & Unescape HTML Entities Online',
      paragraphs: [
        'HTML encoding (also called HTML escaping) is the process of converting special characters into their corresponding HTML entities. For example, the less-than sign (<) becomes &lt; and the ampersand (&) becomes &amp;. This is essential for displaying code snippets on web pages and preventing cross-site scripting (XSS) attacks.',
        'Our free HTML encoder and decoder tool handles both directions: encode raw HTML into safe entities for display, or decode HTML entities back into their original characters. This is a daily need for web developers, technical writers, and anyone working with HTML content.',
        'When you embed user-generated content in a web page without encoding it, you open the door to XSS vulnerabilities. An attacker could inject malicious JavaScript through a comment field or form input. Encoding ensures that all special characters are displayed as text rather than interpreted as HTML or script code.',
        'The tool handles all five critical HTML entities: & (ampersand), < (less than), > (greater than), " (double quote), and \' (single quote/apostrophe). It also decodes numeric character references (&#60;) and hexadecimal references (&#x3C;), covering all standard HTML entity formats.',
      ],
      faq: [
        { q: 'What is the difference between HTML encoding and URL encoding?', a: 'HTML encoding converts special HTML characters into entities (e.g., < becomes &lt;) for safe display in web pages. URL encoding (percent encoding) converts characters into %XX format (e.g., space becomes %20) for safe inclusion in URLs. They serve different purposes and use different formats.' },
        { q: 'Why is HTML encoding important for security?', a: 'HTML encoding prevents cross-site scripting (XSS) attacks by ensuring that user input is displayed as plain text rather than executed as HTML or JavaScript code. Without encoding, an attacker could inject <script> tags that steal cookies, redirect users, or perform other malicious actions.' },
        { q: 'Which characters need to be HTML encoded?', a: 'The five essential characters are: & (ampersand), < (less than), > (greater than), " (double quote), and \' (apostrophe). These characters have special meaning in HTML, so they must be encoded when displayed as content rather than as markup.' },
        { q: 'Can I use this tool to encode HTML for email templates?', a: 'Yes. HTML encoding is especially important in email templates where certain characters might be misinterpreted by email clients. Encode any special characters in your text content to ensure consistent rendering across Gmail, Outlook, Apple Mail, and other clients.' },
        { q: 'What are numeric and hexadecimal HTML entities?', a: 'Numeric entities use the format &#NUMBER; (e.g., &#60; for <) and hexadecimal entities use &#xHEX; (e.g., &#x3C; for <). Both represent the Unicode code point of a character. This decoder handles all three formats: named entities (&lt;), numeric (&#60;), and hexadecimal (&#x3C;).' },
      ],
    },
    it: {
      title: 'Codificatore/Decodificatore HTML Gratuito – Escape e Unescape delle Entità HTML',
      paragraphs: [
        'La codifica HTML (chiamata anche HTML escaping) è il processo di conversione dei caratteri speciali nelle corrispondenti entità HTML. Ad esempio, il segno di minore (<) diventa &lt; e la e commerciale (&) diventa &amp;. Questo è essenziale per mostrare frammenti di codice nelle pagine web e prevenire attacchi cross-site scripting (XSS).',
        'Il nostro strumento gratuito di codifica e decodifica HTML gestisce entrambe le direzioni: codifica HTML grezzo in entità sicure per la visualizzazione, o decodifica le entità HTML nei loro caratteri originali. Questa è un\'esigenza quotidiana per sviluppatori web e scrittori tecnici.',
        'Quando incorpori contenuto generato dagli utenti in una pagina web senza codificarlo, apri la porta a vulnerabilità XSS. Un attaccante potrebbe iniettare JavaScript malevolo attraverso un campo commento o un modulo. La codifica assicura che tutti i caratteri speciali siano mostrati come testo.',
        'Lo strumento gestisce tutte e cinque le entità HTML critiche: & (e commerciale), < (minore), > (maggiore), " (virgolette doppie) e \' (apostrofo). Decodifica anche i riferimenti numerici (&#60;) e esadecimali (&#x3C;).',
      ],
      faq: [
        { q: 'Qual è la differenza tra codifica HTML e codifica URL?', a: 'La codifica HTML converte i caratteri speciali HTML in entità (es. < diventa &lt;) per la visualizzazione sicura nelle pagine web. La codifica URL converte i caratteri nel formato %XX (es. lo spazio diventa %20) per l\'inclusione sicura negli URL.' },
        { q: 'Perché la codifica HTML è importante per la sicurezza?', a: 'La codifica HTML previene gli attacchi cross-site scripting (XSS) assicurando che l\'input dell\'utente venga mostrato come testo semplice anziché eseguito come codice HTML o JavaScript.' },
        { q: 'Quali caratteri devono essere codificati in HTML?', a: 'I cinque caratteri essenziali sono: & (e commerciale), < (minore), > (maggiore), " (virgolette doppie) e \' (apostrofo). Questi hanno un significato speciale in HTML.' },
        { q: 'Posso usare questo strumento per i template email?', a: 'Sì. La codifica HTML è particolarmente importante nei template email dove certi caratteri potrebbero essere interpretati male dai client di posta. Codifica i caratteri speciali per garantire un rendering coerente.' },
        { q: 'Cosa sono le entità HTML numeriche e esadecimali?', a: 'Le entità numeriche usano il formato &#NUMERO; (es. &#60; per <) e quelle esadecimali usano &#xHEX; (es. &#x3C; per <). Questo decodificatore gestisce tutti e tre i formati.' },
      ],
    },
    es: {
      title: 'Codificador/Decodificador HTML Gratis – Escape y Unescape de Entidades HTML',
      paragraphs: [
        'La codificación HTML (también llamada HTML escaping) es el proceso de convertir caracteres especiales en sus entidades HTML correspondientes. Por ejemplo, el signo menor que (<) se convierte en &lt; y el ampersand (&) se convierte en &amp;. Esto es esencial para mostrar fragmentos de código en páginas web y prevenir ataques XSS.',
        'Nuestra herramienta gratuita de codificación y decodificación HTML maneja ambas direcciones: codifica HTML crudo en entidades seguras o decodifica entidades HTML a sus caracteres originales. Esta es una necesidad diaria para desarrolladores web y escritores técnicos.',
        'Cuando incorporas contenido generado por usuarios sin codificarlo, abres la puerta a vulnerabilidades XSS. Un atacante podría inyectar JavaScript malicioso a través de un campo de comentarios. La codificación asegura que los caracteres especiales se muestren como texto.',
        'La herramienta maneja las cinco entidades HTML críticas: & (ampersand), < (menor que), > (mayor que), " (comillas dobles) y \' (apóstrofe). También decodifica referencias numéricas y hexadecimales.',
      ],
      faq: [
        { q: '¿Cuál es la diferencia entre codificación HTML y codificación URL?', a: 'La codificación HTML convierte caracteres especiales en entidades (ej. < se vuelve &lt;). La codificación URL convierte caracteres al formato %XX (ej. espacio se vuelve %20). Sirven para propósitos diferentes.' },
        { q: '¿Por qué la codificación HTML es importante para la seguridad?', a: 'La codificación HTML previene ataques XSS asegurando que el input del usuario se muestre como texto plano en lugar de ejecutarse como código HTML o JavaScript.' },
        { q: '¿Qué caracteres necesitan codificación HTML?', a: 'Los cinco esenciales son: & (ampersand), < (menor que), > (mayor que), " (comillas dobles) y \' (apóstrofe). Estos tienen significado especial en HTML.' },
        { q: '¿Puedo usar esta herramienta para plantillas de email?', a: 'Sí. La codificación HTML es especialmente importante en plantillas de email donde ciertos caracteres podrían malinterpretarse por los clientes de correo.' },
        { q: '¿Qué son las entidades HTML numéricas y hexadecimales?', a: 'Las entidades numéricas usan el formato &#NÚMERO; y las hexadecimales &#xHEX;. Este decodificador maneja los tres formatos: entidades nombradas, numéricas y hexadecimales.' },
      ],
    },
    fr: {
      title: 'Encodeur/Décodeur HTML Gratuit – Échappement et Dé-échappement des Entités HTML',
      paragraphs: [
        'L\'encodage HTML (aussi appelé échappement HTML) est le processus de conversion des caractères spéciaux en leurs entités HTML correspondantes. Par exemple, le signe inférieur (<) devient &lt; et l\'esperluette (&) devient &amp;. C\'est essentiel pour afficher des extraits de code et prévenir les attaques XSS.',
        'Notre outil gratuit d\'encodage et décodage HTML gère les deux directions : encoder du HTML brut en entités sûres ou décoder les entités HTML en leurs caractères d\'origine. C\'est un besoin quotidien pour les développeurs web.',
        'Quand vous intégrez du contenu généré par les utilisateurs sans l\'encoder, vous ouvrez la porte aux vulnérabilités XSS. L\'encodage assure que tous les caractères spéciaux sont affichés comme du texte.',
        'L\'outil gère les cinq entités HTML critiques : & (esperluette), < (inférieur), > (supérieur), " (guillemet double) et \' (apostrophe). Il décode aussi les références numériques et hexadécimales.',
      ],
      faq: [
        { q: 'Quelle est la différence entre l\'encodage HTML et l\'encodage URL ?', a: 'L\'encodage HTML convertit les caractères spéciaux en entités (ex. < devient &lt;). L\'encodage URL convertit en format %XX (ex. l\'espace devient %20). Ils servent des objectifs différents.' },
        { q: 'Pourquoi l\'encodage HTML est-il important pour la sécurité ?', a: 'L\'encodage HTML prévient les attaques XSS en s\'assurant que l\'entrée utilisateur est affichée comme texte brut plutôt qu\'exécutée comme code.' },
        { q: 'Quels caractères doivent être encodés en HTML ?', a: 'Les cinq essentiels sont : & (esperluette), < (inférieur), > (supérieur), " (guillemet double) et \' (apostrophe).' },
        { q: 'Puis-je utiliser cet outil pour les templates email ?', a: 'Oui. L\'encodage HTML est particulièrement important dans les templates email où certains caractères pourraient être mal interprétés par les clients mail.' },
        { q: 'Que sont les entités HTML numériques et hexadécimales ?', a: 'Les entités numériques utilisent le format &#NOMBRE; et les hexadécimales &#xHEX;. Ce décodeur gère les trois formats : nommés, numériques et hexadécimaux.' },
      ],
    },
    de: {
      title: 'Kostenloser HTML-Encoder/Decoder – HTML-Entitäten Online Escapen und Unescapen',
      paragraphs: [
        'HTML-Kodierung (auch HTML-Escaping genannt) ist der Prozess der Umwandlung von Sonderzeichen in ihre entsprechenden HTML-Entitäten. Zum Beispiel wird das Kleiner-als-Zeichen (<) zu &lt; und das Kaufmanns-Und (&) zu &amp;. Dies ist essentiell für die Anzeige von Code-Snippets und die Verhinderung von XSS-Angriffen.',
        'Unser kostenloses HTML-Encoder/Decoder-Tool arbeitet in beide Richtungen: Rohes HTML in sichere Entitäten kodieren oder HTML-Entitäten zurück in Originalzeichen dekodieren. Dies ist ein täglicher Bedarf für Webentwickler.',
        'Wenn Sie benutzergenerierten Inhalt ohne Kodierung einbetten, öffnen Sie die Tür für XSS-Schwachstellen. Die Kodierung stellt sicher, dass alle Sonderzeichen als Text angezeigt werden.',
        'Das Tool verarbeitet alle fünf kritischen HTML-Entitäten: & (Kaufmanns-Und), < (kleiner als), > (größer als), " (Anführungszeichen) und \' (Apostroph). Es dekodiert auch numerische und hexadezimale Referenzen.',
      ],
      faq: [
        { q: 'Was ist der Unterschied zwischen HTML- und URL-Kodierung?', a: 'HTML-Kodierung wandelt Sonderzeichen in Entitäten um (z.B. < wird &lt;). URL-Kodierung wandelt in das %XX-Format um (z.B. Leerzeichen wird %20). Sie dienen unterschiedlichen Zwecken.' },
        { q: 'Warum ist HTML-Kodierung wichtig für die Sicherheit?', a: 'HTML-Kodierung verhindert XSS-Angriffe, indem sichergestellt wird, dass Benutzereingaben als Klartext angezeigt werden statt als Code ausgeführt zu werden.' },
        { q: 'Welche Zeichen müssen HTML-kodiert werden?', a: 'Die fünf essentiellen sind: & (Kaufmanns-Und), < (kleiner als), > (größer als), " (Anführungszeichen) und \' (Apostroph).' },
        { q: 'Kann ich dieses Tool für E-Mail-Templates verwenden?', a: 'Ja. HTML-Kodierung ist besonders wichtig in E-Mail-Templates, wo bestimmte Zeichen von E-Mail-Clients falsch interpretiert werden könnten.' },
        { q: 'Was sind numerische und hexadezimale HTML-Entitäten?', a: 'Numerische Entitäten verwenden das Format &#ZAHL; und hexadezimale &#xHEX;. Dieser Decoder verarbeitet alle drei Formate: benannte, numerische und hexadezimale Entitäten.' },
      ],
    },
    pt: {
      title: 'Codificador/Decodificador HTML Grátis – Escape e Unescape de Entidades HTML',
      paragraphs: [
        'A codificação HTML (também chamada de HTML escaping) é o processo de converter caracteres especiais em suas entidades HTML correspondentes. Por exemplo, o sinal de menor (<) vira &lt; e o e-comercial (&) vira &amp;. Isso é essencial para exibir trechos de código e prevenir ataques XSS.',
        'Nossa ferramenta gratuita de codificação e decodificação HTML funciona nas duas direções: codifica HTML bruto em entidades seguras ou decodifica entidades HTML de volta aos caracteres originais. Essa é uma necessidade diária para desenvolvedores web.',
        'Quando você incorpora conteúdo gerado por usuários sem codificá-lo, abre portas para vulnerabilidades XSS. A codificação garante que todos os caracteres especiais sejam exibidos como texto.',
        'A ferramenta lida com as cinco entidades HTML críticas: & (e-comercial), < (menor que), > (maior que), " (aspas duplas) e \' (apóstrofo). Também decodifica referências numéricas e hexadecimais.',
      ],
      faq: [
        { q: 'Qual a diferença entre codificação HTML e codificação URL?', a: 'A codificação HTML converte caracteres especiais em entidades (ex. < vira &lt;). A codificação URL converte para o formato %XX (ex. espaço vira %20). Servem propósitos diferentes.' },
        { q: 'Por que a codificação HTML é importante para segurança?', a: 'A codificação HTML previne ataques XSS garantindo que a entrada do usuário seja exibida como texto simples em vez de executada como código.' },
        { q: 'Quais caracteres precisam de codificação HTML?', a: 'Os cinco essenciais são: & (e-comercial), < (menor que), > (maior que), " (aspas duplas) e \' (apóstrofo).' },
        { q: 'Posso usar esta ferramenta para templates de email?', a: 'Sim. A codificação HTML é especialmente importante em templates de email onde certos caracteres podem ser mal interpretados pelos clientes de email.' },
        { q: 'O que são entidades HTML numéricas e hexadecimais?', a: 'Entidades numéricas usam o formato &#NÚMERO; e hexadecimais &#xHEX;. Este decodificador lida com os três formatos: nomeados, numéricos e hexadecimais.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="html-encoder">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => { setMode('encode'); setInput(''); }}
              className={`flex-1 py-2 rounded-lg font-medium ${mode === 'encode' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('encode')}
            </button>
            <button
              onClick={() => { setMode('decode'); setInput(''); }}
              className={`flex-1 py-2 rounded-lg font-medium ${mode === 'decode' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('decode')}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('input')}</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encode' ? t('encodePlaceholder') : t('decodePlaceholder')}
              rows={5}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {output && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">{t('output')}</label>
                <button onClick={copyOutput} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  {copied ? t('copied') : t('copy')}
                </button>
              </div>
              <textarea
                value={output}
                readOnly
                rows={5}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm"
              />
            </div>
          )}
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
