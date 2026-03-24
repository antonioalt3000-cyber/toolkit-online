'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  age: { en: 'Your Age', it: 'La tua eta', es: 'Tu edad', fr: 'Votre age', de: 'Ihr Alter', pt: 'Sua idade' },
  annualIncome: { en: 'Annual Income ($)', it: 'Reddito annuale (€)', es: 'Ingreso anual ($)', fr: 'Revenu annuel (€)', de: 'Jahreseinkommen (€)', pt: 'Renda anual (R$)' },
  yearsOfCoverage: { en: 'Years of Coverage', it: 'Anni di copertura', es: 'Anos de cobertura', fr: 'Annees de couverture', de: 'Deckungsjahre', pt: 'Anos de cobertura' },
  dependents: { en: 'Number of Dependents', it: 'Persone a carico', es: 'Numero de dependientes', fr: 'Personnes a charge', de: 'Unterhaltsberechtigte', pt: 'Numero de dependentes' },
  debtTotal: { en: 'Total Debt ($)', it: 'Debiti totali (€)', es: 'Deuda total ($)', fr: 'Dettes totales (€)', de: 'Gesamtschulden (€)', pt: 'Divida total (R$)' },
  existingCoverage: { en: 'Existing Coverage ($)', it: 'Copertura esistente (€)', es: 'Cobertura existente ($)', fr: 'Couverture existante (€)', de: 'Bestehende Deckung (€)', pt: 'Cobertura existente (R$)' },
  recommended: { en: 'Recommended Coverage', it: 'Copertura raccomandata', es: 'Cobertura recomendada', fr: 'Couverture recommandee', de: 'Empfohlene Deckung', pt: 'Cobertura recomendada' },
  monthlyPremium: { en: 'Est. Monthly Premium', it: 'Premio mensile stimato', es: 'Prima mensual est.', fr: 'Prime mensuelle est.', de: 'Geschaetzte Monatspraemie', pt: 'Premio mensal est.' },
  incomeReplace: { en: 'Income Replacement', it: 'Sostituzione reddito', es: 'Reemplazo de ingresos', fr: 'Remplacement revenu', de: 'Einkommensersatz', pt: 'Substituicao de renda' },
  totalDebt: { en: 'Total Debt Coverage', it: 'Copertura debiti', es: 'Cobertura de deuda', fr: 'Couverture dettes', de: 'Schuldendeckung', pt: 'Cobertura de divida' },
  reset: { en: 'Reset', it: 'Reimposta', es: 'Reiniciar', fr: 'Reinitialiser', de: 'Zuruecksetzen', pt: 'Redefinir' },
  copy: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier Resultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
  copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copie!', de: 'Kopiert!', pt: 'Copiado!' },
};

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: { title: 'Life Insurance Calculator: How Much Coverage Do You Need?', paragraphs: [
    'A life insurance calculator helps you determine how much coverage you need to protect your family financially in case of an unexpected event. The right amount of life insurance ensures that your dependents can maintain their lifestyle, pay off debts, and cover future expenses like education without financial hardship.',
    'This calculator uses the income replacement method, which is one of the most widely recommended approaches by financial advisors. It considers your annual income multiplied by the years of coverage you need, adds outstanding debts, factors in costs per dependent (typically $50,000 each for education and care), and subtracts any existing coverage you already have.',
    'The estimated monthly premium is calculated based on age-adjusted factors. Younger applicants typically pay significantly less than older ones because the risk is lower. A 30-year-old might pay $20-30/month for a $500,000 policy, while a 50-year-old could pay $80-150/month for the same coverage. Term life insurance is generally the most affordable option for most families.',
    'For related financial planning, check our <a href="/${lang}/tools/retirement-calculator">retirement calculator</a> to plan for the long term, or use the <a href="/${lang}/tools/debt-payoff-calculator">debt payoff calculator</a> to create a strategy for reducing your liabilities. Our <a href="/${lang}/tools/emergency-fund-calculator">emergency fund calculator</a> can also help ensure you have adequate short-term protection.'
  ], faq: [
    { q: 'How much life insurance do I need?', a: 'A common rule of thumb is 10-12 times your annual income, but the exact amount depends on your debts, number of dependents, existing coverage, and financial goals. This calculator helps you determine a more personalized recommendation based on your specific situation.' },
    { q: 'What is the difference between term and whole life insurance?', a: 'Term life insurance provides coverage for a specific period (10, 20, or 30 years) and is significantly cheaper. Whole life insurance provides lifetime coverage with a cash value component but costs 5-15 times more. Most financial advisors recommend term life for the majority of families.' },
    { q: 'When should I buy life insurance?', a: 'The best time is when you have financial dependents — a spouse, children, or anyone who relies on your income. Buying younger locks in lower premiums. Major life events like marriage, buying a home, or having children are common triggers to purchase or increase coverage.' },
    { q: 'How accurate is this premium estimate?', a: 'This provides a rough estimate based on age and coverage amount. Actual premiums depend on health status, smoking history, occupation, hobbies, and the specific insurance company. Get quotes from multiple insurers for accurate pricing.' },
  ] },
  it: { title: 'Calcolatore Assicurazione Vita: Quanta Copertura Ti Serve?', paragraphs: [
    'Un calcolatore di assicurazione sulla vita ti aiuta a determinare quanta copertura hai bisogno per proteggere finanziariamente la tua famiglia in caso di evento imprevisto. La giusta quantita di assicurazione vita garantisce che i tuoi cari possano mantenere il loro stile di vita, saldare i debiti e coprire spese future come l\'istruzione.',
    'Questo calcolatore utilizza il metodo di sostituzione del reddito, uno degli approcci piu raccomandati dai consulenti finanziari. Considera il tuo reddito annuale moltiplicato per gli anni di copertura necessari, aggiunge i debiti in sospeso, tiene conto dei costi per persona a carico e sottrae eventuali coperture gia esistenti.',
    'Il premio mensile stimato viene calcolato in base a fattori corretti per eta. I richiedenti piu giovani pagano significativamente meno perche il rischio e inferiore. L\'assicurazione vita temporanea e generalmente l\'opzione piu conveniente per la maggior parte delle famiglie.',
    'Per la pianificazione finanziaria correlata, consulta il nostro <a href="/${lang}/tools/retirement-calculator">calcolatore pensione</a> o il <a href="/${lang}/tools/debt-payoff-calculator">calcolatore estinzione debiti</a>. Il nostro <a href="/${lang}/tools/emergency-fund-calculator">calcolatore fondo emergenza</a> puo anche aiutarti a garantire una protezione a breve termine.'
  ], faq: [
    { q: 'Quanta assicurazione sulla vita mi serve?', a: 'Una regola comune e 10-12 volte il reddito annuale, ma l\'importo esatto dipende dai debiti, numero di persone a carico, copertura esistente e obiettivi finanziari. Questo calcolatore fornisce una raccomandazione personalizzata.' },
    { q: 'Qual e la differenza tra assicurazione vita temporanea e permanente?', a: 'L\'assicurazione temporanea copre un periodo specifico (10, 20, 30 anni) ed e significativamente piu economica. L\'assicurazione permanente offre copertura a vita con componente di risparmio ma costa 5-15 volte di piu.' },
    { q: 'Quando dovrei comprare un\'assicurazione sulla vita?', a: 'Il momento migliore e quando hai persone a carico finanziariamente. Comprare da giovani garantisce premi piu bassi. Matrimonio, acquisto casa e nascita di figli sono momenti comuni per acquistare o aumentare la copertura.' },
    { q: 'Quanto e precisa la stima del premio?', a: 'Questa fornisce una stima approssimativa basata su eta e importo di copertura. I premi effettivi dipendono da stato di salute, fumo, professione e compagnia assicurativa specifica.' },
  ] },
  es: { title: 'Calculadora de Seguro de Vida: Cuanta Cobertura Necesitas?', paragraphs: [
    'Una calculadora de seguro de vida te ayuda a determinar cuanta cobertura necesitas para proteger financieramente a tu familia. La cantidad correcta de seguro de vida garantiza que tus dependientes puedan mantener su estilo de vida, pagar deudas y cubrir gastos futuros como educacion.',
    'Esta calculadora utiliza el metodo de reemplazo de ingresos, uno de los enfoques mas recomendados por asesores financieros. Considera tu ingreso anual multiplicado por los anos de cobertura necesarios, suma deudas pendientes, incluye costos por dependiente y resta la cobertura existente.',
    'La prima mensual estimada se calcula con factores ajustados por edad. Los solicitantes mas jovenes pagan significativamente menos porque el riesgo es menor. El seguro de vida temporal es generalmente la opcion mas asequible para la mayoria de las familias.',
    'Para planificacion financiera relacionada, consulta nuestra <a href="/${lang}/tools/retirement-calculator">calculadora de jubilacion</a> o la <a href="/${lang}/tools/debt-payoff-calculator">calculadora de pago de deudas</a>. Nuestra <a href="/${lang}/tools/emergency-fund-calculator">calculadora de fondo de emergencia</a> tambien puede ayudarte.'
  ], faq: [
    { q: 'Cuanto seguro de vida necesito?', a: 'Una regla comun es 10-12 veces tu ingreso anual, pero la cantidad exacta depende de tus deudas, dependientes, cobertura existente y metas financieras.' },
    { q: 'Cual es la diferencia entre seguro temporal y permanente?', a: 'El seguro temporal cubre un periodo especifico y es mas economico. El seguro permanente ofrece cobertura de por vida con valor en efectivo pero cuesta 5-15 veces mas.' },
    { q: 'Cuando debo comprar seguro de vida?', a: 'El mejor momento es cuando tienes dependientes financieros. Comprar joven asegura primas mas bajas.' },
    { q: 'Que tan precisa es esta estimacion de prima?', a: 'Es una estimacion aproximada basada en edad y cobertura. Las primas reales dependen de salud, tabaquismo, ocupacion y aseguradora.' },
  ] },
  fr: { title: 'Calculateur Assurance Vie: Combien de Couverture Avez-Vous Besoin?', paragraphs: [
    'Un calculateur d\'assurance vie vous aide a determiner le montant de couverture necessaire pour proteger financierement votre famille. Le bon montant d\'assurance vie garantit que vos proches peuvent maintenir leur niveau de vie, rembourser les dettes et couvrir les depenses futures comme l\'education.',
    'Ce calculateur utilise la methode de remplacement du revenu, l\'une des approches les plus recommandees par les conseillers financiers. Il considere votre revenu annuel multiplie par les annees de couverture necessaires, ajoute les dettes en cours et soustrait la couverture existante.',
    'La prime mensuelle estimee est calculee en fonction de facteurs ajustes selon l\'age. Les demandeurs plus jeunes paient nettement moins car le risque est inferieur. L\'assurance vie temporaire est generalement l\'option la plus abordable.',
    'Pour la planification financiere connexe, consultez notre <a href="/${lang}/tools/retirement-calculator">calculateur retraite</a> ou le <a href="/${lang}/tools/debt-payoff-calculator">calculateur remboursement dettes</a>.'
  ], faq: [
    { q: 'Combien d\'assurance vie ai-je besoin?', a: 'Une regle courante est 10-12 fois votre revenu annuel, mais le montant exact depend de vos dettes, personnes a charge et objectifs financiers.' },
    { q: 'Quelle est la difference entre assurance temporaire et permanente?', a: 'L\'assurance temporaire couvre une periode specifique et est moins chere. L\'assurance permanente offre une couverture a vie mais coute 5-15 fois plus.' },
    { q: 'Quand dois-je souscrire une assurance vie?', a: 'Le meilleur moment est lorsque vous avez des personnes a charge financierement. Souscrire jeune garantit des primes plus basses.' },
    { q: 'Quelle est la precision de cette estimation de prime?', a: 'C\'est une estimation approximative basee sur l\'age et le montant de couverture. Les primes reelles dependent de l\'etat de sante et de l\'assureur.' },
  ] },
  de: { title: 'Lebensversicherungsrechner: Wie Viel Deckung Brauchen Sie?', paragraphs: [
    'Ein Lebensversicherungsrechner hilft Ihnen zu bestimmen, wie viel Deckung Sie benoetigen, um Ihre Familie finanziell zu schuetzen. Die richtige Hoehe der Lebensversicherung stellt sicher, dass Ihre Angehoerigen ihren Lebensstandard aufrechterhalten und Schulden tilgen koennen.',
    'Dieser Rechner verwendet die Einkommensersatzmethode, einen der am haeufigsten empfohlenen Ansaetze von Finanzberatern. Er beruecksichtigt Ihr Jahreseinkommen, die benoetigten Deckungsjahre, ausstehende Schulden und bestehende Deckung.',
    'Die geschaetzte Monatspraemie wird auf Basis altersabhaengiger Faktoren berechnet. Juengere Antragsteller zahlen deutlich weniger. Die Risikolebensversicherung ist in der Regel die guenstigste Option.',
    'Fuer die Finanzplanung nutzen Sie unseren <a href="/${lang}/tools/retirement-calculator">Rentenrechner</a> oder den <a href="/${lang}/tools/debt-payoff-calculator">Schuldenabbau-Rechner</a>.'
  ], faq: [
    { q: 'Wie viel Lebensversicherung brauche ich?', a: 'Eine Faustregel ist das 10-12-fache Ihres Jahreseinkommens, aber der genaue Betrag haengt von Schulden, Angehoerigen und finanziellen Zielen ab.' },
    { q: 'Was ist der Unterschied zwischen Risiko- und Kapitallebensversicherung?', a: 'Die Risikolebensversicherung deckt einen bestimmten Zeitraum ab und ist guenstiger. Die Kapitallebensversicherung bietet lebenslangen Schutz, kostet aber 5-15 Mal mehr.' },
    { q: 'Wann sollte ich eine Lebensversicherung abschliessen?', a: 'Der beste Zeitpunkt ist, wenn Sie finanzielle Angehoerige haben. Ein frueherer Abschluss sichert niedrigere Praemien.' },
    { q: 'Wie genau ist diese Praemienschaetzung?', a: 'Dies ist eine grobe Schaetzung basierend auf Alter und Deckungssumme. Die tatsaechlichen Praemien haengen vom Gesundheitszustand und Versicherer ab.' },
  ] },
  pt: { title: 'Calculadora de Seguro de Vida: Quanta Cobertura Voce Precisa?', paragraphs: [
    'Uma calculadora de seguro de vida ajuda a determinar quanta cobertura voce precisa para proteger financeiramente sua familia. A quantia correta de seguro de vida garante que seus dependentes possam manter seu estilo de vida e pagar dividas.',
    'Esta calculadora usa o metodo de substituicao de renda, uma das abordagens mais recomendadas por consultores financeiros. Considera sua renda anual, anos de cobertura necessarios, dividas pendentes e cobertura existente.',
    'O premio mensal estimado e calculado com fatores ajustados por idade. Candidatos mais jovens pagam significativamente menos. O seguro de vida temporario e geralmente a opcao mais acessivel.',
    'Para planejamento financeiro relacionado, consulte nossa <a href="/${lang}/tools/retirement-calculator">calculadora de aposentadoria</a> ou a <a href="/${lang}/tools/debt-payoff-calculator">calculadora de quitacao de dividas</a>.'
  ], faq: [
    { q: 'Quanto seguro de vida eu preciso?', a: 'Uma regra comum e 10-12 vezes sua renda anual, mas o valor exato depende de dividas, dependentes e objetivos financeiros.' },
    { q: 'Qual a diferenca entre seguro temporario e permanente?', a: 'O seguro temporario cobre um periodo especifico e e mais barato. O seguro permanente oferece cobertura vitalicia mas custa 5-15 vezes mais.' },
    { q: 'Quando devo comprar seguro de vida?', a: 'O melhor momento e quando voce tem dependentes financeiros. Comprar jovem garante premios mais baixos.' },
    { q: 'Quao precisa e esta estimativa de premio?', a: 'E uma estimativa aproximada baseada em idade e valor de cobertura. Os premios reais dependem de saude e seguradora.' },
  ] },
};

