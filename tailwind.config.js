/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#122523",
          soft: "#2A3F3B",
        },
        teal: {
          50: "#EAF3EF",
          100: "#CFE6DD",
          400: "#2F7A6B",
          500: "#1B5C52",
          600: "#134640",
          700: "#0F3D3E",
          900: "#082423",
        },
        marigold: {
          100: "#FCEBC9",
          300: "#F3C46C",
          400: "#E8A33D",
          500: "#D9902A",
          600: "#B8781F",
        },
        coop: {
          400: "#4C9A63",
          500: "#2F7A4B",
          600: "#256239",
        },
        alert: {
          400: "#D8695D",
          500: "#C4453A",
          600: "#A3352C",
        },
        sand: {
          50: "#FBF9F4",
          100: "#F7F3EA",
          200: "#EFE7D4",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(18,37,35,0.06), 0 8px 24px -12px rgba(18,37,35,0.12)",
        pop: "0 4px 14px rgba(18,37,35,0.16)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
