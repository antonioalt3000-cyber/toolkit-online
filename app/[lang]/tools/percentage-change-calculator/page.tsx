'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function PercentageChangeCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['percentage-change-calculator'][lang];

  const [oldValue, setOldValue] = useState('');
  const [newValue, setNewValue] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ from: string; to: string; change: string }[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const oldNum = parseFloat(oldValue) || 0;
  const newNum = parseFloat(newValue) || 0;
  const change = oldNum !== 0 ? ((newNum - oldNum) / Math.abs(oldNum)) * 100 : 0;
  const difference = newNum - oldNum;
  const hasResult = oldValue !== '' && newValue !== '' && oldNum !== 0;
  const oldError = touched.old && oldValue !== '' && oldNum === 0;

  // Track history
  const prevOld = useState('');
  const prevNew = useState('');
  if (hasResult && (oldValue !== prevOld[0] || newValue !== prevNew[0])) {
    prevOld[1](oldValue);
    prevNew[1](newValue);
    setHistory(prev => [{ from: oldValue, to: newValue, change: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%` }, ...prev].slice(0, 5));
  }

  const labels = {
    oldValue: { en: 'Old Value', it: 'Valore Iniziale', es: 'Valor Inicial', fr: 'Ancienne Valeur', de: 'Alter Wert', pt: 'Valor Inicial' },
    newValue: { en: 'New Value', it: 'Nuovo Valore', es: 'Nuevo Valor', fr: 'Nouvelle Valeur', de: 'Neuer Wert', pt: 'Novo Valor' },
    change: { en: 'Percentage Change', it: 'Variazione Percentuale', es: 'Cambio Porcentual', fr: 'Variation en Pourcentage', de: 'Prozentuale Änderung', pt: 'Variação Percentual' },
    diff: { en: 'Difference', it: 'Differenza', es: 'Diferencia', fr: 'Différence', de: 'Differenz', pt: 'Diferença' },
    increase: { en: 'Increase', it: 'Aumento', es: 'Aumento', fr: 'Augmentation', de: 'Zunahme', pt: 'Aumento' },
    decrease: { en: 'Decrease', it: 'Diminuzione', es: 'Disminución', fr: 'Diminution', de: 'Abnahme', pt: 'Diminuição' },
    noChange: { en: 'No Change', it: 'Nessuna Variazione', es: 'Sin Cambio', fr: 'Aucun Changement', de: 'Keine Änderung', pt: 'Sem Alteração' },
    reset: { en: 'Reset', it: 'Reset', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Reiniciar' },
    copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
    copy: { en: 'Copy Result', it: 'Copia Risultato', es: 'Copiar Resultado', fr: 'Copier le Résultat', de: 'Ergebnis Kopieren', pt: 'Copiar Resultado' },
    history: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
    invalidOld: { en: 'Old value cannot be zero', it: 'Il valore iniziale non può essere zero', es: 'El valor inicial no puede ser cero', fr: 'L\'ancienne valeur ne peut pas être zéro', de: 'Der alte Wert darf nicht Null sein', pt: 'O valor inicial não pode ser zero' },
  } as Record<string, Record<Locale, string>>;

  const getType = () => {
    if (change > 0) return { text: labels.increase[lang], color: 'text-green-600', bg: 'bg-green-50' };
    if (change < 0) return { text: labels.decrease[lang], color: 'text-red-600', bg: 'bg-red-50' };
    return { text: labels.noChange[lang], color: 'text-gray-600', bg: 'bg-gray-50' };
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Percentage Change Calculator – Calculate Increase & Decrease Online',
      paragraphs: [
        'Percentage change is a fundamental mathematical concept used across finance, science, business, and everyday life. It measures the relative difference between an old value and a new value, expressed as a percentage of the original. Understanding percentage change helps you make better decisions whether you are analyzing stock prices, comparing test scores, or tracking weight loss progress.',
        'The formula is straightforward: Percentage Change = ((New Value - Old Value) / |Old Value|) x 100. A positive result indicates an increase, while a negative result indicates a decrease. Our calculator handles all the math instantly — simply enter your two values and get the result immediately.',
        'Percentage change is different from percentage difference. Percentage change compares a new value to an original value and shows the direction of change (increase or decrease). Percentage difference compares two values without implying which is the original, using the average of the two as the base.',
        'Common applications include calculating price changes in stocks and commodities, measuring inflation rates, tracking business revenue growth, analyzing population changes, and comparing scientific measurements across experiments. Financial analysts, marketers, teachers, and researchers all rely on percentage change calculations daily.',
      ],
      faq: [
        { q: 'What is the formula for percentage change?', a: 'The formula is: Percentage Change = ((New Value - Old Value) / |Old Value|) x 100. If the result is positive, it represents an increase. If negative, it represents a decrease. The absolute value of the old value is used in the denominator to handle negative starting values correctly.' },
        { q: 'What is the difference between percentage change and percentage difference?', a: 'Percentage change measures the relative change from an original value to a new value, showing direction (increase or decrease). Percentage difference compares two values without a specified starting point, using the average of both values as the denominator. Use percentage change when you have a clear "before" and "after".' },
        { q: 'Can percentage change be more than 100%?', a: 'Yes, absolutely. If a value more than doubles, the percentage change exceeds 100%. For example, if a stock price goes from $10 to $25, the percentage change is 150%. There is no upper limit to percentage increase, but percentage decrease is capped at 100% (when the new value is zero).' },
        { q: 'How do I calculate percentage change with negative numbers?', a: 'When the old value is negative, the formula still works by using the absolute value of the old number in the denominator. For example, going from -20 to -10 represents a 50% increase (the value moved closer to zero/became less negative).' },
        { q: 'What are common uses for percentage change calculations?', a: 'Common uses include tracking investment returns, analyzing sales growth or decline, measuring inflation, comparing test scores over time, monitoring weight changes, calculating price markups or discounts, and evaluating year-over-year business performance metrics.' },
      ],
    },
    it: {
      title: 'Calcolatore Variazione Percentuale Gratuito – Calcola Aumento e Diminuzione Online',
      paragraphs: [
        'La variazione percentuale è un concetto matematico fondamentale utilizzato in finanza, scienza, business e vita quotidiana. Misura la differenza relativa tra un valore vecchio e uno nuovo, espressa come percentuale del valore originale. Comprendere la variazione percentuale aiuta a prendere decisioni migliori.',
        'La formula è semplice: Variazione Percentuale = ((Nuovo Valore - Vecchio Valore) / |Vecchio Valore|) x 100. Un risultato positivo indica un aumento, mentre un risultato negativo indica una diminuzione. Il nostro calcolatore esegue tutti i calcoli istantaneamente.',
        'La variazione percentuale è diversa dalla differenza percentuale. La variazione percentuale confronta un nuovo valore con uno originale e mostra la direzione del cambiamento. La differenza percentuale confronta due valori senza indicare quale sia l\'originale.',
        'Le applicazioni comuni includono il calcolo delle variazioni dei prezzi azionari, la misurazione dei tassi di inflazione, il monitoraggio della crescita dei ricavi aziendali e il confronto di misurazioni scientifiche. Analisti finanziari, marketer, insegnanti e ricercatori si affidano quotidianamente ai calcoli di variazione percentuale.',
      ],
      faq: [
        { q: 'Qual è la formula della variazione percentuale?', a: 'La formula è: Variazione Percentuale = ((Nuovo Valore - Vecchio Valore) / |Vecchio Valore|) x 100. Se il risultato è positivo, rappresenta un aumento. Se negativo, rappresenta una diminuzione.' },
        { q: 'Qual è la differenza tra variazione percentuale e differenza percentuale?', a: 'La variazione percentuale misura il cambiamento relativo da un valore originale a uno nuovo. La differenza percentuale confronta due valori senza un punto di partenza specificato, usando la media di entrambi come denominatore.' },
        { q: 'La variazione percentuale può superare il 100%?', a: 'Sì, assolutamente. Se un valore più che raddoppia, la variazione percentuale supera il 100%. Per esempio, se un prezzo passa da 10€ a 25€, la variazione è del 150%.' },
        { q: 'Come si calcola la variazione percentuale con numeri negativi?', a: 'Quando il valore vecchio è negativo, la formula funziona comunque usando il valore assoluto del numero vecchio al denominatore. Per esempio, passare da -20 a -10 rappresenta un aumento del 50%.' },
        { q: 'Quali sono gli usi comuni della variazione percentuale?', a: 'Gli usi comuni includono il monitoraggio dei rendimenti degli investimenti, l\'analisi della crescita delle vendite, la misurazione dell\'inflazione, il confronto dei risultati dei test e la valutazione delle prestazioni aziendali.' },
      ],
    },
    es: {
      title: 'Calculadora de Cambio Porcentual Gratis – Calcula Aumento y Disminución Online',
      paragraphs: [
        'El cambio porcentual es un concepto matemático fundamental utilizado en finanzas, ciencia, negocios y vida cotidiana. Mide la diferencia relativa entre un valor antiguo y uno nuevo, expresada como porcentaje del valor original.',
        'La fórmula es directa: Cambio Porcentual = ((Nuevo Valor - Valor Antiguo) / |Valor Antiguo|) x 100. Un resultado positivo indica aumento, mientras que uno negativo indica disminución. Nuestra calculadora realiza todos los cálculos al instante.',
        'El cambio porcentual es diferente de la diferencia porcentual. El cambio porcentual compara un nuevo valor con uno original y muestra la dirección del cambio. La diferencia porcentual compara dos valores sin indicar cuál es el original.',
        'Las aplicaciones comunes incluyen calcular cambios de precios en acciones, medir tasas de inflación, rastrear el crecimiento de ingresos empresariales y comparar mediciones científicas entre experimentos.',
      ],
      faq: [
        { q: '¿Cuál es la fórmula del cambio porcentual?', a: 'La fórmula es: Cambio Porcentual = ((Nuevo Valor - Valor Antiguo) / |Valor Antiguo|) x 100. Si el resultado es positivo, representa un aumento. Si es negativo, representa una disminución.' },
        { q: '¿Cuál es la diferencia entre cambio porcentual y diferencia porcentual?', a: 'El cambio porcentual mide el cambio relativo de un valor original a uno nuevo. La diferencia porcentual compara dos valores sin un punto de partida especificado.' },
        { q: '¿El cambio porcentual puede superar el 100%?', a: 'Sí. Si un valor más que se duplica, el cambio porcentual supera el 100%. Por ejemplo, si un precio pasa de $10 a $25, el cambio es del 150%.' },
        { q: '¿Cómo se calcula con números negativos?', a: 'Cuando el valor antiguo es negativo, la fórmula funciona usando el valor absoluto del número antiguo en el denominador. Pasar de -20 a -10 representa un aumento del 50%.' },
        { q: '¿Cuáles son los usos comunes?', a: 'Incluyen seguimiento de rendimientos de inversiones, análisis de crecimiento de ventas, medición de inflación y evaluación de métricas de rendimiento empresarial.' },
      ],
    },
    fr: {
      title: 'Calculateur de Variation en Pourcentage Gratuit – Calculez Augmentation et Diminution',
      paragraphs: [
        'La variation en pourcentage est un concept mathématique fondamental utilisé en finance, science, affaires et vie quotidienne. Elle mesure la différence relative entre une ancienne valeur et une nouvelle, exprimée en pourcentage de la valeur originale.',
        'La formule est simple : Variation = ((Nouvelle Valeur - Ancienne Valeur) / |Ancienne Valeur|) x 100. Un résultat positif indique une augmentation, un résultat négatif une diminution. Notre calculateur effectue tous les calculs instantanément.',
        'La variation en pourcentage diffère de la différence en pourcentage. La variation compare une nouvelle valeur à une valeur originale et montre la direction du changement. La différence compare deux valeurs sans indiquer laquelle est l\'originale.',
        'Les applications courantes incluent le calcul des variations de prix boursiers, la mesure des taux d\'inflation, le suivi de la croissance des revenus et la comparaison de mesures scientifiques.',
      ],
      faq: [
        { q: 'Quelle est la formule de la variation en pourcentage ?', a: 'La formule est : Variation = ((Nouvelle Valeur - Ancienne Valeur) / |Ancienne Valeur|) x 100. Un résultat positif représente une augmentation, un négatif une diminution.' },
        { q: 'Quelle différence entre variation et différence en pourcentage ?', a: 'La variation mesure le changement relatif d\'une valeur originale à une nouvelle. La différence compare deux valeurs sans point de départ spécifié.' },
        { q: 'La variation peut-elle dépasser 100% ?', a: 'Oui. Si une valeur plus que double, la variation dépasse 100%. Par exemple, passer de 10€ à 25€ représente une variation de 150%.' },
        { q: 'Comment calculer avec des nombres négatifs ?', a: 'Quand l\'ancienne valeur est négative, la formule fonctionne en utilisant la valeur absolue au dénominateur. Passer de -20 à -10 représente une augmentation de 50%.' },
        { q: 'Quelles sont les utilisations courantes ?', a: 'Elles incluent le suivi des rendements d\'investissement, l\'analyse de la croissance des ventes, la mesure de l\'inflation et l\'évaluation des performances commerciales.' },
      ],
    },
    de: {
      title: 'Kostenloser Rechner für Prozentuale Änderung – Zunahme und Abnahme Online Berechnen',
      paragraphs: [
        'Die prozentuale Änderung ist ein grundlegendes mathematisches Konzept, das in Finanzen, Wissenschaft, Wirtschaft und Alltag verwendet wird. Sie misst den relativen Unterschied zwischen einem alten und einem neuen Wert, ausgedrückt als Prozentsatz des Originalwerts.',
        'Die Formel ist einfach: Prozentuale Änderung = ((Neuer Wert - Alter Wert) / |Alter Wert|) x 100. Ein positives Ergebnis zeigt eine Zunahme an, ein negatives eine Abnahme. Unser Rechner führt alle Berechnungen sofort durch.',
        'Die prozentuale Änderung unterscheidet sich von der prozentualen Differenz. Die prozentuale Änderung vergleicht einen neuen Wert mit einem Originalwert und zeigt die Richtung. Die prozentuale Differenz vergleicht zwei Werte ohne Angabe des Originals.',
        'Häufige Anwendungen umfassen die Berechnung von Preisänderungen bei Aktien, die Messung von Inflationsraten, die Verfolgung des Umsatzwachstums und den Vergleich wissenschaftlicher Messungen.',
      ],
      faq: [
        { q: 'Wie lautet die Formel für die prozentuale Änderung?', a: 'Die Formel ist: Prozentuale Änderung = ((Neuer Wert - Alter Wert) / |Alter Wert|) x 100. Ein positives Ergebnis stellt eine Zunahme dar, ein negatives eine Abnahme.' },
        { q: 'Was ist der Unterschied zwischen prozentualer Änderung und Differenz?', a: 'Die prozentuale Änderung misst die relative Änderung von einem Originalwert zu einem neuen Wert. Die prozentuale Differenz vergleicht zwei Werte ohne festgelegten Ausgangspunkt.' },
        { q: 'Kann die prozentuale Änderung über 100% liegen?', a: 'Ja. Wenn sich ein Wert mehr als verdoppelt, übersteigt die Änderung 100%. Beispiel: Von 10€ auf 25€ entspricht einer Änderung von 150%.' },
        { q: 'Wie berechnet man mit negativen Zahlen?', a: 'Bei negativem Altwert wird der Absolutwert im Nenner verwendet. Von -20 auf -10 entspricht einer Zunahme von 50%.' },
        { q: 'Was sind häufige Anwendungen?', a: 'Dazu gehören Verfolgung von Anlagerenditen, Analyse des Umsatzwachstums, Messung der Inflation und Bewertung von Geschäftsleistungskennzahlen.' },
      ],
    },
    pt: {
      title: 'Calculadora de Variação Percentual Grátis – Calcule Aumento e Diminuição Online',
      paragraphs: [
        'A variação percentual é um conceito matemático fundamental usado em finanças, ciência, negócios e vida cotidiana. Ela mede a diferença relativa entre um valor antigo e um novo, expressa como porcentagem do valor original.',
        'A fórmula é direta: Variação Percentual = ((Novo Valor - Valor Antigo) / |Valor Antigo|) x 100. Um resultado positivo indica aumento, enquanto negativo indica diminuição. Nossa calculadora faz todos os cálculos instantaneamente.',
        'A variação percentual é diferente da diferença percentual. A variação compara um novo valor com um original e mostra a direção da mudança. A diferença compara dois valores sem indicar qual é o original.',
        'Aplicações comuns incluem cálculo de mudanças de preços em ações, medição de taxas de inflação, acompanhamento do crescimento de receitas e comparação de medições científicas.',
      ],
      faq: [
        { q: 'Qual é a fórmula da variação percentual?', a: 'A fórmula é: Variação Percentual = ((Novo Valor - Valor Antigo) / |Valor Antigo|) x 100. Se positivo, representa aumento. Se negativo, representa diminuição.' },
        { q: 'Qual a diferença entre variação percentual e diferença percentual?', a: 'A variação percentual mede a mudança relativa de um valor original para um novo. A diferença percentual compara dois valores sem ponto de partida especificado.' },
        { q: 'A variação percentual pode ultrapassar 100%?', a: 'Sim. Se um valor mais que dobra, a variação ultrapassa 100%. Por exemplo, de R$10 para R$25 representa uma variação de 150%.' },
        { q: 'Como calcular com números negativos?', a: 'Quando o valor antigo é negativo, a fórmula funciona usando o valor absoluto no denominador. De -20 para -10 representa um aumento de 50%.' },
        { q: 'Quais são os usos comuns?', a: 'Incluem acompanhamento de retornos de investimentos, análise de crescimento de vendas, medição de inflação e avaliação de métricas de desempenho empresarial.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="percentage-change-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.oldValue[lang]}</label>
            <input type="number" value={oldValue} onChange={(e) => setOldValue(e.target.value)} onBlur={() => setTouched(p => ({ ...p, old: true }))} placeholder="100"
              className={`w-full border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 ${oldError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {oldError && <p className="text-red-500 text-xs mt-1">{labels.invalidOld[lang]}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.newValue[lang]}</label>
            <input type="number" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="150" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex gap-2">
            <button onClick={() => { setOldValue(''); setNewValue(''); setTouched({}); }} className="flex-1 py-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
              {labels.reset[lang]}
            </button>
            {hasResult && (
              <button onClick={() => { const t = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`; navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">
                {copied ? labels.copied[lang] : labels.copy[lang]}
              </button>
            )}
          </div>

          {hasResult && (
            <div className="space-y-3">
              <div className={`p-5 rounded-xl border ${change > 0 ? 'bg-green-50 border-green-200' : change < 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'} text-center`}>
                <div className="text-4xl font-bold text-gray-900">{change >= 0 ? '+' : ''}{change.toFixed(2)}%</div>
                <div className={`text-lg font-semibold mt-1 ${getType().color}`}>{getType().text}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl text-center">
                  <div className="text-xs text-gray-500">{labels.diff[lang]}</div>
                  <div className={`text-xl font-bold ${difference >= 0 ? 'text-green-700' : 'text-red-700'}`}>{difference >= 0 ? '+' : ''}{difference.toFixed(2)}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl text-center">
                  <div className="text-xs text-gray-500">{labels.oldValue[lang]} → {labels.newValue[lang]}</div>
                  <div className="text-xl font-bold text-gray-700">{oldNum} → {newNum}</div>
                </div>
              </div>
              {/* Visual change bar */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-px h-full bg-gray-400" style={{ marginLeft: '50%' }} />
                  </div>
                  <div className={`h-full rounded-full transition-all ${change >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, Math.abs(change) / 2)}%`, marginLeft: change < 0 ? `${50 - Math.min(50, Math.abs(change) / 2)}%` : '50%' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">{labels.history[lang]}</h3>
              <button onClick={() => setHistory([])} className="text-xs text-red-500 hover:text-red-700">Clear</button>
            </div>
            <div className="space-y-1">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between text-sm px-2 py-1.5 bg-gray-50 rounded">
                  <span className="text-gray-500">{h.from} → {h.to}</span>
                  <span className={`font-semibold ${h.change.startsWith('+') ? 'text-green-700' : 'text-red-700'}`}>{h.change}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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
