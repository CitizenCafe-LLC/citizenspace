import './globals.css';
import type { Metadata } from 'next';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { Toaster } from '@/components/ui/sonner';
import { Web3Provider } from '@/components/providers/web3-provider';

export const metadata: Metadata = {
  title: 'Citizen Space 3.0 - Help Us Build SF\'s Coffee + Coworking Community',
  description: 'Mint a Founder NFT (0.10 ETH) for lifetime 50% off memberships + founder perks. Help bring back the café-cowork hub SF deserves.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <Web3Provider>
          <Navbar />
          {children}
          <Footer />
          <Toaster />
        </Web3Provider>
      </body>
    </html>
  );
}