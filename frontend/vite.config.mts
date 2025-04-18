import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        changeOrigin: true,
        target: 'http://localhost:3000/',
      },
      '/ws': {
        // rewriteWsOrigin: true,
        target: 'ws://localhost:3000/',
        ws: true,
      },
    },
  },
});
