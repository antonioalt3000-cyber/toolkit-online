'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type Unit = 'C' | 'F' | 'K' | 'R';

const unitLabels: Record<Unit, string> = { C: '°C', F: '°F', K: 'K', R: '°R' };
const unitNames: Record<Unit, Record<Locale, string>> = {
  C: { en: 'Celsius', it: 'Celsius', es: 'Celsius', fr: 'Celsius', de: 'Celsius', pt: 'Celsius' },
  F: { en: 'Fahrenheit', it: 'Fahrenheit', es: 'Fahrenheit', fr: 'Fahrenheit', de: 'Fahrenheit', pt: 'Fahrenheit' },
  K: { en: 'Kelvin', it: 'Kelvin', es: 'Kelvin', fr: 'Kelvin', de: 'Kelvin', pt: 'Kelvin' },
  R: { en: 'Rankine', it: 'Rankine', es: 'Rankine', fr: 'Rankine', de: 'Rankine', pt: 'Rankine' },
};

const units: Unit[] = ['C', 'F', 'K', 'R'];

function toCelsius(value: number, from: Unit): number {
  switch (from) {
    case 'C': return value;
    case 'F': return (value - 32) * 5 / 9;
    case 'K': return value - 273.15;
    case 'R': return (value - 491.67) * 5 / 9;
  }
}

function fromCelsius(celsius: number, to: Unit): number {
  switch (to) {
    case 'C': return celsius;
    case 'F': return celsius * 9 / 5 + 32;
    case 'K': return celsius + 273.15;
    case 'R': return (celsius + 273.15) * 9 / 5;
  }
}

function convert(value: number, from: Unit, to: Unit): number {
  return fromCelsius(toCelsius(value, from), to);
}

function getFormula(from: Unit, to: Unit): string {
  const formulas: Record<string, string> = {
    'C-F': '°F = °C × 9/5 + 32',
    'C-K': 'K = °C + 273.15',
    'C-R': '°R = (°C + 273.15) × 9/5',
    'F-C': '°C = (°F − 32) × 5/9',
    'F-K': 'K = (°F − 32) × 5/9 + 273.15',
    'F-R': '°R = °F + 459.67',
    'K-C': '°C = K − 273.15',
    'K-F': '°F = (K − 273.15) × 9/5 + 32',
    'K-R': '°R = K × 9/5',
    'R-C': '°C = (°R − 491.67) × 5/9',
    'R-F': '°F = °R − 459.67',
    'R-K': 'K = °R × 5/9',
  };
  if (from === to) return `${unitLabels[to]} = ${unitLabels[from]}`;
  return formulas[`${from}-${to}`] || '';
}

interface HistoryEntry {
  inputValue: string;
  fromUnit: Unit;
  results: Record<Unit, string>;
  timestamp: number;
}

