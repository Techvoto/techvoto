import { heroui } from '@heroui/react';
import type { Config } from 'tailwindcss';

// Design language: neutral surfaces, one blue accent, hairline borders instead of heavy shadows, tight 8px radii.
const ringLight = '0px 0px 0px 1px rgba(60,64,67,0.14)';
const ringDark = '0px 0px 0px 1px rgba(255,255,255,0.10)';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}', './node_modules/@heroui/theme/dist/**/*.{js,mjs}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['var(--font-body)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      maxWidth: { page: '80rem' },
    },
  },
  plugins: [
    heroui({
      layout: {
        radius: { small: '6px', medium: '8px', large: '10px' },
        borderWidth: { small: '1px', medium: '1px', large: '2px' },
        dividerWeight: '1px',
        boxShadow: {
          small: `${ringLight}, 0px 1px 2px rgba(60,64,67,0.06)`,
          medium: `${ringLight}, 0px 2px 8px rgba(60,64,67,0.10)`,
          large: `${ringLight}, 0px 12px 32px rgba(60,64,67,0.16)`,
        },
      },
      themes: {
        light: {
          layout: {},
          colors: {
            background: '#f8f9fa', foreground: '#202124',
            content1: '#ffffff', content2: '#f1f3f4', content3: '#e8eaed', content4: '#dadce0',
            default: {
              50: '#f8f9fa', 100: '#f1f3f4', 200: '#e8eaed', 300: '#dadce0', 400: '#80868b',
              500: '#5f6368', 600: '#3c4043', 700: '#2b2d31', 800: '#202124', 900: '#171717',
              DEFAULT: '#e8eaed', foreground: '#202124',
            },
            primary: { DEFAULT: '#1a73e8', foreground: '#ffffff' },
            secondary: { DEFAULT: '#3c4043', foreground: '#ffffff' },
            success: { DEFAULT: '#188038', foreground: '#ffffff' },
            warning: { DEFAULT: '#f9ab00', foreground: '#202124' },
            danger: { DEFAULT: '#d93025', foreground: '#ffffff' },
            focus: '#1a73e8',
          },
        },
        dark: {
          layout: {
            boxShadow: {
              small: `${ringDark}, 0px 1px 2px rgba(0,0,0,0.30)`,
              medium: `${ringDark}, 0px 2px 8px rgba(0,0,0,0.40)`,
              large: `${ringDark}, 0px 12px 32px rgba(0,0,0,0.55)`,
            },
          },
          colors: {
            background: '#111317', foreground: '#e8eaed',
            content1: '#1a1d22', content2: '#23262c', content3: '#2d3138', content4: '#3c4048',
            default: {
              50: '#1a1d22', 100: '#23262c', 200: '#2d3138', 300: '#3c4048', 400: '#80868b',
              500: '#9aa0a6', 600: '#bdc1c6', 700: '#dadce0', 800: '#e8eaed', 900: '#f1f3f4',
              DEFAULT: '#2d3138', foreground: '#e8eaed',
            },
            primary: { DEFAULT: '#8ab4f8', foreground: '#0b1f3a' },
            secondary: { DEFAULT: '#bdc1c6', foreground: '#111317' },
            success: { DEFAULT: '#81c995', foreground: '#0b2a14' },
            warning: { DEFAULT: '#fdd663', foreground: '#2a2000' },
            danger: { DEFAULT: '#f28b82', foreground: '#3a0b07' },
            focus: '#8ab4f8',
          },
        },
      },
    }),
  ],
};
export default config;
