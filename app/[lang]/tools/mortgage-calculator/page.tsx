'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface HistoryEntry { monthly: number; totalInterest: number; loanAmount: number; timestamp: string; }

const labels: Record<string, Record<Locale, string>> = {
  propertyValue: { en: 'Property Value', it: 'Valore Immobile', es: 'Valor de la Propiedad', fr: 'Valeur du Bien', de: 'Immobilienwert', pt: 'Valor do Imóvel' },
  downPayment: { en: 'Down Payment', it: 'Anticipo', es: 'Entrada', fr: 'Apport', de: 'Anzahlung', pt: 'Entrada' },
  interestRate: { en: 'Interest Rate (%/year)', it: 'Tasso d\'Interesse (%/anno)', es: 'Tasa de Interés (%/año)', fr: 'Taux d\'Intérêt (%/an)', de: 'Zinssatz (%/Jahr)', pt: 'Taxa de Juros (%/ano)' },
  years: { en: 'Loan Term (years)', it: 'Durata (anni)', es: 'Plazo (años)', fr: 'Durée (années)', de: 'Laufzeit (Jahre)', pt: 'Prazo (anos)' },
  monthlyPayment: { en: 'Monthly Payment', it: 'Rata Mensile', es: 'Pago Mensual', fr: 'Mensualité', de: 'Monatliche Rate', pt: 'Parcela Mensal' },
  loanAmount: { en: 'Loan Amount', it: 'Importo Prestito', es: 'Monto del Préstamo', fr: 'Montant du Prêt', de: 'Darlehensbetrag', pt: 'Valor do Empréstimo' },
  totalInterest: { en: 'Total Interest', it: 'Interessi Totali', es: 'Interés Total', fr: 'Intérêts Totaux', de: 'Gesamtzinsen', pt: 'Juros Totais' },
  totalCost: { en: 'Total Cost', it: 'Costo Totale', es: 'Costo Total', fr: 'Coût Total', de: 'Gesamtkosten', pt: 'Custo Total' },
  reset: { en: 'Reset', it: 'Reimposta', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  copy: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier les Résultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
  copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié!', de: 'Kopiert!', pt: 'Copiado!' },
  history: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
  downPaymentPct: { en: 'Down Payment %', it: '% Anticipo', es: '% Entrada', fr: '% Apport', de: '% Anzahlung', pt: '% Entrada' },
  invalidDp: { en: 'Down payment exceeds property value', it: 'Anticipo supera il valore', es: 'Entrada supera el valor', fr: 'Apport dépasse la valeur', de: 'Anzahlung übersteigt Wert', pt: 'Entrada excede o valor' },
};

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: { title: 'Free Mortgage Calculator: Estimate Your Monthly Home Payment', paragraphs: [
    'A mortgage is the largest financial commitment most people make in their lifetime. Understanding how your monthly payment is calculated — and how different factors affect it — is essential for making a sound home-buying decision. The key variables are the property price, your down payment, the interest rate, and the loan term in years. Even small changes to any of these inputs can shift your total cost by tens of thousands of dollars.',
    'Our mortgage calculator uses the standard amortization formula M = P[r(1+r)^n]/[(1+r)^n-1] to estimate your monthly payment, total interest costs, and the overall price you will pay for your home over the life of the loan. By adjusting the down payment or interest rate, you can see how even small changes dramatically impact your total cost. A larger down payment reduces both your monthly payment and total interest, while a lower interest rate can save you tens of thousands over the loan term.',
    'Before committing to a mortgage, use this calculator to compare different scenarios. Try different loan terms — 15, 20, 25, or 30 years — to see how each affects your monthly budget and total cost. Remember that the monthly payment shown here covers only principal and interest; your actual payment may include property taxes, homeowner insurance, and possibly private mortgage insurance (PMI) if your down payment is less than 20%.',
    'For a deeper analysis of how your payments are distributed between principal and interest each month, try our <a href="/${lang}/tools/mortgage-amortization">amortization schedule calculator</a>. If you are also comparing personal or auto financing, our <a href="/${lang}/tools/loan-calculator">loan calculator</a> can help you evaluate those options side by side. And to understand how your savings can grow over time to fund a future down payment, check the <a href="/${lang}/tools/compound-interest-calculator">compound interest calculator</a>.'
  ], faq: [
    { q: 'How much down payment do I need for a mortgage?', a: 'Conventional mortgages typically require 10-20% down. Some government-backed loans (FHA, VA, USDA) allow as little as 3-5% down. A larger down payment reduces your loan amount, lowers your monthly payment, eliminates the need for private mortgage insurance (PMI), and saves you thousands in total interest over the life of the loan.' },
    { q: 'What is the difference between a 15-year and 30-year mortgage?', a: 'A 15-year mortgage has higher monthly payments but costs significantly less in total interest — often saving you 50-60% compared to a 30-year loan. For example, on a $300,000 mortgage at 6%, a 15-year term costs about $156,000 in interest, while a 30-year term costs roughly $347,000. A 30-year mortgage is more affordable monthly but nearly doubles the total interest paid.' },
    { q: 'How does the interest rate affect my mortgage cost?', a: 'Even a 0.5% difference in interest rate can change your total cost by tens of thousands of dollars. For a $250,000 loan over 25 years, going from 3.5% to 4% adds roughly $25,000 in total interest. This is why shopping around for the best rate and improving your credit score before applying can yield substantial long-term savings on your mortgage.' },
    { q: 'Does this mortgage calculator include property taxes and insurance?', a: 'This calculator estimates principal and interest payments only. Property taxes, homeowner insurance, private mortgage insurance (PMI), and HOA fees are additional costs that vary by location and lender. As a rule of thumb, budget an extra 1-2% of the property value annually for taxes and insurance combined, and add that to your monthly estimate.' },
    { q: 'Can I pay off my mortgage faster by making extra payments?', a: 'Yes. Even small additional monthly payments toward the principal can significantly reduce your total interest and shorten the loan term. For example, adding just $100 per month extra to a $250,000 mortgage at 6% over 30 years can save you over $45,000 in interest and cut roughly 5 years off the loan. Use our amortization calculator to model different extra-payment scenarios.' }
  ] },
  it: { title: 'Calcolatore Mutuo: Come Calcolare la Rata Mensile del Mutuo Casa', paragraphs: [
    'Il mutuo rappresenta il piu grande impegno finanziario nella vita della maggior parte delle persone. Capire come viene calcolata la rata mensile e come i diversi fattori la influenzano e fondamentale per prendere una decisione immobiliare consapevole. Le variabili chiave sono il prezzo dell\'immobile, l\'anticipo versato, il tasso di interesse e la durata del finanziamento. In Italia, i mutui a tasso fisso hanno durate tipiche di 20, 25 o 30 anni, mentre quelli a tasso variabile seguono l\'andamento dell\'Euribor.',
    'Il nostro calcolatore mutuo utilizza la formula standard di ammortamento alla francese per stimare la rata mensile costante, gli interessi totali e il costo complessivo dell\'abitazione. Modificando l\'anticipo o il tasso di interesse, puoi vedere come anche piccole variazioni impattano significativamente sul costo totale. Un anticipo maggiore riduce sia la rata mensile che gli interessi complessivi, mentre un tasso piu basso puo farti risparmiare decine di migliaia di euro sulla durata del mutuo.',
    'Prima di impegnarti in un mutuo, usa questo calcolatore per confrontare diversi scenari. Prova durate diverse — 15, 20, 25 o 30 anni — per vedere come ciascuna influenza il tuo budget mensile e il costo totale. Ricorda che la rata calcolata qui copre solo capitale e interessi; la rata effettiva potrebbe includere anche le spese di istruttoria, la perizia, l\'assicurazione incendio e scoppio obbligatoria e l\'imposta sostitutiva.',
    'Per un\'analisi dettagliata di come le rate si distribuiscono tra capitale e interessi mese per mese, prova il nostro <a href="/${lang}/tools/mortgage-amortization">calcolatore piano di ammortamento</a>. Se stai valutando anche prestiti personali o finanziamenti auto, il nostro <a href="/${lang}/tools/loan-calculator">calcolatore prestiti</a> puo aiutarti nel confronto. Per capire come far crescere i risparmi per un futuro anticipo, consulta il <a href="/${lang}/tools/compound-interest-calculator">calcolatore interesse composto</a>.'
  ], faq: [
    { q: 'Quanto anticipo serve per un mutuo in Italia?', a: 'In Italia le banche finanziano generalmente fino all\'80% del valore dell\'immobile (LTV), quindi serve almeno il 20% di anticipo. Alcuni istituti offrono mutui al 100% per giovani under 36 con garanzia del Fondo di Garanzia Prima Casa. Un anticipo maggiore riduce l\'importo del mutuo, la rata mensile e gli interessi totali pagati nel corso degli anni.' },
    { q: 'Qual e la differenza tra mutuo a tasso fisso e variabile?', a: 'Il mutuo a tasso fisso mantiene la stessa rata per tutta la durata, offrendo prevedibilita. Il mutuo a tasso variabile segue l\'andamento dell\'Euribor e puo avere una rata iniziale piu bassa che pero fluttua nel tempo. In periodi di tassi bassi il variabile conviene, ma comporta il rischio di aumenti futuri. Molti italiani preferiscono il tasso fisso per la sicurezza.' },
    { q: 'Come influisce il tasso di interesse sul costo del mutuo?', a: 'Anche una differenza dello 0,5% nel tasso puo cambiare il costo totale di migliaia di euro. Per un mutuo da 200.000 euro a 25 anni, passare dal 3% al 3,5% aggiunge circa 16.000 euro di interessi totali. Per questo e fondamentale confrontare le offerte di piu banche e considerare la surroga se i tassi scendono durante la vita del mutuo.' },
    { q: 'Questo calcolatore mutuo include tasse e assicurazioni?', a: 'Questo calcolatore stima solo le rate di capitale e interessi. I costi effettivi di un mutuo includono anche l\'imposta sostitutiva (0,25% per prima casa), le spese di perizia, la polizza incendio e scoppio obbligatoria, e eventuali spese notarili. Come regola generale, prevedi un 2-3% extra del valore finanziato per queste spese accessorie.' },
    { q: 'Posso estinguere il mutuo anticipatamente?', a: 'Si, in Italia la legge Bersani (2007) ha eliminato le penali per estinzione anticipata dei mutui a tasso variabile e le ha limitate per il tasso fisso. Anche piccoli pagamenti aggiuntivi verso il capitale possono ridurre significativamente gli interessi totali e accorciare la durata del mutuo. Usa il nostro calcolatore di ammortamento per simulare scenari di estinzione anticipata.' }
  ] },
  es: { title: 'Calculadora Hipotecaria: Como Calcular tu Cuota Mensual', paragraphs: [
    'La hipoteca es el mayor compromiso financiero que la mayoria de personas asumen en su vida. Entender como se calcula la cuota mensual y como los diferentes factores la afectan es esencial para tomar una decision inmobiliaria inteligente. Las variables clave son el precio de la propiedad, la entrada, el tipo de interes y el plazo del prestamo. En Espana e Latinoamerica, los plazos mas comunes son 20, 25 y 30 anos.',
    'Nuestra calculadora hipotecaria utiliza la formula estandar de amortizacion para estimar tu cuota mensual, los intereses totales y el precio total que pagaras por tu vivienda. Ajustando la entrada o el tipo de interes, puedes ver como incluso pequenos cambios impactan dramaticamente en el costo total. Una entrada mayor reduce tanto la cuota mensual como los intereses totales, mientras que un tipo mas bajo puede ahorrarte decenas de miles.',
    'Antes de comprometerte con una hipoteca, usa esta calculadora para comparar diferentes escenarios. Prueba diferentes plazos — 15, 20, 25 o 30 anos — para ver como cada uno afecta tu presupuesto mensual y el costo total. Recuerda que la cuota mostrada cubre solo capital e intereses; tu pago real puede incluir seguros e impuestos.',
    'Para un analisis detallado de como se distribuyen tus pagos entre capital e intereses mes a mes, prueba nuestra <a href="/${lang}/tools/mortgage-amortization">calculadora de amortizacion</a>. Si tambien evaluas prestamos personales o de auto, nuestra <a href="/${lang}/tools/loan-calculator">calculadora de prestamos</a> te ayudara a comparar. Para entender como tus ahorros pueden crecer para un futuro enganche, consulta la <a href="/${lang}/tools/compound-interest-calculator">calculadora de interes compuesto</a>.'
  ], faq: [
    { q: 'Cuanta entrada necesito para una hipoteca?', a: 'En Espana, los bancos financian hasta el 80% del valor de tasacion, por lo que necesitas al menos un 20% de entrada mas los gastos asociados (impuestos, notaria, registro). En Latinoamerica los porcentajes varian segun el pais. Una entrada mayor reduce el importe del prestamo, la cuota mensual y los intereses totales significativamente.' },
    { q: 'Cual es la diferencia entre una hipoteca a 15 y a 30 anos?', a: 'Una hipoteca a 15 anos tiene cuotas mas altas pero cuesta significativamente menos en intereses totales, ahorrando entre un 50-60% respecto a un plazo de 30 anos. Por ejemplo, en un prestamo de 200.000 euros al 4%, un plazo de 15 anos cuesta unos 66.000 euros en intereses, mientras que a 30 anos cuesta unos 144.000 euros.' },
    { q: 'Como afecta el tipo de interes al costo de la hipoteca?', a: 'Incluso una diferencia del 0,5% en el tipo de interes puede cambiar el costo total en decenas de miles. Para un prestamo de 200.000 euros a 25 anos, pasar del 3% al 3,5% anade aproximadamente 15.000 euros en intereses totales. Por eso es crucial comparar ofertas de varios bancos antes de firmar.' },
    { q: 'Esta calculadora incluye impuestos y seguros?', a: 'Esta calculadora estima solo las cuotas de capital e intereses. Los costos adicionales incluyen el Impuesto de Actos Juridicos Documentados, gastos de notaria, registro de la propiedad y seguro de hogar. Calcula un 10-12% adicional sobre el valor de compra para cubrir todos estos gastos en Espana.' },
    { q: 'Puedo amortizar la hipoteca anticipadamente?', a: 'Si. En Espana la ley permite amortizar anticipadamente con comisiones limitadas (maximo 0,25-0,50% dependiendo del tipo de hipoteca). Incluso pequenas aportaciones extra al capital cada mes o ano pueden reducir significativamente los intereses totales y acortar el plazo. Usa nuestra calculadora de amortizacion para simular estos escenarios.' }
  ] },
  fr: { title: 'Calculateur Hypothecaire: Comment Calculer Votre Mensualite de Pret Immobilier', paragraphs: [
    'Le pret immobilier est le plus grand engagement financier que la plupart des gens prennent dans leur vie. Comprendre comment votre mensualite est calculee et comment les differents facteurs l\'influencent est essentiel pour prendre une decision d\'achat eclairee. Les variables cles sont le prix du bien, votre apport personnel, le taux d\'interet et la duree du pret. En France, les durees courantes sont 15, 20 et 25 ans.',
    'Notre calculateur hypothecaire utilise la formule standard d\'amortissement pour estimer votre mensualite, le cout total des interets et le prix global de votre bien sur la duree du pret. En ajustant l\'apport ou le taux, vous pouvez voir comment meme de petites modifications impactent considerablement le cout total. Un apport plus important reduit la mensualite et les interets, tandis qu\'un taux plus bas peut vous faire economiser des dizaines de milliers d\'euros.',
    'Avant de vous engager dans un pret immobilier, utilisez ce calculateur pour comparer differents scenarios. Essayez differentes durees — 15, 20 ou 25 ans — pour voir comment chacune affecte votre budget mensuel et le cout total. N\'oubliez pas que la mensualite affichee ne couvre que le capital et les interets; votre paiement reel peut inclure l\'assurance emprunteur obligatoire et les frais de garantie.',
    'Pour une analyse detaillee de la repartition capital/interets mois par mois, essayez notre <a href="/${lang}/tools/mortgage-amortization">calculateur de tableau d\'amortissement</a>. Si vous comparez egalement des prets a la consommation, notre <a href="/${lang}/tools/loan-calculator">calculateur de pret</a> vous aidera. Pour comprendre comment faire fructifier votre epargne pour un futur apport, consultez le <a href="/${lang}/tools/compound-interest-calculator">calculateur d\'interets composes</a>.'
  ], faq: [
    { q: 'Quel apport personnel faut-il pour un pret immobilier en France?', a: 'En France, les banques demandent generalement un apport de 10 a 20% du prix du bien, plus les frais de notaire (7-8% dans l\'ancien, 2-3% dans le neuf). Certains dispositifs permettent d\'emprunter avec un apport reduit, notamment le Pret a Taux Zero (PTZ) pour les primo-accedants. Un apport plus important permet d\'obtenir un meilleur taux et de reduire le cout total du credit.' },
    { q: 'Quelle est la difference entre un pret sur 15 et 25 ans?', a: 'Un pret sur 15 ans a des mensualites plus elevees mais coute nettement moins en interets totaux — souvent 50 a 60% d\'economie par rapport a un pret sur 25 ans. Par exemple, pour un emprunt de 250.000 euros a 3,5%, un pret sur 15 ans coute environ 72.000 euros d\'interets contre 125.000 euros sur 25 ans. Le HCSF limite le taux d\'endettement a 35% en France.' },
    { q: 'Comment le taux d\'interet affecte-t-il le cout du pret?', a: 'Meme 0,5% de difference dans le taux peut changer le cout total de milliers d\'euros. Pour un pret de 200.000 euros sur 20 ans, passer de 3% a 3,5% ajoute environ 11.000 euros d\'interets. C\'est pourquoi comparer les offres de plusieurs banques et faire jouer la concurrence via un courtier peut generer des economies substantielles.' },
    { q: 'Ce calculateur inclut-il l\'assurance emprunteur?', a: 'Ce calculateur estime uniquement les mensualites de capital et interets. En France, l\'assurance emprunteur est obligatoire et represente en moyenne 0,3 a 0,5% du capital emprunte par an. Depuis la loi Lemoine (2022), vous pouvez changer d\'assurance a tout moment pour reduire ce cout. Ajoutez ce montant a votre estimation mensuelle.' },
    { q: 'Puis-je rembourser mon pret immobilier par anticipation?', a: 'Oui. En France, le remboursement anticipe est un droit, mais la banque peut appliquer des indemnites de remboursement anticipé (IRA) plafonnees a 3% du capital restant du ou 6 mois d\'interets. Meme de petits versements supplementaires sur le capital peuvent reduire considerablement les interets totaux et raccourcir la duree du pret.' }
  ] },
  de: { title: 'Hypothekenrechner: Monatliche Rate Berechnen und Vergleichen', paragraphs: [
    'Eine Hypothek ist die groesste finanzielle Verpflichtung, die die meisten Menschen eingehen. Zu verstehen, wie Ihre monatliche Rate berechnet wird und wie verschiedene Faktoren sie beeinflussen, ist entscheidend fuer eine fundierte Immobilienentscheidung. Die Schluesselparameter sind der Immobilienpreis, Ihre Anzahlung, der Zinssatz und die Laufzeit. In Deutschland sind Laufzeiten von 10, 15 und 20 Jahren mit Zinsbindung ueblich.',
    'Unser Hypothekenrechner verwendet die Standard-Annuitaetenformel, um Ihre monatliche Rate, die Gesamtzinskosten und die Gesamtkosten Ihrer Immobilie ueber die Laufzeit des Darlehens zu schaetzen. Durch Anpassung der Anzahlung oder des Zinssatzes koennen Sie sehen, wie selbst kleine Aenderungen die Gesamtkosten erheblich beeinflussen. Eine groessere Anzahlung reduziert sowohl die monatliche Rate als auch die Gesamtzinsen.',
    'Bevor Sie sich fuer eine Hypothek entscheiden, nutzen Sie diesen Rechner, um verschiedene Szenarien zu vergleichen. Probieren Sie verschiedene Laufzeiten — 10, 15, 20 oder 25 Jahre — um zu sehen, wie jede Ihr monatliches Budget und die Gesamtkosten beeinflusst. Beachten Sie, dass die berechnete Rate nur Tilgung und Zinsen umfasst; Ihre tatsaechliche Belastung kann auch Nebenkosten und Versicherungen einschliessen.',
    'Fuer eine detaillierte Analyse der monatlichen Aufteilung zwischen Tilgung und Zinsen nutzen Sie unseren <a href="/${lang}/tools/mortgage-amortization">Tilgungsplanrechner</a>. Wenn Sie auch Ratenkredite vergleichen, hilft Ihnen unser <a href="/${lang}/tools/loan-calculator">Kreditrechner</a> beim Vergleich. Um zu verstehen, wie Ihre Ersparnisse fuer eine kuenftige Anzahlung wachsen koennen, nutzen Sie den <a href="/${lang}/tools/compound-interest-calculator">Zinseszinsrechner</a>.'
  ], faq: [
    { q: 'Wie viel Eigenkapital brauche ich fuer eine Immobilienfinanzierung?', a: 'In Deutschland empfehlen Banken mindestens 20-30% Eigenkapital, einschliesslich der Kaufnebenkosten (Grunderwerbsteuer 3,5-6,5%, Notar ca. 1,5%, Grundbuch ca. 0,5%, ggf. Makler 3-6%). Einige Banken bieten Finanzierungen mit weniger Eigenkapital an, verlangen dafuer aber hoehere Zinsen. Mehr Eigenkapital bedeutet niedrigere Raten und bessere Konditionen.' },
    { q: 'Was ist der Unterschied zwischen 15- und 30-jaehrigem Darlehen?', a: 'Ein 15-jaehriges Darlehen hat hoehere monatliche Raten, kostet aber deutlich weniger an Gesamtzinsen — oft 50-60% Ersparnis gegenueber einem 30-jaehrigen Darlehen. In Deutschland ist es ueblich, eine kuerzere Zinsbindung (z.B. 10-15 Jahre) mit einer laengeren Gesamtlaufzeit zu kombinieren. Nach Ablauf der Zinsbindung wird zu den dann geltenden Konditionen prolongiert.' },
    { q: 'Wie beeinflusst der Zinssatz die Hypothekenkosten?', a: 'Selbst 0,5% Unterschied im Zinssatz kann die Gesamtkosten um Zehntausende Euro veraendern. Fuer ein Darlehen von 300.000 Euro ueber 20 Jahre macht der Unterschied zwischen 3% und 3,5% etwa 17.000 Euro an zusaetzlichen Zinsen aus. Deshalb lohnt sich ein Vergleich verschiedener Bankoptionen und die Nutzung eines unabhaengigen Finanzberaters.' },
    { q: 'Beinhaltet dieser Rechner Grundsteuer und Versicherung?', a: 'Dieser Rechner schaetzt nur die Raten fuer Tilgung und Zinsen. In Deutschland kommen noch Kaufnebenkosten (Grunderwerbsteuer, Notar, Grundbuch), laufende Kosten wie Grundsteuer, Gebaeudeversicherung und Hausgeld (bei Eigentumswohnungen) hinzu. Kalkulieren Sie zusaetzlich 2-3% des Kaufpreises pro Jahr fuer diese Nebenkosten.' },
    { q: 'Kann ich meine Hypothek vorzeitig tilgen mit Sondertilgungen?', a: 'Ja. Die meisten deutschen Immobilienkredite erlauben Sondertilgungen von 5-10% der Darlehenssumme pro Jahr ohne Vorfaelligkeitsentschaedigung. Selbst kleine zusaetzliche Zahlungen koennen die Gesamtzinsen erheblich reduzieren und die Laufzeit verkuerzen. Nach 10 Jahren haben Sie in Deutschland zudem ein gesetzliches Sonderkuendigungsrecht gemaess Par. 489 BGB.' }
  ] },
  pt: { title: 'Calculadora de Credito Habitacao: Como Calcular a Prestacao Mensal', paragraphs: [
    'O credito habitacao e o maior compromisso financeiro que a maioria das pessoas assume na vida. Compreender como a prestacao mensal e calculada e como os diferentes fatores a influenciam e essencial para tomar uma decisao imobiliaria consciente. As variaveis-chave sao o preco do imovel, a entrada, a taxa de juro e o prazo do emprestimo. Em Portugal e no Brasil, os prazos mais comuns sao 25, 30 e 35 anos.',
    'A nossa calculadora de credito habitacao utiliza a formula padrao de amortizacao para estimar a prestacao mensal, os juros totais e o custo global da habitacao. Ajustando a entrada ou a taxa de juro, pode ver como ate pequenas alteracoes impactam significativamente no custo total. Uma entrada maior reduz a prestacao mensal e os juros totais, enquanto uma taxa mais baixa pode poupar dezenas de milhares ao longo do emprestimo.',
    'Antes de se comprometer com um credito, use esta calculadora para comparar diferentes cenarios. Experimente diferentes prazos — 15, 20, 25 ou 30 anos — para ver como cada um afeta o seu orcamento mensal e o custo total. Lembre-se que a prestacao calculada cobre apenas capital e juros; o custo real pode incluir seguros obrigatorios e impostos.',
    'Para uma analise detalhada de como as prestacoes se distribuem entre capital e juros mes a mes, experimente a nossa <a href="/${lang}/tools/mortgage-amortization">calculadora de amortizacao</a>. Se tambem esta a avaliar emprestimos pessoais ou automovel, a nossa <a href="/${lang}/tools/loan-calculator">calculadora de emprestimos</a> pode ajudar na comparacao. Para entender como as suas poupancas podem crescer para uma futura entrada, consulte a <a href="/${lang}/tools/compound-interest-calculator">calculadora de juros compostos</a>.'
  ], faq: [
    { q: 'Quanta entrada preciso para um credito habitacao?', a: 'Em Portugal, os bancos financiam ate 90% do valor de avaliacao (80% para segunda habitacao). No Brasil, o financiamento pode chegar a 80% do valor do imovel. E necessario ter pelo menos 10-20% de entrada mais as despesas associadas (escritura, registo, IMT em Portugal ou ITBI no Brasil). Uma entrada maior garante melhores condicoes e menos juros pagos.' },
    { q: 'Qual e a diferenca entre credito a 15 e a 30 anos?', a: 'Um credito a 15 anos tem prestacoes mais altas mas custa significativamente menos em juros totais — frequentemente uma poupanca de 50-60% comparado com 30 anos. Por exemplo, num emprestimo de 200.000 euros a 3,5%, um prazo de 15 anos custa cerca de 57.000 euros em juros, enquanto a 30 anos custa aproximadamente 123.000 euros.' },
    { q: 'Como afeta a taxa de juro o custo do credito?', a: 'Mesmo uma diferenca de 0,5% na taxa de juro pode alterar o custo total em milhares de euros. Para um credito de 200.000 euros a 25 anos, passar de 3% para 3,5% acrescenta cerca de 16.000 euros em juros totais. Por isso e fundamental comparar as propostas de varios bancos e considerar a transferencia de credito se surgirem melhores condicoes.' },
    { q: 'Esta calculadora inclui impostos e seguros?', a: 'Esta calculadora estima apenas as prestacoes de capital e juros. Em Portugal, os custos adicionais incluem o IMT (Imposto Municipal sobre Transmissoes), imposto de selo, seguro de vida e seguro multirriscos obrigatorios. No Brasil, considere o ITBI, registo e avaliacao do imovel. Calcule um adicional de 5-8% do valor do imovel para estas despesas.' },
    { q: 'Posso amortizar o credito antecipadamente?', a: 'Sim. Em Portugal, a amortizacao antecipada e um direito, com comissoes limitadas a 0,5% para taxa variavel e 2% para taxa fixa (isentas em 2023-2024 por medida governamental). No Brasil, e possivel amortizar a qualquer momento sem penalidades significativas. Mesmo pequenos pagamentos extra ao capital podem reduzir milhares em juros ao longo da vida do credito.' }
  ] },
};

