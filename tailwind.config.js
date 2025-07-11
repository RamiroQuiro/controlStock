/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primario: 'var(--color-primary)',
        secundario: 'var(--color-secondary)',
        background: 'var(--color-background)',
        primary: {
          100: '#5FA5FA',
          150: '#5FA5FA50',
          200: '#5FD6FA',
          300: '#FAF75FFF',
          400: '#FA6D5F',
          500: '#9BE32B',
          600: '#2B60E3',
          'bg-claro': '#E9E9F1',
          'bg-componentes': '#F9FAFB',

          resaltado: '#E3D32B',
          texto: '#7F8A9AFF',
          textoTitle: '#3B3B3B',
          error: '#BF0404',
          background: '#E9E9F1',
        },
      },
      fontFamily: {
        IndieFlower: ['IndieFlower', 'serif'],
      },
      screens: {
        print: { raw: 'print' },
        screen: { raw: 'screen' },
      },
      keyframes: {
        abrirCat: {
          '0%': { transform: 'rotate(0.0deg)' },
          '10%': { transform: 'rotate(14deg)' },
          '20%': { transform: 'rotate(-8deg)' },
          '30%': { transform: 'rotate(14deg)' },
          '40%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(10.0deg)' },
          '60%': { transform: 'rotate(0.0deg)' },
          '100%': { transform: 'rotate(0.0deg)' },
        },
        sliceDown: {
          '0%': { maxHeight: '300px', opacity: '1' },
          '100%': { maxHeight: '0px', opacity: '0' },
        },
        sliceUp: {
          '0%': { maxHeight: '0px', opacity: '0' },
          '100%': { maxHeight: '300px', opacity: '1' },
        },
        aparecer: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        hoverFilter: {
          '0%': { Height: '50px' },
          '100%': { Height: 'auto' },
        },
        aparecerDeArriba: {
          '0%': { opacity: '0', transform: 'translateY(-10%)' },
          '80%': { opacity: '1', transform: 'translateY(0%) ' },
        },
        desaparecer: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        aparecerCote: {
          '0%': { transform: 'scale(0%) translateX(-20%) translateY(-20%)' },
          '100%': { transform: 'scale(100%) translateX(0%) translateY(0%)' },
        },
        desaparecerCote: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(150%)' },
        },
        float: {
          '0%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(-1%) translateX(0.5%)' },
          '100%': { transform: 'translateY(0%)' },
        },
        'bounce-side': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(3px)' },
        },
      },
      animation: {
        'waving-hand': 'abrirCat 2s linear infinite',
        aparecer: 'aparecer .25s ease-out ',
        apDeArriba: 'aparecerDeArriba .25s ease-in ',
        desaparecerCostado: 'desaparecerCote .3s ease-in ',
        float: 'float 3s ease-in-out infinite',
        'bounce-side': 'bounce-side 0.5s ease-in-out infinite',
      },
      boxShadow: {
        shadowCaja1: '10px 10px 25px -7px rgba(66,66,66,0.7)',
        xxxl: '5px 5px 5px rgba(0,0,0,0.1), 15px 15px 15px rgba(0,0,0,0.1), 20px 10px 20px rgba(0,0,0,0.1),50px 50px 80px rgba(0,0,0,0.25), inset 3px 3px 3px #fff  0vtzz5px 5px 5px rgba(0,0,0,0.1)5px 5px 5px rgba(0,0,0,0.1)5px 5px 5px rgba(0,0,0,0.1)5px 5px 5px rgba(0,0,0,0.1)AZ',
      },
    },
  },
  plugins: [],
};
