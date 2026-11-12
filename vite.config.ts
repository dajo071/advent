/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Na GitHub Pages beží aplikácia pod /<názov-repozitára>/.
const base = process.env.BASE_PATH ?? '/advent/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'og.png'],
      manifest: {
        name: 'Cesta k jasliam – adventná duchovná cesta',
        short_name: 'Cesta k jasliam',
        description: 'Každý deň adventu jedno okienko: Božie slovo, zamyslenie, modlitba a skutok lásky.',
        lang: 'sk',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        background_color: '#0d1525',
        theme_color: '#0d1525',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff2}'], globIgnores: ['**/*cyrillic*', '**/*greek*', '**/*vietnamese*'], cleanupOutdatedCaches: true },
    }),
  ],
  test: { environment: 'node', include: ['src/**/*.test.ts', 'scripts/**/*.test.mjs'] },
});
