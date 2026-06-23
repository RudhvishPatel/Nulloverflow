/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-orange': '#ff9500',
        'brand-orange-hover': '#ffa726',
        'footer-bg': '#000000',
        'footer-card-bg': '#1a1a1a',
        'footer-card-hover': '#222222',
        'footer-text': '#888888',
        'footer-text-dark': '#666666',
        'footer-text-darker': '#555555',
      },
      spacing: {
        '100': '100px',
        '200': '200px',
      },
      fontSize: {
        'brand': '52px',
        'nav-xl': '38px',
        'nav-lg': '36px',
        'nav-md': '30px',
        'nav-sm': '26px',
      },
      letterSpacing: {
        'wide-xl': '3px',
        'wide-lg': '2.5px',
        'wide-md': '2px',
      },
      borderRadius: {
        '60': '60px',
      },
      gridTemplateColumns: {
        'footer-desktop': '420px 300px 1fr',
        'footer-desktop-sm': '380px 280px 1fr',
      },
      minHeight: {
        'footer': '700px',
      },
      gap: {
        '100': '100px',
      },
    },
  },
  plugins: [],
}