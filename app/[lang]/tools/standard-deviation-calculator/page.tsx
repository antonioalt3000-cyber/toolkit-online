'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type Stats = {
  count: number;
  sum: number;
  mean: number;
  populationVariance: number;
  sampleVariance: number;
  populationStdDev: number;
  sampleStdDev: number;
  min: number;
  max: number;
  range: number;
  median: number;
};

export default function StandardDeviationCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['standard-deviation-calculator'][lang];
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'population' | 'sample'>('population');
  const [copied, setCopied] = useState(false);

  const labels = {
    inputLabel: { en: 'Enter numbers (comma-separated or one per line)', it: 'Inserisci numeri (separati da virgola o uno per riga)', es: 'Ingresa numeros (separados por coma o uno por linea)', fr: 'Entrez des nombres (separes par virgule ou un par ligne)', de: 'Zahlen eingeben (kommagetrennt oder eine pro Zeile)', pt: 'Insira numeros (separados por virgula ou um por linha)' },
    mode: { en: 'Mode', it: 'Modalita', es: 'Modo', fr: 'Mode', de: 'Modus', pt: 'Modo' },
    population: { en: 'Population', it: 'Popolazione', es: 'Poblacion', fr: 'Population', de: 'Population', pt: 'Populacao' },
    sample: { en: 'Sample', it: 'Campione', es: 'Muestra', fr: 'Echantillon', de: 'Stichprobe', pt: 'Amostra' },
    results: { en: 'Results', it: 'Risultati', es: 'Resultados', fr: 'Resultats', de: 'Ergebnisse', pt: 'Resultados' },
    count: { en: 'Count (n)', it: 'Conteggio (n)', es: 'Conteo (n)', fr: 'Nombre (n)', de: 'Anzahl (n)', pt: 'Contagem (n)' },
    sum: { en: 'Sum', it: 'Somma', es: 'Suma', fr: 'Somme', de: 'Summe', pt: 'Soma' },
    mean: { en: 'Mean', it: 'Media', es: 'Media', fr: 'Moyenne', de: 'Mittelwert', pt: 'Media' },
    variance: { en: 'Variance', it: 'Varianza', es: 'Varianza', fr: 'Variance', de: 'Varianz', pt: 'Variancia' },
    stdDev: { en: 'Standard Deviation', it: 'Deviazione Standard', es: 'Desviacion Estandar', fr: 'Ecart Type', de: 'Standardabweichung', pt: 'Desvio Padrao' },
    popVariance: { en: 'Population Variance', it: 'Varianza Popolazione', es: 'Varianza Poblacional', fr: 'Variance Population', de: 'Populationsvarianz', pt: 'Variancia Populacional' },
    smpVariance: { en: 'Sample Variance', it: 'Varianza Campione', es: 'Varianza Muestral', fr: 'Variance Echantillon', de: 'Stichprobenvarianz', pt: 'Variancia Amostral' },
    popStdDev: { en: 'Population Std Dev', it: 'Dev Std Popolazione', es: 'Dev Est Poblacional', fr: 'Ecart Type Population', de: 'Populations-Std-Abw', pt: 'Dev Pad Populacional' },
    smpStdDev: { en: 'Sample Std Dev', it: 'Dev Std Campione', es: 'Dev Est Muestral', fr: 'Ecart Type Echantillon', de: 'Stichproben-Std-Abw', pt: 'Dev Pad Amostral' },
    min: { en: 'Minimum', it: 'Minimo', es: 'Minimo', fr: 'Minimum', de: 'Minimum', pt: 'Minimo' },
    max: { en: 'Maximum', it: 'Massimo', es: 'Maximo', fr: 'Maximum', de: 'Maximum', pt: 'Maximo' },
    range: { en: 'Range', it: 'Intervallo', es: 'Rango', fr: 'Etendue', de: 'Spannweite', pt: 'Amplitude' },
    median: { en: 'Median', it: 'Mediana', es: 'Mediana', fr: 'Mediane', de: 'Median', pt: 'Mediana' },
    copy: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier Resultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
    copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copie!', de: 'Kopiert!', pt: 'Copiado!' },
    clear: { en: 'Clear', it: 'Cancella', es: 'Borrar', fr: 'Effacer', de: 'Loschen', pt: 'Limpar' },
    placeholder: { en: '10, 20, 30, 40, 50\nor one number per line', it: '10, 20, 30, 40, 50\no un numero per riga', es: '10, 20, 30, 40, 50\no un numero por linea', fr: '10, 20, 30, 40, 50\nou un nombre par ligne', de: '10, 20, 30, 40, 50\noder eine Zahl pro Zeile', pt: '10, 20, 30, 40, 50\nou um numero por linha' },
    enterData: { en: 'Enter numbers to calculate statistics', it: 'Inserisci numeri per calcolare le statistiche', es: 'Ingresa numeros para calcular estadisticas', fr: 'Entrez des nombres pour calculer les statistiques', de: 'Geben Sie Zahlen ein, um Statistiken zu berechnen', pt: 'Insira numeros para calcular estatisticas' },
    needTwo: { en: 'Need at least 2 numbers for sample statistics', it: 'Servono almeno 2 numeri per statistiche campione', es: 'Se necesitan al menos 2 numeros para estadisticas muestrales', fr: 'Il faut au moins 2 nombres pour les statistiques echantillon', de: 'Mindestens 2 Zahlen fur Stichprobenstatistiken erforderlich', pt: 'Necessario pelo menos 2 numeros para estatisticas amostrais' },
  } as Record<string, Record<Locale, string>>;

  const parseNumbers = (): number[] => {
    const text = input.trim();
    if (!text) return [];
    const nums = text.split(/[\s,\n]+/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    return nums;
  };

  const calculate = (): Stats | null => {
    const nums = parseNumbers();
    if (nums.length === 0) return null;

    const count = nums.length;
    const sum = nums.reduce((a, b) => a + b, 0);
    const mean = sum / count;

    const squaredDiffs = nums.map(n => (n - mean) ** 2);
    const sumSquaredDiffs = squaredDiffs.reduce((a, b) => a + b, 0);

    const populationVariance = sumSquaredDiffs / count;
    const sampleVariance = count > 1 ? sumSquaredDiffs / (count - 1) : 0;
    const populationStdDev = Math.sqrt(populationVariance);
    const sampleStdDev = Math.sqrt(sampleVariance);

    const sorted = [...nums].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const range = max - min;

    let median: number;
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      median = (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      median = sorted[mid];
    }

    return { count, sum, mean, populationVariance, sampleVariance, populationStdDev, sampleStdDev, min, max, range, median };
  };

  const stats = calculate();
  const nums = parseNumbers();

  const copyResults = () => {
    if (!stats) return;
    const lines = [
      `${labels.count[lang]}: ${stats.count}`,
      `${labels.sum[lang]}: ${stats.sum}`,
      `${labels.mean[lang]}: ${stats.mean.toFixed(6)}`,
      `${labels.popVariance[lang]}: ${stats.populationVariance.toFixed(6)}`,
      `${labels.smpVariance[lang]}: ${stats.sampleVariance.toFixed(6)}`,
      `${labels.popStdDev[lang]}: ${stats.populationStdDev.toFixed(6)}`,
      `${labels.smpStdDev[lang]}: ${stats.sampleStdDev.toFixed(6)}`,
      `${labels.min[lang]}: ${stats.min}`,
      `${labels.max[lang]}: ${stats.max}`,
      `${labels.range[lang]}: ${stats.range}`,
      `${labels.median[lang]}: ${stats.median}`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Standard Deviation Calculator - Calculate Variance and Statistical Measures',
      paragraphs: [
        'Standard deviation is one of the most important measures in statistics, quantifying the amount of variation or dispersion in a set of data values. A low standard deviation indicates that values tend to be close to the mean, while a high standard deviation indicates that values are spread out over a wide range.',
        'Our free standard deviation calculator computes both population and sample standard deviation, along with variance, mean, median, range, and other descriptive statistics. Simply enter your numbers separated by commas or one per line, and the calculator instantly provides a comprehensive statistical summary.',
        'Understanding the difference between population and sample standard deviation is crucial. Population standard deviation divides the sum of squared differences by N (the total count), while sample standard deviation divides by N-1 to correct for bias when estimating from a subset of data. Use population mode when you have the complete dataset, and sample mode when working with a subset.',
        'This tool is perfect for students studying statistics, researchers analyzing data, quality control professionals monitoring manufacturing processes, and anyone who needs quick statistical calculations without installing specialized software. All calculations happen in your browser for instant results and complete data privacy.'
      ],
      faq: [
        { q: 'What is the difference between population and sample standard deviation?', a: 'Population standard deviation divides by N (total count) and is used when you have all data points. Sample standard deviation divides by N-1 (Bessel\'s correction) and is used when your data is a subset of a larger population, correcting for estimation bias.' },
        { q: 'How do I enter my data?', a: 'You can enter numbers separated by commas (e.g., 10, 20, 30) or one number per line. The calculator automatically parses both formats and ignores any non-numeric entries.' },
        { q: 'What statistics does this calculator provide?', a: 'The calculator provides count, sum, mean, population variance, sample variance, population standard deviation, sample standard deviation, minimum, maximum, range, and median.' },
        { q: 'Can I use this for homework or research?', a: 'Absolutely. The calculator uses standard statistical formulas and provides results to six decimal places. It is suitable for academic work, research analysis, and professional data evaluation.' },
        { q: 'Is my data stored or shared?', a: 'No. All calculations are performed entirely in your browser using JavaScript. Your data is never sent to any server, stored in any database, or shared with third parties.' }
      ]
    },
    it: {
      title: 'Calcolatore Deviazione Standard - Calcola Varianza e Misure Statistiche',
      paragraphs: [
        'La deviazione standard e una delle misure piu importanti in statistica, quantifica la variazione o dispersione in un insieme di valori. Una bassa deviazione standard indica che i valori tendono ad essere vicini alla media, mentre una alta indica che sono distribuiti su un ampio intervallo.',
        'Il nostro calcolatore gratuito calcola sia la deviazione standard della popolazione che del campione, insieme a varianza, media, mediana, intervallo e altre statistiche descrittive. Inserisci i numeri separati da virgole o uno per riga e il calcolatore fornisce istantaneamente un riepilogo statistico completo.',
        'Comprendere la differenza tra deviazione standard della popolazione e del campione e fondamentale. La popolazione divide per N (conteggio totale), mentre il campione divide per N-1 per correggere il bias nella stima da un sottoinsieme di dati. Usa la modalita popolazione quando hai il dataset completo e campione quando lavori con un sottoinsieme.',
        'Questo strumento e perfetto per studenti di statistica, ricercatori, professionisti del controllo qualita e chiunque necessiti di calcoli statistici rapidi senza installare software specializzato. Tutti i calcoli avvengono nel browser per risultati istantanei e privacy completa.'
      ],
      faq: [
        { q: 'Qual e la differenza tra deviazione standard della popolazione e del campione?', a: 'La deviazione standard della popolazione divide per N (conteggio totale) e si usa con tutti i dati. Quella del campione divide per N-1 (correzione di Bessel) e si usa quando i dati sono un sottoinsieme, correggendo il bias di stima.' },
        { q: 'Come inserisco i miei dati?', a: 'Puoi inserire numeri separati da virgole (es. 10, 20, 30) o un numero per riga. Il calcolatore analizza automaticamente entrambi i formati e ignora le voci non numeriche.' },
        { q: 'Quali statistiche fornisce questo calcolatore?', a: 'Il calcolatore fornisce conteggio, somma, media, varianza popolazione e campione, deviazione standard popolazione e campione, minimo, massimo, intervallo e mediana.' },
        { q: 'Posso usarlo per compiti o ricerche?', a: 'Assolutamente. Il calcolatore usa formule statistiche standard e fornisce risultati fino a sei decimali. E adatto per lavori accademici, analisi di ricerca e valutazione professionale dei dati.' },
        { q: 'I miei dati vengono conservati o condivisi?', a: 'No. Tutti i calcoli vengono eseguiti interamente nel browser tramite JavaScript. I tuoi dati non vengono mai inviati a server, memorizzati in database o condivisi con terze parti.' }
      ]
    },
    es: {
      title: 'Calculadora de Desviacion Estandar - Calcula Varianza y Medidas Estadisticas',
      paragraphs: [
        'La desviacion estandar es una de las medidas mas importantes en estadistica, cuantifica la variacion o dispersion en un conjunto de valores. Una baja desviacion estandar indica que los valores tienden a estar cerca de la media, mientras que una alta indica que estan distribuidos en un amplio rango.',
        'Nuestra calculadora gratuita calcula tanto la desviacion estandar poblacional como muestral, junto con varianza, media, mediana, rango y otras estadisticas descriptivas. Ingresa los numeros separados por comas o uno por linea y la calculadora proporciona instantaneamente un resumen estadistico completo.',
        'Comprender la diferencia entre desviacion estandar poblacional y muestral es crucial. La poblacional divide por N (conteo total), mientras que la muestral divide por N-1 para corregir el sesgo al estimar desde un subconjunto. Usa el modo poblacion cuando tengas el conjunto completo y muestra cuando trabajes con un subconjunto.',
        'Esta herramienta es perfecta para estudiantes de estadistica, investigadores, profesionales de control de calidad y cualquiera que necesite calculos estadisticos rapidos sin instalar software especializado. Todos los calculos ocurren en el navegador.'
      ],
      faq: [
        { q: 'Cual es la diferencia entre desviacion estandar poblacional y muestral?', a: 'La poblacional divide por N (conteo total) y se usa con todos los datos. La muestral divide por N-1 (correccion de Bessel) y se usa cuando los datos son un subconjunto, corrigiendo el sesgo de estimacion.' },
        { q: 'Como ingreso mis datos?', a: 'Puedes ingresar numeros separados por comas (ej. 10, 20, 30) o un numero por linea. La calculadora analiza automaticamente ambos formatos e ignora entradas no numericas.' },
        { q: 'Que estadisticas proporciona esta calculadora?', a: 'Proporciona conteo, suma, media, varianza poblacional y muestral, desviacion estandar poblacional y muestral, minimo, maximo, rango y mediana.' },
        { q: 'Puedo usarlo para tareas o investigaciones?', a: 'Absolutamente. La calculadora usa formulas estadisticas estandar y proporciona resultados con seis decimales. Es adecuada para trabajo academico y analisis profesional.' },
        { q: 'Se almacenan o comparten mis datos?', a: 'No. Todos los calculos se realizan completamente en el navegador mediante JavaScript. Tus datos nunca se envian a servidores ni se comparten con terceros.' }
      ]
    },
    fr: {
      title: 'Calculateur d\'Ecart Type - Calculez Variance et Mesures Statistiques',
      paragraphs: [
        'L\'ecart type est l\'une des mesures les plus importantes en statistique, il quantifie la variation ou la dispersion dans un ensemble de valeurs. Un faible ecart type indique que les valeurs sont proches de la moyenne, tandis qu\'un ecart eleve indique qu\'elles sont reparties sur une large plage.',
        'Notre calculateur gratuit calcule l\'ecart type de la population et de l\'echantillon, ainsi que la variance, la moyenne, la mediane, l\'etendue et d\'autres statistiques descriptives. Entrez vos nombres separes par des virgules ou un par ligne et obtenez instantanement un resume statistique complet.',
        'Comprendre la difference entre l\'ecart type de la population et de l\'echantillon est crucial. La population divise par N (nombre total), tandis que l\'echantillon divise par N-1 pour corriger le biais lors de l\'estimation a partir d\'un sous-ensemble. Utilisez le mode population avec le jeu de donnees complet et echantillon avec un sous-ensemble.',
        'Cet outil est parfait pour les etudiants en statistique, les chercheurs, les professionnels du controle qualite et tous ceux qui ont besoin de calculs statistiques rapides sans installer de logiciel specialise. Tous les calculs se font dans le navigateur.'
      ],
      faq: [
        { q: 'Quelle est la difference entre ecart type de population et d\'echantillon ?', a: 'L\'ecart type de population divise par N (nombre total) et s\'utilise avec toutes les donnees. Celui de l\'echantillon divise par N-1 (correction de Bessel) et s\'utilise quand les donnees sont un sous-ensemble, corrigeant le biais d\'estimation.' },
        { q: 'Comment saisir mes donnees ?', a: 'Vous pouvez entrer des nombres separes par des virgules (ex. 10, 20, 30) ou un nombre par ligne. Le calculateur analyse automatiquement les deux formats et ignore les entrees non numeriques.' },
        { q: 'Quelles statistiques ce calculateur fournit-il ?', a: 'Le calculateur fournit le nombre, la somme, la moyenne, la variance population et echantillon, l\'ecart type population et echantillon, le minimum, le maximum, l\'etendue et la mediane.' },
        { q: 'Puis-je l\'utiliser pour mes devoirs ou recherches ?', a: 'Absolument. Le calculateur utilise des formules statistiques standard et fournit des resultats a six decimales. Il convient aux travaux academiques et a l\'analyse professionnelle.' },
        { q: 'Mes donnees sont-elles stockees ou partagees ?', a: 'Non. Tous les calculs sont effectues entierement dans votre navigateur via JavaScript. Vos donnees ne sont jamais envoyees a un serveur ni partagees avec des tiers.' }
      ]
    },
    de: {
      title: 'Standardabweichung Rechner - Varianz und Statistische Masse Berechnen',
      paragraphs: [
        'Die Standardabweichung ist eine der wichtigsten Masse in der Statistik und quantifiziert die Variation oder Streuung in einem Datensatz. Eine niedrige Standardabweichung zeigt an, dass die Werte nahe am Mittelwert liegen, wahrend eine hohe zeigt, dass sie uber einen weiten Bereich verteilt sind.',
        'Unser kostenloser Rechner berechnet sowohl die Populations- als auch die Stichproben-Standardabweichung, zusammen mit Varianz, Mittelwert, Median, Spannweite und anderen beschreibenden Statistiken. Geben Sie Zahlen kommagetrennt oder eine pro Zeile ein und erhalten Sie sofort eine umfassende statistische Zusammenfassung.',
        'Den Unterschied zwischen Populations- und Stichproben-Standardabweichung zu verstehen ist entscheidend. Die Population teilt durch N (Gesamtzahl), wahrend die Stichprobe durch N-1 teilt, um den Bias bei der Schatzung aus einer Teilmenge zu korrigieren. Verwenden Sie den Populationsmodus mit dem vollstandigen Datensatz und den Stichprobenmodus mit einer Teilmenge.',
        'Dieses Tool ist perfekt fur Statistik-Studenten, Forscher, Qualitatskontroll-Fachleute und alle, die schnelle statistische Berechnungen ohne spezielle Software benotigen. Alle Berechnungen erfolgen im Browser fur sofortige Ergebnisse und vollstandigen Datenschutz.'
      ],
      faq: [
        { q: 'Was ist der Unterschied zwischen Populations- und Stichproben-Standardabweichung?', a: 'Die Populations-Standardabweichung teilt durch N (Gesamtzahl) und wird mit allen Datenpunkten verwendet. Die Stichproben-Standardabweichung teilt durch N-1 (Bessel-Korrektur) und wird verwendet, wenn die Daten eine Teilmenge sind.' },
        { q: 'Wie gebe ich meine Daten ein?', a: 'Sie konnen Zahlen kommagetrennt eingeben (z.B. 10, 20, 30) oder eine Zahl pro Zeile. Der Rechner analysiert automatisch beide Formate und ignoriert nicht-numerische Eingaben.' },
        { q: 'Welche Statistiken liefert dieser Rechner?', a: 'Der Rechner liefert Anzahl, Summe, Mittelwert, Populations- und Stichprobenvarianz, Populations- und Stichproben-Standardabweichung, Minimum, Maximum, Spannweite und Median.' },
        { q: 'Kann ich dies fur Hausaufgaben oder Forschung verwenden?', a: 'Absolut. Der Rechner verwendet statistische Standardformeln und liefert Ergebnisse mit sechs Dezimalstellen. Er eignet sich fur akademische Arbeiten und professionelle Datenanalyse.' },
        { q: 'Werden meine Daten gespeichert oder geteilt?', a: 'Nein. Alle Berechnungen werden vollstandig in Ihrem Browser uber JavaScript durchgefuhrt. Ihre Daten werden nie an Server gesendet oder mit Dritten geteilt.' }
      ]
    },
    pt: {
      title: 'Calculadora de Desvio Padrao - Calcule Variancia e Medidas Estatisticas',
      paragraphs: [
        'O desvio padrao e uma das medidas mais importantes em estatistica, quantificando a variacao ou dispersao em um conjunto de valores. Um baixo desvio padrao indica que os valores tendem a estar proximos da media, enquanto um alto indica que estao distribuidos em uma ampla faixa.',
        'Nossa calculadora gratuita calcula tanto o desvio padrao populacional quanto amostral, junto com variancia, media, mediana, amplitude e outras estatisticas descritivas. Insira os numeros separados por virgulas ou um por linha e a calculadora fornece instantaneamente um resumo estatistico completo.',
        'Entender a diferenca entre desvio padrao populacional e amostral e crucial. O populacional divide por N (contagem total), enquanto o amostral divide por N-1 para corrigir o vies ao estimar a partir de um subconjunto. Use o modo populacao com o conjunto completo e amostra com um subconjunto.',
        'Esta ferramenta e perfeita para estudantes de estatistica, pesquisadores, profissionais de controle de qualidade e qualquer pessoa que precise de calculos estatisticos rapidos sem instalar software especializado. Todos os calculos acontecem no navegador.'
      ],
      faq: [
        { q: 'Qual e a diferenca entre desvio padrao populacional e amostral?', a: 'O populacional divide por N (contagem total) e e usado com todos os dados. O amostral divide por N-1 (correcao de Bessel) e e usado quando os dados sao um subconjunto, corrigindo o vies de estimativa.' },
        { q: 'Como insiro meus dados?', a: 'Voce pode inserir numeros separados por virgulas (ex. 10, 20, 30) ou um numero por linha. A calculadora analisa automaticamente ambos os formatos e ignora entradas nao numericas.' },
        { q: 'Quais estatisticas esta calculadora fornece?', a: 'A calculadora fornece contagem, soma, media, variancia populacional e amostral, desvio padrao populacional e amostral, minimo, maximo, amplitude e mediana.' },
        { q: 'Posso usar para trabalhos ou pesquisas?', a: 'Absolutamente. A calculadora usa formulas estatisticas padrao e fornece resultados com seis casas decimais. E adequada para trabalhos academicos e analise profissional.' },
        { q: 'Meus dados sao armazenados ou compartilhados?', a: 'Nao. Todos os calculos sao realizados inteiramente no seu navegador via JavaScript. Seus dados nunca sao enviados a servidores ou compartilhados com terceiros.' }
      ]
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="standard-deviation-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Mode toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.mode[lang]}</label>
            <div className="flex gap-2">
              {(['population', 'sample'] as const).map(m => (
                <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${mode === m ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {labels[m][lang]}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.inputLabel[lang]}</label>
            <textarea value={input} onChange={e => setInput(e.target.value)} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500" placeholder={labels.placeholder[lang]} />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={() => setInput('')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              {labels.clear[lang]}
            </button>
            {stats && (
              <button onClick={copyResults} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                {copied ? labels.copied[lang] : labels.copy[lang]}
              </button>
            )}
          </div>

          {/* Results */}
          {stats ? (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">{labels.results[lang]}</h3>

              {/* Highlighted stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-white">{mode === 'population' ? stats.populationStdDev.toFixed(4) : stats.sampleStdDev.toFixed(4)}</div>
                  <div className="text-xs text-white/80">{labels.stdDev[lang]} ({labels[mode][lang]})</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-white">{mode === 'population' ? stats.populationVariance.toFixed(4) : stats.sampleVariance.toFixed(4)}</div>
                  <div className="text-xs text-white/80">{labels.variance[lang]} ({labels[mode][lang]})</div>
                </div>
              </div>

              {nums.length < 2 && mode === 'sample' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 mb-3">
                  {labels.needTwo[lang]}
                </div>
              )}

              {/* Full stats grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: labels.count[lang], value: stats.count },
                  { label: labels.sum[lang], value: stats.sum },
                  { label: labels.mean[lang], value: stats.mean.toFixed(6) },
                  { label: labels.median[lang], value: stats.median },
                  { label: labels.min[lang], value: stats.min },
                  { label: labels.max[lang], value: stats.max },
                  { label: labels.range[lang], value: stats.range },
                  { label: labels.popVariance[lang], value: stats.populationVariance.toFixed(6) },
                  { label: labels.smpVariance[lang], value: stats.sampleVariance.toFixed(6) },
                  { label: labels.popStdDev[lang], value: stats.populationStdDev.toFixed(6) },
                  { label: labels.smpStdDev[lang], value: stats.sampleStdDev.toFixed(6) },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg px-3 py-2">
                    <div className="text-xs text-gray-500">{item.label}</div>
                    <div className="text-sm font-semibold text-gray-900 font-mono">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">{labels.enterData[lang]}</div>
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
