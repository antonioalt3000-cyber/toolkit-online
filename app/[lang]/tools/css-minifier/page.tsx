'use client';
import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, common, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface HistoryEntry {
  input: string;
  output: string;
  mode: 'minify' | 'beautify';
  savedPercent: number;
  timestamp: number;
}

const SAMPLE_CSS = `/* Main layout styles */
body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
  color: #333333;
}

/* Header component */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

/* Navigation */
.nav {
  display: flex;
  gap: 12px;
}

.nav a {
  text-decoration: none;
  color: rgba(255, 255, 255, 0.85);
  padding: 8px 16px;
  border-radius: 6px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.nav a:hover {
  background-color: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

/* Card grid */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Button styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #4f46e5;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #4338ca;
}

/* Responsive */
@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .header {
    flex-direction: column;
    gap: 12px;
  }
}`;

function minifyCSS(css: string): string {
  let result = css;
  // Remove /* */ comments
  result = result.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove newlines and carriage returns
  result = result.replace(/[\r\n]+/g, '');
  // Collapse multiple spaces into one
  result = result.replace(/\s{2,}/g, ' ');
  // Remove spaces around { } : ; ,
  result = result.replace(/\s*\{\s*/g, '{');
  result = result.replace(/\s*\}\s*/g, '}');
  result = result.replace(/\s*:\s*/g, ':');
  result = result.replace(/\s*;\s*/g, ';');
  result = result.replace(/\s*,\s*/g, ',');
  // Remove last semicolon before }
  result = result.replace(/;}/g, '}');
  // Remove leading/trailing whitespace
  result = result.trim();
  return result;
}

function beautifyCSS(css: string): string {
  // First minify to normalize
  let result = minifyCSS(css);
  // Add newline after {
  result = result.replace(/\{/g, ' {\n');
  // Add newline and closing indentation before }
  result = result.replace(/\}/g, '\n}\n');
  // Add newline after each ;
  result = result.replace(/;/g, ';\n');
  // Now indent: lines between { and } get 2-space indent
  const lines = result.split('\n');
  const formatted: string[] = [];
  let indent = 0;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line === '}') {
      indent = Math.max(0, indent - 1);
    }
    formatted.push('  '.repeat(indent) + line);
    if (line.endsWith('{')) {
      indent += 1;
    }
  }
  // Add blank line between rule blocks for readability
  const final: string[] = [];
  for (let i = 0; i < formatted.length; i++) {
    final.push(formatted[i]);
    if (formatted[i].trim() === '}' && i < formatted.length - 1 && formatted[i + 1]?.trim() !== '}') {
      final.push('');
    }
  }
  return final.join('\n');
}

