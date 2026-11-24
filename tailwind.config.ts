import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        lime: {
          accent: "#b8ff3c",
          bright: "#c8ff29",
          muted: "rgba(184, 255, 60, 0.15)",
        },
        subject: {
          maths: {
            DEFAULT: "#38bdf8",
            light: "#e0f2fe",
            dark: "#0369a1",
          },
          physics: {
            DEFAULT: "#a855f7",
            light: "#f3e8ff",
            dark: "#6b21a8",
          },
          chemistry: {
            DEFAULT: "#10b981",
            light: "#d1fae5",
            dark: "#047857",
          },
          cs: {
            DEFAULT: "#f59e0b",
            light: "#fef3c7",
            dark: "#b45309",
          },
          english: {
            DEFAULT: "#f43f5e",
            light: "#ffe4e6",
            dark: "#be123c",
          },
          pe: {
            DEFAULT: "#14b8a6",
            light: "#ccfbf1",
            dark: "#0f766e",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        glow: "0 0 25px -5px var(--glow-color, rgba(184, 255, 60, 0.3))",
        "glow-lime": "0 0 30px -5px rgba(184, 255, 60, 0.35)",
        "glow-blue": "0 0 30px -5px rgba(56, 189, 248, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
