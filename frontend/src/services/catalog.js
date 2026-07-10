import { apiJson } from "./http";
import { buildQueryString } from "./serviceUtils";

const CATALOG_CACHE_TTL_MS = 3 * 60 * 1000;
const catalogListCache = new Map();
const catalogDetailCache = new Map();
const catalogFiltersCache = new Map();
const inFlightRequests = new Map();

function getCacheKey(path, filters = {}) {
  return `${path}${buildQueryString(filters)}`;
}

function normalizeListPayload(payload) {
  if (Array.isArray(payload)) {
    return {
      count: payload.length,
      next: null,
      previous: null,
      results: payload
    };
  }
  return {
    count: payload?.count ?? payload?.results?.length ?? 0,
    next: payload?.next ?? null,
    previous: payload?.previous ?? null,
    results: payload?.results ?? []
  };
}

function readSessionCache(key) {
  try {
    const cached = window.sessionStorage.getItem(key);
    if (!cached) {
      return null;
    }
    const parsed = JSON.parse(cached);
    if (!parsed?.timestamp || Date.now() - parsed.timestamp > CATALOG_CACHE_TTL_MS) {
      window.sessionStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function writeSessionCache(key, data) {
  try {
    window.sessionStorage.setItem(
      key,
      JSON.stringify({
        timestamp: Date.now(),
        data
      })
    );
  } catch {
    // Storage can be unavailable in private mode; memory cache still works.
  }
}

function getCachedValue(cache, key) {
  const memoryValue = cache.get(key);
  if (memoryValue && Date.now() - memoryValue.timestamp <= CATALOG_CACHE_TTL_MS) {
    return memoryValue.data;
  }
  cache.delete(key);
  const sessionValue = readSessionCache(key);
  if (sessionValue) {
    cache.set(key, { timestamp: Date.now(), data: sessionValue });
  }
  return sessionValue;
}

function setCachedValue(cache, key, data) {
  cache.set(key, { timestamp: Date.now(), data });
  writeSessionCache(key, data);
}

function fetchWithRequestDedupe(key, requestFn) {
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key);
  }
  const request = requestFn().finally(() => {
    inFlightRequests.delete(key);
  });
  inFlightRequests.set(key, request);
  return request;
}

function seedDetailCache(items = []) {
  items.forEach((item) => setCachedValue(catalogDetailCache, `catalog:detail:${item.id}`, item));
}

function refreshCachedValue(cache, key, requestFn, onUpdate) {
  return fetchWithRequestDedupe(key, requestFn)
    .then((data) => {
      setCachedValue(cache, key, data);
      onUpdate?.(data);
      return data;
    })
    .catch(() => null);
}

export function listCatalog(filters = {}, options = {}) {
  const key = getCacheKey("catalog:list", filters);
  const cached = getCachedValue(catalogListCache, key);
  if (cached) {
    refreshCachedValue(
      catalogListCache,
      key,
      () => apiJson(`/api/catalog/${buildQueryString(filters)}`).then((payload) => {
        const normalized = normalizeListPayload(payload);
        seedDetailCache(normalized.results);
        return normalized;
      }),
      options.onUpdate
    );
    return Promise.resolve(cached);
  }
  return fetchWithRequestDedupe(key, () =>
    apiJson(`/api/catalog/${buildQueryString(filters)}`).then((payload) => {
      const normalized = normalizeListPayload(payload);
      setCachedValue(catalogListCache, key, normalized);
      seedDetailCache(normalized.results);
      return normalized;
    })
  );
}

export function listCatalogFilters(options = {}) {
  const key = "catalog:filters";
  const cached = getCachedValue(catalogFiltersCache, key);
  if (cached) {
    refreshCachedValue(catalogFiltersCache, key, () => apiJson("/api/catalog/filters/"), options.onUpdate);
    return Promise.resolve(cached);
  }
  return fetchWithRequestDedupe(key, () =>
    apiJson("/api/catalog/filters/").then((filters) => {
      setCachedValue(catalogFiltersCache, key, filters);
      return filters;
    })
  );
}

export function getCatalogItem(itemId, options = {}) {
  const key = `catalog:detail:${itemId}`;
  const cached = getCachedValue(catalogDetailCache, key);
  if (cached) {
    refreshCachedValue(
      catalogDetailCache,
      key,
      () => apiJson(`/api/catalog/${itemId}/`),
      options.onUpdate
    );
    return Promise.resolve(cached);
  }
  return fetchWithRequestDedupe(key, () =>
    apiJson(`/api/catalog/${itemId}/`).then((item) => {
      setCachedValue(catalogDetailCache, key, item);
      return item;
    })
  );
}

export function preloadCatalogItem(item) {
  if (!item?.id) {
    return;
  }
  setCachedValue(catalogDetailCache, `catalog:detail:${item.id}`, item);
  const detailImage = item.detail_image_url || item.primary_image_variants?.detail;
  if (detailImage) {
    const image = new Image();
    image.decoding = "async";
    image.src = detailImage;
  }
  getCatalogItem(item.id).catch(() => null);
}
