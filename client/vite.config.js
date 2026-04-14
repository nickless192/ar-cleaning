import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [react(),
    VitePWA({
      registerType: "prompt",
      manifest: false, // we are using our own manifest.json
      workbox: {
        clientsClaim: false,
        skipWaiting: false,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  optimizeDeps: {
    include: [
    ]
  }
})
