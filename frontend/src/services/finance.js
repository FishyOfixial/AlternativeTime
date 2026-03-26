import { apiJson } from "./http";

export function getFinanceSummary(accessToken) {
  return apiJson("/api/finance/summary/", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}
