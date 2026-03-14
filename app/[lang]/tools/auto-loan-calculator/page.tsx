'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface HistoryEntry {
  vehiclePrice: number;
  downPayment: number;
  loanTerm: number;
  rate: number;
  monthlyPayment: number;
  totalInterest: number;
  timestamp: string;
}

const labels: Record<string, Record<string, string>> = {
  vehiclePrice: { en: 'Vehicle Price', it: 'Prezzo del Veicolo', es: 'Precio del Vehículo', fr: 'Prix du Véhicule', de: 'Fahrzeugpreis', pt: 'Preço do Veículo' },
  downPayment: { en: 'Down Payment', it: 'Anticipo', es: 'Enganche', fr: 'Apport Personnel', de: 'Anzahlung', pt: 'Entrada' },
  loanTerm: { en: 'Loan Term (months)', it: 'Durata del Prestito (mesi)', es: 'Plazo del Préstamo (meses)', fr: 'Durée du Prêt (mois)', de: 'Kreditlaufzeit (Monate)', pt: 'Prazo do Empréstimo (meses)' },
  interestRate: { en: 'Interest Rate (%)', it: 'Tasso di Interesse (%)', es: 'Tasa de Interés (%)', fr: 'Taux d\'Intérêt (%)', de: 'Zinssatz (%)', pt: 'Taxa de Juros (%)' },
  calculate: { en: 'Calculate', it: 'Calcola', es: 'Calcular', fr: 'Calculer', de: 'Berechnen', pt: 'Calcular' },
  reset: { en: 'Reset', it: 'Reimposta', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  monthlyPayment: { en: 'Monthly Payment', it: 'Rata Mensile', es: 'Pago Mensual', fr: 'Mensualité', de: 'Monatliche Rate', pt: 'Pagamento Mensal' },
  loanAmount: { en: 'Loan Amount', it: 'Importo del Prestito', es: 'Monto del Préstamo', fr: 'Montant du Prêt', de: 'Darlehensbetrag', pt: 'Valor do Empréstimo' },
  totalInterest: { en: 'Total Interest', it: 'Interessi Totali', es: 'Interés Total', fr: 'Intérêts Totaux', de: 'Gesamtzinsen', pt: 'Juros Totais' },
  totalCost: { en: 'Total Cost', it: 'Costo Totale', es: 'Costo Total', fr: 'Coût Total', de: 'Gesamtkosten', pt: 'Custo Total' },
  amortization: { en: 'Amortization Summary', it: 'Riepilogo Ammortamento', es: 'Resumen de Amortización', fr: 'Résumé d\'Amortissement', de: 'Tilgungsübersicht', pt: 'Resumo da Amortização' },
  year: { en: 'Year', it: 'Anno', es: 'Año', fr: 'Année', de: 'Jahr', pt: 'Ano' },
  principal: { en: 'Principal', it: 'Capitale', es: 'Capital', fr: 'Capital', de: 'Tilgung', pt: 'Capital' },
  interest: { en: 'Interest', it: 'Interessi', es: 'Interés', fr: 'Intérêts', de: 'Zinsen', pt: 'Juros' },
  balance: { en: 'Remaining Balance', it: 'Saldo Residuo', es: 'Saldo Pendiente', fr: 'Solde Restant', de: 'Restschuld', pt: 'Saldo Restante' },
  copy: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier les Résultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
  copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié!', de: 'Kopiert!', pt: 'Copiado!' },
  history: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
  commonTerms: { en: 'Common Terms', it: 'Durate Comuni', es: 'Plazos Comunes', fr: 'Durées Courantes', de: 'Gängige Laufzeiten', pt: 'Prazos Comuns' },
  interestToPrincipal: { en: 'Interest-to-Loan Ratio', it: 'Rapporto Interessi/Prestito', es: 'Relación Interés/Préstamo', fr: 'Ratio Intérêts/Prêt', de: 'Zins-Darlehen-Verhältnis', pt: 'Relação Juros/Empréstimo' },
  totalWithDown: { en: 'Total Out-of-Pocket (incl. down payment)', it: 'Totale Speso (incl. anticipo)', es: 'Total Desembolsado (incl. enganche)', fr: 'Total Déboursé (incl. apport)', de: 'Gesamtausgaben (inkl. Anzahlung)', pt: 'Total Desembolsado (incl. entrada)' },
};

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: {
    title: 'Auto Loan Calculator: Plan Your Car Financing with Confidence',
    paragraphs: [
      'Buying a car is one of the largest purchases most people make, and understanding your auto loan payments is essential for making a smart financial decision. Our auto loan calculator helps you estimate your monthly payment, total interest costs, and overall cost of financing a vehicle before you step into the dealership. By knowing these numbers in advance, you can negotiate better and stay within your budget.',
      'The calculator uses the standard amortization formula to compute monthly payments based on the vehicle price, down payment, loan term in months, and annual interest rate. It subtracts your down payment from the vehicle price to determine the loan amount, then calculates the monthly payment that will fully pay off the loan over the specified term. The amortization summary shows how each year of payments is split between principal reduction and interest charges.',
      'Auto loan terms typically range from 24 to 84 months. Shorter terms mean higher monthly payments but significantly less total interest paid. A 36-month loan might cost you hundreds less in interest compared to a 72-month loan, even though the monthly payment is higher. Our calculator includes quick-select buttons for common loan terms so you can easily compare different scenarios and find the right balance between monthly affordability and total cost.',
      'The down payment is a critical factor in auto financing. A larger down payment reduces the loan amount, which lowers both your monthly payment and total interest paid. Financial experts generally recommend putting at least 20% down on a new car. Our calculator shows you the total out-of-pocket cost including the down payment, so you can see the complete financial picture. Use the interest-to-loan ratio to understand what percentage of your payments goes toward interest versus paying off the vehicle itself.'
    ],
    faq: [
      { q: 'How much should I put down on a car?', a: 'Financial experts recommend a down payment of at least 20% for new cars and 10% for used cars. A larger down payment reduces your monthly payment, total interest paid, and the risk of being underwater on your loan (owing more than the car is worth).' },
      { q: 'What is a good interest rate for an auto loan?', a: 'Auto loan rates depend on your credit score, the loan term, and whether the car is new or used. As of recent years, excellent credit (750+) can qualify for rates around 3-5% for new cars. Good credit (700-749) typically gets 5-7%. Rates for used cars are usually 1-2% higher than new car rates.' },
      { q: 'Is a longer or shorter car loan better?', a: 'A shorter loan term is better financially because you pay significantly less in total interest. However, the monthly payments are higher. A 48-month loan is generally considered a good balance. Avoid loans longer than 72 months, as the extra interest costs and depreciation risk usually outweigh the lower monthly payment.' },
      { q: 'Does the calculator include taxes and fees?', a: 'This calculator computes principal and interest payments only. Sales tax, registration fees, documentation fees, and other costs vary by location and dealer. Add these to the vehicle price or budget for them separately to get an accurate total cost estimate.' },
      { q: 'How does a down payment affect my monthly payment?', a: 'The down payment directly reduces the loan amount, which reduces both your monthly payment and total interest. For example, on a $30,000 car with a $6,000 down payment at 5% for 60 months, your monthly payment would be about $453 versus $566 with no down payment — a savings of $113 per month.' }
    ]
  },
  it: {
    title: 'Calcolatore Prestito Auto: Pianifica il Finanziamento della Tua Auto con Sicurezza',
    paragraphs: [
      'Acquistare un\'auto è uno degli acquisti più importanti che la maggior parte delle persone fa, e capire le rate del prestito auto è essenziale per prendere una decisione finanziaria intelligente. Il nostro calcolatore di prestito auto ti aiuta a stimare la rata mensile, i costi totali degli interessi e il costo complessivo del finanziamento di un veicolo prima di recarti in concessionaria.',
      'Il calcolatore utilizza la formula standard di ammortamento per calcolare le rate mensili in base al prezzo del veicolo, all\'anticipo, alla durata del prestito in mesi e al tasso di interesse annuo. Sottrae l\'anticipo dal prezzo del veicolo per determinare l\'importo del prestito, quindi calcola la rata mensile che estinguerà completamente il prestito nel termine specificato.',
      'Le durate dei prestiti auto vanno tipicamente da 24 a 84 mesi. Durate più brevi significano rate mensili più alte ma significativamente meno interessi totali pagati. Un prestito a 36 mesi potrebbe costarti centinaia di euro in meno di interessi rispetto a uno a 72 mesi. Il nostro calcolatore include pulsanti di selezione rapida per le durate più comuni.',
      'L\'anticipo è un fattore critico nel finanziamento auto. Un anticipo maggiore riduce l\'importo del prestito, abbassando sia la rata mensile che gli interessi totali. Gli esperti finanziari raccomandano generalmente di versare almeno il 20% per un\'auto nuova. Il nostro calcolatore mostra il costo totale incluso l\'anticipo per avere un quadro finanziario completo.'
    ],
    faq: [
      { q: 'Quanto anticipo dovrei versare per un\'auto?', a: 'Gli esperti finanziari raccomandano un anticipo di almeno il 20% per auto nuove e il 10% per auto usate. Un anticipo maggiore riduce la rata mensile, gli interessi totali e il rischio di dovere più del valore dell\'auto.' },
      { q: 'Qual è un buon tasso di interesse per un prestito auto?', a: 'I tassi dipendono dal tuo punteggio di credito, dalla durata del prestito e se l\'auto è nuova o usata. Con ottimo credito si possono ottenere tassi del 3-5% per auto nuove. I tassi per auto usate sono generalmente 1-2% più alti.' },
      { q: 'È meglio un prestito auto più breve o più lungo?', a: 'Un prestito più breve è finanziariamente migliore perché paghi significativamente meno interessi totali. Un prestito a 48 mesi è generalmente considerato un buon equilibrio. Evita prestiti oltre i 72 mesi.' },
      { q: 'Il calcolatore include tasse e commissioni?', a: 'Questo calcolatore calcola solo capitale e interessi. Tasse, commissioni di registrazione e altri costi variano e vanno aggiunti separatamente.' },
      { q: 'Come influisce l\'anticipo sulla rata mensile?', a: 'L\'anticipo riduce direttamente l\'importo del prestito, riducendo sia la rata mensile che gli interessi totali. Su un\'auto da 30.000 € con 6.000 € di anticipo al 5% per 60 mesi, la rata sarebbe circa 453 € contro 566 € senza anticipo.' }
    ]
  },
  es: {
    title: 'Calculadora de Préstamo de Auto: Planifica Tu Financiamiento con Confianza',
    paragraphs: [
      'Comprar un auto es una de las compras más grandes que la mayoría de las personas hace, y entender los pagos del préstamo es esencial para tomar una decisión financiera inteligente. Nuestra calculadora de préstamo de auto te ayuda a estimar tu pago mensual, los costos totales de intereses y el costo general del financiamiento antes de ir al concesionario.',
      'La calculadora usa la fórmula estándar de amortización para calcular los pagos mensuales basándose en el precio del vehículo, el enganche, el plazo del préstamo en meses y la tasa de interés anual. Resta el enganche del precio del vehículo para determinar el monto del préstamo y calcula el pago mensual que liquidará completamente el préstamo en el plazo especificado.',
      'Los plazos de préstamos de auto típicamente van de 24 a 84 meses. Plazos más cortos significan pagos mensuales más altos pero significativamente menos interés total. Un préstamo a 36 meses podría costarte cientos menos en intereses comparado con uno a 72 meses. Nuestra calculadora incluye botones de selección rápida para plazos comunes.',
      'El enganche es un factor crítico en el financiamiento automotriz. Un enganche mayor reduce el monto del préstamo, lo que disminuye tanto el pago mensual como los intereses totales. Los expertos recomiendan dar al menos 20% de enganche para un auto nuevo. La calculadora muestra el costo total incluyendo el enganche para ver el panorama financiero completo.'
    ],
    faq: [
      { q: '¿Cuánto enganche debo dar por un auto?', a: 'Los expertos financieros recomiendan un enganche de al menos 20% para autos nuevos y 10% para usados. Un enganche mayor reduce el pago mensual, los intereses totales y el riesgo de deber más de lo que vale el auto.' },
      { q: '¿Cuál es una buena tasa de interés para un préstamo de auto?', a: 'Las tasas dependen de tu puntaje crediticio, el plazo y si el auto es nuevo o usado. Con excelente crédito se pueden obtener tasas de 3-5% para autos nuevos. Las tasas para usados son generalmente 1-2% más altas.' },
      { q: '¿Es mejor un préstamo de auto más corto o más largo?', a: 'Un préstamo más corto es mejor financieramente porque pagas significativamente menos en intereses totales. Un préstamo a 48 meses es generalmente un buen equilibrio. Evita préstamos de más de 72 meses.' },
      { q: '¿La calculadora incluye impuestos y comisiones?', a: 'Esta calculadora calcula solo capital e intereses. Impuestos, comisiones de registro y otros costos varían y deben agregarse por separado.' },
      { q: '¿Cómo afecta el enganche al pago mensual?', a: 'El enganche reduce directamente el monto del préstamo, reduciendo tanto el pago mensual como los intereses totales. En un auto de $30,000 con $6,000 de enganche al 5% por 60 meses, el pago sería aproximadamente $453 contra $566 sin enganche.' }
    ]
  },
  fr: {
    title: 'Calculateur de Prêt Auto : Planifiez Votre Financement en Toute Confiance',
    paragraphs: [
      'L\'achat d\'une voiture est l\'un des plus gros achats que la plupart des gens font, et comprendre vos mensualités de prêt auto est essentiel pour prendre une décision financière avisée. Notre calculateur de prêt auto vous aide à estimer votre mensualité, les coûts totaux d\'intérêts et le coût global du financement d\'un véhicule avant de vous rendre chez le concessionnaire.',
      'Le calculateur utilise la formule standard d\'amortissement pour calculer les mensualités basées sur le prix du véhicule, l\'apport personnel, la durée du prêt en mois et le taux d\'intérêt annuel. Il soustrait votre apport du prix du véhicule pour déterminer le montant du prêt, puis calcule la mensualité qui remboursera entièrement le prêt sur la durée spécifiée.',
      'Les durées de prêt auto vont typiquement de 24 à 84 mois. Des durées plus courtes signifient des mensualités plus élevées mais significativement moins d\'intérêts totaux. Un prêt sur 36 mois pourrait vous coûter des centaines d\'euros de moins en intérêts par rapport à un prêt sur 72 mois. Notre calculateur inclut des boutons de sélection rapide pour les durées courantes.',
      'L\'apport personnel est un facteur critique dans le financement auto. Un apport plus important réduit le montant du prêt, ce qui diminue à la fois la mensualité et les intérêts totaux. Les experts financiers recommandent généralement de verser au moins 20% pour une voiture neuve.'
    ],
    faq: [
      { q: 'Combien d\'apport dois-je verser pour une voiture ?', a: 'Les experts recommandent un apport d\'au moins 20% pour les voitures neuves et 10% pour les occasions. Un apport plus important réduit la mensualité, les intérêts totaux et le risque de devoir plus que la valeur du véhicule.' },
      { q: 'Quel est un bon taux d\'intérêt pour un prêt auto ?', a: 'Les taux dépendent de votre cote de crédit, de la durée et de l\'état du véhicule. Avec un excellent crédit, on peut obtenir des taux de 3-5% pour les voitures neuves. Les taux pour les occasions sont généralement 1-2% plus élevés.' },
      { q: 'Un prêt auto court ou long est-il préférable ?', a: 'Un prêt plus court est financièrement meilleur car vous payez significativement moins d\'intérêts au total. Un prêt sur 48 mois est généralement un bon équilibre. Évitez les prêts de plus de 72 mois.' },
      { q: 'Le calculateur inclut-il les taxes et frais ?', a: 'Ce calculateur ne calcule que le capital et les intérêts. Les taxes, frais d\'immatriculation et autres coûts varient et doivent être ajoutés séparément.' },
      { q: 'Comment l\'apport affecte-t-il la mensualité ?', a: 'L\'apport réduit directement le montant du prêt, réduisant la mensualité et les intérêts totaux. Sur une voiture à 30 000 € avec 6 000 € d\'apport à 5% sur 60 mois, la mensualité serait d\'environ 453 € contre 566 € sans apport.' }
    ]
  },
  de: {
    title: 'Autokredit-Rechner: Planen Sie Ihre Autofinanzierung mit Zuversicht',
    paragraphs: [
      'Der Kauf eines Autos ist eine der größten Anschaffungen, die die meisten Menschen tätigen, und das Verständnis Ihrer Autokreditraten ist entscheidend für eine kluge finanzielle Entscheidung. Unser Autokredit-Rechner hilft Ihnen, Ihre monatliche Rate, die Gesamtzinskosten und die Gesamtkosten der Fahrzeugfinanzierung zu schätzen, bevor Sie zum Händler gehen.',
      'Der Rechner verwendet die Standard-Tilgungsformel zur Berechnung der monatlichen Raten basierend auf dem Fahrzeugpreis, der Anzahlung, der Kreditlaufzeit in Monaten und dem jährlichen Zinssatz. Er zieht Ihre Anzahlung vom Fahrzeugpreis ab, um den Darlehensbetrag zu ermitteln, und berechnet dann die monatliche Rate, die das Darlehen über die angegebene Laufzeit vollständig tilgt.',
      'Autokreditlaufzeiten reichen typischerweise von 24 bis 84 Monaten. Kürzere Laufzeiten bedeuten höhere monatliche Raten, aber deutlich weniger Gesamtzinsen. Ein 36-Monats-Kredit könnte Hunderte Euro weniger an Zinsen kosten als ein 72-Monats-Kredit. Unser Rechner enthält Schnellauswahl-Buttons für gängige Laufzeiten.',
      'Die Anzahlung ist ein kritischer Faktor bei der Autofinanzierung. Eine größere Anzahlung reduziert den Darlehensbetrag, was sowohl die monatliche Rate als auch die Gesamtzinsen senkt. Finanzexperten empfehlen generell mindestens 20% Anzahlung für einen Neuwagen. Unser Rechner zeigt die Gesamtausgaben inklusive Anzahlung.'
    ],
    faq: [
      { q: 'Wie viel Anzahlung sollte ich für ein Auto leisten?', a: 'Finanzexperten empfehlen eine Anzahlung von mindestens 20% für Neuwagen und 10% für Gebrauchtwagen. Eine größere Anzahlung reduziert die monatliche Rate, die Gesamtzinsen und das Risiko, mehr zu schulden als das Auto wert ist.' },
      { q: 'Was ist ein guter Zinssatz für einen Autokredit?', a: 'Zinssätze hängen von Ihrer Bonität, der Laufzeit und dem Fahrzeugzustand ab. Bei ausgezeichneter Bonität sind Zinssätze von 3-5% für Neuwagen möglich. Zinssätze für Gebrauchtwagen sind typischerweise 1-2% höher.' },
      { q: 'Ist ein kürzerer oder längerer Autokredit besser?', a: 'Ein kürzerer Kredit ist finanziell besser, da Sie deutlich weniger Gesamtzinsen zahlen. Ein 48-Monats-Kredit gilt allgemein als guter Kompromiss. Vermeiden Sie Kredite über 72 Monate.' },
      { q: 'Berücksichtigt der Rechner Steuern und Gebühren?', a: 'Dieser Rechner berechnet nur Kapital und Zinsen. Steuern, Zulassungsgebühren und andere Kosten variieren und müssen separat hinzugefügt werden.' },
      { q: 'Wie wirkt sich die Anzahlung auf die monatliche Rate aus?', a: 'Die Anzahlung reduziert direkt den Darlehensbetrag und damit sowohl die monatliche Rate als auch die Gesamtzinsen. Bei einem 30.000 € Auto mit 6.000 € Anzahlung bei 5% über 60 Monate beträgt die Rate etwa 453 € gegenüber 566 € ohne Anzahlung.' }
    ]
  },
  pt: {
    title: 'Calculadora de Empréstimo Auto: Planeje Seu Financiamento com Confiança',
    paragraphs: [
      'Comprar um carro é uma das maiores compras que a maioria das pessoas faz, e entender os pagamentos do empréstimo auto é essencial para tomar uma decisão financeira inteligente. A nossa calculadora de empréstimo auto ajuda a estimar o pagamento mensal, os custos totais de juros e o custo geral do financiamento de um veículo antes de ir à concessionária.',
      'A calculadora usa a fórmula padrão de amortização para calcular os pagamentos mensais com base no preço do veículo, na entrada, no prazo do empréstimo em meses e na taxa de juros anual. Subtrai a entrada do preço do veículo para determinar o valor do empréstimo e calcula o pagamento mensal que quitará completamente o empréstimo no prazo especificado.',
      'Os prazos de empréstimo auto vão tipicamente de 24 a 84 meses. Prazos mais curtos significam pagamentos mensais mais altos mas significativamente menos juros totais. Um empréstimo de 36 meses poderia custar centenas a menos em juros comparado com um de 72 meses. A nossa calculadora inclui botões de seleção rápida para prazos comuns.',
      'A entrada é um fator crítico no financiamento auto. Uma entrada maior reduz o valor do empréstimo, diminuindo tanto o pagamento mensal quanto os juros totais. Especialistas recomendam dar pelo menos 20% de entrada para um carro novo. A calculadora mostra o custo total incluindo a entrada para ver o quadro financeiro completo.'
    ],
    faq: [
      { q: 'Quanto de entrada devo dar por um carro?', a: 'Especialistas recomendam uma entrada de pelo menos 20% para carros novos e 10% para usados. Uma entrada maior reduz o pagamento mensal, os juros totais e o risco de dever mais do que o carro vale.' },
      { q: 'Qual é uma boa taxa de juros para empréstimo auto?', a: 'As taxas dependem do seu score de crédito, do prazo e se o carro é novo ou usado. Com excelente crédito, pode-se obter taxas de 3-5% para carros novos. Taxas para usados são geralmente 1-2% mais altas.' },
      { q: 'É melhor um empréstimo auto mais curto ou mais longo?', a: 'Um empréstimo mais curto é financeiramente melhor porque paga significativamente menos em juros totais. Um empréstimo de 48 meses é geralmente um bom equilíbrio. Evite empréstimos acima de 72 meses.' },
      { q: 'A calculadora inclui impostos e taxas?', a: 'Esta calculadora calcula apenas capital e juros. Impostos, taxas de registro e outros custos variam e devem ser adicionados separadamente.' },
      { q: 'Como a entrada afeta o pagamento mensal?', a: 'A entrada reduz diretamente o valor do empréstimo, reduzindo tanto o pagamento mensal quanto os juros totais. Num carro de 30.000 € com 6.000 € de entrada a 5% por 60 meses, o pagamento seria cerca de 453 € contra 566 € sem entrada.' }
    ]
  },
};

