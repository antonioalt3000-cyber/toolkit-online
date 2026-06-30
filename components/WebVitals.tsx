'use client';

import { useEffect } from 'react';
import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';

/**
 * Reports real-user Core Web Vitals to the GTM/GA4 dataLayer.
 *
 * Pure performance telemetry — no PII, consent-independent. GTM can forward
 * these `web-vitals` events to GA4 as custom events for INP/LCP/CLS monitoring.
 */
declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

function report(metric: Metric) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'web-vitals',
    metric_name: metric.name,
    // CLS is unitless; scale ×1000 so it survives integer reporting.
    metric_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    metric_id: metric.id,
    metric_rating: metric.rating,
  });
}

export default function WebVitals() {
  useEffect(() => {
    onCLS(report);
    onINP(report);
    onLCP(report);
    onFCP(report);
    onTTFB(report);
  }, []);

  return null;
}
