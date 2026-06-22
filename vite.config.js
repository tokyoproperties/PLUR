import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  logLevel: "error",
  plugins: [react()],
  base: "/PLUR/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
