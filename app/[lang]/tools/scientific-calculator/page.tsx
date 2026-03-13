'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function ScientificCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['scientific-calculator'][lang];

  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [newNumber, setNewNumber] = useState(true);
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([]);
  const [copied, setCopied] = useState(false);
  const [memory, setMemory] = useState(0);
  const [error, setError] = useState('');
  const [lastResult, setLastResult] = useState<string | null>(null);

  const labels: Record<string, Record<Locale, string>> = {
    history: {
      en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes',
      fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes',
    },
    copied: {
      en: 'Copied!', it: 'Copiato!', es: '\u00a1Copiado!',
      fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!',
    },
    copyResult: {
      en: 'Copy Result', it: 'Copia Risultato', es: 'Copiar Resultado',
      fr: 'Copier le Résultat', de: 'Ergebnis kopieren', pt: 'Copiar Resultado',
    },
    reset: {
      en: 'Reset All', it: 'Resetta Tutto', es: 'Restablecer Todo',
      fr: 'Tout Réinitialiser', de: 'Alles zurücksetzen', pt: 'Redefinir Tudo',
    },
    clearHistory: {
      en: 'Clear', it: 'Cancella', es: 'Borrar',
      fr: 'Effacer', de: 'Löschen', pt: 'Limpar',
    },
    result: {
      en: 'Result', it: 'Risultato', es: 'Resultado',
      fr: 'Résultat', de: 'Ergebnis', pt: 'Resultado',
    },
    invalidExpr: {
      en: 'Invalid expression', it: 'Espressione non valida', es: 'Expresión no válida',
      fr: 'Expression invalide', de: 'Ungültiger Ausdruck', pt: 'Expressão inválida',
    },
    divByZero: {
      en: 'Cannot divide by zero', it: 'Impossibile dividere per zero', es: 'No se puede dividir por cero',
      fr: 'Division par zéro impossible', de: 'Division durch Null nicht möglich', pt: 'Não é possível dividir por zero',
    },
    memoryStored: {
      en: 'Memory', it: 'Memoria', es: 'Memoria',
      fr: 'Mémoire', de: 'Speicher', pt: 'Memória',
    },
    degrees: {
      en: 'Degrees', it: 'Gradi', es: 'Grados',
      fr: 'Degrés', de: 'Grad', pt: 'Graus',
    },
    radians: {
      en: 'Radians', it: 'Radianti', es: 'Radianes',
      fr: 'Radians', de: 'Bogenmaß', pt: 'Radianos',
    },
  };

  const addToHistory = (expr: string, result: string) => {
    setHistory(prev => [{ expr, result }, ...prev].slice(0, 10));
  };

  const copyResult = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const appendToDisplay = (value: string) => {
    setError('');
    if (newNumber) {
      setDisplay(value);
      setExpression(expression + value);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? value : display + value);
      setExpression(expression + value);
    }
  };

  const appendOperator = (op: string) => {
    setError('');
    setExpression(expression + ' ' + op + ' ');
    setNewNumber(true);
  };

  const appendFunction = (fn: string) => {
    setError('');
    const current = parseFloat(display);
    if (isNaN(current)) {
      setError(labels.invalidExpr[lang]);
      return;
    }
    let result: number;
    const toRad = angleMode === 'deg' ? (v: number) => v * Math.PI / 180 : (v: number) => v;
    switch (fn) {
      case 'sin': result = Math.sin(toRad(current)); break;
      case 'cos': result = Math.cos(toRad(current)); break;
      case 'tan': result = Math.tan(toRad(current)); break;
      case 'ln':
        if (current <= 0) { setError(labels.invalidExpr[lang]); return; }
        result = Math.log(current); break;
      case 'log':
        if (current <= 0) { setError(labels.invalidExpr[lang]); return; }
        result = Math.log10(current); break;
      case 'sqrt':
        if (current < 0) { setError(labels.invalidExpr[lang]); return; }
        result = Math.sqrt(current); break;
      case 'x2': result = current * current; break;
      case '1/x':
        if (current === 0) { setError(labels.divByZero[lang]); return; }
        result = 1 / current; break;
      case 'abs': result = Math.abs(current); break;
      case 'fact': {
        if (current < 0 || current > 170 || current !== Math.floor(current)) {
          setError(labels.invalidExpr[lang]); return;
        }
        let f = 1;
        for (let i = 2; i <= Math.floor(current); i++) f *= i;
        result = f;
        break;
      }
      default: result = current;
    }
    const str = isFinite(result) ? String(parseFloat(result.toPrecision(12))) : 'Error';
    if (str === 'Error') {
      setError(labels.invalidExpr[lang]);
      setDisplay('Error');
      setExpression('');
      setNewNumber(true);
      return;
    }
    addToHistory(`${fn}(${current})`, str);
    setDisplay(str);
    setLastResult(str);
    setExpression(str);
    setNewNumber(true);
  };

  const insertConstant = (value: number) => {
    setError('');
    const str = String(value);
    setDisplay(str);
    setExpression(expression + (newNumber ? '' : ' ') + str);
    setNewNumber(true);
  };

  const calculate = () => {
    setError('');
    try {
      const sanitized = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**');
      if (!sanitized.trim()) {
        setError(labels.invalidExpr[lang]);
        return;
      }
      // eslint-disable-next-line no-eval
      const result = Function('"use strict"; return (' + sanitized + ')')();
      if (result === undefined || result === null) {
        setError(labels.invalidExpr[lang]);
        setDisplay('Error');
        setExpression('');
        setNewNumber(true);
        return;
      }
      const str = isFinite(result) ? String(parseFloat(Number(result).toPrecision(12))) : 'Error';
      if (str === 'Error') {
        setError(labels.invalidExpr[lang]);
      }
      addToHistory(expression, str);
      setDisplay(str);
      setLastResult(str);
      setExpression(str);
      setNewNumber(true);
    } catch {
      setError(labels.invalidExpr[lang]);
      setDisplay('Error');
      setExpression('');
      setNewNumber(true);
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setExpression('');
    setNewNumber(true);
    setError('');
    setLastResult(null);
  };

  const resetAll = () => {
    clearAll();
    setMemory(0);
    setHistory([]);
  };

  const backspace = () => {
    setError('');
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
      setExpression(expression.slice(0, -1));
    } else {
      setDisplay('0');
      setNewNumber(true);
    }
  };

  const toggleSign = () => {
    if (display !== '0') {
      const newVal = display.startsWith('-') ? display.slice(1) : '-' + display;
      setDisplay(newVal);
      setExpression(expression.slice(0, expression.length - display.length) + newVal);
    }
  };

  // Memory functions
  const memoryAdd = () => {
    const current = parseFloat(display);
    if (!isNaN(current)) setMemory(prev => prev + current);
  };
  const memorySub = () => {
    const current = parseFloat(display);
    if (!isNaN(current)) setMemory(prev => prev - current);
  };
  const memoryRecall = () => {
    const str = String(memory);
    setDisplay(str);
    setExpression(expression + (newNumber ? '' : ' ') + str);
    setNewNumber(true);
  };
  const memoryClear = () => {
    setMemory(0);
  };

  const btnClass = (color: string) => {
    const base = 'rounded-lg font-medium text-center py-3 px-2 transition-colors active:scale-95 text-sm ';
    if (color === 'op') return base + 'bg-blue-100 text-blue-700 hover:bg-blue-200';
    if (color === 'fn') return base + 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    if (color === 'eq') return base + 'bg-blue-600 text-white hover:bg-blue-700 shadow-md';
    if (color === 'clr') return base + 'bg-red-100 text-red-700 hover:bg-red-200';
    if (color === 'mem') return base + 'bg-purple-100 text-purple-700 hover:bg-purple-200';
    return base + 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50';
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Scientific Calculator: Advanced Math at Your Fingertips',
      paragraphs: [
        'A scientific calculator goes beyond basic arithmetic to provide advanced mathematical functions essential for students, engineers, scientists, and professionals. While a standard calculator handles addition, subtraction, multiplication, and division, a scientific calculator adds trigonometric functions, logarithms, powers, roots, and mathematical constants like pi and Euler\'s number (e).',
        'Our online scientific calculator features a clean button-grid layout that mimics a physical calculator. The display shows your current input and allows you to build complex expressions. You can chain operations together, use parentheses for grouping, and apply functions like sine, cosine, and tangent using degree-based calculations.',
        'The logarithmic functions include both natural logarithm (ln, base e) and common logarithm (log, base 10). These are critical for solving exponential equations, analyzing data in science, and working with decibel scales in engineering. Power operations let you raise any number to any exponent, while the square root function handles the most common root operation.',
        'Mathematical constants pi and e are available as single-button inputs for convenience. The factorial function (n!) calculates the product of all positive integers up to n, essential for probability and combinatorics. The reciprocal function (1/x) and absolute value round out the toolkit. Whether you need to solve homework problems, verify engineering calculations, or perform quick scientific computations, this calculator provides all the essential functions in a free, browser-based tool.'
      ],
      faq: [
        { q: 'Are trigonometric functions calculated in degrees or radians?', a: 'You can toggle between degrees and radians using the DEG/RAD button. By default, the calculator uses degrees. For example, sin(90) returns 1 in degree mode, and sin(\u03c0/2) returns 1 in radian mode.' },
        { q: 'How precise are the calculations?', a: 'The calculator uses JavaScript\'s native 64-bit floating-point arithmetic, which provides approximately 15-17 significant decimal digits of precision. Results are displayed with up to 12 significant figures.' },
        { q: 'Can I chain multiple operations together?', a: 'Yes. You can build expressions by pressing numbers and operators in sequence. The expression is evaluated when you press the equals button. Standard mathematical order of operations applies.' },
        { q: 'What happens if I divide by zero?', a: 'Dividing by zero will display "Error" or "Infinity" depending on the operation. The calculator handles edge cases gracefully and allows you to clear and start over.' },
        { q: 'Can I calculate powers and exponents?', a: 'Yes. Use the x^y button to raise any number to any power. You can also use the x\u00b2 button for quick squaring. For example, 2^10 gives 1024.' }
      ]
    },
    it: {
      title: 'Calcolatrice Scientifica: Matematica Avanzata a Portata di Mano',
      paragraphs: [
        'Una calcolatrice scientifica va oltre l\'aritmetica di base per fornire funzioni matematiche avanzate essenziali per studenti, ingegneri, scienziati e professionisti. Mentre una calcolatrice standard gestisce addizione, sottrazione, moltiplicazione e divisione, una calcolatrice scientifica aggiunge funzioni trigonometriche, logaritmi, potenze, radici e costanti matematiche come pi greco ed e di Eulero.',
        'La nostra calcolatrice scientifica online presenta un layout a griglia pulito che imita una calcolatrice fisica. Il display mostra l\'input corrente e permette di costruire espressioni complesse. Puoi concatenare operazioni, usare parentesi per il raggruppamento e applicare funzioni come seno, coseno e tangente.',
        'Le funzioni logaritmiche includono sia il logaritmo naturale (ln, base e) che il logaritmo comune (log, base 10). Questi sono fondamentali per risolvere equazioni esponenziali e analizzare dati scientifici. Le operazioni di potenza permettono di elevare qualsiasi numero a qualsiasi esponente, mentre la radice quadrata gestisce l\'operazione di radice pi\u00f9 comune.',
        'Le costanti matematiche pi e e sono disponibili come input a pulsante singolo. La funzione fattoriale (n!) calcola il prodotto di tutti gli interi positivi fino a n, essenziale per probabilit\u00e0 e combinatoria. Il reciproco (1/x) e il valore assoluto completano il toolkit.'
      ],
      faq: [
        { q: 'Le funzioni trigonometriche sono calcolate in gradi o radianti?', a: 'Puoi alternare tra gradi e radianti usando il pulsante DEG/RAD. Di default, la calcolatrice usa i gradi. Ad esempio, sin(90) restituisce 1 in modalit\u00e0 gradi.' },
        { q: 'Quanto sono precise le calcolazioni?', a: 'La calcolatrice usa l\'aritmetica nativa a virgola mobile a 64 bit di JavaScript, che fornisce circa 15-17 cifre decimali significative di precisione.' },
        { q: 'Posso concatenare pi\u00f9 operazioni?', a: 'S\u00ec. Puoi costruire espressioni premendo numeri e operatori in sequenza. L\'espressione viene valutata quando premi il pulsante uguale.' },
        { q: 'Cosa succede se divido per zero?', a: 'Dividere per zero mostrer\u00e0 "Error" o "Infinity". La calcolatrice gestisce i casi limite e permette di cancellare e ricominciare.' },
        { q: 'Posso calcolare potenze ed esponenti?', a: 'S\u00ec. Usa il pulsante x^y per elevare qualsiasi numero a qualsiasi potenza. Puoi anche usare x\u00b2 per il quadrato rapido.' }
      ]
    },
    es: {
      title: 'Calculadora Cient\u00edfica: Matem\u00e1ticas Avanzadas al Alcance de tu Mano',
      paragraphs: [
        'Una calculadora cient\u00edfica va m\u00e1s all\u00e1 de la aritm\u00e9tica b\u00e1sica para proporcionar funciones matem\u00e1ticas avanzadas esenciales para estudiantes, ingenieros, cient\u00edficos y profesionales. Mientras una calculadora est\u00e1ndar maneja suma, resta, multiplicaci\u00f3n y divisi\u00f3n, una cient\u00edfica a\u00f1ade funciones trigonom\u00e9tricas, logaritmos, potencias, ra\u00edces y constantes matem\u00e1ticas como pi y el n\u00famero de Euler (e).',
        'Nuestra calculadora cient\u00edfica online presenta un dise\u00f1o de cuadr\u00edcula limpio que imita una calculadora f\u00edsica. La pantalla muestra tu entrada actual y permite construir expresiones complejas. Puedes encadenar operaciones, usar par\u00e9ntesis para agrupar y aplicar funciones como seno, coseno y tangente con c\u00e1lculos basados en grados.',
        'Las funciones logar\u00edtmicas incluyen tanto el logaritmo natural (ln, base e) como el logaritmo com\u00fan (log, base 10). Estos son cr\u00edticos para resolver ecuaciones exponenciales y analizar datos cient\u00edficos. Las operaciones de potencia permiten elevar cualquier n\u00famero a cualquier exponente.',
        'Las constantes matem\u00e1ticas pi y e est\u00e1n disponibles como entradas de un solo bot\u00f3n. La funci\u00f3n factorial (n!) calcula el producto de todos los enteros positivos hasta n, esencial para probabilidad y combinatoria. El rec\u00edproco (1/x) y el valor absoluto completan el conjunto de herramientas.'
      ],
      faq: [
        { q: '\u00bfLas funciones trigonom\u00e9tricas se calculan en grados o radianes?', a: 'Puedes alternar entre grados y radianes usando el bot\u00f3n DEG/RAD. Por defecto, la calculadora usa grados. Por ejemplo, sin(90) devuelve 1 en modo grados.' },
        { q: '\u00bfQu\u00e9 tan precisos son los c\u00e1lculos?', a: 'La calculadora usa aritm\u00e9tica de punto flotante nativa de 64 bits de JavaScript, proporcionando aproximadamente 15-17 d\u00edgitos decimales significativos de precisi\u00f3n.' },
        { q: '\u00bfPuedo encadenar m\u00faltiples operaciones?', a: 'S\u00ed. Puedes construir expresiones presionando n\u00fameros y operadores en secuencia. La expresi\u00f3n se eval\u00faa al presionar el bot\u00f3n igual.' },
        { q: '\u00bfQu\u00e9 pasa si divido por cero?', a: 'Dividir por cero mostrar\u00e1 "Error" o "Infinity". La calculadora maneja los casos extremos y permite limpiar y empezar de nuevo.' },
        { q: '\u00bfPuedo calcular potencias y exponentes?', a: 'S\u00ed. Usa el bot\u00f3n x^y para elevar cualquier n\u00famero a cualquier potencia. Tambi\u00e9n puedes usar x\u00b2 para elevar al cuadrado r\u00e1pidamente.' }
      ]
    },
    fr: {
      title: 'Calculatrice Scientifique : Math\u00e9matiques Avanc\u00e9es \u00e0 Port\u00e9e de Main',
      paragraphs: [
        'Une calculatrice scientifique va au-del\u00e0 de l\'arithm\u00e9tique de base pour fournir des fonctions math\u00e9matiques avanc\u00e9es essentielles pour les \u00e9tudiants, ing\u00e9nieurs, scientifiques et professionnels. Alors qu\'une calculatrice standard g\u00e8re l\'addition, la soustraction, la multiplication et la division, une calculatrice scientifique ajoute les fonctions trigonom\u00e9triques, les logarithmes, les puissances, les racines et les constantes math\u00e9matiques.',
        'Notre calculatrice scientifique en ligne pr\u00e9sente une disposition en grille propre qui imite une calculatrice physique. L\'\u00e9cran affiche votre saisie actuelle et vous permet de construire des expressions complexes. Vous pouvez encha\u00eener les op\u00e9rations, utiliser des parenth\u00e8ses et appliquer des fonctions comme sinus, cosinus et tangente.',
        'Les fonctions logarithmiques incluent le logarithme naturel (ln, base e) et le logarithme d\u00e9cimal (log, base 10). Ceux-ci sont essentiels pour r\u00e9soudre des \u00e9quations exponentielles et analyser des donn\u00e9es scientifiques. Les op\u00e9rations de puissance permettent d\'\u00e9lever n\'importe quel nombre \u00e0 n\'importe quel exposant.',
        'Les constantes math\u00e9matiques pi et e sont disponibles en un seul clic. La fonction factorielle (n!) calcule le produit de tous les entiers positifs jusqu\'\u00e0 n, essentielle pour les probabilit\u00e9s et la combinatoire. L\'inverse (1/x) et la valeur absolue compl\u00e8tent la bo\u00eete \u00e0 outils.'
      ],
      faq: [
        { q: 'Les fonctions trigonom\u00e9triques sont-elles calcul\u00e9es en degr\u00e9s ou en radians ?', a: 'Vous pouvez basculer entre degr\u00e9s et radians avec le bouton DEG/RAD. Par d\u00e9faut, la calculatrice utilise les degr\u00e9s. Par exemple, sin(90) renvoie 1 en mode degr\u00e9s.' },
        { q: 'Quelle est la pr\u00e9cision des calculs ?', a: 'La calculatrice utilise l\'arithm\u00e9tique native en virgule flottante 64 bits de JavaScript, offrant environ 15-17 chiffres d\u00e9cimaux significatifs de pr\u00e9cision.' },
        { q: 'Puis-je encha\u00eener plusieurs op\u00e9rations ?', a: 'Oui. Vous pouvez construire des expressions en appuyant sur les nombres et op\u00e9rateurs en s\u00e9quence. L\'expression est \u00e9valu\u00e9e lorsque vous appuyez sur le bouton \u00e9gal.' },
        { q: 'Que se passe-t-il si je divise par z\u00e9ro ?', a: 'Diviser par z\u00e9ro affichera "Error" ou "Infinity". La calculatrice g\u00e8re les cas limites et permet d\'effacer et de recommencer.' },
        { q: 'Puis-je calculer des puissances et des exposants ?', a: 'Oui. Utilisez le bouton x^y pour \u00e9lever n\'importe quel nombre \u00e0 n\'importe quelle puissance. Vous pouvez aussi utiliser x\u00b2 pour le carr\u00e9 rapide.' }
      ]
    },
    de: {
      title: 'Wissenschaftlicher Taschenrechner: Fortgeschrittene Mathematik auf Knopfdruck',
      paragraphs: [
        'Ein wissenschaftlicher Taschenrechner geht \u00fcber die Grundrechenarten hinaus und bietet fortgeschrittene mathematische Funktionen, die f\u00fcr Studenten, Ingenieure, Wissenschaftler und Fachleute unerl\u00e4sslich sind. W\u00e4hrend ein Standardrechner Addition, Subtraktion, Multiplikation und Division beherrscht, f\u00fcgt ein wissenschaftlicher Rechner trigonometrische Funktionen, Logarithmen, Potenzen, Wurzeln und mathematische Konstanten hinzu.',
        'Unser Online-Wissenschaftsrechner verf\u00fcgt \u00fcber ein \u00fcbersichtliches Tastenlayout, das einem physischen Taschenrechner nachempfunden ist. Das Display zeigt Ihre aktuelle Eingabe und erm\u00f6glicht das Erstellen komplexer Ausdr\u00fccke. Sie k\u00f6nnen Operationen verketten, Klammern zur Gruppierung verwenden und Funktionen wie Sinus, Kosinus und Tangens anwenden.',
        'Die Logarithmusfunktionen umfassen sowohl den nat\u00fcrlichen Logarithmus (ln, Basis e) als auch den dekadischen Logarithmus (log, Basis 10). Diese sind entscheidend f\u00fcr das L\u00f6sen von Exponentialgleichungen und die Analyse wissenschaftlicher Daten. Potenzoperationen erlauben es, jede Zahl mit jedem Exponenten zu potenzieren.',
        'Die mathematischen Konstanten Pi und e sind als Einzeltasten verf\u00fcgbar. Die Fakult\u00e4tsfunktion (n!) berechnet das Produkt aller positiven ganzen Zahlen bis n, wesentlich f\u00fcr Wahrscheinlichkeit und Kombinatorik. Der Kehrwert (1/x) und der Absolutwert vervollst\u00e4ndigen das Werkzeugset.'
      ],
      faq: [
        { q: 'Werden trigonometrische Funktionen in Grad oder Bogenma\u00df berechnet?', a: 'Sie k\u00f6nnen zwischen Grad und Bogenma\u00df mit der DEG/RAD-Taste umschalten. Standardm\u00e4\u00dfig verwendet der Rechner Grad. Beispiel: sin(90) gibt 1 im Grad-Modus zur\u00fcck.' },
        { q: 'Wie pr\u00e4zise sind die Berechnungen?', a: 'Der Rechner verwendet JavaScripts native 64-Bit-Gleitkommaarithmetik, die etwa 15-17 signifikante Dezimalstellen Pr\u00e4zision bietet.' },
        { q: 'Kann ich mehrere Operationen verketten?', a: 'Ja. Sie k\u00f6nnen Ausdr\u00fccke aufbauen, indem Sie Zahlen und Operatoren nacheinander dr\u00fccken. Der Ausdruck wird beim Dr\u00fccken der Gleichtaste ausgewertet.' },
        { q: 'Was passiert, wenn ich durch Null teile?', a: 'Division durch Null zeigt "Error" oder "Infinity" an. Der Rechner behandelt Grenzf\u00e4lle und erm\u00f6glicht das L\u00f6schen und Neustarten.' },
        { q: 'Kann ich Potenzen und Exponenten berechnen?', a: 'Ja. Verwenden Sie die x^y-Taste, um jede Zahl zu potenzieren. Sie k\u00f6nnen auch x\u00b2 f\u00fcr schnelles Quadrieren verwenden.' }
      ]
    },
    pt: {
      title: 'Calculadora Cient\u00edfica: Matem\u00e1tica Avan\u00e7ada na Ponta dos Dedos',
      paragraphs: [
        'Uma calculadora cient\u00edfica vai al\u00e9m da aritm\u00e9tica b\u00e1sica para fornecer fun\u00e7\u00f5es matem\u00e1ticas avan\u00e7adas essenciais para estudantes, engenheiros, cientistas e profissionais. Enquanto uma calculadora padr\u00e3o lida com adi\u00e7\u00e3o, subtra\u00e7\u00e3o, multiplica\u00e7\u00e3o e divis\u00e3o, uma cient\u00edfica adiciona fun\u00e7\u00f5es trigonom\u00e9tricas, logaritmos, pot\u00eancias, ra\u00edzes e constantes matem\u00e1ticas como pi e o n\u00famero de Euler (e).',
        'Nossa calculadora cient\u00edfica online apresenta um layout de grade limpo que imita uma calculadora f\u00edsica. O display mostra sua entrada atual e permite construir express\u00f5es complexas. Voc\u00ea pode encadear opera\u00e7\u00f5es, usar par\u00eanteses para agrupamento e aplicar fun\u00e7\u00f5es como seno, cosseno e tangente com c\u00e1lculos baseados em graus.',
        'As fun\u00e7\u00f5es logar\u00edtmicas incluem tanto o logaritmo natural (ln, base e) quanto o logaritmo comum (log, base 10). Estes s\u00e3o cr\u00edticos para resolver equa\u00e7\u00f5es exponenciais e analisar dados cient\u00edficos. As opera\u00e7\u00f5es de pot\u00eancia permitem elevar qualquer n\u00famero a qualquer expoente.',
        'As constantes matem\u00e1ticas pi e e est\u00e3o dispon\u00edveis como entradas de bot\u00e3o \u00fanico. A fun\u00e7\u00e3o fatorial (n!) calcula o produto de todos os inteiros positivos at\u00e9 n, essencial para probabilidade e combinat\u00f3ria. O rec\u00edproco (1/x) e o valor absoluto completam o conjunto de ferramentas.'
      ],
      faq: [
        { q: 'As fun\u00e7\u00f5es trigonom\u00e9tricas s\u00e3o calculadas em graus ou radianos?', a: 'Voc\u00ea pode alternar entre graus e radianos usando o bot\u00e3o DEG/RAD. Por padr\u00e3o, a calculadora usa graus. Por exemplo, sin(90) retorna 1 no modo graus.' },
        { q: 'Qual a precis\u00e3o dos c\u00e1lculos?', a: 'A calculadora usa aritm\u00e9tica nativa de ponto flutuante de 64 bits do JavaScript, fornecendo aproximadamente 15-17 d\u00edgitos decimais significativos de precis\u00e3o.' },
        { q: 'Posso encadear m\u00faltiplas opera\u00e7\u00f5es?', a: 'Sim. Voc\u00ea pode construir express\u00f5es pressionando n\u00fameros e operadores em sequ\u00eancia. A express\u00e3o \u00e9 avaliada ao pressionar o bot\u00e3o igual.' },
        { q: 'O que acontece se eu dividir por zero?', a: 'Dividir por zero mostrar\u00e1 "Error" ou "Infinity". A calculadora lida com casos extremos e permite limpar e recome\u00e7ar.' },
        { q: 'Posso calcular pot\u00eancias e expoentes?', a: 'Sim. Use o bot\u00e3o x^y para elevar qualquer n\u00famero a qualquer pot\u00eancia. Voc\u00ea tamb\u00e9m pode usar x\u00b2 para elevar ao quadrado rapidamente.' }
      ]
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="scientific-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {/* Display */}
          <div className="bg-gray-900 rounded-lg p-4 mb-4 relative">
            <div className="flex justify-between items-center mb-1">
              {/* Angle mode toggle */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setAngleMode('deg')}
                  className={`text-xs font-mono px-2 py-0.5 rounded transition-colors ${angleMode === 'deg' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                  title={labels.degrees[lang]}
                >
                  DEG
                </button>
                <button
                  onClick={() => setAngleMode('rad')}
                  className={`text-xs font-mono px-2 py-0.5 rounded transition-colors ${angleMode === 'rad' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                  title={labels.radians[lang]}
                >
                  RAD
                </button>
              </div>
              {/* Memory indicator */}
              {memory !== 0 && (
                <span className="text-xs font-mono text-purple-400">M={memory}</span>
              )}
            </div>
            <div className="text-right text-gray-400 text-sm h-5 overflow-hidden">{expression || ' '}</div>
            <div className={`text-right text-3xl font-mono font-bold overflow-hidden transition-colors ${display === 'Error' ? 'text-red-400' : 'text-white'}`}>{display}</div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Memory buttons row */}
          <div className="grid grid-cols-4 gap-2 mb-2">
            <button onClick={memoryClear} className={btnClass('mem')}>MC</button>
            <button onClick={memoryRecall} className={btnClass('mem')}>MR</button>
            <button onClick={memoryAdd} className={btnClass('mem')}>M+</button>
            <button onClick={memorySub} className={btnClass('mem')}>M-</button>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {/* Row 1: Functions */}
            <button onClick={() => appendFunction('sin')} className={btnClass('fn')}>sin</button>
            <button onClick={() => appendFunction('cos')} className={btnClass('fn')}>cos</button>
            <button onClick={() => appendFunction('tan')} className={btnClass('fn')}>tan</button>
            <button onClick={() => appendFunction('ln')} className={btnClass('fn')}>ln</button>
            <button onClick={() => appendFunction('log')} className={btnClass('fn')}>log</button>

            {/* Row 2: More functions */}
            <button onClick={() => appendFunction('sqrt')} className={btnClass('fn')}>&radic;</button>
            <button onClick={() => appendFunction('x2')} className={btnClass('fn')}>x&sup2;</button>
            <button onClick={() => appendOperator('^')} className={btnClass('fn')}>x^y</button>
            <button onClick={() => appendFunction('fact')} className={btnClass('fn')}>n!</button>
            <button onClick={() => appendFunction('1/x')} className={btnClass('fn')}>1/x</button>

            {/* Row 3: Constants + operators */}
            <button onClick={() => insertConstant(Math.PI)} className={btnClass('fn')}>&pi;</button>
            <button onClick={() => insertConstant(Math.E)} className={btnClass('fn')}>e</button>
            <button onClick={() => appendFunction('abs')} className={btnClass('fn')}>|x|</button>
            <button onClick={() => { setExpression(expression + '('); setNewNumber(true); }} className={btnClass('fn')}>(</button>
            <button onClick={() => { setExpression(expression + ')'); setNewNumber(true); }} className={btnClass('fn')}>)</button>

            {/* Row 4: 7 8 9 / C */}
            <button onClick={() => appendToDisplay('7')} className={btnClass('num')}>7</button>
            <button onClick={() => appendToDisplay('8')} className={btnClass('num')}>8</button>
            <button onClick={() => appendToDisplay('9')} className={btnClass('num')}>9</button>
            <button onClick={() => appendOperator('/')} className={btnClass('op')}>&divide;</button>
            <button onClick={clearAll} className={btnClass('clr')}>C</button>

            {/* Row 5: 4 5 6 * back */}
            <button onClick={() => appendToDisplay('4')} className={btnClass('num')}>4</button>
            <button onClick={() => appendToDisplay('5')} className={btnClass('num')}>5</button>
            <button onClick={() => appendToDisplay('6')} className={btnClass('num')}>6</button>
            <button onClick={() => appendOperator('*')} className={btnClass('op')}>&times;</button>
            <button onClick={backspace} className={btnClass('clr')}>&larr;</button>

            {/* Row 6: 1 2 3 - +/- */}
            <button onClick={() => appendToDisplay('1')} className={btnClass('num')}>1</button>
            <button onClick={() => appendToDisplay('2')} className={btnClass('num')}>2</button>
            <button onClick={() => appendToDisplay('3')} className={btnClass('num')}>3</button>
            <button onClick={() => appendOperator('-')} className={btnClass('op')}>&minus;</button>
            <button onClick={toggleSign} className={btnClass('fn')}>&plusmn;</button>

            {/* Row 7: 0 . = + */}
            <button onClick={() => appendToDisplay('0')} className={btnClass('num')}>0</button>
            <button onClick={() => appendToDisplay('.')} className={btnClass('num')}>.</button>
            <button onClick={calculate} className={btnClass('eq')}>=</button>
            <button onClick={() => appendOperator('+')} className={btnClass('op')}>+</button>
            <button onClick={() => appendOperator('%')} className={btnClass('fn')}>%</button>
          </div>

          {/* Reset button */}
          <button
            onClick={resetAll}
            className="mt-3 w-full py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            {labels.reset[lang]}
          </button>
        </div>

        {/* Result Card */}
        {lastResult && lastResult !== 'Error' && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">{labels.result[lang]}</p>
                <p className="text-3xl font-mono font-bold text-green-900">{lastResult}</p>
              </div>
              <button
                onClick={copyResult}
                className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {copied ? labels.copied[lang] : labels.copyResult[lang]}
              </button>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">{labels.history[lang]}</h3>
              <button onClick={() => setHistory([])} className="text-xs text-red-500 hover:text-red-700 transition-colors">{labels.clearHistory[lang]}</button>
            </div>
            <div className="space-y-1">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between text-sm font-mono px-2 py-1 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer transition-colors" onClick={() => { setDisplay(h.result); setExpression(h.result); setNewNumber(true); }}>
                  <span className="text-gray-500 truncate mr-2">{h.expr}</span>
                  <span className="text-gray-900 font-semibold">{h.result}</span>
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
