/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        draggon: {
          base: '#FAF8F4',
          surface: '#FFFFFF',
          text: '#171526',
          muted: '#565165',
          violet: '#6D28D9',
          deep: '#3B1A7A',
          green: '#16B364',
          softgreen: '#C7F0D8',
          cyan: '#0E7490',
          dark: '#0B0B14',
          darksurface: '#15141F',
        },
      },
    },
  },
  plugins: [],
};
