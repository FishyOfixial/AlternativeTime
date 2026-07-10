import { apiJson } from "./http";
import { buildQueryString } from "./serviceUtils";

const CATALOG_CACHE_TTL_MS = 3 * 60 * 1000;
const catalogListCache = new Map();
const catalogDetailCache = new Map();

function getCacheKey(path, filters = {}) {
  return `${path}${buildQueryString(filters)}`;
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

export function listCatalog(filters = {}) {
  const key = getCacheKey("catalog:list", filters);
  const cached = getCachedValue(catalogListCache, key);
  if (cached) {
    return Promise.resolve(cached);
  }
  return apiJson(`/api/catalog/${buildQueryString(filters)}`).then((items) => {
    setCachedValue(catalogListCache, key, items);
    items.forEach((item) => setCachedValue(catalogDetailCache, `catalog:detail:${item.id}`, item));
    return items;
  });
}

export function getCatalogItem(itemId) {
  const key = `catalog:detail:${itemId}`;
  const cached = getCachedValue(catalogDetailCache, key);
  if (cached) {
    return Promise.resolve(cached);
  }
  return apiJson(`/api/catalog/${itemId}/`).then((item) => {
    setCachedValue(catalogDetailCache, key, item);
    return item;
  });
}
