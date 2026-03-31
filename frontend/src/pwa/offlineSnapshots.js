const DB_NAME = "atc-pos-offline";
const STORE_NAME = "snapshots";
const DB_VERSION = 1;

let databasePromise = null;
const memoryStore = new Map();

function supportsIndexedDb() {
  return typeof indexedDB !== "undefined";
}

function openDatabase() {
  if (!supportsIndexedDb()) {
    return Promise.resolve(null);
  }

  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;

        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: "cacheKey" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("No pudimos abrir IndexedDB."));
    }).catch((error) => {
      console.error("No fue posible inicializar IndexedDB para snapshots offline.", error);
      return null;
    });
  }

  return databasePromise;
}

function runTransaction(mode, executor) {
  return openDatabase().then((database) => {
    if (!database) {
      return executor(null);
    }

    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, mode);
      const store = transaction.objectStore(STORE_NAME);

      executor(store, resolve, reject);
      transaction.onerror = () => reject(transaction.error || new Error("Fallo en IndexedDB."));
    });
  });
}

function buildSnapshotRecord({ cacheKey, payload, savedAt, expiresAt, source = "network" }) {
  return {
    cacheKey,
    payload,
    savedAt,
    expiresAt,
    source
  };
}

function toSnapshotState(record) {
  if (!record) {
    return null;
  }

  return {
    cacheKey: record.cacheKey,
    payload: record.payload,
    savedAt: record.savedAt,
    expiresAt: record.expiresAt,
    source: record.source,
    isStale: Date.now() > Number(record.expiresAt || 0)
  };
}

export async function saveOfflineSnapshot({ cacheKey, payload, ttlMs, source = "network" }) {
  const savedAt = Date.now();
  const expiresAt = savedAt + ttlMs;
  const record = buildSnapshotRecord({
    cacheKey,
    payload,
    savedAt,
    expiresAt,
    source
  });

  if (!supportsIndexedDb()) {
    memoryStore.set(cacheKey, record);
    return toSnapshotState(record);
  }

  await runTransaction("readwrite", (store, resolve, reject) => {
    const request = store.put(record);
    request.onsuccess = () => resolve(record);
    request.onerror = () => reject(request.error || new Error("No pudimos guardar el snapshot offline."));
  });

  return toSnapshotState(record);
}

export async function getOfflineSnapshot(cacheKey) {
  if (!supportsIndexedDb()) {
    return toSnapshotState(memoryStore.get(cacheKey) || null);
  }

  const record = await runTransaction("readonly", (store, resolve, reject) => {
    const request = store.get(cacheKey);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error("No pudimos leer el snapshot offline."));
  });

  return toSnapshotState(record);
}

export async function deleteOfflineSnapshot(cacheKey) {
  if (!supportsIndexedDb()) {
    memoryStore.delete(cacheKey);
    return;
  }

  await runTransaction("readwrite", (store, resolve, reject) => {
    const request = store.delete(cacheKey);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error || new Error("No pudimos borrar el snapshot offline."));
  });
}

export async function clearOfflineSnapshots() {
  memoryStore.clear();

  if (!supportsIndexedDb()) {
    return;
  }

  await runTransaction("readwrite", (store, resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error || new Error("No pudimos limpiar los snapshots offline."));
  });
}
