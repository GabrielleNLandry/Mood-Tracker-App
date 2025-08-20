import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      // This is your SW *source*
      srcDir: 'src',
      filename: 'sw.js',             // swSrc = src/sw.js
      injectRegister: 'auto',         // or 'script'
      // Optional: extra Workbox options for the injection step
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // format 'es' matches your build logs
        rollupFormat: 'es',
      },
      // Optional: manifest etc.
      manifest: {
        name: 'Mood Tracker',
        short_name: 'MoodTracker',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  // Ensure the Netlify "Publish directory" matches this outDir (default 'dist')
  build: {
    outDir: 'dist'
  }
})
