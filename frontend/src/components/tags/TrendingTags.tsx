import Link from 'next/link';
import { Hash } from 'lucide-react';
import { getI18n } from '@/i18n/server';
import { formatHashtag, interpolate } from '@/i18n/utils';
import type { TrendingTag } from '@/types';

interface Props {
  tags: TrendingTag[];
}

export default function TrendingTags({ tags }: Props) {
  if (tags.length === 0) return null;

  const { dict } = getI18n();

  return (
    <section aria-labelledby="trending-tags-title">
      <h2
        id="trending-tags-title"
        className="mb-4 flex items-center gap-2 text-lg font-bold text-fg"
      >
        <Hash className="h-5 w-5 text-accent" aria-hidden="true" />
        {dict.hashtags.trending}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const hashtag = formatHashtag(tag.name);
          const count = interpolate(dict.hashtags.articlesCount, {
            count: tag.articles_count,
          });

          return (
            <li key={tag.id}>
              <Link
                href={`/tag/${encodeURIComponent(tag.slug)}`}
                title={count}
                aria-label={`${hashtag}, ${count}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-bg2 px-3 py-1.5 text-sm font-medium text-fg transition-colors hover:border-accent/50 hover:text-accent2"
              >
                <span>{hashtag}</span>
                <span
                  aria-hidden="true"
                  className="rounded-full bg-bg3 px-1.5 py-0.5 text-xs font-normal text-muted"
                >
                  {tag.articles_count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
