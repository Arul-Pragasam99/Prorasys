import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { StoreProvider } from '@/components/commerce/StoreProvider';

// Import CSS directly (the proper Next.js way)
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Prorasys - AI-Powered E-Commerce',
    template: '%s | Prorasys',
  },
  description: 'Modern trust-aware commerce experience with AI-powered recommendations',
  keywords: ['e-commerce', 'AI', 'shopping', 'trust score', 'recommendations'],
  authors: [{ name: 'Prorasys' }],
  creator: 'Prorasys',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://prorasys.com',
    title: 'Prorasys - AI-Powered E-Commerce',
    description: 'Modern trust-aware commerce experience with AI-powered recommendations',
    siteName: 'Prorasys',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#0284c7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}