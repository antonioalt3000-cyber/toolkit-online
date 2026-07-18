'use client';
import { useId, useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type FormKey = 'pa' | 'da' | 'ca' | 'oa' | 'pb' | 'db' | 'cb' | 'ob' | 'exp';
type FieldError = 'required' | 'number' | 'negative' | 'range';
type Plan = { premium: number; deductible: number; coins: number; oop: number };
type CheaperPlan = 'A' | 'B' | 'tie';

type CalcResult = {
  costA: number;
  costB: number;
  be: number | null;
  cheaper: CheaperPlan;
  diff: number;
  lowPlan: 'A' | 'B';
};

const DEFAULTS: Record<FormKey, string> = {
  pa: '3600',
  da: '3000',
  ca: '20',
  oa: '6000',
  pb: '6000',
  db: '1000',
  cb: '20',
  ob: '4000',
  exp: '4000',
};

// Member out-of-pocket for a given expected medical cost.
function memberOutOfPocket(
  expected: number,
  deductible: number,
  coins: number,
  oop: number
): number {
  if (expected <= deductible) return expected;
  const coinsPortion = (coins / 100) * (expected - deductible);
  const cap = oop > 0 ? Math.max(oop - deductible, 0) : Infinity;
  return deductible + Math.min(coinsPortion, cap);
}

function planCost(plan: Plan, expected: number): number {
  return plan.premium + memberOutOfPocket(expected, plan.deductible, plan.coins, plan.oop);
}

// Expected medical cost at which both plans cost the same. Null if one always wins
// across the scanned range.
function findBreakEven(a: Plan, b: Plan): number | null {
  const step = 25;
  const max = 500000;
  let prev = planCost(a, 0) - planCost(b, 0);
  if (prev === 0) return 0;
  for (let x = step; x <= max; x += step) {
    const diff = planCost(a, x) - planCost(b, x);
    if (diff === 0) return x;
    if ((prev < 0 && diff > 0) || (prev > 0 && diff < 0)) {
      const fraction = prev / (prev - diff);
      return x - step + fraction * step;
    }
    prev = diff;
  }
  return null;
}

function parseField(
  raw: string,
  opts: { max?: number; allowEmpty?: boolean }
): { value: number; error: FieldError | null } {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return opts.allowEmpty ? { value: 0, error: null } : { value: NaN, error: 'required' };
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return { value: NaN, error: 'number' };
  if (n < 0) return { value: n, error: 'negative' };
  if (opts.max !== undefined && n > opts.max) return { value: n, error: 'range' };
  return { value: n, error: null };
}

function NumberField({
  label,
  suffix,
  value,
  onChange,
  error,
}: {
  label: string;
  suffix?: string;
  value: string;
  onChange: (v: string) => void;
  error: string | null;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {suffix ? ` ${suffix}` : ''}
      </label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-400' : 'border-gray-300'}`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default function InsuranceDeductibleCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['insurance-deductible-calculator'][lang];
  const [form, setForm] = useState<Record<FormKey, string>>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const labels = {
    planA: { en: 'Plan A', it: 'Piano A', es: 'Plan A', fr: 'Plan A', de: 'Plan A', pt: 'Plano A' },
    planB: { en: 'Plan B', it: 'Piano B', es: 'Plan B', fr: 'Plan B', de: 'Plan B', pt: 'Plano B' },
    premium: {
      en: 'Annual premium',
      it: 'Premio annuale',
      es: 'Prima anual',
      fr: 'Prime annuelle',
      de: 'Jahresprämie',
      pt: 'Prêmio anual',
    },
    deductible: {
      en: 'Deductible',
      it: 'Franchigia',
      es: 'Deducible',
      fr: 'Franchise',
      de: 'Selbstbeteiligung',
      pt: 'Franquia',
    },
    coinsurance: {
      en: 'Coinsurance after deductible',
      it: 'Coassicurazione dopo franchigia',
      es: 'Coaseguro tras deducible',
      fr: 'Coassurance après franchise',
      de: 'Mitversicherung nach Selbstbeteiligung',
      pt: 'Cosseguro após franquia',
    },
    oopMax: {
      en: 'Out-of-pocket max (0 = ignore)',
      it: 'Massimale di spesa (0 = ignora)',
      es: 'Máximo de bolsillo (0 = ignorar)',
      fr: 'Reste à charge max (0 = ignorer)',
      de: 'Maximale Eigenbeteiligung (0 = ignorieren)',
      pt: 'Limite de despesa (0 = ignorar)',
    },
    expected: {
      en: 'Expected annual medical cost',
      it: 'Spesa medica annua prevista',
      es: 'Costo médico anual esperado',
      fr: 'Coût médical annuel prévu',
      de: 'Erwartete jährliche Krankheitskosten',
      pt: 'Custo médico anual esperado',
    },
    results: {
      en: 'Results',
      it: 'Risultati',
      es: 'Resultados',
      fr: 'Résultats',
      de: 'Ergebnisse',
      pt: 'Resultados',
    },
    totalCost: {
      en: 'Total annual cost',
      it: 'Costo annuo totale',
      es: 'Costo anual total',
      fr: 'Coût annuel total',
      de: 'Jährliche Gesamtkosten',
      pt: 'Custo anual total',
    },
    cheaperBy: {
      en: '{plan} saves you {amount} per year',
      it: '{plan} ti fa risparmiare {amount} all’anno',
      es: '{plan} te ahorra {amount} al año',
      fr: '{plan} vous fait économiser {amount} par an',
      de: '{plan} spart Ihnen {amount} pro Jahr',
      pt: '{plan} economiza {amount} por ano',
    },
    tie: {
      en: 'Both plans cost the same',
      it: 'I due piani costano uguale',
      es: 'Ambos planes cuestan lo mismo',
      fr: 'Les deux plans coûtent le même prix',
      de: 'Beide Pläne kosten gleich viel',
      pt: 'Ambos os planos custam o mesmo',
    },
    breakEvenTitle: {
      en: 'Break-even point',
      it: 'Punto di pareggio',
      es: 'Punto de equilibrio',
      fr: 'Point d’équilibre',
      de: 'Break-even-Punkt',
      pt: 'Ponto de equilíbrio',
    },
    beNote: {
      en: 'Both plans cost about the same at {amount} of annual medical spending. Below that, {low} is cheaper; above it, {high} is cheaper.',
      it: 'I due piani costano quasi uguale con {amount} di spesa medica annua. Sotto quella soglia conviene {low}; sopra conviene {high}.',
      es: 'Ambos planes cuestan casi lo mismo con {amount} de gasto médico anual. Por debajo, {low} es más barato; por encima, {high} es más barato.',
      fr: 'Les deux plans coûtent presque autant à {amount} de dépenses médicales annuelles. En dessous, {low} est moins cher ; au-dessus, {high} est moins cher.',
      de: 'Beide Pläne kosten bei {amount} jährlicher Krankheitskosten etwa gleich viel. Darunter ist {low} günstiger, darüber {high}.',
      pt: 'Ambos os planos custam quase o mesmo com {amount} de gastos médicos anuais. Abaixo disso, {low} é mais barato; acima, {high} é mais barato.',
    },
    beNone: {
      en: '{plan} stays cheaper across every realistic level of medical spending.',
      it: '{plan} resta più conveniente a qualsiasi livello realistico di spesa medica.',
      es: '{plan} sigue siendo más barato en cualquier nivel realista de gasto médico.',
      fr: '{plan} reste moins cher à tout niveau réaliste de dépenses médicales.',
      de: '{plan} bleibt bei jedem realistischen Niveau der Krankheitskosten günstiger.',
      pt: '{plan} continua mais barato em qualquer nível realista de gasto médico.',
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
    errRequired: {
      en: 'This field is required',
      it: 'Campo obbligatorio',
      es: 'Este campo es obligatorio',
      fr: 'Ce champ est requis',
      de: 'Dieses Feld ist erforderlich',
      pt: 'Este campo é obrigatório',
    },
    errNumber: {
      en: 'Enter a valid number',
      it: 'Inserisci un numero valido',
      es: 'Ingresa un número válido',
      fr: 'Entrez un nombre valide',
      de: 'Geben Sie eine gültige Zahl ein',
      pt: 'Insira um número válido',
    },
    errNegative: {
      en: 'Value cannot be negative',
      it: 'Il valore non può essere negativo',
      es: 'El valor no puede ser negativo',
      fr: 'La valeur ne peut pas être négative',
      de: 'Der Wert darf nicht negativ sein',
      pt: 'O valor não pode ser negativo',
    },
    errCoins: {
      en: 'Enter a value between 0 and 100',
      it: 'Inserisci un valore tra 0 e 100',
      es: 'Ingresa un valor entre 0 y 100',
      fr: 'Entrez une valeur entre 0 et 100',
      de: 'Geben Sie einen Wert zwischen 0 und 100 ein',
      pt: 'Insira um valor entre 0 e 100',
    },
    errOop: {
      en: 'Out-of-pocket max must be at least the deductible',
      it: 'Il massimale deve essere almeno pari alla franchigia',
      es: 'El máximo debe ser al menos el deducible',
      fr: 'Le reste à charge max doit être au moins égal à la franchise',
      de: 'Das Maximum muss mindestens die Selbstbeteiligung betragen',
      pt: 'O limite deve ser pelo menos igual à franquia',
    },
  } as Record<string, Record<Locale, string>>;

  const update = (key: FormKey) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const errMsg = (key: string | null): string | null => {
    if (!key) return null;
    const map: Record<string, string> = {
      required: labels.errRequired[lang],
      number: labels.errNumber[lang],
      negative: labels.errNegative[lang],
      range: labels.errCoins[lang],
      oop: labels.errOop[lang],
    };
    return map[key] ?? null;
  };

  const fmt = (n: number): string =>
    new Intl.NumberFormat(
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
                : 'it-IT',
      {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }
    ).format(n);

  // Parse + validate every field.
  const pa = parseField(form.pa, {});
  const da = parseField(form.da, {});
  const ca = parseField(form.ca, { max: 100 });
  const oa = parseField(form.oa, { allowEmpty: true });
  const pb = parseField(form.pb, {});
  const db = parseField(form.db, {});
  const cb = parseField(form.cb, { max: 100 });
  const ob = parseField(form.ob, { allowEmpty: true });
  const exp = parseField(form.exp, {});

  const oaError: FieldError | 'oop' | null =
    oa.error ?? (!da.error && oa.value > 0 && oa.value < da.value ? 'oop' : null);
  const obError: FieldError | 'oop' | null =
    ob.error ?? (!db.error && ob.value > 0 && ob.value < db.value ? 'oop' : null);

  const allValid = ![
    pa.error,
    da.error,
    ca.error,
    oaError,
    pb.error,
    db.error,
    cb.error,
    obError,
    exp.error,
  ].some(Boolean);

  let result: CalcResult | null = null;
  if (allValid) {
    const planA: Plan = { premium: pa.value, deductible: da.value, coins: ca.value, oop: oa.value };
    const planB: Plan = { premium: pb.value, deductible: db.value, coins: cb.value, oop: ob.value };
    const costA = planCost(planA, exp.value);
    const costB = planCost(planB, exp.value);
    const cheaper: CheaperPlan = costA < costB ? 'A' : costB < costA ? 'B' : 'tie';
    const lowPlan: 'A' | 'B' = planA.premium <= planB.premium ? 'A' : 'B';
    result = {
      costA,
      costB,
      be: findBreakEven(planA, planB),
      cheaper,
      diff: Math.abs(costA - costB),
      lowPlan,
    };
  }

  const nameOf = (p: 'A' | 'B'): string => (p === 'A' ? labels.planA[lang] : labels.planB[lang]);

  const headline = !result
    ? ''
    : result.cheaper === 'tie'
      ? labels.tie[lang]
      : labels.cheaperBy[lang]
          .replace('{plan}', nameOf(result.cheaper))
          .replace('{amount}', fmt(result.diff));

  const breakEvenNote = ((): string => {
    if (!result) return '';
    if (result.be === null) {
      const dominant = result.cheaper === 'B' ? labels.planB[lang] : labels.planA[lang];
      return labels.beNone[lang].replace('{plan}', dominant);
    }
    const low = nameOf(result.lowPlan);
    const high = nameOf(result.lowPlan === 'A' ? 'B' : 'A');
    return labels.beNote[lang]
      .replace('{amount}', fmt(result.be))
      .replace('{low}', low)
      .replace('{high}', high);
  })();

  const handleCopy = async (): Promise<void> => {
    if (!result) return;
    const summary = [
      toolT.name,
      `${labels.planA[lang]} — ${labels.totalCost[lang]}: ${fmt(result.costA)}`,
      `${labels.planB[lang]} — ${labels.totalCost[lang]}: ${fmt(result.costB)}`,
      headline,
      breakEvenNote,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = (): void => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  const seoContent: Record<
    Locale,
    { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }
  > = {
    en: {
      title: 'Insurance Deductible Calculator: Compare Two Plans Side by Side',
      paragraphs: [
        "Choosing between two insurance plans often comes down to a single trade-off: a lower premium with a higher deductible, or a higher premium with a lower deductible. An insurance deductible calculator removes the guesswork by turning that trade-off into concrete numbers. You enter each plan's annual premium, deductible, coinsurance rate, and out-of-pocket maximum, add your expected annual medical cost, and instantly see the total yearly cost of each option side by side.",
        'The deductible is the amount you pay before your insurer starts sharing costs. After you meet it, coinsurance sets the percentage you keep paying until you reach the out-of-pocket maximum, the ceiling on what you can spend in a year. A high-deductible plan usually wins when you expect few medical expenses, because you save on premiums. A low-deductible plan tends to win when you anticipate significant care, since the insurer absorbs more of the bill. This calculator models all of those rules so your comparison is accurate.',
        'The most useful output is the break-even point: the level of expected medical spending at which both plans cost you exactly the same. Below that number, the cheaper-premium plan wins; above it, the richer plan pays off. Knowing your break-even helps you match a plan to your real health needs instead of guessing. Because every calculation runs locally in your browser, none of your financial or health information is ever stored or sent to a server.',
        "Insurance decisions rarely happen in isolation. If you are comparing full policies rather than just deductibles, our <a href='/${lang}/tools/health-insurance-calculator'>health insurance calculator</a> estimates total premiums, while our <a href='/${lang}/tools/car-insurance-calculator'>car insurance calculator</a> and <a href='/${lang}/tools/home-insurance-calculator'>home insurance calculator</a> help you budget for coverage across your household.",
      ],
      faq: [
        {
          q: 'What is an insurance deductible?',
          a: 'A deductible is the amount you pay out of pocket for covered services before your insurance begins to contribute. For example, with a $2,000 deductible you pay the first $2,000 of eligible costs yourself, after which coinsurance and your out-of-pocket maximum take over.',
        },
        {
          q: 'How do I choose between a high and low deductible?',
          a: 'Compare your expected annual medical cost to the break-even point this calculator shows. If you expect to spend less than the break-even amount, the lower-premium (higher-deductible) plan usually costs less overall. If you expect more, the lower-deductible plan typically saves money.',
        },
        {
          q: 'What is coinsurance and how does it affect my costs?',
          a: 'Coinsurance is the percentage of costs you keep paying after meeting your deductible. With 20% coinsurance, you pay $20 of every $100 in covered care until you hit your out-of-pocket maximum, after which the insurer pays 100%.',
        },
        {
          q: 'What does the out-of-pocket maximum do?',
          a: 'The out-of-pocket maximum caps your total spending in a plan year. Once your deductible plus coinsurance payments reach this ceiling, your insurer covers all remaining covered costs. Enter 0 to ignore it in the comparison.',
        },
        {
          q: 'Is my data private?',
          a: 'Yes. Every calculation happens entirely in your browser. No premium, deductible, or medical-cost figure is ever transmitted, stored, or shared.',
        },
      ],
    },
    it: {
      title: 'Calcolatore Franchigia Assicurativa: Confronta Due Piani Affiancati',
      paragraphs: [
        'Scegliere tra due polizze assicurative si riduce spesso a un solo compromesso: un premio più basso con una franchigia più alta, oppure un premio più alto con una franchigia più bassa. Un calcolatore della franchigia assicurativa elimina le supposizioni trasformando questo compromesso in numeri concreti. Inserisci per ogni piano il premio annuale, la franchigia, la percentuale di coassicurazione e il massimale di spesa, aggiungi la spesa medica annua prevista e vedi subito il costo totale annuo di ciascuna opzione, affiancate.',
        "La franchigia è l'importo che paghi prima che l'assicuratore inizi a condividere le spese. Una volta superata, la coassicurazione stabilisce la percentuale che continui a pagare fino a raggiungere il massimale di spesa, il tetto massimo che puoi spendere in un anno. Un piano ad alta franchigia conviene di solito quando prevedi poche spese mediche, perché risparmi sul premio. Un piano a bassa franchigia tende a convenire quando prevedi cure importanti, poiché l'assicuratore copre una parte maggiore del conto. Questo calcolatore riproduce tutte queste regole per un confronto accurato.",
        'Il risultato più utile è il punto di pareggio: il livello di spesa medica prevista in cui i due piani ti costano esattamente uguale. Sotto quella cifra vince il piano con premio più basso; sopra, conviene il piano più ricco. Conoscere il tuo punto di pareggio aiuta ad abbinare una polizza alle tue reali esigenze di salute invece di tirare a indovinare. Poiché ogni calcolo avviene localmente nel browser, nessuna informazione finanziaria o sanitaria viene mai memorizzata o inviata a un server.',
        "Le decisioni assicurative raramente sono isolate. Se stai confrontando polizze complete e non solo le franchigie, il nostro <a href='/${lang}/tools/health-insurance-calculator'>calcolatore assicurazione sanitaria</a> stima i premi totali, mentre il <a href='/${lang}/tools/car-insurance-calculator'>calcolatore assicurazione auto</a> e il <a href='/${lang}/tools/home-insurance-calculator'>calcolatore assicurazione casa</a> ti aiutano a pianificare il budget per le coperture di tutta la famiglia.",
      ],
      faq: [
        {
          q: "Cos'è una franchigia assicurativa?",
          a: "La franchigia è l'importo che paghi di tasca tua per i servizi coperti prima che l'assicurazione inizi a contribuire. Ad esempio, con una franchigia di 2.000 paghi i primi 2.000 di spese ammissibili, dopodiché subentrano la coassicurazione e il massimale di spesa.",
        },
        {
          q: 'Come scelgo tra franchigia alta e bassa?',
          a: 'Confronta la tua spesa medica annua prevista con il punto di pareggio mostrato dal calcolatore. Se prevedi di spendere meno del punto di pareggio, il piano con premio più basso (franchigia più alta) di solito costa meno in totale. Se prevedi di più, il piano a franchigia bassa in genere fa risparmiare.',
        },
        {
          q: "Cos'è la coassicurazione e come incide?",
          a: "La coassicurazione è la percentuale delle spese che continui a pagare dopo aver superato la franchigia. Con una coassicurazione del 20% paghi 20 su ogni 100 di cure coperte, fino a raggiungere il massimale di spesa, dopo il quale l'assicuratore paga il 100%.",
        },
        {
          q: 'A cosa serve il massimale di spesa?',
          a: "Il massimale di spesa limita il totale che puoi spendere in un anno di piano. Una volta che franchigia e coassicurazione raggiungono questo tetto, l'assicuratore copre tutte le restanti spese ammissibili. Inserisci 0 per ignorarlo nel confronto.",
        },
        {
          q: 'I miei dati sono privati?',
          a: 'Sì. Ogni calcolo avviene interamente nel tuo browser. Nessun dato su premio, franchigia o spesa medica viene mai trasmesso, memorizzato o condiviso.',
        },
      ],
    },
    es: {
      title: 'Calculadora de Deducible de Seguro: Compara Dos Planes Lado a Lado',
      paragraphs: [
        'Elegir entre dos pólizas de seguro suele reducirse a un solo compromiso: una prima más baja con un deducible más alto, o una prima más alta con un deducible más bajo. Una calculadora de deducible de seguro elimina las conjeturas convirtiendo ese compromiso en números concretos. Introduce para cada plan la prima anual, el deducible, el porcentaje de coaseguro y el máximo de bolsillo, añade tu costo médico anual esperado y verás al instante el costo anual total de cada opción, una al lado de la otra.',
        'El deducible es la cantidad que pagas antes de que la aseguradora empiece a compartir los costos. Una vez alcanzado, el coaseguro determina el porcentaje que sigues pagando hasta llegar al máximo de bolsillo, el tope de lo que puedes gastar en un año. Un plan de deducible alto suele ganar cuando esperas pocos gastos médicos, porque ahorras en la prima. Un plan de deducible bajo tiende a ganar cuando prevés una atención importante, ya que la aseguradora asume una mayor parte de la factura. Esta calculadora modela todas esas reglas para una comparación precisa.',
        'El resultado más útil es el punto de equilibrio: el nivel de gasto médico previsto en el que ambos planes te cuestan exactamente lo mismo. Por debajo de esa cifra gana el plan de prima más baja; por encima, conviene el plan más completo. Conocer tu punto de equilibrio ayuda a ajustar una póliza a tus necesidades reales de salud en lugar de adivinar. Como cada cálculo se ejecuta localmente en tu navegador, ninguna información financiera o de salud se almacena ni se envía a un servidor.',
        "Las decisiones de seguros rara vez ocurren de forma aislada. Si comparas pólizas completas y no solo los deducibles, nuestra <a href='/${lang}/tools/health-insurance-calculator'>calculadora de seguro de salud</a> estima las primas totales, mientras que la <a href='/${lang}/tools/car-insurance-calculator'>calculadora de seguro de auto</a> y la <a href='/${lang}/tools/home-insurance-calculator'>calculadora de seguro de hogar</a> te ayudan a presupuestar la cobertura de todo el hogar.",
      ],
      faq: [
        {
          q: '¿Qué es un deducible de seguro?',
          a: 'El deducible es la cantidad que pagas de tu bolsillo por los servicios cubiertos antes de que el seguro empiece a contribuir. Por ejemplo, con un deducible de $2,000 pagas los primeros $2,000 de gastos elegibles, tras lo cual entran el coaseguro y el máximo de bolsillo.',
        },
        {
          q: '¿Cómo elijo entre deducible alto y bajo?',
          a: 'Compara tu costo médico anual esperado con el punto de equilibrio que muestra la calculadora. Si esperas gastar menos que el punto de equilibrio, el plan de prima más baja (deducible más alto) suele costar menos en total. Si esperas más, el plan de deducible bajo normalmente ahorra dinero.',
        },
        {
          q: '¿Qué es el coaseguro y cómo afecta mis costos?',
          a: 'El coaseguro es el porcentaje de los costos que sigues pagando tras alcanzar el deducible. Con un coaseguro del 20% pagas $20 de cada $100 de atención cubierta hasta llegar a tu máximo de bolsillo, después del cual la aseguradora paga el 100%.',
        },
        {
          q: '¿Para qué sirve el máximo de bolsillo?',
          a: 'El máximo de bolsillo limita tu gasto total en un año del plan. Una vez que tu deducible más el coaseguro alcanzan este tope, la aseguradora cubre todos los costos cubiertos restantes. Introduce 0 para ignorarlo en la comparación.',
        },
        {
          q: '¿Mis datos son privados?',
          a: 'Sí. Cada cálculo ocurre por completo en tu navegador. Ninguna cifra de prima, deducible o costo médico se transmite, almacena ni comparte.',
        },
      ],
    },
    fr: {
      title: "Calculateur de Franchise d'Assurance : Comparez Deux Plans Côte à Côte",
      paragraphs: [
        "Choisir entre deux contrats d'assurance se résume souvent à un seul compromis : une prime plus basse avec une franchise plus élevée, ou une prime plus élevée avec une franchise plus basse. Un calculateur de franchise d'assurance supprime les incertitudes en transformant ce compromis en chiffres concrets. Saisissez pour chaque plan la prime annuelle, la franchise, le taux de coassurance et le reste à charge maximal, ajoutez votre coût médical annuel prévu, et voyez aussitôt le coût annuel total de chaque option, côte à côte.",
        "La franchise est le montant que vous payez avant que l'assureur ne commence à partager les frais. Une fois atteinte, la coassurance détermine le pourcentage que vous continuez de payer jusqu'à atteindre le reste à charge maximal, le plafond de ce que vous pouvez dépenser dans l'année. Un plan à franchise élevée l'emporte généralement lorsque vous prévoyez peu de dépenses médicales, car vous économisez sur la prime. Un plan à franchise basse tend à l'emporter lorsque vous anticipez des soins importants, puisque l'assureur absorbe une plus grande part de la facture. Ce calculateur modélise toutes ces règles pour une comparaison précise.",
        "Le résultat le plus utile est le point d'équilibre : le niveau de dépenses médicales prévues où les deux plans vous coûtent exactement la même chose. En dessous de ce montant, le plan à prime plus basse gagne ; au-dessus, le plan plus complet devient avantageux. Connaître votre point d'équilibre aide à adapter un contrat à vos besoins de santé réels plutôt que de deviner. Comme chaque calcul s'exécute localement dans votre navigateur, aucune information financière ou de santé n'est jamais stockée ni envoyée à un serveur.",
        "Les décisions d'assurance sont rarement isolées. Si vous comparez des contrats complets et pas seulement les franchises, notre <a href='/${lang}/tools/health-insurance-calculator'>calculateur d'assurance santé</a> estime les primes totales, tandis que notre <a href='/${lang}/tools/car-insurance-calculator'>calculateur d'assurance auto</a> et notre <a href='/${lang}/tools/home-insurance-calculator'>calculateur d'assurance habitation</a> vous aident à budgétiser la couverture de tout le foyer.",
      ],
      faq: [
        {
          q: "Qu'est-ce qu'une franchise d'assurance ?",
          a: "La franchise est le montant que vous payez de votre poche pour les services couverts avant que l'assurance ne commence à contribuer. Par exemple, avec une franchise de 2 000, vous payez les premiers 2 000 de frais éligibles, après quoi la coassurance et le reste à charge maximal prennent le relais.",
        },
        {
          q: 'Comment choisir entre franchise haute et basse ?',
          a: "Comparez votre coût médical annuel prévu au point d'équilibre affiché par le calculateur. Si vous prévoyez de dépenser moins que le point d'équilibre, le plan à prime plus basse (franchise plus élevée) coûte généralement moins au total. Si vous prévoyez davantage, le plan à franchise basse permet habituellement d'économiser.",
        },
        {
          q: "Qu'est-ce que la coassurance et comment affecte-t-elle mes coûts ?",
          a: "La coassurance est le pourcentage des frais que vous continuez de payer après avoir atteint votre franchise. Avec une coassurance de 20 %, vous payez 20 sur chaque 100 de soins couverts jusqu'à votre reste à charge maximal, après quoi l'assureur paie 100 %.",
        },
        {
          q: 'À quoi sert le reste à charge maximal ?',
          a: "Le reste à charge maximal plafonne vos dépenses totales sur une année de contrat. Une fois que votre franchise et votre coassurance atteignent ce plafond, l'assureur couvre tous les frais couverts restants. Saisissez 0 pour l'ignorer dans la comparaison.",
        },
        {
          q: 'Mes données sont-elles privées ?',
          a: "Oui. Chaque calcul se fait entièrement dans votre navigateur. Aucun chiffre de prime, de franchise ou de coût médical n'est transmis, stocké ou partagé.",
        },
      ],
    },
    de: {
      title: 'Selbstbeteiligungsrechner: Zwei Tarife direkt vergleichen',
      paragraphs: [
        'Die Wahl zwischen zwei Versicherungstarifen läuft oft auf einen einzigen Kompromiss hinaus: eine niedrigere Prämie mit höherer Selbstbeteiligung oder eine höhere Prämie mit niedrigerer Selbstbeteiligung. Ein Selbstbeteiligungsrechner nimmt Ihnen das Rätselraten ab, indem er diesen Kompromiss in konkrete Zahlen übersetzt. Sie geben für jeden Tarif die Jahresprämie, die Selbstbeteiligung, den Mitversicherungssatz und die maximale Eigenbeteiligung ein, ergänzen Ihre erwarteten jährlichen Krankheitskosten und sehen sofort die jährlichen Gesamtkosten beider Optionen nebeneinander.',
        'Die Selbstbeteiligung ist der Betrag, den Sie zahlen, bevor der Versicherer beginnt, die Kosten mitzutragen. Ist sie erreicht, legt die Mitversicherung den Prozentsatz fest, den Sie weiter zahlen, bis Sie die maximale Eigenbeteiligung erreichen, die Obergrenze Ihrer Ausgaben pro Jahr. Ein Tarif mit hoher Selbstbeteiligung gewinnt meist, wenn Sie wenige Krankheitskosten erwarten, weil Sie bei der Prämie sparen. Ein Tarif mit niedriger Selbstbeteiligung ist oft besser, wenn Sie umfangreiche Behandlungen erwarten, da der Versicherer einen größeren Teil der Rechnung übernimmt. Dieser Rechner bildet all diese Regeln für einen genauen Vergleich ab.',
        'Das nützlichste Ergebnis ist der Break-even-Punkt: das Niveau der erwarteten Krankheitskosten, bei dem beide Tarife Sie genau gleich viel kosten. Unterhalb dieses Werts gewinnt der Tarif mit niedrigerer Prämie; oberhalb zahlt sich der umfassendere Tarif aus. Ihren Break-even zu kennen hilft, einen Tarif an Ihren tatsächlichen Gesundheitsbedarf anzupassen, statt zu raten. Da jede Berechnung lokal in Ihrem Browser läuft, werden keine finanziellen oder gesundheitlichen Daten gespeichert oder an einen Server gesendet.',
        "Versicherungsentscheidungen stehen selten für sich allein. Wenn Sie vollständige Policen statt nur Selbstbeteiligungen vergleichen, schätzt unser <a href='/${lang}/tools/health-insurance-calculator'>Krankenversicherungsrechner</a> die Gesamtprämien, während unser <a href='/${lang}/tools/car-insurance-calculator'>Kfz-Versicherungsrechner</a> und unser <a href='/${lang}/tools/home-insurance-calculator'>Hausratversicherungsrechner</a> Ihnen helfen, den Versicherungsschutz für den gesamten Haushalt zu budgetieren.",
      ],
      faq: [
        {
          q: 'Was ist eine Selbstbeteiligung?',
          a: 'Die Selbstbeteiligung ist der Betrag, den Sie für gedeckte Leistungen aus eigener Tasche zahlen, bevor die Versicherung beiträgt. Bei einer Selbstbeteiligung von 2.000 zahlen Sie beispielsweise die ersten 2.000 an erstattungsfähigen Kosten selbst, danach übernehmen Mitversicherung und maximale Eigenbeteiligung.',
        },
        {
          q: 'Wie wähle ich zwischen hoher und niedriger Selbstbeteiligung?',
          a: 'Vergleichen Sie Ihre erwarteten jährlichen Krankheitskosten mit dem angezeigten Break-even-Punkt. Erwarten Sie weniger Ausgaben als der Break-even, kostet der Tarif mit niedrigerer Prämie (höherer Selbstbeteiligung) meist insgesamt weniger. Erwarten Sie mehr, spart in der Regel der Tarif mit niedriger Selbstbeteiligung.',
        },
        {
          q: 'Was ist Mitversicherung und wie wirkt sie sich aus?',
          a: 'Die Mitversicherung ist der Prozentsatz der Kosten, den Sie nach Erreichen der Selbstbeteiligung weiter zahlen. Bei 20% Mitversicherung zahlen Sie 20 von je 100 an gedeckter Behandlung, bis Sie Ihre maximale Eigenbeteiligung erreichen, danach zahlt der Versicherer 100%.',
        },
        {
          q: 'Wozu dient die maximale Eigenbeteiligung?',
          a: 'Die maximale Eigenbeteiligung deckelt Ihre Gesamtausgaben in einem Tarifjahr. Sobald Selbstbeteiligung und Mitversicherung diese Grenze erreichen, übernimmt der Versicherer alle übrigen gedeckten Kosten. Geben Sie 0 ein, um sie im Vergleich zu ignorieren.',
        },
        {
          q: 'Sind meine Daten privat?',
          a: 'Ja. Jede Berechnung erfolgt vollständig in Ihrem Browser. Keine Prämien-, Selbstbeteiligungs- oder Kostenangabe wird übertragen, gespeichert oder geteilt.',
        },
      ],
    },
    pt: {
      title: 'Calculadora de Franquia de Seguro: Compare Dois Planos Lado a Lado',
      paragraphs: [
        'Escolher entre duas apólices de seguro muitas vezes se resume a um único compromisso: um prêmio mais baixo com uma franquia mais alta, ou um prêmio mais alto com uma franquia mais baixa. Uma calculadora de franquia de seguro elimina as suposições transformando esse compromisso em números concretos. Você informa para cada plano o prêmio anual, a franquia, a porcentagem de cosseguro e o limite de despesa, adiciona o seu custo médico anual esperado e vê na hora o custo anual total de cada opção, lado a lado.',
        'A franquia é o valor que você paga antes de a seguradora começar a dividir os custos. Uma vez atingida, o cosseguro determina a porcentagem que você continua pagando até chegar ao limite de despesa, o teto do que você pode gastar em um ano. Um plano de franquia alta costuma vencer quando você prevê poucas despesas médicas, porque economiza no prêmio. Um plano de franquia baixa tende a vencer quando você antecipa cuidados importantes, já que a seguradora absorve uma parte maior da conta. Esta calculadora reproduz todas essas regras para uma comparação precisa.',
        'O resultado mais útil é o ponto de equilíbrio: o nível de gasto médico previsto em que os dois planos custam exatamente o mesmo. Abaixo desse número, vence o plano de prêmio mais baixo; acima, compensa o plano mais completo. Conhecer o seu ponto de equilíbrio ajuda a combinar uma apólice com as suas reais necessidades de saúde em vez de adivinhar. Como cada cálculo é feito localmente no seu navegador, nenhuma informação financeira ou de saúde é armazenada ou enviada a um servidor.',
        "Decisões de seguro raramente acontecem de forma isolada. Se você compara apólices completas e não apenas as franquias, a nossa <a href='/${lang}/tools/health-insurance-calculator'>calculadora de seguro de saúde</a> estima os prêmios totais, enquanto a <a href='/${lang}/tools/car-insurance-calculator'>calculadora de seguro de carro</a> e a <a href='/${lang}/tools/home-insurance-calculator'>calculadora de seguro residencial</a> ajudam a planejar o orçamento de cobertura de toda a casa.",
      ],
      faq: [
        {
          q: 'O que é uma franquia de seguro?',
          a: 'A franquia é o valor que você paga do próprio bolso pelos serviços cobertos antes de o seguro começar a contribuir. Por exemplo, com uma franquia de R$2.000 você paga os primeiros R$2.000 de despesas elegíveis, após o que entram o cosseguro e o limite de despesa.',
        },
        {
          q: 'Como escolho entre franquia alta e baixa?',
          a: 'Compare o seu custo médico anual esperado com o ponto de equilíbrio mostrado pela calculadora. Se você espera gastar menos que o ponto de equilíbrio, o plano de prêmio mais baixo (franquia mais alta) costuma custar menos no total. Se espera gastar mais, o plano de franquia baixa geralmente economiza dinheiro.',
        },
        {
          q: 'O que é cosseguro e como afeta meus custos?',
          a: 'O cosseguro é a porcentagem dos custos que você continua pagando após atingir a franquia. Com um cosseguro de 20%, você paga R$20 de cada R$100 de atendimento coberto até chegar ao seu limite de despesa, após o qual a seguradora paga 100%.',
        },
        {
          q: 'Para que serve o limite de despesa?',
          a: 'O limite de despesa restringe o seu gasto total em um ano do plano. Assim que a franquia mais o cosseguro atingem esse teto, a seguradora cobre todos os demais custos cobertos. Insira 0 para ignorá-lo na comparação.',
        },
        {
          q: 'Meus dados são privados?',
          a: 'Sim. Cada cálculo acontece inteiramente no seu navegador. Nenhum valor de prêmio, franquia ou custo médico é transmitido, armazenado ou compartilhado.',
        },
      ],
    },
  };

  const seo = seoContent[lang] || seoContent.en;

  return (
    <ToolPageWrapper toolSlug="insurance-deductible-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Plan A */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              <h2 className="text-base font-semibold text-gray-900">{labels.planA[lang]}</h2>
              <NumberField
                label={labels.premium[lang]}
                suffix="($)"
                value={form.pa}
                onChange={update('pa')}
                error={errMsg(pa.error)}
              />
              <NumberField
                label={labels.deductible[lang]}
                suffix="($)"
                value={form.da}
                onChange={update('da')}
                error={errMsg(da.error)}
              />
              <NumberField
                label={labels.coinsurance[lang]}
                suffix="(%)"
                value={form.ca}
                onChange={update('ca')}
                error={errMsg(ca.error)}
              />
              <NumberField
                label={labels.oopMax[lang]}
                suffix="($)"
                value={form.oa}
                onChange={update('oa')}
                error={errMsg(oaError)}
              />
            </div>

            {/* Plan B */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              <h2 className="text-base font-semibold text-gray-900">{labels.planB[lang]}</h2>
              <NumberField
                label={labels.premium[lang]}
                suffix="($)"
                value={form.pb}
                onChange={update('pb')}
                error={errMsg(pb.error)}
              />
              <NumberField
                label={labels.deductible[lang]}
                suffix="($)"
                value={form.db}
                onChange={update('db')}
                error={errMsg(db.error)}
              />
              <NumberField
                label={labels.coinsurance[lang]}
                suffix="(%)"
                value={form.cb}
                onChange={update('cb')}
                error={errMsg(cb.error)}
              />
              <NumberField
                label={labels.oopMax[lang]}
                suffix="($)"
                value={form.ob}
                onChange={update('ob')}
                error={errMsg(obError)}
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <NumberField
              label={labels.expected[lang]}
              suffix="($)"
              value={form.exp}
              onChange={update('exp')}
              error={errMsg(exp.error)}
            />
          </div>

          {/* Results */}
          {result && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{labels.results[lang]}</h3>

              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`rounded-xl p-4 border ${result.cheaper === 'A' ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
                >
                  <div className="text-xs font-medium text-gray-500">{labels.planA[lang]}</div>
                  <div className="text-xs text-gray-400 mb-1">{labels.totalCost[lang]}</div>
                  <div className="text-2xl font-bold text-gray-900">{fmt(result.costA)}</div>
                </div>
                <div
                  className={`rounded-xl p-4 border ${result.cheaper === 'B' ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
                >
                  <div className="text-xs font-medium text-gray-500">{labels.planB[lang]}</div>
                  <div className="text-xs text-gray-400 mb-1">{labels.totalCost[lang]}</div>
                  <div className="text-2xl font-bold text-gray-900">{fmt(result.costB)}</div>
                </div>
              </div>

              <div className="mt-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white text-center">
                <div className="text-lg font-bold">{headline}</div>
              </div>

              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="text-xs font-semibold text-amber-700 mb-1">
                  {labels.breakEvenTitle[lang]}
                </div>
                <p className="text-sm text-gray-700">{breakEvenNote}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCopy}
              disabled={!result}
              className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {copied ? labels.copied[lang] : labels.copy[lang]}
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-100 text-gray-700 rounded-lg px-4 py-2 font-medium hover:bg-gray-200 transition-colors"
            >
              {labels.reset[lang]}
            </button>
          </div>
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
      </div>
    </ToolPageWrapper>
  );
}
