'use client';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type FieldError = 'required' | 'numeric' | 'negative' | null;

export default function GapInsuranceCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['gap-insurance-calculator'][lang];

  const [carValue, setCarValue] = useState('18000');
  const [loanBalance, setLoanBalance] = useState('23000');
  const [gapCost, setGapCost] = useState('');
  const [copied, setCopied] = useState(false);

  const labels = {
    carValue: {
      en: 'Current car value (actual cash value)',
      it: 'Valore attuale auto (valore reale)',
      es: 'Valor actual del auto (valor real)',
      fr: 'Valeur actuelle du véhicule (valeur réelle)',
      de: 'Aktueller Fahrzeugwert (Zeitwert)',
      pt: 'Valor atual do carro (valor real)',
    },
    loanBalance: {
      en: 'Remaining loan or lease balance',
      it: 'Debito residuo del finanziamento o leasing',
      es: 'Saldo pendiente del préstamo o leasing',
      fr: 'Solde restant du prêt ou du leasing',
      de: 'Restschuld des Kredits oder Leasings',
      pt: 'Saldo restante do financiamento ou leasing',
    },
    gapCost: {
      en: 'Gap insurance annual cost (optional)',
      it: 'Costo annuo assicurazione GAP (facoltativo)',
      es: 'Costo anual del seguro GAP (opcional)',
      fr: "Coût annuel de l'assurance GAP (facultatif)",
      de: 'Jährliche Kosten der GAP-Versicherung (optional)',
      pt: 'Custo anual do seguro GAP (opcional)',
    },
    results: {
      en: 'Results',
      it: 'Risultati',
      es: 'Resultados',
      fr: 'Résultats',
      de: 'Ergebnisse',
      pt: 'Resultados',
    },
    coverageGap: {
      en: 'Coverage gap (uncovered exposure)',
      it: 'Divario di copertura (esposizione scoperta)',
      es: 'Brecha de cobertura (exposición sin cubrir)',
      fr: 'Écart de couverture (exposition non couverte)',
      de: 'Deckungslücke (ungedecktes Risiko)',
      pt: 'Lacuna de cobertura (exposição não coberta)',
    },
    recommendation: {
      en: 'Recommendation',
      it: 'Raccomandazione',
      es: 'Recomendación',
      fr: 'Recommandation',
      de: 'Empfehlung',
      pt: 'Recomendação',
    },
    recommendedYes: {
      en: 'GAP insurance is recommended',
      it: "L'assicurazione GAP è consigliata",
      es: 'Se recomienda el seguro GAP',
      fr: "L'assurance GAP est recommandée",
      de: 'GAP-Versicherung wird empfohlen',
      pt: 'O seguro GAP é recomendado',
    },
    recommendedNo: {
      en: 'GAP insurance is not needed',
      it: "L'assicurazione GAP non è necessaria",
      es: 'El seguro GAP no es necesario',
      fr: "L'assurance GAP n'est pas nécessaire",
      de: 'GAP-Versicherung ist nicht nötig',
      pt: 'O seguro GAP não é necessário',
    },
    explainYes: {
      en: "You owe more than the car is worth. If it is totaled or stolen, your standard insurance would pay only the car's value, leaving you responsible for this gap.",
      it: "Devi più di quanto vale l'auto. In caso di distruzione o furto, l'assicurazione base pagherebbe solo il valore dell'auto, lasciando a tuo carico questo divario.",
      es: 'Debes más de lo que vale el auto. Si se declara pérdida total o es robado, tu seguro estándar pagaría solo el valor del auto, dejándote responsable de esta brecha.',
      fr: 'Vous devez plus que la valeur du véhicule. En cas de perte totale ou de vol, votre assurance standard ne paierait que la valeur du véhicule, vous laissant responsable de cet écart.',
      de: 'Sie schulden mehr, als das Auto wert ist. Bei Totalschaden oder Diebstahl würde Ihre Standardversicherung nur den Fahrzeugwert zahlen, sodass diese Lücke zu Ihren Lasten geht.',
      pt: 'Você deve mais do que o carro vale. Em caso de perda total ou roubo, o seu seguro padrão pagaria apenas o valor do carro, deixando você responsável por esta lacuna.',
    },
    explainNo: {
      en: 'The car is worth at least as much as you owe. Your standard insurance payout would cover the balance, so GAP coverage would provide no benefit.',
      it: "L'auto vale almeno quanto devi. Il rimborso dell'assicurazione base coprirebbe il debito, quindi la copertura GAP non porterebbe alcun beneficio.",
      es: 'El auto vale al menos lo que debes. El pago de tu seguro estándar cubriría el saldo, por lo que la cobertura GAP no aportaría ningún beneficio.',
      fr: "Le véhicule vaut au moins ce que vous devez. L'indemnisation de votre assurance standard couvrirait le solde, donc la couverture GAP n'apporterait aucun avantage.",
      de: 'Das Auto ist mindestens so viel wert wie Ihre Schuld. Die Auszahlung Ihrer Standardversicherung würde die Restschuld decken, sodass eine GAP-Deckung keinen Vorteil bringt.',
      pt: 'O carro vale pelo menos o que você deve. O pagamento do seu seguro padrão cobriria o saldo, portanto a cobertura GAP não traria nenhum benefício.',
    },
    costContext: {
      en: 'Cost vs. exposure',
      it: 'Costo vs. esposizione',
      es: 'Costo vs. exposición',
      fr: 'Coût vs. exposition',
      de: 'Kosten vs. Risiko',
      pt: 'Custo vs. exposição',
    },
    costLine: {
      en: 'For {cost} per year, GAP insurance would cover {exposure} of exposure ({ratio}× the annual premium).',
      it: "Per {cost} all'anno, l'assicurazione GAP coprirebbe {exposure} di esposizione ({ratio}× il premio annuo).",
      es: 'Por {cost} al año, el seguro GAP cubriría {exposure} de exposición ({ratio}× la prima anual).',
      fr: "Pour {cost} par an, l'assurance GAP couvrirait {exposure} d'exposition ({ratio}× la prime annuelle).",
      de: 'Für {cost} pro Jahr würde die GAP-Versicherung {exposure} an Risiko abdecken ({ratio}× die Jahresprämie).',
      pt: 'Por {cost} ao ano, o seguro GAP cobriria {exposure} de exposição ({ratio}× o prémio anual).',
    },
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
    errorRequired: {
      en: 'Please enter a value',
      it: 'Inserisci un valore',
      es: 'Introduce un valor',
      fr: 'Veuillez saisir une valeur',
      de: 'Bitte einen Wert eingeben',
      pt: 'Insira um valor',
    },
    errorNumeric: {
      en: 'Please enter a valid number',
      it: 'Inserisci un numero valido',
      es: 'Introduce un número válido',
      fr: 'Veuillez saisir un nombre valide',
      de: 'Bitte eine gültige Zahl eingeben',
      pt: 'Insira um número válido',
    },
    errorNegative: {
      en: 'Value cannot be negative',
      it: 'Il valore non può essere negativo',
      es: 'El valor no puede ser negativo',
      fr: 'La valeur ne peut pas être négative',
      de: 'Der Wert darf nicht negativ sein',
      pt: 'O valor não pode ser negativo',
    },
  } as Record<string, Record<Locale, string>>;

  const validate = (value: string, required: boolean): FieldError => {
    const trimmed = value.trim();
    if (trimmed === '') return required ? 'required' : null;
    const parsed = Number(trimmed);
    if (Number.isNaN(parsed)) return 'numeric';
    if (parsed < 0) return 'negative';
    return null;
  };

  const errorText = (err: FieldError): string => {
    if (err === 'required') return labels.errorRequired[lang];
    if (err === 'numeric') return labels.errorNumeric[lang];
    if (err === 'negative') return labels.errorNegative[lang];
    return '';
  };

  const carValueError = validate(carValue, true);
  const loanBalanceError = validate(loanBalance, true);
  const gapCostError = validate(gapCost, false);

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
        maximumFractionDigits: 2,
      }
    ).format(n);

  const result = useMemo(() => {
    if (carValueError || loanBalanceError || gapCostError) return null;
    const value = Number(carValue.trim());
    const balance = Number(loanBalance.trim());
    const gap = Math.max(0, balance - value);
    const needsGap = gap > 0;
    const cost = gapCost.trim() === '' ? null : Number(gapCost.trim());
    const ratio = cost !== null && cost > 0 && gap > 0 ? gap / cost : null;
    return { gap, needsGap, cost, ratio };
  }, [carValue, loanBalance, gapCost, carValueError, loanBalanceError, gapCostError]);

  const copySummary = (): void => {
    if (!result) return;
    const rec = result.needsGap ? labels.recommendedYes[lang] : labels.recommendedNo[lang];
    const lines = [
      `${labels.coverageGap[lang]}: ${fmt(result.gap)}`,
      `${labels.recommendation[lang]}: ${rec}`,
    ];
    if (result.ratio !== null && result.cost !== null) {
      lines.push(
        labels.costLine[lang]
          .replace('{cost}', fmt(result.cost))
          .replace('{exposure}', fmt(result.gap))
          .replace('{ratio}', result.ratio.toFixed(1))
      );
    }
    void navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = (): void => {
    setCarValue('18000');
    setLoanBalance('23000');
    setGapCost('');
    setCopied(false);
  };

  const seoContent: Record<
    Locale,
    { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }
  > = {
    en: {
      title: 'GAP Insurance Calculator: Should You Buy Guaranteed Asset Protection?',
      paragraphs: [
        "GAP insurance, short for Guaranteed Asset Protection, covers the difference between what you owe on a car loan or lease and what the vehicle is actually worth if it is stolen or declared a total loss. Because new cars depreciate quickly, drivers who finance with a small down payment or a long term often owe more than the car's market value for the first few years. This calculator compares your current car value against your remaining balance to reveal that gap instantly.",
        'The math is simple but consequential. If your car is worth $18,000 and you still owe $23,000, standard comprehensive or collision insurance would pay out only the $18,000 market value after a total loss. You would still be responsible for the remaining $5,000, even though you no longer have a car to drive. GAP insurance is designed to cover exactly that shortfall, which is why lenders and dealerships frequently offer it at signing.',
        "Whether GAP coverage is worth it depends on the size of your exposure and the cost of the premium. If the calculator shows a positive gap, weigh the potential out-of-pocket loss against the annual premium. A small gap combined with an expensive policy may not justify the cost, while a large gap on a rapidly depreciating vehicle usually does. Once your loan balance falls below the car's value, the gap disappears and the coverage no longer provides any benefit, so it is worth re-checking each year.",
        'Use this tool alongside our <a href="/${lang}/tools/auto-loan-calculator">auto loan calculator</a> to see how your balance shrinks over time, and our <a href="/${lang}/tools/loan-calculator">loan calculator</a> to model different down payments and terms. If you are budgeting for a larger purchase, the <a href="/${lang}/tools/mortgage-calculator">mortgage calculator</a> can help you plan the rest of your finances.',
      ],
      faq: [
        {
          q: 'What is GAP insurance?',
          a: 'GAP (Guaranteed Asset Protection) insurance covers the difference between your remaining loan or lease balance and the actual cash value your insurer pays if your vehicle is totaled or stolen. It prevents you from owing money on a car you can no longer drive.',
        },
        {
          q: 'When do I need GAP insurance?',
          a: 'You typically need it when you owe more than your car is worth, which is common with a small down payment, a loan term of 60 months or more, a high-depreciation vehicle, or a lease. If this calculator shows a positive gap, GAP coverage is worth considering.',
        },
        {
          q: 'When can I drop GAP insurance?',
          a: "Once your loan balance drops below the car's market value, the gap closes and the coverage stops providing any benefit. At that point you can usually cancel and may be entitled to a refund of the unused premium.",
        },
        {
          q: 'How much does GAP insurance cost?',
          a: 'Standalone GAP policies from an insurer often cost $20 to $60 per year, while dealership GAP add-ons rolled into a loan can cost several hundred dollars plus interest. Comparing the premium against your exposure helps you decide if it is worthwhile.',
        },
        {
          q: 'Is my data stored or shared?',
          a: 'No. All calculations run entirely in your browser. The car value, loan balance, and premium you enter are never sent to any server, stored in a database, or shared with third parties.',
        },
      ],
    },
    it: {
      title: 'Calcolatore Assicurazione GAP: Ti Serve la Protezione del Valore?',
      paragraphs: [
        "L'assicurazione GAP (Guaranteed Asset Protection) copre la differenza tra quanto devi su un finanziamento o leasing auto e quanto vale realmente il veicolo se viene rubato o dichiarato perdita totale. Poiché le auto nuove si svalutano rapidamente, chi finanzia con un piccolo anticipo o una durata lunga spesso deve più del valore di mercato dell'auto nei primi anni. Questo calcolatore confronta il valore attuale dell'auto con il debito residuo per rivelare subito questo divario.",
        "Il calcolo è semplice ma importante. Se la tua auto vale 18.000 e devi ancora 23.000, l'assicurazione base kasko o collisione pagherebbe solo il valore di mercato di 18.000 dopo una perdita totale. Resteresti comunque responsabile dei 5.000 residui, pur non avendo più un'auto da guidare. L'assicurazione GAP è pensata proprio per coprire questo ammanco, ed è per questo che finanziarie e concessionari la propongono spesso alla firma.",
        "Se la copertura GAP convenga dipende dall'entità della tua esposizione e dal costo del premio. Se il calcolatore mostra un divario positivo, valuta la potenziale perdita di tasca tua rispetto al premio annuo. Un piccolo divario con una polizza costosa può non giustificare la spesa, mentre un divario ampio su un veicolo a rapida svalutazione di solito sì. Quando il debito scende sotto il valore dell'auto, il divario scompare e la copertura non porta più alcun beneficio, quindi conviene ricontrollarla ogni anno.",
        'Usa questo strumento insieme al nostro <a href="/${lang}/tools/auto-loan-calculator">calcolatore prestito auto</a> per vedere come si riduce il debito nel tempo, e al <a href="/${lang}/tools/loan-calculator">calcolatore prestiti</a> per simulare diversi anticipi e durate. Se stai pianificando un acquisto più grande, il <a href="/${lang}/tools/mortgage-calculator">calcolatore mutuo</a> può aiutarti con il resto delle finanze.',
      ],
      faq: [
        {
          q: "Cos'è l'assicurazione GAP?",
          a: "L'assicurazione GAP (Guaranteed Asset Protection) copre la differenza tra il debito residuo del finanziamento o leasing e il valore reale che l'assicuratore paga se il veicolo è distrutto o rubato. Evita che tu debba pagare per un'auto che non puoi più guidare.",
        },
        {
          q: "Quando mi serve l'assicurazione GAP?",
          a: "Ti serve tipicamente quando devi più di quanto vale l'auto, situazione comune con un piccolo anticipo, una durata di 60 mesi o più, un veicolo ad alta svalutazione o un leasing. Se questo calcolatore mostra un divario positivo, vale la pena considerare la copertura GAP.",
        },
        {
          q: "Quando posso rinunciare all'assicurazione GAP?",
          a: "Quando il debito scende sotto il valore di mercato dell'auto, il divario si chiude e la copertura smette di portare benefici. A quel punto puoi di solito annullarla e potresti avere diritto al rimborso del premio non utilizzato.",
        },
        {
          q: "Quanto costa l'assicurazione GAP?",
          a: "Le polizze GAP autonome di un assicuratore costano spesso da 20 a 60 all'anno, mentre le aggiunte GAP del concessionario inserite nel finanziamento possono costare diverse centinaia più interessi. Confrontare il premio con l'esposizione aiuta a decidere.",
        },
        {
          q: 'I miei dati vengono salvati o condivisi?',
          a: "No. Tutti i calcoli avvengono interamente nel browser. Il valore dell'auto, il debito residuo e il premio inseriti non vengono mai inviati a server, salvati in un database o condivisi con terze parti.",
        },
      ],
    },
    es: {
      title: 'Calculadora de Seguro GAP: ¿Necesitas Protección de Valor Garantizado?',
      paragraphs: [
        'El seguro GAP (Guaranteed Asset Protection) cubre la diferencia entre lo que debes de un préstamo o leasing de auto y lo que realmente vale el vehículo si es robado o declarado pérdida total. Como los autos nuevos se deprecian rápido, quienes financian con un pago inicial pequeño o un plazo largo suelen deber más que el valor de mercado durante los primeros años. Esta calculadora compara el valor actual del auto con el saldo pendiente para revelar esa brecha al instante.',
        'La matemática es sencilla pero importante. Si tu auto vale $18,000 y aún debes $23,000, el seguro estándar a todo riesgo o de colisión pagaría solo el valor de mercado de $18,000 tras una pérdida total. Seguirías siendo responsable de los $5,000 restantes, aunque ya no tengas un auto para conducir. El seguro GAP está diseñado para cubrir exactamente ese déficit, por lo que financieras y concesionarios lo ofrecen con frecuencia al firmar.',
        'Que la cobertura GAP valga la pena depende del tamaño de tu exposición y del costo de la prima. Si la calculadora muestra una brecha positiva, compara la posible pérdida de tu bolsillo con la prima anual. Una brecha pequeña con una póliza cara puede no justificar el gasto, mientras que una brecha grande en un vehículo de rápida depreciación normalmente sí. Cuando el saldo baja del valor del auto, la brecha desaparece y la cobertura deja de aportar beneficio, así que conviene revisarla cada año.',
        'Usa esta herramienta junto con nuestra <a href="/${lang}/tools/auto-loan-calculator">calculadora de préstamo de auto</a> para ver cómo se reduce tu saldo con el tiempo, y nuestra <a href="/${lang}/tools/loan-calculator">calculadora de préstamos</a> para modelar distintos pagos iniciales y plazos. Si planeas una compra mayor, la <a href="/${lang}/tools/mortgage-calculator">calculadora de hipoteca</a> puede ayudarte con el resto de tus finanzas.',
      ],
      faq: [
        {
          q: '¿Qué es el seguro GAP?',
          a: 'El seguro GAP (Guaranteed Asset Protection) cubre la diferencia entre el saldo pendiente de tu préstamo o leasing y el valor real que paga tu aseguradora si el vehículo es declarado pérdida total o robado. Evita que debas dinero por un auto que ya no puedes conducir.',
        },
        {
          q: '¿Cuándo necesito seguro GAP?',
          a: 'Suele necesitarse cuando debes más de lo que vale el auto, algo común con un pago inicial pequeño, un plazo de 60 meses o más, un vehículo de alta depreciación o un leasing. Si esta calculadora muestra una brecha positiva, conviene considerar la cobertura GAP.',
        },
        {
          q: '¿Cuándo puedo cancelar el seguro GAP?',
          a: 'Cuando el saldo baja del valor de mercado del auto, la brecha se cierra y la cobertura deja de aportar beneficio. En ese momento normalmente puedes cancelarlo y podrías tener derecho a un reembolso de la prima no usada.',
        },
        {
          q: '¿Cuánto cuesta el seguro GAP?',
          a: 'Las pólizas GAP independientes de una aseguradora cuestan a menudo entre $20 y $60 al año, mientras que los añadidos GAP del concesionario incluidos en el préstamo pueden costar varios cientos más intereses. Comparar la prima con tu exposición ayuda a decidir.',
        },
        {
          q: '¿Se almacenan o comparten mis datos?',
          a: 'No. Todos los cálculos se realizan completamente en tu navegador. El valor del auto, el saldo y la prima que introduces nunca se envían a un servidor, se guardan en una base de datos ni se comparten con terceros.',
        },
      ],
    },
    fr: {
      title: "Calculateur d'Assurance GAP : Avez-Vous Besoin d'une Protection Garantie ?",
      paragraphs: [
        "L'assurance GAP (Guaranteed Asset Protection) couvre la différence entre ce que vous devez sur un prêt ou un leasing auto et la valeur réelle du véhicule s'il est volé ou déclaré perte totale. Comme les voitures neuves se déprécient vite, ceux qui financent avec un petit apport ou une longue durée doivent souvent plus que la valeur de marché pendant les premières années. Ce calculateur compare la valeur actuelle du véhicule au solde restant pour révéler cet écart instantanément.",
        "Le calcul est simple mais lourd de conséquences. Si votre voiture vaut 18 000 et que vous devez encore 23 000, l'assurance tous risques ou collision standard ne paierait que la valeur de marché de 18 000 après une perte totale. Vous resteriez responsable des 5 000 restants, alors que vous n'avez plus de voiture à conduire. L'assurance GAP est conçue pour couvrir précisément ce déficit, c'est pourquoi les organismes de crédit et les concessionnaires la proposent souvent à la signature.",
        "Que la couverture GAP en vaille la peine dépend de l'ampleur de votre exposition et du coût de la prime. Si le calculateur affiche un écart positif, comparez la perte potentielle de votre poche à la prime annuelle. Un petit écart avec une police coûteuse peut ne pas justifier la dépense, tandis qu'un écart important sur un véhicule à forte dépréciation le justifie généralement. Lorsque le solde passe sous la valeur du véhicule, l'écart disparaît et la couverture n'apporte plus aucun bénéfice, il vaut donc mieux la revérifier chaque année.",
        'Utilisez cet outil avec notre <a href="/${lang}/tools/auto-loan-calculator">calculateur de prêt auto</a> pour voir comment votre solde diminue avec le temps, et notre <a href="/${lang}/tools/loan-calculator">calculateur de prêt</a> pour modéliser différents apports et durées. Si vous préparez un achat plus important, le <a href="/${lang}/tools/mortgage-calculator">calculateur hypothécaire</a> peut vous aider pour le reste de vos finances.',
      ],
      faq: [
        {
          q: "Qu'est-ce que l'assurance GAP ?",
          a: "L'assurance GAP (Guaranteed Asset Protection) couvre la différence entre le solde restant de votre prêt ou leasing et la valeur réelle que verse votre assureur si le véhicule est déclaré perte totale ou volé. Elle évite de devoir de l'argent pour une voiture que vous ne pouvez plus conduire.",
        },
        {
          q: "Quand ai-je besoin de l'assurance GAP ?",
          a: "Elle est généralement utile lorsque vous devez plus que la valeur du véhicule, ce qui est courant avec un petit apport, une durée de 60 mois ou plus, un véhicule à forte dépréciation ou un leasing. Si ce calculateur affiche un écart positif, la couverture GAP mérite d'être envisagée.",
        },
        {
          q: "Quand puis-je résilier l'assurance GAP ?",
          a: "Lorsque le solde passe sous la valeur de marché du véhicule, l'écart se referme et la couverture n'apporte plus de bénéfice. À ce moment, vous pouvez généralement l'annuler et pourriez avoir droit à un remboursement de la prime non utilisée.",
        },
        {
          q: "Combien coûte l'assurance GAP ?",
          a: "Les polices GAP indépendantes d'un assureur coûtent souvent de 20 à 60 par an, tandis que les options GAP des concessionnaires intégrées au prêt peuvent coûter plusieurs centaines plus les intérêts. Comparer la prime à votre exposition aide à décider.",
        },
        {
          q: 'Mes données sont-elles stockées ou partagées ?',
          a: 'Non. Tous les calculs se font entièrement dans votre navigateur. La valeur du véhicule, le solde et la prime que vous saisissez ne sont jamais envoyés à un serveur, stockés dans une base de données ni partagés avec des tiers.',
        },
      ],
    },
    de: {
      title: 'GAP-Versicherungsrechner: Brauchen Sie eine Restwertabsicherung?',
      paragraphs: [
        'Die GAP-Versicherung (Guaranteed Asset Protection) deckt die Differenz zwischen dem, was Sie für einen Autokredit oder ein Leasing schulden, und dem tatsächlichen Wert des Fahrzeugs, wenn es gestohlen oder als Totalschaden eingestuft wird. Da Neuwagen schnell an Wert verlieren, schulden Käufer mit kleiner Anzahlung oder langer Laufzeit in den ersten Jahren oft mehr als den Marktwert. Dieser Rechner vergleicht den aktuellen Fahrzeugwert mit Ihrer Restschuld und zeigt diese Lücke sofort auf.',
        'Die Rechnung ist einfach, aber folgenreich. Ist Ihr Auto 18.000 wert und Sie schulden noch 23.000, würde eine normale Vollkasko- oder Kollisionsversicherung nach einem Totalschaden nur den Marktwert von 18.000 auszahlen. Für die verbleibenden 5.000 wären Sie weiterhin verantwortlich, obwohl Sie kein fahrbares Auto mehr haben. Die GAP-Versicherung deckt genau diesen Fehlbetrag, weshalb Kreditgeber und Händler sie häufig beim Abschluss anbieten.',
        'Ob sich die GAP-Deckung lohnt, hängt von der Höhe Ihres Risikos und den Prämienkosten ab. Zeigt der Rechner eine positive Lücke, wägen Sie den möglichen Eigenverlust gegen die Jahresprämie ab. Eine kleine Lücke bei einer teuren Police rechtfertigt die Ausgabe womöglich nicht, während eine große Lücke bei einem schnell abwertenden Fahrzeug dies meist tut. Sobald die Restschuld unter den Fahrzeugwert fällt, verschwindet die Lücke und die Deckung bringt keinen Nutzen mehr, weshalb eine jährliche Überprüfung sinnvoll ist.',
        'Nutzen Sie dieses Tool zusammen mit unserem <a href="/${lang}/tools/auto-loan-calculator">Autokreditrechner</a>, um zu sehen, wie Ihre Restschuld mit der Zeit sinkt, und unserem <a href="/${lang}/tools/loan-calculator">Kreditrechner</a>, um verschiedene Anzahlungen und Laufzeiten zu modellieren. Wenn Sie eine größere Anschaffung planen, hilft der <a href="/${lang}/tools/mortgage-calculator">Hypothekenrechner</a> beim Rest Ihrer Finanzen.',
      ],
      faq: [
        {
          q: 'Was ist eine GAP-Versicherung?',
          a: 'Die GAP-Versicherung (Guaranteed Asset Protection) deckt die Differenz zwischen Ihrer Kredit- oder Leasingrestschuld und dem Zeitwert, den Ihr Versicherer bei Totalschaden oder Diebstahl zahlt. Sie verhindert, dass Sie für ein Auto zahlen, das Sie nicht mehr fahren können.',
        },
        {
          q: 'Wann brauche ich eine GAP-Versicherung?',
          a: 'Sie ist typischerweise nötig, wenn Sie mehr schulden, als das Auto wert ist, was bei kleiner Anzahlung, einer Laufzeit von 60 Monaten oder mehr, einem stark abwertenden Fahrzeug oder einem Leasing häufig vorkommt. Zeigt dieser Rechner eine positive Lücke, lohnt sich die GAP-Deckung zur Überlegung.',
        },
        {
          q: 'Wann kann ich die GAP-Versicherung kündigen?',
          a: 'Sobald die Restschuld unter den Marktwert des Autos fällt, schließt sich die Lücke und die Deckung bringt keinen Nutzen mehr. Dann können Sie sie in der Regel kündigen und haben möglicherweise Anspruch auf Erstattung der nicht genutzten Prämie.',
        },
        {
          q: 'Wie viel kostet eine GAP-Versicherung?',
          a: 'Eigenständige GAP-Policen eines Versicherers kosten oft 20 bis 60 pro Jahr, während in den Kredit eingebaute GAP-Zusätze vom Händler mehrere Hundert plus Zinsen kosten können. Der Vergleich der Prämie mit Ihrem Risiko hilft bei der Entscheidung.',
        },
        {
          q: 'Werden meine Daten gespeichert oder geteilt?',
          a: 'Nein. Alle Berechnungen erfolgen vollständig in Ihrem Browser. Der Fahrzeugwert, die Restschuld und die Prämie, die Sie eingeben, werden niemals an einen Server gesendet, in einer Datenbank gespeichert oder mit Dritten geteilt.',
        },
      ],
    },
    pt: {
      title: 'Calculadora de Seguro GAP: Você Precisa de Proteção de Valor Garantido?',
      paragraphs: [
        'O seguro GAP (Guaranteed Asset Protection) cobre a diferença entre o que você deve num financiamento ou leasing de carro e quanto o veículo realmente vale se for roubado ou declarado perda total. Como os carros novos se desvalorizam rápido, quem financia com uma entrada pequena ou um prazo longo costuma dever mais do que o valor de mercado nos primeiros anos. Esta calculadora compara o valor atual do carro com o saldo restante para revelar essa lacuna na hora.',
        'A conta é simples, mas importante. Se o seu carro vale R$18.000 e você ainda deve R$23.000, o seguro padrão contra colisão ou compreensivo pagaria apenas o valor de mercado de R$18.000 após uma perda total. Você continuaria responsável pelos R$5.000 restantes, mesmo sem ter mais um carro para dirigir. O seguro GAP foi feito para cobrir exatamente esse déficit, por isso financeiras e concessionárias costumam oferecê-lo na assinatura.',
        'Se a cobertura GAP vale a pena depende do tamanho da sua exposição e do custo do prémio. Se a calculadora mostrar uma lacuna positiva, compare a possível perda do seu bolso com o prémio anual. Uma lacuna pequena com uma apólice cara pode não justificar o gasto, enquanto uma lacuna grande num veículo de rápida desvalorização geralmente justifica. Quando o saldo cai abaixo do valor do carro, a lacuna desaparece e a cobertura deixa de trazer benefício, por isso vale a pena reavaliar a cada ano.',
        'Use esta ferramenta junto com a nossa <a href="/${lang}/tools/auto-loan-calculator">calculadora de financiamento de carro</a> para ver como o seu saldo diminui com o tempo, e a nossa <a href="/${lang}/tools/loan-calculator">calculadora de empréstimos</a> para simular diferentes entradas e prazos. Se está a planear uma compra maior, a <a href="/${lang}/tools/mortgage-calculator">calculadora de hipoteca</a> pode ajudar com o resto das suas finanças.',
      ],
      faq: [
        {
          q: 'O que é o seguro GAP?',
          a: 'O seguro GAP (Guaranteed Asset Protection) cobre a diferença entre o saldo restante do seu financiamento ou leasing e o valor real que a seguradora paga se o veículo for declarado perda total ou roubado. Evita que você deva dinheiro por um carro que já não pode dirigir.',
        },
        {
          q: 'Quando preciso do seguro GAP?',
          a: 'Normalmente é necessário quando você deve mais do que o carro vale, algo comum com entrada pequena, prazo de 60 meses ou mais, veículo de alta desvalorização ou leasing. Se esta calculadora mostrar uma lacuna positiva, vale a pena considerar a cobertura GAP.',
        },
        {
          q: 'Quando posso cancelar o seguro GAP?',
          a: 'Quando o saldo cai abaixo do valor de mercado do carro, a lacuna se fecha e a cobertura deixa de trazer benefício. Nesse ponto você normalmente pode cancelá-lo e pode ter direito a reembolso do prémio não utilizado.',
        },
        {
          q: 'Quanto custa o seguro GAP?',
          a: 'As apólices GAP independentes de uma seguradora costumam custar de 20 a 60 por ano, enquanto os adicionais GAP da concessionária embutidos no financiamento podem custar várias centenas mais juros. Comparar o prémio com a sua exposição ajuda a decidir.',
        },
        {
          q: 'Meus dados são armazenados ou compartilhados?',
          a: 'Não. Todos os cálculos acontecem inteiramente no seu navegador. O valor do carro, o saldo e o prémio que você insere nunca são enviados a um servidor, armazenados numa base de dados ou compartilhados com terceiros.',
        },
      ],
    },
  };

  const seo = seoContent[lang] || seoContent.en;
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const inputClass = (hasError: boolean): string =>
    `w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${hasError ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'}`;

  return (
    <ToolPageWrapper toolSlug="gap-insurance-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Inputs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.carValue[lang]} ($)
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={500}
              value={carValue}
              onChange={(e) => setCarValue(e.target.value)}
              className={inputClass(carValueError !== null)}
            />
            {carValueError && (
              <p className="mt-1 text-sm text-red-600">{errorText(carValueError)}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.loanBalance[lang]} ($)
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={500}
              value={loanBalance}
              onChange={(e) => setLoanBalance(e.target.value)}
              className={inputClass(loanBalanceError !== null)}
            />
            {loanBalanceError && (
              <p className="mt-1 text-sm text-red-600">{errorText(loanBalanceError)}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.gapCost[lang]} ($)
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={10}
              value={gapCost}
              onChange={(e) => setGapCost(e.target.value)}
              className={inputClass(gapCostError !== null)}
            />
            {gapCostError && <p className="mt-1 text-sm text-red-600">{errorText(gapCostError)}</p>}
          </div>

          {/* Results */}
          {result && (
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">{labels.results[lang]}</h3>

              <div
                className={`rounded-xl p-4 text-white ${result.needsGap ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-green-500 to-emerald-600'}`}
              >
                <div className="text-sm text-white/80">{labels.coverageGap[lang]}</div>
                <div className="text-2xl font-bold">{fmt(result.gap)}</div>
              </div>

              <div
                className={`rounded-lg p-4 border ${result.needsGap ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}
              >
                <div
                  className={`text-sm font-semibold ${result.needsGap ? 'text-orange-700' : 'text-green-700'}`}
                >
                  {result.needsGap ? labels.recommendedYes[lang] : labels.recommendedNo[lang]}
                </div>
                <p className="mt-1 text-sm text-gray-700 leading-relaxed">
                  {result.needsGap ? labels.explainYes[lang] : labels.explainNo[lang]}
                </p>
              </div>

              {result.ratio !== null && result.cost !== null && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 font-medium">
                    {labels.costContext[lang]}
                  </div>
                  <p className="mt-1 text-sm text-gray-700">
                    {labels.costLine[lang]
                      .replace('{cost}', fmt(result.cost))
                      .replace('{exposure}', fmt(result.gap))
                      .replace('{ratio}', result.ratio.toFixed(1))}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={copySummary}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg px-4 py-2 transition-colors"
                >
                  {copied ? labels.copied[lang] : labels.copyResult[lang]}
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

          {!result && (
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={handleReset}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg px-4 py-2 transition-colors"
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
