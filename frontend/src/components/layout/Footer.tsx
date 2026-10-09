import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function Footer() {
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

          <p className="max-w-lg text-sm text-muted">
            Conteúdo gerado com assistência de Inteligência Artificial (Google Gemini).
            Os artigos são baseados em fontes verificáveis e passam por revisão editorial.
            As fontes originais são sempre citadas.
          </p>

          <div className="flex gap-6 text-sm text-muted">
            <Link href="/categoria/inteligencia-artificial" className="hover:text-white">
              Inteligência Artificial
            </Link>
            <Link href="/categoria/jogos" className="hover:text-white">
              Jogos
            </Link>
            <Link href="/categoria/animes-mangas" className="hover:text-white">
              Animes &amp; Mangás
            </Link>
          </div>

          <p className="text-xs text-muted">
            © {new Date().getFullYear()} NovaTech. Conteúdo assistido por IA — sempre com transparência.
          </p>
        </div>
      </div>
    </footer>
  );
}
