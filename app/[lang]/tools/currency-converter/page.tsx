'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const rates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  CHF: 0.88,
  CAD: 1.36,
  AUD: 1.53,
  CNY: 7.24,
};

const currencyNames: Record<string, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  CHF: 'Swiss Franc',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  CNY: 'Chinese Yuan',
};

const popularPairs: [string, string][] = [
  ['EUR', 'USD'],
  ['GBP', 'EUR'],
  ['USD', 'JPY'],
  ['EUR', 'GBP'],
];

const labels: Record<string, Record<Locale, string>> = {
  amount: { en: 'Amount', it: 'Importo', es: 'Cantidad', fr: 'Montant', de: 'Betrag', pt: 'Valor' },
  from: { en: 'From', it: 'Da', es: 'De', fr: 'De', de: 'Von', pt: 'De' },
  to: { en: 'To', it: 'A', es: 'A', fr: 'À', de: 'Zu', pt: 'Para' },
  result: { en: 'Result', it: 'Risultato', es: 'Resultado', fr: 'Résultat', de: 'Ergebnis', pt: 'Resultado' },
  swap: { en: 'Swap', it: 'Inverti', es: 'Invertir', fr: 'Inverser', de: 'Tauschen', pt: 'Inverter' },
  note: { en: 'Rates are approximate and for reference only.', it: 'I tassi sono approssimativi e solo indicativi.', es: 'Las tasas son aproximadas y solo de referencia.', fr: 'Les taux sont approximatifs et indicatifs uniquement.', de: 'Kurse sind ungefähre Richtwerte.', pt: 'As taxas são aproximadas e apenas para referência.' },
  copy: { en: 'Copy Result', it: 'Copia Risultato', es: 'Copiar Resultado', fr: 'Copier Résultat', de: 'Ergebnis Kopieren', pt: 'Copiar Resultado' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  reset: { en: 'Reset', it: 'Resetta', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  invalidAmount: { en: 'Please enter a valid positive number.', it: 'Inserisci un numero positivo valido.', es: 'Introduce un número positivo válido.', fr: 'Veuillez entrer un nombre positif valide.', de: 'Bitte geben Sie eine gültige positive Zahl ein.', pt: 'Introduza um número positivo válido.' },
  history: { en: 'Recent Conversions', it: 'Conversioni Recenti', es: 'Conversiones Recientes', fr: 'Conversions Récentes', de: 'Letzte Umrechnungen', pt: 'Conversões Recentes' },
  popularPairs: { en: 'Popular Pairs', it: 'Coppie Popolari', es: 'Pares Populares', fr: 'Paires Populaires', de: 'Beliebte Paare', pt: 'Pares Populares' },
  noHistory: { en: 'No conversions yet.', it: 'Nessuna conversione ancora.', es: 'Sin conversiones aún.', fr: 'Aucune conversion encore.', de: 'Noch keine Umrechnungen.', pt: 'Nenhuma conversão ainda.' },
};

interface HistoryEntry {
  amount: number;
  from: string;
  to: string;
  result: number;
}

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: {
    title: 'How to Convert Currencies Online',
    paragraphs: [
      'Currency conversion is essential for international travel, online shopping from foreign retailers, sending money abroad, and understanding the value of assets denominated in different currencies. Exchange rates fluctuate constantly based on economic conditions, interest rates, geopolitical events, and market sentiment, making it important to check current rates before any significant transaction.',
      'Our free currency converter provides quick reference conversions between major world currencies including US Dollar, Euro, British Pound, Japanese Yen, Swiss Franc, Canadian Dollar, Australian Dollar, and Chinese Yuan. Simply enter the amount, select the source and target currencies, and get an instant conversion. The swap button makes it easy to reverse the direction of conversion.',
      'While this tool uses approximate reference rates suitable for everyday estimation and travel planning, always verify with your bank or a live exchange rate service before making large financial transactions. Banks and transfer services typically add a margin to the mid-market rate, so the actual rate you receive may differ slightly from reference rates shown here.',
    ],
    faq: [
      { q: 'What determines currency exchange rates?', a: 'Exchange rates are driven by supply and demand in foreign exchange markets. Key factors include interest rate differentials between countries, inflation rates, trade balances, political stability, economic performance, and central bank monetary policies.' },
      { q: 'What is the mid-market exchange rate?', a: 'The mid-market rate is the midpoint between the buy and sell prices of two currencies on the global market. It is the fairest rate available, but banks and exchange services typically add a markup, meaning consumers receive a slightly worse rate.' },
      { q: 'When is the best time to exchange currency?', a: 'There is no universally best time, as rates fluctuate unpredictably. However, exchanging during business hours when major financial markets are open often provides better rates. Avoid exchanging at airports or hotels, which typically offer the worst rates.' },
      { q: 'Are the rates shown here live rates?', a: 'No, these are approximate reference rates for quick estimation. For live rates and actual transactions, use your bank, a licensed money transfer service, or a real-time foreign exchange platform.' },
      { q: 'How can I get the best exchange rate?', a: 'Compare rates from multiple providers, avoid airport exchanges, use fee-free travel credit cards for purchases abroad, and consider online transfer services like Wise or Revolut which typically offer rates closer to the mid-market rate.' },
    ],
  },
  it: {
    title: 'Come Convertire le Valute Online',
    paragraphs: [
      'La conversione di valuta e essenziale per i viaggi internazionali, gli acquisti online da rivenditori esteri, l\'invio di denaro all\'estero e la comprensione del valore di attivita denominate in valute diverse. I tassi di cambio fluttuano costantemente in base alle condizioni economiche, ai tassi di interesse e agli eventi geopolitici.',
      'Il nostro convertitore di valute gratuito fornisce conversioni rapide tra le principali valute mondiali, inclusi Dollaro USA, Euro, Sterlina britannica, Yen giapponese, Franco svizzero, Dollaro canadese, Dollaro australiano e Yuan cinese. Basta inserire l\'importo, selezionare le valute e ottenere una conversione istantanea.',
      'Sebbene questo strumento utilizzi tassi di riferimento approssimativi adatti alla stima quotidiana, verificate sempre con la vostra banca prima di transazioni finanziarie significative. Banche e servizi di trasferimento aggiungono generalmente un margine al tasso interbancario.',
    ],
    faq: [
      { q: 'Cosa determina i tassi di cambio?', a: 'I tassi di cambio sono determinati da domanda e offerta nel mercato forex. Fattori chiave includono differenziali nei tassi di interesse, inflazione, bilancia commerciale, stabilita politica e politiche monetarie delle banche centrali.' },
      { q: 'Cos\'e il tasso di cambio interbancario?', a: 'Il tasso interbancario e il punto medio tra il prezzo di acquisto e vendita di due valute sul mercato globale. E il tasso piu equo, ma banche e servizi di cambio aggiungono tipicamente un margine.' },
      { q: 'Quando e il momento migliore per cambiare valuta?', a: 'Non esiste un momento universalmente migliore. Tuttavia, cambiare durante gli orari di apertura dei mercati finanziari offre generalmente tassi migliori. Evita il cambio in aeroporto o in hotel.' },
      { q: 'I tassi mostrati sono in tempo reale?', a: 'No, sono tassi di riferimento approssimativi per una stima rapida. Per tassi in tempo reale, usa la tua banca o una piattaforma di cambio forex.' },
      { q: 'Come ottenere il miglior tasso di cambio?', a: 'Confronta i tassi di piu fornitori, evita il cambio in aeroporto, usa carte di credito senza commissioni per acquisti all\'estero e valuta servizi online come Wise o Revolut.' },
    ],
  },
  es: {
    title: 'Como Convertir Monedas Online',
    paragraphs: [
      'La conversion de moneda es esencial para viajes internacionales, compras online en tiendas extranjeras, envio de dinero al exterior y comprension del valor de activos en diferentes monedas. Los tipos de cambio fluctuan constantemente segun condiciones economicas, tasas de interes y eventos geopoliticos.',
      'Nuestro conversor de monedas gratuito proporciona conversiones rapidas entre las principales monedas mundiales, incluyendo Dolar, Euro, Libra esterlina, Yen japones, Franco suizo, Dolar canadiense, Dolar australiano y Yuan chino. Solo introduce la cantidad, selecciona las monedas y obtendras una conversion instantanea.',
      'Aunque esta herramienta usa tasas de referencia aproximadas para estimacion cotidiana, siempre verifica con tu banco antes de transacciones financieras significativas. Bancos y servicios de transferencia afiaden tipicamente un margen al tipo interbancario.',
    ],
    faq: [
      { q: 'Que determina los tipos de cambio?', a: 'Los tipos de cambio estan determinados por oferta y demanda en los mercados forex. Factores clave incluyen diferenciales de tasas de interes, inflacion, balanza comercial, estabilidad politica y politicas monetarias de bancos centrales.' },
      { q: 'Que es el tipo de cambio interbancario?', a: 'Es el punto medio entre el precio de compra y venta de dos monedas en el mercado global. Es el tipo mas justo, pero bancos y casas de cambio anaden un margen.' },
      { q: 'Cuando es el mejor momento para cambiar moneda?', a: 'No hay un momento universalmente mejor. Sin embargo, cambiar durante horarios de mercados financieros suele ofrecer mejores tipos. Evita cambiar en aeropuertos u hoteles.' },
      { q: 'Los tipos mostrados son en tiempo real?', a: 'No, son tipos de referencia aproximados. Para tipos en tiempo real, usa tu banco o una plataforma forex.' },
      { q: 'Como obtener el mejor tipo de cambio?', a: 'Compara tipos de varios proveedores, evita el cambio en aeropuertos, usa tarjetas sin comisiones en el extranjero y considera servicios como Wise o Revolut.' },
    ],
  },
  fr: {
    title: 'Comment Convertir des Devises en Ligne',
    paragraphs: [
      'La conversion de devises est essentielle pour les voyages internationaux, les achats en ligne chez des detaillants etrangers, les transferts d\'argent a l\'etranger et la comprehension de la valeur d\'actifs libelles en differentes monnaies. Les taux de change fluctuent constamment selon les conditions economiques et les evenements geopolitiques.',
      'Notre convertisseur de devises gratuit fournit des conversions rapides entre les principales monnaies mondiales, y compris Dollar US, Euro, Livre sterling, Yen japonais, Franc suisse, Dollar canadien, Dollar australien et Yuan chinois. Entrez simplement le montant, selectionnez les devises et obtenez une conversion instantanee.',
      'Bien que cet outil utilise des taux de reference approximatifs pour l\'estimation quotidienne, verifiez toujours aupres de votre banque avant des transactions financieres importantes. Les banques ajoutent generalement une marge au taux interbancaire.',
    ],
    faq: [
      { q: 'Qu\'est-ce qui determine les taux de change?', a: 'Les taux sont determines par l\'offre et la demande sur les marches des changes. Les facteurs cles incluent les ecarts de taux d\'interet, l\'inflation, la balance commerciale, la stabilite politique et les politiques monetaires des banques centrales.' },
      { q: 'Qu\'est-ce que le taux interbancaire?', a: 'C\'est le point median entre le prix d\'achat et de vente de deux devises sur le marche mondial. C\'est le taux le plus equitable, mais les banques ajoutent generalement une marge.' },
      { q: 'Quel est le meilleur moment pour changer des devises?', a: 'Il n\'y a pas de moment universellement meilleur. Cependant, changer pendant les heures d\'ouverture des marches financiers offre generalement de meilleurs taux. Evitez les aeroports et les hotels.' },
      { q: 'Les taux affiches sont-ils en temps reel?', a: 'Non, ce sont des taux de reference approximatifs. Pour des taux en temps reel, utilisez votre banque ou une plateforme forex.' },
      { q: 'Comment obtenir le meilleur taux de change?', a: 'Comparez les taux de plusieurs fournisseurs, evitez le change en aeroport, utilisez des cartes sans frais a l\'etranger et envisagez des services comme Wise ou Revolut.' },
    ],
  },
  de: {
    title: 'Wie man Waehrungen Online Umrechnet',
    paragraphs: [
      'Waehrungsumrechnung ist unentbehrlich fuer internationale Reisen, Online-Einkauefe bei auslaendischen Haendlern, Geldueberweisungen ins Ausland und das Verstaendnis des Werts von Vermoegenswerten in verschiedenen Waehrungen. Wechselkurse schwanken staendig aufgrund wirtschaftlicher Bedingungen und geopolitischer Ereignisse.',
      'Unser kostenloser Waehrungsrechner bietet schnelle Umrechnungen zwischen den wichtigsten Weltwaehrungen, darunter US-Dollar, Euro, Britisches Pfund, Japanischer Yen, Schweizer Franken, Kanadischer Dollar, Australischer Dollar und Chinesischer Yuan. Geben Sie einfach den Betrag ein, waehlen Sie die Waehrungen und erhalten Sie eine sofortige Umrechnung.',
      'Obwohl dieses Tool ungefaehre Referenzkurse fuer alltaegliche Schaetzungen verwendet, ueberpruefen Sie immer bei Ihrer Bank, bevor Sie groessere Finanztransaktionen taetigen. Banken fuegen dem Interbankenkurs typischerweise eine Marge hinzu.',
    ],
    faq: [
      { q: 'Was bestimmt die Wechselkurse?', a: 'Wechselkurse werden durch Angebot und Nachfrage auf den Devisenmaerkten bestimmt. Wichtige Faktoren sind Zinsdifferenzen, Inflation, Handelsbilanz, politische Stabilitaet und Geldpolitik der Zentralbanken.' },
      { q: 'Was ist der Interbankenkurs?', a: 'Der Interbankenkurs ist der Mittelwert zwischen Kauf- und Verkaufspreis zweier Waehrungen auf dem Weltmarkt. Er ist der fairste Kurs, aber Banken fuegen typischerweise eine Marge hinzu.' },
      { q: 'Wann ist der beste Zeitpunkt zum Waehrungstausch?', a: 'Es gibt keinen universell besten Zeitpunkt. Der Tausch waehrend der Oeffnungszeiten der Finanzmaerkte bietet aber oft bessere Kurse. Vermeiden Sie Flughaefen und Hotels.' },
      { q: 'Sind die angezeigten Kurse Echtzeit-Kurse?', a: 'Nein, es sind ungefaehre Referenzkurse zur schnellen Schaetzung. Fuer Echtzeit-Kurse nutzen Sie Ihre Bank oder eine Forex-Plattform.' },
      { q: 'Wie erhalte ich den besten Wechselkurs?', a: 'Vergleichen Sie Kurse mehrerer Anbieter, vermeiden Sie Flughafen-Wechselstuben, nutzen Sie gebuehrenfreie Reisekreditkarten und erwaegen Sie Online-Dienste wie Wise oder Revolut.' },
    ],
  },
  pt: {
    title: 'Como Converter Moedas Online',
    paragraphs: [
      'A conversao de moeda e essencial para viagens internacionais, compras online em lojas estrangeiras, envio de dinheiro para o exterior e compreensao do valor de ativos em diferentes moedas. As taxas de cambio flutuam constantemente com base nas condicoes economicas e eventos geopoliticos.',
      'O nosso conversor de moedas gratuito fornece conversoes rapidas entre as principais moedas mundiais, incluindo Dolar americano, Euro, Libra esterlina, Iene japones, Franco suico, Dolar canadiano, Dolar australiano e Yuan chines. Basta introduzir o valor, selecionar as moedas e obter uma conversao instantanea.',
      'Embora esta ferramenta use taxas de referencia aproximadas para estimativa quotidiana, verifique sempre com o seu banco antes de transacoes financeiras significativas. Os bancos adicionam tipicamente uma margem a taxa interbancaria.',
    ],
    faq: [
      { q: 'O que determina as taxas de cambio?', a: 'As taxas sao determinadas pela oferta e procura nos mercados cambiais. Fatores chave incluem diferenciais de taxas de juro, inflacao, balanca comercial, estabilidade politica e politicas monetarias dos bancos centrais.' },
      { q: 'O que e a taxa interbancaria?', a: 'E o ponto medio entre o preco de compra e venda de duas moedas no mercado global. E a taxa mais justa, mas bancos e servicos de cambio adicionam tipicamente uma margem.' },
      { q: 'Quando e o melhor momento para trocar moeda?', a: 'Nao ha um momento universalmente melhor. Contudo, trocar durante os horarios dos mercados financeiros costuma oferecer melhores taxas. Evite aeroportos e hoteis.' },
      { q: 'As taxas mostradas sao em tempo real?', a: 'Nao, sao taxas de referencia aproximadas. Para taxas em tempo real, use o seu banco ou uma plataforma de cambio forex.' },
      { q: 'Como obter a melhor taxa de cambio?', a: 'Compare taxas de varios fornecedores, evite cambio em aeroportos, use cartoes sem comissoes no estrangeiro e considere servicos como Wise ou Revolut.' },
    ],
  },
};

export default function CurrencyConverter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['currency-converter'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const num = parseFloat(amount);
  const isValid = !isNaN(num) && num > 0;
  const hasInput = amount.trim().length > 0;
  const showError = hasInput && !isValid;

  const inUsd = isValid ? num / rates[fromCurrency] : 0;
  const converted = inUsd * rates[toCurrency];
  const exchangeRate = rates[toCurrency] / rates[fromCurrency];

  const swap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const reset = () => {
    setAmount('100');
    setFromCurrency('USD');
    setToCurrency('EUR');
    setCopied(false);
  };

  const copyResult = () => {
    if (!isValid) return;
    const text = `${num.toFixed(2)} ${fromCurrency} = ${converted.toFixed(2)} ${toCurrency}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const addToHistory = () => {
    if (!isValid) return;
    const entry: HistoryEntry = { amount: num, from: fromCurrency, to: toCurrency, result: converted };
    setHistory((prev) => {
      const updated = [entry, ...prev];
      return updated.slice(0, 5);
    });
  };

  const selectPair = (from: string, to: string) => {
    setFromCurrency(from);
    setToCurrency(to);
  };

  const currencies = Object.keys(rates);

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="currency-converter" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Popular Pairs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('popularPairs')}</label>
            <div className="flex flex-wrap gap-2">
              {popularPairs.map(([from, to]) => (
                <button
                  key={`${from}-${to}`}
                  onClick={() => selectPair(from, to)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    fromCurrency === from && toCurrency === to
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {from}/{to}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('amount')}</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                showError ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            {showError && (
              <p className="mt-1 text-sm text-red-500">{t('invalidAmount')}</p>
            )}
          </div>

          {/* Currency Selectors with Swap */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('from')}</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>{c} - {currencyNames[c]}</option>
                ))}
              </select>
            </div>
            <button
              onClick={swap}
              className="mb-0.5 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium text-gray-700 transition-colors"
              title={t('swap')}
            >
              &#8646;
            </button>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('to')}</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>{c} - {currencyNames[c]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Result */}
          {isValid && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>1 {fromCurrency} =</span>
                <span>{exchangeRate.toFixed(4)} {toCurrency}</span>
              </div>
              <hr className="border-blue-200" />
              <div className="flex justify-between text-lg">
                <span className="font-bold text-gray-900">{num.toFixed(2)} {fromCurrency}</span>
                <span className="font-bold text-blue-600">{converted.toFixed(2)} {toCurrency}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={copyResult}
              disabled={!isValid}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                copied
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : isValid
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {copied ? t('copied') : t('copy')}
            </button>
            <button
              onClick={addToHistory}
              disabled={!isValid}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isValid
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              + {t('history')}
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 transition-colors"
            >
              {t('reset')}
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center">{t('note')}</p>
        </div>

        {/* Conversion History */}
        {history.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('history')}</h3>
            <ul className="space-y-2">
              {history.map((entry, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center text-sm px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setAmount(entry.amount.toString());
                    setFromCurrency(entry.from);
                    setToCurrency(entry.to);
                  }}
                >
                  <span className="text-gray-700">{entry.amount.toFixed(2)} {entry.from}</span>
                  <span className="text-gray-400 mx-2">&rarr;</span>
                  <span className="font-medium text-blue-600">{entry.result.toFixed(2)} {entry.to}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

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
