'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function EstateTaxCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['estate-tax-calculator'][lang];

  const [estateValue, setEstateValue] = useState('');
  const [exemption, setExemption] = useState('13990000');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const estate = parseFloat(estateValue) || 0;
  const exempt = parseFloat(exemption) || 0;

  const taxableEstate = Math.max(0, estate - exempt);
  const federalTax = taxableEstate * 0.4;
  const netToHeirs = estate - federalTax;

  const labels = {
    estateValue: {
      en: 'Total Estate Value ($)',
      it: 'Valore Totale del Patrimonio ($)',
      es: 'Valor Total del Patrimonio ($)',
      fr: 'Valeur Totale de la Succession ($)',
      de: 'Gesamtwert des Nachlasses ($)',
      pt: 'Valor Total do Patrimônio ($)',
    },
    exemption: {
      en: 'Federal Exemption ($)',
      it: 'Esenzione Federale ($)',
      es: 'Exención Federal ($)',
      fr: 'Exonération Fédérale ($)',
      de: 'Bundesfreibetrag ($)',
      pt: 'Isenção Federal ($)',
    },
    federalTax: {
      en: 'Federal Estate Tax',
      it: 'Imposta Federale di Successione',
      es: 'Impuesto Federal sobre Sucesiones',
      fr: 'Impôt Fédéral sur les Successions',
      de: 'Bundeserbschaftsteuer',
      pt: 'Imposto Federal sobre Herança',
    },
    taxableEstate: {
      en: 'Taxable Estate',
      it: 'Patrimonio Imponibile',
      es: 'Patrimonio Imponible',
      fr: 'Succession Imposable',
      de: 'Steuerpflichtiger Nachlass',
      pt: 'Patrimônio Tributável',
    },
    netToHeirs: {
      en: 'Net to Heirs',
      it: 'Netto agli Eredi',
      es: 'Neto para Herederos',
      fr: 'Net aux Héritiers',
      de: 'Netto an Erben',
      pt: 'Líquido para Herdeiros',
    },
    breakdown: {
      en: 'Estate Tax Breakdown',
      it: 'Dettaglio Imposta di Successione',
      es: 'Desglose del Impuesto',
      fr: "Détail de l'Impôt",
      de: 'Aufschlüsselung der Steuer',
      pt: 'Detalhamento do Imposto',
    },
  } as Record<string, Record<Locale, string>>;

  const seoContent: Record<
    Locale,
    { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }
  > = {
    en: {
      title: 'Free Estate Tax Calculator — Estimate Federal Estate Tax and Inheritance',
      paragraphs: [
        'The Estate Tax Calculator gives you a fast estimate of the federal estate tax owed on an inheritance. Enter the total value of the estate and the applicable federal exemption, and the tool instantly shows the taxable estate, the estate tax due, and the net amount your heirs would receive.',
        'For 2026, the federal estate tax exemption is approximately $13.99 million per individual. Only the portion of an estate that exceeds this exemption is taxable. Estates below the exemption threshold generally owe no federal estate tax at all.',
        'The top federal estate tax rate is 40%. This calculator applies a simplified flat 40% rate to the taxable portion of the estate, giving you a conservative, worst-case estimate. Actual estate tax uses a graduated bracket structure, so your real liability may be lower.',
        'Remember that some states levy their own separate estate or inheritance tax with much lower exemptions than the federal level. Married couples can combine their exemptions through portability, effectively sheltering roughly $27.98 million from federal estate tax.',
      ],
      faq: [
        {
          q: 'What is the 2026 federal estate tax exemption?',
          a: 'For 2026, each individual can shield approximately $13.99 million from federal estate tax. Only value above this exemption is taxed.',
        },
        {
          q: 'What is the federal estate tax rate?',
          a: 'The top federal estate tax rate is 40%. This calculator uses a simplified flat 40% rate on the taxable estate as a conservative estimate.',
        },
        {
          q: 'Can married couples double the exemption?',
          a: "Yes. Through portability, a surviving spouse can use the deceased spouse's unused exemption, combining to shelter about $27.98 million from federal estate tax.",
        },
        {
          q: 'Do states charge their own estate tax?',
          a: "Some states impose a separate estate or inheritance tax, often with much lower exemption thresholds than the federal level. Check your state's rules for a complete picture.",
        },
      ],
    },
    it: {
      title: 'Calcolatore Imposta di Successione Gratuito — Stima Imposta Federale ed Eredità',
      paragraphs: [
        "Il Calcolatore Imposta di Successione fornisce una stima rapida dell'imposta federale dovuta su un'eredità. Inserisci il valore totale del patrimonio e l'esenzione federale applicabile e lo strumento mostra subito il patrimonio imponibile, l'imposta dovuta e l'importo netto che riceverebbero i tuoi eredi.",
        "Per il 2026, l'esenzione federale sull'imposta di successione è di circa 13,99 milioni di dollari a persona. Solo la parte del patrimonio che supera questa esenzione è imponibile. I patrimoni sotto la soglia di esenzione di norma non pagano alcuna imposta federale.",
        "L'aliquota federale massima sull'imposta di successione è del 40%. Questo calcolatore applica un'aliquota fissa semplificata del 40% sulla parte imponibile, offrendo una stima prudenziale nel caso peggiore. L'imposta reale usa scaglioni progressivi, quindi il carico effettivo può essere inferiore.",
        "Ricorda che alcuni stati applicano una propria imposta di successione o sull'eredità con esenzioni molto più basse del livello federale. Le coppie sposate possono combinare le esenzioni tramite la portabilità, proteggendo circa 27,98 milioni di dollari dall'imposta federale.",
      ],
      faq: [
        {
          q: "Qual è l'esenzione federale 2026?",
          a: "Per il 2026, ogni persona può proteggere circa 13,99 milioni di dollari dall'imposta federale di successione. Solo il valore oltre questa esenzione è tassato.",
        },
        {
          q: "Qual è l'aliquota federale di successione?",
          a: "L'aliquota federale massima è del 40%. Questo calcolatore usa un'aliquota fissa semplificata del 40% sul patrimonio imponibile come stima prudenziale.",
        },
        {
          q: "Le coppie sposate possono raddoppiare l'esenzione?",
          a: "Sì. Tramite la portabilità, il coniuge superstite può usare l'esenzione non utilizzata del defunto, arrivando a proteggere circa 27,98 milioni di dollari.",
        },
        {
          q: 'Gli stati applicano una propria imposta?',
          a: "Alcuni stati impongono una separata imposta di successione o sull'eredità, spesso con soglie di esenzione molto più basse di quelle federali. Verifica le regole del tuo stato.",
        },
      ],
    },
    es: {
      title:
        'Calculadora de Impuesto sobre Sucesiones Gratis — Estima el Impuesto Federal y la Herencia',
      paragraphs: [
        'La Calculadora de Impuesto sobre Sucesiones ofrece una estimación rápida del impuesto federal adeudado sobre una herencia. Introduce el valor total del patrimonio y la exención federal aplicable, y la herramienta muestra al instante el patrimonio imponible, el impuesto adeudado y el importe neto que recibirían tus herederos.',
        'Para 2026, la exención federal del impuesto sobre sucesiones es de aproximadamente 13,99 millones de dólares por persona. Solo la parte del patrimonio que supera esta exención es imponible. Los patrimonios por debajo del umbral no suelen pagar impuesto federal.',
        'La tasa federal máxima del impuesto sobre sucesiones es del 40%. Esta calculadora aplica una tasa fija simplificada del 40% sobre la parte imponible, dando una estimación prudente del peor caso. El impuesto real usa tramos progresivos, por lo que tu carga puede ser menor.',
        'Recuerda que algunos estados aplican su propio impuesto sobre sucesiones o herencia con exenciones mucho más bajas que el nivel federal. Las parejas casadas pueden combinar sus exenciones mediante la portabilidad, protegiendo unos 27,98 millones de dólares del impuesto federal.',
      ],
      faq: [
        {
          q: '¿Cuál es la exención federal de 2026?',
          a: 'Para 2026, cada persona puede proteger unos 13,99 millones de dólares del impuesto federal sobre sucesiones. Solo se grava el valor por encima de esta exención.',
        },
        {
          q: '¿Cuál es la tasa federal sobre sucesiones?',
          a: 'La tasa federal máxima es del 40%. Esta calculadora usa una tasa fija simplificada del 40% sobre el patrimonio imponible como estimación prudente.',
        },
        {
          q: '¿Las parejas casadas pueden duplicar la exención?',
          a: 'Sí. Mediante la portabilidad, el cónyuge sobreviviente puede usar la exención no utilizada del fallecido, protegiendo unos 27,98 millones de dólares.',
        },
        {
          q: '¿Los estados cobran su propio impuesto?',
          a: 'Algunos estados imponen un impuesto separado sobre sucesiones o herencia, a menudo con umbrales de exención mucho más bajos que el federal. Revisa las reglas de tu estado.',
        },
      ],
    },
    fr: {
      title:
        "Calculateur d'Impôt sur les Successions Gratuit — Estimez l'Impôt Fédéral et l'Héritage",
      paragraphs: [
        "Le Calculateur d'Impôt sur les Successions fournit une estimation rapide de l'impôt fédéral dû sur un héritage. Saisissez la valeur totale de la succession et l'exonération fédérale applicable, et l'outil affiche immédiatement la succession imposable, l'impôt dû et le montant net que recevraient vos héritiers.",
        "Pour 2026, l'exonération fédérale sur les successions est d'environ 13,99 millions de dollars par personne. Seule la part de la succession dépassant cette exonération est imposable. Les successions inférieures au seuil ne paient généralement aucun impôt fédéral.",
        "Le taux fédéral maximal de l'impôt sur les successions est de 40%. Ce calculateur applique un taux fixe simplifié de 40% sur la part imposable, offrant une estimation prudente du pire des cas. L'impôt réel utilise des tranches progressives, votre charge réelle peut donc être inférieure.",
        "N'oubliez pas que certains États prélèvent leur propre impôt sur les successions ou l'héritage avec des exonérations bien plus basses que le niveau fédéral. Les couples mariés peuvent combiner leurs exonérations via la portabilité, protégeant environ 27,98 millions de dollars de l'impôt fédéral.",
      ],
      faq: [
        {
          q: "Quelle est l'exonération fédérale 2026 ?",
          a: "Pour 2026, chaque personne peut protéger environ 13,99 millions de dollars de l'impôt fédéral sur les successions. Seule la valeur au-dessus de cette exonération est imposée.",
        },
        {
          q: 'Quel est le taux fédéral sur les successions ?',
          a: 'Le taux fédéral maximal est de 40%. Ce calculateur utilise un taux fixe simplifié de 40% sur la succession imposable comme estimation prudente.',
        },
        {
          q: "Les couples mariés peuvent-ils doubler l'exonération ?",
          a: "Oui. Grâce à la portabilité, le conjoint survivant peut utiliser l'exonération inutilisée du défunt, protégeant environ 27,98 millions de dollars.",
        },
        {
          q: 'Les États prélèvent-ils leur propre impôt ?',
          a: "Certains États imposent un impôt distinct sur les successions ou l'héritage, souvent avec des seuils d'exonération bien plus bas que le fédéral. Vérifiez les règles de votre État.",
        },
      ],
    },
    de: {
      title: 'Kostenloser Erbschaftsteuer-Rechner — Bundeserbschaftsteuer und Erbe Schätzen',
      paragraphs: [
        'Der Erbschaftsteuer-Rechner liefert eine schnelle Schätzung der auf ein Erbe fälligen Bundeserbschaftsteuer. Geben Sie den Gesamtwert des Nachlasses und den geltenden Bundesfreibetrag ein, und das Tool zeigt sofort den steuerpflichtigen Nachlass, die fällige Steuer und den Nettobetrag, den Ihre Erben erhalten würden.',
        'Für 2026 beträgt der Bundesfreibetrag der Erbschaftsteuer etwa 13,99 Millionen Dollar pro Person. Nur der Teil des Nachlasses, der diesen Freibetrag übersteigt, ist steuerpflichtig. Nachlässe unterhalb der Schwelle zahlen in der Regel keine Bundeserbschaftsteuer.',
        'Der höchste Bundessteuersatz auf Erbschaften beträgt 40%. Dieser Rechner wendet einen vereinfachten Pauschalsatz von 40% auf den steuerpflichtigen Teil an und liefert eine konservative Schätzung des schlimmsten Falls. Die tatsächliche Steuer nutzt gestufte Tarife, sodass Ihre reale Belastung geringer sein kann.',
        'Beachten Sie, dass einige Bundesstaaten eine eigene Erbschaftsteuer mit deutlich niedrigeren Freibeträgen als der Bund erheben. Verheiratete Paare können ihre Freibeträge über die Übertragbarkeit kombinieren und so rund 27,98 Millionen Dollar vor der Bundeserbschaftsteuer schützen.',
      ],
      faq: [
        {
          q: 'Wie hoch ist der Bundesfreibetrag 2026?',
          a: 'Für 2026 kann jede Person etwa 13,99 Millionen Dollar vor der Bundeserbschaftsteuer schützen. Nur der Wert oberhalb dieses Freibetrags wird besteuert.',
        },
        {
          q: 'Wie hoch ist der Bundeserbschaftsteuersatz?',
          a: 'Der höchste Bundessatz beträgt 40%. Dieser Rechner nutzt einen vereinfachten Pauschalsatz von 40% auf den steuerpflichtigen Nachlass als konservative Schätzung.',
        },
        {
          q: 'Können Ehepaare den Freibetrag verdoppeln?',
          a: 'Ja. Über die Übertragbarkeit kann der überlebende Ehegatte den ungenutzten Freibetrag des Verstorbenen nutzen und so rund 27,98 Millionen Dollar schützen.',
        },
        {
          q: 'Erheben Bundesstaaten eine eigene Steuer?',
          a: 'Einige Bundesstaaten erheben eine separate Erbschaftsteuer, oft mit deutlich niedrigeren Freibetragsgrenzen als der Bund. Prüfen Sie die Regeln Ihres Bundesstaates.',
        },
      ],
    },
    pt: {
      title: 'Calculadora de Imposto sobre Herança Grátis — Estime o Imposto Federal e a Herança',
      paragraphs: [
        'A Calculadora de Imposto sobre Herança fornece uma estimativa rápida do imposto federal devido sobre uma herança. Insira o valor total do patrimônio e a isenção federal aplicável, e a ferramenta mostra na hora o patrimônio tributável, o imposto devido e o valor líquido que seus herdeiros receberiam.',
        'Para 2026, a isenção federal do imposto sobre herança é de aproximadamente 13,99 milhões de dólares por pessoa. Apenas a parte do patrimônio que ultrapassa essa isenção é tributável. Patrimônios abaixo do limite geralmente não pagam imposto federal.',
        'A alíquota federal máxima do imposto sobre herança é de 40%. Esta calculadora aplica uma alíquota fixa simplificada de 40% sobre a parte tributável, oferecendo uma estimativa conservadora do pior caso. O imposto real usa faixas progressivas, portanto sua carga efetiva pode ser menor.',
        'Lembre-se de que alguns estados aplicam seu próprio imposto sobre herança com isenções muito mais baixas que o nível federal. Casais podem combinar suas isenções por meio da portabilidade, protegendo cerca de 27,98 milhões de dólares do imposto federal.',
      ],
      faq: [
        {
          q: 'Qual é a isenção federal de 2026?',
          a: 'Para 2026, cada pessoa pode proteger cerca de 13,99 milhões de dólares do imposto federal sobre herança. Apenas o valor acima dessa isenção é tributado.',
        },
        {
          q: 'Qual é a alíquota federal sobre herança?',
          a: 'A alíquota federal máxima é de 40%. Esta calculadora usa uma alíquota fixa simplificada de 40% sobre o patrimônio tributável como estimativa conservadora.',
        },
        {
          q: 'Casais podem dobrar a isenção?',
          a: 'Sim. Por meio da portabilidade, o cônjuge sobrevivente pode usar a isenção não utilizada do falecido, protegendo cerca de 27,98 milhões de dólares.',
        },
        {
          q: 'Os estados cobram seu próprio imposto?',
          a: 'Alguns estados impõem um imposto separado sobre herança, muitas vezes com limites de isenção bem mais baixos que o federal. Verifique as regras do seu estado.',
        },
      ],
    },
  };

  const seo = seoContent[lang];
  const formatCurrency = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <ToolPageWrapper toolSlug="estate-tax-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.estateValue[lang]}
              </label>
              <input
                type="number"
                value={estateValue}
                onChange={(e) => setEstateValue(e.target.value)}
                placeholder="15000000"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.exemption[lang]}
              </label>
              <input
                type="number"
                value={exemption}
                onChange={(e) => setExemption(e.target.value)}
                placeholder="13990000"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {estate > 0 && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                <div className="text-xs text-blue-600 font-medium mb-1">
                  {labels.federalTax[lang]}
                </div>
                <div className="text-4xl font-bold text-gray-900">
                  ${formatCurrency(federalTax)}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">{labels.breakdown[lang]}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">{labels.taxableEstate[lang]}</span>
                    <span className="font-semibold">${formatCurrency(taxableEstate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">{labels.netToHeirs[lang]}</span>
                    <span className="font-semibold text-green-600">
                      ${formatCurrency(netToHeirs)}
                    </span>
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
