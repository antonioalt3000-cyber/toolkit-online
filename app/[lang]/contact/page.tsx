'use client';
import { useParams } from 'next/navigation';
import { type Locale } from '@/lib/translations';

const content: Record<Locale, { title: string; intro: string; emailLabel: string; responseNote: string; sections: { heading: string; body: string }[] }> = {
  en: {
    title: 'Contact Us',
    intro: 'We would love to hear from you! Whether you have a question, suggestion, or feedback about our tools, feel free to reach out.',
    emailLabel: 'Email',
    responseNote: 'We typically respond within 1-2 business days.',
    sections: [
      {
        heading: 'Bug Reports',
        body: 'Found something that is not working correctly? Please include the tool name, your browser, and a description of the issue.',
      },
      {
        heading: 'Feature Requests',
        body: 'Have an idea for a new tool or improvement? We are always looking to expand our collection and welcome your suggestions.',
      },
      {
        heading: 'General Inquiries',
        body: 'For any other questions about ToolKit Online, including partnership or advertising inquiries, send us an email.',
      },
    ],
  },
  it: {
    title: 'Contattaci',
    intro: 'Ci farebbe piacere sentirti! Che tu abbia una domanda, un suggerimento o un feedback sui nostri strumenti, non esitare a contattarci.',
    emailLabel: 'Email',
    responseNote: 'Di solito rispondiamo entro 1-2 giorni lavorativi.',
    sections: [
      {
        heading: 'Segnalazione Bug',
        body: 'Hai trovato qualcosa che non funziona correttamente? Includi il nome dello strumento, il tuo browser e una descrizione del problema.',
      },
      {
        heading: 'Richieste di Funzionalità',
        body: 'Hai un\'idea per un nuovo strumento o miglioramento? Siamo sempre alla ricerca di espandere la nostra collezione e accogliamo i tuoi suggerimenti.',
      },
      {
        heading: 'Richieste Generali',
        body: 'Per qualsiasi altra domanda su ToolKit Online, incluse richieste di partnership o pubblicità, inviaci un\'email.',
      },
    ],
  },
  es: {
    title: 'Contáctanos',
    intro: 'Nos encantaría saber de ti. Ya sea que tengas una pregunta, sugerencia o comentario sobre nuestras herramientas, no dudes en escribirnos.',
    emailLabel: 'Correo electrónico',
    responseNote: 'Normalmente respondemos en 1-2 días hábiles.',
    sections: [
      {
        heading: 'Reportar Errores',
        body: 'Encontraste algo que no funciona correctamente? Por favor incluye el nombre de la herramienta, tu navegador y una descripción del problema.',
      },
      {
        heading: 'Solicitudes de Funciones',
        body: 'Tienes una idea para una nueva herramienta o mejora? Siempre estamos buscando expandir nuestra colección y damos la bienvenida a tus sugerencias.',
      },
      {
        heading: 'Consultas Generales',
        body: 'Para cualquier otra pregunta sobre ToolKit Online, incluyendo consultas de asociación o publicidad, envíanos un correo.',
      },
    ],
  },
  fr: {
    title: 'Contactez-nous',
    intro: 'Nous serions ravis de vous entendre ! Que vous ayez une question, une suggestion ou un retour sur nos outils, n\'hésitez pas à nous contacter.',
    emailLabel: 'E-mail',
    responseNote: 'Nous répondons généralement sous 1 à 2 jours ouvrables.',
    sections: [
      {
        heading: 'Signaler un Bug',
        body: 'Vous avez trouvé quelque chose qui ne fonctionne pas correctement ? Veuillez inclure le nom de l\'outil, votre navigateur et une description du problème.',
      },
      {
        heading: 'Demandes de Fonctionnalités',
        body: 'Vous avez une idée pour un nouvel outil ou une amélioration ? Nous cherchons toujours à élargir notre collection et vos suggestions sont les bienvenues.',
      },
      {
        heading: 'Demandes Générales',
        body: 'Pour toute autre question sur ToolKit Online, y compris les demandes de partenariat ou de publicité, envoyez-nous un e-mail.',
      },
    ],
  },
  de: {
    title: 'Kontakt',
    intro: 'Wir freuen uns von Ihnen zu hören! Ob Sie eine Frage, einen Vorschlag oder Feedback zu unseren Werkzeugen haben, kontaktieren Sie uns gerne.',
    emailLabel: 'E-Mail',
    responseNote: 'Wir antworten in der Regel innerhalb von 1-2 Werktagen.',
    sections: [
      {
        heading: 'Fehler Melden',
        body: 'Haben Sie etwas gefunden, das nicht richtig funktioniert? Bitte geben Sie den Werkzeugnamen, Ihren Browser und eine Beschreibung des Problems an.',
      },
      {
        heading: 'Funktionswünsche',
        body: 'Haben Sie eine Idee für ein neues Werkzeug oder eine Verbesserung? Wir sind immer bestrebt, unsere Sammlung zu erweitern und freuen uns über Ihre Vorschläge.',
      },
      {
        heading: 'Allgemeine Anfragen',
        body: 'Für alle anderen Fragen zu ToolKit Online, einschließlich Partnerschafts- oder Werbeanfragen, senden Sie uns eine E-Mail.',
      },
    ],
  },
  pt: {
    title: 'Fale Conosco',
    intro: 'Adoraríamos ouvir de você! Seja uma pergunta, sugestão ou feedback sobre nossas ferramentas, não hesite em entrar em contato.',
    emailLabel: 'E-mail',
    responseNote: 'Normalmente respondemos em 1-2 dias úteis.',
    sections: [
      {
        heading: 'Reportar Bugs',
        body: 'Encontrou algo que não está funcionando corretamente? Por favor, inclua o nome da ferramenta, seu navegador e uma descrição do problema.',
      },
      {
        heading: 'Solicitação de Recursos',
        body: 'Tem uma ideia para uma nova ferramenta ou melhoria? Estamos sempre buscando expandir nossa coleção e suas sugestões são bem-vindas.',
      },
      {
        heading: 'Consultas Gerais',
        body: 'Para qualquer outra pergunta sobre o ToolKit Online, incluindo consultas de parceria ou publicidade, envie-nos um e-mail.',
      },
    ],
  },
};

export default function ContactPage() {
  const params = useParams();
  const lang = (params?.lang as Locale) || 'en';
  const c = content[lang];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <article className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold mb-4">{c.title}</h1>
        <p className="text-gray-700 leading-relaxed mb-8">{c.intro}</p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <p className="text-sm font-medium text-gray-600 mb-1">{c.emailLabel}</p>
          <a
            href="mailto:info@toolkitonline.vip"
            className="text-xl font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            info@toolkitonline.vip
          </a>
          <p className="text-sm text-gray-500 mt-2">{c.responseNote}</p>
        </div>

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
