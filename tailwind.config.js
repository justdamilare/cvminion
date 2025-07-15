/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FFD700',
          dark: '#FFC700',
        },
        dark: {
          DEFAULT: '#1A1A1A',
          light: '#2A2A2A',
        },
        light: {
          DEFAULT: '#FFFFFF',
          gray: '#F8F9FA',
        },
        // Theme-aware colors
        background: {
          DEFAULT: '#FFFFFF',
          secondary: '#F8F9FA',
        },
        text: {
          DEFAULT: '#1A1A1A',
          secondary: '#6B7280',
          muted: '#9CA3AF',
        },
        border: {
          DEFAULT: '#E5E7EB',
          light: '#F3F4F6',
        },
        card: {
          DEFAULT: '#FFFFFF',
          hover: '#F9FAFB',
        }
      },
      fontFamily: {
        cabinet: ['Cabinet Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
};