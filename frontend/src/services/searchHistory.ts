const STORAGE_KEY = 'novatech-search-history';

export const MAX_HISTORY_ITEMS = 8;

function sanitize(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const items: string[] = [];

  for (const entry of value) {
    if (typeof entry !== 'string') continue;
    const term = entry.trim();
    const key = term.toLowerCase();
    if (!term || seen.has(key)) continue;
    seen.add(key);
    items.push(term);
    if (items.length === MAX_HISTORY_ITEMS) break;
  }

  return items;
}

function persist(items: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage unavailable (private mode, quota, blocked) — history just isn't saved
  }
}

export function readSearchHistory(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? sanitize(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export function addSearchTerm(term: string): string[] {
  const clean = term.trim();
  if (!clean) return readSearchHistory();

  const key = clean.toLowerCase();
  const items = sanitize([
    clean,
    ...readSearchHistory().filter((item) => item.toLowerCase() !== key),
  ]);
  persist(items);
  return items;
}

export function removeSearchTerm(term: string): string[] {
  const items = readSearchHistory().filter((item) => item !== term);
  persist(items);
  return items;
}

export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage unavailable — nothing to clear
  }
}
