/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#121212',
        surface: '#13140b',
        'background-surface': '#242424',
        'border-subtle': 'rgba(255, 255, 255, 0.1)',
        'text-primary': '#FFFFFF',
        'text-muted': '#888888',
        'action-neon': '#E4FF6E',
        'data-lavender': '#C4B5FD',
        'on-surface': '#e4e3d4',
        'on-surface-variant': '#c6c8b1',
        category: {
          food: '#ff6b6b',
          transport: '#4ecdc4',
          software: '#ff9f43',
          officeSupplies: '#1a535c',
          marketing: '#ffa07a',
          utilities: '#6a4c93',
          travel: '#2e86ab',
          miscellaneous: '#c0c0c0',
        }
      },
      borderRadius: {
        'lg': '2rem',
        'xl': '3rem',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        label: ['Inter'],
        body: ['Inter'],
        microcopy: ['Inter'],
        h1: ['Inter'],
        'widget-title': ['Inter']
      },
      fontSize: {
        'label': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
        'body': ['14px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'microcopy': ['11px', { lineHeight: '1.4', fontWeight: '400' }],
        'h1': ['28px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'widget-title': ['13px', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '600' }]
      }
    },
  },
  plugins: [],
}
