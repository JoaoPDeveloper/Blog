'use client';

import Link from 'next/link';
import { useRouter } from 'nextjs-toploader/app';
import { useState } from 'react';
import { Search, Cpu, Gamepad2, Tv2, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import LanguageToggle from '@/components/layout/LanguageToggle';
import ThemeToggle from '@/components/layout/ThemeToggle';
import SearchShortcutHint from '@/components/search/SearchShortcutHint';
import { useI18n } from '@/i18n/I18nProvider';
import { addSearchTerm } from '@/services/searchHistory';

const navLinks: {
  href: string;
  label: 'home' | 'ai' | 'games' | 'anime';
  icon?: LucideIcon;
}[] = [
  { href: '/', label: 'home' },
  { href: '/categoria/inteligencia-artificial', label: 'ai', icon: Cpu },
  { href: '/categoria/jogos', label: 'games', icon: Gamepad2 },
  { href: '/categoria/animes-mangas', label: 'anime', icon: Tv2 },
];

export default function Navbar() {
  const router = useRouter();
  const { dict } = useI18n();
  const [query, setQuery] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = query.trim();
    if (term) {
      addSearchTerm(term);
      router.push(`/busca?q=${encodeURIComponent(term)}`);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg2/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        {/* Logo */}
        <Link href="/" aria-label="NovaTech" className="flex shrink-0 items-center gap-2 text-xl font-bold">
          <Zap className="h-6 w-6 text-accent" />
          <span className="hidden bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent sm:inline">
            NovaTech
          </span>
        </Link>

        {/* Nav links */}
        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:bg-bg3 hover:text-fg"
              >
                {Icon && <Icon className="h-4 w-4" />}
                {dict.nav[label]}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex min-w-0 items-center gap-2">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex min-w-0 items-center gap-2">
            <div className="relative min-w-0">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={dict.nav.searchPlaceholder}
                className="w-full min-w-0 rounded-md border border-border bg-bg3 py-1.5 pl-8 pr-3 text-sm text-fg placeholder-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent sm:w-56 sm:pr-16"
              />
              <SearchShortcutHint />
            </div>
          </form>

          <ThemeToggle />
          <LanguageToggle />
        </div>
      </nav>
    </header>
  );
}
