import { apiJsonAuth, apiRequestAuth, buildQueryString, submitJson } from "./serviceUtils";

export function listLayaways(accessToken, filters = {}) {
  return apiJsonAuth(`/api/layaways/${buildQueryString(filters)}`, accessToken);
}

export function getLayaway(accessToken, layawayId) {
  return apiJsonAuth(`/api/layaways/${layawayId}/`, accessToken);
}

export function createLayaway(accessToken, payload) {
  return submitJson("/api/layaways/", {
    accessToken,
    method: "POST",
    payload
  });
}

export function updateLayaway(accessToken, layawayId, payload) {
  return submitJson(`/api/layaways/${layawayId}/`, {
    accessToken,
    method: "PATCH",
    payload
  });
}

export async function deleteLayaway(accessToken, layawayId) {
  await apiRequestAuth(`/api/layaways/${layawayId}/`, accessToken, {
    method: "DELETE"
  });
}

export function createLayawayPayment(accessToken, layawayId, payload) {
  return submitJson(`/api/layaways/${layawayId}/payments/`, {
    accessToken,
    method: "POST",
    payload
  });
}

export function listNotifications(accessToken) {
  return apiJsonAuth("/api/notifications/", accessToken);
}
