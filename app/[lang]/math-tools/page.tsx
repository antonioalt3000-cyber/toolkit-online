'use client';

import CategoryHubPage from '@/components/CategoryHubPage';
import { getToolsByCategory } from '@/lib/translations';

const toolSlugs = getToolsByCategory().math;

const translations: Record<string, { title: string; metaTitle: string; description: string; article: string; toolsHeading: string; exploreOther: string }> = {
  en: {
    title: 'Free Math Calculators & Tools',
    metaTitle: 'Free Math Calculators & Tools Online | ToolKit Online',
    description: 'Scientific calculator, age calculator, fraction calculator, GPA calculator and more free math tools.',
    toolsHeading: 'All Math Tools',
    exploreOther: 'Explore Other Categories',
    article: `<h2>Powerful Math Tools for Students, Teachers, and Professionals</h2>
<p>Mathematics is the universal language that underpins science, engineering, finance, and everyday decision-making. Whether you are a student solving homework problems, a teacher preparing lessons, a professional analyzing data, or simply someone who needs a quick calculation, having the right math tools available instantly makes all the difference. ToolKit Online offers a comprehensive collection of free math calculators and utilities that cover everything from basic arithmetic to advanced statistics and visualization.</p>

<h3>Scientific and Advanced Calculators</h3>
<p>Our scientific calculator provides a full-featured computing environment supporting trigonometric functions, logarithms, exponents, factorials, and more. It handles complex mathematical expressions with proper order of operations and supports both degree and radian modes. The fraction calculator simplifies fractions, performs arithmetic operations between fractions, and converts between fractions and decimals. The square root calculator handles perfect squares and irrational roots with high precision, while the quadratic equation solver finds roots of any quadratic equation and visualizes the parabola.</p>

<h3>Date, Time, and Age Calculations</h3>
<p>Our age calculator determines exact age in years, months, and days from any birth date, plus upcoming birthday information. The date calculator finds the difference between any two dates or adds and subtracts days from a given date — essential for project planning, legal deadlines, and event coordination. The countdown timer lets you set a target date and time and tracks the remaining duration in real time.</p>

<h3>Statistics and Data Analysis</h3>
<p>Understanding data requires statistical tools. Our standard deviation calculator computes mean, variance, standard deviation, and other statistical measures for any dataset. The probability calculator helps you solve probability problems including combinations, permutations, and conditional probabilities. The percentage change calculator determines the increase or decrease between two values, useful for financial analysis, grade comparisons, and scientific measurements. The chart maker transforms your data into visual charts and graphs for presentations and reports.</p>

<h3>Geometry and Algebra</h3>
<p>The area calculator computes the area of various geometric shapes including rectangles, circles, triangles, trapezoids, and polygons. The volume calculator handles three-dimensional shapes like spheres, cylinders, cones, and cubes. The Pythagorean theorem calculator solves for any side of a right triangle given the other two. The aspect ratio calculator determines and converts between different aspect ratios, essential for design work, photography, and video production.</p>

<h3>Number Systems and Conversions</h3>
<p>Working with different number systems is common in mathematics and computer science. Our binary calculator performs arithmetic operations directly in binary. The Roman numeral converter translates between Roman numerals and standard Arabic numbers. The random number generator produces truly random numbers within any specified range, useful for statistics, simulations, games, and decision-making.</p>

<h3>Academic and Productivity Tools</h3>
<p>Students benefit from several specialized tools. The GPA calculator computes grade point averages using different grading scales. The grade calculator determines what scores you need on remaining assignments to achieve your target grade. The matrix calculator handles matrix operations including addition, multiplication, determinants, and inverses. For productivity, the Pomodoro timer implements the popular time management technique, the stopwatch provides precise timing, and the habit tracker helps build consistent study or work routines.</p>

<p>Every math tool on ToolKit Online delivers instant, accurate results with clear explanations. All calculations happen locally in your browser for maximum speed and privacy. No account or installation is needed — just open a tool and start calculating.</p>`,
  },
  it: {
    title: 'Calcolatori Matematici Gratuiti',
    metaTitle: 'Calcolatori Matematici Gratuiti Online | ToolKit Online',
    description: 'Calcolatrice scientifica, calcolatore eta, calcolatore frazioni, calcolatore GPA e altri strumenti matematici.',
    toolsHeading: 'Tutti gli Strumenti Matematici',
    exploreOther: 'Esplora Altre Categorie',
    article: `<h2>Potenti Strumenti Matematici per Studenti, Insegnanti e Professionisti</h2>
<p>La matematica e il linguaggio universale alla base di scienza, ingegneria, finanza e decisioni quotidiane. Che tu sia uno studente che risolve compiti, un insegnante che prepara lezioni, un professionista che analizza dati o semplicemente qualcuno che ha bisogno di un calcolo rapido, avere gli strumenti matematici giusti disponibili istantaneamente fa tutta la differenza. ToolKit Online offre una collezione completa di calcolatori matematici e utilita gratuite che coprono dall aritmetica di base alla statistica avanzata e alla visualizzazione.</p>

<h3>Calcolatrici Scientifiche e Avanzate</h3>
<p>La nostra calcolatrice scientifica fornisce un ambiente di calcolo completo con supporto per funzioni trigonometriche, logaritmi, esponenti, fattoriali e altro. Gestisce espressioni matematiche complesse con il corretto ordine delle operazioni e supporta sia gradi che radianti. Il calcolatore di frazioni semplifica le frazioni, esegue operazioni aritmetiche tra frazioni e converte tra frazioni e decimali. Il calcolatore di radice quadrata gestisce quadrati perfetti e radici irrazionali con alta precisione, mentre il risolutore di equazioni quadratiche trova le radici e visualizza la parabola.</p>

<h3>Calcoli di Date, Tempo ed Eta</h3>
<p>Il nostro calcolatore di eta determina l eta esatta in anni, mesi e giorni da qualsiasi data di nascita. Il calcolatore di date trova la differenza tra due date qualsiasi o aggiunge e sottrae giorni da una data data. Il timer conto alla rovescia ti permette di impostare una data e ora obiettivo e traccia la durata rimanente in tempo reale.</p>

<h3>Statistica e Analisi dei Dati</h3>
<p>Comprendere i dati richiede strumenti statistici. Il nostro calcolatore di deviazione standard calcola media, varianza, deviazione standard e altre misure statistiche. Il calcolatore di probabilita aiuta a risolvere problemi di probabilita incluse combinazioni, permutazioni e probabilita condizionate. Il calcolatore di variazione percentuale determina l aumento o la diminuzione tra due valori. Il creatore di grafici trasforma i tuoi dati in grafici visivi per presentazioni e rapporti.</p>

<h3>Geometria e Algebra</h3>
<p>Il calcolatore di area calcola l area di varie forme geometriche inclusi rettangoli, cerchi, triangoli, trapezi e poligoni. Il calcolatore di volume gestisce forme tridimensionali come sfere, cilindri, coni e cubi. Il calcolatore del teorema di Pitagora risolve per qualsiasi lato di un triangolo rettangolo dati gli altri due. Il calcolatore del rapporto d aspetto determina e converte tra diversi rapporti, essenziale per design, fotografia e produzione video.</p>

<h3>Sistemi Numerici e Conversioni</h3>
<p>Lavorare con diversi sistemi numerici e comune in matematica e informatica. Il nostro calcolatore binario esegue operazioni aritmetiche direttamente in binario. Il convertitore di numeri romani traduce tra numeri romani e arabi standard. Il generatore di numeri casuali produce numeri veramente casuali entro qualsiasi intervallo specificato.</p>

<h3>Strumenti Accademici e di Produttivita</h3>
<p>Gli studenti beneficiano di diversi strumenti specializzati. Il calcolatore GPA calcola la media dei voti usando diverse scale di valutazione. Il calcolatore dei voti determina quali punteggi servono nei compiti rimanenti per raggiungere il voto obiettivo. Il calcolatore di matrici gestisce operazioni matriciali. Per la produttivita, il timer Pomodoro implementa la tecnica di gestione del tempo, il cronometro fornisce tempistiche precise, e il tracker delle abitudini aiuta a costruire routine di studio consistenti.</p>

<p>Ogni strumento matematico su ToolKit Online fornisce risultati istantanei e precisi. Tutti i calcoli avvengono localmente nel tuo browser. Non serve account ne installazione.</p>`,
  },
  es: {
    title: 'Calculadoras Matematicas Gratuitas',
    metaTitle: 'Calculadoras Matematicas Gratuitas Online | ToolKit Online',
    description: 'Calculadora cientifica, calculadora de edad, calculadora de fracciones, calculadora GPA y mas herramientas matematicas.',
    toolsHeading: 'Todas las Herramientas Matematicas',
    exploreOther: 'Explorar Otras Categorias',
    article: `<h2>Potentes Herramientas Matematicas para Estudiantes, Profesores y Profesionales</h2>
<p>Las matematicas son el lenguaje universal que sustenta la ciencia, la ingenieria, las finanzas y la toma de decisiones diaria. Ya seas un estudiante resolviendo tareas, un profesor preparando clases, un profesional analizando datos o simplemente alguien que necesita un calculo rapido, tener las herramientas matematicas adecuadas disponibles al instante marca toda la diferencia. ToolKit Online ofrece una coleccion completa de calculadoras matematicas y utilidades gratuitas que cubren desde aritmetica basica hasta estadistica avanzada y visualizacion.</p>

<h3>Calculadoras Cientificas y Avanzadas</h3>
<p>Nuestra calculadora cientifica proporciona un entorno de computo completo con soporte para funciones trigonometricas, logaritmos, exponentes, factoriales y mas. Maneja expresiones matematicas complejas con el orden correcto de operaciones. La calculadora de fracciones simplifica fracciones, realiza operaciones aritmeticas y convierte entre fracciones y decimales. La calculadora de raiz cuadrada maneja raices con alta precision, mientras que el solucionador de ecuaciones cuadraticas encuentra raices y visualiza la parabola.</p>

<h3>Calculos de Fechas, Tiempo y Edad</h3>
<p>Nuestra calculadora de edad determina la edad exacta en anos, meses y dias desde cualquier fecha de nacimiento. La calculadora de fechas encuentra la diferencia entre dos fechas o suma y resta dias. El temporizador de cuenta regresiva te permite establecer una fecha y hora objetivo y rastrea la duracion restante en tiempo real.</p>

<h3>Estadistica y Analisis de Datos</h3>
<p>Entender los datos requiere herramientas estadisticas. Nuestra calculadora de desviacion estandar calcula media, varianza, desviacion estandar y otras medidas estadisticas. La calculadora de probabilidad ayuda a resolver problemas incluyendo combinaciones, permutaciones y probabilidades condicionales. La calculadora de cambio porcentual determina el aumento o disminucion entre dos valores. El creador de graficos transforma tus datos en graficos visuales para presentaciones e informes.</p>

<h3>Geometria y Algebra</h3>
<p>La calculadora de area calcula el area de varias formas geometricas incluyendo rectangulos, circulos, triangulos, trapezoides y poligonos. La calculadora de volumen maneja formas tridimensionales como esferas, cilindros, conos y cubos. La calculadora del teorema de Pitagoras resuelve cualquier lado de un triangulo rectangulo dados los otros dos. La calculadora de relacion de aspecto determina y convierte entre diferentes relaciones, esencial para diseno, fotografia y produccion de video.</p>

<h3>Sistemas Numericos y Conversiones</h3>
<p>Trabajar con diferentes sistemas numericos es comun en matematicas e informatica. Nuestra calculadora binaria realiza operaciones aritmeticas directamente en binario. El conversor de numeros romanos traduce entre numeros romanos y arabigos. El generador de numeros aleatorios produce numeros verdaderamente aleatorios dentro de cualquier rango especificado.</p>

<h3>Herramientas Academicas y de Productividad</h3>
<p>Los estudiantes se benefician de varias herramientas especializadas. La calculadora GPA calcula promedios de calificaciones usando diferentes escalas. La calculadora de notas determina que puntuaciones necesitas. La calculadora de matrices maneja operaciones matriciales. Para productividad, el temporizador Pomodoro implementa la tecnica de gestion del tiempo, el cronometro proporciona mediciones precisas, y el rastreador de habitos ayuda a construir rutinas consistentes.</p>

<p>Cada herramienta matematica entrega resultados instantaneos y precisos. Todos los calculos ocurren localmente en tu navegador. No necesitas cuenta ni instalacion.</p>`,
  },
  fr: {
    title: 'Calculatrices Mathematiques Gratuites',
    metaTitle: 'Calculatrices Mathematiques Gratuites | ToolKit Online',
    description: 'Calculatrice scientifique, calculateur d age, calculateur de fractions, calculateur GPA et plus d outils mathematiques.',
    toolsHeading: 'Tous les Outils Mathematiques',
    exploreOther: 'Explorer les Autres Categories',
    article: `<h2>Outils Mathematiques Puissants pour Etudiants, Enseignants et Professionnels</h2>
<p>Les mathematiques sont le langage universel qui sous-tend la science, l ingenierie, la finance et la prise de decision quotidienne. Que vous soyez un etudiant resolvant des devoirs, un enseignant preparant des lecons, un professionnel analysant des donnees ou simplement quelqu un ayant besoin d un calcul rapide, disposer des bons outils mathematiques instantanement fait toute la difference. ToolKit Online propose une collection complete de calculatrices mathematiques et d utilitaires gratuits couvrant de l arithmetique de base aux statistiques avancees et a la visualisation.</p>

<h3>Calculatrices Scientifiques et Avancees</h3>
<p>Notre calculatrice scientifique fournit un environnement de calcul complet supportant les fonctions trigonometriques, logarithmes, exposants, factorielles et plus. Elle gere les expressions mathematiques complexes avec le bon ordre des operations. Le calculateur de fractions simplifie les fractions, effectue des operations arithmetiques et convertit entre fractions et decimales. Le calculateur de racine carree gere les racines avec haute precision, tandis que le solveur d equations quadratiques trouve les racines et visualise la parabole.</p>

<h3>Calculs de Dates, Temps et Age</h3>
<p>Notre calculateur d age determine l age exact en annees, mois et jours a partir de n importe quelle date de naissance. Le calculateur de dates trouve la difference entre deux dates ou ajoute et soustrait des jours. Le compte a rebours vous permet de definir une date et heure cibles et suit la duree restante en temps reel.</p>

<h3>Statistiques et Analyse de Donnees</h3>
<p>Comprendre les donnees necessite des outils statistiques. Notre calculateur d ecart type calcule la moyenne, la variance, l ecart type et d autres mesures statistiques. Le calculateur de probabilites aide a resoudre des problemes incluant combinaisons, permutations et probabilites conditionnelles. Le calculateur de variation en pourcentage determine l augmentation ou la diminution entre deux valeurs. Le createur de graphiques transforme vos donnees en graphiques visuels pour presentations et rapports.</p>

<h3>Geometrie et Algebre</h3>
<p>Le calculateur de surface calcule l aire de diverses formes geometriques incluant rectangles, cercles, triangles, trapezes et polygones. Le calculateur de volume gere les formes tridimensionnelles comme spheres, cylindres, cones et cubes. Le calculateur du theoreme de Pythagore resout n importe quel cote d un triangle rectangle. Le calculateur de rapport d aspect determine et convertit entre differents rapports, essentiel pour le design, la photographie et la production video.</p>

<h3>Systemes Numeriques et Conversions</h3>
<p>Travailler avec differents systemes numeriques est courant en mathematiques et informatique. Notre calculateur binaire effectue des operations arithmetiques directement en binaire. Le convertisseur de chiffres romains traduit entre chiffres romains et arabes standard. Le generateur de nombres aleatoires produit des nombres vraiment aleatoires dans n importe quelle plage specifiee.</p>

<h3>Outils Academiques et de Productivite</h3>
<p>Les etudiants beneficient de plusieurs outils specialises. Le calculateur GPA calcule les moyennes de notes avec differentes echelles. Le calculateur de notes determine quels scores sont necessaires. Le calculateur matriciel gere les operations matricielles. Pour la productivite, le minuteur Pomodoro implemente la technique de gestion du temps, le chronometre fournit un chronometrage precis, et le suivi d habitudes aide a construire des routines consistantes.</p>

<p>Chaque outil mathematique fournit des resultats instantanes et precis. Tous les calculs se font localement dans votre navigateur. Aucun compte ni installation necessaire.</p>`,
  },
  de: {
    title: 'Kostenlose Mathe-Rechner & Tools',
    metaTitle: 'Kostenlose Mathe-Rechner Online | ToolKit Online',
    description: 'Wissenschaftlicher Taschenrechner, Altersrechner, Bruchrechner, GPA-Rechner und weitere kostenlose Mathe-Tools.',
    toolsHeading: 'Alle Mathe-Tools',
    exploreOther: 'Andere Kategorien Entdecken',
    article: `<h2>Leistungsstarke Mathe-Tools fuer Schueler, Lehrer und Profis</h2>
<p>Mathematik ist die universelle Sprache, die Wissenschaft, Ingenieurwesen, Finanzen und alltaegliche Entscheidungen untermauert. Ob Sie ein Schueler sind, der Hausaufgaben loest, ein Lehrer, der Unterricht vorbereitet, ein Profi, der Daten analysiert, oder einfach jemand, der eine schnelle Berechnung braucht — die richtigen Mathe-Tools sofort verfuegbar zu haben macht den Unterschied. ToolKit Online bietet eine umfassende Sammlung kostenloser Mathematik-Rechner und Utilities, die von grundlegender Arithmetik bis zu fortgeschrittener Statistik und Visualisierung reichen.</p>

<h3>Wissenschaftliche und Fortgeschrittene Rechner</h3>
<p>Unser wissenschaftlicher Taschenrechner bietet eine voll ausgestattete Rechenumgebung mit Unterstuetzung fuer trigonometrische Funktionen, Logarithmen, Exponenten, Fakultaeten und mehr. Er verarbeitet komplexe mathematische Ausdruecke mit korrekter Operationsreihenfolge. Der Bruchrechner vereinfacht Brueche, fuehrt arithmetische Operationen durch und konvertiert zwischen Bruechen und Dezimalzahlen. Der Quadratwurzelrechner verarbeitet Wurzeln mit hoher Praezision, waehrend der quadratische Gleichungsloeser Wurzeln findet und die Parabel visualisiert.</p>

<h3>Datums-, Zeit- und Altersberechnungen</h3>
<p>Unser Altersrechner bestimmt das genaue Alter in Jahren, Monaten und Tagen ab jedem Geburtsdatum. Der Datumsrechner findet den Unterschied zwischen zwei beliebigen Daten oder addiert und subtrahiert Tage. Der Countdown-Timer laesst Sie ein Zieldatum und -zeit festlegen und verfolgt die verbleibende Dauer in Echtzeit.</p>

<h3>Statistik und Datenanalyse</h3>
<p>Daten zu verstehen erfordert statistische Werkzeuge. Unser Standardabweichungsrechner berechnet Mittelwert, Varianz, Standardabweichung und andere statistische Masse. Der Wahrscheinlichkeitsrechner hilft bei der Loesung von Problemen einschliesslich Kombinationen, Permutationen und bedingten Wahrscheinlichkeiten. Der Prozentaenderungs-Rechner bestimmt die Zunahme oder Abnahme zwischen zwei Werten. Der Diagramm-Ersteller verwandelt Ihre Daten in visuelle Grafiken fuer Praesentationen und Berichte.</p>

<h3>Geometrie und Algebra</h3>
<p>Der Flaechenrechner berechnet die Flaeche verschiedener geometrischer Formen einschliesslich Rechtecke, Kreise, Dreiecke, Trapeze und Polygone. Der Volumenrechner verarbeitet dreidimensionale Formen wie Kugeln, Zylinder, Kegel und Wuerfel. Der Satz-des-Pythagoras-Rechner loest jede Seite eines rechtwinkligen Dreiecks. Der Seitenverhaeeltnis-Rechner bestimmt und konvertiert zwischen verschiedenen Verhaeltnissen.</p>

<h3>Zahlensysteme und Konvertierungen</h3>
<p>Die Arbeit mit verschiedenen Zahlensystemen ist in Mathematik und Informatik ueblich. Unser Binaerrechner fuehrt arithmetische Operationen direkt in Binaer durch. Der Roemische-Zahlen-Konverter uebersetzt zwischen roemischen und arabischen Zahlen. Der Zufallszahlengenerator erzeugt wirklich zufaellige Zahlen in jedem angegebenen Bereich.</p>

<h3>Akademische und Produktivitaets-Tools</h3>
<p>Schueler profitieren von mehreren spezialisierten Tools. Der GPA-Rechner berechnet Notendurchschnitte mit verschiedenen Bewertungsskalen. Der Notenrechner bestimmt, welche Punktzahlen noch benoetigt werden. Der Matrizenrechner verarbeitet Matrixoperationen. Fuer Produktivitaet implementiert der Pomodoro-Timer die beliebte Zeitmanagement-Technik, die Stoppuhr bietet praezise Zeitmessung, und der Gewohnheits-Tracker hilft beim Aufbau konsistenter Routinen.</p>

<p>Jedes Mathe-Tool liefert sofortige, praezise Ergebnisse. Alle Berechnungen erfolgen lokal in Ihrem Browser. Kein Konto oder Installation erforderlich.</p>`,
  },
  pt: {
    title: 'Calculadoras Matematicas Gratuitas',
    metaTitle: 'Calculadoras Matematicas Gratuitas Online | ToolKit Online',
    description: 'Calculadora cientifica, calculadora de idade, calculadora de fracoes, calculadora GPA e mais ferramentas matematicas.',
    toolsHeading: 'Todas as Ferramentas Matematicas',
    exploreOther: 'Explorar Outras Categorias',
    article: `<h2>Ferramentas Matematicas Poderosas para Estudantes, Professores e Profissionais</h2>
<p>A matematica e a linguagem universal que sustenta ciencia, engenharia, financas e tomada de decisoes diarias. Seja voce um estudante resolvendo exercicios, um professor preparando aulas, um profissional analisando dados ou simplesmente alguem que precisa de um calculo rapido, ter as ferramentas matematicas certas disponiveis instantaneamente faz toda a diferenca. O ToolKit Online oferece uma colecao completa de calculadoras matematicas e utilitarios gratuitos que cobrem desde aritmetica basica ate estatistica avancada e visualizacao.</p>

<h3>Calculadoras Cientificas e Avancadas</h3>
<p>Nossa calculadora cientifica fornece um ambiente de computacao completo com suporte para funcoes trigonometricas, logaritmos, expoentes, fatoriais e mais. Lida com expressoes matematicas complexas com a ordem correta de operacoes. A calculadora de fracoes simplifica fracoes, realiza operacoes aritmeticas e converte entre fracoes e decimais. A calculadora de raiz quadrada lida com raizes com alta precisao, enquanto o solucionador de equacoes quadraticas encontra raizes e visualiza a parabola.</p>

<h3>Calculos de Datas, Tempo e Idade</h3>
<p>Nossa calculadora de idade determina a idade exata em anos, meses e dias a partir de qualquer data de nascimento. A calculadora de datas encontra a diferenca entre duas datas ou adiciona e subtrai dias. O temporizador de contagem regressiva permite definir uma data e hora alvo e rastreia a duracao restante em tempo real.</p>

<h3>Estatistica e Analise de Dados</h3>
<p>Entender dados requer ferramentas estatisticas. Nossa calculadora de desvio padrao calcula media, variancia, desvio padrao e outras medidas estatisticas. A calculadora de probabilidade ajuda a resolver problemas incluindo combinacoes, permutacoes e probabilidades condicionais. A calculadora de variacao percentual determina o aumento ou diminuicao entre dois valores. O criador de graficos transforma seus dados em graficos visuais para apresentacoes e relatorios.</p>

<h3>Geometria e Algebra</h3>
<p>A calculadora de area calcula a area de varias formas geometricas incluindo retangulos, circulos, triangulos, trapezios e poligonos. A calculadora de volume lida com formas tridimensionais como esferas, cilindros, cones e cubos. A calculadora do teorema de Pitagoras resolve qualquer lado de um triangulo retangulo dados os outros dois. A calculadora de proporcao de aspecto determina e converte entre diferentes proporcoes.</p>

<h3>Sistemas Numericos e Conversoes</h3>
<p>Trabalhar com diferentes sistemas numericos e comum em matematica e ciencia da computacao. Nossa calculadora binaria realiza operacoes aritmeticas diretamente em binario. O conversor de numeros romanos traduz entre numeros romanos e arabicos. O gerador de numeros aleatorios produz numeros verdadeiramente aleatorios dentro de qualquer intervalo especificado.</p>

<h3>Ferramentas Academicas e de Produtividade</h3>
<p>Estudantes se beneficiam de varias ferramentas especializadas. A calculadora GPA calcula medias de notas usando diferentes escalas. A calculadora de notas determina quais pontuacoes sao necessarias. A calculadora de matrizes lida com operacoes matriciais. Para produtividade, o temporizador Pomodoro implementa a tecnica de gerenciamento de tempo, o cronometro fornece medicoes precisas, e o rastreador de habitos ajuda a construir rotinas consistentes.</p>

<p>Cada ferramenta matematica fornece resultados instantaneos e precisos. Todos os calculos acontecem localmente no seu navegador. Nenhuma conta ou instalacao necessaria.</p>`,
  },
};

export default function MathToolsPage() {
  return (
    <CategoryHubPage
      config={{
        categoryKey: 'math',
        slug: 'math-tools',
        toolSlugs: toolSlugs,
        otherCategories: [
          { key: 'finance', slug: 'finance-tools' },
          { key: 'text', slug: 'text-tools' },
          { key: 'health', slug: 'health-tools' },
          { key: 'conversion', slug: 'conversion-tools' },
          { key: 'dev', slug: 'developer-tools' },
          { key: 'images', slug: 'image-tools' },
        ],
        translations,
      }}
    />
  );
}
