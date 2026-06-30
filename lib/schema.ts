/**
 * Type-safe JSON-LD builders (schema.org) backed by `schema-dts`.
 *
 * Centralises structured-data construction so pages stop hand-writing inline
 * JSON-LD objects. Render the returned object with the <JsonLd /> component.
 * Reuses BASE_URL from lib/seo.ts to stay consistent with canonical URLs.
 */
import type {
  WithContext,
  WebSite,
  FAQPage,
  BreadcrumbList,
  Article,
} from 'schema-dts';
import { BASE_URL } from '@/lib/seo';

const CONTEXT = 'https://schema.org' as const;

export function websiteSchema(): WithContext<WebSite> {
  return {
    '@context': CONTEXT,
    '@type': 'WebSite',
    name: 'ToolKit Online',
    url: BASE_URL,
    description: 'Free online tools for everyday tasks',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/en?q={search_term_string}`,
      // schema-dts types `query-input` loosely; cast keeps it valid JSON-LD.
      'query-input': 'required name=search_term_string',
    } as WithContext<WebSite>['potentialAction'],
  };
}

export function faqSchema(
  items: { question: string; answer: string }[]
): WithContext<FAQPage> {
  return {
    '@context': CONTEXT,
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbSchema(
  crumbs: { name: string; url: string }[]
): WithContext<BreadcrumbList> {
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

export function articleSchema(input: {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
}): WithContext<Article> {
  return {
    '@context': CONTEXT,
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    mainEntityOfPage: input.url,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    author: {
      '@type': 'Organization',
      name: input.authorName ?? 'ToolKit Online',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ToolKit Online',
      url: BASE_URL,
    },
  };
}
