/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui"), // correct CommonJS syntax for CRA
  ],
  daisyui: {
    themes: ["light", "dark", "cupcake"], // optional
  },
};
