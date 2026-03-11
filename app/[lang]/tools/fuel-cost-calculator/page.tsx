'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  distance: { en: 'Distance', it: 'Distanza', es: 'Distancia', fr: 'Distance', de: 'Entfernung', pt: 'Distância' },
  consumption: { en: 'Fuel Consumption', it: 'Consumo Carburante', es: 'Consumo de Combustible', fr: 'Consommation', de: 'Kraftstoffverbrauch', pt: 'Consumo de Combustível' },
  fuelPrice: { en: 'Fuel Price', it: 'Prezzo Carburante', es: 'Precio Combustible', fr: 'Prix du Carburant', de: 'Kraftstoffpreis', pt: 'Preço Combustível' },
  tripCost: { en: 'Trip Cost', it: 'Costo Viaggio', es: 'Costo del Viaje', fr: 'Coût du Trajet', de: 'Fahrtkosten', pt: 'Custo da Viagem' },
  fuelUsed: { en: 'Fuel Used', it: 'Carburante Usato', es: 'Combustible Usado', fr: 'Carburant Utilisé', de: 'Verbrauchter Kraftstoff', pt: 'Combustível Usado' },
  metric: { en: 'Metric (L/100km)', it: 'Metrico (L/100km)', es: 'Métrico (L/100km)', fr: 'Métrique (L/100km)', de: 'Metrisch (L/100km)', pt: 'Métrico (L/100km)' },
  imperial: { en: 'Imperial (MPG)', it: 'Imperiale (MPG)', es: 'Imperial (MPG)', fr: 'Impérial (MPG)', de: 'Imperial (MPG)', pt: 'Imperial (MPG)' },
  km: { en: 'km', it: 'km', es: 'km', fr: 'km', de: 'km', pt: 'km' },
  miles: { en: 'miles', it: 'miglia', es: 'millas', fr: 'miles', de: 'Meilen', pt: 'milhas' },
  perLiter: { en: '/liter', it: '/litro', es: '/litro', fr: '/litre', de: '/Liter', pt: '/litro' },
  perGallon: { en: '/gallon', it: '/gallone', es: '/galón', fr: '/gallon', de: '/Gallone', pt: '/galão' },
  liters: { en: 'liters', it: 'litri', es: 'litros', fr: 'litres', de: 'Liter', pt: 'litros' },
  gallons: { en: 'gallons', it: 'galloni', es: 'galones', fr: 'gallons', de: 'Gallonen', pt: 'galões' },
  roundTrip: { en: 'Round Trip', it: 'Andata e Ritorno', es: 'Ida y Vuelta', fr: 'Aller-Retour', de: 'Hin- und Rückfahrt', pt: 'Ida e Volta' },
};

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: {
    title: 'How to Calculate Fuel Cost for Any Trip',
    paragraphs: [
      'Planning a road trip or daily commute? Knowing the fuel cost in advance helps you budget accurately and compare driving costs against alternative transportation options like trains or flights. Fuel expenses depend on three main factors: the distance you travel, your vehicle\'s fuel consumption rate, and the current price of fuel in your area.',
      'Our fuel cost calculator supports both metric (liters per 100 km) and imperial (miles per gallon) measurement systems. Enter your trip distance, your vehicle\'s fuel consumption, and the local fuel price, and the calculator instantly shows you how much fuel you will use and what the trip will cost. The round-trip option doubles the distance automatically for return journeys.',
      'This tool is valuable for comparing the cost-effectiveness of different vehicles, planning vacation budgets, calculating business mileage expenses, or deciding whether to drive or take public transportation. By experimenting with different fuel consumption rates, you can also estimate how much you would save by switching to a more fuel-efficient vehicle or a hybrid/electric car.',
    ],
    faq: [
      { q: 'How do I calculate fuel cost per kilometer?', a: 'Multiply your fuel consumption (L/100km) by the price per liter, then divide by 100. For example, if your car uses 7 L/100km and fuel costs $1.80/liter: (7 x 1.80) / 100 = $0.126 per km.' },
      { q: 'How do I convert MPG to L/100km?', a: 'Divide 235.214 by the MPG value. For example, 30 MPG = 235.214 / 30 = 7.84 L/100km. This works for US gallons; for UK (imperial) gallons, divide 282.481 by the MPG value.' },
      { q: 'What is the average fuel consumption for a car?', a: 'A typical modern car uses 6-9 L/100km (26-39 MPG). SUVs average 8-12 L/100km (20-29 MPG). Hybrid vehicles achieve 3-5 L/100km (47-78 MPG). Small city cars can be as efficient as 4-6 L/100km.' },
      { q: 'Is it cheaper to drive or fly for long trips?', a: 'For solo travelers on trips over 300-400 km, flying is often cheaper when accounting for fuel, tolls, and vehicle wear. However, driving becomes more economical with 2+ passengers sharing costs, and offers flexibility and door-to-door convenience.' },
      { q: 'How can I reduce my fuel consumption?', a: 'Maintain steady speeds, avoid aggressive acceleration, keep tires properly inflated, remove roof racks when not in use, avoid excessive idling, use cruise control on highways, and service your vehicle regularly. These habits can reduce fuel consumption by 10-25%.' },
    ],
  },
  it: {
    title: 'Come Calcolare il Costo del Carburante per un Viaggio',
    paragraphs: [
      'Stai pianificando un viaggio in auto o calcoli il costo del pendolarismo quotidiano? Conoscere in anticipo il costo del carburante ti aiuta a fare un budget preciso e a confrontare i costi di guida con alternative come treni o aerei. Le spese di carburante dipendono da tre fattori principali: la distanza, il consumo del tuo veicolo e il prezzo del carburante nella tua zona.',
      'Il nostro calcolatore supporta sia il sistema metrico (litri per 100 km) che quello imperiale (miglia per gallone). Inserisci la distanza, il consumo del tuo veicolo e il prezzo del carburante, e il calcolatore mostra istantaneamente quanto carburante userai e quanto costera il viaggio. L\'opzione andata e ritorno raddoppia automaticamente la distanza.',
      'Questo strumento e utile per confrontare l\'efficienza di diversi veicoli, pianificare budget vacanze, calcolare spese di trasferta aziendali o decidere se guidare o prendere i mezzi pubblici. Sperimentando con diversi consumi, puoi stimare quanto risparmieresti passando a un veicolo piu efficiente o ibrido/elettrico.',
    ],
    faq: [
      { q: 'Come calcolo il costo del carburante al chilometro?', a: 'Moltiplica il consumo (L/100km) per il prezzo al litro, poi dividi per 100. Esempio: se la tua auto consuma 7 L/100km e il carburante costa 1,80 euro/litro: (7 x 1,80) / 100 = 0,126 euro al km.' },
      { q: 'Come si converte MPG in L/100km?', a: 'Dividi 235,214 per il valore MPG. Esempio: 30 MPG = 235,214 / 30 = 7,84 L/100km.' },
      { q: 'Qual e il consumo medio di un\'auto?', a: 'Un\'auto moderna tipica consuma 6-9 L/100km. I SUV 8-12 L/100km. I veicoli ibridi 3-5 L/100km. Le city car possono raggiungere 4-6 L/100km.' },
      { q: 'E piu economico guidare o volare per lunghi viaggi?', a: 'Per viaggiatori singoli su tratte oltre 300-400 km, volare e spesso piu economico considerando carburante, pedaggi e usura. Pero guidare diventa conveniente con 2+ passeggeri che condividono i costi.' },
      { q: 'Come posso ridurre il consumo di carburante?', a: 'Mantieni velocita costanti, evita accelerazioni brusche, tieni i pneumatici alla pressione corretta, rimuovi i portapacchi quando non in uso, evita il motore al minimo e fai la manutenzione regolare. Queste abitudini possono ridurre il consumo del 10-25%.' },
    ],
  },
  es: {
    title: 'Como Calcular el Costo de Combustible para un Viaje',
    paragraphs: [
      'Planificando un viaje por carretera o calculando el costo del desplazamiento diario? Conocer el costo del combustible por adelantado te ayuda a presupuestar con precision y comparar los costos de conducir con alternativas como trenes o aviones. Los gastos de combustible dependen de tres factores: la distancia, el consumo de tu vehiculo y el precio del combustible.',
      'Nuestra calculadora soporta tanto el sistema metrico (litros por 100 km) como el imperial (millas por galon). Introduce la distancia, el consumo de tu vehiculo y el precio del combustible, y la calculadora muestra instantaneamente cuanto combustible usaras y cuanto costara el viaje.',
      'Esta herramienta es valiosa para comparar la eficiencia de diferentes vehiculos, planificar presupuestos vacacionales, calcular gastos de kilometraje laboral o decidir si conducir o tomar transporte publico.',
    ],
    faq: [
      { q: 'Como calculo el costo de combustible por kilometro?', a: 'Multiplica el consumo (L/100km) por el precio por litro y divide entre 100. Ejemplo: 7 L/100km a 1,80 $/litro: (7 x 1,80) / 100 = $0,126 por km.' },
      { q: 'Como convierto MPG a L/100km?', a: 'Divide 235,214 entre el valor MPG. Ejemplo: 30 MPG = 235,214 / 30 = 7,84 L/100km.' },
      { q: 'Cual es el consumo medio de un coche?', a: 'Un coche moderno tipico consume 6-9 L/100km. Los SUV 8-12 L/100km. Los hibridos 3-5 L/100km. Los coches urbanos pueden alcanzar 4-6 L/100km.' },
      { q: 'Es mas barato conducir o volar en viajes largos?', a: 'Para viajeros solos en trayectos de mas de 300-400 km, volar suele ser mas economico. Pero conducir es mas conveniente con 2+ pasajeros compartiendo gastos.' },
      { q: 'Como puedo reducir mi consumo de combustible?', a: 'Mantén velocidades constantes, evita aceleraciones bruscas, mantén los neumaticos a la presion correcta, retira los portaequipajes cuando no los uses y haz el mantenimiento regular.' },
    ],
  },
  fr: {
    title: 'Comment Calculer le Cout du Carburant pour un Trajet',
    paragraphs: [
      'Vous planifiez un voyage en voiture ou calculez le cout de vos trajets quotidiens? Connaitre le cout du carburant a l\'avance vous aide a budgetiser avec precision et a comparer les couts de conduite avec des alternatives comme le train ou l\'avion. Les depenses de carburant dependent de trois facteurs: la distance, la consommation de votre vehicule et le prix du carburant.',
      'Notre calculateur prend en charge les systemes metrique (litres aux 100 km) et imperial (miles par gallon). Entrez la distance, la consommation de votre vehicule et le prix du carburant, et le calculateur affiche instantanement la quantite de carburant utilisee et le cout du trajet.',
      'Cet outil est precieux pour comparer l\'efficacite de differents vehicules, planifier des budgets vacances, calculer les frais de deplacement professionnels ou decider entre conduire et prendre les transports en commun.',
    ],
    faq: [
      { q: 'Comment calculer le cout du carburant au kilometre?', a: 'Multipliez la consommation (L/100km) par le prix au litre, puis divisez par 100. Exemple: 7 L/100km a 1,80 euros/litre: (7 x 1,80) / 100 = 0,126 euros par km.' },
      { q: 'Comment convertir MPG en L/100km?', a: 'Divisez 235,214 par la valeur MPG. Exemple: 30 MPG = 235,214 / 30 = 7,84 L/100km.' },
      { q: 'Quelle est la consommation moyenne d\'une voiture?', a: 'Une voiture moderne typique consomme 6-9 L/100km. Les SUV 8-12 L/100km. Les hybrides 3-5 L/100km. Les citadines peuvent atteindre 4-6 L/100km.' },
      { q: 'Est-il moins cher de conduire ou de prendre l\'avion?', a: 'Pour un voyageur seul sur des trajets de plus de 300-400 km, l\'avion est souvent moins cher. Mais conduire devient avantageux avec 2+ passagers partageant les frais.' },
      { q: 'Comment reduire ma consommation de carburant?', a: 'Maintenez des vitesses constantes, evitez les accelerations brusques, gardez les pneus a la bonne pression, retirez les barres de toit inutilisees et faites l\'entretien regulier de votre vehicule.' },
    ],
  },
  de: {
    title: 'Wie berechnet man die Spritkosten fuer eine Fahrt?',
    paragraphs: [
      'Planen Sie eine Autofahrt oder berechnen Sie die Kosten fuer Ihren taeglichen Pendelweg? Die Spritkosten im Voraus zu kennen hilft Ihnen, genau zu budgetieren und Fahrkosten mit Alternativen wie Zug oder Flug zu vergleichen. Die Kraftstoffkosten haengen von drei Faktoren ab: der Entfernung, dem Verbrauch Ihres Fahrzeugs und dem aktuellen Kraftstoffpreis.',
      'Unser Sprtkostenrechner unterstuetzt sowohl das metrische (Liter pro 100 km) als auch das imperiale System (Meilen pro Gallone). Geben Sie die Entfernung, den Verbrauch und den Kraftstoffpreis ein, und der Rechner zeigt sofort, wie viel Kraftstoff Sie verbrauchen und was die Fahrt kostet.',
      'Dieses Tool ist wertvoll fuer den Vergleich der Wirtschaftlichkeit verschiedener Fahrzeuge, die Planung von Urlaubsbudgets, die Berechnung von Geschaeftskilometerkosten oder die Entscheidung zwischen Autofahren und oeffentlichen Verkehrsmitteln.',
    ],
    faq: [
      { q: 'Wie berechne ich die Spritkosten pro Kilometer?', a: 'Multiplizieren Sie den Verbrauch (L/100km) mit dem Literpreis und teilen Sie durch 100. Beispiel: 7 L/100km bei 1,80 Euro/Liter: (7 x 1,80) / 100 = 0,126 Euro pro km.' },
      { q: 'Wie rechne ich MPG in L/100km um?', a: 'Teilen Sie 235,214 durch den MPG-Wert. Beispiel: 30 MPG = 235,214 / 30 = 7,84 L/100km.' },
      { q: 'Was ist der durchschnittliche Kraftstoffverbrauch eines Autos?', a: 'Ein typisches modernes Auto verbraucht 6-9 L/100km. SUVs 8-12 L/100km. Hybridfahrzeuge 3-5 L/100km. Kleinwagen koennen 4-6 L/100km erreichen.' },
      { q: 'Ist es guenstiger zu fahren oder zu fliegen?', a: 'Fuer Einzelreisende auf Strecken ueber 300-400 km ist Fliegen oft guenstiger. Autofahren wird aber wirtschaftlicher mit 2+ Personen, die sich die Kosten teilen.' },
      { q: 'Wie kann ich meinen Kraftstoffverbrauch senken?', a: 'Halten Sie gleichmaessige Geschwindigkeiten, vermeiden Sie abruptes Beschleunigen, halten Sie den Reifendruck korrekt, entfernen Sie Dachtraeger wenn nicht benoetigt und warten Sie Ihr Fahrzeug regelmaessig.' },
    ],
  },
  pt: {
    title: 'Como Calcular o Custo de Combustivel para uma Viagem',
    paragraphs: [
      'A planear uma viagem de carro ou a calcular o custo da deslocacao diaria? Conhecer o custo do combustivel antecipadamente ajuda a orcamentar com precisao e a comparar os custos de conducao com alternativas como comboios ou avioes. Os gastos com combustivel dependem de tres fatores: a distancia, o consumo do veiculo e o preco do combustivel.',
      'A nossa calculadora suporta tanto o sistema metrico (litros por 100 km) como o imperial (milhas por galao). Introduza a distancia, o consumo do seu veiculo e o preco do combustivel, e a calculadora mostra instantaneamente quanto combustivel usara e quanto custara a viagem.',
      'Esta ferramenta e valiosa para comparar a eficiencia de diferentes veiculos, planear orcamentos de ferias, calcular despesas de quilometragem profissional ou decidir entre conduzir e usar transportes publicos.',
    ],
    faq: [
      { q: 'Como calculo o custo de combustivel por quilometro?', a: 'Multiplique o consumo (L/100km) pelo preco por litro e divida por 100. Exemplo: 7 L/100km a 1,80 euros/litro: (7 x 1,80) / 100 = 0,126 euros por km.' },
      { q: 'Como converto MPG para L/100km?', a: 'Divida 235,214 pelo valor MPG. Exemplo: 30 MPG = 235,214 / 30 = 7,84 L/100km.' },
      { q: 'Qual e o consumo medio de um carro?', a: 'Um carro moderno tipico consome 6-9 L/100km. SUVs 8-12 L/100km. Hibridos 3-5 L/100km. Carros urbanos podem atingir 4-6 L/100km.' },
      { q: 'E mais barato conduzir ou voar em viagens longas?', a: 'Para viajantes sozinhos em percursos de mais de 300-400 km, voar e frequentemente mais economico. Mas conduzir torna-se vantajoso com 2+ passageiros a partilhar custos.' },
      { q: 'Como posso reduzir o consumo de combustivel?', a: 'Mantenha velocidades constantes, evite aceleracoes bruscas, mantenha os pneus a pressao correta, remova barras de tejadilho quando nao usa e faca a manutencao regular do veiculo.' },
    ],
  },
};

