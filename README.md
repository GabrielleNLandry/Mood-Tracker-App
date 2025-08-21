# 🌙 MoonMood – Mood Tracker & Journal (PWA)
MoonMood is a simple, privacy-friendly Progressive Web App for recording your mood, adding quick notes, and viewing lightweight insights. It installs on your home screen/desktop and works offline. Data is stored locally on your device (no accounts, no servers).

**Live URL:** https://moon-mood.netlify.app/
**Code folder:** pwa-starter/

**✨ Features**
* Quick mood entry with optional note
* Journal history with basic search
* 7-day insights & simple streaks
* Installable PWA (Add to Home Screen)
* Offline support after first load
* Cozy dark theme

**🛠 Tech Stack**
* React + Vite
* vite-plugin-pwa (Workbox)
* Deployed on Netlify

**🚀 Getting Started**
```
# from repo root if needed
cd pwa-starter

# install deps
npm install

# run dev server
npm run dev

# production build
npm run build

# preview the production build
npm run preview
```
**📄 Web App Manifest (required)**
public/manifest.json (minimal example):
```
{
  "name": "MoonMood – Mood Tracker & Journal",
  "short_name": "MoonMood",
  "description": "Track your daily mood, jot quick notes, and view simple insights. Offline and private by design.",
  "id": "com.gabrielle.moonmood",
  "start_url": "/?source=pwa",
  "scope": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0f172a",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```
Place icon files exactly at:
```
public/icons/icon-192.png  # 192×192
public/icons/icon-512.png  # 512×512
```
**🧩 Service Worker (generateSW)**
Use vite-plugin-pwa in generateSW mode (no custom SW file needed):

```
// vite.config.mjs
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'] },
      manifest: false // keep manifest in /public/manifest.json
    })
  ]
})
```

☁️ Deploy (Netlify)
**Option A — Repo root contains pwa-starter/ (recommended)**
Put this netlify.toml at the repo root (one level above pwa-starter/):

```
[build]
  base = "pwa-starter"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
**Option B — Site points directly to pwa-starter/**
Put netlify.toml inside pwa-starter/ and remove the base line:
```
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
Post-deploy check (private window):
```
https://moon-mood.netlify.app/icons/icon-192.png
https://moon-mood.netlify.app/icons/icon-512.png
```
Both should render PNGs (not HTML).

**📦 Deployment Steps Documentation**
Describe how you registered, built, and submitted the app

1) Registration
* Service Worker Registration: Configured vite-plugin-pwa with registerType: 'autoUpdate' and injectRegister: 'auto' so the service worker registers automatically in production.

* Manifest & Icons: Added public/manifest.json and two required icons:
    * public/icons/icon-192.png (192×192, PNG, maskable)
    * public/icons/icon-512.png (512×512, PNG, maskable)
* Hosting/CI Registration (Netlify):
    * Connected GitHub repo to Netlify.
    * Build settings:
        * If repo has a parent folder: Base directory = pwa-starter, Build = npm run build, Publish = dist
        * Or use netlify.toml (see above).

**2) Build**
Local build & preview:
```
npm install
npm run build
npm run preview
```
* Verified production preview at http://localhost:4173.
* Confirmed PWA assets generated (dist/sw.js) and icons available at /icons/....
* Lighthouse (Chrome DevTools):
    * PWA: Installable ✅
    * PWA: Works offline ✅

**3) Deploy**
* Netlify built and published dist/ automatically from the connected repo.
* Post-deploy verification (private window):
    * /icons/icon-192.png and /icons/icon-512.png returned image/png.
    * Manifest served correctly; app installable.

**4) Submission (Android TWA via PWABuilder)**
* Went to https://www.pwabuilder.com/ → entered live URL.
* Resolved any manifest/icon issues (ensured exact file paths/sizes and correct content type).
* Generated Android (TWA) package.
* Digital Asset Links (if required by TWA):
    * Served /.well-known/assetlinks.json from the site to verify app–site relationship.
*Uploaded the .aab (or built from generated project) to Google Play Console (Internal testing → Production).

**5) Troubleshooting Notes**
* Invalid icon content-type (text/html) on PWABuilder usually means the icon path 404’d and your SPA served index.html. Fix by ensuring:
    * Exact filenames: icon-192.png, icon-512.png
    * Exact sizes: 192×192 and 512×512
    * Located under public/icons/ so they appear at /icons/... in production.

* Workbox InjectManifest error → Use generateSW config above, or (if using a custom SW) ensure        precacheAndRoute(self.__WB_MANIFEST) is present and swSrc ≠ swDest.
*Netlify “No config file was defined” → netlify.toml not at directory Netlify builds from. Move it to the repo root (with base = "pwa-starter") or set Base directory in the UI.

**🔒 Privacy**
MoonMood stores data locally (e.g., localStorage/IndexedDB). No server-side accounts; clear your browser data to remove entries.

🧑‍💻 Author
Gabrielle Landry — Applied Computer Science / Software Development

📄 License
MIT (or your preferred license)
