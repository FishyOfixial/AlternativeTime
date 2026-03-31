import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useServiceWorkerRegistration } from "../pwa/serviceWorker";

const PwaContext = createContext(null);
const INSTALL_GUIDE_DISMISSED_KEY = "at.frontend.pwa.install.dismissed";
const RESTORED_CONNECTION_BANNER_MS = 4000;

function isNavigatorAvailable() {
  return typeof window !== "undefined" && typeof navigator !== "undefined";
}

function detectStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator?.standalone === true
  );
}

function detectAppleSafariFamily() {
  if (!isNavigatorAvailable()) {
    return {
      supportsManualInstallGuide: false,
      instructionLabel: "Instalar app",
      instructionHint: ""
    };
  }

  const userAgent = navigator.userAgent || "";
  const lowerAgent = userAgent.toLowerCase();
  const isAppleDevice = /iphone|ipad|ipod|macintosh/.test(lowerAgent);
  const isSafariLike =
    /safari/.test(lowerAgent) &&
    !/chrome|crios|edg|edge|firefox|fxios|opr|opera|android/.test(lowerAgent);
  const isMobileApple = /iphone|ipad|ipod/.test(lowerAgent);

  return {
    supportsManualInstallGuide: isAppleDevice && isSafariLike,
    instructionLabel: isMobileApple ? "Agregar a pantalla de inicio" : "Agregar al Dock",
    instructionHint: isMobileApple
      ? "En Safari usa Compartir > Agregar a pantalla de inicio."
      : "En Safari usa Archivo > Agregar al Dock."
  };
}

export function PwaProvider({ children }) {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [connectionBanner, setConnectionBanner] = useState(null);
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isStandalone, setIsStandalone] = useState(() => detectStandaloneMode());
  const [datasetStatuses, setDatasetStatuses] = useState({});
  const [isInstallGuideDismissed, setIsInstallGuideDismissed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem(INSTALL_GUIDE_DISMISSED_KEY) === "true";
  });
  const { needRefresh, offlineReady, updateServiceWorker } = useServiceWorkerRegistration();
  const appleEnvironment = useMemo(() => detectAppleSafariFamily(), []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    let restoredTimeoutId = null;

    const handleOnline = () => {
      setIsOnline(true);
      setConnectionBanner("restored");
      window.clearTimeout(restoredTimeoutId);
      restoredTimeoutId = window.setTimeout(() => {
        setConnectionBanner((current) => (current === "restored" ? null : current));
      }, RESTORED_CONNECTION_BANNER_MS);
    };

    const handleOffline = () => {
      window.clearTimeout(restoredTimeoutId);
      setIsOnline(false);
      setConnectionBanner("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.clearTimeout(restoredTimeoutId);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQueryList = window.matchMedia?.("(display-mode: standalone)");
    const syncStandaloneMode = () => {
      setIsStandalone(detectStandaloneMode());
    };

    syncStandaloneMode();
    mediaQueryList?.addEventListener?.("change", syncStandaloneMode);
    window.addEventListener("appinstalled", syncStandaloneMode);

    return () => {
      mediaQueryList?.removeEventListener?.("change", syncStandaloneMode);
      window.removeEventListener("appinstalled", syncStandaloneMode);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
    };

    const handleAppInstalled = () => {
      setInstallPromptEvent(null);
      setIsInstallGuideDismissed(false);
      window.localStorage.removeItem(INSTALL_GUIDE_DISMISSED_KEY);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!installPromptEvent) {
      return null;
    }

    await installPromptEvent.prompt();
    const result = await installPromptEvent.userChoice;

    if (result?.outcome !== "accepted") {
      setInstallPromptEvent(null);
    }

    return result;
  }, [installPromptEvent]);

  const dismissInstallGuide = useCallback(() => {
    setIsInstallGuideDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(INSTALL_GUIDE_DISMISSED_KEY, "true");
    }
  }, []);

  const applyAppUpdate = useCallback(async () => {
    await updateServiceWorker(true);
  }, [updateServiceWorker]);

  const setDatasetStatus = useCallback((datasetId, nextStatus) => {
    if (!datasetId) {
      return;
    }

    setDatasetStatuses((current) => {
      const nextEntry = {
        ...current[datasetId],
        ...nextStatus
      };

      const previousEntry = current[datasetId];
      const isUnchanged = JSON.stringify(previousEntry || null) === JSON.stringify(nextEntry);
      if (isUnchanged) {
        return current;
      }

      return {
        ...current,
        [datasetId]: nextEntry
      };
    });
  }, []);

  const clearDatasetStatus = useCallback((datasetId) => {
    if (!datasetId) {
      return;
    }

    setDatasetStatuses((current) => {
      if (!(datasetId in current)) {
        return current;
      }
      const nextStatuses = { ...current };
      delete nextStatuses[datasetId];
      return nextStatuses;
    });
  }, []);

  const shouldShowManualInstallGuide =
    !isStandalone &&
    !installPromptEvent &&
    appleEnvironment.supportsManualInstallGuide &&
    !isInstallGuideDismissed;

  const freshnessEntries = Object.values(datasetStatuses).filter(
    (entry) => entry?.savedAt || entry?.source
  );

  const contextValue = useMemo(
    () => ({
      isOnline,
      connectionBanner,
      needRefresh,
      offlineReady,
      isStandalone,
      canPromptInstall: Boolean(installPromptEvent) && !isStandalone,
      shouldShowManualInstallGuide,
      installInstructionLabel: appleEnvironment.instructionLabel,
      installInstructionHint: appleEnvironment.instructionHint,
      datasetStatuses,
      freshnessEntries,
      setDatasetStatus,
      clearDatasetStatus,
      promptInstall,
      applyAppUpdate,
      dismissInstallGuide
    }),
    [
      appleEnvironment.instructionHint,
      appleEnvironment.instructionLabel,
      applyAppUpdate,
      clearDatasetStatus,
      connectionBanner,
      datasetStatuses,
      dismissInstallGuide,
      freshnessEntries,
      installPromptEvent,
      isOnline,
      isStandalone,
      needRefresh,
      offlineReady,
      promptInstall,
      setDatasetStatus,
      shouldShowManualInstallGuide
    ]
  );

  return (
    <PwaContext.Provider value={contextValue}>
      {children}
    </PwaContext.Provider>
  );
}

export function usePwaStatus() {
  return useContext(PwaContext) || {
    isOnline: true,
    connectionBanner: null,
    needRefresh: false,
    offlineReady: false,
    isStandalone: false,
    canPromptInstall: false,
    shouldShowManualInstallGuide: false,
    installInstructionLabel: "Instalar app",
    installInstructionHint: "",
    datasetStatuses: {},
    freshnessEntries: [],
    setDatasetStatus: () => undefined,
    clearDatasetStatus: () => undefined,
    promptInstall: async () => null,
    applyAppUpdate: async () => undefined,
    dismissInstallGuide: () => undefined
  };
}
