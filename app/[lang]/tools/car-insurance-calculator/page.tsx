'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  vehicleValue: { en: 'Vehicle Value ($)', it: 'Valore veicolo (€)', es: 'Valor del vehiculo ($)', fr: 'Valeur vehicule (€)', de: 'Fahrzeugwert (€)', pt: 'Valor do veiculo (R$)' },
  vehicleAge: { en: 'Vehicle Age (years)', it: 'Eta veicolo (anni)', es: 'Antiguedad vehiculo (anos)', fr: 'Age vehicule (annees)', de: 'Fahrzeugalter (Jahre)', pt: 'Idade veiculo (anos)' },
  driverAge: { en: 'Driver Age', it: 'Eta conducente', es: 'Edad conductor', fr: 'Age conducteur', de: 'Alter Fahrer', pt: 'Idade motorista' },
  annualMileage: { en: 'Annual Mileage', it: 'Km annuali', es: 'Km anuales', fr: 'Km annuels', de: 'Jaehrliche Km', pt: 'Km anuais' },
  deductible: { en: 'Deductible ($)', it: 'Franchigia (€)', es: 'Deducible ($)', fr: 'Franchise (€)', de: 'Selbstbeteiligung (€)', pt: 'Franquia (R$)' },
  annualPremium: { en: 'Est. Annual Premium', it: 'Premio annuale stimato', es: 'Prima anual est.', fr: 'Prime annuelle est.', de: 'Geschaetzte Jahrespraemie', pt: 'Premio anual est.' },
  monthlyPremium: { en: 'Est. Monthly Premium', it: 'Premio mensile stimato', es: 'Prima mensual est.', fr: 'Prime mensuelle est.', de: 'Monatspraemie', pt: 'Premio mensal est.' },
  coverageAmount: { en: 'Coverage Amount', it: 'Importo copertura', es: 'Monto cobertura', fr: 'Montant couverture', de: 'Deckungssumme', pt: 'Valor cobertura' },
  deductibleSavings: { en: 'Higher Deductible Savings', it: 'Risparmio franchigia alta', es: 'Ahorro deducible alto', fr: 'Economies franchise elevee', de: 'Ersparnis hoehere SB', pt: 'Economia franquia alta' },
  reset: { en: 'Reset', it: 'Reimposta', es: 'Reiniciar', fr: 'Reinitialiser', de: 'Zuruecksetzen', pt: 'Redefinir' },
  copy: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier Resultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
  copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copie!', de: 'Kopiert!', pt: 'Copiado!' },
};

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: { title: 'Car Insurance Calculator: Estimate Your Auto Insurance Premium', paragraphs: [
    'A car insurance calculator helps you estimate your annual and monthly auto insurance premiums before contacting insurance companies. Understanding the factors that affect your premium helps you make informed decisions about coverage levels, deductibles, and potential savings.',
    'This calculator considers key factors that insurers use: vehicle value and age, driver age (younger and older drivers pay more), annual mileage, and deductible amount. The base premium is typically 3-5% of your vehicle value, adjusted by risk factors. Drivers under 25 may pay 60% more, while those over 65 pay about 30% more than average.',
    'Your deductible choice significantly impacts your premium. Increasing your deductible from $500 to $1,000 can reduce your premium by 15-25%. However, you need to balance savings against the amount you would pay out of pocket in case of a claim. Keep your deductible at an amount you can comfortably afford.',
    'For related calculations, try our <a href="/${lang}/tools/auto-loan-calculator">auto loan calculator</a> to estimate monthly car payments, or our <a href="/${lang}/tools/fuel-cost-calculator">fuel cost calculator</a> to plan your driving expenses. Our <a href="/${lang}/tools/insurance-deductible-calculator">insurance deductible calculator</a> can help you find the optimal deductible level.'
  ], faq: [
    { q: 'What factors affect car insurance premiums the most?', a: 'The biggest factors are: driver age and experience, vehicle value, driving record, location, annual mileage, coverage type, and deductible amount. A clean driving record can save you 20-40% compared to having accidents or violations.' },
    { q: 'How can I lower my car insurance premium?', a: 'Increase your deductible, maintain a clean driving record, bundle multiple policies, take defensive driving courses, install anti-theft devices, and shop around for quotes from multiple insurers every 6-12 months.' },
    { q: 'How much car insurance coverage do I need?', a: 'At minimum, you need your state required liability coverage. Financial advisors recommend at least 100/300/100 liability coverage ($100K per person, $300K per accident, $100K property damage) plus comprehensive and collision if your vehicle is newer.' },
    { q: 'Why do young drivers pay more for car insurance?', a: 'Drivers under 25 statistically have higher accident rates due to less driving experience. Insurance companies charge higher premiums to offset this increased risk. Premiums typically decrease significantly at age 25.' },
  ] },
  it: { title: 'Calcolatore Assicurazione Auto: Stima il Tuo Premio', paragraphs: [
    'Un calcolatore di assicurazione auto ti aiuta a stimare i premi assicurativi annuali e mensili prima di contattare le compagnie assicurative. Comprendere i fattori che influenzano il premio ti aiuta a prendere decisioni informate su livelli di copertura e franchigie.',
    'Questo calcolatore considera i fattori chiave usati dagli assicuratori: valore ed eta del veicolo, eta del conducente, chilometraggio annuale e importo della franchigia. Il premio base e tipicamente il 3-5% del valore del veicolo, aggiustato per fattori di rischio.',
    'La scelta della franchigia impatta significativamente sul premio. Aumentare la franchigia da 500 a 1.000 euro puo ridurre il premio del 15-25%. Tuttavia, bisogna bilanciare il risparmio con l\'importo che pagheresti di tasca in caso di sinistro.',
    'Per calcoli correlati, prova il nostro <a href="/${lang}/tools/auto-loan-calculator">calcolatore prestito auto</a> o il <a href="/${lang}/tools/fuel-cost-calculator">calcolatore costo carburante</a>.'
  ], faq: [
    { q: 'Quali fattori influenzano di piu il premio dell\'assicurazione auto?', a: 'I fattori principali sono: eta e esperienza del conducente, valore del veicolo, storico di guida, posizione, chilometraggio annuale e franchigia.' },
    { q: 'Come posso abbassare il premio dell\'assicurazione auto?', a: 'Aumenta la franchigia, mantieni un buono storico di guida, abbina piu polizze, installa dispositivi antifurto e confronta preventivi ogni 6-12 mesi.' },
    { q: 'Quanta copertura assicurativa auto mi serve?', a: 'Come minimo serve la copertura RC obbligatoria. I consulenti consigliano anche kasko e furto/incendio per veicoli recenti.' },
    { q: 'Perche i giovani pagano di piu l\'assicurazione auto?', a: 'I conducenti sotto i 25 anni hanno statisticamente tassi di incidente piu alti. I premi di solito diminuiscono significativamente a 25 anni.' },
  ] },
  es: { title: 'Calculadora de Seguro de Auto: Estima Tu Prima', paragraphs: [
    'Una calculadora de seguro de auto te ayuda a estimar tus primas anuales y mensuales antes de contactar companias de seguros. Comprender los factores que afectan tu prima te ayuda a tomar decisiones informadas sobre coberturas y deducibles.',
    'Esta calculadora considera factores clave: valor y antiguedad del vehiculo, edad del conductor, kilometraje anual y monto del deducible. La prima base es tipicamente el 3-5% del valor del vehiculo, ajustada por factores de riesgo.',
    'Tu eleccion de deducible impacta significativamente tu prima. Aumentar tu deducible de $500 a $1,000 puede reducir tu prima un 15-25%.',
    'Para calculos relacionados, prueba nuestra <a href="/${lang}/tools/auto-loan-calculator">calculadora de prestamo auto</a> o la <a href="/${lang}/tools/fuel-cost-calculator">calculadora de costo de combustible</a>.'
  ], faq: [
    { q: 'Que factores afectan mas las primas de seguro de auto?', a: 'Los principales son: edad del conductor, valor del vehiculo, historial de conduccion, ubicacion, kilometraje y deducible.' },
    { q: 'Como puedo bajar mi prima de seguro de auto?', a: 'Aumenta tu deducible, mantiene un buen historial, combina polizas y compara cotizaciones regularmente.' },
    { q: 'Cuanta cobertura de seguro de auto necesito?', a: 'Como minimo la cobertura de responsabilidad civil requerida. Se recomienda cobertura amplia para vehiculos nuevos.' },
    { q: 'Por que los jovenes pagan mas por seguro de auto?', a: 'Los conductores menores de 25 tienen tasas de accidentes mas altas. Las primas bajan significativamente a los 25 anos.' },
  ] },
  fr: { title: 'Calculateur Assurance Auto: Estimez Votre Prime', paragraphs: [
    'Un calculateur d\'assurance auto vous aide a estimer vos primes annuelles et mensuelles avant de contacter les assureurs. Comprendre les facteurs qui affectent votre prime vous aide a prendre des decisions eclairees.',
    'Ce calculateur considere les facteurs cles: valeur et age du vehicule, age du conducteur, kilometrage annuel et montant de la franchise. La prime de base est typiquement 3-5% de la valeur du vehicule.',
    'Votre choix de franchise impacte significativement votre prime. Augmenter votre franchise de 500 a 1 000 euros peut reduire votre prime de 15-25%.',
    'Pour des calculs connexes, essayez notre <a href="/${lang}/tools/auto-loan-calculator">calculateur pret auto</a> ou le <a href="/${lang}/tools/fuel-cost-calculator">calculateur cout carburant</a>.'
  ], faq: [
    { q: 'Quels facteurs affectent le plus les primes d\'assurance auto?', a: 'Les principaux sont: age du conducteur, valeur du vehicule, historique de conduite, lieu de residence et franchise.' },
    { q: 'Comment puis-je baisser ma prime d\'assurance auto?', a: 'Augmentez votre franchise, maintenez un bon historique, combinez vos polices et comparez les devis regulierement.' },
    { q: 'Combien de couverture d\'assurance auto ai-je besoin?', a: 'Au minimum la responsabilite civile obligatoire. Une couverture tous risques est recommandee pour les vehicules recents.' },
    { q: 'Pourquoi les jeunes paient plus cher l\'assurance auto?', a: 'Les conducteurs de moins de 25 ans ont statistiquement plus d\'accidents. Les primes baissent significativement a 25 ans.' },
  ] },
  de: { title: 'Kfz-Versicherungsrechner: Schaetzen Sie Ihre Praemie', paragraphs: [
    'Ein Kfz-Versicherungsrechner hilft Ihnen, Ihre jaehrlichen und monatlichen Versicherungspraemien vor der Kontaktaufnahme mit Versicherungsgesellschaften zu schaetzen.',
    'Dieser Rechner beruecksichtigt Schluesselfaktoren: Fahrzeugwert und -alter, Fahreralter, Jahreskilometerleistung und Selbstbeteiligung. Die Basispremie betraegt typisch 3-5% des Fahrzeugwerts.',
    'Ihre Wahl der Selbstbeteiligung beeinflusst Ihre Praemie erheblich. Eine Erhoehung von 500 auf 1.000 Euro kann Ihre Praemie um 15-25% senken.',
    'Fuer verwandte Berechnungen nutzen Sie unseren <a href="/${lang}/tools/auto-loan-calculator">Autokredit-Rechner</a> oder den <a href="/${lang}/tools/fuel-cost-calculator">Kraftstoffkosten-Rechner</a>.'
  ], faq: [
    { q: 'Welche Faktoren beeinflussen Kfz-Versicherungspraemien am meisten?', a: 'Die wichtigsten sind: Fahreralter, Fahrzeugwert, Schadenshistorie, Wohnort und Selbstbeteiligung.' },
    { q: 'Wie kann ich meine Kfz-Versicherungspraemie senken?', a: 'Erhoehen Sie die Selbstbeteiligung, halten Sie eine saubere Schadenshistorie und vergleichen Sie regelmaessig Angebote.' },
    { q: 'Wie viel Kfz-Versicherungsdeckung brauche ich?', a: 'Mindestens die gesetzliche Haftpflicht. Vollkasko wird fuer neuere Fahrzeuge empfohlen.' },
    { q: 'Warum zahlen junge Fahrer mehr fuer Kfz-Versicherung?', a: 'Fahrer unter 25 haben statistisch hoehere Unfallraten. Die Praemien sinken deutlich ab 25 Jahren.' },
  ] },
  pt: { title: 'Calculadora de Seguro Auto: Estime Seu Premio', paragraphs: [
    'Uma calculadora de seguro auto ajuda a estimar seus premios anuais e mensais antes de contatar seguradoras. Entender os fatores que afetam seu premio ajuda a tomar decisoes informadas.',
    'Esta calculadora considera fatores-chave: valor e idade do veiculo, idade do motorista, quilometragem anual e valor da franquia. O premio base e tipicamente 3-5% do valor do veiculo.',
    'Sua escolha de franquia impacta significativamente seu premio. Aumentar a franquia de R$500 para R$1.000 pode reduzir o premio em 15-25%.',
    'Para calculos relacionados, experimente nossa <a href="/${lang}/tools/auto-loan-calculator">calculadora de financiamento auto</a> ou a <a href="/${lang}/tools/fuel-cost-calculator">calculadora de custo de combustivel</a>.'
  ], faq: [
    { q: 'Quais fatores mais afetam os premios de seguro auto?', a: 'Os principais sao: idade do motorista, valor do veiculo, historico de direcao, localizacao e franquia.' },
    { q: 'Como posso diminuir meu premio de seguro auto?', a: 'Aumente a franquia, mantenha um bom historico, combine apolices e compare cotacoes regularmente.' },
    { q: 'Quanta cobertura de seguro auto eu preciso?', a: 'No minimo o seguro obrigatorio. Cobertura completa e recomendada para veiculos novos.' },
    { q: 'Por que jovens pagam mais por seguro auto?', a: 'Motoristas com menos de 25 anos tem taxas de acidentes mais altas. Os premios diminuem significativamente aos 25 anos.' },
  ] },
};

