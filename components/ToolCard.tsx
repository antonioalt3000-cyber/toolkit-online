import Link from 'next/link';

interface ToolCardProps {
  slug: string;
  name: string;
  description: string;
  lang: string;
  category?: string;
}

const categoryAccent: Record<string, { icon: string; glow: string; iconBg: string }> = {
  finance: { icon: 'text-emerald-400', glow: 'hover:border-emerald-500/40 hover:shadow-emerald-500/5', iconBg: 'bg-emerald-500/10' },
  text:     { icon: 'text-blue-400',   glow: 'hover:border-blue-500/40 hover:shadow-blue-500/5',     iconBg: 'bg-blue-500/10' },
  health:   { icon: 'text-rose-400',   glow: 'hover:border-rose-500/40 hover:shadow-rose-500/5',     iconBg: 'bg-rose-500/10' },
  conversion:{ icon: 'text-violet-400',glow: 'hover:border-violet-500/40 hover:shadow-violet-500/5', iconBg: 'bg-violet-500/10' },
  dev:      { icon: 'text-amber-400',  glow: 'hover:border-amber-500/40 hover:shadow-amber-500/5',   iconBg: 'bg-amber-500/10' },
  math:     { icon: 'text-cyan-400',   glow: 'hover:border-cyan-500/40 hover:shadow-cyan-500/5',     iconBg: 'bg-cyan-500/10' },
  images:   { icon: 'text-pink-400',   glow: 'hover:border-pink-500/40 hover:shadow-pink-500/5',     iconBg: 'bg-pink-500/10' },
};

function CategoryIcon({ category }: { category: string }) {
  const cls = `w-4 h-4 ${categoryAccent[category]?.icon || 'text-zinc-400'}`;
  switch (category) {
    case 'finance':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>;
    case 'text':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    case 'health':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
    case 'conversion':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>;
    case 'dev':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
    case 'math':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
    case 'images':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
    default:
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
  }
}

export default function ToolCard({ slug, name, description, lang, category }: ToolCardProps) {
  const accent = categoryAccent[category || ''] || { icon: 'text-zinc-400', glow: 'hover:border-zinc-600', iconBg: 'bg-zinc-800' };

  return (
    <Link
      href={`/${lang}/tools/${slug}`}
      className={`group flex items-start gap-3.5 p-4 bg-zinc-900/60 rounded-xl border border-zinc-800/80 ${accent.glow} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}
    >
      {category && (
        <div className={`shrink-0 w-9 h-9 ${accent.iconBg} rounded-lg flex items-center justify-center border border-white/5`}>
          <CategoryIcon category={category} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-zinc-100 group-hover:text-white transition-colors leading-tight text-sm">{name}</h3>
        <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2 leading-relaxed">{description}</p>
      </div>
      <svg className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-400 shrink-0 mt-1 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
