'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  amount: { en: 'Amount', it: 'Quantità', es: 'Cantidad', fr: 'Quantité', de: 'Menge', pt: 'Quantidade' },
  from: { en: 'From', it: 'Da', es: 'De', fr: 'De', de: 'Von', pt: 'De' },
  to: { en: 'To', it: 'A', es: 'A', fr: 'À', de: 'Zu', pt: 'Para' },
  result: { en: 'Result', it: 'Risultato', es: 'Resultado', fr: 'Résultat', de: 'Ergebnis', pt: 'Resultado' },
  volume: { en: 'Volume', it: 'Volume', es: 'Volumen', fr: 'Volume', de: 'Volumen', pt: 'Volume' },
  weight: { en: 'Weight', it: 'Peso', es: 'Peso', fr: 'Poids', de: 'Gewicht', pt: 'Peso' },
  quickRef: { en: 'Quick Reference', it: 'Riferimento Rapido', es: 'Referencia Rápida', fr: 'Référence Rapide', de: 'Kurzübersicht', pt: 'Referência Rápida' },
};

// Volume units in ml
const volumeUnits: Record<string, { label: Record<Locale, string>; ml: number }> = {
  ml: { label: { en: 'Milliliters (ml)', it: 'Millilitri (ml)', es: 'Mililitros (ml)', fr: 'Millilitres (ml)', de: 'Milliliter (ml)', pt: 'Mililitros (ml)' }, ml: 1 },
  l: { label: { en: 'Liters (L)', it: 'Litri (L)', es: 'Litros (L)', fr: 'Litres (L)', de: 'Liter (L)', pt: 'Litros (L)' }, ml: 1000 },
  tsp: { label: { en: 'Teaspoons (tsp)', it: 'Cucchiaini (tsp)', es: 'Cucharaditas (tsp)', fr: 'Cuillères à café (cc)', de: 'Teelöffel (TL)', pt: 'Colheres de chá (cc)' }, ml: 4.929 },
  tbsp: { label: { en: 'Tablespoons (tbsp)', it: 'Cucchiai (tbsp)', es: 'Cucharadas (tbsp)', fr: 'Cuillères à soupe (cs)', de: 'Esslöffel (EL)', pt: 'Colheres de sopa (cs)' }, ml: 14.787 },
  cup: { label: { en: 'Cups', it: 'Tazze', es: 'Tazas', fr: 'Tasses', de: 'Tassen', pt: 'Xícaras' }, ml: 236.588 },
  floz: { label: { en: 'Fluid Ounces (fl oz)', it: 'Once Fluide (fl oz)', es: 'Onzas Fluidas (fl oz)', fr: 'Onces Liquides (fl oz)', de: 'Flüssigunzen (fl oz)', pt: 'Onças Fluidas (fl oz)' }, ml: 29.574 },
};

// Weight units in grams
const weightUnits: Record<string, { label: Record<Locale, string>; g: number }> = {
  g: { label: { en: 'Grams (g)', it: 'Grammi (g)', es: 'Gramos (g)', fr: 'Grammes (g)', de: 'Gramm (g)', pt: 'Gramas (g)' }, g: 1 },
  kg: { label: { en: 'Kilograms (kg)', it: 'Chilogrammi (kg)', es: 'Kilogramos (kg)', fr: 'Kilogrammes (kg)', de: 'Kilogramm (kg)', pt: 'Quilogramas (kg)' }, g: 1000 },
  oz: { label: { en: 'Ounces (oz)', it: 'Once (oz)', es: 'Onzas (oz)', fr: 'Onces (oz)', de: 'Unzen (oz)', pt: 'Onças (oz)' }, g: 28.3495 },
  lb: { label: { en: 'Pounds (lb)', it: 'Libbre (lb)', es: 'Libras (lb)', fr: 'Livres (lb)', de: 'Pfund (lb)', pt: 'Libras (lb)' }, g: 453.592 },
};

type Category = 'volume' | 'weight';

