import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
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
        <Navbar />
        <TrendingStrip />
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
