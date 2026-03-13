'use client';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type YearRow = { year: number; age: number; balance: number; contributions: number; growth: number };

export default function RetirementCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['retirement-calculator'][lang];
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(65);
  const [currentSavings, setCurrentSavings] = useState(10000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [inflationRate, setInflationRate] = useState(2.5);
  const [showTable, setShowTable] = useState(false);

  const labels = {
    currentAge: { en: 'Current age', it: 'Età attuale', es: 'Edad actual', fr: 'Âge actuel', de: 'Aktuelles Alter', pt: 'Idade atual' },
    retirementAge: { en: 'Retirement age', it: 'Età pensionamento', es: 'Edad de jubilación', fr: 'Âge de retraite', de: 'Rentenalter', pt: 'Idade de aposentadoria' },
    currentSavings: { en: 'Current savings', it: 'Risparmi attuali', es: 'Ahorros actuales', fr: 'Épargne actuelle', de: 'Aktuelle Ersparnisse', pt: 'Poupança atual' },
    monthlyContribution: { en: 'Monthly contribution', it: 'Contributo mensile', es: 'Contribución mensual', fr: 'Contribution mensuelle', de: 'Monatlicher Beitrag', pt: 'Contribuição mensal' },
    annualReturn: { en: 'Expected annual return (%)', it: 'Rendimento annuale atteso (%)', es: 'Retorno anual esperado (%)', fr: 'Rendement annuel attendu (%)', de: 'Erwartete jährl. Rendite (%)', pt: 'Retorno anual esperado (%)' },
    inflationRate: { en: 'Expected inflation (%)', it: 'Inflazione attesa (%)', es: 'Inflación esperada (%)', fr: 'Inflation attendue (%)', de: 'Erwartete Inflation (%)', pt: 'Inflação esperada (%)' },
    results: { en: 'Results', it: 'Risultati', es: 'Resultados', fr: 'Résultats', de: 'Ergebnisse', pt: 'Resultados' },
    totalAtRetirement: { en: 'Total savings at retirement', it: 'Risparmi totali alla pensione', es: 'Ahorros totales al jubilarse', fr: 'Épargne totale à la retraite', de: 'Gesamtersparnis bei Rente', pt: 'Poupança total na aposentadoria' },
    inflationAdjusted: { en: 'Inflation-adjusted value', it: 'Valore adeguato all\'inflazione', es: 'Valor ajustado por inflación', fr: 'Valeur ajustée à l\'inflation', de: 'Inflationsbereinigter Wert', pt: 'Valor ajustado pela inflação' },
    monthlyIncome: { en: 'Monthly income (4% rule)', it: 'Reddito mensile (regola 4%)', es: 'Ingreso mensual (regla 4%)', fr: 'Revenu mensuel (règle 4%)', de: 'Monatl. Einkommen (4%-Regel)', pt: 'Renda mensal (regra 4%)' },
    totalContributions: { en: 'Total contributions', it: 'Contributi totali', es: 'Contribuciones totales', fr: 'Contributions totales', de: 'Gesamtbeiträge', pt: 'Contribuições totais' },
    totalGrowth: { en: 'Total investment growth', it: 'Crescita investimento', es: 'Crecimiento de inversión', fr: 'Croissance de l\'investissement', de: 'Gesamte Anlagerendite', pt: 'Crescimento do investimento' },
    yearsToRetirement: { en: 'Years to retirement', it: 'Anni alla pensione', es: 'Años para jubilación', fr: 'Années avant la retraite', de: 'Jahre bis zur Rente', pt: 'Anos até aposentadoria' },
    yearByYear: { en: 'Year-by-year summary', it: 'Riepilogo anno per anno', es: 'Resumen año por año', fr: 'Résumé année par année', de: 'Jährliche Übersicht', pt: 'Resumo ano a ano' },
    showTable: { en: 'Show table', it: 'Mostra tabella', es: 'Mostrar tabla', fr: 'Afficher le tableau', de: 'Tabelle anzeigen', pt: 'Mostrar tabela' },
    hideTable: { en: 'Hide table', it: 'Nascondi tabella', es: 'Ocultar tabla', fr: 'Masquer le tableau', de: 'Tabelle ausblenden', pt: 'Ocultar tabela' },
    year: { en: 'Year', it: 'Anno', es: 'Año', fr: 'Année', de: 'Jahr', pt: 'Ano' },
    age: { en: 'Age', it: 'Età', es: 'Edad', fr: 'Âge', de: 'Alter', pt: 'Idade' },
    balance: { en: 'Balance', it: 'Saldo', es: 'Saldo', fr: 'Solde', de: 'Kontostand', pt: 'Saldo' },
  } as Record<string, Record<Locale, string>>;

  const yearsToRetire = Math.max(retirementAge - currentAge, 0);

  const calculation = useMemo(() => {
    const monthlyRate = annualReturn / 100 / 12;
    const totalMonths = yearsToRetire * 12;
    let balance = currentSavings;
    const rows: YearRow[] = [];
    let yearStart = balance;

    for (let m = 1; m <= totalMonths; m++) {
      balance = balance * (1 + monthlyRate) + monthlyContribution;
      if (m % 12 === 0) {
        const yearNum = m / 12;
        const yearContrib = monthlyContribution * 12;
        const growth = balance - yearStart - yearContrib;
        rows.push({
          year: yearNum,
          age: currentAge + yearNum,
          balance,
          contributions: yearContrib,
          growth,
        });
        yearStart = balance;
      }
    }

    const totalSavings = balance;
    const inflationFactor = Math.pow(1 + inflationRate / 100, yearsToRetire);
    const inflationAdjusted = totalSavings / inflationFactor;
    const monthlyIncome4Pct = (inflationAdjusted * 0.04) / 12;
    const totalContributed = currentSavings + monthlyContribution * 12 * yearsToRetire;
    const totalGrowth = totalSavings - totalContributed;

    return { totalSavings, inflationAdjusted, monthlyIncome4Pct, totalContributed, totalGrowth, rows };
  }, [currentAge, retirementAge, currentSavings, monthlyContribution, annualReturn, inflationRate, yearsToRetire]);

  const fmt = (n: number) => {
    return new Intl.NumberFormat(lang === 'en' ? 'en-US' : lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'it-IT', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n);
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Retirement Calculator: Plan Your Financial Future with Confidence',
      paragraphs: [
        'Planning for retirement is one of the most important financial decisions you will make. A retirement calculator helps you estimate how much you need to save to maintain your desired lifestyle after you stop working. By factoring in your current age, savings, monthly contributions, expected investment returns, and inflation, you can get a realistic picture of your financial future.',
        'The power of compound interest means that even small monthly contributions grow significantly over decades. Starting to save early gives your money more time to compound, which can make a dramatic difference in your final retirement balance. This calculator shows you exactly how your savings grow year by year so you can see the compounding effect in action.',
        'Inflation is a critical factor that many people overlook. A dollar today will not buy the same amount of goods in 30 years. Our calculator adjusts your projected savings for inflation so you can see the real purchasing power of your retirement fund, not just the nominal dollar amount.',
        'The 4% rule is a widely used guideline suggesting that you can safely withdraw 4% of your retirement savings each year without running out of money over a 30-year retirement. The calculator uses this rule to estimate your potential monthly income in retirement, giving you a practical benchmark for planning.',
      ],
      faq: [
        { q: 'What is the 4% rule?', a: 'The 4% rule is a retirement planning guideline that suggests withdrawing 4% of your total retirement savings in the first year, then adjusting for inflation each subsequent year. Studies show this approach has a high probability of making your money last at least 30 years.' },
        { q: 'How does inflation affect my retirement savings?', a: 'Inflation erodes purchasing power over time. If inflation averages 2.5% per year, $1 million in 30 years will have the purchasing power of roughly $477,000 in today\'s dollars. The calculator shows both nominal and inflation-adjusted values so you can plan realistically.' },
        { q: 'What is a reasonable expected annual return?', a: 'Historically, the stock market has averaged about 7-10% annually before inflation. A balanced portfolio of stocks and bonds might average 6-8%. Conservative estimates (5-7%) are recommended for retirement planning to account for market volatility.' },
        { q: 'Is my financial data stored or shared?', a: 'No. All calculations happen entirely in your browser. Your financial information is never sent to any server, stored in any database, or shared with third parties.' },
        { q: 'How accurate is this calculator?', a: 'The calculator provides estimates based on the assumptions you enter. Actual returns vary year to year and are not guaranteed. Use this as a planning tool, not a guarantee of future results. Consider consulting a financial advisor for personalized advice.' },
      ],
    },
    it: {
      title: 'Calcolatore Pensione: Pianifica il Tuo Futuro Finanziario con Sicurezza',
      paragraphs: [
        'Pianificare la pensione è una delle decisioni finanziarie più importanti. Un calcolatore pensionistico aiuta a stimare quanto risparmiare per mantenere il tenore di vita desiderato dopo aver smesso di lavorare. Considerando età attuale, risparmi, contributi mensili, rendimenti attesi e inflazione, puoi avere un quadro realistico del tuo futuro finanziario.',
        'Il potere dell\'interesse composto fa sì che anche piccoli contributi mensili crescano significativamente nel corso dei decenni. Iniziare a risparmiare presto dà al denaro più tempo per capitalizzarsi, con un effetto drammatico sul saldo finale. Questo calcolatore mostra esattamente come crescono i risparmi anno dopo anno.',
        'L\'inflazione è un fattore critico spesso trascurato. Un euro oggi non comprerà la stessa quantità di beni tra 30 anni. Il nostro calcolatore adegua i risparmi proiettati all\'inflazione per mostrare il reale potere d\'acquisto del tuo fondo pensione.',
        'La regola del 4% è una linea guida ampiamente utilizzata che suggerisce di poter prelevare in sicurezza il 4% dei risparmi pensionistici ogni anno senza esaurire il capitale in 30 anni. Il calcolatore usa questa regola per stimare il potenziale reddito mensile in pensione.',
      ],
      faq: [
        { q: 'Cos\'è la regola del 4%?', a: 'La regola del 4% suggerisce di prelevare il 4% dei risparmi totali nel primo anno di pensione, adeguando poi per l\'inflazione. Gli studi mostrano che questo approccio ha un\'alta probabilità di far durare il denaro almeno 30 anni.' },
        { q: 'Come influisce l\'inflazione sui risparmi pensionistici?', a: 'L\'inflazione erode il potere d\'acquisto nel tempo. Con un\'inflazione media del 2,5% annuo, 1 milione tra 30 anni avrà il potere d\'acquisto di circa 477.000 in euro di oggi. Il calcolatore mostra sia valori nominali che adeguati all\'inflazione.' },
        { q: 'Qual è un rendimento annuale atteso ragionevole?', a: 'Storicamente il mercato azionario ha una media del 7-10% annuo. Un portafoglio bilanciato potrebbe avere una media del 6-8%. Stime conservative (5-7%) sono raccomandate per la pianificazione pensionistica.' },
        { q: 'I miei dati finanziari vengono salvati o condivisi?', a: 'No. Tutti i calcoli avvengono interamente nel browser. Le informazioni finanziarie non vengono mai inviate a server o condivise con terze parti.' },
        { q: 'Quanto è accurato questo calcolatore?', a: 'Il calcolatore fornisce stime basate sui parametri inseriti. I rendimenti effettivi variano di anno in anno. Usa questo come strumento di pianificazione, non come garanzia. Considera di consultare un consulente finanziario.' },
      ],
    },
    es: {
      title: 'Calculadora de Jubilación: Planifica Tu Futuro Financiero con Confianza',
      paragraphs: [
        'Planificar la jubilación es una de las decisiones financieras más importantes. Una calculadora de jubilación ayuda a estimar cuánto necesitas ahorrar para mantener tu estilo de vida deseado después de dejar de trabajar. Considerando tu edad actual, ahorros, contribuciones mensuales, rendimientos esperados e inflación, puedes obtener un panorama realista de tu futuro financiero.',
        'El poder del interés compuesto hace que incluso pequeñas contribuciones mensuales crezcan significativamente a lo largo de las décadas. Empezar a ahorrar temprano da a tu dinero más tiempo para capitalizarse, lo que puede marcar una diferencia dramática en tu saldo final de jubilación.',
        'La inflación es un factor crítico que muchas personas pasan por alto. Un dólar hoy no comprará la misma cantidad de bienes en 30 años. Nuestra calculadora ajusta tus ahorros proyectados por inflación para que puedas ver el poder adquisitivo real de tu fondo de jubilación.',
        'La regla del 4% es una guía ampliamente utilizada que sugiere que puedes retirar con seguridad el 4% de tus ahorros cada año sin quedarte sin dinero en 30 años. La calculadora usa esta regla para estimar tu potencial ingreso mensual en la jubilación.',
      ],
      faq: [
        { q: '¿Qué es la regla del 4%?', a: 'La regla del 4% sugiere retirar el 4% de tus ahorros totales en el primer año de jubilación, ajustando por inflación cada año. Los estudios muestran que este enfoque tiene alta probabilidad de hacer durar el dinero al menos 30 años.' },
        { q: '¿Cómo afecta la inflación a mis ahorros?', a: 'La inflación erosiona el poder adquisitivo con el tiempo. Con una inflación promedio del 2.5% anual, $1 millón en 30 años tendrá un poder adquisitivo de aproximadamente $477,000 en dólares de hoy.' },
        { q: '¿Cuál es un retorno anual esperado razonable?', a: 'Históricamente, el mercado de valores ha promediado un 7-10% anual. Un portafolio equilibrado podría promediar 6-8%. Se recomiendan estimaciones conservadoras (5-7%) para la planificación de jubilación.' },
        { q: '¿Se almacenan o comparten mis datos financieros?', a: 'No. Todos los cálculos se realizan completamente en tu navegador. Tu información financiera nunca se envía a servidores ni se comparte con terceros.' },
        { q: '¿Qué tan precisa es esta calculadora?', a: 'La calculadora proporciona estimaciones basadas en los parámetros ingresados. Los rendimientos reales varían de año en año. Úsala como herramienta de planificación y considera consultar a un asesor financiero.' },
      ],
    },
    fr: {
      title: 'Calculateur de Retraite : Planifiez Votre Avenir Financier en Toute Confiance',
      paragraphs: [
        'Planifier sa retraite est l\'une des décisions financières les plus importantes. Un calculateur de retraite aide à estimer combien épargner pour maintenir le mode de vie souhaité après avoir arrêté de travailler. En tenant compte de votre âge, épargne, contributions mensuelles, rendements et inflation, vous obtenez un aperçu réaliste de votre avenir financier.',
        'La puissance des intérêts composés fait que même de petites contributions mensuelles croissent considérablement sur des décennies. Commencer tôt donne à votre argent plus de temps pour se capitaliser, ce qui peut faire une différence spectaculaire dans votre solde final de retraite.',
        'L\'inflation est un facteur critique souvent négligé. Un euro aujourd\'hui n\'achètera pas la même quantité de biens dans 30 ans. Notre calculateur ajuste vos projections à l\'inflation pour montrer le pouvoir d\'achat réel de votre fonds de retraite.',
        'La règle des 4% est un guide largement utilisé suggérant de retirer 4% de votre épargne retraite chaque année sans épuiser le capital sur 30 ans. Le calculateur utilise cette règle pour estimer votre revenu mensuel potentiel à la retraite.',
      ],
      faq: [
        { q: 'Qu\'est-ce que la règle des 4% ?', a: 'La règle des 4% suggère de retirer 4% de votre épargne totale la première année de retraite, en ajustant pour l\'inflation ensuite. Les études montrent que cette approche a une forte probabilité de faire durer l\'argent au moins 30 ans.' },
        { q: 'Comment l\'inflation affecte-t-elle mon épargne ?', a: 'L\'inflation érode le pouvoir d\'achat au fil du temps. Avec une inflation moyenne de 2,5% par an, 1 million dans 30 ans aura un pouvoir d\'achat d\'environ 477 000 en euros d\'aujourd\'hui.' },
        { q: 'Quel est un rendement annuel raisonnable ?', a: 'Historiquement, le marché boursier a moyenné environ 7-10% par an. Un portefeuille équilibré pourrait moyenner 6-8%. Des estimations conservatrices (5-7%) sont recommandées pour la planification de retraite.' },
        { q: 'Mes données financières sont-elles stockées ou partagées ?', a: 'Non. Tous les calculs se font entièrement dans votre navigateur. Vos informations financières ne sont jamais envoyées à un serveur ni partagées avec des tiers.' },
        { q: 'Quelle est la précision de ce calculateur ?', a: 'Le calculateur fournit des estimations basées sur vos paramètres. Les rendements réels varient d\'année en année. Utilisez-le comme outil de planification et envisagez de consulter un conseiller financier.' },
      ],
    },
    de: {
      title: 'Rentenrechner: Planen Sie Ihre Finanzielle Zukunft mit Zuversicht',
      paragraphs: [
        'Die Altersvorsorge ist eine der wichtigsten finanziellen Entscheidungen. Ein Rentenrechner hilft Ihnen abzuschätzen, wie viel Sie sparen müssen, um Ihren gewünschten Lebensstil im Ruhestand aufrechtzuerhalten. Unter Berücksichtigung von Alter, Ersparnissen, monatlichen Beiträgen, erwarteten Renditen und Inflation erhalten Sie ein realistisches Bild Ihrer finanziellen Zukunft.',
        'Die Kraft des Zinseszinseffekts bewirkt, dass selbst kleine monatliche Beiträge über Jahrzehnte erheblich wachsen. Frühes Sparen gibt Ihrem Geld mehr Zeit sich zu vermehren, was einen dramatischen Unterschied in Ihrem endgültigen Rentenkapital ausmachen kann.',
        'Inflation ist ein kritischer Faktor, den viele übersehen. Ein Euro heute wird in 30 Jahren nicht dieselbe Menge an Gütern kaufen. Unser Rechner passt Ihre prognostizierten Ersparnisse an die Inflation an, damit Sie die reale Kaufkraft Ihres Rentenfonds sehen.',
        'Die 4%-Regel ist eine weit verbreitete Richtlinie, die vorschlägt, jährlich 4% Ihrer Rentenersparnisse zu entnehmen, ohne das Kapital in 30 Jahren aufzubrauchen. Der Rechner nutzt diese Regel zur Schätzung Ihres monatlichen Einkommens im Ruhestand.',
      ],
      faq: [
        { q: 'Was ist die 4%-Regel?', a: 'Die 4%-Regel empfiehlt, im ersten Rentenjahr 4% Ihrer Gesamtersparnis zu entnehmen und danach jährlich an die Inflation anzupassen. Studien zeigen, dass dieser Ansatz mit hoher Wahrscheinlichkeit mindestens 30 Jahre reicht.' },
        { q: 'Wie wirkt sich Inflation auf meine Ersparnisse aus?', a: 'Inflation mindert die Kaufkraft im Laufe der Zeit. Bei durchschnittlich 2,5% Inflation pro Jahr hat 1 Million in 30 Jahren die Kaufkraft von etwa 477.000 in heutigen Euro.' },
        { q: 'Was ist eine vernünftige erwartete Jahresrendite?', a: 'Historisch hat der Aktienmarkt durchschnittlich 7-10% pro Jahr erzielt. Ein ausgewogenes Portfolio könnte 6-8% erzielen. Konservative Schätzungen (5-7%) werden für die Rentenplanung empfohlen.' },
        { q: 'Werden meine Finanzdaten gespeichert oder geteilt?', a: 'Nein. Alle Berechnungen erfolgen vollständig in Ihrem Browser. Ihre Finanzinformationen werden niemals an Server gesendet oder mit Dritten geteilt.' },
        { q: 'Wie genau ist dieser Rechner?', a: 'Der Rechner liefert Schätzungen basierend auf Ihren Eingaben. Tatsächliche Renditen variieren jährlich. Nutzen Sie ihn als Planungswerkzeug und erwägen Sie die Beratung durch einen Finanzberater.' },
      ],
    },
    pt: {
      title: 'Calculadora de Aposentadoria: Planeje Seu Futuro Financeiro com Confiança',
      paragraphs: [
        'Planejar a aposentadoria é uma das decisões financeiras mais importantes. Uma calculadora de aposentadoria ajuda a estimar quanto você precisa poupar para manter o estilo de vida desejado após parar de trabalhar. Considerando idade, poupança, contribuições mensais, retornos esperados e inflação, você obtém um panorama realista do seu futuro financeiro.',
        'O poder dos juros compostos faz com que até pequenas contribuições mensais cresçam significativamente ao longo das décadas. Começar a poupar cedo dá ao seu dinheiro mais tempo para se capitalizar, o que pode fazer uma diferença dramática no saldo final de aposentadoria.',
        'A inflação é um fator crítico frequentemente ignorado. Um real hoje não comprará a mesma quantidade de bens em 30 anos. Nossa calculadora ajusta suas projeções pela inflação para mostrar o poder de compra real do seu fundo de aposentadoria.',
        'A regra dos 4% é uma diretriz amplamente utilizada que sugere retirar 4% das suas economias por ano sem esgotar o capital em 30 anos. A calculadora usa essa regra para estimar sua renda mensal potencial na aposentadoria.',
      ],
      faq: [
        { q: 'O que é a regra dos 4%?', a: 'A regra dos 4% sugere retirar 4% da poupança total no primeiro ano de aposentadoria, ajustando pela inflação nos anos seguintes. Estudos mostram que essa abordagem tem alta probabilidade de fazer o dinheiro durar pelo menos 30 anos.' },
        { q: 'Como a inflação afeta minhas economias?', a: 'A inflação corrói o poder de compra ao longo do tempo. Com inflação média de 2,5% ao ano, R$1 milhão em 30 anos terá o poder de compra de aproximadamente R$477.000 em valores de hoje.' },
        { q: 'Qual é um retorno anual esperado razoável?', a: 'Historicamente, o mercado de ações teve média de 7-10% ao ano. Um portfólio equilibrado pode ter média de 6-8%. Estimativas conservadoras (5-7%) são recomendadas para planejamento de aposentadoria.' },
        { q: 'Meus dados financeiros são armazenados ou compartilhados?', a: 'Não. Todos os cálculos acontecem inteiramente no seu navegador. Suas informações financeiras nunca são enviadas a servidores ou compartilhadas com terceiros.' },
        { q: 'Qual a precisão desta calculadora?', a: 'A calculadora fornece estimativas baseadas nos parâmetros inseridos. Os retornos reais variam de ano a ano. Use como ferramenta de planejamento e considere consultar um consultor financeiro.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="retirement-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.currentAge[lang]}</label>
              <input type="number" min={18} max={80} value={currentAge} onChange={e => setCurrentAge(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.retirementAge[lang]}</label>
              <input type="number" min={currentAge + 1} max={100} value={retirementAge} onChange={e => setRetirementAge(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.currentSavings[lang]} ($)</label>
            <input type="number" min={0} step={1000} value={currentSavings} onChange={e => setCurrentSavings(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.monthlyContribution[lang]} ($)</label>
            <input type="number" min={0} step={50} value={monthlyContribution} onChange={e => setMonthlyContribution(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.annualReturn[lang]}</label>
              <input type="number" min={0} max={30} step={0.5} value={annualReturn} onChange={e => setAnnualReturn(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.inflationRate[lang]}</label>
              <input type="number" min={0} max={20} step={0.5} value={inflationRate} onChange={e => setInflationRate(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Results */}
          {yearsToRetire > 0 && (
            <>
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{labels.results[lang]}</h3>

                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                    <div className="text-sm text-white/80">{labels.totalAtRetirement[lang]}</div>
                    <div className="text-2xl font-bold">{fmt(calculation.totalSavings)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="text-xs text-green-600 font-medium">{labels.inflationAdjusted[lang]}</div>
                      <div className="text-lg font-bold text-gray-900">{fmt(calculation.inflationAdjusted)}</div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="text-xs text-purple-600 font-medium">{labels.monthlyIncome[lang]}</div>
                      <div className="text-lg font-bold text-gray-900">{fmt(calculation.monthlyIncome4Pct)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-500">{labels.yearsToRetirement[lang]}</div>
                      <div className="text-xl font-bold text-gray-900">{yearsToRetire}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-500">{labels.totalContributions[lang]}</div>
                      <div className="text-sm font-bold text-gray-900">{fmt(calculation.totalContributed)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-500">{labels.totalGrowth[lang]}</div>
                      <div className="text-sm font-bold text-green-600">{fmt(calculation.totalGrowth)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Year-by-year table */}
              <div>
                <button
                  onClick={() => setShowTable(!showTable)}
                  className="text-sm text-blue-500 hover:text-blue-700 font-medium transition-colors"
                >
                  {showTable ? labels.hideTable[lang] : labels.showTable[lang]} - {labels.yearByYear[lang]}
                </button>
                {showTable && calculation.rows.length > 0 && (
                  <div className="mt-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="text-left px-3 py-2 text-gray-600 font-medium">{labels.year[lang]}</th>
                          <th className="text-left px-3 py-2 text-gray-600 font-medium">{labels.age[lang]}</th>
                          <th className="text-right px-3 py-2 text-gray-600 font-medium">{labels.balance[lang]}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calculation.rows.map(row => (
                          <tr key={row.year} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-3 py-1.5 text-gray-700">{row.year}</td>
                            <td className="px-3 py-1.5 text-gray-700">{row.age}</td>
                            <td className="px-3 py-1.5 text-right font-mono text-gray-900">{fmt(row.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
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
