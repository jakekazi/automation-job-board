import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Midnight Blue - Primary
        primary: {
          50: '#e6eef5',
          100: '#c2d4e6',
          200: '#9ab8d4',
          300: '#729cc2',
          400: '#4a80b0',
          500: '#1e3a5f',  // Main
          600: '#1a3354',
          700: '#162b49',
          800: '#12233e',
          900: '#0e1b33',
          DEFAULT: '#1e3a5f',
          foreground: '#ffffff',
        },
        // Electric Teal - Accent
        accent: {
          50: '#e0fff9',
          100: '#b3fff0',
          200: '#80ffe6',
          300: '#4dffdc',
          400: '#1affd2',
          500: '#00d9c0',  // Main
          600: '#00c2ab',
          700: '#00a896',
          800: '#008e80',
          900: '#00746a',
          DEFAULT: '#00d9c0',
          foreground: '#0e1b33',
        },
        // shadcn/ui compatible colors
        border: 'hsl(214.3 31.8% 91.4%)',
        input: 'hsl(214.3 31.8% 91.4%)',
        ring: '#1e3a5f',
        background: 'hsl(0 0% 100%)',
        foreground: '#0e1b33',
        secondary: {
          DEFAULT: 'hsl(210 40% 96.1%)',
          foreground: '#1e3a5f',
        },
        destructive: {
          DEFAULT: 'hsl(0 84.2% 60.2%)',
          foreground: 'hsl(0 0% 98%)',
        },
        muted: {
          DEFAULT: 'hsl(210 40% 96.1%)',
          foreground: 'hsl(215.4 16.3% 46.9%)',
        },
        popover: {
          DEFAULT: 'hsl(0 0% 100%)',
          foreground: '#0e1b33',
        },
        card: {
          DEFAULT: 'hsl(0 0% 100%)',
          foreground: '#0e1b33',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
