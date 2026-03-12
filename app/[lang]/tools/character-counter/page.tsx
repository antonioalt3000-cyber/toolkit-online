'use client';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  inputText: { en: 'Enter your text', it: 'Inserisci il testo', es: 'Ingresa tu texto', fr: 'Entrez votre texte', de: 'Text eingeben', pt: 'Digite seu texto' },
  totalChars: { en: 'Total Characters', it: 'Caratteri Totali', es: 'Caracteres Totales', fr: 'Caractères Totaux', de: 'Zeichen Gesamt', pt: 'Caracteres Totais' },
  vowels: { en: 'Vowels', it: 'Vocali', es: 'Vocales', fr: 'Voyelles', de: 'Vokale', pt: 'Vogais' },
  consonants: { en: 'Consonants', it: 'Consonanti', es: 'Consonantes', fr: 'Consonnes', de: 'Konsonanten', pt: 'Consoantes' },
  digits: { en: 'Digits', it: 'Cifre', es: 'Dígitos', fr: 'Chiffres', de: 'Ziffern', pt: 'Dígitos' },
  spaces: { en: 'Spaces', it: 'Spazi', es: 'Espacios', fr: 'Espaces', de: 'Leerzeichen', pt: 'Espaços' },
  specialChars: { en: 'Special Characters', it: 'Caratteri Speciali', es: 'Caracteres Especiales', fr: 'Caractères Spéciaux', de: 'Sonderzeichen', pt: 'Caracteres Especiais' },
  words: { en: 'Words', it: 'Parole', es: 'Palabras', fr: 'Mots', de: 'Wörter', pt: 'Palavras' },
  sentences: { en: 'Sentences', it: 'Frasi', es: 'Oraciones', fr: 'Phrases', de: 'Sätze', pt: 'Frases' },
  mostFrequent: { en: 'Most Frequent Letter', it: 'Lettera Più Frequente', es: 'Letra Más Frecuente', fr: 'Lettre la Plus Fréquente', de: 'Häufigster Buchstabe', pt: 'Letra Mais Frequente' },
  charWithout: { en: 'Characters (no spaces)', it: 'Caratteri (senza spazi)', es: 'Caracteres (sin espacios)', fr: 'Caractères (sans espaces)', de: 'Zeichen (ohne Leerzeichen)', pt: 'Caracteres (sem espaços)' },
};

