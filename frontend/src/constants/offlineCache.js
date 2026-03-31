export const OFFLINE_DATASETS = {
  dashboardSummary: {
    datasetId: "dashboard-summary",
    label: "Dashboard",
    ttlMs: 5 * 60 * 1000
  },
  clientsList: {
    datasetId: "clients-list",
    label: "Clientes",
    ttlMs: 20 * 60 * 1000
  },
  inventoryList: {
    datasetId: "inventory-list",
    label: "Inventario",
    ttlMs: 20 * 60 * 1000
  }
};

export function buildOfflineCacheKey(datasetId, suffix = "default") {
  return `${datasetId}::${suffix}`;
}
