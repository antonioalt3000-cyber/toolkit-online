'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function WordCounter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['word-counter'][lang];
  const [text, setText] = useState('');

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const sentences = text.trim() ? text.split(/[.!?]+/).filter((s) => s.trim()).length : 0;
  const paragraphs = text.trim() ? text.split(/\n\n+/).filter((s) => s.trim()).length : 0;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  const labels: Record<string, Record<Locale, string>> = {
    words: { en: 'Words', it: 'Parole', es: 'Palabras', fr: 'Mots', de: 'Wörter', pt: 'Palavras' },
    chars: { en: 'Characters', it: 'Caratteri', es: 'Caracteres', fr: 'Caractères', de: 'Zeichen', pt: 'Caracteres' },
    charsNs: { en: 'No spaces', it: 'Senza spazi', es: 'Sin espacios', fr: 'Sans espaces', de: 'Ohne Leerzeichen', pt: 'Sem espaços' },
    sentences: { en: 'Sentences', it: 'Frasi', es: 'Oraciones', fr: 'Phrases', de: 'Sätze', pt: 'Frases' },
    paragraphs: { en: 'Paragraphs', it: 'Paragrafi', es: 'Párrafos', fr: 'Paragraphes', de: 'Absätze', pt: 'Parágrafos' },
    reading: { en: 'min read', it: 'min lettura', es: 'min lectura', fr: 'min lecture', de: 'Min. Lesezeit', pt: 'min leitura' },
    placeholder: { en: 'Type or paste your text here...', it: 'Scrivi o incolla il tuo testo qui...', es: 'Escribe o pega tu texto aquí...', fr: 'Tapez ou collez votre texte ici...', de: 'Geben Sie Ihren Text hier ein...', pt: 'Digite ou cole seu texto aqui...' },
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Online Word Counter Tool – Count Words, Characters & More',
      paragraphs: [
        'Whether you are a student finishing an essay, a blogger crafting a post, or a copywriter meeting a strict brief, knowing the exact word count of your text is essential. Our free online word counter gives you instant, accurate statistics the moment you type or paste your content.',
        'Beyond simple word counting, this tool breaks your text down into characters (with and without spaces), sentences, paragraphs, and estimated reading time. These metrics matter for SEO, social-media copy limits, academic assignments, and professional writing where precision is non-negotiable.',
        'Search engines like Google look at content length as one of many ranking factors. Articles between 1,500 and 2,500 words tend to rank higher for competitive keywords. Use this word counter to ensure your articles meet the optimal length before publishing.',
        'The reading-time estimate is based on the average adult reading speed of 200 words per minute. This is the same formula used by platforms like Medium to display estimated read times, helping readers decide whether to commit to an article.',
      ],
      faq: [
        { q: 'How does the word counter calculate words?', a: 'The tool splits your text by whitespace characters (spaces, tabs, newlines) and counts each resulting segment. This is the same method used by most word processors like Microsoft Word and Google Docs.' },
        { q: 'Does the word counter work with languages other than English?', a: 'Yes. The counter works with any language that separates words with spaces, including Spanish, French, German, Italian, and Portuguese. For languages like Chinese or Japanese that do not use spaces between words, the count reflects space-separated segments.' },
        { q: 'How is reading time estimated?', a: 'Reading time is calculated by dividing the total word count by 200 (the average adult reading speed in words per minute). The result is rounded up to the nearest minute, with a minimum of 1 minute.' },
        { q: 'Can I use this tool to check character limits for social media?', a: 'Absolutely. Twitter/X has a 280-character limit, Instagram captions allow 2,200 characters, and LinkedIn posts cap at 3,000 characters. Use the character count (with or without spaces) to stay within these limits.' },
        { q: 'Is my text stored or sent to a server?', a: 'No. All processing happens entirely in your browser using JavaScript. Your text never leaves your device, ensuring complete privacy.' },
      ],
    },
    it: {
      title: 'Contatore di Parole Online Gratuito – Conta Parole, Caratteri e Altro',
      paragraphs: [
        'Che tu sia uno studente che sta completando un saggio, un blogger che scrive un articolo o un copywriter con limiti precisi, conoscere il conteggio esatto delle parole è fondamentale. Il nostro contatore di parole online gratuito ti fornisce statistiche istantanee e precise nel momento in cui digiti o incolli il testo.',
        'Oltre al semplice conteggio delle parole, questo strumento analizza il testo in caratteri (con e senza spazi), frasi, paragrafi e tempo di lettura stimato. Queste metriche sono importanti per la SEO, i limiti dei social media, i compiti accademici e la scrittura professionale.',
        'I motori di ricerca come Google considerano la lunghezza del contenuto come uno dei fattori di ranking. Gli articoli tra 1.500 e 2.500 parole tendono a posizionarsi meglio per le keyword competitive. Usa questo contatore per assicurarti che i tuoi articoli raggiungano la lunghezza ottimale.',
        'La stima del tempo di lettura si basa sulla velocità media di lettura di un adulto di 200 parole al minuto. È la stessa formula usata da piattaforme come Medium per mostrare i tempi di lettura stimati.',
      ],
      faq: [
        { q: 'Come calcola le parole il contatore?', a: 'Lo strumento divide il testo per spazi bianchi (spazi, tabulazioni, a capo) e conta ogni segmento risultante. È lo stesso metodo usato dalla maggior parte dei word processor come Microsoft Word e Google Docs.' },
        { q: 'Il contatore funziona con lingue diverse dall\'italiano?', a: 'Sì. Il contatore funziona con qualsiasi lingua che separa le parole con spazi, incluso inglese, spagnolo, francese, tedesco e portoghese.' },
        { q: 'Come viene stimato il tempo di lettura?', a: 'Il tempo di lettura viene calcolato dividendo il numero totale di parole per 200 (la velocità media di lettura di un adulto in parole al minuto). Il risultato viene arrotondato per eccesso, con un minimo di 1 minuto.' },
        { q: 'Posso usare questo strumento per controllare i limiti di caratteri dei social media?', a: 'Certamente. Twitter/X ha un limite di 280 caratteri, le didascalie di Instagram consentono 2.200 caratteri e i post di LinkedIn arrivano a 3.000 caratteri.' },
        { q: 'Il mio testo viene salvato o inviato a un server?', a: 'No. Tutta l\'elaborazione avviene interamente nel tuo browser tramite JavaScript. Il tuo testo non lascia mai il tuo dispositivo, garantendo completa privacy.' },
      ],
    },
    es: {
      title: 'Contador de Palabras Online Gratis – Cuenta Palabras, Caracteres y Más',
      paragraphs: [
        'Ya seas un estudiante terminando un ensayo, un blogger redactando una publicación o un redactor cumpliendo con un límite estricto, conocer el conteo exacto de palabras de tu texto es esencial. Nuestro contador de palabras online gratuito te da estadísticas instantáneas y precisas al momento de escribir o pegar tu contenido.',
        'Más allá del simple conteo de palabras, esta herramienta desglosa tu texto en caracteres (con y sin espacios), oraciones, párrafos y tiempo de lectura estimado. Estas métricas importan para el SEO, los límites de redes sociales, las tareas académicas y la escritura profesional.',
        'Los motores de búsqueda como Google consideran la longitud del contenido como uno de los factores de posicionamiento. Los artículos entre 1.500 y 2.500 palabras tienden a posicionarse mejor para palabras clave competitivas. Usa este contador para asegurar que tus artículos alcancen la longitud óptima.',
        'La estimación del tiempo de lectura se basa en la velocidad promedio de lectura de un adulto de 200 palabras por minuto. Es la misma fórmula que usan plataformas como Medium para mostrar tiempos de lectura estimados.',
      ],
      faq: [
        { q: '¿Cómo calcula las palabras el contador?', a: 'La herramienta divide tu texto por espacios en blanco (espacios, tabulaciones, saltos de línea) y cuenta cada segmento resultante. Es el mismo método que usan la mayoría de procesadores de texto como Microsoft Word y Google Docs.' },
        { q: '¿El contador funciona con idiomas además del español?', a: 'Sí. El contador funciona con cualquier idioma que separe palabras con espacios, incluyendo inglés, francés, alemán, italiano y portugués.' },
        { q: '¿Cómo se estima el tiempo de lectura?', a: 'El tiempo de lectura se calcula dividiendo el total de palabras entre 200 (la velocidad promedio de lectura de un adulto en palabras por minuto). El resultado se redondea hacia arriba, con un mínimo de 1 minuto.' },
        { q: '¿Puedo usar esta herramienta para verificar límites de caracteres en redes sociales?', a: 'Por supuesto. Twitter/X tiene un límite de 280 caracteres, las descripciones de Instagram permiten 2.200 caracteres y las publicaciones de LinkedIn tienen un máximo de 3.000 caracteres.' },
        { q: '¿Mi texto se almacena o se envía a un servidor?', a: 'No. Todo el procesamiento ocurre completamente en tu navegador usando JavaScript. Tu texto nunca sale de tu dispositivo, garantizando privacidad total.' },
      ],
    },
    fr: {
      title: 'Compteur de Mots en Ligne Gratuit – Comptez Mots, Caractères et Plus',
      paragraphs: [
        'Que vous soyez un étudiant terminant une dissertation, un blogueur rédigeant un article ou un rédacteur respectant un cahier des charges strict, connaître le nombre exact de mots de votre texte est essentiel. Notre compteur de mots en ligne gratuit vous donne des statistiques instantanées et précises dès que vous tapez ou collez votre contenu.',
        'Au-delà du simple comptage de mots, cet outil décompose votre texte en caractères (avec et sans espaces), phrases, paragraphes et temps de lecture estimé. Ces métriques sont importantes pour le SEO, les limites des réseaux sociaux, les devoirs académiques et la rédaction professionnelle.',
        'Les moteurs de recherche comme Google considèrent la longueur du contenu comme l\'un des facteurs de classement. Les articles entre 1 500 et 2 500 mots ont tendance à mieux se classer pour les mots-clés compétitifs. Utilisez ce compteur pour vous assurer que vos articles atteignent la longueur optimale.',
        'L\'estimation du temps de lecture est basée sur la vitesse moyenne de lecture d\'un adulte de 200 mots par minute. C\'est la même formule utilisée par des plateformes comme Medium pour afficher les temps de lecture estimés.',
      ],
      faq: [
        { q: 'Comment le compteur calcule-t-il les mots ?', a: 'L\'outil divise votre texte par les espaces blancs (espaces, tabulations, retours à la ligne) et compte chaque segment résultant. C\'est la même méthode utilisée par la plupart des traitements de texte comme Microsoft Word et Google Docs.' },
        { q: 'Le compteur fonctionne-t-il avec d\'autres langues que le français ?', a: 'Oui. Le compteur fonctionne avec toute langue qui sépare les mots par des espaces, y compris l\'anglais, l\'espagnol, l\'allemand, l\'italien et le portugais.' },
        { q: 'Comment le temps de lecture est-il estimé ?', a: 'Le temps de lecture est calculé en divisant le nombre total de mots par 200 (la vitesse moyenne de lecture d\'un adulte en mots par minute). Le résultat est arrondi au-dessus, avec un minimum d\'1 minute.' },
        { q: 'Puis-je utiliser cet outil pour vérifier les limites de caractères des réseaux sociaux ?', a: 'Absolument. Twitter/X a une limite de 280 caractères, les légendes Instagram autorisent 2 200 caractères et les publications LinkedIn plafonnent à 3 000 caractères.' },
        { q: 'Mon texte est-il stocké ou envoyé à un serveur ?', a: 'Non. Tout le traitement se fait entièrement dans votre navigateur via JavaScript. Votre texte ne quitte jamais votre appareil, garantissant une confidentialité totale.' },
      ],
    },
    de: {
      title: 'Kostenloser Online-Wortzähler – Wörter, Zeichen und Mehr Zählen',
      paragraphs: [
        'Ob Sie ein Student sind, der einen Aufsatz fertigstellt, ein Blogger, der einen Beitrag verfasst, oder ein Texter, der strenge Vorgaben einhalten muss – die genaue Wortzahl Ihres Textes zu kennen ist unerlässlich. Unser kostenloser Online-Wortzähler liefert Ihnen sofort präzise Statistiken, sobald Sie Ihren Text eingeben oder einfügen.',
        'Über die einfache Wortzählung hinaus zerlegt dieses Tool Ihren Text in Zeichen (mit und ohne Leerzeichen), Sätze, Absätze und geschätzte Lesezeit. Diese Metriken sind wichtig für SEO, Social-Media-Zeichenlimits, akademische Arbeiten und professionelles Schreiben.',
        'Suchmaschinen wie Google betrachten die Inhaltslänge als einen von vielen Ranking-Faktoren. Artikel zwischen 1.500 und 2.500 Wörtern ranken tendenziell besser für wettbewerbsintensive Keywords. Nutzen Sie diesen Wortzähler, um sicherzustellen, dass Ihre Artikel die optimale Länge erreichen.',
        'Die Lesezeit-Schätzung basiert auf der durchschnittlichen Lesegeschwindigkeit eines Erwachsenen von 200 Wörtern pro Minute. Dies ist dieselbe Formel, die Plattformen wie Medium verwenden, um geschätzte Lesezeiten anzuzeigen.',
      ],
      faq: [
        { q: 'Wie zählt der Wortzähler die Wörter?', a: 'Das Tool teilt Ihren Text an Leerzeichen (Spaces, Tabs, Zeilenumbrüche) und zählt jedes resultierende Segment. Dies ist dieselbe Methode, die von den meisten Textverarbeitungsprogrammen wie Microsoft Word und Google Docs verwendet wird.' },
        { q: 'Funktioniert der Wortzähler auch mit anderen Sprachen als Deutsch?', a: 'Ja. Der Zähler funktioniert mit jeder Sprache, die Wörter durch Leerzeichen trennt, einschließlich Englisch, Spanisch, Französisch, Italienisch und Portugiesisch.' },
        { q: 'Wie wird die Lesezeit geschätzt?', a: 'Die Lesezeit wird berechnet, indem die Gesamtwortzahl durch 200 (die durchschnittliche Lesegeschwindigkeit eines Erwachsenen in Wörtern pro Minute) geteilt wird. Das Ergebnis wird aufgerundet, mit einem Minimum von 1 Minute.' },
        { q: 'Kann ich dieses Tool nutzen, um Zeichenlimits für Social Media zu prüfen?', a: 'Auf jeden Fall. Twitter/X hat ein Limit von 280 Zeichen, Instagram-Beschriftungen erlauben 2.200 Zeichen und LinkedIn-Beiträge haben ein Maximum von 3.000 Zeichen.' },
        { q: 'Wird mein Text gespeichert oder an einen Server gesendet?', a: 'Nein. Die gesamte Verarbeitung erfolgt vollständig in Ihrem Browser mittels JavaScript. Ihr Text verlässt niemals Ihr Gerät, was vollständige Privatsphäre gewährleistet.' },
      ],
    },
    pt: {
      title: 'Contador de Palavras Online Grátis – Conte Palavras, Caracteres e Mais',
      paragraphs: [
        'Seja você um estudante finalizando uma redação, um blogueiro escrevendo um post ou um redator cumprindo um briefing rigoroso, saber a contagem exata de palavras do seu texto é essencial. Nosso contador de palavras online gratuito fornece estatísticas instantâneas e precisas no momento em que você digita ou cola seu conteúdo.',
        'Além da simples contagem de palavras, esta ferramenta decompõe seu texto em caracteres (com e sem espaços), frases, parágrafos e tempo de leitura estimado. Essas métricas são importantes para SEO, limites de redes sociais, trabalhos acadêmicos e redação profissional.',
        'Mecanismos de busca como o Google consideram o comprimento do conteúdo como um dos fatores de ranqueamento. Artigos entre 1.500 e 2.500 palavras tendem a se posicionar melhor para palavras-chave competitivas. Use este contador para garantir que seus artigos atinjam o comprimento ideal.',
        'A estimativa de tempo de leitura é baseada na velocidade média de leitura de um adulto de 200 palavras por minuto. É a mesma fórmula usada por plataformas como o Medium para exibir tempos de leitura estimados.',
      ],
      faq: [
        { q: 'Como o contador calcula as palavras?', a: 'A ferramenta divide seu texto por espaços em branco (espaços, tabulações, quebras de linha) e conta cada segmento resultante. É o mesmo método usado pela maioria dos processadores de texto como Microsoft Word e Google Docs.' },
        { q: 'O contador funciona com outros idiomas além do português?', a: 'Sim. O contador funciona com qualquer idioma que separe palavras com espaços, incluindo inglês, espanhol, francês, alemão e italiano.' },
        { q: 'Como o tempo de leitura é estimado?', a: 'O tempo de leitura é calculado dividindo o total de palavras por 200 (a velocidade média de leitura de um adulto em palavras por minuto). O resultado é arredondado para cima, com um mínimo de 1 minuto.' },
        { q: 'Posso usar esta ferramenta para verificar limites de caracteres em redes sociais?', a: 'Com certeza. O Twitter/X tem um limite de 280 caracteres, as legendas do Instagram permitem 2.200 caracteres e as publicações do LinkedIn têm um máximo de 3.000 caracteres.' },
        { q: 'Meu texto é armazenado ou enviado para um servidor?', a: 'Não. Todo o processamento acontece inteiramente no seu navegador usando JavaScript. Seu texto nunca sai do seu dispositivo, garantindo privacidade total.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="word-counter" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
          {[
            { label: labels.words[lang], value: words },
            { label: labels.chars[lang], value: chars },
            { label: labels.charsNs[lang], value: charsNoSpaces },
            { label: labels.sentences[lang], value: sentences },
            { label: labels.paragraphs[lang], value: paragraphs },
            { label: labels.reading[lang], value: readingTime },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={labels.placeholder[lang]}
          className="w-full h-64 border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
        />

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
