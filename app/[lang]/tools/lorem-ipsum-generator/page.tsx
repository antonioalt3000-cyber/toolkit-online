'use client';
import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  paragraphs: { en: 'Number of Paragraphs', it: 'Numero di Paragrafi', es: 'Número de Párrafos', fr: 'Nombre de Paragraphes', de: 'Anzahl Absätze', pt: 'Número de Parágrafos' },
  generate: { en: 'Generate', it: 'Genera', es: 'Generar', fr: 'Générer', de: 'Generieren', pt: 'Gerar' },
  copy: { en: 'Copy to Clipboard', it: 'Copia negli Appunti', es: 'Copiar al Portapapeles', fr: 'Copier dans le Presse-papiers', de: 'In Zwischenablage kopieren', pt: 'Copiar para Área de Transferência' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  reset: { en: 'Reset', it: 'Ripristina', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  words: { en: 'Words', it: 'Parole', es: 'Palabras', fr: 'Mots', de: 'Wörter', pt: 'Palavras' },
  characters: { en: 'Characters', it: 'Caratteri', es: 'Caracteres', fr: 'Caractères', de: 'Zeichen', pt: 'Caracteres' },
  paragraphsCount: { en: 'Paragraphs', it: 'Paragrafi', es: 'Párrafos', fr: 'Paragraphes', de: 'Absätze', pt: 'Parágrafos' },
  format: { en: 'Format', it: 'Formato', es: 'Formato', fr: 'Format', de: 'Format', pt: 'Formato' },
  plainText: { en: 'Plain Text', it: 'Testo Semplice', es: 'Texto Plano', fr: 'Texte Brut', de: 'Klartext', pt: 'Texto Simples' },
  html: { en: 'HTML', it: 'HTML', es: 'HTML', fr: 'HTML', de: 'HTML', pt: 'HTML' },
  markdown: { en: 'Markdown', it: 'Markdown', es: 'Markdown', fr: 'Markdown', de: 'Markdown', pt: 'Markdown' },
  startClassic: { en: 'Start with "Lorem ipsum..."', it: 'Inizia con "Lorem ipsum..."', es: 'Empezar con "Lorem ipsum..."', fr: 'Commencer par "Lorem ipsum..."', de: 'Mit "Lorem ipsum..." beginnen', pt: 'Começar com "Lorem ipsum..."' },
  history: { en: 'History', it: 'Cronologia', es: 'Historial', fr: 'Historique', de: 'Verlauf', pt: 'Histórico' },
  clearHistory: { en: 'Clear', it: 'Cancella', es: 'Borrar', fr: 'Effacer', de: 'Löschen', pt: 'Limpar' },
  validation: { en: 'Paragraphs must be between 1 and 50', it: 'I paragrafi devono essere tra 1 e 50', es: 'Los párrafos deben estar entre 1 y 50', fr: 'Les paragraphes doivent être entre 1 et 50', de: 'Absätze müssen zwischen 1 und 50 liegen', pt: 'Os parágrafos devem estar entre 1 e 50' },
};

type FormatType = 'plain' | 'html' | 'markdown';

interface HistoryEntry {
  text: string;
  preview: string;
  paragraphs: number;
  format: FormatType;
  timestamp: number;
}

const CLASSIC_OPENING = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

const loremSentences = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Curabitur pretium tincidunt lacus, nec gravida nisi vehicula at.',
  'Proin eget tortor risus, vitae dapibus turpis gravida ut.',
  'Maecenas sed diam eget risus varius blandit sit amet non magna.',
  'Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh.',
  'Donec id elit non mi porta gravida at eget metus.',
  'Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.',
  'Aenean lacinia bibendum nulla sed consectetur.',
  'Nullam quis risus eget urna mollis ornare vel eu leo.',
  'Integer posuere erat a ante venenatis dapibus posuere velit aliquet.',
  'Praesent commodo cursus magna, vel scelerisque nisl consectetur et.',
  'Morbi leo risus, porta ac consectetur ac, vestibulum at eros.',
  'Cras mattis consectetur purus sit amet fermentum.',
  'Etiam porta sem malesuada magna mollis euismod.',
  'Vestibulum id ligula porta felis euismod semper.',
  'Nulla vitae elit libero, a pharetra augue.',
];

