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
          includeAssets: ['icono-metaform.png', 'anclora_metaform_logo.png'],
          manifest: {
            name: 'Anclora Metaform',
            short_name: 'Metaform',
            start_url: '/',
            display: 'standalone',
            background_color: '#ffffff',
            theme_color: '#1a73e8',
            icons: [
              {
                src: 'icono-metaform.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'anclora_metaform_logo.png',
                sizes: '512x512',
                type: 'image/png'
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      test: {
        setupFiles: 'src/setupTests.ts',
      },
    };
});