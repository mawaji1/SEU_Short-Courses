import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    safelist: [
        // SEU gradient colors - prevent purging
        'from-seu-cyan', 'via-seu-cyan', 'to-seu-cyan',
        'from-seu-blue', 'via-seu-blue', 'to-seu-blue',
        'from-seu-purple', 'via-seu-purple', 'to-seu-purple',
        'from-seu-navy', 'via-seu-navy', 'to-seu-navy',
        'from-seu-orange', 'via-seu-orange', 'to-seu-orange',
        'from-seu-lime', 'via-seu-lime', 'to-seu-lime',
        'bg-seu-cyan', 'bg-seu-blue', 'bg-seu-purple', 'bg-seu-navy', 'bg-seu-orange', 'bg-seu-lime',
        'text-seu-cyan', 'text-seu-blue', 'text-seu-purple', 'text-seu-navy', 'text-seu-orange', 'text-seu-lime',
    ],
    theme: {
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                // SEU Brand Colors
                seu: {
                    cyan: "#32B7A8",       // PANTONE 3252C
                    blue: "#0083BE",       // PANTONE 7460C
                    purple: "#593888",     // PANTONE 267C
                    navy: "#111E4D",       // PANTONE 662C
                    orange: "#FFA300",     // PANTONE 137
                    lime: "#C4D600",       // PANTONE 382
                    slate: "#5A6872",      // PANTONE 7545
                    gray: "#D0D3D4",       // PANTONE 427
                },
            },
            fontFamily: {
                sans: ["IBM Plex Sans Arabic", "system-ui", "sans-serif"],
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};

export default config;
