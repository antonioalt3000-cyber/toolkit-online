'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  min: { en: 'Minimum', it: 'Minimo', es: 'Mínimo', fr: 'Minimum', de: 'Minimum', pt: 'Mínimo' },
  max: { en: 'Maximum', it: 'Massimo', es: 'Máximo', fr: 'Maximum', de: 'Maximum', pt: 'Máximo' },
  quantity: { en: 'Quantity', it: 'Quantità', es: 'Cantidad', fr: 'Quantité', de: 'Anzahl', pt: 'Quantidade' },
  noDuplicates: { en: 'No Duplicates', it: 'Senza Duplicati', es: 'Sin Duplicados', fr: 'Sans Doublons', de: 'Ohne Duplikate', pt: 'Sem Duplicatas' },
  generate: { en: 'Generate', it: 'Genera', es: 'Generar', fr: 'Générer', de: 'Generieren', pt: 'Gerar' },
  results: { en: 'Results', it: 'Risultati', es: 'Resultados', fr: 'Résultats', de: 'Ergebnisse', pt: 'Resultados' },
  copy: { en: 'Copy All', it: 'Copia Tutto', es: 'Copiar Todo', fr: 'Copier Tout', de: 'Alle Kopieren', pt: 'Copiar Tudo' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  error: { en: 'Range too small for unique numbers', it: 'Intervallo troppo piccolo per numeri unici', es: 'Rango muy pequeño para números únicos', fr: 'Plage trop petite pour des nombres uniques', de: 'Bereich zu klein für eindeutige Zahlen', pt: 'Intervalo muito pequeno para números únicos' },
  sorted: { en: 'Sort Results', it: 'Ordina Risultati', es: 'Ordenar Resultados', fr: 'Trier les Résultats', de: 'Ergebnisse Sortieren', pt: 'Ordenar Resultados' },
  errorMinMax: { en: 'Minimum must be less than maximum', it: 'Il minimo deve essere inferiore al massimo', es: 'El mínimo debe ser menor que el máximo', fr: 'Le minimum doit être inférieur au maximum', de: 'Minimum muss kleiner als Maximum sein', pt: 'O mínimo deve ser menor que o máximo' },
  reset: { en: 'Reset', it: 'Reimposta', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  copyResult: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
  history: { en: 'History', it: 'Cronologia', es: 'Historial', fr: 'Historique', de: 'Verlauf', pt: 'Histórico' },
  clearHistory: { en: 'Clear', it: 'Cancella', es: 'Borrar', fr: 'Effacer', de: 'Löschen', pt: 'Limpar' },
  bulkGenerate: { en: 'Bulk Generate', it: 'Generazione Multipla', es: 'Generación Múltiple', fr: 'Génération en Masse', de: 'Massengenerierung', pt: 'Geração em Massa' },
  statistics: { en: 'Statistics', it: 'Statistiche', es: 'Estadísticas', fr: 'Statistiques', de: 'Statistiken', pt: 'Estatísticas' },
  statMin: { en: 'Min', it: 'Min', es: 'Mín', fr: 'Min', de: 'Min', pt: 'Mín' },
  statMax: { en: 'Max', it: 'Max', es: 'Máx', fr: 'Max', de: 'Max', pt: 'Máx' },
  statAvg: { en: 'Average', it: 'Media', es: 'Promedio', fr: 'Moyenne', de: 'Durchschnitt', pt: 'Média' },
  generatedNumber: { en: 'Generated Number', it: 'Numero Generato', es: 'Número Generado', fr: 'Nombre Généré', de: 'Generierte Zahl', pt: 'Número Gerado' },
  generatedNumbers: { en: 'Generated Numbers', it: 'Numeri Generati', es: 'Números Generados', fr: 'Nombres Générés', de: 'Generierte Zahlen', pt: 'Números Gerados' },
  numbers: { en: 'numbers', it: 'numeri', es: 'números', fr: 'nombres', de: 'Zahlen', pt: 'números' },
};

interface HistoryEntry {
  numbers: number[];
  timestamp: Date;
}

export default function RandomNumberGenerator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['random-number-generator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');
  const [quantity, setQuantity] = useState('1');
  const [noDups, setNoDups] = useState(false);
  const [sorted, setSorted] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedResult, setCopiedResult] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const generateNumbers = (qty: number): number[] | null => {
    const minNum = parseInt(min) || 0;
    const maxNum = parseInt(max) || 0;
    const clampedQty = Math.min(qty, 1000);
    const range = maxNum - minNum + 1;

    if (minNum >= maxNum) {
      setError(t('errorMinMax'));
      setResults([]);
      return null;
    }

    if (noDups && clampedQty > range) {
      setError(t('error'));
      setResults([]);
      return null;
    }
    setError('');

    let nums: number[];
    if (noDups) {
      const pool: number[] = [];
      for (let i = minNum; i <= maxNum; i++) pool.push(i);
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      nums = pool.slice(0, clampedQty);
    } else {
      nums = [];
      for (let i = 0; i < clampedQty; i++) {
        nums.push(Math.floor(Math.random() * range) + minNum);
      }
    }

    if (sorted) nums.sort((a, b) => a - b);
    return nums;
  };

  const handleGenerate = () => {
    const qty = Math.min(parseInt(quantity) || 1, 1000);
    const nums = generateNumbers(qty);
    if (nums) {
      setResults(nums);
      setCopied(false);
      setCopiedResult(false);
      setHistory(prev => [{ numbers: nums, timestamp: new Date() }, ...prev].slice(0, 10));
    }
  };

  const handleBulkGenerate = (count: number) => {
    const nums = generateNumbers(count);
    if (nums) {
      setResults(nums);
      setCopied(false);
      setCopiedResult(false);
      setHistory(prev => [{ numbers: nums, timestamp: new Date() }, ...prev].slice(0, 10));
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(results.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyResult = async () => {
    await navigator.clipboard.writeText(results.join(', '));
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 2000);
  };

  const handleReset = () => {
    setMin('1');
    setMax('100');
    setQuantity('1');
    setNoDups(false);
    setSorted(false);
    setResults([]);
    setError('');
    setCopied(false);
    setCopiedResult(false);
  };

  const allHistoryNumbers = history.flatMap(h => h.numbers);
  const stats = allHistoryNumbers.length > 0 ? {
    min: Math.min(...allHistoryNumbers),
    max: Math.max(...allHistoryNumbers),
    avg: (allHistoryNumbers.reduce((a, b) => a + b, 0) / allHistoryNumbers.length).toFixed(2),
  } : null;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Random Number Generator: How It Works and When to Use It',
      paragraphs: [
        'A random number generator (RNG) produces numbers that lack any predictable pattern. Our tool generates pseudo-random integers within a range you specify, making it useful for games, raffles, statistical sampling, decision-making, and educational purposes. You can generate one number or up to 1,000 at once.',
        'The generator offers two important options. The "No Duplicates" mode ensures every number in the output is unique, which is essential for lottery-style draws, random team assignments, or selecting winners from a numbered list. The "Sort Results" option arranges the output in ascending order for easier reading.',
        'Behind the scenes, the tool uses the Fisher-Yates shuffle algorithm when generating unique numbers. This algorithm guarantees an unbiased permutation — every possible arrangement of the numbers is equally likely. For non-unique generation, each number is independently and uniformly drawn from the specified range.',
        'While browser-based random number generators use pseudo-random algorithms (Math.random in JavaScript), they are more than adequate for everyday tasks like games, classroom activities, and casual decision-making. For cryptographic security or scientific simulations requiring true randomness, specialized hardware or crypto-grade APIs should be used instead.'
      ],
      faq: [
        { q: 'Are the numbers truly random?', a: 'They are pseudo-random, generated by the JavaScript Math.random() function. This is sufficient for games, drawings, and everyday use, but not for cryptographic purposes or high-stakes scientific simulations.' },
        { q: 'What is the maximum number of random numbers I can generate?', a: 'You can generate up to 1,000 numbers at once. This limit prevents browser performance issues. If you need more, simply generate multiple batches.' },
        { q: 'How does the "No Duplicates" option work?', a: 'It uses the Fisher-Yates shuffle algorithm on the full range of numbers, then picks the first N values. This guarantees every result is unique and every possible selection is equally likely.' },
        { q: 'Can I generate random decimal numbers?', a: 'This tool generates integers only. For decimal numbers, you could generate a large integer range and divide by a power of 10 (e.g., generate 1-1000 and divide by 100 for values between 0.01 and 10.00).' },
        { q: 'Why do I get an error when using No Duplicates?', a: 'If you request more unique numbers than exist in your range (e.g., 20 unique numbers between 1 and 10), it is mathematically impossible. The tool alerts you when the quantity exceeds the available range.' }
      ]
    },
    it: {
      title: 'Generatore di Numeri Casuali: Come Funziona e Quando Usarlo',
      paragraphs: [
        'Un generatore di numeri casuali (RNG) produce numeri privi di qualsiasi schema prevedibile. Il nostro strumento genera numeri interi pseudo-casuali entro un intervallo da te specificato, rendendolo utile per giochi, estrazioni, campionamento statistico, decisioni e scopi educativi. Puoi generare da uno fino a 1.000 numeri alla volta.',
        'Il generatore offre due opzioni importanti. La modalità "Senza Duplicati" assicura che ogni numero nel risultato sia unico, essenziale per estrazioni tipo lotteria, assegnazioni casuali di squadre o selezione di vincitori da una lista numerata. L\'opzione "Ordina Risultati" dispone l\'output in ordine crescente.',
        'Dietro le quinte, lo strumento utilizza l\'algoritmo di Fisher-Yates quando genera numeri unici. Questo algoritmo garantisce una permutazione imparziale — ogni possibile disposizione dei numeri è ugualmente probabile. Per la generazione non unica, ogni numero è estratto indipendentemente e uniformemente dall\'intervallo.',
        'Sebbene i generatori nel browser usino algoritmi pseudo-casuali (Math.random in JavaScript), sono più che adeguati per attività quotidiane come giochi e attività in classe. Per sicurezza crittografica o simulazioni scientifiche, si dovrebbero usare API crittografiche specializzate.'
      ],
      faq: [
        { q: 'I numeri sono veramente casuali?', a: 'Sono pseudo-casuali, generati dalla funzione Math.random() di JavaScript. È sufficiente per giochi, estrazioni e uso quotidiano, ma non per scopi crittografici.' },
        { q: 'Qual è il numero massimo di numeri casuali che posso generare?', a: 'Puoi generare fino a 1.000 numeri alla volta. Questo limite previene problemi di prestazioni del browser.' },
        { q: 'Come funziona l\'opzione "Senza Duplicati"?', a: 'Utilizza l\'algoritmo di Fisher-Yates sull\'intero intervallo di numeri, poi seleziona i primi N valori. Questo garantisce risultati unici e ugualmente probabili.' },
        { q: 'Posso generare numeri decimali casuali?', a: 'Questo strumento genera solo numeri interi. Per numeri decimali, puoi generare un ampio intervallo di interi e dividere per una potenza di 10.' },
        { q: 'Perché ottengo un errore con Senza Duplicati?', a: 'Se richiedi più numeri unici di quanti ne esistano nel tuo intervallo (es. 20 numeri unici tra 1 e 10), è matematicamente impossibile. Lo strumento ti avvisa quando la quantità supera l\'intervallo disponibile.' }
      ]
    },
    es: {
      title: 'Generador de Números Aleatorios: Cómo Funciona y Cuándo Usarlo',
      paragraphs: [
        'Un generador de números aleatorios (RNG) produce números sin ningún patrón predecible. Nuestra herramienta genera enteros pseudoaleatorios dentro de un rango que tú especificas, siendo útil para juegos, sorteos, muestreo estadístico, toma de decisiones y fines educativos. Puedes generar desde uno hasta 1.000 números a la vez.',
        'El generador ofrece dos opciones importantes. El modo "Sin Duplicados" asegura que cada número sea único, esencial para sorteos tipo lotería, asignaciones aleatorias de equipos o selección de ganadores. La opción "Ordenar Resultados" organiza la salida en orden ascendente.',
        'Internamente, la herramienta usa el algoritmo de Fisher-Yates al generar números únicos. Este algoritmo garantiza una permutación imparcial — cada disposición posible de los números es igualmente probable.',
        'Aunque los generadores en el navegador usan algoritmos pseudoaleatorios (Math.random en JavaScript), son más que adecuados para tareas cotidianas como juegos y actividades en el aula. Para seguridad criptográfica se deben usar APIs especializadas.'
      ],
      faq: [
        { q: '¿Los números son verdaderamente aleatorios?', a: 'Son pseudoaleatorios, generados por la función Math.random() de JavaScript. Es suficiente para juegos, sorteos y uso cotidiano, pero no para fines criptográficos.' },
        { q: '¿Cuál es la cantidad máxima de números que puedo generar?', a: 'Puedes generar hasta 1.000 números a la vez. Este límite previene problemas de rendimiento del navegador.' },
        { q: '¿Cómo funciona la opción "Sin Duplicados"?', a: 'Usa el algoritmo de Fisher-Yates sobre el rango completo de números, luego selecciona los primeros N valores. Esto garantiza resultados únicos e igualmente probables.' },
        { q: '¿Puedo generar números decimales aleatorios?', a: 'Esta herramienta genera solo números enteros. Para decimales, puedes generar un rango amplio de enteros y dividir por una potencia de 10.' },
        { q: '¿Por qué obtengo un error al usar Sin Duplicados?', a: 'Si solicitas más números únicos de los que existen en tu rango (ej. 20 números únicos entre 1 y 10), es matemáticamente imposible. La herramienta te alerta cuando la cantidad supera el rango disponible.' }
      ]
    },
    fr: {
      title: 'Générateur de Nombres Aléatoires : Comment Ça Marche et Quand l\'Utiliser',
      paragraphs: [
        'Un générateur de nombres aléatoires (RNG) produit des nombres sans schéma prévisible. Notre outil génère des entiers pseudo-aléatoires dans une plage que vous spécifiez, utile pour les jeux, tirages au sort, échantillonnage statistique, prise de décision et à des fins éducatives. Vous pouvez générer de un à 1 000 nombres à la fois.',
        'Le générateur offre deux options importantes. Le mode "Sans Doublons" garantit que chaque nombre est unique, essentiel pour les tirages de type loterie ou la sélection de gagnants. L\'option "Trier les Résultats" arrange la sortie en ordre croissant.',
        'En coulisses, l\'outil utilise l\'algorithme de Fisher-Yates pour générer des nombres uniques. Cet algorithme garantit une permutation impartiale — chaque arrangement possible est également probable.',
        'Bien que les générateurs de navigateur utilisent des algorithmes pseudo-aléatoires (Math.random en JavaScript), ils sont largement suffisants pour les jeux et les activités quotidiennes. Pour la sécurité cryptographique, des APIs spécialisées doivent être utilisées.'
      ],
      faq: [
        { q: 'Les nombres sont-ils vraiment aléatoires ?', a: 'Ils sont pseudo-aléatoires, générés par la fonction Math.random() de JavaScript. C\'est suffisant pour les jeux et tirages, mais pas pour des fins cryptographiques.' },
        { q: 'Quel est le nombre maximum de nombres que je peux générer ?', a: 'Vous pouvez générer jusqu\'à 1 000 nombres à la fois. Cette limite prévient les problèmes de performance du navigateur.' },
        { q: 'Comment fonctionne l\'option "Sans Doublons" ?', a: 'Elle utilise l\'algorithme de Fisher-Yates sur toute la plage de nombres, puis sélectionne les N premières valeurs. Cela garantit des résultats uniques et équiprobables.' },
        { q: 'Puis-je générer des nombres décimaux aléatoires ?', a: 'Cet outil ne génère que des entiers. Pour des décimaux, générez une large plage d\'entiers et divisez par une puissance de 10.' },
        { q: 'Pourquoi une erreur s\'affiche avec Sans Doublons ?', a: 'Si vous demandez plus de nombres uniques qu\'il n\'en existe dans votre plage (ex. 20 nombres uniques entre 1 et 10), c\'est mathématiquement impossible. L\'outil vous alerte.' }
      ]
    },
    de: {
      title: 'Zufallszahlengenerator: Wie Er Funktioniert und Wann Man Ihn Nutzt',
      paragraphs: [
        'Ein Zufallszahlengenerator (RNG) erzeugt Zahlen ohne vorhersehbares Muster. Unser Tool generiert pseudozufällige Ganzzahlen innerhalb eines von Ihnen angegebenen Bereichs, nützlich für Spiele, Verlosungen, statistische Stichproben, Entscheidungsfindung und Bildungszwecke. Sie können 1 bis 1.000 Zahlen gleichzeitig generieren.',
        'Der Generator bietet zwei wichtige Optionen. Der Modus "Ohne Duplikate" stellt sicher, dass jede Zahl einzigartig ist — unverzichtbar für Lotterieziehungen oder zufällige Teamzuweisungen. Die Option "Ergebnisse Sortieren" ordnet die Ausgabe aufsteigend.',
        'Im Hintergrund verwendet das Tool den Fisher-Yates-Shuffle-Algorithmus bei der Generierung einzigartiger Zahlen. Dieser Algorithmus garantiert eine unvoreingenommene Permutation — jede mögliche Anordnung ist gleich wahrscheinlich.',
        'Obwohl browserbasierte Generatoren pseudozufällige Algorithmen verwenden (Math.random in JavaScript), sind sie für alltägliche Aufgaben wie Spiele und Unterrichtsaktivitäten mehr als ausreichend. Für kryptografische Sicherheit sollten spezialisierte APIs verwendet werden.'
      ],
      faq: [
        { q: 'Sind die Zahlen wirklich zufällig?', a: 'Sie sind pseudozufällig, generiert durch JavaScripts Math.random(). Dies reicht für Spiele und Verlosungen, aber nicht für kryptografische Zwecke.' },
        { q: 'Wie viele Zufallszahlen kann ich maximal generieren?', a: 'Sie können bis zu 1.000 Zahlen gleichzeitig generieren. Dieses Limit verhindert Browser-Leistungsprobleme.' },
        { q: 'Wie funktioniert die Option "Ohne Duplikate"?', a: 'Sie verwendet den Fisher-Yates-Algorithmus auf dem gesamten Zahlenbereich und wählt dann die ersten N Werte. Dies garantiert einzigartige und gleichwahrscheinliche Ergebnisse.' },
        { q: 'Kann ich zufällige Dezimalzahlen generieren?', a: 'Dieses Tool generiert nur Ganzzahlen. Für Dezimalzahlen können Sie einen großen Ganzzahlbereich generieren und durch eine Zehnerpotenz teilen.' },
        { q: 'Warum erhalte ich einen Fehler bei "Ohne Duplikate"?', a: 'Wenn Sie mehr einzigartige Zahlen anfordern als in Ihrem Bereich existieren (z.B. 20 einzigartige Zahlen zwischen 1 und 10), ist dies mathematisch unmöglich. Das Tool warnt Sie.' }
      ]
    },
    pt: {
      title: 'Gerador de Números Aleatórios: Como Funciona e Quando Usar',
      paragraphs: [
        'Um gerador de números aleatórios (RNG) produz números sem nenhum padrão previsível. Nossa ferramenta gera inteiros pseudoaleatórios dentro de um intervalo que você especifica, sendo útil para jogos, sorteios, amostragem estatística, tomada de decisões e fins educacionais. Você pode gerar de 1 a 1.000 números de uma vez.',
        'O gerador oferece duas opções importantes. O modo "Sem Duplicatas" garante que cada número seja único, essencial para sorteios tipo loteria ou seleção de vencedores. A opção "Ordenar Resultados" organiza a saída em ordem crescente.',
        'Nos bastidores, a ferramenta usa o algoritmo de Fisher-Yates ao gerar números únicos. Este algoritmo garante uma permutação imparcial — cada arranjo possível é igualmente provável.',
        'Embora geradores no navegador usem algoritmos pseudoaleatórios (Math.random em JavaScript), são mais que adequados para tarefas cotidianas como jogos e atividades em sala de aula. Para segurança criptográfica, APIs especializadas devem ser usadas.'
      ],
      faq: [
        { q: 'Os números são verdadeiramente aleatórios?', a: 'São pseudoaleatórios, gerados pela função Math.random() do JavaScript. É suficiente para jogos e sorteios, mas não para fins criptográficos.' },
        { q: 'Qual é a quantidade máxima de números que posso gerar?', a: 'Você pode gerar até 1.000 números de uma vez. Este limite previne problemas de desempenho do navegador.' },
        { q: 'Como funciona a opção "Sem Duplicatas"?', a: 'Usa o algoritmo de Fisher-Yates no intervalo completo de números, depois seleciona os primeiros N valores. Isso garante resultados únicos e igualmente prováveis.' },
        { q: 'Posso gerar números decimais aleatórios?', a: 'Esta ferramenta gera apenas números inteiros. Para decimais, gere um amplo intervalo de inteiros e divida por uma potência de 10.' },
        { q: 'Por que recebo um erro ao usar Sem Duplicatas?', a: 'Se você solicitar mais números únicos do que existem no seu intervalo (ex. 20 números únicos entre 1 e 10), é matematicamente impossível. A ferramenta alerta você.' }
      ]
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="random-number-generator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('min')}</label>
              <input type="number" value={min} onChange={(e) => setMin(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('max')}</label>
              <input type="number" value={max} onChange={(e) => setMax(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('quantity')}</label>
            <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" max="1000"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={noDups} onChange={(e) => setNoDups(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-sm text-gray-700">{t('noDuplicates')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={sorted} onChange={(e) => setSorted(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-sm text-gray-700">{t('sorted')}</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button onClick={handleGenerate}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              {t('generate')}
            </button>
            <button onClick={handleReset}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">
              {t('reset')}
            </button>
          </div>

          {/* Bulk Generate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('bulkGenerate')}</label>
            <div className="flex gap-2">
              {[5, 10, 20].map((count) => (
                <button key={count} onClick={() => handleBulkGenerate(count)}
                  className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg font-medium hover:bg-indigo-100 transition-colors text-sm">
                  {count} {t('numbers')}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</div>}

          {/* Result Card */}
          {results.length > 0 && (
            <div className="mt-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-green-800">
                    {results.length === 1 ? t('generatedNumber') : t('generatedNumbers')}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={handleCopyResult}
                      className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${copiedResult ? 'bg-green-600 text-white' : 'bg-green-200 text-green-800 hover:bg-green-300'}`}>
                      {copiedResult ? t('copied') : t('copyResult')}
                    </button>
                    <button onClick={handleCopy}
                      className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${copied ? 'bg-green-600 text-white' : 'bg-green-200 text-green-800 hover:bg-green-300'}`}>
                      {copied ? t('copied') : t('copy')}
                    </button>
                  </div>
                </div>
                {results.length === 1 ? (
                  <div className="text-center">
                    <span className="text-5xl font-bold text-green-700 font-mono">{results[0]}</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {results.map((num, i) => (
                      <span key={i} className="bg-white px-3 py-1 rounded-lg border border-green-200 text-green-700 font-mono font-semibold">
                        {num}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        {stats && (
          <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">{t('statistics')}</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-600 font-medium">{t('statMin')}</div>
                <div className="text-lg font-bold text-blue-800 font-mono">{stats.min}</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-xs text-purple-600 font-medium">{t('statAvg')}</div>
                <div className="text-lg font-bold text-purple-800 font-mono">{stats.avg}</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-xs text-red-600 font-medium">{t('statMax')}</div>
                <div className="text-lg font-bold text-red-800 font-mono">{stats.max}</div>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-700">{t('history')}</h3>
              <button onClick={() => setHistory([])}
                className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors">
                {t('clearHistory')}
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {history.map((entry, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg text-sm">
                  <span className="font-mono text-gray-800 truncate flex-1 mr-2">
                    {entry.numbers.join(', ')}
                  </span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
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
