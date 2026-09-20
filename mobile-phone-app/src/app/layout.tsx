import type { Metadata, Viewport } from 'next';
import { AppLayout } from '@/components/Layout';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'PhoneDB | Mobile phone specifications',
    template: '%s | PhoneDB',
  },
  description: 'Search, inspect, and compare mobile phone specifications from a structured MySQL-backed catalogue.',
  keywords: ['mobile phones', 'phone specifications', 'phone comparison', 'device catalogue'],
  applicationName: 'PhoneDB',
  authors: [{ name: 'PhoneDB maintainers' }],
  creator: 'PhoneDB',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'PhoneDB | Mobile phone specifications',
    description: 'Search and compare mobile phone specifications.',
    siteName: 'PhoneDB',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
