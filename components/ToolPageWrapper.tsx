'use client';
import { useParams } from 'next/navigation';
import Breadcrumbs from './Breadcrumbs';
import RelatedTools from './RelatedTools';
import PopularTools from './PopularTools';
import FeedbackWidget from './FeedbackWidget';
import AdPlaceholder from './AdPlaceholder';
import AffiliateBox from './AffiliateBox';
import EmbedTool from './EmbedTool';
import ShareTool from './ShareTool';
import SupportButton from './SupportButton';
import { tools, type Locale } from '@/lib/translations';

const toolCounterTranslations: Record<string, string> = {
  en: '99+ Free Tools Available',
  it: '99+ Strumenti Gratuiti Disponibili',
  es: '99+ Herramientas Gratuitas Disponibles',
  fr: '99+ Outils Gratuits Disponibles',
  de: '99+ Kostenlose Tools Verfügbar',
  pt: '99+ Ferramentas Gratuitas Disponíveis',
};

const howToTranslations: Record<string, {
  howToUse: string;
  step1Name: string;
  step1Desc: string;
  step2Name: string;
  step2Desc: string;
  step3Name: string;
  step3Desc: string;
}> = {
  en: {
    howToUse: 'How to use',
    step1Name: 'Open the tool',
    step1Desc: 'Navigate to the {toolName} page on ToolKit Online',
    step2Name: 'Enter your data',
    step2Desc: 'Fill in the required fields with your values',
    step3Name: 'Get results',
    step3Desc: 'View your results instantly. Copy, save, or export as needed.',
  },
  it: {
    howToUse: 'Come usare',
    step1Name: 'Apri lo strumento',
    step1Desc: 'Vai alla pagina {toolName} su ToolKit Online',
    step2Name: 'Inserisci i tuoi dati',
    step2Desc: 'Compila i campi richiesti con i tuoi valori',
    step3Name: 'Ottieni i risultati',
    step3Desc: 'Visualizza i risultati istantaneamente. Copia, salva o esporta secondo necessità.',
  },
  es: {
    howToUse: 'Cómo usar',
    step1Name: 'Abre la herramienta',
    step1Desc: 'Navega a la página de {toolName} en ToolKit Online',
    step2Name: 'Ingresa tus datos',
    step2Desc: 'Completa los campos requeridos con tus valores',
    step3Name: 'Obtén los resultados',
    step3Desc: 'Visualiza tus resultados al instante. Copia, guarda o exporta según necesites.',
  },
  fr: {
    howToUse: 'Comment utiliser',
    step1Name: "Ouvrir l'outil",
    step1Desc: 'Accédez à la page {toolName} sur ToolKit Online',
    step2Name: 'Entrez vos données',
    step2Desc: 'Remplissez les champs requis avec vos valeurs',
    step3Name: 'Obtenez les résultats',
    step3Desc: 'Consultez vos résultats instantanément. Copiez, enregistrez ou exportez selon vos besoins.',
  },
  de: {
    howToUse: 'So verwenden Sie',
    step1Name: 'Öffnen Sie das Tool',
    step1Desc: 'Navigieren Sie zur {toolName}-Seite auf ToolKit Online',
    step2Name: 'Geben Sie Ihre Daten ein',
    step2Desc: 'Füllen Sie die erforderlichen Felder mit Ihren Werten aus',
    step3Name: 'Ergebnisse erhalten',
    step3Desc: 'Sehen Sie Ihre Ergebnisse sofort. Kopieren, speichern oder exportieren Sie nach Bedarf.',
  },
  pt: {
    howToUse: 'Como usar',
    step1Name: 'Abra a ferramenta',
    step1Desc: 'Navegue até a página {toolName} no ToolKit Online',
    step2Name: 'Insira seus dados',
    step2Desc: 'Preencha os campos obrigatórios com seus valores',
    step3Name: 'Obtenha os resultados',
    step3Desc: 'Veja seus resultados instantaneamente. Copie, salve ou exporte conforme necessário.',
  },
};

interface FaqItem {
  q: string;
  a: string;
}

interface ToolPageWrapperProps {
  toolSlug: string;
  children: React.ReactNode;
  faqItems?: FaqItem[];
}

export default function ToolPageWrapper({ toolSlug, children, faqItems }: ToolPageWrapperProps) {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools[toolSlug]?.[lang];

  const faqSchema = faqItems && faqItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  } : null;

  const webAppSchema = toolT ? {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: toolT.name,
    description: toolT.description,
    url: `https://toolkitonline.vip/${lang}/tools/${toolSlug}`,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: 'ToolKit Online',
    },
    datePublished: '2024-01-01',
    softwareVersion: '2.0',
  } : null;

  const ht = howToTranslations[lang] || howToTranslations['en'];
  const howToSchema = toolT ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `${ht.howToUse} ${toolT.name}`,
    description: toolT.description,
    totalTime: 'PT1M',
    tool: {
      '@type': 'HowToTool',
      name: 'ToolKit Online',
    },
    step: [
      {
        '@type': 'HowToStep',
        name: ht.step1Name,
        text: ht.step1Desc.replace('{toolName}', toolT.name),
      },
      {
        '@type': 'HowToStep',
        name: ht.step2Name,
        text: ht.step2Desc,
      },
      {
        '@type': 'HowToStep',
        name: ht.step3Name,
        text: ht.step3Desc,
      },
    ],
  } : null;

  return (
    <div>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {webAppSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
        />
      )}
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}
      <Breadcrumbs toolSlug={toolSlug} />

      {/* Tool counter social proof */}
      <div className="my-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-green-700 dark:text-green-400 font-medium text-xs">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          <a href={`/${lang}/tools`} className="hover:underline">
            {toolCounterTranslations[lang] || toolCounterTranslations['en']}
          </a>
        </span>
      </div>

      {/* Ad: horizontal banner before tool */}
      <AdPlaceholder
        slot="SLOT_BEFORE_TOOL"
        format="horizontal"
        className="my-4"
      />

      {children}

      {/* Share & Social */}
      <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
        <ShareTool toolSlug={toolSlug} />
      </div>

      {/* Ad: rectangle after tool / before SEO article */}
      <AdPlaceholder
        slot="SLOT_AFTER_TOOL"
        format="rectangle"
        className="my-8"
      />

      {/* Affiliate recommendation */}
      <AffiliateBox toolSlug={toolSlug} />

      <FeedbackWidget toolSlug={toolSlug} />

      {/* Support / Donations */}
      <SupportButton />

      <RelatedTools currentSlug={toolSlug} />

      {/* Embed this tool section */}
      <EmbedTool toolSlug={toolSlug} />

      <PopularTools currentSlug={toolSlug} />

      {/* Ad: horizontal banner after FAQ / related tools */}
      <AdPlaceholder
        slot="SLOT_AFTER_FAQ"
        format="horizontal"
        className="my-4"
      />
    </div>
  );
}
