'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function JsonFormatter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['json-formatter'][lang];

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const labels = {
    format: { en: 'Format', it: 'Formatta', es: 'Formatear', fr: 'Formater', de: 'Formatieren', pt: 'Formatar' },
    minify: { en: 'Minify', it: 'Minimizza', es: 'Minimizar', fr: 'Minifier', de: 'Minimieren', pt: 'Minificar' },
    placeholder: { en: 'Paste your JSON here...', it: 'Incolla il tuo JSON qui...', es: 'Pega tu JSON aquí...', fr: 'Collez votre JSON ici...', de: 'JSON hier einfügen...', pt: 'Cole seu JSON aqui...' },
    valid: { en: 'Valid JSON', it: 'JSON valido', es: 'JSON válido', fr: 'JSON valide', de: 'Gültiges JSON', pt: 'JSON válido' },
    invalid: { en: 'Invalid JSON', it: 'JSON non valido', es: 'JSON no válido', fr: 'JSON invalide', de: 'Ungültiges JSON', pt: 'JSON inválido' },
  } as Record<string, Record<Locale, string>>;

  const format = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError('');
    } catch (e) {
      setError(labels.invalid[lang] + ': ' + (e as Error).message);
      setOutput('');
    }
  };

  const minify = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError('');
    } catch (e) {
      setError(labels.invalid[lang] + ': ' + (e as Error).message);
      setOutput('');
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'JSON Formatter & Validator: Beautify and Minify JSON Online',
      paragraphs: [
        'JSON (JavaScript Object Notation) is the most widely used data interchange format on the web. Whether you are building REST APIs, configuring applications, or debugging data flows, working with well-formatted JSON is essential. Our free JSON formatter lets you beautify, minify, and validate JSON data instantly in your browser.',
        'The formatter takes any valid JSON input and produces clean, indented output with 2-space indentation. This makes deeply nested objects and arrays easy to read and understand. The minifier does the opposite, removing all whitespace to produce the most compact representation possible, which is ideal for reducing payload size in API responses and configuration files.',
        'Beyond formatting, this tool serves as a JSON validator. If your input contains syntax errors such as missing commas, unmatched brackets, trailing commas, or single quotes instead of double quotes, the tool displays a clear error message pointing to the problem. This saves significant debugging time compared to searching for errors manually in large JSON documents.',
        'Developers use this tool daily for tasks like formatting API responses for inspection, minifying JSON for production deployment, validating configuration files before deploying, and cleaning up JSON data from various sources. The copy button lets you quickly transfer the formatted or minified output to your clipboard.',
      ],
      faq: [
        { q: 'What is JSON and why do developers use it?', a: 'JSON (JavaScript Object Notation) is a lightweight data interchange format that is easy for humans to read and write, and easy for machines to parse. It is the standard format for web APIs, configuration files, and data storage in modern applications.' },
        { q: 'How do I validate if my JSON is correct?', a: 'Paste your JSON into the input field and click Format. If the JSON is valid, you will see the formatted output. If it contains errors, the tool will display a specific error message indicating what is wrong and where the problem is.' },
        { q: 'What is the difference between formatting and minifying JSON?', a: 'Formatting (beautifying) adds indentation and newlines to make JSON readable. Minifying removes all unnecessary whitespace to create the smallest possible output. Formatted JSON is for reading; minified JSON is for transmission and storage.' },
        { q: 'Why does my JSON show an "unexpected token" error?', a: 'Common causes include trailing commas after the last item in an array or object, single quotes instead of double quotes, unquoted property names, comments (JSON does not support comments), and missing or extra brackets or braces.' },
        { q: 'Can I format JSON with different indentation levels?', a: 'This tool uses 2-space indentation, which is the most common standard. If you need different indentation, you can format the JSON here first, then adjust it in your code editor which typically offers configurable indentation settings.' },
      ],
    },
    it: {
      title: 'Formattatore JSON e Validatore: Abbellisci e Minimizza JSON Online',
      paragraphs: [
        'JSON (JavaScript Object Notation) è il formato di scambio dati più utilizzato sul web. Che tu stia costruendo API REST, configurando applicazioni o eseguendo debug dei flussi di dati, lavorare con JSON ben formattato è essenziale. Il nostro formattatore JSON gratuito ti permette di abbellire, minimizzare e validare dati JSON istantaneamente nel tuo browser.',
        'Il formattatore prende qualsiasi input JSON valido e produce un output pulito e indentato con 2 spazi di indentazione. Questo rende oggetti e array profondamente annidati facili da leggere e comprendere. Il minimizzatore fa l\'opposto, rimuovendo tutti gli spazi bianchi per produrre la rappresentazione più compatta possibile.',
        'Oltre alla formattazione, questo strumento serve come validatore JSON. Se il tuo input contiene errori di sintassi come virgole mancanti, parentesi non corrispondenti o virgolette singole invece di doppie, lo strumento mostra un chiaro messaggio di errore che indica il problema.',
        'Gli sviluppatori usano questo strumento quotidianamente per formattare risposte API per l\'ispezione, minimizzare JSON per il deployment in produzione, validare file di configurazione e pulire dati JSON da varie fonti.',
      ],
      faq: [
        { q: 'Cos\'è JSON e perché gli sviluppatori lo usano?', a: 'JSON (JavaScript Object Notation) è un formato di scambio dati leggero, facile da leggere e scrivere per gli umani e da analizzare per le macchine. È il formato standard per API web, file di configurazione e archiviazione dati nelle applicazioni moderne.' },
        { q: 'Come valido se il mio JSON è corretto?', a: 'Incolla il tuo JSON nel campo di input e clicca Formatta. Se il JSON è valido, vedrai l\'output formattato. Se contiene errori, lo strumento mostrerà un messaggio di errore specifico.' },
        { q: 'Qual è la differenza tra formattare e minimizzare JSON?', a: 'La formattazione aggiunge indentazione e nuove righe per rendere il JSON leggibile. La minimizzazione rimuove tutti gli spazi non necessari per creare l\'output più piccolo possibile.' },
        { q: 'Perché il mio JSON mostra un errore "token inatteso"?', a: 'Le cause comuni includono virgole finali dopo l\'ultimo elemento, virgolette singole invece di doppie, nomi di proprietà non quotati, commenti (JSON non supporta i commenti) e parentesi mancanti o in eccesso.' },
        { q: 'Posso formattare JSON con diversi livelli di indentazione?', a: 'Questo strumento usa 2 spazi di indentazione, lo standard più comune. Se hai bisogno di un\'indentazione diversa, puoi formattare il JSON qui e poi regolarlo nel tuo editor di codice.' },
      ],
    },
    es: {
      title: 'Formateador y Validador JSON: Embellece y Minimiza JSON Online',
      paragraphs: [
        'JSON (JavaScript Object Notation) es el formato de intercambio de datos más utilizado en la web. Ya sea que estés construyendo APIs REST, configurando aplicaciones o depurando flujos de datos, trabajar con JSON bien formateado es esencial. Nuestro formateador JSON gratuito te permite embellecer, minimizar y validar datos JSON al instante.',
        'El formateador toma cualquier entrada JSON válida y produce una salida limpia e indentada con 2 espacios. Esto hace que los objetos y arrays profundamente anidados sean fáciles de leer. El minimizador hace lo opuesto, eliminando todos los espacios en blanco para la representación más compacta.',
        'Además de formatear, esta herramienta sirve como validador JSON. Si tu entrada contiene errores de sintaxis, la herramienta muestra un mensaje de error claro indicando el problema.',
        'Los desarrolladores usan esta herramienta diariamente para formatear respuestas de API, minimizar JSON para producción, validar archivos de configuración y limpiar datos JSON de diversas fuentes.',
      ],
      faq: [
        { q: '¿Qué es JSON y por qué lo usan los desarrolladores?', a: 'JSON es un formato de intercambio de datos ligero, fácil de leer y escribir para humanos y de analizar para máquinas. Es el formato estándar para APIs web y archivos de configuración.' },
        { q: '¿Cómo valido si mi JSON es correcto?', a: 'Pega tu JSON en el campo de entrada y haz clic en Formatear. Si es válido, verás la salida formateada. Si contiene errores, la herramienta mostrará un mensaje de error específico.' },
        { q: '¿Cuál es la diferencia entre formatear y minimizar JSON?', a: 'Formatear agrega indentación y saltos de línea para hacer el JSON legible. Minimizar elimina todos los espacios innecesarios para la salida más compacta posible.' },
        { q: '¿Por qué mi JSON muestra un error de "token inesperado"?', a: 'Causas comunes incluyen comas finales, comillas simples en vez de dobles, nombres de propiedades sin comillas, comentarios y corchetes faltantes o sobrantes.' },
        { q: '¿Puedo formatear JSON con diferentes niveles de indentación?', a: 'Esta herramienta usa 2 espacios de indentación. Si necesitas otra indentación, puedes formatear aquí y ajustarlo en tu editor de código.' },
      ],
    },
    fr: {
      title: 'Formateur et Validateur JSON : Embellir et Minifier du JSON en Ligne',
      paragraphs: [
        'JSON (JavaScript Object Notation) est le format d\'échange de données le plus utilisé sur le web. Que vous construisiez des APIs REST, configuriez des applications ou déboguiez des flux de données, travailler avec du JSON bien formaté est essentiel. Notre formateur JSON gratuit vous permet d\'embellir, minifier et valider des données JSON instantanément.',
        'Le formateur prend n\'importe quelle entrée JSON valide et produit une sortie propre et indentée avec 2 espaces d\'indentation. Le minifieur fait l\'inverse, supprimant tous les espaces blancs pour la représentation la plus compacte possible.',
        'Au-delà du formatage, cet outil sert de validateur JSON. Si votre entrée contient des erreurs de syntaxe, l\'outil affiche un message d\'erreur clair indiquant le problème.',
        'Les développeurs utilisent cet outil quotidiennement pour formater les réponses API, minifier du JSON pour la production, valider des fichiers de configuration et nettoyer des données JSON.',
      ],
      faq: [
        { q: 'Qu\'est-ce que JSON et pourquoi les développeurs l\'utilisent-ils ?', a: 'JSON est un format d\'échange de données léger, facile à lire et écrire pour les humains et à analyser pour les machines. C\'est le format standard pour les APIs web et les fichiers de configuration.' },
        { q: 'Comment valider si mon JSON est correct ?', a: 'Collez votre JSON dans le champ et cliquez sur Formater. Si le JSON est valide, vous verrez la sortie formatée. Sinon, l\'outil affichera un message d\'erreur spécifique.' },
        { q: 'Quelle est la différence entre formater et minifier du JSON ?', a: 'Le formatage ajoute l\'indentation et les retours à la ligne pour la lisibilité. La minification supprime tous les espaces inutiles pour la sortie la plus compacte.' },
        { q: 'Pourquoi mon JSON affiche-t-il une erreur "token inattendu" ?', a: 'Causes courantes : virgules finales, guillemets simples au lieu de doubles, noms de propriétés non quotés, commentaires et crochets manquants ou en trop.' },
        { q: 'Puis-je formater du JSON avec différents niveaux d\'indentation ?', a: 'Cet outil utilise 2 espaces d\'indentation. Si vous avez besoin d\'une indentation différente, formatez ici puis ajustez dans votre éditeur de code.' },
      ],
    },
    de: {
      title: 'JSON Formatter & Validator: JSON Online Verschönern und Minimieren',
      paragraphs: [
        'JSON (JavaScript Object Notation) ist das am häufigsten verwendete Datenaustauschformat im Web. Ob Sie REST-APIs bauen, Anwendungen konfigurieren oder Datenflüsse debuggen, gut formatiertes JSON ist essentiell. Unser kostenloser JSON-Formatter ermöglicht es Ihnen, JSON-Daten sofort zu verschönern, minimieren und validieren.',
        'Der Formatter nimmt jede gültige JSON-Eingabe und erzeugt eine saubere, eingerückte Ausgabe mit 2 Leerzeichen Einrückung. Der Minimizer macht das Gegenteil und entfernt alle Leerzeichen für die kompakteste Darstellung.',
        'Über die Formatierung hinaus dient dieses Tool als JSON-Validator. Bei Syntaxfehlern zeigt das Tool eine klare Fehlermeldung an, die auf das Problem hinweist.',
        'Entwickler nutzen dieses Tool täglich zum Formatieren von API-Antworten, Minimieren von JSON für die Produktion, Validieren von Konfigurationsdateien und Bereinigen von JSON-Daten aus verschiedenen Quellen.',
      ],
      faq: [
        { q: 'Was ist JSON und warum verwenden Entwickler es?', a: 'JSON ist ein leichtgewichtiges Datenaustauschformat, das für Menschen leicht zu lesen und zu schreiben ist. Es ist der Standard für Web-APIs und Konfigurationsdateien.' },
        { q: 'Wie validiere ich, ob mein JSON korrekt ist?', a: 'Fügen Sie Ihr JSON ein und klicken Sie auf Formatieren. Bei gültigem JSON sehen Sie die formatierte Ausgabe. Bei Fehlern zeigt das Tool eine spezifische Fehlermeldung.' },
        { q: 'Was ist der Unterschied zwischen Formatieren und Minimieren?', a: 'Formatieren fügt Einrückung und Zeilenumbrüche für die Lesbarkeit hinzu. Minimieren entfernt alle unnötigen Leerzeichen für die kompakteste Ausgabe.' },
        { q: 'Warum zeigt mein JSON einen "unerwartetes Token" Fehler?', a: 'Häufige Ursachen sind nachgestellte Kommas, einfache statt doppelte Anführungszeichen, nicht quotierte Eigenschaftsnamen, Kommentare und fehlende Klammern.' },
        { q: 'Kann ich JSON mit verschiedenen Einrückungsebenen formatieren?', a: 'Dieses Tool verwendet 2 Leerzeichen Einrückung. Für andere Einrückungen formatieren Sie hier und passen dann in Ihrem Code-Editor an.' },
      ],
    },
    pt: {
      title: 'Formatador e Validador JSON: Embeleze e Minifique JSON Online',
      paragraphs: [
        'JSON (JavaScript Object Notation) é o formato de intercâmbio de dados mais utilizado na web. Seja construindo APIs REST, configurando aplicações ou depurando fluxos de dados, trabalhar com JSON bem formatado é essencial. Nosso formatador JSON gratuito permite embelezar, minificar e validar dados JSON instantaneamente.',
        'O formatador pega qualquer entrada JSON válida e produz uma saída limpa e indentada com 2 espaços. O minificador faz o oposto, removendo todos os espaços em branco para a representação mais compacta possível.',
        'Além da formatação, esta ferramenta serve como validador JSON. Se sua entrada contiver erros de sintaxe, a ferramenta exibe uma mensagem de erro clara indicando o problema.',
        'Desenvolvedores usam esta ferramenta diariamente para formatar respostas de API, minificar JSON para produção, validar arquivos de configuração e limpar dados JSON de diversas fontes.',
      ],
      faq: [
        { q: 'O que é JSON e por que desenvolvedores o usam?', a: 'JSON é um formato de intercâmbio de dados leve, fácil de ler e escrever para humanos e de analisar para máquinas. É o formato padrão para APIs web e arquivos de configuração.' },
        { q: 'Como valido se meu JSON está correto?', a: 'Cole seu JSON no campo de entrada e clique em Formatar. Se for válido, você verá a saída formatada. Se contiver erros, a ferramenta mostrará uma mensagem de erro específica.' },
        { q: 'Qual é a diferença entre formatar e minificar JSON?', a: 'Formatar adiciona indentação e quebras de linha para legibilidade. Minificar remove todos os espaços desnecessários para a saída mais compacta possível.' },
        { q: 'Por que meu JSON mostra um erro de "token inesperado"?', a: 'Causas comuns incluem vírgulas finais, aspas simples em vez de duplas, nomes de propriedades sem aspas, comentários e colchetes faltantes ou extras.' },
        { q: 'Posso formatar JSON com diferentes níveis de indentação?', a: 'Esta ferramenta usa 2 espaços de indentação. Se precisar de indentação diferente, formate aqui e ajuste no seu editor de código.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="json-formatter" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={labels.placeholder[lang]}
          className="w-full h-48 border border-gray-300 rounded-xl px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 mb-3"
        />

        <div className="flex gap-2 mb-4">
          <button onClick={format} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{labels.format[lang]}</button>
          <button onClick={minify} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300">{labels.minify[lang]}</button>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg mb-3 text-sm">{error}</div>}

        {output && (
          <div className="relative">
            <button onClick={copy} className="absolute top-2 right-2 px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600">
              {copied ? '✓' : 'Copy'}
            </button>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto text-sm font-mono">{output}</pre>
          </div>
        )}

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
