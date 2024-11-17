/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        slideDown: {
          "0%": { transform: "translateY(-100%)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        slideUp: {
          "0%": { transform: "translateY(0)", opacity: 1 },
          "100%": { transform: "translateY(-100%)", opacity: 0 },
        },
      },
      animation: {
        slideDown: "slideDown 0.5s ease-out forwards",  // Add slideDown animation
        slideUp: "slideUp 0.5s ease-in forwards",        // Add slideUp animation (optional)
      },
    },
    backgroundImage: {
      "main-page-background": [
        "url('https://github.com/NinadxBaruah/image-host/blob/main/chat-app-background-min.png?raw=true')",
        "linear-gradient(to right, #D2D78D, #D0D8B5, #84B289)",
      ],
    },
  },
  plugins: [],
};
