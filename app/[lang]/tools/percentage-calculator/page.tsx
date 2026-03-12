'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: {
    title: 'How to Calculate Percentages Easily',
    paragraphs: [
      'Percentages are one of the most commonly used mathematical concepts in everyday life. From calculating discounts during shopping to understanding interest rates on loans and interpreting statistics in news reports, percentages help us express proportions in a way that is easy to understand and compare. Despite their simplicity, many people struggle with percentage calculations, especially when working backwards from a result.',
      'Our free percentage calculator handles the three most common types of percentage problems. First, it computes what a given percentage of a number is — for example, 15% of 200 equals 30. Second, it determines what percentage one number is of another — for instance, 50 is 25% of 200. Third, it calculates the percentage change between two values, which is essential for tracking growth, decline, or performance over time.',
      'Whether you are a student working on math homework, a professional analyzing business data, or a shopper trying to figure out a sale price, this tool provides instant and accurate results. No formulas to remember, no manual calculations — just enter your numbers and get the answer immediately. The calculator works with decimals and negative numbers, making it versatile for any scenario.',
    ],
    faq: [
      { q: 'How do I calculate what percentage one number is of another?', a: 'Divide the first number by the second number and multiply by 100. For example, to find what percentage 25 is of 200: (25 / 200) x 100 = 12.5%.' },
      { q: 'How do I calculate percentage change between two values?', a: 'Subtract the old value from the new value, divide the result by the old value, and multiply by 100. For example, from 80 to 100: ((100 - 80) / 80) x 100 = 25% increase.' },
      { q: 'Can I calculate percentages with decimal numbers?', a: 'Yes. This calculator works with any decimal numbers. For example, you can find 7.5% of 1250.50, which equals 93.79.' },
      { q: 'What is the formula for finding a percentage of a number?', a: 'Multiply the number by the percentage and divide by 100. For example, 20% of 150 = (20 / 100) x 150 = 30.' },
      { q: 'How are percentages used in everyday life?', a: 'Percentages are used for calculating tips at restaurants, understanding tax rates, comparing price discounts, analyzing investment returns, interpreting exam scores, and tracking changes in data over time.' },
    ],
  },
  it: {
    title: 'Come Calcolare le Percentuali Facilmente',
    paragraphs: [
      'Le percentuali sono uno dei concetti matematici piu utilizzati nella vita quotidiana. Dal calcolo degli sconti durante lo shopping alla comprensione dei tassi di interesse sui prestiti, le percentuali ci aiutano a esprimere le proporzioni in modo facile da capire e confrontare. Nonostante la loro semplicita, molte persone hanno difficolta con i calcoli percentuali.',
      'Il nostro calcolatore di percentuali gratuito gestisce i tre tipi piu comuni di problemi percentuali. Primo, calcola quanto e una data percentuale di un numero — ad esempio, il 15% di 200 e 30. Secondo, determina che percentuale un numero rappresenta di un altro. Terzo, calcola la variazione percentuale tra due valori, essenziale per monitorare crescita o declino nel tempo.',
      'Che tu sia uno studente, un professionista che analizza dati aziendali o un consumatore che cerca di capire un prezzo scontato, questo strumento fornisce risultati istantanei e accurati. Nessuna formula da ricordare, nessun calcolo manuale — inserisci i tuoi numeri e ottieni la risposta immediatamente.',
    ],
    faq: [
      { q: 'Come calcolo che percentuale e un numero rispetto a un altro?', a: 'Dividi il primo numero per il secondo e moltiplica per 100. Ad esempio, per trovare che percentuale e 25 di 200: (25 / 200) x 100 = 12,5%.' },
      { q: 'Come si calcola la variazione percentuale?', a: 'Sottrai il valore vecchio dal nuovo, dividi il risultato per il valore vecchio e moltiplica per 100. Ad esempio, da 80 a 100: ((100 - 80) / 80) x 100 = 25% di aumento.' },
      { q: 'Posso calcolare percentuali con numeri decimali?', a: 'Si. Questo calcolatore funziona con qualsiasi numero decimale. Ad esempio, puoi trovare il 7,5% di 1250,50, che equivale a 93,79.' },
      { q: 'Qual e la formula per trovare la percentuale di un numero?', a: 'Moltiplica il numero per la percentuale e dividi per 100. Ad esempio, il 20% di 150 = (20 / 100) x 150 = 30.' },
      { q: 'Come vengono usate le percentuali nella vita quotidiana?', a: 'Le percentuali servono per calcolare mance, capire le aliquote fiscali, confrontare sconti, analizzare rendimenti degli investimenti, interpretare voti scolastici e monitorare variazioni nei dati.' },
    ],
  },
  es: {
    title: 'Como Calcular Porcentajes Facilmente',
    paragraphs: [
      'Los porcentajes son uno de los conceptos matematicos mas utilizados en la vida cotidiana. Desde calcular descuentos hasta entender tasas de interes en prestamos, los porcentajes nos ayudan a expresar proporciones de forma facil de entender y comparar. A pesar de su sencillez, muchas personas tienen dificultades con los calculos porcentuales.',
      'Nuestra calculadora de porcentajes gratuita maneja los tres tipos mas comunes de problemas porcentuales. Primero, calcula cuanto es un porcentaje dado de un numero. Segundo, determina que porcentaje es un numero respecto a otro. Tercero, calcula el cambio porcentual entre dos valores, esencial para rastrear crecimiento o descenso a lo largo del tiempo.',
      'Ya seas estudiante, profesional que analiza datos empresariales o consumidor intentando descifrar un precio de oferta, esta herramienta proporciona resultados instantaneos y precisos. Sin formulas que recordar, sin calculos manuales — solo introduce tus numeros y obtendras la respuesta inmediatamente.',
    ],
    faq: [
      { q: 'Como calculo que porcentaje es un numero de otro?', a: 'Divide el primer numero entre el segundo y multiplica por 100. Por ejemplo, para encontrar que porcentaje es 25 de 200: (25 / 200) x 100 = 12,5%.' },
      { q: 'Como se calcula el cambio porcentual entre dos valores?', a: 'Resta el valor antiguo del nuevo, divide el resultado entre el valor antiguo y multiplica por 100. Por ejemplo, de 80 a 100: ((100 - 80) / 80) x 100 = 25% de aumento.' },
      { q: 'Puedo calcular porcentajes con numeros decimales?', a: 'Si. Esta calculadora funciona con cualquier numero decimal. Por ejemplo, puedes encontrar el 7,5% de 1250,50, que equivale a 93,79.' },
      { q: 'Cual es la formula para encontrar el porcentaje de un numero?', a: 'Multiplica el numero por el porcentaje y divide entre 100. Por ejemplo, el 20% de 150 = (20 / 100) x 150 = 30.' },
      { q: 'Como se usan los porcentajes en la vida diaria?', a: 'Los porcentajes se usan para calcular propinas, entender tipos impositivos, comparar descuentos, analizar rendimientos de inversiones, interpretar notas de examenes y rastrear cambios en datos.' },
    ],
  },
  fr: {
    title: 'Comment Calculer les Pourcentages Facilement',
    paragraphs: [
      'Les pourcentages sont l\'un des concepts mathematiques les plus utilises dans la vie quotidienne. Du calcul des remises en magasin a la comprehension des taux d\'interet sur les prets, les pourcentages nous aident a exprimer des proportions de maniere facile a comprendre et a comparer.',
      'Notre calculateur de pourcentages gratuit gere les trois types de problemes de pourcentage les plus courants. Premierement, il calcule combien represente un pourcentage donne d\'un nombre. Deuxiemement, il determine quel pourcentage un nombre represente par rapport a un autre. Troisiemement, il calcule la variation en pourcentage entre deux valeurs, essentielle pour suivre la croissance ou le declin dans le temps.',
      'Que vous soyez etudiant, professionnel analysant des donnees ou consommateur essayant de comprendre un prix en solde, cet outil fournit des resultats instantanes et precis. Aucune formule a retenir, aucun calcul manuel — entrez simplement vos chiffres et obtenez la reponse immediatement.',
    ],
    faq: [
      { q: 'Comment calculer quel pourcentage un nombre represente par rapport a un autre?', a: 'Divisez le premier nombre par le second et multipliez par 100. Par exemple, pour trouver quel pourcentage 25 represente de 200: (25 / 200) x 100 = 12,5%.' },
      { q: 'Comment calculer la variation en pourcentage?', a: 'Soustrayez l\'ancienne valeur de la nouvelle, divisez le resultat par l\'ancienne valeur et multipliez par 100. Par exemple, de 80 a 100: ((100 - 80) / 80) x 100 = 25% d\'augmentation.' },
      { q: 'Puis-je calculer des pourcentages avec des nombres decimaux?', a: 'Oui. Ce calculateur fonctionne avec n\'importe quel nombre decimal. Par exemple, vous pouvez trouver 7,5% de 1250,50, soit 93,79.' },
      { q: 'Quelle est la formule pour trouver le pourcentage d\'un nombre?', a: 'Multipliez le nombre par le pourcentage et divisez par 100. Par exemple, 20% de 150 = (20 / 100) x 150 = 30.' },
      { q: 'Comment les pourcentages sont-ils utilises au quotidien?', a: 'Les pourcentages servent a calculer les pourboires, comprendre les taux d\'imposition, comparer les remises, analyser les rendements d\'investissement, interpreter les notes d\'examen et suivre les variations de donnees.' },
    ],
  },
  de: {
    title: 'Wie man Prozentsaetze einfach berechnet',
    paragraphs: [
      'Prozentsaetze gehoeren zu den am haeufigsten verwendeten mathematischen Konzepten im Alltag. Von der Berechnung von Rabatten beim Einkaufen bis zum Verstaendnis von Zinssaetzen bei Krediten helfen uns Prozentsaetze, Verhaeltnisse auf leicht verstaendliche Weise auszudruecken und zu vergleichen.',
      'Unser kostenloser Prozentrechner behandelt die drei haeufigsten Arten von Prozentaufgaben. Erstens berechnet er, wie viel ein bestimmter Prozentsatz einer Zahl ist. Zweitens bestimmt er, welchen Prozentsatz eine Zahl von einer anderen darstellt. Drittens berechnet er die prozentuale Veraenderung zwischen zwei Werten, was fuer die Verfolgung von Wachstum oder Rueckgang unerlaesslich ist.',
      'Ob Sie Student, Berufstaetiger bei der Datenanalyse oder Verbraucher sind — dieses Tool liefert sofortige und genaue Ergebnisse. Keine Formeln merken, keine manuellen Berechnungen — geben Sie einfach Ihre Zahlen ein und erhalten Sie sofort die Antwort.',
    ],
    faq: [
      { q: 'Wie berechne ich, welcher Prozentsatz eine Zahl von einer anderen ist?', a: 'Teilen Sie die erste Zahl durch die zweite und multiplizieren Sie mit 100. Beispiel: Um herauszufinden, welcher Prozentsatz 25 von 200 ist: (25 / 200) x 100 = 12,5%.' },
      { q: 'Wie berechnet man die prozentuale Veraenderung?', a: 'Ziehen Sie den alten Wert vom neuen ab, teilen Sie das Ergebnis durch den alten Wert und multiplizieren Sie mit 100. Beispiel: Von 80 auf 100: ((100 - 80) / 80) x 100 = 25% Zunahme.' },
      { q: 'Kann ich Prozentsaetze mit Dezimalzahlen berechnen?', a: 'Ja. Dieser Rechner funktioniert mit beliebigen Dezimalzahlen. Beispielsweise koennen Sie 7,5% von 1250,50 berechnen, was 93,79 ergibt.' },
      { q: 'Was ist die Formel zur Berechnung des Prozentsatzes einer Zahl?', a: 'Multiplizieren Sie die Zahl mit dem Prozentsatz und teilen Sie durch 100. Beispiel: 20% von 150 = (20 / 100) x 150 = 30.' },
      { q: 'Wie werden Prozentsaetze im Alltag verwendet?', a: 'Prozentsaetze dienen zur Berechnung von Trinkgeldern, zum Verstaendnis von Steuersaetzen, zum Vergleich von Rabatten, zur Analyse von Anlagerenditen, zur Interpretation von Pruefungsnoten und zur Verfolgung von Datenveraenderungen.' },
    ],
  },
  pt: {
    title: 'Como Calcular Percentagens Facilmente',
    paragraphs: [
      'As percentagens sao um dos conceitos matematicos mais utilizados no dia a dia. Desde calcular descontos nas compras ate compreender taxas de juro em emprestimos, as percentagens ajudam-nos a expressar proporcoes de forma facil de entender e comparar.',
      'A nossa calculadora de percentagens gratuita resolve os tres tipos mais comuns de problemas com percentagens. Primeiro, calcula quanto e uma determinada percentagem de um numero. Segundo, determina que percentagem um numero representa de outro. Terceiro, calcula a variacao percentual entre dois valores, essencial para acompanhar crescimento ou declinio ao longo do tempo.',
      'Seja estudante, profissional a analisar dados ou consumidor a tentar perceber um preco de saldo, esta ferramenta fornece resultados instantaneos e precisos. Sem formulas para decorar, sem calculos manuais — basta introduzir os seus numeros e obter a resposta imediatamente.',
    ],
    faq: [
      { q: 'Como calculo que percentagem um numero e de outro?', a: 'Divida o primeiro numero pelo segundo e multiplique por 100. Por exemplo, para encontrar que percentagem e 25 de 200: (25 / 200) x 100 = 12,5%.' },
      { q: 'Como se calcula a variacao percentual?', a: 'Subtraia o valor antigo do novo, divida o resultado pelo valor antigo e multiplique por 100. Por exemplo, de 80 para 100: ((100 - 80) / 80) x 100 = 25% de aumento.' },
      { q: 'Posso calcular percentagens com numeros decimais?', a: 'Sim. Esta calculadora funciona com qualquer numero decimal. Por exemplo, pode encontrar 7,5% de 1250,50, que equivale a 93,79.' },
      { q: 'Qual e a formula para encontrar a percentagem de um numero?', a: 'Multiplique o numero pela percentagem e divida por 100. Por exemplo, 20% de 150 = (20 / 100) x 150 = 30.' },
      { q: 'Como sao usadas as percentagens no dia a dia?', a: 'As percentagens servem para calcular gorjetas, compreender taxas de imposto, comparar descontos, analisar retornos de investimentos, interpretar notas de exames e acompanhar variacoes em dados.' },
    ],
  },
};

