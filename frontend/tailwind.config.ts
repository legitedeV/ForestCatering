import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: ['class', '[data-brand="bar"]'],
  theme: {
    extend: {
      colors: {
        fc: {
          bg: 'var(--fc-bg)',
          bgElev: 'var(--fc-bg-elev)',
          surface: 'var(--fc-surface)',
          text: 'var(--fc-text)',
          muted: 'var(--fc-muted)',
          accent: 'var(--fc-accent)',
          accent2: 'var(--fc-accent-2)'
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Ubuntu', 'Cantarell', 'Noto Sans', 'Helvetica Neue', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
