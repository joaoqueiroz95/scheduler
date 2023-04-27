/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      maxHeight: {
        128: "36rem",
        140: "40rem",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
