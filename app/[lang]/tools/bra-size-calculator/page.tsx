'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function BraSizeCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['bra-size-calculator'][lang];

  const [bandSize, setBandSize] = useState('');
  const [bustSize, setBustSize] = useState('');
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const band = parseFloat(bandSize) || 0;
  const bust = parseFloat(bustSize) || 0;

  const bandCm = unit === 'cm' ? band : band * 2.54;
  const bustCm = unit === 'cm' ? bust : bust * 2.54;
  const diff = bustCm - bandCm;

  const cupSizes = ['AA', 'A', 'B', 'C', 'D', 'DD/E', 'DDD/F', 'G', 'H', 'I', 'J', 'K'];
  const cupIndex = Math.max(0, Math.min(Math.round((diff - 10) / 2.5), cupSizes.length - 1));
  const cupSize = diff > 0 ? cupSizes[cupIndex] : '';

  const usBandSize = Math.round(bandCm / 2.54);
  const usBand = usBandSize % 2 === 0 ? usBandSize : usBandSize + 1;
  const ukBand = usBand;
  const euBand = Math.round(bandCm / 5) * 5;

  const usSize = band > 0 && bust > 0 && diff > 0 ? `${usBand}${cupSize}` : '';
  const ukSize = band > 0 && bust > 0 && diff > 0 ? `${ukBand}${cupSize}` : '';
  const euSize = band > 0 && bust > 0 && diff > 0 ? `${euBand}${cupSize}` : '';

  const labels = {
    bandSize: { en: 'Band Size (underbust)', it: 'Fascia (sottoseno)', es: 'Contorno (bajo busto)', fr: 'Tour de dessous de poitrine', de: 'Unterbrustweite', pt: 'Faixa (abaixo do busto)' },
    bustSize: { en: 'Bust Size (fullest point)', it: 'Busto (punto pi\u00f9 pieno)', es: 'Busto (punto m\u00e1s lleno)', fr: 'Tour de poitrine (point le plus fort)', de: 'Brustumfang (vollste Stelle)', pt: 'Busto (ponto mais cheio)' },
    cm: { en: 'Centimeters', it: 'Centimetri', es: 'Cent\u00edmetros', fr: 'Centim\u00e8tres', de: 'Zentimeter', pt: 'Cent\u00edmetros' },
    inches: { en: 'Inches', it: 'Pollici', es: 'Pulgadas', fr: 'Pouces', de: 'Zoll', pt: 'Polegadas' },
    yourSize: { en: 'Your Bra Size', it: 'La Tua Taglia', es: 'Tu Talla', fr: 'Votre Taille', de: 'Ihre Gr\u00f6\u00dfe', pt: 'Seu Tamanho' },
    cup: { en: 'Cup Size', it: 'Coppa', es: 'Copa', fr: 'Bonnet', de: 'K\u00f6rbchengr\u00f6\u00dfe', pt: 'Ta\u00e7a' },
    difference: { en: 'Difference', it: 'Differenza', es: 'Diferencia', fr: 'Diff\u00e9rence', de: 'Differenz', pt: 'Diferen\u00e7a' },
    howToMeasure: { en: 'How to Measure', it: 'Come Misurare', es: 'C\u00f3mo Medir', fr: 'Comment Mesurer', de: 'So Messen Sie', pt: 'Como Medir' },
    step1: { en: 'Measure your band size (underbust) snugly around your ribcage', it: 'Misura la fascia (sottoseno) aderente alla cassa toracica', es: 'Mide tu contorno bajo el busto ajustado a la caja tor\u00e1cica', fr: 'Mesurez le dessous de poitrine serr\u00e9 autour de la cage thoracique', de: 'Messen Sie die Unterbrustweite eng um den Brustkorb', pt: 'Me\u00e7a a faixa abaixo do busto ajustada \u00e0 caixa tor\u00e1cica' },
    step2: { en: 'Measure your bust at the fullest point, keeping the tape level', it: 'Misura il busto nel punto pi\u00f9 pieno, tenendo il metro livellato', es: 'Mide tu busto en el punto m\u00e1s lleno, manteniendo la cinta nivelada', fr: 'Mesurez votre poitrine au point le plus fort, en gardant le m\u00e8tre niveau', de: 'Messen Sie den Brustumfang an der vollsten Stelle, halten Sie das Ma\u00dfband waagerecht', pt: 'Me\u00e7a o busto no ponto mais cheio, mantendo a fita nivelada' },
  } as Record<string, Record<Locale, string>>;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Bra Size Calculator \u2014 Find Your Perfect Fit',
      paragraphs: [
        'Finding the right bra size is essential for comfort and support. Studies show that up to 80% of women wear the wrong bra size. Our Bra Size Calculator helps you find your perfect fit using simple measurements.',
        'All you need is a soft measuring tape. Measure your band size (underbust) and bust size (at the fullest point), then enter the measurements here. The calculator shows your size in US, UK, and EU systems.',
        'The cup size is determined by the difference between your bust and band measurements. Each inch (2.5 cm) of difference represents one cup size, starting from AA.',
        'Remember that bra sizes can vary between brands and styles. Use this calculator as a starting point and always try on bras before purchasing when possible.',
      ],
      faq: [
        { q: 'How do I measure my bra size at home?', a: 'Use a soft measuring tape. For the band, measure snugly around your ribcage just under your bust. For the bust, measure at the fullest point with the tape parallel to the ground. Wear a non-padded bra for accuracy.' },
        { q: 'What if I\'m between sizes?', a: 'If you\'re between sizes, try both the smaller and larger size. Consider "sister sizes" \u2014 for example, 34C, 32D, and 36B have similar cup volumes.' },
        { q: 'Do bra sizes vary between brands?', a: 'Yes, bra sizes can vary significantly between brands and styles. Use this calculator as a guide, and always try on bras when possible.' },
        { q: 'How often should I measure my bra size?', a: 'It\'s recommended to re-measure every 6-12 months, as your body can change due to weight fluctuations, hormones, aging, or exercise.' },
        { q: 'What are sister sizes?', a: 'Sister sizes are bra sizes that have the same cup volume but different band sizes. For example, 32D, 34C, and 36B are sister sizes \u2014 the cups hold the same volume.' },
      ],
    },
    it: {
      title: 'Calcolatore Taglia Reggiseno Gratuito \u2014 Trova la Tua Misura Perfetta',
      paragraphs: [
        'Trovare la taglia di reggiseno giusta \u00e8 essenziale per comfort e supporto. Il nostro calcolatore ti aiuta a trovare la misura perfetta con semplici misurazioni.',
        'Misura la fascia (sottoseno) e il busto (nel punto pi\u00f9 pieno), poi inserisci le misure. Il calcolatore mostra la taglia in sistemi US, UK e EU.',
        'La coppa \u00e8 determinata dalla differenza tra busto e fascia. Ogni 2,5 cm di differenza rappresenta una coppa.',
        'Ricorda che le taglie possono variare tra marchi. Usa questo calcolatore come punto di partenza.',
      ],
      faq: [
        { q: 'Come misuro la taglia del reggiseno a casa?', a: 'Usa un metro morbido. Misura la fascia aderente sotto il seno e il busto nel punto pi\u00f9 pieno.' },
        { q: 'E se sono tra due taglie?', a: 'Prova entrambe. Considera le \"taglie sorelle\" \u2014 ad esempio, 34C, 32D e 36B hanno volumi simili.' },
        { q: 'Le taglie variano tra i marchi?', a: 'S\u00ec, possono variare significativamente. Usa il calcolatore come guida.' },
        { q: 'Quanto spesso dovrei misurarmi?', a: '\u00c8 consigliato rimisurare ogni 6-12 mesi.' },
        { q: 'Cosa sono le taglie sorelle?', a: 'Taglie con lo stesso volume della coppa ma fascia diversa. Ad esempio, 32D, 34C e 36B.' },
      ],
    },
    es: {
      title: 'Calculadora de Talla de Sujetador Gratis \u2014 Encuentra tu Talla Perfecta',
      paragraphs: ['Encontrar la talla correcta es esencial para comodidad y soporte.', 'Mide tu contorno y busto, luego ingresa las medidas.', 'La copa se determina por la diferencia entre busto y contorno.', 'Las tallas pueden variar entre marcas.'],
      faq: [
        { q: '\u00bfC\u00f3mo mido mi talla en casa?', a: 'Usa una cinta m\u00e9trica suave. Mide bajo el busto y en el punto m\u00e1s lleno.' },
        { q: '\u00bfQu\u00e9 si estoy entre tallas?', a: 'Prueba ambas. Considera las \"tallas hermanas\".' },
        { q: '\u00bfLas tallas var\u00edan entre marcas?', a: 'S\u00ed, pueden variar significativamente.' },
        { q: '\u00bfCada cu\u00e1nto debo medirme?', a: 'Se recomienda cada 6-12 meses.' },
        { q: '\u00bfQu\u00e9 son las tallas hermanas?', a: 'Tallas con el mismo volumen de copa pero diferente contorno.' },
      ],
    },
    fr: {
      title: 'Calculateur de Taille de Soutien-gorge Gratuit \u2014 Trouvez votre Taille',
      paragraphs: ['Trouver la bonne taille est essentiel pour le confort.', 'Mesurez votre tour de dessous de poitrine et de poitrine.', 'Le bonnet est d\u00e9termin\u00e9 par la diff\u00e9rence entre poitrine et dessous.', 'Les tailles varient entre les marques.'],
      faq: [
        { q: 'Comment mesurer ma taille \u00e0 la maison ?', a: 'Utilisez un m\u00e8tre souple. Mesurez sous la poitrine et au point le plus fort.' },
        { q: 'Et si je suis entre deux tailles ?', a: 'Essayez les deux. Consid\u00e9rez les \"tailles s\u0153urs\".' },
        { q: 'Les tailles varient-elles entre marques ?', a: 'Oui, elles peuvent varier significativement.' },
        { q: '\u00c0 quelle fr\u00e9quence dois-je me mesurer ?', a: 'Il est recommand\u00e9 de se remesurer tous les 6-12 mois.' },
        { q: 'Que sont les tailles s\u0153urs ?', a: 'Des tailles avec le m\u00eame volume de bonnet mais un tour diff\u00e9rent.' },
      ],
    },
    de: {
      title: 'Kostenloser BH-Gr\u00f6\u00dfen-Rechner \u2014 Finden Sie Ihre Gr\u00f6\u00dfe',
      paragraphs: ['Die richtige BH-Gr\u00f6\u00dfe ist wichtig f\u00fcr Komfort und Halt.', 'Messen Sie Unterbrustweite und Brustumfang.', 'Die K\u00f6rbchengr\u00f6\u00dfe wird durch die Differenz bestimmt.', 'Gr\u00f6\u00dfen k\u00f6nnen zwischen Marken variieren.'],
      faq: [
        { q: 'Wie messe ich meine BH-Gr\u00f6\u00dfe zu Hause?', a: 'Verwenden Sie ein weiches Ma\u00dfband. Messen Sie unter der Brust und am vollsten Punkt.' },
        { q: 'Was wenn ich zwischen Gr\u00f6\u00dfen bin?', a: 'Probieren Sie beide. Ber\u00fccksichtigen Sie \"Schwestergr\u00f6\u00dfen\".' },
        { q: 'Variieren Gr\u00f6\u00dfen zwischen Marken?', a: 'Ja, sie k\u00f6nnen erheblich variieren.' },
        { q: 'Wie oft sollte ich messen?', a: 'Alle 6-12 Monate empfohlen.' },
        { q: 'Was sind Schwestergr\u00f6\u00dfen?', a: 'Gr\u00f6\u00dfen mit gleichem K\u00f6rbchenvolumen aber anderem Umfang.' },
      ],
    },
    pt: {
      title: 'Calculadora de Tamanho de Suti\u00e3 Gr\u00e1tis \u2014 Encontre seu Tamanho',
      paragraphs: ['Encontrar o tamanho certo \u00e9 essencial para conforto e suporte.', 'Me\u00e7a sua faixa e busto, depois insira as medidas.', 'A ta\u00e7a \u00e9 determinada pela diferen\u00e7a entre busto e faixa.', 'Os tamanhos podem variar entre marcas.'],
      faq: [
        { q: 'Como medir meu tamanho em casa?', a: 'Use uma fita m\u00e9trica flex\u00edvel. Me\u00e7a abaixo do busto e no ponto mais cheio.' },
        { q: 'E se estou entre tamanhos?', a: 'Experimente ambos. Considere os \"tamanhos irm\u00e3os\".' },
        { q: 'Os tamanhos variam entre marcas?', a: 'Sim, podem variar significativamente.' },
        { q: 'Com que frequ\u00eancia devo medir?', a: 'Recomenda-se a cada 6-12 meses.' },
        { q: 'O que s\u00e3o tamanhos irm\u00e3os?', a: 'Tamanhos com mesmo volume de ta\u00e7a mas faixa diferente.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="bra-size-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setUnit('cm')} className={`flex-1 py-2 rounded-lg font-medium text-sm ${unit === 'cm' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{labels.cm[lang]}</button>
            <button onClick={() => setUnit('in')} className={`flex-1 py-2 rounded-lg font-medium text-sm ${unit === 'in' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{labels.inches[lang]}</button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.bandSize[lang]} ({unit})</label>
            <input type="number" value={bandSize} onChange={(e) => setBandSize(e.target.value)} placeholder={unit === 'cm' ? '75' : '30'} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.bustSize[lang]} ({unit})</label>
            <input type="number" value={bustSize} onChange={(e) => setBustSize(e.target.value)} placeholder={unit === 'cm' ? '90' : '36'} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          {usSize && (
            <>
              <div className="bg-pink-50 border border-pink-200 rounded-xl p-5 text-center">
                <div className="text-xs text-pink-600 font-medium mb-1">{labels.yourSize[lang]}</div>
                <div className="text-4xl font-bold text-gray-900">{usSize}</div>
                <div className="text-sm text-gray-500 mt-1">{labels.cup[lang]}: {cupSize} | {labels.difference[lang]}: {diff.toFixed(1)} cm</div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">US</div>
                  <div className="text-lg font-bold text-gray-900">{usSize}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">UK</div>
                  <div className="text-lg font-bold text-gray-900">{ukSize}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">EU</div>
                  <div className="text-lg font-bold text-gray-900">{euSize}</div>
                </div>
              </div>
            </>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">{labels.howToMeasure[lang]}</h3>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>{labels.step1[lang]}</li>
              <li>{labels.step2[lang]}</li>
            </ol>
          </div>
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
