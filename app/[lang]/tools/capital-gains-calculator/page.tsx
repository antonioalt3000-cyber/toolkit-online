'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function CapitalGainsCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['capital-gains-calculator'][lang];

  const [purchasePrice, setPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [taxableIncome, setTaxableIncome] = useState('');
  const [marginalRate, setMarginalRate] = useState('24');
  const [holdingPeriod, setHoldingPeriod] = useState<'long' | 'short'>('long');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const buy = parseFloat(purchasePrice) || 0;
  const sell = parseFloat(salePrice) || 0;
  const income = parseFloat(taxableIncome) || 0;
  const mRate = (parseFloat(marginalRate) || 0) / 100;

  const gain = sell - buy;

  let rate = 0;
  if (holdingPeriod === 'short') {
    rate = mRate;
  } else {
    if (income <= 48350) rate = 0;
    else if (income <= 533400) rate = 0.15;
    else rate = 0.2;
  }

  const taxableGain = Math.max(0, gain);
  const tax = taxableGain * rate;
  const netProceeds = sell - tax;

  const labels = {
    purchasePrice: {
      en: 'Purchase Price',
      it: 'Prezzo di Acquisto',
      es: 'Precio de Compra',
      fr: "Prix d'Achat",
      de: 'Kaufpreis',
      pt: 'Preço de Compra',
    },
    salePrice: {
      en: 'Sale Price',
      it: 'Prezzo di Vendita',
      es: 'Precio de Venta',
      fr: 'Prix de Vente',
      de: 'Verkaufspreis',
      pt: 'Preço de Venda',
    },
    holdingPeriod: {
      en: 'Holding Period',
      it: 'Periodo di Detenzione',
      es: 'Período de Tenencia',
      fr: 'Durée de Détention',
      de: 'Haltedauer',
      pt: 'Período de Detenção',
    },
    longTerm: {
      en: 'More than 1 year (long-term)',
      it: 'Più di 1 anno (lungo termine)',
      es: 'Más de 1 año (largo plazo)',
      fr: "Plus d'1 an (long terme)",
      de: 'Mehr als 1 Jahr (langfristig)',
      pt: 'Mais de 1 ano (longo prazo)',
    },
    shortTerm: {
      en: '1 year or less (short-term)',
      it: '1 anno o meno (breve termine)',
      es: '1 año o menos (corto plazo)',
      fr: '1 an ou moins (court terme)',
      de: '1 Jahr oder weniger (kurzfristig)',
      pt: '1 ano ou menos (curto prazo)',
    },
    taxableIncome: {
      en: 'Taxable Income',
      it: 'Reddito Imponibile',
      es: 'Ingreso Imponible',
      fr: 'Revenu Imposable',
      de: 'Zu Versteuerndes Einkommen',
      pt: 'Renda Tributável',
    },
    marginalRate: {
      en: 'Marginal Tax Rate (%)',
      it: 'Aliquota Marginale (%)',
      es: 'Tasa Impositiva Marginal (%)',
      fr: "Taux d'Imposition Marginal (%)",
      de: 'Grenzsteuersatz (%)',
      pt: 'Alíquota Marginal (%)',
    },
    capitalGainsTax: {
      en: 'Capital Gains Tax',
      it: 'Imposta sulle Plusvalenze',
      es: 'Impuesto sobre Ganancias',
      fr: 'Impôt sur les Plus-Values',
      de: 'Kapitalertragssteuer',
      pt: 'Imposto sobre Ganhos',
    },
    capitalGain: {
      en: 'Capital Gain',
      it: 'Plusvalenza',
      es: 'Ganancia de Capital',
      fr: 'Plus-Value',
      de: 'Kapitalgewinn',
      pt: 'Ganho de Capital',
    },
    taxRateApplied: {
      en: 'Tax Rate Applied',
      it: 'Aliquota Applicata',
      es: 'Tasa Aplicada',
      fr: 'Taux Appliqué',
      de: 'Angewandter Steuersatz',
      pt: 'Alíquota Aplicada',
    },
    netProceeds: {
      en: 'Net Proceeds After Tax',
      it: 'Ricavo Netto Dopo le Tasse',
      es: 'Ingresos Netos Después de Impuestos',
      fr: 'Produit Net Après Impôt',
      de: 'Nettoerlös Nach Steuern',
      pt: 'Receita Líquida Após Impostos',
    },
  } as Record<string, Record<Locale, string>>;

  const seoContent: Record<
    Locale,
    { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }
  > = {
    en: {
      title: 'Free Capital Gains Tax Calculator — Estimate Short-Term and Long-Term Tax',
      paragraphs: [
        'The Capital Gains Calculator helps you estimate how much tax you owe when you sell an investment for a profit. Enter your purchase price, sale price, holding period, taxable income, and marginal tax rate to see your capital gains tax and net proceeds instantly.',
        'The IRS taxes capital gains differently based on how long you held the asset. Long-term capital gains apply to assets held for more than one year and benefit from lower tax brackets of 0%, 15%, or 20%. Short-term gains, from assets held one year or less, are taxed at your ordinary income marginal rate, which can be significantly higher.',
        'Your long-term rate depends on your taxable income. For 2024-2025, single filers pay 0% up to about $48,350, 15% up to roughly $533,400, and 20% above that threshold. Holding an investment for just over a year can move you into a lower bracket and save thousands in taxes.',
        'This calculator is an estimate for planning purposes and does not include the 3.8% Net Investment Income Tax, state taxes, or the wash-sale rule. Always consult a tax professional before making major investment decisions.',
      ],
      faq: [
        {
          q: 'What is the difference between short-term and long-term capital gains?',
          a: 'Short-term gains come from assets held one year or less and are taxed at your ordinary income rate. Long-term gains come from assets held more than one year and are taxed at lower rates of 0%, 15%, or 20%.',
        },
        {
          q: 'How are long-term capital gains taxed?',
          a: 'Long-term gains use three brackets based on taxable income: 0% for lower incomes, 15% for middle incomes, and 20% for high earners. The exact thresholds are adjusted annually by the IRS.',
        },
        {
          q: 'Do I pay capital gains tax if I sell at a loss?',
          a: 'No. Capital gains tax only applies when you sell for a profit. If you sell at a loss, you may be able to deduct that loss against other gains or up to $3,000 of ordinary income per year.',
        },
        {
          q: 'How can I reduce my capital gains tax?',
          a: 'Hold investments longer than a year for lower long-term rates, harvest losses to offset gains, use tax-advantaged accounts like IRAs and 401(k)s, and time sales for lower-income years.',
        },
      ],
    },
    it: {
      title: 'Calcolatore Plusvalenze Gratuito — Stima le Imposte a Breve e Lungo Termine',
      paragraphs: [
        "Il Calcolatore Plusvalenze ti aiuta a stimare quante tasse devi pagare quando vendi un investimento con un profitto. Inserisci prezzo di acquisto, prezzo di vendita, periodo di detenzione, reddito imponibile e aliquota marginale per vedere subito l'imposta e il ricavo netto.",
        "Il fisco tassa le plusvalenze in modo diverso a seconda di quanto a lungo hai detenuto l'attività. Le plusvalenze a lungo termine si applicano ad attività detenute per più di un anno e beneficiano di aliquote più basse dello 0%, 15% o 20%. I guadagni a breve termine sono tassati alla tua aliquota marginale ordinaria, spesso più alta.",
        'La tua aliquota a lungo termine dipende dal reddito imponibile. Per il 2024-2025, i contribuenti singoli pagano 0% fino a circa 48.350$, 15% fino a circa 533.400$ e 20% oltre tale soglia. Detenere un investimento appena oltre un anno può farti rientrare in uno scaglione più basso.',
        "Questo calcolatore è una stima a scopo di pianificazione e non include l'imposta aggiuntiva sui redditi da investimento, le imposte statali o la regola wash-sale. Consulta sempre un professionista fiscale prima di decisioni importanti.",
      ],
      faq: [
        {
          q: 'Qual è la differenza tra plusvalenze a breve e lungo termine?',
          a: "I guadagni a breve termine derivano da attività detenute un anno o meno e sono tassati all'aliquota ordinaria. I guadagni a lungo termine derivano da attività detenute più di un anno e sono tassati con aliquote inferiori dello 0%, 15% o 20%.",
        },
        {
          q: 'Come sono tassate le plusvalenze a lungo termine?',
          a: 'I guadagni a lungo termine usano tre scaglioni basati sul reddito imponibile: 0% per redditi bassi, 15% per redditi medi e 20% per redditi alti.',
        },
        {
          q: 'Pago imposte se vendo in perdita?',
          a: "No. L'imposta sulle plusvalenze si applica solo quando vendi con un profitto. In caso di perdita puoi spesso dedurla da altri guadagni o fino a 3.000$ di reddito ordinario all'anno.",
        },
        {
          q: 'Come posso ridurre le imposte sulle plusvalenze?',
          a: 'Detieni gli investimenti per più di un anno, compensa le perdite con i guadagni, usa conti fiscalmente agevolati e vendi negli anni a reddito più basso.',
        },
      ],
    },
    es: {
      title:
        'Calculadora de Ganancias de Capital Gratis — Estima el Impuesto a Corto y Largo Plazo',
      paragraphs: [
        'La Calculadora de Ganancias de Capital te ayuda a estimar cuánto impuesto debes pagar cuando vendes una inversión con beneficio. Ingresa el precio de compra, el precio de venta, el período de tenencia, el ingreso imponible y la tasa marginal para ver al instante el impuesto y los ingresos netos.',
        'El fisco grava las ganancias de capital de forma diferente según cuánto tiempo mantuviste el activo. Las ganancias a largo plazo se aplican a activos mantenidos más de un año y disfrutan de tasas más bajas del 0%, 15% o 20%. Las ganancias a corto plazo se gravan a tu tasa marginal ordinaria, que suele ser más alta.',
        'Tu tasa a largo plazo depende de tu ingreso imponible. Para 2024-2025, los contribuyentes solteros pagan 0% hasta unos 48.350$, 15% hasta unos 533.400$ y 20% por encima de ese umbral. Mantener una inversión poco más de un año puede bajarte de tramo.',
        'Esta calculadora es una estimación con fines de planificación y no incluye el impuesto adicional sobre ingresos por inversión, impuestos estatales ni la regla wash-sale. Consulta siempre a un profesional fiscal antes de decisiones importantes.',
      ],
      faq: [
        {
          q: '¿Cuál es la diferencia entre ganancias a corto y largo plazo?',
          a: 'Las ganancias a corto plazo provienen de activos mantenidos un año o menos y se gravan a tu tasa ordinaria. Las de largo plazo provienen de activos mantenidos más de un año y se gravan con tasas menores del 0%, 15% o 20%.',
        },
        {
          q: '¿Cómo se gravan las ganancias a largo plazo?',
          a: 'Usan tres tramos según el ingreso imponible: 0% para ingresos bajos, 15% para ingresos medios y 20% para ingresos altos.',
        },
        {
          q: '¿Pago impuestos si vendo con pérdida?',
          a: 'No. El impuesto solo aplica cuando vendes con beneficio. Si vendes con pérdida, a menudo puedes deducirla contra otras ganancias o hasta 3.000$ de ingreso ordinario al año.',
        },
        {
          q: '¿Cómo puedo reducir el impuesto sobre ganancias?',
          a: 'Mantén las inversiones más de un año, compensa pérdidas con ganancias, usa cuentas con ventajas fiscales y vende en años de menores ingresos.',
        },
      ],
    },
    fr: {
      title: "Calculateur de Plus-Values Gratuit — Estimez l'Impôt à Court et Long Terme",
      paragraphs: [
        "Le Calculateur de Plus-Values vous aide à estimer le montant de l'impôt dû lorsque vous vendez un investissement avec un bénéfice. Saisissez le prix d'achat, le prix de vente, la durée de détention, le revenu imposable et le taux marginal pour voir instantanément l'impôt et le produit net.",
        "Le fisc taxe les plus-values différemment selon la durée de détention de l'actif. Les plus-values à long terme concernent les actifs détenus plus d'un an et bénéficient de taux plus bas de 0%, 15% ou 20%. Les gains à court terme sont imposés à votre taux marginal ordinaire, souvent plus élevé.",
        "Votre taux à long terme dépend de votre revenu imposable. Pour 2024-2025, les déclarants célibataires paient 0% jusqu'à environ 48 350$, 15% jusqu'à environ 533 400$ et 20% au-delà. Détenir un investissement un peu plus d'un an peut vous faire changer de tranche.",
        "Ce calculateur est une estimation à des fins de planification et n'inclut pas l'impôt supplémentaire sur les revenus de placement, les impôts locaux ni la règle wash-sale. Consultez toujours un professionnel fiscal avant toute décision importante.",
      ],
      faq: [
        {
          q: 'Quelle différence entre plus-values à court et long terme ?',
          a: "Les gains à court terme proviennent d'actifs détenus un an ou moins et sont imposés à votre taux ordinaire. Les gains à long terme proviennent d'actifs détenus plus d'un an et sont imposés à des taux inférieurs de 0%, 15% ou 20%.",
        },
        {
          q: 'Comment les plus-values à long terme sont-elles imposées ?',
          a: 'Elles utilisent trois tranches selon le revenu imposable : 0% pour les faibles revenus, 15% pour les revenus moyens et 20% pour les hauts revenus.',
        },
        {
          q: "Dois-je payer l'impôt si je vends à perte ?",
          a: "Non. L'impôt ne s'applique que lorsque vous vendez avec un bénéfice. En cas de perte, vous pouvez souvent la déduire d'autres gains ou jusqu'à 3 000$ de revenu ordinaire par an.",
        },
        {
          q: 'Comment réduire mon impôt sur les plus-values ?',
          a: "Détenez vos investissements plus d'un an, compensez les pertes avec les gains, utilisez des comptes fiscalement avantageux et vendez les années à faibles revenus.",
        },
      ],
    },
    de: {
      title:
        'Kostenloser Kapitalertragssteuer-Rechner — Schätzen Sie Kurz- und Langfristige Steuern',
      paragraphs: [
        'Der Kapitalgewinn-Rechner hilft Ihnen zu schätzen, wie viel Steuer Sie zahlen, wenn Sie eine Investition mit Gewinn verkaufen. Geben Sie Kaufpreis, Verkaufspreis, Haltedauer, zu versteuerndes Einkommen und Grenzsteuersatz ein, um sofort Steuer und Nettoerlös zu sehen.',
        'Das Finanzamt besteuert Kapitalgewinne je nach Haltedauer unterschiedlich. Langfristige Gewinne gelten für über ein Jahr gehaltene Vermögenswerte und profitieren von niedrigeren Sätzen von 0%, 15% oder 20%. Kurzfristige Gewinne werden mit Ihrem ordentlichen Grenzsteuersatz besteuert, der oft höher ist.',
        'Ihr langfristiger Satz hängt vom zu versteuernden Einkommen ab. Für 2024-2025 zahlen Einzelveranlagte 0% bis etwa 48.350$, 15% bis etwa 533.400$ und 20% darüber. Wenn Sie eine Anlage knapp über ein Jahr halten, können Sie in eine niedrigere Stufe rutschen.',
        'Dieser Rechner ist eine Schätzung zu Planungszwecken und enthält weder die zusätzliche Steuer auf Kapitalerträge noch Landessteuern oder die Wash-Sale-Regel. Konsultieren Sie vor wichtigen Entscheidungen stets einen Steuerberater.',
      ],
      faq: [
        {
          q: 'Was ist der Unterschied zwischen kurz- und langfristigen Kapitalgewinnen?',
          a: 'Kurzfristige Gewinne stammen aus Vermögenswerten, die ein Jahr oder weniger gehalten wurden, und werden zum ordentlichen Satz besteuert. Langfristige Gewinne stammen aus über ein Jahr gehaltenen Werten und werden mit niedrigeren Sätzen von 0%, 15% oder 20% besteuert.',
        },
        {
          q: 'Wie werden langfristige Kapitalgewinne besteuert?',
          a: 'Sie nutzen drei Stufen je nach zu versteuerndem Einkommen: 0% für niedrige Einkommen, 15% für mittlere und 20% für hohe Einkommen.',
        },
        {
          q: 'Zahle ich Steuern, wenn ich mit Verlust verkaufe?',
          a: 'Nein. Die Steuer fällt nur an, wenn Sie mit Gewinn verkaufen. Bei Verlust können Sie ihn oft mit anderen Gewinnen oder bis zu 3.000$ ordentlichem Einkommen pro Jahr verrechnen.',
        },
        {
          q: 'Wie kann ich meine Kapitalertragssteuer senken?',
          a: 'Halten Sie Investitionen länger als ein Jahr, verrechnen Sie Verluste mit Gewinnen, nutzen Sie steuerbegünstigte Konten und verkaufen Sie in einkommensschwachen Jahren.',
        },
      ],
    },
    pt: {
      title: 'Calculadora de Ganhos de Capital Grátis — Estime o Imposto de Curto e Longo Prazo',
      paragraphs: [
        'A Calculadora de Ganhos de Capital ajuda a estimar quanto imposto você deve pagar ao vender um investimento com lucro. Insira o preço de compra, preço de venda, período de detenção, renda tributável e alíquota marginal para ver instantaneamente o imposto e a receita líquida.',
        'O fisco tributa os ganhos de capital de forma diferente conforme o tempo de detenção do ativo. Ganhos de longo prazo aplicam-se a ativos mantidos por mais de um ano e têm alíquotas menores de 0%, 15% ou 20%. Ganhos de curto prazo são tributados pela sua alíquota marginal ordinária, geralmente mais alta.',
        'Sua alíquota de longo prazo depende da renda tributável. Para 2024-2025, contribuintes solteiros pagam 0% até cerca de 48.350$, 15% até cerca de 533.400$ e 20% acima disso. Manter um investimento pouco mais de um ano pode colocá-lo em uma faixa menor.',
        'Esta calculadora é uma estimativa para fins de planejamento e não inclui o imposto adicional sobre renda de investimento, impostos estaduais nem a regra wash-sale. Consulte sempre um profissional fiscal antes de decisões importantes.',
      ],
      faq: [
        {
          q: 'Qual a diferença entre ganhos de curto e longo prazo?',
          a: 'Ganhos de curto prazo vêm de ativos mantidos um ano ou menos e são tributados pela alíquota ordinária. Ganhos de longo prazo vêm de ativos mantidos mais de um ano e têm alíquotas menores de 0%, 15% ou 20%.',
        },
        {
          q: 'Como os ganhos de longo prazo são tributados?',
          a: 'Usam três faixas conforme a renda tributável: 0% para rendas baixas, 15% para rendas médias e 20% para rendas altas.',
        },
        {
          q: 'Pago imposto se vender com prejuízo?',
          a: 'Não. O imposto só se aplica quando você vende com lucro. Se vender com prejuízo, muitas vezes pode deduzi-lo de outros ganhos ou até 3.000$ de renda ordinária por ano.',
        },
        {
          q: 'Como posso reduzir meu imposto sobre ganhos?',
          a: 'Mantenha investimentos por mais de um ano, compense prejuízos com ganhos, use contas com vantagens fiscais e venda em anos de menor renda.',
        },
      ],
    },
  };

  const seo = seoContent[lang];
  const formatCurrency = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <ToolPageWrapper toolSlug="capital-gains-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.purchasePrice[lang]}
              </label>
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="10000"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.salePrice[lang]}
              </label>
              <input
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="15000"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.holdingPeriod[lang]}
              </label>
              <select
                value={holdingPeriod}
                onChange={(e) => setHoldingPeriod(e.target.value as 'long' | 'short')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="long">{labels.longTerm[lang]}</option>
                <option value="short">{labels.shortTerm[lang]}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.taxableIncome[lang]}
              </label>
              <input
                type="number"
                value={taxableIncome}
                onChange={(e) => setTaxableIncome(e.target.value)}
                placeholder="60000"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.marginalRate[lang]}
            </label>
            <input
              type="number"
              value={marginalRate}
              onChange={(e) => setMarginalRate(e.target.value)}
              placeholder="24"
              step="0.1"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {buy > 0 && sell > 0 && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                <div className="text-xs text-blue-600 font-medium mb-1">
                  {labels.capitalGainsTax[lang]}
                </div>
                <div className="text-4xl font-bold text-gray-900">${formatCurrency(tax)}</div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">{labels.capitalGain[lang]}</span>
                    <span
                      className={`font-semibold ${gain > 0 ? 'text-green-600' : gain < 0 ? 'text-red-600' : ''}`}
                    >
                      ${formatCurrency(gain)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">{labels.taxRateApplied[lang]}</span>
                    <span className="font-semibold">
                      {(rate * 100).toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">{labels.netProceeds[lang]}</span>
                    <span className="font-semibold">${formatCurrency(netProceeds)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => (
            <p key={i} className="text-gray-700 leading-relaxed mb-4">
              {p}
            </p>
          ))}
        </article>

        <section className="mt-10 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">FAQ</h2>
          <div className="space-y-2">
            {seo.faq.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-4 py-3 font-medium text-gray-900 flex justify-between items-center"
                >
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
