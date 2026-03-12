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

  const addToHistory = (expr: string, result: string) => {
    setHistory(prev => [{ expr, result }, ...prev].slice(0, 5));
  };

  const copyResult = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const appendToDisplay = (value: string) => {
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
    setExpression(expression + ' ' + op + ' ');
    setNewNumber(true);
  };

  const appendFunction = (fn: string) => {
    const current = parseFloat(display);
    let result: number;
    const toRad = angleMode === 'deg' ? (v: number) => v * Math.PI / 180 : (v: number) => v;
    switch (fn) {
      case 'sin': result = Math.sin(toRad(current)); break;
      case 'cos': result = Math.cos(toRad(current)); break;
      case 'tan': result = Math.tan(toRad(current)); break;
      case 'ln': result = Math.log(current); break;
      case 'log': result = Math.log10(current); break;
      case 'sqrt': result = Math.sqrt(current); break;
      case 'x2': result = current * current; break;
      case '1/x': result = 1 / current; break;
      case 'abs': result = Math.abs(current); break;
      case 'fact': {
        let f = 1;
        for (let i = 2; i <= Math.floor(current); i++) f *= i;
        result = f;
        break;
      }
      default: result = current;
    }
    const str = isFinite(result) ? String(parseFloat(result.toPrecision(12))) : 'Error';
    addToHistory(`${fn}(${current})`, str);
    setDisplay(str);
    setExpression(str);
    setNewNumber(true);
  };

  const insertConstant = (value: number) => {
    const str = String(value);
    setDisplay(str);
    setExpression(expression + (newNumber ? '' : ' ') + str);
    setNewNumber(true);
  };

  const calculate = () => {
    try {
      const sanitized = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**');
      // eslint-disable-next-line no-eval
      const result = Function('"use strict"; return (' + sanitized + ')')();
      const str = isFinite(result) ? String(parseFloat(Number(result).toPrecision(12))) : 'Error';
      addToHistory(expression, str);
      setDisplay(str);
      setExpression(str);
      setNewNumber(true);
    } catch {
      setDisplay('Error');
      setExpression('');
      setNewNumber(true);
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setExpression('');
    setNewNumber(true);
  };

  const backspace = () => {
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

  const btnClass = (color: string) => {
    const base = 'rounded-lg font-medium text-center py-3 px-2 transition-all active:scale-95 text-sm ';
    if (color === 'op') return base + 'bg-blue-100 text-blue-700 hover:bg-blue-200';
    if (color === 'fn') return base + 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    if (color === 'eq') return base + 'bg-blue-600 text-white hover:bg-blue-700 shadow-md';
    if (color === 'clr') return base + 'bg-red-100 text-red-700 hover:bg-red-200';
    return base + 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50';
  };

  const historyLabels: Record<Locale, string> = {
    en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes',
    fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes',
  };

  const copyLabels: Record<Locale, string> = {
    en: 'Copied!', it: 'Copiato!', es: 'Copiado!',
    fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!',
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
        { q: 'Are trigonometric functions calculated in degrees or radians?', a: 'You can toggle between degrees and radians using the DEG/RAD button. By default, the calculator uses degrees. For example, sin(90) returns 1 in degree mode, and sin(π/2) returns 1 in radian mode.' },
        { q: 'How precise are the calculations?', a: 'The calculator uses JavaScript\'s native 64-bit floating-point arithmetic, which provides approximately 15-17 significant decimal digits of precision. Results are displayed with up to 12 significant figures.' },
        { q: 'Can I chain multiple operations together?', a: 'Yes. You can build expressions by pressing numbers and operators in sequence. The expression is evaluated when you press the equals button. Standard mathematical order of operations applies.' },
        { q: 'What happens if I divide by zero?', a: 'Dividing by zero will display "Error" or "Infinity" depending on the operation. The calculator handles edge cases gracefully and allows you to clear and start over.' },
        { q: 'Can I calculate powers and exponents?', a: 'Yes. Use the x^y button to raise any number to any power. You can also use the x² button for quick squaring. For example, 2^10 gives 1024.' }
      ]
    },
    it: {
      title: 'Calcolatrice Scientifica: Matematica Avanzata a Portata di Mano',
      paragraphs: [
        'Una calcolatrice scientifica va oltre l\'aritmetica di base per fornire funzioni matematiche avanzate essenziali per studenti, ingegneri, scienziati e professionisti. Mentre una calcolatrice standard gestisce addizione, sottrazione, moltiplicazione e divisione, una calcolatrice scientifica aggiunge funzioni trigonometriche, logaritmi, potenze, radici e costanti matematiche come pi greco ed e di Eulero.',
        'La nostra calcolatrice scientifica online presenta un layout a griglia pulito che imita una calcolatrice fisica. Il display mostra l\'input corrente e permette di costruire espressioni complesse. Puoi concatenare operazioni, usare parentesi per il raggruppamento e applicare funzioni come seno, coseno e tangente.',
        'Le funzioni logaritmiche includono sia il logaritmo naturale (ln, base e) che il logaritmo comune (log, base 10). Questi sono fondamentali per risolvere equazioni esponenziali e analizzare dati scientifici. Le operazioni di potenza permettono di elevare qualsiasi numero a qualsiasi esponente, mentre la radice quadrata gestisce l\'operazione di radice più comune.',
        'Le costanti matematiche pi e e sono disponibili come input a pulsante singolo. La funzione fattoriale (n!) calcola il prodotto di tutti gli interi positivi fino a n, essenziale per probabilità e combinatoria. Il reciproco (1/x) e il valore assoluto completano il toolkit.'
      ],
      faq: [
        { q: 'Le funzioni trigonometriche sono calcolate in gradi o radianti?', a: 'Puoi alternare tra gradi e radianti usando il pulsante DEG/RAD. Di default, la calcolatrice usa i gradi. Ad esempio, sin(90) restituisce 1 in modalità gradi.' },
        { q: 'Quanto sono precise le calcolazioni?', a: 'La calcolatrice usa l\'aritmetica nativa a virgola mobile a 64 bit di JavaScript, che fornisce circa 15-17 cifre decimali significative di precisione.' },
        { q: 'Posso concatenare più operazioni?', a: 'Sì. Puoi costruire espressioni premendo numeri e operatori in sequenza. L\'espressione viene valutata quando premi il pulsante uguale.' },
        { q: 'Cosa succede se divido per zero?', a: 'Dividere per zero mostrerà "Error" o "Infinity". La calcolatrice gestisce i casi limite e permette di cancellare e ricominciare.' },
        { q: 'Posso calcolare potenze ed esponenti?', a: 'Sì. Usa il pulsante x^y per elevare qualsiasi numero a qualsiasi potenza. Puoi anche usare x² per il quadrato rapido.' }
      ]
    },
    es: {
      title: 'Calculadora Científica: Matemáticas Avanzadas al Alcance de tu Mano',
      paragraphs: [
        'Una calculadora científica va más allá de la aritmética básica para proporcionar funciones matemáticas avanzadas esenciales para estudiantes, ingenieros, científicos y profesionales. Mientras una calculadora estándar maneja suma, resta, multiplicación y división, una científica añade funciones trigonométricas, logaritmos, potencias, raíces y constantes matemáticas como pi y el número de Euler (e).',
        'Nuestra calculadora científica online presenta un diseño de cuadrícula limpio que imita una calculadora física. La pantalla muestra tu entrada actual y permite construir expresiones complejas. Puedes encadenar operaciones, usar paréntesis para agrupar y aplicar funciones como seno, coseno y tangente con cálculos basados en grados.',
        'Las funciones logarítmicas incluyen tanto el logaritmo natural (ln, base e) como el logaritmo común (log, base 10). Estos son críticos para resolver ecuaciones exponenciales y analizar datos científicos. Las operaciones de potencia permiten elevar cualquier número a cualquier exponente.',
        'Las constantes matemáticas pi y e están disponibles como entradas de un solo botón. La función factorial (n!) calcula el producto de todos los enteros positivos hasta n, esencial para probabilidad y combinatoria. El recíproco (1/x) y el valor absoluto completan el conjunto de herramientas.'
      ],
      faq: [
        { q: '¿Las funciones trigonométricas se calculan en grados o radianes?', a: 'Puedes alternar entre grados y radianes usando el botón DEG/RAD. Por defecto, la calculadora usa grados. Por ejemplo, sin(90) devuelve 1 en modo grados.' },
        { q: '¿Qué tan precisos son los cálculos?', a: 'La calculadora usa aritmética de punto flotante nativa de 64 bits de JavaScript, proporcionando aproximadamente 15-17 dígitos decimales significativos de precisión.' },
        { q: '¿Puedo encadenar múltiples operaciones?', a: 'Sí. Puedes construir expresiones presionando números y operadores en secuencia. La expresión se evalúa al presionar el botón igual.' },
        { q: '¿Qué pasa si divido por cero?', a: 'Dividir por cero mostrará "Error" o "Infinity". La calculadora maneja los casos extremos y permite limpiar y empezar de nuevo.' },
        { q: '¿Puedo calcular potencias y exponentes?', a: 'Sí. Usa el botón x^y para elevar cualquier número a cualquier potencia. También puedes usar x² para elevar al cuadrado rápidamente.' }
      ]
    },
    fr: {
      title: 'Calculatrice Scientifique : Mathématiques Avancées à Portée de Main',
      paragraphs: [
        'Une calculatrice scientifique va au-delà de l\'arithmétique de base pour fournir des fonctions mathématiques avancées essentielles pour les étudiants, ingénieurs, scientifiques et professionnels. Alors qu\'une calculatrice standard gère l\'addition, la soustraction, la multiplication et la division, une calculatrice scientifique ajoute les fonctions trigonométriques, les logarithmes, les puissances, les racines et les constantes mathématiques.',
        'Notre calculatrice scientifique en ligne présente une disposition en grille propre qui imite une calculatrice physique. L\'écran affiche votre saisie actuelle et vous permet de construire des expressions complexes. Vous pouvez enchaîner les opérations, utiliser des parenthèses et appliquer des fonctions comme sinus, cosinus et tangente.',
        'Les fonctions logarithmiques incluent le logarithme naturel (ln, base e) et le logarithme décimal (log, base 10). Ceux-ci sont essentiels pour résoudre des équations exponentielles et analyser des données scientifiques. Les opérations de puissance permettent d\'élever n\'importe quel nombre à n\'importe quel exposant.',
        'Les constantes mathématiques pi et e sont disponibles en un seul clic. La fonction factorielle (n!) calcule le produit de tous les entiers positifs jusqu\'à n, essentielle pour les probabilités et la combinatoire. L\'inverse (1/x) et la valeur absolue complètent la boîte à outils.'
      ],
      faq: [
        { q: 'Les fonctions trigonométriques sont-elles calculées en degrés ou en radians ?', a: 'Vous pouvez basculer entre degrés et radians avec le bouton DEG/RAD. Par défaut, la calculatrice utilise les degrés. Par exemple, sin(90) renvoie 1 en mode degrés.' },
        { q: 'Quelle est la précision des calculs ?', a: 'La calculatrice utilise l\'arithmétique native en virgule flottante 64 bits de JavaScript, offrant environ 15-17 chiffres décimaux significatifs de précision.' },
        { q: 'Puis-je enchaîner plusieurs opérations ?', a: 'Oui. Vous pouvez construire des expressions en appuyant sur les nombres et opérateurs en séquence. L\'expression est évaluée lorsque vous appuyez sur le bouton égal.' },
        { q: 'Que se passe-t-il si je divise par zéro ?', a: 'Diviser par zéro affichera "Error" ou "Infinity". La calculatrice gère les cas limites et permet d\'effacer et de recommencer.' },
        { q: 'Puis-je calculer des puissances et des exposants ?', a: 'Oui. Utilisez le bouton x^y pour élever n\'importe quel nombre à n\'importe quelle puissance. Vous pouvez aussi utiliser x² pour le carré rapide.' }
      ]
    },
    de: {
      title: 'Wissenschaftlicher Taschenrechner: Fortgeschrittene Mathematik auf Knopfdruck',
      paragraphs: [
        'Ein wissenschaftlicher Taschenrechner geht über die Grundrechenarten hinaus und bietet fortgeschrittene mathematische Funktionen, die für Studenten, Ingenieure, Wissenschaftler und Fachleute unerlässlich sind. Während ein Standardrechner Addition, Subtraktion, Multiplikation und Division beherrscht, fügt ein wissenschaftlicher Rechner trigonometrische Funktionen, Logarithmen, Potenzen, Wurzeln und mathematische Konstanten hinzu.',
        'Unser Online-Wissenschaftsrechner verfügt über ein übersichtliches Tastenlayout, das einem physischen Taschenrechner nachempfunden ist. Das Display zeigt Ihre aktuelle Eingabe und ermöglicht das Erstellen komplexer Ausdrücke. Sie können Operationen verketten, Klammern zur Gruppierung verwenden und Funktionen wie Sinus, Kosinus und Tangens anwenden.',
        'Die Logarithmusfunktionen umfassen sowohl den natürlichen Logarithmus (ln, Basis e) als auch den dekadischen Logarithmus (log, Basis 10). Diese sind entscheidend für das Lösen von Exponentialgleichungen und die Analyse wissenschaftlicher Daten. Potenzoperationen erlauben es, jede Zahl mit jedem Exponenten zu potenzieren.',
        'Die mathematischen Konstanten Pi und e sind als Einzeltasten verfügbar. Die Fakultätsfunktion (n!) berechnet das Produkt aller positiven ganzen Zahlen bis n, wesentlich für Wahrscheinlichkeit und Kombinatorik. Der Kehrwert (1/x) und der Absolutwert vervollständigen das Werkzeugset.'
      ],
      faq: [
        { q: 'Werden trigonometrische Funktionen in Grad oder Bogenmaß berechnet?', a: 'Sie können zwischen Grad und Bogenmaß mit der DEG/RAD-Taste umschalten. Standardmäßig verwendet der Rechner Grad. Beispiel: sin(90) gibt 1 im Grad-Modus zurück.' },
        { q: 'Wie präzise sind die Berechnungen?', a: 'Der Rechner verwendet JavaScripts native 64-Bit-Gleitkommaarithmetik, die etwa 15-17 signifikante Dezimalstellen Präzision bietet.' },
        { q: 'Kann ich mehrere Operationen verketten?', a: 'Ja. Sie können Ausdrücke aufbauen, indem Sie Zahlen und Operatoren nacheinander drücken. Der Ausdruck wird beim Drücken der Gleichtaste ausgewertet.' },
        { q: 'Was passiert, wenn ich durch Null teile?', a: 'Division durch Null zeigt "Error" oder "Infinity" an. Der Rechner behandelt Grenzfälle und ermöglicht das Löschen und Neustarten.' },
        { q: 'Kann ich Potenzen und Exponenten berechnen?', a: 'Ja. Verwenden Sie die x^y-Taste, um jede Zahl zu potenzieren. Sie können auch x² für schnelles Quadrieren verwenden.' }
      ]
    },
    pt: {
      title: 'Calculadora Científica: Matemática Avançada na Ponta dos Dedos',
      paragraphs: [
        'Uma calculadora científica vai além da aritmética básica para fornecer funções matemáticas avançadas essenciais para estudantes, engenheiros, cientistas e profissionais. Enquanto uma calculadora padrão lida com adição, subtração, multiplicação e divisão, uma científica adiciona funções trigonométricas, logaritmos, potências, raízes e constantes matemáticas como pi e o número de Euler (e).',
        'Nossa calculadora científica online apresenta um layout de grade limpo que imita uma calculadora física. O display mostra sua entrada atual e permite construir expressões complexas. Você pode encadear operações, usar parênteses para agrupamento e aplicar funções como seno, cosseno e tangente com cálculos baseados em graus.',
        'As funções logarítmicas incluem tanto o logaritmo natural (ln, base e) quanto o logaritmo comum (log, base 10). Estes são críticos para resolver equações exponenciais e analisar dados científicos. As operações de potência permitem elevar qualquer número a qualquer expoente.',
        'As constantes matemáticas pi e e estão disponíveis como entradas de botão único. A função fatorial (n!) calcula o produto de todos os inteiros positivos até n, essencial para probabilidade e combinatória. O recíproco (1/x) e o valor absoluto completam o conjunto de ferramentas.'
      ],
      faq: [
        { q: 'As funções trigonométricas são calculadas em graus ou radianos?', a: 'Você pode alternar entre graus e radianos usando o botão DEG/RAD. Por padrão, a calculadora usa graus. Por exemplo, sin(90) retorna 1 no modo graus.' },
        { q: 'Qual a precisão dos cálculos?', a: 'A calculadora usa aritmética nativa de ponto flutuante de 64 bits do JavaScript, fornecendo aproximadamente 15-17 dígitos decimais significativos de precisão.' },
        { q: 'Posso encadear múltiplas operações?', a: 'Sim. Você pode construir expressões pressionando números e operadores em sequência. A expressão é avaliada ao pressionar o botão igual.' },
        { q: 'O que acontece se eu dividir por zero?', a: 'Dividir por zero mostrará "Error" ou "Infinity". A calculadora lida com casos extremos e permite limpar e recomeçar.' },
        { q: 'Posso calcular potências e expoentes?', a: 'Sim. Use o botão x^y para elevar qualquer número a qualquer potência. Você também pode usar x² para elevar ao quadrado rapidamente.' }
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
              <button
                onClick={() => setAngleMode(angleMode === 'deg' ? 'rad' : 'deg')}
                className="text-xs font-mono px-2 py-0.5 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
              >
                {angleMode.toUpperCase()}
              </button>
              <button
                onClick={copyResult}
                className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                title="Copy"
              >
                {copied ? copyLabels[lang] : '\u{1F4CB}'}
              </button>
            </div>
            <div className="text-right text-gray-400 text-sm h-5 overflow-hidden">{expression || ' '}</div>
            <div className={`text-right text-3xl font-mono font-bold overflow-hidden transition-colors ${display === 'Error' ? 'text-red-400' : 'text-white'}`}>{display}</div>
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
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">{historyLabels[lang]}</h3>
              <button onClick={() => setHistory([])} className="text-xs text-red-500 hover:text-red-700">Clear</button>
            </div>
            <div className="space-y-1">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between text-sm font-mono px-2 py-1 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer" onClick={() => { setDisplay(h.result); setExpression(h.result); setNewNumber(true); }}>
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
