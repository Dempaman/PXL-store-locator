import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PXL Energy | Butikssökare - Hitta din närmaste butik",
  description: "Hitta PXL Energy i butiker runt om i Sverige. Sök, filtrera och se våra återförsäljare på kartan. This is your power-up!",
  keywords: ["PXL Energy", "energidryck", "gaming", "butik", "återförsäljare", "Sverige", "energidryck Sweden"],
  authors: [{ name: "PXL Energy AB" }],
  icons: {
    icon: "https://pxlpowerup.se/img/fav/favicon-32x32.png",
  },
  openGraph: {
    title: "PXL Energy | Butikssökare",
    description: "Hitta PXL Energy i butiker runt om i Sverige",
    url: "https://pxlpowerup.se",
    siteName: "PXL Energy",
    type: "website",
    images: [
      {
        url: "https://pxlpowerup.se/img/pxl-th.jpg",
        width: 1200,
        height: 800,
        alt: "PXL Energy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PXL Energy | Butikssökare",
    description: "Hitta PXL Energy i butiker runt om i Sverige",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
