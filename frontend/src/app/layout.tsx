import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NextTopLoader from 'nextjs-toploader';
import Navbar from '@/components/layout/Navbar';
import TrendingStrip from '@/components/layout/TrendingStrip';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NovaTech — Notícias de IA, Jogos e Animes',
  description: 'As últimas notícias sobre Inteligência Artificial, Jogos e Animes, geradas com assistência de IA.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'NovaTech Blog',
    description: 'Notícias de IA, Jogos e Animes',
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${inter.className} min-h-screen bg-bg text-white antialiased`}
      >
        <NextTopLoader
          color="#6c63ff"
          secondaryColor="#00d4ff"
          height={3}
          showSpinner={false}
          speed={200}
          crawlSpeed={200}
          shadow="0 0 10px #6c63ff, 0 0 5px #6c63ff"
        />
        <Navbar />
        <TrendingStrip />
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
