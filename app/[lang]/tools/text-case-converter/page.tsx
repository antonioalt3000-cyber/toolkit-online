'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  inputText: { en: 'Enter your text', it: 'Inserisci il testo', es: 'Ingresa tu texto', fr: 'Entrez votre texte', de: 'Text eingeben', pt: 'Digite seu texto' },
  uppercase: { en: 'UPPERCASE', it: 'MAIUSCOLO', es: 'MAYÚSCULAS', fr: 'MAJUSCULES', de: 'GROSSBUCHSTABEN', pt: 'MAIÚSCULAS' },
  lowercase: { en: 'lowercase', it: 'minuscolo', es: 'minúsculas', fr: 'minuscules', de: 'kleinbuchstaben', pt: 'minúsculas' },
  titleCase: { en: 'Title Case', it: 'Prima Maiuscola', es: 'Tipo Título', fr: 'Casse Titre', de: 'Titelform', pt: 'Primeira Maiúscula' },
  sentenceCase: { en: 'Sentence case', it: 'Frase normale', es: 'Tipo oración', fr: 'Casse phrase', de: 'Satzform', pt: 'Primeira frase' },
  camelCase: { en: 'camelCase', it: 'camelCase', es: 'camelCase', fr: 'camelCase', de: 'camelCase', pt: 'camelCase' },
  kebabCase: { en: 'kebab-case', it: 'kebab-case', es: 'kebab-case', fr: 'kebab-case', de: 'kebab-case', pt: 'kebab-case' },
  copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
};

