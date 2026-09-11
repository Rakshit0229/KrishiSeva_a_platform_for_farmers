import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'KrishiSeva',
        short_name: 'KrishiSeva',
        description: 'Smart Farmer Procurement Platform — Ministry of Consumer Affairs',
        theme_color: '#2A6B35',
        background_color: '#FAFAF7',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/api\/centres/,
            handler: 'StaleWhileRevalidate',
          },
          {
            urlPattern: /\/api\/msp\/rates/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'msp-cache',
              expiration: { maxAgeSeconds: 86400 },
            },
          },
          {
            urlPattern: /\/api\/faq/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'faq-cache',
              expiration: { maxAgeSeconds: 3600 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
