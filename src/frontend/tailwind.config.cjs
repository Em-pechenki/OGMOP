/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./*.{ts,tsx}", "./**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#50B848",
          dark: "#3d8f3a",
          light: "#e9f7f3",
        },
        secondary: {
          DEFAULT: "#494B52",
          light: "#f6f8fa",
        },
        brand: {
          green: "#50B848",
          gray: "#494B52",
          dark: "#01000c",
        },
        surface: "#F6F8FA",
        success: "#50B848",
        warning: "#FEECCC",
        error: "#D32F2F",
        info: "#D9ECFF",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
      },
      boxShadow: {
        card: "0 0 24px rgba(0,0,0,0.03)",
        hover: "0 4px 12px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
