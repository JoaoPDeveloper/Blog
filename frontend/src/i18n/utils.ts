import { format } from 'date-fns';
import { enUS, ptBR } from 'date-fns/locale';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import type { Category } from '@/types';

const DATE_FORMATS: Record<Locale, { pattern: string; locale: typeof ptBR }> = {
  'pt-BR': { pattern: "d 'de' MMMM 'de' yyyy", locale: ptBR },
  en: { pattern: 'MMMM d, yyyy', locale: enUS },
};

export function interpolate(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}

export function formatDate(dateStr: string | null, locale: Locale): string {
  if (!dateStr) return '';
  const { pattern, locale: dateLocale } = DATE_FORMATS[locale];
  try {
    return format(new Date(dateStr), pattern, { locale: dateLocale });
  } catch {
    return '';
  }
}

export function formatHashtag(name: string): string {
  return `#${name.replace(/\s+/g, '')}`;
}

export function getCategoryName(
  dict: Dictionary,
  category: Pick<Category, 'slug' | 'name'>
): string {
  return dict.categories[category.slug] ?? category.name;
}

export function getCategoryDescription(
  dict: Dictionary,
  category: Pick<Category, 'slug' | 'description'>
): string | null {
  return dict.categoryDescriptions[category.slug] ?? category.description;
}
