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

export function getDashboardSummary(accessToken, params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();

  return apiJson(`/api/reports/dashboard-summary/${query ? `?${query}` : ""}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}
