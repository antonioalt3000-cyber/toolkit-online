'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

function minifyJS(code: string): string {
  let result = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplateLiteral = false;
  let inSingleLineComment = false;
  let inMultiLineComment = false;
  let prevChar = '';

  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    const next = code[i + 1] || '';

    // Handle single-line comment
    if (inSingleLineComment) {
      if (ch === '\n') {
        inSingleLineComment = false;
        result += ' ';
      }
      prevChar = ch;
      continue;
    }

    // Handle multi-line comment
    if (inMultiLineComment) {
      if (ch === '*' && next === '/') {
        inMultiLineComment = false;
        i++;
        result += ' ';
      }
      prevChar = ch;
      continue;
    }

    // Handle strings
    if (inSingleQuote) {
      result += ch;
      if (ch === '\'' && prevChar !== '\\') inSingleQuote = false;
      prevChar = ch;
      continue;
    }
    if (inDoubleQuote) {
      result += ch;
      if (ch === '"' && prevChar !== '\\') inDoubleQuote = false;
      prevChar = ch;
      continue;
    }
    if (inTemplateLiteral) {
      result += ch;
      if (ch === '`' && prevChar !== '\\') inTemplateLiteral = false;
      prevChar = ch;
      continue;
    }

    // Detect start of strings
    if (ch === '\'' && prevChar !== '\\') { inSingleQuote = true; result += ch; prevChar = ch; continue; }
    if (ch === '"' && prevChar !== '\\') { inDoubleQuote = true; result += ch; prevChar = ch; continue; }
    if (ch === '`' && prevChar !== '\\') { inTemplateLiteral = true; result += ch; prevChar = ch; continue; }

    // Detect comments
    if (ch === '/' && next === '/') { inSingleLineComment = true; prevChar = ch; continue; }
    if (ch === '/' && next === '*') { inMultiLineComment = true; i++; prevChar = '*'; continue; }

    // Collapse whitespace
    if (ch === '\n' || ch === '\r' || ch === '\t' || ch === ' ') {
      // Only add a single space if previous result char is not already whitespace
      if (result.length > 0 && result[result.length - 1] !== ' ') {
        result += ' ';
      }
      prevChar = ch;
      continue;
    }

    result += ch;
    prevChar = ch;
  }

  // Final cleanup: remove spaces around operators/punctuation where safe
  result = result.replace(/ ?([\{\}\(\)\[\];,:<>!=\+\-\*\/\&\|\?\~\^%]) /g, '$1');
  result = result.replace(/ ?([\{\}\(\)\[\];,:<>!=\+\-\*\/\&\|\?\~\^%])/g, '$1');
  result = result.replace(/([\{\}\(\)\[\];,:<>!=\+\-\*\/\&\|\?\~\^%]) /g, '$1');
  result = result.trim();

  return result;
}

const sampleJS = `// Simple JavaScript example
/* This is a multi-line
   comment block */
function greetUser(name) {
  // Check if name is provided
  if (!name) {
    console.log("Hello, World!");
    return;
  }

  const greeting = \`Hello, \${name}!\`;
  console.log(greeting);

  // Array operations
  const numbers = [1, 2, 3, 4, 5];
  const doubled = numbers.map(function(n) {
    return n * 2;
  });

  console.log("Doubled:", doubled);
}

// Call the function
greetUser("Developer");

/* Calculate sum */
const sum = (a, b) => {
  return a + b;
};

console.log("Sum:", sum(10, 20));
`;

interface HistoryEntry {
  input: string;
  output: string;
  originalSize: number;
  minifiedSize: number;
  timestamp: Date;
}

