import type { Config } from 'tailwindcss';
const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // marquee animation is defined in globals.css (includes hover-pause rule)
      // colors come from CSS variables (RGB channels) defined in globals.css (:root = light, .dark = dark)
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        bg2: 'rgb(var(--bg2) / <alpha-value>)',
        bg3: 'rgb(var(--bg3) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-fg': 'rgb(var(--accent-fg) / <alpha-value>)',
        accent2: 'rgb(var(--accent2) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        ai: 'rgb(var(--ai) / <alpha-value>)',
        games: 'rgb(var(--games) / <alpha-value>)',
        anime: 'rgb(var(--anime) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};
export default config;
