import { apiJson, apiRequest } from "./http";

function authHeaders(accessToken, extraHeaders = {}) {
  return {
    Authorization: `Bearer ${accessToken}`,
    ...extraHeaders
  };
}

function buildInventoryPayload(payload) {
  const purchaseCost = payload.purchase_cost || {};

  return {
    brand: payload.brand?.trim() || "",
    model_name: payload.model_name?.trim() || "",
    year_label: payload.year_label?.trim() || "",
    condition_score: payload.condition_score,
    provider: payload.provider?.trim() || "",
    description: payload.description?.trim() || "",
    notes: payload.notes?.trim() || "",
    price: payload.price,
    purchase_date: payload.purchase_date || null,
    status: payload.status,
    sales_channel: payload.sales_channel,
    image_url: payload.image_url?.trim() || "",
    purchase_cost: {
      watch_cost: purchaseCost.watch_cost,
      shipping_cost: purchaseCost.shipping_cost,
      maintenance_cost: purchaseCost.maintenance_cost,
      other_costs: purchaseCost.other_costs,
      payment_method: purchaseCost.payment_method,
      source_account: purchaseCost.source_account,
      notes: purchaseCost.notes?.trim() || ""
    }
  };
}

async function handleJsonResponse(response, fallbackMessage) {
  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const error = new Error(fallbackMessage || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = payload;
    throw error;
  }

  return payload;
}

export function listInventory(accessToken, filters = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return apiJson(`/api/inventory/${query ? `?${query}` : ""}`, {
    headers: authHeaders(accessToken)
  });
}

export function getInventoryItem(accessToken, itemId) {
  return apiJson(`/api/inventory/${itemId}/`, {
    headers: authHeaders(accessToken)
  });
}

export function createInventoryItem(accessToken, payload) {
  return fetch("/api/inventory/", {
    method: "POST",
    headers: authHeaders(accessToken, {
      Accept: "application/json",
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(buildInventoryPayload(payload))
  }).then((response) => handleJsonResponse(response, "No pudimos crear el reloj."));
}

export function updateInventoryItem(accessToken, itemId, payload) {
  return fetch(`/api/inventory/${itemId}/`, {
    method: "PATCH",
    headers: authHeaders(accessToken, {
      Accept: "application/json",
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(buildInventoryPayload(payload))
  }).then((response) => handleJsonResponse(response, "No pudimos actualizar el reloj."));
}

export async function deleteInventoryItem(accessToken, itemId) {
  await apiRequest(`/api/inventory/${itemId}/`, {
    method: "DELETE",
    headers: authHeaders(accessToken)
  });
}

export async function importInventoryCsv(accessToken, file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/inventory/import-csv/", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: formData
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const error = new Error(payload.detail || "No pudimos importar el CSV.");
    error.payload = payload;
    throw error;
  }

  return payload;
}
