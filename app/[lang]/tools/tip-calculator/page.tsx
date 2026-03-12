'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  billAmount: { en: 'Bill Amount', it: 'Importo Conto', es: 'Monto de la Cuenta', fr: 'Montant de la Note', de: 'Rechnungsbetrag', pt: 'Valor da Conta' },
  tipPercent: { en: 'Tip Percentage (%)', it: 'Percentuale Mancia (%)', es: 'Porcentaje de Propina (%)', fr: 'Pourcentage Pourboire (%)', de: 'Trinkgeld-Prozent (%)', pt: 'Percentual de Gorjeta (%)' },
  numPeople: { en: 'Number of People', it: 'Numero di Persone', es: 'Número de Personas', fr: 'Nombre de Personnes', de: 'Anzahl Personen', pt: 'Número de Pessoas' },
  tipAmount: { en: 'Tip Amount', it: 'Mancia Totale', es: 'Propina Total', fr: 'Pourboire Total', de: 'Trinkgeld Gesamt', pt: 'Gorjeta Total' },
  totalAmount: { en: 'Total Amount', it: 'Importo Totale', es: 'Monto Total', fr: 'Montant Total', de: 'Gesamtbetrag', pt: 'Valor Total' },
  tipPerPerson: { en: 'Tip per Person', it: 'Mancia per Persona', es: 'Propina por Persona', fr: 'Pourboire par Personne', de: 'Trinkgeld pro Person', pt: 'Gorjeta por Pessoa' },
  totalPerPerson: { en: 'Total per Person', it: 'Totale per Persona', es: 'Total por Persona', fr: 'Total par Personne', de: 'Gesamt pro Person', pt: 'Total por Pessoa' },
  reset: { en: 'Reset', it: 'Reset', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Reiniciar' },
  copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
  history: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
  invalidBill: { en: 'Enter a valid bill amount', it: 'Inserisci un importo valido', es: 'Ingresa un monto válido', fr: 'Entrez un montant valide', de: 'Geben Sie einen gültigen Betrag ein', pt: 'Insira um valor válido' },
  invalidPeople: { en: 'Enter at least 1 person', it: 'Inserisci almeno 1 persona', es: 'Ingresa al menos 1 persona', fr: 'Entrez au moins 1 personne', de: 'Geben Sie mindestens 1 Person ein', pt: 'Insira pelo menos 1 pessoa' },
};

