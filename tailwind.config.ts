import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0D0D0F",
        dark: "#1A1A1F",
        muted: "#6B7280",
        soft: "#E5E7EB",
        canvas: "#F8FAFC",
        violet: "#6366F1",
        line: "#E5E7EB",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
        md: "0 4px 12px rgba(0, 0, 0, 0.06)",
        lg: "0 12px 24px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
