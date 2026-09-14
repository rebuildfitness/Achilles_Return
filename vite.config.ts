import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative assets support both a custom domain and GitHub Pages project paths.
export default defineConfig({ base: "./", plugins: [react()], define: { "import.meta.env.VITE_BUILD_ID": JSON.stringify(new Date().toISOString()) } });
