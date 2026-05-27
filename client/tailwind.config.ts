// tailwind.config.ts

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],

  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],

  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1320px",
      },
    },

    extend: {
      /* ─────────────────────── */
      /* COLORS                  */
      /* ─────────────────────── */

      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",

        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          foreground: "rgb(var(--card-foreground) / <alpha-value>)",
        },

        popover: {
          DEFAULT: "rgb(var(--popover) / <alpha-value>)",
          foreground: "rgb(var(--popover-foreground) / <alpha-value>)",
        },

        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
        },

        border: "rgb(var(--border) / <alpha-value>)",

        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },

        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
        },

        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
        },

        ring: "rgb(var(--ring) / <alpha-value>)",

        /* ─── Gold Brand Scale ─── */
        gold: {
          50: "#FDFBF2",
          100: "#FAF4D5",
          200: "#F5E79A",
          300: "#EFD460",
          400: "#EAC030",
          500: "#D4A017" /* main gold */,
          600: "#BA900C" /* deep gold */,
          700: "#9A7509",
          800: "#7B5B07",
          900: "#5C4205",
          950: "#3D2C03",
        },

        /* ─── Dark Luxury Scale ─── */
        obsidian: {
          50: "#F5F4F0",
          100: "#E8E5DC",
          200: "#D0CCBF",
          300: "#B0AA98",
          400: "#8A8170",
          500: "#665D4A",
          600: "#4A4335",
          700: "#332E22",
          800: "#1E1A12",
          900: "#141008",
          950: "#0A0A08",
        },
      },

      /* ─────────────────────── */
      /* TYPOGRAPHY              */
      /* ─────────────────────── */

      fontFamily: {
        sans: ["Vazirmatn", "sans-serif"],
      },

      /* ─────────────────────── */
      /* BORDER RADIUS           */
      /* ─────────────────────── */

      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.5rem",
      },

      /* ─────────────────────── */
      /* SHADOWS                 */
      /* ─────────────────────── */

      boxShadow: {
        soft: "0 4px 20px rgba(0,0,0,0.06)",
        premium: "0 12px 40px rgba(0,0,0,0.10)",
        luxury: "0 20px 60px rgba(0,0,0,0.14)",
        gold: "0 8px 30px rgba(186,144,12,0.30)",
        "gold-lg": "0 16px 48px rgba(186,144,12,0.40)",
        "inner-gold": "inset 0 1px 0 rgba(212,160,17,0.15)",
      },

      /* ─────────────────────── */
      /* BACKDROP                */
      /* ─────────────────────── */

      backdropBlur: {
        xs: "2px",
      },

      /* ─────────────────────── */
      /* ANIMATION               */
      /* ─────────────────────── */

      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        pulse_gold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(212,160,17,0)" },
          "50%": { boxShadow: "0 0 0 8px rgba(212,160,17,0.15)" },
        },
      },

      animation: {
        float: "float 5s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
        fadeUp: "fadeUp 0.6s ease forwards",
        fadeIn: "fadeIn 0.5s ease forwards",
        pulse_gold: "pulse_gold 2s ease infinite",
      },
    },
  },

  plugins: [],
};

export default config;
