import './globals.css'
import type { Metadata } from 'next'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Web3Provider } from '@/components/providers/web3-provider'
import { MobileTabBar } from '@/components/site/mobile-tab-bar'
import { WebMCPRegistration } from '@/components/site/web-mcp'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { SITE } from '@/lib/site/content'
import { localBusinessJsonLd, jsonLdScript } from '@/lib/site/jsonld'

const title = 'Citizen Space · Santa Cruz Builder Lab · Coworking at 819 Pacific Ave'
const description =
  'Community-run coworking in downtown Santa Cruz. $12 day passes, $124/mo flex desks, a conference room, a podcast studio and 2-gig internet. Founding 50 memberships open December 1, 2026.'

export const metadata: Metadata = {
  title: { default: title, template: '%s | Citizen Space' },
  description,
  // Edge-to-edge on phones so the tab bar can sit in the safe area, like a native app.
  viewport: { width: 'device-width', initialScale: 1, viewportFit: 'cover' },
  themeColor: '#FAF7F1',
  appleWebApp: { capable: true, title: 'Citizen Space', statusBarStyle: 'default' },
  keywords: [
    'coworking Santa Cruz',
    'affordable coworking Santa Cruz',
    'day pass Santa Cruz',
    'podcast studio Santa Cruz',
    'meeting room Santa Cruz',
    'virtual office Santa Cruz',
    'Citizen Space',
    'Santa Cruz Builder Lab',
  ],
  authors: [{ name: SITE.legalName }],
  creator: SITE.legalName,
  metadataBase: new URL(SITE.url),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE.url,
    siteName: SITE.name,
    title,
    description,
    images: [
      {
        url: '/brand/photos/02-main-shared-room.jpg',
        width: 640,
        height: 480,
        alt: 'The main shared room at 819 Pacific Ave',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/brand/photos/02-main-shared-room.jpg'],
  },
  icons: { icon: '/brand/logos/logo-badge.png', apple: '/brand/logos/logo-badge.png' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* next/font fails on Fraunces + DM Sans in Next 13.5, so the brand fonts load from Google Fonts directly. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400..800&family=DM+Sans:wght@400;500;600;700&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(localBusinessJsonLd())}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-brand-paper font-sans text-brand-ink antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Web3Provider>
            <AuthProvider>
              <Navigation />
              <main className="flex-1">{children}</main>
              <Footer />
              <MobileTabBar />
              <Toaster />
              <WebMCPRegistration />
            </AuthProvider>
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  )
}