export default function AutoLoanCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['auto-loan-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [vehiclePrice, setVehiclePrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [loanTerm, setLoanTerm] = useState('60');
  const [rate, setRate] = useState('');
  const [result, setResult] = useState<{
    loanAmount: number;
    monthlyPayment: number;
    totalInterest: number;
    totalCost: number;
    totalWithDown: number;
    amortization: { year: number; principalPaid: number; interestPaid: number; balance: number }[];
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const commonTerms = [24, 36, 48, 60, 72, 84];

  const calculate = () => {
    const price = parseFloat(vehiclePrice);
    const down = parseFloat(downPayment) || 0;
    const months = parseInt(loanTerm);
    const annualRate = parseFloat(rate);
    if (isNaN(price) || isNaN(months) || isNaN(annualRate) || price <= 0 || months <= 0 || annualRate < 0) return;
    if (down >= price) return;

    const loanAmount = price - down;
    let monthlyPayment: number;
    let totalPaid: number;

    if (annualRate === 0) {
      monthlyPayment = loanAmount / months;
      totalPaid = loanAmount;
    } else {
      const monthlyRate = annualRate / 100 / 12;
      monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
      totalPaid = monthlyPayment * months;
    }

    const totalInterest = totalPaid - loanAmount;
    const totalCost = totalPaid;
    const totalWithDown = totalPaid + down;

    // Build amortization by year
    const amortization: { year: number; principalPaid: number; interestPaid: number; balance: number }[] = [];
    if (annualRate > 0) {
      const monthlyRate = annualRate / 100 / 12;
      let bal = loanAmount;
      const totalYears = Math.ceil(months / 12);
      for (let y = 1; y <= totalYears; y++) {
        let yPrincipal = 0;
        let yInterest = 0;
        const monthsInYear = Math.min(12, months - (y - 1) * 12);
        for (let m = 0; m < monthsInYear; m++) {
          const intPart = bal * monthlyRate;
          const prinPart = monthlyPayment - intPart;
          yInterest += intPart;
          yPrincipal += prinPart;
          bal -= prinPart;
        }
        amortization.push({ year: y, principalPaid: yPrincipal, interestPaid: yInterest, balance: Math.max(bal, 0) });
      }
    }

    setResult({ loanAmount, monthlyPayment, totalInterest, totalCost, totalWithDown, amortization });
    setHistory(prev => [{
      vehiclePrice: price,
      downPayment: down,
      loanTerm: months,
      rate: annualRate,
      monthlyPayment,
      totalInterest,
      timestamp: new Date().toLocaleTimeString(),
    }, ...prev].slice(0, 5));
  };

  const handleReset = () => {
    setVehiclePrice('');
    setDownPayment('');
    setLoanTerm('60');
    setRate('');
    setResult(null);
  };

  const copyResults = () => {
    if (!result) return;
    const text = `${t('monthlyPayment')}: $${result.monthlyPayment.toFixed(2)}\n${t('loanAmount')}: $${result.loanAmount.toFixed(2)}\n${t('totalInterest')}: $${result.totalInterest.toFixed(2)}\n${t('totalCost')}: $${result.totalCost.toFixed(2)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const seo = seoContent[lang];
  const interestRatio = result && result.loanAmount > 0 ? (result.totalInterest / result.loanAmount) * 100 : 0;

  return (
    <ToolPageWrapper toolSlug="auto-loan-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('vehiclePrice')}</label>
            <input type="number" value={vehiclePrice} onChange={(e) => setVehiclePrice(e.target.value)} placeholder="30000"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('downPayment')}</label>
            <input type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} placeholder="5000"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('loanTerm')}</label>
            <input type="number" value={loanTerm} onChange={(e) => setLoanTerm(e.target.value)} placeholder="60"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs text-gray-500 self-center">{t('commonTerms')}:</span>
              {commonTerms.map(term => (
                <button key={term} onClick={() => setLoanTerm(String(term))}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${loanTerm === String(term) ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                  {term} {t('months') ? t('months').toLowerCase().slice(0, 2) : 'mo'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('interestRate')}</label>
            <input type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="5.5"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div className="flex gap-2">
            <button onClick={calculate} className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2.5 font-medium hover:bg-blue-700 transition-colors">{t('calculate')}</button>
            <button onClick={handleReset} className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>

          {result && (
            <div className="space-y-4 mt-4">
              {/* Main result */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                <div className="text-xs text-blue-600 font-medium">{t('monthlyPayment')}</div>
                <div className="text-3xl font-bold text-blue-700">${result.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500 font-medium">{t('loanAmount')}</div>
                  <div className="text-lg font-bold text-gray-900">${result.loanAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                  <div className="text-xs text-red-600 font-medium">{t('totalInterest')}</div>
                  <div className="text-lg font-bold text-red-700">${result.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center sm:col-span-1 col-span-2">
                  <div className="text-xs text-green-600 font-medium">{t('totalCost')}</div>
                  <div className="text-lg font-bold text-green-700">${result.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              </div>

              {/* Total with down payment */}
              {parseFloat(downPayment) > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
                  <div className="text-xs text-purple-600 font-medium">{t('totalWithDown')}</div>
                  <div className="text-lg font-bold text-purple-700">${result.totalWithDown.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              )}

              {/* Interest ratio */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                <span className="text-sm text-gray-600">{t('interestToPrincipal')}: </span>
                <span className={`text-lg font-bold ${interestRatio > 30 ? 'text-red-600' : interestRatio > 15 ? 'text-yellow-600' : 'text-green-600'}`}>{interestRatio.toFixed(1)}%</span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden flex">
                  <div className="h-full bg-blue-500" style={{ width: `${(result.loanAmount / result.totalCost) * 100}%` }}></div>
                  <div className="h-full bg-red-400" style={{ width: `${(result.totalInterest / result.totalCost) * 100}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span className="text-blue-600">{t('principal')}: {((result.loanAmount / result.totalCost) * 100).toFixed(1)}%</span>
                  <span className="text-red-600">{t('interest')}: {((result.totalInterest / result.totalCost) * 100).toFixed(1)}%</span>
                </div>
              </div>

              <button onClick={copyResults} className="w-full py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                {copied ? (
                  <><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{t('copied')}</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>{t('copy')}</>
                )}
              </button>

              {/* Amortization table */}
              {result.amortization.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('amortization')}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-2 py-1 text-left">{t('year')}</th>
                          <th className="px-2 py-1 text-right">{t('principal')}</th>
                          <th className="px-2 py-1 text-right">{t('interest')}</th>
                          <th className="px-2 py-1 text-right">{t('balance')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.amortization.map((row) => (
                          <tr key={row.year} className="border-t border-gray-100">
                            <td className="px-2 py-1">{row.year}</td>
                            <td className="px-2 py-1 text-right text-blue-600">${row.principalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-2 py-1 text-right text-red-600">${row.interestPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-2 py-1 text-right">${row.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('history')}</h3>
              <div className="space-y-1">
                {history.map((entry, i) => (
                  <div key={i} className="flex justify-between text-sm text-gray-600 bg-white rounded px-3 py-1.5 border border-gray-100">
                    <span>${entry.vehiclePrice.toLocaleString()} - ${entry.downPayment.toLocaleString()} @ {entry.rate}% / {entry.loanTerm}mo</span>
                    <span className="font-semibold text-blue-600">${entry.monthlyPayment.toFixed(2)}/mo</span>
                    <span className="text-gray-400">{entry.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
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