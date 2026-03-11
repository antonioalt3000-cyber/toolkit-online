import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Analytics from "@/components/Analytics";
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
    process.env.NEXT_PUBLIC_SITE_URL || "https://toolkit-online-gamma.vercel.app"
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
        <Analytics />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WKG7WCXZ"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