export default function CookingConverter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['cooking-converter'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [category, setCategory] = useState<Category>('volume');
  const [amount, setAmount] = useState('1');
  const [fromUnit, setFromUnit] = useState('cup');
  const [toUnit, setToUnit] = useState('ml');

  const num = parseFloat(amount) || 0;

  let result = 0;
  if (category === 'volume') {
    const fromMl = volumeUnits[fromUnit]?.ml || 1;
    const toMl = volumeUnits[toUnit]?.ml || 1;
    result = (num * fromMl) / toMl;
  } else {
    const fromG = weightUnits[fromUnit]?.g || 1;
    const toG = weightUnits[toUnit]?.g || 1;
    result = (num * fromG) / toG;
  }

  const units = category === 'volume' ? volumeUnits : weightUnits;

  const switchCategory = (cat: Category) => {
    setCategory(cat);
    if (cat === 'volume') { setFromUnit('cup'); setToUnit('ml'); }
    else { setFromUnit('g'); setToUnit('oz'); }
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Cooking Unit Converter: Cups, Tablespoons, Grams & More',
      paragraphs: [
        'Cooking and baking require precise measurements, but recipes from around the world use different measurement systems. American recipes use cups and tablespoons, European recipes use grams and milliliters, and British recipes might use imperial ounces. Our free cooking converter bridges these gaps instantly, so you never have to guess quantities again.',
        'The tool handles both volume and weight conversions common in the kitchen. Volume conversions include milliliters, liters, teaspoons, tablespoons, cups, and fluid ounces. Weight conversions cover grams, kilograms, ounces, and pounds. A handy quick reference section shows the most commonly needed equivalents at a glance.',
        'Getting measurements right is especially critical in baking, where even small differences can affect the outcome. A recipe calling for 1 cup of flour means exactly 236.6 ml or about 16 tablespoons. Converting between US cups and metric milliliters or between ounces and grams ensures your cakes rise properly and your sauces have the right consistency.',
        'Whether you are following a French patisserie recipe that uses grams, an American cookie recipe with cups, or scaling a recipe up or down, this cooking converter handles the math so you can focus on creating delicious food. Bookmark this page and keep it handy whenever you are in the kitchen.',
      ],
      faq: [
        { q: 'How many tablespoons are in a cup?', a: 'There are 16 tablespoons in 1 US cup (236.6 ml). Each tablespoon equals approximately 14.8 ml or 3 teaspoons. This is one of the most useful conversions to remember when cooking.' },
        { q: 'How do I convert cups to grams for baking?', a: 'Cup-to-gram conversion depends on the ingredient because different ingredients have different densities. For example, 1 cup of all-purpose flour weighs about 125g, while 1 cup of sugar weighs about 200g. For liquid ingredients, 1 cup equals approximately 236 ml.' },
        { q: 'What is the difference between fluid ounces and ounces?', a: 'Fluid ounces (fl oz) measure volume, while ounces (oz) measure weight. 1 fluid ounce equals 29.6 ml of liquid. 1 ounce of weight equals 28.35 grams. They are different measurement types used for different purposes in cooking.' },
        { q: 'How do I convert a recipe from metric to US measurements?', a: 'Use this converter to switch between metric (ml, g) and US measurements (cups, tbsp, oz). For volume, divide milliliters by 236.6 to get cups. For weight, divide grams by 28.35 to get ounces or by 453.6 to get pounds.' },
        { q: 'Are US cups the same as UK cups?', a: 'No, US and UK cups differ. A US cup is 236.6 ml while a UK (imperial) cup is 284.1 ml. Always check which system your recipe uses. Most modern British recipes use metric measurements (ml and g) instead of imperial cups.' },
      ],
    },
    it: {
      title: 'Convertitore di Unità da Cucina: Tazze, Cucchiai, Grammi e Altro',
      paragraphs: [
        'Cucinare e fare dolci richiede misurazioni precise, ma le ricette di tutto il mondo utilizzano sistemi di misurazione diversi. Le ricette americane usano tazze e cucchiai, quelle europee grammi e millilitri, e quelle britanniche potrebbero usare once imperiali. Il nostro convertitore da cucina gratuito colma queste differenze istantaneamente.',
        'Lo strumento gestisce conversioni sia di volume che di peso comuni in cucina. Le conversioni di volume includono millilitri, litri, cucchiaini, cucchiai, tazze e once fluide. Le conversioni di peso coprono grammi, chilogrammi, once e libbre. Una sezione di riferimento rapido mostra gli equivalenti più comunemente necessari.',
        'Ottenere le misure giuste è particolarmente critico nella pasticceria, dove anche piccole differenze possono influenzare il risultato. Una ricetta che richiede 1 tazza di farina significa esattamente 236,6 ml o circa 16 cucchiai. Convertire tra tazze americane e millilitri metrici garantisce che le tue torte lievitino correttamente.',
        'Che tu stia seguendo una ricetta di pasticceria francese in grammi, una ricetta americana di biscotti con le tazze, o ridimensionando una ricetta, questo convertitore gestisce la matematica per te. Aggiungi questa pagina ai preferiti per averla sempre a portata di mano in cucina.',
      ],
      faq: [
        { q: 'Quanti cucchiai ci sono in una tazza?', a: 'Ci sono 16 cucchiai in 1 tazza americana (236,6 ml). Ogni cucchiaio equivale a circa 14,8 ml o 3 cucchiaini. È una delle conversioni più utili da ricordare in cucina.' },
        { q: 'Come converto le tazze in grammi per la pasticceria?', a: 'La conversione tazza-grammi dipende dall\'ingrediente perché ingredienti diversi hanno densità diverse. Per esempio, 1 tazza di farina pesa circa 125g, mentre 1 tazza di zucchero pesa circa 200g.' },
        { q: 'Qual è la differenza tra once fluide e once?', a: 'Le once fluide (fl oz) misurano il volume, mentre le once (oz) misurano il peso. 1 oncia fluida equivale a 29,6 ml di liquido. 1 oncia di peso equivale a 28,35 grammi.' },
        { q: 'Come converto una ricetta dal sistema metrico a quello americano?', a: 'Usa questo convertitore per passare dal metrico (ml, g) alle misure americane (tazze, cucchiai, once). Per il volume, dividi i millilitri per 236,6 per ottenere le tazze.' },
        { q: 'Le tazze americane sono uguali a quelle britanniche?', a: 'No, le tazze americane e britanniche sono diverse. Una tazza americana è 236,6 ml mentre una tazza imperiale britannica è 284,1 ml. Controlla sempre quale sistema usa la tua ricetta.' },
      ],
    },
    es: {
      title: 'Convertidor de Unidades de Cocina: Tazas, Cucharadas, Gramos y Más',
      paragraphs: [
        'Cocinar y hornear requiere mediciones precisas, pero las recetas de todo el mundo usan diferentes sistemas de medición. Las recetas americanas usan tazas y cucharadas, las europeas gramos y mililitros. Nuestro convertidor de cocina gratuito resuelve estas diferencias al instante.',
        'La herramienta maneja conversiones de volumen y peso comunes en la cocina. Las conversiones de volumen incluyen mililitros, litros, cucharaditas, cucharadas, tazas y onzas fluidas. Las conversiones de peso cubren gramos, kilogramos, onzas y libras.',
        'Obtener las medidas correctas es especialmente crítico en la repostería, donde incluso pequeñas diferencias pueden afectar el resultado. Una receta que pide 1 taza de harina significa exactamente 236,6 ml o unas 16 cucharadas.',
        'Ya sea que sigas una receta de pastelería francesa en gramos o una receta americana de galletas con tazas, este convertidor maneja las matemáticas para que puedas concentrarte en crear comida deliciosa.',
      ],
      faq: [
        { q: '¿Cuántas cucharadas hay en una taza?', a: 'Hay 16 cucharadas en 1 taza americana (236,6 ml). Cada cucharada equivale a aproximadamente 14,8 ml o 3 cucharaditas.' },
        { q: '¿Cómo convierto tazas a gramos para hornear?', a: 'La conversión de tazas a gramos depende del ingrediente. Por ejemplo, 1 taza de harina pesa unos 125g, mientras que 1 taza de azúcar pesa unos 200g.' },
        { q: '¿Cuál es la diferencia entre onzas fluidas y onzas?', a: 'Las onzas fluidas (fl oz) miden volumen, mientras que las onzas (oz) miden peso. 1 onza fluida equivale a 29,6 ml. 1 onza de peso equivale a 28,35 gramos.' },
        { q: '¿Cómo convierto una receta del sistema métrico al americano?', a: 'Usa este convertidor para cambiar entre métrico (ml, g) y medidas americanas (tazas, cucharadas, onzas). Para volumen, divide los mililitros entre 236,6 para obtener tazas.' },
        { q: '¿Las tazas americanas son iguales a las británicas?', a: 'No, son diferentes. Una taza americana es 236,6 ml mientras que una taza imperial británica es 284,1 ml. Siempre verifica qué sistema usa tu receta.' },
      ],
    },
    fr: {
      title: 'Convertisseur d\'Unités de Cuisine : Tasses, Cuillères, Grammes et Plus',
      paragraphs: [
        'Cuisiner et pâtisser nécessitent des mesures précises, mais les recettes du monde entier utilisent des systèmes de mesure différents. Les recettes américaines utilisent des tasses et cuillères, les européennes des grammes et millilitres. Notre convertisseur de cuisine gratuit comble ces différences instantanément.',
        'L\'outil gère les conversions de volume et de poids courantes en cuisine. Les conversions de volume incluent millilitres, litres, cuillères à café, cuillères à soupe, tasses et onces liquides. Les conversions de poids couvrent grammes, kilogrammes, onces et livres.',
        'Obtenir les bonnes mesures est particulièrement critique en pâtisserie, où même de petites différences peuvent affecter le résultat. Une recette demandant 1 tasse de farine signifie exactement 236,6 ml ou environ 16 cuillères à soupe.',
        'Que vous suiviez une recette de pâtisserie française en grammes ou une recette américaine de cookies avec des tasses, ce convertisseur fait les calculs pour que vous puissiez vous concentrer sur la création de plats délicieux.',
      ],
      faq: [
        { q: 'Combien de cuillères à soupe dans une tasse ?', a: 'Il y a 16 cuillères à soupe dans 1 tasse américaine (236,6 ml). Chaque cuillère à soupe équivaut à environ 14,8 ml ou 3 cuillères à café.' },
        { q: 'Comment convertir les tasses en grammes pour la pâtisserie ?', a: 'La conversion tasse-grammes dépend de l\'ingrédient. Par exemple, 1 tasse de farine pèse environ 125g, tandis qu\'1 tasse de sucre pèse environ 200g.' },
        { q: 'Quelle est la différence entre onces liquides et onces ?', a: 'Les onces liquides (fl oz) mesurent le volume, tandis que les onces (oz) mesurent le poids. 1 once liquide = 29,6 ml. 1 once de poids = 28,35 grammes.' },
        { q: 'Comment convertir une recette du système métrique au système américain ?', a: 'Utilisez ce convertisseur pour passer du métrique (ml, g) aux mesures américaines (tasses, cuillères, onces). Pour le volume, divisez les millilitres par 236,6 pour obtenir les tasses.' },
        { q: 'Les tasses américaines sont-elles identiques aux tasses britanniques ?', a: 'Non, elles sont différentes. Une tasse américaine fait 236,6 ml tandis qu\'une tasse impériale britannique fait 284,1 ml.' },
      ],
    },
    de: {
      title: 'Kocheinheiten-Umrechner: Tassen, Löffel, Gramm und Mehr',
      paragraphs: [
        'Kochen und Backen erfordern präzise Messungen, aber Rezepte aus aller Welt verwenden unterschiedliche Messsysteme. Amerikanische Rezepte verwenden Tassen und Löffel, europäische Gramm und Milliliter. Unser kostenloser Kochumrechner überbrückt diese Unterschiede sofort.',
        'Das Tool behandelt sowohl Volumen- als auch Gewichtsumrechnungen, die in der Küche üblich sind. Volumenumrechnungen umfassen Milliliter, Liter, Teelöffel, Esslöffel, Tassen und Flüssigunzen. Gewichtsumrechnungen decken Gramm, Kilogramm, Unzen und Pfund ab.',
        'Die richtigen Maße zu treffen ist beim Backen besonders wichtig, wo selbst kleine Unterschiede das Ergebnis beeinflussen können. Ein Rezept mit 1 Tasse Mehl bedeutet genau 236,6 ml oder etwa 16 Esslöffel.',
        'Ob Sie ein französisches Patisserie-Rezept in Gramm oder ein amerikanisches Cookie-Rezept mit Tassen verwenden, dieser Umrechner erledigt die Mathematik, damit Sie sich auf das Kochen konzentrieren können.',
      ],
      faq: [
        { q: 'Wie viele Esslöffel sind in einer Tasse?', a: 'Es sind 16 Esslöffel in 1 US-Tasse (236,6 ml). Jeder Esslöffel entspricht etwa 14,8 ml oder 3 Teelöffeln.' },
        { q: 'Wie rechne ich Tassen in Gramm fürs Backen um?', a: 'Die Umrechnung von Tassen in Gramm hängt von der Zutat ab. Zum Beispiel wiegt 1 Tasse Mehl etwa 125g, während 1 Tasse Zucker etwa 200g wiegt.' },
        { q: 'Was ist der Unterschied zwischen Flüssigunzen und Unzen?', a: 'Flüssigunzen (fl oz) messen Volumen, während Unzen (oz) Gewicht messen. 1 Flüssigunze = 29,6 ml. 1 Unze Gewicht = 28,35 Gramm.' },
        { q: 'Wie rechne ich ein Rezept vom metrischen ins amerikanische System um?', a: 'Verwenden Sie diesen Umrechner, um zwischen metrisch (ml, g) und US-Maßen (Tassen, Löffel, Unzen) zu wechseln.' },
        { q: 'Sind US-Tassen gleich UK-Tassen?', a: 'Nein, sie sind unterschiedlich. Eine US-Tasse ist 236,6 ml, während eine britische imperiale Tasse 284,1 ml beträgt.' },
      ],
    },
    pt: {
      title: 'Conversor de Unidades de Cozinha: Xícaras, Colheres, Gramas e Mais',
      paragraphs: [
        'Cozinhar e assar requerem medições precisas, mas receitas de todo o mundo usam sistemas de medição diferentes. Receitas americanas usam xícaras e colheres, europeias usam gramas e mililitros. Nosso conversor de cozinha gratuito resolve essas diferenças instantaneamente.',
        'A ferramenta lida com conversões de volume e peso comuns na cozinha. Conversões de volume incluem mililitros, litros, colheres de chá, colheres de sopa, xícaras e onças fluidas. Conversões de peso cobrem gramas, quilogramas, onças e libras.',
        'Acertar as medidas é especialmente crítico na confeitaria, onde mesmo pequenas diferenças podem afetar o resultado. Uma receita que pede 1 xícara de farinha significa exatamente 236,6 ml ou cerca de 16 colheres de sopa.',
        'Seja seguindo uma receita de confeitaria francesa em gramas ou uma receita americana de cookies com xícaras, este conversor faz a matemática para que você possa focar em criar comidas deliciosas.',
      ],
      faq: [
        { q: 'Quantas colheres de sopa tem uma xícara?', a: 'Há 16 colheres de sopa em 1 xícara americana (236,6 ml). Cada colher de sopa equivale a aproximadamente 14,8 ml ou 3 colheres de chá.' },
        { q: 'Como converter xícaras para gramas na confeitaria?', a: 'A conversão xícara-gramas depende do ingrediente. Por exemplo, 1 xícara de farinha pesa cerca de 125g, enquanto 1 xícara de açúcar pesa cerca de 200g.' },
        { q: 'Qual é a diferença entre onças fluidas e onças?', a: 'Onças fluidas (fl oz) medem volume, enquanto onças (oz) medem peso. 1 onça fluida = 29,6 ml. 1 onça de peso = 28,35 gramas.' },
        { q: 'Como converter uma receita do sistema métrico para o americano?', a: 'Use este conversor para alternar entre métrico (ml, g) e medidas americanas (xícaras, colheres, onças). Para volume, divida os mililitros por 236,6 para obter xícaras.' },
        { q: 'As xícaras americanas são iguais às britânicas?', a: 'Não, são diferentes. Uma xícara americana é 236,6 ml enquanto uma xícara imperial britânica é 284,1 ml.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="cooking-converter" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => switchCategory('volume')}
              className={`flex-1 py-2 rounded-lg font-medium ${category === 'volume' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('volume')}
            </button>
            <button
              onClick={() => switchCategory('weight')}
              className={`flex-1 py-2 rounded-lg font-medium ${category === 'weight' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('weight')}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('amount')}</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.1"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('from')}</label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(units).map(([key, unit]) => (
                  <option key={key} value={key}>{unit.label[lang]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('to')}</label>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(units).map(([key, unit]) => (
                  <option key={key} value={key}>{unit.label[lang]}</option>
                ))}
              </select>
            </div>
          </div>

          {num > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between text-lg">
                <span className="font-bold text-gray-900">{t('result')}</span>
                <span className="font-bold text-blue-600">
                  {result < 0.01 ? result.toExponential(2) : result.toFixed(result < 10 ? 3 : 2)}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('quickRef')}</label>
            <div className="text-sm text-gray-600 space-y-1 bg-gray-50 rounded-lg p-3">
              <p>1 cup = 236.6 ml = 16 tbsp</p>
              <p>1 tbsp = 14.8 ml = 3 tsp</p>
              <p>1 fl oz = 29.6 ml</p>
              <p>1 oz = 28.3 g</p>
              <p>1 lb = 453.6 g</p>
            </div>
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
