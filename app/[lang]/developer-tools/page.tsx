'use client';

import CategoryHubPage from '@/components/CategoryHubPage';
import { getToolsByCategory } from '@/lib/translations';

const toolSlugs = getToolsByCategory().dev;

const translations: Record<string, { title: string; metaTitle: string; description: string; article: string; toolsHeading: string; exploreOther: string }> = {
  en: {
    title: 'Free Developer Tools Online',
    metaTitle: 'Free Developer Tools Online | ToolKit Online',
    description: 'JSON formatter, regex tester, color picker, QR code generator, password generator and more free developer tools.',
    toolsHeading: 'All Developer Tools',
    exploreOther: 'Explore Other Categories',
    article: `<h2>The Developer Toolkit You Have Been Looking For</h2>
<p>Every developer needs a reliable set of utilities for daily tasks that do not warrant installing a full application or switching between multiple tools. Whether you are debugging an API response, testing a regular expression, generating secure credentials, or fine-tuning colors for a UI design, having instant access to the right tool saves hours of productivity every week. ToolKit Online provides a comprehensive collection of free developer tools that run entirely in your browser — no installation, no account, no data sent to external servers.</p>

<h3>Code Formatting and Validation</h3>
<p>Clean, readable code is the foundation of maintainable software. Our JSON formatter takes messy, minified JSON and transforms it into beautifully indented, color-highlighted output. It also validates the JSON structure and pinpoints syntax errors with clear messages. The XML formatter does the same for XML documents, while the SQL formatter restructures SQL queries for readability. The YAML formatter handles YAML configuration files, ensuring proper indentation and structure. For production optimization, our JS minifier and CSS minifier compress your code by removing whitespace, comments, and unnecessary characters.</p>

<h3>Testing and Debugging</h3>
<p>Regular expressions are powerful but notoriously tricky to get right. Our regex tester lets you write, test, and debug regular expressions in real time with instant visual feedback showing matches, capture groups, and explanations of your pattern. The hash generator creates MD5, SHA-1, SHA-256, and other hash digests for data integrity verification. The binary converter and hex converter handle number base conversions essential for low-level programming and networking tasks.</p>

<h3>Design and Color Tools</h3>
<p>Frontend development requires constant work with colors. Our color picker provides an intuitive interface for selecting colors and outputs values in HEX, RGB, HSL, and other formats simultaneously. The color converter translates between color formats instantly. The color palette generator creates harmonious color schemes based on color theory principles. The gradient generator builds CSS gradients visually, outputting ready-to-use CSS code. The color contrast checker verifies WCAG accessibility compliance between text and background colors.</p>

<h3>Generation and Security</h3>
<p>Our QR code generator creates scannable QR codes for URLs, text, WiFi credentials, and more. The barcode generator produces standard barcode formats for products and inventory. The password generator creates cryptographically strong passwords with customizable length, character sets, and complexity requirements. The WiFi QR generator specifically creates QR codes for easy WiFi network sharing without revealing the password in plain text.</p>

<h3>Network and System Tools</h3>
<p>Understanding your network environment is crucial for development and debugging. The IP lookup tool reveals geolocation and network details for any IP address. The subnet calculator helps with network planning by computing subnet ranges, broadcast addresses, and available hosts. The internet speed test measures your connection bandwidth and latency. The cron expression generator helps you build and validate cron schedules with a visual interface, eliminating the guesswork from job scheduling.</p>

<h3>Hardware Testing</h3>
<p>Our screen resolution detector shows your current display resolution, pixel ratio, and viewport dimensions. The keyboard tester verifies that every key on your keyboard registers correctly. The mic test and webcam test help you verify your audio and video hardware are working properly before important calls or recordings. The screen recorder captures your screen directly in the browser without any software installation.</p>

<p>Every developer tool on ToolKit Online is designed to be fast, accurate, and private. Your code and data never leave your browser, and all tools are free to use without limits.</p>`,
  },
  it: {
    title: 'Strumenti per Sviluppatori Gratuiti',
    metaTitle: 'Strumenti per Sviluppatori Gratuiti Online | ToolKit Online',
    description: 'Formattatore JSON, tester regex, selettore colori, generatore QR code, generatore password e altri strumenti sviluppatore.',
    toolsHeading: 'Tutti gli Strumenti per Sviluppatori',
    exploreOther: 'Esplora Altre Categorie',
    article: `<h2>Il Toolkit per Sviluppatori Che Stavi Cercando</h2>
<p>Ogni sviluppatore ha bisogno di un set affidabile di utilita per le attivita quotidiane che non giustificano l installazione di un applicazione completa. Che tu stia debuggando una risposta API, testando un espressione regolare, generando credenziali sicure o perfezionando i colori per un design UI, avere accesso istantaneo allo strumento giusto fa risparmiare ore di produttivita ogni settimana. ToolKit Online offre una collezione completa di strumenti sviluppatore gratuiti che funzionano interamente nel browser.</p>

<h3>Formattazione e Validazione del Codice</h3>
<p>Il codice pulito e leggibile e la base del software manutenibile. Il nostro formattatore JSON trasforma JSON disordinato e minificato in output ben indentato e colorato. Valida anche la struttura JSON e individua errori di sintassi con messaggi chiari. Il formattatore XML fa lo stesso per documenti XML, mentre il formattatore SQL ristruttura le query SQL per la leggibilita. Il formattatore YAML gestisce i file di configurazione YAML. Per l ottimizzazione in produzione, i nostri minificatori JS e CSS comprimono il codice rimuovendo spazi, commenti e caratteri non necessari.</p>

<h3>Testing e Debug</h3>
<p>Le espressioni regolari sono potenti ma notoriamente difficili da padroneggiare. Il nostro tester regex ti permette di scrivere, testare e debuggare espressioni regolari in tempo reale con feedback visivo istantaneo che mostra corrispondenze, gruppi di cattura e spiegazioni del pattern. Il generatore di hash crea digest MD5, SHA-1, SHA-256 e altri per la verifica dell integrita dei dati. Il convertitore binario e il convertitore esadecimale gestiscono le conversioni di base numerica.</p>

<h3>Design e Strumenti Colore</h3>
<p>Lo sviluppo frontend richiede un lavoro costante con i colori. Il nostro selettore colori fornisce un interfaccia intuitiva per selezionare colori e produce valori in HEX, RGB, HSL e altri formati simultaneamente. Il convertitore colori traduce istantaneamente tra formati colore. Il generatore di palette crea schemi di colori armoniosi basati sui principi della teoria del colore. Il generatore di gradienti costruisce gradienti CSS visivamente. Il verificatore di contrasto colore verifica la conformita WCAG per l accessibilita.</p>

<h3>Generazione e Sicurezza</h3>
<p>Il nostro generatore QR code crea codici QR scansionabili per URL, testo, credenziali WiFi e altro. Il generatore di codici a barre produce formati standard per prodotti e inventario. Il generatore di password crea password crittograficamente robuste con lunghezza, set di caratteri e requisiti di complessita personalizzabili. Il generatore QR WiFi crea specificamente codici QR per la condivisione facile della rete WiFi.</p>

<h3>Strumenti di Rete e Sistema</h3>
<p>Comprendere il proprio ambiente di rete e cruciale per lo sviluppo e il debug. Lo strumento IP lookup rivela geolocalizzazione e dettagli di rete per qualsiasi indirizzo IP. Il calcolatore di subnet aiuta nella pianificazione della rete. Il test di velocita internet misura la larghezza di banda e la latenza della connessione. Il generatore di espressioni cron ti aiuta a costruire e validare programmi cron con un interfaccia visuale.</p>

<h3>Test Hardware</h3>
<p>Il nostro rilevatore di risoluzione schermo mostra la risoluzione attuale del display e le dimensioni del viewport. Il tester tastiera verifica che ogni tasto funzioni correttamente. Il test microfono e il test webcam aiutano a verificare che l hardware audio e video funzioni correttamente. Il registratore schermo cattura lo schermo direttamente nel browser senza installare software.</p>

<p>Ogni strumento sviluppatore su ToolKit Online e progettato per essere veloce, preciso e privato. Il tuo codice e i tuoi dati non lasciano mai il browser.</p>`,
  },
  es: {
    title: 'Herramientas para Desarrolladores Gratuitas',
    metaTitle: 'Herramientas para Desarrolladores Gratuitas | ToolKit Online',
    description: 'Formateador JSON, probador regex, selector de colores, generador QR, generador de contrasenas y mas herramientas.',
    toolsHeading: 'Todas las Herramientas para Desarrolladores',
    exploreOther: 'Explorar Otras Categorias',
    article: `<h2>El Kit de Herramientas para Desarrolladores Que Buscabas</h2>
<p>Todo desarrollador necesita un conjunto confiable de utilidades para tareas diarias que no justifican instalar una aplicacion completa. Ya sea que estes depurando una respuesta API, probando una expresion regular, generando credenciales seguras o ajustando colores para un diseno UI, tener acceso instantaneo a la herramienta correcta ahorra horas de productividad cada semana. ToolKit Online proporciona una coleccion completa de herramientas para desarrolladores gratuitas que funcionan completamente en tu navegador.</p>

<h3>Formateo y Validacion de Codigo</h3>
<p>El codigo limpio y legible es la base del software mantenible. Nuestro formateador JSON toma JSON desordenado y minificado y lo transforma en salida bellamente indentada y coloreada. Tambien valida la estructura JSON e senala errores de sintaxis con mensajes claros. El formateador XML hace lo mismo para documentos XML, mientras que el formateador SQL reestructura consultas SQL. El formateador YAML maneja archivos de configuracion YAML. Para optimizacion en produccion, nuestros minificadores JS y CSS comprimen tu codigo eliminando espacios, comentarios y caracteres innecesarios.</p>

<h3>Testing y Depuracion</h3>
<p>Las expresiones regulares son poderosas pero notoriamente dificiles. Nuestro probador de regex te permite escribir, probar y depurar expresiones regulares en tiempo real con retroalimentacion visual instantanea que muestra coincidencias, grupos de captura y explicaciones de tu patron. El generador de hash crea digests MD5, SHA-1, SHA-256 y otros. El conversor binario y el conversor hexadecimal manejan conversiones de base numerica.</p>

<h3>Diseno y Herramientas de Color</h3>
<p>El desarrollo frontend requiere trabajo constante con colores. Nuestro selector de colores proporciona una interfaz intuitiva para seleccionar colores y produce valores en HEX, RGB, HSL y otros formatos simultaneamente. El conversor de colores traduce entre formatos instantaneamente. El generador de paletas crea esquemas de colores armoniosos. El generador de gradientes construye gradientes CSS visualmente. El verificador de contraste de color verifica el cumplimiento de accesibilidad WCAG.</p>

<h3>Generacion y Seguridad</h3>
<p>Nuestro generador de codigos QR crea codigos escaneables para URLs, texto, credenciales WiFi y mas. El generador de codigos de barras produce formatos estandar para productos e inventario. El generador de contrasenas crea contrasenas criptograficamente fuertes con longitud, conjuntos de caracteres y requisitos de complejidad personalizables. El generador QR WiFi crea especificamente codigos QR para compartir redes WiFi facilmente.</p>

<h3>Herramientas de Red y Sistema</h3>
<p>Entender tu entorno de red es crucial para el desarrollo y la depuracion. La herramienta IP lookup revela geolocalizacion y detalles de red. La calculadora de subredes ayuda con la planificacion de red. La prueba de velocidad de internet mide el ancho de banda y la latencia. El generador de expresiones cron te ayuda a construir y validar programas cron con una interfaz visual.</p>

<h3>Pruebas de Hardware</h3>
<p>Nuestro detector de resolucion de pantalla muestra la resolucion actual y las dimensiones del viewport. El probador de teclado verifica que cada tecla funcione correctamente. La prueba de microfono y la prueba de webcam ayudan a verificar que tu hardware de audio y video funcione. El grabador de pantalla captura tu pantalla directamente en el navegador sin instalar software.</p>

<p>Cada herramienta para desarrolladores esta disenada para ser rapida, precisa y privada. Tu codigo y datos nunca salen del navegador.</p>`,
  },
  fr: {
    title: 'Outils Developpeur Gratuits',
    metaTitle: 'Outils Developpeur Gratuits en Ligne | ToolKit Online',
    description: 'Formateur JSON, testeur regex, selecteur de couleurs, generateur QR, generateur de mots de passe et plus d outils.',
    toolsHeading: 'Tous les Outils Developpeur',
    exploreOther: 'Explorer les Autres Categories',
    article: `<h2>La Boite a Outils Developpeur Que Vous Cherchiez</h2>
<p>Chaque developpeur a besoin d un ensemble fiable d utilitaires pour les taches quotidiennes qui ne justifient pas l installation d une application complete. Que vous debogniez une reponse API, testiez une expression reguliere, generiez des identifiants securises ou ajustiez des couleurs pour un design UI, avoir un acces instantane au bon outil permet d economiser des heures de productivite chaque semaine. ToolKit Online propose une collection complete d outils developpeur gratuits qui fonctionnent entierement dans votre navigateur.</p>

<h3>Formatage et Validation de Code</h3>
<p>Un code propre et lisible est le fondement d un logiciel maintenable. Notre formateur JSON prend du JSON desordonne et minifie et le transforme en sortie joliment indentee et coloree. Il valide egalement la structure JSON et identifie les erreurs de syntaxe. Le formateur XML fait de meme pour les documents XML, tandis que le formateur SQL restructure les requetes SQL. Le formateur YAML gere les fichiers de configuration YAML. Pour l optimisation en production, nos minifieurs JS et CSS compriment votre code en supprimant espaces, commentaires et caracteres inutiles.</p>

<h3>Tests et Debogage</h3>
<p>Les expressions regulieres sont puissantes mais notairement delicates. Notre testeur regex vous permet d ecrire, tester et deboguer des expressions regulieres en temps reel avec un retour visuel instantane montrant les correspondances, groupes de capture et explications de votre motif. Le generateur de hash cree des digests MD5, SHA-1, SHA-256 et autres. Le convertisseur binaire et le convertisseur hexadecimal gerent les conversions de base numerique.</p>

<h3>Design et Outils Couleur</h3>
<p>Le developpement frontend necessite un travail constant avec les couleurs. Notre selecteur de couleurs fournit une interface intuitive et produit des valeurs en HEX, RGB, HSL et autres formats simultanement. Le convertisseur de couleurs traduit instantanement entre les formats. Le generateur de palettes cree des schemas de couleurs harmonieux. Le generateur de degradees construit des degradees CSS visuellement. Le verificateur de contraste de couleur verifie la conformite WCAG pour l accessibilite.</p>

<h3>Generation et Securite</h3>
<p>Notre generateur de QR codes cree des codes scannables pour les URLs, texte, identifiants WiFi et plus. Le generateur de codes-barres produit des formats standard. Le generateur de mots de passe cree des mots de passe cryptographiquement forts avec longueur, jeux de caracteres et exigences de complexite personnalisables. Le generateur QR WiFi cree specifiquement des QR codes pour le partage facile de reseaux WiFi.</p>

<h3>Outils Reseau et Systeme</h3>
<p>Comprendre votre environnement reseau est crucial pour le developpement. L outil IP lookup revele la geolocalisation et les details reseau. Le calculateur de sous-reseaux aide a la planification reseau. Le test de vitesse internet mesure la bande passante et la latence. Le generateur d expressions cron vous aide a construire et valider des planifications cron avec une interface visuelle.</p>

<h3>Tests Materiel</h3>
<p>Notre detecteur de resolution d ecran affiche la resolution actuelle et les dimensions du viewport. Le testeur de clavier verifie que chaque touche fonctionne correctement. Les tests micro et webcam aident a verifier que votre materiel audio et video fonctionne. L enregistreur d ecran capture votre ecran directement dans le navigateur sans installer de logiciel.</p>

<p>Chaque outil developpeur est concu pour etre rapide, precis et prive. Votre code et vos donnees ne quittent jamais le navigateur.</p>`,
  },
  de: {
    title: 'Kostenlose Entwickler-Tools',
    metaTitle: 'Kostenlose Entwickler-Tools Online | ToolKit Online',
    description: 'JSON-Formatierer, Regex-Tester, Farbwaehler, QR-Code-Generator, Passwort-Generator und weitere Entwickler-Tools.',
    toolsHeading: 'Alle Entwickler-Tools',
    exploreOther: 'Andere Kategorien Entdecken',
    article: `<h2>Das Entwickler-Toolkit, Nach Dem Sie Gesucht Haben</h2>
<p>Jeder Entwickler braucht einen zuverlaessigen Satz von Utilities fuer taegliche Aufgaben, die keine vollstaendige Anwendungsinstallation rechtfertigen. Ob Sie eine API-Antwort debuggen, einen regulaeren Ausdruck testen, sichere Zugangsdaten generieren oder Farben fuer ein UI-Design feinabstimmen — der sofortige Zugriff auf das richtige Tool spart jede Woche Stunden an Produktivitaet. ToolKit Online bietet eine umfassende Sammlung kostenloser Entwickler-Tools, die vollstaendig in Ihrem Browser laufen.</p>

<h3>Code-Formatierung und Validierung</h3>
<p>Sauberer, lesbarer Code ist die Grundlage wartbarer Software. Unser JSON-Formatierer nimmt unordentliches, minifiziertes JSON und verwandelt es in schoen eingeruecktes, farblich hervorgehobenes Output. Er validiert auch die JSON-Struktur und zeigt Syntaxfehler mit klaren Meldungen an. Der XML-Formatierer macht dasselbe fuer XML-Dokumente, waehrend der SQL-Formatierer SQL-Abfragen fuer die Lesbarkeit umstrukturiert. Der YAML-Formatierer verarbeitet YAML-Konfigurationsdateien. Fuer Produktionsoptimierung komprimieren unsere JS-Minifier und CSS-Minifier Ihren Code.</p>

<h3>Testen und Debuggen</h3>
<p>Regulaere Ausdruecke sind maechtig aber notorisch schwierig. Unser Regex-Tester ermoeglicht es Ihnen, regulaere Ausdruecke in Echtzeit zu schreiben, testen und debuggen mit sofortigem visuellem Feedback. Der Hash-Generator erstellt MD5-, SHA-1-, SHA-256- und andere Hash-Digests zur Datenintegritaetspruefung. Der Binaer-Konverter und Hex-Konverter verarbeiten Zahlenbasis-Umrechnungen.</p>

<h3>Design und Farbtools</h3>
<p>Frontend-Entwicklung erfordert staendige Arbeit mit Farben. Unser Farbwaehler bietet eine intuitive Oberflaeche zur Farbauswahl und gibt Werte in HEX, RGB, HSL und anderen Formaten gleichzeitig aus. Der Farbkonverter uebersetzt sofort zwischen Farbformaten. Der Palettengenerator erstellt harmonische Farbschemata. Der Gradient-Generator baut CSS-Farbverlaeufe visuell auf. Der Farbkontrast-Pruefer verifiziert die WCAG-Barrierefreiheitskonformitaet.</p>

<h3>Generierung und Sicherheit</h3>
<p>Unser QR-Code-Generator erstellt scannbare QR-Codes fuer URLs, Text, WiFi-Zugangsdaten und mehr. Der Barcode-Generator erzeugt Standard-Barcodeformate. Der Passwort-Generator erstellt kryptographisch starke Passwoerter mit anpassbarer Laenge und Zeichensaetzen. Der WiFi-QR-Generator erstellt speziell QR-Codes zum einfachen Teilen von WiFi-Netzwerken.</p>

<h3>Netzwerk- und System-Tools</h3>
<p>Das Verstaendnis Ihrer Netzwerkumgebung ist entscheidend fuer Entwicklung und Debugging. Das IP-Lookup-Tool zeigt Geolokalisierung und Netzwerkdetails. Der Subnetz-Rechner hilft bei der Netzwerkplanung. Der Internet-Geschwindigkeitstest misst Bandbreite und Latenz. Der Cron-Ausdrucks-Generator hilft beim Erstellen und Validieren von Cron-Zeitplaenen mit einer visuellen Oberflaeche.</p>

<h3>Hardware-Tests</h3>
<p>Unser Bildschirmaufloesung-Detektor zeigt die aktuelle Displayaufloesung und Viewport-Dimensionen. Der Tastatur-Tester prueft, ob jede Taste korrekt registriert wird. Der Mikrofon-Test und Webcam-Test helfen, Ihre Audio- und Video-Hardware zu verifizieren. Der Bildschirmrekorder nimmt Ihren Bildschirm direkt im Browser auf ohne Software-Installation.</p>

<p>Jedes Entwickler-Tool ist auf Geschwindigkeit, Genauigkeit und Datenschutz ausgelegt. Ihr Code und Ihre Daten verlassen nie den Browser.</p>`,
  },
  pt: {
    title: 'Ferramentas para Desenvolvedores Gratuitas',
    metaTitle: 'Ferramentas para Desenvolvedores Gratuitas | ToolKit Online',
    description: 'Formatador JSON, testador regex, seletor de cores, gerador QR code, gerador de senhas e mais ferramentas para desenvolvedores.',
    toolsHeading: 'Todas as Ferramentas para Desenvolvedores',
    exploreOther: 'Explorar Outras Categorias',
    article: `<h2>O Kit de Ferramentas para Desenvolvedores Que Voce Procurava</h2>
<p>Todo desenvolvedor precisa de um conjunto confiavel de utilitarios para tarefas diarias que nao justificam instalar uma aplicacao completa. Seja depurando uma resposta de API, testando uma expressao regular, gerando credenciais seguras ou ajustando cores para um design de UI, ter acesso instantaneo a ferramenta certa economiza horas de produtividade toda semana. O ToolKit Online fornece uma colecao completa de ferramentas para desenvolvedores gratuitas que funcionam inteiramente no seu navegador.</p>

<h3>Formatacao e Validacao de Codigo</h3>
<p>Codigo limpo e legivel e a base de software manutensivel. Nosso formatador JSON pega JSON bagunado e minificado e o transforma em saida lindamente indentada e colorida. Tambem valida a estrutura JSON e aponta erros de sintaxe. O formatador XML faz o mesmo para documentos XML, enquanto o formatador SQL reestrutura consultas SQL. O formatador YAML lida com arquivos de configuracao YAML. Para otimizacao em producao, nossos minificadores JS e CSS comprimem seu codigo removendo espacos, comentarios e caracteres desnecessarios.</p>

<h3>Testes e Depuracao</h3>
<p>Expressoes regulares sao poderosas mas notoriamente complicadas. Nosso testador regex permite escrever, testar e depurar expressoes regulares em tempo real com feedback visual instantaneo mostrando correspondencias, grupos de captura e explicacoes do seu padrao. O gerador de hash cria digests MD5, SHA-1, SHA-256 e outros. O conversor binario e o conversor hexadecimal lidam com conversoes de base numerica.</p>

<h3>Design e Ferramentas de Cor</h3>
<p>O desenvolvimento frontend requer trabalho constante com cores. Nosso seletor de cores fornece uma interface intuitiva e produz valores em HEX, RGB, HSL e outros formatos simultaneamente. O conversor de cores traduz entre formatos instantaneamente. O gerador de paletas cria esquemas de cores harmoniosos. O gerador de gradientes constroi gradientes CSS visualmente. O verificador de contraste de cor verifica conformidade WCAG de acessibilidade.</p>

<h3>Geracao e Seguranca</h3>
<p>Nosso gerador de QR code cria codigos escaneaaveis para URLs, texto, credenciais WiFi e mais. O gerador de codigos de barras produz formatos padrao. O gerador de senhas cria senhas criptograficamente fortes com comprimento, conjuntos de caracteres e requisitos de complexidade personalizaveis. O gerador QR WiFi cria especificamente QR codes para compartilhamento facil de redes WiFi.</p>

<h3>Ferramentas de Rede e Sistema</h3>
<p>Entender seu ambiente de rede e crucial para desenvolvimento e depuracao. A ferramenta IP lookup revela geolocalizacao e detalhes de rede. A calculadora de sub-rede ajuda no planejamento de rede. O teste de velocidade de internet mede largura de banda e latencia. O gerador de expressoes cron ajuda a construir e validar agendamentos cron com uma interface visual.</p>

<h3>Testes de Hardware</h3>
<p>Nosso detector de resolucao de tela mostra a resolucao atual e dimensoes do viewport. O testador de teclado verifica que cada tecla funcione corretamente. O teste de microfone e teste de webcam ajudam a verificar se seu hardware de audio e video esta funcionando. O gravador de tela captura sua tela diretamente no navegador sem instalar software.</p>

<p>Cada ferramenta para desenvolvedores e projetada para ser rapida, precisa e privada. Seu codigo e dados nunca saem do navegador.</p>`,
  },
};

export default function DeveloperToolsPage() {
  return (
    <CategoryHubPage
      config={{
        categoryKey: 'dev',
        slug: 'developer-tools',
        toolSlugs: toolSlugs,
        otherCategories: [
          { key: 'finance', slug: 'finance-tools' },
          { key: 'text', slug: 'text-tools' },
          { key: 'health', slug: 'health-tools' },
          { key: 'conversion', slug: 'conversion-tools' },
          { key: 'math', slug: 'math-tools' },
          { key: 'images', slug: 'image-tools' },
        ],
        translations,
      }}
    />
  );
}
