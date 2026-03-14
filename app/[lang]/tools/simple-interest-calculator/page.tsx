'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface HistoryEntry {
  principal: number;
  rate: number;
  time: number;
  timeUnit: string;
  interest: number;
  total: number;
  timestamp: string;
}

const labels: Record<string, Record<string, string>> = {
  principal: { en: 'Principal Amount', it: 'Capitale Iniziale', es: 'Capital Inicial', fr: 'Capital Initial', de: 'Anfangskapital', pt: 'Capital Inicial' },
  rate: { en: 'Annual Interest Rate (%)', it: 'Tasso di Interesse Annuale (%)', es: 'Tasa de Interés Anual (%)', fr: 'Taux d\'Intérêt Annuel (%)', de: 'Jährlicher Zinssatz (%)', pt: 'Taxa de Juros Anual (%)' },
  time: { en: 'Time Period', it: 'Periodo di Tempo', es: 'Período de Tiempo', fr: 'Période de Temps', de: 'Zeitraum', pt: 'Período de Tempo' },
  years: { en: 'Years', it: 'Anni', es: 'Años', fr: 'Années', de: 'Jahre', pt: 'Anos' },
  months: { en: 'Months', it: 'Mesi', es: 'Meses', fr: 'Mois', de: 'Monate', pt: 'Meses' },
  calculate: { en: 'Calculate', it: 'Calcola', es: 'Calcular', fr: 'Calculer', de: 'Berechnen', pt: 'Calcular' },
  reset: { en: 'Reset', it: 'Reimposta', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  simpleInterest: { en: 'Simple Interest Earned', it: 'Interesse Semplice Maturato', es: 'Interés Simple Ganado', fr: 'Intérêt Simple Gagné', de: 'Einfacher Zinsertrag', pt: 'Juros Simples Ganhos' },
  totalAmount: { en: 'Total Amount', it: 'Importo Totale', es: 'Monto Total', fr: 'Montant Total', de: 'Gesamtbetrag', pt: 'Montante Total' },
  formula: { en: 'Formula: SI = P × R × T / 100', it: 'Formula: IS = P × R × T / 100', es: 'Fórmula: IS = P × R × T / 100', fr: 'Formule : IS = P × R × T / 100', de: 'Formel: EZ = P × R × T / 100', pt: 'Fórmula: JS = P × R × T / 100' },
  breakdown: { en: 'Year-by-Year Breakdown', it: 'Dettaglio Anno per Anno', es: 'Desglose Año por Año', fr: 'Détail Année par Année', de: 'Jährliche Aufschlüsselung', pt: 'Detalhamento Ano a Ano' },
  year: { en: 'Year', it: 'Anno', es: 'Año', fr: 'Année', de: 'Jahr', pt: 'Ano' },
  interestEarned: { en: 'Interest Earned', it: 'Interessi Maturati', es: 'Interés Ganado', fr: 'Intérêts Gagnés', de: 'Zinserträge', pt: 'Juros Ganhos' },
  cumulativeInterest: { en: 'Cumulative Interest', it: 'Interessi Cumulativi', es: 'Interés Acumulado', fr: 'Intérêts Cumulés', de: 'Kumulative Zinsen', pt: 'Juros Acumulados' },
  balance: { en: 'Balance', it: 'Saldo', es: 'Saldo', fr: 'Solde', de: 'Guthaben', pt: 'Saldo' },
  copy: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier les Résultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
  copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié!', de: 'Kopiert!', pt: 'Copiado!' },
  history: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
  monthlyInterest: { en: 'Monthly Interest', it: 'Interesse Mensile', es: 'Interés Mensual', fr: 'Intérêt Mensuel', de: 'Monatlicher Zins', pt: 'Juros Mensais' },
  dailyInterest: { en: 'Daily Interest', it: 'Interesse Giornaliero', es: 'Interés Diario', fr: 'Intérêt Quotidien', de: 'Täglicher Zins', pt: 'Juros Diários' },
};

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: {
    title: 'Simple Interest Calculator: Understand Basic Interest Earnings',
    paragraphs: [
      'Simple interest is one of the most fundamental concepts in finance. Unlike compound interest, where interest is earned on both the principal and accumulated interest, simple interest is calculated only on the original principal amount. This makes it straightforward to compute and understand, which is why it is commonly used for short-term loans, auto loans, and some types of bonds and certificates of deposit.',
      'The formula for simple interest is SI = P x R x T / 100, where P is the principal amount, R is the annual interest rate as a percentage, and T is the time in years. For example, if you invest $10,000 at 5% annual interest for 3 years, the simple interest earned would be $10,000 x 5 x 3 / 100 = $1,500, giving you a total of $11,500 at the end of the period.',
      'Our simple interest calculator supports both years and months as input for the time period. When you enter months, the calculator automatically converts them to years for the formula. It also provides a year-by-year breakdown table so you can see how your interest accumulates over time. Additionally, it shows your monthly and daily interest earnings, which can be useful for budgeting and financial planning purposes.',
      'Simple interest is particularly relevant for consumer loans where the interest does not compound. Many auto loans, personal loans, and short-term financing arrangements use simple interest calculations. Understanding the difference between simple and compound interest helps you make better financial decisions, whether you are borrowing money or investing it. Use this calculator to quickly estimate your interest earnings or costs for any principal amount, rate, and time period.'
    ],
    faq: [
      { q: 'What is the difference between simple interest and compound interest?', a: 'Simple interest is calculated only on the original principal amount throughout the entire term. Compound interest is calculated on the principal plus any previously earned interest. Over longer periods, compound interest yields significantly more because you earn interest on your interest.' },
      { q: 'When is simple interest used in real life?', a: 'Simple interest is commonly used for auto loans, short-term personal loans, some bonds, certificates of deposit, and consumer installment loans. It is also used in some savings accounts and treasury bills. When a loan uses simple interest, the interest cost is fixed and predictable.' },
      { q: 'How do I convert months to years for the simple interest formula?', a: 'Divide the number of months by 12. For example, 18 months equals 1.5 years. Our calculator handles this conversion automatically when you select months as the time unit, so you do not need to do the math yourself.' },
      { q: 'Can simple interest be applied to loans as well as investments?', a: 'Yes. The simple interest formula works identically for both. For investments, the interest represents your earnings. For loans, it represents the cost of borrowing. The formula SI = P x R x T / 100 applies in both cases.' },
      { q: 'Is simple interest always less than compound interest?', a: 'For periods longer than one compounding cycle, yes. Simple interest grows linearly while compound interest grows exponentially. However, for very short periods or when the compounding frequency is low, the difference can be negligible.' }
    ]
  },
  it: {
    title: 'Calcolatore Interesse Semplice: Comprendi i Guadagni Base degli Interessi',
    paragraphs: [
      'L\'interesse semplice è uno dei concetti più fondamentali della finanza. A differenza dell\'interesse composto, dove gli interessi maturano sia sul capitale che sugli interessi accumulati, l\'interesse semplice viene calcolato solo sull\'importo del capitale originale. Questo lo rende semplice da calcolare e comprendere, motivo per cui è comunemente usato per prestiti a breve termine, prestiti auto e alcuni tipi di obbligazioni e certificati di deposito.',
      'La formula per l\'interesse semplice è IS = P x R x T / 100, dove P è il capitale, R è il tasso di interesse annuale in percentuale e T è il tempo in anni. Ad esempio, se investi 10.000 € al 5% di interesse annuo per 3 anni, l\'interesse semplice maturato sarà 10.000 x 5 x 3 / 100 = 1.500 €, per un totale di 11.500 € alla fine del periodo.',
      'Il nostro calcolatore di interesse semplice supporta sia anni che mesi come input per il periodo di tempo. Quando inserisci i mesi, il calcolatore li converte automaticamente in anni per la formula. Fornisce inoltre una tabella di dettaglio anno per anno così puoi vedere come si accumulano i tuoi interessi nel tempo. Mostra anche i guadagni giornalieri e mensili degli interessi.',
      'L\'interesse semplice è particolarmente rilevante per i prestiti al consumo dove gli interessi non si capitalizzano. Molti prestiti auto, prestiti personali e finanziamenti a breve termine utilizzano calcoli di interesse semplice. Comprendere la differenza tra interesse semplice e composto ti aiuta a prendere decisioni finanziarie migliori.'
    ],
    faq: [
      { q: 'Qual è la differenza tra interesse semplice e interesse composto?', a: 'L\'interesse semplice si calcola solo sul capitale originale per l\'intera durata. L\'interesse composto si calcola sul capitale più gli interessi precedentemente maturati. Su periodi più lunghi, l\'interesse composto genera significativamente di più.' },
      { q: 'Quando viene usato l\'interesse semplice nella vita reale?', a: 'L\'interesse semplice è comunemente usato per prestiti auto, prestiti personali a breve termine, alcune obbligazioni, certificati di deposito e prestiti rateali al consumo. È anche usato in alcuni conti di risparmio e buoni del tesoro.' },
      { q: 'Come si convertono i mesi in anni per la formula dell\'interesse semplice?', a: 'Dividi il numero di mesi per 12. Ad esempio, 18 mesi equivalgono a 1,5 anni. Il nostro calcolatore gestisce questa conversione automaticamente quando selezioni i mesi come unità di tempo.' },
      { q: 'L\'interesse semplice si applica sia ai prestiti che agli investimenti?', a: 'Sì. La formula dell\'interesse semplice funziona identicamente per entrambi. Per gli investimenti, l\'interesse rappresenta i tuoi guadagni. Per i prestiti, rappresenta il costo del prestito.' },
      { q: 'L\'interesse semplice è sempre inferiore all\'interesse composto?', a: 'Per periodi superiori a un ciclo di capitalizzazione, sì. L\'interesse semplice cresce linearmente mentre quello composto cresce esponenzialmente. Per periodi molto brevi, la differenza può essere trascurabile.' }
    ]
  },
  es: {
    title: 'Calculadora de Interés Simple: Entiende las Ganancias Básicas de Intereses',
    paragraphs: [
      'El interés simple es uno de los conceptos más fundamentales en finanzas. A diferencia del interés compuesto, donde los intereses se generan tanto sobre el capital como sobre los intereses acumulados, el interés simple se calcula solo sobre el monto del capital original. Esto lo hace sencillo de calcular y entender, razón por la cual se usa comúnmente para préstamos a corto plazo, préstamos de auto y algunos tipos de bonos.',
      'La fórmula del interés simple es IS = P x R x T / 100, donde P es el capital, R es la tasa de interés anual como porcentaje y T es el tiempo en años. Por ejemplo, si inviertes $10,000 al 5% de interés anual por 3 años, el interés simple ganado sería $10,000 x 5 x 3 / 100 = $1,500, dándote un total de $11,500 al final del período.',
      'Nuestra calculadora de interés simple soporta tanto años como meses como entrada para el período de tiempo. Cuando ingresas meses, la calculadora los convierte automáticamente a años. También proporciona una tabla de desglose año por año para que puedas ver cómo se acumulan tus intereses con el tiempo, además de mostrar las ganancias de intereses mensuales y diarias.',
      'El interés simple es particularmente relevante para préstamos de consumo donde los intereses no se capitalizan. Muchos préstamos de auto, préstamos personales y financiamientos a corto plazo utilizan cálculos de interés simple. Comprender la diferencia entre interés simple y compuesto te ayuda a tomar mejores decisiones financieras.'
    ],
    faq: [
      { q: '¿Cuál es la diferencia entre interés simple e interés compuesto?', a: 'El interés simple se calcula solo sobre el capital original durante todo el plazo. El interés compuesto se calcula sobre el capital más los intereses previamente ganados. En períodos más largos, el interés compuesto genera significativamente más.' },
      { q: '¿Cuándo se usa el interés simple en la vida real?', a: 'El interés simple se usa comúnmente para préstamos de auto, préstamos personales a corto plazo, algunos bonos, certificados de depósito y préstamos a plazos de consumo.' },
      { q: '¿Cómo convierto meses a años para la fórmula de interés simple?', a: 'Divide el número de meses entre 12. Por ejemplo, 18 meses equivalen a 1.5 años. Nuestra calculadora maneja esta conversión automáticamente cuando seleccionas meses como unidad de tiempo.' },
      { q: '¿El interés simple se aplica tanto a préstamos como a inversiones?', a: 'Sí. La fórmula del interés simple funciona de manera idéntica para ambos. Para inversiones, el interés representa tus ganancias. Para préstamos, representa el costo del préstamo.' },
      { q: '¿El interés simple siempre es menor que el interés compuesto?', a: 'Para períodos mayores a un ciclo de capitalización, sí. El interés simple crece linealmente mientras que el compuesto crece exponencialmente.' }
    ]
  },
  fr: {
    title: 'Calculateur d\'Intérêt Simple : Comprendre les Gains d\'Intérêts de Base',
    paragraphs: [
      'L\'intérêt simple est l\'un des concepts les plus fondamentaux en finance. Contrairement à l\'intérêt composé, où les intérêts sont calculés sur le capital et les intérêts accumulés, l\'intérêt simple est calculé uniquement sur le montant du capital initial. Cela le rend simple à calculer et à comprendre, c\'est pourquoi il est couramment utilisé pour les prêts à court terme, les prêts automobiles et certains types d\'obligations.',
      'La formule de l\'intérêt simple est IS = P x R x T / 100, où P est le capital, R est le taux d\'intérêt annuel en pourcentage et T est le temps en années. Par exemple, si vous investissez 10 000 € à 5% d\'intérêt annuel pendant 3 ans, l\'intérêt simple gagné serait de 10 000 x 5 x 3 / 100 = 1 500 €, soit un total de 11 500 € à la fin de la période.',
      'Notre calculateur d\'intérêt simple prend en charge les années et les mois comme entrée pour la période. Lorsque vous saisissez des mois, le calculateur les convertit automatiquement en années. Il fournit également un tableau détaillé année par année pour voir l\'accumulation des intérêts, ainsi que les gains d\'intérêts mensuels et quotidiens.',
      'L\'intérêt simple est particulièrement pertinent pour les prêts à la consommation où les intérêts ne se capitalisent pas. De nombreux prêts automobiles, prêts personnels et financements à court terme utilisent des calculs d\'intérêt simple. Comprendre la différence entre intérêt simple et composé vous aide à prendre de meilleures décisions financières.'
    ],
    faq: [
      { q: 'Quelle est la différence entre intérêt simple et intérêt composé ?', a: 'L\'intérêt simple est calculé uniquement sur le capital initial pendant toute la durée. L\'intérêt composé est calculé sur le capital plus les intérêts précédemment gagnés. Sur de longues périodes, l\'intérêt composé génère significativement plus.' },
      { q: 'Quand l\'intérêt simple est-il utilisé dans la vie réelle ?', a: 'L\'intérêt simple est couramment utilisé pour les prêts automobiles, les prêts personnels à court terme, certaines obligations, les certificats de dépôt et les prêts à tempérament.' },
      { q: 'Comment convertir des mois en années pour la formule ?', a: 'Divisez le nombre de mois par 12. Par exemple, 18 mois équivalent à 1,5 an. Notre calculateur gère cette conversion automatiquement lorsque vous sélectionnez les mois.' },
      { q: 'L\'intérêt simple s\'applique-t-il aux prêts et aux investissements ?', a: 'Oui. La formule fonctionne de manière identique pour les deux. Pour les investissements, l\'intérêt représente vos gains. Pour les prêts, il représente le coût de l\'emprunt.' },
      { q: 'L\'intérêt simple est-il toujours inférieur à l\'intérêt composé ?', a: 'Pour des périodes supérieures à un cycle de capitalisation, oui. L\'intérêt simple croît linéairement tandis que le composé croît exponentiellement.' }
    ]
  },
  de: {
    title: 'Einfacher Zinsrechner: Grundlegende Zinserträge Verstehen',
    paragraphs: [
      'Einfacher Zins ist eines der grundlegendsten Konzepte im Finanzwesen. Im Gegensatz zum Zinseszins, bei dem Zinsen sowohl auf das Kapital als auch auf angesammelte Zinsen berechnet werden, wird einfacher Zins nur auf den ursprünglichen Kapitalbetrag berechnet. Dies macht ihn einfach zu berechnen und zu verstehen, weshalb er häufig für kurzfristige Kredite, Autokredite und einige Arten von Anleihen verwendet wird.',
      'Die Formel für einfachen Zins lautet EZ = P x R x T / 100, wobei P das Kapital ist, R der jährliche Zinssatz in Prozent und T die Zeit in Jahren. Wenn Sie beispielsweise 10.000 € bei 5% Jahreszins für 3 Jahre anlegen, beträgt der einfache Zins 10.000 x 5 x 3 / 100 = 1.500 €, was Ihnen am Ende des Zeitraums insgesamt 11.500 € ergibt.',
      'Unser einfacher Zinsrechner unterstützt sowohl Jahre als auch Monate als Eingabe für den Zeitraum. Bei Eingabe von Monaten rechnet der Rechner diese automatisch in Jahre um. Er bietet zudem eine jährliche Aufschlüsselungstabelle, damit Sie sehen können, wie sich Ihre Zinsen im Laufe der Zeit ansammeln, sowie monatliche und tägliche Zinserträge.',
      'Einfacher Zins ist besonders relevant für Verbraucherkredite, bei denen sich die Zinsen nicht aufzinsen. Viele Autokredite, Privatkredite und kurzfristige Finanzierungen verwenden einfache Zinsberechnungen. Das Verständnis des Unterschieds zwischen einfachem Zins und Zinseszins hilft Ihnen, bessere finanzielle Entscheidungen zu treffen.'
    ],
    faq: [
      { q: 'Was ist der Unterschied zwischen einfachem Zins und Zinseszins?', a: 'Einfacher Zins wird nur auf das ursprüngliche Kapital während der gesamten Laufzeit berechnet. Zinseszins wird auf das Kapital plus zuvor verdiente Zinsen berechnet. Über längere Zeiträume erzielt Zinseszins deutlich mehr.' },
      { q: 'Wann wird einfacher Zins im echten Leben verwendet?', a: 'Einfacher Zins wird häufig für Autokredite, kurzfristige Privatkredite, einige Anleihen, Einlagenzertifikate und Ratenkredite verwendet.' },
      { q: 'Wie rechne ich Monate in Jahre um?', a: 'Teilen Sie die Anzahl der Monate durch 12. Zum Beispiel entsprechen 18 Monate 1,5 Jahren. Unser Rechner führt diese Umrechnung automatisch durch.' },
      { q: 'Gilt einfacher Zins sowohl für Kredite als auch für Investitionen?', a: 'Ja. Die Formel funktioniert für beides identisch. Bei Investitionen stellt der Zins Ihre Erträge dar. Bei Krediten stellt er die Kosten der Kreditaufnahme dar.' },
      { q: 'Ist einfacher Zins immer weniger als Zinseszins?', a: 'Für Zeiträume länger als ein Aufzinsungszyklus, ja. Einfacher Zins wächst linear, während Zinseszins exponentiell wächst.' }
    ]
  },
  pt: {
    title: 'Calculadora de Juros Simples: Entenda os Ganhos Básicos de Juros',
    paragraphs: [
      'Os juros simples são um dos conceitos mais fundamentais em finanças. Diferente dos juros compostos, onde os juros são calculados tanto sobre o capital quanto sobre os juros acumulados, os juros simples são calculados apenas sobre o valor do capital original. Isso os torna simples de calcular e entender, razão pela qual são comumente usados para empréstimos de curto prazo, empréstimos de automóveis e alguns tipos de títulos.',
      'A fórmula dos juros simples é JS = P x R x T / 100, onde P é o capital, R é a taxa de juros anual como percentagem e T é o tempo em anos. Por exemplo, se investir 10.000 € a 5% de juros anuais por 3 anos, os juros simples ganhos seriam 10.000 x 5 x 3 / 100 = 1.500 €, dando-lhe um total de 11.500 € no final do período.',
      'A nossa calculadora de juros simples suporta tanto anos como meses como entrada para o período de tempo. Quando insere meses, a calculadora converte-os automaticamente em anos. Também fornece uma tabela de detalhamento ano a ano para ver como os juros se acumulam, além de mostrar os ganhos de juros mensais e diários.',
      'Os juros simples são particularmente relevantes para empréstimos ao consumidor onde os juros não se capitalizam. Muitos empréstimos de automóveis, empréstimos pessoais e financiamentos de curto prazo utilizam cálculos de juros simples. Compreender a diferença entre juros simples e compostos ajuda a tomar melhores decisões financeiras.'
    ],
    faq: [
      { q: 'Qual é a diferença entre juros simples e juros compostos?', a: 'Os juros simples são calculados apenas sobre o capital original durante todo o prazo. Os juros compostos são calculados sobre o capital mais os juros anteriormente ganhos. Em períodos mais longos, os juros compostos geram significativamente mais.' },
      { q: 'Quando são usados os juros simples na vida real?', a: 'Os juros simples são comumente usados para empréstimos de automóveis, empréstimos pessoais de curto prazo, alguns títulos, certificados de depósito e empréstimos a prestações.' },
      { q: 'Como converter meses em anos para a fórmula?', a: 'Divida o número de meses por 12. Por exemplo, 18 meses equivalem a 1,5 anos. A nossa calculadora lida com esta conversão automaticamente quando seleciona meses.' },
      { q: 'Os juros simples aplicam-se tanto a empréstimos como a investimentos?', a: 'Sim. A fórmula funciona de forma idêntica para ambos. Para investimentos, os juros representam os seus ganhos. Para empréstimos, representam o custo do empréstimo.' },
      { q: 'Os juros simples são sempre menores que os juros compostos?', a: 'Para períodos superiores a um ciclo de capitalização, sim. Os juros simples crescem linearmente enquanto os compostos crescem exponencialmente.' }
    ]
  },
};

