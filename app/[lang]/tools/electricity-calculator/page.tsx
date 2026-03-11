'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  watts: { en: 'Power (Watts)', it: 'Potenza (Watt)', es: 'Potencia (Vatios)', fr: 'Puissance (Watts)', de: 'Leistung (Watt)', pt: 'Potência (Watts)' },
  hoursPerDay: { en: 'Hours per Day', it: 'Ore al Giorno', es: 'Horas por Día', fr: 'Heures par Jour', de: 'Stunden pro Tag', pt: 'Horas por Dia' },
  days: { en: 'Number of Days', it: 'Numero di Giorni', es: 'Número de Días', fr: 'Nombre de Jours', de: 'Anzahl Tage', pt: 'Número de Dias' },
  rate: { en: 'Electricity Rate ($/kWh)', it: 'Tariffa (€/kWh)', es: 'Tarifa ($/kWh)', fr: 'Tarif (€/kWh)', de: 'Strompreis (€/kWh)', pt: 'Tarifa (R$/kWh)' },
  energyUsed: { en: 'Energy Used', it: 'Energia Consumata', es: 'Energía Utilizada', fr: 'Énergie Utilisée', de: 'Energieverbrauch', pt: 'Energia Utilizada' },
  dailyCost: { en: 'Daily Cost', it: 'Costo Giornaliero', es: 'Costo Diario', fr: 'Coût Journalier', de: 'Tägliche Kosten', pt: 'Custo Diário' },
  totalCost: { en: 'Total Cost', it: 'Costo Totale', es: 'Costo Total', fr: 'Coût Total', de: 'Gesamtkosten', pt: 'Custo Total' },
  monthlyCost: { en: 'Monthly Estimate (30 days)', it: 'Stima Mensile (30 giorni)', es: 'Estimación Mensual (30 días)', fr: 'Estimation Mensuelle (30 jours)', de: 'Monatliche Schätzung (30 Tage)', pt: 'Estimativa Mensal (30 dias)' },
  yearlyCost: { en: 'Yearly Estimate', it: 'Stima Annuale', es: 'Estimación Anual', fr: 'Estimation Annuelle', de: 'Jährliche Schätzung', pt: 'Estimativa Anual' },
};

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: {
    title: 'How to Calculate Your Electricity Cost per Appliance',
    paragraphs: [
      'Understanding how much electricity each appliance uses is the first step toward reducing your energy bill. Every electrical device consumes power measured in watts, and the cost of running it depends on three factors: its wattage, how many hours you use it per day, and your local electricity rate per kilowatt-hour (kWh). Even small differences in usage patterns can lead to significant savings over a year.',
      'Our electricity cost calculator lets you estimate the running cost of any appliance or device. Enter the power consumption in watts (usually found on the device label or in the manual), the number of hours you use it daily, the number of days, and your electricity rate. The calculator instantly shows you the total energy consumed in kWh and the associated cost for the period, plus monthly and yearly projections.',
      'This tool is particularly useful for identifying energy-hungry appliances in your home. Space heaters, air conditioners, and older refrigerators are common culprits for high electricity bills. By calculating the cost of each appliance, you can prioritize upgrades to energy-efficient models, adjust your usage habits, or simply understand where your money goes each month.',
    ],
    faq: [
      { q: 'How do I calculate electricity cost from watts?', a: 'Convert watts to kilowatts by dividing by 1000, multiply by the hours of use, then multiply by your electricity rate. For example: 100W for 8 hours at $0.12/kWh = (100/1000) x 8 x 0.12 = $0.096 per day.' },
      { q: 'What appliances use the most electricity?', a: 'The biggest electricity consumers in a typical home are air conditioning, electric heating, water heaters, clothes dryers, and electric ovens. Older refrigerators and freezers also consume significant energy due to running continuously.' },
      { q: 'How many kWh does an average household use per month?', a: 'The average varies by country and climate. In the US, it is about 900 kWh per month. In European countries, it ranges from 200-400 kWh due to smaller homes and more efficient appliances.' },
      { q: 'How can I reduce my electricity bill?', a: 'Switch to LED bulbs, unplug devices when not in use, use a programmable thermostat, wash clothes in cold water, upgrade to energy-efficient appliances, and consider time-of-use electricity plans that offer lower rates during off-peak hours.' },
      { q: 'What is the difference between watts and kilowatt-hours?', a: 'Watts (W) measure the rate of energy consumption at any given moment. Kilowatt-hours (kWh) measure total energy consumed over time. A 1000W appliance running for 1 hour uses 1 kWh.' },
    ],
  },
  it: {
    title: 'Come Calcolare il Costo dell\'Energia Elettrica per Elettrodomestico',
    paragraphs: [
      'Capire quanta elettricita consuma ogni elettrodomestico e il primo passo per ridurre la bolletta. Ogni dispositivo elettrico consuma energia misurata in watt, e il costo di funzionamento dipende da tre fattori: la potenza in watt, le ore di utilizzo giornaliero e la tariffa elettrica locale per kilowattora (kWh).',
      'Il nostro calcolatore del costo dell\'elettricita ti permette di stimare il costo di funzionamento di qualsiasi elettrodomestico. Inserisci il consumo in watt (solitamente indicato sull\'etichetta del dispositivo), le ore di utilizzo giornaliero, il numero di giorni e la tua tariffa elettrica. Il calcolatore mostra istantaneamente l\'energia totale consumata e il costo associato, piu proiezioni mensili e annuali.',
      'Questo strumento e particolarmente utile per identificare gli elettrodomestici piu energivori della tua casa. Stufe elettriche, condizionatori e frigoriferi vecchi sono spesso i responsabili delle bollette alte. Calcolando il costo di ogni apparecchio, puoi decidere quali sostituire con modelli a basso consumo.',
    ],
    faq: [
      { q: 'Come si calcola il costo dell\'elettricita dai watt?', a: 'Converti i watt in kilowatt dividendo per 1000, moltiplica per le ore di utilizzo, poi per la tariffa. Esempio: 100W per 8 ore a 0,25 euro/kWh = (100/1000) x 8 x 0,25 = 0,20 euro al giorno.' },
      { q: 'Quali elettrodomestici consumano piu elettricita?', a: 'I maggiori consumatori sono condizionatori, riscaldamento elettrico, scaldabagni, asciugatrici e forni elettrici. Anche frigoriferi e congelatori vecchi consumano molto perche funzionano continuamente.' },
      { q: 'Quanti kWh consuma una famiglia media al mese?', a: 'In Italia, una famiglia media consuma circa 2.700 kWh all\'anno, ovvero circa 225 kWh al mese. Il consumo varia in base alla dimensione dell\'abitazione e al numero di occupanti.' },
      { q: 'Come posso ridurre la bolletta della luce?', a: 'Passa alle lampadine LED, scollega i dispositivi in standby, usa un termostato programmabile, lava i vestiti a bassa temperatura, scegli elettrodomestici di classe energetica alta e considera le tariffe biorarie.' },
      { q: 'Qual e la differenza tra watt e kilowattora?', a: 'I watt (W) misurano la potenza istantanea consumata. I kilowattora (kWh) misurano l\'energia totale consumata nel tempo. Un apparecchio da 1000W acceso per 1 ora consuma 1 kWh.' },
    ],
  },
  es: {
    title: 'Como Calcular el Costo de Electricidad por Electrodomestico',
    paragraphs: [
      'Entender cuanta electricidad consume cada electrodomestico es el primer paso para reducir tu factura de luz. Cada dispositivo electrico consume energia medida en vatios, y el costo de funcionamiento depende de tres factores: su potencia, las horas de uso diario y tu tarifa electrica local por kilovatio-hora (kWh).',
      'Nuestra calculadora de costo electrico te permite estimar el costo de funcionamiento de cualquier electrodomestico. Introduce el consumo en vatios, las horas de uso diario, el numero de dias y tu tarifa electrica. La calculadora muestra instantaneamente la energia total consumida y el costo asociado, ademas de proyecciones mensuales y anuales.',
      'Esta herramienta es especialmente util para identificar los electrodomesticos que mas consumen en tu hogar. Calefactores electricos, aires acondicionados y refrigeradores antiguos son los principales responsables de facturas altas. Calculando el costo de cada aparato puedes priorizar mejoras a modelos eficientes.',
    ],
    faq: [
      { q: 'Como calculo el costo de electricidad desde los vatios?', a: 'Convierte vatios a kilovatios dividiendo entre 1000, multiplica por las horas de uso y luego por tu tarifa. Ejemplo: 100W por 8 horas a $0,12/kWh = (100/1000) x 8 x 0,12 = $0,096 al dia.' },
      { q: 'Que electrodomesticos consumen mas electricidad?', a: 'Los mayores consumidores son aires acondicionados, calefaccion electrica, calentadores de agua, secadoras y hornos electricos. Refrigeradores y congeladores antiguos tambien consumen mucho.' },
      { q: 'Cuantos kWh consume un hogar promedio al mes?', a: 'Varia por pais. En Espana, un hogar medio consume unos 270 kWh al mes. En EEUU, el promedio es de unos 900 kWh mensuales.' },
      { q: 'Como puedo reducir mi factura de electricidad?', a: 'Cambia a bombillas LED, desconecta dispositivos en standby, usa un termostato programable, lava ropa en frio, elige electrodomesticos eficientes y considera tarifas con discriminacion horaria.' },
      { q: 'Cual es la diferencia entre vatios y kilovatios-hora?', a: 'Los vatios (W) miden la potencia instantanea. Los kilovatios-hora (kWh) miden la energia total consumida en el tiempo. Un aparato de 1000W encendido 1 hora consume 1 kWh.' },
    ],
  },
  fr: {
    title: 'Comment Calculer le Cout de l\'Electricite par Appareil',
    paragraphs: [
      'Comprendre combien d\'electricite chaque appareil consomme est la premiere etape pour reduire votre facture d\'energie. Chaque appareil electrique consomme de l\'energie mesuree en watts, et le cout de fonctionnement depend de trois facteurs: sa puissance, les heures d\'utilisation quotidienne et votre tarif d\'electricite par kilowattheure (kWh).',
      'Notre calculateur de cout d\'electricite vous permet d\'estimer le cout de fonctionnement de n\'importe quel appareil. Entrez la consommation en watts, les heures d\'utilisation quotidienne, le nombre de jours et votre tarif. Le calculateur affiche instantanement l\'energie totale consommee et le cout associe, plus des projections mensuelles et annuelles.',
      'Cet outil est particulierement utile pour identifier les appareils les plus gourmands en energie. Chauffages electriques, climatiseurs et vieux refrigerateurs sont souvent responsables de factures elevees. En calculant le cout de chaque appareil, vous pouvez prioriser les mises a niveau vers des modeles economes.',
    ],
    faq: [
      { q: 'Comment calculer le cout de l\'electricite a partir des watts?', a: 'Convertissez les watts en kilowatts en divisant par 1000, multipliez par les heures d\'utilisation, puis par votre tarif. Exemple: 100W pendant 8 heures a 0,20 euros/kWh = (100/1000) x 8 x 0,20 = 0,16 euros par jour.' },
      { q: 'Quels appareils consomment le plus d\'electricite?', a: 'Les plus gros consommateurs sont la climatisation, le chauffage electrique, les chauffe-eau, les seche-linge et les fours electriques. Les vieux refrigerateurs consomment aussi beaucoup.' },
      { q: 'Combien de kWh un menage moyen consomme-t-il par mois?', a: 'En France, un menage moyen consomme environ 400 kWh par mois hors chauffage electrique. Avec chauffage electrique, cela peut atteindre 800-1000 kWh.' },
      { q: 'Comment reduire ma facture d\'electricite?', a: 'Passez aux ampoules LED, debranchez les appareils en veille, utilisez un thermostat programmable, lavez le linge a basse temperature et choisissez des appareils de classe energetique A.' },
      { q: 'Quelle est la difference entre watts et kilowattheures?', a: 'Les watts (W) mesurent la puissance instantanee. Les kilowattheures (kWh) mesurent l\'energie totale consommee sur une periode. Un appareil de 1000W allume pendant 1 heure consomme 1 kWh.' },
    ],
  },
  de: {
    title: 'Wie berechnet man die Stromkosten pro Geraet?',
    paragraphs: [
      'Zu verstehen, wie viel Strom jedes Geraet verbraucht, ist der erste Schritt zur Senkung Ihrer Stromrechnung. Jedes elektrische Geraet verbraucht Energie, gemessen in Watt, und die Betriebskosten haengen von drei Faktoren ab: der Wattzahl, den Nutzungsstunden pro Tag und Ihrem lokalen Strompreis pro Kilowattstunde (kWh).',
      'Unser Stromkostenrechner ermoeglicht es Ihnen, die Betriebskosten jedes Geraets abzuschaetzen. Geben Sie den Stromverbrauch in Watt ein, die taeglichen Nutzungsstunden, die Anzahl der Tage und Ihren Strompreis. Der Rechner zeigt sofort den Gesamtenergieverbrauch in kWh und die zugehoerigen Kosten, plus monatliche und jaehrliche Hochrechnungen.',
      'Dieses Tool ist besonders nuetzlich, um energiehungrige Geraete in Ihrem Haushalt zu identifizieren. Heizluefter, Klimaanlagen und aeltere Kuehlschraenke sind haeufige Ursachen fuer hohe Stromrechnungen. Durch Berechnung der Kosten jedes Geraets koennen Sie Upgrades auf energieeffiziente Modelle priorisieren.',
    ],
    faq: [
      { q: 'Wie berechne ich die Stromkosten aus Watt?', a: 'Teilen Sie die Wattzahl durch 1000 fuer Kilowatt, multiplizieren Sie mit den Nutzungsstunden und dann mit Ihrem Strompreis. Beispiel: 100W fuer 8 Stunden bei 0,30 Euro/kWh = (100/1000) x 8 x 0,30 = 0,24 Euro pro Tag.' },
      { q: 'Welche Geraete verbrauchen am meisten Strom?', a: 'Die groessten Stromverbraucher sind Klimaanlagen, elektrische Heizungen, Warmwasserbereiter, Waeschetrockner und Elektroherde. Aeltere Kuehlschraenke verbrauchen ebenfalls viel Strom.' },
      { q: 'Wie viele kWh verbraucht ein durchschnittlicher Haushalt pro Monat?', a: 'In Deutschland verbraucht ein durchschnittlicher Haushalt etwa 3.500 kWh pro Jahr, also rund 290 kWh pro Monat. Der Verbrauch variiert je nach Haushaltsgroesse und Ausstattung.' },
      { q: 'Wie kann ich meine Stromrechnung senken?', a: 'Wechseln Sie zu LED-Lampen, vermeiden Sie Standby-Verbrauch, nutzen Sie einen programmierbaren Thermostat, waschen Sie bei niedrigen Temperaturen und waehlen Sie energieeffiziente Geraete.' },
      { q: 'Was ist der Unterschied zwischen Watt und Kilowattstunden?', a: 'Watt (W) messen die momentane Leistungsaufnahme. Kilowattstunden (kWh) messen den gesamten Energieverbrauch ueber einen Zeitraum. Ein 1000W-Geraet, das 1 Stunde laeuft, verbraucht 1 kWh.' },
    ],
  },
  pt: {
    title: 'Como Calcular o Custo de Eletricidade por Eletrodomestico',
    paragraphs: [
      'Compreender quanta eletricidade cada eletrodomestico consome e o primeiro passo para reduzir a sua conta de energia. Cada dispositivo eletrico consome energia medida em watts, e o custo de funcionamento depende de tres fatores: a potencia, as horas de utilizacao diaria e a sua tarifa de eletricidade por quilowatt-hora (kWh).',
      'A nossa calculadora de custo de eletricidade permite-lhe estimar o custo de funcionamento de qualquer eletrodomestico. Introduza o consumo em watts, as horas de uso diario, o numero de dias e a sua tarifa. A calculadora mostra instantaneamente a energia total consumida e o custo associado, alem de projecoes mensais e anuais.',
      'Esta ferramenta e particularmente util para identificar os eletrodomesticos mais gastadores na sua casa. Aquecedores, ares condicionados e frigorifico antigos sao frequentemente responsaveis por contas altas. Ao calcular o custo de cada aparelho, pode priorizar a substituicao por modelos eficientes.',
    ],
    faq: [
      { q: 'Como calculo o custo de eletricidade a partir dos watts?', a: 'Converta watts para quilowatts dividindo por 1000, multiplique pelas horas de uso e depois pela sua tarifa. Exemplo: 100W durante 8 horas a 0,20 R$/kWh = (100/1000) x 8 x 0,20 = R$0,16 por dia.' },
      { q: 'Quais eletrodomesticos consomem mais eletricidade?', a: 'Os maiores consumidores sao ar condicionado, aquecimento eletrico, aquecedores de agua, secadoras e fornos eletricos. Frigorificos e congeladores antigos tambem consomem bastante.' },
      { q: 'Quantos kWh consome uma familia media por mes?', a: 'Em Portugal, uma familia media consome cerca de 300 kWh por mes. No Brasil, o consumo medio e de aproximadamente 150-200 kWh mensais.' },
      { q: 'Como posso reduzir a minha conta de eletricidade?', a: 'Mude para lampadas LED, desligue aparelhos em standby, use um termostato programavel, lave roupa a baixa temperatura e escolha eletrodomesticos com boa classe energetica.' },
      { q: 'Qual e a diferenca entre watts e quilowatt-hora?', a: 'Os watts (W) medem a potencia instantanea consumida. Os quilowatt-hora (kWh) medem a energia total consumida ao longo do tempo. Um aparelho de 1000W ligado durante 1 hora consome 1 kWh.' },
    ],
  },
};

