import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS === 'true' ? '/dnd-encounter-runner/' : '/',
  plugins: [tanstackRouter({ autoCodeSplitting: true, target: 'react' }), react(), tailwindcss(), basicSsl()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    clearMocks: true,
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    watch: false,
  },
});
