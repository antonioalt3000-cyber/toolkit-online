'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  grossSalary: { en: 'Gross Annual Salary', it: 'Stipendio Lordo Annuo', es: 'Salario Bruto Anual', fr: 'Salaire Brut Annuel', de: 'Bruttojahresgehalt', pt: 'Salário Bruto Anual' },
  taxBrackets: { en: 'Tax Brackets Applied', it: 'Scaglioni Fiscali', es: 'Tramos Fiscales', fr: 'Tranches Fiscales', de: 'Steuerstufen', pt: 'Faixas de Imposto' },
  totalTax: { en: 'Total Tax', it: 'Tasse Totali', es: 'Impuestos Totales', fr: 'Impôts Totaux', de: 'Gesamtsteuer', pt: 'Impostos Totais' },
  effectiveRate: { en: 'Effective Tax Rate', it: 'Aliquota Effettiva', es: 'Tasa Efectiva', fr: 'Taux Effectif', de: 'Effektiver Steuersatz', pt: 'Taxa Efetiva' },
  netAnnual: { en: 'Net Annual Salary', it: 'Stipendio Netto Annuo', es: 'Salario Neto Anual', fr: 'Salaire Net Annuel', de: 'Nettojahresgehalt', pt: 'Salário Líquido Anual' },
  netMonthly: { en: 'Net Monthly Salary', it: 'Stipendio Netto Mensile', es: 'Salario Neto Mensual', fr: 'Salaire Net Mensuel', de: 'Nettomonatsgehalt', pt: 'Salário Líquido Mensal' },
  bracket: { en: 'Bracket', it: 'Scaglione', es: 'Tramo', fr: 'Tranche', de: 'Stufe', pt: 'Faixa' },
  rate: { en: 'Rate', it: 'Aliquota', es: 'Tasa', fr: 'Taux', de: 'Satz', pt: 'Taxa' },
  taxable: { en: 'Taxable', it: 'Imponibile', es: 'Base Imponible', fr: 'Imposable', de: 'Steuerpflichtig', pt: 'Tributável' },
  tax: { en: 'Tax', it: 'Tassa', es: 'Impuesto', fr: 'Impôt', de: 'Steuer', pt: 'Imposto' },
};

