import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const root = process.cwd();

/**
 * Main thread (sandbox) build.
 *
 * This code runs inside Figma's plugin sandbox. It has access to the `figma`
 * global but no DOM. It must be emitted as a single IIFE bundle.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(root, 'src'),
    },
  },
  build: {
    target: 'es2017',
    outDir: resolve(root, 'dist'),
    emptyOutDir: false,
    minify: false,
    lib: {
      entry: resolve(root, 'src/main/code.ts'),
      formats: ['iife'],
      name: 'InclusiveAudit',
      fileName: () => 'code.js',
    },
    rollupOptions: {
      output: {
        extend: true,
      },
    },
  },
});