const labels: Record<string, Record<Locale, string>> = {
  inputLabel: { en: 'Enter temperature', it: 'Inserisci temperatura', es: 'Ingrese temperatura', fr: 'Entrez la température', de: 'Temperatur eingeben', pt: 'Insira a temperatura' },
  fromUnit: { en: 'From unit', it: 'Unità di partenza', es: 'Unidad de origen', fr: 'Unité source', de: 'Ausgangseinheit', pt: 'Unidade de origem' },
  allConversions: { en: 'All Conversions', it: 'Tutte le Conversioni', es: 'Todas las Conversiones', fr: 'Toutes les Conversions', de: 'Alle Umrechnungen', pt: 'Todas as Conversões' },
  formula: { en: 'Formula', it: 'Formula', es: 'Fórmula', fr: 'Formule', de: 'Formel', pt: 'Fórmula' },
  formulas: { en: 'Conversion Formulas', it: 'Formule di Conversione', es: 'Fórmulas de Conversión', fr: 'Formules de Conversion', de: 'Umrechnungsformeln', pt: 'Fórmulas de Conversão' },
  referencePoints: { en: 'Common Reference Points', it: 'Punti di Riferimento Comuni', es: 'Puntos de Referencia Comunes', fr: 'Points de Référence Courants', de: 'Häufige Referenzpunkte', pt: 'Pontos de Referência Comuns' },
  copy: { en: 'Copy All', it: 'Copia Tutto', es: 'Copiar Todo', fr: 'Tout Copier', de: 'Alles Kopieren', pt: 'Copiar Tudo' },
  copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  reset: { en: 'Reset', it: 'Ripristina', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  history: { en: 'Conversion History', it: 'Cronologia Conversioni', es: 'Historial de Conversiones', fr: 'Historique des Conversions', de: 'Umrechnungsverlauf', pt: 'Histórico de Conversões' },
  clearHistory: { en: 'Clear History', it: 'Cancella Cronologia', es: 'Borrar Historial', fr: 'Effacer l\'Historique', de: 'Verlauf Löschen', pt: 'Limpar Histórico' },
  waterBoiling: { en: 'Water boiling point', it: 'Punto di ebollizione acqua', es: 'Punto de ebullición del agua', fr: 'Point d\'ébullition de l\'eau', de: 'Siedepunkt von Wasser', pt: 'Ponto de ebulição da água' },
  bodyTemp: { en: 'Human body temperature', it: 'Temperatura corporea umana', es: 'Temperatura corporal humana', fr: 'Température du corps humain', de: 'Menschliche Körpertemperatur', pt: 'Temperatura do corpo humano' },
  roomTemp: { en: 'Room temperature', it: 'Temperatura ambiente', es: 'Temperatura ambiente', fr: 'Température ambiante', de: 'Raumtemperatur', pt: 'Temperatura ambiente' },
  waterFreezing: { en: 'Water freezing point', it: 'Punto di congelamento acqua', es: 'Punto de congelación del agua', fr: 'Point de congélation de l\'eau', de: 'Gefrierpunkt von Wasser', pt: 'Ponto de congelamento da água' },
  absoluteZero: { en: 'Absolute zero', it: 'Zero assoluto', es: 'Cero absoluto', fr: 'Zéro absolu', de: 'Absoluter Nullpunkt', pt: 'Zero absoluto' },
};

const referencePoints = [
  { key: 'waterBoiling', C: 100, F: 212, K: 373.15, R: 671.67 },
  { key: 'bodyTemp', C: 37, F: 98.6, K: 310.15, R: 558.27 },
  { key: 'roomTemp', C: 20, F: 68, K: 293.15, R: 527.67 },
  { key: 'waterFreezing', C: 0, F: 32, K: 273.15, R: 491.67 },
  { key: 'absoluteZero', C: -273.15, F: -459.67, K: 0, R: 0 },
];

// Thermometer SVG component
function Thermometer({ celsius }: { celsius: number }) {
  // Map celsius to a 0-100 range for visual (-273.15 to 200)
  const minC = -50;
  const maxC = 150;
  const clamped = Math.max(minC, Math.min(maxC, celsius));
  const pct = ((clamped - minC) / (maxC - minC)) * 100;
  const fillHeight = Math.max(4, (pct / 100) * 120);
  // Color gradient: blue (cold) -> green (room) -> red (hot)
  let color = '#3b82f6';
  if (celsius > 60) color = '#ef4444';
  else if (celsius > 30) color = '#f97316';
  else if (celsius > 10) color = '#22c55e';
  else if (celsius > -10) color = '#06b6d4';

  return (
    <svg viewBox="0 0 40 180" className="w-10 h-36 mx-auto" aria-hidden="true">
      {/* Outer tube */}
      <rect x="14" y="10" width="12" height="130" rx="6" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1" />
      {/* Fill */}
      <rect x="16" y={140 - fillHeight} width="8" height={fillHeight} rx="4" fill={color} className="transition-all duration-300" />
      {/* Bulb */}
      <circle cx="20" cy="155" r="14" fill={color} className="transition-all duration-300" />
      <circle cx="20" cy="155" r="10" fill={color} opacity="0.7" />
      {/* Tick marks */}
      {[0, 25, 50, 75, 100].map((p) => {
        const y = 140 - (p / 100) * 120;
        return <line key={p} x1="28" y1={y} x2="34" y2={y} stroke="#9ca3af" strokeWidth="1" />;
      })}
    </svg>
  );
}

const STORAGE_KEY = 'temperature-converter-history';

export default function TemperatureConverter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['temperature-converter'][lang];

  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState<Unit>('C');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }, []);

  // Save history to localStorage
  const saveHistory = useCallback((entries: HistoryEntry[]) => {
    setHistory(entries);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); } catch {}
  }, []);

  const num = parseFloat(value);
  const isValid = value !== '' && !isNaN(num);
  const celsius = isValid ? toCelsius(num, fromUnit) : 0;

  // Check for temperatures below absolute zero
  const belowAbsoluteZero = isValid && celsius < -273.15;

  const results: Record<Unit, number> = {
    C: isValid ? fromCelsius(celsius, 'C') : 0,
    F: isValid ? fromCelsius(celsius, 'F') : 0,
    K: isValid ? fromCelsius(celsius, 'K') : 0,
    R: isValid ? fromCelsius(celsius, 'R') : 0,
  };

  const formatNum = (n: number) => n.toLocaleString(lang, { maximumFractionDigits: 4 });

  const resultStrings: Record<Unit, string> = {
    C: formatNum(results.C),
    F: formatNum(results.F),
    K: formatNum(results.K),
    R: formatNum(results.R),
  };

  const handleCopy = async () => {
    if (!isValid || belowAbsoluteZero) return;
    const lines = units
      .filter((u) => u !== fromUnit)
      .map((u) => `${value} ${unitLabels[fromUnit]} = ${resultStrings[u]} ${unitLabels[u]}`)
      .join('\n');
    await navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const addToHistory = () => {
    if (!isValid || belowAbsoluteZero) return;
    const entry: HistoryEntry = {
      inputValue: value,
      fromUnit,
      results: resultStrings,
      timestamp: Date.now(),
    };
    const updated = [entry, ...history.slice(0, 9)];
    saveHistory(updated);
  };

  const handleReset = () => {
    setValue('');
    setFromUnit('C');
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Temperature Converter: Celsius, Fahrenheit, Kelvin & Rankine',
      paragraphs: [
        'Temperature conversion is essential in science, cooking, travel, and daily life. Whether you are reading a weather forecast in Celsius while accustomed to Fahrenheit, adjusting oven temperatures for an international recipe, or performing scientific calculations in Kelvin, a reliable temperature converter saves time and prevents errors.',
        'Our free online temperature converter supports four major temperature scales: Celsius, Fahrenheit, Kelvin, and Rankine. Simply enter a temperature value, choose your input scale, and instantly see the equivalent in all other scales. The visual thermometer provides an intuitive gauge of the temperature, while the formula display shows you exactly how each conversion is calculated.',
        'Celsius is the most widely used temperature scale globally, defined by the freezing point (0 °C) and boiling point (100 °C) of water at standard atmospheric pressure. Fahrenheit remains common in the United States for weather, cooking, and everyday use. Kelvin is the SI base unit of temperature used in scientific and engineering contexts, starting from absolute zero. Rankine, used primarily in some American engineering fields, applies the Fahrenheit interval starting from absolute zero.',
        'The tool also includes a table of common reference points such as water boiling and freezing temperatures, normal human body temperature, typical room temperature, and absolute zero. These benchmarks help you quickly verify conversions and build intuition for each scale. Conversion history is saved locally so you can revisit past calculations without re-entering values.',
      ],
      faq: [
        { q: 'How do I convert Celsius to Fahrenheit?', a: 'Multiply the Celsius value by 9/5 and then add 32. For example, 25 °C = 25 × 9/5 + 32 = 77 °F. This converter does it automatically for all four scales at once.' },
        { q: 'What is absolute zero?', a: 'Absolute zero is the lowest theoretically possible temperature, where all molecular motion ceases. It equals 0 K, −273.15 °C, −459.67 °F, and 0 °R. No physical system can reach absolute zero exactly.' },
        { q: 'What is the difference between Kelvin and Rankine?', a: 'Both start at absolute zero, but Kelvin uses the Celsius degree interval (1 K = 1 °C difference) while Rankine uses the Fahrenheit interval (1 °R = 1 °F difference). Kelvin is the SI standard; Rankine is used in some US engineering applications.' },
        { q: 'Why does the United States still use Fahrenheit?', a: 'The Fahrenheit scale was widely adopted in English-speaking countries before the metric system became standard. While most countries switched to Celsius, the US retained Fahrenheit for everyday weather, cooking, and medical use due to cultural inertia and existing infrastructure.' },
        { q: 'Is this converter accurate for scientific work?', a: 'Yes. The converter uses the exact mathematical formulas defined by international standards. Results are displayed to up to 4 decimal places, which is sufficient for most scientific, engineering, and industrial applications.' },
      ],
    },
    it: {
      title: 'Convertitore di Temperatura: Celsius, Fahrenheit, Kelvin e Rankine',
      paragraphs: [
        'La conversione delle temperature è essenziale nella scienza, in cucina, nei viaggi e nella vita quotidiana. Che tu stia leggendo previsioni meteo in Celsius abituato al Fahrenheit, adattando le temperature del forno per una ricetta internazionale o eseguendo calcoli scientifici in Kelvin, un convertitore di temperatura affidabile ti fa risparmiare tempo e previene errori.',
        'Il nostro convertitore di temperatura online gratuito supporta quattro scale principali: Celsius, Fahrenheit, Kelvin e Rankine. Basta inserire un valore, scegliere la scala di partenza e vedere immediatamente l\'equivalente in tutte le altre scale. Il termometro visivo fornisce un indicatore intuitivo, mentre le formule mostrano esattamente come viene calcolata ogni conversione.',
        'Il Celsius è la scala di temperatura più utilizzata al mondo, definita dai punti di congelamento (0 °C) e di ebollizione (100 °C) dell\'acqua a pressione atmosferica standard. Il Fahrenheit resta comune negli Stati Uniti per meteo, cucina e uso quotidiano. Il Kelvin è l\'unità base SI di temperatura usata in contesti scientifici e ingegneristici, partendo dallo zero assoluto. Il Rankine, usato principalmente in alcuni campi ingegneristici americani, applica l\'intervallo Fahrenheit partendo dallo zero assoluto.',
        'Lo strumento include anche una tabella di punti di riferimento comuni come le temperature di ebollizione e congelamento dell\'acqua, la temperatura corporea umana, la temperatura ambiente tipica e lo zero assoluto. La cronologia delle conversioni viene salvata localmente così puoi rivedere i calcoli passati senza reinserire i valori.',
      ],
      faq: [
        { q: 'Come si converte Celsius in Fahrenheit?', a: 'Moltiplica il valore Celsius per 9/5 e poi aggiungi 32. Per esempio, 25 °C = 25 × 9/5 + 32 = 77 °F. Questo convertitore lo fa automaticamente per tutte e quattro le scale contemporaneamente.' },
        { q: 'Cos\'è lo zero assoluto?', a: 'Lo zero assoluto è la temperatura più bassa teoricamente possibile, dove tutto il movimento molecolare cessa. Equivale a 0 K, −273,15 °C, −459,67 °F e 0 °R. Nessun sistema fisico può raggiungere esattamente lo zero assoluto.' },
        { q: 'Qual è la differenza tra Kelvin e Rankine?', a: 'Entrambi partono dallo zero assoluto, ma il Kelvin usa l\'intervallo del grado Celsius (1 K = 1 °C di differenza) mentre il Rankine usa l\'intervallo Fahrenheit (1 °R = 1 °F di differenza). Il Kelvin è lo standard SI; il Rankine è usato in alcune applicazioni ingegneristiche americane.' },
        { q: 'Perché gli Stati Uniti usano ancora Fahrenheit?', a: 'La scala Fahrenheit era ampiamente adottata nei paesi anglofoni prima che il sistema metrico diventasse standard. Mentre la maggior parte dei paesi è passata al Celsius, gli USA hanno mantenuto il Fahrenheit per meteo, cucina e uso medico quotidiano per inerzia culturale.' },
        { q: 'Questo convertitore è accurato per il lavoro scientifico?', a: 'Sì. Il convertitore usa le formule matematiche esatte definite dagli standard internazionali. I risultati sono mostrati fino a 4 cifre decimali, sufficienti per la maggior parte delle applicazioni scientifiche, ingegneristiche e industriali.' },
      ],
    },
    es: {
      title: 'Convertidor de Temperatura: Celsius, Fahrenheit, Kelvin y Rankine',
      paragraphs: [
        'La conversión de temperatura es esencial en la ciencia, la cocina, los viajes y la vida diaria. Ya sea que estés leyendo un pronóstico del tiempo en Celsius cuando estás acostumbrado a Fahrenheit, ajustando temperaturas del horno para una receta internacional o realizando cálculos científicos en Kelvin, un convertidor de temperatura confiable ahorra tiempo y previene errores.',
        'Nuestro convertidor de temperatura online gratuito soporta cuatro escalas principales: Celsius, Fahrenheit, Kelvin y Rankine. Simplemente ingresa un valor de temperatura, elige tu escala de entrada y ve instantáneamente el equivalente en todas las demás escalas. El termómetro visual proporciona un indicador intuitivo, mientras que las fórmulas muestran exactamente cómo se calcula cada conversión.',
        'Celsius es la escala de temperatura más utilizada globalmente, definida por el punto de congelación (0 °C) y el punto de ebullición (100 °C) del agua a presión atmosférica estándar. Fahrenheit sigue siendo común en los Estados Unidos para el clima, la cocina y el uso diario. Kelvin es la unidad base del SI para la temperatura, usada en contextos científicos e ingenieriles, comenzando desde el cero absoluto. Rankine, usada principalmente en algunos campos de ingeniería estadounidenses, aplica el intervalo Fahrenheit desde el cero absoluto.',
        'La herramienta también incluye una tabla de puntos de referencia comunes como las temperaturas de ebullición y congelación del agua, la temperatura corporal humana normal, la temperatura ambiente típica y el cero absoluto. El historial de conversiones se guarda localmente para que puedas revisar cálculos anteriores sin volver a ingresar valores.',
      ],
      faq: [
        { q: '¿Cómo se convierte Celsius a Fahrenheit?', a: 'Multiplica el valor Celsius por 9/5 y luego suma 32. Por ejemplo, 25 °C = 25 × 9/5 + 32 = 77 °F. Este convertidor lo hace automáticamente para las cuatro escalas a la vez.' },
        { q: '¿Qué es el cero absoluto?', a: 'El cero absoluto es la temperatura más baja teóricamente posible, donde todo movimiento molecular cesa. Equivale a 0 K, −273,15 °C, −459,67 °F y 0 °R. Ningún sistema físico puede alcanzar exactamente el cero absoluto.' },
        { q: '¿Cuál es la diferencia entre Kelvin y Rankine?', a: 'Ambos comienzan en el cero absoluto, pero Kelvin usa el intervalo del grado Celsius (1 K = 1 °C de diferencia) mientras que Rankine usa el intervalo Fahrenheit (1 °R = 1 °F de diferencia). Kelvin es el estándar del SI; Rankine se usa en algunas aplicaciones de ingeniería estadounidenses.' },
        { q: '¿Por qué Estados Unidos todavía usa Fahrenheit?', a: 'La escala Fahrenheit fue ampliamente adoptada en países angloparlantes antes de que el sistema métrico se convirtiera en estándar. Mientras la mayoría de los países cambiaron a Celsius, EE.UU. mantuvo Fahrenheit para el clima, la cocina y el uso médico diario por inercia cultural.' },
        { q: '¿Este convertidor es preciso para trabajo científico?', a: 'Sí. El convertidor usa las fórmulas matemáticas exactas definidas por estándares internacionales. Los resultados se muestran con hasta 4 decimales, suficiente para la mayoría de las aplicaciones científicas, ingenieriles e industriales.' },
      ],
    },
    fr: {
      title: 'Convertisseur de Température : Celsius, Fahrenheit, Kelvin et Rankine',
      paragraphs: [
        'La conversion de température est essentielle en science, en cuisine, en voyage et dans la vie quotidienne. Que vous lisiez des prévisions météo en Celsius en étant habitué au Fahrenheit, que vous ajustiez les températures du four pour une recette internationale ou que vous effectuiez des calculs scientifiques en Kelvin, un convertisseur de température fiable fait gagner du temps et évite les erreurs.',
        'Notre convertisseur de température en ligne gratuit prend en charge quatre échelles principales : Celsius, Fahrenheit, Kelvin et Rankine. Entrez simplement une valeur de température, choisissez votre échelle d\'entrée et voyez instantanément l\'équivalent dans toutes les autres échelles. Le thermomètre visuel fournit un indicateur intuitif, tandis que les formules montrent exactement comment chaque conversion est calculée.',
        'Le Celsius est l\'échelle de température la plus utilisée dans le monde, définie par les points de congélation (0 °C) et d\'ébullition (100 °C) de l\'eau à pression atmosphérique standard. Le Fahrenheit reste courant aux États-Unis pour la météo, la cuisine et l\'usage quotidien. Le Kelvin est l\'unité de base du SI pour la température, utilisée en contexte scientifique et ingénierie, partant du zéro absolu. Le Rankine, utilisé principalement dans certains domaines d\'ingénierie américains, applique l\'intervalle Fahrenheit à partir du zéro absolu.',
        'L\'outil comprend également un tableau de points de référence courants comme les températures d\'ébullition et de congélation de l\'eau, la température corporelle humaine normale, la température ambiante typique et le zéro absolu. L\'historique des conversions est sauvegardé localement pour que vous puissiez revoir vos calculs passés sans ressaisir les valeurs.',
      ],
      faq: [
        { q: 'Comment convertir Celsius en Fahrenheit ?', a: 'Multipliez la valeur Celsius par 9/5 puis ajoutez 32. Par exemple, 25 °C = 25 × 9/5 + 32 = 77 °F. Ce convertisseur le fait automatiquement pour les quatre échelles à la fois.' },
        { q: 'Qu\'est-ce que le zéro absolu ?', a: 'Le zéro absolu est la température la plus basse théoriquement possible, où tout mouvement moléculaire cesse. Il équivaut à 0 K, −273,15 °C, −459,67 °F et 0 °R. Aucun système physique ne peut atteindre exactement le zéro absolu.' },
        { q: 'Quelle est la différence entre Kelvin et Rankine ?', a: 'Les deux commencent au zéro absolu, mais le Kelvin utilise l\'intervalle du degré Celsius (1 K = 1 °C de différence) tandis que le Rankine utilise l\'intervalle Fahrenheit (1 °R = 1 °F de différence). Le Kelvin est le standard SI ; le Rankine est utilisé dans certaines applications d\'ingénierie américaines.' },
        { q: 'Pourquoi les États-Unis utilisent-ils encore Fahrenheit ?', a: 'L\'échelle Fahrenheit était largement adoptée dans les pays anglophones avant que le système métrique ne devienne standard. Alors que la plupart des pays sont passés au Celsius, les USA ont conservé le Fahrenheit pour la météo, la cuisine et l\'usage médical quotidien par inertie culturelle.' },
        { q: 'Ce convertisseur est-il précis pour le travail scientifique ?', a: 'Oui. Le convertisseur utilise les formules mathématiques exactes définies par les normes internationales. Les résultats sont affichés avec jusqu\'à 4 décimales, ce qui est suffisant pour la plupart des applications scientifiques, d\'ingénierie et industrielles.' },
      ],
    },
    de: {
      title: 'Temperaturumrechner: Celsius, Fahrenheit, Kelvin & Rankine',
      paragraphs: [
        'Die Temperaturumrechnung ist in Wissenschaft, Kochen, Reisen und im Alltag unverzichtbar. Ob Sie einen Wetterbericht in Celsius lesen und an Fahrenheit gewöhnt sind, Ofentemperaturen für ein internationales Rezept anpassen oder wissenschaftliche Berechnungen in Kelvin durchführen — ein zuverlässiger Temperaturumrechner spart Zeit und verhindert Fehler.',
        'Unser kostenloser Online-Temperaturumrechner unterstützt vier Haupttemperaturskalen: Celsius, Fahrenheit, Kelvin und Rankine. Geben Sie einfach einen Temperaturwert ein, wählen Sie Ihre Eingabeskala und sehen Sie sofort das Äquivalent in allen anderen Skalen. Das visuelle Thermometer bietet eine intuitive Anzeige, während die Formelanzeige zeigt, wie jede Umrechnung berechnet wird.',
        'Celsius ist die weltweit am häufigsten verwendete Temperaturskala, definiert durch den Gefrierpunkt (0 °C) und Siedepunkt (100 °C) von Wasser bei Standardatmosphärendruck. Fahrenheit ist in den USA weiterhin für Wetter, Kochen und alltäglichen Gebrauch üblich. Kelvin ist die SI-Basiseinheit der Temperatur, die in wissenschaftlichen und technischen Kontexten verwendet wird und beim absoluten Nullpunkt beginnt. Rankine, hauptsächlich in einigen amerikanischen Ingenieurbereichen verwendet, wendet das Fahrenheit-Intervall ab dem absoluten Nullpunkt an.',
        'Das Tool enthält auch eine Tabelle häufiger Referenzpunkte wie Siede- und Gefriertemperaturen von Wasser, normale menschliche Körpertemperatur, typische Raumtemperatur und den absoluten Nullpunkt. Der Umrechnungsverlauf wird lokal gespeichert, damit Sie vergangene Berechnungen ohne erneute Eingabe überprüfen können.',
      ],
      faq: [
        { q: 'Wie rechnet man Celsius in Fahrenheit um?', a: 'Multiplizieren Sie den Celsius-Wert mit 9/5 und addieren Sie dann 32. Zum Beispiel: 25 °C = 25 × 9/5 + 32 = 77 °F. Dieser Umrechner macht es automatisch für alle vier Skalen gleichzeitig.' },
        { q: 'Was ist der absolute Nullpunkt?', a: 'Der absolute Nullpunkt ist die niedrigste theoretisch mögliche Temperatur, bei der alle Molekularbewegung aufhört. Er entspricht 0 K, −273,15 °C, −459,67 °F und 0 °R. Kein physikalisches System kann den absoluten Nullpunkt exakt erreichen.' },
        { q: 'Was ist der Unterschied zwischen Kelvin und Rankine?', a: 'Beide beginnen beim absoluten Nullpunkt, aber Kelvin verwendet das Celsius-Gradintervall (1 K = 1 °C Differenz), während Rankine das Fahrenheit-Intervall verwendet (1 °R = 1 °F Differenz). Kelvin ist der SI-Standard; Rankine wird in einigen US-Ingenieuranwendungen verwendet.' },
        { q: 'Warum verwenden die USA noch Fahrenheit?', a: 'Die Fahrenheit-Skala war in englischsprachigen Ländern weit verbreitet, bevor das metrische System Standard wurde. Während die meisten Länder auf Celsius umstellten, behielten die USA Fahrenheit für Wetter, Kochen und medizinischen Alltag aufgrund kultureller Trägheit bei.' },
        { q: 'Ist dieser Umrechner für wissenschaftliche Arbeit genau?', a: 'Ja. Der Umrechner verwendet die exakten mathematischen Formeln, die durch internationale Standards definiert sind. Die Ergebnisse werden mit bis zu 4 Dezimalstellen angezeigt, was für die meisten wissenschaftlichen, technischen und industriellen Anwendungen ausreichend ist.' },
      ],
    },
    pt: {
      title: 'Conversor de Temperatura: Celsius, Fahrenheit, Kelvin e Rankine',
      paragraphs: [
        'A conversão de temperatura é essencial na ciência, na cozinha, em viagens e no dia a dia. Seja lendo uma previsão do tempo em Celsius quando está acostumado com Fahrenheit, ajustando temperaturas do forno para uma receita internacional ou realizando cálculos científicos em Kelvin, um conversor de temperatura confiável economiza tempo e evita erros.',
        'Nosso conversor de temperatura online gratuito suporta quatro escalas principais: Celsius, Fahrenheit, Kelvin e Rankine. Basta inserir um valor de temperatura, escolher sua escala de entrada e ver instantaneamente o equivalente em todas as outras escalas. O termômetro visual fornece um indicador intuitivo, enquanto as fórmulas mostram exatamente como cada conversão é calculada.',
        'Celsius é a escala de temperatura mais utilizada globalmente, definida pelos pontos de congelamento (0 °C) e ebulição (100 °C) da água à pressão atmosférica padrão. Fahrenheit continua comum nos Estados Unidos para clima, cozinha e uso diário. Kelvin é a unidade base do SI para temperatura, usada em contextos científicos e de engenharia, começando do zero absoluto. Rankine, usada principalmente em alguns campos de engenharia americanos, aplica o intervalo Fahrenheit a partir do zero absoluto.',
        'A ferramenta também inclui uma tabela de pontos de referência comuns como temperaturas de ebulição e congelamento da água, temperatura corporal humana normal, temperatura ambiente típica e zero absoluto. O histórico de conversões é salvo localmente para que você possa revisar cálculos anteriores sem reinserir valores.',
      ],
      faq: [
        { q: 'Como converter Celsius para Fahrenheit?', a: 'Multiplique o valor Celsius por 9/5 e depois some 32. Por exemplo, 25 °C = 25 × 9/5 + 32 = 77 °F. Este conversor faz isso automaticamente para as quatro escalas de uma vez.' },
        { q: 'O que é o zero absoluto?', a: 'O zero absoluto é a temperatura mais baixa teoricamente possível, onde todo movimento molecular cessa. Equivale a 0 K, −273,15 °C, −459,67 °F e 0 °R. Nenhum sistema físico pode atingir exatamente o zero absoluto.' },
        { q: 'Qual é a diferença entre Kelvin e Rankine?', a: 'Ambos começam no zero absoluto, mas Kelvin usa o intervalo do grau Celsius (1 K = 1 °C de diferença) enquanto Rankine usa o intervalo Fahrenheit (1 °R = 1 °F de diferença). Kelvin é o padrão do SI; Rankine é usado em algumas aplicações de engenharia americanas.' },
        { q: 'Por que os Estados Unidos ainda usam Fahrenheit?', a: 'A escala Fahrenheit era amplamente adotada em países anglófonos antes do sistema métrico se tornar padrão. Enquanto a maioria dos países mudou para Celsius, os EUA mantiveram Fahrenheit para clima, cozinha e uso médico diário por inércia cultural.' },
        { q: 'Este conversor é preciso para trabalho científico?', a: 'Sim. O conversor usa as fórmulas matemáticas exatas definidas por padrões internacionais. Os resultados são exibidos com até 4 casas decimais, suficiente para a maioria das aplicações científicas, de engenharia e industriais.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="temperature-converter" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          {/* Input section */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{labels.fromUnit[lang]}</label>
              <div className="flex gap-2 mb-3">
                {units.map((u) => (
                  <button
                    key={u}
                    onClick={() => setFromUnit(u)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${u === fromUnit ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {unitLabels[u]} {unitNames[u][lang]}
                  </button>
                ))}
              </div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{labels.inputLabel[lang]}</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={addToHistory}
                placeholder="0"
                className={`w-full border rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 ${belowAbsoluteZero ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              />
              {belowAbsoluteZero && (
                <p className="text-sm text-red-600 font-medium mt-1">
                  {lang === 'en' ? 'Temperature cannot be below absolute zero' :
                   lang === 'it' ? 'La temperatura non può essere inferiore allo zero assoluto' :
                   lang === 'es' ? 'La temperatura no puede ser inferior al cero absoluto' :
                   lang === 'fr' ? 'La température ne peut pas être inférieure au zéro absolu' :
                   lang === 'de' ? 'Die Temperatur kann nicht unter dem absoluten Nullpunkt liegen' :
                   'A temperatura não pode ser inferior ao zero absoluto'}
                </p>
              )}
            </div>

            {/* Thermometer */}
            {isValid && !belowAbsoluteZero && (
              <div className="flex flex-col items-center">
                <Thermometer celsius={celsius} />
                <span className="text-xs text-gray-500 mt-1">{formatNum(celsius)} °C</span>
              </div>
            )}
          </div>

          {/* All conversions */}
          {isValid && !belowAbsoluteZero && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">{labels.allConversions[lang]}</h3>
              <div className="grid grid-cols-2 gap-3">
                {units.map((u) => (
                  <div
                    key={u}
                    className={`rounded-lg p-3 border ${u === fromUnit ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="text-xs text-gray-500 mb-1">{unitNames[u][lang]}</div>
                    <div className={`text-lg font-bold ${u === fromUnit ? 'text-blue-700' : 'text-gray-900'}`}>
                      {resultStrings[u]} {unitLabels[u]}
                    </div>
                    {u !== fromUnit && (
                      <div className="text-xs text-gray-400 mt-1">{getFormula(fromUnit, u)}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formula display */}
          {isValid && !belowAbsoluteZero && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-indigo-700 mb-2">{labels.formulas[lang]}</h3>
              <div className="space-y-1">
                {units.filter((u) => u !== fromUnit).map((u) => (
                  <div key={u} className="text-sm text-indigo-600 font-mono">
                    {getFormula(fromUnit, u)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopy}
              disabled={!isValid || belowAbsoluteZero}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {copied ? labels.copied[lang] : labels.copy[lang]}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              {labels.reset[lang]}
            </button>
          </div>
        </div>

        {/* Reference Points */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">{labels.referencePoints[lang]}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 text-gray-500 font-medium"></th>
                  {units.map((u) => (
                    <th key={u} className="text-right py-2 px-2 text-gray-500 font-medium">{unitLabels[u]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {referencePoints.map((point) => (
                  <tr key={point.key} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 pr-4 text-gray-700 font-medium">{labels[point.key][lang]}</td>
                    {units.map((u) => (
                      <td key={u} className="text-right py-2 px-2 text-gray-600 font-mono text-xs">
                        {point[u].toLocaleString(lang, { maximumFractionDigits: 2 })}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">{labels.history[lang]}</h3>
              <button
                onClick={() => saveHistory([])}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                {labels.clearHistory[lang]}
              </button>
            </div>
            <ul className="space-y-2">
              {history.map((entry, i) => (
                <li key={i} className="text-sm bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-gray-700 font-medium">
                    {entry.inputValue} {unitLabels[entry.fromUnit]}
                  </span>
                  <span className="text-gray-400 mx-2">=</span>
                  <span className="text-gray-600">
                    {units.filter((u) => u !== entry.fromUnit).map((u) => `${entry.results[u]} ${unitLabels[u]}`).join(' | ')}
                  </span>
                </li>
              ))}
            </ul>
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
