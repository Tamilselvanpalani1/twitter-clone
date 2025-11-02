/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",               // If using Vite or plain HTML
    "./src/**/*.{js,ts,jsx,tsx}", // Adjust based on your framework (React, Vue, etc.)
  ],
  theme: {
    extend: {}
  },
  plugins: [require('daisyui')],
};
