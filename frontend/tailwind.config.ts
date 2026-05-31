import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        board: "#0f1419",
        column: "#1a1f2e",
        card: "#252b3b",
        "card-hover": "#2d3548",
        border: "#3d4556",
        accent: "#6366f1",
        "accent-muted": "#4f46e5",
        text: "#e2e8f0",
        "text-muted": "#94a3b8",
      },
    },
  },
  plugins: [],
};

export default config;
