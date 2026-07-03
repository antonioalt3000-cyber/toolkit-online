'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function SelfEmploymentTaxCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['self-employment-tax-calculator'][lang];

  const [netIncome, setNetIncome] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const income = parseFloat(netIncome) || 0;
  const netEarnings = income * 0.9235;
  const ssWageBase = 176100; // 2026 Social Security wage base
  const ssTax = Math.min(netEarnings, ssWageBase) * 0.124;
  const medicareTax = netEarnings * 0.029;
  const seTax = ssTax + medicareTax;
  const deductibleHalf = seTax * 0.5;

  const labels = {
    netIncome: {
      en: 'Net Self-Employment Income',
      it: 'Reddito Netto da Lavoro Autonomo',
      es: 'Ingreso Neto por Cuenta Propia',
      fr: "Revenu Net d'Auto-Entrepreneur",
      de: 'Netto-Einkommen aus Selbständigkeit',
      pt: 'Renda Líquida de Trabalho Autônomo',
    },
    seTax: {
      en: 'Self-Employment Tax',
      it: 'Imposta sul Lavoro Autonomo',
      es: 'Impuesto por Cuenta Propia',
      fr: 'Impôt sur le Travail Indépendant',
      de: 'Selbständigkeitssteuer',
      pt: 'Imposto de Trabalho Autônomo',
    },
    ssPortion: {
      en: 'Social Security Portion (12.4%)',
      it: 'Quota Previdenza Sociale (12,4%)',
      es: 'Porción Seguridad Social (12,4%)',
      fr: 'Part Sécurité Sociale (12,4%)',
      de: 'Sozialversicherungsanteil (12,4%)',
      pt: 'Parcela Previdência Social (12,4%)',
    },
    medicarePortion: {
      en: 'Medicare Portion (2.9%)',
      it: 'Quota Medicare (2,9%)',
      es: 'Porción Medicare (2,9%)',
      fr: 'Part Medicare (2,9%)',
      de: 'Medicare-Anteil (2,9%)',
      pt: 'Parcela Medicare (2,9%)',
    },
    deductibleHalf: {
      en: 'Deductible Half (Form 1040)',
      it: 'Metà Deducibile (Modulo 1040)',
      es: 'Mitad Deducible (Formulario 1040)',
      fr: 'Moitié Déductible (Formulaire 1040)',
      de: 'Abzugsfähige Hälfte (Formular 1040)',
      pt: 'Metade Dedutível (Formulário 1040)',
    },
    breakdown: {
      en: 'Tax Breakdown',
      it: 'Dettaglio Imposta',
      es: 'Desglose del Impuesto',
      fr: "Détail de l'Impôt",
      de: 'Steueraufschlüsselung',
      pt: 'Detalhamento do Imposto',
    },
    taxableEarnings: {
      en: 'Taxable Net Earnings (92.35%)',
      it: 'Reddito Netto Imponibile (92,35%)',
      es: 'Ganancias Netas Imponibles (92,35%)',
      fr: 'Gains Nets Imposables (92,35%)',
      de: 'Steuerpflichtige Nettoeinkünfte (92,35%)',
      pt: 'Ganhos Líquidos Tributáveis (92,35%)',
    },
  } as Record<string, Record<Locale, string>>;

  const seoContent: Record<
    Locale,
    { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }
  > = {
    en: {
      title: 'Free Self-Employment Tax Calculator — Estimate Your 15.3% SE Tax',
      paragraphs: [
        'The Self-Employment Tax Calculator helps freelancers, independent contractors, and small business owners estimate the self-employment tax they owe. Self-employment tax covers Social Security and Medicare contributions that an employer would normally split with an employee.',
        'The total self-employment tax rate is 15.3%, made up of 12.4% for Social Security and 2.9% for Medicare. This tax applies to 92.35% of your net self-employment earnings, not the full amount, which reflects the employer-equivalent deduction.',
        'For 2026, only the first $176,100 of net earnings is subject to the 12.4% Social Security portion, known as the Social Security wage base. The 2.9% Medicare portion has no income cap and applies to all of your taxable net earnings.',
        'One important benefit: you can deduct half of your self-employment tax on your Form 1040, which reduces your adjusted gross income. This calculator provides a simplified estimate and does not include the additional 0.9% Medicare surtax that applies to earnings over $200,000.',
      ],
      faq: [
        {
          q: 'What is the self-employment tax rate?',
          a: 'The total self-employment tax rate is 15.3%: 12.4% for Social Security plus 2.9% for Medicare. It replaces the payroll taxes an employer would otherwise share with an employee.',
        },
        {
          q: 'Why is only 92.35% of my income taxed?',
          a: 'Self-employment tax applies to 92.35% of your net earnings. Multiplying net income by 0.9235 accounts for the employer-equivalent portion of the tax, mirroring how employees are treated.',
        },
        {
          q: 'What is the 2026 Social Security wage base?',
          a: 'For 2026, only the first $176,100 of net earnings is subject to the 12.4% Social Security tax. Earnings above that cap are not charged the Social Security portion, though Medicare still applies.',
        },
        {
          q: 'Can I deduct part of my self-employment tax?',
          a: 'Yes. You can deduct half of your self-employment tax on Form 1040, lowering your adjusted gross income. Note this simplified estimate excludes the extra 0.9% Medicare surtax on earnings over $200,000.',
        },
      ],
    },
    it: {
      title: "Calcolatore Imposta Lavoro Autonomo Gratuito — Stima l'Imposta SE del 15,3%",
      paragraphs: [
        "Il Calcolatore Imposta sul Lavoro Autonomo aiuta liberi professionisti, collaboratori indipendenti e piccoli imprenditori a stimare l'imposta dovuta. Questa imposta copre i contributi per la previdenza sociale (Social Security) e Medicare che normalmente un datore di lavoro condividerebbe con il dipendente.",
        "L'aliquota totale dell'imposta sul lavoro autonomo è del 15,3%, composta dal 12,4% per la previdenza sociale e dal 2,9% per Medicare. L'imposta si applica al 92,35% del reddito netto da lavoro autonomo, non all'intero importo.",
        'Per il 2026, solo i primi $176.100 di reddito netto sono soggetti alla quota del 12,4% per la previdenza sociale, nota come base salariale Social Security. La quota Medicare del 2,9% non ha alcun tetto di reddito.',
        "Un beneficio importante: puoi dedurre metà dell'imposta sul lavoro autonomo nel Modulo 1040, riducendo il reddito lordo rettificato. Questa stima semplificata non include la sovrattassa Medicare aggiuntiva dello 0,9% che si applica ai redditi oltre $200.000.",
      ],
      faq: [
        {
          q: "Qual è l'aliquota dell'imposta sul lavoro autonomo?",
          a: "L'aliquota totale è del 15,3%: 12,4% per la previdenza sociale più 2,9% per Medicare. Sostituisce i contributi che un datore di lavoro condividerebbe con un dipendente.",
        },
        {
          q: 'Perché viene tassato solo il 92,35% del reddito?',
          a: "L'imposta si applica al 92,35% del reddito netto. Moltiplicare il reddito netto per 0,9235 tiene conto della quota equivalente del datore di lavoro.",
        },
        {
          q: 'Qual è la base salariale Social Security 2026?',
          a: "Per il 2026, solo i primi $176.100 di reddito netto sono soggetti all'imposta del 12,4% per la previdenza sociale. Oltre tale tetto si applica solo Medicare.",
        },
        {
          q: "Posso dedurre parte dell'imposta?",
          a: "Sì. Puoi dedurre metà dell'imposta sul lavoro autonomo nel Modulo 1040. Questa stima semplificata esclude la sovrattassa Medicare aggiuntiva dello 0,9% sui redditi oltre $200.000.",
        },
      ],
    },
    es: {
      title: 'Calculadora de Impuesto por Cuenta Propia Gratis — Estima tu Impuesto SE del 15,3%',
      paragraphs: [
        'La Calculadora de Impuesto por Cuenta Propia ayuda a autónomos, contratistas independientes y pequeños empresarios a estimar el impuesto que deben pagar. Este impuesto cubre las contribuciones a la Seguridad Social (Social Security) y Medicare que normalmente un empleador compartiría con el empleado.',
        'La tasa total del impuesto por cuenta propia es del 15,3%, compuesta por un 12,4% para la Seguridad Social y un 2,9% para Medicare. El impuesto se aplica al 92,35% de tus ganancias netas por cuenta propia, no al importe total.',
        'Para 2026, solo los primeros $176.100 de ganancias netas están sujetos a la porción del 12,4% de la Seguridad Social, conocida como base salarial. La porción del 2,9% de Medicare no tiene límite de ingresos.',
        'Un beneficio importante: puedes deducir la mitad de tu impuesto por cuenta propia en el Formulario 1040, reduciendo tu ingreso bruto ajustado. Esta estimación simplificada no incluye el recargo adicional de Medicare del 0,9% que se aplica a ingresos superiores a $200.000.',
      ],
      faq: [
        {
          q: '¿Cuál es la tasa del impuesto por cuenta propia?',
          a: 'La tasa total es del 15,3%: 12,4% para la Seguridad Social más 2,9% para Medicare. Reemplaza los impuestos que un empleador compartiría con un empleado.',
        },
        {
          q: '¿Por qué solo se grava el 92,35% de mis ingresos?',
          a: 'El impuesto se aplica al 92,35% de tus ganancias netas. Multiplicar el ingreso neto por 0,9235 tiene en cuenta la porción equivalente del empleador.',
        },
        {
          q: '¿Cuál es la base salarial de la Seguridad Social 2026?',
          a: 'Para 2026, solo los primeros $176.100 de ganancias netas están sujetos al impuesto del 12,4% de la Seguridad Social. Por encima de ese límite solo se aplica Medicare.',
        },
        {
          q: '¿Puedo deducir parte de mi impuesto?',
          a: 'Sí. Puedes deducir la mitad de tu impuesto por cuenta propia en el Formulario 1040. Esta estimación simplificada excluye el recargo de Medicare del 0,9% sobre ingresos superiores a $200.000.',
        },
      ],
    },
    fr: {
      title:
        "Calculateur d'Impôt sur le Travail Indépendant Gratuit — Estimez votre Impôt SE de 15,3%",
      paragraphs: [
        "Le Calculateur d'Impôt sur le Travail Indépendant aide les freelances, les entrepreneurs indépendants et les petits chefs d'entreprise à estimer l'impôt qu'ils doivent. Cet impôt couvre les cotisations de Sécurité Sociale (Social Security) et Medicare qu'un employeur partagerait normalement avec un salarié.",
        "Le taux total de l'impôt sur le travail indépendant est de 15,3%, composé de 12,4% pour la Sécurité Sociale et de 2,9% pour Medicare. L'impôt s'applique à 92,35% de vos revenus nets d'indépendant, et non au montant total.",
        "Pour 2026, seuls les premiers 176 100 $ de revenus nets sont soumis à la part de 12,4% de la Sécurité Sociale, appelée plafond salarial. La part Medicare de 2,9% n'a aucun plafond de revenu.",
        "Un avantage important : vous pouvez déduire la moitié de votre impôt sur le travail indépendant sur le Formulaire 1040, ce qui réduit votre revenu brut ajusté. Cette estimation simplifiée n'inclut pas la surtaxe Medicare supplémentaire de 0,9% qui s'applique aux revenus supérieurs à 200 000 $.",
      ],
      faq: [
        {
          q: "Quel est le taux de l'impôt sur le travail indépendant ?",
          a: "Le taux total est de 15,3% : 12,4% pour la Sécurité Sociale plus 2,9% pour Medicare. Il remplace les cotisations qu'un employeur partagerait avec un salarié.",
        },
        {
          q: 'Pourquoi seulement 92,35% de mes revenus sont-ils imposés ?',
          a: "L'impôt s'applique à 92,35% de vos revenus nets. Multiplier le revenu net par 0,9235 tient compte de la part équivalente de l'employeur.",
        },
        {
          q: 'Quel est le plafond salarial de la Sécurité Sociale 2026 ?',
          a: "Pour 2026, seuls les premiers 176 100 $ de revenus nets sont soumis à l'impôt de 12,4% de la Sécurité Sociale. Au-delà de ce plafond, seul Medicare s'applique.",
        },
        {
          q: 'Puis-je déduire une partie de mon impôt ?',
          a: 'Oui. Vous pouvez déduire la moitié de votre impôt sur le travail indépendant sur le Formulaire 1040. Cette estimation simplifiée exclut la surtaxe Medicare de 0,9% sur les revenus supérieurs à 200 000 $.',
        },
      ],
    },
    de: {
      title: 'Kostenloser Selbständigkeitssteuer-Rechner — Schätzen Sie Ihre 15,3% SE-Steuer',
      paragraphs: [
        'Der Selbständigkeitssteuer-Rechner hilft Freiberuflern, unabhängigen Auftragnehmern und Kleinunternehmern, die geschuldete Steuer zu schätzen. Diese Steuer deckt die Beiträge zur Sozialversicherung (Social Security) und Medicare ab, die ein Arbeitgeber normalerweise mit dem Arbeitnehmer teilen würde.',
        'Der Gesamtsatz der Selbständigkeitssteuer beträgt 15,3% und setzt sich aus 12,4% für die Sozialversicherung und 2,9% für Medicare zusammen. Die Steuer gilt für 92,35% Ihrer Netto-Einkommen aus Selbständigkeit, nicht für den vollen Betrag.',
        'Für 2026 unterliegen nur die ersten 176.100 $ der Netto-Einkünfte dem 12,4%-Anteil der Sozialversicherung, der sogenannten Beitragsbemessungsgrenze. Der Medicare-Anteil von 2,9% hat keine Einkommensobergrenze.',
        'Ein wichtiger Vorteil: Sie können die Hälfte Ihrer Selbständigkeitssteuer im Formular 1040 absetzen, was Ihr bereinigtes Bruttoeinkommen senkt. Diese vereinfachte Schätzung enthält nicht den zusätzlichen Medicare-Zuschlag von 0,9%, der für Einkünfte über 200.000 $ gilt.',
      ],
      faq: [
        {
          q: 'Wie hoch ist der Satz der Selbständigkeitssteuer?',
          a: 'Der Gesamtsatz beträgt 15,3%: 12,4% für die Sozialversicherung plus 2,9% für Medicare. Er ersetzt die Lohnsteuern, die ein Arbeitgeber mit einem Arbeitnehmer teilen würde.',
        },
        {
          q: 'Warum werden nur 92,35% meines Einkommens besteuert?',
          a: 'Die Steuer gilt für 92,35% Ihrer Netto-Einkünfte. Die Multiplikation des Nettoeinkommens mit 0,9235 berücksichtigt den arbeitgeberäquivalenten Anteil.',
        },
        {
          q: 'Was ist die Beitragsbemessungsgrenze 2026?',
          a: 'Für 2026 unterliegen nur die ersten 176.100 $ der Netto-Einkünfte der 12,4%-Sozialversicherungssteuer. Oberhalb dieser Grenze gilt nur Medicare.',
        },
        {
          q: 'Kann ich einen Teil meiner Steuer absetzen?',
          a: 'Ja. Sie können die Hälfte Ihrer Selbständigkeitssteuer im Formular 1040 absetzen. Diese vereinfachte Schätzung schließt den zusätzlichen Medicare-Zuschlag von 0,9% auf Einkünfte über 200.000 $ aus.',
        },
      ],
    },
    pt: {
      title: 'Calculadora de Imposto de Trabalho Autônomo Grátis — Estime seu Imposto SE de 15,3%',
      paragraphs: [
        'A Calculadora de Imposto de Trabalho Autônomo ajuda freelancers, contratados independentes e pequenos empresários a estimar o imposto devido. Este imposto cobre as contribuições para a Previdência Social (Social Security) e Medicare que normalmente um empregador dividiria com o funcionário.',
        'A alíquota total do imposto de trabalho autônomo é de 15,3%, composta por 12,4% para a Previdência Social e 2,9% para o Medicare. O imposto se aplica a 92,35% da sua renda líquida de trabalho autônomo, não ao valor total.',
        'Para 2026, apenas os primeiros $176.100 de renda líquida estão sujeitos à parcela de 12,4% da Previdência Social, conhecida como base salarial. A parcela de 2,9% do Medicare não tem limite de renda.',
        'Um benefício importante: você pode deduzir metade do seu imposto de trabalho autônomo no Formulário 1040, reduzindo sua renda bruta ajustada. Esta estimativa simplificada não inclui a sobretaxa adicional de Medicare de 0,9% que se aplica a rendas acima de $200.000.',
      ],
      faq: [
        {
          q: 'Qual é a alíquota do imposto de trabalho autônomo?',
          a: 'A alíquota total é de 15,3%: 12,4% para a Previdência Social mais 2,9% para o Medicare. Substitui os impostos que um empregador dividiria com um funcionário.',
        },
        {
          q: 'Por que apenas 92,35% da minha renda é tributada?',
          a: 'O imposto se aplica a 92,35% da sua renda líquida. Multiplicar a renda líquida por 0,9235 leva em conta a parcela equivalente ao empregador.',
        },
        {
          q: 'Qual é a base salarial da Previdência Social 2026?',
          a: 'Para 2026, apenas os primeiros $176.100 de renda líquida estão sujeitos ao imposto de 12,4% da Previdência Social. Acima desse limite, apenas o Medicare se aplica.',
        },
        {
          q: 'Posso deduzir parte do meu imposto?',
          a: 'Sim. Você pode deduzir metade do seu imposto de trabalho autônomo no Formulário 1040. Esta estimativa simplificada exclui a sobretaxa de Medicare de 0,9% sobre rendas acima de $200.000.',
        },
      ],
    },
  };

  const seo = seoContent[lang];
  const formatCurrency = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <ToolPageWrapper toolSlug="self-employment-tax-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.netIncome[lang]}
            </label>
            <input
              type="number"
              value={netIncome}
              onChange={(e) => setNetIncome(e.target.value)}
              placeholder="80000"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {income > 0 && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                <div className="text-xs text-blue-600 font-medium mb-1">{labels.seTax[lang]}</div>
                <div className="text-4xl font-bold text-gray-900">${formatCurrency(seTax)}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">{labels.ssPortion[lang]}</div>
                  <div className="text-xl font-bold text-gray-900">${formatCurrency(ssTax)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">{labels.medicarePortion[lang]}</div>
                  <div className="text-xl font-bold text-gray-900">
                    ${formatCurrency(medicareTax)}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">{labels.breakdown[lang]}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">{labels.taxableEarnings[lang]}</span>
                    <span className="font-semibold">${formatCurrency(netEarnings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">{labels.deductibleHalf[lang]}</span>
                    <span className="font-semibold text-green-600">
                      ${formatCurrency(deductibleHalf)}
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
