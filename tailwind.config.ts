import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#82B74B",
          greenLight: "#97C369",
          greenDark: "#689938",
          red: "#A94845",
          redLight: "#C45B58",
          redDark: "#873532",
          blue: "#3B76B3",
          blueLight: "#508ECB",
          blueDark: "#2A5B8C",
          ochre: "#D4A359",
          charcoal: "#111317",
          surface: "#181B22",
          surfaceElevated: "#21252E",
          border: "rgba(255, 255, 255, 0.08)",
        },
        charcoal: {
          950: "#0B0C0E",
          900: "#111317",
          850: "#181B22",
          800: "#21252E",
          700: "#323742",
        },
        stone: {
          50: "#FAF9F6",
          100: "#F4F3EF",
          200: "#EAE8E1",
          300: "#D8D5CA",
          600: "#706E66",
          800: "#383632",
          900: "#1F1E1B",
        },
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "system-ui", "sans-serif"],
        display: ["var(--font-el-messiri)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