const brackets = [
  { min: 0, max: 15000, rate: 10 },
  { min: 15000, max: 30000, rate: 15 },
  { min: 30000, max: 50000, rate: 25 },
  { min: 50000, max: 80000, rate: 30 },
  { min: 80000, max: Infinity, rate: 35 },
];

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: {
    title: 'How to Calculate Your Net Salary from Gross Pay',
    paragraphs: [
      'Understanding the difference between gross and net salary is crucial for personal financial planning. Your gross salary is the total amount your employer pays you before any deductions, while your net salary — also called take-home pay — is what you actually receive after income taxes and other withholdings are subtracted. The gap between these two figures can be surprising, especially for higher earners.',
      'This salary calculator uses a progressive tax bracket system to estimate your income tax burden. In a progressive system, different portions of your income are taxed at different rates. The first portion is taxed at the lowest rate, the next portion at a slightly higher rate, and so on. This means your effective tax rate — the overall percentage of income paid in taxes — is always lower than the highest bracket you fall into.',
      'By entering your gross annual salary, you can instantly see your tax breakdown by bracket, your total tax liability, effective tax rate, and your net annual and monthly salary. This information is essential when negotiating a job offer, planning a budget, or comparing positions in different countries. Keep in mind that actual tax calculations vary by country and may include additional deductions for social security, health insurance, and retirement contributions.',
    ],
    faq: [
      { q: 'What is the difference between gross and net salary?', a: 'Gross salary is your total pay before any deductions. Net salary is what you take home after income taxes, social security contributions, and other withholdings are subtracted from your gross pay.' },
      { q: 'How do progressive tax brackets work?', a: 'In a progressive tax system, your income is divided into brackets, each taxed at a progressively higher rate. Only the income within each bracket is taxed at that bracket\'s rate, not your entire income.' },
      { q: 'What is an effective tax rate?', a: 'Your effective tax rate is the total tax you pay divided by your gross income, expressed as a percentage. It represents the actual proportion of your income that goes to taxes, and it is always lower than your highest marginal tax bracket.' },
      { q: 'Does this calculator include social security contributions?', a: 'This calculator estimates income tax only. Social security, health insurance, pension contributions, and other payroll deductions vary by country and employer, and should be considered separately.' },
      { q: 'How can I reduce my tax liability legally?', a: 'Common strategies include maximizing retirement account contributions, claiming eligible deductions and credits, using tax-advantaged savings accounts, and consulting with a tax professional about your specific situation.' },
    ],
  },
  it: {
    title: 'Come Calcolare lo Stipendio Netto dal Lordo',
    paragraphs: [
      'Comprendere la differenza tra stipendio lordo e netto e fondamentale per la pianificazione finanziaria personale. Lo stipendio lordo e l\'importo totale che il datore di lavoro ti paga prima di qualsiasi detrazione, mentre lo stipendio netto e quello che effettivamente ricevi dopo la sottrazione delle imposte sul reddito e degli altri contributi.',
      'Questo calcolatore utilizza un sistema di scaglioni fiscali progressivi per stimare il tuo carico fiscale. In un sistema progressivo, diverse porzioni del tuo reddito vengono tassate ad aliquote diverse. La prima porzione e tassata all\'aliquota piu bassa, la porzione successiva ad un\'aliquota leggermente superiore, e cosi via. Questo significa che la tua aliquota effettiva e sempre inferiore allo scaglione piu alto in cui ricadi.',
      'Inserendo il tuo stipendio lordo annuo, puoi vedere immediatamente la ripartizione delle tasse per scaglione, il totale delle imposte, l\'aliquota effettiva e il tuo stipendio netto annuo e mensile. Questa informazione e essenziale quando negozi un\'offerta di lavoro, pianifichi un budget o confronti posizioni lavorative in diversi paesi.',
    ],
    faq: [
      { q: 'Qual e la differenza tra stipendio lordo e netto?', a: 'Lo stipendio lordo e la retribuzione totale prima di qualsiasi detrazione. Lo stipendio netto e quello che ricevi effettivamente dopo la sottrazione di IRPEF, contributi previdenziali e altre trattenute.' },
      { q: 'Come funzionano gli scaglioni fiscali progressivi?', a: 'In un sistema progressivo, il reddito viene suddiviso in scaglioni, ciascuno tassato ad un\'aliquota progressivamente piu alta. Solo il reddito all\'interno di ogni scaglione viene tassato a quella specifica aliquota.' },
      { q: 'Cos\'e l\'aliquota effettiva?', a: 'L\'aliquota effettiva e il totale delle imposte pagate diviso per il reddito lordo, espresso in percentuale. Rappresenta la proporzione reale del reddito destinata alle tasse ed e sempre inferiore all\'aliquota marginale piu alta.' },
      { q: 'Questo calcolatore include i contributi previdenziali?', a: 'Questo calcolatore stima solo l\'imposta sul reddito. Contributi INPS, assicurazione sanitaria, fondi pensione e altre trattenute variano in base al contratto e vanno considerate separatamente.' },
      { q: 'Come posso ridurre legalmente il mio carico fiscale?', a: 'Strategie comuni includono massimizzare i contributi al fondo pensione, richiedere deduzioni e detrazioni fiscali spettanti, utilizzare conti di risparmio agevolati e consultare un commercialista.' },
    ],
  },
  es: {
    title: 'Como Calcular tu Salario Neto desde el Bruto',
    paragraphs: [
      'Entender la diferencia entre salario bruto y neto es crucial para la planificacion financiera personal. El salario bruto es la cantidad total que tu empleador te paga antes de cualquier deduccion, mientras que el salario neto es lo que realmente recibes despues de restar impuestos sobre la renta y otras retenciones.',
      'Esta calculadora utiliza un sistema de tramos fiscales progresivos para estimar tu carga tributaria. En un sistema progresivo, diferentes porciones de tu renta se gravan a distintas tasas. La primera porcion se grava a la tasa mas baja, la siguiente a una tasa ligeramente superior, y asi sucesivamente.',
      'Introduciendo tu salario bruto anual, puedes ver instantaneamente el desglose de impuestos por tramo, tu carga fiscal total, la tasa efectiva y tu salario neto anual y mensual. Esta informacion es esencial al negociar una oferta de trabajo o planificar un presupuesto.',
    ],
    faq: [
      { q: 'Cual es la diferencia entre salario bruto y neto?', a: 'El salario bruto es tu retribucion total antes de cualquier deduccion. El salario neto es lo que recibes efectivamente despues de restar IRPF, cotizaciones sociales y otras retenciones.' },
      { q: 'Como funcionan los tramos fiscales progresivos?', a: 'En un sistema progresivo, la renta se divide en tramos, cada uno gravado a una tasa progresivamente mayor. Solo la renta dentro de cada tramo se grava a esa tasa especifica.' },
      { q: 'Que es la tasa impositiva efectiva?', a: 'Es el total de impuestos pagados dividido por la renta bruta, expresado en porcentaje. Representa la proporcion real de tu renta destinada a impuestos y siempre es menor que tu tramo marginal mas alto.' },
      { q: 'Incluye esta calculadora las cotizaciones a la Seguridad Social?', a: 'Esta calculadora estima solo el impuesto sobre la renta. Cotizaciones sociales, seguros y otras deducciones varian segun el pais y el empleador.' },
      { q: 'Como puedo reducir legalmente mi carga fiscal?', a: 'Estrategias comunes incluyen maximizar aportaciones a planes de pensiones, reclamar deducciones elegibles, usar cuentas de ahorro con ventajas fiscales y consultar con un asesor fiscal.' },
    ],
  },
  fr: {
    title: 'Comment Calculer votre Salaire Net a partir du Brut',
    paragraphs: [
      'Comprendre la difference entre salaire brut et net est essentiel pour la planification financiere personnelle. Le salaire brut est le montant total que votre employeur vous verse avant toute deduction, tandis que le salaire net est ce que vous recevez effectivement apres deduction des impots sur le revenu et des cotisations sociales.',
      'Ce calculateur utilise un systeme de tranches d\'imposition progressives pour estimer votre charge fiscale. Dans un systeme progressif, differentes portions de votre revenu sont imposees a des taux differents. La premiere portion est imposee au taux le plus bas, la suivante a un taux legerement superieur, et ainsi de suite.',
      'En saisissant votre salaire brut annuel, vous pouvez voir instantanement la ventilation des impots par tranche, votre charge fiscale totale, le taux effectif et votre salaire net annuel et mensuel. Cette information est essentielle lors de la negociation d\'une offre d\'emploi ou de la planification d\'un budget.',
    ],
    faq: [
      { q: 'Quelle est la difference entre salaire brut et net?', a: 'Le salaire brut est votre remuneration totale avant toute deduction. Le salaire net est ce que vous recevez effectivement apres deduction de l\'impot sur le revenu, des cotisations sociales et autres prelevements.' },
      { q: 'Comment fonctionnent les tranches d\'imposition progressives?', a: 'Dans un systeme progressif, le revenu est divise en tranches, chacune imposee a un taux progressivement plus eleve. Seul le revenu au sein de chaque tranche est impose a ce taux specifique.' },
      { q: 'Qu\'est-ce que le taux d\'imposition effectif?', a: 'C\'est le total des impots payes divise par le revenu brut, exprime en pourcentage. Il represente la proportion reelle de votre revenu consacree aux impots.' },
      { q: 'Ce calculateur inclut-il les cotisations sociales?', a: 'Ce calculateur n\'estime que l\'impot sur le revenu. Les cotisations sociales, l\'assurance maladie et les cotisations retraite varient selon le pays et l\'employeur.' },
      { q: 'Comment reduire legalement ma charge fiscale?', a: 'Les strategies courantes incluent maximiser les versements sur un plan d\'epargne retraite, reclamer les deductions et credits eligibles, et consulter un conseiller fiscal.' },
    ],
  },
  de: {
    title: 'Wie berechnet man das Nettogehalt vom Bruttogehalt?',
    paragraphs: [
      'Den Unterschied zwischen Brutto- und Nettogehalt zu verstehen ist entscheidend fuer die persoenliche Finanzplanung. Das Bruttogehalt ist der Gesamtbetrag, den Ihr Arbeitgeber Ihnen vor Abzuegen zahlt, waehrend das Nettogehalt das ist, was Sie tatsaechlich nach Abzug von Einkommensteuer und Sozialabgaben erhalten.',
      'Dieser Gehaltsrechner verwendet ein progressives Steuerstufensystem, um Ihre Steuerbelastung zu schaetzen. In einem progressiven System werden verschiedene Einkommensteile mit unterschiedlichen Saetzen besteuert. Der erste Teil wird mit dem niedrigsten Satz besteuert, der naechste mit einem etwas hoeheren Satz, und so weiter.',
      'Durch Eingabe Ihres Bruttojahresgehalts sehen Sie sofort die Steueraufteilung nach Stufen, Ihre Gesamtsteuerbelastung, den effektiven Steuersatz und Ihr jaehrliches und monatliches Nettogehalt. Diese Information ist wichtig bei Gehaltsverhandlungen und Budgetplanung.',
    ],
    faq: [
      { q: 'Was ist der Unterschied zwischen Brutto- und Nettogehalt?', a: 'Das Bruttogehalt ist Ihre Gesamtverguetung vor Abzuegen. Das Nettogehalt ist das, was Sie tatsaechlich erhalten, nachdem Einkommensteuer, Sozialversicherungsbeitraege und andere Abzuege subtrahiert wurden.' },
      { q: 'Wie funktionieren progressive Steuerstufen?', a: 'In einem progressiven System wird das Einkommen in Stufen unterteilt, jede mit einem progressiv hoeheren Satz besteuert. Nur das Einkommen innerhalb jeder Stufe wird mit dem jeweiligen Satz besteuert.' },
      { q: 'Was ist der effektive Steuersatz?', a: 'Der effektive Steuersatz ist die gesamte gezahlte Steuer geteilt durch das Bruttoeinkommen in Prozent. Er ist immer niedriger als der hoechste Grenzsteuersatz.' },
      { q: 'Beruecksichtigt dieser Rechner Sozialabgaben?', a: 'Dieser Rechner schaetzt nur die Einkommensteuer. Sozialversicherung, Krankenversicherung und Rentenbeitraege variieren je nach Land und Arbeitgeber.' },
      { q: 'Wie kann ich meine Steuerlast legal reduzieren?', a: 'Gaengige Strategien umfassen die Maximierung von Altersvorsorgebeitraegen, die Inanspruchnahme zustehender Abzuege und Freibetraege sowie die Beratung durch einen Steuerberater.' },
    ],
  },
  pt: {
    title: 'Como Calcular o Salario Liquido a partir do Bruto',
    paragraphs: [
      'Compreender a diferenca entre salario bruto e liquido e crucial para o planeamento financeiro pessoal. O salario bruto e o montante total que o empregador lhe paga antes de quaisquer deducoes, enquanto o salario liquido e o que efetivamente recebe apos a subtracao de impostos sobre o rendimento e contribuicoes sociais.',
      'Esta calculadora utiliza um sistema de escaloes fiscais progressivos para estimar a sua carga tributaria. Num sistema progressivo, diferentes porcoes do seu rendimento sao tributadas a taxas diferentes. A primeira porcao e tributada a taxa mais baixa, a seguinte a uma taxa ligeiramente superior, e assim por diante.',
      'Ao introduzir o seu salario bruto anual, pode ver instantaneamente a reparticao dos impostos por escalao, a sua carga fiscal total, a taxa efetiva e o seu salario liquido anual e mensal. Esta informacao e essencial ao negociar uma oferta de emprego ou planear um orcamento.',
    ],
    faq: [
      { q: 'Qual e a diferenca entre salario bruto e liquido?', a: 'O salario bruto e a remuneracao total antes de quaisquer deducoes. O salario liquido e o que recebe efetivamente apos subtracao de IRS, contribuicoes para a Seguranca Social e outras retencoes.' },
      { q: 'Como funcionam os escaloes fiscais progressivos?', a: 'Num sistema progressivo, o rendimento e dividido em escaloes, cada um tributado a uma taxa progressivamente mais elevada. Apenas o rendimento dentro de cada escalao e tributado a essa taxa especifica.' },
      { q: 'O que e a taxa efetiva de imposto?', a: 'E o total de impostos pagos dividido pelo rendimento bruto, expresso em percentagem. Representa a proporcao real do rendimento destinada a impostos.' },
      { q: 'Esta calculadora inclui contribuicoes para a Seguranca Social?', a: 'Esta calculadora estima apenas o imposto sobre o rendimento. Contribuicoes sociais, seguros e outras deducoes variam conforme o pais e o empregador.' },
      { q: 'Como posso reduzir legalmente a minha carga fiscal?', a: 'Estrategias comuns incluem maximizar contribuicoes para planos de reforma, reclamar deducoes elegiveis, usar contas poupanca com vantagens fiscais e consultar um contabilista.' },
    ],
  },
};

