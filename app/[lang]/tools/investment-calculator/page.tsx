'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface HistoryEntry {
  finalValue: number;
  totalContributions: number;
  totalReturns: number;
  timestamp: string;
}

const labels: Record<string, Record<string, string>> = {
  initialInvestment: { en: 'Initial Investment', it: 'Investimento Iniziale', es: 'Inversión Inicial', fr: 'Investissement Initial', de: 'Anfangsinvestition', pt: 'Investimento Inicial' },
  monthlyContribution: { en: 'Monthly Contribution', it: 'Contributo Mensile', es: 'Contribución Mensual', fr: 'Contribution Mensuelle', de: 'Monatlicher Beitrag', pt: 'Contribuição Mensal' },
  annualReturn: { en: 'Expected Annual Return (%)', it: 'Rendimento Annuo Atteso (%)', es: 'Rendimiento Anual Esperado (%)', fr: 'Rendement Annuel Attendu (%)', de: 'Erwartete Jahresrendite (%)', pt: 'Retorno Anual Esperado (%)' },
  timePeriod: { en: 'Time Period (years)', it: 'Periodo (anni)', es: 'Período (años)', fr: 'Période (années)', de: 'Zeitraum (Jahre)', pt: 'Período (anos)' },
  finalValue: { en: 'Final Value', it: 'Valore Finale', es: 'Valor Final', fr: 'Valeur Finale', de: 'Endwert', pt: 'Valor Final' },
  totalContributions: { en: 'Total Contributions', it: 'Contributi Totali', es: 'Contribuciones Totales', fr: 'Contributions Totales', de: 'Gesamtbeiträge', pt: 'Contribuições Totais' },
  totalReturns: { en: 'Total Returns', it: 'Rendimenti Totali', es: 'Rendimientos Totales', fr: 'Rendements Totaux', de: 'Gesamtrendite', pt: 'Retornos Totais' },
  growthBreakdown: { en: 'Growth Breakdown', it: 'Dettaglio Crescita', es: 'Desglose del Crecimiento', fr: 'Détail de la Croissance', de: 'Wachstumsaufschlüsselung', pt: 'Detalhamento do Crescimento' },
  reset: { en: 'Reset', it: 'Reimposta', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  copy: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier les Résultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
  copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié!', de: 'Kopiert!', pt: 'Copiado!' },
  history: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
  returnMultiple: { en: 'Return Multiple', it: 'Multiplo di Ritorno', es: 'Múltiplo de Retorno', fr: 'Multiple de Retour', de: 'Renditefaktor', pt: 'Múltiplo de Retorno' },
  invalidRate: { en: 'Rate: 0-50%', it: 'Tasso: 0-50%', es: 'Tasa: 0-50%', fr: 'Taux: 0-50%', de: 'Satz: 0-50%', pt: 'Taxa: 0-50%' },
  invalidYears: { en: 'Years: 1-50', it: 'Anni: 1-50', es: 'Años: 1-50', fr: 'Années: 1-50', de: 'Jahre: 1-50', pt: 'Anos: 1-50' },
};

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: {
    title: 'How to Calculate Investment Growth with Compound Interest',
    paragraphs: [
      'Investing is one of the most effective ways to build long-term wealth. An investment calculator helps you project how your money can grow over time through the power of compound interest and regular contributions. Whether you are planning for retirement, saving for a home, or building an emergency fund, understanding potential investment growth is essential for making informed financial decisions.',
      'Compound interest is often called the eighth wonder of the world. Unlike simple interest, which only earns returns on your initial investment, compound interest earns returns on both your principal and previously accumulated returns. This snowball effect becomes more powerful over time — the longer your investment horizon, the greater the compounding benefit. Even small differences in return rates can result in dramatically different outcomes over decades.',
      'Regular monthly contributions amplify the compounding effect significantly. Dollar-cost averaging — investing a fixed amount regularly regardless of market conditions — reduces the impact of market volatility on your portfolio. By consistently investing, you buy more shares when prices are low and fewer when prices are high, potentially lowering your average cost per share over time.',
      'This investment calculator models growth with compound interest applied monthly. Enter your initial investment, monthly contribution, expected annual return rate, and time period to see your projected final value, total contributions, and total returns earned. The breakdown shows exactly how much of your final balance comes from your own contributions versus investment returns, illustrating the true power of compounding.',
    ],
    faq: [
      { q: 'What is compound interest?', a: 'Compound interest is interest calculated on both the initial principal and the accumulated interest from previous periods. It makes your investment grow exponentially over time, unlike simple interest which only calculates on the original amount.' },
      { q: 'What is a realistic annual return rate?', a: 'Historically, the US stock market (S&P 500) has returned about 10% annually before inflation, or roughly 7% after inflation. Bond returns average 4-6%. A balanced portfolio might expect 6-8% annually. Conservative estimates use 5-7%.' },
      { q: 'How does the time period affect investment growth?', a: 'Time is the most powerful factor in compound growth. Investing $500/month at 7% for 20 years yields about $260,000, but continuing for 30 years yields about $567,000. The extra 10 years more than doubles the result due to compounding.' },
      { q: 'Should I invest a lump sum or contribute monthly?', a: 'If you have a lump sum, investing it all at once statistically performs better about two-thirds of the time. However, monthly contributions (dollar-cost averaging) reduce risk and are more practical for most people building wealth from income.' },
      { q: 'Does this calculator account for taxes and fees?', a: 'This calculator shows gross returns before taxes and investment fees. Actual returns will be lower due to capital gains taxes, fund expense ratios, and trading fees. Consider using a lower return rate to approximate after-tax, after-fee returns.' },
    ],
  },
  it: { title: 'Come Calcolare la Crescita degli Investimenti con l\'Interesse Composto', paragraphs: ['Investire e uno dei modi piu efficaci per costruire ricchezza a lungo termine. Un calcolatore di investimenti aiuta a proiettare come il denaro puo crescere nel tempo grazie al potere dell\'interesse composto e dei contributi regolari. Che si stia pianificando la pensione o risparmiando per una casa, comprendere la potenziale crescita e essenziale.','L\'interesse composto e spesso chiamato l\'ottava meraviglia del mondo. A differenza dell\'interesse semplice, l\'interesse composto genera rendimenti sia sul capitale iniziale che sui rendimenti precedentemente accumulati. Questo effetto valanga diventa piu potente nel tempo — piu lungo e l\'orizzonte di investimento, maggiore e il beneficio della capitalizzazione.','I contributi mensili regolari amplificano significativamente l\'effetto composto. Investire un importo fisso regolarmente, indipendentemente dalle condizioni di mercato, riduce l\'impatto della volatilita. Investendo costantemente, si acquistano piu quote quando i prezzi sono bassi e meno quando sono alti.','Questo calcolatore modella la crescita con interesse composto applicato mensilmente. Inserisci l\'investimento iniziale, il contributo mensile, il rendimento annuo atteso e il periodo per vedere il valore finale proiettato, i contributi totali e i rendimenti totali.'], faq: [{ q: 'Cos\'e l\'interesse composto?', a: 'L\'interesse composto e l\'interesse calcolato sia sul capitale iniziale che sugli interessi accumulati nei periodi precedenti. Fa crescere l\'investimento esponenzialmente nel tempo.' },{ q: 'Qual e un tasso di rendimento annuo realistico?', a: 'Storicamente, i mercati azionari hanno reso circa il 7-10% annuo. I titoli di stato rendono il 3-5%. Un portafoglio bilanciato puo aspettarsi il 5-7% annuo. Stime conservative usano il 4-6%.' },{ q: 'Come influisce il periodo sulla crescita?', a: 'Il tempo e il fattore piu potente. Investire 500 euro al mese al 7% per 20 anni produce circa 260.000 euro, ma continuando per 30 anni si arriva a circa 567.000 euro. I 10 anni extra piu che raddoppiano il risultato.' },{ q: 'Meglio investire tutto subito o mensilmente?', a: 'Se si ha una somma, investirla tutta subito funziona meglio circa due terzi delle volte. Tuttavia, i contributi mensili riducono il rischio e sono piu pratici per la maggior parte delle persone.' },{ q: 'Il calcolatore tiene conto di tasse e commissioni?', a: 'Questo calcolatore mostra i rendimenti lordi. I rendimenti effettivi saranno inferiori per via di tasse sulle plusvalenze e commissioni. Considera di usare un tasso inferiore per approssimare i rendimenti netti.' }] },
  es: { title: 'Como Calcular el Crecimiento de Inversiones con Interes Compuesto', paragraphs: ['Invertir es una de las formas mas efectivas de construir riqueza a largo plazo. Una calculadora de inversiones ayuda a proyectar como puede crecer tu dinero con el tiempo gracias al interes compuesto y las contribuciones regulares. Ya sea que estes planificando tu jubilacion o ahorrando para una casa, comprender el crecimiento potencial es esencial.','El interes compuesto es frecuentemente llamado la octava maravilla del mundo. A diferencia del interes simple, el interes compuesto genera rendimientos tanto sobre el capital inicial como sobre los rendimientos previamente acumulados. Este efecto bola de nieve se vuelve mas poderoso con el tiempo.','Las contribuciones mensuales regulares amplifican significativamente el efecto compuesto. Invertir una cantidad fija regularmente reduce el impacto de la volatilidad del mercado en tu portafolio.','Esta calculadora modela el crecimiento con interes compuesto aplicado mensualmente. Ingresa tu inversion inicial, contribucion mensual, tasa de rendimiento anual esperada y periodo para ver el valor final proyectado.'], faq: [{ q: 'Que es el interes compuesto?', a: 'El interes compuesto es el interes calculado sobre el capital inicial y los intereses acumulados. Hace que tu inversion crezca exponencialmente con el tiempo.' },{ q: 'Cual es una tasa de rendimiento anual realista?', a: 'Historicamente, los mercados bursatiles han rendido alrededor del 7-10% anual. Un portafolio equilibrado puede esperar 5-7% anual. Estimaciones conservadoras usan 4-6%.' },{ q: 'Como afecta el periodo al crecimiento?', a: 'El tiempo es el factor mas poderoso. Invertir 500 dolares al mes al 7% por 20 anos produce unos $260,000, pero por 30 anos llega a unos $567,000.' },{ q: 'Es mejor invertir todo de una vez o mensualmente?', a: 'Invertir todo de una vez funciona mejor estadisticamente dos tercios de las veces. Sin embargo, las contribuciones mensuales reducen el riesgo y son mas practicas.' },{ q: 'La calculadora tiene en cuenta impuestos y comisiones?', a: 'Esta calculadora muestra rendimientos brutos. Los rendimientos reales seran menores por impuestos y comisiones. Usa una tasa menor para aproximar rendimientos netos.' }] },
  fr: { title: 'Comment Calculer la Croissance des Investissements avec les Interets Composes', paragraphs: ['Investir est l\'un des moyens les plus efficaces de construire un patrimoine a long terme. Un calculateur d\'investissement aide a projeter la croissance de votre argent grace aux interets composes et aux contributions regulieres. Que vous planifiiez votre retraite ou epargniez pour un achat important, comprendre la croissance potentielle est essentiel.','Les interets composes sont souvent appeles la huitieme merveille du monde. Contrairement aux interets simples, les interets composes generent des rendements sur le capital initial et sur les rendements precedemment accumules. Cet effet boule de neige devient plus puissant avec le temps.','Les contributions mensuelles regulieres amplifient considerablement l\'effet compose. Investir un montant fixe regulierement reduit l\'impact de la volatilite du marche sur votre portefeuille.','Ce calculateur modelise la croissance avec des interets composes appliques mensuellement. Entrez votre investissement initial, contribution mensuelle, taux de rendement annuel et periode pour voir la valeur finale projetee.'], faq: [{ q: 'Qu\'est-ce que les interets composes?', a: 'Les interets composes sont calcules sur le capital initial et les interets accumules. Ils font croitre votre investissement de maniere exponentielle avec le temps.' },{ q: 'Quel est un taux de rendement annuel realiste?', a: 'Historiquement, les marches boursiers ont rapporte environ 7-10% par an. Un portefeuille equilibre peut s\'attendre a 5-7% annuellement.' },{ q: 'Comment la duree affecte-t-elle la croissance?', a: 'Le temps est le facteur le plus puissant. Investir 500 euros par mois a 7% pendant 20 ans produit environ 260 000 euros, mais pendant 30 ans atteint environ 567 000 euros.' },{ q: 'Vaut-il mieux investir en une fois ou mensuellement?', a: 'Investir en une seule fois fonctionne mieux statistiquement deux tiers du temps. Cependant, les contributions mensuelles reduisent le risque.' },{ q: 'Le calculateur tient-il compte des impots et frais?', a: 'Ce calculateur montre les rendements bruts. Les rendements reels seront inferieurs en raison des impots et des frais. Utilisez un taux plus bas pour approximer les rendements nets.' }] },
  de: { title: 'So Berechnen Sie das Investitionswachstum mit Zinseszins', paragraphs: ['Investieren ist einer der effektivsten Wege, langfristig Vermoegen aufzubauen. Ein Investitionsrechner hilft Ihnen, das Wachstum Ihres Geldes durch Zinseszins und regelmaessige Beitraege zu projizieren. Ob Sie fuer den Ruhestand planen oder fuer ein Eigenheim sparen — das potenzielle Wachstum zu verstehen ist entscheidend.','Zinseszins wird oft als das achte Weltwunder bezeichnet. Im Gegensatz zu einfachen Zinsen erzeugt Zinseszins Ertraege sowohl auf das Anfangskapital als auch auf zuvor angesammelte Ertraege. Dieser Schneeballeffekt wird mit der Zeit staerker.','Regelmaessige monatliche Beitraege verstaerken den Zinseszinseffekt erheblich. Einen festen Betrag regelmaessig zu investieren reduziert den Einfluss der Marktvolatilitaet auf Ihr Portfolio.','Dieser Rechner modelliert das Wachstum mit monatlich angewendetem Zinseszins. Geben Sie Ihre Anfangsinvestition, monatlichen Beitrag, erwartete Jahresrendite und Zeitraum ein, um den projizierten Endwert zu sehen.'], faq: [{ q: 'Was ist Zinseszins?', a: 'Zinseszins wird auf das Anfangskapital und die angesammelten Zinsen berechnet. Er laesst Ihre Investition exponentiell ueber die Zeit wachsen.' },{ q: 'Was ist eine realistische Jahresrendite?', a: 'Historisch haben Aktienmaerkte etwa 7-10% jaehrlich erzielt. Ein ausgewogenes Portfolio kann 5-7% erwarten. Konservative Schaetzungen verwenden 4-6%.' },{ q: 'Wie beeinflusst der Zeitraum das Wachstum?', a: 'Zeit ist der maechtigste Faktor. 500 Euro monatlich bei 7% fuer 20 Jahre ergibt ca. 260.000 Euro, bei 30 Jahren ca. 567.000 Euro.' },{ q: 'Ist es besser, alles auf einmal oder monatlich zu investieren?', a: 'Alles auf einmal zu investieren funktioniert statistisch in zwei Dritteln der Faelle besser. Monatliche Beitraege reduzieren jedoch das Risiko.' },{ q: 'Beruecksichtigt der Rechner Steuern und Gebuehren?', a: 'Dieser Rechner zeigt Bruttoertraege. Die tatsaechlichen Ertraege sind nach Steuern und Gebuehren geringer. Verwenden Sie eine niedrigere Rate fuer Nettoertraege.' }] },
  pt: { title: 'Como Calcular o Crescimento de Investimentos com Juros Compostos', paragraphs: ['Investir e uma das formas mais eficazes de construir riqueza a longo prazo. Uma calculadora de investimentos ajuda a projetar como seu dinheiro pode crescer ao longo do tempo gracas aos juros compostos e contribuicoes regulares. Seja planejando a aposentadoria ou poupando para uma casa, entender o crescimento potencial e essencial.','Os juros compostos sao frequentemente chamados de oitava maravilha do mundo. Diferentemente dos juros simples, os juros compostos geram retornos tanto sobre o capital inicial quanto sobre os retornos previamente acumulados. Este efeito bola de neve se torna mais poderoso com o tempo.','Contribuicoes mensais regulares amplificam significativamente o efeito composto. Investir um valor fixo regularmente reduz o impacto da volatilidade do mercado no seu portfolio.','Esta calculadora modela o crescimento com juros compostos aplicados mensalmente. Insira seu investimento inicial, contribuicao mensal, taxa de retorno anual esperada e periodo para ver o valor final projetado.'], faq: [{ q: 'O que sao juros compostos?', a: 'Juros compostos sao calculados sobre o capital inicial e os juros acumulados. Fazem seu investimento crescer exponencialmente ao longo do tempo.' },{ q: 'Qual e uma taxa de retorno anual realista?', a: 'Historicamente, os mercados de acoes renderam cerca de 7-10% ao ano. Um portfolio equilibrado pode esperar 5-7% anualmente.' },{ q: 'Como o periodo afeta o crescimento?', a: 'O tempo e o fator mais poderoso. Investir R$500 por mes a 7% por 20 anos produz cerca de R$260.000, mas por 30 anos chega a cerca de R$567.000.' },{ q: 'E melhor investir tudo de uma vez ou mensalmente?', a: 'Investir tudo de uma vez funciona melhor estatisticamente dois tercos das vezes. Porem, contribuicoes mensais reduzem o risco.' },{ q: 'A calculadora considera impostos e taxas?', a: 'Esta calculadora mostra retornos brutos. Os retornos reais serao menores por impostos e taxas. Use uma taxa menor para aproximar retornos liquidos.' }] },
};

