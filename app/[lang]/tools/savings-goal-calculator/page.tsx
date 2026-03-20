'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function SavingsGoalCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['savings-goal-calculator'][lang];

  const [goalAmount, setGoalAmount] = useState('');
  const [currentSavings, setCurrentSavings] = useState('');
  const [months, setMonths] = useState('');
  const [annualRate, setAnnualRate] = useState('5');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const goal = parseFloat(goalAmount) || 0;
  const current = parseFloat(currentSavings) || 0;
  const period = parseInt(months) || 0;
  const rate = (parseFloat(annualRate) || 0) / 100 / 12;

  const remaining = Math.max(0, goal - current);

  let monthlyNeeded = 0;
  if (period > 0 && remaining > 0) {
    if (rate > 0) {
      const fv = current * Math.pow(1 + rate, period);
      const remainingAfterGrowth = goal - fv;
      if (remainingAfterGrowth > 0) {
        monthlyNeeded = remainingAfterGrowth / ((Math.pow(1 + rate, period) - 1) / rate);
      }
    } else {
      monthlyNeeded = remaining / period;
    }
  }

  const totalContributions = monthlyNeeded * period;
  const totalInterest = goal - current - totalContributions;
  const dailySavings = monthlyNeeded / 30;
  const weeklySavings = monthlyNeeded / 4.33;

  const labels = {
    goalAmount: { en: 'Savings Goal ($)', it: 'Obiettivo Risparmio (\u20ac)', es: 'Meta de Ahorro ($)', fr: 'Objectif d\'\u00c9pargne (\u20ac)', de: 'Sparziel (\u20ac)', pt: 'Meta de Poupan\u00e7a (R$)' },
    currentSavings: { en: 'Current Savings ($)', it: 'Risparmi Attuali (\u20ac)', es: 'Ahorros Actuales ($)', fr: '\u00c9pargne Actuelle (\u20ac)', de: 'Aktuelle Ersparnisse (\u20ac)', pt: 'Poupan\u00e7a Atual (R$)' },
    timeframe: { en: 'Timeframe (months)', it: 'Periodo (mesi)', es: 'Plazo (meses)', fr: 'D\u00e9lai (mois)', de: 'Zeitraum (Monate)', pt: 'Prazo (meses)' },
    interestRate: { en: 'Annual Interest Rate (%)', it: 'Tasso d\'Interesse Annuo (%)', es: 'Tasa de Inter\u00e9s Anual (%)', fr: 'Taux d\'Int\u00e9r\u00eat Annuel (%)', de: 'J\u00e4hrlicher Zinssatz (%)', pt: 'Taxa de Juros Anual (%)' },
    monthlyNeeded: { en: 'Monthly Savings Needed', it: 'Risparmio Mensile Necessario', es: 'Ahorro Mensual Necesario', fr: '\u00c9pargne Mensuelle N\u00e9cessaire', de: 'Ben\u00f6tigte Monatliche Sparrate', pt: 'Poupan\u00e7a Mensal Necess\u00e1ria' },
    weekly: { en: 'Weekly', it: 'Settimanale', es: 'Semanal', fr: 'Hebdomadaire', de: 'W\u00f6chentlich', pt: 'Semanal' },
    daily: { en: 'Daily', it: 'Giornaliero', es: 'Diario', fr: 'Quotidien', de: 'T\u00e4glich', pt: 'Di\u00e1rio' },
    totalContributions: { en: 'Total Contributions', it: 'Contributi Totali', es: 'Contribuciones Totales', fr: 'Contributions Totales', de: 'Gesamte Beitr\u00e4ge', pt: 'Contribui\u00e7\u00f5es Totais' },
    interestEarned: { en: 'Interest Earned', it: 'Interessi Guadagnati', es: 'Intereses Ganados', fr: 'Int\u00e9r\u00eats Gagn\u00e9s', de: 'Verdiente Zinsen', pt: 'Juros Ganhos' },
    breakdown: { en: 'Savings Breakdown', it: 'Dettaglio Risparmio', es: 'Desglose de Ahorro', fr: 'D\u00e9tail de l\'\u00c9pargne', de: 'Sparaufschl\u00fcsselung', pt: 'Detalhamento da Poupan\u00e7a' },
  } as Record<string, Record<Locale, string>>;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Savings Goal Calculator \u2014 Plan How to Reach Your Financial Goals',
      paragraphs: [
        'The Savings Goal Calculator helps you figure out exactly how much you need to save each month to reach your financial target. Whether you\'re saving for an emergency fund, a vacation, a down payment, or retirement, this tool makes planning simple.',
        'Enter your goal amount, current savings, timeframe, and expected interest rate. The calculator shows you the monthly, weekly, and daily savings needed, plus how much you\'ll earn in interest over the period.',
        'Compound interest works in your favor when saving. Even a modest 4-5% annual return can significantly reduce the amount you need to save each month. The earlier you start, the more time your money has to grow.',
        'Use this calculator regularly to track your progress and adjust your savings plan as your financial situation changes.',
      ],
      faq: [
        { q: 'How much should I save each month?', a: 'Financial experts recommend saving at least 20% of your income. This calculator helps you determine the exact amount based on your specific goal and timeline.' },
        { q: 'Does the calculator account for compound interest?', a: 'Yes! You can enter an expected annual interest rate, and the calculator factors in compound interest, showing you exactly how much your savings will grow.' },
        { q: 'What interest rate should I use?', a: 'For high-yield savings accounts, use 4-5%. For investment portfolios, 7-10% is common for long-term stock market returns. Use 0% for a basic savings account.' },
        { q: 'How can I reach my savings goal faster?', a: 'Increase your monthly contribution, find a higher-yield savings vehicle, reduce expenses, or extend your timeline. Even small increases in monthly savings can make a big difference.' },
      ],
    },
    it: {
      title: 'Calcolatore Obiettivo Risparmio Gratuito \u2014 Pianifica i Tuoi Obiettivi Finanziari',
      paragraphs: [
        'Il Calcolatore Obiettivo Risparmio ti aiuta a capire esattamente quanto devi risparmiare ogni mese per raggiungere il tuo obiettivo finanziario.',
        'Inserisci l\'importo obiettivo, i risparmi attuali, il periodo e il tasso di interesse previsto. Il calcolatore mostra il risparmio mensile, settimanale e giornaliero necessario.',
        'L\'interesse composto lavora a tuo favore. Anche un rendimento modesto del 4-5% annuo pu\u00f2 ridurre significativamente l\'importo da risparmiare ogni mese.',
        'Usa questo calcolatore regolarmente per monitorare i tuoi progressi e adattare il piano di risparmio.',
      ],
      faq: [
        { q: 'Quanto dovrei risparmiare ogni mese?', a: 'Gli esperti raccomandano di risparmiare almeno il 20% del reddito. Questo calcolatore ti aiuta a determinare l\'importo esatto.' },
        { q: 'Il calcolatore considera l\'interesse composto?', a: 'S\u00ec! Puoi inserire un tasso di interesse annuo e il calcolatore calcola l\'interesse composto.' },
        { q: 'Quale tasso di interesse dovrei usare?', a: 'Per conti di risparmio ad alto rendimento, usa il 4-5%. Per portafogli di investimento, il 7-10% \u00e8 comune.' },
        { q: 'Come posso raggiungere l\'obiettivo pi\u00f9 velocemente?', a: 'Aumenta il contributo mensile, trova un veicolo di risparmio con rendimento pi\u00f9 alto, o riduci le spese.' },
      ],
    },
    es: {
      title: 'Calculadora de Meta de Ahorro Gratis \u2014 Planifica tus Objetivos Financieros',
      paragraphs: [
        'La Calculadora de Meta de Ahorro te ayuda a determinar exactamente cu\u00e1nto necesitas ahorrar cada mes para alcanzar tu objetivo financiero.',
        'Ingresa el monto objetivo, tus ahorros actuales, el plazo y la tasa de inter\u00e9s esperada.',
        'El inter\u00e9s compuesto trabaja a tu favor. Incluso un rendimiento modesto del 4-5% anual puede reducir significativamente el ahorro mensual necesario.',
        'Usa esta calculadora regularmente para monitorear tu progreso y ajustar tu plan de ahorro.',
      ],
      faq: [
        { q: '\u00bfCu\u00e1nto deber\u00eda ahorrar cada mes?', a: 'Los expertos recomiendan ahorrar al menos el 20% de tus ingresos.' },
        { q: '\u00bfLa calculadora considera el inter\u00e9s compuesto?', a: '\u00a1S\u00ed! Puedes ingresar una tasa de inter\u00e9s anual y la calculadora lo calcula autom\u00e1ticamente.' },
        { q: '\u00bfQu\u00e9 tasa de inter\u00e9s debo usar?', a: 'Para cuentas de ahorro de alto rendimiento, usa 4-5%. Para inversiones, 7-10% es com\u00fan.' },
        { q: '\u00bfC\u00f3mo puedo alcanzar mi meta m\u00e1s r\u00e1pido?', a: 'Aumenta tu contribuci\u00f3n mensual, busca mejores rendimientos o reduce gastos.' },
      ],
    },
    fr: {
      title: 'Calculateur d\'Objectif d\'\u00c9pargne Gratuit \u2014 Planifiez vos Objectifs Financiers',
      paragraphs: [
        'Le Calculateur d\'Objectif d\'\u00c9pargne vous aide \u00e0 d\u00e9terminer exactement combien vous devez \u00e9pargner chaque mois pour atteindre votre objectif financier.',
        'Entrez le montant cible, votre \u00e9pargne actuelle, le d\u00e9lai et le taux d\'int\u00e9r\u00eat attendu.',
        'Les int\u00e9r\u00eats compos\u00e9s travaillent en votre faveur. M\u00eame un rendement modeste de 4-5% peut r\u00e9duire significativement l\'\u00e9pargne mensuelle n\u00e9cessaire.',
        'Utilisez ce calculateur r\u00e9guli\u00e8rement pour suivre vos progr\u00e8s et ajuster votre plan.',
      ],
      faq: [
        { q: 'Combien devrais-je \u00e9pargner par mois ?', a: 'Les experts recommandent d\'\u00e9pargner au moins 20% de vos revenus.' },
        { q: 'Le calculateur tient-il compte des int\u00e9r\u00eats compos\u00e9s ?', a: 'Oui ! Vous pouvez entrer un taux annuel et le calculateur calcule les int\u00e9r\u00eats compos\u00e9s.' },
        { q: 'Quel taux d\'int\u00e9r\u00eat utiliser ?', a: 'Pour les comptes \u00e9pargne, 4-5%. Pour les investissements, 7-10% est courant.' },
        { q: 'Comment atteindre mon objectif plus vite ?', a: 'Augmentez votre contribution mensuelle, trouvez de meilleurs rendements ou r\u00e9duisez vos d\u00e9penses.' },
      ],
    },
    de: {
      title: 'Kostenloser Sparziel-Rechner \u2014 Planen Sie Ihre Finanzziele',
      paragraphs: [
        'Der Sparziel-Rechner hilft Ihnen herauszufinden, wie viel Sie monatlich sparen m\u00fcssen, um Ihr finanzielles Ziel zu erreichen.',
        'Geben Sie Zielbetrag, aktuelle Ersparnisse, Zeitraum und erwarteten Zinssatz ein.',
        'Der Zinseszins arbeitet zu Ihren Gunsten. Selbst eine bescheidene Rendite von 4-5% kann die monatliche Sparrate deutlich reduzieren.',
        'Verwenden Sie diesen Rechner regelm\u00e4\u00dfig, um Ihren Fortschritt zu verfolgen.',
      ],
      faq: [
        { q: 'Wie viel sollte ich monatlich sparen?', a: 'Experten empfehlen, mindestens 20% des Einkommens zu sparen.' },
        { q: 'Ber\u00fccksichtigt der Rechner Zinseszinsen?', a: 'Ja! Sie k\u00f6nnen einen j\u00e4hrlichen Zinssatz eingeben und der Rechner berechnet den Zinseszins.' },
        { q: 'Welchen Zinssatz sollte ich verwenden?', a: 'F\u00fcr Sparkonten 4-5%. F\u00fcr Investitionen sind 7-10% \u00fcblich.' },
        { q: 'Wie kann ich mein Ziel schneller erreichen?', a: 'Erh\u00f6hen Sie Ihren monatlichen Beitrag, finden Sie bessere Renditen oder reduzieren Sie Ausgaben.' },
      ],
    },
    pt: {
      title: 'Calculadora de Meta de Poupan\u00e7a Gr\u00e1tis \u2014 Planeje seus Objetivos Financeiros',
      paragraphs: [
        'A Calculadora de Meta de Poupan\u00e7a ajuda a determinar exatamente quanto voc\u00ea precisa poupar por m\u00eas para atingir seu objetivo financeiro.',
        'Insira o valor alvo, poupan\u00e7a atual, prazo e taxa de juros esperada.',
        'Os juros compostos trabalham a seu favor. Mesmo um rendimento modesto de 4-5% pode reduzir significativamente a poupan\u00e7a mensal necess\u00e1ria.',
        'Use esta calculadora regularmente para acompanhar seu progresso e ajustar seu plano.',
      ],
      faq: [
        { q: 'Quanto devo poupar por m\u00eas?', a: 'Especialistas recomendam poupar pelo menos 20% da renda.' },
        { q: 'A calculadora considera juros compostos?', a: 'Sim! Voc\u00ea pode inserir uma taxa anual e a calculadora calcula os juros compostos.' },
        { q: 'Qual taxa de juros usar?', a: 'Para contas poupan\u00e7a, 4-5%. Para investimentos, 7-10% \u00e9 comum.' },
        { q: 'Como posso atingir minha meta mais r\u00e1pido?', a: 'Aumente sua contribui\u00e7\u00e3o mensal, busque melhores rendimentos ou reduza despesas.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const formatCurrency = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <ToolPageWrapper toolSlug="savings-goal-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.goalAmount[lang]}</label>
              <input type="number" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} placeholder="10000" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.currentSavings[lang]}</label>
              <input type="number" value={currentSavings} onChange={(e) => setCurrentSavings(e.target.value)} placeholder="0" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.timeframe[lang]}</label>
              <input type="number" value={months} onChange={(e) => setMonths(e.target.value)} placeholder="24" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.interestRate[lang]}</label>
              <input type="number" value={annualRate} onChange={(e) => setAnnualRate(e.target.value)} placeholder="5" step="0.1" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {period > 0 && goal > 0 && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                <div className="text-xs text-blue-600 font-medium mb-1">{labels.monthlyNeeded[lang]}</div>
                <div className="text-4xl font-bold text-gray-900">${formatCurrency(monthlyNeeded)}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">{labels.weekly[lang]}</div>
                  <div className="text-xl font-bold text-gray-900">${formatCurrency(weeklySavings)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">{labels.daily[lang]}</div>
                  <div className="text-xl font-bold text-gray-900">${formatCurrency(dailySavings)}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">{labels.breakdown[lang]}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-gray-500 text-sm">{labels.totalContributions[lang]}</span><span className="font-semibold">${formatCurrency(totalContributions)}</span></div>
                  {totalInterest > 0 && <div className="flex justify-between"><span className="text-gray-500 text-sm">{labels.interestEarned[lang]}</span><span className="font-semibold text-green-600">+${formatCurrency(totalInterest)}</span></div>}
                </div>
              </div>
            </>
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
                  <span className="text-gray-400">{openFaq === i ? '\u2212' : '+'}</span>
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
