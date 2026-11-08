'use strict';
// MEDSWU-AARMS home-screen edition: keeps a copy of the program on the device, so it opens without the internet.
// The data never passes through here: it stays in this device's browser storage (IndexedDB).
const VERSION = '1.8.0-7a40d1e4a9';
const CACHE = 'aarms-' + VERSION;
const FILES = ["./","manifest.webmanifest","apple-touch-icon.png","icon-192.png","icon-512.png","icon-maskable-512.png","favicon.png","fonts/fonts.css","fonts/Anuphan-Variable.ttf","fonts/IBMPlexMono-Medium.ttf","fonts/IBMPlexMono-Regular.ttf","fonts/IBMPlexMono-SemiBold.ttf","fonts/IBMPlexSansThai-Bold.ttf","fonts/IBMPlexSansThai-Medium.ttf","fonts/IBMPlexSansThai-Regular.ttf","fonts/IBMPlexSansThai-SemiBold.ttf","fonts/IBMPlexSansThaiLooped-Bold.ttf","fonts/IBMPlexSansThaiLooped-Medium.ttf","fonts/IBMPlexSansThaiLooped-Regular.ttf","fonts/IBMPlexSansThaiLooped-SemiBold.ttf","fonts/NotoSansThai-Variable.ttf","fonts/Sarabun-Bold.ttf","fonts/Sarabun-Medium.ttf","fonts/Sarabun-Regular.ttf","fonts/Sarabun-SemiBold.ttf"];

self.addEventListener('install', (e) => {
  // every file must arrive, or this version is not used (the one before stays)
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))));
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('aarms-') && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});
// a new version waits until the person taps "อัปเดต" (work in progress is never cut off)
self.addEventListener('message', (e) => { if (e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== self.location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    // opening the app (any address inside it) gets the program page
    const hit = req.mode === 'navigate' ? await c.match('./', { ignoreSearch: true }) || await c.match('index.html', { ignoreSearch: true }) : await c.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try { return await fetch(req); } catch (err) { return new Response('', { status: 504, statusText: 'offline' }); }
  })());
});
