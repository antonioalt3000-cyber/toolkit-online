'use client';
import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  inputText: { en: 'Input Text', it: 'Testo di Input', es: 'Texto de Entrada', fr: 'Texte d\'Entr\u00e9e', de: 'Eingabetext', pt: 'Texto de Entrada' },
  slug: { en: 'Generated Slug', it: 'Slug Generato', es: 'Slug Generado', fr: 'Slug G\u00e9n\u00e9r\u00e9', de: 'Generierter Slug', pt: 'Slug Gerado' },
  copy: { en: 'Copy Result', it: 'Copia Risultato', es: 'Copiar Resultado', fr: 'Copier le R\u00e9sultat', de: 'Ergebnis Kopieren', pt: 'Copiar Resultado' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '\u00a1Copiado!', fr: 'Copi\u00e9 !', de: 'Kopiert!', pt: 'Copiado!' },
  placeholder: { en: 'Enter text to convert to slug...', it: 'Inserisci testo da convertire in slug...', es: 'Ingresa texto para convertir a slug...', fr: 'Entrez du texte \u00e0 convertir en slug...', de: 'Text eingeben zum Konvertieren...', pt: 'Digite texto para converter em slug...' },
  separator: { en: 'Separator', it: 'Separatore', es: 'Separador', fr: 'S\u00e9parateur', de: 'Trennzeichen', pt: 'Separador' },
  lowercase: { en: 'Lowercase', it: 'Minuscolo', es: 'Min\u00fasculas', fr: 'Minuscules', de: 'Kleinbuchstaben', pt: 'Min\u00fasculas' },
  reset: { en: 'Reset', it: 'Resetta', es: 'Restablecer', fr: 'R\u00e9initialiser', de: 'Zur\u00fccksetzen', pt: 'Redefinir' },
  urlPreview: { en: 'URL Preview', it: 'Anteprima URL', es: 'Vista Previa de URL', fr: 'Aper\u00e7u de l\'URL', de: 'URL-Vorschau', pt: 'Pr\u00e9-visualiza\u00e7\u00e3o de URL' },
  slugLength: { en: 'Slug length', it: 'Lunghezza slug', es: 'Longitud del slug', fr: 'Longueur du slug', de: 'Slug-L\u00e4nge', pt: 'Comprimento do slug' },
  chars: { en: 'chars', it: 'caratteri', es: 'caracteres', fr: 'caract\u00e8res', de: 'Zeichen', pt: 'caracteres' },
  seoWarning: { en: 'SEO recommendation: keep slug under 60 characters', it: 'Raccomandazione SEO: mantieni lo slug sotto i 60 caratteri', es: 'Recomendaci\u00f3n SEO: mant\u00e9n el slug bajo 60 caracteres', fr: 'Recommandation SEO : gardez le slug sous 60 caract\u00e8res', de: 'SEO-Empfehlung: Slug unter 60 Zeichen halten', pt: 'Recomenda\u00e7\u00e3o SEO: mantenha o slug abaixo de 60 caracteres' },
  history: { en: 'Recent Conversions', it: 'Conversioni Recenti', es: 'Conversiones Recientes', fr: 'Conversions R\u00e9centes', de: 'Letzte Konvertierungen', pt: 'Convers\u00f5es Recentes' },
  maxLength: { en: 'Max Length', it: 'Lunghezza Massima', es: 'Longitud M\u00e1xima', fr: 'Longueur Max', de: 'Max. L\u00e4nge', pt: 'Comprimento M\u00e1ximo' },
  options: { en: 'Options', it: 'Opzioni', es: 'Opciones', fr: 'Options', de: 'Optionen', pt: 'Op\u00e7\u00f5es' },
  noLimit: { en: 'No limit', it: 'Nessun limite', es: 'Sin l\u00edmite', fr: 'Sans limite', de: 'Kein Limit', pt: 'Sem limite' },
  hyphen: { en: 'Hyphen (-)', it: 'Trattino (-)', es: 'Gui\u00f3n (-)', fr: 'Tiret (-)', de: 'Bindestrich (-)', pt: 'H\u00edfen (-)' },
  underscore: { en: 'Underscore (_)', it: 'Underscore (_)', es: 'Gui\u00f3n bajo (_)', fr: 'Underscore (_)', de: 'Unterstrich (_)', pt: 'Underscore (_)' },
  dot: { en: 'Dot (.)', it: 'Punto (.)', es: 'Punto (.)', fr: 'Point (.)', de: 'Punkt (.)', pt: 'Ponto (.)' },
};

