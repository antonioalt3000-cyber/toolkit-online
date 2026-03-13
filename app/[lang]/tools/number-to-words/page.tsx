'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  inputLabel: { en: 'Enter a number', it: 'Inserisci un numero', es: 'Ingresa un número', fr: 'Entrez un nombre', de: 'Geben Sie eine Zahl ein', pt: 'Digite um número' },
  words: { en: 'Words', it: 'Parole', es: 'Palabras', fr: 'Mots', de: 'Wörter', pt: 'Palavras' },
  ordinal: { en: 'Ordinal', it: 'Ordinale', es: 'Ordinal', fr: 'Ordinal', de: 'Ordnungszahl', pt: 'Ordinal' },
  currency: { en: 'Currency', it: 'Valuta', es: 'Moneda', fr: 'Devise', de: 'Währung', pt: 'Moeda' },
  currencyMode: { en: 'Currency Mode', it: 'Modalità Valuta', es: 'Modo Moneda', fr: 'Mode Devise', de: 'Währungsmodus', pt: 'Modo Moeda' },
  copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  history: { en: 'History', it: 'Cronologia', es: 'Historial', fr: 'Historique', de: 'Verlauf', pt: 'Histórico' },
  clearHistory: { en: 'Clear', it: 'Cancella', es: 'Borrar', fr: 'Effacer', de: 'Löschen', pt: 'Limpar' },
  convert: { en: 'Convert', it: 'Converti', es: 'Convertir', fr: 'Convertir', de: 'Konvertieren', pt: 'Converter' },
  reset: { en: 'Reset', it: 'Reimposta', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  invalidNumber: { en: 'Please enter a valid number', it: 'Inserisci un numero valido', es: 'Ingresa un número válido', fr: 'Entrez un nombre valide', de: 'Bitte geben Sie eine gültige Zahl ein', pt: 'Digite um número válido' },
  tooLarge: { en: 'Number too large (max: trillions)', it: 'Numero troppo grande (max: bilioni)', es: 'Número muy grande (máx: billones)', fr: 'Nombre trop grand (max: billions)', de: 'Zahl zu groß (max: Billionen)', pt: 'Número muito grande (máx: trilhões)' },
};

const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const scales = ['', 'thousand', 'million', 'billion', 'trillion'];

function convertChunk(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? '-' + ones[n % 10] : '');
  return ones[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + convertChunk(n % 100) : '');
}

function numberToWords(num: number): string {
  if (num === 0) return 'zero';
  if (!isFinite(num)) return '';

  let isNegative = false;
  if (num < 0) {
    isNegative = true;
    num = Math.abs(num);
  }

  const intPart = Math.floor(num);
  const decStr = num.toString();
  const dotIndex = decStr.indexOf('.');
  let decimalWords = '';

  if (dotIndex !== -1) {
    const decDigits = decStr.slice(dotIndex + 1);
    const decParts = decDigits.split('').map(d => ones[parseInt(d)] || 'zero');
    decimalWords = ' point ' + decParts.join(' ');
  }

  if (intPart === 0) {
    return (isNegative ? 'negative ' : '') + 'zero' + decimalWords;
  }

  const chunks: string[] = [];
  let remaining = intPart;
  let scaleIndex = 0;

  while (remaining > 0) {
    const chunk = remaining % 1000;
    if (chunk > 0) {
      chunks.unshift(convertChunk(chunk) + (scales[scaleIndex] ? ' ' + scales[scaleIndex] : ''));
    }
    remaining = Math.floor(remaining / 1000);
    scaleIndex++;
  }

  const result = chunks.join(' ');
  return (isNegative ? 'negative ' : '') + result + decimalWords;
}

function toOrdinal(words: string): string {
  const w = words.trim();
  if (!w) return '';

  const irregulars: Record<string, string> = {
    'one': 'first', 'two': 'second', 'three': 'third', 'four': 'fourth',
    'five': 'fifth', 'six': 'sixth', 'seven': 'seventh', 'eight': 'eighth',
    'nine': 'ninth', 'ten': 'tenth', 'eleven': 'eleventh', 'twelve': 'twelfth',
  };

  const parts = w.split(' ');
  const lastWord = parts[parts.length - 1];

  // Handle hyphenated words like twenty-one
  if (lastWord.includes('-')) {
    const hyphenParts = lastWord.split('-');
    const lastPart = hyphenParts[hyphenParts.length - 1];
    if (irregulars[lastPart]) {
      hyphenParts[hyphenParts.length - 1] = irregulars[lastPart];
      parts[parts.length - 1] = hyphenParts.join('-');
      return parts.join(' ');
    }
  }

  if (irregulars[lastWord]) {
    parts[parts.length - 1] = irregulars[lastWord];
    return parts.join(' ');
  }

  if (lastWord.endsWith('y')) {
    parts[parts.length - 1] = lastWord.slice(0, -1) + 'ieth';
    return parts.join(' ');
  }

  parts[parts.length - 1] = lastWord + 'th';
  return parts.join(' ');
}

