import { apiJson, apiRequest } from "./http";

export function loginRequest(credentials) {
  return apiJson("/api/auth/login/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(credentials)
  });
}

export function refreshRequest(refreshToken) {
  return apiJson("/api/auth/refresh/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ refresh: refreshToken })
  });
}

export function getCurrentUser(accessToken) {
  return apiJson("/api/auth/me/", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}

export async function validateAccessToken(accessToken) {
  const response = await apiRequest("/api/auth/me/", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return response.ok;
}
