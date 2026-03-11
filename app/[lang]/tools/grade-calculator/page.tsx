'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface GradeEntry {
  name: string;
  score: number;
  weight: number;
}

const labels: Record<string, Record<Locale, string>> = {
  subject: { en: 'Subject', it: 'Materia', es: 'Materia', fr: 'Matière', de: 'Fach', pt: 'Disciplina' },
  score: { en: 'Score', it: 'Voto', es: 'Nota', fr: 'Note', de: 'Note', pt: 'Nota' },
  weight: { en: 'Weight', it: 'Peso', es: 'Peso', fr: 'Coefficient', de: 'Gewicht', pt: 'Peso' },
  addGrade: { en: 'Add Grade', it: 'Aggiungi Voto', es: 'Añadir Nota', fr: 'Ajouter Note', de: 'Note Hinzufügen', pt: 'Adicionar Nota' },
  remove: { en: 'Remove', it: 'Rimuovi', es: 'Eliminar', fr: 'Supprimer', de: 'Entfernen', pt: 'Remover' },
  weightedAvg: { en: 'Weighted Average', it: 'Media Ponderata', es: 'Promedio Ponderado', fr: 'Moyenne Pondérée', de: 'Gewichteter Durchschnitt', pt: 'Média Ponderada' },
  simpleAvg: { en: 'Simple Average', it: 'Media Semplice', es: 'Promedio Simple', fr: 'Moyenne Simple', de: 'Einfacher Durchschnitt', pt: 'Média Simples' },
  gpa: { en: 'GPA (4.0 scale)', it: 'GPA (scala 4.0)', es: 'GPA (escala 4.0)', fr: 'GPA (échelle 4.0)', de: 'GPA (4.0 Skala)', pt: 'GPA (escala 4.0)' },
  totalWeight: { en: 'Total Weight', it: 'Peso Totale', es: 'Peso Total', fr: 'Coefficient Total', de: 'Gesamtgewicht', pt: 'Peso Total' },
  maxScore: { en: 'Max Score', it: 'Voto Massimo', es: 'Nota Máxima', fr: 'Note Maximum', de: 'Maximalnote', pt: 'Nota Máxima' },
};

