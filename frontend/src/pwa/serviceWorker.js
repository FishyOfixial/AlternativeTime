import { useEffect, useRef, useState } from "react";

export function useServiceWorkerRegistration() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const updateServiceWorkerRef = useRef(async () => undefined);

  useEffect(() => {
    if (typeof window === "undefined" || import.meta.env.MODE === "test") {
      return undefined;
    }

    let isActive = true;

    import("virtual:pwa-register")
      .then(({ registerSW }) => {
        if (!isActive) {
          return;
        }

        updateServiceWorkerRef.current = registerSW({
          immediate: true,
          onNeedRefresh() {
            if (isActive) {
              setNeedRefresh(true);
            }
          },
          onOfflineReady() {
            if (isActive) {
              setOfflineReady(true);
            }
          },
          onRegisterError(error) {
            console.error("No fue posible registrar el service worker de la PWA.", error);
          }
        });
      })
      .catch((error) => {
        console.error("No fue posible cargar el registro del service worker.", error);
      });

    return () => {
      isActive = false;
    };
  }, []);

  async function updateServiceWorker(reloadPage = true) {
    await updateServiceWorkerRef.current(reloadPage);
    setNeedRefresh(false);
  }

  return {
    needRefresh,
    offlineReady,
    updateServiceWorker
  };
}
