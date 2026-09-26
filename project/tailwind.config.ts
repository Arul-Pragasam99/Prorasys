import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F6E56',
          light: '#5DCAA5',
          dark: '#0F6E56',
        },
        secondary: {
          DEFAULT: '#185FA5',
          light: '#85B7EB',
          dark: '#185FA5',
        },
        accent: {
          DEFAULT: '#D85A30',
          light: '#F0997B',
          dark: '#D85A30',
        },
        success: {
          DEFAULT: '#639922',
          light: '#97C459',
          dark: '#639922',
        },
        warning: {
          DEFAULT: '#BA7517',
          light: '#EF9F27',
          dark: '#BA7517',
        },
        danger: {
          DEFAULT: '#A32D2D',
          light: '#F09595',
          dark: '#A32D2D',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          dark: 'var(--color-surface)',
        },
        card: {
          DEFAULT: 'var(--color-card)',
          dark: 'var(--color-card)',
        },
        text: {
          primary: {
            DEFAULT: 'var(--color-text-primary)',
            dark: 'var(--color-text-primary)',
          },
          secondary: {
            DEFAULT: 'var(--color-text-secondary)',
            dark: 'var(--color-text-secondary)',
          },
        },
        border: {
          DEFAULT: 'var(--color-border)',
          dark: 'var(--color-border)',
        },
      },
      borderRadius: {
        theme: '12px',
        'theme-lg': '16px',
        'theme-xl': '20px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;