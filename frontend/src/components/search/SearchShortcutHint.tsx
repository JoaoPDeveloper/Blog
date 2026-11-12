'use client';

import { useEffect, useState } from 'react';
import { useSearchPalette } from '@/components/search/SearchPaletteProvider';
import { useI18n } from '@/i18n/I18nProvider';

export default function SearchShortcutHint() {
  const { dict } = useI18n();
  const { open } = useSearchPalette();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.userAgent));
  }, []);

  return (
    <button
      type="button"
      onClick={open}
      aria-label={dict.palette.openLabel}
      aria-keyshortcuts={isMac ? 'Meta+K' : 'Control+K'}
      title={dict.palette.openLabel}
      className="absolute right-1.5 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-bg2 px-1.5 py-0.5 text-[11px] font-medium leading-none text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent sm:block"
    >
      {isMac ? '⌘K' : 'Ctrl K'}
    </button>
  );
}
