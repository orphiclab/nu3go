import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // nu3go brand — fresh green
                primary: {
                    50: "#f0fdf4",
                    100: "#dcfce7",
                    200: "#bbf7d0",
                    300: "#86efac",
                    400: "#4ade80",
                    500: "#22c55e",
                    600: "#16a34a",
                    700: "#15803d",
                    800: "#166534",
                    900: "#14532d",
                    DEFAULT: "#22c55e",
                    foreground: "#ffffff",
                },
                // Neutral slate
                neutral: {
                    50: "#f8fafc",
                    100: "#f1f5f9",
                    200: "#e2e8f0",
                    300: "#cbd5e1",
                    400: "#94a3b8",
                    500: "#64748b",
                    600: "#475569",
                    700: "#334155",
                    800: "#1e293b",
                    900: "#0f172a",
                },
                // Semantic
                success: "#22c55e",
                warning: "#f59e0b",
                error: "#ef4444",
                info: "#3b82f6",
                background: "#f8fafc",
                surface: "#ffffff",
                border: "#e2e8f0",
                // ShadCN compatible aliases
                card: {
                    DEFAULT: "#ffffff",
                    foreground: "#0f172a",
                },
                muted: {
                    DEFAULT: "#f1f5f9",
                    foreground: "#64748b",
                },
                accent: {
                    DEFAULT: "#f0fdf4",
                    foreground: "#15803d",
                },
                destructive: {
                    DEFAULT: "#ef4444",
                    foreground: "#ffffff",
                },
                input: "#e2e8f0",
                ring: "#22c55e",
                foreground: "#0f172a",
            },
            fontFamily: {
                sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
                mono: ["JetBrains Mono", "Fira Code", "monospace"],
            },
            fontSize: {
                "2xs": "0.625rem",
            },
            borderRadius: {
                sm: "6px",
                md: "8px",
                lg: "12px",
                xl: "16px",
                "2xl": "20px",
            },
            boxShadow: {
                card: "0 0 0 1px rgb(0 0 0 / 0.04), 0 2px 8px rgb(0 0 0 / 0.06)",
                "card-hover": "0 4px 20px rgb(0 0 0 / 0.1)",
                sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                md: "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)",
                lg: "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)",
            },
            keyframes: {
                "fade-up": {
                    "0%": { opacity: "0", transform: "translateY(8px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                shimmer: {
                    "100%": { transform: "translateX(100%)" },
                },
                "pulse-ring": {
                    "0%": { transform: "scale(0.95)", opacity: "0.8" },
                    "70%": { transform: "scale(1)", opacity: "0" },
                    "100%": { transform: "scale(1)", opacity: "0" },
                },
            },
            animation: {
                "fade-up": "fade-up 0.2s ease-out",
                shimmer: "shimmer 1.5s infinite",
                "pulse-ring": "pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite",
            },
        },
    },
    plugins: [],
};

export default config;