export default function GradeCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['grade-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [maxScore, setMaxScore] = useState(100);
  const [grades, setGrades] = useState<GradeEntry[]>([
    { name: '', score: 0, weight: 1 },
    { name: '', score: 0, weight: 1 },
  ]);

  const updateGrade = (index: number, field: keyof GradeEntry, value: string | number) => {
    const newGrades = [...grades];
    newGrades[index] = { ...newGrades[index], [field]: value };
    setGrades(newGrades);
  };

  const addGrade = () => setGrades([...grades, { name: '', score: 0, weight: 1 }]);
  const removeGrade = (i: number) => {
    if (grades.length > 1) setGrades(grades.filter((_, idx) => idx !== i));
  };

  const totalWeight = grades.reduce((sum, g) => sum + g.weight, 0);
  const weightedAvg = totalWeight > 0
    ? grades.reduce((sum, g) => sum + g.score * g.weight, 0) / totalWeight
    : 0;
  const simpleAvg = grades.length > 0
    ? grades.reduce((sum, g) => sum + g.score, 0) / grades.length
    : 0;
  const gpa = maxScore > 0 ? (weightedAvg / maxScore) * 4 : 0;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Grade Calculator: Weighted Average, GPA, and Academic Performance',
      paragraphs: [
        'Calculating your grade point average accurately is essential for students at every level. Whether you are in high school tracking your GPA for college applications, a university student monitoring your semester performance, or a parent helping your child understand their academic standing, a grade calculator simplifies the math and eliminates errors.',
        'Our calculator supports both simple averages and weighted averages. A simple average treats all grades equally, while a weighted average accounts for courses that carry more credit hours or have higher importance. For example, a 4-credit course should have twice the impact on your GPA compared to a 2-credit course — this is exactly what weighted averaging does.',
        'The tool also converts your weighted average to a GPA on a 4.0 scale, which is the standard used by most American universities. This conversion divides your weighted average by the maximum possible score and multiplies by 4. So if you score 85 out of 100 on a weighted basis, your GPA would be 3.40.',
        'You can add as many grades as you need, label each one with the subject name for reference, and adjust the maximum score to match your school\'s grading system. Whether your scale goes to 100, 30 (common in Italy), or 20 (common in France), just set the max score and the GPA conversion adjusts automatically.'
      ],
      faq: [
        { q: 'What is the difference between a simple average and a weighted average?', a: 'A simple average adds all scores and divides by the number of entries. A weighted average multiplies each score by its weight (credit hours), sums the products, and divides by the total weight. Use weighted when courses have different credit values.' },
        { q: 'How is GPA calculated on a 4.0 scale?', a: 'The tool divides your weighted average by the maximum possible score, then multiplies by 4. For example, a weighted average of 90 out of 100 gives (90/100) x 4 = 3.60 GPA.' },
        { q: 'Can I use this for European grading systems?', a: 'Yes. Change the "Max Score" field to match your system. For the Italian 30-point scale, set it to 30. For the French 20-point scale, set it to 20. The GPA conversion will adjust automatically.' },
        { q: 'How do I calculate the grade I need on a final exam?', a: 'Enter your current grades with their weights, then add a row for the final exam with its weight. Adjust the final exam score until the weighted average reaches your target. This shows you the minimum score needed.' },
        { q: 'What weight should I assign to each subject?', a: 'Use the credit hours or ECTS credits assigned by your institution. If all courses are equal, leave all weights at 1. If a course is worth 6 credits and another 3, use those values as weights.' }
      ]
    },
    it: {
      title: 'Calcolatore di Voti: Media Ponderata, GPA e Rendimento Accademico',
      paragraphs: [
        'Calcolare accuratamente la media dei voti è essenziale per gli studenti di ogni livello. Che tu sia al liceo e monitori il GPA per le domande universitarie, uno studente universitario che controlla le prestazioni semestrali, o un genitore che aiuta il figlio a capire il rendimento scolastico, un calcolatore di voti semplifica la matematica ed elimina gli errori.',
        'Il nostro calcolatore supporta sia medie semplici che ponderate. Una media semplice tratta tutti i voti allo stesso modo, mentre una media ponderata tiene conto dei corsi con più crediti o maggiore importanza. Ad esempio, un corso da 12 CFU dovrebbe avere il doppio dell\'impatto rispetto a uno da 6 CFU.',
        'Lo strumento converte anche la media ponderata in GPA su scala 4.0, lo standard delle università americane. Se ottieni 27 su 30 in media ponderata, il tuo GPA sarebbe (27/30) x 4 = 3,60.',
        'Puoi aggiungere quanti voti vuoi, etichettare ciascuno con il nome della materia e regolare il voto massimo per adattarlo al sistema della tua scuola. Che la scala sia fino a 100, 30 (Italia) o 20 (Francia), imposta il voto massimo e la conversione GPA si adatta automaticamente.'
      ],
      faq: [
        { q: 'Qual è la differenza tra media semplice e media ponderata?', a: 'La media semplice somma tutti i voti e divide per il numero di voci. La media ponderata moltiplica ogni voto per il suo peso (crediti), somma i prodotti e divide per il peso totale. Usa quella ponderata quando i corsi hanno crediti diversi.' },
        { q: 'Come si calcola il GPA su scala 4.0?', a: 'Lo strumento divide la media ponderata per il voto massimo possibile, poi moltiplica per 4. Ad esempio, una media ponderata di 27 su 30 dà (27/30) x 4 = 3,60 GPA.' },
        { q: 'Posso usarlo per il sistema di valutazione italiano?', a: 'Sì. Cambia il campo "Voto Massimo" a 30 per il sistema universitario italiano o a 10 per le scuole superiori. La conversione GPA si adatterà automaticamente.' },
        { q: 'Come calcolo il voto necessario all\'esame finale?', a: 'Inserisci i voti attuali con i loro pesi, poi aggiungi una riga per l\'esame finale con il suo peso. Regola il voto fino a quando la media ponderata raggiunge il tuo obiettivo.' },
        { q: 'Che peso devo assegnare a ogni materia?', a: 'Usa i crediti formativi (CFU o ECTS) assegnati dal tuo istituto. Se tutti i corsi sono uguali, lascia tutti i pesi a 1.' }
      ]
    },
    es: {
      title: 'Calculadora de Notas: Promedio Ponderado, GPA y Rendimiento Académico',
      paragraphs: [
        'Calcular con precisión el promedio de notas es esencial para estudiantes de todos los niveles. Ya sea que estés en secundaria monitoreando tu GPA para solicitudes universitarias, un estudiante universitario controlando tu rendimiento semestral, o un padre ayudando a su hijo a entender su situación académica, una calculadora de notas simplifica las matemáticas.',
        'Nuestra calculadora soporta tanto promedios simples como ponderados. Un promedio simple trata todas las notas por igual, mientras uno ponderado tiene en cuenta los créditos de cada materia. Un curso de 6 créditos debería tener el doble de impacto que uno de 3 créditos.',
        'La herramienta también convierte tu promedio ponderado a GPA en escala 4.0, el estándar de las universidades americanas. Si obtienes 85 sobre 100 en promedio ponderado, tu GPA sería (85/100) x 4 = 3,40.',
        'Puedes agregar tantas notas como necesites, etiquetar cada una con el nombre de la materia y ajustar la nota máxima para que coincida con el sistema de tu escuela.'
      ],
      faq: [
        { q: '¿Cuál es la diferencia entre promedio simple y ponderado?', a: 'El promedio simple suma todas las notas y divide por el número de entradas. El ponderado multiplica cada nota por su peso (créditos), suma los productos y divide por el peso total.' },
        { q: '¿Cómo se calcula el GPA en escala 4.0?', a: 'La herramienta divide tu promedio ponderado por la nota máxima posible, luego multiplica por 4. Por ejemplo, un promedio de 85 sobre 100 da (85/100) x 4 = 3,40 GPA.' },
        { q: '¿Puedo usarla para sistemas de calificación europeos?', a: 'Sí. Cambia el campo "Nota Máxima" para que coincida con tu sistema. Para el sistema español de 10 puntos, ponlo en 10. La conversión GPA se ajustará automáticamente.' },
        { q: '¿Cómo calculo la nota que necesito en el examen final?', a: 'Ingresa tus notas actuales con sus pesos, luego agrega una fila para el examen final. Ajusta la nota hasta que el promedio ponderado alcance tu objetivo.' },
        { q: '¿Qué peso debo asignar a cada materia?', a: 'Usa los créditos ECTS o las horas crédito asignadas por tu institución. Si todos los cursos son iguales, deja todos los pesos en 1.' }
      ]
    },
    fr: {
      title: 'Calculateur de Notes : Moyenne Pondérée, GPA et Performance Académique',
      paragraphs: [
        'Calculer précisément sa moyenne de notes est essentiel pour les étudiants à tous les niveaux. Que vous soyez au lycée surveillant votre GPA, un étudiant universitaire vérifiant vos performances semestrielles, ou un parent aidant son enfant, un calculateur de notes simplifie les mathématiques et élimine les erreurs.',
        'Notre calculateur supporte les moyennes simples et pondérées. Une moyenne simple traite toutes les notes de manière égale, tandis qu\'une moyenne pondérée tient compte des coefficients de chaque matière. Un cours avec un coefficient de 4 devrait avoir deux fois l\'impact d\'un cours avec un coefficient de 2.',
        'L\'outil convertit aussi votre moyenne pondérée en GPA sur une échelle de 4.0, le standard des universités américaines. Si vous obtenez 15 sur 20 en moyenne pondérée, votre GPA serait (15/20) x 4 = 3,00.',
        'Vous pouvez ajouter autant de notes que nécessaire, étiqueter chacune avec le nom de la matière et ajuster la note maximale pour correspondre à votre système de notation. Que votre échelle aille à 20 (France) ou 100, le GPA s\'adapte automatiquement.'
      ],
      faq: [
        { q: 'Quelle est la différence entre moyenne simple et pondérée ?', a: 'La moyenne simple additionne toutes les notes et divise par le nombre d\'entrées. La pondérée multiplie chaque note par son coefficient, additionne les produits et divise par le total des coefficients.' },
        { q: 'Comment le GPA est-il calculé sur une échelle de 4.0 ?', a: 'L\'outil divise votre moyenne pondérée par la note maximale, puis multiplie par 4. Par exemple, 15/20 donne (15/20) x 4 = 3,00 GPA.' },
        { q: 'Puis-je l\'utiliser pour le système de notation français ?', a: 'Oui. Mettez le champ "Note Maximum" à 20 pour le système français. La conversion GPA s\'ajustera automatiquement.' },
        { q: 'Comment calculer la note nécessaire à l\'examen final ?', a: 'Entrez vos notes actuelles avec leurs coefficients, puis ajoutez une ligne pour l\'examen final. Ajustez la note jusqu\'à ce que la moyenne atteigne votre objectif.' },
        { q: 'Quel coefficient attribuer à chaque matière ?', a: 'Utilisez les crédits ECTS ou coefficients attribués par votre établissement. Si tous les cours sont égaux, laissez tous les poids à 1.' }
      ]
    },
    de: {
      title: 'Notenrechner: Gewichteter Durchschnitt, GPA und Akademische Leistung',
      paragraphs: [
        'Die genaue Berechnung des Notendurchschnitts ist für Studierende auf allen Ebenen wichtig. Ob Sie ein Gymnasiast sind, der seinen Schnitt für die Uni-Bewerbung beobachtet, ein Student, der die Semesterleistung überwacht, oder ein Elternteil, das seinem Kind hilft — ein Notenrechner vereinfacht die Mathematik und eliminiert Fehler.',
        'Unser Rechner unterstützt sowohl einfache als auch gewichtete Durchschnitte. Ein einfacher Durchschnitt behandelt alle Noten gleich, während ein gewichteter Durchschnitt die Creditpoints berücksichtigt. Ein 6-ECTS-Kurs sollte doppelt so viel Einfluss haben wie ein 3-ECTS-Kurs.',
        'Das Tool rechnet den gewichteten Durchschnitt auch in einen GPA auf der 4.0-Skala um, dem Standard amerikanischer Universitäten. Wenn Sie durchschnittlich 2,0 auf einer 1-5-Skala haben, können Sie den Maximalscore auf 5 setzen.',
        'Sie können beliebig viele Noten hinzufügen, jede mit dem Fachnamen beschriften und die Maximalnote an Ihr Bewertungssystem anpassen.'
      ],
      faq: [
        { q: 'Was ist der Unterschied zwischen einfachem und gewichtetem Durchschnitt?', a: 'Der einfache Durchschnitt addiert alle Noten und teilt durch die Anzahl. Der gewichtete multipliziert jede Note mit ihrem Gewicht (Credits), summiert die Produkte und teilt durch das Gesamtgewicht.' },
        { q: 'Wie wird der GPA auf der 4.0-Skala berechnet?', a: 'Das Tool teilt Ihren gewichteten Durchschnitt durch die Maximalnote und multipliziert mit 4. Beispiel: 85/100 ergibt (85/100) x 4 = 3,40 GPA.' },
        { q: 'Kann ich es für das deutsche Notensystem verwenden?', a: 'Ja. Setzen Sie das Feld "Maximalnote" auf den höchsten Wert Ihres Systems. Für das 1-6 System setzen Sie es auf 6 (beachten Sie: niedrigere Noten sind besser im deutschen System).' },
        { q: 'Wie berechne ich die benötigte Note in der Abschlussprüfung?', a: 'Geben Sie Ihre aktuellen Noten mit Gewichtungen ein, fügen Sie eine Zeile für die Prüfung hinzu und passen Sie die Note an, bis der Durchschnitt Ihr Ziel erreicht.' },
        { q: 'Welche Gewichtung soll ich jeder Materie zuweisen?', a: 'Verwenden Sie die ECTS-Credits oder Leistungspunkte Ihrer Hochschule. Bei gleichen Kursen lassen Sie alle Gewichte auf 1.' }
      ]
    },
    pt: {
      title: 'Calculadora de Notas: Média Ponderada, GPA e Desempenho Acadêmico',
      paragraphs: [
        'Calcular com precisão a média de notas é essencial para estudantes de todos os níveis. Seja no ensino médio monitorando seu desempenho para vestibulares, um universitário acompanhando o rendimento semestral, ou um pai ajudando o filho a entender sua situação acadêmica, uma calculadora de notas simplifica a matemática.',
        'Nossa calculadora suporta médias simples e ponderadas. Uma média simples trata todas as notas igualmente, enquanto a ponderada considera os créditos de cada disciplina. Uma disciplina de 6 créditos deve ter o dobro do impacto de uma de 3 créditos.',
        'A ferramenta também converte sua média ponderada em GPA na escala 4.0, o padrão das universidades americanas. Se você obtiver 8,5 em 10 em média ponderada, seu GPA seria (8,5/10) x 4 = 3,40.',
        'Você pode adicionar quantas notas precisar, etiquetar cada uma com o nome da disciplina e ajustar a nota máxima para corresponder ao sistema da sua escola.'
      ],
      faq: [
        { q: 'Qual é a diferença entre média simples e ponderada?', a: 'A média simples soma todas as notas e divide pelo número de entradas. A ponderada multiplica cada nota pelo seu peso (créditos), soma os produtos e divide pelo peso total.' },
        { q: 'Como o GPA é calculado na escala 4.0?', a: 'A ferramenta divide sua média ponderada pela nota máxima possível, depois multiplica por 4. Exemplo: 8,5/10 dá (8,5/10) x 4 = 3,40 GPA.' },
        { q: 'Posso usar para o sistema de notas brasileiro?', a: 'Sim. Coloque o campo "Nota Máxima" em 10 para o sistema brasileiro. A conversão GPA se ajustará automaticamente.' },
        { q: 'Como calculo a nota necessária na prova final?', a: 'Insira suas notas atuais com seus pesos, adicione uma linha para a prova final com seu peso. Ajuste a nota até que a média ponderada alcance seu objetivo.' },
        { q: 'Que peso devo atribuir a cada disciplina?', a: 'Use os créditos ou carga horária atribuídos pela sua instituição. Se todas as disciplinas são iguais, deixe todos os pesos em 1.' }
      ]
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="grade-calculator">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('maxScore')}</label>
            <input
              type="number"
              value={maxScore}
              onChange={(e) => setMaxScore(parseInt(e.target.value) || 100)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_80px_80px_40px] gap-2 text-sm font-medium text-gray-700">
              <span>{t('subject')}</span>
              <span className="text-center">{t('score')}</span>
              <span className="text-center">{t('weight')}</span>
              <span></span>
            </div>
            {grades.map((g, i) => (
              <div key={i} className="grid grid-cols-[1fr_80px_80px_40px] gap-2">
                <input
                  type="text"
                  value={g.name}
                  onChange={(e) => updateGrade(i, 'name', e.target.value)}
                  placeholder={`${t('subject')} ${i + 1}`}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  value={g.score}
                  onChange={(e) => updateGrade(i, 'score', parseFloat(e.target.value) || 0)}
                  min="0"
                  max={maxScore}
                  className="border border-gray-300 rounded-lg px-2 py-2 text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  value={g.weight}
                  onChange={(e) => updateGrade(i, 'weight', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.5"
                  className="border border-gray-300 rounded-lg px-2 py-2 text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => removeGrade(i)}
                  className="text-red-500 hover:text-red-700 text-sm"
                  disabled={grades.length <= 1}
                >
                  X
                </button>
              </div>
            ))}
          </div>

          <button onClick={addGrade} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            + {t('addGrade')}
          </button>

          <div className="p-4 bg-blue-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('totalWeight')}</span>
              <span className="font-semibold">{totalWeight}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('simpleAvg')}</span>
              <span className="font-semibold">{simpleAvg.toFixed(2)}</span>
            </div>
            <hr className="border-blue-200" />
            <div className="flex justify-between text-lg">
              <span className="font-bold text-gray-900">{t('weightedAvg')}</span>
              <span className="font-bold text-blue-600">{weightedAvg.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('gpa')}</span>
              <span className="font-semibold text-blue-600">{gpa.toFixed(2)}</span>
            </div>
          </div>
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
