/* global importScripts, workbox */
const CACHE = "moonmood-offline-v1";

// Workbox CDN
importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js");

// Activate new SW immediately when updated
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});
workbox.core.clientsClaim();

// App shell / pages: NetworkFirst
workbox.routing.registerRoute(
  ({ request }) => request.mode === "navigate",
  new workbox.strategies.NetworkFirst({
    cacheName: `${CACHE}-pages`,
    plugins: [new workbox.expiration.ExpirationPlugin({ maxEntries: 50 })],
  })
);

// Static assets (JS/CSS): StaleWhileRevalidate
workbox.routing.registerRoute(
  ({ request }) => ["style", "script", "worker"].includes(request.destination),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: `${CACHE}-static`,
  })
);

// Images: CacheFirst with expiration
workbox.routing.registerRoute(
  ({ request }) => request.destination === "image",
  new workbox.strategies.CacheFirst({
    cacheName: `${CACHE}-images`,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);
