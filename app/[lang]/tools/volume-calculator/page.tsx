'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type Shape = 'cube' | 'rectangular' | 'sphere' | 'cylinder' | 'cone' | 'pyramid';
type VolumeUnit = 'm3' | 'cm3' | 'L' | 'ft3' | 'in3' | 'gal';

const unitConversions: Record<VolumeUnit, number> = {
  m3: 1,
  cm3: 1e6,
  L: 1000,
  ft3: 35.3147,
  in3: 61023.7,
  gal: 264.172,
};

const unitLabels: Record<VolumeUnit, string> = {
  m3: 'm\u00B3',
  cm3: 'cm\u00B3',
  L: 'L',
  ft3: 'ft\u00B3',
  in3: 'in\u00B3',
  gal: 'gal',
};

const labels: Record<string, Record<string, string>> = {
  shape: { en: 'Shape', it: 'Forma', es: 'Forma', fr: 'Forme', de: 'Form', pt: 'Forma' },
  cube: { en: 'Cube', it: 'Cubo', es: 'Cubo', fr: 'Cube', de: 'W\u00FCrfel', pt: 'Cubo' },
  rectangular: { en: 'Rectangular Prism', it: 'Prisma Rettangolare', es: 'Prisma Rectangular', fr: 'Prisme Rectangulaire', de: 'Quader', pt: 'Prisma Retangular' },
  sphere: { en: 'Sphere', it: 'Sfera', es: 'Esfera', fr: 'Sph\u00E8re', de: 'Kugel', pt: 'Esfera' },
  cylinder: { en: 'Cylinder', it: 'Cilindro', es: 'Cilindro', fr: 'Cylindre', de: 'Zylinder', pt: 'Cilindro' },
  cone: { en: 'Cone', it: 'Cono', es: 'Cono', fr: 'C\u00F4ne', de: 'Kegel', pt: 'Cone' },
  pyramid: { en: 'Pyramid', it: 'Piramide', es: 'Pir\u00E1mide', fr: 'Pyramide', de: 'Pyramide', pt: 'Pir\u00E2mide' },
  side: { en: 'Side (s)', it: 'Lato (s)', es: 'Lado (s)', fr: 'C\u00F4t\u00E9 (s)', de: 'Seite (s)', pt: 'Lado (s)' },
  length: { en: 'Length (l)', it: 'Lunghezza (l)', es: 'Longitud (l)', fr: 'Longueur (l)', de: 'L\u00E4nge (l)', pt: 'Comprimento (l)' },
  width: { en: 'Width (w)', it: 'Larghezza (w)', es: 'Ancho (w)', fr: 'Largeur (w)', de: 'Breite (w)', pt: 'Largura (w)' },
  height: { en: 'Height (h)', it: 'Altezza (h)', es: 'Altura (h)', fr: 'Hauteur (h)', de: 'H\u00F6he (h)', pt: 'Altura (h)' },
  radius: { en: 'Radius (r)', it: 'Raggio (r)', es: 'Radio (r)', fr: 'Rayon (r)', de: 'Radius (r)', pt: 'Raio (r)' },
  baseLength: { en: 'Base Length (b)', it: 'Lato Base (b)', es: 'Lado Base (b)', fr: 'C\u00F4t\u00E9 Base (b)', de: 'Basisl\u00E4nge (b)', pt: 'Lado Base (b)' },
  baseWidth: { en: 'Base Width (w)', it: 'Larghezza Base (w)', es: 'Ancho Base (w)', fr: 'Largeur Base (w)', de: 'Basisbreite (w)', pt: 'Largura Base (w)' },
  unit: { en: 'Unit', it: 'Unit\u00E0', es: 'Unidad', fr: 'Unit\u00E9', de: 'Einheit', pt: 'Unidade' },
  volume: { en: 'Volume', it: 'Volume', es: 'Volumen', fr: 'Volume', de: 'Volumen', pt: 'Volume' },
  surfaceArea: { en: 'Surface Area', it: 'Area Superficiale', es: '\u00C1rea Superficial', fr: 'Aire de Surface', de: 'Oberfl\u00E4che', pt: '\u00C1rea Superficial' },
  formula: { en: 'Formula', it: 'Formula', es: 'F\u00F3rmula', fr: 'Formule', de: 'Formel', pt: 'F\u00F3rmula' },
  result: { en: 'Result', it: 'Risultato', es: 'Resultado', fr: 'R\u00E9sultat', de: 'Ergebnis', pt: 'Resultado' },
  reset: { en: 'Reset', it: 'Reset', es: 'Reiniciar', fr: 'R\u00E9initialiser', de: 'Zur\u00FCcksetzen', pt: 'Reiniciar' },
  copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '\u00A1Copiado!', fr: 'Copi\u00E9 !', de: 'Kopiert!', pt: 'Copiado!' },
  history: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'C\u00E1lculos Recientes', fr: 'Calculs R\u00E9cents', de: 'Letzte Berechnungen', pt: 'C\u00E1lculos Recentes' },
  clearHistory: { en: 'Clear', it: 'Cancella', es: 'Borrar', fr: 'Effacer', de: 'L\u00F6schen', pt: 'Limpar' },
  enterPositive: { en: 'Enter a positive value', it: 'Inserisci un valore positivo', es: 'Ingresa un valor positivo', fr: 'Entrez une valeur positive', de: 'Geben Sie einen positiven Wert ein', pt: 'Insira um valor positivo' },
  inputUnit: { en: 'Input unit (meters)', it: 'Unit\u00E0 input (metri)', es: 'Unidad de entrada (metros)', fr: 'Unit\u00E9 d\'entr\u00E9e (m\u00E8tres)', de: 'Eingabeeinheit (Meter)', pt: 'Unidade de entrada (metros)' },
};

