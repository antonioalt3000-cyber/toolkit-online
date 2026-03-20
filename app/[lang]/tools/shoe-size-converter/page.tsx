'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const sizeChart = {
  men: [
    { us: 6, uk: 5.5, eu: 39, cm: 24 },
    { us: 6.5, uk: 6, eu: 39.5, cm: 24.5 },
    { us: 7, uk: 6.5, eu: 40, cm: 25 },
    { us: 7.5, uk: 7, eu: 40.5, cm: 25.5 },
    { us: 8, uk: 7.5, eu: 41, cm: 26 },
    { us: 8.5, uk: 8, eu: 42, cm: 26.5 },
    { us: 9, uk: 8.5, eu: 42.5, cm: 27 },
    { us: 9.5, uk: 9, eu: 43, cm: 27.5 },
    { us: 10, uk: 9.5, eu: 44, cm: 28 },
    { us: 10.5, uk: 10, eu: 44.5, cm: 28.5 },
    { us: 11, uk: 10.5, eu: 45, cm: 29 },
    { us: 11.5, uk: 11, eu: 45.5, cm: 29.5 },
    { us: 12, uk: 11.5, eu: 46, cm: 30 },
    { us: 13, uk: 12.5, eu: 47, cm: 31 },
    { us: 14, uk: 13.5, eu: 48, cm: 32 },
  ],
  women: [
    { us: 5, uk: 3, eu: 35.5, cm: 22 },
    { us: 5.5, uk: 3.5, eu: 36, cm: 22.5 },
    { us: 6, uk: 4, eu: 36.5, cm: 23 },
    { us: 6.5, uk: 4.5, eu: 37, cm: 23.5 },
    { us: 7, uk: 5, eu: 37.5, cm: 24 },
    { us: 7.5, uk: 5.5, eu: 38, cm: 24.5 },
    { us: 8, uk: 6, eu: 38.5, cm: 25 },
    { us: 8.5, uk: 6.5, eu: 39, cm: 25.5 },
    { us: 9, uk: 7, eu: 40, cm: 26 },
    { us: 9.5, uk: 7.5, eu: 40.5, cm: 26.5 },
    { us: 10, uk: 8, eu: 41, cm: 27 },
    { us: 10.5, uk: 8.5, eu: 42, cm: 27.5 },
    { us: 11, uk: 9, eu: 42.5, cm: 28 },
    { us: 12, uk: 10, eu: 43.5, cm: 29 },
  ],
};

type System = 'us' | 'uk' | 'eu' | 'cm';

