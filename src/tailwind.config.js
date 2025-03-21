/** @type {import('tailwindcss').Config} */
export default {
  // Archivos donde Tailwind buscará clases para purgar CSS no utilizado
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  // Tema principal con extensiones personalizadas
  theme: {
    extend: {
      // Puntos de ruptura personalizados para mayor control responsivo
      screens: {
        'xs': '475px',    // Extra pequeño (móviles pequeños)
        'sm': '640px',    // Pequeño (móviles estándar)
        'md': '768px',    // Mediano (tabletas)
        'lg': '1024px',   // Grande (laptops)
        'xl': '1280px',   // Extra grande (escritorios)
        '2xl': '1536px',  // 2x grande (monitores estándar)
        '3xl': '1920px',  // 3x grande (monitores grandes)
        '4xl': '2560px',  // 4x grande (resoluciones ultra anchas)
      },

      // Configuración del contenedor
      container: {
        center: true,       // Centra el contenedor automáticamente
        padding: {
          DEFAULT: '1rem',  // Padding base
          sm: '1.5rem',     // Padding en pantallas pequeñas
          lg: '2rem',       // Padding en pantallas grandes
          xl: '3rem',       // Padding en pantallas extra grandes
        },
        screens: {
          'xs': '100%',     // Ocupa todo el ancho en pantallas pequeñas
          'sm': '640px',
          'md': '768px',
          'lg': '1024px',
          'xl': '1280px',
          '2xl': '1536px',
          '3xl': '1920px',
          '4xl': '2560px',  // Máximo para ultra ancho
        },
      },

      // Personalización de anchos máximos
      maxWidth: {
        'xs': '20rem',    // 320px
        'sm': '24rem',    // 384px
        'md': '28rem',    // 448px
        'lg': '32rem',    // 512px
        'xl': '36rem',    // 576px
        '2xl': '42rem',   // 672px
        '3xl': '48rem',   // 768px
        '4xl': '56rem',   // 896px
        '5xl': '64rem',   // 1024px
        '6xl': '72rem',   // 1152px
        '7xl': '80rem',   // 1280px
        '8xl': '96rem',   // 1536px (equivalente a 2xl por defecto)
        '9xl': '120rem',  // 1920px (para tus contenedores anchos)
        '10xl': '160rem', // 2560px (ultra ancho)
        'full': '100%',
        'screen': '100vw', // Ancho completo de la ventana
      },

      // Personalización de anchos
      width: {
        'xs': '20rem',
        'sm': '24rem',
        'md': '28rem',
        'lg': '32rem',
        'xl': '36rem',
        '2xl': '42rem',
        '3xl': '48rem',
        '4xl': '56rem',
        '5xl': '64rem',
        '6xl': '72rem',
        '7xl': '80rem',
        '8xl': '96rem',
        '9xl': '120rem',
        '10xl': '160rem',
        'fit': 'fit-content',
        'min': 'min-content',
        'max': 'max-content',
      },

      // Colores personalizados basados en tu paleta actual
      colors: {
        dbz: {
          primary: '#364C63',  // Azul oscuro (títulos y fondos)
          secondary: '#F3B340', // Amarillo (encabezados y totales)
          accent: '#E66A2C',   // Naranja (detalles)
          pink: '#F094A7',     // Rosa (decorativo)
          light: '#F4F3EF',    // Gris claro (fondos)
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2A44',
          900: '#111827',
        },
        blue: {
          500: '#3B82F6',
          600: '#2563EB',
        },
        red: {
          500: '#EF4444',
          600: '#DC2626',
        },
        green: {
          500: '#10B981',
          600: '#059669',
        },
      },

      // Tipografías personalizadas
      fontFamily: {
        sans: ['Inter', 'sans-serif'],           // Fuente base moderna
        kanit: ['Kanit', 'sans-serif'],          // Para títulos dbz-title
        josefin: ['Josefin Sans', 'sans-serif'], // Para arquitectura-title
        mono: ['Fira Code', 'monospace'],        // Para código o diagnóstico
      },

      // Tamaños de fuente personalizados
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],        // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],    // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],       // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],    // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],     // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],        // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],   // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],     // 36px
        '5xl': ['3rem', { lineHeight: '1' }],             // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],          // 60px
      },

      // Espaciado personalizado (padding, margin, etc.)
      spacing: {
        '0.5': '0.125rem',  // 2px
        '1.5': '0.375rem',  // 6px
        '2.5': '0.625rem',  // 10px
        '3.5': '0.875rem',  // 14px
        '4.5': '1.125rem',  // 18px
        '5.5': '1.375rem',  // 22px
        '6.5': '1.625rem',  // 26px
        '7': '1.75rem',     // 28px
        '8': '2rem',        // 32px
        '9': '2.25rem',     // 36px
        '10': '2.5rem',     // 40px
        '12': '3rem',       // 48px
        '14': '3.5rem',     // 56px
        '16': '4rem',       // 64px
      },

      // Sombras personalizadas
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'none': 'none',
      },

      // Bordes personalizados
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',  // 2px
        'DEFAULT': '0.25rem', // 4px
        'md': '0.375rem',  // 6px
        'lg': '0.5rem',    // 8px
        'xl': '0.75rem',   // 12px
        '2xl': '1rem',     // 16px
        '3xl': '1.5rem',   // 24px
      },
    },
  },

  // Plugins adicionales para funcionalidades avanzadas
  plugins: [
    // Plugin para agregar componentes personalizados
    function ({ addComponents }) {
      addComponents({
        // Contenedor personalizado para presupuestos
        '.presupuesto-container': {
          width: '100%',
          maxWidth: '1920px', // Ancho por defecto para tus páginas
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          '@screen lg': {
            paddingLeft: '2rem',
            paddingRight: '2rem',
          },
          '@screen xl': {
            maxWidth: '2560px', // Más ancho en pantallas grandes
          },
        },

        // Tabla personalizada para presupuestos
        '.presupuesto-table': {
          width: '100%',
          minWidth: '1200px', // Ancho mínimo para tablas anchas
          '@screen 2xl': {
            minWidth: '1600px', // Más ancha en pantallas grandes
          },
        },
      });
    },

    // Plugin para agregar utilidades personalizadas
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-thin': {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#9CA3AF', // Gris 400
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#F3F4F6', // Gris 100
          },
        },
      });
    },
  ],
};