export default function InvestmentCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['investment-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [initial, setInitial] = useState('');
  const [monthly, setMonthly] = useState('');
  const [rate, setRate] = useState('7');
  const [years, setYears] = useState('10');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const initialNum = parseFloat(initial) || 0;
  const monthlyNum = parseFloat(monthly) || 0;
  const rateNum = parseFloat(rate) || 0;
  const yearsNum = parseInt(years) || 0;

  const rateInvalid = rate !== '' && (rateNum < 0 || rateNum > 50);
  const yearsInvalid = years !== '' && (yearsNum < 1 || yearsNum > 50);

  const monthlyRate = rateNum / 100 / 12;
  const totalMonths = yearsNum * 12;
  const totalContributions = initialNum + monthlyNum * totalMonths;

  let finalValue = 0;
  if (monthlyRate > 0 && totalMonths > 0) {
    const compoundInitial = initialNum * Math.pow(1 + monthlyRate, totalMonths);
    const compoundMonthly = monthlyNum * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
    finalValue = compoundInitial + compoundMonthly;
  } else if (totalMonths > 0) {
    finalValue = totalContributions;
  }

  const totalReturns = finalValue - totalContributions;
  const returnMultiple = totalContributions > 0 ? finalValue / totalContributions : 0;
  const hasResult = (initialNum > 0 || monthlyNum > 0) && yearsNum > 0;

  const resetAll = () => {
    setInitial(''); setMonthly(''); setRate('7'); setYears('10'); setCopied(false);
  };

  const copyResults = () => {
    const text = `${t('finalValue')}: $${finalValue.toFixed(2)} | ${t('totalContributions')}: $${totalContributions.toFixed(2)} | ${t('totalReturns')}: $${totalReturns.toFixed(2)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveToHistory = () => {
    if (!hasResult) return;
    setHistory(prev => [{ finalValue, totalContributions, totalReturns, timestamp: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="investment-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('initialInvestment')}</label>
            <input type="number" value={initial} onChange={(e) => setInitial(e.target.value)} placeholder="0.00"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('monthlyContribution')}</label>
            <input type="number" value={monthly} onChange={(e) => setMonthly(e.target.value)} placeholder="0.00"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('annualReturn')}</label>
            <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="7"
              className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${rateInvalid ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {rateInvalid && <p className="text-red-500 text-xs mt-1">{t('invalidRate')}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('timePeriod')}</label>
            <input type="number" value={years} onChange={(e) => setYears(e.target.value)} placeholder="10"
              className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${yearsInvalid ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {yearsInvalid && <p className="text-red-500 text-xs mt-1">{t('invalidYears')}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {hasResult && (
              <>
                <button onClick={copyResults} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                  {copied ? t('copied') : t('copy')}
                </button>
                <button onClick={saveToHistory} className="px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium text-blue-700 transition-colors">
                  + {t('history')}
                </button>
              </>
            )}
            <button onClick={resetAll} className="px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium text-red-600 transition-colors ml-auto">
              {t('reset')}
            </button>
          </div>

          {hasResult && (
            <>
              {/* Result Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <div className="text-xs text-green-600 font-medium">{t('finalValue')}</div>
                  <div className="text-2xl font-bold text-green-700">${finalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <div className="text-xs text-blue-600 font-medium">{t('totalContributions')}</div>
                  <div className="text-2xl font-bold text-blue-700">${totalContributions.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                  <div className="text-xs text-purple-600 font-medium">{t('totalReturns')}</div>
                  <div className="text-2xl font-bold text-purple-700">+${totalReturns.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                </div>
              </div>

              {/* Return Multiple */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                <span className="text-sm text-gray-600">{t('returnMultiple')}: </span>
                <span className="text-lg font-bold text-gray-900">{returnMultiple.toFixed(2)}x</span>
              </div>

              {/* Progress Bar */}
              {totalContributions > 0 && (
                <div>
                  <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden flex">
                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${Math.min((totalContributions / finalValue) * 100, 100)}%` }}></div>
                    <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${Math.min((totalReturns / finalValue) * 100, 100)}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span className="text-blue-600">{t('totalContributions')}: {((totalContributions / finalValue) * 100).toFixed(1)}%</span>
                    <span className="text-green-600">{t('totalReturns')}: {((totalReturns / finalValue) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('history')}</h3>
              <div className="space-y-1">
                {history.map((entry, i) => (
                  <div key={i} className="flex justify-between text-sm text-gray-600 bg-white rounded px-3 py-1.5 border border-gray-100">
                    <span className="font-semibold text-green-600">${entry.finalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    <span className="text-purple-600">+${entry.totalReturns.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
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
