'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const categories: Record<string, { units: string[]; toBase: Record<string, number> }> = {
  length: {
    units: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'],
    toBase: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 },
  },
  weight: {
    units: ['mg', 'g', 'kg', 'lb', 'oz', 't'],
    toBase: { mg: 0.001, g: 1, kg: 1000, lb: 453.592, oz: 28.3495, t: 1000000 },
  },
  temperature: { units: ['°C', '°F', 'K'], toBase: {} },
  speed: {
    units: ['m/s', 'km/h', 'mph', 'knots'],
    toBase: { 'm/s': 1, 'km/h': 0.277778, mph: 0.44704, knots: 0.514444 },
  },
};

const catLabels: Record<string, Record<Locale, string>> = {
  length: { en: 'Length', it: 'Lunghezza', es: 'Longitud', fr: 'Longueur', de: 'Länge', pt: 'Comprimento' },
  weight: { en: 'Weight', it: 'Peso', es: 'Peso', fr: 'Poids', de: 'Gewicht', pt: 'Peso' },
  temperature: { en: 'Temperature', it: 'Temperatura', es: 'Temperatura', fr: 'Température', de: 'Temperatur', pt: 'Temperatura' },
  speed: { en: 'Speed', it: 'Velocità', es: 'Velocidad', fr: 'Vitesse', de: 'Geschwindigkeit', pt: 'Velocidade' },
};

