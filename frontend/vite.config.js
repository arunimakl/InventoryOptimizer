import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/eoq": "http://localhost:8000",
      "/rop": "http://localhost:8000",
      "/safety-stock": "http://localhost:8000",
      "/abc": "http://localhost:8000",
      "/health": "http://localhost:8000",
    },
  },
});