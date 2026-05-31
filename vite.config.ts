import { tanstackRouter } from '@tanstack/router-plugin/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS === 'true' ? '/dnd-encounter-runner/' : '/',
  plugins: [tanstackRouter({ autoCodeSplitting: true, target: 'react' }), react(), basicSsl()],
  test: {
    clearMocks: true,
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    watch: false,
  },
});
