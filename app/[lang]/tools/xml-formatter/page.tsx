'use client';
import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface HistoryEntry {
  input: string;
  output: string;
  action: string;
  timestamp: Date;
}

function formatXml(xml: string, indent: string): string {
  let formatted = '';
  let pad = 0;
  const lines = xml
    .replace(/(>)(<)(\/*)/g, '$1\n$2$3')
    .replace(/(\/>)/g, '$1\n')
    .split('\n')
    .filter((line) => line.trim().length > 0);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Closing tag
    if (line.match(/^<\/\w/)) {
      pad = Math.max(0, pad - 1);
    }

    formatted += indent.repeat(pad) + line + '\n';

    // Opening tag (not self-closing, not closing, not declaration, not comment)
    if (
      line.match(/^<\w([^>]*[^/])?>.*$/) &&
      !line.match(/^<\//) &&
      !line.match(/\/>$/) &&
      !line.match(/^<\?/) &&
      !line.match(/^<!--/) &&
      !line.match(/^<!\[CDATA\[/)
    ) {
      // Check if there's a closing tag on the same line
      const tagName = line.match(/^<(\w+)/)?.[1];
      if (tagName && !line.match(new RegExp(`</${tagName}>\\s*$`))) {
        pad += 1;
      }
    }
  }

  return formatted.trim();
}

function minifyXml(xml: string): string {
  return xml
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .replace(/>\s+/g, '>')
    .replace(/\s+</g, '<')
    .trim();
}

function validateXml(xml: string): { valid: boolean; error: string } {
  if (!xml.trim()) return { valid: false, error: '' };
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const errorNode = doc.querySelector('parsererror');
    if (errorNode) {
      const errorText = errorNode.textContent || 'Unknown XML error';
      return { valid: false, error: errorText };
    }
    return { valid: true, error: '' };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}

function addLineNumbers(text: string): string {
  const lines = text.split('\n');
  const pad = String(lines.length).length;
  return lines
    .map((line, i) => `${String(i + 1).padStart(pad, ' ')} | ${line}`)
    .join('\n');
}

export default function XmlFormatter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['xml-formatter'][lang];

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [indentType, setIndentType] = useState<'2' | '4' | 'tab'>('2');
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const labels = {
    beautify: { en: 'Beautify', it: 'Abbellisci', es: 'Embellecer', fr: 'Embellir', de: 'Verschönern', pt: 'Embelezar' },
    minify: { en: 'Minify', it: 'Minimizza', es: 'Minimizar', fr: 'Minifier', de: 'Minimieren', pt: 'Minificar' },
    placeholder: { en: 'Paste your XML here...', it: 'Incolla il tuo XML qui...', es: 'Pega tu XML aquí...', fr: 'Collez votre XML ici...', de: 'XML hier einfügen...', pt: 'Cole seu XML aqui...' },
    valid: { en: 'Valid XML', it: 'XML valido', es: 'XML válido', fr: 'XML valide', de: 'Gültiges XML', pt: 'XML válido' },
    invalid: { en: 'Invalid XML', it: 'XML non valido', es: 'XML no válido', fr: 'XML invalide', de: 'Ungültiges XML', pt: 'XML inválido' },
    copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
    copiedLabel: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
    download: { en: 'Download XML', it: 'Scarica XML', es: 'Descargar XML', fr: 'Télécharger XML', de: 'XML Herunterladen', pt: 'Baixar XML' },
    reset: { en: 'Reset', it: 'Reimposta', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
    indent: { en: 'Indent', it: 'Indentazione', es: 'Indentación', fr: 'Indentation', de: 'Einrückung', pt: 'Indentação' },
    spaces: { en: 'spaces', it: 'spazi', es: 'espacios', fr: 'espaces', de: 'Leerzeichen', pt: 'espaços' },
    tab: { en: 'Tab', it: 'Tab', es: 'Tab', fr: 'Tab', de: 'Tab', pt: 'Tab' },
    lineNumbers: { en: 'Line Numbers', it: 'Numeri Riga', es: 'Números de Línea', fr: 'Numéros de Ligne', de: 'Zeilennummern', pt: 'Números de Linha' },
    history: { en: 'History', it: 'Cronologia', es: 'Historial', fr: 'Historique', de: 'Verlauf', pt: 'Histórico' },
    noHistory: { en: 'No history yet', it: 'Nessuna cronologia', es: 'Sin historial', fr: 'Pas d\'historique', de: 'Kein Verlauf', pt: 'Sem histórico' },
    restore: { en: 'Restore', it: 'Ripristina', es: 'Restaurar', fr: 'Restaurer', de: 'Wiederherstellen', pt: 'Restaurar' },
    output: { en: 'Output', it: 'Output', es: 'Salida', fr: 'Sortie', de: 'Ausgabe', pt: 'Saída' },
    clearHistory: { en: 'Clear History', it: 'Cancella Cronologia', es: 'Borrar Historial', fr: 'Effacer l\'Historique', de: 'Verlauf Löschen', pt: 'Limpar Histórico' },
  } as Record<string, Record<Locale, string>>;

  const getIndent = useCallback((): string => {
    if (indentType === 'tab') return '\t';
    return ' '.repeat(Number(indentType));
  }, [indentType]);

  const getRawOutput = useCallback((): string => {
    if (!output) return '';
    if (!showLineNumbers) return output;
    // Strip line numbers for raw content
    return output
      .split('\n')
      .map((line) => line.replace(/^\s*\d+\s*\|\s?/, ''))
      .join('\n');
  }, [output, showLineNumbers]);

  const beautify = () => {
    if (!input.trim()) return;
    const validation = validateXml(input);
    if (!validation.valid && validation.error) {
      setError(labels.invalid[lang] + ': ' + validation.error);
      setOutput('');
      return;
    }
    try {
      const formatted = formatXml(input, getIndent());
      const display = showLineNumbers ? addLineNumbers(formatted) : formatted;
      setOutput(display);
      setError('');
      setHistory((prev) => [
        { input, output: formatted, action: labels.beautify[lang], timestamp: new Date() },
        ...prev.slice(0, 19),
      ]);
    } catch (e) {
      setError(labels.invalid[lang] + ': ' + (e as Error).message);
      setOutput('');
    }
  };

  const minify = () => {
    if (!input.trim()) return;
    const validation = validateXml(input);
    if (!validation.valid && validation.error) {
      setError(labels.invalid[lang] + ': ' + validation.error);
      setOutput('');
      return;
    }
    try {
      const minified = minifyXml(input);
      const display = showLineNumbers ? addLineNumbers(minified) : minified;
      setOutput(display);
      setError('');
      setHistory((prev) => [
        { input, output: minified, action: labels.minify[lang], timestamp: new Date() },
        ...prev.slice(0, 19),
      ]);
    } catch (e) {
      setError(labels.invalid[lang] + ': ' + (e as Error).message);
      setOutput('');
    }
  };

  const copy = () => {
    const raw = getRawOutput();
    if (!raw) return;
    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadXml = () => {
    const raw = getRawOutput();
    if (!raw) return;
    const blob = new Blob([raw], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setInput('');
    setOutput('');
    setError('');
    setCopied(false);
  };

  const restoreFromHistory = (entry: HistoryEntry) => {
    setInput(entry.input);
    setOutput(showLineNumbers ? addLineNumbers(entry.output) : entry.output);
    setError('');
    setShowHistory(false);
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'XML Formatter & Validator: Beautify, Minify and Validate XML Online',
      paragraphs: [
        'XML (eXtensible Markup Language) remains one of the most important data formats in enterprise software, web services, and configuration management. From SOAP APIs and RSS feeds to Android layouts and Maven build files, XML is everywhere in modern development. Our free XML formatter helps you beautify, minify, and validate XML documents instantly in your browser with no data sent to any server.',
        'The beautifier takes any valid XML input and produces clean, properly indented output. You can choose between 2-space, 4-space, or tab indentation to match your project\'s coding standards. This makes deeply nested XML elements easy to read and debug, which is especially valuable when working with complex XSLT transformations, large configuration files, or verbose SOAP responses.',
        'The minifier does the opposite, stripping all unnecessary whitespace to produce the most compact representation. This is ideal for reducing file size before transmission, embedding XML in other documents, or preparing data for systems that are sensitive to whitespace in XML content.',
        'Beyond formatting, this tool performs real-time XML validation using the browser\'s built-in DOMParser. It catches common errors such as unclosed tags, mismatched element names, missing root elements, invalid characters, and malformed attributes. Clear error messages help you quickly locate and fix problems without searching through hundreds of lines of code.',
        'Additional features include line numbers for easy reference, a full formatting history so you can revisit previous operations, one-click copy to clipboard, and direct download of the formatted XML file. Whether you are a backend developer working with web services, a DevOps engineer managing configuration, or a data analyst processing XML feeds, this tool streamlines your workflow.',
      ],
      faq: [
        { q: 'What is XML and where is it commonly used?', a: 'XML (eXtensible Markup Language) is a markup language for encoding documents in a human-readable and machine-readable format. It is widely used in web services (SOAP, REST), configuration files (Maven, Spring, Android), data interchange (RSS, Atom, SVG), and enterprise integration. Unlike HTML, XML lets you define your own tags and structure.' },
        { q: 'How does the XML validator detect errors?', a: 'The tool uses the browser\'s native DOMParser to parse your XML input. If the parser encounters well-formedness errors such as unclosed tags, mismatched opening and closing elements, invalid attribute syntax, or missing root elements, it generates a detailed error message indicating the nature and approximate location of the problem.' },
        { q: 'What is the difference between beautifying and minifying XML?', a: 'Beautifying (pretty printing) adds indentation and line breaks to make XML readable and easy to navigate. Minifying removes all unnecessary whitespace, comments between tags, and extra line breaks to reduce file size. Beautified XML is for reading and editing; minified XML is for storage and transmission efficiency.' },
        { q: 'Does this tool send my XML data to a server?', a: 'No. All formatting, minification, and validation happens entirely in your browser using JavaScript. Your XML data never leaves your device, making this tool safe for sensitive configuration files, API keys embedded in XML, and proprietary data structures.' },
        { q: 'Can I choose different indentation styles for my XML?', a: 'Yes. The tool supports three indentation options: 2 spaces (compact and common in web development), 4 spaces (standard in many enterprise projects), and tabs (preferred by some teams for accessibility and flexibility). Select your preferred style before clicking Beautify.' },
      ],
    },
    it: {
      title: 'Formattatore XML e Validatore: Abbellisci, Minimizza e Valida XML Online',
      paragraphs: [
        'XML (eXtensible Markup Language) rimane uno dei formati di dati piu importanti nel software enterprise, nei servizi web e nella gestione delle configurazioni. Dalle API SOAP e i feed RSS ai layout Android e i file di build Maven, XML e ovunque nello sviluppo moderno. Il nostro formattatore XML gratuito ti permette di abbellire, minimizzare e validare documenti XML istantaneamente nel browser senza inviare dati a nessun server.',
        'L\'abbellitore prende qualsiasi input XML valido e produce un output pulito e correttamente indentato. Puoi scegliere tra indentazione a 2 spazi, 4 spazi o tab per adattarti agli standard del tuo progetto. Questo rende gli elementi XML profondamente annidati facili da leggere e debuggare, particolarmente utile con trasformazioni XSLT complesse e risposte SOAP verbose.',
        'Il minimizzatore fa l\'opposto, eliminando tutti gli spazi bianchi non necessari per produrre la rappresentazione piu compatta. E ideale per ridurre la dimensione del file prima della trasmissione o per preparare dati per sistemi sensibili agli spazi bianchi nel contenuto XML.',
        'Oltre alla formattazione, questo strumento esegue la validazione XML in tempo reale usando il DOMParser del browser. Rileva errori comuni come tag non chiusi, nomi di elementi non corrispondenti, elementi root mancanti, caratteri non validi e attributi malformati. Messaggi di errore chiari aiutano a localizzare e correggere rapidamente i problemi.',
        'Funzionalita aggiuntive includono numeri di riga per facile riferimento, cronologia completa delle formattazioni, copia negli appunti con un clic e download diretto del file XML formattato. Che tu sia uno sviluppatore backend, un ingegnere DevOps o un analista dati, questo strumento ottimizza il tuo flusso di lavoro.',
      ],
      faq: [
        { q: 'Cos\'e XML e dove viene comunemente usato?', a: 'XML (eXtensible Markup Language) e un linguaggio di markup per codificare documenti in un formato leggibile sia dall\'uomo che dalle macchine. E ampiamente usato nei servizi web (SOAP, REST), file di configurazione (Maven, Spring, Android), scambio dati (RSS, Atom, SVG) e integrazione enterprise.' },
        { q: 'Come rileva gli errori il validatore XML?', a: 'Lo strumento usa il DOMParser nativo del browser per analizzare l\'input XML. Se il parser incontra errori di buona formazione come tag non chiusi, elementi di apertura e chiusura non corrispondenti o sintassi degli attributi non valida, genera un messaggio di errore dettagliato.' },
        { q: 'Qual e la differenza tra abbellire e minimizzare XML?', a: 'Abbellire (pretty printing) aggiunge indentazione e interruzioni di riga per rendere XML leggibile. Minimizzare rimuove tutti gli spazi bianchi non necessari per ridurre la dimensione del file. XML abbellito e per lettura e modifica; XML minimizzato e per efficienza di archiviazione e trasmissione.' },
        { q: 'Questo strumento invia i miei dati XML a un server?', a: 'No. Tutta la formattazione, minimizzazione e validazione avviene interamente nel tuo browser usando JavaScript. I tuoi dati XML non lasciano mai il tuo dispositivo, rendendo questo strumento sicuro per file di configurazione sensibili e dati proprietari.' },
        { q: 'Posso scegliere diversi stili di indentazione?', a: 'Si. Lo strumento supporta tre opzioni di indentazione: 2 spazi (compatto e comune nello sviluppo web), 4 spazi (standard in molti progetti enterprise) e tab (preferito da alcuni team per accessibilita e flessibilita). Seleziona il tuo stile preferito prima di cliccare Abbellisci.' },
      ],
    },
    es: {
      title: 'Formateador XML y Validador: Embellece, Minimiza y Valida XML Online',
      paragraphs: [
        'XML (eXtensible Markup Language) sigue siendo uno de los formatos de datos mas importantes en software empresarial, servicios web y gestion de configuraciones. Desde APIs SOAP y feeds RSS hasta layouts Android y archivos Maven, XML esta en todas partes del desarrollo moderno. Nuestro formateador XML gratuito te permite embellecer, minimizar y validar documentos XML instantaneamente en tu navegador sin enviar datos a ningun servidor.',
        'El embellecedor toma cualquier entrada XML valida y produce una salida limpia y correctamente indentada. Puedes elegir entre indentacion de 2 espacios, 4 espacios o tabulaciones para adaptarte a los estandares de tu proyecto. Esto hace que los elementos XML profundamente anidados sean faciles de leer y depurar.',
        'El minimizador hace lo opuesto, eliminando todos los espacios en blanco innecesarios para producir la representacion mas compacta. Es ideal para reducir el tamano del archivo antes de la transmision o preparar datos para sistemas sensibles a los espacios en blanco.',
        'Ademas del formateo, esta herramienta realiza validacion XML en tiempo real usando el DOMParser del navegador. Detecta errores comunes como etiquetas sin cerrar, nombres de elementos no coincidentes, elementos raiz faltantes, caracteres invalidos y atributos malformados.',
        'Caracteristicas adicionales incluyen numeros de linea para facil referencia, historial completo de formateos, copia al portapapeles con un clic y descarga directa del archivo XML formateado. Ya seas desarrollador backend, ingeniero DevOps o analista de datos, esta herramienta optimiza tu flujo de trabajo.',
      ],
      faq: [
        { q: 'Que es XML y donde se usa comunmente?', a: 'XML (eXtensible Markup Language) es un lenguaje de marcado para codificar documentos en un formato legible por humanos y maquinas. Se usa ampliamente en servicios web (SOAP, REST), archivos de configuracion (Maven, Spring, Android), intercambio de datos (RSS, Atom, SVG) e integracion empresarial.' },
        { q: 'Como detecta errores el validador XML?', a: 'La herramienta usa el DOMParser nativo del navegador para analizar tu entrada XML. Si el parser encuentra errores de buena formacion como etiquetas sin cerrar o elementos no coincidentes, genera un mensaje de error detallado indicando la naturaleza y ubicacion del problema.' },
        { q: 'Cual es la diferencia entre embellecer y minimizar XML?', a: 'Embellecer (pretty printing) agrega indentacion y saltos de linea para hacer XML legible. Minimizar elimina todos los espacios en blanco innecesarios para reducir el tamano del archivo. XML embellecido es para leer y editar; XML minimizado es para eficiencia de almacenamiento y transmision.' },
        { q: 'Esta herramienta envia mis datos XML a un servidor?', a: 'No. Todo el formateo, minimizacion y validacion ocurre completamente en tu navegador usando JavaScript. Tus datos XML nunca salen de tu dispositivo, haciendo esta herramienta segura para archivos de configuracion sensibles y datos propietarios.' },
        { q: 'Puedo elegir diferentes estilos de indentacion?', a: 'Si. La herramienta soporta tres opciones de indentacion: 2 espacios (compacto y comun en desarrollo web), 4 espacios (estandar en muchos proyectos empresariales) y tabulaciones (preferido por algunos equipos). Selecciona tu estilo preferido antes de hacer clic en Embellecer.' },
      ],
    },
    fr: {
      title: 'Formateur XML et Validateur : Embellir, Minifier et Valider du XML en Ligne',
      paragraphs: [
        'XML (eXtensible Markup Language) reste l\'un des formats de donnees les plus importants dans les logiciels d\'entreprise, les services web et la gestion de configuration. Des APIs SOAP et flux RSS aux layouts Android et fichiers Maven, XML est partout dans le developpement moderne. Notre formateur XML gratuit vous permet d\'embellir, minifier et valider des documents XML instantanement dans votre navigateur sans envoyer de donnees a aucun serveur.',
        'L\'embellisseur prend n\'importe quelle entree XML valide et produit une sortie propre et correctement indentee. Vous pouvez choisir entre une indentation de 2 espaces, 4 espaces ou tabulations pour correspondre aux standards de votre projet. Cela rend les elements XML profondement imbriques faciles a lire et deboguer.',
        'Le minifieur fait l\'inverse, supprimant tous les espaces blancs inutiles pour produire la representation la plus compacte. C\'est ideal pour reduire la taille du fichier avant la transmission ou preparer des donnees pour des systemes sensibles aux espaces blancs.',
        'Au-dela du formatage, cet outil effectue une validation XML en temps reel en utilisant le DOMParser du navigateur. Il detecte les erreurs courantes telles que les balises non fermees, les noms d\'elements non correspondants, les elements racine manquants, les caracteres invalides et les attributs malformes.',
        'Les fonctionnalites supplementaires incluent les numeros de ligne pour reference facile, un historique complet des formatages, la copie dans le presse-papiers en un clic et le telechargement direct du fichier XML formate. Que vous soyez developpeur backend, ingenieur DevOps ou analyste de donnees, cet outil optimise votre flux de travail.',
      ],
      faq: [
        { q: 'Qu\'est-ce que XML et ou est-il couramment utilise ?', a: 'XML (eXtensible Markup Language) est un langage de balisage pour encoder des documents dans un format lisible par les humains et les machines. Il est largement utilise dans les services web (SOAP, REST), les fichiers de configuration (Maven, Spring, Android), l\'echange de donnees (RSS, Atom, SVG) et l\'integration d\'entreprise.' },
        { q: 'Comment le validateur XML detecte-t-il les erreurs ?', a: 'L\'outil utilise le DOMParser natif du navigateur pour analyser votre entree XML. Si le parseur rencontre des erreurs de bonne formation comme des balises non fermees ou des elements non correspondants, il genere un message d\'erreur detaille indiquant la nature et l\'emplacement du probleme.' },
        { q: 'Quelle est la difference entre embellir et minifier du XML ?', a: 'Embellir (pretty printing) ajoute l\'indentation et les retours a la ligne pour rendre le XML lisible. Minifier supprime tous les espaces blancs inutiles pour reduire la taille du fichier. Le XML embelli est pour la lecture et l\'edition ; le XML minifie est pour l\'efficacite de stockage et de transmission.' },
        { q: 'Cet outil envoie-t-il mes donnees XML a un serveur ?', a: 'Non. Tout le formatage, la minification et la validation se font entierement dans votre navigateur en JavaScript. Vos donnees XML ne quittent jamais votre appareil, rendant cet outil sur pour les fichiers de configuration sensibles et les donnees proprietaires.' },
        { q: 'Puis-je choisir differents styles d\'indentation ?', a: 'Oui. L\'outil supporte trois options d\'indentation : 2 espaces (compact et courant en developpement web), 4 espaces (standard dans de nombreux projets d\'entreprise) et tabulations (prefere par certaines equipes). Selectionnez votre style prefere avant de cliquer sur Embellir.' },
      ],
    },
    de: {
      title: 'XML Formatter & Validator: XML Online Verschönern, Minimieren und Validieren',
      paragraphs: [
        'XML (eXtensible Markup Language) bleibt eines der wichtigsten Datenformate in der Unternehmenssoftware, bei Webdiensten und im Konfigurationsmanagement. Von SOAP-APIs und RSS-Feeds bis hin zu Android-Layouts und Maven-Build-Dateien ist XML ueberall in der modernen Entwicklung. Unser kostenloser XML-Formatter ermoeglicht es Ihnen, XML-Dokumente sofort in Ihrem Browser zu verschoenern, minimieren und validieren, ohne Daten an einen Server zu senden.',
        'Der Verschoenerer nimmt jede gueltige XML-Eingabe und erzeugt eine saubere, richtig eingerueckte Ausgabe. Sie koennen zwischen 2 Leerzeichen, 4 Leerzeichen oder Tab-Einrueckung waehlen, um den Standards Ihres Projekts zu entsprechen. Dies macht tief verschachtelte XML-Elemente leicht lesbar und debugbar.',
        'Der Minimierer macht das Gegenteil und entfernt alle unnoetige Leerraum, um die kompakteste Darstellung zu erzeugen. Dies ist ideal zur Reduzierung der Dateigroesse vor der Uebertragung oder zur Vorbereitung von Daten fuer Systeme, die empfindlich auf Leerraum in XML reagieren.',
        'Ueber die Formatierung hinaus fuehrt dieses Tool eine Echtzeit-XML-Validierung mit dem DOMParser des Browsers durch. Es erkennt haeufige Fehler wie nicht geschlossene Tags, nicht uebereinstimmende Elementnamen, fehlende Wurzelelemente, ungueltige Zeichen und fehlerhafte Attribute.',
        'Zusaetzliche Funktionen umfassen Zeilennummern fuer einfache Referenz, einen vollstaendigen Formatierungsverlauf, Ein-Klick-Kopie in die Zwischenablage und direkten Download der formatierten XML-Datei. Ob Sie Backend-Entwickler, DevOps-Ingenieur oder Datenanalyst sind, dieses Tool optimiert Ihren Workflow.',
      ],
      faq: [
        { q: 'Was ist XML und wo wird es haeufig verwendet?', a: 'XML (eXtensible Markup Language) ist eine Auszeichnungssprache zur Kodierung von Dokumenten in einem menschen- und maschinenlesbaren Format. Es wird breit in Webdiensten (SOAP, REST), Konfigurationsdateien (Maven, Spring, Android), Datenaustausch (RSS, Atom, SVG) und Unternehmensintegration eingesetzt.' },
        { q: 'Wie erkennt der XML-Validator Fehler?', a: 'Das Tool verwendet den nativen DOMParser des Browsers zur Analyse Ihrer XML-Eingabe. Wenn der Parser Wohlgeformtheitsfehler wie nicht geschlossene Tags oder nicht uebereinstimmende Elemente findet, generiert er eine detaillierte Fehlermeldung mit Art und ungefaehrem Ort des Problems.' },
        { q: 'Was ist der Unterschied zwischen Verschoenern und Minimieren von XML?', a: 'Verschoenern (Pretty Printing) fuegt Einrueckung und Zeilenumbrueche hinzu, um XML lesbar zu machen. Minimieren entfernt alle unnoetige Leerraum zur Reduzierung der Dateigroesse. Verschoenertes XML ist zum Lesen und Bearbeiten; minimiertes XML ist fuer Speicher- und Uebertragungseffizienz.' },
        { q: 'Sendet dieses Tool meine XML-Daten an einen Server?', a: 'Nein. Alle Formatierung, Minimierung und Validierung erfolgt vollstaendig in Ihrem Browser mit JavaScript. Ihre XML-Daten verlassen nie Ihr Geraet, was dieses Tool sicher fuer sensible Konfigurationsdateien und proprietaere Daten macht.' },
        { q: 'Kann ich verschiedene Einrueckungsstile waehlen?', a: 'Ja. Das Tool unterstuetzt drei Einrueckungsoptionen: 2 Leerzeichen (kompakt und ueblich in der Webentwicklung), 4 Leerzeichen (Standard in vielen Unternehmensprojekten) und Tabs (von einigen Teams bevorzugt). Waehlen Sie Ihren bevorzugten Stil vor dem Klick auf Verschoenern.' },
      ],
    },
    pt: {
      title: 'Formatador XML e Validador: Embeleze, Minifique e Valide XML Online',
      paragraphs: [
        'XML (eXtensible Markup Language) continua sendo um dos formatos de dados mais importantes em software empresarial, servicos web e gerenciamento de configuracao. De APIs SOAP e feeds RSS a layouts Android e arquivos Maven, XML esta em toda parte no desenvolvimento moderno. Nosso formatador XML gratuito permite embelezar, minificar e validar documentos XML instantaneamente no navegador sem enviar dados a nenhum servidor.',
        'O embelezador pega qualquer entrada XML valida e produz uma saida limpa e corretamente indentada. Voce pode escolher entre indentacao de 2 espacos, 4 espacos ou tabulacoes para corresponder aos padroes do seu projeto. Isso torna elementos XML profundamente aninhados faceis de ler e depurar.',
        'O minificador faz o oposto, removendo todos os espacos em branco desnecessarios para produzir a representacao mais compacta. E ideal para reduzir o tamanho do arquivo antes da transmissao ou preparar dados para sistemas sensiveis a espacos em branco.',
        'Alem da formatacao, esta ferramenta realiza validacao XML em tempo real usando o DOMParser do navegador. Detecta erros comuns como tags nao fechadas, nomes de elementos nao correspondentes, elementos raiz ausentes, caracteres invalidos e atributos malformados.',
        'Recursos adicionais incluem numeros de linha para referencia facil, historico completo de formatacoes, copia para area de transferencia com um clique e download direto do arquivo XML formatado. Seja voce desenvolvedor backend, engenheiro DevOps ou analista de dados, esta ferramenta otimiza seu fluxo de trabalho.',
      ],
      faq: [
        { q: 'O que e XML e onde e comumente usado?', a: 'XML (eXtensible Markup Language) e uma linguagem de marcacao para codificar documentos em um formato legivel por humanos e maquinas. E amplamente usado em servicos web (SOAP, REST), arquivos de configuracao (Maven, Spring, Android), intercambio de dados (RSS, Atom, SVG) e integracao empresarial.' },
        { q: 'Como o validador XML detecta erros?', a: 'A ferramenta usa o DOMParser nativo do navegador para analisar sua entrada XML. Se o parser encontrar erros de boa formacao como tags nao fechadas ou elementos nao correspondentes, gera uma mensagem de erro detalhada indicando a natureza e localizacao do problema.' },
        { q: 'Qual e a diferenca entre embelezar e minificar XML?', a: 'Embelezar (pretty printing) adiciona indentacao e quebras de linha para tornar o XML legivel. Minificar remove todos os espacos em branco desnecessarios para reduzir o tamanho do arquivo. XML embelezado e para leitura e edicao; XML minificado e para eficiencia de armazenamento e transmissao.' },
        { q: 'Esta ferramenta envia meus dados XML a um servidor?', a: 'Nao. Toda formatacao, minificacao e validacao acontece inteiramente no seu navegador usando JavaScript. Seus dados XML nunca saem do seu dispositivo, tornando esta ferramenta segura para arquivos de configuracao sensiveis e dados proprietarios.' },
        { q: 'Posso escolher diferentes estilos de indentacao?', a: 'Sim. A ferramenta suporta tres opcoes de indentacao: 2 espacos (compacto e comum em desenvolvimento web), 4 espacos (padrao em muitos projetos empresariais) e tabulacoes (preferido por algumas equipes). Selecione seu estilo preferido antes de clicar em Embelezar.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="xml-formatter" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Input Area */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={labels.placeholder[lang]}
          className="w-full h-48 border border-gray-300 rounded-xl px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 mb-3"
          spellCheck={false}
        />

        {/* Options Row */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">{labels.indent[lang]}:</label>
            <select
              value={indentType}
              onChange={(e) => setIndentType(e.target.value as '2' | '4' | 'tab')}
              className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="2">2 {labels.spaces[lang]}</option>
              <option value="4">4 {labels.spaces[lang]}</option>
              <option value="tab">{labels.tab[lang]}</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showLineNumbers}
              onChange={(e) => setShowLineNumbers(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            {labels.lineNumbers[lang]}
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={beautify}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {labels.beautify[lang]}
          </button>
          <button
            onClick={minify}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            {labels.minify[lang]}
          </button>
          <button
            onClick={reset}
            className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            {labels.reset[lang]}
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            {labels.history[lang]} ({history.length})
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg mb-3 text-sm break-all">
            {error}
          </div>
        )}

        {/* History Panel */}
        {showHistory && (
          <div className="border border-gray-200 rounded-xl p-4 mb-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-900">{labels.history[lang]}</h3>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  {labels.clearHistory[lang]}
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-gray-500">{labels.noHistory[lang]}</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {history.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100"
                  >
                    <div className="text-sm text-gray-700 truncate flex-1 mr-2">
                      <span className="font-medium text-blue-600">{entry.action}</span>
                      {' — '}
                      <span className="text-gray-400">
                        {entry.timestamp.toLocaleTimeString()}
                      </span>
                      {' — '}
                      <span className="text-gray-500 font-mono text-xs">
                        {entry.input.substring(0, 50)}...
                      </span>
                    </div>
                    <button
                      onClick={() => restoreFromHistory(entry)}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 whitespace-nowrap"
                    >
                      {labels.restore[lang]}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Output Area */}
        {output && (
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{labels.output[lang]}</span>
              <div className="flex gap-2">
                <button
                  onClick={copy}
                  className="px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                >
                  {copied ? labels.copiedLabel[lang] : labels.copy[lang]}
                </button>
                <button
                  onClick={downloadXml}
                  className="px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                >
                  {labels.download[lang]}
                </button>
              </div>
            </div>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto text-sm font-mono whitespace-pre max-h-96 overflow-y-auto">
              {output}
            </pre>
          </div>
        )}

        {/* SEO Article */}
        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => (
            <p key={i} className="text-gray-700 leading-relaxed mb-4">{p}</p>
          ))}
        </article>

        {/* FAQ Section */}
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
                  <span className="text-gray-400">{openFaq === i ? '\u2212' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-3 text-gray-600">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </ToolPageWrapper>
  );
}
