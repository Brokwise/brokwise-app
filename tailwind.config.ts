import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontSize: {
      xs: [
        "0.875rem",
        {
          lineHeight: "1.5",
          letterSpacing: "0em",
        },
      ],
      sm: [
        "1rem",
        {
          lineHeight: "1.5",
          letterSpacing: "0em",
        },
      ],
      md: [
        "1.125rem",
        {
          lineHeight: "1.5",
          letterSpacing: "0em",
        },
      ],
      lg: [
        "1.25rem",
        {
          lineHeight: "1.5",
          letterSpacing: "0em",
        },
      ],
      xl: [
        "1.5rem",
        {
          lineHeight: "1.5",
          letterSpacing: "0em",
        },
      ],
      "2xl": [
        "1.625rem",
        {
          lineHeight: "1.5",
          letterSpacing: "0em",
        },
      ],
      "3xl": [
        "2rem",
        {
          lineHeight: "1.5",
          letterSpacing: "0em",
        },
      ],
      "4xl": [
        "2.25rem",
        {
          lineHeight: "1.5",
          letterSpacing: "0em",
        },
      ],
      "5xl": [
        "2.5rem",
        {
          lineHeight: "1.5",
          letterSpacing: "0em",
        },
      ],
      "6xl": [
        "3rem",
        {
          lineHeight: "1.5",
          letterSpacing: "0em",
        },
      ],
    },
    screens: {
      xs: "380px",
      sm: "640px",
      md: "939px",
      lg: "1350px",
      xl: "1920px",
    },
    boxShadow: {
      xs: "0px 0px 10px 5px #00000010",
      sm: "4px 0px 20px 0px #0000000d",
      md: "0px 4px 10px 0px #0000000d",
      lg: "0px 4px 25px #00000055",
      xl: "0px 4px 250px 0px #00000026",
      "2xl": "0px 10px 50px #00000033",
      "3xl": "0px 4px 100px 0px #00000026",
      "4xl": "0px 4px 20px 10px #00000014",
      "5xl": "0px 12px 24px 0px rgba(0, 0, 0, 0.12)",
      "6xl": "0px 2px 40px 2px rgba(0, 0, 0, 0.08)",
    },

    extend: {
      spacing: {
        none: "0rem",
        xs: "0.25rem",
        sm: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.75rem",
        "4xl": "2rem",
        "5xl": "2.25rem",
        "6xl": "2.5rem",
        "7xl": "2.75rem",
        "8xl": "3rem",
      },
      size: {
        xs: "1rem",
        sm: "1.25rem",
        md: "1.5rem",
        lg: "1.75rem",
        xl: "1.875rem",
        "2xl": "2rem",
        "3xl": "2.25rem",
        "4xl": "2.5rem",
        "5xl": "2.75rem",
        "6xl": "3rem",
        "7xl": "3.25rem",
        "8xl": "3.5rem",
      },
      borderWidth: {
        1: "1px",
        3: "3px",
        5: "5px",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        // Ensure no other font families are available
        serif: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "Times", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "wave-slow": {
          "0%, 100%": { transform: "translate(0, 0) rotate(-5deg)" },
          "50%": { transform: "translate(20px, -30px) rotate(0deg)" },
        },
        "wave-slower": {
          "0%, 100%": { transform: "translate(0, 0) rotate(10deg)" },
          "50%": { transform: "translate(-20px, -20px) rotate(5deg)" },
        },
        "wave-pulse": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s infinite",
        // "wave-slow": "wave-slow 20s infinite ease-in-out",
        // "wave-slower": "wave-slower 25s infinite ease-in-out",
        // "wave-pulse": "wave-pulse 18s infinite ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
