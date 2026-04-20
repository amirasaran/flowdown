import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'llm-markdown/web': path.resolve(__dirname, '../../src/web/index.tsx'),
      'llm-markdown': path.resolve(__dirname, '../../src/index.ts'),
    },
  },
  server: {
    port: 5173,
  },
});