const shapeIcons: Record<Shape, string> = {
  cube: '\u{1F4E6}',
  rectangular: '\u{1F9F1}',
  sphere: '\u{26BD}',
  cylinder: '\u{1F6E2}\u{FE0F}',
  cone: '\u{1F4D0}',
  pyramid: '\u{1F4D0}',
};

function calcVolume(shape: Shape, vals: Record<string, number>): { volume: number; surface: number; formula: string; saFormula: string } {
  const PI = Math.PI;
  switch (shape) {
    case 'cube': {
      const s = vals.side || 0;
      return {
        volume: s ** 3,
        surface: 6 * s ** 2,
        formula: `V = s\u00B3 = ${s}\u00B3 = ${(s ** 3).toFixed(6)}`,
        saFormula: `SA = 6s\u00B2 = 6 \u00D7 ${s}\u00B2 = ${(6 * s ** 2).toFixed(6)}`,
      };
    }
    case 'rectangular': {
      const { length: l = 0, width: w = 0, height: h = 0 } = vals;
      return {
        volume: l * w * h,
        surface: 2 * (l * w + l * h + w * h),
        formula: `V = l \u00D7 w \u00D7 h = ${l} \u00D7 ${w} \u00D7 ${h} = ${(l * w * h).toFixed(6)}`,
        saFormula: `SA = 2(lw + lh + wh) = 2(${(l * w).toFixed(2)} + ${(l * h).toFixed(2)} + ${(w * h).toFixed(2)}) = ${(2 * (l * w + l * h + w * h)).toFixed(6)}`,
      };
    }
    case 'sphere': {
      const r = vals.radius || 0;
      return {
        volume: (4 / 3) * PI * r ** 3,
        surface: 4 * PI * r ** 2,
        formula: `V = (4/3)\u03C0r\u00B3 = (4/3) \u00D7 \u03C0 \u00D7 ${r}\u00B3 = ${((4 / 3) * PI * r ** 3).toFixed(6)}`,
        saFormula: `SA = 4\u03C0r\u00B2 = 4 \u00D7 \u03C0 \u00D7 ${r}\u00B2 = ${(4 * PI * r ** 2).toFixed(6)}`,
      };
    }
    case 'cylinder': {
      const r = vals.radius || 0;
      const h = vals.height || 0;
      return {
        volume: PI * r ** 2 * h,
        surface: 2 * PI * r * (r + h),
        formula: `V = \u03C0r\u00B2h = \u03C0 \u00D7 ${r}\u00B2 \u00D7 ${h} = ${(PI * r ** 2 * h).toFixed(6)}`,
        saFormula: `SA = 2\u03C0r(r+h) = 2\u03C0 \u00D7 ${r}(${r}+${h}) = ${(2 * PI * r * (r + h)).toFixed(6)}`,
      };
    }
    case 'cone': {
      const r = vals.radius || 0;
      const h = vals.height || 0;
      const slant = Math.sqrt(r ** 2 + h ** 2);
      return {
        volume: (1 / 3) * PI * r ** 2 * h,
        surface: PI * r * (r + slant),
        formula: `V = (1/3)\u03C0r\u00B2h = (1/3) \u00D7 \u03C0 \u00D7 ${r}\u00B2 \u00D7 ${h} = ${((1 / 3) * PI * r ** 2 * h).toFixed(6)}`,
        saFormula: `SA = \u03C0r(r+l) = \u03C0 \u00D7 ${r}(${r}+${slant.toFixed(4)}) = ${(PI * r * (r + slant)).toFixed(6)}`,
      };
    }
    case 'pyramid': {
      const b = vals.baseLength || 0;
      const w = vals.baseWidth || 0;
      const h = vals.height || 0;
      const slantW = Math.sqrt((b / 2) ** 2 + h ** 2);
      const slantL = Math.sqrt((w / 2) ** 2 + h ** 2);
      return {
        volume: (1 / 3) * b * w * h,
        surface: b * w + b * slantL + w * slantW,
        formula: `V = (1/3) \u00D7 b \u00D7 w \u00D7 h = (1/3) \u00D7 ${b} \u00D7 ${w} \u00D7 ${h} = ${((1 / 3) * b * w * h).toFixed(6)}`,
        saFormula: `SA = bw + b\u00D7l\u2081 + w\u00D7l\u2082 = ${(b * w).toFixed(2)} + ${(b * slantL).toFixed(2)} + ${(w * slantW).toFixed(2)} = ${(b * w + b * slantL + w * slantW).toFixed(6)}`,
      };
    }
  }
}

const shapeFields: Record<Shape, string[]> = {
  cube: ['side'],
  rectangular: ['length', 'width', 'height'],
  sphere: ['radius'],
  cylinder: ['radius', 'height'],
  cone: ['radius', 'height'],
  pyramid: ['baseLength', 'baseWidth', 'height'],
};

