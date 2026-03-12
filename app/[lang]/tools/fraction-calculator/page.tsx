'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  fraction1: { en: 'Fraction 1', it: 'Frazione 1', es: 'Fracción 1', fr: 'Fraction 1', de: 'Bruch 1', pt: 'Fração 1' },
  fraction2: { en: 'Fraction 2', it: 'Frazione 2', es: 'Fracción 2', fr: 'Fraction 2', de: 'Bruch 2', pt: 'Fração 2' },
  numerator: { en: 'Numerator', it: 'Numeratore', es: 'Numerador', fr: 'Numérateur', de: 'Zähler', pt: 'Numerador' },
  denominator: { en: 'Denominator', it: 'Denominatore', es: 'Denominador', fr: 'Dénominateur', de: 'Nenner', pt: 'Denominador' },
  operation: { en: 'Operation', it: 'Operazione', es: 'Operación', fr: 'Opération', de: 'Operation', pt: 'Operação' },
  calculate: { en: 'Calculate', it: 'Calcola', es: 'Calcular', fr: 'Calculer', de: 'Berechnen', pt: 'Calcular' },
  result: { en: 'Result', it: 'Risultato', es: 'Resultado', fr: 'Résultat', de: 'Ergebnis', pt: 'Resultado' },
  simplified: { en: 'Simplified', it: 'Semplificata', es: 'Simplificada', fr: 'Simplifiée', de: 'Vereinfacht', pt: 'Simplificada' },
  decimal: { en: 'Decimal', it: 'Decimale', es: 'Decimal', fr: 'Décimal', de: 'Dezimal', pt: 'Decimal' },
  errorZero: { en: 'Denominator cannot be zero', it: 'Il denominatore non può essere zero', es: 'El denominador no puede ser cero', fr: 'Le dénominateur ne peut pas être zéro', de: 'Der Nenner darf nicht Null sein', pt: 'O denominador não pode ser zero' },
  divideByZero: { en: 'Cannot divide by zero', it: 'Impossibile dividere per zero', es: 'No se puede dividir por cero', fr: 'Impossible de diviser par zéro', de: 'Division durch Null nicht möglich', pt: 'Não é possível dividir por zero' },
  invalidInput: { en: 'Please enter valid integers', it: 'Inserisci numeri interi validi', es: 'Ingrese enteros válidos', fr: 'Veuillez entrer des entiers valides', de: 'Bitte gültige ganze Zahlen eingeben', pt: 'Insira inteiros válidos' },
  reset: { en: 'Reset', it: 'Ripristina', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  copy: { en: 'Copy Result', it: 'Copia Risultato', es: 'Copiar Resultado', fr: 'Copier le Résultat', de: 'Ergebnis kopieren', pt: 'Copiar Resultado' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  historyLabel: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
  mixedNumber: { en: 'Mixed Number', it: 'Numero Misto', es: 'Número Mixto', fr: 'Nombre Mixte', de: 'Gemischte Zahl', pt: 'Número Misto' },
};

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function simplify(num: number, den: number): [number, number] {
  if (den === 0) return [num, den];
  const g = gcd(num, den);
  let sNum = num / g;
  let sDen = den / g;
  if (sDen < 0) { sNum = -sNum; sDen = -sDen; }
  return [sNum, sDen];
}

export default function FractionCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['fraction-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [n1, setN1] = useState('1');
  const [d1, setD1] = useState('2');
  const [n2, setN2] = useState('1');
  const [d2, setD2] = useState('3');
  const [op, setOp] = useState('+');
  const [result, setResult] = useState<{ num: number; den: number; decimal: number; error?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<{ expr: string; num: number; den: number; decimal: number }[]>([]);

  const opSymbol = (o: string) => ({ '+': '+', '-': '−', '*': '×', '/': '÷' }[o] || o);

  const addToHistory = (expr: string, num: number, den: number, decimal: number) => {
    setHistory(prev => [{ expr, num, den, decimal }, ...prev].slice(0, 5));
  };

  const handleReset = () => {
    setN1('1'); setD1('2'); setN2('1'); setD2('3');
    setOp('+'); setResult(null); setError(''); setCopied(false);
  };

  const copyResults = () => {
    if (!result || result.error) return;
    const text = result.den === 1
      ? `${result.num} (${result.decimal.toFixed(6)})`
      : `${result.num}/${result.den} (${result.decimal.toFixed(6)})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const calculate = () => {
    setError('');
    const num1 = parseInt(n1), den1 = parseInt(d1);
    const num2 = parseInt(n2), den2 = parseInt(d2);

    if (isNaN(num1) || isNaN(den1) || isNaN(num2) || isNaN(den2)) {
      setError(t('invalidInput'));
      setResult(null);
      return;
    }
    if (den1 === 0 || den2 === 0) {
      setError(t('errorZero'));
      setResult(null);
      return;
    }

    let rNum: number, rDen: number;
    switch (op) {
      case '+':
        rNum = num1 * den2 + num2 * den1;
        rDen = den1 * den2;
        break;
      case '-':
        rNum = num1 * den2 - num2 * den1;
        rDen = den1 * den2;
        break;
      case '*':
        rNum = num1 * num2;
        rDen = den1 * den2;
        break;
      case '/':
        if (num2 === 0) {
          setError(t('divideByZero'));
          setResult(null);
          return;
        }
        rNum = num1 * den2;
        rDen = den1 * num2;
        break;
      default:
        return;
    }

    const [sNum, sDen] = simplify(rNum, rDen);
    setResult({ num: sNum, den: sDen, decimal: sNum / sDen });
    const expr = `${num1}/${den1} ${opSymbol(op)} ${num2}/${den2}`;
    addToHistory(expr, sNum, sDen, sNum / sDen);
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Fraction Calculator: Add, Subtract, Multiply, and Divide Fractions',
      paragraphs: [
        'Fractions are a fundamental concept in mathematics representing parts of a whole. A fraction consists of a numerator (top number) and a denominator (bottom number), where the denominator indicates how many equal parts make up the whole and the numerator indicates how many of those parts are being considered. While simple in concept, performing arithmetic operations with fractions requires specific rules that many students and professionals find challenging.',
        'Our fraction calculator handles the four basic arithmetic operations: addition, subtraction, multiplication, and division. For addition and subtraction, the calculator finds a common denominator by cross-multiplying, then adds or subtracts the numerators. For multiplication, it simply multiplies numerators together and denominators together. For division, it multiplies by the reciprocal of the second fraction.',
        'Every result is automatically simplified to its lowest terms using the greatest common divisor (GCD) algorithm. For example, 4/8 is simplified to 1/2, and 6/9 becomes 2/3. The calculator also handles negative fractions correctly, ensuring the negative sign is always placed on the numerator for consistency. Both the fractional and decimal representations are displayed.',
        'This tool is invaluable for students learning fraction arithmetic, teachers checking homework, cooks adjusting recipe proportions, engineers working with measurements, and anyone who needs quick, accurate fraction calculations. All computation happens instantly in your browser with no server calls required, making it fast, private, and always available.'
      ],
      faq: [
        { q: 'How does the calculator simplify fractions?', a: 'It uses the Greatest Common Divisor (GCD) algorithm, also known as the Euclidean algorithm. It finds the largest number that divides both the numerator and denominator evenly, then divides both by that number. For example, GCD(12, 8) = 4, so 12/8 simplifies to 3/2.' },
        { q: 'Can I enter negative fractions?', a: 'Yes. You can enter negative numbers for either the numerator or denominator. The result will be automatically normalized so that any negative sign appears on the numerator only.' },
        { q: 'What happens if I divide by a fraction with zero as numerator?', a: 'Division by zero is undefined in mathematics. If the second fraction has a numerator of zero (making the fraction equal to zero), the calculator will display an error message: "Cannot divide by zero."' },
        { q: 'Can I use this for improper fractions?', a: 'Yes. You can enter any integer values for numerator and denominator, including improper fractions where the numerator is larger than the denominator (like 7/3). The result will also be displayed as an improper fraction in simplified form.' },
        { q: 'How accurate is the decimal conversion?', a: 'The decimal result uses JavaScript\'s native floating-point arithmetic, which provides approximately 15-17 significant digits of precision. For most practical purposes, this is more than sufficient.' }
      ]
    },
    it: {
      title: 'Calcolatore di Frazioni: Somma, Sottrai, Moltiplica e Dividi Frazioni',
      paragraphs: [
        'Le frazioni sono un concetto fondamentale della matematica che rappresenta parti di un intero. Una frazione è composta da un numeratore (numero sopra) e un denominatore (numero sotto), dove il denominatore indica quante parti uguali compongono l\'intero e il numeratore indica quante di quelle parti vengono considerate. Sebbene semplici nel concetto, le operazioni aritmetiche con le frazioni richiedono regole specifiche.',
        'Il nostro calcolatore di frazioni gestisce le quattro operazioni aritmetiche di base: addizione, sottrazione, moltiplicazione e divisione. Per addizione e sottrazione, il calcolatore trova un denominatore comune tramite moltiplicazione incrociata, poi somma o sottrae i numeratori. Per la moltiplicazione, moltiplica semplicemente i numeratori tra loro e i denominatori tra loro. Per la divisione, moltiplica per il reciproco della seconda frazione.',
        'Ogni risultato viene automaticamente semplificato ai minimi termini usando l\'algoritmo del Massimo Comun Divisore (MCD). Ad esempio, 4/8 viene semplificato in 1/2 e 6/9 diventa 2/3. Il calcolatore gestisce correttamente anche le frazioni negative. Vengono mostrate sia la rappresentazione frazionaria che quella decimale.',
        'Questo strumento è prezioso per studenti, insegnanti, cuochi che regolano le proporzioni delle ricette, ingegneri e chiunque abbia bisogno di calcoli rapidi e precisi con le frazioni. Tutto avviene nel browser senza chiamate al server.'
      ],
      faq: [
        { q: 'Come semplifica le frazioni il calcolatore?', a: 'Usa l\'algoritmo del Massimo Comun Divisore (MCD). Trova il numero più grande che divide sia il numeratore che il denominatore, poi divide entrambi per quel numero. Ad esempio, MCD(12, 8) = 4, quindi 12/8 diventa 3/2.' },
        { q: 'Posso inserire frazioni negative?', a: 'Sì. Puoi inserire numeri negativi sia per il numeratore che per il denominatore. Il risultato viene normalizzato automaticamente con il segno negativo sul numeratore.' },
        { q: 'Cosa succede se divido per una frazione con numeratore zero?', a: 'La divisione per zero è indefinita. Se la seconda frazione ha numeratore zero, il calcolatore mostrerà un messaggio di errore.' },
        { q: 'Posso usarlo per frazioni improprie?', a: 'Sì. Puoi inserire qualsiasi valore intero per numeratore e denominatore, incluse frazioni improprie dove il numeratore è maggiore del denominatore (come 7/3).' },
        { q: 'Quanto è precisa la conversione decimale?', a: 'Il risultato decimale usa l\'aritmetica nativa a virgola mobile di JavaScript, con circa 15-17 cifre significative di precisione.' }
      ]
    },
    es: {
      title: 'Calculadora de Fracciones: Suma, Resta, Multiplica y Divide Fracciones',
      paragraphs: [
        'Las fracciones son un concepto fundamental en matemáticas que representa partes de un todo. Una fracción consiste en un numerador (número superior) y un denominador (número inferior), donde el denominador indica cuántas partes iguales componen el todo y el numerador indica cuántas de esas partes se consideran. Aunque simples en concepto, las operaciones aritméticas con fracciones requieren reglas específicas.',
        'Nuestra calculadora de fracciones maneja las cuatro operaciones aritméticas básicas: suma, resta, multiplicación y división. Para suma y resta, encuentra un denominador común mediante multiplicación cruzada, luego suma o resta los numeradores. Para multiplicación, simplemente multiplica numeradores entre sí y denominadores entre sí. Para división, multiplica por el recíproco de la segunda fracción.',
        'Cada resultado se simplifica automáticamente a su mínima expresión usando el algoritmo del Máximo Común Divisor (MCD). Por ejemplo, 4/8 se simplifica a 1/2, y 6/9 se convierte en 2/3. La calculadora también maneja correctamente las fracciones negativas. Se muestran tanto la representación fraccionaria como la decimal.',
        'Esta herramienta es invaluable para estudiantes, profesores, cocineros que ajustan proporciones de recetas, ingenieros y cualquier persona que necesite cálculos rápidos y precisos con fracciones. Todo se calcula instantáneamente en tu navegador.'
      ],
      faq: [
        { q: '¿Cómo simplifica las fracciones la calculadora?', a: 'Usa el algoritmo del Máximo Común Divisor (MCD). Encuentra el número más grande que divide tanto el numerador como el denominador, luego divide ambos por ese número.' },
        { q: '¿Puedo ingresar fracciones negativas?', a: 'Sí. Puedes ingresar números negativos tanto para el numerador como para el denominador. El resultado se normaliza automáticamente.' },
        { q: '¿Qué pasa si divido por una fracción con numerador cero?', a: 'La división por cero es indefinida. Si la segunda fracción tiene numerador cero, la calculadora mostrará un mensaje de error.' },
        { q: '¿Puedo usar fracciones impropias?', a: 'Sí. Puedes ingresar cualquier valor entero para numerador y denominador, incluyendo fracciones impropias como 7/3.' },
        { q: '¿Qué tan precisa es la conversión decimal?', a: 'El resultado decimal usa aritmética de punto flotante nativa de JavaScript, con aproximadamente 15-17 dígitos significativos de precisión.' }
      ]
    },
    fr: {
      title: 'Calculateur de Fractions : Additionner, Soustraire, Multiplier et Diviser',
      paragraphs: [
        'Les fractions sont un concept fondamental en mathématiques représentant des parties d\'un tout. Une fraction se compose d\'un numérateur (nombre du haut) et d\'un dénominateur (nombre du bas). Bien que simples en concept, les opérations arithmétiques avec les fractions nécessitent des règles spécifiques que beaucoup trouvent difficiles.',
        'Notre calculateur de fractions gère les quatre opérations arithmétiques de base : addition, soustraction, multiplication et division. Pour l\'addition et la soustraction, il trouve un dénominateur commun par multiplication croisée, puis additionne ou soustrait les numérateurs. Pour la multiplication, il multiplie simplement les numérateurs et les dénominateurs. Pour la division, il multiplie par l\'inverse de la seconde fraction.',
        'Chaque résultat est automatiquement simplifié au maximum en utilisant l\'algorithme du Plus Grand Commun Diviseur (PGCD). Par exemple, 4/8 est simplifié en 1/2, et 6/9 devient 2/3. Le calculateur gère correctement les fractions négatives. Les représentations fractionnaire et décimale sont affichées.',
        'Cet outil est précieux pour les étudiants, enseignants, cuisiniers ajustant les proportions des recettes, ingénieurs et quiconque a besoin de calculs rapides et précis avec les fractions. Tout se passe dans votre navigateur sans appels serveur.'
      ],
      faq: [
        { q: 'Comment le calculateur simplifie-t-il les fractions ?', a: 'Il utilise l\'algorithme du Plus Grand Commun Diviseur (PGCD). Il trouve le plus grand nombre qui divise à la fois le numérateur et le dénominateur, puis divise les deux par ce nombre.' },
        { q: 'Puis-je entrer des fractions négatives ?', a: 'Oui. Vous pouvez entrer des nombres négatifs pour le numérateur ou le dénominateur. Le résultat est normalisé automatiquement.' },
        { q: 'Que se passe-t-il si je divise par une fraction avec un numérateur nul ?', a: 'La division par zéro est indéfinie. Si la seconde fraction a un numérateur nul, le calculateur affichera un message d\'erreur.' },
        { q: 'Puis-je utiliser des fractions impropres ?', a: 'Oui. Vous pouvez entrer n\'importe quelle valeur entière pour le numérateur et le dénominateur, y compris des fractions impropres comme 7/3.' },
        { q: 'Quelle est la précision de la conversion décimale ?', a: 'Le résultat décimal utilise l\'arithmétique native en virgule flottante de JavaScript, avec environ 15-17 chiffres significatifs de précision.' }
      ]
    },
    de: {
      title: 'Bruchrechner: Addieren, Subtrahieren, Multiplizieren und Dividieren von Brüchen',
      paragraphs: [
        'Brüche sind ein grundlegendes Konzept der Mathematik und stellen Teile eines Ganzen dar. Ein Bruch besteht aus einem Zähler (obere Zahl) und einem Nenner (untere Zahl). Obwohl konzeptionell einfach, erfordern arithmetische Operationen mit Brüchen spezifische Regeln, die viele als herausfordernd empfinden.',
        'Unser Bruchrechner beherrscht die vier grundlegenden arithmetischen Operationen: Addition, Subtraktion, Multiplikation und Division. Für Addition und Subtraktion findet er einen gemeinsamen Nenner durch Kreuzmultiplikation, dann addiert oder subtrahiert er die Zähler. Für Multiplikation multipliziert er einfach Zähler miteinander und Nenner miteinander. Für Division multipliziert er mit dem Kehrwert des zweiten Bruchs.',
        'Jedes Ergebnis wird automatisch mit dem Algorithmus des Größten Gemeinsamen Teilers (GGT) auf den kleinsten Term vereinfacht. Beispiel: 4/8 wird zu 1/2 vereinfacht, 6/9 wird zu 2/3. Der Rechner behandelt auch negative Brüche korrekt. Sowohl die Bruch- als auch die Dezimaldarstellung werden angezeigt.',
        'Dieses Werkzeug ist unschätzbar für Schüler, Lehrer, Köche, die Rezeptproportionen anpassen, Ingenieure und alle, die schnelle und genaue Bruchberechnungen benötigen. Alles geschieht sofort in Ihrem Browser.'
      ],
      faq: [
        { q: 'Wie vereinfacht der Rechner Brüche?', a: 'Er verwendet den Algorithmus des Größten Gemeinsamen Teilers (GGT). Er findet die größte Zahl, die sowohl Zähler als auch Nenner teilt, und teilt dann beide durch diese Zahl.' },
        { q: 'Kann ich negative Brüche eingeben?', a: 'Ja. Sie können negative Zahlen für Zähler oder Nenner eingeben. Das Ergebnis wird automatisch normalisiert.' },
        { q: 'Was passiert, wenn ich durch einen Bruch mit Zähler Null teile?', a: 'Division durch Null ist undefiniert. Wenn der zweite Bruch einen Zähler von Null hat, zeigt der Rechner eine Fehlermeldung an.' },
        { q: 'Kann ich unechte Brüche verwenden?', a: 'Ja. Sie können beliebige ganzzahlige Werte für Zähler und Nenner eingeben, einschließlich unechter Brüche wie 7/3.' },
        { q: 'Wie genau ist die Dezimalumwandlung?', a: 'Das Dezimalergebnis verwendet JavaScripts native Gleitkommaarithmetik mit etwa 15-17 signifikanten Stellen Genauigkeit.' }
      ]
    },
    pt: {
      title: 'Calculadora de Frações: Some, Subtraia, Multiplique e Divida Frações',
      paragraphs: [
        'Frações são um conceito fundamental em matemática representando partes de um todo. Uma fração consiste em um numerador (número de cima) e um denominador (número de baixo). Embora simples no conceito, operações aritméticas com frações requerem regras específicas que muitos acham desafiadoras.',
        'Nossa calculadora de frações lida com as quatro operações aritméticas básicas: adição, subtração, multiplicação e divisão. Para adição e subtração, encontra um denominador comum por multiplicação cruzada, depois soma ou subtrai os numeradores. Para multiplicação, simplesmente multiplica numeradores entre si e denominadores entre si. Para divisão, multiplica pelo recíproco da segunda fração.',
        'Cada resultado é automaticamente simplificado ao mínimo usando o algoritmo do Máximo Divisor Comum (MDC). Por exemplo, 4/8 é simplificado para 1/2, e 6/9 torna-se 2/3. A calculadora também lida corretamente com frações negativas. Tanto a representação fracionária quanto a decimal são exibidas.',
        'Esta ferramenta é valiosa para estudantes, professores, cozinheiros ajustando proporções de receitas, engenheiros e qualquer pessoa que precise de cálculos rápidos e precisos com frações. Tudo acontece instantaneamente no seu navegador.'
      ],
      faq: [
        { q: 'Como a calculadora simplifica frações?', a: 'Ela usa o algoritmo do Máximo Divisor Comum (MDC). Encontra o maior número que divide tanto o numerador quanto o denominador, depois divide ambos por esse número.' },
        { q: 'Posso inserir frações negativas?', a: 'Sim. Você pode inserir números negativos para numerador ou denominador. O resultado é normalizado automaticamente.' },
        { q: 'O que acontece se eu dividir por uma fração com numerador zero?', a: 'Divisão por zero é indefinida. Se a segunda fração tem numerador zero, a calculadora mostrará uma mensagem de erro.' },
        { q: 'Posso usar frações impróprias?', a: 'Sim. Você pode inserir quaisquer valores inteiros para numerador e denominador, incluindo frações impróprias como 7/3.' },
        { q: 'Qual a precisão da conversão decimal?', a: 'O resultado decimal usa aritmética nativa de ponto flutuante do JavaScript, com aproximadamente 15-17 dígitos significativos de precisão.' }
      ]
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="fraction-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <div className="flex items-center gap-4">
            {/* Fraction 1 */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">{t('fraction1')}</label>
              <div className="flex flex-col items-center">
                <input type="number" value={n1} onChange={(e) => setN1(e.target.value)} placeholder={t('numerator')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <div className="w-full h-px bg-gray-900 my-1"></div>
                <input type="number" value={d1} onChange={(e) => setD1(e.target.value)} placeholder={t('denominator')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>

            {/* Operator */}
            <div className="flex flex-col items-center pt-6">
              <select value={op} onChange={(e) => setOp(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 text-xl font-bold text-center bg-blue-50 text-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="+">+</option>
                <option value="-">&minus;</option>
                <option value="*">&times;</option>
                <option value="/">&divide;</option>
              </select>
            </div>

            {/* Fraction 2 */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">{t('fraction2')}</label>
              <div className="flex flex-col items-center">
                <input type="number" value={n2} onChange={(e) => setN2(e.target.value)} placeholder={t('numerator')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <div className="w-full h-px bg-gray-900 my-1"></div>
                <input type="number" value={d2} onChange={(e) => setD2(e.target.value)} placeholder={t('denominator')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={calculate} className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2.5 font-medium hover:bg-blue-700 transition-colors">{t('calculate')}</button>
            <button onClick={handleReset} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5" title={t('reset')}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              {t('reset')}
            </button>
          </div>

          {result && !result.error && (
            <div className="space-y-3">
              {/* Simplified Fraction Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="text-sm text-green-600 font-medium mb-2 flex items-center justify-center gap-1">
                  <span>✅</span> {t('simplified')}
                </div>
                <div className="flex items-center justify-center gap-1">
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-bold text-green-700">{result.num}</span>
                    {result.den !== 1 && (
                      <>
                        <div className="w-16 h-0.5 bg-green-700 my-1"></div>
                        <span className="text-4xl font-bold text-green-700">{result.den}</span>
                      </>
                    )}
                  </div>
                </div>
                {/* Mixed number display */}
                {result.den !== 1 && Math.abs(result.num) > Math.abs(result.den) && (
                  <div className="mt-3 text-sm text-green-600">
                    <span className="font-medium">{t('mixedNumber')}:</span>{' '}
                    <span className="font-bold">
                      {result.num < 0 ? '-' : ''}{Math.floor(Math.abs(result.num) / result.den)} {Math.abs(result.num) % result.den}/{result.den}
                    </span>
                  </div>
                )}
              </div>

              {/* Decimal Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 text-center">
                <div className="text-sm text-blue-600 font-medium mb-1 flex items-center justify-center gap-1">
                  <span>🔢</span> {t('decimal')}
                </div>
                <div className="text-2xl font-bold text-blue-700">{result.decimal.toFixed(6)}</div>
              </div>

              {/* Visual fraction bar */}
              {result.den > 0 && result.den <= 20 && result.num > 0 && result.num <= result.den && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex gap-0.5 h-8 rounded-lg overflow-hidden">
                    {Array.from({ length: result.den }, (_, i) => (
                      <div key={i} className={`flex-1 ${i < result.num ? 'bg-gradient-to-b from-green-400 to-green-600' : 'bg-gray-200'} ${i === 0 ? 'rounded-l-lg' : ''} ${i === result.den - 1 ? 'rounded-r-lg' : ''}`} />
                    ))}
                  </div>
                  <div className="text-center text-xs text-gray-500 mt-1">{result.num} / {result.den}</div>
                </div>
              )}

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
                    <span className="font-semibold text-gray-900">= {h.den === 1 ? h.num : `${h.num}/${h.den}`}</span>
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
