import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        marquee: 'marquee 35s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      colors: {
        bg: '#0f1117',
        bg2: '#1a1d27',
        bg3: '#23263a',
        accent: '#6c63ff',
        accent2: '#00d4ff',
        border: '#2a2d3e',
        muted: '#8b8fa8',
        ai: '#a78bfa',
        games: '#34d399',
        anime: '#f87171',
      },
    },
  },
  plugins: [],
};

export default config;
