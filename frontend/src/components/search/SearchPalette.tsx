'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { History, Search, X } from 'lucide-react';
import { useSearchPalette } from '@/components/search/SearchPaletteProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { interpolate } from '@/i18n/utils';
import {
  addSearchTerm,
  clearSearchHistory,
  readSearchHistory,
  removeSearchTerm,
} from '@/services/searchHistory';

interface Entry {
  kind: 'query' | 'history';
  term: string;
}

function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-border bg-bg3 px-1.5 py-0.5 font-sans text-[11px] leading-none text-muted">
      {children}
    </kbd>
  );
}

function PaletteDialog({ onClose }: { onClose: () => void }) {
  const { dict } = useI18n();
  const router = useRouter();
  const listId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<string[]>(readSearchHistory);
  const [activeIndex, setActiveIndex] = useState(-1);

  const trimmed = query.trim();

  const entries = useMemo<Entry[]>(() => {
    const folded = fold(trimmed);
    const matches = folded
      ? history.filter((item) => fold(item).includes(folded))
      : history;
    return [
      ...(trimmed ? [{ kind: 'query' as const, term: trimmed }] : []),
      ...matches.map((term) => ({ kind: 'history' as const, term })),
    ];
  }, [history, trimmed]);

  const active = Math.min(activeIndex, entries.length - 1);
  const optionId = (index: number) => `${listId}-option-${index}`;
  const activeId = active >= 0 ? optionId(active) : undefined;
  const firstHistoryIndex = entries.findIndex((entry) => entry.kind === 'history');

  useEffect(() => {
    const previous =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    inputRef.current?.focus();

    return () => {
      if (previous && previous !== document.body && previous.isConnected) {
        previous.focus();
      }
    };
  }, []);

  useEffect(() => {
    if (activeId) {
      document.getElementById(activeId)?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeId]);

  function submit(term: string) {
    const clean = term.trim();
    if (!clean) return;
    addSearchTerm(clean);
    router.push(`/busca?q=${encodeURIComponent(clean)}`);
    onClose();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setActiveIndex(e.target.value.trim() ? 0 : -1);
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (entries.length === 0) return;
      const step = e.key === 'ArrowDown' ? 1 : -1;
      if (active < 0) {
        setActiveIndex(step > 0 ? 0 : entries.length - 1);
      } else {
        setActiveIndex((active + step + entries.length) % entries.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      submit(active >= 0 ? entries[active].term : trimmed);
    }
  }

  function handleDialogKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'Tab') return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('input, button');
    if (!focusable || focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = document.activeElement;

    if (e.shiftKey && (current === first || current === dialogRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && current === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function handleRemove(term: string) {
    setHistory(removeSearchTerm(term));
    inputRef.current?.focus();
  }

  function handleClear() {
    clearSearchHistory();
    setHistory([]);
    inputRef.current?.focus();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-bg/75 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={dict.palette.title}
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
        className="flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-border bg-bg2 shadow-2xl outline-none"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={entries.length > 0}
            aria-controls={entries.length > 0 ? listId : undefined}
            aria-autocomplete="list"
            aria-activedescendant={activeId}
            aria-label={dict.palette.placeholder}
            placeholder={dict.palette.placeholder}
            value={query}
            onChange={handleChange}
            onKeyDown={handleInputKeyDown}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            className="h-12 min-w-0 flex-1 bg-transparent text-sm text-fg placeholder-muted outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={dict.palette.close}
            title={dict.palette.close}
            className="shrink-0 rounded p-1 text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto p-2">
          {entries.length > 0 ? (
            <ul id={listId} role="listbox" aria-label={dict.palette.title}>
              {entries.map((entry, index) => (
                <li
                  key={entry.kind === 'query' ? 'query' : `history-${entry.term}`}
                  role="presentation"
                >
                  {index === firstHistoryIndex && (
                    <div className="flex items-center justify-between px-3 pb-1 pt-3 text-xs font-semibold text-muted">
                      <span>{dict.palette.recentSearches}</span>
                      <button
                        type="button"
                        onClick={handleClear}
                        className="rounded px-1.5 py-0.5 font-medium transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                      >
                        {dict.palette.clearHistory}
                      </button>
                    </div>
                  )}
                  <div
                    id={optionId(index)}
                    role="option"
                    aria-selected={index === active}
                    onMouseMove={() => setActiveIndex(index)}
                    onClick={() => submit(entry.term)}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-fg ${
                      index === active ? 'bg-accent/15' : ''
                    }`}
                  >
                    {entry.kind === 'query' ? (
                      <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                    ) : (
                      <History className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                    )}
                    <span className="min-w-0 flex-1 truncate">
                      {entry.kind === 'query'
                        ? interpolate(dict.palette.searchFor, { query: entry.term })
                        : entry.term}
                    </span>
                    {entry.kind === 'history' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(entry.term);
                        }}
                        aria-label={interpolate(dict.palette.removeItem, { term: entry.term })}
                        title={interpolate(dict.palette.removeItem, { term: entry.term })}
                        className="shrink-0 rounded p-1 text-muted transition-colors hover:bg-bg3 hover:text-fg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-6 text-center text-sm text-muted">
              {dict.palette.noRecent}
            </p>
          )}
        </div>

        <div className="hidden items-center gap-4 border-t border-border px-4 py-2 text-xs text-muted sm:flex">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            {dict.palette.hintNavigate}
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd>
            {dict.palette.hintSelect}
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>Esc</Kbd>
            {dict.palette.hintClose}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SearchPalette() {
  const { isOpen, close, toggle } = useSearchPalette();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.isComposing) return;

      if (
        (e.ctrlKey || e.metaKey) &&
        !e.altKey &&
        !e.shiftKey &&
        e.key?.toLowerCase() === 'k'
      ) {
        e.preventDefault();
        if (!e.repeat) toggle();
      } else if (e.key === 'Escape' && isOpen) {
        close();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close, toggle]);

  return isOpen ? <PaletteDialog onClose={close} /> : null;
}
