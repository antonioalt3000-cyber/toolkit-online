'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface HistoryEntry {
  income: number;
  filingStatus: string;
  totalTax: number;
  effectiveRate: number;
  timestamp: string;
}

interface BracketResult {
  min: number;
  max: number | null;
  rate: number;
  taxableInBracket: number;
  taxInBracket: number;
}

const labels: Record<string, Record<string, string>> = {
  annualIncome: { en: 'Annual Gross Income', it: 'Reddito Annuo Lordo', es: 'Ingreso Anual Bruto', fr: 'Revenu Annuel Brut', de: 'Jährliches Bruttoeinkommen', pt: 'Rendimento Anual Bruto' },
  filingStatus: { en: 'Filing Status', it: 'Stato di Dichiarazione', es: 'Estado de Declaración', fr: 'Statut de Déclaration', de: 'Veranlagungsstatus', pt: 'Estado de Declaração' },
  single: { en: 'Single', it: 'Singolo/a', es: 'Soltero/a', fr: 'Célibataire', de: 'Alleinstehend', pt: 'Solteiro/a' },
  marriedJoint: { en: 'Married Filing Jointly', it: 'Coniugato/a (Dichiarazione Congiunta)', es: 'Casado/a (Declaración Conjunta)', fr: 'Marié(e) (Déclaration Conjointe)', de: 'Verheiratet (Gemeinsame Veranlagung)', pt: 'Casado/a (Declaração Conjunta)' },
  headOfHousehold: { en: 'Head of Household', it: 'Capofamiglia', es: 'Cabeza de Familia', fr: 'Chef de Famille', de: 'Haushaltsvorstand', pt: 'Chefe de Família' },
  calculate: { en: 'Calculate', it: 'Calcola', es: 'Calcular', fr: 'Calculer', de: 'Berechnen', pt: 'Calcular' },
  reset: { en: 'Reset', it: 'Reimposta', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  totalTax: { en: 'Total Federal Tax', it: 'Imposta Federale Totale', es: 'Impuesto Federal Total', fr: 'Impôt Fédéral Total', de: 'Gesamte Bundessteuer', pt: 'Imposto Federal Total' },
  effectiveRate: { en: 'Effective Tax Rate', it: 'Aliquota Effettiva', es: 'Tasa Efectiva', fr: 'Taux Effectif', de: 'Effektiver Steuersatz', pt: 'Taxa Efetiva' },
  marginalRate: { en: 'Marginal Tax Rate', it: 'Aliquota Marginale', es: 'Tasa Marginal', fr: 'Taux Marginal', de: 'Grenzsteuersatz', pt: 'Taxa Marginal' },
  afterTaxIncome: { en: 'After-Tax Income', it: 'Reddito Netto', es: 'Ingreso Después de Impuestos', fr: 'Revenu Après Impôts', de: 'Nettoeinkommen', pt: 'Rendimento Líquido' },
  bracketBreakdown: { en: 'Tax Bracket Breakdown', it: 'Dettaglio Scaglioni Fiscali', es: 'Desglose por Tramos Fiscales', fr: 'Détail par Tranches d\'Imposition', de: 'Steuerklassen-Aufschlüsselung', pt: 'Detalhamento por Faixas Fiscais' },
  bracket: { en: 'Bracket', it: 'Scaglione', es: 'Tramo', fr: 'Tranche', de: 'Steuerklasse', pt: 'Faixa' },
  taxRate: { en: 'Rate', it: 'Aliquota', es: 'Tasa', fr: 'Taux', de: 'Steuersatz', pt: 'Taxa' },
  taxableAmount: { en: 'Taxable', it: 'Imponibile', es: 'Imponible', fr: 'Imposable', de: 'Steuerpflichtig', pt: 'Tributável' },
  taxOwed: { en: 'Tax Owed', it: 'Imposta Dovuta', es: 'Impuesto a Pagar', fr: 'Impôt Dû', de: 'Steuerschuld', pt: 'Imposto Devido' },
  copy: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier les Résultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
  copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié!', de: 'Kopiert!', pt: 'Copiado!' },
  history: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
  disclaimer: { en: 'Based on 2024 US Federal Income Tax brackets. This is an estimate only. Consult a tax professional for actual tax liability.', it: 'Basato sugli scaglioni fiscali federali USA 2024. Questa è solo una stima. Consulta un professionista fiscale per la responsabilità fiscale effettiva.', es: 'Basado en los tramos del impuesto federal sobre la renta de EE.UU. 2024. Esto es solo una estimación. Consulte a un profesional fiscal.', fr: 'Basé sur les tranches d\'impôt fédéral américain 2024. Ceci est une estimation uniquement. Consultez un professionnel fiscal.', de: 'Basierend auf den US-Bundeseinkommensteuersätzen 2024. Dies ist nur eine Schätzung. Konsultieren Sie einen Steuerberater.', pt: 'Baseado nas faixas do imposto de renda federal dos EUA 2024. Isto é apenas uma estimativa. Consulte um profissional fiscal.' },
  monthlyTax: { en: 'Monthly Tax', it: 'Imposta Mensile', es: 'Impuesto Mensual', fr: 'Impôt Mensuel', de: 'Monatliche Steuer', pt: 'Imposto Mensal' },
  monthlyAfterTax: { en: 'Monthly After-Tax', it: 'Netto Mensile', es: 'Neto Mensual', fr: 'Net Mensuel', de: 'Monatliches Netto', pt: 'Líquido Mensal' },
};

// 2024 US Federal Income Tax Brackets
const TAX_BRACKETS: Record<string, { min: number; max: number | null; rate: number }[]> = {
  single: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: null, rate: 0.37 },
  ],
  marriedJoint: [
    { min: 0, max: 23200, rate: 0.10 },
    { min: 23200, max: 94300, rate: 0.12 },
    { min: 94300, max: 201050, rate: 0.22 },
    { min: 201050, max: 383900, rate: 0.24 },
    { min: 383900, max: 487450, rate: 0.32 },
    { min: 487450, max: 731200, rate: 0.35 },
    { min: 731200, max: null, rate: 0.37 },
  ],
  headOfHousehold: [
    { min: 0, max: 16550, rate: 0.10 },
    { min: 16550, max: 63100, rate: 0.12 },
    { min: 63100, max: 100500, rate: 0.22 },
    { min: 100500, max: 191950, rate: 0.24 },
    { min: 191950, max: 243700, rate: 0.32 },
    { min: 243700, max: 609350, rate: 0.35 },
    { min: 609350, max: null, rate: 0.37 },
  ],
};

