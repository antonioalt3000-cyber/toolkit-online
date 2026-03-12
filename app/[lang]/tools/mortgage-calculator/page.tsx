'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface HistoryEntry { monthly: number; totalInterest: number; loanAmount: number; timestamp: string; }

const labels: Record<string, Record<Locale, string>> = {
  propertyValue: { en: 'Property Value', it: 'Valore Immobile', es: 'Valor de la Propiedad', fr: 'Valeur du Bien', de: 'Immobilienwert', pt: 'Valor do Imóvel' },
  downPayment: { en: 'Down Payment', it: 'Anticipo', es: 'Entrada', fr: 'Apport', de: 'Anzahlung', pt: 'Entrada' },
  interestRate: { en: 'Interest Rate (%/year)', it: 'Tasso d\'Interesse (%/anno)', es: 'Tasa de Interés (%/año)', fr: 'Taux d\'Intérêt (%/an)', de: 'Zinssatz (%/Jahr)', pt: 'Taxa de Juros (%/ano)' },
  years: { en: 'Loan Term (years)', it: 'Durata (anni)', es: 'Plazo (años)', fr: 'Durée (années)', de: 'Laufzeit (Jahre)', pt: 'Prazo (anos)' },
  monthlyPayment: { en: 'Monthly Payment', it: 'Rata Mensile', es: 'Pago Mensual', fr: 'Mensualité', de: 'Monatliche Rate', pt: 'Parcela Mensal' },
  loanAmount: { en: 'Loan Amount', it: 'Importo Prestito', es: 'Monto del Préstamo', fr: 'Montant du Prêt', de: 'Darlehensbetrag', pt: 'Valor do Empréstimo' },
  totalInterest: { en: 'Total Interest', it: 'Interessi Totali', es: 'Interés Total', fr: 'Intérêts Totaux', de: 'Gesamtzinsen', pt: 'Juros Totais' },
  totalCost: { en: 'Total Cost', it: 'Costo Totale', es: 'Costo Total', fr: 'Coût Total', de: 'Gesamtkosten', pt: 'Custo Total' },
  reset: { en: 'Reset', it: 'Reimposta', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  copy: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier les Résultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
  copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié!', de: 'Kopiert!', pt: 'Copiado!' },
  history: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
  downPaymentPct: { en: 'Down Payment %', it: '% Anticipo', es: '% Entrada', fr: '% Apport', de: '% Anzahlung', pt: '% Entrada' },
  invalidDp: { en: 'Down payment exceeds property value', it: 'Anticipo supera il valore', es: 'Entrada supera el valor', fr: 'Apport dépasse la valeur', de: 'Anzahlung übersteigt Wert', pt: 'Entrada excede o valor' },
};

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: { title: 'How to Calculate Your Monthly Mortgage Payment', paragraphs: ['A mortgage is the largest financial commitment most people make in their lifetime. Understanding how your monthly payment is calculated — and how different factors affect it — is essential for making a sound home-buying decision. The key variables are the property price, your down payment, the interest rate, and the loan term in years.','Our mortgage calculator uses the standard amortization formula to estimate your monthly payment, total interest costs, and the overall price you will pay for your home over the life of the loan. By adjusting the down payment or interest rate, you can see how even small changes dramatically impact your total cost. A larger down payment reduces both your monthly payment and total interest, while a lower interest rate can save you tens of thousands over the loan term.','Before committing to a mortgage, use this calculator to compare different scenarios. Try different loan terms — 15, 20, 25, or 30 years — to see how each affects your monthly budget and total cost. Remember that the monthly payment shown here covers only principal and interest; your actual payment may include property taxes, homeowner insurance, and possibly private mortgage insurance (PMI) if your down payment is less than 20%.'], faq: [{ q: 'How much down payment do I need for a mortgage?', a: 'Conventional mortgages typically require 10-20% down. Some government-backed loans allow as little as 3-5% down. A larger down payment reduces your loan amount, monthly payment, and total interest paid.' },{ q: 'What is the difference between a 15-year and 30-year mortgage?', a: 'A 15-year mortgage has higher monthly payments but costs significantly less in total interest. A 30-year mortgage is more affordable monthly but can cost nearly double in interest over the loan life.' },{ q: 'How does the interest rate affect my mortgage cost?', a: 'Even a 0.5% difference in interest rate can change your total cost by thousands. For a $250,000 loan over 25 years, going from 3.5% to 4% adds roughly $25,000 in total interest.' },{ q: 'Does this calculator include property taxes and insurance?', a: 'This calculator estimates principal and interest payments only. Property taxes, homeowner insurance, PMI, and HOA fees are additional costs that vary by location and should be factored into your budget separately.' },{ q: 'Can I pay off my mortgage faster by making extra payments?', a: 'Yes. Even small additional monthly payments toward the principal can significantly reduce your total interest and shorten the loan term.' }] },
  it: { title: 'Come Calcolare la Rata del Mutuo Mensile', paragraphs: ['Il mutuo e il piu grande impegno finanziario che la maggior parte delle persone assume nella vita. Capire come viene calcolata la rata mensile — e come i diversi fattori la influenzano — e essenziale per prendere una decisione immobiliare consapevole.','Il nostro calcolatore di mutui utilizza la formula standard di ammortamento per stimare la rata mensile, gli interessi totali e il costo complessivo dell\'abitazione.','Prima di impegnarti in un mutuo, usa questo calcolatore per confrontare diversi scenari. Prova durate diverse — 15, 20, 25 o 30 anni.'], faq: [{ q: 'Quanto anticipo serve per un mutuo?', a: 'I mutui tradizionali richiedono tipicamente il 10-20% di anticipo.' },{ q: 'Qual e la differenza tra un mutuo a 15 e a 30 anni?', a: 'Un mutuo a 15 anni ha rate piu alte ma costa significativamente meno in interessi totali.' },{ q: 'Come influisce il tasso di interesse sul costo del mutuo?', a: 'Anche una differenza dello 0,5% nel tasso puo cambiare il costo totale di migliaia di euro.' },{ q: 'Questo calcolatore include tasse e assicurazioni?', a: 'Questo calcolatore stima solo le rate di capitale e interessi.' },{ q: 'Posso estinguere il mutuo piu velocemente con rate extra?', a: 'Si. Anche piccoli pagamenti aggiuntivi verso il capitale possono ridurre significativamente gli interessi totali.' }] },
  es: { title: 'Como Calcular tu Cuota Hipotecaria Mensual', paragraphs: ['La hipoteca es el mayor compromiso financiero que la mayoria de personas asumen en su vida.','Nuestra calculadora hipotecaria utiliza la formula estandar de amortizacion para estimar tu cuota mensual.','Antes de comprometerte con una hipoteca, usa esta calculadora para comparar diferentes escenarios.'], faq: [{ q: 'Cuanta entrada necesito para una hipoteca?', a: 'Las hipotecas convencionales suelen requerir un 10-20% de entrada.' },{ q: 'Cual es la diferencia entre una hipoteca a 15 y a 30 anos?', a: 'Una hipoteca a 15 anos tiene cuotas mas altas pero cuesta menos en intereses.' },{ q: 'Como afecta el tipo de interes al costo de la hipoteca?', a: 'Incluso una diferencia del 0,5% puede cambiar el costo total en miles.' },{ q: 'Esta calculadora incluye impuestos y seguros?', a: 'Esta calculadora estima solo las cuotas de capital e intereses.' },{ q: 'Puedo liquidar la hipoteca mas rapido con pagos extra?', a: 'Si. Incluso pequenos pagos adicionales al capital pueden reducir significativamente los intereses.' }] },
  fr: { title: 'Comment Calculer votre Mensualite de Pret Immobilier', paragraphs: ['Le pret immobilier est le plus grand engagement financier que la plupart des gens prennent dans leur vie.','Notre calculateur de pret immobilier utilise la formule standard d\'amortissement.','Avant de vous engager, utilisez ce calculateur pour comparer differents scenarios.'], faq: [{ q: 'Quel apport personnel faut-il pour un pret immobilier?', a: 'Les prets classiques demandent generalement 10-20% d\'apport.' },{ q: 'Quelle est la difference entre un pret sur 15 et 30 ans?', a: 'Un pret sur 15 ans a des mensualites plus elevees mais coute nettement moins en interets.' },{ q: 'Comment le taux d\'interet affecte-t-il le cout du pret?', a: 'Meme 0,5% de difference peut changer le cout total de milliers d\'euros.' },{ q: 'Ce calculateur inclut-il les taxes et assurances?', a: 'Ce calculateur n\'estime que les mensualites de capital et interets.' },{ q: 'Puis-je rembourser mon pret plus vite avec des paiements supplementaires?', a: 'Oui. De petits paiements supplementaires sur le capital peuvent reduire les interets.' }] },
  de: { title: 'Wie berechnet man die monatliche Hypothekenrate?', paragraphs: ['Eine Hypothek ist die groesste finanzielle Verpflichtung, die die meisten Menschen eingehen.','Unser Hypothekenrechner verwendet die Standard-Tilgungsformel.','Nutzen Sie diesen Rechner vor der Kreditaufnahme, um verschiedene Szenarien zu vergleichen.'], faq: [{ q: 'Wie viel Anzahlung brauche ich fuer eine Hypothek?', a: 'Konventionelle Hypotheken erfordern typischerweise 10-20% Anzahlung.' },{ q: 'Was ist der Unterschied zwischen einer 15- und 30-jaehrigen Hypothek?', a: 'Eine 15-jaehrige Hypothek hat hoehere monatliche Raten, kostet aber deutlich weniger an Gesamtzinsen.' },{ q: 'Wie beeinflusst der Zinssatz die Hypothekenkosten?', a: 'Selbst 0,5% Unterschied kann die Gesamtkosten um Tausende veraendern.' },{ q: 'Beinhaltet dieser Rechner Grundsteuer und Versicherung?', a: 'Dieser Rechner schaetzt nur die Raten fuer Kapital und Zinsen.' },{ q: 'Kann ich meine Hypothek schneller tilgen mit Sondertilgungen?', a: 'Ja. Selbst kleine zusaetzliche Zahlungen koennen die Gesamtzinsen erheblich reduzieren.' }] },
  pt: { title: 'Como Calcular a Prestacao Mensal do Credito Habitacao', paragraphs: ['O credito habitacao e o maior compromisso financeiro que a maioria das pessoas assume na vida.','A nossa calculadora utiliza a formula padrao de amortizacao.','Antes de se comprometer com um credito, use esta calculadora para comparar diferentes cenarios.'], faq: [{ q: 'Quanta entrada preciso para um credito habitacao?', a: 'Os creditos tradicionais requerem tipicamente 10-20% de entrada.' },{ q: 'Qual e a diferenca entre um credito a 15 e a 30 anos?', a: 'Um credito a 15 anos tem prestacoes mais altas mas custa menos em juros.' },{ q: 'Como afeta a taxa de juro o custo do credito?', a: 'Mesmo 0,5% de diferenca pode alterar o custo total em milhares.' },{ q: 'Esta calculadora inclui impostos e seguros?', a: 'Esta calculadora estima apenas as prestacoes de capital e juros.' },{ q: 'Posso liquidar o credito mais rapido com pagamentos extra?', a: 'Sim. Mesmo pequenos pagamentos adicionais podem reduzir os juros totais.' }] },
};

