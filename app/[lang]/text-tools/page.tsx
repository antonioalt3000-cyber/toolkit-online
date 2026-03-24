'use client';

import CategoryHubPage from '@/components/CategoryHubPage';
import { getToolsByCategory } from '@/lib/translations';

const toolSlugs = getToolsByCategory().text;

const translations: Record<string, { title: string; metaTitle: string; description: string; article: string; toolsHeading: string; exploreOther: string }> = {
  en: {
    title: 'Free Text Tools & Editors',
    metaTitle: 'Free Text Tools & Editors Online | ToolKit Online',
    description: 'Word counter, case converter, markdown preview, lorem ipsum generator and more free text tools.',
    toolsHeading: 'All Text Tools',
    exploreOther: 'Explore Other Categories',
    article: `<h2>Essential Text Tools for Writers, Developers, and Students</h2>
<p>Text is the foundation of digital communication. Whether you are writing an essay, coding a website, preparing a presentation, or managing content for a blog, having the right text tools at your fingertips saves time and improves quality. ToolKit Online provides a comprehensive collection of free text utilities that run entirely in your browser, keeping your content private and delivering instant results.</p>

<h3>Word and Character Counting</h3>
<p>Knowing the exact length of your text is essential in many contexts. Academic papers have strict word limits, social media posts have character caps, and SEO content requires specific word counts for optimal ranking. Our word counter instantly analyzes your text and provides word count, character count, sentence count, paragraph count, and estimated reading time. The character counter focuses specifically on character-level analysis, making it ideal for platforms like Twitter or SMS where every character matters.</p>

<h3>Text Formatting and Conversion</h3>
<p>Reformatting text manually is tedious and error-prone. Our text case converter transforms text between uppercase, lowercase, title case, sentence case, and more with a single click. The text-to-slug tool generates URL-friendly slugs from any text, perfect for web developers and content managers. The HTML encoder handles special character encoding for safe web display, while the markdown preview lets you write and preview Markdown in real time.</p>

<h3>Writing Assistance</h3>
<p>Good writing requires good tools. Our grammar checker helps identify common errors and suggests improvements. The text diff tool compares two pieces of text side by side, highlighting every difference — invaluable for editors and developers reviewing changes. The typing speed test measures your words per minute and accuracy, helping you track your improvement over time. The reading time calculator estimates how long it will take readers to consume your content.</p>

<h3>Content Generation</h3>
<p>Sometimes you need placeholder text or repetitive content. The lorem ipsum generator creates realistic dummy text in customizable amounts, perfect for design mockups and layout testing. The text repeater duplicates any string a specified number of times, useful for testing, data generation, and various automation tasks. The emoji picker provides quick access to hundreds of emojis organized by category.</p>

<h3>Analysis and Productivity</h3>
<p>Understanding your text at a deeper level can improve your writing. The word frequency counter reveals which words appear most often, helping you identify overused terms and improve variety. The line counter provides precise line-by-line analysis. For students, the flashcard maker transforms your notes into study-ready cards, while the note-taking tool provides a distraction-free writing environment.</p>

<p>All text tools on ToolKit Online process your content locally in the browser. Your text is never sent to any server, ensuring complete privacy. No account creation or software installation is needed — just open a tool and start working.</p>`,
  },
  it: {
    title: 'Strumenti di Testo Gratuiti',
    metaTitle: 'Strumenti di Testo Gratuiti Online | ToolKit Online',
    description: 'Conta parole, convertitore maiuscole/minuscole, anteprima markdown, generatore lorem ipsum e altri strumenti di testo.',
    toolsHeading: 'Tutti gli Strumenti di Testo',
    exploreOther: 'Esplora Altre Categorie',
    article: `<h2>Strumenti di Testo Essenziali per Scrittori, Sviluppatori e Studenti</h2>
<p>Il testo e alla base della comunicazione digitale. Che tu stia scrivendo un saggio, programmando un sito web, preparando una presentazione o gestendo contenuti per un blog, avere gli strumenti di testo giusti a portata di mano fa risparmiare tempo e migliora la qualita. ToolKit Online offre una collezione completa di utilita di testo gratuite che funzionano interamente nel browser, mantenendo i tuoi contenuti privati e fornendo risultati istantanei.</p>

<h3>Conteggio Parole e Caratteri</h3>
<p>Conoscere la lunghezza esatta del tuo testo e essenziale in molti contesti. I lavori accademici hanno limiti di parole rigidi, i post sui social media hanno limiti di caratteri e i contenuti SEO richiedono conteggi specifici. Il nostro conta parole analizza istantaneamente il tuo testo e fornisce conteggio parole, caratteri, frasi, paragrafi e tempo di lettura stimato. Il conta caratteri si concentra specificamente sull analisi a livello di carattere.</p>

<h3>Formattazione e Conversione del Testo</h3>
<p>Riformattare il testo manualmente e noioso e soggetto a errori. Il nostro convertitore maiuscole/minuscole trasforma il testo tra maiuscolo, minuscolo, stile titolo e altro con un solo clic. Lo strumento text-to-slug genera slug URL-friendly da qualsiasi testo. L encoder HTML gestisce la codifica dei caratteri speciali per la visualizzazione web sicura, mentre l anteprima markdown ti permette di scrivere e visualizzare Markdown in tempo reale.</p>

<h3>Assistenza alla Scrittura</h3>
<p>Scrivere bene richiede buoni strumenti. Il nostro controllo grammaticale aiuta a identificare errori comuni e suggerisce miglioramenti. Lo strumento diff testo confronta due testi fianco a fianco, evidenziando ogni differenza. Il test di velocita di digitazione misura le tue parole al minuto e la precisione. Il calcolatore del tempo di lettura stima quanto tempo impiegheranno i lettori per consumare il tuo contenuto.</p>

<h3>Generazione di Contenuti</h3>
<p>A volte hai bisogno di testo segnaposto o contenuto ripetitivo. Il generatore lorem ipsum crea testo fittizio realistico in quantita personalizzabili, perfetto per mockup di design e test di layout. Il ripetitore di testo duplica qualsiasi stringa un numero specificato di volte. Il selettore emoji fornisce accesso rapido a centinaia di emoji organizzate per categoria.</p>

<h3>Analisi e Produttivita</h3>
<p>Comprendere il tuo testo a un livello piu profondo puo migliorare la tua scrittura. Il contatore di frequenza delle parole rivela quali parole appaiono piu spesso, aiutandoti a identificare termini abusati. Il conta righe fornisce un analisi precisa riga per riga. Per gli studenti, il creatore di flashcard trasforma i tuoi appunti in carte di studio pronte, mentre lo strumento per appunti offre un ambiente di scrittura senza distrazioni.</p>

<p>Tutti gli strumenti di testo su ToolKit Online elaborano i tuoi contenuti localmente nel browser. Il tuo testo non viene mai inviato a nessun server. Non serve creare account ne installare software.</p>`,
  },
  es: {
    title: 'Herramientas de Texto Gratuitas',
    metaTitle: 'Herramientas de Texto Gratuitas Online | ToolKit Online',
    description: 'Contador de palabras, conversor de texto, vista previa markdown, generador lorem ipsum y mas herramientas de texto.',
    toolsHeading: 'Todas las Herramientas de Texto',
    exploreOther: 'Explorar Otras Categorias',
    article: `<h2>Herramientas de Texto Esenciales para Escritores, Desarrolladores y Estudiantes</h2>
<p>El texto es la base de la comunicacion digital. Ya sea que estes escribiendo un ensayo, programando un sitio web, preparando una presentacion o gestionando contenido para un blog, tener las herramientas de texto adecuadas a tu alcance ahorra tiempo y mejora la calidad. ToolKit Online ofrece una coleccion completa de utilidades de texto gratuitas que funcionan completamente en tu navegador, manteniendo tu contenido privado y entregando resultados instantaneos.</p>

<h3>Conteo de Palabras y Caracteres</h3>
<p>Conocer la longitud exacta de tu texto es esencial en muchos contextos. Los trabajos academicos tienen limites estrictos de palabras, las publicaciones en redes sociales tienen limites de caracteres y el contenido SEO requiere conteos especificos. Nuestro contador de palabras analiza instantaneamente tu texto y proporciona conteo de palabras, caracteres, oraciones, parrafos y tiempo de lectura estimado.</p>

<h3>Formato y Conversion de Texto</h3>
<p>Reformatear texto manualmente es tedioso y propenso a errores. Nuestro conversor de mayusculas y minusculas transforma el texto entre mayusculas, minusculas, estilo titulo y mas con un solo clic. La herramienta text-to-slug genera slugs amigables para URLs a partir de cualquier texto. El codificador HTML maneja la codificacion de caracteres especiales, mientras que la vista previa de markdown te permite escribir y visualizar Markdown en tiempo real.</p>

<h3>Asistencia para la Escritura</h3>
<p>Escribir bien requiere buenas herramientas. Nuestro corrector gramatical ayuda a identificar errores comunes y sugiere mejoras. La herramienta de diferencias de texto compara dos textos lado a lado, destacando cada diferencia. La prueba de velocidad de escritura mide tus palabras por minuto y precision. El calculador de tiempo de lectura estima cuanto tardaran los lectores en consumir tu contenido.</p>

<h3>Generacion de Contenido</h3>
<p>A veces necesitas texto de relleno o contenido repetitivo. El generador de lorem ipsum crea texto ficticio realista en cantidades personalizables, perfecto para maquetas de diseno y pruebas de layout. El repetidor de texto duplica cualquier cadena un numero especificado de veces. El selector de emojis proporciona acceso rapido a cientos de emojis organizados por categoria.</p>

<h3>Analisis y Productividad</h3>
<p>Comprender tu texto a un nivel mas profundo puede mejorar tu escritura. El contador de frecuencia de palabras revela cuales aparecen con mas frecuencia. El contador de lineas proporciona un analisis preciso linea por linea. Para estudiantes, el creador de tarjetas de estudio transforma tus notas en tarjetas listas para estudiar, mientras que la herramienta de notas ofrece un entorno de escritura sin distracciones.</p>

<p>Todas las herramientas de texto procesan tu contenido localmente en el navegador. Tu texto nunca se envia a ningun servidor. No necesitas crear cuenta ni instalar software.</p>`,
  },
  fr: {
    title: 'Outils de Texte Gratuits',
    metaTitle: 'Outils de Texte Gratuits en Ligne | ToolKit Online',
    description: 'Compteur de mots, convertisseur de casse, apercu markdown, generateur lorem ipsum et plus d outils de texte.',
    toolsHeading: 'Tous les Outils de Texte',
    exploreOther: 'Explorer les Autres Categories',
    article: `<h2>Outils de Texte Essentiels pour Ecrivains, Developpeurs et Etudiants</h2>
<p>Le texte est le fondement de la communication numerique. Que vous redigiez un essai, programmiez un site web, prepariez une presentation ou geriez du contenu pour un blog, disposer des bons outils de texte vous fait gagner du temps et ameliore la qualite. ToolKit Online propose une collection complete d utilitaires de texte gratuits qui fonctionnent entierement dans votre navigateur, gardant votre contenu prive et fournissant des resultats instantanes.</p>

<h3>Comptage de Mots et Caracteres</h3>
<p>Connaitre la longueur exacte de votre texte est essentiel dans de nombreux contextes. Les travaux academiques ont des limites strictes de mots, les publications sur les reseaux sociaux ont des limites de caracteres et le contenu SEO necessite des comptages specifiques. Notre compteur de mots analyse instantanement votre texte et fournit le nombre de mots, caracteres, phrases, paragraphes et le temps de lecture estime.</p>

<h3>Formatage et Conversion de Texte</h3>
<p>Reformater du texte manuellement est fastidieux et sujet aux erreurs. Notre convertisseur de casse transforme le texte entre majuscules, minuscules, casse de titre et plus en un seul clic. L outil text-to-slug genere des slugs compatibles URL a partir de n importe quel texte. L encodeur HTML gere l encodage des caracteres speciaux, tandis que l apercu markdown vous permet d ecrire et de visualiser du Markdown en temps reel.</p>

<h3>Assistance a l Ecriture</h3>
<p>Bien ecrire necessite de bons outils. Notre verificateur grammatical aide a identifier les erreurs courantes et suggere des ameliorations. L outil de comparaison de texte compare deux textes cote a cote en mettant en evidence chaque difference. Le test de vitesse de frappe mesure vos mots par minute et votre precision. Le calculateur de temps de lecture estime combien de temps les lecteurs mettront a consommer votre contenu.</p>

<h3>Generation de Contenu</h3>
<p>Parfois vous avez besoin de texte factice ou de contenu repetitif. Le generateur lorem ipsum cree du texte fictif realiste en quantites personnalisables. Le repeteur de texte duplique n importe quelle chaine un nombre specifie de fois. Le selecteur d emojis fournit un acces rapide a des centaines d emojis organisees par categorie.</p>

<h3>Analyse et Productivite</h3>
<p>Comprendre votre texte a un niveau plus profond peut ameliorer votre ecriture. Le compteur de frequence des mots revele quels mots apparaissent le plus souvent. Le compteur de lignes fournit une analyse precise ligne par ligne. Pour les etudiants, le createur de fiches transforme vos notes en cartes d etude pretes, tandis que l outil de prise de notes offre un environnement d ecriture sans distraction.</p>

<p>Tous les outils de texte traitent votre contenu localement dans le navigateur. Votre texte n est jamais envoye a aucun serveur. Aucun compte ni installation de logiciel n est necessaire.</p>`,
  },
  de: {
    title: 'Kostenlose Text-Tools',
    metaTitle: 'Kostenlose Text-Tools Online | ToolKit Online',
    description: 'Wortzaehler, Textkonverter, Markdown-Vorschau, Lorem-Ipsum-Generator und weitere kostenlose Text-Tools.',
    toolsHeading: 'Alle Text-Tools',
    exploreOther: 'Andere Kategorien Entdecken',
    article: `<h2>Unverzichtbare Text-Tools fuer Autoren, Entwickler und Studenten</h2>
<p>Text ist die Grundlage der digitalen Kommunikation. Ob Sie einen Aufsatz schreiben, eine Website programmieren, eine Praesentation vorbereiten oder Inhalte fuer einen Blog verwalten — die richtigen Text-Tools zur Hand zu haben spart Zeit und verbessert die Qualitaet. ToolKit Online bietet eine umfassende Sammlung kostenloser Text-Utilities, die vollstaendig in Ihrem Browser laufen und Ihre Inhalte privat halten.</p>

<h3>Wort- und Zeichenzaehlung</h3>
<p>Die genaue Laenge Ihres Textes zu kennen ist in vielen Kontexten wichtig. Akademische Arbeiten haben strenge Wortlimits, Social-Media-Posts haben Zeichenlimits und SEO-Inhalte erfordern bestimmte Wortanzahlen. Unser Wortzaehler analysiert Ihren Text sofort und liefert Wortanzahl, Zeichenzahl, Satzanzahl, Absatzanzahl und geschaetzte Lesezeit.</p>

<h3>Textformatierung und -konvertierung</h3>
<p>Text manuell umzuformatieren ist muehsam und fehleranfaellig. Unser Text-Konverter wandelt Text zwischen Grossbuchstaben, Kleinbuchstaben, Titelschreibweise und mehr mit einem einzigen Klick um. Das Text-to-Slug-Tool generiert URL-freundliche Slugs aus beliebigem Text. Der HTML-Encoder verarbeitet die Codierung von Sonderzeichen, waehrend die Markdown-Vorschau Ihnen ermoeglicht, Markdown in Echtzeit zu schreiben und anzuzeigen.</p>

<h3>Schreibhilfe</h3>
<p>Gutes Schreiben erfordert gute Werkzeuge. Unser Grammatikpruefer hilft, haeufige Fehler zu identifizieren und schlaegt Verbesserungen vor. Das Text-Diff-Tool vergleicht zwei Texte nebeneinander und hebt jede Differenz hervor. Der Tippgeschwindigkeitstest misst Ihre Woerter pro Minute und Genauigkeit. Der Lesezeit-Rechner schaetzt, wie lange Leser brauchen, um Ihren Inhalt zu lesen.</p>

<h3>Inhaltsgenerierung</h3>
<p>Manchmal brauchen Sie Platzhaltertext oder sich wiederholenden Inhalt. Der Lorem-Ipsum-Generator erstellt realistischen Blindtext in anpassbaren Mengen. Der Text-Repeater dupliziert beliebige Zeichenketten eine bestimmte Anzahl von Malen. Der Emoji-Picker bietet schnellen Zugriff auf Hunderte von Emojis nach Kategorien geordnet.</p>

<h3>Analyse und Produktivitaet</h3>
<p>Ihren Text auf einer tieferen Ebene zu verstehen kann Ihr Schreiben verbessern. Der Worthaeufigkeitszaehler zeigt, welche Woerter am haeufigsten vorkommen. Der Zeilenzaehler bietet eine praezise zeilenweise Analyse. Fuer Studenten verwandelt der Karteikarten-Ersteller Ihre Notizen in lernfertige Karten, waehrend das Notiz-Tool eine ablenkungsfreie Schreibumgebung bietet.</p>

<p>Alle Text-Tools verarbeiten Ihre Inhalte lokal im Browser. Ihr Text wird nie an einen Server gesendet. Kein Konto oder Software-Installation erforderlich.</p>`,
  },
  pt: {
    title: 'Ferramentas de Texto Gratuitas',
    metaTitle: 'Ferramentas de Texto Gratuitas Online | ToolKit Online',
    description: 'Contador de palavras, conversor de texto, visualizacao markdown, gerador lorem ipsum e mais ferramentas de texto.',
    toolsHeading: 'Todas as Ferramentas de Texto',
    exploreOther: 'Explorar Outras Categorias',
    article: `<h2>Ferramentas de Texto Essenciais para Escritores, Desenvolvedores e Estudantes</h2>
<p>O texto e a base da comunicacao digital. Seja escrevendo um ensaio, programando um site, preparando uma apresentacao ou gerenciando conteudo para um blog, ter as ferramentas de texto certas ao seu alcance economiza tempo e melhora a qualidade. O ToolKit Online oferece uma colecao completa de utilitarios de texto gratuitos que funcionam inteiramente no seu navegador, mantendo seu conteudo privado e entregando resultados instantaneos.</p>

<h3>Contagem de Palavras e Caracteres</h3>
<p>Conhecer o comprimento exato do seu texto e essencial em muitos contextos. Trabalhos academicos tem limites rigorosos de palavras, publicacoes em redes sociais tem limites de caracteres e conteudo SEO requer contagens especificas. Nosso contador de palavras analisa instantaneamente seu texto e fornece contagem de palavras, caracteres, frases, paragrafos e tempo de leitura estimado.</p>

<h3>Formatacao e Conversao de Texto</h3>
<p>Reformatar texto manualmente e tedioso e propenso a erros. Nosso conversor de caixa transforma texto entre maiusculas, minusculas, estilo titulo e mais com um unico clique. A ferramenta text-to-slug gera slugs amigaveis para URL. O codificador HTML lida com a codificacao de caracteres especiais, enquanto a visualizacao markdown permite escrever e visualizar Markdown em tempo real.</p>

<h3>Assistencia a Escrita</h3>
<p>Escrever bem requer boas ferramentas. Nosso verificador gramatical ajuda a identificar erros comuns e sugere melhorias. A ferramenta de diferenca de texto compara dois textos lado a lado, destacando cada diferenca. O teste de velocidade de digitacao mede suas palavras por minuto e precisao. O calculador de tempo de leitura estima quanto tempo os leitores levarao para consumir seu conteudo.</p>

<h3>Geracao de Conteudo</h3>
<p>As vezes voce precisa de texto de preenchimento ou conteudo repetitivo. O gerador lorem ipsum cria texto ficticio realista em quantidades personalizaveis. O repetidor de texto duplica qualquer string um numero especificado de vezes. O seletor de emojis fornece acesso rapido a centenas de emojis organizados por categoria.</p>

<h3>Analise e Produtividade</h3>
<p>Entender seu texto em um nivel mais profundo pode melhorar sua escrita. O contador de frequencia de palavras revela quais palavras aparecem com mais frequencia. O contador de linhas fornece uma analise precisa linha por linha. Para estudantes, o criador de flashcards transforma suas anotacoes em cartoes de estudo prontos, enquanto a ferramenta de anotacoes oferece um ambiente de escrita sem distracoes.</p>

<p>Todas as ferramentas de texto processam seu conteudo localmente no navegador. Seu texto nunca e enviado a nenhum servidor. Nenhuma conta ou instalacao de software e necessaria.</p>`,
  },
};

export default function TextToolsPage() {
  return (
    <CategoryHubPage
      config={{
        categoryKey: 'text',
        slug: 'text-tools',
        toolSlugs: toolSlugs,
        otherCategories: [
          { key: 'finance', slug: 'finance-tools' },
          { key: 'health', slug: 'health-tools' },
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
