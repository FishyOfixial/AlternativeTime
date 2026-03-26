import { apiJson } from "./http";

export function listInventory(accessToken) {
  return apiJson("/api/inventory/", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}

export function getInventoryItem(accessToken, itemId) {
  return apiJson(`/api/inventory/${itemId}/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}

export function createInventoryItem(accessToken, payload) {
  return apiJson("/api/inventory/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export function updateInventoryItem(accessToken, itemId, payload) {
  return apiJson(`/api/inventory/${itemId}/`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export function deleteInventoryItem(accessToken, itemId) {
  return apiJson(`/api/inventory/${itemId}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}
