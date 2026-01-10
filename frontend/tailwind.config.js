/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#1B8354",
                    dark: "#156b45",
                },
                accent: {
                    DEFAULT: "#00BFA5",
                    light: "#00D9C5",
                },
            },
            fontFamily: {
                sans: ["var(--font-tajawal)", "system-ui", "sans-serif"],
            },
        },
    },
    plugins: [],
};
