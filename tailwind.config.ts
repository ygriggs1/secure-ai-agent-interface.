import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        securityGreen: '#10b981',
        securityYellow: '#f59e0b',
        securityRed: '#ef4444',
        securityBlue: '#3b82f6',
      },
    },
  },
  plugins: [],
};
export default config;
