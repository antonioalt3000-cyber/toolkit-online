'use client';
import { useParams } from 'next/navigation';
import { type Locale } from '@/lib/translations';

const content: Record<Locale, { title: string; sections: { heading: string; body: string }[] }> = {
  en: {
    title: 'About ToolKit Online',
    sections: [
      {
        heading: 'Our Mission',
        body: 'ToolKit Online was created with a simple mission: to provide free, fast, and reliable online tools for everyone. We believe that essential utilities like calculators, converters, and text tools should be accessible to all without registration, fees, or unnecessary complexity.',
      },
      {
        heading: 'What We Offer',
        body: 'We offer a growing collection of over 40 online tools spanning finance, text processing, health calculations, unit conversions, developer utilities, math tools, and image processing. Every tool runs directly in your browser, ensuring your data stays private and results are instant.',
      },
      {
        heading: 'Privacy First',
        body: 'Your privacy matters to us. All our tools process data locally in your browser. We never collect, store, or transmit the data you enter into our tools. The only data we collect is anonymous usage analytics through Google Analytics to help us improve the site.',
      },
      {
        heading: 'Always Free',
        body: 'ToolKit Online is and will always be free to use. We sustain our service through non-intrusive advertising. No paywalls, no premium tiers, no hidden costs.',
      },
      {
        heading: 'Get in Touch',
        body: 'We would love to hear from you. Whether you have a suggestion for a new tool, found a bug, or just want to say hello, reach out to us at info@toolkitonline.vip.',
      },
    ],
  },
  it: {
    title: 'Chi Siamo — ToolKit Online',
    sections: [
      {
        heading: 'La Nostra Missione',
        body: 'ToolKit Online è stato creato con una missione semplice: fornire strumenti online gratuiti, veloci e affidabili per tutti. Crediamo che le utilità essenziali come calcolatori, convertitori e strumenti di testo debbano essere accessibili a tutti senza registrazione, costi o complessità inutili.',
      },
      {
        heading: 'Cosa Offriamo',
        body: 'Offriamo una collezione in crescita di oltre 40 strumenti online che coprono finanza, elaborazione testi, calcoli sulla salute, conversioni di unità, utilità per sviluppatori, strumenti matematici ed elaborazione immagini. Ogni strumento funziona direttamente nel tuo browser, garantendo che i tuoi dati restino privati e i risultati siano istantanei.',
      },
      {
        heading: 'Privacy al Primo Posto',
        body: 'La tua privacy è importante per noi. Tutti i nostri strumenti elaborano i dati localmente nel tuo browser. Non raccogliamo, memorizziamo o trasmettiamo mai i dati che inserisci nei nostri strumenti. Gli unici dati raccolti sono analisi di utilizzo anonime tramite Google Analytics per aiutarci a migliorare il sito.',
      },
      {
        heading: 'Sempre Gratuito',
        body: 'ToolKit Online è e sarà sempre gratuito. Sosteniamo il nostro servizio attraverso pubblicità non invasiva. Nessun paywall, nessun livello premium, nessun costo nascosto.',
      },
      {
        heading: 'Contattaci',
        body: 'Ci farebbe piacere sentirti. Che tu abbia un suggerimento per un nuovo strumento, abbia trovato un bug o voglia semplicemente salutarci, scrivici a info@toolkitonline.vip.',
      },
    ],
  },
  es: {
    title: 'Acerca de ToolKit Online',
    sections: [
      {
        heading: 'Nuestra Misión',
        body: 'ToolKit Online fue creado con una misión simple: proporcionar herramientas en línea gratuitas, rápidas y confiables para todos. Creemos que las utilidades esenciales como calculadoras, convertidores y herramientas de texto deben ser accesibles para todos sin registro, costos ni complejidad innecesaria.',
      },
      {
        heading: 'Lo que Ofrecemos',
        body: 'Ofrecemos una colección creciente de más de 40 herramientas en línea que abarcan finanzas, procesamiento de texto, cálculos de salud, conversiones de unidades, utilidades para desarrolladores, herramientas matemáticas y procesamiento de imágenes. Cada herramienta funciona directamente en tu navegador, asegurando que tus datos permanezcan privados y los resultados sean instantáneos.',
      },
      {
        heading: 'Privacidad Primero',
        body: 'Tu privacidad nos importa. Todas nuestras herramientas procesan datos localmente en tu navegador. Nunca recopilamos, almacenamos ni transmitimos los datos que introduces en nuestras herramientas. Los únicos datos que recopilamos son análisis de uso anónimos a través de Google Analytics para ayudarnos a mejorar el sitio.',
      },
      {
        heading: 'Siempre Gratis',
        body: 'ToolKit Online es y siempre será gratuito. Mantenemos nuestro servicio a través de publicidad no intrusiva. Sin muros de pago, sin niveles premium, sin costos ocultos.',
      },
      {
        heading: 'Ponte en Contacto',
        body: 'Nos encantaría saber de ti. Ya sea que tengas una sugerencia para una nueva herramienta, hayas encontrado un error o simplemente quieras saludar, escríbenos a info@toolkitonline.vip.',
      },
    ],
  },
  fr: {
    title: 'À Propos de ToolKit Online',
    sections: [
      {
        heading: 'Notre Mission',
        body: 'ToolKit Online a été créé avec une mission simple : fournir des outils en ligne gratuits, rapides et fiables pour tous. Nous croyons que les utilitaires essentiels comme les calculatrices, convertisseurs et outils de texte doivent être accessibles à tous sans inscription, frais ou complexité inutile.',
      },
      {
        heading: 'Ce que Nous Offrons',
        body: 'Nous offrons une collection grandissante de plus de 40 outils en ligne couvrant la finance, le traitement de texte, les calculs de santé, les conversions d\'unités, les utilitaires pour développeurs, les outils mathématiques et le traitement d\'images. Chaque outil fonctionne directement dans votre navigateur, garantissant que vos données restent privées et que les résultats sont instantanés.',
      },
      {
        heading: 'La Confidentialité d\'Abord',
        body: 'Votre vie privée nous importe. Tous nos outils traitent les données localement dans votre navigateur. Nous ne collectons, ne stockons ni ne transmettons jamais les données que vous saisissez dans nos outils. Les seules données collectées sont des analyses d\'utilisation anonymes via Google Analytics pour nous aider à améliorer le site.',
      },
      {
        heading: 'Toujours Gratuit',
        body: 'ToolKit Online est et sera toujours gratuit. Nous soutenons notre service grâce à de la publicité non intrusive. Pas de paywall, pas de niveau premium, pas de coûts cachés.',
      },
      {
        heading: 'Contactez-nous',
        body: 'Nous serions ravis de vous entendre. Que vous ayez une suggestion pour un nouvel outil, trouvé un bug ou simplement envie de dire bonjour, contactez-nous à info@toolkitonline.vip.',
      },
    ],
  },
  de: {
    title: 'Über ToolKit Online',
    sections: [
      {
        heading: 'Unsere Mission',
        body: 'ToolKit Online wurde mit einer einfachen Mission gegründet: kostenlose, schnelle und zuverlässige Online-Werkzeuge für alle bereitzustellen. Wir glauben, dass wesentliche Hilfsmittel wie Rechner, Umrechner und Textwerkzeuge für alle zugänglich sein sollten — ohne Registrierung, Gebühren oder unnötige Komplexität.',
      },
      {
        heading: 'Was Wir Bieten',
        body: 'Wir bieten eine wachsende Sammlung von über 40 Online-Werkzeugen in den Bereichen Finanzen, Textverarbeitung, Gesundheitsberechnungen, Einheitenumrechnungen, Entwickler-Utilities, mathematische Werkzeuge und Bildbearbeitung. Jedes Werkzeug läuft direkt in Ihrem Browser und stellt sicher, dass Ihre Daten privat bleiben und die Ergebnisse sofort verfügbar sind.',
      },
      {
        heading: 'Datenschutz Zuerst',
        body: 'Ihre Privatsphäre ist uns wichtig. Alle unsere Werkzeuge verarbeiten Daten lokal in Ihrem Browser. Wir sammeln, speichern oder übertragen niemals die Daten, die Sie in unsere Werkzeuge eingeben. Die einzigen Daten, die wir sammeln, sind anonyme Nutzungsanalysen über Google Analytics, um die Website zu verbessern.',
      },
      {
        heading: 'Immer Kostenlos',
        body: 'ToolKit Online ist und wird immer kostenlos sein. Wir finanzieren unseren Service durch unaufdringliche Werbung. Keine Paywalls, keine Premium-Stufen, keine versteckten Kosten.',
      },
      {
        heading: 'Kontaktieren Sie Uns',
        body: 'Wir freuen uns von Ihnen zu hören. Ob Sie einen Vorschlag für ein neues Werkzeug haben, einen Fehler gefunden haben oder einfach Hallo sagen möchten — schreiben Sie uns an info@toolkitonline.vip.',
      },
    ],
  },
  pt: {
    title: 'Sobre o ToolKit Online',
    sections: [
      {
        heading: 'Nossa Missão',
        body: 'O ToolKit Online foi criado com uma missão simples: fornecer ferramentas online gratuitas, rápidas e confiáveis para todos. Acreditamos que utilidades essenciais como calculadoras, conversores e ferramentas de texto devem ser acessíveis a todos sem registro, custos ou complexidade desnecessária.',
      },
      {
        heading: 'O que Oferecemos',
        body: 'Oferecemos uma coleção crescente de mais de 40 ferramentas online abrangendo finanças, processamento de texto, cálculos de saúde, conversões de unidades, utilitários para desenvolvedores, ferramentas matemáticas e processamento de imagens. Cada ferramenta funciona diretamente no seu navegador, garantindo que seus dados permaneçam privados e os resultados sejam instantâneos.',
      },
      {
        heading: 'Privacidade em Primeiro Lugar',
        body: 'Sua privacidade é importante para nós. Todas as nossas ferramentas processam dados localmente no seu navegador. Nunca coletamos, armazenamos ou transmitimos os dados que você insere em nossas ferramentas. Os únicos dados coletados são análises de uso anônimas através do Google Analytics para nos ajudar a melhorar o site.',
      },
      {
        heading: 'Sempre Gratuito',
        body: 'O ToolKit Online é e sempre será gratuito. Sustentamos nosso serviço através de publicidade não intrusiva. Sem paywalls, sem níveis premium, sem custos ocultos.',
      },
      {
        heading: 'Fale Conosco',
        body: 'Adoraríamos ouvir de você. Seja para sugerir uma nova ferramenta, relatar um bug ou simplesmente dizer olá, escreva-nos em info@toolkitonline.vip.',
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
