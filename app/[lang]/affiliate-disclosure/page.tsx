'use client';
import { useParams } from 'next/navigation';
import type { Locale } from '@/lib/translations';

const content: Record<Locale, { title: string; lastUpdated: string; sections: { heading: string; text: string }[] }> = {
  en: {
    title: 'Affiliate Disclosure',
    lastUpdated: 'Last updated: March 2026',
    sections: [
      {
        heading: 'About Our Recommendations',
        text: 'ToolKit Online is a free platform offering 143+ online tools. To keep our tools free, some pages contain affiliate links to products and services we recommend. When you click these links and make a purchase, we may earn a small commission at no additional cost to you.',
      },
      {
        heading: 'How Affiliate Links Work',
        text: 'Affiliate links are clearly marked with a "Sponsored" label. These links use tracking parameters so the merchant knows the referral came from our site. You pay the same price whether you use our link or go directly to the merchant.',
      },
      {
        heading: 'Our Commitment',
        text: 'We only recommend products and services that we believe provide genuine value. Our tools remain 100% free and fully functional regardless of whether you click on any affiliate link. Affiliate partnerships never influence the functionality or results of our tools.',
      },
      {
        heading: 'Contact',
        text: 'If you have questions about our affiliate relationships, please contact us through our contact page.',
      },
    ],
  },
  it: {
    title: 'Informativa sui Link di Affiliazione',
    lastUpdated: 'Ultimo aggiornamento: Marzo 2026',
    sections: [
      {
        heading: 'Le Nostre Raccomandazioni',
        text: 'ToolKit Online offre oltre 143 strumenti gratuiti. Per mantenere i nostri strumenti gratuiti, alcune pagine contengono link di affiliazione a prodotti e servizi che raccomandiamo. Quando clicchi su questi link ed effettui un acquisto, potremmo ricevere una piccola commissione senza costi aggiuntivi per te.',
      },
      {
        heading: 'Come Funzionano i Link di Affiliazione',
        text: 'I link di affiliazione sono chiaramente contrassegnati con l\'etichetta "Sponsorizzato". Questi link utilizzano parametri di tracciamento in modo che il commerciante sappia che il riferimento proviene dal nostro sito. Paghi lo stesso prezzo sia che utilizzi il nostro link o che vada direttamente al commerciante.',
      },
      {
        heading: 'Il Nostro Impegno',
        text: 'Raccomandiamo solo prodotti e servizi che riteniamo offrano un valore genuino. I nostri strumenti rimangono gratuiti al 100% e completamente funzionali indipendentemente dal fatto che tu clicchi su un link di affiliazione. Le partnership di affiliazione non influenzano mai la funzionalità o i risultati dei nostri strumenti.',
      },
      {
        heading: 'Contatti',
        text: 'Per domande sulle nostre relazioni di affiliazione, contattaci tramite la nostra pagina contatti.',
      },
    ],
  },
  es: {
    title: 'Divulgación de Afiliados',
    lastUpdated: 'Última actualización: Marzo 2026',
    sections: [
      {
        heading: 'Sobre Nuestras Recomendaciones',
        text: 'ToolKit Online ofrece más de 143 herramientas gratuitas. Para mantener nuestras herramientas gratuitas, algunas páginas contienen enlaces de afiliados a productos y servicios que recomendamos. Cuando haces clic en estos enlaces y realizas una compra, podemos ganar una pequeña comisión sin costo adicional para ti.',
      },
      {
        heading: 'Cómo Funcionan los Enlaces de Afiliados',
        text: 'Los enlaces de afiliados están claramente marcados con la etiqueta "Patrocinado". Estos enlaces utilizan parámetros de seguimiento para que el comerciante sepa que la referencia proviene de nuestro sitio. Pagas el mismo precio tanto si usas nuestro enlace como si vas directamente al comerciante.',
      },
      {
        heading: 'Nuestro Compromiso',
        text: 'Solo recomendamos productos y servicios que creemos que proporcionan un valor genuino. Nuestras herramientas permanecen 100% gratuitas y completamente funcionales independientemente de si haces clic en un enlace de afiliado. Las asociaciones de afiliados nunca influyen en la funcionalidad o los resultados de nuestras herramientas.',
      },
      {
        heading: 'Contacto',
        text: 'Si tienes preguntas sobre nuestras relaciones de afiliación, contáctanos a través de nuestra página de contacto.',
      },
    ],
  },
  fr: {
    title: 'Divulgation d\'Affiliation',
    lastUpdated: 'Dernière mise à jour : Mars 2026',
    sections: [
      {
        heading: 'À Propos de Nos Recommandations',
        text: 'ToolKit Online propose plus de 143 outils gratuits. Pour maintenir nos outils gratuits, certaines pages contiennent des liens d\'affiliation vers des produits et services que nous recommandons. Lorsque vous cliquez sur ces liens et effectuez un achat, nous pouvons percevoir une petite commission sans frais supplémentaires pour vous.',
      },
      {
        heading: 'Comment Fonctionnent les Liens d\'Affiliation',
        text: 'Les liens d\'affiliation sont clairement marqués avec l\'étiquette "Sponsorisé". Ces liens utilisent des paramètres de suivi pour que le commerçant sache que la recommandation provient de notre site. Vous payez le même prix que vous utilisiez notre lien ou que vous alliez directement chez le commerçant.',
      },
      {
        heading: 'Notre Engagement',
        text: 'Nous ne recommandons que des produits et services qui, selon nous, apportent une valeur réelle. Nos outils restent 100% gratuits et entièrement fonctionnels, que vous cliquiez ou non sur un lien d\'affiliation.',
      },
      {
        heading: 'Contact',
        text: 'Pour toute question sur nos relations d\'affiliation, contactez-nous via notre page de contact.',
      },
    ],
  },
  de: {
    title: 'Affiliate-Offenlegung',
    lastUpdated: 'Letzte Aktualisierung: März 2026',
    sections: [
      {
        heading: 'Über Unsere Empfehlungen',
        text: 'ToolKit Online bietet über 143 kostenlose Tools. Um unsere Tools kostenlos zu halten, enthalten einige Seiten Affiliate-Links zu Produkten und Diensten, die wir empfehlen. Wenn Sie auf diese Links klicken und einen Kauf tätigen, erhalten wir möglicherweise eine kleine Provision ohne zusätzliche Kosten für Sie.',
      },
      {
        heading: 'Wie Affiliate-Links Funktionieren',
        text: 'Affiliate-Links sind deutlich mit dem Label "Gesponsert" gekennzeichnet. Diese Links verwenden Tracking-Parameter, damit der Händler weiß, dass die Empfehlung von unserer Website stammt. Sie zahlen den gleichen Preis, unabhängig davon, ob Sie unseren Link verwenden oder direkt zum Händler gehen.',
      },
      {
        heading: 'Unser Engagement',
        text: 'Wir empfehlen nur Produkte und Dienste, von denen wir glauben, dass sie echten Mehrwert bieten. Unsere Tools bleiben zu 100% kostenlos und voll funktionsfähig, unabhängig davon, ob Sie auf einen Affiliate-Link klicken.',
      },
      {
        heading: 'Kontakt',
        text: 'Bei Fragen zu unseren Affiliate-Beziehungen kontaktieren Sie uns über unsere Kontaktseite.',
      },
    ],
  },
  pt: {
    title: 'Divulgação de Afiliados',
    lastUpdated: 'Última atualização: Março 2026',
    sections: [
      {
        heading: 'Sobre Nossas Recomendações',
        text: 'O ToolKit Online oferece mais de 143 ferramentas gratuitas. Para manter nossas ferramentas gratuitas, algumas páginas contêm links de afiliados para produtos e serviços que recomendamos. Quando você clica nesses links e faz uma compra, podemos ganhar uma pequena comissão sem custo adicional para você.',
      },
      {
        heading: 'Como Funcionam os Links de Afiliados',
        text: 'Os links de afiliados são claramente marcados com o rótulo "Patrocinado". Esses links usam parâmetros de rastreamento para que o comerciante saiba que a indicação veio do nosso site. Você paga o mesmo preço usando nosso link ou indo diretamente ao comerciante.',
      },
      {
        heading: 'Nosso Compromisso',
        text: 'Recomendamos apenas produtos e serviços que acreditamos oferecer valor genuíno. Nossas ferramentas permanecem 100% gratuitas e totalmente funcionais, independentemente de você clicar em um link de afiliado.',
      },
      {
        heading: 'Contato',
        text: 'Para dúvidas sobre nossas relações de afiliação, entre em contato conosco pela nossa página de contato.',
      },
    ],
  },
};

export default function AffiliateDisclosurePage() {
  const { lang } = useParams() as { lang: Locale };
  const locale = lang || 'en';
  const page = content[locale] || content.en;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{page.title}</h1>
      <p className="text-sm text-gray-500 mb-8">{page.lastUpdated}</p>
      {page.sections.map((section, i) => (
        <div key={i} className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{section.heading}</h2>
          <p className="text-gray-600 leading-relaxed">{section.text}</p>
        </div>
      ))}
    </div>
  );
}
