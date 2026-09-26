import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { StoreProvider } from '@/components/commerce/StoreProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import { Analytics } from "@vercel/analytics/next"  
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Prorasys - AI-Powered E-Commerce',
  description: 'Modern trust-aware commerce with AI recommendations',
  manifest: '/manifest.json',
  icons: {
    icon: '/Prorasys%20Logo.png',
    shortcut: '/Prorasys%20Logo.png',
    apple: '/Prorasys%20Logo.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0F6E56',
  width: 'device-width',
  initialScale: 1,
};

const themeScript = `
  (function() {
    try {
      const stored = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = stored ? stored === 'dark' : prefersDark;
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    } catch (error) {
      document.documentElement.classList.remove('dark');
      document.documentElement.dataset.theme = 'light';
      document.documentElement.style.colorScheme = 'light';
    }
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.className} antialiased`}>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ServiceWorkerRegistration />
        <ThemeProvider>
          <StoreProvider>
            {children}
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}