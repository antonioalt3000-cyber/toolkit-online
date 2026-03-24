'use client';

import { useState } from 'react';

interface FaqItem {
  q: string;
  a: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mt-10 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">FAQ</h2>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full text-left px-4 py-3 font-medium text-gray-900 flex justify-between items-center"
            >
              {item.q}
              <span className="text-gray-400">{openIndex === i ? '\u2212' : '+'}</span>
            </button>
            {/* Always render answer in DOM for SEO - use CSS to hide/show */}
            <div
              className={`px-4 pb-3 text-gray-600 ${openIndex === i ? '' : 'hidden'}`}
              dangerouslySetInnerHTML={{ __html: item.a }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
