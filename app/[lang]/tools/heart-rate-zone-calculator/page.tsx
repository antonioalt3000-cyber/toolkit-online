'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function HeartRateZoneCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['heart-rate-zone-calculator'][lang];

  const [age, setAge] = useState('');
  const [restingHR, setRestingHR] = useState('');
  const [method, setMethod] = useState<'max' | 'karvonen'>('max');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const ageNum = parseInt(age) || 0;
  const rhr = parseInt(restingHR) || 60;
  const maxHR = 220 - ageNum;
  const hrr = maxHR - rhr;

  const zones = method === 'karvonen' ? [
    { name: { en: 'Zone 1 - Recovery', it: 'Zona 1 - Recupero', es: 'Zona 1 - Recuperaci\u00f3n', fr: 'Zone 1 - R\u00e9cup\u00e9ration', de: 'Zone 1 - Erholung', pt: 'Zona 1 - Recupera\u00e7\u00e3o' }, min: Math.round(hrr * 0.50 + rhr), max: Math.round(hrr * 0.60 + rhr), color: 'bg-blue-100 border-blue-300 text-blue-800', pct: '50-60%' },
    { name: { en: 'Zone 2 - Fat Burning', it: 'Zona 2 - Brucia Grassi', es: 'Zona 2 - Quema Grasa', fr: 'Zone 2 - Br\u00fblage Graisses', de: 'Zone 2 - Fettverbrennung', pt: 'Zona 2 - Queima Gordura' }, min: Math.round(hrr * 0.60 + rhr), max: Math.round(hrr * 0.70 + rhr), color: 'bg-green-100 border-green-300 text-green-800', pct: '60-70%' },
    { name: { en: 'Zone 3 - Aerobic', it: 'Zona 3 - Aerobica', es: 'Zona 3 - Aer\u00f3bica', fr: 'Zone 3 - A\u00e9robie', de: 'Zone 3 - Aerob', pt: 'Zona 3 - Aer\u00f3bica' }, min: Math.round(hrr * 0.70 + rhr), max: Math.round(hrr * 0.80 + rhr), color: 'bg-yellow-100 border-yellow-300 text-yellow-800', pct: '70-80%' },
    { name: { en: 'Zone 4 - Anaerobic', it: 'Zona 4 - Anaerobica', es: 'Zona 4 - Anaer\u00f3bica', fr: 'Zone 4 - Ana\u00e9robie', de: 'Zone 4 - Anaerob', pt: 'Zona 4 - Anaer\u00f3bica' }, min: Math.round(hrr * 0.80 + rhr), max: Math.round(hrr * 0.90 + rhr), color: 'bg-orange-100 border-orange-300 text-orange-800', pct: '80-90%' },
    { name: { en: 'Zone 5 - Maximum', it: 'Zona 5 - Massimo', es: 'Zona 5 - M\u00e1ximo', fr: 'Zone 5 - Maximum', de: 'Zone 5 - Maximum', pt: 'Zona 5 - M\u00e1ximo' }, min: Math.round(hrr * 0.90 + rhr), max: maxHR, color: 'bg-red-100 border-red-300 text-red-800', pct: '90-100%' },
  ] : [
    { name: { en: 'Zone 1 - Recovery', it: 'Zona 1 - Recupero', es: 'Zona 1 - Recuperaci\u00f3n', fr: 'Zone 1 - R\u00e9cup\u00e9ration', de: 'Zone 1 - Erholung', pt: 'Zona 1 - Recupera\u00e7\u00e3o' }, min: Math.round(maxHR * 0.50), max: Math.round(maxHR * 0.60), color: 'bg-blue-100 border-blue-300 text-blue-800', pct: '50-60%' },
    { name: { en: 'Zone 2 - Fat Burning', it: 'Zona 2 - Brucia Grassi', es: 'Zona 2 - Quema Grasa', fr: 'Zone 2 - Br\u00fblage Graisses', de: 'Zone 2 - Fettverbrennung', pt: 'Zona 2 - Queima Gordura' }, min: Math.round(maxHR * 0.60), max: Math.round(maxHR * 0.70), color: 'bg-green-100 border-green-300 text-green-800', pct: '60-70%' },
    { name: { en: 'Zone 3 - Aerobic', it: 'Zona 3 - Aerobica', es: 'Zona 3 - Aer\u00f3bica', fr: 'Zone 3 - A\u00e9robie', de: 'Zone 3 - Aerob', pt: 'Zona 3 - Aer\u00f3bica' }, min: Math.round(maxHR * 0.70), max: Math.round(maxHR * 0.80), color: 'bg-yellow-100 border-yellow-300 text-yellow-800', pct: '70-80%' },
    { name: { en: 'Zone 4 - Anaerobic', it: 'Zona 4 - Anaerobica', es: 'Zona 4 - Anaer\u00f3bica', fr: 'Zone 4 - Ana\u00e9robie', de: 'Zone 4 - Anaerob', pt: 'Zona 4 - Anaer\u00f3bica' }, min: Math.round(maxHR * 0.80), max: Math.round(maxHR * 0.90), color: 'bg-orange-100 border-orange-300 text-orange-800', pct: '80-90%' },
    { name: { en: 'Zone 5 - Maximum', it: 'Zona 5 - Massimo', es: 'Zona 5 - M\u00e1ximo', fr: 'Zone 5 - Maximum', de: 'Zone 5 - Maximum', pt: 'Zona 5 - M\u00e1ximo' }, min: Math.round(maxHR * 0.90), max: maxHR, color: 'bg-red-100 border-red-300 text-red-800', pct: '90-100%' },
  ];

  const labels = {
    age: { en: 'Your Age', it: 'La Tua Et\u00e0', es: 'Tu Edad', fr: 'Votre \u00c2ge', de: 'Ihr Alter', pt: 'Sua Idade' },
    restingHR: { en: 'Resting Heart Rate (BPM)', it: 'Frequenza Cardiaca a Riposo (BPM)', es: 'Frecuencia Card\u00edaca en Reposo (BPM)', fr: 'Fr\u00e9quence Cardiaque au Repos (BPM)', de: 'Ruheherzfrequenz (BPM)', pt: 'Frequ\u00eancia Card\u00edaca em Repouso (BPM)' },
    maxHR: { en: 'Max Heart Rate', it: 'Frequenza Cardiaca Massima', es: 'Frecuencia Card\u00edaca M\u00e1xima', fr: 'Fr\u00e9quence Cardiaque Maximale', de: 'Maximale Herzfrequenz', pt: 'Frequ\u00eancia Card\u00edaca M\u00e1xima' },
    maxMethod: { en: '% of Max HR', it: '% della FC Max', es: '% de FC M\u00e1x', fr: '% de FC Max', de: '% der max. HF', pt: '% da FC M\u00e1x' },
    karvonen: { en: 'Karvonen Method', it: 'Metodo Karvonen', es: 'M\u00e9todo Karvonen', fr: 'M\u00e9thode Karvonen', de: 'Karvonen-Methode', pt: 'M\u00e9todo Karvonen' },
    bpm: { en: 'BPM', it: 'BPM', es: 'LPM', fr: 'BPM', de: 'BPM', pt: 'BPM' },
  } as Record<string, Record<Locale, string>>;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Heart Rate Zone Calculator \u2014 Find Your Training Zones',
      paragraphs: [
        'The Heart Rate Zone Calculator helps you find your optimal training heart rate zones for more effective workouts. Training in the right zone maximizes your fitness goals, whether it\'s fat burning, endurance, or performance.',
        'The calculator supports two methods: simple percentage of maximum heart rate (220 - age), and the more accurate Karvonen method that factors in your resting heart rate for personalized zones.',
        'Zone 1 (50-60%) is for warm-up and recovery. Zone 2 (60-70%) is the fat-burning zone ideal for long, easy sessions. Zone 3 (70-80%) builds aerobic fitness. Zone 4 (80-90%) improves speed and anaerobic threshold. Zone 5 (90-100%) is maximum effort for short bursts.',
        'For best results, spend 80% of your training time in Zones 1-2 and 20% in Zones 3-5. This polarized approach, used by elite athletes, builds a strong aerobic base while improving performance.',
      ],
      faq: [
        { q: 'How do I calculate my maximum heart rate?', a: 'The most common formula is 220 minus your age. For example, a 30-year-old has an estimated max HR of 190 BPM. This is an estimate \u2014 actual max HR varies between individuals.' },
        { q: 'What is the Karvonen method?', a: 'The Karvonen method uses your heart rate reserve (max HR - resting HR) to calculate training zones. It\'s more personalized because it accounts for your fitness level through resting heart rate.' },
        { q: 'Which zone is best for fat burning?', a: 'Zone 2 (60-70% of max HR) is traditionally the "fat-burning zone" where the highest percentage of calories comes from fat. However, higher-intensity zones burn more total calories.' },
        { q: 'How do I find my resting heart rate?', a: 'Measure your pulse first thing in the morning before getting out of bed. Count beats for 60 seconds, or for 15 seconds and multiply by 4. Average over several days for accuracy.' },
      ],
    },
    it: {
      title: 'Calcolatore Zone Frequenza Cardiaca Gratuito \u2014 Trova le Tue Zone di Allenamento',
      paragraphs: ['Il calcolatore ti aiuta a trovare le zone ottimali di allenamento.', 'Supporta il metodo percentuale e il metodo Karvonen pi\u00f9 accurato.', 'Ogni zona ha benefici diversi per il tuo allenamento.', 'L\'approccio polarizzato (80% zone basse, 20% zone alte) \u00e8 il pi\u00f9 efficace.'],
      faq: [
        { q: 'Come calcolo la frequenza cardiaca massima?', a: 'La formula pi\u00f9 comune \u00e8 220 meno la tua et\u00e0.' },
        { q: 'Cos\'\u00e8 il metodo Karvonen?', a: 'Usa la riserva di frequenza cardiaca per zone pi\u00f9 personalizzate.' },
        { q: 'Quale zona \u00e8 migliore per bruciare grassi?', a: 'La Zona 2 (60-70%) \u00e8 la zona brucia grassi tradizionale.' },
        { q: 'Come trovo la frequenza a riposo?', a: 'Misura il polso appena sveglio, prima di alzarti dal letto.' },
      ],
    },
    es: {
      title: 'Calculadora de Zonas de Frecuencia Card\u00edaca Gratis',
      paragraphs: ['La calculadora te ayuda a encontrar tus zonas de entrenamiento.', 'Soporta el m\u00e9todo porcentual y Karvonen.', 'Cada zona tiene beneficios diferentes.', 'El enfoque polarizado es el m\u00e1s efectivo.'],
      faq: [
        { q: '\u00bfC\u00f3mo calculo mi frecuencia m\u00e1xima?', a: '220 menos tu edad.' },
        { q: '\u00bfQu\u00e9 es el m\u00e9todo Karvonen?', a: 'Usa la reserva de frecuencia para zonas personalizadas.' },
        { q: '\u00bfQu\u00e9 zona quema m\u00e1s grasa?', a: 'La Zona 2 (60-70%).' },
        { q: '\u00bfC\u00f3mo encuentro mi frecuencia en reposo?', a: 'Mide tu pulso al despertar.' },
      ],
    },
    fr: {
      title: 'Calculateur de Zones de Fr\u00e9quence Cardiaque Gratuit',
      paragraphs: ['Le calculateur vous aide \u00e0 trouver vos zones d\'entra\u00eenement.', 'Supporte la m\u00e9thode pourcentage et Karvonen.', 'Chaque zone a des b\u00e9n\u00e9fices diff\u00e9rents.', 'L\'approche polaris\u00e9e est la plus efficace.'],
      faq: [
        { q: 'Comment calculer ma fr\u00e9quence maximale ?', a: '220 moins votre \u00e2ge.' },
        { q: 'Qu\'est-ce que la m\u00e9thode Karvonen ?', a: 'Utilise la r\u00e9serve de fr\u00e9quence pour des zones personnalis\u00e9es.' },
        { q: 'Quelle zone br\u00fble le plus de graisse ?', a: 'La Zone 2 (60-70%).' },
        { q: 'Comment trouver ma fr\u00e9quence au repos ?', a: 'Mesurez votre pouls au r\u00e9veil.' },
      ],
    },
    de: {
      title: 'Kostenloser Herzfrequenz-Zonen-Rechner',
      paragraphs: ['Der Rechner hilft Ihnen, Ihre Trainingszonen zu finden.', 'Unterst\u00fctzt Prozent- und Karvonen-Methode.', 'Jede Zone hat unterschiedliche Vorteile.', 'Der polarisierte Ansatz ist am effektivsten.'],
      faq: [
        { q: 'Wie berechne ich meine maximale Herzfrequenz?', a: '220 minus Ihr Alter.' },
        { q: 'Was ist die Karvonen-Methode?', a: 'Nutzt die Herzfrequenzreserve f\u00fcr personalisierte Zonen.' },
        { q: 'Welche Zone verbrennt am meisten Fett?', a: 'Zone 2 (60-70%).' },
        { q: 'Wie finde ich meine Ruheherzfrequenz?', a: 'Messen Sie Ihren Puls morgens vor dem Aufstehen.' },
      ],
    },
    pt: {
      title: 'Calculadora de Zonas de Frequ\u00eancia Card\u00edaca Gr\u00e1tis',
      paragraphs: ['A calculadora ajuda a encontrar suas zonas de treino.', 'Suporta m\u00e9todo percentual e Karvonen.', 'Cada zona tem benef\u00edcios diferentes.', 'A abordagem polarizada \u00e9 a mais eficaz.'],
      faq: [
        { q: 'Como calculo minha frequ\u00eancia m\u00e1xima?', a: '220 menos sua idade.' },
        { q: 'O que \u00e9 o m\u00e9todo Karvonen?', a: 'Usa a reserva de frequ\u00eancia para zonas personalizadas.' },
        { q: 'Qual zona queima mais gordura?', a: 'Zona 2 (60-70%).' },
        { q: 'Como encontro minha frequ\u00eancia em repouso?', a: 'Me\u00e7a seu pulso ao acordar.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="heart-rate-zone-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setMethod('max')} className={`flex-1 py-2 rounded-lg font-medium text-sm ${method === 'max' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{labels.maxMethod[lang]}</button>
            <button onClick={() => setMethod('karvonen')} className={`flex-1 py-2 rounded-lg font-medium text-sm ${method === 'karvonen' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{labels.karvonen[lang]}</button>
          </div>

          <div className={`grid ${method === 'karvonen' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.age[lang]}</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="30" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            {method === 'karvonen' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{labels.restingHR[lang]}</label>
                <input type="number" value={restingHR} onChange={(e) => setRestingHR(e.target.value)} placeholder="60" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
          </div>

          {ageNum > 0 && (
            <>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <span className="text-sm text-gray-500">{labels.maxHR[lang]}: </span>
                <span className="text-2xl font-bold text-gray-900">{maxHR}</span>
                <span className="text-sm text-gray-500"> {labels.bpm[lang]}</span>
              </div>

              <div className="space-y-2">
                {zones.map((zone, i) => (
                  <div key={i} className={`rounded-lg border p-3 flex justify-between items-center ${zone.color}`}>
                    <div>
                      <div className="font-medium text-sm">{zone.name[lang]}</div>
                      <div className="text-xs opacity-75">{zone.pct}</div>
                    </div>
                    <div className="text-xl font-bold">{zone.min} - {zone.max} <span className="text-sm font-normal">{labels.bpm[lang]}</span></div>
                  </div>
                ))}
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
