'use client';

import { useEffect, useRef } from 'react';

const AD_CLIENT = 'ca-pub-7033623734141087';

// Set to true once AdSense is approved and you want to show real ads
const ADSENSE_ENABLED = false;

interface AdPlaceholderProps {
  slot?: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
}

const formatStyles: Record<string, { minHeight: string; mobileMinHeight: string }> = {
  auto: { minHeight: '90px', mobileMinHeight: '50px' },
  horizontal: { minHeight: '90px', mobileMinHeight: '50px' },
  rectangle: { minHeight: '250px', mobileMinHeight: '200px' },
  vertical: { minHeight: '600px', mobileMinHeight: '300px' },
};

export default function AdPlaceholder({
  slot,
  format = 'auto',
  className = '',
}: AdPlaceholderProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!ADSENSE_ENABLED || !slot || pushed.current) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded yet — fail silently
    }
  }, [slot]);

  const styles = formatStyles[format] || formatStyles.auto;

  // When AdSense is enabled and a slot is provided, render the real ad unit
  if (ADSENSE_ENABLED && slot) {
    return (
      <div ref={adRef} className={`w-full overflow-hidden ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={slot}
          data-ad-format={format === 'auto' ? 'auto' : undefined}
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Placeholder: subtle, non-intrusive, responsive
  return (
    <div
      className={`w-full flex items-center justify-center ${className}`}
      style={{ minHeight: styles.minHeight }}
      aria-hidden="true"
    >
      <div className="w-full max-w-3xl mx-auto">
        <div className="border border-dashed border-gray-200 rounded-lg bg-gray-50/50 flex items-center justify-center py-2 sm:py-3"
          style={{ minHeight: styles.mobileMinHeight }}
        >
          <span className="text-[10px] text-gray-300 select-none tracking-wider uppercase">
            Ad Space
          </span>
        </div>
      </div>
    </div>
  );
}
