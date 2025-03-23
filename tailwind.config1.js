/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Sobreescribir las configuraciones predeterminadas
      container: {
        center: true,
        padding: '1rem',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1280px',     // Aumentado
          xl: '1536px',     // Aumentado
          '2xl': '1920px',  // Aumentado
        },
      },
    },
  },
  plugins: [
    function({ addComponents }) {
      addComponents({
        '.container': {
          maxWidth: '200%',
        },
      });
    },
  ],
}