import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// import { extractStyle } from 'ant-design-vue/lib/_util/static-style-extract';
// import fs from 'fs';
// const csspath = path.resolve(__dirname, './src/assets/styles/antd-min.css');
// const css = extractStyle();
// fs.writeFileSync(csspath, css);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      assets: path.resolve(__dirname, 'src/assets'),
    },
  },
  build: {
    outDir: 'setter-dist',
    rollupOptions: {
      input: {
        index: 'src/main.ts',
      },
      output: {
        entryFileNames: '[name].js',
        format: 'iife',
      },
    },
  },
});
