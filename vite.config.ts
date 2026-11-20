import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "src/frontend",
  base: "/OGMOP/",
  plugins: [react()],
  build: {
    outDir: "../../dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@shared": "/src/shared",
      "@frontend": "/src/frontend",
    },
  },
  server: {
    port: 5173,
  },
});
