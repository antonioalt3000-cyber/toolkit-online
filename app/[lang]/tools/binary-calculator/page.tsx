'use client';
import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type Operation = 'AND' | 'OR' | 'XOR' | 'NOT' | 'ADD' | 'SUB';

interface HistoryEntry {
  a: string;
  b: string;
  op: Operation;
  resultBin: string;
  resultDec: string;
  resultHex: string;
  resultOct: string;
  timestamp: number;
}

export default function BinaryCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['binary-calculator'][lang];

  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [operation, setOperation] = useState<Operation>('AND');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showSteps, setShowSteps] = useState(true);

  const labels: Record<string, Record<Locale, string>> = {
    inputA: { en: 'Binary Number A', it: 'Numero Binario A', es: 'Numero Binario A', fr: 'Nombre Binaire A', de: 'Binaerzahl A', pt: 'Numero Binario A' },
    inputB: { en: 'Binary Number B', it: 'Numero Binario B', es: 'Numero Binario B', fr: 'Nombre Binaire B', de: 'Binaerzahl B', pt: 'Numero Binario B' },
    operation: { en: 'Operation', it: 'Operazione', es: 'Operacion', fr: 'Operation', de: 'Operation', pt: 'Operacao' },
    calculate: { en: 'Calculate', it: 'Calcola', es: 'Calcular', fr: 'Calculer', de: 'Berechnen', pt: 'Calcular' },
    reset: { en: 'Reset', it: 'Resetta', es: 'Reiniciar', fr: 'Reinitialiser', de: 'Zuruecksetzen', pt: 'Reiniciar' },
    results: { en: 'Results', it: 'Risultati', es: 'Resultados', fr: 'Resultats', de: 'Ergebnisse', pt: 'Resultados' },
    binary: { en: 'Binary', it: 'Binario', es: 'Binario', fr: 'Binaire', de: 'Binaer', pt: 'Binario' },
    decimal: { en: 'Decimal', it: 'Decimale', es: 'Decimal', fr: 'Decimal', de: 'Dezimal', pt: 'Decimal' },
    hexadecimal: { en: 'Hexadecimal', it: 'Esadecimale', es: 'Hexadecimal', fr: 'Hexadecimal', de: 'Hexadezimal', pt: 'Hexadecimal' },
    octal: { en: 'Octal', it: 'Ottale', es: 'Octal', fr: 'Octal', de: 'Oktal', pt: 'Octal' },
    copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copie !', de: 'Kopiert!', pt: 'Copiado!' },
    invalid: { en: 'Only 0 and 1 are allowed', it: 'Solo 0 e 1 sono permessi', es: 'Solo se permiten 0 y 1', fr: 'Seuls 0 et 1 sont autorises', de: 'Nur 0 und 1 erlaubt', pt: 'Apenas 0 e 1 sao permitidos' },
    invalidEmpty: { en: 'Enter at least one binary number', it: 'Inserisci almeno un numero binario', es: 'Ingresa al menos un numero binario', fr: 'Entrez au moins un nombre binaire', de: 'Geben Sie mindestens eine Binaerzahl ein', pt: 'Insira pelo menos um numero binario' },
    bitVisualization: { en: 'Bit Visualization', it: 'Visualizzazione Bit', es: 'Visualizacion de Bits', fr: 'Visualisation des Bits', de: 'Bit-Visualisierung', pt: 'Visualizacao de Bits' },
    steps: { en: 'Step-by-Step', it: 'Passo dopo Passo', es: 'Paso a Paso', fr: 'Etape par Etape', de: 'Schritt fuer Schritt', pt: 'Passo a Passo' },
    history: { en: 'History', it: 'Cronologia', es: 'Historial', fr: 'Historique', de: 'Verlauf', pt: 'Historico' },
    clearHistory: { en: 'Clear History', it: 'Cancella Cronologia', es: 'Borrar Historial', fr: 'Effacer Historique', de: 'Verlauf loeschen', pt: 'Limpar Historico' },
    noHistory: { en: 'No calculations yet', it: 'Nessun calcolo ancora', es: 'Sin calculos aun', fr: 'Aucun calcul encore', de: 'Noch keine Berechnungen', pt: 'Nenhum calculo ainda' },
    showSteps: { en: 'Show Steps', it: 'Mostra Passaggi', es: 'Mostrar Pasos', fr: 'Afficher Etapes', de: 'Schritte zeigen', pt: 'Mostrar Passos' },
    hideSteps: { en: 'Hide Steps', it: 'Nascondi Passaggi', es: 'Ocultar Pasos', fr: 'Masquer Etapes', de: 'Schritte ausblenden', pt: 'Ocultar Passos' },
    addition: { en: 'Addition', it: 'Addizione', es: 'Suma', fr: 'Addition', de: 'Addition', pt: 'Adicao' },
    subtraction: { en: 'Subtraction', it: 'Sottrazione', es: 'Resta', fr: 'Soustraction', de: 'Subtraktion', pt: 'Subtracao' },
    copyAll: { en: 'Copy All Results', it: 'Copia Tutti i Risultati', es: 'Copiar Todos los Resultados', fr: 'Copier Tous les Resultats', de: 'Alle Ergebnisse kopieren', pt: 'Copiar Todos os Resultados' },
    inputLabel: { en: 'Input', it: 'Input', es: 'Entrada', fr: 'Entree', de: 'Eingabe', pt: 'Entrada' },
    resultLabel: { en: 'Result', it: 'Risultato', es: 'Resultado', fr: 'Resultat', de: 'Ergebnis', pt: 'Resultado' },
  };

  const l = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const isValidBinary = (val: string) => /^[01]*$/.test(val);

  const handleInputA = (val: string) => {
    if (val === '' || isValidBinary(val)) setInputA(val);
  };

  const handleInputB = (val: string) => {
    if (val === '' || isValidBinary(val)) setInputB(val);
  };

  const padBinary = (a: string, b: string): [string, string] => {
    const maxLen = Math.max(a.length, b.length);
    return [a.padStart(maxLen, '0'), b.padStart(maxLen, '0')];
  };

  const [result, setResult] = useState<{ bin: string; dec: string; hex: string; oct: string; steps: string[] } | null>(null);
  const [error, setError] = useState('');

  const calculate = useCallback(() => {
    setError('');
    setResult(null);

    if (!inputA && operation !== 'NOT') {
      setError(l('invalidEmpty'));
      return;
    }
    if (!inputA) {
      setError(l('invalidEmpty'));
      return;
    }
    if (!isValidBinary(inputA) || (inputB && !isValidBinary(inputB))) {
      setError(l('invalid'));
      return;
    }
    if (operation !== 'NOT' && !inputB) {
      setError(l('invalidEmpty'));
      return;
    }

    const aNum = parseInt(inputA, 2);
    const bNum = inputB ? parseInt(inputB, 2) : 0;
    let resultNum: number;
    const steps: string[] = [];
    const [paddedA, paddedB] = padBinary(inputA, inputB || '0');

    switch (operation) {
      case 'AND': {
        resultNum = aNum & bNum;
        steps.push(`A = ${paddedA} (${aNum})`);
        steps.push(`B = ${paddedB} (${bNum})`);
        steps.push(`${'-'.repeat(paddedA.length + 4)}`);
        const resBin = resultNum.toString(2).padStart(paddedA.length, '0');
        steps.push(`A AND B:`);
        for (let i = 0; i < paddedA.length; i++) {
          steps.push(`  ${paddedA[i]} AND ${paddedB[i]} = ${paddedA[i] === '1' && paddedB[i] === '1' ? '1' : '0'}`);
        }
        steps.push(`Result = ${resBin} (${resultNum})`);
        break;
      }
      case 'OR': {
        resultNum = aNum | bNum;
        steps.push(`A = ${paddedA} (${aNum})`);
        steps.push(`B = ${paddedB} (${bNum})`);
        steps.push(`${'-'.repeat(paddedA.length + 4)}`);
        steps.push(`A OR B:`);
        for (let i = 0; i < paddedA.length; i++) {
          steps.push(`  ${paddedA[i]} OR ${paddedB[i]} = ${paddedA[i] === '1' || paddedB[i] === '1' ? '1' : '0'}`);
        }
        steps.push(`Result = ${resultNum.toString(2).padStart(paddedA.length, '0')} (${resultNum})`);
        break;
      }
      case 'XOR': {
        resultNum = aNum ^ bNum;
        steps.push(`A = ${paddedA} (${aNum})`);
        steps.push(`B = ${paddedB} (${bNum})`);
        steps.push(`${'-'.repeat(paddedA.length + 4)}`);
        steps.push(`A XOR B:`);
        for (let i = 0; i < paddedA.length; i++) {
          steps.push(`  ${paddedA[i]} XOR ${paddedB[i]} = ${paddedA[i] !== paddedB[i] ? '1' : '0'}`);
        }
        steps.push(`Result = ${resultNum.toString(2).padStart(paddedA.length, '0')} (${resultNum})`);
        break;
      }
      case 'NOT': {
        const bits = inputA.length;
        const mask = (1 << bits) - 1;
        resultNum = (~aNum) & mask;
        steps.push(`A = ${inputA} (${aNum})`);
        steps.push(`NOT A (${bits}-bit):`);
        for (let i = 0; i < inputA.length; i++) {
          steps.push(`  NOT ${inputA[i]} = ${inputA[i] === '0' ? '1' : '0'}`);
        }
        steps.push(`Result = ${resultNum.toString(2).padStart(bits, '0')} (${resultNum})`);
        break;
      }
      case 'ADD': {
        resultNum = aNum + bNum;
        steps.push(`A = ${paddedA} (${aNum})`);
        steps.push(`B = ${paddedB} (${bNum})`);
        steps.push(`${'-'.repeat(paddedA.length + 4)}`);
        steps.push(`A + B:`);
        let carry = 0;
        const addBits: string[] = [];
        for (let i = paddedA.length - 1; i >= 0; i--) {
          const ba = parseInt(paddedA[i]);
          const bb = parseInt(paddedB[i]);
          const sum = ba + bb + carry;
          const bit = sum % 2;
          carry = Math.floor(sum / 2);
          addBits.unshift(String(bit));
          steps.push(`  pos ${paddedA.length - 1 - i}: ${ba} + ${bb} + carry(${carry === 0 && sum < 2 ? 0 : sum >= 2 ? carry : 0}) = ${bit}, carry = ${carry}`);
        }
        if (carry) addBits.unshift('1');
        steps.push(`Result = ${resultNum.toString(2)} (${resultNum})`);
        break;
      }
      case 'SUB': {
        resultNum = aNum - bNum;
        if (resultNum < 0) {
          steps.push(`A = ${paddedA} (${aNum})`);
          steps.push(`B = ${paddedB} (${bNum})`);
          steps.push(`A - B = ${aNum} - ${bNum} = ${resultNum}`);
          steps.push(`Note: Negative result. Showing absolute value in binary.`);
          const absResult = Math.abs(resultNum);
          setResult({
            bin: '-' + absResult.toString(2),
            dec: resultNum.toString(10),
            hex: '-' + absResult.toString(16).toUpperCase(),
            oct: '-' + absResult.toString(8),
            steps,
          });
          setHistory(prev => [{
            a: inputA, b: inputB, op: operation,
            resultBin: '-' + absResult.toString(2),
            resultDec: resultNum.toString(10),
            resultHex: '-' + absResult.toString(16).toUpperCase(),
            resultOct: '-' + absResult.toString(8),
            timestamp: Date.now(),
          }, ...prev].slice(0, 20));
          return;
        }
        steps.push(`A = ${paddedA} (${aNum})`);
        steps.push(`B = ${paddedB} (${bNum})`);
        steps.push(`A - B = ${aNum} - ${bNum} = ${resultNum}`);
        steps.push(`Result = ${resultNum.toString(2)} (${resultNum})`);
        break;
      }
    }

    const resBin = resultNum.toString(2);
    const resDec = resultNum.toString(10);
    const resHex = resultNum.toString(16).toUpperCase();
    const resOct = resultNum.toString(8);

    setResult({ bin: resBin, dec: resDec, hex: resHex, oct: resOct, steps });
    setHistory(prev => [{
      a: inputA, b: inputB, op: operation,
      resultBin: resBin, resultDec: resDec, resultHex: resHex, resultOct: resOct,
      timestamp: Date.now(),
    }, ...prev].slice(0, 20));
  }, [inputA, inputB, operation, lang]);

  const handleReset = () => {
    setInputA('');
    setInputB('');
    setResult(null);
    setError('');
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const copyAllResults = () => {
    if (!result) return;
    const text = `Binary: ${result.bin}\nDecimal: ${result.dec}\nHexadecimal: ${result.hex}\nOctal: ${result.oct}`;
    navigator.clipboard.writeText(text);
    setCopiedField('all');
    setTimeout(() => setCopiedField(null), 1500);
  };

  const renderBitBoxes = (binStr: string, label: string) => {
    const clean = binStr.replace('-', '');
    const isNeg = binStr.startsWith('-');
    return (
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1 font-medium">{label}{isNeg && ' (negative)'}</div>
        <div className="flex flex-wrap gap-1">
          {clean.split('').map((bit, i) => (
            <div
              key={i}
              className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold font-mono transition-all ${
                bit === '1'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-400 border border-gray-200'
              }`}
            >
              {bit}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const operations: { value: Operation; label: string }[] = [
    { value: 'AND', label: 'AND' },
    { value: 'OR', label: 'OR' },
    { value: 'XOR', label: 'XOR' },
    { value: 'NOT', label: `NOT (A)` },
    { value: 'ADD', label: l('addition') },
    { value: 'SUB', label: l('subtraction') },
  ];

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Binary Calculator – Perform Binary Operations Online',
      paragraphs: [
        'Binary arithmetic is the foundation of all digital computing. Every calculation your computer performs, from rendering graphics to processing data, ultimately comes down to operations on binary numbers. Understanding binary operations is essential for programmers, computer science students, and anyone working with low-level systems or digital electronics.',
        'Our free binary calculator supports six fundamental operations: AND, OR, XOR, NOT, Addition, and Subtraction. Logical operations like AND, OR, and XOR are the building blocks of digital circuits and are used extensively in programming for tasks like masking bits, setting flags, toggling values, and implementing efficient algorithms. The NOT operation inverts all bits, converting every 0 to 1 and every 1 to 0.',
        'Binary addition and subtraction follow the same principles as decimal arithmetic but with only two digits. When adding 1 + 1 in binary, the result is 10 (which equals 2 in decimal), creating a carry bit. This carry propagation is how hardware adders work inside CPUs. Subtraction works similarly, using borrowing when a smaller digit is subtracted from a larger one.',
        'This calculator displays results in four formats simultaneously: binary, decimal, hexadecimal, and octal. The bit visualization feature shows each bit as a colored box, making it easy to see patterns in the data. The step-by-step breakdown explains exactly how each operation works bit by bit, which is invaluable for learning and debugging.',
        'Practical applications of binary calculations include network subnet masking (AND operations), setting permission flags in operating systems, implementing encryption algorithms, working with color channels in graphics programming, and optimizing code with bitwise operations that are faster than their arithmetic equivalents.',
        'Whether you are a student learning computer science fundamentals, a developer debugging bitwise operations, or an electronics engineer designing digital circuits, this binary calculator provides instant, accurate results with educational step-by-step explanations for every operation.',
      ],
      faq: [
        { q: 'What is a binary AND operation?', a: 'Binary AND compares two bits and returns 1 only if both bits are 1. For example, 1101 AND 1010 = 1000. It is commonly used for bit masking, where you want to extract specific bits from a number. In programming, the AND operator is represented by & in most languages.' },
        { q: 'How does binary addition work?', a: 'Binary addition follows simple rules: 0+0=0, 0+1=1, 1+0=1, and 1+1=10 (0 with a carry of 1). When carries propagate through multiple positions, it works just like carrying in decimal addition. For example, 1011 + 1101 = 11000 (11 + 13 = 24 in decimal).' },
        { q: 'What is the difference between XOR and OR?', a: 'OR returns 1 if either or both bits are 1 (inclusive OR). XOR (exclusive OR) returns 1 only if the bits are different. For example, 1 OR 1 = 1, but 1 XOR 1 = 0. XOR is used in checksums, encryption, and toggling bits.' },
        { q: 'What does the NOT operation do?', a: 'NOT is a unary operation that inverts every bit: 0 becomes 1 and 1 becomes 0. For example, NOT 1101 = 0010. The result depends on the bit width. NOT is used to create bitmask complements and in two\'s complement arithmetic for representing negative numbers.' },
        { q: 'Why are binary operations important in programming?', a: 'Binary operations are crucial because computers process everything in binary. Bitwise operations like AND, OR, XOR are used for permissions systems, graphics manipulation, network protocols, compression algorithms, and cryptography. They are also significantly faster than equivalent arithmetic operations.' },
      ],
    },
    it: {
      title: 'Calcolatrice Binaria Gratuita – Esegui Operazioni Binarie Online',
      paragraphs: [
        'L\'aritmetica binaria e il fondamento di tutta la computazione digitale. Ogni calcolo che il tuo computer esegue, dal rendering grafico all\'elaborazione dei dati, si riduce a operazioni su numeri binari. Comprendere le operazioni binarie e essenziale per programmatori, studenti di informatica e chiunque lavori con sistemi a basso livello.',
        'La nostra calcolatrice binaria gratuita supporta sei operazioni fondamentali: AND, OR, XOR, NOT, Addizione e Sottrazione. Le operazioni logiche come AND, OR e XOR sono i mattoni dei circuiti digitali e vengono usate ampiamente nella programmazione per mascheramento di bit, impostazione di flag, commutazione di valori e implementazione di algoritmi efficienti.',
        'L\'addizione e la sottrazione binaria seguono gli stessi principi dell\'aritmetica decimale ma con solo due cifre. Quando si somma 1 + 1 in binario, il risultato e 10 (che equivale a 2 in decimale), creando un bit di riporto. Questa propagazione del riporto e il funzionamento degli addizionatori hardware nelle CPU.',
        'Questa calcolatrice mostra i risultati in quattro formati simultaneamente: binario, decimale, esadecimale e ottale. La visualizzazione dei bit mostra ogni bit come una casella colorata, rendendo facile vedere i pattern nei dati. La scomposizione passo dopo passo spiega esattamente come funziona ogni operazione bit per bit.',
        'Le applicazioni pratiche dei calcoli binari includono il mascheramento di sottoreti di rete (operazioni AND), l\'impostazione di flag di permesso nei sistemi operativi, l\'implementazione di algoritmi di crittografia, il lavoro con i canali colore nella programmazione grafica e l\'ottimizzazione del codice.',
        'Che tu sia uno studente che impara i fondamenti dell\'informatica, uno sviluppatore che esegue il debug di operazioni bitwise o un ingegnere elettronico che progetta circuiti digitali, questa calcolatrice binaria fornisce risultati istantanei e accurati con spiegazioni passo dopo passo.',
      ],
      faq: [
        { q: 'Cos\'e un\'operazione AND binaria?', a: 'L\'AND binario confronta due bit e restituisce 1 solo se entrambi i bit sono 1. Per esempio, 1101 AND 1010 = 1000. E comunemente usato per il mascheramento dei bit. In programmazione, l\'operatore AND e rappresentato da & nella maggior parte dei linguaggi.' },
        { q: 'Come funziona l\'addizione binaria?', a: 'L\'addizione binaria segue regole semplici: 0+0=0, 0+1=1, 1+0=1, e 1+1=10 (0 con riporto di 1). I riporti si propagano come nell\'addizione decimale. Per esempio, 1011 + 1101 = 11000 (11 + 13 = 24 in decimale).' },
        { q: 'Qual e la differenza tra XOR e OR?', a: 'OR restituisce 1 se uno o entrambi i bit sono 1 (OR inclusivo). XOR restituisce 1 solo se i bit sono diversi. Per esempio, 1 OR 1 = 1, ma 1 XOR 1 = 0. XOR e usato in checksum, crittografia e commutazione di bit.' },
        { q: 'Cosa fa l\'operazione NOT?', a: 'NOT e un\'operazione unaria che inverte ogni bit: 0 diventa 1 e 1 diventa 0. Per esempio, NOT 1101 = 0010. NOT e usato per creare complementi di maschere di bit e nell\'aritmetica del complemento a due.' },
        { q: 'Perche le operazioni binarie sono importanti nella programmazione?', a: 'Le operazioni binarie sono cruciali perche i computer elaborano tutto in binario. Operazioni bitwise come AND, OR, XOR sono usate per sistemi di permessi, manipolazione grafica, protocolli di rete, algoritmi di compressione e crittografia.' },
      ],
    },
    es: {
      title: 'Calculadora Binaria Gratis – Realiza Operaciones Binarias en Linea',
      paragraphs: [
        'La aritmetica binaria es la base de toda la computacion digital. Cada calculo que tu computadora realiza, desde renderizar graficos hasta procesar datos, se reduce a operaciones con numeros binarios. Comprender las operaciones binarias es esencial para programadores, estudiantes de informatica y cualquier persona que trabaje con sistemas de bajo nivel.',
        'Nuestra calculadora binaria gratuita soporta seis operaciones fundamentales: AND, OR, XOR, NOT, Suma y Resta. Las operaciones logicas como AND, OR y XOR son los bloques de construccion de los circuitos digitales y se usan ampliamente en programacion para enmascaramiento de bits, configuracion de banderas y algoritmos eficientes.',
        'La suma y resta binaria siguen los mismos principios que la aritmetica decimal pero con solo dos digitos. Al sumar 1 + 1 en binario, el resultado es 10 (que equivale a 2 en decimal), creando un bit de acarreo. Esta propagacion del acarreo es como funcionan los sumadores de hardware dentro de las CPU.',
        'Esta calculadora muestra resultados en cuatro formatos simultaneamente: binario, decimal, hexadecimal y octal. La visualizacion de bits muestra cada bit como una caja coloreada, facilitando ver patrones en los datos. El desglose paso a paso explica exactamente como funciona cada operacion bit por bit.',
        'Las aplicaciones practicas de los calculos binarios incluyen enmascaramiento de subredes (operaciones AND), configuracion de banderas de permisos en sistemas operativos, implementacion de algoritmos de cifrado, trabajo con canales de color en programacion grafica y optimizacion de codigo.',
        'Ya seas un estudiante aprendiendo fundamentos de informatica, un desarrollador depurando operaciones bitwise o un ingeniero electronico disenando circuitos digitales, esta calculadora binaria proporciona resultados instantaneos y precisos con explicaciones paso a paso.',
      ],
      faq: [
        { q: 'Que es una operacion AND binaria?', a: 'El AND binario compara dos bits y retorna 1 solo si ambos bits son 1. Por ejemplo, 1101 AND 1010 = 1000. Se usa comunmente para enmascaramiento de bits. En programacion, el operador AND se representa con & en la mayoria de lenguajes.' },
        { q: 'Como funciona la suma binaria?', a: 'La suma binaria sigue reglas simples: 0+0=0, 0+1=1, 1+0=1, y 1+1=10 (0 con acarreo de 1). Los acarreos se propagan como en la suma decimal. Por ejemplo, 1011 + 1101 = 11000 (11 + 13 = 24 en decimal).' },
        { q: 'Cual es la diferencia entre XOR y OR?', a: 'OR retorna 1 si uno o ambos bits son 1 (OR inclusivo). XOR retorna 1 solo si los bits son diferentes. Por ejemplo, 1 OR 1 = 1, pero 1 XOR 1 = 0. XOR se usa en checksums, cifrado y alternancia de bits.' },
        { q: 'Que hace la operacion NOT?', a: 'NOT es una operacion unaria que invierte cada bit: 0 se convierte en 1 y 1 en 0. Por ejemplo, NOT 1101 = 0010. NOT se usa para crear complementos de mascaras de bits y en aritmetica de complemento a dos.' },
        { q: 'Por que son importantes las operaciones binarias en programacion?', a: 'Las operaciones binarias son cruciales porque las computadoras procesan todo en binario. Operaciones bitwise como AND, OR, XOR se usan para sistemas de permisos, manipulacion grafica, protocolos de red, algoritmos de compresion y criptografia.' },
      ],
    },
    fr: {
      title: 'Calculatrice Binaire Gratuite – Effectuez des Operations Binaires en Ligne',
      paragraphs: [
        'L\'arithmetique binaire est le fondement de toute l\'informatique numerique. Chaque calcul que votre ordinateur effectue, du rendu graphique au traitement des donnees, se resume a des operations sur des nombres binaires. Comprendre les operations binaires est essentiel pour les programmeurs, les etudiants en informatique et toute personne travaillant avec des systemes de bas niveau.',
        'Notre calculatrice binaire gratuite prend en charge six operations fondamentales : AND, OR, XOR, NOT, Addition et Soustraction. Les operations logiques comme AND, OR et XOR sont les briques de base des circuits numeriques et sont largement utilisees en programmation pour le masquage de bits, la gestion de drapeaux et les algorithmes efficaces.',
        'L\'addition et la soustraction binaires suivent les memes principes que l\'arithmetique decimale mais avec seulement deux chiffres. Quand on additionne 1 + 1 en binaire, le resultat est 10 (soit 2 en decimal), creant un bit de retenue. Cette propagation de retenue est le fonctionnement des additionneurs materiels dans les CPU.',
        'Cette calculatrice affiche les resultats dans quatre formats simultanement : binaire, decimal, hexadecimal et octal. La visualisation des bits montre chaque bit comme une boite coloree, facilitant la detection des motifs. La decomposition etape par etape explique exactement comment chaque operation fonctionne bit par bit.',
        'Les applications pratiques des calculs binaires comprennent le masquage de sous-reseaux (operations AND), la configuration des drapeaux de permissions dans les systemes d\'exploitation, l\'implementation d\'algorithmes de chiffrement, le travail avec les canaux de couleur en programmation graphique et l\'optimisation du code.',
        'Que vous soyez un etudiant apprenant les fondamentaux de l\'informatique, un developpeur debuggant des operations bitwise ou un ingenieur electronique concevant des circuits numeriques, cette calculatrice binaire fournit des resultats instantanes et precis avec des explications etape par etape.',
      ],
      faq: [
        { q: 'Qu\'est-ce qu\'une operation AND binaire ?', a: 'Le AND binaire compare deux bits et retourne 1 seulement si les deux bits sont 1. Par exemple, 1101 AND 1010 = 1000. Il est couramment utilise pour le masquage de bits. En programmation, l\'operateur AND est represente par & dans la plupart des langages.' },
        { q: 'Comment fonctionne l\'addition binaire ?', a: 'L\'addition binaire suit des regles simples : 0+0=0, 0+1=1, 1+0=1, et 1+1=10 (0 avec retenue de 1). Les retenues se propagent comme en addition decimale. Par exemple, 1011 + 1101 = 11000 (11 + 13 = 24 en decimal).' },
        { q: 'Quelle est la difference entre XOR et OR ?', a: 'OR retourne 1 si un ou les deux bits sont 1 (OR inclusif). XOR retourne 1 seulement si les bits sont differents. Par exemple, 1 OR 1 = 1, mais 1 XOR 1 = 0. XOR est utilise dans les checksums, le chiffrement et la commutation de bits.' },
        { q: 'Que fait l\'operation NOT ?', a: 'NOT est une operation unaire qui inverse chaque bit : 0 devient 1 et 1 devient 0. Par exemple, NOT 1101 = 0010. NOT est utilise pour creer des complements de masques de bits et en arithmetique du complement a deux.' },
        { q: 'Pourquoi les operations binaires sont-elles importantes en programmation ?', a: 'Les operations binaires sont cruciales car les ordinateurs traitent tout en binaire. Les operations bitwise comme AND, OR, XOR sont utilisees pour les systemes de permissions, la manipulation graphique, les protocoles reseau, les algorithmes de compression et la cryptographie.' },
      ],
    },
    de: {
      title: 'Kostenloser Binaerrechner – Binaere Operationen Online Durchfuehren',
      paragraphs: [
        'Binaere Arithmetik ist die Grundlage aller digitalen Datenverarbeitung. Jede Berechnung, die Ihr Computer durchfuehrt, vom Rendern von Grafiken bis zur Datenverarbeitung, laeuft letztlich auf Operationen mit Binaerzahlen hinaus. Das Verstaendnis binaerer Operationen ist fuer Programmierer, Informatikstudenten und alle, die mit Low-Level-Systemen arbeiten, unverzichtbar.',
        'Unser kostenloser Binaerrechner unterstuetzt sechs grundlegende Operationen: AND, OR, XOR, NOT, Addition und Subtraktion. Logische Operationen wie AND, OR und XOR sind die Bausteine digitaler Schaltkreise und werden in der Programmierung haeufig fuer Bit-Maskierung, Flag-Verwaltung und effiziente Algorithmen verwendet.',
        'Binaere Addition und Subtraktion folgen denselben Prinzipien wie die Dezimalarithmetik, aber mit nur zwei Ziffern. Wenn man 1 + 1 binaer addiert, ist das Ergebnis 10 (entspricht 2 dezimal) mit einem Uebertragsbit. Diese Uebertragsweiterleitung ist die Funktionsweise der Hardware-Addierer in CPUs.',
        'Dieser Rechner zeigt Ergebnisse in vier Formaten gleichzeitig an: binaer, dezimal, hexadezimal und oktal. Die Bit-Visualisierung zeigt jedes Bit als farbiges Kaestchen, was das Erkennen von Mustern erleichtert. Die schrittweise Aufschluesselung erklaert genau, wie jede Operation Bit fuer Bit funktioniert.',
        'Praktische Anwendungen binaerer Berechnungen umfassen Netzwerk-Subnetz-Maskierung (AND-Operationen), Berechtigungsflags in Betriebssystemen, Verschluesselungsalgorithmen, Farbkanalarbeit in der Grafikprogrammierung und Code-Optimierung mit Bitoperationen.',
        'Ob Sie Student sind, der Informatik-Grundlagen lernt, Entwickler beim Debuggen von Bitoperationen oder Elektronikingenieur beim Entwerfen digitaler Schaltkreise – dieser Binaerrechner liefert sofortige, genaue Ergebnisse mit lehrreichen Schritt-fuer-Schritt-Erklaerungen.',
      ],
      faq: [
        { q: 'Was ist eine binaere AND-Operation?', a: 'Binaeres AND vergleicht zwei Bits und gibt 1 nur zurueck, wenn beide Bits 1 sind. Zum Beispiel: 1101 AND 1010 = 1000. Es wird haeufig fuer Bit-Maskierung verwendet. In der Programmierung wird der AND-Operator in den meisten Sprachen durch & dargestellt.' },
        { q: 'Wie funktioniert binaere Addition?', a: 'Binaere Addition folgt einfachen Regeln: 0+0=0, 0+1=1, 1+0=1 und 1+1=10 (0 mit Uebertrag 1). Uebertraege werden wie bei der Dezimaladdition weitergegeben. Beispiel: 1011 + 1101 = 11000 (11 + 13 = 24 dezimal).' },
        { q: 'Was ist der Unterschied zwischen XOR und OR?', a: 'OR gibt 1 zurueck, wenn eines oder beide Bits 1 sind (inklusives OR). XOR gibt 1 nur zurueck, wenn die Bits unterschiedlich sind. Beispiel: 1 OR 1 = 1, aber 1 XOR 1 = 0. XOR wird in Pruefsummen, Verschluesselung und Bit-Umschaltung verwendet.' },
        { q: 'Was macht die NOT-Operation?', a: 'NOT ist eine unaere Operation, die jedes Bit invertiert: 0 wird 1 und 1 wird 0. Zum Beispiel: NOT 1101 = 0010. NOT wird verwendet, um Bitmasken-Komplemente zu erstellen und in der Zweierkomplement-Arithmetik.' },
        { q: 'Warum sind binaere Operationen in der Programmierung wichtig?', a: 'Binaere Operationen sind entscheidend, weil Computer alles binaer verarbeiten. Bitweise Operationen wie AND, OR, XOR werden fuer Berechtigungssysteme, Grafikmanipulation, Netzwerkprotokolle, Kompressionsalgorithmen und Kryptographie eingesetzt.' },
      ],
    },
    pt: {
      title: 'Calculadora Binaria Gratuita – Realize Operacoes Binarias Online',
      paragraphs: [
        'A aritmetica binaria e a base de toda a computacao digital. Cada calculo que seu computador realiza, desde renderizar graficos ate processar dados, se resume a operacoes com numeros binarios. Compreender operacoes binarias e essencial para programadores, estudantes de ciencia da computacao e qualquer pessoa que trabalhe com sistemas de baixo nivel.',
        'Nossa calculadora binaria gratuita suporta seis operacoes fundamentais: AND, OR, XOR, NOT, Adicao e Subtracao. Operacoes logicas como AND, OR e XOR sao os blocos de construcao dos circuitos digitais e sao amplamente usadas na programacao para mascaramento de bits, configuracao de flags e algoritmos eficientes.',
        'A adicao e subtracao binaria seguem os mesmos principios da aritmetica decimal, mas com apenas dois digitos. Ao somar 1 + 1 em binario, o resultado e 10 (que equivale a 2 em decimal), criando um bit de transporte. Essa propagacao de transporte e como os somadores de hardware funcionam dentro das CPUs.',
        'Esta calculadora exibe resultados em quatro formatos simultaneamente: binario, decimal, hexadecimal e octal. A visualizacao de bits mostra cada bit como uma caixa colorida, facilitando a identificacao de padroes nos dados. A decomposicao passo a passo explica exatamente como cada operacao funciona bit a bit.',
        'As aplicacoes praticas dos calculos binarios incluem mascaramento de sub-redes (operacoes AND), configuracao de flags de permissao em sistemas operacionais, implementacao de algoritmos de criptografia, trabalho com canais de cor em programacao grafica e otimizacao de codigo.',
        'Seja voce um estudante aprendendo fundamentos de ciencia da computacao, um desenvolvedor depurando operacoes bitwise ou um engenheiro eletronico projetando circuitos digitais, esta calculadora binaria fornece resultados instantaneos e precisos com explicacoes passo a passo.',
      ],
      faq: [
        { q: 'O que e uma operacao AND binaria?', a: 'O AND binario compara dois bits e retorna 1 apenas se ambos os bits forem 1. Por exemplo, 1101 AND 1010 = 1000. E comumente usado para mascaramento de bits. Na programacao, o operador AND e representado por & na maioria das linguagens.' },
        { q: 'Como funciona a adicao binaria?', a: 'A adicao binaria segue regras simples: 0+0=0, 0+1=1, 1+0=1 e 1+1=10 (0 com transporte de 1). Os transportes se propagam como na adicao decimal. Por exemplo, 1011 + 1101 = 11000 (11 + 13 = 24 em decimal).' },
        { q: 'Qual e a diferenca entre XOR e OR?', a: 'OR retorna 1 se um ou ambos os bits forem 1 (OR inclusivo). XOR retorna 1 apenas se os bits forem diferentes. Por exemplo, 1 OR 1 = 1, mas 1 XOR 1 = 0. XOR e usado em checksums, criptografia e alternancia de bits.' },
        { q: 'O que faz a operacao NOT?', a: 'NOT e uma operacao unaria que inverte cada bit: 0 torna-se 1 e 1 torna-se 0. Por exemplo, NOT 1101 = 0010. NOT e usado para criar complementos de mascaras de bits e na aritmetica de complemento de dois.' },
        { q: 'Por que as operacoes binarias sao importantes na programacao?', a: 'As operacoes binarias sao cruciais porque os computadores processam tudo em binario. Operacoes bitwise como AND, OR, XOR sao usadas para sistemas de permissoes, manipulacao grafica, protocolos de rede, algoritmos de compressao e criptografia.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="binary-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Input Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Input A */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{l('inputA')}</label>
            <input
              type="text"
              value={inputA}
              onChange={(e) => handleInputA(e.target.value)}
              placeholder="10110101"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* Operation Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{l('operation')}</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {operations.map((op) => (
                <button
                  key={op.value}
                  onClick={() => setOperation(op.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    operation === op.value
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input B (hidden for NOT) */}
          {operation !== 'NOT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l('inputB')}</label>
              <input
                type="text"
                value={inputB}
                onChange={(e) => handleInputB(e.target.value)}
                placeholder="11001010"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 rounded-lg text-red-600 text-center font-medium">{error}</div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={calculate}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-md"
            >
              {l('calculate')}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              {l('reset')}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{l('results')}</h3>
              <button
                onClick={copyAllResults}
                className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition"
              >
                {copiedField === 'all' ? l('copied') : l('copyAll')}
              </button>
            </div>

            {/* Result values */}
            {([
              ['bin', l('binary'), result.bin],
              ['dec', l('decimal'), result.dec],
              ['hex', l('hexadecimal'), result.hex],
              ['oct', l('octal'), result.oct],
            ] as [string, string, string][]).map(([key, label, value]) => (
              <div key={key} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                <div>
                  <div className="text-xs text-gray-500">{label}</div>
                  <div className="font-mono text-lg font-bold text-gray-900 break-all">{value}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(value, key)}
                  className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition ml-3 shrink-0"
                >
                  {copiedField === key ? l('copied') : '\u{1F4CB}'}
                </button>
              </div>
            ))}

            {/* Bit Visualization */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">{l('bitVisualization')}</h4>
              {renderBitBoxes(inputA, `A (${l('inputLabel')})`)}
              {operation !== 'NOT' && inputB && renderBitBoxes(inputB, `B (${l('inputLabel')})`)}
              {renderBitBoxes(result.bin, l('resultLabel'))}
            </div>

            {/* Step-by-Step */}
            <div>
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition mb-2"
              >
                {showSteps ? l('hideSteps') : l('showSteps')}
              </button>
              {showSteps && (
                <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  {result.steps.map((step, i) => (
                    <div key={i} className="whitespace-pre">{step}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Section */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">{l('history')}</h3>
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="text-sm text-red-500 hover:text-red-700 transition"
              >
                {l('clearHistory')}
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-gray-400 text-center py-4">{l('noHistory')}</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.map((entry, i) => (
                <div
                  key={entry.timestamp}
                  className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => {
                    setInputA(entry.a);
                    setInputB(entry.b);
                    setOperation(entry.op);
                    setResult({
                      bin: entry.resultBin,
                      dec: entry.resultDec,
                      hex: entry.resultHex,
                      oct: entry.resultOct,
                      steps: [],
                    });
                  }}
                >
                  <div className="font-mono">
                    <span className="text-gray-500">{entry.a}</span>
                    <span className="text-blue-500 font-bold mx-2">{entry.op}</span>
                    {entry.op !== 'NOT' && <span className="text-gray-500">{entry.b}</span>}
                    <span className="text-gray-400 mx-2">=</span>
                    <span className="text-gray-900 font-bold">{entry.resultBin}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(entry.resultBin, `hist-${i}`);
                    }}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition ml-2 shrink-0"
                  >
                    {copiedField === `hist-${i}` ? l('copied') : '\u{1F4CB}'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEO Article */}
        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => (
            <p key={i} className="text-gray-700 leading-relaxed mb-4">{p}</p>
          ))}
        </article>

        {/* FAQ Accordion */}
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
                {openFaq === i && <div className="px-4 pb-3 text-gray-600">{item.a}</div>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </ToolPageWrapper>
  );
}
