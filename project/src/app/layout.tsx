import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { StoreProvider } from '@/components/commerce/StoreProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { GSAPProvider } from '@/components/GSAPProvider';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Prorasys - AI-Powered E-Commerce',
  description: 'Modern trust-aware commerce with AI recommendations',
};

export const viewport: Viewport = {
  themeColor: '#0F6E56',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning
      data-scroll-behavior="smooth"  // ✅ Add this to fix the warning
    >
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <GSAPProvider>
            <StoreProvider>
              {children}
            </StoreProvider>
          </GSAPProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}