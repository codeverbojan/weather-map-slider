import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.', // stay in plugin folder
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        app: path.resolve(__dirname, 'assets/js/app.js'),
      },
      output: {
        entryFileNames: 'js/[name].js',
        assetFileNames: 'css/[name].[ext]',
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '', // you can inject global SCSS variables here
      },
    },
  },
});
