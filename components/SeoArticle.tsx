'use client';
import { useParams } from 'next/navigation';
import { type Locale } from '@/lib/translations';
import { seoContent } from '@/lib/seo-content';

export default function SeoArticle({ toolSlug }: { toolSlug: string }) {
  const { lang } = useParams() as { lang: Locale };
  const content = seoContent[toolSlug]?.[lang];
  if (!content) return null;
  return (
    <article className="mt-10 prose prose-gray max-w-none">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  );
}
