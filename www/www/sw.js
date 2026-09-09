const CACHE = "ia-juridico-v6";
const BASE = self.location.pathname.replace(/sw\.js$/, "");

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll([BASE, BASE + "index.html", BASE + "manifest.json", BASE + "icon-192.png", BASE + "icon-512.png"]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Nunca intercepta chamadas de API externas (OpenAI, Anthropic, etc.)
  if (url.hostname !== self.location.hostname) return;

  // Navegação: shell-first para SPA funcionar offline
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(BASE + "index.html"))
    );
    return;
  }

  // Assets JS/CSS: cache + atualiza em background (stale-while-revalidate)
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(e.request);
      const networkFetch = fetch(e.request)
        .then((res) => {
          if (res && res.ok && e.request.method === "GET") {
            cache.put(e.request, res.clone());
          }
          return res;
        })
        .catch(() => cached);
      return cached ?? networkFetch;
    })
  );
});

// Permite atualização imediata quando há nova versão
self.addEventListener("message", (e) => {
  if (e.data?.type === "SKIP_WAITING") self.skipWaiting();
});
