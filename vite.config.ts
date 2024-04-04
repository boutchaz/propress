import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

let faviconURL = "/favicon.svg";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "env.VITE_API_REAL_URL",
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
    cors: false,
  },
  preview: {
    proxy: {
      "/api": {
        target: "env.VITE_API_REAL_URL",
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
    cors: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          lodash: ["lodash"],
        },
      },
    },
  },
  plugins: [
    react(),
    TanStackRouterVite(),
  ],
});
