import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        coal: "#191817",
        gold: "#f4b400",
        amberSoft: "#fff6d8",
      },
      boxShadow: {
        gold: "0 20px 60px rgba(244, 180, 0, 0.22)",
        soft: "0 16px 48px rgba(17, 17, 17, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
