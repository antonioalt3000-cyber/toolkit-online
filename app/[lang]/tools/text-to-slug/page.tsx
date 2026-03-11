'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  inputText: { en: 'Input Text', it: 'Testo di Input', es: 'Texto de Entrada', fr: 'Texte d\'Entrée', de: 'Eingabetext', pt: 'Texto de Entrada' },
  slug: { en: 'Generated Slug', it: 'Slug Generato', es: 'Slug Generado', fr: 'Slug Généré', de: 'Generierter Slug', pt: 'Slug Gerado' },
  copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  placeholder: { en: 'Enter text to convert to slug...', it: 'Inserisci testo da convertire in slug...', es: 'Ingresa texto para convertir a slug...', fr: 'Entrez du texte à convertir en slug...', de: 'Text eingeben zum Konvertieren...', pt: 'Digite texto para converter em slug...' },
  separator: { en: 'Separator', it: 'Separatore', es: 'Separador', fr: 'Séparateur', de: 'Trennzeichen', pt: 'Separador' },
  lowercase: { en: 'Lowercase', it: 'Minuscolo', es: 'Minúsculas', fr: 'Minuscules', de: 'Kleinbuchstaben', pt: 'Minúsculas' },
};

function textToSlug(text: string, separator: string, lowercase: boolean): string {
  let slug = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, separator)
    .replace(new RegExp(`[${separator}]+`, 'g'), separator);

  if (lowercase) slug = slug.toLowerCase();
  return slug;
}

