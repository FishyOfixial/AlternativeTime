import { apiJson } from "./http";

export function listInventory(accessToken) {
  return apiJson("/api/inventory/", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}