export default function CSSMinifier() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['css-minifier'][lang];

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [lastMode, setLastMode] = useState<'minify' | 'beautify' | null>(null);

  const labels = {
    minify: { en: 'Minify CSS', it: 'Minimizza CSS', es: 'Minimizar CSS', fr: 'Minifier CSS', de: 'CSS Minimieren', pt: 'Minificar CSS' },
    beautify: { en: 'Beautify CSS', it: 'Formatta CSS', es: 'Embellecer CSS', fr: 'Embellir CSS', de: 'CSS Verschoenern', pt: 'Embelezar CSS' },
    placeholder: { en: 'Paste your CSS code here...', it: 'Incolla il tuo codice CSS qui...', es: 'Pega tu codigo CSS aqui...', fr: 'Collez votre code CSS ici...', de: 'CSS-Code hier einfuegen...', pt: 'Cole seu codigo CSS aqui...' },
    copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
    copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copie!', de: 'Kopiert!', pt: 'Copiado!' },
    download: { en: 'Download CSS', it: 'Scarica CSS', es: 'Descargar CSS', fr: 'Telecharger CSS', de: 'CSS Herunterladen', pt: 'Baixar CSS' },
    reset: { en: 'Reset', it: 'Reimposta', es: 'Restablecer', fr: 'Reinitialiser', de: 'Zuruecksetzen', pt: 'Redefinir' },
    sample: { en: 'Load Sample', it: 'Carica Esempio', es: 'Cargar Ejemplo', fr: 'Charger Exemple', de: 'Beispiel Laden', pt: 'Carregar Exemplo' },
    history: { en: 'History', it: 'Cronologia', es: 'Historial', fr: 'Historique', de: 'Verlauf', pt: 'Historico' },
    clearHistory: { en: 'Clear History', it: 'Cancella Cronologia', es: 'Borrar Historial', fr: 'Effacer Historique', de: 'Verlauf Loeschen', pt: 'Limpar Historico' },
    originalSize: { en: 'Original Size', it: 'Dimensione Originale', es: 'Tamano Original', fr: 'Taille Originale', de: 'Originalgroesse', pt: 'Tamanho Original' },
    outputSize: { en: 'Output Size', it: 'Dimensione Output', es: 'Tamano de Salida', fr: 'Taille de Sortie', de: 'Ausgabegroesse', pt: 'Tamanho de Saida' },
    savings: { en: 'Savings', it: 'Risparmio', es: 'Ahorro', fr: 'Economie', de: 'Ersparnis', pt: 'Economia' },
    noHistory: { en: 'No history yet', it: 'Nessuna cronologia', es: 'Sin historial', fr: 'Aucun historique', de: 'Noch kein Verlauf', pt: 'Sem historico' },
    output: { en: 'Output', it: 'Output', es: 'Resultado', fr: 'Resultat', de: 'Ausgabe', pt: 'Resultado' },
    bytes: { en: 'bytes', it: 'byte', es: 'bytes', fr: 'octets', de: 'Bytes', pt: 'bytes' },
  } as Record<string, Record<Locale, string>>;

  const origSize = new TextEncoder().encode(input).length;
  const outSize = new TextEncoder().encode(output).length;
  const savedPercent = origSize > 0 && output ? Math.round(((origSize - outSize) / origSize) * 100) : 0;

  const handleMinify = useCallback(() => {
    if (!input.trim()) return;
    const result = minifyCSS(input);
    setOutput(result);
    setLastMode('minify');
    const oSize = new TextEncoder().encode(input).length;
    const rSize = new TextEncoder().encode(result).length;
    const pct = oSize > 0 ? Math.round(((oSize - rSize) / oSize) * 100) : 0;
    setHistory(prev => [{ input: input.slice(0, 80), output: result.slice(0, 80), mode: 'minify' as const, savedPercent: pct, timestamp: Date.now() }, ...prev].slice(0, 20));
  }, [input]);

  const handleBeautify = useCallback(() => {
    if (!input.trim()) return;
    const result = beautifyCSS(input);
    setOutput(result);
    setLastMode('beautify');
    const oSize = new TextEncoder().encode(input).length;
    const rSize = new TextEncoder().encode(result).length;
    const pct = oSize > 0 ? Math.round(((oSize - rSize) / oSize) * 100) : 0;
    setHistory(prev => [{ input: input.slice(0, 80), output: result.slice(0, 80), mode: 'beautify' as const, savedPercent: pct, timestamp: Date.now() }, ...prev].slice(0, 20));
  }, [input]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = lastMode === 'minify' ? 'style.min.css' : 'style.formatted.css';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setInput('');
    setOutput('');
    setLastMode(null);
  };

  const handleSample = () => {
    setInput(SAMPLE_CSS);
    setOutput('');
    setLastMode(null);
  };

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'CSS Minifier & Beautifier: Optimize Your Stylesheets Online',
      paragraphs: [
        'CSS minification is a critical step in web performance optimization. Every kilobyte saved in your stylesheets translates to faster page load times, better Core Web Vitals scores, and improved user experience. Our free CSS Minifier tool removes all unnecessary characters from your CSS code without changing its functionality, including comments, whitespace, newlines, and redundant semicolons.',
        'The minification process works by applying a series of transformations to your CSS source code. First, all block comments enclosed in /* and */ are stripped away. Then, multiple whitespace characters are collapsed into single spaces. Spaces around selectors, properties, values, and punctuation marks such as colons, semicolons, commas, and curly braces are removed. Finally, trailing semicolons before closing braces are eliminated, as they are not required by the CSS specification.',
        'Beyond minification, this tool also offers a beautify or format mode. If you receive minified CSS and need to read or edit it, the beautifier will restore proper indentation, add line breaks after each declaration, and separate rule blocks with blank lines. This makes previously unreadable compressed stylesheets easy to understand and modify, which is invaluable during debugging or code review sessions.',
        'The tool displays real-time statistics showing the original file size, the output size after processing, and the percentage of savings achieved. For typical stylesheets with comments and generous formatting, minification can reduce file sizes by 20 to 40 percent or more. These savings compound across multiple CSS files and repeated page loads, making a meaningful impact on overall site performance.',
        'Professional web developers integrate CSS minification into their build pipelines, but having an instant online tool is invaluable for quick checks, one-off optimizations, or when working with third-party stylesheets. You can paste any CSS code, click Minify, and immediately copy or download the optimized result. The history feature keeps track of your recent operations for easy reference.',
        'Whether you are preparing stylesheets for production deployment, analyzing the compression potential of your CSS codebase, or simply formatting messy CSS from an external source, this tool handles it all directly in your browser with no server-side processing. Your code never leaves your machine, ensuring complete privacy and security for proprietary stylesheets.',
      ],
      faq: [
        { q: 'What does CSS minification actually remove?', a: 'CSS minification removes block comments (/* */), extra whitespace and newlines, spaces around punctuation characters like colons, semicolons, commas and curly braces, and trailing semicolons before closing braces. The resulting CSS is functionally identical to the original but significantly smaller in file size.' },
        { q: 'Will minifying CSS break my styles?', a: 'No. CSS minification only removes characters that have no effect on how browsers interpret and apply your styles. The visual rendering of your web pages will remain exactly the same. However, minified CSS is harder for humans to read, so always keep an unminified copy for development.' },
        { q: 'What is the difference between minify and beautify?', a: 'Minify compresses CSS by removing all unnecessary whitespace, comments, and characters to produce the smallest possible output. Beautify does the opposite: it takes compressed or messy CSS and adds proper indentation, line breaks, and spacing to make it human-readable and easy to edit.' },
        { q: 'How much file size reduction can I expect?', a: 'Typical savings range from 15 to 40 percent depending on how the original CSS is formatted. Stylesheets with extensive comments, generous indentation, and blank lines will see the largest reductions. Already compact CSS will have smaller gains.' },
        { q: 'Is my CSS code sent to a server for processing?', a: 'No. All minification and beautification happens entirely in your browser using JavaScript. Your CSS code never leaves your device, making this tool completely safe for proprietary or sensitive stylesheets.' },
      ],
    },
    it: {
      title: 'CSS Minifier e Formattatore: Ottimizza i Tuoi Fogli di Stile Online',
      paragraphs: [
        'La minificazione CSS e un passaggio fondamentale nell\'ottimizzazione delle prestazioni web. Ogni kilobyte risparmiato nei fogli di stile si traduce in tempi di caricamento piu rapidi, punteggi Core Web Vitals migliori e un\'esperienza utente superiore. Il nostro strumento CSS Minifier gratuito rimuove tutti i caratteri non necessari dal codice CSS senza modificarne la funzionalita, inclusi commenti, spazi bianchi, newline e punti e virgola ridondanti.',
        'Il processo di minificazione funziona applicando una serie di trasformazioni al codice sorgente CSS. Prima, tutti i commenti a blocco racchiusi tra /* e */ vengono eliminati. Poi, i caratteri di spaziatura multipli vengono compressi in singoli spazi. Gli spazi attorno a selettori, proprieta, valori e segni di punteggiatura come due punti, punti e virgola, virgole e parentesi graffe vengono rimossi. Infine, i punti e virgola finali prima delle parentesi di chiusura vengono eliminati.',
        'Oltre alla minificazione, questo strumento offre anche una modalita di formattazione. Se ricevi CSS minificato e hai bisogno di leggerlo o modificarlo, il formattatore ripristinera la corretta indentazione, aggiungera interruzioni di riga dopo ogni dichiarazione e separera i blocchi di regole con righe vuote. Questo rende i fogli di stile compressi facilmente comprensibili e modificabili.',
        'Lo strumento mostra statistiche in tempo reale con la dimensione del file originale, la dimensione dell\'output dopo l\'elaborazione e la percentuale di risparmio ottenuta. Per i fogli di stile tipici con commenti e formattazione generosa, la minificazione puo ridurre le dimensioni dei file dal 20 al 40 percento o piu.',
        'Gli sviluppatori web professionisti integrano la minificazione CSS nelle loro pipeline di build, ma avere uno strumento online istantaneo e prezioso per controlli rapidi, ottimizzazioni occasionali o quando si lavora con fogli di stile di terze parti. Puoi incollare qualsiasi codice CSS, cliccare Minimizza e copiare o scaricare immediatamente il risultato ottimizzato.',
        'Che tu stia preparando fogli di stile per il deployment in produzione, analizzando il potenziale di compressione del tuo codice CSS o semplicemente formattando CSS disordinato da una fonte esterna, questo strumento gestisce tutto direttamente nel tuo browser senza elaborazione lato server. Il tuo codice non lascia mai la tua macchina.',
      ],
      faq: [
        { q: 'Cosa rimuove esattamente la minificazione CSS?', a: 'La minificazione CSS rimuove i commenti a blocco (/* */), spazi bianchi e newline extra, spazi attorno a caratteri di punteggiatura come due punti, punti e virgola, virgole e parentesi graffe, e i punti e virgola finali prima delle parentesi di chiusura. Il CSS risultante e funzionalmente identico all\'originale ma significativamente piu piccolo.' },
        { q: 'La minificazione del CSS rompe i miei stili?', a: 'No. La minificazione CSS rimuove solo caratteri che non influenzano il modo in cui i browser interpretano e applicano i tuoi stili. Il rendering visivo delle tue pagine web restera esattamente lo stesso. Tuttavia, il CSS minificato e piu difficile da leggere, quindi conserva sempre una copia non minificata per lo sviluppo.' },
        { q: 'Qual e la differenza tra minimizzare e formattare?', a: 'Minimizzare comprime il CSS rimuovendo tutti gli spazi, commenti e caratteri non necessari per produrre l\'output piu piccolo possibile. Formattare fa l\'opposto: prende CSS compresso o disordinato e aggiunge indentazione, interruzioni di riga e spaziatura corrette.' },
        { q: 'Quanta riduzione delle dimensioni posso aspettarmi?', a: 'I risparmi tipici vanno dal 15 al 40 percento a seconda della formattazione del CSS originale. I fogli di stile con commenti estesi e indentazione generosa vedranno le riduzioni maggiori.' },
        { q: 'Il mio codice CSS viene inviato a un server?', a: 'No. Tutta la minificazione e formattazione avviene interamente nel tuo browser tramite JavaScript. Il tuo codice CSS non lascia mai il tuo dispositivo, rendendo questo strumento completamente sicuro per fogli di stile proprietari o sensibili.' },
      ],
    },
    es: {
      title: 'Minificador y Embellecedor CSS: Optimiza tus Hojas de Estilo Online',
      paragraphs: [
        'La minificacion CSS es un paso critico en la optimizacion del rendimiento web. Cada kilobyte ahorrado en tus hojas de estilo se traduce en tiempos de carga mas rapidos, mejores puntuaciones de Core Web Vitals y una experiencia de usuario mejorada. Nuestro minificador CSS gratuito elimina todos los caracteres innecesarios de tu codigo CSS sin cambiar su funcionalidad, incluyendo comentarios, espacios en blanco, saltos de linea y puntos y coma redundantes.',
        'El proceso de minificacion funciona aplicando una serie de transformaciones a tu codigo fuente CSS. Primero, todos los comentarios de bloque encerrados entre /* y */ se eliminan. Luego, los caracteres de espacio multiples se colapsan en espacios simples. Los espacios alrededor de selectores, propiedades, valores y signos de puntuacion como dos puntos, puntos y coma, comas y llaves se eliminan. Finalmente, los puntos y coma finales antes de las llaves de cierre se eliminan.',
        'Ademas de la minificacion, esta herramienta tambien ofrece un modo de embellecimiento o formato. Si recibes CSS minificado y necesitas leerlo o editarlo, el embellecedor restaurara la indentacion adecuada, agregara saltos de linea despues de cada declaracion y separara los bloques de reglas con lineas en blanco.',
        'La herramienta muestra estadisticas en tiempo real que muestran el tamano del archivo original, el tamano de salida despues del procesamiento y el porcentaje de ahorro logrado. Para hojas de estilo tipicas con comentarios y formato generoso, la minificacion puede reducir el tamano de los archivos entre un 20 y un 40 por ciento o mas.',
        'Los desarrolladores web profesionales integran la minificacion CSS en sus pipelines de compilacion, pero tener una herramienta en linea instantanea es invaluable para verificaciones rapidas, optimizaciones puntuales o cuando se trabaja con hojas de estilo de terceros. Puedes pegar cualquier codigo CSS, hacer clic en Minimizar y copiar o descargar inmediatamente el resultado.',
        'Ya sea que estes preparando hojas de estilo para despliegue en produccion, analizando el potencial de compresion de tu codigo CSS o simplemente formateando CSS desordenado de una fuente externa, esta herramienta lo maneja todo directamente en tu navegador sin procesamiento del lado del servidor. Tu codigo nunca sale de tu maquina.',
      ],
      faq: [
        { q: 'Que elimina exactamente la minificacion CSS?', a: 'La minificacion CSS elimina comentarios de bloque (/* */), espacios en blanco y saltos de linea extra, espacios alrededor de caracteres de puntuacion como dos puntos, puntos y coma, comas y llaves, y puntos y coma finales antes de llaves de cierre. El CSS resultante es funcionalmente identico al original pero significativamente mas pequeno.' },
        { q: 'La minificacion del CSS rompera mis estilos?', a: 'No. La minificacion CSS solo elimina caracteres que no afectan como los navegadores interpretan y aplican tus estilos. La representacion visual de tus paginas web permanecera exactamente igual. Sin embargo, el CSS minificado es mas dificil de leer, asi que siempre conserva una copia sin minificar para desarrollo.' },
        { q: 'Cual es la diferencia entre minimizar y embellecer?', a: 'Minimizar comprime el CSS eliminando todos los espacios, comentarios y caracteres innecesarios para producir la salida mas pequena posible. Embellecer hace lo opuesto: toma CSS comprimido o desordenado y agrega indentacion, saltos de linea y espaciado adecuados.' },
        { q: 'Cuanta reduccion de tamano puedo esperar?', a: 'Los ahorros tipicos van del 15 al 40 por ciento dependiendo del formato del CSS original. Las hojas de estilo con comentarios extensos e indentacion generosa veran las mayores reducciones.' },
        { q: 'Mi codigo CSS se envia a un servidor?', a: 'No. Toda la minificacion y embellecimiento ocurre completamente en tu navegador usando JavaScript. Tu codigo CSS nunca sale de tu dispositivo, haciendo esta herramienta completamente segura para hojas de estilo propietarias o sensibles.' },
      ],
    },
    fr: {
      title: 'Minificateur et Embellisseur CSS : Optimisez vos Feuilles de Style en Ligne',
      paragraphs: [
        'La minification CSS est une etape critique dans l\'optimisation des performances web. Chaque kilooctet economise dans vos feuilles de style se traduit par des temps de chargement plus rapides, de meilleurs scores Core Web Vitals et une experience utilisateur amelioree. Notre outil gratuit CSS Minifier supprime tous les caracteres inutiles de votre code CSS sans modifier sa fonctionnalite, y compris les commentaires, les espaces, les sauts de ligne et les points-virgules redondants.',
        'Le processus de minification fonctionne en appliquant une serie de transformations a votre code source CSS. D\'abord, tous les commentaires de bloc entre /* et */ sont supprimes. Ensuite, les caracteres d\'espacement multiples sont reduits en espaces simples. Les espaces autour des selecteurs, proprietes, valeurs et signes de ponctuation comme les deux-points, points-virgules, virgules et accolades sont supprimes. Enfin, les points-virgules finaux avant les accolades fermantes sont elimines.',
        'Au-dela de la minification, cet outil offre egalement un mode d\'embellissement ou de formatage. Si vous recevez du CSS minifie et devez le lire ou le modifier, l\'embellisseur restaurera l\'indentation correcte, ajoutera des sauts de ligne apres chaque declaration et separera les blocs de regles avec des lignes vides.',
        'L\'outil affiche des statistiques en temps reel montrant la taille du fichier original, la taille de sortie apres traitement et le pourcentage d\'economie realise. Pour les feuilles de style typiques avec des commentaires et un formatage genereux, la minification peut reduire la taille des fichiers de 20 a 40 pour cent ou plus.',
        'Les developpeurs web professionnels integrent la minification CSS dans leurs pipelines de build, mais avoir un outil en ligne instantane est precieux pour les verifications rapides, les optimisations ponctuelles ou le travail avec des feuilles de style tierces. Vous pouvez coller n\'importe quel code CSS, cliquer sur Minifier et copier ou telecharger immediatement le resultat.',
        'Que vous prepariez des feuilles de style pour le deploiement en production, analysiez le potentiel de compression de votre code CSS ou formatiez simplement du CSS desordonne d\'une source externe, cet outil gere tout directement dans votre navigateur sans traitement cote serveur. Votre code ne quitte jamais votre machine.',
      ],
      faq: [
        { q: 'Que supprime exactement la minification CSS ?', a: 'La minification CSS supprime les commentaires de bloc (/* */), les espaces et sauts de ligne supplementaires, les espaces autour des caracteres de ponctuation comme les deux-points, points-virgules, virgules et accolades, et les points-virgules finaux avant les accolades fermantes. Le CSS resultant est fonctionnellement identique a l\'original mais nettement plus petit.' },
        { q: 'La minification CSS va-t-elle casser mes styles ?', a: 'Non. La minification CSS ne supprime que les caracteres qui n\'affectent pas la facon dont les navigateurs interpretent et appliquent vos styles. Le rendu visuel de vos pages web restera exactement le meme. Cependant, le CSS minifie est plus difficile a lire, gardez donc toujours une copie non minifiee pour le developpement.' },
        { q: 'Quelle est la difference entre minifier et embellir ?', a: 'Minifier compresse le CSS en supprimant tous les espaces, commentaires et caracteres inutiles pour produire la sortie la plus petite possible. Embellir fait l\'inverse : il prend du CSS compresse ou desordonne et ajoute une indentation, des sauts de ligne et un espacement corrects.' },
        { q: 'Quelle reduction de taille puis-je attendre ?', a: 'Les economies typiques vont de 15 a 40 pour cent selon le formatage du CSS original. Les feuilles de style avec des commentaires etendus et une indentation genereuse verront les reductions les plus importantes.' },
        { q: 'Mon code CSS est-il envoye a un serveur ?', a: 'Non. Toute la minification et l\'embellissement se font entierement dans votre navigateur en JavaScript. Votre code CSS ne quitte jamais votre appareil, ce qui rend cet outil totalement sur pour les feuilles de style proprietaires ou sensibles.' },
      ],
    },
    de: {
      title: 'CSS Minifier & Verschoenerer: Optimieren Sie Ihre Stylesheets Online',
      paragraphs: [
        'CSS-Minifizierung ist ein kritischer Schritt bei der Web-Performance-Optimierung. Jedes eingesparte Kilobyte in Ihren Stylesheets bedeutet schnellere Ladezeiten, bessere Core Web Vitals Werte und eine verbesserte Benutzererfahrung. Unser kostenloses CSS Minifier Tool entfernt alle unnoetigen Zeichen aus Ihrem CSS-Code, ohne seine Funktionalitaet zu aendern, einschliesslich Kommentare, Leerzeichen, Zeilenumbrueche und redundante Semikolons.',
        'Der Minifizierungsprozess funktioniert durch Anwendung einer Reihe von Transformationen auf Ihren CSS-Quellcode. Zuerst werden alle Blockkommentare zwischen /* und */ entfernt. Dann werden mehrfache Leerzeichen zu einzelnen Leerzeichen zusammengefasst. Leerzeichen um Selektoren, Eigenschaften, Werte und Satzzeichen wie Doppelpunkte, Semikolons, Kommas und geschweifte Klammern werden entfernt. Schliesslich werden abschliessende Semikolons vor schliessenden Klammern eliminiert.',
        'Ueber die Minifizierung hinaus bietet dieses Tool auch einen Verschoenerungs- oder Formatierungsmodus. Wenn Sie minifiziertes CSS erhalten und es lesen oder bearbeiten muessen, stellt der Verschoenerer die korrekte Einrueckung wieder her, fuegt Zeilenumbrueche nach jeder Deklaration hinzu und trennt Regelbloeecke mit Leerzeilen.',
        'Das Tool zeigt Echtzeit-Statistiken mit der originalen Dateigroesse, der Ausgabegroesse nach der Verarbeitung und dem erzielten Einsparungsprozentsatz. Bei typischen Stylesheets mit Kommentaren und grosszuegiger Formatierung kann die Minifizierung die Dateigroessen um 20 bis 40 Prozent oder mehr reduzieren.',
        'Professionelle Webentwickler integrieren CSS-Minifizierung in ihre Build-Pipelines, aber ein sofortiges Online-Tool ist unschaetzbar fuer schnelle Pruefungen, einmalige Optimierungen oder die Arbeit mit Drittanbieter-Stylesheets. Sie koennen beliebigen CSS-Code einfuegen, auf Minimieren klicken und das optimierte Ergebnis sofort kopieren oder herunterladen.',
        'Ob Sie Stylesheets fuer den Produktions-Deploy vorbereiten, das Kompressionspotenzial Ihres CSS-Codes analysieren oder einfach unordentliches CSS aus einer externen Quelle formatieren, dieses Tool erledigt alles direkt in Ihrem Browser ohne serverseitige Verarbeitung. Ihr Code verlaesst niemals Ihr Geraet.',
      ],
      faq: [
        { q: 'Was entfernt die CSS-Minifizierung genau?', a: 'Die CSS-Minifizierung entfernt Blockkommentare (/* */), zusaetzliche Leerzeichen und Zeilenumbrueche, Leerzeichen um Satzzeichen wie Doppelpunkte, Semikolons, Kommas und geschweifte Klammern sowie abschliessende Semikolons vor schliessenden Klammern. Das resultierende CSS ist funktional identisch zum Original, aber deutlich kleiner.' },
        { q: 'Wird die Minifizierung meine Styles kaputt machen?', a: 'Nein. Die CSS-Minifizierung entfernt nur Zeichen, die keinen Einfluss darauf haben, wie Browser Ihre Styles interpretieren und anwenden. Die visuelle Darstellung Ihrer Webseiten bleibt genau gleich. Minifiziertes CSS ist jedoch schwerer zu lesen, bewahren Sie also immer eine unminifizierte Kopie fuer die Entwicklung auf.' },
        { q: 'Was ist der Unterschied zwischen Minimieren und Verschoenern?', a: 'Minimieren komprimiert CSS durch Entfernen aller unnoetigen Leerzeichen, Kommentare und Zeichen fuer die kleinstmoegliche Ausgabe. Verschoenern macht das Gegenteil: Es nimmt komprimiertes oder unordentliches CSS und fuegt korrekte Einrueckung, Zeilenumbrueche und Abstaeende hinzu.' },
        { q: 'Welche Groessenreduzierung kann ich erwarten?', a: 'Typische Einsparungen liegen zwischen 15 und 40 Prozent, abhaengig von der Formatierung des originalen CSS. Stylesheets mit umfangreichen Kommentaren und grosszuegiger Einrueckung werden die groessten Reduzierungen sehen.' },
        { q: 'Wird mein CSS-Code an einen Server gesendet?', a: 'Nein. Die gesamte Minifizierung und Verschoenerung findet vollstaendig in Ihrem Browser mit JavaScript statt. Ihr CSS-Code verlaesst niemals Ihr Geraet, was dieses Tool vollkommen sicher fuer proprietaere oder sensible Stylesheets macht.' },
      ],
    },
    pt: {
      title: 'Minificador e Embelezador CSS: Otimize suas Folhas de Estilo Online',
      paragraphs: [
        'A minificacao CSS e um passo critico na otimizacao de desempenho web. Cada kilobyte economizado em suas folhas de estilo se traduz em tempos de carregamento mais rapidos, melhores pontuacoes de Core Web Vitals e uma experiencia de usuario aprimorada. Nossa ferramenta gratuita CSS Minifier remove todos os caracteres desnecessarios do seu codigo CSS sem alterar sua funcionalidade, incluindo comentarios, espacos em branco, quebras de linha e pontos e virgulas redundantes.',
        'O processo de minificacao funciona aplicando uma serie de transformacoes ao seu codigo-fonte CSS. Primeiro, todos os comentarios de bloco entre /* e */ sao removidos. Em seguida, caracteres de espaco multiplos sao reduzidos a espacos simples. Espacos ao redor de seletores, propriedades, valores e sinais de pontuacao como dois-pontos, pontos e virgulas, virgulas e chaves sao removidos. Finalmente, pontos e virgulas finais antes de chaves de fechamento sao eliminados.',
        'Alem da minificacao, esta ferramenta tambem oferece um modo de embelezamento ou formatacao. Se voce receber CSS minificado e precisar le-lo ou edita-lo, o embelezador restaurara a indentacao adequada, adicionara quebras de linha apos cada declaracao e separara os blocos de regras com linhas em branco.',
        'A ferramenta exibe estatisticas em tempo real mostrando o tamanho do arquivo original, o tamanho da saida apos o processamento e a porcentagem de economia alcancada. Para folhas de estilo tipicas com comentarios e formatacao generosa, a minificacao pode reduzir o tamanho dos arquivos de 20 a 40 por cento ou mais.',
        'Desenvolvedores web profissionais integram a minificacao CSS em seus pipelines de build, mas ter uma ferramenta online instantanea e inestimavel para verificacoes rapidas, otimizacoes pontuais ou ao trabalhar com folhas de estilo de terceiros. Voce pode colar qualquer codigo CSS, clicar em Minificar e copiar ou baixar imediatamente o resultado.',
        'Esteja voce preparando folhas de estilo para deploy em producao, analisando o potencial de compressao do seu codigo CSS ou simplesmente formatando CSS desorganizado de uma fonte externa, esta ferramenta lida com tudo diretamente no seu navegador sem processamento do lado do servidor. Seu codigo nunca sai da sua maquina.',
      ],
      faq: [
        { q: 'O que a minificacao CSS realmente remove?', a: 'A minificacao CSS remove comentarios de bloco (/* */), espacos em branco e quebras de linha extras, espacos ao redor de caracteres de pontuacao como dois-pontos, pontos e virgulas, virgulas e chaves, e pontos e virgulas finais antes de chaves de fechamento. O CSS resultante e funcionalmente identico ao original, mas significativamente menor.' },
        { q: 'A minificacao do CSS vai quebrar meus estilos?', a: 'Nao. A minificacao CSS apenas remove caracteres que nao afetam como os navegadores interpretam e aplicam seus estilos. A renderizacao visual de suas paginas web permanecera exatamente a mesma. No entanto, CSS minificado e mais dificil de ler, entao sempre mantenha uma copia nao minificada para desenvolvimento.' },
        { q: 'Qual e a diferenca entre minificar e embelezar?', a: 'Minificar comprime o CSS removendo todos os espacos, comentarios e caracteres desnecessarios para produzir a menor saida possivel. Embelezar faz o oposto: pega CSS comprimido ou desorganizado e adiciona indentacao, quebras de linha e espacamento adequados.' },
        { q: 'Quanta reducao de tamanho posso esperar?', a: 'As economias tipicas variam de 15 a 40 por cento, dependendo da formatacao do CSS original. Folhas de estilo com comentarios extensos e indentacao generosa verao as maiores reducoes.' },
        { q: 'Meu codigo CSS e enviado para um servidor?', a: 'Nao. Toda a minificacao e embelezamento acontecem inteiramente no seu navegador usando JavaScript. Seu codigo CSS nunca sai do seu dispositivo, tornando esta ferramenta completamente segura para folhas de estilo proprietarias ou sensiveis.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="css-minifier" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Input */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={labels.placeholder[lang]}
          className="w-full h-56 border border-gray-300 rounded-xl px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 mb-3 resize-y"
          spellCheck={false}
        />

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={handleMinify} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            {labels.minify[lang]}
          </button>
          <button onClick={handleBeautify} className="px-5 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
            {labels.beautify[lang]}
          </button>
          <button onClick={handleSample} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">
            {labels.sample[lang]}
          </button>
          <button onClick={handleReset} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">
            {labels.reset[lang]}
          </button>
          <button onClick={() => setShowHistory(!showHistory)} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">
            {labels.history[lang]} ({history.length})
          </button>
        </div>

        {/* Size stats */}
        {output && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">{labels.originalSize[lang]}</div>
              <div className="text-lg font-bold text-gray-900">{origSize.toLocaleString()} <span className="text-xs font-normal text-gray-500">{labels.bytes[lang]}</span></div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">{labels.outputSize[lang]}</div>
              <div className="text-lg font-bold text-gray-900">{outSize.toLocaleString()} <span className="text-xs font-normal text-gray-500">{labels.bytes[lang]}</span></div>
            </div>
            <div className={`rounded-lg p-3 text-center ${savedPercent > 0 ? 'bg-green-50' : savedPercent < 0 ? 'bg-amber-50' : 'bg-gray-50'}`}>
              <div className="text-xs text-gray-500 mb-1">{labels.savings[lang]}</div>
              <div className={`text-lg font-bold ${savedPercent > 0 ? 'text-green-600' : savedPercent < 0 ? 'text-amber-600' : 'text-gray-900'}`}>{savedPercent > 0 ? '-' : savedPercent < 0 ? '+' : ''}{Math.abs(savedPercent)}%</div>
            </div>
          </div>
        )}

        {/* Output */}
        {output && (
          <div className="relative mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{labels.output[lang]}</span>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600 transition-colors">
                  {copied ? labels.copied[lang] : labels.copy[lang]}
                </button>
                <button onClick={handleDownload} className="px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600 transition-colors">
                  {labels.download[lang]}
                </button>
              </div>
            </div>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto text-sm font-mono max-h-96 overflow-y-auto whitespace-pre-wrap break-all">{output}</pre>
          </div>
        )}

        {/* History */}
        {showHistory && (
          <div className="mb-6 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{labels.history[lang]}</h3>
              {history.length > 0 && (
                <button onClick={() => setHistory([])} className="text-xs text-red-500 hover:text-red-700">
                  {labels.clearHistory[lang]}
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-gray-400">{labels.noHistory[lang]}</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {history.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-xs cursor-pointer hover:bg-gray-100"
                    onClick={() => { setInput(entry.input.length >= 80 ? entry.input : entry.input); setOutput(entry.output.length >= 80 ? entry.output : entry.output); }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`px-2 py-0.5 rounded text-white font-medium ${entry.mode === 'minify' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                        {entry.mode === 'minify' ? labels.minify[lang] : labels.beautify[lang]}
                      </span>
                      <span className="text-gray-500 truncate">{entry.input.slice(0, 40)}...</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`font-medium ${entry.savedPercent > 0 ? 'text-green-600' : 'text-amber-600'}`}>{entry.savedPercent > 0 ? '-' : '+'}{Math.abs(entry.savedPercent)}%</span>
                      <span className="text-gray-400">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
