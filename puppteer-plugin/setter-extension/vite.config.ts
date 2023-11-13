import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'setter-dist',
    rollupOptions: {
      input: {
        index: 'src/main.ts'
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
});
