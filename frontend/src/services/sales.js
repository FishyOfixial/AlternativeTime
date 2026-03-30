import { apiJson } from "./http";

function authHeaders(accessToken, extraHeaders = {}) {
  return {
    Authorization: `Bearer ${accessToken}`,
    ...extraHeaders
  };
}

export function listSales(accessToken, filters = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return apiJson(`/api/sales/${query ? `?${query}` : ""}`, {
    headers: authHeaders(accessToken)
  });
}

export async function createSale(accessToken, payload) {
  const response = await fetch("/api/sales/", {
    method: "POST",
    headers: authHeaders(accessToken, {
      "Content-Type": "application/json",
      Accept: "application/json"
    }),
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