const seoContent: Record<string, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: {
    title: 'How to Calculate Tips at Restaurants and Bars',
    paragraphs: [
      'Tipping is an important part of dining culture in many countries, yet calculating the right amount can be confusing, especially when splitting the bill among a group. A tip calculator removes the guesswork by instantly computing the tip amount, the total bill including the tip, and each person\'s share when dining with others.',
      'Standard tipping practices vary widely around the world. In the United States, 15-20% is customary for table service at restaurants. In Europe, tipping customs differ significantly — in Italy and France a small tip of 5-10% is appreciated but not mandatory, while in Germany rounding up is common. In some Asian countries, tipping may even be considered rude. Understanding local customs helps you navigate these situations gracefully.',
      'This tip calculator supports custom tip percentages and bill splitting for groups of any size. Simply enter the bill amount, choose a preset tip percentage or type your own, and specify how many people are sharing the cost. The calculator instantly shows the total tip, the grand total, and the per-person breakdown. It is especially useful for large group dinners where mental math becomes impractical.',
    ],
    faq: [
      { q: 'How much should I tip at a restaurant?', a: 'In the US, 15-20% is standard for sit-down restaurants. For exceptional service, 20-25% is appropriate. For buffets or counter service, 10% is typical. In Europe, 5-10% or rounding up is generally sufficient.' },
      { q: 'Should I tip on the pre-tax or post-tax amount?', a: 'Etiquette experts recommend tipping on the pre-tax amount, since the tax goes to the government rather than the restaurant. However, many people tip on the total for simplicity, and either approach is acceptable.' },
      { q: 'How do I split a tip among a group?', a: 'Divide the total bill (including tip) by the number of people. This calculator does it automatically — just enter the number of people and it shows each person\'s share of both the tip and the total.' },
      { q: 'Is it rude not to tip in Europe?', a: 'It depends on the country. In France and Italy, service is often included in the price, so a small extra tip is a courtesy but not expected. In Germany and Austria, rounding up to the nearest euro or adding 5-10% is customary.' },
      { q: 'Should I tip for takeout or delivery orders?', a: 'For delivery, a 10-15% tip is customary since the driver uses their own vehicle and time. For takeout, tipping is not expected but a small amount (5-10%) is appreciated, especially for large or complex orders.' },
    ],
  },
  it: {
    title: 'Come Calcolare la Mancia al Ristorante',
    paragraphs: [
      'La mancia e una parte importante della cultura della ristorazione in molti paesi, ma calcolare l\'importo giusto puo essere complicato, specialmente quando si divide il conto tra piu persone. Un calcolatore di mance risolve il problema calcolando istantaneamente l\'importo della mancia, il totale del conto e la quota di ciascuno.',
      'Le usanze sulla mancia variano ampiamente nel mondo. Negli Stati Uniti il 15-20% e la norma per il servizio al tavolo. In Italia la mancia non e obbligatoria perche il servizio e spesso incluso nel prezzo, ma lasciare un piccolo extra del 5-10% e un gesto apprezzato. In Germania si arrotonda per eccesso, mentre in alcuni paesi asiatici la mancia puo essere considerata maleducata.',
      'Questo calcolatore supporta percentuali personalizzate e la divisione del conto per gruppi di qualsiasi dimensione. Basta inserire l\'importo del conto, scegliere una percentuale e specificare quante persone condividono il costo. Il calcolatore mostra istantaneamente la mancia totale, il totale complessivo e la suddivisione per persona.',
    ],
    faq: [
      { q: 'Quanto si lascia di mancia al ristorante in Italia?', a: 'In Italia la mancia non e obbligatoria poiche il servizio e solitamente incluso nel conto. Tuttavia, lasciare un 5-10% per un servizio eccellente e un gesto gradito, soprattutto nei ristoranti di alta gamma.' },
      { q: 'La mancia va calcolata sul totale con o senza IVA?', a: 'La mancia si calcola generalmente sul totale del conto. Non esiste una regola rigida, ma la maggior parte delle persone calcola la mancia sull\'importo finale per semplicita.' },
      { q: 'Come si divide la mancia in un gruppo?', a: 'Dividi il totale del conto (mancia inclusa) per il numero di persone. Questo calcolatore lo fa automaticamente — basta inserire il numero di commensali.' },
      { q: 'E obbligatorio lasciare la mancia in Europa?', a: 'Dipende dal paese. In Italia e Francia il servizio e spesso incluso nel prezzo. In Germania e Austria si arrotonda per eccesso o si aggiunge il 5-10%. Nei paesi nordici la mancia non e prevista.' },
      { q: 'Si lascia la mancia per ordini da asporto?', a: 'Per le consegne a domicilio, il 10-15% e appropriato. Per l\'asporto la mancia non e attesa, ma un piccolo importo e apprezzato per ordini grandi o complessi.' },
    ],
  },
  es: {
    title: 'Como Calcular la Propina en Restaurantes y Bares',
    paragraphs: [
      'La propina es una parte importante de la cultura gastronomica en muchos paises, pero calcular la cantidad correcta puede ser confuso, especialmente al dividir la cuenta entre un grupo. Una calculadora de propinas resuelve el problema calculando instantaneamente el monto de la propina, el total de la cuenta y la parte de cada persona.',
      'Las practicas de propina varian ampliamente. En Estados Unidos, el 15-20% es habitual. En Espana, la propina no es obligatoria pero dejar un 5-10% es un gesto apreciado. En Alemania se redondea hacia arriba, mientras que en algunos paises asiaticos la propina puede considerarse descortes.',
      'Esta calculadora soporta porcentajes personalizados y la division de la cuenta para grupos de cualquier tamano. Simplemente introduce el monto de la cuenta, elige un porcentaje y especifica cuantas personas comparten el costo.',
    ],
    faq: [
      { q: 'Cuanto se deja de propina en un restaurante?', a: 'En EEUU, 15-20% es lo estandar. En Espana, la propina no es obligatoria pero un 5-10% se aprecia. Para un servicio excepcional, 15-20% es apropiado.' },
      { q: 'La propina se calcula sobre el total con o sin impuestos?', a: 'Lo ideal es calcularla sobre el monto antes de impuestos, pero muchas personas la calculan sobre el total por simplicidad. Ambos enfoques son aceptables.' },
      { q: 'Como se divide la propina entre un grupo?', a: 'Divide el total de la cuenta (con propina) entre el numero de personas. Esta calculadora lo hace automaticamente.' },
      { q: 'Es obligatorio dejar propina en Europa?', a: 'Depende del pais. En Espana, Francia e Italia el servicio suele estar incluido. En Alemania y Austria se redondea hacia arriba o se anade un 5-10%.' },
      { q: 'Se deja propina en pedidos para llevar?', a: 'Para entregas a domicilio, un 10-15% es apropiado. Para comida para llevar no se espera propina, pero un pequeno monto se agradece para pedidos grandes.' },
    ],
  },
  fr: {
    title: 'Comment Calculer le Pourboire au Restaurant',
    paragraphs: [
      'Le pourboire fait partie de la culture de la restauration dans de nombreux pays, mais calculer le bon montant peut etre deroutant, surtout quand on partage l\'addition entre plusieurs personnes. Un calculateur de pourboire resout le probleme en calculant instantanement le montant du pourboire, le total et la part de chacun.',
      'Les pratiques de pourboire varient considerablement. Aux Etats-Unis, 15-20% est la norme. En France, le service est generalement inclus dans les prix, mais laisser un petit extra de 5-10% est un geste apprecie. En Allemagne, on arrondit vers le haut, tandis que dans certains pays asiatiques le pourboire peut etre mal vu.',
      'Ce calculateur prend en charge des pourcentages personnalises et le partage de l\'addition pour des groupes de toute taille. Entrez simplement le montant de l\'addition, choisissez un pourcentage et indiquez combien de personnes partagent le cout.',
    ],
    faq: [
      { q: 'Combien faut-il laisser de pourboire au restaurant?', a: 'En France, le service est inclus dans les prix. Un petit pourboire supplementaire de 5-10% est un geste apprecie mais pas obligatoire. Aux Etats-Unis, 15-20% est la norme.' },
      { q: 'Le pourboire se calcule-t-il sur le montant HT ou TTC?', a: 'En general, le pourboire se calcule sur le montant total de l\'addition. Il n\'y a pas de regle stricte, mais la plupart des gens calculent sur le total TTC par simplicite.' },
      { q: 'Comment partager le pourboire dans un groupe?', a: 'Divisez le total de l\'addition (pourboire inclus) par le nombre de personnes. Ce calculateur le fait automatiquement.' },
      { q: 'Le pourboire est-il obligatoire en France?', a: 'Non, le service est inclus dans les prix en France. Laisser un petit supplement est un geste de courtoisie apprecie mais non obligatoire.' },
      { q: 'Faut-il laisser un pourboire pour la livraison?', a: 'Pour la livraison a domicile, 10-15% est recommande. Pour les commandes a emporter, le pourboire n\'est pas attendu mais apprecie pour les grosses commandes.' },
    ],
  },
  de: {
    title: 'Wie berechnet man Trinkgeld im Restaurant?',
    paragraphs: [
      'Trinkgeld ist ein wichtiger Teil der Gastronomiekultur in vielen Laendern, aber den richtigen Betrag zu berechnen kann verwirrend sein, besonders wenn die Rechnung unter einer Gruppe aufgeteilt wird. Ein Trinkgeldrechner loest das Problem, indem er sofort den Trinkgeldbetrag, die Gesamtrechnung und den Anteil jeder Person berechnet.',
      'Trinkgeldpraktiken variieren weltweit stark. In den USA sind 15-20% ueblich. In Deutschland ist es gaengig, den Rechnungsbetrag aufzurunden oder 5-10% hinzuzufuegen. In Italien und Frankreich ist das Trinkgeld nicht obligatorisch, da der Service oft im Preis inbegriffen ist.',
      'Dieser Rechner unterstuetzt individuelle Prozentsaetze und die Rechnungsaufteilung fuer Gruppen jeder Groesse. Geben Sie einfach den Rechnungsbetrag ein, waehlen Sie einen Prozentsatz und geben Sie an, wie viele Personen sich die Kosten teilen.',
    ],
    faq: [
      { q: 'Wie viel Trinkgeld gibt man im Restaurant?', a: 'In Deutschland ist es ueblich, die Rechnung aufzurunden oder 5-10% hinzuzufuegen. In den USA sind 15-20% Standard. Fuer hervorragenden Service sind 10-15% in Deutschland angemessen.' },
      { q: 'Wird Trinkgeld auf den Brutto- oder Nettobetrag berechnet?', a: 'Trinkgeld wird normalerweise auf den Gesamtbetrag der Rechnung berechnet. Es gibt keine strenge Regel, aber die meisten Menschen berechnen es auf den Endbetrag.' },
      { q: 'Wie teilt man Trinkgeld in einer Gruppe auf?', a: 'Teilen Sie die Gesamtrechnung (mit Trinkgeld) durch die Anzahl der Personen. Dieser Rechner macht das automatisch.' },
      { q: 'Ist Trinkgeld in Deutschland Pflicht?', a: 'Nein, Trinkgeld ist in Deutschland freiwillig, aber es ist ueblich und erwartet. Die Servicekraefte verlassen sich teilweise auf das Trinkgeld als Einkommensergaenzung.' },
      { q: 'Gibt man Trinkgeld bei Lieferungen?', a: 'Fuer Lieferungen sind 10-15% angemessen, da der Fahrer eigene Kosten hat. Bei Abholbestellungen ist Trinkgeld nicht erwartet, aber fuer grosse Bestellungen geschaetzt.' },
    ],
  },
  pt: {
    title: 'Como Calcular a Gorjeta no Restaurante',
    paragraphs: [
      'A gorjeta e uma parte importante da cultura gastronomica em muitos paises, mas calcular o valor certo pode ser confuso, especialmente ao dividir a conta entre um grupo. Uma calculadora de gorjetas resolve o problema calculando instantaneamente o valor da gorjeta, o total da conta e a parte de cada pessoa.',
      'As praticas de gorjeta variam amplamente. Nos Estados Unidos, 15-20% e habitual. No Brasil e Portugal, a gorjeta nao e obrigatoria, mas deixar 10% e um gesto apreciado. Na Alemanha arredonda-se para cima, enquanto em alguns paises asiaticos a gorjeta pode ser considerada indelicada.',
      'Esta calculadora suporta percentagens personalizadas e a divisao da conta para grupos de qualquer tamanho. Basta introduzir o valor da conta, escolher uma percentagem e especificar quantas pessoas partilham o custo.',
    ],
    faq: [
      { q: 'Quanto se deixa de gorjeta no restaurante?', a: 'Em Portugal, a gorjeta nao e obrigatoria mas 5-10% e apreciado. No Brasil, muitos restaurantes incluem 10% de servico na conta. Nos EUA, 15-20% e o padrao.' },
      { q: 'A gorjeta calcula-se sobre o total com ou sem impostos?', a: 'Geralmente calcula-se sobre o total da conta. Nao ha regra rigida, mas a maioria das pessoas calcula sobre o valor final por simplicidade.' },
      { q: 'Como se divide a gorjeta num grupo?', a: 'Divida o total da conta (com gorjeta) pelo numero de pessoas. Esta calculadora faz isso automaticamente.' },
      { q: 'E obrigatorio deixar gorjeta em Portugal?', a: 'Nao, a gorjeta e voluntaria em Portugal. Deixar um pequeno valor ou arredondar a conta e um gesto de cortesia apreciado mas nao obrigatorio.' },
      { q: 'Deixa-se gorjeta em entregas ao domicilio?', a: 'Para entregas, 10-15% e apropriado. Para pedidos para levar nao se espera gorjeta, mas um pequeno valor e apreciado para encomendas grandes.' },
    ],
  },
};