export default function LifeInsuranceCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['life-insurance-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [age, setAge] = useState('35');
  const [annualIncome, setAnnualIncome] = useState('60000');
  const [yearsOfCoverage, setYearsOfCoverage] = useState('20');
  const [dependents, setDependents] = useState('2');
  const [debtTotal, setDebtTotal] = useState('50000');
  const [existingCoverage, setExistingCoverage] = useState('0');
  const [copied, setCopied] = useState(false);

  const ageVal = parseInt(age) || 0;
  const income = parseFloat(annualIncome) || 0;
  const years = parseInt(yearsOfCoverage) || 20;
  const deps = parseInt(dependents) || 0;
  const debt = parseFloat(debtTotal) || 0;
  const existing = parseFloat(existingCoverage) || 0;

  const incomeReplacement = income * years;
  const childExpense = deps * 50000;
  const recommended = Math.max(0, incomeReplacement + debt + childExpense - existing);
  const ageFactor = 1 + (ageVal - 30) * 0.03;
  const monthlyPremium = Math.max(15, (recommended / 1000) * 0.5 * Math.max(0.5, ageFactor));

  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;

  const resetAll = () => {
    setAge('35'); setAnnualIncome('60000'); setYearsOfCoverage('20');
    setDependents('2'); setDebtTotal('50000'); setExistingCoverage('0');
    setCopied(false);
  };

  const copyResults = () => {
    const text = `${t('recommended')}: ${fmt(recommended)} | ${t('monthlyPremium')}: ${fmt(monthlyPremium)}`;
    navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="life-insurance-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {[
            { key: 'age', val: age, set: setAge, min: 18, max: 80 },
            { key: 'annualIncome', val: annualIncome, set: setAnnualIncome },
            { key: 'yearsOfCoverage', val: yearsOfCoverage, set: setYearsOfCoverage, min: 5, max: 40 },
            { key: 'dependents', val: dependents, set: setDependents, min: 0, max: 10 },
            { key: 'debtTotal', val: debtTotal, set: setDebtTotal },
            { key: 'existingCoverage', val: existingCoverage, set: setExistingCoverage },
          ].map(({ key, val, set, min, max }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t(key)}</label>
              <input type="number" value={val} onChange={(e) => set(e.target.value)} min={min} max={max}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          ))}

          <div className="flex gap-2">
            {recommended > 0 && (
              <button onClick={copyResults} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                {copied ? t('copied') : t('copy')}
              </button>
            )}
            <button onClick={resetAll} className="px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium text-red-600 transition-colors ml-auto">
              {t('reset')}
            </button>
          </div>

          {income > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <div className="text-xs text-blue-600 font-medium">{t('recommended')}</div>
                <div className="text-2xl font-bold text-blue-700">{fmt(recommended)}</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <div className="text-xs text-green-600 font-medium">{t('monthlyPremium')}</div>
                <div className="text-2xl font-bold text-green-700">{fmt(monthlyPremium)}</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 font-medium">{t('incomeReplace')}</div>
                <div className="text-lg font-bold text-gray-900">{fmt(incomeReplacement)}</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 font-medium">{t('totalDebt')}</div>
                <div className="text-lg font-bold text-gray-900">{fmt(debt)}</div>
              </div>
            </div>
          )}
        </div>

        {/* SEO Article */}
        <article className="mt-10 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: p.replace(/\$\{lang\}/g, lang) }} />
          ))}
        </article>

        {/* FAQ */}
        <div className="mt-8 space-y-3">
          <h2 className="text-xl font-bold text-gray-900">FAQ</h2>
          {seo.faq.map((item, i) => (
            <div key={i} className="border border-gray-200 rounded-lg">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left px-4 py-3 font-medium text-gray-900 flex justify-between items-center">
                {item.q}
                <span className="text-gray-400">{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && <div className="px-4 pb-3 text-gray-600 text-sm">{item.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </ToolPageWrapper>
  );
}
