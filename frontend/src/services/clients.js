import { apiJsonAuth, apiRequestAuth } from "./serviceUtils";

export function listClients(accessToken) {
  return apiJsonAuth("/api/clients/", accessToken);
}

export function getClient(accessToken, clientId) {
  return apiJsonAuth(`/api/clients/${clientId}/`, accessToken);
}

export function createClient(accessToken, payload) {
  return apiJsonAuth("/api/clients/", accessToken, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export function updateClient(accessToken, clientId, payload) {
  return apiJsonAuth(`/api/clients/${clientId}/`, accessToken, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export async function deleteClient(accessToken, clientId) {
  await apiRequestAuth(`/api/clients/${clientId}/`, accessToken, { method: "DELETE" });
}
