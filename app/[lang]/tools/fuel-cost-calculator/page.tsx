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
  costPerKm: { en: 'Cost per km', it: 'Costo al km', es: 'Costo por km', fr: 'Coût par km', de: 'Kosten pro km', pt: 'Custo por km' },
  costPerMile: { en: 'Cost per mile', it: 'Costo per miglio', es: 'Costo por milla', fr: 'Coût par mile', de: 'Kosten pro Meile', pt: 'Custo por milha' },
  reset: { en: 'Reset', it: 'Ripristina', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  copy: { en: 'Copy Result', it: 'Copia Risultato', es: 'Copiar Resultado', fr: 'Copier le Résultat', de: 'Ergebnis kopieren', pt: 'Copiar Resultado' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  historyLabel: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
  invalidDistance: { en: 'Enter a valid distance', it: 'Inserisci una distanza valida', es: 'Ingrese una distancia válida', fr: 'Entrez une distance valide', de: 'Gültige Entfernung eingeben', pt: 'Insira uma distância válida' },
  invalidConsumption: { en: 'Enter a valid consumption', it: 'Inserisci un consumo valido', es: 'Ingrese un consumo válido', fr: 'Entrez une consommation valide', de: 'Gültigen Verbrauch eingeben', pt: 'Insira um consumo válido' },
  invalidPrice: { en: 'Enter a valid price', it: 'Inserisci un prezzo valido', es: 'Ingrese un precio válido', fr: 'Entrez un prix valide', de: 'Gültigen Preis eingeben', pt: 'Insira um preço válido' },
  calculate: { en: 'Calculate', it: 'Calcola', es: 'Calcular', fr: 'Calculer', de: 'Berechnen', pt: 'Calcular' },
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
    title: 'Calcolo Consumo Carburante: Quanto Costa un Viaggio in Auto?',
    paragraphs: [
      '<h2>Calcolo Consumi Carburante: Perche Serve e Come Funziona</h2>Il calcolo consumi carburante e il primo passo per pianificare qualsiasi spostamento in auto senza sorprese. Che tu stia organizzando una vacanza, un viaggio di lavoro o semplicemente il tragitto casa-ufficio, sapere in anticipo quanto spenderai di benzina o diesel ti permette di gestire il budget con precisione. Il prezzo dei carburanti in Italia cambia continuamente, e un calcolo consumo aggiornato ti evita brutte sorprese al distributore. Con il nostro strumento gratuito puoi effettuare il calcolo consumo carburante in pochi secondi: inserisci distanza, consumo medio del veicolo e prezzo al litro, e ottieni subito il costo totale del viaggio.',
      '<h2>Calcolo Consumo Auto: Come Determinare i Litri per 100 km</h2>Per effettuare un calcolo consumo auto accurato devi conoscere il consumo medio della tua vettura espresso in litri per 100 chilometri (L/100km). Se non conosci questo dato, puoi ricavarlo facilmente: fai il pieno completo, annota i chilometri del contachilometri, guida normalmente fino al prossimo rifornimento, poi fai di nuovo il pieno e dividi i litri inseriti per i chilometri percorsi, moltiplicando per 100. Ad esempio, se hai percorso 450 km e hai inserito 32 litri, il consumo e (32 / 450) x 100 = 7,1 L/100km. Un\'auto a benzina media consuma tra 6 e 9 L/100km, mentre i diesel si attestano sui 5-7 L/100km. I SUV possono raggiungere 10-13 L/100km, le ibride scendono a 3-5 L/100km.',
      '<h2>Calcolo Consumo Benzina vs Diesel vs GPL</h2>Il tipo di carburante influisce notevolmente sul costo finale. La benzina in Italia costa mediamente 1,75-1,85 euro al litro, il diesel 1,65-1,75 euro, mentre il GPL si aggira su 0,70-0,80 euro al litro. Questo significa che un viaggio di 500 km con un\'auto a benzina che consuma 7 L/100km costa circa 61-65 euro, mentre la stessa distanza con un\'auto a GPL (10 L/100km di consumo GPL) costa solo 35-40 euro. Il nostro calcolatore ti aiuta a confrontare queste opzioni istantaneamente, permettendoti di valutare il risparmio reale tra i diversi carburanti.',
      '<h3>Come Calcolare i Km Orari e Ottimizzare il Consumo</h3>La velocita di crociera e direttamente collegata al consumo. Viaggiare a 110 km/h invece che a 130 km/h puo ridurre il consumo del 15-20%. Se hai bisogno di <a href="/it/tools/speed-calculator">calcolare la velocita media</a> del tuo tragitto, il nostro calcolatore di velocita e a tua disposizione. Per il calcolo consumo carburante piu preciso, considera anche il tipo di percorso: in citta il consumo aumenta del 30-50% rispetto all\'autostrada a causa delle continue frenate e ripartenze. Puoi anche usare il nostro <a href="/it/tools/unit-converter">convertitore di unita</a> per confrontare consumi in sistemi di misura diversi, oppure il <a href="/it/tools/discount-calculator">calcolatore di sconti</a> per valutare le offerte sui carburanti.',
      '<h3>Tabella Costi Carburante 2026: Quanto Costa un Viaggio in Auto?</h3>Per aiutarti a pianificare la spesa carburante, ecco una stima dei costi medi in Italia per distanze tipiche con un\'auto a benzina (7 L/100km, prezzo medio 1,80 euro/litro): Roma-Milano (570 km) costa circa 72 euro, Roma-Napoli (225 km) circa 28 euro, Milano-Venezia (270 km) circa 34 euro, Torino-Firenze (420 km) circa 53 euro. Per i viaggi piu lunghi come Roma-Palermo (930 km) il costo sale a circa 117 euro di sola benzina. Questi valori possono variare in base al traffico, al tipo di strada e alle abitudini di guida. Il calcolo costo benzina al km e fondamentale anche per chi usa l\'auto per lavoro e deve rendicontare le spese di trasferta. Il nostro strumento gratuito ti permette di calcolare il costo esatto inserendo i dati reali del tuo veicolo. Se devi pianificare un budget completo per il viaggio, prova anche il nostro <a href="/it/tools/percentage-calculator">calcolatore percentuale</a> per stimare pedaggi e soste, oppure il <a href="/it/tools/currency-converter">convertitore valuta</a> se viaggi all\'estero.',
      '<h3>Auto Elettrica vs Benzina: Confronto Costi al KM 2026</h3>Con la crescente diffusione dei veicoli elettrici in Italia, il confronto tra costo benzina e costo ricarica elettrica e diventato essenziale per chi valuta il prossimo acquisto auto. Un\'auto elettrica consuma mediamente 15-20 kWh per 100 km. Con la tariffa domestica media di 0,25 euro/kWh, il costo per 100 km e di appena 3,75-5,00 euro, contro i 12-16 euro di un\'auto a benzina (7 L/100km a 1,80 euro/litro). Il risparmio per km e del 65-75%. Su un percorso casa-lavoro di 30 km al giorno (circa 7.500 km/anno), la differenza annua supera i 700-900 euro a favore dell\'elettrico. La ricarica a colonnina pubblica rapida costa 0,45-0,65 euro/kWh, riducendo il vantaggio economico, ma la ricarica domestica notturna con tariffa bi-oraria scende fino a 0,12-0,15 euro/kWh. Per chi percorre meno di 10.000 km/anno, il risparmio annuo potrebbe non ammortizzare il maggior costo d\'acquisto dell\'elettrico nei primi 5 anni. L\'auto ibrida plug-in (PHEV) rappresenta la soluzione intermedia: percorsi brevi in elettrico (40-80 km), lunghi tragitti a benzina. Usa il calcolatore sopra per simulare entrambi gli scenari e scopri quando conviene l\'elettrico rispetto alla tua auto attuale. Per stimare i risparmi accumulati negli anni, usa anche il <a href="/it/tools/compound-interest-calculator">calcolatore di interessi composti</a>. Se gestisci una flotta aziendale o devi rendicontare note spese di trasferta, <a href="https://parseflow.dev" target="_blank" rel="noopener noreferrer">ParseFlow</a> automatizza l\'estrazione dati da ricevute e documenti di rimborso carburante.',
    ],
    faq: [
      { q: 'Come si fa il calcolo consumi carburante?', a: 'Per il calcolo consumi carburante servono tre dati: la distanza in km, il consumo del veicolo in L/100km e il prezzo del carburante al litro. La formula e: (distanza x consumo / 100) x prezzo. Esempio: un viaggio di 300 km con consumo 7 L/100km e benzina a 1,80 euro/litro costa (300 x 7 / 100) x 1,80 = 37,80 euro.' },
      { q: 'Come calcolare il consumo auto reale?', a: 'Per il calcolo consumo auto reale, fai il pieno completo e segna i km del contachilometri. Al prossimo rifornimento, fai di nuovo il pieno e annota i litri inseriti. Dividi i litri per i km percorsi e moltiplica per 100. Esempio: 35 litri per 500 km = (35/500) x 100 = 7 L/100km. Ripeti per 3-4 pieni per avere una media affidabile.' },
      { q: 'Qual e il consumo medio di benzina di un\'auto?', a: 'Il consumo medio di benzina per un\'auto moderna e di 6-9 L/100km. Le city car consumano 5-6 L/100km, le berline medie 6-8 L/100km, i SUV 9-13 L/100km. Le auto ibride raggiungono 3-5 L/100km. Il consumo reale puo variare del 10-20% rispetto ai dati dichiarati dal costruttore, a seconda dello stile di guida e del percorso.' },
      { q: 'Come calcolare i km orari per stimare i tempi di viaggio?', a: 'Per calcolare i km orari medi di un tragitto, dividi la distanza totale in km per il tempo impiegato in ore. Se percorri 350 km in 4 ore, la velocita media e 87,5 km/h. Conoscere la velocita media ti aiuta anche a stimare il consumo: a velocita costante di 90-110 km/h in autostrada il consumo e ottimale, mentre sopra i 130 km/h aumenta esponenzialmente.' },
      { q: 'Quanto costa un viaggio in auto di 1000 km in Italia?', a: 'Un viaggio di 1000 km in Italia con un\'auto a benzina che consuma 7 L/100km costa circa 126 euro di solo carburante (a 1,80 euro/litro). Aggiungendo i pedaggi autostradali (circa 70-80 euro per 1000 km) il totale sale a 196-206 euro. Con un\'auto diesel (6 L/100km a 1,70 euro/litro) il costo carburante scende a 102 euro. Dividendo i costi tra piu passeggeri, guidare diventa molto conveniente rispetto al treno o all\'aereo.' },
    ],
  },
  es: {
    title: 'Calculadora de Costo de Combustible: Cuanto Cuesta un Viaje en Coche',
    paragraphs: [
      '<h2>Calculadora de Gasolina: Por Que Calcular el Costo del Combustible</h2>Planificar un viaje por carretera o el desplazamiento diario al trabajo requiere conocer de antemano cuanto gastaras en combustible. El precio de la gasolina y el diesel fluctua constantemente en Espana y Latinoamerica, y un calculo preciso te evita sorpresas en la gasolinera. Los gastos de combustible dependen de tres factores principales: la distancia total del trayecto, el consumo medio de tu vehiculo (expresado en litros por 100 km o millas por galon), y el precio actual del carburante en tu zona. Nuestra calculadora gratuita te permite obtener el costo exacto en segundos, tanto para viajes cortos como para rutas de larga distancia.',
      '<h2>Como Calcular el Consumo de tu Coche en Litros por 100 km</h2>Para usar la calculadora necesitas conocer el consumo real de tu vehiculo. Si no lo sabes, puedes calcularlo facilmente: llena el deposito completo, anota los kilometros del cuentakilometros, conduce normalmente hasta el proximo repostaje, vuelve a llenar y divide los litros echados entre los kilometros recorridos, multiplicando por 100. Ejemplo: si recorriste 480 km y echaste 34 litros, el consumo es (34 / 480) x 100 = 7,08 L/100km. Los coches de gasolina medios consumen entre 6 y 9 L/100km, los diesel entre 5 y 7 L/100km, los SUV entre 9 y 13 L/100km, y los hibridos entre 3 y 5 L/100km.',
      '<h2>Gasolina vs Diesel vs GLP: Comparativa de Costos 2026</h2>El tipo de combustible afecta significativamente el costo final del viaje. En Espana, la gasolina 95 cuesta aproximadamente 1,55-1,65 euros/litro, el diesel 1,45-1,55 euros/litro, y el GLP (autogas) apenas 0,70-0,80 euros/litro. Un viaje Madrid-Barcelona (620 km) con un coche de gasolina que consume 7 L/100km cuesta unos 67-72 euros de combustible, mientras que con un coche a GLP (10 L/100km de consumo) el costo baja a 43-50 euros. En Latinoamerica los precios varian enormemente: Mexico tiene gasolina a unos 22-25 pesos/litro (1,10-1,25 USD), Argentina a precios subsidiados variables, y Colombia alrededor de 13.000-15.000 pesos/litro. Nuestra calculadora te permite comparar estos escenarios al instante.',
      '<h3>Velocidad y Consumo: Como Optimizar el Gasto de Combustible</h3>La velocidad de crucero tiene un impacto directo en el consumo. Conducir a 110 km/h en lugar de 130 km/h puede reducir el consumo un 15-20%. En ciudad, las frenadas y arranques constantes aumentan el consumo un 30-50% respecto a autopista. Si necesitas <a href="/es/tools/speed-calculator">calcular la velocidad media</a> de tu trayecto, nuestra herramienta esta disponible. Para convertir entre sistemas de medida puedes usar el <a href="/es/tools/unit-converter">conversor de unidades</a>, y para calcular el presupuesto completo del viaje incluyendo peajes y gastos, prueba nuestra <a href="/es/tools/percentage-calculator">calculadora de porcentajes</a>.',
      '<h3>Tabla de Costos de Viaje 2026 en Espana</h3>Para ayudarte a planificar, estos son los costos estimados de combustible para rutas populares con un coche de gasolina (7 L/100km, precio medio 1,60 euros/litro): Madrid-Barcelona (620 km) cuesta unos 69 euros, Madrid-Sevilla (530 km) unos 59 euros, Barcelona-Valencia (350 km) unos 39 euros, Madrid-Malaga (530 km) unos 59 euros. Para viajes internacionales como Madrid-Paris (1.270 km) el costo sube a unos 142 euros de gasolina. Si viajas con mas de un pasajero, dividir gastos convierte el coche en la opcion mas economica frente al AVE o vuelos low-cost.',
      '<h3>Coche Electrico vs Gasolina: Comparativa de Costos por Km 2026</h3>Con el auge de los coches electricos en Espana y Latinoamerica, comparar el costo por kilometro es fundamental. Un coche electrico consume unos 15-18 kWh por 100 km. Con la tarifa domestica media en Espana de 0,15-0,20 euros/kWh (tarifa nocturna), el costo por 100 km es de apenas 2,25-3,60 euros, frente a los 11-12 euros de un coche de gasolina. El ahorro anual para 10.000 km supera los 700-900 euros. Sin embargo, la recarga rapida en electrolineras publicas cuesta 0,40-0,60 euros/kWh, reduciendo la ventaja. Para estimar tus ahorros a largo plazo usa nuestro <a href="/es/tools/compound-interest-calculator">calculador de interes compuesto</a>. Si gestionas gastos de flota empresarial o necesitas extraer datos de facturas de combustible, <a href="https://parseflow.dev" target="_blank" rel="noopener noreferrer">ParseFlow</a> automatiza el proceso de digitalizacion de recibos y notas de gasto.',
    ],
    faq: [
      { q: 'Como calculo el costo de combustible por kilometro?', a: 'Multiplica el consumo (L/100km) por el precio por litro y divide entre 100. Ejemplo: 7 L/100km a 1,60 euros/litro: (7 x 1,60) / 100 = 0,112 euros por km. Para un viaje de 300 km, el costo seria 300 x 0,112 = 33,60 euros.' },
      { q: 'Como convierto MPG a L/100km?', a: 'Divide 235,214 entre el valor MPG. Ejemplo: 30 MPG = 235,214 / 30 = 7,84 L/100km. Para galones imperiales (UK), divide 282,481 entre el MPG. Esto es util si consultas especificaciones de coches americanos o britanicos.' },
      { q: 'Cual es el consumo medio de un coche en Espana?', a: 'Un coche moderno tipico consume 6-9 L/100km de gasolina. Los SUV 9-13 L/100km. Los diesel 5-7 L/100km. Los hibridos 3-5 L/100km. Los coches urbanos pequenos (Seat Ibiza, VW Polo) alcanzan 5-6 L/100km. El consumo real suele ser un 10-20% mayor que el declarado por el fabricante.' },
      { q: 'Es mas barato conducir o tomar el AVE para viajes largos?', a: 'Para un viajero solo, el AVE Madrid-Barcelona cuesta 30-80 euros frente a 69 euros de gasolina mas 40-50 euros de peajes (total 110-120 euros en coche). Pero con 2-3 pasajeros compartiendo gastos, el coche sale mas barato: 37-40 euros por persona frente a 30-80 del tren, con la ventaja de puerta a puerta.' },
      { q: 'Como puedo reducir el consumo de mi coche?', a: 'Mantén velocidad constante (usar cruise control), evita aceleraciones bruscas, mantén los neumaticos a la presion correcta (revisar cada 2 semanas), retira portaequipajes y cofres cuando no los uses (reducen aerodinamica), no lleves peso innecesario en el maletero, y haz el mantenimiento regular del motor. Estas practicas pueden reducir el consumo un 15-25%.' },
    ],
  },
  fr: {
    title: 'Calcul Cout Carburant : Combien Coute un Trajet en Voiture ?',
    paragraphs: [
      '<h2>Calcul Consommation Carburant : Pourquoi et Comment Ca Marche</h2>Le calcul consommation carburant est la premiere etape pour planifier n\'importe quel deplacement en voiture sans mauvaise surprise. Que vous organisiez des vacances, un voyage professionnel ou simplement le trajet domicile-travail, connaitre a l\'avance votre depense en essence ou gazole vous permet de gerer votre budget avec precision. Le prix des carburants en France evolue constamment : en mars 2026, le sans-plomb 95 (SP95) coute en moyenne 1,75-1,85 euro le litre, le gazole (diesel) entre 1,65-1,75 euro le litre, et le GPL autour de 0,95-1,05 euro le litre. Avec notre outil gratuit, vous pouvez effectuer le calcul cout carburant en quelques secondes : entrez la distance, la consommation moyenne de votre vehicule et le prix au litre, et obtenez immediatement le cout total du trajet.',
      '<h2>Calcul Consommation Voiture : Comment Determiner les Litres aux 100 km</h2>Pour effectuer un calcul consommation voiture precis, vous devez connaitre la consommation moyenne de votre vehicule exprimee en litres aux 100 kilometres (L/100km). Si vous ne connaissez pas ce chiffre, vous pouvez le calculer facilement : faites le plein complet, notez les kilometres au compteur, roulez normalement jusqu\'au prochain ravitaillement, refaites le plein et divisez les litres introduits par les kilometres parcourus, en multipliant par 100. Par exemple, si vous avez parcouru 480 km et mis 35 litres, la consommation est (35 / 480) x 100 = 7,3 L/100km. En France, une voiture essence moyenne consomme entre 6 et 9 L/100km, un diesel entre 5 et 7 L/100km. Les SUV peuvent atteindre 10-13 L/100km, tandis que les hybrides descendent a 3-5 L/100km. Les citadines comme la Renault Clio ou la Peugeot 208 atteignent 5-6 L/100km en conduite mixte.',
      '<h2>Essence vs Gazole vs GPL : Comparatif des Couts 2026 en France</h2>Le type de carburant influence considerablement le cout final de votre trajet. Le SP95 coute en moyenne 1,80 euro/litre, le gazole 1,70 euro/litre, le SP95-E10 environ 1,72 euro/litre et le GPL autour de 1,00 euro/litre. Pour un trajet de 500 km avec une voiture essence consommant 7 L/100km, le cout est d\'environ 63 euros, contre 59 euros en diesel (6 L/100km) et seulement 50 euros en GPL (10 L/100km). Le superethanol E85, de plus en plus repandu en France (environ 3.500 stations equipees), coute seulement 0,70-0,85 euro/litre et peut reduire la facture carburant de 40-50% pour les vehicules equipes d\'un boitier de conversion. Notre calculateur vous aide a comparer ces options instantanement et a evaluer l\'economie reelle entre les differents carburants.',
      '<h3>Vitesse et Consommation : Comment Optimiser Vos Depenses Carburant</h3>La vitesse de croisiere est directement liee a la consommation. Rouler a 110 km/h au lieu de 130 km/h sur autoroute peut reduire la consommation de 15-20%, ce qui represente une economie significative sur les longs trajets. En ville, les freinages et redemarrages constants augmentent la consommation de 30-50% par rapport a l\'autoroute. La conduite eco-responsable (acceleration douce, anticipation des freinages, utilisation du frein moteur) peut faire economiser jusqu\'a 20% de carburant. Si vous avez besoin de <a href="/fr/tools/speed-calculator">calculer la vitesse moyenne</a> de votre trajet, notre outil est a votre disposition. Pour convertir entre systemes de mesure, utilisez notre <a href="/fr/tools/unit-converter">convertisseur d\'unites</a>, et pour calculer le budget complet du voyage incluant peages et depenses, essayez notre <a href="/fr/tools/percentage-calculator">calculateur de pourcentages</a>.',
      '<h3>Tableau des Couts Carburant 2026 : Combien Coute un Trajet en France ?</h3>Pour vous aider a planifier vos depenses carburant, voici une estimation des couts moyens en France pour des trajets populaires avec une voiture essence (7 L/100km, prix moyen 1,80 euro/litre) : Paris-Lyon (465 km) coute environ 58 euros, Paris-Marseille (775 km) environ 97 euros, Paris-Bordeaux (585 km) environ 73 euros, Lyon-Nice (470 km) environ 59 euros, Lille-Toulouse (845 km) environ 106 euros. Pour les trajets internationaux comme Paris-Bruxelles (310 km) comptez 39 euros, et Paris-Barcelone (1.035 km) environ 130 euros de carburant. A ces couts, ajoutez les peages autoroutiers qui representent en France environ 7-9 centimes par kilometre sur autoroute. Avec 2 passagers ou plus, la voiture devient souvent plus economique que le TGV ou les vols low-cost. Si vous voyagez a l\'etranger, utilisez notre <a href="/fr/tools/currency-converter">convertisseur de devises</a> pour adapter le budget.',
      '<h3>Voiture Electrique vs Essence : Comparatif des Couts au Km 2026</h3>Avec la croissance rapide du marche electrique en France (plus de 500.000 voitures electriques immatriculees fin 2025), comparer le cout au kilometre est devenu essentiel. Un vehicule electrique consomme en moyenne 15-18 kWh aux 100 km. Avec le tarif domestique moyen EDF de 0,25 euro/kWh (tarif reglemente), le cout pour 100 km est de seulement 3,75-4,50 euros, contre 12-13 euros pour une voiture essence (7 L/100km a 1,80 euro/litre). Le gain est de 65-70% par kilometre. Sur un trajet domicile-travail de 30 km par jour (environ 7.500 km/an), l\'economie annuelle depasse 600-800 euros en faveur de l\'electrique. La recharge sur borne publique rapide coute 0,40-0,65 euro/kWh (reseau Ionity, Total, Fastned), ce qui reduit l\'avantage. Mais la recharge a domicile en heures creuses (0,15-0,18 euro/kWh) est ultra-competitrice. L\'hybride rechargeable (PHEV) offre un compromis : trajets courts en electrique (40-80 km), longs parcours en thermique. Pour estimer les economies cumulees sur plusieurs annees, utilisez notre <a href="/fr/tools/compound-interest-calculator">calculateur d\'interets composes</a>. Si vous gerez une flotte professionnelle ou devez traiter des notes de frais de deplacement, <a href="https://parseflow.dev" target="_blank" rel="noopener noreferrer">ParseFlow</a> automatise l\'extraction de donnees a partir de reçus et justificatifs de carburant.',
    ],
    faq: [
      { q: 'Comment faire le calcul consommation carburant ?', a: 'Pour le calcul consommation carburant, il faut trois donnees : la distance en km, la consommation du vehicule en L/100km et le prix du carburant au litre. La formule est : (distance x consommation / 100) x prix. Exemple : un trajet de 300 km avec une consommation de 7 L/100km et de l\'essence a 1,80 euro/litre coute (300 x 7 / 100) x 1,80 = 37,80 euros.' },
      { q: 'Comment calculer la consommation reelle de ma voiture ?', a: 'Faites le plein complet et notez les km au compteur. Au prochain ravitaillement, refaites le plein et notez les litres. Divisez les litres par les km parcourus et multipliez par 100. Exemple : 36 litres pour 500 km = (36/500) x 100 = 7,2 L/100km. Repetez sur 3-4 pleins pour une moyenne fiable. L\'ordinateur de bord donne aussi une estimation, mais elle est souvent optimiste de 5-10%.' },
      { q: 'Quelle est la consommation moyenne d\'une voiture en France ?', a: 'La consommation moyenne d\'une voiture en France est de 6-9 L/100km en essence. Les citadines (Clio, 208, C3) consomment 5-6 L/100km, les berlines (308, Megane) 6-8 L/100km, les SUV (3008, Arkana) 7-10 L/100km. En diesel, les chiffres baissent de 1-2 L/100km. Les hybrides comme la Toyota Yaris Cross atteignent 3-5 L/100km. La consommation reelle est generalement 10-20% superieure aux chiffres constructeur.' },
      { q: 'Combien coute un trajet Paris-Marseille en voiture en 2026 ?', a: 'Un Paris-Marseille (775 km) coute environ 97 euros de carburant avec une voiture essence (7 L/100km a 1,80 euro/litre). Ajoutez environ 70-75 euros de peages autoroutiers (A6+A7), soit un total d\'environ 167-172 euros. En diesel (6 L/100km a 1,70 euro), le carburant descend a 79 euros. Avec 2 passagers partageant les frais, cela revient a 84-86 euros par personne, souvent comparable ou moins cher qu\'un billet TGV (50-120 euros).' },
      { q: 'Comment reduire ma consommation de carburant ?', a: 'Maintenez une vitesse constante (utilisez le regulateur de vitesse), evitez les accelerations brusques, verifiez la pression des pneus toutes les 2 semaines (des pneus sous-gonfles de 0,5 bar augmentent la consommation de 2-3%), retirez les barres de toit et coffres de toit quand inutilises (ils augmentent la resistance aerodynamique de 10-20%), ne transportez pas de poids inutile dans le coffre, et faites l\'entretien regulier du moteur (filtre a air, bougies). Ces pratiques peuvent reduire la consommation de 15-25%.' },
    ],
  },
  de: {
    title: 'Spritkostenrechner: Was Kostet eine Autofahrt in Deutschland?',
    paragraphs: [
      '<h2>Spritkosten Berechnen: Warum und Wie Es Funktioniert</h2>Die Berechnung der Spritkosten ist der erste Schritt, um jede Autofahrt ohne boese Ueberraschungen zu planen. Ob Sie einen Urlaub organisieren, eine Geschaeftsreise planen oder einfach den taeglichen Arbeitsweg kalkulieren moechten — wenn Sie im Voraus wissen, was Benzin oder Diesel kosten, koennen Sie Ihr Budget praezise verwalten. Die Kraftstoffpreise in Deutschland schwanken staendig: Im Maerz 2026 kostet Super E10 durchschnittlich 1,70-1,80 Euro pro Liter, Super E5 etwa 1,75-1,85 Euro, Diesel zwischen 1,60-1,70 Euro und Autogas (LPG) rund 0,75-0,85 Euro pro Liter. Mit unserem kostenlosen Spritkostenrechner koennen Sie die Fahrtkosten in wenigen Sekunden ermitteln: Geben Sie die Entfernung, den Durchschnittsverbrauch Ihres Fahrzeugs und den Literpreis ein, und Sie erhalten sofort die Gesamtkosten der Fahrt.',
      '<h2>Verbrauch Berechnen: So Ermitteln Sie den Realen Kraftstoffverbrauch</h2>Fuer eine praezise Spritkostenberechnung muessen Sie den Durchschnittsverbrauch Ihres Fahrzeugs in Litern pro 100 Kilometer (L/100km) kennen. Falls Sie diesen Wert nicht wissen, koennen Sie ihn leicht selbst ermitteln: Tanken Sie voll, notieren Sie den Kilometerstand, fahren Sie normal bis zur naechsten Tankfuellung, tanken Sie erneut voll und teilen Sie die getankten Liter durch die gefahrenen Kilometer, dann multiplizieren Sie mit 100. Beispiel: 480 km gefahren, 34 Liter getankt — der Verbrauch betraegt (34 / 480) x 100 = 7,08 L/100km. In Deutschland verbraucht ein durchschnittlicher Benziner zwischen 6 und 9 L/100km, ein Diesel zwischen 5 und 7 L/100km. SUVs liegen bei 8-13 L/100km, waehrend Hybridfahrzeuge nur 3-5 L/100km benoetigen. Kompaktwagen wie der VW Golf oder der Opel Astra erreichen in der Praxis 6-7 L/100km.',
      '<h2>Benzin vs Diesel vs Autogas: Kostenvergleich 2026 in Deutschland</h2>Der Kraftstofftyp beeinflusst die Fahrtkosten erheblich. Super E10 kostet im Durchschnitt 1,75 Euro/Liter, Super E5 etwa 1,80 Euro/Liter, Diesel 1,65 Euro/Liter und Autogas (LPG) nur 0,80 Euro/Liter. Eine Fahrt von 500 km mit einem Benziner (7 L/100km) kostet rund 61 Euro, mit einem Diesel (6 L/100km) etwa 50 Euro und mit Autogas (10 L/100km) nur 40 Euro. In Deutschland gibt es ausserdem rund 400 Erdgas-Tankstellen (CNG): Erdgas kostet etwa 1,30-1,50 Euro/kg, und ein CNG-Fahrzeug verbraucht ca. 3,5-4,5 kg/100km, was die Kosten auf 45-68 Euro pro 1.000 km senkt. Unser Rechner hilft Ihnen, diese Optionen sofort zu vergleichen und die reale Ersparnis zwischen verschiedenen Kraftstoffen zu bewerten.',
      '<h3>Geschwindigkeit und Verbrauch: So Optimieren Sie Ihre Spritkosten</h3>Die Reisegeschwindigkeit hat einen direkten Einfluss auf den Verbrauch. Auf der Autobahn steigt der Verbrauch ab 120 km/h ueberproportional: Bei 130 km/h verbraucht ein typischer Mittelklassewagen 20-25% mehr als bei 100 km/h. Da Deutschland viele Autobahnabschnitte ohne Tempolimit hat, ist die Versuchung gross, schneller zu fahren — aber jede 10 km/h mehr ueber 100 km/h kosten ca. 10-15% mehr Sprit. Im Stadtverkehr erhoehen staendiges Bremsen und Anfahren den Verbrauch um 30-50% gegenueber der Autobahn. Oekonomisches Fahren (sanftes Beschleunigen, vorausschauendes Bremsen, Motorbremse nutzen) kann bis zu 20% Kraftstoff sparen. Wenn Sie die <a href="/de/tools/speed-calculator">Durchschnittsgeschwindigkeit berechnen</a> moechten, steht Ihnen unser Geschwindigkeitsrechner zur Verfuegung. Fuer Umrechnungen zwischen Masseinheiten nutzen Sie unseren <a href="/de/tools/unit-converter">Einheitenumrechner</a>, und fuer die Gesamtbudgetplanung inklusive Maut und Nebenkosten probieren Sie unseren <a href="/de/tools/percentage-calculator">Prozentrechner</a>.',
      '<h3>Tabelle der Fahrtkosten 2026: Beliebte Strecken in Deutschland</h3>Um Ihre Reise zu planen, finden Sie hier geschaetzte Kraftstoffkosten fuer beliebte Strecken mit einem Benziner (7 L/100km, Durchschnittspreis 1,75 Euro/Liter): Berlin-Muenchen (585 km) kostet etwa 72 Euro, Hamburg-Frankfurt (490 km) etwa 60 Euro, Koeln-Berlin (575 km) etwa 70 Euro, Muenchen-Stuttgart (235 km) etwa 29 Euro, und Duesseldorf-Dresden (575 km) etwa 70 Euro. Fuer internationale Strecken: Berlin-Prag (350 km) kostet ca. 43 Euro, Muenchen-Wien (435 km) ca. 53 Euro, und Hamburg-Amsterdam (465 km) ca. 57 Euro. Anders als in Frankreich oder Italien gibt es auf deutschen Autobahnen keine PKW-Maut (Stand 2026), was die Gesamtkosten deutlich reduziert. Mit 2 oder mehr Insassen wird das Auto oft guenstiger als die Deutsche Bahn (ICE-Tickets: 30-150 Euro pro Person). Wenn Sie ins Ausland fahren, hilft unser <a href="/de/tools/currency-converter">Waehrungsrechner</a> bei der Budgetplanung.',
      '<h3>Elektroauto vs Benziner: Kostenvergleich pro Km 2026</h3>Mit ueber 1,5 Millionen zugelassenen Elektrofahrzeugen in Deutschland (Stand Ende 2025) ist der Kostenvergleich zwischen Strom und Benzin wichtiger denn je. Ein Elektroauto verbraucht durchschnittlich 15-20 kWh pro 100 km. Beim Laden zu Hause mit dem deutschen Durchschnittsstrompreis von 0,35-0,40 Euro/kWh kosten 100 km etwa 5,25-8,00 Euro — gegenueber 12-13 Euro bei einem Benziner (7 L/100km bei 1,75 Euro/Liter). Das entspricht einer Ersparnis von 40-60% pro Kilometer. Auf einem taeglichen Arbeitsweg von 30 km (ca. 7.500 km/Jahr) spart man 300-500 Euro jaehrlich an Kraftstoffkosten. Allerdings ist Schnellladen an oeffentlichen Ladestationen teurer: EnBW, ADAC und Ionity berechnen 0,45-0,79 Euro/kWh, was den Kostenvorteil verringert. Wer zu Hause mit einer Wallbox und Nachtstromtarif (0,25-0,30 Euro/kWh) laedt, maximiert die Ersparnis. Plug-in-Hybride (PHEV) bieten einen Kompromiss: kurze Strecken elektrisch (40-80 km), lange Fahrten mit Verbrennungsmotor. Nutzen Sie den Rechner oben, um beide Szenarien zu simulieren. Um die langfristigen Einsparungen zu berechnen, verwenden Sie unseren <a href="/de/tools/compound-interest-calculator">Zinseszinsrechner</a>. Wenn Sie eine Firmenflotte verwalten oder Reisekostenabrechnungen erstellen muessen, automatisiert <a href="https://parseflow.dev" target="_blank" rel="noopener noreferrer">ParseFlow</a> die Datenextraktion aus Tankbelegen und Erstattungsunterlagen.',
    ],
    faq: [
      { q: 'Wie berechne ich die Spritkosten fuer eine Fahrt?', a: 'Fuer die Spritkostenberechnung brauchen Sie drei Angaben: die Entfernung in km, den Verbrauch des Fahrzeugs in L/100km und den Kraftstoffpreis pro Liter. Die Formel lautet: (Entfernung x Verbrauch / 100) x Preis. Beispiel: Eine Fahrt von 300 km mit 7 L/100km Verbrauch und Benzin zu 1,75 Euro/Liter kostet (300 x 7 / 100) x 1,75 = 36,75 Euro.' },
      { q: 'Wie ermittle ich den realen Verbrauch meines Autos?', a: 'Tanken Sie voll und notieren Sie den Kilometerstand. Beim naechsten Tankstopp tanken Sie wieder voll und notieren die getankten Liter. Teilen Sie die Liter durch die gefahrenen Kilometer und multiplizieren Sie mit 100. Beispiel: 36 Liter fuer 500 km = (36/500) x 100 = 7,2 L/100km. Wiederholen Sie dies ueber 3-4 Tankfuellungen fuer einen zuverlaessigen Durchschnitt. Der Bordcomputer zeigt zwar auch den Verbrauch an, ist aber oft 5-10% zu optimistisch.' },
      { q: 'Was ist der durchschnittliche Benzinverbrauch in Deutschland?', a: 'Der Durchschnittsverbrauch liegt bei 6-9 L/100km fuer Benziner. Kleinwagen (VW Polo, Opel Corsa) verbrauchen 5-6 L/100km, Kompaktklasse (Golf, Focus) 6-8 L/100km, SUVs (Tiguan, X3) 8-12 L/100km. Diesel verbrauchen 1-2 L/100km weniger. Hybride wie der Toyota Yaris Hybrid schaffen 3-5 L/100km. Der tatsaechliche Verbrauch liegt meist 10-20% ueber den Herstellerangaben (WLTP).' },
      { q: 'Was kostet eine Fahrt Berlin-Muenchen mit dem Auto 2026?', a: 'Berlin-Muenchen (585 km) kostet mit einem Benziner (7 L/100km bei 1,75 Euro/Liter) etwa 72 Euro Spritkosten. Da es in Deutschland keine PKW-Autobahnmaut gibt, fallen keine zusaetzlichen Mautgebuehren an. Mit einem Diesel (6 L/100km bei 1,65 Euro) sinken die Kosten auf etwa 58 Euro. Mit 2 Mitfahrern (36 Euro pro Person) ist das deutlich guenstiger als ein ICE-Ticket (50-150 Euro pro Person). Die Fahrt dauert ca. 5,5-6 Stunden.' },
      { q: 'Wie kann ich meinen Kraftstoffverbrauch senken?', a: 'Fahren Sie vorausschauend und mit gleichmaessiger Geschwindigkeit (Tempomat nutzen), vermeiden Sie abruptes Beschleunigen und Bremsen, pruefen Sie den Reifendruck alle 2 Wochen (0,5 bar zu wenig erhoehen den Verbrauch um 2-3%), entfernen Sie Dachtraeger und Dachboxen wenn nicht benoetigt (erhoehen den Luftwiderstand um 10-20%), vermeiden Sie unnoetige Zuladung im Kofferraum, und halten Sie den Wartungsplan ein (Luftfilter, Zuendkerzen, Motoroel). Diese Massnahmen koennen den Verbrauch um 15-25% senken. Auf der Autobahn gilt: Tempo 120 statt 150 spart bis zu 30% Kraftstoff.' },
    ],
  },
  pt: {
    title: 'Calculadora de Custo de Combustivel: Quanto Custa uma Viagem de Carro?',
    paragraphs: [
      '<h2>Calculo de Consumo de Combustivel: Porque e Importante e Como Funciona</h2>O calculo de consumo de combustivel e o primeiro passo para planear qualquer viagem de carro sem surpresas desagradaveis. Seja para organizar ferias, uma viagem de trabalho ou simplesmente o trajeto casa-escritorio, saber antecipadamente quanto vai gastar em gasolina ou gasoleo permite gerir o orcamento com precisao. Os precos dos combustiveis em Portugal variam constantemente: em marco de 2026, a gasolina 95 custa em media 1,70-1,80 euros por litro, o gasoleo entre 1,55-1,65 euros por litro e o GPL auto cerca de 0,75-0,85 euros por litro. No Brasil, a gasolina custa aproximadamente R$ 5,80-6,50 por litro e o etanol R$ 3,50-4,20 por litro. Com a nossa ferramenta gratuita, pode fazer o calculo do custo de combustivel em poucos segundos: introduza a distancia, o consumo medio do veiculo e o preco por litro, e obtenha imediatamente o custo total da viagem.',
      '<h2>Calculo de Consumo do Carro: Como Determinar os Litros por 100 km</h2>Para fazer um calculo de consumo do carro preciso, precisa de conhecer o consumo medio do seu veiculo expresso em litros por 100 quilometros (L/100km). Se nao conhece este valor, pode calcula-lo facilmente: encha o deposito completo, anote os quilometros do conta-quilometros, conduza normalmente ate ao proximo abastecimento, volte a encher e divida os litros introduzidos pelos quilometros percorridos, multiplicando por 100. Por exemplo, se percorreu 460 km e abasteceu 33 litros, o consumo e (33 / 460) x 100 = 7,17 L/100km. Em Portugal, um carro a gasolina medio consome entre 6 e 9 L/100km, um a gasoleo entre 5 e 7 L/100km. Os SUVs podem atingir 9-13 L/100km, enquanto os hibridos descem para 3-5 L/100km. Modelos populares em Portugal como o Renault Clio ou o Peugeot 208 atingem 5-6 L/100km em conducao mista. No Brasil, onde predominam motores flex, o consumo com gasolina e de 8-12 km/l (8-12,5 L/100km) e com etanol de 6-9 km/l.',
      '<h2>Gasolina vs Gasoleo vs GPL: Comparativo de Custos 2026</h2>O tipo de combustivel influencia significativamente o custo final da viagem. Em Portugal, a gasolina 95 custa em media 1,75 euros/litro, o gasoleo simples 1,60 euros/litro e o GPL auto cerca de 0,80 euros/litro. Para uma viagem de 500 km com um carro a gasolina que consome 7 L/100km, o custo e de aproximadamente 61 euros, contra 56 euros a gasoleo (6 L/100km) e apenas 40 euros a GPL (10 L/100km). No Brasil, a mesma viagem de 500 km com gasolina (10 L/100km a R$ 6,00/litro) custa cerca de R$ 300, enquanto com etanol (13 L/100km a R$ 3,80/litro) custa R$ 247 — uma poupanca de 18%. A regra pratica no Brasil e: se o preco do etanol for inferior a 70% do preco da gasolina, compensa abastecer com etanol. A nossa calculadora permite comparar estes cenarios instantaneamente.',
      '<h3>Velocidade e Consumo: Como Otimizar os Gastos com Combustivel</h3>A velocidade de cruzeiro tem impacto direto no consumo. Conduzir a 100 km/h em vez de 120 km/h na autoestrada pode reduzir o consumo em 15-20%, o que representa uma poupanca significativa em viagens longas. Na cidade, as travagens e arranques constantes aumentam o consumo em 30-50% em comparacao com a autoestrada. A conducao eficiente (aceleracao suave, antecipacao das travagens, utilizacao da travagem de motor) pode poupar ate 20% de combustivel. Se precisar de <a href="/pt/tools/speed-calculator">calcular a velocidade media</a> do seu trajeto, a nossa ferramenta esta disponivel. Para converter entre sistemas de medida, use o nosso <a href="/pt/tools/unit-converter">conversor de unidades</a>, e para calcular o orcamento completo da viagem incluindo portagens e despesas, experimente a nossa <a href="/pt/tools/percentage-calculator">calculadora de percentagens</a>.',
      '<h3>Tabela de Custos de Viagem 2026: Trajetos Populares</h3>Para ajuda-lo a planear as despesas com combustivel, apresentamos uma estimativa dos custos medios para trajetos populares com um carro a gasolina (7 L/100km, preco medio 1,75 euros/litro): Lisboa-Porto (310 km) custa cerca de 38 euros, Lisboa-Faro (280 km) cerca de 34 euros, Porto-Coimbra (120 km) cerca de 15 euros, Lisboa-Evora (135 km) cerca de 17 euros, e Porto-Braga (55 km) cerca de 7 euros. Para viagens internacionais: Lisboa-Madrid (625 km) custa aproximadamente 77 euros, e Lisboa-Sevilha (460 km) cerca de 56 euros. Em Portugal, as portagens representam um custo adicional significativo: a viagem Lisboa-Porto pela A1 custa cerca de 22-25 euros em portagens, o que eleva o custo total para 60-63 euros. No Brasil, trajetos populares: Sao Paulo-Rio de Janeiro (430 km) custa cerca de R$ 258 em gasolina, Belo Horizonte-Sao Paulo (585 km) cerca de R$ 351, e Curitiba-Florianopolis (300 km) cerca de R$ 180. Se viajar ao estrangeiro, use o nosso <a href="/pt/tools/currency-converter">conversor de moedas</a> para adaptar o orcamento.',
      '<h3>Carro Eletrico vs Gasolina: Comparativo de Custos por Km 2026</h3>Com o crescimento rapido dos veiculos eletricos em Portugal (mais de 80.000 carros eletricos registados ate 2025) e no Brasil (mercado em forte expansao), comparar o custo por quilometro tornou-se essencial. Um carro eletrico consome em media 15-18 kWh por 100 km. Em Portugal, com a tarifa domestica media de 0,18-0,22 euros/kWh (tarifa bi-horaria noturna), o custo por 100 km e de apenas 2,70-3,96 euros, contra 12-13 euros de um carro a gasolina (7 L/100km a 1,75 euros/litro). A poupanca e de 65-75% por quilometro. Num trajeto casa-trabalho de 30 km por dia (cerca de 7.500 km/ano), a diferenca anual ultrapassa 600-750 euros a favor do eletrico. O carregamento em postos publicos rapidos (rede Mobi.E, Galp Electric) custa 0,30-0,50 euros/kWh, reduzindo a vantagem. No Brasil, com tarifa domestica media de R$ 0,70-0,90/kWh, os 100 km eletricos custam R$ 10,50-16,20, contra R$ 60 em gasolina — uma reducao de 73-82%. O hibrido plug-in (PHEV) e uma solucao intermedia: trajetos curtos em eletrico (40-80 km), viagens longas a combustao. Use a calculadora acima para simular ambos os cenarios. Para estimar as poupancas acumuladas ao longo dos anos, utilize a nossa <a href="/pt/tools/compound-interest-calculator">calculadora de juros compostos</a>. Se gere uma frota empresarial ou precisa de processar notas de despesas de deslocacao, o <a href="https://parseflow.dev" target="_blank" rel="noopener noreferrer">ParseFlow</a> automatiza a extracao de dados de recibos e comprovativos de combustivel.',
    ],
    faq: [
      { q: 'Como fazer o calculo de consumo de combustivel?', a: 'Para o calculo de consumo de combustivel precisa de tres dados: a distancia em km, o consumo do veiculo em L/100km e o preco do combustivel por litro. A formula e: (distancia x consumo / 100) x preco. Exemplo: uma viagem de 300 km com consumo de 7 L/100km e gasolina a 1,75 euros/litro custa (300 x 7 / 100) x 1,75 = 36,75 euros.' },
      { q: 'Como calcular o consumo real do meu carro?', a: 'Encha o deposito completo e anote os km do conta-quilometros. No proximo abastecimento, volte a encher e anote os litros. Divida os litros pelos km percorridos e multiplique por 100. Exemplo: 34 litros para 480 km = (34/480) x 100 = 7,08 L/100km. Repita durante 3-4 abastecimentos para ter uma media fiavel. O computador de bordo tambem mostra o consumo, mas tende a ser 5-10% mais otimista que a realidade.' },
      { q: 'Qual e o consumo medio de um carro em Portugal?', a: 'O consumo medio de um carro moderno em Portugal e de 6-9 L/100km a gasolina. Os citadinos (Clio, 208, Ibiza) consomem 5-6 L/100km, as berlinas medias (Megane, 308) 6-8 L/100km, os SUVs (Captur, 3008, Tucson) 7-10 L/100km. A gasoleo, os valores sao 1-2 L/100km inferiores. Os hibridos como o Toyota Yaris Cross atingem 3-5 L/100km. O consumo real e geralmente 10-20% superior aos dados do fabricante (WLTP).' },
      { q: 'Quanto custa uma viagem Lisboa-Porto de carro em 2026?', a: 'Uma viagem Lisboa-Porto (310 km pela A1) custa cerca de 38 euros em combustivel com um carro a gasolina (7 L/100km a 1,75 euros/litro). Acrescente cerca de 22-25 euros de portagens, totalizando 60-63 euros. A gasoleo (6 L/100km a 1,60 euros), o combustivel desce para 30 euros (total 52-55 euros com portagens). Com 2 passageiros a dividir custos (26-32 euros por pessoa), o carro e competitivo com o comboio Alfa Pendular (25-35 euros por pessoa), com a vantagem da flexibilidade porta-a-porta.' },
      { q: 'Como posso reduzir o consumo de combustivel?', a: 'Mantenha uma velocidade constante (use o cruise control), evite aceleracoes bruscas, verifique a pressao dos pneus a cada 2 semanas (pneus com menos 0,5 bar aumentam o consumo em 2-3%), retire as barras de tejadilho e malas de tejadilho quando nao estao em uso (aumentam a resistencia aerodinamica em 10-20%), nao transporte peso desnecessario na bagageira, e cumpra o plano de manutencao (filtro de ar, velas, oleo). Estas medidas podem reduzir o consumo em 15-25%. Na autoestrada, 100 km/h em vez de 120 km/h pode poupar ate 20% de combustivel.' },
    ],
  },
};

