import './globals.css';
import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Web3Provider } from '@/components/providers/web3-provider';
import { ThemeProvider } from 'next-themes';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const manrope = Manrope({ 
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Citizen Space — Where Coffee Meets Power in Santa Cruz',
    template: '%s | Citizen Space'
  },
  description: 'Where coffee meets power in Santa Cruz. A caffeinated coworking hub with hourly seats, day passes, memberships, and great coffee.',
  keywords: ['coworking', 'coffee', 'santa cruz', 'workspace', 'cafe', 'meetings', 'remote work'],
  authors: [{ name: 'Citizen Space' }],
  creator: 'Citizen Space',
  metadataBase: new URL('https://citizenspace.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://citizenspace.com',
    siteName: 'Citizen Space',
    title: 'Citizen Space — Where Coffee Meets Power in Santa Cruz',
    description: 'Where coffee meets power in Santa Cruz. A caffeinated coworking hub with hourly seats, day passes, memberships, and great coffee.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Citizen Space - Coffee + Coworking',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Citizen Space — Where Coffee Meets Power in Santa Cruz',
    description: 'Where coffee meets power in Santa Cruz. A caffeinated coworking hub with hourly seats, day passes, memberships, and great coffee.',
    images: ['/og-image.png'],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        inter.variable,
        manrope.variable,
        'min-h-screen bg-background font-sans antialiased'
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Web3Provider>
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}