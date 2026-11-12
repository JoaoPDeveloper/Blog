import Link from 'next/link';
import { getI18n } from '@/i18n/server';

export default function NotFound() {
  const { dict } = getI18n();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <span className="text-8xl">404</span>
      <h1 className="text-3xl font-bold text-fg">{dict.notFound.title}</h1>
      <p className="max-w-md text-muted">{dict.notFound.text}</p>
      <Link
        href="/"
        className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent/80"
      >
        {dict.notFound.back}
      </Link>
    </div>
  );
}