const currencyData: Record<string, { main: [string, string]; sub: [string, string]; symbol: string }> = {
  USD: { main: ['dollar', 'dollars'], sub: ['cent', 'cents'], symbol: '$' },
  EUR: { main: ['euro', 'euros'], sub: ['cent', 'cents'], symbol: '€' },
  GBP: { main: ['pound', 'pounds'], sub: ['penny', 'pence'], symbol: '£' },
};

function toCurrency(num: number, currency: string): string {
  const cur = currencyData[currency];
  if (!cur) return '';

  const isNeg = num < 0;
  num = Math.abs(num);

  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);

  const mainWord = numberToWords(intPart).replace(/^negative /, '');
  const mainUnit = intPart === 1 ? cur.main[0] : cur.main[1];

  let result = mainWord + ' ' + mainUnit;

  if (decPart > 0) {
    const subWord = numberToWords(decPart);
    const subUnit = decPart === 1 ? cur.sub[0] : cur.sub[1];
    result += ' and ' + subWord + ' ' + subUnit;
  }

  return (isNeg ? 'negative ' : '') + result;
}

interface HistoryEntry {
  input: string;
  words: string;
  timestamp: string;
}

export default function NumberToWords() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['number-to-words'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [input, setInput] = useState('');
  const [wordsResult, setWordsResult] = useState('');
  const [ordinalResult, setOrdinalResult] = useState('');
  const [currencyResult, setCurrencyResult] = useState('');
  const [currencyType, setCurrencyType] = useState('USD');
  const [currencyMode, setCurrencyMode] = useState(false);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('number-to-words-history');
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('number-to-words-history', JSON.stringify(history));
    } catch {}
  }, [history]);

  const handleConvert = () => {
    setError('');
    setCopiedField('');
    const trimmed = input.trim();
    if (!trimmed || isNaN(Number(trimmed))) {
      setError(t('invalidNumber'));
      setWordsResult('');
      setOrdinalResult('');
      setCurrencyResult('');
      return;
    }

    const num = Number(trimmed);
    if (Math.abs(num) > 999_999_999_999_999) {
      setError(t('tooLarge'));
      setWordsResult('');
      setOrdinalResult('');
      setCurrencyResult('');
      return;
    }

    const words = numberToWords(num);
    setWordsResult(words);

    // Ordinal only for positive integers
    if (Number.isInteger(num) && num > 0) {
      setOrdinalResult(toOrdinal(words));
    } else {
      setOrdinalResult('');
    }

    if (currencyMode) {
      setCurrencyResult(toCurrency(num, currencyType));
    } else {
      setCurrencyResult('');
    }

    setHistory(prev => [{
      input: trimmed,
      words,
      timestamp: new Date().toLocaleTimeString(),
    }, ...prev].slice(0, 20));
  };

  const handleReset = () => {
    setInput('');
    setWordsResult('');
    setOrdinalResult('');
    setCurrencyResult('');
    setError('');
    setCopiedField('');
  };

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Number to Words Converter: Complete Guide',
      paragraphs: [
        'Converting numbers to words is a fundamental task in finance, legal documents, education, and everyday communication. Our Number to Words Converter transforms any numeric value — including negative numbers and decimals — into their full English-language written form. Whether you are writing a check, preparing a legal contract, or helping a child learn number names, this tool provides instant, accurate results.',
        'The converter supports numbers up to the trillions, handling everything from simple digits like "5" (five) to complex values like "1,234,567,890" (one billion two hundred thirty-four million five hundred sixty-seven thousand eight hundred ninety). Decimal numbers are expressed digit by digit after the word "point," following standard mathematical convention.',
        'A unique feature is the ordinal mode, which converts numbers into their positional form — for example, 42 becomes "forty-second" and 101 becomes "one hundred first." This is invaluable for rankings, dates, and sequential numbering in formal writing. The tool correctly handles all irregular ordinals (first, second, third, fifth, eighth, ninth, twelfth) and regular formations.',
        'The currency mode formats numbers as monetary values with proper unit names. Select from USD (dollars and cents), EUR (euros and cents), or GBP (pounds and pence). For instance, 123.45 in USD becomes "one hundred twenty-three dollars and forty-five cents." All conversions are saved to local history for easy reference, making this tool practical for accountants, writers, teachers, and students alike.'
      ],
      faq: [
        { q: 'What is the largest number this tool can convert?', a: 'The converter supports numbers up to 999 trillion (999,999,999,999,999). This covers virtually all practical use cases including financial amounts, scientific values, and government budgets.' },
        { q: 'How does the tool handle decimal numbers?', a: 'Decimal digits are read individually after the word "point." For example, 3.14 becomes "three point one four." In currency mode, decimals are converted to the appropriate subunit (cents, pence).' },
        { q: 'What is the ordinal form and when should I use it?', a: 'The ordinal form expresses a number\'s position in a sequence: 1st (first), 2nd (second), 42nd (forty-second). Use it for rankings, dates, floor numbers, and any context where order matters.' },
        { q: 'Can I use this for writing checks?', a: 'Yes! Enable currency mode and select your currency. The tool formats the amount exactly as required on checks — for example, "two hundred fifty dollars and no cents" for $250.00.' },
        { q: 'Does the converter support negative numbers?', a: 'Yes, negative numbers are fully supported. The word "negative" is prepended to the result — for example, -42 becomes "negative forty-two."' }
      ]
    },
    it: {
      title: 'Convertitore Numeri in Parole: Guida Completa',
      paragraphs: [
        'Convertire numeri in parole è un compito fondamentale nella finanza, nei documenti legali, nell\'istruzione e nella comunicazione quotidiana. Il nostro Convertitore Numeri in Parole trasforma qualsiasi valore numerico — inclusi numeri negativi e decimali — nella loro forma scritta completa in inglese. Che tu stia compilando un assegno, preparando un contratto legale o aiutando un bambino a imparare i nomi dei numeri, questo strumento fornisce risultati istantanei e accurati.',
        'Il convertitore supporta numeri fino ai bilioni, gestendo tutto, dai semplici numeri come "5" (five) a valori complessi come "1.234.567.890" (one billion two hundred thirty-four million...). I numeri decimali sono espressi cifra per cifra dopo la parola "point", seguendo la convenzione matematica standard.',
        'Una caratteristica unica è la modalità ordinale, che converte i numeri nella loro forma posizionale — ad esempio, 42 diventa "forty-second" e 101 diventa "one hundred first". Questo è prezioso per classifiche, date e numerazione sequenziale nella scrittura formale.',
        'La modalità valuta formatta i numeri come valori monetari con nomi di unità appropriati. Seleziona tra USD (dollari e centesimi), EUR (euro e centesimi) o GBP (sterline e penny). Tutte le conversioni vengono salvate nella cronologia locale per un facile riferimento, rendendo questo strumento pratico per commercialisti, scrittori, insegnanti e studenti.'
      ],
      faq: [
        { q: 'Qual è il numero più grande che questo strumento può convertire?', a: 'Il convertitore supporta numeri fino a 999 bilioni (999.999.999.999.999). Questo copre praticamente tutti i casi d\'uso pratici.' },
        { q: 'Come gestisce lo strumento i numeri decimali?', a: 'Le cifre decimali vengono lette singolarmente dopo la parola "point". Ad esempio, 3,14 diventa "three point one four". In modalità valuta, i decimali vengono convertiti nell\'unità secondaria appropriata.' },
        { q: 'Cos\'è la forma ordinale e quando dovrei usarla?', a: 'La forma ordinale esprime la posizione di un numero in una sequenza: 1° (first), 2° (second), 42° (forty-second). Usala per classifiche, date e numeri di piano.' },
        { q: 'Posso usare questo per compilare assegni?', a: 'Sì! Attiva la modalità valuta e seleziona la tua valuta. Lo strumento formatta l\'importo esattamente come richiesto sugli assegni.' },
        { q: 'Il convertitore supporta i numeri negativi?', a: 'Sì, i numeri negativi sono pienamente supportati. La parola "negative" viene anteposta al risultato — ad esempio, -42 diventa "negative forty-two".' }
      ]
    },
    es: {
      title: 'Convertidor de Números a Palabras: Guía Completa',
      paragraphs: [
        'Convertir números a palabras es una tarea fundamental en finanzas, documentos legales, educación y comunicación diaria. Nuestro Convertidor de Números a Palabras transforma cualquier valor numérico — incluyendo números negativos y decimales — a su forma escrita completa en inglés. Ya sea que estés escribiendo un cheque, preparando un contrato legal o ayudando a un niño a aprender los nombres de los números, esta herramienta proporciona resultados instantáneos y precisos.',
        'El convertidor soporta números hasta los billones, manejando todo, desde dígitos simples como "5" (five) hasta valores complejos. Los números decimales se expresan dígito por dígito después de la palabra "point", siguiendo la convención matemática estándar.',
        'Una característica única es el modo ordinal, que convierte números a su forma posicional — por ejemplo, 42 se convierte en "forty-second". Esto es invaluable para rankings, fechas y numeración secuencial en escritura formal.',
        'El modo moneda formatea números como valores monetarios con nombres de unidades apropiados. Selecciona entre USD (dólares y centavos), EUR (euros y céntimos) o GBP (libras y peniques). Todas las conversiones se guardan en el historial local, haciendo esta herramienta práctica para contadores, escritores, profesores y estudiantes.'
      ],
      faq: [
        { q: '¿Cuál es el número más grande que puede convertir esta herramienta?', a: 'El convertidor soporta números hasta 999 billones (999,999,999,999,999). Esto cubre prácticamente todos los casos de uso prácticos.' },
        { q: '¿Cómo maneja la herramienta los números decimales?', a: 'Los dígitos decimales se leen individualmente después de la palabra "point". Por ejemplo, 3.14 se convierte en "three point one four". En modo moneda, los decimales se convierten a la subunidad apropiada.' },
        { q: '¿Qué es la forma ordinal y cuándo debo usarla?', a: 'La forma ordinal expresa la posición de un número en una secuencia: 1° (first), 2° (second), 42° (forty-second). Úsala para rankings, fechas y contextos donde importa el orden.' },
        { q: '¿Puedo usar esto para escribir cheques?', a: '¡Sí! Activa el modo moneda y selecciona tu divisa. La herramienta formatea el monto exactamente como se requiere en cheques.' },
        { q: '¿El convertidor soporta números negativos?', a: 'Sí, los números negativos son totalmente soportados. La palabra "negative" se antepone al resultado — por ejemplo, -42 se convierte en "negative forty-two".' }
      ]
    },
    fr: {
      title: 'Convertisseur de Nombres en Mots : Guide Complet',
      paragraphs: [
        'Convertir des nombres en mots est une tâche fondamentale en finance, documents juridiques, éducation et communication quotidienne. Notre Convertisseur de Nombres en Mots transforme toute valeur numérique — y compris les nombres négatifs et décimaux — en leur forme écrite complète en anglais. Que vous rédigiez un chèque, prépariez un contrat juridique ou aidiez un enfant à apprendre les noms des nombres, cet outil fournit des résultats instantanés et précis.',
        'Le convertisseur prend en charge les nombres jusqu\'aux billions, gérant tout, des chiffres simples comme "5" (five) aux valeurs complexes. Les nombres décimaux sont exprimés chiffre par chiffre après le mot "point", suivant la convention mathématique standard.',
        'Une caractéristique unique est le mode ordinal, qui convertit les nombres en leur forme positionnelle — par exemple, 42 devient "forty-second". C\'est inestimable pour les classements, les dates et la numérotation séquentielle dans l\'écriture formelle.',
        'Le mode devise formate les nombres comme des valeurs monétaires avec les noms d\'unités appropriés. Choisissez entre USD (dollars et cents), EUR (euros et centimes) ou GBP (livres et pence). Toutes les conversions sont sauvegardées dans l\'historique local, rendant cet outil pratique pour les comptables, écrivains, enseignants et étudiants.'
      ],
      faq: [
        { q: 'Quel est le plus grand nombre que cet outil peut convertir ?', a: 'Le convertisseur prend en charge les nombres jusqu\'à 999 billions (999 999 999 999 999). Cela couvre pratiquement tous les cas d\'utilisation pratiques.' },
        { q: 'Comment l\'outil gère-t-il les nombres décimaux ?', a: 'Les chiffres décimaux sont lus individuellement après le mot "point". Par exemple, 3,14 devient "three point one four". En mode devise, les décimaux sont convertis en sous-unité appropriée.' },
        { q: 'Qu\'est-ce que la forme ordinale et quand dois-je l\'utiliser ?', a: 'La forme ordinale exprime la position d\'un nombre dans une séquence : 1er (first), 2e (second), 42e (forty-second). Utilisez-la pour les classements, dates et contextes où l\'ordre compte.' },
        { q: 'Puis-je utiliser ceci pour rédiger des chèques ?', a: 'Oui ! Activez le mode devise et sélectionnez votre devise. L\'outil formate le montant exactement comme requis sur les chèques.' },
        { q: 'Le convertisseur prend-il en charge les nombres négatifs ?', a: 'Oui, les nombres négatifs sont entièrement pris en charge. Le mot "negative" est ajouté au début du résultat — par exemple, -42 devient "negative forty-two".' }
      ]
    },
    de: {
      title: 'Zahlen-zu-Wörter-Konverter: Vollständiger Leitfaden',
      paragraphs: [
        'Das Umwandeln von Zahlen in Wörter ist eine grundlegende Aufgabe in Finanzen, Rechtsdokumenten, Bildung und alltäglicher Kommunikation. Unser Zahlen-zu-Wörter-Konverter wandelt jeden numerischen Wert — einschließlich negativer Zahlen und Dezimalzahlen — in ihre vollständige englischsprachige Schriftform um. Ob Sie einen Scheck ausfüllen, einen Rechtsvertrag vorbereiten oder einem Kind beim Lernen der Zahlennamen helfen, dieses Tool liefert sofortige, genaue Ergebnisse.',
        'Der Konverter unterstützt Zahlen bis zu den Billionen und verarbeitet alles von einfachen Ziffern wie "5" (five) bis hin zu komplexen Werten. Dezimalzahlen werden Ziffer für Ziffer nach dem Wort "point" ausgedrückt, gemäß der mathematischen Standardkonvention.',
        'Eine einzigartige Funktion ist der Ordinalmodus, der Zahlen in ihre Positionsform umwandelt — zum Beispiel wird 42 zu "forty-second". Dies ist unerlässlich für Rankings, Daten und sequentielle Nummerierung in formeller Schriftform.',
        'Der Währungsmodus formatiert Zahlen als Geldbeträge mit korrekten Einheitsnamen. Wählen Sie zwischen USD (Dollar und Cent), EUR (Euro und Cent) oder GBP (Pfund und Pence). Alle Konvertierungen werden im lokalen Verlauf gespeichert, was dieses Tool praktisch für Buchhalter, Schriftsteller, Lehrer und Studenten macht.'
      ],
      faq: [
        { q: 'Was ist die größte Zahl, die dieses Tool konvertieren kann?', a: 'Der Konverter unterstützt Zahlen bis zu 999 Billionen (999.999.999.999.999). Dies deckt praktisch alle praktischen Anwendungsfälle ab.' },
        { q: 'Wie behandelt das Tool Dezimalzahlen?', a: 'Dezimalziffern werden einzeln nach dem Wort "point" gelesen. Zum Beispiel wird 3,14 zu "three point one four". Im Währungsmodus werden Dezimalstellen in die entsprechende Untereinheit umgewandelt.' },
        { q: 'Was ist die Ordinalform und wann sollte ich sie verwenden?', a: 'Die Ordinalform drückt die Position einer Zahl in einer Reihenfolge aus: 1. (first), 2. (second), 42. (forty-second). Verwenden Sie sie für Rankings, Daten und Kontexte, in denen die Reihenfolge wichtig ist.' },
        { q: 'Kann ich dies zum Ausfüllen von Schecks verwenden?', a: 'Ja! Aktivieren Sie den Währungsmodus und wählen Sie Ihre Währung. Das Tool formatiert den Betrag genau so, wie es auf Schecks erforderlich ist.' },
        { q: 'Unterstützt der Konverter negative Zahlen?', a: 'Ja, negative Zahlen werden vollständig unterstützt. Das Wort "negative" wird dem Ergebnis vorangestellt — zum Beispiel wird -42 zu "negative forty-two".' }
      ]
    },
    pt: {
      title: 'Conversor de Números para Palavras: Guia Completo',
      paragraphs: [
        'Converter números em palavras é uma tarefa fundamental em finanças, documentos legais, educação e comunicação diária. Nosso Conversor de Números para Palavras transforma qualquer valor numérico — incluindo números negativos e decimais — em sua forma escrita completa em inglês. Seja preenchendo um cheque, preparando um contrato legal ou ajudando uma criança a aprender os nomes dos números, esta ferramenta fornece resultados instantâneos e precisos.',
        'O conversor suporta números até os trilhões, lidando com tudo, desde dígitos simples como "5" (five) até valores complexos. Números decimais são expressos dígito por dígito após a palavra "point", seguindo a convenção matemática padrão.',
        'Uma característica única é o modo ordinal, que converte números em sua forma posicional — por exemplo, 42 se torna "forty-second". Isso é inestimável para rankings, datas e numeração sequencial em escrita formal.',
        'O modo moeda formata números como valores monetários com nomes de unidades apropriados. Selecione entre USD (dólares e centavos), EUR (euros e cêntimos) ou GBP (libras e pence). Todas as conversões são salvas no histórico local, tornando esta ferramenta prática para contadores, escritores, professores e estudantes.'
      ],
      faq: [
        { q: 'Qual é o maior número que esta ferramenta pode converter?', a: 'O conversor suporta números até 999 trilhões (999.999.999.999.999). Isso cobre praticamente todos os casos de uso práticos.' },
        { q: 'Como a ferramenta lida com números decimais?', a: 'Os dígitos decimais são lidos individualmente após a palavra "point". Por exemplo, 3,14 se torna "three point one four". No modo moeda, os decimais são convertidos na subunidade apropriada.' },
        { q: 'O que é a forma ordinal e quando devo usá-la?', a: 'A forma ordinal expressa a posição de um número em uma sequência: 1° (first), 2° (second), 42° (forty-second). Use-a para rankings, datas e contextos onde a ordem importa.' },
        { q: 'Posso usar isso para preencher cheques?', a: 'Sim! Ative o modo moeda e selecione sua moeda. A ferramenta formata o valor exatamente como exigido em cheques.' },
        { q: 'O conversor suporta números negativos?', a: 'Sim, números negativos são totalmente suportados. A palavra "negative" é adicionada ao início do resultado — por exemplo, -42 se torna "negative forty-two".' }
      ]
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="number-to-words" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('inputLabel')}</label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConvert()}
              placeholder="e.g. 1234.56"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
          </div>

          {/* Currency Mode Toggle */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currencyMode}
                onChange={(e) => setCurrencyMode(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{t('currencyMode')}</span>
            </label>

            {currencyMode && (
              <select
                value={currencyType}
                onChange={(e) => setCurrencyType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (&euro;)</option>
                <option value="GBP">GBP (&pound;)</option>
              </select>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleConvert}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {t('convert')}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              {t('reset')}
            </button>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</div>
          )}

          {/* Words Result */}
          {wordsResult && (
            <div className="mt-4 space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-green-800">{t('words')}</span>
                  <button
                    onClick={() => handleCopy(wordsResult, 'words')}
                    className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${copiedField === 'words' ? 'bg-green-600 text-white' : 'bg-green-200 text-green-800 hover:bg-green-300'}`}
                  >
                    {copiedField === 'words' ? t('copied') : t('copy')}
                  </button>
                </div>
                <p className="text-lg text-green-700 font-medium capitalize">{wordsResult}</p>
              </div>

              {/* Ordinal Result */}
              {ordinalResult && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-purple-800">{t('ordinal')}</span>
                    <button
                      onClick={() => handleCopy(ordinalResult, 'ordinal')}
                      className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${copiedField === 'ordinal' ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-800 hover:bg-purple-300'}`}
                    >
                      {copiedField === 'ordinal' ? t('copied') : t('copy')}
                    </button>
                  </div>
                  <p className="text-lg text-purple-700 font-medium capitalize">{ordinalResult}</p>
                </div>
              )}

              {/* Currency Result */}
              {currencyResult && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-amber-800">{t('currency')} ({currencyType})</span>
                    <button
                      onClick={() => handleCopy(currencyResult, 'currency')}
                      className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${copiedField === 'currency' ? 'bg-amber-600 text-white' : 'bg-amber-200 text-amber-800 hover:bg-amber-300'}`}
                    >
                      {copiedField === 'currency' ? t('copied') : t('copy')}
                    </button>
                  </div>
                  <p className="text-lg text-amber-700 font-medium capitalize">{currencyResult}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-700">{t('history')}</h3>
              <button
                onClick={() => setHistory([])}
                className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors"
              >
                {t('clearHistory')}
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {history.map((entry, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg text-sm">
                  <div className="flex-1 mr-2">
                    <span className="font-mono text-gray-800">{entry.input}</span>
                    <span className="text-gray-400 mx-2">&rarr;</span>
                    <span className="text-gray-600 capitalize truncate">{entry.words}</span>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{entry.timestamp}</span>
                </div>
              ))}
            </div>
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
