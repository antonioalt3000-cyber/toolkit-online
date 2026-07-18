'use client';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type Term = 'short' | 'long';

type Analysis = {
  valid: boolean;
  errors: Record<string, boolean>;
  gain: number;
  tax: number;
  afterTaxProfit: number;
  netProceeds: number;
  roi: number;
  isGain: boolean;
  isLoss: boolean;
};

function parseNumber(value: string): number {
  const trimmed = value.trim().replace(/,/g, '');
  if (trimmed === '') return NaN;
  return Number(trimmed);
}

export default function CapitalGainsCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['capital-gains-calculator'][lang];

  const [purchasePrice, setPurchasePrice] = useState('10000');
  const [salePrice, setSalePrice] = useState('15000');
  const [acquisitionCosts, setAcquisitionCosts] = useState('0');
  const [sellingCosts, setSellingCosts] = useState('0');
  const [taxRate, setTaxRate] = useState('15');
  const [term, setTerm] = useState<Term>('long');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const labels = {
    purchasePrice: {
      en: 'Purchase price',
      it: 'Prezzo di acquisto',
      es: 'Precio de compra',
      fr: "Prix d'achat",
      de: 'Kaufpreis',
      pt: 'Preço de compra',
    },
    salePrice: {
      en: 'Sale price',
      it: 'Prezzo di vendita',
      es: 'Precio de venta',
      fr: 'Prix de vente',
      de: 'Verkaufspreis',
      pt: 'Preço de venda',
    },
    acquisitionCosts: {
      en: 'Acquisition costs (optional)',
      it: 'Costi di acquisto (opzionale)',
      es: 'Costos de adquisición (opcional)',
      fr: "Frais d'acquisition (facultatif)",
      de: 'Anschaffungskosten (optional)',
      pt: 'Custos de aquisição (opcional)',
    },
    sellingCosts: {
      en: 'Selling costs (optional)',
      it: 'Costi di vendita (opzionale)',
      es: 'Costos de venta (opcional)',
      fr: 'Frais de vente (facultatif)',
      de: 'Verkaufskosten (optional)',
      pt: 'Custos de venda (opcional)',
    },
    taxRate: {
      en: 'Applicable tax rate (%)',
      it: 'Aliquota fiscale applicabile (%)',
      es: 'Tasa impositiva aplicable (%)',
      fr: "Taux d'imposition applicable (%)",
      de: 'Anwendbarer Steuersatz (%)',
      pt: 'Taxa de imposto aplicável (%)',
    },
    holdingPeriod: {
      en: 'Holding period',
      it: 'Periodo di detenzione',
      es: 'Período de tenencia',
      fr: 'Durée de détention',
      de: 'Haltedauer',
      pt: 'Período de detenção',
    },
    shortTerm: {
      en: 'Short-term',
      it: 'Breve termine',
      es: 'Corto plazo',
      fr: 'Court terme',
      de: 'Kurzfristig',
      pt: 'Curto prazo',
    },
    longTerm: {
      en: 'Long-term',
      it: 'Lungo termine',
      es: 'Largo plazo',
      fr: 'Long terme',
      de: 'Langfristig',
      pt: 'Longo prazo',
    },
    shortHint: {
      en: 'Held one year or less — usually taxed as ordinary income.',
      it: 'Detenuto un anno o meno — di solito tassato come reddito ordinario.',
      es: 'Mantenido un año o menos — normalmente gravado como ingreso ordinario.',
      fr: 'Détenu un an ou moins — généralement imposé comme un revenu ordinaire.',
      de: 'Ein Jahr oder weniger gehalten — meist als normales Einkommen besteuert.',
      pt: 'Mantido um ano ou menos — geralmente tributado como renda ordinária.',
    },
    longHint: {
      en: 'Held more than one year — usually qualifies for lower tax rates.',
      it: 'Detenuto più di un anno — di solito con aliquote più basse.',
      es: 'Mantenido más de un año — normalmente con tasas más bajas.',
      fr: "Détenu plus d'un an — généralement à taux réduit.",
      de: 'Länger als ein Jahr gehalten — meist mit niedrigeren Sätzen.',
      pt: 'Mantido mais de um ano — geralmente com taxas mais baixas.',
    },
    results: {
      en: 'Results',
      it: 'Risultati',
      es: 'Resultados',
      fr: 'Résultats',
      de: 'Ergebnisse',
      pt: 'Resultados',
    },
    capitalGain: {
      en: 'Capital gain',
      it: 'Plusvalenza',
      es: 'Ganancia de capital',
      fr: 'Plus-value',
      de: 'Kapitalgewinn',
      pt: 'Ganho de capital',
    },
    capitalLoss: {
      en: 'Capital loss',
      it: 'Minusvalenza',
      es: 'Pérdida de capital',
      fr: 'Moins-value',
      de: 'Kapitalverlust',
      pt: 'Perda de capital',
    },
    taxOwed: {
      en: 'Estimated tax owed',
      it: 'Imposta stimata dovuta',
      es: 'Impuesto estimado a pagar',
      fr: 'Impôt estimé dû',
      de: 'Geschätzte Steuer',
      pt: 'Imposto estimado devido',
    },
    afterTaxProfit: {
      en: 'After-tax profit',
      it: "Profitto netto d'imposta",
      es: 'Beneficio después de impuestos',
      fr: 'Bénéfice après impôt',
      de: 'Gewinn nach Steuern',
      pt: 'Lucro após impostos',
    },
    netProceeds: {
      en: 'Net proceeds from sale',
      it: 'Ricavo netto dalla vendita',
      es: 'Ingresos netos de la venta',
      fr: 'Produit net de la vente',
      de: 'Nettoerlös aus Verkauf',
      pt: 'Receita líquida da venda',
    },
    roi: {
      en: 'Return on investment',
      it: "Ritorno sull'investimento",
      es: 'Retorno de la inversión',
      fr: 'Retour sur investissement',
      de: 'Kapitalrendite',
      pt: 'Retorno do investimento',
    },
    copy: {
      en: 'Copy result',
      it: 'Copia risultato',
      es: 'Copiar resultado',
      fr: 'Copier le résultat',
      de: 'Ergebnis kopieren',
      pt: 'Copiar resultado',
    },
    copied: {
      en: 'Copied!',
      it: 'Copiato!',
      es: '¡Copiado!',
      fr: 'Copié !',
      de: 'Kopiert!',
      pt: 'Copiado!',
    },
    reset: {
      en: 'Reset',
      it: 'Reimposta',
      es: 'Restablecer',
      fr: 'Réinitialiser',
      de: 'Zurücksetzen',
      pt: 'Redefinir',
    },
    errAmount: {
      en: 'Enter a valid amount (0 or more)',
      it: 'Inserisci un importo valido (0 o più)',
      es: 'Introduce un importe válido (0 o más)',
      fr: 'Saisissez un montant valide (0 ou plus)',
      de: 'Gültigen Betrag eingeben (0 oder mehr)',
      pt: 'Insira um valor válido (0 ou mais)',
    },
    errRate: {
      en: 'Enter a rate between 0 and 100',
      it: "Inserisci un'aliquota tra 0 e 100",
      es: 'Introduce una tasa entre 0 y 100',
      fr: 'Saisissez un taux entre 0 et 100',
      de: 'Satz zwischen 0 und 100 eingeben',
      pt: 'Insira uma taxa entre 0 e 100',
    },
    rateNote: {
      en: 'Defaults are US-oriented examples that change yearly — verify your current rate.',
      it: 'I valori predefiniti sono esempi US che cambiano ogni anno — verifica la tua aliquota attuale.',
      es: 'Los valores predeterminados son ejemplos de EE. UU. que cambian cada año — verifica tu tasa actual.',
      fr: 'Les valeurs par défaut sont des exemples américains qui changent chaque année — vérifiez votre taux actuel.',
      de: 'Standardwerte sind US-Beispiele, die sich jährlich ändern — prüfen Sie Ihren aktuellen Satz.',
      pt: 'Os padrões são exemplos dos EUA que mudam anualmente — verifique sua taxa atual.',
    },
  } as Record<string, Record<Locale, string>>;

  const analysis = useMemo<Analysis>(() => {
    const errors: Record<string, boolean> = {};
    const purchaseRaw = purchasePrice.trim();
    const saleRaw = salePrice.trim();
    const acqRaw = acquisitionCosts.trim();
    const sellRaw = sellingCosts.trim();
    const rateRaw = taxRate.trim();

    const purchase = parseNumber(purchasePrice);
    const sale = parseNumber(salePrice);
    const acquisition = acqRaw === '' ? 0 : parseNumber(acquisitionCosts);
    const selling = sellRaw === '' ? 0 : parseNumber(sellingCosts);
    const rate = parseNumber(taxRate);

    if (purchaseRaw === '' || !Number.isFinite(purchase) || purchase < 0)
      errors.purchasePrice = true;
    if (saleRaw === '' || !Number.isFinite(sale) || sale < 0) errors.salePrice = true;
    if (!Number.isFinite(acquisition) || acquisition < 0) errors.acquisitionCosts = true;
    if (!Number.isFinite(selling) || selling < 0) errors.sellingCosts = true;
    if (rateRaw === '' || !Number.isFinite(rate) || rate < 0 || rate > 100) errors.taxRate = true;

    const valid = Object.keys(errors).length === 0;
    if (!valid) {
      return {
        valid,
        errors,
        gain: 0,
        tax: 0,
        afterTaxProfit: 0,
        netProceeds: 0,
        roi: 0,
        isGain: false,
        isLoss: false,
      };
    }

    const totalCosts = acquisition + selling;
    const gain = sale - purchase - totalCosts;
    const isGain = gain > 0;
    const isLoss = gain < 0;
    const tax = isGain ? gain * (rate / 100) : 0;
    const afterTaxProfit = gain - tax;
    const netProceeds = sale - selling - tax;
    const invested = purchase + acquisition;
    const roi = invested > 0 ? (afterTaxProfit / invested) * 100 : 0;

    return { valid, errors, gain, tax, afterTaxProfit, netProceeds, roi, isGain, isLoss };
  }, [purchasePrice, salePrice, acquisitionCosts, sellingCosts, taxRate]);

  const localeTag =
    lang === 'en'
      ? 'en-US'
      : lang === 'de'
        ? 'de-DE'
        : lang === 'fr'
          ? 'fr-FR'
          : lang === 'pt'
            ? 'pt-BR'
            : lang === 'es'
              ? 'es-ES'
              : 'it-IT';

  const fmt = (n: number): string =>
    new Intl.NumberFormat(localeTag, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);

  const fmtPct = (n: number): string =>
    new Intl.NumberFormat(localeTag, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      n
    ) + '%';

  const handleCopy = async (): Promise<void> => {
    const gainLabel = analysis.isLoss ? labels.capitalLoss[lang] : labels.capitalGain[lang];
    const lines = [
      `${gainLabel}: ${fmt(Math.abs(analysis.gain))}`,
      `${labels.taxOwed[lang]}: ${fmt(analysis.tax)}`,
      `${labels.afterTaxProfit[lang]}: ${fmt(analysis.afterTaxProfit)}`,
      `${labels.netProceeds[lang]}: ${fmt(analysis.netProceeds)}`,
      `${labels.roi[lang]}: ${fmtPct(analysis.roi)}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — silently ignore.
    }
  };

  const handleReset = (): void => {
    setPurchasePrice('10000');
    setSalePrice('15000');
    setAcquisitionCosts('0');
    setSellingCosts('0');
    setTaxRate('15');
    setTerm('long');
    setCopied(false);
  };

  const inputClass = (hasError: boolean): string =>
    `w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`;

  const seoContent: Record<
    Locale,
    { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }
  > = {
    en: {
      title: 'Capital Gains Tax Calculator: Estimate Tax on Your Investment Profits',
      paragraphs: [
        'A capital gains tax calculator helps you estimate how much tax you owe when you sell an investment for more than you paid. The calculation starts with your cost basis — the purchase price plus any acquisition costs such as commissions or fees. Subtract the cost basis and any selling costs from the sale price to find your capital gain or loss. This tool then applies your tax rate to show the estimated tax owed, your after-tax profit, and the net proceeds you actually keep.',
        'Capital gains fall into two categories that are taxed very differently. A short-term capital gain applies to assets held for one year or less and is generally taxed at your ordinary income rate, which can be significantly higher. A long-term capital gain applies to assets held for more than one year and usually qualifies for a lower preferential rate. Because your exact rate depends on your income, filing status, and where you live, this calculator lets you enter the applicable tax rate yourself rather than guessing on your behalf.',
        'If you sell at a loss, no capital gains tax is due on that transaction. Capital losses can often be used to offset capital gains, a strategy known as tax-loss harvesting, which can lower your overall tax bill. Holding an asset longer to reach long-term status, tracking your full cost basis, and timing sales across tax years are all common ways investors legally reduce what they owe. The net proceeds figure shows the cash you receive from the sale after selling costs and estimated tax.',
        'All calculations run entirely in your browser, so your financial figures are never uploaded or stored. The default rates shown here are US-oriented examples that change every year, so always verify the current figures with the IRS or a qualified tax professional before making decisions. To plan the bigger picture, pair this tool with our <a href="/${lang}/tools/investment-calculator">investment calculator</a>, <a href="/${lang}/tools/compound-interest-calculator">compound interest calculator</a>, and <a href="/${lang}/tools/retirement-calculator">retirement calculator</a>.',
      ],
      faq: [
        {
          q: 'What is the difference between short-term and long-term capital gains?',
          a: 'Short-term gains apply to assets held one year or less and are usually taxed as ordinary income at your marginal rate. Long-term gains apply to assets held more than one year and typically qualify for a lower preferential tax rate.',
        },
        {
          q: 'How is the capital gain calculated?',
          a: 'Capital gain equals the sale price minus your cost basis (purchase price plus acquisition costs) minus any selling costs. If the result is positive it is a gain; if negative it is a capital loss and no capital gains tax is owed on that sale.',
        },
        {
          q: 'Why do I have to enter the tax rate myself?',
          a: 'Capital gains rates depend on your income bracket, filing status, and jurisdiction (federal plus state or country). Because these vary widely and change yearly, the calculator lets you enter the exact rate that applies to you for an accurate estimate.',
        },
        {
          q: 'What are net proceeds?',
          a: 'Net proceeds are the cash you actually receive from the sale after subtracting selling costs and the estimated tax owed. It reflects what lands in your account, unlike the raw gain figure.',
        },
        {
          q: 'Is this a substitute for tax advice?',
          a: 'No. This calculator provides estimates for planning only. Tax rules, brackets, and exemptions change yearly and vary by location. Always confirm with the IRS or a qualified tax professional before filing.',
        },
      ],
    },
    it: {
      title: "Calcolatore Tasse Plusvalenze: Stima l'Imposta sui Profitti degli Investimenti",
      paragraphs: [
        "Un calcolatore delle tasse sulle plusvalenze aiuta a stimare quanta imposta devi quando vendi un investimento a un prezzo superiore a quello pagato. Il calcolo parte dal costo di base — il prezzo di acquisto più eventuali costi come commissioni o spese. Sottrai il costo di base e i costi di vendita dal prezzo di vendita per ottenere la plusvalenza o la minusvalenza. Lo strumento applica poi la tua aliquota per mostrare l'imposta stimata dovuta, il profitto netto d'imposta e il ricavo netto che effettivamente trattieni.",
        "Le plusvalenze rientrano in due categorie tassate in modo molto diverso. Una plusvalenza a breve termine riguarda gli asset detenuti per un anno o meno ed è generalmente tassata all'aliquota del reddito ordinario, che può essere molto più alta. Una plusvalenza a lungo termine riguarda gli asset detenuti per più di un anno e di solito beneficia di un'aliquota agevolata più bassa. Poiché la tua aliquota esatta dipende dal reddito, dallo stato fiscale e dal luogo di residenza, questo calcolatore ti permette di inserire tu stesso l'aliquota applicabile.",
        "Se vendi in perdita, non è dovuta alcuna imposta sulle plusvalenze per quella transazione. Le minusvalenze possono spesso compensare le plusvalenze, una strategia nota come tax-loss harvesting, che può ridurre l'imposta complessiva. Detenere un asset più a lungo per raggiungere lo status di lungo termine, tracciare l'intero costo di base e distribuire le vendite tra più anni fiscali sono modi comuni e legali per ridurre l'imposta. Il ricavo netto mostra la liquidità ricevuta dalla vendita dopo i costi di vendita e l'imposta stimata.",
        'Tutti i calcoli avvengono interamente nel browser, quindi i tuoi dati finanziari non vengono mai caricati o memorizzati. Le aliquote predefinite qui mostrate sono esempi orientati agli USA che cambiano ogni anno, quindi verifica sempre i valori attuali con l\'autorità fiscale o un professionista qualificato. Per pianificare il quadro completo, abbina questo strumento al nostro <a href="/${lang}/tools/investment-calculator">calcolatore investimenti</a>, al <a href="/${lang}/tools/compound-interest-calculator">calcolatore interesse composto</a> e al <a href="/${lang}/tools/retirement-calculator">calcolatore pensione</a>.',
      ],
      faq: [
        {
          q: 'Qual è la differenza tra plusvalenze a breve e a lungo termine?',
          a: "Le plusvalenze a breve termine riguardano asset detenuti un anno o meno e sono di solito tassate come reddito ordinario. Quelle a lungo termine riguardano asset detenuti più di un anno e beneficiano tipicamente di un'aliquota agevolata più bassa.",
        },
        {
          q: 'Come si calcola la plusvalenza?',
          a: 'La plusvalenza è il prezzo di vendita meno il costo di base (prezzo di acquisto più costi di acquisizione) meno i costi di vendita. Se il risultato è positivo è una plusvalenza; se negativo è una minusvalenza e non è dovuta imposta su quella vendita.',
        },
        {
          q: "Perché devo inserire io stesso l'aliquota?",
          a: "Le aliquote sulle plusvalenze dipendono dallo scaglione di reddito, dallo stato fiscale e dalla giurisdizione. Poiché variano molto e cambiano ogni anno, il calcolatore ti fa inserire l'aliquota esatta applicabile per una stima accurata.",
        },
        {
          q: 'Cosa sono i ricavi netti?',
          a: "I ricavi netti sono la liquidità che ricevi effettivamente dalla vendita dopo aver sottratto i costi di vendita e l'imposta stimata dovuta. Riflettono ciò che arriva sul tuo conto, a differenza della plusvalenza lorda.",
        },
        {
          q: 'Sostituisce la consulenza fiscale?',
          a: "No. Questo calcolatore fornisce stime solo per la pianificazione. Le regole fiscali, gli scaglioni e le esenzioni cambiano ogni anno e variano per luogo. Verifica sempre con l'autorità fiscale o un professionista qualificato.",
        },
      ],
    },
    es: {
      title:
        'Calculadora de Impuesto sobre Ganancias de Capital: Estima el Impuesto de tus Inversiones',
      paragraphs: [
        'Una calculadora de impuesto sobre ganancias de capital te ayuda a estimar cuánto impuesto debes cuando vendes una inversión por más de lo que pagaste. El cálculo parte de tu base de costo — el precio de compra más los costos de adquisición como comisiones o tarifas. Resta la base de costo y los costos de venta del precio de venta para obtener tu ganancia o pérdida de capital. La herramienta aplica luego tu tasa impositiva para mostrar el impuesto estimado a pagar, el beneficio después de impuestos y los ingresos netos que realmente conservas.',
        'Las ganancias de capital se dividen en dos categorías que se gravan de forma muy distinta. Una ganancia a corto plazo se aplica a activos mantenidos un año o menos y suele gravarse a tu tasa de ingreso ordinario, que puede ser mucho más alta. Una ganancia a largo plazo se aplica a activos mantenidos más de un año y normalmente califica para una tasa preferencial más baja. Como tu tasa exacta depende de tu ingreso, situación fiscal y lugar de residencia, esta calculadora te permite introducir tú mismo la tasa aplicable.',
        'Si vendes con pérdida, no se debe impuesto sobre ganancias de capital en esa transacción. Las pérdidas de capital a menudo pueden compensar ganancias, una estrategia conocida como cosecha de pérdidas fiscales, que puede reducir tu factura total. Mantener un activo más tiempo para alcanzar el estatus de largo plazo, registrar toda tu base de costo y distribuir las ventas entre años fiscales son formas comunes y legales de reducir lo que debes. Los ingresos netos muestran el efectivo que recibes de la venta tras los costos de venta y el impuesto estimado.',
        'Todos los cálculos se ejecutan por completo en tu navegador, por lo que tus cifras financieras nunca se suben ni se almacenan. Las tasas predeterminadas mostradas aquí son ejemplos orientados a EE. UU. que cambian cada año, así que verifica siempre las cifras actuales con la autoridad fiscal o un profesional cualificado. Para planificar el panorama completo, combina esta herramienta con nuestra <a href="/${lang}/tools/investment-calculator">calculadora de inversión</a>, <a href="/${lang}/tools/compound-interest-calculator">calculadora de interés compuesto</a> y <a href="/${lang}/tools/retirement-calculator">calculadora de jubilación</a>.',
      ],
      faq: [
        {
          q: '¿Cuál es la diferencia entre ganancias a corto y largo plazo?',
          a: 'Las ganancias a corto plazo se aplican a activos mantenidos un año o menos y suelen gravarse como ingreso ordinario. Las de largo plazo se aplican a activos mantenidos más de un año y normalmente califican para una tasa preferencial más baja.',
        },
        {
          q: '¿Cómo se calcula la ganancia de capital?',
          a: 'La ganancia de capital es el precio de venta menos tu base de costo (precio de compra más costos de adquisición) menos los costos de venta. Si el resultado es positivo es ganancia; si es negativo es una pérdida y no se debe impuesto en esa venta.',
        },
        {
          q: '¿Por qué debo introducir yo mismo la tasa impositiva?',
          a: 'Las tasas sobre ganancias de capital dependen de tu tramo de ingresos, situación fiscal y jurisdicción. Como varían mucho y cambian cada año, la calculadora te deja introducir la tasa exacta que te aplica para una estimación precisa.',
        },
        {
          q: '¿Qué son los ingresos netos?',
          a: 'Los ingresos netos son el efectivo que realmente recibes de la venta tras restar los costos de venta y el impuesto estimado a pagar. Refleja lo que llega a tu cuenta, a diferencia de la ganancia bruta.',
        },
        {
          q: '¿Sustituye al asesoramiento fiscal?',
          a: 'No. Esta calculadora ofrece estimaciones solo para planificación. Las reglas fiscales, tramos y exenciones cambian cada año y varían por ubicación. Confirma siempre con la autoridad fiscal o un profesional cualificado.',
        },
      ],
    },
    fr: {
      title:
        "Calculateur d'Impôt sur les Plus-Values : Estimez l'Impôt sur vos Profits d'Investissement",
      paragraphs: [
        "Un calculateur d'impôt sur les plus-values vous aide à estimer l'impôt dû lorsque vous vendez un investissement plus cher que son prix d'achat. Le calcul part de votre prix de revient — le prix d'achat plus les frais d'acquisition tels que commissions ou frais. Soustrayez le prix de revient et les frais de vente du prix de vente pour obtenir votre plus-value ou moins-value. L'outil applique ensuite votre taux d'imposition pour afficher l'impôt estimé dû, le bénéfice après impôt et le produit net que vous conservez réellement.",
        "Les plus-values se répartissent en deux catégories imposées très différemment. Une plus-value à court terme concerne les actifs détenus un an ou moins et est généralement imposée au taux du revenu ordinaire, souvent plus élevé. Une plus-value à long terme concerne les actifs détenus plus d'un an et bénéficie habituellement d'un taux préférentiel plus bas. Comme votre taux exact dépend de vos revenus, de votre situation fiscale et de votre lieu de résidence, ce calculateur vous laisse saisir vous-même le taux applicable.",
        "Si vous vendez à perte, aucun impôt sur les plus-values n'est dû sur cette transaction. Les moins-values peuvent souvent compenser les plus-values, une stratégie appelée récolte des pertes fiscales, qui peut réduire votre facture globale. Conserver un actif plus longtemps pour atteindre le statut long terme, suivre l'intégralité de votre prix de revient et répartir les ventes sur plusieurs années fiscales sont des moyens courants et légaux de réduire l'impôt. Le produit net indique la trésorerie reçue de la vente après les frais de vente et l'impôt estimé.",
        'Tous les calculs s\'exécutent entièrement dans votre navigateur, vos chiffres financiers ne sont donc jamais envoyés ni stockés. Les taux par défaut affichés ici sont des exemples orientés États-Unis qui changent chaque année ; vérifiez donc toujours les chiffres actuels auprès de l\'administration fiscale ou d\'un professionnel qualifié. Pour planifier l\'ensemble, associez cet outil à notre <a href="/${lang}/tools/investment-calculator">calculateur d\'investissement</a>, notre <a href="/${lang}/tools/compound-interest-calculator">calculateur d\'intérêts composés</a> et notre <a href="/${lang}/tools/retirement-calculator">calculateur de retraite</a>.',
      ],
      faq: [
        {
          q: 'Quelle est la différence entre plus-values à court et à long terme ?',
          a: "Les plus-values à court terme concernent les actifs détenus un an ou moins et sont généralement imposées comme un revenu ordinaire. Celles à long terme concernent les actifs détenus plus d'un an et bénéficient habituellement d'un taux préférentiel plus bas.",
        },
        {
          q: 'Comment la plus-value est-elle calculée ?',
          a: "La plus-value égale le prix de vente moins votre prix de revient (prix d'achat plus frais d'acquisition) moins les frais de vente. Si le résultat est positif, c'est une plus-value ; s'il est négatif, c'est une moins-value et aucun impôt n'est dû sur cette vente.",
        },
        {
          q: "Pourquoi dois-je saisir moi-même le taux d'imposition ?",
          a: 'Les taux sur les plus-values dépendent de votre tranche de revenu, de votre situation fiscale et de votre juridiction. Comme ils varient fortement et changent chaque année, le calculateur vous laisse saisir le taux exact qui vous concerne pour une estimation précise.',
        },
        {
          q: "Qu'est-ce que le produit net ?",
          a: "Le produit net est la trésorerie que vous recevez réellement de la vente après déduction des frais de vente et de l'impôt estimé dû. Il reflète ce qui arrive sur votre compte, contrairement à la plus-value brute.",
        },
        {
          q: 'Cela remplace-t-il un conseil fiscal ?',
          a: "Non. Ce calculateur fournit des estimations à des fins de planification uniquement. Les règles fiscales, tranches et exonérations changent chaque année et varient selon le lieu. Confirmez toujours auprès de l'administration fiscale ou d'un professionnel qualifié.",
        },
      ],
    },
    de: {
      title: 'Kapitalertragssteuerrechner: Schätzen Sie die Steuer auf Ihre Anlagegewinne',
      paragraphs: [
        'Ein Kapitalertragssteuerrechner hilft Ihnen zu schätzen, wie viel Steuer Sie schulden, wenn Sie eine Anlage teurer verkaufen als Sie sie gekauft haben. Die Berechnung beginnt mit Ihren Anschaffungskosten — dem Kaufpreis zuzüglich Kosten wie Provisionen oder Gebühren. Ziehen Sie die Anschaffungskosten und die Verkaufskosten vom Verkaufspreis ab, um Ihren Kapitalgewinn oder -verlust zu ermitteln. Das Tool wendet dann Ihren Steuersatz an und zeigt die geschätzte Steuer, den Gewinn nach Steuern und den Nettoerlös, den Sie tatsächlich behalten.',
        'Kapitalgewinne fallen in zwei Kategorien, die sehr unterschiedlich besteuert werden. Ein kurzfristiger Kapitalgewinn betrifft Vermögenswerte, die ein Jahr oder weniger gehalten werden, und wird in der Regel zum normalen Einkommensteuersatz besteuert, der deutlich höher sein kann. Ein langfristiger Kapitalgewinn betrifft Vermögenswerte, die länger als ein Jahr gehalten werden, und profitiert meist von einem niedrigeren Vorzugssatz. Da Ihr genauer Satz von Einkommen, Steuerstatus und Wohnort abhängt, können Sie in diesem Rechner den anwendbaren Steuersatz selbst eingeben.',
        'Wenn Sie mit Verlust verkaufen, fällt für dieses Geschäft keine Kapitalertragssteuer an. Kapitalverluste können oft Kapitalgewinne ausgleichen, eine Strategie namens Steuerverlust-Ernte, die Ihre Gesamtsteuer senken kann. Einen Vermögenswert länger zu halten, um den Langfriststatus zu erreichen, die vollständigen Anschaffungskosten zu erfassen und Verkäufe über mehrere Steuerjahre zu verteilen, sind gängige, legale Wege, die Steuer zu senken. Der Nettoerlös zeigt das Bargeld, das Sie nach Verkaufskosten und geschätzter Steuer aus dem Verkauf erhalten.',
        'Alle Berechnungen laufen vollständig in Ihrem Browser, sodass Ihre Finanzdaten niemals hochgeladen oder gespeichert werden. Die hier gezeigten Standardsätze sind US-orientierte Beispiele, die sich jährlich ändern; prüfen Sie daher die aktuellen Werte stets bei der Steuerbehörde oder einem qualifizierten Fachmann. Um das Gesamtbild zu planen, kombinieren Sie dieses Tool mit unserem <a href="/${lang}/tools/investment-calculator">Anlagerechner</a>, <a href="/${lang}/tools/compound-interest-calculator">Zinseszinsrechner</a> und <a href="/${lang}/tools/retirement-calculator">Rentenrechner</a>.',
      ],
      faq: [
        {
          q: 'Was ist der Unterschied zwischen kurz- und langfristigen Kapitalgewinnen?',
          a: 'Kurzfristige Gewinne betreffen Vermögenswerte, die ein Jahr oder weniger gehalten werden, und werden meist als normales Einkommen besteuert. Langfristige Gewinne betreffen Vermögenswerte, die länger als ein Jahr gehalten werden, und profitieren meist von einem niedrigeren Vorzugssatz.',
        },
        {
          q: 'Wie wird der Kapitalgewinn berechnet?',
          a: 'Der Kapitalgewinn ist der Verkaufspreis minus Ihre Anschaffungskosten (Kaufpreis plus Anschaffungskosten) minus Verkaufskosten. Ist das Ergebnis positiv, ist es ein Gewinn; ist es negativ, ist es ein Verlust und für diesen Verkauf fällt keine Steuer an.',
        },
        {
          q: 'Warum muss ich den Steuersatz selbst eingeben?',
          a: 'Kapitalertragssätze hängen von Ihrer Einkommensstufe, Ihrem Steuerstatus und Ihrer Rechtsordnung ab. Da sie stark variieren und sich jährlich ändern, können Sie im Rechner den genauen für Sie geltenden Satz für eine genaue Schätzung eingeben.',
        },
        {
          q: 'Was ist der Nettoerlös?',
          a: 'Der Nettoerlös ist das Bargeld, das Sie nach Abzug der Verkaufskosten und der geschätzten Steuer tatsächlich aus dem Verkauf erhalten. Er spiegelt wider, was auf Ihrem Konto landet — anders als der Bruttogewinn.',
        },
        {
          q: 'Ersetzt dies eine Steuerberatung?',
          a: 'Nein. Dieser Rechner liefert nur Schätzungen zur Planung. Steuerregeln, Stufen und Freibeträge ändern sich jährlich und variieren je nach Ort. Bestätigen Sie stets bei der Steuerbehörde oder einem qualifizierten Fachmann.',
        },
      ],
    },
    pt: {
      title:
        'Calculadora de Imposto sobre Ganhos de Capital: Estime o Imposto dos seus Lucros de Investimento',
      paragraphs: [
        'Uma calculadora de imposto sobre ganhos de capital ajuda a estimar quanto imposto você deve ao vender um investimento por mais do que pagou. O cálculo parte da sua base de custo — o preço de compra mais os custos de aquisição, como comissões ou taxas. Subtraia a base de custo e os custos de venda do preço de venda para obter o ganho ou a perda de capital. A ferramenta então aplica a sua taxa de imposto para mostrar o imposto estimado devido, o lucro após impostos e a receita líquida que você realmente mantém.',
        'Os ganhos de capital se dividem em duas categorias tributadas de forma muito diferente. Um ganho de curto prazo aplica-se a ativos mantidos por um ano ou menos e geralmente é tributado à sua taxa de renda ordinária, que pode ser bem mais alta. Um ganho de longo prazo aplica-se a ativos mantidos por mais de um ano e normalmente se qualifica para uma taxa preferencial mais baixa. Como a sua taxa exata depende da renda, situação fiscal e local de residência, esta calculadora permite que você mesmo insira a taxa aplicável.',
        'Se você vender com prejuízo, nenhum imposto sobre ganhos de capital é devido nessa transação. As perdas de capital muitas vezes podem compensar ganhos, uma estratégia conhecida como colheita de perdas fiscais, que pode reduzir a sua conta total. Manter um ativo por mais tempo para atingir o status de longo prazo, registrar toda a sua base de custo e distribuir as vendas por vários anos fiscais são formas comuns e legais de reduzir o que você deve. A receita líquida mostra o dinheiro recebido da venda após os custos de venda e o imposto estimado.',
        'Todos os cálculos são executados inteiramente no seu navegador, então os seus números financeiros nunca são enviados ou armazenados. As taxas padrão mostradas aqui são exemplos orientados aos EUA que mudam a cada ano, portanto verifique sempre os valores atuais com a autoridade fiscal ou um profissional qualificado. Para planejar o quadro completo, combine esta ferramenta com a nossa <a href="/${lang}/tools/investment-calculator">calculadora de investimento</a>, <a href="/${lang}/tools/compound-interest-calculator">calculadora de juros compostos</a> e <a href="/${lang}/tools/retirement-calculator">calculadora de aposentadoria</a>.',
      ],
      faq: [
        {
          q: 'Qual a diferença entre ganhos de curto e longo prazo?',
          a: 'Os ganhos de curto prazo aplicam-se a ativos mantidos por um ano ou menos e geralmente são tributados como renda ordinária. Os de longo prazo aplicam-se a ativos mantidos por mais de um ano e normalmente se qualificam para uma taxa preferencial mais baixa.',
        },
        {
          q: 'Como o ganho de capital é calculado?',
          a: 'O ganho de capital é o preço de venda menos a sua base de custo (preço de compra mais custos de aquisição) menos os custos de venda. Se o resultado for positivo é um ganho; se for negativo é uma perda e nenhum imposto é devido nessa venda.',
        },
        {
          q: 'Por que preciso inserir a taxa de imposto eu mesmo?',
          a: 'As taxas sobre ganhos de capital dependem da sua faixa de renda, situação fiscal e jurisdição. Como variam muito e mudam a cada ano, a calculadora permite inserir a taxa exata que se aplica a você para uma estimativa precisa.',
        },
        {
          q: 'O que é receita líquida?',
          a: 'A receita líquida é o dinheiro que você realmente recebe da venda após subtrair os custos de venda e o imposto estimado devido. Reflete o que entra na sua conta, ao contrário do ganho bruto.',
        },
        {
          q: 'Isto substitui aconselhamento fiscal?',
          a: 'Não. Esta calculadora fornece estimativas apenas para planejamento. Regras fiscais, faixas e isenções mudam a cada ano e variam por local. Confirme sempre com a autoridade fiscal ou um profissional qualificado.',
        },
      ],
    },
  };

  const seo = seoContent[lang] || seoContent.en;

  return (
    <ToolPageWrapper toolSlug="capital-gains-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Purchase & sale price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.purchasePrice[lang]} ($)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className={inputClass(!!analysis.errors.purchasePrice)}
              />
              {analysis.errors.purchasePrice && (
                <p className="mt-1 text-sm text-red-600">{labels.errAmount[lang]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.salePrice[lang]} ($)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className={inputClass(!!analysis.errors.salePrice)}
              />
              {analysis.errors.salePrice && (
                <p className="mt-1 text-sm text-red-600">{labels.errAmount[lang]}</p>
              )}
            </div>
          </div>

          {/* Costs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.acquisitionCosts[lang]} ($)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={acquisitionCosts}
                onChange={(e) => setAcquisitionCosts(e.target.value)}
                className={inputClass(!!analysis.errors.acquisitionCosts)}
              />
              {analysis.errors.acquisitionCosts && (
                <p className="mt-1 text-sm text-red-600">{labels.errAmount[lang]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.sellingCosts[lang]} ($)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={sellingCosts}
                onChange={(e) => setSellingCosts(e.target.value)}
                className={inputClass(!!analysis.errors.sellingCosts)}
              />
              {analysis.errors.sellingCosts && (
                <p className="mt-1 text-sm text-red-600">{labels.errAmount[lang]}</p>
              )}
            </div>
          </div>

          {/* Holding period toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.holdingPeriod[lang]}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTerm('short')}
                className={`rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${term === 'short' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                {labels.shortTerm[lang]}
              </button>
              <button
                type="button"
                onClick={() => setTerm('long')}
                className={`rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${term === 'long' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                {labels.longTerm[lang]}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {term === 'short' ? labels.shortHint[lang] : labels.longHint[lang]}
            </p>
          </div>

          {/* Tax rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.taxRate[lang]}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className={inputClass(!!analysis.errors.taxRate)}
            />
            {analysis.errors.taxRate ? (
              <p className="mt-1 text-sm text-red-600">{labels.errRate[lang]}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">{labels.rateNote[lang]}</p>
            )}
          </div>

          {/* Results */}
          {analysis.valid && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{labels.results[lang]}</h3>

              <div className="grid grid-cols-1 gap-3">
                <div
                  className={`rounded-xl p-4 text-white ${analysis.isLoss ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-green-600'}`}
                >
                  <div className="text-sm text-white/80">
                    {analysis.isLoss ? labels.capitalLoss[lang] : labels.capitalGain[lang]}
                  </div>
                  <div className="text-2xl font-bold">{fmt(Math.abs(analysis.gain))}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-xs text-red-600 font-medium">{labels.taxOwed[lang]}</div>
                    <div className="text-lg font-bold text-gray-900">{fmt(analysis.tax)}</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-xs text-green-600 font-medium">
                      {labels.afterTaxProfit[lang]}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {fmt(analysis.afterTaxProfit)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-xs text-blue-600 font-medium">
                      {labels.netProceeds[lang]}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {fmt(analysis.netProceeds)}
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="text-xs text-gray-500 font-medium">{labels.roi[lang]}</div>
                    <div
                      className={`text-lg font-bold ${analysis.roi < 0 ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {fmtPct(analysis.roi)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 min-w-[8rem] bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  {copied ? labels.copied[lang] : labels.copy[lang]}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 min-w-[8rem] bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  {labels.reset[lang]}
                </button>
              </div>
            </div>
          )}
        </div>

        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-gray-700 leading-relaxed mb-4"
              dangerouslySetInnerHTML={{ __html: p.replace(/\$\{lang\}/g, lang) }}
            />
          ))}
        </article>

        <section className="mt-10 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">FAQ</h2>
          <div className="space-y-2">
            {seo.faq.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-4 py-3 font-medium text-gray-900 flex justify-between items-center"
                >
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
