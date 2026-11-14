// SAO Arabic Reader - service worker (v2)
//
// Deliberately small. What it does:
//   * keeps a copy of the app shell so the site opens offline
//   * caches the build's hashed files (/assets/...) - they never change
//   * serves offline.html when there is no connection
// What it NEVER does (v1 did all of these and caused the "files download by
// themselves" and "page fails to load" problems):
//   * download or cache PDFs (they are 20-60 MB each)
//   * touch cross-origin requests (PDFs on raw.githubusercontent.com, Supabase, fonts, ads)
//   * serve an old copy of a page when the network works
const CACHE_PREFIX = "sao-";
const CACHE_NAME = "sao-arabic-reader-v2.0.0";

// The site can live under a sub-path (GitHub Pages: /<repo>/), so every URL is
// resolved against the service worker's own scope.
const scopeUrl = (p) => new URL(p, self.registration.scope).toString();
const scopePath = () => new URL(self.registration.scope).pathname;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // one missing file must not abort the install
      await Promise.allSettled(["offline.html"].map((p) => cache.add(scopeUrl(p))));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Remove every older SAO cache - including the multi-gigabyte PDF cache
      // that version 1 filled. Caches of other sites on this origin are untouched.
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((n) => n.startsWith(CACHE_PREFIX) && n !== CACHE_NAME)
          .map((n) => caches.delete(n)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // PDFs, Supabase, fonts, ads: browser handles them
  if (!url.pathname.startsWith(scopePath())) return; // other sites on this origin
  if (url.pathname.toLowerCase().endsWith(".pdf")) return;

  if (request.mode === "navigate") {
    event.respondWith(pageRequest(request, url));
    return;
  }
  if (url.pathname.startsWith(scopePath() + "assets/")) {
    event.respondWith(assetRequest(request)); // hashed file names: safe to keep forever
  }
  // everything else (manifest, icons, sw.js...) goes straight to the network / HTTP cache
});

// Pages: always the network first so a new deployment is seen immediately.
async function pageRequest(request, url) {
  try {
    const response = await fetch(request);
    // GitHub Pages answers deep links (/login, /pdf-works...) with the app shell
    // and status 404. That is still the app, so it is returned as it is.
    if (response.ok && url.pathname === scopePath()) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(scopeUrl(""), response.clone());
    }
    return response;
  } catch {
    const cache = await caches.open(CACHE_NAME);
    return (
      (await cache.match(scopeUrl(""))) ||
      (await cache.match(scopeUrl("offline.html"))) ||
      new Response("لا يوجد اتصال بالإنترنت", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    );
  }
}

async function assetRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}
