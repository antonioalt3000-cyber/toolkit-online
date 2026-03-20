'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  principal: { en: 'Principal Amount', it: 'Capitale Iniziale', es: 'Capital Inicial', fr: 'Capital Initial', de: 'Anfangskapital', pt: 'Capital Inicial' },
  rate: { en: 'Annual Interest Rate (%)', it: 'Tasso di Interesse Annuale (%)', es: 'Tasa de Interés Anual (%)', fr: 'Taux d\'Intérêt Annuel (%)', de: 'Jährlicher Zinssatz (%)', pt: 'Taxa de Juros Anual (%)' },
  time: { en: 'Time (years)', it: 'Tempo (anni)', es: 'Tiempo (años)', fr: 'Durée (années)', de: 'Zeitraum (Jahre)', pt: 'Tempo (anos)' },
  frequency: { en: 'Compounding Frequency', it: 'Frequenza di Capitalizzazione', es: 'Frecuencia de Capitalización', fr: 'Fréquence de Capitalisation', de: 'Zinseszinshäufigkeit', pt: 'Frequência de Capitalização' },
  annually: { en: 'Annually', it: 'Annuale', es: 'Anual', fr: 'Annuel', de: 'Jährlich', pt: 'Anual' },
  semiannually: { en: 'Semi-Annually', it: 'Semestrale', es: 'Semestral', fr: 'Semestriel', de: 'Halbjährlich', pt: 'Semestral' },
  quarterly: { en: 'Quarterly', it: 'Trimestrale', es: 'Trimestral', fr: 'Trimestriel', de: 'Vierteljährlich', pt: 'Trimestral' },
  monthly: { en: 'Monthly', it: 'Mensile', es: 'Mensual', fr: 'Mensuel', de: 'Monatlich', pt: 'Mensal' },
  daily: { en: 'Daily', it: 'Giornaliero', es: 'Diario', fr: 'Quotidien', de: 'Täglich', pt: 'Diário' },
  calculate: { en: 'Calculate', it: 'Calcola', es: 'Calcular', fr: 'Calculer', de: 'Berechnen', pt: 'Calcular' },
  finalAmount: { en: 'Final Amount', it: 'Importo Finale', es: 'Monto Final', fr: 'Montant Final', de: 'Endbetrag', pt: 'Montante Final' },
  totalInterest: { en: 'Total Interest Earned', it: 'Interessi Totali Maturati', es: 'Interés Total Ganado', fr: 'Intérêts Totaux Gagnés', de: 'Gesamtzinsen', pt: 'Juros Totais Ganhos' },
  yearBreakdown: { en: 'Year-by-Year Breakdown', it: 'Dettaglio Anno per Anno', es: 'Desglose Año por Año', fr: 'Détail Année par Année', de: 'Jährliche Aufschlüsselung', pt: 'Detalhamento Ano a Ano' },
  year: { en: 'Year', it: 'Anno', es: 'Año', fr: 'Année', de: 'Jahr', pt: 'Ano' },
  balance: { en: 'Balance', it: 'Saldo', es: 'Saldo', fr: 'Solde', de: 'Guthaben', pt: 'Saldo' },
  interestEarned: { en: 'Interest Earned', it: 'Interessi Maturati', es: 'Interés Ganado', fr: 'Intérêts Gagnés', de: 'Zinserträge', pt: 'Juros Ganhos' },
};

