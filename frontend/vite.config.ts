import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,               // run Vite on port 5173
    proxy: {                  // forward these paths to FastAPI on 8000
      "/auth":                "http://localhost:8000",
      "/users":               "http://localhost:8000",
      "/personalized-feed":   "http://localhost:8000",
      "/scrape-propositions": "http://localhost:8000",
      "/simplify-propositions":"http://localhost:8000",
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
