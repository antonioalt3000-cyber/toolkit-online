'use client';
import { useParams } from 'next/navigation';
import { type Locale } from '@/lib/translations';

const content: Record<Locale, { title: string; sections: { heading: string; body: string }[] }> = {
  en: {
    title: 'About ToolKit Online',
    sections: [
      {
        heading: 'Our Mission',
        body: 'ToolKit Online was born from a simple but powerful belief: essential digital tools should be free and accessible to everyone, everywhere. We are passionate about removing barriers to productivity, whether you are a student calculating a GPA, a developer formatting JSON, or a small business owner generating invoices. Our mission is to empower people with high-quality utilities that require no downloads, no sign-ups, and no hidden fees. We believe the internet should make life easier, and every tool we build reflects that commitment to simplicity and accessibility.',
      },
      {
        heading: 'What We Offer',
        body: 'ToolKit Online provides a comprehensive suite of over 143 free online tools organized across seven carefully curated categories: Finance (loan calculators, investment tools, invoice generators), Text (word counters, markdown preview, text-to-speech), Health (BMI calculator, calorie tracker, sleep calculator), Conversion (unit converter, CSV to JSON, PDF tools), Developer (JSON formatter, regex tester, QR code generator), Math (scientific calculator, chart maker, probability tools), and Images (photo editor, image compressor, background remover). Each tool is designed with a clean, intuitive interface so you can get results in seconds without any learning curve. We continuously expand our collection based on user feedback and emerging needs, adding new tools every month to ensure we cover the utilities you rely on most.',
      },
      {
        heading: 'Our Story',
        body: 'ToolKit Online started in 2024 as a small project with just a handful of calculators and converters. What began as a personal endeavor to solve everyday problems quickly grew into something much bigger. As users discovered our tools and shared them with friends and colleagues, we realized there was a massive demand for reliable, ad-light, free utilities on the web. Driven by community feedback and a passion for building useful software, we expanded rapidly from a dozen tools to over 143, spanning seven distinct categories. Every feature we have added has been shaped by real user requests, making ToolKit Online a truly community-driven platform that evolves with the needs of its users.',
      },
      {
        heading: 'Privacy & Security',
        body: 'Your privacy is at the core of everything we do. All ToolKit Online tools process data entirely client-side, meaning your information never leaves your browser. We do not collect, store, or transmit any personal data you enter into our tools — whether it is financial figures, health metrics, or personal text. Our site is fully compliant with GDPR and international privacy regulations. The only analytics we use are anonymous, aggregated usage statistics through Google Analytics, solely to help us understand which tools are most popular and where we can improve. You can use every tool with complete confidence that your data remains yours and yours alone.',
      },
      {
        heading: 'Our Technology',
        body: 'ToolKit Online is built with cutting-edge web technologies to deliver the fastest, most reliable experience possible. Our platform runs on Next.js and React, leveraging server-side rendering for lightning-fast page loads and optimal SEO. The entire frontend is crafted with TypeScript for type safety and Tailwind CSS for a responsive, modern design that looks great on any device — from smartphones to ultra-wide monitors. Every tool is optimized for performance, with client-side processing that eliminates server round-trips and delivers instant results. We deploy on Vercel for global CDN distribution, ensuring fast load times no matter where you are in the world.',
      },
      {
        heading: 'Always Free',
        body: 'ToolKit Online is completely free to use, and it always will be. There are no paywalls, no premium tiers, no trial periods, and no hidden costs. We sustain our platform through non-intrusive advertising that respects your browsing experience. We made a deliberate choice to keep every single tool accessible to everyone, because we believe useful software should not be locked behind a subscription. Whether you use one tool or all 143, you will never be asked to pay a cent.',
      },
      {
        heading: 'Available Worldwide',
        body: 'We believe great tools should speak your language. ToolKit Online is fully available in six languages: English, Italian, Spanish, French, German, and Portuguese, covering billions of potential users across the globe. Every tool, every description, and every interface element is carefully translated to provide a native experience in each language. Our global infrastructure ensures fast load times from any location, and we are always exploring the addition of more languages based on user demand. No matter where you are, ToolKit Online is designed to feel like it was built just for you.',
      },
      {
        heading: 'Get in Touch',
        body: 'We love hearing from our users and your feedback directly shapes the future of ToolKit Online. Whether you have a suggestion for a new tool, want to report a bug, have a question about how something works, or simply want to share your experience, we are always happy to listen. Reach out to us at info@toolkitonline.vip and we will get back to you as quickly as possible. Your ideas have already helped us grow from a small project to a platform with over 143 tools, and we cannot wait to hear what you think we should build next.',
      },
    ],
  },
  it: {
    title: 'Chi Siamo — ToolKit Online',
    sections: [
      {
        heading: 'La Nostra Missione',
        body: 'ToolKit Online nasce da una convinzione semplice ma potente: gli strumenti digitali essenziali devono essere gratuiti e accessibili a tutti, ovunque. Siamo appassionati nel rimuovere le barriere alla produttività, che tu sia uno studente che calcola la media, uno sviluppatore che formatta JSON o un piccolo imprenditore che genera fatture. La nostra missione è dare alle persone utilità di alta qualità che non richiedono download, registrazioni o costi nascosti. Crediamo che internet debba rendere la vita più semplice, e ogni strumento che costruiamo riflette questo impegno verso la semplicità e l\'accessibilità.',
      },
      {
        heading: 'Cosa Offriamo',
        body: 'ToolKit Online offre una suite completa di oltre 143 strumenti online gratuiti organizzati in sette categorie curate: Finanza (calcolatori di prestiti, strumenti di investimento, generatori di fatture), Testo (contatore di parole, anteprima markdown, text-to-speech), Salute (calcolatore BMI, contatore calorie, calcolatore del sonno), Conversione (convertitore di unità, CSV in JSON, strumenti PDF), Sviluppatore (formattatore JSON, tester regex, generatore codici QR), Matematica (calcolatrice scientifica, creatore grafici, strumenti di probabilità) e Immagini (editor foto, compressore immagini, rimozione sfondo). Ogni strumento è progettato con un\'interfaccia pulita e intuitiva per ottenere risultati in pochi secondi. Espandiamo continuamente la nostra collezione sulla base del feedback degli utenti, aggiungendo nuovi strumenti ogni mese.',
      },
      {
        heading: 'La Nostra Storia',
        body: 'ToolKit Online è nato nel 2024 come un piccolo progetto con pochi calcolatori e convertitori. Quello che era iniziato come un progetto personale per risolvere problemi quotidiani è cresciuto rapidamente in qualcosa di molto più grande. Man mano che gli utenti scoprivano i nostri strumenti e li condividevano con amici e colleghi, ci siamo resi conto dell\'enorme domanda di utilità gratuite, affidabili e leggere sul web. Guidati dal feedback della community e dalla passione per il software utile, siamo cresciuti rapidamente da una dozzina di strumenti a oltre 143, coprendo sette categorie distinte. Ogni funzionalità aggiunta è stata plasmata da richieste reali degli utenti, rendendo ToolKit Online una piattaforma veramente guidata dalla community.',
      },
      {
        heading: 'Privacy e Sicurezza',
        body: 'La tua privacy è al centro di tutto ciò che facciamo. Tutti gli strumenti di ToolKit Online elaborano i dati interamente lato client, il che significa che le tue informazioni non lasciano mai il tuo browser. Non raccogliamo, memorizziamo o trasmettiamo alcun dato personale che inserisci nei nostri strumenti — che si tratti di dati finanziari, metriche sulla salute o testi personali. Il nostro sito è pienamente conforme al GDPR e alle normative internazionali sulla privacy. Le uniche analytics che utilizziamo sono statistiche di utilizzo anonime e aggregate tramite Google Analytics, esclusivamente per capire quali strumenti sono più popolari e dove possiamo migliorare. Puoi utilizzare ogni strumento con la completa certezza che i tuoi dati restano solo tuoi.',
      },
      {
        heading: 'La Nostra Tecnologia',
        body: 'ToolKit Online è costruito con tecnologie web all\'avanguardia per offrire l\'esperienza più veloce e affidabile possibile. La nostra piattaforma funziona su Next.js e React, sfruttando il rendering lato server per caricamenti ultra-rapidi e SEO ottimale. L\'intero frontend è sviluppato con TypeScript per la sicurezza dei tipi e Tailwind CSS per un design responsivo e moderno che appare perfetto su qualsiasi dispositivo — dagli smartphone ai monitor ultra-wide. Ogni strumento è ottimizzato per le prestazioni, con elaborazione lato client che elimina i round-trip al server e fornisce risultati istantanei. Deployamo su Vercel per la distribuzione CDN globale, garantendo tempi di caricamento rapidi ovunque tu sia nel mondo.',
      },
      {
        heading: 'Sempre Gratuito',
        body: 'ToolKit Online è completamente gratuito e lo sarà sempre. Non ci sono paywall, livelli premium, periodi di prova o costi nascosti. Sosteniamo la nostra piattaforma attraverso pubblicità non invasiva che rispetta la tua esperienza di navigazione. Abbiamo fatto la scelta deliberata di mantenere ogni singolo strumento accessibile a tutti, perché crediamo che il software utile non debba essere bloccato dietro un abbonamento. Che tu usi uno strumento o tutti e 143, non ti verrà mai chiesto di pagare un centesimo.',
      },
      {
        heading: 'Disponibile in Tutto il Mondo',
        body: 'Crediamo che i grandi strumenti debbano parlare la tua lingua. ToolKit Online è completamente disponibile in sei lingue: inglese, italiano, spagnolo, francese, tedesco e portoghese, coprendo miliardi di potenziali utenti in tutto il mondo. Ogni strumento, ogni descrizione e ogni elemento dell\'interfaccia è accuratamente tradotto per offrire un\'esperienza nativa in ogni lingua. La nostra infrastruttura globale garantisce tempi di caricamento rapidi da qualsiasi posizione, e stiamo sempre valutando l\'aggiunta di altre lingue in base alla domanda degli utenti. Ovunque tu sia, ToolKit Online è progettato per sembrare fatto su misura per te.',
      },
      {
        heading: 'Contattaci',
        body: 'Amiamo ascoltare i nostri utenti e il vostro feedback plasma direttamente il futuro di ToolKit Online. Che tu abbia un suggerimento per un nuovo strumento, voglia segnalare un bug, abbia una domanda su come funziona qualcosa o semplicemente voglia condividere la tua esperienza, siamo sempre felici di ascoltarti. Scrivici a info@toolkitonline.vip e ti risponderemo il prima possibile. Le vostre idee ci hanno già aiutato a crescere da un piccolo progetto a una piattaforma con oltre 143 strumenti, e non vediamo l\'ora di scoprire cosa pensate dovremmo costruire dopo.',
      },
    ],
  },
  es: {
    title: 'Acerca de ToolKit Online',
    sections: [
      {
        heading: 'Nuestra Misión',
        body: 'ToolKit Online nació de una creencia simple pero poderosa: las herramientas digitales esenciales deben ser gratuitas y accesibles para todos, en todas partes. Nos apasiona eliminar las barreras a la productividad, ya seas un estudiante calculando promedios, un desarrollador formateando JSON o un pequeño empresario generando facturas. Nuestra misión es empoderar a las personas con utilidades de alta calidad que no requieren descargas, registros ni costos ocultos. Creemos que internet debe facilitar la vida, y cada herramienta que construimos refleja ese compromiso con la simplicidad y la accesibilidad.',
      },
      {
        heading: 'Lo que Ofrecemos',
        body: 'ToolKit Online proporciona un conjunto completo de más de 143 herramientas online gratuitas organizadas en siete categorías cuidadosamente curadas: Finanzas (calculadoras de préstamos, herramientas de inversión, generadores de facturas), Texto (contador de palabras, vista previa markdown, texto a voz), Salud (calculadora de IMC, contador de calorías, calculadora de sueño), Conversión (convertidor de unidades, CSV a JSON, herramientas PDF), Desarrollador (formateador JSON, tester de regex, generador de códigos QR), Matemáticas (calculadora científica, creador de gráficos, herramientas de probabilidad) e Imágenes (editor de fotos, compresor de imágenes, eliminador de fondos). Cada herramienta está diseñada con una interfaz limpia e intuitiva para que obtengas resultados en segundos. Expandimos continuamente nuestra colección basándonos en los comentarios de los usuarios, añadiendo nuevas herramientas cada mes.',
      },
      {
        heading: 'Nuestra Historia',
        body: 'ToolKit Online comenzó en 2024 como un pequeño proyecto con solo un puñado de calculadoras y convertidores. Lo que empezó como un proyecto personal para resolver problemas cotidianos creció rápidamente en algo mucho más grande. A medida que los usuarios descubrían nuestras herramientas y las compartían con amigos y colegas, nos dimos cuenta de la enorme demanda de utilidades gratuitas, confiables y ligeras en la web. Impulsados por los comentarios de la comunidad y la pasión por construir software útil, crecimos rápidamente de una docena de herramientas a más de 143, abarcando siete categorías distintas. Cada función que hemos añadido ha sido moldeada por solicitudes reales de usuarios, haciendo de ToolKit Online una plataforma verdaderamente impulsada por la comunidad.',
      },
      {
        heading: 'Privacidad y Seguridad',
        body: 'Tu privacidad está en el centro de todo lo que hacemos. Todas las herramientas de ToolKit Online procesan datos completamente en el lado del cliente, lo que significa que tu información nunca sale de tu navegador. No recopilamos, almacenamos ni transmitimos ningún dato personal que introduzcas en nuestras herramientas, ya sean cifras financieras, métricas de salud o textos personales. Nuestro sitio cumple totalmente con el RGPD y las regulaciones internacionales de privacidad. Las únicas analíticas que utilizamos son estadísticas de uso anónimas y agregadas a través de Google Analytics, exclusivamente para entender qué herramientas son más populares y dónde podemos mejorar. Puedes usar cada herramienta con la total confianza de que tus datos permanecen solo tuyos.',
      },
      {
        heading: 'Nuestra Tecnología',
        body: 'ToolKit Online está construido con tecnologías web de vanguardia para ofrecer la experiencia más rápida y confiable posible. Nuestra plataforma funciona sobre Next.js y React, aprovechando el renderizado del lado del servidor para cargas ultrarrápidas y SEO óptimo. Todo el frontend está desarrollado con TypeScript para seguridad de tipos y Tailwind CSS para un diseño responsivo y moderno que se ve perfecto en cualquier dispositivo, desde smartphones hasta monitores ultraanchos. Cada herramienta está optimizada para el rendimiento, con procesamiento del lado del cliente que elimina las consultas al servidor y entrega resultados instantáneos. Desplegamos en Vercel para distribución CDN global, asegurando tiempos de carga rápidos sin importar dónde te encuentres.',
      },
      {
        heading: 'Siempre Gratis',
        body: 'ToolKit Online es completamente gratuito y siempre lo será. No hay muros de pago, niveles premium, períodos de prueba ni costos ocultos. Sostenemos nuestra plataforma a través de publicidad no intrusiva que respeta tu experiencia de navegación. Tomamos la decisión deliberada de mantener cada herramienta accesible para todos, porque creemos que el software útil no debe estar bloqueado detrás de una suscripción. Ya uses una herramienta o las 143, nunca se te pedirá que pagues un centavo.',
      },
      {
        heading: 'Disponible en Todo el Mundo',
        body: 'Creemos que las grandes herramientas deben hablar tu idioma. ToolKit Online está completamente disponible en seis idiomas: inglés, italiano, español, francés, alemán y portugués, cubriendo miles de millones de usuarios potenciales en todo el mundo. Cada herramienta, cada descripción y cada elemento de la interfaz está cuidadosamente traducido para proporcionar una experiencia nativa en cada idioma. Nuestra infraestructura global asegura tiempos de carga rápidos desde cualquier ubicación, y siempre estamos explorando la adición de más idiomas según la demanda de los usuarios. Sin importar dónde estés, ToolKit Online está diseñado para sentirse como si hubiera sido creado solo para ti.',
      },
      {
        heading: 'Ponte en Contacto',
        body: 'Nos encanta escuchar a nuestros usuarios y sus comentarios moldean directamente el futuro de ToolKit Online. Ya sea que tengas una sugerencia para una nueva herramienta, quieras reportar un error, tengas una pregunta sobre cómo funciona algo o simplemente quieras compartir tu experiencia, siempre estamos felices de escucharte. Escríbenos a info@toolkitonline.vip y te responderemos lo antes posible. Tus ideas ya nos han ayudado a crecer de un pequeño proyecto a una plataforma con más de 143 herramientas, y estamos ansiosos por saber qué crees que deberíamos construir a continuación.',
      },
    ],
  },
  fr: {
    title: 'A Propos de ToolKit Online',
    sections: [
      {
        heading: 'Notre Mission',
        body: 'ToolKit Online est né d\'une conviction simple mais puissante : les outils numériques essentiels doivent être gratuits et accessibles à tous, partout. Nous sommes passionnés par la suppression des obstacles à la productivité, que vous soyez un étudiant calculant sa moyenne, un développeur formatant du JSON ou un petit entrepreneur générant des factures. Notre mission est de donner aux gens des utilitaires de haute qualité qui ne nécessitent aucun téléchargement, aucune inscription et aucun frais caché. Nous croyons qu\'internet doit simplifier la vie, et chaque outil que nous construisons reflète cet engagement envers la simplicité et l\'accessibilité.',
      },
      {
        heading: 'Ce que Nous Offrons',
        body: 'ToolKit Online propose une suite complète de plus de 143 outils en ligne gratuits organisés en sept catégories soigneusement sélectionnées : Finance (calculatrices de prêts, outils d\'investissement, générateurs de factures), Texte (compteur de mots, aperçu markdown, synthèse vocale), Santé (calculateur d\'IMC, compteur de calories, calculateur de sommeil), Conversion (convertisseur d\'unités, CSV vers JSON, outils PDF), Développeur (formateur JSON, testeur de regex, générateur de codes QR), Mathématiques (calculatrice scientifique, créateur de graphiques, outils de probabilité) et Images (éditeur photo, compresseur d\'images, suppresseur d\'arrière-plan). Chaque outil est conçu avec une interface propre et intuitive pour obtenir des résultats en quelques secondes. Nous élargissons continuellement notre collection en fonction des retours des utilisateurs, ajoutant de nouveaux outils chaque mois.',
      },
      {
        heading: 'Notre Histoire',
        body: 'ToolKit Online a démarré en 2024 comme un petit projet avec seulement une poignée de calculatrices et de convertisseurs. Ce qui avait commencé comme un projet personnel pour résoudre des problèmes quotidiens s\'est rapidement transformé en quelque chose de bien plus grand. Au fur et à mesure que les utilisateurs découvraient nos outils et les partageaient avec leurs amis et collègues, nous avons réalisé l\'immense demande pour des utilitaires gratuits, fiables et légers sur le web. Portés par les retours de la communauté et la passion de créer des logiciels utiles, nous sommes passés rapidement d\'une douzaine d\'outils à plus de 143, couvrant sept catégories distinctes. Chaque fonctionnalité ajoutée a été façonnée par de vraies demandes d\'utilisateurs, faisant de ToolKit Online une plateforme véritablement guidée par sa communauté.',
      },
      {
        heading: 'Confidentialité et Sécurité',
        body: 'Votre vie privée est au coeur de tout ce que nous faisons. Tous les outils de ToolKit Online traitent les données entièrement côté client, ce qui signifie que vos informations ne quittent jamais votre navigateur. Nous ne collectons, ne stockons ni ne transmettons aucune donnée personnelle que vous saisissez dans nos outils, qu\'il s\'agisse de chiffres financiers, de métriques de santé ou de textes personnels. Notre site est entièrement conforme au RGPD et aux réglementations internationales sur la vie privée. Les seules analyses que nous utilisons sont des statistiques d\'utilisation anonymes et agrégées via Google Analytics, uniquement pour comprendre quels outils sont les plus populaires et où nous pouvons nous améliorer. Vous pouvez utiliser chaque outil en toute confiance, sachant que vos données restent les vôtres.',
      },
      {
        heading: 'Notre Technologie',
        body: 'ToolKit Online est construit avec des technologies web de pointe pour offrir l\'expérience la plus rapide et la plus fiable possible. Notre plateforme fonctionne sur Next.js et React, exploitant le rendu côté serveur pour des chargements ultra-rapides et un SEO optimal. L\'ensemble du frontend est développé avec TypeScript pour la sûreté des types et Tailwind CSS pour un design responsive et moderne qui s\'affiche parfaitement sur tout appareil, des smartphones aux écrans ultra-larges. Chaque outil est optimisé pour la performance, avec un traitement côté client qui élimine les allers-retours serveur et fournit des résultats instantanés. Nous déployons sur Vercel pour une distribution CDN mondiale, garantissant des temps de chargement rapides où que vous soyez.',
      },
      {
        heading: 'Toujours Gratuit',
        body: 'ToolKit Online est entièrement gratuit et le restera toujours. Il n\'y a pas de paywall, pas de niveau premium, pas de période d\'essai et pas de coûts cachés. Nous soutenons notre plateforme grâce à une publicité non intrusive qui respecte votre expérience de navigation. Nous avons fait le choix délibéré de garder chaque outil accessible à tous, car nous croyons que les logiciels utiles ne doivent pas être verrouillés derrière un abonnement. Que vous utilisiez un outil ou les 143, on ne vous demandera jamais de payer quoi que ce soit.',
      },
      {
        heading: 'Disponible dans le Monde Entier',
        body: 'Nous croyons que les grands outils doivent parler votre langue. ToolKit Online est entièrement disponible en six langues : anglais, italien, espagnol, français, allemand et portugais, couvrant des milliards d\'utilisateurs potentiels à travers le monde. Chaque outil, chaque description et chaque élément d\'interface est soigneusement traduit pour offrir une expérience native dans chaque langue. Notre infrastructure mondiale garantit des temps de chargement rapides depuis n\'importe quel endroit, et nous explorons constamment l\'ajout de nouvelles langues en fonction de la demande des utilisateurs. Où que vous soyez, ToolKit Online est conçu pour vous donner l\'impression d\'avoir été créé juste pour vous.',
      },
      {
        heading: 'Contactez-nous',
        body: 'Nous adorons entendre nos utilisateurs et vos retours façonnent directement l\'avenir de ToolKit Online. Que vous ayez une suggestion pour un nouvel outil, souhaitiez signaler un bug, ayez une question sur le fonctionnement de quelque chose ou vouliez simplement partager votre expérience, nous sommes toujours heureux de vous écouter. Contactez-nous à info@toolkitonline.vip et nous vous répondrons dans les plus brefs délais. Vos idées nous ont déjà aidés à passer d\'un petit projet à une plateforme de plus de 143 outils, et nous avons hâte de découvrir ce que vous pensez que nous devrions construire ensuite.',
      },
    ],
  },
  de: {
    title: 'Uber ToolKit Online',
    sections: [
      {
        heading: 'Unsere Mission',
        body: 'ToolKit Online entstand aus einer einfachen, aber kraftvollen Überzeugung: Wesentliche digitale Werkzeuge sollten für alle kostenlos und zugänglich sein, überall. Wir sind leidenschaftlich daran interessiert, Produktivitätsbarrieren zu beseitigen, egal ob Sie ein Student sind, der seinen Notendurchschnitt berechnet, ein Entwickler, der JSON formatiert, oder ein Kleinunternehmer, der Rechnungen erstellt. Unsere Mission ist es, Menschen mit hochwertigen Hilfsmitteln auszustatten, die keine Downloads, keine Registrierungen und keine versteckten Kosten erfordern. Wir glauben, dass das Internet das Leben einfacher machen sollte, und jedes Werkzeug, das wir bauen, spiegelt dieses Engagement für Einfachheit und Zugänglichkeit wider.',
      },
      {
        heading: 'Was Wir Bieten',
        body: 'ToolKit Online bietet eine umfassende Suite von über 143 kostenlosen Online-Werkzeugen, organisiert in sieben sorgfältig zusammengestellten Kategorien: Finanzen (Kreditrechner, Investitionstools, Rechnungsgeneratoren), Text (Wortzähler, Markdown-Vorschau, Text-zu-Sprache), Gesundheit (BMI-Rechner, Kalorienzähler, Schlafrechner), Konvertierung (Einheitenumrechner, CSV zu JSON, PDF-Tools), Entwickler (JSON-Formatierer, Regex-Tester, QR-Code-Generator), Mathematik (wissenschaftlicher Taschenrechner, Diagramm-Ersteller, Wahrscheinlichkeitstools) und Bilder (Fotoeditor, Bildkompressor, Hintergrundentferner). Jedes Werkzeug ist mit einer sauberen, intuitiven Oberfläche gestaltet, damit Sie in Sekunden Ergebnisse erhalten. Wir erweitern unsere Sammlung kontinuierlich basierend auf Benutzerfeedback und fügen jeden Monat neue Werkzeuge hinzu.',
      },
      {
        heading: 'Unsere Geschichte',
        body: 'ToolKit Online begann 2024 als kleines Projekt mit nur einer Handvoll Rechnern und Umrechnern. Was als persönliches Projekt zur Lösung alltäglicher Probleme begann, wuchs schnell zu etwas viel Größerem heran. Als Nutzer unsere Werkzeuge entdeckten und sie mit Freunden und Kollegen teilten, erkannten wir die enorme Nachfrage nach zuverlässigen, werbe-leichten, kostenlosen Hilfsmitteln im Web. Angetrieben vom Feedback der Community und der Leidenschaft für nützliche Software sind wir schnell von einem Dutzend Werkzeugen auf über 143 gewachsen, die sieben verschiedene Kategorien abdecken. Jede Funktion, die wir hinzugefügt haben, wurde durch echte Benutzeranfragen geformt, wodurch ToolKit Online zu einer wirklich von der Community getriebenen Plattform geworden ist.',
      },
      {
        heading: 'Datenschutz und Sicherheit',
        body: 'Ihre Privatsphäre steht im Mittelpunkt von allem, was wir tun. Alle Werkzeuge von ToolKit Online verarbeiten Daten vollständig clientseitig, was bedeutet, dass Ihre Informationen niemals Ihren Browser verlassen. Wir sammeln, speichern oder übertragen keine persönlichen Daten, die Sie in unsere Werkzeuge eingeben — seien es Finanzzahlen, Gesundheitsmetriken oder persönliche Texte. Unsere Website ist vollständig DSGVO-konform und entspricht internationalen Datenschutzbestimmungen. Die einzigen Analysen, die wir verwenden, sind anonyme, aggregierte Nutzungsstatistiken über Google Analytics, ausschließlich um zu verstehen, welche Werkzeuge am beliebtesten sind und wo wir uns verbessern können. Sie können jedes Werkzeug mit vollständigem Vertrauen nutzen, dass Ihre Daten nur Ihnen gehören.',
      },
      {
        heading: 'Unsere Technologie',
        body: 'ToolKit Online ist mit modernsten Webtechnologien gebaut, um die schnellste und zuverlässigste Erfahrung zu liefern. Unsere Plattform läuft auf Next.js und React und nutzt serverseitiges Rendering für blitzschnelle Seitenladezeiten und optimale SEO. Das gesamte Frontend ist mit TypeScript für Typsicherheit und Tailwind CSS für ein responsives, modernes Design entwickelt, das auf jedem Gerät großartig aussieht — von Smartphones bis zu Ultra-Wide-Monitoren. Jedes Werkzeug ist auf Leistung optimiert, mit clientseitiger Verarbeitung, die Server-Roundtrips eliminiert und sofortige Ergebnisse liefert. Wir deployen auf Vercel für globale CDN-Verteilung und garantieren schnelle Ladezeiten, egal wo Sie sich befinden.',
      },
      {
        heading: 'Immer Kostenlos',
        body: 'ToolKit Online ist komplett kostenlos und wird es immer bleiben. Es gibt keine Paywalls, keine Premium-Stufen, keine Testphasen und keine versteckten Kosten. Wir finanzieren unsere Plattform durch unaufdringliche Werbung, die Ihr Surferlebnis respektiert. Wir haben die bewusste Entscheidung getroffen, jedes einzelne Werkzeug für alle zugänglich zu halten, weil wir glauben, dass nützliche Software nicht hinter einem Abonnement verschlossen sein sollte. Ob Sie ein Werkzeug oder alle 143 nutzen, Sie werden niemals gebeten, einen Cent zu zahlen.',
      },
      {
        heading: 'Weltweit Verfügbar',
        body: 'Wir glauben, dass großartige Werkzeuge Ihre Sprache sprechen sollten. ToolKit Online ist vollständig in sechs Sprachen verfügbar: Englisch, Italienisch, Spanisch, Französisch, Deutsch und Portugiesisch, und erreicht damit Milliarden potenzieller Nutzer auf der ganzen Welt. Jedes Werkzeug, jede Beschreibung und jedes Interface-Element ist sorgfältig übersetzt, um ein natives Erlebnis in jeder Sprache zu bieten. Unsere globale Infrastruktur gewährleistet schnelle Ladezeiten von jedem Standort aus, und wir prüfen ständig die Aufnahme weiterer Sprachen basierend auf der Nachfrage der Nutzer. Egal wo Sie sind, ToolKit Online ist so gestaltet, dass es sich anfühlt, als wäre es nur für Sie gemacht.',
      },
      {
        heading: 'Kontaktieren Sie Uns',
        body: 'Wir hören gerne von unseren Nutzern, und Ihr Feedback gestaltet direkt die Zukunft von ToolKit Online. Ob Sie einen Vorschlag für ein neues Werkzeug haben, einen Fehler melden möchten, eine Frage zur Funktionsweise haben oder einfach Ihre Erfahrung teilen möchten — wir freuen uns immer, von Ihnen zu hören. Schreiben Sie uns an info@toolkitonline.vip und wir melden uns so schnell wie möglich bei Ihnen. Ihre Ideen haben uns bereits geholfen, von einem kleinen Projekt zu einer Plattform mit über 143 Werkzeugen zu wachsen, und wir können es kaum erwarten zu erfahren, was Sie denken, dass wir als Nächstes bauen sollten.',
      },
    ],
  },
  pt: {
    title: 'Sobre o ToolKit Online',
    sections: [
      {
        heading: 'Nossa Missão',
        body: 'O ToolKit Online nasceu de uma crença simples, mas poderosa: as ferramentas digitais essenciais devem ser gratuitas e acessíveis a todos, em qualquer lugar. Somos apaixonados por remover barreiras à produtividade, seja você um estudante calculando médias, um desenvolvedor formatando JSON ou um pequeno empresário gerando faturas. Nossa missão é capacitar as pessoas com utilitários de alta qualidade que não exigem downloads, cadastros ou custos ocultos. Acreditamos que a internet deve facilitar a vida, e cada ferramenta que construímos reflete esse compromisso com a simplicidade e a acessibilidade.',
      },
      {
        heading: 'O que Oferecemos',
        body: 'O ToolKit Online oferece um conjunto completo de mais de 143 ferramentas online gratuitas organizadas em sete categorias cuidadosamente selecionadas: Finanças (calculadoras de empréstimos, ferramentas de investimento, geradores de faturas), Texto (contador de palavras, visualizador markdown, texto para fala), Saúde (calculadora de IMC, contador de calorias, calculadora de sono), Conversão (conversor de unidades, CSV para JSON, ferramentas PDF), Desenvolvedor (formatador JSON, testador de regex, gerador de códigos QR), Matemática (calculadora científica, criador de gráficos, ferramentas de probabilidade) e Imagens (editor de fotos, compressor de imagens, removedor de fundo). Cada ferramenta é projetada com uma interface limpa e intuitiva para que você obtenha resultados em segundos. Expandimos continuamente nossa coleção com base no feedback dos usuários, adicionando novas ferramentas todos os meses.',
      },
      {
        heading: 'Nossa História',
        body: 'O ToolKit Online começou em 2024 como um pequeno projeto com apenas algumas calculadoras e conversores. O que começou como um projeto pessoal para resolver problemas do dia a dia rapidamente cresceu em algo muito maior. À medida que os usuários descobriam nossas ferramentas e as compartilhavam com amigos e colegas, percebemos a enorme demanda por utilitários gratuitos, confiáveis e leves na web. Impulsionados pelo feedback da comunidade e pela paixão por construir software útil, crescemos rapidamente de uma dúzia de ferramentas para mais de 143, abrangendo sete categorias distintas. Cada funcionalidade adicionada foi moldada por solicitações reais dos usuários, tornando o ToolKit Online uma plataforma verdadeiramente impulsionada pela comunidade.',
      },
      {
        heading: 'Privacidade e Segurança',
        body: 'Sua privacidade está no centro de tudo o que fazemos. Todas as ferramentas do ToolKit Online processam dados inteiramente no lado do cliente, o que significa que suas informações nunca saem do seu navegador. Não coletamos, armazenamos ou transmitimos nenhum dado pessoal que você insere em nossas ferramentas — sejam dados financeiros, métricas de saúde ou textos pessoais. Nosso site é totalmente compatível com o LGPD e regulamentações internacionais de privacidade. As únicas análises que utilizamos são estatísticas de uso anônimas e agregadas através do Google Analytics, exclusivamente para entender quais ferramentas são mais populares e onde podemos melhorar. Você pode usar cada ferramenta com total confiança de que seus dados permanecem apenas seus.',
      },
      {
        heading: 'Nossa Tecnologia',
        body: 'O ToolKit Online é construído com tecnologias web de ponta para oferecer a experiência mais rápida e confiável possível. Nossa plataforma roda em Next.js e React, aproveitando a renderização do lado do servidor para carregamentos ultrarrápidos e SEO ideal. Todo o frontend é desenvolvido com TypeScript para segurança de tipos e Tailwind CSS para um design responsivo e moderno que fica ótimo em qualquer dispositivo — de smartphones a monitores ultrawide. Cada ferramenta é otimizada para desempenho, com processamento do lado do cliente que elimina viagens ao servidor e entrega resultados instantâneos. Fazemos deploy no Vercel para distribuição CDN global, garantindo tempos de carregamento rápidos não importa onde você esteja.',
      },
      {
        heading: 'Sempre Gratuito',
        body: 'O ToolKit Online é completamente gratuito e sempre será. Não há paywalls, níveis premium, períodos de teste ou custos ocultos. Sustentamos nossa plataforma através de publicidade não intrusiva que respeita sua experiência de navegação. Fizemos a escolha deliberada de manter cada ferramenta acessível a todos, porque acreditamos que software útil não deve ser trancado atrás de uma assinatura. Seja usando uma ferramenta ou todas as 143, você nunca será solicitado a pagar um centavo.',
      },
      {
        heading: 'Disponível em Todo o Mundo',
        body: 'Acreditamos que grandes ferramentas devem falar o seu idioma. O ToolKit Online está totalmente disponível em seis idiomas: inglês, italiano, espanhol, francês, alemão e português, alcançando bilhões de usuários potenciais ao redor do mundo. Cada ferramenta, cada descrição e cada elemento da interface é cuidadosamente traduzido para proporcionar uma experiência nativa em cada idioma. Nossa infraestrutura global garante tempos de carregamento rápidos de qualquer localização, e estamos sempre avaliando a adição de mais idiomas com base na demanda dos usuários. Não importa onde você esteja, o ToolKit Online é projetado para parecer que foi feito sob medida para você.',
      },
      {
        heading: 'Fale Conosco',
        body: 'Adoramos ouvir nossos usuários e seu feedback molda diretamente o futuro do ToolKit Online. Seja para sugerir uma nova ferramenta, relatar um bug, fazer uma pergunta sobre como algo funciona ou simplesmente compartilhar sua experiência, estamos sempre felizes em ouvir. Escreva-nos em info@toolkitonline.vip e responderemos o mais rápido possível. Suas ideias já nos ajudaram a crescer de um pequeno projeto para uma plataforma com mais de 143 ferramentas, e mal podemos esperar para saber o que você acha que devemos construir a seguir.',
      },
    ],
  },
};

export default function AboutPage() {
  const params = useParams();
  const lang = (params?.lang as Locale) || 'en';
  const c = content[lang];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <article className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold mb-8">{c.title}</h1>
        {c.sections.map((section, i) => (
          <div key={i} className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{section.heading}</h2>
            <p className="text-gray-700 leading-relaxed">{section.body}</p>
          </div>
        ))}
      </article>
    </div>
  );
}
