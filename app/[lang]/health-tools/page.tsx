'use client';

import CategoryHubPage from '@/components/CategoryHubPage';
import { getToolsByCategory } from '@/lib/translations';

const toolSlugs = getToolsByCategory().health;

const translations: Record<string, { title: string; metaTitle: string; description: string; article: string; toolsHeading: string; exploreOther: string }> = {
  en: {
    title: 'Free Health & Fitness Calculators',
    metaTitle: 'Free Health & Fitness Calculators | ToolKit Online',
    description: 'BMI calculator, calorie counter, body fat calculator, sleep calculator and more free health tools.',
    toolsHeading: 'All Health & Fitness Tools',
    exploreOther: 'Explore Other Categories',
    article: `<h2>Your Personal Health and Wellness Dashboard</h2>
<p>Taking control of your health begins with understanding your body. Whether you are trying to lose weight, build muscle, improve your sleep, or simply maintain a healthy lifestyle, having access to reliable health calculators helps you set realistic goals and track your progress. ToolKit Online offers a comprehensive suite of free health and fitness tools that provide instant, science-based results without requiring any personal data to be stored or shared.</p>

<h3>Body Composition Analysis</h3>
<p>Understanding your body composition is the first step toward any fitness goal. Our BMI calculator uses your height and weight to determine your Body Mass Index, a widely used screening tool for weight categories. The body fat calculator provides a more detailed picture by estimating your body fat percentage using multiple measurement methods. The ideal weight calculator suggests healthy weight ranges based on your height, age, and gender, giving you a realistic target to work toward.</p>

<h3>Nutrition and Diet Planning</h3>
<p>Proper nutrition is the cornerstone of good health. Our calorie calculator estimates your daily caloric needs based on your activity level, age, gender, and goals — whether you want to lose weight, maintain, or gain. The TDEE calculator (Total Daily Energy Expenditure) provides a more precise estimate by factoring in your basal metabolic rate and exercise habits. The macro calculator breaks down your daily intake into protein, carbohydrates, and fats for optimal performance and recovery.</p>

<h3>Sleep and Recovery</h3>
<p>Quality sleep is essential for physical and mental health. Our sleep calculator helps you determine the ideal bedtime or wake-up time based on 90-minute sleep cycles, so you wake up feeling refreshed rather than groggy. Understanding your sleep patterns can dramatically improve your energy levels, mood, and cognitive function throughout the day.</p>

<h3>Fitness and Exercise</h3>
<p>Whether you are a runner, cyclist, or general fitness enthusiast, our pace calculator helps you plan your workouts by converting between pace, speed, and finish times. The heart rate zone calculator determines your optimal training zones for fat burning, cardio fitness, and peak performance based on your age and resting heart rate. The breathing exercise tool guides you through structured breathing patterns for relaxation and stress relief.</p>

<h3>Women Health and Family Planning</h3>
<p>Our pregnancy calculator estimates your due date and tracks key milestones throughout each trimester. The ovulation calculator helps you identify your most fertile days for family planning purposes. Both tools provide week-by-week insights to help you understand what to expect at each stage.</p>

<h3>Wellness and Lifestyle</h3>
<p>Staying hydrated is crucial for overall health. Our water intake calculator recommends how much water you should drink daily based on your weight, activity level, and climate. The blood pressure tracker helps you log and monitor your readings over time, while the blood alcohol calculator estimates your BAC based on drinks consumed, weight, and time elapsed.</p>

<p>All health tools on ToolKit Online are for informational purposes and should not replace professional medical advice. They run entirely in your browser for complete privacy.</p>`,
  },
  it: {
    title: 'Calcolatori Salute e Fitness Gratuiti',
    metaTitle: 'Calcolatori Salute e Fitness Gratuiti | ToolKit Online',
    description: 'Calcolatore BMI, contatore calorie, calcolatore grasso corporeo, calcolatore sonno e altri strumenti salute.',
    toolsHeading: 'Tutti gli Strumenti Salute e Fitness',
    exploreOther: 'Esplora Altre Categorie',
    article: `<h2>Il Tuo Dashboard Personale per Salute e Benessere</h2>
<p>Prendere il controllo della propria salute inizia con la comprensione del proprio corpo. Che tu stia cercando di perdere peso, costruire muscoli, migliorare il sonno o semplicemente mantenere uno stile di vita sano, avere accesso a calcolatori salute affidabili ti aiuta a fissare obiettivi realistici e monitorare i tuoi progressi. ToolKit Online offre una suite completa di strumenti salute e fitness gratuiti che forniscono risultati istantanei basati sulla scienza.</p>

<h3>Analisi della Composizione Corporea</h3>
<p>Comprendere la composizione corporea e il primo passo verso qualsiasi obiettivo di fitness. Il nostro calcolatore BMI usa altezza e peso per determinare il tuo Indice di Massa Corporea. Il calcolatore di grasso corporeo fornisce un quadro piu dettagliato stimando la percentuale di grasso corporeo. Il calcolatore del peso ideale suggerisce intervalli di peso sani basati su altezza, eta e genere.</p>

<h3>Nutrizione e Pianificazione Dietetica</h3>
<p>Una corretta alimentazione e la pietra angolare della buona salute. Il nostro calcolatore di calorie stima il tuo fabbisogno calorico giornaliero in base al livello di attivita, eta, genere e obiettivi. Il calcolatore TDEE fornisce una stima piu precisa considerando il metabolismo basale e le abitudini di esercizio. Il calcolatore di macro suddivide l assunzione giornaliera in proteine, carboidrati e grassi.</p>

<h3>Sonno e Recupero</h3>
<p>Un sonno di qualita e essenziale per la salute fisica e mentale. Il nostro calcolatore del sonno ti aiuta a determinare l orario ideale per andare a letto o svegliarti basandosi sui cicli di sonno di 90 minuti, cosi ti svegli riposato. Comprendere i tuoi modelli di sonno puo migliorare drasticamente i tuoi livelli di energia, umore e funzione cognitiva.</p>

<h3>Fitness ed Esercizio</h3>
<p>Che tu sia un corridore, ciclista o appassionato di fitness, il nostro calcolatore del ritmo ti aiuta a pianificare gli allenamenti convertendo tra ritmo, velocita e tempi di arrivo. Il calcolatore delle zone di frequenza cardiaca determina le tue zone di allenamento ottimali. Lo strumento per esercizi di respirazione ti guida attraverso schemi di respirazione strutturati per il rilassamento.</p>

<h3>Salute Femminile e Pianificazione Familiare</h3>
<p>Il nostro calcolatore di gravidanza stima la data prevista del parto e traccia le tappe fondamentali di ogni trimestre. Il calcolatore dell ovulazione ti aiuta a identificare i giorni piu fertili per la pianificazione familiare.</p>

<h3>Benessere e Stile di Vita</h3>
<p>Rimanere idratati e cruciale per la salute generale. Il nostro calcolatore di assunzione d acqua raccomanda quanta acqua dovresti bere quotidianamente. Il tracker della pressione sanguigna ti aiuta a registrare e monitorare le tue letture nel tempo.</p>

<p>Tutti gli strumenti salute su ToolKit Online sono a scopo informativo e non sostituiscono il parere medico professionale. Funzionano interamente nel tuo browser per la massima privacy.</p>`,
  },
  es: {
    title: 'Calculadoras de Salud y Fitness Gratuitas',
    metaTitle: 'Calculadoras de Salud y Fitness Gratuitas | ToolKit Online',
    description: 'Calculadora de IMC, contador de calorias, calculadora de grasa corporal, calculadora de sueno y mas herramientas de salud.',
    toolsHeading: 'Todas las Herramientas de Salud y Fitness',
    exploreOther: 'Explorar Otras Categorias',
    article: `<h2>Tu Panel Personal de Salud y Bienestar</h2>
<p>Tomar el control de tu salud comienza por entender tu cuerpo. Ya sea que estes tratando de perder peso, ganar musculo, mejorar tu sueno o simplemente mantener un estilo de vida saludable, tener acceso a calculadoras de salud confiables te ayuda a establecer metas realistas y seguir tu progreso. ToolKit Online ofrece un conjunto completo de herramientas de salud y fitness gratuitas que proporcionan resultados instantaneos basados en la ciencia.</p>

<h3>Analisis de Composicion Corporal</h3>
<p>Entender tu composicion corporal es el primer paso hacia cualquier objetivo de fitness. Nuestra calculadora de IMC usa tu altura y peso para determinar tu Indice de Masa Corporal. La calculadora de grasa corporal proporciona una imagen mas detallada estimando tu porcentaje de grasa corporal. La calculadora de peso ideal sugiere rangos de peso saludables basados en tu altura, edad y genero.</p>

<h3>Nutricion y Planificacion Dietetica</h3>
<p>La nutricion adecuada es la piedra angular de la buena salud. Nuestra calculadora de calorias estima tus necesidades caloricas diarias segun tu nivel de actividad, edad, genero y objetivos. La calculadora TDEE proporciona una estimacion mas precisa considerando tu tasa metabolica basal y habitos de ejercicio. La calculadora de macros desglosa tu ingesta diaria en proteinas, carbohidratos y grasas.</p>

<h3>Sueno y Recuperacion</h3>
<p>El sueno de calidad es esencial para la salud fisica y mental. Nuestra calculadora de sueno te ayuda a determinar la hora ideal para dormir o despertar basandose en ciclos de sueno de 90 minutos. Comprender tus patrones de sueno puede mejorar dramaticamente tus niveles de energia, humor y funcion cognitiva.</p>

<h3>Fitness y Ejercicio</h3>
<p>Ya seas corredor, ciclista o entusiasta del fitness, nuestra calculadora de ritmo te ayuda a planificar tus entrenamientos convirtiendo entre ritmo, velocidad y tiempos. La calculadora de zonas de frecuencia cardiaca determina tus zonas de entrenamiento optimas. La herramienta de ejercicios de respiracion te guia a traves de patrones de respiracion estructurados para relajacion.</p>

<h3>Salud Femenina y Planificacion Familiar</h3>
<p>Nuestra calculadora de embarazo estima tu fecha de parto y rastrea hitos clave de cada trimestre. La calculadora de ovulacion te ayuda a identificar tus dias mas fertiles para la planificacion familiar.</p>

<h3>Bienestar y Estilo de Vida</h3>
<p>Mantenerse hidratado es crucial para la salud general. Nuestra calculadora de ingesta de agua recomienda cuanta agua deberias beber diariamente. El rastreador de presion arterial te ayuda a registrar y monitorear tus lecturas con el tiempo.</p>

<p>Todas las herramientas de salud son con fines informativos y no reemplazan el consejo medico profesional. Funcionan completamente en tu navegador para total privacidad.</p>`,
  },
  fr: {
    title: 'Calculatrices Sante et Fitness Gratuites',
    metaTitle: 'Calculatrices Sante et Fitness Gratuites | ToolKit Online',
    description: 'Calculatrice IMC, compteur de calories, calculatrice de graisse corporelle, calculatrice de sommeil et plus d outils sante.',
    toolsHeading: 'Tous les Outils Sante et Fitness',
    exploreOther: 'Explorer les Autres Categories',
    article: `<h2>Votre Tableau de Bord Personnel Sante et Bien-etre</h2>
<p>Prendre le controle de votre sante commence par comprendre votre corps. Que vous essayiez de perdre du poids, de developper vos muscles, d ameliorer votre sommeil ou simplement de maintenir un mode de vie sain, avoir acces a des calculatrices sante fiables vous aide a fixer des objectifs realistes et a suivre vos progres. ToolKit Online propose une suite complete d outils sante et fitness gratuits qui fournissent des resultats instantanes bases sur la science.</p>

<h3>Analyse de la Composition Corporelle</h3>
<p>Comprendre votre composition corporelle est la premiere etape vers tout objectif de fitness. Notre calculatrice d IMC utilise votre taille et votre poids pour determiner votre Indice de Masse Corporelle. La calculatrice de graisse corporelle fournit une image plus detaillee en estimant votre pourcentage de graisse corporelle. La calculatrice de poids ideal suggere des fourchettes de poids saines basees sur votre taille, age et sexe.</p>

<h3>Nutrition et Planification Alimentaire</h3>
<p>Une nutrition adequaite est la pierre angulaire d une bonne sante. Notre calculatrice de calories estime vos besoins caloriques quotidiens en fonction de votre niveau d activite, age, sexe et objectifs. La calculatrice TDEE fournit une estimation plus precise en tenant compte de votre metabolisme basal et de vos habitudes d exercice. La calculatrice de macros decompose votre apport quotidien en proteines, glucides et lipides.</p>

<h3>Sommeil et Recuperation</h3>
<p>Un sommeil de qualite est essentiel pour la sante physique et mentale. Notre calculatrice de sommeil vous aide a determiner l heure ideale pour dormir ou vous reveiller en fonction de cycles de sommeil de 90 minutes. Comprendre vos habitudes de sommeil peut ameliorer considerablement vos niveaux d energie, votre humeur et votre fonction cognitive.</p>

<h3>Fitness et Exercice</h3>
<p>Que vous soyez coureur, cycliste ou passionnee de fitness, notre calculatrice d allure vous aide a planifier vos entrainements en convertissant entre allure, vitesse et temps. La calculatrice de zones de frequence cardiaque determine vos zones d entrainement optimales. L outil d exercices de respiration vous guide a travers des schemas de respiration structures pour la relaxation.</p>

<h3>Sante Feminine et Planification Familiale</h3>
<p>Notre calculatrice de grossesse estime votre date d accouchement et suit les etapes cles de chaque trimestre. La calculatrice d ovulation vous aide a identifier vos jours les plus fertiles pour la planification familiale.</p>

<h3>Bien-etre et Mode de Vie</h3>
<p>Rester hydrate est crucial pour la sante generale. Notre calculatrice d apport en eau recommande combien d eau vous devriez boire quotidiennement. Le suivi de tension arterielle vous aide a enregistrer et surveiller vos lectures au fil du temps.</p>

<p>Tous les outils sante sont a titre informatif et ne remplacent pas les conseils medicaux professionnels. Ils fonctionnent entierement dans votre navigateur pour une confidentialite totale.</p>`,
  },
  de: {
    title: 'Kostenlose Gesundheits- & Fitness-Rechner',
    metaTitle: 'Kostenlose Gesundheits- & Fitness-Rechner | ToolKit Online',
    description: 'BMI-Rechner, Kalorienzaehler, Koerperfettrechner, Schlafrechner und weitere kostenlose Gesundheitstools.',
    toolsHeading: 'Alle Gesundheits- & Fitness-Tools',
    exploreOther: 'Andere Kategorien Entdecken',
    article: `<h2>Ihr Persoenliches Gesundheits- und Wellness-Dashboard</h2>
<p>Die Kontrolle ueber Ihre Gesundheit zu uebernehmen beginnt mit dem Verstaendnis Ihres Koerpers. Ob Sie abnehmen, Muskeln aufbauen, Ihren Schlaf verbessern oder einfach einen gesunden Lebensstil beibehalten moechten — der Zugang zu zuverlaessigen Gesundheitsrechnern hilft Ihnen, realistische Ziele zu setzen und Ihren Fortschritt zu verfolgen. ToolKit Online bietet eine umfassende Suite kostenloser Gesundheits- und Fitness-Tools mit sofortigen, wissenschaftsbasierten Ergebnissen.</p>

<h3>Koerperzusammensetzungsanalyse</h3>
<p>Das Verstaendnis Ihrer Koerperzusammensetzung ist der erste Schritt zu jedem Fitnessziel. Unser BMI-Rechner verwendet Ihre Groesse und Ihr Gewicht, um Ihren Body-Mass-Index zu bestimmen. Der Koerperfettrechner liefert ein detaillierteres Bild, indem er Ihren Koerperfettanteil schaetzt. Der Idealgewicht-Rechner schlaegt gesunde Gewichtsbereiche basierend auf Groesse, Alter und Geschlecht vor.</p>

<h3>Ernaehrung und Diaetplanung</h3>
<p>Richtige Ernaehrung ist der Grundstein guter Gesundheit. Unser Kalorienrechner schaetzt Ihren taeglichen Kalorienbedarf basierend auf Aktivitaetsniveau, Alter, Geschlecht und Zielen. Der TDEE-Rechner liefert eine praezisere Schaetzung unter Beruecksichtigung Ihres Grundumsatzes und Ihrer Bewegungsgewohnheiten. Der Makro-Rechner unterteilt Ihre taegliche Aufnahme in Protein, Kohlenhydrate und Fette.</p>

<h3>Schlaf und Erholung</h3>
<p>Qualitaetsschlaf ist fuer die koerperliche und geistige Gesundheit unerlaeesslich. Unser Schlafrechner hilft Ihnen, die ideale Schlafens- oder Aufwachzeit basierend auf 90-Minuten-Schlafzyklen zu bestimmen. Das Verstaendnis Ihrer Schlafmuster kann Ihre Energieniveaus, Stimmung und kognitive Funktion drastisch verbessern.</p>

<h3>Fitness und Bewegung</h3>
<p>Ob Sie Laeufer, Radfahrer oder allgemeiner Fitness-Enthusiast sind — unser Pace-Rechner hilft Ihnen bei der Trainingsplanung durch Umrechnung zwischen Tempo, Geschwindigkeit und Zielzeiten. Der Herzfrequenzzonen-Rechner bestimmt Ihre optimalen Trainingszonen. Das Atemuebungs-Tool fuehrt Sie durch strukturierte Atemmuster zur Entspannung.</p>

<h3>Frauengesundheit und Familienplanung</h3>
<p>Unser Schwangerschaftsrechner schaetzt Ihren Geburtstermin und verfolgt wichtige Meilensteine in jedem Trimester. Der Eisprungrechner hilft Ihnen, Ihre fruchtbarsten Tage fuer die Familienplanung zu identifizieren.</p>

<h3>Wellness und Lebensstil</h3>
<p>Ausreichend Fluessigkeit ist entscheidend fuer die allgemeine Gesundheit. Unser Wasseraufnahme-Rechner empfiehlt, wie viel Wasser Sie taeglich trinken sollten. Der Blutdruck-Tracker hilft Ihnen, Ihre Werte ueber die Zeit zu protokollieren und zu ueberwachen.</p>

<p>Alle Gesundheitstools dienen nur zu Informationszwecken und ersetzen keinen professionellen medizinischen Rat. Sie laufen vollstaendig in Ihrem Browser fuer vollstaendigen Datenschutz.</p>`,
  },
  pt: {
    title: 'Calculadoras de Saude e Fitness Gratuitas',
    metaTitle: 'Calculadoras de Saude e Fitness Gratuitas | ToolKit Online',
    description: 'Calculadora de IMC, contador de calorias, calculadora de gordura corporal, calculadora de sono e mais ferramentas de saude.',
    toolsHeading: 'Todas as Ferramentas de Saude e Fitness',
    exploreOther: 'Explorar Outras Categorias',
    article: `<h2>Seu Painel Pessoal de Saude e Bem-estar</h2>
<p>Tomar o controle da sua saude comeca por entender seu corpo. Seja tentando perder peso, ganhar musculo, melhorar seu sono ou simplesmente manter um estilo de vida saudavel, ter acesso a calculadoras de saude confiaveis ajuda a definir metas realistas e acompanhar seu progresso. O ToolKit Online oferece um conjunto completo de ferramentas de saude e fitness gratuitas com resultados instantaneos baseados em ciencia.</p>

<h3>Analise de Composicao Corporal</h3>
<p>Entender sua composicao corporal e o primeiro passo para qualquer objetivo de fitness. Nossa calculadora de IMC usa sua altura e peso para determinar seu Indice de Massa Corporal. A calculadora de gordura corporal fornece uma imagem mais detalhada estimando sua porcentagem de gordura corporal. A calculadora de peso ideal sugere faixas de peso saudaveis baseadas em altura, idade e genero.</p>

<h3>Nutricao e Planejamento Dietetico</h3>
<p>A nutricao adequada e a pedra angular da boa saude. Nossa calculadora de calorias estima suas necessidades caloricas diarias com base no nivel de atividade, idade, genero e objetivos. A calculadora TDEE fornece uma estimativa mais precisa considerando sua taxa metabolica basal e habitos de exercicio. A calculadora de macros divide sua ingestao diaria em proteinas, carboidratos e gorduras.</p>

<h3>Sono e Recuperacao</h3>
<p>Sono de qualidade e essencial para a saude fisica e mental. Nossa calculadora de sono ajuda a determinar o horario ideal para dormir ou acordar com base em ciclos de sono de 90 minutos. Entender seus padroes de sono pode melhorar drasticamente seus niveis de energia, humor e funcao cognitiva.</p>

<h3>Fitness e Exercicio</h3>
<p>Seja corredor, ciclista ou entusiasta de fitness, nossa calculadora de ritmo ajuda a planejar seus treinos convertendo entre ritmo, velocidade e tempos. A calculadora de zonas de frequencia cardiaca determina suas zonas de treino ideais. A ferramenta de exercicios de respiracao guia voce atraves de padroes de respiracao estruturados para relaxamento.</p>

<h3>Saude Feminina e Planejamento Familiar</h3>
<p>Nossa calculadora de gravidez estima sua data de parto e acompanha marcos importantes de cada trimestre. A calculadora de ovulacao ajuda a identificar seus dias mais ferteis para planejamento familiar.</p>

<h3>Bem-estar e Estilo de Vida</h3>
<p>Manter-se hidratado e crucial para a saude geral. Nossa calculadora de ingestao de agua recomenda quanta agua voce deve beber diariamente. O rastreador de pressao arterial ajuda a registrar e monitorar suas leituras ao longo do tempo.</p>

<p>Todas as ferramentas de saude sao para fins informativos e nao substituem aconselhamento medico profissional. Funcionam inteiramente no seu navegador para total privacidade.</p>`,
  },
};

export default function HealthToolsPage() {
  return (
    <CategoryHubPage
      config={{
        categoryKey: 'health',
        slug: 'health-tools',
        toolSlugs: toolSlugs,
        otherCategories: [
          { key: 'finance', slug: 'finance-tools' },
          { key: 'text', slug: 'text-tools' },
          { key: 'conversion', slug: 'conversion-tools' },
          { key: 'dev', slug: 'developer-tools' },
          { key: 'math', slug: 'math-tools' },
          { key: 'images', slug: 'image-tools' },
        ],
        translations,
      }}
    />
  );
}