export default function TextToSlug() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['text-to-slug'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [input, setInput] = useState('');
  const [separator, setSeparator] = useState('-');
  const [lowercase, setLowercase] = useState(true);
  const [copied, setCopied] = useState(false);

  const slug = textToSlug(input, separator, lowercase);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Text to Slug Converter – Create SEO-Friendly URL Slugs',
      paragraphs: [
        'A URL slug is the part of a web address that comes after the domain name and identifies a specific page in a human-readable format. For example, in "example.com/blog/my-first-post", the slug is "my-first-post". Creating clean, descriptive slugs is one of the most important on-page SEO practices.',
        'Our free text-to-slug converter instantly transforms any text into a URL-friendly format by removing special characters, replacing spaces with hyphens (or your chosen separator), stripping accented characters, and converting to lowercase. This ensures your URLs are clean, consistent, and optimized for search engines.',
        'Google has confirmed that keywords in URLs are a minor ranking factor, and clean URLs improve click-through rates because users can understand the page content before clicking. A slug like "best-running-shoes-2025" is far more appealing than "page?id=12345" in search results.',
        'This tool supports three separator options: hyphens (-), underscores (_), and dots (.). While hyphens are the standard recommended by Google for word separation in URLs, underscores are common in programming contexts, and dots are occasionally used in versioned file names or specific URL conventions.',
      ],
      faq: [
        { q: 'What is a URL slug and why does it matter for SEO?', a: 'A URL slug is the human-readable part of a URL that describes the page content. It matters for SEO because search engines use it to understand page content, and users are more likely to click on URLs they can read and understand. Google recommends keeping slugs descriptive and concise.' },
        { q: 'Should I use hyphens or underscores in URL slugs?', a: 'Google recommends hyphens (-) over underscores (_) for separating words in URLs. Google treats hyphens as word separators but treats underscores as word joiners. So "red-shoes" is read as two words, while "red_shoes" might be interpreted as one word.' },
        { q: 'How does the tool handle accented characters?', a: 'The tool uses Unicode normalization (NFD) to decompose accented characters into their base letter plus a combining mark, then removes the combining marks. So "café" becomes "cafe" and "résumé" becomes "resume", producing clean ASCII-only slugs.' },
        { q: 'What is the ideal length for a URL slug?', a: 'Google can handle long URLs, but shorter slugs perform better. Aim for 3-5 words that describe the page content. Remove stop words like "the", "and", "of" when they do not add meaning. For example, "best-budget-laptops" is better than "the-best-budget-laptops-of-the-year".' },
        { q: 'Can I use this slug generator for blog posts and e-commerce products?', a: 'Yes, this tool works for any URL slug need — blog posts, product pages, category pages, or any web page. Simply type or paste your title, and copy the generated slug into your CMS, whether it is WordPress, Shopify, Next.js, or any other platform.' },
      ],
    },
    it: {
      title: 'Convertitore Testo in Slug Gratuito – Crea Slug URL SEO-Friendly',
      paragraphs: [
        'Uno slug URL è la parte di un indirizzo web che viene dopo il nome del dominio e identifica una pagina specifica in un formato leggibile. Ad esempio, in "esempio.com/blog/il-mio-primo-articolo", lo slug è "il-mio-primo-articolo". Creare slug puliti e descrittivi è una delle pratiche SEO on-page più importanti.',
        'Il nostro convertitore testo-in-slug gratuito trasforma istantaneamente qualsiasi testo in un formato adatto agli URL rimuovendo caratteri speciali, sostituendo gli spazi con trattini (o il separatore scelto), eliminando i caratteri accentati e convertendo in minuscolo.',
        'Google ha confermato che le parole chiave negli URL sono un fattore di ranking minore, e gli URL puliti migliorano il tasso di clic perché gli utenti possono capire il contenuto della pagina prima di cliccare. Uno slug come "migliori-scarpe-running-2025" è molto più attraente di "pagina?id=12345".',
        'Questo strumento supporta tre opzioni di separatore: trattini (-), underscore (_) e punti (.). Mentre i trattini sono lo standard raccomandato da Google per la separazione delle parole negli URL, gli underscore sono comuni nella programmazione.',
      ],
      faq: [
        { q: 'Cos\'è uno slug URL e perché è importante per la SEO?', a: 'Uno slug URL è la parte leggibile di un URL che descrive il contenuto della pagina. È importante per la SEO perché i motori di ricerca lo usano per capire il contenuto, e gli utenti sono più propensi a cliccare su URL che possono leggere e capire.' },
        { q: 'Devo usare trattini o underscore negli slug URL?', a: 'Google raccomanda i trattini (-) rispetto agli underscore (_) per separare le parole negli URL. Google tratta i trattini come separatori di parole ma gli underscore come unificatori. Quindi "scarpe-rosse" viene letto come due parole.' },
        { q: 'Come gestisce lo strumento i caratteri accentati?', a: 'Lo strumento usa la normalizzazione Unicode (NFD) per decomporre i caratteri accentati nella lettera base più un segno combinante, poi rimuove i segni. Quindi "caffè" diventa "caffe" e "perché" diventa "perche".' },
        { q: 'Qual è la lunghezza ideale per uno slug URL?', a: 'Google può gestire URL lunghi, ma slug più corti funzionano meglio. Punta a 3-5 parole che descrivano il contenuto della pagina. Rimuovi le stop words come "il", "e", "di" quando non aggiungono significato.' },
        { q: 'Posso usare questo generatore di slug per blog e e-commerce?', a: 'Sì, questo strumento funziona per qualsiasi esigenza di slug URL — post del blog, pagine prodotto, pagine categoria o qualsiasi pagina web. Basta digitare o incollare il titolo e copiare lo slug generato nel tuo CMS.' },
      ],
    },
    es: {
      title: 'Convertidor de Texto a Slug Gratis – Crea Slugs de URL SEO-Friendly',
      paragraphs: [
        'Un slug de URL es la parte de una dirección web que viene después del nombre de dominio e identifica una página específica en un formato legible. Por ejemplo, en "ejemplo.com/blog/mi-primer-articulo", el slug es "mi-primer-articulo". Crear slugs limpios y descriptivos es una de las prácticas SEO on-page más importantes.',
        'Nuestro convertidor de texto a slug gratuito transforma instantáneamente cualquier texto en un formato apto para URLs eliminando caracteres especiales, reemplazando espacios con guiones y convirtiendo a minúsculas.',
        'Google ha confirmado que las palabras clave en las URLs son un factor de ranking menor, y las URLs limpias mejoran la tasa de clics porque los usuarios pueden entender el contenido de la página antes de hacer clic.',
        'Esta herramienta soporta tres opciones de separador: guiones (-), guiones bajos (_) y puntos (.). Los guiones son el estándar recomendado por Google para la separación de palabras en URLs.',
      ],
      faq: [
        { q: '¿Qué es un slug de URL y por qué importa para el SEO?', a: 'Un slug de URL es la parte legible de una URL que describe el contenido de la página. Importa para el SEO porque los motores de búsqueda lo usan para entender el contenido, y los usuarios son más propensos a hacer clic en URLs que pueden leer.' },
        { q: '¿Debo usar guiones o guiones bajos en los slugs?', a: 'Google recomienda guiones (-) sobre guiones bajos (_) para separar palabras en URLs. Google trata los guiones como separadores de palabras pero los guiones bajos como unificadores.' },
        { q: '¿Cómo maneja la herramienta los caracteres acentuados?', a: 'La herramienta usa normalización Unicode (NFD) para descomponer caracteres acentuados en su letra base, luego elimina los acentos. Así "café" se convierte en "cafe".' },
        { q: '¿Cuál es la longitud ideal para un slug de URL?', a: 'Los slugs más cortos funcionan mejor. Apunta a 3-5 palabras que describan el contenido. Elimina palabras vacías como "el", "y", "de" cuando no añaden significado.' },
        { q: '¿Puedo usar este generador para blogs y tiendas online?', a: 'Sí, esta herramienta funciona para cualquier necesidad de slug — posts de blog, páginas de producto, categorías o cualquier página web.' },
      ],
    },
    fr: {
      title: 'Convertisseur Texte en Slug Gratuit – Créez des Slugs URL Optimisés SEO',
      paragraphs: [
        'Un slug URL est la partie d\'une adresse web qui vient après le nom de domaine et identifie une page spécifique dans un format lisible. Par exemple, dans « exemple.com/blog/mon-premier-article », le slug est « mon-premier-article ». Créer des slugs propres et descriptifs est l\'une des pratiques SEO on-page les plus importantes.',
        'Notre convertisseur texte-en-slug gratuit transforme instantanément tout texte en un format adapté aux URL en supprimant les caractères spéciaux, en remplaçant les espaces par des tirets et en convertissant en minuscules.',
        'Google a confirmé que les mots-clés dans les URL sont un facteur de classement mineur, et les URL propres améliorent le taux de clics car les utilisateurs peuvent comprendre le contenu avant de cliquer.',
        'Cet outil supporte trois options de séparateur : tirets (-), underscores (_) et points (.). Les tirets sont le standard recommandé par Google pour la séparation des mots dans les URL.',
      ],
      faq: [
        { q: 'Qu\'est-ce qu\'un slug URL et pourquoi est-il important pour le SEO ?', a: 'Un slug URL est la partie lisible d\'une URL qui décrit le contenu de la page. Il est important pour le SEO car les moteurs de recherche l\'utilisent pour comprendre le contenu.' },
        { q: 'Dois-je utiliser des tirets ou des underscores dans les slugs ?', a: 'Google recommande les tirets (-) plutôt que les underscores (_) pour séparer les mots dans les URL. Google traite les tirets comme séparateurs de mots mais les underscores comme unificateurs.' },
        { q: 'Comment l\'outil gère-t-il les caractères accentués ?', a: 'L\'outil utilise la normalisation Unicode (NFD) pour décomposer les caractères accentués en leur lettre de base, puis supprime les accents. Ainsi « café » devient « cafe ».' },
        { q: 'Quelle est la longueur idéale pour un slug URL ?', a: 'Les slugs plus courts fonctionnent mieux. Visez 3-5 mots qui décrivent le contenu. Supprimez les mots vides comme « le », « et », « de » quand ils n\'ajoutent pas de sens.' },
        { q: 'Puis-je utiliser ce générateur pour des blogs et du e-commerce ?', a: 'Oui, cet outil fonctionne pour tout besoin de slug — articles de blog, pages produit, catégories ou toute page web.' },
      ],
    },
    de: {
      title: 'Kostenloser Text-zu-Slug-Konverter – SEO-freundliche URL-Slugs Erstellen',
      paragraphs: [
        'Ein URL-Slug ist der Teil einer Webadresse, der nach dem Domainnamen kommt und eine bestimmte Seite in einem lesbaren Format identifiziert. Zum Beispiel ist in „beispiel.de/blog/mein-erster-beitrag" der Slug „mein-erster-beitrag". Saubere, beschreibende Slugs zu erstellen ist eine der wichtigsten On-Page-SEO-Praktiken.',
        'Unser kostenloser Text-zu-Slug-Konverter wandelt jeden Text sofort in ein URL-freundliches Format um, indem Sonderzeichen entfernt, Leerzeichen durch Bindestriche ersetzt und in Kleinbuchstaben konvertiert wird.',
        'Google hat bestätigt, dass Schlüsselwörter in URLs ein geringer Ranking-Faktor sind, und saubere URLs verbessern die Klickrate, weil Benutzer den Seiteninhalt vor dem Klicken verstehen können.',
        'Dieses Tool unterstützt drei Trennzeichen-Optionen: Bindestriche (-), Unterstriche (_) und Punkte (.). Bindestriche sind der von Google empfohlene Standard für die Worttrennung in URLs.',
      ],
      faq: [
        { q: 'Was ist ein URL-Slug und warum ist er für SEO wichtig?', a: 'Ein URL-Slug ist der lesbare Teil einer URL, der den Seiteninhalt beschreibt. Er ist für SEO wichtig, weil Suchmaschinen ihn nutzen, um den Inhalt zu verstehen.' },
        { q: 'Sollte ich Bindestriche oder Unterstriche in URL-Slugs verwenden?', a: 'Google empfiehlt Bindestriche (-) gegenüber Unterstrichen (_) zur Worttrennung in URLs. Google behandelt Bindestriche als Worttrenner, Unterstriche jedoch als Wortverbinder.' },
        { q: 'Wie behandelt das Tool akzentuierte Zeichen?', a: 'Das Tool verwendet Unicode-Normalisierung (NFD), um akzentuierte Zeichen in ihren Basisbuchstaben zu zerlegen, und entfernt dann die Akzente. So wird „Café" zu „cafe".' },
        { q: 'Was ist die ideale Länge für einen URL-Slug?', a: 'Kürzere Slugs funktionieren besser. Streben Sie 3-5 Wörter an, die den Inhalt beschreiben. Entfernen Sie Stoppwörter wie „der", „und", „von", wenn sie keinen Sinn hinzufügen.' },
        { q: 'Kann ich diesen Generator für Blogs und E-Commerce nutzen?', a: 'Ja, dieses Tool funktioniert für jede Slug-Anforderung — Blog-Beiträge, Produktseiten, Kategorien oder jede Webseite.' },
      ],
    },
    pt: {
      title: 'Conversor de Texto para Slug Grátis – Crie Slugs de URL Otimizados para SEO',
      paragraphs: [
        'Um slug de URL é a parte de um endereço web que vem depois do nome do domínio e identifica uma página específica em formato legível. Por exemplo, em "exemplo.com/blog/meu-primeiro-artigo", o slug é "meu-primeiro-artigo". Criar slugs limpos e descritivos é uma das práticas SEO on-page mais importantes.',
        'Nosso conversor de texto para slug gratuito transforma instantaneamente qualquer texto em formato adequado para URLs, removendo caracteres especiais, substituindo espaços por hifens e convertendo para minúsculas.',
        'O Google confirmou que palavras-chave nas URLs são um fator de ranqueamento menor, e URLs limpas melhoram a taxa de cliques porque os usuários podem entender o conteúdo antes de clicar.',
        'Esta ferramenta suporta três opções de separador: hifens (-), underscores (_) e pontos (.). Os hifens são o padrão recomendado pelo Google para separação de palavras em URLs.',
      ],
      faq: [
        { q: 'O que é um slug de URL e por que é importante para SEO?', a: 'Um slug de URL é a parte legível de uma URL que descreve o conteúdo da página. É importante para SEO porque os mecanismos de busca o usam para entender o conteúdo.' },
        { q: 'Devo usar hifens ou underscores nos slugs?', a: 'O Google recomenda hifens (-) em vez de underscores (_) para separar palavras em URLs. O Google trata hifens como separadores de palavras, mas underscores como unificadores.' },
        { q: 'Como a ferramenta lida com caracteres acentuados?', a: 'A ferramenta usa normalização Unicode (NFD) para decompor caracteres acentuados em sua letra base, depois remove os acentos. Assim "café" vira "cafe".' },
        { q: 'Qual é o comprimento ideal para um slug de URL?', a: 'Slugs mais curtos funcionam melhor. Mire em 3-5 palavras que descrevam o conteúdo. Remova palavras vazias como "o", "e", "de" quando não adicionam significado.' },
        { q: 'Posso usar este gerador para blogs e e-commerce?', a: 'Sim, esta ferramenta funciona para qualquer necessidade de slug — posts de blog, páginas de produto, categorias ou qualquer página web.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="text-to-slug">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
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

          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('separator')}</label>
              <select
                value={separator}
                onChange={(e) => setSeparator(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="-">- (hyphen)</option>
                <option value="_">_ (underscore)</option>
                <option value=".">. (dot)</option>
              </select>
            </div>
            <label className="flex items-center gap-2 mt-5">
              <input type="checkbox" checked={lowercase} onChange={(e) => setLowercase(e.target.checked)} className="rounded" />
              <span className="text-sm text-gray-700">{t('lowercase')}</span>
            </label>
          </div>

          {input && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('slug')}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={slug}
                  readOnly
                  className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  {copied ? t('copied') : t('copy')}
                </button>
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
