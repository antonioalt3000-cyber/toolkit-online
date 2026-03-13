'use client';
import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type Mode = 'dec2rom' | 'rom2dec';

interface HistoryItem {
  input: string;
  output: string;
  mode: Mode;
}

const ROMAN_MAP: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
  [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

const REFERENCE_TABLE: [string, number][] = [
  ['I', 1], ['IV', 4], ['V', 5], ['IX', 9], ['X', 10],
  ['XL', 40], ['L', 50], ['XC', 90], ['C', 100],
  ['CD', 400], ['D', 500], ['CM', 900], ['M', 1000],
];

function decimalToRoman(num: number): string | null {
  if (num < 1 || num > 3999 || !Number.isInteger(num)) return null;
  let result = '';
  let remaining = num;
  for (const [value, symbol] of ROMAN_MAP) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }
  return result;
}

function romanToDecimal(roman: string): number | null {
  const s = roman.toUpperCase().trim();
  if (!s || !/^[IVXLCDM]+$/.test(s)) return null;
  const values: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const current = values[s[i]];
    const next = i + 1 < s.length ? values[s[i + 1]] : 0;
    if (current < next) {
      total -= current;
    } else {
      total += current;
    }
  }
  if (total < 1 || total > 3999) return null;
  // Validate by converting back
  const backToRoman = decimalToRoman(total);
  if (backToRoman !== s) return null;
  return total;
}

