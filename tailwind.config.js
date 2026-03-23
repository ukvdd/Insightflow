/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0C0C0E",
          secondary: "#141416",
          tertiary: "#1C1C20",
          hover: "#24242A",
        },
        text: {
          primary: "#E8E4DF",
          secondary: "#9A9590",
          muted: "#6A6560",
        },
        accent: {
          amber: "#E8A84C",
          green: "#4CAF82",
          blue: "#5B8DEF",
          rose: "#D4687A",
        },
        border: {
          subtle: "#2A2A2E",
          active: "#4A4A50",
        },
      },
      fontFamily: {
        display: ['"DM Sans"', "sans-serif"],
        body: ['"DM Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};
