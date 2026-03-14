'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  number: { en: 'Number', it: 'Numero', es: 'Número', fr: 'Nombre', de: 'Zahl', pt: 'Número' },
  rootType: { en: 'Root Type', it: 'Tipo di Radice', es: 'Tipo de Raíz', fr: 'Type de Racine', de: 'Wurzeltyp', pt: 'Tipo de Raiz' },
  squareRoot: { en: 'Square Root (√)', it: 'Radice Quadrata (√)', es: 'Raíz Cuadrada (√)', fr: 'Racine Carrée (√)', de: 'Quadratwurzel (√)', pt: 'Raiz Quadrada (√)' },
  cubeRoot: { en: 'Cube Root (∛)', it: 'Radice Cubica (∛)', es: 'Raíz Cúbica (∛)', fr: 'Racine Cubique (∛)', de: 'Kubikwurzel (∛)', pt: 'Raiz Cúbica (∛)' },
  nthRoot: { en: 'Nth Root', it: 'Radice N-esima', es: 'Raíz Enésima', fr: 'Racine Nième', de: 'N-te Wurzel', pt: 'Raiz Enésima' },
  nthRootIndex: { en: 'Root Index (n)', it: 'Indice della Radice (n)', es: 'Índice de la Raíz (n)', fr: 'Indice de la Racine (n)', de: 'Wurzelindex (n)', pt: 'Índice da Raiz (n)' },
  decimalPrecision: { en: 'Decimal Precision', it: 'Precisione Decimale', es: 'Precisión Decimal', fr: 'Précision Décimale', de: 'Dezimalgenauigkeit', pt: 'Precisão Decimal' },
  calculate: { en: 'Calculate', it: 'Calcola', es: 'Calcular', fr: 'Calculer', de: 'Berechnen', pt: 'Calcular' },
  reset: { en: 'Reset', it: 'Ripristina', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  result: { en: 'Result', it: 'Risultato', es: 'Resultado', fr: 'Résultat', de: 'Ergebnis', pt: 'Resultado' },
  perfectSquare: { en: 'Perfect Square', it: 'Quadrato Perfetto', es: 'Cuadrado Perfecto', fr: 'Carré Parfait', de: 'Perfekte Quadratzahl', pt: 'Quadrado Perfeito' },
  yes: { en: 'Yes', it: 'Sì', es: 'Sí', fr: 'Oui', de: 'Ja', pt: 'Sim' },
  no: { en: 'No', it: 'No', es: 'No', fr: 'Non', de: 'Nein', pt: 'Não' },
  simplifiedRadical: { en: 'Simplified Radical', it: 'Radicale Semplificato', es: 'Radical Simplificado', fr: 'Radical Simplifié', de: 'Vereinfachte Wurzel', pt: 'Radical Simplificado' },
  decimalResult: { en: 'Decimal Result', it: 'Risultato Decimale', es: 'Resultado Decimal', fr: 'Résultat Décimal', de: 'Dezimalergebnis', pt: 'Resultado Decimal' },
  squared: { en: 'Squared', it: 'Al Quadrato', es: 'Al Cuadrado', fr: 'Au Carré', de: 'Quadriert', pt: 'Ao Quadrado' },
  copy: { en: 'Copy Result', it: 'Copia Risultato', es: 'Copiar Resultado', fr: 'Copier le Résultat', de: 'Ergebnis kopieren', pt: 'Copiar Resultado' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  historyLabel: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
  errorNegative: { en: 'Cannot calculate even root of a negative number', it: 'Non si può calcolare la radice pari di un numero negativo', es: 'No se puede calcular la raíz par de un número negativo', fr: 'Impossible de calculer une racine paire d\'un nombre négatif', de: 'Gerade Wurzel einer negativen Zahl nicht möglich', pt: 'Não é possível calcular raiz par de número negativo' },
  errorInvalid: { en: 'Please enter a valid number', it: 'Inserisci un numero valido', es: 'Ingrese un número válido', fr: 'Veuillez entrer un nombre valide', de: 'Bitte gültige Zahl eingeben', pt: 'Insira um número válido' },
  errorIndex: { en: 'Root index must be a positive integer >= 2', it: 'L\'indice deve essere un intero positivo >= 2', es: 'El índice debe ser un entero positivo >= 2', fr: 'L\'indice doit être un entier positif >= 2', de: 'Der Index muss eine positive ganze Zahl >= 2 sein', pt: 'O índice deve ser um inteiro positivo >= 2' },
  digits: { en: 'digits', it: 'cifre', es: 'dígitos', fr: 'chiffres', de: 'Stellen', pt: 'dígitos' },
};

type RootType = 'square' | 'cube' | 'nth';

interface CalcResult {
  value: number;
  isPerfectSquare: boolean;
  simplified: string;
  rootSymbol: string;
  input: number;
}

function simplifyRadical(n: number): { coefficient: number; radicand: number } {
  if (n < 0) return { coefficient: 1, radicand: n };
  if (n === 0) return { coefficient: 0, radicand: 0 };
  const absN = Math.abs(n);
  let coefficient = 1;
  let radicand = absN;
  for (let i = Math.floor(Math.sqrt(absN)); i >= 2; i--) {
    if (radicand % (i * i) === 0) {
      coefficient *= i;
      radicand = radicand / (i * i);
    }
  }
  return { coefficient, radicand };
}

export default function SquareRootCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['square-root-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [inputNum, setInputNum] = useState('');
  const [rootType, setRootType] = useState<RootType>('square');
  const [nthIndex, setNthIndex] = useState('4');
  const [precision, setPrecision] = useState(6);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ expr: string; value: string }[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const addToHistory = (expr: string, value: string) => {
    setHistory(prev => [{ expr, value }, ...prev].slice(0, 5));
  };

  const handleReset = () => {
    setInputNum('');
    setRootType('square');
    setNthIndex('4');
    setPrecision(6);
    setResult(null);
    setError('');
    setCopied(false);
  };

  const copyResults = () => {
    if (!result) return;
    const text = `${result.rootSymbol}${result.input} = ${result.value.toFixed(precision)}${result.simplified ? ` (${result.simplified})` : ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const calculate = () => {
    setError('');
    const num = parseFloat(inputNum);

    if (isNaN(num)) {
      setError(t('errorInvalid'));
      setResult(null);
      return;
    }

    let rootIndex = 2;
    let rootSymbol = '√';

    if (rootType === 'cube') {
      rootIndex = 3;
      rootSymbol = '∛';
    } else if (rootType === 'nth') {
      rootIndex = parseInt(nthIndex);
      if (isNaN(rootIndex) || rootIndex < 2 || !Number.isInteger(rootIndex)) {
        setError(t('errorIndex'));
        setResult(null);
        return;
      }
      rootSymbol = `${rootIndex}√`;
    }

    if (num < 0 && rootIndex % 2 === 0) {
      setError(t('errorNegative'));
      setResult(null);
      return;
    }

    let value: number;
    if (num < 0) {
      value = -Math.pow(Math.abs(num), 1 / rootIndex);
    } else {
      value = Math.pow(num, 1 / rootIndex);
    }

    const isPerfectSquare = rootType === 'square' && num >= 0 && Number.isInteger(num) && Number.isInteger(Math.round(Math.sqrt(num))) && Math.round(Math.sqrt(num)) * Math.round(Math.sqrt(num)) === num;

    let simplified = '';
    if (rootType === 'square' && num >= 0 && Number.isInteger(num) && num > 0) {
      const { coefficient, radicand } = simplifyRadical(num);
      if (radicand === 1) {
        simplified = `${coefficient}`;
      } else if (coefficient === 1) {
        simplified = `√${radicand}`;
      } else {
        simplified = `${coefficient}√${radicand}`;
      }
    }

    const calcResult: CalcResult = {
      value,
      isPerfectSquare,
      simplified,
      rootSymbol,
      input: num,
    };

    setResult(calcResult);
    addToHistory(`${rootSymbol}${num}`, value.toFixed(precision));
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Square Root Calculator: Compute Roots and Simplify Radicals Instantly',
      paragraphs: [
        'The square root of a number is a value that, when multiplied by itself, gives the original number. For example, the square root of 25 is 5 because 5 times 5 equals 25. Square roots are one of the most fundamental operations in mathematics, appearing in geometry, physics, engineering, statistics, and everyday problem-solving. Our calculator goes beyond simple square roots by also offering cube roots, nth roots, and radical simplification.',
        'This calculator supports three root types. The square root (index 2) is the most common, used to find side lengths of squares given their area, or to compute distances using the Pythagorean theorem. The cube root (index 3) finds a number whose cube equals the input, essential for volume calculations. The nth root generalizes this concept to any positive integer index, enabling advanced mathematical and scientific computations.',
        'One of the standout features is radical simplification. When you enter a number like 72, the calculator not only gives you the decimal approximation (8.485...) but also the simplified radical form: 6√2. This works by factoring out perfect square factors from under the radical sign. The tool also checks whether your input is a perfect square, meaning its square root is an exact integer with no remainder.',
        'You can control decimal precision from 0 to 15 digits, making this suitable for both quick estimates and high-precision scientific work. The calculation history keeps your recent results for easy reference, and the copy button lets you transfer results to other applications. All calculations run entirely in your browser with zero server calls, ensuring privacy and instant results.'
      ],
      faq: [
        { q: 'What is a simplified radical and how does it work?', a: 'A simplified radical expresses a square root in its simplest form by factoring out perfect squares. For example, √72 = √(36 × 2) = 6√2. The calculator finds the largest perfect square factor and moves its root outside the radical sign, leaving the smallest possible number under the radical.' },
        { q: 'Can I calculate the square root of a negative number?', a: 'Even-index roots (square root, 4th root, etc.) of negative numbers are not real numbers — they produce imaginary numbers. However, odd-index roots (cube root, 5th root, etc.) of negative numbers are valid. For example, the cube root of -27 is -3.' },
        { q: 'What is a perfect square and how do I check for one?', a: 'A perfect square is a non-negative integer whose square root is also an integer. Examples include 0, 1, 4, 9, 16, 25, 36, 49, 64, 81, and 100. The calculator automatically checks this for you and displays the result.' },
        { q: 'How accurate are the decimal results?', a: 'The calculator uses JavaScript\'s native Math.pow function, providing up to 15-17 significant digits of precision. You can adjust the displayed precision from 0 to 15 decimal places using the precision control.' },
        { q: 'Is my data sent to a server?', a: 'No. All calculations are performed entirely in your web browser using JavaScript. No data is transmitted to any server, ensuring complete privacy and instant results.' }
      ]
    },
    it: {
      title: 'Calcolatore di Radice Quadrata: Calcola Radici e Semplifica Radicali',
      paragraphs: [
        'La radice quadrata di un numero è un valore che, moltiplicato per se stesso, dà il numero originale. Ad esempio, la radice quadrata di 25 è 5 perché 5 per 5 fa 25. Le radici quadrate sono una delle operazioni più fondamentali in matematica, presenti in geometria, fisica, ingegneria, statistica e nella risoluzione di problemi quotidiani. Il nostro calcolatore va oltre le semplici radici quadrate, offrendo anche radici cubiche, radici n-esime e semplificazione dei radicali.',
        'Questo calcolatore supporta tre tipi di radice. La radice quadrata (indice 2) è la più comune, usata per trovare i lati di un quadrato data la sua area o per calcolare distanze con il teorema di Pitagora. La radice cubica (indice 3) trova un numero il cui cubo è uguale all\'input, essenziale per i calcoli di volume. La radice n-esima generalizza questo concetto a qualsiasi indice intero positivo.',
        'Una delle funzionalità principali è la semplificazione dei radicali. Quando inserisci un numero come 72, il calcolatore non solo fornisce l\'approssimazione decimale (8,485...) ma anche la forma radicale semplificata: 6√2. Questo funziona estraendo i fattori che sono quadrati perfetti da sotto il segno di radice. Lo strumento verifica anche se il tuo input è un quadrato perfetto.',
        'Puoi controllare la precisione decimale da 0 a 15 cifre, rendendo lo strumento adatto sia per stime rapide che per lavori scientifici ad alta precisione. La cronologia dei calcoli mantiene i risultati recenti per un facile riferimento. Tutti i calcoli avvengono nel browser senza chiamate al server.'
      ],
      faq: [
        { q: 'Cos\'è un radicale semplificato e come funziona?', a: 'Un radicale semplificato esprime una radice quadrata nella sua forma più semplice estraendo i quadrati perfetti. Ad esempio, √72 = √(36 × 2) = 6√2. Il calcolatore trova il più grande fattore quadrato perfetto e sposta la sua radice fuori dal segno di radice.' },
        { q: 'Posso calcolare la radice quadrata di un numero negativo?', a: 'Le radici con indice pari (radice quadrata, quarta, ecc.) di numeri negativi non sono numeri reali. Tuttavia, le radici con indice dispari (cubica, quinta, ecc.) di numeri negativi sono valide. Ad esempio, la radice cubica di -27 è -3.' },
        { q: 'Cos\'è un quadrato perfetto?', a: 'Un quadrato perfetto è un numero intero non negativo la cui radice quadrata è anch\'essa un numero intero. Esempi: 0, 1, 4, 9, 16, 25, 36, 49, 64, 81, 100. Il calcolatore lo verifica automaticamente.' },
        { q: 'Quanto sono precisi i risultati decimali?', a: 'Il calcolatore usa la funzione nativa Math.pow di JavaScript, fornendo fino a 15-17 cifre significative di precisione. Puoi regolare la precisione visualizzata da 0 a 15 decimali.' },
        { q: 'I miei dati vengono inviati a un server?', a: 'No. Tutti i calcoli vengono eseguiti interamente nel browser web. Nessun dato viene trasmesso a server, garantendo privacy completa e risultati istantanei.' }
      ]
    },
    es: {
      title: 'Calculadora de Raíz Cuadrada: Calcula Raíces y Simplifica Radicales',
      paragraphs: [
        'La raíz cuadrada de un número es un valor que, multiplicado por sí mismo, da el número original. Por ejemplo, la raíz cuadrada de 25 es 5 porque 5 por 5 es 25. Las raíces cuadradas son una de las operaciones más fundamentales en matemáticas, presentes en geometría, física, ingeniería, estadística y resolución de problemas cotidianos. Nuestra calculadora va más allá ofreciendo raíces cúbicas, raíces enésimas y simplificación de radicales.',
        'Esta calculadora soporta tres tipos de raíz. La raíz cuadrada (índice 2) es la más común, usada para encontrar lados de cuadrados dada su área o calcular distancias con el teorema de Pitágoras. La raíz cúbica (índice 3) encuentra un número cuyo cubo es igual al input, esencial para cálculos de volumen. La raíz enésima generaliza este concepto a cualquier índice entero positivo.',
        'Una característica destacada es la simplificación de radicales. Cuando introduces un número como 72, la calculadora no solo da la aproximación decimal (8,485...) sino también la forma radical simplificada: 6√2. Esto funciona extrayendo factores de cuadrado perfecto de debajo del signo radical. La herramienta también verifica si tu número es un cuadrado perfecto.',
        'Puedes controlar la precisión decimal de 0 a 15 dígitos, haciéndola adecuada tanto para estimaciones rápidas como para trabajo científico de alta precisión. El historial mantiene tus resultados recientes y el botón de copiar permite transferir resultados. Todos los cálculos se ejecutan en tu navegador sin llamadas al servidor.'
      ],
      faq: [
        { q: '¿Qué es un radical simplificado y cómo funciona?', a: 'Un radical simplificado expresa una raíz cuadrada en su forma más simple extrayendo cuadrados perfectos. Por ejemplo, √72 = √(36 × 2) = 6√2. La calculadora encuentra el mayor factor cuadrado perfecto y mueve su raíz fuera del signo radical.' },
        { q: '¿Puedo calcular la raíz cuadrada de un número negativo?', a: 'Las raíces de índice par (cuadrada, cuarta, etc.) de números negativos no son números reales. Sin embargo, las raíces de índice impar (cúbica, quinta, etc.) de números negativos son válidas. Por ejemplo, la raíz cúbica de -27 es -3.' },
        { q: '¿Qué es un cuadrado perfecto?', a: 'Un cuadrado perfecto es un entero no negativo cuya raíz cuadrada también es un entero. Ejemplos: 0, 1, 4, 9, 16, 25, 36, 49, 64, 81, 100. La calculadora lo verifica automáticamente.' },
        { q: '¿Qué tan precisos son los resultados decimales?', a: 'La calculadora usa la función nativa Math.pow de JavaScript, proporcionando hasta 15-17 dígitos significativos de precisión. Puedes ajustar la precisión de 0 a 15 decimales.' },
        { q: '¿Se envían mis datos a un servidor?', a: 'No. Todos los cálculos se realizan en tu navegador. No se transmite ningún dato a servidores, garantizando privacidad completa.' }
      ]
    },
    fr: {
      title: 'Calculateur de Racine Carrée : Calculez les Racines et Simplifiez les Radicaux',
      paragraphs: [
        'La racine carrée d\'un nombre est une valeur qui, multipliée par elle-même, donne le nombre original. Par exemple, la racine carrée de 25 est 5 car 5 fois 5 égale 25. Les racines carrées sont l\'une des opérations les plus fondamentales en mathématiques, présentes en géométrie, physique, ingénierie, statistique et résolution de problèmes quotidiens. Notre calculateur va au-delà en offrant aussi les racines cubiques, les racines nièmes et la simplification des radicaux.',
        'Ce calculateur supporte trois types de racine. La racine carrée (indice 2) est la plus courante, utilisée pour trouver les côtés d\'un carré connaissant son aire ou calculer des distances avec le théorème de Pythagore. La racine cubique (indice 3) trouve un nombre dont le cube égale l\'entrée, essentielle pour les calculs de volume. La racine nième généralise ce concept à tout indice entier positif.',
        'L\'une des fonctionnalités phares est la simplification des radicaux. Quand vous entrez un nombre comme 72, le calculateur donne non seulement l\'approximation décimale (8,485...) mais aussi la forme radicale simplifiée : 6√2. Cela fonctionne en extrayant les facteurs carrés parfaits de sous le signe radical. L\'outil vérifie également si votre entrée est un carré parfait.',
        'Vous pouvez contrôler la précision décimale de 0 à 15 chiffres. L\'historique garde vos résultats récents pour référence facile. Tous les calculs s\'exécutent dans votre navigateur sans appels serveur, assurant confidentialité et résultats instantanés.'
      ],
      faq: [
        { q: 'Qu\'est-ce qu\'un radical simplifié et comment fonctionne-t-il ?', a: 'Un radical simplifié exprime une racine carrée sous sa forme la plus simple en extrayant les carrés parfaits. Par exemple, √72 = √(36 × 2) = 6√2. Le calculateur trouve le plus grand facteur carré parfait et déplace sa racine hors du signe radical.' },
        { q: 'Puis-je calculer la racine carrée d\'un nombre négatif ?', a: 'Les racines d\'indice pair (carrée, quatrième, etc.) de nombres négatifs ne sont pas des nombres réels. Cependant, les racines d\'indice impair (cubique, cinquième, etc.) de nombres négatifs sont valides. Par exemple, la racine cubique de -27 est -3.' },
        { q: 'Qu\'est-ce qu\'un carré parfait ?', a: 'Un carré parfait est un entier non négatif dont la racine carrée est aussi un entier. Exemples : 0, 1, 4, 9, 16, 25, 36, 49, 64, 81, 100. Le calculateur le vérifie automatiquement.' },
        { q: 'Quelle est la précision des résultats décimaux ?', a: 'Le calculateur utilise la fonction native Math.pow de JavaScript, offrant jusqu\'à 15-17 chiffres significatifs de précision. Vous pouvez ajuster la précision de 0 à 15 décimales.' },
        { q: 'Mes données sont-elles envoyées à un serveur ?', a: 'Non. Tous les calculs sont effectués dans votre navigateur. Aucune donnée n\'est transmise à un serveur.' }
      ]
    },
    de: {
      title: 'Quadratwurzel-Rechner: Wurzeln Berechnen und Radikale Vereinfachen',
      paragraphs: [
        'Die Quadratwurzel einer Zahl ist ein Wert, der mit sich selbst multipliziert die ursprüngliche Zahl ergibt. Zum Beispiel ist die Quadratwurzel von 25 gleich 5, weil 5 mal 5 gleich 25 ist. Quadratwurzeln gehören zu den grundlegendsten Operationen der Mathematik und kommen in Geometrie, Physik, Ingenieurwesen, Statistik und alltäglicher Problemlösung vor. Unser Rechner geht über einfache Quadratwurzeln hinaus und bietet auch Kubikwurzeln, n-te Wurzeln und Radikalvereinfachung.',
        'Dieser Rechner unterstützt drei Wurzeltypen. Die Quadratwurzel (Index 2) ist die häufigste, verwendet um Seitenlängen von Quadraten zu finden oder Abstände mit dem Satz des Pythagoras zu berechnen. Die Kubikwurzel (Index 3) findet eine Zahl, deren Kubus dem Eingabewert entspricht, wesentlich für Volumenberechnungen. Die n-te Wurzel verallgemeinert dieses Konzept auf jeden positiven ganzzahligen Index.',
        'Eine herausragende Funktion ist die Radikalvereinfachung. Wenn Sie eine Zahl wie 72 eingeben, liefert der Rechner nicht nur die Dezimalannäherung (8,485...) sondern auch die vereinfachte Radikalform: 6√2. Dies funktioniert durch Ausklammern von Quadratzahlfaktoren unter dem Wurzelzeichen. Das Tool prüft auch, ob Ihre Eingabe eine perfekte Quadratzahl ist.',
        'Sie können die Dezimalgenauigkeit von 0 bis 15 Stellen steuern. Der Berechnungsverlauf speichert Ihre letzten Ergebnisse. Alle Berechnungen laufen vollständig in Ihrem Browser ohne Serveraufrufe, was Datenschutz und sofortige Ergebnisse gewährleistet.'
      ],
      faq: [
        { q: 'Was ist ein vereinfachtes Radikal und wie funktioniert es?', a: 'Ein vereinfachtes Radikal drückt eine Quadratwurzel in ihrer einfachsten Form aus, indem perfekte Quadrate herausgezogen werden. Zum Beispiel: √72 = √(36 × 2) = 6√2. Der Rechner findet den größten Quadratzahlfaktor und verschiebt seine Wurzel vor das Wurzelzeichen.' },
        { q: 'Kann ich die Quadratwurzel einer negativen Zahl berechnen?', a: 'Wurzeln mit geradem Index (Quadratwurzel, vierte Wurzel, etc.) negativer Zahlen sind keine reellen Zahlen. Wurzeln mit ungeradem Index (Kubikwurzel, fünfte Wurzel, etc.) negativer Zahlen sind jedoch gültig. Die Kubikwurzel von -27 ist beispielsweise -3.' },
        { q: 'Was ist eine perfekte Quadratzahl?', a: 'Eine perfekte Quadratzahl ist eine nicht-negative ganze Zahl, deren Quadratwurzel ebenfalls eine ganze Zahl ist. Beispiele: 0, 1, 4, 9, 16, 25, 36, 49, 64, 81, 100. Der Rechner überprüft dies automatisch.' },
        { q: 'Wie genau sind die Dezimalergebnisse?', a: 'Der Rechner verwendet die native Math.pow-Funktion von JavaScript und bietet bis zu 15-17 signifikante Stellen Genauigkeit. Sie können die Genauigkeit von 0 bis 15 Dezimalstellen einstellen.' },
        { q: 'Werden meine Daten an einen Server gesendet?', a: 'Nein. Alle Berechnungen werden vollständig in Ihrem Browser durchgeführt. Es werden keine Daten an Server übertragen.' }
      ]
    },
    pt: {
      title: 'Calculadora de Raiz Quadrada: Calcule Raízes e Simplifique Radicais',
      paragraphs: [
        'A raiz quadrada de um número é um valor que, multiplicado por si mesmo, resulta no número original. Por exemplo, a raiz quadrada de 25 é 5, porque 5 vezes 5 é igual a 25. Raízes quadradas são uma das operações mais fundamentais na matemática, presentes em geometria, física, engenharia, estatística e resolução de problemas do dia a dia. Nossa calculadora vai além das raízes quadradas simples, oferecendo também raízes cúbicas, raízes enésimas e simplificação de radicais.',
        'Esta calculadora suporta três tipos de raiz. A raiz quadrada (índice 2) é a mais comum, usada para encontrar lados de quadrados dada sua área ou calcular distâncias com o teorema de Pitágoras. A raiz cúbica (índice 3) encontra um número cujo cubo é igual à entrada, essencial para cálculos de volume. A raiz enésima generaliza este conceito para qualquer índice inteiro positivo.',
        'Uma das características destacadas é a simplificação de radicais. Quando você insere um número como 72, a calculadora não só fornece a aproximação decimal (8,485...) mas também a forma radical simplificada: 6√2. Isso funciona extraindo fatores de quadrado perfeito de dentro do sinal de radical. A ferramenta também verifica se sua entrada é um quadrado perfeito.',
        'Você pode controlar a precisão decimal de 0 a 15 dígitos, tornando-a adequada tanto para estimativas rápidas quanto para trabalho científico de alta precisão. O histórico mantém seus resultados recentes. Todos os cálculos são executados no navegador sem chamadas ao servidor, garantindo privacidade e resultados instantâneos.'
      ],
      faq: [
        { q: 'O que é um radical simplificado e como funciona?', a: 'Um radical simplificado expressa uma raiz quadrada na sua forma mais simples extraindo quadrados perfeitos. Por exemplo, √72 = √(36 × 2) = 6√2. A calculadora encontra o maior fator de quadrado perfeito e move sua raiz para fora do sinal de radical.' },
        { q: 'Posso calcular a raiz quadrada de um número negativo?', a: 'Raízes de índice par (quadrada, quarta, etc.) de números negativos não são números reais. No entanto, raízes de índice ímpar (cúbica, quinta, etc.) de números negativos são válidas. Por exemplo, a raiz cúbica de -27 é -3.' },
        { q: 'O que é um quadrado perfeito?', a: 'Um quadrado perfeito é um inteiro não negativo cuja raiz quadrada também é um inteiro. Exemplos: 0, 1, 4, 9, 16, 25, 36, 49, 64, 81, 100. A calculadora verifica isso automaticamente.' },
        { q: 'Qual a precisão dos resultados decimais?', a: 'A calculadora usa a função nativa Math.pow do JavaScript, fornecendo até 15-17 dígitos significativos de precisão. Você pode ajustar a precisão de 0 a 15 casas decimais.' },
        { q: 'Meus dados são enviados a um servidor?', a: 'Não. Todos os cálculos são realizados inteiramente no seu navegador. Nenhum dado é transmitido a servidores.' }
      ]
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="square-root-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Root Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('rootType')}</label>
            <div className="flex gap-2">
              {([
                { key: 'square' as RootType, label: 'squareRoot' },
                { key: 'cube' as RootType, label: 'cubeRoot' },
                { key: 'nth' as RootType, label: 'nthRoot' },
              ]).map((rt) => (
                <button
                  key={rt.key}
                  onClick={() => setRootType(rt.key)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${rootType === rt.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t(rt.label)}
                </button>
              ))}
            </div>
          </div>

          {/* Number Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('number')}</label>
            <input
              type="number"
              value={inputNum}
              onChange={(e) => setInputNum(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. 144"
            />
          </div>

          {/* Nth Root Index */}
          {rootType === 'nth' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('nthRootIndex')}</label>
              <input
                type="number"
                min="2"
                value={nthIndex}
                onChange={(e) => setNthIndex(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. 4"
              />
            </div>
          )}

          {/* Decimal Precision */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('decimalPrecision')}: {precision} {t('digits')}
            </label>
            <input
              type="range"
              min="0"
              max="15"
              value={precision}
              onChange={(e) => setPrecision(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0</span>
              <span>5</span>
              <span>10</span>
              <span>15</span>
            </div>
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
              {/* Main Result Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="text-sm text-green-600 font-medium mb-2">{t('decimalResult')}</div>
                <div className="text-4xl font-bold text-green-700 font-mono">
                  {result.value.toFixed(precision)}
                </div>
                <div className="text-sm text-green-600 mt-2">
                  {result.rootSymbol}{result.input} = {result.value.toFixed(precision)}
                </div>
              </div>

              {/* Simplified Radical */}
              {result.simplified && (
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-4 text-center">
                  <div className="text-sm text-purple-600 font-medium mb-1">{t('simplifiedRadical')}</div>
                  <div className="text-2xl font-bold text-purple-700 font-mono">{result.simplified}</div>
                </div>
              )}

              {/* Perfect Square Check */}
              {rootType === 'square' && result.input >= 0 && (
                <div className={`border rounded-xl p-4 text-center ${result.isPerfectSquare ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className={`text-sm font-medium mb-1 ${result.isPerfectSquare ? 'text-blue-600' : 'text-gray-500'}`}>
                    {t('perfectSquare')}
                  </div>
                  <div className={`text-xl font-bold ${result.isPerfectSquare ? 'text-blue-700' : 'text-gray-600'}`}>
                    {result.isPerfectSquare ? t('yes') : t('no')}
                  </div>
                  {result.isPerfectSquare && (
                    <div className="text-sm text-blue-600 mt-1">
                      {Math.round(result.value)}{'\u00B2'} = {result.input}
                    </div>
                  )}
                </div>
              )}

              {/* Verification */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-sm text-gray-500 font-medium mb-1">{t('squared')}</div>
                <div className="text-lg font-semibold text-gray-700">
                  {result.value.toFixed(precision)}{rootType === 'cube' ? '\u00B3' : rootType === 'nth' ? `^${nthIndex}` : '\u00B2'} = {Math.pow(result.value, rootType === 'square' ? 2 : rootType === 'cube' ? 3 : parseInt(nthIndex) || 2).toFixed(precision)}
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
