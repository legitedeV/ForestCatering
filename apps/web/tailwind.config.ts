import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#D8F3DC',
          200: '#95D5B2',
          300: '#52B788',
          400: '#40916C',
          500: '#2D6A4F',
          600: '#1B4332',
          700: '#143026',
          800: '#0A2A1B',
          900: '#081C15',
          950: '#040D07',
        },
        accent: { DEFAULT: '#D4A373', light: '#E8C9A0', dark: '#B8834F' },
        cream: '#FEFAE0',
        warmwhite: '#FAFAF5',
      },
      backgroundImage: {
        'hero-overlay': 'linear-gradient(to bottom, rgba(8,28,21,0.6), rgba(8,28,21,0.95))',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
export default config
