import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
    <html lang="en">
      <head>
        {/* Google Consent Mode v2 — MUST be before any Google script (GDPR) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});`,
          }}
        />
        {/* Google AdSense — loads with consent denied, respects Consent Mode v2 */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7033623734141087"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "ToolKit Online",
              url: "https://toolkitonline.vip",
              description: "Free online tools for everyday tasks",
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://toolkitonline.vip/en?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
