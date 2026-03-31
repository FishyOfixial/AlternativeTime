import { apiJsonAuth, buildQueryString, submitJson } from "./serviceUtils";

export function listSales(accessToken, filters = {}) {
  return apiJsonAuth(`/api/sales/${buildQueryString(filters)}`, accessToken);
}

export function createSale(accessToken, payload) {
  return submitJson("/api/sales/", {
    accessToken,
    method: "POST",
    payload
  });
}