function toTitleCase(s: string) {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}
function toSentenceCase(s: string) {
  return s.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
}
function toCamelCase(s: string) {
  return s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
}
function toKebabCase(s: string) {
  return s.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function TextCaseConverter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['text-case-converter'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [text, setText] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  const conversions = [
    { key: 'uppercase', fn: (s: string) => s.toUpperCase() },
    { key: 'lowercase', fn: (s: string) => s.toLowerCase() },
    { key: 'titleCase', fn: toTitleCase },
    { key: 'sentenceCase', fn: toSentenceCase },
    { key: 'camelCase', fn: toCamelCase },
    { key: 'kebabCase', fn: toKebabCase },
  ];

  const handleCopy = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Text Case Converter – Transform Text Instantly',
      paragraphs: [
        'Converting text between different cases is one of those small tasks that comes up constantly in writing, coding, and content creation. Our free text case converter handles six common transformations — UPPERCASE, lowercase, Title Case, Sentence case, camelCase, and kebab-case — all in real time as you type.',
        'Writers and editors frequently need Title Case for headlines or Sentence case for body text. Developers rely on camelCase for JavaScript variable names and kebab-case for CSS class names and URL slugs. Manually reformatting text is tedious and error-prone, especially with longer passages.',
        'This tool is particularly useful for reformatting text copied from PDFs, emails, or legacy systems that may be stuck in ALL CAPS. Instead of retyping everything, simply paste it here and pick the case you need. The one-click copy button makes it easy to transfer the result to any application.',
        'All transformations happen instantly in your browser. There is no server processing, no sign-up required, and no limit on how much text you can convert. Use it as often as you need, completely free.',
      ],
      faq: [
        { q: 'What is the difference between Title Case and Sentence case?', a: 'Title Case capitalizes the first letter of every word (e.g., "The Quick Brown Fox"), while Sentence case only capitalizes the first letter of each sentence (e.g., "The quick brown fox"). Title Case is typically used for headlines and titles.' },
        { q: 'What is camelCase used for?', a: 'camelCase is a naming convention commonly used in programming, especially in JavaScript. The first word is lowercase and each subsequent word starts with a capital letter with no spaces (e.g., "myVariableName"). It is also used in JSON keys and API naming conventions.' },
        { q: 'What is kebab-case and when should I use it?', a: 'kebab-case uses hyphens to separate lowercase words (e.g., "my-class-name"). It is the standard naming convention for CSS classes, URL slugs, and file names in many web projects.' },
        { q: 'Can I convert text that contains special characters?', a: 'Yes. The tool preserves special characters for UPPERCASE, lowercase, Title Case, and Sentence case. For camelCase and kebab-case, special characters are removed as these formats only use alphanumeric characters and hyphens.' },
        { q: 'Is there a character limit for the text converter?', a: 'There is no hard limit. The tool processes text entirely in your browser, so performance depends on your device. It comfortably handles texts of tens of thousands of characters without issues.' },
      ],
    },
    it: {
      title: 'Convertitore di Maiuscole/Minuscole Gratuito – Trasforma il Testo Istantaneamente',
      paragraphs: [
        'Convertire il testo tra diversi formati di maiuscole e minuscole è un\'operazione che si presenta costantemente nella scrittura, nella programmazione e nella creazione di contenuti. Il nostro convertitore gratuito gestisce sei trasformazioni comuni — MAIUSCOLO, minuscolo, Prima Maiuscola, Frase normale, camelCase e kebab-case — tutto in tempo reale.',
        'Scrittori e redattori hanno spesso bisogno della Prima Maiuscola per i titoli o della Frase normale per il corpo del testo. Gli sviluppatori si affidano al camelCase per i nomi delle variabili JavaScript e al kebab-case per le classi CSS e gli slug URL.',
        'Questo strumento è particolarmente utile per riformattare testo copiato da PDF, email o sistemi legacy che potrebbero essere bloccati in TUTTO MAIUSCOLO. Invece di riscrivere tutto, incollalo qui e scegli il formato che ti serve. Il pulsante di copia con un clic rende facile trasferire il risultato.',
        'Tutte le trasformazioni avvengono istantaneamente nel tuo browser. Non c\'è elaborazione su server, nessuna registrazione richiesta e nessun limite alla quantità di testo convertibile.',
      ],
      faq: [
        { q: 'Qual è la differenza tra Prima Maiuscola e Frase normale?', a: 'Prima Maiuscola mette in maiuscolo la prima lettera di ogni parola (es. "La Volpe Marrone"), mentre Frase normale mette in maiuscolo solo la prima lettera di ogni frase (es. "La volpe marrone"). Prima Maiuscola è tipicamente usata per titoli.' },
        { q: 'A cosa serve il camelCase?', a: 'Il camelCase è una convenzione di denominazione comunemente usata nella programmazione, specialmente in JavaScript. La prima parola è minuscola e ogni parola successiva inizia con maiuscola senza spazi (es. "nomeVariabile").' },
        { q: 'Cos\'è il kebab-case e quando dovrei usarlo?', a: 'Il kebab-case usa trattini per separare parole minuscole (es. "nome-classe"). È la convenzione standard per classi CSS, slug URL e nomi di file in molti progetti web.' },
        { q: 'Posso convertire testo con caratteri speciali?', a: 'Sì. Lo strumento preserva i caratteri speciali per MAIUSCOLO, minuscolo, Prima Maiuscola e Frase normale. Per camelCase e kebab-case, i caratteri speciali vengono rimossi.' },
        { q: 'C\'è un limite di caratteri per il convertitore?', a: 'Non c\'è un limite rigido. Lo strumento elabora il testo interamente nel browser, quindi le prestazioni dipendono dal tuo dispositivo. Gestisce comodamente testi di decine di migliaia di caratteri.' },
      ],
    },
    es: {
      title: 'Convertidor de Mayúsculas/Minúsculas Gratis – Transforma Texto al Instante',
      paragraphs: [
        'Convertir texto entre diferentes formatos de mayúsculas y minúsculas es una tarea que surge constantemente al escribir, programar y crear contenido. Nuestro convertidor gratuito maneja seis transformaciones comunes — MAYÚSCULAS, minúsculas, Tipo Título, Tipo Oración, camelCase y kebab-case — todo en tiempo real.',
        'Escritores y editores necesitan frecuentemente Tipo Título para encabezados o Tipo Oración para el cuerpo del texto. Los desarrolladores dependen del camelCase para nombres de variables en JavaScript y del kebab-case para clases CSS y slugs de URL.',
        'Esta herramienta es particularmente útil para reformatear texto copiado de PDFs, correos electrónicos o sistemas heredados que pueden estar en TODO MAYÚSCULAS. En lugar de reescribir todo, simplemente pégalo aquí y elige el formato que necesitas.',
        'Todas las transformaciones ocurren instantáneamente en tu navegador. No hay procesamiento en servidor, no se requiere registro y no hay límite en la cantidad de texto que puedes convertir.',
      ],
      faq: [
        { q: '¿Cuál es la diferencia entre Tipo Título y Tipo Oración?', a: 'Tipo Título pone en mayúscula la primera letra de cada palabra (ej. "El Zorro Marrón"), mientras que Tipo Oración solo pone en mayúscula la primera letra de cada oración (ej. "El zorro marrón").' },
        { q: '¿Para qué se usa el camelCase?', a: 'El camelCase es una convención de nomenclatura usada comúnmente en programación, especialmente en JavaScript. La primera palabra va en minúscula y cada palabra posterior empieza con mayúscula sin espacios (ej. "nombreVariable").' },
        { q: '¿Qué es kebab-case y cuándo debo usarlo?', a: 'El kebab-case usa guiones para separar palabras en minúsculas (ej. "nombre-clase"). Es la convención estándar para clases CSS, slugs de URL y nombres de archivos en proyectos web.' },
        { q: '¿Puedo convertir texto con caracteres especiales?', a: 'Sí. La herramienta preserva caracteres especiales para MAYÚSCULAS, minúsculas, Tipo Título y Tipo Oración. Para camelCase y kebab-case, los caracteres especiales se eliminan.' },
        { q: '¿Hay un límite de caracteres para el convertidor?', a: 'No hay un límite estricto. La herramienta procesa el texto completamente en tu navegador, así que el rendimiento depende de tu dispositivo.' },
      ],
    },
    fr: {
      title: 'Convertisseur de Casse Gratuit – Transformez votre Texte Instantanément',
      paragraphs: [
        'Convertir du texte entre différentes casses est une tâche qui revient constamment dans l\'écriture, la programmation et la création de contenu. Notre convertisseur gratuit gère six transformations courantes — MAJUSCULES, minuscules, Casse Titre, Casse phrase, camelCase et kebab-case — le tout en temps réel.',
        'Les rédacteurs et éditeurs ont fréquemment besoin de la Casse Titre pour les titres ou de la Casse phrase pour le corps du texte. Les développeurs utilisent le camelCase pour les noms de variables JavaScript et le kebab-case pour les classes CSS et les slugs d\'URL.',
        'Cet outil est particulièrement utile pour reformater du texte copié depuis des PDF, des emails ou des systèmes anciens qui peuvent être bloqués en TOUT MAJUSCULES. Au lieu de tout retaper, collez-le ici et choisissez la casse souhaitée.',
        'Toutes les transformations se font instantanément dans votre navigateur. Aucun traitement serveur, aucune inscription requise et aucune limite sur la quantité de texte convertible.',
      ],
      faq: [
        { q: 'Quelle est la différence entre Casse Titre et Casse phrase ?', a: 'La Casse Titre met en majuscule la première lettre de chaque mot (ex. « Le Renard Brun »), tandis que la Casse phrase ne met en majuscule que la première lettre de chaque phrase (ex. « Le renard brun »).' },
        { q: 'À quoi sert le camelCase ?', a: 'Le camelCase est une convention de nommage couramment utilisée en programmation, surtout en JavaScript. Le premier mot est en minuscule et chaque mot suivant commence par une majuscule sans espace (ex. « nomDeVariable »).' },
        { q: 'Qu\'est-ce que le kebab-case et quand l\'utiliser ?', a: 'Le kebab-case utilise des tirets pour séparer des mots en minuscules (ex. « nom-de-classe »). C\'est la convention standard pour les classes CSS, les slugs d\'URL et les noms de fichiers.' },
        { q: 'Puis-je convertir du texte contenant des caractères spéciaux ?', a: 'Oui. L\'outil préserve les caractères spéciaux pour MAJUSCULES, minuscules, Casse Titre et Casse phrase. Pour camelCase et kebab-case, les caractères spéciaux sont supprimés.' },
        { q: 'Y a-t-il une limite de caractères ?', a: 'Il n\'y a pas de limite stricte. L\'outil traite le texte entièrement dans votre navigateur, donc les performances dépendent de votre appareil.' },
      ],
    },
    de: {
      title: 'Kostenloser Text-Konverter für Groß-/Kleinschreibung – Text Sofort Umwandeln',
      paragraphs: [
        'Die Umwandlung von Text zwischen verschiedenen Schreibweisen ist eine Aufgabe, die beim Schreiben, Programmieren und Erstellen von Inhalten ständig vorkommt. Unser kostenloser Konverter verarbeitet sechs gängige Umwandlungen — GROSSBUCHSTABEN, kleinbuchstaben, Titelform, Satzform, camelCase und kebab-case — alles in Echtzeit.',
        'Autoren und Redakteure benötigen häufig die Titelform für Überschriften oder die Satzform für Fließtext. Entwickler verlassen sich auf camelCase für JavaScript-Variablennamen und kebab-case für CSS-Klassen und URL-Slugs.',
        'Dieses Tool ist besonders nützlich zum Umformatieren von Text aus PDFs, E-Mails oder Altsystemen, die möglicherweise in GROSSBUCHSTABEN feststecken. Anstatt alles neu einzutippen, fügen Sie es hier ein und wählen Sie das gewünschte Format.',
        'Alle Umwandlungen erfolgen sofort in Ihrem Browser. Keine Serververarbeitung, keine Registrierung erforderlich und kein Limit für die Textmenge.',
      ],
      faq: [
        { q: 'Was ist der Unterschied zwischen Titelform und Satzform?', a: 'Titelform schreibt den ersten Buchstaben jedes Wortes groß (z.B. „Der Schnelle Braune Fuchs"), während Satzform nur den ersten Buchstaben jedes Satzes großschreibt (z.B. „Der schnelle braune Fuchs").' },
        { q: 'Wofür wird camelCase verwendet?', a: 'camelCase ist eine Namenskonvention, die häufig in der Programmierung verwendet wird, insbesondere in JavaScript. Das erste Wort ist klein und jedes folgende Wort beginnt mit einem Großbuchstaben ohne Leerzeichen (z.B. „meinVariablenName").' },
        { q: 'Was ist kebab-case und wann sollte ich es verwenden?', a: 'kebab-case verwendet Bindestriche zum Trennen von Kleinbuchstaben-Wörtern (z.B. „mein-klassen-name"). Es ist die Standardkonvention für CSS-Klassen, URL-Slugs und Dateinamen.' },
        { q: 'Kann ich Text mit Sonderzeichen konvertieren?', a: 'Ja. Das Tool behält Sonderzeichen für GROSSBUCHSTABEN, kleinbuchstaben, Titelform und Satzform bei. Bei camelCase und kebab-case werden Sonderzeichen entfernt.' },
        { q: 'Gibt es ein Zeichenlimit?', a: 'Es gibt kein festes Limit. Das Tool verarbeitet Text vollständig im Browser, daher hängt die Leistung von Ihrem Gerät ab.' },
      ],
    },
    pt: {
      title: 'Conversor de Maiúsculas/Minúsculas Grátis – Transforme Texto Instantaneamente',
      paragraphs: [
        'Converter texto entre diferentes formatos de maiúsculas e minúsculas é uma tarefa que surge constantemente na escrita, programação e criação de conteúdo. Nosso conversor gratuito lida com seis transformações comuns — MAIÚSCULAS, minúsculas, Primeira Maiúscula, Primeira frase, camelCase e kebab-case — tudo em tempo real.',
        'Escritores e editores frequentemente precisam de Primeira Maiúscula para títulos ou Primeira frase para o corpo do texto. Desenvolvedores dependem do camelCase para nomes de variáveis em JavaScript e do kebab-case para classes CSS e slugs de URL.',
        'Esta ferramenta é particularmente útil para reformatar texto copiado de PDFs, e-mails ou sistemas legados que podem estar em TUDO MAIÚSCULAS. Em vez de redigitar tudo, simplesmente cole aqui e escolha o formato desejado.',
        'Todas as transformações acontecem instantaneamente no seu navegador. Sem processamento em servidor, sem cadastro necessário e sem limite na quantidade de texto que pode converter.',
      ],
      faq: [
        { q: 'Qual a diferença entre Primeira Maiúscula e Primeira frase?', a: 'Primeira Maiúscula coloca em maiúscula a primeira letra de cada palavra (ex. "A Raposa Marrom"), enquanto Primeira frase só coloca em maiúscula a primeira letra de cada frase (ex. "A raposa marrom").' },
        { q: 'Para que serve o camelCase?', a: 'O camelCase é uma convenção de nomenclatura comumente usada em programação, especialmente em JavaScript. A primeira palavra é minúscula e cada palavra posterior começa com maiúscula sem espaços (ex. "nomeVariavel").' },
        { q: 'O que é kebab-case e quando devo usá-lo?', a: 'O kebab-case usa hifens para separar palavras em minúsculas (ex. "nome-classe"). É a convenção padrão para classes CSS, slugs de URL e nomes de arquivos.' },
        { q: 'Posso converter texto com caracteres especiais?', a: 'Sim. A ferramenta preserva caracteres especiais para MAIÚSCULAS, minúsculas, Primeira Maiúscula e Primeira frase. Para camelCase e kebab-case, os caracteres especiais são removidos.' },
        { q: 'Há um limite de caracteres?', a: 'Não há limite rígido. A ferramenta processa o texto inteiramente no navegador, então o desempenho depende do seu dispositivo.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="text-case-converter">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('inputText')}</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4}
              placeholder="The Quick Brown Fox Jumps Over The Lazy Dog"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
          </div>

          {text && (
            <div className="space-y-3">
              {conversions.map(({ key, fn }) => {
                const result = fn(text);
                return (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-600">{t(key)}</span>
                      <button onClick={() => handleCopy(key, result)}
                        className={`text-xs px-2 py-1 rounded ${copiedKey === key ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                        {copiedKey === key ? t('copied') : t('copy')}
                      </button>
                    </div>
                    <div className="text-gray-900 text-sm font-mono break-all">{result}</div>
                  </div>
                );
              })}
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
