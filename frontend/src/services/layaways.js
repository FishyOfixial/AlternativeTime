import { apiJson } from "./http";

function authHeaders(accessToken, extraHeaders = {}) {
  return {
    Authorization: `Bearer ${accessToken}`,
    ...extraHeaders
  };
}

export function listLayaways(accessToken, filters = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      searchParams.set(key, value);
    }
  });
  const query = searchParams.toString();
  return apiJson(`/api/layaways/${query ? `?${query}` : ""}`, {
    headers: authHeaders(accessToken)
  });
}

export function getLayaway(accessToken, layawayId) {
  return apiJson(`/api/layaways/${layawayId}/`, {
    headers: authHeaders(accessToken)
  });
}

export async function createLayaway(accessToken, payload) {
  const response = await fetch("/api/layaways/", {
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

export async function createLayawayPayment(accessToken, layawayId, payload) {
  const response = await fetch(`/api/layaways/${layawayId}/payments/`, {
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

export function listNotifications(accessToken) {
  return apiJson("/api/notifications/", {
    headers: authHeaders(accessToken)
  });
}
