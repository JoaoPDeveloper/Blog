'use client';

import { useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { useTopLoader } from 'nextjs-toploader';
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from '@/i18n/config';
import type { Locale } from '@/i18n/config';
import { useI18n } from '@/i18n/I18nProvider';

export default function LanguageToggle() {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const loader = useTopLoader();
  const [isPending, startTransition] = useTransition();
  const barStarted = useRef(false);

  useEffect(() => {
    if (!isPending && barStarted.current) {
      barStarted.current = false;
      loader.done();
    }
  }, [isPending, loader]);

  function changeLocale(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
    barStarted.current = true;
    loader.start();
    startTransition(() => {
      router.refresh();
    });
  }

  const options: { value: Locale; short: string; label: string }[] = [
    { value: 'pt-BR', short: 'PT', label: dict.nav.languagePt },
    { value: 'en', short: 'EN', label: dict.nav.languageEn },
  ];

  return (
    <div
      role="group"
      aria-label={dict.nav.languageLabel}
      aria-busy={isPending}
      className="flex items-center rounded-md border border-border bg-bg3 p-0.5"
    >
      {options.map(({ value, short, label }) => {
        const active = value === locale;
        return (
          <button
            key={value}
            type="button"
            lang={value}
            onClick={() => changeLocale(value)}
            aria-label={label}
            aria-pressed={active}
            className={`rounded px-2 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
              active ? 'bg-accent text-accent-fg' : 'text-muted hover:text-fg'
            }`}
          >
            {short}
          </button>
        );
      })}
    </div>
  );
}
