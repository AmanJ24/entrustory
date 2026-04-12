/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // We'll force dark mode based on your designs
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0dccf2", // Neon Cyan
          dark: "#0ab8da",
          light: "#e0fbff",
        },
        background: {
          light: "#f5f8f8",
          dark: "#0B1120",   // Deepest background
          app: "#111718",    // App background
        },
        surface: {
          light: "#ffffff",
          dark: "#1b2527",   // Card/Panel background
          hover: "#1e3236",
        },
        border: {
          dark: "#283639",
        },
        text: {
          secondary: "#9cb5ba",
        }
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
}
