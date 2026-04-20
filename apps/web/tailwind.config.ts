import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          foreground: "#ffffff",
          muted: "#93c5fd",
          dark: "#1d4ed8",
        },
        surface: {
          DEFAULT: "#0a1628",
          elevated: "#132238",
          card: "#1e3a5f",
        },
        muted: {
          DEFAULT: "#64748b",
          fg: "#94a3b8",
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
