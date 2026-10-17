// Mini App'ning Tailwind sozlamalari. Ilgari bu index.html ichida turardi va
// cdn.tailwindcss.com har bir ochilishda telefonning O'ZIDA butun CSS'ni
// noldan yasardi — sahifa shu tugaguncha kutardi (o'rta telefonda ~2 s).
// Endi CSS oldindan yig'iladi: tools/tailwind/build.sh -> tailwind.css.
module.exports = {
  content: [
    "../../index.html",
    "../../*.js",
  ],
  theme: {
    extend: {
      fontFamily: { sans: ["Outfit", "Plus Jakarta Sans", "sans-serif"] },
      colors: {
        slate: { 950: "#0a0e17", 900: "#111827", 800: "#1c2742" },
        cyan: { 300: "#7df9ff", 400: "#59d8de", 500: "#00dbe9", 600: "#04a9af" },
        amber: { 300: "#fde68a", 400: "#ffb020" },
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/container-queries")],
};