export default function PercentageCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['percentage-calculator'][lang];

  const [val1, setVal1] = useState('');
  const [pct1, setPct1] = useState('');
  const [val2a, setVal2a] = useState('');
  const [val2b, setVal2b] = useState('');
  const [val3a, setVal3a] = useState('');
  const [val3b, setVal3b] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [history, setHistory] = useState<{ type: string; input: string; result: string }[]>([]);

  const labels = {
    whatIs: { en: 'What is', it: 'Quanto è il', es: 'Cuánto es el', fr: 'Combien est', de: 'Was ist', pt: 'Quanto é' },
    of: { en: 'of', it: 'di', es: 'de', fr: 'de', de: 'von', pt: 'de' },
    isWhatPct: { en: 'is what % of', it: 'è che % di', es: 'es qué % de', fr: 'est quel % de', de: 'ist wieviel % von', pt: 'é qual % de' },
    pctChange: { en: 'Percentage change from', it: 'Variazione percentuale da', es: 'Cambio porcentual de', fr: 'Changement en pourcentage de', de: 'Prozentuale Änderung von', pt: 'Mudança percentual de' },
    to: { en: 'to', it: 'a', es: 'a', fr: 'à', de: 'zu', pt: 'para' },
    reset: { en: 'Reset All', it: 'Resetta Tutto', es: 'Restablecer Todo', fr: 'Réinitialiser Tout', de: 'Alles Zurücksetzen', pt: 'Redefinir Tudo' },
    copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
    copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié!', de: 'Kopiert!', pt: 'Copiado!' },
    history: { en: 'History', it: 'Cronologia', es: 'Historial', fr: 'Historique', de: 'Verlauf', pt: 'Histórico' },
    increase: { en: 'Increase', it: 'Aumento', es: 'Aumento', fr: 'Augmentation', de: 'Zunahme', pt: 'Aumento' },
    decrease: { en: 'Decrease', it: 'Diminuzione', es: 'Disminución', fr: 'Diminution', de: 'Abnahme', pt: 'Diminuição' },
    result: { en: 'Result', it: 'Risultato', es: 'Resultado', fr: 'Résultat', de: 'Ergebnis', pt: 'Resultado' },
  } as Record<string, Record<Locale, string>>;

  const r1 = val1 && pct1 ? ((parseFloat(pct1) / 100) * parseFloat(val1)).toFixed(2) : '';
  const r2 = val2a && val2b && parseFloat(val2b) !== 0 ? ((parseFloat(val2a) / parseFloat(val2b)) * 100).toFixed(2) : '';
  const r3raw = val3a && val3b && parseFloat(val3a) !== 0 ? ((parseFloat(val3b) - parseFloat(val3a)) / parseFloat(val3a)) * 100 : null;
  const r3 = r3raw !== null ? r3raw.toFixed(2) : '';

  const copyResult = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const saveToHistory = (type: string, input: string, result: string) => {
    setHistory(prev => [{ type, input, result }, ...prev].slice(0, 5));
  };

  const resetAll = () => {
    setVal1(''); setPct1(''); setVal2a(''); setVal2b(''); setVal3a(''); setVal3b('');
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="percentage-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="space-y-6">
          {/* Calculator 1: X% of Y */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="text-gray-700 font-medium">{labels.whatIs[lang]}</span>
              <input type="number" value={pct1} onChange={(e) => setPct1(e.target.value)} className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="10" />
              <span className="text-gray-700">% {labels.of[lang]}</span>
              <input type="number" value={val1} onChange={(e) => setVal1(e.target.value)} className="w-28 border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="200" />
            </div>
            {r1 && (
              <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔢</span>
                  <div>
                    <p className="text-xs text-blue-600 font-medium">{labels.result[lang]}</p>
                    <p className="text-xl font-bold text-blue-700">{r1}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => copyResult('r1', r1)} className="px-3 py-1 text-xs rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                    {copied === 'r1' ? labels.copied[lang] : labels.copy[lang]}
                  </button>
                  <button onClick={() => saveToHistory('% of', `${pct1}% of ${val1}`, r1)} className="px-3 py-1 text-xs rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Calculator 2: X is what % of Y */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <input type="number" value={val2a} onChange={(e) => setVal2a(e.target.value)} className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="50" />
              <span className="text-gray-700 font-medium">{labels.isWhatPct[lang]}</span>
              <input type="number" value={val2b} onChange={(e) => setVal2b(e.target.value)} className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="200" />
            </div>
            {val2b && parseFloat(val2b) === 0 && (
              <p className="text-red-500 text-sm mb-2">Cannot divide by zero</p>
            )}
            {r2 && (
              <div className="bg-green-50 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  <div>
                    <p className="text-xs text-green-600 font-medium">{labels.result[lang]}</p>
                    <p className="text-xl font-bold text-green-700">{r2}%</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => copyResult('r2', r2 + '%')} className="px-3 py-1 text-xs rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                    {copied === 'r2' ? labels.copied[lang] : labels.copy[lang]}
                  </button>
                  <button onClick={() => saveToHistory('is % of', `${val2a} of ${val2b}`, r2 + '%')} className="px-3 py-1 text-xs rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Calculator 3: Percentage Change */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="text-gray-700 font-medium">{labels.pctChange[lang]}</span>
              <input type="number" value={val3a} onChange={(e) => setVal3a(e.target.value)} className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="100" />
              <span className="text-gray-700">{labels.to[lang]}</span>
              <input type="number" value={val3b} onChange={(e) => setVal3b(e.target.value)} className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="150" />
            </div>
            {val3a && parseFloat(val3a) === 0 && (
              <p className="text-red-500 text-sm mb-2">Cannot divide by zero</p>
            )}
            {r3 && r3raw !== null && (
              <div className={`rounded-lg p-3 flex items-center justify-between ${r3raw >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{r3raw >= 0 ? '📈' : '📉'}</span>
                  <div>
                    <p className={`text-xs font-medium ${r3raw >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {r3raw >= 0 ? labels.increase[lang] : labels.decrease[lang]}
                    </p>
                    <p className={`text-xl font-bold ${r3raw >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {r3raw >= 0 ? '+' : ''}{r3}%
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => copyResult('r3', (r3raw >= 0 ? '+' : '') + r3 + '%')} className={`px-3 py-1 text-xs rounded-lg transition-colors ${r3raw >= 0 ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                    {copied === 'r3' ? labels.copied[lang] : labels.copy[lang]}
                  </button>
                  <button onClick={() => saveToHistory('change', `${val3a} -> ${val3b}`, (r3raw >= 0 ? '+' : '') + r3 + '%')} className={`px-3 py-1 text-xs rounded-lg transition-colors ${r3raw >= 0 ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reset Button */}
        <div className="mt-4 flex justify-end">
          <button onClick={resetAll} className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
            {labels.reset[lang]}
          </button>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">{labels.history[lang]}</h3>
            <div className="space-y-2">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">
                    <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs mr-2">{h.type}</span>
                    {h.input}
                  </span>
                  <span className="font-semibold text-gray-900">{h.result}</span>
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
