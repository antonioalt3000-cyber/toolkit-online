'use client';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type DiffLine = { type: 'equal' | 'added' | 'removed'; text: string };

function computeDiff(a: string, b: string): DiffLine[] {
  const linesA = a.split('\n');
  const linesB = b.split('\n');
  const m = linesA.length;
  const n = linesB.length;

  // LCS-based diff
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = linesA[i - 1] === linesB[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = m, j = n;
  const stack: DiffLine[] = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
      stack.push({ type: 'equal', text: linesA[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({ type: 'added', text: linesB[j - 1] });
      j--;
    } else {
      stack.push({ type: 'removed', text: linesA[i - 1] });
      i--;
    }
  }
  while (stack.length) result.push(stack.pop()!);
  return result;
}

export default function TextDiff() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['text-diff'][lang];

  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');

  const labels = {
    originalText: { en: 'Original Text', it: 'Testo Originale', es: 'Texto Original', fr: 'Texte Original', de: 'Originaltext', pt: 'Texto Original' },
    modifiedText: { en: 'Modified Text', it: 'Testo Modificato', es: 'Texto Modificado', fr: 'Texte Modifié', de: 'Geänderter Text', pt: 'Texto Modificado' },
    differences: { en: 'Differences', it: 'Differenze', es: 'Diferencias', fr: 'Différences', de: 'Unterschiede', pt: 'Diferenças' },
    noDiff: { en: 'Texts are identical', it: 'I testi sono identici', es: 'Los textos son idénticos', fr: 'Les textes sont identiques', de: 'Texte sind identisch', pt: 'Os textos são idênticos' },
    enterText: { en: 'Enter text in both fields to compare', it: 'Inserisci testo in entrambi i campi per confrontare', es: 'Ingresa texto en ambos campos para comparar', fr: 'Entrez du texte dans les deux champs pour comparer', de: 'Geben Sie Text in beide Felder ein', pt: 'Insira texto em ambos os campos para comparar' },
    linesAdded: { en: 'lines added', it: 'righe aggiunte', es: 'líneas añadidas', fr: 'lignes ajoutées', de: 'Zeilen hinzugefügt', pt: 'linhas adicionadas' },
    linesRemoved: { en: 'lines removed', it: 'righe rimosse', es: 'líneas eliminadas', fr: 'lignes supprimées', de: 'Zeilen entfernt', pt: 'linhas removidas' },
    linesUnchanged: { en: 'lines unchanged', it: 'righe invariate', es: 'líneas sin cambios', fr: 'lignes inchangées', de: 'Zeilen unverändert', pt: 'linhas inalteradas' },
    placeholder: { en: 'Paste your text here...', it: 'Incolla il testo qui...', es: 'Pega tu texto aquí...', fr: 'Collez votre texte ici...', de: 'Fügen Sie Ihren Text hier ein...', pt: 'Cole seu texto aqui...' },
  } as Record<string, Record<Locale, string>>;

  const diff = useMemo(() => {
    if (!textA && !textB) return [];
    return computeDiff(textA, textB);
  }, [textA, textB]);

  const stats = useMemo(() => {
    const added = diff.filter(d => d.type === 'added').length;
    const removed = diff.filter(d => d.type === 'removed').length;
    const equal = diff.filter(d => d.type === 'equal').length;
    return { added, removed, equal };
  }, [diff]);

  const hasBothTexts = textA.length > 0 || textB.length > 0;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Text Diff Tool – Compare Two Texts and Highlight Differences Online',
      paragraphs: [
        'Text comparison is a fundamental task in writing, programming, and content management. Whether you are reviewing changes to a document, comparing code versions, or verifying that edits were applied correctly, a reliable diff tool saves time and prevents errors.',
        'Our free text diff tool uses a Longest Common Subsequence (LCS) algorithm to compute the minimal set of changes between two texts. Lines present only in the original appear in red (removed), lines present only in the modified version appear in green (added), and unchanged lines are shown normally for context.',
        'Unlike many online diff tools that require file uploads or account creation, our tool works entirely in your browser. Paste your two texts side by side, and the differences are highlighted instantly. No data is transmitted to any server, making it safe for comparing sensitive documents, contracts, or proprietary code.',
        'The tool provides summary statistics showing how many lines were added, removed, and left unchanged. This gives you a quick overview of how much a text has been modified, which is especially useful for reviewing large documents or tracking revisions over time.',
      ],
      faq: [
        { q: 'How does the text diff algorithm work?', a: 'Our tool uses the Longest Common Subsequence (LCS) algorithm, which finds the longest sequence of lines common to both texts. Lines not in this sequence are marked as additions or removals. This is the same foundational algorithm used by tools like Git diff.' },
        { q: 'Can I compare code with this tool?', a: 'Yes, this tool works with any plain text including source code, HTML, CSS, JSON, and more. It compares line by line, so it is well-suited for reviewing code changes. However, it does not provide syntax highlighting.' },
        { q: 'Is my text data safe?', a: 'Absolutely. All comparisons are performed entirely in your browser using JavaScript. No text data is sent to any server. You can verify this by using the tool with your network tab open in browser developer tools.' },
        { q: 'What is the maximum text size I can compare?', a: 'The tool can handle texts of several thousand lines. For very large files (over 10,000 lines), performance may slow down due to the computational complexity of the diff algorithm. For such cases, consider using a desktop diff tool.' },
        { q: 'Does it detect word-level changes within a line?', a: 'Currently, the tool compares text at the line level. If a single word changes within a line, the entire line is shown as removed and a new version as added. Word-level inline diffing may be added in a future update.' },
      ],
    },
    it: {
      title: 'Strumento Diff Testo Gratuito – Confronta Due Testi e Evidenzia le Differenze',
      paragraphs: [
        'Il confronto di testi è un\'operazione fondamentale nella scrittura, nella programmazione e nella gestione dei contenuti. Che tu stia revisionando modifiche a un documento, confrontando versioni di codice o verificando che le correzioni siano state applicate, uno strumento diff affidabile fa risparmiare tempo.',
        'Il nostro strumento diff gratuito utilizza l\'algoritmo LCS (Longest Common Subsequence) per calcolare l\'insieme minimo di modifiche tra due testi. Le righe presenti solo nell\'originale appaiono in rosso, quelle presenti solo nella versione modificata in verde, e le righe invariate vengono mostrate normalmente.',
        'A differenza di molti strumenti online che richiedono caricamento file o registrazione, il nostro funziona interamente nel browser. Incolla i due testi e le differenze vengono evidenziate istantaneamente. Nessun dato viene trasmesso a server esterni.',
        'Lo strumento fornisce statistiche che mostrano quante righe sono state aggiunte, rimosse e lasciate invariate, dando una panoramica rapida dell\'entità delle modifiche.',
      ],
      faq: [
        { q: 'Come funziona l\'algoritmo diff?', a: 'Il nostro strumento usa l\'algoritmo LCS (Longest Common Subsequence) che trova la sequenza più lunga di righe comuni a entrambi i testi. Le righe non in questa sequenza sono marcate come aggiunte o rimosse.' },
        { q: 'Posso confrontare codice con questo strumento?', a: 'Sì, lo strumento funziona con qualsiasi testo incluso codice sorgente, HTML, CSS, JSON e altro. Confronta riga per riga ed è adatto per revisionare modifiche al codice.' },
        { q: 'I miei dati sono al sicuro?', a: 'Assolutamente sì. Tutti i confronti vengono eseguiti nel browser con JavaScript. Nessun dato viene inviato a server esterni.' },
        { q: 'Qual è la dimensione massima del testo?', a: 'Lo strumento può gestire testi di diverse migliaia di righe. Per file molto grandi (oltre 10.000 righe), le prestazioni potrebbero rallentare.' },
      ],
    },
    es: {
      title: 'Herramienta Diff de Texto Gratis – Compara Dos Textos y Resalta Diferencias',
      paragraphs: [
        'La comparación de textos es una tarea fundamental en la escritura, programación y gestión de contenidos. Ya sea revisando cambios en un documento, comparando versiones de código o verificando correcciones, una herramienta diff confiable ahorra tiempo y previene errores.',
        'Nuestra herramienta diff gratuita utiliza el algoritmo LCS para calcular el conjunto mínimo de cambios entre dos textos. Las líneas solo en el original aparecen en rojo, las solo en la versión modificada en verde, y las líneas sin cambios se muestran normalmente.',
        'A diferencia de muchas herramientas que requieren cargar archivos o crear cuentas, la nuestra funciona completamente en tu navegador. Pega los dos textos y las diferencias se resaltan al instante. Ningún dato se transmite a servidores.',
        'La herramienta proporciona estadísticas que muestran cuántas líneas se añadieron, eliminaron y quedaron sin cambios.',
      ],
      faq: [
        { q: '¿Cómo funciona el algoritmo diff?', a: 'Usamos el algoritmo LCS (Longest Common Subsequence) que encuentra la secuencia más larga de líneas comunes. Las líneas no en esta secuencia se marcan como añadidas o eliminadas.' },
        { q: '¿Puedo comparar código con esta herramienta?', a: 'Sí, funciona con cualquier texto plano incluyendo código fuente, HTML, CSS, JSON y más. Compara línea por línea.' },
        { q: '¿Mis datos están seguros?', a: 'Absolutamente. Todas las comparaciones se realizan en tu navegador con JavaScript. Ningún dato se envía a servidores externos.' },
        { q: '¿Cuál es el tamaño máximo de texto?', a: 'La herramienta puede manejar textos de varios miles de líneas. Para archivos muy grandes, el rendimiento podría disminuir.' },
      ],
    },
    fr: {
      title: 'Outil Diff Texte Gratuit – Comparez Deux Textes et Surlignez les Différences',
      paragraphs: [
        'La comparaison de textes est une tâche fondamentale dans l\'écriture, la programmation et la gestion de contenu. Que vous révisiez des modifications, compariez des versions de code ou vérifiez des corrections, un outil diff fiable fait gagner du temps.',
        'Notre outil diff gratuit utilise l\'algorithme LCS pour calculer l\'ensemble minimal de changements entre deux textes. Les lignes uniquement dans l\'original apparaissent en rouge, celles uniquement dans la version modifiée en vert.',
        'Contrairement à de nombreux outils qui nécessitent le téléchargement de fichiers ou la création de comptes, le nôtre fonctionne entièrement dans votre navigateur. Collez les deux textes et les différences sont surlignées instantanément.',
        'L\'outil fournit des statistiques montrant combien de lignes ont été ajoutées, supprimées et laissées inchangées.',
      ],
      faq: [
        { q: 'Comment fonctionne l\'algorithme diff ?', a: 'Notre outil utilise l\'algorithme LCS qui trouve la plus longue séquence de lignes communes aux deux textes. Les lignes hors de cette séquence sont marquées comme ajouts ou suppressions.' },
        { q: 'Puis-je comparer du code avec cet outil ?', a: 'Oui, l\'outil fonctionne avec tout texte brut y compris le code source, HTML, CSS, JSON et plus. Il compare ligne par ligne.' },
        { q: 'Mes données sont-elles en sécurité ?', a: 'Absolument. Toutes les comparaisons sont effectuées dans votre navigateur avec JavaScript. Aucune donnée n\'est envoyée à des serveurs.' },
        { q: 'Quelle est la taille maximale du texte ?', a: 'L\'outil peut gérer des textes de plusieurs milliers de lignes. Pour de très gros fichiers, les performances pourraient diminuer.' },
      ],
    },
    de: {
      title: 'Kostenloses Text-Diff-Tool – Zwei Texte Vergleichen und Unterschiede Hervorheben',
      paragraphs: [
        'Textvergleich ist eine grundlegende Aufgabe beim Schreiben, Programmieren und in der Content-Verwaltung. Ob Sie Änderungen an einem Dokument prüfen, Code-Versionen vergleichen oder Korrekturen überprüfen — ein zuverlässiges Diff-Tool spart Zeit.',
        'Unser kostenloses Diff-Tool verwendet den LCS-Algorithmus, um den minimalen Satz von Änderungen zwischen zwei Texten zu berechnen. Zeilen nur im Original erscheinen rot, Zeilen nur in der geänderten Version grün.',
        'Anders als viele Tools, die Datei-Upload oder Kontoanmeldung erfordern, arbeitet unseres vollständig in Ihrem Browser. Fügen Sie die Texte ein und die Unterschiede werden sofort hervorgehoben. Keine Daten werden an Server gesendet.',
        'Das Tool zeigt Statistiken, wie viele Zeilen hinzugefügt, entfernt und unverändert geblieben sind.',
      ],
      faq: [
        { q: 'Wie funktioniert der Diff-Algorithmus?', a: 'Unser Tool verwendet den LCS-Algorithmus, der die längste gemeinsame Teilfolge von Zeilen findet. Zeilen außerhalb dieser Folge werden als Hinzufügungen oder Löschungen markiert.' },
        { q: 'Kann ich Code mit diesem Tool vergleichen?', a: 'Ja, das Tool funktioniert mit jedem Klartext einschließlich Quellcode, HTML, CSS, JSON und mehr. Es vergleicht Zeile für Zeile.' },
        { q: 'Sind meine Daten sicher?', a: 'Absolut. Alle Vergleiche werden in Ihrem Browser mit JavaScript durchgeführt. Keine Daten werden an Server gesendet.' },
        { q: 'Was ist die maximale Textgröße?', a: 'Das Tool kann Texte mit mehreren tausend Zeilen verarbeiten. Bei sehr großen Dateien kann die Leistung abnehmen.' },
      ],
    },
    pt: {
      title: 'Ferramenta Diff de Texto Grátis – Compare Dois Textos e Destaque Diferenças',
      paragraphs: [
        'A comparação de textos é uma tarefa fundamental na escrita, programação e gestão de conteúdo. Seja revisando mudanças em um documento, comparando versões de código ou verificando correções, uma ferramenta diff confiável economiza tempo.',
        'Nossa ferramenta diff gratuita usa o algoritmo LCS para calcular o conjunto mínimo de mudanças entre dois textos. Linhas apenas no original aparecem em vermelho, linhas apenas na versão modificada em verde.',
        'Diferente de muitas ferramentas que exigem upload de arquivos ou criação de conta, a nossa funciona inteiramente no navegador. Cole os dois textos e as diferenças são destacadas instantaneamente.',
        'A ferramenta fornece estatísticas mostrando quantas linhas foram adicionadas, removidas e mantidas inalteradas.',
      ],
      faq: [
        { q: 'Como funciona o algoritmo diff?', a: 'Usamos o algoritmo LCS que encontra a maior sequência de linhas comuns. Linhas fora dessa sequência são marcadas como adições ou remoções.' },
        { q: 'Posso comparar código com esta ferramenta?', a: 'Sim, funciona com qualquer texto simples incluindo código fonte, HTML, CSS, JSON e mais. Compara linha por linha.' },
        { q: 'Meus dados estão seguros?', a: 'Absolutamente. Todas as comparações são feitas no navegador com JavaScript. Nenhum dado é enviado a servidores.' },
        { q: 'Qual o tamanho máximo do texto?', a: 'A ferramenta pode lidar com textos de milhares de linhas. Para arquivos muito grandes, o desempenho pode diminuir.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="text-diff" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.originalText[lang]}</label>
              <textarea
                value={textA}
                onChange={(e) => setTextA(e.target.value)}
                placeholder={labels.placeholder[lang]}
                rows={10}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.modifiedText[lang]}</label>
              <textarea
                value={textB}
                onChange={(e) => setTextB(e.target.value)}
                placeholder={labels.placeholder[lang]}
                rows={10}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </div>
          </div>

          {hasBothTexts && diff.length > 0 && (
            <>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600 font-medium">+{stats.added} {labels.linesAdded[lang]}</span>
                <span className="text-red-600 font-medium">-{stats.removed} {labels.linesRemoved[lang]}</span>
                <span className="text-gray-500">{stats.equal} {labels.linesUnchanged[lang]}</span>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">{labels.differences[lang]}</div>
                <div className="max-h-96 overflow-y-auto font-mono text-sm">
                  {stats.added === 0 && stats.removed === 0 ? (
                    <div className="px-4 py-3 text-gray-500 text-center">{labels.noDiff[lang]}</div>
                  ) : (
                    diff.map((line, i) => (
                      <div
                        key={i}
                        className={`px-4 py-0.5 whitespace-pre-wrap break-all ${
                          line.type === 'added' ? 'bg-green-50 text-green-800' :
                          line.type === 'removed' ? 'bg-red-50 text-red-800' :
                          'text-gray-700'
                        }`}
                      >
                        <span className="select-none mr-2 text-gray-400">
                          {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                        </span>
                        {line.text || '\u00A0'}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {!hasBothTexts && (
            <div className="text-center text-gray-400 py-8">{labels.enterText[lang]}</div>
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
