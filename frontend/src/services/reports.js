import { apiJson } from "./http";

export function getSalesSummary(accessToken) {
  return apiJson("/api/reports/sales-summary/", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}

export function getInventorySummary(accessToken) {
  return apiJson("/api/reports/inventory-summary/", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}