export default function RomanNumeralConverter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['roman-numeral-converter'][lang];

  const [mode, setMode] = useState<Mode>('dec2rom');
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copiedResult, setCopiedResult] = useState(false);
  const [copiedHistory, setCopiedHistory] = useState<number | null>(null);

  const labels: Record<string, Record<Locale, string>> = {
    decToRom: { en: 'Decimal → Roman', it: 'Decimale → Romano', es: 'Decimal → Romano', fr: 'Décimal → Romain', de: 'Dezimal → Römisch', pt: 'Decimal → Romano' },
    romToDec: { en: 'Roman → Decimal', it: 'Romano → Decimale', es: 'Romano → Decimal', fr: 'Romain → Décimal', de: 'Römisch → Dezimal', pt: 'Romano → Decimal' },
    mode: { en: 'Conversion Mode', it: 'Modalità Conversione', es: 'Modo de Conversión', fr: 'Mode de Conversion', de: 'Konvertierungsmodus', pt: 'Modo de Conversão' },
    inputDecimal: { en: 'Enter a number (1-3999)', it: 'Inserisci un numero (1-3999)', es: 'Ingresa un número (1-3999)', fr: 'Entrez un nombre (1-3999)', de: 'Geben Sie eine Zahl ein (1-3999)', pt: 'Insira um número (1-3999)' },
    inputRoman: { en: 'Enter Roman numeral', it: 'Inserisci numero romano', es: 'Ingresa número romano', fr: 'Entrez un chiffre romain', de: 'Geben Sie eine römische Zahl ein', pt: 'Insira número romano' },
    result: { en: 'Result', it: 'Risultato', es: 'Resultado', fr: 'Résultat', de: 'Ergebnis', pt: 'Resultado' },
    convert: { en: 'Convert', it: 'Converti', es: 'Convertir', fr: 'Convertir', de: 'Konvertieren', pt: 'Converter' },
    reset: { en: 'Reset', it: 'Ripristina', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
    copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
    copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
    history: { en: 'History', it: 'Cronologia', es: 'Historial', fr: 'Historique', de: 'Verlauf', pt: 'Histórico' },
    clearHistory: { en: 'Clear History', it: 'Cancella Cronologia', es: 'Borrar Historial', fr: 'Effacer l\'Historique', de: 'Verlauf Löschen', pt: 'Limpar Histórico' },
    referenceTable: { en: 'Reference Table', it: 'Tabella di Riferimento', es: 'Tabla de Referencia', fr: 'Table de Référence', de: 'Referenztabelle', pt: 'Tabela de Referência' },
    symbol: { en: 'Symbol', it: 'Simbolo', es: 'Símbolo', fr: 'Symbole', de: 'Symbol', pt: 'Símbolo' },
    value: { en: 'Value', it: 'Valore', es: 'Valor', fr: 'Valeur', de: 'Wert', pt: 'Valor' },
    invalidDecimal: { en: 'Please enter a valid integer between 1 and 3999', it: 'Inserisci un numero intero valido tra 1 e 3999', es: 'Ingresa un entero válido entre 1 y 3999', fr: 'Entrez un entier valide entre 1 et 3999', de: 'Geben Sie eine gültige Ganzzahl zwischen 1 und 3999 ein', pt: 'Insira um inteiro válido entre 1 e 3999' },
    invalidRoman: { en: 'Please enter a valid Roman numeral (I, V, X, L, C, D, M)', it: 'Inserisci un numero romano valido (I, V, X, L, C, D, M)', es: 'Ingresa un número romano válido (I, V, X, L, C, D, M)', fr: 'Entrez un chiffre romain valide (I, V, X, L, C, D, M)', de: 'Geben Sie eine gültige römische Zahl ein (I, V, X, L, C, D, M)', pt: 'Insira um número romano válido (I, V, X, L, C, D, M)' },
    noResult: { en: 'Enter a value and click Convert', it: 'Inserisci un valore e clicca Converti', es: 'Ingresa un valor y haz clic en Convertir', fr: 'Entrez une valeur et cliquez sur Convertir', de: 'Geben Sie einen Wert ein und klicken Sie auf Konvertieren', pt: 'Insira um valor e clique em Converter' },
  };

  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = useCallback(() => {
    setError(null);
    setResult(null);
    setCopiedResult(false);

    if (!input.trim()) return;

    if (mode === 'dec2rom') {
      const num = parseInt(input.trim(), 10);
      if (isNaN(num) || num < 1 || num > 3999 || !Number.isInteger(Number(input.trim()))) {
        setError(labels.invalidDecimal[lang]);
        return;
      }
      const roman = decimalToRoman(num);
      if (roman) {
        setResult(roman);
        setHistory(prev => [{ input: input.trim(), output: roman, mode }, ...prev].slice(0, 10));
      }
    } else {
      const dec = romanToDecimal(input.trim());
      if (dec === null) {
        setError(labels.invalidRoman[lang]);
        return;
      }
      const output = dec.toString();
      setResult(output);
      setHistory(prev => [{ input: input.trim().toUpperCase(), output, mode }, ...prev].slice(0, 10));
    }
  }, [input, mode, lang, labels.invalidDecimal, labels.invalidRoman]);

  const handleReset = () => {
    setInput('');
    setResult(null);
    setError(null);
    setCopiedResult(false);
  };

  const copyToClipboard = (text: string, type: 'result' | number) => {
    navigator.clipboard.writeText(text);
    if (type === 'result') {
      setCopiedResult(true);
      setTimeout(() => setCopiedResult(false), 1500);
    } else {
      setCopiedHistory(type);
      setTimeout(() => setCopiedHistory(null), 1500);
    }
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Roman Numeral Converter – Convert Between Roman and Decimal Numbers',
      paragraphs: [
        'Roman numerals are an ancient numeral system that originated in Rome and remained the dominant way of writing numbers throughout Europe for nearly two thousand years. Even today, Roman numerals appear on clock faces, in book chapters, on building cornerstones, in movie credits, for Super Bowl numbering, and in formal outlines. Understanding how to read and write Roman numerals is both a practical skill and a connection to centuries of cultural heritage.',
        'The Roman numeral system uses seven basic symbols: I (1), V (5), X (10), L (50), C (100), D (500), and M (1000). Numbers are formed by combining these symbols according to specific rules. When a smaller value appears before a larger one, it is subtracted (e.g., IV = 4, IX = 9, XL = 40, XC = 90, CD = 400, CM = 900). Otherwise, values are added together from left to right. This subtractive notation keeps numerals concise and unambiguous.',
        'Our Roman numeral converter supports bidirectional conversion between decimal numbers (1 through 3999) and their Roman numeral equivalents. The tool validates your input in real time, ensuring that only properly formed Roman numerals or integers within the valid range are accepted. A built-in reference table displays all standard values and subtractive combinations, making it easy to learn the system as you use it.',
        'Whether you are a student studying ancient history, a designer working on a formal document, a developer needing quick conversions, or simply curious about how Roman numerals work, this free online converter provides instant, accurate results. The conversion history lets you review past calculations, and one-click copying makes it easy to paste results wherever you need them.',
      ],
      faq: [
        { q: 'What is the largest number you can write in Roman numerals?', a: 'Using standard Roman numeral notation (without special extensions like the vinculum or overline), the largest number is 3999, written as MMMCMXCIX. Numbers 4000 and above historically required additional notation conventions that are not part of the basic seven-symbol system.' },
        { q: 'Why is 4 written as IV instead of IIII?', a: 'The subtractive rule in Roman numerals places a smaller value before a larger one to indicate subtraction. IV means 5 minus 1, which equals 4. This keeps numerals shorter and easier to read. However, some clock faces do use IIII for stylistic reasons, sometimes called the "watchmaker\'s four."' },
        { q: 'How do you convert a Roman numeral to a decimal number?', a: 'Read the numeral from left to right. If a symbol has a smaller value than the one following it, subtract it; otherwise, add it. For example, MCMXLIV: M=1000, CM=900, XL=40, IV=4, giving 1000+900+40+4 = 1944.' },
        { q: 'Are Roman numerals still used today?', a: 'Yes, Roman numerals are widely used in formal contexts. They appear on clock faces, in outlines and numbered lists, for copyright years in film and television, for naming monarchs and popes (e.g., Queen Elizabeth II), for Super Bowl numbering, and on building cornerstones and monuments.' },
        { q: 'Can Roman numerals represent zero or negative numbers?', a: 'No. The Roman numeral system was developed before the concept of zero was introduced to European mathematics. There is no symbol for zero and no way to represent negative numbers in the traditional Roman system. The smallest representable value is 1 (I).' },
      ],
    },
    it: {
      title: 'Convertitore Numeri Romani Gratuito – Converti tra Numeri Romani e Decimali',
      paragraphs: [
        'I numeri romani sono un antico sistema numerico nato a Roma che è rimasto il modo dominante di scrivere i numeri in tutta Europa per quasi duemila anni. Ancora oggi i numeri romani appaiono sui quadranti degli orologi, nei capitoli dei libri, sulle pietre angolari degli edifici, nei crediti cinematografici e nelle scalette formali. Sapere leggere e scrivere i numeri romani è sia un\'abilità pratica sia un legame con secoli di patrimonio culturale.',
        'Il sistema numerico romano utilizza sette simboli base: I (1), V (5), X (10), L (50), C (100), D (500) e M (1000). I numeri si formano combinando questi simboli secondo regole precise. Quando un valore minore precede uno maggiore, viene sottratto (es. IV = 4, IX = 9, XL = 40, XC = 90, CD = 400, CM = 900). Altrimenti, i valori si sommano da sinistra a destra. Questa notazione sottrattiva mantiene i numeri concisi e non ambigui.',
        'Il nostro convertitore di numeri romani supporta la conversione bidirezionale tra numeri decimali (da 1 a 3999) e i loro equivalenti romani. Lo strumento valida l\'input in tempo reale, assicurando che vengano accettati solo numeri romani ben formati o interi nell\'intervallo valido. Una tabella di riferimento integrata mostra tutti i valori standard e le combinazioni sottrattive.',
        'Che tu sia uno studente di storia antica, un designer che lavora su documenti formali, uno sviluppatore che necessita di conversioni rapide, o semplicemente curioso del funzionamento dei numeri romani, questo convertitore online gratuito fornisce risultati istantanei e accurati. La cronologia delle conversioni permette di rivedere i calcoli passati e la copia con un clic rende facile incollare i risultati dove servono.',
      ],
      faq: [
        { q: 'Qual è il numero più grande scrivibile in numeri romani?', a: 'Usando la notazione standard dei numeri romani (senza estensioni speciali), il numero più grande è 3999, scritto come MMMCMXCIX. I numeri da 4000 in su richiedevano storicamente convenzioni di notazione aggiuntive non incluse nel sistema base a sette simboli.' },
        { q: 'Perché 4 si scrive IV invece di IIII?', a: 'La regola sottrattiva nei numeri romani pone un valore minore prima di uno maggiore per indicare la sottrazione. IV significa 5 meno 1, cioè 4. Questo mantiene i numeri più corti e leggibili. Tuttavia, alcuni quadranti di orologio usano IIII per ragioni stilistiche.' },
        { q: 'Come si converte un numero romano in decimale?', a: 'Leggi il numero da sinistra a destra. Se un simbolo ha un valore minore di quello successivo, sottrailo; altrimenti, sommalo. Esempio: MCMXLIV: M=1000, CM=900, XL=40, IV=4, dando 1000+900+40+4 = 1944.' },
        { q: 'I numeri romani sono ancora usati oggi?', a: 'Sì, i numeri romani sono ampiamente usati in contesti formali: quadranti di orologi, scalette numerate, anni di copyright in film e TV, nomi di monarchi e papi (es. Elisabetta II), pietre angolari di edifici e monumenti.' },
        { q: 'I numeri romani possono rappresentare lo zero o numeri negativi?', a: 'No. Il sistema dei numeri romani fu sviluppato prima che il concetto di zero fosse introdotto nella matematica europea. Non esiste un simbolo per lo zero né un modo per rappresentare numeri negativi. Il valore minimo rappresentabile è 1 (I).' },
      ],
    },
    es: {
      title: 'Conversor de Números Romanos Gratis – Convierte entre Números Romanos y Decimales',
      paragraphs: [
        'Los números romanos son un antiguo sistema numérico originado en Roma que se mantuvo como la forma dominante de escribir números en toda Europa durante casi dos mil años. Aún hoy, los números romanos aparecen en esferas de relojes, capítulos de libros, piedras angulares de edificios, créditos de películas y esquemas formales. Saber leer y escribir números romanos es tanto una habilidad práctica como una conexión con siglos de patrimonio cultural.',
        'El sistema de numeración romana utiliza siete símbolos básicos: I (1), V (5), X (10), L (50), C (100), D (500) y M (1000). Los números se forman combinando estos símbolos según reglas específicas. Cuando un valor menor aparece antes de uno mayor, se resta (ej. IV = 4, IX = 9, XL = 40, XC = 90, CD = 400, CM = 900). De lo contrario, los valores se suman de izquierda a derecha. Esta notación sustractiva mantiene los numerales concisos e inequívocos.',
        'Nuestro conversor de números romanos soporta conversión bidireccional entre números decimales (1 a 3999) y sus equivalentes romanos. La herramienta valida tu entrada en tiempo real, asegurando que solo se acepten números romanos bien formados o enteros dentro del rango válido. Una tabla de referencia integrada muestra todos los valores estándar y combinaciones sustractivas.',
        'Ya seas un estudiante de historia antigua, un diseñador trabajando en documentos formales, un desarrollador que necesita conversiones rápidas, o simplemente tengas curiosidad por cómo funcionan los números romanos, este conversor en línea gratuito proporciona resultados instantáneos y precisos. El historial de conversiones permite revisar cálculos pasados y la copia con un clic facilita pegar resultados donde los necesites.',
      ],
      faq: [
        { q: '¿Cuál es el número más grande que se puede escribir en números romanos?', a: 'Usando la notación estándar de números romanos (sin extensiones especiales), el número más grande es 3999, escrito como MMMCMXCIX. Los números a partir de 4000 requerían históricamente convenciones de notación adicionales no incluidas en el sistema básico de siete símbolos.' },
        { q: '¿Por qué 4 se escribe IV en vez de IIII?', a: 'La regla sustractiva en números romanos coloca un valor menor antes de uno mayor para indicar sustracción. IV significa 5 menos 1, que es 4. Esto mantiene los numerales más cortos y fáciles de leer. Sin embargo, algunas esferas de reloj usan IIII por razones estilísticas.' },
        { q: '¿Cómo se convierte un número romano a decimal?', a: 'Lee el numeral de izquierda a derecha. Si un símbolo tiene un valor menor que el siguiente, réstalo; de lo contrario, súmalo. Ejemplo: MCMXLIV: M=1000, CM=900, XL=40, IV=4, dando 1000+900+40+4 = 1944.' },
        { q: '¿Los números romanos se siguen usando hoy?', a: 'Sí, los números romanos se usan ampliamente en contextos formales: esferas de relojes, esquemas numerados, años de copyright en cine y TV, nombres de monarcas y papas (ej. Isabel II), piedras angulares de edificios y monumentos.' },
        { q: '¿Los números romanos pueden representar el cero o números negativos?', a: 'No. El sistema de números romanos se desarrolló antes de que el concepto de cero se introdujera en la matemática europea. No existe símbolo para el cero ni forma de representar números negativos. El valor mínimo representable es 1 (I).' },
      ],
    },
    fr: {
      title: 'Convertisseur de Chiffres Romains Gratuit – Convertissez entre Chiffres Romains et Décimaux',
      paragraphs: [
        'Les chiffres romains sont un ancien système de numération né à Rome qui est resté le mode dominant d\'écriture des nombres dans toute l\'Europe pendant près de deux mille ans. Aujourd\'hui encore, les chiffres romains apparaissent sur les cadrans d\'horloge, dans les chapitres de livres, sur les pierres angulaires des bâtiments, dans les génériques de films et dans les plans formels. Savoir lire et écrire les chiffres romains est à la fois une compétence pratique et un lien avec des siècles de patrimoine culturel.',
        'Le système de numération romaine utilise sept symboles de base : I (1), V (5), X (10), L (50), C (100), D (500) et M (1000). Les nombres se forment en combinant ces symboles selon des règles précises. Lorsqu\'une valeur inférieure précède une valeur supérieure, elle est soustraite (ex. IV = 4, IX = 9, XL = 40, XC = 90, CD = 400, CM = 900). Sinon, les valeurs s\'additionnent de gauche à droite. Cette notation soustractive garde les chiffres concis et sans ambiguïté.',
        'Notre convertisseur de chiffres romains prend en charge la conversion bidirectionnelle entre les nombres décimaux (1 à 3999) et leurs équivalents romains. L\'outil valide votre saisie en temps réel, garantissant que seuls les chiffres romains bien formés ou les entiers dans la plage valide sont acceptés. Un tableau de référence intégré affiche toutes les valeurs standard et les combinaisons soustractives.',
        'Que vous soyez un étudiant en histoire ancienne, un designer travaillant sur des documents formels, un développeur nécessitant des conversions rapides, ou simplement curieux du fonctionnement des chiffres romains, ce convertisseur en ligne gratuit fournit des résultats instantanés et précis. L\'historique des conversions permet de revoir les calculs passés et la copie en un clic facilite le collage des résultats où vous en avez besoin.',
      ],
      faq: [
        { q: 'Quel est le plus grand nombre représentable en chiffres romains ?', a: 'En utilisant la notation standard des chiffres romains (sans extensions spéciales), le plus grand nombre est 3999, écrit MMMCMXCIX. Les nombres à partir de 4000 nécessitaient historiquement des conventions de notation supplémentaires non incluses dans le système de base à sept symboles.' },
        { q: 'Pourquoi 4 s\'écrit-il IV au lieu de IIII ?', a: 'La règle soustractive des chiffres romains place une valeur inférieure avant une valeur supérieure pour indiquer la soustraction. IV signifie 5 moins 1, soit 4. Cela garde les chiffres plus courts et plus lisibles. Cependant, certains cadrans d\'horloge utilisent IIII pour des raisons stylistiques.' },
        { q: 'Comment convertir un chiffre romain en nombre décimal ?', a: 'Lisez le chiffre de gauche à droite. Si un symbole a une valeur inférieure au suivant, soustrayez-le ; sinon, ajoutez-le. Exemple : MCMXLIV : M=1000, CM=900, XL=40, IV=4, donnant 1000+900+40+4 = 1944.' },
        { q: 'Les chiffres romains sont-ils encore utilisés aujourd\'hui ?', a: 'Oui, les chiffres romains sont largement utilisés dans les contextes formels : cadrans d\'horloge, plans numérotés, années de copyright au cinéma et à la télévision, noms de monarques et de papes (ex. Élisabeth II), pierres angulaires de bâtiments et monuments.' },
        { q: 'Les chiffres romains peuvent-ils représenter le zéro ou des nombres négatifs ?', a: 'Non. Le système des chiffres romains a été développé avant que le concept de zéro ne soit introduit dans les mathématiques européennes. Il n\'existe pas de symbole pour le zéro ni de moyen de représenter des nombres négatifs. La plus petite valeur représentable est 1 (I).' },
      ],
    },
    de: {
      title: 'Kostenloser Römische Zahlen Konverter – Zwischen Römischen und Dezimalzahlen Umrechnen',
      paragraphs: [
        'Römische Zahlen sind ein antikes Zahlensystem, das in Rom entstand und fast zweitausend Jahre lang die vorherrschende Art blieb, Zahlen in ganz Europa zu schreiben. Noch heute erscheinen römische Zahlen auf Ziffernblättern, in Buchkapiteln, auf Grundsteinen von Gebäuden, in Filmcredits und in formellen Gliederungen. Das Lesen und Schreiben römischer Zahlen zu verstehen ist sowohl eine praktische Fähigkeit als auch eine Verbindung zu Jahrhunderten kulturellen Erbes.',
        'Das römische Zahlensystem verwendet sieben Grundsymbole: I (1), V (5), X (10), L (50), C (100), D (500) und M (1000). Zahlen werden durch Kombination dieser Symbole nach bestimmten Regeln gebildet. Wenn ein kleinerer Wert vor einem größeren steht, wird er subtrahiert (z.B. IV = 4, IX = 9, XL = 40, XC = 90, CD = 400, CM = 900). Andernfalls werden die Werte von links nach rechts addiert. Diese subtraktive Notation hält die Zahlendarstellung prägnant und eindeutig.',
        'Unser Konverter für römische Zahlen unterstützt die bidirektionale Umrechnung zwischen Dezimalzahlen (1 bis 3999) und ihren römischen Entsprechungen. Das Tool validiert Ihre Eingabe in Echtzeit und stellt sicher, dass nur korrekt geformte römische Zahlen oder Ganzzahlen im gültigen Bereich akzeptiert werden. Eine integrierte Referenztabelle zeigt alle Standardwerte und subtraktiven Kombinationen.',
        'Ob Sie ein Student der alten Geschichte sind, ein Designer der an formellen Dokumenten arbeitet, ein Entwickler der schnelle Umrechnungen benötigt, oder einfach neugierig auf die Funktionsweise römischer Zahlen — dieser kostenlose Online-Konverter liefert sofortige, genaue Ergebnisse. Der Konvertierungsverlauf ermöglicht die Überprüfung vergangener Berechnungen, und das Kopieren mit einem Klick erleichtert das Einfügen der Ergebnisse.',
      ],
      faq: [
        { q: 'Was ist die größte Zahl, die man in römischen Zahlen schreiben kann?', a: 'Mit der standardmäßigen römischen Zahlenschreibweise (ohne spezielle Erweiterungen) ist die größte Zahl 3999, geschrieben als MMMCMXCIX. Zahlen ab 4000 erforderten historisch zusätzliche Notationskonventionen, die nicht Teil des grundlegenden Sieben-Symbole-Systems sind.' },
        { q: 'Warum wird 4 als IV statt IIII geschrieben?', a: 'Die subtraktive Regel bei römischen Zahlen stellt einen kleineren Wert vor einen größeren, um Subtraktion anzuzeigen. IV bedeutet 5 minus 1, also 4. Dies hält die Zahlen kürzer und lesbarer. Einige Ziffernblätter verwenden jedoch aus stilistischen Gründen IIII.' },
        { q: 'Wie konvertiert man eine römische Zahl in eine Dezimalzahl?', a: 'Lesen Sie die Zahl von links nach rechts. Wenn ein Symbol einen kleineren Wert als das folgende hat, subtrahieren Sie es; andernfalls addieren Sie es. Beispiel: MCMXLIV: M=1000, CM=900, XL=40, IV=4, ergibt 1000+900+40+4 = 1944.' },
        { q: 'Werden römische Zahlen heute noch verwendet?', a: 'Ja, römische Zahlen werden in formellen Kontexten weit verbreitet verwendet: auf Ziffernblättern, in nummerierten Gliederungen, für Copyright-Jahre in Film und Fernsehen, für Namen von Monarchen und Päpsten (z.B. Elisabeth II.), auf Grundsteinen und Denkmälern.' },
        { q: 'Können römische Zahlen Null oder negative Zahlen darstellen?', a: 'Nein. Das römische Zahlensystem wurde entwickelt, bevor das Konzept der Null in die europäische Mathematik eingeführt wurde. Es gibt kein Symbol für Null und keine Möglichkeit, negative Zahlen darzustellen. Der kleinste darstellbare Wert ist 1 (I).' },
      ],
    },
    pt: {
      title: 'Conversor de Números Romanos Grátis – Converta entre Números Romanos e Decimais',
      paragraphs: [
        'Os números romanos são um antigo sistema numérico originado em Roma que permaneceu como a forma dominante de escrever números em toda a Europa por quase dois mil anos. Ainda hoje, os números romanos aparecem em mostradores de relógios, capítulos de livros, pedras fundamentais de edifícios, créditos de filmes e esquemas formais. Saber ler e escrever números romanos é tanto uma habilidade prática quanto uma conexão com séculos de patrimônio cultural.',
        'O sistema de numeração romana utiliza sete símbolos básicos: I (1), V (5), X (10), L (50), C (100), D (500) e M (1000). Os números são formados combinando esses símbolos de acordo com regras específicas. Quando um valor menor aparece antes de um maior, ele é subtraído (ex. IV = 4, IX = 9, XL = 40, XC = 90, CD = 400, CM = 900). Caso contrário, os valores são somados da esquerda para a direita. Essa notação subtrativa mantém os numerais concisos e inequívocos.',
        'Nosso conversor de números romanos suporta conversão bidirecional entre números decimais (1 a 3999) e seus equivalentes romanos. A ferramenta valida sua entrada em tempo real, garantindo que apenas números romanos bem formados ou inteiros dentro da faixa válida sejam aceitos. Uma tabela de referência integrada exibe todos os valores padrão e combinações subtrativas.',
        'Seja você um estudante de história antiga, um designer trabalhando em documentos formais, um desenvolvedor que precisa de conversões rápidas, ou simplesmente curioso sobre como os números romanos funcionam, este conversor online gratuito fornece resultados instantâneos e precisos. O histórico de conversões permite revisar cálculos passados e a cópia com um clique facilita colar resultados onde você precisar.',
      ],
      faq: [
        { q: 'Qual é o maior número que se pode escrever em números romanos?', a: 'Usando a notação padrão de números romanos (sem extensões especiais), o maior número é 3999, escrito como MMMCMXCIX. Números a partir de 4000 historicamente exigiam convenções de notação adicionais não incluídas no sistema básico de sete símbolos.' },
        { q: 'Por que 4 é escrito como IV em vez de IIII?', a: 'A regra subtrativa nos números romanos coloca um valor menor antes de um maior para indicar subtração. IV significa 5 menos 1, que é 4. Isso mantém os numerais mais curtos e fáceis de ler. No entanto, alguns mostradores de relógio usam IIII por razões estilísticas.' },
        { q: 'Como converter um número romano para decimal?', a: 'Leia o numeral da esquerda para a direita. Se um símbolo tem um valor menor que o seguinte, subtraia-o; caso contrário, some-o. Exemplo: MCMXLIV: M=1000, CM=900, XL=40, IV=4, dando 1000+900+40+4 = 1944.' },
        { q: 'Os números romanos ainda são usados hoje?', a: 'Sim, os números romanos são amplamente usados em contextos formais: mostradores de relógios, esquemas numerados, anos de copyright em filmes e TV, nomes de monarcas e papas (ex. Elizabeth II), pedras fundamentais de edifícios e monumentos.' },
        { q: 'Os números romanos podem representar zero ou números negativos?', a: 'Não. O sistema de números romanos foi desenvolvido antes que o conceito de zero fosse introduzido na matemática europeia. Não existe símbolo para zero nem forma de representar números negativos. O menor valor representável é 1 (I).' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="roman-numeral-converter" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{toolT.description}</p>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          {/* Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{labels.mode[lang]}</label>
            <div className="flex gap-2">
              <button
                onClick={() => { setMode('dec2rom'); handleReset(); }}
                className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition ${mode === 'dec2rom' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              >
                {labels.decToRom[lang]}
              </button>
              <button
                onClick={() => { setMode('rom2dec'); handleReset(); }}
                className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition ${mode === 'rom2dec' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              >
                {labels.romToDec[lang]}
              </button>
            </div>
          </div>

          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {mode === 'dec2rom' ? labels.inputDecimal[lang] : labels.inputRoman[lang]}
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
                setResult(null);
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleConvert(); }}
              placeholder={mode === 'dec2rom' ? '1984' : 'MCMLXXXIV'}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 font-mono bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleConvert}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              {labels.convert[lang]}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              {labels.reset[lang]}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 text-center font-medium">
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{labels.result[lang]}</div>
              <div className="flex items-center justify-between">
                <div className="font-mono text-2xl font-bold text-gray-900 dark:text-gray-100">{result}</div>
                <button
                  onClick={() => copyToClipboard(result, 'result')}
                  className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/60 transition"
                >
                  {copiedResult ? labels.copied[lang] : labels.copy[lang]}
                </button>
              </div>
            </div>
          )}

          {!result && !error && (
            <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-2">
              {labels.noResult[lang]}
            </div>
          )}
        </div>

        {/* Reference Table */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{labels.referenceTable[lang]}</h2>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {REFERENCE_TABLE.map(([symbol, value]) => (
              <div key={symbol} className="text-center bg-gray-50 dark:bg-gray-900 rounded-lg p-2">
                <div className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">{symbol}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{labels.history[lang]}</h2>
              <button
                onClick={() => setHistory([])}
                className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 transition"
              >
                {labels.clearHistory[lang]}
              </button>
            </div>
            <div className="space-y-2">
              {history.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-2">
                  <div className="font-mono text-sm text-gray-700 dark:text-gray-300">
                    <span>{item.input}</span>
                    <span className="mx-2 text-gray-400">=</span>
                    <span className="font-bold">{item.output}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.output, i)}
                    className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/60 transition"
                  >
                    {copiedHistory === i ? labels.copied[lang] : '📋'}
                  </button>
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

        {/* FAQ Accordion */}
        <section className="mt-10 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">FAQ</h2>
          <div className="space-y-2">
            {seo.faq.map((item, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left px-4 py-3 font-medium text-gray-900 dark:text-gray-100 flex justify-between items-center">
                  {item.q}
                  <span className="text-gray-400">{openFaq === i ? '−' : '+'}</span>
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
