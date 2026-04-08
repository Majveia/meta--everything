import type { Metadata, Viewport } from 'next';
import { Instrument_Serif, Outfit } from 'next/font/google';
import ErrorBoundary from '@/components/atoms/ErrorBoundary';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://metaeverything.app'),
  title: 'meta//everything',
  description: 'The void generates. Everything recurses.',
  manifest: '/manifest.json',
  openGraph: {
    title: 'meta//everything',
    description: 'The void generates. Everything recurses.',
    type: 'website',
    siteName: 'meta//everything',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'meta//everything',
    description: 'The void generates. Everything recurses.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'meta//everything',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0A0A0A',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${outfit.variable}`}>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
