'use client';

import { useEffect, useCallback } from 'react';

export type ConsentState = {
  essential: boolean;
  analytics: boolean;
  advertising: boolean;
  timestamp: string;
};

export const CONSENT_KEY = 'cookie-consent-v2';

export function getConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentState;
  } catch {
    return null;
  }
}

export function setConsent(state: ConsentState) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('consent-updated', { detail: state }));
}

const GTM_ID = 'GTM-WKG7WCXZ';
const ADSENSE_CLIENT = 'ca-pub-7033623734141087';

function injectGTM() {
  if (document.getElementById('gtm-script')) return;
  // dataLayer init
  (window as unknown as Record<string, unknown>).dataLayer = (window as unknown as Record<string, unknown>).dataLayer || [];
  ((window as unknown as Record<string, unknown>).dataLayer as unknown[]).push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  });
  // GTM script
  const script = document.createElement('script');
  script.id = 'gtm-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(script);
  // GTM noscript iframe
  const existing = document.getElementById('gtm-noscript-iframe');
  if (!existing) {
    const noscript = document.createElement('noscript');
    noscript.id = 'gtm-noscript';
    const iframe = document.createElement('iframe');
    iframe.id = 'gtm-noscript-iframe';
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    noscript.appendChild(iframe);
    document.body.insertBefore(noscript, document.body.firstChild);
  }
}

function injectAdSense() {
  if (document.getElementById('adsense-script')) return;
  const script = document.createElement('script');
  script.id = 'adsense-script';
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}

export default function ConsentManager() {
  const applyConsent = useCallback((consent: ConsentState) => {
    if (consent.analytics) {
      injectGTM();
    }
    if (consent.advertising) {
      injectAdSense();
    }
  }, []);

  useEffect(() => {
    // Check existing consent on mount
    const consent = getConsent();
    if (consent) {
      applyConsent(consent);
    }

    // Listen for consent updates
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ConsentState>).detail;
      applyConsent(detail);
    };
    window.addEventListener('consent-updated', handler);
    return () => window.removeEventListener('consent-updated', handler);
  }, [applyConsent]);

  return null;
}
