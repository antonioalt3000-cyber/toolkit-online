'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function LineCounter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['line-counter'][lang];
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Line calculations
  const lines = text.length === 0 ? [] : text.split('\n');
  const totalLines = text.length === 0 ? 0 : lines.length;
  const blankLines = lines.filter((l) => l.trim() === '').length;
  const nonBlankLines = totalLines - blankLines;
  const longestLine = totalLines > 0 ? lines.reduce((a, b) => a.length >= b.length ? a : b, '') : '';
  const longestLineLength = longestLine.length;
  const shortestLine = nonBlankLines > 0 ? lines.filter((l) => l.trim() !== '').reduce((a, b) => a.length <= b.length ? a : b, lines.find((l) => l.trim() !== '') || '') : '';
  const shortestLineLength = nonBlankLines > 0 ? shortestLine.length : 0;
  const avgLineLength = nonBlankLines > 0
    ? (lines.filter((l) => l.trim() !== '').reduce((sum, l) => sum + l.length, 0) / nonBlankLines).toFixed(1)
    : '0';

  const labels: Record<string, Record<Locale, string>> = {
    totalLines: { en: 'Total Lines', it: 'Righe Totali', es: 'Líneas Totales', fr: 'Lignes Totales', de: 'Gesamtzeilen', pt: 'Linhas Totais' },
    blankLines: { en: 'Blank Lines', it: 'Righe Vuote', es: 'Líneas Vacías', fr: 'Lignes Vides', de: 'Leerzeilen', pt: 'Linhas Vazias' },
    nonBlankLines: { en: 'Non-Blank Lines', it: 'Righe Non Vuote', es: 'Líneas No Vacías', fr: 'Lignes Non Vides', de: 'Nicht-Leerzeilen', pt: 'Linhas Não Vazias' },
    longestLine: { en: 'Longest Line', it: 'Riga Più Lunga', es: 'Línea Más Larga', fr: 'Ligne la Plus Longue', de: 'Längste Zeile', pt: 'Linha Mais Longa' },
    shortestLine: { en: 'Shortest Line', it: 'Riga Più Corta', es: 'Línea Más Corta', fr: 'Ligne la Plus Courte', de: 'Kürzeste Zeile', pt: 'Linha Mais Curta' },
    avgLength: { en: 'Avg. Line Length', it: 'Lungh. Media Riga', es: 'Long. Media Línea', fr: 'Long. Moy. Ligne', de: 'Durchschn. Zeilenlänge', pt: 'Comp. Médio Linha' },
    chars: { en: 'chars', it: 'car.', es: 'car.', fr: 'car.', de: 'Zeichen', pt: 'car.' },
    placeholder: { en: 'Type or paste your text here...', it: 'Scrivi o incolla il tuo testo qui...', es: 'Escribe o pega tu texto aquí...', fr: 'Tapez ou collez votre texte ici...', de: 'Geben Sie Ihren Text hier ein...', pt: 'Digite ou cole seu texto aqui...' },
    copyResults: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier Résultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
    copiedMsg: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
    reset: { en: 'Reset', it: 'Cancella', es: 'Borrar', fr: 'Effacer', de: 'Zurücksetzen', pt: 'Limpar' },
    emptyError: { en: 'Please enter some text first.', it: 'Inserisci prima del testo.', es: 'Por favor, ingresa texto primero.', fr: 'Veuillez d\'abord saisir du texte.', de: 'Bitte geben Sie zuerst einen Text ein.', pt: 'Por favor, insira algum texto primeiro.' },
    linePreview: { en: 'Line Preview', it: 'Anteprima Riga', es: 'Vista Previa de Línea', fr: 'Aperçu de Ligne', de: 'Zeilenvorschau', pt: 'Pré-visualização da Linha' },
  };

  const handleCopy = async () => {
    if (!text.trim()) {
      setError(labels.emptyError[lang]);
      setTimeout(() => setError(''), 3000);
      return;
    }
    setError('');
    const stats = [
      `${labels.totalLines[lang]}: ${totalLines}`,
      `${labels.blankLines[lang]}: ${blankLines}`,
      `${labels.nonBlankLines[lang]}: ${nonBlankLines}`,
      `${labels.longestLine[lang]}: ${longestLineLength} ${labels.chars[lang]}`,
      `${labels.shortestLine[lang]}: ${shortestLineLength} ${labels.chars[lang]}`,
      `${labels.avgLength[lang]}: ${avgLineLength} ${labels.chars[lang]}`,
    ].join('\n');
    await navigator.clipboard.writeText(stats);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setText('');
    setError('');
    setCopied(false);
  };

  const cardData = [
    { label: labels.totalLines[lang], value: totalLines, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    { label: labels.blankLines[lang], value: blankLines, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    { label: labels.nonBlankLines[lang], value: nonBlankLines, bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  ];

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Online Line Counter Tool – Count Lines, Blank Lines & More',
      paragraphs: [
        'Whether you are a developer reviewing a log file, a writer organizing a manuscript, or a data analyst inspecting CSV exports, knowing how many lines your text contains is surprisingly useful. Our free online line counter provides instant, accurate statistics about every line in your text the moment you paste or type it.',
        'Beyond simple line counting, this tool distinguishes between blank and non-blank lines, identifies the longest and shortest lines by character count, and calculates the average line length across all non-empty lines. These metrics help you spot formatting issues, enforce coding style guidelines, and optimize content for readability.',
        'Developers often need to count lines of code (LOC) to estimate project complexity or meet code-review requirements. This line counter handles any text — source code, configuration files, markdown documents, plain text, or structured data — without requiring any installation or sign-up.',
        'Average line length is a key metric in code quality. Many style guides recommend keeping lines under 80 or 120 characters. Use this tool to quickly check whether your files comply with line-length limits before committing code to your repository.',
      ],
      faq: [
        { q: 'How does the line counter split lines?', a: 'The tool splits text on newline characters (\\n). Each segment, including empty ones, counts as a line. This is consistent with how most text editors and IDEs count lines.' },
        { q: 'Are trailing newlines counted as an extra line?', a: 'Yes. A trailing newline at the end of your text creates an additional empty line, just like in Unix-style text files. This matches the behavior of commands like wc -l.' },
        { q: 'What counts as a blank line?', a: 'A blank line is any line that contains no characters or only whitespace (spaces, tabs). Lines with visible content — even a single character — are counted as non-blank.' },
        { q: 'How is average line length calculated?', a: 'Average line length is calculated by summing the character count of all non-blank lines and dividing by the number of non-blank lines. Blank lines are excluded to give you a more meaningful average.' },
        { q: 'Is my text stored or sent to a server?', a: 'No. All processing happens entirely in your browser using JavaScript. Your text never leaves your device, ensuring complete privacy.' },
      ],
    },
    it: {
      title: 'Contatore di Righe Online Gratuito – Conta Righe, Righe Vuote e Altro',
      paragraphs: [
        'Che tu sia uno sviluppatore che analizza un file di log, uno scrittore che organizza un manoscritto o un analista di dati che ispeziona esportazioni CSV, sapere quante righe contiene il tuo testo è sorprendentemente utile. Il nostro contatore di righe online gratuito fornisce statistiche istantanee e accurate su ogni riga del testo nel momento in cui lo incolli o digiti.',
        'Oltre al semplice conteggio delle righe, questo strumento distingue tra righe vuote e non vuote, identifica la riga più lunga e più corta per numero di caratteri, e calcola la lunghezza media delle righe su tutte le righe non vuote. Queste metriche aiutano a individuare problemi di formattazione e ottimizzare la leggibilità.',
        'Gli sviluppatori spesso hanno bisogno di contare le righe di codice (LOC) per stimare la complessità del progetto o soddisfare requisiti di revisione del codice. Questo contatore gestisce qualsiasi testo — codice sorgente, file di configurazione, documenti markdown, testo semplice o dati strutturati — senza richiedere installazione o registrazione.',
        'La lunghezza media delle righe è una metrica chiave nella qualità del codice. Molte guide di stile raccomandano di mantenere le righe sotto gli 80 o 120 caratteri. Usa questo strumento per verificare rapidamente se i tuoi file rispettano i limiti di lunghezza prima di fare commit.',
      ],
      faq: [
        { q: 'Come divide le righe il contatore?', a: 'Lo strumento divide il testo sui caratteri di nuova riga (\\n). Ogni segmento, compresi quelli vuoti, conta come una riga. Questo è coerente con come la maggior parte degli editor di testo e IDE contano le righe.' },
        { q: 'I ritorni a capo finali vengono contati come riga extra?', a: 'Sì. Un ritorno a capo finale alla fine del testo crea una riga vuota aggiuntiva, proprio come nei file di testo in stile Unix.' },
        { q: 'Cosa si intende per riga vuota?', a: 'Una riga vuota è qualsiasi riga che non contiene caratteri o contiene solo spazi bianchi (spazi, tabulazioni). Le righe con contenuto visibile — anche un singolo carattere — sono contate come non vuote.' },
        { q: 'Come viene calcolata la lunghezza media delle righe?', a: 'La lunghezza media viene calcolata sommando il conteggio dei caratteri di tutte le righe non vuote e dividendo per il numero di righe non vuote. Le righe vuote sono escluse per fornire una media più significativa.' },
        { q: 'Il mio testo viene salvato o inviato a un server?', a: 'No. Tutta l\'elaborazione avviene interamente nel tuo browser tramite JavaScript. Il tuo testo non lascia mai il tuo dispositivo, garantendo completa privacy.' },
      ],
    },
    es: {
      title: 'Contador de Líneas Online Gratis – Cuenta Líneas, Líneas Vacías y Más',
      paragraphs: [
        'Ya seas un desarrollador revisando un archivo de log, un escritor organizando un manuscrito o un analista de datos inspeccionando exportaciones CSV, saber cuántas líneas contiene tu texto es sorprendentemente útil. Nuestro contador de líneas online gratuito proporciona estadísticas instantáneas y precisas sobre cada línea de tu texto en el momento en que lo pegas o escribes.',
        'Más allá del simple conteo de líneas, esta herramienta distingue entre líneas vacías y no vacías, identifica la línea más larga y más corta por cantidad de caracteres, y calcula la longitud promedio de las líneas en todas las líneas no vacías. Estas métricas ayudan a detectar problemas de formato y optimizar la legibilidad.',
        'Los desarrolladores a menudo necesitan contar líneas de código (LOC) para estimar la complejidad del proyecto o cumplir con requisitos de revisión de código. Este contador maneja cualquier texto — código fuente, archivos de configuración, documentos markdown, texto plano o datos estructurados — sin requerir instalación o registro.',
        'La longitud promedio de línea es una métrica clave en la calidad del código. Muchas guías de estilo recomiendan mantener las líneas por debajo de 80 o 120 caracteres. Usa esta herramienta para verificar rápidamente si tus archivos cumplen con los límites de longitud antes de hacer commit.',
      ],
      faq: [
        { q: '¿Cómo divide las líneas el contador?', a: 'La herramienta divide el texto en caracteres de nueva línea (\\n). Cada segmento, incluidos los vacíos, cuenta como una línea. Esto es consistente con cómo la mayoría de editores de texto e IDEs cuentan las líneas.' },
        { q: '¿Los saltos de línea finales se cuentan como una línea extra?', a: 'Sí. Un salto de línea final al final del texto crea una línea vacía adicional, tal como en los archivos de texto estilo Unix.' },
        { q: '¿Qué cuenta como línea vacía?', a: 'Una línea vacía es cualquier línea que no contiene caracteres o solo contiene espacios en blanco (espacios, tabulaciones). Las líneas con contenido visible — incluso un solo carácter — se cuentan como no vacías.' },
        { q: '¿Cómo se calcula la longitud promedio de línea?', a: 'La longitud promedio se calcula sumando el conteo de caracteres de todas las líneas no vacías y dividiendo por el número de líneas no vacías. Las líneas vacías se excluyen para proporcionar un promedio más significativo.' },
        { q: '¿Mi texto se almacena o se envía a un servidor?', a: 'No. Todo el procesamiento ocurre completamente en tu navegador usando JavaScript. Tu texto nunca sale de tu dispositivo, garantizando privacidad total.' },
      ],
    },
    fr: {
      title: 'Compteur de Lignes en Ligne Gratuit – Comptez Lignes, Lignes Vides et Plus',
      paragraphs: [
        'Que vous soyez un développeur examinant un fichier de log, un écrivain organisant un manuscrit ou un analyste de données inspectant des exports CSV, savoir combien de lignes contient votre texte est étonnamment utile. Notre compteur de lignes en ligne gratuit fournit des statistiques instantanées et précises sur chaque ligne de votre texte dès que vous le collez ou le tapez.',
        'Au-delà du simple comptage de lignes, cet outil distingue les lignes vides des lignes non vides, identifie la ligne la plus longue et la plus courte par nombre de caractères, et calcule la longueur moyenne des lignes sur toutes les lignes non vides. Ces métriques aident à repérer les problèmes de formatage et à optimiser la lisibilité.',
        'Les développeurs ont souvent besoin de compter les lignes de code (LOC) pour estimer la complexité d\'un projet ou satisfaire les exigences de revue de code. Ce compteur gère tout type de texte — code source, fichiers de configuration, documents markdown, texte brut ou données structurées — sans nécessiter d\'installation ni d\'inscription.',
        'La longueur moyenne des lignes est une métrique clé de la qualité du code. De nombreux guides de style recommandent de garder les lignes en dessous de 80 ou 120 caractères. Utilisez cet outil pour vérifier rapidement si vos fichiers respectent les limites de longueur avant de commiter.',
      ],
      faq: [
        { q: 'Comment le compteur sépare-t-il les lignes ?', a: 'L\'outil divise le texte sur les caractères de nouvelle ligne (\\n). Chaque segment, y compris les vides, compte comme une ligne. C\'est cohérent avec la façon dont la plupart des éditeurs de texte et IDE comptent les lignes.' },
        { q: 'Les retours à la ligne finaux sont-ils comptés comme une ligne supplémentaire ?', a: 'Oui. Un retour à la ligne final à la fin de votre texte crée une ligne vide supplémentaire, comme dans les fichiers texte de style Unix.' },
        { q: 'Qu\'est-ce qui compte comme ligne vide ?', a: 'Une ligne vide est toute ligne qui ne contient aucun caractère ou uniquement des espaces blancs (espaces, tabulations). Les lignes avec du contenu visible — même un seul caractère — sont comptées comme non vides.' },
        { q: 'Comment la longueur moyenne des lignes est-elle calculée ?', a: 'La longueur moyenne est calculée en additionnant le nombre de caractères de toutes les lignes non vides et en divisant par le nombre de lignes non vides. Les lignes vides sont exclues pour fournir une moyenne plus significative.' },
        { q: 'Mon texte est-il stocké ou envoyé à un serveur ?', a: 'Non. Tout le traitement se fait entièrement dans votre navigateur via JavaScript. Votre texte ne quitte jamais votre appareil, garantissant une confidentialité totale.' },
      ],
    },
    de: {
      title: 'Kostenloser Online-Zeilenzähler – Zeilen, Leerzeilen und Mehr Zählen',
      paragraphs: [
        'Ob Sie ein Entwickler sind, der eine Log-Datei überprüft, ein Autor, der ein Manuskript organisiert, oder ein Datenanalyst, der CSV-Exporte inspiziert – zu wissen, wie viele Zeilen Ihr Text enthält, ist überraschend nützlich. Unser kostenloser Online-Zeilenzähler liefert sofortige, genaue Statistiken über jede Zeile Ihres Textes, sobald Sie ihn einfügen oder eingeben.',
        'Über die einfache Zeilenzählung hinaus unterscheidet dieses Tool zwischen leeren und nicht-leeren Zeilen, identifiziert die längste und kürzeste Zeile nach Zeichenanzahl und berechnet die durchschnittliche Zeilenlänge über alle nicht-leeren Zeilen. Diese Metriken helfen Ihnen, Formatierungsprobleme zu erkennen und die Lesbarkeit zu optimieren.',
        'Entwickler müssen oft Codezeilen (LOC) zählen, um die Projektkomplexität zu schätzen oder Code-Review-Anforderungen zu erfüllen. Dieser Zeilenzähler verarbeitet jeden Text — Quellcode, Konfigurationsdateien, Markdown-Dokumente, Klartext oder strukturierte Daten — ohne Installation oder Anmeldung.',
        'Die durchschnittliche Zeilenlänge ist eine Schlüsselmetrik für die Codequalität. Viele Styleguides empfehlen, Zeilen unter 80 oder 120 Zeichen zu halten. Nutzen Sie dieses Tool, um schnell zu prüfen, ob Ihre Dateien die Zeilenlängengrenzen einhalten, bevor Sie Code committen.',
      ],
      faq: [
        { q: 'Wie teilt der Zeilenzähler die Zeilen auf?', a: 'Das Tool teilt den Text an Zeilenumbruchzeichen (\\n). Jedes Segment, einschließlich leerer, zählt als eine Zeile. Dies ist konsistent mit der Art, wie die meisten Texteditoren und IDEs Zeilen zählen.' },
        { q: 'Werden abschließende Zeilenumbrüche als zusätzliche Zeile gezählt?', a: 'Ja. Ein abschließender Zeilenumbruch am Ende Ihres Textes erzeugt eine zusätzliche leere Zeile, genau wie bei Unix-Textdateien.' },
        { q: 'Was zählt als Leerzeile?', a: 'Eine Leerzeile ist jede Zeile, die keine Zeichen enthält oder nur Leerzeichen (Spaces, Tabs). Zeilen mit sichtbarem Inhalt — selbst ein einzelnes Zeichen — werden als nicht-leer gezählt.' },
        { q: 'Wie wird die durchschnittliche Zeilenlänge berechnet?', a: 'Die durchschnittliche Zeilenlänge wird berechnet, indem die Zeichenanzahl aller nicht-leeren Zeilen addiert und durch die Anzahl der nicht-leeren Zeilen geteilt wird. Leerzeilen werden ausgeschlossen, um einen aussagekräftigeren Durchschnitt zu liefern.' },
        { q: 'Wird mein Text gespeichert oder an einen Server gesendet?', a: 'Nein. Die gesamte Verarbeitung erfolgt vollständig in Ihrem Browser mittels JavaScript. Ihr Text verlässt niemals Ihr Gerät, was vollständige Privatsphäre gewährleistet.' },
      ],
    },
    pt: {
      title: 'Contador de Linhas Online Grátis – Conte Linhas, Linhas Vazias e Mais',
      paragraphs: [
        'Seja você um desenvolvedor revisando um arquivo de log, um escritor organizando um manuscrito ou um analista de dados inspecionando exportações CSV, saber quantas linhas seu texto contém é surpreendentemente útil. Nosso contador de linhas online gratuito fornece estatísticas instantâneas e precisas sobre cada linha do seu texto no momento em que você cola ou digita.',
        'Além da simples contagem de linhas, esta ferramenta distingue entre linhas vazias e não vazias, identifica a linha mais longa e mais curta por contagem de caracteres, e calcula o comprimento médio das linhas em todas as linhas não vazias. Essas métricas ajudam a identificar problemas de formatação e otimizar a legibilidade.',
        'Desenvolvedores frequentemente precisam contar linhas de código (LOC) para estimar a complexidade do projeto ou atender requisitos de revisão de código. Este contador lida com qualquer texto — código-fonte, arquivos de configuração, documentos markdown, texto simples ou dados estruturados — sem exigir instalação ou cadastro.',
        'O comprimento médio das linhas é uma métrica chave na qualidade do código. Muitos guias de estilo recomendam manter as linhas abaixo de 80 ou 120 caracteres. Use esta ferramenta para verificar rapidamente se seus arquivos cumprem os limites de comprimento antes de fazer commit.',
      ],
      faq: [
        { q: 'Como o contador separa as linhas?', a: 'A ferramenta divide o texto nos caracteres de nova linha (\\n). Cada segmento, incluindo os vazios, conta como uma linha. Isso é consistente com como a maioria dos editores de texto e IDEs contam as linhas.' },
        { q: 'Quebras de linha finais são contadas como uma linha extra?', a: 'Sim. Uma quebra de linha final no fim do seu texto cria uma linha vazia adicional, assim como em arquivos de texto estilo Unix.' },
        { q: 'O que conta como linha vazia?', a: 'Uma linha vazia é qualquer linha que não contém caracteres ou contém apenas espaços em branco (espaços, tabulações). Linhas com conteúdo visível — mesmo um único caractere — são contadas como não vazias.' },
        { q: 'Como o comprimento médio das linhas é calculado?', a: 'O comprimento médio é calculado somando a contagem de caracteres de todas as linhas não vazias e dividindo pelo número de linhas não vazias. Linhas vazias são excluídas para fornecer uma média mais significativa.' },
        { q: 'Meu texto é armazenado ou enviado para um servidor?', a: 'Não. Todo o processamento acontece inteiramente no seu navegador usando JavaScript. Seu texto nunca sai do seu dispositivo, garantindo privacidade total.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="line-counter" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Result Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {cardData.map((stat) => (
            <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-lg p-3 text-center`}>
              <div className={`text-2xl font-bold ${stat.text}`}>{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setError(''); }}
          placeholder={labels.placeholder[lang]}
          className="w-full h-64 border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono"
        />

        {/* Error message */}
        {error && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleCopy}
            className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {copied ? labels.copiedMsg[lang] : labels.copyResults[lang]}
          </button>
          <button
            onClick={handleReset}
            className="bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            {labels.reset[lang]}
          </button>
        </div>

        {/* Additional Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">{labels.longestLine[lang]}</div>
            <div className="text-xl font-bold text-indigo-700">{longestLineLength} <span className="text-sm font-normal">{labels.chars[lang]}</span></div>
            {longestLine && (
              <div className="mt-1 text-xs text-gray-400 truncate font-mono" title={longestLine}>{longestLine}</div>
            )}
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">{labels.shortestLine[lang]}</div>
            <div className="text-xl font-bold text-teal-700">{shortestLineLength} <span className="text-sm font-normal">{labels.chars[lang]}</span></div>
            {shortestLine && (
              <div className="mt-1 text-xs text-gray-400 truncate font-mono" title={shortestLine}>{shortestLine}</div>
            )}
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">{labels.avgLength[lang]}</div>
            <div className="text-xl font-bold text-purple-700">{avgLineLength} <span className="text-sm font-normal">{labels.chars[lang]}</span></div>
          </div>
        </div>

        {/* Line Preview */}
        {totalLines > 0 && totalLines <= 200 && (
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-3">{labels.linePreview[lang]}</div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {lines.map((line, i) => (
                <div key={i} className="flex items-start text-sm font-mono">
                  <span className="text-gray-400 w-8 text-right mr-3 select-none flex-shrink-0">{i + 1}</span>
                  <span className={line.trim() === '' ? 'text-gray-300 italic' : 'text-gray-700'}>
                    {line.trim() === '' ? '(blank)' : line}
                  </span>
                </div>
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
