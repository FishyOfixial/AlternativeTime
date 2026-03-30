function trimTrailingSlash(value) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function resolveApiUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const explicitBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || "");
  if (explicitBaseUrl) {
    return `${explicitBaseUrl}${path}`;
  }

  const apiHost = trimTrailingSlash(import.meta.env.VITE_API_HOST || "");
  if (apiHost) {
    return `https://${apiHost}${path}`;
  }

  return path;
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(resolveApiUrl(path), {
    headers: {
      Accept: "application/json",
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response;
}

export async function apiJson(path, options = {}) {
  const response = await apiRequest(path, options);
  return response.json();
}
