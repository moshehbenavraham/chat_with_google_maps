import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables with both prefixes
  const env = loadEnv(mode, '.', '');

  // Client-side Google Maps API key: Use VITE_ prefixed var (Vercel exposes these during build)
  // Fall back to non-prefixed for backward compatibility with local .env
  // Note: GEMINI_API_KEY is no longer injected client-side.
  // Ephemeral tokens are fetched from the backend on-demand.
  const mapsApiKey =
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    env.VITE_GOOGLE_MAPS_API_KEY ||
    env.GOOGLE_MAPS_API_KEY;

  return {
    server: {
      port: 3003,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:3011',
          changeOrigin: true,
        },
      },
    },
    plugins: [react()],
    define: {
      // Only Google Maps API key is exposed to the browser.
      // Gemini API key is kept server-side only for security.
      'process.env.GOOGLE_MAPS_API_KEY': JSON.stringify(mapsApiKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // React core libraries
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            // Google/Maps related libraries
            'vendor-google': ['@google/genai', '@vis.gl/react-google-maps'],
            // UI and utility libraries
            'vendor-ui': ['react-markdown', 'remark-gfm', '@headlessui/react', 'lodash', 'zustand'],
          },
        },
      },
    },
  };
});
