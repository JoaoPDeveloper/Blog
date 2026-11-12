import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from '@/i18n/config';
import type { Locale } from '@/i18n/config';
import { dictionaries } from '@/i18n/dictionaries';
import type { Dictionary } from '@/i18n/dictionaries';

export function getI18n(): { locale: Locale; dict: Dictionary } {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  const locale = isLocale(value) ? value : DEFAULT_LOCALE;
  return { locale, dict: dictionaries[locale] };
}
