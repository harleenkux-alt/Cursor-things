import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'node:path';

const root = process.cwd();

/**
 * Demo build — a single self-contained HTML file rendering the real plugin UI
 * with mock data, loaded via file:// by the screenshot/video capture script.
 */
export default defineConfig({
  root: 'src/demo',
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: {
      '@': resolve(root, 'src'),
    },
  },
  build: {
    target: 'es2017',
    outDir: resolve(root, 'demo-dist'),
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve(root, 'src/demo/demo.html'),
    },
  },
});
