import Link from 'next/link';

interface ToolCardProps {
  slug: string;
  name: string;
  description: string;
  lang: string;
  category?: string;
}

const categoryColors: Record<string, { bg: string; icon: string; border: string }> = {
  finance: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'hover:border-emerald-400' },
  text: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'hover:border-blue-400' },
  health: { bg: 'bg-rose-50', icon: 'text-rose-600', border: 'hover:border-rose-400' },
  conversion: { bg: 'bg-violet-50', icon: 'text-violet-600', border: 'hover:border-violet-400' },
  dev: { bg: 'bg-slate-50', icon: 'text-slate-700', border: 'hover:border-slate-400' },
  math: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'hover:border-amber-400' },
  images: { bg: 'bg-pink-50', icon: 'text-pink-600', border: 'hover:border-pink-400' },
};

function CategoryIcon({ category }: { category: string }) {
  const cls = `w-5 h-5 ${categoryColors[category]?.icon || 'text-gray-500'}`;
  switch (category) {
    case 'finance':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      );
    case 'text':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'health':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    case 'conversion':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      );
    case 'dev':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
    case 'math':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    case 'images':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function ToolCard({ slug, name, description, lang, category }: ToolCardProps) {
  const colors = categoryColors[category || ''] || { bg: 'bg-gray-50', icon: 'text-gray-500', border: 'hover:border-gray-400' };

  return (
    <Link
      href={`/${lang}/tools/${slug}`}
      className={`group flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 ${colors.border} hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5`}
    >
      {category && (
        <div className={`shrink-0 w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <CategoryIcon category={category} />
        </div>
      )}
      <div className="min-w-0">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">{name}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>
      </div>
      <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-500 shrink-0 mt-1 ml-auto transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
