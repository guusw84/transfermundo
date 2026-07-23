import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import PartnerBanner from "@/app/components/PartnerBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.transfermundo.com'),
  title: {
    default: 'TransferMundo — Compare Airport Transfers, Taxis & Public Transport',
    template: '%s | TransferMundo',
  },
  description:
    'Compare every way to reach the city center from top airports. Find the fastest and cheapest trains, buses, private transfers, taxis, and car rentals.',
  keywords: [
    'airport transfer',
    'airport transport',
    'ground transport metasearch',
    'airport taxi',
    'airport train',
    'TransferMundo',
  ],
  openGraph: {
    title: 'TransferMundo — Compare Airport Transfers, Taxis & Public Transport',
    description:
      'Compare every way to reach the city center from top airports. Find the fastest and cheapest trains, buses, private transfers, taxis, and car rentals.',
    url: 'https://www.transfermundo.com',
    siteName: 'TransferMundo',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TransferMundo Airport Transport Comparison',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TransferMundo — Compare Airport Transfers, Taxis & Public Transport',
    description:
      'Compare every way to reach the city center from top airports. Find the fastest and cheapest trains, buses, private transfers, taxis, and car rentals.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        {/* GetYourGuide Analytics */}
        <Script
          src="https://widget.getyourguide.com/dist/pa.umd.production.min.js"
          data-gyg-partner-id="UMC8YRL"
          strategy="afterInteractive"
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <PartnerBanner />
        </Suspense>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
