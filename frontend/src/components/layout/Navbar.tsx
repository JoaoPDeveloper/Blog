'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, Cpu, Gamepad2, Tv2, Zap } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Início' },
  { href: '/categoria/inteligencia-artificial', label: 'IA', icon: Cpu },
  { href: '/categoria/jogos', label: 'Jogos', icon: Gamepad2 },
  { href: '/categoria/animes-mangas', label: 'Animes', icon: Tv2 },
];

export default function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/busca?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg2/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Zap className="h-6 w-6 text-accent" />
          <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">
            NovaTech
          </span>
        </Link>

        {/* Nav links */}
        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:bg-bg3 hover:text-white"
              >
                {Icon && <Icon className="h-4 w-4" />}
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="rounded-md border border-border bg-bg3 py-1.5 pl-8 pr-3 text-sm text-white placeholder-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>
        </form>
      </nav>
    </header>
  );
}
