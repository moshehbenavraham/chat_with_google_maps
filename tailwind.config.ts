import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Neutral palette (mapped from CSS custom properties)
        neutral: {
          '00': 'var(--Neutral-00)',
          '5': 'var(--Neutral-5)',
          '10': 'var(--Neutral-10)',
          '15': 'var(--Neutral-15)',
          '20': 'var(--Neutral-20)',
          '30': 'var(--Neutral-30)',
          '50': 'var(--Neutral-50)',
          '60': 'var(--Neutral-60)',
          '80': 'var(--Neutral-80)',
          '90': 'var(--Neutral-90)',
        },
        // Green palette
        green: {
          '400': 'var(--Green-400)',
          '500': 'var(--Green-500)',
          '700': 'var(--Green-700)',
          '800': 'var(--Green-800)',
        },
        // Blue palette
        blue: {
          '400': 'var(--Blue-400)',
          '500': 'var(--Blue-500)',
          '800': 'var(--Blue-800)',
        },
        // Red palette
        red: {
          '400': 'var(--Red-400)',
          '500': 'var(--Red-500)',
          '600': 'var(--Red-600)',
          '700': 'var(--Red-700)',
          '800': 'var(--Red-800)',
        },
        // Legacy gray palette (for backward compatibility)
        gray: {
          '200': 'var(--gray-200)',
          '300': 'var(--gray-300)',
          '500': 'var(--gray-500)',
          '600': 'var(--gray-600)',
          '700': 'var(--gray-700)',
          '800': 'var(--gray-800)',
          '900': 'var(--gray-900)',
          '1000': 'var(--gray-1000)',
        },
        // Accent colors
        accent: {
          blue: 'var(--accent-blue)',
          'blue-active': 'var(--accent-blue-active)',
          'blue-active-bg': 'var(--accent-blue-active-bg)',
          'blue-headers': 'var(--accent-blue-headers)',
          green: 'var(--accent-green)',
          red: 'var(--accent-red)',
        },
        // Card colors
        card: {
          header: 'var(--card-header)',
          border: 'var(--card-border)',
          background: 'var(--card-background)',
        },
        // Misc
        text: 'var(--text)',
        background: 'var(--background)',
        'border-stroke': 'var(--border-stroke)',
        'midnight-blue': 'var(--midnight-blue)',
      },
      borderRadius: {
        card: 'var(--card-border-radius)',
      },
      screens: {
        md: '768px',
      },
      fontFamily: {
        sans: [
          'Google Sans Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'Droid Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
        mono: [
          'Space Mono',
          'source-code-pro',
          'Menlo',
          'Monaco',
          'Consolas',
          'Courier New',
          'monospace',
        ],
        icon: ['Material Symbols Outlined'],
      },
    },
  },
  plugins: [],
};

export default config;