export default function FuelCostCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['fuel-cost-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [mode, setMode] = useState<'metric' | 'imperial'>('metric');
  const [distance, setDistance] = useState('100');
  const [consumption, setConsumption] = useState(mode === 'metric' ? '7' : '35');
  const [fuelPrice, setFuelPrice] = useState(mode === 'metric' ? '1.80' : '3.50');
  const [roundTrip, setRoundTrip] = useState(false);

  const dist = (parseFloat(distance) || 0) * (roundTrip ? 2 : 1);
  const cons = parseFloat(consumption) || 0;
  const price = parseFloat(fuelPrice) || 0;

  let fuelUsed = 0;
  let tripCost = 0;

  if (mode === 'metric') {
    // L/100km
    fuelUsed = (dist * cons) / 100;
    tripCost = fuelUsed * price;
  } else {
    // MPG (US gallons)
    fuelUsed = cons > 0 ? dist / cons : 0;
    tripCost = fuelUsed * price;
  }

  const switchMode = (newMode: 'metric' | 'imperial') => {
    setMode(newMode);
    if (newMode === 'metric') {
      setConsumption('7');
      setFuelPrice('1.80');
    } else {
      setConsumption('35');
      setFuelPrice('3.50');
    }
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="fuel-cost-calculator">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => switchMode('metric')}
              className={`flex-1 py-2 rounded-lg font-medium ${mode === 'metric' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('metric')}
            </button>
            <button
              onClick={() => switchMode('imperial')}
              className={`flex-1 py-2 rounded-lg font-medium ${mode === 'imperial' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('imperial')}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('distance')} ({mode === 'metric' ? t('km') : t('miles')})
            </label>
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('consumption')} ({mode === 'metric' ? 'L/100km' : 'MPG'})
            </label>
            <input
              type="number"
              value={consumption}
              onChange={(e) => setConsumption(e.target.value)}
              step="0.1"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('fuelPrice')} ({mode === 'metric' ? t('perLiter') : t('perGallon')})
            </label>
            <input
              type="number"
              value={fuelPrice}
              onChange={(e) => setFuelPrice(e.target.value)}
              step="0.01"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={roundTrip} onChange={(e) => setRoundTrip(e.target.checked)} className="rounded" />
            <span className="text-sm text-gray-700">{t('roundTrip')}</span>
          </label>

          {dist > 0 && cons > 0 && price > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('distance')}</span>
                <span className="font-semibold">{dist.toFixed(1)} {mode === 'metric' ? t('km') : t('miles')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('fuelUsed')}</span>
                <span className="font-semibold">{fuelUsed.toFixed(2)} {mode === 'metric' ? t('liters') : t('gallons')}</span>
              </div>
              <hr className="border-blue-200" />
              <div className="flex justify-between text-lg">
                <span className="font-bold text-gray-900">{t('tripCost')}</span>
                <span className="font-bold text-blue-600">{tripCost.toFixed(2)}</span>
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