const labels: Record<string, Record<Locale, string>> = {
  copy: { en: 'Copy Result', it: 'Copia Risultato', es: 'Copiar Resultado', fr: 'Copier le Résultat', de: 'Ergebnis Kopieren', pt: 'Copiar Resultado' },
  copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  reset: { en: 'Reset', it: 'Ripristina', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  swap: { en: 'Swap Units', it: 'Scambia Unità', es: 'Intercambiar Unidades', fr: 'Échanger les Unités', de: 'Einheiten Tauschen', pt: 'Trocar Unidades' },
  history: { en: 'Recent Conversions', it: 'Conversioni Recenti', es: 'Conversiones Recientes', fr: 'Conversions Récentes', de: 'Letzte Umrechnungen', pt: 'Conversões Recentes' },
  invalidValue: { en: 'Please enter a valid number', it: 'Inserisci un numero valido', es: 'Ingrese un número válido', fr: 'Veuillez entrer un nombre valide', de: 'Bitte geben Sie eine gültige Zahl ein', pt: 'Insira um número válido' },
  negativeWeight: { en: 'Weight cannot be negative', it: 'Il peso non può essere negativo', es: 'El peso no puede ser negativo', fr: 'Le poids ne peut pas être négatif', de: 'Gewicht kann nicht negativ sein', pt: 'O peso não pode ser negativo' },
  negativeLength: { en: 'Length cannot be negative', it: 'La lunghezza non può essere negativa', es: 'La longitud no puede ser negativa', fr: 'La longueur ne peut pas être négative', de: 'Länge kann nicht negativ sein', pt: 'O comprimento não pode ser negativo' },
  negativeSpeed: { en: 'Speed cannot be negative', it: 'La velocità non può essere negativa', es: 'La velocidad no puede ser negativa', fr: 'La vitesse ne peut pas être négative', de: 'Geschwindigkeit kann nicht negativ sein', pt: 'A velocidade não pode ser negativa' },
  from: { en: 'From', it: 'Da', es: 'De', fr: 'De', de: 'Von', pt: 'De' },
  to: { en: 'To', it: 'A', es: 'A', fr: 'À', de: 'Nach', pt: 'Para' },
  result: { en: 'Result', it: 'Risultato', es: 'Resultado', fr: 'Résultat', de: 'Ergebnis', pt: 'Resultado' },
  clearHistory: { en: 'Clear History', it: 'Cancella Cronologia', es: 'Borrar Historial', fr: 'Effacer l\'Historique', de: 'Verlauf Löschen', pt: 'Limpar Histórico' },
};

interface HistoryEntry {
  fromValue: string;
  fromUnit: string;
  toValue: string;
  toUnit: string;
  category: string;
}

function convertTemp(value: number, from: string, to: string): number {
  let celsius: number;
  if (from === '°C') celsius = value;
  else if (from === '°F') celsius = (value - 32) * 5 / 9;
  else celsius = value - 273.15;

  if (to === '°C') return celsius;
  if (to === '°F') return celsius * 9 / 5 + 32;
  return celsius + 273.15;
}

export default function UnitConverter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['unit-converter'][lang];

  const [cat, setCat] = useState('length');
  const [fromUnit, setFromUnit] = useState(categories.length.units[0]);
  const [toUnit, setToUnit] = useState(categories.length.units[2]);
  const [value, setValue] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const currentCat = categories[cat];
  const num = parseFloat(value);
  const isValidNumber = value !== '' && !isNaN(num);
  const isNegative = isValidNumber && num < 0;

  // Validation
  let errorMessage = '';
  if (value !== '' && !isValidNumber) {
    errorMessage = labels.invalidValue[lang];
  } else if (isNegative && cat === 'weight') {
    errorMessage = labels.negativeWeight[lang];
  } else if (isNegative && cat === 'length') {
    errorMessage = labels.negativeLength[lang];
  } else if (isNegative && cat === 'speed') {
    errorMessage = labels.negativeSpeed[lang];
  }

  const hasError = errorMessage !== '';

  let result = 0;
  if (isValidNumber && !hasError) {
    if (cat === 'temperature') {
      result = convertTemp(num, fromUnit, toUnit);
    } else {
      const baseValue = num * (currentCat.toBase[fromUnit] || 1);
      result = baseValue / (currentCat.toBase[toUnit] || 1);
    }
  }

  const resultString = isValidNumber && !hasError
    ? result.toLocaleString(lang, { maximumFractionDigits: 6 })
    : '0';

  const changeCat = (newCat: string) => {
    setCat(newCat);
    setFromUnit(categories[newCat].units[0]);
    setToUnit(categories[newCat].units[1]);
    setValue('');
  };

  const handleSwap = () => {
    const prevFrom = fromUnit;
    const prevTo = toUnit;
    setFromUnit(prevTo);
    setToUnit(prevFrom);
  };

  const handleReset = () => {
    setValue('');
    setFromUnit(currentCat.units[0]);
    setToUnit(currentCat.units[1]);
  };

  const handleCopy = async () => {
    if (!isValidNumber || hasError) return;
    const text = `${value} ${fromUnit} = ${resultString} ${toUnit}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const addToHistory = () => {
    if (!isValidNumber || hasError || !value) return;
    const entry: HistoryEntry = {
      fromValue: value,
      fromUnit,
      toValue: resultString,
      toUnit,
      category: cat,
    };
    setHistory((prev) => [entry, ...prev.slice(0, 4)]);
  };

  // Add to history on blur (when user finishes typing)
  const handleInputBlur = () => {
    addToHistory();
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Online Unit Converter: Length, Weight, Temperature & Speed',
      paragraphs: [
        'Converting between measurement units is one of the most common tasks in daily life, science, engineering, and cooking. Whether you need to convert miles to kilometers for a road trip, pounds to kilograms for a recipe, or Fahrenheit to Celsius for weather reports, our free online unit converter handles it all instantly.',
        'This tool supports four major categories of measurement: length (millimeters, centimeters, meters, kilometers, inches, feet, yards, miles), weight (milligrams, grams, kilograms, pounds, ounces, metric tons), temperature (Celsius, Fahrenheit, Kelvin), and speed (meters per second, kilometers per hour, miles per hour, knots). Each conversion uses precise conversion factors to ensure accuracy.',
        'Unlike many unit converters that only handle one category at a time, this tool lets you switch between length, weight, temperature, and speed conversions seamlessly. The real-time conversion display means you see results as you type, without needing to click a button. Temperature conversions use the correct mathematical formulas rather than simple multiplication factors, ensuring accurate results across the entire range.',
        'Professional engineers, students, travelers, and home cooks all benefit from having a reliable unit converter at their fingertips. Bookmark this page and use it whenever you need quick, accurate conversions between metric and imperial units or any other measurement systems. For specialized conversions, check out our <a href="/en/tools/temperature-converter" class="text-blue-600 underline">Temperature Converter</a>, <a href="/en/tools/cooking-converter" class="text-blue-600 underline">Cooking Converter</a>, and <a href="/en/tools/currency-converter" class="text-blue-600 underline">Currency Converter</a>.',
      ],
      faq: [
        { q: 'How do I convert Fahrenheit to Celsius?', a: 'Subtract 32 from the Fahrenheit value, then multiply by 5/9. For example, 72°F = (72-32) × 5/9 = 22.2°C. Our tool does this calculation automatically for you.' },
        { q: 'What is the difference between metric and imperial units?', a: 'Metric units (meters, grams, liters) are based on powers of 10 and used globally. Imperial units (feet, pounds, gallons) are primarily used in the US and UK. Metric is the standard in science worldwide.' },
        { q: 'How many kilometers are in a mile?', a: 'One mile equals approximately 1.60934 kilometers. Conversely, one kilometer is about 0.62137 miles. This conversion is essential for international travel and navigation.' },
        { q: 'Is this unit converter accurate for scientific calculations?', a: 'Yes, all conversion factors used are based on internationally recognized standards. The tool provides up to 6 decimal places of precision, suitable for most scientific and engineering applications.' },
        { q: 'What is the Kelvin temperature scale used for?', a: 'Kelvin is the SI base unit for temperature, used primarily in scientific contexts. It starts at absolute zero (0 K = -273.15°C), the lowest possible temperature. It is widely used in physics, chemistry, and astronomy.' },
      ],
    },
    it: {
      title: 'Convertitore di Unità Online: Lunghezza, Peso, Temperatura e Velocità',
      paragraphs: [
        'La conversione tra unità di misura è una delle operazioni più comuni nella vita quotidiana, nella scienza, nell\'ingegneria e in cucina. Che tu debba convertire miglia in chilometri per un viaggio, libbre in chilogrammi per una ricetta, o Fahrenheit in Celsius per le previsioni meteo, il nostro convertitore di unità online gratuito gestisce tutto istantaneamente.',
        'Questo strumento supporta quattro categorie principali di misurazione: lunghezza (millimetri, centimetri, metri, chilometri, pollici, piedi, iarde, miglia), peso (milligrammi, grammi, chilogrammi, libbre, once, tonnellate metriche), temperatura (Celsius, Fahrenheit, Kelvin) e velocità (metri al secondo, chilometri orari, miglia orarie, nodi). Ogni conversione utilizza fattori di conversione precisi per garantire l\'accuratezza.',
        'A differenza di molti convertitori che gestiscono solo una categoria alla volta, questo strumento ti permette di passare tra conversioni di lunghezza, peso, temperatura e velocità senza interruzioni. La visualizzazione in tempo reale significa che vedi i risultati mentre digiti, senza bisogno di cliccare un pulsante. Le conversioni di temperatura utilizzano le formule matematiche corrette anziché semplici fattori di moltiplicazione.',
        'Ingegneri professionisti, studenti, viaggiatori e cuochi casalinghi traggono tutti vantaggio dall\'avere un convertitore di unità affidabile a portata di mano. Aggiungi questa pagina ai preferiti e utilizzala ogni volta che hai bisogno di conversioni rapide e accurate tra unità metriche e imperiali. Per conversioni specializzate, scopri anche il nostro <a href="/it/tools/temperature-converter" class="text-blue-600 underline">Convertitore di Temperatura</a>, il <a href="/it/tools/cooking-converter" class="text-blue-600 underline">Convertitore da Cucina</a> e il <a href="/it/tools/currency-converter" class="text-blue-600 underline">Convertitore di Valuta</a>.',
      ],
      faq: [
        { q: 'Come si converte Fahrenheit in Celsius?', a: 'Sottrai 32 dal valore Fahrenheit, poi moltiplica per 5/9. Per esempio, 72°F = (72-32) × 5/9 = 22.2°C. Il nostro strumento esegue questo calcolo automaticamente.' },
        { q: 'Qual è la differenza tra unità metriche e imperiali?', a: 'Le unità metriche (metri, grammi, litri) si basano su potenze di 10 e sono usate globalmente. Le unità imperiali (piedi, libbre, galloni) sono usate principalmente negli USA e nel Regno Unito. Il sistema metrico è lo standard nella scienza mondiale.' },
        { q: 'Quanti chilometri ci sono in un miglio?', a: 'Un miglio equivale a circa 1,60934 chilometri. Al contrario, un chilometro equivale a circa 0,62137 miglia. Questa conversione è essenziale per i viaggi internazionali e la navigazione.' },
        { q: 'Questo convertitore è accurato per calcoli scientifici?', a: 'Sì, tutti i fattori di conversione utilizzati sono basati su standard riconosciuti internazionalmente. Lo strumento fornisce fino a 6 cifre decimali di precisione, adatte alla maggior parte delle applicazioni scientifiche e ingegneristiche.' },
        { q: 'A cosa serve la scala Kelvin?', a: 'Il Kelvin è l\'unità base SI per la temperatura, usata principalmente in contesti scientifici. Parte dallo zero assoluto (0 K = -273,15°C), la temperatura più bassa possibile. È ampiamente usato in fisica, chimica e astronomia.' },
      ],
    },
    es: {
      title: 'Convertidor de Unidades Online: Longitud, Peso, Temperatura y Velocidad',
      paragraphs: [
        'La conversión entre unidades de medida es una de las tareas más comunes en la vida diaria, la ciencia, la ingeniería y la cocina. Ya sea que necesites convertir millas a kilómetros para un viaje, libras a kilogramos para una receta, o Fahrenheit a Celsius para informes meteorológicos, nuestro convertidor de unidades online gratuito lo maneja todo al instante.',
        'Esta herramienta soporta cuatro categorías principales de medición: longitud (milímetros, centímetros, metros, kilómetros, pulgadas, pies, yardas, millas), peso (miligramos, gramos, kilogramos, libras, onzas, toneladas métricas), temperatura (Celsius, Fahrenheit, Kelvin) y velocidad (metros por segundo, kilómetros por hora, millas por hora, nudos). Cada conversión utiliza factores de conversión precisos.',
        'A diferencia de muchos convertidores que solo manejan una categoría a la vez, esta herramienta te permite cambiar entre conversiones de longitud, peso, temperatura y velocidad sin problemas. La conversión en tiempo real significa que ves los resultados mientras escribes, sin necesidad de hacer clic en un botón.',
        'Ingenieros profesionales, estudiantes, viajeros y cocineros caseros se benefician de tener un convertidor de unidades confiable al alcance de la mano. Marca esta página y úsala cuando necesites conversiones rápidas y precisas entre sistemas métrico e imperial. Para conversiones especializadas, consulta también nuestro <a href="/es/tools/temperature-converter" class="text-blue-600 underline">Convertidor de Temperatura</a>, el <a href="/es/tools/cooking-converter" class="text-blue-600 underline">Convertidor de Cocina</a> y el <a href="/es/tools/currency-converter" class="text-blue-600 underline">Convertidor de Moneda</a>.',
      ],
      faq: [
        { q: '¿Cómo se convierte Fahrenheit a Celsius?', a: 'Resta 32 del valor Fahrenheit, luego multiplica por 5/9. Por ejemplo, 72°F = (72-32) × 5/9 = 22.2°C. Nuestra herramienta realiza este cálculo automáticamente.' },
        { q: '¿Cuál es la diferencia entre unidades métricas e imperiales?', a: 'Las unidades métricas (metros, gramos, litros) se basan en potencias de 10 y se usan globalmente. Las unidades imperiales (pies, libras, galones) se usan principalmente en EE.UU. y Reino Unido.' },
        { q: '¿Cuántos kilómetros hay en una milla?', a: 'Una milla equivale a aproximadamente 1,60934 kilómetros. A la inversa, un kilómetro son aproximadamente 0,62137 millas. Esta conversión es esencial para viajes internacionales.' },
        { q: '¿Este convertidor es preciso para cálculos científicos?', a: 'Sí, todos los factores de conversión están basados en estándares reconocidos internacionalmente. La herramienta proporciona hasta 6 decimales de precisión.' },
        { q: '¿Para qué se usa la escala Kelvin?', a: 'El Kelvin es la unidad base del SI para la temperatura, usada principalmente en contextos científicos. Comienza en el cero absoluto (0 K = -273,15°C), la temperatura más baja posible.' },
      ],
    },
    fr: {
      title: 'Convertisseur d\'Unités en Ligne : Longueur, Poids, Température et Vitesse',
      paragraphs: [
        'La conversion entre unités de mesure est l\'une des tâches les plus courantes dans la vie quotidienne, les sciences, l\'ingénierie et la cuisine. Que vous ayez besoin de convertir des miles en kilomètres pour un voyage, des livres en kilogrammes pour une recette, ou des Fahrenheit en Celsius pour la météo, notre convertisseur d\'unités en ligne gratuit gère tout instantanément.',
        'Cet outil prend en charge quatre catégories principales de mesure : longueur (millimètres, centimètres, mètres, kilomètres, pouces, pieds, yards, miles), poids (milligrammes, grammes, kilogrammes, livres, onces, tonnes métriques), température (Celsius, Fahrenheit, Kelvin) et vitesse (mètres par seconde, kilomètres par heure, miles par heure, nœuds).',
        'Contrairement à de nombreux convertisseurs qui ne gèrent qu\'une catégorie à la fois, cet outil vous permet de passer d\'une conversion de longueur, poids, température ou vitesse à une autre de manière fluide. L\'affichage en temps réel signifie que vous voyez les résultats au fur et à mesure que vous tapez.',
        'Les ingénieurs professionnels, les étudiants, les voyageurs et les cuisiniers amateurs bénéficient tous d\'un convertisseur d\'unités fiable à portée de main. Ajoutez cette page à vos favoris pour des conversions rapides et précises. Pour des conversions spécialisées, découvrez aussi notre <a href="/fr/tools/temperature-converter" class="text-blue-600 underline">Convertisseur de Température</a>, le <a href="/fr/tools/cooking-converter" class="text-blue-600 underline">Convertisseur de Cuisine</a> et le <a href="/fr/tools/currency-converter" class="text-blue-600 underline">Convertisseur de Devises</a>.',
      ],
      faq: [
        { q: 'Comment convertir Fahrenheit en Celsius ?', a: 'Soustrayez 32 de la valeur Fahrenheit, puis multipliez par 5/9. Par exemple, 72°F = (72-32) × 5/9 = 22,2°C. Notre outil effectue ce calcul automatiquement.' },
        { q: 'Quelle est la différence entre les unités métriques et impériales ?', a: 'Les unités métriques (mètres, grammes, litres) sont basées sur des puissances de 10 et utilisées mondialement. Les unités impériales (pieds, livres, gallons) sont principalement utilisées aux États-Unis et au Royaume-Uni.' },
        { q: 'Combien de kilomètres dans un mile ?', a: 'Un mile équivaut à environ 1,60934 kilomètres. Inversement, un kilomètre représente environ 0,62137 miles. Cette conversion est essentielle pour les voyages internationaux.' },
        { q: 'Ce convertisseur est-il précis pour les calculs scientifiques ?', a: 'Oui, tous les facteurs de conversion utilisés sont basés sur des normes internationalement reconnues. L\'outil fournit jusqu\'à 6 décimales de précision.' },
        { q: 'À quoi sert l\'échelle Kelvin ?', a: 'Le Kelvin est l\'unité de base du SI pour la température, utilisée principalement en contexte scientifique. Elle commence au zéro absolu (0 K = -273,15°C), la température la plus basse possible.' },
      ],
    },
    de: {
      title: 'Online-Einheitenumrechner: Länge, Gewicht, Temperatur & Geschwindigkeit',
      paragraphs: [
        'Die Umrechnung zwischen Maßeinheiten ist eine der häufigsten Aufgaben im Alltag, in der Wissenschaft, im Ingenieurwesen und beim Kochen. Ob Sie Meilen in Kilometer für eine Reise, Pfund in Kilogramm für ein Rezept oder Fahrenheit in Celsius für Wetterberichte umrechnen müssen – unser kostenloser Online-Einheitenumrechner erledigt alles sofort.',
        'Dieses Tool unterstützt vier Hauptkategorien von Messungen: Länge (Millimeter, Zentimeter, Meter, Kilometer, Zoll, Fuß, Yards, Meilen), Gewicht (Milligramm, Gramm, Kilogramm, Pfund, Unzen, metrische Tonnen), Temperatur (Celsius, Fahrenheit, Kelvin) und Geschwindigkeit (Meter pro Sekunde, Kilometer pro Stunde, Meilen pro Stunde, Knoten).',
        'Im Gegensatz zu vielen Umrechnern, die nur eine Kategorie gleichzeitig handhaben, können Sie mit diesem Tool nahtlos zwischen Längen-, Gewichts-, Temperatur- und Geschwindigkeitsumrechnungen wechseln. Die Echtzeit-Anzeige zeigt Ergebnisse während der Eingabe, ohne dass ein Button geklickt werden muss.',
        'Professionelle Ingenieure, Studenten, Reisende und Hobbyköche profitieren alle von einem zuverlässigen Einheitenumrechner. Setzen Sie ein Lesezeichen für diese Seite und nutzen Sie sie für schnelle, genaue Umrechnungen. Für spezialisierte Umrechnungen entdecken Sie auch unseren <a href="/de/tools/temperature-converter" class="text-blue-600 underline">Temperaturumrechner</a>, den <a href="/de/tools/cooking-converter" class="text-blue-600 underline">Kochumrechner</a> und den <a href="/de/tools/currency-converter" class="text-blue-600 underline">Währungsumrechner</a>.',
      ],
      faq: [
        { q: 'Wie rechnet man Fahrenheit in Celsius um?', a: 'Ziehen Sie 32 vom Fahrenheit-Wert ab und multiplizieren Sie mit 5/9. Zum Beispiel: 72°F = (72-32) × 5/9 = 22,2°C. Unser Tool führt diese Berechnung automatisch durch.' },
        { q: 'Was ist der Unterschied zwischen metrischen und imperialen Einheiten?', a: 'Metrische Einheiten (Meter, Gramm, Liter) basieren auf Zehnerpotenzen und werden weltweit verwendet. Imperiale Einheiten (Fuß, Pfund, Gallonen) werden hauptsächlich in den USA und Großbritannien verwendet.' },
        { q: 'Wie viele Kilometer sind eine Meile?', a: 'Eine Meile entspricht etwa 1,60934 Kilometern. Umgekehrt entspricht ein Kilometer etwa 0,62137 Meilen. Diese Umrechnung ist für internationale Reisen und Navigation unerlässlich.' },
        { q: 'Ist dieser Umrechner für wissenschaftliche Berechnungen genau?', a: 'Ja, alle verwendeten Umrechnungsfaktoren basieren auf international anerkannten Standards. Das Tool bietet bis zu 6 Dezimalstellen Genauigkeit.' },
        { q: 'Wofür wird die Kelvin-Skala verwendet?', a: 'Kelvin ist die SI-Basiseinheit für Temperatur und wird hauptsächlich in wissenschaftlichen Kontexten verwendet. Sie beginnt beim absoluten Nullpunkt (0 K = -273,15°C), der niedrigstmöglichen Temperatur.' },
      ],
    },
    pt: {
      title: 'Conversor de Unidades Online: Comprimento, Peso, Temperatura e Velocidade',
      paragraphs: [
        'A conversão entre unidades de medida é uma das tarefas mais comuns na vida diária, na ciência, na engenharia e na cozinha. Seja para converter milhas em quilômetros para uma viagem, libras em quilogramas para uma receita, ou Fahrenheit em Celsius para previsões do tempo, nosso conversor de unidades online gratuito resolve tudo instantaneamente.',
        'Esta ferramenta suporta quatro categorias principais de medição: comprimento (milímetros, centímetros, metros, quilômetros, polegadas, pés, jardas, milhas), peso (miligramas, gramas, quilogramas, libras, onças, toneladas métricas), temperatura (Celsius, Fahrenheit, Kelvin) e velocidade (metros por segundo, quilômetros por hora, milhas por hora, nós).',
        'Ao contrário de muitos conversores que lidam com apenas uma categoria por vez, esta ferramenta permite alternar entre conversões de comprimento, peso, temperatura e velocidade de forma contínua. A conversão em tempo real significa que você vê os resultados enquanto digita, sem precisar clicar em um botão.',
        'Engenheiros profissionais, estudantes, viajantes e cozinheiros caseiros se beneficiam de ter um conversor de unidades confiável ao alcance das mãos. Salve esta página nos favoritos e use-a sempre que precisar de conversões rápidas e precisas. Para conversões especializadas, confira também nosso <a href="/pt/tools/temperature-converter" class="text-blue-600 underline">Conversor de Temperatura</a>, o <a href="/pt/tools/cooking-converter" class="text-blue-600 underline">Conversor de Cozinha</a> e o <a href="/pt/tools/currency-converter" class="text-blue-600 underline">Conversor de Moeda</a>.',
      ],
      faq: [
        { q: 'Como converter Fahrenheit para Celsius?', a: 'Subtraia 32 do valor Fahrenheit e multiplique por 5/9. Por exemplo, 72°F = (72-32) × 5/9 = 22,2°C. Nossa ferramenta faz esse cálculo automaticamente.' },
        { q: 'Qual é a diferença entre unidades métricas e imperiais?', a: 'Unidades métricas (metros, gramas, litros) são baseadas em potências de 10 e usadas globalmente. Unidades imperiais (pés, libras, galões) são usadas principalmente nos EUA e Reino Unido.' },
        { q: 'Quantos quilômetros tem uma milha?', a: 'Uma milha equivale a aproximadamente 1,60934 quilômetros. Inversamente, um quilômetro equivale a cerca de 0,62137 milhas. Essa conversão é essencial para viagens internacionais.' },
        { q: 'Este conversor é preciso para cálculos científicos?', a: 'Sim, todos os fatores de conversão são baseados em padrões reconhecidos internacionalmente. A ferramenta fornece até 6 casas decimais de precisão.' },
        { q: 'Para que serve a escala Kelvin?', a: 'O Kelvin é a unidade base do SI para temperatura, usada principalmente em contextos científicos. Começa no zero absoluto (0 K = -273,15°C), a temperatura mais baixa possível.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="unit-converter" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {Object.keys(categories).map((c) => (
              <button key={c} onClick={() => changeCat(c)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${c === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {catLabels[c]?.[lang] || c}
              </button>
            ))}
          </div>

          {/* Conversion area */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{labels.from[lang]}</label>
              <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2">
                {currentCat.units.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleInputBlur}
                placeholder="0"
                className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              />
            </div>

            {/* Swap button */}
            <div className="flex items-center justify-center pb-1">
              <button
                onClick={handleSwap}
                title={labels.swap[lang]}
                className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 transition-colors"
                aria-label={labels.swap[lang]}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{labels.to[lang]}</label>
              <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2">
                {currentCat.units.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
              <div className="w-full border border-gray-200 bg-blue-50 rounded-lg px-4 py-2 text-lg font-semibold text-blue-700">
                {resultString}
              </div>
            </div>
          </div>

          {/* Validation error */}
          {hasError && (
            <p className="text-sm text-red-600 font-medium">{errorMessage}</p>
          )}

          {/* Result card */}
          {isValidNumber && !hasError && value !== '' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700 font-medium">{labels.result[lang]}</p>
              <p className="text-xl font-bold text-green-800 mt-1">
                {value} {fromUnit} = {resultString} {toUnit}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopy}
              disabled={!isValidNumber || hasError}
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

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">{labels.history[lang]}</h3>
              <button
                onClick={() => setHistory([])}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                {labels.clearHistory[lang]}
              </button>
            </div>
            <ul className="space-y-2">
              {history.map((entry, i) => (
                <li key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-gray-700">
                    {entry.fromValue} {entry.fromUnit} = {entry.toValue} {entry.toUnit}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">{catLabels[entry.category]?.[lang]}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: p }} />)}
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