export default function MortgageCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['mortgage-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [propertyValue, setPropertyValue] = useState('300000');
  const [downPayment, setDownPayment] = useState('60000');
  const [interestRate, setInterestRate] = useState('3.5');
  const [years, setYears] = useState('25');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const pv = parseFloat(propertyValue) || 0;
  const dp = parseFloat(downPayment) || 0;
  const rate = (parseFloat(interestRate) || 0) / 100 / 12;
  const n = (parseInt(years) || 0) * 12;
  const loanAmount = Math.max(pv - dp, 0);
  const dpPct = pv > 0 ? (dp / pv) * 100 : 0;
  const dpInvalid = dp > pv && pv > 0;

  let monthlyPayment = 0;
  if (rate > 0 && n > 0 && loanAmount > 0) {
    monthlyPayment = loanAmount * (rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
  } else if (n > 0 && loanAmount > 0) {
    monthlyPayment = loanAmount / n;
  }

  const totalCost = monthlyPayment * n;
  const totalInterest = totalCost - loanAmount;
  const hasResult = loanAmount > 0 && n > 0;

  const resetAll = () => { setPropertyValue(''); setDownPayment(''); setInterestRate('3.5'); setYears('25'); setCopied(false); };
  const copyResults = () => {
    const text = `${t('monthlyPayment')}: ${monthlyPayment.toFixed(2)} | ${t('loanAmount')}: ${loanAmount.toFixed(2)} | ${t('totalInterest')}: ${totalInterest.toFixed(2)} | ${t('totalCost')}: ${totalCost.toFixed(2)}`;
    navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  const saveToHistory = () => {
    if (!hasResult) return;
    setHistory(prev => [{ monthly: monthlyPayment, totalInterest, loanAmount, timestamp: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="mortgage-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('propertyValue')}</label>
            <input type="number" value={propertyValue} onChange={(e) => setPropertyValue(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('downPayment')} {pv > 0 && <span className="text-gray-400 text-xs">({dpPct.toFixed(1)}%)</span>}
            </label>
            <input type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)}
              className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${dpInvalid ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {dpInvalid && <p className="text-red-500 text-xs mt-1">{t('invalidDp')}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('interestRate')}</label>
            <input type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('years')}</label>
            <input type="number" value={years} onChange={(e) => setYears(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
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
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center col-span-2">
                  <div className="text-xs text-blue-600 font-medium">{t('monthlyPayment')}</div>
                  <div className="text-3xl font-bold text-blue-700">{monthlyPayment.toLocaleString(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500 font-medium">{t('loanAmount')}</div>
                  <div className="text-lg font-bold text-gray-900">{loanAmount.toLocaleString(lang, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                  <div className="text-xs text-red-600 font-medium">{t('totalInterest')}</div>
                  <div className="text-lg font-bold text-red-700">{totalInterest.toLocaleString(lang, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-500 font-medium">{t('totalCost')}</div>
                <div className="text-lg font-bold text-gray-900">{totalCost.toLocaleString(lang, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden flex">
                  <div className="h-full bg-blue-500" style={{ width: `${(loanAmount / totalCost) * 100}%` }}></div>
                  <div className="h-full bg-red-400" style={{ width: `${(totalInterest / totalCost) * 100}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span className="text-blue-600">{t('loanAmount')}: {((loanAmount / totalCost) * 100).toFixed(1)}%</span>
                  <span className="text-red-600">{t('totalInterest')}: {((totalInterest / totalCost) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('history')}</h3>
              <div className="space-y-1">
                {history.map((entry, i) => (
                  <div key={i} className="flex justify-between text-sm text-gray-600 bg-white rounded px-3 py-1.5 border border-gray-100">
                    <span className="font-semibold text-blue-600">{entry.monthly.toFixed(2)}/mo</span>
                    <span className="text-red-600">Int: {entry.totalInterest.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
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
