/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-syne)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        gold: { DEFAULT: "#f59e0b", light: "#fcd34d", dark: "#92400e" },
      },
    },
  },
  plugins: [],
};
