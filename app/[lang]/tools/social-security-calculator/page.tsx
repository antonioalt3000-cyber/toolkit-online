'use client';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type CalcResult =
  | { valid: false; errorKey: string }
  | {
      valid: true;
      adjustedMonthly: number;
      adjustedAnnual: number;
      percentOfFra: number;
      difference: number;
      status: 'early' | 'delayed' | 'fra';
    };

const DEFAULTS = {
  monthlyBenefit: 2000,
  fra: 67,
  claimingAge: 67,
  earlyFirst36: 0.5556,
  earlyBeyond: 0.4167,
  delayedCredit: 8,
};

export default function SocialSecurityCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['social-security-calculator'][lang];

  const [monthlyBenefit, setMonthlyBenefit] = useState<number>(DEFAULTS.monthlyBenefit);
  const [fra, setFra] = useState<number>(DEFAULTS.fra);
  const [claimingAge, setClaimingAge] = useState<number>(DEFAULTS.claimingAge);
  const [earlyFirst36, setEarlyFirst36] = useState<number>(DEFAULTS.earlyFirst36);
  const [earlyBeyond, setEarlyBeyond] = useState<number>(DEFAULTS.earlyBeyond);
  const [delayedCredit, setDelayedCredit] = useState<number>(DEFAULTS.delayedCredit);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const labels = {
    monthlyBenefit: {
      en: 'Estimated monthly benefit at FRA ($)',
      it: "Beneficio mensile stimato all'eta piena ($)",
      es: 'Beneficio mensual estimado en la edad plena ($)',
      fr: "Prestation mensuelle estimee a l'age legal ($)",
      de: 'Geschaetzte monatliche Leistung bei Regelalter ($)',
      pt: 'Beneficio mensal estimado na idade plena ($)',
    },
    fra: {
      en: 'Full Retirement Age (FRA)',
      it: 'Eta pensionabile piena (FRA)',
      es: 'Edad plena de jubilacion (FRA)',
      fr: 'Age legal de la retraite (FRA)',
      de: 'Regelaltersgrenze (FRA)',
      pt: 'Idade plena de aposentadoria (FRA)',
    },
    claimingAge: {
      en: 'Claiming age (62-70)',
      it: 'Eta di richiesta (62-70)',
      es: 'Edad de solicitud (62-70)',
      fr: 'Age de demande (62-70)',
      de: 'Antragsalter (62-70)',
      pt: 'Idade de solicitacao (62-70)',
    },
    advanced: {
      en: 'Adjustment rates',
      it: 'Tassi di adeguamento',
      es: 'Tasas de ajuste',
      fr: "Taux d'ajustement",
      de: 'Anpassungssaetze',
      pt: 'Taxas de ajuste',
    },
    showAdvanced: {
      en: 'Show adjustment rates',
      it: 'Mostra tassi di adeguamento',
      es: 'Mostrar tasas de ajuste',
      fr: "Afficher les taux d'ajustement",
      de: 'Anpassungssaetze anzeigen',
      pt: 'Mostrar taxas de ajuste',
    },
    hideAdvanced: {
      en: 'Hide adjustment rates',
      it: 'Nascondi tassi di adeguamento',
      es: 'Ocultar tasas de ajuste',
      fr: "Masquer les taux d'ajustement",
      de: 'Anpassungssaetze ausblenden',
      pt: 'Ocultar taxas de ajuste',
    },
    earlyFirst36: {
      en: 'Early reduction, first 36 months (%/month)',
      it: 'Riduzione anticipo, primi 36 mesi (%/mese)',
      es: 'Reduccion anticipada, primeros 36 meses (%/mes)',
      fr: 'Reduction anticipee, 36 premiers mois (%/mois)',
      de: 'Vorzeitige Kuerzung, erste 36 Monate (%/Monat)',
      pt: 'Reducao antecipada, primeiros 36 meses (%/mes)',
    },
    earlyBeyond: {
      en: 'Early reduction, beyond 36 months (%/month)',
      it: 'Riduzione anticipo, oltre 36 mesi (%/mese)',
      es: 'Reduccion anticipada, mas de 36 meses (%/mes)',
      fr: 'Reduction anticipee, au-dela de 36 mois (%/mois)',
      de: 'Vorzeitige Kuerzung, ueber 36 Monate (%/Monat)',
      pt: 'Reducao antecipada, alem de 36 meses (%/mes)',
    },
    delayedCredit: {
      en: 'Delayed retirement credit (%/year)',
      it: 'Credito pensione posticipata (%/anno)',
      es: 'Credito por jubilacion aplazada (%/ano)',
      fr: 'Credit de retraite differee (%/an)',
      de: 'Aufschubgutschrift (%/Jahr)',
      pt: 'Credito por aposentadoria adiada (%/ano)',
    },
    results: {
      en: 'Results',
      it: 'Risultati',
      es: 'Resultados',
      fr: 'Resultats',
      de: 'Ergebnisse',
      pt: 'Resultados',
    },
    adjustedMonthly: {
      en: 'Adjusted monthly benefit',
      it: 'Beneficio mensile adeguato',
      es: 'Beneficio mensual ajustado',
      fr: 'Prestation mensuelle ajustee',
      de: 'Angepasste monatliche Leistung',
      pt: 'Beneficio mensal ajustado',
    },
    adjustedAnnual: {
      en: 'Adjusted annual benefit',
      it: 'Beneficio annuale adeguato',
      es: 'Beneficio anual ajustado',
      fr: 'Prestation annuelle ajustee',
      de: 'Angepasste jaehrliche Leistung',
      pt: 'Beneficio anual ajustado',
    },
    percentOfFra: {
      en: 'Percentage of FRA benefit',
      it: 'Percentuale del beneficio FRA',
      es: 'Porcentaje del beneficio FRA',
      fr: 'Pourcentage de la prestation FRA',
      de: 'Prozent der FRA-Leistung',
      pt: 'Porcentagem do beneficio FRA',
    },
    difference: {
      en: 'Difference vs FRA benefit',
      it: 'Differenza rispetto al beneficio FRA',
      es: 'Diferencia vs beneficio FRA',
      fr: 'Difference vs prestation FRA',
      de: 'Differenz zur FRA-Leistung',
      pt: 'Diferenca vs beneficio FRA',
    },
    statusEarly: {
      en: 'Reduced for early claiming',
      it: 'Ridotto per richiesta anticipata',
      es: 'Reducido por solicitud anticipada',
      fr: 'Reduit pour demande anticipee',
      de: 'Reduziert wegen vorzeitigem Antrag',
      pt: 'Reduzido por solicitacao antecipada',
    },
    statusDelayed: {
      en: 'Increased with delayed credits',
      it: 'Aumentato con crediti posticipati',
      es: 'Aumentado con creditos aplazados',
      fr: 'Augmente avec credits differes',
      de: 'Erhoeht durch Aufschubgutschriften',
      pt: 'Aumentado com creditos adiados',
    },
    statusFra: {
      en: 'Full benefit at FRA',
      it: 'Beneficio pieno al FRA',
      es: 'Beneficio pleno en FRA',
      fr: 'Prestation complete au FRA',
      de: 'Volle Leistung bei FRA',
      pt: 'Beneficio pleno no FRA',
    },
    copy: {
      en: 'Copy result',
      it: 'Copia risultato',
      es: 'Copiar resultado',
      fr: 'Copier le resultat',
      de: 'Ergebnis kopieren',
      pt: 'Copiar resultado',
    },
    copied: {
      en: 'Copied!',
      it: 'Copiato!',
      es: '¡Copiado!',
      fr: 'Copie !',
      de: 'Kopiert!',
      pt: 'Copiado!',
    },
    reset: {
      en: 'Reset',
      it: 'Reimposta',
      es: 'Restablecer',
      fr: 'Reinitialiser',
      de: 'Zuruecksetzen',
      pt: 'Redefinir',
    },
    errBenefit: {
      en: 'Enter a monthly benefit greater than 0.',
      it: 'Inserisci un beneficio mensile maggiore di 0.',
      es: 'Introduce un beneficio mensual mayor que 0.',
      fr: 'Saisissez une prestation mensuelle superieure a 0.',
      de: 'Geben Sie eine monatliche Leistung groesser als 0 ein.',
      pt: 'Insira um beneficio mensal maior que 0.',
    },
    errFra: {
      en: 'Full Retirement Age must be between 60 and 70.',
      it: "L'eta pensionabile piena deve essere tra 60 e 70.",
      es: 'La edad plena de jubilacion debe estar entre 60 y 70.',
      fr: "L'age legal de la retraite doit etre entre 60 et 70.",
      de: 'Die Regelaltersgrenze muss zwischen 60 und 70 liegen.',
      pt: 'A idade plena de aposentadoria deve estar entre 60 e 70.',
    },
    errClaim: {
      en: 'Claiming age must be between 62 and 70.',
      it: "L'eta di richiesta deve essere tra 62 e 70.",
      es: 'La edad de solicitud debe estar entre 62 y 70.',
      fr: "L'age de demande doit etre entre 62 et 70.",
      de: 'Das Antragsalter muss zwischen 62 und 70 liegen.',
      pt: 'A idade de solicitacao deve estar entre 62 e 70.',
    },
    errRates: {
      en: 'Adjustment rates cannot be negative.',
      it: 'I tassi di adeguamento non possono essere negativi.',
      es: 'Las tasas de ajuste no pueden ser negativas.',
      fr: "Les taux d'ajustement ne peuvent pas etre negatifs.",
      de: 'Anpassungssaetze duerfen nicht negativ sein.',
      pt: 'As taxas de ajuste nao podem ser negativas.',
    },
  } as Record<string, Record<Locale, string>>;

  const calc = useMemo<CalcResult>(() => {
    if (!Number.isFinite(monthlyBenefit) || monthlyBenefit <= 0)
      return { valid: false, errorKey: 'errBenefit' };
    if (!Number.isFinite(fra) || fra < 60 || fra > 70) return { valid: false, errorKey: 'errFra' };
    if (!Number.isFinite(claimingAge) || claimingAge < 62 || claimingAge > 70)
      return { valid: false, errorKey: 'errClaim' };
    if (earlyFirst36 < 0 || earlyBeyond < 0 || delayedCredit < 0)
      return { valid: false, errorKey: 'errRates' };

    const monthsFromFra = Math.round((claimingAge - fra) * 12);
    let factor = 1;
    let status: 'early' | 'delayed' | 'fra' = 'fra';

    if (monthsFromFra < 0) {
      const monthsEarly = -monthsFromFra;
      const first = Math.min(monthsEarly, 36) * (earlyFirst36 / 100);
      const beyond = Math.max(monthsEarly - 36, 0) * (earlyBeyond / 100);
      factor = Math.max(1 - (first + beyond), 0);
      status = 'early';
    } else if (monthsFromFra > 0) {
      const increase = monthsFromFra * (delayedCredit / 100 / 12);
      factor = 1 + increase;
      status = 'delayed';
    }

    const adjustedMonthly = monthlyBenefit * factor;
    return {
      valid: true,
      adjustedMonthly,
      adjustedAnnual: adjustedMonthly * 12,
      percentOfFra: factor * 100,
      difference: adjustedMonthly - monthlyBenefit,
      status,
    };
  }, [monthlyBenefit, fra, claimingAge, earlyFirst36, earlyBeyond, delayedCredit]);

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

  const fmtCurrency = (n: number): string =>
    new Intl.NumberFormat(localeTag, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(n);

  const fmtPct = (n: number): string => `${n.toFixed(1)}%`;

  const statusLabel = (s: 'early' | 'delayed' | 'fra'): string =>
    s === 'early'
      ? labels.statusEarly[lang]
      : s === 'delayed'
        ? labels.statusDelayed[lang]
        : labels.statusFra[lang];

  const handleCopy = (): void => {
    if (!calc.valid) return;
    const text = [
      `${labels.adjustedMonthly[lang]}: ${fmtCurrency(calc.adjustedMonthly)}`,
      `${labels.adjustedAnnual[lang]}: ${fmtCurrency(calc.adjustedAnnual)}`,
      `${labels.percentOfFra[lang]}: ${fmtPct(calc.percentOfFra)}`,
      `${labels.difference[lang]}: ${fmtCurrency(calc.difference)}`,
    ].join('\n');
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = (): void => {
    setMonthlyBenefit(DEFAULTS.monthlyBenefit);
    setFra(DEFAULTS.fra);
    setClaimingAge(DEFAULTS.claimingAge);
    setEarlyFirst36(DEFAULTS.earlyFirst36);
    setEarlyBeyond(DEFAULTS.earlyBeyond);
    setDelayedCredit(DEFAULTS.delayedCredit);
    setShowAdvanced(false);
    setCopied(false);
  };

  const seoContent: Record<
    Locale,
    { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }
  > = {
    en: {
      title: 'Social Security Calculator: Estimate Your Retirement Benefit at Any Claiming Age',
      paragraphs: [
        'The Social Security Calculator gives you a fast, private estimate of the monthly retirement benefit you might receive from the U.S. Social Security Administration (SSA). Your real benefit depends on your lifetime earnings, your Full Retirement Age (FRA), and the exact age you begin collecting. This tool starts from your estimated benefit at FRA — the figure printed on your official SSA statement — and adjusts it for the claiming age you choose, so you can weigh claiming early against waiting.',
        'Claiming age is the single biggest lever most retirees control. If you begin benefits before your Full Retirement Age, your monthly check is permanently reduced: roughly five-ninths of one percent for each of the first 36 months early, and five-twelfths of one percent for every additional month. Claim at 62 with an FRA of 67 and your benefit falls by about 30%. Wait past your FRA and you earn delayed retirement credits of about 8% per year until age 70, which can raise your benefit by up to 24%. The calculator applies these adjustments instantly so the trade-off is easy to see.',
        'Deciding when to claim involves more than arithmetic. Life expectancy, spousal and survivor benefits, whether you keep working, and your other retirement income all matter, and pairing Social Security with personal savings usually produces the steadiest income. To model how your own investments grow alongside your benefit, try our <a href="/${lang}/tools/retirement-calculator">retirement calculator</a> and <a href="/${lang}/tools/compound-interest-calculator">compound interest calculator</a>, then compare the combined picture before you decide.',
        'The reduction percentages, the delayed-credit rate, and the Full Retirement Age used here are US-oriented defaults that the SSA updates over time; FRA, for example, is 67 for people born in 1960 or later but lower for earlier birth years. Every rate in this tool is editable, so you can match the current official figures whenever they change. Treat the result as an estimate for planning only — your definitive numbers come from your personal statement at ssa.gov.',
      ],
      faq: [
        {
          q: 'How does claiming age affect my Social Security benefit?',
          a: 'Claiming before your Full Retirement Age permanently reduces your monthly benefit — about 30% at age 62 if your FRA is 67 — while delaying past FRA adds roughly 8% per year until age 70. The calculator shows the adjusted amount for any claiming age between 62 and 70.',
        },
        {
          q: 'What is Full Retirement Age (FRA)?',
          a: 'FRA is the age at which you receive 100% of your primary benefit. For people born in 1960 or later it is 67; it is lower for earlier birth years. You can edit the FRA field to match your own year of birth.',
        },
        {
          q: 'Where do I find my benefit at Full Retirement Age?',
          a: 'Your personal estimate appears on your Social Security statement, available free at ssa.gov after you create a my Social Security account. Enter that figure as the starting benefit for the most accurate result.',
        },
        {
          q: 'Is my information saved?',
          a: 'No. All calculations run entirely in your browser. Nothing you type is sent to a server, stored in a database, or shared with third parties.',
        },
        {
          q: 'How accurate is this estimate?',
          a: 'It is a simplified projection using standard SSA adjustment rules and the figures you enter. It does not account for future earnings, cost-of-living adjustments, taxes, or spousal benefits. Use your official SSA statement for definitive numbers.',
        },
      ],
    },
    it: {
      title: 'Calcolatore Previdenza Sociale: Stima il Beneficio Pensionistico a Qualsiasi Eta',
      paragraphs: [
        "Il Calcolatore Previdenza Sociale offre una stima rapida e privata del beneficio pensionistico mensile che potresti ricevere dalla Social Security Administration (SSA) statunitense. Il beneficio reale dipende dai guadagni di una vita, dall'eta pensionabile piena (FRA) e dall'eta esatta in cui inizi a riscuotere. Lo strumento parte dal beneficio stimato al FRA — la cifra riportata sul tuo estratto conto SSA ufficiale — e lo adegua all'eta di richiesta che scegli, cosi puoi confrontare l'anticipo con l'attesa.",
        "L'eta di richiesta e la leva piu importante che la maggior parte dei pensionati controlla. Se inizi prima dell'eta pensionabile piena, l'assegno mensile si riduce in modo permanente: circa cinque noni dell'uno percento per ciascuno dei primi 36 mesi di anticipo e cinque dodicesimi dell'uno percento per ogni mese aggiuntivo. Richiedendo a 62 anni con un FRA di 67, il beneficio cala di circa il 30%. Aspettando oltre il FRA maturi crediti di posticipo di circa l'8% all'anno fino a 70 anni, che possono aumentare il beneficio fino al 24%. Il calcolatore applica questi adeguamenti all'istante.",
        'Decidere quando richiedere non e solo aritmetica. Aspettativa di vita, benefici per coniuge e superstiti, il fatto che continui a lavorare e le altre entrate pensionistiche contano tutti, e abbinare la previdenza sociale ai risparmi personali di solito produce l\'entrata piu stabile. Per modellare come crescono i tuoi investimenti insieme al beneficio, prova il nostro <a href="/${lang}/tools/retirement-calculator">calcolatore pensione</a> e il <a href="/${lang}/tools/compound-interest-calculator">calcolatore interesse composto</a>, poi confronta il quadro complessivo.',
        "Le percentuali di riduzione, il tasso di credito posticipato e l'eta pensionabile piena usati qui sono valori predefiniti orientati agli USA che la SSA aggiorna nel tempo; il FRA, ad esempio, e 67 per chi e nato nel 1960 o dopo, ma piu basso per anni precedenti. Ogni tasso e modificabile, cosi puoi allinearlo alle cifre ufficiali attuali quando cambiano. Considera il risultato solo una stima per la pianificazione — i numeri definitivi vengono dal tuo estratto conto personale su ssa.gov.",
      ],
      faq: [
        {
          q: "Come influisce l'eta di richiesta sul beneficio?",
          a: "Richiedere prima dell'eta pensionabile piena riduce in modo permanente il beneficio mensile — circa il 30% a 62 anni se il FRA e 67 — mentre posticipare oltre il FRA aggiunge circa l'8% all'anno fino a 70 anni. Il calcolatore mostra l'importo adeguato per qualsiasi eta tra 62 e 70.",
        },
        {
          q: "Cos'e l'eta pensionabile piena (FRA)?",
          a: "Il FRA e l'eta a cui ricevi il 100% del beneficio primario. Per chi e nato nel 1960 o dopo e 67 anni; e piu basso per anni di nascita precedenti. Puoi modificare il campo FRA in base al tuo anno di nascita.",
        },
        {
          q: "Dove trovo il beneficio all'eta pensionabile piena?",
          a: 'La stima personale compare sul tuo estratto conto della previdenza sociale, disponibile gratuitamente su ssa.gov dopo aver creato un account my Social Security. Inserisci quella cifra come beneficio di partenza.',
        },
        {
          q: 'Le mie informazioni vengono salvate?',
          a: 'No. Tutti i calcoli avvengono interamente nel browser. Nulla di cio che digiti viene inviato a un server, memorizzato in un database o condiviso con terze parti.',
        },
        {
          q: 'Quanto e accurata questa stima?',
          a: "E una proiezione semplificata che usa le regole di adeguamento standard della SSA e i valori inseriti. Non considera guadagni futuri, adeguamenti al costo della vita, tasse o benefici del coniuge. Usa l'estratto conto SSA ufficiale per i numeri definitivi.",
        },
      ],
    },
    es: {
      title: 'Calculadora de Seguridad Social: Estima Tu Beneficio de Jubilacion a Cualquier Edad',
      paragraphs: [
        'La Calculadora de Seguridad Social ofrece una estimacion rapida y privada del beneficio mensual de jubilacion que podrias recibir de la Administracion del Seguro Social (SSA) de EE. UU. Tu beneficio real depende de los ingresos de toda tu vida, de tu edad plena de jubilacion (FRA) y de la edad exacta en que empiezas a cobrar. La herramienta parte del beneficio estimado en el FRA — la cifra que figura en tu declaracion oficial de la SSA — y lo ajusta a la edad de solicitud que elijas, para que compares solicitar antes con esperar.',
        'La edad de solicitud es la palanca mas importante que controla la mayoria de los jubilados. Si empiezas antes de tu edad plena de jubilacion, tu cheque mensual se reduce de forma permanente: cerca de cinco novenos del uno por ciento por cada uno de los primeros 36 meses de anticipo y cinco doceavos del uno por ciento por cada mes adicional. Al solicitar a los 62 con un FRA de 67, el beneficio cae alrededor del 30%. Si esperas mas alla del FRA ganas creditos por jubilacion aplazada de cerca del 8% anual hasta los 70 anos, que pueden aumentar el beneficio hasta un 24%. La calculadora aplica estos ajustes al instante.',
        'Decidir cuando solicitar implica mas que aritmetica. La esperanza de vida, los beneficios conyugales y de sobreviviente, si sigues trabajando y tus otros ingresos de jubilacion importan, y combinar el Seguro Social con ahorros personales suele producir el ingreso mas estable. Para modelar como crecen tus inversiones junto al beneficio, prueba nuestra <a href="/${lang}/tools/retirement-calculator">calculadora de jubilacion</a> y la <a href="/${lang}/tools/compound-interest-calculator">calculadora de interes compuesto</a>, y luego compara el panorama completo.',
        'Los porcentajes de reduccion, la tasa de credito aplazado y la edad plena de jubilacion usados aqui son valores predeterminados orientados a EE. UU. que la SSA actualiza con el tiempo; el FRA, por ejemplo, es 67 para nacidos en 1960 o despues, pero menor para anos anteriores. Cada tasa es editable, para que la ajustes a las cifras oficiales actuales cuando cambien. Considera el resultado solo una estimacion para planificar — los numeros definitivos vienen de tu declaracion personal en ssa.gov.',
      ],
      faq: [
        {
          q: '¿Como afecta la edad de solicitud a mi beneficio?',
          a: 'Solicitar antes de tu edad plena de jubilacion reduce de forma permanente el beneficio mensual — cerca del 30% a los 62 si tu FRA es 67 — mientras que aplazar mas alla del FRA anade cerca del 8% anual hasta los 70. La calculadora muestra el importe ajustado para cualquier edad entre 62 y 70.',
        },
        {
          q: '¿Que es la edad plena de jubilacion (FRA)?',
          a: 'El FRA es la edad a la que recibes el 100% de tu beneficio principal. Para nacidos en 1960 o despues es 67; es menor para anos de nacimiento anteriores. Puedes editar el campo FRA segun tu ano de nacimiento.',
        },
        {
          q: '¿Donde encuentro mi beneficio en la edad plena?',
          a: 'Tu estimacion personal aparece en tu declaracion del Seguro Social, disponible gratis en ssa.gov tras crear una cuenta my Social Security. Introduce esa cifra como beneficio de partida.',
        },
        {
          q: '¿Se guarda mi informacion?',
          a: 'No. Todos los calculos se realizan por completo en tu navegador. Nada de lo que escribes se envia a un servidor, se almacena en una base de datos ni se comparte con terceros.',
        },
        {
          q: '¿Que tan precisa es esta estimacion?',
          a: 'Es una proyeccion simplificada que usa las reglas de ajuste estandar de la SSA y los valores que introduces. No considera ingresos futuros, ajustes por costo de vida, impuestos ni beneficios conyugales. Usa tu declaracion oficial de la SSA para los numeros definitivos.',
        },
      ],
    },
    fr: {
      title: 'Calculateur de Securite Sociale : Estimez Votre Prestation de Retraite a Tout Age',
      paragraphs: [
        "Le Calculateur de Securite Sociale fournit une estimation rapide et confidentielle de la prestation mensuelle de retraite que vous pourriez recevoir de la Social Security Administration (SSA) americaine. Votre prestation reelle depend de vos revenus de toute une vie, de votre age legal de la retraite (FRA) et de l'age exact auquel vous commencez a percevoir. L'outil part de la prestation estimee au FRA — le montant indique sur votre releve officiel de la SSA — et l'ajuste selon l'age de demande choisi, pour comparer une demande anticipee a l'attente.",
        "L'age de demande est le levier le plus important que controle la plupart des retraites. Si vous commencez avant votre age legal de la retraite, votre cheque mensuel est reduit de facon permanente : environ cinq neuviemes d'un pour cent pour chacun des 36 premiers mois d'anticipation, et cinq douziemes d'un pour cent pour chaque mois supplementaire. En demandant a 62 ans avec un FRA de 67, la prestation baisse d'environ 30%. En attendant au-dela du FRA, vous gagnez des credits de retraite differee d'environ 8% par an jusqu'a 70 ans, ce qui peut augmenter la prestation jusqu'a 24%. Le calculateur applique ces ajustements instantanement.",
        'Decider quand demander implique plus que de l\'arithmetique. L\'esperance de vie, les prestations de conjoint et de survivant, le fait de continuer a travailler et vos autres revenus de retraite comptent tous, et associer la Securite Sociale a une epargne personnelle produit generalement le revenu le plus stable. Pour modeliser la croissance de vos investissements aux cotes de votre prestation, essayez notre <a href="/${lang}/tools/retirement-calculator">calculateur de retraite</a> et le <a href="/${lang}/tools/compound-interest-calculator">calculateur d\'interets composes</a>, puis comparez l\'ensemble.',
        "Les pourcentages de reduction, le taux de credit differe et l'age legal de la retraite utilises ici sont des valeurs par defaut orientees vers les Etats-Unis que la SSA met a jour au fil du temps ; le FRA, par exemple, est de 67 ans pour les personnes nees en 1960 ou apres, mais plus bas pour les annees anterieures. Chaque taux est modifiable, afin de correspondre aux chiffres officiels actuels lorsqu'ils changent. Considerez le resultat comme une estimation de planification uniquement — vos chiffres definitifs proviennent de votre releve personnel sur ssa.gov.",
      ],
      faq: [
        {
          q: "Comment l'age de demande affecte-t-il ma prestation ?",
          a: "Demander avant votre age legal de la retraite reduit de facon permanente la prestation mensuelle — environ 30% a 62 ans si votre FRA est 67 — tandis que differer au-dela du FRA ajoute environ 8% par an jusqu'a 70 ans. Le calculateur affiche le montant ajuste pour tout age entre 62 et 70.",
        },
        {
          q: "Qu'est-ce que l'age legal de la retraite (FRA) ?",
          a: "Le FRA est l'age auquel vous recevez 100% de votre prestation principale. Pour les personnes nees en 1960 ou apres, il est de 67 ans ; il est plus bas pour les annees de naissance anterieures. Vous pouvez modifier le champ FRA selon votre annee de naissance.",
        },
        {
          q: "Ou trouver ma prestation a l'age legal ?",
          a: 'Votre estimation personnelle figure sur votre releve de Securite Sociale, disponible gratuitement sur ssa.gov apres avoir cree un compte my Social Security. Saisissez ce montant comme prestation de depart.',
        },
        {
          q: 'Mes informations sont-elles enregistrees ?',
          a: "Non. Tous les calculs s'effectuent entierement dans votre navigateur. Rien de ce que vous saisissez n'est envoye a un serveur, stocke dans une base de donnees ou partage avec des tiers.",
        },
        {
          q: 'Quelle est la precision de cette estimation ?',
          a: "C'est une projection simplifiee utilisant les regles d'ajustement standard de la SSA et les valeurs que vous saisissez. Elle ne tient pas compte des revenus futurs, des ajustements au cout de la vie, des impots ni des prestations de conjoint. Utilisez votre releve officiel de la SSA pour les chiffres definitifs.",
        },
      ],
    },
    de: {
      title: 'Sozialversicherungsrechner: Schaetzen Sie Ihre Rentenleistung bei Jedem Antragsalter',
      paragraphs: [
        'Der Sozialversicherungsrechner liefert eine schnelle, private Schaetzung der monatlichen Rentenleistung, die Sie von der US-amerikanischen Social Security Administration (SSA) erhalten koennten. Ihre tatsaechliche Leistung haengt von Ihren lebenslangen Einkuenften, Ihrer Regelaltersgrenze (FRA) und dem genauen Alter ab, in dem Sie zu beziehen beginnen. Das Tool geht von Ihrer geschaetzten Leistung bei FRA aus — dem Betrag auf Ihrer offiziellen SSA-Mitteilung — und passt ihn an das gewaehlte Antragsalter an, damit Sie einen fruehen Bezug mit dem Warten vergleichen koennen.',
        'Das Antragsalter ist der wichtigste Hebel, den die meisten Rentner steuern. Wenn Sie vor Ihrer Regelaltersgrenze beginnen, wird Ihr monatlicher Scheck dauerhaft gekuerzt: etwa fuenf Neuntel eines Prozents fuer jeden der ersten 36 Monate zu frueh und fuenf Zwoelftel eines Prozents fuer jeden weiteren Monat. Bei einem Antrag mit 62 und einem FRA von 67 sinkt die Leistung um etwa 30%. Wenn Sie ueber das FRA hinaus warten, erhalten Sie Aufschubgutschriften von etwa 8% pro Jahr bis zum Alter von 70, was die Leistung um bis zu 24% erhoehen kann. Der Rechner wendet diese Anpassungen sofort an.',
        'Die Entscheidung, wann Sie beantragen, ist mehr als Rechnen. Lebenserwartung, Leistungen fuer Ehepartner und Hinterbliebene, ob Sie weiterarbeiten und Ihre uebrigen Renteneinkuenfte spielen alle eine Rolle, und die Kombination von Sozialversicherung mit privaten Ersparnissen ergibt meist das stabilste Einkommen. Um zu modellieren, wie Ihre Anlagen neben der Leistung wachsen, testen Sie unseren <a href="/${lang}/tools/retirement-calculator">Rentenrechner</a> und den <a href="/${lang}/tools/compound-interest-calculator">Zinseszinsrechner</a> und vergleichen Sie das Gesamtbild.',
        'Die hier verwendeten Kuerzungsprozentsaetze, der Aufschubgutschriftssatz und die Regelaltersgrenze sind auf die USA ausgerichtete Standardwerte, die die SSA im Laufe der Zeit aktualisiert; das FRA betraegt zum Beispiel 67 fuer ab 1960 Geborene, ist aber fuer fruehere Geburtsjahre niedriger. Jeder Satz ist bearbeitbar, damit Sie ihn an die aktuellen offiziellen Zahlen anpassen koennen, wenn sie sich aendern. Betrachten Sie das Ergebnis nur als Schaetzung zur Planung — Ihre endgueltigen Zahlen stammen aus Ihrer persoenlichen Mitteilung auf ssa.gov.',
      ],
      faq: [
        {
          q: 'Wie wirkt sich das Antragsalter auf meine Leistung aus?',
          a: 'Ein Antrag vor der Regelaltersgrenze kuerzt die monatliche Leistung dauerhaft — etwa 30% mit 62, wenn Ihr FRA 67 ist — waehrend ein Aufschub ueber das FRA hinaus etwa 8% pro Jahr bis 70 hinzufuegt. Der Rechner zeigt den angepassten Betrag fuer jedes Alter zwischen 62 und 70.',
        },
        {
          q: 'Was ist die Regelaltersgrenze (FRA)?',
          a: 'Das FRA ist das Alter, in dem Sie 100% Ihrer Grundleistung erhalten. Fuer ab 1960 Geborene betraegt es 67; fuer fruehere Geburtsjahre ist es niedriger. Sie koennen das FRA-Feld an Ihr Geburtsjahr anpassen.',
        },
        {
          q: 'Wo finde ich meine Leistung bei Regelaltersgrenze?',
          a: 'Ihre persoenliche Schaetzung erscheint auf Ihrer Sozialversicherungsmitteilung, die nach dem Erstellen eines my-Social-Security-Kontos kostenlos auf ssa.gov verfuegbar ist. Geben Sie diesen Betrag als Ausgangsleistung ein.',
        },
        {
          q: 'Werden meine Angaben gespeichert?',
          a: 'Nein. Alle Berechnungen erfolgen vollstaendig in Ihrem Browser. Nichts, was Sie eingeben, wird an einen Server gesendet, in einer Datenbank gespeichert oder mit Dritten geteilt.',
        },
        {
          q: 'Wie genau ist diese Schaetzung?',
          a: 'Es ist eine vereinfachte Projektion mit den Standard-Anpassungsregeln der SSA und den von Ihnen eingegebenen Werten. Sie beruecksichtigt keine kuenftigen Einkuenfte, Anpassungen an die Lebenshaltungskosten, Steuern oder Ehepartnerleistungen. Verwenden Sie Ihre offizielle SSA-Mitteilung fuer endgueltige Zahlen.',
        },
      ],
    },
    pt: {
      title:
        'Calculadora de Previdencia Social: Estime Seu Beneficio de Aposentadoria em Qualquer Idade',
      paragraphs: [
        'A Calculadora de Previdencia Social oferece uma estimativa rapida e privada do beneficio mensal de aposentadoria que voce pode receber da Social Security Administration (SSA) dos EUA. Seu beneficio real depende dos ganhos de toda a vida, da idade plena de aposentadoria (FRA) e da idade exata em que comeca a receber. A ferramenta parte do beneficio estimado no FRA — o valor que consta no seu extrato oficial da SSA — e o ajusta para a idade de solicitacao escolhida, para que voce compare solicitar mais cedo com esperar.',
        'A idade de solicitacao e a maior alavanca que a maioria dos aposentados controla. Se voce comeca antes da idade plena de aposentadoria, seu cheque mensal e reduzido de forma permanente: cerca de cinco nonos de um por cento para cada um dos primeiros 36 meses de antecipacao e cinco doze avos de um por cento para cada mes adicional. Ao solicitar aos 62 com um FRA de 67, o beneficio cai cerca de 30%. Ao esperar alem do FRA, voce acumula creditos por aposentadoria adiada de cerca de 8% ao ano ate os 70, que podem aumentar o beneficio em ate 24%. A calculadora aplica esses ajustes instantaneamente.',
        'Decidir quando solicitar envolve mais do que aritmetica. Expectativa de vida, beneficios de conjuge e de sobrevivente, se voce continua trabalhando e suas outras rendas de aposentadoria importam, e combinar a Previdencia Social com poupanca pessoal costuma produzir a renda mais estavel. Para modelar como seus investimentos crescem junto ao beneficio, experimente nossa <a href="/${lang}/tools/retirement-calculator">calculadora de aposentadoria</a> e a <a href="/${lang}/tools/compound-interest-calculator">calculadora de juros compostos</a> e compare o quadro completo.',
        'As porcentagens de reducao, a taxa de credito adiado e a idade plena de aposentadoria usadas aqui sao valores padrao orientados aos EUA que a SSA atualiza ao longo do tempo; o FRA, por exemplo, e 67 para nascidos em 1960 ou depois, mas menor para anos anteriores. Cada taxa e editavel, para que voce a ajuste aos numeros oficiais atuais quando mudarem. Considere o resultado apenas uma estimativa para planejamento — seus numeros definitivos vem do seu extrato pessoal em ssa.gov.',
      ],
      faq: [
        {
          q: 'Como a idade de solicitacao afeta meu beneficio?',
          a: 'Solicitar antes da idade plena de aposentadoria reduz permanentemente o beneficio mensal — cerca de 30% aos 62 se o seu FRA e 67 — enquanto adiar alem do FRA acrescenta cerca de 8% ao ano ate os 70. A calculadora mostra o valor ajustado para qualquer idade entre 62 e 70.',
        },
        {
          q: 'O que e a idade plena de aposentadoria (FRA)?',
          a: 'O FRA e a idade em que voce recebe 100% do seu beneficio principal. Para nascidos em 1960 ou depois e 67; e menor para anos de nascimento anteriores. Voce pode editar o campo FRA conforme seu ano de nascimento.',
        },
        {
          q: 'Onde encontro meu beneficio na idade plena?',
          a: 'Sua estimativa pessoal aparece no seu extrato da Previdencia Social, disponivel gratuitamente em ssa.gov apos criar uma conta my Social Security. Insira esse valor como beneficio inicial.',
        },
        {
          q: 'Minhas informacoes sao salvas?',
          a: 'Nao. Todos os calculos ocorrem inteiramente no seu navegador. Nada do que voce digita e enviado a um servidor, armazenado em um banco de dados ou compartilhado com terceiros.',
        },
        {
          q: 'Qual a precisao desta estimativa?',
          a: 'E uma projecao simplificada que usa as regras de ajuste padrao da SSA e os valores que voce insere. Nao considera ganhos futuros, ajustes de custo de vida, impostos ou beneficios de conjuge. Use seu extrato oficial da SSA para numeros definitivos.',
        },
      ],
    },
  };

  const seo = seoContent[lang] || seoContent.en;

  return (
    <ToolPageWrapper toolSlug="social-security-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Inputs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.monthlyBenefit[lang]}
            </label>
            <input
              type="number"
              min={0}
              step={50}
              value={monthlyBenefit}
              onChange={(e) => setMonthlyBenefit(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.fra[lang]}
              </label>
              <input
                type="number"
                min={60}
                max={70}
                step={0.5}
                value={fra}
                onChange={(e) => setFra(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.claimingAge[lang]}
              </label>
              <input
                type="number"
                min={62}
                max={70}
                step={0.5}
                value={claimingAge}
                onChange={(e) => setClaimingAge(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Advanced editable rates */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-500 hover:text-blue-700 font-medium transition-colors"
            >
              {showAdvanced ? labels.hideAdvanced[lang] : labels.showAdvanced[lang]}
            </button>
            {showAdvanced && (
              <div className="mt-3 space-y-4 border border-gray-100 rounded-lg p-4 bg-gray-50">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {labels.earlyFirst36[lang]}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.0001}
                    value={earlyFirst36}
                    onChange={(e) => setEarlyFirst36(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {labels.earlyBeyond[lang]}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.0001}
                    value={earlyBeyond}
                    onChange={(e) => setEarlyBeyond(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {labels.delayedCredit[lang]}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={delayedCredit}
                    onChange={(e) => setDelayedCredit(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {!calc.valid && (
            <div className="border border-red-200 bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2">
              {labels[calc.errorKey][lang]}
            </div>
          )}

          {/* Results */}
          {calc.valid && (
            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{labels.results[lang]}</h2>

              <div className="grid grid-cols-1 gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                  <div className="text-sm text-white/80">{labels.adjustedMonthly[lang]}</div>
                  <div className="text-2xl font-bold">{fmtCurrency(calc.adjustedMonthly)}</div>
                  <div className="text-xs text-white/80 mt-1">
                    {statusLabel(calc.status)} · {fmtPct(calc.percentOfFra)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-xs text-green-600 font-medium">
                      {labels.adjustedAnnual[lang]}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {fmtCurrency(calc.adjustedAnnual)}
                    </div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="text-xs text-purple-600 font-medium">
                      {labels.difference[lang]}
                    </div>
                    <div
                      className={`text-lg font-bold ${calc.difference < 0 ? 'text-red-600' : 'text-gray-900'}`}
                    >
                      {calc.difference > 0 ? '+' : ''}
                      {fmtCurrency(calc.difference)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg px-4 py-2 transition-colors"
                >
                  {copied ? labels.copied[lang] : labels.copy[lang]}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg px-4 py-2 transition-colors"
                >
                  {labels.reset[lang]}
                </button>
              </div>
            </div>
          )}

          {!calc.valid && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg px-4 py-2 transition-colors"
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

        <section className="mt-10 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">FAQ</h2>
          <div className="space-y-2">
            {seo.faq.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-lg">
                <button
                  type="button"
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
