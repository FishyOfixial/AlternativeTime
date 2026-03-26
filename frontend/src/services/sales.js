import { apiJson } from "./http";

export function createSale(accessToken, payload) {
  return apiJson("/api/sales/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}
