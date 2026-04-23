/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:        '#080810',
        surface:   '#111118',
        surface2:  '#1A1A24',
        border:    '#2A2A38',
        accent:    '#C8FF00',
        danger:    '#FF4444',
        warning:   '#FFB800',
        success:   '#00E676',
        text1:     '#F0F0F0',
        text2:     '#888899',
        textMuted: '#44445A',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
      },
      borderRadius: {
        card:   '12px',
        button: '8px',
      },
      height: {
        input:  '52px',
        button: '52px',
      },
    },
  },
  plugins: [],
};
