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
          brandviolet: '#995CD0',
          brandgreen: '#8EDF5F',
          violet: '#9250CA',
          deep: '#3B1A7A',
          green: '#8EDF5F',
          softgreen: '#DCF6CC',
          cyan: '#0E7490',
          dark: '#0B0B14',
          darksurface: '#15141F',
        },
      },
    },
  },
  plugins: [],
};
