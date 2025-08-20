// src/sw.js
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

self.skipWaiting();
self.clientsClaim();

// ⬇️ THIS IS REQUIRED for InjectManifest:
precacheAndRoute(self.__WB_MANIFEST);

// Optional: runtime caching for same-origin GETs
registerRoute(
  ({ request, url }) => request.method === 'GET' && url.origin === self.location.origin,
  new StaleWhileRevalidate()
);

cleanupOutdatedCaches();

