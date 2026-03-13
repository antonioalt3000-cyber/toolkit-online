'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type PayFrequency = 'weekly' | 'biweekly' | 'monthly' | 'annual';

const labels: Record<string, Record<string, string>> = {
  grossSalary: { en: 'Gross Salary', it: 'Stipendio Lordo', es: 'Salario Bruto', fr: 'Salaire Brut', de: 'Bruttogehalt', pt: 'Salário Bruto' },
  payFrequency: { en: 'Pay Frequency', it: 'Frequenza di Pagamento', es: 'Frecuencia de Pago', fr: 'Fréquence de Paiement', de: 'Zahlungsfrequenz', pt: 'Frequência de Pagamento' },
  weekly: { en: 'Weekly', it: 'Settimanale', es: 'Semanal', fr: 'Hebdomadaire', de: 'Wöchentlich', pt: 'Semanal' },
  biweekly: { en: 'Bi-Weekly', it: 'Bisettimanale', es: 'Quincenal', fr: 'Bimensuel', de: 'Zweiwöchentlich', pt: 'Quinzenal' },
  monthly: { en: 'Monthly', it: 'Mensile', es: 'Mensual', fr: 'Mensuel', de: 'Monatlich', pt: 'Mensal' },
  annual: { en: 'Annual', it: 'Annuale', es: 'Anual', fr: 'Annuel', de: 'Jährlich', pt: 'Anual' },
  calculate: { en: 'Calculate Payroll', it: 'Calcola Busta Paga', es: 'Calcular Nómina', fr: 'Calculer la Paie', de: 'Gehaltsabrechnung Berechnen', pt: 'Calcular Folha' },
  reset: { en: 'Reset', it: 'Resetta', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  copy: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier Résultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
  copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié!', de: 'Kopiert!', pt: 'Copiado!' },
  history: { en: 'History', it: 'Cronologia', es: 'Historial', fr: 'Historique', de: 'Verlauf', pt: 'Histórico' },
  clearHistory: { en: 'Clear History', it: 'Cancella Cronologia', es: 'Borrar Historial', fr: 'Effacer Historique', de: 'Verlauf Löschen', pt: 'Limpar Histórico' },
  disclaimer: {
    en: 'This calculator provides estimates only. Actual payroll varies by jurisdiction. Consult a tax professional for accurate calculations.',
    it: 'Questo calcolatore fornisce solo stime. La busta paga effettiva varia per giurisdizione. Consulta un commercialista per calcoli precisi.',
    es: 'Esta calculadora proporciona solo estimaciones. La nómina real varía por jurisdicción. Consulte a un profesional fiscal.',
    fr: 'Ce calculateur fournit uniquement des estimations. La paie réelle varie selon la juridiction. Consultez un fiscaliste.',
    de: 'Dieser Rechner liefert nur Schätzungen. Die tatsächliche Gehaltsabrechnung variiert je nach Rechtsgebiet. Konsultieren Sie einen Steuerberater.',
    pt: 'Esta calculadora fornece apenas estimativas. A folha real varia por jurisdição. Consulte um profissional fiscal.',
  },
  invalidSalary: { en: 'Salary must be greater than 0', it: 'Lo stipendio deve essere maggiore di 0', es: 'El salario debe ser mayor que 0', fr: 'Le salaire doit être supérieur à 0', de: 'Gehalt muss größer als 0 sein', pt: 'O salário deve ser maior que 0' },
  payrollBreakdown: { en: 'Payroll Breakdown', it: 'Dettaglio Busta Paga', es: 'Desglose de Nómina', fr: 'Détail de la Paie', de: 'Gehaltsaufschlüsselung', pt: 'Detalhamento da Folha' },
  grossAnnual: { en: 'Gross Annual', it: 'Lordo Annuo', es: 'Bruto Anual', fr: 'Brut Annuel', de: 'Brutto Jährlich', pt: 'Bruto Anual' },
  incomeTax: { en: 'Income Tax', it: 'Imposta sul Reddito', es: 'Impuesto sobre la Renta', fr: 'Impôt sur le Revenu', de: 'Einkommensteuer', pt: 'Imposto de Renda' },
  socialSecurity: { en: 'Social Security', it: 'Contributi Previdenziali', es: 'Seguridad Social', fr: 'Sécurité Sociale', de: 'Sozialversicherung', pt: 'Segurança Social' },
  healthInsurance: { en: 'Health Insurance', it: 'Assicurazione Sanitaria', es: 'Seguro de Salud', fr: 'Assurance Maladie', de: 'Krankenversicherung', pt: 'Seguro de Saúde' },
  totalDeductions: { en: 'Total Deductions', it: 'Detrazioni Totali', es: 'Deducciones Totales', fr: 'Déductions Totales', de: 'Gesamtabzüge', pt: 'Deduções Totais' },
  netPay: { en: 'Net Pay', it: 'Paga Netta', es: 'Sueldo Neto', fr: 'Salaire Net', de: 'Nettogehalt', pt: 'Salário Líquido' },
  perPeriod: { en: 'Per Pay Period', it: 'Per Periodo', es: 'Por Período', fr: 'Par Période', de: 'Pro Zeitraum', pt: 'Por Período' },
  annualProjection: { en: 'Annual Projection', it: 'Proiezione Annuale', es: 'Proyección Anual', fr: 'Projection Annuelle', de: 'Jahresprojektion', pt: 'Projeção Anual' },
  effectiveRate: { en: 'Effective Tax Rate', it: 'Aliquota Effettiva', es: 'Tasa Efectiva', fr: 'Taux Effectif', de: 'Effektiver Steuersatz', pt: 'Taxa Efetiva' },
  takeHome: { en: 'Take-Home Ratio', it: 'Rapporto Netto', es: 'Ratio Neto', fr: 'Ratio Net', de: 'Netto-Verhältnis', pt: 'Ratio Líquido' },
  taxBrackets: { en: 'Tax Brackets Applied', it: 'Scaglioni Fiscali Applicati', es: 'Tramos Fiscales Aplicados', fr: 'Tranches Fiscales Appliquées', de: 'Angewandte Steuerstufen', pt: 'Escalões Fiscais Aplicados' },
  bracket: { en: 'Bracket', it: 'Scaglione', es: 'Tramo', fr: 'Tranche', de: 'Stufe', pt: 'Escalão' },
  rate: { en: 'Rate', it: 'Aliquota', es: 'Tasa', fr: 'Taux', de: 'Satz', pt: 'Taxa' },
  taxable: { en: 'Taxable', it: 'Imponibile', es: 'Base Imponible', fr: 'Imposable', de: 'Steuerpflichtig', pt: 'Tributável' },
  tax: { en: 'Tax', it: 'Tassa', es: 'Impuesto', fr: 'Impôt', de: 'Steuer', pt: 'Imposto' },
  breakdownChart: { en: 'Deduction Breakdown', it: 'Ripartizione Detrazioni', es: 'Desglose de Deducciones', fr: 'Répartition des Déductions', de: 'Abzugsverteilung', pt: 'Distribuição de Deduções' },
  netPayLabel: { en: 'Net Pay', it: 'Netto', es: 'Neto', fr: 'Net', de: 'Netto', pt: 'Líquido' },
  grossPerPeriod: { en: 'Gross Per Period', it: 'Lordo Per Periodo', es: 'Bruto Por Período', fr: 'Brut Par Période', de: 'Brutto Pro Zeitraum', pt: 'Bruto Por Período' },
  netPerPeriod: { en: 'Net Per Period', it: 'Netto Per Periodo', es: 'Neto Por Período', fr: 'Net Par Période', de: 'Netto Pro Zeitraum', pt: 'Líquido Por Período' },
  netMonthly: { en: 'Net Monthly', it: 'Netto Mensile', es: 'Neto Mensual', fr: 'Net Mensuel', de: 'Netto Monatlich', pt: 'Líquido Mensal' },
  netWeekly: { en: 'Net Weekly', it: 'Netto Settimanale', es: 'Neto Semanal', fr: 'Net Hebdomadaire', de: 'Netto Wöchentlich', pt: 'Líquido Semanal' },
};

const taxBrackets = [
  { min: 0, max: 10000, rate: 0 },
  { min: 10000, max: 25000, rate: 10 },
  { min: 25000, max: 50000, rate: 20 },
  { min: 50000, max: 80000, rate: 25 },
  { min: 80000, max: 120000, rate: 30 },
  { min: 120000, max: Infinity, rate: 35 },
];

const SOCIAL_SECURITY_RATE = 0.0765;
const HEALTH_INSURANCE_RATE = 0.025;

const frequencyMultiplier: Record<PayFrequency, number> = {
  weekly: 52,
  biweekly: 26,
  monthly: 12,
  annual: 1,
};

function calculateIncomeTax(annualGross: number) {
  const details: { min: number; max: number; rate: number; taxable: number; tax: number }[] = [];
  let remaining = annualGross;
  let totalTax = 0;

  for (const b of taxBrackets) {
    if (remaining <= 0) break;
    const width = b.max === Infinity ? remaining : b.max - b.min;
    const taxableAmount = Math.min(remaining, width);
    const taxAmount = taxableAmount * (b.rate / 100);
    details.push({ ...b, taxable: taxableAmount, tax: taxAmount });
    totalTax += taxAmount;
    remaining -= taxableAmount;
  }

  return { details, totalTax };
}

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: {
    title: 'Complete Payroll Calculator: Estimate Net Pay, Taxes & Deductions',
    paragraphs: [
      'Managing payroll is one of the most critical responsibilities for any business, from solo entrepreneurs to large corporations. A payroll calculator helps you estimate the net pay an employee receives after all mandatory deductions, including income tax, social security contributions, and health insurance premiums. Understanding these deductions is essential for budgeting, whether you are an employer setting compensation packages or an employee evaluating a job offer.',
      'This free online payroll calculator uses a simplified progressive tax system to estimate income tax. In progressive taxation, your income is divided into brackets, each taxed at an increasing rate. The first portion of income may be tax-free, while higher earnings face steeper rates. This ensures that people with lower incomes keep a larger share of their earnings, promoting fairness in the tax system. Our calculator also factors in social security contributions (7.65%) and health insurance deductions (2.5%), which are standard payroll withholdings in many countries.',
      'One of the most useful features is the ability to choose your pay frequency — weekly, bi-weekly, monthly, or annual. The calculator automatically converts your gross salary to an annual figure, computes all deductions, and then breaks down the results per pay period. This gives you a clear picture of what lands in your bank account each payday. The visual pie chart breakdown makes it easy to see at a glance how much goes to taxes, social security, health insurance, and take-home pay.',
      'Beyond the per-period breakdown, the annual projection section shows your total yearly gross income, total deductions, and net annual pay. The effective tax rate displayed reveals the true percentage of your income consumed by all deductions combined — often a surprising figure for first-time users. The calculation history feature lets you compare different salary scenarios side by side, making it perfect for salary negotiations or financial planning sessions.',
      'Keep in mind that this calculator provides estimates based on a simplified model. Actual payroll calculations vary significantly by country, state, and individual circumstances. Factors like retirement contributions, union dues, garnishments, pre-tax benefits, and local taxes are not included here. For precise payroll processing, consult a certified accountant or use specialized payroll software tailored to your jurisdiction. Nevertheless, this tool offers an excellent starting point for understanding your payroll breakdown and planning your finances accordingly.',
    ],
    faq: [
      { q: 'What is the difference between gross pay and net pay?', a: 'Gross pay is the total amount earned before any deductions. Net pay (take-home pay) is what you actually receive after income tax, social security, health insurance, and other withholdings are subtracted. The difference can be substantial, often 25-40% of gross pay depending on your income level.' },
      { q: 'How does progressive taxation work in this calculator?', a: 'Progressive taxation divides income into brackets, each taxed at an increasing rate. For example, the first $10,000 is tax-free, the next $15,000 is taxed at 10%, and so on up to 35% for income above $120,000. This means your effective rate is always lower than your highest marginal bracket.' },
      { q: 'What deductions does this payroll calculator include?', a: 'This calculator estimates three main deductions: income tax (using progressive brackets), social security contributions (7.65% of gross), and health insurance (2.5% of gross). These represent the most common payroll withholdings in many countries. Actual deductions may include retirement, union dues, and local taxes.' },
      { q: 'Can I use this calculator for different pay frequencies?', a: 'Yes. You can enter your salary as weekly, bi-weekly, monthly, or annual. The calculator converts it to an annual figure for tax computation, then breaks down all results per your chosen pay period. This makes it easy to compare offers quoted in different frequencies.' },
      { q: 'How accurate is this payroll calculator?', a: 'This calculator provides estimates using a simplified tax model. It is useful for general planning and comparison purposes. For precise payroll processing, you should consult a tax professional or use jurisdiction-specific payroll software, as actual rates and rules vary by country, state, and individual circumstances.' },
    ],
  },
  it: {
    title: 'Calcolatore Busta Paga Completo: Stima Netto, Tasse e Contributi',
    paragraphs: [
      'Gestire le buste paga è una delle responsabilità più importanti per qualsiasi azienda, dai liberi professionisti alle grandi società. Un calcolatore busta paga ti aiuta a stimare la retribuzione netta che un dipendente riceve dopo tutte le detrazioni obbligatorie, incluse imposte sul reddito, contributi previdenziali e premi assicurativi sanitari. Comprendere queste detrazioni è fondamentale per la pianificazione del budget, sia che tu sia un datore di lavoro che definisce pacchetti retributivi, sia un dipendente che valuta un\'offerta di lavoro.',
      'Questo calcolatore busta paga online gratuito utilizza un sistema fiscale progressivo semplificato per stimare l\'imposta sul reddito. Nella tassazione progressiva, il reddito viene suddiviso in scaglioni, ciascuno tassato ad un\'aliquota crescente. La prima porzione di reddito può essere esente da imposte, mentre i guadagni più alti affrontano aliquote più elevate. Il nostro calcolatore tiene conto anche dei contributi previdenziali (7,65%) e delle detrazioni per l\'assicurazione sanitaria (2,5%), che sono trattenute standard in molti paesi.',
      'Una delle funzionalità più utili è la possibilità di scegliere la frequenza di pagamento: settimanale, bisettimanale, mensile o annuale. Il calcolatore converte automaticamente lo stipendio lordo in cifra annuale, calcola tutte le detrazioni e poi suddivide i risultati per periodo di paga. Questo ti dà un quadro chiaro di quanto arriva sul tuo conto corrente ad ogni stipendio. Il grafico a torta visivo rende facile vedere a colpo d\'occhio quanto va in tasse, previdenza, sanità e stipendio netto.',
      'Oltre al dettaglio per periodo, la sezione proiezione annuale mostra il tuo reddito lordo totale annuo, le detrazioni totali e la paga netta annuale. L\'aliquota effettiva visualizzata rivela la vera percentuale del tuo reddito assorbita da tutte le detrazioni combinate. La funzione cronologia dei calcoli ti permette di confrontare diversi scenari salariali, perfetta per negoziazioni salariali o sessioni di pianificazione finanziaria.',
      'Tieni presente che questo calcolatore fornisce stime basate su un modello semplificato. I calcoli effettivi delle buste paga variano significativamente per paese, regione e circostanze individuali. Fattori come contributi pensionistici, trattenute sindacali, pignoramenti e tasse locali non sono inclusi qui. Per un\'elaborazione precisa delle buste paga, consulta un commercialista certificato. Tuttavia, questo strumento offre un eccellente punto di partenza per comprendere la tua busta paga.',
    ],
    faq: [
      { q: 'Qual è la differenza tra stipendio lordo e netto?', a: 'Lo stipendio lordo è l\'importo totale guadagnato prima di qualsiasi detrazione. Lo stipendio netto è quello che effettivamente ricevi dopo la sottrazione di IRPEF, contributi previdenziali, assicurazione sanitaria e altre trattenute. La differenza può essere sostanziale, spesso il 25-40% del lordo.' },
      { q: 'Come funziona la tassazione progressiva in questo calcolatore?', a: 'La tassazione progressiva divide il reddito in scaglioni, ciascuno tassato ad un\'aliquota crescente. Ad esempio, i primi 10.000$ sono esenti, i successivi 15.000$ sono tassati al 10%, e così via fino al 35% per redditi superiori a 120.000$. L\'aliquota effettiva è sempre inferiore allo scaglione marginale più alto.' },
      { q: 'Quali detrazioni include questo calcolatore?', a: 'Questo calcolatore stima tre detrazioni principali: imposta sul reddito (scaglioni progressivi), contributi previdenziali (7,65% del lordo) e assicurazione sanitaria (2,5% del lordo). Queste rappresentano le trattenute più comuni. Le detrazioni effettive possono includere pensione, sindacato e tasse locali.' },
      { q: 'Posso usare questo calcolatore per diverse frequenze di pagamento?', a: 'Sì. Puoi inserire lo stipendio come settimanale, bisettimanale, mensile o annuale. Il calcolatore lo converte in cifra annuale per il calcolo fiscale, poi suddivide tutti i risultati per il periodo scelto.' },
      { q: 'Quanto è preciso questo calcolatore?', a: 'Questo calcolatore fornisce stime usando un modello fiscale semplificato. È utile per pianificazione generale e confronti. Per elaborazioni precise, consulta un commercialista o usa software specifico per il tuo paese, poiché aliquote e regole variano.' },
    ],
  },
  es: {
    title: 'Calculadora de Nómina Completa: Estima Sueldo Neto, Impuestos y Deducciones',
    paragraphs: [
      'Gestionar la nómina es una de las responsabilidades más críticas para cualquier empresa, desde emprendedores individuales hasta grandes corporaciones. Una calculadora de nómina te ayuda a estimar el salario neto que recibe un empleado después de todas las deducciones obligatorias, incluyendo impuestos sobre la renta, cotizaciones a la seguridad social y primas de seguros de salud. Comprender estas deducciones es esencial para la planificación presupuestaria.',
      'Esta calculadora de nómina online gratuita utiliza un sistema fiscal progresivo simplificado para estimar el impuesto sobre la renta. En la tributación progresiva, los ingresos se dividen en tramos, cada uno gravado a una tasa creciente. La primera porción puede estar exenta de impuestos, mientras que las ganancias más altas enfrentan tasas más elevadas. Nuestra calculadora también incluye cotizaciones a la seguridad social (7,65%) y deducciones de seguro de salud (2,5%), retenciones estándar en muchos países.',
      'Una de las características más útiles es la posibilidad de elegir la frecuencia de pago: semanal, quincenal, mensual o anual. La calculadora convierte automáticamente tu salario bruto a cifra anual, calcula todas las deducciones y desglosa los resultados por período de pago. El gráfico circular visual facilita ver de un vistazo cuánto va a impuestos, seguridad social, seguro de salud y salario neto.',
      'Además del desglose por período, la sección de proyección anual muestra tus ingresos brutos totales anuales, deducciones totales y salario neto anual. La tasa efectiva muestra el porcentaje real de tus ingresos consumido por todas las deducciones combinadas. El historial de cálculos te permite comparar diferentes escenarios salariales, perfecto para negociaciones o planificación financiera.',
      'Ten en cuenta que esta calculadora proporciona estimaciones basadas en un modelo simplificado. Los cálculos reales de nómina varían significativamente por país, estado y circunstancias individuales. Factores como contribuciones de jubilación, cuotas sindicales y impuestos locales no están incluidos. Para un procesamiento preciso, consulta a un contador certificado o usa software especializado.',
    ],
    faq: [
      { q: '¿Cuál es la diferencia entre salario bruto y neto?', a: 'El salario bruto es el monto total ganado antes de cualquier deducción. El salario neto es lo que realmente recibes después de restar impuestos, seguridad social, seguro de salud y otras retenciones. La diferencia suele ser del 25-40% del bruto.' },
      { q: '¿Cómo funciona la tributación progresiva en esta calculadora?', a: 'La tributación progresiva divide los ingresos en tramos, cada uno gravado a una tasa creciente. Por ejemplo, los primeros $10.000 están exentos, los siguientes $15.000 se gravan al 10%, y así hasta el 35% para ingresos superiores a $120.000.' },
      { q: '¿Qué deducciones incluye esta calculadora?', a: 'Estima tres deducciones principales: impuesto sobre la renta (tramos progresivos), seguridad social (7,65% del bruto) y seguro de salud (2,5% del bruto). Las deducciones reales pueden incluir pensiones, cuotas sindicales e impuestos locales.' },
      { q: '¿Puedo usar esta calculadora para diferentes frecuencias de pago?', a: 'Sí. Puedes ingresar tu salario como semanal, quincenal, mensual o anual. La calculadora lo convierte a cifra anual para el cálculo fiscal, luego desglosa todos los resultados por el período elegido.' },
      { q: '¿Qué tan precisa es esta calculadora?', a: 'Proporciona estimaciones con un modelo fiscal simplificado. Es útil para planificación general. Para cálculos precisos, consulta a un profesional fiscal o usa software específico para tu jurisdicción.' },
    ],
  },
  fr: {
    title: 'Calculateur de Paie Complet: Estimez le Salaire Net, Impôts et Cotisations',
    paragraphs: [
      'La gestion de la paie est l\'une des responsabilités les plus critiques pour toute entreprise, des auto-entrepreneurs aux grandes sociétés. Un calculateur de paie vous aide à estimer le salaire net qu\'un employé reçoit après toutes les déductions obligatoires, y compris l\'impôt sur le revenu, les cotisations de sécurité sociale et les primes d\'assurance maladie. Comprendre ces déductions est essentiel pour la planification budgétaire.',
      'Ce calculateur de paie en ligne gratuit utilise un système fiscal progressif simplifié pour estimer l\'impôt sur le revenu. Dans l\'imposition progressive, le revenu est divisé en tranches, chacune imposée à un taux croissant. La première portion peut être exonérée d\'impôt, tandis que les revenus plus élevés font face à des taux plus élevés. Notre calculateur intègre également les cotisations de sécurité sociale (7,65%) et les déductions d\'assurance maladie (2,5%), qui sont des retenues standard dans de nombreux pays.',
      'L\'une des fonctionnalités les plus utiles est la possibilité de choisir votre fréquence de paiement : hebdomadaire, bimensuelle, mensuelle ou annuelle. Le calculateur convertit automatiquement votre salaire brut en montant annuel, calcule toutes les déductions, puis ventile les résultats par période de paie. Le graphique visuel en camembert facilite la visualisation de la répartition entre impôts, sécurité sociale, assurance maladie et salaire net.',
      'Au-delà de la ventilation par période, la section projection annuelle affiche vos revenus bruts totaux annuels, les déductions totales et le salaire net annuel. Le taux effectif révèle le pourcentage réel de vos revenus absorbé par l\'ensemble des déductions. L\'historique des calculs vous permet de comparer différents scénarios salariaux, idéal pour les négociations salariales ou la planification financière.',
      'Gardez à l\'esprit que ce calculateur fournit des estimations basées sur un modèle simplifié. Les calculs de paie réels varient considérablement selon le pays, la région et les circonstances individuelles. Les facteurs comme les cotisations retraite, les cotisations syndicales et les impôts locaux ne sont pas inclus. Pour un traitement précis de la paie, consultez un expert-comptable certifié.',
    ],
    faq: [
      { q: 'Quelle est la différence entre salaire brut et net?', a: 'Le salaire brut est le montant total gagné avant toute déduction. Le salaire net est ce que vous recevez réellement après soustraction de l\'impôt sur le revenu, des cotisations sociales, de l\'assurance maladie et autres retenues. La différence peut être de 25-40% du brut.' },
      { q: 'Comment fonctionne l\'imposition progressive dans ce calculateur?', a: 'L\'imposition progressive divise le revenu en tranches, chacune imposée à un taux croissant. Par exemple, les premiers 10 000$ sont exonérés, les 15 000$ suivants sont imposés à 10%, et ainsi de suite jusqu\'à 35% pour les revenus supérieurs à 120 000$.' },
      { q: 'Quelles déductions ce calculateur inclut-il?', a: 'Il estime trois déductions principales : impôt sur le revenu (tranches progressives), sécurité sociale (7,65% du brut) et assurance maladie (2,5% du brut). Les déductions réelles peuvent inclure retraite, cotisations syndicales et impôts locaux.' },
      { q: 'Puis-je utiliser ce calculateur pour différentes fréquences de paiement?', a: 'Oui. Vous pouvez entrer votre salaire en hebdomadaire, bimensuel, mensuel ou annuel. Le calculateur le convertit en montant annuel pour le calcul fiscal, puis ventile tous les résultats par la période choisie.' },
      { q: 'Quelle est la précision de ce calculateur?', a: 'Ce calculateur fournit des estimations avec un modèle fiscal simplifié. Il est utile pour la planification générale. Pour des calculs précis, consultez un professionnel fiscal ou utilisez un logiciel spécifique à votre juridiction.' },
    ],
  },
  de: {
    title: 'Vollständiger Gehaltsrechner: Nettogehalt, Steuern und Abzüge Schätzen',
    paragraphs: [
      'Die Gehaltsabrechnung gehört zu den wichtigsten Aufgaben jedes Unternehmens, vom Einzelunternehmer bis zum Großkonzern. Ein Gehaltsrechner hilft Ihnen, das Nettogehalt zu schätzen, das ein Mitarbeiter nach allen Pflichtabzügen erhält, einschließlich Einkommensteuer, Sozialversicherungsbeiträgen und Krankenversicherungsprämien. Das Verständnis dieser Abzüge ist für die Budgetplanung unerlässlich.',
      'Dieser kostenlose Online-Gehaltsrechner verwendet ein vereinfachtes progressives Steuersystem zur Schätzung der Einkommensteuer. Bei der progressiven Besteuerung wird das Einkommen in Stufen unterteilt, die jeweils mit steigendem Satz besteuert werden. Der erste Einkommensteil kann steuerfrei sein, während höhere Einkommen höheren Sätzen unterliegen. Unser Rechner berücksichtigt auch Sozialversicherungsbeiträge (7,65%) und Krankenversicherungsabzüge (2,5%), die in vielen Ländern Standard-Gehaltseinbehalte sind.',
      'Eine der nützlichsten Funktionen ist die Möglichkeit, Ihre Zahlungsfrequenz zu wählen: wöchentlich, zweiwöchentlich, monatlich oder jährlich. Der Rechner rechnet Ihr Bruttogehalt automatisch in einen Jahresbetrag um, berechnet alle Abzüge und schlüsselt die Ergebnisse pro Zahlungszeitraum auf. Das visuelle Kreisdiagramm macht es einfach, auf einen Blick zu sehen, wie viel für Steuern, Sozialversicherung, Krankenversicherung und Nettogehalt anfällt.',
      'Über die Aufschlüsselung pro Periode hinaus zeigt der Abschnitt Jahresprojektion Ihr gesamtes Bruttojahreseinkommen, die Gesamtabzüge und das jährliche Nettogehalt. Der angezeigte effektive Steuersatz zeigt den tatsächlichen Prozentsatz Ihres Einkommens, der von allen Abzügen zusammen verbraucht wird. Die Berechnungshistorie ermöglicht den Vergleich verschiedener Gehaltsszenarien.',
      'Beachten Sie, dass dieser Rechner Schätzungen auf Basis eines vereinfachten Modells liefert. Tatsächliche Gehaltsberechnungen variieren erheblich nach Land, Bundesland und individuellen Umständen. Faktoren wie Rentenbeiträge, Gewerkschaftsbeiträge und lokale Steuern sind hier nicht enthalten. Für eine präzise Gehaltsabrechnung konsultieren Sie einen zertifizierten Steuerberater.',
    ],
    faq: [
      { q: 'Was ist der Unterschied zwischen Brutto- und Nettogehalt?', a: 'Das Bruttogehalt ist der Gesamtbetrag vor Abzügen. Das Nettogehalt ist das, was Sie tatsächlich erhalten, nachdem Einkommensteuer, Sozialversicherung, Krankenversicherung und andere Einbehalte abgezogen wurden. Die Differenz beträgt oft 25-40% des Bruttogehalts.' },
      { q: 'Wie funktioniert die progressive Besteuerung in diesem Rechner?', a: 'Die progressive Besteuerung teilt das Einkommen in Stufen, jede mit steigendem Satz besteuert. Beispielsweise sind die ersten 10.000$ steuerfrei, die nächsten 15.000$ werden mit 10% besteuert, und so weiter bis 35% für Einkommen über 120.000$.' },
      { q: 'Welche Abzüge enthält dieser Gehaltsrechner?', a: 'Er schätzt drei Hauptabzüge: Einkommensteuer (progressive Stufen), Sozialversicherung (7,65% des Brutto) und Krankenversicherung (2,5% des Brutto). Tatsächliche Abzüge können Rente, Gewerkschaftsbeiträge und lokale Steuern umfassen.' },
      { q: 'Kann ich diesen Rechner für verschiedene Zahlungsfrequenzen verwenden?', a: 'Ja. Sie können Ihr Gehalt als wöchentlich, zweiwöchentlich, monatlich oder jährlich eingeben. Der Rechner rechnet es für die Steuerberechnung in einen Jahresbetrag um und schlüsselt alle Ergebnisse nach dem gewählten Zeitraum auf.' },
      { q: 'Wie genau ist dieser Gehaltsrechner?', a: 'Dieser Rechner liefert Schätzungen mit einem vereinfachten Steuermodell. Er ist nützlich für allgemeine Planung. Für präzise Berechnungen konsultieren Sie einen Steuerberater oder verwenden Sie jurisdiktionsspezifische Software.' },
    ],
  },
  pt: {
    title: 'Calculadora de Folha de Pagamento Completa: Estime Salário Líquido, Impostos e Deduções',
    paragraphs: [
      'Gerir a folha de pagamento é uma das responsabilidades mais críticas para qualquer empresa, desde empreendedores individuais a grandes corporações. Uma calculadora de folha de pagamento ajuda a estimar o salário líquido que um funcionário recebe após todas as deduções obrigatórias, incluindo imposto de renda, contribuições para a segurança social e prémios de seguro de saúde. Compreender estas deduções é essencial para o planeamento orçamental.',
      'Esta calculadora de folha de pagamento online gratuita utiliza um sistema fiscal progressivo simplificado para estimar o imposto de renda. Na tributação progressiva, o rendimento é dividido em escalões, cada um tributado a uma taxa crescente. A primeira porção pode estar isenta de impostos, enquanto os rendimentos mais altos enfrentam taxas mais elevadas. A nossa calculadora também inclui contribuições para a segurança social (7,65%) e deduções de seguro de saúde (2,5%), que são retenções padrão em muitos países.',
      'Uma das funcionalidades mais úteis é a possibilidade de escolher a frequência de pagamento: semanal, quinzenal, mensal ou anual. A calculadora converte automaticamente o salário bruto em valor anual, calcula todas as deduções e decompõe os resultados por período de pagamento. O gráfico circular visual facilita ver de relance quanto vai para impostos, segurança social, seguro de saúde e salário líquido.',
      'Além da decomposição por período, a secção de projeção anual mostra o rendimento bruto total anual, deduções totais e salário líquido anual. A taxa efetiva revela a percentagem real do rendimento absorvida por todas as deduções combinadas. O histórico de cálculos permite comparar diferentes cenários salariais, perfeito para negociações ou planeamento financeiro.',
      'Tenha em mente que esta calculadora fornece estimativas baseadas num modelo simplificado. Os cálculos reais de folha de pagamento variam significativamente por país, estado e circunstâncias individuais. Fatores como contribuições para reforma, quotas sindicais e impostos locais não estão incluídos. Para um processamento preciso, consulte um contabilista certificado.',
    ],
    faq: [
      { q: 'Qual é a diferença entre salário bruto e líquido?', a: 'O salário bruto é o montante total ganho antes de quaisquer deduções. O salário líquido é o que efetivamente recebe após a subtração de imposto de renda, segurança social, seguro de saúde e outras retenções. A diferença é geralmente de 25-40% do bruto.' },
      { q: 'Como funciona a tributação progressiva nesta calculadora?', a: 'A tributação progressiva divide o rendimento em escalões, cada um tributado a uma taxa crescente. Por exemplo, os primeiros $10.000 são isentos, os seguintes $15.000 são tributados a 10%, e assim por diante até 35% para rendimentos acima de $120.000.' },
      { q: 'Que deduções esta calculadora inclui?', a: 'Estima três deduções principais: imposto de renda (escalões progressivos), segurança social (7,65% do bruto) e seguro de saúde (2,5% do bruto). As deduções reais podem incluir reforma, quotas sindicais e impostos locais.' },
      { q: 'Posso usar esta calculadora para diferentes frequências de pagamento?', a: 'Sim. Pode inserir o salário como semanal, quinzenal, mensal ou anual. A calculadora converte-o em valor anual para o cálculo fiscal, depois decompõe todos os resultados pelo período escolhido.' },
      { q: 'Quão precisa é esta calculadora?', a: 'Fornece estimativas com um modelo fiscal simplificado. É útil para planeamento geral. Para cálculos precisos, consulte um profissional fiscal ou use software específico para a sua jurisdição.' },
    ],
  },
};

