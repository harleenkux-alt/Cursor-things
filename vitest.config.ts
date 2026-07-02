import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

const root = process.cwd();

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(root, 'src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
