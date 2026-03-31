import { apiJsonAuth, buildQueryString, submitJson } from "./serviceUtils";

export function getFinanceSummary(accessToken) {
  return apiJsonAuth("/api/finance/summary/", accessToken);
}

export function getFinanceBalances(accessToken) {
  return apiJsonAuth("/api/finance/balances/", accessToken);
}

export function listFinanceEntries(accessToken, filters = {}) {
  return apiJsonAuth(`/api/finance/entries/${buildQueryString(filters)}`, accessToken);
}

export function createFinanceEntry(accessToken, payload) {
  return submitJson("/api/finance/entries/", {
    accessToken,
    method: "POST",
    payload
  });
}
