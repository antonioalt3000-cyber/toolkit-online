'use client';
import InsuranceCalculatorPage from '@/components/InsuranceCalculatorPage';
import type { Locale } from '@/lib/translations';

const fields = [
  { key: 'homeValue', labels: { en: 'Home Value ($)', it: 'Valore casa (€)', es: 'Valor vivienda ($)', fr: 'Valeur bien (€)', de: 'Hauswert (€)', pt: 'Valor imovel (R$)' }, defaultValue: '350000' },
  { key: 'roofAge', labels: { en: 'Roof Age (years)', it: 'Eta tetto (anni)', es: 'Antiguedad techo (anos)', fr: 'Age toit (annees)', de: 'Dachalter (Jahre)', pt: 'Idade telhado (anos)' }, defaultValue: '10', min: 0, max: 50 },
  { key: 'deductible', labels: { en: 'Deductible ($)', it: 'Franchigia (€)', es: 'Deducible ($)', fr: 'Franchise (€)', de: 'Selbstbeteiligung (€)', pt: 'Franquia (R$)' }, defaultValue: '1000' },
];

const results = [
  { key: 'annualPremium', labels: { en: 'Annual Premium', it: 'Premio annuale', es: 'Prima anual', fr: 'Prime annuelle', de: 'Jahrespraemie', pt: 'Premio anual' }, color: 'blue' as const, format: 'currency' as const },
  { key: 'monthlyPremium', labels: { en: 'Monthly Premium', it: 'Premio mensile', es: 'Prima mensual', fr: 'Prime mensuelle', de: 'Monatspraemie', pt: 'Premio mensal' }, color: 'green' as const, format: 'currency' as const },
  { key: 'dwellingCoverage', labels: { en: 'Dwelling Coverage', it: 'Copertura abitazione', es: 'Cobertura vivienda', fr: 'Couverture habitation', de: 'Gebaeudedeckung', pt: 'Cobertura moradia' }, color: 'gray' as const, format: 'currency' as const },
  { key: 'personalProperty', labels: { en: 'Personal Property', it: 'Beni personali', es: 'Bienes personales', fr: 'Biens personnels', de: 'Persoenliches Eigentum', pt: 'Bens pessoais' }, color: 'gray' as const, format: 'currency' as const },
];