export default function CharacterCounter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['character-counter'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [text, setText] = useState('');

  const analysis = useMemo(() => {
    const vowels = (text.match(/[aeiouAEIOU]/g) || []).length;
    const consonants = (text.match(/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/g) || []).length;
    const digits = (text.match(/\d/g) || []).length;
    const spaces = (text.match(/ /g) || []).length;
    const specialChars = text.length - vowels - consonants - digits - spaces;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.trim() ? (text.match(/[.!?]+/g) || []).length || (text.trim().length > 0 ? 1 : 0) : 0;

    const freq: Record<string, number> = {};
    for (const ch of text.toLowerCase()) {
      if (/[a-z]/.test(ch)) {
        freq[ch] = (freq[ch] || 0) + 1;
      }
    }
    let mostFrequent = '—';
    let maxCount = 0;
    for (const [letter, count] of Object.entries(freq)) {
      if (count > maxCount) { maxCount = count; mostFrequent = `${letter.toUpperCase()} (${count})`; }
    }

    return { total: text.length, noSpaces: text.length - spaces, vowels, consonants, digits, spaces, specialChars, words, sentences, mostFrequent };
  }, [text]);

  const stats = [
    { key: 'totalChars', value: analysis.total },
    { key: 'charWithout', value: analysis.noSpaces },
    { key: 'words', value: analysis.words },
    { key: 'sentences', value: analysis.sentences },
    { key: 'vowels', value: analysis.vowels },
    { key: 'consonants', value: analysis.consonants },
    { key: 'digits', value: analysis.digits },
    { key: 'spaces', value: analysis.spaces },
    { key: 'specialChars', value: analysis.specialChars },
    { key: 'mostFrequent', value: analysis.mostFrequent },
  ];

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Online Character Counter – Detailed Text Analysis',
      paragraphs: [
        'Knowing the exact character count of your text is crucial in many situations: writing tweets within the 280-character limit, crafting meta descriptions under 160 characters, or meeting essay requirements. Our free character counter goes far beyond a simple count, providing a complete breakdown of your text.',
        'This tool analyzes your text in real time and shows total characters, characters without spaces, words, sentences, vowels, consonants, digits, special characters, and even the most frequently used letter. This level of detail is invaluable for linguists, students, content creators, and developers alike.',
        'For SEO professionals, character count matters when optimizing title tags (recommended under 60 characters), meta descriptions (under 160 characters), and URLs. Social media managers need it for platform-specific limits: Twitter/X (280 chars), Instagram bios (150 chars), and Pinterest descriptions (500 chars).',
        'The frequency analysis feature helps writers identify overused letters or patterns in their text, which can be useful for cryptography exercises, linguistic research, or simply improving writing variety. All analysis runs locally in your browser for instant results and complete privacy.',
      ],
      faq: [
        { q: 'What is the difference between a character counter and a word counter?', a: 'A character counter counts every individual character including letters, numbers, spaces, and punctuation marks. A word counter counts groups of characters separated by spaces. This tool provides both, plus additional metrics like vowels, consonants, and letter frequency.' },
        { q: 'Do spaces count as characters?', a: 'Yes, spaces are characters. That is why this tool shows both "Total Characters" (including spaces) and "Characters (no spaces)". Different platforms count characters differently — Twitter includes spaces, while some systems exclude them.' },
        { q: 'How are sentences counted?', a: 'Sentences are counted by detecting sentence-ending punctuation marks: periods (.), exclamation marks (!), and question marks (?). If your text has no punctuation but contains content, it is counted as one sentence.' },
        { q: 'What counts as a special character?', a: 'Special characters are any characters that are not vowels, consonants, digits, or spaces. This includes punctuation marks (!@#$%^&*), brackets, hyphens, underscores, and Unicode symbols like emojis or accented characters.' },
        { q: 'How is the most frequent letter determined?', a: 'The tool counts occurrences of each letter (a-z, case-insensitive) in your text and displays the one with the highest count. In English text, the letter "E" is typically the most frequent, followed by "T" and "A".' },
      ],
    },
    it: {
      title: 'Contatore di Caratteri Online Gratuito – Analisi Dettagliata del Testo',
      paragraphs: [
        'Conoscere il conteggio esatto dei caratteri del tuo testo è fondamentale in molte situazioni: scrivere tweet entro il limite di 280 caratteri, creare meta description sotto i 160 caratteri o rispettare i requisiti dei saggi. Il nostro contatore di caratteri gratuito va ben oltre il semplice conteggio.',
        'Questo strumento analizza il tuo testo in tempo reale e mostra caratteri totali, caratteri senza spazi, parole, frasi, vocali, consonanti, cifre, caratteri speciali e persino la lettera più usata. Questo livello di dettaglio è prezioso per linguisti, studenti, creatori di contenuti e sviluppatori.',
        'Per i professionisti SEO, il conteggio dei caratteri è importante per ottimizzare i tag title (consigliati sotto i 60 caratteri), le meta description (sotto i 160 caratteri) e gli URL. I social media manager ne hanno bisogno per i limiti specifici delle piattaforme.',
        'La funzione di analisi della frequenza aiuta gli scrittori a identificare lettere o pattern sovra-utilizzati nel testo, utile per esercizi di crittografia, ricerca linguistica o semplicemente per migliorare la varietà della scrittura. Tutta l\'analisi avviene localmente nel browser.',
      ],
      faq: [
        { q: 'Qual è la differenza tra un contatore di caratteri e un contatore di parole?', a: 'Un contatore di caratteri conta ogni singolo carattere incluse lettere, numeri, spazi e punteggiatura. Un contatore di parole conta gruppi di caratteri separati da spazi. Questo strumento fornisce entrambi, più metriche aggiuntive come vocali, consonanti e frequenza delle lettere.' },
        { q: 'Gli spazi contano come caratteri?', a: 'Sì, gli spazi sono caratteri. Per questo lo strumento mostra sia "Caratteri Totali" (inclusi spazi) che "Caratteri (senza spazi)". Diverse piattaforme contano i caratteri in modo diverso.' },
        { q: 'Come vengono contate le frasi?', a: 'Le frasi vengono contate rilevando i segni di punteggiatura di fine frase: punti (.), punti esclamativi (!) e punti interrogativi (?). Se il testo non ha punteggiatura ma contiene contenuto, viene contato come una frase.' },
        { q: 'Cosa conta come carattere speciale?', a: 'I caratteri speciali sono tutti i caratteri che non sono vocali, consonanti, cifre o spazi. Questo include segni di punteggiatura, parentesi, trattini, underscore e simboli Unicode come emoji.' },
        { q: 'Come viene determinata la lettera più frequente?', a: 'Lo strumento conta le occorrenze di ogni lettera (a-z, senza distinzione maiuscole/minuscole) nel testo e mostra quella con il conteggio più alto. Nel testo italiano, la lettera "A" è tipicamente la più frequente.' },
      ],
    },
    es: {
      title: 'Contador de Caracteres Online Gratis – Análisis Detallado de Texto',
      paragraphs: [
        'Conocer el conteo exacto de caracteres de tu texto es crucial en muchas situaciones: escribir tweets dentro del límite de 280 caracteres, crear meta descripciones de menos de 160 caracteres o cumplir requisitos de ensayos. Nuestro contador de caracteres gratuito va mucho más allá del simple conteo.',
        'Esta herramienta analiza tu texto en tiempo real y muestra caracteres totales, caracteres sin espacios, palabras, oraciones, vocales, consonantes, dígitos, caracteres especiales e incluso la letra más frecuente. Este nivel de detalle es invaluable para lingüistas, estudiantes y creadores de contenido.',
        'Para profesionales de SEO, el conteo de caracteres importa al optimizar etiquetas de título (recomendado menos de 60 caracteres), meta descripciones (menos de 160 caracteres) y URLs. Los community managers lo necesitan para los límites de cada plataforma.',
        'La función de análisis de frecuencia ayuda a identificar letras o patrones sobreutilizados, útil para criptografía, investigación lingüística o mejorar la variedad de escritura. Todo el análisis se ejecuta localmente en tu navegador.',
      ],
      faq: [
        { q: '¿Cuál es la diferencia entre un contador de caracteres y uno de palabras?', a: 'Un contador de caracteres cuenta cada carácter individual incluyendo letras, números, espacios y puntuación. Un contador de palabras cuenta grupos de caracteres separados por espacios. Esta herramienta proporciona ambos.' },
        { q: '¿Los espacios cuentan como caracteres?', a: 'Sí, los espacios son caracteres. Por eso la herramienta muestra tanto "Caracteres Totales" como "Caracteres (sin espacios)". Diferentes plataformas cuentan caracteres de manera diferente.' },
        { q: '¿Cómo se cuentan las oraciones?', a: 'Las oraciones se cuentan detectando signos de puntuación finales: puntos (.), signos de exclamación (!) y signos de interrogación (?). Si tu texto no tiene puntuación pero contiene contenido, se cuenta como una oración.' },
        { q: '¿Qué cuenta como carácter especial?', a: 'Los caracteres especiales son cualquier carácter que no sea vocal, consonante, dígito o espacio. Esto incluye signos de puntuación, paréntesis, guiones y símbolos Unicode como emojis.' },
        { q: '¿Cómo se determina la letra más frecuente?', a: 'La herramienta cuenta las ocurrencias de cada letra (a-z, sin distinción de mayúsculas) y muestra la que tiene el conteo más alto. En español, la letra "A" suele ser la más frecuente.' },
      ],
    },
    fr: {
      title: 'Compteur de Caractères en Ligne Gratuit – Analyse Détaillée du Texte',
      paragraphs: [
        'Connaître le nombre exact de caractères de votre texte est crucial dans de nombreuses situations : écrire des tweets dans la limite de 280 caractères, rédiger des méta-descriptions de moins de 160 caractères ou respecter les exigences de dissertations. Notre compteur de caractères gratuit va bien au-delà du simple comptage.',
        'Cet outil analyse votre texte en temps réel et affiche les caractères totaux, caractères sans espaces, mots, phrases, voyelles, consonnes, chiffres, caractères spéciaux et même la lettre la plus fréquente. Ce niveau de détail est précieux pour les linguistes, étudiants et créateurs de contenu.',
        'Pour les professionnels du SEO, le comptage de caractères est important pour optimiser les balises titre (recommandé sous 60 caractères), les méta-descriptions (sous 160 caractères) et les URL. Les community managers en ont besoin pour les limites spécifiques de chaque plateforme.',
        'La fonction d\'analyse de fréquence aide à identifier les lettres ou patterns surutilisés, utile pour la cryptographie, la recherche linguistique ou l\'amélioration de la variété rédactionnelle. Toute l\'analyse s\'exécute localement dans votre navigateur.',
      ],
      faq: [
        { q: 'Quelle est la différence entre un compteur de caractères et un compteur de mots ?', a: 'Un compteur de caractères compte chaque caractère individuel incluant lettres, chiffres, espaces et ponctuation. Un compteur de mots compte les groupes de caractères séparés par des espaces. Cet outil fournit les deux.' },
        { q: 'Les espaces comptent-ils comme des caractères ?', a: 'Oui, les espaces sont des caractères. C\'est pourquoi l\'outil affiche à la fois « Caractères Totaux » et « Caractères (sans espaces) ». Différentes plateformes comptent les caractères différemment.' },
        { q: 'Comment les phrases sont-elles comptées ?', a: 'Les phrases sont comptées en détectant les signes de ponctuation de fin de phrase : points (.), points d\'exclamation (!) et points d\'interrogation (?). Si votre texte n\'a pas de ponctuation mais contient du contenu, il est compté comme une phrase.' },
        { q: 'Qu\'est-ce qui compte comme caractère spécial ?', a: 'Les caractères spéciaux sont tous les caractères qui ne sont pas des voyelles, consonnes, chiffres ou espaces. Cela inclut les signes de ponctuation, parenthèses, tirets et symboles Unicode comme les émojis.' },
        { q: 'Comment la lettre la plus fréquente est-elle déterminée ?', a: 'L\'outil compte les occurrences de chaque lettre (a-z, insensible à la casse) et affiche celle avec le compte le plus élevé. En français, la lettre « E » est typiquement la plus fréquente.' },
      ],
    },
    de: {
      title: 'Kostenloser Online-Zeichenzähler – Detaillierte Textanalyse',
      paragraphs: [
        'Die genaue Zeichenanzahl Ihres Textes zu kennen ist in vielen Situationen entscheidend: Tweets innerhalb des 280-Zeichen-Limits schreiben, Meta-Beschreibungen unter 160 Zeichen erstellen oder Aufsatzanforderungen erfüllen. Unser kostenloser Zeichenzähler geht weit über das einfache Zählen hinaus.',
        'Dieses Tool analysiert Ihren Text in Echtzeit und zeigt Gesamtzeichen, Zeichen ohne Leerzeichen, Wörter, Sätze, Vokale, Konsonanten, Ziffern, Sonderzeichen und sogar den häufigsten Buchstaben. Dieses Detailniveau ist wertvoll für Linguisten, Studenten und Content-Ersteller.',
        'Für SEO-Profis ist die Zeichenanzahl wichtig bei der Optimierung von Title-Tags (empfohlen unter 60 Zeichen), Meta-Beschreibungen (unter 160 Zeichen) und URLs. Social-Media-Manager benötigen es für plattformspezifische Limits.',
        'Die Häufigkeitsanalyse hilft, überverwendete Buchstaben oder Muster zu identifizieren, nützlich für Kryptografie, linguistische Forschung oder die Verbesserung der Schreibvielfalt. Die gesamte Analyse läuft lokal in Ihrem Browser.',
      ],
      faq: [
        { q: 'Was ist der Unterschied zwischen einem Zeichenzähler und einem Wortzähler?', a: 'Ein Zeichenzähler zählt jedes einzelne Zeichen einschließlich Buchstaben, Zahlen, Leerzeichen und Satzzeichen. Ein Wortzähler zählt Gruppen von Zeichen, die durch Leerzeichen getrennt sind. Dieses Tool bietet beides.' },
        { q: 'Zählen Leerzeichen als Zeichen?', a: 'Ja, Leerzeichen sind Zeichen. Deshalb zeigt das Tool sowohl „Zeichen Gesamt" als auch „Zeichen (ohne Leerzeichen)" an. Verschiedene Plattformen zählen Zeichen unterschiedlich.' },
        { q: 'Wie werden Sätze gezählt?', a: 'Sätze werden durch Erkennung von Satzende-Zeichen gezählt: Punkte (.), Ausrufezeichen (!) und Fragezeichen (?). Wenn Ihr Text keine Satzzeichen hat aber Inhalt enthält, wird er als ein Satz gezählt.' },
        { q: 'Was zählt als Sonderzeichen?', a: 'Sonderzeichen sind alle Zeichen, die keine Vokale, Konsonanten, Ziffern oder Leerzeichen sind. Dazu gehören Satzzeichen, Klammern, Bindestriche und Unicode-Symbole wie Emojis.' },
        { q: 'Wie wird der häufigste Buchstabe bestimmt?', a: 'Das Tool zählt das Vorkommen jedes Buchstabens (a-z, ohne Unterscheidung von Groß-/Kleinschreibung) und zeigt den mit der höchsten Anzahl an. Im Deutschen ist „E" typischerweise der häufigste Buchstabe.' },
      ],
    },
    pt: {
      title: 'Contador de Caracteres Online Grátis – Análise Detalhada de Texto',
      paragraphs: [
        'Saber a contagem exata de caracteres do seu texto é crucial em muitas situações: escrever tweets dentro do limite de 280 caracteres, criar meta descriptions com menos de 160 caracteres ou cumprir requisitos de redações. Nosso contador de caracteres gratuito vai muito além da simples contagem.',
        'Esta ferramenta analisa seu texto em tempo real e mostra caracteres totais, caracteres sem espaços, palavras, frases, vogais, consoantes, dígitos, caracteres especiais e até a letra mais frequente. Esse nível de detalhe é valioso para linguistas, estudantes e criadores de conteúdo.',
        'Para profissionais de SEO, a contagem de caracteres importa ao otimizar tags de título (recomendado menos de 60 caracteres), meta descriptions (menos de 160 caracteres) e URLs. Gerentes de redes sociais precisam para os limites de cada plataforma.',
        'A função de análise de frequência ajuda a identificar letras ou padrões sobreutilizados, útil para criptografia, pesquisa linguística ou melhorar a variedade da escrita. Toda a análise roda localmente no seu navegador.',
      ],
      faq: [
        { q: 'Qual a diferença entre um contador de caracteres e um contador de palavras?', a: 'Um contador de caracteres conta cada caractere individual incluindo letras, números, espaços e pontuação. Um contador de palavras conta grupos de caracteres separados por espaços. Esta ferramenta fornece ambos.' },
        { q: 'Espaços contam como caracteres?', a: 'Sim, espaços são caracteres. Por isso a ferramenta mostra tanto "Caracteres Totais" quanto "Caracteres (sem espaços)". Diferentes plataformas contam caracteres de formas diferentes.' },
        { q: 'Como as frases são contadas?', a: 'As frases são contadas detectando sinais de pontuação finais: pontos (.), pontos de exclamação (!) e pontos de interrogação (?). Se seu texto não tem pontuação mas contém conteúdo, é contado como uma frase.' },
        { q: 'O que conta como caractere especial?', a: 'Caracteres especiais são quaisquer caracteres que não sejam vogais, consoantes, dígitos ou espaços. Isso inclui sinais de pontuação, parênteses, hifens e símbolos Unicode como emojis.' },
        { q: 'Como a letra mais frequente é determinada?', a: 'A ferramenta conta as ocorrências de cada letra (a-z, sem distinção de maiúsculas) e mostra a que tem a contagem mais alta. Em português, a letra "A" é tipicamente a mais frequente.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="character-counter" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('inputText')}</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5}
              placeholder="Type or paste your text here..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ key, value }) => (
              <div key={key} className="p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-gray-500">{t(key)}</div>
                <div className="text-lg font-bold text-gray-900">{value}</div>
              </div>
            ))}
          </div>
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
