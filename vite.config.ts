import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

const repositoryBase = process.env.GITHUB_ACTIONS === 'true'
  ? '/BEU-CSE-Sem4-Exam-Tracker/'
  : '/';

export default defineConfig({
  base: repositoryBase,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      manifest: {
        name: 'BEU Exam Prep',
        short_name: 'BEU Prep',
        description: 'Local-first BEU CSE fourth-semester exam preparation.',
        theme_color: '#2563eb',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: repositoryBase,
        scope: repositoryBase,
        icons: [
          { src: 'assets/app-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'assets/app-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2,webmanifest}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: false,
        skipWaiting: false,
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024
      },
      devOptions: { enabled: false }
    })
  ],
  build: { target: 'es2022', sourcemap: true },
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'] }
});
