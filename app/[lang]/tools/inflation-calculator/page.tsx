'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function InflationCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['inflation-calculator'][lang];

  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('3');
  const [years, setYears] = useState('10');
  const [mode, setMode] = useState<'future' | 'past'>('future');
  const [copied, setCopied] = useState(false);
  const [touched, setTouched] = useState(false);
  const [historyList, setHistoryList] = useState<{ mode: string; result: string }[]>([]);

  const labels = {
    amount: { en: 'Amount', it: 'Importo', es: 'Cantidad', fr: 'Montant', de: 'Betrag', pt: 'Valor' },
    inflationRate: { en: 'Annual Inflation Rate (%)', it: 'Tasso Inflazione Annuo (%)', es: 'Tasa de Inflación Anual (%)', fr: 'Taux d\'Inflation Annuel (%)', de: 'Jährliche Inflationsrate (%)', pt: 'Taxa de Inflação Anual (%)' },
    years: { en: 'Number of Years', it: 'Numero di Anni', es: 'Número de Años', fr: 'Nombre d\'Années', de: 'Anzahl der Jahre', pt: 'Número de Anos' },
    futureMode: { en: 'Future Value (what will it be worth?)', it: 'Valore Futuro (quanto varrà?)', es: 'Valor Futuro (¿cuánto valdrá?)', fr: 'Valeur Future (combien vaudra?)', de: 'Zukünftiger Wert (was wird es wert sein?)', pt: 'Valor Futuro (quanto valerá?)' },
    pastMode: { en: 'Past Value (what was it worth?)', it: 'Valore Passato (quanto valeva?)', es: 'Valor Pasado (¿cuánto valía?)', fr: 'Valeur Passée (combien valait?)', de: 'Vergangener Wert (was war es wert?)', pt: 'Valor Passado (quanto valia?)' },
    purchasingPower: { en: 'Purchasing Power', it: 'Potere d\'Acquisto', es: 'Poder Adquisitivo', fr: 'Pouvoir d\'Achat', de: 'Kaufkraft', pt: 'Poder de Compra' },
    lostValue: { en: 'Value Lost to Inflation', it: 'Valore Perso per Inflazione', es: 'Valor Perdido por Inflación', fr: 'Valeur Perdue par Inflation', de: 'Durch Inflation verlorener Wert', pt: 'Valor Perdido pela Inflação' },
    equivalentToday: { en: 'Equivalent Today', it: 'Equivalente Oggi', es: 'Equivalente Hoy', fr: 'Équivalent Aujourd\'hui', de: 'Heutiger Gegenwert', pt: 'Equivalente Hoje' },
    neededAmount: { en: 'Amount Needed', it: 'Importo Necessario', es: 'Cantidad Necesaria', fr: 'Montant Nécessaire', de: 'Benötigter Betrag', pt: 'Valor Necessário' },
    yearByYear: { en: 'Year-by-Year Breakdown', it: 'Dettaglio Anno per Anno', es: 'Desglose Año por Año', fr: 'Détail Année par Année', de: 'Aufschlüsselung nach Jahren', pt: 'Detalhamento Ano a Ano' },
    year: { en: 'Year', it: 'Anno', es: 'Año', fr: 'Année', de: 'Jahr', pt: 'Ano' },
    value: { en: 'Value', it: 'Valore', es: 'Valor', fr: 'Valeur', de: 'Wert', pt: 'Valor' },
    cumulativeLoss: { en: 'Cumulative Loss', it: 'Perdita Cumulativa', es: 'Pérdida Acumulada', fr: 'Perte Cumulée', de: 'Kumulativer Verlust', pt: 'Perda Acumulada' },
    reset: { en: 'Reset', it: 'Reset', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Reiniciar' },
    copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
    copy: { en: 'Copy Result', it: 'Copia Risultato', es: 'Copiar Resultado', fr: 'Copier le Résultat', de: 'Ergebnis Kopieren', pt: 'Copiar Resultado' },
    invalidAmount: { en: 'Enter a positive amount', it: 'Inserisci un importo positivo', es: 'Ingresa un monto positivo', fr: 'Entrez un montant positif', de: 'Geben Sie einen positiven Betrag ein', pt: 'Insira um valor positivo' },
    historyLabel: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
  } as Record<string, Record<Locale, string>>;

  const amt = parseFloat(amount) || 0;
  const r = parseFloat(rate) || 0;
  const y = parseInt(years) || 0;

  // Future mode: what amt today will be worth in y years (purchasing power decreases)
  // Past mode: what amt back then is equivalent to today (purchasing power was higher)
  const futureValue = amt / Math.pow(1 + r / 100, y); // purchasing power of amt in y years
  const pastValue = amt * Math.pow(1 + r / 100, y); // amt from y years ago in today's money
  const amountNeeded = amt * Math.pow(1 + r / 100, y); // how much you need in y years to match amt today

  const hasResult = amt > 0 && r > 0 && y > 0;

  // Year-by-year breakdown
  const breakdown: { year: number; value: number; loss: number }[] = [];
  if (hasResult) {
    for (let i = 1; i <= Math.min(y, 100); i++) {
      if (mode === 'future') {
        const val = amt / Math.pow(1 + r / 100, i);
        breakdown.push({ year: i, value: val, loss: amt - val });
      } else {
        const val = amt * Math.pow(1 + r / 100, i);
        breakdown.push({ year: i, value: val, loss: val - amt });
      }
    }
  }

  const formatCurrency = (n: number) => {
    return n.toLocaleString(lang === 'en' ? 'en-US' : lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'it-IT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Inflation Calculator — Calculate Purchasing Power Over Time',
      paragraphs: [
        'Inflation is the gradual increase in prices that reduces the purchasing power of money over time. Understanding inflation is crucial for financial planning, retirement savings, and investment decisions. Our inflation calculator helps you visualize exactly how much your money will be worth in the future, or how much past amounts are equivalent to in today\'s dollars.',
        'The calculator uses the compound inflation formula: Future Value = Present Value / (1 + inflation rate)^years. This means that with a 3% annual inflation rate, $100 today will have the purchasing power of only about $74 in 10 years. Conversely, $100 from 10 years ago has the equivalent purchasing power of about $134 today.',
        'You can use two modes: "Future Value" shows how inflation erodes your money over time — essential for retirement planning and long-term savings goals. "Past Value" shows what an amount from the past would be worth today — useful for understanding historical prices, comparing salaries across decades, or evaluating real estate appreciation versus inflation.',
        'The year-by-year breakdown table provides a detailed view of how purchasing power changes annually. This visual representation makes it clear why keeping money in a non-interest-bearing account is a losing strategy. Even moderate inflation of 2-3% per year can significantly reduce your wealth over a 20-30 year period, making it essential to invest in assets that at least match the inflation rate.',
      ],
      faq: [
        { q: 'How does inflation affect my savings?', a: 'Inflation reduces the purchasing power of your savings. If inflation averages 3% per year and your savings earn 1% interest, you are effectively losing 2% of purchasing power annually. After 20 years, your money would buy about 33% less than today. This is why investing in assets that outpace inflation is important.' },
        { q: 'What is a typical annual inflation rate?', a: 'In developed economies, central banks typically target around 2% annual inflation. Historically, the US has averaged about 3% inflation per year. However, rates can vary significantly — from near 0% during deflationary periods to over 10% during high-inflation periods. Always check current rates for your country.' },
        { q: 'How do I calculate the real return on investment after inflation?', a: 'The real return is approximately the nominal return minus the inflation rate. If your investment earns 7% and inflation is 3%, your real return is about 4%. More precisely, real return = ((1 + nominal) / (1 + inflation)) - 1, which in this case equals 3.88%.' },
        { q: 'Why is inflation important for retirement planning?', a: 'If you plan to retire in 30 years and need $50,000/year in today\'s dollars, at 3% inflation you will need about $121,000/year to maintain the same lifestyle. This means your retirement savings target must account for inflation to avoid running short.' },
        { q: 'What causes inflation?', a: 'Inflation can be caused by increased money supply (monetary inflation), rising production costs (cost-push inflation), or increased consumer demand exceeding supply (demand-pull inflation). Central banks manage inflation through interest rate policies and other monetary tools.' },
      ],
    },
    it: {
      title: 'Calcolatore di Inflazione Gratuito — Calcola il Potere d\'Acquisto nel Tempo',
      paragraphs: [
        'L\'inflazione è l\'aumento graduale dei prezzi che riduce il potere d\'acquisto del denaro nel tempo. Comprendere l\'inflazione è cruciale per la pianificazione finanziaria, il risparmio pensionistico e le decisioni di investimento. Il nostro calcolatore ti aiuta a visualizzare esattamente quanto varrà il tuo denaro in futuro.',
        'Il calcolatore usa la formula dell\'inflazione composta: Valore Futuro = Valore Attuale / (1 + tasso inflazione)^anni. Con un tasso del 3% annuo, 100 euro oggi avranno il potere d\'acquisto di soli 74 euro tra 10 anni. Al contrario, 100 euro di 10 anni fa equivalgono a circa 134 euro oggi.',
        'Puoi usare due modalità: "Valore Futuro" mostra come l\'inflazione erode il tuo denaro — essenziale per la pianificazione pensionistica. "Valore Passato" mostra quanto vale oggi un importo del passato — utile per confrontare stipendi o prezzi storici.',
        'La tabella anno per anno fornisce una vista dettagliata di come cambia il potere d\'acquisto. Anche un\'inflazione moderata del 2-3% può ridurre significativamente la tua ricchezza su un periodo di 20-30 anni.',
      ],
      faq: [
        { q: 'Come l\'inflazione influisce sui miei risparmi?', a: 'L\'inflazione riduce il potere d\'acquisto dei tuoi risparmi. Se l\'inflazione media è del 3% e i tuoi risparmi rendono l\'1%, stai perdendo il 2% di potere d\'acquisto annuo. Dopo 20 anni, il tuo denaro comprerà circa il 33% in meno.' },
        { q: 'Qual è un tasso di inflazione tipico?', a: 'Nelle economie sviluppate, le banche centrali puntano generalmente al 2% annuo. L\'Italia ha storicamente avuto tassi variabili. Controlla sempre i tassi attuali del tuo paese.' },
        { q: 'Come calcolo il rendimento reale di un investimento?', a: 'Il rendimento reale è approssimativamente il rendimento nominale meno il tasso di inflazione. Se il tuo investimento rende il 7% e l\'inflazione è al 3%, il rendimento reale è circa il 4%.' },
        { q: 'Perché l\'inflazione è importante per la pensione?', a: 'Se prevedi di andare in pensione tra 30 anni e hai bisogno di 30.000 euro/anno, al 3% di inflazione avrai bisogno di circa 73.000 euro/anno per mantenere lo stesso tenore di vita.' },
      ],
    },
    es: {
      title: 'Calculadora de Inflación Gratis — Calcula el Poder Adquisitivo en el Tiempo',
      paragraphs: [
        'La inflación es el aumento gradual de los precios que reduce el poder adquisitivo del dinero con el tiempo. Comprender la inflación es crucial para la planificación financiera y las decisiones de inversión. Nuestra calculadora te ayuda a visualizar exactamente cuánto valdrá tu dinero en el futuro.',
        'La calculadora usa la fórmula de inflación compuesta: Valor Futuro = Valor Actual / (1 + tasa de inflación)^años. Con una tasa del 3% anual, 100 euros hoy tendrán el poder adquisitivo de solo 74 euros en 10 años.',
        'Puedes usar dos modos: "Valor Futuro" muestra cómo la inflación erosiona tu dinero — esencial para la planificación de jubilación. "Valor Pasado" muestra cuánto vale hoy una cantidad del pasado.',
        'La tabla año por año proporciona una vista detallada de cómo cambia el poder adquisitivo. Incluso una inflación moderada del 2-3% puede reducir significativamente tu riqueza en 20-30 años.',
      ],
      faq: [
        { q: '¿Cómo afecta la inflación a mis ahorros?', a: 'La inflación reduce el poder adquisitivo de tus ahorros. Si la inflación promedia 3% y tus ahorros ganan 1%, pierdes 2% de poder adquisitivo anual. Después de 20 años, tu dinero comprará un 33% menos.' },
        { q: '¿Cuál es una tasa de inflación típica?', a: 'En economías desarrolladas, los bancos centrales apuntan a aproximadamente 2% anual. Históricamente el promedio ha sido cercano al 3%. Verifica siempre las tasas actuales de tu país.' },
        { q: '¿Cómo calculo el rendimiento real de una inversión?', a: 'El rendimiento real es aproximadamente el rendimiento nominal menos la tasa de inflación. Si tu inversión rinde 7% y la inflación es 3%, el rendimiento real es aproximadamente 4%.' },
        { q: '¿Por qué la inflación importa para la jubilación?', a: 'Si planeas jubilarte en 30 años y necesitas 30.000 euros/año, al 3% de inflación necesitarás unos 73.000 euros/año para mantener el mismo nivel de vida.' },
      ],
    },
    fr: {
      title: 'Calculateur d\'Inflation Gratuit — Calculez le Pouvoir d\'Achat dans le Temps',
      paragraphs: [
        'L\'inflation est l\'augmentation progressive des prix qui réduit le pouvoir d\'achat de l\'argent au fil du temps. Comprendre l\'inflation est crucial pour la planification financière et les décisions d\'investissement. Notre calculateur vous aide à visualiser exactement combien vaudra votre argent à l\'avenir.',
        'Le calculateur utilise la formule d\'inflation composée : Valeur Future = Valeur Actuelle / (1 + taux d\'inflation)^années. Avec un taux de 3% annuel, 100 euros aujourd\'hui n\'auront le pouvoir d\'achat que d\'environ 74 euros dans 10 ans.',
        'Deux modes sont disponibles : "Valeur Future" montre comment l\'inflation érode votre argent — essentiel pour la planification de retraite. "Valeur Passée" montre combien vaut aujourd\'hui un montant du passé.',
        'Le tableau année par année fournit une vue détaillée de l\'évolution du pouvoir d\'achat. Même une inflation modérée de 2-3% peut réduire significativement votre richesse sur 20-30 ans.',
      ],
      faq: [
        { q: 'Comment l\'inflation affecte-t-elle mes économies ?', a: 'L\'inflation réduit le pouvoir d\'achat de vos économies. Si l\'inflation est de 3% et vos économies rapportent 1%, vous perdez 2% de pouvoir d\'achat annuellement. Après 20 ans, votre argent achètera environ 33% de moins.' },
        { q: 'Quel est un taux d\'inflation typique ?', a: 'Dans les économies développées, les banques centrales ciblent environ 2% annuel. Historiquement, la moyenne est proche de 3%. Vérifiez toujours les taux actuels de votre pays.' },
        { q: 'Comment calculer le rendement réel d\'un investissement ?', a: 'Le rendement réel est approximativement le rendement nominal moins le taux d\'inflation. Si votre investissement rapporte 7% et l\'inflation est de 3%, le rendement réel est d\'environ 4%.' },
        { q: 'Pourquoi l\'inflation est-elle importante pour la retraite ?', a: 'Si vous prévoyez de prendre votre retraite dans 30 ans et avez besoin de 30 000 euros/an, à 3% d\'inflation vous aurez besoin d\'environ 73 000 euros/an pour maintenir le même niveau de vie.' },
      ],
    },
    de: {
      title: 'Kostenloser Inflationsrechner — Kaufkraft im Zeitverlauf Berechnen',
      paragraphs: [
        'Inflation ist der allmähliche Preisanstieg, der die Kaufkraft des Geldes im Laufe der Zeit verringert. Das Verständnis der Inflation ist entscheidend für die Finanzplanung und Anlageentscheidungen. Unser Rechner hilft Ihnen zu visualisieren, wie viel Ihr Geld in Zukunft wert sein wird.',
        'Der Rechner verwendet die Zinseszinsformel: Zukunftswert = Gegenwartswert / (1 + Inflationsrate)^Jahre. Bei einer Rate von 3% haben 100 Euro heute in 10 Jahren nur noch die Kaufkraft von etwa 74 Euro.',
        'Zwei Modi stehen zur Verfügung: "Zukünftiger Wert" zeigt, wie Inflation Ihr Geld erodiert — wichtig für die Altersvorsorge. "Vergangener Wert" zeigt, wie viel ein Betrag aus der Vergangenheit heute wert wäre.',
        'Die jährliche Aufschlüsselung zeigt detailliert, wie sich die Kaufkraft verändert. Selbst moderate Inflation von 2-3% kann Ihr Vermögen über 20-30 Jahre erheblich reduzieren.',
      ],
      faq: [
        { q: 'Wie wirkt sich Inflation auf meine Ersparnisse aus?', a: 'Inflation verringert die Kaufkraft Ihrer Ersparnisse. Bei 3% Inflation und 1% Zinsen verlieren Sie jährlich 2% Kaufkraft. Nach 20 Jahren kauft Ihr Geld etwa 33% weniger.' },
        { q: 'Was ist eine typische Inflationsrate?', a: 'In entwickelten Volkswirtschaften zielen Zentralbanken auf etwa 2% jährlich. Historisch liegt der Durchschnitt bei etwa 3%. Prüfen Sie immer die aktuellen Raten Ihres Landes.' },
        { q: 'Wie berechne ich die reale Rendite einer Anlage?', a: 'Die reale Rendite ist ungefähr die nominale Rendite minus Inflationsrate. Bei 7% Anlagerendite und 3% Inflation beträgt die reale Rendite etwa 4%.' },
        { q: 'Warum ist Inflation für die Altersvorsorge wichtig?', a: 'Wenn Sie in 30 Jahren in Rente gehen und 30.000 Euro/Jahr brauchen, benötigen Sie bei 3% Inflation etwa 73.000 Euro/Jahr für denselben Lebensstandard.' },
      ],
    },
    pt: {
      title: 'Calculadora de Inflação Grátis — Calcule o Poder de Compra ao Longo do Tempo',
      paragraphs: [
        'A inflação é o aumento gradual dos preços que reduz o poder de compra do dinheiro ao longo do tempo. Entender a inflação é crucial para o planejamento financeiro e decisões de investimento. Nossa calculadora ajuda a visualizar exatamente quanto seu dinheiro valerá no futuro.',
        'A calculadora usa a fórmula de inflação composta: Valor Futuro = Valor Atual / (1 + taxa de inflação)^anos. Com uma taxa de 3% ao ano, R$100 hoje terão o poder de compra de apenas R$74 em 10 anos.',
        'Dois modos disponíveis: "Valor Futuro" mostra como a inflação corrói seu dinheiro — essencial para o planejamento de aposentadoria. "Valor Passado" mostra quanto vale hoje um valor do passado.',
        'A tabela ano a ano fornece uma visão detalhada de como o poder de compra muda. Mesmo uma inflação moderada de 2-3% pode reduzir significativamente sua riqueza em 20-30 anos.',
      ],
      faq: [
        { q: 'Como a inflação afeta minhas economias?', a: 'A inflação reduz o poder de compra das suas economias. Se a inflação é de 3% e suas economias rendem 1%, você perde 2% de poder de compra ao ano. Após 20 anos, seu dinheiro comprará cerca de 33% menos.' },
        { q: 'Qual é uma taxa de inflação típica?', a: 'Em economias desenvolvidas, bancos centrais miram cerca de 2% ao ano. No Brasil, as taxas variam mais. Sempre verifique as taxas atuais do seu país.' },
        { q: 'Como calcular o retorno real de um investimento?', a: 'O retorno real é aproximadamente o retorno nominal menos a taxa de inflação. Se seu investimento rende 7% e a inflação é 3%, o retorno real é cerca de 4%.' },
        { q: 'Por que a inflação é importante para a aposentadoria?', a: 'Se você planeja se aposentar em 30 anos e precisa de R$5.000/mês, a 3% de inflação precisará de cerca de R$12.100/mês para manter o mesmo padrão de vida.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="inflation-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Mode selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode('future')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${mode === 'future' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {labels.futureMode[lang]}
            </button>
            <button
              onClick={() => setMode('past')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${mode === 'past' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {labels.pastMode[lang]}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.amount[lang]}</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} onBlur={() => setTouched(true)} placeholder="1000"
              className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 ${touched && amount !== '' && amt <= 0 ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {touched && amount !== '' && amt <= 0 && <p className="text-red-500 text-xs mt-1">{labels.invalidAmount[lang]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.inflationRate[lang]}</label>
              <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} step="0.1" placeholder="3" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.years[lang]}</label>
              <input type="number" value={years} onChange={(e) => setYears(e.target.value)} placeholder="10" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Reset and Copy */}
          <div className="flex gap-2">
            <button onClick={() => { setAmount(''); setRate('3'); setYears('10'); setTouched(false); }} className="flex-1 py-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
              {labels.reset[lang]}
            </button>
            {hasResult && (
              <button onClick={() => { const v = mode === 'future' ? formatCurrency(futureValue) : formatCurrency(pastValue); navigator.clipboard.writeText(v); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">
                {copied ? labels.copied[lang] : labels.copy[lang]}
              </button>
            )}
          </div>

          {hasResult && (
            <div className="space-y-3">
              {mode === 'future' ? (
                <>
                  <div className="bg-orange-50 p-5 rounded-lg text-center">
                    <div className="text-sm text-gray-500">{labels.purchasingPower[lang]}</div>
                    <div className="text-3xl font-bold text-orange-600">{formatCurrency(futureValue)}</div>
                    <div className="text-xs text-gray-400 mt-1">{formatCurrency(amt)} &rarr; {y} {labels.year[lang].toLowerCase()}s</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-red-50 p-3 rounded-lg text-center">
                      <div className="text-xs text-gray-500">{labels.lostValue[lang]}</div>
                      <div className="text-xl font-bold text-red-600">{formatCurrency(amt - futureValue)}</div>
                      <div className="text-xs text-gray-400">-{((1 - futureValue / amt) * 100).toFixed(1)}%</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-xs text-gray-500">{labels.neededAmount[lang]}</div>
                      <div className="text-xl font-bold text-blue-600">{formatCurrency(amountNeeded)}</div>
                      <div className="text-xs text-gray-400">+{((amountNeeded / amt - 1) * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-green-50 p-5 rounded-lg text-center">
                  <div className="text-sm text-gray-500">{labels.equivalentToday[lang]}</div>
                  <div className="text-3xl font-bold text-green-600">{formatCurrency(pastValue)}</div>
                  <div className="text-xs text-gray-400 mt-1">{formatCurrency(amt)} &rarr; +{y} {labels.year[lang].toLowerCase()}s</div>
                </div>
              )}

              {/* Year-by-year breakdown */}
              {breakdown.length > 0 && breakdown.length <= 50 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-2">{labels.yearByYear[lang]}</div>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-500 text-xs">
                          <th className="text-left py-1">{labels.year[lang]}</th>
                          <th className="text-right py-1">{labels.value[lang]}</th>
                          <th className="text-right py-1">{labels.cumulativeLoss[lang]}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {breakdown.map((row) => (
                          <tr key={row.year} className="border-t border-gray-200">
                            <td className="py-1 text-gray-700">{row.year}</td>
                            <td className="py-1 text-right font-mono text-gray-900">{formatCurrency(row.value)}</td>
                            <td className={`py-1 text-right font-mono ${mode === 'future' ? 'text-red-500' : 'text-green-500'}`}>
                              {mode === 'future' ? '-' : '+'}{formatCurrency(row.loss)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Save to history */}
              <button onClick={() => {
                const res = mode === 'future' ? formatCurrency(futureValue) : formatCurrency(pastValue);
                const label = mode === 'future' ? labels.futureMode[lang] : labels.pastMode[lang];
                setHistoryList(prev => [{ mode: label, result: res }, ...prev].slice(0, 5));
              }} className="w-full py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm text-blue-700 transition-colors">
                + {labels.historyLabel[lang]}
              </button>
            </div>
          )}

          {/* History panel */}
          {historyList.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">{labels.historyLabel[lang]}</div>
              <div className="space-y-1">
                {historyList.map((h, i) => (
                  <div key={i} className="flex justify-between text-sm py-1 px-2 bg-white rounded">
                    <span className="text-gray-500 text-xs truncate max-w-[50%]">{h.mode}</span>
                    <span className="font-mono text-gray-900">{h.result}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SEO Article */}
        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-4">{p}</p>)}
        </article>

        {/* FAQ Accordion */}
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
