/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maya: {
          dark: "#696FC7",    // Sidebar purple
          light: "#A7AAE1",   // Light purple buttons/accents
          beige: "#F5D3C4",   // Background accent
          pink: "#F2AEBB",    // Background accent
          grid: "#cfd1e6",    // Grid line color
        }
      },
      backgroundImage: {
        // Creates the "Graph Paper" sketchy look
        'sketchy-grid': `
          linear-gradient(to right, #cfd1e6 1px, transparent 1px),
          linear-gradient(to bottom, #cfd1e6 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'sketchy': '24px 24px',
      },
      // Added Font Family for the Sketchy Look
      fontFamily: {
        handwriting: ['"Patrick Hand"', 'cursive'],
        sans: ['"Open Sans"', 'sans-serif'],
      },
      animation: {
        spotlight: "spotlight 2s ease .75s 1 forwards",
        'orb-float': "float 6s ease-in-out infinite",
        'orb-breathe': "breathe 4s ease-in-out infinite",
      },
      keyframes: {
        spotlight: {
          "0%": { opacity: 0, transform: "translate(-72%, -62%) scale(0.5)" },
          "100%": { opacity: 1, transform: "translate(-50%,-40%) scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        }
      },
    },
  },
  plugins: [],
}