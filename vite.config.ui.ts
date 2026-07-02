import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'node:path';

const root = process.cwd();

/**
 * UI build.
 *
 * Figma plugins load their UI from a single self-contained HTML file. We use
 * `vite-plugin-singlefile` to inline all JS/CSS into `dist/ui.html`.
 */
export default defineConfig({
  root: 'src/ui',
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: {
      '@': resolve(root, 'src'),
    },
  },
  build: {
    target: 'es2017',
    outDir: resolve(root, 'dist'),
    emptyOutDir: false,
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve(root, 'src/ui/ui.html'),
      output: {
        entryFileNames: 'ui.js',
      },
    },
  },
});
