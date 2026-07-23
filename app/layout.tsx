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
  title: 'TransferMundo – Airport Transport Guides for Europe',
  description:
    'Find the best way to get from the airport to the city centre. Compare trains, buses, taxis and car rental at major European airports.',
  metadataBase: new URL('https://www.transfermundo.com'),
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
