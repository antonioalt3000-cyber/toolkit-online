'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface HistoryEntry { gross: number; net: number; effectiveRate: number; timestamp: string; }

const labels: Record<string, Record<string, string>> = {
  grossSalary: { en: 'Gross Salary', it: 'Stipendio Lordo', es: 'Salario Bruto', fr: 'Salaire Brut', de: 'Bruttogehalt', pt: 'Salário Bruto' },
  taxRate: { en: 'Tax Rate (%)', it: 'Aliquota Fiscale (%)', es: 'Tasa Impositiva (%)', fr: 'Taux d\'Imposition (%)', de: 'Steuersatz (%)', pt: 'Taxa de Imposto (%)' },
  otherDeductions: { en: 'Other Deductions', it: 'Altre Detrazioni', es: 'Otras Deducciones', fr: 'Autres Déductions', de: 'Weitere Abzüge', pt: 'Outras Deduções' },
  monthly: { en: 'Monthly', it: 'Mensile', es: 'Mensual', fr: 'Mensuel', de: 'Monatlich', pt: 'Mensal' },
  annual: { en: 'Annual', it: 'Annuale', es: 'Anual', fr: 'Annuel', de: 'Jährlich', pt: 'Anual' },
  netPay: { en: 'Net Pay', it: 'Stipendio Netto', es: 'Salario Neto', fr: 'Salaire Net', de: 'Nettogehalt', pt: 'Salário Líquido' },
  totalTaxes: { en: 'Total Taxes', it: 'Tasse Totali', es: 'Impuestos Totales', fr: 'Impôts Totaux', de: 'Steuern Gesamt', pt: 'Impostos Totais' },
  effectiveTaxRate: { en: 'Effective Tax Rate', it: 'Aliquota Effettiva', es: 'Tasa Efectiva', fr: 'Taux Effectif', de: 'Effektiver Steuersatz', pt: 'Taxa Efetiva' },
  monthlyView: { en: 'Monthly', it: 'Mensile', es: 'Mensual', fr: 'Mensuel', de: 'Monatlich', pt: 'Mensal' },
  annualView: { en: 'Annual', it: 'Annuale', es: 'Anual', fr: 'Annuel', de: 'Jährlich', pt: 'Anual' },
  totalDeductions: { en: 'Total Deductions', it: 'Detrazioni Totali', es: 'Deducciones Totales', fr: 'Déductions Totales', de: 'Abzüge Gesamt', pt: 'Deduções Totais' },
  reset: { en: 'Reset', it: 'Reimposta', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  copy: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier les Résultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
  copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié!', de: 'Kopiert!', pt: 'Copiado!' },
  history: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
  invalidTax: { en: 'Tax rate: 0-100%', it: 'Aliquota: 0-100%', es: 'Tasa: 0-100%', fr: 'Taux: 0-100%', de: 'Satz: 0-100%', pt: 'Taxa: 0-100%' },
  takeHomeRatio: { en: 'Take-Home Ratio', it: 'Rapporto Netto', es: 'Ratio Neto', fr: 'Ratio Net', de: 'Nettoquote', pt: 'Razão Líquida' },
};

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: { title: 'How to Calculate Your Net Pay from Gross Salary', paragraphs: ['Understanding your take-home pay is essential for personal financial planning. A paycheck calculator helps you determine your net salary after taxes and deductions are subtracted from your gross income.','Gross salary is the total amount your employer pays you before any deductions. This includes federal and state income taxes, Social Security contributions, health insurance premiums, retirement plan contributions, and other withholdings.','Tax rates vary widely by country and region. In the United States, federal income tax rates range from 10% to 37% depending on your income bracket.','This paycheck calculator allows you to input your gross salary, applicable tax rate, and additional deductions to instantly see your net pay.'], faq: [{ q: 'What is the difference between gross and net salary?', a: 'Gross salary is your total pay before any deductions. Net salary (take-home pay) is what you receive after taxes, insurance, retirement contributions, and other deductions are subtracted.' },{ q: 'What deductions are typically taken from a paycheck?', a: 'Common deductions include federal and state income taxes, Social Security and Medicare taxes (FICA), health insurance premiums, retirement plan contributions (401k, IRA), life insurance, and union dues.' },{ q: 'How is the effective tax rate calculated?', a: 'The effective tax rate is calculated by dividing your total tax payments plus deductions by your gross salary and multiplying by 100.' },{ q: 'Why is my take-home pay much less than my salary?', a: 'Your take-home pay is reduced by multiple deductions: income taxes, payroll taxes, health insurance premiums, and retirement contributions. Combined, these can reduce your gross pay by 25-40%.' },{ q: 'Should I look at monthly or annual figures when budgeting?', a: 'Both are useful. Monthly figures help with day-to-day budgeting. Annual figures are better for big-picture planning.' }] },
  it: { title: 'Come Calcolare lo Stipendio Netto dal Lordo', paragraphs: ['Capire quanto si porta a casa e fondamentale per la pianificazione finanziaria personale.','Lo stipendio lordo e l\'importo totale che il datore di lavoro corrisponde prima di qualsiasi detrazione.','Le aliquote fiscali variano ampiamente. In Italia il sistema IRPEF prevede aliquote progressive dal 23% al 43%.','Questo calcolatore permette di inserire lo stipendio lordo, l\'aliquota fiscale e le detrazioni aggiuntive per vedere istantaneamente lo stipendio netto.'], faq: [{ q: 'Qual e la differenza tra stipendio lordo e netto?', a: 'Lo stipendio lordo e la retribuzione totale prima delle detrazioni. Lo stipendio netto e quanto si riceve effettivamente.' },{ q: 'Quali detrazioni vengono applicate alla busta paga?', a: 'Le detrazioni comuni includono IRPEF, addizionali regionali e comunali, contributi INPS.' },{ q: 'Come si calcola l\'aliquota fiscale effettiva?', a: 'Si calcola dividendo il totale delle tasse e detrazioni per lo stipendio lordo e moltiplicando per 100.' },{ q: 'Perche il netto e molto inferiore al lordo?', a: 'Il netto si riduce per via di molteplici trattenute: IRPEF, addizionali, contributi INPS.' },{ q: 'Meglio guardare i dati mensili o annuali?', a: 'Entrambi sono utili.' }] },
  es: { title: 'Como Calcular el Salario Neto desde el Bruto', paragraphs: ['Comprender cuanto dinero se lleva a casa es esencial para la planificacion financiera personal.','El salario bruto es el monto total que tu empleador te paga antes de cualquier deduccion.','Las tasas impositivas varian ampliamente por pais y region.','Esta calculadora te permite introducir tu salario bruto, la tasa impositiva y deducciones adicionales para ver instantaneamente tu salario neto.'], faq: [{ q: 'Cual es la diferencia entre salario bruto y neto?', a: 'El salario bruto es tu paga total antes de deducciones. El salario neto es lo que recibes despues de impuestos.' },{ q: 'Que deducciones se aplican a la nomina?', a: 'Las deducciones comunes incluyen IRPF, cotizaciones a la Seguridad Social, seguros de salud.' },{ q: 'Como se calcula la tasa impositiva efectiva?', a: 'Se calcula dividiendo el total de impuestos y deducciones entre el salario bruto y multiplicando por 100.' },{ q: 'Por que mi salario neto es mucho menor que el bruto?', a: 'Se reduce por multiples deducciones.' },{ q: 'Debo mirar los datos mensuales o anuales?', a: 'Ambos son utiles.' }] },
  fr: { title: 'Comment Calculer Votre Salaire Net a Partir du Brut', paragraphs: ['Comprendre votre salaire net est essentiel pour la planification financiere personnelle.','Le salaire brut est le montant total que votre employeur vous verse avant toute deduction.','Les taux d\'imposition varient considerablement.','Ce calculateur vous permet de saisir votre salaire brut, le taux d\'imposition et les deductions supplementaires.'], faq: [{ q: 'Quelle est la difference entre salaire brut et net?', a: 'Le salaire brut est votre remuneration totale avant deductions. Le salaire net est ce que vous recevez apres impots.' },{ q: 'Quelles deductions sont prelevees sur la fiche de paie?', a: 'Les deductions courantes incluent l\'impot sur le revenu, les cotisations sociales.' },{ q: 'Comment calcule-t-on le taux d\'imposition effectif?', a: 'Le taux effectif se calcule en divisant le total des impots et deductions par le salaire brut.' },{ q: 'Pourquoi mon salaire net est-il bien inferieur au brut?', a: 'Le net se reduit par de multiples prelevements.' },{ q: 'Faut-il regarder les chiffres mensuels ou annuels?', a: 'Les deux sont utiles.' }] },
  de: { title: 'So Berechnen Sie Ihr Nettogehalt vom Bruttogehalt', paragraphs: ['Das Verstaendnis Ihres Nettogehalts ist fuer die persoenliche Finanzplanung unerlaesslich.','Das Bruttogehalt ist der Gesamtbetrag, den Ihr Arbeitgeber vor Abzuegen zahlt.','Die Steuersaetze variieren stark.','Dieser Rechner ermoeglicht die Eingabe von Bruttogehalt, Steuersatz und zusaetzlichen Abzuegen.'], faq: [{ q: 'Was ist der Unterschied zwischen Brutto- und Nettogehalt?', a: 'Das Bruttogehalt ist Ihre Gesamtverguetung vor Abzuegen.' },{ q: 'Welche Abzuege werden vom Gehalt abgezogen?', a: 'Gaengige Abzuege umfassen Lohnsteuer, Solidaritaetszuschlag, Kirchensteuer, Krankenversicherung.' },{ q: 'Wie berechnet man den effektiven Steuersatz?', a: 'Gesamte Steuern und Abzuege durch das Bruttogehalt teilen und mit 100 multiplizieren.' },{ q: 'Warum ist mein Nettogehalt viel geringer als das Brutto?', a: 'Das Netto wird durch mehrere Abzuege reduziert.' },{ q: 'Sollte man monatliche oder jaehrliche Zahlen betrachten?', a: 'Beide sind nuetzlich.' }] },
  pt: { title: 'Como Calcular o Salario Liquido a Partir do Bruto', paragraphs: ['Entender quanto voce leva para casa e essencial para o planejamento financeiro pessoal.','O salario bruto e o valor total que seu empregador paga antes de qualquer deducao.','As aliquotas de imposto variam amplamente.','Esta calculadora permite inserir o salario bruto, a aliquota de imposto e deducoes adicionais para ver instantaneamente o salario liquido.'], faq: [{ q: 'Qual e a diferenca entre salario bruto e liquido?', a: 'O salario bruto e a remuneracao total antes das deducoes.' },{ q: 'Quais deducoes sao aplicadas ao contracheque?', a: 'Deducoes comuns incluem IRPF, INSS, plano de saude.' },{ q: 'Como se calcula a aliquota efetiva?', a: 'Dividindo o total de impostos e deducoes pelo salario bruto e multiplicando por 100.' },{ q: 'Por que meu salario liquido e muito menor que o bruto?', a: 'O liquido e reduzido por multiplas deducoes.' },{ q: 'Devo olhar os dados mensais ou anuais?', a: 'Ambos sao uteis.' }] },
};

