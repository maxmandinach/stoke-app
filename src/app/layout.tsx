import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNavigation from "@/components/BottomNavigation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stoke - Mindful Knowledge Retention",
  description: "Transform passive content consumption into active understanding through gentle, intelligent review cycles that respect your cognitive bandwidth",
  keywords: ["learning", "knowledge retention", "spaced repetition", "mindful technology", "AI-assisted learning"],
  authors: [{ name: "Stoke Team" }],
  creator: "Stoke",
  publisher: "Stoke",
  metadataBase: new URL('https://stoke-app.vercel.app'),
  
  // PWA Configuration
  manifest: "/manifest.json",
  
  // App Icons and Favicons
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    shortcut: "/favicon.svg"
  },
  
  // App-specific metadata
  applicationName: "Stoke",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Stoke"
  },
  
  // Open Graph
  openGraph: {
    type: "website",
    title: "Stoke - Mindful Knowledge Retention",
    description: "Transform passive content consumption into active understanding through gentle, intelligent review cycles",
    siteName: "Stoke",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Stoke Memory Waves Logo"
      }
    ]
  },
  
  // Twitter Card
  twitter: {
    card: "summary",
    title: "Stoke - Mindful Knowledge Retention",
    description: "Transform passive content consumption into active understanding",
    images: ["/icon-512.png"]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#2563EB",
  colorScheme: "light"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Additional PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Stoke" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#2563EB" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body
        className={`${inter.variable} antialiased min-h-screen bg-white`}
      >
        <div className="flex flex-col min-h-screen">
          <main className="flex-1 pb-[60px]">
            {children}
          </main>
          <BottomNavigation />
        </div>
      </body>
    </html>
  );
}