export default function FuelCostCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['fuel-cost-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [mode, setMode] = useState<'metric' | 'imperial'>('metric');
  const [distance, setDistance] = useState('100');
  const [consumption, setConsumption] = useState('7');
  const [fuelPrice, setFuelPrice] = useState('1.80');
  const [roundTrip, setRoundTrip] = useState(false);
  const [calculated, setCalculated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<{ dist: number; fuel: number; cost: number; unit: string }[]>([]);

  const switchMode = (newMode: 'metric' | 'imperial') => {
    setMode(newMode);
    setCalculated(false);
    if (newMode === 'metric') {
      setConsumption('7');
      setFuelPrice('1.80');
    } else {
      setConsumption('35');
      setFuelPrice('3.50');
    }
  };

  const handleReset = () => {
    setDistance('100');
    setConsumption(mode === 'metric' ? '7' : '35');
    setFuelPrice(mode === 'metric' ? '1.80' : '3.50');
    setRoundTrip(false);
    setCalculated(false);
    setCopied(false);
    setErrors({});
  };

  const handleCalculate = () => {
    const newErrors: Record<string, string> = {};
    const d = parseFloat(distance);
    const c = parseFloat(consumption);
    const p = parseFloat(fuelPrice);

    if (isNaN(d) || d <= 0) newErrors.distance = t('invalidDistance');
    if (isNaN(c) || c <= 0) newErrors.consumption = t('invalidConsumption');
    if (isNaN(p) || p <= 0) newErrors.price = t('invalidPrice');

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) { setCalculated(false); return; }

    setCalculated(true);

    const totalDist = d * (roundTrip ? 2 : 1);
    let fuel = 0;
    if (mode === 'metric') {
      fuel = (totalDist * c) / 100;
    } else {
      fuel = totalDist / c;
    }
    const cost = fuel * p;
    const unit = mode === 'metric' ? 'km' : 'mi';
    setHistory(prev => [{ dist: totalDist, fuel, cost, unit }, ...prev].slice(0, 5));
  };

  const dist = (parseFloat(distance) || 0) * (roundTrip ? 2 : 1);
  const cons = parseFloat(consumption) || 0;
  const price = parseFloat(fuelPrice) || 0;

  let fuelUsed = 0;
  let tripCost = 0;
  let costPerUnit = 0;

  if (mode === 'metric') {
    fuelUsed = (dist * cons) / 100;
    tripCost = fuelUsed * price;
    costPerUnit = dist > 0 ? tripCost / dist : 0;
  } else {
    fuelUsed = cons > 0 ? dist / cons : 0;
    tripCost = fuelUsed * price;
    costPerUnit = dist > 0 ? tripCost / dist : 0;
  }

  const copyResults = () => {
    if (!calculated) return;
    const text = `${t('distance')}: ${dist.toFixed(1)} ${mode === 'metric' ? t('km') : t('miles')}\n${t('fuelUsed')}: ${fuelUsed.toFixed(2)} ${mode === 'metric' ? t('liters') : t('gallons')}\n${t('tripCost')}: ${tripCost.toFixed(2)}\n${mode === 'metric' ? t('costPerKm') : t('costPerMile')}: ${costPerUnit.toFixed(3)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="fuel-cost-calculator" faqItems={seo.faq}>
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
              onChange={(e) => { setDistance(e.target.value); setErrors(prev => ({ ...prev, distance: '' })); }}
              className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.distance ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            />
            {errors.distance && <p className="text-red-500 text-xs mt-1">{errors.distance}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('consumption')} ({mode === 'metric' ? 'L/100km' : 'MPG'})
            </label>
            <input
              type="number"
              value={consumption}
              onChange={(e) => { setConsumption(e.target.value); setErrors(prev => ({ ...prev, consumption: '' })); }}
              step="0.1"
              className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.consumption ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            />
            {errors.consumption && <p className="text-red-500 text-xs mt-1">{errors.consumption}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('fuelPrice')} ({mode === 'metric' ? t('perLiter') : t('perGallon')})
            </label>
            <input
              type="number"
              value={fuelPrice}
              onChange={(e) => { setFuelPrice(e.target.value); setErrors(prev => ({ ...prev, price: '' })); }}
              step="0.01"
              className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.price ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={roundTrip} onChange={(e) => setRoundTrip(e.target.checked)} className="rounded" />
            <span className="text-sm text-gray-700">{t('roundTrip')}</span>
          </label>

          <div className="flex gap-2">
            <button onClick={handleCalculate} className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2.5 font-medium hover:bg-blue-700 transition-colors">{t('calculate')}</button>
            <button onClick={handleReset} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5" title={t('reset')}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              {t('reset')}
            </button>
          </div>

          {calculated && dist > 0 && cons > 0 && price > 0 && (
            <div className="space-y-3">
              {/* Trip Cost - main card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 text-center">
                <div className="text-sm text-green-600 font-medium mb-1 flex items-center justify-center gap-1">
                  <span>💰</span> {t('tripCost')}
                </div>
                <div className="text-4xl font-bold text-green-700">{tripCost.toFixed(2)}</div>
                {roundTrip && <div className="text-xs text-green-500 mt-1">{t('roundTrip')}</div>}
              </div>

              {/* Fuel & Distance cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 text-center">
                  <div className="text-sm text-yellow-600 font-medium mb-1 flex items-center justify-center gap-1">
                    <span>⛽</span> {t('fuelUsed')}
                  </div>
                  <div className="text-xl font-bold text-yellow-700">{fuelUsed.toFixed(2)}</div>
                  <div className="text-xs text-yellow-500">{mode === 'metric' ? t('liters') : t('gallons')}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 text-center">
                  <div className="text-sm text-blue-600 font-medium mb-1 flex items-center justify-center gap-1">
                    <span>🛣️</span> {t('distance')}
                  </div>
                  <div className="text-xl font-bold text-blue-700">{dist.toFixed(1)}</div>
                  <div className="text-xs text-blue-500">{mode === 'metric' ? t('km') : t('miles')}</div>
                </div>
              </div>

              {/* Cost per unit */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-4 text-center">
                <div className="text-sm text-purple-600 font-medium mb-1 flex items-center justify-center gap-1">
                  <span>📊</span> {mode === 'metric' ? t('costPerKm') : t('costPerMile')}
                </div>
                <div className="text-xl font-bold text-purple-700">{costPerUnit.toFixed(3)}</div>
              </div>

              {/* Fuel usage progress bar */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>0</span>
                  <span>{fuelUsed.toFixed(1)} {mode === 'metric' ? 'L' : 'gal'}</span>
                  <span>{(fuelUsed * 2).toFixed(0)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 h-3 rounded-full transition-all duration-500" style={{ width: '50%' }}></div>
                </div>
              </div>

              {/* Copy Button */}
              <button onClick={copyResults} className="w-full py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                {copied ? (
                  <><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{t('copied')}</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>{t('copy')}</>
                )}
              </button>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {t('historyLabel')}
              </h3>
              <div className="space-y-1.5">
                {history.map((h, i) => (
                  <div key={i} className="flex justify-between items-center text-sm bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors">
                    <span className="text-gray-600">{h.dist.toFixed(0)} {h.unit} / {h.fuel.toFixed(1)} {mode === 'metric' ? 'L' : 'gal'}</span>
                    <span className="font-semibold text-gray-900">{h.cost.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: p }} />)}
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
