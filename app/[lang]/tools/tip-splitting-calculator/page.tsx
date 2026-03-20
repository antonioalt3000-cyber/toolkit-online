'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function TipSplittingCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['tip-splitting-calculator'][lang];

  const [billAmount, setBillAmount] = useState('');
  const [tipPercent, setTipPercent] = useState(18);
  const [people, setPeople] = useState('2');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const bill = parseFloat(billAmount) || 0;
  const numPeople = parseInt(people) || 1;
  const tipAmount = bill * (tipPercent / 100);
  const totalWithTip = bill + tipAmount;
  const perPerson = totalWithTip / numPeople;
  const tipPerPerson = tipAmount / numPeople;

  const tipPresets = [10, 15, 18, 20, 25];

  const labels = {
    billAmount: { en: 'Bill Amount ($)', it: 'Importo Conto (\u20ac)', es: 'Monto de la Cuenta ($)', fr: 'Montant de l\'Addition (\u20ac)', de: 'Rechnungsbetrag (\u20ac)', pt: 'Valor da Conta (R$)' },
    tipPercent: { en: 'Tip Percentage', it: 'Percentuale Mancia', es: 'Porcentaje de Propina', fr: 'Pourcentage du Pourboire', de: 'Trinkgeld-Prozentsatz', pt: 'Porcentagem de Gorjeta' },
    numPeople: { en: 'Number of People', it: 'Numero di Persone', es: 'N\u00famero de Personas', fr: 'Nombre de Personnes', de: 'Anzahl Personen', pt: 'N\u00famero de Pessoas' },
    tipAmount: { en: 'Tip Amount', it: 'Importo Mancia', es: 'Monto de Propina', fr: 'Montant du Pourboire', de: 'Trinkgeldbetrag', pt: 'Valor da Gorjeta' },
    total: { en: 'Total with Tip', it: 'Totale con Mancia', es: 'Total con Propina', fr: 'Total avec Pourboire', de: 'Gesamt mit Trinkgeld', pt: 'Total com Gorjeta' },
    perPerson: { en: 'Per Person', it: 'Per Persona', es: 'Por Persona', fr: 'Par Personne', de: 'Pro Person', pt: 'Por Pessoa' },
    tipPerPerson: { en: 'Tip per Person', it: 'Mancia per Persona', es: 'Propina por Persona', fr: 'Pourboire par Personne', de: 'Trinkgeld pro Person', pt: 'Gorjeta por Pessoa' },
  } as Record<string, Record<Locale, string>>;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Tip Splitting Calculator \u2014 Split Bills and Tips Among Friends',
      paragraphs: [
        'The Tip Splitting Calculator makes it easy to divide restaurant bills and tips among any number of people. No more awkward calculations at the table \u2014 just enter the bill, choose a tip percentage, and see what everyone owes.',
        'Choose from common tip percentages (10%, 15%, 18%, 20%, 25%) or set a custom amount. The calculator instantly shows the total with tip, each person\'s share, and the tip per person.',
        'Tipping customs vary worldwide: 15-20% is standard in the US, while 10-15% is common in Canada. In many European countries, a small tip (5-10%) is appreciated but not mandatory.',
        'Use this calculator any time you\'re dining out with friends, splitting a group order, or sharing expenses. It works for any currency and any number of people.',
      ],
      faq: [
        { q: 'How much should I tip at a restaurant?', a: 'In the US, 15-20% is standard for sit-down dining. 15% for average service, 18% for good service, and 20%+ for excellent service.' },
        { q: 'Should I tip on the pre-tax or post-tax amount?', a: 'Traditionally, tips are calculated on the pre-tax bill amount. However, many people tip on the total including tax for simplicity.' },
        { q: 'How do I split the bill fairly?', a: 'The simplest way is to divide equally. If people ordered different amounts, you can split based on what each person ordered and add the tip proportionally.' },
        { q: 'Is it rude to split the bill?', a: 'Not at all! Splitting the bill is very common, especially in casual dining. Many restaurants can split bills for you, or you can use this calculator.' },
      ],
    },
    it: {
      title: 'Calcolatore Divisione Mancia Gratuito \u2014 Dividi Conti e Mance tra Amici',
      paragraphs: [
        'Il Calcolatore Divisione Mancia rende facile dividere conti e mance tra qualsiasi numero di persone. Basta inserire l\'importo, scegliere la percentuale e vedere quanto deve pagare ciascuno.',
        'Scegli tra percentuali comuni (10%, 15%, 18%, 20%, 25%) o imposta un importo personalizzato.',
        'Le usanze sulla mancia variano nel mondo: 15-20% \u00e8 standard negli USA, mentre in Italia la mancia non \u00e8 obbligatoria ma \u00e8 apprezzata.',
        'Usa questo calcolatore ogni volta che ceni fuori con amici o dividi spese di gruppo.',
      ],
      faq: [
        { q: 'Quanto dovrei lasciare di mancia?', a: 'In Italia la mancia non \u00e8 obbligatoria. Negli USA, il 15-20% \u00e8 standard per i ristoranti.' },
        { q: 'Si calcola la mancia sul totale lordo o netto?', a: 'Tradizionalmente la mancia si calcola sull\'importo prima delle tasse.' },
        { q: 'Come si divide il conto equamente?', a: 'Il modo pi\u00f9 semplice \u00e8 dividere in parti uguali. Se le persone hanno ordinato importi diversi, si pu\u00f2 dividere proporzionalmente.' },
        { q: '\u00c8 maleducato dividere il conto?', a: 'Assolutamente no! Dividere il conto \u00e8 molto comune, specialmente nelle cene informali.' },
      ],
    },
    es: {
      title: 'Calculadora de Divisi\u00f3n de Propina Gratis \u2014 Divide Cuentas y Propinas',
      paragraphs: ['La Calculadora de Divisi\u00f3n de Propina facilita dividir cuentas entre cualquier n\u00famero de personas.', 'Elige entre porcentajes comunes o personaliza el monto.', 'Las costumbres de propina var\u00edan en el mundo.', 'Usa esta calculadora cuando cenes con amigos.'],
      faq: [
        { q: '\u00bfCu\u00e1nto debo dejar de propina?', a: 'En EE.UU., 15-20% es est\u00e1ndar. En Latinoam\u00e9rica var\u00eda por pa\u00eds.' },
        { q: '\u00bfSe calcula sobre el total con o sin impuestos?', a: 'Tradicionalmente sobre el monto antes de impuestos.' },
        { q: '\u00bfC\u00f3mo divido la cuenta justamente?', a: 'El m\u00e9todo m\u00e1s simple es dividir en partes iguales.' },
        { q: '\u00bfEs de mala educaci\u00f3n dividir la cuenta?', a: 'No, dividir la cuenta es muy com\u00fan.' },
      ],
    },
    fr: {
      title: 'Calculateur de Partage de Pourboire Gratuit \u2014 Divisez les Additions',
      paragraphs: ['Le Calculateur de Partage de Pourboire facilite la division des additions entre amis.', 'Choisissez parmi les pourcentages courants ou personnalisez.', 'Les coutumes de pourboire varient dans le monde.', 'Utilisez ce calculateur lors de vos sorties entre amis.'],
      faq: [
        { q: 'Combien devrais-je laisser de pourboire ?', a: 'En France, le service est inclus. Aux \u00c9tats-Unis, 15-20% est standard.' },
        { q: 'On calcule sur le montant HT ou TTC ?', a: 'Traditionnellement sur le montant hors taxes.' },
        { q: 'Comment diviser l\'addition \u00e9quitablement ?', a: 'Le plus simple est de diviser en parts \u00e9gales.' },
        { q: 'Est-ce impoli de diviser l\'addition ?', a: 'Pas du tout ! C\'est tr\u00e8s courant.' },
      ],
    },
    de: {
      title: 'Kostenloser Trinkgeld-Teiler \u2014 Rechnungen Aufteilen',
      paragraphs: ['Der Trinkgeld-Teiler macht es einfach, Rechnungen unter Freunden aufzuteilen.', 'W\u00e4hlen Sie g\u00e4ngige Prozents\u00e4tze oder passen Sie an.', 'Trinkgeld-Gewohnheiten variieren weltweit.', 'Verwenden Sie diesen Rechner bei Gruppenessen.'],
      faq: [
        { q: 'Wie viel Trinkgeld sollte ich geben?', a: 'In Deutschland sind 5-10% \u00fcblich. In den USA 15-20%.' },
        { q: 'Berechnet man auf den Brutto- oder Nettobetrag?', a: 'Traditionell auf den Betrag vor Steuern.' },
        { q: 'Wie teile ich die Rechnung fair auf?', a: 'Am einfachsten gleichm\u00e4\u00dfig teilen.' },
        { q: 'Ist es unh\u00f6flich, die Rechnung zu teilen?', a: 'Nein, das ist sehr verbreitet.' },
      ],
    },
    pt: {
      title: 'Calculadora de Divis\u00e3o de Gorjeta Gr\u00e1tis \u2014 Divida Contas e Gorjetas',
      paragraphs: ['A Calculadora de Divis\u00e3o de Gorjeta facilita dividir contas entre qualquer n\u00famero de pessoas.', 'Escolha entre porcentagens comuns ou personalize.', 'Os costumes de gorjeta variam no mundo.', 'Use esta calculadora ao jantar com amigos.'],
      faq: [
        { q: 'Quanto devo deixar de gorjeta?', a: 'No Brasil, 10% \u00e9 o padr\u00e3o. Nos EUA, 15-20%.' },
        { q: 'Calcula-se sobre o valor com ou sem impostos?', a: 'Tradicionalmente sobre o valor antes dos impostos.' },
        { q: 'Como dividir a conta justamente?', a: 'O m\u00e9todo mais simples \u00e9 dividir igualmente.' },
        { q: '\u00c9 falta de educa\u00e7\u00e3o dividir a conta?', a: 'N\u00e3o, dividir a conta \u00e9 muito comum.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="tip-splitting-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.billAmount[lang]}</label>
            <input type="number" value={billAmount} onChange={(e) => setBillAmount(e.target.value)} placeholder="85.00" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{labels.tipPercent[lang]}: {tipPercent}%</label>
            <div className="flex gap-2 mb-2">
              {tipPresets.map(p => (
                <button key={p} onClick={() => setTipPercent(p)} className={`flex-1 py-2 rounded-lg text-sm font-medium ${tipPercent === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{p}%</button>
              ))}
            </div>
            <input type="range" min={0} max={50} value={tipPercent} onChange={(e) => setTipPercent(Number(e.target.value))} className="w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.numPeople[lang]}</label>
            <input type="number" value={people} onChange={(e) => setPeople(e.target.value)} min="1" placeholder="2" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          {bill > 0 && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                <div className="text-xs text-blue-600 font-medium mb-1">{labels.perPerson[lang]}</div>
                <div className="text-4xl font-bold text-gray-900">${perPerson.toFixed(2)}</div>
                <div className="text-sm text-gray-500 mt-1">{labels.tipPerPerson[lang]}: ${tipPerPerson.toFixed(2)}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">{labels.tipAmount[lang]}</div>
                  <div className="text-xl font-bold text-gray-900">${tipAmount.toFixed(2)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">{labels.total[lang]}</div>
                  <div className="text-xl font-bold text-gray-900">${totalWithTip.toFixed(2)}</div>
                </div>
              </div>
            </>
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
