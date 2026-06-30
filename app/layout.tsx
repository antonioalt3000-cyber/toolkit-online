import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import JsonLd from "@/components/JsonLd";
import WebVitals from "@/components/WebVitals";
import { websiteSchema } from "@/lib/schema";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  title: {
    default: "ToolKit Online — Free Online Tools",
    template: "%s | ToolKit Online",
  },
  description:
    "Free online tools for everyday tasks. Calculators, converters, text tools and more. Available in 6 languages.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://toolkitonline.vip"
  ),
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    siteName: "ToolKit Online",
    title: "ToolKit Online — Free Online Tools",
    description:
      "Free online tools for everyday tasks. Calculators, converters, text tools and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ToolKit Online — Free Online Tools",
    description:
      "Free online tools for everyday tasks. Calculators, converters, text tools and more.",
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
        {/* Google Analytics 4 — loads with consent denied, respects Consent Mode v2 */}
        <script
          async
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
        {/* Google AdSense */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7033623734141087"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <WebVitals />
        {children}
      </body>
    </html>
  );
}