export default function VolumeCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['volume-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [shape, setShape] = useState<Shape>('cube');
  const [unit, setUnit] = useState<VolumeUnit>('m3');
  const [vals, setVals] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<{ shape: string; volume: string; surface: string }[]>([]);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const setVal = (key: string, value: string) => setVals(prev => ({ ...prev, [key]: value }));

  const numVals: Record<string, number> = {};
  for (const f of shapeFields[shape]) {
    numVals[f] = parseFloat(vals[f] || '') || 0;
  }
  const allPositive = shapeFields[shape].every(f => numVals[f] > 0);

  const calc = allPositive ? calcVolume(shape, numVals) : null;
  const volumeInUnit = calc ? calc.volume * unitConversions[unit] : 0;
  const surfaceInUnit = calc ? calc.surface * (unitConversions[unit] ** (2 / 3)) : 0;

  // For surface area, convert from m^2. We use the square root of the volume conversion factor.
  // Actually surface area is in m^2, so we need area unit conversion
  const areaUnit = unit === 'm3' ? 'm\u00B2' : unit === 'cm3' ? 'cm\u00B2' : unit === 'L' ? 'dm\u00B2' : unit === 'ft3' ? 'ft\u00B2' : unit === 'in3' ? 'in\u00B2' : 'ft\u00B2';
  const areaConversions: Record<VolumeUnit, number> = {
    m3: 1,
    cm3: 1e4,
    L: 100, // 1 m^2 = 100 dm^2
    ft3: 10.7639,
    in3: 1550.0031,
    gal: 10.7639, // use ft^2 for gallons
  };
  const surfaceConverted = calc ? calc.surface * areaConversions[unit] : 0;

  // Auto-save to history
  const prevResult = useState<string>('');
  const resultKey = calc ? `${shape}-${volumeInUnit.toFixed(6)}` : '';
  if (resultKey && resultKey !== prevResult[0]) {
    prevResult[1](resultKey);
    setHistory(prev => [
      { shape: t(shape), volume: `${volumeInUnit.toFixed(4)} ${unitLabels[unit]}`, surface: `${surfaceConverted.toFixed(4)} ${areaUnit}` },
      ...prev,
    ].slice(0, 8));
  }

  const handleReset = () => {
    setVals({});
  };

  const copyResult = () => {
    if (!calc) return;
    const text = `${t('volume')}: ${volumeInUnit.toFixed(4)} ${unitLabels[unit]}\n${t('surfaceArea')}: ${surfaceConverted.toFixed(4)} ${areaUnit}\n${t('formula')}: ${calc.formula}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const shapes: Shape[] = ['cube', 'rectangular', 'sphere', 'cylinder', 'cone', 'pyramid'];
  const units: VolumeUnit[] = ['m3', 'cm3', 'L', 'ft3', 'in3', 'gal'];

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Volume Calculator: Compute 3D Shape Volumes Instantly',
      paragraphs: [
        'Calculating the volume of three-dimensional shapes is a fundamental skill in mathematics, engineering, architecture, and everyday life. Whether you need to determine how much water a tank can hold, the amount of concrete needed for a foundation, or the capacity of a storage container, volume calculations are essential. Our free online volume calculator supports six common geometric shapes: cube, rectangular prism, sphere, cylinder, cone, and pyramid.',
        'Each shape has its own formula derived from basic geometric principles. The cube uses the simplest formula, V = s cubed, where s is the side length. The rectangular prism extends this to V = l times w times h, accounting for different dimensions. The sphere formula, V = (4/3) times pi times r cubed, reflects the symmetry of a perfectly round object. Cylinders and cones involve pi as well, with the cone being exactly one-third the volume of a cylinder with the same base and height.',
        'Beyond pure volume, this tool also calculates surface area as a bonus. Surface area is crucial in real-world applications such as painting, packaging, and heat transfer calculations. For example, knowing the surface area of a cylindrical tank helps estimate the amount of paint or insulation material required. The tool displays the exact formula used for each calculation, making it an excellent learning resource for students.',
        'The unit conversion feature lets you switch between cubic meters, cubic centimeters, liters, cubic feet, cubic inches, and gallons. This is particularly useful for international projects or when converting between metric and imperial systems. All conversions are performed in real time, so you can instantly see how the same volume appears in different units.',
        'Practical applications are vast. In construction, volume calculations help estimate materials like concrete, gravel, or soil. In cooking, converting between liters and gallons is common. Shipping companies calculate package volumes to optimize cargo space. Scientists use volume to determine densities and concentrations. Even hobbyists use these formulas when building aquariums, planters, or custom furniture.',
        'Our calculator provides real-time results as you type, maintains a history of recent calculations for quick reference, and allows you to copy results with a single click. The interface adapts to all screen sizes, making it convenient to use on desktop, tablet, or smartphone. No registration is needed and all calculations are performed locally in your browser for maximum privacy and speed.',
      ],
      faq: [
        { q: 'What units should I use for input values?', a: 'All input values should be in meters. The tool then converts the resulting volume into your selected output unit (cubic meters, liters, cubic feet, etc.). For example, if you enter a radius of 0.5, that means 0.5 meters or 50 centimeters.' },
        { q: 'How do I calculate the volume of an irregular shape?', a: 'For irregular shapes, you can approximate by breaking them down into simpler geometric shapes (cubes, cylinders, cones, etc.), calculating each volume separately, and then adding or subtracting them. This is called the decomposition method and works well for most practical purposes.' },
        { q: 'What is the difference between volume and capacity?', a: 'Volume refers to the amount of three-dimensional space an object occupies, measured in cubic units. Capacity refers to the amount a container can hold, often measured in liters or gallons. Numerically, 1 liter equals 1000 cubic centimeters (or 0.001 cubic meters).' },
        { q: 'Why is the cone volume exactly one-third of a cylinder?', a: 'This is a fundamental result in geometry proven by Archimedes. A cone with the same base radius and height as a cylinder has exactly one-third the volume. Intuitively, if you filled the cone with water and poured it into the cylinder, you would need to do it three times to fill the cylinder completely.' },
        { q: 'How accurate are the calculations?', a: 'The calculator uses JavaScript double-precision floating-point arithmetic (IEEE 754), which provides about 15-16 significant decimal digits of precision. Results are displayed to 4 decimal places by default. For virtually all practical applications, this level of precision is more than sufficient.' },
      ],
    },
    it: {
      title: 'Calcolatore di Volume: Calcola i Volumi delle Forme 3D Istantaneamente',
      paragraphs: [
        'Calcolare il volume delle forme tridimensionali e una competenza fondamentale in matematica, ingegneria, architettura e vita quotidiana. Che tu debba determinare quanta acqua puo contenere un serbatoio, la quantita di cemento necessaria per una fondazione, o la capacita di un contenitore, i calcoli del volume sono essenziali. Il nostro calcolatore di volume online gratuito supporta sei forme geometriche comuni: cubo, prisma rettangolare, sfera, cilindro, cono e piramide.',
        'Ogni forma ha la propria formula derivata dai principi geometrici di base. Il cubo utilizza la formula piu semplice, V = s al cubo, dove s e la lunghezza del lato. Il prisma rettangolare estende questo a V = l per w per h, tenendo conto delle diverse dimensioni. La formula della sfera, V = (4/3) per pi greco per r al cubo, riflette la simmetria di un oggetto perfettamente rotondo. Cilindri e coni coinvolgono anche pi greco, con il cono che ha esattamente un terzo del volume di un cilindro con la stessa base e altezza.',
        'Oltre al volume puro, questo strumento calcola anche l\'area superficiale come bonus. L\'area superficiale e cruciale nelle applicazioni del mondo reale come la verniciatura, l\'imballaggio e i calcoli di trasferimento del calore. Ad esempio, conoscere l\'area superficiale di un serbatoio cilindrico aiuta a stimare la quantita di vernice o materiale isolante necessario. Lo strumento mostra la formula esatta utilizzata per ogni calcolo, rendendolo un\'eccellente risorsa di apprendimento per gli studenti.',
        'La funzione di conversione delle unita ti consente di passare tra metri cubi, centimetri cubi, litri, piedi cubi, pollici cubi e galloni. Questo e particolarmente utile per progetti internazionali o quando si convertono tra sistemi metrici e imperiali. Tutte le conversioni vengono eseguite in tempo reale.',
        'Le applicazioni pratiche sono vaste. Nell\'edilizia, i calcoli del volume aiutano a stimare materiali come cemento, ghiaia o terra. Nella cucina, la conversione tra litri e galloni e comune. Le aziende di spedizioni calcolano i volumi dei pacchi per ottimizzare lo spazio di carico. Gli scienziati usano il volume per determinare densita e concentrazioni.',
        'Il nostro calcolatore fornisce risultati in tempo reale mentre digiti, mantiene una cronologia dei calcoli recenti per un rapido riferimento e ti consente di copiare i risultati con un singolo clic. L\'interfaccia si adatta a tutte le dimensioni dello schermo. Non e necessaria alcuna registrazione e tutti i calcoli vengono eseguiti localmente nel tuo browser.',
      ],
      faq: [
        { q: 'Quali unita devo usare per i valori di input?', a: 'Tutti i valori di input devono essere in metri. Lo strumento converte quindi il volume risultante nell\'unita di output selezionata. Ad esempio, se inserisci un raggio di 0,5, significa 0,5 metri o 50 centimetri.' },
        { q: 'Come calcolo il volume di una forma irregolare?', a: 'Per le forme irregolari, puoi approssimare scomponendole in forme geometriche piu semplici (cubi, cilindri, coni, ecc.), calcolando ciascun volume separatamente e poi sommandoli o sottraendoli.' },
        { q: 'Qual e la differenza tra volume e capacita?', a: 'Il volume si riferisce alla quantita di spazio tridimensionale che un oggetto occupa, misurata in unita cubiche. La capacita si riferisce alla quantita che un contenitore puo contenere, spesso misurata in litri o galloni. 1 litro equivale a 1000 centimetri cubi.' },
        { q: 'Perche il volume del cono e esattamente un terzo di quello del cilindro?', a: 'Questo e un risultato fondamentale della geometria dimostrato da Archimede. Un cono con lo stesso raggio di base e altezza di un cilindro ha esattamente un terzo del volume. Se riempi il cono d\'acqua e lo versi nel cilindro, dovresti farlo tre volte per riempirlo completamente.' },
        { q: 'Quanto sono precisi i calcoli?', a: 'Il calcolatore usa l\'aritmetica a virgola mobile a doppia precisione di JavaScript (IEEE 754), che fornisce circa 15-16 cifre decimali significative. I risultati sono visualizzati con 4 cifre decimali.' },
      ],
    },
    es: {
      title: 'Calculadora de Volumen: Calcula Vol\u00FAmenes de Formas 3D al Instante',
      paragraphs: [
        'Calcular el volumen de formas tridimensionales es una habilidad fundamental en matem\u00E1ticas, ingenier\u00EDa, arquitectura y vida cotidiana. Ya sea que necesites determinar cu\u00E1nta agua puede contener un tanque, la cantidad de concreto necesaria para una cimentaci\u00F3n, o la capacidad de un contenedor de almacenamiento, los c\u00E1lculos de volumen son esenciales. Nuestra calculadora de volumen en l\u00EDnea gratuita soporta seis formas geom\u00E9tricas comunes: cubo, prisma rectangular, esfera, cilindro, cono y pir\u00E1mide.',
        'Cada forma tiene su propia f\u00F3rmula derivada de principios geom\u00E9tricos b\u00E1sicos. El cubo usa la f\u00F3rmula m\u00E1s simple, V = s al cubo, donde s es la longitud del lado. El prisma rectangular extiende esto a V = l por w por h. La f\u00F3rmula de la esfera, V = (4/3) por pi por r al cubo, refleja la simetr\u00EDa de un objeto perfectamente redondo. Los cilindros y conos tambi\u00E9n involucran pi, siendo el cono exactamente un tercio del volumen de un cilindro con la misma base y altura.',
        'Adem\u00E1s del volumen puro, esta herramienta tambi\u00E9n calcula el \u00E1rea superficial como bonificaci\u00F3n. El \u00E1rea superficial es crucial en aplicaciones del mundo real como la pintura, el embalaje y los c\u00E1lculos de transferencia de calor. La herramienta muestra la f\u00F3rmula exacta utilizada para cada c\u00E1lculo, convirti\u00E9ndola en un excelente recurso de aprendizaje para estudiantes.',
        'La funci\u00F3n de conversi\u00F3n de unidades te permite cambiar entre metros c\u00FAbicos, cent\u00EDmetros c\u00FAbicos, litros, pies c\u00FAbicos, pulgadas c\u00FAbicas y galones. Esto es particularmente \u00FAtil para proyectos internacionales o al convertir entre sistemas m\u00E9trico e imperial. Todas las conversiones se realizan en tiempo real.',
        'Las aplicaciones pr\u00E1cticas son vastas. En la construcci\u00F3n, los c\u00E1lculos de volumen ayudan a estimar materiales como concreto, grava o tierra. En la cocina, convertir entre litros y galones es com\u00FAn. Las compa\u00F1\u00EDas de env\u00EDo calculan vol\u00FAmenes de paquetes para optimizar el espacio de carga.',
        'Nuestra calculadora proporciona resultados en tiempo real mientras escribes, mantiene un historial de c\u00E1lculos recientes y te permite copiar resultados con un solo clic. La interfaz se adapta a todos los tama\u00F1os de pantalla. No se necesita registro y todos los c\u00E1lculos se realizan localmente en tu navegador.',
      ],
      faq: [
        { q: '\u00BFQu\u00E9 unidades debo usar para los valores de entrada?', a: 'Todos los valores de entrada deben estar en metros. La herramienta convierte el volumen resultante a la unidad de salida seleccionada. Por ejemplo, si ingresas un radio de 0.5, significa 0.5 metros o 50 cent\u00EDmetros.' },
        { q: '\u00BFC\u00F3mo calculo el volumen de una forma irregular?', a: 'Para formas irregulares, puedes aproximar descomponi\u00E9ndolas en formas geom\u00E9tricas m\u00E1s simples (cubos, cilindros, conos, etc.), calculando cada volumen por separado y luego sum\u00E1ndolos o rest\u00E1ndolos.' },
        { q: '\u00BFCu\u00E1l es la diferencia entre volumen y capacidad?', a: 'El volumen se refiere a la cantidad de espacio tridimensional que ocupa un objeto, medido en unidades c\u00FAbicas. La capacidad se refiere a la cantidad que puede contener un recipiente, a menudo medida en litros o galones. 1 litro equivale a 1000 cent\u00EDmetros c\u00FAbicos.' },
        { q: '\u00BFPor qu\u00E9 el volumen del cono es exactamente un tercio del cilindro?', a: 'Este es un resultado fundamental en geometr\u00EDa demostrado por Arqu\u00EDmedes. Un cono con el mismo radio de base y altura que un cilindro tiene exactamente un tercio del volumen. Si llenaras el cono con agua y lo vertieras en el cilindro, necesitar\u00EDas hacerlo tres veces para llenarlo completamente.' },
        { q: '\u00BFQu\u00E9 tan precisos son los c\u00E1lculos?', a: 'La calculadora usa aritm\u00E9tica de punto flotante de doble precisi\u00F3n de JavaScript (IEEE 754), que proporciona aproximadamente 15-16 d\u00EDgitos decimales significativos de precisi\u00F3n. Los resultados se muestran con 4 decimales.' },
      ],
    },
    fr: {
      title: 'Calculateur de Volume : Calculez les Volumes de Formes 3D Instantan\u00E9ment',
      paragraphs: [
        'Calculer le volume des formes tridimensionnelles est une comp\u00E9tence fondamentale en math\u00E9matiques, ing\u00E9nierie, architecture et vie quotidienne. Que vous ayez besoin de d\u00E9terminer combien d\'eau un r\u00E9servoir peut contenir, la quantit\u00E9 de b\u00E9ton n\u00E9cessaire pour une fondation, ou la capacit\u00E9 d\'un conteneur de stockage, les calculs de volume sont essentiels. Notre calculateur de volume en ligne gratuit prend en charge six formes g\u00E9om\u00E9triques courantes : cube, prisme rectangulaire, sph\u00E8re, cylindre, c\u00F4ne et pyramide.',
        'Chaque forme a sa propre formule d\u00E9riv\u00E9e des principes g\u00E9om\u00E9triques de base. Le cube utilise la formule la plus simple, V = s au cube, o\u00F9 s est la longueur du c\u00F4t\u00E9. Le prisme rectangulaire \u00E9tend cela \u00E0 V = l fois w fois h. La formule de la sph\u00E8re, V = (4/3) fois pi fois r au cube, refl\u00E8te la sym\u00E9trie d\'un objet parfaitement rond. Les cylindres et c\u00F4nes impliquent \u00E9galement pi, le c\u00F4ne \u00E9tant exactement un tiers du volume d\'un cylindre de m\u00EAme base et hauteur.',
        'Au-del\u00E0 du volume pur, cet outil calcule \u00E9galement l\'aire de surface en bonus. L\'aire de surface est cruciale dans les applications du monde r\u00E9el telles que la peinture, l\'emballage et les calculs de transfert de chaleur. L\'outil affiche la formule exacte utilis\u00E9e pour chaque calcul, ce qui en fait une excellente ressource d\'apprentissage pour les \u00E9tudiants.',
        'La fonction de conversion d\'unit\u00E9s vous permet de basculer entre m\u00E8tres cubes, centim\u00E8tres cubes, litres, pieds cubes, pouces cubes et gallons. Cela est particuli\u00E8rement utile pour les projets internationaux ou lors de la conversion entre syst\u00E8mes m\u00E9trique et imp\u00E9rial. Toutes les conversions sont effectu\u00E9es en temps r\u00E9el.',
        'Les applications pratiques sont vastes. Dans la construction, les calculs de volume aident \u00E0 estimer les mat\u00E9riaux comme le b\u00E9ton, le gravier ou la terre. En cuisine, la conversion entre litres et gallons est courante. Les entreprises de transport calculent les volumes de colis pour optimiser l\'espace de chargement.',
        'Notre calculateur fournit des r\u00E9sultats en temps r\u00E9el pendant que vous tapez, conserve un historique des calculs r\u00E9cents et vous permet de copier les r\u00E9sultats en un seul clic. L\'interface s\'adapte \u00E0 toutes les tailles d\'\u00E9cran. Aucune inscription n\'est n\u00E9cessaire et tous les calculs sont effectu\u00E9s localement dans votre navigateur.',
      ],
      faq: [
        { q: 'Quelles unit\u00E9s dois-je utiliser pour les valeurs d\'entr\u00E9e ?', a: 'Toutes les valeurs d\'entr\u00E9e doivent \u00EAtre en m\u00E8tres. L\'outil convertit ensuite le volume r\u00E9sultant dans l\'unit\u00E9 de sortie s\u00E9lectionn\u00E9e. Par exemple, si vous entrez un rayon de 0,5, cela signifie 0,5 m\u00E8tre ou 50 centim\u00E8tres.' },
        { q: 'Comment calculer le volume d\'une forme irr\u00E9guli\u00E8re ?', a: 'Pour les formes irr\u00E9guli\u00E8res, vous pouvez approximer en les d\u00E9composant en formes g\u00E9om\u00E9triques plus simples (cubes, cylindres, c\u00F4nes, etc.), en calculant chaque volume s\u00E9par\u00E9ment, puis en les additionnant ou soustrayant.' },
        { q: 'Quelle est la diff\u00E9rence entre volume et capacit\u00E9 ?', a: 'Le volume d\u00E9signe la quantit\u00E9 d\'espace tridimensionnel qu\'un objet occupe, mesur\u00E9 en unit\u00E9s cubiques. La capacit\u00E9 d\u00E9signe la quantit\u00E9 qu\'un conteneur peut contenir, souvent mesur\u00E9e en litres ou gallons. 1 litre \u00E9quivaut \u00E0 1000 centim\u00E8tres cubes.' },
        { q: 'Pourquoi le volume du c\u00F4ne est-il exactement un tiers de celui du cylindre ?', a: 'C\'est un r\u00E9sultat fondamental en g\u00E9om\u00E9trie d\u00E9montr\u00E9 par Archim\u00E8de. Un c\u00F4ne ayant le m\u00EAme rayon de base et la m\u00EAme hauteur qu\'un cylindre a exactement un tiers du volume. Si vous remplissiez le c\u00F4ne d\'eau et le versiez dans le cylindre, il faudrait le faire trois fois pour le remplir compl\u00E8tement.' },
        { q: 'Quelle est la pr\u00E9cision des calculs ?', a: 'Le calculateur utilise l\'arithm\u00E9tique \u00E0 virgule flottante double pr\u00E9cision de JavaScript (IEEE 754), offrant environ 15-16 chiffres d\u00E9cimaux significatifs. Les r\u00E9sultats sont affich\u00E9s avec 4 d\u00E9cimales.' },
      ],
    },
    de: {
      title: 'Volumenrechner: Berechnen Sie 3D-Formvolumen Sofort',
      paragraphs: [
        'Die Berechnung des Volumens dreidimensionaler Formen ist eine grundlegende F\u00E4higkeit in Mathematik, Ingenieurwesen, Architektur und Alltag. Ob Sie bestimmen m\u00FCssen, wie viel Wasser ein Tank fassen kann, die Menge an Beton f\u00FCr ein Fundament oder die Kapazit\u00E4t eines Lagerbeh\u00E4lters \u2014 Volumenberechnungen sind unverzichtbar. Unser kostenloser Online-Volumenrechner unterst\u00FCtzt sechs g\u00E4ngige geometrische Formen: W\u00FCrfel, Quader, Kugel, Zylinder, Kegel und Pyramide.',
        'Jede Form hat ihre eigene Formel, die aus grundlegenden geometrischen Prinzipien abgeleitet ist. Der W\u00FCrfel verwendet die einfachste Formel, V = s hoch 3, wobei s die Seitenl\u00E4nge ist. Der Quader erweitert dies zu V = l mal w mal h. Die Kugelformel, V = (4/3) mal Pi mal r hoch 3, spiegelt die Symmetrie eines perfekt runden Objekts wider. Zylinder und Kegel beinhalten ebenfalls Pi, wobei der Kegel genau ein Drittel des Volumens eines Zylinders mit gleicher Basis und H\u00F6he hat.',
        '\u00DCber das reine Volumen hinaus berechnet dieses Tool auch die Oberfl\u00E4che als Bonus. Die Oberfl\u00E4che ist entscheidend bei realen Anwendungen wie Lackierung, Verpackung und W\u00E4rme\u00FCbertragungsberechnungen. Das Tool zeigt die genaue Formel f\u00FCr jede Berechnung an und ist damit eine ausgezeichnete Lernressource f\u00FCr Studenten.',
        'Die Einheitenumrechnung erm\u00F6glicht den Wechsel zwischen Kubikmetern, Kubikzentimetern, Litern, Kubikfu\u00DF, Kubikzoll und Gallonen. Dies ist besonders n\u00FCtzlich f\u00FCr internationale Projekte oder bei der Umrechnung zwischen metrischem und imperialem System. Alle Umrechnungen erfolgen in Echtzeit.',
        'Praktische Anwendungen sind vielf\u00E4ltig. Im Bauwesen helfen Volumenberechnungen bei der Sch\u00E4tzung von Materialien wie Beton, Kies oder Erde. Beim Kochen ist die Umrechnung zwischen Litern und Gallonen \u00FCblich. Speditionen berechnen Paketvolumen zur Optimierung des Frachtraums.',
        'Unser Rechner liefert Echtzeitergebnisse w\u00E4hrend Sie tippen, speichert eine Historie der letzten Berechnungen und erm\u00F6glicht das Kopieren der Ergebnisse mit einem Klick. Die Oberfl\u00E4che passt sich allen Bildschirmgr\u00F6\u00DFen an. Keine Registrierung erforderlich, alle Berechnungen werden lokal in Ihrem Browser durchgef\u00FChrt.',
      ],
      faq: [
        { q: 'Welche Einheiten soll ich f\u00FCr die Eingabewerte verwenden?', a: 'Alle Eingabewerte sollten in Metern angegeben werden. Das Tool konvertiert dann das resultierende Volumen in die gew\u00E4hlte Ausgabeeinheit. Wenn Sie beispielsweise einen Radius von 0,5 eingeben, bedeutet das 0,5 Meter oder 50 Zentimeter.' },
        { q: 'Wie berechne ich das Volumen einer unregelm\u00E4\u00DFigen Form?', a: 'F\u00FCr unregelm\u00E4\u00DFige Formen k\u00F6nnen Sie diese in einfachere geometrische Formen (W\u00FCrfel, Zylinder, Kegel usw.) zerlegen, jedes Volumen einzeln berechnen und dann addieren oder subtrahieren.' },
        { q: 'Was ist der Unterschied zwischen Volumen und Kapazit\u00E4t?', a: 'Volumen bezeichnet die Menge an dreidimensionalem Raum, die ein Objekt einnimmt, gemessen in Kubikeinheiten. Kapazit\u00E4t bezeichnet die Menge, die ein Beh\u00E4lter fassen kann, oft in Litern oder Gallonen gemessen. 1 Liter entspricht 1000 Kubikzentimetern.' },
        { q: 'Warum ist das Kegelvolumen genau ein Drittel des Zylindervolumens?', a: 'Dies ist ein grundlegendes Ergebnis der Geometrie, das von Archimedes bewiesen wurde. Ein Kegel mit dem gleichen Basisradius und der gleichen H\u00F6he wie ein Zylinder hat genau ein Drittel des Volumens. Wenn Sie den Kegel mit Wasser f\u00FCllen und in den Zylinder gie\u00DFen, m\u00FCssten Sie es dreimal tun, um ihn vollst\u00E4ndig zu f\u00FCllen.' },
        { q: 'Wie genau sind die Berechnungen?', a: 'Der Rechner verwendet JavaScript-Gleitkommaarithmetik mit doppelter Genauigkeit (IEEE 754), die etwa 15-16 signifikante Dezimalstellen bietet. Ergebnisse werden standardm\u00E4\u00DFig mit 4 Dezimalstellen angezeigt.' },
      ],
    },
    pt: {
      title: 'Calculadora de Volume: Calcule Volumes de Formas 3D Instantaneamente',
      paragraphs: [
        'Calcular o volume de formas tridimensionais \u00E9 uma habilidade fundamental em matem\u00E1tica, engenharia, arquitetura e vida cotidiana. Seja para determinar quanta \u00E1gua um tanque pode conter, a quantidade de concreto necess\u00E1ria para uma funda\u00E7\u00E3o, ou a capacidade de um cont\u00EAiner de armazenamento, os c\u00E1lculos de volume s\u00E3o essenciais. Nossa calculadora de volume online gratuita suporta seis formas geom\u00E9tricas comuns: cubo, prisma retangular, esfera, cilindro, cone e pir\u00E2mide.',
        'Cada forma tem sua pr\u00F3pria f\u00F3rmula derivada de princ\u00EDpios geom\u00E9tricos b\u00E1sicos. O cubo usa a f\u00F3rmula mais simples, V = s ao cubo, onde s \u00E9 o comprimento do lado. O prisma retangular estende isso para V = l vezes w vezes h. A f\u00F3rmula da esfera, V = (4/3) vezes pi vezes r ao cubo, reflete a simetria de um objeto perfeitamente redondo. Cilindros e cones tamb\u00E9m envolvem pi, sendo o cone exatamente um ter\u00E7o do volume de um cilindro com a mesma base e altura.',
        'Al\u00E9m do volume puro, esta ferramenta tamb\u00E9m calcula a \u00E1rea superficial como b\u00F4nus. A \u00E1rea superficial \u00E9 crucial em aplica\u00E7\u00F5es do mundo real como pintura, embalagem e c\u00E1lculos de transfer\u00EAncia de calor. A ferramenta exibe a f\u00F3rmula exata usada para cada c\u00E1lculo, tornando-a um excelente recurso de aprendizado para estudantes.',
        'O recurso de convers\u00E3o de unidades permite alternar entre metros c\u00FAbicos, cent\u00EDmetros c\u00FAbicos, litros, p\u00E9s c\u00FAbicos, polegadas c\u00FAbicas e gal\u00F5es. Isso \u00E9 particularmente \u00FAtil para projetos internacionais ou ao converter entre sistemas m\u00E9trico e imperial. Todas as convers\u00F5es s\u00E3o realizadas em tempo real.',
        'As aplica\u00E7\u00F5es pr\u00E1ticas s\u00E3o vastas. Na constru\u00E7\u00E3o, os c\u00E1lculos de volume ajudam a estimar materiais como concreto, cascalho ou terra. Na culin\u00E1ria, converter entre litros e gal\u00F5es \u00E9 comum. Empresas de transporte calculam volumes de pacotes para otimizar o espa\u00E7o de carga.',
        'Nossa calculadora fornece resultados em tempo real enquanto voc\u00EA digita, mant\u00E9m um hist\u00F3rico de c\u00E1lculos recentes e permite copiar resultados com um \u00FAnico clique. A interface se adapta a todos os tamanhos de tela. Nenhum registro \u00E9 necess\u00E1rio e todos os c\u00E1lculos s\u00E3o realizados localmente no seu navegador.',
      ],
      faq: [
        { q: 'Quais unidades devo usar para os valores de entrada?', a: 'Todos os valores de entrada devem estar em metros. A ferramenta converte o volume resultante na unidade de sa\u00EDda selecionada. Por exemplo, se voc\u00EA inserir um raio de 0,5, significa 0,5 metros ou 50 cent\u00EDmetros.' },
        { q: 'Como calculo o volume de uma forma irregular?', a: 'Para formas irregulares, voc\u00EA pode aproximar decompondo-as em formas geom\u00E9tricas mais simples (cubos, cilindros, cones, etc.), calculando cada volume separadamente e depois somando ou subtraindo.' },
        { q: 'Qual \u00E9 a diferen\u00E7a entre volume e capacidade?', a: 'Volume refere-se \u00E0 quantidade de espa\u00E7o tridimensional que um objeto ocupa, medido em unidades c\u00FAbicas. Capacidade refere-se \u00E0 quantidade que um recipiente pode conter, frequentemente medida em litros ou gal\u00F5es. 1 litro equivale a 1000 cent\u00EDmetros c\u00FAbicos.' },
        { q: 'Por que o volume do cone \u00E9 exatamente um ter\u00E7o do cilindro?', a: 'Este \u00E9 um resultado fundamental da geometria demonstrado por Arquimedes. Um cone com o mesmo raio de base e altura que um cilindro tem exatamente um ter\u00E7o do volume. Se voc\u00EA enchesse o cone com \u00E1gua e despejasse no cilindro, precisaria fazer isso tr\u00EAs vezes para ench\u00EA-lo completamente.' },
        { q: 'Qu\u00E3o precisos s\u00E3o os c\u00E1lculos?', a: 'A calculadora usa aritm\u00E9tica de ponto flutuante de precis\u00E3o dupla do JavaScript (IEEE 754), que fornece aproximadamente 15-16 d\u00EDgitos decimais significativos de precis\u00E3o. Os resultados s\u00E3o exibidos com 4 casas decimais.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="volume-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{toolT.description}</p>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          {/* Shape selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('shape')}</label>
            <div className="grid grid-cols-3 gap-2">
              {shapes.map((s) => (
                <button
                  key={s}
                  onClick={() => { setShape(s); setVals({}); }}
                  className={`py-2.5 px-2 rounded-lg text-sm font-medium transition-all ${shape === s ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  <span className="mr-1">{shapeIcons[s]}</span> {t(s)}
                </button>
              ))}
            </div>
          </div>

          {/* Unit selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('unit')}</label>
            <div className="flex flex-wrap gap-2">
              {units.map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${unit === u ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  {unitLabels[u]}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">{t('inputUnit')}</p>

          {/* Dynamic input fields */}
          {shapeFields[shape].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t(field)}</label>
              <input
                type="number"
                min="0"
                step="any"
                value={vals[field] || ''}
                onChange={(e) => setVal(field, e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}

          {/* Reset button */}
          <button onClick={handleReset} className="w-full py-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
            {t('reset')}
          </button>

          {/* Result card */}
          {calc && (
            <div className="mt-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('volume')}</div>
                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                      {volumeInUnit.toFixed(4)} {unitLabels[unit]}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('surfaceArea')}</div>
                    <div className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
                      {surfaceConverted.toFixed(4)} {areaUnit}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('formula')}</div>
                    <div className="text-sm font-mono text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded px-2 py-1 mt-1">{calc.formula}</div>
                    <div className="text-sm font-mono text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded px-2 py-1 mt-1">{calc.saFormula}</div>
                  </div>
                </div>
                <button onClick={copyResult} className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ml-3">
                  {copied ? t('copied') : t('copy')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('history')}</h3>
              <button onClick={() => setHistory([])} className="text-xs text-red-500 hover:text-red-700">{t('clearHistory')}</button>
            </div>
            <div className="space-y-1">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between text-sm px-2 py-1.5 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-gray-500 dark:text-gray-400">{h.shape}</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{h.volume}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEO Article */}
        <article className="mt-12 prose prose-gray dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{p}</p>)}
        </article>

        {/* FAQ */}
        <section className="mt-10 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">FAQ</h2>
          <div className="space-y-2">
            {seo.faq.map((item, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left px-4 py-3 font-medium text-gray-900 dark:text-gray-100 flex justify-between items-center">
                  {item.q}
                  <span className="text-gray-400">{openFaq === i ? '\u2212' : '+'}</span>
                </button>
                {openFaq === i && <div className="px-4 pb-3 text-gray-600 dark:text-gray-400">{item.a}</div>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </ToolPageWrapper>
  );
}
