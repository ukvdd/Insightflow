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
          primary: "#FAFAF8",
          secondary: "#F2EDE7",
          tertiary: "#EAE4DC",
          hover: "#E2DBD1",
        },
        text: {
          primary: "#1C1917",
          secondary: "#57534E",
          muted: "#A8A29E",
        },
        accent: {
          amber: "#D97706",
          green: "#059669",
          blue: "#2563EB",
          rose: "#E11D48",
        },
        border: {
          subtle: "#E7E0D7",
          active: "#C9C0B4",
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
