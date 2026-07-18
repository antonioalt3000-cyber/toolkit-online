'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type FieldResult = { value: number; errorKey: string | null };

function validateField(raw: string, required: boolean, mustBePositive: boolean): FieldResult {
  const cleaned = raw.trim().replace(',', '.');
  if (cleaned === '') {
    return required ? { value: NaN, errorKey: 'errRequired' } : { value: 0, errorKey: null };
  }
  if (!/^-?\d*\.?\d+$/.test(cleaned)) {
    return { value: NaN, errorKey: 'errNumber' };
  }
  const num = Number(cleaned);
  if (Number.isNaN(num)) return { value: NaN, errorKey: 'errNumber' };
  if (num < 0) return { value: num, errorKey: 'errNegative' };
  if (mustBePositive && num <= 0) return { value: num, errorKey: 'errPositive' };
  return { value: num, errorKey: null };
}

const DEFAULTS = { expenses: '2500', months: '6', savings: '5000', monthlySaving: '500' };

export default function EmergencyFundCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['emergency-fund-calculator'][lang];

  const [expenses, setExpenses] = useState(DEFAULTS.expenses);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [savings, setSavings] = useState(DEFAULTS.savings);
  const [monthlySaving, setMonthlySaving] = useState(DEFAULTS.monthlySaving);
  const [copied, setCopied] = useState(false);

  const labels = {
    monthlyExpenses: {
      en: 'Monthly essential expenses',
      it: 'Spese mensili essenziali',
      es: 'Gastos mensuales esenciales',
      fr: 'Dépenses mensuelles essentielles',
      de: 'Wesentliche monatliche Ausgaben',
      pt: 'Despesas mensais essenciais',
    },
    targetMonths: {
      en: 'Target months of coverage',
      it: 'Mesi di copertura desiderati',
      es: 'Meses de cobertura objetivo',
      fr: 'Mois de couverture visés',
      de: 'Angestrebte Deckungsmonate',
      pt: 'Meses de cobertura desejados',
    },
    monthsRecommended: {
      en: 'Recommended: 3-6 months',
      it: 'Consigliato: 3-6 mesi',
      es: 'Recomendado: 3-6 meses',
      fr: 'Recommandé : 3-6 mois',
      de: 'Empfohlen: 3-6 Monate',
      pt: 'Recomendado: 3-6 meses',
    },
    currentSavings: {
      en: 'Current savings',
      it: 'Risparmi attuali',
      es: 'Ahorros actuales',
      fr: 'Épargne actuelle',
      de: 'Aktuelle Ersparnisse',
      pt: 'Poupança atual',
    },
    monthlySaving: {
      en: 'Monthly saving toward the fund',
      it: 'Risparmio mensile per il fondo',
      es: 'Ahorro mensual para el fondo',
      fr: 'Épargne mensuelle pour le fonds',
      de: 'Monatliche Sparrate für den Fonds',
      pt: 'Poupança mensal para o fundo',
    },
    optional: {
      en: 'optional',
      it: 'facoltativo',
      es: 'opcional',
      fr: 'facultatif',
      de: 'optional',
      pt: 'opcional',
    },
    results: {
      en: 'Results',
      it: 'Risultati',
      es: 'Resultados',
      fr: 'Résultats',
      de: 'Ergebnisse',
      pt: 'Resultados',
    },
    targetFund: {
      en: 'Target emergency fund',
      it: 'Fondo di emergenza obiettivo',
      es: 'Fondo de emergencia objetivo',
      fr: "Fonds d'urgence cible",
      de: 'Ziel-Notfallfonds',
      pt: 'Fundo de emergência alvo',
    },
    currentGap: {
      en: 'Current gap',
      it: 'Divario attuale',
      es: 'Diferencia actual',
      fr: 'Écart actuel',
      de: 'Aktuelle Lücke',
      pt: 'Diferença atual',
    },
    monthsToGoal: {
      en: 'Months to reach goal',
      it: "Mesi per raggiungere l'obiettivo",
      es: 'Meses para alcanzar la meta',
      fr: "Mois pour atteindre l'objectif",
      de: 'Monate bis zum Ziel',
      pt: 'Meses para atingir a meta',
    },
    fullyFunded: {
      en: 'Fully funded — goal reached',
      it: 'Completamente finanziato — obiettivo raggiunto',
      es: 'Totalmente financiado — meta alcanzada',
      fr: 'Entièrement financé — objectif atteint',
      de: 'Vollständig finanziert — Ziel erreicht',
      pt: 'Totalmente financiado — meta atingida',
    },
    addSavingHint: {
      en: 'Enter a monthly saving to estimate the time',
      it: 'Inserisci un risparmio mensile per stimare il tempo',
      es: 'Ingresa un ahorro mensual para estimar el tiempo',
      fr: 'Saisissez une épargne mensuelle pour estimer la durée',
      de: 'Geben Sie eine monatliche Sparrate ein, um die Dauer zu schätzen',
      pt: 'Insira uma poupança mensal para estimar o tempo',
    },
    monthsUnit: { en: 'months', it: 'mesi', es: 'meses', fr: 'mois', de: 'Monate', pt: 'meses' },
    copyResult: {
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
      it: 'Questo campo è obbligatorio',
      es: 'Este campo es obligatorio',
      fr: 'Ce champ est obligatoire',
      de: 'Dieses Feld ist erforderlich',
      pt: 'Este campo é obrigatório',
    },
    errNumber: {
      en: 'Enter a valid number',
      it: 'Inserisci un numero valido',
      es: 'Ingresa un número válido',
      fr: 'Saisissez un nombre valide',
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
    errPositive: {
      en: 'Enter a value greater than zero',
      it: 'Inserisci un valore maggiore di zero',
      es: 'Ingresa un valor mayor que cero',
      fr: 'Saisissez une valeur supérieure à zéro',
      de: 'Geben Sie einen Wert größer als null ein',
      pt: 'Insira um valor maior que zero',
    },
  } as Record<string, Record<Locale, string>>;

  const eExpenses = validateField(expenses, true, true);
  const eMonths = validateField(months, true, true);
  const eSavings = validateField(savings, false, false);
  const eMonthly = validateField(monthlySaving, false, false);

  const hasErrors = Boolean(
    eExpenses.errorKey || eMonths.errorKey || eSavings.errorKey || eMonthly.errorKey
  );
  const targetFund = eExpenses.value * eMonths.value;
  const gap = Math.max(0, targetFund - eSavings.value);
  const monthsToGoal = gap > 0 && eMonthly.value > 0 ? Math.ceil(gap / eMonthly.value) : 0;
  const showResults = !hasErrors;

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
  const fmt = (n: number) =>
    new Intl.NumberFormat(localeTag, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n);

  const inputCls = (err: string | null) =>
    `w-full border ${err ? 'border-red-400' : 'border-gray-300'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500`;

  const monthsText =
    gap === 0
      ? labels.fullyFunded[lang]
      : monthsToGoal > 0
        ? `${monthsToGoal} ${labels.monthsUnit[lang]}`
        : labels.addSavingHint[lang];

  const handleCopy = async () => {
    if (!showResults) return;
    const text = `${labels.targetFund[lang]}: ${fmt(targetFund)} · ${labels.currentGap[lang]}: ${fmt(gap)} · ${labels.monthsToGoal[lang]}: ${monthsText}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — no user-facing action needed */
    }
  };

  const handleReset = () => {
    setExpenses(DEFAULTS.expenses);
    setMonths(DEFAULTS.months);
    setSavings(DEFAULTS.savings);
    setMonthlySaving(DEFAULTS.monthlySaving);
    setCopied(false);
  };

  const seoContent: Record<
    Locale,
    { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }
  > = {
    en: {
      title: 'Emergency Fund Calculator: How Much Should You Save?',
      paragraphs: [
        'An emergency fund is a cash reserve set aside to cover unexpected expenses such as medical bills, car repairs, or a sudden loss of income. Financial experts widely recommend keeping three to six months of essential living expenses in an easily accessible account. This emergency fund calculator turns that general advice into a concrete savings target based on your own monthly costs, so you know exactly how much of a cushion you need.',
        'The calculation is simple: multiply your essential monthly expenses by the number of months of coverage you want. Essential expenses include rent or mortgage, utilities, groceries, insurance, transportation, and minimum debt payments — not discretionary spending like dining out or subscriptions. If your job is stable and you have a dual income, three months may be enough; if you are self-employed, work on commission, or are the sole earner, six months or more provides a safer buffer.',
        'Once you know your target, the calculator compares it with what you have already saved and shows the remaining gap. By entering how much you can set aside each month, you get an estimate of how many months it will take to fully fund your reserve. Breaking a large goal into a monthly savings habit makes it far more achievable and keeps you motivated as the gap shrinks toward zero.',
        'Building an emergency fund is the foundation of financial resilience — it prevents a temporary setback from turning into long-term debt. Once your safety net is in place, you can focus on longer-term goals. Explore our <a href="/${lang}/tools/retirement-calculator">retirement calculator</a> to plan ahead, use the <a href="/${lang}/tools/compound-interest-calculator">compound interest calculator</a> to grow your savings, or the <a href="/${lang}/tools/loan-calculator">loan calculator</a> to manage existing debt. All calculations run entirely in your browser and your data is never stored or shared.',
      ],
      faq: [
        {
          q: 'How much should I have in my emergency fund?',
          a: 'Most experts recommend three to six months of essential living expenses. Three months is often enough for stable, dual-income households, while six months or more is safer for freelancers, single earners, or anyone with variable income.',
        },
        {
          q: 'What counts as an essential expense?',
          a: 'Essential expenses are the costs you cannot avoid: housing, utilities, food, insurance, transportation, and minimum loan or debt payments. Exclude discretionary spending like entertainment, travel, and subscriptions when calculating your target.',
        },
        {
          q: 'Where should I keep my emergency fund?',
          a: 'Keep it somewhere safe and liquid, such as a high-yield savings account or money market account. You want to access the money quickly without penalties, so avoid tying it up in stocks or long-term investments.',
        },
        {
          q: 'How fast should I build my emergency fund?',
          a: 'There is no fixed deadline, but consistency matters more than speed. Choose a realistic monthly amount and automate it. The calculator shows how many months it will take to reach your goal at your chosen saving rate.',
        },
        {
          q: 'Is my financial data private?',
          a: 'Yes. Every calculation happens locally in your browser. Your expenses, savings, and other figures are never sent to a server, stored in a database, or shared with third parties.',
        },
      ],
    },
    it: {
      title: 'Calcolatore Fondo di Emergenza: Quanto Dovresti Risparmiare?',
      paragraphs: [
        "Un fondo di emergenza è una riserva di liquidità accantonata per coprire spese impreviste come spese mediche, riparazioni dell'auto o un'improvvisa perdita di reddito. Gli esperti finanziari raccomandano di tenere da tre a sei mesi di spese essenziali in un conto facilmente accessibile. Questo calcolatore del fondo di emergenza traduce quel consiglio generale in un obiettivo di risparmio concreto basato sulle tue spese mensili, così sai esattamente quanto cuscinetto ti serve.",
        "Il calcolo è semplice: moltiplica le tue spese mensili essenziali per il numero di mesi di copertura desiderati. Le spese essenziali includono affitto o mutuo, utenze, spesa alimentare, assicurazioni, trasporti e pagamenti minimi dei debiti, non le spese discrezionali come ristoranti o abbonamenti. Se il tuo lavoro è stabile e hai un doppio reddito, tre mesi possono bastare; se sei un lavoratore autonomo o l'unico percettore di reddito, sei mesi o più offrono un margine più sicuro.",
        "Una volta noto l'obiettivo, il calcolatore lo confronta con quanto hai già risparmiato e mostra il divario rimanente. Inserendo quanto puoi mettere da parte ogni mese, ottieni una stima di quanti mesi serviranno per finanziare completamente la tua riserva. Suddividere un grande obiettivo in un'abitudine di risparmio mensile lo rende molto più raggiungibile e ti mantiene motivato mentre il divario si riduce verso lo zero.",
        'Costruire un fondo di emergenza è la base della resilienza finanziaria: evita che un contrattempo temporaneo si trasformi in debito a lungo termine. Una volta creata la rete di sicurezza, puoi concentrarti su obiettivi a lungo termine. Esplora il nostro <a href="/${lang}/tools/retirement-calculator">calcolatore pensione</a> per pianificare il futuro, usa il <a href="/${lang}/tools/compound-interest-calculator">calcolatore interesse composto</a> per far crescere i risparmi o il <a href="/${lang}/tools/loan-calculator">calcolatore prestiti</a> per gestire i debiti. Tutti i calcoli avvengono interamente nel tuo browser e i tuoi dati non vengono mai memorizzati o condivisi.',
      ],
      faq: [
        {
          q: 'Quanto dovrei avere nel fondo di emergenza?',
          a: 'La maggior parte degli esperti raccomanda da tre a sei mesi di spese essenziali. Tre mesi bastano spesso per famiglie stabili con doppio reddito, mentre sei mesi o più sono più sicuri per liberi professionisti, percettori unici di reddito o chi ha entrate variabili.',
        },
        {
          q: 'Cosa conta come spesa essenziale?',
          a: "Le spese essenziali sono i costi che non puoi evitare: casa, utenze, cibo, assicurazioni, trasporti e pagamenti minimi di prestiti o debiti. Escludi le spese discrezionali come intrattenimento, viaggi e abbonamenti quando calcoli l'obiettivo.",
        },
        {
          q: 'Dove dovrei tenere il fondo di emergenza?',
          a: 'Tienilo in un luogo sicuro e liquido, come un conto deposito ad alto rendimento. Devi poter accedere al denaro rapidamente senza penali, quindi evita di vincolarlo in azioni o investimenti a lungo termine.',
        },
        {
          q: 'Quanto velocemente dovrei costruire il fondo?',
          a: "Non c'è una scadenza fissa, ma la costanza conta più della velocità. Scegli un importo mensile realistico e automatizzalo. Il calcolatore mostra quanti mesi serviranno per raggiungere l'obiettivo al ritmo di risparmio scelto.",
        },
        {
          q: 'I miei dati finanziari sono privati?',
          a: 'Sì. Ogni calcolo avviene localmente nel tuo browser. Le tue spese, i risparmi e gli altri dati non vengono mai inviati a un server, memorizzati in un database o condivisi con terze parti.',
        },
      ],
    },
    es: {
      title: 'Calculadora de Fondo de Emergencia: ¿Cuánto Deberías Ahorrar?',
      paragraphs: [
        'Un fondo de emergencia es una reserva de efectivo destinada a cubrir gastos imprevistos como facturas médicas, reparaciones del coche o una pérdida repentina de ingresos. Los expertos financieros recomiendan mantener entre tres y seis meses de gastos esenciales en una cuenta de fácil acceso. Esta calculadora de fondo de emergencia traduce ese consejo general en un objetivo de ahorro concreto basado en tus gastos mensuales, para que sepas exactamente cuánto colchón necesitas.',
        'El cálculo es sencillo: multiplica tus gastos mensuales esenciales por el número de meses de cobertura que deseas. Los gastos esenciales incluyen alquiler o hipoteca, servicios, alimentación, seguros, transporte y pagos mínimos de deudas, no gastos discrecionales como restaurantes o suscripciones. Si tu empleo es estable y tienes ingresos dobles, tres meses pueden bastar; si eres autónomo o el único sustento del hogar, seis meses o más ofrecen un margen más seguro.',
        'Una vez que conoces tu objetivo, la calculadora lo compara con lo que ya has ahorrado y muestra la diferencia restante. Al introducir cuánto puedes apartar cada mes, obtienes una estimación de cuántos meses tardarás en financiar por completo tu reserva. Dividir una gran meta en un hábito de ahorro mensual la hace mucho más alcanzable y te mantiene motivado a medida que la diferencia se reduce a cero.',
        'Crear un fondo de emergencia es la base de la resiliencia financiera: evita que un contratiempo temporal se convierta en deuda a largo plazo. Una vez que tengas tu red de seguridad, podrás centrarte en metas a largo plazo. Explora nuestra <a href="/${lang}/tools/retirement-calculator">calculadora de jubilación</a> para planificar el futuro, usa la <a href="/${lang}/tools/compound-interest-calculator">calculadora de interés compuesto</a> para hacer crecer tus ahorros o la <a href="/${lang}/tools/loan-calculator">calculadora de préstamos</a> para gestionar deudas. Todos los cálculos se realizan en tu navegador y tus datos nunca se almacenan ni se comparten.',
      ],
      faq: [
        {
          q: '¿Cuánto debería tener en mi fondo de emergencia?',
          a: 'La mayoría de los expertos recomienda entre tres y seis meses de gastos esenciales. Tres meses suelen bastar para hogares estables con ingresos dobles, mientras que seis meses o más son más seguros para autónomos, sustentos únicos o quienes tienen ingresos variables.',
        },
        {
          q: '¿Qué cuenta como gasto esencial?',
          a: 'Los gastos esenciales son los costes que no puedes evitar: vivienda, servicios, alimentación, seguros, transporte y pagos mínimos de préstamos o deudas. Excluye los gastos discrecionales como ocio, viajes y suscripciones al calcular tu objetivo.',
        },
        {
          q: '¿Dónde debería guardar mi fondo de emergencia?',
          a: 'Guárdalo en un lugar seguro y líquido, como una cuenta de ahorro de alto rendimiento. Debes poder acceder al dinero rápidamente sin penalizaciones, así que evita inmovilizarlo en acciones o inversiones a largo plazo.',
        },
        {
          q: '¿Con qué rapidez debería crear mi fondo?',
          a: 'No hay un plazo fijo, pero la constancia importa más que la velocidad. Elige una cantidad mensual realista y automatízala. La calculadora muestra cuántos meses tardarás en alcanzar tu meta al ritmo de ahorro elegido.',
        },
        {
          q: '¿Mis datos financieros son privados?',
          a: 'Sí. Cada cálculo se realiza localmente en tu navegador. Tus gastos, ahorros y demás cifras nunca se envían a un servidor, se almacenan en una base de datos ni se comparten con terceros.',
        },
      ],
    },
    fr: {
      title: "Calculateur de Fonds d'Urgence : Combien Devriez-Vous Épargner ?",
      paragraphs: [
        "Un fonds d'urgence est une réserve de liquidités destinée à couvrir des dépenses imprévues telles que des frais médicaux, des réparations de voiture ou une perte soudaine de revenus. Les experts financiers recommandent de conserver entre trois et six mois de dépenses essentielles sur un compte facilement accessible. Ce calculateur de fonds d'urgence transforme ce conseil général en un objectif d'épargne concret basé sur vos dépenses mensuelles, afin que vous sachiez exactement quel matelas de sécurité il vous faut.",
        "Le calcul est simple : multipliez vos dépenses mensuelles essentielles par le nombre de mois de couverture souhaité. Les dépenses essentielles comprennent le loyer ou le prêt immobilier, les factures, l'alimentation, les assurances, les transports et les remboursements minimums de dettes, et non les dépenses discrétionnaires comme les restaurants ou les abonnements. Si votre emploi est stable et que vous avez un double revenu, trois mois peuvent suffire ; si vous êtes indépendant ou l'unique source de revenus, six mois ou plus offrent une marge plus sûre.",
        "Une fois votre objectif connu, le calculateur le compare à ce que vous avez déjà épargné et affiche l'écart restant. En indiquant combien vous pouvez mettre de côté chaque mois, vous obtenez une estimation du nombre de mois nécessaires pour financer entièrement votre réserve. Décomposer un grand objectif en une habitude d'épargne mensuelle le rend bien plus atteignable et vous garde motivé à mesure que l'écart se réduit vers zéro.",
        'Constituer un fonds d\'urgence est le fondement de la résilience financière : il évite qu\'un contretemps temporaire ne se transforme en dette à long terme. Une fois votre filet de sécurité en place, vous pouvez vous concentrer sur des objectifs à plus long terme. Découvrez notre <a href="/${lang}/tools/retirement-calculator">calculateur de retraite</a> pour préparer l\'avenir, utilisez le <a href="/${lang}/tools/compound-interest-calculator">calculateur d\'intérêts composés</a> pour faire fructifier votre épargne ou le <a href="/${lang}/tools/loan-calculator">calculateur de prêt</a> pour gérer vos dettes. Tous les calculs se font dans votre navigateur et vos données ne sont jamais stockées ni partagées.',
      ],
      faq: [
        {
          q: "Combien devrais-je avoir dans mon fonds d'urgence ?",
          a: 'La plupart des experts recommandent entre trois et six mois de dépenses essentielles. Trois mois suffisent souvent aux foyers stables à double revenu, tandis que six mois ou plus sont plus sûrs pour les indépendants, les revenus uniques ou les personnes aux revenus variables.',
        },
        {
          q: "Qu'est-ce qu'une dépense essentielle ?",
          a: 'Les dépenses essentielles sont les coûts incontournables : logement, factures, alimentation, assurances, transports et remboursements minimums de prêts ou de dettes. Excluez les dépenses discrétionnaires comme les loisirs, les voyages et les abonnements lors du calcul de votre objectif.',
        },
        {
          q: "Où dois-je conserver mon fonds d'urgence ?",
          a: "Conservez-le dans un endroit sûr et liquide, comme un compte d'épargne à haut rendement. Vous devez pouvoir accéder à l'argent rapidement sans pénalités, alors évitez de l'immobiliser dans des actions ou des placements à long terme.",
        },
        {
          q: 'À quelle vitesse dois-je constituer mon fonds ?',
          a: "Il n'y a pas d'échéance fixe, mais la régularité compte plus que la vitesse. Choisissez un montant mensuel réaliste et automatisez-le. Le calculateur indique combien de mois il faudra pour atteindre votre objectif au rythme d'épargne choisi.",
        },
        {
          q: 'Mes données financières sont-elles privées ?',
          a: 'Oui. Chaque calcul se fait localement dans votre navigateur. Vos dépenses, votre épargne et vos autres chiffres ne sont jamais envoyés à un serveur, stockés dans une base de données ou partagés avec des tiers.',
        },
      ],
    },
    de: {
      title: 'Notfallfondsrechner: Wie Viel Sollten Sie Sparen?',
      paragraphs: [
        'Ein Notfallfonds ist eine Bargeldreserve, die für unerwartete Ausgaben wie Arztrechnungen, Autoreparaturen oder einen plötzlichen Einkommensverlust zurückgelegt wird. Finanzexperten empfehlen, drei bis sechs Monate der wesentlichen Lebenshaltungskosten auf einem leicht zugänglichen Konto zu halten. Dieser Notfallfondsrechner übersetzt diesen allgemeinen Rat in ein konkretes Sparziel auf Basis Ihrer monatlichen Kosten, damit Sie genau wissen, wie viel Polster Sie benötigen.',
        'Die Berechnung ist einfach: Multiplizieren Sie Ihre wesentlichen monatlichen Ausgaben mit der Anzahl der gewünschten Deckungsmonate. Zu den wesentlichen Ausgaben zählen Miete oder Hypothek, Nebenkosten, Lebensmittel, Versicherungen, Transport und Mindestzahlungen für Schulden, nicht jedoch freiwillige Ausgaben wie Restaurantbesuche oder Abonnements. Ist Ihr Job stabil und haben Sie ein doppeltes Einkommen, können drei Monate reichen; sind Sie selbstständig oder Alleinverdiener, bieten sechs Monate oder mehr einen sichereren Puffer.',
        'Sobald Ihr Ziel feststeht, vergleicht der Rechner es mit Ihren bereits vorhandenen Ersparnissen und zeigt die verbleibende Lücke an. Indem Sie eingeben, wie viel Sie monatlich zurücklegen können, erhalten Sie eine Schätzung, wie viele Monate es dauert, Ihre Reserve vollständig aufzubauen. Ein großes Ziel in eine monatliche Spargewohnheit zu zerlegen, macht es viel erreichbarer und hält Sie motiviert, während die Lücke gegen null schrumpft.',
        'Der Aufbau eines Notfallfonds ist die Grundlage finanzieller Widerstandsfähigkeit: Er verhindert, dass ein vorübergehender Rückschlag zu langfristigen Schulden wird. Sobald Ihr Sicherheitsnetz steht, können Sie sich auf langfristige Ziele konzentrieren. Entdecken Sie unseren <a href="/${lang}/tools/retirement-calculator">Rentenrechner</a> für die Zukunftsplanung, nutzen Sie den <a href="/${lang}/tools/compound-interest-calculator">Zinseszinsrechner</a>, um Ihr Erspartes zu vermehren, oder den <a href="/${lang}/tools/loan-calculator">Kreditrechner</a>, um Schulden zu verwalten. Alle Berechnungen erfolgen in Ihrem Browser und Ihre Daten werden niemals gespeichert oder geteilt.',
      ],
      faq: [
        {
          q: 'Wie viel sollte ich im Notfallfonds haben?',
          a: 'Die meisten Experten empfehlen drei bis sechs Monate der wesentlichen Lebenshaltungskosten. Drei Monate reichen oft für stabile Haushalte mit doppeltem Einkommen, während sechs Monate oder mehr für Selbstständige, Alleinverdiener oder Personen mit schwankendem Einkommen sicherer sind.',
        },
        {
          q: 'Was zählt als wesentliche Ausgabe?',
          a: 'Wesentliche Ausgaben sind unvermeidbare Kosten: Wohnen, Nebenkosten, Lebensmittel, Versicherungen, Transport und Mindestzahlungen für Kredite oder Schulden. Schließen Sie freiwillige Ausgaben wie Freizeit, Reisen und Abonnements bei der Zielberechnung aus.',
        },
        {
          q: 'Wo sollte ich meinen Notfallfonds aufbewahren?',
          a: 'Bewahren Sie ihn an einem sicheren und liquiden Ort auf, etwa einem Tagesgeldkonto mit hoher Verzinsung. Sie müssen schnell und ohne Strafgebühren auf das Geld zugreifen können, vermeiden Sie also langfristige Anlagen oder Aktien.',
        },
        {
          q: 'Wie schnell sollte ich meinen Fonds aufbauen?',
          a: 'Es gibt keine feste Frist, aber Beständigkeit zählt mehr als Geschwindigkeit. Legen Sie einen realistischen monatlichen Betrag fest und automatisieren Sie ihn. Der Rechner zeigt, wie viele Monate Sie bei Ihrer gewählten Sparrate bis zum Ziel benötigen.',
        },
        {
          q: 'Sind meine Finanzdaten privat?',
          a: 'Ja. Jede Berechnung erfolgt lokal in Ihrem Browser. Ihre Ausgaben, Ersparnisse und anderen Zahlen werden niemals an einen Server gesendet, in einer Datenbank gespeichert oder mit Dritten geteilt.',
        },
      ],
    },
    pt: {
      title: 'Calculadora de Fundo de Emergência: Quanto Você Deve Poupar?',
      paragraphs: [
        'Um fundo de emergência é uma reserva de dinheiro separada para cobrir despesas inesperadas, como contas médicas, reparos do carro ou uma perda repentina de renda. Especialistas financeiros recomendam manter de três a seis meses de despesas essenciais em uma conta de fácil acesso. Esta calculadora de fundo de emergência transforma esse conselho geral em uma meta de poupança concreta com base nas suas despesas mensais, para que você saiba exatamente de quanta reserva precisa.',
        'O cálculo é simples: multiplique suas despesas mensais essenciais pelo número de meses de cobertura desejado. As despesas essenciais incluem aluguel ou financiamento, contas, alimentação, seguros, transporte e pagamentos mínimos de dívidas, e não gastos supérfluos como restaurantes ou assinaturas. Se o seu emprego é estável e você tem renda dupla, três meses podem bastar; se você é autônomo ou o único provedor, seis meses ou mais oferecem uma margem mais segura.',
        'Depois de conhecer sua meta, a calculadora a compara com o que você já poupou e mostra a diferença restante. Ao inserir quanto pode reservar por mês, você obtém uma estimativa de quantos meses levará para financiar completamente sua reserva. Dividir uma grande meta em um hábito de poupança mensal a torna muito mais alcançável e mantém você motivado à medida que a diferença diminui até zero.',
        'Construir um fundo de emergência é a base da resiliência financeira: evita que um contratempo temporário se transforme em dívida de longo prazo. Com a sua rede de segurança pronta, você pode se concentrar em metas de longo prazo. Explore a nossa <a href="/${lang}/tools/retirement-calculator">calculadora de aposentadoria</a> para planejar o futuro, use a <a href="/${lang}/tools/compound-interest-calculator">calculadora de juros compostos</a> para fazer suas economias crescerem ou a <a href="/${lang}/tools/loan-calculator">calculadora de empréstimos</a> para gerenciar dívidas. Todos os cálculos acontecem no seu navegador e seus dados nunca são armazenados ou compartilhados.',
      ],
      faq: [
        {
          q: 'Quanto devo ter no meu fundo de emergência?',
          a: 'A maioria dos especialistas recomenda de três a seis meses de despesas essenciais. Três meses costumam bastar para lares estáveis com renda dupla, enquanto seis meses ou mais são mais seguros para autônomos, provedores únicos ou quem tem renda variável.',
        },
        {
          q: 'O que conta como despesa essencial?',
          a: 'Despesas essenciais são os custos que você não pode evitar: moradia, contas, alimentação, seguros, transporte e pagamentos mínimos de empréstimos ou dívidas. Exclua gastos supérfluos como lazer, viagens e assinaturas ao calcular sua meta.',
        },
        {
          q: 'Onde devo guardar meu fundo de emergência?',
          a: 'Guarde-o em um lugar seguro e líquido, como uma conta de poupança de alto rendimento. Você precisa acessar o dinheiro rapidamente e sem penalidades, então evite prendê-lo em ações ou investimentos de longo prazo.',
        },
        {
          q: 'Com que rapidez devo formar meu fundo?',
          a: 'Não há prazo fixo, mas a constância importa mais do que a velocidade. Escolha um valor mensal realista e automatize-o. A calculadora mostra quantos meses levará para atingir sua meta no ritmo de poupança escolhido.',
        },
        {
          q: 'Meus dados financeiros são privados?',
          a: 'Sim. Cada cálculo acontece localmente no seu navegador. Suas despesas, economias e outros números nunca são enviados a um servidor, armazenados em um banco de dados ou compartilhados com terceiros.',
        },
      ],
    },
  };

  const seo = seoContent[lang] || seoContent.en;

  return (
    <ToolPageWrapper toolSlug="emergency-fund-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Inputs */}
          <div>
            <label htmlFor="efc-expenses" className="block text-sm font-medium text-gray-700 mb-1">
              {labels.monthlyExpenses[lang]} ($)
            </label>
            <input
              id="efc-expenses"
              type="text"
              inputMode="decimal"
              value={expenses}
              onChange={(e) => setExpenses(e.target.value)}
              aria-invalid={Boolean(eExpenses.errorKey)}
              className={inputCls(eExpenses.errorKey)}
            />
            {eExpenses.errorKey && (
              <p className="mt-1 text-sm text-red-600">{labels[eExpenses.errorKey][lang]}</p>
            )}
          </div>

          <div>
            <label htmlFor="efc-months" className="block text-sm font-medium text-gray-700 mb-1">
              {labels.targetMonths[lang]}
            </label>
            <input
              id="efc-months"
              type="text"
              inputMode="decimal"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              aria-invalid={Boolean(eMonths.errorKey)}
              className={inputCls(eMonths.errorKey)}
            />
            {eMonths.errorKey ? (
              <p className="mt-1 text-sm text-red-600">{labels[eMonths.errorKey][lang]}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-400">{labels.monthsRecommended[lang]}</p>
            )}
          </div>

          <div>
            <label htmlFor="efc-savings" className="block text-sm font-medium text-gray-700 mb-1">
              {labels.currentSavings[lang]} ($){' '}
              <span className="text-gray-400 font-normal">({labels.optional[lang]})</span>
            </label>
            <input
              id="efc-savings"
              type="text"
              inputMode="decimal"
              value={savings}
              onChange={(e) => setSavings(e.target.value)}
              aria-invalid={Boolean(eSavings.errorKey)}
              className={inputCls(eSavings.errorKey)}
            />
            {eSavings.errorKey && (
              <p className="mt-1 text-sm text-red-600">{labels[eSavings.errorKey][lang]}</p>
            )}
          </div>

          <div>
            <label htmlFor="efc-monthly" className="block text-sm font-medium text-gray-700 mb-1">
              {labels.monthlySaving[lang]} ($){' '}
              <span className="text-gray-400 font-normal">({labels.optional[lang]})</span>
            </label>
            <input
              id="efc-monthly"
              type="text"
              inputMode="decimal"
              value={monthlySaving}
              onChange={(e) => setMonthlySaving(e.target.value)}
              aria-invalid={Boolean(eMonthly.errorKey)}
              className={inputCls(eMonthly.errorKey)}
            />
            {eMonthly.errorKey && (
              <p className="mt-1 text-sm text-red-600">{labels[eMonthly.errorKey][lang]}</p>
            )}
          </div>

          {/* Results */}
          {showResults && (
            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{labels.results[lang]}</h2>

              <div className="grid grid-cols-1 gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                  <div className="text-sm text-white/80">{labels.targetFund[lang]}</div>
                  <div className="text-2xl font-bold">{fmt(targetFund)}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div
                    className={`rounded-lg p-3 border ${gap === 0 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}
                  >
                    <div
                      className={`text-xs font-medium ${gap === 0 ? 'text-green-600' : 'text-amber-600'}`}
                    >
                      {labels.currentGap[lang]}
                    </div>
                    <div className="text-lg font-bold text-gray-900">{fmt(gap)}</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="text-xs text-purple-600 font-medium">
                      {labels.monthsToGoal[lang]}
                    </div>
                    <div className="text-lg font-bold text-gray-900">{monthsText}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  {copied ? labels.copied[lang] : labels.copyResult[lang]}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  {labels.reset[lang]}
                </button>
              </div>
            </div>
          )}

          {!showResults && (
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                {labels.reset[lang]}
              </button>
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
      </div>
    </ToolPageWrapper>
  );
}
