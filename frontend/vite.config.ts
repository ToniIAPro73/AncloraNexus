import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['images/logos/Anclora Nexus fondo transparente.png', 'images/logos/Anclora fondo transparente.png'],
        manifest: {
          name: 'Anclora Nexus',
          short_name: 'Anclora',
          start_url: '/',
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#059669',
          icons: [
            { src: 'images/logos/Anclora Nexus fondo transparente.png', sizes: '192x192', type: 'image/png' },
            { src: 'images/logos/Anclora fondo transparente.png', sizes: '512x512', type: 'image/png' }
          ]
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: { '@': path.resolve(__dirname, '.') }
    },
    test: { setupFiles: 'src/setupTests.ts' },

    // ConfiguraciÃ³n simplificada del servidor
    appType: 'spa',
    server: {
      port: 5173,
      open: true
    }
  };
});

