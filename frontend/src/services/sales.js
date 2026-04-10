import { apiJsonAuth, buildQueryString, submitJson } from "./serviceUtils";

export function listSales(accessToken, filters = {}) {
  return apiJsonAuth(`/api/sales/${buildQueryString(filters)}`, accessToken);
}

export function getSale(accessToken, saleId) {
  return apiJsonAuth(`/api/sales/${saleId}/`, accessToken);
}

export function createSale(accessToken, payload) {
  return submitJson("/api/sales/", {
    accessToken,
    method: "POST",
    payload
  });
}

export function updateSale(accessToken, saleId, payload) {
  return submitJson(`/api/sales/${saleId}/`, {
    accessToken,
    method: "PATCH",
    payload,
    validationErrorMessage: "No pudimos actualizar la venta.",
    errorMessage: "No pudimos actualizar la venta."
  });
}
