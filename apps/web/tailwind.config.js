/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 海洋漂流瓶主题：深蓝渐变 + 琥珀色点缀
      colors: {
        ocean: {
          950: '#0f172a',
          900: '#0c1222',
          800: '#0a0f1a',
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}