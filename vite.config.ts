import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      external: [],
      output: {
        format: 'es',
      },
    },
  },
  define: {
    global: 'globalThis',
  },
  worker: {
    format: 'es',
  },
  esbuild: {
    target: 'esnext',
    supported: {
      'top-level-await': true
    }
  }
});
