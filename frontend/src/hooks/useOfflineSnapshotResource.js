import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getOfflineSnapshot, saveOfflineSnapshot } from "../pwa/offlineSnapshots";

const initialState = {
  status: "loading",
  data: null,
  error: "",
  source: null,
  savedAt: null,
  expiresAt: null,
  isStale: false
};

function buildSuccessState(data, snapshot, source) {
  return {
    status: "success",
    data,
    error: "",
    source,
    savedAt: snapshot?.savedAt ?? null,
    expiresAt: snapshot?.expiresAt ?? null,
    isStale: snapshot?.isStale ?? false
  };
}

export function useOfflineSnapshotResource({
  cacheKey,
  datasetId,
  ttlMs,
  fetcher,
  enabled = true,
  keepDataWhileRefreshing = false
}) {
  const [state, setState] = useState(initialState);
  const lastRequestRef = useRef(0);

  const refresh = useCallback(
    async ({ background = false } = {}) => {
      if (!enabled) {
        return;
      }

      const requestId = ++lastRequestRef.current;

      if (!background) {
        setState((current) => ({
          ...current,
          status: current.data && keepDataWhileRefreshing ? current.status : "loading",
          error: ""
        }));
      }

      const cachedSnapshot = await getOfflineSnapshot(cacheKey);
      const shouldTryCacheFirst = typeof navigator !== "undefined" && navigator.onLine === false;

      if (shouldTryCacheFirst && cachedSnapshot) {
        if (requestId === lastRequestRef.current) {
          setState(buildSuccessState(cachedSnapshot.payload, cachedSnapshot, "cache"));
        }
        return;
      }

      try {
        const data = await fetcher();
        const savedSnapshot = await saveOfflineSnapshot({
          cacheKey,
          payload: data,
          ttlMs,
          source: "network"
        });

        if (requestId === lastRequestRef.current) {
          setState(buildSuccessState(data, savedSnapshot, "network"));
        }
      } catch (error) {
        if (cachedSnapshot) {
          if (requestId === lastRequestRef.current) {
            setState(buildSuccessState(cachedSnapshot.payload, cachedSnapshot, "cache"));
          }
          return;
        }

        if (requestId === lastRequestRef.current) {
          setState({
            status: "error",
            data: null,
            error: error?.message || "No pudimos cargar la informacion.",
            source: null,
            savedAt: null,
            expiresAt: null,
            isStale: false
          });
        }
      }
    },
    [cacheKey, enabled, fetcher, keepDataWhileRefreshing, ttlMs]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return undefined;
    }

    const handleOnline = () => {
      refresh({ background: true });
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [enabled, refresh]);

  const freshness = useMemo(
    () => ({
      datasetId,
      source: state.source,
      savedAt: state.savedAt,
      expiresAt: state.expiresAt,
      isStale: state.isStale
    }),
    [datasetId, state.expiresAt, state.isStale, state.savedAt, state.source]
  );

  return {
    ...state,
    freshness,
    refresh
  };
}
