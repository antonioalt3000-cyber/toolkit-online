'use client';
import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type UnitType = 'g' | 'kg' | 'ml' | 'L' | 'oz' | 'lb' | 'pieces';
type Currency = '$' | '€' | '£' | '¥';

interface Product {
  id: number;
  name: string;
  price: string;
  quantity: string;
  unit: UnitType;
}

interface ComparisonResult {
  products: { name: string; pricePerUnit: number; normalizedUnit: string; originalPrice: number; originalQty: number; originalUnit: string }[];
  bestIndex: number;
  worstIndex: number;
  savings: number;
  currency: Currency;
  timestamp: number;
}

const UNIT_TO_BASE: Record<UnitType, { base: string; factor: number }> = {
  g: { base: 'kg', factor: 0.001 },
  kg: { base: 'kg', factor: 1 },
  ml: { base: 'L', factor: 0.001 },
  L: { base: 'L', factor: 1 },
  oz: { base: 'kg', factor: 0.0283495 },
  lb: { base: 'kg', factor: 0.453592 },
  pieces: { base: 'pieces', factor: 1 },
};

const labels: Record<string, Record<Locale, string>> = {
  addProduct: { en: 'Add Product', it: 'Aggiungi Prodotto', es: 'Agregar Producto', fr: 'Ajouter un Produit', de: 'Produkt Hinzufügen', pt: 'Adicionar Produto' },
  remove: { en: 'Remove', it: 'Rimuovi', es: 'Eliminar', fr: 'Supprimer', de: 'Entfernen', pt: 'Remover' },
  compare: { en: 'Compare Prices', it: 'Confronta Prezzi', es: 'Comparar Precios', fr: 'Comparer les Prix', de: 'Preise Vergleichen', pt: 'Comparar Preços' },
  reset: { en: 'Reset', it: 'Resetta', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Reiniciar' },
  copy: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier les Résultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  productName: { en: 'Product Name', it: 'Nome Prodotto', es: 'Nombre del Producto', fr: 'Nom du Produit', de: 'Produktname', pt: 'Nome do Produto' },
  price: { en: 'Price', it: 'Prezzo', es: 'Precio', fr: 'Prix', de: 'Preis', pt: 'Preço' },
  quantity: { en: 'Quantity', it: 'Quantità', es: 'Cantidad', fr: 'Quantité', de: 'Menge', pt: 'Quantidade' },
  unit: { en: 'Unit', it: 'Unità', es: 'Unidad', fr: 'Unité', de: 'Einheit', pt: 'Unidade' },
  currency: { en: 'Currency', it: 'Valuta', es: 'Moneda', fr: 'Devise', de: 'Währung', pt: 'Moeda' },
  results: { en: 'Comparison Results', it: 'Risultati Confronto', es: 'Resultados de Comparación', fr: 'Résultats de Comparaison', de: 'Vergleichsergebnisse', pt: 'Resultados da Comparação' },
  pricePerUnit: { en: 'Price per', it: 'Prezzo per', es: 'Precio por', fr: 'Prix par', de: 'Preis pro', pt: 'Preço por' },
  bestValue: { en: 'Best Value!', it: 'Miglior Prezzo!', es: '¡Mejor Precio!', fr: 'Meilleur Prix !', de: 'Bester Preis!', pt: 'Melhor Preço!' },
  savings: { en: 'You save', it: 'Risparmi', es: 'Ahorras', fr: 'Vous économisez', de: 'Sie sparen', pt: 'Você economiza' },
  vsExpensive: { en: 'vs most expensive option', it: 'rispetto all\'opzione più costosa', es: 'vs opción más cara', fr: 'vs option la plus chère', de: 'vs teuerste Option', pt: 'vs opção mais cara' },
  perUnitOf: { en: 'per unit of', it: 'per unità di', es: 'por unidad de', fr: 'par unité de', de: 'pro Einheit von', pt: 'por unidade de' },
  history: { en: 'Comparison History', it: 'Storico Confronti', es: 'Historial de Comparaciones', fr: 'Historique des Comparaisons', de: 'Vergleichsverlauf', pt: 'Histórico de Comparações' },
  clearHistory: { en: 'Clear History', it: 'Cancella Storico', es: 'Borrar Historial', fr: 'Effacer l\'Historique', de: 'Verlauf Löschen', pt: 'Limpar Histórico' },
  product: { en: 'Product', it: 'Prodotto', es: 'Producto', fr: 'Produit', de: 'Produkt', pt: 'Produto' },
  needTwo: { en: 'Add at least 2 products with valid data', it: 'Aggiungi almeno 2 prodotti con dati validi', es: 'Agrega al menos 2 productos con datos válidos', fr: 'Ajoutez au moins 2 produits avec des données valides', de: 'Mindestens 2 Produkte mit gültigen Daten hinzufügen', pt: 'Adicione pelo menos 2 produtos com dados válidos' },
  pieces: { en: 'pieces', it: 'pezzi', es: 'piezas', fr: 'pièces', de: 'Stück', pt: 'peças' },
};

const defaultProducts = (): Product[] => [
  { id: 1, name: '', price: '', quantity: '', unit: 'g' as UnitType },
  { id: 2, name: '', price: '', quantity: '', unit: 'g' as UnitType },
];

export default function UnitPriceCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['unit-price-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [products, setProducts] = useState<Product[]>(defaultProducts());
  const [currency, setCurrency] = useState<Currency>('$');
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<ComparisonResult[]>([]);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  let nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

  const addProduct = () => {
    if (products.length >= 5) return;
    setProducts(prev => [...prev, { id: nextId++, name: '', price: '', quantity: '', unit: 'g' }]);
  };

  const removeProduct = (id: number) => {
    if (products.length <= 2) return;
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateProduct = (id: number, field: keyof Product, value: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const compare = useCallback(() => {
    setError('');
    const valid = products.filter(p => {
      const price = parseFloat(p.price);
      const qty = parseFloat(p.quantity);
      return price > 0 && qty > 0;
    });

    if (valid.length < 2) {
      setError(t('needTwo'));
      return;
    }

    const computed = valid.map(p => {
      const price = parseFloat(p.price);
      const qty = parseFloat(p.quantity);
      const conv = UNIT_TO_BASE[p.unit];
      const baseQty = qty * conv.factor;
      const pricePerUnit = price / baseQty;
      const normalizedUnit = p.unit === 'pieces' ? t('pieces') : conv.base;
      return {
        name: p.name || `${t('product')} ${p.id}`,
        pricePerUnit,
        normalizedUnit,
        originalPrice: price,
        originalQty: qty,
        originalUnit: p.unit,
      };
    });

    let bestIdx = 0;
    let worstIdx = 0;
    computed.forEach((c, i) => {
      if (c.pricePerUnit < computed[bestIdx].pricePerUnit) bestIdx = i;
      if (c.pricePerUnit > computed[worstIdx].pricePerUnit) worstIdx = i;
    });

    const savings = computed[worstIdx].pricePerUnit - computed[bestIdx].pricePerUnit;

    const res: ComparisonResult = {
      products: computed,
      bestIndex: bestIdx,
      worstIndex: worstIdx,
      savings,
      currency,
      timestamp: Date.now(),
    };

    setResult(res);
    setHistory(prev => [res, ...prev].slice(0, 10));
  }, [products, currency, lang]);

  const handleReset = () => {
    setProducts(defaultProducts());
    setCurrency('$');
    setResult(null);
    setError('');
  };

  const copyResults = () => {
    if (!result) return;
    const lines = result.products.map((p, i) => {
      const badge = i === result.bestIndex ? ` [${t('bestValue')}]` : '';
      return `${p.name}: ${result.currency}${p.pricePerUnit.toFixed(4)} / ${p.normalizedUnit}${badge}`;
    });
    lines.push('');
    lines.push(`${t('savings')}: ${result.currency}${result.savings.toFixed(4)} ${t('perUnitOf')} ${result.products[result.bestIndex].normalizedUnit} ${t('vsExpensive')}`);
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString(lang === 'en' ? 'en-US' : lang, { hour: '2-digit', minute: '2-digit' });
  };

  const unitOptions: UnitType[] = ['g', 'kg', 'ml', 'L', 'oz', 'lb', 'pieces'];
  const currencies: Currency[] = ['$', '€', '£', '¥'];

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Unit Price Calculator: Find the Best Deal Every Time You Shop',
      paragraphs: [
        'Shopping smart means comparing not just sticker prices but the actual cost per unit of what you buy. A larger package is not always the better deal, and smaller sizes can sometimes offer surprising value. Our unit price calculator eliminates guesswork by computing the precise price per kilogram, liter, or piece for up to five products side by side, so you can see at a glance which option gives you the most for your money.',
        'Using this tool is straightforward. Enter the name, price, quantity, and unit of measurement for each product you want to compare. The calculator supports grams, kilograms, milliliters, liters, ounces, pounds, and pieces. It automatically converts different units into a common base, so you can compare 500 g of pasta against a 1 kg bag without doing the math yourself. Choose your currency and hit compare.',
        'Once you click compare, each product displays its normalized price per unit. The best value is highlighted in green so it stands out immediately. You also see exactly how much you save per unit compared to the most expensive option. This makes it easy to justify buying in bulk or switching brands when the numbers clearly favor one product over another.',
        'The tool keeps a history of your recent comparisons so you can revisit past calculations. You can copy results to share with family members, paste them into a shopping list app, or save them for later reference. Whether you are at the grocery store comparing cereal boxes, at a warehouse club evaluating bulk deals, or online shopping for household supplies, the unit price calculator is your pocket-sized shopping assistant.',
        'Understanding unit pricing is a fundamental financial literacy skill. Many countries require stores to display unit prices on shelf labels, but these labels can be hard to read, inconsistent, or missing entirely for online purchases. By using this calculator, you take control of your purchasing decisions and ensure every dollar, euro, or pound goes further. Over a year, the cumulative savings from consistently choosing the best unit price can add up to hundreds of dollars.',
        'Beyond grocery shopping, unit pricing is valuable for comparing office supplies, pet food, cleaning products, cosmetics, and even building materials. Any time you choose between different sizes, brands, or quantities of the same type of product, calculating the price per unit reveals the true cost. Bookmark this tool and make it part of your shopping routine to keep your budget in check and your wallet happy.'
      ],
      faq: [
        { q: 'What is a unit price and why does it matter?', a: 'A unit price is the cost per standard unit of measurement, such as per kilogram or per liter. It matters because it lets you compare products of different sizes on an equal basis, revealing which option truly costs less regardless of packaging.' },
        { q: 'Can I compare products with different units like grams and ounces?', a: 'Yes. The calculator automatically converts all weights to kilograms and all volumes to liters before computing the price per unit. This means you can freely mix grams, kilograms, ounces, pounds, milliliters, and liters in a single comparison.' },
        { q: 'Is a bigger package always the better deal?', a: 'Not necessarily. While bulk buying often lowers the unit price, promotions, coupons, or smaller package discounts can make a smaller size cheaper per unit. Always check the unit price before assuming bigger is better.' },
        { q: 'How many products can I compare at once?', a: 'You can compare between 2 and 5 products simultaneously. This covers most practical shopping scenarios where you are deciding between a few options on the shelf.' },
        { q: 'How are the savings calculated?', a: 'Savings are calculated as the difference in price per unit between the most expensive option and the best value option. This tells you how much less you pay per kilogram, liter, or piece by choosing the cheapest option.' }
      ]
    },
    it: {
      title: 'Calcolatore Prezzo Unitario: Trova l\'Offerta Migliore Ogni Volta che Fai la Spesa',
      paragraphs: [
        'Fare la spesa in modo intelligente significa confrontare non solo i prezzi sugli scaffali, ma il costo effettivo per unità di ciò che acquisti. Una confezione più grande non è sempre l\'affare migliore, e le confezioni più piccole a volte possono offrire un valore sorprendente. Il nostro calcolatore di prezzo unitario elimina le supposizioni calcolando il prezzo preciso per chilogrammo, litro o pezzo per un massimo di cinque prodotti affiancati, così puoi vedere a colpo d\'occhio quale opzione ti dà di più per il tuo denaro.',
        'Usare questo strumento è semplice. Inserisci il nome, il prezzo, la quantità e l\'unità di misura per ogni prodotto che vuoi confrontare. Il calcolatore supporta grammi, chilogrammi, millilitri, litri, once, libbre e pezzi. Converte automaticamente le diverse unità in una base comune, così puoi confrontare 500 g di pasta con un pacco da 1 kg senza fare i calcoli da solo. Scegli la tua valuta e clicca confronta.',
        'Una volta cliccato confronta, ogni prodotto mostra il suo prezzo normalizzato per unità. Il miglior valore è evidenziato in verde per essere immediatamente visibile. Vedi anche esattamente quanto risparmi per unità rispetto all\'opzione più costosa. Questo rende facile giustificare l\'acquisto all\'ingrosso o il cambio di marca quando i numeri favoriscono chiaramente un prodotto.',
        'Lo strumento mantiene uno storico dei tuoi confronti recenti così puoi rivisitare i calcoli passati. Puoi copiare i risultati per condividerli con i familiari, incollarli in un\'app per la lista della spesa o salvarli per riferimento futuro. Che tu sia al supermercato a confrontare scatole di cereali, in un magazzino all\'ingrosso a valutare offerte in blocco, o a fare shopping online per prodotti per la casa, il calcolatore di prezzo unitario è il tuo assistente per gli acquisti tascabile.',
        'Comprendere il prezzo unitario è una competenza fondamentale di educazione finanziaria. Molti paesi richiedono ai negozi di esporre i prezzi unitari sulle etichette degli scaffali, ma queste etichette possono essere difficili da leggere, incoerenti o completamente assenti per gli acquisti online. Usando questo calcolatore, prendi il controllo delle tue decisioni di acquisto e assicuri che ogni euro vada più lontano. Nel corso di un anno, i risparmi cumulativi derivanti dalla scelta costante del miglior prezzo unitario possono sommare centinaia di euro.',
        'Oltre alla spesa alimentare, il prezzo unitario è prezioso per confrontare forniture per ufficio, cibo per animali, prodotti per la pulizia, cosmetici e persino materiali da costruzione. Ogni volta che scegli tra diverse dimensioni, marche o quantità dello stesso tipo di prodotto, calcolare il prezzo per unità rivela il costo reale. Aggiungi questo strumento ai preferiti e rendilo parte della tua routine di acquisti per tenere sotto controllo il budget.'
      ],
      faq: [
        { q: 'Cos\'è un prezzo unitario e perché è importante?', a: 'Un prezzo unitario è il costo per unità di misura standard, come per chilogrammo o per litro. È importante perché permette di confrontare prodotti di diverse dimensioni su una base uguale, rivelando quale opzione costa davvero meno indipendentemente dalla confezione.' },
        { q: 'Posso confrontare prodotti con unità diverse come grammi e once?', a: 'Sì. Il calcolatore converte automaticamente tutti i pesi in chilogrammi e tutti i volumi in litri prima di calcolare il prezzo per unità. Questo significa che puoi mescolare liberamente grammi, chilogrammi, once, libbre, millilitri e litri in un singolo confronto.' },
        { q: 'Una confezione più grande è sempre l\'affare migliore?', a: 'Non necessariamente. Sebbene l\'acquisto all\'ingrosso spesso riduca il prezzo unitario, promozioni, coupon o sconti su confezioni più piccole possono rendere una dimensione minore più economica per unità. Controlla sempre il prezzo unitario.' },
        { q: 'Quanti prodotti posso confrontare contemporaneamente?', a: 'Puoi confrontare da 2 a 5 prodotti simultaneamente. Questo copre la maggior parte degli scenari di acquisto pratici in cui stai decidendo tra alcune opzioni sullo scaffale.' },
        { q: 'Come vengono calcolati i risparmi?', a: 'I risparmi sono calcolati come la differenza di prezzo per unità tra l\'opzione più costosa e l\'opzione con il miglior valore. Questo ti dice quanto paghi in meno per chilogrammo, litro o pezzo scegliendo l\'opzione più economica.' }
      ]
    },
    es: {
      title: 'Calculadora de Precio Unitario: Encuentra la Mejor Oferta Cada Vez que Compras',
      paragraphs: [
        'Comprar de forma inteligente significa comparar no solo los precios de etiqueta, sino el costo real por unidad de lo que compras. Un paquete más grande no siempre es la mejor oferta, y los tamaños más pequeños a veces pueden ofrecer un valor sorprendente. Nuestra calculadora de precio unitario elimina las conjeturas al calcular el precio preciso por kilogramo, litro o pieza para hasta cinco productos lado a lado, para que puedas ver de un vistazo qué opción te da más por tu dinero.',
        'Usar esta herramienta es sencillo. Ingresa el nombre, precio, cantidad y unidad de medida de cada producto que quieras comparar. La calculadora soporta gramos, kilogramos, mililitros, litros, onzas, libras y piezas. Convierte automáticamente diferentes unidades a una base común, para que puedas comparar 500 g de pasta con una bolsa de 1 kg sin hacer las cuentas tú mismo. Elige tu moneda y haz clic en comparar.',
        'Una vez que haces clic en comparar, cada producto muestra su precio normalizado por unidad. El mejor valor se resalta en verde para que destaque inmediatamente. También ves exactamente cuánto ahorras por unidad comparado con la opción más cara. Esto facilita justificar la compra al por mayor o cambiar de marca cuando los números favorecen claramente un producto.',
        'La herramienta mantiene un historial de tus comparaciones recientes para que puedas revisitar cálculos pasados. Puedes copiar los resultados para compartirlos con familiares, pegarlos en una app de lista de compras o guardarlos para referencia futura. Ya sea que estés en el supermercado comparando cajas de cereal, en una tienda mayorista evaluando ofertas a granel, o comprando en línea suministros para el hogar, la calculadora de precio unitario es tu asistente de compras de bolsillo.',
        'Entender el precio unitario es una habilidad fundamental de educación financiera. Muchos países exigen a las tiendas mostrar precios unitarios en las etiquetas de los estantes, pero estas etiquetas pueden ser difíciles de leer, inconsistentes o completamente ausentes en compras en línea. Al usar esta calculadora, tomas el control de tus decisiones de compra y aseguras que cada dólar o euro rinda más. A lo largo de un año, los ahorros acumulados por elegir consistentemente el mejor precio unitario pueden sumar cientos de dólares.',
        'Más allá de las compras de supermercado, el precio unitario es valioso para comparar suministros de oficina, comida para mascotas, productos de limpieza, cosméticos e incluso materiales de construcción. Cada vez que eliges entre diferentes tamaños, marcas o cantidades del mismo tipo de producto, calcular el precio por unidad revela el costo verdadero. Guarda esta herramienta en favoritos y hazla parte de tu rutina de compras para mantener tu presupuesto bajo control.'
      ],
      faq: [
        { q: '¿Qué es un precio unitario y por qué importa?', a: 'Un precio unitario es el costo por unidad de medida estándar, como por kilogramo o por litro. Importa porque permite comparar productos de diferentes tamaños en igualdad de condiciones, revelando qué opción realmente cuesta menos sin importar el empaque.' },
        { q: '¿Puedo comparar productos con diferentes unidades como gramos y onzas?', a: 'Sí. La calculadora convierte automáticamente todos los pesos a kilogramos y todos los volúmenes a litros antes de calcular el precio por unidad. Esto significa que puedes mezclar libremente gramos, kilogramos, onzas, libras, mililitros y litros en una sola comparación.' },
        { q: '¿Un paquete más grande es siempre la mejor oferta?', a: 'No necesariamente. Aunque comprar al por mayor a menudo reduce el precio unitario, las promociones, cupones o descuentos en paquetes más pequeños pueden hacer que un tamaño menor sea más barato por unidad. Siempre verifica el precio unitario.' },
        { q: '¿Cuántos productos puedo comparar a la vez?', a: 'Puedes comparar entre 2 y 5 productos simultáneamente. Esto cubre la mayoría de los escenarios prácticos de compra donde estás decidiendo entre algunas opciones en el estante.' },
        { q: '¿Cómo se calculan los ahorros?', a: 'Los ahorros se calculan como la diferencia en precio por unidad entre la opción más cara y la de mejor valor. Esto te dice cuánto menos pagas por kilogramo, litro o pieza al elegir la opción más económica.' }
      ]
    },
    fr: {
      title: 'Calculateur de Prix Unitaire : Trouvez la Meilleure Affaire à Chaque Achat',
      paragraphs: [
        'Acheter intelligemment signifie comparer non seulement les prix affichés, mais le coût réel par unité de ce que vous achetez. Un emballage plus grand n\'est pas toujours la meilleure affaire, et les plus petits formats peuvent parfois offrir une valeur surprenante. Notre calculateur de prix unitaire élimine les approximations en calculant le prix précis au kilogramme, au litre ou à la pièce pour un maximum de cinq produits côte à côte, afin que vous puissiez voir d\'un coup d\'œil quelle option vous en donne le plus pour votre argent.',
        'L\'utilisation de cet outil est simple. Entrez le nom, le prix, la quantité et l\'unité de mesure de chaque produit que vous souhaitez comparer. Le calculateur prend en charge les grammes, kilogrammes, millilitres, litres, onces, livres et pièces. Il convertit automatiquement les différentes unités en une base commune, pour que vous puissiez comparer 500 g de pâtes avec un paquet d\'un kilo sans faire les calculs vous-même. Choisissez votre devise et cliquez sur comparer.',
        'Une fois que vous cliquez sur comparer, chaque produit affiche son prix normalisé par unité. La meilleure valeur est surlignée en vert pour qu\'elle ressorte immédiatement. Vous voyez également exactement combien vous économisez par unité par rapport à l\'option la plus chère. Cela facilite la justification de l\'achat en gros ou le changement de marque lorsque les chiffres favorisent clairement un produit.',
        'L\'outil conserve un historique de vos comparaisons récentes pour que vous puissiez revisiter les calculs passés. Vous pouvez copier les résultats pour les partager avec des membres de la famille, les coller dans une application de liste de courses ou les sauvegarder pour référence future. Que vous soyez au supermarché en train de comparer des boîtes de céréales, dans un entrepôt pour évaluer les offres en gros, ou en train de faire des achats en ligne, le calculateur de prix unitaire est votre assistant d\'achat de poche.',
        'Comprendre le prix unitaire est une compétence fondamentale en éducation financière. De nombreux pays exigent que les magasins affichent les prix unitaires sur les étiquettes de rayon, mais ces étiquettes peuvent être difficiles à lire, incohérentes ou totalement absentes pour les achats en ligne. En utilisant ce calculateur, vous prenez le contrôle de vos décisions d\'achat et vous assurez que chaque euro va plus loin. Sur une année, les économies cumulées en choisissant systématiquement le meilleur prix unitaire peuvent atteindre des centaines d\'euros.',
        'Au-delà des courses alimentaires, le prix unitaire est précieux pour comparer les fournitures de bureau, la nourriture pour animaux, les produits ménagers, les cosmétiques et même les matériaux de construction. Chaque fois que vous choisissez entre différentes tailles, marques ou quantités du même type de produit, le calcul du prix par unité révèle le coût réel. Ajoutez cet outil à vos favoris et intégrez-le à votre routine d\'achats pour garder votre budget sous contrôle.'
      ],
      faq: [
        { q: 'Qu\'est-ce qu\'un prix unitaire et pourquoi est-ce important ?', a: 'Un prix unitaire est le coût par unité de mesure standard, comme le kilogramme ou le litre. C\'est important car cela permet de comparer des produits de tailles différentes sur une base égale, révélant quelle option coûte réellement moins cher quel que soit l\'emballage.' },
        { q: 'Puis-je comparer des produits avec des unités différentes comme grammes et onces ?', a: 'Oui. Le calculateur convertit automatiquement tous les poids en kilogrammes et tous les volumes en litres avant de calculer le prix par unité. Vous pouvez donc mélanger librement grammes, kilogrammes, onces, livres, millilitres et litres dans une même comparaison.' },
        { q: 'Un emballage plus grand est-il toujours la meilleure affaire ?', a: 'Pas nécessairement. Bien que l\'achat en gros réduise souvent le prix unitaire, les promotions, coupons ou remises sur les petits formats peuvent rendre un format plus petit moins cher à l\'unité. Vérifiez toujours le prix unitaire.' },
        { q: 'Combien de produits puis-je comparer à la fois ?', a: 'Vous pouvez comparer de 2 à 5 produits simultanément. Cela couvre la plupart des scénarios d\'achat pratiques où vous hésitez entre quelques options en rayon.' },
        { q: 'Comment les économies sont-elles calculées ?', a: 'Les économies sont calculées comme la différence de prix par unité entre l\'option la plus chère et celle offrant le meilleur rapport qualité-prix. Cela vous indique combien vous payez en moins par kilogramme, litre ou pièce en choisissant l\'option la moins chère.' }
      ]
    },
    de: {
      title: 'Stückpreisrechner: Finden Sie das Beste Angebot bei Jedem Einkauf',
      paragraphs: [
        'Clever einkaufen bedeutet, nicht nur die Regalpreise zu vergleichen, sondern die tatsächlichen Kosten pro Einheit dessen, was Sie kaufen. Eine größere Packung ist nicht immer das bessere Angebot, und kleinere Größen können manchmal überraschend günstig sein. Unser Stückpreisrechner beseitigt das Rätselraten, indem er den genauen Preis pro Kilogramm, Liter oder Stück für bis zu fünf Produkte nebeneinander berechnet, damit Sie auf einen Blick sehen können, welche Option Ihnen am meisten für Ihr Geld bietet.',
        'Die Verwendung dieses Tools ist unkompliziert. Geben Sie den Namen, den Preis, die Menge und die Maßeinheit für jedes Produkt ein, das Sie vergleichen möchten. Der Rechner unterstützt Gramm, Kilogramm, Milliliter, Liter, Unzen, Pfund und Stück. Er konvertiert automatisch verschiedene Einheiten in eine gemeinsame Basis, sodass Sie 500 g Nudeln mit einer 1-kg-Packung vergleichen können, ohne selbst rechnen zu müssen. Wählen Sie Ihre Währung und klicken Sie auf vergleichen.',
        'Sobald Sie auf vergleichen klicken, zeigt jedes Produkt seinen normalisierten Preis pro Einheit an. Das beste Angebot wird grün hervorgehoben, damit es sofort auffällt. Sie sehen auch genau, wie viel Sie pro Einheit im Vergleich zur teuersten Option sparen. Dies erleichtert es, den Großeinkauf zu rechtfertigen oder die Marke zu wechseln, wenn die Zahlen eindeutig für ein Produkt sprechen.',
        'Das Tool speichert einen Verlauf Ihrer letzten Vergleiche, damit Sie vergangene Berechnungen erneut aufrufen können. Sie können Ergebnisse kopieren, um sie mit Familienmitgliedern zu teilen, in eine Einkaufslisten-App einzufügen oder für spätere Referenz zu speichern. Ob Sie im Supermarkt Müslipackungen vergleichen, im Großhandel Mengenangebote bewerten oder online Haushaltsbedarf einkaufen – der Stückpreisrechner ist Ihr Einkaufsassistent im Taschenformat.',
        'Stückpreise zu verstehen ist eine grundlegende Finanzkompetenz. Viele Länder verlangen von Geschäften, Stückpreise auf Regaletiketten anzuzeigen, aber diese Etiketten können schwer zu lesen, inkonsistent oder bei Online-Käufen vollständig fehlend sein. Mit diesem Rechner übernehmen Sie die Kontrolle über Ihre Kaufentscheidungen und stellen sicher, dass jeder Euro weiter reicht. Über ein Jahr können die kumulierten Einsparungen durch die konsequente Wahl des besten Stückpreises Hunderte von Euro betragen.',
        'Über den Lebensmitteleinkauf hinaus ist der Stückpreis wertvoll für den Vergleich von Bürobedarf, Tierfutter, Reinigungsprodukten, Kosmetik und sogar Baumaterialien. Jedes Mal, wenn Sie zwischen verschiedenen Größen, Marken oder Mengen desselben Produkttyps wählen, offenbart die Berechnung des Stückpreises die wahren Kosten. Setzen Sie ein Lesezeichen für dieses Tool und machen Sie es zum Teil Ihrer Einkaufsroutine.'
      ],
      faq: [
        { q: 'Was ist ein Stückpreis und warum ist er wichtig?', a: 'Ein Stückpreis ist der Preis pro Standardmaßeinheit, wie pro Kilogramm oder pro Liter. Er ist wichtig, weil er es ermöglicht, Produkte unterschiedlicher Größen auf gleicher Basis zu vergleichen und aufzeigt, welche Option unabhängig von der Verpackung wirklich weniger kostet.' },
        { q: 'Kann ich Produkte mit verschiedenen Einheiten wie Gramm und Unzen vergleichen?', a: 'Ja. Der Rechner konvertiert automatisch alle Gewichte in Kilogramm und alle Volumina in Liter, bevor der Stückpreis berechnet wird. Sie können also Gramm, Kilogramm, Unzen, Pfund, Milliliter und Liter frei in einem Vergleich mischen.' },
        { q: 'Ist eine größere Packung immer das bessere Angebot?', a: 'Nicht unbedingt. Obwohl der Großeinkauf oft den Stückpreis senkt, können Aktionen, Gutscheine oder Rabatte auf kleinere Packungen eine kleinere Größe pro Einheit günstiger machen. Prüfen Sie immer den Stückpreis.' },
        { q: 'Wie viele Produkte kann ich gleichzeitig vergleichen?', a: 'Sie können zwischen 2 und 5 Produkten gleichzeitig vergleichen. Dies deckt die meisten praktischen Einkaufsszenarien ab, in denen Sie zwischen einigen Optionen im Regal entscheiden.' },
        { q: 'Wie werden die Einsparungen berechnet?', a: 'Die Einsparungen werden als Differenz des Stückpreises zwischen der teuersten Option und der Option mit dem besten Preis-Leistungs-Verhältnis berechnet. Dies zeigt Ihnen, wie viel weniger Sie pro Kilogramm, Liter oder Stück zahlen, wenn Sie die günstigste Option wählen.' }
      ]
    },
    pt: {
      title: 'Calculadora de Preço Unitário: Encontre a Melhor Oferta Sempre que Comprar',
      paragraphs: [
        'Comprar de forma inteligente significa comparar não apenas os preços na prateleira, mas o custo real por unidade do que você compra. Uma embalagem maior nem sempre é o melhor negócio, e tamanhos menores às vezes podem oferecer um valor surpreendente. Nossa calculadora de preço unitário elimina adivinhações ao calcular o preço preciso por quilograma, litro ou peça para até cinco produtos lado a lado, para que você possa ver de relance qual opção oferece mais pelo seu dinheiro.',
        'Usar esta ferramenta é simples. Digite o nome, preço, quantidade e unidade de medida de cada produto que deseja comparar. A calculadora suporta gramas, quilogramas, mililitros, litros, onças, libras e peças. Ela converte automaticamente diferentes unidades em uma base comum, para que você possa comparar 500 g de massa com um pacote de 1 kg sem fazer as contas. Escolha sua moeda e clique em comparar.',
        'Ao clicar em comparar, cada produto exibe seu preço normalizado por unidade. O melhor valor é destacado em verde para se sobressair imediatamente. Você também vê exatamente quanto economiza por unidade em comparação com a opção mais cara. Isso facilita justificar a compra em quantidade ou trocar de marca quando os números claramente favorecem um produto.',
        'A ferramenta mantém um histórico de suas comparações recentes para que você possa revisitar cálculos anteriores. Você pode copiar os resultados para compartilhar com familiares, colá-los em um aplicativo de lista de compras ou salvá-los para referência futura. Seja no supermercado comparando caixas de cereal, em um atacado avaliando ofertas em quantidade, ou comprando online suprimentos domésticos, a calculadora de preço unitário é seu assistente de compras de bolso.',
        'Entender o preço unitário é uma habilidade fundamental de educação financeira. Muitos países exigem que as lojas exibam preços unitários nas etiquetas das prateleiras, mas essas etiquetas podem ser difíceis de ler, inconsistentes ou completamente ausentes em compras online. Ao usar esta calculadora, você assume o controle de suas decisões de compra e garante que cada real ou euro renda mais. Ao longo de um ano, as economias acumuladas ao escolher consistentemente o melhor preço unitário podem somar centenas de reais.',
        'Além das compras de supermercado, o preço unitário é valioso para comparar materiais de escritório, ração para animais, produtos de limpeza, cosméticos e até materiais de construção. Toda vez que você escolhe entre diferentes tamanhos, marcas ou quantidades do mesmo tipo de produto, calcular o preço por unidade revela o custo verdadeiro. Adicione esta ferramenta aos favoritos e torne-a parte da sua rotina de compras para manter seu orçamento sob controle.'
      ],
      faq: [
        { q: 'O que é preço unitário e por que é importante?', a: 'Preço unitário é o custo por unidade de medida padrão, como por quilograma ou por litro. É importante porque permite comparar produtos de diferentes tamanhos em igualdade de condições, revelando qual opção realmente custa menos independentemente da embalagem.' },
        { q: 'Posso comparar produtos com unidades diferentes como gramas e onças?', a: 'Sim. A calculadora converte automaticamente todos os pesos para quilogramas e todos os volumes para litros antes de calcular o preço por unidade. Isso significa que você pode misturar livremente gramas, quilogramas, onças, libras, mililitros e litros em uma única comparação.' },
        { q: 'Uma embalagem maior é sempre o melhor negócio?', a: 'Não necessariamente. Embora comprar em quantidade geralmente reduza o preço unitário, promoções, cupons ou descontos em embalagens menores podem tornar um tamanho menor mais barato por unidade. Sempre verifique o preço unitário.' },
        { q: 'Quantos produtos posso comparar de uma vez?', a: 'Você pode comparar de 2 a 5 produtos simultaneamente. Isso cobre a maioria dos cenários práticos de compra onde você está decidindo entre algumas opções na prateleira.' },
        { q: 'Como as economias são calculadas?', a: 'As economias são calculadas como a diferença no preço por unidade entre a opção mais cara e a de melhor valor. Isso indica quanto menos você paga por quilograma, litro ou peça ao escolher a opção mais barata.' }
      ]
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="unit-price-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Currency selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">{t('currency')}:</label>
            <div className="flex gap-1">
              {currencies.map(c => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currency === c ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Product rows */}
          {products.map((product, idx) => (
            <div key={product.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">{t('product')} {idx + 1}</span>
                {products.length > 2 && (
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                  >
                    {t('remove')}
                  </button>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('productName')}</label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                  placeholder={`${t('product')} ${idx + 1}`}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t('price')} ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={product.price}
                    onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t('quantity')}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={product.quantity}
                    onChange={(e) => updateProduct(product.id, 'quantity', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t('unit')}</label>
                  <select
                    value={product.unit}
                    onChange={(e) => updateProduct(product.id, 'unit', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {unitOptions.map(u => (
                      <option key={u} value={u}>{u === 'pieces' ? t('pieces') : u}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}

          {/* Add product button */}
          {products.length < 5 && (
            <button
              onClick={addProduct}
              className="w-full py-2 rounded-lg border-2 border-dashed border-gray-300 text-sm font-medium text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
            >
              + {t('addProduct')}
            </button>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">{error}</div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={compare}
              className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2.5 font-medium hover:bg-blue-700 transition-colors"
            >
              {t('compare')}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              title={t('reset')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4 mt-4">
              <h3 className="font-semibold text-gray-900">{t('results')}</h3>

              <div className="space-y-2">
                {result.products.map((p, i) => {
                  const isBest = i === result.bestIndex;
                  return (
                    <div
                      key={i}
                      className={`rounded-lg p-4 border-2 transition-colors ${isBest ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900">{p.name}</span>
                          <span className="text-xs text-gray-500 ml-2">({result.currency}{p.originalPrice.toFixed(2)} / {p.originalQty} {p.originalUnit})</span>
                        </div>
                        {isBest && (
                          <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {t('bestValue')}
                          </span>
                        )}
                      </div>
                      <div className={`text-xl font-bold mt-1 ${isBest ? 'text-green-700' : 'text-gray-800'}`}>
                        {result.currency}{p.pricePerUnit.toFixed(4)} <span className="text-sm font-normal text-gray-500">/ {p.normalizedUnit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Savings */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <div className="text-sm text-blue-600 font-medium">{t('savings')}</div>
                <div className="text-2xl font-bold text-blue-700">
                  {result.currency}{result.savings.toFixed(4)} <span className="text-sm font-normal">/ {result.products[result.bestIndex].normalizedUnit}</span>
                </div>
                <div className="text-xs text-blue-500 mt-1">{t('vsExpensive')}</div>
              </div>

              {/* Copy button */}
              <button
                onClick={copyResults}
                className="w-full py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                {copied ? (
                  <><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{t('copied')}</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>{t('copy')}</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{t('history')}</h3>
              <button onClick={() => setHistory([])} className="text-xs text-red-500 hover:text-red-700 font-medium">{t('clearHistory')}</button>
            </div>
            <div className="space-y-3">
              {history.map((h, hi) => (
                <div key={hi} className="border border-gray-100 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">{formatTime(h.timestamp)}</div>
                  <div className="space-y-1">
                    {h.products.map((p, pi) => (
                      <div key={pi} className={`text-sm flex justify-between ${pi === h.bestIndex ? 'text-green-700 font-semibold' : 'text-gray-700'}`}>
                        <span>{p.name}</span>
                        <span>{h.currency}{p.pricePerUnit.toFixed(4)} / {p.normalizedUnit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEO Article */}
        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-4">{p}</p>)}
        </article>

        {/* FAQ */}
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
