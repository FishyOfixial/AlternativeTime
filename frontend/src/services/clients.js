import { apiJson, apiRequest } from "./http";

function authHeaders(accessToken, extraHeaders = {}) {
  return {
    Authorization: `Bearer ${accessToken}`,
    ...extraHeaders
  };
}

export function listClients(accessToken) {
  return apiJson("/api/clients/", {
    headers: authHeaders(accessToken)
  });
}

export function getClient(accessToken, clientId) {
  return apiJson(`/api/clients/${clientId}/`, {
    headers: authHeaders(accessToken)
  });
}

export function createClient(accessToken, payload) {
  return apiJson("/api/clients/", {
    method: "POST",
    headers: authHeaders(accessToken, {
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(payload)
  });
}

export function updateClient(accessToken, clientId, payload) {
  return apiJson(`/api/clients/${clientId}/`, {
    method: "PATCH",
    headers: authHeaders(accessToken, {
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(payload)
  });
}

export async function deleteClient(accessToken, clientId) {
  await apiRequest(`/api/clients/${clientId}/`, {
    method: "DELETE",
    headers: authHeaders(accessToken)
  });
}
