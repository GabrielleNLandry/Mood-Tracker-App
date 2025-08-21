🌙 MoonMood – Mood Tracker & Journal (PWA)

MoonMood is a simple, privacy-friendly Progressive Web App for recording your mood, adding quick notes, and viewing lightweight insights. It installs to your home screen/desktop and works offline. Data is stored locally on the device (no accounts, no servers).

Features

Quick mood entry with optional note

Journal history with basic search

7-day insights & simple streaks

Installable PWA (A2HS)

Offline support after first load

Cozy dark theme

Tech Stack

React + Vite

vite-plugin-pwa (Workbox under the hood)

Deployed on Netlify


Project Structure (basic)
/pwa-starter
├─ public/
│  ├─ manifest.json
│  └─ icons/
│     ├─ icon-192.png
│     └─ icon-512.png
├─ src/
│  ├─ main.(tsx|jsx)
│  ├─ App.(tsx|jsx)
│  └─ components/   # Mood form, Journal list, Insights, etc.
├─ index.html
├─ vite.config.mjs
└─ netlify.toml     # if deploying with Netlify

Documentation (how to use & how it works)
Using the app

Open the app and choose today’s mood (e.g., 😄 🙂 😐 🙁 😫).

Optionally add a short note.

Review entries in Journal (search/filter basics).

See Insights for the last 7 days and your current streak.

How it works (high level)

State & storage: entries (date, mood, note) are saved locally (e.g., localStorage/IndexedDB) so your data stays on the device and remains available offline.

PWA: the service worker precaches the build output so the app loads without a network after the first visit.

UI: small, focused components: Mood input, Journal list, and Insights view.