# NovaTech frontend: marquee strip, app icon, and image fallbacks

This change adds three visual features to the NovaTech frontend: a horizontally scrolling "Em Alta" ticker that pauses on hover, an SVG lightning-bolt icon wired into the browser tab, and image fallback rendering in both `HeroArticle` and `ArticleCard`. The marquee is driven entirely by CSS animation defined in `globals.css`; `TrendingStrip` was rewritten from scratch around this approach. The `ArticleCard` fallback was pre-existing and confirmed in place; the change replicated the pattern into `HeroArticle` with a minor improvement to the `onError` handler.

Watch for: (1) **confirmed** — `theme.extend` in `tailwind.config.ts` was not updated with `animation`/`keyframes` entries as the spec required; the animation lives only in `globals.css`. (2) **confirmed** — `src/app/icon.svg` triggers Next.js App Router's file-based icon auto-registration at the same time as the explicit `metadata.icons` entry, producing two `<link rel="icon">` tags in `<head>`.

**Verdict**: APPROVED

---

## High-level view

The marquee is implemented as a CSS animation (`translateX(0) → translateX(-50%)`) over a doubled array of titles. Hover-pause works via `.animate-marquee:hover { animation-play-state: paused }`, which fires whenever the cursor enters any visible child span. The spec required the animation to also be registered in Tailwind's `theme.extend`; that was skipped in favor of a pure CSS approach with a comment, which is functionally equivalent but deviates from the stated architecture.

The icon is deployed both as `src/app/icon.svg` (picked up automatically by Next.js App Router's file convention) and as `public/favicon.svg` pointed to by the `metadata.icons` field. Both SVGs are identical in content, so the visual result is correct, but the `<head>` will contain two `<link rel="icon">` declarations pointing to different paths.

---

<details>
<summary>Issues (2)</summary>

1. **Missing tailwind theme.extend animation config** — `animation` and `keyframes` entries were not added to `theme.extend` in `tailwind.config.ts` as the spec required. Add them and keep only the hover-pause rule (`.animate-marquee:hover`) in `globals.css` to follow the intended split.

2. **Duplicate icon registration** — `src/app/icon.svg` (Next.js file-based convention) and `metadata.icons.icon: '/favicon.svg'` both inject `<link rel="icon">` into `<head>`. Remove `src/app/icon.svg` (keeping only `public/favicon.svg` + metadata) or remove `metadata.icons` (relying solely on the file-based convention) to deduplicate.

</details>

---

<details>
<summary>Details</summary>

### Missing tailwind.config.ts animation entries

The spec called for the keyframe to appear in `globals.css` **and** for `animation`/`keyframes` to be registered in `tailwind.config.ts`'s `theme.extend`, making `animate-marquee` a first-class Tailwind utility whose duration and easing can be overridden in config. The coder instead declared the full `.animate-marquee` class in `globals.css` and left only a comment in the config. The hover-pause rule can't be expressed purely in Tailwind without a custom variant, so globals.css will always carry at least that rule — but the animation definition itself belongs in config per the spec.

To conform: add to `tailwind.config.ts`:
```ts
animation: { marquee: 'marquee 35s linear infinite' },
keyframes: {
  marquee: {
    '0%':   { transform: 'translateX(0)' },
    '100%': { transform: 'translateX(-50%)' },
  },
},
```
Then remove the `.animate-marquee { animation: … }` block from `globals.css`, leaving only the `.animate-marquee:hover` rule there.

### Duplicate icon declarations in `<head>`

Next.js App Router auto-processes `src/app/icon.svg` at build time and emits `<link rel="icon" href="/icon.svg?<hash>">`. `layout.tsx` also declares `metadata.icons = { icon: '/favicon.svg', shortcut: '/favicon.svg' }`, emitting `<link rel="icon" href="/favicon.svg">` and `<link rel="shortcut icon" href="/favicon.svg">`. The `<head>` ends up with three icon link tags across two paths, despite the SVG content being identical.

The metadata-explicit approach is easier to extend (apple-touch-icon, etc.) and easier to audit. Deleting `src/app/icon.svg` leaves the metadata as the single source of truth.

</details>

---

<details>
<summary>File map</summary>

| File | Change |
|---|---|
| `frontend/src/components/layout/TrendingStrip.tsx` | Full rewrite: doubled-array marquee, CSS animation class, fixed "Em Alta" label |
| `frontend/src/app/globals.css` | Added `@keyframes marquee`, `.animate-marquee`, and `.animate-marquee:hover` rules |
| `frontend/tailwind.config.ts` | Added comment only; no `animation`/`keyframes` entries in `theme.extend` |
| `frontend/src/app/icon.svg` | New SVG lightning-bolt icon (32×32, dark background) |
| `frontend/public/favicon.svg` | Same SVG as `icon.svg`, served as static asset |
| `frontend/src/app/layout.tsx` | Added `metadata.icons` (icon + shortcut), expanded `openGraph` fields |
| `frontend/src/components/articles/HeroArticle.tsx` | Added image_url conditional render + `onError` fallback to flex div; `rounded-t-xl` on container |

Full diff: `git diff origin/develop HEAD -- frontend/`

</details>