export default function CompoundInterestCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['compound-interest-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [principal, setPrincipal] = useState('10000');
  const [rate, setRate] = useState('5');
  const [time, setTime] = useState('10');
  const [frequency, setFrequency] = useState('12');
  const [result, setResult] = useState<{ finalAmount: number; totalInterest: number; breakdown: { year: number; balance: number; interest: number }[] } | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ principal: number; rate: number; years: number; finalAmount: number }[]>([]);

  const calculate = () => {
    const P = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const tVal = parseInt(time);
    const n = parseInt(frequency);
    if (isNaN(P) || isNaN(r) || isNaN(tVal) || isNaN(n) || P <= 0 || tVal <= 0) return;

    const breakdown: { year: number; balance: number; interest: number }[] = [];
    let prevBalance = P;

    for (let y = 1; y <= tVal; y++) {
      const balance = P * Math.pow(1 + r / n, n * y);
      breakdown.push({ year: y, balance, interest: balance - prevBalance });
      prevBalance = balance;
    }

    const finalAmount = P * Math.pow(1 + r / n, n * tVal);
    setResult({ finalAmount, totalInterest: finalAmount - P, breakdown });
    setHistory(prev => [{ principal: P, rate: parseFloat(rate), years: tVal, finalAmount }, ...prev].slice(0, 5));
  };

  const handleReset = () => { setPrincipal('10000'); setRate('5'); setTime('10'); setFrequency('12'); setResult(null); };
  const copyResults = () => {
    if (!result) return;
    const text = `${t('finalAmount')}: $${result.finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n${t('totalInterest')}: $${result.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const freqOptions = [
    { value: '1', label: t('annually') },
    { value: '2', label: t('semiannually') },
    { value: '4', label: t('quarterly') },
    { value: '12', label: t('monthly') },
    { value: '365', label: t('daily') },
  ];

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Compound Interest Calculator: Grow Your Wealth Over Time',
      paragraphs: [
        'Compound interest is often called the eighth wonder of the world. Unlike simple interest, which only earns interest on the original principal, compound interest earns interest on both the principal and previously accumulated interest. This exponential growth effect means your money grows faster the longer it stays invested, making it a cornerstone of long-term wealth building.',
        'Our compound interest calculator lets you input your initial principal amount, annual interest rate, investment duration in years, and compounding frequency. The compounding frequency determines how often interest is calculated and added to the principal. Common options include annually, semi-annually, quarterly, monthly, and daily. The more frequently interest compounds, the more you earn over time.',
        'The formula used is A = P(1 + r/n)^(nt), where A is the final amount, P is the principal, r is the annual rate, n is compounding frequency per year, and t is time in years. This standard formula is used by banks, financial advisors, and investment platforms worldwide to project growth of savings accounts, certificates of deposit, and investment portfolios.',
        'The year-by-year breakdown table shows exactly how your investment grows each year. You can see the balance at the end of each year and the interest earned during that year. This transparency helps you understand the power of compounding: early years show modest gains, but later years show dramatically larger interest amounts as the compounding effect accelerates. Whether you are planning retirement savings, an education fund, or a general investment strategy, understanding compound interest is essential for making informed financial decisions.',
        'If you are saving for retirement, try our <a href="/${lang}/tools/retirement-calculator">retirement calculator</a> to project your total savings with inflation adjustments and the 4% rule. If you are comparing mortgage or loan options, use our <a href="/${lang}/tools/mortgage-calculator">mortgage calculator</a> or <a href="/${lang}/tools/loan-calculator">loan calculator</a> to see how interest works on the borrowing side.'
      ],
      faq: [
        { q: 'What is the difference between simple and compound interest?', a: 'Simple interest is calculated only on the original principal amount. Compound interest is calculated on the principal plus any previously earned interest. Over time, compound interest generates significantly more returns because you earn interest on your interest.' },
        { q: 'How does compounding frequency affect my returns?', a: 'The more frequently interest compounds, the more you earn. Daily compounding yields slightly more than monthly, which yields more than quarterly, and so on. However, the difference between daily and monthly compounding is typically small for moderate interest rates.' },
        { q: 'Can I use this calculator for loan interest?', a: 'Yes. The compound interest formula works the same way for loans. Enter the loan amount as principal, the loan interest rate, and the loan term. The final amount shows what you would owe including all interest, assuming no payments are made.' },
        { q: 'What interest rate should I use for savings?', a: 'Use the annual percentage yield (APY) offered by your bank or investment. For savings accounts, this is typically 0.5% to 5%. For stock market investments, historical average returns are around 7-10% annually before inflation.' },
        { q: 'Why does the interest earned increase each year?', a: 'Because compound interest calculates interest on the growing balance, not just the original principal. Each year, your balance is larger than the previous year, so the same interest rate generates a larger dollar amount of interest.' }
      ]
    },
    it: {
      title: 'Calcolatore Interesse Composto: Fai Crescere il Tuo Patrimonio nel Tempo',
      paragraphs: [
        'L\'interesse composto viene spesso definito l\'ottava meraviglia del mondo. A differenza dell\'interesse semplice, che matura solo sul capitale iniziale, l\'interesse composto matura sia sul capitale che sugli interessi precedentemente accumulati. Questo effetto di crescita esponenziale significa che il tuo denaro cresce più velocemente quanto più a lungo resta investito, rendendolo una pietra angolare della creazione di ricchezza a lungo termine.',
        'Il nostro calcolatore di interesse composto ti permette di inserire il capitale iniziale, il tasso di interesse annuale, la durata dell\'investimento in anni e la frequenza di capitalizzazione. La frequenza di capitalizzazione determina quanto spesso gli interessi vengono calcolati e aggiunti al capitale. Le opzioni più comuni includono annuale, semestrale, trimestrale, mensile e giornaliero.',
        'La formula utilizzata è A = P(1 + r/n)^(nt), dove A è l\'importo finale, P è il capitale, r è il tasso annuale, n è la frequenza di capitalizzazione e t il tempo in anni. Questa formula standard è utilizzata da banche, consulenti finanziari e piattaforme di investimento in tutto il mondo per proiettare la crescita di conti di risparmio e portafogli di investimento.',
        'La tabella di dettaglio anno per anno mostra esattamente come cresce il tuo investimento. Puoi vedere il saldo alla fine di ogni anno e gli interessi maturati durante quell\'anno. Questa trasparenza ti aiuta a comprendere la potenza della capitalizzazione: i primi anni mostrano guadagni modesti, ma gli anni successivi mostrano importi di interesse drammaticamente più grandi.',
        'Se stai risparmiando per la pensione, prova il nostro <a href="/${lang}/tools/retirement-calculator">calcolatore pensione</a> per proiettare i risparmi totali con adeguamento all\'inflazione. Se confronti opzioni di mutuo o prestito, usa il <a href="/${lang}/tools/mortgage-calculator">calcolatore mutuo</a> o il <a href="/${lang}/tools/loan-calculator">calcolatore prestiti</a> per vedere come funzionano gli interessi lato debito.'
      ],
      faq: [
        { q: 'Qual è la differenza tra interesse semplice e composto?', a: 'L\'interesse semplice si calcola solo sul capitale originale. L\'interesse composto si calcola sul capitale più gli interessi già maturati. Nel tempo, l\'interesse composto genera rendimenti significativamente maggiori.' },
        { q: 'Come influisce la frequenza di capitalizzazione sui rendimenti?', a: 'Più frequentemente si capitalizzano gli interessi, più si guadagna. La capitalizzazione giornaliera rende leggermente di più di quella mensile, che rende più di quella trimestrale. Tuttavia, la differenza tra giornaliera e mensile è tipicamente piccola.' },
        { q: 'Posso usare questo calcolatore per gli interessi di un prestito?', a: 'Sì. La formula dell\'interesse composto funziona allo stesso modo per i prestiti. Inserisci l\'importo del prestito come capitale, il tasso di interesse e la durata.' },
        { q: 'Quale tasso di interesse dovrei usare per i risparmi?', a: 'Usa il rendimento percentuale annuo (APY) offerto dalla tua banca. Per i conti di risparmio è tipicamente tra 0,5% e 5%. Per investimenti in borsa, i rendimenti medi storici sono circa 7-10% annuo.' },
        { q: 'Perché gli interessi maturati aumentano ogni anno?', a: 'Perché l\'interesse composto calcola gli interessi sul saldo crescente, non solo sul capitale originale. Ogni anno il saldo è maggiore dell\'anno precedente, quindi lo stesso tasso genera un importo maggiore di interessi.' }
      ]
    },
    es: {
      title: 'Calculadora de Interés Compuesto: Haz Crecer Tu Patrimonio',
      paragraphs: [
        'El interés compuesto a menudo se llama la octava maravilla del mundo. A diferencia del interés simple, que solo genera intereses sobre el capital original, el interés compuesto genera intereses tanto sobre el capital como sobre los intereses previamente acumulados. Este efecto de crecimiento exponencial significa que tu dinero crece más rápido cuanto más tiempo permanece invertido.',
        'Nuestra calculadora de interés compuesto te permite ingresar el monto del capital inicial, la tasa de interés anual, la duración de la inversión en años y la frecuencia de capitalización. La frecuencia de capitalización determina con qué frecuencia se calculan y se agregan los intereses al capital. Las opciones comunes incluyen anual, semestral, trimestral, mensual y diario.',
        'La fórmula utilizada es A = P(1 + r/n)^(nt), donde A es el monto final, P es el capital, r es la tasa anual, n es la frecuencia de capitalización por año y t es el tiempo en años. Esta fórmula estándar es utilizada por bancos, asesores financieros y plataformas de inversión en todo el mundo.',
        'La tabla de desglose año por año muestra exactamente cómo crece tu inversión cada año. Puedes ver el saldo al final de cada año y los intereses ganados durante ese año. Los primeros años muestran ganancias modestas, pero los años posteriores muestran montos de interés dramáticamente mayores a medida que el efecto compuesto se acelera.',
        'Si ahorras para la jubilación, prueba nuestra <a href="/${lang}/tools/retirement-calculator">calculadora de jubilación</a> para proyectar tus ahorros con ajuste por inflación. Si comparas hipotecas o préstamos, usa nuestra <a href="/${lang}/tools/mortgage-calculator">calculadora de hipoteca</a> o <a href="/${lang}/tools/loan-calculator">calculadora de préstamos</a>.'
      ],
      faq: [
        { q: '¿Cuál es la diferencia entre interés simple y compuesto?', a: 'El interés simple se calcula solo sobre el capital original. El interés compuesto se calcula sobre el capital más los intereses ya ganados. Con el tiempo, el interés compuesto genera rendimientos significativamente mayores.' },
        { q: '¿Cómo afecta la frecuencia de capitalización a mis rendimientos?', a: 'Cuanto más frecuentemente se capitalicen los intereses, más ganas. La capitalización diaria rinde ligeramente más que la mensual, que rinde más que la trimestral. Sin embargo, la diferencia entre diaria y mensual es típicamente pequeña.' },
        { q: '¿Puedo usar esta calculadora para intereses de préstamos?', a: 'Sí. La fórmula del interés compuesto funciona igual para préstamos. Ingresa el monto del préstamo como capital, la tasa de interés y el plazo.' },
        { q: '¿Qué tasa de interés debo usar para ahorros?', a: 'Usa el rendimiento porcentual anual (APY) ofrecido por tu banco. Para cuentas de ahorro es típicamente entre 0,5% y 5%. Para inversiones en bolsa, los rendimientos promedio históricos son alrededor de 7-10% anual.' },
        { q: '¿Por qué los intereses ganados aumentan cada año?', a: 'Porque el interés compuesto calcula intereses sobre el saldo creciente, no solo sobre el capital original. Cada año, tu saldo es mayor que el año anterior.' }
      ]
    },
    fr: {
      title: 'Calculateur d\'Intérêts Composés : Faites Fructifier Votre Patrimoine',
      paragraphs: [
        'Les intérêts composés sont souvent appelés la huitième merveille du monde. Contrairement aux intérêts simples, qui ne rapportent que sur le capital initial, les intérêts composés rapportent sur le capital et sur les intérêts précédemment accumulés. Cet effet de croissance exponentielle signifie que votre argent croît plus vite au fil du temps.',
        'Notre calculateur d\'intérêts composés vous permet de saisir le capital initial, le taux d\'intérêt annuel, la durée de l\'investissement en années et la fréquence de capitalisation. La fréquence de capitalisation détermine à quelle fréquence les intérêts sont calculés et ajoutés au capital. Les options courantes incluent annuel, semestriel, trimestriel, mensuel et quotidien.',
        'La formule utilisée est A = P(1 + r/n)^(nt), où A est le montant final, P le capital, r le taux annuel, n la fréquence de capitalisation par an et t le temps en années. Cette formule standard est utilisée par les banques, conseillers financiers et plateformes d\'investissement du monde entier.',
        'Le tableau détaillé année par année montre exactement comment votre investissement croît. Vous pouvez voir le solde à la fin de chaque année et les intérêts gagnés. Les premières années montrent des gains modestes, mais les années suivantes montrent des montants d\'intérêts considérablement plus importants.',
        'Si vous épargnez pour la retraite, essayez notre <a href="/${lang}/tools/retirement-calculator">calculateur retraite</a> pour projeter votre épargne avec ajustement à l\'inflation. Pour comparer des prêts ou hypothèques, utilisez notre <a href="/${lang}/tools/mortgage-calculator">calculateur hypothécaire</a> ou <a href="/${lang}/tools/loan-calculator">calculateur de prêt</a>.'
      ],
      faq: [
        { q: 'Quelle est la différence entre intérêts simples et composés ?', a: 'Les intérêts simples sont calculés uniquement sur le capital initial. Les intérêts composés sont calculés sur le capital plus les intérêts déjà gagnés. Au fil du temps, les intérêts composés génèrent des rendements nettement supérieurs.' },
        { q: 'Comment la fréquence de capitalisation affecte-t-elle mes rendements ?', a: 'Plus les intérêts sont capitalisés fréquemment, plus vous gagnez. La capitalisation quotidienne rapporte légèrement plus que mensuelle, qui rapporte plus que trimestrielle. La différence entre quotidienne et mensuelle est toutefois généralement faible.' },
        { q: 'Puis-je utiliser ce calculateur pour les intérêts d\'un prêt ?', a: 'Oui. La formule des intérêts composés fonctionne de la même manière pour les prêts. Entrez le montant du prêt comme capital, le taux d\'intérêt et la durée.' },
        { q: 'Quel taux d\'intérêt utiliser pour l\'épargne ?', a: 'Utilisez le taux de rendement annuel proposé par votre banque. Pour les comptes d\'épargne, c\'est typiquement entre 0,5% et 5%. Pour les investissements boursiers, les rendements moyens historiques sont d\'environ 7-10% par an.' },
        { q: 'Pourquoi les intérêts gagnés augmentent-ils chaque année ?', a: 'Parce que les intérêts composés calculent les intérêts sur le solde croissant, pas seulement sur le capital initial. Chaque année, votre solde est plus élevé que l\'année précédente.' }
      ]
    },
    de: {
      title: 'Zinseszinsrechner: Vermögen über die Zeit Aufbauen',
      paragraphs: [
        'Der Zinseszins wird oft als achtes Weltwunder bezeichnet. Im Gegensatz zum einfachen Zins, der nur auf das ursprüngliche Kapital Zinsen generiert, generiert der Zinseszins Zinsen sowohl auf das Kapital als auch auf zuvor angesammelte Zinsen. Dieser exponentielle Wachstumseffekt bedeutet, dass Ihr Geld schneller wächst, je länger es investiert bleibt.',
        'Unser Zinseszinsrechner ermöglicht die Eingabe des Anfangskapitals, des jährlichen Zinssatzes, der Investitionsdauer in Jahren und der Zinseszinshäufigkeit. Die Häufigkeit bestimmt, wie oft Zinsen berechnet und zum Kapital hinzugefügt werden. Gängige Optionen sind jährlich, halbjährlich, vierteljährlich, monatlich und täglich.',
        'Die verwendete Formel ist A = P(1 + r/n)^(nt), wobei A der Endbetrag ist, P das Kapital, r der Jahreszins, n die Zinseszinshäufigkeit pro Jahr und t die Zeit in Jahren. Diese Standardformel wird von Banken, Finanzberatern und Investmentplattformen weltweit verwendet.',
        'Die jährliche Aufschlüsselungstabelle zeigt genau, wie Ihre Investition jedes Jahr wächst. Sie können den Saldo am Ende jedes Jahres und die während des Jahres verdienten Zinsen sehen. Die ersten Jahre zeigen bescheidene Gewinne, aber spätere Jahre zeigen dramatisch größere Zinsbeträge.',
        'Wenn Sie für die Rente sparen, probieren Sie unseren <a href="/${lang}/tools/retirement-calculator">Rentenrechner</a> zur Projektion Ihrer Gesamtersparnis mit Inflationsanpassung. Zum Vergleich von Hypotheken oder Krediten nutzen Sie unseren <a href="/${lang}/tools/mortgage-calculator">Hypothekenrechner</a> oder <a href="/${lang}/tools/loan-calculator">Kreditrechner</a>.'
      ],
      faq: [
        { q: 'Was ist der Unterschied zwischen einfachem Zins und Zinseszins?', a: 'Einfacher Zins wird nur auf das ursprüngliche Kapital berechnet. Zinseszins wird auf das Kapital plus die bereits verdienten Zinsen berechnet. Im Laufe der Zeit generiert der Zinseszins deutlich höhere Erträge.' },
        { q: 'Wie beeinflusst die Zinseszinshäufigkeit meine Erträge?', a: 'Je häufiger die Zinsen kapitalisiert werden, desto mehr verdienen Sie. Tägliche Kapitalisierung bringt etwas mehr als monatliche, die mehr als vierteljährliche bringt. Der Unterschied zwischen täglicher und monatlicher Kapitalisierung ist jedoch typischerweise gering.' },
        { q: 'Kann ich diesen Rechner für Darlehenszinsen verwenden?', a: 'Ja. Die Zinseszinsformel funktioniert gleich für Darlehen. Geben Sie den Darlehensbetrag als Kapital, den Zinssatz und die Laufzeit ein.' },
        { q: 'Welchen Zinssatz sollte ich für Spareinlagen verwenden?', a: 'Verwenden Sie den von Ihrer Bank angebotenen jährlichen Prozentertrag. Für Sparkonten liegt dieser typischerweise zwischen 0,5% und 5%. Für Aktienmarktinvestitionen liegen historische Durchschnittsrenditen bei etwa 7-10% jährlich.' },
        { q: 'Warum steigen die verdienten Zinsen jedes Jahr?', a: 'Weil der Zinseszins die Zinsen auf den wachsenden Saldo berechnet, nicht nur auf das ursprüngliche Kapital. Jedes Jahr ist Ihr Saldo höher als im Vorjahr.' }
      ]
    },
    pt: {
      title: 'Calculadora de Juros Compostos: Faça Seu Patrimônio Crescer',
      paragraphs: [
        'Os juros compostos são frequentemente chamados de a oitava maravilha do mundo. Diferente dos juros simples, que só geram juros sobre o capital original, os juros compostos geram juros tanto sobre o capital quanto sobre os juros anteriormente acumulados. Este efeito de crescimento exponencial significa que seu dinheiro cresce mais rápido quanto mais tempo permanece investido.',
        'Nossa calculadora de juros compostos permite inserir o valor do capital inicial, a taxa de juros anual, a duração do investimento em anos e a frequência de capitalização. A frequência de capitalização determina com que frequência os juros são calculados e adicionados ao capital. As opções comuns incluem anual, semestral, trimestral, mensal e diário.',
        'A fórmula utilizada é A = P(1 + r/n)^(nt), onde A é o montante final, P é o capital, r é a taxa anual, n é a frequência de capitalização por ano e t é o tempo em anos. Esta fórmula padrão é usada por bancos, consultores financeiros e plataformas de investimento em todo o mundo.',
        'A tabela de detalhamento ano a ano mostra exatamente como seu investimento cresce. Você pode ver o saldo no final de cada ano e os juros ganhos durante aquele ano. Os primeiros anos mostram ganhos modestos, mas os anos posteriores mostram valores de juros dramaticamente maiores à medida que o efeito composto se acelera.',
        'Se está a poupar para a aposentadoria, experimente a nossa <a href="/${lang}/tools/retirement-calculator">calculadora de aposentadoria</a> para projetar a poupança total com ajuste pela inflação. Para comparar hipotecas ou empréstimos, use a <a href="/${lang}/tools/mortgage-calculator">calculadora de hipoteca</a> ou a <a href="/${lang}/tools/loan-calculator">calculadora de empréstimos</a>.'
      ],
      faq: [
        { q: 'Qual é a diferença entre juros simples e compostos?', a: 'Juros simples são calculados apenas sobre o capital original. Juros compostos são calculados sobre o capital mais os juros já ganhos. Com o tempo, os juros compostos geram retornos significativamente maiores.' },
        { q: 'Como a frequência de capitalização afeta meus retornos?', a: 'Quanto mais frequentemente os juros são capitalizados, mais você ganha. A capitalização diária rende ligeiramente mais que a mensal, que rende mais que a trimestral. No entanto, a diferença entre diária e mensal é tipicamente pequena.' },
        { q: 'Posso usar esta calculadora para juros de empréstimos?', a: 'Sim. A fórmula de juros compostos funciona da mesma forma para empréstimos. Insira o valor do empréstimo como capital, a taxa de juros e o prazo.' },
        { q: 'Qual taxa de juros devo usar para poupança?', a: 'Use o rendimento percentual anual oferecido pelo seu banco. Para contas poupança é tipicamente entre 0,5% e 5%. Para investimentos em bolsa, os retornos médios históricos são cerca de 7-10% ao ano.' },
        { q: 'Por que os juros ganhos aumentam a cada ano?', a: 'Porque os juros compostos calculam juros sobre o saldo crescente, não apenas sobre o capital original. A cada ano, seu saldo é maior que o do ano anterior.' }
      ]
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="compound-interest-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('principal')}</label>
            <input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('rate')}</label>
            <input type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('time')}</label>
            <input type="number" value={time} onChange={(e) => setTime(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('frequency')}</label>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              {freqOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
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
                  <span className="text-2xl">💰</span>
                  <div className="text-xs text-green-600 font-medium mt-1">{t('finalAmount')}</div>
                  <div className="text-2xl font-bold text-green-700">${result.finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <span className="text-2xl">📈</span>
                  <div className="text-xs text-blue-600 font-medium mt-1">{t('totalInterest')}</div>
                  <div className="text-2xl font-bold text-blue-700">${result.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              </div>

              {/* Growth progress bar */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{t('principal')}</span>
                  <span>{t('finalAmount')}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-blue-400 to-green-400 h-3 rounded-full" style={{ width: `${Math.min((parseFloat(principal) / result.finalAmount) * 100, 100)}%` }}></div>
                </div>
                <div className="text-center text-xs text-gray-500 mt-1">{((result.totalInterest / parseFloat(principal)) * 100).toFixed(1)}% growth</div>
              </div>

              <button onClick={copyResults} className="w-full py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                {copied ? (
                  <><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied!</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy Results</>
                )}
              </button>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('yearBreakdown')}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-2">{t('year')}</th>
                        <th className="text-right py-2 px-2">{t('balance')}</th>
                        <th className="text-right py-2 px-2">{t('interestEarned')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.breakdown.map((row) => (
                        <tr key={row.year} className="border-b border-gray-100">
                          <td className="py-2 px-2">{row.year}</td>
                          <td className="text-right py-2 px-2">${row.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="text-right py-2 px-2">${row.interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: p.replace(/\$\{lang\}/g, lang) }} />)}
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
