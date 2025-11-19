/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          900: "#000000",
          300: "#D1D0D0",
          500: "#988686",
          700: "#5C4E4E",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Helvetica", "Arial"],
      },
    },
  },
  plugins: [],
};
