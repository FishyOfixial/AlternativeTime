export function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || import.meta.env.DEV) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/catalog-sw.js").catch(() => {
      // The app works normally without the service worker; registration is a performance enhancement.
    });
  });
}
