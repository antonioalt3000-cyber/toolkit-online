'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function RoiCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['roi-calculator'][lang];

  const [initialInvestment, setInitialInvestment] = useState('');
  const [finalValue, setFinalValue] = useState('');
  const [years, setYears] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ invest: string; roi: string }[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const initial = parseFloat(initialInvestment) || 0;
  const final_ = parseFloat(finalValue) || 0;
  const yrs = parseFloat(years) || 0;

  const netProfit = final_ - initial;
  const roi = initial > 0 ? (netProfit / initial) * 100 : 0;
  const annualizedRoi = initial > 0 && yrs > 0 ? (Math.pow(final_ / initial, 1 / yrs) - 1) * 100 : 0;
  const hasResult = initialInvestment !== '' && finalValue !== '' && initial > 0;

  // Track history
  const prevInvest = useState('');
  if (hasResult && initialInvestment !== prevInvest[0]) {
    prevInvest[1](initialInvestment);
    setHistory(prev => [{ invest: formatCurrency(initial), roi: `${roi >= 0 ? '+' : ''}${roi.toFixed(2)}%` }, ...prev].slice(0, 5));
  }

  const labels = {
    initialInvestment: { en: 'Initial Investment', it: 'Investimento Iniziale', es: 'Inversión Inicial', fr: 'Investissement Initial', de: 'Anfangsinvestition', pt: 'Investimento Inicial' },
    finalValue: { en: 'Final Value', it: 'Valore Finale', es: 'Valor Final', fr: 'Valeur Finale', de: 'Endwert', pt: 'Valor Final' },
    years: { en: 'Time Period (years)', it: 'Periodo (anni)', es: 'Período (años)', fr: 'Période (années)', de: 'Zeitraum (Jahre)', pt: 'Período (anos)' },
    roi: { en: 'ROI', it: 'ROI', es: 'ROI', fr: 'ROI', de: 'ROI', pt: 'ROI' },
    annualizedRoi: { en: 'Annualized ROI', it: 'ROI Annualizzato', es: 'ROI Anualizado', fr: 'ROI Annualisé', de: 'Jährliche ROI', pt: 'ROI Anualizado' },
    netProfit: { en: 'Net Profit/Loss', it: 'Profitto/Perdita Netta', es: 'Beneficio/Pérdida Neta', fr: 'Profit/Perte Net', de: 'Nettogewinn/-verlust', pt: 'Lucro/Prejuízo Líquido' },
    profit: { en: 'Profit', it: 'Profitto', es: 'Beneficio', fr: 'Profit', de: 'Gewinn', pt: 'Lucro' },
    loss: { en: 'Loss', it: 'Perdita', es: 'Pérdida', fr: 'Perte', de: 'Verlust', pt: 'Prejuízo' },
    optional: { en: '(optional, for annualized ROI)', it: '(opzionale, per ROI annualizzato)', es: '(opcional, para ROI anualizado)', fr: '(optionnel, pour ROI annualisé)', de: '(optional, für jährliche ROI)', pt: '(opcional, para ROI anualizado)' },
    reset: { en: 'Reset', it: 'Reset', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Reiniciar' },
    copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
    copy: { en: 'Copy Result', it: 'Copia Risultato', es: 'Copiar Resultado', fr: 'Copier le Résultat', de: 'Ergebnis Kopieren', pt: 'Copiar Resultado' },
    historyLabel: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
    invalidInvestment: { en: 'Enter a positive investment amount', it: 'Inserisci un importo positivo', es: 'Ingresa un monto positivo', fr: 'Entrez un montant positif', de: 'Geben Sie einen positiven Betrag ein', pt: 'Insira um valor positivo' },
  } as Record<string, Record<Locale, string>>;

  const formatCurrency = (value: number) => {
    return value.toLocaleString(lang === 'en' ? 'en-US' : lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free ROI Calculator – Calculate Return on Investment Online',
      paragraphs: [
        'Return on Investment (ROI) is one of the most widely used financial metrics for evaluating the efficiency of an investment. It measures the percentage return relative to the initial cost, providing a simple way to compare the profitability of different investments regardless of their size or duration.',
        'The basic ROI formula is: ROI = ((Final Value - Initial Investment) / Initial Investment) x 100. A positive ROI indicates a profit, while a negative ROI indicates a loss. For example, if you invest $10,000 and it grows to $15,000, your ROI is 50%. Our calculator computes this instantly along with the net profit amount.',
        'For investments held over multiple years, annualized ROI provides a more meaningful comparison. It accounts for the compounding effect and normalizes returns to an annual basis. The formula is: Annualized ROI = ((Final Value / Initial Investment)^(1/years) - 1) x 100. This allows fair comparison between a 2-year investment returning 30% and a 5-year investment returning 60%.',
        'ROI is used across industries — from evaluating marketing campaigns and real estate purchases to assessing business projects and stock market investments. While powerful in its simplicity, ROI has limitations: it does not account for risk, inflation, opportunity cost, or the time value of money. For comprehensive investment analysis, consider combining ROI with metrics like NPV, IRR, and payback period.',
      ],
      faq: [
        { q: 'What is a good ROI?', a: 'A "good" ROI depends on the context. For the stock market, the historical average annual return is about 7-10% after inflation. Real estate typically targets 8-12% annually. Marketing campaigns often aim for 5:1 return (400% ROI). For business projects, any positive ROI above the cost of capital is generally considered acceptable.' },
        { q: 'What is the difference between ROI and annualized ROI?', a: 'ROI shows the total percentage return over the entire investment period, regardless of duration. Annualized ROI normalizes this to a yearly rate, accounting for compounding. For example, a 50% ROI over 5 years equals about 8.45% annualized ROI. Annualized ROI is better for comparing investments of different durations.' },
        { q: 'How do I calculate ROI for multiple investments?', a: 'Calculate ROI individually for each investment using the formula: ((Final Value - Cost) / Cost) x 100. To compare them fairly, use annualized ROI if they have different time periods. For a portfolio, calculate the overall ROI by using the total cost and total final value of all investments combined.' },
        { q: 'Does ROI account for inflation?', a: 'No, the basic ROI formula does not account for inflation. The result is a "nominal" return. To get the "real" return (adjusted for inflation), subtract the inflation rate from your ROI. For example, a 10% ROI with 3% inflation gives approximately 7% real return.' },
        { q: 'What are the limitations of ROI?', a: 'ROI does not consider risk level, time duration (unless annualized), inflation, taxes, opportunity cost, or cash flow timing. Two investments with the same ROI may have very different risk profiles. For comprehensive analysis, use ROI alongside other metrics like Net Present Value (NPV), Internal Rate of Return (IRR), and risk-adjusted returns.' },
      ],
    },
    it: {
      title: 'Calcolatore ROI Gratuito – Calcola il Rendimento dell\'Investimento Online',
      paragraphs: [
        'Il Return on Investment (ROI) è una delle metriche finanziarie più utilizzate per valutare l\'efficienza di un investimento. Misura il rendimento percentuale rispetto al costo iniziale, fornendo un modo semplice per confrontare la redditività di diversi investimenti.',
        'La formula base del ROI è: ROI = ((Valore Finale - Investimento Iniziale) / Investimento Iniziale) x 100. Un ROI positivo indica un profitto, mentre un ROI negativo indica una perdita. Per esempio, se investi 10.000€ e crescono a 15.000€, il tuo ROI è del 50%.',
        'Per investimenti mantenuti per più anni, il ROI annualizzato fornisce un confronto più significativo. Tiene conto dell\'effetto di capitalizzazione e normalizza i rendimenti su base annuale. La formula è: ROI Annualizzato = ((Valore Finale / Investimento Iniziale)^(1/anni) - 1) x 100.',
        'Il ROI è usato in tutti i settori — dalla valutazione di campagne marketing e acquisti immobiliari alla valutazione di progetti aziendali. Pur essendo potente nella sua semplicità, il ROI ha limitazioni: non tiene conto del rischio, dell\'inflazione o del valore temporale del denaro.',
      ],
      faq: [
        { q: 'Cos\'è un buon ROI?', a: 'Un "buon" ROI dipende dal contesto. Per il mercato azionario, il rendimento medio annuo storico è circa 7-10% dopo l\'inflazione. L\'immobiliare punta tipicamente all\'8-12% annuo. Per progetti aziendali, qualsiasi ROI positivo sopra il costo del capitale è considerato accettabile.' },
        { q: 'Qual è la differenza tra ROI e ROI annualizzato?', a: 'Il ROI mostra il rendimento percentuale totale sull\'intero periodo di investimento. Il ROI annualizzato normalizza questo a un tasso annuo. Per esempio, un ROI del 50% in 5 anni equivale a circa l\'8,45% annualizzato.' },
        { q: 'Come si calcola il ROI per investimenti multipli?', a: 'Calcola il ROI individualmente per ogni investimento. Per confrontarli equamente, usa il ROI annualizzato se hanno periodi diversi. Per un portafoglio, calcola il ROI complessivo usando il costo totale e il valore finale totale.' },
        { q: 'Il ROI tiene conto dell\'inflazione?', a: 'No, la formula base del ROI non tiene conto dell\'inflazione. Per ottenere il rendimento "reale", sottrai il tasso di inflazione dal ROI. Per esempio, un ROI del 10% con inflazione al 3% dà circa il 7% di rendimento reale.' },
        { q: 'Quali sono i limiti del ROI?', a: 'Il ROI non considera il livello di rischio, la durata (se non annualizzato), l\'inflazione, le tasse o il costo opportunità. Per un\'analisi completa, usa il ROI insieme ad altre metriche come il Valore Attuale Netto (VAN) e il Tasso Interno di Rendimento (TIR).' },
      ],
    },
    es: {
      title: 'Calculadora de ROI Gratis – Calcula el Retorno de Inversión Online',
      paragraphs: [
        'El Retorno de Inversión (ROI) es una de las métricas financieras más utilizadas para evaluar la eficiencia de una inversión. Mide el rendimiento porcentual relativo al costo inicial, proporcionando una forma simple de comparar la rentabilidad de diferentes inversiones.',
        'La fórmula básica es: ROI = ((Valor Final - Inversión Inicial) / Inversión Inicial) x 100. Un ROI positivo indica ganancia, mientras que un ROI negativo indica pérdida. Por ejemplo, si inviertes $10,000 y crece a $15,000, tu ROI es del 50%.',
        'Para inversiones mantenidas por varios años, el ROI anualizado proporciona una comparación más significativa. La fórmula es: ROI Anualizado = ((Valor Final / Inversión Inicial)^(1/años) - 1) x 100.',
        'El ROI se usa en todas las industrias — desde evaluar campañas de marketing hasta valorar proyectos empresariales e inversiones inmobiliarias. Aunque poderoso, el ROI tiene limitaciones: no considera el riesgo, la inflación ni el valor del dinero en el tiempo.',
      ],
      faq: [
        { q: '¿Qué es un buen ROI?', a: 'Un "buen" ROI depende del contexto. Para el mercado de valores, el rendimiento anual promedio histórico es alrededor del 7-10% después de la inflación. Bienes raíces típicamente apunta al 8-12% anual.' },
        { q: '¿Cuál es la diferencia entre ROI y ROI anualizado?', a: 'El ROI muestra el rendimiento porcentual total sobre todo el período. El ROI anualizado lo normaliza a una tasa anual. Un ROI del 50% en 5 años equivale a aproximadamente 8,45% anualizado.' },
        { q: '¿Cómo calculo el ROI de múltiples inversiones?', a: 'Calcula el ROI individualmente para cada inversión. Para compararlos equitativamente, usa el ROI anualizado si tienen períodos diferentes.' },
        { q: '¿El ROI considera la inflación?', a: 'No. Para obtener el rendimiento "real", resta la tasa de inflación del ROI. Un ROI del 10% con inflación del 3% da aproximadamente 7% de rendimiento real.' },
        { q: '¿Cuáles son las limitaciones del ROI?', a: 'El ROI no considera el nivel de riesgo, la duración, la inflación, los impuestos ni el costo de oportunidad. Para un análisis completo, usa el ROI junto con otras métricas como el VAN y la TIR.' },
      ],
    },
    fr: {
      title: 'Calculateur de ROI Gratuit – Calculez le Retour sur Investissement en Ligne',
      paragraphs: [
        'Le Retour sur Investissement (ROI) est l\'une des métriques financières les plus utilisées pour évaluer l\'efficacité d\'un investissement. Il mesure le rendement en pourcentage par rapport au coût initial, offrant un moyen simple de comparer la rentabilité de différents investissements.',
        'La formule de base est : ROI = ((Valeur Finale - Investissement Initial) / Investissement Initial) x 100. Un ROI positif indique un profit, tandis qu\'un ROI négatif indique une perte. Par exemple, si vous investissez 10 000€ et que cela atteint 15 000€, votre ROI est de 50%.',
        'Pour les investissements sur plusieurs années, le ROI annualisé offre une comparaison plus pertinente. La formule est : ROI Annualisé = ((Valeur Finale / Investissement Initial)^(1/années) - 1) x 100.',
        'Le ROI est utilisé dans tous les secteurs. Bien que puissant dans sa simplicité, le ROI a des limitations : il ne tient pas compte du risque, de l\'inflation ou de la valeur temporelle de l\'argent.',
      ],
      faq: [
        { q: 'Qu\'est-ce qu\'un bon ROI ?', a: 'Un "bon" ROI dépend du contexte. Pour le marché boursier, le rendement annuel moyen historique est d\'environ 7-10% après inflation. L\'immobilier vise typiquement 8-12% par an.' },
        { q: 'Quelle est la différence entre ROI et ROI annualisé ?', a: 'Le ROI montre le rendement total en pourcentage sur toute la période. Le ROI annualisé le normalise en taux annuel. Un ROI de 50% sur 5 ans équivaut à environ 8,45% annualisé.' },
        { q: 'Comment calculer le ROI de plusieurs investissements ?', a: 'Calculez le ROI individuellement pour chaque investissement. Pour une comparaison équitable, utilisez le ROI annualisé si les périodes diffèrent.' },
        { q: 'Le ROI tient-il compte de l\'inflation ?', a: 'Non. Pour obtenir le rendement "réel", soustrayez le taux d\'inflation du ROI. Un ROI de 10% avec 3% d\'inflation donne environ 7% de rendement réel.' },
        { q: 'Quelles sont les limitations du ROI ?', a: 'Le ROI ne considère pas le risque, la durée, l\'inflation, les taxes ni le coût d\'opportunité. Pour une analyse complète, utilisez le ROI avec d\'autres métriques comme la VAN et le TRI.' },
      ],
    },
    de: {
      title: 'Kostenloser ROI-Rechner – Kapitalrendite Online Berechnen',
      paragraphs: [
        'Die Kapitalrendite (ROI - Return on Investment) ist eine der am häufigsten verwendeten Finanzkennzahlen zur Bewertung der Effizienz einer Investition. Sie misst den prozentualen Ertrag im Verhältnis zu den Anfangskosten und bietet eine einfache Möglichkeit, die Rentabilität verschiedener Investitionen zu vergleichen.',
        'Die Grundformel lautet: ROI = ((Endwert - Anfangsinvestition) / Anfangsinvestition) x 100. Ein positiver ROI zeigt einen Gewinn an, ein negativer einen Verlust. Wenn Sie beispielsweise 10.000€ investieren und es auf 15.000€ wächst, beträgt Ihr ROI 50%.',
        'Für Investitionen über mehrere Jahre bietet die annualisierte ROI einen aussagekräftigeren Vergleich. Die Formel: Annualisierte ROI = ((Endwert / Anfangsinvestition)^(1/Jahre) - 1) x 100.',
        'ROI wird branchenübergreifend eingesetzt. Obwohl in seiner Einfachheit leistungsstark, hat der ROI Grenzen: Er berücksichtigt weder Risiko noch Inflation oder den Zeitwert des Geldes.',
      ],
      faq: [
        { q: 'Was ist ein guter ROI?', a: 'Ein "guter" ROI hängt vom Kontext ab. Am Aktienmarkt liegt die historische durchschnittliche Jahresrendite bei etwa 7-10% nach Inflation. Immobilien zielen typischerweise auf 8-12% jährlich.' },
        { q: 'Was ist der Unterschied zwischen ROI und annualisiertem ROI?', a: 'Der ROI zeigt die Gesamtrendite über den gesamten Zeitraum. Der annualisierte ROI normalisiert dies auf einen Jahressatz. Ein ROI von 50% über 5 Jahre entspricht etwa 8,45% annualisiert.' },
        { q: 'Wie berechne ich den ROI mehrerer Investitionen?', a: 'Berechnen Sie den ROI für jede Investition einzeln. Für einen fairen Vergleich verwenden Sie den annualisierten ROI bei unterschiedlichen Zeiträumen.' },
        { q: 'Berücksichtigt der ROI die Inflation?', a: 'Nein. Für die "reale" Rendite subtrahieren Sie die Inflationsrate vom ROI. Ein ROI von 10% bei 3% Inflation ergibt etwa 7% reale Rendite.' },
        { q: 'Was sind die Grenzen des ROI?', a: 'Der ROI berücksichtigt weder Risiko noch Dauer, Inflation, Steuern oder Opportunitätskosten. Für eine umfassende Analyse verwenden Sie ROI zusammen mit Kennzahlen wie dem Kapitalwert (NPV) und dem internen Zinsfuß (IRR).' },
      ],
    },
    pt: {
      title: 'Calculadora de ROI Grátis – Calcule o Retorno sobre Investimento Online',
      paragraphs: [
        'O Retorno sobre Investimento (ROI) é uma das métricas financeiras mais utilizadas para avaliar a eficiência de um investimento. Ele mede o retorno percentual em relação ao custo inicial, fornecendo uma forma simples de comparar a rentabilidade de diferentes investimentos.',
        'A fórmula básica é: ROI = ((Valor Final - Investimento Inicial) / Investimento Inicial) x 100. Um ROI positivo indica lucro, enquanto negativo indica prejuízo. Por exemplo, se você investe R$10.000 e cresce para R$15.000, seu ROI é de 50%.',
        'Para investimentos mantidos por vários anos, o ROI anualizado fornece uma comparação mais significativa. A fórmula é: ROI Anualizado = ((Valor Final / Investimento Inicial)^(1/anos) - 1) x 100.',
        'O ROI é usado em todas as indústrias. Embora poderoso em sua simplicidade, o ROI tem limitações: não considera risco, inflação ou o valor do dinheiro no tempo.',
      ],
      faq: [
        { q: 'O que é um bom ROI?', a: 'Um "bom" ROI depende do contexto. Para o mercado de ações, o retorno anual médio histórico é cerca de 7-10% após inflação. Imóveis tipicamente visam 8-12% ao ano.' },
        { q: 'Qual a diferença entre ROI e ROI anualizado?', a: 'O ROI mostra o retorno percentual total sobre todo o período. O ROI anualizado normaliza isso para uma taxa anual. Um ROI de 50% em 5 anos equivale a aproximadamente 8,45% anualizado.' },
        { q: 'Como calcular o ROI de múltiplos investimentos?', a: 'Calcule o ROI individualmente para cada investimento. Para comparação justa, use o ROI anualizado se os períodos forem diferentes.' },
        { q: 'O ROI considera a inflação?', a: 'Não. Para obter o retorno "real", subtraia a taxa de inflação do ROI. Um ROI de 10% com inflação de 3% dá aproximadamente 7% de retorno real.' },
        { q: 'Quais são as limitações do ROI?', a: 'O ROI não considera nível de risco, duração, inflação, impostos ou custo de oportunidade. Para análise completa, use o ROI com outras métricas como VPL e TIR.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="roi-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.initialInvestment[lang]}</label>
            <input type="number" value={initialInvestment} onChange={(e) => setInitialInvestment(e.target.value)} onBlur={() => setTouched(p => ({ ...p, invest: true }))} placeholder="10000"
              className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 ${touched.invest && initialInvestment !== '' && initial <= 0 ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {touched.invest && initialInvestment !== '' && initial <= 0 && <p className="text-red-500 text-xs mt-1">{labels.invalidInvestment[lang]}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.finalValue[lang]}</label>
            <input type="number" value={finalValue} onChange={(e) => setFinalValue(e.target.value)} placeholder="15000" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.years[lang]} <span className="text-gray-400 text-xs">{labels.optional[lang]}</span>
            </label>
            <input type="number" value={years} onChange={(e) => setYears(e.target.value)} placeholder="3" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex gap-2">
            <button onClick={() => { setInitialInvestment(''); setFinalValue(''); setYears(''); setTouched({}); }} className="flex-1 py-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
              {labels.reset[lang]}
            </button>
            {hasResult && (
              <button onClick={() => { navigator.clipboard.writeText(`ROI: ${roi >= 0 ? '+' : ''}${roi.toFixed(2)}% | ${labels.netProfit[lang]}: ${formatCurrency(netProfit)}`); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">
                {copied ? labels.copied[lang] : labels.copy[lang]}
              </button>
            )}
          </div>

          {hasResult && (
            <div className="space-y-3">
              <div className={`p-5 rounded-xl border text-center ${roi >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="text-sm text-gray-500 mb-1">{labels.roi[lang]}</div>
                <div className={`text-4xl font-bold ${roi >= 0 ? 'text-green-700' : 'text-red-700'}`}>{roi >= 0 ? '+' : ''}{roi.toFixed(2)}%</div>
                <div className={`text-sm font-medium mt-1 ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>{roi >= 0 ? labels.profit[lang] : labels.loss[lang]}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`rounded-xl p-4 text-center border ${netProfit >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                  <div className="text-xs text-gray-500">{labels.netProfit[lang]}</div>
                  <div className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>{netProfit >= 0 ? '+' : ''}{formatCurrency(netProfit)}</div>
                </div>
                {yrs > 0 && (
                  <div className={`rounded-xl p-4 text-center border ${annualizedRoi >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
                    <div className="text-xs text-gray-500">{labels.annualizedRoi[lang]}</div>
                    <div className={`text-xl font-bold ${annualizedRoi >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>{annualizedRoi >= 0 ? '+' : ''}{annualizedRoi.toFixed(2)}%</div>
                  </div>
                )}
              </div>

              {/* Visual ROI bar */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{labels.initialInvestment[lang]}</span>
                  <span>{labels.finalValue[lang]}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${roi >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, Math.max(5, (final_ / Math.max(initial, final_)) * 100))}%` }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">{labels.historyLabel[lang]}</h3>
              <button onClick={() => setHistory([])} className="text-xs text-red-500 hover:text-red-700">Clear</button>
            </div>
            <div className="space-y-1">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between text-sm px-2 py-1.5 bg-gray-50 rounded">
                  <span className="text-gray-500">{h.invest}</span>
                  <span className={`font-semibold ${h.roi.startsWith('+') ? 'text-green-700' : 'text-red-700'}`}>{h.roi}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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