export default function MortgageCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['mortgage-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [propertyValue, setPropertyValue] = useState('300000');
  const [downPayment, setDownPayment] = useState('60000');
  const [interestRate, setInterestRate] = useState('3.5');
  const [years, setYears] = useState('25');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const pv = parseFloat(propertyValue) || 0;
  const dp = parseFloat(downPayment) || 0;
  const rate = (parseFloat(interestRate) || 0) / 100 / 12;
  const n = (parseInt(years) || 0) * 12;
  const loanAmount = Math.max(pv - dp, 0);
  const dpPct = pv > 0 ? (dp / pv) * 100 : 0;
  const dpInvalid = dp > pv && pv > 0;

  let monthlyPayment = 0;
  if (rate > 0 && n > 0 && loanAmount > 0) {
    monthlyPayment = loanAmount * (rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
  } else if (n > 0 && loanAmount > 0) {
    monthlyPayment = loanAmount / n;
  }

  const totalCost = monthlyPayment * n;
  const totalInterest = totalCost - loanAmount;
  const hasResult = loanAmount > 0 && n > 0;

  const resetAll = () => { setPropertyValue(''); setDownPayment(''); setInterestRate('3.5'); setYears('25'); setCopied(false); };
  const copyResults = () => {
    const text = `${t('monthlyPayment')}: ${monthlyPayment.toFixed(2)} | ${t('loanAmount')}: ${loanAmount.toFixed(2)} | ${t('totalInterest')}: ${totalInterest.toFixed(2)} | ${t('totalCost')}: ${totalCost.toFixed(2)}`;
    navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  const saveToHistory = () => {
    if (!hasResult) return;
    setHistory(prev => [{ monthly: monthlyPayment, totalInterest, loanAmount, timestamp: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="mortgage-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('propertyValue')}</label>
            <input type="number" value={propertyValue} onChange={(e) => setPropertyValue(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('downPayment')} {pv > 0 && <span className="text-gray-400 text-xs">({dpPct.toFixed(1)}%)</span>}
            </label>
            <input type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)}
              className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${dpInvalid ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {dpInvalid && <p className="text-red-500 text-xs mt-1">{t('invalidDp')}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('interestRate')}</label>
            <input type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('years')}</label>
            <input type="number" value={years} onChange={(e) => setYears(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {hasResult && (
              <>
                <button onClick={copyResults} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                  {copied ? t('copied') : t('copy')}
                </button>
                <button onClick={saveToHistory} className="px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium text-blue-700 transition-colors">
                  + {t('history')}
                </button>
              </>
            )}
            <button onClick={resetAll} className="px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium text-red-600 transition-colors ml-auto">
              {t('reset')}
            </button>
          </div>

          {hasResult && (
            <>
              {/* Result Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center col-span-2">
                  <div className="text-xs text-blue-600 font-medium">{t('monthlyPayment')}</div>
                  <div className="text-3xl font-bold text-blue-700">{monthlyPayment.toLocaleString(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500 font-medium">{t('loanAmount')}</div>
                  <div className="text-lg font-bold text-gray-900">{loanAmount.toLocaleString(lang, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                  <div className="text-xs text-red-600 font-medium">{t('totalInterest')}</div>
                  <div className="text-lg font-bold text-red-700">{totalInterest.toLocaleString(lang, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-500 font-medium">{t('totalCost')}</div>
                <div className="text-lg font-bold text-gray-900">{totalCost.toLocaleString(lang, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden flex">
                  <div className="h-full bg-blue-500" style={{ width: `${(loanAmount / totalCost) * 100}%` }}></div>
                  <div className="h-full bg-red-400" style={{ width: `${(totalInterest / totalCost) * 100}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span className="text-blue-600">{t('loanAmount')}: {((loanAmount / totalCost) * 100).toFixed(1)}%</span>
                  <span className="text-red-600">{t('totalInterest')}: {((totalInterest / totalCost) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('history')}</h3>
              <div className="space-y-1">
                {history.map((entry, i) => (
                  <div key={i} className="flex justify-between text-sm text-gray-600 bg-white rounded px-3 py-1.5 border border-gray-100">
                    <span className="font-semibold text-blue-600">{entry.monthly.toFixed(2)}/mo</span>
                    <span className="text-red-600">Int: {entry.totalInterest.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                    <span className="text-gray-400">{entry.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: p.replace(/\$\{lang\}/g, lang) }} />)}
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
