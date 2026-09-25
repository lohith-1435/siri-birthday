/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#030304',
          900: '#070709',
          800: '#0D0D12',
          700: '#14141D',
          600: '#1C1C28',
        },
        burgundy: {
          950: '#0D0205',
          900: '#16040A',
          800: '#230610',
          700: '#340A18',
          600: '#4A0E23',
        },
        gold: {
          50: '#FCF9EE',
          100: '#F8F1D6',
          200: '#EFE1A7',
          300: '#E5CD74',
          400: '#DAB844',
          500: '#D4AF37', // Metallic Gold Base
          600: '#B89225',
          700: '#947219',
          800: '#755717',
          900: '#604618',
          champagne: '#F3E5AB',
          light: '#FBF5DC',
          antique: '#C5A059',
          bronze: '#8C6D37',
        },
      },
      fontFamily: {
        cinzel: ['"Cinzel"', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'serif'],
        outfit: ['"Outfit"', 'sans-serif'],
        playfair: ['"Playfair Display"', 'serif'],
        marcellus: ['"Marcellus"', 'serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #FFF6D5 0%, #D4AF37 50%, #8C6D37 100%)',
        'gold-shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        'burgundy-radial': 'radial-gradient(circle at center, #230610 0%, #070709 75%)',
        'celestial-radial': 'radial-gradient(ellipse at top, #0c1222 0%, #050508 70%)',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(1.5deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.08)' },
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        spinReverse: {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
      },
      animation: {
        'shimmer': 'shimmer 3s infinite ease-in-out',
        'float-slow': 'floatSlow 7s infinite ease-in-out',
        'pulse-glow': 'pulseGlow 4s infinite ease-in-out',
        'spin-slow': 'spinSlow 60s linear infinite',
        'spin-reverse': 'spinReverse 45s linear infinite',
      },
    },
  },
  plugins: [],
}