type HistoryEntry = {
  gross: string;
  frequency: string;
  netPeriod: string;
  netAnnual: string;
  effectiveRate: string;
};

export default function PayrollCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['payroll-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [gross, setGross] = useState('');
  const [frequency, setFrequency] = useState<PayFrequency>('monthly');
  const [calculated, setCalculated] = useState(false);
  const [copiedState, setCopiedState] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const grossNum = parseFloat(gross) || 0;
  const salaryError = gross !== '' && grossNum <= 0;
  const annualGross = grossNum * frequencyMultiplier[frequency];

  const { details: taxDetails, totalTax: incomeTax } = calculateIncomeTax(annualGross);
  const socialSecurity = annualGross * SOCIAL_SECURITY_RATE;
  const healthInsurance = annualGross * HEALTH_INSURANCE_RATE;
  const totalDeductions = incomeTax + socialSecurity + healthInsurance;
  const netAnnual = annualGross - totalDeductions;
  const periodsPerYear = frequencyMultiplier[frequency];
  const grossPerPeriod = annualGross / periodsPerYear;
  const netPerPeriod = netAnnual / periodsPerYear;
  const netMonthly = netAnnual / 12;
  const netWeekly = netAnnual / 52;
  const effectiveRate = annualGross > 0 ? (totalDeductions / annualGross) * 100 : 0;
  const takeHomeRatio = annualGross > 0 ? (netAnnual / annualGross) * 100 : 0;

  // Pie chart percentages
  const taxPct = annualGross > 0 ? (incomeTax / annualGross) * 100 : 0;
  const ssPct = annualGross > 0 ? (socialSecurity / annualGross) * 100 : 0;
  const hiPct = annualGross > 0 ? (healthInsurance / annualGross) * 100 : 0;
  const netPct = annualGross > 0 ? (netAnnual / annualGross) * 100 : 0;

  const handleCalculate = () => {
    if (grossNum <= 0) return;
    setCalculated(true);
  };

  const handleReset = () => {
    setGross('');
    setFrequency('monthly');
    setCalculated(false);
  };

  const copyResults = () => {
    const text = [
      `${t('grossAnnual')}: $${annualGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${t('incomeTax')}: $${incomeTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${t('socialSecurity')}: $${socialSecurity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${t('healthInsurance')}: $${healthInsurance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${t('totalDeductions')}: $${totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${t('netPay')} (${t('annual')}): $${netAnnual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${t('netPerPeriod')} (${t(frequency)}): $${netPerPeriod.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${t('effectiveRate')}: ${effectiveRate.toFixed(1)}%`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  const saveToHistory = () => {
    setHistory(prev => [{
      gross: grossNum.toFixed(0),
      frequency: t(frequency),
      netPeriod: netPerPeriod.toFixed(2),
      netAnnual: netAnnual.toFixed(0),
      effectiveRate: effectiveRate.toFixed(1),
    }, ...prev].slice(0, 10));
  };

  const seo = seoContent[lang];

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <ToolPageWrapper toolSlug="payroll-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Financial Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 flex items-start gap-2">
          <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          <p className="text-sm text-amber-800">{labels.disclaimer[lang]}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Gross Salary Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('grossSalary')}</label>
            <input
              type="number"
              value={gross}
              onChange={(e) => { setGross(e.target.value); setCalculated(false); }}
              placeholder="0"
              className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${salaryError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            />
            {salaryError && <p className="text-red-500 text-sm mt-1">{t('invalidSalary')}</p>}
          </div>

          {/* Pay Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('payFrequency')}</label>
            <div className="grid grid-cols-4 gap-2">
              {(['weekly', 'biweekly', 'monthly', 'annual'] as PayFrequency[]).map((f) => (
                <button
                  key={f}
                  onClick={() => { setFrequency(f); setCalculated(false); }}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    frequency === f
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {t(f)}
                </button>
              ))}
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={grossNum <= 0}
            className="w-full py-3 rounded-lg text-white font-semibold transition-colors bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {t('calculate')}
          </button>

          {calculated && grossNum > 0 && (
            <>
              {/* Main Result Cards */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="rounded-xl p-4 text-center bg-gray-50 border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">{t('grossPerPeriod')}</p>
                  <p className="text-lg font-bold text-gray-800">${fmt(grossPerPeriod)}</p>
                </div>
                <div className="rounded-xl p-4 text-center bg-green-50 border border-green-200">
                  <p className="text-xs font-medium text-green-600 mb-1">{t('netPerPeriod')}</p>
                  <p className="text-lg font-bold text-green-700">${fmt(netPerPeriod)}</p>
                </div>
              </div>

              {/* Deduction Breakdown Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl p-3 text-center bg-red-50 border border-red-200">
                  <p className="text-xs font-medium text-red-600 mb-1">{t('incomeTax')}</p>
                  <p className="text-sm font-bold text-red-700">${fmt(incomeTax / periodsPerYear)}</p>
                </div>
                <div className="rounded-xl p-3 text-center bg-orange-50 border border-orange-200">
                  <p className="text-xs font-medium text-orange-600 mb-1">{t('socialSecurity')}</p>
                  <p className="text-sm font-bold text-orange-700">${fmt(socialSecurity / periodsPerYear)}</p>
                </div>
                <div className="rounded-xl p-3 text-center bg-purple-50 border border-purple-200">
                  <p className="text-xs font-medium text-purple-600 mb-1">{t('healthInsurance')}</p>
                  <p className="text-sm font-bold text-purple-700">${fmt(healthInsurance / periodsPerYear)}</p>
                </div>
              </div>

              {/* Visual Pie Chart Breakdown */}
              <div className="mt-4">
                <h3 className="font-semibold text-gray-900 mb-3">{t('breakdownChart')}</h3>
                <div className="flex items-center gap-4">
                  {/* CSS Pie Chart using conic-gradient */}
                  <div
                    className="w-32 h-32 rounded-full flex-shrink-0"
                    style={{
                      background: `conic-gradient(
                        #22c55e 0% ${netPct}%,
                        #ef4444 ${netPct}% ${netPct + taxPct}%,
                        #f97316 ${netPct + taxPct}% ${netPct + taxPct + ssPct}%,
                        #a855f7 ${netPct + taxPct + ssPct}% 100%
                      )`,
                    }}
                  />
                  <div className="space-y-2 text-sm flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{t('netPayLabel')}: {netPct.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                      <span className="text-gray-700">{t('incomeTax')}: {taxPct.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0" />
                      <span className="text-gray-700">{t('socialSecurity')}: {ssPct.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500 flex-shrink-0" />
                      <span className="text-gray-700">{t('healthInsurance')}: {hiPct.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Take-Home Ratio Bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{t('takeHome')}: {takeHomeRatio.toFixed(1)}%</span>
                  <span>{t('effectiveRate')}: {effectiveRate.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full flex">
                    <div className="bg-green-500 h-full transition-all duration-300" style={{ width: `${takeHomeRatio}%` }} />
                    <div className="bg-red-400 h-full transition-all duration-300" style={{ width: `${effectiveRate}%` }} />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                  <span className="text-green-600">{t('netPayLabel')}</span>
                  <span className="text-red-500">{t('totalDeductions')}</span>
                </div>
              </div>

              {/* Tax Brackets Table */}
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
                          <td className="px-2 py-1 text-right">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                              d.rate === 0 ? 'bg-gray-100 text-gray-600' :
                              d.rate <= 10 ? 'bg-green-100 text-green-700' :
                              d.rate <= 20 ? 'bg-yellow-100 text-yellow-700' :
                              d.rate <= 30 ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>{d.rate}%</span>
                          </td>
                          <td className="px-2 py-1 text-right">${fmt(d.taxable)}</td>
                          <td className="px-2 py-1 text-right text-red-600">${fmt(d.tax)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Annual Projection */}
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-3">{t('annualProjection')}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('grossAnnual')}</span>
                    <span className="font-semibold text-gray-800">${fmt(annualGross)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('incomeTax')}</span>
                    <span className="font-semibold text-red-600">-${fmt(incomeTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('socialSecurity')}</span>
                    <span className="font-semibold text-orange-600">-${fmt(socialSecurity)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('healthInsurance')}</span>
                    <span className="font-semibold text-purple-600">-${fmt(healthInsurance)}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-2 flex justify-between">
                    <span className="text-gray-600 font-medium">{t('totalDeductions')}</span>
                    <span className="font-bold text-red-600">${fmt(totalDeductions)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">{t('netPay')} ({t('annual')})</span>
                    <span className="font-bold text-green-700 text-lg">${fmt(netAnnual)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('netMonthly')}</span>
                    <span className="font-semibold text-green-600">${fmt(netMonthly)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('netWeekly')}</span>
                    <span className="font-semibold text-green-600">${fmt(netWeekly)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => { copyResults(); saveToHistory(); }} className="px-4 py-2 text-sm rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                  {copiedState ? t('copied') : t('copy')}
                </button>
                <button onClick={saveToHistory} className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  + {t('history')}
                </button>
                <button onClick={handleReset} className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  {t('reset')}
                </button>
              </div>
            </>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">{t('history')}</h3>
              <button onClick={() => setHistory([])} className="text-xs text-red-500 hover:text-red-700 transition-colors">
                {t('clearHistory')}
              </button>
            </div>
            <div className="space-y-2">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">
                    ${parseInt(h.gross).toLocaleString()} ({h.frequency})
                  </span>
                  <div className="text-right">
                    <span className="font-semibold text-green-700">${parseFloat(h.netPeriod).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <span className="text-gray-400 text-xs ml-1">({h.effectiveRate}%)</span>
                  </div>
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

        {/* FAQ */}
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
