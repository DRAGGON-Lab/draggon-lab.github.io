/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        draggon: {
          base: '#F8FAFC',
          surface: '#FFFFFF',
          text: '#0F172A',
          muted: '#475569',
          violet: '#7C3AED',
          deep: '#4C1D95',
          green: '#39FF14',
          softgreen: '#A7F3D0',
          cyan: '#06B6D4',
          dark: '#020617',
          darksurface: '#0F172A'
        }
      }
    }
  },
  plugins: []
};