export default function TipCalculator() {
  const { lang } = useParams() as { lang: string };
  const toolT = tools['tip-calculator'][lang as keyof typeof tools['tip-calculator']];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [bill, setBill] = useState('');
  const [tipPct, setTipPct] = useState('15');
  const [people, setPeople] = useState('1');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ bill: string; tip: string; total: string }[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const billNum = parseFloat(bill) || 0;
  const tipNum = parseFloat(tipPct) || 0;
  const peopleNum = Math.max(parseInt(people) || 1, 1);

  const billError = touched.bill && bill !== '' && billNum <= 0;
  const peopleError = touched.people && people !== '' && (parseInt(people) || 0) < 1;

  const tipAmount = billNum * (tipNum / 100);
  const total = billNum + tipAmount;
  const tipPerPerson = tipAmount / peopleNum;
  const totalPerPerson = total / peopleNum;

  const presets = [10, 15, 18, 20, 25];

  const handleReset = () => {
    setBill('');
    setTipPct('15');
    setPeople('1');
    setTouched({});
  };

  const copyResult = () => {
    if (billNum > 0) {
      const text = `${t('tipAmount')}: $${tipAmount.toFixed(2)} | ${t('totalAmount')}: $${total.toFixed(2)}${peopleNum > 1 ? ` | ${t('totalPerPerson')}: $${totalPerPerson.toFixed(2)}` : ''}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Save to history when bill changes and has result
  const prevBill = useState('');
  if (billNum > 0 && bill !== prevBill[0]) {
    prevBill[1](bill);
    setHistory(prev => [{ bill: `$${billNum.toFixed(2)}`, tip: `${tipNum}%`, total: `$${total.toFixed(2)}` }, ...prev].slice(0, 5));
  }

  const seo = seoContent[lang] || seoContent.en;
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="tip-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('billAmount')}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
              <input type="number" value={bill} onChange={(e) => setBill(e.target.value)} onBlur={() => setTouched(p => ({ ...p, bill: true }))} placeholder="0.00"
                className={`w-full border rounded-lg pl-8 pr-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${billError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            </div>
            {billError && <p className="text-red-500 text-xs mt-1">{t('invalidBill')}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('tipPercent')}</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {presets.map((p) => (
                <button key={p} onClick={() => setTipPct(String(p))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${String(p) === tipPct ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {p}%
                </button>
              ))}
            </div>
            <input type="number" value={tipPct} onChange={(e) => setTipPct(e.target.value)} placeholder="15"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('numPeople')}</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setPeople(String(Math.max(1, peopleNum - 1)))} className="w-10 h-10 rounded-lg bg-gray-100 text-gray-700 font-bold text-xl hover:bg-gray-200 transition-colors">-</button>
              <input type="number" value={people} onChange={(e) => setPeople(e.target.value)} onBlur={() => setTouched(p => ({ ...p, people: true }))} min="1" placeholder="1"
                className={`flex-1 border rounded-lg px-4 py-2 text-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent ${peopleError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
              <button onClick={() => setPeople(String(peopleNum + 1))} className="w-10 h-10 rounded-lg bg-gray-100 text-gray-700 font-bold text-xl hover:bg-gray-200 transition-colors">+</button>
            </div>
            {peopleError && <p className="text-red-500 text-xs mt-1">{t('invalidPeople')}</p>}
          </div>

          {/* Reset button */}
          <button onClick={handleReset} className="w-full py-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
            {t('reset')}
          </button>

          {billNum > 0 && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                  <div className="text-xs text-gray-500">{t('tipAmount')}</div>
                  <div className="text-2xl font-bold text-green-700">${tipAmount.toFixed(2)}</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                  <div className="text-xs text-gray-500">{t('totalAmount')}</div>
                  <div className="text-2xl font-bold text-blue-700">${total.toFixed(2)}</div>
                </div>
              </div>
              {peopleNum > 1 && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-center">
                    <div className="text-xs text-gray-500">{t('tipPerPerson')}</div>
                    <div className="text-xl font-bold text-purple-700">${tipPerPerson.toFixed(2)}</div>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
                    <div className="text-xs text-gray-500">{t('totalPerPerson')}</div>
                    <div className="text-xl font-bold text-indigo-700">${totalPerPerson.toFixed(2)}</div>
                  </div>
                </div>
              )}
              {/* Tip percentage visual bar */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{t('billAmount')}</span>
                  <span>{tipNum}% {t('tipAmount').toLowerCase()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div className="h-full flex">
                    <div className="bg-blue-500 h-full" style={{ width: `${(billNum / total) * 100}%` }} />
                    <div className="bg-green-500 h-full" style={{ width: `${(tipAmount / total) * 100}%` }} />
                  </div>
                </div>
              </div>
              <button onClick={copyResult} className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">
                {copied ? t('copied') : t('copy')}
              </button>
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">{t('history')}</h3>
              <button onClick={() => setHistory([])} className="text-xs text-red-500 hover:text-red-700">Clear</button>
            </div>
            <div className="space-y-1">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between text-sm px-2 py-1.5 bg-gray-50 rounded">
                  <span className="text-gray-500">{h.bill} @ {h.tip}</span>
                  <span className="font-semibold text-gray-900">{h.total}</span>
                </div>
              ))}
            </div>
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