function textToSlug(text: string, separator: string, lc: boolean, maxLen: number): string {
  let slug = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, separator)
    .replace(new RegExp(`[${separator.replace('.', '\\.')}]+`, 'g'), separator);

  if (lc) slug = slug.toLowerCase();
  if (maxLen > 0 && slug.length > maxLen) {
    slug = slug.slice(0, maxLen);
    // trim trailing separator
    if (slug.endsWith(separator)) slug = slug.slice(0, -separator.length);
  }
  return slug;
}

interface HistoryEntry {
  input: string;
  slug: string;
}

export default function TextToSlug() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['text-to-slug'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [input, setInput] = useState('');
  const [separator, setSeparator] = useState('-');
  const [lowercase, setLowercase] = useState(true);
  const [maxLength, setMaxLength] = useState(0);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const slug = textToSlug(input, separator, lowercase, maxLength);

  const copyToClipboard = useCallback(() => {
    if (!slug) return;
    navigator.clipboard.writeText(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    // Add to history
    setHistory(prev => {
      const exists = prev.some(h => h.slug === slug);
      if (exists) return prev;
      const next = [{ input, slug }, ...prev];
      return next.slice(0, 5);
    });
  }, [slug, input]);

  const handleReset = () => {
    setInput('');
    setCopied(false);
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Text to Slug Converter \u2013 Create SEO-Friendly URL Slugs',
      paragraphs: [
        'A URL slug is the part of a web address that comes after the domain name and identifies a specific page in a human-readable format. For example, in "example.com/blog/my-first-post", the slug is "my-first-post". Creating clean, descriptive slugs is one of the most important on-page SEO practices.',
        'Our free text-to-slug converter instantly transforms any text into a URL-friendly format by removing special characters, replacing spaces with hyphens (or your chosen separator), stripping accented characters, and converting to lowercase. This ensures your URLs are clean, consistent, and optimized for search engines.',
        'Google has confirmed that keywords in URLs are a minor ranking factor, and clean URLs improve click-through rates because users can understand the page content before clicking. A slug like "best-running-shoes-2025" is far more appealing than "page?id=12345" in search results.',
        'This tool supports three separator options: hyphens (-), underscores (_), and dots (.). While hyphens are the standard recommended by Google for word separation in URLs, underscores are common in programming contexts, and dots are occasionally used in versioned file names or specific URL conventions.',
      ],
      faq: [
        { q: 'What is a URL slug and why does it matter for SEO?', a: 'A URL slug is the human-readable part of a URL that describes the page content. It matters for SEO because search engines use it to understand page content, and users are more likely to click on URLs they can read and understand. Google recommends keeping slugs descriptive and concise.' },
        { q: 'Should I use hyphens or underscores in URL slugs?', a: 'Google recommends hyphens (-) over underscores (_) for separating words in URLs. Google treats hyphens as word separators but treats underscores as word joiners. So "red-shoes" is read as two words, while "red_shoes" might be interpreted as one word.' },
        { q: 'How does the tool handle accented characters?', a: 'The tool uses Unicode normalization (NFD) to decompose accented characters into their base letter plus a combining mark, then removes the combining marks. So "caf\u00e9" becomes "cafe" and "r\u00e9sum\u00e9" becomes "resume", producing clean ASCII-only slugs.' },
        { q: 'What is the ideal length for a URL slug?', a: 'Google can handle long URLs, but shorter slugs perform better. Aim for 3-5 words that describe the page content. Remove stop words like "the", "and", "of" when they do not add meaning. For example, "best-budget-laptops" is better than "the-best-budget-laptops-of-the-year".' },
        { q: 'Can I use this slug generator for blog posts and e-commerce products?', a: 'Yes, this tool works for any URL slug need \u2014 blog posts, product pages, category pages, or any web page. Simply type or paste your title, and copy the generated slug into your CMS, whether it is WordPress, Shopify, Next.js, or any other platform.' },
      ],
    },
    it: {
      title: 'Convertitore Testo in Slug Gratuito \u2013 Crea Slug URL SEO-Friendly',
      paragraphs: [
        'Uno slug URL \u00e8 la parte di un indirizzo web che viene dopo il nome del dominio e identifica una pagina specifica in un formato leggibile. Ad esempio, in "esempio.com/blog/il-mio-primo-articolo", lo slug \u00e8 "il-mio-primo-articolo". Creare slug puliti e descrittivi \u00e8 una delle pratiche SEO on-page pi\u00f9 importanti.',
        'Il nostro convertitore testo-in-slug gratuito trasforma istantaneamente qualsiasi testo in un formato adatto agli URL rimuovendo caratteri speciali, sostituendo gli spazi con trattini (o il separatore scelto), eliminando i caratteri accentati e convertendo in minuscolo.',
        'Google ha confermato che le parole chiave negli URL sono un fattore di ranking minore, e gli URL puliti migliorano il tasso di clic perch\u00e9 gli utenti possono capire il contenuto della pagina prima di cliccare. Uno slug come "migliori-scarpe-running-2025" \u00e8 molto pi\u00f9 attraente di "pagina?id=12345".',
        'Questo strumento supporta tre opzioni di separatore: trattini (-), underscore (_) e punti (.). Mentre i trattini sono lo standard raccomandato da Google per la separazione delle parole negli URL, gli underscore sono comuni nella programmazione.',
      ],
      faq: [
        { q: 'Cos\'\u00e8 uno slug URL e perch\u00e9 \u00e8 importante per la SEO?', a: 'Uno slug URL \u00e8 la parte leggibile di un URL che descrive il contenuto della pagina. \u00c8 importante per la SEO perch\u00e9 i motori di ricerca lo usano per capire il contenuto, e gli utenti sono pi\u00f9 propensi a cliccare su URL che possono leggere e capire.' },
        { q: 'Devo usare trattini o underscore negli slug URL?', a: 'Google raccomanda i trattini (-) rispetto agli underscore (_) per separare le parole negli URL. Google tratta i trattini come separatori di parole ma gli underscore come unificatori. Quindi "scarpe-rosse" viene letto come due parole.' },
        { q: 'Come gestisce lo strumento i caratteri accentati?', a: 'Lo strumento usa la normalizzazione Unicode (NFD) per decomporre i caratteri accentati nella lettera base pi\u00f9 un segno combinante, poi rimuove i segni. Quindi "caff\u00e8" diventa "caffe" e "perch\u00e9" diventa "perche".' },
        { q: 'Qual \u00e8 la lunghezza ideale per uno slug URL?', a: 'Google pu\u00f2 gestire URL lunghi, ma slug pi\u00f9 corti funzionano meglio. Punta a 3-5 parole che descrivano il contenuto della pagina. Rimuovi le stop words come "il", "e", "di" quando non aggiungono significato.' },
        { q: 'Posso usare questo generatore di slug per blog e e-commerce?', a: 'S\u00ec, questo strumento funziona per qualsiasi esigenza di slug URL \u2014 post del blog, pagine prodotto, pagine categoria o qualsiasi pagina web. Basta digitare o incollare il titolo e copiare lo slug generato nel tuo CMS.' },
      ],
    },
    es: {
      title: 'Convertidor de Texto a Slug Gratis \u2013 Crea Slugs de URL SEO-Friendly',
      paragraphs: [
        'Un slug de URL es la parte de una direcci\u00f3n web que viene despu\u00e9s del nombre de dominio e identifica una p\u00e1gina espec\u00edfica en un formato legible. Por ejemplo, en "ejemplo.com/blog/mi-primer-articulo", el slug es "mi-primer-articulo". Crear slugs limpios y descriptivos es una de las pr\u00e1cticas SEO on-page m\u00e1s importantes.',
        'Nuestro convertidor de texto a slug gratuito transforma instant\u00e1neamente cualquier texto en un formato apto para URLs eliminando caracteres especiales, reemplazando espacios con guiones y convirtiendo a min\u00fasculas.',
        'Google ha confirmado que las palabras clave en las URLs son un factor de ranking menor, y las URLs limpias mejoran la tasa de clics porque los usuarios pueden entender el contenido de la p\u00e1gina antes de hacer clic.',
        'Esta herramienta soporta tres opciones de separador: guiones (-), guiones bajos (_) y puntos (.). Los guiones son el est\u00e1ndar recomendado por Google para la separaci\u00f3n de palabras en URLs.',
      ],
      faq: [
        { q: '\u00bfQu\u00e9 es un slug de URL y por qu\u00e9 importa para el SEO?', a: 'Un slug de URL es la parte legible de una URL que describe el contenido de la p\u00e1gina. Importa para el SEO porque los motores de b\u00fasqueda lo usan para entender el contenido, y los usuarios son m\u00e1s propensos a hacer clic en URLs que pueden leer.' },
        { q: '\u00bfDebo usar guiones o guiones bajos en los slugs?', a: 'Google recomienda guiones (-) sobre guiones bajos (_) para separar palabras en URLs. Google trata los guiones como separadores de palabras pero los guiones bajos como unificadores.' },
        { q: '\u00bfC\u00f3mo maneja la herramienta los caracteres acentuados?', a: 'La herramienta usa normalizaci\u00f3n Unicode (NFD) para descomponer caracteres acentuados en su letra base, luego elimina los acentos. As\u00ed "caf\u00e9" se convierte en "cafe".' },
        { q: '\u00bfCu\u00e1l es la longitud ideal para un slug de URL?', a: 'Los slugs m\u00e1s cortos funcionan mejor. Apunta a 3-5 palabras que describan el contenido. Elimina palabras vac\u00edas como "el", "y", "de" cuando no a\u00f1aden significado.' },
        { q: '\u00bfPuedo usar este generador para blogs y tiendas online?', a: 'S\u00ed, esta herramienta funciona para cualquier necesidad de slug \u2014 posts de blog, p\u00e1ginas de producto, categor\u00edas o cualquier p\u00e1gina web.' },
      ],
    },
    fr: {
      title: 'Convertisseur Texte en Slug Gratuit \u2013 Cr\u00e9ez des Slugs URL Optimis\u00e9s SEO',
      paragraphs: [
        'Un slug URL est la partie d\'une adresse web qui vient apr\u00e8s le nom de domaine et identifie une page sp\u00e9cifique dans un format lisible. Par exemple, dans \u00ab exemple.com/blog/mon-premier-article \u00bb, le slug est \u00ab mon-premier-article \u00bb. Cr\u00e9er des slugs propres et descriptifs est l\'une des pratiques SEO on-page les plus importantes.',
        'Notre convertisseur texte-en-slug gratuit transforme instantan\u00e9ment tout texte en un format adapt\u00e9 aux URL en supprimant les caract\u00e8res sp\u00e9ciaux, en rempla\u00e7ant les espaces par des tirets et en convertissant en minuscules.',
        'Google a confirm\u00e9 que les mots-cl\u00e9s dans les URL sont un facteur de classement mineur, et les URL propres am\u00e9liorent le taux de clics car les utilisateurs peuvent comprendre le contenu avant de cliquer.',
        'Cet outil supporte trois options de s\u00e9parateur : tirets (-), underscores (_) et points (.). Les tirets sont le standard recommand\u00e9 par Google pour la s\u00e9paration des mots dans les URL.',
      ],
      faq: [
        { q: 'Qu\'est-ce qu\'un slug URL et pourquoi est-il important pour le SEO ?', a: 'Un slug URL est la partie lisible d\'une URL qui d\u00e9crit le contenu de la page. Il est important pour le SEO car les moteurs de recherche l\'utilisent pour comprendre le contenu.' },
        { q: 'Dois-je utiliser des tirets ou des underscores dans les slugs ?', a: 'Google recommande les tirets (-) plut\u00f4t que les underscores (_) pour s\u00e9parer les mots dans les URL. Google traite les tirets comme s\u00e9parateurs de mots mais les underscores comme unificateurs.' },
        { q: 'Comment l\'outil g\u00e8re-t-il les caract\u00e8res accentu\u00e9s ?', a: 'L\'outil utilise la normalisation Unicode (NFD) pour d\u00e9composer les caract\u00e8res accentu\u00e9s en leur lettre de base, puis supprime les accents. Ainsi \u00ab caf\u00e9 \u00bb devient \u00ab cafe \u00bb.' },
        { q: 'Quelle est la longueur id\u00e9ale pour un slug URL ?', a: 'Les slugs plus courts fonctionnent mieux. Visez 3-5 mots qui d\u00e9crivent le contenu. Supprimez les mots vides comme \u00ab le \u00bb, \u00ab et \u00bb, \u00ab de \u00bb quand ils n\'ajoutent pas de sens.' },
        { q: 'Puis-je utiliser ce g\u00e9n\u00e9rateur pour des blogs et du e-commerce ?', a: 'Oui, cet outil fonctionne pour tout besoin de slug \u2014 articles de blog, pages produit, cat\u00e9gories ou toute page web.' },
      ],
    },
    de: {
      title: 'Kostenloser Text-zu-Slug-Konverter \u2013 SEO-freundliche URL-Slugs Erstellen',
      paragraphs: [
        'Ein URL-Slug ist der Teil einer Webadresse, der nach dem Domainnamen kommt und eine bestimmte Seite in einem lesbaren Format identifiziert. Zum Beispiel ist in \u201ebeispiel.de/blog/mein-erster-beitrag\u201c der Slug \u201emein-erster-beitrag\u201c. Saubere, beschreibende Slugs zu erstellen ist eine der wichtigsten On-Page-SEO-Praktiken.',
        'Unser kostenloser Text-zu-Slug-Konverter wandelt jeden Text sofort in ein URL-freundliches Format um, indem Sonderzeichen entfernt, Leerzeichen durch Bindestriche ersetzt und in Kleinbuchstaben konvertiert wird.',
        'Google hat best\u00e4tigt, dass Schl\u00fcsselw\u00f6rter in URLs ein geringer Ranking-Faktor sind, und saubere URLs verbessern die Klickrate, weil Benutzer den Seiteninhalt vor dem Klicken verstehen k\u00f6nnen.',
        'Dieses Tool unterst\u00fctzt drei Trennzeichen-Optionen: Bindestriche (-), Unterstriche (_) und Punkte (.). Bindestriche sind der von Google empfohlene Standard f\u00fcr die Worttrennung in URLs.',
      ],
      faq: [
        { q: 'Was ist ein URL-Slug und warum ist er f\u00fcr SEO wichtig?', a: 'Ein URL-Slug ist der lesbare Teil einer URL, der den Seiteninhalt beschreibt. Er ist f\u00fcr SEO wichtig, weil Suchmaschinen ihn nutzen, um den Inhalt zu verstehen.' },
        { q: 'Sollte ich Bindestriche oder Unterstriche in URL-Slugs verwenden?', a: 'Google empfiehlt Bindestriche (-) gegen\u00fcber Unterstrichen (_) zur Worttrennung in URLs. Google behandelt Bindestriche als Worttrenner, Unterstriche jedoch als Wortverbinder.' },
        { q: 'Wie behandelt das Tool akzentuierte Zeichen?', a: 'Das Tool verwendet Unicode-Normalisierung (NFD), um akzentuierte Zeichen in ihren Basisbuchstaben zu zerlegen, und entfernt dann die Akzente. So wird \u201eCaf\u00e9\u201c zu \u201ecafe\u201c.' },
        { q: 'Was ist die ideale L\u00e4nge f\u00fcr einen URL-Slug?', a: 'K\u00fcrzere Slugs funktionieren besser. Streben Sie 3-5 W\u00f6rter an, die den Inhalt beschreiben. Entfernen Sie Stoppw\u00f6rter wie \u201eder\u201c, \u201eund\u201c, \u201evon\u201c, wenn sie keinen Sinn hinzuf\u00fcgen.' },
        { q: 'Kann ich diesen Generator f\u00fcr Blogs und E-Commerce nutzen?', a: 'Ja, dieses Tool funktioniert f\u00fcr jede Slug-Anforderung \u2014 Blog-Beitr\u00e4ge, Produktseiten, Kategorien oder jede Webseite.' },
      ],
    },
    pt: {
      title: 'Conversor de Texto para Slug Gr\u00e1tis \u2013 Crie Slugs de URL Otimizados para SEO',
      paragraphs: [
        'Um slug de URL \u00e9 a parte de um endere\u00e7o web que vem depois do nome do dom\u00ednio e identifica uma p\u00e1gina espec\u00edfica em formato leg\u00edvel. Por exemplo, em "exemplo.com/blog/meu-primeiro-artigo", o slug \u00e9 "meu-primeiro-artigo". Criar slugs limpos e descritivos \u00e9 uma das pr\u00e1ticas SEO on-page mais importantes.',
        'Nosso conversor de texto para slug gratuito transforma instantaneamente qualquer texto em formato adequado para URLs, removendo caracteres especiais, substituindo espa\u00e7os por h\u00edfens e convertendo para min\u00fasculas.',
        'O Google confirmou que palavras-chave nas URLs s\u00e3o um fator de ranqueamento menor, e URLs limpas melhoram a taxa de cliques porque os usu\u00e1rios podem entender o conte\u00fado antes de clicar.',
        'Esta ferramenta suporta tr\u00eas op\u00e7\u00f5es de separador: h\u00edfens (-), underscores (_) e pontos (.). Os h\u00edfens s\u00e3o o padr\u00e3o recomendado pelo Google para separa\u00e7\u00e3o de palavras em URLs.',
      ],
      faq: [
        { q: 'O que \u00e9 um slug de URL e por que \u00e9 importante para SEO?', a: 'Um slug de URL \u00e9 a parte leg\u00edvel de uma URL que descreve o conte\u00fado da p\u00e1gina. \u00c9 importante para SEO porque os mecanismos de busca o usam para entender o conte\u00fado.' },
        { q: 'Devo usar h\u00edfens ou underscores nos slugs?', a: 'O Google recomenda h\u00edfens (-) em vez de underscores (_) para separar palavras em URLs. O Google trata h\u00edfens como separadores de palavras, mas underscores como unificadores.' },
        { q: 'Como a ferramenta lida com caracteres acentuados?', a: 'A ferramenta usa normaliza\u00e7\u00e3o Unicode (NFD) para decompor caracteres acentuados em sua letra base, depois remove os acentos. Assim "caf\u00e9" vira "cafe".' },
        { q: 'Qual \u00e9 o comprimento ideal para um slug de URL?', a: 'Slugs mais curtos funcionam melhor. Mire em 3-5 palavras que descrevam o conte\u00fado. Remova palavras vazias como "o", "e", "de" quando n\u00e3o adicionam significado.' },
        { q: 'Posso usar este gerador para blogs e e-commerce?', a: 'Sim, esta ferramenta funciona para qualquer necessidade de slug \u2014 posts de blog, p\u00e1ginas de produto, categorias ou qualquer p\u00e1gina web.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="text-to-slug" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('inputText')}</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('placeholder')}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Options */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold text-gray-800">{t('options')}</p>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('separator')}</label>
                <select
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="-">{t('hyphen')}</option>
                  <option value="_">{t('underscore')}</option>
                  <option value=".">{t('dot')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('maxLength')}</label>
                <select
                  value={maxLength}
                  onChange={(e) => setMaxLength(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={0}>{t('noLimit')}</option>
                  <option value={30}>30</option>
                  <option value={40}>40</option>
                  <option value={50}>50</option>
                  <option value={60}>60</option>
                  <option value={80}>80</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <label className="flex items-center gap-2 pb-1">
                <input type="checkbox" checked={lowercase} onChange={(e) => setLowercase(e.target.checked)} className="rounded" />
                <span className="text-sm text-gray-700">{t('lowercase')}</span>
              </label>
            </div>
          </div>

          {/* Result Card */}
          {input && slug && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-3">
              <label className="block text-sm font-semibold text-green-800">{t('slug')}</label>
              <p className="font-mono text-lg text-green-900 bg-white rounded-lg border border-green-200 px-4 py-3 break-all select-all">
                {slug}
              </p>

              {/* URL Preview */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('urlPreview')}</label>
                <p className="text-sm text-gray-600 font-mono bg-white rounded-lg border border-gray-200 px-3 py-2 break-all">
                  example.com/<span className="text-blue-600">{slug}</span>
                </p>
              </div>

              {/* Validation: slug length */}
              <div className="flex items-center gap-2 text-sm">
                <span className={`font-medium ${slug.length > 60 ? 'text-amber-600' : 'text-green-700'}`}>
                  {t('slugLength')}: {slug.length} {t('chars')}
                </span>
                {slug.length > 60 && (
                  <span className="text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 text-xs font-medium">
                    {t('seoWarning')}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
                >
                  {copied ? t('copied') : t('copy')}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm transition-colors"
                >
                  {t('reset')}
                </button>
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('history')}</label>
              <div className="space-y-1">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-gray-400 truncate max-w-[40%]">{h.input}</span>
                    <span className="text-gray-300">&rarr;</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(h.slug);
                      }}
                      className="font-mono text-blue-600 hover:text-blue-800 truncate max-w-[50%] transition-colors text-left"
                      title={h.slug}
                    >
                      {h.slug}
                    </button>
                  </div>
                ))}
              </div>
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