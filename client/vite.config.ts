import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: "https://stefanpython.github.io/ecom-shop/",
  plugins: [react(), tailwindcss()],
});
