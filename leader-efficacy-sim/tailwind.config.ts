import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#FBF8F1",
        paper: "#FFFFFF",
        navy: { DEFAULT: "#16233C", soft: "#2B3B5B", muted: "#5B6884" },
        gold: { DEFAULT: "#B08D3F", soft: "#D9BC77", pale: "#F3EAD5" },
        chat: { bg: "#B5CECC", header: "#FFD337", mine: "#FCDD53" },
        line: "#E7E1D5",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        blink: { "0%,80%,100%": { opacity: "0.25" }, "40%": { opacity: "1" } },
        popIn: { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        blink: "blink 1.2s infinite ease-in-out",
        popIn: "popIn 220ms ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
