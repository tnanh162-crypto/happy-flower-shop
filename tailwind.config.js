/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#F6F1E9",
          50: "#FDFBF8",
          100: "#F6F1E9",
          200: "#EFE6D8",
          300: "#E4D5BE",
        },
        ink: {
          DEFAULT: "#203640",
          soft: "#4D626A",
        },
        mist: {
          DEFAULT: "#8FB8CC",
          50: "#F0F7FA",
          100: "#D9EAF1",
          200: "#BBD7E3",
          300: "#8FB8CC",
          400: "#659BB7",
          500: "#3F7898",
          600: "#2C5F7C",
        },
        clay: {
          DEFAULT: "#D9B8A3",
          light: "#EDDDD1",
        },
        sage: {
          DEFAULT: "#93AD8F",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-work-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 24px -12px rgba(46, 42, 37, 0.18)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
