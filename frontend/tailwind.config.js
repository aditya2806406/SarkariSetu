/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#050A18",
        surface: "#0E1830",
        surface2: "#132043",
        border: "rgba(237, 239, 245, 0.08)",
        marigold: {
          DEFAULT: "#F0A83C",
          bright: "#FFC168",
          dim: "#B67A28",
        },
        growth: {
          DEFAULT: "#1FAA75",
          bright: "#35D492",
        },
        ink: "#EDEFF5",
        slate: {
          ...colors.slate,
          DEFAULT: "#7C8AA5",
        },
        slateDim: "#4A5674",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Manrope", "sans-serif"],
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(180deg, rgba(240,168,60,0) 0%, rgba(5,10,24,1) 100%)",
      },
      boxShadow: {
        glow: "0 0 60px -12px rgba(240, 168, 60, 0.35)",
        glowGreen: "0 0 60px -12px rgba(31, 170, 117, 0.3)",
      },
    },
  },
  plugins: [],
};
