import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // REST API
      "/api": {
        target: "http://localhost:5050",
        changeOrigin: true,
      },
      // Uploaded static assets
      "/uploads": {
        target: "http://localhost:5050",
        changeOrigin: true,
      },
      // Socket.IO (websocket)
      "/socket.io": {
        target: "http://localhost:5050",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