export default function CarInsuranceCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['car-insurance-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [vehicleValue, setVehicleValue] = useState('25000');
  const [vehicleAge, setVehicleAge] = useState('3');
  const [driverAge, setDriverAge] = useState('35');
  const [annualMileage, setAnnualMileage] = useState('12000');
  const [deductible, setDeductible] = useState('500');
  const [copied, setCopied] = useState(false);

  const vValue = parseFloat(vehicleValue) || 0;
  const vAge = parseInt(vehicleAge) || 0;
  const dAge = parseInt(driverAge) || 0;
  const mileage = parseInt(annualMileage) || 0;
  const ded = parseFloat(deductible) || 500;

  const basePremium = vValue * 0.04;
  const ageFactor = dAge < 25 ? 1.6 : dAge > 65 ? 1.3 : 1.0;
  const mileageFactor = 1 + (mileage - 10000) / 50000;
  const vehicleAgeFactor = Math.max(0.3, 1 - vAge * 0.02);
  const deductibleDiscount = (ded - 500) * 0.15;
  const annual = Math.max(300, basePremium * ageFactor * mileageFactor * vehicleAgeFactor - deductibleDiscount);
  const monthly = annual / 12;
  const coverage = vValue;
  const savings = Math.max(0, deductibleDiscount);

  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;

  const resetAll = () => {
    setVehicleValue('25000'); setVehicleAge('3'); setDriverAge('35');
    setAnnualMileage('12000'); setDeductible('500'); setCopied(false);
  };

  const copyResults = () => {
    const text = `${t('annualPremium')}: ${fmt(annual)} | ${t('monthlyPremium')}: ${fmt(monthly)}`;
    navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="car-insurance-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {[
            { key: 'vehicleValue', val: vehicleValue, set: setVehicleValue },
            { key: 'vehicleAge', val: vehicleAge, set: setVehicleAge, min: 0, max: 30 },
            { key: 'driverAge', val: driverAge, set: setDriverAge, min: 16, max: 80 },
            { key: 'annualMileage', val: annualMileage, set: setAnnualMileage },
            { key: 'deductible', val: deductible, set: setDeductible },
          ].map(({ key, val, set, min, max }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t(key)}</label>
              <input type="number" value={val} onChange={(e) => set(e.target.value)} min={min} max={max}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          ))}

          <div className="flex gap-2">
            {annual > 0 && (
              <button onClick={copyResults} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                {copied ? t('copied') : t('copy')}
              </button>
            )}
            <button onClick={resetAll} className="px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium text-red-600 transition-colors ml-auto">
              {t('reset')}
            </button>
          </div>

          {vValue > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <div className="text-xs text-blue-600 font-medium">{t('annualPremium')}</div>
                <div className="text-2xl font-bold text-blue-700">{fmt(annual)}</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <div className="text-xs text-green-600 font-medium">{t('monthlyPremium')}</div>
                <div className="text-2xl font-bold text-green-700">{fmt(monthly)}</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 font-medium">{t('coverageAmount')}</div>
                <div className="text-lg font-bold text-gray-900">{fmt(coverage)}</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 font-medium">{t('deductibleSavings')}</div>
                <div className="text-lg font-bold text-gray-900">{fmt(savings)}</div>
              </div>
            </div>
          )}
        </div>

        <article className="mt-10 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: p.replace(/\$\{lang\}/g, lang) }} />
          ))}
        </article>

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
