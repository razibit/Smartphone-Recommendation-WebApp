import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppLayout } from "@/components/Layout";
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
  title: {
    default: "PhoneDB - Mobile Phone Database",
    template: "%s | PhoneDB"
  },
  description: "A comprehensive mobile phone database demonstrating proper database normalization and modern web development practices. Browse, filter, and compare thousands of mobile phones.",
  keywords: ["mobile phones", "database", "normalization", "comparison", "specifications", "phones", "DBMS", "3NF", "BCNF"],
  authors: [{ name: "PhoneDB Team" }],
  creator: "PhoneDB",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "PhoneDB - Mobile Phone Database",
    description: "Browse, filter, and compare thousands of mobile phones with our comprehensive database.",
    siteName: "PhoneDB",
  },
  twitter: {
    card: "summary_large_image",
    title: "PhoneDB - Mobile Phone Database",
    description: "Browse, filter, and compare thousands of mobile phones with our comprehensive database.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
