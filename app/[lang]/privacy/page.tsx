'use client';
import { useParams } from 'next/navigation';
import { type Locale } from '@/lib/translations';

const content: Record<Locale, { title: string; lastUpdated: string; sections: { heading: string; body: string }[] }> = {
  en: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: March 2026',
    sections: [
      {
        heading: 'Introduction',
        body: 'Welcome to ToolKit Online. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect information when you visit our website at toolkitonline.vip.',
      },
      {
        heading: 'Information We Collect',
        body: 'We do not collect personal data such as names, email addresses, or phone numbers. Our tools run entirely in your browser, and the data you enter into our tools is never sent to our servers.',
      },
      {
        heading: 'Cookies and Third-Party Services',
        body: 'We use Google AdSense to display advertisements. Google AdSense may use cookies and similar technologies to serve ads based on your prior visits to this and other websites. You can opt out of personalized advertising by visiting Google Ads Settings. We also use Google Analytics to understand how visitors interact with our website. Google Analytics collects anonymous data such as pages visited, time on site, and browser type. This data helps us improve our services.',
      },
      {
        heading: 'Third-Party Links',
        body: 'Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites.',
      },
      {
        heading: 'Data Security',
        body: 'Since we do not collect or store personal data on our servers, the risk of data breaches affecting your personal information is minimal. All tools operate client-side in your browser.',
      },
      {
        heading: 'Changes to This Policy',
        body: 'We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.',
      },
      {
        heading: 'Contact Us',
        body: 'If you have any questions about this Privacy Policy, please contact us at info@toolkitonline.vip.',
      },
    ],
  },
  it: {
    title: 'Informativa sulla Privacy',
    lastUpdated: 'Ultimo aggiornamento: Marzo 2026',
    sections: [
      {
        heading: 'Introduzione',
        body: 'Benvenuti su ToolKit Online. La tua privacy è importante per noi. Questa Informativa sulla Privacy spiega come raccogliamo, utilizziamo e proteggiamo le informazioni quando visiti il nostro sito web toolkitonline.vip.',
      },
      {
        heading: 'Informazioni che Raccogliamo',
        body: 'Non raccogliamo dati personali come nomi, indirizzi email o numeri di telefono. I nostri strumenti funzionano interamente nel tuo browser e i dati inseriti non vengono mai inviati ai nostri server.',
      },
      {
        heading: 'Cookie e Servizi di Terze Parti',
        body: 'Utilizziamo Google AdSense per visualizzare annunci pubblicitari. Google AdSense può utilizzare cookie e tecnologie simili per mostrare annunci basati sulle tue visite precedenti a questo e ad altri siti web. Puoi disattivare la pubblicità personalizzata visitando le Impostazioni annunci di Google. Utilizziamo inoltre Google Analytics per comprendere come i visitatori interagiscono con il nostro sito. Google Analytics raccoglie dati anonimi come pagine visitate, tempo sul sito e tipo di browser.',
      },
      {
        heading: 'Link di Terze Parti',
        body: 'Il nostro sito potrebbe contenere link a siti web di terze parti. Non siamo responsabili delle pratiche sulla privacy o dei contenuti di tali siti.',
      },
      {
        heading: 'Sicurezza dei Dati',
        body: 'Poiché non raccogliamo né memorizziamo dati personali sui nostri server, il rischio di violazioni dei dati che riguardano le tue informazioni personali è minimo. Tutti gli strumenti funzionano lato client nel tuo browser.',
      },
      {
        heading: 'Modifiche a Questa Informativa',
        body: 'Potremmo aggiornare questa Informativa sulla Privacy di tanto in tanto. Eventuali modifiche saranno pubblicate su questa pagina con una data di revisione aggiornata.',
      },
      {
        heading: 'Contattaci',
        body: 'Per qualsiasi domanda su questa Informativa sulla Privacy, contattaci a info@toolkitonline.vip.',
      },
    ],
  },
  es: {
    title: 'Política de Privacidad',
    lastUpdated: 'Última actualización: Marzo 2026',
    sections: [
      {
        heading: 'Introducción',
        body: 'Bienvenido a ToolKit Online. Tu privacidad es importante para nosotros. Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos la información cuando visitas nuestro sitio web toolkitonline.vip.',
      },
      {
        heading: 'Información que Recopilamos',
        body: 'No recopilamos datos personales como nombres, direcciones de correo electrónico o números de teléfono. Nuestras herramientas funcionan completamente en tu navegador y los datos que introduces nunca se envían a nuestros servidores.',
      },
      {
        heading: 'Cookies y Servicios de Terceros',
        body: 'Utilizamos Google AdSense para mostrar anuncios. Google AdSense puede usar cookies y tecnologías similares para mostrar anuncios basados en tus visitas anteriores a este y otros sitios web. Puedes desactivar la publicidad personalizada visitando la Configuración de anuncios de Google. También usamos Google Analytics para entender cómo los visitantes interactúan con nuestro sitio. Google Analytics recopila datos anónimos como páginas visitadas, tiempo en el sitio y tipo de navegador.',
      },
      {
        heading: 'Enlaces de Terceros',
        body: 'Nuestro sitio web puede contener enlaces a sitios de terceros. No somos responsables de las prácticas de privacidad o el contenido de esos sitios.',
      },
      {
        heading: 'Seguridad de los Datos',
        body: 'Dado que no recopilamos ni almacenamos datos personales en nuestros servidores, el riesgo de violaciones de datos que afecten tu información personal es mínimo. Todas las herramientas operan en el lado del cliente en tu navegador.',
      },
      {
        heading: 'Cambios en Esta Política',
        body: 'Podemos actualizar esta Política de Privacidad de vez en cuando. Cualquier cambio será publicado en esta página con una fecha de revisión actualizada.',
      },
      {
        heading: 'Contáctanos',
        body: 'Si tienes alguna pregunta sobre esta Política de Privacidad, contáctanos en info@toolkitonline.vip.',
      },
    ],
  },
  fr: {
    title: 'Politique de Confidentialité',
    lastUpdated: 'Dernière mise à jour : Mars 2026',
    sections: [
      {
        heading: 'Introduction',
        body: 'Bienvenue sur ToolKit Online. Votre vie privée est importante pour nous. Cette Politique de Confidentialité explique comment nous collectons, utilisons et protégeons les informations lorsque vous visitez notre site web toolkitonline.vip.',
      },
      {
        heading: 'Informations que Nous Collectons',
        body: 'Nous ne collectons pas de données personnelles telles que noms, adresses e-mail ou numéros de téléphone. Nos outils fonctionnent entièrement dans votre navigateur et les données que vous saisissez ne sont jamais envoyées à nos serveurs.',
      },
      {
        heading: 'Cookies et Services Tiers',
        body: 'Nous utilisons Google AdSense pour afficher des publicités. Google AdSense peut utiliser des cookies et des technologies similaires pour diffuser des annonces basées sur vos visites précédentes sur ce site et d\'autres. Vous pouvez désactiver la publicité personnalisée en visitant les Paramètres des annonces Google. Nous utilisons également Google Analytics pour comprendre comment les visiteurs interagissent avec notre site. Google Analytics collecte des données anonymes telles que les pages visitées, le temps passé sur le site et le type de navigateur.',
      },
      {
        heading: 'Liens Tiers',
        body: 'Notre site web peut contenir des liens vers des sites tiers. Nous ne sommes pas responsables des pratiques de confidentialité ou du contenu de ces sites.',
      },
      {
        heading: 'Sécurité des Données',
        body: 'Puisque nous ne collectons ni ne stockons de données personnelles sur nos serveurs, le risque de violations de données affectant vos informations personnelles est minimal. Tous les outils fonctionnent côté client dans votre navigateur.',
      },
      {
        heading: 'Modifications de Cette Politique',
        body: 'Nous pouvons mettre à jour cette Politique de Confidentialité de temps en temps. Toute modification sera publiée sur cette page avec une date de révision mise à jour.',
      },
      {
        heading: 'Nous Contacter',
        body: 'Si vous avez des questions concernant cette Politique de Confidentialité, contactez-nous à info@toolkitonline.vip.',
      },
    ],
  },
  de: {
    title: 'Datenschutzrichtlinie',
    lastUpdated: 'Letzte Aktualisierung: März 2026',
    sections: [
      {
        heading: 'Einleitung',
        body: 'Willkommen bei ToolKit Online. Ihre Privatsphäre ist uns wichtig. Diese Datenschutzrichtlinie erklärt, wie wir Informationen sammeln, verwenden und schützen, wenn Sie unsere Website toolkitonline.vip besuchen.',
      },
      {
        heading: 'Informationen, die wir Sammeln',
        body: 'Wir sammeln keine persönlichen Daten wie Namen, E-Mail-Adressen oder Telefonnummern. Unsere Werkzeuge laufen vollständig in Ihrem Browser und die von Ihnen eingegebenen Daten werden niemals an unsere Server gesendet.',
      },
      {
        heading: 'Cookies und Drittanbieter-Dienste',
        body: 'Wir verwenden Google AdSense zur Anzeige von Werbung. Google AdSense kann Cookies und ähnliche Technologien verwenden, um Anzeigen basierend auf Ihren vorherigen Besuchen auf dieser und anderen Websites zu schalten. Sie können personalisierte Werbung deaktivieren, indem Sie die Google Ads-Einstellungen besuchen. Wir verwenden außerdem Google Analytics, um zu verstehen, wie Besucher mit unserer Website interagieren. Google Analytics sammelt anonyme Daten wie besuchte Seiten, Verweildauer und Browsertyp.',
      },
      {
        heading: 'Links zu Dritten',
        body: 'Unsere Website kann Links zu Websites Dritter enthalten. Wir sind nicht verantwortlich für die Datenschutzpraktiken oder Inhalte dieser Seiten.',
      },
      {
        heading: 'Datensicherheit',
        body: 'Da wir keine persönlichen Daten auf unseren Servern sammeln oder speichern, ist das Risiko von Datenschutzverletzungen, die Ihre persönlichen Informationen betreffen, minimal. Alle Werkzeuge arbeiten clientseitig in Ihrem Browser.',
      },
      {
        heading: 'Änderungen dieser Richtlinie',
        body: 'Wir können diese Datenschutzrichtlinie von Zeit zu Zeit aktualisieren. Änderungen werden auf dieser Seite mit einem aktualisierten Revisionsdatum veröffentlicht.',
      },
      {
        heading: 'Kontakt',
        body: 'Bei Fragen zu dieser Datenschutzrichtlinie kontaktieren Sie uns unter info@toolkitonline.vip.',
      },
    ],
  },
  pt: {
    title: 'Política de Privacidade',
    lastUpdated: 'Última atualização: Março 2026',
    sections: [
      {
        heading: 'Introdução',
        body: 'Bem-vindo ao ToolKit Online. Sua privacidade é importante para nós. Esta Política de Privacidade explica como coletamos, usamos e protegemos informações quando você visita nosso site toolkitonline.vip.',
      },
      {
        heading: 'Informações que Coletamos',
        body: 'Não coletamos dados pessoais como nomes, endereços de e-mail ou números de telefone. Nossas ferramentas funcionam inteiramente no seu navegador e os dados inseridos nunca são enviados aos nossos servidores.',
      },
      {
        heading: 'Cookies e Serviços de Terceiros',
        body: 'Utilizamos o Google AdSense para exibir anúncios. O Google AdSense pode usar cookies e tecnologias semelhantes para exibir anúncios com base em suas visitas anteriores a este e outros sites. Você pode desativar a publicidade personalizada visitando as Configurações de anúncios do Google. Também usamos o Google Analytics para entender como os visitantes interagem com nosso site. O Google Analytics coleta dados anônimos como páginas visitadas, tempo no site e tipo de navegador.',
      },
      {
        heading: 'Links de Terceiros',
        body: 'Nosso site pode conter links para sites de terceiros. Não somos responsáveis pelas práticas de privacidade ou conteúdo desses sites.',
      },
      {
        heading: 'Segurança dos Dados',
        body: 'Como não coletamos nem armazenamos dados pessoais em nossos servidores, o risco de violações de dados que afetem suas informações pessoais é mínimo. Todas as ferramentas operam no lado do cliente em seu navegador.',
      },
      {
        heading: 'Alterações nesta Política',
        body: 'Podemos atualizar esta Política de Privacidade de tempos em tempos. Quaisquer alterações serão publicadas nesta página com uma data de revisão atualizada.',
      },
      {
        heading: 'Fale Conosco',
        body: 'Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco em info@toolkitonline.vip.',
      },
    ],
  },
};

export default function PrivacyPage() {
  const params = useParams();
  const lang = (params?.lang as Locale) || 'en';
  const c = content[lang];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <article className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold mb-2">{c.title}</h1>
        <p className="text-sm text-gray-500 mb-8">{c.lastUpdated}</p>
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
