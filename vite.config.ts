import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  base: '/pathforge-td/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
  server: {
    port: 5173,
    open: true,
  },
});
