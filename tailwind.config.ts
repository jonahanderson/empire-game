import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#121826",
        paper: "#f8fafc",
        empire: "#0f766e",
        empireDark: "#115e59",
        accent: "#f59e0b"
      }
    }
  },
  plugins: []
};

export default config;
