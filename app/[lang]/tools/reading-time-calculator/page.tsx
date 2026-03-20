'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function ReadingTimeCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['reading-time-calculator'][lang];

  const [text, setText] = useState('');
  const [wpm, setWpm] = useState(238);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;
  const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0;
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
  const minutes = words / wpm;
  const readingMinutes = Math.floor(minutes);
  const readingSeconds = Math.round((minutes - readingMinutes) * 60);
  const speakingMinutes = Math.floor(words / 150);
  const speakingSeconds = Math.round(((words / 150) - speakingMinutes) * 60);

  const labels = {
    pasteText: { en: 'Paste your text here...', it: 'Incolla il tuo testo qui...', es: 'Pega tu texto aqu\u00ed...', fr: 'Collez votre texte ici...', de: 'F\u00fcgen Sie Ihren Text hier ein...', pt: 'Cole seu texto aqui...' },
    readingSpeed: { en: 'Reading Speed (WPM)', it: 'Velocit\u00e0 Lettura (PPM)', es: 'Velocidad de Lectura (PPM)', fr: 'Vitesse de Lecture (MPM)', de: 'Lesegeschwindigkeit (WPM)', pt: 'Velocidade de Leitura (PPM)' },
    readingTime: { en: 'Reading Time', it: 'Tempo di Lettura', es: 'Tiempo de Lectura', fr: 'Temps de Lecture', de: 'Lesezeit', pt: 'Tempo de Leitura' },
    speakingTime: { en: 'Speaking Time', it: 'Tempo di Lettura ad Alta Voce', es: 'Tiempo de Habla', fr: 'Temps de Parole', de: 'Sprechzeit', pt: 'Tempo de Fala' },
    words: { en: 'Words', it: 'Parole', es: 'Palabras', fr: 'Mots', de: 'W\u00f6rter', pt: 'Palavras' },
    characters: { en: 'Characters', it: 'Caratteri', es: 'Caracteres', fr: 'Caract\u00e8res', de: 'Zeichen', pt: 'Caracteres' },
    sentences: { en: 'Sentences', it: 'Frasi', es: 'Oraciones', fr: 'Phrases', de: 'S\u00e4tze', pt: 'Frases' },
    paragraphs: { en: 'Paragraphs', it: 'Paragrafi', es: 'P\u00e1rrafos', fr: 'Paragraphes', de: 'Abs\u00e4tze', pt: 'Par\u00e1grafos' },
    min: { en: 'min', it: 'min', es: 'min', fr: 'min', de: 'Min', pt: 'min' },
    sec: { en: 'sec', it: 'sec', es: 'seg', fr: 'sec', de: 'Sek', pt: 'seg' },
    stats: { en: 'Text Statistics', it: 'Statistiche Testo', es: 'Estad\u00edsticas del Texto', fr: 'Statistiques du Texte', de: 'Textstatistiken', pt: 'Estat\u00edsticas do Texto' },
  } as Record<string, Record<Locale, string>>;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Reading Time Calculator \u2014 Estimate How Long It Takes to Read Any Text',
      paragraphs: [
        'The Reading Time Calculator helps you estimate how long it takes to read any piece of text. Whether you\'re a blogger checking article length, a student planning study sessions, or a content creator optimizing for engagement, knowing the reading time is essential.',
        'The average adult reads at approximately 238 words per minute (WPM) for non-fiction and up to 260 WPM for fiction. Our calculator uses 238 WPM as the default but lets you customize the speed based on your reading ability or target audience.',
        'Simply paste your text into the calculator and instantly see the estimated reading time, speaking time, word count, character count, sentence count, and paragraph count. The speaking time estimate uses 150 WPM, which is the average speaking pace for presentations.',
        'This tool is perfect for Medium articles, blog posts, presentations, academic papers, and any content where you want to give readers a time estimate before they start reading.',
      ],
      faq: [
        { q: 'What is the average reading speed?', a: 'The average adult reads at about 238 words per minute (WPM). However, this varies by content type: fiction is typically read faster (250-300 WPM) while technical material is slower (150-200 WPM).' },
        { q: 'How is speaking time different from reading time?', a: 'Speaking time is calculated at approximately 150 words per minute, which is the comfortable pace for presentations and speeches. Reading time uses 238 WPM, the average silent reading speed.' },
        { q: 'Can I customize the reading speed?', a: 'Yes! You can adjust the words per minute (WPM) slider to match your reading speed or your target audience. Slower readers might use 150-200 WPM while speed readers can go up to 400+ WPM.' },
        { q: 'Why do blogs show reading time estimates?', a: 'Reading time estimates help readers decide whether to start an article. Studies show that displaying reading time increases engagement and reduces bounce rates, as readers can plan their time.' },
      ],
    },
    it: {
      title: 'Calcolatore Tempo di Lettura Gratuito \u2014 Stima Quanto Tempo Serve per Leggere un Testo',
      paragraphs: [
        'Il Calcolatore del Tempo di Lettura ti aiuta a stimare quanto tempo serve per leggere qualsiasi testo. Che tu sia un blogger, uno studente o un creatore di contenuti, conoscere il tempo di lettura \u00e8 essenziale.',
        'Un adulto medio legge circa 238 parole al minuto (PPM). Il nostro calcolatore usa questo valore come predefinito ma ti permette di personalizzare la velocit\u00e0 in base alle tue capacit\u00e0.',
        'Incolla semplicemente il tuo testo nel calcolatore e vedrai istantaneamente il tempo di lettura stimato, il tempo di lettura ad alta voce, il conteggio parole, caratteri, frasi e paragrafi.',
        'Questo strumento \u00e8 perfetto per articoli di blog, presentazioni, documenti accademici e qualsiasi contenuto dove vuoi dare ai lettori una stima del tempo.',
      ],
      faq: [
        { q: 'Qual \u00e8 la velocit\u00e0 di lettura media?', a: 'Un adulto medio legge circa 238 parole al minuto. Questo varia per tipo di contenuto: la narrativa viene letta pi\u00f9 velocemente (250-300 PPM) mentre il materiale tecnico pi\u00f9 lentamente (150-200 PPM).' },
        { q: 'Come differisce il tempo di lettura dal tempo di parlato?', a: 'Il tempo di parlato \u00e8 calcolato a circa 150 parole al minuto, il ritmo confortevole per presentazioni. Il tempo di lettura usa 238 PPM, la velocit\u00e0 media di lettura silenziosa.' },
        { q: 'Posso personalizzare la velocit\u00e0 di lettura?', a: 'S\u00ec! Puoi regolare il cursore delle parole al minuto per adattarlo alla tua velocit\u00e0 di lettura o al tuo pubblico target.' },
        { q: 'Perch\u00e9 i blog mostrano il tempo di lettura?', a: 'Le stime del tempo di lettura aiutano i lettori a decidere se iniziare un articolo. Gli studi dimostrano che mostrare il tempo di lettura aumenta il coinvolgimento.' },
      ],
    },
    es: {
      title: 'Calculadora de Tiempo de Lectura Gratis \u2014 Estima Cu\u00e1nto Toma Leer un Texto',
      paragraphs: [
        'La Calculadora de Tiempo de Lectura te ayuda a estimar cu\u00e1nto tiempo toma leer cualquier texto. Ya seas blogger, estudiante o creador de contenido, conocer el tiempo de lectura es esencial.',
        'Un adulto promedio lee aproximadamente 238 palabras por minuto. Nuestra calculadora usa este valor pero te permite personalizar la velocidad.',
        'Simplemente pega tu texto y ver\u00e1s instant\u00e1neamente el tiempo de lectura, tiempo de habla, conteo de palabras, caracteres, oraciones y p\u00e1rrafos.',
        'Esta herramienta es perfecta para art\u00edculos de blog, presentaciones y cualquier contenido donde quieras dar una estimaci\u00f3n de tiempo a los lectores.',
      ],
      faq: [
        { q: '\u00bfCu\u00e1l es la velocidad promedio de lectura?', a: 'Un adulto promedio lee unas 238 palabras por minuto. Esto var\u00eda por tipo de contenido.' },
        { q: '\u00bfC\u00f3mo difiere el tiempo de habla del de lectura?', a: 'El tiempo de habla se calcula a unas 150 palabras por minuto, el ritmo c\u00f3modo para presentaciones.' },
        { q: '\u00bfPuedo personalizar la velocidad?', a: '\u00a1S\u00ed! Puedes ajustar el deslizador de palabras por minuto seg\u00fan tu velocidad o audiencia.' },
        { q: '\u00bfPor qu\u00e9 los blogs muestran tiempo de lectura?', a: 'Las estimaciones ayudan a los lectores a decidir si comenzar un art\u00edculo, aumentando el engagement.' },
      ],
    },
    fr: {
      title: 'Calculateur de Temps de Lecture Gratuit \u2014 Estimez la Dur\u00e9e de Lecture',
      paragraphs: [
        'Le Calculateur de Temps de Lecture vous aide \u00e0 estimer combien de temps il faut pour lire un texte. Que vous soyez blogueur, \u00e9tudiant ou cr\u00e9ateur de contenu, conna\u00eetre le temps de lecture est essentiel.',
        'Un adulte moyen lit environ 238 mots par minute. Notre calculateur utilise cette valeur par d\u00e9faut mais vous permet de personnaliser la vitesse.',
        'Collez simplement votre texte et voyez instantan\u00e9ment le temps de lecture, le temps de parole, le nombre de mots, caract\u00e8res, phrases et paragraphes.',
        'Cet outil est parfait pour les articles de blog, les pr\u00e9sentations et tout contenu o\u00f9 vous voulez donner une estimation de temps.',
      ],
      faq: [
        { q: 'Quelle est la vitesse de lecture moyenne ?', a: 'Un adulte moyen lit environ 238 mots par minute. Cela varie selon le type de contenu.' },
        { q: 'Comment le temps de parole diff\u00e8re-t-il ?', a: 'Le temps de parole est calcul\u00e9 \u00e0 environ 150 mots par minute, le rythme confortable pour les pr\u00e9sentations.' },
        { q: 'Puis-je personnaliser la vitesse ?', a: 'Oui ! Vous pouvez ajuster le curseur de mots par minute selon votre vitesse ou audience cible.' },
        { q: 'Pourquoi les blogs affichent-ils le temps de lecture ?', a: 'Les estimations aident les lecteurs \u00e0 d\u00e9cider de commencer un article, augmentant l\'engagement.' },
      ],
    },
    de: {
      title: 'Kostenloser Lesezeit-Rechner \u2014 Sch\u00e4tzen Sie die Lesedauer',
      paragraphs: [
        'Der Lesezeit-Rechner hilft Ihnen abzusch\u00e4tzen, wie lange es dauert, einen Text zu lesen. Ob Blogger, Student oder Content Creator \u2014 die Lesezeit zu kennen ist wichtig.',
        'Ein durchschnittlicher Erwachsener liest etwa 238 W\u00f6rter pro Minute. Unser Rechner verwendet diesen Wert, l\u00e4sst Sie aber die Geschwindigkeit anpassen.',
        'F\u00fcgen Sie einfach Ihren Text ein und sehen Sie sofort Lesezeit, Sprechzeit, Wort-, Zeichen-, Satz- und Absatzzahl.',
        'Dieses Tool ist perfekt f\u00fcr Blogartikel, Pr\u00e4sentationen und alle Inhalte, bei denen Sie eine Zeitsch\u00e4tzung geben m\u00f6chten.',
      ],
      faq: [
        { q: 'Was ist die durchschnittliche Lesegeschwindigkeit?', a: 'Ein durchschnittlicher Erwachsener liest etwa 238 W\u00f6rter pro Minute. Dies variiert je nach Inhaltstyp.' },
        { q: 'Wie unterscheidet sich die Sprechzeit?', a: 'Die Sprechzeit wird mit etwa 150 W\u00f6rtern pro Minute berechnet, dem angenehmen Tempo f\u00fcr Pr\u00e4sentationen.' },
        { q: 'Kann ich die Geschwindigkeit anpassen?', a: 'Ja! Sie k\u00f6nnen den WPM-Regler an Ihre Lesegeschwindigkeit oder Zielgruppe anpassen.' },
        { q: 'Warum zeigen Blogs die Lesezeit an?', a: 'Lesezeitsch\u00e4tzungen helfen Lesern zu entscheiden, ob sie einen Artikel beginnen, was das Engagement erh\u00f6ht.' },
      ],
    },
    pt: {
      title: 'Calculadora de Tempo de Leitura Gr\u00e1tis \u2014 Estime a Dura\u00e7\u00e3o da Leitura',
      paragraphs: [
        'A Calculadora de Tempo de Leitura ajuda a estimar quanto tempo leva para ler qualquer texto. Seja blogger, estudante ou criador de conte\u00fado, conhecer o tempo de leitura \u00e9 essencial.',
        'Um adulto m\u00e9dio l\u00ea aproximadamente 238 palavras por minuto. Nossa calculadora usa esse valor mas permite personalizar a velocidade.',
        'Simplesmente cole seu texto e veja instantaneamente o tempo de leitura, tempo de fala, contagem de palavras, caracteres, frases e par\u00e1grafos.',
        'Esta ferramenta \u00e9 perfeita para artigos de blog, apresenta\u00e7\u00f5es e qualquer conte\u00fado onde voc\u00ea quer dar uma estimativa de tempo.',
      ],
      faq: [
        { q: 'Qual \u00e9 a velocidade m\u00e9dia de leitura?', a: 'Um adulto m\u00e9dio l\u00ea cerca de 238 palavras por minuto. Isso varia por tipo de conte\u00fado.' },
        { q: 'Como o tempo de fala difere?', a: 'O tempo de fala \u00e9 calculado em cerca de 150 palavras por minuto, o ritmo confort\u00e1vel para apresenta\u00e7\u00f5es.' },
        { q: 'Posso personalizar a velocidade?', a: 'Sim! Voc\u00ea pode ajustar o controle de palavras por minuto conforme sua velocidade ou p\u00fablico-alvo.' },
        { q: 'Por que blogs mostram tempo de leitura?', a: 'Estimativas ajudam leitores a decidir se come\u00e7am um artigo, aumentando o engajamento.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="reading-time-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={labels.pasteText[lang]}
            rows={8}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 resize-y"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.readingSpeed[lang]}: {wpm}</label>
            <input type="range" min={100} max={600} value={wpm} onChange={(e) => setWpm(Number(e.target.value))} className="w-full" />
            <div className="flex justify-between text-xs text-gray-400"><span>100</span><span>238</span><span>600</span></div>
          </div>

          {words > 0 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <div className="text-xs text-blue-600 font-medium mb-1">{labels.readingTime[lang]}</div>
                  <div className="text-3xl font-bold text-gray-900">{readingMinutes}<span className="text-lg text-gray-500"> {labels.min[lang]}</span></div>
                  <div className="text-sm text-gray-500">{readingSeconds} {labels.sec[lang]}</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <div className="text-xs text-green-600 font-medium mb-1">{labels.speakingTime[lang]}</div>
                  <div className="text-3xl font-bold text-gray-900">{speakingMinutes}<span className="text-lg text-gray-500"> {labels.min[lang]}</span></div>
                  <div className="text-sm text-gray-500">{speakingSeconds} {labels.sec[lang]}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">{labels.stats[lang]}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex justify-between"><span className="text-gray-500 text-sm">{labels.words[lang]}</span><span className="font-semibold text-gray-900">{words.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 text-sm">{labels.characters[lang]}</span><span className="font-semibold text-gray-900">{characters.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 text-sm">{labels.sentences[lang]}</span><span className="font-semibold text-gray-900">{sentences.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 text-sm">{labels.paragraphs[lang]}</span><span className="font-semibold text-gray-900">{paragraphs.toLocaleString()}</span></div>
                </div>
              </div>
            </>
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
                  <span className="text-gray-400">{openFaq === i ? '\u2212' : '+'}</span>
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
