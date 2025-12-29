import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        psiarze: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
    },
  },
  darkMode: "class",
  plugins: [heroui({
    themes: {
      light: {
        colors: {
          primary: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
            DEFAULT: '#f59e0b',
            foreground: '#ffffff',
          },
          secondary: {
            DEFAULT: '#8b5cf6',
            foreground: '#ffffff',
          },
          success: {
            DEFAULT: '#10b981',
            foreground: '#ffffff',
          },
        },
      },
      dark: {
        colors: {
          primary: {
            50: '#78350f',
            100: '#92400e',
            200: '#b45309',
            300: '#d97706',
            400: '#f59e0b',
            500: '#fbbf24',
            600: '#fcd34d',
            700: '#fde68a',
            800: '#fef3c7',
            900: '#fffbeb',
            DEFAULT: '#fbbf24',
            foreground: '#000000',
          },
          secondary: {
            DEFAULT: '#a78bfa',
            foreground: '#000000',
          },
          success: {
            DEFAULT: '#34d399',
            foreground: '#000000',
          },
        },
      },
    },
  })],
}

export default config;