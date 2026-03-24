'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { type Locale } from '@/lib/translations';

/* ------------------------------------------------------------------ */
/*  Translations — all 6 languages, E-E-A-T optimized content         */
/* ------------------------------------------------------------------ */

interface AboutTranslation {
  title: string;
  subtitle: string;
  stats: { label: string; value: string }[];
  sections: {
    id: string;
    heading: string;
    paragraphs: string[];
  }[];
  categoryLinks: { label: string; href: string }[];
  contactCta: string;
  contactEmail: string;
}

const translations: Record<Locale, AboutTranslation> = {
  en: {
    title: 'About ToolKit Online',
    subtitle: 'Free, privacy-first online tools trusted by thousands of users worldwide.',
    stats: [
      { label: 'Free Tools', value: '143+' },
      { label: 'Languages', value: '6' },
      { label: 'Pages', value: '900+' },
      { label: 'Cost', value: '100% Free' },
    ],
    sections: [
      {
        id: 'who-we-are',
        heading: 'Who We Are',
        paragraphs: [
          'ToolKit Online is an independent web platform founded in 2024 with one clear purpose: to provide high-quality, free digital tools that anyone can use without barriers. We are a team of developers, designers, and productivity enthusiasts who believe that essential utilities — from financial calculators to image editors — should be accessible to everyone, regardless of budget or technical skill.',
          'Our project started as a personal initiative to solve everyday problems quickly and efficiently. What began as a small collection of calculators and converters has grown into a comprehensive platform with over 143 tools spanning seven categories, serving thousands of users across six languages. Every tool we build is shaped by real user feedback, making ToolKit Online a truly community-driven resource that evolves to meet the needs of students, professionals, developers, and small business owners around the world.',
          'We operate from the European Union and are committed to full compliance with the GDPR and all applicable privacy regulations. Our team brings years of experience in web development, user experience design, and search engine optimization, ensuring that every tool is not only functional but also fast, intuitive, and easy to find.',
        ],
      },
      {
        id: 'our-mission',
        heading: 'Our Mission',
        paragraphs: [
          'Our mission is simple: empower people with free, reliable, and privacy-respecting online tools. We believe the internet should make life easier, not harder. Too many utility websites are cluttered with intrusive ads, hidden paywalls, or require unnecessary sign-ups before you can use a basic calculator or converter.',
          'ToolKit Online takes a different approach. Every one of our 143+ tools is completely free, requires no registration, and processes your data entirely in your browser. There are no premium tiers, no trial periods, and no feature locks. Whether you need to calculate a mortgage payment, format JSON code, compress an image, or convert units, you can do it instantly without obstacles. We sustain our platform through non-intrusive advertising that respects your browsing experience, so you can focus on what matters: getting things done.',
        ],
      },
      {
        id: 'why-143-tools',
        heading: 'Why 143+ Free Tools',
        paragraphs: [
          'We designed ToolKit Online as a one-stop destination for the utilities people use most. Instead of bookmarking dozens of different websites for different tasks, you can find everything you need in one place. Our tools are organized into seven carefully curated categories:',
          'Finance — VAT calculators, loan calculators, mortgage tools, invoice generators, investment calculators, and more. Text — Word counters, markdown preview, grammar checkers, text-to-speech, resume builders, and note-taking tools. Health — BMI calculators, calorie trackers, sleep calculators, pace calculators, and breathing exercises. Conversion — Unit converters, PDF tools, image-to-text, CSV to JSON, and encoding/decoding utilities. Developer — JSON formatters, regex testers, color pickers, QR code generators, hash generators, and speed tests. Math — Scientific calculators, chart makers, probability tools, grade calculators, and matrix operations. Images — Photo editors, image compressors, background removers, meme generators, and pixel art makers.',
          'Each tool is designed to solve a specific problem quickly and efficiently. We continuously expand our collection based on user requests, search data, and emerging needs, adding new tools every month to keep ToolKit Online relevant and comprehensive.',
        ],
      },
      {
        id: 'technology',
        heading: 'Our Technology Stack',
        paragraphs: [
          'ToolKit Online is built with modern, battle-tested web technologies to deliver the fastest and most reliable experience possible. Our platform runs on Next.js and React, leveraging server-side rendering and static generation for lightning-fast page loads and excellent search engine optimization. The entire frontend is developed with TypeScript for type safety and Tailwind CSS for a responsive design that works flawlessly on every device, from smartphones to ultra-wide desktop monitors.',
          'Every tool processes data entirely client-side, meaning your information never leaves your browser and never touches our servers. This architecture eliminates server round-trips, delivers instant results, and provides an inherent layer of privacy protection. We deploy on Vercel with global CDN distribution, ensuring fast load times from any location in the world. Our Progressive Web App (PWA) support allows you to install ToolKit Online on your device for offline access to your favorite tools.',
          'Performance is a core priority. We optimize every page for Core Web Vitals, implement lazy loading for heavy components, and minimize JavaScript bundles to ensure the fastest possible experience even on slower connections. Our infrastructure is designed to scale effortlessly, handling traffic spikes without degradation.',
        ],
      },
      {
        id: 'privacy',
        heading: 'Privacy & Trust',
        paragraphs: [
          'Privacy is not an afterthought at ToolKit Online — it is a foundational principle. All of our tools run entirely in your browser. The data you enter into any calculator, converter, or editor is processed locally on your device and is never sent to our servers. We do not collect, store, or have access to any personal data you use within our tools.',
          'We are fully compliant with the EU General Data Protection Regulation (GDPR) and implement Google Consent Mode v2. Analytics and advertising cookies are only activated after your explicit opt-in through our cookie consent banner. You can manage your preferences at any time via the Cookie Settings link in the footer. We use HTTPS encryption for all connections and follow security best practices throughout our infrastructure.',
          'Our commitment to transparency means we clearly explain what data we collect (only anonymous, aggregated usage statistics for improving our service) and what we do not collect (any personal data from tool usage). We believe trust is earned through actions, not words, and our privacy-first architecture demonstrates that commitment every time you use one of our tools.',
        ],
      },
      {
        id: 'contact',
        heading: 'Contact Us',
        paragraphs: [
          'We love hearing from our users — your feedback directly shapes the future of ToolKit Online. Whether you have a suggestion for a new tool, want to report an issue, have a question about functionality, or simply want to share your experience, we are always happy to listen.',
          'Your ideas have already helped us grow from a small personal project to a platform with over 143 tools and 900+ pages in six languages. We review every message and strive to respond as quickly as possible. If you have a tool request, there is a good chance it will make it into our development roadmap.',
        ],
      },
    ],
    categoryLinks: [
      { label: 'Finance Tools', href: '/#finance' },
      { label: 'Text Tools', href: '/#text' },
      { label: 'Health Tools', href: '/#health' },
      { label: 'Developer Tools', href: '/#dev' },
      { label: 'Math Tools', href: '/#math' },
      { label: 'Conversion Tools', href: '/#conversion' },
      { label: 'Image Tools', href: '/#images' },
    ],
    contactCta: 'Send us an email at',
    contactEmail: 'info@toolkitonline.vip',
  },

  it: {
    title: 'Chi Siamo — ToolKit Online',
    subtitle: 'Strumenti online gratuiti e orientati alla privacy, usati da migliaia di utenti in tutto il mondo.',
    stats: [
      { label: 'Strumenti Gratuiti', value: '143+' },
      { label: 'Lingue', value: '6' },
      { label: 'Pagine', value: '900+' },
      { label: 'Costo', value: '100% Gratis' },
    ],
    sections: [
      {
        id: 'who-we-are',
        heading: 'Chi Siamo',
        paragraphs: [
          'ToolKit Online e una piattaforma web indipendente fondata nel 2024 con uno scopo chiaro: fornire strumenti digitali gratuiti e di alta qualita che chiunque possa utilizzare senza barriere. Siamo un team di sviluppatori, designer e appassionati di produttivita che credono che le utility essenziali — dai calcolatori finanziari agli editor di immagini — debbano essere accessibili a tutti, indipendentemente dal budget o dalle competenze tecniche.',
          'Il nostro progetto e iniziato come un\'iniziativa personale per risolvere problemi quotidiani in modo rapido ed efficiente. Quella che era una piccola collezione di calcolatori e convertitori e diventata una piattaforma completa con oltre 143 strumenti in sette categorie, che serve migliaia di utenti in sei lingue. Ogni strumento che costruiamo e plasmato dal feedback reale degli utenti, rendendo ToolKit Online una risorsa veramente guidata dalla community che si evolve per soddisfare le esigenze di studenti, professionisti, sviluppatori e piccoli imprenditori in tutto il mondo.',
          'Operiamo dall\'Unione Europea e siamo impegnati nella piena conformita al GDPR e a tutte le normative sulla privacy applicabili. Il nostro team porta anni di esperienza nello sviluppo web, nel design dell\'esperienza utente e nell\'ottimizzazione per i motori di ricerca, assicurando che ogni strumento sia non solo funzionale ma anche veloce, intuitivo e facile da trovare.',
        ],
      },
      {
        id: 'our-mission',
        heading: 'La Nostra Missione',
        paragraphs: [
          'La nostra missione e semplice: dare alle persone strumenti online gratuiti, affidabili e rispettosi della privacy. Crediamo che internet debba rendere la vita piu semplice, non piu complicata. Troppi siti di utility sono pieni di pubblicita invasive, paywall nascosti o richiedono registrazioni inutili prima di poter usare un semplice calcolatore o convertitore.',
          'ToolKit Online adotta un approccio diverso. Ognuno dei nostri 143+ strumenti e completamente gratuito, non richiede registrazione e elabora i tuoi dati interamente nel tuo browser. Non ci sono livelli premium, periodi di prova o funzionalita bloccate. Che tu debba calcolare una rata del mutuo, formattare codice JSON, comprimere un\'immagine o convertire unita di misura, puoi farlo istantaneamente senza ostacoli. Sosteniamo la nostra piattaforma attraverso pubblicita non invasiva che rispetta la tua esperienza di navigazione, cosi puoi concentrarti su cio che conta: portare a termine le cose.',
        ],
      },
      {
        id: 'why-143-tools',
        heading: 'Perche oltre 143 Strumenti Gratuiti',
        paragraphs: [
          'Abbiamo progettato ToolKit Online come destinazione unica per le utility piu utilizzate. Invece di salvare decine di siti web diversi per compiti diversi, puoi trovare tutto cio di cui hai bisogno in un unico posto. I nostri strumenti sono organizzati in sette categorie accuratamente curate:',
          'Finanza — Calcolatori IVA, calcolatori di prestiti, strumenti per mutui, generatori di fatture, calcolatori di investimenti e altro. Testo — Contatori di parole, anteprima markdown, correttori grammaticali, text-to-speech, creatori di curriculum e strumenti per appunti. Salute — Calcolatori BMI, tracker di calorie, calcolatori del sonno, calcolatori del passo e esercizi di respirazione. Conversione — Convertitori di unita, strumenti PDF, immagine-in-testo, CSV in JSON e utility di codifica/decodifica. Sviluppatore — Formattatori JSON, tester regex, selettori di colore, generatori di codici QR, generatori di hash e speed test. Matematica — Calcolatrici scientifiche, creatori di grafici, strumenti di probabilita, calcolatori di voti e operazioni con matrici. Immagini — Editor fotografici, compressori di immagini, rimozione sfondo, generatori di meme e creatori di pixel art.',
          'Ogni strumento e progettato per risolvere un problema specifico in modo rapido ed efficiente. Espandiamo continuamente la nostra collezione basandoci sulle richieste degli utenti, i dati di ricerca e le esigenze emergenti, aggiungendo nuovi strumenti ogni mese per mantenere ToolKit Online rilevante e completo.',
        ],
      },
      {
        id: 'technology',
        heading: 'Il Nostro Stack Tecnologico',
        paragraphs: [
          'ToolKit Online e costruito con tecnologie web moderne e collaudate per offrire l\'esperienza piu veloce e affidabile possibile. La nostra piattaforma funziona su Next.js e React, sfruttando il rendering lato server e la generazione statica per caricamenti ultra-rapidi e un\'eccellente ottimizzazione per i motori di ricerca. L\'intero frontend e sviluppato con TypeScript per la sicurezza dei tipi e Tailwind CSS per un design responsivo che funziona perfettamente su qualsiasi dispositivo, dagli smartphone ai monitor desktop ultra-wide.',
          'Ogni strumento elabora i dati interamente lato client, il che significa che le tue informazioni non lasciano mai il tuo browser e non toccano mai i nostri server. Questa architettura elimina i round-trip con il server, fornisce risultati istantanei e offre un livello intrinseco di protezione della privacy. Deployiamo su Vercel con distribuzione CDN globale, garantendo tempi di caricamento rapidi da qualsiasi posizione nel mondo. Il supporto Progressive Web App (PWA) ti permette di installare ToolKit Online sul tuo dispositivo per l\'accesso offline ai tuoi strumenti preferiti.',
          'Le prestazioni sono una priorita fondamentale. Ottimizziamo ogni pagina per i Core Web Vitals, implementiamo il lazy loading per i componenti pesanti e minimizziamo i bundle JavaScript per garantire l\'esperienza piu veloce possibile anche su connessioni piu lente. La nostra infrastruttura e progettata per scalare senza sforzo, gestendo picchi di traffico senza degradazioni.',
        ],
      },
      {
        id: 'privacy',
        heading: 'Privacy e Fiducia',
        paragraphs: [
          'La privacy non e un ripensamento su ToolKit Online — e un principio fondamentale. Tutti i nostri strumenti funzionano interamente nel tuo browser. I dati che inserisci in qualsiasi calcolatore, convertitore o editor vengono elaborati localmente sul tuo dispositivo e non vengono mai inviati ai nostri server. Non raccogliamo, memorizziamo o abbiamo accesso ad alcun dato personale che utilizzi nei nostri strumenti.',
          'Siamo pienamente conformi al Regolamento Generale sulla Protezione dei Dati (GDPR) dell\'UE e implementiamo Google Consent Mode v2. I cookie di analytics e pubblicita vengono attivati solo dopo il tuo consenso esplicito tramite il nostro banner dei cookie. Puoi gestire le tue preferenze in qualsiasi momento tramite il link Impostazioni Cookie nel footer. Utilizziamo la crittografia HTTPS per tutte le connessioni e seguiamo le best practice di sicurezza in tutta la nostra infrastruttura.',
          'Il nostro impegno per la trasparenza significa che spieghiamo chiaramente quali dati raccogliamo (solo statistiche di utilizzo anonime e aggregate per migliorare il nostro servizio) e quali non raccogliamo (nessun dato personale dall\'uso degli strumenti). Crediamo che la fiducia si guadagni con i fatti, non con le parole, e la nostra architettura privacy-first dimostra questo impegno ogni volta che usi uno dei nostri strumenti.',
        ],
      },
      {
        id: 'contact',
        heading: 'Contattaci',
        paragraphs: [
          'Amiamo ascoltare i nostri utenti — il vostro feedback plasma direttamente il futuro di ToolKit Online. Che tu abbia un suggerimento per un nuovo strumento, voglia segnalare un problema, abbia una domanda sulle funzionalita o semplicemente voglia condividere la tua esperienza, siamo sempre felici di ascoltarti.',
          'Le vostre idee ci hanno gia aiutato a crescere da un piccolo progetto personale a una piattaforma con oltre 143 strumenti e 900+ pagine in sei lingue. Esaminiamo ogni messaggio e ci impegniamo a rispondere il piu rapidamente possibile. Se hai una richiesta per un nuovo strumento, ci sono buone probabilita che entri nella nostra roadmap di sviluppo.',
        ],
      },
    ],
    categoryLinks: [
      { label: 'Strumenti Finanza', href: '/#finance' },
      { label: 'Strumenti Testo', href: '/#text' },
      { label: 'Strumenti Salute', href: '/#health' },
      { label: 'Strumenti Sviluppatore', href: '/#dev' },
      { label: 'Strumenti Matematica', href: '/#math' },
      { label: 'Strumenti Conversione', href: '/#conversion' },
      { label: 'Strumenti Immagini', href: '/#images' },
    ],
    contactCta: 'Scrivici a',
    contactEmail: 'info@toolkitonline.vip',
  },

  es: {
    title: 'Acerca de ToolKit Online',
    subtitle: 'Herramientas online gratuitas y enfocadas en la privacidad, utilizadas por miles de usuarios en todo el mundo.',
    stats: [
      { label: 'Herramientas Gratis', value: '143+' },
      { label: 'Idiomas', value: '6' },
      { label: 'Paginas', value: '900+' },
      { label: 'Coste', value: '100% Gratis' },
    ],
    sections: [
      {
        id: 'who-we-are',
        heading: 'Quienes Somos',
        paragraphs: [
          'ToolKit Online es una plataforma web independiente fundada en 2024 con un proposito claro: proporcionar herramientas digitales gratuitas y de alta calidad que cualquiera pueda usar sin barreras. Somos un equipo de desarrolladores, disenadores y entusiastas de la productividad que creen que las utilidades esenciales — desde calculadoras financieras hasta editores de imagenes — deben ser accesibles para todos, independientemente del presupuesto o la habilidad tecnica.',
          'Nuestro proyecto comenzo como una iniciativa personal para resolver problemas cotidianos de manera rapida y eficiente. Lo que empezo como una pequena coleccion de calculadoras y conversores se ha convertido en una plataforma integral con mas de 143 herramientas en siete categorias, sirviendo a miles de usuarios en seis idiomas. Cada herramienta que construimos esta moldeada por comentarios reales de usuarios, haciendo de ToolKit Online un recurso verdaderamente impulsado por la comunidad que evoluciona para satisfacer las necesidades de estudiantes, profesionales, desarrolladores y pequenos empresarios de todo el mundo.',
          'Operamos desde la Union Europea y estamos comprometidos con el pleno cumplimiento del RGPD y todas las regulaciones de privacidad aplicables. Nuestro equipo aporta anos de experiencia en desarrollo web, diseno de experiencia de usuario y optimizacion para motores de busqueda, asegurando que cada herramienta sea no solo funcional sino tambien rapida, intuitiva y facil de encontrar.',
        ],
      },
      {
        id: 'our-mission',
        heading: 'Nuestra Mision',
        paragraphs: [
          'Nuestra mision es simple: empoderar a las personas con herramientas online gratuitas, confiables y respetuosas con la privacidad. Creemos que internet debe facilitar la vida, no complicarla. Demasiados sitios web de utilidades estan llenos de anuncios intrusivos, muros de pago ocultos o requieren registros innecesarios antes de poder usar una simple calculadora o conversor.',
          'ToolKit Online adopta un enfoque diferente. Cada una de nuestras 143+ herramientas es completamente gratuita, no requiere registro y procesa tus datos completamente en tu navegador. No hay niveles premium, periodos de prueba ni funciones bloqueadas. Ya necesites calcular una cuota hipotecaria, formatear codigo JSON, comprimir una imagen o convertir unidades, puedes hacerlo instantaneamente sin obstaculos. Sostenemos nuestra plataforma a traves de publicidad no intrusiva que respeta tu experiencia de navegacion, para que puedas concentrarte en lo que importa: hacer las cosas.',
        ],
      },
      {
        id: 'why-143-tools',
        heading: 'Por que mas de 143 Herramientas Gratuitas',
        paragraphs: [
          'Disenamos ToolKit Online como un destino unico para las utilidades que las personas mas utilizan. En lugar de guardar docenas de sitios web diferentes para distintas tareas, puedes encontrar todo lo que necesitas en un solo lugar. Nuestras herramientas estan organizadas en siete categorias cuidadosamente curadas:',
          'Finanzas — Calculadoras de IVA, calculadoras de prestamos, herramientas hipotecarias, generadores de facturas, calculadoras de inversion y mas. Texto — Contadores de palabras, vista previa de markdown, correctores gramaticales, texto a voz, creadores de curriculum y herramientas de notas. Salud — Calculadoras de IMC, rastreadores de calorias, calculadoras de sueno, calculadoras de ritmo y ejercicios de respiracion. Conversion — Conversores de unidades, herramientas PDF, imagen a texto, CSV a JSON y utilidades de codificacion/decodificacion. Desarrollador — Formateadores JSON, testers de regex, selectores de color, generadores de codigos QR, generadores de hash y tests de velocidad. Matematicas — Calculadoras cientificas, creadores de graficos, herramientas de probabilidad, calculadoras de notas y operaciones con matrices. Imagenes — Editores de fotos, compresores de imagenes, eliminadores de fondo, generadores de memes y creadores de pixel art.',
          'Cada herramienta esta disenada para resolver un problema especifico de manera rapida y eficiente. Expandimos continuamente nuestra coleccion basandonos en las solicitudes de los usuarios, datos de busqueda y necesidades emergentes, anadiendo nuevas herramientas cada mes para mantener ToolKit Online relevante y completo.',
        ],
      },
      {
        id: 'technology',
        heading: 'Nuestro Stack Tecnologico',
        paragraphs: [
          'ToolKit Online esta construido con tecnologias web modernas y probadas para ofrecer la experiencia mas rapida y confiable posible. Nuestra plataforma funciona sobre Next.js y React, aprovechando el renderizado del lado del servidor y la generacion estatica para cargas ultra-rapidas y una excelente optimizacion para motores de busqueda. Todo el frontend esta desarrollado con TypeScript para seguridad de tipos y Tailwind CSS para un diseno responsivo que funciona perfectamente en cualquier dispositivo, desde smartphones hasta monitores de escritorio ultra-anchos.',
          'Cada herramienta procesa datos completamente del lado del cliente, lo que significa que tu informacion nunca sale de tu navegador y nunca toca nuestros servidores. Esta arquitectura elimina los viajes de ida y vuelta al servidor, entrega resultados instantaneos y proporciona una capa inherente de proteccion de privacidad. Desplegamos en Vercel con distribucion CDN global, asegurando tiempos de carga rapidos desde cualquier ubicacion del mundo. Nuestro soporte de Progressive Web App (PWA) te permite instalar ToolKit Online en tu dispositivo para acceso sin conexion a tus herramientas favoritas.',
          'El rendimiento es una prioridad fundamental. Optimizamos cada pagina para Core Web Vitals, implementamos carga diferida para componentes pesados y minimizamos los bundles de JavaScript para garantizar la experiencia mas rapida posible incluso en conexiones mas lentas. Nuestra infraestructura esta disenada para escalar sin esfuerzo, manejando picos de trafico sin degradacion.',
        ],
      },
      {
        id: 'privacy',
        heading: 'Privacidad y Confianza',
        paragraphs: [
          'La privacidad no es algo secundario en ToolKit Online — es un principio fundamental. Todas nuestras herramientas funcionan completamente en tu navegador. Los datos que introduces en cualquier calculadora, conversor o editor se procesan localmente en tu dispositivo y nunca se envian a nuestros servidores. No recopilamos, almacenamos ni tenemos acceso a ningun dato personal que utilices en nuestras herramientas.',
          'Cumplimos plenamente con el Reglamento General de Proteccion de Datos (RGPD) de la UE e implementamos Google Consent Mode v2. Las cookies de analisis y publicidad solo se activan despues de tu consentimiento explicito a traves de nuestro banner de cookies. Puedes gestionar tus preferencias en cualquier momento a traves del enlace Configuracion de Cookies en el pie de pagina. Utilizamos cifrado HTTPS para todas las conexiones y seguimos las mejores practicas de seguridad en toda nuestra infraestructura.',
          'Nuestro compromiso con la transparencia significa que explicamos claramente que datos recopilamos (solo estadisticas de uso anonimas y agregadas para mejorar nuestro servicio) y que no recopilamos (ningun dato personal del uso de herramientas). Creemos que la confianza se gana con hechos, no con palabras, y nuestra arquitectura privacy-first demuestra ese compromiso cada vez que usas una de nuestras herramientas.',
        ],
      },
      {
        id: 'contact',
        heading: 'Contactanos',
        paragraphs: [
          'Nos encanta escuchar a nuestros usuarios — sus comentarios moldean directamente el futuro de ToolKit Online. Ya tengas una sugerencia para una nueva herramienta, quieras reportar un problema, tengas una pregunta sobre funcionalidad o simplemente quieras compartir tu experiencia, siempre estamos felices de escucharte.',
          'Tus ideas ya nos han ayudado a crecer de un pequeno proyecto personal a una plataforma con mas de 143 herramientas y 900+ paginas en seis idiomas. Revisamos cada mensaje y nos esforzamos por responder lo mas rapido posible. Si tienes una solicitud de herramienta, hay buenas posibilidades de que entre en nuestra hoja de ruta de desarrollo.',
        ],
      },
    ],
    categoryLinks: [
      { label: 'Herramientas Finanzas', href: '/#finance' },
      { label: 'Herramientas Texto', href: '/#text' },
      { label: 'Herramientas Salud', href: '/#health' },
      { label: 'Herramientas Desarrollador', href: '/#dev' },
      { label: 'Herramientas Matematicas', href: '/#math' },
      { label: 'Herramientas Conversion', href: '/#conversion' },
      { label: 'Herramientas Imagenes', href: '/#images' },
    ],
    contactCta: 'Escribenos a',
    contactEmail: 'info@toolkitonline.vip',
  },

  fr: {
    title: 'A Propos de ToolKit Online',
    subtitle: 'Outils en ligne gratuits et axes sur la confidentialite, utilises par des milliers d\'utilisateurs dans le monde.',
    stats: [
      { label: 'Outils Gratuits', value: '143+' },
      { label: 'Langues', value: '6' },
      { label: 'Pages', value: '900+' },
      { label: 'Cout', value: '100% Gratuit' },
    ],
    sections: [
      {
        id: 'who-we-are',
        heading: 'Qui Sommes-Nous',
        paragraphs: [
          'ToolKit Online est une plateforme web independante fondee en 2024 avec un objectif clair : fournir des outils numeriques gratuits et de haute qualite que tout le monde peut utiliser sans barrieres. Nous sommes une equipe de developpeurs, de designers et de passionnes de productivite qui croient que les utilitaires essentiels — des calculatrices financieres aux editeurs d\'images — doivent etre accessibles a tous, quel que soit le budget ou le niveau technique.',
          'Notre projet a commence comme une initiative personnelle pour resoudre rapidement et efficacement les problemes du quotidien. Ce qui n\'etait qu\'une petite collection de calculatrices et de convertisseurs est devenu une plateforme complete avec plus de 143 outils repartis dans sept categories, servant des milliers d\'utilisateurs dans six langues. Chaque outil que nous construisons est faconne par les retours reels des utilisateurs, faisant de ToolKit Online une ressource veritablement guidee par la communaute qui evolue pour repondre aux besoins des etudiants, des professionnels, des developpeurs et des petits entrepreneurs du monde entier.',
          'Nous operons depuis l\'Union europeenne et nous nous engageons a respecter pleinement le RGPD et toutes les reglementations applicables en matiere de confidentialite. Notre equipe apporte des annees d\'experience en developpement web, en conception d\'experience utilisateur et en optimisation pour les moteurs de recherche, garantissant que chaque outil soit non seulement fonctionnel mais aussi rapide, intuitif et facile a trouver.',
        ],
      },
      {
        id: 'our-mission',
        heading: 'Notre Mission',
        paragraphs: [
          'Notre mission est simple : donner aux gens des outils en ligne gratuits, fiables et respectueux de la vie privee. Nous croyons qu\'internet doit faciliter la vie, pas la compliquer. Trop de sites d\'utilitaires sont envahis de publicites intrusives, de murs de paiement caches ou exigent des inscriptions inutiles avant de pouvoir utiliser une simple calculatrice ou un convertisseur.',
          'ToolKit Online adopte une approche differente. Chacun de nos 143+ outils est entierement gratuit, ne necessite aucune inscription et traite vos donnees entierement dans votre navigateur. Il n\'y a pas de niveaux premium, pas de periodes d\'essai et pas de fonctionnalites verrouillees. Que vous ayez besoin de calculer un paiement hypothecaire, de formater du code JSON, de compresser une image ou de convertir des unites, vous pouvez le faire instantanement sans obstacles. Nous soutenons notre plateforme grace a une publicite non intrusive qui respecte votre experience de navigation, afin que vous puissiez vous concentrer sur l\'essentiel : accomplir vos taches.',
        ],
      },
      {
        id: 'why-143-tools',
        heading: 'Pourquoi plus de 143 Outils Gratuits',
        paragraphs: [
          'Nous avons concu ToolKit Online comme une destination unique pour les utilitaires les plus utilises. Au lieu de mettre en favoris des dizaines de sites web differents pour differentes taches, vous pouvez trouver tout ce dont vous avez besoin en un seul endroit. Nos outils sont organises en sept categories soigneusement selectionnees :',
          'Finance — Calculatrices de TVA, calculatrices de prets, outils hypothecaires, generateurs de factures, calculatrices d\'investissement et plus. Texte — Compteurs de mots, apercu markdown, correcteurs grammaticaux, synthese vocale, createurs de CV et outils de prise de notes. Sante — Calculateurs d\'IMC, suivi de calories, calculateurs de sommeil, calculateurs d\'allure et exercices de respiration. Conversion — Convertisseurs d\'unites, outils PDF, image en texte, CSV en JSON et utilitaires d\'encodage/decodage. Developpeur — Formateurs JSON, testeurs de regex, selecteurs de couleur, generateurs de codes QR, generateurs de hash et tests de vitesse. Mathematiques — Calculatrices scientifiques, createurs de graphiques, outils de probabilite, calculateurs de notes et operations matricielles. Images — Editeurs photo, compresseurs d\'images, suppresseurs d\'arriere-plan, generateurs de memes et createurs de pixel art.',
          'Chaque outil est concu pour resoudre un probleme specifique rapidement et efficacement. Nous elargissons continuellement notre collection en fonction des demandes des utilisateurs, des donnees de recherche et des besoins emergents, ajoutant de nouveaux outils chaque mois pour garder ToolKit Online pertinent et complet.',
        ],
      },
      {
        id: 'technology',
        heading: 'Notre Stack Technologique',
        paragraphs: [
          'ToolKit Online est construit avec des technologies web modernes et eprouvees pour offrir l\'experience la plus rapide et la plus fiable possible. Notre plateforme fonctionne sur Next.js et React, exploitant le rendu cote serveur et la generation statique pour des chargements ultra-rapides et une excellente optimisation pour les moteurs de recherche. L\'ensemble du frontend est developpe avec TypeScript pour la surete des types et Tailwind CSS pour un design responsive qui fonctionne parfaitement sur tout appareil, des smartphones aux moniteurs de bureau ultra-larges.',
          'Chaque outil traite les donnees entierement cote client, ce qui signifie que vos informations ne quittent jamais votre navigateur et ne touchent jamais nos serveurs. Cette architecture elimine les allers-retours serveur, fournit des resultats instantanes et offre une couche inherente de protection de la vie privee. Nous deployons sur Vercel avec une distribution CDN mondiale, garantissant des temps de chargement rapides depuis n\'importe quel endroit. Notre support Progressive Web App (PWA) vous permet d\'installer ToolKit Online sur votre appareil pour un acces hors ligne a vos outils preferes.',
          'La performance est une priorite fondamentale. Nous optimisons chaque page pour les Core Web Vitals, implementons le chargement differé pour les composants lourds et minimisons les bundles JavaScript pour garantir l\'experience la plus rapide possible meme sur des connexions plus lentes. Notre infrastructure est concue pour evoluer sans effort, gerant les pics de trafic sans degradation.',
        ],
      },
      {
        id: 'privacy',
        heading: 'Confidentialite et Confiance',
        paragraphs: [
          'La confidentialite n\'est pas une reflexion apres coup chez ToolKit Online — c\'est un principe fondamental. Tous nos outils fonctionnent entierement dans votre navigateur. Les donnees que vous saisissez dans n\'importe quelle calculatrice, convertisseur ou editeur sont traitees localement sur votre appareil et ne sont jamais envoyees a nos serveurs. Nous ne collectons, ne stockons ni n\'avons acces a aucune donnee personnelle que vous utilisez dans nos outils.',
          'Nous sommes pleinement conformes au Reglement General sur la Protection des Donnees (RGPD) de l\'UE et implementons Google Consent Mode v2. Les cookies d\'analyse et de publicite ne sont actives qu\'apres votre consentement explicite via notre banniere de cookies. Vous pouvez gerer vos preferences a tout moment via le lien Parametres des Cookies en bas de page. Nous utilisons le chiffrement HTTPS pour toutes les connexions et suivons les meilleures pratiques de securite dans toute notre infrastructure.',
          'Notre engagement envers la transparence signifie que nous expliquons clairement quelles donnees nous collectons (uniquement des statistiques d\'utilisation anonymes et agregees pour ameliorer notre service) et ce que nous ne collectons pas (aucune donnee personnelle provenant de l\'utilisation des outils). Nous croyons que la confiance se gagne par des actions, pas par des mots, et notre architecture axee sur la confidentialite demontre cet engagement a chaque fois que vous utilisez l\'un de nos outils.',
        ],
      },
      {
        id: 'contact',
        heading: 'Contactez-nous',
        paragraphs: [
          'Nous adorons entendre nos utilisateurs — vos retours faconnent directement l\'avenir de ToolKit Online. Que vous ayez une suggestion pour un nouvel outil, souhaitiez signaler un probleme, ayez une question sur une fonctionnalite ou vouliez simplement partager votre experience, nous sommes toujours heureux de vous ecouter.',
          'Vos idees nous ont deja aides a passer d\'un petit projet personnel a une plateforme de plus de 143 outils et 900+ pages dans six langues. Nous examinons chaque message et nous efforcons de repondre le plus rapidement possible. Si vous avez une demande d\'outil, il y a de bonnes chances qu\'elle entre dans notre feuille de route de developpement.',
        ],
      },
    ],
    categoryLinks: [
      { label: 'Outils Finance', href: '/#finance' },
      { label: 'Outils Texte', href: '/#text' },
      { label: 'Outils Sante', href: '/#health' },
      { label: 'Outils Developpeur', href: '/#dev' },
      { label: 'Outils Mathematiques', href: '/#math' },
      { label: 'Outils Conversion', href: '/#conversion' },
      { label: 'Outils Images', href: '/#images' },
    ],
    contactCta: 'Contactez-nous a',
    contactEmail: 'info@toolkitonline.vip',
  },

  de: {
    title: 'Uber ToolKit Online',
    subtitle: 'Kostenlose, datenschutzorientierte Online-Tools, denen Tausende von Nutzern weltweit vertrauen.',
    stats: [
      { label: 'Kostenlose Tools', value: '143+' },
      { label: 'Sprachen', value: '6' },
      { label: 'Seiten', value: '900+' },
      { label: 'Kosten', value: '100% Kostenlos' },
    ],
    sections: [
      {
        id: 'who-we-are',
        heading: 'Wer Wir Sind',
        paragraphs: [
          'ToolKit Online ist eine unabhangige Webplattform, die 2024 mit einem klaren Ziel gegrundet wurde: hochwertige, kostenlose digitale Werkzeuge bereitzustellen, die jeder ohne Barrieren nutzen kann. Wir sind ein Team aus Entwicklern, Designern und Produktivitatsbegeisterten, die glauben, dass wesentliche Hilfsmittel — von Finanzrechnern bis hin zu Bildeditoren — fur alle zuganglich sein sollten, unabhangig von Budget oder technischen Fahigkeiten.',
          'Unser Projekt begann als personliche Initiative, um alltagliche Probleme schnell und effizient zu losen. Was als kleine Sammlung von Rechnern und Umrechnern begann, hat sich zu einer umfassenden Plattform mit uber 143 Werkzeugen in sieben Kategorien entwickelt, die Tausende von Nutzern in sechs Sprachen bedient. Jedes Werkzeug, das wir bauen, wird durch echtes Nutzerfeedback geformt, was ToolKit Online zu einer wirklich von der Community getriebenen Ressource macht, die sich entwickelt, um die Bedurfnisse von Studenten, Fachleuten, Entwicklern und Kleinunternehmern auf der ganzen Welt zu erfullen.',
          'Wir operieren aus der Europaischen Union und verpflichten uns zur vollstandigen Einhaltung der DSGVO und aller geltenden Datenschutzbestimmungen. Unser Team bringt jahrelange Erfahrung in Webentwicklung, User-Experience-Design und Suchmaschinenoptimierung mit und stellt sicher, dass jedes Werkzeug nicht nur funktional, sondern auch schnell, intuitiv und leicht zu finden ist.',
        ],
      },
      {
        id: 'our-mission',
        heading: 'Unsere Mission',
        paragraphs: [
          'Unsere Mission ist einfach: Menschen mit kostenlosen, zuverlassigen und datenschutzfreundlichen Online-Werkzeugen zu starken. Wir glauben, dass das Internet das Leben einfacher machen sollte, nicht schwieriger. Zu viele Utility-Websites sind mit aufdringlicher Werbung, versteckten Paywalls uberladen oder erfordern unnotige Registrierungen, bevor man einen einfachen Rechner oder Umrechner verwenden kann.',
          'ToolKit Online verfolgt einen anderen Ansatz. Jedes unserer 143+ Werkzeuge ist vollstandig kostenlos, erfordert keine Registrierung und verarbeitet Ihre Daten vollstandig in Ihrem Browser. Es gibt keine Premium-Stufen, keine Testzeitraume und keine Funktionssperren. Ob Sie eine Hypothekenzahlung berechnen, JSON-Code formatieren, ein Bild komprimieren oder Einheiten umrechnen mussen — Sie konnen es sofort ohne Hindernisse tun. Wir finanzieren unsere Plattform durch unaufdringliche Werbung, die Ihr Surferlebnis respektiert, damit Sie sich auf das Wesentliche konzentrieren konnen: Dinge erledigen.',
        ],
      },
      {
        id: 'why-143-tools',
        heading: 'Warum uber 143 Kostenlose Tools',
        paragraphs: [
          'Wir haben ToolKit Online als Allround-Ziel fur die am haufigsten genutzten Hilfsmittel konzipiert. Statt Dutzende verschiedener Websites fur verschiedene Aufgaben zu bookmarken, finden Sie alles, was Sie brauchen, an einem Ort. Unsere Werkzeuge sind in sieben sorgfaltig zusammengestellte Kategorien organisiert:',
          'Finanzen — MwSt.-Rechner, Kreditrechner, Hypothekentools, Rechnungsgeneratoren, Investitionsrechner und mehr. Text — Wortzahler, Markdown-Vorschau, Grammatikprufer, Text-zu-Sprache, Lebenslauf-Ersteller und Notiztools. Gesundheit — BMI-Rechner, Kalorienzahler, Schlafrechner, Tempoberechner und Atemubungen. Konvertierung — Einheitenumrechner, PDF-Tools, Bild-zu-Text, CSV zu JSON und Kodierungs-/Dekodierungstools. Entwickler — JSON-Formatierer, Regex-Tester, Farbwahler, QR-Code-Generatoren, Hash-Generatoren und Geschwindigkeitstests. Mathematik — Wissenschaftliche Taschenrechner, Diagramm-Ersteller, Wahrscheinlichkeitstools, Notenrechner und Matrixoperationen. Bilder — Fotoeditoren, Bildkompressoren, Hintergrundentferner, Meme-Generatoren und Pixel-Art-Ersteller.',
          'Jedes Werkzeug ist darauf ausgelegt, ein spezifisches Problem schnell und effizient zu losen. Wir erweitern unsere Sammlung kontinuierlich basierend auf Benutzeranfragen, Suchdaten und aufkommenden Bedurfnissen und fugen jeden Monat neue Werkzeuge hinzu, um ToolKit Online relevant und umfassend zu halten.',
        ],
      },
      {
        id: 'technology',
        heading: 'Unser Technologie-Stack',
        paragraphs: [
          'ToolKit Online ist mit modernen, bewahrten Webtechnologien gebaut, um die schnellste und zuverlassigste Erfahrung zu liefern. Unsere Plattform lauft auf Next.js und React und nutzt serverseitiges Rendering und statische Generierung fur blitzschnelle Seitenladezeiten und exzellente Suchmaschinenoptimierung. Das gesamte Frontend ist mit TypeScript fur Typsicherheit und Tailwind CSS fur ein responsives Design entwickelt, das auf jedem Gerat einwandfrei funktioniert — von Smartphones bis zu Ultra-Wide-Desktop-Monitoren.',
          'Jedes Werkzeug verarbeitet Daten vollstandig clientseitig, was bedeutet, dass Ihre Informationen niemals Ihren Browser verlassen und niemals unsere Server beruhren. Diese Architektur eliminiert Server-Roundtrips, liefert sofortige Ergebnisse und bietet eine inharente Schicht des Datenschutzes. Wir deployen auf Vercel mit globaler CDN-Verteilung und garantieren schnelle Ladezeiten von jedem Standort der Welt. Unsere Progressive Web App (PWA) Unterstutzung ermoglicht es Ihnen, ToolKit Online auf Ihrem Gerat zu installieren, um offline auf Ihre Lieblingswerkzeuge zuzugreifen.',
          'Leistung ist eine grundlegende Prioritat. Wir optimieren jede Seite fur Core Web Vitals, implementieren Lazy Loading fur schwere Komponenten und minimieren JavaScript-Bundles, um die schnellstmogliche Erfahrung auch bei langsameren Verbindungen zu gewahrleisten. Unsere Infrastruktur ist so konzipiert, dass sie muhelos skaliert und Verkehrsspitzen ohne Leistungseinbussen bewaltigt.',
        ],
      },
      {
        id: 'privacy',
        heading: 'Datenschutz und Vertrauen',
        paragraphs: [
          'Datenschutz ist bei ToolKit Online kein nachtruglicher Gedanke — er ist ein grundlegendes Prinzip. Alle unsere Werkzeuge laufen vollstandig in Ihrem Browser. Die Daten, die Sie in irgendeinen Rechner, Umrechner oder Editor eingeben, werden lokal auf Ihrem Gerat verarbeitet und niemals an unsere Server gesendet. Wir sammeln, speichern oder haben Zugriff auf keine personlichen Daten, die Sie in unseren Werkzeugen verwenden.',
          'Wir sind vollstandig konform mit der Datenschutz-Grundverordnung (DSGVO) der EU und implementieren Google Consent Mode v2. Analytics- und Werbe-Cookies werden nur nach Ihrer ausdrucklichen Zustimmung uber unser Cookie-Consent-Banner aktiviert. Sie konnen Ihre Praferenzen jederzeit uber den Link Cookie-Einstellungen in der Fusszeile verwalten. Wir verwenden HTTPS-Verschlusselung fur alle Verbindungen und befolgen Sicherheits-Best-Practices in unserer gesamten Infrastruktur.',
          'Unser Engagement fur Transparenz bedeutet, dass wir klar erklaren, welche Daten wir sammeln (nur anonyme, aggregierte Nutzungsstatistiken zur Verbesserung unseres Dienstes) und welche wir nicht sammeln (keine personlichen Daten aus der Werkzeugnutzung). Wir glauben, dass Vertrauen durch Taten verdient wird, nicht durch Worte, und unsere datenschutzorientierte Architektur demonstriert dieses Engagement jedes Mal, wenn Sie eines unserer Werkzeuge nutzen.',
        ],
      },
      {
        id: 'contact',
        heading: 'Kontaktieren Sie Uns',
        paragraphs: [
          'Wir horen gerne von unseren Nutzern — Ihr Feedback gestaltet direkt die Zukunft von ToolKit Online. Ob Sie einen Vorschlag fur ein neues Werkzeug haben, ein Problem melden mochten, eine Frage zur Funktionalitat haben oder einfach Ihre Erfahrung teilen mochten — wir freuen uns immer, von Ihnen zu horen.',
          'Ihre Ideen haben uns bereits geholfen, von einem kleinen personlichen Projekt zu einer Plattform mit uber 143 Werkzeugen und 900+ Seiten in sechs Sprachen zu wachsen. Wir prufen jede Nachricht und bemuhen uns, so schnell wie moglich zu antworten. Wenn Sie eine Werkzeuganfrage haben, stehen die Chancen gut, dass sie in unsere Entwicklungs-Roadmap aufgenommen wird.',
        ],
      },
    ],
    categoryLinks: [
      { label: 'Finanz-Tools', href: '/#finance' },
      { label: 'Text-Tools', href: '/#text' },
      { label: 'Gesundheits-Tools', href: '/#health' },
      { label: 'Entwickler-Tools', href: '/#dev' },
      { label: 'Mathe-Tools', href: '/#math' },
      { label: 'Konvertierungs-Tools', href: '/#conversion' },
      { label: 'Bild-Tools', href: '/#images' },
    ],
    contactCta: 'Schreiben Sie uns an',
    contactEmail: 'info@toolkitonline.vip',
  },

  pt: {
    title: 'Sobre o ToolKit Online',
    subtitle: 'Ferramentas online gratuitas e focadas em privacidade, usadas por milhares de utilizadores em todo o mundo.',
    stats: [
      { label: 'Ferramentas Gratis', value: '143+' },
      { label: 'Idiomas', value: '6' },
      { label: 'Paginas', value: '900+' },
      { label: 'Custo', value: '100% Gratis' },
    ],
    sections: [
      {
        id: 'who-we-are',
        heading: 'Quem Somos',
        paragraphs: [
          'O ToolKit Online e uma plataforma web independente fundada em 2024 com um proposito claro: fornecer ferramentas digitais gratuitas e de alta qualidade que qualquer pessoa possa usar sem barreiras. Somos uma equipa de desenvolvedores, designers e entusiastas de produtividade que acreditam que utilitarios essenciais — desde calculadoras financeiras a editores de imagens — devem ser acessiveis a todos, independentemente do orcamento ou competencia tecnica.',
          'O nosso projeto comecou como uma iniciativa pessoal para resolver problemas do quotidiano de forma rapida e eficiente. O que comecou como uma pequena colecao de calculadoras e conversores tornou-se numa plataforma abrangente com mais de 143 ferramentas em sete categorias, servindo milhares de utilizadores em seis idiomas. Cada ferramenta que construimos e moldada pelo feedback real dos utilizadores, tornando o ToolKit Online um recurso verdadeiramente impulsionado pela comunidade que evolui para satisfazer as necessidades de estudantes, profissionais, desenvolvedores e pequenos empresarios em todo o mundo.',
          'Operamos a partir da Uniao Europeia e estamos comprometidos com o pleno cumprimento do RGPD e de todas as regulamentacoes de privacidade aplicaveis. A nossa equipa traz anos de experiencia em desenvolvimento web, design de experiencia do utilizador e otimizacao para motores de busca, garantindo que cada ferramenta seja nao so funcional mas tambem rapida, intuitiva e facil de encontrar.',
        ],
      },
      {
        id: 'our-mission',
        heading: 'A Nossa Missao',
        paragraphs: [
          'A nossa missao e simples: capacitar as pessoas com ferramentas online gratuitas, confiaveis e respeitadoras da privacidade. Acreditamos que a internet deve facilitar a vida, nao complica-la. Demasiados sites de utilidades estao repletos de publicidade intrusiva, paywalls ocultos ou exigem registos desnecessarios antes de poder usar uma simples calculadora ou conversor.',
          'O ToolKit Online adota uma abordagem diferente. Cada uma das nossas 143+ ferramentas e completamente gratuita, nao requer registo e processa os seus dados inteiramente no seu navegador. Nao ha niveis premium, periodos de teste nem funcionalidades bloqueadas. Quer precise de calcular uma prestacao hipotecaria, formatar codigo JSON, comprimir uma imagem ou converter unidades, pode faze-lo instantaneamente sem obstaculos. Sustentamos a nossa plataforma atraves de publicidade nao intrusiva que respeita a sua experiencia de navegacao, para que se possa concentrar no que importa: realizar as suas tarefas.',
        ],
      },
      {
        id: 'why-143-tools',
        heading: 'Porque mais de 143 Ferramentas Gratuitas',
        paragraphs: [
          'Concebemos o ToolKit Online como um destino unico para os utilitarios que as pessoas mais utilizam. Em vez de guardar dezenas de sites diferentes para diferentes tarefas, pode encontrar tudo o que precisa num so lugar. As nossas ferramentas estao organizadas em sete categorias cuidadosamente selecionadas:',
          'Financas — Calculadoras de IVA, calculadoras de emprestimos, ferramentas hipotecarias, geradores de faturas, calculadoras de investimento e mais. Texto — Contadores de palavras, pre-visualizacao markdown, corretores gramaticais, texto para fala, criadores de curriculo e ferramentas de notas. Saude — Calculadoras de IMC, rastreadores de calorias, calculadoras de sono, calculadoras de ritmo e exercicios de respiracao. Conversao — Conversores de unidades, ferramentas PDF, imagem para texto, CSV para JSON e utilitarios de codificacao/descodificacao. Desenvolvedor — Formatadores JSON, testadores de regex, seletores de cores, geradores de codigos QR, geradores de hash e testes de velocidade. Matematica — Calculadoras cientificas, criadores de graficos, ferramentas de probabilidade, calculadoras de notas e operacoes com matrizes. Imagens — Editores de fotos, compressores de imagens, removedores de fundo, geradores de memes e criadores de pixel art.',
          'Cada ferramenta e concebida para resolver um problema especifico de forma rapida e eficiente. Expandimos continuamente a nossa colecao com base nos pedidos dos utilizadores, dados de pesquisa e necessidades emergentes, adicionando novas ferramentas todos os meses para manter o ToolKit Online relevante e abrangente.',
        ],
      },
      {
        id: 'technology',
        heading: 'O Nosso Stack Tecnologico',
        paragraphs: [
          'O ToolKit Online e construido com tecnologias web modernas e comprovadas para oferecer a experiencia mais rapida e confiavel possivel. A nossa plataforma funciona em Next.js e React, aproveitando a renderizacao do lado do servidor e a geracao estatica para carregamentos ultra-rapidos e excelente otimizacao para motores de busca. Todo o frontend e desenvolvido com TypeScript para seguranca de tipos e Tailwind CSS para um design responsivo que funciona perfeitamente em qualquer dispositivo, desde smartphones a monitores de desktop ultra-wide.',
          'Cada ferramenta processa dados inteiramente do lado do cliente, o que significa que as suas informacoes nunca saem do seu navegador e nunca tocam os nossos servidores. Esta arquitetura elimina viagens de ida e volta ao servidor, fornece resultados instantaneos e oferece uma camada inerente de protecao de privacidade. Fazemos deploy no Vercel com distribuicao CDN global, garantindo tempos de carregamento rapidos de qualquer localizacao no mundo. O nosso suporte Progressive Web App (PWA) permite-lhe instalar o ToolKit Online no seu dispositivo para acesso offline as suas ferramentas favoritas.',
          'O desempenho e uma prioridade fundamental. Otimizamos cada pagina para Core Web Vitals, implementamos carregamento diferido para componentes pesados e minimizamos os bundles JavaScript para garantir a experiencia mais rapida possivel mesmo em conexoes mais lentas. A nossa infraestrutura e projetada para escalar sem esforco, lidando com picos de trafego sem degradacao.',
        ],
      },
      {
        id: 'privacy',
        heading: 'Privacidade e Confianca',
        paragraphs: [
          'A privacidade nao e um pensamento secundario no ToolKit Online — e um principio fundamental. Todas as nossas ferramentas funcionam inteiramente no seu navegador. Os dados que introduz em qualquer calculadora, conversor ou editor sao processados localmente no seu dispositivo e nunca sao enviados para os nossos servidores. Nao recolhemos, armazenamos nem temos acesso a quaisquer dados pessoais que utilize nas nossas ferramentas.',
          'Estamos totalmente em conformidade com o Regulamento Geral de Protecao de Dados (RGPD) da UE e implementamos o Google Consent Mode v2. Os cookies de analytics e publicidade so sao ativados apos o seu consentimento explicito atraves do nosso banner de cookies. Pode gerir as suas preferencias a qualquer momento atraves do link Configuracoes de Cookies no rodape. Utilizamos encriptacao HTTPS para todas as conexoes e seguimos as melhores praticas de seguranca em toda a nossa infraestrutura.',
          'O nosso compromisso com a transparencia significa que explicamos claramente que dados recolhemos (apenas estatisticas de utilizacao anonimas e agregadas para melhorar o nosso servico) e o que nao recolhemos (nenhum dado pessoal da utilizacao das ferramentas). Acreditamos que a confianca se conquista com acoes, nao com palavras, e a nossa arquitetura focada na privacidade demonstra esse compromisso cada vez que utiliza uma das nossas ferramentas.',
        ],
      },
      {
        id: 'contact',
        heading: 'Contacte-nos',
        paragraphs: [
          'Adoramos ouvir os nossos utilizadores — o vosso feedback molda diretamente o futuro do ToolKit Online. Quer tenha uma sugestao para uma nova ferramenta, queira reportar um problema, tenha uma questao sobre funcionalidade ou simplesmente queira partilhar a sua experiencia, estamos sempre felizes em ouvi-lo.',
          'As suas ideias ja nos ajudaram a crescer de um pequeno projeto pessoal para uma plataforma com mais de 143 ferramentas e 900+ paginas em seis idiomas. Analisamos cada mensagem e esforçamo-nos por responder o mais rapidamente possivel. Se tem um pedido de ferramenta, ha boas hipoteses de que entre na nossa roadmap de desenvolvimento.',
        ],
      },
    ],
    categoryLinks: [
      { label: 'Ferramentas Financas', href: '/#finance' },
      { label: 'Ferramentas Texto', href: '/#text' },
      { label: 'Ferramentas Saude', href: '/#health' },
      { label: 'Ferramentas Desenvolvedor', href: '/#dev' },
      { label: 'Ferramentas Matematica', href: '/#math' },
      { label: 'Ferramentas Conversao', href: '/#conversion' },
      { label: 'Ferramentas Imagens', href: '/#images' },
    ],
    contactCta: 'Envie-nos um email para',
    contactEmail: 'info@toolkitonline.vip',
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AboutPage() {
  const params = useParams();
  const lang = (params?.lang as Locale) || 'en';
  const t = translations[lang];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero / Header */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl text-white px-6 py-14 mb-10 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-white rounded-full translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">{t.title}</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">{t.subtitle}</p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        {t.stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1 font-medium">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Main Content Sections */}
      <article className="space-y-10">
        {t.sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="inline-block w-1.5 h-7 bg-blue-600 rounded-full" />
              {section.heading}
            </h2>
            <div className="space-y-4">
              {section.paragraphs.map((paragraph, pIdx) => (
                <p key={pIdx} className="text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Internal links in the contact section */}
            {section.id === 'contact' && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-gray-800 font-medium">
                  {t.contactCta}{' '}
                  <a
                    href={`mailto:${t.contactEmail}`}
                    className="text-blue-600 hover:text-blue-800 font-semibold underline"
                  >
                    {t.contactEmail}
                  </a>
                </p>
              </div>
            )}
          </section>
        ))}
      </article>

      {/* Category Links — internal linking for SEO */}
      <section className="mt-12 mb-4 bg-gray-50 border border-gray-200 rounded-xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {lang === 'it' ? 'Esplora i Nostri Strumenti' :
           lang === 'es' ? 'Explora Nuestras Herramientas' :
           lang === 'fr' ? 'Explorez Nos Outils' :
           lang === 'de' ? 'Entdecken Sie Unsere Tools' :
           lang === 'pt' ? 'Explore as Nossas Ferramentas' :
           'Explore Our Tools'}
        </h2>
        <div className="flex flex-wrap gap-3">
          {t.categoryLinks.map((link) => (
            <Link
              key={link.href}
              href={`/${lang}${link.href}`}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
