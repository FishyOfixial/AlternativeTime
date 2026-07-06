import { apiJson } from "./http";

export function listCatalog() {
  return apiJson("/api/catalog/");
}

export function getCatalogItem(itemId) {
  return apiJson(`/api/catalog/${itemId}/`);
}