export default function ElectricityCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['electricity-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [watts, setWatts] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState('');
  const [days, setDays] = useState('30');
  const [rate, setRate] = useState('0.12');

  const w = parseFloat(watts) || 0;
  const h = parseFloat(hoursPerDay) || 0;
  const d = parseFloat(days) || 0;
  const r = parseFloat(rate) || 0;

  const kwhTotal = (w * h * d) / 1000;
  const kwhDaily = (w * h) / 1000;
  const totalCost = kwhTotal * r;
  const dailyCost = kwhDaily * r;
  const monthlyCost = kwhDaily * 30 * r;
  const yearlyCost = kwhDaily * 365 * r;

  const currency = lang === 'pt' ? 'R$' : ['it', 'fr', 'de'].includes(lang) ? '€' : '$';

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="electricity-calculator">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {[
            { key: 'watts', value: watts, setter: setWatts, placeholder: '100' },
            { key: 'hoursPerDay', value: hoursPerDay, setter: setHoursPerDay, placeholder: '8' },
            { key: 'days', value: days, setter: setDays, placeholder: '30' },
            { key: 'rate', value: rate, setter: setRate, placeholder: '0.12' },
          ].map(({ key, value, setter, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t(key)}</label>
              <input type="number" value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          ))}

          {w > 0 && h > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('energyUsed')}</span>
                <span className="font-semibold">{kwhTotal.toFixed(2)} kWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('dailyCost')}</span>
                <span className="font-semibold">{currency}{dailyCost.toFixed(2)}</span>
              </div>
              <hr className="border-blue-200" />
              <div className="flex justify-between">
                <span className="text-gray-600">{t('totalCost')} ({d} {labels.days[lang] || 'days'})</span>
                <span className="font-bold text-blue-600 text-lg">{currency}{totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('monthlyCost')}</span>
                <span className="font-semibold">{currency}{monthlyCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('yearlyCost')}</span>
                <span className="font-semibold">{currency}{yearlyCost.toFixed(2)}</span>
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