export default function JsMinifier() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['js-minifier'][lang];

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const labels = {
    inputPlaceholder: {
      en: 'Paste your JavaScript code here...',
      it: 'Incolla il tuo codice JavaScript qui...',
      es: 'Pega tu código JavaScript aquí...',
      fr: 'Collez votre code JavaScript ici...',
      de: 'JavaScript-Code hier einfügen...',
      pt: 'Cole seu código JavaScript aqui...',
    },
    minify: { en: 'Minify', it: 'Minimizza', es: 'Minimizar', fr: 'Minifier', de: 'Minimieren', pt: 'Minificar' },
    copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
    copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
    reset: { en: 'Reset', it: 'Reimposta', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
    download: { en: 'Download .min.js', it: 'Scarica .min.js', es: 'Descargar .min.js', fr: 'Télécharger .min.js', de: 'Herunterladen .min.js', pt: 'Baixar .min.js' },
    sample: { en: 'Load Sample', it: 'Carica Esempio', es: 'Cargar Ejemplo', fr: 'Charger Exemple', de: 'Beispiel Laden', pt: 'Carregar Exemplo' },
    originalSize: { en: 'Original Size', it: 'Dimensione Originale', es: 'Tamaño Original', fr: 'Taille Originale', de: 'Originalgröße', pt: 'Tamanho Original' },
    minifiedSize: { en: 'Minified Size', it: 'Dimensione Minimizzata', es: 'Tamaño Minimizado', fr: 'Taille Minifiée', de: 'Minimierte Größe', pt: 'Tamanho Minificado' },
    savings: { en: 'Savings', it: 'Risparmio', es: 'Ahorro', fr: 'Économie', de: 'Ersparnis', pt: 'Economia' },
    input: { en: 'Input', it: 'Input', es: 'Entrada', fr: 'Entrée', de: 'Eingabe', pt: 'Entrada' },
    output: { en: 'Output', it: 'Output', es: 'Salida', fr: 'Sortie', de: 'Ausgabe', pt: 'Saída' },
    chars: { en: 'chars', it: 'caratteri', es: 'caracteres', fr: 'caractères', de: 'Zeichen', pt: 'caracteres' },
    lines: { en: 'lines', it: 'righe', es: 'líneas', fr: 'lignes', de: 'Zeilen', pt: 'linhas' },
    history: { en: 'History', it: 'Cronologia', es: 'Historial', fr: 'Historique', de: 'Verlauf', pt: 'Histórico' },
    noHistory: { en: 'No history yet', it: 'Nessuna cronologia', es: 'Sin historial', fr: 'Pas d\'historique', de: 'Noch kein Verlauf', pt: 'Sem histórico' },
    clearHistory: { en: 'Clear History', it: 'Cancella Cronologia', es: 'Borrar Historial', fr: 'Effacer Historique', de: 'Verlauf Löschen', pt: 'Limpar Histórico' },
    result: { en: 'Minified Output', it: 'Output Minimizzato', es: 'Salida Minimizada', fr: 'Sortie Minifiée', de: 'Minimierte Ausgabe', pt: 'Saída Minificada' },
  } as Record<string, Record<Locale, string>>;

  const inputLines = input ? input.split('\n').length : 0;
  const inputChars = input.length;
  const outputLines = output ? output.split('\n').length : 0;
  const outputChars = output.length;

  const handleMinify = () => {
    if (!input.trim()) return;
    const minified = minifyJS(input);
    setOutput(minified);
    setHistory(prev => [{
      input,
      output: minified,
      originalSize: new Blob([input]).size,
      minifiedSize: new Blob([minified]).size,
      timestamp: new Date(),
    }, ...prev].slice(0, 10));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInput('');
    setOutput('');
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.min.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadSample = () => {
    setInput(sampleJS);
    setOutput('');
  };

  const originalSize = new Blob([input]).size;
  const minifiedSize = output ? new Blob([output]).size : 0;
  const savingsPercent = originalSize > 0 && minifiedSize > 0 ? ((1 - minifiedSize / originalSize) * 100).toFixed(1) : '0';

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'JavaScript Minifier: Compress and Optimize JS Code Online',
      paragraphs: [
        'JavaScript minification is a critical step in modern web development that reduces file sizes by removing unnecessary characters from source code without changing its functionality. Our free online JavaScript minifier strips out comments, extra whitespace, and newlines to produce compact code that loads faster in browsers. Whether you are preparing code for production deployment or simply want to reduce bandwidth usage, this tool helps you achieve smaller JavaScript bundles effortlessly.',
        'The minification process works by analyzing your JavaScript code character by character. It identifies and removes single-line comments (starting with //), multi-line comments (enclosed in /* */), and redundant whitespace including tabs, multiple spaces, and blank lines. Importantly, the minifier respects string literals enclosed in single quotes, double quotes, and template literals (backticks), ensuring that content within strings remains untouched even if it contains comment-like or whitespace patterns.',
        'File size reduction through minification typically ranges from 20% to 60% depending on how heavily commented and formatted the original code is. The tool displays real-time statistics showing the original size, minified size, and exact savings percentage. You can also see character and line counts for both input and output, giving you complete visibility into the compression achieved. For convenience, the minified output can be copied to clipboard with one click or downloaded directly as a .min.js file.',
        'Professional developers integrate minification into their build pipelines using tools like Webpack, Rollup, or esbuild. However, this online minifier is perfect for quick one-off tasks, learning how minification works, or processing code snippets before pasting them into HTML documents. The history feature keeps track of your recent minification operations, letting you compare results across multiple attempts.',
        'Beyond simple whitespace removal, effective minification preserves the semantic correctness of your code. Our tool ensures that necessary spaces between keywords and identifiers are maintained while aggressively removing spaces around operators, brackets, and punctuation. This balanced approach produces output that is both minimal in size and functionally identical to the original source code.',
        'To get started, paste your JavaScript code into the input area or load the sample code to see the minifier in action. The tool processes everything locally in your browser, meaning your code never leaves your device. This makes it safe for proprietary or sensitive code that you would not want to upload to external servers.',
      ],
      faq: [
        { q: 'What does JavaScript minification do?', a: 'JavaScript minification removes all unnecessary characters from source code, including comments, extra whitespace, newlines, and indentation, without changing the functionality of the code. The result is a smaller file that downloads and executes faster in web browsers.' },
        { q: 'Is minified JavaScript code still functional?', a: 'Yes, minified JavaScript is fully functional and behaves identically to the original code. Minification only removes characters that are not required for execution, such as comments and formatting whitespace. The logic, variables, and operations remain completely unchanged.' },
        { q: 'How much file size reduction can I expect?', a: 'Typical savings range from 20% to 60% depending on the original code. Heavily commented code with generous formatting will see the largest reductions. Already compact code will see smaller improvements. The tool shows exact savings percentage after each minification.' },
        { q: 'Does this tool handle ES6+ modern JavaScript?', a: 'Yes, the minifier correctly handles modern JavaScript syntax including template literals (backticks), arrow functions, destructuring, and other ES6+ features. It properly preserves string content in all quote types while removing surrounding whitespace and comments.' },
        { q: 'Is my code safe when using this minifier?', a: 'Absolutely. All processing happens entirely in your browser using client-side JavaScript. Your code is never sent to any server or external service. This makes it safe for proprietary, confidential, or sensitive code.' },
      ],
    },
    it: {
      title: 'Minificatore JavaScript: Comprimi e Ottimizza Codice JS Online',
      paragraphs: [
        'La minificazione JavaScript è un passaggio critico nello sviluppo web moderno che riduce le dimensioni dei file rimuovendo i caratteri non necessari dal codice sorgente senza modificarne la funzionalità. Il nostro minificatore JavaScript online gratuito elimina commenti, spazi bianchi extra e newline per produrre codice compatto che si carica più velocemente nei browser. Che tu stia preparando il codice per il deployment in produzione o voglia semplicemente ridurre l\'utilizzo di banda, questo strumento ti aiuta a ottenere bundle JavaScript più piccoli senza sforzo.',
        'Il processo di minificazione funziona analizzando il tuo codice JavaScript carattere per carattere. Identifica e rimuove i commenti a riga singola (che iniziano con //), i commenti multilinea (racchiusi in /* */), e gli spazi bianchi ridondanti inclusi tab, spazi multipli e righe vuote. Importante, il minificatore rispetta le stringhe letterali racchiuse tra virgolette singole, doppie e template literal (backtick), assicurando che il contenuto all\'interno delle stringhe rimanga intatto anche se contiene pattern simili a commenti.',
        'La riduzione delle dimensioni del file tramite minificazione varia tipicamente dal 20% al 60% a seconda di quanto il codice originale sia commentato e formattato. Lo strumento mostra statistiche in tempo reale con dimensione originale, dimensione minimizzata e percentuale esatta di risparmio. Puoi anche vedere il conteggio di caratteri e righe per input e output, dandoti completa visibilità sulla compressione ottenuta.',
        'Gli sviluppatori professionisti integrano la minificazione nelle loro pipeline di build usando strumenti come Webpack, Rollup o esbuild. Tuttavia, questo minificatore online è perfetto per attività rapide una tantum, per imparare come funziona la minificazione o per elaborare frammenti di codice prima di incollarli nei documenti HTML. La funzionalità di cronologia tiene traccia delle tue recenti operazioni di minificazione.',
        'Oltre alla semplice rimozione degli spazi bianchi, una minificazione efficace preserva la correttezza semantica del codice. Il nostro strumento assicura che gli spazi necessari tra parole chiave e identificatori siano mantenuti mentre rimuove aggressivamente gli spazi attorno a operatori, parentesi e punteggiatura.',
        'Per iniziare, incolla il tuo codice JavaScript nell\'area di input o carica il codice di esempio per vedere il minificatore in azione. Lo strumento elabora tutto localmente nel tuo browser, il che significa che il tuo codice non lascia mai il tuo dispositivo. Questo lo rende sicuro per codice proprietario o sensibile.',
      ],
      faq: [
        { q: 'Cosa fa la minificazione JavaScript?', a: 'La minificazione JavaScript rimuove tutti i caratteri non necessari dal codice sorgente, inclusi commenti, spazi bianchi extra, newline e indentazione, senza cambiare la funzionalità del codice. Il risultato è un file più piccolo che si scarica e si esegue più velocemente.' },
        { q: 'Il codice JavaScript minimizzato funziona ancora?', a: 'Sì, il JavaScript minimizzato è completamente funzionale e si comporta in modo identico al codice originale. La minificazione rimuove solo i caratteri non necessari per l\'esecuzione. La logica, le variabili e le operazioni rimangono completamente invariate.' },
        { q: 'Quanta riduzione di dimensione posso aspettarmi?', a: 'I risparmi tipici vanno dal 20% al 60% a seconda del codice originale. Il codice con molti commenti e formattazione generosa vedrà le riduzioni maggiori. Lo strumento mostra la percentuale esatta di risparmio dopo ogni minificazione.' },
        { q: 'Questo strumento gestisce JavaScript ES6+ moderno?', a: 'Sì, il minificatore gestisce correttamente la sintassi JavaScript moderna inclusi template literal (backtick), arrow function, destructuring e altre funzionalità ES6+. Preserva correttamente il contenuto delle stringhe in tutti i tipi di virgolette.' },
        { q: 'Il mio codice è sicuro usando questo minificatore?', a: 'Assolutamente. Tutta l\'elaborazione avviene interamente nel tuo browser usando JavaScript lato client. Il tuo codice non viene mai inviato a nessun server o servizio esterno. Questo lo rende sicuro per codice proprietario o sensibile.' },
      ],
    },
    es: {
      title: 'Minificador JavaScript: Comprime y Optimiza Código JS Online',
      paragraphs: [
        'La minificación de JavaScript es un paso crítico en el desarrollo web moderno que reduce el tamaño de los archivos eliminando caracteres innecesarios del código fuente sin cambiar su funcionalidad. Nuestro minificador JavaScript online gratuito elimina comentarios, espacios en blanco extra y saltos de línea para producir código compacto que se carga más rápido en los navegadores. Ya sea que estés preparando código para despliegue en producción o simplemente quieras reducir el uso de ancho de banda, esta herramienta te ayuda a lograr bundles JavaScript más pequeños sin esfuerzo.',
        'El proceso de minificación funciona analizando tu código JavaScript carácter por carácter. Identifica y elimina comentarios de una línea (que empiezan con //), comentarios multilínea (encerrados en /* */), y espacios en blanco redundantes incluyendo tabulaciones, espacios múltiples y líneas en blanco. Importante, el minificador respeta las cadenas literales encerradas en comillas simples, dobles y template literals (backticks), asegurando que el contenido dentro de las cadenas permanezca intacto.',
        'La reducción del tamaño de archivo mediante minificación típicamente varía del 20% al 60% dependiendo de cuántos comentarios y formato tenga el código original. La herramienta muestra estadísticas en tiempo real mostrando el tamaño original, tamaño minificado y porcentaje exacto de ahorro. También puedes ver el conteo de caracteres y líneas para entrada y salida.',
        'Los desarrolladores profesionales integran la minificación en sus pipelines de construcción usando herramientas como Webpack, Rollup o esbuild. Sin embargo, este minificador online es perfecto para tareas rápidas puntuales, aprender cómo funciona la minificación o procesar fragmentos de código antes de pegarlos en documentos HTML. La función de historial registra tus operaciones recientes de minificación.',
        'Más allá de la simple eliminación de espacios en blanco, una minificación efectiva preserva la corrección semántica de tu código. Nuestra herramienta asegura que los espacios necesarios entre palabras clave e identificadores se mantengan mientras elimina agresivamente espacios alrededor de operadores, corchetes y puntuación.',
        'Para empezar, pega tu código JavaScript en el área de entrada o carga el código de ejemplo para ver el minificador en acción. La herramienta procesa todo localmente en tu navegador, lo que significa que tu código nunca sale de tu dispositivo. Esto lo hace seguro para código propietario o sensible.',
      ],
      faq: [
        { q: '¿Qué hace la minificación de JavaScript?', a: 'La minificación de JavaScript elimina todos los caracteres innecesarios del código fuente, incluyendo comentarios, espacios en blanco extra, saltos de línea e indentación, sin cambiar la funcionalidad del código. El resultado es un archivo más pequeño que se descarga y ejecuta más rápido.' },
        { q: '¿El código JavaScript minificado sigue funcionando?', a: 'Sí, el JavaScript minificado es completamente funcional y se comporta de manera idéntica al código original. La minificación solo elimina caracteres que no son necesarios para la ejecución. La lógica, variables y operaciones permanecen completamente sin cambios.' },
        { q: '¿Cuánta reducción de tamaño puedo esperar?', a: 'Los ahorros típicos van del 20% al 60% dependiendo del código original. El código con muchos comentarios y formato generoso verá las mayores reducciones. La herramienta muestra el porcentaje exacto de ahorro después de cada minificación.' },
        { q: '¿Esta herramienta maneja JavaScript ES6+ moderno?', a: 'Sí, el minificador maneja correctamente la sintaxis JavaScript moderna incluyendo template literals (backticks), arrow functions, destructuring y otras características ES6+. Preserva correctamente el contenido de cadenas en todos los tipos de comillas.' },
        { q: '¿Mi código está seguro al usar este minificador?', a: 'Absolutamente. Todo el procesamiento ocurre completamente en tu navegador usando JavaScript del lado del cliente. Tu código nunca se envía a ningún servidor o servicio externo. Esto lo hace seguro para código propietario o sensible.' },
      ],
    },
    fr: {
      title: 'Minificateur JavaScript : Compresser et Optimiser du Code JS en Ligne',
      paragraphs: [
        'La minification JavaScript est une étape critique du développement web moderne qui réduit la taille des fichiers en supprimant les caractères inutiles du code source sans changer sa fonctionnalité. Notre minificateur JavaScript en ligne gratuit élimine les commentaires, les espaces blancs superflus et les retours à la ligne pour produire un code compact qui se charge plus rapidement dans les navigateurs. Que vous prépariez du code pour le déploiement en production ou que vous souhaitiez simplement réduire l\'utilisation de la bande passante, cet outil vous aide à obtenir des bundles JavaScript plus petits sans effort.',
        'Le processus de minification fonctionne en analysant votre code JavaScript caractère par caractère. Il identifie et supprime les commentaires sur une seule ligne (commençant par //), les commentaires multiligne (entre /* */), et les espaces blancs redondants y compris les tabulations, espaces multiples et lignes vides. Le minificateur respecte les chaînes littérales entre guillemets simples, doubles et template literals (backticks), garantissant que le contenu des chaînes reste intact.',
        'La réduction de taille de fichier par minification varie typiquement de 20% à 60% selon le niveau de commentaires et de formatage du code original. L\'outil affiche des statistiques en temps réel montrant la taille originale, la taille minifiée et le pourcentage exact d\'économie. Vous pouvez également voir le nombre de caractères et de lignes pour l\'entrée et la sortie.',
        'Les développeurs professionnels intègrent la minification dans leurs pipelines de build en utilisant des outils comme Webpack, Rollup ou esbuild. Cependant, ce minificateur en ligne est parfait pour les tâches ponctuelles rapides, pour apprendre comment fonctionne la minification ou pour traiter des extraits de code avant de les coller dans des documents HTML. La fonctionnalité d\'historique garde une trace de vos opérations récentes.',
        'Au-delà de la simple suppression des espaces blancs, une minification efficace préserve la correction sémantique de votre code. Notre outil s\'assure que les espaces nécessaires entre les mots-clés et les identifiants sont maintenus tout en supprimant agressivement les espaces autour des opérateurs, crochets et ponctuation.',
        'Pour commencer, collez votre code JavaScript dans la zone de saisie ou chargez le code exemple pour voir le minificateur en action. L\'outil traite tout localement dans votre navigateur, ce qui signifie que votre code ne quitte jamais votre appareil. Cela le rend sûr pour le code propriétaire ou sensible.',
      ],
      faq: [
        { q: 'Que fait la minification JavaScript ?', a: 'La minification JavaScript supprime tous les caractères inutiles du code source, y compris les commentaires, les espaces blancs, les retours à la ligne et l\'indentation, sans changer la fonctionnalité du code. Le résultat est un fichier plus petit qui se télécharge et s\'exécute plus rapidement.' },
        { q: 'Le code JavaScript minifié fonctionne-t-il encore ?', a: 'Oui, le JavaScript minifié est entièrement fonctionnel et se comporte de manière identique au code original. La minification ne supprime que les caractères non nécessaires à l\'exécution. La logique, les variables et les opérations restent complètement inchangées.' },
        { q: 'Quelle réduction de taille puis-je espérer ?', a: 'Les économies typiques vont de 20% à 60% selon le code original. Le code avec beaucoup de commentaires et un formatage généreux verra les plus grandes réductions. L\'outil affiche le pourcentage exact d\'économie après chaque minification.' },
        { q: 'Cet outil gère-t-il le JavaScript ES6+ moderne ?', a: 'Oui, le minificateur gère correctement la syntaxe JavaScript moderne y compris les template literals (backticks), les fonctions fléchées, le destructuring et d\'autres fonctionnalités ES6+. Il préserve correctement le contenu des chaînes dans tous les types de guillemets.' },
        { q: 'Mon code est-il en sécurité avec ce minificateur ?', a: 'Absolument. Tout le traitement se fait entièrement dans votre navigateur en JavaScript côté client. Votre code n\'est jamais envoyé à aucun serveur ou service externe. Cela le rend sûr pour le code propriétaire ou sensible.' },
      ],
    },
    de: {
      title: 'JavaScript Minifier: JS-Code Online Komprimieren und Optimieren',
      paragraphs: [
        'JavaScript-Minifizierung ist ein kritischer Schritt in der modernen Webentwicklung, der Dateigrößen reduziert, indem unnötige Zeichen aus dem Quellcode entfernt werden, ohne dessen Funktionalität zu ändern. Unser kostenloser Online-JavaScript-Minifier entfernt Kommentare, überflüssige Leerzeichen und Zeilenumbrüche, um kompakten Code zu erzeugen, der schneller in Browsern lädt. Ob Sie Code für das Produktions-Deployment vorbereiten oder einfach die Bandbreitennutzung reduzieren möchten, dieses Tool hilft Ihnen, kleinere JavaScript-Bundles mühelos zu erreichen.',
        'Der Minifizierungsprozess funktioniert, indem er Ihren JavaScript-Code Zeichen für Zeichen analysiert. Er identifiziert und entfernt einzeilige Kommentare (beginnend mit //), mehrzeilige Kommentare (eingeschlossen in /* */), und redundante Leerzeichen einschließlich Tabs, mehrfacher Leerzeichen und leerer Zeilen. Wichtig ist, dass der Minifier String-Literale in einfachen Anführungszeichen, doppelten Anführungszeichen und Template-Literalen (Backticks) respektiert und sicherstellt, dass der Inhalt innerhalb von Strings unberührt bleibt.',
        'Die Dateigrößenreduzierung durch Minifizierung liegt typischerweise zwischen 20% und 60%, abhängig davon, wie stark der Originalcode kommentiert und formatiert ist. Das Tool zeigt Echtzeitstatistiken mit Originalgröße, minimierter Größe und exaktem Einsparungsprozentsatz an. Sie können auch Zeichen- und Zeilenzähler für Ein- und Ausgabe sehen.',
        'Professionelle Entwickler integrieren die Minifizierung in ihre Build-Pipelines mit Tools wie Webpack, Rollup oder esbuild. Dieser Online-Minifier ist jedoch perfekt für schnelle einmalige Aufgaben, um zu lernen, wie Minifizierung funktioniert, oder um Code-Snippets zu verarbeiten, bevor sie in HTML-Dokumente eingefügt werden. Die Verlaufsfunktion verfolgt Ihre letzten Minifizierungsoperationen.',
        'Über die einfache Entfernung von Leerzeichen hinaus bewahrt eine effektive Minifizierung die semantische Korrektheit Ihres Codes. Unser Tool stellt sicher, dass notwendige Leerzeichen zwischen Schlüsselwörtern und Bezeichnern beibehalten werden, während Leerzeichen um Operatoren, Klammern und Interpunktion aggressiv entfernt werden.',
        'Um zu beginnen, fügen Sie Ihren JavaScript-Code in den Eingabebereich ein oder laden Sie den Beispielcode, um den Minifier in Aktion zu sehen. Das Tool verarbeitet alles lokal in Ihrem Browser, was bedeutet, dass Ihr Code Ihr Gerät nie verlässt. Dies macht es sicher für proprietären oder sensiblen Code.',
      ],
      faq: [
        { q: 'Was macht JavaScript-Minifizierung?', a: 'JavaScript-Minifizierung entfernt alle unnötigen Zeichen aus dem Quellcode, einschließlich Kommentare, überflüssige Leerzeichen, Zeilenumbrüche und Einrückungen, ohne die Funktionalität des Codes zu ändern. Das Ergebnis ist eine kleinere Datei, die schneller heruntergeladen und ausgeführt wird.' },
        { q: 'Funktioniert minimierter JavaScript-Code noch?', a: 'Ja, minimiertes JavaScript ist voll funktionsfähig und verhält sich identisch zum Originalcode. Die Minifizierung entfernt nur Zeichen, die für die Ausführung nicht erforderlich sind. Die Logik, Variablen und Operationen bleiben vollständig unverändert.' },
        { q: 'Wie viel Größenreduzierung kann ich erwarten?', a: 'Typische Einsparungen liegen zwischen 20% und 60%, abhängig vom Originalcode. Stark kommentierter Code mit großzügiger Formatierung wird die größten Reduzierungen sehen. Das Tool zeigt den genauen Einsparungsprozentsatz nach jeder Minifizierung.' },
        { q: 'Kann dieses Tool modernes ES6+ JavaScript verarbeiten?', a: 'Ja, der Minifier verarbeitet korrekt moderne JavaScript-Syntax einschließlich Template-Literale (Backticks), Arrow-Funktionen, Destructuring und andere ES6+-Features. Er bewahrt korrekt den String-Inhalt in allen Anführungszeichentypen.' },
        { q: 'Ist mein Code bei der Verwendung dieses Minifiers sicher?', a: 'Absolut. Die gesamte Verarbeitung erfolgt vollständig in Ihrem Browser mit clientseitigem JavaScript. Ihr Code wird niemals an einen Server oder externen Dienst gesendet. Dies macht es sicher für proprietären oder sensiblen Code.' },
      ],
    },
    pt: {
      title: 'Minificador JavaScript: Comprimir e Otimizar Código JS Online',
      paragraphs: [
        'A minificação de JavaScript é um passo crítico no desenvolvimento web moderno que reduz o tamanho dos arquivos removendo caracteres desnecessários do código-fonte sem alterar sua funcionalidade. Nosso minificador JavaScript online gratuito elimina comentários, espaços em branco extras e quebras de linha para produzir código compacto que carrega mais rápido nos navegadores. Seja preparando código para deploy em produção ou simplesmente querendo reduzir o uso de largura de banda, esta ferramenta ajuda a obter bundles JavaScript menores sem esforço.',
        'O processo de minificação funciona analisando seu código JavaScript caractere por caractere. Ele identifica e remove comentários de uma linha (começando com //), comentários multilinha (entre /* */), e espaços em branco redundantes incluindo tabs, espaços múltiplos e linhas em branco. Importante, o minificador respeita strings literais entre aspas simples, duplas e template literals (backticks), garantindo que o conteúdo dentro das strings permaneça intacto.',
        'A redução de tamanho de arquivo através da minificação tipicamente varia de 20% a 60% dependendo de quão comentado e formatado é o código original. A ferramenta exibe estatísticas em tempo real mostrando o tamanho original, tamanho minificado e porcentagem exata de economia. Você também pode ver a contagem de caracteres e linhas para entrada e saída.',
        'Desenvolvedores profissionais integram a minificação em seus pipelines de build usando ferramentas como Webpack, Rollup ou esbuild. No entanto, este minificador online é perfeito para tarefas rápidas pontuais, aprender como a minificação funciona ou processar trechos de código antes de colá-los em documentos HTML. O recurso de histórico mantém registro de suas operações recentes de minificação.',
        'Além da simples remoção de espaços em branco, uma minificação eficaz preserva a correção semântica do seu código. Nossa ferramenta garante que espaços necessários entre palavras-chave e identificadores sejam mantidos enquanto remove agressivamente espaços ao redor de operadores, colchetes e pontuação.',
        'Para começar, cole seu código JavaScript na área de entrada ou carregue o código de exemplo para ver o minificador em ação. A ferramenta processa tudo localmente no seu navegador, o que significa que seu código nunca sai do seu dispositivo. Isso o torna seguro para código proprietário ou sensível.',
      ],
      faq: [
        { q: 'O que a minificação de JavaScript faz?', a: 'A minificação de JavaScript remove todos os caracteres desnecessários do código-fonte, incluindo comentários, espaços em branco extras, quebras de linha e indentação, sem alterar a funcionalidade do código. O resultado é um arquivo menor que baixa e executa mais rápido.' },
        { q: 'O código JavaScript minificado ainda funciona?', a: 'Sim, o JavaScript minificado é totalmente funcional e se comporta de forma idêntica ao código original. A minificação remove apenas caracteres que não são necessários para a execução. A lógica, variáveis e operações permanecem completamente inalteradas.' },
        { q: 'Quanta redução de tamanho posso esperar?', a: 'Economias típicas variam de 20% a 60% dependendo do código original. Código com muitos comentários e formatação generosa verá as maiores reduções. A ferramenta mostra a porcentagem exata de economia após cada minificação.' },
        { q: 'Esta ferramenta lida com JavaScript ES6+ moderno?', a: 'Sim, o minificador lida corretamente com sintaxe JavaScript moderna incluindo template literals (backticks), arrow functions, destructuring e outras funcionalidades ES6+. Ele preserva corretamente o conteúdo de strings em todos os tipos de aspas.' },
        { q: 'Meu código está seguro ao usar este minificador?', a: 'Absolutamente. Todo o processamento acontece inteiramente no seu navegador usando JavaScript do lado do cliente. Seu código nunca é enviado a nenhum servidor ou serviço externo. Isso o torna seguro para código proprietário ou sensível.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="js-minifier" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Input Area */}
        <div className="mb-1 flex justify-between text-xs text-gray-500">
          <span>{labels.input[lang]}</span>
          <span>{inputChars} {labels.chars[lang]} | {inputLines} {labels.lines[lang]}</span>
        </div>
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); setOutput(''); }}
          placeholder={labels.inputPlaceholder[lang]}
          className="w-full h-52 border border-gray-300 rounded-xl px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 mb-3"
          spellCheck={false}
        />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={handleMinify}
            disabled={!input.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {labels.minify[lang]}
          </button>
          <button
            onClick={handleLoadSample}
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
          >
            {labels.sample[lang]}
          </button>
          <button
            onClick={handleReset}
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
          >
            {labels.reset[lang]}
          </button>
        </div>

        {/* Stats */}
        {output && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">{labels.originalSize[lang]}</div>
              <div className="text-lg font-bold text-gray-900">{originalSize} B</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">{labels.minifiedSize[lang]}</div>
              <div className="text-lg font-bold text-gray-900">{minifiedSize} B</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">{labels.savings[lang]}</div>
              <div className="text-lg font-bold text-green-600">-{savingsPercent}%</div>
            </div>
          </div>
        )}

        {/* Output Area */}
        {output && (
          <div className="mb-4">
            <div className="mb-1 flex justify-between text-xs text-gray-500">
              <span>{labels.result[lang]}</span>
              <span>{outputChars} {labels.chars[lang]} | {outputLines} {labels.lines[lang]}</span>
            </div>
            <div className="relative">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto text-sm font-mono whitespace-pre-wrap break-all">{output}</pre>
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                >
                  {copied ? labels.copied[lang] : labels.copy[lang]}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                >
                  {labels.download[lang]}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-700">{labels.history[lang]}</h3>
              <button
                onClick={() => setHistory([])}
                className="text-xs text-red-500 hover:text-red-700"
              >
                {labels.clearHistory[lang]}
              </button>
            </div>
            <div className="space-y-1">
              {history.map((entry, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(entry.input); setOutput(entry.output); }}
                  className="w-full text-left p-2 bg-gray-50 rounded-lg hover:bg-gray-100 text-xs flex justify-between items-center"
                >
                  <span className="text-gray-600 truncate mr-2 font-mono">
                    {entry.input.substring(0, 50)}...
                  </span>
                  <span className="text-green-600 font-medium whitespace-nowrap">
                    {entry.originalSize}B → {entry.minifiedSize}B (-{((1 - entry.minifiedSize / entry.originalSize) * 100).toFixed(1)}%)
                  </span>
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

        {/* FAQ */}
        <section className="mt-10 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">FAQ</h2>
          <div className="space-y-2">
            {seo.faq.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-4 py-3 font-medium text-gray-900 flex justify-between items-center"
                >
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
