'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function PregnancyCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['pregnancy-calculator'][lang];

  const [method, setMethod] = useState<'lmp' | 'conception'>('lmp');
  const [date, setDate] = useState('');
  const [copied, setCopied] = useState(false);

  const labels = {
    method: { en: 'Calculation Method', it: 'Metodo di Calcolo', es: 'Método de Cálculo', fr: 'Méthode de Calcul', de: 'Berechnungsmethode', pt: 'Método de Cálculo' },
    lmp: { en: 'Last Menstrual Period (LMP)', it: 'Ultimo Ciclo Mestruale (UPM)', es: 'Última Menstruación (FUM)', fr: 'Dernières Règles (DDR)', de: 'Letzte Periode (LMP)', pt: 'Última Menstruação (DUM)' },
    conception: { en: 'Conception Date', it: 'Data di Concepimento', es: 'Fecha de Concepción', fr: 'Date de Conception', de: 'Empfängnisdatum', pt: 'Data de Concepção' },
    selectDate: { en: 'Select Date', it: 'Seleziona Data', es: 'Seleccionar Fecha', fr: 'Sélectionner la Date', de: 'Datum Wählen', pt: 'Selecionar Data' },
    dueDate: { en: 'Estimated Due Date', it: 'Data Presunta del Parto', es: 'Fecha Estimada de Parto', fr: 'Date Prévue d\'Accouchement', de: 'Errechneter Geburtstermin', pt: 'Data Prevista do Parto' },
    currentWeek: { en: 'Current Week', it: 'Settimana Attuale', es: 'Semana Actual', fr: 'Semaine Actuelle', de: 'Aktuelle Woche', pt: 'Semana Atual' },
    trimester: { en: 'Trimester', it: 'Trimestre', es: 'Trimestre', fr: 'Trimestre', de: 'Trimester', pt: 'Trimestre' },
    first: { en: '1st Trimester', it: '1° Trimestre', es: '1er Trimestre', fr: '1er Trimestre', de: '1. Trimester', pt: '1º Trimestre' },
    second: { en: '2nd Trimester', it: '2° Trimestre', es: '2do Trimestre', fr: '2ème Trimestre', de: '2. Trimester', pt: '2º Trimestre' },
    third: { en: '3rd Trimester', it: '3° Trimestre', es: '3er Trimestre', fr: '3ème Trimestre', de: '3. Trimester', pt: '3º Trimestre' },
    weeksRemaining: { en: 'Weeks Remaining', it: 'Settimane Rimanenti', es: 'Semanas Restantes', fr: 'Semaines Restantes', de: 'Verbleibende Wochen', pt: 'Semanas Restantes' },
    daysRemaining: { en: 'Days Remaining', it: 'Giorni Rimanenti', es: 'Días Restantes', fr: 'Jours Restants', de: 'Verbleibende Tage', pt: 'Dias Restantes' },
    conceptionEst: { en: 'Est. Conception Date', it: 'Data Concepimento Stimata', es: 'Fecha Concepción Estimada', fr: 'Date Conception Estimée', de: 'Geschätztes Empfängnisdatum', pt: 'Data Concepção Estimada' },
    firstTrimesterEnd: { en: '1st Trimester Ends', it: 'Fine 1° Trimestre', es: 'Fin 1er Trimestre', fr: 'Fin 1er Trimestre', de: 'Ende 1. Trimester', pt: 'Fim 1º Trimestre' },
    secondTrimesterEnd: { en: '2nd Trimester Ends', it: 'Fine 2° Trimestre', es: 'Fin 2do Trimestre', fr: 'Fin 2ème Trimestre', de: 'Ende 2. Trimester', pt: 'Fim 2º Trimestre' },
    weeks: { en: 'weeks', it: 'settimane', es: 'semanas', fr: 'semaines', de: 'Wochen', pt: 'semanas' },
    days: { en: 'days', it: 'giorni', es: 'días', fr: 'jours', de: 'Tage', pt: 'dias' },
    progress: { en: 'Pregnancy Progress', it: 'Progresso Gravidanza', es: 'Progreso del Embarazo', fr: 'Progression de la Grossesse', de: 'Schwangerschaftsfortschritt', pt: 'Progresso da Gravidez' },
    milestones: { en: 'Key Milestones', it: 'Tappe Fondamentali', es: 'Hitos Clave', fr: 'Étapes Clés', de: 'Wichtige Meilensteine', pt: 'Marcos Importantes' },
    disclaimer: { en: 'This calculator provides estimates only. Consult your healthcare provider for medical advice.', it: 'Questo calcolatore fornisce solo stime. Consulta il tuo medico per consigli medici.', es: 'Esta calculadora solo proporciona estimaciones. Consulta a tu médico.', fr: 'Ce calculateur fournit des estimations uniquement. Consultez votre médecin.', de: 'Dieser Rechner liefert nur Schätzungen. Konsultieren Sie Ihren Arzt.', pt: 'Esta calculadora fornece apenas estimativas. Consulte seu médico.' },
    reset: { en: 'Reset', it: 'Reset', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Reiniciar' },
    copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
    copyDueDate: { en: 'Copy Due Date', it: 'Copia Data Parto', es: 'Copiar Fecha de Parto', fr: 'Copier la Date', de: 'Geburtstermin Kopieren', pt: 'Copiar Data de Parto' },
  } as Record<string, Record<Locale, string>>;

  const inputDate = date ? new Date(date) : null;
  const today = new Date();

  // LMP-based: due date = LMP + 280 days (Naegele's rule)
  // Conception-based: due date = conception + 266 days
  const lmpDate = inputDate ? (method === 'lmp' ? inputDate : new Date(inputDate.getTime() - 14 * 86400000)) : null;
  const conceptionDate = inputDate ? (method === 'conception' ? inputDate : new Date(inputDate.getTime() + 14 * 86400000)) : null;
  const dueDate = lmpDate ? new Date(lmpDate.getTime() + 280 * 86400000) : null;

  const gestationalDays = lmpDate ? Math.floor((today.getTime() - lmpDate.getTime()) / 86400000) : 0;
  const gestationalWeeks = Math.floor(gestationalDays / 7);
  const gestationalRemainingDays = gestationalDays % 7;
  const daysUntilDue = dueDate ? Math.max(0, Math.floor((dueDate.getTime() - today.getTime()) / 86400000)) : 0;
  const weeksUntilDue = Math.floor(daysUntilDue / 7);
  const progress = Math.min(100, Math.max(0, (gestationalDays / 280) * 100));

  const getTrimester = () => {
    if (gestationalWeeks < 13) return labels.first[lang];
    if (gestationalWeeks < 27) return labels.second[lang];
    return labels.third[lang];
  };

  const formatDate = (d: Date) => d.toLocaleDateString(lang === 'en' ? 'en-US' : lang, { year: 'numeric', month: 'long', day: 'numeric' });

  const firstTrimesterEnd = lmpDate ? new Date(lmpDate.getTime() + 13 * 7 * 86400000) : null;
  const secondTrimesterEnd = lmpDate ? new Date(lmpDate.getTime() + 27 * 7 * 86400000) : null;

  const hasResult = inputDate && dueDate && gestationalDays >= 0 && gestationalDays <= 300;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Pregnancy Due Date Calculator – Estimate Your Baby\'s Arrival',
      paragraphs: [
        'A pregnancy due date calculator is one of the most useful tools for expecting parents. Based on well-established obstetric methods, it estimates when your baby is likely to arrive, helping you plan prenatal care, prepare your home, and organize your schedule around this life-changing event.',
        'Our calculator uses Naegele\'s Rule, the standard method used by healthcare providers worldwide. When you enter the first day of your last menstrual period (LMP), the calculator adds 280 days (40 weeks) to estimate your due date. If you know your conception date, it adds 266 days (38 weeks) instead.',
        'The tool also shows your current gestational week, which trimester you are in, a visual progress bar, and key milestone dates. The three trimesters divide pregnancy into roughly equal thirds: weeks 1-12 (first trimester), weeks 13-26 (second trimester), and weeks 27-40 (third trimester).',
        'Please remember that only about 5% of babies are born on their exact due date. Most healthy pregnancies result in birth between 37 and 42 weeks. This calculator provides estimates for planning purposes — always consult your healthcare provider for personalized medical advice and to confirm your due date with ultrasound dating.',
      ],
      faq: [
        { q: 'How is the due date calculated?', a: 'The due date is calculated using Naegele\'s Rule: add 280 days (40 weeks) to the first day of your last menstrual period (LMP). This assumes a 28-day menstrual cycle with ovulation occurring on day 14. If you know your conception date, 266 days (38 weeks) are added instead.' },
        { q: 'How accurate is the due date estimate?', a: 'Only about 5% of babies are born on their exact due date. Most births occur within a two-week window before or after the estimated date (between 38 and 42 weeks). An early ultrasound (before 12 weeks) is the most accurate way to establish a due date.' },
        { q: 'What are the three trimesters of pregnancy?', a: 'The first trimester spans weeks 1-12 and involves early fetal development. The second trimester (weeks 13-26) is when the baby grows significantly and movement is felt. The third trimester (weeks 27-40) involves final growth and preparation for birth.' },
        { q: 'What if my menstrual cycle is not 28 days?', a: 'If your cycle is longer or shorter than 28 days, the LMP-based calculation may be slightly off. Women with longer cycles may ovulate later, which could shift the due date. In such cases, using the conception date method or an ultrasound provides a more accurate estimate.' },
        { q: 'Should I rely solely on this calculator?', a: 'No. This calculator provides a useful estimate for planning purposes, but it should not replace professional medical advice. Your doctor or midwife will use ultrasound measurements, especially in the first trimester, to confirm or adjust your due date.' },
      ],
    },
    it: {
      title: 'Calcolatore Data Presunta Parto Gratuito – Stima l\'Arrivo del Tuo Bambino',
      paragraphs: [
        'Un calcolatore della data presunta del parto è uno degli strumenti più utili per i futuri genitori. Basato su metodi ostetrici consolidati, stima quando il tuo bambino potrebbe arrivare, aiutandoti a pianificare le visite prenatali e preparare tutto il necessario.',
        'Il nostro calcolatore usa la Regola di Naegele, il metodo standard usato dai medici in tutto il mondo. Inserendo il primo giorno dell\'ultimo ciclo mestruale, il calcolatore aggiunge 280 giorni (40 settimane). Se conosci la data di concepimento, aggiunge 266 giorni (38 settimane).',
        'Lo strumento mostra anche la settimana gestazionale attuale, il trimestre in corso, una barra di progresso visuale e le date delle tappe fondamentali. I tre trimestri dividono la gravidanza in terzi: settimane 1-12, 13-26 e 27-40.',
        'Ricorda che solo il 5% dei bambini nasce nella data presunta esatta. La maggior parte delle gravidanze sane si conclude tra la 37a e la 42a settimana. Consulta sempre il tuo medico per consigli personalizzati.',
      ],
      faq: [
        { q: 'Come si calcola la data presunta del parto?', a: 'Si usa la Regola di Naegele: si aggiungono 280 giorni (40 settimane) al primo giorno dell\'ultimo ciclo mestruale. Questo presume un ciclo di 28 giorni con ovulazione al 14° giorno.' },
        { q: 'Quanto è accurata la stima?', a: 'Solo circa il 5% dei bambini nasce nella data presunta. La maggior parte nasce entro due settimane prima o dopo (tra la 38a e la 42a settimana). Un\'ecografia precoce è il metodo più accurato.' },
        { q: 'Quali sono i tre trimestri della gravidanza?', a: 'Il primo trimestre (settimane 1-12) riguarda lo sviluppo iniziale. Il secondo (13-26) è quando il bambino cresce molto. Il terzo (27-40) riguarda la crescita finale e la preparazione al parto.' },
        { q: 'E se il mio ciclo non è di 28 giorni?', a: 'Se il tuo ciclo è più lungo o più corto, il calcolo basato sull\'ultimo ciclo potrebbe essere meno preciso. In tal caso, usa la data di concepimento o un\'ecografia.' },
        { q: 'Devo affidarmi solo a questo calcolatore?', a: 'No. Questo calcolatore fornisce una stima utile per la pianificazione, ma non sostituisce il parere medico. Il tuo medico userà le misurazioni ecografiche per confermare la data.' },
      ],
    },
    es: {
      title: 'Calculadora de Fecha de Parto Gratis – Estima la Llegada de Tu Bebé',
      paragraphs: [
        'Una calculadora de fecha de parto es una de las herramientas más útiles para futuros padres. Basada en métodos obstétricos establecidos, estima cuándo podría llegar tu bebé, ayudándote a planificar el cuidado prenatal.',
        'Nuestra calculadora usa la Regla de Naegele, el método estándar usado por profesionales de salud. Al ingresar el primer día de tu última menstruación, suma 280 días (40 semanas). Si conoces la fecha de concepción, suma 266 días.',
        'La herramienta también muestra tu semana gestacional actual, el trimestre en curso, una barra de progreso y fechas de hitos clave.',
        'Recuerda que solo el 5% de los bebés nace en la fecha exacta estimada. Siempre consulta a tu médico para consejos personalizados.',
      ],
      faq: [
        { q: '¿Cómo se calcula la fecha de parto?', a: 'Se usa la Regla de Naegele: se suman 280 días al primer día de la última menstruación, asumiendo un ciclo de 28 días.' },
        { q: '¿Qué tan precisa es la estimación?', a: 'Solo el 5% de los bebés nace en la fecha estimada. La mayoría nace dentro de dos semanas antes o después. Una ecografía temprana es más precisa.' },
        { q: '¿Cuáles son los trimestres del embarazo?', a: 'Primer trimestre (semanas 1-12): desarrollo inicial. Segundo (13-26): crecimiento significativo. Tercero (27-40): crecimiento final y preparación para el parto.' },
        { q: '¿Y si mi ciclo no es de 28 días?', a: 'Si tu ciclo es diferente, usa la fecha de concepción o consulta con tu médico para una estimación más precisa.' },
        { q: '¿Debo confiar solo en esta calculadora?', a: 'No. Es una estimación útil pero no reemplaza el consejo médico. Tu doctor confirmará la fecha con ecografía.' },
      ],
    },
    fr: {
      title: 'Calculateur de Date d\'Accouchement Gratuit – Estimez l\'Arrivée de Votre Bébé',
      paragraphs: [
        'Un calculateur de date d\'accouchement est un outil essentiel pour les futurs parents. Basé sur des méthodes obstétriques éprouvées, il estime quand votre bébé est susceptible d\'arriver.',
        'Notre calculateur utilise la Règle de Naegele, la méthode standard utilisée par les professionnels de santé. En entrant le premier jour de vos dernières règles, le calculateur ajoute 280 jours (40 semaines).',
        'L\'outil affiche également votre semaine de grossesse actuelle, le trimestre en cours, une barre de progression et les dates des étapes clés.',
        'Rappelez-vous que seulement 5% des bébés naissent à la date prévue exacte. Consultez toujours votre médecin pour des conseils personnalisés.',
      ],
      faq: [
        { q: 'Comment la date d\'accouchement est-elle calculée ?', a: 'On utilise la Règle de Naegele : on ajoute 280 jours au premier jour des dernières règles, en supposant un cycle de 28 jours.' },
        { q: 'Quelle est la précision de l\'estimation ?', a: 'Seulement 5% des bébés naissent à la date prévue. La plupart naissent dans les deux semaines avant ou après. Une échographie précoce est plus précise.' },
        { q: 'Quels sont les trimestres de la grossesse ?', a: 'Premier trimestre (semaines 1-12) : développement initial. Deuxième (13-26) : croissance significative. Troisième (27-40) : croissance finale et préparation.' },
        { q: 'Et si mon cycle n\'est pas de 28 jours ?', a: 'Si votre cycle est différent, utilisez la date de conception ou consultez votre médecin pour une estimation plus précise.' },
        { q: 'Dois-je me fier uniquement à ce calculateur ?', a: 'Non. C\'est une estimation utile mais elle ne remplace pas l\'avis médical. Votre médecin confirmera la date par échographie.' },
      ],
    },
    de: {
      title: 'Kostenloser Geburtsterminrechner – Schätzen Sie die Ankunft Ihres Babys',
      paragraphs: [
        'Ein Geburtsterminrechner ist eines der nützlichsten Werkzeuge für werdende Eltern. Basierend auf bewährten geburtshilflichen Methoden schätzt er, wann Ihr Baby voraussichtlich kommt.',
        'Unser Rechner verwendet die Naegele-Regel, die Standardmethode, die von Ärzten weltweit verwendet wird. Geben Sie den ersten Tag Ihrer letzten Periode ein, und der Rechner addiert 280 Tage (40 Wochen).',
        'Das Tool zeigt auch Ihre aktuelle Schwangerschaftswoche, das Trimester, einen Fortschrittsbalken und wichtige Meilensteindaten.',
        'Bedenken Sie, dass nur 5% der Babys am errechneten Termin geboren werden. Konsultieren Sie immer Ihren Arzt für persönliche Beratung.',
      ],
      faq: [
        { q: 'Wie wird der Geburtstermin berechnet?', a: 'Die Naegele-Regel addiert 280 Tage zum ersten Tag der letzten Periode, bei einem angenommenen 28-Tage-Zyklus.' },
        { q: 'Wie genau ist die Schätzung?', a: 'Nur etwa 5% der Babys werden am errechneten Termin geboren. Die meisten kommen im Zeitfenster von zwei Wochen davor oder danach.' },
        { q: 'Was sind die Trimester der Schwangerschaft?', a: 'Erstes Trimester (Wochen 1-12): frühe Entwicklung. Zweites (13-26): signifikantes Wachstum. Drittes (27-40): Endwachstum und Geburtsvorbereitung.' },
        { q: 'Was wenn mein Zyklus nicht 28 Tage beträgt?', a: 'Bei anderem Zyklus verwenden Sie das Empfängnisdatum oder konsultieren Sie Ihren Arzt für eine genauere Schätzung.' },
        { q: 'Sollte ich mich nur auf diesen Rechner verlassen?', a: 'Nein. Er bietet eine nützliche Schätzung, ersetzt aber nicht den ärztlichen Rat. Ihr Arzt bestätigt den Termin per Ultraschall.' },
      ],
    },
    pt: {
      title: 'Calculadora de Data de Parto Grátis – Estime a Chegada do Seu Bebê',
      paragraphs: [
        'Uma calculadora de data de parto é uma das ferramentas mais úteis para futuros pais. Baseada em métodos obstétricos estabelecidos, estima quando seu bebê provavelmente chegará.',
        'Nossa calculadora usa a Regra de Naegele, o método padrão usado por profissionais de saúde. Ao inserir o primeiro dia da sua última menstruação, soma 280 dias (40 semanas).',
        'A ferramenta também mostra sua semana gestacional atual, o trimestre em curso, uma barra de progresso e datas de marcos importantes.',
        'Lembre-se que apenas 5% dos bebês nascem na data prevista exata. Sempre consulte seu médico para orientações personalizadas.',
      ],
      faq: [
        { q: 'Como a data de parto é calculada?', a: 'Usa-se a Regra de Naegele: soma-se 280 dias ao primeiro dia da última menstruação, assumindo um ciclo de 28 dias.' },
        { q: 'Qual a precisão da estimativa?', a: 'Apenas 5% dos bebês nascem na data prevista. A maioria nasce dentro de duas semanas antes ou depois. Uma ultrassonografia precoce é mais precisa.' },
        { q: 'Quais são os trimestres da gravidez?', a: 'Primeiro trimestre (semanas 1-12): desenvolvimento inicial. Segundo (13-26): crescimento significativo. Terceiro (27-40): crescimento final e preparação.' },
        { q: 'E se meu ciclo não for de 28 dias?', a: 'Se seu ciclo for diferente, use a data de concepção ou consulte seu médico para estimativa mais precisa.' },
        { q: 'Devo confiar apenas nesta calculadora?', a: 'Não. É uma estimativa útil mas não substitui orientação médica. Seu médico confirmará a data com ultrassonografia.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="pregnancy-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.method[lang]}</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as 'lmp' | 'conception')} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500">
              <option value="lmp">{labels.lmp[lang]}</option>
              <option value="conception">{labels.conception[lang]}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{method === 'lmp' ? labels.lmp[lang] : labels.conception[lang]}</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Reset and Copy */}
          <div className="flex gap-2">
            <button onClick={() => setDate('')} className="flex-1 py-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
              {labels.reset[lang]}
            </button>
            {hasResult && dueDate && (
              <button onClick={() => { navigator.clipboard.writeText(formatDate(dueDate)); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">
                {copied ? labels.copied[lang] : labels.copyDueDate[lang]}
              </button>
            )}
          </div>

          {hasResult && dueDate && conceptionDate && firstTrimesterEnd && secondTrimesterEnd && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-5 rounded-xl border border-pink-200 text-center">
                <div className="text-sm text-gray-500">{labels.dueDate[lang]}</div>
                <div className="text-3xl font-bold text-pink-700">{formatDate(dueDate)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-center">
                  <div className="text-xs text-gray-500">{labels.currentWeek[lang]}</div>
                  <div className="text-xl font-bold text-purple-700">{gestationalWeeks}w {gestationalRemainingDays}d</div>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
                  <div className="text-xs text-gray-500">{labels.trimester[lang]}</div>
                  <div className="text-lg font-semibold text-blue-700">{getTrimester()}</div>
                </div>
                <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-center">
                  <div className="text-xs text-gray-500">{labels.weeksRemaining[lang]}</div>
                  <div className="text-xl font-bold text-green-700">{weeksUntilDue} {labels.weeks[lang]}</div>
                </div>
                <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-center">
                  <div className="text-xs text-gray-500">{labels.daysRemaining[lang]}</div>
                  <div className="text-xl font-bold text-orange-700">{daysUntilDue} {labels.days[lang]}</div>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{labels.progress[lang]}</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-pink-400 to-pink-600 h-3 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {/* Milestones */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">{labels.milestones[lang]}</h3>
                <div className="space-y-2 text-sm">
                  {method === 'lmp' && conceptionDate && (
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-500">{labels.conceptionEst[lang]}</span>
                      <span className="font-medium">{formatDate(conceptionDate)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">{labels.firstTrimesterEnd[lang]}</span>
                    <span className="font-medium">{formatDate(firstTrimesterEnd)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">{labels.secondTrimesterEnd[lang]}</span>
                    <span className="font-medium">{formatDate(secondTrimesterEnd)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">{labels.dueDate[lang]}</span>
                    <span className="font-medium text-pink-700">{formatDate(dueDate)}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-400 italic text-center">{labels.disclaimer[lang]}</div>
            </div>
          )}
        </div>

        {/* SEO Article */}
        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-4">{p}</p>)}
        </article>

        {/* FAQ Accordion */}
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
