import { apiJson } from "./http";
import { buildQueryString } from "./serviceUtils";

export function listCatalog(filters = {}) {
  return apiJson(`/api/catalog/${buildQueryString(filters)}`);
}

export function getCatalogItem(itemId) {
  return apiJson(`/api/catalog/${itemId}/`);
}