function generateParagraph(index: number): string {
  const count = 3 + (index % 4);
  const sentences: string[] = [];
  for (let i = 0; i < count; i++) {
    sentences.push(loremSentences[(index * count + i) % loremSentences.length]);
  }
  return sentences.join(' ');
}

export default function LoremIpsumGenerator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['lorem-ipsum-generator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [count, setCount] = useState(3);
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<FormatType>('plain');
  const [startClassic, setStartClassic] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [validationError, setValidationError] = useState('');

  const formatOutput = useCallback((paragraphs: string[], fmt: FormatType): string => {
    switch (fmt) {
      case 'html':
        return paragraphs.map(p => `<p>${p}</p>`).join('\n\n');
      case 'markdown':
        return paragraphs.join('\n\n');
      case 'plain':
      default:
        return paragraphs.join('\n\n');
    }
  }, []);

  const handleGenerate = () => {
    if (count < 1 || count > 50) {
      setValidationError(t('validation'));
      return;
    }
    setValidationError('');

    const paragraphs: string[] = [];
    for (let i = 0; i < count; i++) {
      paragraphs.push(generateParagraph(i));
    }

    if (startClassic && paragraphs.length > 0) {
      const first = paragraphs[0];
      if (!first.startsWith(CLASSIC_OPENING)) {
        paragraphs[0] = CLASSIC_OPENING + ' ' + first;
      }
    }

    const output = formatOutput(paragraphs, format);
    setText(output);
    setCopied(false);

    const preview = output.substring(0, 30) + (output.length > 30 ? '...' : '');
    setHistory(prev => {
      const newEntry: HistoryEntry = { text: output, preview, paragraphs: count, format, timestamp: Date.now() };
      const updated = [newEntry, ...prev];
      return updated.slice(0, 5);
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCount(3);
    setText('');
    setCopied(false);
    setFormat('plain');
    setStartClassic(true);
    setValidationError('');
  };

  const handleCountChange = (value: number) => {
    setCount(value);
    if (value >= 1 && value <= 50) {
      setValidationError('');
    }
  };

  const loadFromHistory = (entry: HistoryEntry) => {
    setText(entry.text);
    setCount(entry.paragraphs);
    setFormat(entry.format);
    setCopied(false);
  };

  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const charCount = text.length;
  const paraCount = text ? text.split(/\n\n+/).filter(Boolean).length : 0;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Lorem Ipsum Generator – Placeholder Text for Designers & Developers',
      paragraphs: [
        'Lorem Ipsum has been the industry-standard placeholder text since the 1500s, when an unknown printer scrambled a section of Cicero\'s "De Finibus Bonorum et Malorum" to create a type specimen book. Today, it remains the go-to dummy text for web designers, graphic designers, and developers who need realistic-looking content without the distraction of meaningful words.',
        'Our free Lorem Ipsum generator lets you produce between 1 and 20 paragraphs of classic placeholder text with a single click. Whether you are mocking up a website layout, testing typography in a design tool, or filling a database with sample content, this tool saves you time and effort.',
        'Using placeholder text during the design phase keeps stakeholders focused on layout, spacing, and visual hierarchy rather than reading and critiquing draft copy. This is why Lorem Ipsum is preferred over using "content here, content here" or random characters that look unnatural.',
        'Once generated, you can copy the text to your clipboard instantly and paste it into Figma, Sketch, Adobe XD, HTML files, WordPress, or any other platform. The paragraphs produced are deterministic, meaning the same index always generates the same output for consistent mockups.',
      ],
      faq: [
        { q: 'What is Lorem Ipsum and why is it used?', a: 'Lorem Ipsum is dummy text derived from a 1st-century BC Latin text by Cicero. It is used because it has a natural distribution of letters and word lengths that resembles real language, making it ideal for layout testing without distracting readers with meaningful content.' },
        { q: 'How many paragraphs of Lorem Ipsum can I generate?', a: 'You can generate between 1 and 20 paragraphs at a time. Each paragraph contains 3 to 6 sentences, providing a realistic text block similar to what you would find in a real article or web page.' },
        { q: 'Is Lorem Ipsum bad for SEO?', a: 'Yes, if left on a live website. Lorem Ipsum should only be used during the design and development phase. Search engines can detect placeholder text and it provides no value to users, which can negatively affect your rankings.' },
        { q: 'Can I use Lorem Ipsum in commercial projects?', a: 'Absolutely. Lorem Ipsum is not copyrighted and is freely available for any use, personal or commercial. Just make sure to replace it with real content before going live.' },
        { q: 'Are there alternatives to Lorem Ipsum?', a: 'Yes, there are many alternatives like Hipster Ipsum, Bacon Ipsum, and Cupcake Ipsum that add a humorous twist. However, classic Lorem Ipsum remains the most professional and widely recognized option.' },
      ],
    },
    it: {
      title: 'Generatore di Lorem Ipsum Gratuito – Testo Segnaposto per Designer e Sviluppatori',
      paragraphs: [
        'Il Lorem Ipsum è il testo segnaposto standard del settore fin dal 1500, quando uno stampatore sconosciuto mescolò una sezione del "De Finibus Bonorum et Malorum" di Cicerone per creare un campione tipografico. Oggi rimane il testo fittizio di riferimento per web designer, grafici e sviluppatori che necessitano di contenuti dall\'aspetto realistico.',
        'Il nostro generatore di Lorem Ipsum gratuito ti permette di produrre da 1 a 20 paragrafi di testo segnaposto classico con un solo clic. Che tu stia progettando un layout web, testando la tipografia o riempiendo un database con contenuti di esempio, questo strumento ti fa risparmiare tempo.',
        'L\'uso del testo segnaposto durante la fase di progettazione mantiene l\'attenzione su layout, spaziatura e gerarchia visiva, anziché sulla lettura e la critica di bozze di testo. Ecco perché il Lorem Ipsum è preferito rispetto a testo casuale che appare innaturale.',
        'Una volta generato, puoi copiare il testo negli appunti e incollarlo in Figma, Sketch, Adobe XD, file HTML, WordPress o qualsiasi altra piattaforma. I paragrafi prodotti sono deterministici, garantendo output coerenti per i tuoi mockup.',
      ],
      faq: [
        { q: 'Cos\'è il Lorem Ipsum e perché si usa?', a: 'Il Lorem Ipsum è un testo fittizio derivato da un\'opera latina del I secolo a.C. di Cicerone. Si usa perché ha una distribuzione naturale di lettere e lunghezze di parole che somiglia al linguaggio reale, rendendolo ideale per testare i layout.' },
        { q: 'Quanti paragrafi di Lorem Ipsum posso generare?', a: 'Puoi generare da 1 a 20 paragrafi alla volta. Ogni paragrafo contiene da 3 a 6 frasi, fornendo un blocco di testo realistico simile a quello di un vero articolo.' },
        { q: 'Il Lorem Ipsum è dannoso per la SEO?', a: 'Sì, se lasciato su un sito live. Il Lorem Ipsum dovrebbe essere usato solo durante la fase di design e sviluppo. I motori di ricerca possono rilevare il testo segnaposto e questo può influire negativamente sul ranking.' },
        { q: 'Posso usare il Lorem Ipsum in progetti commerciali?', a: 'Certamente. Il Lorem Ipsum non è soggetto a copyright ed è liberamente disponibile per qualsiasi uso, personale o commerciale. Assicurati solo di sostituirlo con contenuto reale prima della pubblicazione.' },
        { q: 'Esistono alternative al Lorem Ipsum?', a: 'Sì, ci sono molte alternative come Hipster Ipsum, Bacon Ipsum e Cupcake Ipsum che aggiungono un tocco umoristico. Tuttavia, il Lorem Ipsum classico rimane l\'opzione più professionale e riconosciuta.' },
      ],
    },
    es: {
      title: 'Generador de Lorem Ipsum Gratis – Texto de Relleno para Diseñadores y Desarrolladores',
      paragraphs: [
        'Lorem Ipsum ha sido el texto de relleno estándar de la industria desde el siglo XVI, cuando un impresor desconocido mezcló una sección del "De Finibus Bonorum et Malorum" de Cicerón para crear un libro de muestras tipográficas. Hoy sigue siendo el texto ficticio preferido por diseñadores web, gráficos y desarrolladores.',
        'Nuestro generador de Lorem Ipsum gratuito te permite producir entre 1 y 20 párrafos de texto de relleno clásico con un solo clic. Ya sea que estés diseñando un layout web, probando tipografía o llenando una base de datos con contenido de muestra, esta herramienta te ahorra tiempo.',
        'Usar texto de relleno durante la fase de diseño mantiene la atención en el layout, el espaciado y la jerarquía visual, en lugar de leer y criticar borradores de texto. Por eso Lorem Ipsum es preferido frente a texto aleatorio que parece poco natural.',
        'Una vez generado, puedes copiar el texto al portapapeles al instante y pegarlo en Figma, Sketch, Adobe XD, archivos HTML, WordPress o cualquier otra plataforma.',
      ],
      faq: [
        { q: '¿Qué es Lorem Ipsum y por qué se usa?', a: 'Lorem Ipsum es un texto ficticio derivado de una obra latina del siglo I a.C. de Cicerón. Se usa porque tiene una distribución natural de letras y longitudes de palabras que se asemeja al lenguaje real, ideal para probar diseños.' },
        { q: '¿Cuántos párrafos de Lorem Ipsum puedo generar?', a: 'Puedes generar entre 1 y 20 párrafos a la vez. Cada párrafo contiene de 3 a 6 oraciones, proporcionando un bloque de texto realista.' },
        { q: '¿El Lorem Ipsum es malo para el SEO?', a: 'Sí, si se deja en un sitio web en producción. Lorem Ipsum solo debe usarse durante la fase de diseño y desarrollo. Los motores de búsqueda pueden detectar texto de relleno y afectar negativamente tu posicionamiento.' },
        { q: '¿Puedo usar Lorem Ipsum en proyectos comerciales?', a: 'Por supuesto. Lorem Ipsum no tiene derechos de autor y está disponible libremente para cualquier uso. Solo asegúrate de reemplazarlo con contenido real antes de publicar.' },
        { q: '¿Existen alternativas al Lorem Ipsum?', a: 'Sí, hay muchas alternativas como Hipster Ipsum, Bacon Ipsum y Cupcake Ipsum. Sin embargo, el Lorem Ipsum clásico sigue siendo la opción más profesional y reconocida.' },
      ],
    },
    fr: {
      title: 'Générateur Lorem Ipsum Gratuit – Texte de Remplissage pour Designers et Développeurs',
      paragraphs: [
        'Le Lorem Ipsum est le texte de remplissage standard de l\'industrie depuis le XVIe siècle, lorsqu\'un imprimeur inconnu a mélangé une section du « De Finibus Bonorum et Malorum » de Cicéron pour créer un spécimen typographique. Aujourd\'hui, il reste le texte fictif de référence pour les designers web, graphistes et développeurs.',
        'Notre générateur de Lorem Ipsum gratuit vous permet de produire entre 1 et 20 paragraphes de texte de remplissage classique en un seul clic. Que vous conceviez une maquette web, testiez la typographie ou remplissiez une base de données, cet outil vous fait gagner du temps.',
        'L\'utilisation de texte de remplissage pendant la phase de conception maintient l\'attention sur la mise en page, l\'espacement et la hiérarchie visuelle plutôt que sur la lecture du contenu. C\'est pourquoi le Lorem Ipsum est préféré au texte aléatoire.',
        'Une fois généré, vous pouvez copier le texte dans le presse-papiers et le coller dans Figma, Sketch, Adobe XD, des fichiers HTML, WordPress ou toute autre plateforme.',
      ],
      faq: [
        { q: 'Qu\'est-ce que le Lorem Ipsum et pourquoi l\'utilise-t-on ?', a: 'Le Lorem Ipsum est un texte fictif dérivé d\'une œuvre latine du Ier siècle av. J.-C. de Cicéron. On l\'utilise parce qu\'il a une distribution naturelle de lettres et de longueurs de mots qui ressemble à un vrai langage.' },
        { q: 'Combien de paragraphes de Lorem Ipsum puis-je générer ?', a: 'Vous pouvez générer entre 1 et 20 paragraphes à la fois. Chaque paragraphe contient de 3 à 6 phrases, fournissant un bloc de texte réaliste.' },
        { q: 'Le Lorem Ipsum est-il mauvais pour le SEO ?', a: 'Oui, s\'il reste sur un site en production. Le Lorem Ipsum ne devrait être utilisé que pendant la phase de conception. Les moteurs de recherche peuvent détecter le texte de remplissage.' },
        { q: 'Puis-je utiliser le Lorem Ipsum dans des projets commerciaux ?', a: 'Absolument. Le Lorem Ipsum n\'est pas protégé par le droit d\'auteur et est librement disponible pour tout usage. Assurez-vous simplement de le remplacer par du vrai contenu avant la mise en ligne.' },
        { q: 'Existe-t-il des alternatives au Lorem Ipsum ?', a: 'Oui, il existe de nombreuses alternatives comme Hipster Ipsum, Bacon Ipsum et Cupcake Ipsum. Cependant, le Lorem Ipsum classique reste l\'option la plus professionnelle.' },
      ],
    },
    de: {
      title: 'Kostenloser Lorem Ipsum Generator – Platzhaltertext für Designer und Entwickler',
      paragraphs: [
        'Lorem Ipsum ist seit dem 16. Jahrhundert der branchenübliche Platzhaltertext, als ein unbekannter Drucker einen Abschnitt von Ciceros „De Finibus Bonorum et Malorum" mischte, um ein Schriftmusterbuch zu erstellen. Heute bleibt es der bevorzugte Blindtext für Webdesigner, Grafiker und Entwickler.',
        'Unser kostenloser Lorem Ipsum Generator ermöglicht es Ihnen, zwischen 1 und 20 Absätze klassischen Platzhaltertext mit einem einzigen Klick zu erzeugen. Ob Sie ein Website-Layout entwerfen, Typografie testen oder eine Datenbank mit Beispielinhalten füllen – dieses Tool spart Ihnen Zeit.',
        'Die Verwendung von Platzhaltertext während der Designphase hält den Fokus auf Layout, Abstände und visuelle Hierarchie, anstatt auf das Lesen von Textentwürfen. Deshalb wird Lorem Ipsum gegenüber zufälligem Text bevorzugt.',
        'Nach der Generierung können Sie den Text sofort in die Zwischenablage kopieren und in Figma, Sketch, Adobe XD, HTML-Dateien, WordPress oder jede andere Plattform einfügen.',
      ],
      faq: [
        { q: 'Was ist Lorem Ipsum und warum wird es verwendet?', a: 'Lorem Ipsum ist ein Blindtext, der von einem lateinischen Text Ciceros aus dem 1. Jahrhundert v. Chr. abgeleitet ist. Er wird verwendet, weil er eine natürliche Verteilung von Buchstaben und Wortlängen hat, die einer echten Sprache ähnelt.' },
        { q: 'Wie viele Absätze Lorem Ipsum kann ich generieren?', a: 'Sie können zwischen 1 und 20 Absätze auf einmal generieren. Jeder Absatz enthält 3 bis 6 Sätze und bietet einen realistischen Textblock.' },
        { q: 'Ist Lorem Ipsum schlecht für SEO?', a: 'Ja, wenn es auf einer Live-Website verbleibt. Lorem Ipsum sollte nur während der Design- und Entwicklungsphase verwendet werden. Suchmaschinen können Platzhaltertext erkennen.' },
        { q: 'Kann ich Lorem Ipsum in kommerziellen Projekten verwenden?', a: 'Auf jeden Fall. Lorem Ipsum ist nicht urheberrechtlich geschützt und frei für jeden Zweck verfügbar. Stellen Sie nur sicher, dass Sie es vor dem Launch durch echten Inhalt ersetzen.' },
        { q: 'Gibt es Alternativen zu Lorem Ipsum?', a: 'Ja, es gibt viele Alternativen wie Hipster Ipsum, Bacon Ipsum und Cupcake Ipsum. Das klassische Lorem Ipsum bleibt jedoch die professionellste Option.' },
      ],
    },
    pt: {
      title: 'Gerador de Lorem Ipsum Grátis – Texto de Preenchimento para Designers e Desenvolvedores',
      paragraphs: [
        'O Lorem Ipsum tem sido o texto de preenchimento padrão da indústria desde o século XVI, quando um impressor desconhecido misturou uma seção do "De Finibus Bonorum et Malorum" de Cícero para criar um livro de amostras tipográficas. Hoje continua sendo o texto fictício preferido por designers web, gráficos e desenvolvedores.',
        'Nosso gerador de Lorem Ipsum gratuito permite produzir entre 1 e 20 parágrafos de texto de preenchimento clássico com um único clique. Seja para criar um layout web, testar tipografia ou preencher um banco de dados com conteúdo de exemplo, esta ferramenta economiza seu tempo.',
        'Usar texto de preenchimento durante a fase de design mantém o foco no layout, espaçamento e hierarquia visual, em vez de ler e criticar rascunhos de texto. Por isso o Lorem Ipsum é preferido em relação a texto aleatório.',
        'Depois de gerado, você pode copiar o texto para a área de transferência instantaneamente e colá-lo no Figma, Sketch, Adobe XD, arquivos HTML, WordPress ou qualquer outra plataforma.',
      ],
      faq: [
        { q: 'O que é Lorem Ipsum e por que é usado?', a: 'Lorem Ipsum é um texto fictício derivado de uma obra latina do século I a.C. de Cícero. É usado porque tem uma distribuição natural de letras e comprimentos de palavras que se assemelha a linguagem real.' },
        { q: 'Quantos parágrafos de Lorem Ipsum posso gerar?', a: 'Você pode gerar entre 1 e 20 parágrafos de cada vez. Cada parágrafo contém de 3 a 6 frases, fornecendo um bloco de texto realista.' },
        { q: 'O Lorem Ipsum é ruim para SEO?', a: 'Sim, se deixado em um site em produção. O Lorem Ipsum só deve ser usado durante a fase de design e desenvolvimento. Os mecanismos de busca podem detectar texto de preenchimento.' },
        { q: 'Posso usar Lorem Ipsum em projetos comerciais?', a: 'Com certeza. O Lorem Ipsum não tem direitos autorais e está disponível livremente para qualquer uso. Apenas certifique-se de substituí-lo por conteúdo real antes da publicação.' },
        { q: 'Existem alternativas ao Lorem Ipsum?', a: 'Sim, existem muitas alternativas como Hipster Ipsum, Bacon Ipsum e Cupcake Ipsum. No entanto, o Lorem Ipsum clássico continua sendo a opção mais profissional.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="lorem-ipsum-generator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Paragraph count slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('paragraphs')}: {count}</label>
            <input type="range" min="1" max="50" value={count} onChange={(e) => handleCountChange(parseInt(e.target.value))}
              className="w-full" />
            {validationError && (
              <p className="text-red-500 text-xs mt-1">{validationError}</p>
            )}
          </div>

          {/* Format selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('format')}</label>
            <div className="flex gap-2">
              {(['plain', 'html', 'markdown'] as FormatType[]).map((fmt) => (
                <button key={fmt} onClick={() => setFormat(fmt)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${format === fmt ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {fmt === 'plain' ? t('plainText') : fmt === 'html' ? t('html') : t('markdown')}
                </button>
              ))}
            </div>
          </div>

          {/* Classic opening toggle */}
          <div className="flex items-center gap-3">
            <button onClick={() => setStartClassic(!startClassic)}
              className={`relative w-10 h-5 rounded-full transition-colors ${startClassic ? 'bg-blue-600' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${startClassic ? 'translate-x-5' : ''}`} />
            </button>
            <span className="text-sm text-gray-700">{t('startClassic')}</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button onClick={handleGenerate}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              {t('generate')}
            </button>
            <button onClick={handleReset}
              className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
              {t('reset')}
            </button>
          </div>

          {/* Stats cards */}
          {text && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-700">{wordCount}</div>
                <div className="text-xs text-blue-600">{t('words')}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-700">{charCount}</div>
                <div className="text-xs text-green-600">{t('characters')}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-700">{paraCount}</div>
                <div className="text-xs text-purple-600">{t('paragraphsCount')}</div>
              </div>
            </div>
          )}

          {/* Output textarea */}
          {text && (
            <>
              <div className="relative">
                <textarea readOnly value={text} rows={12}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 bg-gray-50 resize-none" />
              </div>
              <button onClick={handleCopy}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${copied ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {copied ? t('copied') : t('copy')}
              </button>
            </>
          )}
        </div>

        {/* History section */}
        {history.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">{t('history')}</h3>
              <button onClick={() => setHistory([])}
                className="text-xs text-red-500 hover:text-red-700 transition-colors">
                {t('clearHistory')}
              </button>
            </div>
            <div className="space-y-2">
              {history.map((entry, i) => (
                <button key={entry.timestamp} onClick={() => loadFromHistory(entry)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm">
                  <span className="text-gray-500 mr-2">#{history.length - i}</span>
                  <span className="text-gray-700">{entry.preview}</span>
                  <span className="text-gray-400 ml-2 text-xs">({entry.paragraphs}p, {entry.format})</span>
                </button>
              ))}
            </div>
          </div>
        )}

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
