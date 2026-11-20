import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  root: "src/frontend",
  base: process.env.VITE_BASE || "/OGMOP/",
  plugins: [react()],
  build: {
    outDir: "../../dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-flow": ["@xyflow/react"],
          "vendor-form": ["react-hook-form", "zod", "zustand", "axios"],
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