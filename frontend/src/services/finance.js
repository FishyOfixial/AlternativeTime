import { apiJson } from "./http";

export function getFinanceSummary(accessToken) {
  return apiJson("/api/finance/summary/", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}

export function getFinanceBalances(accessToken) {
  return apiJson("/api/finance/balances/", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}

export function listFinanceEntries(accessToken, filters = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return apiJson(`/api/finance/entries/${query ? `?${query}` : ""}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}

export async function createFinanceEntry(accessToken, payload) {
  const response = await fetch("/api/finance/entries/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (response.ok) {
    return response.json();
  }

  if (response.status === 400) {
    const data = await response.json();
    const error = new Error("VALIDATION_ERROR");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  throw new Error(`HTTP ${response.status}`);
}
