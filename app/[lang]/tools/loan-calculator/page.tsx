'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface HistoryEntry {
  amount: number;
  rate: number;
  years: number;
  monthly: number;
  totalInterest: number;
  timestamp: string;
}

const labels: Record<string, Record<string, string>> = {
  amount: { en: 'Loan Amount', it: 'Importo Prestito', es: 'Monto del Préstamo', fr: 'Montant du Prêt', de: 'Darlehensbetrag', pt: 'Valor do Empréstimo' },
  rate: { en: 'Annual Interest Rate (%)', it: 'Tasso Annuo (%)', es: 'Tasa Anual (%)', fr: 'Taux Annuel (%)', de: 'Jahreszins (%)', pt: 'Taxa Anual (%)' },
  years: { en: 'Loan Term (years)', it: 'Durata (anni)', es: 'Plazo (años)', fr: 'Durée (années)', de: 'Laufzeit (Jahre)', pt: 'Prazo (anos)' },
  monthly: { en: 'Monthly Payment', it: 'Rata Mensile', es: 'Pago Mensual', fr: 'Mensualité', de: 'Monatliche Rate', pt: 'Pagamento Mensal' },
  totalPaid: { en: 'Total Paid', it: 'Totale Pagato', es: 'Total Pagado', fr: 'Total Payé', de: 'Gesamtbetrag', pt: 'Total Pago' },
  totalInterest: { en: 'Total Interest', it: 'Interessi Totali', es: 'Interés Total', fr: 'Intérêts Totaux', de: 'Gesamtzinsen', pt: 'Juros Totais' },
  amortization: { en: 'Amortization Summary', it: 'Riepilogo Ammortamento', es: 'Resumen de Amortización', fr: 'Résumé Amortissement', de: 'Tilgungsübersicht', pt: 'Resumo da Amortização' },
  year: { en: 'Year', it: 'Anno', es: 'Año', fr: 'Année', de: 'Jahr', pt: 'Ano' },
  principal: { en: 'Principal', it: 'Capitale', es: 'Capital', fr: 'Capital', de: 'Tilgung', pt: 'Capital' },
  interest: { en: 'Interest', it: 'Interessi', es: 'Interés', fr: 'Intérêts', de: 'Zinsen', pt: 'Juros' },
  balance: { en: 'Balance', it: 'Saldo', es: 'Saldo', fr: 'Solde', de: 'Restschuld', pt: 'Saldo' },
  reset: { en: 'Reset', it: 'Reimposta', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  copy: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier les Résultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
  copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié!', de: 'Kopiert!', pt: 'Copiado!' },
  history: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
  invalidAmount: { en: 'Must be > 0', it: 'Deve essere > 0', es: 'Debe ser > 0', fr: 'Doit être > 0', de: 'Muss > 0 sein', pt: 'Deve ser > 0' },
  invalidRate: { en: 'Rate: 0-30%', it: 'Tasso: 0-30%', es: 'Tasa: 0-30%', fr: 'Taux: 0-30%', de: 'Zins: 0-30%', pt: 'Taxa: 0-30%' },
  interestToPrincipal: { en: 'Interest-to-Principal Ratio', it: 'Rapporto Interessi/Capitale', es: 'Relación Interés/Capital', fr: 'Ratio Intérêts/Capital', de: 'Zins-Kapital-Verhältnis', pt: 'Relação Juros/Capital' },
};

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: { title: 'Free Loan Calculator: Estimate Monthly Payments and Total Interest', paragraphs: [
    'A loan calculator is an essential financial planning tool that helps you estimate your monthly payments, total interest costs, and repayment schedule before committing to a loan. Whether you are considering a personal loan, auto loan, student loan, or any other type of fixed-rate borrowing, understanding the true cost of credit is critical to making informed decisions and avoiding financial strain.',
    'This calculator uses the standard amortization formula M = P[r(1+r)^n]/[(1+r)^n-1] to compute your monthly payment based on the loan amount, annual interest rate, and loan term in years. The formula distributes each payment between principal repayment and interest charges, with early payments going mostly toward interest and later payments primarily reducing the principal balance. The amortization table shows you exactly how this split changes over time.',
    'By experimenting with different loan amounts, interest rates, and terms, you can see how each variable affects your total cost. For example, a shorter loan term means higher monthly payments but significantly less total interest paid. Conversely, a lower interest rate reduces both your monthly payment and overall cost. Use this tool to compare different loan offers and choose the option that best fits your budget and financial goals.',
    'If you are specifically looking at home financing, our <a href="/${lang}/tools/mortgage-calculator">mortgage calculator</a> is designed for that purpose and includes down payment calculations. To see a detailed month-by-month payment breakdown, try the <a href="/${lang}/tools/mortgage-amortization">amortization schedule calculator</a>. And to understand how your savings can grow over time, check our <a href="/${lang}/tools/compound-interest-calculator">compound interest calculator</a>.'
  ], faq: [
    { q: 'What is the formula for calculating monthly loan payments?', a: 'The formula is M = P * [r(1+r)^n] / [(1+r)^n - 1], where M is the monthly payment, P is the principal (loan amount), r is the monthly interest rate (annual rate divided by 12), and n is the total number of payments (years multiplied by 12). This standard amortization formula is used by banks and lenders worldwide to calculate fixed monthly payments for any type of loan.' },
    { q: 'How does the loan term affect total interest paid?', a: 'A longer loan term results in lower monthly payments but significantly more total interest paid over the life of the loan. For example, a $10,000 loan at 5% over 3 years costs about $787 in interest, while the same loan over 5 years costs about $1,323 — nearly 68% more in interest. Always compare total cost, not just monthly payments, when choosing a loan term.' },
    { q: 'What is an amortization schedule and why does it matter?', a: 'An amortization schedule is a detailed table showing each monthly payment broken down into principal and interest portions, along with the remaining loan balance. In the early years, most of each payment goes toward interest. As the loan matures, a larger share goes to principal. Understanding this helps you see the benefit of making extra principal payments early in the loan term.' },
    { q: 'Should I choose a shorter or longer loan term?', a: 'It depends on your financial priorities. A shorter term saves money on interest but requires higher monthly payments — ideal if you have a stable income and want to minimize total cost. A longer term is easier on your monthly budget but costs more overall. As a general rule, choose the shortest term where the monthly payment is comfortably affordable without straining your finances.' },
    { q: 'Does this loan calculator account for fees and insurance?', a: 'This calculator computes principal and interest payments only, giving you the core cost of borrowing. Additional costs such as origination fees (typically 1-6% of loan amount), credit insurance, administrative charges, and late payment penalties should be added separately. For the true Annual Percentage Rate (APR), factor in all fees to compare loan offers accurately.' }
  ] },
  it: { title: 'Calcolatore Prestiti: Come Calcolare Rate Mensili e Interessi Totali', paragraphs: [
    'Un calcolatore di prestiti e uno strumento essenziale di pianificazione finanziaria che ti aiuta a stimare le rate mensili, i costi totali degli interessi e il piano di rimborso prima di impegnarti. Che tu stia considerando un prestito personale, un finanziamento auto, un prestito finalizzato o la cessione del quinto, comprendere il vero costo del credito e fondamentale per evitare sorprese.',
    'Questo calcolatore utilizza la formula standard di ammortamento alla francese (rata costante) per calcolare la rata mensile in base all\'importo del prestito, al tasso di interesse annuo e alla durata in anni. La formula distribuisce ogni pagamento tra rimborso del capitale e interessi, con le prime rate destinate principalmente agli interessi e le successive che riducono il capitale residuo. La tabella di ammortamento mostra esattamente come questa ripartizione cambia nel tempo.',
    'Sperimentando con diversi importi, tassi di interesse e durate, puoi vedere come ogni variabile influisce sul costo totale. Una durata piu breve significa rate piu alte ma significativamente meno interessi totali pagati. Un tasso piu basso riduce sia la rata che il costo complessivo. In Italia, il TAEG (Tasso Annuo Effettivo Globale) include tutte le spese accessorie ed e il parametro migliore per confrontare offerte diverse.',
    'Se stai valutando un mutuo per la casa, il nostro <a href="/${lang}/tools/mortgage-calculator">calcolatore mutuo</a> e progettato specificamente per quello scopo. Per vedere il dettaglio mese per mese, prova il <a href="/${lang}/tools/mortgage-amortization">calcolatore piano di ammortamento</a>. Per capire come far crescere i risparmi, consulta il <a href="/${lang}/tools/compound-interest-calculator">calcolatore interesse composto</a>.'
  ], faq: [
    { q: 'Qual e la formula per calcolare la rata mensile di un prestito?', a: 'La formula e M = P * [r(1+r)^n] / [(1+r)^n - 1], dove M e la rata mensile, P e il capitale prestato, r e il tasso di interesse mensile (tasso annuo diviso 12) e n e il numero totale di rate (anni per 12). Questa formula standard di ammortamento alla francese e usata da banche e finanziarie in tutto il mondo per calcolare rate fisse costanti.' },
    { q: 'Come influisce la durata del prestito sugli interessi totali?', a: 'Una durata piu lunga comporta rate mensili piu basse ma molti piu interessi totali. Ad esempio, un prestito di 10.000 euro al 5% su 3 anni costa circa 787 euro di interessi, mentre su 5 anni costa circa 1.323 euro — quasi il 68% in piu. Confronta sempre il costo totale, non solo la rata mensile, quando scegli la durata.' },
    { q: 'Cos\'e un piano di ammortamento e perche e importante?', a: 'Un piano di ammortamento e una tabella dettagliata che mostra ogni pagamento suddiviso tra quota capitale e quota interessi, insieme al debito residuo. Nelle prime rate, la maggior parte va agli interessi. Man mano che il prestito avanza, cresce la quota capitale. Capire questa dinamica ti aiuta a valutare il vantaggio di eventuali rimborsi anticipati.' },
    { q: 'Meglio un prestito breve o lungo?', a: 'Dipende dalle tue priorita finanziarie. Un prestito breve fa risparmiare sugli interessi ma richiede rate piu alte — ideale se hai un reddito stabile e vuoi minimizzare il costo totale. Un prestito lungo e piu leggero mensilmente ma costa di piu complessivamente. Come regola generale, scegli la durata piu breve con una rata sostenibile senza mettere in difficolta il tuo bilancio.' },
    { q: 'Questo calcolatore tiene conto del TAEG e delle commissioni?', a: 'Questo calcolatore calcola solo capitale e interessi (TAN). I costi aggiuntivi come commissioni di apertura, spese di istruttoria, polizze assicurative e spese di incasso rata vanno aggiunti separatamente. Per un confronto accurato tra offerte diverse, verifica sempre il TAEG (Tasso Annuo Effettivo Globale) che include tutti i costi accessori obbligatori.' }
  ] },
  es: { title: 'Calculadora de Prestamos: Calcula Cuotas Mensuales e Interes Total', paragraphs: [
    'Una calculadora de prestamos es una herramienta esencial de planificacion financiera que te ayuda a estimar tus pagos mensuales, los costos totales de intereses y el calendario de amortizacion antes de comprometerte con un prestamo. Ya sea un prestamo personal, de auto, estudiantil o cualquier tipo de credito a tasa fija, entender el costo real del credito es fundamental.',
    'Esta calculadora utiliza la formula estandar de amortizacion para calcular tu cuota mensual basandose en el monto del prestamo, la tasa de interes anual y el plazo en anos. La formula distribuye cada pago entre capital e intereses, con los primeros pagos destinados mayormente a intereses y los posteriores reduciendo principalmente el capital. La tabla de amortizacion muestra exactamente como cambia esta distribucion.',
    'Experimentando con diferentes montos, tasas y plazos, puedes ver como cada variable afecta el costo total. Un plazo mas corto significa cuotas mas altas pero significativamente menos intereses totales. Una tasa mas baja reduce tanto la cuota como el costo global. Compara siempre el costo total, no solo la cuota mensual, al elegir entre ofertas de credito.',
    'Si buscas financiamiento para vivienda, nuestra <a href="/${lang}/tools/mortgage-calculator">calculadora de hipoteca</a> esta disenada para ese fin. Para ver un desglose mensual detallado, prueba la <a href="/${lang}/tools/mortgage-amortization">calculadora de amortizacion</a>. Para entender como tus ahorros pueden crecer, consulta la <a href="/${lang}/tools/compound-interest-calculator">calculadora de interes compuesto</a>.'
  ], faq: [
    { q: 'Cual es la formula para calcular la cuota mensual de un prestamo?', a: 'La formula es M = P * [r(1+r)^n] / [(1+r)^n - 1], donde M es la cuota mensual, P es el capital, r es la tasa de interes mensual (tasa anual dividida por 12) y n es el numero total de cuotas (anos por 12). Esta formula estandar de amortizacion es utilizada por bancos y entidades financieras en todo el mundo para calcular cuotas fijas.' },
    { q: 'Como afecta el plazo del prestamo al interes total?', a: 'Un plazo mas largo resulta en cuotas mensuales mas bajas pero mucho mas interes total. Por ejemplo, un prestamo de 10.000 dolares al 5% a 3 anos cuesta unos 787 dolares de intereses, mientras que el mismo prestamo a 5 anos cuesta unos 1.323 dolares — casi un 68% mas. Siempre compara el costo total al elegir el plazo.' },
    { q: 'Que es un cuadro de amortizacion y por que importa?', a: 'Un cuadro de amortizacion es una tabla detallada que muestra cada pago dividido entre capital e intereses, junto con el saldo pendiente. En las primeras cuotas, la mayor parte va a intereses. A medida que avanza el prestamo, mas dinero se aplica al capital. Entender esto te ayuda a evaluar si conviene hacer pagos anticipados.' },
    { q: 'Es mejor un prestamo corto o largo?', a: 'Depende de tus prioridades. Un prestamo corto ahorra en intereses pero exige cuotas mas altas — ideal si tienes ingresos estables y quieres minimizar el costo total. Un prestamo largo es mas comodo mensualmente pero cuesta mas en total. Elige el plazo mas corto cuya cuota sea comoda sin comprometer tu presupuesto mensual.' },
    { q: 'Esta calculadora incluye el CAT y las comisiones?', a: 'Esta calculadora calcula solo capital e intereses. Costos adicionales como comisiones de apertura, seguros, gastos administrativos y penalizaciones deben sumarse por separado. Para una comparacion precisa entre ofertas, revisa el CAT (Costo Anual Total) en Mexico o la TAE en Espana, que incluyen todos los costos asociados al credito.' }
  ] },
  fr: { title: 'Calculateur de Pret: Estimez vos Mensualites et le Cout Total du Credit', paragraphs: [
    'Un calculateur de pret est un outil essentiel de planification financiere qui vous aide a estimer vos mensualites, le cout total des interets et le calendrier de remboursement avant de vous engager. Que vous envisagiez un pret personnel, un credit auto, un pret etudiant ou tout autre type d\'emprunt a taux fixe, comprendre le vrai cout du credit est fondamental.',
    'Ce calculateur utilise la formule standard d\'amortissement pour calculer votre mensualite en fonction du montant emprunte, du taux d\'interet annuel et de la duree en annees. La formule repartit chaque paiement entre remboursement du capital et interets, les premieres mensualites etant majoritairement composees d\'interets tandis que les dernieres reduisent principalement le capital.',
    'En experimentant avec differents montants, taux et durees, vous pouvez voir comment chaque variable affecte le cout total. Une duree plus courte signifie des mensualites plus elevees mais nettement moins d\'interets totaux. Un taux plus bas reduit a la fois la mensualite et le cout global. Comparez toujours le cout total et pas seulement la mensualite.',
    'Si vous cherchez un financement immobilier, notre <a href="/${lang}/tools/mortgage-calculator">calculateur hypothecaire</a> est concu pour cela. Pour voir un echeancier mensuel detaille, essayez le <a href="/${lang}/tools/mortgage-amortization">calculateur d\'amortissement</a>. Pour comprendre comment votre epargne peut fructifier, consultez le <a href="/${lang}/tools/compound-interest-calculator">calculateur d\'interets composes</a>.'
  ], faq: [
    { q: 'Quelle est la formule pour calculer la mensualite d\'un pret?', a: 'La formule est M = P * [r(1+r)^n] / [(1+r)^n - 1], ou M est la mensualite, P le capital emprunte, r le taux d\'interet mensuel (taux annuel divise par 12) et n le nombre total de mensualites (annees fois 12). Cette formule standard est utilisee par les banques et organismes de credit dans le monde entier pour calculer des mensualites fixes constantes.' },
    { q: 'Comment la duree du pret affecte-t-elle les interets totaux?', a: 'Une duree plus longue entraine des mensualites plus basses mais beaucoup plus d\'interets au total. Par exemple, un pret de 10.000 euros a 5% sur 3 ans coute environ 787 euros d\'interets, tandis que sur 5 ans il coute environ 1.323 euros — pres de 68% de plus. Comparez toujours le cout total du credit, pas seulement la mensualite.' },
    { q: 'Qu\'est-ce qu\'un tableau d\'amortissement et pourquoi est-il important?', a: 'Un tableau d\'amortissement est un document detaillant chaque mensualite ventilee entre capital et interets, avec le capital restant du. Au debut, la part d\'interets est elevee. Au fil du temps, la part de capital augmente. Comprendre cette mecanique vous aide a evaluer l\'interet de remboursements anticipes pour reduire le cout total.' },
    { q: 'Vaut-il mieux un pret court ou long?', a: 'Cela depend de vos priorites financieres. Un pret court economise sur les interets mais exige des mensualites plus elevees — ideal si vos revenus sont stables. Un pret long allegre le budget mensuel mais coute plus au total. Choisissez la duree la plus courte dont la mensualite reste confortable sans mettre en difficulte votre budget.' },
    { q: 'Ce calculateur inclut-il le TAEG et les frais?', a: 'Ce calculateur calcule uniquement le capital et les interets. Les frais supplementaires comme les frais de dossier, l\'assurance emprunteur, les frais de garantie et les penalites de retard doivent etre ajoutes separement. Pour comparer les offres de credit, verifiez le TAEG (Taux Annuel Effectif Global) qui integre l\'ensemble des frais obligatoires du pret.' }
  ] },
  de: { title: 'Kreditrechner: Monatliche Raten und Gesamtkosten Berechnen', paragraphs: [
    'Ein Kreditrechner ist ein unverzichtbares Finanzplanungstool, das Ihnen hilft, monatliche Raten, Gesamtzinskosten und den Tilgungsplan abzuschaetzen, bevor Sie sich fuer einen Kredit entscheiden. Ob Privatkredit, Autokredit, Studienkredit oder jede andere Art von Festzinsfinanzierung — die wahren Kosten des Kredits zu verstehen ist entscheidend fuer fundierte Entscheidungen.',
    'Dieser Rechner verwendet die Standard-Annuitaetenformel, um Ihre monatliche Rate auf Basis des Darlehensbetrags, des effektiven Jahreszinses und der Laufzeit in Jahren zu berechnen. Die Formel verteilt jede Zahlung zwischen Tilgung und Zinsen, wobei fruehe Zahlungen hauptsaechlich Zinsen bedienen und spaetere Zahlungen vorwiegend den Restbetrag reduzieren.',
    'Durch Experimentieren mit verschiedenen Betraegen, Zinssaetzen und Laufzeiten sehen Sie, wie jede Variable die Gesamtkosten beeinflusst. Eine kuerzere Laufzeit bedeutet hoehere monatliche Raten, aber deutlich weniger Gesamtzinsen. Ein niedrigerer Zinssatz reduziert sowohl die monatliche Rate als auch die Gesamtkosten. Vergleichen Sie immer die Gesamtkosten, nicht nur die monatliche Rate.',
    'Wenn Sie speziell eine Immobilienfinanzierung suchen, ist unser <a href="/${lang}/tools/mortgage-calculator">Hypothekenrechner</a> dafuer konzipiert. Fuer einen detaillierten monatlichen Zahlungsplan nutzen Sie den <a href="/${lang}/tools/mortgage-amortization">Tilgungsplanrechner</a>. Um zu verstehen, wie Ihre Ersparnisse wachsen koennen, probieren Sie den <a href="/${lang}/tools/compound-interest-calculator">Zinseszinsrechner</a>.'
  ], faq: [
    { q: 'Wie lautet die Formel fuer die monatliche Kreditrate?', a: 'Die Formel lautet M = P * [r(1+r)^n] / [(1+r)^n - 1], wobei M die monatliche Rate ist, P der Darlehensbetrag, r der monatliche Zinssatz (Jahreszins geteilt durch 12) und n die Gesamtzahl der Zahlungen (Jahre mal 12). Diese Standard-Annuitaetenformel wird von Banken und Kreditinstituten weltweit fuer die Berechnung fester monatlicher Raten verwendet.' },
    { q: 'Wie wirkt sich die Laufzeit auf die Gesamtzinsen aus?', a: 'Eine laengere Laufzeit fuehrt zu niedrigeren monatlichen Raten, aber deutlich hoeheren Gesamtzinsen. Beispielsweise kostet ein Kredit von 10.000 Euro bei 5% ueber 3 Jahre etwa 787 Euro Zinsen, waehrend derselbe Kredit ueber 5 Jahre etwa 1.323 Euro kostet — fast 68% mehr. Vergleichen Sie immer die Gesamtkosten bei der Wahl der Laufzeit.' },
    { q: 'Was ist ein Tilgungsplan und warum ist er wichtig?', a: 'Ein Tilgungsplan ist eine detaillierte Tabelle, die jede monatliche Zahlung in Tilgungs- und Zinsanteil aufschluesselt, zusammen mit der Restschuld. In den Anfangsjahren ist der Zinsanteil hoch; mit fortschreitender Laufzeit steigt der Tilgungsanteil. Dieses Verstaendnis hilft Ihnen, den Vorteil von Sondertilgungen frueh in der Laufzeit zu erkennen.' },
    { q: 'Ist ein kurzer oder langer Kredit besser?', a: 'Das haengt von Ihren finanziellen Prioritaeten ab. Ein kurzer Kredit spart Zinsen, erfordert aber hoehere monatliche Raten — ideal bei stabilem Einkommen. Ein langer Kredit entlastet das monatliche Budget, kostet aber insgesamt mehr. Waehlen Sie die kuerzeste Laufzeit, deren monatliche Rate Sie bequem tragen koennen, ohne Ihr Budget zu belasten.' },
    { q: 'Beruecksichtigt dieser Rechner den effektiven Jahreszins und Gebuehren?', a: 'Dieser Rechner berechnet nur Tilgung und Zinsen (Sollzins). Zusaetzliche Kosten wie Bearbeitungsgebuehren, Restschuldversicherung, Kontogebuehren und Vorfaelligkeitsentschaedigungen muessen separat addiert werden. Fuer einen genauen Vergleich verschiedener Kreditangebote pruefen Sie den effektiven Jahreszins, der alle Pflichtkosten des Kredits umfasst.' }
  ] },
  pt: { title: 'Calculadora de Emprestimos: Calcule Parcelas Mensais e Juros Totais', paragraphs: [
    'Uma calculadora de emprestimos e uma ferramenta essencial de planeamento financeiro que ajuda a estimar as prestacoes mensais, os custos totais de juros e o calendario de amortizacao antes de se comprometer com um emprestimo. Seja um emprestimo pessoal, automovel, estudantil ou qualquer outro tipo de credito a taxa fixa, compreender o custo real e fundamental.',
    'Esta calculadora utiliza a formula padrao de amortizacao para calcular a sua prestacao mensal com base no valor do emprestimo, na taxa de juro anual e no prazo em anos. A formula distribui cada pagamento entre amortizacao do capital e juros, com os primeiros pagamentos destinados principalmente a juros e os posteriores a reduzir o capital em divida.',
    'Ao experimentar com diferentes valores, taxas e prazos, pode ver como cada variavel afeta o custo total. Um prazo mais curto significa prestacoes mais altas mas significativamente menos juros totais. Uma taxa mais baixa reduz tanto a prestacao como o custo global. Compare sempre o custo total, nao apenas a prestacao mensal, ao escolher entre ofertas de credito.',
    'Se procura financiamento para habitacao, a nossa <a href="/${lang}/tools/mortgage-calculator">calculadora de hipoteca</a> foi concebida para isso. Para ver um detalhamento mensal, experimente a <a href="/${lang}/tools/mortgage-amortization">calculadora de amortizacao</a>. Para entender como as suas poupancas podem crescer, consulte a <a href="/${lang}/tools/compound-interest-calculator">calculadora de juros compostos</a>.'
  ], faq: [
    { q: 'Qual e a formula para calcular a prestacao mensal de um emprestimo?', a: 'A formula e M = P * [r(1+r)^n] / [(1+r)^n - 1], onde M e a prestacao mensal, P e o capital emprestado, r e a taxa de juro mensal (taxa anual dividida por 12) e n e o numero total de prestacoes (anos vezes 12). Esta formula padrao de amortizacao e utilizada por bancos e instituicoes financeiras em todo o mundo.' },
    { q: 'Como afeta o prazo do emprestimo os juros totais?', a: 'Um prazo mais longo resulta em prestacoes mais baixas mas muito mais juros totais. Por exemplo, um emprestimo de 10.000 euros a 5% em 3 anos custa cerca de 787 euros de juros, enquanto em 5 anos custa cerca de 1.323 euros — quase 68% mais. Compare sempre o custo total ao escolher o prazo do emprestimo.' },
    { q: 'O que e um plano de amortizacao e porque e importante?', a: 'Um plano de amortizacao e uma tabela detalhada que mostra cada pagamento dividido entre capital e juros, com o saldo devedor. Nos primeiros meses, a maior parte vai para juros. Com o passar do tempo, mais vai para o capital. Compreender esta dinamica ajuda a avaliar se vale a pena fazer amortizacoes antecipadas.' },
    { q: 'E melhor um emprestimo curto ou longo?', a: 'Depende das suas prioridades financeiras. Um emprestimo curto poupa em juros mas exige prestacoes mais altas — ideal se tem rendimento estavel. Um emprestimo longo alivia o orcamento mensal mas custa mais no total. Escolha o prazo mais curto cuja prestacao seja confortavel sem comprometer o seu orcamento mensal.' },
    { q: 'Esta calculadora inclui a TAEG e as comissoes?', a: 'Esta calculadora calcula apenas capital e juros (TAN). Custos adicionais como comissoes de abertura, seguros, despesas administrativas e comissoes de amortizacao antecipada devem ser somados a parte. Para comparar ofertas de credito com precisao, verifique a TAEG (Taxa Anual de Encargos Efetiva Global) que inclui todos os custos obrigatorios.' }
  ] },
};

