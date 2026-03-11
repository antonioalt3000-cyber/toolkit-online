'use client';
import Breadcrumbs from './Breadcrumbs';
import RelatedTools from './RelatedTools';

interface ToolPageWrapperProps {
  toolSlug: string;
  children: React.ReactNode;
}

export default function ToolPageWrapper({ toolSlug, children }: ToolPageWrapperProps) {
  return (
    <div>
      <Breadcrumbs toolSlug={toolSlug} />
      {children}
      <RelatedTools currentSlug={toolSlug} />
    </div>
  );
}