function calculate(v: Record<string, number>): Record<string, number> {
  const homeValue = v.homeValue || 350000;
  const roofFactor = 1 + (v.roofAge || 10) * 0.01;
  const deductibleDiscount = ((v.deductible || 1000) - 500) * 0.08;
  const annual = Math.max(500, homeValue * 0.005 * roofFactor - deductibleDiscount);
  return {
    annualPremium: Math.round(annual),
    monthlyPremium: Math.round(annual / 12),
    dwellingCoverage: Math.round(homeValue),
    personalProperty: Math.round(homeValue * 0.5),
  };
}

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: { title: 'Home Insurance Calculator: Estimate Your Homeowners Premium', paragraphs: [
    'A home insurance calculator helps you estimate your annual homeowners insurance premium based on your property value, roof condition, and deductible preferences. Home insurance protects your most valuable asset against fire, storms, theft, and liability claims.',
    'This calculator uses industry-standard factors to estimate your premium. The base rate is typically 0.5% of your home value, adjusted for roof age (older roofs increase risk and cost) and your chosen deductible. Higher deductibles lower your premium but increase your out-of-pocket costs when filing a claim.',
    'Standard homeowners insurance (HO-3) typically covers dwelling damage, personal property (usually 50% of dwelling coverage), liability protection ($100,000-$300,000), and additional living expenses if your home becomes uninhabitable. Flood and earthquake coverage require separate policies.',
    'For related financial planning, see our <a href="/${lang}/tools/mortgage-calculator">mortgage calculator</a> to estimate home payments, or the <a href="/${lang}/tools/home-energy-audit-calculator">home energy audit calculator</a> to find ways to reduce your utility costs.'
  ], faq: [
    { q: 'How much homeowners insurance do I need?', a: 'You should insure your home for its full replacement cost (rebuilding cost, not market value). Personal property coverage is typically 50-70% of dwelling coverage. Liability coverage of at least $300,000 is recommended.' },
    { q: 'What affects home insurance premiums?', a: 'Key factors include home value, location, roof age and type, construction materials, proximity to fire stations, claims history, deductible amount, and credit score in most states.' },
    { q: 'Does home insurance cover floods and earthquakes?', a: 'No, standard homeowners policies exclude flood and earthquake damage. You need separate flood insurance (through NFIP or private insurers) and earthquake policies if you are in a risk area.' },
    { q: 'How can I lower my home insurance premium?', a: 'Increase your deductible, install security systems and smoke detectors, bundle with auto insurance, maintain a claims-free record, and update your roof and electrical systems.' },
  ] },
  it: { title: 'Calcolatore Assicurazione Casa: Stima il Tuo Premio', paragraphs: [
    'Un calcolatore di assicurazione casa ti aiuta a stimare il premio annuale in base al valore della proprieta, condizione del tetto e franchigia. L\'assicurazione casa protegge il tuo bene piu prezioso contro incendi, tempeste, furti e richieste di responsabilita.',
    'Questo calcolatore usa fattori standard del settore. Il tasso base e tipicamente lo 0,5% del valore della casa, aggiustato per eta del tetto e franchigia scelta.',
    'L\'assicurazione standard copre danni all\'abitazione, beni personali (solitamente 50% della copertura abitazione), protezione responsabilita civile e spese di alloggio temporaneo.',
    'Per la pianificazione finanziaria, consulta il nostro <a href="/${lang}/tools/mortgage-calculator">calcolatore mutuo</a> o il <a href="/${lang}/tools/home-energy-audit-calculator">calcolatore audit energetico</a>.'
  ], faq: [
    { q: 'Quanta assicurazione casa mi serve?', a: 'Dovresti assicurare la casa per il suo costo di ricostruzione completo. La copertura beni personali e tipicamente il 50-70% della copertura abitazione.' },
    { q: 'Cosa influenza i premi dell\'assicurazione casa?', a: 'I fattori chiave includono valore della casa, posizione, eta e tipo di tetto, materiali di costruzione, storico sinistri e franchigia.' },
    { q: 'L\'assicurazione casa copre alluvioni e terremoti?', a: 'No, le polizze standard escludono danni da alluvione e terremoto. Servono polizze separate per questi rischi.' },
    { q: 'Come posso abbassare il premio dell\'assicurazione casa?', a: 'Aumenta la franchigia, installa sistemi di sicurezza, combina con l\'assicurazione auto e mantieni un record senza sinistri.' },
  ] },
  es: { title: 'Calculadora de Seguro de Hogar: Estima Tu Prima', paragraphs: ['Una calculadora de seguro de hogar te ayuda a estimar tu prima anual basada en el valor de la propiedad, condicion del techo y deducible. El seguro de hogar protege tu activo mas valioso contra incendios, tormentas, robos y demandas de responsabilidad.', 'Esta calculadora usa factores estandar de la industria. La tasa base es tipicamente 0.5% del valor de la casa, ajustada por antiguedad del techo y deducible elegido.', 'El seguro estandar cubre danos a la vivienda, bienes personales, proteccion de responsabilidad y gastos de alojamiento temporal.', 'Consulta nuestra <a href="/${lang}/tools/mortgage-calculator">calculadora de hipoteca</a> para estimar pagos.'], faq: [
    { q: 'Cuanto seguro de hogar necesito?', a: 'Debes asegurar tu casa por su costo de reconstruccion completo.' },
    { q: 'Que afecta las primas de seguro de hogar?', a: 'Valor de la casa, ubicacion, antiguedad del techo, historial de reclamaciones y deducible.' },
    { q: 'El seguro de hogar cubre inundaciones?', a: 'No, las polizas estandar excluyen inundaciones y terremotos. Se necesitan polizas separadas.' },
    { q: 'Como puedo bajar mi prima de seguro de hogar?', a: 'Aumenta el deducible, instala sistemas de seguridad y combina con seguro de auto.' },
  ] },
  fr: { title: 'Calculateur Assurance Habitation: Estimez Votre Prime', paragraphs: ['Un calculateur d\'assurance habitation vous aide a estimer votre prime annuelle basee sur la valeur du bien, l\'etat du toit et la franchise.', 'Ce calculateur utilise des facteurs standards. Le taux de base est typiquement 0,5% de la valeur du bien, ajuste pour l\'age du toit et la franchise choisie.', 'L\'assurance standard couvre les dommages au batiment, les biens personnels, la responsabilite civile et les frais de relogement.', 'Consultez notre <a href="/${lang}/tools/mortgage-calculator">calculateur hypothecaire</a> pour estimer vos paiements.'], faq: [
    { q: 'Combien d\'assurance habitation ai-je besoin?', a: 'Vous devriez assurer votre maison pour son cout de reconstruction complet.' },
    { q: 'Qu\'affecte les primes d\'assurance habitation?', a: 'Valeur du bien, emplacement, age du toit, historique de sinistres et franchise.' },
    { q: 'L\'assurance habitation couvre les inondations?', a: 'Non, les polices standard excluent inondations et tremblements de terre.' },
    { q: 'Comment reduire ma prime d\'assurance habitation?', a: 'Augmentez la franchise, installez des systemes de securite et combinez avec l\'assurance auto.' },
  ] },
  de: { title: 'Wohngebaeudeversicherungsrechner: Schaetzen Sie Ihre Praemie', paragraphs: ['Ein Wohngebaeudeversicherungsrechner hilft Ihnen, Ihre jaehrliche Praemie basierend auf Immobilienwert, Dachzustand und Selbstbeteiligung zu schaetzen.', 'Dieser Rechner verwendet Branchenstandard-Faktoren. Der Basissatz betraegt typisch 0,5% des Hauswerts.', 'Die Standardversicherung deckt Gebaeueschaeden, persoenliches Eigentum, Haftpflicht und Umsiedlungskosten ab.', 'Nutzen Sie unseren <a href="/${lang}/tools/mortgage-calculator">Hypothekenrechner</a> fuer Zahlungsschaetzungen.'], faq: [
    { q: 'Wie viel Wohngebaeudeversicherung brauche ich?', a: 'Versichern Sie Ihr Haus fuer die vollen Wiederherstellungskosten.' },
    { q: 'Was beeinflusst die Wohngebaeudeversicherungspraemien?', a: 'Hauswert, Standort, Dachalter, Schadenshistorie und Selbstbeteiligung.' },
    { q: 'Deckt die Wohngebaeudeversicherung Ueberschwemmungen ab?', a: 'Nein, Standardpolicen schliessen Ueberschwemmungen und Erdbeben aus.' },
    { q: 'Wie kann ich meine Praemie senken?', a: 'Erhoehen Sie die Selbstbeteiligung, installieren Sie Sicherheitssysteme und buendeln Sie Versicherungen.' },
  ] },
  pt: { title: 'Calculadora de Seguro Residencial: Estime Seu Premio', paragraphs: ['Uma calculadora de seguro residencial ajuda a estimar seu premio anual baseado no valor do imovel, condicao do telhado e franquia.', 'Esta calculadora usa fatores padrao da industria. A taxa base e tipicamente 0,5% do valor do imovel.', 'O seguro padrao cobre danos ao imovel, bens pessoais, responsabilidade civil e despesas de moradia temporaria.', 'Consulte nossa <a href="/${lang}/tools/mortgage-calculator">calculadora de hipoteca</a> para estimar pagamentos.'], faq: [
    { q: 'Quanto seguro residencial eu preciso?', a: 'Voce deve segurar sua casa pelo custo total de reconstrucao.' },
    { q: 'O que afeta os premios de seguro residencial?', a: 'Valor do imovel, localizacao, idade do telhado, historico de sinistros e franquia.' },
    { q: 'O seguro residencial cobre enchentes?', a: 'Nao, as apolices padrao excluem enchentes e terremotos.' },
    { q: 'Como posso diminuir meu premio de seguro residencial?', a: 'Aumente a franquia, instale sistemas de seguranca e combine com seguro auto.' },
  ] },
};

export default function HomeInsuranceCalculator() {
  return <InsuranceCalculatorPage toolSlug="home-insurance-calculator" fields={fields} results={results} calculate={calculate} seoContent={seoContent} />;
}
