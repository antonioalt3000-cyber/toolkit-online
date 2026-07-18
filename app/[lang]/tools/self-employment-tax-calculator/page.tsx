'use client';
import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const NET_EARNINGS_FACTOR = 0.9235;
const SS_RATE = 0.124;
const MEDICARE_RATE = 0.029;
const DEFAULT_INCOME = '60000';
const DEFAULT_WAGE_BASE = '176100';

type FieldError = 'required' | 'invalid' | 'negative' | null;

export default function SelfEmploymentTaxCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['self-employment-tax-calculator'][lang];

  const [income, setIncome] = useState<string>(DEFAULT_INCOME);
  const [wageBase, setWageBase] = useState<string>(DEFAULT_WAGE_BASE);
  const [copied, setCopied] = useState<boolean>(false);

  const labels = {
    netIncome: {
      en: 'Net self-employment income ($)',
      it: 'Reddito netto da lavoro autonomo ($)',
      es: 'Ingreso neto de trabajo autónomo ($)',
      fr: 'Revenu net de travail indépendant ($)',
      de: 'Netto-Einkommen aus Selbständigkeit ($)',
      pt: 'Renda líquida de trabalho autônomo ($)',
    },
    wageBase: {
      en: 'Social Security wage base ($)',
      it: 'Base contributiva Social Security ($)',
      es: 'Base salarial del Seguro Social ($)',
      fr: 'Plafond de la Sécurité sociale ($)',
      de: 'Beitragsbemessungsgrenze Social Security ($)',
      pt: 'Teto salarial da Previdência (Social Security) ($)',
    },
    ssRate: {
      en: 'Social Security rate',
      it: 'Aliquota Social Security',
      es: 'Tasa del Seguro Social',
      fr: 'Taux Sécurité sociale',
      de: 'Social-Security-Satz',
      pt: 'Alíquota da Previdência',
    },
    medicareRate: {
      en: 'Medicare rate',
      it: 'Aliquota Medicare',
      es: 'Tasa de Medicare',
      fr: 'Taux Medicare',
      de: 'Medicare-Satz',
      pt: 'Alíquota do Medicare',
    },
    fixed: { en: 'fixed', it: 'fissa', es: 'fija', fr: 'fixe', de: 'fest', pt: 'fixa' },
    results: {
      en: 'Results',
      it: 'Risultati',
      es: 'Resultados',
      fr: 'Résultats',
      de: 'Ergebnisse',
      pt: 'Resultados',
    },
    totalSeTax: {
      en: 'Total self-employment tax',
      it: 'Tassa totale lavoro autonomo',
      es: 'Impuesto total de trabajo autónomo',
      fr: 'Impôt total travailleur indépendant',
      de: 'Gesamte Selbständigensteuer',
      pt: 'Imposto total de trabalho autônomo',
    },
    netEarnings: {
      en: 'Net earnings subject to SE tax (92.35%)',
      it: 'Redditi netti soggetti a imposta (92,35%)',
      es: 'Ganancias netas sujetas al impuesto (92,35%)',
      fr: "Revenus nets soumis à l'impôt (92,35 %)",
      de: 'Steuerpflichtiges Netto-Einkommen (92,35 %)',
      pt: 'Ganhos líquidos sujeitos ao imposto (92,35%)',
    },
    ssPortion: {
      en: 'Social Security portion',
      it: 'Quota Social Security',
      es: 'Parte del Seguro Social',
      fr: 'Part Sécurité sociale',
      de: 'Anteil Social Security',
      pt: 'Parte da Previdência',
    },
    medicarePortion: {
      en: 'Medicare portion',
      it: 'Quota Medicare',
      es: 'Parte de Medicare',
      fr: 'Part Medicare',
      de: 'Anteil Medicare',
      pt: 'Parte do Medicare',
    },
    deductibleHalf: {
      en: 'Deductible half (income adjustment)',
      it: 'Metà deducibile (deduzione dal reddito)',
      es: 'Mitad deducible (ajuste al ingreso)',
      fr: 'Moitié déductible (ajustement du revenu)',
      de: 'Abziehbare Hälfte (Einkommensanpassung)',
      pt: 'Metade dedutível (ajuste na renda)',
    },
    effectiveRate: {
      en: 'Effective SE tax rate',
      it: 'Aliquota effettiva',
      es: 'Tasa efectiva',
      fr: 'Taux effectif',
      de: 'Effektiver Steuersatz',
      pt: 'Alíquota efetiva',
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
      es: 'Reiniciar',
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
    errInvalid: {
      en: 'Please enter a valid number',
      it: 'Inserisci un numero valido',
      es: 'Introduce un número válido',
      fr: 'Veuillez saisir un nombre valide',
      de: 'Bitte eine gültige Zahl eingeben',
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
    disclaimer: {
      en: 'US federal rates. The Social Security wage base is updated every year, so edit it to match the current tax year.',
      it: "Aliquote federali USA. La base contributiva Social Security viene aggiornata ogni anno: modificala in base all'anno fiscale corrente.",
      es: 'Tasas federales de EE. UU. La base salarial del Seguro Social se actualiza cada año: edítala según el año fiscal actual.',
      fr: "Taux fédéraux américains. Le plafond de la Sécurité sociale est révisé chaque année : modifiez-le selon l'année fiscale en cours.",
      de: 'US-Bundessätze. Die Beitragsbemessungsgrenze wird jährlich angepasst – passen Sie sie an das aktuelle Steuerjahr an.',
      pt: 'Alíquotas federais dos EUA. O teto salarial da Previdência é atualizado todo ano: edite-o conforme o ano fiscal atual.',
    },
  } as Record<string, Record<Locale, string>>;

  const validate = (raw: string): FieldError => {
    if (raw.trim() === '') return 'required';
    const n = Number(raw);
    if (!Number.isFinite(n)) return 'invalid';
    if (n < 0) return 'negative';
    return null;
  };

  const incomeError = validate(income);
  const wageBaseError = validate(wageBase);
  const isValid = incomeError === null && wageBaseError === null;

  const calculation = useMemo(() => {
    if (!isValid) return null;
    const incomeNum = Number(income);
    const wageBaseNum = Number(wageBase);
    const netEarnings = incomeNum * NET_EARNINGS_FACTOR;
    const ssPortion = Math.min(netEarnings, wageBaseNum) * SS_RATE;
    const medicarePortion = netEarnings * MEDICARE_RATE;
    const totalSeTax = ssPortion + medicarePortion;
    const deductibleHalf = totalSeTax / 2;
    const effectiveRate = incomeNum > 0 ? (totalSeTax / incomeNum) * 100 : 0;
    return { netEarnings, ssPortion, medicarePortion, totalSeTax, deductibleHalf, effectiveRate };
  }, [income, wageBase, isValid]);

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
      maximumFractionDigits: 2,
    }).format(n);

  const pct = (n: number): string =>
    new Intl.NumberFormat(localeTag, { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(
      n
    );

  const handleCopy = (): void => {
    if (!calculation) return;
    const lines = [
      `${labels.totalSeTax[lang]}: ${fmt(calculation.totalSeTax)}`,
      `${labels.ssPortion[lang]}: ${fmt(calculation.ssPortion)}`,
      `${labels.medicarePortion[lang]}: ${fmt(calculation.medicarePortion)}`,
      `${labels.deductibleHalf[lang]}: ${fmt(calculation.deductibleHalf)}`,
      `${labels.effectiveRate[lang]}: ${pct(calculation.effectiveRate)}%`,
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = (): void => {
    setIncome(DEFAULT_INCOME);
    setWageBase(DEFAULT_WAGE_BASE);
    setCopied(false);
  };

  const errorText = (err: FieldError): string | null => {
    if (err === 'required') return labels.errRequired[lang];
    if (err === 'invalid') return labels.errInvalid[lang];
    if (err === 'negative') return labels.errNegative[lang];
    return null;
  };

  const seoContent: Record<
    Locale,
    { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }
  > = {
    en: {
      title: 'Self-Employment Tax Calculator: Estimate Your SE Tax in Seconds',
      paragraphs: [
        'If you earn income as a freelancer, independent contractor, or sole proprietor, you are responsible for paying self-employment (SE) tax on top of ordinary income tax. This self-employment tax calculator estimates how much you owe based on your net self-employment income, using the current US federal rates. Unlike traditional employees whose employers cover half of Social Security and Medicare, self-employed workers pay both the employer and employee shares themselves.',
        'The calculation follows the IRS method. First, your net earnings are multiplied by 92.35%, because only that portion of your income is subject to SE tax. The result is then taxed at 12.4% for Social Security, up to the annual Social Security wage base, and 2.9% for Medicare with no upper limit. Because the wage base changes every year, this field is editable so you can match the exact figure for your tax year. Adding the two components together gives your total self-employment tax.',
        'One of the most valuable outputs is the deductible half. You can deduct one-half of your SE tax when calculating your adjusted gross income, which lowers your income tax bill. Our calculator shows this figure clearly so you can plan your quarterly estimated payments and avoid surprises at filing time. Knowing your effective SE tax rate also helps you set aside the right percentage of every invoice.',
        'These rates are US federal figures and do not include state taxes, the additional 0.9% Medicare surtax on high earners, or ordinary federal income tax. Use this tool for planning, then confirm the final numbers with a tax professional. To round out your financial planning, try our <a href="/${lang}/tools/salary-calculator">salary calculator</a>, estimate take-home pay with the <a href="/${lang}/tools/paycheck-calculator">paycheck calculator</a>, or bill clients cleanly with the <a href="/${lang}/tools/invoice-generator">invoice generator</a>.',
      ],
      faq: [
        {
          q: 'What is self-employment tax?',
          a: 'Self-employment tax is the Social Security and Medicare tax paid by people who work for themselves. It covers both the employer and employee halves, totaling 15.3% (12.4% Social Security plus 2.9% Medicare) on your net earnings subject to SE tax.',
        },
        {
          q: 'Why is only 92.35% of my income taxed?',
          a: 'The IRS lets you reduce your net earnings by 7.65% before applying SE tax, which mirrors the employer-side deduction that regular employees benefit from. That is why the taxable base is 92.35% of your net self-employment income.',
        },
        {
          q: 'What is the Social Security wage base?',
          a: 'It is the maximum amount of earnings subject to the 12.4% Social Security portion each year. Income above this cap is not taxed for Social Security, though the 2.9% Medicare portion still applies to all earnings. The wage base is updated annually, so keep the field current.',
        },
        {
          q: 'Can I deduct part of my self-employment tax?',
          a: 'Yes. You can deduct one-half of your self-employment tax as an adjustment to income, which reduces your taxable income for federal income tax. The calculator shows this deductible half separately.',
        },
        {
          q: 'Does this include income tax and state tax?',
          a: 'No. This tool estimates only federal self-employment tax. Ordinary federal income tax, state income tax, and the additional 0.9% Medicare surtax on high incomes are not included.',
        },
      ],
    },
    it: {
      title: 'Calcolatore Tasse Lavoro Autonomo: Stima la SE Tax in Pochi Secondi',
      paragraphs: [
        "Se guadagni come freelancer, collaboratore indipendente o ditta individuale negli Stati Uniti, sei tenuto a pagare la self-employment tax (SE tax) oltre all'imposta sul reddito ordinaria. Questo calcolatore stima quanto devi in base al tuo reddito netto da lavoro autonomo, usando le aliquote federali statunitensi vigenti. A differenza dei dipendenti, il cui datore di lavoro copre metà di Social Security e Medicare, i lavoratori autonomi pagano da soli sia la quota del datore sia quella del lavoratore.",
        "Il calcolo segue il metodo dell'IRS. Prima i redditi netti vengono moltiplicati per il 92,35%, perché solo quella parte del reddito è soggetta alla SE tax. Il risultato viene poi tassato al 12,4% per la Social Security, fino alla base contributiva annuale, e al 2,9% per Medicare senza limite massimo. Poiché la base cambia ogni anno, questo campo è modificabile per adattarlo all'anno fiscale. Sommando le due componenti si ottiene la tassa totale sul lavoro autonomo.",
        "Uno dei risultati più utili è la metà deducibile. Puoi dedurre la metà della SE tax nel calcolo del reddito lordo rettificato, riducendo l'imposta sul reddito. Il calcolatore mostra questo valore in modo chiaro per pianificare i pagamenti trimestrali stimati ed evitare sorprese. Conoscere l'aliquota effettiva aiuta anche ad accantonare la giusta percentuale di ogni fattura.",
        'Queste aliquote sono federali statunitensi e non includono le tasse statali, la sovrattassa Medicare aggiuntiva dello 0,9% per i redditi alti, né l\'imposta federale ordinaria sul reddito. Usa lo strumento per la pianificazione e conferma i numeri finali con un professionista. Per completare la pianificazione, prova il nostro <a href="/${lang}/tools/salary-calculator">calcolatore stipendio</a>, stima il netto con il <a href="/${lang}/tools/paycheck-calculator">calcolatore busta paga</a> o fattura i clienti con il <a href="/${lang}/tools/invoice-generator">generatore di fatture</a>.',
      ],
      faq: [
        {
          q: "Cos'è la self-employment tax?",
          a: "È l'imposta Social Security e Medicare pagata da chi lavora in proprio negli Stati Uniti. Copre sia la quota del datore sia quella del lavoratore, per un totale del 15,3% (12,4% Social Security più 2,9% Medicare) sui redditi netti soggetti a SE tax.",
        },
        {
          q: 'Perché viene tassato solo il 92,35% del reddito?',
          a: "L'IRS consente di ridurre i redditi netti del 7,65% prima di applicare la SE tax, replicando la deduzione lato datore di cui beneficiano i dipendenti. Per questo la base imponibile è il 92,35% del reddito netto da lavoro autonomo.",
        },
        {
          q: "Cos'è la base contributiva Social Security?",
          a: "È l'importo massimo dei redditi soggetti alla quota Social Security del 12,4% ogni anno. Il reddito oltre questo tetto non è tassato per la Social Security, mentre il 2,9% Medicare si applica a tutti i redditi. La base viene aggiornata ogni anno, quindi tieni il campo aggiornato.",
        },
        {
          q: 'Posso dedurre parte della self-employment tax?',
          a: "Sì. Puoi dedurre la metà della SE tax come rettifica al reddito, riducendo il reddito imponibile per l'imposta federale. Il calcolatore mostra separatamente questa metà deducibile.",
        },
        {
          q: 'Include imposta sul reddito e tasse statali?',
          a: "No. Questo strumento stima solo la self-employment tax federale. Non sono inclusi l'imposta federale ordinaria, le tasse statali e la sovrattassa Medicare aggiuntiva dello 0,9% sui redditi alti.",
        },
      ],
    },
    es: {
      title: 'Calculadora de Impuestos Autónomos: Estima Tu SE Tax en Segundos',
      paragraphs: [
        'Si obtienes ingresos como freelance, contratista independiente o empresario individual en EE. UU., debes pagar el impuesto de trabajo autónomo (SE tax) además del impuesto sobre la renta ordinario. Esta calculadora estima cuánto debes según tu ingreso neto de trabajo autónomo, usando las tasas federales estadounidenses vigentes. A diferencia de los empleados, cuyo empleador cubre la mitad del Seguro Social y Medicare, los autónomos pagan tanto la parte del empleador como la del empleado.',
        'El cálculo sigue el método del IRS. Primero, tus ganancias netas se multiplican por 92,35%, porque solo esa parte del ingreso está sujeta al SE tax. El resultado se grava al 12,4% para el Seguro Social, hasta la base salarial anual, y al 2,9% para Medicare sin límite superior. Como la base cambia cada año, este campo es editable para adaptarlo a tu año fiscal. Sumando ambos componentes obtienes el impuesto total de trabajo autónomo.',
        'Uno de los resultados más valiosos es la mitad deducible. Puedes deducir la mitad de tu SE tax al calcular tu ingreso bruto ajustado, lo que reduce tu factura de impuesto sobre la renta. La calculadora muestra esta cifra con claridad para planificar tus pagos trimestrales estimados y evitar sorpresas. Conocer tu tasa efectiva también ayuda a apartar el porcentaje correcto de cada factura.',
        'Estas tasas son federales de EE. UU. y no incluyen impuestos estatales, el recargo adicional de Medicare del 0,9% para ingresos altos, ni el impuesto federal ordinario sobre la renta. Usa esta herramienta para planificar y confirma las cifras finales con un profesional. Para completar tu planificación, prueba nuestra <a href="/${lang}/tools/salary-calculator">calculadora de salario</a>, estima el neto con la <a href="/${lang}/tools/paycheck-calculator">calculadora de nómina</a> o factura a tus clientes con el <a href="/${lang}/tools/invoice-generator">generador de facturas</a>.',
      ],
      faq: [
        {
          q: '¿Qué es el impuesto de trabajo autónomo?',
          a: 'Es el impuesto del Seguro Social y Medicare que pagan quienes trabajan por cuenta propia en EE. UU. Cubre la parte del empleador y del empleado, con un total del 15,3% (12,4% Seguro Social más 2,9% Medicare) sobre las ganancias netas sujetas al SE tax.',
        },
        {
          q: '¿Por qué solo se grava el 92,35% de mi ingreso?',
          a: 'El IRS permite reducir tus ganancias netas en un 7,65% antes de aplicar el SE tax, reflejando la deducción del lado del empleador que reciben los empleados. Por eso la base gravable es el 92,35% de tu ingreso neto de trabajo autónomo.',
        },
        {
          q: '¿Qué es la base salarial del Seguro Social?',
          a: 'Es el importe máximo de ganancias sujeto a la parte del 12,4% del Seguro Social cada año. Los ingresos por encima de ese tope no se gravan para el Seguro Social, aunque el 2,9% de Medicare se aplica a todas las ganancias. La base se actualiza anualmente, así que mantén el campo al día.',
        },
        {
          q: '¿Puedo deducir parte de mi impuesto de trabajo autónomo?',
          a: 'Sí. Puedes deducir la mitad de tu SE tax como ajuste al ingreso, lo que reduce tu ingreso imponible para el impuesto federal. La calculadora muestra esta mitad deducible por separado.',
        },
        {
          q: '¿Incluye el impuesto sobre la renta y los impuestos estatales?',
          a: 'No. Esta herramienta estima solo el impuesto federal de trabajo autónomo. No incluye el impuesto federal ordinario, los impuestos estatales ni el recargo adicional de Medicare del 0,9% sobre ingresos altos.',
        },
      ],
    },
    fr: {
      title: "Calculateur d'Impôts Auto-Entrepreneur : Estimez Votre SE Tax en Quelques Secondes",
      paragraphs: [
        "Si vous percevez des revenus en tant que freelance, travailleur indépendant ou entrepreneur individuel aux États-Unis, vous devez payer l'impôt sur le travail indépendant (SE tax) en plus de l'impôt sur le revenu ordinaire. Ce calculateur estime votre montant dû à partir de votre revenu net d'indépendant, selon les taux fédéraux américains en vigueur. Contrairement aux salariés, dont l'employeur prend en charge la moitié de la Sécurité sociale et de Medicare, les indépendants paient à la fois la part patronale et la part salariale.",
        "Le calcul suit la méthode de l'IRS. D'abord, vos revenus nets sont multipliés par 92,35 %, car seule cette part du revenu est soumise au SE tax. Le résultat est ensuite taxé à 12,4 % pour la Sécurité sociale, jusqu'au plafond annuel, et à 2,9 % pour Medicare sans limite supérieure. Comme le plafond change chaque année, ce champ est modifiable afin de correspondre à votre année fiscale. En additionnant les deux composantes, vous obtenez l'impôt total sur le travail indépendant.",
        "L'un des résultats les plus utiles est la moitié déductible. Vous pouvez déduire la moitié de votre SE tax lors du calcul de votre revenu brut ajusté, ce qui réduit votre impôt sur le revenu. Le calculateur affiche clairement ce montant pour planifier vos acomptes trimestriels et éviter les surprises. Connaître votre taux effectif aide aussi à mettre de côté le bon pourcentage sur chaque facture.",
        'Ces taux sont fédéraux américains et n\'incluent pas les impôts d\'État, la surtaxe Medicare supplémentaire de 0,9 % pour les hauts revenus, ni l\'impôt fédéral ordinaire sur le revenu. Utilisez cet outil pour la planification et confirmez les chiffres finaux avec un professionnel. Pour compléter votre planification, essayez notre <a href="/${lang}/tools/salary-calculator">calculateur de salaire</a>, estimez le net avec le <a href="/${lang}/tools/paycheck-calculator">calculateur de paie</a> ou facturez vos clients avec le <a href="/${lang}/tools/invoice-generator">générateur de factures</a>.',
      ],
      faq: [
        {
          q: "Qu'est-ce que l'impôt sur le travail indépendant ?",
          a: "C'est l'impôt de Sécurité sociale et Medicare payé par les travailleurs indépendants aux États-Unis. Il couvre la part patronale et la part salariale, soit un total de 15,3 % (12,4 % Sécurité sociale plus 2,9 % Medicare) sur les revenus nets soumis au SE tax.",
        },
        {
          q: 'Pourquoi seuls 92,35 % de mon revenu sont-ils taxés ?',
          a: "L'IRS permet de réduire vos revenus nets de 7,65 % avant d'appliquer le SE tax, reproduisant la déduction côté employeur dont bénéficient les salariés. C'est pourquoi la base imposable correspond à 92,35 % de votre revenu net d'indépendant.",
        },
        {
          q: "Qu'est-ce que le plafond de la Sécurité sociale ?",
          a: "C'est le montant maximal de revenus soumis à la part de 12,4 % de la Sécurité sociale chaque année. Les revenus au-dessus de ce plafond ne sont pas taxés pour la Sécurité sociale, tandis que les 2,9 % de Medicare s'appliquent à tous les revenus. Le plafond est mis à jour chaque année, gardez donc le champ à jour.",
        },
        {
          q: 'Puis-je déduire une partie de mon impôt sur le travail indépendant ?',
          a: "Oui. Vous pouvez déduire la moitié de votre SE tax en ajustement du revenu, ce qui réduit votre revenu imposable pour l'impôt fédéral. Le calculateur affiche cette moitié déductible séparément.",
        },
        {
          q: "Cela inclut-il l'impôt sur le revenu et les impôts d'État ?",
          a: "Non. Cet outil estime uniquement l'impôt fédéral sur le travail indépendant. L'impôt fédéral ordinaire, les impôts d'État et la surtaxe Medicare supplémentaire de 0,9 % sur les hauts revenus ne sont pas inclus.",
        },
      ],
    },
    de: {
      title: 'Selbstständigensteuerrechner: Schätzen Sie Ihre SE Tax in Sekunden',
      paragraphs: [
        'Wenn Sie als Freiberufler, unabhängiger Auftragnehmer oder Einzelunternehmer in den USA Einkommen erzielen, müssen Sie zusätzlich zur normalen Einkommensteuer die Selbstständigensteuer (SE Tax) zahlen. Dieser Rechner schätzt Ihre Belastung anhand Ihres Netto-Einkommens aus Selbständigkeit auf Basis der aktuellen US-Bundessätze. Anders als Angestellte, deren Arbeitgeber die Hälfte von Social Security und Medicare übernimmt, zahlen Selbstständige sowohl den Arbeitgeber- als auch den Arbeitnehmeranteil selbst.',
        'Die Berechnung folgt der IRS-Methode. Zuerst werden Ihre Nettoeinkünfte mit 92,35 % multipliziert, da nur dieser Teil des Einkommens der SE Tax unterliegt. Das Ergebnis wird dann mit 12,4 % für Social Security bis zur jährlichen Beitragsbemessungsgrenze und mit 2,9 % für Medicare ohne Obergrenze besteuert. Da sich die Grenze jedes Jahr ändert, ist dieses Feld editierbar, damit es zu Ihrem Steuerjahr passt. Die Summe beider Komponenten ergibt Ihre gesamte Selbstständigensteuer.',
        'Eines der wertvollsten Ergebnisse ist die abziehbare Hälfte. Sie können die Hälfte Ihrer SE Tax bei der Berechnung Ihres bereinigten Bruttoeinkommens abziehen, was Ihre Einkommensteuer senkt. Der Rechner zeigt diesen Betrag deutlich an, damit Sie Ihre vierteljährlichen Vorauszahlungen planen und Überraschungen vermeiden. Der effektive Steuersatz hilft zudem, den richtigen Prozentsatz jeder Rechnung zurückzulegen.',
        'Diese Sätze sind US-Bundessätze und enthalten keine Landessteuern, den zusätzlichen Medicare-Zuschlag von 0,9 % für Hochverdiener oder die normale Bundeseinkommensteuer. Nutzen Sie das Tool zur Planung und bestätigen Sie die Endzahlen mit einem Fachmann. Zur Abrundung Ihrer Planung testen Sie unseren <a href="/${lang}/tools/salary-calculator">Gehaltsrechner</a>, schätzen Sie den Nettolohn mit dem <a href="/${lang}/tools/paycheck-calculator">Lohnrechner</a> oder stellen Sie Kunden mit dem <a href="/${lang}/tools/invoice-generator">Rechnungsgenerator</a> sauber Rechnungen aus.',
      ],
      faq: [
        {
          q: 'Was ist die Selbstständigensteuer?',
          a: 'Sie ist die Social-Security- und Medicare-Steuer, die Selbstständige in den USA zahlen. Sie deckt Arbeitgeber- und Arbeitnehmeranteil ab, insgesamt 15,3 % (12,4 % Social Security plus 2,9 % Medicare) auf die der SE Tax unterliegenden Nettoeinkünfte.',
        },
        {
          q: 'Warum werden nur 92,35 % meines Einkommens besteuert?',
          a: 'Das IRS erlaubt, die Nettoeinkünfte vor Anwendung der SE Tax um 7,65 % zu reduzieren, was den arbeitgeberseitigen Abzug für Angestellte nachbildet. Deshalb beträgt die Bemessungsgrundlage 92,35 % Ihres Netto-Einkommens aus Selbständigkeit.',
        },
        {
          q: 'Was ist die Beitragsbemessungsgrenze von Social Security?',
          a: 'Sie ist der maximale Einkommensbetrag, der jährlich dem 12,4-%-Social-Security-Anteil unterliegt. Einkommen über dieser Grenze wird für Social Security nicht besteuert, während die 2,9 % Medicare für alle Einkünfte gelten. Die Grenze wird jährlich angepasst, halten Sie das Feld daher aktuell.',
        },
        {
          q: 'Kann ich einen Teil meiner Selbstständigensteuer absetzen?',
          a: 'Ja. Sie können die Hälfte Ihrer SE Tax als Einkommensanpassung absetzen, was Ihr zu versteuerndes Einkommen für die Bundeseinkommensteuer verringert. Der Rechner zeigt diese abziehbare Hälfte separat an.',
        },
        {
          q: 'Sind Einkommensteuer und Landessteuern enthalten?',
          a: 'Nein. Dieses Tool schätzt nur die föderale Selbstständigensteuer. Die normale Bundeseinkommensteuer, Landessteuern und der zusätzliche Medicare-Zuschlag von 0,9 % auf hohe Einkommen sind nicht enthalten.',
        },
      ],
    },
    pt: {
      title: 'Calculadora de Impostos Autônomo: Estime Seu SE Tax em Segundos',
      paragraphs: [
        'Se você recebe renda como freelancer, contratado independente ou empresário individual nos EUA, precisa pagar o imposto de trabalho autônomo (SE tax) além do imposto de renda comum. Esta calculadora estima quanto você deve com base na sua renda líquida de trabalho autônomo, usando as alíquotas federais americanas vigentes. Diferente dos empregados, cujo empregador cobre metade da Previdência (Social Security) e do Medicare, os autônomos pagam tanto a parte do empregador quanto a do empregado.',
        'O cálculo segue o método do IRS. Primeiro, seus ganhos líquidos são multiplicados por 92,35%, pois só essa parte da renda está sujeita ao SE tax. O resultado é então tributado em 12,4% para a Previdência, até o teto salarial anual, e em 2,9% para o Medicare sem limite superior. Como o teto muda todo ano, este campo é editável para corresponder ao seu ano fiscal. Somando os dois componentes, você obtém o imposto total de trabalho autônomo.',
        'Um dos resultados mais valiosos é a metade dedutível. Você pode deduzir metade do seu SE tax ao calcular sua renda bruta ajustada, o que reduz o imposto de renda. A calculadora mostra esse valor com clareza para planejar seus pagamentos trimestrais estimados e evitar surpresas. Conhecer sua alíquota efetiva também ajuda a reservar a porcentagem correta de cada fatura.',
        'Essas alíquotas são federais dos EUA e não incluem impostos estaduais, a sobretaxa adicional de Medicare de 0,9% para altas rendas, nem o imposto de renda federal comum. Use esta ferramenta para planejar e confirme os números finais com um profissional. Para completar seu planejamento, experimente nossa <a href="/${lang}/tools/salary-calculator">calculadora de salário</a>, estime o líquido com a <a href="/${lang}/tools/paycheck-calculator">calculadora de holerite</a> ou fature clientes com o <a href="/${lang}/tools/invoice-generator">gerador de faturas</a>.',
      ],
      faq: [
        {
          q: 'O que é o imposto de trabalho autônomo?',
          a: 'É o imposto de Previdência (Social Security) e Medicare pago por quem trabalha por conta própria nos EUA. Cobre a parte do empregador e do empregado, totalizando 15,3% (12,4% Social Security mais 2,9% Medicare) sobre os ganhos líquidos sujeitos ao SE tax.',
        },
        {
          q: 'Por que apenas 92,35% da minha renda é tributada?',
          a: 'O IRS permite reduzir seus ganhos líquidos em 7,65% antes de aplicar o SE tax, espelhando a dedução do lado do empregador que os empregados recebem. Por isso a base tributável é 92,35% da sua renda líquida de trabalho autônomo.',
        },
        {
          q: 'O que é o teto salarial da Previdência?',
          a: 'É o valor máximo de ganhos sujeito à parte de 12,4% da Previdência a cada ano. A renda acima desse teto não é tributada para a Previdência, embora os 2,9% do Medicare se apliquem a todos os ganhos. O teto é atualizado anualmente, então mantenha o campo em dia.',
        },
        {
          q: 'Posso deduzir parte do meu imposto de trabalho autônomo?',
          a: 'Sim. Você pode deduzir metade do seu SE tax como ajuste na renda, o que reduz sua renda tributável para o imposto federal. A calculadora mostra essa metade dedutível separadamente.',
        },
        {
          q: 'Isso inclui imposto de renda e impostos estaduais?',
          a: 'Não. Esta ferramenta estima apenas o imposto federal de trabalho autônomo. O imposto de renda federal comum, os impostos estaduais e a sobretaxa adicional de Medicare de 0,9% sobre altas rendas não estão incluídos.',
        },
      ],
    },
  };

  const seo = seoContent[lang] || seoContent.en;

  return (
    <ToolPageWrapper toolSlug="self-employment-tax-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Inputs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="se-income">
              {labels.netIncome[lang]}
            </label>
            <input
              id="se-income"
              type="text"
              inputMode="decimal"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              aria-invalid={incomeError !== null}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${incomeError ? 'border-red-400' : 'border-gray-300'}`}
            />
            {incomeError && <p className="mt-1 text-sm text-red-600">{errorText(incomeError)}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="se-wage-base">
              {labels.wageBase[lang]}
            </label>
            <input
              id="se-wage-base"
              type="text"
              inputMode="decimal"
              value={wageBase}
              onChange={(e) => setWageBase(e.target.value)}
              aria-invalid={wageBaseError !== null}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${wageBaseError ? 'border-red-400' : 'border-gray-300'}`}
            />
            {wageBaseError && (
              <p className="mt-1 text-sm text-red-600">{errorText(wageBaseError)}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">{labels.ssRate[lang]}</div>
              <div className="text-lg font-bold text-gray-900">
                {pct(SS_RATE * 100)}%{' '}
                <span className="text-xs font-normal text-gray-400">({labels.fixed[lang]})</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">{labels.medicareRate[lang]}</div>
              <div className="text-lg font-bold text-gray-900">
                {pct(MEDICARE_RATE * 100)}%{' '}
                <span className="text-xs font-normal text-gray-400">({labels.fixed[lang]})</span>
              </div>
            </div>
          </div>

          {/* Results */}
          {calculation && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{labels.results[lang]}</h3>

              <div className="grid grid-cols-1 gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                  <div className="text-sm text-white/80">{labels.totalSeTax[lang]}</div>
                  <div className="text-2xl font-bold">{fmt(calculation.totalSeTax)}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-xs text-green-600 font-medium">
                      {labels.ssPortion[lang]}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {fmt(calculation.ssPortion)}
                    </div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="text-xs text-purple-600 font-medium">
                      {labels.medicarePortion[lang]}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {fmt(calculation.medicarePortion)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">{labels.netEarnings[lang]}</div>
                    <div className="text-sm font-bold text-gray-900">
                      {fmt(calculation.netEarnings)}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">{labels.deductibleHalf[lang]}</div>
                    <div className="text-sm font-bold text-green-600">
                      {fmt(calculation.deductibleHalf)}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">{labels.effectiveRate[lang]}</div>
                    <div className="text-sm font-bold text-gray-900">
                      {pct(calculation.effectiveRate)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  {copied ? labels.copied[lang] : labels.copy[lang]}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  {labels.reset[lang]}
                </button>
              </div>

              <p className="mt-4 text-xs text-gray-500">{labels.disclaimer[lang]}</p>
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
