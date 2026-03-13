'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type MatrixSize = 2 | 3;
type Operation = 'add' | 'subtract' | 'multiply' | 'transpose_a' | 'transpose_b' | 'determinant_a' | 'determinant_b' | 'scalar_a' | 'scalar_b';

function createMatrix(size: MatrixSize): number[][] {
  return Array.from({ length: size }, () => Array(size).fill(0));
}

function addMatrices(a: number[][], b: number[][]): number[][] {
  return a.map((row, i) => row.map((v, j) => v + b[i][j]));
}

function subtractMatrices(a: number[][], b: number[][]): number[][] {
  return a.map((row, i) => row.map((v, j) => v - b[i][j]));
}

function multiplyMatrices(a: number[][], b: number[][]): number[][] {
  const size = a.length;
  const result = createMatrix(size as MatrixSize);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let sum = 0;
      for (let k = 0; k < size; k++) sum += a[i][k] * b[k][j];
      result[i][j] = sum;
    }
  }
  return result;
}

function transpose(m: number[][]): number[][] {
  return m[0].map((_, j) => m.map(row => row[j]));
}

function determinant(m: number[][]): number {
  if (m.length === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  return (
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  );
}

function scalarMultiply(m: number[][], s: number): number[][] {
  return m.map(row => row.map(v => v * s));
}

export default function MatrixCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['matrix-calculator'][lang];
  const [size, setSize] = useState<MatrixSize>(2);
  const [matrixA, setMatrixA] = useState<number[][]>(createMatrix(2));
  const [matrixB, setMatrixB] = useState<number[][]>(createMatrix(2));
  const [operation, setOperation] = useState<Operation>('add');
  const [scalar, setScalar] = useState(2);
  const [result, setResult] = useState<number[][] | number | null>(null);
  const [copied, setCopied] = useState(false);

  const labels = {
    size: { en: 'Matrix Size', it: 'Dimensione Matrice', es: 'Tamano de Matriz', fr: 'Taille de Matrice', de: 'Matrixgrosse', pt: 'Tamanho da Matriz' },
    matrixA: { en: 'Matrix A', it: 'Matrice A', es: 'Matriz A', fr: 'Matrice A', de: 'Matrix A', pt: 'Matriz A' },
    matrixB: { en: 'Matrix B', it: 'Matrice B', es: 'Matriz B', fr: 'Matrice B', de: 'Matrix B', pt: 'Matriz B' },
    operation: { en: 'Operation', it: 'Operazione', es: 'Operacion', fr: 'Operation', de: 'Operation', pt: 'Operacao' },
    add: { en: 'A + B', it: 'A + B', es: 'A + B', fr: 'A + B', de: 'A + B', pt: 'A + B' },
    subtract: { en: 'A - B', it: 'A - B', es: 'A - B', fr: 'A - B', de: 'A - B', pt: 'A - B' },
    multiply: { en: 'A x B', it: 'A x B', es: 'A x B', fr: 'A x B', de: 'A x B', pt: 'A x B' },
    transpose_a: { en: 'Transpose A', it: 'Trasposta A', es: 'Transpuesta A', fr: 'Transposee A', de: 'Transponierte A', pt: 'Transposta A' },
    transpose_b: { en: 'Transpose B', it: 'Trasposta B', es: 'Transpuesta B', fr: 'Transposee B', de: 'Transponierte B', pt: 'Transposta B' },
    determinant_a: { en: 'Det(A)', it: 'Det(A)', es: 'Det(A)', fr: 'Det(A)', de: 'Det(A)', pt: 'Det(A)' },
    determinant_b: { en: 'Det(B)', it: 'Det(B)', es: 'Det(B)', fr: 'Det(B)', de: 'Det(B)', pt: 'Det(B)' },
    scalar_a: { en: 'Scalar x A', it: 'Scalare x A', es: 'Escalar x A', fr: 'Scalaire x A', de: 'Skalar x A', pt: 'Escalar x A' },
    scalar_b: { en: 'Scalar x B', it: 'Scalare x B', es: 'Escalar x B', fr: 'Scalaire x B', de: 'Skalar x B', pt: 'Escalar x B' },
    scalarVal: { en: 'Scalar Value', it: 'Valore Scalare', es: 'Valor Escalar', fr: 'Valeur Scalaire', de: 'Skalarwert', pt: 'Valor Escalar' },
    calculate: { en: 'Calculate', it: 'Calcola', es: 'Calcular', fr: 'Calculer', de: 'Berechnen', pt: 'Calcular' },
    resultLabel: { en: 'Result', it: 'Risultato', es: 'Resultado', fr: 'Resultat', de: 'Ergebnis', pt: 'Resultado' },
    reset: { en: 'Reset', it: 'Resetta', es: 'Restablecer', fr: 'Reinitialiser', de: 'Zurucksetzen', pt: 'Redefinir' },
    copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
    copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copie!', de: 'Kopiert!', pt: 'Copiado!' },
  } as Record<string, Record<Locale, string>>;

  const handleSizeChange = (newSize: MatrixSize) => {
    setSize(newSize);
    setMatrixA(createMatrix(newSize));
    setMatrixB(createMatrix(newSize));
    setResult(null);
  };

  const updateCell = (matrix: 'A' | 'B', row: number, col: number, value: string) => {
    const num = value === '' || value === '-' ? 0 : parseFloat(value);
    const val = isNaN(num) ? 0 : num;
    if (matrix === 'A') {
      const newM = matrixA.map(r => [...r]);
      newM[row][col] = val;
      setMatrixA(newM);
    } else {
      const newM = matrixB.map(r => [...r]);
      newM[row][col] = val;
      setMatrixB(newM);
    }
  };

  const handleCalculate = () => {
    switch (operation) {
      case 'add': setResult(addMatrices(matrixA, matrixB)); break;
      case 'subtract': setResult(subtractMatrices(matrixA, matrixB)); break;
      case 'multiply': setResult(multiplyMatrices(matrixA, matrixB)); break;
      case 'transpose_a': setResult(transpose(matrixA)); break;
      case 'transpose_b': setResult(transpose(matrixB)); break;
      case 'determinant_a': setResult(determinant(matrixA)); break;
      case 'determinant_b': setResult(determinant(matrixB)); break;
      case 'scalar_a': setResult(scalarMultiply(matrixA, scalar)); break;
      case 'scalar_b': setResult(scalarMultiply(matrixB, scalar)); break;
    }
  };

  const handleReset = () => {
    setMatrixA(createMatrix(size));
    setMatrixB(createMatrix(size));
    setResult(null);
  };

  const copyResult = () => {
    if (result === null) return;
    let text: string;
    if (typeof result === 'number') {
      text = result.toString();
    } else {
      text = result.map(row => row.join('\t')).join('\n');
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderMatrixGrid = (matrix: number[][], label: string, matrixId: 'A' | 'B') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
        {matrix.map((row, i) =>
          row.map((val, j) => (
            <input
              key={`${matrixId}-${i}-${j}`}
              type="number"
              value={val || ''}
              onChange={e => updateCell(matrixId, i, j, e.target.value)}
              className="w-16 h-10 text-center border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          ))
        )}
      </div>
    </div>
  );

  const renderResultMatrix = (m: number[][]) => (
    <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${m[0].length}, 1fr)` }}>
      {m.map((row, i) =>
        row.map((val, j) => (
          <div key={`r-${i}-${j}`} className="w-16 h-10 flex items-center justify-center border border-blue-200 bg-blue-50 rounded-lg text-sm font-mono font-semibold text-blue-900">
            {Number.isInteger(val) ? val : val.toFixed(2)}
          </div>
        ))
      )}
    </div>
  );

  const showScalar = operation === 'scalar_a' || operation === 'scalar_b';

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Matrix Calculator - Perform Matrix Operations Online',
      paragraphs: [
        'Matrix operations are fundamental in linear algebra, computer graphics, machine learning, and engineering. Our free online matrix calculator supports all essential operations for 2x2 and 3x3 matrices, making it easy to perform calculations that would otherwise require tedious manual work or specialized software.',
        'The calculator supports matrix addition, subtraction, and multiplication, as well as transpose and determinant calculations. You can also perform scalar multiplication to scale all elements of a matrix by a constant value. Each operation follows standard mathematical definitions to ensure accurate results.',
        'Matrix multiplication is perhaps the most commonly needed operation. Unlike regular multiplication, matrix multiplication is not commutative, meaning A times B does not equal B times A in general. Our tool lets you compute both directions and compare results instantly. The determinant function helps you determine whether a matrix is invertible.',
        'Simply select your matrix size, enter values into the grid inputs, choose an operation, and click calculate. The result appears immediately in a clean grid format that you can copy to your clipboard. All computation happens locally in your browser with no data sent to external servers.'
      ],
      faq: [
        { q: 'What matrix sizes does this calculator support?', a: 'The calculator supports 2x2 and 3x3 square matrices. You can switch between sizes at any time, though changing the size will reset the current values to zero.' },
        { q: 'What operations are available?', a: 'Available operations include addition (A+B), subtraction (A-B), multiplication (AxB), transpose of A or B, determinant of A or B, and scalar multiplication for both matrices.' },
        { q: 'Why is matrix multiplication not commutative?', a: 'In matrix multiplication, each element of the result is computed as a dot product of a row from the first matrix and a column from the second. Swapping the matrices changes which rows and columns are combined, generally producing different results.' },
        { q: 'What does the determinant tell me?', a: 'The determinant is a scalar value that indicates whether a matrix is invertible (non-zero determinant) or singular (zero determinant). It also represents the scaling factor of the linear transformation described by the matrix.' },
        { q: 'Is my data processed on a server?', a: 'No. All matrix calculations are performed entirely in your browser using JavaScript. No data is sent to any external server, ensuring complete privacy of your work.' }
      ]
    },
    it: {
      title: 'Calcolatrice di Matrici - Esegui Operazioni con Matrici Online',
      paragraphs: [
        'Le operazioni con le matrici sono fondamentali in algebra lineare, grafica computerizzata, machine learning e ingegneria. La nostra calcolatrice online gratuita supporta tutte le operazioni essenziali per matrici 2x2 e 3x3, rendendo facili i calcoli che altrimenti richiederebbero lavoro manuale tedioso.',
        'La calcolatrice supporta addizione, sottrazione e moltiplicazione di matrici, oltre al calcolo della trasposta e del determinante. Puoi anche eseguire la moltiplicazione scalare per ridimensionare tutti gli elementi di una matrice per un valore costante. Ogni operazione segue le definizioni matematiche standard.',
        'La moltiplicazione di matrici e forse l\'operazione piu comunemente necessaria. A differenza della moltiplicazione normale, la moltiplicazione di matrici non e commutativa: A per B non equivale a B per A in generale. Il nostro strumento ti permette di calcolare entrambe le direzioni e confrontare i risultati.',
        'Seleziona la dimensione della matrice, inserisci i valori nella griglia, scegli un\'operazione e clicca calcola. Il risultato appare immediatamente in un formato griglia pulito che puoi copiare. Tutto il calcolo avviene localmente nel browser senza invio di dati a server esterni.'
      ],
      faq: [
        { q: 'Quali dimensioni di matrice supporta questa calcolatrice?', a: 'La calcolatrice supporta matrici quadrate 2x2 e 3x3. Puoi passare da una dimensione all\'altra in qualsiasi momento, anche se il cambio resetta i valori a zero.' },
        { q: 'Quali operazioni sono disponibili?', a: 'Le operazioni disponibili includono addizione (A+B), sottrazione (A-B), moltiplicazione (AxB), trasposta di A o B, determinante di A o B e moltiplicazione scalare per entrambe le matrici.' },
        { q: 'Perche la moltiplicazione di matrici non e commutativa?', a: 'Nella moltiplicazione di matrici, ogni elemento del risultato e calcolato come prodotto scalare di una riga della prima matrice e una colonna della seconda. Scambiando le matrici cambiano le righe e colonne combinate, producendo generalmente risultati diversi.' },
        { q: 'Cosa mi dice il determinante?', a: 'Il determinante e un valore scalare che indica se una matrice e invertibile (determinante non nullo) o singolare (determinante nullo). Rappresenta anche il fattore di scala della trasformazione lineare descritta dalla matrice.' },
        { q: 'I miei dati vengono elaborati su un server?', a: 'No. Tutti i calcoli matriciali vengono eseguiti interamente nel browser tramite JavaScript. Nessun dato viene inviato a server esterni, garantendo la completa privacy del lavoro.' }
      ]
    },
    es: {
      title: 'Calculadora de Matrices - Realiza Operaciones con Matrices Online',
      paragraphs: [
        'Las operaciones con matrices son fundamentales en algebra lineal, graficos por computadora, aprendizaje automatico e ingenieria. Nuestra calculadora online gratuita soporta todas las operaciones esenciales para matrices 2x2 y 3x3, facilitando calculos que de otro modo requeririan trabajo manual tedioso.',
        'La calculadora soporta adicion, sustraccion y multiplicacion de matrices, ademas del calculo de transpuesta y determinante. Tambien puedes realizar multiplicacion escalar para escalar todos los elementos de una matriz por un valor constante. Cada operacion sigue definiciones matematicas estandar.',
        'La multiplicacion de matrices es quizas la operacion mas comunmente necesitada. A diferencia de la multiplicacion regular, la multiplicacion de matrices no es conmutativa: A por B no es igual a B por A en general. Nuestra herramienta te permite calcular ambas direcciones y comparar resultados.',
        'Selecciona el tamano de la matriz, ingresa valores en la cuadricula, elige una operacion y haz clic en calcular. El resultado aparece inmediatamente en un formato de cuadricula limpio que puedes copiar. Todo el calculo ocurre localmente en el navegador.'
      ],
      faq: [
        { q: 'Que tamanos de matriz soporta esta calculadora?', a: 'La calculadora soporta matrices cuadradas 2x2 y 3x3. Puedes cambiar entre tamanos en cualquier momento, aunque el cambio restablecera los valores a cero.' },
        { q: 'Que operaciones estan disponibles?', a: 'Las operaciones disponibles incluyen adicion (A+B), sustraccion (A-B), multiplicacion (AxB), transpuesta de A o B, determinante de A o B y multiplicacion escalar para ambas matrices.' },
        { q: 'Por que la multiplicacion de matrices no es conmutativa?', a: 'En la multiplicacion de matrices, cada elemento del resultado se calcula como producto escalar de una fila de la primera matriz y una columna de la segunda. Intercambiar las matrices cambia las filas y columnas combinadas, produciendo generalmente resultados diferentes.' },
        { q: 'Que me dice el determinante?', a: 'El determinante es un valor escalar que indica si una matriz es invertible (determinante no nulo) o singular (determinante nulo). Tambien representa el factor de escala de la transformacion lineal descrita por la matriz.' },
        { q: 'Mis datos se procesan en un servidor?', a: 'No. Todos los calculos matriciales se realizan completamente en el navegador mediante JavaScript. Ningun dato se envia a servidores externos.' }
      ]
    },
    fr: {
      title: 'Calculateur de Matrices - Effectuez des Operations Matricielles en Ligne',
      paragraphs: [
        'Les operations matricielles sont fondamentales en algebre lineaire, en infographie, en apprentissage automatique et en ingenierie. Notre calculateur en ligne gratuit prend en charge toutes les operations essentielles pour les matrices 2x2 et 3x3, facilitant des calculs qui necessiteraient autrement un travail manuel fastidieux.',
        'Le calculateur prend en charge l\'addition, la soustraction et la multiplication de matrices, ainsi que le calcul de la transposee et du determinant. Vous pouvez egalement effectuer une multiplication scalaire pour multiplier tous les elements d\'une matrice par une constante. Chaque operation suit les definitions mathematiques standard.',
        'La multiplication de matrices est peut-etre l\'operation la plus couramment necessaire. Contrairement a la multiplication classique, la multiplication de matrices n\'est pas commutative : A fois B n\'est pas egal a B fois A en general. Notre outil vous permet de calculer dans les deux sens et de comparer les resultats.',
        'Selectionnez la taille de la matrice, entrez les valeurs dans la grille, choisissez une operation et cliquez sur calculer. Le resultat apparait immediatement dans un format de grille propre que vous pouvez copier. Tous les calculs se font localement dans votre navigateur.'
      ],
      faq: [
        { q: 'Quelles tailles de matrices ce calculateur prend-il en charge ?', a: 'Le calculateur prend en charge les matrices carrees 2x2 et 3x3. Vous pouvez changer de taille a tout moment, bien que le changement reinitialise les valeurs a zero.' },
        { q: 'Quelles operations sont disponibles ?', a: 'Les operations disponibles incluent l\'addition (A+B), la soustraction (A-B), la multiplication (AxB), la transposee de A ou B, le determinant de A ou B et la multiplication scalaire pour les deux matrices.' },
        { q: 'Pourquoi la multiplication de matrices n\'est-elle pas commutative ?', a: 'Dans la multiplication de matrices, chaque element du resultat est calcule comme le produit scalaire d\'une ligne de la premiere matrice et d\'une colonne de la seconde. Echanger les matrices change les lignes et colonnes combinees, produisant generalement des resultats differents.' },
        { q: 'Que m\'indique le determinant ?', a: 'Le determinant est une valeur scalaire qui indique si une matrice est inversible (determinant non nul) ou singuliere (determinant nul). Il represente aussi le facteur d\'echelle de la transformation lineaire decrite par la matrice.' },
        { q: 'Mes donnees sont-elles traitees sur un serveur ?', a: 'Non. Tous les calculs matriciels sont effectues entierement dans votre navigateur via JavaScript. Aucune donnee n\'est envoyee a des serveurs externes.' }
      ]
    },
    de: {
      title: 'Matrixrechner - Matrixoperationen Online Durchfuhren',
      paragraphs: [
        'Matrixoperationen sind grundlegend in der linearen Algebra, Computergrafik, maschinellem Lernen und Ingenieurwesen. Unser kostenloser Online-Matrixrechner unterstutzt alle wesentlichen Operationen fur 2x2 und 3x3 Matrizen und erleichtert Berechnungen, die sonst muhsame manuelle Arbeit erfordern wurden.',
        'Der Rechner unterstutzt Matrixaddition, -subtraktion und -multiplikation sowie die Berechnung von Transponierter und Determinante. Sie konnen auch eine Skalarmultiplikation durchfuhren, um alle Elemente einer Matrix mit einem konstanten Wert zu multiplizieren. Jede Operation folgt mathematischen Standarddefinitionen.',
        'Die Matrixmultiplikation ist vielleicht die am haufigsten benotigte Operation. Anders als die regulare Multiplikation ist die Matrixmultiplikation nicht kommutativ: A mal B ist im Allgemeinen nicht gleich B mal A. Unser Tool lasst Sie beide Richtungen berechnen und Ergebnisse vergleichen.',
        'Wahlen Sie die Matrixgrosse, geben Sie Werte in das Raster ein, wahlen Sie eine Operation und klicken Sie auf Berechnen. Das Ergebnis erscheint sofort in einem ubersichtlichen Rasterformat, das Sie kopieren konnen. Alle Berechnungen erfolgen lokal in Ihrem Browser.'
      ],
      faq: [
        { q: 'Welche Matrixgrossen unterstutzt dieser Rechner?', a: 'Der Rechner unterstutzt quadratische 2x2 und 3x3 Matrizen. Sie konnen jederzeit zwischen Grossen wechseln, wobei der Wechsel die aktuellen Werte auf Null zurucksetzt.' },
        { q: 'Welche Operationen sind verfugbar?', a: 'Verfugbare Operationen umfassen Addition (A+B), Subtraktion (A-B), Multiplikation (AxB), Transponierte von A oder B, Determinante von A oder B und Skalarmultiplikation fur beide Matrizen.' },
        { q: 'Warum ist Matrixmultiplikation nicht kommutativ?', a: 'Bei der Matrixmultiplikation wird jedes Element des Ergebnisses als Skalarprodukt einer Zeile der ersten Matrix und einer Spalte der zweiten berechnet. Das Vertauschen der Matrizen andert die kombinierten Zeilen und Spalten und erzeugt im Allgemeinen verschiedene Ergebnisse.' },
        { q: 'Was sagt mir die Determinante?', a: 'Die Determinante ist ein Skalarwert, der angibt, ob eine Matrix invertierbar (Determinante ungleich Null) oder singular (Determinante gleich Null) ist. Sie stellt auch den Skalierungsfaktor der durch die Matrix beschriebenen linearen Transformation dar.' },
        { q: 'Werden meine Daten auf einem Server verarbeitet?', a: 'Nein. Alle Matrixberechnungen werden vollstandig in Ihrem Browser uber JavaScript durchgefuhrt. Es werden keine Daten an externe Server gesendet.' }
      ]
    },
    pt: {
      title: 'Calculadora de Matrizes - Realize Operacoes com Matrizes Online',
      paragraphs: [
        'Operacoes com matrizes sao fundamentais em algebra linear, computacao grafica, aprendizado de maquina e engenharia. Nossa calculadora online gratuita suporta todas as operacoes essenciais para matrizes 2x2 e 3x3, facilitando calculos que de outra forma exigiriam trabalho manual tedioso.',
        'A calculadora suporta adicao, subtracao e multiplicacao de matrizes, alem do calculo de transposta e determinante. Voce tambem pode realizar multiplicacao escalar para dimensionar todos os elementos de uma matriz por um valor constante. Cada operacao segue definicoes matematicas padrao.',
        'A multiplicacao de matrizes e talvez a operacao mais comumente necessaria. Diferente da multiplicacao regular, a multiplicacao de matrizes nao e comutativa: A vezes B nao e igual a B vezes A em geral. Nossa ferramenta permite calcular ambas as direcoes e comparar resultados.',
        'Selecione o tamanho da matriz, insira valores na grade, escolha uma operacao e clique em calcular. O resultado aparece imediatamente em um formato de grade limpo que voce pode copiar. Todo o calculo acontece localmente no seu navegador.'
      ],
      faq: [
        { q: 'Quais tamanhos de matriz esta calculadora suporta?', a: 'A calculadora suporta matrizes quadradas 2x2 e 3x3. Voce pode alternar entre tamanhos a qualquer momento, embora a mudanca redefina os valores para zero.' },
        { q: 'Quais operacoes estao disponiveis?', a: 'As operacoes disponiveis incluem adicao (A+B), subtracao (A-B), multiplicacao (AxB), transposta de A ou B, determinante de A ou B e multiplicacao escalar para ambas as matrizes.' },
        { q: 'Por que a multiplicacao de matrizes nao e comutativa?', a: 'Na multiplicacao de matrizes, cada elemento do resultado e calculado como produto escalar de uma linha da primeira matriz e uma coluna da segunda. Trocar as matrizes muda as linhas e colunas combinadas, geralmente produzindo resultados diferentes.' },
        { q: 'O que o determinante me diz?', a: 'O determinante e um valor escalar que indica se uma matriz e inversivel (determinante nao nulo) ou singular (determinante nulo). Tambem representa o fator de escala da transformacao linear descrita pela matriz.' },
        { q: 'Meus dados sao processados em um servidor?', a: 'Nao. Todos os calculos matriciais sao realizados inteiramente no seu navegador via JavaScript. Nenhum dado e enviado a servidores externos.' }
      ]
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="matrix-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          {/* Size selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.size[lang]}</label>
            <div className="flex gap-2">
              {([2, 3] as MatrixSize[]).map(s => (
                <button key={s} onClick={() => handleSizeChange(s)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${size === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {s}x{s}
                </button>
              ))}
            </div>
          </div>

          {/* Matrix inputs side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {renderMatrixGrid(matrixA, labels.matrixA[lang], 'A')}
            {renderMatrixGrid(matrixB, labels.matrixB[lang], 'B')}
          </div>

          {/* Operation selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.operation[lang]}</label>
            <div className="flex flex-wrap gap-1.5">
              {(['add', 'subtract', 'multiply', 'transpose_a', 'transpose_b', 'determinant_a', 'determinant_b', 'scalar_a', 'scalar_b'] as Operation[]).map(op => (
                <button key={op} onClick={() => setOperation(op)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${operation === op ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {labels[op][lang]}
                </button>
              ))}
            </div>
          </div>

          {/* Scalar input */}
          {showScalar && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.scalarVal[lang]}</label>
              <input type="number" value={scalar} onChange={e => setScalar(parseFloat(e.target.value) || 0)} className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500" />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <button onClick={handleCalculate} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              {labels.calculate[lang]}
            </button>
            <button onClick={handleReset} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              {labels.reset[lang]}
            </button>
          </div>

          {/* Result */}
          {result !== null && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">{labels.resultLabel[lang]}</h3>
                <button onClick={copyResult} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                  {copied ? labels.copied[lang] : labels.copy[lang]}
                </button>
              </div>
              {typeof result === 'number' ? (
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-center shadow-sm">
                  <div className="text-3xl font-bold text-white font-mono">{Number.isInteger(result) ? result : result.toFixed(4)}</div>
                </div>
              ) : (
                <div className="flex justify-center">
                  {renderResultMatrix(result)}
                </div>
              )}
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
