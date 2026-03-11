import Link from 'next/link';

interface ToolCardProps {
  slug: string;
  name: string;
  description: string;
  lang: string;
}

export default function ToolCard({ slug, name, description, lang }: ToolCardProps) {
  return (
    <Link
      href={`/${lang}/tools/${slug}`}
      className="block p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all"
    >
      <h3 className="font-semibold text-lg text-gray-900">{name}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </Link>
  );
}