export default function SalaryCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['salary-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [gross, setGross] = useState('');
  const grossNum = parseFloat(gross) || 0;

  const taxDetails: { min: number; max: number; rate: number; taxable: number; tax: number }[] = [];
  let remaining = grossNum;
  let totalTax = 0;

  for (const b of brackets) {
    if (remaining <= 0) break;
    const width = b.max === Infinity ? remaining : b.max - b.min;
    const taxable = Math.min(remaining, width);
    const tax = taxable * (b.rate / 100);
    taxDetails.push({ ...b, taxable, tax });
    totalTax += tax;
    remaining -= taxable;
  }

  const netAnnual = grossNum - totalTax;
  const netMonthly = netAnnual / 12;
  const effectiveRate = grossNum > 0 ? (totalTax / grossNum) * 100 : 0;

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="salary-calculator">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('grossSalary')}</label>
            <input type="number" value={gross} onChange={(e) => setGross(e.target.value)} placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          {grossNum > 0 && (
            <>
              <div className="mt-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('taxBrackets')}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-2 py-1 text-left">{t('bracket')}</th>
                        <th className="px-2 py-1 text-right">{t('rate')}</th>
                        <th className="px-2 py-1 text-right">{t('taxable')}</th>
                        <th className="px-2 py-1 text-right">{t('tax')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taxDetails.map((d, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="px-2 py-1">${d.min.toLocaleString()} - {d.max === Infinity ? '...' : `$${d.max.toLocaleString()}`}</td>
                          <td className="px-2 py-1 text-right">{d.rate}%</td>
                          <td className="px-2 py-1 text-right">${d.taxable.toFixed(2)}</td>
                          <td className="px-2 py-1 text-right">${d.tax.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('totalTax')}</span>
                  <span className="font-semibold text-red-600">${totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('effectiveRate')}</span>
                  <span className="font-semibold">{effectiveRate.toFixed(1)}%</span>
                </div>
                <hr className="border-blue-200" />
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('netAnnual')}</span>
                  <span className="font-bold text-blue-600 text-lg">${netAnnual.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('netMonthly')}</span>
                  <span className="font-bold text-green-600 text-lg">${netMonthly.toFixed(2)}</span>
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
