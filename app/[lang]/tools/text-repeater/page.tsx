'use client';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type SeparatorType = 'newline' | 'space' | 'comma' | 'custom';

export default function TextRepeater() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['text-repeater'][lang];
  const [text, setText] = useState('');
  const [count, setCount] = useState(10);
  const [separator, setSeparator] = useState<SeparatorType>('newline');
  const [customSeparator, setCustomSeparator] = useState(', ');
  const [addLineNumbers, setAddLineNumbers] = useState(false);
  const [reverseText, setReverseText] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const labels: Record<string, Record<Locale, string>> = {
    inputPlaceholder: { en: 'Enter text to repeat...', it: 'Inserisci il testo da ripetere...', es: 'Ingresa el texto a repetir...', fr: 'Entrez le texte à répéter...', de: 'Text zum Wiederholen eingeben...', pt: 'Digite o texto para repetir...' },
    repeatCount: { en: 'Repeat Count', it: 'Numero di Ripetizioni', es: 'Número de Repeticiones', fr: 'Nombre de Répétitions', de: 'Wiederholungen', pt: 'Número de Repetições' },
    separator: { en: 'Separator', it: 'Separatore', es: 'Separador', fr: 'Séparateur', de: 'Trennzeichen', pt: 'Separador' },
    newline: { en: 'New Line', it: 'Nuova Riga', es: 'Nueva Línea', fr: 'Nouvelle Ligne', de: 'Neue Zeile', pt: 'Nova Linha' },
    space: { en: 'Space', it: 'Spazio', es: 'Espacio', fr: 'Espace', de: 'Leerzeichen', pt: 'Espaço' },
    comma: { en: 'Comma', it: 'Virgola', es: 'Coma', fr: 'Virgule', de: 'Komma', pt: 'Vírgula' },
    custom: { en: 'Custom', it: 'Personalizzato', es: 'Personalizado', fr: 'Personnalisé', de: 'Benutzerdefiniert', pt: 'Personalizado' },
    customSep: { en: 'Custom Separator', it: 'Separatore Personalizzato', es: 'Separador Personalizado', fr: 'Séparateur Personnalisé', de: 'Benutzerdefiniertes Trennzeichen', pt: 'Separador Personalizado' },
    lineNumbers: { en: 'Add Line Numbers', it: 'Aggiungi Numeri di Riga', es: 'Agregar Números de Línea', fr: 'Ajouter Numéros de Ligne', de: 'Zeilennummern Hinzufügen', pt: 'Adicionar Números de Linha' },
    reverse: { en: 'Reverse Text', it: 'Inverti Testo', es: 'Invertir Texto', fr: 'Inverser le Texte', de: 'Text Umkehren', pt: 'Inverter Texto' },
    output: { en: 'Output', it: 'Risultato', es: 'Resultado', fr: 'Résultat', de: 'Ergebnis', pt: 'Resultado' },
    copy: { en: 'Copy to Clipboard', it: 'Copia negli Appunti', es: 'Copiar al Portapapeles', fr: 'Copier dans le Presse-papiers', de: 'In die Zwischenablage Kopieren', pt: 'Copiar para Área de Transferência' },
    copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
    clear: { en: 'Clear', it: 'Cancella', es: 'Borrar', fr: 'Effacer', de: 'Löschen', pt: 'Limpar' },
    presets: { en: 'Quick Presets', it: 'Preset Rapidi', es: 'Presets Rápidos', fr: 'Préréglages Rapides', de: 'Schnellvorlagen', pt: 'Presets Rápidos' },
    characters: { en: 'Characters', it: 'Caratteri', es: 'Caracteres', fr: 'Caractères', de: 'Zeichen', pt: 'Caracteres' },
    words: { en: 'Words', it: 'Parole', es: 'Palabras', fr: 'Mots', de: 'Wörter', pt: 'Palavras' },
    options: { en: 'Options', it: 'Opzioni', es: 'Opciones', fr: 'Options', de: 'Optionen', pt: 'Opções' },
  };

  const getSeparatorString = (): string => {
    switch (separator) {
      case 'newline': return '\n';
      case 'space': return ' ';
      case 'comma': return ', ';
      case 'custom': return customSeparator;
    }
  };

  const output = useMemo(() => {
    if (!text.trim()) return '';
    const base = reverseText ? text.split('').reverse().join('') : text;
    const lines: string[] = [];
    for (let i = 0; i < count; i++) {
      lines.push(addLineNumbers ? `${i + 1}. ${base}` : base);
    }
    return lines.join(getSeparatorString());
  }, [text, count, separator, customSeparator, addLineNumbers, reverseText]);

  const outputWords = output.trim() ? output.trim().split(/\s+/).length : 0;
  const outputChars = output.length;

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText('');
    setCount(10);
    setSeparator('newline');
    setCustomSeparator(', ');
    setAddLineNumbers(false);
    setReverseText(false);
    setCopied(false);
  };

  const presets = [10, 50, 100, 500];

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Online Text Repeater Tool — Repeat Text Instantly',
      paragraphs: [
        'Need to repeat a word, sentence, or paragraph hundreds of times? Our free online text repeater tool lets you duplicate any text up to 10,000 times with a single click. Whether you are filling test data, creating placeholder content, or generating repetitive patterns, this tool saves hours of manual copy-pasting.',
        'The text repeater offers flexible separator options including new lines, spaces, commas, or any custom delimiter you choose. You can also add sequential line numbers to each repetition, making it easy to track individual entries in your output. The reverse text toggle lets you mirror your input before repeating, which is useful for creative projects and encoding experiments.',
        'Developers frequently use text repeaters to generate sample data for stress testing, populate database fields, or create test inputs for form validation. Content creators rely on repeated text for visual mockups, layout testing, and design prototyping. Students use it for filling templates and generating practice material.',
        'All processing happens entirely in your browser — your text is never uploaded to any server. The real-time character and word count helps you monitor output size, ensuring compatibility with platform limits. Quick presets for 10, 50, 100, and 500 repetitions let you jump to common quantities instantly.',
      ],
      faq: [
        { q: 'What is the maximum number of repetitions?', a: 'You can repeat text up to 10,000 times. For very large outputs, your browser may take a moment to render the result, but all processing happens locally on your device.' },
        { q: 'Can I use custom separators between repetitions?', a: 'Yes. Choose from new line, space, comma, or enter any custom separator string. Common custom separators include semicolons, pipes (|), tabs, and HTML tags.' },
        { q: 'What does the line numbers option do?', a: 'When enabled, each repetition is prefixed with a sequential number (1., 2., 3., etc.). This is useful for creating numbered lists or tracking individual entries in your output.' },
        { q: 'How does the reverse text option work?', a: 'The reverse text toggle mirrors each character in your input before repeating. For example, "Hello" becomes "olleH". This is applied to each repeated instance, not to the overall output order.' },
        { q: 'Is my text stored or sent to a server?', a: 'No. All processing happens entirely in your browser using JavaScript. Your text never leaves your device, ensuring complete privacy and security.' },
      ],
    },
    it: {
      title: 'Ripetitore di Testo Online Gratuito — Ripeti Testo Istantaneamente',
      paragraphs: [
        'Hai bisogno di ripetere una parola, frase o paragrafo centinaia di volte? Il nostro ripetitore di testo online gratuito ti permette di duplicare qualsiasi testo fino a 10.000 volte con un solo clic. Che tu stia creando dati di test, contenuti segnaposto o schemi ripetitivi, questo strumento ti fa risparmiare ore di copia-incolla manuale.',
        'Il ripetitore di testo offre opzioni flessibili per i separatori, incluse nuove righe, spazi, virgole o qualsiasi delimitatore personalizzato. Puoi anche aggiungere numeri di riga sequenziali a ogni ripetizione, rendendo facile tracciare le singole voci nel risultato. L\'opzione inverti testo ti permette di specchiare l\'input prima della ripetizione.',
        'Gli sviluppatori usano frequentemente i ripetitori di testo per generare dati di test, popolare campi di database o creare input per la validazione dei form. I creatori di contenuti si affidano al testo ripetuto per mockup visivi, test di layout e prototipi di design. Gli studenti lo usano per compilare modelli e generare materiale di pratica.',
        'Tutta l\'elaborazione avviene nel tuo browser — il tuo testo non viene mai caricato su alcun server. Il conteggio in tempo reale di caratteri e parole ti aiuta a monitorare la dimensione dell\'output. I preset rapidi per 10, 50, 100 e 500 ripetizioni ti permettono di selezionare le quantità più comuni istantaneamente.',
        'Il nostro ripetitore di parole è lo strumento ideale per chi cerca un modo rapido e affidabile per ripetere testo online. A differenza di altri servizi, questo ripetitore testo online funziona interamente nel browser, senza limiti di utilizzo e senza registrazione. Puoi ripeti testo gratis tutte le volte che vuoi: basta inserire il contenuto, scegliere il numero di ripetizioni e copiare il risultato. Il ripetitore di testo è perfetto anche per esercizi di dattilografia, test di stress per campi di input o per creare contenuti ripetitivi per scopi creativi.',
        'Se hai bisogno di analizzare il testo generato, puoi usare il nostro <a href="/it/tools/word-counter">contatore di parole</a> per verificare la lunghezza esatta dell\'output. Per modificare la formattazione del testo ripetuto — ad esempio trasformarlo tutto in maiuscolo o minuscolo — prova il <a href="/it/tools/text-case-converter">convertitore maiuscole/minuscole</a>. Combinando questi strumenti con il ripetitore parole, hai a disposizione un kit completo per manipolare qualsiasi tipo di testo in modo veloce e gratuito.',
      ],
      faq: [
        { q: 'Qual è il numero massimo di ripetizioni?', a: 'Puoi ripetere il testo fino a 10.000 volte. Per output molto grandi, il browser potrebbe impiegare un momento per renderizzare il risultato, ma tutta l\'elaborazione avviene localmente sul tuo dispositivo.' },
        { q: 'Posso usare separatori personalizzati tra le ripetizioni?', a: 'Sì. Scegli tra nuova riga, spazio, virgola o inserisci qualsiasi stringa di separazione personalizzata. Separatori comuni includono punto e virgola, pipe (|), tabulazioni e tag HTML.' },
        { q: 'Cosa fa l\'opzione numeri di riga?', a: 'Quando attivata, ogni ripetizione è preceduta da un numero sequenziale (1., 2., 3., ecc.). Questo è utile per creare elenchi numerati o tracciare le singole voci nell\'output.' },
        { q: 'Come funziona l\'opzione inverti testo?', a: 'L\'opzione inverti testo specchia ogni carattere dell\'input prima di ripetere. Ad esempio, "Ciao" diventa "oaiC". Viene applicata a ogni istanza ripetuta, non all\'ordine complessivo dell\'output.' },
        { q: 'Il mio testo viene salvato o inviato a un server?', a: 'No. Tutta l\'elaborazione avviene interamente nel tuo browser tramite JavaScript. Il tuo testo non lascia mai il tuo dispositivo, garantendo completa privacy e sicurezza.' },
        { q: 'Come ripetere un testo più volte?', a: 'È semplicissimo: incolla o digita il testo nel campo di input, imposta il numero di ripetizioni desiderato (da 1 a 10.000) e il testo verrà duplicato automaticamente nel campo risultato. Puoi scegliere il separatore tra ogni ripetizione e poi copiare tutto con un clic.' },
        { q: 'Qual è il miglior ripetitore di parole online?', a: 'Il nostro ripetitore di parole online è uno dei più completi disponibili: supporta fino a 10.000 ripetizioni, separatori personalizzati, numeri di riga e inversione del testo. Funziona gratis, senza registrazione e senza pubblicità invasive, direttamente nel tuo browser.' },
        { q: 'Come copiare un testo ripetuto?', a: 'Dopo aver generato il testo ripetuto, clicca sul pulsante "Copia negli Appunti" sotto il campo risultato. Il testo verrà copiato automaticamente e potrai incollarlo ovunque: in un documento, un\'email, un editor di codice o qualsiasi altra applicazione.' },
      ],
    },
    es: {
      title: 'Repetidor de Texto Online Gratis — Repite Texto al Instante',
      paragraphs: [
        '¿Necesitas repetir una palabra, frase o párrafo cientos de veces? Nuestro repetidor de texto online gratuito te permite duplicar cualquier texto hasta 10.000 veces con un solo clic. Ya sea para crear datos de prueba, contenido de relleno o patrones repetitivos, esta herramienta ahorra horas de copiar y pegar manual.',
        'El repetidor de texto ofrece opciones flexibles de separadores, incluyendo nuevas líneas, espacios, comas o cualquier delimitador personalizado. También puedes agregar números de línea secuenciales a cada repetición, facilitando el seguimiento de entradas individuales. La opción de invertir texto te permite reflejar tu entrada antes de repetir.',
        'Los desarrolladores usan frecuentemente repetidores de texto para generar datos de muestra, llenar campos de bases de datos o crear entradas de prueba para validación de formularios. Los creadores de contenido confían en el texto repetido para maquetas visuales y pruebas de diseño. Los estudiantes lo usan para llenar plantillas y generar material de práctica.',
        'Todo el procesamiento ocurre en tu navegador — tu texto nunca se sube a ningún servidor. El conteo en tiempo real de caracteres y palabras te ayuda a monitorear el tamaño del resultado. Los presets rápidos de 10, 50, 100 y 500 repeticiones te permiten saltar a cantidades comunes al instante.',
      ],
      faq: [
        { q: '¿Cuál es el número máximo de repeticiones?', a: 'Puedes repetir texto hasta 10.000 veces. Para resultados muy grandes, tu navegador puede tardar un momento en renderizar, pero todo el procesamiento ocurre localmente en tu dispositivo.' },
        { q: '¿Puedo usar separadores personalizados entre repeticiones?', a: 'Sí. Elige entre nueva línea, espacio, coma o ingresa cualquier cadena de separación personalizada. Separadores comunes incluyen punto y coma, barras (|), tabulaciones y etiquetas HTML.' },
        { q: '¿Qué hace la opción de números de línea?', a: 'Cuando está activada, cada repetición se precede con un número secuencial (1., 2., 3., etc.). Esto es útil para crear listas numeradas o rastrear entradas individuales en el resultado.' },
        { q: '¿Cómo funciona la opción de invertir texto?', a: 'La opción de invertir texto refleja cada carácter de tu entrada antes de repetir. Por ejemplo, "Hola" se convierte en "aloH". Se aplica a cada instancia repetida, no al orden general del resultado.' },
        { q: '¿Mi texto se almacena o se envía a un servidor?', a: 'No. Todo el procesamiento ocurre completamente en tu navegador usando JavaScript. Tu texto nunca sale de tu dispositivo, garantizando privacidad y seguridad total.' },
      ],
    },
    fr: {
      title: 'Répéteur de Texte en Ligne Gratuit — Répétez du Texte Instantanément',
      paragraphs: [
        'Besoin de répéter un mot, une phrase ou un paragraphe des centaines de fois ? Notre répéteur de texte en ligne gratuit vous permet de dupliquer n\'importe quel texte jusqu\'à 10 000 fois en un seul clic. Que vous créiez des données de test, du contenu provisoire ou des motifs répétitifs, cet outil vous fait gagner des heures de copier-coller manuel.',
        'Le répéteur de texte offre des options flexibles de séparateurs, y compris les nouvelles lignes, espaces, virgules ou tout délimiteur personnalisé. Vous pouvez également ajouter des numéros de ligne séquentiels à chaque répétition, facilitant le suivi des entrées individuelles. L\'option d\'inversion de texte vous permet de refléter votre saisie avant la répétition.',
        'Les développeurs utilisent fréquemment les répéteurs de texte pour générer des données d\'exemple, remplir des champs de base de données ou créer des entrées de test pour la validation de formulaires. Les créateurs de contenu s\'appuient sur le texte répété pour les maquettes visuelles et les prototypes de design. Les étudiants l\'utilisent pour remplir des modèles.',
        'Tout le traitement se fait dans votre navigateur — votre texte n\'est jamais envoyé à un serveur. Le comptage en temps réel des caractères et mots vous aide à surveiller la taille du résultat. Les préréglages rapides de 10, 50, 100 et 500 répétitions vous permettent d\'accéder instantanément aux quantités courantes.',
      ],
      faq: [
        { q: 'Quel est le nombre maximum de répétitions ?', a: 'Vous pouvez répéter du texte jusqu\'à 10 000 fois. Pour des résultats très volumineux, votre navigateur peut prendre un moment pour afficher, mais tout le traitement se fait localement sur votre appareil.' },
        { q: 'Puis-je utiliser des séparateurs personnalisés entre les répétitions ?', a: 'Oui. Choisissez entre nouvelle ligne, espace, virgule ou entrez n\'importe quelle chaîne de séparation personnalisée. Les séparateurs courants incluent le point-virgule, les barres (|), les tabulations et les balises HTML.' },
        { q: 'Que fait l\'option numéros de ligne ?', a: 'Lorsqu\'elle est activée, chaque répétition est préfixée d\'un numéro séquentiel (1., 2., 3., etc.). C\'est utile pour créer des listes numérotées ou suivre les entrées individuelles dans le résultat.' },
        { q: 'Comment fonctionne l\'option d\'inversion de texte ?', a: 'L\'option d\'inversion reflète chaque caractère de votre saisie avant de répéter. Par exemple, "Bonjour" devient "ruojnoB". Cela s\'applique à chaque instance répétée, pas à l\'ordre global du résultat.' },
        { q: 'Mon texte est-il stocké ou envoyé à un serveur ?', a: 'Non. Tout le traitement se fait entièrement dans votre navigateur via JavaScript. Votre texte ne quitte jamais votre appareil, garantissant une confidentialité et une sécurité totales.' },
      ],
    },
    de: {
      title: 'Kostenloser Online-Textwiederholer — Text Sofort Wiederholen',
      paragraphs: [
        'Müssen Sie ein Wort, einen Satz oder einen Absatz hundertfach wiederholen? Unser kostenloser Online-Textwiederholer ermöglicht es Ihnen, jeden Text bis zu 10.000 Mal mit einem Klick zu duplizieren. Ob Sie Testdaten erstellen, Platzhalterinhalte generieren oder repetitive Muster erzeugen — dieses Tool spart Stunden manuellen Kopierens.',
        'Der Textwiederholer bietet flexible Trennzeichenoptionen, darunter neue Zeilen, Leerzeichen, Kommas oder beliebige benutzerdefinierte Trennzeichen. Sie können auch sequenzielle Zeilennummern zu jeder Wiederholung hinzufügen, um einzelne Einträge leicht zu verfolgen. Die Textumkehr-Option spiegelt Ihre Eingabe vor der Wiederholung.',
        'Entwickler verwenden Textwiederholer häufig, um Beispieldaten zu generieren, Datenbankfelder zu füllen oder Testeingaben für Formularvalidierungen zu erstellen. Content-Ersteller nutzen wiederholten Text für visuelle Mockups und Design-Prototypen. Studenten verwenden es zum Ausfüllen von Vorlagen und zum Generieren von Übungsmaterial.',
        'Die gesamte Verarbeitung erfolgt in Ihrem Browser — Ihr Text wird niemals auf einen Server hochgeladen. Die Echtzeit-Zeichen- und Wortzählung hilft Ihnen, die Ausgabegröße zu überwachen. Schnellvorlagen für 10, 50, 100 und 500 Wiederholungen ermöglichen sofortigen Zugriff auf gängige Mengen.',
      ],
      faq: [
        { q: 'Wie oft kann Text maximal wiederholt werden?', a: 'Sie können Text bis zu 10.000 Mal wiederholen. Bei sehr großen Ausgaben benötigt Ihr Browser möglicherweise einen Moment zum Rendern, aber die gesamte Verarbeitung erfolgt lokal auf Ihrem Gerät.' },
        { q: 'Kann ich benutzerdefinierte Trennzeichen verwenden?', a: 'Ja. Wählen Sie zwischen neuer Zeile, Leerzeichen, Komma oder geben Sie eine beliebige benutzerdefinierte Trennzeichenfolge ein. Gängige Trennzeichen sind Semikolons, Pipes (|), Tabulatoren und HTML-Tags.' },
        { q: 'Was bewirkt die Zeilennummern-Option?', a: 'Wenn aktiviert, wird jeder Wiederholung eine fortlaufende Nummer vorangestellt (1., 2., 3., usw.). Dies ist nützlich für nummerierte Listen oder zum Verfolgen einzelner Einträge in der Ausgabe.' },
        { q: 'Wie funktioniert die Textumkehr-Option?', a: 'Die Textumkehr-Option spiegelt jedes Zeichen Ihrer Eingabe vor dem Wiederholen. Zum Beispiel wird "Hallo" zu "ollaH". Dies wird auf jede wiederholte Instanz angewendet, nicht auf die Gesamtreihenfolge.' },
        { q: 'Wird mein Text gespeichert oder an einen Server gesendet?', a: 'Nein. Die gesamte Verarbeitung erfolgt vollständig in Ihrem Browser mittels JavaScript. Ihr Text verlässt niemals Ihr Gerät, was vollständige Privatsphäre und Sicherheit gewährleistet.' },
      ],
    },
    pt: {
      title: 'Repetidor de Texto Online Grátis — Repita Texto Instantaneamente',
      paragraphs: [
        'Precisa repetir uma palavra, frase ou parágrafo centenas de vezes? Nosso repetidor de texto online gratuito permite duplicar qualquer texto até 10.000 vezes com um único clique. Seja para criar dados de teste, conteúdo provisório ou padrões repetitivos, esta ferramenta economiza horas de copiar e colar manual.',
        'O repetidor de texto oferece opções flexíveis de separadores, incluindo novas linhas, espaços, vírgulas ou qualquer delimitador personalizado. Você também pode adicionar números de linha sequenciais a cada repetição, facilitando o rastreamento de entradas individuais. A opção de inverter texto permite espelhar sua entrada antes de repetir.',
        'Desenvolvedores frequentemente usam repetidores de texto para gerar dados de amostra, preencher campos de banco de dados ou criar entradas de teste para validação de formulários. Criadores de conteúdo confiam em texto repetido para mockups visuais e protótipos de design. Estudantes usam para preencher modelos e gerar material de prática.',
        'Todo o processamento acontece no seu navegador — seu texto nunca é enviado para nenhum servidor. A contagem em tempo real de caracteres e palavras ajuda a monitorar o tamanho da saída. Os presets rápidos de 10, 50, 100 e 500 repetições permitem acessar quantidades comuns instantaneamente.',
      ],
      faq: [
        { q: 'Qual é o número máximo de repetições?', a: 'Você pode repetir texto até 10.000 vezes. Para saídas muito grandes, seu navegador pode levar um momento para renderizar, mas todo o processamento acontece localmente no seu dispositivo.' },
        { q: 'Posso usar separadores personalizados entre as repetições?', a: 'Sim. Escolha entre nova linha, espaço, vírgula ou insira qualquer string de separação personalizada. Separadores comuns incluem ponto e vírgula, barras (|), tabulações e tags HTML.' },
        { q: 'O que faz a opção de números de linha?', a: 'Quando ativada, cada repetição é precedida por um número sequencial (1., 2., 3., etc.). Isso é útil para criar listas numeradas ou rastrear entradas individuais na saída.' },
        { q: 'Como funciona a opção de inverter texto?', a: 'A opção de inverter texto espelha cada caractere da sua entrada antes de repetir. Por exemplo, "Olá" se torna "álO". Isso é aplicado a cada instância repetida, não à ordem geral da saída.' },
        { q: 'Meu texto é armazenado ou enviado para um servidor?', a: 'Não. Todo o processamento acontece inteiramente no seu navegador usando JavaScript. Seu texto nunca sai do seu dispositivo, garantindo privacidade e segurança total.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="text-repeater" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Input Textarea */}
        <label className="block text-sm font-medium text-gray-700 mb-1">{labels.inputPlaceholder[lang]}</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={labels.inputPlaceholder[lang]}
          className="w-full h-32 border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y mb-4"
        />

        {/* Repeat Count */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">{labels.repeatCount[lang]}</label>
          <input
            type="number"
            min={1}
            max={10000}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(10000, Number(e.target.value) || 1)))}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Quick Presets */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{labels.presets[lang]}</label>
          <div className="flex gap-2">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => setCount(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${count === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {p}x
              </button>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{labels.separator[lang]}</label>
          <div className="flex flex-wrap gap-2">
            {(['newline', 'space', 'comma', 'custom'] as SeparatorType[]).map((sep) => (
              <button
                key={sep}
                onClick={() => setSeparator(sep)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${separator === sep ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {labels[sep][lang]}
              </button>
            ))}
          </div>
          {separator === 'custom' && (
            <input
              type="text"
              value={customSeparator}
              onChange={(e) => setCustomSeparator(e.target.value)}
              placeholder={labels.customSep[lang]}
              className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>

        {/* Options */}
        <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">{labels.options[lang]}</label>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={addLineNumbers}
                onChange={(e) => setAddLineNumbers(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{labels.lineNumbers[lang]}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={reverseText}
                onChange={(e) => setReverseText(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{labels.reverse[lang]}</span>
            </label>
          </div>
        </div>

        {/* Output Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-700">{outputChars.toLocaleString()}</div>
            <div className="text-xs text-gray-500">{labels.characters[lang]}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-700">{outputWords.toLocaleString()}</div>
            <div className="text-xs text-gray-500">{labels.words[lang]}</div>
          </div>
        </div>

        {/* Output Textarea */}
        <label className="block text-sm font-medium text-gray-700 mb-1">{labels.output[lang]}</label>
        <textarea
          value={output}
          readOnly
          className="w-full h-48 border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50 resize-y mb-4"
        />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            disabled={!output}
            className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? labels.copied[lang] : labels.copy[lang]}
          </button>
          <button
            onClick={handleClear}
            className="bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            {labels.clear[lang]}
          </button>
        </div>

        {/* SEO Article */}
        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: p }} />)}
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