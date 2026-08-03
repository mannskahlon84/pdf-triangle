import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0c10",
        foreground: "#f8fafc",
        obsidian: {
          900: "#080a0e",
          800: "#0f141d",
          700: "#161d2b",
          600: "#222c3f",
        },
        slatecard: {
          DEFAULT: "rgba(17, 24, 39, 0.7)",
          hover: "rgba(23, 33, 51, 0.8)",
          border: "rgba(255, 255, 255, 0.08)",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        "gradient-x": "gradientX 6s ease infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        gradientX: {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
        shimmer: {
          "0%": { "background-position": "-200% 0" },
          "100%": { "background-position": "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
