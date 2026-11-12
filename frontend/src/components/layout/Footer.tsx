import Link from 'next/link';
import { Zap } from 'lucide-react';
import { getI18n } from '@/i18n/server';
import { interpolate } from '@/i18n/utils';

export default function Footer() {
  const { dict } = getI18n();

  return (
    <footer className="mt-16 border-t border-border bg-bg2">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <Zap className="h-5 w-5 text-accent" />
            <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">
              NovaTech
            </span>
          </Link>

          <p className="max-w-lg text-sm text-muted">{dict.footer.about}</p>

          <div className="flex gap-6 text-sm text-muted">
            <Link href="/categoria/inteligencia-artificial" className="hover:text-fg">
              {dict.categories['inteligencia-artificial']}
            </Link>
            <Link href="/categoria/jogos" className="hover:text-fg">
              {dict.categories.jogos}
            </Link>
            <Link href="/categoria/animes-mangas" className="hover:text-fg">
              {dict.categories['animes-mangas']}
            </Link>
          </div>

          <p className="text-xs text-muted">
            {interpolate(dict.footer.copyright, { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
