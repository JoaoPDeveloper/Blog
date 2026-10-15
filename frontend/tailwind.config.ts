import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // marquee animation is defined in globals.css (includes hover-pause rule)
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
