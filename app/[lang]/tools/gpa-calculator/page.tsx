'use client';
import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  courseName: { en: 'Course Name', it: 'Nome Corso', es: 'Nombre del Curso', fr: 'Nom du Cours', de: 'Kursname', pt: 'Nome do Curso' },
  grade: { en: 'Grade', it: 'Voto', es: 'Nota', fr: 'Note', de: 'Note', pt: 'Nota' },
  credits: { en: 'Credits', it: 'Crediti', es: 'Créditos', fr: 'Crédits', de: 'Credits', pt: 'Créditos' },
  addCourse: { en: 'Add Course', it: 'Aggiungi Corso', es: 'Agregar Curso', fr: 'Ajouter un Cours', de: 'Kurs Hinzufügen', pt: 'Adicionar Curso' },
  remove: { en: 'Remove', it: 'Rimuovi', es: 'Eliminar', fr: 'Supprimer', de: 'Entfernen', pt: 'Remover' },
  cumulativeGpa: { en: 'Cumulative GPA', it: 'GPA Cumulativo', es: 'GPA Acumulado', fr: 'GPA Cumulé', de: 'Kumulativer GPA', pt: 'GPA Acumulado' },
  totalCredits: { en: 'Total Credits', it: 'Crediti Totali', es: 'Créditos Totales', fr: 'Crédits Totaux', de: 'Gesamtcredits', pt: 'Créditos Totais' },
  noCourses: { en: 'Add courses to calculate your GPA', it: 'Aggiungi corsi per calcolare il GPA', es: 'Agrega cursos para calcular tu GPA', fr: 'Ajoutez des cours pour calculer le GPA', de: 'Fügen Sie Kurse hinzu, um den GPA zu berechnen', pt: 'Adicione cursos para calcular o GPA' },
  gradeScale: { en: 'Grade Scale', it: 'Scala Voti', es: 'Escala de Notas', fr: 'Échelle de Notes', de: 'Notenskala', pt: 'Escala de Notas' },
  reset: { en: 'Reset', it: 'Reimposta', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  copy: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier les Résultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
  copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié!', de: 'Kopiert!', pt: 'Copiado!' },
  history: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
  letterGrade: { en: 'Letter Grade', it: 'Voto in Lettera', es: 'Nota en Letra', fr: 'Note en Lettre', de: 'Buchstabennote', pt: 'Nota em Letra' },
  invalidCredits: { en: 'Credits must be 1-10', it: 'Crediti: 1-10', es: 'Créditos: 1-10', fr: 'Crédits: 1-10', de: 'Credits: 1-10', pt: 'Créditos: 1-10' },
};

interface Course {
  id: number;
  name: string;
  grade: string;
  credits: string;
}

interface HistoryEntry {
  gpa: number;
  totalCredits: number;
  courseCount: number;
  timestamp: string;
}

const gradePoints: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'D-': 0.7,
  'F': 0.0,
};

let nextId = 3;