const BRACKET_COLORS = [
  'bg-green-400', 'bg-emerald-400', 'bg-teal-400', 'bg-cyan-400', 'bg-blue-400', 'bg-indigo-400', 'bg-purple-400',
];

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: {
    title: 'Tax Bracket Calculator: Understand Your Federal Income Tax',
    paragraphs: [
      'Understanding how federal income tax brackets work is essential for financial planning and estimating your tax liability. The United States uses a progressive tax system, meaning your income is taxed at different rates as it passes through each bracket. This means only the income within each bracket is taxed at that bracket\'s rate, not your entire income. Many people mistakenly believe that earning more can result in taking home less, but this is not how progressive taxation works.',
      'Our tax bracket calculator uses the 2024 US federal income tax rates to estimate your tax liability based on your annual income and filing status. You can choose from three filing statuses: Single, Married Filing Jointly, and Head of Household. Each status has different bracket thresholds, reflecting the tax code\'s adjustments for different family situations. The calculator shows your total tax, effective tax rate, marginal tax rate, and a detailed breakdown of how much tax you owe in each bracket.',
      'The effective tax rate is the average rate at which your total income is taxed. It is always lower than your marginal rate because only the portion of income in the highest bracket is taxed at the marginal rate. For example, a single filer earning $100,000 does not pay 22% on the entire amount. Instead, the first $11,600 is taxed at 10%, the next portion at 12%, and only the amount above $47,150 is taxed at 22%. This results in an effective rate of approximately 17.4%.',
      'The visual bracket breakdown with colored bars helps you see exactly how your income is distributed across tax brackets and how much tax each bracket contributes to your total liability. This visualization makes the progressive tax system intuitive and easy to understand. Remember that this calculator estimates federal income tax only. State income taxes, Social Security, Medicare, and other deductions are not included. Always consult a qualified tax professional for accurate tax planning.'
    ],
    faq: [
      { q: 'What is the difference between effective and marginal tax rate?', a: 'Your marginal tax rate is the rate applied to your last dollar of income — it is the highest bracket your income reaches. Your effective tax rate is the average rate across all your income, calculated by dividing total tax by total income. The effective rate is always lower than the marginal rate in a progressive system.' },
      { q: 'Does moving into a higher tax bracket mean all my income is taxed at the higher rate?', a: 'No. This is a common misconception. In the US progressive tax system, only the income within each bracket is taxed at that bracket\'s rate. Moving into a higher bracket means only the income above the previous bracket\'s threshold is taxed at the new, higher rate. Your overall take-home pay always increases when you earn more.' },
      { q: 'What filing status should I choose?', a: 'Choose Single if you are unmarried. Choose Married Filing Jointly if you are married and want to file a combined return with your spouse (this usually results in the lowest tax). Choose Head of Household if you are unmarried but pay more than half the cost of maintaining a home for a qualifying dependent.' },
      { q: 'Does this calculator include state income tax?', a: 'No. This calculator estimates US federal income tax only. State income tax rates and rules vary significantly by state. Some states have no income tax, while others have rates up to 13%. You should calculate state taxes separately to understand your total tax liability.' },
      { q: 'Are these the 2024 or 2025 tax brackets?', a: 'This calculator uses the 2024 US federal income tax brackets as established by the IRS. Tax brackets are adjusted annually for inflation. The 2024 brackets apply to income earned during the 2024 calendar year, which is filed in early 2025.' }
    ]
  },
  it: {
    title: 'Calcolatore Scaglioni Fiscali: Comprendi la Tua Imposta sul Reddito Federale',
    paragraphs: [
      'Capire come funzionano gli scaglioni dell\'imposta sul reddito federale è essenziale per la pianificazione finanziaria e la stima delle imposte dovute. Gli Stati Uniti utilizzano un sistema fiscale progressivo, il che significa che il reddito viene tassato ad aliquote diverse man mano che attraversa ogni scaglione. Solo il reddito all\'interno di ogni scaglione viene tassato all\'aliquota di quello scaglione, non l\'intero reddito.',
      'Il nostro calcolatore di scaglioni fiscali utilizza le aliquote dell\'imposta federale sul reddito USA 2024 per stimare la tua imposta in base al reddito annuo e allo stato di dichiarazione. Puoi scegliere tra tre stati: Singolo, Coniugato con Dichiarazione Congiunta e Capofamiglia. Ogni stato ha soglie di scaglione diverse. Il calcolatore mostra l\'imposta totale, l\'aliquota effettiva, l\'aliquota marginale e un dettaglio completo.',
      'L\'aliquota effettiva è il tasso medio al quale viene tassato il tuo reddito totale. È sempre inferiore all\'aliquota marginale perché solo la parte di reddito nello scaglione più alto è tassata all\'aliquota marginale. Ad esempio, un contribuente singolo che guadagna $100.000 non paga il 22% sull\'intero importo.',
      'La rappresentazione visiva con barre colorate ti aiuta a vedere esattamente come il tuo reddito è distribuito tra gli scaglioni e quanto ogni scaglione contribuisce alla tua imposta totale. Ricorda che questo calcolatore stima solo l\'imposta federale sul reddito. Le imposte statali e altri contributi non sono inclusi.'
    ],
    faq: [
      { q: 'Qual è la differenza tra aliquota effettiva e marginale?', a: 'L\'aliquota marginale è quella applicata all\'ultimo dollaro di reddito — è lo scaglione più alto raggiunto. L\'aliquota effettiva è il tasso medio su tutto il reddito. L\'aliquota effettiva è sempre inferiore a quella marginale in un sistema progressivo.' },
      { q: 'Passare a uno scaglione superiore significa che tutto il mio reddito è tassato di più?', a: 'No. Questo è un malinteso comune. Nel sistema fiscale progressivo USA, solo il reddito all\'interno di ogni scaglione è tassato all\'aliquota di quello scaglione. Il reddito netto aumenta sempre quando si guadagna di più.' },
      { q: 'Quale stato di dichiarazione dovrei scegliere?', a: 'Scegli Singolo se non sei sposato. Scegli Coniugato con Dichiarazione Congiunta se sei sposato e vuoi fare una dichiarazione combinata. Scegli Capofamiglia se non sei sposato ma mantieni una casa per un dipendente qualificato.' },
      { q: 'Questo calcolatore include le imposte statali?', a: 'No. Questo calcolatore stima solo l\'imposta federale USA. Le aliquote statali variano significativamente. Alcuni stati non hanno imposta sul reddito, altri hanno aliquote fino al 13%.' },
      { q: 'Questi sono gli scaglioni fiscali 2024 o 2025?', a: 'Questo calcolatore utilizza gli scaglioni fiscali federali USA 2024 stabiliti dall\'IRS. Gli scaglioni vengono aggiornati annualmente per l\'inflazione.' }
    ]
  },
  es: {
    title: 'Calculadora de Tramos Fiscales: Entiende Tu Impuesto sobre la Renta Federal',
    paragraphs: [
      'Entender cómo funcionan los tramos del impuesto sobre la renta federal es esencial para la planificación financiera. Estados Unidos utiliza un sistema fiscal progresivo, lo que significa que tu ingreso se grava a diferentes tasas a medida que pasa por cada tramo. Solo el ingreso dentro de cada tramo se grava a la tasa de ese tramo, no todo tu ingreso.',
      'Nuestra calculadora utiliza las tasas del impuesto federal sobre la renta de EE.UU. 2024 para estimar tu responsabilidad fiscal según tu ingreso anual y estado de declaración. Puedes elegir entre tres estados: Soltero, Casado con Declaración Conjunta y Cabeza de Familia. Cada estado tiene diferentes umbrales de tramo. La calculadora muestra el impuesto total, la tasa efectiva, la tasa marginal y un desglose detallado.',
      'La tasa efectiva es la tasa promedio a la que se grava tu ingreso total. Siempre es menor que la tasa marginal porque solo la porción de ingreso en el tramo más alto se grava a la tasa marginal. Por ejemplo, un contribuyente soltero que gana $100,000 no paga el 22% sobre todo el monto.',
      'La representación visual con barras de colores te ayuda a ver exactamente cómo tu ingreso se distribuye entre los tramos y cuánto contribuye cada uno al impuesto total. Recuerda que esta calculadora estima solo el impuesto federal sobre la renta. Los impuestos estatales y otras contribuciones no están incluidos.'
    ],
    faq: [
      { q: '¿Cuál es la diferencia entre tasa efectiva y marginal?', a: 'La tasa marginal es la que se aplica a tu último dólar de ingreso. La tasa efectiva es la tasa promedio sobre todo tu ingreso. La tasa efectiva siempre es menor que la marginal en un sistema progresivo.' },
      { q: '¿Pasar a un tramo superior significa que todo mi ingreso se grava más?', a: 'No. Este es un malentendido común. Solo el ingreso dentro de cada tramo se grava a la tasa de ese tramo. Tu ingreso neto siempre aumenta cuando ganas más.' },
      { q: '¿Qué estado de declaración debo elegir?', a: 'Elige Soltero si no estás casado. Elige Casado con Declaración Conjunta si estás casado. Elige Cabeza de Familia si no estás casado pero mantienes un hogar para un dependiente calificado.' },
      { q: '¿Esta calculadora incluye impuestos estatales?', a: 'No. Esta calculadora estima solo el impuesto federal. Las tasas estatales varían significativamente. Algunos estados no tienen impuesto sobre la renta, otros tienen tasas hasta del 13%.' },
      { q: '¿Estos son los tramos fiscales 2024 o 2025?', a: 'Esta calculadora utiliza los tramos fiscales federales de EE.UU. 2024 establecidos por el IRS. Los tramos se actualizan anualmente por inflación.' }
    ]
  },
  fr: {
    title: 'Calculateur de Tranches d\'Imposition : Comprenez Votre Impôt Fédéral sur le Revenu',
    paragraphs: [
      'Comprendre le fonctionnement des tranches d\'imposition fédérale est essentiel pour la planification financière. Les États-Unis utilisent un système fiscal progressif, ce qui signifie que votre revenu est imposé à des taux différents à mesure qu\'il traverse chaque tranche. Seul le revenu dans chaque tranche est imposé au taux de cette tranche, pas la totalité de votre revenu.',
      'Notre calculateur utilise les taux d\'imposition fédérale américains 2024 pour estimer votre impôt en fonction de votre revenu annuel et de votre statut de déclaration. Vous pouvez choisir parmi trois statuts : Célibataire, Marié(e) avec Déclaration Conjointe et Chef de Famille. Chaque statut a des seuils de tranche différents. Le calculateur montre l\'impôt total, le taux effectif, le taux marginal et un détail complet.',
      'Le taux effectif est le taux moyen auquel votre revenu total est imposé. Il est toujours inférieur au taux marginal car seule la portion de revenu dans la tranche la plus élevée est imposée au taux marginal. Par exemple, un contribuable célibataire gagnant 100 000 $ ne paie pas 22% sur la totalité du montant.',
      'La représentation visuelle avec des barres colorées vous aide à voir comment votre revenu est réparti entre les tranches et combien chaque tranche contribue à votre impôt total. N\'oubliez pas que ce calculateur estime uniquement l\'impôt fédéral sur le revenu. Les impôts d\'État et autres contributions ne sont pas inclus.'
    ],
    faq: [
      { q: 'Quelle est la différence entre taux effectif et taux marginal ?', a: 'Le taux marginal est celui appliqué à votre dernier dollar de revenu. Le taux effectif est le taux moyen sur l\'ensemble de votre revenu. Le taux effectif est toujours inférieur au taux marginal dans un système progressif.' },
      { q: 'Passer à une tranche supérieure signifie-t-il que tout mon revenu est plus imposé ?', a: 'Non. C\'est une idée reçue courante. Seul le revenu dans chaque tranche est imposé au taux de cette tranche. Votre revenu net augmente toujours quand vous gagnez plus.' },
      { q: 'Quel statut de déclaration choisir ?', a: 'Choisissez Célibataire si vous n\'êtes pas marié. Choisissez Marié(e) avec Déclaration Conjointe si vous êtes marié. Choisissez Chef de Famille si vous n\'êtes pas marié mais entretenez un foyer pour un dépendant qualifié.' },
      { q: 'Ce calculateur inclut-il les impôts d\'État ?', a: 'Non. Ce calculateur estime uniquement l\'impôt fédéral. Les taux des États varient considérablement. Certains États n\'ont pas d\'impôt sur le revenu, d\'autres ont des taux allant jusqu\'à 13%.' },
      { q: 'S\'agit-il des tranches fiscales 2024 ou 2025 ?', a: 'Ce calculateur utilise les tranches fiscales fédérales américaines 2024 établies par l\'IRS. Les tranches sont mises à jour annuellement pour l\'inflation.' }
    ]
  },
  de: {
    title: 'Steuerklassen-Rechner: Verstehen Sie Ihre Bundeseinkommensteuer',
    paragraphs: [
      'Das Verständnis der Bundeseinkommensteuerklassen ist entscheidend für die Finanzplanung. Die USA verwenden ein progressives Steuersystem, was bedeutet, dass Ihr Einkommen zu verschiedenen Sätzen besteuert wird, wenn es durch jede Klasse fließt. Nur das Einkommen innerhalb jeder Klasse wird zum Satz dieser Klasse besteuert, nicht Ihr gesamtes Einkommen.',
      'Unser Steuerklassen-Rechner verwendet die US-Bundeseinkommensteuersätze 2024, um Ihre Steuerlast anhand Ihres Jahreseinkommens und Veranlagungsstatus zu schätzen. Sie können aus drei Status wählen: Alleinstehend, Verheiratet mit gemeinsamer Veranlagung und Haushaltsvorstand. Jeder Status hat unterschiedliche Schwellenwerte. Der Rechner zeigt die Gesamtsteuer, den effektiven Steuersatz, den Grenzsteuersatz und eine detaillierte Aufschlüsselung.',
      'Der effektive Steuersatz ist der Durchschnittssatz, zu dem Ihr Gesamteinkommen besteuert wird. Er ist immer niedriger als der Grenzsteuersatz, da nur der Einkommensteil in der höchsten Klasse zum Grenzsteuersatz besteuert wird. Zum Beispiel zahlt ein alleinstehender Steuerpflichtiger mit 100.000 $ Einkommen nicht 22% auf den gesamten Betrag.',
      'Die visuelle Darstellung mit farbigen Balken hilft Ihnen zu sehen, wie Ihr Einkommen auf die Steuerklassen verteilt ist und wie viel jede Klasse zu Ihrer Gesamtsteuer beiträgt. Beachten Sie, dass dieser Rechner nur die Bundeseinkommensteuer schätzt. Staatliche Steuern und andere Abgaben sind nicht enthalten.'
    ],
    faq: [
      { q: 'Was ist der Unterschied zwischen effektivem und Grenzsteuersatz?', a: 'Der Grenzsteuersatz ist der Satz, der auf Ihren letzten Dollar Einkommen angewendet wird. Der effektive Steuersatz ist der Durchschnittssatz über Ihr gesamtes Einkommen. Der effektive Satz ist in einem progressiven System immer niedriger als der Grenzsatz.' },
      { q: 'Bedeutet der Wechsel in eine höhere Steuerklasse, dass mein gesamtes Einkommen höher besteuert wird?', a: 'Nein. Dies ist ein häufiges Missverständnis. Nur das Einkommen innerhalb jeder Klasse wird zum Satz dieser Klasse besteuert. Ihr Nettoeinkommen steigt immer, wenn Sie mehr verdienen.' },
      { q: 'Welchen Veranlagungsstatus sollte ich wählen?', a: 'Wählen Sie Alleinstehend, wenn Sie nicht verheiratet sind. Wählen Sie Verheiratet mit gemeinsamer Veranlagung, wenn Sie verheiratet sind. Wählen Sie Haushaltsvorstand, wenn Sie nicht verheiratet sind, aber einen Haushalt für einen qualifizierten Unterhaltsberechtigten führen.' },
      { q: 'Berücksichtigt dieser Rechner staatliche Einkommensteuern?', a: 'Nein. Dieser Rechner schätzt nur die Bundeseinkommensteuer. Die staatlichen Steuersätze variieren erheblich. Einige Staaten haben keine Einkommensteuer, andere haben Sätze bis zu 13%.' },
      { q: 'Sind dies die Steuerklassen 2024 oder 2025?', a: 'Dieser Rechner verwendet die US-Bundeseinkommensteuerklassen 2024, die vom IRS festgelegt wurden. Die Klassen werden jährlich an die Inflation angepasst.' }
    ]
  },
  pt: {
    title: 'Calculadora de Faixas Fiscais: Entenda o Seu Imposto de Renda Federal',
    paragraphs: [
      'Compreender como funcionam as faixas do imposto de renda federal é essencial para o planejamento financeiro. Os Estados Unidos usam um sistema fiscal progressivo, o que significa que o seu rendimento é tributado a taxas diferentes à medida que passa por cada faixa. Apenas o rendimento dentro de cada faixa é tributado à taxa dessa faixa, não todo o seu rendimento.',
      'A nossa calculadora utiliza as taxas do imposto de renda federal dos EUA 2024 para estimar a sua responsabilidade fiscal com base no rendimento anual e estado de declaração. Pode escolher entre três estados: Solteiro, Casado com Declaração Conjunta e Chefe de Família. Cada estado tem limiares de faixa diferentes. A calculadora mostra o imposto total, a taxa efetiva, a taxa marginal e um detalhamento completo.',
      'A taxa efetiva é a taxa média à qual o seu rendimento total é tributado. É sempre inferior à taxa marginal porque apenas a porção de rendimento na faixa mais alta é tributada à taxa marginal. Por exemplo, um contribuinte solteiro que ganha $100.000 não paga 22% sobre todo o montante.',
      'A representação visual com barras coloridas ajuda a ver como o seu rendimento é distribuído pelas faixas e quanto cada faixa contribui para o imposto total. Lembre-se que esta calculadora estima apenas o imposto de renda federal. Impostos estaduais e outras contribuições não estão incluídos.'
    ],
    faq: [
      { q: 'Qual é a diferença entre taxa efetiva e marginal?', a: 'A taxa marginal é a aplicada ao seu último dólar de rendimento. A taxa efetiva é a taxa média sobre todo o seu rendimento. A taxa efetiva é sempre inferior à marginal num sistema progressivo.' },
      { q: 'Passar para uma faixa superior significa que todo o meu rendimento é mais tributado?', a: 'Não. Este é um equívoco comum. Apenas o rendimento dentro de cada faixa é tributado à taxa dessa faixa. O seu rendimento líquido sempre aumenta quando ganha mais.' },
      { q: 'Que estado de declaração devo escolher?', a: 'Escolha Solteiro se não é casado. Escolha Casado com Declaração Conjunta se é casado. Escolha Chefe de Família se não é casado mas mantém uma casa para um dependente qualificado.' },
      { q: 'Esta calculadora inclui impostos estaduais?', a: 'Não. Esta calculadora estima apenas o imposto federal. As taxas estaduais variam significativamente. Alguns estados não têm imposto de renda, outros têm taxas até 13%.' },
      { q: 'Estas são as faixas fiscais de 2024 ou 2025?', a: 'Esta calculadora utiliza as faixas fiscais federais dos EUA 2024 estabelecidas pelo IRS. As faixas são atualizadas anualmente pela inflação.' }
    ]
  },
};

