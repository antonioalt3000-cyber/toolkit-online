'use client';
import { useParams } from 'next/navigation';
import { type Locale } from '@/lib/translations';

type FAQItem = { q: string; a: string };

const faqContent: Record<Locale, { title: string; subtitle: string; items: FAQItem[] }> = {
  en: {
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about ToolKit Online and our free browser-based tools.',
    items: [
      {
        q: 'What is ToolKit Online?',
        a: 'ToolKit Online is a free collection of 114+ browser-based tools designed to help you with everyday tasks like converting files, generating text, editing images, and much more. All tools run directly in your browser, so there is nothing to install and you can start using them immediately from any device.',
      },
      {
        q: 'Are the tools really free?',
        a: 'Yes, every single tool on ToolKit Online is completely free to use with no hidden fees, no trial periods, and no premium tiers. We believe essential online utilities should be accessible to everyone. The site is supported by non-intrusive advertising, which allows us to keep everything free.',
      },
      {
        q: 'Do I need to create an account?',
        a: 'No, you do not need to create an account, sign up, or log in to use any of our tools. Just visit the tool you need and start using it right away. We intentionally designed the site to be as frictionless as possible so you can get your work done quickly.',
      },
      {
        q: 'Is my data safe?',
        a: 'Absolutely. Most of our tools process your data entirely in your browser, which means your files and text never leave your device. For the few tools that require server-side processing, we do not store or share your data. Your privacy and security are our top priorities.',
      },
      {
        q: 'How many tools are available?',
        a: 'We currently offer over 114 free tools and we are constantly adding more. Our collection covers categories like text utilities, image tools, developer tools, converters, generators, calculators, and more. If you do not see a tool you need, feel free to suggest it.',
      },
      {
        q: 'What languages are supported?',
        a: 'ToolKit Online is available in six languages: English, Italian, Spanish, French, German, and Portuguese. The entire interface, tool descriptions, and help content are translated so you can use the site comfortably in your preferred language.',
      },
      {
        q: 'Do the tools work on mobile?',
        a: 'Yes, all of our tools are fully responsive and work great on smartphones, tablets, and desktop computers. The interface adapts to your screen size automatically. You can use any tool on the go without any compromise in functionality.',
      },
      {
        q: 'How are the tools different from other websites?',
        a: 'Unlike many other tool websites, ToolKit Online does not require sign-ups, does not limit usage, and does not lock features behind paywalls. We focus on speed, privacy, and simplicity. Most tools run client-side for maximum privacy, and the interface is clean without aggressive pop-ups or ads.',
      },
      {
        q: 'Can I suggest a new tool?',
        a: 'We love hearing from our users! If you have an idea for a tool that would be useful, please reach out through our contact page. We review every suggestion and regularly add new tools based on user feedback. Your input helps us make ToolKit Online better for everyone.',
      },
      {
        q: 'How do you make money if it is free?',
        a: 'We sustain the website through non-intrusive display advertising via Google AdSense. This allows us to cover hosting and development costs while keeping every tool completely free for you. We are committed to keeping the ad experience respectful and never compromising usability.',
      },
    ],
  },
  it: {
    title: 'Domande Frequenti',
    subtitle: 'Tutto quello che devi sapere su ToolKit Online e i nostri strumenti gratuiti basati su browser.',
    items: [
      {
        q: 'Cos\'è ToolKit Online?',
        a: 'ToolKit Online è una raccolta gratuita di oltre 114 strumenti basati su browser, progettati per aiutarti nelle attività quotidiane come convertire file, generare testo, modificare immagini e molto altro. Tutti gli strumenti funzionano direttamente nel tuo browser, quindi non devi installare nulla e puoi iniziare a usarli immediatamente da qualsiasi dispositivo.',
      },
      {
        q: 'Gli strumenti sono davvero gratuiti?',
        a: 'Sì, ogni singolo strumento su ToolKit Online è completamente gratuito, senza costi nascosti, periodi di prova o livelli premium. Crediamo che le utilità online essenziali debbano essere accessibili a tutti. Il sito è supportato da pubblicità non invasiva, che ci permette di mantenere tutto gratuito.',
      },
      {
        q: 'Devo creare un account?',
        a: 'No, non è necessario creare un account, registrarsi o effettuare il login per usare qualsiasi nostro strumento. Basta visitare lo strumento che ti serve e iniziare subito a usarlo. Abbiamo progettato il sito per essere il più semplice possibile, così puoi completare il tuo lavoro rapidamente.',
      },
      {
        q: 'I miei dati sono al sicuro?',
        a: 'Assolutamente sì. La maggior parte dei nostri strumenti elabora i tuoi dati interamente nel browser, il che significa che i tuoi file e testi non lasciano mai il tuo dispositivo. Per i pochi strumenti che richiedono elaborazione lato server, non memorizziamo né condividiamo i tuoi dati. La tua privacy e sicurezza sono le nostre massime priorità.',
      },
      {
        q: 'Quanti strumenti sono disponibili?',
        a: 'Attualmente offriamo oltre 114 strumenti gratuiti e ne aggiungiamo costantemente di nuovi. La nostra raccolta copre categorie come utilità di testo, strumenti per immagini, strumenti per sviluppatori, convertitori, generatori, calcolatrici e altro. Se non trovi lo strumento che ti serve, sentiti libero di suggerirlo.',
      },
      {
        q: 'Quali lingue sono supportate?',
        a: 'ToolKit Online è disponibile in sei lingue: inglese, italiano, spagnolo, francese, tedesco e portoghese. L\'intera interfaccia, le descrizioni degli strumenti e i contenuti di aiuto sono tradotti per permetterti di usare il sito comodamente nella tua lingua preferita.',
      },
      {
        q: 'Gli strumenti funzionano su mobile?',
        a: 'Sì, tutti i nostri strumenti sono completamente responsive e funzionano perfettamente su smartphone, tablet e computer desktop. L\'interfaccia si adatta automaticamente alle dimensioni del tuo schermo. Puoi usare qualsiasi strumento in mobilità senza alcun compromesso nelle funzionalità.',
      },
      {
        q: 'In cosa si differenziano i vostri strumenti dagli altri siti?',
        a: 'A differenza di molti altri siti di strumenti online, ToolKit Online non richiede registrazioni, non limita l\'utilizzo e non blocca funzionalità dietro pagamenti. Ci concentriamo su velocità, privacy e semplicità. La maggior parte degli strumenti funziona lato client per la massima privacy e l\'interfaccia è pulita, senza pop-up aggressivi o pubblicità invasive.',
      },
      {
        q: 'Posso suggerire un nuovo strumento?',
        a: 'Ci fa piacere ascoltare i nostri utenti! Se hai un\'idea per uno strumento utile, contattaci tramite la nostra pagina contatti. Esaminiamo ogni suggerimento e aggiungiamo regolarmente nuovi strumenti in base ai feedback degli utenti. Il tuo contributo ci aiuta a rendere ToolKit Online migliore per tutti.',
      },
      {
        q: 'Come guadagnate se è tutto gratuito?',
        a: 'Sosteniamo il sito attraverso pubblicità display non invasiva tramite Google AdSense. Questo ci permette di coprire i costi di hosting e sviluppo mantenendo ogni strumento completamente gratuito per te. Ci impegniamo a mantenere l\'esperienza pubblicitaria rispettosa, senza mai compromettere l\'usabilità.',
      },
    ],
  },
  es: {
    title: 'Preguntas Frecuentes',
    subtitle: 'Todo lo que necesitas saber sobre ToolKit Online y nuestras herramientas gratuitas.',
    items: [
      {
        q: '¿Qué es ToolKit Online?',
        a: 'ToolKit Online es una colección gratuita de más de 114 herramientas en línea para tareas cotidianas como convertir archivos, generar texto y editar imágenes. Todas funcionan directamente en tu navegador sin necesidad de instalar nada.',
      },
      {
        q: '¿Las herramientas son realmente gratuitas?',
        a: 'Sí, todas las herramientas son completamente gratuitas, sin costes ocultos ni períodos de prueba. El sitio se mantiene mediante publicidad no invasiva.',
      },
      {
        q: '¿Necesito crear una cuenta?',
        a: 'No, no necesitas registrarte ni iniciar sesión. Simplemente visita la herramienta que necesitas y empieza a usarla de inmediato.',
      },
      {
        q: '¿Mis datos están seguros?',
        a: 'Sí. La mayoría de nuestras herramientas procesan tus datos directamente en tu navegador, por lo que nunca salen de tu dispositivo. No almacenamos ni compartimos tu información.',
      },
      {
        q: '¿Cuántas herramientas hay disponibles?',
        a: 'Actualmente ofrecemos más de 114 herramientas gratuitas en categorías como texto, imágenes, desarrollo, conversores y más. Añadimos nuevas herramientas regularmente.',
      },
      {
        q: '¿Qué idiomas están disponibles?',
        a: 'ToolKit Online está disponible en seis idiomas: inglés, italiano, español, francés, alemán y portugués. Toda la interfaz está completamente traducida.',
      },
      {
        q: '¿Las herramientas funcionan en móvil?',
        a: 'Sí, todas las herramientas son responsive y funcionan perfectamente en smartphones, tablets y ordenadores. La interfaz se adapta automáticamente a tu pantalla.',
      },
      {
        q: '¿En qué se diferencian de otros sitios web?',
        a: 'No requerimos registro, no limitamos el uso y no ocultamos funciones detrás de pagos. Nos enfocamos en velocidad, privacidad y simplicidad.',
      },
      {
        q: '¿Puedo sugerir una nueva herramienta?',
        a: 'Por supuesto. Visita nuestra página de contacto y envíanos tu idea. Revisamos todas las sugerencias y añadimos herramientas basándonos en el feedback de los usuarios.',
      },
      {
        q: '¿Cómo ganan dinero si es gratis?',
        a: 'El sitio se sostiene mediante publicidad no invasiva a través de Google AdSense. Esto nos permite cubrir los costes manteniendo todo gratuito para ti.',
      },
    ],
  },
  fr: {
    title: 'Questions Fréquentes',
    subtitle: 'Tout ce que vous devez savoir sur ToolKit Online et nos outils gratuits.',
    items: [
      {
        q: 'Qu\'est-ce que ToolKit Online ?',
        a: 'ToolKit Online est une collection gratuite de plus de 114 outils en ligne pour les tâches quotidiennes comme la conversion de fichiers, la génération de texte et l\'édition d\'images. Tout fonctionne directement dans votre navigateur.',
      },
      {
        q: 'Les outils sont-ils vraiment gratuits ?',
        a: 'Oui, tous les outils sont entièrement gratuits, sans frais cachés ni période d\'essai. Le site est financé par de la publicité non intrusive.',
      },
      {
        q: 'Dois-je créer un compte ?',
        a: 'Non, aucune inscription ni connexion n\'est nécessaire. Visitez simplement l\'outil dont vous avez besoin et commencez à l\'utiliser immédiatement.',
      },
      {
        q: 'Mes données sont-elles en sécurité ?',
        a: 'Oui. La plupart de nos outils traitent vos données directement dans votre navigateur, elles ne quittent donc jamais votre appareil. Nous ne stockons ni ne partageons vos informations.',
      },
      {
        q: 'Combien d\'outils sont disponibles ?',
        a: 'Nous proposons actuellement plus de 114 outils gratuits dans des catégories comme le texte, les images, le développement et les convertisseurs. De nouveaux outils sont ajoutés régulièrement.',
      },
      {
        q: 'Quelles langues sont prises en charge ?',
        a: 'ToolKit Online est disponible en six langues : anglais, italien, espagnol, français, allemand et portugais. L\'interface complète est traduite.',
      },
      {
        q: 'Les outils fonctionnent-ils sur mobile ?',
        a: 'Oui, tous les outils sont responsive et fonctionnent parfaitement sur smartphones, tablettes et ordinateurs. L\'interface s\'adapte automatiquement à votre écran.',
      },
      {
        q: 'En quoi êtes-vous différents des autres sites ?',
        a: 'Pas d\'inscription requise, pas de limites d\'utilisation et pas de fonctionnalités payantes. Nous misons sur la rapidité, la confidentialité et la simplicité.',
      },
      {
        q: 'Puis-je suggérer un nouvel outil ?',
        a: 'Bien sûr ! Rendez-vous sur notre page de contact pour nous envoyer votre idée. Nous examinons chaque suggestion et ajoutons des outils basés sur les retours des utilisateurs.',
      },
      {
        q: 'Comment gagnez-vous de l\'argent si c\'est gratuit ?',
        a: 'Le site est financé par de la publicité display non intrusive via Google AdSense. Cela nous permet de couvrir les coûts tout en gardant les outils gratuits.',
      },
    ],
  },
  de: {
    title: 'Häufig gestellte Fragen',
    subtitle: 'Alles Wichtige über ToolKit Online und unsere kostenlosen Tools.',
    items: [
      {
        q: 'Was ist ToolKit Online?',
        a: 'ToolKit Online ist eine kostenlose Sammlung von über 114 Browser-Tools für alltägliche Aufgaben. Alles funktioniert direkt im Browser.',
      },
      {
        q: 'Sind die Tools wirklich kostenlos?',
        a: 'Ja, alle Tools sind komplett kostenlos, ohne versteckte Kosten. Die Website wird durch nicht-aufdringliche Werbung finanziert.',
      },
      {
        q: 'Muss ich ein Konto erstellen?',
        a: 'Nein, keine Registrierung oder Anmeldung erforderlich. Einfach das gewünschte Tool öffnen und loslegen.',
      },
      {
        q: 'Sind meine Daten sicher?',
        a: 'Ja. Die meisten Tools verarbeiten Daten direkt im Browser. Wir speichern oder teilen keine Nutzerdaten.',
      },
      {
        q: 'Wie viele Tools gibt es?',
        a: 'Über 114 kostenlose Tools in Kategorien wie Text, Bilder, Entwickler-Tools und Konverter. Neue werden regelmäßig hinzugefügt.',
      },
      {
        q: 'Welche Sprachen werden unterstützt?',
        a: 'Sechs Sprachen: Englisch, Italienisch, Spanisch, Französisch, Deutsch und Portugiesisch.',
      },
      {
        q: 'Funktionieren die Tools auf dem Handy?',
        a: 'Ja, alle Tools sind responsiv und funktionieren auf Smartphones, Tablets und Desktops.',
      },
      {
        q: 'Was unterscheidet euch von anderen Websites?',
        a: 'Keine Registrierung, keine Nutzungslimits, keine versteckten Kosten. Fokus auf Geschwindigkeit und Datenschutz.',
      },
      {
        q: 'Kann ich ein neues Tool vorschlagen?',
        a: 'Ja, über unsere Kontaktseite. Wir prüfen jeden Vorschlag und ergänzen regelmäßig neue Tools.',
      },
      {
        q: 'Wie verdient ihr Geld, wenn alles kostenlos ist?',
        a: 'Durch nicht-aufdringliche Werbung über Google AdSense. So bleiben alle Tools kostenlos.',
      },
    ],
  },
  pt: {
    title: 'Perguntas Frequentes',
    subtitle: 'Tudo sobre o ToolKit Online e as nossas ferramentas gratuitas.',
    items: [
      {
        q: 'O que é o ToolKit Online?',
        a: 'O ToolKit Online é uma coleção gratuita de mais de 114 ferramentas online para tarefas do dia a dia. Tudo funciona diretamente no navegador.',
      },
      {
        q: 'As ferramentas são mesmo gratuitas?',
        a: 'Sim, todas as ferramentas são completamente gratuitas, sem custos ocultos. O site é mantido por publicidade não invasiva.',
      },
      {
        q: 'Preciso criar uma conta?',
        a: 'Não, nenhum registo ou login é necessário. Basta visitar a ferramenta e começar a usá-la.',
      },
      {
        q: 'Os meus dados estão seguros?',
        a: 'Sim. A maioria das ferramentas processa dados diretamente no navegador. Não armazenamos nem partilhamos dados.',
      },
      {
        q: 'Quantas ferramentas estão disponíveis?',
        a: 'Mais de 114 ferramentas gratuitas em categorias como texto, imagens, desenvolvimento e conversores.',
      },
      {
        q: 'Que idiomas são suportados?',
        a: 'Seis idiomas: inglês, italiano, espanhol, francês, alemão e português.',
      },
      {
        q: 'As ferramentas funcionam no telemóvel?',
        a: 'Sim, todas são responsivas e funcionam em smartphones, tablets e computadores.',
      },
      {
        q: 'O que vos diferencia de outros sites?',
        a: 'Sem registo, sem limites de uso, sem custos ocultos. Foco em velocidade e privacidade.',
      },
      {
        q: 'Posso sugerir uma nova ferramenta?',
        a: 'Sim, através da nossa página de contacto. Analisamos todas as sugestões.',
      },
      {
        q: 'Como ganham dinheiro se é grátis?',
        a: 'Através de publicidade não invasiva via Google AdSense, mantendo tudo gratuito.',
      },
    ],
  },
};

export default function FAQPage() {
  const params = useParams();
  const lang = (params?.lang as Locale) || 'en';
  const c = faqContent[lang];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: c.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-3xl font-bold mb-2">{c.title}</h1>
      <p className="text-gray-500 mb-10">{c.subtitle}</p>
      <div className="space-y-3">
        {c.items.map((item, i) => (
          <details
            key={i}
            className="border border-gray-200 rounded-xl overflow-hidden group"
          >
            <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-800 hover:bg-gray-50 transition-colors flex items-center justify-between">
              {item.q}
              <svg
                className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </summary>
            <div className="px-6 pb-4 text-gray-600 leading-relaxed">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