export default function GpaCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['gpa-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [courses, setCourses] = useState<Course[]>([
    { id: 1, name: 'Course 1', grade: 'A', credits: '3' },
    { id: 2, name: 'Course 2', grade: 'B+', credits: '4' },
  ]);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const addCourse = () => {
    setCourses([...courses, { id: nextId++, name: '', grade: 'A', credits: '3' }]);
  };

  const removeCourse = (id: number) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  const updateCourse = (id: number, field: keyof Course, value: string) => {
    setCourses(courses.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const resetAll = () => {
    setCourses([{ id: nextId++, name: '', grade: 'A', credits: '3' }]);
    setCopied(false);
  };

  const calculateGpa = useCallback(() => {
    let totalPoints = 0;
    let totalCredits = 0;
    for (const course of courses) {
      const credits = parseFloat(course.credits);
      const points = gradePoints[course.grade];
      if (!isNaN(credits) && credits > 0 && points !== undefined) {
        totalPoints += points * credits;
        totalCredits += credits;
      }
    }
    return { gpa: totalCredits > 0 ? totalPoints / totalCredits : 0, totalCredits };
  }, [courses]);

  const { gpa, totalCredits } = calculateGpa();

  const saveToHistory = () => {
    if (courses.length === 0 || totalCredits === 0) return;
    const entry: HistoryEntry = {
      gpa,
      totalCredits,
      courseCount: courses.length,
      timestamp: new Date().toLocaleTimeString(),
    };
    setHistory(prev => [entry, ...prev].slice(0, 5));
  };

  const getGpaColor = (gpa: number) => {
    if (gpa >= 3.5) return 'text-green-600';
    if (gpa >= 3.0) return 'text-blue-600';
    if (gpa >= 2.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGpaBgColor = (gpa: number) => {
    if (gpa >= 3.5) return 'bg-green-50 border-green-200';
    if (gpa >= 3.0) return 'bg-blue-50 border-blue-200';
    if (gpa >= 2.0) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getLetterGrade = (gpa: number) => {
    if (gpa >= 3.85) return 'A';
    if (gpa >= 3.5) return 'A-';
    if (gpa >= 3.15) return 'B+';
    if (gpa >= 2.85) return 'B';
    if (gpa >= 2.5) return 'B-';
    if (gpa >= 2.15) return 'C+';
    if (gpa >= 1.85) return 'C';
    if (gpa >= 1.5) return 'C-';
    if (gpa >= 1.15) return 'D+';
    if (gpa >= 0.85) return 'D';
    if (gpa >= 0.5) return 'D-';
    return 'F';
  };

  const isInvalidCredits = (credits: string) => {
    const c = parseFloat(credits);
    return credits !== '' && (isNaN(c) || c < 1 || c > 10);
  };

  const copyResults = () => {
    const text = `GPA: ${gpa.toFixed(2)} | ${t('totalCredits')}: ${totalCredits} | ${t('letterGrade')}: ${getLetterGrade(gpa)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gpaPercentage = (gpa / 4.0) * 100;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'GPA Calculator: Track Your Academic Performance',
      paragraphs: [
        'Grade Point Average (GPA) is a standardized measure of academic achievement used by schools and universities worldwide. It converts letter grades into numerical values on a 4.0 scale, then calculates a weighted average based on course credit hours. A higher GPA reflects stronger academic performance and is crucial for college admissions, scholarships, graduate school applications, and honors recognition.',
        'Our GPA calculator allows you to dynamically add and remove courses, each with a course name, letter grade, and credit hours. The calculator instantly computes your cumulative GPA as you make changes. This real-time feedback helps you understand exactly how each course affects your overall average, making it easier to plan your academic strategy.',
        'The standard 4.0 grading scale assigns values from A+ (4.0) down to F (0.0), with plus and minus modifiers for grades B through D. Credits represent the weight of each course — a 4-credit course has more impact on your GPA than a 1-credit course. This weighted approach ensures that more intensive courses appropriately influence your overall academic standing.',
        'Students use GPA calculators for multiple purposes: tracking current standing, projecting future GPA based on expected grades, determining what grades are needed to reach a target GPA, and preparing for graduate school applications. By experimenting with different grade scenarios, you can set realistic academic goals and prioritize courses that will have the most impact on your GPA. Our tool is completely free, requires no registration, and works directly in your browser.'
      ],
      faq: [
        { q: 'What grading scale does this calculator use?', a: 'It uses the standard US 4.0 scale: A/A+ = 4.0, A- = 3.7, B+ = 3.3, B = 3.0, B- = 2.7, C+ = 2.3, C = 2.0, C- = 1.7, D+ = 1.3, D = 1.0, D- = 0.7, F = 0.0. This is the most widely used scale in American higher education.' },
        { q: 'How are credits factored into the GPA?', a: 'Each course\'s grade points are multiplied by its credit hours. The sum of all weighted grade points is then divided by the total credit hours. This means a 4-credit A (16 points) affects your GPA more than a 1-credit A (4 points).' },
        { q: 'Can I use this for semester GPA and cumulative GPA?', a: 'Yes. For semester GPA, enter only the courses from one semester. For cumulative GPA, enter all courses from all semesters. You can add as many courses as needed.' },
        { q: 'What is considered a good GPA?', a: 'A 3.0 (B average) is generally considered good. A 3.5+ is excellent and often required for honors programs. A 3.7+ is outstanding. Requirements vary by institution and program.' },
        { q: 'Does this calculator support weighted or unweighted GPA?', a: 'This calculator computes weighted GPA using credit hours as weights. It does not add extra weight for AP or honors courses. For high school weighted GPA with AP/honors bonuses, you would need to manually adjust the grade values.' }
      ]
    },
    it: {
      title: 'Calcolatore GPA: Monitora il Tuo Rendimento Accademico',
      paragraphs: [
        'La media dei voti (GPA) è una misura standardizzata del rendimento accademico utilizzata da scuole e università in tutto il mondo. Converte i voti in lettere in valori numerici su una scala 4.0, poi calcola una media ponderata basata sui crediti formativi. Un GPA più alto riflette un rendimento accademico migliore ed è fondamentale per ammissioni universitarie, borse di studio e domande di laurea magistrale.',
        'Il nostro calcolatore GPA permette di aggiungere e rimuovere dinamicamente i corsi, ciascuno con nome, voto e crediti. Il calcolatore calcola istantaneamente il GPA cumulativo mentre apporti modifiche. Questo feedback in tempo reale ti aiuta a capire esattamente come ogni corso influenza la tua media complessiva.',
        'La scala di valutazione standard 4.0 assegna valori da A+ (4.0) fino a F (0.0), con modificatori plus e minus per i voti da B a D. I crediti rappresentano il peso di ogni corso — un corso da 4 crediti ha più impatto sul GPA di uno da 1 credito. Questo approccio ponderato garantisce che i corsi più intensivi influenzino adeguatamente il rendimento accademico.',
        'Gli studenti usano i calcolatori GPA per molteplici scopi: monitorare la situazione attuale, proiettare il GPA futuro, determinare quali voti servono per raggiungere un obiettivo e preparare le domande per la laurea magistrale. Sperimentando con diversi scenari, puoi fissare obiettivi accademici realistici.'
      ],
      faq: [
        { q: 'Quale scala di valutazione usa questo calcolatore?', a: 'Usa la scala standard USA 4.0: A/A+ = 4.0, A- = 3.7, B+ = 3.3, B = 3.0, B- = 2.7, C+ = 2.3, C = 2.0, C- = 1.7, D+ = 1.3, D = 1.0, D- = 0.7, F = 0.0.' },
        { q: 'Come vengono considerati i crediti nel GPA?', a: 'I punti di ogni corso vengono moltiplicati per i crediti. La somma di tutti i punti ponderati viene divisa per il totale dei crediti. Un A da 4 crediti (16 punti) influenza il GPA più di un A da 1 credito (4 punti).' },
        { q: 'Posso usarlo per il GPA semestrale e cumulativo?', a: 'Sì. Per il GPA semestrale, inserisci solo i corsi di un semestre. Per il cumulativo, inserisci tutti i corsi di tutti i semestri.' },
        { q: 'Qual è considerato un buon GPA?', a: 'Un 3.0 (media B) è generalmente considerato buono. Un 3.5+ è eccellente. Un 3.7+ è eccezionale. I requisiti variano per istituzione e programma.' },
        { q: 'Questo calcolatore supporta il GPA ponderato?', a: 'Calcola il GPA ponderato usando i crediti come pesi. Non aggiunge peso extra per corsi AP o honors.' }
      ]
    },
    es: {
      title: 'Calculadora de GPA: Rastrea Tu Rendimiento Académico',
      paragraphs: [
        'El promedio de calificaciones (GPA) es una medida estandarizada del logro académico utilizada por escuelas y universidades en todo el mundo. Convierte las calificaciones en letras a valores numéricos en una escala de 4.0, luego calcula un promedio ponderado basado en las horas de crédito. Un GPA más alto refleja un mejor rendimiento académico y es crucial para admisiones universitarias y becas.',
        'Nuestra calculadora de GPA permite agregar y eliminar cursos dinámicamente, cada uno con nombre, calificación y créditos. La calculadora calcula instantáneamente tu GPA acumulado mientras realizas cambios. Esta retroalimentación en tiempo real te ayuda a entender exactamente cómo cada curso afecta tu promedio general.',
        'La escala de calificación estándar 4.0 asigna valores desde A+ (4.0) hasta F (0.0), con modificadores plus y minus para las notas B a D. Los créditos representan el peso de cada curso — un curso de 4 créditos tiene más impacto en tu GPA que uno de 1 crédito.',
        'Los estudiantes usan calculadoras de GPA para múltiples propósitos: rastrear su situación actual, proyectar el GPA futuro, determinar qué calificaciones necesitan para alcanzar un objetivo y preparar solicitudes de posgrado. Experimentando con diferentes escenarios, puedes establecer metas académicas realistas.'
      ],
      faq: [
        { q: '¿Qué escala de calificación usa esta calculadora?', a: 'Usa la escala estándar USA 4.0: A/A+ = 4.0, A- = 3.7, B+ = 3.3, B = 3.0, B- = 2.7, C+ = 2.3, C = 2.0, C- = 1.7, D+ = 1.3, D = 1.0, D- = 0.7, F = 0.0.' },
        { q: '¿Cómo se consideran los créditos en el GPA?', a: 'Los puntos de cada curso se multiplican por sus créditos. La suma de todos los puntos ponderados se divide por el total de créditos.' },
        { q: '¿Puedo usarlo para GPA semestral y acumulado?', a: 'Sí. Para GPA semestral, ingresa solo los cursos de un semestre. Para el acumulado, ingresa todos los cursos de todos los semestres.' },
        { q: '¿Qué se considera un buen GPA?', a: 'Un 3.0 (promedio B) es generalmente considerado bueno. Un 3.5+ es excelente. Un 3.7+ es sobresaliente.' },
        { q: '¿Esta calculadora soporta GPA ponderado?', a: 'Calcula el GPA ponderado usando los créditos como pesos. No agrega peso extra para cursos AP o de honores.' }
      ]
    },
    fr: {
      title: 'Calculateur de GPA : Suivez Votre Performance Académique',
      paragraphs: [
        'La moyenne pondérée (GPA) est une mesure standardisée de la réussite académique utilisée par les écoles et universités du monde entier. Elle convertit les notes en lettres en valeurs numériques sur une échelle de 4.0, puis calcule une moyenne pondérée basée sur les crédits. Un GPA plus élevé reflète une meilleure performance académique et est crucial pour les admissions et les bourses.',
        'Notre calculateur de GPA permet d\'ajouter et de supprimer dynamiquement des cours, chacun avec un nom, une note et des crédits. Le calculateur calcule instantanément votre GPA cumulé au fur et à mesure. Ce retour en temps réel vous aide à comprendre exactement comment chaque cours affecte votre moyenne.',
        'L\'échelle de notation standard 4.0 attribue des valeurs de A+ (4.0) à F (0.0), avec des modificateurs plus et minus pour les notes B à D. Les crédits représentent le poids de chaque cours — un cours de 4 crédits a plus d\'impact sur le GPA qu\'un cours de 1 crédit.',
        'Les étudiants utilisent les calculateurs de GPA pour suivre leur situation actuelle, projeter le GPA futur, déterminer les notes nécessaires pour atteindre un objectif et préparer les candidatures de master. En expérimentant différents scénarios, vous pouvez fixer des objectifs académiques réalistes.'
      ],
      faq: [
        { q: 'Quelle échelle de notation utilise ce calculateur ?', a: 'Il utilise l\'échelle standard USA 4.0 : A/A+ = 4.0, A- = 3.7, B+ = 3.3, B = 3.0, B- = 2.7, C+ = 2.3, C = 2.0, C- = 1.7, D+ = 1.3, D = 1.0, D- = 0.7, F = 0.0.' },
        { q: 'Comment les crédits sont-ils pris en compte dans le GPA ?', a: 'Les points de chaque cours sont multipliés par ses crédits. La somme de tous les points pondérés est divisée par le total des crédits.' },
        { q: 'Puis-je l\'utiliser pour le GPA semestriel et cumulé ?', a: 'Oui. Pour le GPA semestriel, entrez uniquement les cours d\'un semestre. Pour le cumulé, entrez tous les cours de tous les semestres.' },
        { q: 'Qu\'est-ce qu\'un bon GPA ?', a: 'Un 3.0 (moyenne B) est généralement considéré comme bon. Un 3.5+ est excellent. Un 3.7+ est exceptionnel.' },
        { q: 'Ce calculateur supporte-t-il le GPA pondéré ?', a: 'Il calcule le GPA pondéré en utilisant les crédits comme poids. Il n\'ajoute pas de poids supplémentaire pour les cours AP ou honors.' }
      ]
    },
    de: {
      title: 'GPA-Rechner: Verfolgen Sie Ihre Akademische Leistung',
      paragraphs: [
        'Der Notendurchschnitt (GPA) ist ein standardisiertes Maß für akademische Leistungen, das von Schulen und Universitäten weltweit verwendet wird. Er wandelt Buchstabennoten in numerische Werte auf einer 4.0-Skala um und berechnet dann einen gewichteten Durchschnitt basierend auf den Kreditstunden. Ein höherer GPA spiegelt bessere akademische Leistungen wider.',
        'Unser GPA-Rechner ermöglicht das dynamische Hinzufügen und Entfernen von Kursen, jeweils mit Kursname, Note und Credits. Der Rechner berechnet Ihren kumulativen GPA sofort. Dieses Echtzeit-Feedback hilft Ihnen zu verstehen, wie sich jeder Kurs auf Ihren Gesamtdurchschnitt auswirkt.',
        'Die Standard-4.0-Notenskala weist Werte von A+ (4.0) bis F (0.0) zu, mit Plus- und Minus-Modifikatoren für die Noten B bis D. Credits repräsentieren das Gewicht jedes Kurses — ein 4-Credit-Kurs hat mehr Einfluss auf den GPA als ein 1-Credit-Kurs.',
        'Studenten nutzen GPA-Rechner für verschiedene Zwecke: aktuelle Leistung verfolgen, zukünftigen GPA projizieren, erforderliche Noten bestimmen und Bewerbungen für Masterstudiengänge vorbereiten. Durch Experimentieren mit verschiedenen Szenarien können Sie realistische akademische Ziele setzen.'
      ],
      faq: [
        { q: 'Welche Notenskala verwendet dieser Rechner?', a: 'Er verwendet die US-Standard-4.0-Skala: A/A+ = 4.0, A- = 3.7, B+ = 3.3, B = 3.0, B- = 2.7, C+ = 2.3, C = 2.0, C- = 1.7, D+ = 1.3, D = 1.0, D- = 0.7, F = 0.0.' },
        { q: 'Wie werden Credits im GPA berücksichtigt?', a: 'Die Notenpunkte jedes Kurses werden mit den Credits multipliziert. Die Summe aller gewichteten Punkte wird durch die Gesamtcredits geteilt.' },
        { q: 'Kann ich es für Semester- und Gesamt-GPA verwenden?', a: 'Ja. Für den Semester-GPA geben Sie nur die Kurse eines Semesters ein. Für den Gesamt-GPA alle Kurse aller Semester.' },
        { q: 'Was gilt als guter GPA?', a: 'Ein 3.0 (B-Durchschnitt) gilt allgemein als gut. Ein 3.5+ ist ausgezeichnet. Ein 3.7+ ist hervorragend.' },
        { q: 'Unterstützt dieser Rechner gewichteten GPA?', a: 'Er berechnet den gewichteten GPA unter Verwendung der Credits als Gewichtung. Er fügt kein zusätzliches Gewicht für AP- oder Honors-Kurse hinzu.' }
      ]
    },
    pt: {
      title: 'Calculadora de GPA: Acompanhe Seu Desempenho Acadêmico',
      paragraphs: [
        'A Média de Pontos (GPA) é uma medida padronizada de desempenho acadêmico usada por escolas e universidades em todo o mundo. Ela converte notas em letras para valores numéricos em uma escala de 4.0, depois calcula uma média ponderada baseada nos créditos. Um GPA mais alto reflete melhor desempenho acadêmico e é crucial para admissões e bolsas.',
        'Nossa calculadora de GPA permite adicionar e remover cursos dinamicamente, cada um com nome, nota e créditos. A calculadora calcula instantaneamente seu GPA acumulado conforme você faz alterações. Este feedback em tempo real ajuda a entender exatamente como cada curso afeta sua média geral.',
        'A escala de notas padrão 4.0 atribui valores de A+ (4.0) até F (0.0), com modificadores plus e minus para notas B a D. Os créditos representam o peso de cada curso — um curso de 4 créditos tem mais impacto no GPA do que um de 1 crédito.',
        'Estudantes usam calculadoras de GPA para múltiplos propósitos: acompanhar a situação atual, projetar o GPA futuro, determinar quais notas são necessárias para atingir um objetivo e preparar candidaturas de mestrado. Experimentando diferentes cenários, você pode definir metas acadêmicas realistas.'
      ],
      faq: [
        { q: 'Qual escala de notas esta calculadora usa?', a: 'Usa a escala padrão USA 4.0: A/A+ = 4.0, A- = 3.7, B+ = 3.3, B = 3.0, B- = 2.7, C+ = 2.3, C = 2.0, C- = 1.7, D+ = 1.3, D = 1.0, D- = 0.7, F = 0.0.' },
        { q: 'Como os créditos são considerados no GPA?', a: 'Os pontos de cada curso são multiplicados por seus créditos. A soma de todos os pontos ponderados é dividida pelo total de créditos.' },
        { q: 'Posso usar para GPA semestral e acumulado?', a: 'Sim. Para GPA semestral, insira apenas os cursos de um semestre. Para o acumulado, insira todos os cursos de todos os semestres.' },
        { q: 'O que é considerado um bom GPA?', a: 'Um 3.0 (média B) é geralmente considerado bom. Um 3.5+ é excelente. Um 3.7+ é excepcional.' },
        { q: 'Esta calculadora suporta GPA ponderado?', a: 'Ela calcula o GPA ponderado usando os créditos como pesos. Não adiciona peso extra para cursos AP ou honors.' }
      ]
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="gpa-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* GPA Display Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className={`rounded-xl p-4 text-center border ${getGpaBgColor(gpa)}`}>
              <div className="text-xs text-gray-500 mb-1">{t('cumulativeGpa')}</div>
              <div className={`text-3xl font-bold ${getGpaColor(gpa)}`}>{gpa.toFixed(2)}</div>
              {/* Progress bar */}
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${gpa >= 3.5 ? 'bg-green-500' : gpa >= 3.0 ? 'bg-blue-500' : gpa >= 2.0 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(gpaPercentage, 100)}%` }}
                />
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">{t('totalCredits')}</div>
              <div className="text-3xl font-bold text-gray-900">{totalCredits}</div>
            </div>
            <div className={`rounded-xl p-4 text-center border ${getGpaBgColor(gpa)}`}>
              <div className="text-xs text-gray-500 mb-1">{t('letterGrade')}</div>
              <div className={`text-3xl font-bold ${getGpaColor(gpa)}`}>{getLetterGrade(gpa)}</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            <button onClick={copyResults} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
              {copied ? t('copied') : t('copy')}
            </button>
            <button onClick={saveToHistory} className="px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium text-blue-700 transition-colors">
              + {t('history')}
            </button>
            <button onClick={resetAll} className="px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium text-red-600 transition-colors ml-auto">
              {t('reset')}
            </button>
          </div>

          {/* Grade Scale Reference */}
          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
            <strong>{t('gradeScale')}:</strong> A+=4.0 | A=4.0 | A-=3.7 | B+=3.3 | B=3.0 | B-=2.7 | C+=2.3 | C=2.0 | C-=1.7 | D+=1.3 | D=1.0 | D-=0.7 | F=0.0
          </div>

          {/* Course List */}
          <div className="space-y-3">
            {courses.length === 0 && (
              <p className="text-gray-400 text-center py-4">{t('noCourses')}</p>
            )}
            {courses.map((course) => (
              <div key={course.id} className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">{t('courseName')}</label>
                  <input
                    type="text"
                    value={course.name}
                    onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                    placeholder={t('courseName')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs text-gray-500 mb-1">{t('grade')}</label>
                  <select
                    value={course.grade}
                    onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.keys(gradePoints).map((g) => (
                      <option key={g} value={g}>{g} ({gradePoints[g]})</option>
                    ))}
                  </select>
                </div>
                <div className="w-20">
                  <label className="block text-xs text-gray-500 mb-1">{t('credits')}</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={course.credits}
                    onChange={(e) => updateCourse(course.id, 'credits', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isInvalidCredits(course.credits) ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                  />
                  {isInvalidCredits(course.credits) && (
                    <p className="text-red-500 text-xs mt-0.5">{t('invalidCredits')}</p>
                  )}
                </div>
                <button
                  onClick={() => removeCourse(course.id)}
                  className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm transition-colors"
                  title={t('remove')}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addCourse}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-2.5 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors font-medium"
          >
            + {t('addCourse')}
          </button>

          {/* History */}
          {history.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('history')}</h3>
              <div className="space-y-1">
                {history.map((entry, i) => (
                  <div key={i} className="flex justify-between text-sm text-gray-600 bg-white rounded px-3 py-1.5 border border-gray-100">
                    <span className={`font-semibold ${getGpaColor(entry.gpa)}`}>{entry.gpa.toFixed(2)}</span>
                    <span>{entry.courseCount} courses / {entry.totalCredits} cr.</span>
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
