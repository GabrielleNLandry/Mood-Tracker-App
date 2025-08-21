// vite.config.mjs
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Let the plugin generate the SW for you (generateSW mode)
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      // Optional: which assets to precache
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
      },

      // Keep your manifest inline here (or set manifest:false and use /public/manifest.json)
      manifest: {
        name: 'MoonMood – Mood Tracker & Journal',
        short_name: 'MoonMood',
        description: 'Track your daily mood, jot quick notes, and view simple insights. Offline and private by design.',
        id: 'com.gabrielle.moonmood',
        start_url: '/?source=pwa',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0f172a',
        dir: 'ltr',
        lang: 'en',
        orientation: 'portrait',
        categories: ['health', 'lifestyle', 'productivity'],
        prefer_related_applications: false,
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        screenshots: [
          { src: '/screenshots/today.png',    sizes: '1080x1920', type: 'image/png', form_factor: 'narrow', label: 'Today: quick mood + note' },
          { src: '/screenshots/journal.png',  sizes: '1080x1920', type: 'image/png', form_factor: 'narrow', label: 'Journal & search' },
          { src: '/screenshots/insights.png', sizes: '1080x1920', type: 'image/png', form_factor: 'narrow', label: 'Insights: last 7 days & streak' }
        ],
        launch_handler: { client_mode: 'navigate-existing' }
      }
    })
  ]
})

