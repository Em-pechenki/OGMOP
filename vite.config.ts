import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

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
      "@shared": path.resolve(__dirname, "src/shared"),
      "@frontend": path.resolve(__dirname, "src/frontend"),
    },
  },
  server: {
    port: 5173,
  },
});