export default function LoanCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['loan-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const principal = parseFloat(amount) || 0;
  const annualRate = parseFloat(rate) || 0;
  const term = parseInt(years) || 0;
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = term * 12;

  const rateInvalid = rate !== '' && (annualRate < 0 || annualRate > 30);

  let monthlyPayment = 0;
  let totalPaid = 0;
  let totalInterest = 0;

  if (principal > 0 && annualRate > 0 && term > 0) {
    monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    totalPaid = monthlyPayment * numPayments;
    totalInterest = totalPaid - principal;
  } else if (principal > 0 && annualRate === 0 && term > 0) {
    monthlyPayment = principal / numPayments;
    totalPaid = principal;
    totalInterest = 0;
  }

  const interestRatio = principal > 0 ? (totalInterest / principal) * 100 : 0;

  const amortizationByYear: { year: number; principalPaid: number; interestPaid: number; balance: number }[] = [];
  if (monthlyPayment > 0 && annualRate > 0) {
    let bal = principal;
    for (let y = 1; y <= term; y++) {
      let yPrincipal = 0; let yInterest = 0;
      for (let m = 0; m < 12; m++) {
        const intPart = bal * monthlyRate;
        const prinPart = monthlyPayment - intPart;
        yInterest += intPart; yPrincipal += prinPart; bal -= prinPart;
      }
      amortizationByYear.push({ year: y, principalPaid: yPrincipal, interestPaid: yInterest, balance: Math.max(bal, 0) });
    }
  }

  const resetAll = () => { setAmount(''); setRate(''); setYears(''); setCopied(false); };

  const copyResults = () => {
    const text = `${t('monthly')}: $${monthlyPayment.toFixed(2)} | ${t('totalPaid')}: $${totalPaid.toFixed(2)} | ${t('totalInterest')}: $${totalInterest.toFixed(2)}`;
    navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const saveToHistory = () => {
    if (monthlyPayment <= 0) return;
    setHistory(prev => [{ amount: principal, rate: annualRate, years: term, monthly: monthlyPayment, totalInterest, timestamp: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="loan-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('amount')}</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('rate')}</label>
            <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="0"
              className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${rateInvalid ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {rateInvalid && <p className="text-red-500 text-xs mt-1">{t('invalidRate')}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('years')}</label>
            <input type="number" value={years} onChange={(e) => setYears(e.target.value)} placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {monthlyPayment > 0 && (
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

          {monthlyPayment > 0 && (
            <>
              {/* Result Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <div className="text-xs text-blue-600 font-medium">{t('monthly')}</div>
                  <div className="text-2xl font-bold text-blue-700">${monthlyPayment.toFixed(2)}</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                  <div className="text-xs text-gray-500 font-medium">{t('totalPaid')}</div>
                  <div className="text-2xl font-bold text-gray-900">${totalPaid.toFixed(2)}</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <div className="text-xs text-red-600 font-medium">{t('totalInterest')}</div>
                  <div className="text-2xl font-bold text-red-700">${totalInterest.toFixed(2)}</div>
                </div>
              </div>

              {/* Interest Ratio */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                <span className="text-sm text-gray-600">{t('interestToPrincipal')}: </span>
                <span className={`text-lg font-bold ${interestRatio > 50 ? 'text-red-600' : interestRatio > 25 ? 'text-yellow-600' : 'text-green-600'}`}>{interestRatio.toFixed(1)}%</span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden flex">
                  <div className="h-full bg-blue-500" style={{ width: `${(principal / totalPaid) * 100}%` }}></div>
                  <div className="h-full bg-red-400" style={{ width: `${(totalInterest / totalPaid) * 100}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span className="text-blue-600">{t('principal')}: {((principal / totalPaid) * 100).toFixed(1)}%</span>
                  <span className="text-red-600">{t('interest')}: {((totalInterest / totalPaid) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </>
          )}

          {amortizationByYear.length > 0 && (
            <div className="mt-4">
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
                    {amortizationByYear.map((row) => (
                      <tr key={row.year} className="border-t border-gray-100">
                        <td className="px-2 py-1">{row.year}</td>
                        <td className="px-2 py-1 text-right text-blue-600">${row.principalPaid.toFixed(2)}</td>
                        <td className="px-2 py-1 text-right text-red-600">${row.interestPaid.toFixed(2)}</td>
                        <td className="px-2 py-1 text-right">${row.balance.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('history')}</h3>
              <div className="space-y-1">
                {history.map((entry, i) => (
                  <div key={i} className="flex justify-between text-sm text-gray-600 bg-white rounded px-3 py-1.5 border border-gray-100">
                    <span>${entry.amount.toLocaleString()} @ {entry.rate}% / {entry.years}y</span>
                    <span className="font-semibold text-blue-600">${entry.monthly.toFixed(2)}/mo</span>
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