export default function ShoeSizeConverter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['shoe-size-converter'][lang];

  const [inputSize, setInputSize] = useState('');
  const [fromSystem, setFromSystem] = useState<System>('us');
  const [gender, setGender] = useState<'men' | 'women'>('men');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const size = parseFloat(inputSize) || 0;
  const chart = sizeChart[gender];

  const closest = size > 0 ? chart.reduce((prev, curr) => {
    return Math.abs(curr[fromSystem] - size) < Math.abs(prev[fromSystem] - size) ? curr : prev;
  }) : null;

  const labels = {
    men: { en: 'Men', it: 'Uomo', es: 'Hombre', fr: 'Homme', de: 'Herren', pt: 'Masculino' },
    women: { en: 'Women', it: 'Donna', es: 'Mujer', fr: 'Femme', de: 'Damen', pt: 'Feminino' },
    enterSize: { en: 'Enter your shoe size', it: 'Inserisci la tua taglia', es: 'Ingresa tu talla', fr: 'Entrez votre pointure', de: 'Geben Sie Ihre Gr\u00f6\u00dfe ein', pt: 'Insira seu tamanho' },
    fromSystem: { en: 'Size System', it: 'Sistema Taglie', es: 'Sistema de Tallas', fr: 'Syst\u00e8me de Pointures', de: 'Gr\u00f6\u00dfensystem', pt: 'Sistema de Tamanhos' },
    results: { en: 'Converted Sizes', it: 'Taglie Convertite', es: 'Tallas Convertidas', fr: 'Pointures Converties', de: 'Umgerechnete Gr\u00f6\u00dfen', pt: 'Tamanhos Convertidos' },
    footLength: { en: 'Foot Length', it: 'Lunghezza Piede', es: 'Largo del Pie', fr: 'Longueur du Pied', de: 'Fu\u00dfl\u00e4nge', pt: 'Comprimento do P\u00e9' },
    sizeChart: { en: 'Full Size Chart', it: 'Tabella Taglie Completa', es: 'Tabla de Tallas Completa', fr: 'Tableau des Pointures', de: 'Vollst\u00e4ndige Gr\u00f6\u00dfentabelle', pt: 'Tabela de Tamanhos' },
  } as Record<string, Record<Locale, string>>;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Shoe Size Converter \u2014 Convert Between US, UK, EU and CM',
      paragraphs: [
        'Shopping for shoes internationally? Our Shoe Size Converter instantly converts between US, UK, EU, and centimeter sizing systems for both men and women.',
        'Different countries use different shoe sizing systems, which can make online shopping confusing. US sizes, UK sizes, and European sizes all use different numbering, and even the same number can mean different things.',
        'The most accurate way to determine your shoe size is to measure your foot length in centimeters. Stand on a piece of paper, mark the longest toe and heel, and measure the distance. Then use our converter to find your size.',
        'Remember that shoe sizes can vary between brands. When in doubt, use your foot length in centimeters for the most reliable conversion.',
      ],
      faq: [
        { q: 'How do I convert US shoe size to EU?', a: 'Use our converter: enter your US size and see the EU equivalent. Generally, for men, US 10 = EU 44, and for women, US 8 = EU 38.5.' },
        { q: 'Are men\'s and women\'s shoe sizes different?', a: 'Yes! Men\'s and women\'s sizes use different scales. A women\'s size 8 US is equivalent to a men\'s 6.5 US. Our converter handles both.' },
        { q: 'How do I measure my foot size at home?', a: 'Place your foot on paper, mark the tip of your longest toe and the back of your heel, then measure the distance in centimeters.' },
        { q: 'Do shoe sizes vary between brands?', a: 'Yes, shoe sizes can vary by 0.5-1 size between brands. When shopping online, check the brand\'s specific size chart.' },
      ],
    },
    it: {
      title: 'Convertitore Taglie Scarpe Gratuito \u2014 Converti tra US, UK, EU e CM',
      paragraphs: ['Compri scarpe all\'estero? Il nostro convertitore converte tra sistemi US, UK, EU e centimetri.', 'Paesi diversi usano sistemi diversi, rendendo confuso lo shopping online.', 'Il modo pi\u00f9 accurato \u00e8 misurare la lunghezza del piede in centimetri.', 'Ricorda che le taglie possono variare tra i marchi.'],
      faq: [
        { q: 'Come converto una taglia US in EU?', a: 'Inserisci la tua taglia US e vedi l\'equivalente EU. Per uomo, US 10 = EU 44.' },
        { q: 'Le taglie uomo e donna sono diverse?', a: 'S\u00ec! Usano scale diverse. Una taglia donna 8 US = uomo 6.5 US.' },
        { q: 'Come misuro il piede a casa?', a: 'Metti il piede su un foglio, segna punta e tallone, misura la distanza in cm.' },
        { q: 'Le taglie variano tra i marchi?', a: 'S\u00ec, possono variare di 0.5-1 taglia.' },
      ],
    },
    es: {
      title: 'Conversor de Tallas de Zapatos Gratis \u2014 US, UK, EU y CM',
      paragraphs: ['Compras zapatos internacionalmente? Convierte entre US, UK, EU y cent\u00edmetros.', 'Diferentes pa\u00edses usan sistemas diferentes.', 'El m\u00e9todo m\u00e1s preciso es medir el largo del pie.', 'Las tallas pueden variar entre marcas.'],
      faq: [
        { q: '\u00bfC\u00f3mo convierto talla US a EU?', a: 'Ingresa tu talla US y ve el equivalente EU.' },
        { q: '\u00bfLas tallas de hombre y mujer son diferentes?', a: 'S\u00ed, usan escalas diferentes.' },
        { q: '\u00bfC\u00f3mo mido mi pie en casa?', a: 'Pon el pie en un papel, marca punta y tal\u00f3n, mide la distancia.' },
        { q: '\u00bfLas tallas var\u00edan entre marcas?', a: 'S\u00ed, pueden variar 0.5-1 talla.' },
      ],
    },
    fr: {
      title: 'Convertisseur de Pointures Gratuit \u2014 US, UK, EU et CM',
      paragraphs: ['Achetez des chaussures \u00e0 l\'\u00e9tranger? Convertissez entre US, UK, EU et centim\u00e8tres.', 'Diff\u00e9rents pays utilisent des syst\u00e8mes diff\u00e9rents.', 'Le plus pr\u00e9cis est de mesurer la longueur du pied.', 'Les pointures peuvent varier entre marques.'],
      faq: [
        { q: 'Comment convertir une pointure US en EU ?', a: 'Entrez votre pointure US et voyez l\'\u00e9quivalent EU.' },
        { q: 'Les pointures homme et femme sont-elles diff\u00e9rentes ?', a: 'Oui, elles utilisent des \u00e9chelles diff\u00e9rentes.' },
        { q: 'Comment mesurer mon pied \u00e0 la maison ?', a: 'Placez le pied sur du papier, marquez pointe et talon, mesurez.' },
        { q: 'Les pointures varient-elles entre marques ?', a: 'Oui, elles peuvent varier de 0.5-1 pointure.' },
      ],
    },
    de: {
      title: 'Kostenloser Schuhgr\u00f6\u00dfen-Umrechner \u2014 US, UK, EU und CM',
      paragraphs: ['Schuhe international kaufen? Rechnen Sie zwischen US, UK, EU und Zentimetern um.', 'Verschiedene L\u00e4nder verwenden verschiedene Systeme.', 'Am genauesten ist die Fu\u00dfl\u00e4nge in Zentimetern.', 'Gr\u00f6\u00dfen k\u00f6nnen zwischen Marken variieren.'],
      faq: [
        { q: 'Wie rechne ich US in EU um?', a: 'Geben Sie Ihre US-Gr\u00f6\u00dfe ein und sehen Sie das EU-\u00c4quivalent.' },
        { q: 'Sind Herren- und Damengr\u00f6\u00dfen verschieden?', a: 'Ja, sie verwenden verschiedene Skalen.' },
        { q: 'Wie messe ich meinen Fu\u00df zu Hause?', a: 'Stellen Sie den Fu\u00df auf Papier, markieren Sie Spitze und Ferse.' },
        { q: 'Variieren Gr\u00f6\u00dfen zwischen Marken?', a: 'Ja, um 0.5-1 Gr\u00f6\u00dfe.' },
      ],
    },
    pt: {
      title: 'Conversor de Tamanho de Sapato Gr\u00e1tis \u2014 US, UK, EU e CM',
      paragraphs: ['Comprando sapatos internacionalmente? Converta entre US, UK, EU e cent\u00edmetros.', 'Pa\u00edses diferentes usam sistemas diferentes.', 'O mais preciso \u00e9 medir o comprimento do p\u00e9.', 'Tamanhos podem variar entre marcas.'],
      faq: [
        { q: 'Como converto tamanho US para EU?', a: 'Insira seu tamanho US e veja o equivalente EU.' },
        { q: 'Tamanhos masculinos e femininos s\u00e3o diferentes?', a: 'Sim, usam escalas diferentes.' },
        { q: 'Como me\u00e7o meu p\u00e9 em casa?', a: 'Coloque o p\u00e9 no papel, marque ponta e calcanhar, me\u00e7a.' },
        { q: 'Tamanhos variam entre marcas?', a: 'Sim, podem variar 0.5-1 n\u00famero.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="shoe-size-converter" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setGender('men')} className={`flex-1 py-2 rounded-lg font-medium text-sm ${gender === 'men' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{labels.men[lang]}</button>
            <button onClick={() => setGender('women')} className={`flex-1 py-2 rounded-lg font-medium text-sm ${gender === 'women' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{labels.women[lang]}</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.fromSystem[lang]}</label>
              <select value={fromSystem} onChange={(e) => setFromSystem(e.target.value as System)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500">
                <option value="us">US</option>
                <option value="uk">UK</option>
                <option value="eu">EU</option>
                <option value="cm">CM</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.enterSize[lang]}</label>
              <input type="number" value={inputSize} onChange={(e) => setInputSize(e.target.value)} placeholder="10" step="0.5" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {closest && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="text-xs text-blue-600 font-medium mb-2">{labels.results[lang]}</div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center"><div className="text-xs text-gray-500">US</div><div className="text-2xl font-bold">{closest.us}</div></div>
                  <div className="text-center"><div className="text-xs text-gray-500">UK</div><div className="text-2xl font-bold">{closest.uk}</div></div>
                  <div className="text-center"><div className="text-xs text-gray-500">EU</div><div className="text-2xl font-bold">{closest.eu}</div></div>
                  <div className="text-center"><div className="text-xs text-gray-500">CM</div><div className="text-2xl font-bold">{closest.cm}</div></div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <span className="text-sm text-gray-500">{labels.footLength[lang]}: </span>
                <span className="font-bold text-gray-900">{closest.cm} cm</span>
              </div>
            </>
          )}

          <details className="mt-4">
            <summary className="text-sm font-medium text-blue-600 cursor-pointer">{labels.sizeChart[lang]}</summary>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-100"><th className="px-3 py-2">US</th><th className="px-3 py-2">UK</th><th className="px-3 py-2">EU</th><th className="px-3 py-2">CM</th></tr></thead>
                <tbody>
                  {chart.map((row, i) => (
                    <tr key={i} className={`border-b ${closest && row.us === closest.us ? 'bg-blue-50 font-bold' : ''}`}>
                      <td className="px-3 py-1.5 text-center">{row.us}</td>
                      <td className="px-3 py-1.5 text-center">{row.uk}</td>
                      <td className="px-3 py-1.5 text-center">{row.eu}</td>
                      <td className="px-3 py-1.5 text-center">{row.cm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
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