export default function SimpleInterestCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['simple-interest-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState('');
  const [timeUnit, setTimeUnit] = useState<'years' | 'months'>('years');
  const [result, setResult] = useState<{ interest: number; total: number; monthly: number; daily: number; breakdown: { year: number; interest: number; cumulative: number; balance: number }[] } | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const calculate = () => {
    const P = parseFloat(principal);
    const R = parseFloat(rate);
    const T = parseFloat(time);
    if (isNaN(P) || isNaN(R) || isNaN(T) || P <= 0 || R < 0 || T <= 0) return;

    const timeInYears = timeUnit === 'months' ? T / 12 : T;
    const interest = (P * R * timeInYears) / 100;
    const total = P + interest;
    const monthly = interest / (timeInYears * 12);
    const daily = interest / (timeInYears * 365);

    const breakdown: { year: number; interest: number; cumulative: number; balance: number }[] = [];
    const fullYears = Math.ceil(timeInYears);
    const yearlyInterest = (P * R) / 100;

    for (let y = 1; y <= fullYears; y++) {
      const effectiveYear = y <= timeInYears ? 1 : timeInYears - Math.floor(timeInYears);
      const yearInterest = yearlyInterest * effectiveYear;
      const cumulative = y <= Math.floor(timeInYears) ? yearlyInterest * y : interest;
      breakdown.push({
        year: y,
        interest: yearInterest,
        cumulative,
        balance: P + cumulative,
      });
    }

    setResult({ interest, total, monthly, daily, breakdown });
    setHistory(prev => [{
      principal: P,
      rate: R,
      time: T,
      timeUnit: t(timeUnit),
      interest,
      total,
      timestamp: new Date().toLocaleTimeString(),
    }, ...prev].slice(0, 5));
  };

  const handleReset = () => {
    setPrincipal('');
    setRate('');
    setTime('');
    setTimeUnit('years');
    setResult(null);
  };

  const copyResults = () => {
    if (!result) return;
    const text = `${t('simpleInterest')}: $${result.interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n${t('totalAmount')}: $${result.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="simple-interest-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Formula display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <span className="text-sm font-mono font-medium text-blue-700">{t('formula')}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('principal')}</label>
            <input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="10000"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('rate')}</label>
            <input type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="5"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('time')}</label>
            <div className="flex gap-2">
              <input type="number" value={time} onChange={(e) => setTime(e.target.value)} placeholder="3"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button onClick={() => setTimeUnit('years')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${timeUnit === 'years' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                  {t('years')}
                </button>
                <button onClick={() => setTimeUnit('months')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${timeUnit === 'months' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                  {t('months')}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={calculate} className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2.5 font-medium hover:bg-blue-700 transition-colors">{t('calculate')}</button>
            <button onClick={handleReset} className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>

          {result && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <div className="text-xs text-green-600 font-medium mt-1">{t('simpleInterest')}</div>
                  <div className="text-2xl font-bold text-green-700">${result.interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <div className="text-xs text-blue-600 font-medium mt-1">{t('totalAmount')}</div>
                  <div className="text-2xl font-bold text-blue-700">${result.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500 font-medium">{t('monthlyInterest')}</div>
                  <div className="text-lg font-bold text-gray-900">${result.monthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500 font-medium">{t('dailyInterest')}</div>
                  <div className="text-lg font-bold text-gray-900">${result.daily.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              </div>

              {/* Interest vs Principal bar */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{t('principal')}</span>
                  <span>{t('simpleInterest')}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden flex">
                  <div className="h-full bg-blue-500" style={{ width: `${(parseFloat(principal) / result.total) * 100}%` }}></div>
                  <div className="h-full bg-green-400" style={{ width: `${(result.interest / result.total) * 100}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span className="text-blue-600">{((parseFloat(principal) / result.total) * 100).toFixed(1)}%</span>
                  <span className="text-green-600">{((result.interest / result.total) * 100).toFixed(1)}%</span>
                </div>
              </div>

              <button onClick={copyResults} className="w-full py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                {copied ? (
                  <><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{t('copied')}</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>{t('copy')}</>
                )}
              </button>

              {result.breakdown.length > 1 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('breakdown')}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-2 py-1 text-left">{t('year')}</th>
                          <th className="px-2 py-1 text-right">{t('interestEarned')}</th>
                          <th className="px-2 py-1 text-right">{t('cumulativeInterest')}</th>
                          <th className="px-2 py-1 text-right">{t('balance')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.breakdown.map((row) => (
                          <tr key={row.year} className="border-t border-gray-100">
                            <td className="px-2 py-1">{row.year}</td>
                            <td className="px-2 py-1 text-right text-green-600">${row.interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-2 py-1 text-right text-blue-600">${row.cumulative.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-2 py-1 text-right">${row.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('history')}</h3>
              <div className="space-y-1">
                {history.map((entry, i) => (
                  <div key={i} className="flex justify-between text-sm text-gray-600 bg-white rounded px-3 py-1.5 border border-gray-100">
                    <span>${entry.principal.toLocaleString()} @ {entry.rate}% / {entry.time} {entry.timeUnit}</span>
                    <span className="font-semibold text-green-600">${entry.interest.toFixed(2)}</span>
                    <span className="text-gray-400">{entry.timestamp}</span>
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