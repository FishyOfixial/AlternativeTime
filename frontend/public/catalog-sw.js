const STATIC_CACHE = "alternative-time-static-v1";
const IMAGE_CACHE = "alternative-time-images-v1";
const CLOUDINARY_HOST_SUFFIX = ".res.cloudinary.com";

function isCloudinaryImage(requestUrl) {
  return requestUrl.hostname.endsWith(CLOUDINARY_HOST_SUFFIX) || requestUrl.hostname === "res.cloudinary.com";
}

function isStaticAsset(requestUrl) {
  return requestUrl.origin === self.location.origin && requestUrl.pathname.startsWith("/assets/");
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok || response.type === "opaque") {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cachedResponse);

  return cachedResponse || networkPromise;
}

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (isStaticAsset(requestUrl)) {
    event.respondWith(staleWhileRevalidate(event.request, STATIC_CACHE));
    return;
  }

  if (event.request.destination === "image" && isCloudinaryImage(requestUrl)) {
    event.respondWith(staleWhileRevalidate(event.request, IMAGE_CACHE));
  }
});
