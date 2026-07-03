'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function SocialSecurityCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['social-security-calculator'][lang];

  const [avgAnnualIncome, setAvgAnnualIncome] = useState('');
  const [claimingAge, setClaimingAge] = useState('67');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const income = parseFloat(avgAnnualIncome) || 0;
  const claim = parseInt(claimingAge) || 67;

  const aime = income / 12;
  const bp1 = 1174;
  const bp2 = 7078;
  let pia = Math.min(aime, bp1) * 0.9;
  if (aime > bp1) pia += (Math.min(aime, bp2) - bp1) * 0.32;
  if (aime > bp2) pia += (aime - bp2) * 0.15;

  const fra = 67;
  const clampedClaim = Math.max(62, Math.min(70, claim));
  let factor = 1;
  if (clampedClaim < fra) {
    const monthsEarly = (fra - clampedClaim) * 12;
    const first = Math.min(monthsEarly, 36);
    const rest = Math.max(0, monthsEarly - 36);
    factor = 1 - first * (5 / 900) - rest * (5 / 1200);
  } else if (clampedClaim > fra) {
    const monthsLate = (clampedClaim - fra) * 12;
    factor = 1 + monthsLate * (0.08 / 12);
  }

  const monthlyBenefit = pia * factor;
  const annualBenefit = monthlyBenefit * 12;

  const labels = {
    avgAnnualIncome: {
      en: 'Average Annual Income ($)',
      it: 'Reddito Annuo Medio ($)',
      es: 'Ingreso Anual Promedio ($)',
      fr: 'Revenu Annuel Moyen ($)',
      de: 'Durchschnittliches Jahreseinkommen ($)',
      pt: 'Renda Anual Média ($)',
    },
    claimingAge: {
      en: 'Claiming Age (62-70)',
      it: 'Età di Richiesta (62-70)',
      es: 'Edad de Reclamación (62-70)',
      fr: 'Âge de Demande (62-70)',
      de: 'Antragsalter (62-70)',
      pt: 'Idade de Solicitação (62-70)',
    },
    monthlyBenefit: {
      en: 'Estimated Monthly Benefit',
      it: 'Beneficio Mensile Stimato',
      es: 'Beneficio Mensual Estimado',
      fr: 'Prestation Mensuelle Estimée',
      de: 'Geschätzte Monatliche Leistung',
      pt: 'Benefício Mensal Estimado',
    },
    benefitAtFra: {
      en: 'Benefit at Full Retirement Age',
      it: "Beneficio all'Età Pensionabile Piena",
      es: 'Beneficio a la Edad Plena de Jubilación',
      fr: "Prestation à l'Âge de Retraite à Taux Plein",
      de: 'Leistung im Regelrentenalter',
      pt: 'Benefício na Idade de Aposentadoria Plena',
    },
    annualBenefit: {
      en: 'Annual Benefit',
      it: 'Beneficio Annuo',
      es: 'Beneficio Anual',
      fr: 'Prestation Annuelle',
      de: 'Jährliche Leistung',
      pt: 'Benefício Anual',
    },
    claimingAgeResult: {
      en: 'Claiming Age',
      it: 'Età di Richiesta',
      es: 'Edad de Reclamación',
      fr: 'Âge de Demande',
      de: 'Antragsalter',
      pt: 'Idade de Solicitação',
    },
    breakdown: {
      en: 'Benefit Breakdown',
      it: 'Dettaglio Beneficio',
      es: 'Desglose del Beneficio',
      fr: 'Détail de la Prestation',
      de: 'Leistungsaufschlüsselung',
      pt: 'Detalhamento do Benefício',
    },
  } as Record<string, Record<Locale, string>>;

  const seoContent: Record<
    Locale,
    { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }
  > = {
    en: {
      title: 'Free Social Security Calculator — Estimate Your Monthly Retirement Benefits',
      paragraphs: [
        'The Social Security Calculator gives you a quick estimate of your monthly retirement benefits based on your average annual income and the age you plan to start claiming. It applies simplified progressive formulas to model how the Social Security Administration converts your earnings into a monthly payment.',
        'Your benefit depends heavily on when you claim. The full retirement age (FRA) for anyone born in 1960 or later is 67. Claiming early, as soon as age 62, permanently reduces your monthly check, while delaying past 67 adds delayed retirement credits worth roughly 8% per year up to age 70.',
        'This estimate uses 2026 approximate bend points to weight your averaged earnings, giving more benefit relative to lower income and less to higher income. That is why two people with very different salaries can receive closer monthly amounts than their pay difference suggests.',
        'Use this tool to compare claiming early versus delayed, plan your retirement timeline, and understand the trade-off between a smaller check now and a larger check later. Always confirm your official numbers with the Social Security Administration.',
      ],
      faq: [
        {
          q: 'How accurate is this Social Security estimate?',
          a: 'It is a rough estimate for planning only. The SSA uses your 35 highest indexed-earning years, official bend points, your full retirement age of 67, delayed retirement credits and early-claiming reductions. This tool simplifies those steps.',
        },
        {
          q: 'What is full retirement age?',
          a: 'Full retirement age (FRA) is when you can claim 100% of your benefit. For anyone born in 1960 or later it is 67. Claiming before 67 reduces your benefit; claiming after increases it.',
        },
        {
          q: 'Should I claim early at 62 or wait?',
          a: 'Claiming at 62 permanently reduces your monthly benefit, while delaying up to age 70 earns delayed retirement credits of about 8% per year. The right choice depends on your health, savings and income needs.',
        },
        {
          q: 'What are bend points?',
          a: 'Bend points are income thresholds that make the benefit formula progressive. Your averaged monthly earnings are weighted at 90%, 32% and 15% across the tiers, so lower earnings are replaced at a higher rate.',
        },
      ],
    },
    it: {
      title:
        'Calcolatore Previdenza Sociale Gratuito — Stima i Tuoi Benefici Pensionistici Mensili',
      paragraphs: [
        "Il Calcolatore Previdenza Sociale ti offre una stima rapida dei tuoi benefici pensionistici mensili in base al reddito annuo medio e all'età in cui prevedi di iniziare a richiederli. Applica formule progressive semplificate per modellare come i guadagni diventano un pagamento mensile.",
        "Il tuo beneficio dipende molto da quando fai richiesta. L'età pensionabile piena (FRA) per chi è nato nel 1960 o dopo è 67 anni. Richiedere in anticipo, già a 62 anni, riduce in modo permanente l'assegno mensile, mentre posticipare oltre i 67 aggiunge crediti di circa l'8% l'anno fino a 70 anni.",
        'Questa stima usa i punti di flesso approssimativi del 2026 per ponderare i tuoi guadagni medi, riconoscendo più beneficio ai redditi bassi e meno a quelli alti. Per questo persone con stipendi molto diversi possono ricevere importi mensili più vicini della differenza di reddito.',
        "Usa questo strumento per confrontare la richiesta anticipata con quella posticipata, pianificare la tua pensione e capire il compromesso tra un assegno più piccolo ora e uno più grande dopo. Verifica sempre i numeri ufficiali con l'ente previdenziale.",
      ],
      faq: [
        {
          q: 'Quanto è accurata questa stima?',
          a: "È solo una stima approssimativa per la pianificazione. L'SSA usa i 35 anni di guadagni indicizzati più alti, i punti di flesso ufficiali, l'età pensionabile di 67 anni, i crediti di posticipo e le riduzioni per richiesta anticipata.",
        },
        {
          q: "Cos'è l'età pensionabile piena?",
          a: "L'età pensionabile piena (FRA) è quando puoi richiedere il 100% del beneficio. Per chi è nato nel 1960 o dopo è 67 anni. Richiedere prima riduce il beneficio, dopo lo aumenta.",
        },
        {
          q: 'Conviene richiedere a 62 anni o aspettare?',
          a: "Richiedere a 62 anni riduce in modo permanente il beneficio mensile, mentre posticipare fino a 70 anni matura crediti di circa l'8% l'anno. La scelta dipende da salute, risparmi e bisogni di reddito.",
        },
        {
          q: 'Cosa sono i punti di flesso?',
          a: 'I punti di flesso sono soglie di reddito che rendono progressiva la formula. I guadagni medi mensili sono ponderati al 90%, 32% e 15% tra le fasce, quindi i redditi bassi sono sostituiti a un tasso più alto.',
        },
      ],
    },
    es: {
      title:
        'Calculadora de Seguridad Social Gratis — Estima tus Beneficios Mensuales de Jubilación',
      paragraphs: [
        'La Calculadora de Seguridad Social te ofrece una estimación rápida de tus beneficios mensuales de jubilación según tu ingreso anual promedio y la edad en que planeas empezar a reclamar. Aplica fórmulas progresivas simplificadas para modelar cómo tus ingresos se convierten en un pago mensual.',
        'Tu beneficio depende mucho de cuándo reclames. La edad plena de jubilación (FRA) para quienes nacieron en 1960 o después es 67 años. Reclamar antes, desde los 62, reduce de forma permanente tu cheque mensual, mientras que retrasarlo más allá de los 67 suma créditos de aproximadamente 8% al año hasta los 70.',
        'Esta estimación usa los puntos de inflexión aproximados de 2026 para ponderar tus ingresos promedio, dando más beneficio a los ingresos bajos y menos a los altos. Por eso dos personas con salarios muy distintos pueden recibir montos mensuales más parecidos de lo esperado.',
        'Usa esta herramienta para comparar reclamar temprano frente a retrasarlo, planificar tu jubilación y entender el equilibrio entre un cheque menor ahora y uno mayor después. Confirma siempre tus cifras oficiales con la administración del seguro social.',
      ],
      faq: [
        {
          q: '¿Qué tan precisa es esta estimación?',
          a: 'Es solo una estimación aproximada para planificar. La SSA usa tus 35 años de mayores ingresos indexados, los puntos de inflexión oficiales, la edad plena de 67 años, los créditos por retraso y las reducciones por reclamo anticipado.',
        },
        {
          q: '¿Qué es la edad plena de jubilación?',
          a: 'La edad plena de jubilación (FRA) es cuando puedes reclamar el 100% de tu beneficio. Para quienes nacieron en 1960 o después es 67 años. Reclamar antes lo reduce; después lo aumenta.',
        },
        {
          q: '¿Debo reclamar a los 62 o esperar?',
          a: 'Reclamar a los 62 reduce de forma permanente tu beneficio mensual, mientras que retrasarlo hasta los 70 gana créditos de aproximadamente 8% al año. La decisión depende de tu salud, ahorros e ingresos.',
        },
        {
          q: '¿Qué son los puntos de inflexión?',
          a: 'Son umbrales de ingreso que hacen progresiva la fórmula. Tus ingresos mensuales promedio se ponderan al 90%, 32% y 15% por tramos, así que los ingresos bajos se reemplazan a una tasa mayor.',
        },
      ],
    },
    fr: {
      title:
        'Calculateur de Sécurité Sociale Gratuit — Estimez vos Prestations Mensuelles de Retraite',
      paragraphs: [
        "Le Calculateur de Sécurité Sociale vous donne une estimation rapide de vos prestations mensuelles de retraite selon votre revenu annuel moyen et l'âge auquel vous prévoyez de commencer à les percevoir. Il applique des formules progressives simplifiées pour modéliser la conversion de vos revenus en versement mensuel.",
        "Votre prestation dépend fortement du moment de la demande. L'âge de retraite à taux plein (FRA) pour les personnes nées en 1960 ou après est de 67 ans. Demander tôt, dès 62 ans, réduit définitivement votre chèque mensuel, tandis que reporter au-delà de 67 ans ajoute des crédits d'environ 8% par an jusqu'à 70 ans.",
        'Cette estimation utilise les points de courbure approximatifs de 2026 pour pondérer vos revenus moyens, accordant plus de prestation aux revenus faibles et moins aux revenus élevés. Ainsi, deux personnes aux salaires très différents peuvent recevoir des montants mensuels plus proches que prévu.',
        "Utilisez cet outil pour comparer une demande anticipée à une demande différée, planifier votre retraite et comprendre le compromis entre un chèque plus petit maintenant et un plus grand plus tard. Confirmez toujours vos chiffres officiels auprès de l'administration.",
      ],
      faq: [
        {
          q: 'Quelle est la précision de cette estimation ?',
          a: "C'est une estimation approximative pour la planification. La SSA utilise vos 35 meilleures années de revenus indexés, les points de courbure officiels, l'âge de retraite de 67 ans, les crédits de report et les réductions pour demande anticipée.",
        },
        {
          q: "Qu'est-ce que l'âge de retraite à taux plein ?",
          a: "L'âge de retraite à taux plein (FRA) est le moment où vous pouvez percevoir 100% de votre prestation. Pour les personnes nées en 1960 ou après, il est de 67 ans. Demander avant la réduit ; après l'augmente.",
        },
        {
          q: 'Faut-il demander à 62 ans ou attendre ?',
          a: "Demander à 62 ans réduit définitivement votre prestation mensuelle, tandis que reporter jusqu'à 70 ans génère des crédits d'environ 8% par an. Le bon choix dépend de votre santé, épargne et besoins.",
        },
        {
          q: 'Que sont les points de courbure ?',
          a: 'Ce sont des seuils de revenu qui rendent la formule progressive. Vos revenus mensuels moyens sont pondérés à 90%, 32% et 15% par tranche, si bien que les revenus faibles sont remplacés à un taux plus élevé.',
        },
      ],
    },
    de: {
      title: 'Kostenloser Sozialversicherungs-Rechner — Schätzen Sie Ihre Monatliche Rente',
      paragraphs: [
        'Der Sozialversicherungs-Rechner liefert eine schnelle Schätzung Ihrer monatlichen Rentenleistung auf Basis Ihres durchschnittlichen Jahreseinkommens und des Alters, in dem Sie den Antrag stellen möchten. Er nutzt vereinfachte progressive Formeln, um zu modellieren, wie Einkommen in eine Monatszahlung umgewandelt wird.',
        'Ihre Leistung hängt stark davon ab, wann Sie den Antrag stellen. Das Regelrentenalter (FRA) beträgt für alle ab Jahrgang 1960 genau 67 Jahre. Ein früher Antrag, bereits ab 62, senkt Ihren Monatsscheck dauerhaft, während ein Aufschub über 67 hinaus Gutschriften von etwa 8% pro Jahr bis zum Alter von 70 hinzufügt.',
        'Diese Schätzung verwendet die ungefähren Knickpunkte von 2026, um Ihr Durchschnittseinkommen zu gewichten, wobei niedrigere Einkommen stärker und höhere schwächer berücksichtigt werden. Deshalb erhalten zwei Personen mit sehr unterschiedlichen Gehältern oft ähnlichere Monatsbeträge als erwartet.',
        'Nutzen Sie dieses Tool, um frühen und aufgeschobenen Antrag zu vergleichen, Ihren Ruhestand zu planen und den Kompromiss zwischen einem kleineren Scheck jetzt und einem größeren später zu verstehen. Bestätigen Sie Ihre offiziellen Zahlen stets bei der Behörde.',
      ],
      faq: [
        {
          q: 'Wie genau ist diese Schätzung?',
          a: 'Es ist nur eine grobe Schätzung zur Planung. Die SSA verwendet Ihre 35 höchsten indexierten Verdienstjahre, die offiziellen Knickpunkte, das Regelrentenalter von 67 Jahren, Aufschubgutschriften und Kürzungen bei frühem Antrag.',
        },
        {
          q: 'Was ist das Regelrentenalter?',
          a: 'Das Regelrentenalter (FRA) ist der Zeitpunkt, ab dem Sie 100% Ihrer Leistung erhalten. Für alle ab Jahrgang 1960 sind es 67 Jahre. Ein früherer Antrag senkt die Leistung, ein späterer erhöht sie.',
        },
        {
          q: 'Sollte ich mit 62 beantragen oder warten?',
          a: 'Ein Antrag mit 62 senkt Ihre Monatsleistung dauerhaft, während ein Aufschub bis 70 Gutschriften von etwa 8% pro Jahr bringt. Die richtige Wahl hängt von Gesundheit, Ersparnissen und Einkommensbedarf ab.',
        },
        {
          q: 'Was sind Knickpunkte?',
          a: 'Knickpunkte sind Einkommensschwellen, die die Formel progressiv machen. Ihr durchschnittliches Monatseinkommen wird mit 90%, 32% und 15% je Stufe gewichtet, sodass niedrige Einkommen zu einem höheren Satz ersetzt werden.',
        },
      ],
    },
    pt: {
      title:
        'Calculadora de Seguridade Social Grátis — Estime seus Benefícios Mensais de Aposentadoria',
      paragraphs: [
        'A Calculadora de Seguridade Social oferece uma estimativa rápida dos seus benefícios mensais de aposentadoria com base na sua renda anual média e na idade em que planeja começar a solicitar. Ela aplica fórmulas progressivas simplificadas para modelar como os ganhos viram um pagamento mensal.',
        'Seu benefício depende muito de quando você solicita. A idade de aposentadoria plena (FRA) para quem nasceu em 1960 ou depois é 67 anos. Solicitar cedo, já aos 62, reduz permanentemente o cheque mensal, enquanto adiar além dos 67 acrescenta créditos de cerca de 8% ao ano até os 70 anos.',
        'Esta estimativa usa os pontos de inflexão aproximados de 2026 para ponderar seus ganhos médios, dando mais benefício à renda baixa e menos à alta. Por isso duas pessoas com salários bem diferentes podem receber valores mensais mais próximos do que a diferença de renda sugere.',
        'Use esta ferramenta para comparar solicitação antecipada com adiada, planejar sua aposentadoria e entender o equilíbrio entre um cheque menor agora e um maior depois. Confirme sempre seus números oficiais com o órgão de previdência.',
      ],
      faq: [
        {
          q: 'Quão precisa é esta estimativa?',
          a: 'É apenas uma estimativa aproximada para planejamento. A SSA usa seus 35 anos de maiores ganhos indexados, os pontos de inflexão oficiais, a idade de aposentadoria de 67 anos, os créditos por adiamento e as reduções por solicitação antecipada.',
        },
        {
          q: 'O que é a idade de aposentadoria plena?',
          a: 'A idade de aposentadoria plena (FRA) é quando você pode solicitar 100% do benefício. Para quem nasceu em 1960 ou depois é 67 anos. Solicitar antes reduz o benefício; depois aumenta.',
        },
        {
          q: 'Devo solicitar aos 62 ou esperar?',
          a: 'Solicitar aos 62 reduz permanentemente seu benefício mensal, enquanto adiar até os 70 gera créditos de cerca de 8% ao ano. A escolha certa depende da sua saúde, poupança e necessidades de renda.',
        },
        {
          q: 'O que são pontos de inflexão?',
          a: 'São limites de renda que tornam a fórmula progressiva. Seus ganhos mensais médios são ponderados a 90%, 32% e 15% por faixa, de modo que rendas baixas são substituídas a uma taxa maior.',
        },
      ],
    },
  };

  const seo = seoContent[lang];
  const formatCurrency = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <ToolPageWrapper toolSlug="social-security-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.avgAnnualIncome[lang]}
              </label>
              <input
                type="number"
                value={avgAnnualIncome}
                onChange={(e) => setAvgAnnualIncome(e.target.value)}
                placeholder="60000"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.claimingAge[lang]}
              </label>
              <input
                type="number"
                value={claimingAge}
                onChange={(e) => setClaimingAge(e.target.value)}
                placeholder="67"
                min="62"
                max="70"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {income > 0 && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                <div className="text-xs text-blue-600 font-medium mb-1">
                  {labels.monthlyBenefit[lang]}
                </div>
                <div className="text-4xl font-bold text-gray-900">
                  ${formatCurrency(monthlyBenefit)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">{labels.benefitAtFra[lang]}</div>
                  <div className="text-xl font-bold text-gray-900">${formatCurrency(pia)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">{labels.claimingAgeResult[lang]}</div>
                  <div className="text-xl font-bold text-gray-900">{clampedClaim}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">{labels.breakdown[lang]}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">{labels.benefitAtFra[lang]}</span>
                    <span className="font-semibold">${formatCurrency(pia)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">{labels.annualBenefit[lang]}</span>
                    <span className="font-semibold">${formatCurrency(annualBenefit)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => (
            <p key={i} className="text-gray-700 leading-relaxed mb-4">
              {p}
            </p>
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
