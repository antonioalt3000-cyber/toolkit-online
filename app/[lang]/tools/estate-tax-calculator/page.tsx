'use client';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const DEFAULTS = { grossEstate: '15000000', deductions: '0', exemption: '13990000', topRate: '40' };

export default function EstateTaxCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['estate-tax-calculator'][lang];

  const [grossEstate, setGrossEstate] = useState(DEFAULTS.grossEstate);
  const [deductions, setDeductions] = useState(DEFAULTS.deductions);
  const [exemption, setExemption] = useState(DEFAULTS.exemption);
  const [topRate, setTopRate] = useState(DEFAULTS.topRate);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const labels = {
    grossEstate: {
      en: 'Gross estate value',
      it: 'Valore lordo del patrimonio',
      es: 'Valor bruto del patrimonio',
      fr: 'Valeur brute de la succession',
      de: 'Bruttowert des Nachlasses',
      pt: 'Valor bruto do patrimônio',
    },
    deductions: {
      en: 'Deductions & debts',
      it: 'Deduzioni e debiti',
      es: 'Deducciones y deudas',
      fr: 'Déductions et dettes',
      de: 'Abzüge und Schulden',
      pt: 'Deduções e dívidas',
    },
    exemption: {
      en: 'Exemption amount',
      it: 'Importo di esenzione',
      es: 'Monto de exención',
      fr: "Montant de l'exonération",
      de: 'Freibetrag',
      pt: 'Valor de isenção',
    },
    topRate: {
      en: 'Top estate tax rate (%)',
      it: 'Aliquota massima di successione (%)',
      es: 'Tasa máxima del impuesto (%)',
      fr: "Taux maximal de l'impôt (%)",
      de: 'Höchststeuersatz (%)',
      pt: 'Alíquota máxima do imposto (%)',
    },
    results: {
      en: 'Results',
      it: 'Risultati',
      es: 'Resultados',
      fr: 'Résultats',
      de: 'Ergebnisse',
      pt: 'Resultados',
    },
    netEstate: {
      en: 'Net estate (after deductions)',
      it: 'Patrimonio netto (dopo deduzioni)',
      es: 'Patrimonio neto (tras deducciones)',
      fr: 'Succession nette (après déductions)',
      de: 'Nettonachlass (nach Abzügen)',
      pt: 'Patrimônio líquido (após deduções)',
    },
    taxableEstate: {
      en: 'Taxable estate',
      it: 'Patrimonio imponibile',
      es: 'Patrimonio imponible',
      fr: 'Succession imposable',
      de: 'Steuerpflichtiger Nachlass',
      pt: 'Patrimônio tributável',
    },
    estimatedTax: {
      en: 'Estimated estate tax',
      it: 'Imposta di successione stimata',
      es: 'Impuesto sucesorio estimado',
      fr: 'Droits de succession estimés',
      de: 'Geschätzte Erbschaftssteuer',
      pt: 'Imposto sobre herança estimado',
    },
    effectiveRate: {
      en: 'Effective rate on estate',
      it: 'Aliquota effettiva sul patrimonio',
      es: 'Tasa efectiva sobre el patrimonio',
      fr: 'Taux effectif sur la succession',
      de: 'Effektiver Satz auf den Nachlass',
      pt: 'Alíquota efetiva sobre o patrimônio',
    },
    netToHeirs: {
      en: 'Net amount to heirs',
      it: 'Importo netto agli eredi',
      es: 'Monto neto para herederos',
      fr: 'Montant net aux héritiers',
      de: 'Nettobetrag an Erben',
      pt: 'Valor líquido para herdeiros',
    },
    belowExemption: {
      en: 'The estate is below the exemption — no federal estate tax is due.',
      it: "Il patrimonio è sotto l'esenzione — nessuna imposta federale di successione è dovuta.",
      es: 'El patrimonio está por debajo de la exención — no se debe impuesto sucesorio federal.',
      fr: "La succession est inférieure à l'exonération — aucun droit de succession fédéral n'est dû.",
      de: 'Der Nachlass liegt unter dem Freibetrag — es fällt keine Bundeserbschaftssteuer an.',
      pt: 'O patrimônio está abaixo da isenção — nenhum imposto federal sobre herança é devido.',
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
      en: 'Please enter a value.',
      it: 'Inserisci un valore.',
      es: 'Introduce un valor.',
      fr: 'Veuillez saisir une valeur.',
      de: 'Bitte einen Wert eingeben.',
      pt: 'Insira um valor.',
    },
    errInvalid: {
      en: 'Enter a valid number.',
      it: 'Inserisci un numero valido.',
      es: 'Introduce un número válido.',
      fr: 'Saisissez un nombre valide.',
      de: 'Gültige Zahl eingeben.',
      pt: 'Insira um número válido.',
    },
    errNegative: {
      en: 'Value cannot be negative.',
      it: 'Il valore non può essere negativo.',
      es: 'El valor no puede ser negativo.',
      fr: 'La valeur ne peut pas être négative.',
      de: 'Der Wert darf nicht negativ sein.',
      pt: 'O valor não pode ser negativo.',
    },
    errRate: {
      en: 'Rate must be between 0 and 100.',
      it: "L'aliquota deve essere tra 0 e 100.",
      es: 'La tasa debe estar entre 0 y 100.',
      fr: 'Le taux doit être entre 0 et 100.',
      de: 'Der Satz muss zwischen 0 und 100 liegen.',
      pt: 'A alíquota deve estar entre 0 e 100.',
    },
    note: {
      en: 'Figures shown are US federal defaults and are editable — verify current limits with a professional.',
      it: 'I valori mostrati sono predefiniti federali USA e modificabili — verifica i limiti attuali con un professionista.',
      es: 'Las cifras son valores federales de EE. UU. predeterminados y editables — verifica los límites actuales con un profesional.',
      fr: 'Les chiffres sont des valeurs fédérales américaines par défaut et modifiables — vérifiez les limites actuelles avec un professionnel.',
      de: 'Die Werte sind US-Bundesvorgaben und editierbar — prüfen Sie aktuelle Grenzen mit einem Fachmann.',
      pt: 'Os valores são padrões federais dos EUA e editáveis — verifique os limites atuais com um profissional.',
    },
  } as Record<string, Record<Locale, string>>;

  const validateNonNeg = (raw: string): string | null => {
    if (raw.trim() === '') return labels.errRequired[lang];
    const n = Number(raw);
    if (!Number.isFinite(n)) return labels.errInvalid[lang];
    if (n < 0) return labels.errNegative[lang];
    return null;
  };

  const validateRate = (raw: string): string | null => {
    if (raw.trim() === '') return labels.errRequired[lang];
    const n = Number(raw);
    if (!Number.isFinite(n)) return labels.errInvalid[lang];
    if (n < 0 || n > 100) return labels.errRate[lang];
    return null;
  };

  const errors = {
    grossEstate: validateNonNeg(grossEstate),
    deductions: validateNonNeg(deductions),
    exemption: validateNonNeg(exemption),
    topRate: validateRate(topRate),
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const result = useMemo(() => {
    const gross = Number(grossEstate);
    const ded = Number(deductions);
    const exempt = Number(exemption);
    const rate = Number(topRate);
    const netEstate = Math.max(0, gross - ded);
    const taxable = Math.max(0, netEstate - exempt);
    const tax = taxable * (rate / 100);
    const netToHeirs = Math.max(0, netEstate - tax);
    const effectiveRate = gross > 0 ? (tax / gross) * 100 : 0;
    return { netEstate, taxable, tax, netToHeirs, effectiveRate };
  }, [grossEstate, deductions, exemption, topRate]);

  const fmt = (n: number) => {
    const locale =
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
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n);
  };

  const handleCopy = async () => {
    const summary = [
      `${labels.netEstate[lang]}: ${fmt(result.netEstate)}`,
      `${labels.taxableEstate[lang]}: ${fmt(result.taxable)}`,
      `${labels.estimatedTax[lang]}: ${fmt(result.tax)}`,
      `${labels.effectiveRate[lang]}: ${result.effectiveRate.toFixed(2)}%`,
      `${labels.netToHeirs[lang]}: ${fmt(result.netToHeirs)}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setGrossEstate(DEFAULTS.grossEstate);
    setDeductions(DEFAULTS.deductions);
    setExemption(DEFAULTS.exemption);
    setTopRate(DEFAULTS.topRate);
    setCopied(false);
  };

  const inputClass = (error: string | null) =>
    `w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'}`;

  const seoContent: Record<
    Locale,
    { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }
  > = {
    en: {
      title: 'Estate Tax Calculator: Estimate Federal Estate Tax Liability',
      paragraphs: [
        "The estate tax is a levy on the transfer of a deceased person's assets before they pass to heirs. This estate tax calculator gives you a quick estimate of the potential federal tax on an estate by combining three simple inputs: the gross value of the estate, any deductions and debts, and the exemption amount that shields part of the estate from taxation. The result helps executors, families, and financial planners understand roughly how much of an estate might be owed in tax and how much would pass to beneficiaries.",
        'The math is straightforward. First, deductions and debts (such as funeral costs, outstanding loans, mortgages, and charitable bequests) are subtracted from the gross estate to arrive at the net estate. Then the exemption is subtracted from the net estate to determine the taxable estate. Anything above the exemption is taxed at the top estate tax rate you enter. If the estate is worth less than the exemption, no federal estate tax is due and the full amount passes to heirs.',
        'The exemption amount and the top rate are the two figures that change most often. The exemption defaults to the current US federal level and the top marginal rate defaults to 40%, but both are fully editable so the tool stays accurate as thresholds are adjusted for inflation each year and as tax law evolves. Many US states and several countries also impose their own separate estate or inheritance taxes with different exemptions and rates, so you can overwrite the defaults to model any jurisdiction. The figures shown are US federal defaults and should always be verified with a qualified estate attorney or tax advisor before you act on them.',
        'Estate planning is only one part of a full financial picture. Once you understand the potential tax impact, explore our <a href="/${lang}/tools/retirement-calculator">retirement calculator</a> to project long-term savings, use the <a href="/${lang}/tools/compound-interest-calculator">compound interest calculator</a> to see how assets grow over time, and try the <a href="/${lang}/tools/mortgage-calculator">mortgage calculator</a> to weigh property held within the estate.',
      ],
      faq: [
        {
          q: 'What is the estate tax exemption?',
          a: 'The exemption is the value of an estate that is not subject to federal estate tax. Only the portion of the taxable estate above the exemption is taxed. The default in this tool reflects the current US federal level, but it changes yearly and is fully editable.',
        },
        {
          q: 'How is the taxable estate calculated?',
          a: 'Deductions and debts are subtracted from the gross estate to get the net estate, then the exemption is subtracted from that. The remainder is the taxable estate, which is multiplied by the top estate tax rate to estimate the tax owed.',
        },
        {
          q: 'Is the estate tax the same as inheritance tax?',
          a: 'No. Estate tax is paid by the estate itself before assets are distributed, while inheritance tax is paid by the individual heirs who receive the assets. Some US states levy an inheritance tax; the federal government levies an estate tax.',
        },
        {
          q: 'Are my figures stored or sent anywhere?',
          a: 'No. Every calculation runs entirely in your browser. None of the values you enter are transmitted to a server, saved in a database, or shared with third parties.',
        },
        {
          q: 'Can I use this for state or non-US estates?',
          a: 'Yes. Because the exemption and rate are editable inputs, you can enter the figures for any US state or country. This is an estimate only — consult a qualified estate professional for binding advice.',
        },
      ],
    },
    it: {
      title: "Calcolatore Tassa di Successione: Stima l'Imposta Federale",
      paragraphs: [
        "L'imposta di successione è un prelievo sul trasferimento dei beni di una persona deceduta prima che passino agli eredi. Questo calcolatore fornisce una stima rapida della potenziale imposta federale combinando tre semplici valori: il valore lordo del patrimonio, eventuali deduzioni e debiti, e l'importo di esenzione che protegge parte del patrimonio dalla tassazione. Il risultato aiuta esecutori testamentari, famiglie e pianificatori finanziari a capire quanto di un patrimonio potrebbe essere dovuto come imposta e quanto passerebbe ai beneficiari.",
        "Il calcolo è semplice. Prima, deduzioni e debiti (come spese funebri, prestiti in essere, mutui e lasciti benefici) vengono sottratti dal patrimonio lordo per ottenere il patrimonio netto. Poi l'esenzione viene sottratta dal patrimonio netto per determinare il patrimonio imponibile. Tutto ciò che supera l'esenzione è tassato all'aliquota massima che inserisci. Se il patrimonio vale meno dell'esenzione, non è dovuta alcuna imposta federale e l'intero importo passa agli eredi.",
        "L'importo di esenzione e l'aliquota massima sono i due valori che cambiano più spesso. L'esenzione è impostata sul livello federale USA attuale e l'aliquota marginale massima è predefinita al 40%, ma entrambe sono completamente modificabili così lo strumento resta accurato mentre le soglie vengono adeguate all'inflazione ogni anno e la normativa evolve. Molti stati USA e diversi paesi applicano anche proprie imposte di successione separate con esenzioni e aliquote diverse, quindi puoi sovrascrivere i valori predefiniti per modellare qualsiasi giurisdizione. I valori mostrati sono predefiniti federali USA e vanno sempre verificati con un legale o consulente fiscale qualificato prima di agire.",
        'La pianificazione successoria è solo una parte del quadro finanziario completo. Una volta compreso l\'impatto fiscale potenziale, esplora il nostro <a href="/${lang}/tools/retirement-calculator">calcolatore pensione</a> per proiettare i risparmi a lungo termine, usa il <a href="/${lang}/tools/compound-interest-calculator">calcolatore interesse composto</a> per vedere come crescono i beni nel tempo, e prova il <a href="/${lang}/tools/mortgage-calculator">calcolatore mutuo</a> per valutare gli immobili inclusi nel patrimonio.',
      ],
      faq: [
        {
          q: "Cos'è l'esenzione dall'imposta di successione?",
          a: "L'esenzione è il valore del patrimonio non soggetto all'imposta federale di successione. Solo la parte del patrimonio imponibile sopra l'esenzione è tassata. Il valore predefinito riflette il livello federale USA attuale, ma cambia annualmente ed è modificabile.",
        },
        {
          q: 'Come si calcola il patrimonio imponibile?',
          a: "Deduzioni e debiti vengono sottratti dal patrimonio lordo per ottenere il patrimonio netto, poi da questo si sottrae l'esenzione. Il resto è il patrimonio imponibile, moltiplicato per l'aliquota massima per stimare l'imposta dovuta.",
        },
        {
          q: "L'imposta di successione è uguale all'imposta sull'eredità?",
          a: "No. L'imposta di successione è pagata dal patrimonio prima della distribuzione, mentre l'imposta sull'eredità è pagata dai singoli eredi che ricevono i beni. Alcuni stati USA applicano un'imposta sull'eredità; il governo federale applica l'imposta di successione.",
        },
        {
          q: 'I miei valori vengono salvati o inviati?',
          a: 'No. Ogni calcolo avviene interamente nel browser. Nessuno dei valori inseriti viene trasmesso a un server, salvato in un database o condiviso con terze parti.',
        },
        {
          q: 'Posso usarlo per patrimoni statali o non USA?',
          a: 'Sì. Poiché esenzione e aliquota sono modificabili, puoi inserire i valori di qualsiasi stato USA o paese. È solo una stima — consulta un professionista qualificato per una consulenza vincolante.',
        },
      ],
    },
    es: {
      title: 'Calculadora de Impuesto Sucesorio: Estima el Impuesto Federal',
      paragraphs: [
        'El impuesto sucesorio grava la transferencia de los bienes de una persona fallecida antes de que pasen a los herederos. Esta calculadora ofrece una estimación rápida del posible impuesto federal combinando tres valores sencillos: el valor bruto del patrimonio, las deducciones y deudas, y el monto de exención que protege parte del patrimonio de la tributación. El resultado ayuda a albaceas, familias y planificadores financieros a entender cuánto de un patrimonio podría deberse en impuestos y cuánto pasaría a los beneficiarios.',
        'El cálculo es directo. Primero, las deducciones y deudas (como gastos funerarios, préstamos pendientes, hipotecas y legados benéficos) se restan del patrimonio bruto para obtener el patrimonio neto. Luego se resta la exención del patrimonio neto para determinar el patrimonio imponible. Todo lo que supere la exención se grava a la tasa máxima que introduzcas. Si el patrimonio vale menos que la exención, no se debe ningún impuesto federal y el monto completo pasa a los herederos.',
        'El monto de exención y la tasa máxima son los dos valores que cambian con más frecuencia. La exención toma por defecto el nivel federal actual de EE. UU. y la tasa marginal máxima es del 40%, pero ambas son totalmente editables para que la herramienta se mantenga precisa a medida que los umbrales se ajustan por inflación cada año y la ley evoluciona. Muchos estados de EE. UU. y varios países también aplican sus propios impuestos separados con exenciones y tasas distintas, así que puedes sobrescribir los valores predeterminados para modelar cualquier jurisdicción. Las cifras mostradas son valores federales de EE. UU. y siempre deben verificarse con un abogado o asesor fiscal cualificado antes de actuar.',
        'La planificación patrimonial es solo una parte del panorama financiero completo. Una vez que entiendas el impacto fiscal potencial, explora nuestra <a href="/${lang}/tools/retirement-calculator">calculadora de jubilación</a> para proyectar ahorros a largo plazo, usa la <a href="/${lang}/tools/compound-interest-calculator">calculadora de interés compuesto</a> para ver cómo crecen los bienes, y prueba la <a href="/${lang}/tools/mortgage-calculator">calculadora de hipoteca</a> para evaluar los inmuebles del patrimonio.',
      ],
      faq: [
        {
          q: '¿Qué es la exención del impuesto sucesorio?',
          a: 'La exención es el valor del patrimonio no sujeto al impuesto sucesorio federal. Solo se grava la parte del patrimonio imponible por encima de la exención. El valor predeterminado refleja el nivel federal actual de EE. UU., pero cambia cada año y es editable.',
        },
        {
          q: '¿Cómo se calcula el patrimonio imponible?',
          a: 'Las deducciones y deudas se restan del patrimonio bruto para obtener el patrimonio neto, y luego se resta la exención. El resto es el patrimonio imponible, que se multiplica por la tasa máxima para estimar el impuesto adeudado.',
        },
        {
          q: '¿El impuesto sucesorio es igual al impuesto de herencia?',
          a: 'No. El impuesto sucesorio lo paga el patrimonio antes de distribuir los bienes, mientras que el impuesto de herencia lo pagan los herederos que reciben los bienes. Algunos estados de EE. UU. aplican impuesto de herencia; el gobierno federal aplica impuesto sucesorio.',
        },
        {
          q: '¿Se guardan o envían mis cifras?',
          a: 'No. Cada cálculo se realiza completamente en tu navegador. Ninguno de los valores que introduces se transmite a un servidor, se guarda en una base de datos ni se comparte con terceros.',
        },
        {
          q: '¿Puedo usarla para patrimonios estatales o fuera de EE. UU.?',
          a: 'Sí. Como la exención y la tasa son editables, puedes introducir las cifras de cualquier estado o país. Es solo una estimación — consulta a un profesional cualificado para asesoría vinculante.',
        },
      ],
    },
    fr: {
      title: "Calculateur de Droits de Succession : Estimez l'Impôt Fédéral",
      paragraphs: [
        "Les droits de succession sont un prélèvement sur le transfert des biens d'une personne décédée avant qu'ils ne passent aux héritiers. Ce calculateur fournit une estimation rapide de l'impôt fédéral potentiel en combinant trois valeurs simples : la valeur brute de la succession, les déductions et dettes, et le montant de l'exonération qui protège une partie de la succession de l'imposition. Le résultat aide les exécuteurs testamentaires, les familles et les planificateurs financiers à comprendre quelle part d'une succession pourrait être due en impôt et quelle part reviendrait aux bénéficiaires.",
        "Le calcul est simple. D'abord, les déductions et dettes (frais funéraires, prêts en cours, hypothèques et legs caritatifs) sont soustraites de la succession brute pour obtenir la succession nette. Puis l'exonération est soustraite de la succession nette pour déterminer la succession imposable. Tout ce qui dépasse l'exonération est imposé au taux maximal que vous saisissez. Si la succession vaut moins que l'exonération, aucun impôt fédéral n'est dû et le montant total revient aux héritiers.",
        "Le montant de l'exonération et le taux maximal sont les deux valeurs qui changent le plus souvent. L'exonération est fixée par défaut au niveau fédéral américain actuel et le taux marginal maximal est de 40 %, mais les deux sont entièrement modifiables afin que l'outil reste précis à mesure que les seuils sont ajustés à l'inflation chaque année et que la loi évolue. De nombreux États américains et plusieurs pays appliquent aussi leurs propres impôts distincts avec des exonérations et taux différents, vous pouvez donc écraser les valeurs par défaut pour modéliser n'importe quelle juridiction. Les chiffres affichés sont des valeurs fédérales américaines par défaut et doivent toujours être vérifiés auprès d'un avocat ou conseiller fiscal qualifié avant d'agir.",
        'La planification successorale n\'est qu\'une partie du tableau financier complet. Une fois l\'impact fiscal potentiel compris, explorez notre <a href="/${lang}/tools/retirement-calculator">calculateur de retraite</a> pour projeter l\'épargne à long terme, utilisez le <a href="/${lang}/tools/compound-interest-calculator">calculateur d\'intérêts composés</a> pour voir comment les biens croissent, et essayez le <a href="/${lang}/tools/mortgage-calculator">calculateur hypothécaire</a> pour évaluer les biens immobiliers de la succession.',
      ],
      faq: [
        {
          q: "Qu'est-ce que l'exonération des droits de succession ?",
          a: "L'exonération est la valeur de la succession non soumise aux droits de succession fédéraux. Seule la partie de la succession imposable au-dessus de l'exonération est taxée. La valeur par défaut reflète le niveau fédéral américain actuel, mais elle change chaque année et est modifiable.",
        },
        {
          q: 'Comment la succession imposable est-elle calculée ?',
          a: "Les déductions et dettes sont soustraites de la succession brute pour obtenir la succession nette, puis l'exonération en est soustraite. Le reste est la succession imposable, multipliée par le taux maximal pour estimer l'impôt dû.",
        },
        {
          q: "Les droits de succession sont-ils identiques à l'impôt sur l'héritage ?",
          a: "Non. Les droits de succession sont payés par la succession avant distribution, tandis que l'impôt sur l'héritage est payé par les héritiers qui reçoivent les biens. Certains États américains lèvent un impôt sur l'héritage ; le gouvernement fédéral lève des droits de succession.",
        },
        {
          q: 'Mes chiffres sont-ils stockés ou envoyés ?',
          a: "Non. Chaque calcul s'exécute entièrement dans votre navigateur. Aucune des valeurs saisies n'est transmise à un serveur, enregistrée dans une base de données ni partagée avec des tiers.",
        },
        {
          q: "Puis-je l'utiliser pour des successions étatiques ou hors des États-Unis ?",
          a: "Oui. Comme l'exonération et le taux sont modifiables, vous pouvez saisir les chiffres de n'importe quel État ou pays. Ce n'est qu'une estimation — consultez un professionnel qualifié pour un conseil contraignant.",
        },
      ],
    },
    de: {
      title: 'Erbschaftssteuerrechner: Schätzen Sie die Bundeserbschaftssteuer',
      paragraphs: [
        'Die Erbschaftssteuer ist eine Abgabe auf die Übertragung des Vermögens einer verstorbenen Person, bevor es an die Erben übergeht. Dieser Rechner liefert eine schnelle Schätzung der potenziellen Bundessteuer, indem er drei einfache Werte kombiniert: den Bruttowert des Nachlasses, etwaige Abzüge und Schulden sowie den Freibetrag, der einen Teil des Nachlasses von der Besteuerung ausnimmt. Das Ergebnis hilft Nachlassverwaltern, Familien und Finanzplanern zu verstehen, wie viel eines Nachlasses als Steuer anfallen könnte und wie viel an die Begünstigten übergeht.',
        'Die Berechnung ist unkompliziert. Zuerst werden Abzüge und Schulden (wie Bestattungskosten, offene Darlehen, Hypotheken und gemeinnützige Vermächtnisse) vom Bruttonachlass abgezogen, um den Nettonachlass zu erhalten. Dann wird der Freibetrag vom Nettonachlass abgezogen, um den steuerpflichtigen Nachlass zu bestimmen. Alles über dem Freibetrag wird zum von Ihnen eingegebenen Höchstsatz besteuert. Liegt der Nachlass unter dem Freibetrag, fällt keine Bundessteuer an und der gesamte Betrag geht an die Erben.',
        'Der Freibetrag und der Höchstsatz sind die beiden Werte, die sich am häufigsten ändern. Der Freibetrag ist standardmäßig auf das aktuelle US-Bundesniveau gesetzt und der marginale Höchstsatz beträgt 40 %, aber beide sind vollständig editierbar, damit das Werkzeug genau bleibt, während die Schwellen jährlich an die Inflation angepasst werden und sich das Steuerrecht ändert. Viele US-Bundesstaaten und mehrere Länder erheben zudem eigene separate Steuern mit anderen Freibeträgen und Sätzen, sodass Sie die Vorgaben überschreiben können, um jede Jurisdiktion abzubilden. Die angezeigten Zahlen sind US-Bundesvorgaben und sollten stets mit einem qualifizierten Nachlassanwalt oder Steuerberater überprüft werden, bevor Sie handeln.',
        'Die Nachlassplanung ist nur ein Teil des vollständigen Finanzbildes. Sobald Sie die potenzielle steuerliche Auswirkung verstehen, nutzen Sie unseren <a href="/${lang}/tools/retirement-calculator">Rentenrechner</a>, um langfristige Ersparnisse zu prognostizieren, den <a href="/${lang}/tools/compound-interest-calculator">Zinseszinsrechner</a>, um zu sehen, wie Vermögen wächst, und den <a href="/${lang}/tools/mortgage-calculator">Hypothekenrechner</a>, um Immobilien im Nachlass zu bewerten.',
      ],
      faq: [
        {
          q: 'Was ist der Erbschaftssteuer-Freibetrag?',
          a: 'Der Freibetrag ist der Wert eines Nachlasses, der nicht der Bundeserbschaftssteuer unterliegt. Nur der Teil des steuerpflichtigen Nachlasses über dem Freibetrag wird besteuert. Der Standardwert spiegelt das aktuelle US-Bundesniveau wider, ändert sich jedoch jährlich und ist editierbar.',
        },
        {
          q: 'Wie wird der steuerpflichtige Nachlass berechnet?',
          a: 'Abzüge und Schulden werden vom Bruttonachlass abgezogen, um den Nettonachlass zu erhalten, dann wird der Freibetrag davon abgezogen. Der Rest ist der steuerpflichtige Nachlass, der mit dem Höchstsatz multipliziert wird, um die geschuldete Steuer zu schätzen.',
        },
        {
          q: 'Ist die Erbschaftssteuer dasselbe wie die Nachlasssteuer?',
          a: 'In den USA zahlt der Nachlass selbst die Estate Tax vor der Verteilung, während die Inheritance Tax von den einzelnen Erben gezahlt wird, die die Vermögenswerte erhalten. Einige US-Bundesstaaten erheben eine Inheritance Tax; die Bundesregierung erhebt die Estate Tax.',
        },
        {
          q: 'Werden meine Zahlen gespeichert oder gesendet?',
          a: 'Nein. Jede Berechnung läuft vollständig in Ihrem Browser. Keiner der eingegebenen Werte wird an einen Server übertragen, in einer Datenbank gespeichert oder mit Dritten geteilt.',
        },
        {
          q: 'Kann ich es für Bundesstaats- oder Nicht-US-Nachlässe verwenden?',
          a: 'Ja. Da Freibetrag und Satz editierbar sind, können Sie die Werte für jeden Bundesstaat oder jedes Land eingeben. Dies ist nur eine Schätzung — konsultieren Sie einen qualifizierten Fachmann für verbindliche Beratung.',
        },
      ],
    },
    pt: {
      title: 'Calculadora de Imposto sobre Herança: Estime o Imposto Federal',
      paragraphs: [
        'O imposto sobre herança incide sobre a transferência dos bens de uma pessoa falecida antes de passarem aos herdeiros. Esta calculadora fornece uma estimativa rápida do possível imposto federal combinando três valores simples: o valor bruto do patrimônio, as deduções e dívidas, e o valor de isenção que protege parte do patrimônio da tributação. O resultado ajuda inventariantes, famílias e planejadores financeiros a entender quanto de um patrimônio poderia ser devido em imposto e quanto passaria aos beneficiários.',
        'O cálculo é direto. Primeiro, deduções e dívidas (como despesas de funeral, empréstimos pendentes, hipotecas e legados beneficentes) são subtraídas do patrimônio bruto para obter o patrimônio líquido. Depois, a isenção é subtraída do patrimônio líquido para determinar o patrimônio tributável. Tudo o que exceder a isenção é tributado à alíquota máxima que você inserir. Se o patrimônio valer menos que a isenção, nenhum imposto federal é devido e o valor total passa aos herdeiros.',
        'O valor de isenção e a alíquota máxima são os dois valores que mudam com mais frequência. A isenção assume por padrão o nível federal atual dos EUA e a alíquota marginal máxima é de 40%, mas ambas são totalmente editáveis para que a ferramenta permaneça precisa à medida que os limites são ajustados pela inflação a cada ano e a legislação evolui. Muitos estados dos EUA e vários países também aplicam seus próprios impostos separados com isenções e alíquotas diferentes, então você pode sobrescrever os padrões para modelar qualquer jurisdição. Os valores mostrados são padrões federais dos EUA e devem sempre ser verificados com um advogado ou consultor fiscal qualificado antes de agir.',
        'O planejamento sucessório é apenas uma parte do quadro financeiro completo. Depois de entender o impacto fiscal potencial, explore a nossa <a href="/${lang}/tools/retirement-calculator">calculadora de aposentadoria</a> para projetar poupança de longo prazo, use a <a href="/${lang}/tools/compound-interest-calculator">calculadora de juros compostos</a> para ver como os bens crescem, e experimente a <a href="/${lang}/tools/mortgage-calculator">calculadora de hipoteca</a> para avaliar imóveis do patrimônio.',
      ],
      faq: [
        {
          q: 'O que é a isenção do imposto sobre herança?',
          a: 'A isenção é o valor do patrimônio não sujeito ao imposto federal sobre herança. Apenas a parte do patrimônio tributável acima da isenção é tributada. O valor padrão reflete o nível federal atual dos EUA, mas muda anualmente e é editável.',
        },
        {
          q: 'Como o patrimônio tributável é calculado?',
          a: 'Deduções e dívidas são subtraídas do patrimônio bruto para obter o patrimônio líquido, e então a isenção é subtraída disso. O restante é o patrimônio tributável, multiplicado pela alíquota máxima para estimar o imposto devido.',
        },
        {
          q: 'O imposto sobre herança é o mesmo que imposto de transmissão?',
          a: 'Nos EUA, o estate tax é pago pelo próprio patrimônio antes da distribuição, enquanto o inheritance tax é pago pelos herdeiros que recebem os bens. Alguns estados dos EUA cobram inheritance tax; o governo federal cobra estate tax.',
        },
        {
          q: 'Meus valores são armazenados ou enviados?',
          a: 'Não. Cada cálculo é executado inteiramente no seu navegador. Nenhum dos valores inseridos é transmitido a um servidor, salvo em um banco de dados ou compartilhado com terceiros.',
        },
        {
          q: 'Posso usá-la para patrimônios estaduais ou fora dos EUA?',
          a: 'Sim. Como a isenção e a alíquota são editáveis, você pode inserir os valores de qualquer estado ou país. Isto é apenas uma estimativa — consulte um profissional qualificado para orientação vinculante.',
        },
      ],
    },
  };

  const seo = seoContent[lang] || seoContent.en;

  return (
    <ToolPageWrapper toolSlug="estate-tax-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.grossEstate[lang]} ($)
            </label>
            <input
              type="number"
              min={0}
              step={10000}
              value={grossEstate}
              onChange={(e) => setGrossEstate(e.target.value)}
              className={inputClass(errors.grossEstate)}
            />
            {errors.grossEstate && (
              <p className="mt-1 text-sm text-red-600">{errors.grossEstate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.deductions[lang]} ($)
            </label>
            <input
              type="number"
              min={0}
              step={1000}
              value={deductions}
              onChange={(e) => setDeductions(e.target.value)}
              className={inputClass(errors.deductions)}
            />
            {errors.deductions && <p className="mt-1 text-sm text-red-600">{errors.deductions}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.exemption[lang]} ($)
              </label>
              <input
                type="number"
                min={0}
                step={10000}
                value={exemption}
                onChange={(e) => setExemption(e.target.value)}
                className={inputClass(errors.exemption)}
              />
              {errors.exemption && <p className="mt-1 text-sm text-red-600">{errors.exemption}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.topRate[lang]}
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={topRate}
                onChange={(e) => setTopRate(e.target.value)}
                className={inputClass(errors.topRate)}
              />
              {errors.topRate && <p className="mt-1 text-sm text-red-600">{errors.topRate}</p>}
            </div>
          </div>

          <p className="text-xs text-gray-500">{labels.note[lang]}</p>

          {!hasErrors && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{labels.results[lang]}</h3>

              <div className="grid grid-cols-1 gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                  <div className="text-sm text-white/80">{labels.estimatedTax[lang]}</div>
                  <div className="text-2xl font-bold">{fmt(result.tax)}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="text-xs text-gray-500 font-medium">
                      {labels.netEstate[lang]}
                    </div>
                    <div className="text-lg font-bold text-gray-900">{fmt(result.netEstate)}</div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="text-xs text-gray-500 font-medium">
                      {labels.taxableEstate[lang]}
                    </div>
                    <div className="text-lg font-bold text-gray-900">{fmt(result.taxable)}</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="text-xs text-purple-600 font-medium">
                      {labels.effectiveRate[lang]}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {result.effectiveRate.toFixed(2)}%
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-xs text-green-600 font-medium">
                      {labels.netToHeirs[lang]}
                    </div>
                    <div className="text-lg font-bold text-gray-900">{fmt(result.netToHeirs)}</div>
                  </div>
                </div>

                {result.taxable === 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                    {labels.belowExemption[lang]}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleCopy}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg px-4 py-2 transition-colors"
                >
                  {copied ? labels.copied[lang] : labels.copy[lang]}
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg px-4 py-2 transition-colors"
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
