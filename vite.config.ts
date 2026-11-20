import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  root: "src/frontend",
  base: process.env.VITE_BASE || "/OGMOP/",
  publicDir: path.resolve(__dirname, "public"),
  plugins: [react()],
  build: {
    outDir: "../../dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@xyflow")) return "vendor-flow";
            if (id.includes("react-router") || id.includes("react-dom") || id.includes("react/")) return "vendor-react";
            if (
              id.includes("react-hook-form") ||
              id.includes("zod") ||
              id.includes("zustand") ||
              id.includes("axios")
            )
              return "vendor-form";
          }
        },
      },
    },
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
