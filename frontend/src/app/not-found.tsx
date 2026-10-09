import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <span className="text-8xl">404</span>
      <h1 className="text-3xl font-bold text-white">Página não encontrada</h1>
      <p className="max-w-md text-muted">
        A página que você está procurando não existe ou foi removida.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/80"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
