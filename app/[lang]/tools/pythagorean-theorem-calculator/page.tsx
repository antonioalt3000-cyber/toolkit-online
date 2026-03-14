'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  solveFor: { en: 'Solve For', it: 'Calcola', es: 'Resolver Para', fr: 'Résoudre Pour', de: 'Berechne', pt: 'Resolver Para' },
  hypotenuse: { en: 'Hypotenuse (c)', it: 'Ipotenusa (c)', es: 'Hipotenusa (c)', fr: 'Hypoténuse (c)', de: 'Hypotenuse (c)', pt: 'Hipotenusa (c)' },
  sideA: { en: 'Side a', it: 'Lato a', es: 'Lado a', fr: 'Côté a', de: 'Seite a', pt: 'Lado a' },
  sideB: { en: 'Side b', it: 'Lato b', es: 'Lado b', fr: 'Côté b', de: 'Seite b', pt: 'Lado b' },
  sideC: { en: 'Side c (hypotenuse)', it: 'Lato c (ipotenusa)', es: 'Lado c (hipotenusa)', fr: 'Côté c (hypoténuse)', de: 'Seite c (Hypotenuse)', pt: 'Lado c (hipotenusa)' },
  calculate: { en: 'Calculate', it: 'Calcola', es: 'Calcular', fr: 'Calculer', de: 'Berechnen', pt: 'Calcular' },
  reset: { en: 'Reset', it: 'Ripristina', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  missingSide: { en: 'Missing Side', it: 'Lato Mancante', es: 'Lado Faltante', fr: 'Côté Manquant', de: 'Fehlende Seite', pt: 'Lado em Falta' },
  area: { en: 'Area', it: 'Area', es: 'Área', fr: 'Aire', de: 'Fläche', pt: 'Área' },
  perimeter: { en: 'Perimeter', it: 'Perimetro', es: 'Perímetro', fr: 'Périmètre', de: 'Umfang', pt: 'Perímetro' },
  formula: { en: 'Formula', it: 'Formula', es: 'Fórmula', fr: 'Formule', de: 'Formel', pt: 'Fórmula' },
  copy: { en: 'Copy Result', it: 'Copia Risultato', es: 'Copiar Resultado', fr: 'Copier le Résultat', de: 'Ergebnis kopieren', pt: 'Copiar Resultado' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  historyLabel: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
  errorPositive: { en: 'All values must be positive numbers', it: 'Tutti i valori devono essere numeri positivi', es: 'Todos los valores deben ser números positivos', fr: 'Toutes les valeurs doivent être des nombres positifs', de: 'Alle Werte müssen positive Zahlen sein', pt: 'Todos os valores devem ser números positivos' },
  errorInvalid: { en: 'Please enter valid numbers', it: 'Inserisci numeri validi', es: 'Ingrese números válidos', fr: 'Veuillez entrer des nombres valides', de: 'Bitte gültige Zahlen eingeben', pt: 'Insira números válidos' },
  errorHypotenuse: { en: 'Hypotenuse must be greater than each leg', it: 'L\'ipotenusa deve essere maggiore di ogni cateto', es: 'La hipotenusa debe ser mayor que cada cateto', fr: 'L\'hypoténuse doit être plus grande que chaque côté', de: 'Die Hypotenuse muss größer als jede Kathete sein', pt: 'A hipotenusa deve ser maior que cada cateto' },
  verifyTriple: { en: 'Verify Pythagorean Triple', it: 'Verifica Terna Pitagorica', es: 'Verificar Terna Pitagórica', fr: 'Vérifier un Triplet Pythagoricien', de: 'Pythagoreisches Tripel Prüfen', pt: 'Verificar Tripla Pitagórica' },
  enterThreeSides: { en: 'Enter three sides to verify', it: 'Inserisci tre lati per verificare', es: 'Ingresa tres lados para verificar', fr: 'Entrez trois côtés pour vérifier', de: 'Geben Sie drei Seiten ein', pt: 'Insira três lados para verificar' },
  isTriple: { en: 'These form a Pythagorean triple!', it: 'Questi formano una terna pitagorica!', es: '¡Estos forman una terna pitagórica!', fr: 'Ceux-ci forment un triplet pythagoricien !', de: 'Diese bilden ein pythagoreisches Tripel!', pt: 'Estes formam uma tripla pitagórica!' },
  notTriple: { en: 'These do NOT form a Pythagorean triple.', it: 'Questi NON formano una terna pitagorica.', es: 'Estos NO forman una terna pitagórica.', fr: 'Ceux-ci ne forment PAS un triplet pythagoricien.', de: 'Diese bilden KEIN pythagoreisches Tripel.', pt: 'Estes NÃO formam uma tripla pitagórica.' },
  verify: { en: 'Verify', it: 'Verifica', es: 'Verificar', fr: 'Vérifier', de: 'Prüfen', pt: 'Verificar' },
  side1: { en: 'Side 1', it: 'Lato 1', es: 'Lado 1', fr: 'Côté 1', de: 'Seite 1', pt: 'Lado 1' },
  side2: { en: 'Side 2', it: 'Lato 2', es: 'Lado 2', fr: 'Côté 2', de: 'Seite 2', pt: 'Lado 2' },
  side3: { en: 'Side 3', it: 'Lato 3', es: 'Lado 3', fr: 'Côté 3', de: 'Seite 3', pt: 'Lado 3' },
  rightTriangle: { en: 'Right Triangle', it: 'Triangolo Rettangolo', es: 'Triángulo Rectángulo', fr: 'Triangle Rectangle', de: 'Rechtwinkliges Dreieck', pt: 'Triângulo Retângulo' },
  angles: { en: 'Angles', it: 'Angoli', es: 'Ángulos', fr: 'Angles', de: 'Winkel', pt: 'Ângulos' },
};

type SolveMode = 'c' | 'a' | 'b';

interface CalcResult {
  missingSide: number;
  missingSideLabel: string;
  sideA: number;
  sideB: number;
  sideC: number;
  area: number;
  perimeter: number;
  formulaUsed: string;
  angleA: number;
  angleB: number;
}

export default function PythagoreanTheoremCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['pythagorean-theorem-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [solveFor, setSolveFor] = useState<SolveMode>('c');
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [inputC, setInputC] = useState('');
  const [result, setResult] = useState<CalcResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ expr: string; value: string }[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Triple verification state
  const [tripleS1, setTripleS1] = useState('');
  const [tripleS2, setTripleS2] = useState('');
  const [tripleS3, setTripleS3] = useState('');
  const [tripleResult, setTripleResult] = useState<boolean | null>(null);

  const addToHistory = (expr: string, value: string) => {
    setHistory(prev => [{ expr, value }, ...prev].slice(0, 5));
  };

  const handleReset = () => {
    setInputA(''); setInputB(''); setInputC('');
    setResult(null); setError(''); setCopied(false);
  };

  const copyResults = () => {
    if (!result) return;
    const text = `a=${result.sideA.toFixed(4)}, b=${result.sideB.toFixed(4)}, c=${result.sideC.toFixed(4)}, Area=${result.area.toFixed(4)}, Perimeter=${result.perimeter.toFixed(4)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const calculate = () => {
    setError('');
    setResult(null);

    let a: number, b: number, c: number;
    let missingSide: number;
    let missingSideLabel: string;
    let formulaUsed: string;

    if (solveFor === 'c') {
      a = parseFloat(inputA);
      b = parseFloat(inputB);
      if (isNaN(a) || isNaN(b)) { setError(t('errorInvalid')); return; }
      if (a <= 0 || b <= 0) { setError(t('errorPositive')); return; }
      c = Math.sqrt(a * a + b * b);
      missingSide = c;
      missingSideLabel = 'c';
      formulaUsed = `c = \u221A(a\u00B2 + b\u00B2) = \u221A(${a}\u00B2 + ${b}\u00B2) = \u221A(${(a * a + b * b).toFixed(4)}) = ${c.toFixed(4)}`;
    } else if (solveFor === 'a') {
      b = parseFloat(inputB);
      c = parseFloat(inputC);
      if (isNaN(b) || isNaN(c)) { setError(t('errorInvalid')); return; }
      if (b <= 0 || c <= 0) { setError(t('errorPositive')); return; }
      if (c <= b) { setError(t('errorHypotenuse')); return; }
      a = Math.sqrt(c * c - b * b);
      missingSide = a;
      missingSideLabel = 'a';
      formulaUsed = `a = \u221A(c\u00B2 - b\u00B2) = \u221A(${c}\u00B2 - ${b}\u00B2) = \u221A(${(c * c - b * b).toFixed(4)}) = ${a.toFixed(4)}`;
    } else {
      a = parseFloat(inputA);
      c = parseFloat(inputC);
      if (isNaN(a) || isNaN(c)) { setError(t('errorInvalid')); return; }
      if (a <= 0 || c <= 0) { setError(t('errorPositive')); return; }
      if (c <= a) { setError(t('errorHypotenuse')); return; }
      b = Math.sqrt(c * c - a * a);
      missingSide = b;
      missingSideLabel = 'b';
      formulaUsed = `b = \u221A(c\u00B2 - a\u00B2) = \u221A(${c}\u00B2 - ${a}\u00B2) = \u221A(${(c * c - a * a).toFixed(4)}) = ${b.toFixed(4)}`;
    }

    const area = (a * b) / 2;
    const perimeter = a + b + c;
    const angleA = Math.atan(a / b) * (180 / Math.PI);
    const angleB = Math.atan(b / a) * (180 / Math.PI);

    const calcResult: CalcResult = {
      missingSide,
      missingSideLabel,
      sideA: a,
      sideB: b,
      sideC: c,
      area,
      perimeter,
      formulaUsed,
      angleA,
      angleB,
    };

    setResult(calcResult);
    addToHistory(`${missingSideLabel} = ?`, missingSide.toFixed(4));
  };

  const verifyTriple = () => {
    const s1 = parseFloat(tripleS1);
    const s2 = parseFloat(tripleS2);
    const s3 = parseFloat(tripleS3);
    if (isNaN(s1) || isNaN(s2) || isNaN(s3) || s1 <= 0 || s2 <= 0 || s3 <= 0) {
      setTripleResult(null);
      return;
    }
    const sides = [s1, s2, s3].sort((x, y) => x - y);
    const isTriple = Math.abs(sides[0] * sides[0] + sides[1] * sides[1] - sides[2] * sides[2]) < 0.0001;
    setTripleResult(isTriple);
  };

  // Triangle SVG dimensions
  const renderTriangleSVG = () => {
    if (!result) return null;
    const { sideA, sideB, sideC } = result;
    const maxSide = Math.max(sideA, sideB, sideC);
    const scale = 180 / maxSide;
    const aScaled = sideA * scale;
    const bScaled = sideB * scale;

    return (
      <svg viewBox="0 0 260 240" className="w-full max-w-xs mx-auto" xmlns="http://www.w3.org/2000/svg">
        {/* Triangle */}
        <polygon
          points={`30,210 ${30 + bScaled},210 30,${210 - aScaled}`}
          fill="rgba(59, 130, 246, 0.1)"
          stroke="#3b82f6"
          strokeWidth="2.5"
        />
        {/* Right angle marker */}
        <polyline
          points={`30,${210 - 15} ${30 + 15},${210 - 15} ${30 + 15},210`}
          fill="none"
          stroke="#6b7280"
          strokeWidth="1.5"
        />
        {/* Labels */}
        <text x={30 + bScaled / 2} y="230" textAnchor="middle" className="text-xs" fill="#374151" fontWeight="600">
          b = {sideB.toFixed(2)}
        </text>
        <text x="8" y={210 - aScaled / 2} textAnchor="middle" className="text-xs" fill="#374151" fontWeight="600" transform={`rotate(-90, 8, ${210 - aScaled / 2})`}>
          a = {sideA.toFixed(2)}
        </text>
        <text
          x={(30 + 30 + bScaled) / 2 + 12}
          y={(210 + 210 - aScaled) / 2 - 8}
          textAnchor="middle"
          className="text-xs"
          fill="#2563eb"
          fontWeight="700"
        >
          c = {sideC.toFixed(2)}
        </text>
        {/* Angle labels */}
        <text x={30 + bScaled - 5} y="205" textAnchor="end" className="text-xs" fill="#9333ea" fontWeight="500">
          {result.angleB.toFixed(1)}°
        </text>
        <text x="40" y={215 - aScaled + 12} textAnchor="start" className="text-xs" fill="#9333ea" fontWeight="500">
          {result.angleA.toFixed(1)}°
        </text>
        <text x="42" y="205" textAnchor="start" className="text-xs" fill="#9333ea" fontWeight="500">
          90°
        </text>
      </svg>
    );
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Pythagorean Theorem Calculator: Find Missing Sides of Right Triangles',
      paragraphs: [
        'The Pythagorean theorem is one of the most well-known and widely used formulas in mathematics. It states that in a right-angled triangle, the square of the hypotenuse (the side opposite the right angle) equals the sum of the squares of the other two sides: a squared plus b squared equals c squared. This relationship was known to ancient civilizations including the Babylonians and Egyptians, but is named after the Greek mathematician Pythagoras who provided a proof around 500 BCE.',
        'Our Pythagorean theorem calculator allows you to solve for any of the three sides of a right triangle. Simply select which side you want to find — the hypotenuse (c) or either leg (a or b) — enter the two known side lengths, and the calculator instantly computes the missing side. It also calculates the triangle area using the formula (a times b) divided by 2, the perimeter by summing all three sides, and the two non-right angles using inverse tangent.',
        'The visual right triangle diagram updates dynamically to reflect the proportions of your specific triangle, with all side lengths and angles clearly labeled. This makes the calculator an excellent learning tool for students studying geometry or trigonometry. The diagram shows the right angle marker and each angle value in degrees, giving you a complete picture of the triangle.',
        'Beyond solving for missing sides, the calculator includes a Pythagorean triple verifier. A Pythagorean triple is a set of three positive integers (a, b, c) that satisfy the theorem, such as (3, 4, 5) or (5, 12, 13). Enter any three numbers and the tool will verify whether they form a valid triple. This feature is useful for number theory, construction, and verifying measurements in practical applications.'
      ],
      faq: [
        { q: 'What is the Pythagorean theorem and when does it apply?', a: 'The Pythagorean theorem states that a² + b² = c², where c is the hypotenuse (longest side) and a, b are the legs of a right triangle. It only applies to right triangles — triangles that have one 90-degree angle. It is used extensively in geometry, construction, navigation, and physics.' },
        { q: 'Can I solve for any side, not just the hypotenuse?', a: 'Yes. This calculator lets you solve for any of the three sides. To find a leg, rearrange the formula: a = √(c² - b²) or b = √(c² - a²). Enter the hypotenuse and one known leg, and the calculator finds the missing leg.' },
        { q: 'What is a Pythagorean triple?', a: 'A Pythagorean triple is a set of three positive integers (a, b, c) where a² + b² = c². Common examples include (3, 4, 5), (5, 12, 13), (8, 15, 17), and (7, 24, 25). Any multiple of a Pythagorean triple is also a triple — for example, (6, 8, 10) = 2 × (3, 4, 5).' },
        { q: 'How is the triangle area calculated?', a: 'For a right triangle, the area equals one-half times the product of the two legs: Area = (a × b) / 2. The two legs serve as the base and height since they are perpendicular to each other.' },
        { q: 'Is my data sent to a server?', a: 'No. All calculations are performed entirely in your browser using JavaScript. No data is transmitted to any server, ensuring complete privacy and instant results.' }
      ]
    },
    it: {
      title: 'Calcolatore del Teorema di Pitagora: Trova i Lati Mancanti dei Triangoli Rettangoli',
      paragraphs: [
        'Il teorema di Pitagora è una delle formule più conosciute e utilizzate in matematica. Afferma che in un triangolo rettangolo, il quadrato dell\'ipotenusa (il lato opposto all\'angolo retto) è uguale alla somma dei quadrati degli altri due lati: a al quadrato più b al quadrato uguale c al quadrato. Questa relazione era nota alle antiche civiltà, inclusi Babilonesi ed Egizi, ma prende il nome dal matematico greco Pitagora che ne fornì una dimostrazione intorno al 500 a.C.',
        'Il nostro calcolatore del teorema di Pitagora permette di risolvere per qualsiasi dei tre lati di un triangolo rettangolo. Seleziona quale lato vuoi trovare — l\'ipotenusa (c) o uno dei cateti (a o b) — inserisci le due lunghezze note e il calcolatore calcola istantaneamente il lato mancante. Calcola anche l\'area del triangolo usando la formula (a per b) diviso 2, il perimetro sommando tutti e tre i lati e i due angoli non retti usando l\'arcotangente.',
        'Il diagramma visivo del triangolo rettangolo si aggiorna dinamicamente per riflettere le proporzioni del tuo specifico triangolo, con tutti i lati e gli angoli chiaramente etichettati. Questo rende il calcolatore un eccellente strumento didattico per studenti di geometria o trigonometria. Il diagramma mostra il marcatore dell\'angolo retto e ogni valore angolare in gradi.',
        'Oltre a risolvere per i lati mancanti, il calcolatore include un verificatore di terne pitagoriche. Una terna pitagorica è un insieme di tre interi positivi (a, b, c) che soddisfano il teorema, come (3, 4, 5) o (5, 12, 13). Inserisci tre numeri qualsiasi e lo strumento verificherà se formano una terna valida.'
      ],
      faq: [
        { q: 'Cos\'è il teorema di Pitagora e quando si applica?', a: 'Il teorema di Pitagora afferma che a² + b² = c², dove c è l\'ipotenusa e a, b sono i cateti di un triangolo rettangolo. Si applica solo ai triangoli rettangoli — triangoli con un angolo di 90 gradi. È usato in geometria, edilizia, navigazione e fisica.' },
        { q: 'Posso risolvere per qualsiasi lato?', a: 'Sì. Questo calcolatore permette di risolvere per qualsiasi dei tre lati. Per trovare un cateto: a = √(c² - b²) o b = √(c² - a²). Inserisci l\'ipotenusa e un cateto noto per trovare il cateto mancante.' },
        { q: 'Cos\'è una terna pitagorica?', a: 'Una terna pitagorica è un insieme di tre interi positivi (a, b, c) dove a² + b² = c². Esempi comuni: (3, 4, 5), (5, 12, 13), (8, 15, 17). Ogni multiplo di una terna pitagorica è anch\'esso una terna.' },
        { q: 'Come viene calcolata l\'area del triangolo?', a: 'Per un triangolo rettangolo, l\'area è uguale a metà del prodotto dei due cateti: Area = (a × b) / 2. I due cateti fungono da base e altezza poiché sono perpendicolari.' },
        { q: 'I miei dati vengono inviati a un server?', a: 'No. Tutti i calcoli vengono eseguiti nel browser. Nessun dato viene trasmesso a server.' }
      ]
    },
    es: {
      title: 'Calculadora del Teorema de Pitágoras: Encuentra los Lados de Triángulos Rectángulos',
      paragraphs: [
        'El teorema de Pitágoras es una de las fórmulas más conocidas y usadas en matemáticas. Establece que en un triángulo rectángulo, el cuadrado de la hipotenusa (el lado opuesto al ángulo recto) es igual a la suma de los cuadrados de los otros dos lados: a al cuadrado más b al cuadrado igual a c al cuadrado. Esta relación era conocida por civilizaciones antiguas como los babilonios y egipcios, pero lleva el nombre del matemático griego Pitágoras.',
        'Nuestra calculadora del teorema de Pitágoras permite resolver para cualquiera de los tres lados de un triángulo rectángulo. Selecciona qué lado quieres encontrar — la hipotenusa (c) o cualquier cateto (a o b) — ingresa las dos longitudes conocidas y la calculadora calcula instantáneamente el lado faltante. También calcula el área del triángulo, el perímetro y los dos ángulos no rectos usando la arcotangente.',
        'El diagrama visual del triángulo rectángulo se actualiza dinámicamente para reflejar las proporciones de tu triángulo específico, con todos los lados y ángulos claramente etiquetados. Esto hace que la calculadora sea una excelente herramienta de aprendizaje para estudiantes de geometría o trigonometría.',
        'Además de resolver lados faltantes, la calculadora incluye un verificador de ternas pitagóricas. Una terna pitagórica es un conjunto de tres enteros positivos (a, b, c) que satisfacen el teorema, como (3, 4, 5) o (5, 12, 13). Ingresa tres números cualesquiera y la herramienta verificará si forman una terna válida.'
      ],
      faq: [
        { q: '¿Qué es el teorema de Pitágoras y cuándo se aplica?', a: 'El teorema establece que a² + b² = c², donde c es la hipotenusa y a, b son los catetos de un triángulo rectángulo. Solo se aplica a triángulos rectángulos — triángulos con un ángulo de 90 grados.' },
        { q: '¿Puedo resolver para cualquier lado?', a: 'Sí. Esta calculadora permite resolver para cualquiera de los tres lados. Para encontrar un cateto: a = √(c² - b²) o b = √(c² - a²).' },
        { q: '¿Qué es una terna pitagórica?', a: 'Una terna pitagórica es un conjunto de tres enteros positivos (a, b, c) donde a² + b² = c². Ejemplos: (3, 4, 5), (5, 12, 13), (8, 15, 17). Cualquier múltiplo de una terna también es una terna.' },
        { q: '¿Cómo se calcula el área del triángulo?', a: 'Para un triángulo rectángulo, el área es igual a la mitad del producto de los dos catetos: Área = (a × b) / 2.' },
        { q: '¿Se envían mis datos a un servidor?', a: 'No. Todos los cálculos se realizan en tu navegador. No se transmite ningún dato a servidores.' }
      ]
    },
    fr: {
      title: 'Calculateur du Théorème de Pythagore : Trouvez les Côtés des Triangles Rectangles',
      paragraphs: [
        'Le théorème de Pythagore est l\'une des formules les plus connues et utilisées en mathématiques. Il énonce que dans un triangle rectangle, le carré de l\'hypoténuse (le côté opposé à l\'angle droit) est égal à la somme des carrés des deux autres côtés : a au carré plus b au carré égale c au carré. Cette relation était connue des civilisations anciennes, mais porte le nom du mathématicien grec Pythagore.',
        'Notre calculateur du théorème de Pythagore permet de résoudre pour n\'importe lequel des trois côtés d\'un triangle rectangle. Sélectionnez quel côté vous voulez trouver — l\'hypoténuse (c) ou l\'un des cathètes (a ou b) — entrez les deux longueurs connues et le calculateur calcule instantanément le côté manquant. Il calcule aussi l\'aire du triangle, le périmètre et les deux angles non droits.',
        'Le diagramme visuel du triangle rectangle se met à jour dynamiquement pour refléter les proportions de votre triangle, avec tous les côtés et angles clairement étiquetés. Cela fait du calculateur un excellent outil d\'apprentissage pour les étudiants en géométrie ou trigonométrie.',
        'Au-delà de la résolution des côtés manquants, le calculateur inclut un vérificateur de triplets pythagoriciens. Un triplet pythagoricien est un ensemble de trois entiers positifs (a, b, c) satisfaisant le théorème, comme (3, 4, 5) ou (5, 12, 13). Entrez trois nombres et l\'outil vérifiera s\'ils forment un triplet valide.'
      ],
      faq: [
        { q: 'Qu\'est-ce que le théorème de Pythagore et quand s\'applique-t-il ?', a: 'Le théorème énonce que a² + b² = c², où c est l\'hypoténuse et a, b sont les cathètes d\'un triangle rectangle. Il ne s\'applique qu\'aux triangles rectangles — ceux avec un angle de 90 degrés.' },
        { q: 'Puis-je résoudre pour n\'importe quel côté ?', a: 'Oui. Ce calculateur permet de résoudre pour n\'importe lequel des trois côtés. Pour trouver un cathète : a = √(c² - b²) ou b = √(c² - a²).' },
        { q: 'Qu\'est-ce qu\'un triplet pythagoricien ?', a: 'Un triplet pythagoricien est un ensemble de trois entiers positifs (a, b, c) où a² + b² = c². Exemples : (3, 4, 5), (5, 12, 13), (8, 15, 17). Tout multiple d\'un triplet est aussi un triplet.' },
        { q: 'Comment l\'aire du triangle est-elle calculée ?', a: 'Pour un triangle rectangle, l\'aire est égale à la moitié du produit des deux cathètes : Aire = (a × b) / 2.' },
        { q: 'Mes données sont-elles envoyées à un serveur ?', a: 'Non. Tous les calculs sont effectués dans votre navigateur. Aucune donnée n\'est transmise.' }
      ]
    },
    de: {
      title: 'Satz des Pythagoras Rechner: Finde Fehlende Seiten Rechtwinkliger Dreiecke',
      paragraphs: [
        'Der Satz des Pythagoras ist eine der bekanntesten und am häufigsten verwendeten Formeln der Mathematik. Er besagt, dass in einem rechtwinkligen Dreieck das Quadrat der Hypotenuse (die dem rechten Winkel gegenüberliegende Seite) gleich der Summe der Quadrate der beiden anderen Seiten ist: a zum Quadrat plus b zum Quadrat gleich c zum Quadrat. Diese Beziehung war alten Zivilisationen wie den Babyloniern und Ägyptern bekannt, ist aber nach dem griechischen Mathematiker Pythagoras benannt.',
        'Unser Pythagoras-Rechner ermöglicht es, nach jeder der drei Seiten eines rechtwinkligen Dreiecks aufzulösen. Wählen Sie, welche Seite Sie finden möchten — die Hypotenuse (c) oder eine der Katheten (a oder b) — geben Sie die zwei bekannten Seitenlängen ein, und der Rechner berechnet sofort die fehlende Seite. Er berechnet auch die Dreiecksfläche, den Umfang und die zwei Nicht-rechten-Winkel.',
        'Das visuelle Diagramm des rechtwinkligen Dreiecks aktualisiert sich dynamisch, um die Proportionen Ihres spezifischen Dreiecks widerzuspiegeln, mit allen Seitenlängen und Winkeln klar beschriftet. Dies macht den Rechner zu einem ausgezeichneten Lernwerkzeug für Geometrie- und Trigonometrieschüler.',
        'Neben der Berechnung fehlender Seiten enthält der Rechner einen Pythagoreisches-Tripel-Prüfer. Ein pythagoreisches Tripel ist eine Menge von drei positiven ganzen Zahlen (a, b, c), die den Satz erfüllen, wie (3, 4, 5) oder (5, 12, 13). Geben Sie drei Zahlen ein und das Tool prüft, ob sie ein gültiges Tripel bilden.'
      ],
      faq: [
        { q: 'Was ist der Satz des Pythagoras und wann gilt er?', a: 'Der Satz besagt, dass a² + b² = c², wobei c die Hypotenuse und a, b die Katheten eines rechtwinkligen Dreiecks sind. Er gilt nur für rechtwinklige Dreiecke — Dreiecke mit einem 90-Grad-Winkel.' },
        { q: 'Kann ich nach jeder Seite auflösen?', a: 'Ja. Dieser Rechner ermöglicht das Auflösen nach jeder der drei Seiten. Um eine Kathete zu finden: a = √(c² - b²) oder b = √(c² - a²).' },
        { q: 'Was ist ein pythagoreisches Tripel?', a: 'Ein pythagoreisches Tripel ist eine Menge von drei positiven ganzen Zahlen (a, b, c), bei denen a² + b² = c² gilt. Beispiele: (3, 4, 5), (5, 12, 13), (8, 15, 17). Jedes Vielfache eines Tripels ist ebenfalls ein Tripel.' },
        { q: 'Wie wird die Dreiecksfläche berechnet?', a: 'Für ein rechtwinkliges Dreieck ist die Fläche gleich der Hälfte des Produkts der beiden Katheten: Fläche = (a × b) / 2.' },
        { q: 'Werden meine Daten an einen Server gesendet?', a: 'Nein. Alle Berechnungen werden vollständig in Ihrem Browser durchgeführt. Es werden keine Daten übertragen.' }
      ]
    },
    pt: {
      title: 'Calculadora do Teorema de Pitágoras: Encontre os Lados de Triângulos Retângulos',
      paragraphs: [
        'O teorema de Pitágoras é uma das fórmulas mais conhecidas e utilizadas na matemática. Ele afirma que, em um triângulo retângulo, o quadrado da hipotenusa (o lado oposto ao ângulo reto) é igual à soma dos quadrados dos outros dois lados: a ao quadrado mais b ao quadrado é igual a c ao quadrado. Esta relação era conhecida por civilizações antigas, mas leva o nome do matemático grego Pitágoras.',
        'Nossa calculadora do teorema de Pitágoras permite resolver para qualquer um dos três lados de um triângulo retângulo. Selecione qual lado deseja encontrar — a hipotenusa (c) ou qualquer cateto (a ou b) — insira os dois comprimentos conhecidos e a calculadora calcula instantaneamente o lado que falta. Ela também calcula a área do triângulo, o perímetro e os dois ângulos não retos.',
        'O diagrama visual do triângulo retângulo atualiza-se dinamicamente para refletir as proporções do seu triângulo específico, com todos os lados e ângulos claramente rotulados. Isso torna a calculadora uma excelente ferramenta de aprendizado para estudantes de geometria ou trigonometria.',
        'Além de resolver lados que faltam, a calculadora inclui um verificador de triplas pitagóricas. Uma tripla pitagórica é um conjunto de três inteiros positivos (a, b, c) que satisfazem o teorema, como (3, 4, 5) ou (5, 12, 13). Insira três números quaisquer e a ferramenta verificará se formam uma tripla válida.'
      ],
      faq: [
        { q: 'O que é o teorema de Pitágoras e quando se aplica?', a: 'O teorema afirma que a² + b² = c², onde c é a hipotenusa e a, b são os catetos de um triângulo retângulo. Aplica-se apenas a triângulos retângulos — triângulos com um ângulo de 90 graus.' },
        { q: 'Posso resolver para qualquer lado?', a: 'Sim. Esta calculadora permite resolver para qualquer um dos três lados. Para encontrar um cateto: a = √(c² - b²) ou b = √(c² - a²).' },
        { q: 'O que é uma tripla pitagórica?', a: 'Uma tripla pitagórica é um conjunto de três inteiros positivos (a, b, c) onde a² + b² = c². Exemplos: (3, 4, 5), (5, 12, 13), (8, 15, 17). Qualquer múltiplo de uma tripla também é uma tripla.' },
        { q: 'Como a área do triângulo é calculada?', a: 'Para um triângulo retângulo, a área é igual à metade do produto dos dois catetos: Área = (a × b) / 2.' },
        { q: 'Meus dados são enviados a um servidor?', a: 'Não. Todos os cálculos são realizados no seu navegador. Nenhum dado é transmitido a servidores.' }
      ]
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="pythagorean-theorem-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Formula Display */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-700 font-mono">
              a&sup2; + b&sup2; = c&sup2;
            </div>
          </div>

          {/* Solve For Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('solveFor')}</label>
            <div className="flex gap-2">
              {([
                { key: 'c' as SolveMode, label: 'hypotenuse' },
                { key: 'a' as SolveMode, label: 'sideA' },
                { key: 'b' as SolveMode, label: 'sideB' },
              ]).map((s) => (
                <button
                  key={s.key}
                  onClick={() => { setSolveFor(s.key); setResult(null); setError(''); }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${solveFor === s.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t(s.label)}
                </button>
              ))}
            </div>
          </div>

          {/* Inputs based on solve mode */}
          <div className="space-y-3">
            {solveFor !== 'a' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('sideA')}</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={inputA}
                  onChange={(e) => setInputA(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. 3"
                />
              </div>
            )}
            {solveFor !== 'b' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('sideB')}</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={inputB}
                  onChange={(e) => setInputB(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. 4"
                />
              </div>
            )}
            {solveFor !== 'c' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('sideC')}</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={inputC}
                  onChange={(e) => setInputC(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. 5"
                />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <button onClick={calculate} className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2.5 font-medium hover:bg-blue-700 transition-colors">
              {t('calculate')}
            </button>
            <button onClick={handleReset} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5" title={t('reset')}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              {t('reset')}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="space-y-3">
              {/* Missing Side Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="text-sm text-green-600 font-medium mb-2">{t('missingSide')} ({result.missingSideLabel})</div>
                <div className="text-4xl font-bold text-green-700 font-mono">
                  {result.missingSide.toFixed(4)}
                </div>
              </div>

              {/* Formula Used */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-4 text-center">
                <div className="text-sm text-purple-600 font-medium mb-1">{t('formula')}</div>
                <div className="text-sm font-mono text-purple-700">{result.formulaUsed}</div>
              </div>

              {/* Triangle Diagram */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="text-sm text-gray-600 font-medium mb-2 text-center">{t('rightTriangle')}</div>
                {renderTriangleSVG()}
              </div>

              {/* Area & Perimeter */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 text-center">
                  <div className="text-sm text-blue-600 font-medium mb-1">{t('area')}</div>
                  <div className="text-xl font-bold text-blue-700">{result.area.toFixed(4)}</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 text-center">
                  <div className="text-sm text-amber-600 font-medium mb-1">{t('perimeter')}</div>
                  <div className="text-xl font-bold text-amber-700">{result.perimeter.toFixed(4)}</div>
                </div>
              </div>

              {/* Angles */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
                <div className="text-sm text-indigo-600 font-medium mb-2 text-center">{t('angles')}</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-xs text-gray-500">A</div>
                    <div className="text-lg font-bold text-indigo-700">{result.angleA.toFixed(2)}&deg;</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">B</div>
                    <div className="text-lg font-bold text-indigo-700">{result.angleB.toFixed(2)}&deg;</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">C</div>
                    <div className="text-lg font-bold text-indigo-700">90.00&deg;</div>
                  </div>
                </div>
              </div>

              {/* All Sides Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <div className="text-xs text-gray-500">a</div>
                    <div className="font-semibold text-gray-800">{result.sideA.toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">b</div>
                    <div className="font-semibold text-gray-800">{result.sideB.toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">c</div>
                    <div className="font-semibold text-gray-800">{result.sideC.toFixed(4)}</div>
                  </div>
                </div>
                <div className="text-center text-xs text-gray-500 mt-2">
                  {result.sideA.toFixed(4)}&sup2; + {result.sideB.toFixed(4)}&sup2; = {(result.sideA * result.sideA + result.sideB * result.sideB).toFixed(4)} = {result.sideC.toFixed(4)}&sup2;
                </div>
              </div>

              {/* Copy Button */}
              <button onClick={copyResults} className="w-full py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                {copied ? (
                  <><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{t('copied')}</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>{t('copy')}</>
                )}
              </button>
            </div>
          )}

          {/* Pythagorean Triple Verifier */}
          <div className="border-t border-gray-200 pt-5">
            <h3 className="text-sm font-medium text-gray-900 mb-3">{t('verifyTriple')}</h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('side1')}</label>
                <input type="number" min="1" value={tripleS1} onChange={(e) => { setTripleS1(e.target.value); setTripleResult(null); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="3" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('side2')}</label>
                <input type="number" min="1" value={tripleS2} onChange={(e) => { setTripleS2(e.target.value); setTripleResult(null); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="4" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('side3')}</label>
                <input type="number" min="1" value={tripleS3} onChange={(e) => { setTripleS3(e.target.value); setTripleResult(null); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="5" />
              </div>
            </div>
            <button onClick={verifyTriple} className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-900 transition-colors">
              {t('verify')}
            </button>
            {tripleResult !== null && (
              <div className={`mt-3 p-3 rounded-lg text-sm font-medium text-center ${tripleResult ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                {tripleResult ? t('isTriple') : t('notTriple')}
              </div>
            )}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {t('historyLabel')}
              </h3>
              <div className="space-y-1.5">
                {history.map((h, i) => (
                  <div key={i} className="flex justify-between items-center text-sm bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors">
                    <span className="text-gray-600">{h.expr}</span>
                    <span className="font-semibold text-gray-900">= {h.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

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
