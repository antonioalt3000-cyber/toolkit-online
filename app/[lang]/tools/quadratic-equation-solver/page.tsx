'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function QuadraticEquationSolver() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['quadratic-equation-solver'][lang];

  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const aNum = parseFloat(a) || 0;
  const bNum = parseFloat(b) || 0;
  const cNum = parseFloat(c) || 0;

  const discriminant = bNum * bNum - 4 * aNum * cNum;
  const hasRealRoots = discriminant >= 0;
  const hasSolution = aNum !== 0;

  let x1 = '', x2 = '', x1i = '', x2i = '';
  if (hasSolution) {
    if (hasRealRoots) {
      const r1 = (-bNum + Math.sqrt(discriminant)) / (2 * aNum);
      const r2 = (-bNum - Math.sqrt(discriminant)) / (2 * aNum);
      x1 = r1.toFixed(6).replace(/\.?0+$/, '');
      x2 = r2.toFixed(6).replace(/\.?0+$/, '');
    } else {
      const realPart = (-bNum / (2 * aNum)).toFixed(4).replace(/\.?0+$/, '');
      const imagPart = (Math.sqrt(-discriminant) / (2 * aNum)).toFixed(4).replace(/\.?0+$/, '');
      x1i = `${realPart} + ${imagPart}i`;
      x2i = `${realPart} - ${imagPart}i`;
    }
  }

  const vertex = hasSolution ? { x: -bNum / (2 * aNum), y: aNum * Math.pow(-bNum / (2 * aNum), 2) + bNum * (-bNum / (2 * aNum)) + cNum } : null;

  const labels = {
    coeffA: { en: 'Coefficient a', it: 'Coefficiente a', es: 'Coeficiente a', fr: 'Coefficient a', de: 'Koeffizient a', pt: 'Coeficiente a' },
    coeffB: { en: 'Coefficient b', it: 'Coefficiente b', es: 'Coeficiente b', fr: 'Coefficient b', de: 'Koeffizient b', pt: 'Coeficiente b' },
    coeffC: { en: 'Coefficient c', it: 'Coefficiente c', es: 'Coeficiente c', fr: 'Coefficient c', de: 'Koeffizient c', pt: 'Coeficiente c' },
    equation: { en: 'Equation', it: 'Equazione', es: 'Ecuaci\u00f3n', fr: '\u00c9quation', de: 'Gleichung', pt: 'Equa\u00e7\u00e3o' },
    roots: { en: 'Roots (Solutions)', it: 'Radici (Soluzioni)', es: 'Ra\u00edces (Soluciones)', fr: 'Racines (Solutions)', de: 'L\u00f6sungen (Wurzeln)', pt: 'Ra\u00edzes (Solu\u00e7\u00f5es)' },
    discriminant: { en: 'Discriminant', it: 'Discriminante', es: 'Discriminante', fr: 'Discriminant', de: 'Diskriminante', pt: 'Discriminante' },
    vertex: { en: 'Vertex', it: 'Vertice', es: 'V\u00e9rtice', fr: 'Sommet', de: 'Scheitel', pt: 'V\u00e9rtice' },
    realRoots: { en: 'Two real roots', it: 'Due radici reali', es: 'Dos ra\u00edces reales', fr: 'Deux racines r\u00e9elles', de: 'Zwei reelle L\u00f6sungen', pt: 'Duas ra\u00edzes reais' },
    oneRoot: { en: 'One repeated root', it: 'Una radice doppia', es: 'Una ra\u00edz repetida', fr: 'Une racine double', de: 'Eine doppelte L\u00f6sung', pt: 'Uma raiz repetida' },
    complexRoots: { en: 'Two complex roots', it: 'Due radici complesse', es: 'Dos ra\u00edces complejas', fr: 'Deux racines complexes', de: 'Zwei komplexe L\u00f6sungen', pt: 'Duas ra\u00edzes complexas' },
    steps: { en: 'Step-by-step Solution', it: 'Soluzione Passo per Passo', es: 'Soluci\u00f3n Paso a Paso', fr: 'Solution \u00c9tape par \u00c9tape', de: 'Schritt-f\u00fcr-Schritt-L\u00f6sung', pt: 'Solu\u00e7\u00e3o Passo a Passo' },
  } as Record<string, Record<Locale, string>>;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Quadratic Equation Solver \u2014 Solve ax\u00b2 + bx + c = 0 Online',
      paragraphs: [
        'The Quadratic Equation Solver helps you solve any quadratic equation in the form ax\u00b2 + bx + c = 0. Simply enter the coefficients a, b, and c, and the calculator finds both real and complex roots instantly.',
        'The quadratic formula x = (-b \u00b1 \u221a(b\u00b2-4ac)) / 2a is one of the most fundamental formulas in algebra. Our solver applies this formula and shows you the discriminant, roots, vertex, and step-by-step solution.',
        'The discriminant (\u0394 = b\u00b2 - 4ac) determines the nature of the roots: if \u0394 > 0, there are two distinct real roots; if \u0394 = 0, there is one repeated root; if \u0394 < 0, there are two complex conjugate roots.',
        'This tool is perfect for students learning algebra, teachers preparing examples, and anyone who needs quick quadratic equation solutions.',
      ],
      faq: [
        { q: 'What is the quadratic formula?', a: 'The quadratic formula is x = (-b \u00b1 \u221a(b\u00b2-4ac)) / 2a. It solves any equation in the form ax\u00b2 + bx + c = 0 where a \u2260 0.' },
        { q: 'What is the discriminant?', a: 'The discriminant is \u0394 = b\u00b2 - 4ac. It tells you the nature of the roots: positive means two real roots, zero means one repeated root, negative means complex roots.' },
        { q: 'Can this solver handle complex roots?', a: 'Yes! When the discriminant is negative, the solver shows both complex conjugate roots in the form a + bi and a - bi.' },
        { q: 'What if coefficient a is zero?', a: 'If a = 0, the equation becomes linear (bx + c = 0), not quadratic. The solution is simply x = -c/b.' },
      ],
    },
    it: {
      title: 'Risolutore Equazioni di Secondo Grado Gratuito \u2014 Risolvi ax\u00b2 + bx + c = 0',
      paragraphs: ['Il risolutore ti aiuta a risolvere qualsiasi equazione di secondo grado.', 'Inserisci i coefficienti e il calcolatore trova le radici istantaneamente.', 'Il discriminante determina la natura delle radici.', 'Perfetto per studenti e insegnanti di algebra.'],
      faq: [
        { q: 'Cos\'\u00e8 la formula quadratica?', a: 'x = (-b \u00b1 \u221a(b\u00b2-4ac)) / 2a. Risolve ogni equazione ax\u00b2 + bx + c = 0.' },
        { q: 'Cos\'\u00e8 il discriminante?', a: '\u0394 = b\u00b2 - 4ac. Positivo = due radici reali, zero = radice doppia, negativo = radici complesse.' },
        { q: 'Gestisce le radici complesse?', a: 'S\u00ec! Mostra entrambe le radici coniugate complesse.' },
        { q: 'E se a \u00e8 zero?', a: 'Diventa un\'equazione lineare: x = -c/b.' },
      ],
    },
    es: {
      title: 'Resolvedor de Ecuaciones Cuadr\u00e1ticas Gratis',
      paragraphs: ['El resolvedor te ayuda a resolver cualquier ecuaci\u00f3n cuadr\u00e1tica.', 'Ingresa los coeficientes y obtiene las ra\u00edces instant\u00e1neamente.', 'El discriminante determina la naturaleza de las ra\u00edces.', 'Perfecto para estudiantes y profesores.'],
      faq: [
        { q: '\u00bfQu\u00e9 es la f\u00f3rmula cuadr\u00e1tica?', a: 'x = (-b \u00b1 \u221a(b\u00b2-4ac)) / 2a.' },
        { q: '\u00bfQu\u00e9 es el discriminante?', a: '\u0394 = b\u00b2 - 4ac determina el tipo de ra\u00edces.' },
        { q: '\u00bfManeja ra\u00edces complejas?', a: '\u00a1S\u00ed!' },
        { q: '\u00bfY si a es cero?', a: 'Se convierte en ecuaci\u00f3n lineal.' },
      ],
    },
    fr: {
      title: 'Solveur d\'\u00c9quations du Second Degr\u00e9 Gratuit',
      paragraphs: ['Le solveur vous aide \u00e0 r\u00e9soudre toute \u00e9quation du second degr\u00e9.', 'Entrez les coefficients et obtenez les racines instantan\u00e9ment.', 'Le discriminant d\u00e9termine la nature des racines.', 'Parfait pour \u00e9tudiants et enseignants.'],
      faq: [
        { q: 'Qu\'est-ce que la formule quadratique ?', a: 'x = (-b \u00b1 \u221a(b\u00b2-4ac)) / 2a.' },
        { q: 'Qu\'est-ce que le discriminant ?', a: '\u0394 = b\u00b2 - 4ac d\u00e9termine le type de racines.' },
        { q: 'G\u00e8re-t-il les racines complexes ?', a: 'Oui !' },
        { q: 'Et si a vaut z\u00e9ro ?', a: 'L\'\u00e9quation devient lin\u00e9aire.' },
      ],
    },
    de: {
      title: 'Kostenloser Quadratische-Gleichungen-L\u00f6ser',
      paragraphs: ['Der L\u00f6ser hilft Ihnen, jede quadratische Gleichung zu l\u00f6sen.', 'Geben Sie die Koeffizienten ein und erhalten Sie die L\u00f6sungen.', 'Die Diskriminante bestimmt die Art der L\u00f6sungen.', 'Perfekt f\u00fcr Sch\u00fcler und Lehrer.'],
      faq: [
        { q: 'Was ist die quadratische Formel?', a: 'x = (-b \u00b1 \u221a(b\u00b2-4ac)) / 2a.' },
        { q: 'Was ist die Diskriminante?', a: '\u0394 = b\u00b2 - 4ac bestimmt die Art der L\u00f6sungen.' },
        { q: 'Werden komplexe L\u00f6sungen unterst\u00fctzt?', a: 'Ja!' },
        { q: 'Was wenn a null ist?', a: 'Es wird eine lineare Gleichung.' },
      ],
    },
    pt: {
      title: 'Resolvedor de Equa\u00e7\u00f5es Quadr\u00e1ticas Gr\u00e1tis',
      paragraphs: ['O resolvedor ajuda a resolver qualquer equa\u00e7\u00e3o quadr\u00e1tica.', 'Insira os coeficientes e obtenha as ra\u00edzes instantaneamente.', 'O discriminante determina a natureza das ra\u00edzes.', 'Perfeito para estudantes e professores.'],
      faq: [
        { q: 'O que \u00e9 a f\u00f3rmula quadr\u00e1tica?', a: 'x = (-b \u00b1 \u221a(b\u00b2-4ac)) / 2a.' },
        { q: 'O que \u00e9 o discriminante?', a: '\u0394 = b\u00b2 - 4ac determina o tipo de ra\u00edzes.' },
        { q: 'Suporta ra\u00edzes complexas?', a: 'Sim!' },
        { q: 'E se a for zero?', a: 'Torna-se equa\u00e7\u00e3o linear.' },
      ],
    },
  };

  const seo = seoContent[lang];

  const eqString = hasSolution ? `${aNum}x\u00b2 ${bNum >= 0 ? '+' : ''} ${bNum}x ${cNum >= 0 ? '+' : ''} ${cNum} = 0` : '';

  return (
    <ToolPageWrapper toolSlug="quadratic-equation-solver" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="text-center text-lg font-mono text-gray-700 bg-gray-50 rounded-lg p-3">
            ax\u00b2 + bx + c = 0
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.coeffA[lang]}</label>
              <input type="number" value={a} onChange={(e) => setA(e.target.value)} placeholder="1" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg text-center focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.coeffB[lang]}</label>
              <input type="number" value={b} onChange={(e) => setB(e.target.value)} placeholder="-5" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg text-center focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.coeffC[lang]}</label>
              <input type="number" value={c} onChange={(e) => setC(e.target.value)} placeholder="6" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg text-center focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {hasSolution && (
            <>
              <div className="bg-gray-50 rounded-lg p-3 text-center font-mono text-lg">{eqString}</div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <div className="text-xs text-blue-600 font-medium mb-2">{labels.roots[lang]}</div>
                {hasRealRoots ? (
                  <div className="space-y-2">
                    <div className="text-center">
                      <span className="text-sm text-gray-500">x\u2081 = </span>
                      <span className="text-2xl font-bold text-gray-900">{x1}</span>
                    </div>
                    {x1 !== x2 && (
                      <div className="text-center">
                        <span className="text-sm text-gray-500">x\u2082 = </span>
                        <span className="text-2xl font-bold text-gray-900">{x2}</span>
                      </div>
                    )}
                    <div className="text-xs text-center text-gray-500">
                      {discriminant === 0 ? labels.oneRoot[lang] : labels.realRoots[lang]}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-center"><span className="text-sm text-gray-500">x\u2081 = </span><span className="text-xl font-bold text-gray-900">{x1i}</span></div>
                    <div className="text-center"><span className="text-sm text-gray-500">x\u2082 = </span><span className="text-xl font-bold text-gray-900">{x2i}</span></div>
                    <div className="text-xs text-center text-gray-500">{labels.complexRoots[lang]}</div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">{labels.discriminant[lang]} (\u0394)</div>
                  <div className="text-xl font-bold text-gray-900">{discriminant.toFixed(2).replace(/\.?0+$/, '')}</div>
                </div>
                {vertex && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">{labels.vertex[lang]}</div>
                    <div className="text-xl font-bold text-gray-900">({vertex.x.toFixed(2).replace(/\.?0+$/, '')}, {vertex.y.toFixed(2).replace(/\.?0+$/, '')})</div>
                  </div>
                )}
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
