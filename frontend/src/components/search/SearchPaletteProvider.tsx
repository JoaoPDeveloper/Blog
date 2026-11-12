'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface SearchPaletteValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const SearchPaletteContext = createContext<SearchPaletteValue | null>(null);

export function SearchPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((current) => !current), []);

  const value = useMemo(
    () => ({ isOpen, open, close, toggle }),
    [isOpen, open, close, toggle]
  );

  return (
    <SearchPaletteContext.Provider value={value}>
      {children}
    </SearchPaletteContext.Provider>
  );
}

export function useSearchPalette(): SearchPaletteValue {
  const value = useContext(SearchPaletteContext);
  if (!value) {
    throw new Error('useSearchPalette must be used inside <SearchPaletteProvider>');
  }
  return value;
}