export default function PaycheckCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['paycheck-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [grossSalary, setGrossSalary] = useState('');
  const [taxRate, setTaxRate] = useState('25');
  const [deductions, setDeductions] = useState('');
  const [view, setView] = useState<'monthly' | 'annual'>('monthly');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const gross = parseFloat(grossSalary) || 0;
  const tax = parseFloat(taxRate) || 0;
  const otherDed = parseFloat(deductions) || 0;
  const taxInvalid = taxRate !== '' && (tax < 0 || tax > 100);

  const monthlyTaxes = gross * (tax / 100);
  const monthlyTotalDeductions = monthlyTaxes + otherDed;
  const monthlyNet = gross - monthlyTotalDeductions;
  const effectiveRate = gross > 0 ? (monthlyTotalDeductions / gross) * 100 : 0;
  const takeHomeRatio = gross > 0 ? (monthlyNet / gross) * 100 : 0;

  const multiplier = view === 'monthly' ? 1 : 12;
  const displayGross = gross * multiplier;
  const displayTaxes = monthlyTaxes * multiplier;
  const displayDeductions = monthlyTotalDeductions * multiplier;
  const displayNet = monthlyNet * multiplier;

  const resetAll = () => { setGrossSalary(''); setTaxRate('25'); setDeductions(''); setCopied(false); };
  const copyResults = () => {
    const text = `${t('grossSalary')}: $${displayGross.toFixed(2)} | ${t('netPay')}: $${displayNet.toFixed(2)} | ${t('effectiveTaxRate')}: ${effectiveRate.toFixed(1)}%`;
    navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  const saveToHistory = () => {
    if (gross <= 0) return;
    setHistory(prev => [{ gross, net: monthlyNet, effectiveRate, timestamp: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="paycheck-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('grossSalary')} ({t('monthly')})</label>
            <input type="number" value={grossSalary} onChange={(e) => setGrossSalary(e.target.value)} placeholder="0.00"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('taxRate')}</label>
            <input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} placeholder="25"
              className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${taxInvalid ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {taxInvalid && <p className="text-red-500 text-xs mt-1">{t('invalidTax')}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('otherDeductions')} ({t('monthly')})</label>
            <input type="number" value={deductions} onChange={(e) => setDeductions(e.target.value)} placeholder="0.00"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            {gross > 0 && (
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

          {gross > 0 && (
            <>
              <div className="flex gap-2 mb-2">
                <button onClick={() => setView('monthly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {t('monthlyView')}
                </button>
                <button onClick={() => setView('annual')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'annual' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {t('annualView')}
                </button>
              </div>

              {/* Result Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                  <div className="text-xs text-gray-500 font-medium">{t('grossSalary')}</div>
                  <div className="text-xl font-bold text-gray-900">${displayGross.toFixed(2)}</div>
                </div>
                <div className={`rounded-xl p-4 text-center border ${monthlyNet >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className={`text-xs font-medium ${monthlyNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>{t('netPay')}</div>
                  <div className={`text-xl font-bold ${monthlyNet >= 0 ? 'text-green-700' : 'text-red-700'}`}>${displayNet.toFixed(2)}</div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('totalTaxes')}</span>
                  <span className="font-semibold text-red-600">-${displayTaxes.toFixed(2)}</span>
                </div>
                {otherDed > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('otherDeductions')}</span>
                    <span className="font-semibold text-red-600">-${(otherDed * multiplier).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('totalDeductions')}</span>
                  <span className="font-semibold text-red-600">-${displayDeductions.toFixed(2)}</span>
                </div>
                <hr className="border-blue-200" />
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('effectiveTaxRate')}</span>
                  <span className={`font-semibold ${effectiveRate > 40 ? 'text-red-600' : effectiveRate > 25 ? 'text-yellow-600' : 'text-green-600'}`}>{effectiveRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('takeHomeRatio')}</span>
                  <span className={`font-semibold ${takeHomeRatio >= 60 ? 'text-green-600' : takeHomeRatio >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{takeHomeRatio.toFixed(1)}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden flex">
                  <div className="h-full bg-green-500 transition-all" style={{ width: `${Math.max(takeHomeRatio, 0)}%` }}></div>
                  <div className="h-full bg-red-400 transition-all" style={{ width: `${Math.max(effectiveRate, 0)}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span className="text-green-600">{t('netPay')}: {takeHomeRatio.toFixed(1)}%</span>
                  <span className="text-red-600">{t('totalDeductions')}: {effectiveRate.toFixed(1)}%</span>
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
                    <span>${entry.gross.toFixed(0)} gross</span>
                    <span className="font-semibold text-green-600">${entry.net.toFixed(0)} net</span>
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
