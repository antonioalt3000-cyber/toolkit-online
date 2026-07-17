import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import JsonLd from '@/components/JsonLd';
import WebVitals from '@/components/WebVitals';
import { Partytown } from '@qwik.dev/partytown/react';
import { websiteSchema } from '@/lib/schema';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};

export const metadata: Metadata = {
  title: {
    default: 'ToolKit Online — Free Online Tools',
    template: '%s | ToolKit Online',
  },
  description:
    'Free online tools for everyday tasks. Calculators, converters, text tools and more. Available in 6 languages.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://toolkitonline.vip'),
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    siteName: 'ToolKit Online',
    title: 'ToolKit Online — Free Online Tools',
    description:
      'Free online tools for everyday tasks. Calculators, converters, text tools and more.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ToolKit Online — Free Online Tools',
    description:
      'Free online tools for everyday tasks. Calculators, converters, text tools and more.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Consent Mode v2 — MUST be before any Google script (GDPR) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});`,
          }}
        />
        {/* Partytown: relocate the GA4 library to a web worker (off main thread).
            Consent Mode + gtag stay on the main thread; calls are forwarded. */}
        <Partytown forward={['dataLayer.push', 'gtag']} lib="/partytown/" />
        {/* Google Analytics 4 — runs in the Partytown worker, respects Consent Mode v2.
            no-sync-scripts does not apply: the browser never executes a script of an
            unknown type, so this tag neither blocks parsing nor fetches on the main
            thread — Partytown's loader picks it up and runs it in the worker. It must
            stay a raw <script> with this exact type; next/script would not match. */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          type="text/partytown"
          src="https://www.googletagmanager.com/gtag/js?id=G-30KL6W6WJY"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `gtag('js', new Date());gtag('config', 'G-30KL6W6WJY');`,
          }}
        />
        {/* WebSite structured data (type-safe builder, see lib/schema.ts) */}
        <JsonLd data={websiteSchema()} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        {/* Google AdSense is injected by ConsentManager only after the user grants
            advertising consent. Loading it here unconditionally would bypass that gate. */}
        <WebVitals />
        {children}
      </body>
    </html>
  );
}
