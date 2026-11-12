import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NextTopLoader from 'nextjs-toploader';
import Navbar from '@/components/layout/Navbar';
import TrendingStrip from '@/components/layout/TrendingStrip';
import Footer from '@/components/layout/Footer';
import SearchPalette from '@/components/search/SearchPalette';
import { SearchPaletteProvider } from '@/components/search/SearchPaletteProvider';
import { I18nProvider } from '@/i18n/I18nProvider';
import { getI18n } from '@/i18n/server';

const inter = Inter({ subsets: ['latin'] });

export function generateMetadata(): Metadata {
  const { dict } = getI18n();

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    icons: {
      icon: '/favicon.svg',
      shortcut: '/favicon.svg',
    },
    openGraph: {
      title: dict.meta.ogTitle,
      description: dict.meta.ogDescription,
      locale: dict.meta.ogLocale,
      type: 'website',
    },
  };
}

const themeScript =
  "try{document.documentElement.classList.toggle('dark',localStorage.getItem('novatech-theme')!=='light')}catch(e){}";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale, dict } = getI18n();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-bg text-fg antialiased`}
      >
        <NextTopLoader
          color="rgb(var(--accent))"
          height={3}
          showSpinner={false}
          speed={200}
          crawlSpeed={200}
          shadow="0 0 10px rgb(var(--accent)), 0 0 5px rgb(var(--accent))"
        />
        <I18nProvider locale={locale} dict={dict}>
          <SearchPaletteProvider>
            <Navbar />
            <TrendingStrip />
            <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
            <Footer />
            <SearchPalette />
          </SearchPaletteProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