export default function TaxBracketCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['tax-bracket-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [income, setIncome] = useState('');
  const [filingStatus, setFilingStatus] = useState<'single' | 'marriedJoint' | 'headOfHousehold'>('single');
  const [result, setResult] = useState<{
    totalTax: number;
    effectiveRate: number;
    marginalRate: number;
    afterTax: number;
    brackets: BracketResult[];
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const calculate = () => {
    const grossIncome = parseFloat(income);
    if (isNaN(grossIncome) || grossIncome <= 0) return;

    const brackets = TAX_BRACKETS[filingStatus];
    const bracketResults: BracketResult[] = [];
    let totalTax = 0;
    let marginalRate = 0;

    for (const bracket of brackets) {
      if (grossIncome <= bracket.min) {
        bracketResults.push({
          min: bracket.min,
          max: bracket.max,
          rate: bracket.rate,
          taxableInBracket: 0,
          taxInBracket: 0,
        });
        continue;
      }

      const upper = bracket.max !== null ? Math.min(grossIncome, bracket.max) : grossIncome;
      const taxableInBracket = upper - bracket.min;
      const taxInBracket = taxableInBracket * bracket.rate;
      totalTax += taxInBracket;
      marginalRate = bracket.rate;

      bracketResults.push({
        min: bracket.min,
        max: bracket.max,
        rate: bracket.rate,
        taxableInBracket,
        taxInBracket,
      });
    }

    const effectiveRate = (totalTax / grossIncome) * 100;
    const afterTax = grossIncome - totalTax;

    setResult({ totalTax, effectiveRate, marginalRate, afterTax, brackets: bracketResults });
    setHistory(prev => [{
      income: grossIncome,
      filingStatus: t(filingStatus),
      totalTax,
      effectiveRate,
      timestamp: new Date().toLocaleTimeString(),
    }, ...prev].slice(0, 5));
  };

  const handleReset = () => {
    setIncome('');
    setFilingStatus('single');
    setResult(null);
  };

  const copyResults = () => {
    if (!result) return;
    const text = `${t('totalTax')}: $${result.totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n${t('effectiveRate')}: ${result.effectiveRate.toFixed(2)}%\n${t('marginalRate')}: ${(result.marginalRate * 100).toFixed(0)}%\n${t('afterTaxIncome')}: $${result.afterTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const seo = seoContent[lang];
  const maxTaxInBracket = result ? Math.max(...result.brackets.filter(b => b.taxInBracket > 0).map(b => b.taxInBracket)) : 0;

  return (
    <ToolPageWrapper toolSlug="tax-bracket-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-700">{t('disclaimer')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('annualIncome')}</label>
            <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="75000"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('filingStatus')}</label>
            <select value={filingStatus} onChange={(e) => setFilingStatus(e.target.value as 'single' | 'marriedJoint' | 'headOfHousehold')}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="single">{t('single')}</option>
              <option value="marriedJoint">{t('marriedJoint')}</option>
              <option value="headOfHousehold">{t('headOfHousehold')}</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button onClick={calculate} className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2.5 font-medium hover:bg-blue-700 transition-colors">{t('calculate')}</button>
            <button onClick={handleReset} className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>

          {result && (
            <div className="space-y-4 mt-4">
              {/* Main results */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <div className="text-xs text-red-600 font-medium">{t('totalTax')}</div>
                  <div className="text-2xl font-bold text-red-700">${result.totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <div className="text-xs text-green-600 font-medium">{t('afterTaxIncome')}</div>
                  <div className="text-2xl font-bold text-green-700">${result.afterTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                  <div className="text-xs text-blue-600 font-medium">{t('effectiveRate')}</div>
                  <div className="text-xl font-bold text-blue-700">{result.effectiveRate.toFixed(2)}%</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
                  <div className="text-xs text-purple-600 font-medium">{t('marginalRate')}</div>
                  <div className="text-xl font-bold text-purple-700">{(result.marginalRate * 100).toFixed(0)}%</div>
                </div>
              </div>

              {/* Monthly breakdown */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500 font-medium">{t('monthlyTax')}</div>
                  <div className="text-lg font-bold text-gray-900">${(result.totalTax / 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500 font-medium">{t('monthlyAfterTax')}</div>
                  <div className="text-lg font-bold text-gray-900">${(result.afterTax / 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              </div>

              {/* Tax vs Income bar */}
              <div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden flex">
                  <div className="h-full bg-red-400" style={{ width: `${result.effectiveRate}%` }}></div>
                  <div className="h-full bg-green-400" style={{ width: `${100 - result.effectiveRate}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span className="text-red-600">{t('totalTax')}: {result.effectiveRate.toFixed(1)}%</span>
                  <span className="text-green-600">{t('afterTaxIncome')}: {(100 - result.effectiveRate).toFixed(1)}%</span>
                </div>
              </div>

              <button onClick={copyResults} className="w-full py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                {copied ? (
                  <><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{t('copied')}</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>{t('copy')}</>
                )}
              </button>

              {/* Bracket breakdown */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{t('bracketBreakdown')}</h3>

                {/* Visual colored bars */}
                <div className="space-y-2 mb-4">
                  {result.brackets.filter(b => b.taxInBracket > 0).map((bracket, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                        <span>{(bracket.rate * 100).toFixed(0)}% ({bracket.max ? `$${bracket.min.toLocaleString()} - $${bracket.max.toLocaleString()}` : `$${bracket.min.toLocaleString()}+`})</span>
                        <span className="font-medium">${bracket.taxInBracket.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div className={`${BRACKET_COLORS[i % BRACKET_COLORS.length]} h-3 rounded-full transition-all`}
                          style={{ width: `${maxTaxInBracket > 0 ? (bracket.taxInBracket / maxTaxInBracket) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detailed table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-2 py-1 text-left">{t('bracket')}</th>
                        <th className="px-2 py-1 text-right">{t('taxRate')}</th>
                        <th className="px-2 py-1 text-right">{t('taxableAmount')}</th>
                        <th className="px-2 py-1 text-right">{t('taxOwed')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.brackets.map((bracket, i) => (
                        <tr key={i} className={`border-t border-gray-100 ${bracket.taxInBracket === 0 ? 'text-gray-400' : ''}`}>
                          <td className="px-2 py-1 text-xs">
                            {bracket.max ? `$${bracket.min.toLocaleString()} - $${bracket.max.toLocaleString()}` : `$${bracket.min.toLocaleString()}+`}
                          </td>
                          <td className="px-2 py-1 text-right">{(bracket.rate * 100).toFixed(0)}%</td>
                          <td className="px-2 py-1 text-right">${bracket.taxableInBracket.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="px-2 py-1 text-right font-medium ${bracket.taxInBracket > 0 ? 'text-red-600' : ''}">${bracket.taxInBracket.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-gray-300 font-bold">
                        <td className="px-2 py-1" colSpan={2}>{t('totalTax')}</td>
                        <td className="px-2 py-1 text-right"></td>
                        <td className="px-2 py-1 text-right text-red-600">${result.totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('history')}</h3>
              <div className="space-y-1">
                {history.map((entry, i) => (
                  <div key={i} className="flex justify-between text-sm text-gray-600 bg-white rounded px-3 py-1.5 border border-gray-100">
                    <span>${entry.income.toLocaleString()} ({entry.filingStatus})</span>
                    <span className="font-semibold text-red-600">${entry.totalTax.toFixed(2)} ({entry.effectiveRate.toFixed(1)}%)</span>
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