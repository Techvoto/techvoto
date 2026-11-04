import { heroui } from '@heroui/react';
import type { Config } from 'tailwindcss';

/**
 * Techvoto design tokens.
 *
 * Direction: cool slate neutrals, one confident indigo accent, hairline borders and soft layered shadows.
 * Every component reads these tokens (bg-content1, text-default-500, border-divider, text-primary ...), so
 * changing the brand later means editing this file only.
 */
const ringLight = '0 0 0 1px rgba(16,24,40,0.06)';
const ringDark = '0 0 0 1px rgba(255,255,255,0.07)';



const config: Config = {
  content: [
  './index.html',
  './src/**/*.{ts,tsx}',
  // HeroUI installs @heroui/theme nested under @heroui/react, so match every copy.
  './node_modules/@heroui/**/theme/dist/**/*.{js,mjs}',
  './node_modules/.pnpm/@heroui+theme*/node_modules/@heroui/theme/dist/**/*.{js,mjs}',
],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['var(--font-body)', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      maxWidth: { page: '80rem' },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'pulse-ring': { '0%': { transform: 'scale(1)', opacity: '0.6' }, '100%': { transform: 'scale(2.4)', opacity: '0' } },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'pulse-ring': 'pulse-ring 1.8s ease-out infinite',
      },
    },
  },
  plugins: [
    heroui({
      layout: {
        radius: { small: '8px', medium: '10px', large: '14px' },
        borderWidth: { small: '1px', medium: '1.5px', large: '2px' },
        dividerWeight: '1px',
        boxShadow: {
          small: `${ringLight}, 0 1px 2px rgba(16,24,40,0.05)`,
          medium: `${ringLight}, 0 4px 14px -4px rgba(16,24,40,0.10)`,
          large: `${ringLight}, 0 24px 48px -16px rgba(16,24,40,0.22)`,
        },
      },
      themes: {
        light: {
          layout: {},
          colors: {
            background: '#f6f7fb',
            foreground: '#101828',
            divider: 'rgba(16,24,40,0.09)',
            content1: '#ffffff',
            content2: '#f1f3f9',
            content3: '#e6e9f2',
            content4: '#d5d9e6',
            focus: '#4f46e5',
            default: {
              50: '#f8f9fc', 100: '#f1f3f9', 200: '#e4e8f1', 300: '#d0d6e4', 400: '#98a2b3',
              500: '#667085', 600: '#475467', 700: '#344054', 800: '#1d2939', 900: '#101828',
              DEFAULT: '#e4e8f1', foreground: '#101828',
            },
            primary: {
              50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8',
              500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81',
              DEFAULT: '#4f46e5', foreground: '#ffffff',
            },
            secondary: {
              50: '#f8f9fc', 100: '#f1f3f9', 200: '#e4e8f1', 300: '#d0d6e4', 400: '#98a2b3',
              500: '#667085', 600: '#475467', 700: '#344054', 800: '#1d2939', 900: '#101828',
              DEFAULT: '#1d2939', foreground: '#ffffff',
            },
            success: {
              50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399',
              500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b',
              DEFAULT: '#047857', foreground: '#ffffff',
            },
            warning: {
              50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24',
              500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f',
              DEFAULT: '#f59e0b', foreground: '#1c1917',
            },
            danger: {
              50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171',
              500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d',
              DEFAULT: '#dc2626', foreground: '#ffffff',
            },
          },
        },
        dark: {
          layout: {
            boxShadow: {
              small: `${ringDark}, 0 1px 2px rgba(0,0,0,0.40)`,
              medium: `${ringDark}, 0 6px 18px -6px rgba(0,0,0,0.55)`,
              large: `${ringDark}, 0 28px 56px -16px rgba(0,0,0,0.70)`,
            },
          },
          colors: {
            background: '#0a0c12',
            foreground: '#e6e9f2',
            divider: 'rgba(255,255,255,0.09)',
            content1: '#11141b',
            content2: '#171b24',
            content3: '#1f2430',
            content4: '#2a3040',
            focus: '#818cf8',
            default: {
              50: '#11141b', 100: '#171b24', 200: '#222836', 300: '#323a4d', 400: '#6b7590',
              500: '#99a3ba', 600: '#b7bfd2', 700: '#d3d8e5', 800: '#e6e9f2', 900: '#f3f5fa',
              DEFAULT: '#222836', foreground: '#e6e9f2',
            },
            primary: {
              50: '#1e1b4b', 100: '#2a2670', 200: '#3730a3', 300: '#4338ca', 400: '#4f46e5',
              500: '#6366f1', 600: '#818cf8', 700: '#a5b4fc', 800: '#c7d2fe', 900: '#e0e7ff',
              DEFAULT: '#818cf8', foreground: '#0b1020',
            },
            secondary: {
              50: '#11141b', 100: '#171b24', 200: '#222836', 300: '#323a4d', 400: '#6b7590',
              500: '#99a3ba', 600: '#b7bfd2', 700: '#d3d8e5', 800: '#e6e9f2', 900: '#f3f5fa',
              DEFAULT: '#d3d8e5', foreground: '#0a0c12',
            },
            success: {
              50: '#052e22', 100: '#064e3b', 200: '#065f46', 300: '#047857', 400: '#059669',
              500: '#10b981', 600: '#34d399', 700: '#6ee7b7', 800: '#a7f3d0', 900: '#d1fae5',
              DEFAULT: '#34d399', foreground: '#04261c',
            },
            warning: {
              50: '#2e1a05', 100: '#4a2a07', 200: '#78350f', 300: '#92400e', 400: '#b45309',
              500: '#d97706', 600: '#fbbf24', 700: '#fcd34d', 800: '#fde68a', 900: '#fef3c7',
              DEFAULT: '#fbbf24', foreground: '#1c1305',
            },
            danger: {
              50: '#2d0b0b', 100: '#450a0a', 200: '#7f1d1d', 300: '#991b1b', 400: '#b91c1c',
              500: '#dc2626', 600: '#f87171', 700: '#fca5a5', 800: '#fecaca', 900: '#fee2e2',
              DEFAULT: '#f87171', foreground: '#2a0606',
            },
          },
        },
      },
    }),
  ],
};
export default config;
