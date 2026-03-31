import { apiJson, apiRequest, resolveApiUrl } from "./http";

export function authHeaders(accessToken, extraHeaders = {}) {
  return {
    Authorization: `Bearer ${accessToken}`,
    ...extraHeaders
  };
}

export function buildQueryString(filters = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function apiJsonAuth(path, accessToken, options = {}) {
  return apiJson(path, {
    ...options,
    headers: authHeaders(accessToken, options.headers || {})
  });
}

export function apiRequestAuth(path, accessToken, options = {}) {
  return apiRequest(path, {
    ...options,
    headers: authHeaders(accessToken, options.headers || {})
  });
}

async function readJsonPayload(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export async function submitJson(path, options = {}) {
  const {
    accessToken,
    method = "POST",
    payload,
    headers = {},
    validationErrorMessage = "VALIDATION_ERROR",
    errorMessage
  } = options;

  const response = await fetch(resolveApiUrl(path), {
    method,
    headers: authHeaders(accessToken, {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...headers
    }),
    body: JSON.stringify(payload)
  });

  const data = await readJsonPayload(response);

  if (response.ok) {
    return data;
  }

  if (response.status === 400) {
    const error = new Error(validationErrorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  const error = new Error(errorMessage || `HTTP ${response.status}`);
  error.status = response.status;
  error.data = data;
  throw error;
}

export async function submitFormData(path, options = {}) {
  const {
    accessToken,
    method = "POST",
    formData,
    errorMessage = "No pudimos procesar la solicitud."
  } = options;

  const response = await fetch(resolveApiUrl(path), {
    method,
    headers: authHeaders(accessToken),
    body: formData
  });

  const payload = await readJsonPayload(response);

  if (!response.ok) {
    const error = new Error(payload.detail || errorMessage);
    error.payload = payload;
    error.status = response.status;
    throw error;
  }

  return payload;
}
