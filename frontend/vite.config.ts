import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
  
    plugins: [react()],
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
    server: {
      port: 3000,
      // Same-origin /api in dev, so no CORS setup is needed locally.
      proxy: { '/api': { target: env.VITE_PROXY_TARGET || 'http://localhost:8000', changeOrigin: true } },
    },
    build: {
      target: 'es2022',
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            heroui: ['@heroui/react', 'framer-motion'],
            markdown: ['react-markdown'],
          },
        },
      },
    },
  };
});
