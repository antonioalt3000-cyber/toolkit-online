'use client';
import { useParams } from 'next/navigation';
import Breadcrumbs from './Breadcrumbs';
import RelatedTools from './RelatedTools';
import PopularTools from './PopularTools';
import FeedbackWidget from './FeedbackWidget';
import AdPlaceholder from './AdPlaceholder';
import { tools, type Locale } from '@/lib/translations';

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
      <Breadcrumbs toolSlug={toolSlug} />

      {/* Ad: horizontal banner before tool */}
      <AdPlaceholder
        slot="SLOT_BEFORE_TOOL"
        format="horizontal"
        className="my-4"
      />

      {children}

      {/* Ad: rectangle after tool / before SEO article */}
      <AdPlaceholder
        slot="SLOT_AFTER_TOOL"
        format="rectangle"
        className="my-8"
      />

      <FeedbackWidget toolSlug={toolSlug} />

      <RelatedTools currentSlug={toolSlug} />

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
